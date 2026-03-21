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
import { getToday } from '@/lib/atlas-theme';
import { useI18n } from '@/lib/i18nContext';
import { useAuth } from '@/lib/AuthContext';
import { cn } from '@/lib/utils';
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

const TODAY = getToday();
const DAY_IN_MS = 1000 * 60 * 60 * 24;
const BODY_FIELD_KEYS = ['weight', 'body_fat', 'waist', 'chest', 'arms', 'thighs', 'hips', 'neck'];

// Mock data removed — all measurements now persisted via base44.entities.Measurement

const METRIC_OPTIONS = [
  {
    key: 'weight',
    label: 'Weight',
    unit: 'kg',
    digits: 1,
    color: '#0f766e',
    tint: 'rgba(15, 118, 110, 0.10)',
    border: 'rgba(15, 118, 110, 0.24)',
    description: 'Total body mass to track your body without noise.',
  },
  {
    key: 'body_fat',
    label: 'Body fat',
    unit: '%',
    digits: 1,
    color: '#2563eb',
    tint: 'rgba(37, 99, 235, 0.10)',
    border: 'rgba(37, 99, 235, 0.22)',
    description: 'Body composition for a clean snapshot of the period.',
  },
  {
    key: 'waist',
    label: 'Waist',
    unit: 'cm',
    digits: 1,
    color: '#0891b2',
    tint: 'rgba(8, 145, 178, 0.10)',
    border: 'rgba(8, 145, 178, 0.22)',
    description: 'One of the most useful references to see real body change.',
  },
  {
    key: 'chest',
    label: 'Chest',
    unit: 'cm',
    digits: 1,
    color: '#1d4ed8',
    tint: 'rgba(29, 78, 216, 0.10)',
    border: 'rgba(29, 78, 216, 0.22)',
    description: 'Upper torso volume within your checkpoint history.',
  },
  {
    key: 'arms',
    label: 'Arms',
    unit: 'cm',
    digits: 1,
    color: '#0ea5e9',
    tint: 'rgba(14, 165, 233, 0.10)',
    border: 'rgba(14, 165, 233, 0.22)',
    description: 'Dedicated tracking for arm measurements without other data noise.',
  },
  {
    key: 'thighs',
    label: 'Thighs',
    unit: 'cm',
    digits: 1,
    color: '#047857',
    tint: 'rgba(4, 120, 87, 0.10)',
    border: 'rgba(4, 120, 87, 0.22)',
    description: 'Lower body dimension to observe body density changes.',
  },
  {
    key: 'hips',
    label: 'Hips',
    unit: 'cm',
    digits: 1,
    color: '#a16207',
    tint: 'rgba(161, 98, 7, 0.10)',
    border: 'rgba(161, 98, 7, 0.22)',
    description: 'Proportion and distribution measured checkpoint to checkpoint.',
  },
  {
    key: 'neck',
    label: 'Neck',
    unit: 'cm',
    digits: 1,
    color: '#475569',
    tint: 'rgba(71, 85, 105, 0.10)',
    border: 'rgba(71, 85, 105, 0.22)',
    description: 'Complementary metric for a more complete body portrait.',
  },
];

const METRIC_LOOKUP = METRIC_OPTIONS.reduce((accumulator, metric) => {
  accumulator[metric.key] = metric;
  return accumulator;
}, {});

