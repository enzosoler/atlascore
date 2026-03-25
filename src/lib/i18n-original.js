import enUS from './translations/en-US.json';
import enUSOnboarding from './translations/en-US-onboarding.json';
import ptBR from './translations/pt-BR.json';
import ptBROnboarding from './translations/pt-BR-onboarding.json';

const BUILD_LOCALE = import.meta.env.VITE_LOCALE || 'en-US';
const IS_PT = BUILD_LOCALE === 'pt-BR';

export const translations = {
  'en-US': { ...enUS, ...enUSOnboarding },
  'pt-BR': { ...ptBR, ...ptBROnboarding },
};

export const DEFAULT_LANGUAGE = BUILD_LOCALE;
export const supportedLanguages = [BUILD_LOCALE];
export const LANGUAGE_STORAGE_KEY = 'atlas_locale';
export const LEGACY_LANGUAGE_STORAGE_KEY = 'language';

export const normalizeLanguage = (lang) => {
  return BUILD_LOCALE;
};

export const detectPreferredLanguage = () => {
  return BUILD_LOCALE;
};

// No-op: language is fixed at build time
export const resetLanguageToSystem = () => {
  if (typeof window === 'undefined') return BUILD_LOCALE;
  window.dispatchEvent(new CustomEvent('languageChanged', { detail: BUILD_LOCALE }));
  return BUILD_LOCALE;
};

export const getLanguage = () => {
  return BUILD_LOCALE;
};

export const setLanguage = (lang) => {
  // No-op: language is always en-US
};

const getTranslationValue = (key) => {
  const keys = key.split('.');
  let value = translations[BUILD_LOCALE];

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
