import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { ArrowDown, ArrowUp, TrendingDown, TrendingUp, Loader2, Lightbulb, Activity } from 'lucide-react';
import { format, parseISO, subDays, isValid } from 'date-fns';
import MeasurementInsights from '@/components/measurements/MeasurementInsights';
import ProgressPhotoCarousel from '@/components/progress/ProgressPhotoCarousel';
import { AppContainer, Card, PageHeader, Section } from '@/components/shared/AppContainer';
import { EmptyState, FilterChip } from '@/components/shared/StablePage';
import { useAuth } from '@/lib/AuthContext';
import {
  MEASUREMENT_COMPOSITION_SECTION,
  MEASUREMENT_DERIVED_SECTION,
  MEASUREMENT_MANUAL_FIELD_SECTIONS,
  MEASUREMENT_TREND_FIELD_KEYS,
  countFilledMeasurementFields,
  getMeasurementFieldValue,
} from '@/lib/measurementModel';
import { supabase } from '@/lib/supabaseClient';
import {
  listMeasurements,
  listProgressPhotos,
} from '@/services/bodyProgressService';
import { useI18n, useT } from '@/lib/i18nContext';

// AI Insight component for interpretation
function AIInsight({ title, insights }) {
  const t = useT();
  if (!insights || insights.length === 0) return null;
  return (
    <Card className="px-5 py-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-[18px] border border-[hsl(var(--brand)/0.2)] bg-[hsl(var(--brand)/0.08)] text-[hsl(var(--brand))]">
          <Lightbulb className="h-4 w-4" strokeWidth={1.9} />
        </div>
        <div>
          <p className="text-[13px] font-semibold tracking-[-0.016em] text-[hsl(var(--fg))]">{title}</p>
          <p className="text-[12px] text-[hsl(var(--fg-2))]">{t('progress.ai_insight_subtitle')}</p>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {insights.map((insight, i) => (
          <div key={i} className="flex items-start gap-2 text-[13px] text-[hsl(var(--fg))]">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--brand))]" />
            {insight}
          </div>
        ))}
      </div>
    </Card>
  );
}

