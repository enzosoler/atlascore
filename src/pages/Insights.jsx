import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  BarChart3,
  CalendarCheck,
  Dumbbell,
  Moon,
  Scale,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/routes';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/lib/i18nContext';
import { useSubscription } from '@/lib/SubscriptionContext';
import { supabase } from '@/lib/supabaseClient';
import { generateMvpInsights } from '@/lib/insightsEngine';
import {
  EmptyState,
  ErrorState,
  FilterChip,
  LoadingState,
  PageShell,
  SafePageBoundary,
  SectionCard,
  StatusBanner,
  toArray,
} from '@/components/shared/StablePage';
import { listMeasurements } from '@/services/bodyProgressService';
import { listDailyCheckins } from '@/services/checkinService';
import { TodayAdherenceCard, TodaySection } from '@/components/today/TodayMobileUI';
import { cn } from '@/lib/utils';
import AIHolisticInsights from '@/components/ai/AIHolisticInsights';

const ALL_RANGE_DAYS = {
  '14d': 14,
  '30d': 30,
  '90d': 90,
  '1yr': 365,
};

const CATEGORY_META = {
  progress: {
    label: 'Progress',
    icon: Scale,
  },
  training: {
    label: 'Training',
    icon: Dumbbell,
  },
  nutrition: {
    label: 'Nutrition',
    icon: UtensilsCrossed,
  },
  recovery: {
    label: 'Recovery',
    icon: Moon,
  },
  next_action: {
    label: 'Next action',
    icon: ArrowRight,
  },
};

const TONE_STYLES = {
  positive: {
    panel: 'border-[hsl(var(--ok)/0.18)] bg-[radial-gradient(circle_at_top_right,hsl(var(--ok)/0.08),transparent_42%),linear-gradient(180deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_100%)]',
    badge: 'border border-[hsl(var(--ok)/0.16)] bg-[hsl(var(--ok)/0.12)] text-[hsl(var(--ok))]',
  },
  attention: {
    panel: 'border-[hsl(var(--warn)/0.18)] bg-[radial-gradient(circle_at_top_right,hsl(var(--warn)/0.08),transparent_42%),linear-gradient(180deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_100%)]',
    badge: 'border border-[hsl(var(--warn)/0.16)] bg-[hsl(var(--warn)/0.12)] text-[hsl(var(--warn))]',
  },
  neutral: {
    panel: 'border-[hsl(var(--border)/0.92)] bg-[linear-gradient(180deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_100%)]',
    badge: 'border border-[hsl(var(--border)/0.9)] bg-[hsl(var(--fill)/0.7)] text-[hsl(var(--fg-2))]',
  },
};

function formatShortDate(dateKey) {
  if (!dateKey) return '--';
  return new Date(`${dateKey}T12:00:00`).toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
  });
}

function formatWindow(window) {
  if (!window?.start || !window?.end) return '--';
  return `${formatShortDate(window.start)} - ${formatShortDate(window.end)}`;
}

function directionLabel(direction) {
  if (direction === 'positive') return 'On track';
  if (direction === 'attention') return 'Needs attention';
  return 'Stable';
}

function metricLabel(metricKey) {
  const labels = {
    body_progress: 'Body progress',
    workout_adherence: 'Training',
    protein_adherence: 'Protein',
    nutrition_adherence: 'Nutrition',
    meal_logging: 'Meal logging',
    recovery_trend: 'Recovery',
    hydration_adherence: 'Hydration',
    sleep_adherence: 'Sleep',
    checkin_logging: 'Check-ins',
    data_baseline: 'Baseline',
  };

  return labels[metricKey] || 'Focus';
}

function routeForMetric(metricKey) {
  const routes = {
    workout_adherence: ROUTES.workouts,
    protein_adherence: ROUTES.nutrition,
    nutrition_adherence: ROUTES.nutrition,
    meal_logging: ROUTES.nutrition,
    hydration_adherence: ROUTES.today,
    sleep_adherence: ROUTES.today,
    checkin_logging: ROUTES.today,
    data_baseline: ROUTES.body,
    body_progress: ROUTES.body,
  };

  return routes[metricKey] || ROUTES.today;
}

function routeLabel(metricKey) {
  const labels = {
    workout_adherence: 'Open Workouts',
    protein_adherence: 'Open Nutrition',
    nutrition_adherence: 'Open Nutrition',
    meal_logging: 'Open Nutrition',
    hydration_adherence: 'Open Today',
    sleep_adherence: 'Open Today',
    checkin_logging: 'Open Today',
    data_baseline: 'Add measurement',
    body_progress: 'Open Body',
  };

  return labels[metricKey] || 'Open Today';
}

