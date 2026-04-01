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
  TrendingUp,
  Target,
  Zap,
  UtensilsCrossed,
  Activity,
  ChevronRight,
  Lightbulb,
  Clock,
  Flame,
  Droplets,
  Brain,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ROUTES } from '@/lib/routes';
import { useAuth } from '@/lib/AuthContext';
import { useI18n, useT } from '@/lib/i18nContext';
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

const ALL_RANGE_DAYS = {
  '14d': 14,
  '30d': 30,
  '90d': 90,
  '1yr': 365,
};

const CATEGORY_META = {
  progress: {
    labelKey: 'insights.categoryProgress',
    icon: Scale,
  },
  training: {
    labelKey: 'insights.categoryTraining',
    icon: Dumbbell,
  },
  nutrition: {
    labelKey: 'insights.categoryNutrition',
    icon: UtensilsCrossed,
  },
  recovery: {
    labelKey: 'insights.categoryRecovery',
    icon: Moon,
  },
  next_action: {
    labelKey: 'insights.categoryNextAction',
    icon: ArrowRight,
  },
};

// Sample insights to show as previews when user has no data
const SAMPLE_INSIGHTS = [
  {
    id: 'sample-1',
    category: 'progress',
    title: 'Your weight is trending down over the last 4 weeks',
    body: 'Based on your weekly check-ins, you have maintained a steady -0.5kg/week average. This pace is sustainable and aligned with your goals.',
    direction: 'positive',
    metric_key: 'body_progress',
  },
  {
    id: 'sample-2',
    category: 'nutrition',
    title: 'Your protein intake is below target on most days',
    body: 'You hit your 140g protein goal on 3 of the last 7 days. Consider adding a protein source to your breakfast to improve consistency.',
    direction: 'attention',
    metric_key: 'protein_adherence',
  },
  {
    id: 'sample-3',
    category: 'training',
    title: 'You are most consistent on weekdays',
    body: 'You completed 8 of 10 planned weekday workouts vs 1 of 4 weekend sessions. Consider shifting one weekend session to Friday.',
    direction: 'neutral',
    metric_key: 'workout_adherence',
  },
  {
    id: 'sample-4',
    category: 'recovery',
    title: 'Higher sleep correlates with better workout performance',
    body: 'On days after 7+ hours of sleep, your average training volume was 15% higher. Sleep could be your performance multiplier.',
    direction: 'positive',
    metric_key: 'recovery_trend',
  },
];

// Quick action items for empty state
const QUICK_ACTIONS = [
  {
    id: 'workout',
    labelKey: 'insights.quickActionWorkoutLabel',
    descriptionKey: 'insights.quickActionWorkoutDesc',
    icon: Dumbbell,
    route: ROUTES.workouts,
    color: 'brand',
  },
  {
    id: 'meal',
    labelKey: 'insights.quickActionMealLabel',
    descriptionKey: 'insights.quickActionMealDesc',
    icon: UtensilsCrossed,
    route: ROUTES.nutrition,
    color: 'warn',
  },
  {
    id: 'measurement',
    labelKey: 'insights.quickActionMeasurementLabel',
    descriptionKey: 'insights.quickActionMeasurementDesc',
    icon: Scale,
    route: ROUTES.body,
    color: 'ok',
  },
];

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

function formatShortDate(dateKey, locale = 'en') {
  if (!dateKey) return '--';
  return new Date(`${dateKey}T12:00:00`).toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
  });
}

function formatWindow(window, locale = 'en') {
  if (!window?.start || !window?.end) return '--';
  return `${formatShortDate(window.start, locale)} - ${formatShortDate(window.end, locale)}`;
}

function directionLabel(direction, t) {
  if (direction === 'positive') return t('insights.directionOnTrack');
  if (direction === 'attention') return t('insights.directionNeedsAttention');
  return t('insights.directionStable');
}

