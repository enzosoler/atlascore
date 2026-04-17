/**
 * Atlas Core — Share Workout Service
 * Handles creating share links and importing shared workouts.
 */
import { supabase } from '@/lib/supabaseClient';

const FUNCTION_NAME = 'share-workout';

function assertShareType(type, dayIndex) {
  if (type !== 'plan' && type !== 'day') {
    throw new Error('Invalid share type');
  }

  if (type === 'day' && (dayIndex === undefined || dayIndex === null || Number.isNaN(Number(dayIndex)))) {
    throw new Error('A day index is required when sharing a single day');
  }
}

/**
 * Create a share link for a workout plan or single day.
 * @param {'plan'|'day'} type
 * @param {string} planId
 * @param {number} [dayIndex] - required when type is 'day'
 * @returns {Promise<{ token: string, url: string }>}
 */
export async function createWorkoutShare(type, planId, dayIndex) {
  assertShareType(type, dayIndex);

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const res = await supabase.functions.invoke(FUNCTION_NAME, {
    body: { type, plan_id: planId, day_index: dayIndex },
  });

  if (res.error) throw res.error;
  return res.data;
}

/**
 * Fetch a shared workout by token (public, no auth needed).
 * @param {string} token
 * @returns {Promise<object>}
 */
export async function getSharedWorkout(token) {
  const { data, error } = await supabase
    .from('shared_workouts')
    .select('*')
    .eq('token', token)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Import a shared workout into the current user's account.
 * @param {string} token
 * @returns {Promise<{ plan_id: string }>}
 */
export async function importSharedWorkout(token) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const res = await supabase.functions.invoke(`${FUNCTION_NAME}/import`, {
    body: { token },
  });

  if (res.error) throw res.error;
  return res.data;
}
