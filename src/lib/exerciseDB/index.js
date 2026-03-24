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
import {
  EXERCISE_TRANSLATIONS,
  getExercisePT,
  normalizeStr,
  translateSearchQueryToEN,
} from './translations.js';

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

// ExerciseDB GIF URL pattern - images are served from v2.exercisedb.io
const EXERCISEDB_IMAGE_BASE = 'https://v2.exercisedb.io/image';

const STATIC_EXERCISE_CATALOG = Object.entries(EXERCISE_TRANSLATIONS)
  .map(([canonicalNameEN, entry]) => {
    const id = `static_${normalizeStr(canonicalNameEN).replace(/\s+/g, '_')}`;
    const gifUrl = entry?.exercise_db_id 
      ? `${EXERCISEDB_IMAGE_BASE}/${entry.exercise_db_id}` 
      : null;
    
    return normalizeBase44Exercise({
      id,
      canonical_name_en: canonicalNameEN,
      canonical_name_pt: entry?.pt || getExercisePT(canonicalNameEN),
      aliases_en: entry?.aliases_en || [],
      aliases_pt: entry?.aliases_pt || [],
      primary_muscles: entry?.primary_muscles || [],
      secondary_muscles: [],
      equipment: entry?.equipment || '',
      category: entry?.category || '',
      media_gif_url: gifUrl,
    });
  })
  .filter(Boolean);

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

      const libraryRaw = await client.fetchAllExercises(200, 0);
      if (libraryRaw && libraryRaw.length > 0) {
        const normalizedLibrary = normalizeExercises(libraryRaw);
        const localMatches = localSearch(normalizedLibrary, trimmed);
        const translatedMatches =
          enQuery !== trimmed ? localSearch(normalizedLibrary, enQuery) : [];

        const merged = [...localMatches];
        const seenIds = new Set(localMatches.map((exercise) => exercise.id));

        translatedMatches.forEach((exercise) => {
          if (!seenIds.has(exercise.id)) {
            merged.push(exercise);
            seenIds.add(exercise.id);
          }
        });

        if (merged.length > 0) {
          return merged.slice(0, limit);
        }
      }
    } catch (err) {
      console.warn('[ExerciseService] API search failed, falling back:', err.message);
    }
  }

  // Fallback to static catalog (primary offline source)
  const staticMatches = localSearch(STATIC_EXERCISE_CATALOG, trimmed);
  if (staticMatches.length > 0) {
    return staticMatches.slice(0, limit);
  }

  if (enQuery !== trimmed) {
    return localSearch(STATIC_EXERCISE_CATALOG, enQuery).slice(0, limit);
  }

  return [];
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
  // Fallback to static catalog
  return localSearch(STATIC_EXERCISE_CATALOG, muscle).slice(0, limit);
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
  // Fallback to static catalog
  return localSearch(STATIC_EXERCISE_CATALOG, bodyPart).slice(0, limit);
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
  // Fallback to static catalog
  return localSearch(STATIC_EXERCISE_CATALOG, equipment).slice(0, limit);
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

  // Static catalog fallback
  const staticMatch = STATIC_EXERCISE_CATALOG.find((ex) => ex.id === id);
  if (staticMatch) return staticMatch;

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

  // Fallback: static catalog
  return STATIC_EXERCISE_CATALOG.slice(offset, offset + limit);
}

// ─── Exercise log helpers (user history) ─────────────────────────────────────

export async function logExerciseUse(exerciseId, exerciseName) {
  // No-op since base44 is not used
  return;
}

export async function fetchRecentExercises() {
  // Return empty since base44 is not used
  return [];
}

export async function fetchFavoriteExercises() {
  // Return empty since base44 is not used
  return [];
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
