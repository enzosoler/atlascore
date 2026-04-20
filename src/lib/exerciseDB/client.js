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

const TIMEOUT_MS = 12_000;
const RETRY_DELAYS = [800, 2000]; // ms between attempts (3 total: initial + 2 retries)

async function apiRequest(path, params = {}, attempt = 1) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const { data, error } = await supabase.functions.invoke('exercise-search', {
      body: { path, params },
    });

    clearTimeout(timeoutId);

    if (error) {
      // Surface the upstream status if available so logs are actionable.
      const status = error?.context?.status ?? error?.status ?? '?';
      const isTransient = status === 503 || status === 502 || status === 429 || status === 500;
      if (isTransient && attempt <= RETRY_DELAYS.length) {
        const delay = RETRY_DELAYS[attempt - 1];
        console.warn(`[ExerciseDB] ${status} on ${path} — retry ${attempt}/${RETRY_DELAYS.length} in ${delay}ms`);
        await new Promise((r) => setTimeout(r, delay));
        return apiRequest(path, params, attempt + 1);
      }
      console.error(`[ExerciseDB] Edge function error on ${path} (status ${status}):`, error.message);
      return null;
    }

    return data ?? null;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      console.warn(`[ExerciseDB] Request timeout (attempt ${attempt}): ${path}`);
      if (attempt <= RETRY_DELAYS.length) {
        const delay = RETRY_DELAYS[attempt - 1];
        await new Promise((r) => setTimeout(r, delay));
        return apiRequest(path, params, attempt + 1);
      }
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
