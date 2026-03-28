import React from 'react';
import { AlertCircle, ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getMeasurementFieldValue } from '@/lib/measurementModel';
import { useI18n } from '@/lib/i18nContext';

const ICON_TONE_CLASS = {
  positive: 'border-[hsl(var(--ok)/0.18)] bg-[hsl(var(--ok)/0.08)] text-[hsl(var(--ok))]',
  attention: 'border-[hsl(var(--warn)/0.18)] bg-[hsl(var(--warn)/0.08)] text-[hsl(34_68%_32%)]',
  neutral: 'border-[hsl(var(--brand)/0.18)] bg-[hsl(var(--brand)/0.08)] text-[hsl(var(--brand))]',
};

export default function MeasurementInsights({ measurements, latest }) {
  const { locale } = useI18n();
  if (!latest || measurements.length < 2) return null;

  const sorted = [...measurements].sort((a, b) => new Date(a.date) - new Date(b.date));
  const oldest = sorted[0];

  const latestWeight = getMeasurementFieldValue(latest, 'weight');
  const oldestWeight = getMeasurementFieldValue(oldest, 'weight');
  const latestBodyFat = getMeasurementFieldValue(latest, 'body_fat_percent');
  const oldestBodyFat = getMeasurementFieldValue(oldest, 'body_fat_percent');
  const latestWaist = getMeasurementFieldValue(latest, 'waist');
  const oldestWaist = getMeasurementFieldValue(oldest, 'waist');

  const weightChange = latestWeight !== null && oldestWeight !== null ? latestWeight - oldestWeight : 0;
  const bfChange = latestBodyFat !== null && oldestBodyFat !== null ? latestBodyFat - oldestBodyFat : null;
  const waistChange = latestWaist !== null && oldestWaist !== null ? latestWaist - oldestWaist : null;

  const daysElapsed = Math.floor(
    (new Date(`${latest.date}T12:00:00`) - new Date(`${oldest.date}T12:00:00`)) /
      (1000 * 60 * 60 * 24)
  );
  const weeksElapsed = daysElapsed / 7;

  const weightRate = weeksElapsed > 0 && latestWeight !== null && oldestWeight !== null ? weightChange / weeksElapsed : 0;
  const projectedWeight8w = latestWeight !== null ? latestWeight + weightRate * 8 : null;

  const insights = [];

  if (Math.abs(weightChange) > 0.1) {
    insights.push({
      label: 'Weight in period',
      icon: weightChange > 0 ? ArrowUpRight : ArrowDownRight,
      tone: weightChange > 0 ? 'attention' : 'positive',
      text: `${weightChange > 0 ? 'Increased' : 'Decreased'} ${Math.abs(weightChange).toFixed(1)}kg since ${new Date(
        `${oldest.date}T12:00:00`
      ).toLocaleDateString(locale === 'pt-BR' ? 'pt-BR' : 'en-US')}.`,
    });
  }

  if (bfChange !== null && Math.abs(bfChange) > 0.05) {
    insights.push({
      label: 'Body composition',
      icon: bfChange > 0 ? ArrowUpRight : ArrowDownRight,
      tone: bfChange > 0 ? 'attention' : 'positive',
      text: `Body fat ${bfChange > 0 ? 'increased' : 'decreased'} ${Math.abs(bfChange).toFixed(2)}% in the period analyzed.`,
    });
  }

  if (waistChange !== null && Math.abs(waistChange) > 0.1) {
    insights.push({
      label: 'Waist line',
      icon: waistChange > 0 ? ArrowUpRight : ArrowDownRight,
      tone: waistChange > 0 ? 'attention' : 'positive',
      text: `Waist ${waistChange > 0 ? 'increased' : 'decreased'} ${Math.abs(waistChange).toFixed(1)}cm from baseline.`,
    });
  }

  if (Math.abs(weightRate) > 0.05) {
    insights.push({
      label: 'Current rate',
      icon: AlertCircle,
      tone: 'neutral',
      text: `Average rate of ${Math.abs(weightRate).toFixed(2)}kg per week. At the same pace, the 8-week projection points to ${projectedWeight8w?.toFixed(1) ?? '--'}kg.`,
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
    <div className="rounded-[28px] border border-[hsl(var(--border)/0.9)] bg-[hsl(var(--card)/0.82)] px-5 py-5 shadow-[var(--shadow-xs)]">
      <div>
        <p className="atlas-overline">Trend reading</p>
        <p className="mt-3 text-[1.0625rem] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">
          Clear signals in the current period
        </p>
        <p className="mt-2 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
          A rules-based summary of your current body curve, without competing with the main visualization.
        </p>
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
