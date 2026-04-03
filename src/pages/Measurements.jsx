import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DAILY_KEYS } from '@/hooks/useDailyStateV2';
import { AI_COACH_KEY } from '@/hooks/useAICoach';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import MeasurementInsights from '@/components/measurements/MeasurementInsights';
import {
  AppContainer,
  Card,
} from '@/components/shared/AppContainer';
import {
  EmptyState,
  PrimaryButton,
  SafePageBoundary,
  SecondaryButton,
  StatusBanner,
} from '@/components/shared/StablePage';
import { ResponsiveModal } from '@/components/app/ResponsiveModal';
import { useI18n, useT } from '@/lib/i18nContext';
import { useAuth } from '@/lib/AuthContext';
import { cn } from '@/lib/utils';
import {
  MEASUREMENT_COMPOSITION_SECTION,
  MEASUREMENT_FIELD_DEFINITIONS,
  MEASUREMENT_FIELD_MAP,
  MEASUREMENT_MANUAL_FIELD_SECTIONS,
  MEASUREMENT_SOURCE_OPTIONS,
  MEASUREMENT_TREND_FIELD_KEYS,
  computeDerivedMeasurementFields,
  countFilledMeasurementFields,
  getMeasurementFieldErrors,
  getMeasurementFieldSourceLabel,
  getMeasurementFieldValue,
  getMeasurementFormState,
  getMeasurementValidationSummary,
  measurementFormSchema,
} from '@/lib/measurementModel';
import {
  createMeasurement,
  deleteMeasurement,
  listMeasurements,
  updateMeasurement,
} from '@/services/bodyProgressService';

// ── Constants ─────────────────────────────────────────────────────────────────

const FIELD_LABEL_CLASS =
  'block text-[13px] font-semibold tracking-[-0.016em] text-[hsl(var(--fg))]';
const INPUT_CLASS_NAME = 'atlas-field h-10 px-3.5 py-2 text-[14px]';
const TEXTAREA_CLASS_NAME = 'atlas-field min-h-[88px] resize-y px-3.5 py-3 text-[14px]';

const DAY_IN_MS = 1000 * 60 * 60 * 24;

const TABS = ['overview', 'history', 'trends'];

const METRIC_STYLES = {
  weight:                 { color: '#0f766e', tint: 'rgba(15, 118, 110, 0.10)', border: 'rgba(15, 118, 110, 0.24)' },
  body_fat_percent:       { color: '#2563eb', tint: 'rgba(37, 99, 235, 0.10)', border: 'rgba(37, 99, 235, 0.22)' },
  waist:                  { color: '#0891b2', tint: 'rgba(8, 145, 178, 0.10)', border: 'rgba(8, 145, 178, 0.22)' },
  bmi:                    { color: '#1d4ed8', tint: 'rgba(29, 78, 216, 0.10)', border: 'rgba(29, 78, 216, 0.22)' },
  lean_mass:              { color: '#047857', tint: 'rgba(4, 120, 87, 0.10)', border: 'rgba(4, 120, 87, 0.22)' },
  lean_mass_percent:      { color: '#16a34a', tint: 'rgba(22, 163, 74, 0.10)', border: 'rgba(22, 163, 74, 0.22)' },
  fat_mass:               { color: '#a16207', tint: 'rgba(161, 98, 7, 0.10)', border: 'rgba(161, 98, 7, 0.22)' },
  muscle_mass:            { color: '#c2410c', tint: 'rgba(194, 65, 12, 0.10)', border: 'rgba(194, 65, 12, 0.22)' },
  muscle_fat_ratio:       { color: '#7c3aed', tint: 'rgba(124, 58, 237, 0.10)', border: 'rgba(124, 58, 237, 0.22)' },
  total_body_water:       { color: '#475569', tint: 'rgba(71, 85, 105, 0.10)', border: 'rgba(71, 85, 105, 0.22)' },
};

const METRIC_OPTIONS = MEASUREMENT_TREND_FIELD_KEYS.map((key) => {
  const field = MEASUREMENT_FIELD_MAP[key];
  return {
    ...field,
    digits: field?.precision ?? 1,
    ...(METRIC_STYLES[key] || { color: '#475569', tint: 'rgba(71,85,105,0.10)', border: 'rgba(71,85,105,0.22)' }),
  };
});

const METRIC_LOOKUP = METRIC_OPTIONS.reduce((acc, m) => {
  acc[m.key] = m;
  return acc;
}, {});

// Fields shown in the History tab (all manually-inputtable fields)
const HISTORY_DISPLAY_FIELDS = MEASUREMENT_FIELD_DEFINITIONS.filter(
  (f) => f.allowManualInput && f.key !== 'age' && f.key !== 'height'
);

// Step definitions for the stepped form
const FORM_STEPS = [
  { key: 'basics',      isBasics: true, section: MEASUREMENT_MANUAL_FIELD_SECTIONS[0] },
  { key: 'upper',       section: MEASUREMENT_MANUAL_FIELD_SECTIONS[1] },
  { key: 'lower',       section: MEASUREMENT_MANUAL_FIELD_SECTIONS[2] },
  { key: 'composition', section: MEASUREMENT_COMPOSITION_SECTION },
  { key: 'notes',       isNotes: true },
];

const FORM_STEP_TITLE_KEYS = {
  basics:      'measurements.form.step_basics',
  upper:       'measurements.form.step_upper',
  lower:       'measurements.form.step_lower',
  composition: 'measurements.form.step_composition',
  notes:       'measurements.form.step_notes',
};

// ── Utility ───────────────────────────────────────────────────────────────────

