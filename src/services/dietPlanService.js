/**
 * Atlas Core — Diet Plan Service (Supabase)
 * Supabase diet plan service — diet_plans table
 * Tabela: diet_plans
 * Colunas esperadas: id, user_id, name, objective, total_calories, total_protein,
 *   total_carbs, total_fat, meals (jsonb), active, created_by_type, version,
 *   start_date, notes, created_at
 */
import { supabase } from '@/lib/supabaseClient';

const TABLE = 'diet_plans';

/** List the user's active plans (most recent first). */
export async function getActiveDietPlans(userId) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .eq('active', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

/** Create a new plan. */
export async function createDietPlan(userId, plan) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({ ...plan, user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Update an existing plan. */
export async function updateDietPlan(id, patch) {
  const { data, error } = await supabase
    .from(TABLE)
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Deactivate all active plans for the user (used before creating a new one). */
export async function deactivateAllDietPlans(userId) {
  const { error } = await supabase
    .from(TABLE)
    .update({ active: false })
    .eq('user_id', userId)
    .eq('active', true);
  if (error) throw error;
}