function createLocalId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatMeasurementDate(date, options) {
  if (!date) return '--';

  return new Date(`${date}T12:00:00`).toLocaleDateString(
    'pt-BR',
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
  return BODY_FIELD_KEYS.filter((field) => Number(measurement?.[field]) > 0).length;
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

function getMeasurementFormState(measurement) {
  return {
    date: measurement?.date || TODAY,
    weight: measurement?.weight ? String(measurement.weight) : '',
    body_fat: measurement?.body_fat ? String(measurement.body_fat) : '',
    waist: measurement?.waist ? String(measurement.waist) : '',
    chest: measurement?.chest ? String(measurement.chest) : '',
    arms: measurement?.arms ? String(measurement.arms) : '',
    thighs: measurement?.thighs ? String(measurement.thighs) : '',
    hips: measurement?.hips ? String(measurement.hips) : '',
    neck: measurement?.neck ? String(measurement.neck) : '',
    notes: measurement?.notes || '',
  };
}

function parseOptionalNumber(value) {
  if (value === '' || value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
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

  const keyDeltas = [
    {
      label: 'Weight',
      delta: previousMeasurement ? measurement.weight - previousMeasurement.weight : null,
      metric: METRIC_LOOKUP.weight,
    },
    {
      label: 'Body Fat',
      delta: previousMeasurement ? measurement.body_fat - previousMeasurement.body_fat : null,
      metric: METRIC_LOOKUP.body_fat,
    },
    {
      label: 'Cintura',
      delta: previousMeasurement ? measurement.waist - previousMeasurement.waist : null,
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
              Checkpoint corporal
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
              Peso {toDisplayNumber(measurement.weight)} kg · BF {toDisplayNumber(measurement.body_fat)}%
              {' · '}
              Cintura {toDisplayNumber(measurement.waist)} cm
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <HistoryMetricChip label="Peito" value={measurement.chest} unit="cm" />
            <HistoryMetricChip label="Braço" value={measurement.arms} unit="cm" />
            <HistoryMetricChip label="Coxa" value={measurement.thighs} unit="cm" />
            <HistoryMetricChip label="Quadril" value={measurement.hips} unit="cm" />
            <HistoryMetricChip label="Pescoço" value={measurement.neck} unit="cm" />
            <HistoryMetricChip label="Campos" value={countFilledMetrics(measurement)} unit="dados" />
          </div>

          {measurement.notes ? (
            <div className="rounded-[24px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.82)] px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">
                Contexto da coleta
              </p>
              <p className="mt-2 text-[13px] leading-7 text-[hsl(var(--fg-2))]">{measurement.notes}</p>
            </div>
          ) : null}
        </div>

        <aside className="rounded-[28px] border border-[hsl(var(--border)/0.9)] bg-[hsl(var(--fill)/0.55)] px-5 py-5 shadow-[var(--shadow-xs)]">
          <p className="atlas-overline">Resumo</p>
          <p className="mt-3 text-[2rem] font-semibold tracking-[-0.065em] text-[hsl(var(--fg))]">
            {toDisplayNumber(measurement.weight)}
            <span className="ml-1 text-[13px] font-medium tracking-[-0.01em] text-[hsl(var(--fg-2))]">
              kg
            </span>
          </p>
          <p className="mt-2 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
            {countFilledMetrics(measurement)} campos preenchidos neste checkpoint.
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

function MeasurementField({ label, unit, hint, className = '', inputClassName = '', ...props }) {
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
        <input
          {...props}
          className={cn(INPUT_CLASS_NAME, unit ? 'pr-14' : '', inputClassName)}
        />
        {unit ? (
          <span className="pointer-events-none absolute inset-y-0 right-4 inline-flex items-center text-[11px] font-semibold uppercase tracking-[0.08em] text-[hsl(var(--fg-3))]">
            {unit}
          </span>
        ) : null}
      </div>
    </label>
  );
}

function MeasurementForm({ measurement, onCancel, onSubmit }) {
  const [form, setForm] = useState(() => getMeasurementFormState(measurement));

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    onSubmit({
      id: measurement?.id || createLocalId('measurement'),
      date: form.date || TODAY,
      weight: parseOptionalNumber(form.weight),
      body_fat: parseOptionalNumber(form.body_fat),
      waist: parseOptionalNumber(form.waist),
      chest: parseOptionalNumber(form.chest),
      arms: parseOptionalNumber(form.arms),
      thighs: parseOptionalNumber(form.thighs),
      hips: parseOptionalNumber(form.hips),
      neck: parseOptionalNumber(form.neck),
      notes: form.notes.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6 lg:px-7 lg:py-7">
      <div className="rounded-[28px] border border-[hsl(var(--border)/0.85)] bg-[linear-gradient(180deg,rgba(14,165,233,0.08),hsl(var(--card)/0.88))] px-5 py-5">
        <div className="flex flex-col gap-4">
          <div className="max-w-2xl">
            <p className="atlas-overline">Checkpoint</p>
            <p className="mt-3 text-[1.125rem] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">
              Registre todas as medidas do mesmo momento.
            </p>
            <p className="mt-2 text-[13px] leading-7 text-[hsl(var(--fg-2))]">
              Isso preserva comparabilidade e deixa a leitura de tendência muito mais limpa no histórico.
            </p>
          </div>

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[20px] border border-[rgba(8,145,178,0.2)] bg-[rgba(8,145,178,0.12)] text-[#0891b2]">
            <BarChart3 className="h-5 w-5" strokeWidth={1.9} />
          </div>
        </div>

        <div className="mt-5 grid gap-4">
          <MeasurementField
            label="Data da coleta"
            type="date"
            value={form.date}
            onChange={(event) => updateField('date', event.target.value)}
          />

          <div className="rounded-[24px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.82)] px-4 py-4">
            <p className="atlas-metric-label">Guia rapido</p>
            <p className="mt-3 text-[13px] leading-7 text-[hsl(var(--fg-2))]">
              You can save with any combination of measurements. Weight is optional; just fill in at least one body metric.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-[26px] border border-[hsl(var(--border)/0.85)] bg-[hsl(var(--fill)/0.5)] px-5 py-5">
        <p className="atlas-overline">Métricas centrais</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <MeasurementField
            label="Weight"
            unit="kg"
            type="number"
            step="0.1"
            min="0"
            inputMode="decimal"
            value={form.weight}
            onChange={(event) => updateField('weight', event.target.value)}
          />
          <MeasurementField
            label="Body Fat"
            unit="%"
            type="number"
            step="0.1"
            min="0"
            inputMode="decimal"
            value={form.body_fat}
            onChange={(event) => updateField('body_fat', event.target.value)}
          />
          <MeasurementField
            label="Cintura"
            unit="cm"
            type="number"
            step="0.1"
            min="0"
            inputMode="decimal"
            value={form.waist}
            onChange={(event) => updateField('waist', event.target.value)}
          />
        </div>
      </div>

      <div className="rounded-[26px] border border-[hsl(var(--border)/0.85)] bg-[hsl(var(--card)/0.82)] px-5 py-5">
        <p className="atlas-overline">Circunferências</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <MeasurementField
            label="Peito"
            unit="cm"
            type="number"
            step="0.1"
            min="0"
            inputMode="decimal"
            value={form.chest}
            onChange={(event) => updateField('chest', event.target.value)}
          />
          <MeasurementField
            label="Braço"
            unit="cm"
            type="number"
            step="0.1"
            min="0"
            inputMode="decimal"
            value={form.arms}
            onChange={(event) => updateField('arms', event.target.value)}
          />
          <MeasurementField
            label="Coxa"
            unit="cm"
            type="number"
            step="0.1"
            min="0"
            inputMode="decimal"
            value={form.thighs}
            onChange={(event) => updateField('thighs', event.target.value)}
          />
          <MeasurementField
            label="Quadril"
            unit="cm"
            type="number"
            step="0.1"
            min="0"
            inputMode="decimal"
            value={form.hips}
            onChange={(event) => updateField('hips', event.target.value)}
          />
          <MeasurementField
            label="Pescoço"
            unit="cm"
            type="number"
            step="0.1"
            min="0"
            inputMode="decimal"
            value={form.neck}
            onChange={(event) => updateField('neck', event.target.value)}
          />
        </div>
      </div>

      <div className="rounded-[26px] border border-[hsl(var(--border)/0.85)] bg-[hsl(var(--card)/0.82)] px-5 py-5">
        <label className={FIELD_LABEL_CLASS}>
          Observações de contexto
          <textarea
            value={form.notes}
            onChange={(event) => updateField('notes', event.target.value)}
            placeholder="Ex: cintura em queda, pump mantido, sono melhor ou qualquer detalhe que ajude a ler o checkpoint depois."
            className={cn(TEXTAREA_CLASS_NAME, 'mt-2')}
          />
        </label>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-[hsl(var(--border)/0.85)] pt-6 sm:flex-row sm:justify-end">
        <SecondaryButton type="button" onClick={onCancel}>
          Cancel
        </SecondaryButton>
        <PrimaryButton type="submit">
          {measurement ? 'Save checkpoint' : 'Log checkpoint'}
        </PrimaryButton>
      </div>
      {/* Note: submit button disabling on in-flight mutations is handled in parent via isMutating */}
    </form>
  );
}

export default function Measurements() {
  const { t } = useI18n();
  return (
    <SafePageBoundary
      title={t('pages.measurements.title')}
      subtitle={t('pages.measurements.subtitle')}
      maxWidth="max-w-6xl"
      fallbackDescription="A rota de Measurements continua acessivel mesmo se a interface principal falhar."
    >
      <MeasurementsContent />
    </SafePageBoundary>
  );
}

function MeasurementsContent() {
  const { t } = useI18n();
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
      setNotice({ tone: 'success', message: 'Checkpoint corporal registrado.' });
    },
    onError: () =>
      setNotice({ tone: 'error', message: 'Erro ao registrar checkpoint. Tente novamente.' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateMeasurement(user.id, id, data),
    onSuccess: () => {
      invalidateMeasurements();
      setIsFormOpen(false);
      setEditingMeasurement(null);
      setNotice({ tone: 'success', message: 'Checkpoint corporal atualizado.' });
    },
    onError: () =>
      setNotice({ tone: 'error', message: 'Erro ao atualizar checkpoint. Tente novamente.' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteMeasurement(user.id, id),
    onSuccess: () => {
      invalidateMeasurements();
      setNotice({ tone: 'success', message: 'Checkpoint corporal removido.' });
    },
    onError: () =>
      setNotice({ tone: 'error', message: 'Erro ao remover checkpoint. Tente novamente.' }),
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
      const entries = sortedMeasurements.filter((measurement) => Number(measurement?.[metric.key]) > 0);
      const latestEntry = entries[entries.length - 1] || null;
      const previousEntry = entries[entries.length - 2] || null;

      accumulator[metric.key] = {
        entries,
        latestEntry,
        previousEntry,
        value: latestEntry ? latestEntry[metric.key] : null,
        delta:
          latestEntry && previousEntry
            ? Number(latestEntry[metric.key]) - Number(previousEntry[metric.key])
            : null,
        rangeDelta:
          entries.length > 1
            ? Number(latestEntry[metric.key]) - Number(entries[0][metric.key])
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
    value: measurement[metricKey],
  }));

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
      `Delete as medidas de ${formatMeasurementDate(measurement.date, { day: '2-digit', month: '2-digit', year: 'numeric' })}?`
    );
    if (!confirmed) return;
    deleteMutation.mutate(measurement.id);
  };

  const handleSaveMeasurement = (payload) => {
    const filledMetricCount = BODY_FIELD_KEYS.filter((field) => Number(payload?.[field]) > 0).length;

    if (!payload.date || filledMetricCount === 0) {
      setNotice({
        tone: 'warning',
        message: 'Informe a data e pelo menos uma medida para salvar o checkpoint.',
      });
      return;
    }

    // Strip local id before sending to backend — backend assigns real ids
    const { id, ...data } = payload;

    if (editingMeasurement?.id) {
      updateMutation.mutate({ id: editingMeasurement.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  // ── Loading / error guards ───────────────────────────────────────
  if (isLoading) {
    return (
      <AppContainer>
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[hsl(var(--brand)/0.18)] border-t-[hsl(var(--brand))]" />
            <p className="text-[13px] text-[hsl(var(--fg-2))]">Loading checkpoints…</p>
          </div>
        </div>
      </AppContainer>
    );
  }

  if (isError) {
    return (
      <AppContainer>
        <StatusBanner tone="error">
          Error loading measurement data. Check your connection and try again.
        </StatusBanner>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <PageHeader
        eyebrow="Measurements"
        title="Measurements with care, hierarchy and clean reading."
        subtitle="A dedicated space for body checkpoints: weight, composition and measurements in a premium, clean and rhythmic view."
        accentClassName="from-[rgba(14,165,233,0.12)] via-[rgba(14,165,233,0.03)]"
        actions={
          <ActionRow>
            <PrimaryButton type="button" onClick={handleCreate} className="inline-flex items-center gap-2">
              <Plus className="h-4 w-4" strokeWidth={1.9} />
              Registrar medidas
            </PrimaryButton>

            {latestMeasurement ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.82)] px-3 py-1.5 text-[12px] font-semibold tracking-[-0.016em] text-[hsl(var(--fg-2))]">
                Ultimo checkpoint em{' '}
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
            value={latestMeasurement ? `${toDisplayNumber(latestMeasurement.weight)} kg` : '--'}
            detail={getDeltaLabel(metricSnapshots.weight?.delta, METRIC_LOOKUP.weight)}
            icon={Scale}
            metric={METRIC_LOOKUP.weight}
          />
          <HeroStat
            label="Body Fat"
            value={latestMeasurement ? `${toDisplayNumber(latestMeasurement.body_fat)} %` : '--'}
            detail={getDeltaLabel(metricSnapshots.body_fat?.delta, METRIC_LOOKUP.body_fat)}
            icon={Activity}
            metric={METRIC_LOOKUP.body_fat}
          />
          <HeroStat
            label="Cintura"
            value={latestMeasurement ? `${toDisplayNumber(latestMeasurement.waist)} cm` : '--'}
            detail={getDeltaLabel(metricSnapshots.waist?.delta, METRIC_LOOKUP.waist)}
            icon={Ruler}
            metric={METRIC_LOOKUP.waist}
          />
          <HeroStat
            label="Cadencia"
            value={averageCadenceDays ? `${averageCadenceDays} dias` : '--'}
            detail={`${sortedMeasurements.length || 0} checkpoints no histórico.`}
            icon={CalendarClock}
            metric={METRIC_LOOKUP.chest}
          />
        </div>
      </PageHeader>

        <StatusBanner tone="neutral">
          Checkpoints, gráfico e histórico desta rota seguem organizados como uma leitura corporal única, sem depender de outros módulos.
        </StatusBanner>

        {notice?.message ? <StatusBanner tone={notice.tone}>{notice.message}</StatusBanner> : null}

        <Section
          title="Último checkpoint"
          subtitle="Resumo imediato do registro mais recente, antes de abrir a tendência ou o histórico."
        >
          <Card className="px-5 py-5">
            {latestMeasurement ? (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="atlas-overline">Último checkpoint</p>
                    <p className="mt-3 text-[1.125rem] font-semibold tracking-[-0.035em] text-[hsl(var(--fg))]">
                      {formatMeasurementDate(latestMeasurement.date, {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="mt-2 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
                      Resumo imediato do checkpoint mais recente, sem ruído de outros módulos.
                    </p>
                  </div>

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[20px] border border-[rgba(14,165,233,0.18)] bg-[rgba(14,165,233,0.12)] text-[#0891b2]">
                    <BarChart3 className="h-4 w-4" strokeWidth={1.9} />
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <SnapshotRow label="Weight" value={toDisplayNumber(latestMeasurement.weight)} unit="kg" />
                  <SnapshotRow label="Body Fat" value={toDisplayNumber(latestMeasurement.body_fat)} unit="%" />
                  <SnapshotRow label="Cintura" value={toDisplayNumber(latestMeasurement.waist)} unit="cm" />
                  <SnapshotRow label="Peito" value={toDisplayNumber(latestMeasurement.chest)} unit="cm" />
                  <SnapshotRow label="Braço" value={toDisplayNumber(latestMeasurement.arms)} unit="cm" />
                  <SnapshotRow label="Coxa" value={toDisplayNumber(latestMeasurement.thighs)} unit="cm" />
                </div>

                <div className="mt-5 rounded-[20px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.42)] px-4 py-4">
                  <p className="atlas-metric-label">Contexto</p>
                  <p className="mt-3 text-[13px] leading-7 text-[hsl(var(--fg-2))]">
                    {latestMeasurement.notes || t('pages.measurements.no_notes')}
                  </p>
                </div>
              </>
            ) : (
              <EmptyState
                title="Nenhum registro ainda"
                description="Registre o primeiro checkpoint para ativar a leitura mais recente."
                action={
                  <PrimaryButton type="button" onClick={handleCreate}>
                    Registrar medidas
                  </PrimaryButton>
                }
              />
            )}
          </Card>
        </Section>

        <SectionCard
          title="Tendência"
          subtitle="Select the main metric and read the curve with enough context to decide without visual excess."
        >
          {sortedMeasurements.length ? (
            <div className="grid gap-6">
              <div className="space-y-6">
                <div className="grid gap-3 sm:grid-cols-2">
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
                        <p className="atlas-overline">Métrica selecionada</p>
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
                          label="Atual"
                          value={formatMetricValue(selectedSnapshot.value, selectedMetric)}
                        />
                        <TrendPill
                          label="Desde o inicio"
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
                          label="Registros"
                          value={`${selectedSnapshot.entries.length} pontos`}
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

                <div className="rounded-[28px] border border-[hsl(var(--border)/0.9)] bg-[hsl(var(--fill)/0.56)] px-5 py-5 shadow-[var(--shadow-xs)]">
                  <p className="atlas-overline">Cobertura</p>
                  <div className="mt-4 space-y-4">
                    <div>
                      <p className="text-[13px] font-semibold tracking-[-0.016em] text-[hsl(var(--fg))]">
                        Janela analisada
                      </p>
                      <p className="mt-1 text-[14px] leading-6 text-[hsl(var(--fg-2))]">
                        {captureSpanDays} dias entre o primeiro e o ultimo checkpoint.
                      </p>
                    </div>

                    <div>
                      <p className="text-[13px] font-semibold tracking-[-0.016em] text-[hsl(var(--fg))]">
                        Cobertura do ultimo registro
                      </p>
                      <p className="mt-1 text-[14px] leading-6 text-[hsl(var(--fg-2))]">
                        {latestMeasurement ? countFilledMetrics(latestMeasurement) : 0} campos preenchidos no checkpoint mais recente.
                      </p>
                    </div>

                    <div>
                      <p className="text-[13px] font-semibold tracking-[-0.016em] text-[hsl(var(--fg))]">
                        Base inicial
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
                        Ultimo contexto registrado
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
              description="Registre a primeira entrada para ativar o gráfico, a leitura de tendência e o resumo lateral."
            />
          )}
        </SectionCard>

        <SectionCard
          title="Measurement History"
          subtitle="Entries organized as complete body checkpoints, with context and variation compared to previous entry."
        >
          {!measurementHistory.length ? (
            <EmptyState
              title="Nenhum registro de medidas"
              description="Abra o modal desta página para criar o primeiro checkpoint corporal."
              action={
                <PrimaryButton type="button" onClick={handleCreate}>
                  Registrar medidas
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
              eyebrow="Checkpoint de medidas"
              title={editingMeasurement ? 'Edit checkpoint corporal' : 'Registrar checkpoint corporal'}
              description="Este modal mantém a lógica atual da página, mas organiza a entrada com mais clareza para peso, composição e circunferências."
              accentClassName="from-[rgba(14,165,233,0.12)]"
            />

            <MeasurementForm
              key={editingMeasurement?.id || 'new-measurement'}
              measurement={editingMeasurement}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingMeasurement(null);
              }}
              onSubmit={handleSaveMeasurement}
            />
          </DialogContent>
        </Dialog>
    </AppContainer>
  );
}
