-- ============================================================================
-- Fix onboarding profile writes under RLS
-- ============================================================================
-- The mobile onboarding completion path upserts the signed-in user's own
-- profiles row. A missing profile row must be creatable by that same user, but
-- only with non-privileged columns. Role, admin, and billing fields stay
-- protected by RLS, column grants, and the privilege-escalation trigger.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS profile_data jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.profiles TO authenticated;

DO $$
DECLARE
  insert_cols text;
  update_cols text;
BEGIN
  SELECT string_agg(quote_ident(column_name), ', ' ORDER BY column_name)
  INTO insert_cols
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name IN (
      'id',
      'full_name',
      'email',
      'preferred_language',
      'language',
      'onboarding_done',
      'onboarding_completed',
      'profile_data',
      'updated_at'
    );

  IF insert_cols IS NOT NULL THEN
    EXECUTE format('GRANT INSERT (%s) ON public.profiles TO authenticated', insert_cols);
  END IF;

  SELECT string_agg(quote_ident(column_name), ', ' ORDER BY column_name)
  INTO update_cols
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name IN (
      'full_name',
      'avatar_url',
      'training_goal',
      'health_goals',
      'activity_level',
      'current_weight',
      'target_weight',
      'height_cm',
      'age',
      'sex',
      'calories_target',
      'protein_target',
      'carbs_target',
      'fat_target',
      'water_target',
      'dietary_style',
      'food_preferences',
      'allergies',
      'meals_per_day',
      'training_experience',
      'training_location',
      'training_frequency',
      'training_session_minutes',
      'onboarding_done',
      'onboarding_completed',
      'preferred_language',
      'language',
      'profile_data',
      'updated_at'
    );

  IF update_cols IS NOT NULL THEN
    EXECUTE format('GRANT UPDATE (%s) ON public.profiles TO authenticated', update_cols);
  END IF;
END $$;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;

CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = id
    AND COALESCE(role, 'user') IN ('user', 'athlete')
    AND NOT COALESCE(profile_data, '{}'::jsonb) ?| ARRAY[
      'admin',
      'billing',
      'entitlement',
      'entitlements',
      'is_admin',
      'plan',
      'plan_code',
      'pro_entitlement',
      'role',
      'stripe_customer_id',
      'stripe_subscription_id',
      'subscription',
      'subscription_status',
      'subscription_tier',
      'tier'
    ]
  );

COMMENT ON POLICY "profiles_insert_own" ON public.profiles IS
  'Allows a signed-in user to create only their own non-privileged profile row when onboarding finds the signup trigger missed it.';
