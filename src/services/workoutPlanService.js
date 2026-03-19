/**
 * Atlas Core — Workout Plan Service (Supabase)
 * Substitui base44.entities.WorkoutPlan nas páginas MyWorkout e afins.
 * Tabela: workout_plans
 * Colunas esperadas: id, user_id, name, objective, frequency, days (jsonb),
 *   active, created_by_type, version, start_date, notes, created_at
 */
import { supabase } from '@/lib/supabaseClient';

const TABLE = 'workout_plans';

/** Lista os planos ativos do usuário (mais recente primeiro) */
export async function getActiveWorkoutPlans(userId) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .eq('active', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

/** Cria um novo plano */
export async function createWorkoutPlan(userId, plan) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({ ...plan, user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Atualiza um plano existente */
export async function updateWorkoutPlan(id, patch) {
  const { data, error } = await supabase
    .from(TABLE)
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Desativa todos os planos ativos do usuário (usado antes de criar novo) */
export async function deactivateAllWorkoutPlans(userId) {
  const { error } = await supabase
    .from(TABLE)
    .update({ active: false })
    .eq('user_id', userId)
    .eq('active', true);
  if (error) throw error;
}
