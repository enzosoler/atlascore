import React, { useMemo, useState } from 'react';
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
  Sparkles,
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
  EmptyState,
  PrimaryButton,
  SafePageBoundary,
  SecondaryButton,
  SectionCard,
  StatusBanner,
  shiftDate,
} from '@/components/shared/StablePage';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getToday } from '@/lib/atlas-theme';
import { cn } from '@/lib/utils';

const FIELD_LABEL_CLASS =
  'block text-[13px] font-semibold tracking-[-0.016em] text-[hsl(var(--fg))]';
const INPUT_CLASS_NAME = 'atlas-field h-11 px-4 py-2 text-sm';
const TEXTAREA_CLASS_NAME = 'atlas-field min-h-[120px] resize-y px-4 py-3 text-sm';

const TODAY = getToday();
const DAY_IN_MS = 1000 * 60 * 60 * 24;
const BODY_FIELD_KEYS = ['weight', 'body_fat', 'waist', 'chest', 'arms', 'thighs', 'hips', 'neck'];

const MOCK_MEASUREMENTS = [
  {
    id: 'measurement-1',
    date: shiftDate(TODAY, -28),
    weight: 84.4,
    body_fat: 16.8,
    waist: 86.5,
    chest: 103,
    arms: 38.2,
    thighs: 59.3,
    hips: 97.4,
    neck: 39.5,
    notes: 'Retorno apos deload.',
  },
  {
    id: 'measurement-2',
    date: shiftDate(TODAY, -21),
    weight: 83.8,
    body_fat: 16.4,
    waist: 85.9,
    chest: 103.4,
    arms: 38.3,
    thighs: 59.1,
    hips: 97,
    neck: 39.4,
    notes: '',
  },
  {
    id: 'measurement-3',
    date: shiftDate(TODAY, -14),
    weight: 83.1,
    body_fat: 15.9,
    waist: 85,
    chest: 103.6,
    arms: 38.5,
    thighs: 58.8,
    hips: 96.5,
    neck: 39.3,
    notes: 'Sono melhor e cintura baixando.',
  },
  {
    id: 'measurement-4',
    date: shiftDate(TODAY, -7),
    weight: 82.6,
    body_fat: 15.5,
    waist: 84.3,
    chest: 103.8,
    arms: 38.7,
    thighs: 58.6,
    hips: 96.1,
    neck: 39.2,
    notes: '',
  },
  {
    id: 'measurement-5',
    date: TODAY,
    weight: 82.1,
    body_fat: 15.1,
    waist: 83.7,
    chest: 104.1,
    arms: 38.9,
    thighs: 58.4,
    hips: 95.8,
    neck: 39.1,
    notes: 'Check-in mais seco, sem queda de performance.',
  },
];

