/**
 * useAnalytics — React hook for analytics in atlas.core
 *
 * Provides:
 *   - Automatic page-view tracking on route changes
 *   - Automatic user identification when auth state changes
 *   - Convenience methods for logging events from components
 *
 * Usage:
 *   const { logEvent, trackFeatureUsed } = useAnalytics();
 *   logEvent('button_clicked', { button: 'save_workout' });
 */

import { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { analytics } from '@/lib/analytics';

// ---------------------------------------------------------------------------
// Route-to-screen-name mapping
// ---------------------------------------------------------------------------
const ROUTE_NAMES = {
  '/': 'Landing',
  '/auth': 'Auth',
  '/login': 'Auth',
  '/signup': 'Auth',
  '/Pricing': 'Pricing',
  '/help': 'HelpCenter',
  '/blog': 'Blog',
  '/Today': 'Today',
  '/Nutrition': 'Nutrition',
  '/Workouts': 'Workouts',
  '/Routines': 'Routines',
  '/Protocols': 'Protocols',
  '/Measurements': 'Measurements',
  '/LabExams': 'LabExams',
  '/Insights': 'Insights',
  '/ProgressReview': 'ProgressReview',
  '/Progress': 'Progress',
  '/body': 'Body',
  '/Profile': 'Profile',
  '/Settings': 'Settings',
  '/Exercises': 'Exercises',
  '/my-diet': 'MyDiet',
  '/my-workout': 'MyWorkout',
  '/manual-workout': 'ManualWorkout',
  '/diary': 'Diary',
  '/progress-photos': 'ProgressPhotos',
  '/social': 'Social',
  '/Onboarding': 'Onboarding',
  '/Export': 'Export',
  '/coach-dashboard': 'CoachDashboard',
  '/coach/students': 'CoachStudents',
  '/nutritionist-dashboard': 'NutritionistDashboard',
  '/nutritionist/clients': 'NutritionistClients',
  '/clinician-dashboard': 'ClinicianDashboard',
  '/clinician/patients': 'ClinicianPatients',
  '/AdminPanel': 'AdminPanel',
  '/upgrade': 'UpgradePrompts',
  '/billing': 'BillingManagement',
  '/checkout': 'Checkout',
  '/referral': 'Referral',
  '/achievements': 'Achievements',
  '/calendar': 'Calendar',
  '/leaderboard': 'Leaderboard',
  '/prescribed-diet': 'PrescribedDiet',
  '/prescribed-workout': 'PrescribedWorkout',
  '/block-review': 'BlockReview',
  '/github-prs': 'GitHubPRTracker',
  '/start': 'StoryLanding',
  '/share-target': 'ShareTarget',
  '/splash': 'SplashScreen',
  '/welcome': 'WelcomeScreen',
  '/onboarding/goal-selection': 'GoalSelection',
  '/onboarding/preferences': 'Preferences',
  '/onboarding/setup-input': 'SetupInput',
  '/onboarding/value-creation': 'ValueCreation',
  '/onboarding/preview-result': 'PreviewResult',
  '/onboarding/pre-paywall': 'PrePaywall',
};

function getScreenName(pathname) {
  // Exact match first
  if (ROUTE_NAMES[pathname]) return ROUTE_NAMES[pathname];

  // Prefix match for dynamic routes (e.g. /coach/student/:id)
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length >= 2) {
    const prefix = `/${segments[0]}/${segments[1]}`;
    if (ROUTE_NAMES[prefix]) return ROUTE_NAMES[prefix];
  }
  if (segments.length >= 1) {
    const prefix = `/${segments[0]}`;
    if (ROUTE_NAMES[prefix]) return ROUTE_NAMES[prefix];
  }

  // Fallback: capitalize the last segment
  const last = segments[segments.length - 1] || 'Unknown';
  return last.charAt(0).toUpperCase() + last.slice(1).replace(/-/g, '');
}

// ---------------------------------------------------------------------------
// Hook: usePageTracking
// ---------------------------------------------------------------------------

/**
 * Automatically tracks page views on route changes.
 * Should be used once at the app level (inside the Router).
 */
export function usePageTracking() {
  const location = useLocation();
  const prevPathRef = useRef(null);

  useEffect(() => {
    const path = location.pathname;

    // Avoid duplicate tracking for the same path
    if (path === prevPathRef.current) return;
    prevPathRef.current = path;

    const screenName = getScreenName(path);
    analytics.setScreenName(screenName);
    analytics.trackPageView(path, screenName);
  }, [location.pathname]);
}

// ---------------------------------------------------------------------------
// Hook: useAnalyticsIdentify
// ---------------------------------------------------------------------------

/**
 * Identifies the user in analytics when auth state changes.
 * @param {Object|null} user — The authenticated user object from AuthContext
 */
export function useAnalyticsIdentify(user) {
  useEffect(() => {
    if (user?.id) {
      analytics.setUserId(user.id);
      if (user.atlas_role) {
        analytics.setUserProperty('atlas_role', user.atlas_role);
      }
      if (user.email) {
        // Hash or use domain only for privacy — here we just set the role
        analytics.setUserProperty('has_email', 'true');
      }
    } else {
      analytics.setUserId(null);
    }
  }, [user?.id, user?.atlas_role, user?.email]);
}

// ---------------------------------------------------------------------------
// Hook: useAnalytics (main hook)
// ---------------------------------------------------------------------------

/**
 * Main analytics hook for use in any component.
 * Returns stable references to analytics methods.
 */
export function useAnalytics() {
  const logEvent = useCallback((name, params) => {
    return analytics.logEvent(name, params);
  }, []);

  const trackFeatureUsed = useCallback((feature, params) => {
    return analytics.trackFeatureUsed(feature, params);
  }, []);

  const trackWorkoutCompleted = useCallback((params) => {
    return analytics.trackWorkoutCompleted(params);
  }, []);

  const trackFoodLogged = useCallback((params) => {
    return analytics.trackFoodLogged(params);
  }, []);

  const trackMeasurementRecorded = useCallback((params) => {
    return analytics.trackMeasurementRecorded(params);
  }, []);

  const trackOnboardingStep = useCallback((step, params) => {
    return analytics.trackOnboardingStep(step, params);
  }, []);

  const trackSubscription = useCallback((action, params) => {
    return analytics.trackSubscription(action, params);
  }, []);

  const trackShare = useCallback((contentType, itemId, method) => {
    return analytics.trackShare(contentType, itemId, method);
  }, []);

  return {
    logEvent,
    trackFeatureUsed,
    trackWorkoutCompleted,
    trackFoodLogged,
    trackMeasurementRecorded,
    trackOnboardingStep,
    trackSubscription,
    trackShare,
  };
}

export default useAnalytics;
