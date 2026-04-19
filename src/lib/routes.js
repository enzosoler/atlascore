/**
 * Canonical v2 routes. Every authed surface lives under /app/*.
 * Public, auth, and onboarding stay at top level.
 *
 * NOTE: many legacy paths ('/Today', '/Nutrition', ...) are preserved in
 * `LEGACY_ROUTE_REDIRECTS` below, so existing bookmarks still resolve.
 */
export const ROUTES = {
  home: '/',
  auth: '/auth',
  login: '/auth/login',
  signup: '/auth/signup',
  welcome: '/welcome',
  demoHome: '/preview',
  onboarding: '/onboarding',
  // App (authed) — all under /app/*
  today: '/app/today',
  nutrition: '/app/nutrition',
  workouts: '/app/workouts',
  routines: '/app/routines',
  protocols: '/app/protocols',
  protocolDetail: '/app/protocols/:id',
  protocolNew: '/app/protocols/new',
  protocolEdit: '/app/protocols/:id/edit',
  measurements: '/app/body/measurements',
  labExams: '/app/labs',
  progressReview: '/app/weekly',
  insights: '/app/insights',
  blockReview: '/app/block-review',
  exercises: '/app/exercises',
  progress: '/app/body/progress',
  plan: '/app/plan',
  profile: '/app/profile',
  goals: '/app/profile/goals',
  bodyProfile: '/app/body/profile',
  account: '/app/settings/account',
  billing: '/app/billing',
  profileEdit: '/app/profile/edit',
  export: '/app/settings/data',
  admin: '/admin',
  myDiet: '/app/nutrition/my-diet',
  myWorkout: '/app/workouts/my',
  diary: '/app/diary',
  progressPhotos: '/app/body/progress/photos',
  body: '/app/body',
  bodyCheckpointNew: '/app/body/checkin',
  social: '/app/social',
  manualWorkout: '/app/workouts/manual-plan',
  prescribedDiet: '/app/nutrition/prescribed',
  pricing: '/pricing',
  prescribedWorkout: '/app/workouts/prescribed',
  coachDashboard: '/pro/coach',
  coachStudents: '/pro/clients',
  nutritionistDashboard: '/pro/nutritionist',
  nutritionistClients: '/pro/clients',
  clinicianDashboard: '/pro/clinician',
  clinicianPatients: '/pro/clients',
  githubPRs: '/admin',
  help: '/help',
  blog: '/blog',
  settings: '/app/settings',
  integrations: '/app/settings/integrations',
  storyLanding: '/start',
  shareTarget: '/share-target',
  sharedWorkout: '/shared/workout/:token',
  notifications: '/app/notifications',
  notificationSettings: '/app/settings/notifications',
  connectedServices: '/app/settings/integrations',
  settingsPrivacy: '/app/settings/privacy',
  settingsTheme: '/app/settings/appearance',
  settingsLanguage: '/app/settings/language',
  settingsExport: '/app/settings/data',
  settingsDeleteAccount: '/app/settings/danger',
  adminAnalytics: '/admin/analytics',
  adminViewAs: '/admin/users',
};

/**
 * Default home page per role.
 * In the public MVP, professional routes are gated — all roles land on /Today
 * unless VITE_ENABLE_PRO_ROUTES is enabled (internal/staging builds).
 */
const proRoutesEnabled = true;

export const ROLE_HOME = {
  athlete:      ROUTES.today,
  coach:        proRoutesEnabled ? ROUTES.coachDashboard        : ROUTES.today,
  nutritionist: proRoutesEnabled ? ROUTES.nutritionistDashboard : ROUTES.today,
  clinician:    proRoutesEnabled ? ROUTES.clinicianDashboard    : ROUTES.today,
  admin:        proRoutesEnabled ? ROUTES.admin                 : ROUTES.today,
};

/**
 * Old URLs (from the pre-v2 app) mapped to their v2 equivalents.
 * The router applies these as <Navigate replace> so bookmarks, external links,
 * and OAuth return URLs keep working.
 */
export const LEGACY_ROUTE_REDIRECTS = [
  // Public
  ['/Landing', ROUTES.home],
  ['/home',    ROUTES.home],
  ['/landing', ROUTES.home],
  ['/Pricing', ROUTES.pricing],

  // Auth
  ['/login',   ROUTES.login],
  ['/signup',  ROUTES.signup],
  ['/Auth',    ROUTES.auth],

  // App surfaces (capital-case legacy + lowercase aliases)
  ['/Today',                ROUTES.today],
  ['/today',                ROUTES.today],
  ['/Dashboard',            ROUTES.today],
  ['/dashboard',            ROUTES.today],
  ['/Nutrition',            ROUTES.nutrition],
  ['/nutrition',            ROUTES.nutrition],
  ['/Workouts',             ROUTES.workouts],
  ['/workouts',             ROUTES.workouts],
  ['/Workout',              ROUTES.workouts],
  ['/Routines',             ROUTES.routines],
  ['/routines',             ROUTES.routines],
  ['/Protocols',            ROUTES.protocols],
  ['/protocols',            ROUTES.protocols],
  ['/Measurements',         ROUTES.measurements],
  ['/measurements',         ROUTES.measurements],
  ['/LabExams',             ROUTES.labExams],
  ['/lab-exams',            ROUTES.labExams],
  ['/AtlasAI',              ROUTES.progressReview],
  ['/atlas-ai',             ROUTES.progressReview],
  ['/Insights',             ROUTES.insights],
  ['/insights',             ROUTES.insights],
  ['/Exercises',            ROUTES.exercises],
  ['/exercises',            ROUTES.exercises],
  ['/Progress',             ROUTES.progress],
  ['/progress',             ROUTES.progress],
  ['/Profile',              ROUTES.profile],
  ['/profile',              ROUTES.profile],
  ['/Export',               ROUTES.export],
  ['/export',               ROUTES.export],
  ['/account',              ROUTES.account],
  ['/Account',              ROUTES.account],
  ['/billing',              ROUTES.billing],
  ['/my-diet',              ROUTES.myDiet],
  ['/my-workout',           ROUTES.myWorkout],
  ['/diary',                ROUTES.diary],
  ['/progress-photos',      ROUTES.progressPhotos],
  ['/body',                 ROUTES.body],
  ['/body-profile',         ROUTES.bodyProfile],
  ['/Social',               ROUTES.social],
  ['/social',               ROUTES.social],
  ['/manual-workout',       ROUTES.manualWorkout],
  ['/prescribed-diet',      ROUTES.prescribedDiet],
  ['/prescribed-workout',   ROUTES.prescribedWorkout],
  ['/Settings',             ROUTES.settings],
  ['/settings',             ROUTES.settings],
  ['/integrations',         ROUTES.integrations],
  ['/notifications',        ROUTES.notifications],
  ['/notification-settings',ROUTES.notificationSettings],
  ['/connected-services',   ROUTES.connectedServices],
  ['/goals',                ROUTES.goals],

  // Admin / pro
  ['/AdminPanel',               ROUTES.admin],
  ['/admin',                    ROUTES.admin],
  ['/coach-dashboard',          ROUTES.coachDashboard],
  ['/nutritionist-dashboard',   ROUTES.nutritionistDashboard],
  ['/clinician-dashboard',      ROUTES.clinicianDashboard],
];
