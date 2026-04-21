#!/usr/bin/env node

/**
 * seed-review.mjs
 * Generates 3 months of realistic demo data (Jan 1 2026 - Apr 1 2026)
 * for the Google Play review account.
 *
 * Usage:  node scripts/demo/seed-review.mjs
 * Re-runnable (idempotent): uses upsert / natural key matching.
 */

import { createClient } from '@supabase/supabase-js'

// ─── Config ────────────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://xrtqwdpczgdomqebmfkk.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const USER_ID = '13f976a2-006a-45b9-88c5-6c85f7ffc40a'
const USER_EMAIL = 'review@useatlascore.com'
const MAX_FALLBACK = 30

if (!SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required to run scripts/demo/seed-review.mjs')
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

// ─── Helpers ───────────────────────────────────────────────────────────────────

function rand(min, max) {
  return Math.random() * (max - min) + min
}
function randInt(min, max) {
  return Math.floor(rand(min, max + 1))
}
function round1(v) {
  return Math.round(v * 10) / 10
}
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}
function dateStr(d) {
  return d.toISOString().slice(0, 10)
}
function toTimestamp(dateString, hour, minute = 0) {
  return `${dateString}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00.000Z`
}

// Generate array of dates from start to end (inclusive)
function dateRange(startStr, endStr) {
  const dates = []
  const cur = new Date(`${startStr}T12:00:00Z`)
  const end = new Date(`${endStr}T12:00:00Z`)
  while (cur <= end) {
    dates.push(dateStr(cur))
    cur.setUTCDate(cur.getUTCDate() + 1)
  }
  return dates
}

// Seeded deterministic-ish noise for weight curve
function weightForDay(dayIndex, totalDays) {
  // Linear 85 -> 79 with daily noise +/- 0.4
  const base = 85 - (6 * dayIndex) / totalDays
  const noise = Math.sin(dayIndex * 1.7) * 0.3 + Math.cos(dayIndex * 0.9) * 0.15
  return round1(base + noise)
}
function bodyFatForDay(dayIndex, totalDays) {
  const base = 22 - (5 * dayIndex) / totalDays
  const noise = Math.sin(dayIndex * 2.1) * 0.2
  return round1(base + noise)
}

// ─── Column-fallback insert (handles missing columns gracefully) ───────────
function missingColFromErr(error) {
  const msg = `${error?.message || ''} ${error?.details || ''}`
  const m =
    msg.match(/column "([^"]+)" does not exist/i) ||
    msg.match(/Could not find the '([^']+)' column/i) ||
    msg.match(/record "([^"]+)" has no column/i)
  return m?.[1] || null
}
function isMissingTable(error) {
  return (
    error?.code === '42P01' ||
    /relation .* does not exist/i.test(error?.message || '') ||
    /could not find the table/i.test(error?.message || '') ||
    /schema cache/i.test(error?.message || '')
  )
}

async function runWithFallback(action, payload, label) {
  let current = { ...payload }
  for (let i = 0; i < MAX_FALLBACK; i++) {
    const { data, error } = await action(current)
    if (!error) return data
    const col = missingColFromErr(error)
    if (col && Object.prototype.hasOwnProperty.call(current, col)) {
      console.warn(`  [fallback] ${label}: dropping column "${col}"`)
      delete current[col]
      continue
    }
    if (isMissingTable(error)) {
      console.warn(`  [skip] ${label}: table missing`)
      return null
    }
    throw error
  }
  throw new Error(`${label}: too many fallback retries`)
}

async function findRows(table, filters) {
  let cur = { ...filters }
  for (let i = 0; i < MAX_FALLBACK; i++) {
    let q = supabase.from(table).select('id')
    for (const [k, v] of Object.entries(cur)) q = q.eq(k, v)
    const { data, error } = await q.limit(5)
    if (!error) return data || []
    const col = missingColFromErr(error)
    if (col && cur[col] !== undefined) { delete cur[col]; continue }
    if (isMissingTable(error)) return null
    throw error
  }
  return []
}

async function upsertByKey(table, filters, payload, label) {
  const rows = await findRows(table, filters)
  if (rows === null) return null
  const record = { ...filters, ...payload }
  if (rows.length > 0) {
    return runWithFallback(
      (c) => supabase.from(table).update(c).eq('id', rows[0].id).select('*').single(),
      record,
      `${label} update`
    )
  }
  return runWithFallback(
    (c) => supabase.from(table).insert(c).select('*').single(),
    record,
    `${label} insert`
  )
}

