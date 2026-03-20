import ptBR from './translations/pt-BR.json';
import enUS from './translations/en-US.json';
import ptBROnboarding from './translations/pt-BR-onboarding.json';
import enUSOnboarding from './translations/en-US-onboarding.json';
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  getLocaleFallbackChain,
  negotiateLocale,
  normalizeLocale,
} from '../../shared/localization.js';

export const translations = {
  'pt-BR': { ...ptBR, ...ptBROnboarding },
  'en-US': { ...enUS, ...enUSOnboarding },
};

export const DEFAULT_LANGUAGE = DEFAULT_LOCALE;
export const supportedLanguages = [...SUPPORTED_LOCALES];
export const LANGUAGE_STORAGE_KEY = 'atlas_locale';
export const LEGACY_LANGUAGE_STORAGE_KEY = 'language';

export const normalizeLanguage = (lang) => {
  return normalizeLocale(lang, supportedLanguages);
};

export const detectPreferredLanguage = () => {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;

  // Respect explicitly saved preference
  const saved = normalizeLanguage(localStorage.getItem(LANGUAGE_STORAGE_KEY));
  if (saved) return saved;

  const legacySaved = normalizeLanguage(localStorage.getItem(LEGACY_LANGUAGE_STORAGE_KEY));
  if (legacySaved) return legacySaved;

  const browserPreferences = Array.isArray(navigator.languages) && navigator.languages.length > 0
    ? navigator.languages
    : [navigator.language].filter(Boolean);

  return negotiateLocale(browserPreferences, supportedLanguages, DEFAULT_LANGUAGE);
};

// Clear any previously auto-saved language and re-detect from browser.
// Call this when you want to "reset" to follow system language.
export const resetLanguageToSystem = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(LANGUAGE_STORAGE_KEY);
  localStorage.removeItem(LEGACY_LANGUAGE_STORAGE_KEY);
  const lang = detectPreferredLanguage();
  window.dispatchEvent(new CustomEvent('languageChanged', { detail: lang }));
  return lang;
};

export const getLanguage = () => {
  return detectPreferredLanguage();
};

export const setLanguage = (lang) => {
  if (typeof window === 'undefined') return;

  const normalized = normalizeLanguage(lang) || DEFAULT_LANGUAGE;
  localStorage.setItem(LANGUAGE_STORAGE_KEY, normalized);
  localStorage.setItem(LEGACY_LANGUAGE_STORAGE_KEY, normalized);
};

const getTranslationValue = (key, lang) => {
  const keys = key.split('.');

  for (const locale of getLocaleFallbackChain(lang, supportedLanguages, DEFAULT_LANGUAGE)) {
    let value = translations[locale] || translations[DEFAULT_LANGUAGE];

    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        break;
      }
    }

    if (value !== undefined) {
      return value;
    }
  }

  return undefined;
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

export const t = (key, lang = getLanguage(), params) => {
  const value = getTranslationValue(key, lang);

  if (value === undefined) {
    console.warn(`Translation key not found: ${key}`);
    return key;
  }

  return interpolate(value, params);
};
