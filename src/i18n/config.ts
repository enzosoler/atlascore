/**
 * i18n Configuration
 * Single source of truth for locales
 */

export const locales = ['en', 'pt-BR', 'es'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeLabels: Record<Locale, string> = {
  en: 'English',
  'pt-BR': 'Português (Brasil)',
  es: 'Español',
};

// Public URL mapping: /pt/ maps to pt-BR internally
export const publicLocaleMap: Record<string, Locale> = {
  'en': 'en',
  'pt': 'pt-BR',
  'es': 'es',
};

export const localeToPublicPath = (locale: Locale): string => {
  if (locale === 'pt-BR') return 'pt';
  return locale;
};

export const publicPathToLocale = (path: string): Locale => {
  return publicLocaleMap[path] || defaultLocale;
};

export const isValidLocale = (locale: string): locale is Locale => {
  return locales.includes(locale as Locale);
};
