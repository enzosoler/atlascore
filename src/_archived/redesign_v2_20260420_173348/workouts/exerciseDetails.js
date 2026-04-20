/**
 * Per-exercise form guides, cues, and classification metadata.
 *
 * Keyed by the same `id` used in DEMO_EXERCISES. Every entry is optional — when
 * an exercise has no entry we fall back to `deriveGenericDetails(ex)` which
 * generates honest placeholder content from the muscle + equipment fields.
 *
 * Content rules:
 *  - English only for instructions/tips. The app ships with English UI and
 *    English exercise names; keep the guide content consistent.
 *  - Never invent claims. Cues are standard form coaching, not personalized
 *    prescriptions.
 *  - Keep steps under 6 and tips under 4 — users skim on mobile.
 *
 * Schema:
 *   {
 *     instructions: string[]          // 3-5 step-by-step cues
 *     tips: string[]                  // 2-4 form tips / common mistakes
 *     primaryMuscles: string[]        // granular: "Pectoralis major (sternal)"
 *     secondaryMuscles: string[]      // granular
 *     category: 'Compound' | 'Isolation'
 *     mechanic: 'Push' | 'Pull' | 'Hinge' | 'Squat' | 'Carry' | 'Core' | 'Other'
 *     difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
 *   }
 */

