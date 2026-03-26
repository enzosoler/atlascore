/**
 * analytics.js — Unified analytics layer for atlas.core
 *
 * Uses @capacitor-community/firebase-analytics for native (iOS/Android)
 * and falls back to Firebase JS SDK for Web.
 *
 * Usage:
 *   import { analytics } from '@/lib/analytics';
 *   analytics.logEvent('workout_completed', { duration: 45 });
 *   analytics.setUserId('user_abc');
 *
 * Setup:
 *   - Web: Set VITE_FIREBASE_* env vars (see .env.example)
 *   - iOS: Add GoogleService-Info.plist to ios/App/App/
 *   - Android: Add google-services.json to android/app/
 */

import { Capacitor } from '@capacitor/core';

// ---------------------------------------------------------------------------
// Firebase web config from environment variables
// ---------------------------------------------------------------------------
const firebaseWebConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
let _initialized = false;
let _enabled = true;
let _plugin = null; // Capacitor plugin reference (lazy-loaded)

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function isNative() {
  return Capacitor.isNativePlatform();
}

function hasWebConfig() {
  return !!(firebaseWebConfig.apiKey && firebaseWebConfig.projectId);
}

/**
 * Lazily load the Capacitor Firebase Analytics plugin.
 * Returns null on web (the plugin is only used on native).
 */
async function getPlugin() {
  if (_plugin) return _plugin;

  if (isNative()) {
    try {
      const mod = await import('@capacitor-community/firebase-analytics');
      _plugin = mod.FirebaseAnalytics;
      return _plugin;
    } catch (err) {
      console.warn('[Analytics] Failed to load native plugin:', err);
      return null;
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Initialize analytics. Must be called once at app startup.
 *
 * - On native (iOS/Android): the SDK auto-initializes from the config files
 *   (GoogleService-Info.plist / google-services.json). We just call
 *   initializeFirebase() with an empty config to satisfy the plugin.
 *
 * - On web: we pass the Firebase web config so the JS SDK boots up.
 */
async function initialize() {
  if (_initialized) return;

  try {
    const plugin = await getPlugin();

    if (isNative() && plugin) {
      // Native: SDK reads from GoogleService-Info.plist / google-services.json
      // No web config needed, but we still call initializeFirebase for the plugin
      _initialized = true;
      console.log('[Analytics] Native Firebase Analytics initialized');
    } else if (hasWebConfig()) {
      // Web: initialize with Firebase web config
      if (plugin) {
        await plugin.initializeFirebase(firebaseWebConfig);
      }
      _initialized = true;
      console.log('[Analytics] Web Firebase Analytics initialized');
    } else {
      console.warn(
        '[Analytics] Firebase config not found. Analytics will be disabled.\n' +
        'Set VITE_FIREBASE_* env vars for web analytics.'
      );
      _enabled = false;
    }
  } catch (err) {
    console.error('[Analytics] Initialization failed:', err);
    _enabled = false;
  }
}

/**
 * Log a custom event.
 * @param {string} name  — Event name (e.g. 'workout_completed')
 * @param {Object} [params] — Key/value pairs (max 25 per event)
 */
async function logEvent(name, params = {}) {
  if (!_enabled || !_initialized) return;

  try {
    const plugin = await getPlugin();
    if (plugin) {
      await plugin.logEvent({ name, params });
    }
  } catch (err) {
    console.warn('[Analytics] logEvent failed:', err);
  }
}

/**
 * Set the current screen name for screen-view tracking.
 * @param {string} screenName — Human-readable screen name
 * @param {string} [screenClass] — Optional screen class override
 */
async function setScreenName(screenName, screenClass) {
  if (!_enabled || !_initialized) return;

  try {
    const plugin = await getPlugin();
    if (plugin) {
      await plugin.setScreenName({
        screenName,
        nameOverride: screenClass || screenName,
      });
    }
  } catch (err) {
    console.warn('[Analytics] setScreenName failed:', err);
  }
}

/**
 * Set the user ID for cross-device / cross-platform attribution.
 * @param {string|null} userId — Unique user identifier, or null to clear
 */
async function setUserId(userId) {
  if (!_enabled || !_initialized) return;

  try {
    const plugin = await getPlugin();
    if (plugin) {
      await plugin.setUserId({ userId: userId || '' });
    }
  } catch (err) {
    console.warn('[Analytics] setUserId failed:', err);
  }
}

/**
 * Set a custom user property.
 * @param {string} name  — Property name
 * @param {string} value — Property value
 */
async function setUserProperty(name, value) {
  if (!_enabled || !_initialized) return;

  try {
    const plugin = await getPlugin();
    if (plugin) {
      await plugin.setUserProperty({ name, value: String(value) });
    }
  } catch (err) {
    console.warn('[Analytics] setUserProperty failed:', err);
  }
}

/**
 * Enable or disable analytics collection at runtime.
 * Useful for GDPR/consent management.
 * @param {boolean} enabled
 */
async function setCollectionEnabled(enabled) {
  _enabled = enabled;

  try {
    const plugin = await getPlugin();
    if (plugin) {
      await plugin.setCollectionEnabled({ enabled });
    }
  } catch (err) {
    console.warn('[Analytics] setCollectionEnabled failed:', err);
  }
}

/**
 * Reset the analytics data and app instance ID.
 */
async function reset() {
  try {
    const plugin = await getPlugin();
    if (plugin) {
      await plugin.reset();
    }
  } catch (err) {
    console.warn('[Analytics] reset failed:', err);
  }
}

// ---------------------------------------------------------------------------
// Pre-defined event helpers (convenience wrappers)
// ---------------------------------------------------------------------------

/** Track a page/screen view (used by the router integration) */
function trackPageView(pagePath, pageTitle) {
  return logEvent('page_view', {
    page_path: pagePath,
    page_title: pageTitle || pagePath,
  });
}

/** Track user sign-up */
function trackSignUp(method = 'email') {
  return logEvent('sign_up', { method });
}

/** Track user login */
function trackLogin(method = 'email') {
  return logEvent('login', { method });
}

/** Track a workout being completed */
function trackWorkoutCompleted(params = {}) {
  return logEvent('workout_completed', params);
}

/** Track a food log entry */
function trackFoodLogged(params = {}) {
  return logEvent('food_logged', params);
}

/** Track a measurement being recorded */
function trackMeasurementRecorded(params = {}) {
  return logEvent('measurement_recorded', params);
}

/** Track onboarding step completion */
function trackOnboardingStep(step, params = {}) {
  return logEvent('onboarding_step', { step, ...params });
}

/** Track subscription-related events */
function trackSubscription(action, params = {}) {
  return logEvent('subscription_action', { action, ...params });
}

/** Track feature usage */
function trackFeatureUsed(feature, params = {}) {
  return logEvent('feature_used', { feature, ...params });
}

/** Track share action */
function trackShare(contentType, itemId, method) {
  return logEvent('share', {
    content_type: contentType,
    item_id: itemId,
    method: method || 'unknown',
  });
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------
export const analytics = {
  initialize,
  logEvent,
  setScreenName,
  setUserId,
  setUserProperty,
  setCollectionEnabled,
  reset,

  // Convenience helpers
  trackPageView,
  trackSignUp,
  trackLogin,
  trackWorkoutCompleted,
  trackFoodLogged,
  trackMeasurementRecorded,
  trackOnboardingStep,
  trackSubscription,
  trackFeatureUsed,
  trackShare,
};

export default analytics;
