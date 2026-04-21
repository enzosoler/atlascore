/**
 * nutritionStore — real Supabase-backed food log operations.
 *
 * Column mapping (food_logs table):
 *   user_id, date (timestamptz), meal_type, food_name,
 *   calories, protein, carbs, fat,
 *   quantity, serving_unit, serving_size
 */

import { supabase } from '@/lib/supabaseClient';

/** Returns local UTC offset string like "+03:00" */
function tzOffset() {
  const off = new Date().getTimezoneOffset();
  const sign = off <= 0 ? '+' : '-';
  const abs = Math.abs(off);
  return `${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`;
}

/**
 * Insert a food entry into food_logs.
 *
 * @param {string} userId
 * @param {string} date   — YYYY-MM-DD
 * @param {string} meal   — 'breakfast' | 'lunch' | 'dinner' | 'snacks' | etc.
 * @param {object} entry  — { name, calories, protein, carbs, fat, servingSize?, unit? }
 * @returns {{ data, error }}
 */
export async function addEntry(userId, date, meal, entry) {
  if (!userId || !date || !entry) {
    return { data: null, error: new Error('[nutritionStore] addEntry: missing required args') };
  }

  const { data, error } = await supabase.from('food_logs').insert({
    user_id: userId,
    date: `${date}T12:00:00${tzOffset()}`,
    meal_type: meal || 'other',
    food_name: String(entry.name || 'Food').slice(0, 200),
    calories: Math.round(Number(entry.calories) || 0),
    protein: Math.round((Number(entry.protein) || 0) * 10) / 10,
    carbs: Math.round((Number(entry.carbs) || 0) * 10) / 10,
    fat: Math.round((Number(entry.fat) || 0) * 10) / 10,
    quantity: 1,
    serving_unit: entry.unit || 'serving',
    serving_size: Number(entry.servingSize) || 1,
  });

  if (error) {
    console.error('[nutritionStore] addEntry error:', error.message);
  }

  return { data, error };
}

/**
 * Insert multiple entries in a single batch.
 *
 * @param {string} userId
 * @param {string} date   — YYYY-MM-DD
 * @param {Array}  entries — [{ meal, name, calories, protein, carbs, fat }]
 */
export async function addEntries(userId, date, entries) {
  if (!userId || !date || !Array.isArray(entries) || entries.length === 0) {
    return { data: null, error: new Error('[nutritionStore] addEntries: missing required args') };
  }

  const tz = tzOffset();
  const rows = entries.map((e) => ({
    user_id: userId,
    date: `${date}T12:00:00${tz}`,
    meal_type: e.meal || 'other',
    food_name: String(e.name || 'Food').slice(0, 200),
    calories: Math.round(Number(e.calories) || 0),
    protein: Math.round((Number(e.protein) || 0) * 10) / 10,
    carbs: Math.round((Number(e.carbs) || 0) * 10) / 10,
    fat: Math.round((Number(e.fat) || 0) * 10) / 10,
    quantity: 1,
    serving_unit: e.unit || 'serving',
    serving_size: Number(e.servingSize) || 1,
  }));

  const { data, error } = await supabase.from('food_logs').insert(rows);

  if (error) {
    console.error('[nutritionStore] addEntries error:', error.message);
  }

  return { data, error };
}

/**
 * Query food_logs for a specific user + date.
 * Returns rows normalised for easy consumption (kcal, protein, carbs, fat, name, slot).
 *
 * @param {string} userId
 * @param {string} date   — YYYY-MM-DD
 * @returns {Array}
 */
export async function getEntriesForDate(userId, date) {
  if (!userId || !date) return [];

  const tz = tzOffset();

  try {
    const { data, error } = await supabase
      .from('food_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('date', `${date}T00:00:00${tz}`)
      .lte('date', `${date}T23:59:59${tz}`)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[nutritionStore] getEntriesForDate error:', error.message);
      return [];
    }

    return (data || []).map((row) => ({
      id: row.id,
      slot: row.meal_type || 'other',
      name: row.food_name || row.name || 'Food',
      kcal: Number(row.calories) || Number(row.total_calories) || 0,
      protein: Number(row.protein) || Number(row.protein_g) || Number(row.total_protein) || 0,
      carbs: Number(row.carbs) || Number(row.carbs_g) || Number(row.total_carbs) || 0,
      fat: Number(row.fat) || Number(row.fat_g) || Number(row.total_fat) || 0,
      portion: row.serving_size ? `${row.serving_size} ${row.serving_unit || 'serving'}` : null,
      raw: row,
    }));
  } catch (err) {
    console.error('[nutritionStore] getEntriesForDate exception:', err);
    return [];
  }
}

/**
 * Subscribe to real-time changes on food_logs for a user + date.
 * Returns an unsubscribe function.
 *
 * @param {string}   userId
 * @param {string}   date   — YYYY-MM-DD
 * @param {Function} cb     — called with the updated entry array
 * @returns {Function} unsubscribe
 */
export function subscribe(userId, date, cb) {
  if (!userId || !date || typeof cb !== 'function') {
    return () => {};
  }

  const channel = supabase
    .channel(`food_logs_${userId}_${date}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'food_logs',
        filter: `user_id=eq.${userId}`,
      },
      async () => {
        // Re-fetch the full list on any change
        const entries = await getEntriesForDate(userId, date);
        cb(entries);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
