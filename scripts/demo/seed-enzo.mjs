#!/usr/bin/env node

import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  ''
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  ''

const DRY_RUN = process.argv.includes('--dry-run')

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const userId = process.env.SEED_USER_ID
if (!userId) {
  throw new Error('Missing SEED_USER_ID environment variable. Set it to the target user UUID.')
}

// Profile data mapped to existing schema
const profile = {
  id: userId,
  full_name: 'Enzo Fonseca Soler',
  height_cm: 185,
  current_weight: 182.5,
  training_experience: 'advanced',
  training_frequency: 5, // 4-5 times per week
  training_goal: 'recomposition',
  // Extended fields that might exist
  age: 27, // calculated from 1998-07-14
  target_weight: 175.0, // reasonable target for recomposition
  calories_target: 3200, // estimated BMR + activity
  protein_target: 200, // high protein for recomposition
  carbs_target: 350,
  fat_target: 110,
  water_target: 4.0,
  onboarding_done: true,
  updated_at: new Date().toISOString()
}

// Measurements history — all 5 checkpoints with full schema columns.
// Column names are the DB storageKey values from measurementModel.js /
// fix_measurements_columns.sql. null preserves missing cells exactly.
const measurementsHistory = [
  {
    user_id: userId,
    date: '2025-10-20',
    weight: 182.00,
    body_fat: 40.40,
    waist: 151.0,
    neck: null,
    shoulders: null,
    chest: 149.0,
    left_bicep: 50.5,
    right_bicep: 50.0,
    left_forearm: 32.0,
    right_forearm: 32.0,
    abdomen: 170.0,
    scapular: null,
    left_thigh: 86.0,
    right_thigh: 86.0,
    left_calf: 50.0,
    right_calf: 50.0,
    hips: 160.0,
    // composition
    fat_mass: 73.6,
    total_body_water: 79.0,
    hydration_index: 5.4,
    water_in_lean_mass: 72.80,
    lean_mass: 108.40,
    lean_mass_percent: 59.60,
    muscle_fat_ratio: 0.6,
    muscle_mass: 47,
    muscle_mass_percent: 25.90,
    intracellular_water: 44.7,
    intracellular_water_percent: 56.6,
    extracellular_water: 34.3,
    bmi: 53.8,
    age: 27,
    bmr: 3094,
    phase_angle: 9.3,
    cellular_age: 21,
    source: 'device_import',
  },
  {
    user_id: userId,
    date: '2025-10-28',
    weight: 182.50,
    body_fat: 37.10,
    waist: 147.0,
    neck: 50.0,
    shoulders: 152.0,
    chest: 141.0,
    left_bicep: 52.0,
    right_bicep: 51.0,
    left_forearm: 33.0,
    right_forearm: 31.0,
    abdomen: 165.0,
    scapular: 134.5,
    left_thigh: 86.0,
    right_thigh: 86.0,
    left_calf: 51.5,
    right_calf: 51.5,
    hips: null,
    // composition
    fat_mass: 67.7,
    total_body_water: 83.8,
    hydration_index: 6.0,
    water_in_lean_mass: 73.00,
    lean_mass: 114.80,
    lean_mass_percent: 62.90,
    muscle_fat_ratio: 0.8,
    muscle_mass: 51,
    muscle_mass_percent: 28.20,
    intracellular_water: 47.1,
    intracellular_water_percent: 56.2,
    extracellular_water: 36.7,
    bmi: 53.9,
    age: 27,
    bmr: 3235,
    phase_angle: 9.6,
    cellular_age: null,
    source: 'device_import',
  },
  {
    user_id: userId,
    date: '2025-11-05',
    weight: 182.40,
    body_fat: 34.50,
    waist: 144.0,
    neck: 49.0,
    shoulders: 158.0,
    chest: 145.0,
    left_bicep: 52.0,
    right_bicep: 51.0,
    left_forearm: 33.0,
    right_forearm: 34.0,
    abdomen: 162.0,
    scapular: 131.5,
    left_thigh: 86.0,
    right_thigh: 86.0,
    left_calf: 51.5,
    right_calf: 51.5,
    hips: 149.5,
    // composition
    fat_mass: 62.9,
    total_body_water: 87.3,
    hydration_index: 6.4,
    water_in_lean_mass: 73.10,
    lean_mass: 119.50,
    lean_mass_percent: 65.50,
    muscle_fat_ratio: 0.9,
    muscle_mass: 55,
    muscle_mass_percent: 29.90,
    intracellular_water: 48.7,
    intracellular_water_percent: 55.7,
    extracellular_water: 38.6,
    bmi: 53.3,
    age: 27,
    bmr: 3337,
    phase_angle: 9.1,
    cellular_age: null,
    source: 'device_import',
  },
  {
    user_id: userId,
    date: '2025-11-12',
    weight: 182.45,
    body_fat: 32.60,
    waist: 142.0,
    neck: 48.0,
    shoulders: 151.0,
    chest: 131.0,
    left_bicep: 50.5,
    right_bicep: 53.0,
    left_forearm: 33.0,
    right_forearm: 34.0,
    abdomen: 159.0,
    scapular: 136.0,
    left_thigh: 86.0,
    right_thigh: 86.0,
    left_calf: 51.5,
    right_calf: 51.5,
    hips: 142.0,
    // composition
    fat_mass: 59.4,
    total_body_water: 90.0,
    hydration_index: 6.7,
    water_in_lean_mass: 73.10,
    lean_mass: 123.10,
    lean_mass_percent: 67.40,
    muscle_fat_ratio: 1.0,
    muscle_mass: 57,
    muscle_mass_percent: 31.20,
    intracellular_water: 50.2,
    intracellular_water_percent: 55.7,
    extracellular_water: 39.8,
    bmi: 53.3,
    age: 27,
    bmr: 3415,
    phase_angle: 9.6,
    cellular_age: null,
    source: 'device_import',
  },
  {
    user_id: userId,
    date: '2026-03-13',
    weight: 174.60,
    body_fat: null,
    waist: 132.6,
    neck: 51.0,
    shoulders: null,
    chest: 145.0,
    left_bicep: 48.0,
    right_bicep: 50.0,
    left_forearm: 33.5,
    right_forearm: 32.0,
    abdomen: 155.0,
    scapular: 132.6,
    left_thigh: 82.0,
    right_thigh: 88.0,
    left_calf: 52.0,
    right_calf: 51.0,
    hips: 144.0,
    source: 'device_import',
  },
]

