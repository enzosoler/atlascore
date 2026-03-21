import React, { createContext } from 'react';
import { t as translate } from '@/lib/i18n';

export const I18nContext = createContext();

/**
 * I18nContext — English-only provider
 * Always uses en-US locale
 */
export function I18nProvider({ children }) {
  const locale = 'en-US';

  const setLocale = React.useCallback(() => {
    // No-op: language is always en-US
  }, []);

  const t = React.useCallback((key) => translate(key, locale), []);

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
