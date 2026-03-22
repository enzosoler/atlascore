/**
 * Atlas Core — Exercise Enrichment
 *
 * Adds performance & prescription metadata that ExerciseDB doesn't provide:
 *   - movement_pattern
 *   - resistance_curve
 *   - fatigue_profile
 *   - stability
 *   - unilateral
 *   - is_compound
 *   - difficulty_level
 *   - default_set_range, default_rep_range, default_rest_seconds
 *
 * Strategy: rule-based heuristics using exercise name, target muscle,
 * body part, and equipment. Designed to be readable and easy to extend.
 */

// ─── Movement pattern rules ───────────────────────────────────────────────────

const MOVEMENT_PATTERNS = [
  // Hinge (check before "pull" to avoid deadlift → pull)
  {
    pattern: 'hinge',
    keywords: [
      'deadlift', 'romanian', 'rdl', 'stiff', 'good morning',
      'hip hinge', 'kettlebell swing', 'swing',
    ],
  },
  // Hip Extension / Glute
  {
    pattern: 'hip_extension',
    keywords: [
      'hip thrust', 'glute bridge', 'bridge', 'donkey kick', 'kickback glute',
    ],
  },
  // Vertical Push
  {
    pattern: 'push_vertical',
    keywords: [
      'overhead press', 'shoulder press', 'military press', 'arnold press',
      'pike push', 'handstand push', 'push press',
    ],
  },
  // Horizontal Push
  {
    pattern: 'push_horizontal',
    keywords: [
      'bench press', 'chest press', 'push-up', 'pushup', 'dip',
      'chest fly', 'dumbbell fly', 'cable fly', 'pec deck', 'fly',
    ],
  },
  // Vertical Pull
  {
    pattern: 'pull_vertical',
    keywords: [
      'pull-up', 'pullup', 'chin-up', 'chinup', 'lat pulldown', 'pulldown',
    ],
  },
  // Horizontal Pull
  {
    pattern: 'pull_horizontal',
    keywords: [
      'row', 'face pull', 'rear delt', 'reverse fly',
    ],
  },
  // Squat
  {
    pattern: 'squat',
    keywords: [
      'squat', 'leg press', 'hack squat', 'goblet', 'sissy squat',
    ],
  },
  // Lunge
  {
    pattern: 'lunge',
    keywords: [
      'lunge', 'split squat', 'bulgarian', 'step-up', 'step up',
      'reverse lunge', 'walking lunge',
    ],
  },
  // Carry
  {
    pattern: 'carry',
    keywords: ['carry', "farmer's walk", 'farmer walk', 'suitcase'],
  },
  // Rotation
  {
    pattern: 'rotation',
    keywords: [
      'russian twist', 'wood chop', 'chop', 'rotation', 'twist',
      'windmill', 'pallof', 'anti-rotation',
    ],
  },
  // Isolation — catch-all for single-joint movements
  {
    pattern: 'isolation',
    keywords: [
      'curl', 'extension', 'raise', 'kickback', 'shrug', 'calf raise',
      'calf press', 'leg extension', 'leg curl', 'abduction', 'adduction',
      'concentration', 'preacher', 'skull', 'pushdown', 'crunch',
      'sit-up', 'plank', 'bridge', 'hyperextension',
    ],
  },
];

/**
 * Determine movement pattern from exercise name + bodyPart + target.
 */
export function inferMovementPattern(name = '', bodyPart = '', target = '', equipment = '') {
  const text = `${name} ${bodyPart} ${target}`.toLowerCase();

  for (const { pattern, keywords } of MOVEMENT_PATTERNS) {
    if (keywords.some((kw) => text.includes(kw))) return pattern;
  }

  // Fallback by body part
  if (['chest', 'shoulders', 'triceps'].includes(bodyPart)) return 'push_horizontal';
  if (['back', 'biceps'].includes(bodyPart)) return 'pull_horizontal';
  if (['upper legs'].includes(bodyPart)) return 'squat';
  if (['lower legs', 'waist'].includes(bodyPart)) return 'isolation';

  return 'isolation';
}

// ─── Resistance curve rules ───────────────────────────────────────────────────

