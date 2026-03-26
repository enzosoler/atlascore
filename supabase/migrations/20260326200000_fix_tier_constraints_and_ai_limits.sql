-- ============================================================================
-- Fix tier CHECK constraints and AI spending config defaults
--
-- Fixes:
--   1. subscriptions.tier CHECK was missing 'coach', 'nutritionist', 'clinician'
--      → Stripe webhook writes these tiers; constraint violation silently broke
--        all coach/nutritionist/clinician Stripe subscriptions and admin grants.
--   2. ai_spending_config defaults updated to match intended per-tier limits.
-- ============================================================================

-- ─── 1. FIX subscriptions.tier CHECK ────────────────────────────────────────
-- Drop old constraint (regardless of name) and re-add with all valid tiers.

ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_tier_check;

ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_plan_code_check;

ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_tier_check
  CHECK (tier IN (
    'free',
    'pro',
    'premium',
    'performance',
    'coach',
    'nutritionist',
    'clinician',
    'internal',
    'custom'
  ));

-- ─── 2. UPDATE ai_spending_config defaults ──────────────────────────────────
-- Desired limits:
--   free:            1 text/day,  1 photo/day  (shows value of paid tier)
--   pro:            30 text/day, 10 photo/day
--   premium/performance/coach/nutritionist/clinician:
--                  100 text/day, 30 photo/day  (high enough only bots hit it)

UPDATE public.ai_spending_config
SET
  free_text_calls_per_day    = 1,
  free_photo_calls_per_day   = 1,
  pro_text_calls_per_day     = 30,
  pro_photo_calls_per_day    = 10,
  premium_text_calls_per_day  = 100,
  premium_photo_calls_per_day = 30
WHERE id = 1;

-- Ensure the row exists (idempotent safety net)
INSERT INTO public.ai_spending_config (
  id,
  free_text_calls_per_day,
  free_photo_calls_per_day,
  pro_text_calls_per_day,
  pro_photo_calls_per_day,
  premium_text_calls_per_day,
  premium_photo_calls_per_day
) VALUES (1, 1, 1, 30, 10, 100, 30)
ON CONFLICT (id) DO NOTHING;