const METRIC_OPTIONS = [
  {
    key: 'weight',
    label: 'Peso',
    unit: 'kg',
    digits: 1,
    color: '#0f766e',
    tint: 'rgba(15, 118, 110, 0.10)',
    border: 'rgba(15, 118, 110, 0.24)',
    description: 'Leitura base de massa total para acompanhar o corpo sem ruído.',
  },
  {
    key: 'body_fat',
    label: 'Body fat',
    unit: '%',
    digits: 1,
    color: '#2563eb',
    tint: 'rgba(37, 99, 235, 0.10)',
    border: 'rgba(37, 99, 235, 0.22)',
    description: 'Composição corporal em um recorte limpo do período.',
  },
  {
    key: 'waist',
    label: 'Cintura',
    unit: 'cm',
    digits: 1,
    color: '#0891b2',
    tint: 'rgba(8, 145, 178, 0.10)',
    border: 'rgba(8, 145, 178, 0.22)',
    description: 'Uma das referências mais úteis para ver mudança corporal real.',
  },
  {
    key: 'chest',
    label: 'Peito',
    unit: 'cm',
    digits: 1,
    color: '#1d4ed8',
    tint: 'rgba(29, 78, 216, 0.10)',
    border: 'rgba(29, 78, 216, 0.22)',
    description: 'Volume superior do tronco dentro do histórico de checkpoints.',
  },
  {
    key: 'arms',
    label: 'Braco',
    unit: 'cm',
    digits: 1,
    color: '#0ea5e9',
    tint: 'rgba(14, 165, 233, 0.10)',
    border: 'rgba(14, 165, 233, 0.22)',
    description: 'Leitura dedicada para acompanhar braço sem se perder em outros dados.',
  },
  {
    key: 'thighs',
    label: 'Coxa',
    unit: 'cm',
    digits: 1,
    color: '#047857',
    tint: 'rgba(4, 120, 87, 0.10)',
    border: 'rgba(4, 120, 87, 0.22)',
    description: 'Dimensão inferior com curva própria para observar densidade corporal.',
  },
  {
    key: 'hips',
    label: 'Quadril',
    unit: 'cm',
    digits: 1,
    color: '#a16207',
    tint: 'rgba(161, 98, 7, 0.10)',
    border: 'rgba(161, 98, 7, 0.22)',
    description: 'Contexto de proporção e distribuição medido checkpoint a checkpoint.',
  },
  {
    key: 'neck',
    label: 'Pescoco',
    unit: 'cm',
    digits: 1,
    color: '#475569',
    tint: 'rgba(71, 85, 105, 0.10)',
    border: 'rgba(71, 85, 105, 0.22)',
    description: 'Métrica complementar para um retrato corporal mais completo.',
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
  if (delta === null || delta === undefined) return 'Sem base anterior';
  if (Math.abs(delta) < 0.05) return 'Sem mudanca relevante';
  return `${delta > 0 ? '+' : ''}${toDisplayNumber(delta, metric?.digits ?? 1)} ${metric?.unit || ''} vs anterior`.trim();
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
              ? `${snapshot.entries.length} checkpoints com essa metrica`
              : 'Sem dados suficientes'}
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
      label: 'Peso',
      delta: previousMeasurement ? measurement.weight - previousMeasurement.weight : null,
      metric: METRIC_LOOKUP.weight,
    },
    {
      label: 'Body fat',
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
              {previousMeasurement ? `${daysSincePrevious} dias apos o anterior` : 'Primeiro registro'}
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

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <HistoryMetricChip label="Peito" value={measurement.chest} unit="cm" />
            <HistoryMetricChip label="Braco" value={measurement.arms} unit="cm" />
            <HistoryMetricChip label="Coxa" value={measurement.thighs} unit="cm" />
            <HistoryMetricChip label="Quadril" value={measurement.hips} unit="cm" />
            <HistoryMetricChip label="Pescoco" value={measurement.neck} unit="cm" />
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
              Editar
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="atlas-button h-10 flex-1 border border-[hsl(var(--err)/0.18)] bg-[hsl(var(--err)/0.06)] text-[hsl(var(--err))] hover:bg-[hsl(var(--err)/0.1)] xl:w-full"
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.9} />
              Excluir
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
      weight: Number(form.weight || 0),
      body_fat: Number(form.body_fat || 0),
      waist: Number(form.waist || 0),
      chest: Number(form.chest || 0),
      arms: Number(form.arms || 0),
      thighs: Number(form.thighs || 0),
      hips: Number(form.hips || 0),
      neck: Number(form.neck || 0),
      notes: form.notes.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6 lg:px-7 lg:py-7">
      <div className="rounded-[28px] border border-[hsl(var(--border)/0.85)] bg-[linear-gradient(180deg,rgba(14,165,233,0.08),hsl(var(--card)/0.88))] px-5 py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <p className="atlas-overline">Checkpoint</p>
            <p className="mt-3 text-[1.125rem] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">
              Registre todas as medidas do mesmo momento.
            </p>
            <p className="mt-2 text-[13px] leading-7 text-[hsl(var(--fg-2))]">
              Isso preserva comparabilidade e deixa a leitura de tendencia muito mais limpa no historico.
            </p>
          </div>

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[20px] border border-[rgba(8,145,178,0.2)] bg-[rgba(8,145,178,0.12)] text-[#0891b2]">
            <BarChart3 className="h-5 w-5" strokeWidth={1.9} />
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
          <MeasurementField
            label="Data da coleta"
            type="date"
            value={form.date}
            onChange={(event) => updateField('date', event.target.value)}
          />

          <div className="rounded-[24px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.82)] px-4 py-4">
            <p className="atlas-metric-label">Guia rapido</p>
            <p className="mt-3 text-[13px] leading-7 text-[hsl(var(--fg-2))]">
              Use peso, body fat e cintura como nucleo da leitura. As circunferencias entram como camadas de refinamento do mesmo checkpoint.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-[26px] border border-[hsl(var(--border)/0.85)] bg-[hsl(var(--fill)/0.5)] px-5 py-5">
        <p className="atlas-overline">Core metrics</p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <MeasurementField
            label="Peso"
            unit="kg"
            type="number"
            step="0.1"
            min="0"
            inputMode="decimal"
            value={form.weight}
            onChange={(event) => updateField('weight', event.target.value)}
          />
          <MeasurementField
            label="Body fat"
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
        <p className="atlas-overline">Circunferencias</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
            label="Braco"
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
            label="Pescoco"
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
          Observacoes de contexto
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
          Cancelar
        </SecondaryButton>
        <PrimaryButton type="submit">
          {measurement ? 'Salvar checkpoint' : 'Registrar checkpoint'}
        </PrimaryButton>
      </div>
    </form>
  );
}

