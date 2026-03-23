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
const MAX_COLUMN_FALLBACK_ATTEMPTS = 40

const TARGET_EMAIL = 'inbox+alex@enzosoler.com'
const TARGET_PASSWORD = 'demo123'
const TARGET_FULL_NAME = 'Alex Silva'
const SEED_NAME = 'alex_complete_6_weeks'
const SEED_VERSION = '2026-03-22'
const SEED_KEY_PREFIX = 'alex-demo'

const PROGRESS_PHOTO_ASSETS = {
  casual1: '/demo-progress-photos/progress_casual_1.jpg',
  casual2: '/demo-progress-photos/progress_casual_2.jpg',
  during: '/demo-progress-photos/progress_photo_2_during.jpg',
  after: '/demo-progress-photos/progress_photo_3_after.jpg',
  femaleBefore: '/demo-progress-photos/progress_photo_4_female_before.jpg',
  femaleAfter: '/demo-progress-photos/progress_photo_5_female_after.jpg',
}

const MEAL_HOURS = {
  breakfast: 8,
  lunch: 12,
  snack: 15,
  dinner: 20,
}

const PROTOCOL_ROWS = [
  {
    seed_key: `${SEED_KEY_PREFIX}-protocol-creatine`,
    substance_name: 'Creatine Monohydrate',
    name: 'Daily Creatine',
    category: 'supplement',
    dose: '5',
    unit: 'g',
    frequency: 'daily',
    schedule: 'with breakfast',
    start_date: '2026-02-09',
    end_date: null,
    active: true,
    notes: 'Used for training performance and recovery.',
  },
  {
    seed_key: `${SEED_KEY_PREFIX}-protocol-caffeine`,
    substance_name: 'Caffeine',
    name: 'Pre-Workout Caffeine',
    category: 'supplement',
    dose: '200',
    unit: 'mg',
    frequency: 'training days',
    schedule: '30 minutes before workout',
    start_date: '2026-02-09',
    end_date: null,
    active: true,
    notes: 'Avoid on low-sleep days.',
  },
]

const PROFILE_UI_STATE = {
  workouts_v2_create_plan: {
    plan_name: 'Upper / Lower Recomp',
    objective: 'Fat loss with muscle retention',
    sessions_per_week: 4,
    day_labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4'],
    exercise_defaults: {
      sets: 3,
      reps: '8-12',
      rest: 75,
    },
  },
  routine_form: {
    routine_name: 'Upper / Lower Recomp',
    description:
      '4-day split focused on consistency, moderate volume, and fat loss with muscle retention.',
    duration: 65,
    total_exercises: 21,
    days_of_week_toggles: ['monday', 'tuesday', 'thursday', 'friday'],
  },
  exercise_search_state: {
    exercise_search: 'incline press',
    manual_exercise_name: 'Machine Chest Press',
    muscle_filters: ['chest', 'back'],
    equipment_filters: ['dumbbell', 'machine', 'cable'],
  },
  nutrition_daily_goal_editor: {
    calories: 2350,
    protein: 180,
    carbs: 230,
    fat: 75,
  },
}

const PROFILE_DATA = {
  phone: '+55 11 91234-5678',
  age: 29,
  height: 178,
  current_weight: 81.9,
  target_weight: 78.0,
  calories_target: 2350,
  protein_target: 180,
  carbs_target: 230,
  fat_target: 75,
  water_target: 3.2,
  training_goal: 'Lose fat while maintaining muscle and improving consistency',
  goal_chips: ['fat_loss', 'muscle_gain', 'better_energy'],
  hear_about_us_chips: ['instagram'],
  first_checkpoint_weight: 84.2,
  body_fat_percent: 20.4,
  waist: 93.0,
  path_choice: 'body_recomposition',
  locale: 'en-US',
  seed_meta: {
    seed_name: SEED_NAME,
    seed_version: SEED_VERSION,
    seed_key_prefix: SEED_KEY_PREFIX,
  },
  atlas_ai: {
    chat_prompt:
      'Review my last 2 weeks of workouts, check-ins, and nutrition, then tell me where I am doing well and what should improve next.',
  },
  weekly_checkins: [
    {
      date: '2026-02-15',
      energy: 4,
      mood: 4,
      sleep_hours: 7.1,
      quick_note: 'Strong first week back.',
    },
    {
      date: '2026-02-22',
      energy: 4,
      mood: 3,
      sleep_hours: 7.0,
      quick_note: 'Kept consistency even with one social meal.',
    },
    {
      date: '2026-03-01',
      energy: 4,
      mood: 4,
      sleep_hours: 7.2,
      quick_note: 'Waist down and training stable.',
    },
    {
      date: '2026-03-08',
      energy: 4,
      mood: 4,
      sleep_hours: 7.4,
      quick_note: 'Recovery better this week.',
    },
    {
      date: '2026-03-15',
      energy: 4,
      mood: 4,
      sleep_hours: 7.1,
      quick_note: 'Leaner look, hunger manageable.',
    },
    {
      date: '2026-03-22',
      energy: 4,
      mood: 4,
      sleep_hours: 7.4,
      quick_note: 'Finished six-week block strong.',
    },
  ],
  demo_lab_exams: [
    {
      date: '2026-02-18',
      panel_name: 'Basic Blood Panel',
      markers: [
        { name: 'Glucose', value: 92, unit: 'mg/dL' },
        { name: 'Total Cholesterol', value: 178, unit: 'mg/dL' },
        { name: 'HDL', value: 52, unit: 'mg/dL' },
        { name: 'LDL', value: 109, unit: 'mg/dL' },
        { name: 'Triglycerides', value: 96, unit: 'mg/dL' },
        { name: 'Testosterone', value: 548, unit: 'ng/dL' },
      ],
      notes: 'Routine check during cut.',
    },
  ],
  ui_state: PROFILE_UI_STATE,
}