function getMutationErrorMessage(error, fallback) {
  if (typeof error === 'string' && error.trim()) return error;
  return error?.message || fallback;
}

function formatMeasurementDate(date, options, locale = 'en-US') {
  if (!date) return '--';
  return new Date(`${date}T12:00:00`).toLocaleDateString(
    locale,
    options || { day: '2-digit', month: '2-digit' }
  );
}

function toDisplayNumber(value, digits = 1) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '--';
  return Number(value).toFixed(digits);
}

function formatMetricValue(value, metric) {
  if (value === null || value === undefined) return '--';
  return `${toDisplayNumber(value, metric?.digits ?? 1)} ${metric?.unit || ''}`.trim();
}

function getDayDifference(fromDate, toDate) {
  if (!fromDate || !toDate) return 0;
  const diff = new Date(`${toDate}T12:00:00`) - new Date(`${fromDate}T12:00:00`);
  return Math.max(0, Math.round(diff / DAY_IN_MS));
}

function getDeltaLabel(delta, metric, t) {
  if (delta === null || delta === undefined)
    return t ? t('measurements.delta.no_previous') : 'No previous data';
  if (Math.abs(delta) < 0.05)
    return t ? t('measurements.delta.no_relevant_change') : 'No relevant change';
  return `${delta > 0 ? '+' : ''}${toDisplayNumber(delta, metric?.digits ?? 1)} ${metric?.unit || ''} ${t ? t('measurements.delta.vs_previous') : 'vs previous'}`.trim();
}

// ── Sub-components ────────────────────────────────────────────────────────────

function QuickStatCard({ label, value, unit, deltaLabel, deltaPositive }) {
  return (
    <div className="rounded-[18px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card)/0.9)] px-3.5 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))] truncate">
        {label}
      </p>
      <div className="mt-1 flex items-baseline gap-1">
        <p className="text-[1.25rem] font-bold tracking-[-0.04em] text-[hsl(var(--fg))] leading-none">
          {value}
        </p>
        {unit && (
          <span className="text-[12px] font-medium text-[hsl(var(--fg-3))]">{unit}</span>
        )}
      </div>
      {deltaLabel && (
        <p className={cn(
          'mt-1 text-[11px] font-medium leading-4 truncate',
          deltaPositive === true  ? 'text-[hsl(var(--ok))]'   :
          deltaPositive === false ? 'text-[hsl(var(--warn))]' :
          'text-[hsl(var(--fg-3))]'
        )}>
          {deltaLabel}
        </p>
      )}
    </div>
  );
}

function MetricCard({ label, value, unit, detail, isActive, onClick }) {
  const content = (
    <div className="px-3.5 py-3.5 text-left">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))] truncate">
        {label}
      </p>
      <div className="mt-1.5 flex items-baseline gap-1">
        <p className="text-[1.0625rem] font-bold tracking-[-0.035em] text-[hsl(var(--fg))] leading-none">
          {value}
        </p>
        {unit && <span className="text-[12px] font-medium text-[hsl(var(--fg-3))]">{unit}</span>}
      </div>
      {detail && (
        <p className="mt-1.5 text-[11px] leading-4 text-[hsl(var(--fg-2))]">{detail}</p>
      )}
    </div>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'rounded-[18px] border text-left transition-all w-full',
          isActive
            ? 'border-[hsl(var(--brand))] bg-[hsl(var(--card))] shadow-[var(--shadow-sm)]'
            : 'border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card)/0.9)] hover:border-[hsl(var(--border))] hover:bg-[hsl(var(--card))]'
        )}
      >
        {content}
      </button>
    );
  }

  return (
    <div className="rounded-[18px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card)/0.9)]">
      {content}
    </div>
  );
}

function SnapshotRow({ label, value, unit }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[hsl(var(--border)/0.25)] last:border-0">
      <p className="text-[13px] text-[hsl(var(--fg-2))]">{label}</p>
      <p className="text-[13px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
        {value}
        {unit ? <span className="ml-1 text-[11px] font-medium text-[hsl(var(--fg-3))]">{unit}</span> : null}
      </p>
    </div>
  );
}

