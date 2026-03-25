/**
 * Localization formatters
 * Dates, numbers, currency, etc.
 */

import { type Locale } from './config';

export function formatDate(date, locale) {
  const d = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(d);
}

export function formatShortDate(date, locale) {
  const d = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

export function formatCurrency(value, locale) {
  const currency = locale === 'pt-BR' ? 'BRL' : 'USD';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
}

export function formatNumber(value, locale, options = {}) {
  return new Intl.NumberFormat(locale, options).format(value);
}

export function formatPercent(value, locale) {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 1,
  }).format(value / 100);
}