const MEASUREMENT_ROWS = [
  {
    seed_key: `${SEED_KEY_PREFIX}-measurement-2026-02-09`,
    date: '2026-02-09',
    weight: 84.2,
    age: 29,
    height: 178,
    waist: 93.0,
    body_fat: 20.4,
    neck: 38.5,
    shoulders: 121.0,
    chest: 104.0,
    left_bicep: 35.0,
    right_bicep: 35.4,
    left_forearm: 29.2,
    right_forearm: 29.4,
    abdomen: 95.0,
    scapular: 18.0,
    left_thigh: 58.4,
    right_thigh: 58.8,
    left_calf: 37.1,
    right_calf: 37.3,
    hips: 99.0,
    fat_mass: 17.2,
    total_body_water: 49.6,
    hydration_index: 58.9,
    water_in_lean_mass: 73.8,
    lean_mass: 67.0,
    lean_mass_percent: 79.6,
    muscle_fat_ratio: 3.9,
    muscle_mass: 35.2,
    muscle_mass_percent: 41.8,
    intracellular_water: 30.3,
    intracellular_water_percent: 61.1,
    extracellular_water: 19.3,
    bmi: 26.6,
    bmr: 1818,
    phase_angle: 6.2,
    cellular_age: 28,
    source: 'manual',
    context_notes: 'Starting point after a few inconsistent weeks.',
  },
  {
    seed_key: `${SEED_KEY_PREFIX}-measurement-2026-02-16`,
    date: '2026-02-16',
    weight: 83.7,
    age: 29,
    height: 178,
    waist: 92.3,
    body_fat: 20.0,
    neck: 38.5,
    shoulders: 121.1,
    chest: 104.0,
    left_bicep: 35.1,
    right_bicep: 35.4,
    left_forearm: 29.2,
    right_forearm: 29.4,
    abdomen: 94.4,
    scapular: 17.8,
    left_thigh: 58.3,
    right_thigh: 58.6,
    left_calf: 37.1,
    right_calf: 37.2,
    hips: 98.7,
    fat_mass: 16.7,
    total_body_water: 49.9,
    hydration_index: 59.6,
    water_in_lean_mass: 74.0,
    lean_mass: 67.0,
    lean_mass_percent: 80.0,
    muscle_fat_ratio: 4.0,
    muscle_mass: 35.3,
    muscle_mass_percent: 42.2,
    intracellular_water: 30.5,
    intracellular_water_percent: 61.1,
    extracellular_water: 19.4,
    bmi: 26.4,
    bmr: 1816,
    phase_angle: 6.3,
    cellular_age: 28,
    source: 'manual',
    context_notes: 'Good first week, hunger manageable.',
  },
  {
    seed_key: `${SEED_KEY_PREFIX}-measurement-2026-02-23`,
    date: '2026-02-23',
    weight: 83.1,
    age: 29,
    height: 178,
    waist: 91.6,
    body_fat: 19.6,
    neck: 38.4,
    shoulders: 121.2,
    chest: 104.1,
    left_bicep: 35.1,
    right_bicep: 35.5,
    left_forearm: 29.3,
    right_forearm: 29.5,
    abdomen: 93.9,
    scapular: 17.5,
    left_thigh: 58.3,
    right_thigh: 58.5,
    left_calf: 37.0,
    right_calf: 37.2,
    hips: 98.3,
    fat_mass: 16.3,
    total_body_water: 50.1,
    hydration_index: 60.3,
    water_in_lean_mass: 74.2,
    lean_mass: 66.8,
    lean_mass_percent: 80.4,
    muscle_fat_ratio: 4.1,
    muscle_mass: 35.4,
    muscle_mass_percent: 42.6,
    intracellular_water: 30.7,
    intracellular_water_percent: 61.3,
    extracellular_water: 19.4,
    bmi: 26.2,
    bmr: 1812,
    phase_angle: 6.4,
    cellular_age: 27,
    source: 'manual',
    context_notes: 'Weight trending down while strength stays stable.',
  },
  {
    seed_key: `${SEED_KEY_PREFIX}-measurement-2026-03-02`,
    date: '2026-03-02',
    weight: 82.8,
    age: 29,
    height: 178,
    waist: 91.0,
    body_fat: 19.3,
    neck: 38.4,
    shoulders: 121.2,
    chest: 104.1,
    left_bicep: 35.2,
    right_bicep: 35.5,
    left_forearm: 29.3,
    right_forearm: 29.5,
    abdomen: 93.2,
    scapular: 17.2,
    left_thigh: 58.2,
    right_thigh: 58.4,
    left_calf: 37.0,
    right_calf: 37.1,
    hips: 98.0,
    fat_mass: 16.0,
    total_body_water: 50.3,
    hydration_index: 60.7,
    water_in_lean_mass: 74.4,
    lean_mass: 66.8,
    lean_mass_percent: 80.7,
    muscle_fat_ratio: 4.2,
    muscle_mass: 35.5,
    muscle_mass_percent: 42.9,
    intracellular_water: 30.9,
    intracellular_water_percent: 61.4,
    extracellular_water: 19.4,
    bmi: 26.1,
    bmr: 1810,
    phase_angle: 6.4,
    cellular_age: 27,
    source: 'manual',
    context_notes: 'Sleep improved and waist visibly down.',
  },
  {
    seed_key: `${SEED_KEY_PREFIX}-measurement-2026-03-09`,
    date: '2026-03-09',
    weight: 82.3,
    age: 29,
    height: 178,
    waist: 90.2,
    body_fat: 18.9,
    neck: 38.3,
    shoulders: 121.3,
    chest: 104.0,
    left_bicep: 35.2,
    right_bicep: 35.6,
    left_forearm: 29.3,
    right_forearm: 29.5,
    abdomen: 92.5,
    scapular: 16.9,
    left_thigh: 58.1,
    right_thigh: 58.3,
    left_calf: 36.9,
    right_calf: 37.1,
    hips: 97.6,
    fat_mass: 15.6,
    total_body_water: 50.5,
    hydration_index: 61.4,
    water_in_lean_mass: 74.6,
    lean_mass: 66.7,
    lean_mass_percent: 81.1,
    muscle_fat_ratio: 4.3,
    muscle_mass: 35.6,
    muscle_mass_percent: 43.3,
    intracellular_water: 31.0,
    intracellular_water_percent: 61.5,
    extracellular_water: 19.5,
    bmi: 26.0,
    bmr: 1808,
    phase_angle: 6.5,
    cellular_age: 27,
    source: 'manual',
    context_notes: 'Visible progress around waist and lower abdomen.',
  },
  {
    seed_key: `${SEED_KEY_PREFIX}-measurement-2026-03-16`,
    date: '2026-03-16',
    weight: 81.9,
    age: 29,
    height: 178,
    waist: 89.7,
    body_fat: 18.6,
    neck: 38.2,
    shoulders: 121.3,
    chest: 104.0,
    left_bicep: 35.2,
    right_bicep: 35.5,
    left_forearm: 29.3,
    right_forearm: 29.5,
    abdomen: 91.9,
    scapular: 16.6,
    left_thigh: 58.0,
    right_thigh: 58.2,
    left_calf: 36.9,
    right_calf: 37.0,
    hips: 97.2,
    fat_mass: 15.2,
    total_body_water: 50.8,
    hydration_index: 62.0,
    water_in_lean_mass: 74.8,
    lean_mass: 66.7,
    lean_mass_percent: 81.4,
    muscle_fat_ratio: 4.4,
    muscle_mass: 35.6,
    muscle_mass_percent: 43.5,
    intracellular_water: 31.2,
    intracellular_water_percent: 61.6,
    extracellular_water: 19.6,
    bmi: 25.8,
    bmr: 1805,
    phase_angle: 6.6,
    cellular_age: 27,
    source: 'manual',
    context_notes: 'Leanest point so far, energy still good.',
  },
]

