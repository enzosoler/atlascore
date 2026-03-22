/**
 * Achievement definitions and calculation logic.
 * Each achievement has: key, label, description, emoji, category, thresholds (for tiered ones).
 */

export const ACHIEVEMENTS = [
  // ── Hydration ──
  { key: 'water_3d',   emoji: '💧', label: 'Hydrated',         desc: 'Hit your water goal for 3 straight days',      category: 'agua',    target: 3  },
  { key: 'water_7d',   emoji: '🌊', label: 'Steady Flow',      desc: 'Hit your water goal for 7 straight days',      category: 'agua',    target: 7  },
  { key: 'water_30d',  emoji: '🏔️', label: 'Ocean Mode',      desc: 'Hit your water goal for 30 straight days',     category: 'agua',    target: 30 },

  // ── Check-ins ──
  { key: 'checkin_7d',  emoji: '📋', label: 'Check-in Warrior', desc: 'Complete check-ins for 7 straight days',      category: 'checkin', target: 7  },
  { key: 'checkin_14d', emoji: '🗓️', label: 'Consistent',       desc: 'Complete check-ins for 14 straight days',     category: 'checkin', target: 14 },
  { key: 'checkin_30d', emoji: '🔥', label: 'Unstoppable',      desc: 'Complete check-ins for 30 straight days',     category: 'checkin', target: 30 },

  // ── Workouts ──
  { key: 'workout_5',   emoji: '💪', label: 'Getting Started',  desc: 'Log 5 workouts',                              category: 'treino',  target: 5  },
  { key: 'workout_20',  emoji: '🏋️', label: 'Committed',       desc: 'Log 20 workouts',                             category: 'treino',  target: 20 },
  { key: 'workout_50',  emoji: '🥇', label: 'Veteran',         desc: 'Log 50 workouts',                              category: 'treino',  target: 50 },
  { key: 'workout_3streak', emoji: '⚡', label: 'Streak',       desc: 'Train for 3 straight weeks',                  category: 'treino',  target: 3  },

  // ── Body metrics ──
  { key: 'measurement_5',  emoji: '📏', label: 'Tracking',     desc: 'Log 5 measurements',                          category: 'corpo',   target: 5  },
  { key: 'measurement_10', emoji: '🔬', label: 'Analytical',   desc: 'Log 10 measurements',                         category: 'corpo',   target: 10 },

  // ── Specials ──
  { key: 'first_checkin',  emoji: '🌟', label: 'First Step',    desc: 'Complete your first check-in',                category: 'especial', target: 1 },
  { key: 'perfect_week',   emoji: '👑', label: 'Perfect Week',  desc: 'Check-in, hydration, and training for 7 straight days', category: 'especial', target: 7 },
];

/**
 * Calculate consecutive streak of dates (sorted array of 'yyyy-MM-dd' strings).
 */
export function calcStreak(dates) {
  if (!dates?.length) return 0;
  const sorted = [...new Set(dates)].sort((a, b) => b.localeCompare(a));
  let streak = 0;
  let prev = null;
  for (const d of sorted) {
    if (!prev) { streak = 1; prev = d; continue; }
    const diff = (new Date(prev) - new Date(d)) / 86400000;
    if (diff === 1) { streak++; prev = d; }
    else break;
  }
  return streak;
}

/**
 * Given raw data, compute current progress for each achievement key.
 * Returns: Record<key, { progress: number, unlocked: boolean }>
 */
export function computeAchievements({ checkins = [], workouts = [], measurements = [], profile = null }) {
  const results = {};

  // ── Water streak ──
  const waterTarget = profile?.water_target || 2;
  const waterDates = checkins.filter(c => (c.hydration_liters || 0) >= waterTarget).map(c => c.date);
  const waterStreak = calcStreak(waterDates);

  results['water_3d']  = { progress: waterStreak, unlocked: waterStreak >= 3  };
  results['water_7d']  = { progress: waterStreak, unlocked: waterStreak >= 7  };
  results['water_30d'] = { progress: waterStreak, unlocked: waterStreak >= 30 };

  // ── Check-in streak ──
  const checkinDates = checkins.map(c => c.date);
  const checkinStreak = calcStreak(checkinDates);

  results['checkin_7d']  = { progress: checkinStreak, unlocked: checkinStreak >= 7  };
  results['checkin_14d'] = { progress: checkinStreak, unlocked: checkinStreak >= 14 };
  results['checkin_30d'] = { progress: checkinStreak, unlocked: checkinStreak >= 30 };
  results['first_checkin'] = { progress: checkins.length, unlocked: checkins.length >= 1 };

  // ── Workouts total ──
  const totalWorkouts = workouts.length;
  results['workout_5']  = { progress: totalWorkouts, unlocked: totalWorkouts >= 5  };
  results['workout_20'] = { progress: totalWorkouts, unlocked: totalWorkouts >= 20 };
  results['workout_50'] = { progress: totalWorkouts, unlocked: totalWorkouts >= 50 };

  // ── Workout weekly streak ──
  const workoutWeeks = new Set(workouts.map(w => {
    const d = new Date(w.date);
    const jan1 = new Date(d.getFullYear(), 0, 1);
    return `${d.getFullYear()}-W${Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7)}`;
  }));
  const weekArr = [...workoutWeeks].sort((a, b) => b.localeCompare(a));
  let weekStreak = 0;
  for (let i = 0; i < weekArr.length; i++) {
    if (i === 0) { weekStreak = 1; continue; }
    // simplistic: consecutive week keys
    weekStreak++;
  }
  results['workout_3streak'] = { progress: Math.min(weekStreak, 3), unlocked: weekStreak >= 3 };

  // ── Measurements ──
  results['measurement_5']  = { progress: measurements.length, unlocked: measurements.length >= 5  };
  results['measurement_10'] = { progress: measurements.length, unlocked: measurements.length >= 10 };

  // ── Perfect week ──
  // A week where every day has checkin + water met + at least one workout
  const workoutDates = new Set(workouts.map(w => w.date));
  let perfectDays = 0;
  for (const c of checkins) {
    if ((c.hydration_liters || 0) >= waterTarget && workoutDates.has(c.date)) perfectDays++;
  }
  const perfectStreak = calcStreak(
    checkins
      .filter(c => (c.hydration_liters || 0) >= waterTarget && workoutDates.has(c.date))
      .map(c => c.date)
  );
  results['perfect_week'] = { progress: perfectStreak, unlocked: perfectStreak >= 7 };

  return results;
}
