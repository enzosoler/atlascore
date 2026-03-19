/**
 * Atlas Core — ExerciseDB API Client
 *
 * Wraps the ExerciseDB API (via RapidAPI) with:
 *   - Environment-variable configuration
 *   - Request timeout and error handling
 *   - Graceful degradation when key is missing
 *
 * API Key: VITE_EXERCISEDB_API_KEY (RapidAPI key)
 * Sign up at: https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb
 */

const BASE_URL = 'https://exercisedb.p.rapidapi.com';
const API_KEY = import.meta.env.VITE_EXERCISEDB_API_KEY || '';
const TIMEOUT_MS = 8000;

function getHeaders() {
  return {
    'x-rapidapi-key': API_KEY,
    'x-rapidapi-host': 'exercisedb.p.rapidapi.com',
  };
}

/**
 * Core fetch wrapper with timeout, error handling, and API key guard.
 */
async function apiRequest(path, params = {}) {
  if (!API_KEY) {
    console.warn('[ExerciseDB] VITE_EXERCISEDB_API_KEY is not set — API calls disabled.');
    return null;
  }

  const url = new URL(`${BASE_URL}${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: getHeaders(),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`[ExerciseDB] HTTP ${response.status} on ${path}`);
      return null;
    }
    return await response.json();
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

/**
 * Fetch exercises by text search (EN name).
 * @param {string} query
 * @param {number} limit
 */
export async function searchExercisesByName(query, limit = 30) {
  const encoded = encodeURIComponent(query.toLowerCase().trim());
  return apiRequest(`/exercises/name/${encoded}`, { limit });
}

/**
 * Fetch exercises by target muscle.
 * target: one of ExerciseDB muscle list (e.g. "chest", "lats", "quads")
 */
export async function fetchByMuscle(target, limit = 50) {
  const encoded = encodeURIComponent(target.toLowerCase().trim());
  return apiRequest(`/exercises/target/${encoded}`, { limit });
}

/**
 * Fetch exercises by body part.
 * bodyPart: chest | back | shoulders | upper arms | lower arms | upper legs |
 *           lower legs | waist | neck | cardio
 */
export async function fetchByBodyPart(bodyPart, limit = 50) {
  const encoded = encodeURIComponent(bodyPart.toLowerCase().trim());
  return apiRequest(`/exercises/bodyPart/${encoded}`, { limit });
}

/**
 * Fetch exercises by equipment type.
 * equipment: barbell | dumbbell | cable | machine | body weight | kettlebell …
 */
export async function fetchByEquipment(equipment, limit = 50) {
  const encoded = encodeURIComponent(equipment.toLowerCase().trim());
  return apiRequest(`/exercises/equipment/${encoded}`, { limit });
}

/**
 * Fetch a single exercise by its ExerciseDB ID.
 */
export async function fetchExerciseById(id) {
  return apiRequest(`/exercises/exercise/${id}`);
}

/**
 * Fetch a paginated list of all exercises.
 * @param {number} limit  max 1300 in one shot; recommend 100–500 pages
 * @param {number} offset
 */
export async function fetchAllExercises(limit = 100, offset = 0) {
  return apiRequest('/exercises', { limit, offset });
}

/**
 * Get the list of all available body parts.
 */
export async function fetchBodyPartList() {
  return apiRequest('/exercises/bodyPartList');
}

/**
 * Get the list of all available target muscles.
 */
export async function fetchTargetList() {
  return apiRequest('/exercises/targetList');
}

/**
 * Get the list of all available equipment types.
 */
export async function fetchEquipmentList() {
  return apiRequest('/exercises/equipmentList');
}

/** Whether the API client is configured (has an API key). */
export const isConfigured = Boolean(API_KEY);