async function seedRows(table, rows, label, keyFn) {
  let ok = 0
  let skip = 0
  for (const row of rows) {
    try {
      if (keyFn) {
        const result = await upsertByKey(table, keyFn(row), row, label)
        if (result === null) { skip++; continue }
      } else {
        const result = await runWithFallback(
          (c) => supabase.from(table).insert(c).select('*').single(),
          row,
          label
        )
        if (result === null) { skip++; continue }
      }
      ok++
    } catch (err) {
      console.error(`  [error] ${label}:`, err?.message || err)
      skip++
    }
  }
  return { ok, skip }
}

// ─── Date constants ────────────────────────────────────────────────────────────
const START = '2026-01-01'
const END = '2026-03-31'
const ALL_DAYS = dateRange(START, END) // 90 days
const TOTAL_DAYS = ALL_DAYS.length

// ─── 1. Profile ────────────────────────────────────────────────────────────────
function buildProfile() {
  return {
    id: USER_ID,
    role: 'user',
    full_name: 'Alex Thompson',
    language: 'en',
    profile_data: {
      age: 28,
      height: 180,
      current_weight: 79,
      target_weight: 76,
      calories_target: 2200,
      protein_target: 170,
      carbs_target: 220,
      fat_target: 70,
      water_target: 3.0,
      training_goal: 'Lose fat and build muscle',
      goal_chips: ['fat_loss', 'muscle_gain'],
      activity_level: 'moderate_high',
      sex: 'male',
      path_choice: 'body_recomposition',
      locale: 'en-US',
      training_experience: 'intermediate',
      training_frequency: 5,
      training_location: 'gym',
      training_session_minutes: 60,
      dietary_style: 'balanced',
      meals_per_day: 3,
      onboarding_done: true,
    },
    onboarding_done: true,
    age: 28,
    height_cm: 180,
    current_weight: 79,
    target_weight: 76,
    sex: 'male',
    training_goal: 'recomposition',
    activity_level: 'moderate_high',
    calories_target: 2200,
    protein_target: 170,
    carbs_target: 220,
    fat_target: 70,
    water_target: 3.0,
    training_experience: 'intermediate',
    training_frequency: 5,
  }
}

// ─── 2. Subscription ──────────────────────────────────────────────────────────
function buildSubscription() {
  return {
    user_id: USER_ID,
    tier: 'pro',
    status: 'active',
    trial_starts_at: '2025-12-15T00:00:00Z',
    trial_ends_at: '2025-12-29T00:00:00Z',
    current_period_starts_at: '2026-01-01T00:00:00Z',
    current_period_ends_at: '2026-07-01T00:00:00Z',
  }
}

// ─── 3. Daily checkins ─────────────────────────────────────────────────────────
function buildCheckins() {
  return ALL_DAYS.map((d, i) => {
    const dow = new Date(`${d}T12:00:00Z`).getUTCDay() // 0=Sun
    const isWeekend = dow === 0 || dow === 6
    // Slight mood/energy dip mid-week
    const moodBase = isWeekend ? 4.2 : 3.8
    const energyBase = isWeekend ? 4.0 : 3.6
    return {
      user_id: USER_ID,
      date: d,
      mood: Math.min(5, Math.max(1, Math.round(moodBase + rand(-0.8, 0.8)))),
      energy: Math.min(5, Math.max(1, Math.round(energyBase + rand(-0.8, 0.8)))),
      sleep_hours: round1(Math.min(9, Math.max(5, 7 + rand(-1.2, 1.2)))),
      hydration_liters: round1(Math.min(4.5, Math.max(1.5, 2.8 + rand(-0.6, 0.8)))),
      notes: pick([
        'Feeling good today',
        'Solid day overall',
        'A bit tired but pushed through',
        'Great energy after good sleep',
        'Stressful day at work',
        'Good recovery day',
        'Legs still sore from yesterday',
        'Productive morning',
        'Need more sleep',
        'Felt strong in the gym',
        null,
        null,
      ]),
    }
  })
}

// ─── 4. Measurements (weekly) ──────────────────────────────────────────────────
function buildMeasurements() {
  const rows = []
  for (let week = 0; week < 13; week++) {
    const dayIdx = week * 7
    if (dayIdx >= TOTAL_DAYS) break
    const d = ALL_DAYS[dayIdx]
    const w = weightForDay(dayIdx, TOTAL_DAYS)
    const bf = bodyFatForDay(dayIdx, TOTAL_DAYS)
    rows.push({
      user_id: USER_ID,
      date: d,
      weight: w,
      body_fat: bf,
      height: 180,
      age: 28,
      waist: round1(88 - (5 * dayIdx) / TOTAL_DAYS + rand(-0.3, 0.3)),
      neck: round1(38 + rand(-0.2, 0.2)),
      chest: round1(102 + rand(-0.5, 0.5)),
      bmi: round1((w / (1.8 * 1.8))),
      source: 'manual',
    })
  }
  return rows
}

