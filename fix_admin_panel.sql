-- ============================================================================
-- Atlas Core — Fix Admin Panel (Missing Columns & RLS Policies)
-- ============================================================================
-- This migration adds the missing columns and RLS policies required for the
-- Admin Panel to function properly.
-- ============================================================================

-- ============================================================================
-- 1. ADD MISSING COLUMNS TO PROFILES
-- ============================================================================

-- Add is_suspended column if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'is_suspended'
  ) THEN
    ALTER TABLE public.profiles
      ADD COLUMN is_suspended boolean NOT NULL DEFAULT false;
    
    RAISE NOTICE 'Added profiles.is_suspended column';
  END IF;
END $$;

-- Add onboarding_completed column if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'onboarding_completed'
  ) THEN
    ALTER TABLE public.profiles
      ADD COLUMN onboarding_completed boolean NOT NULL DEFAULT false;
    
    RAISE NOTICE 'Added profiles.onboarding_completed column';
  END IF;
END $$;

-- ============================================================================
-- 2. ADD MISSING COLUMNS TO SUBSCRIPTIONS
-- ============================================================================

-- Add granted_by_admin column if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'subscriptions' AND column_name = 'granted_by_admin'
  ) THEN
    ALTER TABLE public.subscriptions
      ADD COLUMN granted_by_admin uuid REFERENCES auth.users(id) ON DELETE SET NULL;
    
    RAISE NOTICE 'Added subscriptions.granted_by_admin column';
  END IF;
END $$;

-- Add grant_reason column if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'subscriptions' AND column_name = 'grant_reason'
  ) THEN
    ALTER TABLE public.subscriptions
      ADD COLUMN grant_reason text;
    
    RAISE NOTICE 'Added subscriptions.grant_reason column';
  END IF;
END $$;

-- ============================================================================
-- 3. ENABLE RLS ON PROFILES & SUBSCRIPTIONS
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 4. DROP OLD POLICIES (if they exist)
-- ============================================================================

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;

DROP POLICY IF EXISTS "subscriptions_select_own" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_insert_own" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_update_own" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_admin_all" ON public.subscriptions;

-- ============================================================================
-- 5. CREATE NEW PROFILES POLICIES
-- ============================================================================

-- Users can read their own profile
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "profiles_select_admin" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can update their own profile
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can update any profile (for role changes, suspension, etc.)
CREATE POLICY "profiles_update_admin" ON public.profiles
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can insert their own profile (during signup)
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- 6. CREATE NEW SUBSCRIPTIONS POLICIES
-- ============================================================================

-- Users can read their own subscriptions
CREATE POLICY "subscriptions_select_own" ON public.subscriptions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Admins can read all subscriptions
CREATE POLICY "subscriptions_select_admin" ON public.subscriptions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can insert their own subscriptions
CREATE POLICY "subscriptions_insert_own" ON public.subscriptions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own subscriptions
CREATE POLICY "subscriptions_update_own" ON public.subscriptions
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can update any subscription (for tier/status changes, trial extensions, etc.)
CREATE POLICY "subscriptions_update_admin" ON public.subscriptions
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can insert subscriptions (for granting access)
CREATE POLICY "subscriptions_insert_admin" ON public.subscriptions
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- 7. VERIFICATION
-- ============================================================================

SELECT 
  'profiles' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
  AND column_name IN ('is_suspended', 'onboarding_completed', 'role')
ORDER BY ordinal_position;

SELECT 
  'subscriptions' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'subscriptions'
  AND column_name IN ('granted_by_admin', 'grant_reason', 'status', 'tier')
ORDER BY ordinal_position;

-- List all RLS policies on profiles and subscriptions
SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename IN ('profiles', 'subscriptions')
ORDER BY tablename, policyname;
