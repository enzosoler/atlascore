/**
 * Atlas Core — Canonical Screen Registry
 *
 * Single source of truth for every screen in the redesign. Each entry:
 *   - route             Path or logical route key
 *   - name              Canonical redesign component name
 *   - domain            Top-level product domain
 *   - layout            Layout shell used
 *   - access            'public' | 'auth' | 'onboarding' | 'app' | 'premium' | 'role'
 *   - role              Optional role when access === 'role'
 *   - platform          'both' | 'web-only' | 'native-only'
 *   - gating            Optional entitlement/feature flag required
 *   - legacy            Legacy file paths this replaces (for migration)
 *   - depends           Services / stores this screen hits (honesty note)
 *   - states            States the canonical redesign MUST implement
 *   - module            Primary shared feature module
 *   - notes             Implementation-level caveats
 *
 * Discipline: NEVER duplicate work across legacy aliases. Pick one canonical
 * target per surface, retire the rest via migration-notes.md.
 */

/** @typedef {'public'|'auth'|'onboarding'|'app'|'premium'|'role'} Access */
/** @typedef {'both'|'web-only'|'native-only'} Platform */
/** @typedef {'loading'|'skeleton'|'empty'|'populated'|'error'|'success'|'locked'|'offline'|'permission-request'|'permission-denied'|'no-results'} ScreenState */

export const DOMAINS = /** @type {const} */ ({
  MARKETING: 'marketing',
  AUTH: 'auth',
  ONBOARDING: 'onboarding',
  TODAY: 'today',
  NUTRITION: 'nutrition',
  WORKOUTS: 'workouts',
  BODY: 'body',
  LABS: 'labs',
  COACH: 'coach',
  PROFILE: 'profile',
  SETTINGS: 'settings',
  BILLING: 'billing',
  SOCIAL: 'social',
  ADMIN: 'admin',
  PRO: 'pro',
  SYSTEM: 'system',
  DEV: 'dev',
});

export const LAYOUTS = /** @type {const} */ ({
  MARKETING: 'MarketingShell',
  AUTH: 'AuthShell',
  ONBOARDING: 'OnboardingShell',
  APP: 'AppShell',
  DETAIL: 'DetailShell',
  SETTINGS: 'SettingsShell',
  ADMIN: 'AdminShell',
  FULLSCREEN: 'FullScreenShell',
});

