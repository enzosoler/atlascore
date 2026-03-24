/**
 * Unit conversion utilities for Atlas Core
 * Supports metric (kg, cm) and imperial (lb, ft/in) units
 */

export const UNIT_SYSTEMS = {
  METRIC: 'metric',
  IMPERIAL: 'imperial',
};

// Conversion constants
const KG_TO_LB = 2.20462;
const CM_TO_IN = 0.393701;
const LB_TO_KG = 1 / KG_TO_LB;
const IN_TO_CM = 1 / CM_TO_IN;

/**
 * Get the user's preferred unit system from profile data
 * Defaults to 'metric' if not set
 */
export function getUserUnitSystem(profileData) {
  if (!profileData) return UNIT_SYSTEMS.METRIC;
  return profileData.unit_system || UNIT_SYSTEMS.METRIC;
}

/**
 * Check if user is using imperial units (US)
 */
export function isImperial(profileData) {
  return getUserUnitSystem(profileData) === UNIT_SYSTEMS.IMPERIAL;
}

/**
 * Convert kg to user's preferred weight unit
 * Returns formatted string with unit
 */
export function formatWeight(kg, profileData, options = {}) {
  const { decimals = 1, includeUnit = true } = options;
  
  if (kg == null || isNaN(kg)) return includeUnit ? `-- ${isImperial(profileData) ? 'lb' : 'kg'}` : '--';
  
  const useImperial = isImperial(profileData);
  const value = useImperial ? kg * KG_TO_LB : kg;
  const unit = useImperial ? 'lb' : 'kg';
  
  const formatted = value.toFixed(decimals).replace(/\.0+$/, '');
  return includeUnit ? `${formatted} ${unit}` : formatted;
}

/**
 * Convert weight to kg for storage (from user's preferred unit)
 */
export function toKilograms(value, profileData) {
  if (value == null || isNaN(value)) return null;
  const useImperial = isImperial(profileData);
  return useImperial ? value * LB_TO_KG : value;
}

/**
 * Convert cm to user's preferred height unit
 */
export function formatHeight(cm, profileData, options = {}) {
  const { includeUnit = true } = options;
  
  if (cm == null || isNaN(cm)) return includeUnit ? `-- ${isImperial(profileData) ? 'in' : 'cm'}` : '--';
  
  const useImperial = isImperial(profileData);
  
  if (useImperial) {
    const totalInches = cm * CM_TO_IN;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return includeUnit ? `${feet}'${inches}"` : `${feet}'${inches}"`;
  }
  
  return includeUnit ? `${Math.round(cm)} cm` : `${Math.round(cm)}`;
}

/**
 * Convert height to cm for storage (from user's preferred unit)
 * Supports: cm, inches, or ft'in" format
 */
export function toCentimeters(value, profileData) {
  if (value == null) return null;
  
  const useImperial = isImperial(profileData);
  
  if (!useImperial) {
    return typeof value === 'number' ? value : parseFloat(value);
  }
  
  // Handle ft'in" format
  if (typeof value === 'string' && value.includes("'")) {
    const match = value.match(/(\d+)'(\d+)/);
    if (match) {
      const feet = parseInt(match[1], 10);
      const inches = parseInt(match[2], 10);
      return (feet * 12 + inches) * IN_TO_CM;
    }
  }
  
  // Handle plain inches
  const inches = typeof value === 'number' ? value : parseFloat(value);
  return inches * IN_TO_CM;
}

/**
 * Get the appropriate weight unit label
 */
export function getWeightUnit(profileData) {
  return isImperial(profileData) ? 'lb' : 'kg';
}

/**
 * Get the appropriate height unit label
 */
export function getHeightUnit(profileData) {
  return isImperial(profileData) ? 'ft/in' : 'cm';
}

/**
 * Format a weight difference (for PR indicators)
 * Shows +2.5 kg or +5.5 lb depending on user preference
 */
export function formatWeightDiff(kgDiff, profileData) {
  if (kgDiff == null || isNaN(kgDiff)) return '';
  
  const useImperial = isImperial(profileData);
  const value = useImperial ? kgDiff * KG_TO_LB : kgDiff;
  const unit = useImperial ? 'lb' : 'kg';
  const sign = value > 0 ? '+' : '';
  
  return `${sign}${value.toFixed(1).replace(/\.0$/, '')} ${unit}`;
}

/**
 * Detect preferred unit system based on locale or country
 * Returns 'metric' or 'imperial'
 */
export function detectUnitSystemFromLocale(locale) {
  const imperialCountries = ['en-US', 'en-CA', 'en-LR', 'en-MM'];
  return imperialCountries.includes(locale) ? UNIT_SYSTEMS.IMPERIAL : UNIT_SYSTEMS.METRIC;
}
