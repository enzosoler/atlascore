import { z } from 'zod';
import { getToday } from './atlas-theme.js';

export const MEASUREMENT_FIELD_SOURCE_TYPES = ['manual_input', 'imported_input', 'derived'];

export const MEASUREMENT_SOURCE_VALUES = ['manual', 'device_import', 'clinician_import', 'computed'];

export const MEASUREMENT_SOURCE_LABELS = {
  manual: 'Manual',
  device_import: 'Device import',
  clinician_import: 'Clinician import',
  computed: 'Computed',
};

export const MEASUREMENT_SOURCE_OPTIONS = MEASUREMENT_SOURCE_VALUES.map((value) => ({
  value,
  label: MEASUREMENT_SOURCE_LABELS[value],
}));

function defineMeasurementField(definition) {
  return {
    precision: 1,
    trendable: true,
    allowManualInput: false,
    allowImportedInput: false,
    canDerive: false,
    approximate: false,
    storageKey: definition.key,
    aliases: [],
    sourceTypes: [],
    derivedFrom: [],
    ...definition,
  };
}

const MANUAL_BASELINE_FIELD_KEYS = ['weight', 'age', 'height', 'waist', 'body_fat_percent'];
const MANUAL_UPPER_FIELD_KEYS = [
  'neck',
  'shoulders',
  'thorax',
  'biceps_left',
  'biceps_right',
  'forearm_left',
  'forearm_right',
  'abdomen',
  'subscapular',
];
const MANUAL_LOWER_FIELD_KEYS = [
  'thigh_left',
  'thigh_right',
  'calf_left',
  'calf_right',
  'hips',
];
const COMPOSITION_FIELD_KEYS = [
  'fat_mass',
  'total_body_water',
  'hydration_index',
  'water_in_lean_mass',
  'lean_mass',
  'lean_mass_percent',
  'muscle_fat_ratio',
  'muscle_mass',
  'muscle_mass_percent',
  'intracellular_water',
  'intracellular_water_percent',
  'extracellular_water',
  'bmi',
  'bmr',
  'tdee',
  'phase_angle',
  'cellular_age',
];
const DERIVED_FIELD_KEYS = [
  'bmi',
  'fat_mass',
  'lean_mass',
  'lean_mass_percent',
  'muscle_fat_ratio',
  'muscle_mass_percent',
  'intracellular_water_percent',
  'water_in_lean_mass',
];