// ─── 5. Food logs ──────────────────────────────────────────────────────────────
const BREAKFASTS = [
  { name: 'Scrambled Eggs with Toast', cal: [350, 420], p: [22, 28], c: [25, 35], f: [18, 26] },
  { name: 'Oatmeal with Banana and Honey', cal: [320, 380], p: [10, 14], c: [55, 68], f: [6, 10] },
  { name: 'Protein Shake with Berries', cal: [280, 340], p: [30, 40], c: [20, 30], f: [5, 10] },
  { name: 'Greek Yogurt with Granola', cal: [300, 370], p: [18, 24], c: [35, 45], f: [8, 14] },
  { name: 'Avocado Toast with Eggs', cal: [400, 480], p: [18, 24], c: [30, 40], f: [22, 30] },
  { name: 'Whole Grain Pancakes with Syrup', cal: [380, 450], p: [12, 18], c: [55, 70], f: [10, 16] },
  { name: 'Smoothie Bowl', cal: [340, 400], p: [16, 22], c: [45, 58], f: [8, 14] },
  { name: 'Egg White Omelette with Veggies', cal: [250, 320], p: [26, 34], c: [8, 14], f: [10, 16] },
]

const LUNCHES = [
  { name: 'Grilled Chicken Breast with Rice', cal: [520, 620], p: [42, 52], c: [50, 65], f: [10, 16] },
  { name: 'Chicken Salad with Quinoa', cal: [450, 540], p: [38, 46], c: [35, 48], f: [14, 20] },
  { name: 'Turkey and Avocado Sandwich', cal: [480, 560], p: [32, 40], c: [40, 52], f: [18, 26] },
  { name: 'Pasta with Lean Ground Beef', cal: [550, 650], p: [35, 44], c: [60, 75], f: [14, 22] },
  { name: 'Tuna Wrap with Vegetables', cal: [420, 500], p: [34, 42], c: [35, 45], f: [12, 18] },
  { name: 'Chicken Stir Fry with Rice', cal: [500, 600], p: [38, 48], c: [50, 62], f: [12, 18] },
  { name: 'Grilled Fish with Sweet Potato', cal: [460, 540], p: [36, 44], c: [40, 52], f: [10, 16] },
  { name: 'Bean and Chicken Burrito Bowl', cal: [530, 630], p: [36, 46], c: [52, 66], f: [14, 22] },
]

const DINNERS = [
  { name: 'Grilled Salmon with Vegetables', cal: [480, 580], p: [38, 48], c: [15, 25], f: [24, 34] },
  { name: 'Steak with Roasted Broccoli', cal: [520, 620], p: [42, 52], c: [12, 20], f: [28, 38] },
  { name: 'Chicken Soup with Whole Grain Bread', cal: [380, 460], p: [28, 36], c: [35, 48], f: [10, 16] },
  { name: 'Baked Cod with Asparagus', cal: [350, 420], p: [36, 44], c: [10, 18], f: [12, 18] },
  { name: 'Turkey Meatballs with Zucchini Noodles', cal: [400, 480], p: [34, 42], c: [18, 28], f: [16, 24] },
  { name: 'Shrimp and Vegetable Stir Fry', cal: [380, 460], p: [32, 40], c: [20, 30], f: [14, 22] },
  { name: 'Lean Pork Chop with Green Beans', cal: [420, 500], p: [36, 44], c: [12, 20], f: [18, 26] },
  { name: 'Grilled Chicken with Mixed Greens', cal: [380, 460], p: [38, 48], c: [10, 18], f: [14, 22] },
]

