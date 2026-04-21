import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { useDailyStateV2 } from '@/hooks/useDailyStateV2';
import { getFoodDetails } from '@/services/foodSearchService';
import { addEntry } from '@/lib/nutritionStore';
import S38_Food_Detail from '../screens/S38_Food_Detail.jsx';

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function V3FoodDetail() {
  const navigate = useNavigate();
  const { id: foodId } = useParams();
  const [searchParams] = useSearchParams();
  const meal = searchParams.get('meal') || 'lunch';
  const { theme } = useTheme();
  const { user } = useAuth();
  const { invalidateAfterAction } = useDailyStateV2();

  const [foodData, setFoodData] = useState(null);
  const [saving, setSaving] = useState(false);

  // Fetch food details when we have a foodId (route: /app/nutrition/food/:id)
  useEffect(() => {
    if (!foodId) return;

    let cancelled = false;
    (async () => {
      const result = await getFoodDetails(foodId);
      if (cancelled) return;
      if (result?.success && result.food) {
        setFoodData(result.food);
      } else {
        console.warn('[V3FoodDetail] getFoodDetails failed:', result?.error);
      }
    })();

    return () => { cancelled = true; };
  }, [foodId]);

  // Build props from live food data or fall back to S38 demo data
  const foodTitle = foodData?.name ?? undefined;
  const calories = foodData ? Number(foodData.calories || 0) : undefined;

  const macros = foodData ? [
    { k: 'PROTEIN', v: String(Math.round(foodData.protein || 0)), u: 'g', pct: `${Math.round(((foodData.protein || 0) * 4 / Math.max(calories, 1)) * 100)}%`, hi: true },
    { k: 'CARBS',   v: String(Math.round(foodData.carbs   || 0)), u: 'g', pct: `${Math.round(((foodData.carbs   || 0) * 4 / Math.max(calories, 1)) * 100)}%` },
    { k: 'FAT',     v: String(Math.round(foodData.fat     || 0)), u: 'g', pct: `${Math.round(((foodData.fat     || 0) * 9 / Math.max(calories, 1)) * 100)}%` },
  ] : undefined;

  const items = foodData ? [
    {
      t: foodData.name,
      v: '1 serving',
      k: `${Math.round(foodData.calories || 0)} · ${Math.round(foodData.protein || 0)}P · ${Math.round(foodData.carbs || 0)}C · ${Math.round(foodData.fat || 0)}F`,
    },
  ] : undefined;

  const handleConfirm = async (payload) => {
    if (!user?.id) {
      toast.error('Not signed in');
      return;
    }

    setSaving(true);
    try {
      const entry = {
        name: payload?.name ?? foodTitle ?? 'Food',
        calories: payload ? Number(String(payload.calories).replace(/\D/g, '')) || calories || 0 : calories || 0,
        protein: foodData?.protein || 0,
        carbs:   foodData?.carbs   || 0,
        fat:     foodData?.fat     || 0,
      };

      const { error } = await addEntry(user.id, todayISO(), meal, entry);
      if (error) throw error;

      invalidateAfterAction('meal');
      toast.success(`${entry.name} logged to ${meal}`);
      navigate('/app/eat');
    } catch (err) {
      console.error('[V3FoodDetail] save error:', err);
      toast.error('Failed to log food. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <S38_Food_Detail
      dark={theme === 'dark'}
      meal={meal.charAt(0).toUpperCase() + meal.slice(1)}
      foodTitle={foodTitle}
      calories={calories}
      macros={macros}
      items={items}
      onConfirm={handleConfirm}
      onBack={() => navigate(-1)}
      onSaveAsMeal={() => navigate('/app/nutrition/recipes')}
      showTabBar={false}
    />
  );
}
