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
const BUILD_LOCALE = import.meta.env.VITE_LOCALE || 'en-US';

// DEBUG: Log the build locale in production
console.log('[i18n] Build locale:', BUILD_LOCALE);
console.log('[i18n] VITE_LOCALE env:', import.meta.env.VITE_LOCALE);
console.log('[i18n] BUILD_LOCALE env:', import.meta.env.BUILD_LOCALE);

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
