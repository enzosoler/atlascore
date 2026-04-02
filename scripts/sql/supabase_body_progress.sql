-- ============================================================
-- Body Progress Tracking — tables + RLS
-- Atlas Core MVP
--
-- Run this in the Supabase SQL editor (or via supabase db push).
-- If you are using Base44 as your primary backend these tables
-- are managed by Base44 automatically. Apply this migration only
-- if you plan to query or enforce RLS from the Supabase side as
-- well (e.g. for coach visibility or export pipelines).
-- ============================================================

-- ── measurements ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS measurements (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  date        date NOT NULL,
  age         numeric(4, 0),          -- years
  height      numeric(6, 2),          -- cm
  weight      numeric(6, 2),          -- kg
  body_fat    numeric(5, 2),          -- %
  waist       numeric(6, 2),          -- cm
  neck        numeric(6, 2),          -- cm
  abdomen     numeric(6, 2),          -- cm
  shoulders   numeric(6, 2),          -- cm
  chest       numeric(6, 2),          -- cm
  arms        numeric(6, 2),          -- cm
  left_bicep  numeric(6, 2),          -- cm
  right_bicep numeric(6, 2),          -- cm
  left_forearm numeric(6, 2),         -- cm
  right_forearm numeric(6, 2),        -- cm
  scapular    numeric(6, 2),          -- cm
  thighs      numeric(6, 2),          -- cm
  left_thigh  numeric(6, 2),          -- cm
  right_thigh numeric(6, 2),          -- cm
  left_calf   numeric(6, 2),          -- cm
  right_calf  numeric(6, 2),          -- cm
  hips        numeric(6, 2),          -- cm
  fat_mass    numeric(6, 2),          -- kg
  total_body_water numeric(6, 2),     -- L
  hydration_index numeric(6, 2),      -- index
  water_in_lean_mass numeric(6, 2),   -- L/kg
  lean_mass   numeric(6, 2),          -- kg
  lean_mass_percent numeric(5, 2),    -- %
  muscle_fat_ratio numeric(6, 2),     -- ratio
  muscle_mass numeric(6, 2),          -- kg
  muscle_mass_percent numeric(5, 2),  -- %
  intracellular_water numeric(6, 2),  -- L
  intracellular_water_percent numeric(5, 2), -- %
  extracellular_water numeric(6, 2),  -- L
  bmi         numeric(6, 2),          -- kg/m²
  bmr         numeric(6, 2),          -- kcal/day
  phase_angle numeric(5, 2),          -- °
  cellular_age numeric(6, 2),         -- years
  source      text NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'device_import', 'clinician_import', 'computed')),
  field_sources jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at  timestamptz NOT NULL DEFAULT now(),
  notes       text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS measurements_user_date_idx ON measurements (user_id, date DESC);

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
    BEFORE UPDATE ON measurements
    FOR EACH ROW
    EXECUTE FUNCTION public.set_measurements_updated_at();
  END IF;
END $$;

-- Enable RLS
ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;

-- Users can only see their own measurements
CREATE POLICY "measurements: select own"
  ON measurements FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own measurements
CREATE POLICY "measurements: insert own"
  ON measurements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own measurements
CREATE POLICY "measurements: update own"
  ON measurements FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own measurements
CREATE POLICY "measurements: delete own"
  ON measurements FOR DELETE
  USING (auth.uid() = user_id);


-- ── progress_photos ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS progress_photos (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  date         date NOT NULL,                    -- checkpoint date (YYYY-MM-DD)
  category     text NOT NULL                     -- 'front' | 'side' | 'back' | 'pose'
               CHECK (category IN ('front', 'side', 'back', 'pose')),
  photo_url    text NOT NULL,                    -- URL returned by storage upload
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS progress_photos_user_date_idx ON progress_photos (user_id, date DESC);

-- Enable RLS
ALTER TABLE progress_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "progress_photos: select own"
  ON progress_photos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "progress_photos: insert own"
  ON progress_photos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "progress_photos: update own"
  ON progress_photos FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "progress_photos: delete own"
  ON progress_photos FOR DELETE
  USING (auth.uid() = user_id);


-- ── Supabase Storage bucket for progress photos ───────────────────
-- Run this block separately in the Supabase Storage UI or via the
-- management API if you are serving photos from Supabase Storage
-- instead of Base44's UploadFile integration.
--
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('progress-photos', 'progress-photos', false)
-- ON CONFLICT (id) DO NOTHING;
--
-- CREATE POLICY "progress_photos storage: owner read"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'progress-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
--
-- CREATE POLICY "progress_photos storage: owner upload"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'progress-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
--
-- CREATE POLICY "progress_photos storage: owner delete"
--   ON storage.objects FOR DELETE
--   USING (bucket_id = 'progress-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
-- ── end ───────────────────────────────────────────────────────────