export const EXERCISE_DETAILS = {
  // ═══ Chest ══════════════════════════════════════════════════════════════
  ch1: {
    instructions: [
      'Lie on the bench with eyes directly under the bar, feet flat on the floor.',
      'Grip slightly wider than shoulder-width, thumbs wrapped around the bar.',
      'Retract the shoulder blades and create a slight arch in the lower back.',
      'Lower the bar under control until it touches mid-chest, elbows ~45° from the torso.',
      'Press the bar up in a straight line until your elbows are extended (not locked).',
    ],
    tips: [
      'Keep your feet planted the whole set — no lifting off the floor.',
      'Elbows at 45° protect the shoulder; avoid the 90° flare.',
      'Inhale on the descent, exhale forcefully on the press.',
    ],
    primaryMuscles: ['Pectoralis major'],
    secondaryMuscles: ['Triceps', 'Anterior deltoid'],
    category: 'Compound',
    mechanic: 'Push',
    difficulty: 'Intermediate',
  },
  ch2: {
    instructions: [
      'Set the bench to 30–45°. Lie back with eyes under the bar.',
      'Grip slightly wider than shoulder-width, shoulder blades retracted.',
      'Lower the bar under control to the upper chest (clavicle line).',
      'Press the bar up in a straight line, keeping the shoulder blades pinned.',
    ],
    tips: [
      'A bench angle over 45° turns this into a shoulder press.',
      'Don\'t chase the bar with your shoulders — stay pinned, chest proud.',
    ],
    primaryMuscles: ['Pectoralis major (clavicular head)'],
    secondaryMuscles: ['Anterior deltoid', 'Triceps'],
    category: 'Compound',
    mechanic: 'Push',
    difficulty: 'Intermediate',
  },
  ch5: {
    instructions: [
      'Sit on a flat bench with a dumbbell resting on each thigh.',
      'Kick each dumbbell up and lie back; stop them at chest height, elbows ~45°.',
      'Press the dumbbells up and slightly inward until they almost touch.',
      'Lower under control until you feel a stretch in the chest.',
    ],
    tips: [
      'Greater range of motion than a barbell — use it.',
      'Don\'t lock the elbows at the top; keep tension.',
    ],
    primaryMuscles: ['Pectoralis major'],
    secondaryMuscles: ['Triceps', 'Anterior deltoid'],
    category: 'Compound',
    mechanic: 'Push',
    difficulty: 'Beginner',
  },
  ch15: {
    instructions: [
      'Lie under the Smith bar, bar aligned with mid-chest.',
      'Plant feet slightly in front of the knees for a mild declining chest angle.',
      'Twist the wrists to unrack the bar.',
      'Lower under control to the chest with elbows ~45° from the torso.',
      'Press straight up and only re-rack at the end of the set.',
    ],
    tips: [
      'The Smith fixes the bar path — great for pushing weight without worrying about stabilizers.',
      'Feet forward = more chest. Feet under you = more shoulder/triceps.',
    ],
    primaryMuscles: ['Pectoralis major'],
    secondaryMuscles: ['Triceps', 'Anterior deltoid'],
    category: 'Compound',
    mechanic: 'Push',
    difficulty: 'Beginner',
  },
  ch17: {
    instructions: [
      'Hands on the floor slightly wider than shoulder-width, fingers forward.',
      'Body forms a straight line from head to heels, core braced.',
      'Lower under control until your chest nearly touches the floor, elbows ~45°.',
      'Press back up without locking out the elbows.',
    ],
    tips: [
      'If your hips sag, the core is giving up — shorten the range or drop to knees.',
      'Head neutral, eyes on the floor ~30 cm in front.',
    ],
    primaryMuscles: ['Pectoralis major'],
    secondaryMuscles: ['Triceps', 'Core'],
    category: 'Compound',
    mechanic: 'Push',
    difficulty: 'Beginner',
  },
  ch12: {
    instructions: [
      'Set the pulleys to shoulder height with a D-handle on each side.',
      'Split stance, slight forward torso lean, elbows semi-flexed and locked in that angle.',
      'Sweep the handles in an arc in front of the chest, meeting at the midline.',
      'Return under control without losing the stretch at the bottom.',
    ],
    tips: [
      'Fix the elbow angle — don\'t turn this into a cable press.',
      'Squeeze the chest for 1 second at the contraction.',
    ],
    primaryMuscles: ['Pectoralis major'],
    secondaryMuscles: ['Anterior deltoid'],
    category: 'Isolation',
    mechanic: 'Push',
    difficulty: 'Beginner',
  },
  ch21: {
    instructions: [
      'Set the machine bench to 30–45°.',
      'Back against the pad, feet planted, grip the machine handles.',
      'Bring the handles together in front of the upper chest in a smooth arc.',
      'Return under control, letting the upper-chest stretch.',
    ],
    tips: [
      'If the seat is adjustable, set it so the handles sit at chest height.',
      'Drive the movement from the chest — the elbows just travel along.',
    ],
    primaryMuscles: ['Pectoralis major (clavicular head)'],
    secondaryMuscles: ['Anterior deltoid'],
    category: 'Isolation',
    mechanic: 'Push',
    difficulty: 'Beginner',
  },

  // ═══ Back ═══════════════════════════════════════════════════════════════
  b1: {
    instructions: [
      'Pronated grip slightly wider than shoulders.',
      'Start with arms fully extended, shoulders active (not shrugged).',
      'Drive the chest to the bar, initiating from the shoulder blades.',
      'At the top, chin clears the bar; chest proud.',
      'Lower under control to a full stretch.',
    ],
    tips: [
      'Think "pull the elbows down", not "pull the body up".',
      'If you can\'t control the descent, use a band or the assisted-pullup machine.',
    ],
    primaryMuscles: ['Latissimus dorsi'],
    secondaryMuscles: ['Biceps', 'Rhomboids', 'Core'],
    category: 'Compound',
    mechanic: 'Pull',
    difficulty: 'Intermediate',
  },
  b5: {
    instructions: [
      'Sit with knees locked under the pad, pronated wide grip on the bar.',
      'Chest up, retract the shoulder blades before the pull starts.',
      'Pull the bar to the upper chest; elbows travel back and down.',
      'Return under control without losing the retraction at the top.',
    ],
    tips: [
      'Torso lean 10–15° max — past that it becomes a row.',
      'Think "tuck the elbows into the back pockets".',
    ],
    primaryMuscles: ['Latissimus dorsi'],
    secondaryMuscles: ['Biceps', 'Lower trapezius', 'Rhomboids'],
    category: 'Compound',
    mechanic: 'Pull',
    difficulty: 'Beginner',
  },
  b9: {
    instructions: [
      'Bar on the floor, pronated grip slightly wider than shoulders.',
      'Hips back, torso ~45° forward, spine neutral.',
      'Let the bar hang from extended arms; retract the shoulder blades.',
      'Row the bar to the navel / low sternum — elbows drive back.',
      'Control the descent to full arm extension.',
    ],
    tips: [
      'Keep the lower back neutral — if it rounds, drop the weight.',
      'No hip drive; torso stays stable throughout.',
    ],
    primaryMuscles: ['Latissimus dorsi', 'Rhomboids'],
    secondaryMuscles: ['Biceps', 'Middle trapezius', 'Erectors'],
    category: 'Compound',
    mechanic: 'Pull',
    difficulty: 'Intermediate',
  },
  b14: {
    instructions: [
      'Sit on the machine, knees slightly bent, feet on the platform.',
      'Neutral grip on the triangle attachment, chest proud.',
      'Row the handle to the navel; elbows tuck to the sides of the torso.',
      'Control the return until the shoulder blades stretch forward.',
    ],
    tips: [
      'Keep the torso stable — no rocking.',
      'Retract the shoulder blades at the end of each rep.',
    ],
    primaryMuscles: ['Latissimus dorsi', 'Rhomboids'],
    secondaryMuscles: ['Biceps', 'Middle trapezius'],
    category: 'Compound',
    mechanic: 'Pull',
    difficulty: 'Beginner',
  },
  b23: {
    instructions: [
      'Lie chest-down on the inclined T-bar machine pad.',
      'Grab the handles with a neutral grip, arms fully extended.',
      'Row the elbows back until the weight touches the chest.',
      'Lower under control to a full lat stretch.',
    ],
    tips: [
      'The pad takes the lower back out of the equation — zero spinal load.',
      'Elbows close to the torso = more lats; elbows flared = more mid-back.',
    ],
    primaryMuscles: ['Latissimus dorsi', 'Rhomboids'],
    secondaryMuscles: ['Biceps', 'Middle trapezius'],
    category: 'Compound',
    mechanic: 'Pull',
    difficulty: 'Beginner',
  },
  b20: {
    instructions: [
      'Attach a rope or straight bar to a high pulley.',
      'Step back, arms extended overhead, elbows slightly bent (locked in that angle).',
      'Sweep the bar down in an arc to the thighs, squeezing the lats.',
      'Return under control to a full lat stretch.',
    ],
    tips: [
      'Elbows stay slightly bent the whole time — don\'t lock them out.',
      'Movement comes from the shoulder, not the elbow.',
    ],
    primaryMuscles: ['Latissimus dorsi'],
    secondaryMuscles: ['Long head of triceps', 'Core'],
    category: 'Isolation',
    mechanic: 'Pull',
    difficulty: 'Intermediate',
  },

  // ═══ Shoulders ══════════════════════════════════════════════════════════
  s1: {
    instructions: [
      'Bar at upper-chest height, grip slightly wider than shoulders.',
      'Feet hip-width, glutes and core braced.',
      'Press the bar overhead, tucking the chin out of the way.',
      'At the top, head returns to neutral under the bar.',
      'Lower under control to the starting position.',
    ],
    tips: [
      'Glutes and core braced — prevents lumbar hyperextension.',
      'No leg drive — if you need it, that\'s a Push Press.',
    ],
    primaryMuscles: ['Deltoid (anterior + lateral)'],
    secondaryMuscles: ['Triceps', 'Upper trapezius', 'Core'],
    category: 'Compound',
    mechanic: 'Push',
    difficulty: 'Intermediate',
  },
  s3: {
    instructions: [
      'Sit with the bench at 90°, dumbbells resting on the thighs.',
      'Kick the dumbbells up to shoulder height, palms facing forward.',
      'Press the dumbbells up until they nearly touch, elbows not locked.',
      'Lower under control until they pause at shoulder height.',
    ],
    tips: [
      'Keep the hips and back planted on the bench.',
      'Path is a slight arc inward — not pure vertical.',
    ],
    primaryMuscles: ['Deltoid (anterior + lateral)'],
    secondaryMuscles: ['Triceps', 'Upper trapezius'],
    category: 'Compound',
    mechanic: 'Push',
    difficulty: 'Beginner',
  },
  s5: {
    instructions: [
      'Incline bench to 80–85° under the Smith bar.',
      'Grip slightly wider than shoulders, bar at upper-chest height.',
      'Press up until the elbows are nearly extended, chest proud.',
      'Lower under control to the collarbone.',
    ],
    tips: [
      'A slight bench incline (not 90°) protects the shoulder.',
      'The Smith fixes the path — great for driving carry-over strength.',
    ],
    primaryMuscles: ['Deltoid (anterior + lateral)'],
    secondaryMuscles: ['Triceps'],
    category: 'Compound',
    mechanic: 'Push',
    difficulty: 'Beginner',
  },
  s7: {
    instructions: [
      'Stand tall, dumbbells at your sides, palms facing the torso.',
      'Elbows slightly bent and fixed.',
      'Raise the dumbbells out to shoulder height, pinky slightly leading.',
      'Lower under control — no swinging.',
    ],
    tips: [
      'Minimal body English — if you need it, drop the weight.',
      'A subtle thumb-up orientation protects the shoulder.',
    ],
    primaryMuscles: ['Lateral deltoid'],
    secondaryMuscles: ['Upper trapezius'],
    category: 'Isolation',
    mechanic: 'Other',
    difficulty: 'Beginner',
  },
  s8: {
    instructions: [
      'Low pulley with a D-handle. Stand side-on to the machine.',
      'Working arm crosses in front of the body to grab the opposite side\'s handle.',
      'Raise the arm in an arc to shoulder height, elbow slightly bent.',
      'Return under control with constant tension.',
    ],
    tips: [
      'Cable pulls from below = constant tension on the lateral delt.',
      'Minimal torso movement; zero momentum.',
    ],
    primaryMuscles: ['Lateral deltoid'],
    secondaryMuscles: [],
    category: 'Isolation',
    mechanic: 'Other',
    difficulty: 'Beginner',
  },
  s13: {
    instructions: [
      'Sit on the pec deck facing the pad.',
      'Grip the handles with a neutral grip, arms extended in front.',
      'Drive the arms out and back in an arc, squeezing the shoulder blades.',
      'Return under control without losing tension.',
    ],
    tips: [
      'Elbows slightly bent — don\'t lock them.',
      'Focus on pinching the shoulder blades, not swinging the arms.',
    ],
    primaryMuscles: ['Rear deltoid'],
    secondaryMuscles: ['Middle trapezius', 'Rhomboids'],
    category: 'Isolation',
    mechanic: 'Pull',
    difficulty: 'Beginner',
  },
  s14: {
    instructions: [
      'Rope on a high pulley, slightly above head height.',
      'Step back, grab the rope with a pronated grip.',
      'Pull the rope toward your face, separating the ends at the end.',
      'Keep the elbows high — at shoulder height or above.',
    ],
    tips: [
      'Elbows high = rear delt. Elbows low turns it into a row.',
      'Pinch the shoulder blades at the end of each rep.',
    ],
    primaryMuscles: ['Rear deltoid', 'External rotators'],
    secondaryMuscles: ['Middle trapezius'],
    category: 'Isolation',
    mechanic: 'Pull',
    difficulty: 'Beginner',
  },

  // ═══ Arms ═══════════════════════════════════════════════════════════════
  a1: {
    instructions: [
      'Stand with a supinated grip on the bar, shoulder-width apart.',
      'Elbows pinned to the torso, shoulders relaxed.',
      'Curl the bar to the chest by flexing the elbows.',
      'Lower under control to full extension.',
    ],
    tips: [
      'Fixed elbows — don\'t raise them forward.',
      'Minimal hip sway; drop weight if you need momentum.',
    ],
    primaryMuscles: ['Biceps brachii'],
    secondaryMuscles: ['Brachialis', 'Forearms'],
    category: 'Isolation',
    mechanic: 'Pull',
    difficulty: 'Beginner',
  },
  a2: {
    instructions: [
      'Stand with an EZ bar, supinated grip at shoulder-width.',
      'Elbows pinned to the torso.',
      'Curl the bar to the chest.',
      'Lower under control.',
    ],
    tips: [
      'The EZ bar reduces wrist stress compared to a straight bar.',
      'Same movement as a straight-bar curl; same biceps tension.',
    ],
    primaryMuscles: ['Biceps brachii'],
    secondaryMuscles: ['Brachialis', 'Forearms'],
    category: 'Isolation',
    mechanic: 'Pull',
    difficulty: 'Beginner',
  },
  a4: {
    instructions: [
      'Stand with a dumbbell in each hand, palms facing the torso (neutral).',
      'Elbows pinned to the sides.',
      'Curl the dumbbells up while keeping the neutral grip — thumbs point up.',
      'Lower under control.',
    ],
    tips: [
      'Targets the brachialis and brachioradialis more than pure biceps.',
      'Alternating or simultaneous both work — pick one per set.',
    ],
    primaryMuscles: ['Brachialis', 'Brachioradialis'],
    secondaryMuscles: ['Biceps brachii'],
    category: 'Isolation',
    mechanic: 'Pull',
    difficulty: 'Beginner',
  },
  a12: {
    instructions: [
      'Rope attachment on a high pulley.',
      'Elbows pinned to the torso, neutral grip.',
      'Extend the elbows by pushing down, separating the rope ends at the bottom.',
      'Return under control without letting the elbows drift forward.',
    ],
    tips: [
      'Elbows stay pinned — movement comes from the elbow only.',
      'Split the rope at the bottom for peak triceps contraction.',
    ],
    primaryMuscles: ['Triceps (all three heads)'],
    secondaryMuscles: [],
    category: 'Isolation',
    mechanic: 'Push',
    difficulty: 'Beginner',
  },
  a14: {
    instructions: [
      'Rope on a high pulley. Face away from the machine.',
      'Grab the rope, elbows pointing up, forearms behind the head.',
      'Extend the elbows overhead, separating the rope at the top.',
      'Lower under control, keeping the elbows high.',
    ],
    tips: [
      'Elbows stay pointed up the whole time — targets the long head of the triceps.',
      'Works standing or half-kneeling.',
    ],
    primaryMuscles: ['Triceps (long head)'],
    secondaryMuscles: [],
    category: 'Isolation',
    mechanic: 'Push',
    difficulty: 'Intermediate',
  },
  a16: {
    instructions: [
      'Sit holding one dumbbell between both hands by the inner plate.',
      'Bring the dumbbell behind the head, elbows pointing up.',
      'Extend the elbows to press the dumbbell overhead.',
      'Lower under control to a full triceps stretch.',
    ],
    tips: [
      'Fixed elbows pointing up — don\'t flare them out.',
      'The long head is most active when the arm is overhead.',
    ],
    primaryMuscles: ['Triceps (long head)'],
    secondaryMuscles: [],
    category: 'Isolation',
    mechanic: 'Push',
    difficulty: 'Beginner',
  },

  // ═══ Legs ═══════════════════════════════════════════════════════════════
  l1: {
    instructions: [
      'Bar on the upper traps (high-bar), grip slightly wider than shoulders.',
      'Feet hip-width, toes slightly flared.',
      'Take a big breath, brace the core.',
      'Sit between the heels — knees track the toes. Descend to parallel or below.',
      'Drive through the whole foot to stand back up without losing the brace.',
    ],
    tips: [
      'Knees travel in the direction of the toes — no inward collapse.',
      'Chest up the whole time.',
      'If the lower back rounds at the bottom, work mobility and stop above that point.',
    ],
    primaryMuscles: ['Quadriceps'],
    secondaryMuscles: ['Glutes', 'Adductors', 'Core', 'Erectors'],
    category: 'Compound',
    mechanic: 'Squat',
    difficulty: 'Advanced',
  },
  l6: {
    instructions: [
      'Set the shoulder pads of the pendulum machine to your height.',
      'Feet hip-width on the platform, unrack the machine.',
      'Lower under control to parallel or slightly below.',
      'Drive the platform back up without locking the knees.',
    ],
    tips: [
      'The pendulum fixes the path — excellent alternative when back squats bother your lower back.',
      'Feet lower on the platform = more quads. Higher = more glutes.',
    ],
    primaryMuscles: ['Quadriceps'],
    secondaryMuscles: ['Glutes', 'Adductors'],
    category: 'Compound',
    mechanic: 'Squat',
    difficulty: 'Beginner',
  },
  l7: {
    instructions: [
      'Shoulders under the pads, back flat against the support.',
      'Feet hip-width on the platform, unrack.',
      'Lower under control to parallel or slightly below.',
      'Press the platform back up, keeping the back pinned.',
    ],
    tips: [
      'Feet higher on the platform = more glutes/hamstrings. Lower = more quads.',
      'Zero axial load — safe for people with a sensitive lower back.',
    ],
    primaryMuscles: ['Quadriceps'],
    secondaryMuscles: ['Glutes'],
    category: 'Compound',
    mechanic: 'Squat',
    difficulty: 'Beginner',
  },
  l15: {
    instructions: [
      'Sit on the machine, back against the pad.',
      'Feet hip-width on the platform, toes slightly flared.',
      'Unrack, lower under control until the knees reach ~90° or deeper.',
      'Press back up without locking the knees.',
    ],
    tips: [
      'Hips stay glued to the seat — if they lift, your range is too big for your mobility.',
      'Feet lower on the platform emphasize quads; higher, glutes.',
    ],
    primaryMuscles: ['Quadriceps'],
    secondaryMuscles: ['Glutes', 'Adductors'],
    category: 'Compound',
    mechanic: 'Squat',
    difficulty: 'Beginner',
  },
  l17: {
    instructions: [
      'Sit on the extension machine, back flat against the pad.',
      'Adjust the roller to sit just above the ankle.',
      'Extend both legs under control to full extension.',
      'Lower under control without letting the weight stack slam.',
    ],
    tips: [
      'Hold 1 second at the top for a peak contraction.',
      'A free-falling negative kills hypertrophy — control the eccentric.',
    ],
    primaryMuscles: ['Quadriceps'],
    secondaryMuscles: [],
    category: 'Isolation',
    mechanic: 'Other',
    difficulty: 'Beginner',
  },
  l20: {
    instructions: [
      'Bar over the mid-foot, feet hip-width.',
      'Hips back, grip the bar just outside the knees.',
      'Chest up, spine neutral, pull the slack out of the bar before starting.',
      'Drive the floor away with the feet; the bar slides up shins and thighs.',
      'Lock out with full hip extension, shoulders back. Reverse the sequence to lower.',
    ],
    tips: [
      'Spine always neutral — if it rounds, drop the weight.',
      'The bar travels in a straight vertical line — always in contact with the body.',
      'Hip hinge first; don\'t try to back-extend the weight up.',
    ],
    primaryMuscles: ['Hamstrings', 'Glutes', 'Erectors'],
    secondaryMuscles: ['Trapezius', 'Core', 'Forearms'],
    category: 'Compound',
    mechanic: 'Hinge',
    difficulty: 'Advanced',
  },
  l22: {
    instructions: [
      'Bar over the thighs, knees slightly bent and locked in that angle.',
      'Hips back, bar slides down the thighs.',
      'Lower until you feel a hamstring stretch (usually near mid-shin).',
      'Drive the hips forward to stand; glutes contract at the top.',
    ],
    tips: [
      'The knees don\'t move during the rep — only the hips hinge.',
      'Spine neutral — if the lower back rounds, you went too deep or too heavy.',
    ],
    primaryMuscles: ['Hamstrings', 'Glutes'],
    secondaryMuscles: ['Erectors', 'Core'],
    category: 'Compound',
    mechanic: 'Hinge',
    difficulty: 'Intermediate',
  },
  l29: {
    instructions: [
      'Lie face-down on the leg curl machine, roller just above the ankle.',
      'Grip the handles, brace the core.',
      'Curl the heels toward the glutes.',
      'Lower under control without fully extending.',
    ],
    tips: [
      'Hips stay glued to the pad — if they lift, you\'re using too much weight.',
      'Hold for a moment at the peak contraction.',
    ],
    primaryMuscles: ['Hamstrings'],
    secondaryMuscles: ['Gastrocnemius'],
    category: 'Isolation',
    mechanic: 'Other',
    difficulty: 'Beginner',
  },
  l33: {
    instructions: [
      'Shoulders under the pads, balls of the feet on the edge of the platform.',
      'Drop the heels as far down as mobility allows for a full calf stretch.',
      'Press up onto the toes, squeezing the calves at the top.',
      'Lower under control.',
    ],
    tips: [
      'Full range of motion — deep stretch at the bottom, full contraction at the top.',
      'A 1-second hold at the top maximizes the stimulus.',
    ],
    primaryMuscles: ['Gastrocnemius'],
    secondaryMuscles: ['Soleus'],
    category: 'Isolation',
    mechanic: 'Other',
    difficulty: 'Beginner',
  },

  // ═══ Glutes ═════════════════════════════════════════════════════════════
  g1: {
    instructions: [
      'Sit on the floor with the upper back against a bench, below the shoulder blades.',
      'Bar (with a pad) over the hip, knees bent, feet planted hip-width.',
      'Drive the hips up, squeezing the glutes; knees end at ~90°.',
      'At the top the body forms a straight line from shoulder to knee.',
      'Lower under control without the weight touching the floor.',
    ],
    tips: [
      'Tuck the chin at the top — avoids cervical hyperextension.',
      'Foot distance: shins should be vertical at lockout.',
    ],
    primaryMuscles: ['Gluteus maximus'],
    secondaryMuscles: ['Hamstrings', 'Core'],
    category: 'Compound',
    mechanic: 'Hinge',
    difficulty: 'Intermediate',
  },

  // ═══ Core ═══════════════════════════════════════════════════════════════
  c1: {
    instructions: [
      'Forearms on the floor, elbows directly under the shoulders.',
      'Body forms a straight line from head to heels.',
      'Core braced, glutes tight, hips neutral.',
      'Hold for the prescribed time, breathing normally.',
    ],
    tips: [
      'If the hips sag, you\'ve held too long — end the set and do more short sets.',
      'Squeezing the glutes takes load off the lower back.',
    ],
    primaryMuscles: ['Core (rectus abdominis + transversus)'],
    secondaryMuscles: ['Glutes', 'Deltoids'],
    category: 'Isolation',
    mechanic: 'Core',
    difficulty: 'Beginner',
  },
  c5: {
    instructions: [
      'Kneel facing the high pulley with a rope attachment.',
      'Rope beside the head, elbows glued to the ears.',
      'Flex the spine to bring the elbows toward the thighs.',
      'Return under control without losing the contraction.',
    ],
    tips: [
      'Movement comes from the spine, not the hips.',
      'Elbows stuck to the head — if they drift up, the weight is too heavy.',
    ],
    primaryMuscles: ['Rectus abdominis'],
    secondaryMuscles: ['Obliques'],
    category: 'Isolation',
    mechanic: 'Core',
    difficulty: 'Beginner',
  },
};

