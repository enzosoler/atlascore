-- Migration: Create stripe_webhook_events table for idempotency
-- Ensures webhook events are processed exactly once

CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_event_id text UNIQUE NOT NULL,
  event_type text,
  processed_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Index for fast lookup by stripe_event_id
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_event_id 
  ON public.stripe_webhook_events(stripe_event_id);

-- Index for cleaning old events
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_processed_at 
  ON public.stripe_webhook_events(processed_at);

-- Enable RLS
ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

-- Only service role can access (edge functions use service role)
CREATE POLICY "stripe_webhook_events_service_role" 
  ON public.stripe_webhook_events 
  FOR ALL TO service_role 
  USING (true) 
  WITH CHECK (true);

-- Cleanup function: remove events older than 30 days
CREATE OR REPLACE FUNCTION public.cleanup_old_stripe_webhook_events()
RETURNS void AS $$
BEGIN
  DELETE FROM public.stripe_webhook_events 
  WHERE processed_at < now() - interval '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to service role
GRANT EXECUTE ON FUNCTION public.cleanup_old_stripe_webhook_events() TO service_role;