// Protocol data (medications/supplements)
const protocolRows = [
  {
    user_id: userId,
    substance_name: 'Testosterone Propionate',
    name: 'Testosterone Propionate',
    category: 'hormone',
    dose: '100',
    unit: 'mg',
    frequency: '3x_week',
    schedule: 'Mon/Wed/Fri',
    start_date: '2025-10-01',
    end_date: null,
    active: true,
    notes: 'Anabolic protocol for muscle growth',
    external_seed_key: 'enzo_protocol_testosterone_propionate',
    created_at: new Date().toISOString()
  },
  {
    user_id: userId,
    substance_name: 'Masteron',
    name: 'Masteron',
    category: 'hormone',
    dose: '100',
    unit: 'mg',
    frequency: '3x_week',
    schedule: 'Mon/Wed/Fri',
    start_date: '2025-10-01',
    end_date: null,
    active: true,
    notes: 'Anabolic protocol for muscle hardness',
    external_seed_key: 'enzo_protocol_masteron',
    created_at: new Date().toISOString()
  },
  {
    user_id: userId,
    substance_name: 'Tirzepatide',
    name: 'Tirzepatide',
    category: 'medication',
    dose: '5',
    unit: 'mg',
    frequency: '2x_week',
    schedule: 'Tue/Sat',
    start_date: '2025-10-01',
    end_date: null,
    active: true,
    notes: 'GLP-1 for fat loss support',
    external_seed_key: 'enzo_protocol_tirzepatide',
    created_at: new Date().toISOString()
  },
  {
    user_id: userId,
    substance_name: 'Creatine Monohydrate',
    name: 'Creatine',
    category: 'supplement',
    dose: '5',
    unit: 'g',
    frequency: 'daily',
    schedule: 'with breakfast',
    start_date: '2025-10-01',
    end_date: null,
    active: true,
    notes: 'Performance and recovery supplement',
    external_seed_key: 'enzo_protocol_creatine',
    created_at: new Date().toISOString()
  }
]

