-- ============================================================================
-- Fix: privilege escalation trigger must skip INSERT (OLD is NULL)
-- ============================================================================
-- The prevent_profile_privilege_escalation trigger fires on BEFORE INSERT OR
-- UPDATE. On INSERT, OLD is NULL, so `NEW.role IS DISTINCT FROM OLD.role`
-- is always true (because DEFAULT 'user' IS DISTINCT FROM NULL). This causes
-- "permission denied" for every fresh profile INSERT during onboarding.
--
-- Fix: return NEW immediately when TG_OP = 'INSERT' — the INSERT RLS policy
-- already blocks privilege escalation via WITH CHECK.

CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  old_profile_data jsonb;
  new_profile_data jsonb;
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
  -- Skip escalation checks for service_role / postgres
  IF COALESCE(current_setting('request.jwt.claim.role', true), '') NOT IN ('anon', 'authenticated') THEN
    RETURN NEW;
  END IF;

  -- On INSERT there is no OLD row — the INSERT RLS policy handles protection
  IF TG_OP = 'INSERT' THEN
    RETURN NEW;
  END IF;

  -- UPDATE checks below
  old_profile_data := COALESCE(OLD.profile_data, '{}'::jsonb);
  new_profile_data := COALESCE(NEW.profile_data, '{}'::jsonb);

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