function SummaryItem({ item }) {
  const tone = TONE_STYLES[item.tone] || TONE_STYLES.neutral;

  return (
    <div className={cn('rounded-[20px] border px-4 py-4', tone.panel)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">
            {item.label}
          </p>
          <p className="mt-1.5 text-[18px] font-semibold tracking-[-0.04em] text-[hsl(var(--fg))]">
            {item.value}
          </p>
        </div>
        <span className={cn('shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold', tone.badge)}>
          {directionLabel(item.tone)}
        </span>
      </div>
      {item.detail ? (
        <p className="mt-2 text-[13px] leading-6 text-[hsl(var(--fg-2))]">{item.detail}</p>
      ) : null}
    </div>
  );
}

function SummaryPanel({ title, subtitle, icon: Icon, items, emptyText, className = '' }) {
  return (
    <SectionCard title={title} subtitle={subtitle} className={className}>
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[18px] border border-[hsl(var(--border)/0.9)] bg-[hsl(var(--fill)/0.7)] text-[hsl(var(--fg-2))]">
          <Icon className="h-4 w-4" strokeWidth={2} />
        </div>
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">
          Deterministic
        </p>
      </div>
      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item) => (
            <SummaryItem key={item.label} item={item} />
          ))}
        </div>
      ) : (
        <p className="text-[14px] leading-6 text-[hsl(var(--fg-2))]">{emptyText}</p>
      )}
    </SectionCard>
  );
}

function NextActionPanel({ insight }) {
  const route = routeForMetric(insight?.metric_key);
  const tone = TONE_STYLES[insight?.direction || 'neutral'] || TONE_STYLES.neutral;

  return (
    <SectionCard
      title="Next best action"
      subtitle="One deterministic step, chosen from the weakest meaningful signal."
      className={cn(
        'border-[hsl(var(--accent-secondary)/0.18)] bg-[radial-gradient(circle_at_top_right,hsl(var(--accent-secondary)/0.09),transparent_40%),linear-gradient(180deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_100%)]',
        tone.panel,
      )}
    >
      {insight ? (
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="atlas-overline text-[hsl(var(--accent-secondary))]">
                {metricLabel(insight.metric_key)}
              </p>
              <p className="mt-2 text-[1.1rem] font-semibold tracking-[-0.04em] text-[hsl(var(--fg))]">
                {insight.title}
              </p>
            </div>
            <span className={cn('shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold', tone.badge)}>
              {directionLabel(insight.direction)}
            </span>
          </div>

          <p className="text-[14px] leading-6 text-[hsl(var(--fg-2))]">
            {insight.body}
          </p>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="rounded-full border border-[hsl(var(--border)/0.88)] bg-[hsl(var(--fill)/0.66)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">
              {metricLabel(insight.metric_key)}
            </span>
            <Button asChild size="sm" variant="outline" className="shrink-0">
              <Link to={route}>
                {routeLabel(insight.metric_key)}
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-[14px] leading-6 text-[hsl(var(--fg-2))]">
          Add a few more check-ins, meals, or workouts to unlock a more specific next move.
        </p>
      )}
    </SectionCard>
  );
}

