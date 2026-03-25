import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/lib/i18nContext';
import { locales, localeLabels } from '@/i18n/config';

export function LocaleSwitcher() {
  const { locale, switchLocale } = useI18n();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const newLocale = e.target.value;
    const newPath = switchLocale(newLocale);
    navigate(newPath);
  };

  return (
    <select value={locale} onChange={handleChange} className="locale-switcher">
      {locales.map((loc) => (
        <option key={loc} value={loc}>
          {localeLabels[loc]}
        </option>
      ))}
    </select>
  );
}
