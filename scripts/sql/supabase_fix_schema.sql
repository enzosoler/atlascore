-- ============================================================================
-- Atlas Core — Schema Correction Script
-- Drops and recreates tables that were created with wrong column names.
-- Run this DIRECTLY in Supabase SQL Editor (not via an AI assistant).
-- ============================================================================

-- ─── Drop the incorrectly created objects ────────────────────────────────────

DROP TABLE IF EXISTS public.admin_audit_logs   CASCADE;
DROP TABLE IF EXISTS public.workouts           CASCADE;
DROP TABLE IF EXISTS public.workout_plans      CASCADE;

-- ─── 1. workout_plans ────────────────────────────────────────────────────────

CREATE TABLE public.workout_plans (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name             text NOT NULL,
  objective        text,
  frequency        integer NOT NULL DEFAULT 3,
  days             jsonb   NOT NULL DEFAULT '[]'::jsonb,
  notes            text,
  active           boolean NOT NULL DEFAULT true,
  created_by_type  text    NOT NULL DEFAULT 'user'
                     CHECK (created_by_type IN ('user', 'coach', 'ai')),
  version          integer NOT NULL DEFAULT 1,
  start_date       date             DEFAULT CURRENT_DATE,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX workout_plans_user_active
  ON public.workout_plans (user_id, active, created_at DESC);

ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;

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

CREATE TABLE public.workouts (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name                text NOT NULL DEFAULT 'Workout',
  status              text NOT NULL DEFAULT 'completed'
                        CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  plan_id             uuid REFERENCES public.workout_plans(id) ON DELETE SET NULL,
  plan_day_index      integer,
  exercises_completed jsonb DEFAULT '[]'::jsonb,
  volume_load         numeric(10, 1),
  duration_minutes    integer,
  completed_at        timestamptz NOT NULL DEFAULT now(),
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX workouts_user_completed_at
  ON public.workouts (user_id, completed_at DESC);

ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workouts_select_own" ON public.workouts
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "workouts_insert_own" ON public.workouts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "workouts_update_own" ON public.workouts
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "workouts_delete_own" ON public.workouts
  FOR DELETE TO authenticated USING (auth.uid() = user_id);


-- ─── 3. admin_audit_logs ─────────────────────────────────────────────────────
-- Column names must match adminService.js exactly:
--   actor_id, target_user_id, action_type, action_detail

CREATE TABLE public.admin_audit_logs (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id   uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type      text NOT NULL,
  action_detail    jsonb DEFAULT '{}'::jsonb,
  old_value        jsonb,
  new_value        jsonb,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX admin_audit_logs_actor_idx
  ON public.admin_audit_logs (actor_id, created_at DESC);

CREATE INDEX admin_audit_logs_target_idx
  ON public.admin_audit_logs (target_user_id, created_at DESC);

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_audit_logs_select" ON public.admin_audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "admin_audit_logs_insert" ON public.admin_audit_logs
  FOR INSERT
  WITH CHECK (
    actor_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );


-- ─── 4. profiles — add admin columns if missing ──────────────────────────────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_suspended        boolean NOT NULL DEFAULT false;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false;


-- ─── Verify ───────────────────────────────────────────────────────────────────

SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('workout_plans', 'workouts', 'admin_audit_logs', 'profiles')
ORDER BY tablename, policyname;
