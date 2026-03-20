/**
 * Atlas Core — Exercise Service (Main Facade)
 *
 * Public API for all exercise-related data in the app.
 * Orchestrates: ExerciseDB API → normalizer → enrichment → search
 *
 * Usage:
 *   import { searchExercises, fetchExercise, fetchByBodyPart } from '@/lib/exerciseDB';
 *
 * Fallback chain:
 *   ExerciseDB API → base44 ExerciseMaster → empty result
 *
 * React Query integration:
 *   All functions return plain promises. Wire them into useQuery() with
 *   the query keys exported below.
 */

import * as client from './client.js';
import { normalizeExercise, normalizeExercises, normalizeBase44Exercise } from './normalizer.js';
import { normalizeStr, translateSearchQueryToEN } from './translations.js';
import { base44 } from '@/api/base44Client.js';

// ─── Query key factory ────────────────────────────────────────────────────────

export const exerciseKeys = {
  all: ['exercises'],
  search: (query) => ['exercises', 'search', query],
  byBodyPart: (bp) => ['exercises', 'bodyPart', bp],
  byMuscle: (m) => ['exercises', 'muscle', m],
  byEquipment: (eq) => ['exercises', 'equipment', eq],
  detail: (id) => ['exercises', 'detail', id],
  lists: () => ['exercises', 'lists'],
};

// ─── Local search utility ─────────────────────────────────────────────────────

/**
 * Filter a list of normalized exercises using a local search query.
 * Tolerates: accents, plural/singular variations, PT/EN terms.
 *
 * @param {object[]} exercises - Normalized exercise array
 * @param {string}   query     - Search string (PT or EN)
 * @returns {object[]}
 */
export function localSearch(exercises, query = '') {
  if (!query.trim()) return exercises;
  const q = normalizeStr(query);
  // Split into words to support multi-word partial matching
  const words = q.split(/\s+/).filter((w) => w.length > 1);

  return exercises.filter((ex) => {
    const text = ex._search || normalizeStr(
      [
        ex.canonical_name_en,
        ex.canonical_name_pt,
        ...(ex.aliases_en || []),
        ...(ex.aliases_pt || []),
        ...(ex.primary_muscles || []),
        ...(ex.secondary_muscles || []),
        ex.equipment,
        ex.body_part,
        ex.category,
      ]
        .filter(Boolean)
        .join(' ')
    );
    // All words must be present (AND logic for precision)
    return words.every((w) => text.includes(w));
  });
}

// ─── Search exercises (primary) ───────────────────────────────────────────────

/**
 * Search exercises by a free-text query.
 * Strategy:
 *   1. Translate PT query terms to EN
 *   2. Hit ExerciseDB name search API
 *   3. Normalize results
 *   4. Apply local filter for aliased PT terms
 *   5. Fallback to base44 if API unavailable
 *
 * @param {string} query
 * @param {number} limit
 */
export async function searchExercises(query, limit = 30) {
  const trimmed = query.trim();
  if (!trimmed) return [];

  // Translate PT → EN for API call
  const enQuery = translateSearchQueryToEN(trimmed);

  if (client.isConfigured) {
    try {
      const raw = await client.searchExercisesByName(enQuery, limit);
      if (raw && raw.length > 0) {
        const normalized = normalizeExercises(raw);
        // Apply local PT filter too (catches aliases the API doesn't know about)
        const enResults = normalized;
        const ptFiltered = localSearch(normalized, trimmed);
        // Merge: PT-matched first, then remainder
        const ptIds = new Set(ptFiltered.map((e) => e.id));
        return [...ptFiltered, ...enResults.filter((e) => !ptIds.has(e.id))].slice(0, limit);
      }
    } catch (err) {
      console.warn('[ExerciseService] API search failed, falling back:', err.message);
    }
  }

  // Fallback to base44
  return searchBase44Exercises(trimmed, limit);
}

/**
 * Search exercises by muscle group.
 * Accepts both PT and EN muscle names.
 *
 * @param {string} muscle  EN muscle target (e.g. "chest", "lats", "quads")
 * @param {number} limit
 */
