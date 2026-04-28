-- Add exercise_search_today counter to ai_usage_quotas for rate limiting
-- the ExerciseDB (RapidAPI) proxy endpoint.

ALTER TABLE public.ai_usage_quotas
  ADD COLUMN IF NOT EXISTS exercise_search_today INTEGER NOT NULL DEFAULT 0;
