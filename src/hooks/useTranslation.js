import { useMemo } from 'react';
import { useI18n } from '@/lib/i18nContext';
import { locales } from '@/i18n/config';

export const useTranslation = () => {
  const { locale, t, getTranslation } = useI18n();

  return useMemo(() => ({
    t,
    getTranslation,
    language: locale,
    setLanguage: () => {},
    supportedLanguages: [...locales],
  }), [locale, t, getTranslation]);
};