function metricLabel(metricKey, t) {
  const keys = {
    body_progress: 'insights.metricBodyProgress',
    workout_adherence: 'insights.metricTraining',
    protein_adherence: 'insights.metricProtein',
    nutrition_adherence: 'insights.metricNutrition',
    meal_logging: 'insights.metricMealLogging',
    recovery_trend: 'insights.metricRecovery',
    hydration_adherence: 'insights.metricHydration',
    sleep_adherence: 'insights.metricSleep',
    checkin_logging: 'insights.metricCheckins',
    data_baseline: 'insights.metricBaseline',
  };

  return t(keys[metricKey] || 'insights.metricFocus');
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

function routeLabel(metricKey, t) {
  const keys = {
    workout_adherence: 'insights.routeLabelWorkouts',
    protein_adherence: 'insights.routeLabelNutrition',
    nutrition_adherence: 'insights.routeLabelNutrition',
    meal_logging: 'insights.routeLabelNutrition',
    hydration_adherence: 'insights.routeLabelToday',
    sleep_adherence: 'insights.routeLabelToday',
    checkin_logging: 'insights.routeLabelToday',
    data_baseline: 'insights.routeLabelMeasurement',
    body_progress: 'insights.routeLabelBody',
  };

  return t(keys[metricKey] || 'insights.routeLabelToday');
}

// Calculate unlock progress based on user data
function calculateUnlockProgress(workouts, meals, measurements) {
  const workoutCount = workouts?.length || 0;
  const mealCount = meals?.length || 0;
  const measurementCount = measurements?.length || 0;

  const steps = [
    { id: 'workout', labelKey: 'insights.unlockStepWorkout', completed: workoutCount >= 1 },
    { id: 'meals', labelKey: 'insights.unlockStepMeals', completed: mealCount >= 2 },
    { id: 'measurement', labelKey: 'insights.unlockStepMeasurement', completed: measurementCount >= 1 },
  ];

  const completedCount = steps.filter((s) => s.completed).length;
  const progressPercent = (completedCount / steps.length) * 100;

  return { steps, completedCount, totalCount: steps.length, progressPercent };
}

// Calculate insight level based on data volume
function calculateInsightLevel(workouts, meals, measurements, checkins) {
  const workoutCount = workouts?.length || 0;
  const mealCount = meals?.length || 0;
  const measurementCount = measurements?.length || 0;
  const checkinCount = checkins?.length || 0;

  const totalDataPoints = workoutCount + mealCount + measurementCount + checkinCount;

  if (totalDataPoints === 0) return { level: 0, labelKey: 'insights.insightLevel0', stage: 'empty' };
  if (totalDataPoints <= 3) return { level: 25, labelKey: 'insights.insightLevel25', stage: 'starting' };
  if (totalDataPoints <= 7) return { level: 50, labelKey: 'insights.insightLevel50', stage: 'building' };
  if (totalDataPoints <= 15) return { level: 75, labelKey: 'insights.insightLevel75', stage: 'growing' };
  return { level: 100, labelKey: 'insights.insightLevel100', stage: 'full' };
}

function SummaryItem({ item }) {
  const t = useT();
  const tone = TONE_STYLES[item.tone] || TONE_STYLES.neutral;

  return (
    <div className={cn('rounded-[18px] border px-4 py-4', tone.panel)}>
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
          {directionLabel(item.tone, t)}
        </span>
      </div>
      {item.detail ? (
        <p className="mt-2 text-[13px] leading-6 text-[hsl(var(--fg-2))]">{item.detail}</p>
      ) : null}
    </div>
  );
}

function SummaryPanel({ title, subtitle, icon: Icon, items, emptyText, className = '' }) {
  const t = useT();
  return (
    <SectionCard title={title} subtitle={subtitle} className={className}>
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--fill)/0.7)] text-[hsl(var(--fg-2))]">
          <Icon className="h-4 w-4" strokeWidth={2} />
        </div>
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">
          {t('insights.deterministic')}
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
  const t = useT();
  const route = routeForMetric(insight?.metric_key);
  const tone = TONE_STYLES[insight?.direction || 'neutral'] || TONE_STYLES.neutral;

  return (
    <SectionCard
      title={t('insights.nextBestActionTitle')}
      subtitle={t('insights.nextBestActionSubtitle')}
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
                {metricLabel(insight.metric_key, t)}
              </p>
              <p className="mt-2 text-[1.1rem] font-semibold tracking-[-0.04em] text-[hsl(var(--fg))]">
                {insight.title}
              </p>
            </div>
            <span className={cn('shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold', tone.badge)}>
              {directionLabel(insight.direction, t)}
            </span>
          </div>

          <p className="text-[14px] leading-6 text-[hsl(var(--fg-2))]">
            {insight.body}
          </p>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="rounded-full border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--fill)/0.66)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">
              {metricLabel(insight.metric_key, t)}
            </span>
            <Button asChild size="sm" variant="outline" className="shrink-0">
              <Link to={route}>
                {routeLabel(insight.metric_key, t)}
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-[14px] leading-6 text-[hsl(var(--fg-2))]">
          {t('insights.nextBestActionEmpty')}
        </p>
      )}
    </SectionCard>
  );
}

