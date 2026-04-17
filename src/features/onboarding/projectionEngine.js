/**
 * Atlas.Core — Weight Projection Engine
 *
 * Pure-function module. Zero dependencies.
 * All inputs in metric (kg, cm). All outputs in metric.
 */

// ── Constants ────────────────────────────────────────────────────
const KCAL_PER_KG_FAT = 7700;
const AGGRESSIVE_THRESHOLD_PCT = 1.0; // % of BW per week
const UNREALISTIC_THRESHOLD_PCT = 1.5;
const SAFE_RATE_PCT = 0.75; // fallback when unrealistic
const DECAY_EXPONENT = 1.15; // mild exponential decay for curve shape
const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

// ── Timeline parsing ─────────────────────────────────────────────

/**
 * Convert a timeline string to total weeks from today.
 *   '6w'  → 6
 *   '3m'  → 13
 *   '6m'  → 26
 *   ISO date string (e.g. '2026-10-01') → computed weeks
 */
function parseTimeline(timeline) {
  if (typeof timeline !== 'string') return null;

  const shorthand = timeline.match(/^(\d+)(w|m)$/i);
  if (shorthand) {
    const n = parseInt(shorthand[1], 10);
    const unit = shorthand[2].toLowerCase();
    if (unit === 'w') return n;
    if (unit === 'm') return Math.round(n * (52 / 12)); // ~4.33 weeks per month
  }

  // Try ISO date
  const target = new Date(timeline);
  if (!isNaN(target.getTime())) {
    const now = new Date();
    const diffMs = target.getTime() - now.getTime();
    if (diffMs <= 0) return 1; // minimum 1 week
    return Math.max(1, Math.round(diffMs / MS_PER_WEEK));
  }

  return null;
}

// ── Curve generation ─────────────────────────────────────────────

/**
 * Generate the "with Atlas" weight curve.
 * Uses mild exponential decay so early weeks show faster progress
 * and later weeks taper — matching real-world fat loss patterns.
 *
 * Formula: weight = target + (current - target) * (1 - week/total)^1.15
 *   At week 0  → current_weight
 *   At week N  → target_weight
 */
function generateAtlasCurve(currentWeight, targetWeight, totalWeeks) {
  const points = [];
  for (let week = 0; week <= totalWeeks; week++) {
    const progress = week / totalWeeks;
    const remaining = Math.pow(1 - progress, DECAY_EXPONENT);
    const weight = targetWeight + (currentWeight - targetWeight) * remaining;
    points.push({
      week,
      weight: round2(weight),
    });
  }
  return points;
}

/**
 * Generate the "no change" flat line at current weight.
 */
function generateNoChangeCurve(currentWeight, totalWeeks) {
  const points = [];
  for (let week = 0; week <= totalWeeks; week++) {
    points.push({
      week,
      weight: round2(currentWeight),
    });
  }
  return points;
}

// ── Milestones ───────────────────────────────────────────────────

function generateMilestones(currentWeight, targetWeight, totalWeeks) {
  const delta = targetWeight - currentWeight;
  const percentages = [0.25, 0.5, 0.75, 1.0];

  return percentages.map((pct) => {
    const milestoneWeight = currentWeight + delta * pct;
    // Invert the decay formula to find the week for this weight
    // weight = target + (current - target) * (1 - week/total)^exp
    // Solve for week:
    const remaining = (milestoneWeight - targetWeight) / (currentWeight - targetWeight);
    const progress = 1 - Math.pow(Math.max(0, remaining), 1 / DECAY_EXPONENT);
    const week = Math.round(progress * totalWeeks);

    return {
      percent: Math.round(pct * 100),
      weight: round2(milestoneWeight),
      week: Math.min(week, totalWeeks),
      label: `${Math.round(pct * 100)}% of goal`,
    };
  });
}

// ── Helpers ──────────────────────────────────────────────────────

function round2(n) {
  return Math.round(n * 100) / 100;
}

function addWeeks(date, weeks) {
  const result = new Date(date);
  result.setDate(result.getDate() + weeks * 7);
  return result;
}

// ── Main export ──────────────────────────────────────────────────

/**
 * Compute a full weight projection.
 *
 * @param {Object} inputs
 * @param {number} inputs.current_weight  – current weight in kg
 * @param {number} inputs.target_weight   – target weight in kg
 * @param {string} inputs.timeline        – '6w', '3m', '6m', or ISO date
 * @param {string} inputs.sex             – 'male' | 'female'
 * @param {number} inputs.age             – years
 * @param {number} inputs.height_cm       – height in cm
 * @param {string} inputs.activity_level  – 'barely' | 'light' | 'moderate' | 'high' | 'athlete'
 * @param {string[]} inputs.health_goals  – array of goal keys
 *
 * @returns {Object} projection result
 */
export function computeProjection(inputs) {
  const {
    current_weight,
    target_weight,
    timeline,
    sex,
    age,
    height_cm,
    activity_level,
    health_goals,
  } = inputs;

  // ── Parse timeline ───────────────────────────────────────────
  const totalWeeks = parseTimeline(timeline);
  if (!totalWeeks || totalWeeks < 1) {
    throw new Error(`Invalid timeline: "${timeline}"`);
  }

  const now = new Date();
  const targetDate = addWeeks(now, totalWeeks);

  // ── Rates ────────────────────────────────────────────────────
  const totalDelta = current_weight - target_weight; // positive when losing
  const weeklyRateKg = round2(totalDelta / totalWeeks);
  const weeklyRatePct = round2((Math.abs(weeklyRateKg) / current_weight) * 100);

  const isAggressive = weeklyRatePct > AGGRESSIVE_THRESHOLD_PCT;
  const isUnrealistic = weeklyRatePct > UNREALISTIC_THRESHOLD_PCT;

  // ── Suggested weeks (only when unrealistic) ──────────────────
  let suggestedWeeks = null;
  if (isUnrealistic) {
    // Recalculate at the safe rate (0.75% BW/week)
    const safeWeeklyKg = (SAFE_RATE_PCT / 100) * current_weight;
    suggestedWeeks = Math.ceil(Math.abs(totalDelta) / safeWeeklyKg);
  }

  // ── Daily deficit ────────────────────────────────────────────
  // Positive when in deficit (losing weight), negative when surplus (gaining)
  const dailyDeficitKcal = round2((weeklyRateKg * KCAL_PER_KG_FAT) / 7);

  // ── Curves ───────────────────────────────────────────────────
  const curveWithAtlas = generateAtlasCurve(current_weight, target_weight, totalWeeks);
  const curveNoChange = generateNoChangeCurve(current_weight, totalWeeks);

  // ── Milestones ───────────────────────────────────────────────
  const milestones = generateMilestones(current_weight, target_weight, totalWeeks);

  // ── Result ───────────────────────────────────────────────────
  return {
    target_date: targetDate.toISOString().split('T')[0],
    total_weeks: totalWeeks,
    weekly_rate_kg: weeklyRateKg,
    weekly_rate_pct: weeklyRatePct,
    is_aggressive: isAggressive,
    is_unrealistic: isUnrealistic,
    daily_deficit_kcal: dailyDeficitKcal,
    curve_with_atlas: curveWithAtlas,
    curve_no_change: curveNoChange,
    milestones,
    suggested_weeks: suggestedWeeks,
  };
}