export const MEASUREMENT_FIELD_DEFINITIONS = [
  defineMeasurementField({
    key: 'weight',
    label: 'Weight',
    unit: 'kg',
    section: 'manual_baseline',
    storageKey: 'weight',
    sourceTypes: ['manual_input', 'imported_input'],
    allowManualInput: true,
    allowImportedInput: true,
    min: 0.1,
    precision: 1,
    description: 'Total body mass recorded in the checkpoint.',
  }),
  defineMeasurementField({
    key: 'age',
    label: 'Age',
    unit: 'years',
    section: 'manual_baseline',
    storageKey: 'age',
    sourceTypes: ['manual_input'],
    allowManualInput: true,
    min: 0,
    max: 130,
    precision: 0,
    trendable: false,
    description: 'Age is stored directly for compatibility; date of birth can be added later.',
  }),
  defineMeasurementField({
    key: 'height',
    label: 'Height',
    unit: 'cm',
    section: 'manual_baseline',
    storageKey: 'height',
    sourceTypes: ['manual_input'],
    allowManualInput: true,
    min: 0.1,
    max: 300,
    precision: 1,
    trendable: false,
    description: 'Height in centimeters, used for BMI and other body-composition calculations.',
  }),
  defineMeasurementField({
    key: 'waist',
    label: 'Waist',
    unit: 'cm',
    section: 'manual_baseline',
    storageKey: 'waist',
    sourceTypes: ['manual_input'],
    allowManualInput: true,
    min: 0.1,
    precision: 1,
    description: 'Waist circumference measured at a consistent point.',
  }),
  defineMeasurementField({
    key: 'body_fat_percent',
    label: 'Body fat %',
    unit: '%',
    section: 'manual_baseline',
    storageKey: 'body_fat',
    aliases: ['body_fat'],
    sourceTypes: ['manual_input', 'imported_input'],
    allowManualInput: true,
    allowImportedInput: true,
    min: 0,
    max: 100,
    precision: 1,
    description: 'Body fat percentage from manual entry or a trusted device / exam import.',
  }),
  defineMeasurementField({
    key: 'neck',
    label: 'Neck',
    unit: 'cm',
    section: 'manual_upper',
    storageKey: 'neck',
    sourceTypes: ['manual_input'],
    allowManualInput: true,
    min: 0.1,
    precision: 1,
  }),
  defineMeasurementField({
    key: 'shoulders',
    label: 'Shoulders',
    unit: 'cm',
    section: 'manual_upper',
    storageKey: 'shoulders',
    sourceTypes: ['manual_input'],
    allowManualInput: true,
    min: 0.1,
    precision: 1,
  }),
  defineMeasurementField({
    key: 'thorax',
    label: 'Thorax',
    unit: 'cm',
    section: 'manual_upper',
    storageKey: 'chest',
    aliases: ['chest'],
    sourceTypes: ['manual_input'],
    allowManualInput: true,
    min: 0.1,
    precision: 1,
  }),
  defineMeasurementField({
    key: 'biceps_left',
    label: 'Left biceps',
    unit: 'cm',
    section: 'manual_upper',
    storageKey: 'left_bicep',
    aliases: ['left_bicep'],
    sourceTypes: ['manual_input'],
    allowManualInput: true,
    min: 0.1,
    precision: 1,
  }),
  defineMeasurementField({
    key: 'biceps_right',
    label: 'Right biceps',
    unit: 'cm',
    section: 'manual_upper',
    storageKey: 'right_bicep',
    aliases: ['right_bicep'],
    sourceTypes: ['manual_input'],
    allowManualInput: true,
    min: 0.1,
    precision: 1,
  }),
  defineMeasurementField({
    key: 'forearm_left',
    label: 'Left forearm',
    unit: 'cm',
    section: 'manual_upper',
    storageKey: 'left_forearm',
    aliases: ['left_forearm'],
    sourceTypes: ['manual_input'],
    allowManualInput: true,
    min: 0.1,
    precision: 1,
  }),
  defineMeasurementField({
    key: 'forearm_right',
    label: 'Right forearm',
    unit: 'cm',
    section: 'manual_upper',
    storageKey: 'right_forearm',
    aliases: ['right_forearm'],
    sourceTypes: ['manual_input'],
    allowManualInput: true,
    min: 0.1,
    precision: 1,
  }),
  defineMeasurementField({
    key: 'abdomen',
    label: 'Abdomen',
    unit: 'cm',
    section: 'manual_upper',
    storageKey: 'abdomen',
    sourceTypes: ['manual_input'],
    allowManualInput: true,
    min: 0.1,
    precision: 1,
  }),
  defineMeasurementField({
    key: 'subscapular',
    label: 'Subscapular',
    unit: 'cm',
    section: 'manual_upper',
    storageKey: 'scapular',
    aliases: ['scapular'],
    sourceTypes: ['manual_input'],
    allowManualInput: true,
    min: 0.1,
    precision: 1,
    description: 'Upper-back / subscapular measurement used in body composition follow-up.',
  }),
  defineMeasurementField({
    key: 'thigh_left',
    label: 'Left thigh',
    unit: 'cm',
    section: 'manual_lower',
    storageKey: 'left_thigh',
    aliases: ['left_thigh'],
    sourceTypes: ['manual_input'],
    allowManualInput: true,
    min: 0.1,
    precision: 1,
  }),
  defineMeasurementField({
    key: 'thigh_right',
    label: 'Right thigh',
    unit: 'cm',
    section: 'manual_lower',
    storageKey: 'right_thigh',
    aliases: ['right_thigh'],
    sourceTypes: ['manual_input'],
    allowManualInput: true,
    min: 0.1,
    precision: 1,
  }),
  defineMeasurementField({
    key: 'calf_left',
    label: 'Left calf',
    unit: 'cm',
    section: 'manual_lower',
    storageKey: 'left_calf',
    aliases: ['left_calf'],
    sourceTypes: ['manual_input'],
    allowManualInput: true,
    min: 0.1,
    precision: 1,
  }),
  defineMeasurementField({
    key: 'calf_right',
    label: 'Right calf',
    unit: 'cm',
    section: 'manual_lower',
    storageKey: 'right_calf',
    aliases: ['right_calf'],
    sourceTypes: ['manual_input'],
    allowManualInput: true,
    min: 0.1,
    precision: 1,
  }),
  defineMeasurementField({
    key: 'hips',
    label: 'Hips',
    unit: 'cm',
    section: 'manual_lower',
    storageKey: 'hips',
    sourceTypes: ['manual_input'],
    allowManualInput: true,
    min: 0.1,
    precision: 1,
  }),
  defineMeasurementField({
    key: 'fat_mass',
    label: 'Fat mass',
    unit: 'kg',
    section: 'composition',
    storageKey: 'fat_mass',
    sourceTypes: ['imported_input', 'derived'],
    allowImportedInput: true,
    canDerive: true,
    derivedFrom: ['weight', 'body_fat_percent', 'lean_mass'],
    min: 0,
    precision: 2,
  }),
  defineMeasurementField({
    key: 'total_body_water',
    label: 'Total body water',
    unit: 'L',
    section: 'composition',
    storageKey: 'total_body_water',
    sourceTypes: ['imported_input'],
    allowImportedInput: true,
    min: 0,
    precision: 2,
  }),
  defineMeasurementField({
    key: 'hydration_index',
    label: 'Hydration index',
    unit: 'index',
    section: 'composition',
    storageKey: 'hydration_index',
    sourceTypes: ['imported_input'],
    allowImportedInput: true,
    min: 0,
    precision: 2,
  }),
  defineMeasurementField({
    key: 'water_in_lean_mass',
    label: 'Water in lean mass',
    unit: 'L/kg',
    section: 'composition',
    storageKey: 'water_in_lean_mass',
    sourceTypes: ['imported_input', 'derived'],
    allowImportedInput: true,
    canDerive: true,
    approximate: true,
    derivedFrom: ['total_body_water', 'lean_mass'],
    min: 0,
    precision: 2,
    description:
      'Approximate ratio of total body water to lean mass. Some devices report this directly, while the app can also calculate it.',
  }),
  defineMeasurementField({
    key: 'lean_mass',
    label: 'Lean mass',
    unit: 'kg',
    section: 'composition',
    storageKey: 'lean_mass',
    sourceTypes: ['imported_input', 'derived'],
    allowImportedInput: true,
    canDerive: true,
    derivedFrom: ['weight', 'body_fat_percent', 'fat_mass'],
    min: 0,
    precision: 2,
  }),
  defineMeasurementField({
    key: 'lean_mass_percent',
    label: 'Lean mass %',
    unit: '%',
    section: 'composition',
    storageKey: 'lean_mass_percent',
    sourceTypes: ['imported_input', 'derived'],
    allowImportedInput: true,
    canDerive: true,
    derivedFrom: ['lean_mass', 'weight'],
    min: 0,
    max: 100,
    precision: 1,
  }),
  defineMeasurementField({
    key: 'muscle_fat_ratio',
    label: 'Muscle/fat ratio',
    unit: 'ratio',
    section: 'composition',
    storageKey: 'muscle_fat_ratio',
    sourceTypes: ['imported_input', 'derived'],
    allowImportedInput: true,
    canDerive: true,
    derivedFrom: ['muscle_mass', 'fat_mass'],
    min: 0,
    precision: 2,
  }),
  defineMeasurementField({
    key: 'muscle_mass',
    label: 'Muscle mass',
    unit: 'kg',
    section: 'composition',
    storageKey: 'muscle_mass',
    sourceTypes: ['imported_input'],
    allowImportedInput: true,
    min: 0,
    precision: 2,
  }),
  defineMeasurementField({
    key: 'muscle_mass_percent',
    label: 'Muscle mass %',
    unit: '%',
    section: 'composition',
    storageKey: 'muscle_mass_percent',
    sourceTypes: ['imported_input', 'derived'],
    allowImportedInput: true,
    canDerive: true,
    derivedFrom: ['muscle_mass', 'weight'],
    min: 0,
    max: 100,
    precision: 1,
  }),
  defineMeasurementField({
    key: 'intracellular_water',
    label: 'Intracellular water',
    unit: 'L',
    section: 'composition',
    storageKey: 'intracellular_water',
    sourceTypes: ['imported_input'],
    allowImportedInput: true,
    min: 0,
    precision: 2,
  }),
  defineMeasurementField({
    key: 'intracellular_water_percent',
    label: 'Intracellular water %',
    unit: '%',
    section: 'composition',
    storageKey: 'intracellular_water_percent',
    sourceTypes: ['imported_input', 'derived'],
    allowImportedInput: true,
    canDerive: true,
    derivedFrom: ['intracellular_water', 'total_body_water'],
    min: 0,
    max: 100,
    precision: 1,
  }),
  defineMeasurementField({
    key: 'extracellular_water',
    label: 'Extracellular water',
    unit: 'L',
    section: 'composition',
    storageKey: 'extracellular_water',
    sourceTypes: ['imported_input'],
    allowImportedInput: true,
    min: 0,
    precision: 2,
  }),
  defineMeasurementField({
    key: 'bmi',
    label: 'BMI',
    unit: 'kg/m²',
    section: 'composition',
    storageKey: 'bmi',
    sourceTypes: ['imported_input', 'derived'],
    allowImportedInput: true,
    canDerive: true,
    derivedFrom: ['weight', 'height'],
    min: 0,
    precision: 2,
  }),
  defineMeasurementField({
    key: 'bmr',
    label: 'BMR',
    unit: 'kcal/day',
    section: 'composition',
    storageKey: 'bmr',
    sourceTypes: ['imported_input', 'derived'],
    allowImportedInput: true,
    canDerive: true,
    min: 0,
    precision: 0,
  }),
  defineMeasurementField({
    key: 'tdee',
    label: 'TDEE',
    unit: 'kcal/day',
    section: 'composition',
    storageKey: 'tdee',
    sourceTypes: ['derived'],
    canDerive: true,
    trendable: true,
    min: 0,
    precision: 0,
  }),
  defineMeasurementField({
    key: 'phase_angle',
    label: 'Phase angle',
    unit: '°',
    section: 'composition',
    storageKey: 'phase_angle',
    sourceTypes: ['imported_input'],
    allowImportedInput: true,
    min: 0,
    precision: 1,
  }),
  defineMeasurementField({
    key: 'cellular_age',
    label: 'Cellular age',
    unit: 'years',
    section: 'composition',
    storageKey: 'cellular_age',
    sourceTypes: ['imported_input'],
    allowImportedInput: true,
    min: 0,
    precision: 1,
    trendable: true,
  }),
];

