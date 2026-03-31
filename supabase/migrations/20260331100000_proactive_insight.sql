-- ============================================================================
-- Add proactive_insight column to coach_memory for Today screen AI card.
-- Generated daily by cron or after each chat exchange.
-- ============================================================================

ALTER TABLE public.coach_memory
  ADD COLUMN IF NOT EXISTS proactive_insight text,
  ADD COLUMN IF NOT EXISTS proactive_insight_generated_at timestamptz;

-- Allow RLS read of the new columns (already covered by existing SELECT policy)
-- No new policy needed.
