import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarClock,
  Minus,
  Pencil,
  Plus,
  Ruler,
  Scale,
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
  ActionRow,
  AppContainer,
  Card,
  PageHeader,
  Section,
} from '@/components/shared/AppContainer';
import {
  DialogPanelHeader,
  EmptyState,
  PrimaryButton,
  SafePageBoundary,
  SecondaryButton,
  SectionCard,
  StatusBanner,
} from '@/components/shared/StablePage';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useI18n } from '@/lib/i18nContext';
import { useAuth } from '@/lib/AuthContext';
import { cn } from '@/lib/utils';
import {
  MEASUREMENT_COMPOSITION_SECTION,
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

const FIELD_LABEL_CLASS =
  'block text-[13px] font-semibold tracking-[-0.016em] text-[hsl(var(--fg))]';
const INPUT_CLASS_NAME = 'atlas-field h-11 px-4 py-2 text-base';
const TEXTAREA_CLASS_NAME = 'atlas-field min-h-[120px] resize-y px-4 py-3 text-base';

const DAY_IN_MS = 1000 * 60 * 60 * 24;

const METRIC_STYLES = {
  teal: { color: '#0f766e', tint: 'rgba(15, 118, 110, 0.10)', border: 'rgba(15, 118, 110, 0.24)' },
  blue: { color: '#2563eb', tint: 'rgba(37, 99, 235, 0.10)', border: 'rgba(37, 99, 235, 0.22)' },
  cyan: { color: '#0891b2', tint: 'rgba(8, 145, 178, 0.10)', border: 'rgba(8, 145, 178, 0.22)' },
  indigo: { color: '#1d4ed8', tint: 'rgba(29, 78, 216, 0.10)', border: 'rgba(29, 78, 216, 0.22)' },
  emerald: { color: '#047857', tint: 'rgba(4, 120, 87, 0.10)', border: 'rgba(4, 120, 87, 0.22)' },
  lime: { color: '#16a34a', tint: 'rgba(22, 163, 74, 0.10)', border: 'rgba(22, 163, 74, 0.22)' },
  amber: { color: '#a16207', tint: 'rgba(161, 98, 7, 0.10)', border: 'rgba(161, 98, 7, 0.22)' },
  orange: { color: '#c2410c', tint: 'rgba(194, 65, 12, 0.10)', border: 'rgba(194, 65, 12, 0.22)' },
  violet: { color: '#7c3aed', tint: 'rgba(124, 58, 237, 0.10)', border: 'rgba(124, 58, 237, 0.22)' },
  slate: { color: '#475569', tint: 'rgba(71, 85, 105, 0.10)', border: 'rgba(71, 85, 105, 0.22)' },
};

const METRIC_OPTIONS = MEASUREMENT_TREND_FIELD_KEYS.map((key) => {
  const field = MEASUREMENT_FIELD_MAP[key];

  return {
    ...field,
    digits: field?.precision ?? 1,
    ...(METRIC_STYLES[key] || METRIC_STYLES.slate),
  };
});

const METRIC_LOOKUP = METRIC_OPTIONS.reduce((accumulator, metric) => {
  accumulator[metric.key] = metric;
  return accumulator;
}, {});

const BODY_SITE_FIELDS = MEASUREMENT_MANUAL_FIELD_SECTIONS.flatMap((section) => section.fields).filter(
  (field) => !['weight', 'age', 'height', 'waist', 'body_fat_percent'].includes(field.key)
);
const BODY_SITE_FIELDS_NO_WAIST = BODY_SITE_FIELDS.filter((field) => field.key !== 'waist');

const FORM_IMPORTED_SECTION = {
  ...MEASUREMENT_COMPOSITION_SECTION,
  className: 'rounded-[26px] border border-[hsl(var(--border)/0.85)] bg-[hsl(var(--card)/0.82)] px-5 py-5',
};

const FORM_SECTIONS = MEASUREMENT_MANUAL_FIELD_SECTIONS.map((section, index) => ({
  ...section,
  className:
    index === 0
      ? 'rounded-[26px] border border-[hsl(var(--border)/0.85)] bg-[hsl(var(--fill)/0.5)] px-5 py-5'
      : 'rounded-[26px] border border-[hsl(var(--border)/0.85)] bg-[hsl(var(--card)/0.82)] px-5 py-5',
})).concat(FORM_IMPORTED_SECTION);

function getMutationErrorMessage(error, fallbackMessage) {
  if (typeof error === 'string' && error.trim()) {
    return error;
  }

  return error?.message || fallbackMessage;
}

function formatMeasurementDate(date, options) {
  if (!date) return '--';

  return new Date(`${date}T12:00:00`).toLocaleDateString(
    'en-US',
    options || {
      day: '2-digit',
      month: '2-digit',
    }
  );
}

function toDisplayNumber(value, digits = 1) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '--';
  }

  return Number(value).toFixed(digits);
}

function formatMetricValue(value, metric) {
  if (value === null || value === undefined) return '--';
  return `${toDisplayNumber(value, metric?.digits ?? 1)} ${metric?.unit || ''}`.trim();
}

function getDayDifference(fromDate, toDate) {
  if (!fromDate || !toDate) return 0;
  const difference = new Date(`${toDate}T12:00:00`) - new Date(`${fromDate}T12:00:00`);
  return Math.max(0, Math.round(difference / DAY_IN_MS));
}

function countFilledMetrics(measurement) {
  return countFilledMeasurementFields(measurement);
}

function getDeltaIcon(delta) {
  if (delta === null || delta === undefined || Math.abs(delta) < 0.05) return Minus;
  return delta > 0 ? ArrowUpRight : ArrowDownRight;
}

function getDeltaLabel(delta, metric) {
  if (delta === null || delta === undefined) return 'No previous data';
  if (Math.abs(delta) < 0.05) return 'No relevant change';
  return `${delta > 0 ? '+' : ''}${toDisplayNumber(delta, metric?.digits ?? 1)} ${metric?.unit || ''} vs previous`.trim();
}

