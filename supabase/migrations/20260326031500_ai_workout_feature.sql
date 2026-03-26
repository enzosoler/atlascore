-- ============================================================================
-- Atlas Core — AI Workout Feature: Cache & Feature Extension
-- Migration 014
-- ============================================================================

-- ─── 1. WORKOUT NUTRITION CACHE ──────────────────────────────────────────────
-- Stores AI-generated workout data for natural language exercise descriptions.
-- Acts as a shared cache: once a workout description is resolved by AI, all future
-- queries matching the same normalized text get instant results at zero AI cost.
-- ────────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.workout_nutrition_cache (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- The normalized version of the user's input (lowercased, trimmed, filler removed).
  -- This is the lookup key. UNIQUE index ensures no duplicate entries.
  normalized_query TEXT NOT NULL,

  -- The original user input that first created this cache entry (for debugging/auditing).
  original_query   TEXT NOT NULL,

  -- Exercises array stored as JSONB (contains sets, reps, weight, muscle_group, etc.)
  exercises        JSONB NOT NULL DEFAULT '[]',

  -- Estimated workout duration in minutes
  estimated_duration_minutes INTEGER,

  -- Any notes or additional context from the AI
  notes            TEXT,

  -- The AI model used to generate this entry (e.g., 'gpt-4.1-nano').
  model_used       TEXT NOT NULL DEFAULT 'gpt-4.1-nano',

  -- How many times this cache entry has been served (helps identify popular workouts).
  hit_count        INTEGER NOT NULL DEFAULT 0,

  -- Soft-delete / moderation flag. Admins can mark entries as invalid.
  is_verified      BOOLEAN NOT NULL DEFAULT FALSE,
  is_flagged       BOOLEAN NOT NULL DEFAULT FALSE,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique index on normalized_query for fast lookups and deduplication.
CREATE UNIQUE INDEX IF NOT EXISTS idx_wnc_normalized_query
  ON public.workout_nutrition_cache (normalized_query);

-- Index for admin dashboard: find unverified or flagged entries.
CREATE INDEX IF NOT EXISTS idx_wnc_flagged
  ON public.workout_nutrition_cache (is_flagged) WHERE is_flagged = TRUE;

-- Index for popularity ranking.
CREATE INDEX IF NOT EXISTS idx_wnc_hit_count
  ON public.workout_nutrition_cache (hit_count DESC);

-- Trigger to auto-update updated_at.
DROP TRIGGER IF EXISTS trigger_wnc_updated_at ON public.workout_nutrition_cache;
CREATE TRIGGER trigger_wnc_updated_at
  BEFORE UPDATE ON public.workout_nutrition_cache
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS: This is a shared/public cache. All authenticated users can read.
-- Only service_role (edge functions) can insert/update.
ALTER TABLE public.workout_nutrition_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read workout cache" ON public.workout_nutrition_cache;
CREATE POLICY "Anyone can read workout cache"
  ON public.workout_nutrition_cache
  FOR SELECT
  TO authenticated
  USING (TRUE);


-- ─── 2. EXTEND AI USAGE LOG FEATURES ──────────────────────────────────────────
-- Add 'workout_text' and 'workout_photo' to the feature enum.
-- Note: PostgreSQL doesn't allow directly modifying CHECK constraints,
-- so we need to recreate the column with the new constraint.
-- However, for simplicity, we'll just alter the check constraint if possible,
-- or document that existing rows will still work.
-- ────────────────────────────────────────────────────────────────────────────────

-- First, drop the existing check constraint
ALTER TABLE public.ai_usage_log DROP CONSTRAINT IF EXISTS ai_usage_log_feature_check;

-- Add the new check constraint with workout features included
ALTER TABLE public.ai_usage_log ADD CONSTRAINT ai_usage_log_feature_check
  CHECK (feature IN ('food_text', 'food_photo', 'chat', 'diet_plan', 'workout_plan', 'workout_text', 'workout_photo'));


-- ─── 3. HELPER FUNCTIONS ────────────────────────────────────────────────────

-- Function: Increment workout cache hit count atomically.
CREATE OR REPLACE FUNCTION public.increment_workout_cache_hit(p_cache_id UUID)
RETURNS VOID AS $$
  UPDATE public.workout_nutrition_cache
  SET hit_count = hit_count + 1
  WHERE id = p_cache_id
$$ LANGUAGE sql VOLATILE SECURITY DEFINER;


-- ============================================================================
-- DONE — Migration 014: AI Workout Feature
-- ============================================================================