const CHECKIN_WEEK_TEMPLATE = [
  {
    date: '2026-03-16',
    mood: 4,
    energy: 4,
    sleep_hours: 7.2,
    hydration_liters: 3.1,
    notes: 'Final week started well.',
  },
  {
    date: '2026-03-17',
    mood: 5,
    energy: 5,
    sleep_hours: 7.7,
    hydration_liters: 3.2,
    notes: 'Productive day overall.',
  },
  {
    date: '2026-03-18',
    mood: 4,
    energy: 4,
    sleep_hours: 6.8,
    hydration_liters: 2.9,
    notes: 'Slight soreness, nothing major.',
  },
  {
    date: '2026-03-19',
    mood: 5,
    energy: 5,
    sleep_hours: 7.6,
    hydration_liters: 3.1,
    notes: 'Strong lower session.',
  },
  {
    date: '2026-03-20',
    mood: 4,
    energy: 4,
    sleep_hours: 7.0,
    hydration_liters: 3.0,
    notes: 'Hunger slightly up.',
  },
  {
    date: '2026-03-21',
    mood: 5,
    energy: 5,
    sleep_hours: 8.1,
    hydration_liters: 3.4,
    notes: 'Great recovery and mood.',
  },
  {
    date: '2026-03-22',
    mood: 4,
    energy: 4,
    sleep_hours: 7.5,
    hydration_liters: 3.2,
    notes: 'Six-week block complete.',
  },
]

const CHECKIN_WEEK_NOTES = [
  'Strong first week back.',
  'Kept consistency even with one social meal.',
  'Waist down and training stable.',
  'Recovery better this week.',
  'Leaner look, hunger manageable.',
  'Finished six-week block strong.',
]

const MEAL_WEEK_TEMPLATE = [
  {
    date: '2026-03-16',
    meals: [
      {
        slot: 'breakfast',
        amount_grams: 80,
        foods: [
          ['Oats', 304, 10, 54, 5],
          ['Whey Protein', 120, 24, 3, 2],
          ['Banana', 107, 1, 27, 0],
        ],
      },
      {
        slot: 'lunch',
        amount_grams: 180,
        foods: [
          ['Chicken Breast', 297, 55, 0, 6],
          ['Rice', 234, 4, 51, 1],
          ['Broccoli', 41, 3, 8, 0],
        ],
      },
      {
        slot: 'snack',
        amount_grams: 170,
        foods: [
          ['Greek Yogurt', 100, 17, 6, 0],
          ['Granola', 135, 3, 20, 5],
        ],
      },
      {
        slot: 'dinner',
        amount_grams: 170,
        foods: [
          ['Lean Ground Beef', 310, 35, 0, 18],
          ['Sweet Potato', 189, 4, 44, 0],
          ['Salad Mix', 20, 1, 3, 0],
        ],
      },
    ],
  },
  {
    date: '2026-03-17',
    meals: [
      {
        slot: 'breakfast',
        amount_grams: 150,
        foods: [
          ['Eggs', 210, 18, 1, 15],
          ['Whole Grain Toast', 160, 8, 28, 2],
          ['Orange', 66, 1, 16, 0],
        ],
      },
      {
        slot: 'lunch',
        amount_grams: 180,
        foods: [
          ['Turkey Breast', 250, 52, 0, 3],
          ['Pasta', 250, 8, 50, 2],
          ['Zucchini', 20, 1, 4, 0],
        ],
      },
      {
        slot: 'snack',
        amount_grams: 60,
        foods: [
          ['Protein Bar', 210, 20, 22, 7],
        ],
      },
      {
        slot: 'dinner',
        amount_grams: 170,
        foods: [
          ['Salmon', 340, 34, 0, 22],
          ['Potatoes', 215, 5, 48, 0],
          ['Asparagus', 20, 2, 4, 0],
        ],
      },
    ],
  },
  {
    date: '2026-03-18',
    meals: [
      {
        slot: 'breakfast',
        amount_grams: 200,
        foods: [
          ['Greek Yogurt', 118, 20, 8, 0],
          ['Berries', 50, 1, 12, 0],
          ['Honey', 46, 0, 12, 0],
        ],
      },
      {
        slot: 'lunch',
        amount_grams: 200,
        foods: [
          ['Chicken Breast', 330, 62, 0, 7],
          ['Rice', 195, 4, 42, 0],
          ['Beans', 127, 9, 23, 1],
        ],
      },
      {
        slot: 'snack',
        amount_grams: 180,
        foods: [
          ['Apple', 95, 0, 25, 0],
          ['Peanut Butter', 118, 5, 4, 10],
        ],
      },
      {
        slot: 'dinner',
        amount_grams: 160,
        foods: [
          ['Lean Ground Beef', 292, 33, 0, 17],
          ['Rice', 208, 4, 45, 0],
          ['Mixed Vegetables', 60, 3, 10, 1],
        ],
      },
    ],
  },
  {
    date: '2026-03-19',
    meals: [
      {
        slot: 'breakfast',
        amount_grams: 70,
        foods: [
          ['Oats', 266, 9, 47, 5],
          ['Whey Protein', 120, 24, 3, 2],
          ['Strawberries', 38, 1, 9, 0],
        ],
      },
      {
        slot: 'lunch',
        amount_grams: 180,
        foods: [
          ['Turkey Breast', 250, 52, 0, 3],
          ['Sweet Potato', 206, 4, 48, 0],
          ['Green Beans', 31, 2, 7, 0],
        ],
      },
      {
        slot: 'snack',
        amount_grams: 180,
        foods: [
          ['Cottage Cheese', 150, 24, 8, 2],
          ['Rice Cakes', 105, 2, 24, 0],
        ],
      },
      {
        slot: 'dinner',
        amount_grams: 160,
        foods: [
          ['Salmon', 320, 32, 0, 21],
          ['Rice', 182, 3, 39, 0],
          ['Salad Mix', 20, 1, 3, 0],
        ],
      },
    ],
  },
  {
    date: '2026-03-20',
    meals: [
      {
        slot: 'breakfast',
        amount_grams: 180,
        foods: [
          ['Eggs', 210, 18, 1, 15],
          ['Oats', 228, 8, 41, 4],
          ['Banana', 107, 1, 27, 0],
        ],
      },
      {
        slot: 'lunch',
        amount_grams: 190,
        foods: [
          ['Chicken Breast', 314, 58, 0, 6],
          ['Rice', 221, 4, 48, 0],
          ['Broccoli', 41, 3, 8, 0],
        ],
      },
      {
        slot: 'snack',
        amount_grams: 170,
        foods: [
          ['Greek Yogurt', 100, 17, 6, 0],
          ['Almonds', 116, 4, 4, 10],
        ],
      },
      {
        slot: 'dinner',
        amount_grams: 180,
        foods: [
          ['Lean Ground Beef', 328, 36, 0, 19],
          ['Potatoes', 189, 4, 42, 0],
          ['Mixed Vegetables', 60, 3, 10, 1],
        ],
      },
    ],
  },
  {
    date: '2026-03-21',
    meals: [
      {
        slot: 'breakfast',
        amount_grams: 180,
        foods: [
          ['Protein Pancakes', 340, 28, 35, 10],
          ['Blueberries', 45, 1, 11, 0],
        ],
      },
      {
        slot: 'lunch',
        amount_grams: 360,
        foods: [
          ['Sushi', 520, 32, 62, 14],
        ],
      },
      {
        slot: 'snack',
        amount_grams: 300,
        foods: [
          ['Protein Shake', 160, 30, 6, 2],
        ],
      },
      {
        slot: 'dinner',
        amount_grams: 180,
        foods: [
          ['Chicken Breast', 297, 55, 0, 6],
          ['Salad Mix', 30, 2, 5, 0],
          ['Olive Oil', 90, 0, 0, 10],
        ],
      },
    ],
  },
  {
    date: '2026-03-22',
    meals: [
      {
        slot: 'breakfast',
        amount_grams: 200,
        foods: [
          ['Greek Yogurt', 118, 20, 8, 0],
          ['Granola', 180, 4, 28, 6],
          ['Banana', 107, 1, 27, 0],
        ],
      },
      {
        slot: 'lunch',
        amount_grams: 170,
        foods: [
          ['Lean Ground Beef', 310, 35, 0, 18],
          ['Rice', 208, 4, 45, 0],
          ['Beans', 127, 9, 23, 1],
        ],
      },
      {
        slot: 'snack',
        amount_grams: 180,
        foods: [
          ['Apple', 95, 0, 25, 0],
          ['Whey Protein', 120, 24, 3, 2],
        ],
      },
      {
        slot: 'dinner',
        amount_grams: 160,
        foods: [
          ['Salmon', 320, 32, 0, 21],
          ['Potatoes', 189, 4, 42, 0],
          ['Asparagus', 20, 2, 4, 0],
        ],
      },
    ],
  },
]

