-- ============================================================
-- Atlas Core — Supabase RLS for the food_logs table
-- Run in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/<your-project>/sql/new
-- ============================================================

-- 1. Enable RLS on the table (if not already enabled)
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;

-- 2. Remove old conflicting policies (if they exist)
DROP POLICY IF EXISTS "food_logs_select_own" ON food_logs;
DROP POLICY IF EXISTS "food_logs_insert_own" ON food_logs;
DROP POLICY IF EXISTS "food_logs_update_own" ON food_logs;
DROP POLICY IF EXISTS "food_logs_delete_own" ON food_logs;

-- 3. SELECT: each authenticated user can view only their own records
CREATE POLICY "food_logs_select_own"
  ON food_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 4. INSERT: each authenticated user can insert only with their own user_id
CREATE POLICY "food_logs_insert_own"
  ON food_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 5. UPDATE: each authenticated user can update only their own records
CREATE POLICY "food_logs_update_own"
  ON food_logs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6. DELETE: each authenticated user can delete only their own records
CREATE POLICY "food_logs_delete_own"
  ON food_logs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- Verification: list active policies on the table
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
  name          text NOT NULL DEFAULT 'Meal plan',
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
  name          text NOT NULL DEFAULT 'Workout plan',
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
