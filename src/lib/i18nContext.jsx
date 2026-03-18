import React, { createContext, useState, useEffect } from 'react';
import { getLanguage, setLanguage, t as translate } from '@/lib/i18n';

export const I18nContext = createContext();

/**
 * I18nContext — gerenciar idioma global + preferência persistida
 * PT-BR ou EN-US apenas
 */
export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(() => getLanguage());

  const setLocale = React.useCallback((newLocale) => {
    setLanguage(newLocale);
    const normalized = getLanguage();
    setLocaleState(normalized);
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: normalized }));
  }, []);

  useEffect(() => {
    const syncLocale = () => setLocaleState(getLanguage());
    const syncFromStorage = (event) => {
      if (event.key === 'atlas_locale' || event.key === 'language') syncLocale();
    };

    window.addEventListener('languageChanged', syncLocale);
    window.addEventListener('storage', syncFromStorage);

    return () => {
      window.removeEventListener('languageChanged', syncLocale);
      window.removeEventListener('storage', syncFromStorage);
    };
  }, []);

  const t = React.useCallback((key) => translate(key, locale), [locale]);

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
