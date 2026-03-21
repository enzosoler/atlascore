export const DEFAULT_LOCALE = 'en-US';
export const SUPPORTED_LOCALES = Object.freeze(['en-US']);
export const RTL_BASE_LANGUAGES = Object.freeze(['ar', 'fa', 'he', 'ur']);

const FALLBACK_LOCALE_BY_LANGUAGE = Object.freeze({
  en: 'en-US',
});

export function canonicalizeLocale(locale) {
  if (typeof locale !== 'string') return null;

  const trimmed = locale.trim().replace(/_/g, '-');
  if (!trimmed) return null;

  try {
    return new Intl.Locale(trimmed).toString();
  } catch {
    return null;
  }
}

export function normalizeLocale(locale, supportedLocales = SUPPORTED_LOCALES) {
  if (typeof locale !== 'string') return null;

  const raw = locale.trim().replace(/_/g, '-');
  if (!raw) return null;

  const exactMatch = supportedLocales.find(
    (candidate) => candidate.toLowerCase() === raw.toLowerCase()
  );
  if (exactMatch) return exactMatch;

  const canonical = canonicalizeLocale(raw);
  if (canonical) {
    const canonicalMatch = supportedLocales.find(
      (candidate) => candidate.toLowerCase() === canonical.toLowerCase()
    );
    if (canonicalMatch) return canonicalMatch;
  }

  const lower = raw.toLowerCase();
  if (FALLBACK_LOCALE_BY_LANGUAGE[lower]) {
    return FALLBACK_LOCALE_BY_LANGUAGE[lower];
  }

  const primaryLanguage = (canonical || raw).split('-')[0].toLowerCase();
  if (FALLBACK_LOCALE_BY_LANGUAGE[primaryLanguage]) {
    return FALLBACK_LOCALE_BY_LANGUAGE[primaryLanguage];
  }

  return (
    supportedLocales.find((candidate) => {
      const lowerCandidate = candidate.toLowerCase();
      return (
        lowerCandidate === primaryLanguage ||
        lowerCandidate.startsWith(`${primaryLanguage}-`)
      );
    }) || null
  );
}

export function isSupportedLocale(locale, supportedLocales = SUPPORTED_LOCALES) {
  return normalizeLocale(locale, supportedLocales) !== null;
}

export function parseAcceptLanguageHeader(headerValue) {
  if (typeof headerValue !== 'string' || !headerValue.trim()) {
    return [];
  }

  return headerValue
    .split(',')
    .map((part) => part.trim())
    .map((part, index) => {
      const [locale, ...parameters] = part.split(';').map((segment) => segment.trim());
      const qParameter = parameters.find((parameter) => parameter.startsWith('q='));
      const quality = qParameter ? Number(qParameter.slice(2)) : 1;

      return {
        locale,
        quality: Number.isFinite(quality) ? quality : 0,
        index,
      };
    })
    .filter((entry) => entry.locale && entry.locale !== '*')
    .sort((a, b) => {
      if (b.quality !== a.quality) return b.quality - a.quality;
      return a.index - b.index;
    })
    .map((entry) => entry.locale);
}

export function negotiateLocale(preferences, supportedLocales = SUPPORTED_LOCALES, fallbackLocale = DEFAULT_LOCALE) {
  const normalizedFallback =
    normalizeLocale(fallbackLocale, supportedLocales) || DEFAULT_LOCALE;

  const preferenceList = Array.isArray(preferences)
    ? preferences.filter(Boolean)
    : parseAcceptLanguageHeader(preferences);

  for (const preference of preferenceList) {
    const normalizedPreference = normalizeLocale(preference, supportedLocales);
    if (normalizedPreference) {
      return normalizedPreference;
    }

    const canonical = canonicalizeLocale(preference);
    const primaryLanguage = (canonical || preference).split('-')[0];
    const baseMatch = normalizeLocale(primaryLanguage, supportedLocales);
    if (baseMatch) {
      return baseMatch;
    }
  }

  return normalizedFallback;
}

export function getLocaleFallbackChain(locale, supportedLocales = SUPPORTED_LOCALES, defaultLocale = DEFAULT_LOCALE) {
  const normalizedDefault =
    normalizeLocale(defaultLocale, supportedLocales) || DEFAULT_LOCALE;
  const normalizedLocale =
    normalizeLocale(locale, supportedLocales) || normalizedDefault;

  return [...new Set([normalizedLocale, normalizedDefault])];
}

export function getLocaleDirection(locale) {
  const canonical = canonicalizeLocale(locale) || locale || DEFAULT_LOCALE;
  const primaryLanguage = canonical.split('-')[0].toLowerCase();
  return RTL_BASE_LANGUAGES.includes(primaryLanguage) ? 'rtl' : 'ltr';
}

export function formatNumberValue(value, locale = DEFAULT_LOCALE, options = {}) {
  const normalizedLocale = normalizeLocale(locale) || DEFAULT_LOCALE;
  return new Intl.NumberFormat(normalizedLocale, options).format(value);
}

export function formatCurrencyValue(value, locale = DEFAULT_LOCALE, currency = 'USD', options = {}) {
  const normalizedLocale = normalizeLocale(locale) || DEFAULT_LOCALE;
  return new Intl.NumberFormat(normalizedLocale, {
    style: 'currency',
    currency,
    ...options,
  }).format(value);
}

export function formatDateValue(value, locale = DEFAULT_LOCALE, options = {}) {
  const normalizedLocale = normalizeLocale(locale) || DEFAULT_LOCALE;
  const date = value instanceof Date ? value : new Date(value);

  return new Intl.DateTimeFormat(normalizedLocale, {
    dateStyle: 'medium',
    ...options,
  }).format(date);
}
