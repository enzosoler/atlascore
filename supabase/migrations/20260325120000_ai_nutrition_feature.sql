-- ============================================================================
-- Atlas Core — AI Nutrition Feature: Cache, Quotas & Usage Tracking
-- Migration 013
-- ============================================================================

-- ─── 0. ENSURE HELPER FUNCTION EXISTS ─────────────────────────────────────────
-- This function may already exist from migration 001, but we create it here
-- as a safety net in case the earlier migration was applied outside of tracking.
-- ────────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ─── 1. FOOD NUTRITION CACHE ─────────────────────────────────────────────────
-- Stores AI-generated nutrition data for natural language food descriptions.
-- Acts as a shared cache: once a food description is resolved by AI, all future
-- queries matching the same normalized text get instant results at zero AI cost.
-- ────────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.food_nutrition_cache (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- The normalized version of the user's input (lowercased, trimmed, filler removed).
  -- This is the lookup key. UNIQUE index ensures no duplicate entries.
  normalized_query TEXT NOT NULL,

  -- The original user input that first created this cache entry (for debugging/auditing).
  original_query   TEXT NOT NULL,

  -- The language detected or assumed from the original query (e.g., 'pt', 'en', 'es').
  language         TEXT NOT NULL DEFAULT 'pt',

  -- Nutrition data per the described portion (not per 100g — per what the user described).
  calories         NUMERIC(7,1) NOT NULL DEFAULT 0,
  protein          NUMERIC(6,1) NOT NULL DEFAULT 0,
  carbs            NUMERIC(6,1) NOT NULL DEFAULT 0,
  fat              NUMERIC(6,1) NOT NULL DEFAULT 0,
  fiber            NUMERIC(6,1) DEFAULT 0,

  -- Serving description returned by the AI (e.g., "1 plate", "200g", "1 medium bowl").
  serving_description TEXT,

  -- The AI model used to generate this entry (e.g., 'gpt-4.1-nano').
  model_used       TEXT NOT NULL DEFAULT 'gpt-4.1-nano',

  -- How many times this cache entry has been served (helps identify popular foods).
  hit_count        INTEGER NOT NULL DEFAULT 0,

  -- Confidence score from the AI (0.0 to 1.0). Entries below a threshold can be
  -- flagged for human review or re-processed with a stronger model.
  confidence       NUMERIC(3,2) NOT NULL DEFAULT 0.80,

  -- Soft-delete / moderation flag. Admins can mark entries as invalid.
  is_verified      BOOLEAN NOT NULL DEFAULT FALSE,
  is_flagged       BOOLEAN NOT NULL DEFAULT FALSE,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique index on normalized_query for fast lookups and deduplication.
CREATE UNIQUE INDEX IF NOT EXISTS idx_fnc_normalized_query
  ON public.food_nutrition_cache (normalized_query);

-- Index for admin dashboard: find unverified or flagged entries.
CREATE INDEX IF NOT EXISTS idx_fnc_flagged
  ON public.food_nutrition_cache (is_flagged) WHERE is_flagged = TRUE;

-- Index for popularity ranking.
CREATE INDEX IF NOT EXISTS idx_fnc_hit_count
  ON public.food_nutrition_cache (hit_count DESC);

-- Trigger to auto-update updated_at.
DROP TRIGGER IF EXISTS trigger_fnc_updated_at ON public.food_nutrition_cache;
CREATE TRIGGER trigger_fnc_updated_at
  BEFORE UPDATE ON public.food_nutrition_cache
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS: This is a shared/public cache. All authenticated users can read.
-- Only service_role (edge functions) can insert/update.
ALTER TABLE public.food_nutrition_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read food cache" ON public.food_nutrition_cache;
CREATE POLICY "Anyone can read food cache"
  ON public.food_nutrition_cache
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- No INSERT/UPDATE/DELETE policies for authenticated users.
-- Only service_role (used by edge functions) can write to this table.


-- ─── 2. AI USAGE QUOTAS (PER USER, PER DAY) ─────────────────────────────────
-- Tracks how many AI calls each user has made today.
-- Resets daily. Enforced by the edge function before making any AI call.
-- ────────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.ai_usage_quotas (
  user_id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Text-based AI food parsing calls made today.
  text_calls_today     INTEGER NOT NULL DEFAULT 0,

  -- Photo-based AI food analysis calls made today.
  photo_calls_today    INTEGER NOT NULL DEFAULT 0,

  -- The date these counters apply to. When the current date differs from this,
  -- the edge function resets the counters before checking limits.
  quota_date           DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Lifetime counters (never reset — useful for analytics and abuse detection).
  text_calls_lifetime  INTEGER NOT NULL DEFAULT 0,
  photo_calls_lifetime INTEGER NOT NULL DEFAULT 0,

  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger to auto-update updated_at.
DROP TRIGGER IF EXISTS trigger_aiq_updated_at ON public.ai_usage_quotas;
CREATE TRIGGER trigger_aiq_updated_at
  BEFORE UPDATE ON public.ai_usage_quotas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS: Users can view their own quotas. Only service_role can update.
ALTER TABLE public.ai_usage_quotas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own quotas" ON public.ai_usage_quotas;
CREATE POLICY "Users can view own quotas"
  ON public.ai_usage_quotas
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can view all quotas (for the admin dashboard).
DROP POLICY IF EXISTS "Admins can view all quotas" ON public.ai_usage_quotas;
CREATE POLICY "Admins can view all quotas"
  ON public.ai_usage_quotas
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );


-- ─── 3. AI USAGE LOG (AUDIT TRAIL) ──────────────────────────────────────────
-- Every AI invocation is logged here for cost tracking, auditing, and analytics.
-- This is the source of truth for "how much are we spending on AI?"
-- ────────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.ai_usage_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Which feature triggered this call.
  feature         TEXT NOT NULL CHECK (feature IN ('food_text', 'food_photo', 'chat', 'diet_plan', 'workout_plan')),

  -- AI model used (e.g., 'gpt-4.1-nano', 'gemini-2.0-flash').
  model           TEXT NOT NULL,

  -- Token usage reported by the AI provider.
  input_tokens    INTEGER NOT NULL DEFAULT 0,
  output_tokens   INTEGER NOT NULL DEFAULT 0,

  -- Estimated cost in USD (calculated by the edge function using known pricing).
  estimated_cost  NUMERIC(10,6) NOT NULL DEFAULT 0,

  -- Whether the result was served from cache (cost = 0) or from AI.
  cache_hit       BOOLEAN NOT NULL DEFAULT FALSE,

  -- The user's input (truncated for privacy/storage — first 500 chars).
  input_preview   TEXT,

  -- Whether the call succeeded or failed.
  success         BOOLEAN NOT NULL DEFAULT TRUE,
  error_message   TEXT,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for cost analysis: sum costs by date range.
CREATE INDEX IF NOT EXISTS idx_aul_created_at
  ON public.ai_usage_log (created_at DESC);

-- Index for per-user usage analysis.
CREATE INDEX IF NOT EXISTS idx_aul_user_feature
  ON public.ai_usage_log (user_id, feature, created_at DESC);

-- Index for cost monitoring: quickly sum recent costs.
CREATE INDEX IF NOT EXISTS idx_aul_cost_monitoring
  ON public.ai_usage_log (created_at, estimated_cost)
  WHERE cache_hit = FALSE;

-- RLS: Users can view their own logs. Admins can view all.
ALTER TABLE public.ai_usage_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own AI usage" ON public.ai_usage_log;
CREATE POLICY "Users can view own AI usage"
  ON public.ai_usage_log
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all AI usage" ON public.ai_usage_log;
CREATE POLICY "Admins can view all AI usage"
  ON public.ai_usage_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );


-- ─── 4. GLOBAL AI SPENDING LIMITS ───────────────────────────────────────────
-- A single-row configuration table that stores platform-wide spending caps.
-- The edge function checks this before making any AI call.
-- Only admins (or service_role) can modify these values.
-- ────────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.ai_spending_config (
  id                       INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- Singleton row

  -- Maximum monthly spend in USD across all AI features.
  -- If total spend this month exceeds this, ALL AI calls are blocked.
  monthly_cap_usd          NUMERIC(8,2) NOT NULL DEFAULT 50.00,

  -- Daily cap in USD. A tighter safety net.
  daily_cap_usd            NUMERIC(8,2) NOT NULL DEFAULT 5.00,

  -- Per-user daily limits by tier.
  free_text_calls_per_day  INTEGER NOT NULL DEFAULT 5,
  free_photo_calls_per_day INTEGER NOT NULL DEFAULT 0,
  pro_text_calls_per_day   INTEGER NOT NULL DEFAULT 30,
  pro_photo_calls_per_day  INTEGER NOT NULL DEFAULT 5,
  premium_text_calls_per_day  INTEGER NOT NULL DEFAULT 50,
  premium_photo_calls_per_day INTEGER NOT NULL DEFAULT 15,

  -- Emergency kill switch. If TRUE, all AI calls are blocked immediately.
  kill_switch              BOOLEAN NOT NULL DEFAULT FALSE,

  -- Notification thresholds (percentage of monthly cap).
  -- When spending reaches these %, an alert is triggered.
  alert_threshold_pct_1    INTEGER NOT NULL DEFAULT 50,
  alert_threshold_pct_2    INTEGER NOT NULL DEFAULT 80,
  alert_threshold_pct_3    INTEGER NOT NULL DEFAULT 95,

  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert the default configuration row.
INSERT INTO public.ai_spending_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Trigger to auto-update updated_at.
DROP TRIGGER IF EXISTS trigger_asc_updated_at ON public.ai_spending_config;
CREATE TRIGGER trigger_asc_updated_at
  BEFORE UPDATE ON public.ai_spending_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS: Only admins can read/update the config.
ALTER TABLE public.ai_spending_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage AI spending config" ON public.ai_spending_config;
CREATE POLICY "Admins can manage AI spending config"
  ON public.ai_spending_config
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Service role (edge functions) also needs to read this table.
-- service_role bypasses RLS by default, so no policy needed.


-- ─── 5. HELPER FUNCTIONS ────────────────────────────────────────────────────

-- Function: Get total AI spend for the current month.
-- Called by edge functions to check against monthly_cap_usd.
CREATE OR REPLACE FUNCTION public.get_ai_spend_current_month()
RETURNS NUMERIC AS $$
  SELECT COALESCE(SUM(estimated_cost), 0)
  FROM public.ai_usage_log
  WHERE cache_hit = FALSE
    AND created_at >= date_trunc('month', NOW())
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Function: Get total AI spend for today.
-- Called by edge functions to check against daily_cap_usd.
CREATE OR REPLACE FUNCTION public.get_ai_spend_today()
RETURNS NUMERIC AS $$
  SELECT COALESCE(SUM(estimated_cost), 0)
  FROM public.ai_usage_log
  WHERE cache_hit = FALSE
    AND created_at >= date_trunc('day', NOW())
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Function: Increment cache hit count atomically.
CREATE OR REPLACE FUNCTION public.increment_cache_hit(p_cache_id UUID)
RETURNS VOID AS $$
  UPDATE public.food_nutrition_cache
  SET hit_count = hit_count + 1
  WHERE id = p_cache_id
$$ LANGUAGE sql VOLATILE SECURITY DEFINER;


-- ============================================================================
-- DONE — Migration 013: AI Nutrition Feature
-- ============================================================================
