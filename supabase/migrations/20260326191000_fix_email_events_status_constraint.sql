-- Fix email_events status CHECK constraint
-- Migration 004 created the table with CHECK (status IN ('sent', 'failed', 'skipped'))
-- but edge functions (email-service.ts, logger.ts) use 'pending' and 'retrying' too.
-- Migration 010 attempted to redefine the table but was skipped (IF NOT EXISTS).
-- This migration aligns the constraint with actual usage.

ALTER TABLE public.email_events
  DROP CONSTRAINT IF EXISTS email_events_status_check;

ALTER TABLE public.email_events
  ADD CONSTRAINT email_events_status_check
  CHECK (status IN ('pending', 'sent', 'failed', 'skipped', 'retrying'));
