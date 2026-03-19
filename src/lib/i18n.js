import ptBR from './translations/pt-BR.json';
import enUS from './translations/en-US.json';

export const translations = {
  'pt-BR': ptBR,
  'en-US': enUS,
};

export const DEFAULT_LANGUAGE = 'pt-BR';
export const supportedLanguages = ['pt-BR', 'en-US'];
export const LANGUAGE_STORAGE_KEY = 'atlas_locale';
export const LEGACY_LANGUAGE_STORAGE_KEY = 'language';

export const normalizeLanguage = (lang) => {
  if (!lang || typeof lang !== 'string') return null;
  if (supportedLanguages.includes(lang)) return lang;

  const lower = lang.toLowerCase();
  if (lower.startsWith('pt')) return 'pt-BR';
  if (lower.startsWith('en')) return 'en-US';

  return null;
};

export const detectPreferredLanguage = () => {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;

  const saved = normalizeLanguage(localStorage.getItem(LANGUAGE_STORAGE_KEY));
  if (saved) return saved;

  const legacySaved = normalizeLanguage(localStorage.getItem(LEGACY_LANGUAGE_STORAGE_KEY));
  if (legacySaved) return legacySaved;

  const browserLang = normalizeLanguage(navigator.language || navigator.languages?.[0]);
  return browserLang || DEFAULT_LANGUAGE;
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

export const t = (key, lang = getLanguage()) => {
  const keys = key.split('.');
  let value = translations[lang] || translations[DEFAULT_LANGUAGE];
  
  for (const k of keys) {
    value = value?.[k];
    if (!value) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
  }
  
  return value;
};
