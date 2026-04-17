/**
 * Premium Locks / Feature Entitlements
 * Define what features are available in each plan
 */

export const FEATURE_LOCKS = {
  // AI Food Logging
  ai_food_text: {
    label: 'AI food logging',
    minPlan: 'free',
    limits: { free: '5/day', pro: '30/day', performance: '50/day' },
    description: 'Describe what you ate and AI fills in the macros',
  },
  ai_food_photo: {
    label: 'Photo food scanner',
    minPlan: 'pro',
    limits: { pro: '5/day', performance: '15/day' },
    description: 'Take a photo of your meal and AI detects foods and macros',
  },

  // Insights
  atlas_ai: {
    label: 'Insights',
    minPlan: 'pro',
    description: 'Weekly summaries, trend reading, and next-step guidance from your data',
  },

  // Plan builder
  ai_workout_generation: {
    label: 'Workout plan builder',
    minPlan: 'pro',
    description: 'Create structured workouts from your profile',
  },
  ai_diet_generation: {
    label: 'Meal plan builder',
    minPlan: 'pro',
    description: 'Create structured meal plans from your profile',
  },

  // Labs
  lab_exams: {
    label: 'Lab exams',
    minPlan: 'pro',
    description: 'Track labs and health markers',
  },

  // Progress
  progress_photos: {
    label: 'Progress photos',
    minPlan: 'pro',
    limits: { free: 5, pro: 'unlimited' },
    description: 'Unlimited photos on Pro and above (5 on Free)',
  },

  // History
  history: {
    label: 'Full history',
    minPlan: 'pro',
    limits: { free: '30 days', pro: '1 year', performance: 'unlimited' },
  },

  // Analytics
  advanced_analytics: {
    label: 'Advanced analytics',
    minPlan: 'pro',
  },

  // Exports
  standard_exports: {
    label: 'Data export (PDF/CSV)',
    minPlan: 'pro',
  },
  premium_exports: {
    label: 'Premium reports',
    minPlan: 'performance',
  },

  // Protocol tracking
  advanced_protocol_tracking: {
    label: 'Advanced protocol tracking',
    minPlan: 'performance',
    description: 'Half-life curves, next dose, stock alerts',
  },

  // Dose timeline
  dose_timeline: {
    label: 'Dose timeline',
    minPlan: 'performance',
  },

  // Professional dashboards
  coach_dashboard: {
    label: 'Coach Dashboard',
    minPlan: 'coach',
    roles: ['coach'],
  },
  nutritionist_dashboard: {
    label: 'Nutritionist dashboard',
    minPlan: 'nutritionist',
    roles: ['nutritionist'],
  },
  clinician_dashboard: {
    label: 'Clinician Dashboard',
    minPlan: 'clinician',
    roles: ['clinician'],
  },

  // Admin
  admin_panel: {
    label: 'Admin Panel',
    minPlan: 'admin',
    roles: ['admin'],
  },

  // Social
  social_cards: {
    label: 'Social cards',
    minPlan: 'free',
  },

  // Macro view
  macro_view_premium: {
    label: 'Macro View Premium',
    minPlan: 'pro',
  },
};

// Plan labels for UI
export const PLAN_LABELS = {
  free: 'Free',
  pro: 'Pro',
  performance: 'Performance',
  coach: 'Coach',
  nutritionist: 'Nutritionist',
  clinician: 'Clinician',
  admin: 'Admin',
};

// Feature labels extracted from FEATURE_LOCKS
export const FEATURE_LABELS = Object.fromEntries(
  Object.entries(FEATURE_LOCKS).map(([key, lock]) => [key, lock.label])
);

// Plan levels — single-tier pricing (pro unlocks everything performance did)
export const PLAN_LEVELS = {
  free: 0,
  pro: 2,
  premium: 2,
  performance: 2,
  internal: 2,
  custom: 2,
  coach: 3,
  nutritionist: 3,
  clinician: 3,
  admin: 999,
};

/**
 * Check if user can access a feature
 * @param {Object} user - User object with atlas_role
 * @param {Object} subscription - Active subscription with plan_code
 * @param {Array} overrides - Entitlement overrides
 * @param {string} feature - Feature key to check
 */
export function hasFeatureAccess(user, subscription, overrides, feature) {
  if (user?.atlas_role === 'admin') return true;
  if (user?.atlas_role === 'beta_tester' && feature !== 'admin_panel') return true;

  const lock = FEATURE_LOCKS[feature];
  if (!lock) {
    console.warn(`[entitlements] Unknown feature key: "${feature}" — denying access. Add it to FEATURE_LOCKS.`);
    return false;
  }

  // Check overrides first
  const override = overrides?.find(o => o.feature_key === feature && o.enabled);
  if (override) return true;

  // Role-based features
  if (lock.roles && !lock.roles.includes(user?.atlas_role)) {
    return false;
  }

  // Plan-based features
  const userPlanCode = subscription?.tier || subscription?.plan_code || 'free';
  const userLevel = PLAN_LEVELS[userPlanCode] || 0;
  const minLevel = PLAN_LEVELS[lock.minPlan] || 0;

  return userLevel >= minLevel;
}

/**
 * Legacy function for simple plan-level checks
 */
export function canAccessFeature(feature, userPlanCode, userRole = null) {
  if (userRole === 'admin') return true;

  const lock = FEATURE_LOCKS[feature];
  if (!lock) {
    console.warn(`[entitlements] Unknown feature key: "${feature}" — denying access.`);
    return false;
  }

  if (lock.roles && !lock.roles.includes(userRole)) {
    return false;
  }

  const userLevel = PLAN_LEVELS[userPlanCode] || 0;
  const minLevel = PLAN_LEVELS[lock.minPlan] || 0;

  return userLevel >= minLevel;
}
