const DAY_IN_MS = 24 * 60 * 60 * 1000;

export const INSIGHT_CATEGORIES = {
  progress: 'progress',
  training: 'training',
  nutrition: 'nutrition',
  recovery: 'recovery',
  next_action: 'next_action',
};

const DEFAULT_SLEEP_TARGET = 7;
const DEFAULT_WATER_TARGET = 2;
const DEFAULT_TRAINING_TARGET = 4;
const LOGGING_LOOKBACK_DAYS = 7;
const CONSISTENCY_LOOKBACK_DAYS = 14;

const ANCHOR_LIFTS = [
  ['bench press', 'bench'],
  ['incline bench press', 'incline bench'],
  ['back squat', 'squat'],
  ['front squat'],
  ['deadlift'],
  ['romanian deadlift', 'rdl'],
  ['barbell row', 'row'],
  ['seated row'],
  ['lat pulldown', 'pulldown', 'pull down'],
  ['overhead press', 'shoulder press'],
];

function isFiniteNumber(value) {
  return Number.isFinite(Number(value));
}

function toNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function toDateKey(value) {
  if (!value) return null;

  if (typeof value === 'string') {
    const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) return match[1];
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function dateAtNoon(dateKey) {
  return new Date(`${dateKey}T12:00:00`);
}

function addDays(dateKey, amount) {
  const next = dateAtNoon(dateKey);
  next.setDate(next.getDate() + amount);
  return next.toISOString().slice(0, 10);
}

function subtractDays(dateKey, amount) {
  return addDays(dateKey, -amount);
}

function daysBetween(laterKey, earlierKey) {
  const later = dateAtNoon(laterKey).getTime();
  const earlier = dateAtNoon(earlierKey).getTime();
  return Math.round((later - earlier) / DAY_IN_MS);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function average(values) {
  const filtered = values.filter(isFiniteNumber).map(Number);
  if (filtered.length === 0) return null;
  return filtered.reduce((sum, value) => sum + value, 0) / filtered.length;
}

function sum(values) {
  return values.filter(isFiniteNumber).map(Number).reduce((total, value) => total + value, 0);
}

function round(value, digits = 1) {
  if (!isFiniteNumber(value)) return null;
  const factor = 10 ** digits;
  return Math.round(Number(value) * factor) / factor;
}

function formatNumber(value, digits = 1) {
  const rounded = round(value, digits);
  return rounded === null ? null : rounded.toFixed(digits);
}

function formatSigned(value, digits = 1, unit = '') {
  const rounded = round(value, digits);
  if (rounded === null) return null;
  const prefix = rounded > 0 ? '+' : '';
  return `${prefix}${rounded.toFixed(digits)}${unit}`;
}

function formatDateLabel(dateKey) {
  if (!dateKey) return null;
  return new Date(`${dateKey}T12:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function buildInsight(category, title, body, priority, direction = 'neutral', metricKey = null) {
  return {
    id: `${category}:${metricKey || title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    category,
    title,
    body,
    priority,
    direction,
    metric_key: metricKey,
  };
}

function normalizeMeasurement(entry = {}) {
  const date = toDateKey(entry.date);
  const weight = toNumber(entry.weight);
  const waist = toNumber(entry.waist);
  const bodyFatPercent = toNumber(entry.body_fat_percent ?? entry.body_fat);
  const bmi = toNumber(entry.bmi);
  const height = toNumber(entry.height);
  const bmr = toNumber(entry.bmr);
  const tdee = toNumber(entry.tdee);

  return {
    ...entry,
    date,
    weight,
    waist,
    body_fat_percent: bodyFatPercent,
    body_fat: bodyFatPercent,
    bmi,
    height,
    bmr,
    tdee,
  };
}

function normalizeWorkout(entry = {}) {
  const date = toDateKey(entry.completed_at ?? entry.date);
  return {
    ...entry,
    date,
    status: typeof entry.status === 'string' ? entry.status : 'completed',
    completed_at: entry.completed_at || null,
    duration_minutes: toNumber(entry.duration_minutes),
    volume_load: toNumber(entry.volume_load),
    exercises_completed: Array.isArray(entry.exercises_completed)
      ? entry.exercises_completed
      : Array.isArray(entry.exercises)
        ? entry.exercises
        : [],
  };
}

function normalizeMeal(entry = {}) {
  return {
    ...entry,
    date: toDateKey(entry.date),
    total_calories: toNumber(entry.total_calories ?? entry.calories ?? entry.kcal),
    total_protein: toNumber(entry.total_protein ?? entry.protein),
    total_carbs: toNumber(entry.total_carbs ?? entry.carbs),
    total_fat: toNumber(entry.total_fat ?? entry.fat),
  };
}

function normalizeCheckin(entry = {}) {
  return {
    ...entry,
    date: toDateKey(entry.date),
    mood: toNumber(entry.mood),
    energy: toNumber(entry.energy),
    sleep_hours: toNumber(entry.sleep_hours),
    hydration_liters: toNumber(entry.hydration_liters),
  };
}

function sortByDateAsc(items) {
  return [...items].sort((left, right) => (left.date || '').localeCompare(right.date || ''));
}

function sortByDateDesc(items) {
  return [...items].sort((left, right) => (right.date || '').localeCompare(left.date || ''));
}

function buildDateRange(startKey, endKey) {
  if (!startKey || !endKey) return [];

  const dates = [];
  let cursor = startKey;
  while (cursor <= endKey) {
    dates.push(cursor);
    cursor = addDays(cursor, 1);
  }

  return dates;
}

function windowBounds(todayKey, days) {
  const end = todayKey;
  const start = subtractDays(todayKey, Math.max(0, days - 1));
  return { start, end };
}

function previousWindowBounds(todayKey, days) {
  const currentStart = subtractDays(todayKey, Math.max(0, days - 1));
  const previousEnd = subtractDays(currentStart, 1);
  const previousStart = subtractDays(previousEnd, Math.max(0, days - 1));
  return { start: previousStart, end: previousEnd };
}

function withinRange(dateKey, startKey, endKey) {
  if (!dateKey || !startKey || !endKey) return false;
  return dateKey >= startKey && dateKey <= endKey;
}

function averagePerLoggedDay(series) {
  const values = series.filter((value) => value !== null && value !== undefined);
  if (values.length === 0) return null;
  return average(values);
}

function extractTargetFrequency(value) {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return value;
  }

  if (typeof value === 'string') {
    const match = value.match(/(\d+(?:\.\d+)?)/);
    if (match) {
      const numeric = Number(match[1]);
      if (Number.isFinite(numeric) && numeric > 0) {
        return numeric;
      }
    }
  }

  return null;
}

function getPlanFrequency(workoutPlan, profile) {
  return (
    extractTargetFrequency(workoutPlan?.frequency) ||
    extractTargetFrequency(Array.isArray(workoutPlan?.days) ? workoutPlan.days.length : null) ||
    extractTargetFrequency(profile?.training_frequency) ||
    DEFAULT_TRAINING_TARGET
  );
}

function getNutritionTargets(profile = {}, dietPlan = null) {
  const source = dietPlan || {};
  return {
    calories: toNumber(source.total_calories ?? profile.calories_target),
    protein: toNumber(source.total_protein ?? profile.protein_target),
    carbs: toNumber(source.total_carbs ?? profile.carbs_target),
    fat: toNumber(source.total_fat ?? profile.fat_target),
    water: toNumber(profile.water_target) || DEFAULT_WATER_TARGET,
  };
}

function getMeasurementChange(series, field) {
  const values = series
    .map((item) => ({ date: item.date, value: toNumber(item[field]) }))
    .filter((item) => item.value !== null)
    .sort((left, right) => left.date.localeCompare(right.date));

  if (values.length < 2) return null;

  const first = values[0];
  const last = values[values.length - 1];
  return {
    first,
    last,
    delta: last.value - first.value,
    days: daysBetween(last.date, first.date),
    samples: values.length,
  };
}

function getWeightTrend(measurements, todayKey) {
  const weightPoints = measurements
    .filter((item) => item.weight !== null)
    .sort((left, right) => left.date.localeCompare(right.date));

  if (weightPoints.length < 2) return null;

  const currentWindow = windowBounds(todayKey, 7);
  const previousWindow = previousWindowBounds(todayKey, 7);
  const currentValues = weightPoints
    .filter((item) => withinRange(item.date, currentWindow.start, currentWindow.end))
    .map((item) => item.weight);
  const previousValues = weightPoints
    .filter((item) => withinRange(item.date, previousWindow.start, previousWindow.end))
    .map((item) => item.weight);

  const hasWeeklyAverage = currentValues.length >= 2 && previousValues.length >= 2;
  if (hasWeeklyAverage) {
    const currentAvg = average(currentValues);
    const previousAvg = average(previousValues);
    return {
      method: 'weekly_average',
      currentAvg,
      previousAvg,
      delta: currentAvg - previousAvg,
      samples: currentValues.length + previousValues.length,
      currentWindow,
      previousWindow,
    };
  }

  const first = weightPoints[0];
  const last = weightPoints[weightPoints.length - 1];
  return {
    method: 'span',
    first,
    last,
    delta: last.weight - first.weight,
    samples: weightPoints.length,
    start: first.date,
    end: last.date,
  };
}

function getLatestMeasurement(measurements) {
  const ordered = sortByDateAsc(measurements);
  return ordered[ordered.length - 1] || null;
}

function getPeriodSlices(items, startKey, endKey) {
  return sortByDateAsc(items).filter((item) => withinRange(item.date, startKey, endKey));
}

function aggregateMealsByDate(meals, startKey, endKey) {
  const buckets = new Map();
  for (const date of buildDateRange(startKey, endKey)) {
    buckets.set(date, {
      date,
      total_calories: 0,
      total_protein: 0,
      total_carbs: 0,
      total_fat: 0,
      count: 0,
    });
  }

  for (const meal of meals) {
    if (!withinRange(meal.date, startKey, endKey)) continue;
    const bucket = buckets.get(meal.date);
    if (!bucket) continue;
    bucket.total_calories += toNumber(meal.total_calories) || 0;
    bucket.total_protein += toNumber(meal.total_protein) || 0;
    bucket.total_carbs += toNumber(meal.total_carbs) || 0;
    bucket.total_fat += toNumber(meal.total_fat) || 0;
    bucket.count += 1;
  }

  return Array.from(buckets.values()).sort((left, right) => left.date.localeCompare(right.date));
}

function aggregateCheckinsByDate(checkins, startKey, endKey) {
  const buckets = new Map();
  for (const date of buildDateRange(startKey, endKey)) {
    buckets.set(date, []);
  }

  for (const checkin of checkins) {
    if (!withinRange(checkin.date, startKey, endKey)) continue;
    if (!buckets.has(checkin.date)) continue;
    buckets.get(checkin.date).push(checkin);
  }

  return Array.from(buckets.entries())
    .map(([date, values]) => ({
      date,
      values,
      latest: values[values.length - 1] || null,
    }))
    .sort((left, right) => left.date.localeCompare(right.date));
}

function countCompletedWorkouts(workouts, startKey, endKey) {
  return workouts.filter((workout) => workout.status === 'completed' && withinRange(workout.date, startKey, endKey)).length;
}

function countDaysWithActivity(items, startKey, endKey, predicate) {
  const days = new Set();
  for (const item of items) {
    if (!withinRange(item.date, startKey, endKey)) continue;
    if (predicate(item)) {
      days.add(item.date);
    }
  }
  return days.size;
}

function buildDailySeries(items, startKey, endKey, mapper) {
  return buildDateRange(startKey, endKey).map((date) => mapper(date, items.filter((item) => item.date === date)));
}

function getSleepTrend(checkins, todayKey, windowDays) {
  const current = windowBounds(todayKey, windowDays);
  const previous = previousWindowBounds(todayKey, windowDays);
  const currentValues = getPeriodSlices(checkins, current.start, current.end)
    .map((item) => item.sleep_hours)
    .filter((value) => value !== null);
  const previousValues = getPeriodSlices(checkins, previous.start, previous.end)
    .map((item) => item.sleep_hours)
    .filter((value) => value !== null);

  if (currentValues.length < 2 || previousValues.length < 2) return null;

  const currentAvg = average(currentValues);
  const previousAvg = average(previousValues);
  if (currentAvg === null || previousAvg === null) return null;

  return {
    currentAvg,
    previousAvg,
    delta: currentAvg - previousAvg,
    currentWindow: current,
    previousWindow: previous,
  };
}

function getEnergyTrend(checkins, todayKey, windowDays) {
  const current = windowBounds(todayKey, windowDays);
  const previous = previousWindowBounds(todayKey, windowDays);
  const currentValues = getPeriodSlices(checkins, current.start, current.end)
    .map((item) => item.energy)
    .filter((value) => value !== null);
  const previousValues = getPeriodSlices(checkins, previous.start, previous.end)
    .map((item) => item.energy)
    .filter((value) => value !== null);

  if (currentValues.length < 2 || previousValues.length < 2) return null;

  const currentAvg = average(currentValues);
  const previousAvg = average(previousValues);
  if (currentAvg === null || previousAvg === null) return null;

  return {
    currentAvg,
    previousAvg,
    delta: currentAvg - previousAvg,
    currentWindow: current,
    previousWindow: previous,
  };
}

function getHydrationTrend(checkins, todayKey, windowDays, waterTarget) {
  const current = windowBounds(todayKey, windowDays);
  const previous = previousWindowBounds(todayKey, windowDays);
  const currentDays = getPeriodSlices(checkins, current.start, current.end);
  const previousDays = getPeriodSlices(checkins, previous.start, previous.end);
  const currentValues = currentDays.map((item) => item.hydration_liters).filter((value) => value !== null);
  const previousValues = previousDays.map((item) => item.hydration_liters).filter((value) => value !== null);

  if (currentValues.length === 0 && previousValues.length === 0) return null;

  const currentHitDays = currentDays.filter((item) => item.hydration_liters !== null && item.hydration_liters >= waterTarget).length;
  const previousHitDays = previousDays.filter((item) => item.hydration_liters !== null && item.hydration_liters >= waterTarget).length;
  const currentTotalDays = currentDays.filter((item) => item.hydration_liters !== null).length;
  const previousTotalDays = previousDays.filter((item) => item.hydration_liters !== null).length;
  const currentWindow = current;
  const previousWindow = previous;

  return {
    currentAvg: average(currentValues),
    previousAvg: average(previousValues),
    currentHitDays,
    previousHitDays,
    currentTotalDays,
    previousTotalDays,
    currentWindow,
    previousWindow,
  };
}

function getCorrelation(pairs) {
  const validPairs = pairs.filter(
    ([x, y]) => x !== null && y !== null && Number.isFinite(x) && Number.isFinite(y)
  );

  if (validPairs.length < 5) return null;

  const xs = validPairs.map(([x]) => x);
  const ys = validPairs.map(([, y]) => y);
  const meanX = average(xs);
  const meanY = average(ys);
  if (meanX === null || meanY === null) return null;

  let numerator = 0;
  let denominatorX = 0;
  let denominatorY = 0;

  for (const [x, y] of validPairs) {
    const dx = x - meanX;
    const dy = y - meanY;
    numerator += dx * dy;
    denominatorX += dx * dx;
    denominatorY += dy * dy;
  }

  const denominator = Math.sqrt(denominatorX * denominatorY);
  if (denominator === 0) return null;

  return numerator / denominator;
}

function getAnchorLiftTrend(workouts, todayKey, lookbackDays = 42) {
  const recentStart = subtractDays(todayKey, lookbackDays - 1);
  const previousEnd = subtractDays(recentStart, 1);
  const previousStart = subtractDays(previousEnd, lookbackDays - 1);

  const sessions = workouts.filter((workout) => workout.status === 'completed' && workout.date);
  const candidateLift = ANCHOR_LIFTS.find((patterns) =>
    sessions.some((session) =>
      (session.exercises_completed || []).some((exercise) =>
        patterns.some((pattern) => normalizeText(exercise?.name).includes(pattern))
      )
    )
  );

  if (!candidateLift) {
    return null;
  }

  const recentLoads = [];
  const previousLoads = [];

  for (const workout of sessions) {
    const exercises = Array.isArray(workout.exercises_completed) ? workout.exercises_completed : [];
    const targetExercises = exercises.filter((exercise) =>
      candidateLift.some((pattern) => normalizeText(exercise?.name).includes(pattern))
    );

    const topLoads = targetExercises
      .map((exercise) => getExerciseTopLoad(exercise))
      .filter((value) => value !== null);

    if (topLoads.length === 0) continue;

    const sessionTopLoad = Math.max(...topLoads);
    if (withinRange(workout.date, recentStart, todayKey)) {
      recentLoads.push(sessionTopLoad);
    } else if (withinRange(workout.date, previousStart, previousEnd)) {
      previousLoads.push(sessionTopLoad);
    }
  }

  if (recentLoads.length < 2 || previousLoads.length < 2) {
    return null;
  }

  const currentAvg = average(recentLoads);
  const previousAvg = average(previousLoads);
  if (currentAvg === null || previousAvg === null) return null;

  const delta = currentAvg - previousAvg;
  return {
    liftLabel: candidateLift[0],
    currentAvg,
    previousAvg,
    delta,
    currentWindow: { start: recentStart, end: todayKey },
    previousWindow: { start: previousStart, end: previousEnd },
  };
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[\s_-]+/g, ' ');
}

function getExerciseTopLoad(exercise = {}) {
  const sets = Array.isArray(exercise.sets_completed)
    ? exercise.sets_completed
    : Array.isArray(exercise.sets)
      ? exercise.sets
      : [];

  const loads = sets
    .map((set) => toNumber(set.load_actual ?? set.load ?? set.weight ?? set.target_weight))
    .filter((value) => value !== null);

  if (loads.length === 0) return null;
  return Math.max(...loads);
}

function getWorkoutVolumeTrend(workouts, todayKey, lookbackDays = 28) {
  const currentStart = subtractDays(todayKey, lookbackDays - 1);
  const previousEnd = subtractDays(currentStart, 1);
  const previousStart = subtractDays(previousEnd, lookbackDays - 1);

  const currentValues = workouts
    .filter((workout) => workout.status === 'completed' && withinRange(workout.date, currentStart, todayKey))
    .map((workout) => workout.volume_load)
    .filter((value) => value !== null);
  const previousValues = workouts
    .filter((workout) => workout.status === 'completed' && withinRange(workout.date, previousStart, previousEnd))
    .map((workout) => workout.volume_load)
    .filter((value) => value !== null);

  if (currentValues.length < 2 || previousValues.length < 2) return null;

  const currentAvg = average(currentValues);
  const previousAvg = average(previousValues);
  if (currentAvg === null || previousAvg === null) return null;

  return {
    currentAvg,
    previousAvg,
    delta: currentAvg - previousAvg,
    currentWindow: { start: currentStart, end: todayKey },
    previousWindow: { start: previousStart, end: previousEnd },
  };
}

function getWindowLengthForTrends(rangeDays) {
  if (rangeDays >= 56) return 28;
  if (rangeDays >= 28) return 14;
  return 7;
}

function getBMRTrend(measurements) {
  const series = measurements
    .map((item) => ({ date: item.date, bmr: item.bmr, tdee: item.tdee }))
    .filter((item) => item.bmr !== null)
    .sort((left, right) => left.date.localeCompare(right.date));

  if (series.length < 2) return null;

  const first = series[0];
  const last = series[series.length - 1];
  return {
    first,
    last,
    delta: last.bmr - first.bmr,
    tdeeDelta: last.tdee !== null && first.tdee !== null ? last.tdee - first.tdee : null,
    days: daysBetween(last.date, first.date),
    samples: series.length,
  };
}

function buildProgressInsight(measurements, profile, todayKey) {
  const ordered = sortByDateAsc(measurements);
  const latest = getLatestMeasurement(ordered);
  if (!latest) {
    return buildInsight(
      INSIGHT_CATEGORIES.progress,
      'Add your first checkpoint.',
      'Record a weight and waist measurement to unlock progress deltas.',
      90,
      'attention',
      'progress_baseline'
    );
  }

  const weightTrend = getWeightTrend(ordered, todayKey);
  const waistChange = getMeasurementChange(ordered.filter((item) => item.waist !== null), 'waist');
  const bodyFatChange = getMeasurementChange(
    ordered.filter((item) => item.body_fat_percent !== null),
    'body_fat_percent'
  );
  const bmrTrend = getBMRTrend(ordered);

  const bodyPieces = [];
  const bodySignals = [];

  if (weightTrend) {
    const delta = weightTrend.delta;
    const label = weightTrend.method === 'weekly_average' ? 'weekly average' : 'since start';
    if (Math.abs(delta) >= 0.1) {
      bodyPieces.push(`Weight ${delta < 0 ? 'is down' : 'is up'} ${Math.abs(delta).toFixed(1)} kg ${label}.`);
      bodySignals.push(delta < 0 ? 'positive' : 'attention');
    } else {
      bodyPieces.push(`Weight has been steady ${label}.`);
      bodySignals.push('neutral');
    }
  }

  if (waistChange && Math.abs(waistChange.delta) >= 0.1) {
    bodyPieces.push(
      `Waist ${waistChange.delta < 0 ? 'is down' : 'is up'} ${Math.abs(waistChange.delta).toFixed(1)} cm since ${formatDateLabel(waistChange.first.date) || 'the first checkpoint'}.`
    );
    bodySignals.push(waistChange.delta < 0 ? 'positive' : 'attention');
  }

  if (bodyFatChange && Math.abs(bodyFatChange.delta) >= 0.05) {
    bodyPieces.push(
      `Body fat ${bodyFatChange.delta < 0 ? 'is down' : 'is up'} ${Math.abs(bodyFatChange.delta).toFixed(1)} points.`
    );
    bodySignals.push(bodyFatChange.delta < 0 ? 'positive' : 'attention');
  }

  if (bmrTrend && Math.abs(bmrTrend.delta) >= 30) {
    const ref = bmrTrend.tdeeDelta !== null ? bmrTrend.tdeeDelta : bmrTrend.delta;
    const metric = bmrTrend.tdeeDelta !== null ? 'TDEE' : 'BMR';
    const absDelta = Math.abs(ref);
    bodyPieces.push(
      `Estimated ${metric} ${ref < 0 ? 'dropped' : 'rose'} ~${Math.round(absDelta)} kcal since ${formatDateLabel(bmrTrend.first.date) || 'the first snapshot'} — ${ref < 0 ? 'possible metabolic adaptation' : 'metabolic rate is up'}.`
    );
    bodySignals.push(ref < 0 ? 'attention' : 'positive');
  }

  if (latest.bmi !== null || (profile?.current_weight && profile?.height_cm)) {
    const bmi = latest.bmi ?? round(profile.current_weight / ((profile.height_cm / 100) ** 2), 1);
    if (bmi !== null) {
      bodyPieces.push(`Current BMI: ${formatNumber(bmi, 1)}.`);
    }
  }

  const titleParts = [];
  if (weightTrend && Math.abs(weightTrend.delta) >= 0.1) {
    titleParts.push(`Weight ${weightTrend.delta < 0 ? 'is down' : 'is up'} ${Math.abs(weightTrend.delta).toFixed(1)} kg`);
  } else if (waistChange && Math.abs(waistChange.delta) >= 0.1) {
    titleParts.push(`Waist ${waistChange.delta < 0 ? 'is down' : 'is up'} ${Math.abs(waistChange.delta).toFixed(1)} cm`);
  } else if (bodyFatChange && Math.abs(bodyFatChange.delta) >= 0.05) {
    titleParts.push(`Body fat ${bodyFatChange.delta < 0 ? 'is down' : 'is up'} ${Math.abs(bodyFatChange.delta).toFixed(1)} points`);
  } else {
    titleParts.push('Your body readings are steady.');
  }

  return buildInsight(
    INSIGHT_CATEGORIES.progress,
    titleParts[0],
    bodyPieces.join(' '),
    90,
    bodySignals.includes('positive')
      ? 'positive'
      : bodySignals.includes('attention')
        ? 'attention'
        : 'neutral',
    'body_progress'
  );
}

function buildTrainingInsight(workouts, profile, workoutPlan, todayKey, rangeDays) {
  const analysisWindow = windowBounds(todayKey, rangeDays);
  const completed = countCompletedWorkouts(workouts, analysisWindow.start, analysisWindow.end);
  const periodWeeks = Math.max(rangeDays / 7, 1);
  const plannedSessions = Math.max(1, Math.round(getPlanFrequency(workoutPlan, profile) * periodWeeks));
  const adherence = clamp((completed / plannedSessions) * 100, 0, 100);
  const sessionDurationValues = workouts
    .filter((workout) => workout.status === 'completed' && withinRange(workout.date, analysisWindow.start, analysisWindow.end))
    .map((workout) => workout.duration_minutes)
    .filter((value) => value !== null);
  const averageDuration = average(sessionDurationValues);
  const anchorTrend = getAnchorLiftTrend(workouts, todayKey, getWindowLengthForTrends(rangeDays) * 2);
  const volumeTrend = !anchorTrend ? getWorkoutVolumeTrend(workouts, todayKey, getWindowLengthForTrends(rangeDays)) : null;

  if (completed === 0) {
    return buildInsight(
      INSIGHT_CATEGORIES.training,
      'No completed workouts in this window yet.',
      `You have ${plannedSessions} planned session${plannedSessions === 1 ? '' : 's'} in the current window. Add one completed workout to unlock adherence and strength trend comparisons.`,
      80,
      'attention',
      'workout_adherence'
    );
  }

  const adherenceText = `${completed} of ${plannedSessions} planned workout${plannedSessions === 1 ? '' : 's'} completed (${Math.round(adherence)}%).`;
  const bodyParts = [adherenceText];

  if (anchorTrend && Math.abs(anchorTrend.delta) >= 0.5) {
    bodyParts.push(
      `${capitalize(anchorTrend.liftLabel)} top set ${anchorTrend.delta > 0 ? 'is up' : 'is down'} ${Math.abs(anchorTrend.delta).toFixed(1)} kg over the last ${daysBetween(anchorTrend.currentWindow.end, anchorTrend.previousWindow.start) + 1} days.`
    );
  } else if (anchorTrend) {
    bodyParts.push(
      `${capitalize(anchorTrend.liftLabel)} has stayed stable while the block has moved forward.`
    );
  } else if (volumeTrend) {
    bodyParts.push(
      `Average session volume ${volumeTrend.delta > 0 ? 'is up' : 'is down'} ${Math.abs(volumeTrend.delta).toFixed(0)} kg vs the prior period.`
    );
  }

  if (averageDuration !== null) {
    bodyParts.push(`Average session duration: ${averageDuration.toFixed(0)} min.`);
  }

  const direction =
    adherence >= 85
      ? 'positive'
      : adherence >= 60
        ? 'neutral'
        : 'attention';

  return buildInsight(
    INSIGHT_CATEGORIES.training,
    `Workout adherence is ${Math.round(adherence)}%.`,
    bodyParts.join(' '),
    80,
    direction,
    'workout_adherence'
  );
}

function buildNutritionInsight(meals, profile, dietPlan, todayKey) {
  const targets = getNutritionTargets(profile, dietPlan);
  const window = windowBounds(todayKey, LOGGING_LOOKBACK_DAYS);
  const dailyMeals = aggregateMealsByDate(meals, window.start, window.end);
  const mealDays = dailyMeals.filter((day) => day.count > 0);
  const loggedDays = mealDays.length;
  const totalDays = dailyMeals.length;

  if (loggedDays === 0) {
    return buildInsight(
      INSIGHT_CATEGORIES.nutrition,
      'Meal logging has not started in this window.',
      'Log a few meals to unlock protein, calorie, and adherence comparisons.',
      75,
      'attention',
      'meal_logging'
    );
  }

  const proteinValues = mealDays.map((day) => day.total_protein);
  const calorieValues = mealDays.map((day) => day.total_calories);
  const avgProtein = averagePerLoggedDay(proteinValues);
  const avgCalories = averagePerLoggedDay(calorieValues);
  const proteinTargetDays = targets.protein
    ? dailyMeals.filter((day) => day.total_protein >= targets.protein * 0.9).length
    : null;
  const calorieTargetDays = targets.calories
    ? dailyMeals.filter((day) => Math.abs(day.total_calories - targets.calories) <= targets.calories * 0.1).length
    : null;

  const bodyParts = [];
  if (targets.protein && avgProtein !== null) {
    bodyParts.push(
      `Protein averaged ${Math.round(avgProtein)}g vs ${Math.round(targets.protein)}g target.`
    );
  }
  if (targets.calories && avgCalories !== null) {
    bodyParts.push(
      `Calories averaged ${Math.round(avgCalories)} kcal vs ${Math.round(targets.calories)} kcal target.`
    );
  }
  if (proteinTargetDays !== null) {
    bodyParts.push(`${proteinTargetDays} of ${totalDays} days hit the protein target.`);
  }
  if (calorieTargetDays !== null) {
    bodyParts.push(`${calorieTargetDays} of ${totalDays} days were within calorie target.`);
  }
  bodyParts.push(`Meals were logged on ${loggedDays} of ${totalDays} days.`);

  const direction =
    targets.protein && avgProtein !== null && avgProtein >= targets.protein * 0.9
      ? 'positive'
      : loggedDays >= 5
        ? 'neutral'
        : 'attention';

  const title =
    targets.protein && avgProtein !== null
      ? `Protein averaged ${Math.round(avgProtein)}g.`
      : `Meals were logged on ${loggedDays} of ${totalDays} days.`;

  return buildInsight(
    INSIGHT_CATEGORIES.nutrition,
    title,
    bodyParts.join(' '),
    70,
    direction,
    'nutrition_adherence'
  );
}

function buildRecoveryInsight(checkins, profile, todayKey, rangeDays) {
  const currentWindow = windowBounds(todayKey, 7);
  const previousWindow = previousWindowBounds(todayKey, 7);
  const currentCheckins = getPeriodSlices(checkins, currentWindow.start, currentWindow.end);
  const previousCheckins = getPeriodSlices(checkins, previousWindow.start, previousWindow.end);

  const sleepTrend = getSleepTrend(checkins, todayKey, 7);
  const energyTrend = getEnergyTrend(checkins, todayKey, 7);
  const waterTarget = toNumber(profile?.water_target) || DEFAULT_WATER_TARGET;
  const hydrationTrend = getHydrationTrend(checkins, todayKey, 7, waterTarget);

  const hasRecoverySignal =
    currentCheckins.some((item) => item.sleep_hours !== null || item.energy !== null || item.hydration_liters !== null) ||
    previousCheckins.some((item) => item.sleep_hours !== null || item.energy !== null || item.hydration_liters !== null);

  if (!hasRecoverySignal) {
    return buildInsight(
      INSIGHT_CATEGORIES.recovery,
      'Add more check-ins to unlock recovery trends.',
      'You need a few days of sleep, energy, or hydration data before recovery patterns become readable.',
      60,
      'attention',
      'recovery_logging'
    );
  }

  const bodyParts = [];

  if (sleepTrend) {
    bodyParts.push(
      `Sleep averaged ${sleepTrend.currentAvg.toFixed(1)}h this week vs ${sleepTrend.previousAvg.toFixed(1)}h last week.`
    );
  }

  if (energyTrend) {
    bodyParts.push(
      `Energy averaged ${energyTrend.currentAvg.toFixed(1)}/5 this week vs ${energyTrend.previousAvg.toFixed(1)}/5 last week.`
    );
  }

  if (hydrationTrend) {
    const hydrationRate = currentCheckins.length
      ? Math.round((hydrationTrend.currentHitDays / Math.max(1, currentCheckins.length)) * 100)
      : 0;
    bodyParts.push(
      `You hit the water goal on ${hydrationTrend.currentHitDays} of ${currentCheckins.length || 7} days (${hydrationRate}%).`
    );
  }

  const sleepValues = currentCheckins.map((item) => item.sleep_hours).filter((value) => value !== null);
  const energyValues = currentCheckins.map((item) => item.energy).filter((value) => value !== null);
  const sleepPairs = currentCheckins
    .filter((item) => item.sleep_hours !== null && item.energy !== null)
    .map((item) => [item.sleep_hours, item.energy]);
  const sleepEnergyCorrelation = getCorrelation(sleepPairs);

  if (sleepEnergyCorrelation !== null && sleepEnergyCorrelation >= 0.5) {
    bodyParts.push('Higher-sleep days also line up with better energy.');
  }

  const direction =
    sleepTrend && sleepTrend.delta < -0.2
      ? 'attention'
      : sleepTrend && sleepTrend.delta > 0.2
        ? 'positive'
        : hydrationTrend && hydrationTrend.currentHitDays > hydrationTrend.previousHitDays
          ? 'positive'
          : 'neutral';

  const title =
    sleepTrend && sleepTrend.currentAvg !== null
      ? `Sleep averaged ${sleepTrend.currentAvg.toFixed(1)}h this week.`
      : `Recovery check-ins are coming through.`;

  return buildInsight(
    INSIGHT_CATEGORIES.recovery,
    title,
    bodyParts.join(' '),
    60,
    direction,
    'recovery_trend'
  );
}

function buildNextActionInsight({
  trainingInsight,
  nutritionInsight,
  recoveryInsight,
  consistencyComponents,
  profile,
  workoutPlan,
  nutritionTargets,
  summaryMetrics,
}) {
  const components = consistencyComponents.filter((item) => item.value !== null && item.value !== undefined);

  if (components.length < 2) {
    return buildInsight(
      INSIGHT_CATEGORIES.next_action,
      'Start with one weight log and one check-in.',
      'Once the app has a little more history, the next best action will become more specific.',
      100,
      'neutral',
      'data_baseline'
    );
  }

  const componentByKey = new Map(components.map((item) => [item.key, item]));
  const weakest = [...components].sort((left, right) => left.value - right.value)[0] || null;

  const proteinTarget = nutritionTargets.protein ? Math.round(nutritionTargets.protein) : null;
  const sleepTarget = DEFAULT_SLEEP_TARGET;
  const waterTarget = nutritionTargets.water || DEFAULT_WATER_TARGET;
  const trainingTarget = getPlanFrequency(workoutPlan, profile);

  switch (weakest.key) {
    case 'workout': {
      const targetLabel = Math.round(trainingTarget);
      return buildInsight(
        INSIGHT_CATEGORIES.next_action,
        `Keep your next ${targetLabel} workout target in play.`,
        `Workout adherence is the lowest signal right now. Completing the next planned session will move the block forward quickly.`,
        100,
        'attention',
        'workout_adherence'
      );
    }
    case 'protein': {
      return buildInsight(
        INSIGHT_CATEGORIES.next_action,
        `Keep protein at or above ${proteinTarget || 160}g tomorrow.`,
        'Protein is the smallest nutrition lever right now and usually improves recovery and training quality fast.',
        100,
        'attention',
        'protein_adherence'
      );
    }
    case 'sleep': {
      return buildInsight(
        INSIGHT_CATEGORIES.next_action,
        `Prioritize ${sleepTarget}+ hours of sleep for 3 nights in a row.`,
        'Sleep is currently the easiest recovery lever to improve quickly and it tends to lift energy within a few days.',
        100,
        'attention',
        'sleep_adherence'
      );
    }
    case 'hydration': {
      return buildInsight(
        INSIGHT_CATEGORIES.next_action,
        `Hit your water goal for the next 2 days.`,
        `Hydration is a weak spot right now. The current target is about ${waterTarget.toFixed(1)}L per day.`,
        100,
        'attention',
        'hydration_adherence'
      );
    }
    case 'logging': {
      return buildInsight(
        INSIGHT_CATEGORIES.next_action,
        'Log every meal for 3 straight days.',
        'Meal logging consistency is the fastest way to make calorie and protein insights more trustworthy.',
        100,
        'attention',
        'meal_logging'
      );
    }
    case 'checkins': {
      return buildInsight(
        INSIGHT_CATEGORIES.next_action,
        'Complete your next check-in.',
        'Check-ins are the easiest way to unlock recovery patterns like sleep, energy, and hydration.',
        100,
        'attention',
        'checkin_logging'
      );
    }
    default: {
      const scoreLabel = weakest.value >= 85 ? 'strong' : weakest.value >= 70 ? 'good' : 'needs attention';
      return buildInsight(
        INSIGHT_CATEGORIES.next_action,
        `Your ${weakest.label.toLowerCase()} signal is ${scoreLabel}.`,
        'Keep the smallest gap in focus for the next 2 to 3 days and the rest of the dashboard gets easier to read.',
        100,
        weakest.value >= 85 ? 'positive' : weakest.value >= 70 ? 'neutral' : 'attention',
        weakest.key
      );
    }
  }
}

function computeConsistencyScore({
  trainingScore = null,
  checkinScore = null,
  nutritionScore = null,
  hydrationScore = null,
}) {
  const weighted = [
    { key: 'workout', weight: 0.35, value: trainingScore },
    { key: 'checkins', weight: 0.25, value: checkinScore },
    { key: 'protein', weight: 0.20, value: nutritionScore },
    { key: 'hydration', weight: 0.20, value: hydrationScore },
  ].filter((item) => item.value !== null && item.value !== undefined);

  if (weighted.length < 2) return null;

  const totalWeight = weighted.reduce((total, item) => total + item.weight, 0);
  const score = weighted.reduce((total, item) => total + item.value * (item.weight / totalWeight), 0);
  return round(score, 0);
}

function getConsistencyLabel(score) {
  if (score === null) return 'Not enough data yet';
  if (score >= 85) return 'Strong consistency over the last 2 weeks';
  if (score >= 70) return 'Solid consistency with a few weak spots';
  if (score >= 50) return 'Mixed consistency that is worth tightening up';
  return 'Consistency needs more structure';
}

function buildSummaryCards({
  measurements,
  workouts,
  meals,
  checkins,
  profile,
  workoutPlan,
  dietPlan,
  todayKey,
  rangeDays,
}) {
  const thisWeek = windowBounds(todayKey, 7);
  const previousWeek = previousWindowBounds(todayKey, 7);
  const thisWeekMeasurements = getPeriodSlices(measurements, thisWeek.start, thisWeek.end);
  const previousWeekMeasurements = getPeriodSlices(measurements, previousWeek.start, previousWeek.end);
  const thisWeekWorkouts = getPeriodSlices(workouts, thisWeek.start, thisWeek.end);
  const previousWeekWorkouts = getPeriodSlices(workouts, previousWeek.start, previousWeek.end);
  const thisWeekMeals = getPeriodSlices(meals, thisWeek.start, thisWeek.end);
  const thisWeekCheckins = getPeriodSlices(checkins, thisWeek.start, thisWeek.end);

  const trainingTarget = getPlanFrequency(workoutPlan, profile);
  const weekCompletedWorkouts = thisWeekWorkouts.filter((workout) => workout.status === 'completed').length;
  const weekWorkoutAdherence = clamp((weekCompletedWorkouts / trainingTarget) * 100, 0, 100);

  const mealBuckets = aggregateMealsByDate(meals, thisWeek.start, thisWeek.end);
  const proteinLoggedDays = mealBuckets.filter((day) => day.count > 0);
  const proteinAverage = averagePerLoggedDay(proteinLoggedDays.map((day) => day.total_protein));
  const calorieAverage = averagePerLoggedDay(proteinLoggedDays.map((day) => day.total_calories));

  const sleepValues = thisWeekCheckins.map((item) => item.sleep_hours).filter((value) => value !== null);
  const energyValues = thisWeekCheckins.map((item) => item.energy).filter((value) => value !== null);
  const hydrationValues = thisWeekCheckins.map((item) => item.hydration_liters).filter((value) => value !== null);
  const waterTarget = toNumber(profile?.water_target) || DEFAULT_WATER_TARGET;
  const hydrationHitDays = thisWeekCheckins.filter(
    (item) => item.hydration_liters !== null && item.hydration_liters >= waterTarget
  ).length;

  const weightTrend = getWeightTrend(measurements, todayKey);
  const weightDelta = weightTrend ? weightTrend.delta : null;
  const previousWeightTrend = getMeasurementChange(previousWeekMeasurements.filter((item) => item.weight !== null), 'weight');
  const currentWeightWeek = getMeasurementChange(thisWeekMeasurements.filter((item) => item.weight !== null), 'weight');

  const sinceStartWeight = getMeasurementChange(measurements.filter((item) => item.weight !== null), 'weight');
  const sinceStartWaist = getMeasurementChange(measurements.filter((item) => item.waist !== null), 'waist');
  const sinceStartBodyFat = getMeasurementChange(
    measurements.filter((item) => item.body_fat_percent !== null),
    'body_fat_percent'
  );

  const currentCheckinScore = thisWeekCheckins.length ? clamp((thisWeekCheckins.length / 7) * 100, 0, 100) : null;
  const mealLoggingScore = thisWeekMeals.length ? clamp((proteinLoggedDays.length / 7) * 100, 0, 100) : null;
  const hydrationScore =
    thisWeekCheckins.some((item) => item.hydration_liters !== null)
      ? clamp((hydrationHitDays / 7) * 100, 0, 100)
      : null;

  const consistencyScore = computeConsistencyScore({
    trainingScore: weekWorkoutAdherence,
    checkinScore: currentCheckinScore,
    nutritionScore: mealLoggingScore,
    hydrationScore,
  });

  const consistencyComponents = [
    {
      key: 'workout',
      label: 'Training',
      value: weekWorkoutAdherence !== null ? Math.round(weekWorkoutAdherence) : null,
    },
    {
      key: 'checkins',
      label: 'Check-ins',
      value: currentCheckinScore !== null ? Math.round(currentCheckinScore) : null,
    },
    {
      key: 'protein',
      label: 'Nutrition logging',
      value: mealLoggingScore !== null ? Math.round(mealLoggingScore) : null,
    },
    {
      key: 'hydration',
      label: 'Hydration',
      value: hydrationScore !== null ? Math.round(hydrationScore) : null,
    },
  ];

  const thisWeekItems = [
    {
      label: 'Workouts',
      value: `${weekCompletedWorkouts}/${Math.round(trainingTarget)}`,
      detail: `${Math.round(weekWorkoutAdherence)}% adherence`,
      tone: weekWorkoutAdherence >= 85 ? 'positive' : weekWorkoutAdherence >= 60 ? 'neutral' : 'attention',
      key: 'workout',
    },
    {
      label: 'Protein',
      value: proteinAverage !== null ? `${Math.round(proteinAverage)}g avg` : '—',
      detail: targetsLabel(dietPlan, profile, 'protein'),
      tone:
        dietPlan || profile?.protein_target
          ? proteinAverage !== null && toNumber(dietPlan?.total_protein ?? profile?.protein_target)
            ? proteinAverage >= toNumber(dietPlan?.total_protein ?? profile?.protein_target) * 0.9
              ? 'positive'
              : 'attention'
            : 'neutral'
          : 'neutral',
      key: 'protein',
    },
    {
      label: 'Sleep',
      value: average(sleepValues) !== null ? `${average(sleepValues).toFixed(1)}h` : '—',
      detail: sleepValues.length ? `${sleepValues.length} check-ins` : 'Add check-ins',
      tone: sleepValues.length ? 'neutral' : 'attention',
      key: 'sleep',
    },
    {
      label: 'Water',
      value:
        hydrationValues.length > 0
          ? `${average(hydrationValues).toFixed(1)}L`
          : '—',
      detail:
        hydrationValues.length > 0
          ? `${hydrationHitDays}/7 days hit target`
          : `Target ${waterTarget.toFixed(1)}L`,
      tone: hydrationHitDays >= 4 ? 'positive' : hydrationValues.length > 0 ? 'neutral' : 'attention',
      key: 'hydration',
    },
    {
      label: 'Weight',
      value:
        currentWeightWeek && previousWeekMeasurements.length >= 2 && previousWeightTrend
          ? formatSigned(currentWeightWeek.delta, 1, ' kg')
          : weightDelta !== null
            ? formatSigned(weightDelta, 1, ' kg')
            : '—',
      detail:
        currentWeightWeek && previousWeekMeasurements.length >= 2
          ? 'vs last week'
          : sinceStartWeight
            ? `vs ${formatDateLabel(sinceStartWeight.first.date) || 'first record'}`
            : 'Add a second checkpoint',
      tone:
        weightDelta !== null
          ? weightDelta < 0
            ? 'positive'
            : weightDelta > 0
              ? 'attention'
              : 'neutral'
          : 'neutral',
      key: 'weight',
    },
  ];

  const sinceStartItems = [
    {
      label: 'Weight',
      value: sinceStartWeight ? formatSigned(sinceStartWeight.delta, 1, ' kg') : '—',
      detail: sinceStartWeight
        ? `${formatDateLabel(sinceStartWeight.first.date)} to ${formatDateLabel(sinceStartWeight.last.date)}`
        : 'Add 2 checkpoints',
      tone:
        sinceStartWeight && sinceStartWeight.delta < 0
          ? 'positive'
          : sinceStartWeight && sinceStartWeight.delta > 0
            ? 'attention'
            : 'neutral',
      key: 'weight_since',
    },
    {
      label: 'Waist',
      value: sinceStartWaist ? formatSigned(sinceStartWaist.delta, 1, ' cm') : '—',
      detail: sinceStartWaist ? 'since first record' : 'Add a waist log',
      tone:
        sinceStartWaist && sinceStartWaist.delta < 0
          ? 'positive'
          : sinceStartWaist && sinceStartWaist.delta > 0
            ? 'attention'
            : 'neutral',
      key: 'waist_since',
    },
    {
      label: 'Body fat',
      value: sinceStartBodyFat ? formatSigned(sinceStartBodyFat.delta, 1, ' pts') : '—',
      detail: sinceStartBodyFat ? 'since first record' : 'Add a body fat reading',
      tone:
        sinceStartBodyFat && sinceStartBodyFat.delta < 0
          ? 'positive'
          : sinceStartBodyFat && sinceStartBodyFat.delta > 0
            ? 'attention'
            : 'neutral',
      key: 'bodyfat_since',
    },
    {
      label: 'Workouts',
      value: `${countCompletedWorkouts(workouts, measurements[0]?.date || previousWeek.start || todayKey, todayKey)}`,
      detail: 'completed sessions',
      tone: weekCompletedWorkouts > 0 ? 'positive' : 'attention',
      key: 'workouts_since',
    },
  ];

  const trendItems = [
    {
      label: 'Training',
      value:
        trainingTrendLabel({
          anchorTrend: getAnchorLiftTrend(workouts, todayKey, getWindowLengthForTrends(rangeDays) * 2),
          volumeTrend: getWorkoutVolumeTrend(workouts, todayKey, getWindowLengthForTrends(rangeDays)),
        }),
      detail:
        trainingTrendDetail({
          anchorTrend: getAnchorLiftTrend(workouts, todayKey, getWindowLengthForTrends(rangeDays) * 2),
          volumeTrend: getWorkoutVolumeTrend(workouts, todayKey, getWindowLengthForTrends(rangeDays)),
        }),
      tone: 'neutral',
      key: 'training_trend',
    },
    {
      label: 'Sleep',
      value:
        buildTrendValue(
          getSleepTrend(checkins, todayKey, 7),
          'h'
        ) || 'Add check-ins',
      detail:
        getSleepTrend(checkins, todayKey, 7)
          ? 'vs previous week'
          : 'Need more sleep data',
      tone:
        getSleepTrend(checkins, todayKey, 7)
          ? getSleepTrend(checkins, todayKey, 7).delta > 0
            ? 'positive'
            : getSleepTrend(checkins, todayKey, 7).delta < 0
              ? 'attention'
              : 'neutral'
          : 'attention',
      key: 'sleep_trend',
    },
    {
      label: 'Hydration',
      value:
        hydrationTrendLabel(getHydrationTrend(checkins, todayKey, 7, waterTarget)) ||
        'Add hydration logs',
      detail:
        getHydrationTrend(checkins, todayKey, 7, waterTarget)
          ? `${getHydrationTrend(checkins, todayKey, 7, waterTarget).currentHitDays}/${thisWeekCheckins.length || 7} days hit goal`
          : 'Need more hydration data',
      tone:
        getHydrationTrend(checkins, todayKey, 7, waterTarget) &&
        getHydrationTrend(checkins, todayKey, 7, waterTarget).currentHitDays >
          getHydrationTrend(checkins, todayKey, 7, waterTarget).previousHitDays
          ? 'positive'
          : 'neutral',
      key: 'hydration_trend',
    },
  ];

  return {
    consistencyScore,
    consistencyLabel: getConsistencyLabel(consistencyScore),
    consistencyComponents,
    thisWeek: thisWeekItems,
    sinceStart: sinceStartItems,
    trends: trendItems,
    summaryWindow: thisWeek,
  };
}

function targetsLabel(dietPlan, profile, key) {
  const source = dietPlan || profile || {};
  const labelMap = {
    protein: source.total_protein ?? source.protein_target,
    calories: source.total_calories ?? source.calories_target,
    carbs: source.total_carbs ?? source.carbs_target,
    fat: source.total_fat ?? source.fat_target,
  };
  const value = toNumber(labelMap[key]);
  return value ? `Goal ${Math.round(value)}${key === 'calories' ? ' kcal' : 'g'}` : 'Goal not set';
}

function buildTrendValue(trend, unit = '') {
  if (!trend) return null;
  if (trend.delta === null || trend.delta === undefined) return null;
  const sign = trend.delta > 0 ? '+' : '';
  return `${sign}${trend.delta.toFixed(1)}${unit}`;
}

function hydrationTrendLabel(trend) {
  if (!trend) return null;
  if (trend.currentHitDays === trend.previousHitDays) return `${trend.currentHitDays} hit days`;
  return trend.currentHitDays > trend.previousHitDays
    ? `Up to ${trend.currentHitDays} hit days`
    : `Down to ${trend.currentHitDays} hit days`;
}

function trainingTrendLabel({ anchorTrend, volumeTrend }) {
  if (anchorTrend && Math.abs(anchorTrend.delta) >= 0.5) {
    return `${capitalize(anchorTrend.liftLabel)} ${anchorTrend.delta > 0 ? 'up' : 'down'} ${Math.abs(anchorTrend.delta).toFixed(1)}kg`;
  }

  if (anchorTrend) {
    return `${capitalize(anchorTrend.liftLabel)} stable`;
  }

  if (volumeTrend) {
    return `Volume ${volumeTrend.delta > 0 ? 'up' : 'down'} ${Math.abs(volumeTrend.delta).toFixed(0)}kg`;
  }

  return 'Need more training data';
}

function trainingTrendDetail({ anchorTrend, volumeTrend }) {
  if (anchorTrend && Math.abs(anchorTrend.delta) >= 0.5) {
    return 'strength trend';
  }
  if (anchorTrend) {
    return 'strength has held steady';
  }
  if (volumeTrend) {
    return 'session volume trend';
  }
  return 'log a few more completed workouts';
}

function capitalize(value) {
  const text = String(value || '');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function summaryNextActionInput({
  profile,
  workoutPlan,
  nutritionTargets,
  summaryMetrics,
  consistencyComponents,
  trainingInsight,
  nutritionInsight,
  recoveryInsight,
}) {
  return {
    profile,
    workoutPlan,
    nutritionTargets,
    summaryMetrics,
    consistencyComponents,
    trainingInsight,
    nutritionInsight,
    recoveryInsight,
  };
}

export function computeProgressInsights(userData = {}) {
  const todayKey = toDateKey(userData.today || new Date()) || toDateKey(new Date());
  const measurements = sortByDateAsc((userData.measurements || []).map(normalizeMeasurement));
  return buildProgressInsight(measurements, userData.profile || {}, todayKey);
}

export function computeTrainingInsights(userData = {}) {
  const todayKey = toDateKey(userData.today || new Date()) || toDateKey(new Date());
  const workouts = sortByDateAsc((userData.workouts || []).map(normalizeWorkout));
  return buildTrainingInsight(
    workouts,
    userData.profile || {},
    userData.workoutPlan || null,
    todayKey,
    userData.rangeDays || 30
  );
}

export function computeNutritionInsights(userData = {}) {
  const todayKey = toDateKey(userData.today || new Date()) || toDateKey(new Date());
  const meals = sortByDateAsc((userData.meals || []).map(normalizeMeal));
  return buildNutritionInsight(
    meals,
    userData.profile || {},
    userData.dietPlan || null,
    todayKey
  );
}

export function computeRecoveryInsights(userData = {}) {
  const todayKey = toDateKey(userData.today || new Date()) || toDateKey(new Date());
  const checkins = sortByDateAsc((userData.checkins || []).map(normalizeCheckin));
  return buildRecoveryInsight(
    checkins,
    userData.profile || {},
    todayKey,
    userData.rangeDays || 30
  );
}

export function computeNextActionInsight(userData = {}) {
  const todayKey = toDateKey(userData.today || new Date()) || toDateKey(new Date());
  const measurements = sortByDateAsc((userData.measurements || []).map(normalizeMeasurement));
  const workouts = sortByDateAsc((userData.workouts || []).map(normalizeWorkout));
  const meals = sortByDateAsc((userData.meals || []).map(normalizeMeal));
  const checkins = sortByDateAsc((userData.checkins || []).map(normalizeCheckin));
  const progressInsight = buildProgressInsight(measurements, userData.profile || {}, todayKey);
  const trainingInsight = buildTrainingInsight(
    workouts,
    userData.profile || {},
    userData.workoutPlan || null,
    todayKey,
    userData.rangeDays || 30
  );
  const nutritionInsight = buildNutritionInsight(
    meals,
    userData.profile || {},
    userData.dietPlan || null,
    todayKey
  );
  const recoveryInsight = buildRecoveryInsight(
    checkins,
    userData.profile || {},
    todayKey,
    userData.rangeDays || 30
  );

  const summary = buildSummaryCards({
    measurements,
    workouts,
    meals,
    checkins,
    profile: userData.profile || {},
    workoutPlan: userData.workoutPlan || null,
    dietPlan: userData.dietPlan || null,
    todayKey,
    rangeDays: userData.rangeDays || 30,
  });

  return buildNextActionInsight(
    summaryNextActionInput({
      profile: userData.profile || {},
      workoutPlan: userData.workoutPlan || null,
      nutritionTargets: getNutritionTargets(userData.profile || {}, userData.dietPlan || null),
      summaryMetrics: summary,
      consistencyComponents: summary.consistencyComponents,
      trainingInsight,
      nutritionInsight,
      recoveryInsight,
    })
  );
}

export function generateMvpInsights(userData = {}) {
  const todayKey = toDateKey(userData.today || new Date()) || toDateKey(new Date());
  const rangeDays = userData.rangeDays || 30;
  const measurements = sortByDateAsc((userData.measurements || []).map(normalizeMeasurement));
  const workouts = sortByDateAsc((userData.workouts || []).map(normalizeWorkout));
  const meals = sortByDateAsc((userData.meals || []).map(normalizeMeal));
  const checkins = sortByDateAsc((userData.checkins || []).map(normalizeCheckin));
  const profile = userData.profile || {};
  const workoutPlan = userData.workoutPlan || null;
  const dietPlan = userData.dietPlan || null;

  const progressInsight = buildProgressInsight(measurements, profile, todayKey);
  const trainingInsight = buildTrainingInsight(workouts, profile, workoutPlan, todayKey, rangeDays);
  const nutritionInsight = buildNutritionInsight(meals, profile, dietPlan, todayKey);
  const recoveryInsight = buildRecoveryInsight(checkins, profile, todayKey, rangeDays);
  const summary = buildSummaryCards({
    measurements,
    workouts,
    meals,
    checkins,
    profile,
    workoutPlan,
    dietPlan,
    todayKey,
    rangeDays,
  });
  const nextActionInsight = buildNextActionInsight(
    summaryNextActionInput({
      profile,
      workoutPlan,
      nutritionTargets: getNutritionTargets(profile, dietPlan),
      summaryMetrics: summary,
      consistencyComponents: summary.consistencyComponents,
      trainingInsight,
      nutritionInsight,
      recoveryInsight,
    })
  );

  const insights = [
    progressInsight,
    trainingInsight,
    nutritionInsight,
    recoveryInsight,
    nextActionInsight,
  ]
    .filter(Boolean)
    .sort((left, right) => right.priority - left.priority);

  return {
    insights,
    summary,
    generatedAt: new Date().toISOString(),
  };
}
