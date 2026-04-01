-- Ensure bmr and tdee columns exist on measurements table
ALTER TABLE public.measurements
  ADD COLUMN IF NOT EXISTS bmr numeric(6, 2),
  ADD COLUMN IF NOT EXISTS tdee numeric(7, 2);
