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
};

export const ROLE_LABELS = {
  visitor:      'Visitor',
  athlete:      'Athlete',
  coach:        'Coach',
  nutritionist: 'Nutritionist',
  clinician:    'Clinician',
  admin:        'Admin',
};

export const ROLE_BADGE = {
  visitor:      'badge badge-neutral',
  athlete:      'badge badge-neutral',
  coach:        'badge badge-blue',
  nutritionist: 'badge badge-blue',
  clinician:    'badge badge-ok',
  admin:        'badge badge-err',
};

/**
 * Page-level access control.
 * Each entry lists which roles can load this page at all.
 * Fine-grained data access (per linked athlete) is handled in each page/component.
 */
export const PAGE_ACCESS = {
  // ── Athlete workspace ──────────────────────────────────
  Today:           ['athlete', 'coach', 'clinician', 'admin'],
  Diary:           ['athlete', 'admin'],
  Nutrition:       ['athlete', 'admin'],
  Workouts:        ['athlete', 'admin'],
  Protocols:       ['athlete', 'admin'],
  Measurements:    ['athlete', 'admin'],
  LabExams:        ['athlete', 'admin'],
  ProgressPhotos:  ['athlete', 'admin'],
  Body:            ['athlete', 'admin'],
  MyDiet:          ['athlete', 'admin'],
  MyWorkout:       ['athlete', 'admin'],
  MyPrescribedDiet:    ['athlete', 'admin'],
  MyPrescribedWorkout: ['athlete', 'admin'],
  ProgressReview:  ['athlete', 'admin'],
  Insights:        ['athlete', 'admin'],
  BlockReview:     ['athlete', 'admin'],
  Social:          ['athlete', 'coach', 'clinician', 'admin'],
  Export:          ['athlete', 'coach', 'clinician', 'admin'],
  Profile:         ['athlete', 'coach', 'clinician', 'admin'],

  // ── Coach area ─────────────────────────────────────────
  // Coach sees /today as a landing point (own profile/tools)
  CoachDashboard:      ['coach', 'admin'],
  CoachStudents:       ['coach', 'admin'],
  CoachStudentProfile: ['coach', 'admin'],

  // ── Nutritionist area ──────────────────────────────────
  NutritionistDashboard:      ['nutritionist', 'admin'],
  NutritionistClients:        ['nutritionist', 'admin'],
  NutritionistClientProfile:  ['nutritionist', 'admin'],

  // ── Clinician area ─────────────────────────────────────
  ClinicianDashboard:      ['clinician', 'admin'],
  ClinicianPatients:       ['clinician', 'admin'],
  ClinicianPatientProfile: ['clinician', 'admin'],

  // ── Admin only ─────────────────────────────────────────
  AdminPanel: ['admin'],
};

/**
 * Navigation definition per role.
 * Determines what shows in the sidebar/bottom nav.
 */
export const NAV_BY_ROLE = {
  athlete: [
    { path: ROUTES.today,      label: 'Today',     icon: 'Home' },
    { path: ROUTES.nutrition,  label: 'Nutrition', icon: 'UtensilsCrossed' },
    { path: ROUTES.workouts,   label: 'Train',     icon: 'Dumbbell' },
    { path: ROUTES.body,       label: 'Body',      icon: 'TrendingUp' },
    { path: ROUTES.protocols,  label: 'Plans',     icon: 'FlaskConical' },
    { path: ROUTES.insights,   label: 'Progress',  icon: 'BarChart3' },
    { path: ROUTES.progressPhotos, label: 'Photos', icon: 'Camera' },
    { path: ROUTES.labExams,   label: 'Health',    icon: 'ClipboardList' },
    { path: ROUTES.profile,    label: 'More',      icon: 'User' },
  ],
  coach: [
    { path: ROUTES.today,              label: 'Home',           icon: 'Home' },
    { path: ROUTES.coachDashboard,     label: 'Dashboard',      icon: 'LayoutDashboard' },
    { path: ROUTES.coachStudents,      label: 'Athletes',       icon: 'Users' },
    { path: ROUTES.social,             label: 'Social',         icon: 'MessageSquare' },
    { path: ROUTES.export,             label: 'Export',         icon: 'Download' },
    { path: ROUTES.profile,            label: 'Profile',        icon: 'User' },
  ],
  nutritionist: [
    { path: ROUTES.today,                    label: 'Home',         icon: 'Home' },
    { path: ROUTES.nutritionistDashboard,   label: 'Dashboard',    icon: 'LayoutDashboard' },
    { path: ROUTES.nutritionistClients,     label: 'Clients',      icon: 'Users' },
    { path: ROUTES.social,                  label: 'Social',       icon: 'MessageSquare' },
    { path: ROUTES.export,                  label: 'Export',       icon: 'Download' },
    { path: ROUTES.profile,                 label: 'Profile',      icon: 'User' },
  ],
  clinician: [
    { path: ROUTES.today,                 label: 'Home',          icon: 'Home' },
    { path: ROUTES.clinicianDashboard,   label: 'Dashboard',     icon: 'LayoutDashboard' },
    { path: ROUTES.clinicianPatients,    label: 'Patients',      icon: 'Users' },
    { path: ROUTES.social,               label: 'Social',        icon: 'MessageSquare' },
    { path: ROUTES.export,               label: 'Export',        icon: 'Download' },
    { path: ROUTES.profile,              label: 'Profile',       icon: 'User' },
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
  coach: [ROUTES.today, ROUTES.coachDashboard, ROUTES.coachStudents, ROUTES.profile],
  nutritionist: [ROUTES.today, ROUTES.nutritionistDashboard, ROUTES.nutritionistClients, ROUTES.profile],
  clinician: [ROUTES.today, ROUTES.clinicianDashboard, ROUTES.clinicianPatients, ROUTES.profile],
  admin: [ROUTES.today, ROUTES.admin, ROUTES.social, ROUTES.profile],
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
    isStaff:        ['coach', 'nutritionist', 'clinician', 'admin'].includes(role),
    can:            (page) => canAccess(role, page),
    nav:            getNavForRole(role),
  };
};