const WORKOUT_PROGRESSIONS = [
  {
    key: 'upper_a',
    day_name: 'Upper A',
    day_index: 0,
    dates: ['2026-02-09', '2026-02-16', '2026-02-23', '2026-03-02', '2026-03-09', '2026-03-16'],
    notes: [
      'Strong first week back.',
      'Upper body still moving well.',
      'Progressing on the incline again.',
      'Upper A stayed crisp.',
      'Good press speed and control.',
      'Top week for upper A.',
    ],
    exercises: [
      {
        name: 'Incline Dumbbell Press',
        weights: [28, 28, 30, 30, 32, 32],
        reps: [10, 10, 9, 10, 8, 9],
        rir: [2, 1, 2, 1, 2, 1],
      },
      {
        name: 'Lat Pulldown',
        weights: [55, 57.5, 60, 60, 62.5, 62.5],
        reps: [12, 11, 10, 11, 10, 11],
        rir: [2, 2, 2, 1, 1, 1],
      },
      {
        name: 'Seated Cable Row',
        weights: [52, 54, 55, 57.5, 60, 60],
        reps: [11, 10, 10, 10, 9, 10],
        rir: [2, 2, 2, 2, 2, 1],
      },
    ],
  },
  {
    key: 'lower_a',
    day_name: 'Lower A',
    day_index: 1,
    dates: ['2026-02-10', '2026-02-17', '2026-02-24', '2026-03-03', '2026-03-10', '2026-03-17'],
    notes: [
      'Lower body felt strong.',
      'A bit sore but productive.',
      'Leg work stayed steady.',
      'Solid lower session.',
      'Strong quads and bracing.',
      'Best squat week of the block.',
    ],
    exercises: [
      {
        name: 'Back Squat',
        weights: [90, 92.5, 95, 97.5, 100, 100],
        reps: [8, 8, 8, 8, 7, 8],
        rir: [2, 2, 2, 2, 2, 1],
      },
      {
        name: 'Romanian Deadlift',
        weights: [80, 82.5, 85, 87.5, 90, 90],
        reps: [10, 9, 9, 8, 8, 9],
        rir: [2, 2, 2, 2, 2, 1],
      },
      {
        name: 'Leg Press',
        weights: [180, 190, 200, 205, 210, 215],
        reps: [12, 12, 11, 11, 10, 10],
        rir: [1, 1, 1, 1, 1, 1],
      },
    ],
  },
  {
    key: 'upper_b',
    day_name: 'Upper B',
    day_index: 2,
    dates: ['2026-02-12', '2026-02-19', '2026-02-26', '2026-03-05', '2026-03-12', '2026-03-19'],
    notes: [
      'Best workout of the week.',
      'Pressing felt better.',
      'Upper B still moving smoothly.',
      'Upper volume stable.',
      'Good bench speed.',
      'Strong upper pull work.',
    ],
    exercises: [
      {
        name: 'Flat Bench Press',
        weights: [75, 77.5, 80, 80, 82.5, 82.5],
        reps: [8, 8, 7, 8, 7, 8],
        rir: [2, 2, 2, 1, 2, 1],
      },
      {
        name: 'Chest Supported Row',
        weights: [60, 62.5, 65, 65, 67.5, 70],
        reps: [10, 10, 9, 10, 9, 9],
        rir: [2, 2, 2, 2, 2, 1],
      },
      {
        name: 'Pull Up',
        weights: [0, 0, 0, 0, 0, 0],
        reps: [8, 8, 9, 9, 10, 10],
        rir: [1, 1, 1, 1, 1, 1],
      },
    ],
  },
  {
    key: 'lower_b',
    day_name: 'Lower B',
    day_index: 3,
    dates: ['2026-02-13', '2026-02-20', '2026-02-27', '2026-03-06', '2026-03-13', '2026-03-20'],
    notes: [
      'Deadlift week started well.',
      'More steps today.',
      'Lower posterior chain was good.',
      'Work stress but session got done.',
      'Free meal but controlled.',
      'Final lower session felt strong.',
    ],
    exercises: [
      {
        name: 'Deadlift',
        weights: [120, 122.5, 125, 127.5, 130, 130],
        reps: [5, 5, 5, 5, 4, 5],
        rir: [2, 2, 2, 2, 2, 1],
      },
      {
        name: 'Bulgarian Split Squat',
        weights: [20, 22, 22, 24, 24, 26],
        reps: [10, 10, 10, 9, 10, 9],
        rir: [2, 2, 1, 2, 1, 1],
      },
      {
        name: 'Hip Thrust',
        weights: [100, 105, 110, 112.5, 115, 117.5],
        reps: [10, 10, 9, 9, 8, 8],
        rir: [2, 1, 1, 1, 1, 1],
      },
    ],
  },
]

