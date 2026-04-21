import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import { toast } from 'sonner';
import { useT } from '@/lib/i18nContext';
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
  const t = useT();
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
        setErrorText(res?.error || t('nutritionSearch.errorSearchFailed'));
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [query, t]);

  const groups = useMemo(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      // Idle state — prompt the user to type.
      return [
        {
          cat: 'START TYPING · 2+ LETTERS',
          rows: [
            { t: t('nutritionSearch.tryChicken'), sub: t('nutritionSearch.idleSearchCatalog') },
            { t: t('nutritionSearch.tryYogurt'),  sub: t('nutritionSearch.idleNameBrandBarcode') },
          ],
        },
      ];
    }
    if (loading) {
      return [{ cat: t('nutritionSearch.searchingCategory'), rows: [{ t: t('nutritionSearch.searchingTitle'), sub: trimmed }] }];
    }
    if (errorText) {
      return [{ cat: t('common.error').toUpperCase(), rows: [{ t: errorText, sub: t('nutritionSearch.tryAgainSoon') }] }];
    }
    if (results.length === 0) {
      return [{ cat: t('nutritionSearch.noResultsCategory'), rows: [{ t: t('nutritionSearch.noResultsTitle', { query: trimmed }), sub: t('nutritionSearch.noResultsBody') }] }];
    }
    return [{
      cat: t('nutritionSearch.resultsCategory', { count: results.length }),
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
      label: food.brand ? t('nutritionSearch.topMatchBrand', { brand: food.brand }) : t('nutritionSearch.topMatchFood'),
      title: food.name,
      meta: metaParts.join(' · ').toUpperCase(),
      _food: food,
    };
  }, [results, t]);

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
          {t('nutritionSearch.proteinToday', { consumed: proteinConsumed, target: proteinTarget })}
        </div>
      )}
      <S35_Search
        dark={theme === 'dark'}
        query={query}
        onQueryChange={setQuery}
        placeholder={t('nutritionSearch.placeholder')}
        scopes={[t('nutritionSearch.scopes.foods'), t('nutritionSearch.scopes.meals'), t('nutritionSearch.scopes.recents'), t('nutritionSearch.scopes.brands')]}
        activeScope={t('nutritionSearch.scopes.foods')}
        topMatch={topMatch}
        groups={groups}
        prompts={[
          t('nutritionSearch.prompts.breakfast'),
          t('nutritionSearch.prompts.under300'),
          t('nutritionSearch.prompts.preWorkout'),
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
