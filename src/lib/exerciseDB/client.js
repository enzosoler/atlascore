/**
 * Atlas Core — ExerciseDB Client
 *
 * All ExerciseDB (RapidAPI) calls are proxied through the `exercise-search`
 * Supabase Edge Function. The API key lives as a Deno secret server-side
 * and is NEVER bundled into the client JS.
 *
 * Deploy the function:
 *   supabase functions deploy exercise-search
 *   supabase secrets set EXERCISEDB_API_KEY=your_rapidapi_key
 */

import { supabase } from '@/lib/supabaseClient';

const TIMEOUT_MS = 10_000;

async function apiRequest(path, params = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const { data, error } = await supabase.functions.invoke('exercise-search', {
      body: { path, params },
    });

    clearTimeout(timeoutId);

    if (error) {
      console.error(`[ExerciseDB] Edge function error on ${path}:`, error.message);
      return null;
    }

    return data ?? null;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      console.warn(`[ExerciseDB] Request timeout: ${path}`);
    } else {
      console.error(`[ExerciseDB] Request failed: ${path}`, err.message);
    }
    return null;
  }
}

// ─── Exported API methods ─────────────────────────────────────────────────────

export async function searchExercisesByName(query, limit = 30) {
  const encoded = encodeURIComponent(query.toLowerCase().trim());
  return apiRequest(`/exercises/name/${encoded}`, { limit });
}

export async function fetchByMuscle(target, limit = 50) {
  const encoded = encodeURIComponent(target.toLowerCase().trim());
  return apiRequest(`/exercises/target/${encoded}`, { limit });
}

export async function fetchByBodyPart(bodyPart, limit = 50) {
  const encoded = encodeURIComponent(bodyPart.toLowerCase().trim());
  return apiRequest(`/exercises/bodyPart/${encoded}`, { limit });
}

export async function fetchByEquipment(equipment, limit = 50) {
  const encoded = encodeURIComponent(equipment.toLowerCase().trim());
  return apiRequest(`/exercises/equipment/${encoded}`, { limit });
}

export async function fetchExerciseById(id) {
  return apiRequest(`/exercises/exercise/${id}`);
}

export async function fetchAllExercises(limit = 100, offset = 0) {
  return apiRequest('/exercises', { limit, offset });
}

export async function fetchBodyPartList() {
  return apiRequest('/exercises/bodyPartList');
}

export async function fetchTargetList() {
  return apiRequest('/exercises/targetList');
}

export async function fetchEquipmentList() {
  return apiRequest('/exercises/equipmentList');
}

/** Always true now — the edge function is the gating mechanism. */
export const isConfigured = true;
