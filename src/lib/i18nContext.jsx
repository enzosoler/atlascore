import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { defaultLocale, isValidLocale } from '@/i18n/config';
import { getDictionarySync } from '@/i18n/dictionaries';
import { createTranslator } from '@/i18n/translator';
import { getBuildLocale, getStoredLocale, getLocaleFromPath, LOCALE_STORAGE_KEY, storeLocale } from '@/i18n/runtime';

const I18nContext = createContext(null);

/**
 * Browser language detection is intentionally disabled.
 * Marketing page content is not yet fully wired through t(), so auto-detecting
 * Portuguese from the device/browser produces a mixed-language UI (PT nav + EN body).
 * Default to 'en' and let users pick PT explicitly via the toggle or the /br/ build.
 */
function getBrowserLocale() {
  return defaultLocale;
}

/**
 * Resolve the initial locale with this priority:
 * 1. Build-time locale (for /br/ builds)
 * 2. localStorage (user's previous explicit choice)
 * 3. URL path segment (/br/ or /pt/)
 * 4. Browser language (navigator.language)
 * 5. Default locale ('en')
 */
function resolveInitialLocale(pathname) {
  // 1. Build-time locale
  const buildLocale = getBuildLocale();
  if (buildLocale) {
    storeLocale(buildLocale);
    return buildLocale;
  }

  // 2. localStorage
  const stored = getStoredLocale();
  if (stored) return stored;

  // 3. URL path
  const parts = pathname.split('/').filter(Boolean);
  const firstSegment = parts[0];
  if (firstSegment === 'pt' || firstSegment === 'br') {
    storeLocale('pt-BR');
    return 'pt-BR';
  }
  if (firstSegment === 'en') {
    storeLocale('en');
    return 'en';
  }

  // 4. Browser language
  const browserLocale = getBrowserLocale();
  storeLocale(browserLocale);
  return browserLocale;
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
  const [locale, setLocaleState] = useState(() => resolveInitialLocale(location.pathname));
  const [dictionary, setDictionary] = useState(() => getDictionarySync(locale));
  const [isLoading] = useState(false);

  useEffect(() => {
    setDictionary(getDictionarySync(locale));
  }, [locale]);

  useEffect(() => {
    const newLocale = getLocaleFromPath(location.pathname);
    if (newLocale !== locale && isValidLocale(newLocale)) {
      setLocaleState(newLocale);
      storeLocale(newLocale);
    }
  }, [location.pathname, locale]);

  // Persist locale changes to localStorage
  useEffect(() => {
    storeLocale(locale);
  }, [locale]);

  const t = useMemo(() => {
    if (!dictionary) return (key) => key;
    return createTranslator(dictionary);
  }, [dictionary]);

  const setLocale = useCallback((newLocale) => {
    if (isValidLocale(newLocale)) {
      setLocaleState(newLocale);
      storeLocale(newLocale);
    }
  }, []);

  const switchLocale = useCallback((targetLocale) => {
    if (!isValidLocale(targetLocale)) return null;

    // Persist the choice before navigating
    storeLocale(targetLocale);

    // Check if we're in a build with basename (e.g., /br/ build)
    const buildLocale = getBuildLocale();
    if (buildLocale) {
      // We're in a locale-specific build — need full page navigation
      // Read pathname directly to avoid stale closure
      const currentPath = window.location.pathname;
      const newPath = buildPathWithLocale(currentPath, targetLocale);
      window.location.href = newPath;
      return newPath;
    }

    // In the main (EN) build, just update the locale in-place
    // No need for full page navigation — the dictionary will reload
    setLocaleState(targetLocale);
    return null;
  }, []);

  const value = useMemo(() => ({
    locale,
    t,
    dictionary: dictionary || {},
    isLoading,
    setLocale,
    switchLocale,
    getTranslation: (key) => {
      const keys = key.split('.');
      let val = dictionary || {};
      for (const k of keys) {
        val = val?.[k];
        if (val === undefined) return null;
      }
      return val;
    },
  }), [locale, t, dictionary, isLoading, setLocale, switchLocale]);

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
