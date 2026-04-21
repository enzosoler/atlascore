import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';
import { useDailyStateV2 } from '@/hooks/useDailyStateV2';
import { getEntriesForDate } from '@/lib/nutritionStore';
import S51_Food_Diary from '../screens/S51_Food_Diary.jsx';

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const SLOT_ORDER = ['breakfast', 'lunch', 'dinner', 'snacks', 'snack', 'other'];

export default function V3FoodDiary() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { nutrition } = useDailyStateV2();

  const [date, setDate] = useState(todayISO);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch entries whenever date or user changes
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      const rows = await getEntriesForDate(user.id, date);
      if (!cancelled) {
        setEntries(rows);
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [user?.id, date]);

  // Group flat entries by meal slot for S51
  const meals = useMemo(() => {
    const slotMap = {};
    for (const e of entries) {
      const slot = e.slot || 'other';
      if (!slotMap[slot]) {
        slotMap[slot] = { id: slot, slot, items: [] };
      }
      slotMap[slot].items.push({
        id: e.id,
        name: e.name,
        portion: e.portion,
        kcal: e.kcal,
        protein: e.protein,
        carbs: e.carbs,
        fat: e.fat,
      });
    }
    // Return slots sorted in meal order, then any extras alphabetically
    return Object.values(slotMap).sort((a, b) => {
      const ai = SLOT_ORDER.indexOf(a.slot);
      const bi = SLOT_ORDER.indexOf(b.slot);
      return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
    });
  }, [entries]);

  // Totals for S51 — use useDailyStateV2 for today, fallback to derived for other dates
  const isToday = date === todayISO();

  const totals = useMemo(() => {
    if (isToday && nutrition) {
      return {
        kcal:    { current: nutrition.caloriesConsumed, target: nutrition.caloriesTarget },
        protein: { current: nutrition.proteinConsumed,  target: nutrition.proteinTarget  },
        carbs:   { current: nutrition.carbsConsumed,    target: nutrition.carbsTarget    },
        fat:     { current: nutrition.fatConsumed,      target: nutrition.fatTarget      },
      };
    }
    // Derive from raw entries for non-today dates
    const sum = entries.reduce(
      (acc, e) => ({
        kcal: acc.kcal + e.kcal,
        protein: acc.protein + e.protein,
        carbs: acc.carbs + e.carbs,
        fat: acc.fat + e.fat,
      }),
      { kcal: 0, protein: 0, carbs: 0, fat: 0 }
    );
    return {
      kcal:    { current: sum.kcal,    target: nutrition?.caloriesTarget || 0 },
      protein: { current: sum.protein, target: nutrition?.proteinTarget  || 0 },
      carbs:   { current: sum.carbs,   target: nutrition?.carbsTarget    || 0 },
      fat:     { current: sum.fat,     target: nutrition?.fatTarget      || 0 },
    };
  }, [isToday, nutrition, entries]);

  return (
    <S51_Food_Diary
      dark={theme === 'dark'}
      date={date}
      meals={loading ? [] : meals}
      totals={totals}
      onPickDate={(d) => setDate(d)}
      onOpenMeal={(mealId) => navigate(`/app/nutrition/search?meal=${encodeURIComponent(mealId)}`)}
      onAddFood={() => navigate('/app/nutrition/capture')}
      onCapture={() => navigate('/app/nutrition/capture')}
      onBack={() => navigate(-1)}
      showTabBar={false}
    />
  );
}
