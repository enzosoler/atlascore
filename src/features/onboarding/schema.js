/**
 * Atlas.Core — Onboarding Schema
 * 28-screen flow. All copy is hardcoded English (i18n later).
 */

const screens = [
  // ─── ACT 1 — HOOK ──────────────────────────────────────────────
  {
    id: 'splash',
    act: 1,
    type: 'splash',
    autoAdvanceMs: 2500,
  },
  {
    id: 'welcome-hook',
    act: 1,
    type: 'hook',
    title: 'The scale lies. Your mirror lies. Your last app had no idea what was working.',
    subtitle:
      'Atlas tracks what actually matters — and adjusts every week so you stop guessing.',
    cta: 'Show me how',
    secondaryCta: 'I already have an account',
  },

  // ─── ACT 2 — QUIZ ──────────────────────────────────────────────
  {
    id: 'q-primary-goal',
    act: 2,
    type: 'multi-select',
    fieldKey: 'health_goals',
    title: 'What are you actually trying to do?',
    subtitle: 'Pick everything that applies. We build around all of them.',
    options: [
      { value: 'fat_loss', emoji: '🔥', label: 'Lose fat' },
      { value: 'muscle_gain', emoji: '💪', label: 'Build muscle' },
      { value: 'recomp', emoji: '🔄', label: 'Recomp — lose fat & gain muscle' },
      { value: 'energy_health', emoji: '⚡', label: 'More energy & better health markers' },
      { value: 'event_prep', emoji: '🎯', label: 'Prep for a specific event or date' },
    ],
    minSelections: 1,
    maxSelections: 3,
    showInProgress: true,
  },
  {
    id: 'q-target-weight',
    act: 2,
    type: 'numeric-input',
    fieldKey: 'target_weight',
    title: 'What weight do you want to hit?',
    subtitle:
      "Rough number is fine. We'll refine this once we see your body composition data.",
    placeholder: '75',
    min: 30,
    max: 250,
    unit: 'kg',
    showInProgress: true,
  },
  {
    id: 'q-timeline',
    act: 2,
    type: 'single-select',
    fieldKey: 'timeline',
    title: 'When do you want to get there?',
    subtitle: "We'll tell you if this is realistic — no sugarcoating.",
    options: [
      { value: '6w', emoji: '⚡', label: '6 weeks — aggressive but doable' },
      { value: '3m', emoji: '📅', label: '3 months — the sweet spot for most people' },
      { value: '6m', emoji: '🏔️', label: '6 months — sustainable pace, big transformation' },
      { value: 'specific_date', emoji: '🎯', label: 'I have a specific date' },
    ],
    autoAdvance: true,
    showInProgress: true,
  },
  {
    id: 'q-body-stats',
    act: 2,
    type: 'body-stats',
    fieldKeys: ['sex', 'age', 'height_cm', 'current_weight'],
    title: 'The basics',
    subtitle:
      'We use these to calculate your metabolism. Nothing leaves your device without your permission.',
    showInProgress: true,
  },
  {
    id: 'q-activity-baseline',
    act: 2,
    type: 'single-select',
    fieldKey: 'activity_level',
    title: 'How active are you outside of training?',
    subtitle: 'Think about a typical weekday — not your best week.',
    options: [
      { value: 'barely', emoji: '🪑', label: 'Desk job, barely move' },
      { value: 'light', emoji: '🚶', label: 'Some walking, mostly sedentary' },
      { value: 'moderate', emoji: '🏃', label: 'On my feet a fair amount' },
      { value: 'high', emoji: '🔨', label: 'Physical job or very active lifestyle' },
      { value: 'athlete', emoji: '🏋️', label: 'Training 5+ times a week already' },
    ],
    autoAdvance: true,
    showInProgress: true,
  },

  // ─── INTERSTITIAL 1 ────────────────────────────────────────────
  {
    id: 'interstitial-social',
    act: 2,
    type: 'interstitial',
    title: "You're in good company.",
    subtitle:
      'Over 12,000 people have used Atlas to hit a goal they actually cared about.',
    emoji: '🤝',
  },

  {
    id: 'q-past-attempts',
    act: 2,
    type: 'multi-select',
    fieldKey: 'past_attempts',
    title: "What have you already tried that didn't stick?",
    subtitle: 'No judgment. We just need to know what to do differently.',
    options: [
      { value: 'calorie_tracker', emoji: '📱', label: 'Calorie tracking app' },
      { value: 'strict_diet', emoji: '🥗', label: 'Strict diet or meal plan' },
      { value: 'personal_trainer', emoji: '🏋️', label: 'Personal trainer' },
      { value: 'fitness_app', emoji: '📲', label: 'Another fitness app' },
      { value: 'eating_clean', emoji: '🥑', label: '"Eating clean" without tracking' },
      { value: 'first_attempt', emoji: '🆕', label: "This is my first real attempt" },
    ],
    minSelections: 1,
    maxSelections: 6,
    showInProgress: true,
  },
  {
    id: 'q-biggest-blocker',
    act: 2,
    type: 'single-select',
    fieldKey: 'biggest_blocker',
    title: 'What usually kills your momentum?',
    subtitle: 'Pick the one that hits hardest.',
    options: [
      { value: 'no_time', emoji: '⏰', label: "I don't have time to track everything" },
      { value: 'lose_motivation', emoji: '📉', label: 'I lose motivation after 2–3 weeks' },
      { value: 'weekends', emoji: '🍕', label: 'Weekends destroy my progress' },
      { value: 'dont_know_working', emoji: '❓', label: "I never know if what I'm doing is working" },
      { value: 'chaotic_schedule', emoji: '🌀', label: 'My schedule is too chaotic' },
      { value: 'plateau', emoji: '📊', label: 'I hit a plateau and quit' },
    ],
    autoAdvance: true,
    showInProgress: true,
  },
  {
    id: 'q-eating-patterns',
    act: 2,
    type: 'single-select',
    fieldKey: 'eating_pattern',
    title: 'How do you actually eat on a normal day?',
    subtitle: "Be honest — we're building around your life, not a textbook.",
    options: [
      { value: 'three_meals', emoji: '🍽️', label: '3 meals, pretty consistent' },
      { value: 'skipper', emoji: '⏭️', label: 'I skip meals — usually breakfast' },
      { value: 'grazer', emoji: '🍿', label: 'I graze all day, no real structure' },
      { value: 'evening_eater', emoji: '🌙', label: 'Small during the day, big at night' },
      { value: 'chaotic', emoji: '🎲', label: 'Completely different every day' },
    ],
    autoAdvance: true,
    showInProgress: true,
  },
  {
    id: 'q-training-prefs',
    act: 2,
    type: 'single-select',
    fieldKey: 'training_environment',
    title: 'Where do you train?',
    subtitle: 'This determines your exercise library.',
    options: [
      { value: 'full_gym', emoji: '🏢', label: 'Full gym with everything' },
      { value: 'home_barbell', emoji: '🏠', label: 'Home gym — barbell & rack' },
      { value: 'home_dumbbells', emoji: '🏠', label: 'Home — dumbbells only' },
      { value: 'bodyweight', emoji: '🤸', label: 'Bodyweight only' },
      { value: 'no_training', emoji: '🚫', label: "I'm not training right now" },
    ],
    autoAdvance: true,
    showInProgress: true,
  },

  // ─── INTERSTITIAL 2 ────────────────────────────────────────────
  {
    id: 'interstitial-stats',
    act: 2,
    type: 'interstitial',
    title: 'Over 12,000 people have built their plan here.',
    subtitle: 'The average Atlas user sees measurable change in 11 days.',
    emoji: '📈',
  },

  {
    id: 'q-current-body',
    act: 2,
    type: 'body-select',
    fieldKey: 'current_body_type',
    title: 'Which silhouette looks closest to you right now?',
    subtitle: "Doesn't need to be exact. This helps us set realistic visual milestones.",
    showInProgress: true,
  },
  {
    id: 'q-desired-body',
    act: 2,
    type: 'body-select',
    fieldKey: 'desired_body_type',
    title: 'Which one is closer to where you want to be?',
    subtitle: 'We use this to shape your training and nutrition targets.',
    showInProgress: true,
  },
  {
    id: 'q-what-would-change',
    act: 2,
    type: 'multi-select',
    fieldKey: 'desired_outcomes',
    title: 'If you actually hit this goal — what changes?',
    subtitle: "Pick what matters to you. We'll come back to these.",
    options: [
      { value: 'clothes_fit', emoji: '👕', label: 'My clothes fit the way I want' },
      { value: 'more_energy', emoji: '⚡', label: 'I have energy through the whole day' },
      { value: 'confidence', emoji: '🪞', label: "I'm not avoiding mirrors anymore" },
      { value: 'better_labs', emoji: '🩸', label: 'My bloodwork and health markers improve' },
      { value: 'stronger_lifts', emoji: '🏋️', label: "I'm actually strong, not just lean" },
      { value: 'feel_like_myself', emoji: '🧠', label: 'I feel like myself again' },
    ],
    minSelections: 1,
    maxSelections: 6,
    showInProgress: true,
  },
  {
    id: 'q-tracking-history',
    act: 2,
    type: 'single-select',
    fieldKey: 'tracking_experience',
    title: 'Have you tracked calories or macros before?',
    subtitle: 'This changes how we onboard you into the tracker.',
    options: [
      { value: 'a_lot', emoji: '📊', label: "Yes — I've done it seriously" },
      { value: 'some', emoji: '📝', label: 'A bit, but never consistently' },
      { value: 'none', emoji: '🆕', label: 'Never' },
    ],
    autoAdvance: true,
    showInProgress: true,
  },
  {
    id: 'q-connected-apps',
    act: 2,
    type: 'multi-select',
    fieldKey: 'connected_apps',
    title: 'Want to connect anything you already use?',
    subtitle: 'We pull in your data so you start with context, not a blank slate.',
    options: [
      { value: 'apple_health', emoji: '❤️', label: 'Apple Health' },
      { value: 'apple_watch', emoji: '⌚', label: 'Apple Watch' },
      { value: 'garmin', emoji: '📡', label: 'Garmin' },
      { value: 'mfp_import', emoji: '📥', label: 'Import from MyFitnessPal' },
      { value: 'skip', emoji: '⏭️', label: "Skip — I'll set this up later" },
    ],
    minSelections: 1,
    maxSelections: 5,
    showInProgress: true,
  },
  {
    id: 'q-notifications',
    act: 2,
    type: 'single-select',
    fieldKey: 'notifications_enabled',
    title: 'Can we nudge you when it matters?',
    subtitle:
      'One check-in in the morning, one at night. No spam. You can turn these off anytime.',
    options: [
      { value: 'yes', emoji: '🔔', label: "Yes — keep me accountable" },
      { value: 'maybe_later', emoji: '🔕', label: "Maybe later" },
    ],
    autoAdvance: true,
    showInProgress: true,
  },

  // ─── ACT 3 — CONVERSION ────────────────────────────────────────
  {
    id: 'interstitial-building',
    act: 3,
    type: 'interstitial',
    title: 'Building your plan...',
    subtitle: 'Crunching your numbers against 12,000+ real results.',
    emoji: '⚙️',
  },
  {
    id: 'building',
    act: 3,
    type: 'building',
    messages: [
      'Analyzing your metabolism...',
      'Comparing against similar profiles...',
      'Calculating your optimal deficit...',
      'Mapping your training split...',
      'Setting weekly milestones...',
      'Generating your first week...',
    ],
    autoAdvanceMs: 3500,
  },
  {
    id: 'analysis',
    act: 3,
    type: 'projection',
    title: 'Here\'s what we found',
  },
  {
    id: 'projection',
    act: 3,
    type: 'projection',
    title: 'Your weight projection',
  },
  {
    id: 'social-proof',
    act: 3,
    type: 'social-proof',
    title: 'People like you are getting results',
    testimonials: [
      {
        name: 'Marco',
        age: 31,
        goal: 'Fat loss',
        quote:
          'I lost 9 kg in 10 weeks. The weekly adjustments meant I never stalled — first time that\'s happened.',
        metric: '-9 kg in 10 weeks',
      },
      {
        name: 'Sarah',
        age: 27,
        goal: 'Recomp',
        quote:
          'I\'ve used every app. Atlas is the only one that changed what I was doing based on what was actually happening.',
        metric: '-6 kg fat, +2 kg muscle',
      },
      {
        name: 'James',
        age: 44,
        goal: 'Energy & health',
        quote:
          'My bloodwork improved in 8 weeks. My doctor asked what I changed. I just said "I stopped guessing."',
        metric: 'Bloodwork normalized in 8 weeks',
      },
    ],
  },
  {
    id: 'commitment',
    act: 3,
    type: 'commitment',
    title: 'One commitment before we start',
    body:
      "You don't need to be perfect. You need to be consistent enough that Atlas can learn what works for you. Log honestly. Check in weekly. Trust the adjustments. That's it.",
    primaryCta: "I'm in — let's go",
    secondaryCta: 'I need to think about it',
  },
  {
    id: 'trial-explainer',
    act: 3,
    type: 'trial-explainer',
    title: 'How your free trial works',
    steps: [
      {
        label: 'Today — full access, zero charge',
        detail:
          'Your plan is built. Start logging, get your first weekly review, and see the system work.',
      },
      {
        label: 'Day 5 — we remind you',
        detail:
          "You'll get a heads up before anything is charged. No tricks.",
      },
      {
        label: 'Day 7 — trial ends',
        detail:
          "If Atlas isn't worth it, cancel in one tap. If it is, your subscription starts automatically.",
      },
    ],
  },
  {
    id: 'paywall',
    act: 3,
    type: 'paywall',
  },
  {
    id: 'account-creation',
    act: 3,
    type: 'account-creation',
    title: 'Create your account',
    subtitle:
      "Your plan is ready. Sign up so we can save your progress and start your first week.",
  },
];

/**
 * Count of quiz / progress-tracked screens (those with showInProgress: true).
 * Used by the progress bar component.
 */
export const QUIZ_SCREEN_COUNT = screens.filter((s) => s.showInProgress).length;

export const ONBOARDING_SCHEMA = screens;

export default screens;
