/**
 * Routine presets — curated, opinionated starter programs.
 *
 * Reference: common evidence-based splits used in Hevy / Boostcamp / Fitbod
 * preset libraries. Every exercise references a real id from DEMO_EXERCISES
 * in ExerciseLibrary.jsx so the user lands on working screens.
 *
 * Schema:
 *   {
 *     id:             string (slug)
 *     name:           string
 *     tagline:        string — short one-liner under the name
 *     description:    string — 1-2 sentences of what the program is for
 *     level:          'Beginner' | 'Intermediate' | 'Advanced'
 *     daysPerWeek:    number
 *     split:          string — 'PPL', 'Upper/Lower', 'Bro split', 'Full body', 'A/B/C/D/E'
 *     goal:           'Hypertrophy' | 'Strength' | 'General fitness' | 'Conditioning'
 *     durationMin:    [min, max] — typical session length in minutes
 *     equipment:      string[] — equipment categories needed
 *     accent:         'cyan' | 'violet' | 'gold'
 *     days: [
 *       {
 *         name:       string — 'Push A', 'Upper', 'Day 1', etc.
 *         focus:      string — 'Chest, Shoulders, Triceps'
 *         exercises: [
 *           { exerciseId, sets, repRange, restSec, note? }
 *         ]
 *       }
 *     ]
 *   }
 *
 * Content notes:
 *  - Sets/reps are starting points — users progress by adding weight or reps.
 *  - Rest is a floor; advanced lifters often rest longer.
 *  - No isolation before compounds; compound movements lead each day.
 *  - Every preset is self-consistent and finishable in the stated time.
 */

