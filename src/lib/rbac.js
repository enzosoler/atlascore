import { ROUTES } from '@/lib/routes';

/**
 * Atlas Core — RBAC (Role-Based Access Control)
 *
 * Roles (atlas_role):
 *   visitor   — unauthenticated, public pages only
 *   athlete   — owns their own data workspace
 *   coach     — training/nutrition for linked athletes
 *   clinician — labs/protocols/macroview for linked athletes
 *   admin     — full access, user/link management
 *
 * Rule: role defines WHAT pages/areas you can access.
 * Link permissions (CoachStudent / ClinicianPatient) define WHAT DATA
 * within a professional's area (coach/clinician) is visible per athlete.
 */

export const ROLES = {
  VISITOR:      'visitor',
  ATHLETE:      'athlete',
  COACH:        'coach',
  NUTRITIONIST: 'nutritionist',
  CLINICIAN:    'clinician',
  ADMIN:        'admin',
  BETA_TESTER:  'beta_tester',
};

export const ROLE_LABELS = {
  visitor:      'Visitor',
  athlete:      'Athlete',
  coach:        'Coach',
  nutritionist: 'Nutritionist',
  clinician:    'Clinician',
  admin:        'Admin',
  beta_tester:  'Beta Tester',
};

export const ROLE_BADGE = {
  visitor:      'badge badge-neutral',
  athlete:      'badge badge-neutral',
  coach:        'badge badge-blue',
  nutritionist: 'badge badge-blue',
  clinician:    'badge badge-ok',
  admin:        'badge badge-err',
  beta_tester:  'badge badge-warn',
};

/**
 * Page-level access control.
 * Each entry lists which roles can load this page at all.
 * Fine-grained data access (per linked athlete) is handled in each page/component.
 */
// Shorthand — all roles that can access standard (non-admin) pages
const ALL_NON_ADMIN = ['athlete', 'coach', 'nutritionist', 'clinician', 'admin', 'beta_tester'];

// Shorthand — roles with access to the athlete personal workspace
const WORKSPACE = ['athlete', 'coach', 'nutritionist', 'clinician', 'admin', 'beta_tester'];

export const PAGE_ACCESS = {
  // ── Athlete workspace ──────────────────────────────────
  Today:           ALL_NON_ADMIN,
  Diary:           WORKSPACE,
  Nutrition:       WORKSPACE,
  Workouts:        WORKSPACE,
  Protocols:       WORKSPACE,
  Measurements:    WORKSPACE,
  LabExams:        WORKSPACE,
  ProgressPhotos:  WORKSPACE,
  Body:            WORKSPACE,
  MyDiet:          WORKSPACE,
  MyWorkout:       WORKSPACE,
  MyPrescribedDiet:    WORKSPACE,
  MyPrescribedWorkout: WORKSPACE,
  ProgressReview:  WORKSPACE,
  Insights:        WORKSPACE,
  BlockReview:     WORKSPACE,
  Social:          ALL_NON_ADMIN,
  Export:          ALL_NON_ADMIN,
  Profile:         ALL_NON_ADMIN,

  // ── Coach area ─────────────────────────────────────────
  CoachDashboard:      ['coach', 'admin', 'beta_tester'],
  CoachStudents:       ['coach', 'admin', 'beta_tester'],
  CoachStudentProfile: ['coach', 'admin', 'beta_tester'],

  // ── Nutritionist area ──────────────────────────────────
  NutritionistDashboard:      ['nutritionist', 'admin', 'beta_tester'],
  NutritionistClients:        ['nutritionist', 'admin', 'beta_tester'],
  NutritionistClientProfile:  ['nutritionist', 'admin', 'beta_tester'],

  // ── Clinician area ─────────────────────────────────────
  ClinicianDashboard:      ['clinician', 'admin', 'beta_tester'],
  ClinicianPatients:       ['clinician', 'admin', 'beta_tester'],
  ClinicianPatientProfile: ['clinician', 'admin', 'beta_tester'],

  // ── Admin only ─────────────────────────────────────────
  AdminPanel: ['admin'],
};

/**
 * Navigation definition per role.
 * Determines what shows in the sidebar/bottom nav.
 */