export const MEASUREMENT_FIELD_MAP = MEASUREMENT_FIELD_DEFINITIONS.reduce((accumulator, field) => {
  accumulator[field.key] = field;
  return accumulator;
}, {});

export const MEASUREMENT_STORAGE_TO_CANONICAL = MEASUREMENT_FIELD_DEFINITIONS.reduce(
  (accumulator, field) => {
    accumulator[field.storageKey] = field.key;
    for (const alias of field.aliases) {
      accumulator[alias] = field.key;
    }
    return accumulator;
  },
  {
    arms: 'arms',
    thighs: 'thighs',
  }
);

export const MEASUREMENT_CANONICAL_TO_STORAGE = MEASUREMENT_FIELD_DEFINITIONS.reduce(
  (accumulator, field) => {
    accumulator[field.key] = field.storageKey;
    return accumulator;
  },
  {
    arms: 'arms',
    thighs: 'thighs',
  }
);

export const MEASUREMENT_SECTION_LABELS = {
  manual_baseline: 'Manual body measurements',
  manual_upper: 'Upper body',
  manual_lower: 'Lower body',
  composition: 'Body composition / device or exam',
  derived: 'Derived / calculated',
};

export const MEASUREMENT_MANUAL_FIELDS = MEASUREMENT_FIELD_DEFINITIONS.filter(
  (field) => field.sourceTypes.includes('manual_input')
);

export const MEASUREMENT_IMPORTED_FIELDS = MEASUREMENT_FIELD_DEFINITIONS.filter((field) =>
  field.sourceTypes.includes('imported_input')
);