function buildFoodLogs() {
  const rows = []
  for (let i = 0; i < TOTAL_DAYS; i++) {
    const d = ALL_DAYS[i]
    const dow = new Date(`${d}T12:00:00Z`).getUTCDay()
    const isWeekend = dow === 0 || dow === 6

    // Skip breakfast ~20% of weekends
    const skipBreakfast = isWeekend && Math.random() < 0.2

    if (!skipBreakfast) {
      const b = pick(BREAKFASTS)
      rows.push({
        user_id: USER_ID,
        date: toTimestamp(d, randInt(7, 9), randInt(0, 59)),
        food_name: b.name,
        meal_type: 'breakfast',
        calories: round1(rand(b.cal[0], b.cal[1])),
        protein: round1(rand(b.p[0], b.p[1])),
        carbs: round1(rand(b.c[0], b.c[1])),
        fat: round1(rand(b.f[0], b.f[1])),
        quantity: 1,
        serving_unit: 'portion',
        serving_size: randInt(200, 400),
      })
    }

    // Lunch
    const l = pick(LUNCHES)
    rows.push({
      user_id: USER_ID,
      date: toTimestamp(d, randInt(12, 13), randInt(0, 59)),
      food_name: l.name,
      meal_type: 'lunch',
      calories: round1(rand(l.cal[0], l.cal[1])),
      protein: round1(rand(l.p[0], l.p[1])),
      carbs: round1(rand(l.c[0], l.c[1])),
      fat: round1(rand(l.f[0], l.f[1])),
      quantity: 1,
      serving_unit: 'portion',
      serving_size: randInt(250, 450),
    })

    // Dinner
    const dn = pick(DINNERS)
    rows.push({
      user_id: USER_ID,
      date: toTimestamp(d, randInt(19, 20), randInt(0, 59)),
      food_name: dn.name,
      meal_type: 'dinner',
      calories: round1(rand(dn.cal[0], dn.cal[1])),
      protein: round1(rand(dn.p[0], dn.p[1])),
      carbs: round1(rand(dn.c[0], dn.c[1])),
      fat: round1(rand(dn.f[0], dn.f[1])),
      quantity: 1,
      serving_unit: 'portion',
      serving_size: randInt(200, 400),
    })
  }
  return rows
}

// ─── 6. Workouts ───────────────────────────────────────────────────────────────
const PUSH_EXERCISES = [
  { name: 'Flat Bench Press', startWeight: 70, endWeight: 82.5, sets: 4, repsRange: [6, 10] },
  { name: 'Incline Dumbbell Press', startWeight: 24, endWeight: 30, sets: 3, repsRange: [8, 12] },
  { name: 'Overhead Shoulder Press', startWeight: 40, endWeight: 50, sets: 3, repsRange: [8, 10] },
  { name: 'Cable Fly', startWeight: 15, endWeight: 20, sets: 3, repsRange: [12, 15] },
  { name: 'Tricep Rope Pushdown', startWeight: 25, endWeight: 32.5, sets: 3, repsRange: [10, 14] },
  { name: 'Lateral Raise', startWeight: 8, endWeight: 12, sets: 3, repsRange: [12, 15] },
]
const PULL_EXERCISES = [
  { name: 'Deadlift', startWeight: 100, endWeight: 125, sets: 3, repsRange: [4, 6] },
  { name: 'Barbell Row', startWeight: 60, endWeight: 75, sets: 4, repsRange: [8, 10] },
  { name: 'Lat Pulldown', startWeight: 55, endWeight: 67.5, sets: 3, repsRange: [10, 12] },
  { name: 'Seated Cable Row', startWeight: 50, endWeight: 62.5, sets: 3, repsRange: [10, 12] },
  { name: 'Dumbbell Bicep Curl', startWeight: 12, endWeight: 16, sets: 3, repsRange: [10, 14] },
  { name: 'Face Pull', startWeight: 20, endWeight: 27.5, sets: 3, repsRange: [12, 15] },
]
const LEG_EXERCISES = [
  { name: 'Back Squat', startWeight: 80, endWeight: 100, sets: 4, repsRange: [6, 8] },
  { name: 'Leg Press', startWeight: 160, endWeight: 200, sets: 3, repsRange: [10, 12] },
  { name: 'Romanian Deadlift', startWeight: 70, endWeight: 87.5, sets: 3, repsRange: [8, 10] },
  { name: 'Leg Extension', startWeight: 40, endWeight: 52.5, sets: 3, repsRange: [12, 15] },
  { name: 'Leg Curl', startWeight: 35, endWeight: 45, sets: 3, repsRange: [10, 12] },
  { name: 'Standing Calf Raise', startWeight: 60, endWeight: 80, sets: 4, repsRange: [12, 15] },
]

const SPLIT = [
  { name: 'Push Day', exercises: PUSH_EXERCISES },
  { name: 'Pull Day', exercises: PULL_EXERCISES },
  { name: 'Leg Day', exercises: LEG_EXERCISES },
]