function HeroStat({ label, value, detail, icon: Icon, metric }) {
  return (
    <article
      className="rounded-[26px] border bg-[hsl(var(--card)/0.78)] px-4 py-4 shadow-[var(--shadow-xs)]"
      style={{
        borderColor: metric?.border || 'hsl(var(--border) / 0.88)',
        background: metric
          ? `linear-gradient(180deg, ${metric.tint} 0%, hsl(var(--card) / 0.88) 100%)`
          : undefined,
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="atlas-metric-label">{label}</p>
          <p className="mt-3 text-[1.35rem] font-semibold tracking-[-0.045em] text-[hsl(var(--fg))]">
            {value}
          </p>
          <p className="mt-2 text-[13px] leading-6 text-[hsl(var(--fg-2))]">{detail}</p>
        </div>

        {Icon ? (
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[18px] border"
            style={{
              borderColor: metric?.border || 'hsl(var(--border) / 0.88)',
              background: metric?.tint || 'hsl(var(--fill) / 0.76)',
              color: metric?.color || 'hsl(var(--fg-2))',
            }}
          >
            <Icon className="h-4 w-4" strokeWidth={1.9} />
          </div>
        ) : null}
      </div>
    </article>
  );
}

function SnapshotRow({ label, value, unit }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[22px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.78)] px-4 py-3">
      <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">
        {label}
      </p>
      <p className="text-[14px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
        {value}
        {unit ? <span className="ml-1 text-[11px] font-medium text-[hsl(var(--fg-2))]">{unit}</span> : null}
      </p>
    </div>
  );
}

function MetricSelectorCard({ metric, snapshot, isActive, onClick }) {
  const IndicatorIcon = getDeltaIcon(snapshot?.delta);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-[24px] border px-4 py-4 text-left transition-all',
        isActive
          ? 'shadow-[var(--shadow-sm)]'
          : 'bg-[hsl(var(--card)/0.82)] hover:border-[hsl(var(--separator-strong))] hover:bg-[hsl(var(--card))]'
      )}
      style={
        isActive
          ? {
              borderColor: metric.border,
              background: `linear-gradient(180deg, ${metric.tint} 0%, hsl(var(--card)) 100%)`,
            }
          : undefined
      }
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="atlas-metric-label">{metric.label}</p>
          <p className="mt-3 text-[1.125rem] font-semibold tracking-[-0.04em] text-[hsl(var(--fg))]">
            {formatMetricValue(snapshot?.value, metric)}
          </p>
          <p className="mt-2 text-[12px] leading-5 text-[hsl(var(--fg-2))]">
            {snapshot?.entries?.length
              ? `${snapshot.entries.length} checkpoints with this metric`
              : 'Insufficient data'}
          </p>
        </div>

        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[18px] border"
          style={{
            borderColor: metric.border,
            background: metric.tint,
            color: metric.color,
          }}
        >
          <IndicatorIcon className="h-4 w-4" strokeWidth={1.9} />
        </div>
      </div>
    </button>
  );
}

function TrendPill({ label, value }) {
  return (
    <div className="rounded-[22px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.82)] px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">
        {label}
      </p>
      <p className="mt-2 text-[14px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
        {value}
      </p>
    </div>
  );
}

function HistoryMetricChip({ label, value, unit }) {
  return (
    <div className="rounded-[22px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.48)] px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">
        {label}
      </p>
      <p className="mt-2 text-[14px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
        {toDisplayNumber(value)}
        {unit ? <span className="ml-1 text-[11px] font-medium text-[hsl(var(--fg-2))]">{unit}</span> : null}
      </p>
    </div>
  );
}

function ChangePill({ label, delta, metric }) {
  const Icon = getDeltaIcon(delta);

  return (
    <div className="flex items-center justify-between gap-3 rounded-[20px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.82)] px-3.5 py-3">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">
          {label}
        </p>
        <p className="mt-1 text-[12px] leading-5 text-[hsl(var(--fg-2))]">
          {getDeltaLabel(delta, metric)}
        </p>
      </div>

      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[16px] border"
        style={{
          borderColor: metric.border,
          background: metric.tint,
          color: metric.color,
        }}
      >
        <Icon className="h-3.5 w-3.5" strokeWidth={1.9} />
      </div>
    </div>
  );
}

