-- 1. Create lab_exams table
CREATE TABLE IF NOT EXISTS public.lab_exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    panel_name TEXT NOT NULL,
    exam_date DATE NOT NULL DEFAULT CURRENT_DATE,
    markers JSONB NOT NULL DEFAULT '[]'::jsonb,
    ai_insights TEXT,
    source_file TEXT, -- Storage path to the PDF/image
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.lab_exams ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
CREATE POLICY "lab_exams_select_own" ON public.lab_exams
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "lab_exams_insert_own" ON public.lab_exams
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "lab_exams_update_own" ON public.lab_exams
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "lab_exams_delete_own" ON public.lab_exams
    FOR DELETE USING (auth.uid() = user_id);

-- 4. Updated at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_lab_exams_updated_at ON public.lab_exams;
CREATE TRIGGER trg_lab_exams_updated_at
    BEFORE UPDATE ON public.lab_exams
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 5. Create Storage Bucket for lab exams
INSERT INTO storage.buckets (id, name, public)
VALUES ('lab-exams', 'lab-exams', false)
ON CONFLICT (id) DO NOTHING;

-- 6. Storage Policies
CREATE POLICY "lab_exams_storage_select_own" ON storage.objects
    FOR SELECT USING (bucket_id = 'lab-exams' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "lab_exams_storage_insert_own" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'lab-exams' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "lab_exams_storage_delete_own" ON storage.objects
    FOR DELETE USING (bucket_id = 'lab-exams' AND auth.uid()::text = (storage.foldername(name))[1]);