const WORKOUT_PLAN = {
  seed_key: `${SEED_KEY_PREFIX}-manual-plan-1`,
  name: 'Upper / Lower Recomp',
  objective: 'Fat loss with muscle retention',
  frequency: 4,
  created_by_type: 'user',
  version: 1,
  start_date: '2026-02-09',
  notes:
    '4-day split focused on consistency, moderate volume, and fat loss with muscle retention.',
  days: [
    {
      label: 'Upper A',
      focus: 'Chest, back, shoulders',
      exercises: [
        { name: 'Incline Dumbbell Press', sets: 4, reps: '8-10', rest_seconds: 90 },
        { name: 'Lat Pulldown', sets: 4, reps: '10-12', rest_seconds: 75 },
        { name: 'Seated Cable Row', sets: 3, reps: '10-12', rest_seconds: 75 },
        { name: 'Machine Chest Press', sets: 3, reps: '10-12', rest_seconds: 75 },
        { name: 'Lateral Raise', sets: 3, reps: '12-15', rest_seconds: 60 },
      ],
    },
    {
      label: 'Lower A',
      focus: 'Quads and glutes',
      exercises: [
        { name: 'Back Squat', sets: 4, reps: '6-8', rest_seconds: 120 },
        { name: 'Romanian Deadlift', sets: 3, reps: '8-10', rest_seconds: 90 },
        { name: 'Leg Press', sets: 3, reps: '10-12', rest_seconds: 90 },
        { name: 'Leg Curl', sets: 3, reps: '12-15', rest_seconds: 60 },
        { name: 'Standing Calf Raise', sets: 4, reps: '12-15', rest_seconds: 45 },
      ],
    },
    {
      label: 'Upper B',
      focus: 'Back, chest, arms',
      exercises: [
        { name: 'Flat Bench Press', sets: 4, reps: '6-8', rest_seconds: 120 },
        { name: 'Chest Supported Row', sets: 4, reps: '8-10', rest_seconds: 90 },
        { name: 'Pull Up', sets: 3, reps: '6-10', rest_seconds: 90 },
        { name: 'Cable Fly', sets: 3, reps: '12-15', rest_seconds: 60 },
        { name: 'EZ Bar Curl', sets: 3, reps: '10-12', rest_seconds: 60 },
        { name: 'Triceps Rope Pushdown', sets: 3, reps: '10-12', rest_seconds: 60 },
      ],
    },
    {
      label: 'Lower B',
      focus: 'Posterior chain and legs',
      exercises: [
        { name: 'Deadlift', sets: 3, reps: '4-6', rest_seconds: 150 },
        { name: 'Bulgarian Split Squat', sets: 3, reps: '8-10', rest_seconds: 90 },
        { name: 'Hip Thrust', sets: 3, reps: '8-10', rest_seconds: 90 },
        { name: 'Leg Extension', sets: 3, reps: '12-15', rest_seconds: 60 },
        { name: 'Seated Calf Raise', sets: 4, reps: '12-15', rest_seconds: 45 },
      ],
    },
  ],
}

const PROGRESS_PHOTO_CHECKPOINTS = [
  {
    seed_key: `${SEED_KEY_PREFIX}-photo-2026-02-09`,
    checkpoint_date: '2026-02-09',
    photos: {
      front: PROGRESS_PHOTO_ASSETS.casual1,
      side: PROGRESS_PHOTO_ASSETS.casual2,
      back: PROGRESS_PHOTO_ASSETS.during,
      pose: PROGRESS_PHOTO_ASSETS.after,
    },
  },
  {
    seed_key: `${SEED_KEY_PREFIX}-photo-2026-02-23`,
    checkpoint_date: '2026-02-23',
    photos: {
      front: PROGRESS_PHOTO_ASSETS.casual2,
      side: PROGRESS_PHOTO_ASSETS.during,
      back: PROGRESS_PHOTO_ASSETS.after,
      pose: PROGRESS_PHOTO_ASSETS.femaleBefore,
    },
  },
  {
    seed_key: `${SEED_KEY_PREFIX}-photo-2026-03-09`,
    checkpoint_date: '2026-03-09',
    photos: {
      front: PROGRESS_PHOTO_ASSETS.during,
      side: PROGRESS_PHOTO_ASSETS.after,
      back: PROGRESS_PHOTO_ASSETS.femaleBefore,
      pose: PROGRESS_PHOTO_ASSETS.femaleAfter,
    },
  },
]

const createClientWithConfig = () => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      'Missing Supabase env vars. Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.'
    )
  }

  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
}

function addDays(date, deltaDays) {
  const result = new Date(`${date}T12:00:00.000Z`)
  result.setUTCDate(result.getUTCDate() + deltaDays)
  return result.toISOString().slice(0, 10)
}

function toTimestamp(date, hour) {
  const hh = String(hour).padStart(2, '0')
  return `${date}T${hh}:00:00.000Z`
}

function round1(value) {
  return Math.round(Number(value) * 10) / 10
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function missingColumnFromError(error) {
  const message = `${error?.message || ''} ${error?.details || ''}`
  const columnMatch =
    message.match(/column "([^"]+)" does not exist/i) ||
    message.match(/Could not find the '([^']+)' column/i) ||
    message.match(/record "([^"]+)" has no column/i)
  return columnMatch?.[1] || null
}

function isMissingTableError(error) {
  return (
    error?.code === '42P01' ||
    /relation .* does not exist/i.test(error?.message || '') ||
    /could not find the table/i.test(error?.message || '') ||
    /schema cache/i.test(error?.message || '')
  )
}

function isNoRowsError(error) {
  return error?.code === 'PGRST116' || /results contain 0 rows/i.test(error?.message || '')
}

function normalizeValue(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : value
}

async function runWithColumnFallback(action, payload, label) {
  let current = { ...payload }

  for (let attempt = 0; attempt < MAX_COLUMN_FALLBACK_ATTEMPTS; attempt += 1) {
    const { data, error } = await action(current)
    if (!error) {
      return data
    }

    const missingColumn = missingColumnFromError(error)
    if (missingColumn && Object.prototype.hasOwnProperty.call(current, missingColumn)) {
      console.warn(`Retrying ${label} without missing column: ${missingColumn}`)
      const next = { ...current }
      delete next[missingColumn]
      current = next
      continue
    }

    if (isMissingTableError(error)) {
      console.warn(`Skipping ${label}: table is missing in this database.`)
      return null
    }

    throw error
  }

  throw new Error(`Unable to persist ${label} after fallback retries.`)
}

async function findMatchingRows(supabase, table, filters) {
  let currentFilters = { ...filters }

  for (let attempt = 0; attempt < MAX_COLUMN_FALLBACK_ATTEMPTS; attempt += 1) {
    let query = supabase.from(table).select('id')

    for (const [key, value] of Object.entries(currentFilters)) {
      if (Array.isArray(value)) {
        query = query.in(key, value)
      } else if (value === null) {
        query = query.is(key, null)
      } else {
        query = query.eq(key, value)
      }
    }

    const { data, error } = await query.limit(20)
    if (!error) {
      return Array.isArray(data) ? data : []
    }

    const missingColumn = missingColumnFromError(error)
    if (missingColumn && Object.prototype.hasOwnProperty.call(currentFilters, missingColumn)) {
      const nextFilters = { ...currentFilters }
      delete nextFilters[missingColumn]
      currentFilters = nextFilters
      continue
    }

    if (isMissingTableError(error)) return null

    throw error
  }

  return []
}

async function deleteRowsById(supabase, table, ids) {
  if (!ids.length || DRY_RUN) return
  const { error } = await supabase.from(table).delete().in('id', ids)
  if (error && !isMissingTableError(error)) {
    throw error
  }
}