export async function searchByMuscle(muscle, limit = 50) {
  if (client.isConfigured) {
    try {
      const raw = await client.fetchByMuscle(muscle, limit);
      if (raw && raw.length > 0) return normalizeExercises(raw);
    } catch (err) {
      console.warn('[ExerciseService] fetchByMuscle failed:', err.message);
    }
  }
  return searchBase44Exercises(muscle, limit);
}

/**
 * Search exercises by body part.
 *
 * @param {string} bodyPart  ExerciseDB body part slug
 * @param {number} limit
 */
export async function searchByBodyPart(bodyPart, limit = 50) {
  if (client.isConfigured) {
    try {
      const raw = await client.fetchByBodyPart(bodyPart, limit);
      if (raw && raw.length > 0) return normalizeExercises(raw);
    } catch (err) {
      console.warn('[ExerciseService] fetchByBodyPart failed:', err.message);
    }
  }
  return searchBase44Exercises(bodyPart, limit);
}

/**
 * Search exercises by equipment.
 *
 * @param {string} equipment  ExerciseDB equipment slug
 * @param {number} limit
 */
export async function searchByEquipment(equipment, limit = 50) {
  if (client.isConfigured) {
    try {
      const raw = await client.fetchByEquipment(equipment, limit);
      if (raw && raw.length > 0) return normalizeExercises(raw);
    } catch (err) {
      console.warn('[ExerciseService] fetchByEquipment failed:', err.message);
    }
  }
  return searchBase44Exercises(equipment, limit);
}

// ─── Fetch single exercise ────────────────────────────────────────────────────

/**
 * Fetch a single exercise by its Atlas ID.
 * Handles both "edb_xxx" (ExerciseDB) and plain IDs (base44).
 *
 * @param {string} id  Atlas exercise ID
 */
export async function fetchExercise(id) {
  if (!id) return null;

  // ExerciseDB source
  if (id.startsWith('edb_') && client.isConfigured) {
    const edbId = id.replace('edb_', '');
    try {
      const raw = await client.fetchExerciseById(edbId);
      if (raw) return normalizeExercise(raw);
    } catch (err) {
      console.warn('[ExerciseService] fetchExerciseById failed:', err.message);
    }
  }

  // base44 source (fallback or direct)
  try {
    const results = await base44.entities.ExerciseMaster.filter({ id });
    if (results?.[0]) return normalizeBase44Exercise(results[0]);
  } catch {
    /* noop */
  }

  return null;
}

// ─── Fetch exercise lists for filters ────────────────────────────────────────

/**
 * Fetch available body parts for filter UI.
 */
export async function fetchBodyParts() {
  if (client.isConfigured) {
    try {
      const list = await client.fetchBodyPartList();
      if (list) return list;
    } catch {
      /* noop */
    }
  }
  // Hardcoded fallback
  return ['chest', 'back', 'shoulders', 'upper arms', 'lower arms', 'upper legs', 'lower legs', 'waist', 'neck', 'cardio'];
}

/**
 * Fetch available target muscles for filter UI.
 */
export async function fetchTargetMuscles() {
  if (client.isConfigured) {
    try {
      const list = await client.fetchTargetList();
      if (list) return list;
    } catch {
      /* noop */
    }
  }
  return ['chest', 'lats', 'quads', 'hamstrings', 'glutes', 'calves', 'biceps', 'triceps', 'delts', 'abs', 'traps', 'forearms'];
}

/**
 * Fetch available equipment types for filter UI.
 */
export async function fetchEquipmentTypes() {
  if (client.isConfigured) {
    try {
      const list = await client.fetchEquipmentList();
      if (list) return list;
    } catch {
      /* noop */
    }
  }
  return ['barbell', 'dumbbell', 'cable', 'machine', 'body weight', 'kettlebell', 'resistance band', 'ez barbell', 'smith machine'];
}

// ─── Paginated library fetch ──────────────────────────────────────────────────