function buildWorkouts() {
  const rows = []
  // ~4-5 workouts per week
  // Pattern: Mon=Push, Tue=Pull, Wed=rest, Thu=Legs, Fri=Push, Sat=Pull or rest, Sun=rest
  const schedule = { 1: 0, 2: 1, 4: 2, 5: 0 } // dow -> SPLIT index
  // Occasionally add Saturday workout
  const saturdayChance = 0.55

  for (let i = 0; i < TOTAL_DAYS; i++) {
    const d = ALL_DAYS[i]
    const dow = new Date(`${d}T12:00:00Z`).getUTCDay()

    let splitIdx = schedule[dow]
    if (splitIdx === undefined && dow === 6 && Math.random() < saturdayChance) {
      splitIdx = 1 // Pull on Saturday
    }
    if (splitIdx === undefined) continue

    const split = SPLIT[splitIdx]
    const progress = i / TOTAL_DAYS // 0..1

    const exercisesCompleted = split.exercises.map((ex) => {
      const weight = round1(ex.startWeight + (ex.endWeight - ex.startWeight) * progress + rand(-1, 1))
      const reps = randInt(ex.repsRange[0], ex.repsRange[1])
      const setsArr = []
      for (let s = 1; s <= ex.sets; s++) {
        setsArr.push({
          set_number: s,
          target_reps: String(reps),
          target_weight: weight,
          reps_actual: Math.max(1, reps + randInt(-1, 1)),
          load_actual: weight,
          rir_actual: randInt(1, 3),
        })
      }
      return {
        name: ex.name,
        target_sets: ex.sets,
        target_reps: `${ex.repsRange[0]}-${ex.repsRange[1]}`,
        sets_completed: setsArr,
      }
    })

    const volumeLoad = Math.round(
      exercisesCompleted.reduce((sum, ex) => {
        return (
          sum +
          ex.sets_completed.reduce(
            (s2, set) => s2 + (Number(set.load_actual) || 0) * (Number(set.reps_actual) || 0),
            0
          )
        )
      }, 0)
    )

    const durationSec = randInt(3000, 5400)
    const hour = dow === 6 ? randInt(9, 11) : randInt(17, 19)

    rows.push({
      user_id: USER_ID,
      name: split.name,
      status: 'completed',
      completed_at: toTimestamp(d, hour, randInt(0, 59)),
      volume_load: volumeLoad,
      duration_minutes: Math.round(durationSec / 60),
      exercises_completed: exercisesCompleted,
      notes: pick([
        'Great session, felt strong',
        'Solid workout',
        'Pushed hard today',
        'Good pump',
        'A bit fatigued but got it done',
        'PR on main lift!',
        'Focused on form today',
        'Quick session but effective',
        null,
      ]),
    })
  }
  return rows
}

