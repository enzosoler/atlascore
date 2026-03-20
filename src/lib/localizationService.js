import { DEFAULT_LOCALE, formatCurrencyValue, normalizeLocale } from '../../shared/localization.js';

/**
 * Localization Service — Manage Currency Based on Browser Language
 * 
 * Rules:
 * - If browser language is Portuguese AND selected language is Portuguese -> BRL
 * - Any other combination -> USD
 * - User can change the UI language without affecting currency
 */

export const CURRENCIES = {
  BRL: { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
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
 * Check if browser language is Portuguese
 */
export const isBrowserPortuguese = () => {
  const browserLang = getBrowserLanguage();
  if (!browserLang) return false;
  return browserLang.toLowerCase().startsWith('pt');
};

/**
 * Determine currency based on browser language and selected language
 * 
 * @param {string} selectedLanguage - The user's selected language (e.g., 'pt-BR', 'en-US')
 * @returns {string} - Currency code ('BRL' or 'USD')
 */
export const determineCurrency = (selectedLanguage) => {
  // Rule: BRL only if browser is Portuguese AND selected language is Portuguese
  const browserIsPT = isBrowserPortuguese();
  const selectedIsPT = selectedLanguage?.toLowerCase().startsWith('pt');

  if (browserIsPT && selectedIsPT) {
    return 'BRL';
  }

  return 'USD';
};

/**
 * Get the current currency based on browser language
 * (This is computed, not stored, so it always reflects the browser language)
 */
export const getCurrentCurrency = (selectedLanguage) => {
  return determineCurrency(selectedLanguage);
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
  const locale =
    normalizeLocale(currencyCode === 'BRL' ? 'pt-BR' : DEFAULT_LOCALE) || DEFAULT_LOCALE;

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