export const MEASUREMENT_DERIVED_FIELDS = MEASUREMENT_FIELD_DEFINITIONS.filter((field) =>
  field.canDerive
);

export const MEASUREMENT_IMPORTED_COMPOSITION_FIELDS = MEASUREMENT_IMPORTED_FIELDS.filter(
  (field) => field.section === 'composition'
);

export const MEASUREMENT_FORM_FIELDS = [
  ...MEASUREMENT_MANUAL_FIELDS,
  ...MEASUREMENT_IMPORTED_COMPOSITION_FIELDS,
];

export const MEASUREMENT_ALL_FIELD_KEYS = MEASUREMENT_FIELD_DEFINITIONS.map((field) => field.key);

export const MEASUREMENT_MANUAL_FIELD_KEYS = MEASUREMENT_MANUAL_FIELDS.map((field) => field.key);

export const MEASUREMENT_IMPORTED_FIELD_KEYS = MEASUREMENT_IMPORTED_FIELDS.map((field) => field.key);

export const MEASUREMENT_DERIVED_FIELD_KEYS = MEASUREMENT_DERIVED_FIELDS.map((field) => field.key);

export const MEASUREMENT_FORM_FIELD_KEYS = MEASUREMENT_FORM_FIELDS.map((field) => field.key);

export const BODY_FIELD_LABELS = MEASUREMENT_MANUAL_FIELDS.reduce((accumulator, field) => {
  accumulator[field.key] = field.label;
  return accumulator;
}, {});

export const MEASUREMENT_MANUAL_FIELD_SECTIONS = [
  {
    key: 'manual_baseline',
    label: MEASUREMENT_SECTION_LABELS.manual_baseline,
    description:
      'Core signals that anchor a checkpoint. Body fat % can be entered manually or populated from a trusted import.',
    fields: MEASUREMENT_FIELD_DEFINITIONS.filter((field) => field.section === 'manual_baseline'),
  },
  {
    key: 'manual_upper',
    label: MEASUREMENT_SECTION_LABELS.manual_upper,
    description: 'Upper-body circumferences and torso measurements taken at the same points each time.',
    fields: MEASUREMENT_FIELD_DEFINITIONS.filter((field) => field.section === 'manual_upper'),
  },
  {
    key: 'manual_lower',
    label: MEASUREMENT_SECTION_LABELS.manual_lower,
    description: 'Lower-body circumferences that keep the checkpoint balanced from side to side.',
    fields: MEASUREMENT_FIELD_DEFINITIONS.filter((field) => field.section === 'manual_lower'),
  },
];

export const MEASUREMENT_COMPOSITION_SECTION = {
  key: 'composition',
  label: MEASUREMENT_SECTION_LABELS.composition,
  description:
    'Bioimpedance, scale, clinician, or lab/device values. Derived metrics can stay blank here because the app will calculate them when the source inputs are present.',
  fields: MEASUREMENT_FIELD_DEFINITIONS.filter((field) => field.section === 'composition'),
};

export const MEASUREMENT_DERIVED_SECTION = {
  key: 'derived',
  label: MEASUREMENT_SECTION_LABELS.derived,
  description:
    'Read-only fields the app can calculate safely whenever the source inputs are present.',
  fields: MEASUREMENT_DERIVED_FIELDS,
};

export const MEASUREMENT_TREND_FIELD_KEYS = MEASUREMENT_FIELD_DEFINITIONS.filter(
  (field) => field.trendable
).map((field) => field.key);

export const MEASUREMENT_DISPLAY_FIELD_KEYS = [
  'weight',
  'body_fat_percent',
  'waist',
  'bmi',
  'fat_mass',
  'lean_mass',
  'lean_mass_percent',
  'muscle_mass',
  'muscle_mass_percent',
  'muscle_fat_ratio',
  'total_body_water',
  'intracellular_water',
  'intracellular_water_percent',
  'hydration_index',
  'water_in_lean_mass',
  'thorax',
  'shoulders',
  'hips',
  'neck',
  'abdomen',
  'subscapular',
  'biceps_left',
  'biceps_right',
  'forearm_left',
  'forearm_right',
  'thigh_left',
  'thigh_right',
  'calf_left',
  'calf_right',
];

export const MEASUREMENT_SOURCE_FIELD_KEYS = MEASUREMENT_FIELD_DEFINITIONS.map((field) => field.key);

export function getMeasurementFieldDefinition(key) {
  return MEASUREMENT_FIELD_MAP[key] || null;
}

export function getMeasurementFieldLabel(key) {
  return MEASUREMENT_FIELD_MAP[key]?.label || key;
}

export function getMeasurementFieldUnit(key) {
  return MEASUREMENT_FIELD_MAP[key]?.unit || '';
}

export function getMeasurementFieldSourceLabel(source) {
  return MEASUREMENT_SOURCE_LABELS[normalizeMeasurementSource(source)] || 'Manual';
}

export function normalizeMeasurementSource(source) {
  const value = typeof source === 'string' ? source.trim().toLowerCase() : '';

  if (value === 'manual' || value === 'manual_input') return 'manual';
  if (value === 'device' || value === 'device_import' || value === 'scale_import') return 'device_import';
  if (value === 'clinician' || value === 'clinician_import' || value === 'exam_import') return 'clinician_import';
  if (value === 'computed' || value === 'derived') return 'computed';

  return 'manual';
}

export function normalizeFieldSource(source) {
  const value = typeof source === 'string' ? source.trim().toLowerCase() : '';

  if (value === 'manual' || value === 'manual_input') return 'manual_input';
  if (value === 'device_import' || value === 'clinician_import' || value === 'imported_input') return 'imported_input';
  if (value === 'computed' || value === 'derived') return 'derived';

  return null;
}

function isObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function normalizeStringNumber(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string') return null;

  const trimmed = value.trim();
  if (trimmed === '') return null;

  const normalized = trimmed.replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function roundNumber(value, digits = 2) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) {
    return null;
  }

  const factor = 10 ** digits;
  return Math.round(Number(value) * factor) / factor;
}

function formatNumeric(value, digits = 2) {
  const normalized = roundNumber(value, digits);
  return normalized === null ? '--' : normalized.toFixed(digits);
}

function getDateKey(value) {
  if (!value) return null;
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString().split('T')[0];
}

function getRawValue(entry, canonicalKey) {
  const field = MEASUREMENT_FIELD_MAP[canonicalKey];
  if (!field) {
    return entry?.[canonicalKey] ?? null;
  }

  if (entry?.[canonicalKey] !== undefined && entry?.[canonicalKey] !== null && entry?.[canonicalKey] !== '') {
    return entry[canonicalKey];
  }

  if (entry?.[field.storageKey] !== undefined && entry?.[field.storageKey] !== null && entry?.[field.storageKey] !== '') {
    return entry[field.storageKey];
  }

  for (const alias of field.aliases) {
    if (entry?.[alias] !== undefined && entry?.[alias] !== null && entry?.[alias] !== '') {
      return entry[alias];
    }
  }

  return null;
}

function getNormalizedNumericValue(entry, canonicalKey) {
  return normalizeStringNumber(getRawValue(entry, canonicalKey));
}

function resolveFieldSourceSource(field, normalizedSource, explicitFieldSources) {
  const explicit = normalizeFieldSource(
    explicitFieldSources?.[field.key] ??
      explicitFieldSources?.[field.storageKey] ??
      explicitFieldSources?.[field.aliases[0]] ??
      null
  );
  if (explicit) return explicit;

  if (field.section === 'composition') {
    return 'imported_input';
  }

  if (normalizedSource === 'device_import' || normalizedSource === 'clinician_import') {
    return 'imported_input';
  }

  return 'manual_input';
}

function getFieldTolerance(fieldKey) {
  const field = MEASUREMENT_FIELD_MAP[fieldKey];
  if (!field) return 0.1;

  if (field.unit === '%') return 0.5;
  if (field.key === 'bmi') return 0.1;
  if (field.key === 'muscle_fat_ratio') return 0.05;
  if (field.key === 'water_in_lean_mass') return 0.05;
  if (field.unit === 'ratio') return 0.05;
  if (field.unit === 'kg/m²') return 0.1;
  if (field.unit === 'years') return 0.5;

  return 0.2;
}

function addIssue(issues, issue) {
  issues.push(issue);
}

export function computeDerivedMeasurementFields(entry, options = {}) {
  const allowApproximateWaterInLeanMass = options.allowApproximateWaterInLeanMass !== false;

  const weight = getNormalizedNumericValue(entry, 'weight');
  const heightCm = getNormalizedNumericValue(entry, 'height');
  const bodyFatPercent = getNormalizedNumericValue(entry, 'body_fat_percent');
  const fatMassInput = getNormalizedNumericValue(entry, 'fat_mass');
  const leanMassInput = getNormalizedNumericValue(entry, 'lean_mass');
  const muscleMass = getNormalizedNumericValue(entry, 'muscle_mass');
  const totalBodyWater = getNormalizedNumericValue(entry, 'total_body_water');
  const intracellularWater = getNormalizedNumericValue(entry, 'intracellular_water');

  const derived = {};

  if (weight !== null && heightCm !== null && weight > 0 && heightCm > 0) {
    derived.bmi = roundNumber(weight / ((heightCm / 100) ** 2), MEASUREMENT_FIELD_MAP.bmi.precision);
  }

  if (weight !== null && weight > 0) {
    if (bodyFatPercent !== null) {
      derived.fat_mass = roundNumber(
        weight * (bodyFatPercent / 100),
        MEASUREMENT_FIELD_MAP.fat_mass.precision
      );
      derived.lean_mass = roundNumber(
        weight * (1 - bodyFatPercent / 100),
        MEASUREMENT_FIELD_MAP.lean_mass.precision
      );
    } else if (leanMassInput !== null) {
      derived.fat_mass = roundNumber(weight - leanMassInput, MEASUREMENT_FIELD_MAP.fat_mass.precision);
    }

    if (derived.lean_mass === undefined && fatMassInput !== null) {
      derived.lean_mass = roundNumber(
        weight - fatMassInput,
        MEASUREMENT_FIELD_MAP.lean_mass.precision
      );
    }
  }

  const leanMassSource = derived.lean_mass ?? leanMassInput;
  const fatMassSource = derived.fat_mass ?? fatMassInput;

  if (leanMassSource !== null && weight !== null && weight > 0) {
    derived.lean_mass_percent = roundNumber(
      (leanMassSource / weight) * 100,
      MEASUREMENT_FIELD_MAP.lean_mass_percent.precision
    );
    derived.water_in_lean_mass = allowApproximateWaterInLeanMass && totalBodyWater !== null && leanMassSource > 0
      ? roundNumber(
          totalBodyWater / leanMassSource,
          MEASUREMENT_FIELD_MAP.water_in_lean_mass.precision
        )
      : derived.water_in_lean_mass;
  }

  if (muscleMass !== null && weight !== null && weight > 0) {
    derived.muscle_mass_percent = roundNumber(
      (muscleMass / weight) * 100,
      MEASUREMENT_FIELD_MAP.muscle_mass_percent.precision
    );
  }

  if (muscleMass !== null && fatMassSource !== null && fatMassSource !== 0) {
    derived.muscle_fat_ratio = roundNumber(
      muscleMass / fatMassSource,
      MEASUREMENT_FIELD_MAP.muscle_fat_ratio.precision
    );
  }

  if (intracellularWater !== null && totalBodyWater !== null && totalBodyWater !== 0) {
    derived.intracellular_water_percent = roundNumber(
      (intracellularWater / totalBodyWater) * 100,
      MEASUREMENT_FIELD_MAP.intracellular_water_percent.precision
    );
  }

  if (allowApproximateWaterInLeanMass && derived.water_in_lean_mass === undefined && totalBodyWater !== null && leanMassSource !== null && leanMassSource !== 0) {
    derived.water_in_lean_mass = roundNumber(
      totalBodyWater / leanMassSource,
      MEASUREMENT_FIELD_MAP.water_in_lean_mass.precision
    );
  }

  return derived;
}

