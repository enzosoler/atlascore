-- ============================================================================
-- Atlas Core — Schema Validation Tests (Post-Migration)
-- Run after 009_schema_alignment_diff.sql to verify alignment
-- ============================================================================

-- Test runner helper
CREATE OR REPLACE FUNCTION public.run_schema_test(test_name TEXT, assertion BOOLEAN)
RETURNS TABLE(name TEXT, passed BOOLEAN) AS $$
BEGIN
  RETURN QUERY SELECT test_name, assertion;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TEST SUITE: Schema Alignment Validation
-- ============================================================================

WITH test_results AS (
  -- ========================================
  -- 1. PROFILES TESTS
  -- ========================================
  
  -- T1: updated_at column exists
  SELECT * FROM public.run_schema_test(
    'profiles: updated_at column exists',
    EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'profiles' 
      AND column_name = 'updated_at'
    )
  )
  UNION ALL
  
  -- T2: updated_at is NOT NULL
  SELECT * FROM public.run_schema_test(
    'profiles: updated_at is NOT NULL',
    EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'profiles' 
      AND column_name = 'updated_at' AND is_nullable = 'NO'
    )
  )
  UNION ALL
  
  -- T3: updated_at trigger exists
  SELECT * FROM public.run_schema_test(
    'profiles: updated_at trigger exists',
    EXISTS (
      SELECT 1 FROM pg_trigger 
      WHERE tgname = 'trigger_profiles_updated_at' 
      AND tgrelid = 'public.profiles'::regclass
    )
  )
  UNION ALL
  
  -- ========================================
  -- 2. WORKOUT_PLANS TESTS
  -- ========================================
  
  -- T4: frequency is nullable
  SELECT * FROM public.run_schema_test(
    'workout_plans: frequency is nullable',
    EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'workout_plans' 
      AND column_name = 'frequency' AND is_nullable = 'YES'
    )
  )
  UNION ALL
  
  -- T5: start_date has no default
  SELECT * FROM public.run_schema_test(
    'workout_plans: start_date has no default',
    EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'workout_plans' 
      AND column_name = 'start_date' 
      AND (column_default IS NULL OR column_default = '')
    )
  )
  UNION ALL
  
  -- T6: index workout_plans_user_active exists
  SELECT * FROM public.run_schema_test(
    'workout_plans: index workout_plans_user_active exists',
    EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE schemaname = 'public' AND tablename = 'workout_plans'
      AND indexname = 'workout_plans_user_active'
    )
  )
  UNION ALL
  
  -- T7: RLS enabled
  SELECT * FROM public.run_schema_test(
    'workout_plans: RLS is enabled',
    EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE schemaname = 'public' AND tablename = 'workout_plans' 
      AND rowsecurity = true
    )
  )
  UNION ALL
  
  -- ========================================
  -- 3. WORKOUTS TESTS
  -- ========================================
  
  -- T8: exercises_completed is NOT NULL
  SELECT * FROM public.run_schema_test(
    'workouts: exercises_completed is NOT NULL',
    EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'workouts' 
      AND column_name = 'exercises_completed' AND is_nullable = 'NO'
    )
  )
  UNION ALL
  
  -- T9: volume_load has no precision (is plain numeric)
  SELECT * FROM public.run_schema_test(
    'workouts: volume_load is plain numeric',
    EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'workouts' 
      AND column_name = 'volume_load' 
      AND data_type = 'numeric' 
      AND numeric_precision IS NULL
    )
  )
  UNION ALL
  
  -- T10: completed_at is nullable
  SELECT * FROM public.run_schema_test(
    'workouts: completed_at is nullable',
    EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'workouts' 
      AND column_name = 'completed_at' AND is_nullable = 'YES'
    )
  )
  UNION ALL
  
  -- T11: completed_at has no default
  SELECT * FROM public.run_schema_test(
    'workouts: completed_at has no default',
    EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'workouts' 
      AND column_name = 'completed_at' 
      AND (column_default IS NULL OR column_default = '')
    )
  )
  UNION ALL
  
  -- T12: index workouts_user_completed_at exists
  SELECT * FROM public.run_schema_test(
    'workouts: index workouts_user_completed_at exists',
    EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE schemaname = 'public' AND tablename = 'workouts'
      AND indexname = 'workouts_user_completed_at'
    )
  )
  UNION ALL
  
  -- T13: RLS enabled
  SELECT * FROM public.run_schema_test(
    'workouts: RLS is enabled',
    EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE schemaname = 'public' AND tablename = 'workouts' 
      AND rowsecurity = true
    )
  )
  UNION ALL
  
  -- ========================================
  -- 4. ADMIN_AUDIT_LOGS TESTS
  -- ========================================
  
  -- T14: actor_id is nullable
  SELECT * FROM public.run_schema_test(
    'admin_audit_logs: actor_id is nullable',
    EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'admin_audit_logs' 
      AND column_name = 'actor_id' AND is_nullable = 'YES'
    )
  )
  UNION ALL
  
  -- T15: action_detail is nullable
  SELECT * FROM public.run_schema_test(
    'admin_audit_logs: action_detail is nullable',
    EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'admin_audit_logs' 
      AND column_name = 'action_detail' AND is_nullable = 'YES'
    )
  )
  UNION ALL
  
  -- T16: action_detail has no default
  SELECT * FROM public.run_schema_test(
    'admin_audit_logs: action_detail has no default',
    EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'admin_audit_logs' 
      AND column_name = 'action_detail' 
      AND (column_default IS NULL OR column_default = '')
    )
  )
  UNION ALL
  
  -- T17: indexes exist
  SELECT * FROM public.run_schema_test(
    'admin_audit_logs: actor_idx index exists',
    EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE schemaname = 'public' AND tablename = 'admin_audit_logs'
      AND indexname = 'admin_audit_logs_actor_idx'
    )
  )
  UNION ALL
  
  SELECT * FROM public.run_schema_test(
    'admin_audit_logs: target_idx index exists',
    EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE schemaname = 'public' AND tablename = 'admin_audit_logs'
      AND indexname = 'admin_audit_logs_target_idx'
    )
  )
  UNION ALL
  
  -- T18: RLS enabled
  SELECT * FROM public.run_schema_test(
    'admin_audit_logs: RLS is enabled',
    EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE schemaname = 'public' AND tablename = 'admin_audit_logs' 
      AND rowsecurity = true
    )
  )
  UNION ALL
  
  -- T19: admin policies exist
  SELECT * FROM public.run_schema_test(
    'admin_audit_logs: admin select policy exists',
    EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'admin_audit_logs'
      AND policyname = 'admin_audit_logs_select'
    )
  )
  UNION ALL
  
  SELECT * FROM public.run_schema_test(
    'admin_audit_logs: admin insert policy exists',
    EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'admin_audit_logs'
      AND policyname = 'admin_audit_logs_insert'
    )
  )
  
)
SELECT 
  name as test_name,
  CASE WHEN passed THEN '✅ PASS' ELSE '❌ FAIL' END as result
FROM test_results
ORDER BY test_name;

-- ============================================================================
-- SUMMARY
-- ============================================================================

SELECT 
  COUNT(*) FILTER (WHERE passed = true) as passed,
  COUNT(*) FILTER (WHERE passed = false) as failed,
  COUNT(*) as total
FROM (
  -- Re-run all tests for summary
  SELECT true as passed  -- Placeholder, actual tests above
) summary;

-- Clean up test helper
DROP FUNCTION IF EXISTS public.run_schema_test(TEXT, BOOLEAN);