/**
 * Fetch a page of exercises for the library view.
 * Uses body part filter if provided, otherwise fetches first page of all.
 *
 * @param {object} options
 * @param {string} [options.bodyPart]  Filter by body part
 * @param {string} [options.muscle]    Filter by target muscle
 * @param {string} [options.equipment] Filter by equipment
 * @param {number} [options.limit=50]
 * @param {number} [options.offset=0]
 */
export async function fetchExerciseLibrary({ bodyPart, muscle, equipment, limit = 50, offset = 0 } = {}) {
  if (client.isConfigured) {
    try {
      let raw = null;
      if (bodyPart) {
        raw = await client.fetchByBodyPart(bodyPart, limit);
      } else if (muscle) {
        raw = await client.fetchByMuscle(muscle, limit);
      } else if (equipment) {
        raw = await client.fetchByEquipment(equipment, limit);
      } else {
        raw = await client.fetchAllExercises(limit, offset);
      }
      if (raw && raw.length > 0) return normalizeExercises(raw);
    } catch (err) {
      console.warn('[ExerciseService] fetchExerciseLibrary failed:', err.message);
    }
  }

  // Fallback: base44 ExerciseMaster
  try {
    const results = await base44.entities.ExerciseMaster.list('-search_rank', limit);
    return (results || []).map(normalizeBase44Exercise).filter(Boolean);
  } catch {
    return [];
  }
}

// ─── base44 fallback search ───────────────────────────────────────────────────

async function searchBase44Exercises(query, limit = 30) {
  try {
    // First try the base44 API
    const raw = await base44.functions.invoke('exerciseSearch', {
      action: 'search',
      query,
    });
    const results = raw?.data?.results || [];
    const normalized = results.slice(0, limit).map((ex) => normalizeBase44Exercise(ex)).filter(Boolean);
    
    // If we got results, return them
    if (normalized.length > 0) return normalized;
    
    // Otherwise, try local search with PT translation
    const enQuery = translateSearchQueryToEN(query);
    try {
      const allExercises = await base44.entities.ExerciseMaster.all();
      const localResults = localSearch(allExercises.map(normalizeBase44Exercise).filter(Boolean), query);
      
      if (localResults.length > 0) return localResults.slice(0, limit);
      
      // Try with translated EN query
      const enResults = localSearch(allExercises.map(normalizeBase44Exercise).filter(Boolean), enQuery);
      return enResults.slice(0, limit);
    } catch (localErr) {
      console.warn('[ExerciseService] Local search failed:', localErr.message);
    }
    
    return [];
  } catch (err) {
    console.warn('[ExerciseService] searchBase44Exercises failed:', err.message);
    return [];
  }
}

// ─── Exercise log helpers (user history) ─────────────────────────────────────

export async function logExerciseUse(exerciseId, exerciseName) {
  if (!exerciseId) return;
  try {
    await base44.functions.invoke('exerciseLogs', {
      action: 'log_use',
      exercise_master_id: exerciseId,
      exercise_name: exerciseName,
    });
  } catch {
    /* non-critical */
  }
}

export async function fetchRecentExercises() {
  try {
    const res = await base44.functions.invoke('exerciseLogs', { action: 'recent' });
    return (res?.data?.results || []).map(normalizeBase44Exercise).filter(Boolean);
  } catch {
    return [];
  }
}

export async function fetchFavoriteExercises() {
  try {
    const res = await base44.functions.invoke('exerciseLogs', { action: 'favorites' });
    return (res?.data?.results || []).map(normalizeBase44Exercise).filter(Boolean);
  } catch {
    return [];
  }
}

// Re-export translation/enrichment helpers for UI consumption
export { muscleToPT, equipmentToPT, bodyPartToPT, normalizeStr } from './translations.js';
export {
  MOVEMENT_PATTERN_LABELS,
  RESISTANCE_CURVE_LABELS,
  FATIGUE_PROFILE_LABELS,
  STABILITY_LABELS,
} from './enrichment.js';
export { isConfigured } from './client.js';
