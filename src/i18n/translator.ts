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

    if (!text || typeof text !== 'string') {
      if (import.meta.env.DEV) {
        console.error(`[i18n] Missing translation key for active locale: "${key}"`);
        return `[missing:${key}]`;
      }
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

/**
 * Convert a camelCase or snake_case key segment to readable text
 * e.g., "loseFat" -> "Lose Fat", "editPromptSubtitle" -> "Edit Prompt Subtitle"
 */
export function readableFallback(segment: string): string {
  // Handle common specific keys with better defaults
  const commonFallbacks: Record<string, string> = {
    'title': 'Title',
    'subtitle': 'Subtitle',
    'goals': 'Goals',
    'goal': 'Goal',
    'body': 'Body',
    'account': 'Account',
    'settings': 'Settings',
    'profile': 'Profile',
    'notSet': 'Not set',
    'loseFat': 'Lose Fat',
    'gainMuscle': 'Gain Muscle',
    'maintain': 'Maintain',
    'loadingProfile': 'Loading...',
    'loadingProfileDesc': 'Please wait.',
    'safeMode': 'Error loading',
    'safeModeDesc': 'Something went wrong.',
    'openMyDiet': 'Open My Diet',
    'editGoals': 'Edit Goals',
    'editPrompt': 'Edit',
    'editPromptSubtitle': 'Make changes',
    'manageSections': 'Manage',
    'yourSetup': 'Your Setup',
    'pageSubtitle': 'Profile page',
  };
  
  if (commonFallbacks[segment]) {
    return commonFallbacks[segment];
  }
  
  // Convert camelCase to readable text
  // Insert space before uppercase letters and capitalize first letter
  return segment
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

export type Translator = ReturnType<typeof createTranslator>;
