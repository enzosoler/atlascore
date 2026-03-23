import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  Target,
  Zap,
  ArrowRight,
  Scale,
  Dumbbell,
  BarChart3,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/routes';
import { useAuth } from '@/lib/AuthContext';
import { useSubscription } from '@/lib/SubscriptionContext';
import { supabase } from '@/lib/supabaseClient';
import {
  ErrorState,
  EmptyState,
  FilterChip,
  LoadingState,
  MetricCard,
  PageShell,
  SafePageBoundary,
  SectionCard,
  formatNumber,
  toArray,
} from '@/components/shared/StablePage';
import { listMeasurements } from '@/services/bodyProgressService';

// ─── Constants ──────────────────────────────────────────────────────────────

const BLOCK_SIZES = [
  { key: '4w', weeks: 4, label: '4 weeks', minPlan: 'free' },
  { key: '8w', weeks: 8, label: '8 weeks', minPlan: 'pro' },
  { key: '12w', weeks: 12, label: '12 weeks', minPlan: 'performance' },
];

const PLAN_LEVELS = {
  free: 0,
  pro: 1,
  performance: 2,
  coach: 3,
  nutritionist: 3,
  clinician: 3,
  admin: 999,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toDateStr(date) {
  return date.toISOString().split('T')[0];
}

function formatDateRange(start, end) {
  const opts = { month: 'short', day: 'numeric' };
  const locale = navigator.language || 'en-US';
  return `${start.toLocaleDateString(locale, opts)} – ${end.toLocaleDateString(locale, opts)}`;
}

function avg(arr) {
  if (!arr.length) return 0;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function AdherenceBar({ value }) {
  const pct = Math.min(100, Math.max(0, value || 0));
  const color =
    pct >= 70
      ? 'hsl(var(--ok))'
      : pct >= 40
        ? 'hsl(var(--warn))'
        : 'hsl(0 72% 51%)';
  return (
    <div className="mt-2 h-1.5 w-full rounded-full bg-[hsl(var(--border))]">
      <div
        className="h-1.5 rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

function InsightRow({ tone, text }) {
  const bgMap = {
    ok: 'hsl(var(--ok)/0.08)',
    warn: 'hsl(var(--warn)/0.08)',
    neutral: 'hsl(var(--border)/0.4)',
  };
  const colorMap = {
    ok: 'hsl(var(--ok))',
    warn: 'hsl(var(--warn))',
    neutral: 'hsl(var(--fg-2))',
  };
  return (
    <div
      className="flex gap-3 rounded-xl p-4 text-sm leading-6"
      style={{ background: bgMap[tone] || bgMap.neutral }}
    >
      <Zap
        className="mt-0.5 h-4 w-4 shrink-0"
        style={{ color: colorMap[tone] || colorMap.neutral }}
      />
      <p className="text-[hsl(var(--fg-2))]">{text}</p>
    </div>
  );
}

// ─── Page shell ───────────────────────────────────────────────────────────────

export default function BlockReview() {
  return (
    <SafePageBoundary
      title="Block Review"
      subtitle="Consolidated readout of a defined time block."
      maxWidth="max-w-5xl"
      fallbackDescription="The Block Review page opened in safe mode. The main content failed, but the route remains accessible."
    >
      <BlockReviewContent />
    </SafePageBoundary>
  );
}

// ─── Main content ─────────────────────────────────────────────────────────────

function BlockReviewContent() {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const planCode = subscription?.plan_code || 'free';
  const isAdmin = user?.role === 'admin' || user?.atlas_role === 'admin';
  const planLevel = isAdmin ? 999 : (PLAN_LEVELS[planCode] || 0);

  const [blockKey, setBlockKey] = useState('4w');
  const [blockOffset, setBlockOffset] = useState(0); // 0 = current block, 1 = previous, etc.

  const blockSize = BLOCK_SIZES.find((b) => b.key === blockKey) || BLOCK_SIZES[0];
  const blockDays = blockSize.weeks * 7;

  // Date range for the selected block window
  const { startDate, endDate, startStr, endStr } = useMemo(() => {
    const end = new Date();
    end.setDate(end.getDate() - blockOffset * blockDays);
    const start = new Date(end);
    start.setDate(start.getDate() - blockDays + 1);
    return {
      startDate: start,
      endDate: end,
      startStr: toDateStr(start),
      endStr: toDateStr(end),
    };
  }, [blockDays, blockOffset]);

  // ── Data fetching ────────────────────────────────────────────────────────

  const measurementsQuery = useQuery({
    queryKey: ['block-review-measurements', user?.id],
    queryFn: () => listMeasurements(user.id, 500),
    initialData: [],
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const workoutsQuery = useQuery({
    queryKey: ['block-review-workouts', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workouts')
        .select('id, status, completed_at, volume_load, duration_minutes')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data || []).map((w) => ({
        ...w,
        date: w.completed_at ? w.completed_at.split('T')[0] : null,
      }));
    },
    initialData: [],
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const mealsQuery = useQuery({
    queryKey: ['block-review-meals', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('food_logs')
        .select('id, date, total_calories, total_protein, total_carbs, total_fat')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(1000);
      if (error) throw error;
      return (data || []).map((m) => ({
        ...m,
        date: m.date ? m.date.split('T')[0] : null,
      }));
    },
    initialData: [],
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const protocolsQuery = useQuery({
    queryKey: ['block-review-protocols', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('protocols')
        .select('id, substance_name, category, active, start_date, end_date')
        .eq('user_id', user.id)
        .order('start_date', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    initialData: [],
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000,
  });

  const isLoading =
    measurementsQuery.isLoading ||
    workoutsQuery.isLoading ||
    mealsQuery.isLoading ||
    protocolsQuery.isLoading;

  const hasError =
    measurementsQuery.isError ||
    workoutsQuery.isError ||
    mealsQuery.isError ||
    protocolsQuery.isError;

  // ── Filter data to the current block window ──────────────────────────────

  const blockMeasurements = useMemo(
    () =>
      toArray(measurementsQuery.data)
        .filter((m) => m?.date && m.date >= startStr && m.date <= endStr)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [measurementsQuery.data, startStr, endStr],
  );

  const blockWorkouts = useMemo(
    () =>
      toArray(workoutsQuery.data).filter((w) => w?.date && w.date >= startStr && w.date <= endStr),
    [workoutsQuery.data, startStr, endStr],
  );

  const blockMeals = useMemo(
    () =>
      toArray(mealsQuery.data).filter((m) => m?.date && m.date >= startStr && m.date <= endStr),
    [mealsQuery.data, startStr, endStr],
  );

  const blockProtocols = useMemo(
    () =>
      toArray(protocolsQuery.data).filter((p) => {
        if (!p?.start_date) return false;
        return p.start_date <= endStr && (!p.end_date || p.end_date >= startStr);
      }),
    [protocolsQuery.data, startStr, endStr],
  );

  // ── Derived metrics ──────────────────────────────────────────────────────

  const weightDelta = useMemo(() => {
    if (blockMeasurements.length < 2) return null;
    const first = Number(blockMeasurements[0]?.weight);
    const last = Number(blockMeasurements[blockMeasurements.length - 1]?.weight);
    if (!first || !last) return null;
    return last - first;
  }, [blockMeasurements]);

  const bodyFatDelta = useMemo(() => {
    const withBF = blockMeasurements.filter((m) => m?.body_fat != null && m.body_fat !== '');
    if (withBF.length < 2) return null;
    return Number(withBF[withBF.length - 1].body_fat) - Number(withBF[0].body_fat);
  }, [blockMeasurements]);

  const completedWorkouts = useMemo(
    () => blockWorkouts.filter((w) => w?.status === 'completed'),
    [blockWorkouts],
  );
  const workoutsPerWeek = completedWorkouts.length / blockSize.weeks;

  // % of block days with at least one meal logged
  const nutritionAdherence = useMemo(() => {
    const daysWithMeals = new Set(blockMeals.map((m) => m.date)).size;
    return (daysWithMeals / blockDays) * 100;
  }, [blockMeals, blockDays]);

  const avgDailyCalories = useMemo(() => {
    const byDay = blockMeals.reduce((acc, m) => {
      acc[m.date] = (acc[m.date] || 0) + Number(m.total_calories || 0);
      return acc;
    }, {});
    const vals = Object.values(byDay);
    return vals.length ? avg(vals) : 0;
  }, [blockMeals]);

  const avgDailyProtein = useMemo(() => {
    const byDay = blockMeals.reduce((acc, m) => {
      acc[m.date] = (acc[m.date] || 0) + Number(m.total_protein || 0);
      return acc;
    }, {});
    const vals = Object.values(byDay);
    return vals.length ? avg(vals) : 0;
  }, [blockMeals]);

  // Workout adherence score: normalised to 3 sessions/week target, capped at 100%
  const workoutAdherenceScore = Math.min(100, (workoutsPerWeek / 3) * 100);
  // Overall: average of nutrition log adherence + workout frequency score
  const overallAdherence = (nutritionAdherence + workoutAdherenceScore) / 2;

  // ── Opinionated insights (rule-based) ───────────────────────────────────

  const insights = useMemo(() => {
    const list = [];

    // Weight trend
    if (weightDelta !== null) {
      if (Math.abs(weightDelta) < 0.3) {
        list.push({
          tone: 'neutral',
          text: 'Weight stayed stable in this block. If the goal is fat loss, it may be time to review the calorie deficit or improve logging precision.',
        });
      } else if (weightDelta < 0) {
        list.push({
          tone: 'ok',
          text: `Loss of ${Math.abs(weightDelta).toFixed(1)} kg in this block — a positive trend for anyone aiming to reduce body weight.`,
        });
      } else {
        list.push({
          tone: 'neutral',
          text: `Gain of ${weightDelta.toFixed(1)} kg in this block. Check whether that aligns with the goal (planned muscle gain or off-plan weight gain).`,
        });
      }
    }

    // Nutrition adherence
    if (blockMeals.length > 0) {
      if (nutritionAdherence < 50) {
        list.push({
          tone: 'warn',
          text: `Meals were logged on only ${nutritionAdherence.toFixed(0)}% of days. Without consistent logging, it is hard to identify what is limiting progress.`,
        });
      } else if (nutritionAdherence < 70) {
        list.push({
          tone: 'warn',
          text: `Food logging adherence is below 70% (${nutritionAdherence.toFixed(0)}%). More consistent logging improves the quality of the analysis.`,
        });
      } else {
        list.push({
          tone: 'ok',
          text: `Strong food logging consistency — ${nutritionAdherence.toFixed(0)}% of days in this block were logged.`,
        });
      }
    }

    // Workout frequency
    if (blockWorkouts.length > 0 || completedWorkouts.length > 0) {
      if (workoutsPerWeek < 1.5) {
        list.push({
          tone: 'warn',
          text: `Low training frequency: ${workoutsPerWeek.toFixed(1)} sessions/week. For most goals, 3+ sessions per week creates more consistent adaptation.`,
        });
      } else if (workoutsPerWeek >= 3) {
        list.push({
          tone: 'ok',
          text: `Consistent training frequency: ${workoutsPerWeek.toFixed(1)} sessions/week — solid volume for progressive adaptation.`,
        });
      }
    }

    // Protocol note
    if (blockProtocols.length > 0 && weightDelta !== null) {
      list.push({
        tone: 'neutral',
        text: `${blockProtocols.length} active protocol${blockProtocols.length !== 1 ? 's' : ''} during this block. Consider correlating them with weight and composition trends.`,
      });
    }

    return list.slice(0, 3);
  }, [
    weightDelta,
    nutritionAdherence,
    workoutsPerWeek,
    blockMeals.length,
    blockWorkouts.length,
    completedWorkouts.length,
    blockProtocols.length,
  ]);

  // ── "Do this next" — surface the highest-impact action ──────────────────

  const doThisNext = useMemo(() => {
    if (nutritionAdherence < 60 && blockMeals.length > 0) {
      return {
        action: 'Increase food logging consistency',
        reason:
          'Without enough nutrition data, it is impossible to diagnose what is limiting progress. Focus on logging at least 5 of 7 days.',
        route: ROUTES.nutrition,
        label: 'Go to Nutrition',
      };
    }
    if (workoutsPerWeek < 2 && (blockWorkouts.length > 0 || blockMeals.length > 0)) {
      return {
        action: 'Increase workout frequency',
        reason:
          'Training volume in this block stayed below the ideal level for adaptation. Add 1–2 sessions per week in the next block.',
        route: ROUTES.workouts,
        label: 'Go to Workouts',
      };
    }
    if (blockMeasurements.length < 2) {
      return {
        action: 'Log measurements more often',
        reason:
          'Without body composition checkpoints, real changes across the block are impossible to track.',
        route: ROUTES.measurements,
        label: 'Log measurement',
      };
    }
    if (weightDelta !== null && Math.abs(weightDelta) < 0.3 && nutritionAdherence > 70) {
      return {
        action: 'Review calorie target',
        reason:
          'Weight is stable with strong nutrition adherence. If the goal is body composition change, it may be time to adjust the deficit or surplus.',
        route: ROUTES.myDiet,
        label: 'Open nutrition plan',
      };
    }
    return {
      action: 'Maintain consistency in the next block',
      reason:
        'The data in this block is in good shape. Keep the same rhythm to build a stronger comparative history.',
      route: ROUTES.today,
      label: 'Go to Today',
    };
  }, [
    nutritionAdherence,
    workoutsPerWeek,
    blockMeasurements.length,
    weightDelta,
    blockMeals.length,
    blockWorkouts.length,
  ]);

  const hasAnyData =
    blockMeasurements.length > 0 || blockWorkouts.length > 0 || blockMeals.length > 0;

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <PageShell
      title="Block Review"
      subtitle="Consolidated review of a time block — what worked, what did not, and what to do next."
      actions={
        <>
          {BLOCK_SIZES.map((bs) => {
            const locked = PLAN_LEVELS[bs.minPlan] > planLevel;
            return (
              <FilterChip
                key={bs.key}
                onClick={() => {
                  if (locked) return;
                  setBlockKey(bs.key);
                  setBlockOffset(0);
                }}
                active={blockKey === bs.key}
                className={locked ? 'opacity-40 cursor-not-allowed' : ''}
                title={locked ? `Available on the ${bs.minPlan} plan` : undefined}
              >
                {bs.label}
                {locked ? ' 🔒' : ''}
              </FilterChip>
            );
          })}
        </>
      }
      maxWidth="max-w-5xl"
    >
      {/* Block navigator */}
      <div className="flex items-center justify-between rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--shell))] px-5 py-3">
        <button
          onClick={() => setBlockOffset((o) => o + 1)}
          className="flex items-center gap-1.5 text-sm font-medium text-[hsl(var(--fg-2))] hover:text-[hsl(var(--fg))] transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous block
        </button>

        <span className="text-[13px] font-semibold text-[hsl(var(--fg))]">
          {formatDateRange(startDate, endDate)}
        </span>

        <button
          onClick={() => setBlockOffset((o) => Math.max(0, o - 1))}
          disabled={blockOffset === 0}
          className="flex items-center gap-1.5 text-sm font-medium text-[hsl(var(--fg-2))] hover:text-[hsl(var(--fg))] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Next block
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Free plan notice - hide for admins */}
      {planCode === 'free' && !isAdmin && (
        <div className="atlas-banner px-4 py-3 text-sm leading-6">
          <p className="font-semibold text-[hsl(var(--fg))]">Free plan block limit</p>
          <p className="mt-1">
            Free accounts can review only 4-week blocks.{' '}
            <Link to={ROUTES.pricing} className="font-semibold text-[hsl(var(--brand))] hover:opacity-80">
              Upgrade to Pro
            </Link>{' '}
            to unlock 8-week and 12-week reviews.
          </p>
        </div>
      )}

      {isLoading && (
        <LoadingState
          title="Loading block"
          description="Aggregating data for the selected period."
        />
      )}

      {!isLoading && hasError && (
        <ErrorState
          title="Could not load block"
          description="Some data may be incomplete. Try refreshing the page."
        />
      )}

      {!isLoading && !hasAnyData && (
        <SectionCard title="Insufficient data for this block" subtitle="Block review needs repeated checkpoints and routine logs to say something credible.">
          <EmptyState
            icon={BarChart3}
            title="No data in this block"
            description="Log measurements, meals, or workouts inside the selected period to generate a useful block review."
            action={
              <Button asChild size="default">
                <Link to={ROUTES.today}>Go to Today</Link>
              </Button>
            }
          />
        </SectionCard>
      )}

      {!isLoading && hasAnyData && (
        <>
          {/* ── Top-line metrics ── */}
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Weight change"
              value={
                weightDelta !== null
                  ? `${weightDelta >= 0 ? '+' : ''}${weightDelta.toFixed(1)} kg`
                  : '--'
              }
              hint={
                blockMeasurements.length < 2
                  ? 'Requires 2+ measurements in the block'
                  : `${blockMeasurements.length} checkpoints recorded`
              }
              icon={Scale}
            />
            <MetricCard
              label="Body fat change"
              value={
                bodyFatDelta !== null
                  ? `${bodyFatDelta >= 0 ? '+' : ''}${bodyFatDelta.toFixed(1)}%`
                  : '--'
              }
              hint={
                bodyFatDelta !== null
                  ? 'Based on measurements with body fat %'
                  : 'No body fat % data in this block'
              }
              icon={TrendingDown}
            />
            <MetricCard
              label="Completed workouts"
              value={formatNumber(completedWorkouts.length)}
              hint={`${workoutsPerWeek.toFixed(1)} sessions/week`}
              icon={Dumbbell}
            />
            <MetricCard
              label="Overall consistency"
              value={`${overallAdherence.toFixed(0)}%`}
              hint="Average of nutrition adherence and workout frequency"
              icon={Target}
            />
          </section>

          {/* ── Adherence breakdown ── */}
          <SectionCard
            title="Adherence by area"
            subtitle="How engagement looked across each pillar in the block."
          >
            <div className="grid gap-4 md:grid-cols-3">
              {/* Nutrition */}
              <div className="atlas-card-muted p-4 space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">
                  Nutrition
                </p>
                <p className="text-2xl font-bold text-[hsl(var(--fg))]">
                  {nutritionAdherence.toFixed(0)}%
                </p>
                <p className="text-[12px] text-[hsl(var(--fg-2))]">
                  {new Set(blockMeals.map((m) => m.date)).size} of {blockDays} days logged
                </p>
                <AdherenceBar value={nutritionAdherence} />
                {avgDailyCalories > 0 && (
                  <p className="text-[12px] text-[hsl(var(--fg-2))] pt-1 leading-5">
                    Average: {formatNumber(avgDailyCalories)} kcal/day
                    {avgDailyProtein > 0 && ` · ${avgDailyProtein.toFixed(0)}g protein`}
                  </p>
                )}
              </div>

              {/* Workouts */}
              <div className="atlas-card-muted p-4 space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">
                  Workouts
                </p>
                <p className="text-2xl font-bold text-[hsl(var(--fg))]">
                  {completedWorkouts.length}
                </p>
                <p className="text-[12px] text-[hsl(var(--fg-2))]">
                  {workoutsPerWeek.toFixed(1)} sessions/week
                </p>
                <AdherenceBar value={workoutAdherenceScore} />
                <p className="text-[12px] text-[hsl(var(--fg-2))] pt-1 leading-5">
                  Score relative to a 3× /week target
                </p>
              </div>

              {/* Protocols */}
              <div className="atlas-card-muted p-4 space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">
                  Protocols
                </p>
                <p className="text-2xl font-bold text-[hsl(var(--fg))]">
                  {blockProtocols.length}
                </p>
                <p className="text-[12px] text-[hsl(var(--fg-2))]">
                  {blockProtocols.length === 0
                    ? 'No active protocols in this block'
                    : `${blockProtocols.length} active protocol${blockProtocols.length !== 1 ? 's' : ''}`}
                </p>
                {blockProtocols.length > 0 && (
                  <p className="text-[12px] text-[hsl(var(--fg-2))] pt-2 leading-5">
                    {blockProtocols
                      .slice(0, 3)
                      .map((p) => p.substance_name || 'Protocol')
                      .join(', ')}
                    {blockProtocols.length > 3 && ` and ${blockProtocols.length - 3} more`}
                  </p>
                )}
              </div>
            </div>
          </SectionCard>

          {/* ── Opinionated insights ── */}
          {insights.length > 0 && (
            <SectionCard
              title="Block insights"
              subtitle="Objective analysis based on the data logged in this period."
            >
              <div className="space-y-3">
                {insights.map((insight, i) => (
                  <InsightRow key={i} tone={insight.tone} text={insight.text} />
                ))}
              </div>
            </SectionCard>
          )}

          {/* ── Do this next ── */}
          <div className="rounded-[20px] border border-[hsl(var(--brand)/0.25)] bg-[linear-gradient(180deg,hsl(var(--brand)/0.08)_0%,hsl(var(--card)/0.92)_100%)] p-5 space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--brand)/0.12)]">
                <ArrowRight className="h-4 w-4 text-[hsl(var(--brand))]" />
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--brand))]">
                  Next step
                </p>
                <p className="text-[16px] font-semibold text-[hsl(var(--fg))] leading-snug">
                  {doThisNext.action}
                </p>
                <p className="text-[13px] text-[hsl(var(--fg-2))] leading-5">
                  {doThisNext.reason}
                </p>
              </div>
            </div>
            <div className="pl-10">
              <Button asChild size="sm" variant="outline">
                <Link to={doThisNext.route}>
                  {doThisNext.label} <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </>
      )}
    </PageShell>
  );
}
