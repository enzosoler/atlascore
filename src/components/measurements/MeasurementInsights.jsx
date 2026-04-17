import React, { useMemo } from 'react';
import { AlertCircle, ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getMeasurementFieldValue } from '@/lib/measurementModel';
import { useI18n } from '@/lib/i18nContext';

const ICON_TONE_CLASS = {
  positive: 'border-[hsl(var(--ok)/0.18)] bg-[hsl(var(--ok)/0.08)] text-[hsl(var(--ok))]',
  attention: 'border-[hsl(var(--warn)/0.18)] bg-[hsl(var(--warn)/0.08)] text-[hsl(34_68%_32%)]',
  neutral: 'border-[hsl(var(--brand)/0.18)] bg-[hsl(var(--brand)/0.08)] text-[hsl(var(--brand))]',
};

function formatDelta(value, digits = 1) {
  if (value == null || Number.isNaN(Number(value))) return '--';
  const rounded = Number(value).toFixed(digits);
  return `${Number(value) > 0 ? '+' : ''}${rounded}`;
}

export default function MeasurementInsights({
  measurements,
  latest,
  windowMeasurements = measurements,
  windowLabel = 'selected period',
}) {
  const { locale } = useI18n();
  const analyzedMeasurements = Array.isArray(windowMeasurements) && windowMeasurements.length > 0
    ? windowMeasurements
    : measurements;

  const sorted = useMemo(
    () => [...analyzedMeasurements].sort((a, b) => new Date(a.date) - new Date(b.date)),
    [analyzedMeasurements]
  );

  if (!latest || sorted.length < 2) return null;

  const oldest = sorted[0];
  const newest = sorted[sorted.length - 1] || latest;

  const latestWeight = getMeasurementFieldValue(newest, 'weight');
  const oldestWeight = getMeasurementFieldValue(oldest, 'weight');
  const latestBodyFat = getMeasurementFieldValue(newest, 'body_fat_percent');
  const oldestBodyFat = getMeasurementFieldValue(oldest, 'body_fat_percent');
  const latestWaist = getMeasurementFieldValue(newest, 'waist');
  const oldestWaist = getMeasurementFieldValue(oldest, 'waist');

  const weightChange = latestWeight !== null && oldestWeight !== null ? latestWeight - oldestWeight : null;
  const bfChange = latestBodyFat !== null && oldestBodyFat !== null ? latestBodyFat - oldestBodyFat : null;
  const waistChange = latestWaist !== null && oldestWaist !== null ? latestWaist - oldestWaist : null;

  const daysElapsed = Math.floor(
    (new Date(`${newest.date}T12:00:00`) - new Date(`${oldest.date}T12:00:00`)) /
      (1000 * 60 * 60 * 24)
  );
  const weeksElapsed = daysElapsed / 7;

  const weightRate = weeksElapsed > 0 && weightChange !== null ? weightChange / weeksElapsed : null;
  const projectedWeight8w = latestWeight !== null && weightRate !== null ? latestWeight + weightRate * 8 : null;

  const insightCards = [
    {
      label: 'Weight',
      icon: weightChange > 0 ? ArrowUpRight : ArrowDownRight,
      tone: weightChange == null ? 'neutral' : weightChange > 0 ? 'attention' : 'positive',
      value: latestWeight,
      unit: 'kg',
      digits: 1,
      detail:
        weightChange == null
          ? 'Need at least two weight checkpoints to read a trend.'
          : `${formatDelta(weightChange, 1)} kg in ${windowLabel}`,
    },
    {
      label: 'Body fat',
      icon: bfChange == null ? AlertCircle : bfChange > 0 ? ArrowUpRight : ArrowDownRight,
      tone: bfChange == null ? 'neutral' : bfChange > 0 ? 'attention' : 'positive',
      value: latestBodyFat,
      unit: '%',
      digits: 1,
      detail:
        bfChange == null
          ? 'Body fat needs two checkpoints in the selected window.'
          : `${formatDelta(bfChange, 1)}% in ${windowLabel}`,
    },
    {
      label: 'Waist',
      icon: waistChange == null ? AlertCircle : waistChange > 0 ? ArrowUpRight : ArrowDownRight,
      tone: waistChange == null ? 'neutral' : waistChange > 0 ? 'attention' : 'positive',
      value: latestWaist,
      unit: 'cm',
      digits: 1,
      detail:
        waistChange == null
          ? 'Waist trend needs two recorded checkpoints.'
          : `${formatDelta(waistChange, 1)} cm in ${windowLabel}`,
    },
  ];

  const insights = [];

  if (weightChange !== null && Math.abs(weightChange) > 0.1) {
    insights.push({
      label: 'Weight trend',
      icon: weightChange > 0 ? ArrowUpRight : ArrowDownRight,
      tone: weightChange > 0 ? 'attention' : 'positive',
      text: `${weightChange > 0 ? 'Increased' : 'Decreased'} ${Math.abs(weightChange).toFixed(1)}kg since ${new Date(
        `${oldest.date}T12:00:00`
      ).toLocaleDateString(locale === 'pt-BR' ? 'pt-BR' : 'en-US')} in the selected window.`,
    });
  }

  if (bfChange !== null && Math.abs(bfChange) > 0.05) {
    insights.push({
      label: 'Body composition',
      icon: bfChange > 0 ? ArrowUpRight : ArrowDownRight,
      tone: bfChange > 0 ? 'attention' : 'positive',
      text: `Body fat ${bfChange > 0 ? 'increased' : 'decreased'} ${Math.abs(bfChange).toFixed(2)}% across ${windowLabel}.`,
    });
  }

  if (waistChange !== null && Math.abs(waistChange) > 0.1) {
    insights.push({
      label: 'Waist line',
      icon: waistChange > 0 ? ArrowUpRight : ArrowDownRight,
      tone: waistChange > 0 ? 'attention' : 'positive',
      text: `Waist ${waistChange > 0 ? 'increased' : 'decreased'} ${Math.abs(waistChange).toFixed(1)}cm from the first logged checkpoint in this window.`,
    });
  }

  if (weightRate !== null && Math.abs(weightRate) > 0.05) {
    insights.push({
      label: 'Current rate',
      icon: AlertCircle,
      tone: 'neutral',
      text: `Average pace of ${Math.abs(weightRate).toFixed(2)}kg per week. At the same speed, an 8-week projection points to ${projectedWeight8w?.toFixed(1) ?? '--'}kg.`,
    });
  }

  if (insights.length === 0) {
    insights.push({
      label: 'Stable reading',
      icon: Minus,
      tone: 'neutral',
      text: 'Measurements are stable in the current period. New checkpoints help make the curve more readable.',
    });
  }

  return (
    <div className="rounded-[28px] border border-[hsl(var(--border)/0.9)] bg-[linear-gradient(180deg,hsl(var(--card)/0.96)_0%,hsl(var(--card)/0.88)_100%)] px-5 py-5 shadow-[var(--shadow-xs)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="atlas-overline">Trend reading</p>
          <p className="mt-3 text-[1.0625rem] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">
            What changed in the selected window
          </p>
          <p className="mt-2 max-w-2xl text-[13px] leading-6 text-[hsl(var(--fg-2))]">
            A rules-based summary of the latest measurements, framed around the same window shown in the chart.
          </p>
        </div>
        <div className="rounded-full border border-[hsl(var(--border)/0.75)] bg-[hsl(var(--fill)/0.45)] px-3 py-1.5 text-[11px] font-semibold tracking-[-0.01em] text-[hsl(var(--fg-2))]">
          {windowLabel}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {insightCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-[22px] border border-[hsl(var(--border)/0.75)] bg-[hsl(var(--fill)/0.4)] px-4 py-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">
                    {card.label}
                  </p>
                  <p className="mt-2 text-[1.35rem] font-semibold tracking-[-0.04em] text-[hsl(var(--fg))] tabular-nums">
                    {card.value != null ? `${Number(card.value).toFixed(card.digits || 1)}${card.unit}` : '—'}
                  </p>
                </div>
                <div
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-[16px] border',
                    ICON_TONE_CLASS[card.tone]
                  )}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.9} />
                </div>
              </div>
              <p className="mt-3 text-[12px] leading-5 text-[hsl(var(--fg-2))]">
                {card.detail}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-5 space-y-3">
        {insights.map((insight) => {
          const Icon = insight.icon;

          return (
            <div
              key={insight.label}
              className="rounded-[24px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.44)] px-4 py-4"
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[18px] border',
                    ICON_TONE_CLASS[insight.tone]
                  )}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.9} />
                </div>

                <div className="min-w-0">
                  <p className="text-[13px] font-semibold tracking-[-0.018em] text-[hsl(var(--fg))]">
                    {insight.label}
                  </p>
                  <p className="mt-1 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
                    {insight.text}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