function HistoryRow({ measurement, previousMeasurement, onEdit, onDelete }) {
  const t = useT();
  const { locale } = useI18n();
  const daysSincePrevious = previousMeasurement
    ? getDayDifference(previousMeasurement.date, measurement.date)
    : null;

  const formatDelta = (delta, unit, lowerIsBetter = false) => {
    if (delta === null) return null;
    const isGood = lowerIsBetter ? delta < 0 : delta > 0;
    return (
      <span className={`text-[11px] font-semibold ${isGood ? 'text-[hsl(var(--ok))]' : 'text-[hsl(var(--warn))]'}`}>
        {delta > 0 ? '+' : ''}{delta.toFixed(1)}{unit}
      </span>
    );
  };

  // Collect all filled fields for this measurement
  const filledFields = HISTORY_DISPLAY_FIELDS
    .map((field) => {
      const value = getMeasurementFieldValue(measurement, field.key);
      if (value === null) return null;
      const prevValue = previousMeasurement ? getMeasurementFieldValue(previousMeasurement, field.key) : null;
      const delta = value !== null && prevValue !== null ? value - prevValue : null;
      return { field, value, delta };
    })
    .filter(Boolean);

  const filledCount = filledFields.length;
  const intlLocale = locale === 'pt-BR' ? 'pt-BR' : locale === 'es' ? 'es-ES' : 'en-US';

  return (
    <div className="rounded-[18px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card)/0.82)] px-4 py-3.5 hover:bg-[hsl(var(--card))] transition-colors">
      {/* Header row: date + source + actions */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <div>
          <p className="text-[14px] font-semibold text-[hsl(var(--fg))]">
            {formatMeasurementDate(measurement.date, { day: '2-digit', month: 'long', year: 'numeric' }, intlLocale)}
          </p>
          <p className="text-[11px] text-[hsl(var(--fg-3))]">
            {daysSincePrevious
              ? t('measurements.history.days_after').replace('{n}', daysSincePrevious)
              : t('measurements.history.first')}
            {filledCount > 0 && ` · ${filledCount} ${filledCount === 1 ? 'field' : 'fields'}`}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onEdit}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--fill)/0.8)] hover:text-[hsl(var(--fg))]"
          >
            <Pencil className="h-3.5 w-3.5" strokeWidth={1.9} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--err)/0.1)] hover:text-[hsl(var(--err))]"
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.9} />
          </button>
        </div>
      </div>

      {/* All filled measurement fields in a grid */}
      {filledFields.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-2 pt-1 border-t border-[hsl(var(--border)/0.3)]">
          {filledFields.map(({ field, value, delta }) => (
            <div key={field.key}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[hsl(var(--fg-3))] truncate">{field.label}</p>
              <p className="text-[13px] font-semibold text-[hsl(var(--fg))]">
                {toDisplayNumber(value, field.precision ?? 1)}
                <span className="text-[11px] font-medium text-[hsl(var(--fg-3))] ml-0.5">{field.unit}</span>
              </p>
              {delta !== null && formatDelta(delta, field.unit, true)}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[12px] text-[hsl(var(--fg-3))] pt-1 border-t border-[hsl(var(--border)/0.3)]">
          {t('measurements.history.no_fields_recorded') || 'No measurement fields recorded'}
        </p>
      )}

      {/* Notes preview */}
      {measurement.notes && (
        <p className="text-[12px] text-[hsl(var(--fg-2))] mt-2 line-clamp-2 italic">
          {measurement.notes}
        </p>
      )}
    </div>
  );
}

