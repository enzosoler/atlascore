import enUS from './translations/en-US.json';
import enUSOnboarding from './translations/en-US-onboarding.json';

export const translations = {
  'en-US': { ...enUS, ...enUSOnboarding },
};

export const DEFAULT_LANGUAGE = 'en-US';
export const supportedLanguages = ['en-US'];
export const LANGUAGE_STORAGE_KEY = 'atlas_locale';
export const LEGACY_LANGUAGE_STORAGE_KEY = 'language';

export const normalizeLanguage = (lang) => {
  return 'en-US';
};

export const detectPreferredLanguage = () => {
  return 'en-US';
};

// No-op: language is always en-US
export const resetLanguageToSystem = () => {
  if (typeof window === 'undefined') return 'en-US';
  window.dispatchEvent(new CustomEvent('languageChanged', { detail: 'en-US' }));
  return 'en-US';
};

export const getLanguage = () => {
  return 'en-US';
};

export const setLanguage = (lang) => {
  // No-op: language is always en-US
};

const getTranslationValue = (key) => {
  const keys = key.split('.');
  let value = translations['en-US'];

  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) break;
  }

  return value;
};

const interpolate = (template, params = {}) => {
  if (typeof template !== 'string' || !params || typeof params !== 'object') {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (_, token) => {
    if (params[token] === undefined || params[token] === null) {
      return `{${token}}`;
    }

    return String(params[token]);
  });
};

export const t = (key, _lang, params) => {
  const value = getTranslationValue(key);

  if (value === undefined) {
    console.warn(`Translation key not found: ${key}`);
    return key;
  }

  return interpolate(value, params);
};
