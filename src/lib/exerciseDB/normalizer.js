/**
 * Atlas Core — ExerciseDB Normalizer
 *
 * Transforms raw ExerciseDB API responses into the Atlas unified exercise model.
 *
 * ExerciseDB raw format:
 * {
 *   id: "0001",
 *   name: "3/4 sit-up",
 *   bodyPart: "waist",
 *   equipment: "body weight",
 *   gifUrl: "https://v2.exercisedb.io/image/...",
 *   target: "abs",
 *   secondaryMuscles: ["obliques", "hip flexors"],
 *   instructions: ["Lie flat...", "..."]
 * }
 *
 * Atlas unified model:
 * {
 *   id, source, canonical_name_en, canonical_name_pt,
 *   aliases_en, aliases_pt, primary_muscles, secondary_muscles,
 *   target_muscle, body_part, equipment, category,
 *   media: { gif_url, image_url },
 *   instructions: { en, pt },
 *   movement_pattern, resistance_curve, fatigue_profile, stability,
 *   unilateral, is_compound, difficulty_level,
 *   default_set_range, default_rep_range, default_rest_seconds
 * }
 */

import {
  getExercisePT,
  getExerciseAliases,
  muscleToPT,
  normalizeStr,
} from './translations.js';
import { enrichExercise } from './enrichment.js';

// ─── Normalization helpers ────────────────────────────────────────────────────

/**
 * Normalize muscle name from ExerciseDB to a consistent internal identifier.
 * ExerciseDB uses: "pectorals", "lats", "glutes", "quads", etc.
 */
function normalizeMuscle(muscle = '') {
  const m = muscle.toLowerCase().trim();
  const map = {
    pectorals: 'chest',
    'pectoralis major': 'chest',
    'anterior deltoid': 'front delts',
    'medial deltoid': 'side delts',
    'lateral deltoid': 'side delts',
    'posterior deltoid': 'rear delts',
    'deltoid': 'shoulders',
    delts: 'shoulders',
    lats: 'lats',
    'latissimus dorsi': 'lats',
    'rhomboids': 'back',
    'erector spinae': 'lower back',
    'spine': 'lower back',
    'iliopsoas': 'hip flexors',
    'rectus abdominis': 'abs',
    'obliques': 'obliques',
    'transverse abdominis': 'core',
    'biceps brachii': 'biceps',
    'triceps brachii': 'triceps',
    brachialis: 'biceps',
    brachioradialis: 'forearms',
    'wrist extensors': 'forearms',
    'wrist flexors': 'forearms',
    quadriceps: 'quads',
    'rectus femoris': 'quads',
    hamstrings: 'hamstrings',
    'biceps femoris': 'hamstrings',
    'gluteus maximus': 'glutes',
    'gluteus medius': 'glutes',
    'gastrocnemius': 'calves',
    soleus: 'calves',
    'tibialis anterior': 'calves',
    trapezius: 'traps',
    'levator scapulae': 'traps',
    'serratus anterior': 'chest', // anatomically close enough for UI
    'adductors': 'adductors',
    'hip abductors': 'abductors',
    'hip adductors': 'adductors',
    abs: 'abs',
    'upper abs': 'abs',
    glutes: 'glutes',
    quads: 'quads',
    calves: 'calves',
    biceps: 'biceps',
    triceps: 'triceps',
    shoulders: 'shoulders',
    chest: 'chest',
    back: 'back',
    lats: 'lats',
    traps: 'traps',
    forearms: 'forearms',
    neck: 'neck',
    core: 'core',
    obliques: 'obliques',
    'lower back': 'lower back',
    'cardiovascular system': 'cardio',
  };
  return map[m] || m;
}

/**
 * Map ExerciseDB bodyPart to Atlas category.
 */
function normalizeCategory(bodyPart = '') {
  const map = {
    chest: 'chest',
    back: 'back',
    shoulders: 'shoulders',
    'upper arms': 'arms',
    'lower arms': 'arms',
    'upper legs': 'legs',
    'lower legs': 'legs',
    waist: 'core',
    neck: 'neck',
    cardio: 'cardio',
  };
  return map[bodyPart.toLowerCase()] || bodyPart.toLowerCase();
}

// ─── Main normalizer ──────────────────────────────────────────────────────────

/**
 * Transform a single raw ExerciseDB exercise into the Atlas unified model.
 * Then enrich it with performance metadata.
 *
 * @param {object} raw - Raw ExerciseDB exercise object
 * @returns {object} Atlas unified exercise
 */
