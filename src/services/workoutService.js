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
      name: originalWorkout.name || 'Untitled workout',
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

/**
 * Update an existing workout (including completed ones).
 * Allows editing date, exercises, sets, volume, duration, etc.
 * @param {string} workoutId - The workout ID to update.
 * @param {object} updates - Object containing fields to update.
 */
export async function updateWorkout(workoutId, updates) {
  const updateData = {};

  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.status !== undefined) updateData.status = updates.status;
  if (updates.duration_minutes !== undefined) updateData.duration_minutes = updates.duration_minutes;
  if (updates.volume_load !== undefined) updateData.volume_load = updates.volume_load;
  if (updates.perceived_effort !== undefined) updateData.perceived_effort = updates.perceived_effort;
  if (updates.exercises_completed !== undefined) updateData.exercises_completed = updates.exercises_completed;
  if (updates.exercises !== undefined) updateData.exercises = updates.exercises;
  if (updates.notes !== undefined) updateData.notes = updates.notes;
  if (updates.completed_at !== undefined) updateData.completed_at = updates.completed_at;

  const { data, error } = await supabase
    .from(TABLE)
    .update(updateData)
    .eq('id', workoutId)
    .select()
    .single();

  if (error) {
    console.error('Error updating workout:', error);
    throw error;
  }
  return data;
}

/**
 * Delete a workout by ID.
 * @param {string} workoutId - The workout ID to delete.
 */
export async function deleteWorkout(workoutId) {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', workoutId);

  if (error) {
    console.error('Error deleting workout:', error);
    throw error;
  }
}