async function upsertByNaturalKey(supabase, table, filters, payload, label) {
  const matches = await findMatchingRows(supabase, table, filters)
  if (matches === null) return null

  const record = { ...filters, ...payload }

  if (matches.length > 0) {
    const keepId = matches[0].id
    const duplicateIds = matches.slice(1).map((row) => row.id)

    const updated = await runWithColumnFallback(
      (current) => supabase.from(table).update(current).eq('id', keepId).select('*').single(),
      record,
      `${table} update`
    )

    if (duplicateIds.length > 0) {
      console.warn(`Removing ${duplicateIds.length} duplicate row(s) from ${table} for ${label}.`)
      await deleteRowsById(supabase, table, duplicateIds)
    }

    return updated
  }

  return runWithColumnFallback(
    (current) => supabase.from(table).insert(current).select('*').single(),
    record,
    `${table} insert`
  )
}

function buildAuthMetadata() {
  return {
    full_name: TARGET_FULL_NAME,
    atlas_role: 'athlete',
    onboarding_completed: true,
    language: 'en',
    phone: PROFILE_DATA.phone,
  }
}

function buildProfileRow(userId, profileData = PROFILE_DATA) {
  return {
    id: userId,
    role: 'user',
    full_name: TARGET_FULL_NAME,
    language: 'en',
    profile_data: profileData,
  }
}

function normalizeProfileObject(value) {
  return value && typeof value === 'object' ? value : {}
}

function normalizeProfileArray(value) {
  return Array.isArray(value) ? value : []
}

function mergeDailyCheckins(existing, incoming) {
  const map = new Map()

  for (const entry of normalizeProfileArray(existing)) {
    if (!entry?.date) continue
    map.set(entry.date, entry)
  }

  for (const entry of normalizeProfileArray(incoming)) {
    if (!entry?.date || map.has(entry.date)) continue
    map.set(entry.date, entry)
  }

  return Array.from(map.values()).sort((a, b) => new Date(b.date) - new Date(a.date))
}

function mergeProgressPhotos(existing, incoming) {
  const map = new Map()

  const add = (entry) => {
    if (!entry?.date || !entry?.category) return
    const key = `${entry.date}-${entry.category}`
    if (map.has(key)) return
    map.set(key, {
      id: entry.id || key,
      date: entry.date,
      category: entry.category,
      photo_url: entry.photo_url,
    })
  }

  for (const entry of normalizeProfileArray(existing)) add(entry)
  for (const entry of normalizeProfileArray(incoming)) add(entry)

  return Array.from(map.values()).sort((a, b) => new Date(b.date) - new Date(a.date))
}

function buildProfileFallbackBlocks(checkins, photos, aiConversation) {
  const daily_checkins = checkins.map(({ user_id, ...rest }) => ({ ...rest }))
  const progress_photos = photos.map(({ user_id, ...rest }) => ({
    id: rest.id || `${rest.date}-${rest.category}`,
    date: rest.date,
    category: rest.category,
    photo_url: rest.photo_url,
  }))

  const ai_conversation = aiConversation
    ? {
        name: aiConversation.name,
        messages: aiConversation.messages,
      }
    : null

  return {
    daily_checkins,
    progress_photos,
    ai_conversation,
  }
}

function mergeProfileData(existingProfileData, fallbackBlocks) {
  const existing = normalizeProfileObject(existingProfileData)
  const fallback = normalizeProfileObject(fallbackBlocks)

  const merged = {
    ...PROFILE_DATA,
    ...existing,
  }

  merged.ui_state = {
    ...PROFILE_UI_STATE,
    ...normalizeProfileObject(existing.ui_state),
  }

  merged.seed_meta = {
    ...PROFILE_DATA.seed_meta,
    ...normalizeProfileObject(existing.seed_meta),
  }

  merged.atlas_ai = {
    ...PROFILE_DATA.atlas_ai,
    ...normalizeProfileObject(existing.atlas_ai),
  }

  merged.daily_checkins = mergeDailyCheckins(existing.daily_checkins, fallback.daily_checkins)
  merged.progress_photos = mergeProgressPhotos(existing.progress_photos, fallback.progress_photos)

  if (existing.ai_conversation) {
    merged.ai_conversation = existing.ai_conversation
  } else if (fallback.ai_conversation) {
    merged.ai_conversation = fallback.ai_conversation
  }

  return merged
}

function buildMeasurementRows(userId) {
  const allowedKeys = new Set([
    'date',
    'weight',
    'age',
    'height',
    'waist',
    'body_fat',
    'neck',
    'shoulders',
    'chest',
    'left_bicep',
    'right_bicep',
    'left_forearm',
    'right_forearm',
    'scapular',
    'left_thigh',
    'right_thigh',
    'left_calf',
    'right_calf',
    'hips',
    'source',
    'notes',
    'field_sources',
  ])

  return MEASUREMENT_ROWS.map((row) => {
    const filtered = { user_id: userId }

    for (const [key, value] of Object.entries(row)) {
      if (key === 'seed_key') continue
      if (key === 'context_notes') {
        filtered.notes = value
        continue
      }
      if (!allowedKeys.has(key)) continue
      filtered[key] = value
    }

    filtered.field_sources = {
      ...(filtered.field_sources || {}),
      seed_key: row.seed_key,
    }

    return filtered
  })
}

function createMealObject(slot, amount, foods) {
  return {
    slot,
    amount_grams: amount,
    foods: foods.map(([name, calories, protein, carbs, fat]) => ({
      name,
      calories,
      protein,
      carbs,
      fat,
    })),
  }
}

function swapProteinName(name, weekOffset, slot) {
  if (weekOffset === 0) return name

  const swaps = {
    'Chicken Breast': weekOffset % 2 === 0 ? 'Turkey Breast' : 'Chicken Breast',
    'Turkey Breast': weekOffset % 2 === 0 ? 'Chicken Breast' : 'Turkey Breast',
    'Lean Ground Beef': weekOffset % 3 === 0 ? 'Salmon' : 'Lean Ground Beef',
    'Salmon': weekOffset % 3 === 0 ? 'Lean Ground Beef' : 'Salmon',
    'Whey Protein': weekOffset % 2 === 0 ? 'Greek Yogurt' : 'Whey Protein',
    'Protein Shake': weekOffset % 2 === 0 ? 'Cottage Cheese' : 'Protein Shake',
  }

  const snackSwap = slot === 'snack' && weekOffset % 2 === 1
  if (snackSwap && name === 'Protein Bar') return 'Greek Yogurt'

  return swaps[name] || name
}