/**
 * Resistance curve describes where in the ROM the exercise is hardest.
 *   'ascending'  — hardest at end (e.g., squat out of hole, deadlift off floor)
 *   'mid_peak'   — hardest at 90° / mid-range (e.g., dumbbell curl)
 *   'constant'   — relatively equal throughout (e.g., cable exercises)
 *   'descending' — easier as you extend (e.g., leg extension near lock-out)
 */
export function inferResistanceCurve(name = '', equipment = '') {
  const text = `${name} ${equipment}`.toLowerCase();

  // Cable exercises: most constant due to pulley mechanics
  if (equipment.toLowerCase().includes('cable') || text.includes('cable')) {
    return 'constant';
  }
  // Bands: ascending (more resistance as stretched)
  if (equipment.toLowerCase().includes('band') || text.includes('band')) {
    return 'ascending';
  }
  // Flies / flyes: ascending-descending (more stretch at bottom)
  if (text.includes('fly') || text.includes('flye')) return 'mid_peak';
  // Curl variations: ascending (hardest at peak contraction)
  if (text.includes('curl') && !text.includes('leg curl')) return 'mid_peak';
  // Leg extension: ascending towards lock-out
  if (text.includes('leg extension')) return 'ascending';
  // Leg curl: mid peak
  if (text.includes('leg curl')) return 'mid_peak';
  // Lateral raises with dumbbells: ascending
  if (text.includes('lateral raise') || text.includes('front raise')) return 'ascending';
  // Squat patterns: ascending (hardest out of hole)
  if (
    text.includes('squat') ||
    text.includes('leg press') ||
    text.includes('lunge')
  )
    return 'ascending';
  // Deadlift / hinge: ascending (hardest off floor)
  if (text.includes('deadlift') || text.includes('rdl') || text.includes('romanian'))
    return 'ascending';
  // Hip thrust: mid_peak (hardest at full extension)
  if (text.includes('hip thrust') || text.includes('glute bridge')) return 'mid_peak';
  // Row variations: mid_peak
  if (text.includes('row')) return 'mid_peak';
  // Press variations: ascending
  if (text.includes('press')) return 'ascending';

  return 'ascending'; // safe default for most free-weight exercises
}

// ─── Fatigue profile rules ────────────────────────────────────────────────────

/**
 * Fatigue profile indicates systemic/neural fatigue generated.
 *   'very_high' — heavy compound, high CNS demand (deadlift, heavy squat)
 *   'high'      — moderate compound (bench press, row, overhead press)
 *   'medium'    — lighter compound or heavy isolation
 *   'low'       — isolation, machine, light cardio
 */
export function inferFatigueProfile(name = '', bodyPart = '', equipment = '', isCompound = false) {
  const text = `${name} ${bodyPart} ${equipment}`.toLowerCase();

  // Very high: heavy full-body / posterior chain compounds
  if (
    text.includes('deadlift') ||
    text.includes('barbell squat') ||
    text.includes('power clean') ||
    text.includes('power snatch') ||
    text.includes('clean and jerk') ||
    (text.includes('squat') && equipment.toLowerCase().includes('barbell'))
  )
    return 'very_high';

  // High: major compound movements
  if (
    isCompound &&
    (equipment.toLowerCase().includes('barbell') ||
      text.includes('bench press') ||
      text.includes('row') ||
      text.includes('pull-up') ||
      text.includes('pullup') ||
      text.includes('chin-up') ||
      text.includes('overhead press') ||
      text.includes('hip thrust') ||
      text.includes('romanian') ||
      text.includes('bulgarian'))
  )
    return 'high';

  // Machine compound: medium
  if (
    isCompound &&
    (equipment.toLowerCase().includes('machine') ||
      equipment.toLowerCase().includes('leverage'))
  )
    return 'medium';

  // Light isolation
  if (
    text.includes('lateral raise') ||
    text.includes('front raise') ||
    text.includes('concentration curl') ||
    text.includes('kickback') ||
    text.includes('wrist curl') ||
    text.includes('calf raise') ||
    text.includes('shrug') ||
    bodyPart === 'neck'
  )
    return 'low';

  // Isolation with machine
  if (!isCompound && equipment.toLowerCase().includes('machine')) return 'low';
  if (!isCompound && equipment.toLowerCase().includes('cable')) return 'medium';
  if (!isCompound) return 'medium';

  return 'medium'; // default
}