export default function Measurements() {
  return (
    <SafePageBoundary
      title="Measurements"
      subtitle="Tracking corporal com checkpoint unificado, leitura de tendencia clara e historico proprio."
      maxWidth="max-w-6xl"
      fallbackDescription="A rota de Measurements continua acessivel mesmo se a interface principal falhar."
    >
      <MeasurementsContent />
    </SafePageBoundary>
  );
}

function MeasurementsContent() {
  const [metricKey, setMetricKey] = useState('weight');
  const [notice, setNotice] = useState(null);
  const [measurements, setMeasurements] = useState(MOCK_MEASUREMENTS);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMeasurement, setEditingMeasurement] = useState(null);

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
    const confirmed = window.confirm(`Excluir as medidas de ${formatMeasurementDate(measurement.date, { day: '2-digit', month: '2-digit', year: 'numeric' })}?`);

    if (!confirmed) return;

    setMeasurements((current) => current.filter((item) => item.id !== measurement.id));
    setNotice({
      tone: 'success',
      message: 'Checkpoint corporal removido.',
    });
  };

  const handleSaveMeasurement = (payload) => {
    if (!payload.date || payload.weight <= 0) {
      setNotice({
        tone: 'warning',
        message: 'Informe ao menos data e peso para salvar o checkpoint.',
      });
      return;
    }

    setMeasurements((current) => {
      const exists = current.some((item) => item.id === payload.id);

      if (exists) {
        return current.map((item) => (item.id === payload.id ? payload : item));
      }

      return [...current, payload];
    });

    setIsFormOpen(false);
    setEditingMeasurement(null);
    setNotice({
      tone: 'success',
      message:
        payload.id === editingMeasurement?.id
          ? 'Checkpoint corporal atualizado.'
          : 'Checkpoint corporal registrado.',
    });
  };

  return (
    <AppContainer>
      <PageHeader
        eyebrow="Measurements"
        title="Body tracking com calma, hierarquia e leitura real."
        subtitle="Um espaco dedicado para checkpoints corporais: peso, composicao e circunferencias em uma leitura premium, limpa e ritmada."
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
        <div className="grid gap-3">
          <HeroStat
            label="Peso atual"
            value={latestMeasurement ? `${toDisplayNumber(latestMeasurement.weight)} kg` : '--'}
            detail={getDeltaLabel(metricSnapshots.weight?.delta, METRIC_LOOKUP.weight)}
            icon={Scale}
            metric={METRIC_LOOKUP.weight}
          />
          <HeroStat
            label="Body fat"
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
            detail={`${sortedMeasurements.length || 0} checkpoints no historico.`}
            icon={CalendarClock}
            metric={METRIC_LOOKUP.chest}
          />
        </div>
      </PageHeader>

        {notice?.message ? <StatusBanner tone={notice.tone}>{notice.message}</StatusBanner> : null}

        <Section
          title="Latest checkpoint"
          subtitle="Resumo imediato do registro mais recente, antes de abrir a tendencia ou o historico."
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
                      Resumo imediato do checkpoint mais recente, sem ruído de outros modulos.
                    </p>
                  </div>

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[20px] border border-[rgba(14,165,233,0.18)] bg-[rgba(14,165,233,0.12)] text-[#0891b2]">
                    <BarChart3 className="h-4 w-4" strokeWidth={1.9} />
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <SnapshotRow label="Peso" value={toDisplayNumber(latestMeasurement.weight)} unit="kg" />
                  <SnapshotRow label="Body fat" value={toDisplayNumber(latestMeasurement.body_fat)} unit="%" />
                  <SnapshotRow label="Cintura" value={toDisplayNumber(latestMeasurement.waist)} unit="cm" />
                  <SnapshotRow label="Peito" value={toDisplayNumber(latestMeasurement.chest)} unit="cm" />
                  <SnapshotRow label="Braco" value={toDisplayNumber(latestMeasurement.arms)} unit="cm" />
                  <SnapshotRow label="Coxa" value={toDisplayNumber(latestMeasurement.thighs)} unit="cm" />
                </div>

                <div className="mt-5 rounded-[20px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.42)] px-4 py-4">
                  <p className="atlas-metric-label">Contexto</p>
                  <p className="mt-3 text-[13px] leading-7 text-[hsl(var(--fg-2))]">
                    {latestMeasurement.notes || 'Sem observacoes adicionais neste checkpoint.'}
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
          title="Trend view"
          subtitle="Selecione a metrica principal e leia a curva com contexto suficiente para tomar decisao sem excesso visual."
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
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
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
                          label="Atual"
                          value={formatMetricValue(selectedSnapshot.value, selectedMetric)}
                        />
                        <TrendPill
                          label="Desde o inicio"
                          value={
                            selectedSnapshot.rangeDelta === null
                              ? 'Sem base'
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
                  <p className="atlas-overline">Coverage</p>
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
                        {latestMeasurement?.notes || 'Sem observacoes no checkpoint mais recente.'}
                      </p>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          ) : (
            <EmptyState
              title="Sem medidas para mostrar"
              description="Registre a primeira entrada para ativar o grafico, a leitura de tendencia e o resumo lateral."
            />
          )}
        </SectionCard>

        <SectionCard
          title="Checkpoint history"
          subtitle="Entradas organizadas como checkpoints corporais completos, com contexto e variacao contra o registro anterior."
        >
          {!measurementHistory.length ? (
            <EmptyState
              title="Nenhum registro de medidas"
              description="Abra o modal desta pagina para criar o primeiro checkpoint corporal."
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
            <DialogHeader className="relative overflow-hidden border-b border-[hsl(var(--border)/0.82)] px-6 pb-5 pt-6 text-left lg:px-7">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(14,165,233,0.12),transparent)]" />
              <div className="relative">
                <p className="atlas-overline">Measurements checkpoint</p>
                <DialogTitle className="mt-3">
                  {editingMeasurement ? 'Editar checkpoint corporal' : 'Registrar checkpoint corporal'}
                </DialogTitle>
                <DialogDescription className="mt-3 max-w-2xl">
                  Este modal mantem a logica atual da pagina, mas organiza a entrada com mais clareza para peso, composicao e circunferencias.
                </DialogDescription>
              </div>
            </DialogHeader>

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
