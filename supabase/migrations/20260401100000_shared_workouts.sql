-- ============================================================================
-- Atlas Core — Shared Workouts table
-- Stores snapshots of workout plans/days for sharing via public links.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.shared_workouts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token         TEXT NOT NULL UNIQUE,
  share_type    TEXT NOT NULL CHECK (share_type IN ('plan', 'day')),
  sharer_id     UUID NOT NULL,
  sharer_name   TEXT,
  plan_name     TEXT NOT NULL,
  workout_data  JSONB NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fast lookup by token (public share links)
CREATE UNIQUE INDEX IF NOT EXISTS idx_shared_workouts_token
  ON public.shared_workouts (token);

-- Index for finding shares by user
CREATE INDEX IF NOT EXISTS idx_shared_workouts_sharer
  ON public.shared_workouts (sharer_id);

-- RLS: Public read (anyone can view a shared workout via token).
-- Only service_role can insert (edge function handles auth).
ALTER TABLE public.shared_workouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read shared workouts" ON public.shared_workouts;
CREATE POLICY "Anyone can read shared workouts"
  ON public.shared_workouts
  FOR SELECT
  USING (TRUE);

-- ============================================================================
-- DONE — Shared Workouts table
-- ============================================================================