function buildFoodLogRows(userId) {
  const rows = []
  const weekOffsets = [0, 1, 2, 3, 4, 5]

  for (const weekOffset of weekOffsets) {
    const scale = clamp(1 + (weekOffset % 3 - 1) * 0.05, 0.9, 1.1)

    for (const day of MEAL_WEEK_TEMPLATE) {
      const shiftedDate = addDays(day.date, -7 * weekOffset)

      for (const meal of day.meals) {
        const adjustedFoods = meal.foods.map(([name, calories, protein, carbs, fat]) => [
          swapProteinName(name, weekOffset, meal.slot),
          calories,
          protein,
          carbs,
          fat,
        ])

        const totalCalories = adjustedFoods.reduce((sum, [, calories]) => sum + calories, 0)
        const totalProtein = adjustedFoods.reduce((sum, [, , protein]) => sum + protein, 0)
        const totalCarbs = adjustedFoods.reduce((sum, [, , , carbs]) => sum + carbs, 0)
        const totalFat = adjustedFoods.reduce((sum, [, , , , fat]) => sum + fat, 0)
        const foodNames = adjustedFoods.map(([name]) => name)
        const mealName = `${meal.slot.charAt(0).toUpperCase()}${meal.slot.slice(1)} - ${foodNames.join(', ')}`
        rows.push({
          user_id: userId,
          date: toTimestamp(shiftedDate, MEAL_HOURS[meal.slot] || 12),
          food_name: mealName,
          calories: round1(totalCalories * scale),
          protein: round1(totalProtein * scale),
          carbs: round1(totalCarbs * scale),
          fat: round1(totalFat * scale),
        })
      }
    }
  }

  return rows
}

function buildDietPlanMeals() {
  return MEAL_WEEK_TEMPLATE.map((day) => ({
    date: day.date,
    entries: day.meals.map((meal) => ({
      meal_type: meal.slot,
      food_search: meal.foods.map(([name]) => name).join(', '),
      amount_grams: meal.amount_grams,
      foods: meal.foods.map(([name, calories, protein, carbs, fat]) => ({
        name,
        kcal: calories,
        protein,
        carbs,
        fat,
      })),
    })),
  }))
}

function buildWorkoutPlanRows(userId) {
  return {
    user_id: userId,
    ...WORKOUT_PLAN,
  }
}

function buildWorkoutSessions(userId, planId) {
  const rows = []

  for (const day of WORKOUT_PROGRESSIONS) {
    for (let weekIndex = 0; weekIndex < day.dates.length; weekIndex += 1) {
      const date = day.dates[weekIndex]
      const exercises_completed = day.exercises.map((exercise) => {
        const weight = exercise.weights[weekIndex]
        const reps = exercise.reps[weekIndex]
        const rir = exercise.rir[weekIndex]

        return {
          name: exercise.name,
          target_sets: 1,
          target_reps: String(reps),
          sets_completed: [
            {
              set_number: 1,
              target_reps: String(reps),
              target_weight: weight,
              reps_actual: reps,
              load_actual: weight,
              rir_actual: rir,
            },
          ],
        }
      })

      const volumeLoad = Math.round(
        exercises_completed.reduce((sum, exercise) => {
          const set = exercise.sets_completed[0]
          return sum + (Number(set.load_actual) || 0) * (Number(set.reps_actual) || 0)
        }, 0)
      )

      rows.push({
        user_id: userId,
        plan_id: planId || null,
        plan_day_index: day.day_index,
        name: day.day_name,
        status: 'completed',
        completed_at: toTimestamp(date, day.day_index < 2 ? 18 : 19),
        volume_load: volumeLoad,
        duration_minutes: day.day_index < 2 ? 60 + weekIndex : 65 + weekIndex,
        exercises_completed,
        notes: day.notes[weekIndex],
      })
    }
  }

  return rows
}

function buildProgressPhotoRows(userId) {
  const checkpoints = [
    {
      ...PROGRESS_PHOTO_CHECKPOINTS[0],
      photos: {
        front: PROGRESS_PHOTO_ASSETS.casual1,
        side: PROGRESS_PHOTO_ASSETS.casual2,
        back: PROGRESS_PHOTO_ASSETS.during,
        pose: PROGRESS_PHOTO_ASSETS.after,
      },
    },
    {
      ...PROGRESS_PHOTO_CHECKPOINTS[1],
      photos: {
        front: PROGRESS_PHOTO_ASSETS.casual2,
        side: PROGRESS_PHOTO_ASSETS.during,
        back: PROGRESS_PHOTO_ASSETS.after,
        pose: PROGRESS_PHOTO_ASSETS.femaleBefore,
      },
    },
    {
      ...PROGRESS_PHOTO_CHECKPOINTS[2],
      photos: {
        front: PROGRESS_PHOTO_ASSETS.during,
        side: PROGRESS_PHOTO_ASSETS.after,
        back: PROGRESS_PHOTO_ASSETS.femaleBefore,
        pose: PROGRESS_PHOTO_ASSETS.femaleAfter,
      },
    },
  ]

  return checkpoints.flatMap((checkpoint) =>
    Object.entries(checkpoint.photos).map(([category, photoUrl]) => ({
      user_id: userId,
      date: checkpoint.checkpoint_date,
      category,
      photo_url: photoUrl,
    }))
  )
}

function buildCheckinRows(userId) {
  const rows = []

  for (let weekOffset = 0; weekOffset < 6; weekOffset += 1) {
    const weekNote = CHECKIN_WEEK_NOTES[weekOffset] || CHECKIN_WEEK_NOTES.at(-1)

    for (let dayIndex = 0; dayIndex < CHECKIN_WEEK_TEMPLATE.length; dayIndex += 1) {
      const entry = CHECKIN_WEEK_TEMPLATE[dayIndex]
      const date = addDays(entry.date, -7 * weekOffset)
      const sleepAdjustment = round1(entry.sleep_hours - weekOffset * 0.1 + (dayIndex % 2 === 0 ? 0 : 0.1))
      const hydrationAdjustment = round1(
        entry.hydration_liters - weekOffset * 0.05 + (dayIndex % 3 === 0 ? 0.1 : 0)
      )

      rows.push({
        user_id: userId,
        date,
        mood: clamp(entry.mood - (weekOffset > 3 && dayIndex === 2 ? 1 : 0), 1, 5),
        energy: clamp(entry.energy - (weekOffset > 4 && dayIndex === 4 ? 1 : 0), 1, 5),
        sleep_hours: sleepAdjustment,
        hydration_liters: hydrationAdjustment,
        notes: weekOffset === 0 ? entry.notes : `${weekNote} ${entry.notes}`,
      })
    }
  }

  return rows
}

function buildProtocols(userId) {
  return PROTOCOL_ROWS.map((row) => ({
    ...row,
    user_id: userId,
  }))
}

function buildDietPlanRow(userId) {
  return {
    user_id: userId,
    name: 'Recomp Nutrition Base',
    objective: 'High-protein, repeatable meal structure for fat loss with strong training performance.',
    total_calories: 2350,
    total_protein: 180,
    total_carbs: 230,
    total_fat: 75,
    meals: buildDietPlanMeals(),
    active: true,
    created_by_type: 'user',
    version: 1,
    start_date: '2026-02-09',
    notes: 'Keep weekends flexible but protein anchored.',
  }
}

function buildAiConversation(userId) {
  return {
    user_id: userId,
    name: 'Alex demo - Atlas AI',
    messages: [
      {
        role: 'user',
        content:
          'Review my last 2 weeks of workouts, check-ins, and nutrition, then tell me where I am doing well and what should improve next.',
      },
      {
        role: 'assistant',
        content:
          'Loaded the Alex demo seed. Training, nutrition, measurements, and recovery history are ready for deterministic insights.',
      },
    ],
  }
}

