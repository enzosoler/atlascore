-- ============================================================
-- Migration: lab_exams table
-- Stores structured lab exam panels with JSONB markers array
-- ============================================================

CREATE TABLE IF NOT EXISTS lab_exams (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  panel_name    text NOT NULL,
  exam_date     date NOT NULL DEFAULT CURRENT_DATE,
  markers       jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes         text,
  source_file   text,          -- original PDF/image URL if imported
  ai_insights   text,          -- optional AI-generated insights
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Index for fast user-scoped queries ordered by date
CREATE INDEX IF NOT EXISTS idx_lab_exams_user_date
  ON lab_exams (user_id, exam_date DESC);

-- RLS policies
ALTER TABLE lab_exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own lab exams"
  ON lab_exams FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own lab exams"
  ON lab_exams FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lab exams"
  ON lab_exams FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own lab exams"
  ON lab_exams FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_lab_exams_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_lab_exams_updated_at
  BEFORE UPDATE ON lab_exams
  FOR EACH ROW
  EXECUTE FUNCTION update_lab_exams_updated_at();

-- Storage bucket for lab exam files (PDF/images)
INSERT INTO storage.buckets (id, name, public)
VALUES ('lab-exams', 'lab-exams', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for lab-exams bucket
CREATE POLICY "Users can upload lab exam files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'lab-exams'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own lab exam files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'lab-exams'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own lab exam files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'lab-exams'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
