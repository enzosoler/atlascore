/**
 * workoutHistoryService — per-exercise history and PR computation
 *
 * Reads from the `workouts` table (exercises_completed JSONB).
 * Returns:
 *   - getExerciseHistory(userId, exerciseName) → last N sessions with that exercise
 *   - getPersonalRecords(userId, exerciseNames[]) → map of best weight × reps per exercise
 *   - getLastSessionForExercise(userId, exerciseName) → single "last time" summary
 */
import { supabase } from '@/lib/supabaseClient';

const WORKOUTS_TABLE = 'workouts';
const HISTORY_LOOKBACK = 30; // workouts to scan for history

/** Normalise an exercise name for comparison (lowercase, trim, collapse spaces) */
function normName(name) {
  return (name || '').toLowerCase().trim().replace(/\s+/g, ' ');
}

/**
 * Fetch the last HISTORY_LOOKBACK completed workouts for a user.
 * Cached at call site via react-query.
 */
export async function fetchRecentWorkoutHistory(userId) {
  const { data, error } = await supabase
    .from(WORKOUTS_TABLE)
    .select('id, name, completed_at, exercises_completed')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(HISTORY_LOOKBACK);

  if (error) throw error;
  return data || [];
}

/**
 * From a list of workouts, extract per-exercise personal records.
 * Returns a map: normalisedName → { bestWeight, bestReps, bestVolume, date }
 *
 * "Best weight" = highest single-set load_actual
 * "Best volume" = highest single-set (load × reps)
 */
export function computePersonalRecords(workouts) {
  const records = {};

  for (const w of workouts) {
    const exList = w.exercises_completed;
    if (!Array.isArray(exList)) continue;

    for (const ex of exList) {
      const key = normName(ex.name);
      if (!key) continue;

      const sets = ex.sets_completed || [];
      for (const s of sets) {
        const load = Number(s.load_actual) || 0;
        const reps = Number(s.reps_actual) || 0;
        if (!load && !reps) continue;

        const volume = load * reps;
        const existing = records[key];

        if (!existing || load > existing.bestWeight || volume > existing.bestVolume) {
          records[key] = {
            bestWeight: Math.max(load, existing?.bestWeight ?? 0),
            bestReps:   load >= (existing?.bestWeight ?? 0) ? reps : (existing?.bestReps ?? reps),
            bestVolume: Math.max(volume, existing?.bestVolume ?? 0),
            date: w.completed_at,
          };
        }
      }
    }
  }

  return records;
}

/**
 * For a specific exercise name, return the "last session" summary:
 * { date, sets: [{ reps, load }], maxWeight, avgReps }
 */
export function getLastSession(workouts, exerciseName) {
  const key = normName(exerciseName);

  for (const w of workouts) {
    const exList = w.exercises_completed;
    if (!Array.isArray(exList)) continue;

    const match = exList.find((e) => normName(e.name) === key);
    if (!match) continue;

    const doneSets = (match.sets_completed || []).filter(
      (s) => s.reps_actual || s.load_actual
    );
    if (doneSets.length === 0) continue;

    const loads   = doneSets.map((s) => Number(s.load_actual) || 0);
    const repsCnt = doneSets.map((s) => Number(s.reps_actual) || 0);
    const maxWeight = Math.max(...loads);
    const avgReps   = repsCnt.length
      ? Math.round(repsCnt.reduce((a, b) => a + b, 0) / repsCnt.length)
      : 0;

    return {
      date: w.completed_at,
      sets: doneSets.map((s) => ({
        reps: Number(s.reps_actual) || 0,
        load: Number(s.load_actual) || 0,
      })),
      maxWeight,
      avgReps,
      setCount: doneSets.length,
    };
  }

  return null; // no history
}

/**
 * Check if a newly logged set is a Personal Record (weight or volume).
 * Returns { isPR: bool, type: 'weight' | 'volume' | null }
 */
export function checkSetIsPR(records, exerciseName, load, reps) {
  if (!load || !reps) return { isPR: false, type: null };
  const key = normName(exerciseName);
  const rec = records[key];
  if (!rec) return { isPR: true, type: 'weight' }; // first ever set = PR

  const newVolume = Number(load) * Number(reps);
  const isWeightPR = Number(load) > rec.bestWeight;
  const isVolumePR = newVolume > rec.bestVolume;

  if (isWeightPR) return { isPR: true, type: 'weight' };
  if (isVolumePR) return { isPR: true, type: 'volume' };
  return { isPR: false, type: null };
}
