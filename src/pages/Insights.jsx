import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, Brain, Moon, Shield, BarChart3, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/routes';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/lib/i18nContext';
import { useSubscription } from '@/lib/SubscriptionContext';
import { supabase } from '@/lib/supabaseClient';
import {
  EmptyState,
  ErrorState,
  FilterChip,
  LoadingState,
  MetricCard,
  PageShell,
  SafePageBoundary,
  SectionCard,
  StatusBanner,
  formatNumber,
  toArray,
} from '@/components/shared/StablePage';
import { listMeasurements } from '@/services/bodyProgressService';

const ALL_RANGE_DAYS = {
  '14d': 14,
  '30d': 30,
  '90d': 90,
  '1yr': 365,
};

function avg(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function summarizeWeight(measurements, t) {
  if (measurements.length < 2) {
    return t('pages.insights.no_weight_data');
  }

  const newest = measurements[0]?.weight;
  const oldest = measurements[measurements.length - 1]?.weight;

  if (newest == null || oldest == null) {
    return t('pages.insights.weight_insufficient');
  }

  const delta = Number(newest) - Number(oldest);
  if (Math.abs(delta) < 0.2) {
    return t('pages.insights.weight_stable');
  }
  if (delta > 0) {
    return `Your weight increased by about ${delta.toFixed(1)} kg in the analyzed period.`;
  }
  return `Your weight decreased by about ${Math.abs(delta).toFixed(1)} kg in the analyzed period.`;
}

function summarizeProtocols(protocols, t) {
  const active = protocols.filter((p) => p?.active && !p?.end_date);
  if (active.length === 0) {
    return t('pages.insights.no_active_protocols');
  }
  const names = active
    .slice(0, 3)
    .map((p) => p.name || 'Protocol')
    .join(', ');
  const extra = active.length > 3 ? ` and ${active.length - 3} more` : '';
  return `${active.length} active protocol${active.length > 1 ? 's' : ''}: ${names}${extra}.`;
}

export default function Insights() {
  const { t } = useI18n();
  return (
    <SafePageBoundary
      title={t('pages.insights.title')}
      subtitle={t('pages.insights.subtitle')}
      maxWidth="max-w-5xl"
      fallbackDescription="The Insights page opened in safe mode. The main content failed, but the route remains accessible."
    >
      <InsightsContent />
    </SafePageBoundary>
  );
}

function InsightsContent() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const [range, setRange] = useState('30d');

  // Compute max allowed days based on plan
  const planCode = subscription?.plan_code || 'free';
  const maxHistoryDays = planCode === 'performance' ? 3650 : planCode === 'pro' ? 365 : 30;

  // Filter available ranges by plan
  const visibleRanges = Object.entries(ALL_RANGE_DAYS).filter(([, d]) => d <= maxHistoryDays);

  // Clamp current range to what's allowed
  const validRange = visibleRanges.some(([key]) => key === range) ? range : '30d';
  const days = ALL_RANGE_DAYS[validRange] || 30;

  const cutoff = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  }, [days]);

  const measurementsQuery = useQuery({
    queryKey: ['insights-measurements-stable', user?.id, days],
    queryFn: () => listMeasurements(user.id, 200),
    initialData: [],
    enabled: !!user?.id,
  });
  const checkinsQuery = useQuery({
    queryKey: ['insights-checkins-stable', user?.id, days],
    queryFn: async () => [],
    initialData: [],
    enabled: !!user?.id,
  });
  const workoutsQuery = useQuery({
    queryKey: ['insights-workouts-stable', user?.id, days],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(200);

      if (error) {
        throw error;
      }

      return (data || []).map((workout) => ({
        ...workout,
        date: workout.completed_at ? workout.completed_at.split('T')[0] : null,
      }));
    },
    initialData: [],
    enabled: !!user?.id,
  });
  const mealsQuery = useQuery({
    queryKey: ['insights-meals-stable', user?.id, days],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('food_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(500);

      if (error) {
        throw error;
      }

      return (data || []).map((item) => ({
        ...item,
        date: item.date ? item.date.split('T')[0] : null,
        total_calories: Number(item.calories || 0),
      }));
    },
    initialData: [],
    enabled: !!user?.id,
  });
  const protocolsQuery = useQuery({
    queryKey: ['insights-protocols-stable', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('protocols')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: false })
        .limit(100);

      if (error) {
        throw error;
      }

      return data || [];
    },
    initialData: [],
    enabled: !!user?.id,
  });

  const loading =
    measurementsQuery.isLoading ||
    checkinsQuery.isLoading ||
    workoutsQuery.isLoading ||
    mealsQuery.isLoading ||
    protocolsQuery.isLoading;

  const hasErrors =
    measurementsQuery.isError ||
    checkinsQuery.isError ||
    workoutsQuery.isError ||
    mealsQuery.isError ||
    protocolsQuery.isError;

  const measurements = toArray(measurementsQuery.data).filter(
    (item) => item?.date && item.date >= cutoff,
  );
  const checkins = toArray(checkinsQuery.data).filter(
    (item) => item?.date && item.date >= cutoff,
  );
  const workouts = toArray(workoutsQuery.data).filter(
    (item) => item?.date && item.date >= cutoff,
  );
  const meals = toArray(mealsQuery.data).filter((item) => item?.date && item.date >= cutoff);
  const protocols = toArray(protocolsQuery.data);

  // Fix: was `item?.completed` (boolean field that doesn't exist).
  // The correct field is `status === 'completed'`, consistent with Today.jsx.
  const completedWorkouts = workouts.filter((item) => item?.status === 'completed');

  const caloriesPerDay = avg(
    Object.values(
      meals.reduce((accumulator, meal) => {
        const date = meal?.date || 'undated';
        accumulator[date] = Number(accumulator[date] || 0) + Number(meal?.total_calories || 0);
        return accumulator;
      }, {}),
    ),
  );

  const averageSleep = avg(
    checkins.map((item) => Number(item?.sleep_hours || 0)).filter(Boolean),
  );
  const averageEnergy = avg(
    checkins.map((item) => Number(item?.energy || 0)).filter(Boolean),
  );
  const activeProtocols = protocols.filter((item) => item?.active && !item?.end_date);

  const hasAnyData = Boolean(
    measurements.length || checkins.length || workouts.length || meals.length || protocols.length,
  );

  const consistencyText =
    completedWorkouts.length === 0
      ? workouts.length > 0
        ? t('pages.insights.training_not_completed')
        : t('pages.insights.training_no_records')
      : completedWorkouts.length >= Math.max(3, Math.floor(days / 10))
        ? `Your training consistency in this period is strong — ${completedWorkouts.length} sessions completed.`
        : `Your training volume in this period is low (${completedWorkouts.length} sessions). It may be worth increasing frequency.`;

  const nutritionText =
    caloriesPerDay > 0
      ? `Your average logged intake was about ${formatNumber(caloriesPerDay)} kcal per day.`
      : t('pages.insights.nutrition_insufficient');

  const recoveryText =
    averageSleep > 0
      ? `Average sleep: ${averageSleep.toFixed(1)}h. Average energy: ${averageEnergy.toFixed(1)} / 5.`
      : t('pages.insights.recovery_insufficient');

  const protocolsText = summarizeProtocols(protocols, t);

  return (
    <PageShell
      title="Insights"
      subtitle="A focused read on your recent history, without noisy charts or artificial blockers."
      actions={
        <>
          {visibleRanges.map(([option]) => (
            <FilterChip
              key={option}
              onClick={() => setRange(option)}
              active={validRange === option}
            >
              {option}
            </FilterChip>
          ))}
        </>
      }
      maxWidth="max-w-5xl"
    >
      {/* Free plan notice */}
      {planCode === 'free' && (
        <StatusBanner tone="neutral">
          <p className="font-semibold text-[hsl(var(--fg))]">History window limited on Free</p>
          <p className="mt-1">
            Recent insights are limited to the last 30 days. <a href="/pricing" className="font-semibold text-[hsl(var(--brand))] hover:opacity-80">Upgrade to Pro</a> to expand this range up to one year.
          </p>
        </StatusBanner>
      )}

      {loading ? (
        <LoadingState
          title="Loading insights"
          description="We are loading the data sources while keeping the page available in safe mode."
        />
      ) : null}

      {!loading && hasErrors ? (
        <ErrorState
          title="Insights in safe mode"
          description="Some data did not load completely, but the page remains available and readable."
        />
      ) : null}

      {/* Empty state — shown only when there is genuinely no data */}
      {!loading && !hasAnyData ? (
        <SectionCard title="Waiting for your first trend" subtitle="Insights become useful once the app has enough signal to compare recent behavior.">
          <EmptyState
            icon={BarChart3}
            title="No data to show yet"
            description="Log at least a few days of workouts, nutrition, or measurements to generate your first meaningful insight."
            action={
              <Button asChild size="default">
                <Link to={ROUTES.body}>Add your first measurement</Link>
              </Button>
            }
          />
        </SectionCard>
      ) : null}

      {/* Metrics and text sections — shown only when there is actual data */}
      {!loading && hasAnyData ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Completed workouts"
              value={formatNumber(completedWorkouts.length)}
              hint={`Period analyzed: last ${days} days`}
              icon={Activity}
            />
            <MetricCard
              label="Average sleep"
              value={averageSleep ? `${averageSleep.toFixed(1)} h` : '--'}
              hint="Calculated from recorded check-ins."
              icon={Moon}
            />
            <MetricCard
              label="Average calories"
              value={caloriesPerDay ? `${formatNumber(caloriesPerDay)} kcal` : '--'}
              hint="Average per day with logged meals."
              icon={Brain}
            />
            <MetricCard
              label="Active protocols"
              value={formatNumber(activeProtocols.length)}
              hint="Protocols that are still active today."
              icon={Shield}
            />
          </section>

          <SectionCard
            title="Key takeaways"
            subtitle="Plain-language summary of what your recent history is showing."
          >
            <div className="grid gap-3 md:grid-cols-2">
              <div className="atlas-card-muted p-4 text-sm leading-6 text-[hsl(var(--fg-2))]">
                <p className="font-semibold text-[hsl(var(--fg))]">Weight</p>
                <p className="mt-2">{summarizeWeight(measurements, t)}</p>
              </div>
              <div className="atlas-card-muted p-4 text-sm leading-6 text-[hsl(var(--fg-2))]">
                <p className="font-semibold text-[hsl(var(--fg))]">Training</p>
                <p className="mt-2">{consistencyText}</p>
              </div>
              <div className="atlas-card-muted p-4 text-sm leading-6 text-[hsl(var(--fg-2))]">
                <p className="font-semibold text-[hsl(var(--fg))]">Nutrition</p>
                <p className="mt-2">{nutritionText}</p>
              </div>
              <div className="atlas-card-muted p-4 text-sm leading-6 text-[hsl(var(--fg-2))]">
                <p className="font-semibold text-[hsl(var(--fg))]">Recovery</p>
                <p className="mt-2">{recoveryText}</p>
              </div>
              <div className="atlas-card-muted p-4 text-sm leading-6 text-[hsl(var(--fg-2))] md:col-span-2">
                <p className="font-semibold text-[hsl(var(--fg))]">Protocols</p>
                <p className="mt-2">{protocolsText}</p>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Record count"
            subtitle="Simple view of how much data is available in this period."
          >
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="atlas-card-muted p-4 text-sm text-[hsl(var(--fg-2))]">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">
                  Check-ins
                </p>
                <p className="mt-2 text-2xl font-bold text-[hsl(var(--fg))]">
                  {formatNumber(checkins.length)}
                </p>
              </div>
              <div className="atlas-card-muted p-4 text-sm text-[hsl(var(--fg-2))]">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">
                  Meals
                </p>
                <p className="mt-2 text-2xl font-bold text-[hsl(var(--fg))]">
                  {formatNumber(meals.length)}
                </p>
              </div>
              <div className="atlas-card-muted p-4 text-sm text-[hsl(var(--fg-2))]">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">
                  Measurements
                </p>
                <p className="mt-2 text-2xl font-bold text-[hsl(var(--fg))]">
                  {formatNumber(measurements.length)}
                </p>
              </div>
              <div className="atlas-card-muted p-4 text-sm text-[hsl(var(--fg-2))]">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">
                  Workouts
                </p>
                <p className="mt-2 text-2xl font-bold text-[hsl(var(--fg))]">
                  {formatNumber(workouts.length)}
                </p>
              </div>
            </div>
          </SectionCard>

          {hasErrors ? (
            <StatusBanner tone="warning">
              Some readings may be incomplete because one or more sources failed.
            </StatusBanner>
          ) : null}

          {/* Block Review entry point */}
          <div className="rounded-[20px] border border-[hsl(var(--brand)/0.18)] bg-[linear-gradient(180deg,hsl(var(--brand)/0.08)_0%,hsl(var(--card)/0.92)_100%)] px-5 py-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-[14px] font-semibold text-[hsl(var(--fg))]">Block Review</p>
              <p className="text-[12px] text-[hsl(var(--fg-2))] mt-0.5">
                Consolidated 4–12 week readout with adherence, deltas, and the next best move.
              </p>
            </div>
            <Button asChild size="sm" variant="outline" className="shrink-0">
              <Link to={ROUTES.blockReview}>
                Open block <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </>
      ) : null}
    </PageShell>
  );
}
