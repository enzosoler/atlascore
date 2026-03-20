/**
 * Atlas Core — Workout Service (Supabase)
 * Handles persistence of completed workout sessions.
 * Table: workouts
 */
import { supabase } from '@/lib/supabaseClient';

const TABLE = 'workouts';

/**
 * Save a completed workout session to Supabase.
 * @param {string} userId - The ID of the user.
 * @param {object} payload - The workout data from WorkoutExecutionScreen.
 * @param {object} originalWorkout - The original workout object (contains name, plan_id, etc).
 */
export async function saveCompletedWorkout(userId, payload, originalWorkout) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      user_id: userId,
      name: originalWorkout.name || 'Treino sem nome',
      plan_id: originalWorkout.plan_id || null,
      plan_day_index: originalWorkout.plan_day_index ?? null,
      status: 'completed',
      duration_minutes: payload.duration_minutes,
      volume_load: payload.volume_load,
      exercises_completed: payload.exercises_completed, // JSONB column
      completed_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving workout:', error);
    throw error;
  }
  return data;
}

/**
 * Fetch recent workouts for a user.
 */
export async function getRecentWorkouts(userId, limit = 10) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}
