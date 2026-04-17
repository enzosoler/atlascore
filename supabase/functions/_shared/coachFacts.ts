/**
 * coachFacts.ts — Pre-computed coaching insights for the AI coach.
 *
 * LLMs are bad at math. This module does the arithmetic server-side and
 * hands the coach a bulleted list of human-readable facts it can trust.
 *
 * Each fact is a short string. The coach gets them injected as a system
 * message: "COMPUTED FACTS (pre-calculated, trust these numbers)".
 *
 * Missing data is silently skipped — no NaN, no zeros for absent values.
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ─── Activity multipliers (standard Mifflin-St Jeor TDEE) ────────────────────
// Mifflin MD, St Jeor ST, et al. (1990). Am J Clin Nutr. 51(2):241-7

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary:  1.2,
  light:      1.375,
  moderate:   1.55,
  active:     1.725,
  very_active: 1.9,
};

const ACTIVITY_LABELS: Record<string, string> = {
  sedentary:   'sedentary',
  light:       'light activity',
  moderate:    'moderate activity',
  active:      'active',
  very_active: 'very active',
};

// Maximum facts to return (keeps the prompt under ~400 tokens)
const MAX_FACTS = 15;

// ─── Public API ──────────────────────────────────────────────────────────────

export async function computeCoachFacts(
  supabase: SupabaseClient,
  userId: string,
  profile: any,
): Promise<string[]> {
  const facts: string[] = [];
  const profileData = profile?.profile_data ?? {};

  const now = new Date();
  const todayISO = now.toISOString().split('T')[0];

  // Date boundaries
  const d7 = new Date(now);
  d7.setDate(d7.getDate() - 7);
  const sevenDaysAgo = d7.toISOString().split('T')[0];

  const d14 = new Date(now);
  d14.setDate(d14.getDate() - 14);
  const fourteenDaysAgo = d14.toISOString().split('T')[0];

  const d28 = new Date(now);
  d28.setDate(d28.getDate() - 28);
  const twentyEightDaysAgo = d28.toISOString().split('T')[0];

  const d30 = new Date(now);
  d30.setDate(d30.getDate() - 30);
  const thirtyDaysAgo = d30.toISOString().split('T')[0];

  // ── Fetch all data in parallel ────────────────────────────────────────────

  const [
    measurementsRes,
    foodLogs7dRes,
    foodLogs14dRes,
    workoutLogs28dRes,
  ] = await Promise.all([
    // Last 30 days of weight measurements
    supabase
      .from('measurements')
      .select('date, weight')
      .eq('user_id', userId)
      .gte('date', thirtyDaysAgo)
      .lte('date', todayISO)
      .not('weight', 'is', null)
      .order('date', { ascending: true }),

    // Last 7 days food logs
    supabase
      .from('food_logs')
      .select('date, calories, protein, carbs, fat')
      .eq('user_id', userId)
      .gte('date', `${sevenDaysAgo}T00:00:00`)
      .lte('date', `${todayISO}T23:59:59`),

    // Last 14 days food logs (for adherence)
    supabase
      .from('food_logs')
      .select('date')
      .eq('user_id', userId)
      .gte('date', `${fourteenDaysAgo}T00:00:00`)
      .lte('date', `${todayISO}T23:59:59`),

    // Last 28 days workout logs (completed)
    supabase
      .from('workout_logs')
      .select('date, status')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('date', twentyEightDaysAgo)
      .lte('date', todayISO)
      .order('date', { ascending: true }),
  ]);

  // ── Body composition facts ────────────────────────────────────────────────

  const measurements = (measurementsRes.data ?? []) as Array<{
    date: string;
    weight: number;
  }>;

  if (measurements.length > 0) {
    const latest = measurements[measurements.length - 1];
    const latestWeight = Number(latest.weight);

    if (isFinite(latestWeight) && latestWeight > 0) {
      // 7-day moving average
      const sevenDayWeights = measurements.filter(
        (m) => m.date >= sevenDaysAgo,
      );
      const avg7d =
        sevenDayWeights.length >= 2
          ? sevenDayWeights.reduce((s, m) => s + Number(m.weight), 0) /
            sevenDayWeights.length
          : null;

      let weightLine = `Current weight: ${fmt(latestWeight)} kg`;
      if (avg7d !== null) {
        weightLine += ` (7-day avg: ${fmt(avg7d)} kg)`;
      }
      facts.push(weightLine);

      // 30-day weight trend via linear regression (OLS)
      // Linear regression: ordinary least squares on (day_index, weight) pairs
      if (measurements.length >= 3) {
        const trend = linearRegressionSlope(measurements);
        if (trend !== null) {
          const weeklyChange = trend * 7;
          const absWeekly = Math.abs(weeklyChange);
          let trendLabel: string;
          if (absWeekly < 0.05) {
            trendLabel = 'stable';
          } else if (weeklyChange < 0) {
            trendLabel = `losing ${fmt(absWeekly)} kg/week`;
          } else {
            trendLabel = `gaining ${fmt(absWeekly)} kg/week`;
          }
          facts.push(`30-day trend: ${trendLabel}`);
        }
      }

      // BMR & TDEE
      const bmrTdee = computeBmrTdee(profileData, latestWeight);
      if (bmrTdee) {
        const activityLabel =
          ACTIVITY_LABELS[profileData.activity_level] ?? 'moderate activity';
        facts.push(
          `Estimated TDEE: ${fmtInt(bmrTdee.tdee)} kcal/day (BMR ${fmtInt(bmrTdee.bmr)} x ${bmrTdee.multiplier} ${activityLabel})`,
        );
      }
    }
  }

  // ── Nutrition facts (last 7 days) ─────────────────────────────────────────

  const foodLogs7d = (foodLogs7dRes.data ?? []) as Array<{
    date: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>;

  if (foodLogs7d.length > 0) {
    // Aggregate by day
    const dayTotals: Record<
      string,
      { cal: number; pro: number; carb: number; fat: number }
    > = {};
    for (const log of foodLogs7d) {
      const day = (log.date as string)?.split('T')[0];
      if (!day) continue;
      if (!dayTotals[day])
        dayTotals[day] = { cal: 0, pro: 0, carb: 0, fat: 0 };
      dayTotals[day].cal += Number(log.calories) || 0;
      dayTotals[day].pro += Number(log.protein) || 0;
      dayTotals[day].carb += Number(log.carbs) || 0;
      dayTotals[day].fat += Number(log.fat) || 0;
    }

    const days = Object.values(dayTotals);
    const numDays = days.length;

    if (numDays > 0) {
      const avgCal = days.reduce((s, d) => s + d.cal, 0) / numDays;
      const avgPro = days.reduce((s, d) => s + d.pro, 0) / numDays;
      const avgCarb = days.reduce((s, d) => s + d.carb, 0) / numDays;
      const avgFat = days.reduce((s, d) => s + d.fat, 0) / numDays;

      facts.push(
        `Last 7 days nutrition: avg ${fmtInt(avgCal)} kcal, ${fmtInt(avgPro)}g protein, ${fmtInt(avgCarb)}g carbs, ${fmtInt(avgFat)}g fat (${numDays} days logged)`,
      );

      // Delta from calorie target
      const caloriesTarget =
        Number(profileData?.targets?.calories) ||
        Number(profileData?.calories_target) ||
        0;
      if (caloriesTarget > 0) {
        const delta = avgCal - caloriesTarget;
        const absDelta = Math.abs(delta);
        if (absDelta >= 10) {
          const direction = delta > 0 ? 'over' : 'under';
          facts.push(
            `Averaging ${fmtInt(absDelta)} kcal ${direction} target (${fmtInt(caloriesTarget)} kcal)`,
          );
        }
      }

      // Protein adequacy: g/kg bodyweight
      const latestWeight = getLatestWeight(measurements);
      if (latestWeight && avgPro > 0) {
        const gPerKg = avgPro / latestWeight;
        const adequate = gPerKg >= 1.6;
        facts.push(
          `Protein intake: ${fmt(gPerKg)} g/kg bodyweight${adequate ? ' (adequate)' : ' — LOW, recommend >= 1.6 g/kg'}`,
        );
      }
    }
  }

  // ── Food logging adherence (last 14 days) ─────────────────────────────────

  const foodLogs14d = (foodLogs14dRes.data ?? []) as Array<{ date: string }>;

  if (foodLogs14d.length > 0) {
    const uniqueDays = new Set(
      foodLogs14d.map((l) => (l.date as string)?.split('T')[0]).filter(Boolean),
    );
    const daysWithLogs = uniqueDays.size;
    const pct = Math.round((daysWithLogs / 14) * 100);
    facts.push(`Food logging adherence: ${daysWithLogs}/14 days (${pct}%)`);
  }

  // ── Training facts (last 28 days) ─────────────────────────────────────────

  const workoutLogs28d = (workoutLogs28dRes.data ?? []) as Array<{
    date: string;
    status: string;
  }>;

  if (workoutLogs28d.length > 0) {
    // Sessions per week
    const sessionsPerWeek = (workoutLogs28d.length / 4); // 28 days = 4 weeks
    const spwStr = fmt(sessionsPerWeek);

    // Days since last session
    const lastSessionDate = workoutLogs28d[workoutLogs28d.length - 1].date;
    const daysSinceLast = daysBetween(lastSessionDate, todayISO);

    // Current streak (consecutive days with a session, counting back from today)
    const streak = computeStreak(workoutLogs28d, todayISO);

    let trainingLine = `Training: ${spwStr} sessions/week (last 4 weeks)`;
    if (daysSinceLast === 0) {
      trainingLine += ', trained today';
    } else if (daysSinceLast === 1) {
      trainingLine += ', last session yesterday';
    } else {
      trainingLine += `, last session ${daysSinceLast} days ago`;
    }
    if (streak >= 2) {
      trainingLine += `, ${streak}-day streak`;
    }
    facts.push(trainingLine);

    // Day-of-week training pattern
    const dayCounts: Record<string, number> = {};
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (const log of workoutLogs28d) {
      const dow = new Date(log.date + 'T12:00:00').getDay();
      const name = dayNames[dow];
      dayCounts[name] = (dayCounts[name] ?? 0) + 1;
    }
    // Show days that appear at least 2 times in 28 days (i.e., consistent)
    const usualDays = Object.entries(dayCounts)
      .filter(([_, count]) => count >= 2)
      .sort((a, b) => {
        const order = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        return order.indexOf(a[0]) - order.indexOf(b[0]);
      })
      .map(([day]) => day);
    if (usualDays.length > 0) {
      facts.push(`Usual training days: ${usualDays.join(', ')}`);
    }
  } else {
    // No workouts in 28 days — note this
    facts.push('No training sessions logged in the last 4 weeks');
  }

  // ── Weekend calorie drift ─────────────────────────────────────────────────

  if (foodLogs7d.length > 0) {
    const drift = computeWeekendDrift(foodLogs7d);
    if (drift !== null && Math.abs(drift) >= 50) {
      const direction = drift > 0 ? '+' : '';
      facts.push(
        `Weekend pattern: ${direction}${fmtInt(drift)} kcal avg on weekends vs weekdays`,
      );
    }
  }

  // Trim to MAX_FACTS (keep the first ones — they're ordered by importance)
  return facts.slice(0, MAX_FACTS);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Linear regression: ordinary least squares on (day_index, weight) pairs.
 * Returns the slope in kg/day, or null if insufficient variance.
 */
