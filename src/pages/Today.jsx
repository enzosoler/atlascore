import React from 'react';
import {
  Brain,
  CheckCircle2,
  Clock,
  Dumbbell,
  Loader2,
  Scale,
  Shield,
  Sparkles,
  User,
  UtensilsCrossed,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/lib/i18nContext';
import { useRole } from '@/hooks/useRole';
import { base44 } from '@/api/base44Client';
import { supabase } from '@/lib/supabaseClient';
import { ROUTES } from '@/lib/routes';
import { getGreeting } from '@/lib/atlas-theme';
import { SafePageBoundary } from '@/components/shared/StablePage';
import {
  TodayActionCard,
  TodayAdherenceCard,
  TodayCard,
  TodayInsightCard,
  TodayScreen,
  TodaySection,
  TodayStatCard,
} from '@/components/today/TodayMobileUI';

function getPreferredName(displayName) {
  if (!displayName) return null;
  const [firstChunk] = displayName.split(/[ @]/).filter(Boolean);
  return firstChunk || displayName;
}

function getDateLabel(locale) {
  return new Intl.DateTimeFormat(locale === 'en-US' ? 'en-US' : 'pt-BR', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());
}

function getNextSteps(t, ROUTES) {
  return [
    {
      to: ROUTES.nutrition,
      title: t('today_page.nextSteps.nutritionTitle'),
      description: t('today_page.nextSteps.nutritionDesc'),
      icon: UtensilsCrossed,
      phase: t('today_page.nextSteps.nutritionPhase'),
    },
    {
      to: ROUTES.workouts,
      title: t('today_page.nextSteps.workoutTitle'),
      description: t('today_page.nextSteps.workoutDesc'),
      icon: Dumbbell,
      phase: t('today_page.nextSteps.workoutPhase'),
    },
    {
      to: ROUTES.atlasAI,
      title: t('today_page.nextSteps.aiTitle'),
      description: t('today_page.nextSteps.aiDesc'),
      icon: Brain,
      phase: t('today_page.nextSteps.aiPhase'),
    },
    {
      to: ROUTES.profile,
      title: t('today_page.nextSteps.profileTitle'),
      description: t('today_page.nextSteps.profileDesc'),
      icon: User,
      phase: t('today_page.nextSteps.profilePhase'),
    },
  ];
}

// ── Simple rules-based insight generator ──────────────────────────────────────
// Priority order: missing data warnings → positive streaks → protocol info → default
function buildInsight(
  t,
  locale,
  {
    recentSessions,
    todayMeals,
    recentMeasurements,
    activeProtocolsList,
    activeDietPlan,
    activeWorkoutPlan,
    todayStr,
  },
) {
  const last7 = recentSessions.filter((s) => {
    if (!s.date) return false;
    const diff = (new Date(todayStr) - new Date(s.date)) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff < 7;
  });
  const completedLast7 = last7.filter((s) => s.status === 'completed').length;

  // 1. No workouts this week despite having an active plan
  if (activeWorkoutPlan && completedLast7 === 0) {
    return {
      title: t('today_page.insight.noWorkoutsTitle'),
      description: t('today_page.insight.noWorkoutsDesc'),
    };
  }

  // 2. No meals logged today despite having an active diet plan
  if (activeDietPlan && todayMeals.length === 0) {
    return {
      title: t('today_page.insight.noMealsTitle'),
      description: t('today_page.insight.noMealsDesc'),
    };
  }

  // 3. No measurements ever (new user prompt)
  if (recentMeasurements.length === 0) {
    return {
      title: t('today_page.insight.noMeasurementsTitle'),
      description: t('today_page.insight.noMeasurementsDesc'),
    };
  }

  // 4. No measurements in the last 30 days (lapsed tracking)
  const thirtyAgoStr = (() => {
    const d = new Date(todayStr);
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  })();
  const hasRecentMeasure = recentMeasurements.some((m) => m.date && m.date >= thirtyAgoStr);
  if (!hasRecentMeasure) {
    return {
      title: t('today_page.insight.oldMeasurementsTitle'),
      description: t('today_page.insight.oldMeasurementsDesc'),
    };
  }

  // 5. Great workout consistency this week
  if (completedLast7 >= 4) {
    return {
      title:
        locale === 'en-US'
          ? `${completedLast7} workouts completed in the last 7 days.`
          : `${completedLast7} treinos concluídos nos últimos 7 dias.`,
      description: t('today_page.insight.workoutConsistencyDesc'),
    };
  }
  if (completedLast7 >= 2) {
    return {
      title:
        locale === 'en-US'
          ? `${completedLast7} workouts completed this week.`
          : `${completedLast7} treinos concluídos esta semana.`,
      description: t('today_page.insight.workoutGoodDesc'),
    };
  }

  // 6. Active protocol info
  if (activeProtocolsList.length > 0) {
    const p = activeProtocolsList[0];
    const since = p.start_date
      ? new Date(`${p.start_date}T12:00:00`).toLocaleDateString(
          locale === 'en-US' ? 'en-US' : 'pt-BR',
          {
            day: 'numeric',
            month: 'short',
          },
        )
      : null;
    const count = activeProtocolsList.length;
    const protocolWord =
      locale === 'en-US'
        ? `${count} active protocol${count > 1 ? 's' : ''}.`
        : `${count} protocolo${count > 1 ? 's' : ''} ativo${count > 1 ? 's' : ''}.`;
    return {
      title: protocolWord,
      description: since
        ? `${p.name || (locale === 'en-US' ? 'Protocol' : 'Protocolo')} ${t('today_page.insight.protocolDescWith').replace('{date}', since)}`
        : t('today_page.insight.protocolDescDefault'),
    };
  }

  // Default
  return {
    title: t('today_page.insight.defaultTitle'),
    description: t('today_page.insight.defaultDesc'),
  };
}

export default function Today() {
  const { t } = useI18n();
  return (
    <SafePageBoundary
      title={t('today_page.title')}
      subtitle={t('today_page.subtitle')}
      maxWidth="max-w-5xl"
      fallbackDescription="A tela Hoje abriu em modo seguro."
    >
      <TodayContent />
    </SafePageBoundary>
  );
}

function TodayContent() {
  const { user } = useAuth();
  const { t, locale } = useI18n();
  const { role, loading: isRoleLoading } = useRole(user);
  const displayName = user?.full_name || user?.email || t('today_page.fallbackName');
  const preferredName = getPreferredName(displayName) || t('today_page.fallbackName');
  const greeting = getGreeting(locale);
  const isAdmin = !isRoleLoading && role === 'admin';

  const todayStr = new Date().toISOString().split('T')[0];

  // ── Data queries ───────────────────────────────────────────────────────────

  const { data: activeDietPlans = [], isLoading: loadingDiet } = useQuery({
    queryKey: ['today-diet-plan', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase.from('diet_plans').select('*').eq('user_id', user.id).eq('active', true).order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const { data: activeWorkoutPlans = [], isLoading: loadingWorkout } = useQuery({
    queryKey: ['today-workout-plan', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase.from('workout_plans').select('*').eq('user_id', user.id).eq('active', true).order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  // Completed sessions from Supabase — sorted by completed_at
  const { data: recentSessions = [], isLoading: loadingSessions } = useQuery({
    queryKey: ['today-sessions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase.from('workouts').select('*').eq('user_id', user.id).order('completed_at', { ascending: false }).limit(20);
      // Normalise: add a `date` field (YYYY-MM-DD) from completed_at so existing logic works
      return (data || []).map((s) => ({ ...s, date: s.completed_at ? s.completed_at.split('T')[0] : null }));
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000,
  });

  // Today's food logs for nutrition adherence
  const { data: recentMeals = [], isLoading: loadingMeals } = useQuery({
    queryKey: ['today-meals-recent', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase.from('food_logs').select('*').eq('user_id', user.id).gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]).order('date', { ascending: false });
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000,
  });

  // Recent measurements from Supabase
  const { data: recentMeasurements = [], isLoading: loadingMeasurements } = useQuery({
    queryKey: ['today-measurements-recent', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase.from('measurements').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(10);
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000,
  });

  // Active protocols from Supabase
  const { data: allProtocols = [], isLoading: loadingProtocols } = useQuery({
    queryKey: ['today-protocols', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase.from('protocols').select('*').eq('user_id', user.id).order('start_date', { ascending: false });
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const isLoading =
    loadingDiet ||
    loadingWorkout ||
    loadingSessions ||
    loadingMeals ||
    loadingMeasurements ||
    loadingProtocols;

  // ── Derived state ─────────────────────────────────────────────────────────

  const activeDietPlan = activeDietPlans[0] || null;
  const activeWorkoutPlan = activeWorkoutPlans[0] || null;
  const todayMeals = recentMeals.filter((m) => m.date === todayStr);
  const activeProtocolsList = allProtocols.filter((p) => p.active && !p.end_date);
  const latestMeasurement = recentMeasurements[0] || null;
  const todaySession = recentSessions.find((s) => s.date === todayStr);

  // ── Snapshot card values ─────────────────────────────────────────────────

  const nutritionValue = activeDietPlan
    ? `${activeDietPlan.total_calories ?? activeDietPlan.target_calories ?? '—'} kcal`
    : t('today_page.noPlan');
  const nutritionMeta = activeDietPlan
    ? activeDietPlan.name || t('today_page.activePlan')
    : t('today_page.setupNutrition');

  const workoutValue = todaySession
    ? todaySession.status === 'completed'
      ? t('today_page.completed')
      : t('today_page.inProgress')
    : activeWorkoutPlan
      ? t('today_page.pending')
      : t('today_page.noPlan');
  const workoutMeta = activeWorkoutPlan
    ? activeWorkoutPlan.name || t('today_page.activePlan')
    : t('today_page.setupWorkouts');

  const progressValue = latestMeasurement?.weight ? `${latestMeasurement.weight} kg` : '—';
  const progressMeta = latestMeasurement
    ? new Date(`${latestMeasurement.date}T12:00:00`).toLocaleDateString(
        locale === 'en-US' ? 'en-US' : 'pt-BR',
        {
          day: 'numeric',
          month: 'short',
        },
      )
    : t('today_page.addMeasurement');

  const protocolsValue = String(activeProtocolsList.length);
  const protocolsMeta =
    activeProtocolsList.length > 0
      ? `${activeProtocolsList.length} ${activeProtocolsList.length > 1 ? (locale === 'en-US' ? 'active' : 'ativos') : (locale === 'en-US' ? 'active' : 'ativo')}`
      : t('today_page.noActive');

  const NEXT_STEPS = getNextSteps(t, ROUTES);

  const snapshotCards = [
    {
      to: ROUTES.nutrition,
      label: t('today_page.snapshot.nutrition'),
      value: isLoading ? '—' : nutritionValue,
      description: activeDietPlan
        ? t('today_page.snapshot.nutritionActive')
        : t('today_page.snapshot.nutritionNone'),
      meta: isLoading ? '...' : nutritionMeta,
      icon: UtensilsCrossed,
      tone: 'blue',
    },
    {
      to: ROUTES.workouts,
      label: t('today_page.snapshot.workout'),
      value: isLoading ? '—' : workoutValue,
      description: activeWorkoutPlan
        ? t('today_page.snapshot.workoutActive')
        : t('today_page.snapshot.workoutNone'),
      meta: isLoading ? '...' : workoutMeta,
      icon: Dumbbell,
      tone: 'orange',
    },
    {
      to: ROUTES.measurements,
      label: t('today_page.snapshot.progress'),
      value: isLoading ? '—' : progressValue,
      description: latestMeasurement
        ? t('today_page.snapshot.progressLatest')
        : t('today_page.snapshot.progressNone'),
      meta: isLoading ? '...' : progressMeta,
      icon: Scale,
      tone: 'green',
    },
    {
      to: ROUTES.protocols,
      label: t('today_page.snapshot.protocols'),
      value: isLoading ? '—' : protocolsValue,
      description:
        activeProtocolsList.length > 0
          ? t('today_page.snapshot.protocolsActive')
          : t('today_page.snapshot.protocolsNone'),
      meta: isLoading ? '...' : protocolsMeta,
      icon: Shield,
      tone: 'teal',
    },
  ];

  // ── Adherence — driven by real data ────────────────────────────────────────

  const last7 = recentSessions.filter((s) => {
    if (!s.date) return false;
    const diff = (new Date(todayStr) - new Date(s.date)) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff < 7;
  });
  const completedLast7 = last7.filter((s) => s.status === 'completed').length;
  const workoutFreq = activeWorkoutPlan?.frequency || activeWorkoutPlan?.days?.length || 4;
  const workoutAdherence = activeWorkoutPlan
    ? Math.min(100, Math.round((completedLast7 / Math.max(1, workoutFreq)) * 100))
    : 0;

  // Nutrition adherence: based on meals actually logged today (not just plan existence)
  const mealsLoggedToday = todayMeals.length;
  const nutritionAdherence =
    mealsLoggedToday >= 3 ? 100 : mealsLoggedToday === 2 ? 66 : mealsLoggedToday === 1 ? 33 : 0;

  const adherenceSignals = [
    { label: t('today_page.snapshot.nutrition'), value: nutritionAdherence },
    { label: t('today_page.snapshot.workout'), value: workoutAdherence },
  ];
  const adherenceAverage = Math.round(
    adherenceSignals.reduce((t, i) => t + i.value, 0) / adherenceSignals.length,
  );

  // ── Dynamic data-driven insight ────────────────────────────────────────────

  const insight = isLoading
    ? {
        title: t('today_page.insight.loadingTitle'),
        description: t('today_page.insight.loadingDesc'),
      }
    : buildInsight(t, locale, {
        recentSessions,
        todayMeals,
        recentMeasurements,
        activeProtocolsList,
        activeDietPlan,
        activeWorkoutPlan,
        todayStr,
      });

  // ── Recent activity (last 5 workout sessions) ─────────────────────────────

  const recentActivity = recentSessions.slice(0, 5);

  return (
    <TodayScreen>
      {/* ── Header ── */}
      <header className="flex items-start justify-between gap-4 px-1">
        <div className="min-w-0">
          <p className="atlas-overline">{getDateLabel(locale)}</p>
          <h1 className="mt-3 text-[34px] font-bold tracking-[-0.07em] text-[hsl(var(--fg))]">
            {t('today_page.heading')}
          </h1>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[hsl(var(--border)/0.9)] bg-[linear-gradient(180deg,hsl(var(--fill)/0.9)_0%,hsl(var(--card))_100%)] text-[hsl(var(--brand))] shadow-[var(--shadow-xs)]">
          <Sparkles className="h-5 w-5" strokeWidth={2} />
        </div>
      </header>

      {/* ── Greeting card ── */}
      <TodayCard className="relative overflow-hidden border-[hsl(var(--brand)/0.24)] bg-[radial-gradient(circle_at_top_right,hsl(var(--accent-secondary)/0.14),transparent_28%),radial-gradient(circle_at_18%_18%,hsl(var(--brand)/0.18),transparent_34%),linear-gradient(135deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_45%,hsl(var(--fill)/0.96)_100%)] shadow-[var(--shadow-md)]">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[hsl(var(--brand)/0.16)] blur-3xl" />
        <div className="absolute bottom-0 right-0 h-28 w-28 rounded-full bg-[hsl(var(--accent-secondary)/0.16)] blur-2xl" />

        <div className="relative">
          {isAdmin && (
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex rounded-full border border-[hsl(var(--brand)/0.2)] bg-[hsl(var(--brand)/0.12)] px-3 py-1 text-[12px] font-semibold tracking-[0.04em] text-[hsl(var(--brand))]">
                {t('today_page.adminBadge')}
              </span>
            </div>
          )}
          <p className="mt-5 text-[30px] font-bold tracking-[-0.07em] text-[hsl(var(--fg))]">
            {greeting}, {preferredName}
          </p>
          <p className="mt-2 max-w-[30rem] text-[15px] leading-6 text-[hsl(var(--fg-2))]">
            {t('today_page.tagline')}
          </p>
        </div>
      </TodayCard>

      {/* ── Snapshot cards — 4 pillars ── */}
      <TodaySection
        eyebrow={t('today_page.snapshot.eyebrow')}
        title={t('today_page.snapshot.title')}
      >
        {isLoading ? (
          <div className="flex items-center gap-2 py-4 text-[13px] text-[hsl(var(--fg-2))]">
            <Loader2 className="h-4 w-4 animate-spin" /> {t('today_page.loading')}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {snapshotCards.map((item) => (
              <TodayStatCard
                key={item.label}
                to={item.to}
                label={item.label}
                value={item.value}
                description={item.description}
                meta={item.meta}
                icon={item.icon}
                tone={item.tone}
              />
            ))}
          </div>
        )}
      </TodaySection>

      {/* ── Adherence + Insight side by side ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TodaySection
          eyebrow={t('today_page.adherence.eyebrow')}
          title={t('today_page.adherence.title')}
        >
          <TodayAdherenceCard
            score={isLoading ? 0 : adherenceAverage}
            summary={
              isLoading
                ? t('today_page.calculating')
                : adherenceAverage >= 70
                  ? t('today_page.adherence.good')
                  : adherenceAverage > 0
                    ? t('today_page.adherence.improve')
                    : t('today_page.adherence.configure')
            }
            items={isLoading ? [] : adherenceSignals}
          />
        </TodaySection>

        <TodaySection
          eyebrow={t('today_page.insight.eyebrow')}
          title={t('today_page.insight.title')}
        >
          <TodayInsightCard
            to={ROUTES.insights}
            eyebrow={t('today_page.insight.eyebrow')}
            icon={Brain}
            title={insight.title}
            description={insight.description}
            cta={t('today_page.insight.cta')}
          />
        </TodaySection>
      </div>

      {/* ── Recent activity — last 5 workout sessions ── */}
      {!isLoading && recentActivity.length > 0 && (
        <TodaySection
          eyebrow={t('today_page.activity.eyebrow')}
          title={t('today_page.activity.title')}
        >
          <TodayCard>
            <div className="space-y-3">
              {recentActivity.map((session) => {
                const isCompleted = session.status === 'completed';
                const sessionDate = session.date
                  ? new Date(`${session.date}T12:00:00`).toLocaleDateString(
                      locale === 'en-US' ? 'en-US' : 'pt-BR',
                      {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                      },
                    )
                  : '—';

                return (
                  <div
                    key={session.id || `${session.date}-${session.name}`}
                    className="flex items-center gap-3"
                  >
                    <div
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] border',
                        isCompleted
                          ? 'border-[hsl(var(--ok)/0.22)] bg-[hsl(var(--ok)/0.1)] text-[hsl(var(--ok))]'
                          : 'border-[hsl(var(--border)/0.9)] bg-[hsl(var(--fill)/0.7)] text-[hsl(var(--fg-2))]',
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
                      ) : (
                        <Clock className="h-4 w-4" strokeWidth={2} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-medium text-[hsl(var(--fg))]">
                        {session.name ||
                          session.workout_type ||
                          t('today_page.activity.fallbackName')}
                      </p>
                      <p className="text-[12px] text-[hsl(var(--fg-3))]">{sessionDate}</p>
                    </div>

                    <span
                      className={cn(
                        'shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
                        isCompleted
                          ? 'bg-[hsl(var(--ok)/0.12)] text-[hsl(var(--ok))]'
                          : 'bg-[hsl(var(--fill))] text-[hsl(var(--fg-3))]',
                      )}
                    >
                      {isCompleted
                        ? t('today_page.completed')
                        : t('today_page.pending')}
                    </span>
                  </div>
                );
              })}
            </div>
          </TodayCard>
        </TodaySection>
      )}

      {/* ── Next steps — action cards ── */}
      <TodaySection
        eyebrow={t('today_page.nextSteps.eyebrow')}
        title={t('today_page.nextSteps.title')}
        description={t('today_page.nextSteps.description')}
      >
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {NEXT_STEPS.map((item, index) => (
            <TodayActionCard
              key={item.to}
              to={item.to}
              title={item.title}
              description={item.description}
              icon={item.icon}
              priority={item.phase}
              highlighted={index === 0}
            />
          ))}
        </div>
      </TodaySection>
    </TodayScreen>
  );
}
