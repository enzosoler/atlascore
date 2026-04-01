/**
 * Dictionary loader
 * Eager imports + synchronous cache — zero async latency on language switch
 */

import type { Locale } from './config';

// Eager-loaded raw dictionaries (bundled at build time, never fetched at runtime)
import enMessages from './messages/en.json';
import enOnboardingMessages from './messages/en-onboarding.json';
import ptBRMessages from './messages/pt-BR.json';
import ptBROnboardingMessages from './messages/pt-BR-onboarding.json';
import esMessages from './messages/es.json';

// Patch files — orphaned translations that need merging
import trainingPatch from './patches/training.json';
import nutritionPatch from './patches/nutrition.json';
import settingsPatch from './patches/settings.json';
import insightsPatch from './patches/insights.json';
import bodyPatch from './patches/body.json';
import sharedPatch from './patches/shared.json';
import professionalsPatch from './patches/professionals.json';
import clinicianPatch from './patches/clinician.json';

export type Dictionary = Record<string, any>;

// Pre-merge onboarding overlays into their base locale so tour keys resolve
// without a separate runtime import. en-onboarding.json was previously orphaned.
// Merge all patch files per locale
function mergePatches(base: Dictionary, patches: Array<Record<string, any>>, locale: string): Dictionary {
  let result = base;
  for (const patch of patches) {
    const localeData = patch[locale] || patch[locale.split('-')[0]];
    if (localeData && typeof localeData === 'object') {
      result = deepMergeStatic(result, localeData as Dictionary);
    }
  }
  return result;
}

const allPatches = [trainingPatch, nutritionPatch, settingsPatch, insightsPatch, bodyPatch, sharedPatch, professionalsPatch, clinicianPatch];

const rawDicts: Record<string, Dictionary> = {
  en: mergePatches(
    deepMergeStatic(enMessages as unknown as Dictionary, enOnboardingMessages as unknown as Dictionary),
    allPatches, 'en'
  ),
  'pt-BR': mergePatches(
    deepMergeStatic(ptBRMessages as unknown as Dictionary, ptBROnboardingMessages as unknown as Dictionary),
    allPatches, 'pt-BR'
  ),
  es: mergePatches(esMessages as unknown as Dictionary, allPatches, 'es'),
};

// Simple recursive merge used only at module init — before deepMerge is defined below.
function deepMergeStatic(base: Dictionary, overlay: Dictionary): Dictionary {
  const result: Dictionary = { ...base };
  for (const key in overlay) {
    if (Object.prototype.hasOwnProperty.call(overlay, key)) {
      if (
        typeof overlay[key] === 'object' && overlay[key] !== null && !Array.isArray(overlay[key]) &&
        typeof base[key] === 'object' && base[key] !== null && !Array.isArray(base[key])
      ) {
        result[key] = deepMergeStatic(base[key], overlay[key]);
      } else {
        result[key] = overlay[key];
      }
    }
  }
  return result;
}

/**
 * Deep merge two objects (used for EN fallback)
 */
function deepMerge(base: Dictionary, overlay: Dictionary): Dictionary {
  const result: Dictionary = { ...base };

  for (const key in overlay) {
    if (Object.prototype.hasOwnProperty.call(overlay, key)) {
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

// Cache for merged dictionaries — computed once per locale, reused forever
const mergedCache: Partial<Record<Locale, Dictionary>> = {};

/**
 * Get a merged dictionary synchronously.
 * Missing keys in the target locale fall back to English values.
 */
export function getDictionarySync(locale: Locale): Dictionary {
  if (mergedCache[locale]) return mergedCache[locale]!;

  const enDict = rawDicts['en'];

  if (locale === 'en') {
    mergedCache.en = enDict;
    return enDict;
  }

  const localeDict = rawDicts[locale];
  if (!localeDict) {
    mergedCache[locale] = enDict;
    return enDict;
  }

  const merged = deepMerge(enDict, localeDict);
  mergedCache[locale] = merged;
  return merged;
}

// Backward-compatible async wrappers (now instant — no network round-trip)
export async function loadDictionary(locale: Locale): Promise<Dictionary> {
  return getDictionarySync(locale);
}

export async function loadDictionaryWithFallback(locale: Locale): Promise<Dictionary> {
  return getDictionarySync(locale);
}