export function validateMeasurementConsistency(entry, options = {}) {
  const allowApproximateWaterInLeanMass = options.allowApproximateWaterInLeanMass !== false;
  const issues = [];
  const normalizedSource = normalizeMeasurementSource(entry?.source);
  const derived = computeDerivedMeasurementFields(entry, { allowApproximateWaterInLeanMass });

  const weight = getNormalizedNumericValue(entry, 'weight');
  const height = getNormalizedNumericValue(entry, 'height');
  const bodyFatPercent = getNormalizedNumericValue(entry, 'body_fat_percent');
  const fatMass = getNormalizedNumericValue(entry, 'fat_mass');
  const leanMass = getNormalizedNumericValue(entry, 'lean_mass');
  const muscleMass = getNormalizedNumericValue(entry, 'muscle_mass');
  const bmi = getNormalizedNumericValue(entry, 'bmi');
  const leanMassPercent = getNormalizedNumericValue(entry, 'lean_mass_percent');
  const muscleMassPercent = getNormalizedNumericValue(entry, 'muscle_mass_percent');
  const muscleFatRatio = getNormalizedNumericValue(entry, 'muscle_fat_ratio');
  const intracellularWaterPercent = getNormalizedNumericValue(entry, 'intracellular_water_percent');
  const waterInLeanMass = getNormalizedNumericValue(entry, 'water_in_lean_mass');

  const compareField = (fieldKey, actualValue, expectedValue, severity = 'error') => {
    if (actualValue === null || expectedValue === null) return;

    const tolerance = getFieldTolerance(fieldKey);
    const delta = actualValue - expectedValue;

    if (Math.abs(delta) > tolerance) {
      addIssue(issues, {
        field: fieldKey,
        severity,
        expected: expectedValue,
        actual: actualValue,
        delta,
        tolerance,
        message: `${getMeasurementFieldLabel(fieldKey)} is ${formatNumeric(
          actualValue,
          MEASUREMENT_FIELD_MAP[fieldKey]?.precision ?? 2
        )} but the derived value is ${formatNumeric(
          expectedValue,
          MEASUREMENT_FIELD_MAP[fieldKey]?.precision ?? 2
        )}.`,
      });
    }
  };

  compareField('bmi', bmi, derived.bmi);
  compareField('fat_mass', fatMass, derived.fat_mass);
  compareField('lean_mass', leanMass, derived.lean_mass);
  compareField('lean_mass_percent', leanMassPercent, derived.lean_mass_percent);
  compareField('muscle_mass_percent', muscleMassPercent, derived.muscle_mass_percent);
  compareField('muscle_fat_ratio', muscleFatRatio, derived.muscle_fat_ratio);
  compareField('intracellular_water_percent', intracellularWaterPercent, derived.intracellular_water_percent);

  if (allowApproximateWaterInLeanMass) {
    compareField('water_in_lean_mass', waterInLeanMass, derived.water_in_lean_mass, 'warning');
  }

  if (weight !== null && weight <= 0) {
    addIssue(issues, {
      field: 'weight',
      severity: 'error',
      expected: null,
      actual: weight,
      delta: weight,
      tolerance: 0,
      message: 'Weight must be greater than 0.',
    });
  }

  if (height !== null && height <= 0) {
    addIssue(issues, {
      field: 'height',
      severity: 'error',
      expected: null,
      actual: height,
      delta: height,
      tolerance: 0,
      message: 'Height must be greater than 0.',
    });
  }

  if (bodyFatPercent !== null && (bodyFatPercent < 0 || bodyFatPercent > 100)) {
    addIssue(issues, {
      field: 'body_fat_percent',
      severity: 'error',
      expected: null,
      actual: bodyFatPercent,
      delta: 0,
      tolerance: 0,
      message: 'Body fat % must be between 0 and 100.',
    });
  }

  if (weight !== null && fatMass !== null && leanMass !== null) {
    compareField('weight', weight, fatMass + leanMass);
  }

  if (fatMass !== null && leanMass !== null && weight === null) {
    const total = fatMass + leanMass;
    if (total <= 0) {
      addIssue(issues, {
        field: 'fat_mass',
        severity: 'error',
        expected: null,
        actual: fatMass,
        delta: 0,
        tolerance: 0,
        message: 'Fat mass and lean mass cannot both be zero when present together.',
      });
    }
  }

  if (fatMass !== null && bodyFatPercent !== null && weight !== null) {
    compareField('fat_mass', fatMass, derived.fat_mass);
  }

  if (leanMass !== null && bodyFatPercent !== null && weight !== null) {
    compareField('lean_mass', leanMass, derived.lean_mass);
  }

  if (muscleMass !== null && fatMass !== null && fatMass === 0 && muscleFatRatio !== null) {
    addIssue(issues, {
      field: 'muscle_fat_ratio',
      severity: 'error',
      expected: null,
      actual: muscleFatRatio,
      delta: 0,
      tolerance: 0,
      message: 'Muscle/fat ratio cannot be validated when fat mass is 0.',
    });
  }

  if (normalizedSource === 'computed' && !entry?.field_sources) {
    addIssue(issues, {
      field: 'source',
      severity: 'warning',
      expected: 'field_sources',
      actual: 'missing',
      delta: 0,
      tolerance: 0,
      message: 'Computed records should carry field source metadata so derived values stay auditable.',
    });
  }

  return {
    valid: issues.every((issue) => issue.severity !== 'error'),
    issues,
    warnings: issues.filter((issue) => issue.severity === 'warning'),
    errors: issues.filter((issue) => issue.severity === 'error'),
  };
}