// ─── 7. Coach messages ─────────────────────────────────────────────────────────
function buildCoachMessages() {
  const conversations = [
    {
      date: '2026-01-05',
      pairs: [
        ['Hey coach, I just started my cut. Any tips for the first week?', "Welcome aboard Alex! The first week is all about establishing your baseline. Focus on hitting your protein target of 170g daily, keep training intensity high, and don't slash calories too aggressively. A 400-500 calorie deficit is plenty. Track everything this week so we have good data to work with."],
      ],
    },
    {
      date: '2026-01-12',
      pairs: [
        ['I feel really hungry in the evenings. What should I do?', "Evening hunger is super common during a cut. Try these strategies: 1) Save more of your carb budget for dinner, 2) Add volume-dense veggies like broccoli and spinach to fill up, 3) Have a casein shake before bed (slow-digesting protein), 4) Make sure you're drinking enough water - sometimes thirst mimics hunger. Your check-ins show good compliance, so this is just an adjustment phase."],
      ],
    },
    {
      date: '2026-01-19',
      pairs: [
        ['Should I do cardio on my rest days?', "Light cardio on rest days can help with recovery and calorie expenditure. I'd recommend 20-30 minutes of walking or light cycling. Nothing intense enough to impair your recovery for lifting days. Your training frequency of 4-5 days is already solid, so the goal is just staying active without adding stress."],
      ],
    },
    {
      date: '2026-01-28',
      pairs: [
        ['My bench press seems stuck at the same weight. Any advice?', "Strength plateaus during a cut are completely normal - you're in a calorie deficit after all. The key is maintaining your current strength, not necessarily setting PRs. That said, try these: 1) Make sure you're getting enough sleep (7+ hours), 2) Time your largest carb meal 2-3 hours before training, 3) Consider micro-loading with 1.25kg plates. Your squat and deadlift are still progressing, which is a great sign."],
      ],
    },
    {
      date: '2026-02-05',
      pairs: [
        ['Down 2.5kg in the first month! Is that a good rate?', "That's excellent progress! 2.5kg in 4 weeks means you're losing about 0.6kg per week, which is right in the sweet spot for preserving muscle while losing fat. Your measurements show your waist is coming down too, which confirms it's primarily fat loss. Keep doing exactly what you're doing."],
      ],
    },
    {
      date: '2026-02-14',
      pairs: [
        ['I had a bad weekend of eating. Should I compensate this week?', "Don't stress about it. One weekend won't undo weeks of consistent work. The worst thing you can do is crash-diet to compensate - that creates a binge-restrict cycle. Just get back to your normal plan today. Your weekly average is what matters, not any single day. Looking at your logs, your overall adherence has been great."],
      ],
    },
    {
      date: '2026-02-22',
      pairs: [
        ['How do my macros look this month?', "Your nutrition has been solid overall. Average daily intake: ~2100 calories, ~155g protein, ~210g carbs, ~68g fat. Your protein could come up a bit - aim for that 170g target consistently. The slight calorie variance between days is actually fine; it's the weekly average that matters most. I'd suggest adding an extra scoop of protein powder to one of your meals."],
      ],
    },
    {
      date: '2026-03-01',
      pairs: [
        ['Two months in, feeling good but starting to see slower progress. Normal?', "Absolutely normal! As you get leaner, fat loss naturally slows down. You've gone from 85kg to about 81kg, which is fantastic. Your body fat is dropping steadily from 22% toward 18%. At this stage, focus on: 1) Staying consistent with training, 2) Getting adequate sleep and recovery, 3) Maybe add one extra workout day if energy allows. The progress is real - trust the process."],
      ],
    },
    {
      date: '2026-03-10',
      pairs: [
        ['My deadlift hit 120kg today for 5 reps! Is that good for someone cutting?', "That's impressive! Hitting a new rep PR on deadlift while in a deficit shows that your training programming and nutrition are well-dialed in. Your strength is actually going UP while you're losing weight, which means you're likely gaining some muscle too. This is body recomposition at its finest. Great work!"],
      ],
    },
    {
      date: '2026-03-18',
      pairs: [
        ['Almost at the 3 month mark. How should I think about the next phase?', "You've made incredible progress - from 85kg down to about 79kg, body fat from 22% to around 17%. For the next phase, I'd suggest: 1) Consider a 2-week maintenance phase (eat at TDEE) to reset hormones and hunger signals, 2) Then decide if you want to continue cutting to ~15% body fat or start a lean bulk to add muscle. Either way, you've built great habits over these 3 months. Your consistency with check-ins, nutrition tracking, and training has been outstanding."],
      ],
    },
  ]

  const rows = []
  for (const conv of conversations) {
    for (const [userMsg, assistantMsg] of conv.pairs) {
      rows.push({
        user_id: USER_ID,
        role: 'user',
        content: userMsg,
        created_at: toTimestamp(conv.date, randInt(8, 20), randInt(0, 59)),
      })
      rows.push({
        user_id: USER_ID,
        role: 'assistant',
        content: assistantMsg,
        created_at: toTimestamp(conv.date, randInt(8, 20), randInt(1, 59)),
      })
    }
  }
  return rows
}

// ─── 8. Progress photos ────────────────────────────────────────────────────────
function buildProgressPhotos() {
  const checkpoints = ['2026-01-01', '2026-02-01', '2026-03-01', '2026-03-28']
  const categories = ['front', 'side']
  const rows = []
  for (const d of checkpoints) {
    for (const cat of categories) {
      rows.push({
        user_id: USER_ID,
        date: d,
        category: cat,
        photo_url: `/demo-progress-photos/review_${cat}_${d}.jpg`,
        notes: `Monthly progress photo - ${cat} view`,
      })
    }
  }
  return rows
}