// ─── Stability rules ──────────────────────────────────────────────────────────

/**
 * Stability required (core + joint stabilization demands).
 *   'very_high' — fixed-path machine (leg press machine, pec deck)
 *   'high'      — cable with stable base, smith machine
 *   'medium'    — bilateral free weights, dumbbell bilateral
 *   'low'       — unilateral free weights, unstable surface, KB
 */
export function inferStability(name = '', equipment = '', isUnilateral = false) {
  const text = `${name} ${equipment}`.toLowerCase();
  const equip = equipment.toLowerCase();

  // Fixed-path machines: maximum stability provided by machine
  if (
    equip.includes('leverage machine') ||
    equip.includes('assisted machine') ||
    text.includes('leg press') ||
    text.includes('pec deck') ||
    text.includes('leg extension') ||
    text.includes('leg curl') ||
    text.includes('seated') && equip.includes('machine')
  )
    return 'very_high';

  // Smith machine: high stability
  if (equip.includes('smith')) return 'high';

  // Cable bilateral: high stability (path guided, stable stance)
  if (equip.includes('cable') && !isUnilateral) return 'high';

  // Unilateral: always lower stability
  if (isUnilateral) return 'low';

  // Barbell bilateral: medium (free path but two points of contact)
  if (equip.includes('barbell')) return 'medium';

  // Dumbbell bilateral: medium
  if (equip.includes('dumbbell') && !isUnilateral) return 'medium';

  // Kettlebell: medium-low
  if (equip.includes('kettlebell')) return 'medium';

  // Bodyweight: varies — push-ups, dips = medium; single-leg = low
  if (equip.includes('body weight') || equip.includes('bodyweight')) {
    if (text.includes('single') || text.includes('pistol') || text.includes('one leg'))
      return 'low';
    return 'medium';
  }

  return 'medium';
}

// ─── Compound / unilateral detection ─────────────────────────────────────────

const UNILATERAL_KEYWORDS = [
  'single', 'one arm', 'one-arm', 'unilateral', 'alternating', 'single-leg',
  'single leg', 'pistol', 'bulgarian', 'split squat', 'lunge', 'step-up',
  'step up', 'concentration', 'one hand', 'one-hand',
];

const COMPOUND_KEYWORDS_TRUE = [
  'squat', 'deadlift', 'bench press', 'row', 'press', 'pull-up', 'pullup',
  'chin-up', 'chinup', 'lunge', 'thrust', 'clean', 'snatch', 'jerk',
  'dip', 'push-up', 'pushup',
];

const COMPOUND_KEYWORDS_FALSE = [
  'curl', 'lateral raise', 'front raise', 'extension', 'kickback', 'shrug',
  'calf raise', 'leg extension', 'leg curl', 'crunch', 'sit-up', 'plank',
  'abduction', 'adduction', 'concentration',
];

export function inferIsUnilateral(name = '') {
  const text = name.toLowerCase();
  return UNILATERAL_KEYWORDS.some((kw) => text.includes(kw));
}

export function inferIsCompound(name = '', bodyPart = '') {
  const text = name.toLowerCase();
  if (COMPOUND_KEYWORDS_FALSE.some((kw) => text.includes(kw))) return false;
  if (COMPOUND_KEYWORDS_TRUE.some((kw) => text.includes(kw))) return true;
  // Multi-muscle body parts suggest compound
  if (['back', 'upper legs', 'chest'].includes(bodyPart)) return true;
  return false;
}

// ─── Difficulty estimation ────────────────────────────────────────────────────

export function inferDifficulty(name = '', equipment = '', isCompound = false) {
  const text = `${name} ${equipment}`.toLowerCase();
  const equip = equipment.toLowerCase();

  if (
    text.includes('deadlift') ||
    text.includes('clean') ||
    text.includes('snatch') ||
    text.includes('pistol') ||
    text.includes('handstand')
  )
    return 'advanced';

  if (
    isCompound &&
    (equip.includes('barbell') || equip.includes('dumbbell')) &&
    !equip.includes('machine')
  )
    return 'intermediate';

  if (equip.includes('machine') || equip.includes('cable') || text.includes('body weight'))
    return 'beginner';

  return 'intermediate';
}

