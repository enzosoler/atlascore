-- ============================================================================
-- Automatic Profile & Subscription Setup on User Signup
-- ============================================================================

-- Create a function that runs when a new user is created in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  trial_start TIMESTAMP WITH TIME ZONE;
  trial_end TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calculate trial dates
  trial_start := NOW();
  trial_end := NOW() + INTERVAL '7 days';

  -- 1. Create profile with role = 'user'
  INSERT INTO public.profiles (id, role, created_at, updated_at)
  VALUES (NEW.id, 'user', NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;

  -- 2. Create subscription with 7-day trial
  INSERT INTO public.subscriptions (
    user_id,
    tier,
    status,
    trial_starts_at,
    trial_ends_at,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    'free',
    'trialing',
    trial_start,
    trial_end,
    NOW(),
    NOW()
  )
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- DONE
-- ============================================================================
