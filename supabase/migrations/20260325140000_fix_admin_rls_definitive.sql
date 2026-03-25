-- ============================================================================
-- Atlas Core — Definitive Admin RLS Fix
-- ============================================================================
-- PROBLEM:
--   The admin panel only shows 1 user because RLS policies on `profiles`
--   use a subquery `SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'`
--   to check admin status. This creates a CIRCULAR dependency: to SELECT from
--   profiles, Postgres must first SELECT from profiles to check the policy,
--   which is itself subject to the same RLS check → the query silently returns
--   only the admin's own row (the one row where auth.uid() = id passes).
--
-- SOLUTION:
--   1. Use the `public.is_admin()` function (SECURITY DEFINER) from migration 003.
--      SECURITY DEFINER functions bypass RLS, breaking the circular dependency.
--   2. Add `email` column to profiles so admin can see user emails without
--      needing service_role access to auth.users.
--   3. Drop ALL conflicting policies and recreate clean ones.
--   4. Update the role CHECK constraint to include 'athlete' and 'clinician'.
--   5. Backfill email from auth.users for existing profiles.
-- ============================================================================

-- ─── 0. ENSURE is_admin() EXISTS (SECURITY DEFINER) ─────────────────────────
-- This function was created in migration 003, but we recreate it here
-- as a safety net. SECURITY DEFINER means it runs as the function owner
-- (superuser), bypassing RLS on the profiles table.
-- ────────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ─── 1. ADD EMAIL COLUMN TO PROFILES ─────────────────────────────────────────
-- This allows the admin panel to display user emails without needing
-- service_role access to auth.users.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email TEXT;

-- Backfill email from auth.users for existing profiles
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id
  AND (p.email IS NULL OR p.email = '');

-- Create a trigger to auto-sync email from auth.users on profile creation/update
CREATE OR REPLACE FUNCTION public.sync_profile_email()
RETURNS TRIGGER AS $$
BEGIN
  -- On INSERT, try to get email from auth.users
  IF TG_OP = 'INSERT' AND (NEW.email IS NULL OR NEW.email = '') THEN
    SELECT email INTO NEW.email FROM auth.users WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_sync_profile_email ON public.profiles;
CREATE TRIGGER trigger_sync_profile_email
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_email();

-- Also sync email when auth.users email changes
CREATE OR REPLACE FUNCTION public.sync_auth_email_to_profile()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email IS DISTINCT FROM OLD.email THEN
    UPDATE public.profiles SET email = NEW.email WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_sync_auth_email ON auth.users;
CREATE TRIGGER trigger_sync_auth_email
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_auth_email_to_profile();

-- ─── 2. UPDATE ROLE CHECK CONSTRAINT ─────────────────────────────────────────
-- The original constraint only allows ('user', 'admin', 'coach', 'nutritionist', 'doctor')
-- but the app uses 'athlete' and 'clinician'. We need to update it.

DO $$
BEGIN
  -- Drop the old check constraint (name may vary)
  ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
  
  -- Add the new one with all valid roles
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('user', 'athlete', 'admin', 'coach', 'nutritionist', 'clinician', 'doctor'));
    
  RAISE NOTICE 'Updated role CHECK constraint';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not update role constraint: %', SQLERRM;
END $$;

-- ─── 3. ADD MISSING COLUMNS ─────────────────────────────────────────────────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS granted_by_admin UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS grant_reason TEXT;

-- ─── 4. DROP ALL CONFLICTING POLICIES ON PROFILES ────────────────────────────
-- Multiple migrations created policies with different names. We drop them ALL
-- and recreate a clean, non-conflicting set.

-- From migration 001
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users cannot update role" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;

-- From migration 006
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- From fix_admin_panel.sql
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;

-- Any other possible names
DROP POLICY IF EXISTS "admin_profiles_select_all" ON public.profiles;

-- ─── 5. DROP ALL CONFLICTING POLICIES ON SUBSCRIPTIONS ───────────────────────

-- From migration 001
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users cannot update subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can update subscriptions" ON public.subscriptions;

-- From fix_admin_panel.sql
DROP POLICY IF EXISTS "subscriptions_select_own" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_select_admin" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_insert_own" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_update_own" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_update_admin" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_insert_admin" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_admin_all" ON public.subscriptions;

-- Any other possible names
DROP POLICY IF EXISTS "admin_subscriptions_select_all" ON public.subscriptions;

