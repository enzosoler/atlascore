-- ============================================================================
-- Add per-user daily chat call quotas + spending config columns for AI coach
-- ============================================================================

-- ─── 1. ai_usage_quotas: add chat counters ───────────────────────────────────

ALTER TABLE public.ai_usage_quotas
  ADD COLUMN IF NOT EXISTS chat_calls_today     INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS chat_calls_lifetime  INTEGER NOT NULL DEFAULT 0;

-- ─── 2. ai_spending_config: add per-tier chat limits ─────────────────────────

ALTER TABLE public.ai_spending_config
  ADD COLUMN IF NOT EXISTS free_chat_calls_per_day     INTEGER NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS pro_chat_calls_per_day      INTEGER NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS premium_chat_calls_per_day  INTEGER NOT NULL DEFAULT 200;

-- Update the singleton row with the desired defaults
UPDATE public.ai_spending_config
SET
  free_chat_calls_per_day    = 5,
  pro_chat_calls_per_day     = 50,
  premium_chat_calls_per_day = 200
WHERE id = 1;
