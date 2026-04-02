-- ============================================================
-- Atlas Core — Progress Metrics Table
-- Run this in Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.progress_metrics (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Period
  period_start            date NOT NULL,
  period_end              date NOT NULL,
  
  -- Body composition changes
  fat_mass_change_kg      numeric(6, 2),
  body_fat_pct_change     numeric(5, 2),
  lean_mass_change_kg     numeric(6, 2),
  muscle_mass_change_kg   numeric(6, 2),
  total_body_water_change_l numeric(6, 2),
  
  -- Measurements changes
  weight_change_kg        numeric(6, 2),
  waist_change_cm         numeric(6, 2),
  
  -- Metadata
  external_seed_key       text,
  created_at              timestamptz NOT NULL DEFAULT now(),
  
  UNIQUE (user_id, period_start, period_end)
);

-- Indexes
CREATE INDEX IF NOT EXISTS progress_metrics_user_id_idx ON public.progress_metrics (user_id);
CREATE INDEX IF NOT EXISTS progress_metrics_period_idx ON public.progress_metrics (period_start, period_end);

-- RLS
ALTER TABLE public.progress_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "progress_metrics_select_own"
  ON public.progress_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "progress_metrics_insert_own"
  ON public.progress_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "progress_metrics_update_own"
  ON public.progress_metrics FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "progress_metrics_delete_own"
  ON public.progress_metrics FOR DELETE
  USING (auth.uid() = user_id);
