-- ============================================================================
-- Atlas Core — Schema Alignment Migration 009
-- Diff: profiles.updated_at, workout_plans frequency/start_date, 
--       workouts constraints, admin_audit_logs nullability
-- Idempotent: YES | Data-safe: YES
-- ============================================================================

-- Ensure pgcrypto is available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- 1. PROFILES — Add updated_at if missing
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.profiles
      ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
    
    RAISE NOTICE 'Added profiles.updated_at';
  ELSE
    -- Ensure NOT NULL and default
    ALTER TABLE public.profiles
      ALTER COLUMN updated_at SET NOT NULL,
      ALTER COLUMN updated_at SET DEFAULT now();
    
    -- Backfill any NULL values
    UPDATE public.profiles 
    SET updated_at = COALESCE(created_at, now()) 
    WHERE updated_at IS NULL;
    
    RAISE NOTICE 'Adjusted profiles.updated_at constraints';
  END IF;
END $$;

-- Create updated_at trigger for profiles if not exists
CREATE OR REPLACE FUNCTION public.update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trigger_profiles_updated_at' AND tgrelid = 'public.profiles'::regclass
  ) THEN
    CREATE TRIGGER trigger_profiles_updated_at
      BEFORE UPDATE ON public.profiles
      FOR EACH ROW
      EXECUTE FUNCTION public.update_profiles_updated_at();
    
    RAISE NOTICE 'Created profiles updated_at trigger';
  END IF;
END $$;

-- ============================================================================
-- 2. WORKOUT_PLANS — Align frequency and start_date nullability
-- ============================================================================

-- frequency: remove NOT NULL and default to allow null
ALTER TABLE public.workout_plans
  ALTER COLUMN frequency DROP NOT NULL,
  ALTER COLUMN frequency DROP DEFAULT;

-- start_date: remove default to allow explicit null
ALTER TABLE public.workout_plans
  ALTER COLUMN start_date DROP DEFAULT;

-- ============================================================================
-- 3. WORKOUTS — Align constraints with expected schema
-- ============================================================================

-- exercises_completed: add NOT NULL (backfill existing nulls first)
UPDATE public.workouts 
SET exercises_completed = '[]'::jsonb 
WHERE exercises_completed IS NULL;

ALTER TABLE public.workouts
  ALTER COLUMN exercises_completed SET NOT NULL,
  ALTER COLUMN exercises_completed SET DEFAULT '[]'::jsonb;

-- volume_load: remove precision constraint, keep nullable
ALTER TABLE public.workouts
  ALTER COLUMN volume_load TYPE numeric;

-- completed_at: remove NOT NULL and default (allow explicit null for in-progress)
ALTER TABLE public.workouts
  ALTER COLUMN completed_at DROP NOT NULL,
  ALTER COLUMN completed_at DROP DEFAULT;

-- ============================================================================
-- 4. ADMIN_AUDIT_LOGS — Fix nullability to match adminService.js
-- ============================================================================

-- actor_id: make nullable (safer for cases where actor is deleted)
ALTER TABLE public.admin_audit_logs
  ALTER COLUMN actor_id DROP NOT NULL;

-- action_detail: remove default, make nullable
ALTER TABLE public.admin_audit_logs
  ALTER COLUMN action_detail DROP DEFAULT,
  ALTER COLUMN action_detail DROP NOT NULL;

-- ============================================================================
-- 5. INDEXES — Ensure expected indexes exist (idempotent)
-- ============================================================================

-- workout_plans index
CREATE INDEX IF NOT EXISTS workout_plans_user_active
  ON public.workout_plans (user_id, active, created_at DESC);

-- workouts index  
CREATE INDEX IF NOT EXISTS workouts_user_completed_at
  ON public.workouts (user_id, completed_at DESC);

-- admin_audit_logs indexes
CREATE INDEX IF NOT EXISTS admin_audit_logs_actor_idx
  ON public.admin_audit_logs (actor_id, created_at DESC);

CREATE INDEX IF NOT EXISTS admin_audit_logs_target_idx
  ON public.admin_audit_logs (target_user_id, created_at DESC);

-- ============================================================================
-- 6. RLS POLICIES — Ensure expected policies (idempotent)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- workout_plans policies
DROP POLICY IF EXISTS "workout_plans_select_own" ON public.workout_plans;
DROP POLICY IF EXISTS "workout_plans_insert_own" ON public.workout_plans;
DROP POLICY IF EXISTS "workout_plans_update_own" ON public.workout_plans;
DROP POLICY IF EXISTS "workout_plans_delete_own" ON public.workout_plans;

CREATE POLICY "workout_plans_select_own" ON public.workout_plans
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "workout_plans_insert_own" ON public.workout_plans
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "workout_plans_update_own" ON public.workout_plans
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "workout_plans_delete_own" ON public.workout_plans
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- workouts policies
DROP POLICY IF EXISTS "workouts_select_own" ON public.workouts;
DROP POLICY IF EXISTS "workouts_insert_own" ON public.workouts;
DROP POLICY IF EXISTS "workouts_update_own" ON public.workouts;
DROP POLICY IF EXISTS "workouts_delete_own" ON public.workouts;

CREATE POLICY "workouts_select_own" ON public.workouts
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "workouts_insert_own" ON public.workouts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "workouts_update_own" ON public.workouts
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "workouts_delete_own" ON public.workouts
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- admin_audit_logs policies (admin only)
DROP POLICY IF EXISTS "admin_audit_logs_select" ON public.admin_audit_logs;
DROP POLICY IF EXISTS "admin_audit_logs_insert" ON public.admin_audit_logs;

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

-- ============================================================================
-- 7. VERIFICATION — Check alignment
-- ============================================================================

SELECT 
  'profiles' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
  AND column_name IN ('updated_at', 'is_suspended', 'onboarding_completed')
ORDER BY ordinal_position;
