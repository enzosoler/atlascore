/**
 * Atlas Core — Exercise System (English-only)
 *
 * This file exports stubs to maintain API compatibility.
 * Legacy locale translation support has been removed.
 */

// ─── Stubs for compatibility ────────────────────────────────────────────────

export const MUSCLE_EN_TO_PT = {};
export const EQUIPMENT_EN_TO_PT = {};
export const BODY_PART_EN_TO_PT = {};
export const PT_SEARCH_TO_EN = {};
export const EXERCISE_TRANSLATIONS = {};

// ─── Helper functions ─────────────────────────────────────────────────────────

/**
 * Normalize string for search: lowercase, remove accents, trim.
 */
export function normalizeStr(str = '') {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Get the exercise name in English (no translation).
 */
export function getExercisePT(exerciseNameEN = '') {
  return exerciseNameEN;
}

/**
 * Get all aliases for an exercise.
 */
export function getExerciseAliases(exerciseNameEN = '') {
  return {
    aliases_en: [],
    aliases_pt: [],
  };
}

/**
 * Translate a search query (pass-through).
 */
export function translateSearchQueryToEN(query = '') {
  return query;
}

/**
 * Return muscle name as-is (no translation).
 */
export function muscleToPT(muscle = '') {
  return muscle;
}

/**
 * Return equipment as-is (no translation).
 */
export function equipmentToPT(equipment = '') {
  return equipment;
}

/**
 * Return body part as-is (no translation).
 */
export function bodyPartToPT(bodyPart = '') {
  return bodyPart;
}