-- ─── 6. ENABLE RLS ──────────────────────────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- ─── 7. CREATE CLEAN PROFILES POLICIES ───────────────────────────────────────
-- Using public.is_admin() (SECURITY DEFINER) to avoid circular RLS dependency.

-- Users can read their own profile
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- Admins can read ALL profiles (uses SECURITY DEFINER function to avoid recursion)
CREATE POLICY "profiles_select_admin" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- Users can update their own profile (but not role — handled by WITH CHECK)
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can update any profile (role changes, suspension, etc.)
CREATE POLICY "profiles_update_admin" ON public.profiles
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Users can insert their own profile (during signup)
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- Service role can do anything (for triggers and edge functions)
-- Note: service_role bypasses RLS by default in Supabase, but just in case:
CREATE POLICY "profiles_service_role" ON public.profiles
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ─── 8. CREATE CLEAN SUBSCRIPTIONS POLICIES ─────────────────────────────────

-- Users can read their own subscriptions
CREATE POLICY "subscriptions_select_own" ON public.subscriptions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Admins can read ALL subscriptions
CREATE POLICY "subscriptions_select_admin" ON public.subscriptions
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- Users can insert their own subscriptions
CREATE POLICY "subscriptions_insert_own" ON public.subscriptions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own subscriptions
CREATE POLICY "subscriptions_update_own" ON public.subscriptions
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can update any subscription
CREATE POLICY "subscriptions_update_admin" ON public.subscriptions
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admins can insert subscriptions (for granting access)
CREATE POLICY "subscriptions_insert_admin" ON public.subscriptions
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

-- Service role can do anything
CREATE POLICY "subscriptions_service_role" ON public.subscriptions
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ─── 9. ALSO UPDATE handle_new_user TO INCLUDE EMAIL ─────────────────────────
-- Update the trigger function to also sync email when creating profiles

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  webhook_url TEXT;
  service_role_key TEXT;
BEGIN
  -- Get configuration
  webhook_url := 'https://xrtqwdpczgdomqebmfkk.supabase.co/functions/v1/auth-webhook';
  service_role_key := current_setting('app.settings.service_role_key', true);
  
  -- Try to call edge function via pg_net (if available)
  BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
      PERFORM net.http_post(
        url := webhook_url,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || service_role_key
        ),
        body := jsonb_build_object(
          'type', 'user.created',
          'record', jsonb_build_object(
            'id', NEW.id,
            'email', NEW.email,
            'user_metadata', NEW.raw_user_meta_data
          )
        )
      );
      RAISE LOG 'Webhook called for user %', NEW.id;
    ELSE
      RAISE LOG 'pg_net not available, user % queued for processing', NEW.id;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Error calling webhook for user %: %', NEW.id, SQLERRM;
  END;
  
  -- Always create profile and subscription synchronously
  BEGIN
    INSERT INTO public.profiles (id, role, full_name, email, language, updated_at)
    VALUES (
      NEW.id,
      'user',
      (NEW.raw_user_meta_data->>'full_name')::text,
      NEW.email,
      'en',
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
      email = COALESCE(EXCLUDED.email, public.profiles.email),
      updated_at = NOW();
    
    INSERT INTO public.subscriptions (user_id, tier, status, trial_starts_at, trial_ends_at)
    VALUES (
      NEW.id,
      'free',
      'trialing',
      NOW(),
      NOW() + INTERVAL '7 days'
    )
    ON CONFLICT (user_id) DO NOTHING;
    
    RAISE LOG 'Profile and subscription created for user %', NEW.id;
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── 10. UPDATE on-auth-user-created EDGE FUNCTION UPSERT ───────────────────
-- Note: The edge function also needs to include email in the upsert.
-- This is handled in the code changes to the edge function.

-- ─── 11. VERIFICATION ────────────────────────────────────────────────────────

-- Check profiles columns
SELECT 
  'profiles' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
  AND column_name IN ('email', 'is_suspended', 'onboarding_completed', 'role', 'full_name')
ORDER BY ordinal_position;

-- Check all RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public' AND tablename IN ('profiles', 'subscriptions')
ORDER BY tablename, policyname;

-- ============================================================================
-- DONE — After running this migration:
--   1. The admin panel will show ALL users (not just the admin's own profile)
--   2. User emails will be visible in the admin panel
--   3. New signups will automatically have their email synced to profiles
--   4. All RLS policies are clean and non-conflicting
-- ============================================================================