// ─── Default prescription values ─────────────────────────────────────────────

export function inferDefaultPrescription(
  movementPattern = '',
  fatigueProfile = '',
  isCompound = false
) {
  // Default sets
  let set_range = 3;
  let rep_range = '10-12';
  let rest_seconds = 60;

  if (fatigueProfile === 'very_high') {
    set_range = 4;
    rep_range = '4-6';
    rest_seconds = 180;
  } else if (fatigueProfile === 'high') {
    set_range = 4;
    rep_range = '6-10';
    rest_seconds = 120;
  } else if (fatigueProfile === 'medium') {
    set_range = 3;
    rep_range = '10-12';
    rest_seconds = 90;
  } else if (fatigueProfile === 'low') {
    set_range = 3;
    rep_range = '12-15';
    rest_seconds = 45;
  }

  // Cardio / carries: time-based
  if (movementPattern === 'carry') {
    rep_range = '30-40s';
    rest_seconds = 60;
  }
  // Core / planks
  if (['plank', 'crunch', 'sit-up'].some((kw) => movementPattern.includes(kw))) {
    rep_range = '15-20';
    rest_seconds = 45;
  }

  return { default_set_range: set_range, default_rep_range: rep_range, default_rest_seconds: rest_seconds };
}

// ─── Main enrichment function ─────────────────────────────────────────────────

/**
 * Enrich a normalized exercise with all performance metadata.
 * Takes the normalized exercise and adds missing performance fields.
 */
export function enrichExercise(exercise) {
  const { canonical_name_en = '', body_part = '', target_muscle = '', equipment = '' } = exercise;

  const isUnilateral = exercise.unilateral ?? inferIsUnilateral(canonical_name_en);
  const isCompound = exercise.is_compound ?? inferIsCompound(canonical_name_en, body_part);

  const movement_pattern =
    exercise.movement_pattern ?? inferMovementPattern(canonical_name_en, body_part, target_muscle, equipment);

  const resistance_curve =
    exercise.resistance_curve ?? inferResistanceCurve(canonical_name_en, equipment);

  const fatigue_profile =
    exercise.fatigue_profile ?? inferFatigueProfile(canonical_name_en, body_part, equipment, isCompound);

  const stability =
    exercise.stability ?? inferStability(canonical_name_en, equipment, isUnilateral);

  const difficulty_level =
    exercise.difficulty_level ?? inferDifficulty(canonical_name_en, equipment, isCompound);

  const prescription = inferDefaultPrescription(movement_pattern, fatigue_profile, isCompound);

  return {
    ...exercise,
    movement_pattern,
    resistance_curve,
    fatigue_profile,
    stability,
    unilateral: isUnilateral,
    is_compound: isCompound,
    difficulty_level,
    default_set_range: exercise.default_set_range ?? prescription.default_set_range,
    default_rep_range: exercise.default_rep_range ?? prescription.default_rep_range,
    default_rest_seconds: exercise.default_rest_seconds ?? prescription.default_rest_seconds,
  };
}

// ─── Label maps ───────────────────────────────────────────────────────────────

export const MOVEMENT_PATTERN_LABELS = {
  push_horizontal: 'Horizontal push',
  push_vertical: 'Vertical push',
  pull_horizontal: 'Horizontal pull',
  pull_vertical: 'Vertical pull',
  squat: 'Squat',
  hinge: 'Hip hinge',
  lunge: 'Lunge',
  carry: 'Carry',
  rotation: 'Rotation',
  hip_extension: 'Hip extension',
  isolation: 'Isolation',
};

export const RESISTANCE_CURVE_LABELS = {
  ascending: 'Hardest at lockout',
  mid_peak: 'Hardest in the middle',
  constant: 'Relatively constant',
  descending: 'Hardest at the start',
};

export const FATIGUE_PROFILE_LABELS = {
  very_high: 'Very high',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const STABILITY_LABELS = {
  very_high: 'Very high (guided)',
  high: 'High',
  medium: 'Medium',
  low: 'Low (unstable)',
};
