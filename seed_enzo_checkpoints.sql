-- ============================================================
-- SEED: Enzo's measurement checkpoints (inbox@enzosoler.com)
-- ============================================================
-- Run this in the Supabase SQL Editor.
-- Resolves user ID automatically from auth.users by email.
-- ON CONFLICT DO UPDATE — safe to re-run, will overwrite existing rows.
-- All composition columns are from public.measurements as defined in
-- fix_measurements_columns.sql and measurementModel.js (storageKey).
-- ============================================================

DO $$
DECLARE
  uid uuid;
BEGIN
  SELECT id INTO uid FROM auth.users WHERE email = 'inbox@enzosoler.com';

  IF uid IS NULL THEN
    RAISE EXCEPTION 'User inbox@enzosoler.com not found in auth.users';
  END IF;

  -- ──────────────────────────────────────────────
  -- 2025-10-20
  -- ──────────────────────────────────────────────
  INSERT INTO public.measurements (
    user_id, date,
    weight, body_fat, waist,
    neck, shoulders, chest,
    left_bicep, right_bicep, left_forearm, right_forearm,
    abdomen, scapular,
    left_thigh, right_thigh, left_calf, right_calf, hips,
    fat_mass, total_body_water, hydration_index, water_in_lean_mass,
    lean_mass, lean_mass_percent, muscle_fat_ratio,
    muscle_mass, muscle_mass_percent,
    intracellular_water, intracellular_water_percent, extracellular_water,
    bmi, age, bmr, phase_angle, cellular_age,
    source
  ) VALUES (
    uid, '2025-10-20',
    182.00, 40.40, 151.0,
    NULL, NULL, 149.0,
    50.5, 50.0, 32.0, 32.0,
    170.0, NULL,
    86.0, 86.0, 50.0, 50.0, 160.0,
    73.6, 79.0, 5.4, 72.80,
    108.40, 59.60, 0.6,
    47, 25.90,
    44.7, 56.6, 34.3,
    53.8, 27, 3094, 9.3, 21,
    'device_import'
  )
  ON CONFLICT (user_id, date) DO UPDATE SET
    weight                   = EXCLUDED.weight,
    body_fat                 = EXCLUDED.body_fat,
    waist                    = EXCLUDED.waist,
    neck                     = EXCLUDED.neck,
    shoulders                = EXCLUDED.shoulders,
    chest                    = EXCLUDED.chest,
    left_bicep               = EXCLUDED.left_bicep,
    right_bicep              = EXCLUDED.right_bicep,
    left_forearm             = EXCLUDED.left_forearm,
    right_forearm            = EXCLUDED.right_forearm,
    abdomen                  = EXCLUDED.abdomen,
    scapular                 = EXCLUDED.scapular,
    left_thigh               = EXCLUDED.left_thigh,
    right_thigh              = EXCLUDED.right_thigh,
    left_calf                = EXCLUDED.left_calf,
    right_calf               = EXCLUDED.right_calf,
    hips                     = EXCLUDED.hips,
    fat_mass                 = EXCLUDED.fat_mass,
    total_body_water         = EXCLUDED.total_body_water,
    hydration_index          = EXCLUDED.hydration_index,
    water_in_lean_mass       = EXCLUDED.water_in_lean_mass,
    lean_mass                = EXCLUDED.lean_mass,
    lean_mass_percent        = EXCLUDED.lean_mass_percent,
    muscle_fat_ratio         = EXCLUDED.muscle_fat_ratio,
    muscle_mass              = EXCLUDED.muscle_mass,
    muscle_mass_percent      = EXCLUDED.muscle_mass_percent,
    intracellular_water      = EXCLUDED.intracellular_water,
    intracellular_water_percent = EXCLUDED.intracellular_water_percent,
    extracellular_water      = EXCLUDED.extracellular_water,
    bmi                      = EXCLUDED.bmi,
    age                      = EXCLUDED.age,
    bmr                      = EXCLUDED.bmr,
    phase_angle              = EXCLUDED.phase_angle,
    cellular_age             = EXCLUDED.cellular_age,
    source                   = EXCLUDED.source;

  -- ──────────────────────────────────────────────
  -- 2025-10-28
  -- ──────────────────────────────────────────────
  INSERT INTO public.measurements (
    user_id, date,
    weight, body_fat, waist,
    neck, shoulders, chest,
    left_bicep, right_bicep, left_forearm, right_forearm,
    abdomen, scapular,
    left_thigh, right_thigh, left_calf, right_calf, hips,
    fat_mass, total_body_water, hydration_index, water_in_lean_mass,
    lean_mass, lean_mass_percent, muscle_fat_ratio,
    muscle_mass, muscle_mass_percent,
    intracellular_water, intracellular_water_percent, extracellular_water,
    bmi, age, bmr, phase_angle, cellular_age,
    source
  ) VALUES (
    uid, '2025-10-28',
    182.50, 37.10, 147.0,
    50.0, 152.0, 141.0,
    52.0, 51.0, 33.0, 31.0,
    165.0, 134.5,
    86.0, 86.0, 51.5, 51.5, NULL,
    67.7, 83.8, 6.0, 73.00,
    114.80, 62.90, 0.8,
    51, 28.20,
    47.1, 56.2, 36.7,
    53.9, 27, 3235, 9.6, NULL,
    'device_import'
  )
  ON CONFLICT (user_id, date) DO UPDATE SET
    weight                   = EXCLUDED.weight,
    body_fat                 = EXCLUDED.body_fat,
    waist                    = EXCLUDED.waist,
    neck                     = EXCLUDED.neck,
    shoulders                = EXCLUDED.shoulders,
    chest                    = EXCLUDED.chest,
    left_bicep               = EXCLUDED.left_bicep,
    right_bicep              = EXCLUDED.right_bicep,
    left_forearm             = EXCLUDED.left_forearm,
    right_forearm            = EXCLUDED.right_forearm,
    abdomen                  = EXCLUDED.abdomen,
    scapular                 = EXCLUDED.scapular,
    left_thigh               = EXCLUDED.left_thigh,
    right_thigh              = EXCLUDED.right_thigh,
    left_calf                = EXCLUDED.left_calf,
    right_calf               = EXCLUDED.right_calf,
    hips                     = EXCLUDED.hips,
    fat_mass                 = EXCLUDED.fat_mass,
    total_body_water         = EXCLUDED.total_body_water,
    hydration_index          = EXCLUDED.hydration_index,
    water_in_lean_mass       = EXCLUDED.water_in_lean_mass,
    lean_mass                = EXCLUDED.lean_mass,
    lean_mass_percent        = EXCLUDED.lean_mass_percent,
    muscle_fat_ratio         = EXCLUDED.muscle_fat_ratio,
    muscle_mass              = EXCLUDED.muscle_mass,
    muscle_mass_percent      = EXCLUDED.muscle_mass_percent,
    intracellular_water      = EXCLUDED.intracellular_water,
    intracellular_water_percent = EXCLUDED.intracellular_water_percent,
    extracellular_water      = EXCLUDED.extracellular_water,
    bmi                      = EXCLUDED.bmi,
    age                      = EXCLUDED.age,
    bmr                      = EXCLUDED.bmr,
    phase_angle              = EXCLUDED.phase_angle,
    cellular_age             = EXCLUDED.cellular_age,
    source                   = EXCLUDED.source;

  -- ──────────────────────────────────────────────
  -- 2025-11-05
  -- ──────────────────────────────────────────────
  INSERT INTO public.measurements (
    user_id, date,
    weight, body_fat, waist,
    neck, shoulders, chest,
    left_bicep, right_bicep, left_forearm, right_forearm,
    abdomen, scapular,
    left_thigh, right_thigh, left_calf, right_calf, hips,
    fat_mass, total_body_water, hydration_index, water_in_lean_mass,
    lean_mass, lean_mass_percent, muscle_fat_ratio,
    muscle_mass, muscle_mass_percent,
    intracellular_water, intracellular_water_percent, extracellular_water,
    bmi, age, bmr, phase_angle, cellular_age,
    source
  ) VALUES (
    uid, '2025-11-05',
    182.40, 34.50, 144.0,
    49.0, 158.0, 145.0,
    52.0, 51.0, 33.0, 34.0,
    162.0, 131.5,
    86.0, 86.0, 51.5, 51.5, 149.5,
    62.9, 87.3, 6.4, 73.10,
    119.50, 65.50, 0.9,
    55, 29.90,
    48.7, 55.7, 38.6,
    53.3, 27, 3337, 9.1, NULL,
    'device_import'
  )
  ON CONFLICT (user_id, date) DO UPDATE SET
    weight                   = EXCLUDED.weight,
    body_fat                 = EXCLUDED.body_fat,
    waist                    = EXCLUDED.waist,
    neck                     = EXCLUDED.neck,
    shoulders                = EXCLUDED.shoulders,
    chest                    = EXCLUDED.chest,
    left_bicep               = EXCLUDED.left_bicep,
    right_bicep              = EXCLUDED.right_bicep,
    left_forearm             = EXCLUDED.left_forearm,
    right_forearm            = EXCLUDED.right_forearm,
    abdomen                  = EXCLUDED.abdomen,
    scapular                 = EXCLUDED.scapular,
    left_thigh               = EXCLUDED.left_thigh,
    right_thigh              = EXCLUDED.right_thigh,
    left_calf                = EXCLUDED.left_calf,
    right_calf               = EXCLUDED.right_calf,
    hips                     = EXCLUDED.hips,
    fat_mass                 = EXCLUDED.fat_mass,
    total_body_water         = EXCLUDED.total_body_water,
    hydration_index          = EXCLUDED.hydration_index,
    water_in_lean_mass       = EXCLUDED.water_in_lean_mass,
    lean_mass                = EXCLUDED.lean_mass,
    lean_mass_percent        = EXCLUDED.lean_mass_percent,
    muscle_fat_ratio         = EXCLUDED.muscle_fat_ratio,
    muscle_mass              = EXCLUDED.muscle_mass,
    muscle_mass_percent      = EXCLUDED.muscle_mass_percent,
    intracellular_water      = EXCLUDED.intracellular_water,
    intracellular_water_percent = EXCLUDED.intracellular_water_percent,
    extracellular_water      = EXCLUDED.extracellular_water,
    bmi                      = EXCLUDED.bmi,
    age                      = EXCLUDED.age,
    bmr                      = EXCLUDED.bmr,
    phase_angle              = EXCLUDED.phase_angle,
    cellular_age             = EXCLUDED.cellular_age,
    source                   = EXCLUDED.source;

  -- ──────────────────────────────────────────────
  -- 2025-11-12
  -- ──────────────────────────────────────────────
  INSERT INTO public.measurements (
    user_id, date,
    weight, body_fat, waist,
    neck, shoulders, chest,
    left_bicep, right_bicep, left_forearm, right_forearm,
    abdomen, scapular,
    left_thigh, right_thigh, left_calf, right_calf, hips,
    fat_mass, total_body_water, hydration_index, water_in_lean_mass,
    lean_mass, lean_mass_percent, muscle_fat_ratio,
    muscle_mass, muscle_mass_percent,
    intracellular_water, intracellular_water_percent, extracellular_water,
    bmi, age, bmr, phase_angle, cellular_age,
    source
  ) VALUES (
    uid, '2025-11-12',
    182.45, 32.60, 142.0,
    48.0, 151.0, 131.0,
    50.5, 53.0, 33.0, 34.0,
    159.0, 136.0,
    86.0, 86.0, 51.5, 51.5, 142.0,
    59.4, 90.0, 6.7, 73.10,
    123.10, 67.40, 1.0,
    57, 31.20,
    50.2, 55.7, 39.8,
    53.3, 27, 3415, 9.6, NULL,
    'device_import'
  )
  ON CONFLICT (user_id, date) DO UPDATE SET
    weight                   = EXCLUDED.weight,
    body_fat                 = EXCLUDED.body_fat,
    waist                    = EXCLUDED.waist,
    neck                     = EXCLUDED.neck,
    shoulders                = EXCLUDED.shoulders,
    chest                    = EXCLUDED.chest,
    left_bicep               = EXCLUDED.left_bicep,
    right_bicep              = EXCLUDED.right_bicep,
    left_forearm             = EXCLUDED.left_forearm,
    right_forearm            = EXCLUDED.right_forearm,
    abdomen                  = EXCLUDED.abdomen,
    scapular                 = EXCLUDED.scapular,
    left_thigh               = EXCLUDED.left_thigh,
    right_thigh              = EXCLUDED.right_thigh,
    left_calf                = EXCLUDED.left_calf,
    right_calf               = EXCLUDED.right_calf,
    hips                     = EXCLUDED.hips,
    fat_mass                 = EXCLUDED.fat_mass,
    total_body_water         = EXCLUDED.total_body_water,
    hydration_index          = EXCLUDED.hydration_index,
    water_in_lean_mass       = EXCLUDED.water_in_lean_mass,
    lean_mass                = EXCLUDED.lean_mass,
    lean_mass_percent        = EXCLUDED.lean_mass_percent,
    muscle_fat_ratio         = EXCLUDED.muscle_fat_ratio,
    muscle_mass              = EXCLUDED.muscle_mass,
    muscle_mass_percent      = EXCLUDED.muscle_mass_percent,
    intracellular_water      = EXCLUDED.intracellular_water,
    intracellular_water_percent = EXCLUDED.intracellular_water_percent,
    extracellular_water      = EXCLUDED.extracellular_water,
    bmi                      = EXCLUDED.bmi,
    age                      = EXCLUDED.age,
    bmr                      = EXCLUDED.bmr,
    phase_angle              = EXCLUDED.phase_angle,
    cellular_age             = EXCLUDED.cellular_age,
    source                   = EXCLUDED.source;

  -- ──────────────────────────────────────────────
  -- 2026-03-13  (body measurements only — no composition data)
  -- ──────────────────────────────────────────────
  INSERT INTO public.measurements (
    user_id, date,
    weight, body_fat, waist,
    neck, shoulders, chest,
    left_bicep, right_bicep, left_forearm, right_forearm,
    abdomen, scapular,
    left_thigh, right_thigh, left_calf, right_calf, hips,
    source
  ) VALUES (
    uid, '2026-03-13',
    174.60, NULL, 132.6,
    51.0, NULL, 145.0,
    48.0, 50.0, 33.5, 32.0,
    155.0, 132.6,
    82.0, 88.0, 52.0, 51.0, 144.0,
    'device_import'
  )
  ON CONFLICT (user_id, date) DO UPDATE SET
    weight        = EXCLUDED.weight,
    body_fat      = EXCLUDED.body_fat,
    waist         = EXCLUDED.waist,
    neck          = EXCLUDED.neck,
    shoulders     = EXCLUDED.shoulders,
    chest         = EXCLUDED.chest,
    left_bicep    = EXCLUDED.left_bicep,
    right_bicep   = EXCLUDED.right_bicep,
    left_forearm  = EXCLUDED.left_forearm,
    right_forearm = EXCLUDED.right_forearm,
    abdomen       = EXCLUDED.abdomen,
    scapular      = EXCLUDED.scapular,
    left_thigh    = EXCLUDED.left_thigh,
    right_thigh   = EXCLUDED.right_thigh,
    left_calf     = EXCLUDED.left_calf,
    right_calf    = EXCLUDED.right_calf,
    hips          = EXCLUDED.hips,
    source        = EXCLUDED.source;

  RAISE NOTICE 'Done — 5 checkpoints upserted for uid=%', uid;
END $$;
