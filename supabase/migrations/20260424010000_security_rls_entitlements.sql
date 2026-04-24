-- ============================================================================
-- SECURITY HOTFIX: RLS entitlements, admin view access, email abuse controls
-- ============================================================================

-- Harden profiles shape expected by app code and entitlement checks.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS profile_data jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Keep the admin helper stable and explicit about search_path.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

-- ─── subscriptions: authenticated users may only read allowed rows ─────────
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users cannot update subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can update subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_select_own" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_select_admin" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_insert_own" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_update_own" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_update_admin" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_insert_admin" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_admin_all" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_service_role" ON public.subscriptions;
DROP POLICY IF EXISTS "admin_subscriptions_select_all" ON public.subscriptions;

REVOKE INSERT, UPDATE, DELETE ON public.subscriptions FROM anon, authenticated;
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;

CREATE POLICY "subscriptions_select_own" ON public.subscriptions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "subscriptions_select_admin" ON public.subscriptions
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "subscriptions_service_role" ON public.subscriptions
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ─── profiles: users can update only safe columns, never roles/entitlements ─
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users cannot update role" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
DROP POLICY IF EXISTS "admin_profiles_select_all" ON public.profiles;

REVOKE UPDATE ON public.profiles FROM anon, authenticated;
GRANT SELECT ON public.profiles TO authenticated;
GRANT UPDATE (
  full_name,
  avatar_url,
  training_goal,
  health_goals,
  activity_level,
  current_weight,
  target_weight,
  height_cm,
  age,
  sex,
  calories_target,
  protein_target,
  carbs_target,
  fat_target,
  water_target,
  dietary_style,
  food_preferences,
  allergies,
  meals_per_day,
  training_experience,
  training_location,
  training_frequency,
  training_session_minutes,
  onboarding_done,
  onboarding_completed,
  preferred_language,
  language,
  profile_data,
  updated_at
) ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  old_profile_data jsonb := COALESCE(OLD.profile_data, '{}'::jsonb);
  new_profile_data jsonb := COALESCE(NEW.profile_data, '{}'::jsonb);
  protected_key text;
  protected_profile_data_keys text[] := ARRAY[
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
  ];
BEGIN
  IF COALESCE(current_setting('request.jwt.claim.role', true), '') NOT IN ('anon', 'authenticated') THEN
    RETURN NEW;
  END IF;

  IF NEW.id IS DISTINCT FROM OLD.id THEN
    RAISE EXCEPTION 'profiles.id cannot be changed';
  END IF;

  IF NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'profiles.role cannot be changed by authenticated users';
  END IF;

  IF to_jsonb(NEW)->'is_admin' IS DISTINCT FROM to_jsonb(OLD)->'is_admin' THEN
    RAISE EXCEPTION 'profiles.is_admin cannot be changed by authenticated users';
  END IF;

  FOREACH protected_key IN ARRAY protected_profile_data_keys LOOP
    IF new_profile_data->protected_key IS DISTINCT FROM old_profile_data->protected_key THEN
      RAISE EXCEPTION 'protected profile_data entitlement keys cannot be changed by authenticated users';
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_profile_privilege_escalation ON public.profiles;
CREATE TRIGGER prevent_profile_privilege_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_privilege_escalation();

CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles_select_admin" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = id
    AND role IN ('user', 'athlete')
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

CREATE POLICY "profiles_service_role" ON public.profiles
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ─── user_admin_summary: views are security-definer by default in Postgres ──
DROP VIEW IF EXISTS public.user_admin_summary;
CREATE VIEW public.user_admin_summary
WITH (security_invoker = true)
AS
SELECT
  p.id,
  p.email,
  p.full_name,
  p.created_at,
  p.updated_at,
  CASE
    WHEN p.is_suspended = true THEN 'suspended'
    ELSE 'active'
  END AS account_status,
  p.role,
  p.onboarding_completed
FROM public.profiles p;

REVOKE ALL ON public.user_admin_summary FROM PUBLIC;
REVOKE ALL ON public.user_admin_summary FROM anon, authenticated;
GRANT SELECT ON public.user_admin_summary TO service_role;