function CategoryInsightCard({ insight }) {
  const t = useT();
  const meta = CATEGORY_META[insight.category] || CATEGORY_META.progress;
  const Icon = meta.icon;
  const tone = TONE_STYLES[insight.direction || 'neutral'] || TONE_STYLES.neutral;

  return (
    <article className={cn('rounded-[20px] border px-5 py-5 shadow-[var(--shadow-sm)]', tone.panel)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card)/0.92)] text-[hsl(var(--fg))]">
            <Icon className="h-4.5 w-4.5" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="atlas-overline">{t(meta.labelKey)}</p>
            <p className="mt-2 text-[1.05rem] font-semibold tracking-[-0.04em] text-[hsl(var(--fg))]">
              {insight.title}
            </p>
          </div>
        </div>
        <span className={cn('shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold', tone.badge)}>
          {directionLabel(insight.direction, t)}
        </span>
      </div>

      <p className="mt-3 text-[14px] leading-6 text-[hsl(var(--fg-2))]">{insight.body}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--fill)/0.66)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">
          {metricLabel(insight.metric_key, t)}
        </span>
      </div>
    </article>
  );
}

// Sample/Preview insight card - shown when no real data exists
function PreviewInsightCard({ insight, isSample = false }) {
  const t = useT();
  const meta = CATEGORY_META[insight.category] || CATEGORY_META.progress;
  const Icon = meta.icon;
  const tone = TONE_STYLES[insight.direction || 'neutral'] || TONE_STYLES.neutral;

  return (
    <article className={cn(
      'rounded-[20px] border px-5 py-5 shadow-[var(--shadow-sm)] transition-all duration-300',
      tone.panel,
      isSample && 'opacity-80 hover:opacity-100'
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card)/0.92)] text-[hsl(var(--fg))]">
            <Icon className="h-4.5 w-4.5" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="atlas-overline">{t(meta.labelKey)}</p>
              {isSample && (
                <span className="rounded-full border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--fill)/0.5)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[hsl(var(--fg-3))]">
                  {t('insights.exampleBadge')}
                </span>
              )}
            </div>
            <p className="mt-2 text-[1.05rem] font-semibold tracking-[-0.04em] text-[hsl(var(--fg))]">
              {insight.title}
            </p>
          </div>
        </div>
        <span className={cn('shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold', tone.badge)}>
          {directionLabel(insight.direction, t)}
        </span>
      </div>

      <p className="mt-3 text-[14px] leading-6 text-[hsl(var(--fg-2))]">{insight.body}</p>
    </article>
  );
}

