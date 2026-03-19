-- ============================================================
-- Atlas Core — Supabase RLS para a tabela food_logs
-- Execute no SQL Editor do painel Supabase:
-- https://supabase.com/dashboard/project/<seu-projeto>/sql/new
-- ============================================================

-- 1. Habilitar RLS na tabela (caso ainda não esteja habilitado)
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas antigas conflitantes (se existirem)
DROP POLICY IF EXISTS "food_logs_select_own" ON food_logs;
DROP POLICY IF EXISTS "food_logs_insert_own" ON food_logs;
DROP POLICY IF EXISTS "food_logs_update_own" ON food_logs;
DROP POLICY IF EXISTS "food_logs_delete_own" ON food_logs;

-- 3. SELECT: cada usuário autenticado vê apenas seus próprios registros
CREATE POLICY "food_logs_select_own"
  ON food_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 4. INSERT: cada usuário autenticado pode inserir somente com seu próprio user_id
CREATE POLICY "food_logs_insert_own"
  ON food_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 5. UPDATE: cada usuário atualiza somente seus próprios registros
CREATE POLICY "food_logs_update_own"
  ON food_logs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6. DELETE: cada usuário deleta somente seus próprios registros
CREATE POLICY "food_logs_delete_own"
  ON food_logs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- Verificação: listar políticas ativas na tabela
-- ============================================================
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'food_logs'
ORDER BY policyname;

-- ============================================================
-- Tabelas: diet_plans e workout_plans
-- Execute junto ao script acima no Supabase SQL Editor
-- ============================================================

-- Diet Plans
CREATE TABLE IF NOT EXISTS diet_plans (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          text NOT NULL DEFAULT 'Plano alimentar',
  objective     text,
  total_calories numeric(7,1),
  total_protein  numeric(6,1),
  total_carbs    numeric(6,1),
  total_fat      numeric(6,1),
  meals         jsonb DEFAULT '[]'::jsonb,
  active        boolean NOT NULL DEFAULT true,
  created_by_type text DEFAULT 'ai',
  version       integer DEFAULT 1,
  start_date    date,
  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE diet_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "diet_plans_select_own" ON diet_plans;
DROP POLICY IF EXISTS "diet_plans_insert_own" ON diet_plans;
DROP POLICY IF EXISTS "diet_plans_update_own" ON diet_plans;
DROP POLICY IF EXISTS "diet_plans_delete_own" ON diet_plans;

CREATE POLICY "diet_plans_select_own" ON diet_plans FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "diet_plans_insert_own" ON diet_plans FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "diet_plans_update_own" ON diet_plans FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "diet_plans_delete_own" ON diet_plans FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Workout Plans
CREATE TABLE IF NOT EXISTS workout_plans (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          text NOT NULL DEFAULT 'Plano de treino',
  objective     text,
  frequency     text,
  days          jsonb DEFAULT '[]'::jsonb,
  active        boolean NOT NULL DEFAULT true,
  created_by_type text DEFAULT 'ai',
  version       integer DEFAULT 1,
  start_date    date,
  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "workout_plans_select_own" ON workout_plans;
DROP POLICY IF EXISTS "workout_plans_insert_own" ON workout_plans;
DROP POLICY IF EXISTS "workout_plans_update_own" ON workout_plans;
DROP POLICY IF EXISTS "workout_plans_delete_own" ON workout_plans;

CREATE POLICY "workout_plans_select_own" ON workout_plans FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "workout_plans_insert_own" ON workout_plans FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "workout_plans_update_own" ON workout_plans FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "workout_plans_delete_own" ON workout_plans FOR DELETE TO authenticated USING (auth.uid() = user_id);
