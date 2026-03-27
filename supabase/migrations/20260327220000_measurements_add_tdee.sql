-- Add TDEE column to measurements for metabolic rate tracking
ALTER TABLE measurements
  ADD COLUMN IF NOT EXISTS tdee numeric(7, 2);
