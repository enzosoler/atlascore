import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import { toast } from 'sonner';
import V3StandaloneLayout from '../layouts/V3StandaloneLayout.jsx';
import S35_Search from '../screens/S35_Search.jsx';
import { useDailyStateV2 } from '@/hooks/useDailyStateV2';
import { searchFoods } from '@/services/foodSearchService';

const SEARCH_DEBOUNCE_MS = 280;

function formatKcal(v) {
  return Number.isFinite(v) ? `${Math.round(v)} kcal` : '—';
}

function formatSub(food) {
  const parts = [];
  parts.push(formatKcal(food.calories));
  if (Number.isFinite(food.protein) && food.protein > 0) parts.push(`${Math.round(food.protein)}g protein`);
  if (food.brand) parts.unshift(food.brand);
  return parts.join(' · ');
}

export default function V3NutritionSearch() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [params] = useSearchParams();
  const meal = params.get('meal');
  const { nutrition } = useDailyStateV2();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState('');
  const activeRequestRef = useRef(0);

  // Debounced real search against Open Food Facts via our Supabase edge function.
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setErrorText('');
      setLoading(false);
      return;
    }
    const requestId = ++activeRequestRef.current;
    const handle = setTimeout(async () => {
      setLoading(true);
      setErrorText('');
      const res = await searchFoods(trimmed);
      if (requestId !== activeRequestRef.current) return; // stale response
      setLoading(false);
      if (res?.success) {
        setResults(res.results || []);
      } else {
        setResults([]);
        setErrorText(res?.error || 'Search failed');
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [query]);

  const groups = useMemo(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      // Idle state — prompt the user to type.
      return [
        {
          cat: 'START TYPING · 2+ LETTERS',
          rows: [
            { t: 'Try: "chicken breast"', sub: 'Search 2M+ foods across the Open Food Facts catalogue' },
            { t: 'Try: "greek yogurt"',  sub: 'Name, brand, or barcode works' },
          ],
        },
      ];
    }
    if (loading) {
      return [{ cat: 'SEARCHING…', rows: [{ t: 'Looking up foods', sub: trimmed }] }];
    }
    if (errorText) {
      return [{ cat: 'ERROR', rows: [{ t: errorText, sub: 'Try again in a moment' }] }];
    }
    if (results.length === 0) {
      return [{ cat: 'NO RESULTS', rows: [{ t: `No foods matched "${trimmed}"`, sub: 'Check spelling or try a broader term' }] }];
    }
    return [{
      cat: `FOODS · ${results.length}`,
      rows: results.slice(0, 50).map((food) => ({
        t: food.name,
        sub: formatSub(food),
        _food: food,
      })),
    }];
  }, [query, loading, errorText, results]);

  const topMatch = useMemo(() => {
    if (results.length === 0) return null;
    const food = results[0];
    const metaParts = [formatKcal(food.calories)];
    if (Number.isFinite(food.protein) && food.protein > 0) metaParts.push(`${Math.round(food.protein)}G PROTEIN`);
    if (Number.isFinite(food.carbs) && food.carbs > 0) metaParts.push(`${Math.round(food.carbs)}G CARBS`);
    return {
      label: food.brand ? `Top match · ${food.brand}` : 'Top match · Food',
      title: food.name,
      meta: metaParts.join(' · ').toUpperCase(),
      _food: food,
    };
  }, [results]);

  const proteinConsumed = Math.round(nutrition?.proteinConsumed || 0);
  const proteinTarget = Math.round(nutrition?.proteinTarget || 0);

  return (
    <V3StandaloneLayout>
      {proteinTarget > 0 && (
        <div
          style={{
            padding: '8px 20px',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: 10,
            letterSpacing: '0.8px',
            textTransform: 'uppercase',
            color: theme === 'dark' ? 'rgba(0,255,255,0.85)' : 'hsl(var(--rd-accent))',
            borderBottom: theme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
          }}
        >
          {proteinConsumed}g / {proteinTarget}g protein today
        </div>
      )}
      <S35_Search
        dark={theme === 'dark'}
        query={query}
        onQueryChange={setQuery}
        placeholder="Search foods…"
        scopes={['Foods', 'Meals', 'Recents', 'Brands']}
        activeScope="Foods"
        topMatch={topMatch}
        groups={groups}
        prompts={[
          'Find high-protein breakfast ideas',
          'Show foods under 300 kcal',
          'What should I eat pre-workout?',
        ]}
        onBack={() => navigate(-1)}
        onPickScope={() => {}}
        onOpenResult={(result) => {
          const food = result?._food;
          if (food?.sourceId) {
            const suffix = meal ? `?meal=${encodeURIComponent(meal)}` : '';
            navigate(`/app/nutrition/food/${encodeURIComponent(food.sourceId)}${suffix}`);
            return;
          }
          // Fallback for prompt/non-food rows
          if (typeof result?.t === 'string' || typeof result?.title === 'string') {
            toast(`${result.t || result.title}${meal ? ` → ${meal}` : ''}`);
          }
        }}
        onOpenPrompt={(prompt) => navigate(`/app/coach/chat?ask=${encodeURIComponent(prompt)}`)}
      />
    </V3StandaloneLayout>
  );
}
