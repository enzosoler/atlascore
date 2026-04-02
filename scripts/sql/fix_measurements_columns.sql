-- ============================================================
-- FIX: Missing columns in measurements table
-- ============================================================

-- Ensure the measurements table has all required body site and composition columns
-- that the frontend expects.
DO $$ 
BEGIN
  -- Manual body measurements (Baseline)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'measurements' AND column_name = 'age') THEN
    ALTER TABLE public.measurements ADD COLUMN age numeric(4, 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'measurements' AND column_name = 'height') THEN
    ALTER TABLE public.measurements ADD COLUMN height numeric(6, 2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'measurements' AND column_name = 'weight') THEN
    ALTER TABLE public.measurements ADD COLUMN weight numeric(6, 2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'measurements' AND column_name = 'body_fat') THEN
    ALTER TABLE public.measurements ADD COLUMN body_fat numeric(5, 2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'measurements' AND column_name = 'waist') THEN
    ALTER TABLE public.measurements ADD COLUMN waist numeric(6, 2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'measurements' AND column_name = 'neck') THEN
    ALTER TABLE public.measurements ADD COLUMN neck numeric(6, 2);
  END IF;

  -- Upper body
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'measurements' AND column_name = 'abdomen') THEN
    ALTER TABLE public.measurements ADD COLUMN abdomen numeric(6, 2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'measurements' AND column_name = 'shoulders') THEN
    ALTER TABLE public.measurements ADD COLUMN shoulders numeric(6, 2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'measurements' AND column_name = 'chest') THEN
    ALTER TABLE public.measurements ADD COLUMN chest numeric(6, 2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'measurements' AND column_name = 'left_bicep') THEN
    ALTER TABLE public.measurements ADD COLUMN left_bicep numeric(6, 2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'measurements' AND column_name = 'right_bicep') THEN
    ALTER TABLE public.measurements ADD COLUMN right_bicep numeric(6, 2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'measurements' AND column_name = 'left_forearm') THEN
    ALTER TABLE public.measurements ADD COLUMN left_forearm numeric(6, 2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'measurements' AND column_name = 'right_forearm') THEN
    ALTER TABLE public.measurements ADD COLUMN right_forearm numeric(6, 2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'measurements' AND column_name = 'scapular') THEN
    ALTER TABLE public.measurements ADD COLUMN scapular numeric(6, 2);
  END IF;

  -- Lower body
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'measurements' AND column_name = 'left_thigh') THEN
    ALTER TABLE public.measurements ADD COLUMN left_thigh numeric(6, 2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'measurements' AND column_name = 'right_thigh') THEN
    ALTER TABLE public.measurements ADD COLUMN right_thigh numeric(6, 2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'measurements' AND column_name = 'left_calf') THEN
    ALTER TABLE public.measurements ADD COLUMN left_calf numeric(6, 2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'measurements' AND column_name = 'right_calf') THEN
    ALTER TABLE public.measurements ADD COLUMN right_calf numeric(6, 2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'measurements' AND column_name = 'hips') THEN
    ALTER TABLE public.measurements ADD COLUMN hips numeric(6, 2);
  END IF;

  -- Composition
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'measurements' AND column_name = 'fat_mass') THEN
    ALTER TABLE public.measurements ADD COLUMN fat_mass numeric(6, 2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'measurements' AND column_name = 'total_body_water') THEN
    ALTER TABLE public.measurements ADD COLUMN total_body_water numeric(6, 2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'measurements' AND column_name = 'hydration_index') THEN
    ALTER TABLE public.measurements ADD COLUMN hydration_index numeric(6, 2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'measurements' AND column_name = 'water_in_lean_mass') THEN
    ALTER TABLE public.measurements ADD COLUMN water_in_lean_mass numeric(6, 2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'measurements' AND column_name = 'lean_mass') THEN
    ALTER TABLE public.measurements ADD COLUMN lean_mass numeric(6, 2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'measurements' AND column_name = 'lean_mass_percent') THEN
    ALTER TABLE public.measurements ADD COLUMN lean_mass_percent numeric(5, 2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'measurements' AND column_name = 'muscle_fat_ratio') THEN
    ALTER TABLE public.measurements ADD COLUMN muscle_fat_ratio numeric(6, 2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'measurements' AND column_name = 'muscle_mass') THEN
    ALTER TABLE public.measurements ADD COLUMN muscle_mass numeric(6, 2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'measurements' AND column_name = 'muscle_mass_percent') THEN
    ALTER TABLE public.measurements ADD COLUMN muscle_mass_percent numeric(5, 2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'measurements' AND column_name = 'intracellular_water') THEN
    ALTER TABLE public.measurements ADD COLUMN intracellular_water numeric(6, 2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'measurements' AND column_name = 'intracellular_water_percent') THEN
    ALTER TABLE public.measurements ADD COLUMN intracellular_water_percent numeric(5, 2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'measurements' AND column_name = 'extracellular_water') THEN
    ALTER TABLE public.measurements ADD COLUMN extracellular_water numeric(6, 2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'measurements' AND column_name = 'bmi') THEN
    ALTER TABLE public.measurements ADD COLUMN bmi numeric(6, 2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'measurements' AND column_name = 'bmr') THEN
    ALTER TABLE public.measurements ADD COLUMN bmr numeric(6, 2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'measurements' AND column_name = 'tdee') THEN
    ALTER TABLE public.measurements ADD COLUMN tdee numeric(7, 2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'measurements' AND column_name = 'phase_angle') THEN
    ALTER TABLE public.measurements ADD COLUMN phase_angle numeric(5, 2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'measurements' AND column_name = 'cellular_age') THEN
    ALTER TABLE public.measurements ADD COLUMN cellular_age numeric(6, 2);
  END IF;

  -- Metadata
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'measurements' AND column_name = 'source') THEN
    ALTER TABLE public.measurements ADD COLUMN source text NOT NULL DEFAULT 'manual';
    ALTER TABLE public.measurements ADD CONSTRAINT measurements_source_check CHECK (source IN ('manual', 'device_import', 'clinician_import', 'computed'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'measurements' AND column_name = 'field_sources') THEN
    ALTER TABLE public.measurements ADD COLUMN field_sources jsonb NOT NULL DEFAULT '{}'::jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'measurements' AND column_name = 'updated_at') THEN
    ALTER TABLE public.measurements ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
  END IF;
END $$;

-- Force PostgREST to reload the schema cache to recognize the new columns
NOTIFY pgrst, 'reload schema';
