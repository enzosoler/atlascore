-- ============================================================================
-- Atlas Core — Add professional plan tiers to subscriptions.tier constraint
-- ============================================================================
-- The stripe-webhook stores 'coach', 'nutritionist', and 'clinician' as tier
-- values for professional plan subscribers. The previous CHECK constraint did
-- not include these values, causing INSERT/UPDATE failures (and silent data
-- loss) whenever a professional plan checkout completed.
-- ============================================================================

-- Drop the existing constraint (name may vary across environments)
ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_tier_check;

-- Recreate with all valid tier values including the three professional plans
ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_tier_check
  CHECK (tier IN (
    'free',
    'pro',
    'premium',
    'performance',
    'internal',
    'custom',
    'coach',
    'nutritionist',
    'clinician'
  ));
