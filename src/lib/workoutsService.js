/**
 * workoutsService — thin wrapper around Supabase for the workouts domain.
 *
 * Schema references (see docs/BACKEND_TODO.md #3):
 *   workout_sessions(id, user_id, routine_id, started_at, ended_at,
 *                    duration_sec, total_volume_kg, note, created_at)
 *   workout_sets(id, session_id, exercise_id, set_index, weight_kg,
 *                reps, rir, rest_sec, is_warmup, performed_at)
 *   routines(id, user_id, name, source_preset_id, days jsonb,
 *            created_at, updated_at, last_used_at)
 *
 * RLS filters rows to the current user server-side; we still gate on
 * user_id client-side for explicit safety + better error messages.
 *
 * Mutating functions (saveWorkoutSession, cloneRoutineFromPreset,
 * markRoutineUsed) throw on failure so callers can decide how to surface
 * the error. Read-only functions return `null`/`[]` on failure so the UI's
 * empty state can render honestly.
 */
import { supabase } from '@/lib/supabaseClient';

/** Resolve the current authenticated user id, or null if not signed in. */
async function getCurrentUserId() {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data?.user?.id || null;
  } catch (err) {
    console.error('[workoutsService] getCurrentUserId failed', err);
    return null;
  }
}

/**
 * Epley 1RM — w * (1 + r/30). Returns 0 when inputs are invalid.
 */
export function epley1RM(weightKg, reps) {
  const w = Number(weightKg);
  const r = Number(reps);
  if (!Number.isFinite(w) || !Number.isFinite(r) || w <= 0 || r <= 0) return 0;
  return w * (1 + r / 30);
}

/* ─── Sessions ─────────────────────────────────────────────────────────── */

/**
 * saveWorkoutSession — insert a session then bulk-insert its sets.
 *
 * Accepts EITHER of two shapes for backward compatibility:
 *
 *  A) Flat sets (preferred, matches the service contract):
 *     {
 *       routineId, startedAt, endedAt, note,
 *       sets: [{ exerciseId, setIndex, weightKg, reps, rir, restSec, isWarmup }]
 *     }
 *
 *  B) Nested per-exercise (legacy ActiveWorkout shape):
 *     {
 *       routineId, startedAt, endedAt, note,
 *       exercises: [{ exerciseId, sets: [{ weight, reps, rir, restSec, isWarmup }] }]
 *     }
 *
 * `duration_sec` and `total_volume_kg` (working sets only, warmups excluded)
 * are computed client-side from the inputs.
 *
 * On success returns `{ session, sets }` (both as persisted, with generated ids).
 * On failure THROWS with a user-readable message so callers can keep the
 * user on-screen.
 */