/** All canonical screens. Ordered by domain for legibility. */
export const SCREENS = [
  // ───── MARKETING / PUBLIC ─────
  { route: '/',              name: 'Landing',          domain: DOMAINS.MARKETING, layout: LAYOUTS.MARKETING, access: 'public', platform: 'web-only', legacy: ['src/pages/Landing.jsx','src/pages/LandingV2.jsx'], states: ['populated','loading'], module: 'marketing' },
  { route: '/pricing',       name: 'Pricing',          domain: DOMAINS.MARKETING, layout: LAYOUTS.MARKETING, access: 'public', platform: 'web-only', legacy: ['src/pages/Pricing.jsx'], states: ['populated','loading','error'], module: 'billing' },
  { route: '/waitlist',      name: 'Waitlist',         domain: DOMAINS.MARKETING, layout: LAYOUTS.MARKETING, access: 'public', platform: 'web-only', states: ['populated','success','error'] },
  { route: '/blog',          name: 'BlogIndex',        domain: DOMAINS.MARKETING, layout: LAYOUTS.MARKETING, access: 'public', platform: 'web-only', states: ['populated','loading','empty'] },
  { route: '/blog/:slug',    name: 'BlogPost',         domain: DOMAINS.MARKETING, layout: LAYOUTS.MARKETING, access: 'public', platform: 'web-only', states: ['populated','loading','error'] },
  { route: '/guides',        name: 'GuidesIndex',      domain: DOMAINS.MARKETING, layout: LAYOUTS.MARKETING, access: 'public', platform: 'web-only', states: ['populated','empty'] },
  { route: '/guides/:slug',  name: 'GuideDetail',      domain: DOMAINS.MARKETING, layout: LAYOUTS.MARKETING, access: 'public', platform: 'web-only' },
  { route: '/use-cases/:id', name: 'UseCasePage',      domain: DOMAINS.MARKETING, layout: LAYOUTS.MARKETING, access: 'public', platform: 'web-only' },
  { route: '/help',          name: 'HelpCenter',       domain: DOMAINS.MARKETING, layout: LAYOUTS.MARKETING, access: 'public', platform: 'both',     states: ['populated','no-results'] },
  { route: '/privacy',       name: 'Privacy',          domain: DOMAINS.MARKETING, layout: LAYOUTS.MARKETING, access: 'public', platform: 'both' },
  { route: '/terms',         name: 'Terms',            domain: DOMAINS.MARKETING, layout: LAYOUTS.MARKETING, access: 'public', platform: 'both' },
  { route: '/invite/:code',  name: 'InviteAccept',     domain: DOMAINS.MARKETING, layout: LAYOUTS.AUTH,      access: 'public', platform: 'both', states: ['populated','error','loading'] },

  // ───── AUTH ─────
  { route: '/splash',        name: 'Splash',           domain: DOMAINS.AUTH, layout: LAYOUTS.FULLSCREEN, access: 'public', platform: 'native-only', legacy: ['src/pages/Splash.jsx'] },
  { route: '/welcome',       name: 'Welcome',          domain: DOMAINS.AUTH, layout: LAYOUTS.AUTH,       access: 'public', platform: 'both', legacy: ['src/pages/Welcome.jsx'] },
  { route: '/auth',          name: 'Auth',             domain: DOMAINS.AUTH, layout: LAYOUTS.AUTH,       access: 'public', platform: 'both', legacy: ['src/pages/Auth.jsx','src/pages/AuthV2.jsx'], depends: ['AuthContext','supabase.auth'], states: ['populated','loading','error'] },
  { route: '/auth/login',    name: 'Login',            domain: DOMAINS.AUTH, layout: LAYOUTS.AUTH,       access: 'public', platform: 'both', depends: ['supabase.auth'], states: ['populated','loading','error','success'] },
  { route: '/auth/signup',   name: 'Signup',           domain: DOMAINS.AUTH, layout: LAYOUTS.AUTH,       access: 'public', platform: 'both', depends: ['supabase.auth','on-auth-user-created'], states: ['populated','loading','error','success'] },
  { route: '/auth/callback', name: 'AuthCallback',     domain: DOMAINS.AUTH, layout: LAYOUTS.AUTH,       access: 'public', platform: 'both', states: ['loading','error','success'] },
  { route: '/auth/forgot',   name: 'ForgotPassword',   domain: DOMAINS.AUTH, layout: LAYOUTS.AUTH,       access: 'public', platform: 'both', states: ['populated','success','error'] },
  { route: '/auth/reset',    name: 'ResetPassword',    domain: DOMAINS.AUTH, layout: LAYOUTS.AUTH,       access: 'public', platform: 'both', states: ['populated','success','error'] },
  { route: '/auth/magic',    name: 'MagicLinkSent',    domain: DOMAINS.AUTH, layout: LAYOUTS.AUTH,       access: 'public', platform: 'both' },
  { route: '/logout',        name: 'Logout',           domain: DOMAINS.AUTH, layout: LAYOUTS.AUTH,       access: 'auth',   platform: 'both' },

  // ───── ONBOARDING ─────
  { route: '/onboarding',             name: 'OnboardingRoot',     domain: DOMAINS.ONBOARDING, layout: LAYOUTS.ONBOARDING, access: 'onboarding', platform: 'both', depends: ['AuthContext','profiles_table','onboardingStore'], states: ['populated','loading','error'] },
  { route: '/onboarding/goal',        name: 'OnboardingGoal',     domain: DOMAINS.ONBOARDING, layout: LAYOUTS.ONBOARDING, access: 'onboarding', platform: 'both' },
  { route: '/onboarding/activity',    name: 'OnboardingActivity', domain: DOMAINS.ONBOARDING, layout: LAYOUTS.ONBOARDING, access: 'onboarding', platform: 'both' },
  { route: '/onboarding/stats',       name: 'OnboardingStats',    domain: DOMAINS.ONBOARDING, layout: LAYOUTS.ONBOARDING, access: 'onboarding', platform: 'both' },
  { route: '/onboarding/diet',        name: 'OnboardingDiet',     domain: DOMAINS.ONBOARDING, layout: LAYOUTS.ONBOARDING, access: 'onboarding', platform: 'both' },
  { route: '/onboarding/workout',     name: 'OnboardingWorkout',  domain: DOMAINS.ONBOARDING, layout: LAYOUTS.ONBOARDING, access: 'onboarding', platform: 'both' },
  { route: '/onboarding/habits',      name: 'OnboardingHabits',   domain: DOMAINS.ONBOARDING, layout: LAYOUTS.ONBOARDING, access: 'onboarding', platform: 'both' },
  { route: '/onboarding/constraints', name: 'OnboardingConstraints', domain: DOMAINS.ONBOARDING, layout: LAYOUTS.ONBOARDING, access: 'onboarding', platform: 'both' },
  { route: '/onboarding/summary',     name: 'OnboardingSummary',  domain: DOMAINS.ONBOARDING, layout: LAYOUTS.ONBOARDING, access: 'onboarding', platform: 'both', notes: 'Personalization illusion — show calculated targets with "why" explanation.' },
  { route: '/onboarding/paywall',     name: 'OnboardingPaywall',  domain: DOMAINS.ONBOARDING, layout: LAYOUTS.ONBOARDING, access: 'onboarding', platform: 'both', module: 'billing', notes: 'Post-onboarding trial gate. Stripe on web, RevenueCat on native.' },
  { route: '/onboarding/tour',        name: 'OnboardingTour',     domain: DOMAINS.ONBOARDING, layout: LAYOUTS.FULLSCREEN, access: 'auth', platform: 'both' },
  { route: '/onboarding/smart',       name: 'SmartOnboarding',    domain: DOMAINS.ONBOARDING, layout: LAYOUTS.ONBOARDING, access: 'auth', platform: 'both', notes: 'Adaptive flow for returning users / partial profiles.' },

  // ───── TODAY / DASHBOARD ─────
  { route: '/app/today',        name: 'Today',         domain: DOMAINS.TODAY, layout: LAYOUTS.APP, access: 'auth', platform: 'both', legacy: ['src/pages/Today.jsx','src/pages/TodayV2.jsx','src/pages/Dashboard.jsx'], depends: ['dailyStore','workoutHistoryService','entitlement'], states: ['loading','skeleton','populated','empty','error','locked'] },
  { route: '/app/weekly',       name: 'WeeklyReview',  domain: DOMAINS.TODAY, layout: LAYOUTS.APP, access: 'auth', platform: 'both', notes: 'Strava-style weekly summary card + breakdown.' },
  { route: '/app/insights',     name: 'Insights',      domain: DOMAINS.TODAY, layout: LAYOUTS.APP, access: 'premium', platform: 'both', states: ['populated','empty','locked'] },
  { route: '/app/diary',        name: 'Diary',         domain: DOMAINS.TODAY, layout: LAYOUTS.APP, access: 'auth', platform: 'both', states: ['populated','empty'] },
  { route: '/app/block-review', name: 'BlockReview',   domain: DOMAINS.TODAY, layout: LAYOUTS.APP, access: 'auth', platform: 'both' },
  { route: '/app/plan',         name: 'Plan',          domain: DOMAINS.TODAY, layout: LAYOUTS.APP, access: 'auth', platform: 'both' },
  { route: '/app/decision',     name: 'DecisionEngine', domain: DOMAINS.TODAY, layout: LAYOUTS.APP, access: 'role',  role: 'admin', platform: 'both', notes: 'Internal.' },

  // ───── NUTRITION ─────
  { route: '/app/nutrition',            name: 'NutritionToday',      domain: DOMAINS.NUTRITION, layout: LAYOUTS.APP, access: 'auth', platform: 'both', legacy: ['src/pages/Nutrition.jsx','src/pages/NutritionRedesigned.jsx'], depends: ['nutritionService','fatsecretService'], states: ['loading','populated','empty','error'] },
  { route: '/app/nutrition/history',    name: 'NutritionHistory',    domain: DOMAINS.NUTRITION, layout: LAYOUTS.APP, access: 'auth', platform: 'both' },
  { route: '/app/nutrition/targets',    name: 'MacroTargets',        domain: DOMAINS.NUTRITION, layout: LAYOUTS.DETAIL, access: 'auth', platform: 'both', notes: 'MacroFactor-style "how we calculated" transparency.' },
  { route: '/app/nutrition/plan',       name: 'MealPlan',            domain: DOMAINS.NUTRITION, layout: LAYOUTS.APP, access: 'premium', platform: 'both', states: ['populated','locked','empty'] },
  { route: '/app/nutrition/my-diet',    name: 'MyDiet',              domain: DOMAINS.NUTRITION, layout: LAYOUTS.APP, access: 'auth', platform: 'both', legacy: ['src/pages/MyDiet.jsx'] },
  { route: '/app/nutrition/prescribed', name: 'PrescribedDiet',      domain: DOMAINS.NUTRITION, layout: LAYOUTS.DETAIL, access: 'role', role: 'athlete', platform: 'both' },
  { route: '/app/nutrition/search',     name: 'FoodSearch',          domain: DOMAINS.NUTRITION, layout: LAYOUTS.FULLSCREEN, access: 'auth', platform: 'both', states: ['populated','no-results','loading'] },
  { route: '/app/nutrition/food/:id',   name: 'FoodDetail',          domain: DOMAINS.NUTRITION, layout: LAYOUTS.DETAIL, access: 'auth', platform: 'both' },
  { route: '/app/nutrition/recipe/:id', name: 'RecipeDetail',        domain: DOMAINS.NUTRITION, layout: LAYOUTS.DETAIL, access: 'auth', platform: 'both' },
  { route: '/app/nutrition/recipes',    name: 'RecipeLibrary',       domain: DOMAINS.NUTRITION, layout: LAYOUTS.APP, access: 'auth', platform: 'both' },
  { route: '/app/nutrition/barcode',    name: 'BarcodeScan',         domain: DOMAINS.NUTRITION, layout: LAYOUTS.FULLSCREEN, access: 'auth', platform: 'native-only', states: ['populated','permission-request','permission-denied','error'] },
  { route: '/app/nutrition/photo',      name: 'PhotoScan',           domain: DOMAINS.NUTRITION, layout: LAYOUTS.FULLSCREEN, access: 'auth', platform: 'native-only', states: ['populated','permission-request','permission-denied','loading','error'] },
  { route: '/app/nutrition/photo/confirm', name: 'PhotoScanConfirm', domain: DOMAINS.NUTRITION, layout: LAYOUTS.DETAIL, access: 'auth', platform: 'both', notes: 'AI confidence + per-item confirm/edit (Cal AI style).' },

  // ───── WORKOUTS ─────
  { route: '/app/workouts',              name: 'WorkoutsHome',        domain: DOMAINS.WORKOUTS, layout: LAYOUTS.APP, access: 'auth', platform: 'both', legacy: ['src/pages/Workouts.jsx','src/pages/WorkoutsV2.jsx','src/pages/TrainV2.jsx'], depends: ['workoutService','workoutPlanService'], states: ['populated','empty','loading'] },
  { route: '/app/workouts/library',      name: 'WorkoutLibrary',      domain: DOMAINS.WORKOUTS, layout: LAYOUTS.APP, access: 'auth', platform: 'both', states: ['populated','no-results','empty'] },
  { route: '/app/workouts/:id',          name: 'WorkoutDetail',       domain: DOMAINS.WORKOUTS, layout: LAYOUTS.DETAIL, access: 'auth', platform: 'both' },
  { route: '/app/workouts/:id/active',   name: 'ActiveWorkout',       domain: DOMAINS.WORKOUTS, layout: LAYOUTS.FULLSCREEN, access: 'auth', platform: 'both', states: ['populated','paused','finished','error'], notes: 'Hevy-style. Rest timer, superset UI, plate calc.' },
  { route: '/app/workouts/history',      name: 'WorkoutHistory',      domain: DOMAINS.WORKOUTS, layout: LAYOUTS.APP, access: 'auth', platform: 'both' },
  { route: '/app/workouts/my',           name: 'MyWorkout',           domain: DOMAINS.WORKOUTS, layout: LAYOUTS.APP, access: 'auth', platform: 'both', legacy: ['src/pages/MyWorkout.jsx'] },
  { route: '/app/workouts/prescribed',   name: 'PrescribedWorkout',   domain: DOMAINS.WORKOUTS, layout: LAYOUTS.DETAIL, access: 'role', role: 'athlete', platform: 'both' },
  { route: '/app/workouts/manual-plan',  name: 'ManualWorkoutPlan',   domain: DOMAINS.WORKOUTS, layout: LAYOUTS.DETAIL, access: 'auth', platform: 'both' },
  { route: '/app/routines',              name: 'Routines',            domain: DOMAINS.WORKOUTS, layout: LAYOUTS.APP, access: 'auth', platform: 'both' },
  { route: '/app/routines/:id',          name: 'RoutineDetail',       domain: DOMAINS.WORKOUTS, layout: LAYOUTS.DETAIL, access: 'auth', platform: 'both' },
  { route: '/app/protocols',             name: 'Protocols',           domain: DOMAINS.WORKOUTS, layout: LAYOUTS.APP, access: 'auth', platform: 'both' },
  { route: '/app/protocols/:id',         name: 'ProtocolDetail',      domain: DOMAINS.WORKOUTS, layout: LAYOUTS.DETAIL, access: 'auth', platform: 'both' },
  { route: '/app/protocols/new',         name: 'ProtocolForm',        domain: DOMAINS.WORKOUTS, layout: LAYOUTS.DETAIL, access: 'auth', platform: 'both' },
  { route: '/app/exercises',             name: 'ExerciseLibrary',     domain: DOMAINS.WORKOUTS, layout: LAYOUTS.APP, access: 'auth', platform: 'both' },
  { route: '/app/exercises/:id',         name: 'ExerciseDetail',      domain: DOMAINS.WORKOUTS, layout: LAYOUTS.DETAIL, access: 'auth', platform: 'both' },

  // ───── BODY / MEASUREMENTS / PROGRESS ─────
  { route: '/app/body',                  name: 'BodyOverview',        domain: DOMAINS.BODY, layout: LAYOUTS.APP, access: 'auth', platform: 'both', legacy: ['src/pages/Body.jsx'], states: ['populated','empty','loading'] },
  { route: '/app/body/profile',          name: 'BodyProfile',         domain: DOMAINS.BODY, layout: LAYOUTS.DETAIL, access: 'auth', platform: 'both' },
  { route: '/app/body/weight',           name: 'WeightEntry',         domain: DOMAINS.BODY, layout: LAYOUTS.DETAIL, access: 'auth', platform: 'both' },
  { route: '/app/body/composition',      name: 'BodyComposition',     domain: DOMAINS.BODY, layout: LAYOUTS.DETAIL, access: 'auth', platform: 'both' },
  { route: '/app/body/measurements',     name: 'Measurements',        domain: DOMAINS.BODY, layout: LAYOUTS.APP, access: 'auth', platform: 'both' },
  { route: '/app/body/progress',         name: 'Progress',            domain: DOMAINS.BODY, layout: LAYOUTS.APP, access: 'auth', platform: 'both', legacy: ['src/pages/Progress.jsx','src/pages/ProgressV2.jsx'] },
  { route: '/app/body/progress/photos',  name: 'ProgressPhotos',      domain: DOMAINS.BODY, layout: LAYOUTS.APP, access: 'auth', platform: 'both', legacy: ['src/pages/ProgressPhotos.jsx','src/pages/ProgressPhotosV2.jsx'] },
  { route: '/app/body/progress/photo/:id', name: 'ProgressPhotoView', domain: DOMAINS.BODY, layout: LAYOUTS.FULLSCREEN, access: 'auth', platform: 'both' },
  { route: '/app/body/checkin',          name: 'BodyCheckIn',         domain: DOMAINS.BODY, layout: LAYOUTS.DETAIL, access: 'auth', platform: 'both' },

  // ───── LABS ─────
  { route: '/app/labs',                  name: 'LabsOverview',        domain: DOMAINS.LABS, layout: LAYOUTS.APP, access: 'premium', platform: 'both', states: ['populated','empty','locked'] },
  { route: '/app/labs/exam/:id',         name: 'LabExamDetail',       domain: DOMAINS.LABS, layout: LAYOUTS.DETAIL, access: 'premium', platform: 'both' },
  { route: '/app/labs/biomarker/:id',    name: 'BiomarkerDetail',     domain: DOMAINS.LABS, layout: LAYOUTS.DETAIL, access: 'premium', platform: 'both' },
  { route: '/app/labs/upload',           name: 'LabUpload',           domain: DOMAINS.LABS, layout: LAYOUTS.FULLSCREEN, access: 'premium', platform: 'both' },
  { route: '/app/labs/history',          name: 'LabHistory',          domain: DOMAINS.LABS, layout: LAYOUTS.APP, access: 'premium', platform: 'both' },

  // ───── COACH ─────
  { route: '/app/coach',                 name: 'CoachHome',           domain: DOMAINS.COACH, layout: LAYOUTS.APP, access: 'auth', platform: 'both', notes: 'Proactive cards + entry to chat.' },
  { route: '/app/coach/chat',            name: 'CoachChat',           domain: DOMAINS.COACH, layout: LAYOUTS.FULLSCREEN, access: 'auth', platform: 'both', states: ['populated','loading','thinking','low-confidence','error'] },
  { route: '/app/coach/insights/:id',    name: 'CoachInsightDetail',  domain: DOMAINS.COACH, layout: LAYOUTS.DETAIL, access: 'auth', platform: 'both' },

  // ───── PROFILE / SETTINGS ─────
  { route: '/app/profile',               name: 'Profile',             domain: DOMAINS.PROFILE, layout: LAYOUTS.APP, access: 'auth', platform: 'both', legacy: ['src/pages/Profile.jsx','src/pages/ProfileV2.jsx'] },
  { route: '/app/profile/edit',          name: 'ProfileEdit',         domain: DOMAINS.PROFILE, layout: LAYOUTS.DETAIL, access: 'auth', platform: 'both' },
  { route: '/app/settings',              name: 'SettingsHub',         domain: DOMAINS.SETTINGS, layout: LAYOUTS.SETTINGS, access: 'auth', platform: 'both' },
  { route: '/app/settings/account',      name: 'AccountSettings',     domain: DOMAINS.SETTINGS, layout: LAYOUTS.SETTINGS, access: 'auth', platform: 'both', legacy: ['src/pages/Account.jsx'] },
  { route: '/app/settings/notifications', name: 'NotificationSettings', domain: DOMAINS.SETTINGS, layout: LAYOUTS.SETTINGS, access: 'auth', platform: 'both', depends: ['@capacitor/push-notifications','@capacitor/local-notifications'], states: ['populated','permission-request','permission-denied'] },
  { route: '/app/settings/privacy',      name: 'PrivacySettings',     domain: DOMAINS.SETTINGS, layout: LAYOUTS.SETTINGS, access: 'auth', platform: 'both' },
  { route: '/app/settings/appearance',   name: 'AppearanceSettings',  domain: DOMAINS.SETTINGS, layout: LAYOUTS.SETTINGS, access: 'auth', platform: 'both' },
  { route: '/app/settings/integrations', name: 'Integrations',        domain: DOMAINS.SETTINGS, layout: LAYOUTS.SETTINGS, access: 'auth', platform: 'both', notes: 'HealthKit, Apple Health, Google Fit (future), exporters.' },
  { route: '/app/settings/language',     name: 'LanguageSettings',    domain: DOMAINS.SETTINGS, layout: LAYOUTS.SETTINGS, access: 'auth', platform: 'both', notes: 'i18n is partial — guard copy & locale list honestly.' },
  { route: '/app/settings/data',         name: 'DataExport',          domain: DOMAINS.SETTINGS, layout: LAYOUTS.SETTINGS, access: 'auth', platform: 'both' },
  { route: '/app/settings/danger',       name: 'DangerZone',          domain: DOMAINS.SETTINGS, layout: LAYOUTS.SETTINGS, access: 'auth', platform: 'both', notes: 'Sign-out, delete account, start fresh.' },

  // ───── BILLING / MONETIZATION ─────
  { route: '/app/billing',               name: 'BillingOverview',     domain: DOMAINS.BILLING, layout: LAYOUTS.SETTINGS, access: 'auth', platform: 'both', depends: ['stripe-webhook','revenuecat-webhook','entitlement'] },
  { route: '/app/billing/checkout',      name: 'Checkout',            domain: DOMAINS.BILLING, layout: LAYOUTS.DETAIL,   access: 'auth', platform: 'web-only', notes: 'Stripe-hosted checkout redirect surface.' },
  { route: '/app/billing/plans',         name: 'PlanPicker',          domain: DOMAINS.BILLING, layout: LAYOUTS.DETAIL,   access: 'auth', platform: 'both', notes: 'Weekly/annual. Cal AI framing.' },
  { route: '/app/billing/trial',         name: 'TrialStart',          domain: DOMAINS.BILLING, layout: LAYOUTS.FULLSCREEN, access: 'auth', platform: 'both' },
  { route: '/app/billing/trial/explain', name: 'TrialExplain',        domain: DOMAINS.BILLING, layout: LAYOUTS.DETAIL,   access: 'auth', platform: 'both', notes: '"How your trial works" 3-step timeline.' },
  { route: '/app/billing/discount',      name: 'DiscountOffer',       domain: DOMAINS.BILLING, layout: LAYOUTS.FULLSCREEN, access: 'auth', platform: 'both' },
  { route: '/app/billing/restore',       name: 'RestorePurchases',    domain: DOMAINS.BILLING, layout: LAYOUTS.DETAIL,   access: 'auth', platform: 'native-only', states: ['populated','loading','success','error'] },
  { route: '/app/billing/manage',        name: 'ManageSubscription',  domain: DOMAINS.BILLING, layout: LAYOUTS.SETTINGS, access: 'auth', platform: 'both', notes: 'Deep-links to iOS Settings / Play Store on native.' },
  { route: '/app/billing/cancel',        name: 'CancelFlow',          domain: DOMAINS.BILLING, layout: LAYOUTS.FULLSCREEN, access: 'auth', platform: 'both', notes: 'Blinkist-style save offer before cancel.' },
  { route: '/app/billing/upgrade',       name: 'UpgradePrompt',       domain: DOMAINS.BILLING, layout: LAYOUTS.DETAIL,   access: 'auth', platform: 'both', notes: 'Contextual upgrade entry point.' },

  // ───── SOCIAL / CREATOR ─────
  { route: '/app/social',                name: 'SocialHome',          domain: DOMAINS.SOCIAL, layout: LAYOUTS.APP, access: 'auth', platform: 'both' },
  { route: '/app/social/share',          name: 'ShareComposer',       domain: DOMAINS.SOCIAL, layout: LAYOUTS.FULLSCREEN, access: 'auth', platform: 'both', notes: 'Strava-style share card for workouts/progress.' },
  { route: '/app/social/creator',        name: 'CreatorDashboard',    domain: DOMAINS.SOCIAL, layout: LAYOUTS.APP, access: 'role', role: 'creator', platform: 'both' },
  { route: '/app/social/code',           name: 'CreatorCode',         domain: DOMAINS.SOCIAL, layout: LAYOUTS.DETAIL, access: 'auth', platform: 'both' },
  { route: '/app/social/referrals',      name: 'Referrals',           domain: DOMAINS.SOCIAL, layout: LAYOUTS.DETAIL, access: 'auth', platform: 'both' },

  // ───── ADMIN / PRO ─────
  { route: '/admin',                     name: 'AdminHome',           domain: DOMAINS.ADMIN, layout: LAYOUTS.ADMIN, access: 'role', role: 'admin', platform: 'web-only' },
  { route: '/admin/users',               name: 'AdminUsers',          domain: DOMAINS.ADMIN, layout: LAYOUTS.ADMIN, access: 'role', role: 'admin', platform: 'web-only' },
  { route: '/admin/subscriptions',       name: 'AdminSubscriptions',  domain: DOMAINS.ADMIN, layout: LAYOUTS.ADMIN, access: 'role', role: 'admin', platform: 'web-only' },
  { route: '/admin/audit',               name: 'AdminAudit',          domain: DOMAINS.ADMIN, layout: LAYOUTS.ADMIN, access: 'role', role: 'admin', platform: 'web-only' },
  { route: '/admin/flags',               name: 'AdminFeatureFlags',   domain: DOMAINS.ADMIN, layout: LAYOUTS.ADMIN, access: 'role', role: 'admin', platform: 'web-only' },
  { route: '/admin/analytics',           name: 'AdminAnalytics',      domain: DOMAINS.ADMIN, layout: LAYOUTS.ADMIN, access: 'role', role: 'admin', platform: 'web-only' },
  { route: '/admin/settings',            name: 'AdminSettings',       domain: DOMAINS.ADMIN, layout: LAYOUTS.ADMIN, access: 'role', role: 'admin', platform: 'web-only' },
  { route: '/pro/coach',                 name: 'CoachProDashboard',   domain: DOMAINS.PRO,   layout: LAYOUTS.APP,   access: 'role', role: 'coach',        platform: 'both' },
  { route: '/pro/nutritionist',          name: 'NutritionistDashboard', domain: DOMAINS.PRO, layout: LAYOUTS.APP,   access: 'role', role: 'nutritionist', platform: 'both' },
  { route: '/pro/clinician',             name: 'ClinicianDashboard',  domain: DOMAINS.PRO,   layout: LAYOUTS.APP,   access: 'role', role: 'clinician',    platform: 'both' },
  { route: '/pro/clients',               name: 'ProClientList',       domain: DOMAINS.PRO,   layout: LAYOUTS.APP,   access: 'role', role: 'coach',        platform: 'both' },
  { route: '/pro/clients/:id',           name: 'ProClientDetail',     domain: DOMAINS.PRO,   layout: LAYOUTS.DETAIL, access: 'role', role: 'coach',       platform: 'both' },

  // ───── SYSTEM ─────
  { route: '/404',                       name: 'NotFound',            domain: DOMAINS.SYSTEM, layout: LAYOUTS.MARKETING, access: 'public', platform: 'both' },
  { route: '/500',                       name: 'ServerError',         domain: DOMAINS.SYSTEM, layout: LAYOUTS.MARKETING, access: 'public', platform: 'both' },
  { route: '/offline',                   name: 'Offline',             domain: DOMAINS.SYSTEM, layout: LAYOUTS.FULLSCREEN, access: 'public', platform: 'both' },
  { route: '/maintenance',               name: 'Maintenance',         domain: DOMAINS.SYSTEM, layout: LAYOUTS.MARKETING, access: 'public', platform: 'both' },
  { route: '/permissions/notifications', name: 'PermissionNotifications', domain: DOMAINS.SYSTEM, layout: LAYOUTS.FULLSCREEN, access: 'auth', platform: 'native-only' },
  { route: '/permissions/camera',        name: 'PermissionCamera',    domain: DOMAINS.SYSTEM, layout: LAYOUTS.FULLSCREEN, access: 'auth', platform: 'native-only' },
  { route: '/permissions/health',        name: 'PermissionHealth',    domain: DOMAINS.SYSTEM, layout: LAYOUTS.FULLSCREEN, access: 'auth', platform: 'native-only', depends: ['@perfood/capacitor-healthkit'] },

  // ───── DEV ─────
  { route: '/_/styleguide',              name: 'Styleguide',          domain: DOMAINS.DEV, layout: LAYOUTS.APP, access: 'role', role: 'admin', platform: 'both' },
  { route: '/_/tokens',                  name: 'TokenGallery',        domain: DOMAINS.DEV, layout: LAYOUTS.APP, access: 'role', role: 'admin', platform: 'both' },
  { route: '/_/components',              name: 'ComponentGallery',    domain: DOMAINS.DEV, layout: LAYOUTS.APP, access: 'role', role: 'admin', platform: 'both' },
];