function normalizeFieldSources(entry, normalizedSource, canonicalValues) {
  const provided = isObject(entry?.field_sources) ? entry.field_sources : {};
  const output = {};

  for (const field of MEASUREMENT_FIELD_DEFINITIONS) {
    const rawValue = getRawValue(entry, field.key);
    const hasRawValue = rawValue !== null && rawValue !== undefined;
    const explicit = normalizeFieldSource(
      provided[field.key] ??
        provided[field.storageKey] ??
        provided[field.aliases[0]] ??
        null
    );

    if (explicit) {
      output[field.key] = explicit;
      continue;
    }

    if (hasRawValue) {
      output[field.key] = resolveFieldSourceSource(field, normalizedSource, provided);
      continue;
    }

    if (canonicalValues[field.key] !== null && canonicalValues[field.key] !== undefined) {
      output[field.key] = resolveFieldSourceSource(field, normalizedSource, provided);
      if (field.canDerive) {
        output[field.key] = 'derived';
      }
    }
  }

  for (const legacyKey of ['arms', 'thighs']) {
    const explicit = normalizeFieldSource(provided[legacyKey]);
    if (explicit) {
      output[legacyKey] = explicit;
    }
  }

  return output;
}

export function normalizeMeasurementEntry(entry = {}, options = {}) {
  const allowApproximateWaterInLeanMass = options.allowApproximateWaterInLeanMass !== false;
  const normalizedSource = normalizeMeasurementSource(entry?.source);
  const normalized = isObject(entry) ? { ...entry } : {};

  for (const field of MEASUREMENT_FIELD_DEFINITIONS) {
    const rawValue = getRawValue(entry, field.key);
    const numericValue = normalizeStringNumber(rawValue);

    normalized[field.key] = numericValue;
    normalized[field.storageKey] = numericValue;
    for (const alias of field.aliases) {
      normalized[alias] = numericValue;
    }
  }

  for (const passthroughKey of ['arms', 'thighs']) {
    if (entry?.[passthroughKey] !== undefined) {
      normalized[passthroughKey] = normalizeStringNumber(entry[passthroughKey]);
    }
  }

  normalized.date = getDateKey(entry?.date) || entry?.date || null;
  normalized.source = normalizedSource;

  if (entry?.notes !== undefined) {
    normalized.notes = typeof entry.notes === 'string' ? entry.notes.trim() : entry.notes;
  }

  const derived = computeDerivedMeasurementFields(normalized, {
    allowApproximateWaterInLeanMass,
  });

  for (const field of MEASUREMENT_DERIVED_FIELDS) {
    const currentValue = normalizeStringNumber(normalized[field.key]);
    if (currentValue === null && derived[field.key] !== undefined) {
      normalized[field.key] = derived[field.key];
      normalized[field.storageKey] = derived[field.key];
    } else if (derived[field.key] !== undefined) {
      normalized[`derived_${field.key}`] = derived[field.key];
    }
  }

  const validation = validateMeasurementConsistency(normalized, {
    allowApproximateWaterInLeanMass,
  });

  normalized.field_sources = normalizeFieldSources(entry, normalizedSource, normalized);
  normalized.consistency_issues = validation.issues;
  normalized.validation_issues = validation.issues;
  normalized.has_consistency_issues = validation.issues.length > 0;
  normalized.is_consistent = validation.valid;

  return normalized;
}

function shouldPersistField(field, explicitFieldSource, resolvedFieldSource) {
  if (!field) return false;

  if (field.canDerive) {
    if (explicitFieldSource === 'imported_input' || resolvedFieldSource === 'imported_input') {
      return true;
    }

    if (resolvedFieldSource === 'derived') {
      return false;
    }
  }

  return true;
}