export async function saveWorkoutSession({
  routineId = null,
  startedAt,
  endedAt,
  exercises = null,
  sets: flatSets = null,
  note = null,
} = {}) {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('You must be signed in to save a workout.');
  }

  const startedIso = startedAt instanceof Date ? startedAt.toISOString() : startedAt;
  const endedIso = endedAt instanceof Date ? endedAt.toISOString() : endedAt;
  const durationSec =
    startedIso && endedIso
      ? Math.max(0, Math.round((new Date(endedIso).getTime() - new Date(startedIso).getTime()) / 1000))
      : null;

  // Normalize inputs to a single flat list of prepared rows (without session_id).
  const preparedRows = [];

  if (Array.isArray(flatSets) && flatSets.length > 0) {
    // Shape A — flat sets.
    flatSets.forEach((s, i) => {
      if (!s || !s.exerciseId) return;
      const weight = s.weightKg == null || s.weightKg === '' ? null : Number(s.weightKg);
      const reps = s.reps == null || s.reps === '' ? null : Number(s.reps);
      if (weight == null && reps == null) return; // never-touched row
      preparedRows.push({
        exercise_id: s.exerciseId,
        set_index: Number.isFinite(s.setIndex) ? s.setIndex : i + 1,
        weight_kg: Number.isFinite(weight) ? weight : null,
        reps: Number.isFinite(reps) ? reps : null,
        rir: s.rir == null || s.rir === '' ? null : Number(s.rir),
        rest_sec: s.restSec == null || s.restSec === '' ? null : Number(s.restSec),
        is_warmup: !!s.isWarmup,
      });
    });
  } else if (Array.isArray(exercises) && exercises.length > 0) {
    // Shape B — nested per-exercise.
    for (const ex of exercises) {
      if (!ex?.exerciseId || !Array.isArray(ex.sets)) continue;
      ex.sets.forEach((s, idx) => {
        const weight = s.weight === '' || s.weight == null ? null : Number(s.weight);
        const reps = s.reps === '' || s.reps == null ? null : Number(s.reps);
        if (weight == null && reps == null) return;
        preparedRows.push({
          exercise_id: ex.exerciseId,
          set_index: idx + 1,
          weight_kg: Number.isFinite(weight) ? weight : null,
          reps: Number.isFinite(reps) ? reps : null,
          rir: s.rir == null || s.rir === '' ? null : Number(s.rir),
          rest_sec: s.restSec == null || s.restSec === '' ? null : Number(s.restSec),
          is_warmup: !!s.isWarmup,
        });
      });
    }
  }

  // Compute working-set volume client-side.
  let totalVolume = 0;
  for (const r of preparedRows) {
    if (r.is_warmup) continue;
    const w = Number(r.weight_kg) || 0;
    const reps = Number(r.reps) || 0;
    totalVolume += w * reps;
  }

  // 1) Insert the session row.
  const { data: session, error: sessionError } = await supabase
    .from('workout_sessions')
    .insert({
      user_id: userId,
      routine_id: routineId || null,
      started_at: startedIso,
      ended_at: endedIso,
      duration_sec: durationSec,
      total_volume_kg: Number.isFinite(totalVolume) ? totalVolume : null,
      note: note || null,
    })
    .select()
    .single();

  if (sessionError || !session) {
    console.error('[workoutsService] saveWorkoutSession session insert failed', sessionError);
    throw new Error(sessionError?.message || 'Failed to save workout session.');
  }

  // 2) Bulk-insert sets with the returned session id.
  let savedSets = [];
  if (preparedRows.length > 0) {
    const setRows = preparedRows.map((r) => ({ ...r, session_id: session.id }));
    const { data: insertedSets, error: setsError } = await supabase
      .from('workout_sets')
      .insert(setRows)
      .select();

    if (setsError) {
      console.error('[workoutsService] saveWorkoutSession sets insert failed', setsError);
      // Best-effort cleanup — undo the session so the user isn't left with a
      // ghost "empty" workout on their history.
      await supabase.from('workout_sessions').delete().eq('id', session.id);
      throw new Error(setsError.message || 'Failed to save workout sets.');
    }
    savedSets = insertedSets || [];
  }

  return { session, sets: savedSets };
}

/**
 * listRecentSessions — paginated list of sessions for the current user,
 * newest first, each with its `sets` array eagerly loaded.
 */
export async function listRecentSessions({ limit = 20, offset = 0 } = {}) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return [];

    const { data: sessions, error } = await supabase
      .from('workout_sessions')
      .select('id, routine_id, started_at, ended_at, duration_sec, total_volume_kg, note, created_at')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    if (!sessions || sessions.length === 0) return [];

    const ids = sessions.map((s) => s.id);
    const { data: sets, error: setsError } = await supabase
      .from('workout_sets')
      .select('*')
      .in('session_id', ids)
      .order('set_index', { ascending: true });

    if (setsError) throw setsError;

    const byId = new Map();
    for (const s of sets || []) {
      const bucket = byId.get(s.session_id) || [];
      bucket.push(s);
      byId.set(s.session_id, bucket);
    }

    return sessions.map((s) => ({ ...s, sets: byId.get(s.id) || [] }));
  } catch (err) {
    console.error('[workoutsService] listRecentSessions failed', err);
    return [];
  }
}

/**
 * listWorkoutSessions — legacy wrapper used by existing call sites.
 * Returns sessions with flattened `set_count` / `exercise_count` (no sets array).
 */