// ─── 9. Lab exams ──────────────────────────────────────────────────────────────
function buildLabExams() {
  return [
    {
      user_id: USER_ID,
      panel_name: 'Comprehensive Blood Panel',
      exam_date: '2026-01-08',
      markers: [
        { name: 'Total Testosterone', value: 620, unit: 'ng/dL', ref_min: 300, ref_max: 1000 },
        { name: 'Free Testosterone', value: 15.2, unit: 'pg/mL', ref_min: 8.7, ref_max: 25.1 },
        { name: 'Fasting Glucose', value: 94, unit: 'mg/dL', ref_min: 70, ref_max: 100 },
        { name: 'HbA1c', value: 5.2, unit: '%', ref_min: 4.0, ref_max: 5.6 },
        { name: 'Total Cholesterol', value: 198, unit: 'mg/dL', ref_min: 0, ref_max: 200 },
        { name: 'HDL Cholesterol', value: 48, unit: 'mg/dL', ref_min: 40, ref_max: 60 },
        { name: 'LDL Cholesterol', value: 122, unit: 'mg/dL', ref_min: 0, ref_max: 130 },
        { name: 'Triglycerides', value: 138, unit: 'mg/dL', ref_min: 0, ref_max: 150 },
        { name: 'TSH', value: 2.1, unit: 'mIU/L', ref_min: 0.4, ref_max: 4.0 },
        { name: 'Vitamin D', value: 32, unit: 'ng/mL', ref_min: 30, ref_max: 100 },
        { name: 'Iron', value: 95, unit: 'mcg/dL', ref_min: 60, ref_max: 170 },
        { name: 'Creatinine', value: 1.0, unit: 'mg/dL', ref_min: 0.7, ref_max: 1.3 },
      ],
      notes: 'Baseline blood work before starting cut. All markers within normal range.',
    },
    {
      user_id: USER_ID,
      panel_name: 'Follow-up Blood Panel',
      exam_date: '2026-03-20',
      markers: [
        { name: 'Total Testosterone', value: 645, unit: 'ng/dL', ref_min: 300, ref_max: 1000 },
        { name: 'Free Testosterone', value: 16.8, unit: 'pg/mL', ref_min: 8.7, ref_max: 25.1 },
        { name: 'Fasting Glucose', value: 88, unit: 'mg/dL', ref_min: 70, ref_max: 100 },
        { name: 'HbA1c', value: 5.0, unit: '%', ref_min: 4.0, ref_max: 5.6 },
        { name: 'Total Cholesterol', value: 182, unit: 'mg/dL', ref_min: 0, ref_max: 200 },
        { name: 'HDL Cholesterol', value: 54, unit: 'mg/dL', ref_min: 40, ref_max: 60 },
        { name: 'LDL Cholesterol', value: 108, unit: 'mg/dL', ref_min: 0, ref_max: 130 },
        { name: 'Triglycerides', value: 102, unit: 'mg/dL', ref_min: 0, ref_max: 150 },
        { name: 'TSH', value: 1.9, unit: 'mIU/L', ref_min: 0.4, ref_max: 4.0 },
        { name: 'Vitamin D', value: 42, unit: 'ng/mL', ref_min: 30, ref_max: 100 },
        { name: 'Iron', value: 88, unit: 'mcg/dL', ref_min: 60, ref_max: 170 },
        { name: 'Creatinine', value: 1.0, unit: 'mg/dL', ref_min: 0.7, ref_max: 1.3 },
      ],
      ai_insights:
        'Excellent improvement across the board. HDL cholesterol increased from 48 to 54 mg/dL, triglycerides dropped from 138 to 102 mg/dL, and fasting glucose improved. These changes are consistent with the weight loss and improved diet over the past 3 months. Testosterone levels remain healthy. Vitamin D has improved - likely due to supplementation. All markers within optimal range.',
      notes: 'Post-cut blood work showing improvements in metabolic markers.',
    },
  ]
}