// Unlock progress component - shows checklist of steps to unlock insights
function UnlockProgress({ steps, completedCount, totalCount, progressPercent }) {
  const t = useT();

  return (
    <div className="rounded-[20px] border border-[hsl(var(--brand)/0.2)] bg-[radial-gradient(circle_at_top_right,hsl(var(--brand)/0.06),transparent_40%),linear-gradient(180deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_100%)] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] border border-[hsl(var(--brand)/0.2)] bg-[hsl(var(--brand)/0.1)] text-[hsl(var(--brand))]">
            <Lightbulb className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-[hsl(var(--fg))]">
              {t('insights.unlockTitle')}
            </p>
            <p className="mt-1 text-[13px] leading-5 text-[hsl(var(--fg-2))]">
              {t('insights.unlockSubtitle')}
            </p>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[24px] font-bold tracking-[-0.04em] text-[hsl(var(--brand))]">
            {completedCount}/{totalCount}
          </p>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">
            {t('insights.unlockComplete')}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <Progress value={progressPercent} className="h-2 bg-[hsl(var(--fill))]" />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {steps.map((step, index) => {
          const Icon = step.icon || (step.id === 'workout' ? Dumbbell : step.id === 'meals' ? UtensilsCrossed : Scale);
          return (
            <div
              key={step.id}
              className={cn(
                'flex items-center gap-3 rounded-[14px] border px-4 py-3 transition-all duration-200',
                step.completed
                  ? 'border-[hsl(var(--ok)/0.3)] bg-[hsl(var(--ok)/0.08)]'
                  : 'border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card)/0.5)]'
              )}
            >
              <div
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                  step.completed
                    ? 'bg-[hsl(var(--ok)/0.2)] text-[hsl(var(--ok))]'
                    : 'bg-[hsl(var(--fill)/0.7)] text-[hsl(var(--fg-3))]'
                )}
              >
                {step.completed ? (
                  <Sparkles className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>
              <div className="min-w-0">
                <p className={cn(
                  'text-[13px] font-medium',
                  step.completed ? 'text-[hsl(var(--ok))]' : 'text-[hsl(var(--fg))]'
                )}>
                  {t(step.labelKey)}
                </p>
                <p className="text-[11px] text-[hsl(var(--fg-3))]">
                  {t('insights.unlockStep').replace('{n}', index + 1)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {completedCount === totalCount && (
        <div className="mt-4 rounded-[14px] border border-[hsl(var(--ok)/0.2)] bg-[hsl(var(--ok)/0.08)] px-4 py-3">
          <p className="text-[13px] font-medium text-[hsl(var(--ok))]">
            {t('insights.unlockAllDone')}
          </p>
        </div>
      )}
    </div>
  );
}

// Quick action buttons for empty state
function QuickActionButtons() {
  const t = useT();

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {QUICK_ACTIONS.map((action) => {
        const Icon = action.icon;
        const colorVar = action.color === 'brand' ? 'var(--brand)' : action.color === 'ok' ? 'var(--ok)' : 'var(--warn)';

        return (
          <Link
            key={action.id}
            to={action.route}
            className="group flex items-center gap-4 rounded-[18px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card))] p-4 transition-all duration-200 hover:border-[hsl(var(--brand)/0.3)] hover:shadow-[var(--shadow-sm)]"
          >
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px]"
              style={{ backgroundColor: `hsl(${colorVar}/0.1)`, color: `hsl(${colorVar})` }}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold text-[hsl(var(--fg))] group-hover:text-[hsl(var(--brand))] transition-colors">
                {t(action.labelKey)}
              </p>
              <p className="text-[12px] text-[hsl(var(--fg-3))]">{t(action.descriptionKey)}</p>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-[hsl(var(--fg-3))] group-hover:text-[hsl(var(--brand))] transition-colors" />
          </Link>
        );
      })}
    </div>
  );
}

// AI Coaching message component
function AICoachingMessage({ hasSomeData }) {
  const t = useT();

  return (
    <div className="rounded-[18px] border border-[hsl(var(--accent-secondary)/0.2)] bg-[radial-gradient(circle_at_top_left,hsl(var(--accent-secondary)/0.06),transparent_40%),linear-gradient(180deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_100%)] px-5 py-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[hsl(var(--accent-secondary)/0.1)] text-[hsl(var(--accent-secondary))]">
          <Brain className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[14px] font-semibold text-[hsl(var(--fg))]">
            {t('insights.aiAnalysisTitle')}
          </p>
          <p className="mt-1 text-[13px] leading-5 text-[hsl(var(--fg-2))]">
            {hasSomeData
              ? t('insights.aiAnalysisHasSomeData')
              : t('insights.aiAnalysisNoData')}
          </p>
        </div>
      </div>
    </div>
  );
}

// Insight Level indicator
function InsightLevelIndicator({ level, labelKey, stage }) {
  const t = useT();

  const stageLabels = {
    empty: t('insights.stageEmpty'),
    starting: t('insights.stageStarting'),
    building: t('insights.stageBuilding'),
    growing: t('insights.stageGrowing'),
    full: t('insights.stageFull'),
  };

  const stageColors = {
    empty: 'var(--fg-3)',
    starting: 'var(--warn)',
    building: 'var(--brand)',
    growing: 'var(--ok)',
    full: 'var(--ok)',
  };

  return (
    <div className="flex items-center justify-between rounded-[14px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card))] px-4 py-3">
      <div className="flex items-center gap-3">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-[12px]"
          style={{ backgroundColor: `hsl(${stageColors[stage]}/0.1)`, color: `hsl(${stageColors[stage]})` }}
        >
          <Activity className="h-4 w-4" />
        </div>
        <div>
          <p className="text-[13px] font-medium text-[hsl(var(--fg))]">{label}</p>
          <p className="text-[11px] text-[hsl(var(--fg-3))]">{stageLabels[stage]}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-2 w-24 overflow-hidden rounded-full bg-[hsl(var(--fill))]">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${level}%`,
              backgroundColor: `hsl(${stageColors[stage]})`,
            }}
          />
        </div>
        <span className="text-[12px] font-semibold text-[hsl(var(--fg-2))]">{level}%</span>
      </div>
    </div>
  );
}

// Category preview cards - show what insights each category will provide
function CategoryPreviews() {
  const { t } = useI18n();

  const categories = [
    {
      key: 'training',
      icon: Dumbbell,
      title: t('insights.categoryTraining'),
      examples: [t('insights.trainingExample1'), t('insights.trainingExample2')],
    },
    {
      key: 'nutrition',
      icon: UtensilsCrossed,
      title: t('insights.categoryNutrition'),
      examples: [t('insights.nutritionExample1'), t('insights.nutritionExample2')],
    },
    {
      key: 'progress',
      icon: TrendingUp,
      title: t('insights.categoryBody'),
      examples: [t('insights.bodyExample1'), t('insights.bodyExample2')],
    },
    {
      key: 'recovery',
      icon: Moon,
      title: t('insights.categoryConsistency'),
      examples: [t('insights.consistencyExample1'), t('insights.consistencyExample2')],
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {categories.map((cat) => {
        const Icon = cat.icon;
        return (
          <div
            key={cat.key}
            className="rounded-[18px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card)/0.6)] p-4 transition-all duration-200 hover:border-[hsl(var(--border)/0.9)] hover:bg-[hsl(var(--card))]"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[hsl(var(--fill)/0.6)] text-[hsl(var(--fg-2))]">
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-[13px] font-semibold text-[hsl(var(--fg))]">{cat.title}</p>
            </div>
            <ul className="mt-3 space-y-1.5">
              {cat.examples.map((example, i) => (
                <li key={i} className="flex items-start gap-2 text-[12px] text-[hsl(var(--fg-3))]">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[hsl(var(--fg-3))]" />
                  <span>{example}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

// Empty state redesigned - now shows value immediately
function InsightsEmptyState({ workouts, meals, measurements, checkins }) {
  const { t } = useI18n();

  const unlockProgress = calculateUnlockProgress(workouts, meals, measurements);
  const insightLevel = calculateInsightLevel(workouts, meals, measurements, checkins);
  const hasSomeData = unlockProgress.completedCount > 0;

  // Check for today's activity
  const today = new Date().toISOString().split('T')[0];
  const hasLoggedToday =
    workouts?.some((w) => w.date === today || w.completed_at?.startsWith(today)) ||
    meals?.some((m) => m.date === today) ||
    measurements?.some((m) => m.date === today) ||
    checkins?.some((c) => c.date === today);

  return (
    <div className="space-y-6">
      {/* Header with immediate value */}
      <div className="rounded-[20px] border border-[hsl(var(--brand)/0.15)] bg-[radial-gradient(ellipse_at_top,hsl(var(--brand)/0.08),transparent_60%),linear-gradient(180deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_100%)] p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[14px] bg-[hsl(var(--brand)/0.12)] text-[hsl(var(--brand))]">
            <Sparkles className="h-7 w-7" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-[18px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
              {t('insights.yourProgressInsights')}
            </h2>
            <p className="mt-2 text-[14px] leading-6 text-[hsl(var(--fg-2))]">
              {hasLoggedToday
                ? t('insights.loggedTodayContinue')
                : t('insights.nothingLoggedToday')}
            </p>
          </div>
        </div>

        {/* Insight Level Indicator */}
        <div className="mt-5">
          <InsightLevelIndicator
            level={insightLevel.level}
            label={insightLevel.label}
            stage={insightLevel.stage}
          />
        </div>
      </div>

      {/* Unlock System */}
      <UnlockProgress {...unlockProgress} />

      {/* Quick Actions */}
      <SectionCard
        title={t('insights.startLoggingData')}
        subtitle={t('insights.quickActionsSubtitle')}
        actions={null}
      >
        <QuickActionButtons />
      </SectionCard>

      {/* AI Coaching Layer */}
      <AICoachingMessage hasSomeData={hasSomeData} />

      {/* Preview Insights - Always Visible */}
      <SectionCard
        title={t('insights.whatYouWillSee')}
        subtitle={t('insights.exampleInsightsSubtitle')}
        actions={null}
      >
        <div className="mb-4 flex items-center gap-2 rounded-[12px] border border-[hsl(var(--warn)/0.15)] bg-[hsl(var(--warn)/0.06)] px-3 py-2">
          <Lightbulb className="h-4 w-4 shrink-0 text-[hsl(var(--warn))]" />
          <p className="text-[12px] text-[hsl(var(--warn))]">
            {t('insights.examplesDisclaimer')}
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {SAMPLE_INSIGHTS.map((insight) => (
            <PreviewInsightCard key={insight.id} insight={insight} isSample={true} />
          ))}
        </div>
      </SectionCard>

      {/* Category Previews */}
      <SectionCard
        title={t('insights.insightCategories')}
        subtitle={t('insights.categoriesPreviewSubtitle')}
        actions={null}
      >
        <CategoryPreviews />
      </SectionCard>

      {/* Time-based expectations */}
      <div className="rounded-[14px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card)/0.5)] px-4 py-4">
        <div className="flex items-start gap-3">
          <Clock className="mt-0.5 h-5 w-5 shrink-0 text-[hsl(var(--fg-3))]" />
          <div>
            <p className="text-[13px] font-medium text-[hsl(var(--fg))]">
              {t('insights.whenWillInsightsAppear')}
            </p>
            <p className="mt-1 text-[13px] leading-5 text-[hsl(var(--fg-2))]">
              {t('insights.insightsTimeline')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Insights() {
  const { t } = useI18n();
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
  const { t, locale } = useI18n();
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
    const merged = { ...(profileRow || {}), ...fromPd };
    delete merged.profile_data;
    return merged;
  }, [profileRow]);

  const measurements = toArray(measurementsQuery.data);
  const workouts = toArray(workoutsQuery.data);
  const meals = toArray(mealsQuery.data);
  const checkins = toArray(checkinsQuery.data);
  const activeDietPlan = toArray(dietPlansQuery.data)[0] || null;
  const activeWorkoutPlan = toArray(workoutPlansQuery.data)[0] || null;

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

  const summaryWindowLabel = formatWindow(mvp?.summary?.summaryWindow, locale);

  return (
    <PageShell
      title={t('insights.pageTitle')}
      subtitle={t('insights.pageSubtitle')}
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

      {/* NEW: Redesigned empty state that delivers value immediately */}
      {!loading && !hasAnyData ? (
        <InsightsEmptyState
          workouts={workouts}
          meals={meals}
          measurements={measurements}
          checkins={checkins}
        />
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

          <div className="rounded-[18px] border border-[hsl(var(--brand)/0.18)] bg-[linear-gradient(180deg,hsl(var(--brand)/0.08)_0%,hsl(var(--card)/0.92)_100%)] px-5 py-4 flex items-center justify-between gap-4">
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
