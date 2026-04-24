ALTER TABLE public.lab_exams
  ADD COLUMN IF NOT EXISTS status TEXT,
  ADD COLUMN IF NOT EXISTS storage_path TEXT;

UPDATE public.lab_exams
SET
  status = CASE
    WHEN jsonb_array_length(COALESCE(markers, '[]'::jsonb)) > 0 THEN 'complete'
    ELSE 'pending'
  END,
  storage_path = COALESCE(storage_path, source_file)
WHERE status IS NULL
   OR storage_path IS NULL;

ALTER TABLE public.lab_exams
  ALTER COLUMN status SET DEFAULT 'pending';

UPDATE public.lab_exams
SET status = 'pending'
WHERE status IS NULL;

ALTER TABLE public.lab_exams
  ALTER COLUMN status SET NOT NULL;
