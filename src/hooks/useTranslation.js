import { useMemo } from 'react';
import { useI18n } from '@/lib/i18nContext';

export const useTranslation = () => {
  const { locale, t } = useI18n();

  return useMemo(() => ({
    t,
    language: locale,
    setLanguage: () => {}, // No-op: language is always en-US
    supportedLanguages: ['en-US'],
  }), [locale, t]);
};