// Simplified trend metric with interpretation
function TrendMetric({ label, value, unit, change, percentChange, trend, interpretation }) {
  const isPositive = trend === 'good';
  const isNeutral = trend === 'neutral';
  const Icon = change > 0 ? ArrowUp : change < 0 ? ArrowDown : Activity;

  return (
    <div className="rounded-[20px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.88)] px-4 py-4">
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">{label}</p>
        <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
          isNeutral ? 'bg-[hsl(var(--fill)/0.5)] text-[hsl(var(--fg-2))]' :
          isPositive ? 'bg-[hsl(var(--ok)/0.12)] text-[hsl(var(--ok))]' :
          'bg-[hsl(var(--warn)/0.12)] text-[hsl(var(--warn))]'
        }`}>
          <Icon className="h-3 w-3" strokeWidth={2} />
          {percentChange !== null ? `${Math.abs(percentChange).toFixed(1)}%` : '—'}
        </div>
      </div>
      <p className="mt-3 text-[1.5rem] font-semibold tracking-[-0.05em] text-[hsl(var(--fg))]">
        {value !== null ? `${Number(value).toFixed(1)} ${unit}` : '—'}
      </p>
      <p className="mt-2 text-[13px] leading-5 text-[hsl(var(--fg-2))]">{interpretation}</p>
    </div>
  );
}

// Generate insights from measurements
function generateInsights(latest, oldest, weightChange, bodyFatChange, bmiChange, measurements, t) {
  const insights = [];

  if (measurements.length < 2) {
    insights.push(t('progress.insights.record_more'));
    return insights;
  }

  // Weight insight
  if (Math.abs(weightChange) > 0.5) {
    if (weightChange < 0) {
      insights.push(t('progress.insights.weight_loss').replace('{n}', Math.abs(weightChange).toFixed(1)));
    } else {
      insights.push(t('progress.insights.weight_gain').replace('{n}', weightChange.toFixed(1)));
    }
  } else {
    insights.push(t('progress.insights.weight_stable'));
  }

  // Body fat insight
  const latestBodyFat = getMeasurementFieldValue(latest, 'body_fat_percent');
  if (latestBodyFat !== null) {
    if (bodyFatChange < -0.5) {
      insights.push(t('progress.insights.body_fat_dropping'));
    } else if (bodyFatChange > 0.5) {
      insights.push(t('progress.insights.body_fat_rising'));
    } else {
      insights.push(t('progress.insights.body_fat_steady'));
    }
  }

  // BMI insight
  const latestBmi = getMeasurementFieldValue(latest, 'bmi');
  if (latestBmi !== null) {
    if (latestBmi < 18.5) {
      insights.push(t('progress.insights.bmi_underweight'));
    } else if (latestBmi > 25) {
      insights.push(t('progress.insights.bmi_elevated'));
    } else {
      insights.push(t('progress.insights.bmi_healthy'));
    }
  }

  // Consistency insight
  if (measurements.length >= 4) {
    insights.push(t('progress.insights.great_consistency').replace('{n}', measurements.length));
  } else {
    insights.push(t('progress.insights.log_weekly'));
  }

  return insights.slice(0, 4);
}

function MetricCard({ label, metricKey, value, unit, change, goal, data, digits = 1 }) {
  const isPositive = change > 0;
  const hasValue = value != null && !Number.isNaN(Number(value));
  const isGoal = goal && hasValue && Math.abs(goal - value) < Math.abs(goal - (data?.[0]?.value || value));
  const gradientId = `progress-${metricKey || label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

  return (
    <Card className="space-y-4 px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="atlas-metric-label">{label}</p>
          <p className="mt-3 text-[1.4rem] font-semibold tracking-[-0.05em] text-[hsl(var(--fg))]">
            {hasValue ? Number(value).toFixed(digits) : '—'}
            <span className="ml-1 text-[14px] font-medium text-[hsl(var(--fg-2))]">{unit}</span>
          </p>
        </div>

        {change !== 0 && hasValue ? (
          <div className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${isPositive ? 'bg-[hsl(var(--ok)/0.12)] text-[hsl(var(--ok))]' : 'bg-[hsl(var(--err)/0.12)] text-[hsl(var(--err))]'}`}>
            {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            {Math.abs(change).toFixed(digits)}
          </div>
        ) : null}
      </div>

      {data && data.length > 1 ? (
        <ResponsiveContainer width="100%" height={72}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--brand))" stopOpacity={0.26} />
                <stop offset="95%" stopColor="hsl(var(--brand))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="value" stroke="hsl(var(--brand))" fill={`url(#${gradientId})`} strokeWidth={2.4} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      ) : null}

      {goal && hasValue ? (
        <div className="space-y-2 border-t border-[hsl(var(--border)/0.8)] pt-3">
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-[hsl(var(--fg-2))]">Goal {goal}</span>
            <span className={`font-semibold ${isGoal ? 'text-[hsl(var(--ok))]' : 'text-[hsl(var(--brand))]'}`}>
              {Math.abs(goal - value).toFixed(1)} to go
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[hsl(var(--fill)/0.82)]">
            <div
              className="h-full rounded-full bg-[hsl(var(--brand))] transition-all"
              style={{ width: `${Math.min(((value || 0) / (goal || 1)) * 100, 100)}%` }}
            />
          </div>
        </div>
      ) : null}
    </Card>
  );
}

const MANUAL_UPPER_SECTION = MEASUREMENT_MANUAL_FIELD_SECTIONS.find((section) => section.key === 'manual_upper');
const MANUAL_LOWER_SECTION = MEASUREMENT_MANUAL_FIELD_SECTIONS.find((section) => section.key === 'manual_lower');
const MANUAL_BASELINE_SECTION = MEASUREMENT_MANUAL_FIELD_SECTIONS.find((section) => section.key === 'manual_baseline');
const MANUAL_BASELINE_PROGRESS_FIELDS = (MANUAL_BASELINE_SECTION?.fields || []).filter(
  (field) => !['weight', 'body_fat_percent'].includes(field.key)
);
const IMPORTED_COMPOSITION_FIELDS = MEASUREMENT_COMPOSITION_SECTION.fields.filter((field) => !field.canDerive);

const PROGRESS_FIELD_GROUPS = [
  {
    key: 'baseline',
    label: MANUAL_BASELINE_SECTION?.label || 'Manual baseline',
    fields: MANUAL_BASELINE_PROGRESS_FIELDS,
  },
  {
    key: 'upper',
    label: MANUAL_UPPER_SECTION?.label || 'Upper body',
    fields: MANUAL_UPPER_SECTION?.fields || [],
  },
  {
    key: 'lower',
    label: MANUAL_LOWER_SECTION?.label || 'Lower body',
    fields: MANUAL_LOWER_SECTION?.fields || [],
  },
  {
    key: 'composition',
    label: MEASUREMENT_COMPOSITION_SECTION.label,
    fields: IMPORTED_COMPOSITION_FIELDS,
  },
  {
    key: 'derived',
    label: MEASUREMENT_DERIVED_SECTION.label,
    fields: MEASUREMENT_DERIVED_SECTION.fields,
  },
];

function ProgressContent({ embedded = false, measurements: propMeasurements, photos: propPhotos }) {
  const t = useT();
  const [timeframe, setTimeframe] = useState('12w');
  const { user } = useAuth();

  const weeksBack = timeframe === '4w' ? 4 : timeframe === '8w' ? 8 : 12;
  const startDate = subDays(new Date(), weeksBack * 7);

  const { data: fetchedMeasurements = [], isLoading: measurementsLoading } = useQuery({
    queryKey: ['measurements-progress', user?.id, timeframe],
    queryFn: () => listMeasurements(user.id, 100),
    enabled: !!user?.id && !propMeasurements,
  });

  const measurements = propMeasurements || fetchedMeasurements;

  const { data: profile } = useQuery({
    queryKey: ['user-profile-progress', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('profile_data')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data?.profile_data || {};
    },
    enabled: !!user?.id,
  });

  const { data: fetchedPhotos = [], isLoading: photosLoading } = useQuery({
    queryKey: ['progress-photos', user?.id],
    queryFn: async () => {
      const items = await listProgressPhotos(user.id, 50);
      return items.length > 0 ? items : [];
    },
    enabled: !!user?.id && !propPhotos,
  });

  const photos = propPhotos || fetchedPhotos;

  const isLoading = measurementsLoading || photosLoading;

  const filteredMeasurements = measurements.filter((measurement) => {
    const measurementDate = new Date(measurement.date);
    return measurementDate >= startDate;
  });

  const latest = filteredMeasurements[0];
  const oldest = filteredMeasurements[filteredMeasurements.length - 1];
  const latestWeight = getMeasurementFieldValue(latest, 'weight');
  const oldestWeight = getMeasurementFieldValue(oldest, 'weight');
  const latestBodyFat = getMeasurementFieldValue(latest, 'body_fat_percent');
  const oldestBodyFat = getMeasurementFieldValue(oldest, 'body_fat_percent');
  const latestBmi = getMeasurementFieldValue(latest, 'bmi');
  const oldestBmi = getMeasurementFieldValue(oldest, 'bmi');
  const captureSpanDays =
    latest && oldest
      ? Math.max(
          0,
          Math.round(
            (new Date(`${latest.date}T12:00:00`) - new Date(`${oldest.date}T12:00:00`)) /
              (1000 * 60 * 60 * 24)
          )
        )
      : 0;
  const weightChange = latestWeight !== null && oldestWeight !== null ? latestWeight - oldestWeight : 0;
  const bodyFatChange = latestBodyFat !== null && oldestBodyFat !== null ? latestBodyFat - oldestBodyFat : 0;
  const bmiChange = latestBmi !== null && oldestBmi !== null ? latestBmi - oldestBmi : 0;

  const chartData = [...filteredMeasurements]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((measurement) => ({
      date: format(new Date(measurement.date), 'MMM d'),
      ...Object.fromEntries(MEASUREMENT_TREND_FIELD_KEYS.map((key) => [key, getMeasurementFieldValue(measurement, key)])),
    }));

  const hasBodySiteMeasurements =
    latest && PROGRESS_FIELD_GROUPS.some((section) => section.fields.some(({ key }) => getMeasurementFieldValue(latest, key) !== null));

  const safeFormatDate = (dateValue, formatString = 'MMM d') => {
    if (!dateValue) return '—';

    try {
      const date = typeof dateValue === 'string' ? parseISO(dateValue) : new Date(dateValue);
      return isValid(date) ? format(date, formatString) : '—';
    } catch {
      return '—';
    }
  };

  const body = (
    <>
      {!embedded ? (
        <PageHeader
          eyebrow={t('progress.eyebrow')}
          title={t('progress.title')}
          subtitle={t('progress.subtitle')}
          accentClassName="from-[hsl(var(--brand)/0.13)] via-[hsl(var(--brand)/0.04)]"
        >
          <div className="flex flex-wrap gap-2">
            {['4w', '8w', '12w'].map((option) => (
              <FilterChip key={option} active={timeframe === option} onClick={() => setTimeframe(option)}>
                {option}
              </FilterChip>
            ))}
          </div>
        </PageHeader>
      ) : null}

      {isLoading ? (
        <Card className="px-5 py-14">
          <div className="flex flex-col items-center gap-3 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--brand))]" strokeWidth={1.9} />
            <p className="text-[15px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
              {t('progress.loading_title')}
            </p>
            <p className="text-[13px] leading-6 text-[hsl(var(--fg-2))]">
              {t('progress.loading_subtitle')}
            </p>
          </div>
        </Card>
      ) : null}

      {!isLoading && measurements.length === 0 ? (
        <Card className="px-0 py-0">
          <EmptyState
            icon={TrendingUp}
            title={t('progress.empty_title')}
            description={t('progress.empty_description')}
          />
        </Card>
      ) : null}

      {!isLoading && measurements.length > 0 ? (
        <>
          {embedded ? (
            <div className="flex flex-wrap gap-2">
              {['4w', '8w', '12w'].map((option) => (
                <FilterChip key={option} active={timeframe === option} onClick={() => setTimeframe(option)}>
                  {option}
                </FilterChip>
              ))}
            </div>
          ) : null}

          {(() => {
            const insights = generateInsights(latest, oldest, weightChange, bodyFatChange, bmiChange, filteredMeasurements, t);

            // Calculate percent changes for trend metrics
            const weightPercentChange = oldestWeight && oldestWeight !== 0 ? ((latestWeight - oldestWeight) / oldestWeight) * 100 : null;
            const bodyFatPercentChange = oldestBodyFat && oldestBodyFat !== 0 ? ((latestBodyFat - oldestBodyFat) / oldestBodyFat) * 100 : null;
            const bmiPercentChange = oldestBmi && oldestBmi !== 0 ? ((latestBmi - oldestBmi) / oldestBmi) * 100 : null;

            // Get waist data if available
            const latestWaist = getMeasurementFieldValue(latest, 'waist');
            const oldestWaist = getMeasurementFieldValue(oldest, 'waist');
            const waistChange = latestWaist !== null && oldestWaist !== null ? latestWaist - oldestWaist : 0;
            const waistPercentChange = oldestWaist && oldestWaist !== 0 ? ((latestWaist - oldestWaist) / oldestWaist) * 100 : null;

            // Get muscle mass data if available
            const latestMuscle = getMeasurementFieldValue(latest, 'muscle_mass');
            const oldestMuscle = getMeasurementFieldValue(oldest, 'muscle_mass');
            const muscleChange = latestMuscle !== null && oldestMuscle !== null ? latestMuscle - oldestMuscle : 0;
            const musclePercentChange = oldestMuscle && oldestMuscle !== 0 ? ((latestMuscle - oldestMuscle) / oldestMuscle) * 100 : null;

            // Get chest data if available
            const latestChest = getMeasurementFieldValue(latest, 'chest');
            const oldestChest = getMeasurementFieldValue(oldest, 'chest');
            const chestChange = latestChest !== null && oldestChest !== null ? latestChest - oldestChest : 0;
            const chestPercentChange = oldestChest && oldestChest !== 0 ? ((latestChest - oldestChest) / oldestChest) * 100 : null;

            return (
              <>
                <AIInsight title={t('progress.ai_insight_title')} insights={insights} />

                <Section
                  eyebrow={t('progress.key_trends_eyebrow')}
                  title={t('progress.key_trends_title')}
                  subtitle={t('progress.key_trends_subtitle')}
                  actions={null}
                >
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <TrendMetric
                      label={t('progress.trend_metrics.weight')}
                      value={latestWeight}
                      unit="kg"
                      change={weightChange}
                      percentChange={weightPercentChange}
                      trend={weightChange < 0 ? 'good' : weightChange > 0.5 ? 'bad' : 'neutral'}
                      interpretation={weightChange < -1 ? t('progress.trend_metrics.weight_good') : weightChange > 1 ? t('progress.trend_metrics.weight_bad') : t('progress.trend_metrics.weight_neutral')}
                    />
                    {latestBodyFat !== null && (
                      <TrendMetric
                        label={t('progress.trend_metrics.body_fat')}
                        value={latestBodyFat}
                        unit="%"
                        change={bodyFatChange}
                        percentChange={bodyFatPercentChange}
                        trend={bodyFatChange < 0 ? 'good' : bodyFatChange > 0.5 ? 'bad' : 'neutral'}
                        interpretation={bodyFatChange < -0.5 ? t('progress.trend_metrics.body_fat_good') : bodyFatChange > 0.5 ? t('progress.trend_metrics.body_fat_bad') : t('progress.trend_metrics.body_fat_neutral')}
                      />
                    )}
                    {latestMuscle !== null && (
                      <TrendMetric
                        label={t('progress.trend_metrics.muscle_mass')}
                        value={latestMuscle}
                        unit="kg"
                        change={muscleChange}
                        percentChange={musclePercentChange}
                        trend={muscleChange > 0 ? 'good' : muscleChange < -0.5 ? 'bad' : 'neutral'}
                        interpretation={muscleChange > 0.2 ? t('progress.trend_metrics.muscle_good') : muscleChange < -0.5 ? t('progress.trend_metrics.muscle_bad') : t('progress.trend_metrics.muscle_neutral')}
                      />
                    )}
                    {latestWaist !== null && (
                      <TrendMetric
                        label={t('progress.trend_metrics.waist')}
                        value={latestWaist}
                        unit="cm"
                        change={waistChange}
                        percentChange={waistPercentChange}
                        trend={waistChange < 0 ? 'good' : waistChange > 0.5 ? 'bad' : 'neutral'}
                        interpretation={waistChange < -1 ? t('progress.trend_metrics.waist_good') : waistChange > 1 ? t('progress.trend_metrics.waist_bad') : t('progress.trend_metrics.waist_neutral')}
                      />
                    )}
                    {latestChest !== null && (
                      <TrendMetric
                        label={t('progress.trend_metrics.chest')}
                        value={latestChest}
                        unit="cm"
                        change={chestChange}
                        percentChange={chestPercentChange}
                        trend={chestChange > 0 ? 'good' : chestChange < -0.5 ? 'bad' : 'neutral'}
                        interpretation={chestChange > 0.5 ? t('progress.trend_metrics.chest_good') : chestChange < -0.5 ? t('progress.trend_metrics.chest_bad') : t('progress.trend_metrics.chest_neutral')}
                      />
                    )}
                    {latestBmi !== null && (
                      <TrendMetric
                        label={t('progress.trend_metrics.bmi')}
                        value={latestBmi}
                        unit=""
                        change={bmiChange}
                        percentChange={bmiPercentChange}
                        trend={bmiChange < 0 && latestBmi > 18.5 ? 'good' : bmiChange > 0 && latestBmi < 25 ? 'good' : 'neutral'}
                        interpretation={latestBmi < 18.5 ? t('progress.trend_metrics.bmi_underweight') : latestBmi > 25 ? t('progress.trend_metrics.bmi_elevated') : t('progress.trend_metrics.bmi_healthy')}
                      />
                    )}
                  </div>
                </Section>
              </>
            );
          })()}

          {photos.length > 0 ? (
            <Section
              eyebrow={t('progress.photos_eyebrow')}
              title={t('progress.photos_title')}
              subtitle={t('progress.photos_subtitle')}
              actions={null}
            >
              <ProgressPhotoCarousel photos={photos} />
            </Section>
          ) : null}
        </>
      ) : null}
    </>
  );

  if (embedded) {
    return <div className="space-y-7">{body}</div>;
  }

  return <AppContainer>{body}</AppContainer>;
}

export default function Progress({ embedded = false, measurements: propMeasurements, photos: propPhotos }) {
  const { t, locale } = useI18n();
  const isPt = locale === 'pt-BR';
  return <ProgressContent embedded={embedded} measurements={propMeasurements} photos={propPhotos} />;
}