// ─── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('=== Atlas Core: Seeding Review Account ===')
  console.log(`User: ${USER_EMAIL} (${USER_ID})`)
  console.log(`Period: ${START} - ${END}\n`)

  const results = {}

  // 0. Ensure auth user exists
  console.log('[0] Ensuring auth user...')
  try {
    const { data: listData } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
    const existing = (listData?.users || []).find(
      (u) => u.email?.toLowerCase() === USER_EMAIL.toLowerCase()
    )
    if (existing) {
      console.log(`  Auth user exists: ${existing.id}`)
      if (existing.id !== USER_ID) {
        console.warn(`  WARNING: existing user ID ${existing.id} differs from target ${USER_ID}`)
      }
    } else {
      console.log('  Creating auth user...')
      const { data, error } = await supabase.auth.admin.createUser({
        email: USER_EMAIL,
        password: 'ReviewAtlas2026!',
        email_confirm: true,
        user_metadata: {
          full_name: 'Alex Thompson',
          atlas_role: 'athlete',
          onboarding_completed: true,
          language: 'en',
        },
      })
      if (error) {
        // If user exists with different method, try update
        if (/already been registered/i.test(error?.message || '')) {
          console.log('  User already registered (different lookup). Continuing...')
        } else {
          throw error
        }
      } else {
        console.log(`  Created auth user: ${data?.user?.id}`)
      }
    }
  } catch (err) {
    console.warn(`  Auth user step warning: ${err?.message || err}`)
  }

  // 1. Profile
  console.log('\n[1] Upserting profile...')
  try {
    const profile = buildProfile()
    await upsertByKey('profiles', { id: USER_ID }, profile, 'profile')
    results.profile = 'OK'
    console.log('  Profile upserted')
  } catch (err) {
    results.profile = `ERROR: ${err?.message}`
    console.error('  Profile error:', err?.message)
  }

  // 2. Subscription
  console.log('\n[2] Upserting subscription...')
  try {
    const sub = buildSubscription()
    await upsertByKey('subscriptions', { user_id: USER_ID }, sub, 'subscription')
    results.subscription = 'OK'
    console.log('  Subscription upserted')
  } catch (err) {
    results.subscription = `ERROR: ${err?.message}`
    console.error('  Subscription error:', err?.message)
  }

  // 3. Daily checkins
  console.log('\n[3] Seeding daily checkins...')
  try {
    const checkins = buildCheckins()
    const r = await seedRows('daily_checkins', checkins, 'checkin', (row) => ({
      user_id: row.user_id,
      date: row.date,
    }))
    results.daily_checkins = `${r.ok} OK, ${r.skip} skipped`
    console.log(`  ${r.ok} checkins upserted, ${r.skip} skipped`)
  } catch (err) {
    results.daily_checkins = `ERROR: ${err?.message}`
    console.error('  Checkins error:', err?.message)
  }

  // 4. Measurements
  console.log('\n[4] Seeding measurements...')
  try {
    const measurements = buildMeasurements()
    const r = await seedRows('measurements', measurements, 'measurement', (row) => ({
      user_id: row.user_id,
      date: row.date,
    }))
    results.measurements = `${r.ok} OK, ${r.skip} skipped`
    console.log(`  ${r.ok} measurements upserted, ${r.skip} skipped`)
  } catch (err) {
    results.measurements = `ERROR: ${err?.message}`
    console.error('  Measurements error:', err?.message)
  }

  // 5. Food logs
  console.log('\n[5] Seeding food logs...')
  try {
    const foodLogs = buildFoodLogs()
    const r = await seedRows('food_logs', foodLogs, 'food log', (row) => ({
      user_id: row.user_id,
      date: row.date,
      food_name: row.food_name,
    }))
    results.food_logs = `${r.ok} OK, ${r.skip} skipped`
    console.log(`  ${r.ok} food logs upserted, ${r.skip} skipped`)
  } catch (err) {
    results.food_logs = `ERROR: ${err?.message}`
    console.error('  Food logs error:', err?.message)
  }

  // 6. Workouts
  console.log('\n[6] Seeding workouts...')
  try {
    const workouts = buildWorkouts()
    const r = await seedRows('workouts', workouts, 'workout', (row) => ({
      user_id: row.user_id,
      completed_at: row.completed_at,
      name: row.name,
    }))
    results.workouts = `${r.ok} OK, ${r.skip} skipped`
    console.log(`  ${r.ok} workouts upserted, ${r.skip} skipped`)
  } catch (err) {
    results.workouts = `ERROR: ${err?.message}`
    console.error('  Workouts error:', err?.message)
  }

  // 7. Coach messages
  console.log('\n[7] Seeding coach messages...')
  try {
    // First delete existing messages to avoid duplicates
    const { error: delErr } = await supabase
      .from('coach_messages')
      .delete()
      .eq('user_id', USER_ID)
    if (delErr && !isMissingTable(delErr)) {
      console.warn('  Could not clear old messages:', delErr?.message)
    }
    const messages = buildCoachMessages()
    const r = await seedRows('coach_messages', messages, 'coach message')
    results.coach_messages = `${r.ok} OK, ${r.skip} skipped`
    console.log(`  ${r.ok} coach messages inserted, ${r.skip} skipped`)
  } catch (err) {
    results.coach_messages = `ERROR: ${err?.message}`
    console.error('  Coach messages error:', err?.message)
  }

  // 8. Progress photos
  console.log('\n[8] Seeding progress photos...')
  try {
    const photos = buildProgressPhotos()
    const r = await seedRows('progress_photos', photos, 'progress photo', (row) => ({
      user_id: row.user_id,
      date: row.date,
      category: row.category,
    }))
    results.progress_photos = `${r.ok} OK, ${r.skip} skipped`
    console.log(`  ${r.ok} progress photos upserted, ${r.skip} skipped`)
  } catch (err) {
    results.progress_photos = `ERROR: ${err?.message}`
    console.error('  Progress photos error:', err?.message)
  }

  // 9. Lab exams
  console.log('\n[9] Seeding lab exams...')
  try {
    const exams = buildLabExams()
    const r = await seedRows('lab_exams', exams, 'lab exam', (row) => ({
      user_id: row.user_id,
      exam_date: row.exam_date,
      panel_name: row.panel_name,
    }))
    results.lab_exams = `${r.ok} OK, ${r.skip} skipped`
    console.log(`  ${r.ok} lab exams upserted, ${r.skip} skipped`)
  } catch (err) {
    results.lab_exams = `ERROR: ${err?.message}`
    console.error('  Lab exams error:', err?.message)
  }

  // Summary
  console.log('\n=== Seed Complete ===')
  for (const [k, v] of Object.entries(results)) {
    console.log(`  ${k}: ${v}`)
  }
}

main().catch((err) => {
  console.error('\nFATAL:', err?.message || err)
  process.exit(1)
})
