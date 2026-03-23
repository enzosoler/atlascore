-- ============================================================
-- Atlas Core — Training Profiles Table
-- Run this in Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.training_profiles (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Training structure
  days_per_week         integer NOT NULL DEFAULT 3,
  schedule              text[] NOT NULL DEFAULT '{}',
  routine               jsonb NOT NULL DEFAULT '{}',
  
  -- Level information
  stated_level_in_pdf   text,
  override_level_for_app text,
  
  -- Goals
  objective_text        text,
  
  -- Metadata
  external_seed_key     text,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  
  UNIQUE (user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS training_profiles_user_id_idx ON public.training_profiles (user_id);

-- RLS
ALTER TABLE public.training_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "training_profiles_select_own"
  ON public.training_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "training_profiles_insert_own"
  ON public.training_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "training_profiles_update_own"
  ON public.training_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "training_profiles_delete_own"
  ON public.training_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Updated at trigger
CREATE OR REPLACE FUNCTION public.set_training_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS training_profiles_set_updated_at ON public.training_profiles;

CREATE TRIGGER training_profiles_set_updated_at
  BEFORE UPDATE ON public.training_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_training_profiles_updated_at();
