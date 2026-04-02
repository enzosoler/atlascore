-- ============================================================================
-- THE DEFINITIVE FIX: Profiles Schema & RLS
-- Run this in your Supabase SQL Editor to fix the onboarding loop.
-- ============================================================================

-- 1. Ensure all required columns exist in the profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS age integer;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sex text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS height_cm numeric;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_weight numeric;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS target_weight numeric;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS activity_level text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS health_goals text[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS calories_target integer;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS protein_target integer;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS carbs_target integer;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS fat_target integer;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS water_target numeric;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_suspended boolean DEFAULT false;

-- 2. Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users cannot update role" ON public.profiles;

-- 3. Create permissive policies for authenticated users
-- Users can insert their own row
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 4. Verify columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles';