export function prepareMeasurementWritePayload(entry = {}, options = {}) {
  const normalizedSource = normalizeMeasurementSource(entry?.source ?? options.source);
  const normalized = normalizeMeasurementEntry(
    {
      ...entry,
      source: normalizedSource,
    },
    options
  );
  const explicitFieldSources = isObject(entry?.field_sources) ? entry.field_sources : {};
  const payload = {};

  payload.date = normalized.date || getDateKey(entry?.date) || getToday();
  payload.source = normalizedSource;
  payload.notes = typeof normalized.notes === 'string' ? normalized.notes : normalized.notes ?? null;
  payload.updated_at = new Date().toISOString();
  payload.field_sources = normalized.field_sources;

  for (const field of MEASUREMENT_FIELD_DEFINITIONS) {
    const explicitFieldSource = normalizeFieldSource(
      explicitFieldSources[field.key] ??
        explicitFieldSources[field.storageKey] ??
        explicitFieldSources[field.aliases[0]] ??
        null
    );
    const resolvedFieldSource =
      explicitFieldSource || normalized.field_sources?.[field.key] || resolveFieldSourceSource(field, normalizedSource, explicitFieldSources);

    if (!shouldPersistField(field, explicitFieldSource, resolvedFieldSource)) {
      continue;
    }

    const rawValue = normalizeStringNumber(getRawValue(entry, field.key));
    const valueToPersist =
      rawValue !== null
        ? rawValue
        : normalized[field.key] !== undefined
          ? normalized[field.key]
          : null;

    if (valueToPersist !== null && valueToPersist !== undefined) {
      payload[field.storageKey] = valueToPersist;
    }
  }

  for (const legacyKey of ['arms', 'thighs']) {
    const rawValue = normalizeStringNumber(entry?.[legacyKey]);
    if (rawValue !== null) {
      payload[legacyKey] = rawValue;
    }
  }

  return payload;
}

function createMeasurementValueSchema(field) {
  return z.string().transform((value, ctx) => {
    const normalized = value.trim().replace(',', '.');

    if (normalized === '') {
      return null;
    }

    const parsed = Number(normalized);
    if (!Number.isFinite(parsed)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${field.label} must be a valid number.`,
      });
      return z.NEVER;
    }

    if (field.min !== undefined && field.min !== null && parsed < field.min) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${field.label} must be at least ${field.min}.`,
      });
      return z.NEVER;
    }

    if (field.max !== undefined && field.max !== null && parsed > field.max) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${field.label} must be at most ${field.max}.`,
      });
      return z.NEVER;
    }

    return roundNumber(parsed, field.precision);
  });
}

const manualValueShape = MEASUREMENT_MANUAL_FIELDS.reduce((shape, field) => {
  shape[field.key] = createMeasurementValueSchema(field);
  return shape;
}, {});

const importedCompositionValueShape = MEASUREMENT_IMPORTED_COMPOSITION_FIELDS.reduce((shape, field) => {
  shape[field.key] = createMeasurementValueSchema(field);
  return shape;
}, {});

export function isValidDateKey(value) {
  const dateKey = getDateKey(value);
  return !!dateKey;
}

export const measurementFormSchema = z
  .object({
    date: z
      .string()
      .trim()
      .min(1, 'Select a date for the checkpoint.')
      .refine(isValidDateKey, 'Select a valid date.'),
    source: z.enum(MEASUREMENT_SOURCE_VALUES).default('manual'),
    ...manualValueShape,
    ...importedCompositionValueShape,
    notes: z.string().transform((value) => value.trim()),
  })
  .superRefine((value, ctx) => {
    if (!MEASUREMENT_FORM_FIELD_KEYS.some((field) => value[field] !== null)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Add at least one manual or imported measurement to save the checkpoint.',
      });
    }
  });

export function getMeasurementFormState(measurement, today = getToday()) {
  const state = {
    date: getDateKey(measurement?.date) || today,
    source: normalizeMeasurementSource(measurement?.source),
    notes: typeof measurement?.notes === 'string' ? measurement.notes : '',
  };

  for (const field of MEASUREMENT_FORM_FIELDS) {
    const value = getRawValue(measurement, field.key);
    state[field.key] = value !== null && value !== undefined ? String(value) : '';
  }

  return state;
}

export function getMeasurementFieldErrors(validationResult) {
  if (validationResult.success) {
    return {};
  }

  const flattened = validationResult.error.flatten();
  return ['date', 'source', ...MEASUREMENT_FORM_FIELD_KEYS].reduce((accumulator, field) => {
    accumulator[field] = flattened.fieldErrors[field]?.[0] || null;
    return accumulator;
  }, {});
}

export function getMeasurementValidationSummary(validationResult, formState) {
  if (validationResult.success) {
    return null;
  }

  const flattened = validationResult.error.flatten();
  const fieldErrors = getMeasurementFieldErrors(validationResult);
  const firstFieldError = ['date', 'source', ...MEASUREMENT_FORM_FIELD_KEYS]
    .map((field) => fieldErrors[field])
    .find(Boolean);
  const hasAnyMeasurementInput = MEASUREMENT_FORM_FIELD_KEYS.some(
    (field) => String(formState?.[field] ?? '').trim().length > 0
  );

  if (firstFieldError) {
    return {
      tone: 'error',
      message: flattened.formErrors[0] || firstFieldError || 'Check the highlighted fields before saving.',
    };
  }

  if (!hasAnyMeasurementInput) {
    return {
      tone: 'warning',
      message:
        flattened.formErrors[0] || 'Add at least one manual or imported measurement to save the checkpoint.',
    };
  }

  return {
    tone: 'warning',
    message: flattened.formErrors[0] || 'Check the highlighted fields before saving.',
  };
}

export function getMeasurementFieldValue(entry, key) {
  return getNormalizedNumericValue(entry, key);
}

export function countFilledMeasurementFields(entry, keys = MEASUREMENT_SOURCE_FIELD_KEYS) {
  return keys.filter((key) => {
    const source = normalizeFieldSource(entry?.field_sources?.[key]);
    if (source === 'derived') {
      return false;
    }

    return getMeasurementFieldValue(entry, key) !== null;
  }).length;
}

export function getMeasurementMetricOptions() {
  return MEASUREMENT_TREND_FIELD_KEYS.map((key) => ({
    ...MEASUREMENT_FIELD_MAP[key],
  }));
}
