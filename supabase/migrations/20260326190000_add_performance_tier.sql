-- Rename plan_code to tier (if DB was created before migrations with plan_code column)
-- and add 'performance' as a valid tier value.
-- Idempotent: safe to run multiple times.

DO $$
BEGIN
  -- If plan_code exists and tier does not: rename the column
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'subscriptions' AND column_name = 'plan_code'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'subscriptions' AND column_name = 'tier'
  ) THEN
    ALTER TABLE public.subscriptions RENAME COLUMN plan_code TO tier;
    RAISE NOTICE 'Renamed subscriptions.plan_code -> tier';
  END IF;
END $$;

-- Drop any existing tier CHECK constraint (regardless of name)
ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_tier_check;

ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_plan_code_check;

-- Add the correct constraint with all valid values including 'performance'
ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_tier_check
  CHECK (tier IN ('free', 'pro', 'premium', 'performance', 'internal', 'custom'));
