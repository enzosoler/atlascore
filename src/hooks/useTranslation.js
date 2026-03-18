import { useState, useCallback, useEffect } from 'react';
import { t, getLanguage, setLanguage, supportedLanguages } from '@/lib/i18n';

export const useTranslation = () => {
  const [language, setLang] = useState(getLanguage());

  const changeLanguage = useCallback((newLang) => {
    if (supportedLanguages.includes(newLang)) {
      setLanguage(newLang);
      setLang(getLanguage());
      // Trigger re-render by updating document
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: getLanguage() }));
    }
  }, []);

  useEffect(() => {
    const syncLanguage = () => setLang(getLanguage());
    const syncFromStorage = (event) => {
      if (event.key === 'atlas_locale' || event.key === 'language') syncLanguage();
    };

    window.addEventListener('languageChanged', syncLanguage);
    window.addEventListener('storage', syncFromStorage);

    return () => {
      window.removeEventListener('languageChanged', syncLanguage);
      window.removeEventListener('storage', syncFromStorage);
    };
  }, []);

  const translate = useCallback((key) => t(key, language), [language]);

  return {
    t: translate,
    language,
    setLanguage: changeLanguage,
    supportedLanguages,
  };
};
