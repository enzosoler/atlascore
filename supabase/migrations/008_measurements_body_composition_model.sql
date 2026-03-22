-- ============================================================
-- Measurements - body composition model
-- Adds normalized age/height, composition metrics, provenance,
-- and update timestamps without removing legacy body-site columns.
-- ============================================================

ALTER TABLE public.measurements
  ADD COLUMN IF NOT EXISTS age numeric(4, 0),
  ADD COLUMN IF NOT EXISTS height numeric(6, 2),
  ADD COLUMN IF NOT EXISTS fat_mass numeric(6, 2),
  ADD COLUMN IF NOT EXISTS total_body_water numeric(6, 2),
  ADD COLUMN IF NOT EXISTS hydration_index numeric(6, 2),
  ADD COLUMN IF NOT EXISTS water_in_lean_mass numeric(6, 2),
  ADD COLUMN IF NOT EXISTS lean_mass numeric(6, 2),
  ADD COLUMN IF NOT EXISTS lean_mass_percent numeric(5, 2),
  ADD COLUMN IF NOT EXISTS muscle_fat_ratio numeric(6, 2),
  ADD COLUMN IF NOT EXISTS muscle_mass numeric(6, 2),
  ADD COLUMN IF NOT EXISTS muscle_mass_percent numeric(5, 2),
  ADD COLUMN IF NOT EXISTS intracellular_water numeric(6, 2),
  ADD COLUMN IF NOT EXISTS intracellular_water_percent numeric(5, 2),
  ADD COLUMN IF NOT EXISTS extracellular_water numeric(6, 2),
  ADD COLUMN IF NOT EXISTS bmi numeric(6, 2),
  ADD COLUMN IF NOT EXISTS bmr numeric(6, 2),
  ADD COLUMN IF NOT EXISTS phase_angle numeric(5, 2),
  ADD COLUMN IF NOT EXISTS cellular_age numeric(6, 2),
  ADD COLUMN IF NOT EXISTS source text,
  ADD COLUMN IF NOT EXISTS field_sources jsonb,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz;

UPDATE public.measurements
SET
  source = COALESCE(source, 'manual'),
  field_sources = COALESCE(field_sources, '{}'::jsonb),
  updated_at = COALESCE(updated_at, created_at, now())
WHERE source IS NULL
  OR field_sources IS NULL
  OR updated_at IS NULL;

ALTER TABLE public.measurements
  ALTER COLUMN source SET DEFAULT 'manual',
  ALTER COLUMN source SET NOT NULL,
  ALTER COLUMN field_sources SET DEFAULT '{}'::jsonb,
  ALTER COLUMN field_sources SET NOT NULL,
  ALTER COLUMN updated_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'measurements_source_check'
  ) THEN
    ALTER TABLE public.measurements
      ADD CONSTRAINT measurements_source_check
      CHECK (source IN ('manual', 'device_import', 'clinician_import', 'computed'));
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.set_measurements_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'measurements_set_updated_at'
  ) THEN
    CREATE TRIGGER measurements_set_updated_at
    BEFORE UPDATE ON public.measurements
    FOR EACH ROW
    EXECUTE FUNCTION public.set_measurements_updated_at();
  END IF;
END $$;