function MeasurementField({
  label,
  unit,
  hint,
  error,
  as = 'input',
  options = [],
  className = '',
  inputClassName = '',
  ...props
}) {
  return (
    <label className={cn(FIELD_LABEL_CLASS, className)}>
      <div className="flex items-center justify-between gap-3">
        <span>{label}</span>
        {hint ? (
          <span className="text-[11px] font-medium tracking-normal text-[hsl(var(--fg-3))]">{hint}</span>
        ) : null}
      </div>

      <div className="relative mt-1.5">
        {as === 'select' ? (
          <select
            {...props}
            aria-invalid={!!error}
            className={cn(INPUT_CLASS_NAME, error && 'border-[hsl(var(--err)/0.52)] ring-1 ring-[hsl(var(--err)/0.18)]', inputClassName)}
          >
            {options.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        ) : (
          <input
            {...props}
            aria-invalid={!!error}
            className={cn(
              INPUT_CLASS_NAME,
              unit ? 'pr-12' : '',
              error && 'border-[hsl(var(--err)/0.52)] ring-1 ring-[hsl(var(--err)/0.18)]',
              inputClassName
            )}
          />
        )}
        {unit ? (
          <span className="pointer-events-none absolute inset-y-0 right-3.5 inline-flex items-center text-[11px] font-semibold uppercase tracking-[0.08em] text-[hsl(var(--fg-3))]">
            {unit}
          </span>
        ) : null}
      </div>

      {error ? <p className="mt-1.5 text-[12px] font-medium leading-5 text-[hsl(var(--err))]">{error}</p> : null}
    </label>
  );
}

// ── Stepped form ──────────────────────────────────────────────────────────────

function MeasurementSteppedForm({ measurement, onCancel, onSubmit, isSaving, submitError, onClearError }) {
  const t = useT();
  const [form, setForm] = useState(() => getMeasurementFormState(measurement));
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const validation    = useMemo(() => measurementFormSchema.safeParse(form), [form]);
  const fieldErrors   = useMemo(() => getMeasurementFieldErrors(validation), [validation]);
  const derivedPreview = useMemo(() => computeDerivedMeasurementFields(form), [form]);
  const canSubmit     = validation.success && !isSaving;

  const isLastStep    = stepIndex === FORM_STEPS.length - 1;
  const currentStep   = FORM_STEPS[stepIndex];

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    onClearError?.();
  };

  const goNext = () => {
    setDirection(1);
    setStepIndex((prev) => Math.min(prev + 1, FORM_STEPS.length - 1));
  };

  const goPrev = () => {
    setDirection(-1);
    setStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = () => {
    const parsed = measurementFormSchema.safeParse(form);
    if (!parsed.success) return;
    onSubmit(form);
  };

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 0 }}>
      {/* Progress dots */}
      <div className="flex items-center justify-center gap-1.5 px-6 pt-5 pb-1 shrink-0">
        {FORM_STEPS.map((step, i) => (
          <div
            key={step.key}
            className={cn(
              'h-1.5 rounded-full transition-all duration-200',
              i === stepIndex
                ? 'w-5 bg-[hsl(var(--brand))]'
                : i < stepIndex
                  ? 'w-1.5 bg-[hsl(var(--brand)/0.4)]'
                  : 'w-1.5 bg-[hsl(var(--border))]'
            )}
          />
        ))}
      </div>

      {/* Step header */}
      <div className="px-6 pt-3 pb-4 shrink-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[hsl(var(--fg-3))]">
          {t('measurements.form.step_of')
            .replace('{current}', stepIndex + 1)
            .replace('{total}', FORM_STEPS.length)}
        </p>
        <h3 className="mt-0.5 text-[17px] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">
          {t(FORM_STEP_TITLE_KEYS[currentStep.key])}
        </h3>
      </div>

      {/* Step content — scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-4">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep.key}
            custom={direction}
            initial={{ opacity: 0, x: 14 * direction }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 * direction }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Step: Date & Source */}
            {currentStep.isBasics && (
              <div className="grid gap-4">
                <MeasurementField
                  label={t('measurements.form.date_label')}
                  type="date"
                  value={form.date}
                  onChange={(e) => updateField('date', e.target.value)}
                  error={fieldErrors.date}
                />
                <MeasurementField
                  label={t('measurements.form.source_label')}
                  as="select"
                  value={form.source}
                  onChange={(e) => updateField('source', e.target.value)}
                  error={fieldErrors.source}
                  options={MEASUREMENT_SOURCE_OPTIONS}
                  hint={t('measurements.form.source_hint')}
                />
              </div>
            )}

            {/* Step: field section (core / upper / lower / composition) */}
            {currentStep.section && (
              <div className="space-y-3.5">
                {currentStep.section.description && (
                  <p className="text-[12px] text-[hsl(var(--fg-2))] leading-relaxed -mt-1 mb-1">
                    {currentStep.section.description}
                  </p>
                )}
                <div className="grid gap-3.5 sm:grid-cols-2">
                  {currentStep.section.fields.map((field) => (
                    <MeasurementField
                      key={field.key}
                      label={field.label}
                      unit={field.unit}
                      type="text"
                      inputMode="decimal"
                      value={form[field.key]}
                      onChange={(e) => updateField(field.key, e.target.value)}
                      error={fieldErrors[field.key]}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Step: Notes & derived preview */}
            {currentStep.isNotes && (
              <div className="space-y-4">
                {submitError ? <StatusBanner tone="error">{submitError}</StatusBanner> : null}

                {/* Compact derived preview */}
                <div className="rounded-[18px] border border-[hsl(var(--border)/0.8)] bg-[hsl(var(--fill)/0.5)] px-4 py-3.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[hsl(var(--fg-3))] mb-2.5">
                    {t('measurements.form.derived_preview_overline')}
                  </p>
                  <div className="grid grid-cols-2 gap-x-5">
                    {[
                      { key: 'bmi',              labelKey: 'measurements.form.bmi_label',              unit: 'kg/m²', d: 2 },
                      { key: 'fat_mass',          labelKey: 'measurements.form.fat_mass_label',          unit: 'kg',    d: 2 },
                      { key: 'lean_mass',         labelKey: 'measurements.form.lean_mass_label',         unit: 'kg',    d: 2 },
                      { key: 'lean_mass_percent', labelKey: 'measurements.form.lean_mass_percent_label', unit: '%',     d: 1 },
                    ].map(({ key, labelKey, unit, d }) => (
                      <div key={key} className="flex items-baseline justify-between gap-2 py-1.5 border-b border-[hsl(var(--border)/0.2)] last:border-0">
                        <p className="text-[12px] text-[hsl(var(--fg-2))] truncate">{t(labelKey)}</p>
                        <p className="text-[13px] font-semibold text-[hsl(var(--fg))] shrink-0 tabular-nums">
                          {toDisplayNumber(derivedPreview[key], d)}{' '}
                          <span className="text-[11px] font-medium text-[hsl(var(--fg-3))]">{unit}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <label className={FIELD_LABEL_CLASS}>
                  {t('measurements.form.notes_label')}
                  <textarea
                    value={form.notes}
                    onChange={(e) => updateField('notes', e.target.value)}
                    placeholder={t('measurements.form.notes_placeholder')}
                    className={cn(TEXTAREA_CLASS_NAME, 'mt-1.5 w-full')}
                  />
                </label>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation footer — sticky, safe-area aware */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-t border-[hsl(var(--border)/0.7)] px-6 py-4"
           style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))' }}>
        {stepIndex === 0 ? (
          <SecondaryButton type="button" onClick={onCancel}>
            {t('measurements.form.cancel')}
          </SecondaryButton>
        ) : (
          <button
            type="button"
            onClick={goPrev}
            className="inline-flex items-center gap-1 text-[13px] font-semibold text-[hsl(var(--fg-2))] hover:text-[hsl(var(--fg))] transition-colors"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2} />
            {t('measurements.form.previous')}
          </button>
        )}

        {isLastStep ? (
          <PrimaryButton type="button" onClick={handleSubmit} disabled={!canSubmit}>
            {isSaving
              ? t('measurements.form.saving')
              : measurement
                ? t('measurements.form.save_checkpoint')
                : t('measurements.form.log_checkpoint')}
          </PrimaryButton>
        ) : (
          <div className="flex items-center gap-3">
            {!currentStep.isBasics && (
              <button
                type="button"
                onClick={goNext}
                className="text-[13px] font-medium text-[hsl(var(--fg-3))] hover:text-[hsl(var(--fg-2))] transition-colors"
              >
                {t('measurements.form.skip')}
              </button>
            )}
            <PrimaryButton type="button" onClick={goNext}>
              {t('measurements.form.next')}
              <ChevronRight className="ml-1 h-4 w-4" strokeWidth={2} />
            </PrimaryButton>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Page export ───────────────────────────────────────────────────────────────

export default function Measurements({ embedded = false, measurements: propMeasurements }) {
  const { t } = useI18n();

  if (embedded) {
    return <MeasurementsContent embedded measurements={propMeasurements} />;
  }

  return (
    <SafePageBoundary
      title={t('pages.measurements.title')}
      subtitle={t('pages.measurements.subtitle')}
      maxWidth="max-w-6xl"
      fallbackDescription={t('measurements.error_loading')}
    >
      <MeasurementsContent />
    </SafePageBoundary>
  );
}

// ── Main content ──────────────────────────────────────────────────────────────

function MeasurementsContent({ embedded = false, measurements: propMeasurements }) {
  const t = useT();
  const { locale } = useI18n();
  const isPt = locale === 'pt-BR';
  const intlLocale = isPt ? 'pt-BR' : 'en-US';
  const { user } = useAuth();

  const [activeTab, setActiveTab]               = useState('overview');
  const [metricKey, setMetricKey]               = useState('weight');
  const [notice, setNotice]                     = useState(null);
  const [isFormOpen, setIsFormOpen]             = useState(false);
  const [editingMeasurement, setEditingMeasurement] = useState(null);

  const queryClient = useQueryClient();

  const { data: fetchedMeasurements = [], isLoading, isError } = useQuery({
    queryKey: ['measurements', user?.id],
    queryFn:  () => listMeasurements(user.id, 200),
    enabled:  !!user?.id && !propMeasurements,
  });

  const measurements = propMeasurements || fetchedMeasurements;

  // ── Mutations ──────────────────────────────────────────────────────
  const invalidateMeasurements = () => {
    queryClient.invalidateQueries({ queryKey: ['measurements', user?.id] });
    queryClient.invalidateQueries({ queryKey: ['measurements-progress', user?.id] });
    queryClient.invalidateQueries({ queryKey: ['today-measurements-recent', user?.id] });
    queryClient.invalidateQueries({ queryKey: DAILY_KEYS.weight(user?.id) });
    queryClient.invalidateQueries({ queryKey: [AI_COACH_KEY, user?.id] });
  };

  const createMutation = useMutation({
    mutationFn: (data) => createMeasurement(user.id, data),
    onSuccess: () => {
      invalidateMeasurements();
      setIsFormOpen(false);
      setEditingMeasurement(null);
      setNotice({ tone: 'success', message: t('measurements.mutation.created') });
    },
    onError: (error) =>
      setNotice({
        tone: 'error',
        message: t('measurements.mutation.create_error').replace('{msg}', getMutationErrorMessage(error, t('measurements.mutation.please_try_again'))),
      }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateMeasurement(user.id, id, data),
    onSuccess: () => {
      invalidateMeasurements();
      setIsFormOpen(false);
      setEditingMeasurement(null);
      setNotice({ tone: 'success', message: t('measurements.mutation.updated') });
    },
    onError: (error) =>
      setNotice({
        tone: 'error',
        message: t('measurements.mutation.update_error').replace('{msg}', getMutationErrorMessage(error, t('measurements.mutation.please_try_again'))),
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteMeasurement(user.id, id),
    onSuccess: () => {
      invalidateMeasurements();
      setNotice({ tone: 'success', message: t('measurements.mutation.deleted') });
    },
    onError: (error) =>
      setNotice({
        tone: 'error',
        message: t('measurements.mutation.delete_error').replace('{msg}', getMutationErrorMessage(error, t('measurements.mutation.please_try_again'))),
      }),
  });

  // ── Derived data ───────────────────────────────────────────────────
  const sortedMeasurements = useMemo(
    () => [...measurements].sort((a, b) => new Date(a.date) - new Date(b.date)),
    [measurements]
  );

  const measurementHistory = useMemo(
    () =>
      sortedMeasurements
        .map((m, i) => ({ measurement: m, previousMeasurement: i > 0 ? sortedMeasurements[i - 1] : null }))
        .reverse(),
    [sortedMeasurements]
  );

  const latestMeasurement = sortedMeasurements[sortedMeasurements.length - 1] || null;
  const firstMeasurement  = sortedMeasurements[0] || null;

  const captureSpanDays =
    latestMeasurement && firstMeasurement
      ? getDayDifference(firstMeasurement.date, latestMeasurement.date)
      : 0;

  const metricSnapshots = useMemo(() => {
    return METRIC_OPTIONS.reduce((acc, metric) => {
      const entries      = sortedMeasurements.filter((m) => getMeasurementFieldValue(m, metric.key) !== null);
      const latestEntry  = entries[entries.length - 1] || null;
      const previousEntry = entries[entries.length - 2] || null;

      acc[metric.key] = {
        entries,
        latestEntry,
        previousEntry,
        value: latestEntry ? getMeasurementFieldValue(latestEntry, metric.key) : null,
        delta:
          latestEntry && previousEntry
            ? getMeasurementFieldValue(latestEntry, metric.key) - getMeasurementFieldValue(previousEntry, metric.key)
            : null,
        rangeDelta:
          entries.length > 1
            ? getMeasurementFieldValue(latestEntry, metric.key) - getMeasurementFieldValue(entries[0], metric.key)
            : null,
      };
      return acc;
    }, {});
  }, [sortedMeasurements]);

  const selectedMetric   = METRIC_LOOKUP[metricKey] || METRIC_OPTIONS[0];
  const selectedSnapshot = metricSnapshots[metricKey] || { entries: [], value: null, delta: null, rangeDelta: null };

  const chartData = selectedSnapshot.entries.map((m) => ({
    date:  formatMeasurementDate(m.date, undefined, intlLocale),
    value: getMeasurementFieldValue(m, metricKey),
  }));

  const isSaving = createMutation.isPending || updateMutation.isPending;

  // ── Handlers ───────────────────────────────────────────────────────
  const handleCreate = () => {
    setNotice(null);
    setEditingMeasurement(null);
    setIsFormOpen(true);
  };

  const handleEdit = (m) => {
    setNotice(null);
    setEditingMeasurement(m);
    setIsFormOpen(true);
  };

  const handleDelete = (m) => {
    const confirmed = window.confirm(
      t('measurements.confirm_delete').replace(
        '{date}',
        formatMeasurementDate(m.date, { day: '2-digit', month: '2-digit', year: 'numeric' }, intlLocale)
      )
    );
    if (!confirmed) return;
    deleteMutation.mutate(m.id);
  };

  const handleSaveMeasurement = (payload) => {
    const parsed = measurementFormSchema.safeParse(payload);
    if (!parsed.success) {
      const summary = getMeasurementValidationSummary(parsed, payload);
      setNotice({
        tone:    summary?.tone === 'error' ? 'error' : 'warning',
        message: summary?.message || t('measurements.mutation.validation_error'),
      });
      return;
    }
    if (editingMeasurement?.id) {
      updateMutation.mutate({ id: editingMeasurement.id, data: parsed.data });
    } else {
      createMutation.mutate(parsed.data);
    }
  };

  // ── Loading / error ────────────────────────────────────────────────
  if (isLoading) {
    const spinner = (
      <div className="flex items-center justify-center py-20">
        <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-[hsl(var(--brand)/0.18)] border-t-[hsl(var(--brand))]" />
      </div>
    );
    return embedded ? spinner : <AppContainer>{spinner}</AppContainer>;
  }

  if (isError) {
    const err = <StatusBanner tone="error">{t('measurements.error_loading')}</StatusBanner>;
    return embedded ? err : <AppContainer>{err}</AppContainer>;
  }

  // ── Layout ─────────────────────────────────────────────────────────

  const weightSnap   = metricSnapshots.weight;
  const bfSnap       = metricSnapshots.body_fat_percent;
  const waistSnap    = metricSnapshots.waist;

  const pageBody = (
    <>
      {/* ── Compact header ── */}
      {!embedded && (
        <div className="flex items-start justify-between gap-4 pt-2 pb-1">
          <div>
            <p className="atlas-overline">{t('measurements.eyebrow')}</p>
            <h1 className="mt-1.5 text-[22px] font-bold tracking-[-0.04em] text-[hsl(var(--fg))]">
              {t('measurements.title_short')}
            </h1>
          </div>
          <PrimaryButton
            type="button"
            onClick={handleCreate}
            className="mt-1 shrink-0 inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" strokeWidth={1.9} />
            <span className="hidden sm:inline">{t('measurements.log_measurements')}</span>
            <span className="sm:hidden">{t('measurements.hero.log_short')}</span>
          </PrimaryButton>
        </div>
      )}

      {/* ── Notice banner ── */}
      {notice?.message ? (
        <StatusBanner tone={notice.tone}>{notice.message}</StatusBanner>
      ) : null}

      {/* ── Quick stats row ── */}
      <div className="grid grid-cols-3 gap-2.5">
        <QuickStatCard
          label={t('measurements.hero.current_weight')}
          value={latestMeasurement ? toDisplayNumber(weightSnap?.value) : '--'}
          unit={latestMeasurement ? 'kg' : undefined}
          deltaLabel={weightSnap?.delta !== null && weightSnap?.delta !== undefined
            ? getDeltaLabel(weightSnap.delta, METRIC_LOOKUP.weight, t)
            : undefined}
          deltaPositive={weightSnap?.delta !== null ? weightSnap?.delta < 0 : undefined}
        />
        <QuickStatCard
          label={t('measurements.hero.body_fat_percent')}
          value={latestMeasurement ? toDisplayNumber(bfSnap?.value) : '--'}
          unit={latestMeasurement ? '%' : undefined}
          deltaLabel={bfSnap?.delta !== null && bfSnap?.delta !== undefined
            ? getDeltaLabel(bfSnap.delta, METRIC_LOOKUP.body_fat_percent, t)
            : undefined}
          deltaPositive={bfSnap?.delta !== null ? bfSnap?.delta < 0 : undefined}
        />
        <QuickStatCard
          label={t('measurements.latest_checkpoint.waist')}
          value={latestMeasurement ? toDisplayNumber(waistSnap?.value) : '--'}
          unit={latestMeasurement ? 'cm' : undefined}
          deltaLabel={waistSnap?.delta !== null && waistSnap?.delta !== undefined
            ? getDeltaLabel(waistSnap.delta, METRIC_LOOKUP.waist, t)
            : undefined}
          deltaPositive={waistSnap?.delta !== null ? waistSnap?.delta < 0 : undefined}
        />
      </div>

      {/* ── Tab bar — sticky below page header ── */}
      <div className="flex items-center -mb-px border-b border-[hsl(var(--border)/0.5)] sticky top-0 bg-[hsl(var(--bg))] z-10 -mx-4 px-4 sm:-mx-6 sm:px-6">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2.5 text-[13px] font-semibold tracking-[-0.01em] border-b-2 transition-colors',
              activeTab === tab
                ? 'border-[hsl(var(--brand))] text-[hsl(var(--fg))]'
                : 'border-transparent text-[hsl(var(--fg-2))] hover:text-[hsl(var(--fg))]'
            )}
          >
            {t(`measurements.tabs.${tab}`)}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.14, ease: 'easeOut' }}
          className="space-y-5 pb-6"
        >
          {/* ──── Overview tab ──── */}
          {activeTab === 'overview' && (
            <>
              {latestMeasurement ? (
                <Card className="px-5 py-5">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <p className="atlas-overline">{t('measurements.latest_checkpoint.overline')}</p>
                      <p className="mt-2 text-[16px] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">
                        {formatMeasurementDate(latestMeasurement.date, { day: '2-digit', month: 'long', year: 'numeric' }, intlLocale)}
                      </p>
                      <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.6)] px-3 py-1 text-[11px] font-semibold text-[hsl(var(--fg-2))]">
                        {t('measurements.latest_checkpoint.source_label')}
                        <span className="text-[hsl(var(--fg))]">{getMeasurementFieldSourceLabel(latestMeasurement?.source)}</span>
                      </div>
                    </div>
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[16px] border border-[rgba(14,165,233,0.18)] bg-[rgba(14,165,233,0.1)] text-[#0891b2]">
                      <BarChart3 className="h-4 w-4" strokeWidth={1.9} />
                    </div>
                  </div>

                  <div>
                    <SnapshotRow label={t('measurements.latest_checkpoint.weight')}   value={toDisplayNumber(getMeasurementFieldValue(latestMeasurement, 'weight'))}           unit="kg" />
                    <SnapshotRow label={t('measurements.latest_checkpoint.body_fat')} value={toDisplayNumber(getMeasurementFieldValue(latestMeasurement, 'body_fat_percent'))} unit="%" />
                    <SnapshotRow label={t('measurements.latest_checkpoint.waist')}    value={toDisplayNumber(getMeasurementFieldValue(latestMeasurement, 'waist'))}            unit="cm" />
                    <SnapshotRow label={t('measurements.latest_checkpoint.bmi')}      value={toDisplayNumber(getMeasurementFieldValue(latestMeasurement, 'bmi'), 2)}           unit="kg/m²" />
                    <SnapshotRow label={t('measurements.latest_checkpoint.fat_mass')} value={toDisplayNumber(getMeasurementFieldValue(latestMeasurement, 'fat_mass'), 2)}      unit="kg" />
                    <SnapshotRow label={t('measurements.latest_checkpoint.lean_mass')} value={toDisplayNumber(getMeasurementFieldValue(latestMeasurement, 'lean_mass'), 2)}   unit="kg" />
                  </div>

                  {latestMeasurement.notes ? (
                    <div className="mt-4 rounded-[16px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--fill)/0.4)] px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[hsl(var(--fg-3))] mb-1.5">
                        {t('measurements.latest_checkpoint.context_label')}
                      </p>
                      <p className="text-[13px] leading-6 text-[hsl(var(--fg-2))]">{latestMeasurement.notes}</p>
                    </div>
                  ) : null}
                </Card>
              ) : (
                <EmptyState
                  title={t('measurements.latest_checkpoint.no_records_title')}
                  description={t('measurements.latest_checkpoint.no_records_description')}
                  action={
                    <PrimaryButton type="button" onClick={handleCreate}>
                      {t('measurements.log_measurements')}
                    </PrimaryButton>
                  }
                />
              )}

              {sortedMeasurements.length > 0 && (
                <>
                  {/* Coverage */}
                  <div className="rounded-[20px] border border-[hsl(var(--border)/0.8)] bg-[hsl(var(--fill)/0.5)] px-5 py-4">
                    <p className="atlas-overline mb-3">{t('measurements.coverage.overline')}</p>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[hsl(var(--fg-3))]">{t('measurements.coverage.analysis_window_title')}</p>
                        <p className="mt-1 text-[14px] font-semibold text-[hsl(var(--fg))]">
                          {captureSpanDays} {t('measurements.hero.days')}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[hsl(var(--fg-3))]">{t('measurements.coverage.latest_coverage_title')}</p>
                        <p className="mt-1 text-[14px] font-semibold text-[hsl(var(--fg))]">
                          {t('measurements.coverage.latest_coverage_detail').replace('{n}', latestMeasurement ? countFilledMeasurementFields(latestMeasurement) : 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[hsl(var(--fg-3))]">{t('measurements.coverage.starting_baseline_title')}</p>
                        <p className="mt-1 text-[14px] font-semibold text-[hsl(var(--fg))]">
                          {firstMeasurement ? formatMeasurementDate(firstMeasurement.date, { day: '2-digit', month: 'short', year: 'numeric' }, intlLocale) : '--'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[hsl(var(--fg-3))]">{t('measurements.hero.cadence')}</p>
                        <p className="mt-1 text-[14px] font-semibold text-[hsl(var(--fg))]">
                          {t('measurements.hero.entries').replace('{n}', sortedMeasurements.length)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* AI Insights */}
                  <MeasurementInsights measurements={sortedMeasurements} latest={latestMeasurement} />
                </>
              )}
            </>
          )}

          {/* ──── History tab ──── */}
          {activeTab === 'history' && (
            <>
              {!measurementHistory.length ? (
                <EmptyState
                  title={t('measurements.history.no_records_title')}
                  description={t('measurements.history.no_records_description')}
                  action={
                    <PrimaryButton type="button" onClick={handleCreate}>
                      {t('measurements.log_measurements')}
                    </PrimaryButton>
                  }
                />
              ) : (
                <div className="space-y-2.5">
                  {measurementHistory.map(({ measurement, previousMeasurement }) => (
                    <HistoryRow
                      key={measurement.id}
                      measurement={measurement}
                      previousMeasurement={previousMeasurement}
                      onEdit={() => handleEdit(measurement)}
                      onDelete={() => handleDelete(measurement)}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* ──── Trends tab ──── */}
          {activeTab === 'trends' && (
            <>
              {!sortedMeasurements.length ? (
                <EmptyState
                  title={t('measurements.trend.no_measurements_title')}
                  description={t('measurements.trend.no_measurements_description')}
                />
              ) : (
                <>
                  {/* Metric selector grid */}
                  <div className="grid gap-2.5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {METRIC_OPTIONS.map((metric) => (
                      <MetricCard
                        key={metric.key}
                        label={metric.label}
                        value={formatMetricValue(metricSnapshots[metric.key]?.value, metric)}
                        detail={
                          metricSnapshots[metric.key]?.entries?.length
                            ? t('measurements.metric_selector.checkpoints_with_metric').replace('{n}', metricSnapshots[metric.key].entries.length)
                            : t('measurements.metric_selector.insufficient_data')
                        }
                        isActive={metricKey === metric.key}
                        onClick={() => setMetricKey(metric.key)}
                      />
                    ))}
                  </div>

                  {/* Chart card */}
                  <div className="overflow-hidden rounded-[24px] border border-[hsl(var(--border)/0.9)] bg-[hsl(var(--card)/0.88)] shadow-[var(--shadow-xs)]">
                    <div
                      className="border-b border-[hsl(var(--border)/0.82)] px-5 py-4"
                      style={{ background: `linear-gradient(180deg, ${selectedMetric.tint} 0%, hsl(var(--card) / 0.82) 100%)` }}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="atlas-overline">{t('measurements.trend.selected_metric_overline')}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <h3 className="text-[1.25rem] font-semibold tracking-[-0.04em] text-[hsl(var(--fg))]">
                              {selectedMetric.label}
                            </h3>
                            <span
                              className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[12px] font-semibold tracking-[-0.01em]"
                              style={{ borderColor: selectedMetric.border, background: selectedMetric.tint, color: selectedMetric.color }}
                            >
                              {getDeltaLabel(selectedSnapshot.delta, selectedMetric, t)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-5">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[hsl(var(--fg-3))]">{t('measurements.trend.current')}</p>
                            <p className="mt-0.5 text-[14px] font-semibold text-[hsl(var(--fg))]">{formatMetricValue(selectedSnapshot.value, selectedMetric)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[hsl(var(--fg-3))]">{t('measurements.trend.since_start')}</p>
                            <p className="mt-0.5 text-[14px] font-semibold text-[hsl(var(--fg))]">
                              {selectedSnapshot.rangeDelta === null
                                ? t('measurements.trend.no_data')
                                : `${selectedSnapshot.rangeDelta > 0 ? '+' : ''}${toDisplayNumber(selectedSnapshot.rangeDelta, selectedMetric.digits)} ${selectedMetric.unit}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="h-[280px] px-4 pb-4 pt-3 lg:px-6 lg:pb-5">
                      {chartData.filter((d) => d.value !== null && d.value !== undefined).length < 2 ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <BarChart3 className="h-8 w-8 mx-auto text-[hsl(var(--fg-3))] mb-2" strokeWidth={1.4} />
                            <p className="text-[13px] font-semibold text-[hsl(var(--fg-2))]">
                              {t('measurements.trend.not_enough_data_for_chart') || 'Not enough data to chart'}
                            </p>
                            <p className="text-[12px] text-[hsl(var(--fg-3))] mt-1">
                              {t('measurements.trend.need_two_checkpoints') || 'Log at least 2 checkpoints with this metric'}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData}>
                            <defs>
                              <linearGradient id={`mfill-${metricKey}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor={selectedMetric.color} stopOpacity={0.22} />
                                <stop offset="95%" stopColor={selectedMetric.color} stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} stroke="hsl(var(--border) / 0.75)" strokeDasharray="4 6" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tickMargin={10} fontSize={11} stroke="hsl(var(--fg-3))" />
                            <YAxis axisLine={false} tickLine={false} tickMargin={10} width={38} fontSize={11} stroke="hsl(var(--fg-3))" tickFormatter={(v) => toDisplayNumber(v, selectedMetric.digits)} />
                            <Tooltip
                              cursor={{ stroke: 'hsl(var(--border) / 0.9)', strokeDasharray: '4 4' }}
                              contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border) / 0.88)', borderRadius: '16px', boxShadow: 'var(--shadow-md)' }}
                              labelStyle={{ color: 'hsl(var(--fg-2))', fontSize: 11, fontWeight: 600 }}
                              formatter={(v) => [formatMetricValue(v, selectedMetric), selectedMetric.label]}
                              labelFormatter={(label) => t('measurements.trend.checkpoint_tooltip').replace('{n}', label)}
                            />
                            <Area type="monotone" dataKey="value" stroke="transparent" fill={`url(#mfill-${metricKey})`} />
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke={selectedMetric.color}
                              strokeWidth={2.5}
                              dot={{ r: 3, fill: selectedMetric.color, stroke: '#fff', strokeWidth: 2 }}
                              activeDot={{ r: 5, fill: selectedMetric.color, stroke: '#fff', strokeWidth: 2 }}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── Stepped form modal ── */}
      <ResponsiveModal
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingMeasurement(null);
        }}
        dialogClassName="h-[84vh] p-0 sm:max-w-[30rem] overflow-hidden flex flex-col"
        dialogProps={{ onOpenAutoFocus: (e) => e.preventDefault() }}
        drawerClassName="h-[84dvh] pb-0 overflow-hidden flex flex-col"
      >
        <MeasurementSteppedForm
          key={editingMeasurement?.id || 'new'}
          measurement={editingMeasurement}
          isSaving={isSaving}
          submitError={notice?.tone === 'error' ? notice.message : null}
          onClearError={() => { if (notice?.tone === 'error') setNotice(null); }}
          onCancel={() => { setIsFormOpen(false); setEditingMeasurement(null); }}
          onSubmit={handleSaveMeasurement}
        />
      </ResponsiveModal>
    </>
  );

  return embedded
    ? <div className="space-y-5">{pageBody}</div>
    : <AppContainer><div className="space-y-5">{pageBody}</div></AppContainer>;
}
