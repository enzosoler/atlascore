import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Loader2, TrendingDown, TrendingUp } from 'lucide-react';
import { format, parseISO, subDays, isValid } from 'date-fns';
import AIProgressAnalysis from '@/components/ai/AIProgressAnalysis';
import ProgressPhotoCarousel from '@/components/progress/ProgressPhotoCarousel';
import { AppContainer, Card, PageHeader, Section } from '@/components/shared/AppContainer';
import { EmptyState, FilterChip } from '@/components/shared/StablePage';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import {
  listMeasurements,
  listProgressPhotos,
} from '@/services/bodyProgressService';

function MetricCard({ label, value, unit, change, goal, data }) {
  const isPositive = change > 0;
  const hasValue = value != null && !Number.isNaN(Number(value));
  const isGoal = goal && hasValue && Math.abs(goal - value) < Math.abs(goal - (data?.[0]?.value || value));

  return (
    <Card className="space-y-4 px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="atlas-metric-label">{label}</p>
          <p className="mt-3 text-[1.4rem] font-semibold tracking-[-0.05em] text-[hsl(var(--fg))]">
            {hasValue ? Number(value).toFixed(1) : '—'}
            <span className="ml-1 text-[14px] font-medium text-[hsl(var(--fg-2))]">{unit}</span>
          </p>
        </div>

        {change !== 0 && hasValue ? (
          <div className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${isPositive ? 'bg-[hsl(var(--ok)/0.12)] text-[hsl(var(--ok))]' : 'bg-[hsl(var(--err)/0.12)] text-[hsl(var(--err))]'}`}>
            {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            {Math.abs(change).toFixed(1)}
          </div>
        ) : null}
      </div>

      {data && data.length > 1 ? (
        <ResponsiveContainer width="100%" height={72}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`progress-${label}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--brand))" stopOpacity={0.26} />
                <stop offset="95%" stopColor="hsl(var(--brand))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="value" stroke="hsl(var(--brand))" fill={`url(#progress-${label})`} strokeWidth={2.4} dot={false} />
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

function ProgressContent({ embedded = false }) {
  const [timeframe, setTimeframe] = useState('12w');
  const { user } = useAuth();

  const weeksBack = timeframe === '4w' ? 4 : timeframe === '8w' ? 8 : 12;
  const startDate = subDays(new Date(), weeksBack * 7);

  const { data: measurements = [], isLoading: measurementsLoading } = useQuery({
    queryKey: ['measurements-progress', user?.id, timeframe],
    queryFn: () => listMeasurements(user.id, 100),
    enabled: !!user?.id,
  });

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

  const demoPhotos = useMemo(
    () => [
      { id: 'demo-1', date: '2026-01-01', photo_url: '/demo-progress-photos/progress_casual_1.jpg' },
      { id: 'demo-2', date: '2026-02-15', photo_url: '/demo-progress-photos/progress_casual_2.jpg' },
      { id: 'demo-3', date: '2026-03-19', photo_url: '/demo-progress-photos/progress_photo_3_after.jpg' },
    ],
    []
  );

  const { data: photos = demoPhotos, isLoading: photosLoading } = useQuery({
    queryKey: ['progress-photos', user?.id],
    queryFn: async () => {
      const items = await listProgressPhotos(user.id, 50);
      return items.length > 0 ? items : demoPhotos;
    },
    enabled: !!user?.id,
  });

  const isLoading = measurementsLoading || photosLoading;

  const filteredMeasurements = measurements.filter((measurement) => {
    const measurementDate = new Date(measurement.date);
    return measurementDate >= startDate;
  });

  const latest = filteredMeasurements[0];
  const oldest = filteredMeasurements[filteredMeasurements.length - 1];
  const weightChange = latest && oldest ? latest.weight - oldest.weight : 0;
  const bodyFatChange = latest && oldest ? latest.body_fat - oldest.body_fat : 0;

  const chartData = filteredMeasurements
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((measurement) => ({
      date: format(new Date(measurement.date), 'MMM d'),
      weight: measurement.weight,
      body_fat: measurement.body_fat,
      waist: measurement.waist,
      chest: measurement.chest,
      arms: measurement.arms,
      thighs: measurement.thighs,
      hips: measurement.hips,
      neck: measurement.neck,
    }));

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
          eyebrow="Body"
          title="Progress trends that stay readable at a glance."
          subtitle="Weight, composition, and checkpoint photos are grouped into a calm body-progress hub instead of scattered metrics."
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
              Loading progress
            </p>
            <p className="text-[13px] leading-6 text-[hsl(var(--fg-2))]">
              Pulling measurements and photo checkpoints.
            </p>
          </div>
        </Card>
      ) : null}

      {!isLoading && measurements.length === 0 ? (
        <Card className="px-0 py-0">
          <EmptyState
            icon={TrendingUp}
            title="No progress data yet"
            description="Record your first body checkpoint to unlock trends, AI reading, and comparison cards."
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

          <AIProgressAnalysis measurements={filteredMeasurements} profile={profile} />

          <Section
            eyebrow="Body trends"
            title={`Latest checkpoint · ${safeFormatDate(latest?.date, 'MMMM d')}`}
            subtitle="The key signals are surfaced first, with a mini curve and enough context to understand direction."
          >
            <div className="grid gap-4 lg:grid-cols-2">
              <MetricCard
                label="Weight"
                value={latest?.weight}
                unit="kg"
                change={weightChange}
                goal={profile?.target_weight}
                data={chartData.map((item) => ({ date: item.date, value: item.weight }))}
              />
              {latest?.body_fat ? (
                <MetricCard
                  label="Body Fat"
                  value={latest.body_fat}
                  unit="%"
                  change={bodyFatChange}
                  goal={profile?.body_fat_goal}
                  data={chartData.map((item) => ({ date: item.date, value: item.body_fat }))}
                />
              ) : null}
            </div>
          </Section>

          {latest?.waist ? (
            <Section
              eyebrow="Measurements"
              title="Circumference snapshot"
              subtitle="Secondary body measurements follow the same visual rhythm without overpowering the primary story."
            >
              <div className="grid gap-4 lg:grid-cols-2">
                {[
                  { key: 'waist', label: 'Waist', unit: 'cm' },
                  { key: 'chest', label: 'Chest', unit: 'cm' },
                  { key: 'arms', label: 'Arms', unit: 'cm' },
                  { key: 'thighs', label: 'Thighs', unit: 'cm' },
                  { key: 'hips', label: 'Hips', unit: 'cm' },
                  { key: 'neck', label: 'Neck', unit: 'cm' },
                ].map(({ key, label, unit }) => {
                  const latestValue = latest?.[key];
                  const oldestValue = oldest?.[key];
                  const change = latestValue && oldestValue ? latestValue - oldestValue : 0;

                  return latestValue ? (
                    <MetricCard
                      key={key}
                      label={label}
                      value={latestValue}
                      unit={unit}
                      change={change}
                      data={chartData.map((item) => ({ date: item.date, value: item[key] }))}
                    />
                  ) : null;
                })}
              </div>
            </Section>
          ) : null}

          {photos.length > 0 ? (
            <Section
              eyebrow="Photos"
              title="Visual evolution"
              subtitle="Photo checkpoints stay integrated with the body story instead of feeling like a separate utility."
            >
              <ProgressPhotoCarousel photos={photos} />
            </Section>
          ) : null}
        </>
      ) : null}
    </>
  );

  if (embedded) {
    return <div className="space-y-6">{body}</div>;
  }

  return <AppContainer>{body}</AppContainer>;
}

export default function Progress({ embedded = false }) {
  return <ProgressContent embedded={embedded} />;
}
