/**
 * Atlas Core — Health Dossier Builder
 *
 * Aggregates all user data into a compact, structured JSON "dossier"
 * that is sent to the LLM instead of raw data. This approach:
 *   1. Reduces token count (cost savings)
 *   2. Prevents hallucinations (LLM reasons over pre-validated metrics)
 *   3. Ensures mathematical precision (code does the math, LLM interprets)
 *
 * The dossier is the single input for the AI Insights Engine.
 */

// ── Helpers ──────────────────────────────────────────────────────────────────

function toNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function round(value, digits = 1) {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  const factor = 10 ** digits;
  return Math.round(n * factor) / factor;
}

function average(values) {
  const valid = values.filter((v) => v !== null && v !== undefined && Number.isFinite(Number(v)));
  if (valid.length === 0) return null;
  return valid.reduce((sum, v) => sum + Number(v), 0) / valid.length;
}

function toDateKey(value) {
  if (!value) return null;
  if (typeof value === 'string') {
    const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) return match[1];
  }
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function subtractDays(dateKey, days) {
  const d = new Date(`${dateKey}T12:00:00`);
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function withinRange(dateKey, startKey, endKey) {
  if (!dateKey || !startKey || !endKey) return false;
  return dateKey >= startKey && dateKey <= endKey;
}

function capitalize(str) {
  return String(str || '').charAt(0).toUpperCase() + String(str || '').slice(1);
}

// ── Profile Section ──────────────────────────────────────────────────────────

function buildProfileSection(profile = {}) {
  return {
    age: toNumber(profile.age) || toNumber(profile.birth_year ? new Date().getFullYear() - profile.birth_year : null),
    sex: profile.sex || profile.gender || null,
    height_cm: toNumber(profile.height_cm || profile.height),
    training_goal: profile.training_goal || profile.objective || null,
    training_experience: profile.training_experience || null,
    target_weight: toNumber(profile.target_weight),
    body_fat_goal: toNumber(profile.body_fat_goal),
  };
}

// ── Body Composition Section ─────────────────────────────────────────────────

function buildBodySection(measurements = [], todayKey) {
  const sorted = [...measurements]
    .filter((m) => toDateKey(m.date))
    .sort((a, b) => toDateKey(a.date).localeCompare(toDateKey(b.date)));

  if (sorted.length === 0) return { has_data: false };

  const latest = sorted[sorted.length - 1];
  const first = sorted[0];

  const weightValues = sorted.map((m) => toNumber(m.weight)).filter((v) => v !== null);
  const latestWeight = toNumber(latest.weight);
  const firstWeight = toNumber(first.weight);

  // Last 7 days average vs previous 7 days
  const last7Start = subtractDays(todayKey, 6);
  const prev7Start = subtractDays(todayKey, 13);
  const prev7End = subtractDays(todayKey, 7);
  const last7Weights = sorted
    .filter((m) => withinRange(toDateKey(m.date), last7Start, todayKey))
    .map((m) => toNumber(m.weight))
    .filter((v) => v !== null);
  const prev7Weights = sorted
    .filter((m) => withinRange(toDateKey(m.date), prev7Start, prev7End))
    .map((m) => toNumber(m.weight))
    .filter((v) => v !== null);

  return {
    has_data: true,
    total_checkpoints: sorted.length,
    latest_date: toDateKey(latest.date),
    current_weight_kg: latestWeight,
    weight_delta_total_kg: latestWeight && firstWeight ? round(latestWeight - firstWeight) : null,
    weight_7d_avg_kg: round(average(last7Weights)),
    weight_prev_7d_avg_kg: round(average(prev7Weights)),
    weight_weekly_delta_kg:
      average(last7Weights) !== null && average(prev7Weights) !== null
        ? round(average(last7Weights) - average(prev7Weights))
        : null,
    body_fat_percent: toNumber(latest.body_fat_percent ?? latest.body_fat),
    waist_cm: toNumber(latest.waist),
    lean_mass_kg: toNumber(latest.lean_mass),
    muscle_mass_kg: toNumber(latest.muscle_mass),
    bmi: toNumber(latest.bmi),
    bmr_kcal: toNumber(latest.bmr),
  };
}

// ── Training Section ─────────────────────────────────────────────────────────

function normalizeName(name) {
  return String(name || '').toLowerCase().trim().replace(/\s+/g, ' ');
}

function buildTrainingSection(workouts = [], workoutPlan = null, profile = {}, todayKey, rangeDays = 30) {
  const startKey = subtractDays(todayKey, rangeDays - 1);
  const completed = workouts.filter(
    (w) => w.status === 'completed' && withinRange(toDateKey(w.completed_at ?? w.date), startKey, todayKey)
  );

  if (completed.length === 0) {
    return { has_data: false, completed_sessions: 0 };
  }

  // Target frequency
  const planFreq =
    toNumber(workoutPlan?.frequency) ||
    (Array.isArray(workoutPlan?.days) ? workoutPlan.days.length : null) ||
    toNumber(profile?.training_frequency) ||
    4;
  const periodWeeks = Math.max(rangeDays / 7, 1);
  const plannedSessions = Math.round(planFreq * periodWeeks);
  const adherence = Math.min(100, Math.round((completed.length / Math.max(1, plannedSessions)) * 100));

  // Duration
  const durations = completed.map((w) => toNumber(w.duration_minutes)).filter((v) => v !== null);
  const avgDuration = round(average(durations), 0);

  // Volume
  const volumes = completed.map((w) => toNumber(w.volume_load)).filter((v) => v !== null);
  const avgVolume = round(average(volumes), 0);

  // Personal records (top 5 lifts by weight)
  const prMap = {};
  for (const w of completed) {
    const exercises = Array.isArray(w.exercises_completed) ? w.exercises_completed : [];
    for (const ex of exercises) {
      const key = normalizeName(ex.name);
      if (!key) continue;
      const sets = ex.sets_completed || ex.sets || [];
      for (const s of sets) {
        const load = toNumber(s.load_actual ?? s.load ?? s.weight);
        const reps = toNumber(s.reps_actual ?? s.reps);
        if (!load || !reps) continue;
        const existing = prMap[key];
        if (!existing || load > existing.weight) {
          prMap[key] = { exercise: capitalize(key), weight: load, reps, date: toDateKey(w.completed_at ?? w.date) };
        }
      }
    }
  }
  const topPRs = Object.values(prMap)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 8);

  // Muscle group frequency (last 14 days)
  const last14Start = subtractDays(todayKey, 13);
  const muscleGroups = {};
  for (const w of completed.filter((w) => withinRange(toDateKey(w.completed_at ?? w.date), last14Start, todayKey))) {
    const exercises = Array.isArray(w.exercises_completed) ? w.exercises_completed : [];
    for (const ex of exercises) {
      const group = normalizeName(ex.muscle_group || ex.category || 'other');
      muscleGroups[group] = (muscleGroups[group] || 0) + 1;
    }
  }

  return {
    has_data: true,
    completed_sessions: completed.length,
    planned_sessions: plannedSessions,
    adherence_percent: adherence,
    avg_duration_min: avgDuration,
    avg_volume_kg: avgVolume,
    top_personal_records: topPRs,
    muscle_group_frequency_14d: muscleGroups,
    plan_name: workoutPlan?.name || null,
  };
}

