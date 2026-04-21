import React, { useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import { useTheme } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';
import { useDailyStateV2 } from '@/hooks/useDailyStateV2';
import { addEntries } from '@/lib/nutritionStore';
import { ACFonts, ACRadii, useACT, ACBtn, ACLabel, ACMono } from '../lib/paper.jsx';

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function inferMealSlot(rawMeal) {
  const normalized = String(rawMeal || '').toLowerCase();
  if (['breakfast', 'lunch', 'dinner', 'snack', 'snacks'].includes(normalized)) {
    return normalized === 'snacks' ? 'snack' : normalized;
  }
  const hour = new Date().getHours();
  if (hour < 11) return 'breakfast';
  if (hour < 16) return 'lunch';
  if (hour < 21) return 'dinner';
  return 'snack';
}

function mapDetectedFoodsToEntries(foods, meal) {
  return (foods || []).map((food) => ({
    meal,
    name: food.name || food.food_name || 'Food',
    calories: Number(food.calories) || 0,
    protein: Number(food.protein) || 0,
    carbs: Number(food.carbs) || 0,
    fat: Number(food.fat) || 0,
    servingSize: Number(food.amount || food.estimated_grams || 1) || 1,
    unit: food.unit || food.unit_type || 'serving',
  }));
}

async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result || '').split(',')[1] || '');
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function ResultCard({ food, selected, onToggle, dark }) {
  const c = useACT(dark);
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        width: '100%',
        textAlign: 'left',
        padding: 14,
        borderRadius: 14,
        border: `1px solid ${selected ? c.accent : c.hair}`,
        background: selected ? c.card2 : c.card,
        color: c.fg,
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>{food.name || food.food_name}</div>
          <ACLabel size={12} color={c.dim} style={{ marginTop: 4, display: 'block' }}>
            {food.estimatedAmount || food.serving_description || '1 serving'}
          </ACLabel>
        </div>
        <div style={{
          width: 20,
          height: 20,
          borderRadius: 999,
          background: selected ? c.accent : 'transparent',
          border: selected ? 'none' : `1px solid ${c.hair}`,
          flexShrink: 0,
          marginTop: 2,
        }} />
      </div>
      <ACMono size={11} color={c.dim} style={{ marginTop: 8, display: 'block' }}>
        {Math.round(Number(food.calories) || 0)} kcal · P {Math.round(Number(food.protein) || 0)} · C {Math.round(Number(food.carbs) || 0)} · F {Math.round(Number(food.fat) || 0)}
      </ACMono>
    </button>
  );
}

