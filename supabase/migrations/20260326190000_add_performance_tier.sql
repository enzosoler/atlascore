-- Add 'performance' as a valid subscription tier
-- The CHECK constraint was missing 'performance', causing admin grants to fail

ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_tier_check;

ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_tier_check
  CHECK (tier IN ('free', 'pro', 'premium', 'performance', 'internal', 'custom'));