// ── Nutrition Section ────────────────────────────────────────────────────────

function buildNutritionSection(meals = [], dietPlan = null, profile = {}, todayKey) {
  const startKey = subtractDays(todayKey, 6);

  // Aggregate by day
  const dayMap = {};
  for (const meal of meals) {
    const dk = toDateKey(meal.date);
    if (!dk || !withinRange(dk, startKey, todayKey)) continue;
    if (!dayMap[dk]) dayMap[dk] = { calories: 0, protein: 0, carbs: 0, fat: 0, count: 0 };
    dayMap[dk].calories += toNumber(meal.total_calories ?? meal.calories ?? meal.kcal) || 0;
    dayMap[dk].protein += toNumber(meal.total_protein ?? meal.protein) || 0;
    dayMap[dk].carbs += toNumber(meal.total_carbs ?? meal.carbs) || 0;
    dayMap[dk].fat += toNumber(meal.total_fat ?? meal.fat) || 0;
    dayMap[dk].count += 1;
  }

  const loggedDays = Object.values(dayMap).filter((d) => d.count > 0);
  if (loggedDays.length === 0) return { has_data: false };

  const avgCalories = round(average(loggedDays.map((d) => d.calories)), 0);
  const avgProtein = round(average(loggedDays.map((d) => d.protein)), 0);
  const avgCarbs = round(average(loggedDays.map((d) => d.carbs)), 0);
  const avgFat = round(average(loggedDays.map((d) => d.fat)), 0);

  // Targets
  const calorieTarget = toNumber(dietPlan?.total_calories ?? profile?.calories_target);
  const proteinTarget = toNumber(dietPlan?.total_protein ?? profile?.protein_target);

  return {
    has_data: true,
    logged_days_last_7: loggedDays.length,
    avg_calories_kcal: avgCalories,
    avg_protein_g: avgProtein,
    avg_carbs_g: avgCarbs,
    avg_fat_g: avgFat,
    calorie_target_kcal: calorieTarget ? Math.round(calorieTarget) : null,
    protein_target_g: proteinTarget ? Math.round(proteinTarget) : null,
    calorie_adherence_percent:
      calorieTarget && avgCalories
        ? Math.min(100, Math.round((avgCalories / calorieTarget) * 100))
        : null,
    protein_adherence_percent:
      proteinTarget && avgProtein
        ? Math.min(100, Math.round((avgProtein / proteinTarget) * 100))
        : null,
    diet_plan_name: dietPlan?.name || null,
    diet_objective: dietPlan?.objective || null,
  };
}

