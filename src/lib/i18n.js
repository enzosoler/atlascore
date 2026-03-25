import en from './translations/en-US.json';
import enOnb from './translations/en-US-onboarding.json';
import pt from './translations/pt-BR.json';
import ptOnb from './translations/pt-BR-onboarding.json';

// BUILD-TIME LOCALE DETECTION
const BUILD_LOCALE = import.meta.env.VITE_LOCALE || 'en-US';
const IS_PT = BUILD_LOCALE === 'pt-BR';

// DEBUG LOGS - visible in browser console
console.log('[i18n] === BUILD INFO ===');
console.log('[i18n] VITE_LOCALE:', import.meta.env.VITE_LOCALE);
console.log('[i18n] BUILD_LOCALE:', BUILD_LOCALE);
console.log('[i18n] IS_PT:', IS_PT);

// Load translations based on build locale
const translations = IS_PT 
  ? { ...pt, ...ptOnb }
  : { ...en, ...enOnb };

console.log('[i18n] Loaded translations for:', IS_PT ? 'pt-BR' : 'en-US');
console.log('[i18n] Sample key (common.appName):', translations.common?.appName || 'NOT FOUND');

// Export locale functions
export const getLanguage = () => BUILD_LOCALE;
export const DEFAULT_LANGUAGE = BUILD_LOCALE;
export const supportedLanguages = [BUILD_LOCALE];
export const setLanguage = () => { console.log('[i18n] setLanguage called - ignored (build-time locale)'); };
export const normalizeLanguage = () => BUILD_LOCALE;
export const detectPreferredLanguage = () => BUILD_LOCALE;
export const resetLanguageToSystem = () => BUILD_LOCALE;

// Translation lookup
const getVal = (key) => {
  const keys = key.split('.');
  let val = translations;
  for (const k of keys) {
    val = val?.[k];
    if (val === undefined) {
      if (import.meta.env.DEV) {
        console.warn(`[i18n] Missing key: "${key}"`);
      }
      return '';
    }
  }
  return val;
};

// Translation function
export const t = (key, _ignoredLocale, params) => {
  const val = getVal(key);
  if (!val) {
    if (import.meta.env.DEV) {
      console.error(`[i18n] CRITICAL: Missing "${key}"`);
    }
    return '';
  }
  if (!params) return val;
  return val.replace(/\{(\w+)\}/g, (_, t) => params[t] ?? `{${t}}`);
};