export async function listWorkoutSessions({ limit = 30, offset = 0 } = {}) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return [];

    const { data: sessions, error } = await supabase
      .from('workout_sessions')
      .select('id, routine_id, started_at, ended_at, duration_sec, total_volume_kg, note, created_at')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    if (!sessions || sessions.length === 0) return [];

    const ids = sessions.map((s) => s.id);
    const { data: sets, error: setsError } = await supabase
      .from('workout_sets')
      .select('session_id, exercise_id')
      .in('session_id', ids);

    if (setsError) throw setsError;

    const byId = new Map();
    for (const s of sets || []) {
      let bucket = byId.get(s.session_id);
      if (!bucket) {
        bucket = { setCount: 0, exerciseIds: new Set() };
        byId.set(s.session_id, bucket);
      }
      bucket.setCount += 1;
      if (s.exercise_id) bucket.exerciseIds.add(s.exercise_id);
    }

    return sessions.map((s) => {
      const b = byId.get(s.id) || { setCount: 0, exerciseIds: new Set() };
      return {
        ...s,
        set_count: b.setCount,
        exercise_count: b.exerciseIds.size,
      };
    });
  } catch (err) {
    console.error('[workoutsService] listWorkoutSessions failed', err);
    return null;
  }
}

/**
 * getSessionById — a single session + its sets, ordered by set_index.
 */
export async function getSessionById(id) {
  try {
    if (!id) return null;
    const userId = await getCurrentUserId();
    if (!userId) return null;

    const { data: session, error } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    if (!session) return null;

    const { data: sets, error: setsError } = await supabase
      .from('workout_sets')
      .select('*')
      .eq('session_id', id)
      .order('exercise_id', { ascending: true })
      .order('set_index', { ascending: true });
    if (setsError) throw setsError;

    return { ...session, sets: sets || [] };
  } catch (err) {
    console.error('[workoutsService] getSessionById failed', err);
    return null;
  }
}

// Legacy alias — keep older callers working.
export const getWorkoutSession = getSessionById;

/* ─── Per-exercise history ─────────────────────────────────────────────── */

/**
 * getSetsForExercise — every set the current user has performed for a
 * given exercise, joined with their parent session's `started_at` for date
 * context on the ExerciseDetail history view.
 */
export async function getSetsForExercise(exerciseId, { limit = 20 } = {}) {
  try {
    if (!exerciseId) return [];
    const userId = await getCurrentUserId();
    if (!userId) return [];

    // Pull the user's recent sessions so we can both constrain the sets query
    // and annotate each set with its session's started_at.
    const { data: sessions, error: sessionError } = await supabase
      .from('workout_sessions')
      .select('id, started_at')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(200);
    if (sessionError) throw sessionError;
    if (!sessions || sessions.length === 0) return [];

    const sessionIds = sessions.map((s) => s.id);
    const startedAtById = new Map(sessions.map((s) => [s.id, s.started_at]));

    const { data: sets, error: setsError } = await supabase
      .from('workout_sets')
      .select('id, session_id, exercise_id, set_index, weight_kg, reps, rir, rest_sec, is_warmup, performed_at')
      .eq('exercise_id', exerciseId)
      .in('session_id', sessionIds)
      .order('performed_at', { ascending: false })
      .limit(limit);
    if (setsError) throw setsError;

    return (sets || []).map((s) => ({
      ...s,
      started_at: startedAtById.get(s.session_id) || s.performed_at,
    }));
  } catch (err) {
    console.error('[workoutsService] getSetsForExercise failed', err);
    return [];
  }
}

// Legacy alias — preserved for the App.jsx import list.
export const listSetsForExercise = getSetsForExercise;

/**
 * getPersonalBest — derive the user's PR for a given exercise.
 * Returns `{ weight, reps, est1rm, achievedAt } | null`. The best is picked
 * as the set with the highest Epley-estimated 1RM across all non-warmup
 * sets (falls back to max weight × max reps when all estimates are equal).
 */
