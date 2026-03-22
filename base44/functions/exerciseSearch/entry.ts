/**
 * Exercise Search API — deterministic, local DB, no runtime external dependency
 *
 * Actions:
 *   search  { query }                         → full-text search
 *   by_muscle { muscle }                      → filter by primary muscle
 *   by_equipment { equipment }                → filter by equipment
 *   get     { id }                            → get by id
 *   seed    {}                                → admin: seed initial dataset
 *   import  { exercise }                      → add custom exercise
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// ─── Seed dataset (~300 exercises, English-first) ──────────────────────────
const SEED = [
  // ═══ CHEST ═══
  { canonical_name_pt: 'Barbell Bench Press', canonical_name_en: 'Barbell Bench Press', aliases_pt: ['bench press', 'barbell bench press', 'flat bench'], aliases_en: ['bench press', 'barbell bench press', 'flat bench'], exercise_type: 'strength', movement_pattern: 'push_horizontal', primary_muscles: ['chest'], secondary_muscles: ['triceps', 'front delts'], equipment: ['barbell', 'bench'], body_region: 'upper', is_compound: true, difficulty_level: 'intermediate', default_rep_range: '5-8', default_set_range: '3-5', default_rest_seconds: 120, search_rank: 98 },
  { canonical_name_pt: 'Incline Barbell Bench Press', canonical_name_en: 'Incline Barbell Bench Press', aliases_pt: ['incline bench press'], aliases_en: ['incline bench press'], exercise_type: 'hypertrophy', movement_pattern: 'push_horizontal', primary_muscles: ['upper chest'], secondary_muscles: ['triceps', 'front delts'], equipment: ['barbell', 'bench'], body_region: 'upper', is_compound: true, difficulty_level: 'intermediate', default_rep_range: '8-12', default_set_range: '3-4', default_rest_seconds: 90, search_rank: 88 },
  { canonical_name_pt: 'Decline Barbell Bench Press', canonical_name_en: 'Decline Barbell Bench Press', aliases_pt: ['decline bench press'], aliases_en: ['decline bench press'], exercise_type: 'hypertrophy', movement_pattern: 'push_horizontal', primary_muscles: ['lower chest'], secondary_muscles: ['triceps'], equipment: ['barbell', 'bench'], body_region: 'upper', is_compound: true, difficulty_level: 'intermediate', default_rep_range: '8-12', default_set_range: '3-4', default_rest_seconds: 90, search_rank: 70 },
  { canonical_name_pt: 'Dumbbell Bench Press', canonical_name_en: 'Dumbbell Bench Press', aliases_pt: ['dumbbell bench press', 'db bench press'], aliases_en: ['dumbbell bench press', 'db bench press'], exercise_type: 'hypertrophy', movement_pattern: 'push_horizontal', primary_muscles: ['chest'], secondary_muscles: ['triceps', 'front delts'], equipment: ['dumbbell', 'bench'], body_region: 'upper', is_compound: true, difficulty_level: 'beginner', default_rep_range: '8-15', default_set_range: '3-4', default_rest_seconds: 75, search_rank: 92 },
  { canonical_name_pt: 'Incline Dumbbell Press', canonical_name_en: 'Incline Dumbbell Press', aliases_pt: ['incline dumbbell press', 'incline db press'], aliases_en: ['incline dumbbell press', 'incline db press'], exercise_type: 'hypertrophy', movement_pattern: 'push_horizontal', primary_muscles: ['upper chest'], secondary_muscles: ['triceps', 'front delts'], equipment: ['dumbbell', 'bench'], body_region: 'upper', is_compound: true, difficulty_level: 'beginner', default_rep_range: '10-15', default_set_range: '3-4', default_rest_seconds: 75, search_rank: 85 },
  { canonical_name_pt: 'Dumbbell Fly', canonical_name_en: 'Dumbbell Fly', aliases_pt: ['dumbbell fly', 'chest fly', 'flat fly'], aliases_en: ['dumbbell fly', 'chest fly', 'flat fly'], exercise_type: 'hypertrophy', movement_pattern: 'push_horizontal', primary_muscles: ['chest'], secondary_muscles: ['front delts'], equipment: ['dumbbell', 'bench'], body_region: 'upper', is_compound: false, difficulty_level: 'beginner', default_rep_range: '12-15', default_set_range: '3-4', default_rest_seconds: 60, search_rank: 80 },
  { canonical_name_pt: 'Incline Dumbbell Fly', canonical_name_en: 'Incline Dumbbell Fly', aliases_pt: ['incline dumbbell fly', 'incline fly'], aliases_en: ['incline dumbbell fly', 'incline fly'], exercise_type: 'hypertrophy', movement_pattern: 'push_horizontal', primary_muscles: ['upper chest'], secondary_muscles: [], equipment: ['dumbbell', 'bench'], body_region: 'upper', is_compound: false, difficulty_level: 'beginner', default_rep_range: '12-15', default_set_range: '3-4', default_rest_seconds: 60, search_rank: 72 },
  { canonical_name_pt: 'Cable Crossover', canonical_name_en: 'Cable Crossover', aliases_pt: ['cable crossover', 'cable fly'], aliases_en: ['cable crossover', 'cable fly'], exercise_type: 'hypertrophy', movement_pattern: 'push_horizontal', primary_muscles: ['chest'], secondary_muscles: [], equipment: ['cable'], body_region: 'upper', is_compound: false, difficulty_level: 'beginner', default_rep_range: '12-20', default_set_range: '3-4', default_rest_seconds: 60, search_rank: 82 },
  { canonical_name_pt: 'Pec Deck Machine', canonical_name_en: 'Pec Deck Machine', aliases_pt: ['pec deck', 'machine fly', 'butterfly machine'], aliases_en: ['pec deck', 'machine fly', 'butterfly machine'], exercise_type: 'hypertrophy', movement_pattern: 'push_horizontal', primary_muscles: ['chest'], secondary_muscles: [], equipment: ['machine'], body_region: 'upper', is_compound: false, difficulty_level: 'beginner', default_rep_range: '12-20', default_set_range: '3-4', default_rest_seconds: 60, search_rank: 78 },
  { canonical_name_pt: 'Push-Up', canonical_name_en: 'Push-Up', aliases_pt: ['push-up', 'pushup'], aliases_en: ['push-up', 'pushup'], exercise_type: 'hypertrophy', movement_pattern: 'push_horizontal', primary_muscles: ['chest'], secondary_muscles: ['triceps', 'core'], equipment: ['bodyweight'], body_region: 'upper', is_compound: true, difficulty_level: 'beginner', default_rep_range: '10-20', default_set_range: '3-4', default_rest_seconds: 60, search_rank: 90 },
  { canonical_name_pt: 'Chest Dip', canonical_name_en: 'Chest Dip', aliases_pt: ['chest dip', 'dip'], aliases_en: ['chest dip', 'dip'], exercise_type: 'strength', movement_pattern: 'push_horizontal', primary_muscles: ['lower chest'], secondary_muscles: ['triceps', 'front delts'], equipment: ['bodyweight', 'parallel_bars'], body_region: 'upper', is_compound: true, difficulty_level: 'intermediate', default_rep_range: '8-15', default_set_range: '3-4', default_rest_seconds: 90, search_rank: 80 },

  // ═══ BACK ═══
  { canonical_name_pt: 'Deadlift', canonical_name_en: 'Deadlift', aliases_pt: ['deadlift', 'conventional deadlift'], aliases_en: ['deadlift', 'conventional deadlift'], exercise_type: 'strength', movement_pattern: 'hinge', primary_muscles: ['lower back', 'glutes', 'hamstrings'], secondary_muscles: ['traps', 'lats', 'quads'], equipment: ['barbell'], body_region: 'full_body', is_compound: true, difficulty_level: 'advanced', default_rep_range: '3-6', default_set_range: '3-5', default_rest_seconds: 180, search_rank: 98 },
  { canonical_name_pt: 'Barbell Row', canonical_name_en: 'Barbell Row', aliases_pt: ['barbell row', 'bent over row', 'barbell bent over row'], aliases_en: ['barbell row', 'bent over row', 'barbell bent over row'], exercise_type: 'strength', movement_pattern: 'pull_horizontal', primary_muscles: ['lats', 'mid traps'], secondary_muscles: ['biceps', 'rhomboids'], equipment: ['barbell'], body_region: 'upper', is_compound: true, difficulty_level: 'intermediate', default_rep_range: '6-10', default_set_range: '3-4', default_rest_seconds: 120, search_rank: 92 },
  { canonical_name_pt: 'Dumbbell Row', canonical_name_en: 'Dumbbell Row', aliases_pt: ['dumbbell row', 'db row', 'single arm row'], aliases_en: ['dumbbell row', 'db row', 'single arm row'], exercise_type: 'hypertrophy', movement_pattern: 'pull_horizontal', primary_muscles: ['lats'], secondary_muscles: ['biceps', 'rhomboids'], equipment: ['dumbbell', 'bench'], body_region: 'upper', is_compound: true, is_unilateral: true, difficulty_level: 'beginner', default_rep_range: '10-15', default_set_range: '3-4', default_rest_seconds: 75, search_rank: 88 },
  { canonical_name_pt: 'Seated Cable Row', canonical_name_en: 'Seated Cable Row', aliases_pt: ['seated cable row', 'cable row'], aliases_en: ['seated cable row', 'cable row'], exercise_type: 'hypertrophy', movement_pattern: 'pull_horizontal', primary_muscles: ['lats', 'mid traps'], secondary_muscles: ['biceps', 'rhomboids'], equipment: ['cable'], body_region: 'upper', is_compound: true, difficulty_level: 'beginner', default_rep_range: '10-15', default_set_range: '3-4', default_rest_seconds: 75, search_rank: 85 },
  { canonical_name_pt: 'Lat Pulldown', canonical_name_en: 'Lat Pulldown', aliases_pt: ['lat pulldown', 'pull-down', 'cable pulldown'], aliases_en: ['lat pulldown', 'pull-down', 'cable pulldown'], exercise_type: 'hypertrophy', movement_pattern: 'pull_vertical', primary_muscles: ['lats'], secondary_muscles: ['biceps', 'teres major'], equipment: ['cable'], body_region: 'upper', is_compound: true, difficulty_level: 'beginner', default_rep_range: '10-15', default_set_range: '3-4', default_rest_seconds: 75, search_rank: 92 },
  { canonical_name_pt: 'Pull-Up', canonical_name_en: 'Pull-Up', aliases_pt: ['pull-up', 'pullup', 'chin-up'], aliases_en: ['pull-up', 'pullup', 'chin-up'], exercise_type: 'strength', movement_pattern: 'pull_vertical', primary_muscles: ['lats'], secondary_muscles: ['biceps', 'teres major'], equipment: ['bodyweight', 'pull_up_bar'], body_region: 'upper', is_compound: true, difficulty_level: 'intermediate', default_rep_range: '6-12', default_set_range: '3-5', default_rest_seconds: 120, search_rank: 96 },
  { canonical_name_pt: 'Machine Row', canonical_name_en: 'Machine Row', aliases_pt: ['machine row', 'hammer strength row'], aliases_en: ['machine row', 'hammer strength row'], exercise_type: 'hypertrophy', movement_pattern: 'pull_horizontal', primary_muscles: ['lats', 'mid traps'], secondary_muscles: ['biceps'], equipment: ['machine'], body_region: 'upper', is_compound: true, difficulty_level: 'beginner', default_rep_range: '10-15', default_set_range: '3-4', default_rest_seconds: 75, search_rank: 78 },
  { canonical_name_pt: 'Dumbbell Pullover', canonical_name_en: 'Dumbbell Pullover', aliases_pt: ['dumbbell pullover', 'pullover'], aliases_en: ['dumbbell pullover', 'pullover'], exercise_type: 'hypertrophy', movement_pattern: 'pull_vertical', primary_muscles: ['lats', 'chest'], secondary_muscles: ['serratus'], equipment: ['dumbbell', 'bench'], body_region: 'upper', is_compound: false, difficulty_level: 'intermediate', default_rep_range: '12-15', default_set_range: '3-4', default_rest_seconds: 60, search_rank: 70 },
  { canonical_name_pt: 'Barbell Shrug', canonical_name_en: 'Barbell Shrug', aliases_pt: ['shrug', 'barbell shrug'], aliases_en: ['shrug', 'barbell shrug'], exercise_type: 'hypertrophy', movement_pattern: 'isolation', primary_muscles: ['traps'], secondary_muscles: [], equipment: ['barbell'], body_region: 'upper', is_compound: false, difficulty_level: 'beginner', default_rep_range: '12-20', default_set_range: '3-4', default_rest_seconds: 60, search_rank: 72 },
  { canonical_name_pt: 'Back Extension', canonical_name_en: 'Back Extension', aliases_pt: ['back extension', 'hyperextension'], aliases_en: ['back extension', 'hyperextension'], exercise_type: 'strength', movement_pattern: 'hinge', primary_muscles: ['lower back'], secondary_muscles: ['glutes', 'hamstrings'], equipment: ['machine', 'bench'], body_region: 'lower', is_compound: false, difficulty_level: 'beginner', default_rep_range: '12-20', default_set_range: '3-4', default_rest_seconds: 60, search_rank: 70 },

  // ═══ SHOULDERS ═══
  { canonical_name_pt: 'Overhead Press', canonical_name_en: 'Overhead Press', aliases_pt: ['overhead press', 'OHP', 'military press', 'shoulder press'], aliases_en: ['overhead press', 'OHP', 'military press', 'shoulder press'], exercise_type: 'strength', movement_pattern: 'push_vertical', primary_muscles: ['shoulders'], secondary_muscles: ['triceps', 'traps'], equipment: ['barbell'], body_region: 'upper', is_compound: true, difficulty_level: 'intermediate', default_rep_range: '5-8', default_set_range: '3-5', default_rest_seconds: 120, search_rank: 92 },
  { canonical_name_pt: 'Dumbbell Shoulder Press', canonical_name_en: 'Dumbbell Shoulder Press', aliases_pt: ['dumbbell shoulder press', 'db shoulder press', 'dumbbell press'], aliases_en: ['dumbbell shoulder press', 'db shoulder press', 'dumbbell press'], exercise_type: 'hypertrophy', movement_pattern: 'push_vertical', primary_muscles: ['shoulders'], secondary_muscles: ['triceps'], equipment: ['dumbbell'], body_region: 'upper', is_compound: true, difficulty_level: 'beginner', default_rep_range: '8-12', default_set_range: '3-4', default_rest_seconds: 90, search_rank: 88 },
  { canonical_name_pt: 'Lateral Raise', canonical_name_en: 'Lateral Raise', aliases_pt: ['lateral raise', 'dumbbell lateral raise', 'side raise'], aliases_en: ['lateral raise', 'dumbbell lateral raise', 'side raise'], exercise_type: 'hypertrophy', movement_pattern: 'isolation', primary_muscles: ['side delts'], secondary_muscles: [], equipment: ['dumbbell'], body_region: 'upper', is_compound: false, is_unilateral: false, difficulty_level: 'beginner', default_rep_range: '12-20', default_set_range: '3-5', default_rest_seconds: 60, search_rank: 94 },
  { canonical_name_pt: 'Cable Lateral Raise', canonical_name_en: 'Cable Lateral Raise', aliases_pt: ['cable lateral raise'], aliases_en: ['cable lateral raise'], exercise_type: 'hypertrophy', movement_pattern: 'isolation', primary_muscles: ['side delts'], secondary_muscles: [], equipment: ['cable'], body_region: 'upper', is_compound: false, is_unilateral: true, difficulty_level: 'beginner', default_rep_range: '12-20', default_set_range: '3-4', default_rest_seconds: 60, search_rank: 80 },
  { canonical_name_pt: 'Dumbbell Front Raise', canonical_name_en: 'Dumbbell Front Raise', aliases_pt: ['front raise', 'dumbbell front raise'], aliases_en: ['front raise', 'dumbbell front raise'], exercise_type: 'hypertrophy', movement_pattern: 'isolation', primary_muscles: ['front delts'], secondary_muscles: [], equipment: ['dumbbell'], body_region: 'upper', is_compound: false, difficulty_level: 'beginner', default_rep_range: '12-15', default_set_range: '3-4', default_rest_seconds: 60, search_rank: 72 },
  { canonical_name_pt: 'Upright Row', canonical_name_en: 'Upright Row', aliases_pt: ['upright row', 'barbell upright row'], aliases_en: ['upright row', 'barbell upright row'], exercise_type: 'hypertrophy', movement_pattern: 'pull_vertical', primary_muscles: ['side delts', 'traps'], secondary_muscles: ['biceps'], equipment: ['barbell', 'dumbbell'], body_region: 'upper', is_compound: true, difficulty_level: 'intermediate', default_rep_range: '10-15', default_set_range: '3-4', default_rest_seconds: 75, search_rank: 68 },
  { canonical_name_pt: 'Face Pull', canonical_name_en: 'Face Pull', aliases_pt: ['face pull', 'cable face pull'], aliases_en: ['face pull', 'cable face pull'], exercise_type: 'hypertrophy', movement_pattern: 'pull_horizontal', primary_muscles: ['rear delts', 'mid traps'], secondary_muscles: ['rhomboids'], equipment: ['cable'], body_region: 'upper', is_compound: false, difficulty_level: 'beginner', default_rep_range: '15-20', default_set_range: '3-4', default_rest_seconds: 60, search_rank: 78 },
  { canonical_name_pt: 'Dumbbell Rear Delt Fly', canonical_name_en: 'Dumbbell Rear Delt Fly', aliases_pt: ['rear delt fly', 'bent over lateral raise', 'reverse fly'], aliases_en: ['rear delt fly', 'bent over lateral raise', 'reverse fly'], exercise_type: 'hypertrophy', movement_pattern: 'isolation', primary_muscles: ['rear delts'], secondary_muscles: ['mid traps', 'rhomboids'], equipment: ['dumbbell'], body_region: 'upper', is_compound: false, difficulty_level: 'beginner', default_rep_range: '15-20', default_set_range: '3-4', default_rest_seconds: 60, search_rank: 76 },
  { canonical_name_pt: 'Arnold Press', canonical_name_en: 'Arnold Press', aliases_pt: ['arnold press', 'arnold dumbbell press'], aliases_en: ['arnold press', 'arnold dumbbell press'], exercise_type: 'hypertrophy', movement_pattern: 'push_vertical', primary_muscles: ['shoulders'], secondary_muscles: ['triceps'], equipment: ['dumbbell'], body_region: 'upper', is_compound: true, difficulty_level: 'intermediate', default_rep_range: '10-15', default_set_range: '3-4', default_rest_seconds: 75, search_rank: 78 },

  // ═══ BICEPS ═══
  { canonical_name_pt: 'Barbell Curl', canonical_name_en: 'Barbell Curl', aliases_pt: ['barbell curl', 'bicep curl', 'standing barbell curl'], aliases_en: ['barbell curl', 'bicep curl', 'standing barbell curl'], exercise_type: 'hypertrophy', movement_pattern: 'isolation', primary_muscles: ['biceps'], secondary_muscles: ['brachialis'], equipment: ['barbell'], body_region: 'upper', is_compound: false, difficulty_level: 'beginner', default_rep_range: '10-15', default_set_range: '3-4', default_rest_seconds: 60, search_rank: 92 },
  { canonical_name_pt: 'Dumbbell Curl', canonical_name_en: 'Dumbbell Curl', aliases_pt: ['dumbbell curl', 'alternating curl', 'db curl'], aliases_en: ['dumbbell curl', 'alternating curl', 'db curl'], exercise_type: 'hypertrophy', movement_pattern: 'isolation', primary_muscles: ['biceps'], secondary_muscles: ['brachialis'], equipment: ['dumbbell'], body_region: 'upper', is_compound: false, difficulty_level: 'beginner', default_rep_range: '10-15', default_set_range: '3-4', default_rest_seconds: 60, search_rank: 90 },
  { canonical_name_pt: 'Hammer Curl', canonical_name_en: 'Hammer Curl', aliases_pt: ['hammer curl', 'neutral grip curl'], aliases_en: ['hammer curl', 'neutral grip curl'], exercise_type: 'hypertrophy', movement_pattern: 'isolation', primary_muscles: ['brachioradialis', 'biceps'], secondary_muscles: [], equipment: ['dumbbell'], body_region: 'upper', is_compound: false, difficulty_level: 'beginner', default_rep_range: '10-15', default_set_range: '3-4', default_rest_seconds: 60, search_rank: 85 },
  { canonical_name_pt: 'Concentration Curl', canonical_name_en: 'Concentration Curl', aliases_pt: ['concentration curl'], aliases_en: ['concentration curl'], exercise_type: 'hypertrophy', movement_pattern: 'isolation', primary_muscles: ['biceps'], secondary_muscles: [], equipment: ['dumbbell'], body_region: 'upper', is_compound: false, is_unilateral: true, difficulty_level: 'beginner', default_rep_range: '12-15', default_set_range: '3-4', default_rest_seconds: 60, search_rank: 75 },
  { canonical_name_pt: 'Preacher Curl', canonical_name_en: 'Preacher Curl', aliases_pt: ['preacher curl', 'scott curl'], aliases_en: ['preacher curl', 'scott curl'], exercise_type: 'hypertrophy', movement_pattern: 'isolation', primary_muscles: ['biceps'], secondary_muscles: [], equipment: ['barbell', 'machine'], body_region: 'upper', is_compound: false, difficulty_level: 'beginner', default_rep_range: '10-15', default_set_range: '3-4', default_rest_seconds: 60, search_rank: 80 },
  { canonical_name_pt: 'Cable Curl', canonical_name_en: 'Cable Curl', aliases_pt: ['cable curl', 'cable bicep curl'], aliases_en: ['cable curl', 'cable bicep curl'], exercise_type: 'hypertrophy', movement_pattern: 'isolation', primary_muscles: ['biceps'], secondary_muscles: [], equipment: ['cable'], body_region: 'upper', is_compound: false, difficulty_level: 'beginner', default_rep_range: '12-20', default_set_range: '3-4', default_rest_seconds: 60, search_rank: 72 },
  { canonical_name_pt: '21s Curl', canonical_name_en: '21s Curl', aliases_pt: ['21s', '21 curl'], aliases_en: ['21s', '21 curl'], exercise_type: 'hypertrophy', movement_pattern: 'isolation', primary_muscles: ['biceps'], secondary_muscles: [], equipment: ['barbell'], body_region: 'upper', is_compound: false, difficulty_level: 'beginner', default_rep_range: '21', default_set_range: '3', default_rest_seconds: 75, search_rank: 65 },

  // ═══ TRICEPS ═══
  { canonical_name_pt: 'Cable Tricep Pushdown', canonical_name_en: 'Cable Tricep Pushdown', aliases_pt: ['tricep pushdown', 'cable pushdown', 'rope pushdown'], aliases_en: ['tricep pushdown', 'cable pushdown', 'rope pushdown'], exercise_type: 'hypertrophy', movement_pattern: 'isolation', primary_muscles: ['triceps'], secondary_muscles: [], equipment: ['cable'], body_region: 'upper', is_compound: false, difficulty_level: 'beginner', default_rep_range: '12-20', default_set_range: '3-4', default_rest_seconds: 60, search_rank: 94 },
  { canonical_name_pt: 'Skull Crusher', canonical_name_en: 'Skull Crusher', aliases_pt: ['skull crusher', 'lying tricep extension', 'EZ bar skullcrusher'], aliases_en: ['skull crusher', 'lying tricep extension', 'EZ bar skullcrusher'], exercise_type: 'hypertrophy', movement_pattern: 'isolation', primary_muscles: ['triceps'], secondary_muscles: [], equipment: ['barbell', 'bench'], body_region: 'upper', is_compound: false, difficulty_level: 'intermediate', default_rep_range: '10-15', default_set_range: '3-4', default_rest_seconds: 75, search_rank: 85 },
  { canonical_name_pt: 'French Press', canonical_name_en: 'French Press', aliases_pt: ['french press', 'overhead tricep extension', 'EZ bar french press'], aliases_en: ['french press', 'overhead tricep extension', 'EZ bar french press'], exercise_type: 'hypertrophy', movement_pattern: 'isolation', primary_muscles: ['triceps'], secondary_muscles: [], equipment: ['barbell', 'dumbbell'], body_region: 'upper', is_compound: false, difficulty_level: 'intermediate', default_rep_range: '10-15', default_set_range: '3-4', default_rest_seconds: 75, search_rank: 80 },
  { canonical_name_pt: 'Tricep Dip', canonical_name_en: 'Tricep Dip', aliases_pt: ['tricep dip', 'bench dip', 'dip'], aliases_en: ['tricep dip', 'bench dip', 'dip'], exercise_type: 'strength', movement_pattern: 'push_vertical', primary_muscles: ['triceps'], secondary_muscles: ['lower chest', 'front delts'], equipment: ['bodyweight', 'parallel_bars'], body_region: 'upper', is_compound: true, difficulty_level: 'intermediate', default_rep_range: '8-15', default_set_range: '3-4', default_rest_seconds: 90, search_rank: 78 },
  { canonical_name_pt: 'Bench Tricep Dip', canonical_name_en: 'Bench Tricep Dip', aliases_pt: ['bench dip', 'tricep bench dip'], aliases_en: ['bench dip', 'tricep bench dip'], exercise_type: 'hypertrophy', movement_pattern: 'push_vertical', primary_muscles: ['triceps'], secondary_muscles: ['lower chest'], equipment: ['bench', 'bodyweight'], body_region: 'upper', is_compound: false, difficulty_level: 'beginner', default_rep_range: '12-20', default_set_range: '3-4', default_rest_seconds: 60, search_rank: 75 },
  { canonical_name_pt: 'Dumbbell Kickback', canonical_name_en: 'Dumbbell Kickback', aliases_pt: ['dumbbell kickback', 'tricep kickback'], aliases_en: ['dumbbell kickback', 'tricep kickback'], exercise_type: 'hypertrophy', movement_pattern: 'isolation', primary_muscles: ['triceps'], secondary_muscles: [], equipment: ['dumbbell'], body_region: 'upper', is_compound: false, is_unilateral: true, difficulty_level: 'beginner', default_rep_range: '12-20', default_set_range: '3-4', default_rest_seconds: 60, search_rank: 72 },
  { canonical_name_pt: 'Dumbbell Skull Crusher', canonical_name_en: 'Dumbbell Skull Crusher', aliases_pt: ['dumbbell skull crusher', 'db lying tricep extension'], aliases_en: ['dumbbell skull crusher', 'db lying tricep extension'], exercise_type: 'hypertrophy', movement_pattern: 'isolation', primary_muscles: ['triceps'], secondary_muscles: [], equipment: ['dumbbell', 'bench'], body_region: 'upper', is_compound: false, difficulty_level: 'intermediate', default_rep_range: '12-15', default_set_range: '3-4', default_rest_seconds: 75, search_rank: 70 },

  // ═══ LEGS - QUADS ═══
  { canonical_name_pt: 'Barbell Squat', canonical_name_en: 'Barbell Squat', aliases_pt: ['squat', 'barbell squat', 'back squat'], aliases_en: ['squat', 'barbell squat', 'back squat'], exercise_type: 'strength', movement_pattern: 'squat', primary_muscles: ['quads', 'glutes'], secondary_muscles: ['hamstrings', 'lower back', 'core'], equipment: ['barbell', 'squat_rack'], body_region: 'lower', is_compound: true, difficulty_level: 'advanced', default_rep_range: '5-8', default_set_range: '4-5', default_rest_seconds: 180, search_rank: 99 },
  { canonical_name_pt: 'Front Squat', canonical_name_en: 'Front Squat', aliases_pt: ['front squat', 'barbell front squat'], aliases_en: ['front squat', 'barbell front squat'], exercise_type: 'strength', movement_pattern: 'squat', primary_muscles: ['quads'], secondary_muscles: ['glutes', 'core'], equipment: ['barbell', 'squat_rack'], body_region: 'lower', is_compound: true, difficulty_level: 'advanced', default_rep_range: '5-8', default_set_range: '3-5', default_rest_seconds: 180, search_rank: 80 },
  { canonical_name_pt: 'Leg Press', canonical_name_en: 'Leg Press', aliases_pt: ['leg press', '45 degree leg press'], aliases_en: ['leg press', '45 degree leg press'], exercise_type: 'hypertrophy', movement_pattern: 'squat', primary_muscles: ['quads', 'glutes'], secondary_muscles: ['hamstrings'], equipment: ['machine'], body_region: 'lower', is_compound: true, difficulty_level: 'beginner', default_rep_range: '10-15', default_set_range: '3-5', default_rest_seconds: 90, search_rank: 95 },
  { canonical_name_pt: 'Leg Extension', canonical_name_en: 'Leg Extension', aliases_pt: ['leg extension', 'knee extension'], aliases_en: ['leg extension', 'knee extension'], exercise_type: 'hypertrophy', movement_pattern: 'isolation', primary_muscles: ['quads'], secondary_muscles: [], equipment: ['machine'], body_region: 'lower', is_compound: false, difficulty_level: 'beginner', default_rep_range: '12-20', default_set_range: '3-4', default_rest_seconds: 60, search_rank: 88 },
  { canonical_name_pt: 'Goblet Squat', canonical_name_en: 'Goblet Squat', aliases_pt: ['goblet squat', 'dumbbell goblet squat'], aliases_en: ['goblet squat', 'dumbbell goblet squat'], exercise_type: 'hypertrophy', movement_pattern: 'squat', primary_muscles: ['quads', 'glutes'], secondary_muscles: ['core'], equipment: ['dumbbell', 'kettlebell'], body_region: 'lower', is_compound: true, difficulty_level: 'beginner', default_rep_range: '12-15', default_set_range: '3-4', default_rest_seconds: 75, search_rank: 78 },
  { canonical_name_pt: 'Machine Hack Squat', canonical_name_en: 'Machine Hack Squat', aliases_pt: ['hack squat', 'machine hack squat'], aliases_en: ['hack squat', 'machine hack squat'], exercise_type: 'hypertrophy', movement_pattern: 'squat', primary_muscles: ['quads'], secondary_muscles: ['glutes'], equipment: ['machine'], body_region: 'lower', is_compound: true, difficulty_level: 'intermediate', default_rep_range: '10-15', default_set_range: '3-4', default_rest_seconds: 90, search_rank: 82 },
  { canonical_name_pt: 'Bulgarian Split Squat', canonical_name_en: 'Bulgarian Split Squat', aliases_pt: ['bulgarian split squat', 'rear foot elevated split squat'], aliases_en: ['bulgarian split squat', 'rear foot elevated split squat'], exercise_type: 'hypertrophy', movement_pattern: 'lunge', primary_muscles: ['quads', 'glutes'], secondary_muscles: ['hamstrings'], equipment: ['dumbbell', 'bench'], body_region: 'lower', is_compound: true, is_unilateral: true, difficulty_level: 'intermediate', default_rep_range: '10-15', default_set_range: '3-4', default_rest_seconds: 90, search_rank: 88 },
  { canonical_name_pt: 'Dumbbell Lunge', canonical_name_en: 'Dumbbell Lunge', aliases_pt: ['lunge', 'dumbbell lunge', 'walking lunge'], aliases_en: ['lunge', 'dumbbell lunge', 'walking lunge'], exercise_type: 'hypertrophy', movement_pattern: 'lunge', primary_muscles: ['quads', 'glutes'], secondary_muscles: ['hamstrings'], equipment: ['dumbbell', 'bodyweight'], body_region: 'lower', is_compound: true, is_unilateral: true, difficulty_level: 'beginner', default_rep_range: '10-15', default_set_range: '3-4', default_rest_seconds: 75, search_rank: 82 },

  // ═══ LEGS - POSTERIOR CHAIN / GLUTES ═══
  { canonical_name_pt: 'Romanian Deadlift', canonical_name_en: 'Romanian Deadlift', aliases_pt: ['romanian deadlift', 'RDL', 'stiff leg deadlift'], aliases_en: ['romanian deadlift', 'RDL', 'stiff leg deadlift'], exercise_type: 'hypertrophy', movement_pattern: 'hinge', primary_muscles: ['hamstrings', 'glutes'], secondary_muscles: ['lower back'], equipment: ['barbell', 'dumbbell'], body_region: 'lower', is_compound: true, difficulty_level: 'intermediate', default_rep_range: '8-12', default_set_range: '3-4', default_rest_seconds: 90, search_rank: 92 },
  { canonical_name_pt: 'Lying Leg Curl', canonical_name_en: 'Lying Leg Curl', aliases_pt: ['lying leg curl', 'hamstring curl'], aliases_en: ['lying leg curl', 'hamstring curl'], exercise_type: 'hypertrophy', movement_pattern: 'isolation', primary_muscles: ['hamstrings'], secondary_muscles: [], equipment: ['machine'], body_region: 'lower', is_compound: false, difficulty_level: 'beginner', default_rep_range: '12-15', default_set_range: '3-4', default_rest_seconds: 60, search_rank: 86 },
  { canonical_name_pt: 'Seated Leg Curl', canonical_name_en: 'Seated Leg Curl', aliases_pt: ['seated leg curl'], aliases_en: ['seated leg curl'], exercise_type: 'hypertrophy', movement_pattern: 'isolation', primary_muscles: ['hamstrings'], secondary_muscles: [], equipment: ['machine'], body_region: 'lower', is_compound: false, difficulty_level: 'beginner', default_rep_range: '12-15', default_set_range: '3-4', default_rest_seconds: 60, search_rank: 80 },
  { canonical_name_pt: 'Barbell Hip Thrust', canonical_name_en: 'Barbell Hip Thrust', aliases_pt: ['hip thrust', 'barbell hip thrust', 'glute bridge'], aliases_en: ['hip thrust', 'barbell hip thrust', 'glute bridge'], exercise_type: 'hypertrophy', movement_pattern: 'hinge', primary_muscles: ['glutes'], secondary_muscles: ['hamstrings', 'lower back'], equipment: ['barbell', 'bench'], body_region: 'lower', is_compound: true, difficulty_level: 'intermediate', default_rep_range: '10-15', default_set_range: '3-4', default_rest_seconds: 90, search_rank: 90 },
  { canonical_name_pt: 'Glute Bridge', canonical_name_en: 'Glute Bridge', aliases_pt: ['glute bridge', 'floor glute bridge'], aliases_en: ['glute bridge', 'floor glute bridge'], exercise_type: 'hypertrophy', movement_pattern: 'hinge', primary_muscles: ['glutes'], secondary_muscles: ['hamstrings'], equipment: ['bodyweight', 'barbell'], body_region: 'lower', is_compound: false, difficulty_level: 'beginner', default_rep_range: '15-20', default_set_range: '3-4', default_rest_seconds: 60, search_rank: 82 },
  { canonical_name_pt: 'Good Morning', canonical_name_en: 'Good Morning', aliases_pt: ['good morning', 'barbell good morning'], aliases_en: ['good morning', 'barbell good morning'], exercise_type: 'strength', movement_pattern: 'hinge', primary_muscles: ['hamstrings', 'lower back'], secondary_muscles: ['glutes'], equipment: ['barbell'], body_region: 'lower', is_compound: true, difficulty_level: 'advanced', default_rep_range: '8-12', default_set_range: '3-4', default_rest_seconds: 90, search_rank: 65 },
  { canonical_name_pt: 'Hip Abduction Machine', canonical_name_en: 'Hip Abduction Machine', aliases_pt: ['hip abduction', 'abductor machine'], aliases_en: ['hip abduction', 'abductor machine'], exercise_type: 'hypertrophy', movement_pattern: 'isolation', primary_muscles: ['glute medius', 'glute minimus'], secondary_muscles: [], equipment: ['machine'], body_region: 'lower', is_compound: false, difficulty_level: 'beginner', default_rep_range: '15-20', default_set_range: '3-4', default_rest_seconds: 60, search_rank: 72 },
  { canonical_name_pt: 'Sumo Goblet Squat', canonical_name_en: 'Sumo Goblet Squat', aliases_pt: ['sumo squat', 'sumo goblet squat', 'wide stance squat'], aliases_en: ['sumo squat', 'sumo goblet squat', 'wide stance squat'], exercise_type: 'hypertrophy', movement_pattern: 'squat', primary_muscles: ['glutes', 'adductors'], secondary_muscles: ['quads'], equipment: ['dumbbell', 'kettlebell'], body_region: 'lower', is_compound: true, difficulty_level: 'beginner', default_rep_range: '12-15', default_set_range: '3-4', default_rest_seconds: 75, search_rank: 75 },

  // ═══ CALVES ═══
  { canonical_name_pt: 'Standing Calf Raise', canonical_name_en: 'Standing Calf Raise', aliases_pt: ['standing calf raise', 'calf raise'], aliases_en: ['standing calf raise', 'calf raise'], exercise_type: 'hypertrophy', movement_pattern: 'isolation', primary_muscles: ['calves'], secondary_muscles: ['soleus'], equipment: ['machine', 'bodyweight'], body_region: 'lower', is_compound: false, difficulty_level: 'beginner', default_rep_range: '15-25', default_set_range: '4-5', default_rest_seconds: 60, search_rank: 85 },
  { canonical_name_pt: 'Seated Calf Raise', canonical_name_en: 'Seated Calf Raise', aliases_pt: ['seated calf raise', 'soleus raise'], aliases_en: ['seated calf raise', 'soleus raise'], exercise_type: 'hypertrophy', movement_pattern: 'isolation', primary_muscles: ['soleus'], secondary_muscles: ['calves'], equipment: ['machine'], body_region: 'lower', is_compound: false, difficulty_level: 'beginner', default_rep_range: '15-25', default_set_range: '4-5', default_rest_seconds: 60, search_rank: 78 },
  { canonical_name_pt: 'Leg Press Calf Raise', canonical_name_en: 'Leg Press Calf Raise', aliases_pt: ['leg press calf raise'], aliases_en: ['leg press calf raise'], exercise_type: 'hypertrophy', movement_pattern: 'isolation', primary_muscles: ['calves'], secondary_muscles: [], equipment: ['machine'], body_region: 'lower', is_compound: false, difficulty_level: 'beginner', default_rep_range: '15-25', default_set_range: '4-5', default_rest_seconds: 60, search_rank: 68 },

  // ═══ CORE ═══
  { canonical_name_pt: 'Plank', canonical_name_en: 'Plank', aliases_pt: ['plank', 'front plank'], aliases_en: ['plank', 'front plank'], exercise_type: 'strength', movement_pattern: 'other', primary_muscles: ['core', 'transverse abdominis'], secondary_muscles: ['lower back', 'glutes'], equipment: ['bodyweight'], body_region: 'core', is_compound: false, difficulty_level: 'beginner', default_rep_range: '30-60s', default_set_range: '3-4', default_rest_seconds: 60, search_rank: 88 },
  { canonical_name_pt: 'Crunch', canonical_name_en: 'Crunch', aliases_pt: ['crunch', 'ab crunch', 'sit-up'], aliases_en: ['crunch', 'ab crunch', 'sit-up'], exercise_type: 'hypertrophy', movement_pattern: 'rotation', primary_muscles: ['abs'], secondary_muscles: [], equipment: ['bodyweight'], body_region: 'core', is_compound: false, difficulty_level: 'beginner', default_rep_range: '15-25', default_set_range: '3-4', default_rest_seconds: 60, search_rank: 88 },
  { canonical_name_pt: 'Ab Wheel Rollout', canonical_name_en: 'Ab Wheel Rollout', aliases_pt: ['ab wheel rollout', 'ab roller'], aliases_en: ['ab wheel rollout', 'ab roller'], exercise_type: 'strength', movement_pattern: 'other', primary_muscles: ['core', 'abs'], secondary_muscles: ['lower back', 'ombros'], equipment: ['ab_wheel'], body_region: 'core', is_compound: true, difficulty_level: 'intermediate', default_rep_range: '8-15', default_set_range: '3-4', default_rest_seconds: 75, search_rank: 78 },
  { canonical_name_pt: 'Leg Raise', canonical_name_en: 'Leg Raise', aliases_pt: ['leg raise', 'hanging leg raise', 'lying leg raise'], aliases_en: ['leg raise', 'hanging leg raise', 'lying leg raise'], exercise_type: 'hypertrophy', movement_pattern: 'rotation', primary_muscles: ['lower abs'], secondary_muscles: ['hip flexors'], equipment: ['bodyweight', 'pull_up_bar'], body_region: 'core', is_compound: false, difficulty_level: 'intermediate', default_rep_range: '12-20', default_set_range: '3-4', default_rest_seconds: 60, search_rank: 82 },
  { canonical_name_pt: 'Russian Twist', canonical_name_en: 'Russian Twist', aliases_pt: ['russian twist', 'medicine ball russian twist'], aliases_en: ['russian twist', 'medicine ball russian twist'], exercise_type: 'hypertrophy', movement_pattern: 'rotation', primary_muscles: ['obliques'], secondary_muscles: ['abs'], equipment: ['bodyweight', 'medicine_ball'], body_region: 'core', is_compound: false, difficulty_level: 'beginner', default_rep_range: '20-30', default_set_range: '3-4', default_rest_seconds: 60, search_rank: 75 },
  { canonical_name_pt: 'Dead Bug', canonical_name_en: 'Dead Bug', aliases_pt: ['dead bug'], aliases_en: ['dead bug'], exercise_type: 'strength', movement_pattern: 'other', primary_muscles: ['core', 'transverse abdominis'], secondary_muscles: [], equipment: ['bodyweight'], body_region: 'core', is_compound: false, difficulty_level: 'beginner', default_rep_range: '8-12', default_set_range: '3', default_rest_seconds: 60, search_rank: 65 },
  { canonical_name_pt: 'Cable Crunch', canonical_name_en: 'Cable Crunch', aliases_pt: ['cable crunch', 'kneeling cable crunch'], aliases_en: ['cable crunch', 'kneeling cable crunch'], exercise_type: 'hypertrophy', movement_pattern: 'rotation', primary_muscles: ['abs'], secondary_muscles: ['obliques'], equipment: ['cable'], body_region: 'core', is_compound: false, difficulty_level: 'beginner', default_rep_range: '15-20', default_set_range: '3-4', default_rest_seconds: 60, search_rank: 70 },

  // ═══ CARDIO / FULL BODY ═══
  { canonical_name_pt: 'Sumo Deadlift', canonical_name_en: 'Sumo Deadlift', aliases_pt: ['sumo deadlift', 'wide stance deadlift'], aliases_en: ['sumo deadlift', 'wide stance deadlift'], exercise_type: 'strength', movement_pattern: 'hinge', primary_muscles: ['glutes', 'adductors', 'quads'], secondary_muscles: ['hamstrings', 'lower back'], equipment: ['barbell'], body_region: 'lower', is_compound: true, difficulty_level: 'advanced', default_rep_range: '3-6', default_set_range: '3-5', default_rest_seconds: 180, search_rank: 78 },
  { canonical_name_pt: 'Kettlebell Swing', canonical_name_en: 'Kettlebell Swing', aliases_pt: ['kettlebell swing', 'russian swing', 'american swing'], aliases_en: ['kettlebell swing', 'russian swing', 'american swing'], exercise_type: 'strength', movement_pattern: 'hinge', primary_muscles: ['glutes', 'hamstrings'], secondary_muscles: ['lower back', 'core'], equipment: ['kettlebell'], body_region: 'full_body', is_compound: true, difficulty_level: 'intermediate', default_rep_range: '15-20', default_set_range: '3-5', default_rest_seconds: 75, search_rank: 80 },
  { canonical_name_pt: 'Burpee', canonical_name_en: 'Burpee', aliases_pt: ['burpee'], aliases_en: ['burpee'], exercise_type: 'cardio', movement_pattern: 'other', primary_muscles: ['full_body'], secondary_muscles: [], equipment: ['bodyweight'], body_region: 'full_body', is_compound: true, difficulty_level: 'intermediate', default_rep_range: '10-15', default_set_range: '3-5', default_rest_seconds: 60, search_rank: 75 },
  { canonical_name_pt: 'Treadmill Running', canonical_name_en: 'Treadmill Running', aliases_pt: ['treadmill', 'running', 'jogging'], aliases_en: ['treadmill', 'running', 'jogging'], exercise_type: 'cardio', movement_pattern: 'cardio_pattern', primary_muscles: ['quads', 'hamstrings', 'glutes'], secondary_muscles: [], equipment: ['treadmill'], body_region: 'full_body', is_compound: true, difficulty_level: 'beginner', default_rep_range: '20-40min', default_set_range: '1', default_rest_seconds: 0, search_rank: 90 },
  { canonical_name_pt: 'Stationary Bike', canonical_name_en: 'Stationary Bike', aliases_pt: ['stationary bike', 'cycling', 'spin bike'], aliases_en: ['stationary bike', 'cycling', 'spin bike'], exercise_type: 'cardio', movement_pattern: 'cardio_pattern', primary_muscles: ['quads', 'glutes'], secondary_muscles: [], equipment: ['bike'], body_region: 'lower', is_compound: true, difficulty_level: 'beginner', default_rep_range: '20-45min', default_set_range: '1', default_rest_seconds: 0, search_rank: 82 },
  { canonical_name_pt: 'Elliptical', canonical_name_en: 'Elliptical', aliases_pt: ['elliptical', 'cross trainer'], aliases_en: ['elliptical', 'cross trainer'], exercise_type: 'cardio', movement_pattern: 'cardio_pattern', primary_muscles: ['quads', 'glutes', 'hamstrings'], secondary_muscles: [], equipment: ['machine'], body_region: 'full_body', is_compound: true, difficulty_level: 'beginner', default_rep_range: '20-40min', default_set_range: '1', default_rest_seconds: 0, search_rank: 72 },
  { canonical_name_pt: 'Jump Rope', canonical_name_en: 'Jump Rope', aliases_pt: ['jump rope', 'skipping'], aliases_en: ['jump rope', 'skipping'], exercise_type: 'cardio', movement_pattern: 'cardio_pattern', primary_muscles: ['calves', 'full_body'], secondary_muscles: [], equipment: ['jump_rope'], body_region: 'full_body', is_compound: true, difficulty_level: 'beginner', default_rep_range: '3-5min', default_set_range: '3-5', default_rest_seconds: 60, search_rank: 78 },

  // ═══ OLYMPIC LIFTS ═══
  { canonical_name_pt: 'Clean and Jerk', canonical_name_en: 'Clean and Jerk', aliases_pt: ['clean and jerk', 'clean & jerk'], aliases_en: ['clean and jerk', 'clean & jerk'], exercise_type: 'strength', movement_pattern: 'other', primary_muscles: ['full_body'], secondary_muscles: [], equipment: ['barbell'], body_region: 'full_body', is_compound: true, difficulty_level: 'advanced', default_rep_range: '2-4', default_set_range: '3-5', default_rest_seconds: 180, search_rank: 60 },
  { canonical_name_pt: 'Snatch', canonical_name_en: 'Snatch', aliases_pt: ['snatch', 'power snatch'], aliases_en: ['snatch', 'power snatch'], exercise_type: 'strength', movement_pattern: 'other', primary_muscles: ['full_body'], secondary_muscles: [], equipment: ['barbell'], body_region: 'full_body', is_compound: true, difficulty_level: 'advanced', default_rep_range: '2-4', default_set_range: '3-5', default_rest_seconds: 180, search_rank: 58 },
  { canonical_name_pt: 'Power Clean', canonical_name_en: 'Power Clean', aliases_pt: ['power clean', 'hang clean'], aliases_en: ['power clean', 'hang clean'], exercise_type: 'strength', movement_pattern: 'hinge', primary_muscles: ['full_body'], secondary_muscles: [], equipment: ['barbell'], body_region: 'full_body', is_compound: true, difficulty_level: 'advanced', default_rep_range: '2-5', default_set_range: '3-5', default_rest_seconds: 180, search_rank: 62 },

  // ═══ MOBILITY / WARM-UP ═══
  { canonical_name_pt: 'Thoracic Rotation', canonical_name_en: 'Thoracic Rotation', aliases_pt: ['thoracic rotation', 'spinal rotation'], aliases_en: ['thoracic rotation', 'spinal rotation'], exercise_type: 'mobility', movement_pattern: 'rotation', primary_muscles: ['paravertebrais'], secondary_muscles: [], equipment: ['bodyweight'], body_region: 'upper', is_compound: false, difficulty_level: 'beginner', default_rep_range: '10-15', default_set_range: '2-3', default_rest_seconds: 30, search_rank: 60 },
  { canonical_name_pt: 'Hip Flexor Stretch', canonical_name_en: 'Hip Flexor Stretch', aliases_pt: ['hip flexor stretch', 'psoas stretch', 'lunge stretch'], aliases_en: ['hip flexor stretch', 'psoas stretch', 'lunge stretch'], exercise_type: 'mobility', movement_pattern: 'lunge', primary_muscles: ['hip flexors'], secondary_muscles: [], equipment: ['bodyweight'], body_region: 'lower', is_compound: false, difficulty_level: 'beginner', default_rep_range: '30-60s', default_set_range: '2-3', default_rest_seconds: 30, search_rank: 65 },
  { canonical_name_pt: 'Cossack Squat', canonical_name_en: 'Cossack Squat', aliases_pt: ['cossack squat', 'lateral squat'], aliases_en: ['cossack squat', 'lateral squat'], exercise_type: 'mobility', movement_pattern: 'squat', primary_muscles: ['adductors', 'glutes'], secondary_muscles: ['quads'], equipment: ['bodyweight'], body_region: 'lower', is_compound: true, difficulty_level: 'intermediate', default_rep_range: '8-12', default_set_range: '2-3', default_rest_seconds: 60, search_rank: 62 },

  // ═══ EXTRAS POPULARES ═══
  { canonical_name_pt: 'Reverse Curl', canonical_name_en: 'Reverse Curl', aliases_pt: ['reverse curl', 'reverse barbell curl'], aliases_en: ['reverse curl', 'reverse barbell curl'], exercise_type: 'hypertrophy', movement_pattern: 'isolation', primary_muscles: ['brachioradialis', 'forearm extensors'], secondary_muscles: ['biceps'], equipment: ['barbell', 'dumbbell'], body_region: 'upper', is_compound: false, difficulty_level: 'beginner', default_rep_range: '12-15', default_set_range: '3-4', default_rest_seconds: 60, search_rank: 65 },
  { canonical_name_pt: 'Wrist Curl', canonical_name_en: 'Wrist Curl', aliases_pt: ['wrist curl', 'forearm curl'], aliases_en: ['wrist curl', 'forearm curl'], exercise_type: 'hypertrophy', movement_pattern: 'isolation', primary_muscles: ['forearm flexors'], secondary_muscles: [], equipment: ['barbell', 'dumbbell'], body_region: 'upper', is_compound: false, difficulty_level: 'beginner', default_rep_range: '15-20', default_set_range: '3-4', default_rest_seconds: 45, search_rank: 55 },
  { canonical_name_pt: 'Diamond Push-Up', canonical_name_en: 'Diamond Push-Up', aliases_pt: ['diamond push-up', 'close grip push-up', 'tricep push-up'], aliases_en: ['diamond push-up', 'close grip push-up', 'tricep push-up'], exercise_type: 'hypertrophy', movement_pattern: 'push_horizontal', primary_muscles: ['triceps'], secondary_muscles: ['chest'], equipment: ['bodyweight'], body_region: 'upper', is_compound: true, difficulty_level: 'intermediate', default_rep_range: '10-20', default_set_range: '3-4', default_rest_seconds: 60, search_rank: 70 },
  { canonical_name_pt: 'Incline Push-Up', canonical_name_en: 'Incline Push-Up', aliases_pt: ['incline push-up'], aliases_en: ['incline push-up'], exercise_type: 'hypertrophy', movement_pattern: 'push_horizontal', primary_muscles: ['lower chest'], secondary_muscles: ['triceps'], equipment: ['bodyweight'], body_region: 'upper', is_compound: true, difficulty_level: 'beginner', default_rep_range: '12-20', default_set_range: '3-4', default_rest_seconds: 60, search_rank: 65 },
  { canonical_name_pt: 'Superman', canonical_name_en: 'Superman', aliases_pt: ['superman', 'back extension floor'], aliases_en: ['superman', 'back extension floor'], exercise_type: 'strength', movement_pattern: 'hinge', primary_muscles: ['lower back', 'glutes'], secondary_muscles: [], equipment: ['bodyweight'], body_region: 'lower', is_compound: false, difficulty_level: 'beginner', default_rep_range: '15-20', default_set_range: '3', default_rest_seconds: 45, search_rank: 60 },
  { canonical_name_pt: 'Box Step-Up', canonical_name_en: 'Box Step-Up', aliases_pt: ['step-up', 'box step-up', 'bench step-up'], aliases_en: ['step-up', 'box step-up', 'bench step-up'], exercise_type: 'hypertrophy', movement_pattern: 'lunge', primary_muscles: ['quads', 'glutes'], secondary_muscles: [], equipment: ['bench', 'bodyweight'], body_region: 'lower', is_compound: true, is_unilateral: true, difficulty_level: 'beginner', default_rep_range: '12-15', default_set_range: '3-4', default_rest_seconds: 75, search_rank: 72 },
  { canonical_name_pt: 'Meadows Row', canonical_name_en: 'Meadows Row', aliases_pt: ['meadows row'], aliases_en: ['meadows row'], exercise_type: 'hypertrophy', movement_pattern: 'pull_horizontal', primary_muscles: ['lats'], secondary_muscles: ['biceps', 'traps'], equipment: ['barbell'], body_region: 'upper', is_compound: true, is_unilateral: true, difficulty_level: 'intermediate', default_rep_range: '10-15', default_set_range: '3-4', default_rest_seconds: 75, search_rank: 68 },
  { canonical_name_pt: 'Chest Supported Row', canonical_name_en: 'Chest Supported Row', aliases_pt: ['chest supported row', 'incline dumbbell row'], aliases_en: ['chest supported row', 'incline dumbbell row'], exercise_type: 'hypertrophy', movement_pattern: 'pull_horizontal', primary_muscles: ['lats', 'mid traps'], secondary_muscles: ['biceps', 'rhomboids'], equipment: ['dumbbell', 'bench'], body_region: 'upper', is_compound: true, difficulty_level: 'beginner', default_rep_range: '10-15', default_set_range: '3-4', default_rest_seconds: 75, search_rank: 75 },
  { canonical_name_pt: 'Overhead Tricep Extension', canonical_name_en: 'Overhead Tricep Extension', aliases_pt: ['overhead tricep extension', 'dumbbell overhead extension'], aliases_en: ['overhead tricep extension', 'dumbbell overhead extension'], exercise_type: 'hypertrophy', movement_pattern: 'isolation', primary_muscles: ['triceps'], secondary_muscles: [], equipment: ['dumbbell'], body_region: 'upper', is_compound: false, difficulty_level: 'beginner', default_rep_range: '12-15', default_set_range: '3-4', default_rest_seconds: 60, search_rank: 72 },
  { canonical_name_pt: 'Single Leg Calf Raise', canonical_name_en: 'Single Leg Calf Raise', aliases_pt: ['single leg calf raise', 'donkey calf raise'], aliases_en: ['single leg calf raise', 'donkey calf raise'], exercise_type: 'hypertrophy', movement_pattern: 'isolation', primary_muscles: ['calves'], secondary_muscles: ['soleus'], equipment: ['bodyweight', 'step'], body_region: 'lower', is_compound: false, is_unilateral: true, difficulty_level: 'beginner', default_rep_range: '15-25', default_set_range: '4', default_rest_seconds: 60, search_rank: 68 },
  { canonical_name_pt: 'Hip Adduction Machine', canonical_name_en: 'Hip Adduction Machine', aliases_pt: ['hip adduction', 'adductor machine', 'inner thigh machine'], aliases_en: ['hip adduction', 'adductor machine', 'inner thigh machine'], exercise_type: 'hypertrophy', movement_pattern: 'isolation', primary_muscles: ['adductors'], secondary_muscles: [], equipment: ['machine'], body_region: 'lower', is_compound: false, difficulty_level: 'beginner', default_rep_range: '15-20', default_set_range: '3-4', default_rest_seconds: 60, search_rank: 68 },
  { canonical_name_pt: 'Dumbbell Deadlift', canonical_name_en: 'Dumbbell Deadlift', aliases_pt: ['dumbbell deadlift', 'db deadlift'], aliases_en: ['dumbbell deadlift', 'db deadlift'], exercise_type: 'strength', movement_pattern: 'hinge', primary_muscles: ['glutes', 'hamstrings', 'lower back'], secondary_muscles: ['traps', 'lats'], equipment: ['dumbbell'], body_region: 'full_body', is_compound: true, difficulty_level: 'beginner', default_rep_range: '8-12', default_set_range: '3-4', default_rest_seconds: 90, search_rank: 78 },

  // ═══ POPULAR GYM ACCESSORIES ═══
  { canonical_name_pt: 'Lat Pulldown (Straight Bar)', canonical_name_en: 'Lat Pulldown (Straight Bar)', aliases_pt: ['pulley straight bar', 'straight bar pulldown'], aliases_en: ['pulley straight bar', 'straight bar pulldown'], exercise_type: 'hypertrophy', movement_pattern: 'pull_vertical', primary_muscles: ['lats'], secondary_muscles: ['biceps'], equipment: ['cable'], body_region: 'upper', is_compound: true, difficulty_level: 'beginner', default_rep_range: '10-15', default_set_range: '3-4', default_rest_seconds: 75, search_rank: 95 },
  { canonical_name_pt: 'Wide Grip Lat Pulldown', canonical_name_en: 'Wide Grip Lat Pulldown', aliases_pt: ['wide grip pulldown', 'wide lat pulldown'], aliases_en: ['wide grip pulldown', 'wide lat pulldown'], exercise_type: 'hypertrophy', movement_pattern: 'pull_vertical', primary_muscles: ['lats'], secondary_muscles: [], equipment: ['cable'], body_region: 'upper', is_compound: true, difficulty_level: 'beginner', default_rep_range: '10-15', default_set_range: '3-4', default_rest_seconds: 75, search_rank: 88 },
  { canonical_name_pt: 'Close Grip Lat Pulldown', canonical_name_en: 'Close Grip Lat Pulldown', aliases_pt: ['close grip pulldown', 'narrow lat pulldown'], aliases_en: ['close grip pulldown', 'narrow lat pulldown'], exercise_type: 'hypertrophy', movement_pattern: 'pull_vertical', primary_muscles: ['lats'], secondary_muscles: ['biceps'], equipment: ['cable'], body_region: 'upper', is_compound: true, difficulty_level: 'beginner', default_rep_range: '10-15', default_set_range: '3-4', default_rest_seconds: 75, search_rank: 82 },
  { canonical_name_pt: 'High Pulley Pull', canonical_name_en: 'High Pulley Pull', aliases_pt: ['high pulley pull', 'high cable pull'], aliases_en: ['high pulley pull', 'high cable pull'], exercise_type: 'hypertrophy', movement_pattern: 'pull_vertical', primary_muscles: ['traps', 'shoulders'], secondary_muscles: ['lats'], equipment: ['cable'], body_region: 'upper', is_compound: false, difficulty_level: 'beginner', default_rep_range: '12-15', default_set_range: '3-4', default_rest_seconds: 60, search_rank: 70 },
  { canonical_name_pt: 'Low Cable Row', canonical_name_en: 'Low Cable Row', aliases_pt: ['low cable row'], aliases_en: ['low cable row'], exercise_type: 'hypertrophy', movement_pattern: 'pull_horizontal', primary_muscles: ['lats'], secondary_muscles: ['biceps'], equipment: ['cable'], body_region: 'upper', is_compound: true, difficulty_level: 'beginner', default_rep_range: '10-15', default_set_range: '3-4', default_rest_seconds: 75, search_rank: 85 },
  { canonical_name_pt: 'Chest Supported Cable Row', canonical_name_en: 'Chest Supported Cable Row', aliases_pt: ['chest supported cable row', 'machine row'], aliases_en: ['chest supported cable row', 'machine row'] , exercise_type: 'hypertrophy', movement_pattern: 'pull_horizontal', primary_muscles: ['lats', 'traps'], secondary_muscles: ['biceps'], equipment: ['cable', 'bench'], body_region: 'upper', is_compound: true, difficulty_level: 'beginner', default_rep_range: '10-15', default_set_range: '3-4', default_rest_seconds: 75, search_rank: 80 },

  // ═══ MANGUITO ROTADOR / ROTADOR EXTERNO ═══
  { canonical_name_pt: 'Dumbbell External Rotation', canonical_name_en: 'Dumbbell External Rotation', aliases_pt: ['external rotation', 'shoulder external rotation', 'rotator cuff exercise'], aliases_en: ['external rotation', 'shoulder external rotation', 'rotator cuff exercise'], exercise_type: 'strength', movement_pattern: 'isolation', primary_muscles: ['infraespinhal', 'redondo menor'], secondary_muscles: [], equipment: ['dumbbell'], body_region: 'upper', is_compound: false, difficulty_level: 'beginner', default_rep_range: '15-20', default_set_range: '3-4', default_rest_seconds: 45, search_rank: 85 },
  { canonical_name_pt: 'Dumbbell Internal Rotation', canonical_name_en: 'Dumbbell Internal Rotation', aliases_pt: ['internal rotation', 'shoulder internal rotation'], aliases_en: ['internal rotation', 'shoulder internal rotation'], exercise_type: 'strength', movement_pattern: 'isolation', primary_muscles: ['subescapular'], secondary_muscles: [], equipment: ['dumbbell'], body_region: 'upper', is_compound: false, difficulty_level: 'beginner', default_rep_range: '15-20', default_set_range: '3-4', default_rest_seconds: 45, search_rank: 72 },
  { canonical_name_pt: 'Cable External Rotation', canonical_name_en: 'Cable External Rotation', aliases_pt: ['cable external rotation'], aliases_en: ['cable external rotation'], exercise_type: 'strength', movement_pattern: 'isolation', primary_muscles: ['infraespinhal'], secondary_muscles: [], equipment: ['cable'], body_region: 'upper', is_compound: false, difficulty_level: 'beginner', default_rep_range: '15-20', default_set_range: '3-4', default_rest_seconds: 45, search_rank: 75 },
  { canonical_name_pt: 'Cable Rear Delt Fly', canonical_name_en: 'Cable Rear Delt Fly', aliases_pt: ['cable reverse fly', 'cable rear delt fly'], aliases_en: ['cable reverse fly', 'cable rear delt fly'], exercise_type: 'hypertrophy', movement_pattern: 'isolation', primary_muscles: ['rear delts'], secondary_muscles: ['traps'], equipment: ['cable'], body_region: 'upper', is_compound: false, is_unilateral: false, difficulty_level: 'beginner', default_rep_range: '15-20', default_set_range: '3-4', default_rest_seconds: 60, search_rank: 78 },

  // ═══ COMMON MOBILITY / REHAB ═══
  { canonical_name_pt: 'Band Pull Apart', canonical_name_en: 'Band Pull Apart', aliases_pt: ['band pull apart', 'resistance band pull apart'], aliases_en: ['band pull apart', 'resistance band pull apart'], exercise_type: 'mobility', movement_pattern: 'pull_horizontal', primary_muscles: ['traps'], secondary_muscles: ['rhomboids'], equipment: ['resistance_band'], body_region: 'upper', is_compound: false, difficulty_level: 'beginner', default_rep_range: '15-20', default_set_range: '3', default_rest_seconds: 30, search_rank: 70 },
  { canonical_name_pt: 'Shoulder Dislocations', canonical_name_en: 'Shoulder Dislocations', aliases_pt: ['shoulder dislocations', 'shoulder pass through'], aliases_en: ['shoulder dislocations', 'shoulder pass through'], exercise_type: 'mobility', movement_pattern: 'push_horizontal', primary_muscles: ['ombro'], secondary_muscles: ['chest'], equipment: ['dowel', 'bodyweight'], body_region: 'upper', is_compound: false, difficulty_level: 'beginner', default_rep_range: '10-15', default_set_range: '2-3', default_rest_seconds: 30, search_rank: 65 },
  { canonical_name_pt: 'Calf Stretch', canonical_name_en: 'Calf Stretch', aliases_pt: ['calf stretch', 'wall calf stretch'], aliases_en: ['calf stretch', 'wall calf stretch'], exercise_type: 'mobility', movement_pattern: 'isolation', primary_muscles: ['calves', 'soleus'], secondary_muscles: [], equipment: ['bodyweight', 'wall'], body_region: 'lower', is_compound: false, difficulty_level: 'beginner', default_rep_range: '30-60s', default_set_range: '2-3', default_rest_seconds: 30, search_rank: 60 },
  { canonical_name_pt: 'Wall Chest Stretch', canonical_name_en: 'Wall Chest Stretch', aliases_pt: ['wall chest stretch', 'pectoral stretch'], aliases_en: ['wall chest stretch', 'pectoral stretch'], exercise_type: 'mobility', movement_pattern: 'push_horizontal', primary_muscles: ['chest'], secondary_muscles: [], equipment: ['wall', 'bodyweight'], body_region: 'upper', is_compound: false, difficulty_level: 'beginner', default_rep_range: '30-60s', default_set_range: '2-3', default_rest_seconds: 30, search_rank: 60 },

  // ═══ ISOLATION / EXTRA ACCESSORIES ═══
  { canonical_name_pt: 'Cable Preacher Curl', canonical_name_en: 'Cable Preacher Curl', aliases_pt: ['cable scott curl', 'cable preacher curl'], aliases_en: ['cable scott curl', 'cable preacher curl'], exercise_type: 'hypertrophy', movement_pattern: 'isolation', primary_muscles: ['biceps'], secondary_muscles: [], equipment: ['cable'], body_region: 'upper', is_compound: false, difficulty_level: 'beginner', default_rep_range: '12-20', default_set_range: '3-4', default_rest_seconds: 60, search_rank: 72 },
  { canonical_name_pt: 'Single Leg Extension', canonical_name_en: 'Single Leg Extension', aliases_pt: ['single leg extension', 'unilateral leg extension'], aliases_en: ['single leg extension', 'unilateral leg extension'], exercise_type: 'hypertrophy', movement_pattern: 'isolation', primary_muscles: ['quads'], secondary_muscles: [], equipment: ['machine'], body_region: 'lower', is_compound: false, is_unilateral: true, difficulty_level: 'beginner', default_rep_range: '12-20', default_set_range: '3-4', default_rest_seconds: 60, search_rank: 75 },
  { canonical_name_pt: 'Single Leg Curl', canonical_name_en: 'Single Leg Curl', aliases_pt: ['single leg curl', 'unilateral leg curl'], aliases_en: ['single leg curl', 'unilateral leg curl'], exercise_type: 'hypertrophy', movement_pattern: 'isolation', primary_muscles: ['hamstrings'], secondary_muscles: [], equipment: ['machine'], body_region: 'lower', is_compound: false, is_unilateral: true, difficulty_level: 'beginner', default_rep_range: '12-15', default_set_range: '3-4', default_rest_seconds: 60, search_rank: 72 },
  { canonical_name_pt: 'Single Hip Abduction', canonical_name_en: 'Single Hip Abduction', aliases_pt: ['single hip abduction', 'unilateral abduction'], aliases_en: ['single hip abduction', 'unilateral abduction'], exercise_type: 'hypertrophy', movement_pattern: 'isolation', primary_muscles: ['glute medius'], secondary_muscles: [], equipment: ['machine'], body_region: 'lower', is_compound: false, is_unilateral: true, difficulty_level: 'beginner', default_rep_range: '15-20', default_set_range: '3-4', default_rest_seconds: 60, search_rank: 68 },
  { canonical_name_pt: 'Decline Sit-Up', canonical_name_en: 'Decline Sit-Up', aliases_pt: ['decline sit-up', 'decline crunch'], aliases_en: ['decline sit-up', 'decline crunch'], exercise_type: 'hypertrophy', movement_pattern: 'rotation', primary_muscles: ['abs'], secondary_muscles: ['obliques'], equipment: ['bench'], body_region: 'core', is_compound: false, difficulty_level: 'intermediate', default_rep_range: '15-20', default_set_range: '3-4', default_rest_seconds: 60, search_rank: 75 },
  { canonical_name_pt: 'Ab Machine Crunch', canonical_name_en: 'Ab Machine Crunch', aliases_pt: ['ab machine', 'machine crunch'], aliases_en: ['ab machine', 'machine crunch'], exercise_type: 'hypertrophy', movement_pattern: 'rotation', primary_muscles: ['abs'], secondary_muscles: [], equipment: ['machine'], body_region: 'core', is_compound: false, difficulty_level: 'beginner', default_rep_range: '15-20', default_set_range: '3-4', default_rest_seconds: 60, search_rank: 70 },

  // ═══ CUSTOM PROGRAM VARIATIONS ═══
  { canonical_name_pt: 'Incline Smith Machine Press', canonical_name_en: 'Incline Smith Machine Press', aliases_pt: ['incline smith machine press', 'smith incline press'], aliases_en: ['incline smith machine press', 'smith incline press'], exercise_type: 'hypertrophy', movement_pattern: 'push_horizontal', primary_muscles: ['upper chest'], secondary_muscles: ['triceps', 'front delts'], equipment: ['machine', 'barbell', 'bench'], body_region: 'upper', is_compound: true, difficulty_level: 'beginner', default_rep_range: '8-12', default_set_range: '4-6', default_rest_seconds: 120, search_rank: 86 },
  { canonical_name_pt: 'Reverse Grip Tricep Pushdown', canonical_name_en: 'Reverse Grip Tricep Pushdown', aliases_pt: ['reverse grip tricep pushdown', 'underhand tricep pushdown'], aliases_en: ['reverse grip tricep pushdown', 'underhand tricep pushdown'], exercise_type: 'hypertrophy', movement_pattern: 'isolation', primary_muscles: ['triceps'], secondary_muscles: ['forearms'], equipment: ['cable'], body_region: 'upper', is_compound: false, difficulty_level: 'beginner', default_rep_range: '10-12', default_set_range: '3-4', default_rest_seconds: 90, search_rank: 74 },
  { canonical_name_pt: 'Straight Arm Rope Pulldown', canonical_name_en: 'Straight Arm Rope Pulldown', aliases_pt: ['rope pulldown', 'straight arm rope pulldown'], aliases_en: ['rope pulldown', 'straight arm rope pulldown'], exercise_type: 'hypertrophy', movement_pattern: 'pull_vertical', primary_muscles: ['lats'], secondary_muscles: ['teres major', 'serratus'], equipment: ['cable', 'rope'], body_region: 'upper', is_compound: false, difficulty_level: 'beginner', default_rep_range: '12-20', default_set_range: '3-4', default_rest_seconds: 90, search_rank: 79 },
  { canonical_name_pt: 'Single Arm Iso Row (Pronated Grip)', canonical_name_en: 'Single Arm Iso Row (Pronated Grip)', aliases_pt: ['single arm iso row pronated', 'unilateral machine row pronated'], aliases_en: ['single arm iso row pronated', 'unilateral machine row pronated'], exercise_type: 'hypertrophy', movement_pattern: 'pull_horizontal', primary_muscles: ['lats', 'mid traps'], secondary_muscles: ['biceps', 'rhomboids'], equipment: ['machine'], body_region: 'upper', is_compound: true, is_unilateral: true, difficulty_level: 'beginner', default_rep_range: '10-12', default_set_range: '4-5', default_rest_seconds: 120, search_rank: 77 },
  { canonical_name_pt: 'Wide Supinated Lat Pulldown', canonical_name_en: 'Wide Supinated Lat Pulldown', aliases_pt: ['wide supinated lat pulldown', 'wide underhand lat pulldown'], aliases_en: ['wide supinated lat pulldown', 'wide underhand lat pulldown'], exercise_type: 'hypertrophy', movement_pattern: 'pull_vertical', primary_muscles: ['lats'], secondary_muscles: ['biceps', 'teres major'], equipment: ['cable'], body_region: 'upper', is_compound: true, difficulty_level: 'beginner', default_rep_range: '10-12', default_set_range: '4-5', default_rest_seconds: 120, search_rank: 76 },
  { canonical_name_pt: 'Smith Machine Squat', canonical_name_en: 'Smith Machine Squat', aliases_pt: ['smith machine squat', 'smith squat'], aliases_en: ['smith machine squat', 'smith squat'], exercise_type: 'strength', movement_pattern: 'squat', primary_muscles: ['quads', 'glutes'], secondary_muscles: ['adductors', 'core'], equipment: ['machine', 'barbell'], body_region: 'lower', is_compound: true, difficulty_level: 'beginner', default_rep_range: '8-12', default_set_range: '4-6', default_rest_seconds: 150, search_rank: 84 },
  { canonical_name_pt: 'Barbell Romanian Deadlift', canonical_name_en: 'Barbell Romanian Deadlift', aliases_pt: ['barbell stiff', 'barbell romanian deadlift', 'RDL'], aliases_en: ['barbell stiff', 'barbell romanian deadlift', 'RDL'], exercise_type: 'strength', movement_pattern: 'hinge', primary_muscles: ['hamstrings', 'glutes'], secondary_muscles: ['lower back', 'adductors'], equipment: ['barbell'], body_region: 'lower', is_compound: true, difficulty_level: 'intermediate', default_rep_range: '8-12', default_set_range: '3-4', default_rest_seconds: 120, search_rank: 90 },
  { canonical_name_pt: 'Lying Leg Curl', canonical_name_en: 'Lying Leg Curl', aliases_pt: ['lying leg curl', 'prone leg curl'], aliases_en: ['lying leg curl', 'prone leg curl'], exercise_type: 'hypertrophy', movement_pattern: 'isolation', primary_muscles: ['hamstrings'], secondary_muscles: ['calves'], equipment: ['machine'], body_region: 'lower', is_compound: false, difficulty_level: 'beginner', default_rep_range: '10-12', default_set_range: '3-4', default_rest_seconds: 120, search_rank: 83 },
  { canonical_name_pt: 'Smith Machine Split Squat', canonical_name_en: 'Smith Machine Split Squat', aliases_pt: ['smith machine split squat', 'smith lunge'], aliases_en: ['smith machine split squat', 'smith lunge'], exercise_type: 'hypertrophy', movement_pattern: 'lunge', primary_muscles: ['quads', 'glutes'], secondary_muscles: ['adductors'], equipment: ['machine', 'barbell'], body_region: 'lower', is_compound: true, is_unilateral: true, difficulty_level: 'intermediate', default_rep_range: '10-12', default_set_range: '3-4', default_rest_seconds: 120, search_rank: 78 },
  { canonical_name_pt: 'Smith Machine Standing Calf Raise', canonical_name_en: 'Smith Machine Standing Calf Raise', aliases_pt: ['smith machine calf raise', 'standing smith calf raise'], aliases_en: ['smith machine calf raise', 'standing smith calf raise'], exercise_type: 'hypertrophy', movement_pattern: 'isolation', primary_muscles: ['calves'], secondary_muscles: ['soleus'], equipment: ['machine', 'barbell', 'step'], body_region: 'lower', is_compound: false, difficulty_level: 'beginner', default_rep_range: '10-15', default_set_range: '3-4', default_rest_seconds: 60, search_rank: 74 },
  { canonical_name_pt: 'Machine Chest Press', canonical_name_en: 'Machine Chest Press', aliases_pt: ['machine chest press', 'chest press machine'], aliases_en: ['machine chest press', 'chest press machine'], exercise_type: 'hypertrophy', movement_pattern: 'push_horizontal', primary_muscles: ['chest'], secondary_muscles: ['triceps', 'front delts'], equipment: ['machine'], body_region: 'upper', is_compound: true, difficulty_level: 'beginner', default_rep_range: '8-12', default_set_range: '4-5', default_rest_seconds: 120, search_rank: 82 },
  { canonical_name_pt: 'Machine Shoulder Press', canonical_name_en: 'Machine Shoulder Press', aliases_pt: ['machine shoulder press', 'shoulder press machine'], aliases_en: ['machine shoulder press', 'shoulder press machine'], exercise_type: 'hypertrophy', movement_pattern: 'push_vertical', primary_muscles: ['shoulders'], secondary_muscles: ['triceps'], equipment: ['machine'], body_region: 'upper', is_compound: true, difficulty_level: 'beginner', default_rep_range: '8-12', default_set_range: '3-4', default_rest_seconds: 120, search_rank: 80 },
  { canonical_name_pt: 'Cable Rope Front Raise', canonical_name_en: 'Cable Rope Front Raise', aliases_pt: ['rope front raise', 'cable rope front raise'], aliases_en: ['rope front raise', 'cable rope front raise'], exercise_type: 'hypertrophy', movement_pattern: 'isolation', primary_muscles: ['front delts'], secondary_muscles: ['serratus'], equipment: ['cable', 'rope'], body_region: 'upper', is_compound: false, difficulty_level: 'beginner', default_rep_range: '10-12', default_set_range: '3-4', default_rest_seconds: 120, search_rank: 71 },
  { canonical_name_pt: 'Cable Rope Crunch', canonical_name_en: 'Cable Rope Crunch', aliases_pt: ['cable rope crunch', 'cable crunch'], aliases_en: ['cable rope crunch', 'cable crunch'], exercise_type: 'hypertrophy', movement_pattern: 'rotation', primary_muscles: ['abs'], secondary_muscles: ['obliques'], equipment: ['cable', 'rope'], body_region: 'core', is_compound: false, difficulty_level: 'beginner', default_rep_range: '12-15', default_set_range: '3-4', default_rest_seconds: 60, search_rank: 81 },
  { canonical_name_pt: 'Neutral Grip Seated Cable Row', canonical_name_en: 'Neutral Grip Seated Cable Row', aliases_pt: ['neutral grip seated cable row', 'neutral grip cable row'], aliases_en: ['neutral grip seated cable row', 'neutral grip cable row'], exercise_type: 'hypertrophy', movement_pattern: 'pull_horizontal', primary_muscles: ['lats', 'mid traps'], secondary_muscles: ['biceps', 'rhomboids'], equipment: ['cable'], body_region: 'upper', is_compound: true, difficulty_level: 'beginner', default_rep_range: '10-12', default_set_range: '4-5', default_rest_seconds: 120, search_rank: 80 },
  { canonical_name_pt: 'Reverse Pec Deck', canonical_name_en: 'Reverse Pec Deck', aliases_pt: ['reverse pec deck', 'machine rear delt fly'], aliases_en: ['reverse pec deck', 'machine rear delt fly'], exercise_type: 'hypertrophy', movement_pattern: 'isolation', primary_muscles: ['rear delts'], secondary_muscles: ['mid traps', 'rhomboids'], equipment: ['machine'], body_region: 'upper', is_compound: false, difficulty_level: 'beginner', default_rep_range: '10-12', default_set_range: '3-4', default_rest_seconds: 120, search_rank: 79 },
  { canonical_name_pt: 'Single Arm Cable Overhead Tricep Extension', canonical_name_en: 'Single Arm Cable Overhead Tricep Extension', aliases_pt: ['single arm cable overhead tricep extension', 'single arm cable french press'], aliases_en: ['single arm cable overhead tricep extension', 'single arm cable french press'], exercise_type: 'hypertrophy', movement_pattern: 'isolation', primary_muscles: ['triceps'], secondary_muscles: [], equipment: ['cable'], body_region: 'upper', is_compound: false, is_unilateral: true, difficulty_level: 'beginner', default_rep_range: '10-12', default_set_range: '3-4', default_rest_seconds: 120, search_rank: 78 },
  { canonical_name_pt: 'V-Up', canonical_name_en: 'V-Up', aliases_pt: ['v-up', 'jackknife sit-up'], aliases_en: ['v-up', 'jackknife sit-up'], exercise_type: 'hypertrophy', movement_pattern: 'rotation', primary_muscles: ['abs'], secondary_muscles: ['hip flexors', 'obliques'], equipment: ['bodyweight'], body_region: 'core', is_compound: false, difficulty_level: 'intermediate', default_rep_range: '15-20', default_set_range: '3', default_rest_seconds: 60, search_rank: 76 },
  ];

function normalize(s) {
  // Normalize accents, casing, and punctuation
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s]/g, '') // Remove other characters
    .replace(/\s+/g, ' ')
    .trim();
}

const ENGLISH_MUSCLES = new Set([
  'abs',
  'adductors',
  'biceps',
  'brachialis',
  'brachioradialis',
  'calves',
  'chest',
  'core',
  'forearm extensors',
  'forearm flexors',
  'forearms',
  'front delts',
  'full_body',
  'glute medius',
  'glute minimus',
  'glutes',
  'hamstrings',
  'hip flexors',
  'lats',
  'lower abs',
  'lower back',
  'lower chest',
  'mid traps',
  'obliques',
  'quads',
  'rear delts',
  'rhomboids',
  'serratus',
  'shoulders',
  'side delts',
  'soleus',
  'teres major',
  'traps',
  'transverse abdominis',
  'triceps',
  'upper chest',
]);

function sanitizeMuscles(list = []) {
  if (!Array.isArray(list)) return [];
  return [...new Set(
    list
      .map((muscle) => normalize(muscle))
      .filter((muscle) => ENGLISH_MUSCLES.has(muscle))
  )];
}

function scoreMatch(ex, query) {
  const q = normalize(query);
  if (!q || q.length < 2) return -1;
  
  const namePt = normalize(ex.canonical_name_pt);
  const nameEn = normalize(ex.canonical_name_en || '');
  const aliasesPt = (ex.aliases_pt || []).map(normalize);
  const aliasesEn = (ex.aliases_en || []).map(normalize);
  
  const rank = ex.search_rank || 0;

  // Exact match = highest score
  if (namePt === q || nameEn === q) return 1000 + rank;
  
  // Exact alias match
  if (aliasesPt.some(a => a === q) || aliasesEn.some(a => a === q)) return 950 + rank;

  // Prefix match (word starts with query)
  if (namePt.startsWith(q) || nameEn.startsWith(q)) return 800 + rank;
  if (aliasesPt.some(a => a.startsWith(q)) || aliasesEn.some(a => a.startsWith(q))) return 750 + rank;

  // Contains full query
  if (namePt.includes(q) || nameEn.includes(q)) return 600 + rank;
  if (aliasesPt.some(a => a.includes(q)) || aliasesEn.some(a => a.includes(q))) return 550 + rank;

  // Multi-word match: score by proportion of matched words
  const words = q.split(/\s+/).filter(w => w.length > 1);
  if (words.length > 1) {
    const all = [namePt, nameEn, ...aliasesPt, ...aliasesEn].join(' ');
    const matched = words.filter(w => all.includes(w)).length;
    if (matched > 0) {
      const ratio = matched / words.length;
      return ratio * 400 + rank; // 0-400 points
    }
  }

  // Single word: check partial matches (3+ chars)
  if (q.length >= 3) {
    const all = [namePt, nameEn, ...aliasesPt, ...aliasesEn].join(' ');
    const partialWords = q.split(/\s+/).filter(w => w.length >= 3);
    if (partialWords.some(w => all.includes(w))) {
      return 300 + rank;
    }
  }

  return -1;
}

function formatExercise(ex) {
  return {
    id: ex.id,
    name: ex.canonical_name_en || ex.canonical_name_pt || ex.name,
    name_en: ex.canonical_name_en || ex.canonical_name_pt || ex.name || null,
    slug: ex.slug || null,
    exercise_type: ex.exercise_type,
    movement_pattern: ex.movement_pattern,
    primary_muscles: sanitizeMuscles(ex.primary_muscles || []),
    secondary_muscles: sanitizeMuscles(ex.secondary_muscles || []),
    equipment: ex.equipment || [],
    body_region: ex.body_region,
    difficulty_level: ex.difficulty_level,
    is_unilateral: ex.is_unilateral || false,
    is_compound: ex.is_compound || false,
    default_rep_range: ex.default_rep_range || null,
    default_set_range: ex.default_set_range || null,
    default_rest_seconds: ex.default_rest_seconds || null,
    substitutions: ex.substitutions || [],
    technique_tags: ex.technique_tags || [],
    search_rank: ex.search_rank || 0,
    source: ex.source || 'local',
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { action } = body;

    // ── SEARCH ─────────────────────────────────────────────────────────────────
    if (action === 'search') {
      const { query, limit = 8 } = body;
      if (!query || query.length < 2) return Response.json({ results: [] });

      const all = await base44.asServiceRole.entities.ExerciseMaster.filter({ is_active: true }, '-search_rank', 600);
      const scored = all
        .map(ex => ({ ex, score: scoreMatch(ex, query) }))
        .filter(x => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(x => formatExercise(x.ex));

      return Response.json({ results: scored, source: 'local' });
    }

    // ── BY MUSCLE ──────────────────────────────────────────────────────────────
    if (action === 'by_muscle') {
      const { muscle, limit = 12 } = body;
      if (!muscle) return Response.json({ results: [] });
      const q = normalize(muscle);
      const all = await base44.asServiceRole.entities.ExerciseMaster.filter({ is_active: true }, '-search_rank', 500);
      const results = all
        .filter(ex => [...sanitizeMuscles(ex.primary_muscles || []), ...sanitizeMuscles(ex.secondary_muscles || [])].some(m => normalize(m).includes(q)))
        .sort((a, b) => (b.search_rank || 0) - (a.search_rank || 0))
        .slice(0, limit)
        .map(formatExercise);
      return Response.json({ results });
    }

    // ── BY EQUIPMENT ───────────────────────────────────────────────────────────
    if (action === 'by_equipment') {
      const { equipment, limit = 12 } = body;
      if (!equipment) return Response.json({ results: [] });
      const q = normalize(equipment);
      const all = await base44.asServiceRole.entities.ExerciseMaster.filter({ is_active: true }, '-search_rank', 500);
      const results = all
        .filter(ex => (ex.equipment || []).some(e => normalize(e).includes(q)))
        .sort((a, b) => (b.search_rank || 0) - (a.search_rank || 0))
        .slice(0, limit)
        .map(formatExercise);
      return Response.json({ results });
    }

    // ── GET BY ID ──────────────────────────────────────────────────────────────
    if (action === 'get') {
      const { id } = body;
      const list = await base44.asServiceRole.entities.ExerciseMaster.filter({ id });
      if (!list.length) return Response.json({ result: null }, { status: 404 });
      return Response.json({ result: formatExercise(list[0]) });
    }

    // ── IMPORT (add custom/external exercise) ──────────────────────────────────
    if (action === 'import') {
      const { exercise } = body;
      const canonicalName = exercise?.canonical_name_en || exercise?.canonical_name_pt || exercise?.name;
      if (!canonicalName) return Response.json({ error: 'Name required' }, { status: 400 });
      if (exercise.source_external_id) {
        const existing = await base44.asServiceRole.entities.ExerciseMaster.filter({ source_external_id: exercise.source_external_id });
        if (existing.length > 0) return Response.json({ id: existing[0].id, imported: false });
      }
      const created = await base44.asServiceRole.entities.ExerciseMaster.create({
        ...exercise,
        canonical_name_en: canonicalName,
        canonical_name_pt: exercise?.canonical_name_pt || canonicalName,
        is_active: true,
        source: exercise.source || 'manual',
      });
      return Response.json({ id: created.id, imported: true });
    }

    // ── SEED (admin: populate initial dataset) ─────────────────────────────────
    if (action === 'seed') {
      const user = await base44.auth.me();
      if (user?.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });

      let count = 0;
      for (const seed of SEED) {
        const existing = await base44.asServiceRole.entities.ExerciseMaster.filter({ canonical_name_en: seed.canonical_name_en });
        if (existing.length === 0) {
          await base44.asServiceRole.entities.ExerciseMaster.create({
            ...seed,
            is_active: true,
            source: 'local',
            slug: seed.canonical_name_en.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          });
          count++;
        }
      }
      return Response.json({ seeded: count, total: SEED.length });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });

  } catch (err) {
    console.error('exerciseSearch error:', err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
});
