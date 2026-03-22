-- ============================================================
-- Measurements - additional body sites
-- Adds the more detailed circumference fields to measurements.
-- ============================================================

ALTER TABLE public.measurements
  ADD COLUMN IF NOT EXISTS abdomen numeric(6, 2),
  ADD COLUMN IF NOT EXISTS shoulders numeric(6, 2),
  ADD COLUMN IF NOT EXISTS left_bicep numeric(6, 2),
  ADD COLUMN IF NOT EXISTS right_bicep numeric(6, 2),
  ADD COLUMN IF NOT EXISTS left_forearm numeric(6, 2),
  ADD COLUMN IF NOT EXISTS right_forearm numeric(6, 2),
  ADD COLUMN IF NOT EXISTS scapular numeric(6, 2),
  ADD COLUMN IF NOT EXISTS left_thigh numeric(6, 2),
  ADD COLUMN IF NOT EXISTS right_thigh numeric(6, 2),
  ADD COLUMN IF NOT EXISTS left_calf numeric(6, 2),
  ADD COLUMN IF NOT EXISTS right_calf numeric(6, 2);
