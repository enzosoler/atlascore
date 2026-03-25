import React, { createContext, useCallback } from 'react';
import { t as translate, getLanguage } from '@/lib/i18n';

export const I18nContext = createContext();

/**
 * I18nProvider — Build-time locale provider
 * Locale is determined at build time by VITE_LOCALE, not runtime
 */
export function I18nProvider({ children }) {
  // Get locale from build-time i18n configuration
  const locale = getLanguage();

  const setLocale = useCallback(() => {
    // No-op: language is fixed at build time
  }, []);

  const t = useCallback((key, params) => translate(key, locale, params), [locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = React.useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}
