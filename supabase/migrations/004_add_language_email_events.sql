-- ============================================================================
-- Atlas Core — Language Preference + Email Events Audit Log
-- ============================================================================

-- ─── ADD LANGUAGE TO PROFILES ─────────────────────────────────────────────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'en'
    CHECK (language IN ('en', 'pt')),
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS email_confirmed_at TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN public.profiles.language IS
  'User preferred language for transactional emails: en (English) or pt (Portuguese / PT-BR)';

-- ─── EMAIL EVENTS TABLE ────────────────────────────────────────────────────
-- Audit log for every email sent. Used to:
--   • Avoid duplicate sends (check last_sent_at before triggering)
--   • Debug delivery issues
--   • Track engagement per event type

CREATE TABLE IF NOT EXISTS public.email_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email         TEXT NOT NULL,
  type          TEXT NOT NULL,
  language      TEXT NOT NULL DEFAULT 'en',
  status        TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'skipped')),
  resend_id     TEXT,          -- ID returned by Resend API
  error_message TEXT,
  metadata      JSONB,         -- Extra context (e.g. milestone name, period dates)
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_events_user_id   ON public.email_events(user_id);
CREATE INDEX IF NOT EXISTS idx_email_events_type       ON public.email_events(type);
CREATE INDEX IF NOT EXISTS idx_email_events_created_at ON public.email_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_events_user_type  ON public.email_events(user_id, type, created_at DESC);

COMMENT ON TABLE public.email_events IS
  'Audit log of all transactional emails dispatched through the Atlas email system.';

-- ─── RLS FOR EMAIL_EVENTS ─────────────────────────────────────────────────

ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;

-- Admins can read all events
DROP POLICY IF EXISTS "Admins can read email events" ON public.email_events;
CREATE POLICY "Admins can read email events" ON public.email_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Service role bypasses RLS (used by edge functions with SERVICE_ROLE_KEY)

-- ============================================================================
-- DONE
-- ============================================================================