export function normalizeExercise(raw) {
  if (!raw || !raw.id) return null;

  const nameEN = raw.name || '';
  const namePT = getExercisePT(nameEN);
  const { aliases_en, aliases_pt } = getExerciseAliases(nameEN);

  const primaryMuscle = normalizeMuscle(raw.target || '');
  const secondaryMuscles = (raw.secondaryMuscles || []).map(normalizeMuscle).filter(Boolean);

  // Build search text for local filtering (normalized, accent-free)
  const searchText = normalizeStr(
    [nameEN, namePT, ...aliases_en, ...aliases_pt, raw.target, raw.bodyPart, raw.equipment]
      .filter(Boolean)
      .join(' ')
  );

  const base = {
    id: `edb_${raw.id}`,
    source: 'exercisedb',
    canonical_name_en: nameEN,
    canonical_name_pt: namePT,
    aliases_en,
    aliases_pt,
    // Unified muscle fields (arrays)
    primary_muscles: primaryMuscle ? [primaryMuscle] : [],
    secondary_muscles: secondaryMuscles,
    // Raw ExerciseDB fields (kept for reference)
    target_muscle: primaryMuscle,
    body_part: raw.bodyPart || '',
    equipment: raw.equipment || '',
    category: normalizeCategory(raw.bodyPart || ''),
    // Media
    media: {
      gif_url: raw.gifUrl || null,
      image_url: null, // ExerciseDB only has GIFs
    },
    // Instructions: EN from API, PT generated on demand
    instructions: {
      en: Array.isArray(raw.instructions) ? raw.instructions : [],
      pt: [], // PT translation not done at this layer (too costly at scale)
    },
    // Search index
    _search: searchText,
    // Performance metadata — to be filled by enrichExercise()
    movement_pattern: null,
    resistance_curve: null,
    fatigue_profile: null,
    stability: null,
    unilateral: null,
    is_compound: null,
    difficulty_level: null,
    default_set_range: null,
    default_rep_range: null,
    default_rest_seconds: null,
  };

  return enrichExercise(base);
}

/**
 * Normalize an array of raw ExerciseDB exercises.
 * Filters out nulls from malformed entries.
 */
export function normalizeExercises(rawArray) {
  if (!Array.isArray(rawArray)) return [];
  return rawArray.map(normalizeExercise).filter(Boolean);
}

// ─── Base44 ExerciseMaster → Unified model ────────────────────────────────────

/**
 * Adapt a base44 ExerciseMaster entity to the Atlas unified exercise model.
 * This ensures the app can display base44 exercises alongside ExerciseDB ones.
 */
export function normalizeBase44Exercise(entity) {
  if (!entity || !entity.id) return null;

  const { aliases_en, aliases_pt } = getExerciseAliases(entity.canonical_name_en || '');

  const searchText = normalizeStr(
    [
      entity.canonical_name_en,
      entity.canonical_name_pt,
      ...(entity.aliases_en || []),
      ...(entity.aliases_pt || []),
      ...(entity.primary_muscles || []),
      entity.equipment,
    ]
      .filter(Boolean)
      .join(' ')
  );

  const base = {
    id: entity.id,
    source: 'base44',
    canonical_name_en: entity.canonical_name_en || entity.name || '',
    canonical_name_pt: entity.canonical_name_pt || entity.name || '',
    aliases_en: entity.aliases_en || aliases_en,
    aliases_pt: entity.aliases_pt || aliases_pt,
    primary_muscles: entity.primary_muscles || [],
    secondary_muscles: entity.secondary_muscles || [],
    target_muscle: (entity.primary_muscles || [])[0] || '',
    body_part: entity.category || '',
    equipment: entity.equipment || '',
    category: entity.category || '',
    media: {
      gif_url: entity.media_gif_url || null,
      image_url: entity.media_image_url || null,
    },
    instructions: {
      en: [],
      pt: entity.form_cues_pt || [],
    },
    _search: searchText,
    movement_pattern: entity.movement_pattern || null,
    resistance_curve: entity.resistance_curve || null,
    fatigue_profile: entity.fatigue_profile || null,
    stability: entity.stability || null,
    unilateral: entity.is_unilateral || null,
    is_compound: entity.is_compound || null,
    difficulty_level: entity.difficulty_level || null,
    default_set_range: entity.default_set_range || null,
    default_rep_range: entity.default_rep_range || null,
    default_rest_seconds: entity.default_rest_seconds || null,
  };

  return enrichExercise(base);
}
