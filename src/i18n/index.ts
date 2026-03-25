/**
 * i18n main exports
 */

export { locales, type Locale, defaultLocale, localeLabels, localeToPublicPath, publicPathToLocale, isValidLocale } from './config';
export { loadDictionary, loadDictionaryWithFallback, type Dictionary } from './dictionaries';
export { createTranslator, type Translator } from './translator';
