import { DEFAULT_LOCALE, formatCurrencyValue, normalizeLocale } from '../../shared/localization.js';

/**
 * Localization Service — Manage Currency
 *
 * English-only version: always uses USD
 */

export const CURRENCIES = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar' },
};

export const DEFAULT_CURRENCY = 'USD';
export const CURRENCY_STORAGE_KEY = 'atlas_currency';

/**
 * Detect browser language
 */
export const getBrowserLanguage = () => {
  if (typeof window === 'undefined') return null;
  return navigator.language || navigator.languages?.[0];
};

/**
 * Determine currency - always returns USD
 *
 * @param {string} selectedLanguage - Unused; always returns USD
 * @returns {string} - Currency code ('USD')
 */
export const determineCurrency = (selectedLanguage) => {
  return 'USD';
};

/**
 * Get the current currency - always USD
 */
export const getCurrentCurrency = (selectedLanguage) => {
  return 'USD';
};

/**
 * Get currency object
 */
export const getCurrencyObject = (currencyCode) => {
  return CURRENCIES[currencyCode] || CURRENCIES[DEFAULT_CURRENCY];
};

/**
 * Format price based on currency
 */
export const formatPrice = (amount, currencyCode) => {
  const currency = getCurrencyObject(currencyCode);
  const numericAmount = Number.isFinite(amount) ? amount : Number(amount || 0);
  const locale = DEFAULT_LOCALE;

  return formatCurrencyValue(numericAmount, locale, currency.code);
};

/**
 * Hook for React components
 */
export const useCurrency = (selectedLanguage) => {
  const currency = getCurrentCurrency(selectedLanguage);
  const currencyObj = getCurrencyObject(currency);

  return {
    currency,
    currencyCode: currencyObj.code,
    currencySymbol: currencyObj.symbol,
    currencyName: currencyObj.name,
    formatPrice: (amount) => formatPrice(amount, currency),
  };
};
