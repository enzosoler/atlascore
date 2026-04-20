/**
 * /app/v3/eat — today's fuel ledger.
 * Wraps S4_Nutrition_A with real food-log + target data.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import { useDailyStateV2 } from '@/hooks/useDailyStateV2';
import { ROUTES } from '@/lib/routes';
import S4_Nutrition_A from '../screens/S4_Nutrition_A.jsx';

const SLOT_ORDER = ['breakfast', 'lunch', 'dinner', 'snack'];

function normalizeSlot(raw, dateValue) {
  const lower = String(raw || '').toLowerCase();
  if (SLOT_ORDER.includes(lower)) return lower;
  const d = dateValue ? new Date(dateValue) : null;
  const hour = d && Number.isFinite(d.getTime()) ? d.getHours() : null;
  if (hour == null) return 'snack';
  if (hour < 11) return 'breakfast';
  if (hour < 16) return 'lunch';
  if (hour < 21) return 'dinner';
  return 'snack';
}

function formatMealTime(dateValue) {
  const d = dateValue ? new Date(dateValue) : null;
  if (!d || Number.isNaN(d.getTime())) return undefined;
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function mealItemName(row, index) {
  const text = row?.food_name || row?.description || row?.title || row?.name;
  if (typeof text === 'string' && text.trim()) return text.trim();
  return `Logged item ${index + 1}`;
}

function mealItemQty(row) {
  if (Array.isArray(row?.foods) && row.foods.length > 0) {
    return row.foods
      .map((food) => food?.name)
      .filter(Boolean)
      .slice(0, 3)
      .join(', ');
  }
  return row?.serving_description || row?.meal_type || '';
}

function mapFoodLogsToMeals(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return [];
  const buckets = new Map();

  rows.forEach((row, index) => {
    const slot = normalizeSlot(row?.meal_type, row?.date);
    const key = slot;
    if (!buckets.has(key)) {
      buckets.set(key, {
        id: key,
        slot,
        time: formatMealTime(row?.date),
        items: [],
      });
    }
    const bucket = buckets.get(key);
    if (!bucket.time) bucket.time = formatMealTime(row?.date);
    bucket.items.push({
      id: row?.id || `${key}-${index}`,
      name: mealItemName(row, index),
      qty: mealItemQty(row),
      kcal: Number(row?.total_calories ?? row?.calories) || 0,
      p: Number(row?.total_protein ?? row?.protein ?? row?.protein_g) || 0,
      c: Number(row?.total_carbs ?? row?.carbs ?? row?.carbs_g) || 0,
      f: Number(row?.total_fat ?? row?.fat ?? row?.fat_g) || 0,
    });
  });

  return Array.from(buckets.values()).sort(
    (a, b) => SLOT_ORDER.indexOf(a.slot) - SLOT_ORDER.indexOf(b.slot)
  );
}

export default function V3Eat() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const daily = useDailyStateV2();

  const macros = {
    kcal: {
      current: daily.nutrition?.caloriesConsumed || 0,
      target: daily.nutrition?.caloriesTarget || 0,
    },
    protein: {
      current: daily.nutrition?.proteinConsumed || 0,
      target: daily.nutrition?.proteinTarget || 0,
    },
    carbs: {
      current: daily.nutrition?.carbsConsumed || 0,
      target: daily.nutrition?.carbsTarget || 0,
    },
    fat: {
      current: daily.nutrition?.fatConsumed || 0,
      target: daily.nutrition?.fatTarget || 0,
    },
  };

  const handleCapture = (kind) => {
    if (kind === 'scan') return navigate('/app/nutrition/capture');
    if (kind === 'camera') return navigate('/app/nutrition/capture');
    if (kind === 'voice') return navigate('/app/nutrition/voice');
    if (kind === 'recents') return navigate('/app/nutrition/diary');
    return navigate('/app/nutrition/search');
  };

  return (
    <S4_Nutrition_A
      dark={theme === 'dark'}
      macros={macros}
      meals={mapFoodLogsToMeals(daily.todayMeals)}
      onCapture={handleCapture}
      showTabBar={false}
    />
  );
}
