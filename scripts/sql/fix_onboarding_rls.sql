-- ============================================================================
-- FIX: Profiles RLS Policies for Onboarding
-- Run this in the Supabase SQL Editor to allow users to save their profile data.
-- ============================================================================

-- 1. Allow authenticated users to create their own profile record
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Allow users to update their own profile fields (required for onboarding)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 3. Verify current policies (should show SELECT, INSERT, and UPDATE for users)
SELECT tablename, policyname, cmd, qualify
FROM pg_policies
WHERE tablename = 'profiles';