// ── Recovery Section ─────────────────────────────────────────────────────────

function buildRecoverySection(checkins = [], profile = {}, todayKey) {
  const startKey = subtractDays(todayKey, 6);
  const recent = checkins.filter((c) => {
    const dk = toDateKey(c.date);
    return dk && withinRange(dk, startKey, todayKey);
  });

  if (recent.length === 0) return { has_data: false };

  const sleepValues = recent.map((c) => toNumber(c.sleep_hours)).filter((v) => v !== null);
  const energyValues = recent.map((c) => toNumber(c.energy)).filter((v) => v !== null);
  const moodValues = recent.map((c) => toNumber(c.mood)).filter((v) => v !== null);
  const hydrationValues = recent.map((c) => toNumber(c.hydration_liters)).filter((v) => v !== null);

  const waterTarget = toNumber(profile?.water_target) || 2;
  const hydrationHitDays = recent.filter(
    (c) => toNumber(c.hydration_liters) !== null && toNumber(c.hydration_liters) >= waterTarget
  ).length;

  return {
    has_data: true,
    checkins_last_7_days: recent.length,
    avg_sleep_hours: round(average(sleepValues)),
    avg_energy_out_of_5: round(average(energyValues)),
    avg_mood_out_of_5: round(average(moodValues)),
    avg_hydration_liters: round(average(hydrationValues)),
    hydration_hit_days: hydrationHitDays,
    water_target_liters: waterTarget,
  };
}

// ── Lab Exams Section (Performance tier) ─────────────────────────────────────

function buildLabExamsSection(labExams = []) {
  if (!labExams || labExams.length === 0) return { has_data: false };

  const sorted = [...labExams].sort((a, b) => (b.exam_date || '').localeCompare(a.exam_date || ''));
  const latest = sorted[0];
  const markers = Array.isArray(latest.markers) ? latest.markers : [];

  const abnormal = markers.filter((m) => {
    if (!m.value || !m.reference_min || !m.reference_max) return false;
    const val = toNumber(m.value);
    return val !== null && (val < toNumber(m.reference_min) || val > toNumber(m.reference_max));
  });

  const markerSummaries = markers.slice(0, 15).map((m) => ({
    name: m.name,
    value: m.value,
    unit: m.unit || '',
    status: m.status || (abnormal.find((a) => a.name === m.name) ? 'out_of_range' : 'normal'),
    reference: m.reference_min && m.reference_max ? `${m.reference_min}-${m.reference_max}` : null,
  }));

  return {
    has_data: true,
    latest_exam_date: latest.exam_date,
    panel_name: latest.panel_name,
    total_markers: markers.length,
    abnormal_count: abnormal.length,
    markers: markerSummaries,
    total_exams_on_file: sorted.length,
  };
}

// ── Protocols Section (Performance tier) ─────────────────────────────────────

