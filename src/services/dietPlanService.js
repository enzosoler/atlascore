/**
 * Atlas Core — Diet Plan Service (Supabase)
 * Substitui base44.entities.DietPlan nas páginas MyDiet e afins.
 * Tabela: diet_plans
 * Colunas esperadas: id, user_id, name, objective, total_calories, total_protein,
 *   total_carbs, total_fat, meals (jsonb), active, created_by_type, version,
 *   start_date, notes, created_at
 */
import { supabase } from '@/lib/supabaseClient';

const TABLE = 'diet_plans';

/** Lista os planos ativos do usuário (mais recente primeiro) */
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

/** Cria um novo plano */
export async function createDietPlan(userId, plan) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({ ...plan, user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Atualiza um plano existente */
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

/** Desativa todos os planos ativos do usuário (usado antes de criar novo) */
export async function deactivateAllDietPlans(userId) {
  const { error } = await supabase
    .from(TABLE)
    .update({ active: false })
    .eq('user_id', userId)
    .eq('active', true);
  if (error) throw error;
}
