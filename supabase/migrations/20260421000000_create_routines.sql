-- Atlas Core — User routines table
-- Stores user-created workout splits. Referenced by workout_sessions.routine_id (nullable FK).

CREATE TABLE IF NOT EXISTS public.routines (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  source_preset_id TEXT,
  days             JSONB NOT NULL DEFAULT '[]',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at     TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_routines_user_id
  ON public.routines (user_id);

CREATE INDEX IF NOT EXISTS idx_routines_last_used
  ON public.routines (user_id, last_used_at DESC NULLS LAST);

ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own routines"
  ON public.routines
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
