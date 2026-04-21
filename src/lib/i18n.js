import { getDictionarySync } from '@/i18n/dictionaries';
import { createTranslator } from '@/i18n/translator';
import { detectPreferredLocale, getBuildLocale } from '@/i18n/runtime';

const locale = detectPreferredLocale();
const dictionary = getDictionarySync(locale);
const translate = createTranslator(dictionary);

export const getLanguage = () => locale;
export const DEFAULT_LANGUAGE = getBuildLocale() || locale;
export const supportedLanguages = ['en', 'pt-BR', 'es'];
export const setLanguage = () => {};
export const normalizeLanguage = () => locale;
export const detectPreferredLanguage = () => locale;
export const resetLanguageToSystem = () => locale;

export const t = (key, _ignoredLocale, params) => translate(key, params);
