-- ============================================================================
-- Atlas Core — Self-hosted error & event logging
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.error_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  message     TEXT NOT NULL,
  stack       TEXT,
  context     JSONB,
  url         TEXT,
  created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON public.error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id    ON public.error_logs(user_id);

ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous) can insert — errors happen before login too
DROP POLICY IF EXISTS "Anyone can insert error logs" ON public.error_logs;
CREATE POLICY "Anyone can insert error logs" ON public.error_logs
  FOR INSERT WITH CHECK (true);

-- Only admins can read
DROP POLICY IF EXISTS "Admins can read error logs" ON public.error_logs;
CREATE POLICY "Admins can read error logs" ON public.error_logs
  FOR SELECT USING (public.is_admin());