export default function V3Capture() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { theme } = useTheme();
  const { user } = useAuth();
  const daily = useDailyStateV2();
  const dark = theme === 'dark';
  const c = useACT(dark);
  const fileInputRef = useRef(null);

  const mode = useMemo(() => {
    if (location.pathname.includes('/voice')) return 'voice';
    if (location.pathname.includes('/photo')) return 'photo';
    return 'capture';
  }, [location.pathname]);

  const meal = inferMealSlot(searchParams.get('meal'));
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState([]);
  const [busy, setBusy] = useState(false);

  async function handleAnalyzeText() {
    const query = text.trim();
    if (!query) return;
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke('log-food-text', {
        body: { query, language: 'English' },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      const foods = Array.isArray(data?.items) && data.items.length > 0
        ? data.items.map((item) => ({
            name: item.name,
            estimatedAmount: `${item.estimated_grams || 100}g`,
            calories: item.calories,
            protein: item.protein,
            carbs: item.carbs,
            fat: item.fat,
            amount: item.estimated_grams || 100,
            unit: 'g',
          }))
        : [{
            name: data?.food_name || query,
            estimatedAmount: data?.serving_description || '1 serving',
            calories: data?.calories,
            protein: data?.protein,
            carbs: data?.carbs,
            fat: data?.fat,
            amount: 1,
            unit: 'serving',
          }];

      setResults(foods);
      setSelected(foods.map((_, index) => index));
    } catch (error) {
      console.error('[V3Capture] text analysis failed', error);
      toast.error(error?.message || 'Failed to analyze description.');
    } finally {
      setBusy(false);
    }
  }

  async function handleAnalyzePhoto() {
    if (!file) return;
    setBusy(true);
    try {
      const base64 = await fileToBase64(file);
      const { data, error } = await supabase.functions.invoke('food-vision', {
        body: { image: base64, mimeType: file.type },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      const foods = Array.isArray(data?.foods) ? data.foods : [];
      if (foods.length === 0) throw new Error('No foods detected from this image.');
      setResults(foods);
      setSelected(foods.map((_, index) => index));
    } catch (error) {
      console.error('[V3Capture] photo analysis failed', error);
      toast.error(error?.message || 'Failed to analyze photo.');
    } finally {
      setBusy(false);
    }
  }

  async function handleSave() {
    if (!user?.id) {
      toast.error('You must be signed in to log food.');
      return;
    }
    const chosenFoods = results.filter((_, index) => selected.includes(index));
    if (chosenFoods.length === 0) {
      toast.error('Select at least one detected item.');
      return;
    }

    setBusy(true);
    try {
      const { error } = await addEntries(user.id, todayISO(), mapDetectedFoodsToEntries(chosenFoods, meal));
      if (error) throw error;
      daily.invalidateAfterAction?.('meal');
      toast.success(`Logged ${chosenFoods.length} item${chosenFoods.length !== 1 ? 's' : ''} to ${meal}`);
      navigate('/app/eat', { replace: true });
    } catch (error) {
      console.error('[V3Capture] save failed', error);
      toast.error(error?.message || 'Failed to save food log.');
    } finally {
      setBusy(false);
    }
  }

  function toggleSelection(index) {
    setSelected((current) => current.includes(index)
      ? current.filter((value) => value !== index)
      : [...current, index]
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: c.bg, color: c.fg, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 22px', borderBottom: `1px solid ${c.hair}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button type="button" onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: c.fg, cursor: 'pointer', fontSize: 15 }}>
          Back
        </button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: ACFonts.display, fontSize: 22, fontWeight: 700, letterSpacing: -0.6 }}>
            {mode === 'voice' ? 'Voice log' : 'Capture meal'}
          </div>
          <ACMono size={10} color={c.dim}>{meal.toUpperCase()}</ACMono>
        </div>
        <div style={{ width: 36 }} />
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '20px 22px 28px' }}>
        {mode === 'voice' ? (
          <div>
            <ACLabel size={13} color={c.dim} style={{ lineHeight: 1.5, display: 'block' }}>
              Describe what you ate in plain language. The AI parser will estimate the meal and you can confirm before saving.
            </ACLabel>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Example: ribeye steak, sweet potato, and almonds"
              rows={4}
              style={{
                width: '100%',
                marginTop: 14,
                padding: 14,
                borderRadius: 14,
                border: `1px solid ${c.hair}`,
                background: c.card,
                color: c.fg,
                resize: 'vertical',
                fontFamily: ACFonts.body,
                fontSize: 14,
              }}
            />
            <div style={{ marginTop: 14 }}>
              <ACBtn primary dark={dark} size="lg" pill block onClick={handleAnalyzeText} disabled={busy || !text.trim()}>
                {busy ? 'Analyzing…' : 'Analyze description'}
              </ACBtn>
            </div>
          </div>
        ) : (
          <div>
            <ACLabel size={13} color={c.dim} style={{ lineHeight: 1.5, display: 'block' }}>
              Upload a meal photo for AI analysis. Premium access may be required by the vision function.
            </ACLabel>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(event) => {
                const nextFile = event.target.files?.[0];
                if (!nextFile) return;
                setFile(nextFile);
                setPreviewUrl(URL.createObjectURL(nextFile));
                setResults([]);
                setSelected([]);
              }}
              style={{ marginTop: 14, width: '100%' }}
            />
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Meal preview"
                style={{ width: '100%', marginTop: 14, borderRadius: 16, objectFit: 'cover', maxHeight: 320 }}
              />
            )}
            <div style={{ marginTop: 14 }}>
              <ACBtn primary dark={dark} size="lg" pill block onClick={handleAnalyzePhoto} disabled={busy || !file}>
                {busy ? 'Analyzing…' : 'Analyze photo'}
              </ACBtn>
            </div>
          </div>
        )}

        {results.length > 0 && (
          <div style={{ marginTop: 22 }}>
            <ACMono size={10} color={c.dim} style={{ letterSpacing: 0.7, textTransform: 'uppercase' }}>
              Review detected items
            </ACMono>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
              {results.map((food, index) => (
                <ResultCard
                  key={`${food.name || food.food_name}-${index}`}
                  food={food}
                  selected={selected.includes(index)}
                  onToggle={() => toggleSelection(index)}
                  dark={dark}
                />
              ))}
            </div>
            <div style={{ marginTop: 16 }}>
              <ACBtn primary dark={dark} size="lg" pill block onClick={handleSave} disabled={busy || selected.length === 0}>
                {busy ? 'Saving…' : `Log ${selected.length} item${selected.length !== 1 ? 's' : ''}`}
              </ACBtn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
