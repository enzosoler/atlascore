import { useMemo } from 'react';
import { useI18n } from '@/lib/i18nContext';

export const useTranslation = () => {
  const { locale, t, getTranslation } = useI18n();

  return useMemo(() => ({
    t,
    getTranslation,
    language: locale,
    setLanguage: () => {},
    supportedLanguages: ['en-US', 'pt-BR'],
  }), [locale, t, getTranslation]);
};