function HistoryCard({ measurement, previousMeasurement, onEdit, onDelete }) {
  const daysSincePrevious = previousMeasurement
    ? getDayDifference(previousMeasurement.date, measurement.date)
    : null;
  const historyBodyFields = BODY_SITE_FIELDS_NO_WAIST
    .filter((field) => getMeasurementFieldValue(measurement, field.key) !== null)
    .slice(0, 6);
  const sourceLabel = getMeasurementFieldSourceLabel(measurement?.source);
  const bodyFatValue = getMeasurementFieldValue(measurement, 'body_fat_percent');
  const bmiValue = getMeasurementFieldValue(measurement, 'bmi');

  const keyDeltas = [
    {
      label: 'Weight',
      delta:
        previousMeasurement && getMeasurementFieldValue(previousMeasurement, 'weight') !== null
          ? getMeasurementFieldValue(measurement, 'weight') - getMeasurementFieldValue(previousMeasurement, 'weight')
          : null,
      metric: METRIC_LOOKUP.weight,
    },
    {
      label: 'Body Fat %',
      delta:
        previousMeasurement && getMeasurementFieldValue(previousMeasurement, 'body_fat_percent') !== null
          ? getMeasurementFieldValue(measurement, 'body_fat_percent') -
            getMeasurementFieldValue(previousMeasurement, 'body_fat_percent')
          : null,
      metric: METRIC_LOOKUP.body_fat_percent,
    },
    {
      label: 'BMI',
      delta:
        previousMeasurement && getMeasurementFieldValue(previousMeasurement, 'bmi') !== null
          ? getMeasurementFieldValue(measurement, 'bmi') - getMeasurementFieldValue(previousMeasurement, 'bmi')
          : null,
      metric: METRIC_LOOKUP.bmi,
    },
    {
      label: 'Waist',
      delta:
        previousMeasurement && getMeasurementFieldValue(previousMeasurement, 'waist') !== null
          ? getMeasurementFieldValue(measurement, 'waist') - getMeasurementFieldValue(previousMeasurement, 'waist')
          : null,
      metric: METRIC_LOOKUP.waist,
    },
  ];

  return (
    <article className="atlas-card relative overflow-hidden px-5 py-5 lg:px-6 lg:py-6">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[4px] bg-[linear-gradient(180deg,rgba(15,118,110,0.28),rgba(37,99,235,0.18))]" />

      <div className="flex flex-col gap-6">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.72)] px-3 py-1 text-[11px] font-semibold tracking-[0.04em] text-[hsl(var(--fg-2))]">
              Body checkpoint
            </span>
            <span className="rounded-full border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.82)] px-3 py-1 text-[11px] font-semibold tracking-[0.04em] text-[hsl(var(--fg-2))]">
              {sourceLabel}
            </span>
            <span className="rounded-full border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.82)] px-3 py-1 text-[11px] font-semibold tracking-[0.04em] text-[hsl(var(--fg-2))]">
              {previousMeasurement ? `${daysSincePrevious} days after previous` : 'First entry'}
            </span>
          </div>

          <div>
            <h3 className="text-[1.25rem] font-semibold tracking-[-0.04em] text-[hsl(var(--fg))]">
              {formatMeasurementDate(measurement.date, {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </h3>
            <p className="mt-2 text-[14px] leading-7 text-[hsl(var(--fg-2))]">
              Weight {toDisplayNumber(getMeasurementFieldValue(measurement, 'weight'))} kg · BF{' '}
              {toDisplayNumber(bodyFatValue)}%
              {' · '}
              BMI {toDisplayNumber(bmiValue)}
              {' · '}
              Waist {toDisplayNumber(getMeasurementFieldValue(measurement, 'waist'))} cm
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {historyBodyFields.map((field) => (
              <HistoryMetricChip
                key={field.key}
                label={field.label}
                value={getMeasurementFieldValue(measurement, field.key)}
                unit={field.unit}
              />
            ))}
            <HistoryMetricChip label="Fields" value={countFilledMetrics(measurement)} unit="filled" />
          </div>

          {measurement.notes ? (
            <div className="rounded-[24px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.82)] px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">
                Context
              </p>
              <p className="mt-2 text-[13px] leading-7 text-[hsl(var(--fg-2))]">{measurement.notes}</p>
            </div>
          ) : null}
        </div>

        <aside className="rounded-[24px] border border-[hsl(var(--border)/0.9)] bg-[hsl(var(--fill)/0.55)] px-5 py-5 shadow-[var(--shadow-xs)]">
          <p className="atlas-overline">Summary</p>
          <p className="mt-3 text-[2rem] font-semibold tracking-[-0.065em] text-[hsl(var(--fg))]">
            {toDisplayNumber(getMeasurementFieldValue(measurement, 'weight'))}
            <span className="ml-1 text-[13px] font-medium tracking-[-0.01em] text-[hsl(var(--fg-2))]">
              kg
            </span>
          </p>
          <p className="mt-2 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
            {countFilledMetrics(measurement)} fields filled in this checkpoint.
          </p>

          <div className="mt-5 space-y-2.5">
            {keyDeltas.map((item) => (
              <ChangePill key={item.label} label={item.label} delta={item.delta} metric={item.metric} />
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-2 xl:flex-col">
            <button
              type="button"
              onClick={onEdit}
              className="atlas-button atlas-button-secondary h-10 flex-1 xl:w-full"
            >
              <Pencil className="h-4 w-4" strokeWidth={1.9} />
              Edit
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="atlas-button h-10 flex-1 border border-[hsl(var(--err)/0.18)] bg-[hsl(var(--err)/0.06)] text-[hsl(var(--err))] hover:bg-[hsl(var(--err)/0.1)] xl:w-full"
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.9} />
              Delete
            </button>
          </div>
        </aside>
      </div>
    </article>
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
          <span className="text-[11px] font-medium tracking-normal text-[hsl(var(--fg-3))]">
            {hint}
          </span>
        ) : null}
      </div>

      <div className="relative mt-2">
        {as === 'select' ? (
          <select
            {...props}
            aria-invalid={!!error}
            className={cn(
              INPUT_CLASS_NAME,
              error && 'border-[hsl(var(--err)/0.52)] ring-1 ring-[hsl(var(--err)/0.18)]',
              inputClassName
            )}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            {...props}
            aria-invalid={!!error}
            className={cn(
              INPUT_CLASS_NAME,
              unit ? 'pr-14' : '',
              error && 'border-[hsl(var(--err)/0.52)] ring-1 ring-[hsl(var(--err)/0.18)]',
              inputClassName
            )}
          />
        )}
        {unit ? (
          <span className="pointer-events-none absolute inset-y-0 right-4 inline-flex items-center text-[11px] font-semibold uppercase tracking-[0.08em] text-[hsl(var(--fg-3))]">
            {unit}
          </span>
        ) : null}
      </div>

      {error ? <p className="mt-2 text-[12px] font-medium leading-5 text-[hsl(var(--err))]">{error}</p> : null}
    </label>
  );
}

function MeasurementFieldGroup({ section, form, fieldErrors, onFieldChange }) {
  if (!section?.fields?.length) {
    return null;
  }

  return (
    <div className={section.className}>
      <p className="atlas-overline">{section.label}</p>
      {section.description ? (
        <p className="mt-3 text-[13px] leading-7 text-[hsl(var(--fg-2))]">{section.description}</p>
      ) : null}

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {section.fields.map((field) => (
          <MeasurementField
            key={field.key}
            label={field.label}
            unit={field.unit}
            type="text"
            inputMode="decimal"
            value={form[field.key]}
            onChange={(event) => onFieldChange(field.key, event.target.value)}
            error={fieldErrors[field.key]}
          />
        ))}
      </div>
    </div>
  );
}

function MeasurementForm({ measurement, onCancel, onSubmit, isSaving = false, submitError = null, onClearError }) {
  const [form, setForm] = useState(() => getMeasurementFormState(measurement));
  const validation = useMemo(() => measurementFormSchema.safeParse(form), [form]);
  const fieldErrors = useMemo(() => getMeasurementFieldErrors(validation), [validation]);
  const validationSummary = useMemo(
    () => getMeasurementValidationSummary(validation, form),
    [validation, form]
  );
  const derivedPreview = useMemo(() => computeDerivedMeasurementFields(form), [form]);
  const sourceOptions = useMemo(() => MEASUREMENT_SOURCE_OPTIONS, []);
  const canSubmit = validation.success && !isSaving;

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    onClearError?.();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const parsed = measurementFormSchema.safeParse(form);

    if (!parsed.success) {
      return;
    }

    // Pass the raw form state upward so the parent can normalize it once
    // before persisting it to Supabase.
    onSubmit(form);
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-5 px-6 py-6 lg:px-7 lg:py-7">
      {submitError ? <StatusBanner tone="error">{submitError}</StatusBanner> : null}

      {validationSummary ? <StatusBanner tone={validationSummary.tone}>{validationSummary.message}</StatusBanner> : null}

      <div className="rounded-[24px] border border-[hsl(var(--border)/0.85)] bg-[linear-gradient(180deg,rgba(14,165,233,0.08),hsl(var(--card)/0.88))] px-5 py-5">
        <div className="flex flex-col gap-4">
          <div className="max-w-2xl">
            <p className="atlas-overline">Checkpoint</p>
            <p className="mt-3 text-[1.125rem] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">
              Record the manual and imported measurements for this checkpoint.
            </p>
            <p className="mt-2 text-[13px] leading-7 text-[hsl(var(--fg-2))]">
              Derived fields are calculated automatically from the source inputs. Imported body-composition values can be added here or later without changing the checkpoint date.
            </p>
          </div>

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[20px] border border-[rgba(8,145,178,0.2)] bg-[rgba(8,145,178,0.12)] text-[#0891b2]">
            <BarChart3 className="h-5 w-5" strokeWidth={1.9} />
          </div>
        </div>

        <div className="mt-5 grid gap-4">
          <MeasurementField
            label="Date"
            type="date"
            value={form.date}
            onChange={(event) => updateField('date', event.target.value)}
            error={fieldErrors.date}
          />

          <MeasurementField
            label="Source"
            as="select"
            value={form.source}
            onChange={(event) => updateField('source', event.target.value)}
            error={fieldErrors.source}
            options={sourceOptions}
            hint="Record provenance"
          />

          <div className="rounded-[24px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.82)] px-4 py-4">
            <p className="atlas-metric-label">Quick guide</p>
            <p className="mt-3 text-[13px] leading-7 text-[hsl(var(--fg-2))]">
              You can save with any combination of manual or imported measurements. Weight is optional, but at least one source measurement is required.
            </p>
          </div>
        </div>
      </div>

      {FORM_SECTIONS.map((section) => (
        <MeasurementFieldGroup
          key={section.key}
          section={section}
          form={form}
          fieldErrors={fieldErrors}
          onFieldChange={updateField}
        />
      ))}

      <div className="rounded-[26px] border border-[hsl(var(--border)/0.85)] bg-[hsl(var(--card)/0.82)] px-5 py-5">
        <p className="atlas-overline">Derived preview</p>
        <p className="mt-3 text-[13px] leading-7 text-[hsl(var(--fg-2))]">
          These values are computed locally from the source inputs. Imported values will keep their own provenance if a device or clinician workflow supplies them later.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <SnapshotRow label="BMI" value={toDisplayNumber(derivedPreview.bmi, 2)} unit="kg/m²" />
          <SnapshotRow label="Fat mass" value={toDisplayNumber(derivedPreview.fat_mass, 2)} unit="kg" />
          <SnapshotRow label="Lean mass" value={toDisplayNumber(derivedPreview.lean_mass, 2)} unit="kg" />
          <SnapshotRow label="Lean mass %" value={toDisplayNumber(derivedPreview.lean_mass_percent, 1)} unit="%" />
          <SnapshotRow label="Muscle/fat ratio" value={toDisplayNumber(derivedPreview.muscle_fat_ratio, 2)} unit="ratio" />
          <SnapshotRow label="Intracellular water %" value={toDisplayNumber(derivedPreview.intracellular_water_percent, 1)} unit="%" />
          <SnapshotRow label="Water in lean mass" value={toDisplayNumber(derivedPreview.water_in_lean_mass, 2)} unit="L/kg" />
          <SnapshotRow label="Muscle mass %" value={toDisplayNumber(derivedPreview.muscle_mass_percent, 1)} unit="%" />
        </div>
      </div>

      <div className="rounded-[26px] border border-[hsl(var(--border)/0.85)] bg-[hsl(var(--card)/0.82)] px-5 py-5">
        <label className={FIELD_LABEL_CLASS}>
          Context notes
          <textarea
            value={form.notes}
            onChange={(event) => updateField('notes', event.target.value)}
            placeholder="e.g. waist dropping, pump maintained, better sleep, or any detail that helps interpret the checkpoint later."
            className={cn(TEXTAREA_CLASS_NAME, 'mt-2')}
          />
        </label>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-[hsl(var(--border)/0.85)] pt-6 sm:flex-row sm:justify-end">
        <SecondaryButton type="button" onClick={onCancel}>
          Cancel
        </SecondaryButton>
        <PrimaryButton type="submit" disabled={isSaving}>
          {isSaving ? 'Saving...' : measurement ? 'Save checkpoint' : 'Log checkpoint'}
        </PrimaryButton>
      </div>
    </form>
  );
}

export default function Measurements({ embedded = false }) {
  const { t } = useI18n();

  if (embedded) {
    return <MeasurementsContent embedded />;
  }

  return (
    <SafePageBoundary
      title={t('pages.measurements.title')}
      subtitle={t('pages.measurements.subtitle')}
      maxWidth="max-w-6xl"
      fallbackDescription="The Measurements route remains accessible even if the main interface fails."
    >
      <MeasurementsContent />
    </SafePageBoundary>
  );
}

function MeasurementsContent({ embedded = false }) {
  const { t, locale } = useI18n();
  const isPt = locale === 'pt-BR';
  const { user } = useAuth();
  const [metricKey, setMetricKey] = useState('weight');
  const [notice, setNotice] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMeasurement, setEditingMeasurement] = useState(null);

  const queryClient = useQueryClient();

  // ── Data fetching ────────────────────────────────────────────────
  const { data: measurements = [], isLoading, isError } = useQuery({
    queryKey: ['measurements', user?.id],
    queryFn: () => listMeasurements(user.id, 200),
    enabled: !!user?.id,
  });

  // ── Mutations ────────────────────────────────────────────────────
  const invalidateMeasurements = () => {
    queryClient.invalidateQueries({ queryKey: ['measurements', user?.id] });
    queryClient.invalidateQueries({ queryKey: ['measurements-progress', user?.id] });
    queryClient.invalidateQueries({ queryKey: ['today-measurements-recent', user?.id] });
  };

  const createMutation = useMutation({
    mutationFn: (data) => createMeasurement(user.id, data),
    onSuccess: () => {
      invalidateMeasurements();
      setIsFormOpen(false);
      setEditingMeasurement(null);
      setNotice({ tone: 'success', message: 'Body checkpoint recorded.' });
    },
    onError: (error) =>
      setNotice({
        tone: 'error',
        message: `Could not record the checkpoint. ${getMutationErrorMessage(error, 'Please try again.')}`,
      }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateMeasurement(user.id, id, data),
    onSuccess: () => {
      invalidateMeasurements();
      setIsFormOpen(false);
      setEditingMeasurement(null);
      setNotice({ tone: 'success', message: 'Body checkpoint updated.' });
    },
    onError: (error) =>
      setNotice({
        tone: 'error',
        message: `Could not update the checkpoint. ${getMutationErrorMessage(error, 'Please try again.')}`,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteMeasurement(user.id, id),
    onSuccess: () => {
      invalidateMeasurements();
      setNotice({ tone: 'success', message: 'Body checkpoint removed.' });
    },
    onError: (error) =>
      setNotice({
        tone: 'error',
        message: `Could not remove the checkpoint. ${getMutationErrorMessage(error, 'Please try again.')}`,
      }),
  });

  const sortedMeasurements = useMemo(() => {
    return [...measurements].sort((left, right) => new Date(left.date) - new Date(right.date));
  }, [measurements]);

  const measurementHistory = useMemo(() => {
    return sortedMeasurements
      .map((measurement, index) => ({
        measurement,
        previousMeasurement: index > 0 ? sortedMeasurements[index - 1] : null,
      }))
      .reverse();
  }, [sortedMeasurements]);

  const latestMeasurement = sortedMeasurements[sortedMeasurements.length - 1] || null;
  const firstMeasurement = sortedMeasurements[0] || null;
  const latestBodyFields = useMemo(
    () =>
      BODY_SITE_FIELDS_NO_WAIST.filter((field) => getMeasurementFieldValue(latestMeasurement, field.key) !== null).slice(0, 8),
    [latestMeasurement]
  );
  const latestCompositionFields = useMemo(
    () =>
      [
        'lean_mass_percent',
        'muscle_mass',
        'muscle_mass_percent',
        'muscle_fat_ratio',
        'total_body_water',
        'intracellular_water_percent',
        'water_in_lean_mass',
      ]
        .map((key) => MEASUREMENT_FIELD_MAP[key])
        .filter((field) => field && getMeasurementFieldValue(latestMeasurement, field.key) !== null)
        .slice(0, 6),
    [latestMeasurement]
  );
  const latestConsistencyIssues = latestMeasurement?.consistency_issues || [];

  const captureSpanDays =
    latestMeasurement && firstMeasurement
      ? getDayDifference(firstMeasurement.date, latestMeasurement.date)
      : 0;

  const averageCadenceDays =
    sortedMeasurements.length > 1
      ? Math.max(1, Math.round(captureSpanDays / (sortedMeasurements.length - 1)))
      : null;

  const metricSnapshots = useMemo(() => {
    return METRIC_OPTIONS.reduce((accumulator, metric) => {
      const entries = sortedMeasurements.filter((measurement) => getMeasurementFieldValue(measurement, metric.key) !== null);
      const latestEntry = entries[entries.length - 1] || null;
      const previousEntry = entries[entries.length - 2] || null;

      accumulator[metric.key] = {
        entries,
        latestEntry,
        previousEntry,
        value: latestEntry ? getMeasurementFieldValue(latestEntry, metric.key) : null,
        delta:
          latestEntry && previousEntry
            ? getMeasurementFieldValue(latestEntry, metric.key) -
              getMeasurementFieldValue(previousEntry, metric.key)
            : null,
        rangeDelta:
          entries.length > 1
            ? getMeasurementFieldValue(latestEntry, metric.key) -
              getMeasurementFieldValue(entries[0], metric.key)
            : null,
      };

      return accumulator;
    }, {});
  }, [sortedMeasurements]);

  const selectedMetric = METRIC_LOOKUP[metricKey] || METRIC_OPTIONS[0];
  const selectedSnapshot = metricSnapshots[metricKey] || {
    entries: [],
    latestEntry: null,
    previousEntry: null,
    value: null,
    delta: null,
    rangeDelta: null,
  };

  const chartData = selectedSnapshot.entries.map((measurement) => ({
    date: formatMeasurementDate(measurement.date),
    value: getMeasurementFieldValue(measurement, metricKey),
  }));

  const isSavingMeasurement = createMutation.isPending || updateMutation.isPending;

  const handleCreate = () => {
    setNotice(null);
    setEditingMeasurement(null);
    setIsFormOpen(true);
  };

  const handleEdit = (measurement) => {
    setNotice(null);
    setEditingMeasurement(measurement);
    setIsFormOpen(true);
  };

  const handleDelete = (measurement) => {
    const confirmed = window.confirm(
      `Delete measurements from ${formatMeasurementDate(measurement.date, { day: '2-digit', month: '2-digit', year: 'numeric' })}?`
    );
    if (!confirmed) return;
    deleteMutation.mutate(measurement.id);
  };

  const handleSaveMeasurement = (payload) => {
    const validation = measurementFormSchema.safeParse(payload);
    if (!validation.success) {
      const validationNotice = getMeasurementValidationSummary(validation, payload);
      setNotice({
        tone: validationNotice?.tone === 'error' ? 'error' : 'warning',
        message: validationNotice?.message || 'Please check the highlighted fields before saving.',
      });
      return;
    }

    const data = validation.data;

    if (editingMeasurement?.id) {
      updateMutation.mutate({ id: editingMeasurement.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  // ── Loading / error guards ───────────────────────────────────────
  if (isLoading) {
    const loadingBody = (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[hsl(var(--brand)/0.18)] border-t-[hsl(var(--brand))]" />
          <p className="text-[13px] text-[hsl(var(--fg-2))]">Loading checkpoints…</p>
        </div>
      </div>
    );

    return embedded ? loadingBody : <AppContainer>{loadingBody}</AppContainer>;
  }

  if (isError) {
    const errorBody = (
      <StatusBanner tone="error">
        Error loading measurement data. Check your connection and try again.
      </StatusBanner>
    );

    return embedded ? errorBody : <AppContainer>{errorBody}</AppContainer>;
  }

  const pageBody = (
    <>
      {!embedded ? (
        <PageHeader
          eyebrow={isPt ? "Medidas" : "Measurements"}
          title="Measurements with care, hierarchy and clean reading."
          subtitle="A dedicated space for body checkpoints: weight, composition and measurements in a premium, clean and rhythmic view."
          accentClassName="from-[rgba(14,165,233,0.12)] via-[rgba(14,165,233,0.03)]"
          actions={
            <ActionRow>
              <PrimaryButton type="button" onClick={handleCreate} className="inline-flex items-center gap-2">
                <Plus className="h-4 w-4" strokeWidth={1.9} />
                Log measurements
              </PrimaryButton>

              {latestMeasurement ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.82)] px-3 py-1.5 text-[12px] font-semibold tracking-[-0.016em] text-[hsl(var(--fg-2))]">
                  Last checkpoint on{' '}
                  <span className="text-[hsl(var(--fg))]">
                    {formatMeasurementDate(latestMeasurement.date, {
                      day: '2-digit',
                      month: 'long',
                    })}
                  </span>
                </span>
              ) : null}
            </ActionRow>
          }
        >
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <HeroStat
              label="Current Weight"
              value={latestMeasurement ? `${toDisplayNumber(getMeasurementFieldValue(latestMeasurement, 'weight'))} kg` : '--'}
              detail={getDeltaLabel(metricSnapshots.weight?.delta, METRIC_LOOKUP.weight)}
              icon={Scale}
              metric={METRIC_LOOKUP.weight}
            />
            <HeroStat
              label="Body Fat %"
              value={latestMeasurement ? `${toDisplayNumber(getMeasurementFieldValue(latestMeasurement, 'body_fat_percent'))} %` : '--'}
              detail={getDeltaLabel(metricSnapshots.body_fat_percent?.delta, METRIC_LOOKUP.body_fat_percent)}
              icon={Activity}
              metric={METRIC_LOOKUP.body_fat_percent}
            />
            <HeroStat
              label="BMI"
              value={latestMeasurement ? `${toDisplayNumber(getMeasurementFieldValue(latestMeasurement, 'bmi'), 2)} kg/m²` : '--'}
              detail={getDeltaLabel(metricSnapshots.bmi?.delta, METRIC_LOOKUP.bmi)}
              icon={Ruler}
              metric={METRIC_LOOKUP.bmi}
            />
            <HeroStat
              label="Cadence"
              value={averageCadenceDays ? `${averageCadenceDays} days` : '--'}
              detail={`${sortedMeasurements.length || 0} checkpoints in history.`}
              icon={CalendarClock}
              metric={METRIC_LOOKUP.weight}
            />
          </div>
        </PageHeader>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <p className="atlas-overline">Measurements</p>
            <h2 className="mt-3 text-[1.4rem] font-semibold tracking-[-0.05em] text-[hsl(var(--fg))]">
              Structured body checkpoints
            </h2>
            <p className="mt-2 text-[14px] leading-7 text-[hsl(var(--fg-2))]">
              Weight, body-fat, and circumference checkpoints organized for quick scan inside the Body hub.
            </p>
          </div>
          <PrimaryButton type="button" onClick={handleCreate} className="inline-flex items-center gap-2 self-start">
            <Plus className="h-4 w-4" strokeWidth={1.9} />
            Log measurements
          </PrimaryButton>
        </div>
      )}

      <StatusBanner tone="neutral">
        Checkpoints, charts and history on this route are organized as a single body reading, independent of other modules.
      </StatusBanner>

      {notice?.message ? <StatusBanner tone={notice.tone}>{notice.message}</StatusBanner> : null}
      {latestConsistencyIssues.length ? (
        <StatusBanner tone={latestConsistencyIssues.some((issue) => issue.severity === 'error') ? 'error' : 'warning'}>
          {latestConsistencyIssues[0].message}
        </StatusBanner>
      ) : null}

      <Section
          title="Latest checkpoint"
          subtitle="Immediate summary of the most recent entry, before opening the trend or history."
        >
          <Card className="px-5 py-5">
            {latestMeasurement ? (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="atlas-overline">Latest checkpoint</p>
                    <p className="mt-3 text-[1.125rem] font-semibold tracking-[-0.035em] text-[hsl(var(--fg))]">
                      {formatMeasurementDate(latestMeasurement.date, {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="mt-2 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
                      Immediate summary of the most recent checkpoint, without noise from other modules.
                    </p>
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.82)] px-3 py-1.5 text-[12px] font-semibold tracking-[-0.016em] text-[hsl(var(--fg-2))]">
                      Source
                      <span className="text-[hsl(var(--fg))]">{getMeasurementFieldSourceLabel(latestMeasurement?.source)}</span>
                    </div>
                  </div>

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[20px] border border-[rgba(14,165,233,0.18)] bg-[rgba(14,165,233,0.12)] text-[#0891b2]">
                    <BarChart3 className="h-4 w-4" strokeWidth={1.9} />
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <SnapshotRow label="Weight" value={toDisplayNumber(getMeasurementFieldValue(latestMeasurement, 'weight'))} unit="kg" />
                  <SnapshotRow label="Body Fat %" value={toDisplayNumber(getMeasurementFieldValue(latestMeasurement, 'body_fat_percent'))} unit="%" />
                  <SnapshotRow label="Waist" value={toDisplayNumber(getMeasurementFieldValue(latestMeasurement, 'waist'))} unit="cm" />
                  <SnapshotRow label="BMI" value={toDisplayNumber(getMeasurementFieldValue(latestMeasurement, 'bmi'), 2)} unit="kg/m²" />
                  <SnapshotRow label="Fat mass" value={toDisplayNumber(getMeasurementFieldValue(latestMeasurement, 'fat_mass'), 2)} unit="kg" />
                  <SnapshotRow label="Lean mass" value={toDisplayNumber(getMeasurementFieldValue(latestMeasurement, 'lean_mass'), 2)} unit="kg" />
                  {latestBodyFields.map((field) => (
                    <SnapshotRow
                      key={field.key}
                      label={field.label}
                      value={toDisplayNumber(getMeasurementFieldValue(latestMeasurement, field.key))}
                      unit={field.unit}
                    />
                  ))}
                  {latestCompositionFields.map((field) => (
                    <SnapshotRow
                      key={field.key}
                      label={field.label}
                      value={toDisplayNumber(getMeasurementFieldValue(latestMeasurement, field.key), field.precision ?? 2)}
                      unit={field.unit}
                    />
                  ))}
                </div>

                <div className="mt-5 rounded-[20px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.42)] px-4 py-4">
                  <p className="atlas-metric-label">Context</p>
                  <p className="mt-3 text-[13px] leading-7 text-[hsl(var(--fg-2))]">
                    {latestMeasurement.notes || t('pages.measurements.no_notes')}
                  </p>
                </div>
              </>
            ) : (
              <EmptyState
                title="No records yet"
                description="Record your first checkpoint to activate the latest reading."
                action={
                  <PrimaryButton type="button" onClick={handleCreate}>
                    Log measurements
                  </PrimaryButton>
                }
              />
            )}
          </Card>
        </Section>

        <SectionCard
          title="Trend"
          subtitle="Select the main metric and read the curve with enough context to decide without visual excess."
        >
          {sortedMeasurements.length ? (
            <div className="grid gap-6">
              <div className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {METRIC_OPTIONS.map((metric) => (
                    <MetricSelectorCard
                      key={metric.key}
                      metric={metric}
                      snapshot={metricSnapshots[metric.key]}
                      isActive={metricKey === metric.key}
                      onClick={() => setMetricKey(metric.key)}
                    />
                  ))}
                </div>

                <div className="overflow-hidden rounded-[30px] border border-[hsl(var(--border)/0.9)] bg-[hsl(var(--card)/0.88)] shadow-[var(--shadow-xs)]">
                  <div
                    className="border-b border-[hsl(var(--border)/0.82)] px-5 py-5 lg:px-6"
                    style={{
                      background: `linear-gradient(180deg, ${selectedMetric.tint} 0%, hsl(var(--card) / 0.82) 100%)`,
                    }}
                  >
                  <div className="flex flex-col gap-5">
                      <div className="max-w-2xl">
                        <p className="atlas-overline">Selected metric</p>
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                          <h3 className="text-[1.5rem] font-semibold tracking-[-0.045em] text-[hsl(var(--fg))]">
                            {selectedMetric.label}
                          </h3>
                          <span
                            className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[12px] font-semibold tracking-[-0.016em]"
                            style={{
                              borderColor: selectedMetric.border,
                              background: selectedMetric.tint,
                              color: selectedMetric.color,
                            }}
                          >
                            {getDeltaLabel(selectedSnapshot.delta, selectedMetric)}
                          </span>
                        </div>
                        <p className="mt-3 text-[14px] leading-7 text-[hsl(var(--fg-2))]">
                          {selectedMetric.description}
                        </p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3">
                        <TrendPill
                          label="Current"
                          value={formatMetricValue(selectedSnapshot.value, selectedMetric)}
                        />
                        <TrendPill
                          label="Since start"
                          value={
                            selectedSnapshot.rangeDelta === null
                              ? 'No data'
                              : `${selectedSnapshot.rangeDelta > 0 ? '+' : ''}${toDisplayNumber(
                                  selectedSnapshot.rangeDelta,
                                  selectedMetric.digits
                                )} ${selectedMetric.unit}`
                          }
                        />
                        <TrendPill
                          label="Records"
                          value={`${selectedSnapshot.entries.length} points`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="h-[340px] px-4 pb-4 pt-3 lg:px-6 lg:pb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id={`measurement-fill-${metricKey}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={selectedMetric.color} stopOpacity={0.22} />
                            <stop offset="95%" stopColor={selectedMetric.color} stopOpacity={0} />
                          </linearGradient>
                        </defs>

                        <CartesianGrid
                          vertical={false}
                          stroke="hsl(var(--border) / 0.75)"
                          strokeDasharray="4 6"
                        />
                        <XAxis
                          dataKey="date"
                          axisLine={false}
                          tickLine={false}
                          tickMargin={12}
                          fontSize={12}
                          stroke="hsl(var(--fg-3))"
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tickMargin={12}
                          width={42}
                          fontSize={12}
                          stroke="hsl(var(--fg-3))"
                          tickFormatter={(value) => toDisplayNumber(value, selectedMetric.digits)}
                        />
                        <Tooltip
                          cursor={{ stroke: 'hsl(var(--border) / 0.9)', strokeDasharray: '4 4' }}
                          contentStyle={{
                            background: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border) / 0.88)',
                            borderRadius: '18px',
                            boxShadow: 'var(--shadow-md)',
                          }}
                          labelStyle={{
                            color: 'hsl(var(--fg-2))',
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                          formatter={(value) => [formatMetricValue(value, selectedMetric), selectedMetric.label]}
                          labelFormatter={(label) => `Checkpoint ${label}`}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="transparent"
                          fill={`url(#measurement-fill-${metricKey})`}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke={selectedMetric.color}
                          strokeWidth={3}
                          dot={{ r: 3.5, fill: selectedMetric.color, stroke: '#ffffff', strokeWidth: 2 }}
                          activeDot={{
                            r: 5.5,
                            fill: selectedMetric.color,
                            stroke: '#ffffff',
                            strokeWidth: 2,
                          }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <aside className="space-y-4">
                <MeasurementInsights measurements={sortedMeasurements} latest={latestMeasurement} />

                <div className="rounded-[24px] border border-[hsl(var(--border)/0.9)] bg-[hsl(var(--fill)/0.56)] px-5 py-5 shadow-[var(--shadow-xs)]">
                  <p className="atlas-overline">Coverage</p>
                  <div className="mt-4 space-y-4">
                    <div>
                      <p className="text-[13px] font-semibold tracking-[-0.016em] text-[hsl(var(--fg))]">
                        Analysis window
                      </p>
                      <p className="mt-1 text-[14px] leading-6 text-[hsl(var(--fg-2))]">
                        {captureSpanDays} days between first and last checkpoint.
                      </p>
                    </div>

                    <div>
                      <p className="text-[13px] font-semibold tracking-[-0.016em] text-[hsl(var(--fg))]">
                        Latest entry coverage
                      </p>
                      <p className="mt-1 text-[14px] leading-6 text-[hsl(var(--fg-2))]">
                        {latestMeasurement ? countFilledMetrics(latestMeasurement) : 0} fields filled in the most recent checkpoint.
                      </p>
                    </div>

                    <div>
                      <p className="text-[13px] font-semibold tracking-[-0.016em] text-[hsl(var(--fg))]">
                        Starting baseline
                      </p>
                      <p className="mt-1 text-[14px] leading-6 text-[hsl(var(--fg-2))]">
                        {firstMeasurement
                          ? formatMeasurementDate(firstMeasurement.date, {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                            })
                          : '--'}
                      </p>
                    </div>

                    <div>
                      <p className="text-[13px] font-semibold tracking-[-0.016em] text-[hsl(var(--fg))]">
                        Latest recorded context
                      </p>
                      <p className="mt-1 text-[14px] leading-6 text-[hsl(var(--fg-2))]">
                        {latestMeasurement?.notes || t('pages.measurements.no_notes_recent')}
                      </p>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          ) : (
            <EmptyState
              title="No measurements to show"
              description="Record your first entry to activate the chart, trend reading and side summary."
            />
          )}
        </SectionCard>

        <SectionCard
          title="Measurement History"
          subtitle="Entries organized as complete body checkpoints, with context and variation compared to previous entry."
        >
          {!measurementHistory.length ? (
            <EmptyState
              title="No measurement records"
              description="Open the modal on this page to create your first body checkpoint."
              action={
                <PrimaryButton type="button" onClick={handleCreate}>
                  Log measurements
                </PrimaryButton>
              }
            />
          ) : (
            <div className="space-y-4">
              {measurementHistory.map(({ measurement, previousMeasurement }) => (
                <HistoryCard
                  key={measurement.id}
                  measurement={measurement}
                  previousMeasurement={previousMeasurement}
                  onEdit={() => handleEdit(measurement)}
                  onDelete={() => handleDelete(measurement)}
                />
              ))}
            </div>
          )}
        </SectionCard>

        <Dialog
          open={isFormOpen}
          onOpenChange={(open) => {
            setIsFormOpen(open);
            if (!open) setEditingMeasurement(null);
          }}
        >
          <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-[32rem]">
            <DialogPanelHeader
              eyebrow="Body checkpoint"
              title={editingMeasurement ? 'Edit body checkpoint' : 'Log body checkpoint'}
              description="Enter weight, body composition and circumference measurements for this checkpoint."
              accentClassName="from-[rgba(14,165,233,0.12)]"
            />

            <MeasurementForm
              key={editingMeasurement?.id || 'new-measurement'}
              measurement={editingMeasurement}
              isSaving={isSavingMeasurement}
              submitError={notice?.tone === 'error' ? notice.message : null}
              onClearError={() => {
                if (notice?.tone === 'error') {
                  setNotice(null);
                }
              }}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingMeasurement(null);
              }}
              onSubmit={handleSaveMeasurement}
            />
          </DialogContent>
        </Dialog>
    </>
  );

  return embedded ? <div className="space-y-7">{pageBody}</div> : <AppContainer>{pageBody}</AppContainer>;
}