function linearRegressionSlope(
  measurements: Array<{ date: string; weight: number }>,
): number | null {
  if (measurements.length < 3) return null;

  const firstDate = new Date(measurements[0].date + 'T12:00:00');
  const points = measurements.map((m) => ({
    x: (new Date(m.date + 'T12:00:00').getTime() - firstDate.getTime()) /
      (1000 * 60 * 60 * 24), // day index
    y: Number(m.weight),
  }));

  const n = points.length;
  const sumX = points.reduce((s, p) => s + p.x, 0);
  const sumY = points.reduce((s, p) => s + p.y, 0);
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
  const sumXX = points.reduce((s, p) => s + p.x * p.x, 0);

  const denom = n * sumXX - sumX * sumX;
  if (Math.abs(denom) < 1e-10) return null;

  const slope = (n * sumXY - sumX * sumY) / denom;
  return isFinite(slope) ? slope : null;
}

// Mifflin MD, St Jeor ST, et al. (1990). Am J Clin Nutr. 51(2):241-7
function computeBmrTdee(
  profileData: any,
  weight: number,
): { bmr: number; tdee: number; multiplier: number } | null {
  const height = Number(profileData?.height);
  const age = Number(profileData?.age);
  const sex = profileData?.sex;

  if (!height || !age || !sex || !weight) return null;
  if (!isFinite(height) || !isFinite(age)) return null;

  // Mifflin-St Jeor equation
  // Male:   10 x weight(kg) + 6.25 x height(cm) - 5 x age(y) + 5
  // Female: 10 x weight(kg) + 6.25 x height(cm) - 5 x age(y) - 161
  const sexOffset = sex === 'female' ? -161 : 5;
  const bmr = 10 * weight + 6.25 * height - 5 * age + sexOffset;

  if (!isFinite(bmr) || bmr <= 0) return null;

  const activityLevel = profileData?.activity_level ?? 'moderate';
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] ?? 1.55;
  const tdee = bmr * multiplier;

  return { bmr: Math.round(bmr), tdee: Math.round(tdee), multiplier };
}

