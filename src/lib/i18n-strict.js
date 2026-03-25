/**
 * Locale-aware translations loader
 * This module is processed at BUILD TIME, not runtime
 * Each build gets ONLY its target locale
 */

import enTranslations from './translations/en-US.json';
import enOnboarding from './translations/en-US-onboarding.json';
import ptTranslations from './translations/pt-BR.json';
import ptOnboarding from './translations/pt-BR-onboarding.json';

// BUILD-TIME LOCALE DETECTION
// Vite replaces import.meta.env.VITE_LOCALE at build time
const rawLocale = import.meta.env.VITE_LOCALE;
const buildLocale = import.meta.env.BUILD_LOCALE;

// DEBUG: Log everything about locale detection
console.log('[i18n] === LOCALE DETECTION ===');
console.log('[i18n] import.meta.env.VITE_LOCALE:', rawLocale);
console.log('[i18n] import.meta.env.BUILD_LOCALE:', buildLocale);
console.log('[i18n] import.meta.env (all keys):', Object.keys(import.meta.env || {}));
console.log('[i18n] typeof import.meta.env:', typeof import.meta.env);

// Defensive fallback - if Vite didn't replace the value, use explicit check
const BUILD_LOCALE = rawLocale || buildLocale || 'en-US';

console.log('[i18n] Final BUILD_LOCALE:', BUILD_LOCALE);

// STRICT LOCALE MAP - NO FALLBACKS
const TRANSLATIONS_BY_LOCALE = {
  'en-US': { ...enTranslations, ...enOnboarding },
  'pt-BR': { ...ptTranslations, ...ptOnboarding },
};

// Get translations for THIS BUILD ONLY
function getBuildTranslations() {
  const translations = TRANSLATIONS_BY_LOCALE[BUILD_LOCALE];
  if (!translations) {
    throw new Error(`[i18n] No translations for build locale: ${BUILD_LOCALE}`);
  }
  return translations;
}

const ACTIVE_TRANSLATIONS = getBuildTranslations();

export const DEFAULT_LANGUAGE = BUILD_LOCALE;
export const supportedLanguages = [BUILD_LOCALE]; // Only this build's locale
export const LANGUAGE_STORAGE_KEY = 'atlas_locale';

// NO-OP functions - locale is fixed at build time
export const normalizeLanguage = () => BUILD_LOCALE;
export const detectPreferredLanguage = () => BUILD_LOCALE;
export const resetLanguageToSystem = () => BUILD_LOCALE;
export const getLanguage = () => BUILD_LOCALE;
export const setLanguage = () => { /* Build-time locale - cannot change */ };

// Strict translation lookup - NO FALLBACK
function getTranslationValue(key) {
  const keys = key.split('.');
  let value = ACTIVE_TRANSLATIONS;

  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) {
      // In development, warn. In production, return empty string
      if (import.meta.env.DEV) {
        console.warn(`[i18n] Missing translation key: "${key}" for locale: ${BUILD_LOCALE}`);
      }
      return ''; // EMPTY STRING - no fallback to other locale
    }
  }

  return value;
}

function interpolate(template, params = {}) {
  if (typeof template !== 'string' || !params || typeof params !== 'object') {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (_, token) => {
    if (params[token] === undefined || params[token] === null) {
      return `{${token}}`;
    }
    return String(params[token]);
  });
}

/**
 * Translation function - ONLY uses build-time locale
 * @param {string} key - Dot-notation path to translation
 * @param {Object} params - Interpolation parameters
 * @returns {string} Translated string (or empty if missing)
 */
export const t = (key, _ignoredLocale, params) => {
  const value = getTranslationValue(key);
  
  if (value === undefined || value === '') {
    if (import.meta.env.DEV) {
      console.error(`[i18n] CRITICAL: Missing translation "${key}" in ${BUILD_LOCALE}`);
    }
    return ''; // NEVER return the key or fallback
  }

  return interpolate(value, params);
};

/**
 * Validate all required keys exist (call at app startup in dev)
 */
export function validateTranslations(requiredKeys) {
  if (!import.meta.env.DEV) return;
  
  const missing = [];
  for (const key of requiredKeys) {
    if (!getTranslationValue(key)) {
      missing.push(key);
    }
  }
  
  if (missing.length > 0) {
    console.error(`[i18n] Missing ${missing.length} translations in ${BUILD_LOCALE}:`, missing);
  }
}