/** Overlay / modal / sheet registry. Not routed — triggered from screens. */
export const OVERLAYS = [
  { name: 'AuthModal',              domain: DOMAINS.AUTH,       trigger: 'contextual sign-in' },
  { name: 'QuickLogSheet',          domain: DOMAINS.NUTRITION,  trigger: 'FAB from Today/Nutrition' },
  { name: 'MealEditSheet',          domain: DOMAINS.NUTRITION,  trigger: 'tap food row' },
  { name: 'PortionEditorSheet',     domain: DOMAINS.NUTRITION,  trigger: 'nested edit' },
  { name: 'FoodSearchSheet',        domain: DOMAINS.NUTRITION,  trigger: 'add food' },
  { name: 'PhotoScanSheet',         domain: DOMAINS.NUTRITION,  trigger: 'scan photo', platform: 'native-only' },
  { name: 'BarcodeScanSheet',       domain: DOMAINS.NUTRITION,  trigger: 'scan barcode', platform: 'native-only' },
  { name: 'QuickWorkoutModal',      domain: DOMAINS.WORKOUTS,   trigger: 'start quick session' },
  { name: 'WorkoutGuardSheet',      domain: DOMAINS.WORKOUTS,   trigger: 'locked premium' },
  { name: 'ShareWorkoutSheet',      domain: DOMAINS.WORKOUTS,   trigger: 'post-workout share' },
  { name: 'PlanBuilderWizard',      domain: DOMAINS.WORKOUTS,   trigger: 'AI plan builder' },
  { name: 'BodyCheckinSheet',       domain: DOMAINS.BODY,       trigger: 'weekly prompt' },
  { name: 'WeeklyCheckinModal',     domain: DOMAINS.TODAY,      trigger: 'end of week' },
  { name: 'CoachChatSheet',         domain: DOMAINS.COACH,      trigger: 'contextual coach' },
  { name: 'AIGenerationWizard',     domain: DOMAINS.COACH,      trigger: 'generate plan/meal' },
  { name: 'PaywallTrigger',         domain: DOMAINS.BILLING,    trigger: 'gated action' },
  { name: 'SubscriptionManagerSheet', domain: DOMAINS.BILLING,  trigger: 'manage sub' },
  { name: 'InviteModal',            domain: DOMAINS.SOCIAL,     trigger: 'invite friend' },
  { name: 'CreatorCodeModal',       domain: DOMAINS.SOCIAL,     trigger: 'apply creator code' },
  { name: 'ShareFlowSheet',         domain: DOMAINS.SOCIAL,     trigger: 'generic share' },
  { name: 'EnhancedShareModal',     domain: DOMAINS.SOCIAL,     trigger: 'branded share card' },
  { name: 'ImageCropperModal',      domain: DOMAINS.SYSTEM,     trigger: 'avatar/photo' },
  { name: 'SupportWidget',          domain: DOMAINS.SYSTEM,     trigger: 'persistent help' },
  { name: 'OnboardingTourSheet',    domain: DOMAINS.ONBOARDING, trigger: 'first app open' },
  { name: 'StartFreshModal',        domain: DOMAINS.SETTINGS,   trigger: 'reset flow' },
  { name: 'UnsavedChangesDialog',   domain: DOMAINS.SYSTEM,     trigger: 'dirty form exit' },
  { name: 'ConfirmDestructiveDialog', domain: DOMAINS.SYSTEM,   trigger: 'dangerous action' },
];

/** Lookup helpers. */
export const byDomain = (d) => SCREENS.filter((s) => s.domain === d);
export const byRoute  = (r) => SCREENS.find((s) => s.route === r);
export const byName   = (n) => SCREENS.find((s) => s.name === n);

export const STATS = {
  total: SCREENS.length,
  byDomain: Object.fromEntries(
    Object.values(DOMAINS).map((d) => [d, byDomain(d).length]),
  ),
  overlays: OVERLAYS.length,
};