export const NAV_BY_ROLE = {
  beta_tester: [
    { path: ROUTES.today,              label: 'Today',      icon: 'Home' },
    { path: ROUTES.workouts,           label: 'Train',      icon: 'Dumbbell' },
    { path: ROUTES.nutrition,          label: 'Nutrition',  icon: 'UtensilsCrossed' },
    { path: ROUTES.progress,           label: 'Progress',   icon: 'BarChart3' },
    { path: ROUTES.coachDashboard,     label: 'Coach',      icon: 'LayoutDashboard' },
    { path: ROUTES.nutritionistDashboard, label: 'Nutrition Pro', icon: 'LayoutDashboard' },
    { path: ROUTES.clinicianDashboard, label: 'Clinician',  icon: 'LayoutDashboard' },
    { path: ROUTES.protocols,          label: 'Protocols',  icon: 'FlaskConical' },
    { path: ROUTES.labExams,           label: 'Labs',       icon: 'ClipboardList' },
    { path: ROUTES.profile,            label: 'More',       icon: 'User' },
  ],
  athlete: [
    { path: ROUTES.today,      label: 'Today',     icon: 'Home' },
    { path: ROUTES.workouts,   label: 'Train',     icon: 'Dumbbell' },
    { path: ROUTES.nutrition,  label: 'Nutrition', icon: 'UtensilsCrossed' },
    { path: ROUTES.progress,   label: 'Progress',  icon: 'BarChart3' },
    { path: ROUTES.protocols,  label: 'Protocols', icon: 'FlaskConical' },
    { path: ROUTES.labExams,   label: 'Labs',      icon: 'ClipboardList' },
    { path: ROUTES.profile,    label: 'More',      icon: 'User' },
  ],
  coach: [
    { path: ROUTES.today,              label: 'Today',          icon: 'Home' },
    { path: ROUTES.coachDashboard,     label: 'Dashboard',      icon: 'LayoutDashboard' },
    { path: ROUTES.coachStudents,      label: 'Athletes',       icon: 'Users' },
    { path: ROUTES.nutrition,          label: 'Nutrition',      icon: 'UtensilsCrossed' },
    { path: ROUTES.workouts,           label: 'Train',          icon: 'Dumbbell' },
    { path: ROUTES.body,               label: 'Body',           icon: 'TrendingUp' },
    { path: ROUTES.insights,           label: 'Progress',       icon: 'BarChart3' },
    { path: ROUTES.labExams,           label: 'Health',         icon: 'ClipboardList' },
    { path: ROUTES.social,             label: 'Social',         icon: 'MessageSquare' },
    { path: ROUTES.export,             label: 'Export',         icon: 'Download' },
    { path: ROUTES.profile,            label: 'Profile',        icon: 'User' },
  ],
  nutritionist: [
    { path: ROUTES.today,                   label: 'Today',          icon: 'Home' },
    { path: ROUTES.nutritionistDashboard,   label: 'Dashboard',      icon: 'LayoutDashboard' },
    { path: ROUTES.nutritionistClients,     label: 'Clients',        icon: 'Users' },
    { path: ROUTES.nutrition,               label: 'Nutrition',      icon: 'UtensilsCrossed' },
    { path: ROUTES.workouts,                label: 'Train',          icon: 'Dumbbell' },
    { path: ROUTES.body,                    label: 'Body',           icon: 'TrendingUp' },
    { path: ROUTES.insights,                label: 'Progress',       icon: 'BarChart3' },
    { path: ROUTES.social,                  label: 'Social',         icon: 'MessageSquare' },
    { path: ROUTES.export,                  label: 'Export',         icon: 'Download' },
    { path: ROUTES.profile,                 label: 'Profile',        icon: 'User' },
  ],
  clinician: [
    { path: ROUTES.today,                label: 'Today',          icon: 'Home' },
    { path: ROUTES.clinicianDashboard,   label: 'Dashboard',      icon: 'LayoutDashboard' },
    { path: ROUTES.clinicianPatients,    label: 'Patients',       icon: 'Users' },
    { path: ROUTES.nutrition,            label: 'Nutrition',      icon: 'UtensilsCrossed' },
    { path: ROUTES.workouts,             label: 'Train',          icon: 'Dumbbell' },
    { path: ROUTES.body,                 label: 'Body',           icon: 'TrendingUp' },
    { path: ROUTES.labExams,             label: 'Health',         icon: 'ClipboardList' },
    { path: ROUTES.insights,             label: 'Progress',       icon: 'BarChart3' },
    { path: ROUTES.social,               label: 'Social',         icon: 'MessageSquare' },
    { path: ROUTES.export,               label: 'Export',         icon: 'Download' },
    { path: ROUTES.profile,              label: 'Profile',        icon: 'User' },
  ],
  admin: [
    { path: ROUTES.today,      label: 'Today',        icon: 'Home' },
    { path: ROUTES.admin,      label: 'Admin',        icon: 'ShieldCheck' },
    { path: ROUTES.social,     label: 'Social',       icon: 'MessageSquare' },
    { path: ROUTES.profile,    label: 'Profile',      icon: 'User' },
  ],
};

/**
 * Bottom nav (mobile) — max 4 items per role, most used pages
 */
export const BOTTOM_PATHS_BY_ROLE = {
  athlete: [ROUTES.today, ROUTES.workouts, ROUTES.nutrition, ROUTES.body, ROUTES.profile],
  coach: [ROUTES.today, ROUTES.coachDashboard, ROUTES.coachStudents, ROUTES.workouts, ROUTES.profile],
  nutritionist: [ROUTES.today, ROUTES.nutritionistDashboard, ROUTES.nutritionistClients, ROUTES.nutrition, ROUTES.profile],
  clinician: [ROUTES.today, ROUTES.clinicianDashboard, ROUTES.clinicianPatients, ROUTES.body, ROUTES.profile],
  admin: [ROUTES.today, ROUTES.admin, ROUTES.social, ROUTES.profile],
  beta_tester: [ROUTES.today, ROUTES.workouts, ROUTES.nutrition, ROUTES.coachDashboard, ROUTES.profile],
};

/** Returns true if the given role can access a page */
export const canAccess = (role, page) => {
  const allowed = PAGE_ACCESS[page];
  if (!allowed) return false;
  return allowed.includes(role);
};

/** Returns nav items for a given role */
export const getNavForRole = (role) => NAV_BY_ROLE[role] || NAV_BY_ROLE.athlete;

/** Hook-friendly helper — use inside components */
export const useRBAC = (user) => {
  const role = user?.atlas_role || 'athlete';

  return {
    role,
    isVisitor:      role === 'visitor',
    isAthlete:      role === 'athlete',
    isCoach:        role === 'coach',
    isNutritionist: role === 'nutritionist',
    isClinician:    role === 'clinician',
    isAdmin:        role === 'admin',
    isBetaTester:   role === 'beta_tester',
    isStaff:        ['coach', 'nutritionist', 'clinician', 'admin'].includes(role),
    can:            (page) => canAccess(role, page),
    nav:            getNavForRole(role),
  };
};
