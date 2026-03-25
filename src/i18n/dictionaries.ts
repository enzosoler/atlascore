/**
 * Dictionary loader
 * Centralized translation loading with fallback support
 */

import type { Locale } from './config';

// Dictionary imports with lazy loading
const dictionaries = {
  en: () => import('./messages/en.json'),
  'pt-BR': () => import('./messages/pt-BR.json'),
};

export type Dictionary = Record<string, any>;

/**
 * Load dictionary for a locale
 */
export async function loadDictionary(locale: Locale): Promise<Dictionary> {
  const loader = dictionaries[locale];
  if (!loader) {
    throw new Error(`No dictionary loader for locale: ${locale}`);
  }
  const module = await loader();
  return module.default || module;
}

/**
 * Deep merge two objects (used for fallback)
 */
function deepMerge(base: Dictionary, overlay: Dictionary): Dictionary {
  const result: Dictionary = { ...base };
  
  for (const key in overlay) {
    if (overlay.hasOwnProperty(key)) {
      if (
        typeof overlay[key] === 'object' &&
        overlay[key] !== null &&
        !Array.isArray(overlay[key]) &&
        typeof base[key] === 'object' &&
        base[key] !== null &&
        !Array.isArray(base[key])
      ) {
        result[key] = deepMerge(base[key], overlay[key]);
      } else {
        result[key] = overlay[key];
      }
    }
  }
  
  return result;
}

/**
 * Load dictionary with English fallback
 * Missing keys in PT will use EN values
 */
export async function loadDictionaryWithFallback(locale: Locale): Promise<Dictionary> {
  const enDict = await loadDictionary('en');
  
  if (locale === 'en') {
    return enDict;
  }
  
  const localeDict = await loadDictionary(locale);
  return deepMerge(enDict, localeDict);
}
