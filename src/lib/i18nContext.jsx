import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { defaultLocale, localeToPublicPath, isValidLocale } from '@/i18n/config';
import { loadDictionaryWithFallback } from '@/i18n/dictionaries';
import { createTranslator } from '@/i18n/translator';

const I18nContext = createContext(null);

function getLocaleFromPath(pathname) {
  const parts = pathname.split('/').filter(Boolean);
  const firstSegment = parts[0];
  if (firstSegment === 'en') return 'en';
  if (firstSegment === 'pt' || firstSegment === 'br') return 'pt-BR';
  return defaultLocale;
}

function buildPathWithLocale(pathname, targetLocale) {
  const parts = pathname.split('/').filter(Boolean);
  const currentFirst = parts[0];
  const hasLocalePrefix = currentFirst === 'en' || currentFirst === 'pt' || currentFirst === 'br';
  const newPrefix = targetLocale === 'pt-BR' ? 'br' : localeToPublicPath(targetLocale);
  if (hasLocalePrefix) {
    parts[0] = newPrefix;
  } else {
    parts.unshift(newPrefix);
  }
  return '/' + parts.join('/');
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
    return buildPathWithLocale(location.pathname, targetLocale);
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