function CategoryInsightCard({ insight }) {
  const meta = CATEGORY_META[insight.category] || CATEGORY_META.progress;
  const Icon = meta.icon;
  const tone = TONE_STYLES[insight.direction || 'neutral'] || TONE_STYLES.neutral;

  return (
    <article className={cn('rounded-[24px] border px-5 py-5 shadow-[var(--shadow-sm)]', tone.panel)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] border border-[hsl(var(--border)/0.9)] bg-[hsl(var(--card)/0.92)] text-[hsl(var(--fg))]">
            <Icon className="h-4.5 w-4.5" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="atlas-overline">{meta.label}</p>
            <p className="mt-2 text-[1.05rem] font-semibold tracking-[-0.04em] text-[hsl(var(--fg))]">
              {insight.title}
            </p>
          </div>
        </div>
        <span className={cn('shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold', tone.badge)}>
          {directionLabel(insight.direction)}
        </span>
      </div>

      <p className="mt-3 text-[14px] leading-6 text-[hsl(var(--fg-2))]">{insight.body}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full border border-[hsl(var(--border)/0.88)] bg-[hsl(var(--fill)/0.66)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">
          {metricLabel(insight.metric_key)}
        </span>
      </div>
    </article>
  );
}

export default function Insights() {
  const { t, locale } = useI18n();
  const isPt = locale === 'pt-BR';
  return (
    <SafePageBoundary
      title={t('pages.insights.title')}
      subtitle={t('pages.insights.subtitle')}
      maxWidth="max-w-6xl"
      fallbackDescription="The Insights page opened in safe mode. The main content failed, but the route remains accessible."
    >
      <InsightsContent />
    </SafePageBoundary>
  );
}

function InsightsContent() {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const [range, setRange] = useState('30d');

  const planCode = subscription?.plan_code || 'free';
  const maxHistoryDays = planCode === 'performance' ? 3650 : planCode === 'pro' ? 365 : 30;
  const visibleRanges = Object.entries(ALL_RANGE_DAYS).filter(([, d]) => d <= maxHistoryDays);
  const validRange = visibleRanges.some(([key]) => key === range) ? range : '30d';
  const days = ALL_RANGE_DAYS[validRange] || 30;

  const profileQuery = useQuery({
    queryKey: ['insights-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data || null;
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000,
  });

  const measurementsQuery = useQuery({
    queryKey: ['insights-measurements', user?.id],
    queryFn: () => listMeasurements(user.id, 500),
    initialData: [],
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000,
  });

  const workoutsQuery = useQuery({
    queryKey: ['insights-workouts', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(500);

      if (error) throw error;
      return data || [];
    },
    initialData: [],
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const mealsQuery = useQuery({
    queryKey: ['insights-meals', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('food_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(1000);

      if (error) throw error;
      return data || [];
    },
    initialData: [],
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const checkinsQuery = useQuery({
    queryKey: ['insights-checkins', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return listDailyCheckins(user.id, { limit: 365 });
    },
    initialData: [],
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const dietPlansQuery = useQuery({
    queryKey: ['insights-diet-plans', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('diet_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    initialData: [],
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const workoutPlansQuery = useQuery({
    queryKey: ['insights-workout-plans', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    initialData: [],
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  // AI Insights — Lab exams (Performance tier)
  const labExamsQuery = useQuery({
    queryKey: ['insights-lab-exams', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('lab_exams')
        .select('*')
        .eq('user_id', user.id)
        .order('exam_date', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data || [];
    },
    initialData: [],
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000,
  });

  // AI Insights — Protocols (Performance tier)
  const protocolsQuery = useQuery({
    queryKey: ['insights-protocols', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('protocols')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    initialData: [],
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000,
  });

  // AI Insights — Protocol logs (Performance tier)
  const protocolLogsQuery = useQuery({
    queryKey: ['insights-protocol-logs', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('protocol_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('taken_at', { ascending: false })
        .limit(500);
      if (error) throw error;
      return data || [];
    },
    initialData: [],
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000,
  });

  const loading =
    profileQuery.isLoading ||
    measurementsQuery.isLoading ||
    workoutsQuery.isLoading ||
    mealsQuery.isLoading ||
    checkinsQuery.isLoading ||
    dietPlansQuery.isLoading ||
    workoutPlansQuery.isLoading;

  const hasErrors =
    profileQuery.isError ||
    measurementsQuery.isError ||
    workoutsQuery.isError ||
    mealsQuery.isError ||
    checkinsQuery.isError ||
    dietPlansQuery.isError ||
    workoutPlansQuery.isError;

  const profileRow = profileQuery.data || null;
  const profile = useMemo(() => {
    const pd = profileRow?.profile_data;
    const fromPd = pd && typeof pd === 'object' ? pd : {};
    const merged = { ...fromPd, ...(profileRow || {}) };
    delete merged.profile_data;
    return merged;
  }, [profileRow]);

  const measurements = toArray(measurementsQuery.data);
  const workouts = toArray(workoutsQuery.data);
  const meals = toArray(mealsQuery.data);
  const checkins = toArray(checkinsQuery.data);
  const activeDietPlan = toArray(dietPlansQuery.data)[0] || null;
  const activeWorkoutPlan = toArray(workoutPlansQuery.data)[0] || null;
  const labExams = toArray(labExamsQuery.data);
  const protocols = toArray(protocolsQuery.data);
  const protocolLogs = toArray(protocolLogsQuery.data);

  const hasAnyData = Boolean(measurements.length || workouts.length || meals.length || checkins.length);

  const mvp = useMemo(() => {
    if (!user?.id) return null;

    return generateMvpInsights({
      today: new Date().toISOString().split('T')[0],
      rangeDays: days,
      profile,
      workoutPlan: activeWorkoutPlan,
      dietPlan: activeDietPlan,
      measurements,
      workouts,
      meals,
      checkins,
    });
  }, [
    user?.id,
    days,
    profile,
    activeWorkoutPlan,
    activeDietPlan,
    measurements,
    workouts,
    meals,
    checkins,
  ]);

  const nextActionInsight =
    mvp?.insights?.find((item) => item.category === 'next_action') || null;

  const consistencyScore = mvp?.summary?.consistencyScore ?? 0;
  const consistencyLabel = mvp?.summary?.consistencyLabel || 'Not enough data yet';
  const consistencyItems = (mvp?.summary?.consistencyComponents || [])
    .filter((item) => item?.value !== null && item?.value !== undefined)
    .map((item) => ({
      label: item.label,
      value: item.value,
    }));

  const summaryWindowLabel = formatWindow(mvp?.summary?.summaryWindow);

  return (
    <PageShell
      title={isPt ? "Insights" : "Insights"}
      subtitle={isPt ? "Uma leitura focada do seu histórico recente, sem gráficos ruidosos ou bloqueios artificiais." : "A focused read on your recent history, without noisy charts or artificial blockers."}
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
      maxWidth="max-w-6xl"
    >
      {planCode === 'free' ? (
        <StatusBanner tone="neutral">
          <p className="font-semibold text-[hsl(var(--fg))]">History window limited on Free</p>
          <p className="mt-1">
            Recent insights are limited to the last 30 days.{' '}
            <a href="/pricing" className="font-semibold text-[hsl(var(--brand))] hover:opacity-80">
              Upgrade to Pro
            </a>{' '}
            to expand this range up to one year.
          </p>
        </StatusBanner>
      ) : null}

      {loading ? (
        <LoadingState
          title="Loading insights"
          description="We are loading the deterministic signal set while keeping the page available in safe mode."
        />
      ) : null}

      {!loading && hasErrors ? (
        <ErrorState
          title="Insights in safe mode"
          description="Some data did not load completely, but the page remains available and readable."
        />
      ) : null}

      {!loading && !hasAnyData ? (
        <SectionCard
          title={isPt ? "Aguardando sua primeira tendência" : "Waiting for your first trend"}
          subtitle={isPt ? "Insights se tornam úteis quando o app tem sinal suficiente para comparar comportamento recente." : "Insights become useful once the app has enough signal to compare recent behavior."}
        >
          <EmptyState
            icon={BarChart3}
            title={isPt ? "Sem dados para mostrar ainda" : "No data to show yet"}
            description={isPt ? "Registre alguns treinos, refeições, check-ins ou medidas para desbloquear seu primeiro insight significativo." : "Log a few workouts, nutrition entries, check-ins, or measurements to unlock your first meaningful insight."}
            action={
              <Button asChild size="default">
                <Link to={ROUTES.body}>Add your first measurement</Link>
              </Button>
            }
          />
        </SectionCard>
      ) : null}

      {!loading && hasAnyData ? (
        <>
          <TodaySection
            eyebrow="Overall"
            title="Consistency score"
            description={`Weighted from the last ${days} days. ${summaryWindowLabel !== '--' ? `Analysis window: ${summaryWindowLabel}.` : ''}`}
          >
            <TodayAdherenceCard
              score={consistencyScore}
              summary={consistencyLabel}
              items={consistencyItems}
            />
          </TodaySection>

          <section className="grid gap-4 md:grid-cols-2">
            <SummaryPanel
              title="This week"
              subtitle="The last 7 days, summarized in one calm read."
              icon={CalendarCheck}
              items={mvp?.summary?.thisWeek || []}
              emptyText="Not enough recent data to build a weekly read."
            />

            <SummaryPanel
              title="Since start"
              subtitle="Your longer baseline, not just the latest week."
              icon={Scale}
              items={mvp?.summary?.sinceStart || []}
              emptyText="Add a few more checkpoints to show change since the start."
            />

            <SummaryPanel
              title="Trends"
              subtitle="Direction of travel over the selected window."
              icon={Sparkles}
              items={mvp?.summary?.trends || []}
              emptyText="Add a little more history to unlock trend readings."
            />

            <NextActionPanel insight={nextActionInsight} />
          </section>

          {/* ── AI Holistic Insights ── */}
          <AIHolisticInsights
            profile={profile}
            measurements={measurements}
            workouts={workouts}
            workoutPlan={activeWorkoutPlan}
            meals={meals}
            dietPlan={activeDietPlan}
            checkins={checkins}
            labExams={labExams}
            protocols={protocols}
            protocolLogs={protocolLogs}
          />

          <SectionCard
            title="Deterministic readings"
            subtitle="One strong insight per category, built entirely from rules and data."
          >
            <div className="grid gap-4 lg:grid-cols-2">
              {(mvp?.insights || []).map((insight) => (
                <CategoryInsightCard key={insight.id} insight={insight} />
              ))}
            </div>
          </SectionCard>

          {hasErrors ? (
            <StatusBanner tone="warning">
              Some readings may be incomplete because one or more sources failed.
            </StatusBanner>
          ) : null}

          <div className="rounded-[20px] border border-[hsl(var(--brand)/0.18)] bg-[linear-gradient(180deg,hsl(var(--brand)/0.08)_0%,hsl(var(--card)/0.92)_100%)] px-5 py-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-[14px] font-semibold text-[hsl(var(--fg))]">Block Review</p>
              <p className="text-[12px] text-[hsl(var(--fg-2))] mt-0.5">
                Consolidated 4-12 week readout with adherence, deltas, and the next best move.
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
