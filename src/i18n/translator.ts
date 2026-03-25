/**
 * Translator helper
 * Creates a translation function from a dictionary
 */

import type { Dictionary } from './dictionaries';

/**
 * Get nested value from object by dot-notation path
 */
function getNestedValue(obj: Dictionary, path: string): string | undefined {
  return path.split('.').reduce((acc: any, key) => acc?.[key], obj);
}

/**
 * Create a translator function for a given dictionary
 */
export function createTranslator(dictionary: Dictionary) {
  return function t(key: string, vars?: Record<string, string | number>): string {
    let text = getNestedValue(dictionary, key);

    // Fallback to key if translation missing
    if (!text || typeof text !== 'string') {
      console.warn(`[i18n] Missing translation key: "${key}"`);
      return key;
    }

    // No interpolation needed
    if (!vars) return text;

    // Interpolate variables: {name} -> value
    return text.replace(/\{(\w+)\}/g, (_, k) => {
      const value = vars[k];
      return value !== undefined ? String(value) : `{${k}}`;
    });
  };
}

export type Translator = ReturnType<typeof createTranslator>;
