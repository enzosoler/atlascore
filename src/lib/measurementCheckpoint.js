import { z } from 'zod';
import { getToday } from './atlas-theme.js';

export const BODY_FIELD_KEYS = ['weight', 'body_fat', 'waist', 'chest', 'arms', 'thighs', 'hips', 'neck'];

const BODY_FIELD_LABELS = {
  weight: 'Weight',
  body_fat: 'Body fat',
  waist: 'Waist',
  chest: 'Chest',
  arms: 'Arms',
  thighs: 'Thighs',
  hips: 'Hips',
  neck: 'Neck',
};

function isValidDateKey(value) {
  if (typeof value !== 'string' || value.trim() === '') {
    return false;
  }

  const parsed = new Date(`${value}T12:00:00`);
  return !Number.isNaN(parsed.getTime());
}

function createMeasurementValueSchema(label) {
  return z.string().transform((value, ctx) => {
    const normalized = value.trim().replace(',', '.');

    if (normalized === '') {
      return null;
    }

    const parsed = Number(normalized);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${label} must be greater than 0.`,
      });
      return z.NEVER;
    }

    return parsed;
  });
}

export const measurementFormSchema = z
  .object({
    date: z
      .string()
      .trim()
      .min(1, 'Select a date for the checkpoint.')
      .refine(isValidDateKey, 'Select a valid date.'),
    weight: createMeasurementValueSchema(BODY_FIELD_LABELS.weight),
    body_fat: createMeasurementValueSchema(BODY_FIELD_LABELS.body_fat),
    waist: createMeasurementValueSchema(BODY_FIELD_LABELS.waist),
    chest: createMeasurementValueSchema(BODY_FIELD_LABELS.chest),
    arms: createMeasurementValueSchema(BODY_FIELD_LABELS.arms),
    thighs: createMeasurementValueSchema(BODY_FIELD_LABELS.thighs),
    hips: createMeasurementValueSchema(BODY_FIELD_LABELS.hips),
    neck: createMeasurementValueSchema(BODY_FIELD_LABELS.neck),
    notes: z.string().transform((value) => value.trim()),
  })
  .superRefine((value, ctx) => {
    if (!BODY_FIELD_KEYS.some((field) => value[field] !== null)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Add at least one measurement to save the checkpoint.',
      });
    }
  });

export function getMeasurementFormState(measurement, today = getToday()) {
  return {
    date: measurement?.date || today,
    weight: measurement?.weight != null ? String(measurement.weight) : '',
    body_fat: measurement?.body_fat != null ? String(measurement.body_fat) : '',
    waist: measurement?.waist != null ? String(measurement.waist) : '',
    chest: measurement?.chest != null ? String(measurement.chest) : '',
    arms: measurement?.arms != null ? String(measurement.arms) : '',
    thighs: measurement?.thighs != null ? String(measurement.thighs) : '',
    hips: measurement?.hips != null ? String(measurement.hips) : '',
    neck: measurement?.neck != null ? String(measurement.neck) : '',
    notes: measurement?.notes || '',
  };
}

export function getMeasurementFieldErrors(validationResult) {
  if (validationResult.success) {
    return {};
  }

  const flattened = validationResult.error.flatten();
  return ['date', ...BODY_FIELD_KEYS].reduce((accumulator, field) => {
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
  const firstFieldError = ['date', ...BODY_FIELD_KEYS].map((field) => fieldErrors[field]).find(Boolean);
  const hasAnyMeasurementInput = BODY_FIELD_KEYS.some(
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
        flattened.formErrors[0] || 'Add at least one measurement to save the checkpoint.',
    };
  }

  return {
    tone: 'warning',
    message: flattened.formErrors[0] || 'Check the highlighted fields before saving.',
  };
}