function buildProtocolsSection(protocols = [], protocolLogs = []) {
  const active = protocols.filter((p) => p.active);
  if (active.length === 0) return { has_data: false };

  const summaries = active.map((p) => {
    const logs = protocolLogs.filter((l) => l.protocol_id === p.id);
    const lastLog = logs.sort((a, b) => (b.taken_at || '').localeCompare(a.taken_at || ''))[0];

    return {
      substance: p.substance_name || p.name,
      category: p.category,
      dose: p.dose,
      unit: p.unit,
      frequency: p.frequency,
      start_date: p.start_date,
      last_administered: lastLog ? toDateKey(lastLog.taken_at) : null,
      total_logs: logs.length,
    };
  });

  return {
    has_data: true,
    active_protocols: summaries.length,
    protocols: summaries,
  };
}

// ── Main Builder ─────────────────────────────────────────────────────────────

/**
 * Build a complete Health Dossier from all user data sources.
 *
 * @param {Object} params
 * @param {Object} params.profile - User profile data
 * @param {Array}  params.measurements - Body measurements
 * @param {Array}  params.workouts - Workout sessions
 * @param {Object} params.workoutPlan - Active workout plan
 * @param {Array}  params.meals - Food log entries
 * @param {Object} params.dietPlan - Active diet plan
 * @param {Array}  params.checkins - Daily check-ins
 * @param {Array}  params.labExams - Lab exam records (Performance tier)
 * @param {Array}  params.protocols - Protocol records (Performance tier)
 * @param {Array}  params.protocolLogs - Protocol administration logs (Performance tier)
 * @param {number} params.rangeDays - Analysis window in days
 * @param {'free'|'pro'|'performance'} params.tier - User subscription tier
 * @returns {Object} Structured health dossier
 */
export function buildHealthDossier({
  profile = {},
  measurements = [],
  workouts = [],
  workoutPlan = null,
  meals = [],
  dietPlan = null,
  checkins = [],
  labExams = [],
  protocols = [],
  protocolLogs = [],
  rangeDays = 30,
  tier = 'free',
}) {
  const todayKey = new Date().toISOString().slice(0, 10);

  const dossier = {
    generated_at: new Date().toISOString(),
    analysis_window_days: rangeDays,
    tier,
    profile: buildProfileSection(profile),
    body: buildBodySection(measurements, todayKey),
    training: buildTrainingSection(workouts, workoutPlan, profile, todayKey, rangeDays),
    nutrition: buildNutritionSection(meals, dietPlan, profile, todayKey),
    recovery: buildRecoverySection(checkins, profile, todayKey),
  };

  // Performance-tier-only sections
  if (tier === 'performance') {
    dossier.lab_exams = buildLabExamsSection(labExams);
    dossier.protocols = buildProtocolsSection(protocols, protocolLogs);
  }

  return dossier;
}

/**
 * Build a minimal teaser dossier for Free users.
 * Contains just enough data for a single surface-level insight.
 */
export function buildTeaserDossier({
  profile = {},
  measurements = [],
  workouts = [],
  checkins = [],
}) {
  const todayKey = new Date().toISOString().slice(0, 10);

  return {
    generated_at: new Date().toISOString(),
    tier: 'free',
    profile: buildProfileSection(profile),
    body: {
      current_weight_kg: (() => {
        const sorted = [...measurements]
          .filter((m) => toNumber(m.weight) !== null)
          .sort((a, b) => (toDateKey(b.date) || '').localeCompare(toDateKey(a.date) || ''));
        return sorted[0] ? toNumber(sorted[0].weight) : null;
      })(),
    },
    training: {
      completed_sessions_last_7d: workouts.filter((w) => {
        const dk = toDateKey(w.completed_at ?? w.date);
        return w.status === 'completed' && dk && withinRange(dk, subtractDays(todayKey, 6), todayKey);
      }).length,
    },
    recovery: {
      avg_sleep_hours: round(
        average(
          checkins
            .filter((c) => withinRange(toDateKey(c.date), subtractDays(todayKey, 6), todayKey))
            .map((c) => toNumber(c.sleep_hours))
            .filter((v) => v !== null)
        )
      ),
      avg_energy: round(
        average(
          checkins
            .filter((c) => withinRange(toDateKey(c.date), subtractDays(todayKey, 6), todayKey))
            .map((c) => toNumber(c.energy))
            .filter((v) => v !== null)
        )
      ),
    },
  };
}
