import { useCallback, useMemo } from 'react';
import { supportedLanguages } from '@/lib/i18n';
import { useI18n } from '@/lib/i18nContext';

export const useTranslation = () => {
  const { locale, setLocale, t } = useI18n();

  const changeLanguage = useCallback((newLang) => {
    if (supportedLanguages.includes(newLang)) {
      setLocale(newLang);
    }
  }, [setLocale]);

  return useMemo(() => ({
    t,
    language: locale,
    setLanguage: changeLanguage,
    supportedLanguages,
  }), [changeLanguage, locale, t]);
};
