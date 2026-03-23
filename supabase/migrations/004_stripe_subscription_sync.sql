-- ============================================================================
-- Atlas Core — Stripe Subscription Sync Migration
-- Adds stripe_customer_id and stripe_subscription_id to subscriptions table
-- ============================================================================

-- Add stripe_customer_id column
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Add stripe_subscription_id column
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Add stripe_price_id column (to track which price was used)
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

-- Add cancel_at_period_end flag
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT FALSE;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id 
ON public.subscriptions(stripe_customer_id) 
WHERE stripe_customer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id 
ON public.subscriptions(stripe_subscription_id) 
WHERE stripe_subscription_id IS NOT NULL;

-- ============================================================================
-- DONE
-- ============================================================================