export const ROUTINE_PRESETS = [
  // ═══════════════════════════════════════════════════════════════════════
  // 1. Push / Pull / Legs — 6 days
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'ppl-6',
    name: 'Push / Pull / Legs',
    tagline: '6 days · Hypertrophy',
    description: 'The gold-standard hypertrophy split. Hits each muscle group twice a week with enough volume to grow and enough rest to recover.',
    level: 'Intermediate',
    daysPerWeek: 6,
    split: 'PPL',
    goal: 'Hypertrophy',
    durationMin: [60, 75],
    equipment: ['Barbell', 'Dumbbell', 'Cable', 'Machine'],
    accent: 'cyan',
    days: [
      {
        name: 'Push A',
        focus: 'Chest, Shoulders, Triceps',
        exercises: [
          { exerciseId: 'ch1',  sets: 4, repRange: '6-8',   restSec: 180 },
          { exerciseId: 'ch6',  sets: 3, repRange: '8-10',  restSec: 120 },
          { exerciseId: 's3',   sets: 3, repRange: '8-10',  restSec: 120 },
          { exerciseId: 's7',   sets: 4, repRange: '12-15', restSec: 60  },
          { exerciseId: 'a15',  sets: 3, repRange: '8-12',  restSec: 90  },
          { exerciseId: 'a12',  sets: 3, repRange: '10-12', restSec: 75  },
        ],
      },
      {
        name: 'Pull A',
        focus: 'Back, Biceps, Rear delts',
        exercises: [
          { exerciseId: 'b1',   sets: 4, repRange: '6-10',  restSec: 150 },
          { exerciseId: 'b9',   sets: 4, repRange: '6-8',   restSec: 180 },
          { exerciseId: 'b14',  sets: 3, repRange: '10-12', restSec: 90  },
          { exerciseId: 's14',  sets: 3, repRange: '12-15', restSec: 60  },
          { exerciseId: 'a1',   sets: 3, repRange: '8-10',  restSec: 90  },
          { exerciseId: 'a4',   sets: 3, repRange: '10-12', restSec: 75  },
        ],
      },
      {
        name: 'Legs A',
        focus: 'Quad-dominant',
        exercises: [
          { exerciseId: 'l1',   sets: 4, repRange: '5-8',   restSec: 210 },
          { exerciseId: 'l15',  sets: 3, repRange: '10-12', restSec: 150 },
          { exerciseId: 'l17',  sets: 3, repRange: '12-15', restSec: 75  },
          { exerciseId: 'l22',  sets: 3, repRange: '8-10',  restSec: 120 },
          { exerciseId: 'l33',  sets: 4, repRange: '10-15', restSec: 60  },
        ],
      },
      {
        name: 'Push B',
        focus: 'Chest, Shoulders, Triceps',
        exercises: [
          { exerciseId: 's1',   sets: 4, repRange: '6-8',   restSec: 180 },
          { exerciseId: 'ch2',  sets: 3, repRange: '8-10',  restSec: 120 },
          { exerciseId: 'ch12', sets: 3, repRange: '10-12', restSec: 75  },
          { exerciseId: 's8',   sets: 4, repRange: '12-15', restSec: 60  },
          { exerciseId: 'a16',  sets: 3, repRange: '10-12', restSec: 90  },
          { exerciseId: 'a14',  sets: 3, repRange: '10-12', restSec: 75  },
        ],
      },
      {
        name: 'Pull B',
        focus: 'Back, Biceps, Rear delts',
        exercises: [
          { exerciseId: 'l20',  sets: 4, repRange: '5-6',   restSec: 210 },
          { exerciseId: 'b5',   sets: 3, repRange: '8-12',  restSec: 120 },
          { exerciseId: 'b23',  sets: 3, repRange: '8-10',  restSec: 120 },
          { exerciseId: 's13',  sets: 3, repRange: '12-15', restSec: 60  },
          { exerciseId: 'a5',   sets: 3, repRange: '10-12', restSec: 90  },
          { exerciseId: 'a34',  sets: 3, repRange: '10-12', restSec: 75  },
        ],
      },
      {
        name: 'Legs B',
        focus: 'Hip / hamstring-dominant',
        exercises: [
          { exerciseId: 'l22',  sets: 4, repRange: '6-8',   restSec: 180 },
          { exerciseId: 'g1',   sets: 4, repRange: '8-10',  restSec: 120 },
          { exerciseId: 'l7',   sets: 3, repRange: '10-12', restSec: 120 },
          { exerciseId: 'l29',  sets: 3, repRange: '10-12', restSec: 75  },
          { exerciseId: 'l34',  sets: 4, repRange: '12-15', restSec: 60  },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // 2. Push / Pull / Legs — 3 days (beginner)
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'ppl-3',
    name: 'Push / Pull / Legs — Starter',
    tagline: '3 days · Learn the basics',
    description: 'Same structure as the 6-day PPL but once per week each. Ideal for beginners building consistency and technique before adding volume.',
    level: 'Beginner',
    daysPerWeek: 3,
    split: 'PPL',
    goal: 'General fitness',
    durationMin: [45, 60],
    equipment: ['Barbell', 'Dumbbell', 'Machine'],
    accent: 'cyan',
    days: [
      {
        name: 'Push',
        focus: 'Chest, Shoulders, Triceps',
        exercises: [
          { exerciseId: 'ch15', sets: 3, repRange: '8-10',  restSec: 150 },
          { exerciseId: 's3',   sets: 3, repRange: '10-12', restSec: 120 },
          { exerciseId: 's7',   sets: 3, repRange: '12-15', restSec: 60  },
          { exerciseId: 'a12',  sets: 3, repRange: '10-12', restSec: 75  },
        ],
      },
      {
        name: 'Pull',
        focus: 'Back, Biceps',
        exercises: [
          { exerciseId: 'b5',   sets: 3, repRange: '8-12',  restSec: 120 },
          { exerciseId: 'b14',  sets: 3, repRange: '10-12', restSec: 90  },
          { exerciseId: 's14',  sets: 3, repRange: '12-15', restSec: 60  },
          { exerciseId: 'a2',   sets: 3, repRange: '10-12', restSec: 75  },
        ],
      },
      {
        name: 'Legs',
        focus: 'Full lower body',
        exercises: [
          { exerciseId: 'l15',  sets: 3, repRange: '10-12', restSec: 150 },
          { exerciseId: 'l22',  sets: 3, repRange: '8-10',  restSec: 120 },
          { exerciseId: 'l17',  sets: 3, repRange: '12-15', restSec: 75  },
          { exerciseId: 'l29',  sets: 3, repRange: '10-12', restSec: 75  },
          { exerciseId: 'l33',  sets: 3, repRange: '12-15', restSec: 60  },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // 3. Upper / Lower — 4 days
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'upper-lower-4',
    name: 'Upper / Lower',
    tagline: '4 days · Balanced',
    description: 'Two upper + two lower body days. The sweet spot between frequency and recovery for most intermediate lifters.',
    level: 'Intermediate',
    daysPerWeek: 4,
    split: 'Upper/Lower',
    goal: 'Hypertrophy',
    durationMin: [60, 75],
    equipment: ['Barbell', 'Dumbbell', 'Cable', 'Machine'],
    accent: 'violet',
    days: [
      {
        name: 'Upper A',
        focus: 'Chest-focused',
        exercises: [
          { exerciseId: 'ch1',  sets: 4, repRange: '5-8',   restSec: 180 },
          { exerciseId: 'b9',   sets: 4, repRange: '6-8',   restSec: 180 },
          { exerciseId: 'ch6',  sets: 3, repRange: '8-10',  restSec: 120 },
          { exerciseId: 'b5',   sets: 3, repRange: '8-12',  restSec: 120 },
          { exerciseId: 's7',   sets: 3, repRange: '12-15', restSec: 60  },
          { exerciseId: 'a12',  sets: 3, repRange: '10-12', restSec: 75  },
          { exerciseId: 'a2',   sets: 3, repRange: '10-12', restSec: 75  },
        ],
      },
      {
        name: 'Lower A',
        focus: 'Quad-focused',
        exercises: [
          { exerciseId: 'l1',   sets: 4, repRange: '5-8',   restSec: 210 },
          { exerciseId: 'l15',  sets: 3, repRange: '10-12', restSec: 150 },
          { exerciseId: 'l22',  sets: 3, repRange: '8-10',  restSec: 120 },
          { exerciseId: 'l17',  sets: 3, repRange: '12-15', restSec: 75  },
          { exerciseId: 'l33',  sets: 4, repRange: '10-15', restSec: 60  },
        ],
      },
      {
        name: 'Upper B',
        focus: 'Back-focused',
        exercises: [
          { exerciseId: 's1',   sets: 4, repRange: '5-8',   restSec: 180 },
          { exerciseId: 'b1',   sets: 4, repRange: '6-10',  restSec: 150 },
          { exerciseId: 'ch12', sets: 3, repRange: '10-12', restSec: 75  },
          { exerciseId: 'b23',  sets: 3, repRange: '8-10',  restSec: 120 },
          { exerciseId: 's13',  sets: 3, repRange: '12-15', restSec: 60  },
          { exerciseId: 'a4',   sets: 3, repRange: '10-12', restSec: 75  },
          { exerciseId: 'a14',  sets: 3, repRange: '10-12', restSec: 75  },
        ],
      },
      {
        name: 'Lower B',
        focus: 'Hip-focused',
        exercises: [
          { exerciseId: 'l20',  sets: 4, repRange: '3-5',   restSec: 210 },
          { exerciseId: 'g1',   sets: 4, repRange: '8-10',  restSec: 120 },
          { exerciseId: 'l7',   sets: 3, repRange: '10-12', restSec: 150 },
          { exerciseId: 'l29',  sets: 3, repRange: '10-12', restSec: 75  },
          { exerciseId: 'l34',  sets: 4, repRange: '12-15', restSec: 60  },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // 4. Full body — 3 days
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'full-body-3',
    name: 'Full Body',
    tagline: '3 days · Get started',
    description: 'Three full-body sessions a week. Best starter routine — high frequency per lift, short enough to stay consistent.',
    level: 'Beginner',
    daysPerWeek: 3,
    split: 'Full body',
    goal: 'General fitness',
    durationMin: [45, 60],
    equipment: ['Barbell', 'Dumbbell', 'Machine'],
    accent: 'gold',
    days: [
      {
        name: 'Day A',
        focus: 'Squat focus',
        exercises: [
          { exerciseId: 'l1',   sets: 3, repRange: '5-8',   restSec: 180 },
          { exerciseId: 'ch1',  sets: 3, repRange: '6-8',   restSec: 180 },
          { exerciseId: 'b5',   sets: 3, repRange: '8-12',  restSec: 120 },
          { exerciseId: 's7',   sets: 3, repRange: '12-15', restSec: 60  },
          { exerciseId: 'c1',   sets: 3, repRange: '30-60s',restSec: 60  },
        ],
      },
      {
        name: 'Day B',
        focus: 'Hinge focus',
        exercises: [
          { exerciseId: 'l20',  sets: 3, repRange: '5-6',   restSec: 210 },
          { exerciseId: 's3',   sets: 3, repRange: '8-10',  restSec: 120 },
          { exerciseId: 'b9',   sets: 3, repRange: '6-8',   restSec: 150 },
          { exerciseId: 'a2',   sets: 3, repRange: '10-12', restSec: 75  },
          { exerciseId: 'c3',   sets: 3, repRange: '8-12',  restSec: 75  },
        ],
      },
      {
        name: 'Day C',
        focus: 'Volume day',
        exercises: [
          { exerciseId: 'l15',  sets: 3, repRange: '10-12', restSec: 120 },
          { exerciseId: 'ch15', sets: 3, repRange: '8-10',  restSec: 120 },
          { exerciseId: 'b14',  sets: 3, repRange: '10-12', restSec: 90  },
          { exerciseId: 'a12',  sets: 3, repRange: '10-12', restSec: 75  },
          { exerciseId: 'l33',  sets: 3, repRange: '12-15', restSec: 60  },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // 5. Bro split — 5 days
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'bro-split-5',
    name: 'Classic Bro Split',
    tagline: '5 days · One muscle per day',
    description: 'Old-school bodybuilding split — one body part per day, high volume per session. Not optimal for most, but loved for the feel and mind-muscle connection.',
    level: 'Intermediate',
    daysPerWeek: 5,
    split: 'Bro split',
    goal: 'Hypertrophy',
    durationMin: [60, 75],
    equipment: ['Barbell', 'Dumbbell', 'Cable', 'Machine'],
    accent: 'violet',
    days: [
      {
        name: 'Chest',
        focus: 'Chest + Triceps warmup',
        exercises: [
          { exerciseId: 'ch1',  sets: 4, repRange: '6-8',   restSec: 180 },
          { exerciseId: 'ch6',  sets: 3, repRange: '8-10',  restSec: 120 },
          { exerciseId: 'ch21', sets: 3, repRange: '10-12', restSec: 90  },
          { exerciseId: 'ch12', sets: 3, repRange: '12-15', restSec: 75  },
          { exerciseId: 'ch20', sets: 3, repRange: '8-12',  restSec: 90  },
        ],
      },
      {
        name: 'Back',
        focus: 'Width + thickness',
        exercises: [
          { exerciseId: 'b1',   sets: 4, repRange: '6-10',  restSec: 150 },
          { exerciseId: 'b9',   sets: 4, repRange: '6-8',   restSec: 180 },
          { exerciseId: 'b23',  sets: 3, repRange: '8-10',  restSec: 120 },
          { exerciseId: 'b14',  sets: 3, repRange: '10-12', restSec: 90  },
          { exerciseId: 'b20',  sets: 3, repRange: '12-15', restSec: 75  },
        ],
      },
      {
        name: 'Legs',
        focus: 'Full lower',
        exercises: [
          { exerciseId: 'l1',   sets: 4, repRange: '5-8',   restSec: 210 },
          { exerciseId: 'l15',  sets: 4, repRange: '10-12', restSec: 150 },
          { exerciseId: 'l22',  sets: 3, repRange: '8-10',  restSec: 120 },
          { exerciseId: 'l17',  sets: 3, repRange: '12-15', restSec: 75  },
          { exerciseId: 'l29',  sets: 3, repRange: '10-12', restSec: 75  },
          { exerciseId: 'l33',  sets: 4, repRange: '10-15', restSec: 60  },
        ],
      },
      {
        name: 'Shoulders',
        focus: 'Delts + traps',
        exercises: [
          { exerciseId: 's1',   sets: 4, repRange: '6-8',   restSec: 180 },
          { exerciseId: 's3',   sets: 3, repRange: '8-10',  restSec: 120 },
          { exerciseId: 's7',   sets: 4, repRange: '12-15', restSec: 60  },
          { exerciseId: 's13',  sets: 3, repRange: '12-15', restSec: 60  },
          { exerciseId: 's14',  sets: 3, repRange: '12-15', restSec: 60  },
        ],
      },
      {
        name: 'Arms',
        focus: 'Biceps + Triceps',
        exercises: [
          { exerciseId: 'a1',   sets: 4, repRange: '8-10',  restSec: 90  },
          { exerciseId: 'a15',  sets: 4, repRange: '8-10',  restSec: 90  },
          { exerciseId: 'a5',   sets: 3, repRange: '10-12', restSec: 75  },
          { exerciseId: 'a14',  sets: 3, repRange: '10-12', restSec: 75  },
          { exerciseId: 'a4',   sets: 3, repRange: '10-12', restSec: 75  },
          { exerciseId: 'a12',  sets: 3, repRange: '12-15', restSec: 60  },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // 6. Low-volume A/B/C/D/E — 5 days (lumbar-safe)
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'low-volume-5',
    name: 'Low Volume A/B/C/D/E',
    tagline: '5 days · Lumbar-safe',
    description: 'Machine + Smith-heavy split for people who want muscle growth without axial loading. Every movement can be done with a sensitive lower back.',
    level: 'Intermediate',
    daysPerWeek: 5,
    split: 'A/B/C/D/E',
    goal: 'Hypertrophy',
    durationMin: [45, 60],
    equipment: ['Smith', 'Machine', 'Cable', 'Dumbbell'],
    accent: 'gold',
    days: [
      {
        name: 'A — Chest / Triceps / Shoulders',
        focus: 'Push',
        exercises: [
          { exerciseId: 'ch15', sets: 3, repRange: '6-8',   restSec: 180 },
          { exerciseId: 'ch21', sets: 3, repRange: '8-10',  restSec: 120 },
          { exerciseId: 'ch12', sets: 2, repRange: '10-12', restSec: 90  },
          { exerciseId: 'ch11', sets: 2, repRange: '10-12', restSec: 90  },
          { exerciseId: 'a16',  sets: 3, repRange: '8-10',  restSec: 90  },
          { exerciseId: 'a12',  sets: 2, repRange: '10-12', restSec: 75  },
          { exerciseId: 's5',   sets: 3, repRange: '8-10',  restSec: 120 },
        ],
      },
      {
        name: 'B — Back / Biceps / Rear delts',
        focus: 'Pull',
        exercises: [
          { exerciseId: 'b6',   sets: 3, repRange: '6-8',   restSec: 150 },
          { exerciseId: 'b23',  sets: 3, repRange: '6-8',   restSec: 150 },
          { exerciseId: 'b19',  sets: 2, repRange: '8-10',  restSec: 120 },
          { exerciseId: 'b20',  sets: 2, repRange: '10-12', restSec: 75  },
          { exerciseId: 's13',  sets: 3, repRange: '10-12', restSec: 60  },
          { exerciseId: 'a2',   sets: 3, repRange: '6-8',   restSec: 90  },
          { exerciseId: 'a4',   sets: 2, repRange: '8-10',  restSec: 75  },
        ],
      },
      {
        name: 'C — Legs (quad focus)',
        focus: 'Quads',
        exercises: [
          { exerciseId: 'l6',   sets: 4, repRange: '6-8',   restSec: 180 },
          { exerciseId: 'l15',  sets: 3, repRange: '8-10',  restSec: 150 },
          { exerciseId: 'l17b', sets: 3, repRange: '10-12', restSec: 75,  note: 'per leg' },
          { exerciseId: 'l31',  sets: 2, repRange: '8-10',  restSec: 75,  note: 'per leg' },
          { exerciseId: 'l29',  sets: 2, repRange: '10-12', restSec: 75  },
          { exerciseId: 'l33',  sets: 4, repRange: '10-12', restSec: 60  },
        ],
      },
      {
        name: 'D — Shoulders / Biceps / Triceps',
        focus: 'Push + Arms',
        exercises: [
          { exerciseId: 's5',   sets: 3, repRange: '6-8',   restSec: 150 },
          { exerciseId: 's8',   sets: 3, repRange: '10-12', restSec: 60  },
          { exerciseId: 's17',  sets: 2, repRange: '12-15', restSec: 60,  note: 'per arm' },
          { exerciseId: 'a11',  sets: 2, repRange: '8-10',  restSec: 75  },
          { exerciseId: 'a6',   sets: 2, repRange: '8-10',  restSec: 75  },
          { exerciseId: 'a14',  sets: 2, repRange: '8-10',  restSec: 75  },
          { exerciseId: 'a21',  sets: 2, repRange: '10-12', restSec: 60  },
        ],
      },
      {
        name: 'E — Legs (hip focus)',
        focus: 'Hamstrings + Glutes',
        exercises: [
          { exerciseId: 'g2',   sets: 4, repRange: '5-8',   restSec: 180 },
          { exerciseId: 'l30',  sets: 3, repRange: '8-10',  restSec: 90  },
          { exerciseId: 'l31',  sets: 2, repRange: '8-10',  restSec: 75,  note: 'per leg' },
          { exerciseId: 'l29b', sets: 2, repRange: '10-12', restSec: 75,  note: 'per leg' },
          { exerciseId: 'l7',   sets: 2, repRange: '10-12', restSec: 120, note: 'feet forward' },
          { exerciseId: 'l34',  sets: 4, repRange: '12-15', restSec: 60  },
        ],
      },
    ],
  },
];

/** Find a preset by id. */
export function findPresetById(id) {
  if (!id) return null;
  return ROUTINE_PRESETS.find((p) => p.id === id) || null;
}

/** Total exercise count across all days — useful for summary cards. */
export function totalExerciseCount(preset) {
  if (!preset?.days) return 0;
  return preset.days.reduce((acc, d) => acc + (d.exercises?.length || 0), 0);
}

/** Total set count — proxy for session volume. */
export function totalSetCount(preset) {
  if (!preset?.days) return 0;
  return preset.days.reduce(
    (acc, d) => acc + (d.exercises || []).reduce((a2, e) => a2 + (e.sets || 0), 0),
    0,
  );
}
