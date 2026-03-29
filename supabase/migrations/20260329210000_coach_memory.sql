-- ============================================================================
-- Coach memory + persistent message log
-- ============================================================================

-- ── coach_memory: one row per user, structured coaching context ──────────────

CREATE TABLE IF NOT EXISTS public.coach_memory (
  user_id           uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  athlete_profile   jsonb NOT NULL DEFAULT '{}'::jsonb,
  active_plan       jsonb NOT NULL DEFAULT '{}'::jsonb,
  adherence_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  conversation_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.coach_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coach_memory_select" ON public.coach_memory FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "coach_memory_insert" ON public.coach_memory FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "coach_memory_update" ON public.coach_memory FOR UPDATE USING (auth.uid() = user_id);

-- ── coach_messages: persistent per-user chat history ─────────────────────────

CREATE TABLE IF NOT EXISTS public.coach_messages (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       text NOT NULL CHECK (role IN ('user', 'assistant')),
  content    text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS coach_messages_user_created_idx
  ON public.coach_messages (user_id, created_at DESC);

ALTER TABLE public.coach_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coach_messages_select" ON public.coach_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "coach_messages_insert" ON public.coach_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