export async function getPersonalBest(exerciseId) {
  try {
    if (!exerciseId) return null;
    const sets = await getSetsForExercise(exerciseId, { limit: 500 });
    if (!sets || sets.length === 0) return null;

    let best = null;
    for (const s of sets) {
      if (s.is_warmup) continue;
      const w = Number(s.weight_kg) || 0;
      const r = Number(s.reps) || 0;
      if (w <= 0 && r <= 0) continue;
      const est = epley1RM(w, r);
      if (!best || est > best.est1rm || (est === best.est1rm && w > best.weight)) {
        best = {
          weight: w,
          reps: r,
          est1rm: Math.round(est * 10) / 10,
          achievedAt: s.started_at || s.performed_at || null,
        };
      }
    }
    return best;
  } catch (err) {
    console.error('[workoutsService] getPersonalBest failed', err);
    return null;
  }
}

/**
 * getPersonalBestForExercise — richer legacy shape:
 *   { heaviest: { weight, reps }, mostReps: { weight, reps }, est1rm }
 */
export async function getPersonalBestForExercise(exerciseId) {
  try {
    if (!exerciseId) return null;
    const sets = await getSetsForExercise(exerciseId, { limit: 500 });
    if (!sets || sets.length === 0) {
      return { heaviest: null, mostReps: null, est1rm: 0 };
    }

    let heaviest = null;
    let mostReps = null;
    let est1rm = 0;

    for (const s of sets) {
      if (s.is_warmup) continue;
      const w = Number(s.weight_kg) || 0;
      const r = Number(s.reps) || 0;
      if (w <= 0 && r <= 0) continue;

      if (!heaviest || w > heaviest.weight || (w === heaviest.weight && r > heaviest.reps)) {
        heaviest = { weight: w, reps: r };
      }
      if (!mostReps || r > mostReps.reps || (r === mostReps.reps && w > mostReps.weight)) {
        mostReps = { weight: w, reps: r };
      }
      const estimate = epley1RM(w, r);
      if (estimate > est1rm) est1rm = estimate;
    }

    return {
      heaviest,
      mostReps,
      est1rm: Math.round(est1rm * 10) / 10,
    };
  } catch (err) {
    console.error('[workoutsService] getPersonalBestForExercise failed', err);
    return null;
  }
}

/* ─── Routines ─────────────────────────────────────────────────────────── */

/**
 * cloneRoutineFromPreset — create a new routine owned by the current user
 * from a preset definition. Returns the inserted row or throws.
 */
export async function cloneRoutineFromPreset({ name, sourcePresetId, days } = {}) {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('You must be signed in to save a routine.');
  }
  if (!name || !Array.isArray(days)) {
    throw new Error('Routine name and days are required.');
  }

  const { data, error } = await supabase
    .from('routines')
    .insert({
      user_id: userId,
      name,
      source_preset_id: sourcePresetId || null,
      days,
    })
    .select()
    .single();

  if (error || !data) {
    console.error('[workoutsService] cloneRoutineFromPreset failed', error);
    throw new Error(error?.message || 'Failed to save routine.');
  }
  return data;
}

/**
 * listRoutines — the user's saved routines, sorted by `last_used_at`
 * descending with nulls last (fresh-but-unused routines come after the
 * most recently used ones, matching Hevy's behavior).
 */
export async function listRoutines() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return [];

    const { data, error } = await supabase
      .from('routines')
      .select('id, name, source_preset_id, days, created_at, updated_at, last_used_at')
      .eq('user_id', userId)
      .order('last_used_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('[workoutsService] listRoutines failed', err);
    return [];
  }
}

/**
 * markRoutineUsed — bump the `last_used_at` timestamp (and `updated_at`)
 * on a routine. Call when a session starts using it. Silent on failure —
 * this is a bookkeeping side-effect, not a user-facing action.
 */
export async function markRoutineUsed(routineId) {
  try {
    if (!routineId) return null;
    const userId = await getCurrentUserId();
    if (!userId) return null;
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('routines')
      .update({ last_used_at: now, updated_at: now })
      .eq('id', routineId)
      .eq('user_id', userId)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data || null;
  } catch (err) {
    console.error('[workoutsService] markRoutineUsed failed', err);
    return null;
  }
}
