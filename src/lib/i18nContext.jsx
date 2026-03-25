import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { defaultLocale, localeToPublicPath, isValidLocale } from '@/i18n/config';
import { loadDictionaryWithFallback } from '@/i18n/dictionaries';
import { createTranslator } from '@/i18n/translator';

const I18nContext = createContext(null);

/**
 * Detect locale from the build-time env variable (set by vite.config.i18n.js)
 * or fall back to parsing the browser URL.
 * When BrowserRouter has basename="/br/", useLocation().pathname strips the prefix,
 * so we rely on the build locale instead.
 */
function getBuildLocale() {
  const buildLocale = import.meta.env.VITE_LOCALE;
  if (buildLocale === 'pt-BR') return 'pt-BR';
  if (buildLocale === 'en-US') return 'en';
  return null;
}

function getLocaleFromPath(pathname) {
  // First check build-time locale (reliable for /br/ builds with basename)
  const buildLocale = getBuildLocale();
  if (buildLocale) return buildLocale;

  // Fallback: parse from path (for dev mode or non-i18n builds)
  const parts = pathname.split('/').filter(Boolean);
  const firstSegment = parts[0];
  if (firstSegment === 'en') return 'en';
  if (firstSegment === 'pt' || firstSegment === 'br') return 'pt-BR';
  return defaultLocale;
}

function buildPathWithLocale(pathname, targetLocale) {
  // When switching locales, we need to navigate to a full URL
  // because the other locale lives on a different base path
  if (targetLocale === 'pt-BR') {
    // Strip any existing locale prefix and build /br/ path
    const parts = pathname.split('/').filter(Boolean);
    const currentFirst = parts[0];
    const hasLocalePrefix = currentFirst === 'en' || currentFirst === 'pt' || currentFirst === 'br';
    const cleanParts = hasLocalePrefix ? parts.slice(1) : parts;
    return '/br/' + cleanParts.join('/');
  } else {
    // English: strip locale prefix and go to root
    const parts = pathname.split('/').filter(Boolean);
    const currentFirst = parts[0];
    const hasLocalePrefix = currentFirst === 'en' || currentFirst === 'pt' || currentFirst === 'br';
    const cleanParts = hasLocalePrefix ? parts.slice(1) : parts;
    return '/' + cleanParts.join('/');
  }
}

export function I18nProvider({ children }) {
  const location = useLocation();
  const [locale, setLocaleState] = useState(() => getLocaleFromPath(location.pathname));
  const [dictionary, setDictionary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      try {
        const dict = await loadDictionaryWithFallback(locale);
        if (!cancelled) setDictionary(dict);
      } catch (err) {
        console.error('[i18n] Failed to load dictionary:', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [locale]);

  useEffect(() => {
    const newLocale = getLocaleFromPath(location.pathname);
    if (newLocale !== locale && isValidLocale(newLocale)) {
      setLocaleState(newLocale);
    }
  }, [location.pathname, locale]);

  const t = useMemo(() => {
    if (!dictionary) return (key) => key;
    return createTranslator(dictionary);
  }, [dictionary]);

  const setLocale = useCallback((newLocale) => {
    if (isValidLocale(newLocale)) setLocaleState(newLocale);
  }, []);

  const switchLocale = useCallback((targetLocale) => {
    // For locale switching between /br/ and /, we need a full page navigation
    // because each locale is a separate build with its own basename
    const newPath = buildPathWithLocale(location.pathname, targetLocale);
    window.location.href = newPath;
    return newPath;
  }, [location.pathname]);

  const value = { locale, t, dictionary: dictionary || {}, isLoading, setLocale, switchLocale, getTranslation: (key) => {
    const keys = key.split('.');
    let value = dictionary || {};
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) return null;
    }
    return value;
  } };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within I18nProvider');
  return context;
}

export function useT() {
  const { t } = useI18n();
  return t;
}
