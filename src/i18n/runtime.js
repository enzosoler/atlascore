import { defaultLocale, isValidLocale, publicPathToLocale } from './config';

export const LOCALE_STORAGE_KEY = 'atlas_locale';

export function getBuildLocale() {
  const buildLocale = import.meta.env.VITE_LOCALE;
  if (buildLocale === 'pt-BR') return 'pt-BR';
  if (buildLocale === 'en-US') return 'en';
  if (buildLocale === 'es') return 'es';
  return null;
}

export function getStoredLocale() {
  if (typeof window === 'undefined') return null;
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    return stored && isValidLocale(stored) ? stored : null;
  } catch {
    return null;
  }
}

export function storeLocale(locale) {
  if (typeof window === 'undefined' || !isValidLocale(locale)) return;
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // no-op
  }
}

export function getLocaleFromPath(pathname = '/') {
  const buildLocale = getBuildLocale();
  if (buildLocale) return buildLocale;

  const parts = pathname.split('/').filter(Boolean);
  const firstSegment = parts[0];
  if (firstSegment) {
    const locale = publicPathToLocale(firstSegment);
    if (locale && isValidLocale(locale)) return locale;
  }

  return getStoredLocale() || defaultLocale;
}

export function detectPreferredLocale(pathname = typeof window !== 'undefined' ? window.location.pathname : '/') {
  return getLocaleFromPath(pathname);
}
