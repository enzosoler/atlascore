-- ============================================================
-- SEED: Measurement data for a user
-- ============================================================
-- Replace 'YOUR_USER_ID_HERE' with your actual Supabase User ID (UUID).
-- You can find your ID in the Supabase Dashboard -> Authentication.

DO $$
DECLARE
  target_user_id uuid := 'YOUR_USER_ID_HERE'; -- <--- CHANGE THIS
BEGIN
  -- 2026-03-01
  INSERT INTO public.measurements (user_id, date, weight, body_fat, waist, muscle_mass, source, notes)
  VALUES (target_user_id, '2026-03-01', 84.5, 22.1, 95.0, 34.5, 'manual', 'Initial seed data - week 1')
  ON CONFLICT (user_id, date) DO NOTHING;

  -- 2026-03-08
  INSERT INTO public.measurements (user_id, date, weight, body_fat, waist, muscle_mass, source, notes)
  VALUES (target_user_id, '2026-03-08', 83.8, 21.8, 94.2, 34.6, 'manual', 'Initial seed data - week 2')
  ON CONFLICT (user_id, date) DO NOTHING;

  -- 2026-03-15
  INSERT INTO public.measurements (user_id, date, weight, body_fat, waist, muscle_mass, source, notes)
  VALUES (target_user_id, '2026-03-15', 83.2, 21.4, 93.5, 34.7, 'manual', 'Initial seed data - week 3')
  ON CONFLICT (user_id, date) DO NOTHING;

  -- 2026-03-22
  INSERT INTO public.measurements (user_id, date, weight, body_fat, waist, muscle_mass, source, notes)
  VALUES (target_user_id, '2026-03-22', 82.7, 21.0, 92.8, 34.8, 'manual', 'Initial seed data - week 4')
  ON CONFLICT (user_id, date) DO NOTHING;

  -- 2026-03-29
  INSERT INTO public.measurements (user_id, date, weight, body_fat, waist, muscle_mass, source, notes)
  VALUES (target_user_id, '2026-03-29', 82.1, 20.7, 92.1, 35.0, 'manual', 'Initial seed data - week 5')
  ON CONFLICT (user_id, date) DO NOTHING;
END $$;