function getLatestWeight(
  measurements: Array<{ date: string; weight: number }>,
): number | null {
  if (measurements.length === 0) return null;
  const w = Number(measurements[measurements.length - 1].weight);
  return isFinite(w) && w > 0 ? w : null;
}

function daysBetween(dateA: string, dateB: string): number {
  const a = new Date(dateA + 'T12:00:00');
  const b = new Date(dateB + 'T12:00:00');
  return Math.round(Math.abs(b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Compute consecutive-day training streak counting backwards from today.
 */
function computeStreak(
  workoutLogs: Array<{ date: string }>,
  todayISO: string,
): number {
  const dates = new Set(workoutLogs.map((w) => w.date));
  let streak = 0;
  const d = new Date(todayISO + 'T12:00:00');
  while (true) {
    const key = d.toISOString().split('T')[0];
    if (dates.has(key)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

/**
 * Compute average weekend vs weekday calorie difference.
 * Returns the surplus (positive) or deficit (negative) on weekends, or null
 * if there aren't enough data points in both groups.
 */
function computeWeekendDrift(
  foodLogs: Array<{ date: string; calories: number }>,
): number | null {
  const dayTotals: Record<string, number> = {};
  for (const log of foodLogs) {
    const day = (log.date as string)?.split('T')[0];
    if (!day) continue;
    dayTotals[day] = (dayTotals[day] ?? 0) + (Number(log.calories) || 0);
  }

  let weekdaySum = 0, weekdayCount = 0;
  let weekendSum = 0, weekendCount = 0;

  for (const [dateStr, cals] of Object.entries(dayTotals)) {
    const dow = new Date(dateStr + 'T12:00:00').getDay();
    if (dow === 0 || dow === 6) {
      weekendSum += cals;
      weekendCount++;
    } else {
      weekdaySum += cals;
      weekdayCount++;
    }
  }

  if (weekdayCount < 1 || weekendCount < 1) return null;

  const weekdayAvg = weekdaySum / weekdayCount;
  const weekendAvg = weekendSum / weekendCount;
  return Math.round(weekendAvg - weekdayAvg);
}

// ─── Formatting ──────────────────────────────────────────────────────────────

/** Format a number to 1 decimal place (e.g., 82.3) */
function fmt(n: number): string {
  return n.toFixed(1);
}

/** Format a number as integer with comma grouping (e.g., 2,450) */
function fmtInt(n: number): string {
  return Math.round(n).toLocaleString('en-US');
}
