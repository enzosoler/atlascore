-- ============================================================================
-- Atlas Core — Workout Plans & Sessions Schema
-- Run in the Supabase SQL Editor:
--   https://supabase.com/dashboard/project/<your-project>/sql/new
-- ============================================================================

-- ─── 1. workout_plans ────────────────────────────────────────────────────────
-- Stores structured training plans created by the user (or prescribed by a coach).
-- `days` is a JSONB array of training day objects:
--   [{ "label": "Chest Day", "exercises": [{ "name", "sets", "reps", "load", ... }] }]

CREATE TABLE IF NOT EXISTS public.workout_plans (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Plan identity
  name             text NOT NULL,
  objective        text,
  frequency        integer NOT NULL DEFAULT 3,   -- target sessions per week
  days             jsonb   NOT NULL DEFAULT '[]'::jsonb,
  notes            text,

  -- Status
  active           boolean NOT NULL DEFAULT true,

  -- Provenance
  created_by_type  text    NOT NULL DEFAULT 'user'  -- 'user' | 'coach' | 'ai'
                     CHECK (created_by_type IN ('user', 'coach', 'ai')),
  version          integer NOT NULL DEFAULT 1,
  start_date       date             DEFAULT CURRENT_DATE,

  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS workout_plans_user_active
  ON public.workout_plans (user_id, active, created_at DESC);

ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "workout_plans_select_own"  ON public.workout_plans;
DROP POLICY IF EXISTS "workout_plans_insert_own"  ON public.workout_plans;
DROP POLICY IF EXISTS "workout_plans_update_own"  ON public.workout_plans;
DROP POLICY IF EXISTS "workout_plans_delete_own"  ON public.workout_plans;

CREATE POLICY "workout_plans_select_own" ON public.workout_plans
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "workout_plans_insert_own" ON public.workout_plans
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "workout_plans_update_own" ON public.workout_plans
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "workout_plans_delete_own" ON public.workout_plans
  FOR DELETE TO authenticated USING (auth.uid() = user_id);


-- ─── 2. workouts ─────────────────────────────────────────────────────────────
-- Stores completed workout sessions.
-- Used by workoutService.js (saveCompletedWorkout / getRecentWorkouts).
-- `exercises_completed` mirrors the payload produced by WorkoutExecutionScreen:
--   [{ name, target_sets, target_reps, sets: [{set_number, reps_actual, load_actual, ...}] }]

CREATE TABLE IF NOT EXISTS public.workouts (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Session identity
  name                text NOT NULL DEFAULT 'Workout',
  status              text NOT NULL DEFAULT 'completed'
                        CHECK (status IN ('in_progress', 'completed', 'abandoned')),

  -- Link to the plan that originated this session (nullable for free-form)
  plan_id             uuid REFERENCES public.workout_plans(id) ON DELETE SET NULL,
  plan_day_index      integer,

  -- Execution results written on completion
  exercises_completed jsonb DEFAULT '[]'::jsonb,

  -- Aggregated metrics
  volume_load         numeric(10, 1),   -- total kg moved (reps × weight)
  duration_minutes    integer,

  completed_at        timestamptz NOT NULL DEFAULT now(),
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS workouts_user_completed_at
  ON public.workouts (user_id, completed_at DESC);

ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "workouts_select_own"  ON public.workouts;
DROP POLICY IF EXISTS "workouts_insert_own"  ON public.workouts;
DROP POLICY IF EXISTS "workouts_update_own"  ON public.workouts;
DROP POLICY IF EXISTS "workouts_delete_own"  ON public.workouts;

CREATE POLICY "workouts_select_own" ON public.workouts
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "workouts_insert_own" ON public.workouts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "workouts_update_own" ON public.workouts
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "workouts_delete_own" ON public.workouts
  FOR DELETE TO authenticated USING (auth.uid() = user_id);


-- ─── Verification ─────────────────────────────────────────────────────────────

SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('workout_plans', 'workouts')
ORDER BY tablename, policyname;