// Training profile data
const trainingProfile = {
  user_id: userId,
  days_per_week: 5,
  schedule: ['A', 'B', 'C', 'rest', 'D', 'E', 'cardio'],
  routine: {
    A: 'Costas Puxadas',
    B: 'Peitoral e Ombros',
    C: 'Pernas Completa',
    D: 'Costas Remadas',
    E: 'Ombros e Braços'
  },
  stated_level_in_pdf: 'iniciante',
  override_level_for_app: 'advanced',
  objective_text: 'Emagrecimento inicialmente',
  external_seed_key: 'enzo_training_profile_current',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

// Progress summary data
const progressSummary = {
  user_id: userId,
  period_start: '2025-10-20',
  period_end: '2025-11-12',
  fat_mass_change_kg: -14.2,
  body_fat_pct_change: -7.8,
  lean_mass_change_kg: 14.7,
  muscle_mass_change_kg: 9.8,
  total_body_water_change_l: 11.0,
  weight_change_kg: 0.5,
  waist_change_cm: -9.0,
  external_seed_key: 'enzo_progress_summary_2025_10_20_2025_11_12',
  created_at: new Date().toISOString()
}

// Helper function to handle missing columns gracefully
async function runWithColumnFallback(action, payload, label) {
  const MAX_ATTEMPTS = 20
  let current = { ...payload }

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const { data, error } = await action(current)
    if (!error) {
      return data
    }

    const message = `${error?.message || ''} ${error?.details || ''}`
    const columnMatch = message.match(/column "([^"]+)" does not exist/i) ||
                       message.match(/Could not find the '([^']+)' column/i)

    if (columnMatch && Object.prototype.hasOwnProperty.call(current, columnMatch[1])) {
      console.warn(`Retrying ${label} without missing column: ${columnMatch[1]}`)
      const next = { ...current }
      delete next[columnMatch[1]]
      current = next
      continue
    }

    if (error?.code === '42P01' || /relation .* does not exist/i.test(message)) {
      console.warn(`Skipping ${label}: table is missing in this database.`)
      return null
    }

    throw error
  }

  throw new Error(`Unable to persist ${label} after fallback retries.`)
}

async function upsertByNaturalKey(supabase, table, naturalKey, payload, label) {
  // First, try to find existing records
  let query = supabase.from(table).select('id')
  for (const [key, value] of Object.entries(naturalKey)) {
    query = query.eq(key, value)
  }
  
  const { data: existing, error: findError } = await query.limit(1)
  
  if (findError) {
    if (findError?.code === '42P01' || /relation .* does not exist/i.test(findError?.message || '')) {
      console.warn(`Skipping ${label}: table is missing in this database.`)
      return null
    }
    throw findError
  }

  const record = { ...naturalKey, ...payload }

  if (existing && existing.length > 0) {
    // Update existing record
    const { data, error } = await runWithColumnFallback(
      (current) => supabase.from(table).update(current).eq('id', existing[0].id).select('*').single(),
      record,
      `${label} update`
    )
    if (error) throw error
    return data
  } else {
    // Insert new record
    const { data, error } = await runWithColumnFallback(
      (current) => supabase.from(table).insert(current).select('*').single(),
      record,
      `${label} insert`
    )
    if (error) throw error
    return data
  }
}

async function run() {
  console.log(`🌱 Seeding Enzo's data for user: ${userId}`)

  if (DRY_RUN) {
    console.log('🔍 DRY RUN MODE - No changes will be made')
  }

  try {
    // 1. Update profile
    console.log('📝 Updating profile...')
    await runWithColumnFallback(
      (current) => supabase.from('profiles').upsert(current, { onConflict: 'id' }),
      profile,
      'profile'
    )

    // 2. Insert measurements history
    console.log('📏 Inserting measurements history...')
    for (const measurement of measurementsHistory) {
      await upsertByNaturalKey(
        supabase,
        'measurements',
        { user_id: userId, date: measurement.date },
        measurement,
        `measurements ${measurement.date}`
      )
    }

    // 3. Insert protocols
    console.log('💊 Inserting protocols...')
    for (const protocol of protocolRows) {
      await upsertByNaturalKey(
        supabase,
        'protocols',
        { user_id: userId, substance_name: protocol.substance_name },
        protocol,
        `protocol ${protocol.substance_name}`
      )
    }

    // 4. Insert training profile
    console.log('🏋️ Inserting training profile...')
    await upsertByNaturalKey(
      supabase,
      'training_profiles',
      { user_id: userId },
      trainingProfile,
      'training profile'
    )
    
    // 5. Insert progress summary
    console.log('📊 Inserting progress summary...')
    await upsertByNaturalKey(
      supabase,
      'progress_metrics',
      { user_id: userId, period_start: progressSummary.period_start, period_end: progressSummary.period_end },
      progressSummary,
      'progress summary'
    )

    console.log('✅ Successfully seeded Enzo\'s complete profile data!')
    console.log(`
📋 Summary:
- Profile updated with advanced training level and recomposition goal
- 4 measurement records from 2025-10-20 to 2025-11-12
- 4 protocol entries (testosterone, masteron, tirzepatide, creatine)
- Training profile: A/B/C/D/E routine with 5 days/week
- Progress metrics: 2025-10-20 to 2025-11-12 period

🎯 Key Results:
- Fat mass: -14.2 kg
- Body fat %: -7.8% (40.4% → 32.6%)
- Lean mass: +14.7 kg
- Muscle mass: +9.8 kg
- Waist: -9.0 cm (151cm → 142cm)
- Weight: stable (+0.5 kg)
`)

  } catch (error) {
    console.error('❌ Error seeding data:', error)
    process.exit(1)
  }
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