async function fetchExistingProfileData(supabase, userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('profile_data')
    .eq('id', userId)
    .single()

  if (error) {
    if (isNoRowsError(error) || isMissingTableError(error)) return {}
    throw error
  }

  return data?.profile_data || {}
}

async function ensureAuthUser(supabase) {
  const metadata = buildAuthMetadata()

  let users = []
  try {
    const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
    if (error) throw error
    users = data?.users || []
  } catch {
    const { data, error } = await supabase.auth.admin.listUsers()
    if (error) throw error
    users = data?.users || []
  }

  const existing = users.find((user) => normalizeValue(user.email) === normalizeValue(TARGET_EMAIL))

  if (existing) {
    console.log(`Found existing auth user: ${existing.id}`)
    try {
      const { data, error } = await supabase.auth.admin.updateUserById(existing.id, {
        password: TARGET_PASSWORD,
        email_confirm: true,
        user_metadata: metadata,
      })
      if (error) throw error
      return data?.user || existing
    } catch (error) {
      console.warn('Retrying auth update without email_confirm flag:', error?.message || error)
      const { data, error: retryError } = await supabase.auth.admin.updateUserById(existing.id, {
        password: TARGET_PASSWORD,
        user_metadata: metadata,
      })
      if (retryError) throw retryError
      return data?.user || existing
    }
  }

  console.log('Creating auth user...')
  const { data, error } = await supabase.auth.admin.createUser({
    email: TARGET_EMAIL,
    password: TARGET_PASSWORD,
    email_confirm: true,
    user_metadata: metadata,
  })

  if (error) throw error
  return data?.user
}

async function seedTable(supabase, table, rows, label, filtersForUniqueness = null) {
  if (!rows.length) return []

  const results = []
  for (const row of rows) {
    if (filtersForUniqueness) {
      const filters = filtersForUniqueness(row)
      const result = await upsertByNaturalKey(supabase, table, filters, row, label)
      if (result) results.push(result)
    } else {
      const result = await runWithColumnFallback(
        (current) => supabase.from(table).insert(current).select('*').single(),
        row,
        `${table} insert`
      )
      if (result) results.push(result)
    }
  }

  return results
}

async function main() {
  const supabase = createClientWithConfig()

  console.log(`Seed: ${SEED_NAME}`)
  console.log(`Target: ${TARGET_EMAIL}`)
  console.log(DRY_RUN ? 'Mode: dry run' : 'Mode: write')

  const authUser = await ensureAuthUser(supabase)
  const userId = authUser?.id

  if (!userId) {
    throw new Error('Could not resolve or create the target auth user.')
  }

  console.log(`Resolved user id: ${userId}`)

  const subscriptionRow = {
    user_id: userId,
    plan_code: 'pro',
    status: 'active',
    started_at: '2026-02-09',
    ends_at: '2026-04-09',
    source: 'manual',
    notes: 'Alex demo seed',
  }

  const measurements = buildMeasurementRows(userId)
  const checkins = buildCheckinRows(userId)
  const photos = buildProgressPhotoRows(userId)
  const workoutPlanRow = buildWorkoutPlanRows(userId)
  const dietPlanRow = buildDietPlanRow(userId)
  const aiConversation = buildAiConversation(userId)
  const protocols = buildProtocols(userId)
  const foodLogs = buildFoodLogRows(userId)
  const existingProfileData = await fetchExistingProfileData(supabase, userId)
  const fallbackBlocks = buildProfileFallbackBlocks(checkins, photos, aiConversation)
  const mergedProfileData = mergeProfileData(existingProfileData, fallbackBlocks)
  const profileRow = buildProfileRow(userId, mergedProfileData)

  const workoutPlanInsert = await upsertByNaturalKey(
    supabase,
    'workout_plans',
    { user_id: userId, name: workoutPlanRow.name },
    workoutPlanRow,
    'workout plan'
  )

  const workoutPlanId = workoutPlanInsert?.id || null
  const workouts = buildWorkoutSessions(userId, workoutPlanId)

  if (DRY_RUN) {
    console.log('\nDry run counts:')
    console.log(`profile: 1`)
    console.log(`subscription: 1`)
    console.log(`measurements: ${measurements.length}`)
    console.log(`daily_checkins: ${checkins.length}`)
    console.log(`progress_photos: ${photos.length}`)
    console.log(`workout_plans: 1`)
    console.log(`workouts: ${workouts.length}`)
    console.log(`diet_plans: 1`)
    console.log(`food_logs: ${foodLogs.length}`)
    console.log(`protocols: ${protocols.length}`)
    console.log(`ai_conversations: 1`)
    return
  }

  await upsertByNaturalKey(supabase, 'profiles', { id: userId }, profileRow, 'profile')
  await seedTable(
    supabase,
    'subscriptions',
    [subscriptionRow],
    'subscription',
    (row) => ({ user_id: row.user_id })
  )
  await seedTable(
    supabase,
    'measurements',
    measurements,
    'measurement',
    (row) => ({ user_id: row.user_id, date: row.date })
  )
  await seedTable(
    supabase,
    'daily_checkins',
    checkins,
    'checkin',
    (row) => ({ user_id: row.user_id, date: row.date })
  )
  await seedTable(
    supabase,
    'progress_photos',
    photos,
    'progress photo',
    (row) => ({ user_id: row.user_id, date: row.date, category: row.category })
  )
  await seedTable(
    supabase,
    'workouts',
    workouts,
    'workout',
    (row) => ({ user_id: row.user_id, completed_at: row.completed_at, name: row.name })
  )
  await seedTable(
    supabase,
    'diet_plans',
    [dietPlanRow],
    'diet plan',
    (row) => ({ user_id: row.user_id, name: row.name, start_date: row.start_date })
  )
  await seedTable(
    supabase,
    'food_logs',
    foodLogs,
    'food log',
    (row) => ({
      user_id: row.user_id,
      date: row.date,
      food_name: row.food_name,
    })
  )
  await seedTable(
    supabase,
    'protocols',
    protocols,
    'protocol',
    (row) => ({
      user_id: row.user_id,
      start_date: row.start_date,
      substance_name: row.substance_name,
      name: row.name,
    })
  )
  await seedTable(
    supabase,
    'ai_conversations',
    [aiConversation],
    'ai conversation',
    (row) => ({ user_id: row.user_id, name: row.name })
  )

  console.log('\nAlex demo seed complete.')
  console.log(`Auth user: ${authUser.email || TARGET_EMAIL}`)
  console.log(`Profile rows: 1`)
  console.log(`Subscriptions: 1`)
  console.log(`Measurements: ${measurements.length}`)
  console.log(`Daily check-ins: ${checkins.length}`)
  console.log(`Progress photos: ${photos.length}`)
  console.log(`Workout sessions: ${workouts.length}`)
  console.log(`Food logs: ${foodLogs.length}`)
  console.log(`Protocols: ${protocols.length}`)
  console.log(`AI conversations: 1`)
}

main().catch((error) => {
  console.error('\nAlex seed failed:')
  console.error(error?.message || error)
  process.exit(1)
})