/**
 * Derive a generic details object from the exercise's base catalog data when
 * no hand-written entry exists. Keeps the detail screen useful for every
 * exercise without fabricating form cues.
 */
export function deriveGenericDetails(exercise) {
  if (!exercise) return null;
  const primary = exercise.muscles?.[0] || 'Other';
  const category = (exercise.muscles?.length || 0) > 1 ? 'Compound' : 'Isolation';

  // Rough mechanic inference from name — kept conservative.
  const n = (exercise.name || '').toLowerCase();
  let mechanic = 'Other';
  if (/press|bench|push|dip|fly/.test(n))                mechanic = 'Push';
  else if (/row|pull|curl|pulldown|face pull/.test(n))   mechanic = 'Pull';
  else if (/deadlift|rdl|good morning|hinge|stiff/.test(n)) mechanic = 'Hinge';
  else if (/squat|lunge|leg press|step.?up/.test(n))     mechanic = 'Squat';
  else if (/plank|crunch|ab |sit.?up|hold/.test(n))      mechanic = 'Core';
  else if (/carry|walk|run/.test(n))                     mechanic = 'Carry';

  return {
    instructions: null, // honest — no fabricated cues
    tips: null,
    primaryMuscles: [primary],
    secondaryMuscles: (exercise.muscles || []).slice(1),
    category,
    mechanic,
    difficulty: null, // honest — we don't know without coaching context
  };
}

/** Lookup with fallback — always returns a usable details object. */
export function getExerciseDetails(exercise) {
  if (!exercise) return null;
  const explicit = EXERCISE_DETAILS[exercise.id];
  const generic = deriveGenericDetails(exercise);
  // Merge explicit on top of generic — explicit wins, missing fields fill in.
  return { ...generic, ...(explicit || {}) };
}