-- ─── Password reset rate limiting, consumed only by service-role functions ──
CREATE TABLE IF NOT EXISTS public.password_reset_rate_limits (
  bucket_key text PRIMARY KEY,
  scope text NOT NULL CHECK (scope IN ('email', 'ip')),
  window_started_at timestamptz NOT NULL DEFAULT now(),
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  last_requested_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.password_reset_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.password_reset_rate_limits FROM PUBLIC;
REVOKE ALL ON public.password_reset_rate_limits FROM anon, authenticated;
GRANT ALL ON public.password_reset_rate_limits TO service_role;

CREATE POLICY "password_reset_rate_limits_service_role" ON public.password_reset_rate_limits
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.consume_password_reset_rate_limit(
  p_email text,
  p_ip text DEFAULT NULL
)
RETURNS TABLE(allowed boolean, retry_after_seconds integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  email_key text := 'email:' || md5(lower(trim(p_email)));
  ip_key text := CASE
    WHEN nullif(trim(COALESCE(p_ip, '')), '') IS NULL THEN NULL
    ELSE 'ip:' || md5(trim(p_ip))
  END;
  email_retry integer := 0;
  ip_retry integer := 0;
BEGIN
  INSERT INTO public.password_reset_rate_limits AS limits (
    bucket_key,
    scope,
    window_started_at,
    attempts,
    last_requested_at
  )
  VALUES (email_key, 'email', now(), 1, now())
  ON CONFLICT (bucket_key) DO UPDATE
  SET
    window_started_at = CASE
      WHEN limits.window_started_at <= now() - interval '1 hour' THEN now()
      ELSE limits.window_started_at
    END,
    attempts = CASE
      WHEN limits.window_started_at <= now() - interval '1 hour' THEN 1
      ELSE limits.attempts + 1
    END,
    last_requested_at = now();

  SELECT CASE
    WHEN attempts > 5 THEN GREATEST(1, CEIL(EXTRACT(EPOCH FROM (window_started_at + interval '1 hour' - now())))::integer)
    ELSE 0
  END
  INTO email_retry
  FROM public.password_reset_rate_limits
  WHERE bucket_key = email_key;

  IF ip_key IS NOT NULL THEN
    INSERT INTO public.password_reset_rate_limits AS limits (
      bucket_key,
      scope,
      window_started_at,
      attempts,
      last_requested_at
    )
    VALUES (ip_key, 'ip', now(), 1, now())
    ON CONFLICT (bucket_key) DO UPDATE
    SET
      window_started_at = CASE
        WHEN limits.window_started_at <= now() - interval '1 hour' THEN now()
        ELSE limits.window_started_at
      END,
      attempts = CASE
        WHEN limits.window_started_at <= now() - interval '1 hour' THEN 1
        ELSE limits.attempts + 1
      END,
      last_requested_at = now();

    SELECT CASE
      WHEN attempts > 20 THEN GREATEST(1, CEIL(EXTRACT(EPOCH FROM (window_started_at + interval '1 hour' - now())))::integer)
      ELSE 0
    END
    INTO ip_retry
    FROM public.password_reset_rate_limits
    WHERE bucket_key = ip_key;
  END IF;

  allowed := email_retry = 0 AND ip_retry = 0;
  retry_after_seconds := GREATEST(email_retry, ip_retry);
  RETURN NEXT;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_password_reset_rate_limit(text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.consume_password_reset_rate_limit(text, text) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_password_reset_rate_limit(text, text) TO service_role;

-- ─── RLS smoke tests: ordinary authenticated user cannot self-upgrade ───────
DO $$
DECLARE
  test_user uuid := '00000000-0000-4000-8000-000000000123';
  blocked boolean;
BEGIN
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  )
  VALUES (
    test_user,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'rls-hotfix-user@example.invalid',
    'test-only',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.profiles (id, role, email, profile_data)
  VALUES (test_user, 'user', 'rls-hotfix-user@example.invalid', '{}'::jsonb)
  ON CONFLICT (id) DO UPDATE
  SET role = 'user',
      email = EXCLUDED.email,
      profile_data = '{}'::jsonb;

  PERFORM set_config('request.jwt.claim.sub', test_user::text, true);
  PERFORM set_config('request.jwt.claim.role', 'authenticated', true);
  EXECUTE 'SET LOCAL ROLE authenticated';

  blocked := false;
  BEGIN
    UPDATE public.profiles SET role = 'admin' WHERE id = test_user;
  EXCEPTION
    WHEN OTHERS THEN
      blocked := true;
  END;
  IF NOT blocked THEN
    RAISE EXCEPTION 'RLS smoke test failed: authenticated user updated profiles.role';
  END IF;

  blocked := false;
  BEGIN
    UPDATE public.profiles
    SET profile_data = jsonb_build_object('pro_entitlement', jsonb_build_object('active', true))
    WHERE id = test_user;
  EXCEPTION
    WHEN OTHERS THEN
      blocked := true;
  END;
  IF NOT blocked THEN
    RAISE EXCEPTION 'RLS smoke test failed: authenticated user updated protected profile_data entitlement keys';
  END IF;

  blocked := false;
  BEGIN
    INSERT INTO public.subscriptions (user_id, tier, status)
    VALUES (test_user, 'pro', 'active');
  EXCEPTION
    WHEN OTHERS THEN
      blocked := true;
  END;
  IF NOT blocked THEN
    RAISE EXCEPTION 'RLS smoke test failed: authenticated user inserted pro subscription';
  END IF;

  blocked := false;
  BEGIN
    PERFORM 1 FROM public.user_admin_summary LIMIT 1;
  EXCEPTION
    WHEN OTHERS THEN
      blocked := true;
  END;
  IF NOT blocked THEN
    RAISE EXCEPTION 'RLS smoke test failed: authenticated user queried user_admin_summary';
  END IF;

  EXECUTE 'RESET ROLE';

  DELETE FROM public.subscriptions WHERE user_id = test_user;
  DELETE FROM public.profiles WHERE id = test_user;
  DELETE FROM auth.users WHERE id = test_user;
END;
$$;
