import React, { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  Flame,
  UtensilsCrossed,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { useSubscription } from '@/lib/SubscriptionContext';
import { supabase } from '@/lib/supabaseClient';
import { ROUTES } from '@/lib/routes';
import { SafePageBoundary } from '@/components/shared/StablePage';
import { TodayScreen } from '@/components/today/TodayMobileUI';
import { WeeklyCheckinModal } from '@/components/today/WeeklyCheckinModal';
import BodyCheckinSheet from '@/components/body/BodyCheckinSheet';
import { AICoachBriefing } from '@/components/today/AICoachBriefing';
import { ReadinessRow } from '@/components/today/ReadinessRow';
import { QuickActions } from '@/components/today/QuickActions';
import { TodayPlanSection } from '@/components/today/TodayPlanSection';
import { AlertsSection } from '@/components/today/AlertsSection';
import { ProgressSnapshot } from '@/components/today/ProgressSnapshot';
import { AIRecommendations } from '@/components/today/AIRecommendations';
import { toast } from 'sonner';
import { trackEvent } from '@/lib/sentry';
import AIGenerateWizard from '@/components/ai/AIGenerateWizard';
import QuickWorkoutModal from '@/components/workouts/QuickWorkoutModal';
import { useT, useI18n } from '@/lib/i18nContext';
import { useDailyState, DAILY_QUERY_KEYS } from '@/hooks/useDailyState';
import { useAICoach } from '@/hooks/useAICoach';

// ── Helpers ────────────────────────────────────────────────────────────────────

function getPreferredName(displayName, fallbackName = 'Athlete') {
  if (!displayName) return fallbackName;
  const [firstChunk] = String(displayName)
    .split(/[\s@._-]+/)
    .map((c) => c.trim())
    .filter(Boolean);
  if (!firstChunk) return fallbackName;
  const sanitized = firstChunk.replace(/\d+$/u, '') || firstChunk;
  return `${sanitized.charAt(0).toLocaleUpperCase()}${sanitized.slice(1)}`;
}

function getDateLabel(locale) {
  const intlLocale = locale === 'pt-BR' ? 'pt-BR' : 'en-US';
  return new Intl.DateTimeFormat(intlLocale, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());
}

// ── Intelligence layer (rules-based; replaced by ai-decision-engine later) ────

function buildBriefing({ todaySession, todayMeals, activeWorkoutPlan, profile, preferredName, totalKcal }) {
  const workoutDone = todaySession?.status === 'completed';
  const nutritionLogged = todayMeals.length > 0;
  const kcalTarget = profile?.targets?.calories || 2000;
  const kcalRemaining = Math.max(0, kcalTarget - totalKcal);
  const planName = activeWorkoutPlan?.name;

  if (workoutDone && nutritionLogged && kcalRemaining < 300) {
    return {
      text: `${preferredName}, you're locked in today. Workout done, nutrition on track. Focus on recovery.`,
      focus: 'Recovery',
      primaryAction: null,
      secondaryAction: null,
    };
  }
  if (workoutDone && kcalRemaining >= 300) {
    return {
      text: `Good work, ${preferredName}. Session complete. Close the gap — ${Math.round(kcalRemaining)} kcal remaining to hit your target.`,
      focus: 'Nutrition',
      primaryAction: { label: 'Log a meal', path: ROUTES.nutrition },
      secondaryAction: null,
    };
  }
  if (!workoutDone && activeWorkoutPlan) {
    const prefix = nutritionLogged ? 'Nutrition logged. ' : '';
    return {
      text: `${prefix}${planName ? `${planName} is` : 'Your workout is'} on the schedule, ${preferredName}. Get it done — everything else follows.`,
      focus: 'Training',
      primaryAction: { label: 'Start workout', path: ROUTES.workouts },
      secondaryAction: nutritionLogged ? null : { label: 'Log meal', path: ROUTES.nutrition },
    };
  }
  if (!workoutDone && !activeWorkoutPlan) {
    return {
      text: `No active training plan, ${preferredName}. Build one now to start tracking your progress and see real gains.`,
      focus: 'Build',
      primaryAction: { label: 'Create plan', path: ROUTES.workouts },
      secondaryAction: null,
    };
  }
  return {
    text: `Good day to move, ${preferredName}. Log your workouts and meals to build your momentum.`,
    focus: 'Today',
    primaryAction: { label: 'Start workout', path: ROUTES.workouts },
    secondaryAction: null,
  };
}

function buildAlerts({ todaySession, todayMeals, recentMeasurements, lastWorkout }) {
  const alerts = [];

  // Training gap — 3+ days without a session
  if (!todaySession && lastWorkout) {
    const daysSince = Math.floor(
      (Date.now() - new Date(lastWorkout.completed_at || lastWorkout.date).getTime()) / 86_400_000
    );
    if (daysSince >= 3) {
      alerts.push({
        icon: Flame,
        title: `${daysSince} days since your last workout.`,
        description: 'Breaking momentum is the hardest part. Get back on track.',
        path: ROUTES.workouts,
        cta: 'Start now',
      });
    }
  }

  // No meals logged after noon
  if (todayMeals.length === 0 && new Date().getHours() >= 12) {
    alerts.push({
      icon: UtensilsCrossed,
      title: "You haven't logged any meals today.",
      description: 'Nutrition tracking is critical for your results.',
      path: ROUTES.nutrition,
      cta: 'Log now',
    });
  }

  return alerts.slice(0, 2);
}

function buildRecommendations({ todaySession, todayMeals, activeWorkoutPlan, recentMeasurements, profile, progressPhotos }) {
  const recs = [];
  const workoutDone = todaySession?.status === 'completed';
  const kcalTarget = profile?.targets?.calories || 2000;
  const totalKcal = todayMeals.reduce((s, m) => s + (m.calories || m.total_calories || 0), 0);
  const totalProtein = todayMeals.reduce((s, m) => s + (m.protein_g || m.total_protein || 0), 0);
  const proteinTarget = profile?.targets?.protein || 150;

  if (workoutDone && totalProtein < proteinTarget * 0.7) {
    recs.push({
      id: 'rec-protein',
      type: 'nutrition',
      title: 'Protein window closing.',
      reason: `You've hit ${Math.round(totalProtein)}g of ${proteinTarget}g. Post-workout recovery depends on closing this gap.`,
      actionLabel: 'Log protein meal',
      actionPath: ROUTES.nutrition,
    });
  }

  if (!activeWorkoutPlan && !workoutDone) {
    recs.push({
      id: 'rec-plan',
      type: 'workout',
      title: 'No training plan active.',
      reason: 'Athletes with a plan are significantly more consistent. Build yours in under 2 minutes.',
      actionLabel: 'Build plan',
      actionPath: ROUTES.workouts,
    });
  }

  if (progressPhotos.length === 0) {
    recs.push({
      id: 'rec-photo',
      type: 'habit',
      title: 'No progress photos yet.',
      reason: 'Visual tracking dramatically improves long-term motivation.',
      actionLabel: 'Take first photo',
      actionPath: ROUTES.progressPhotos,
    });
  }

  const hasRecentWeight = recentMeasurements.length > 0 &&
    Date.now() - new Date(recentMeasurements[0].date).getTime() < 7 * 86_400_000;
  if (!hasRecentWeight && recentMeasurements.length > 0) {
    recs.push({
      id: 'rec-weight',
      type: 'habit',
      title: 'Weight not logged this week.',
      reason: 'Weekly weigh-ins catch trends before they become problems.',
      actionLabel: 'Log weight',
      actionPath: ROUTES.measurements,
    });
  }

  return recs.slice(0, 3);
}

// ── Main content ───────────────────────────────────────────────────────────────

function TodayContent() {
  const { user } = useAuth();
  const { can } = useSubscription();
  const navigate = useNavigate();
  const t = useT();
  const { locale } = useI18n();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [aiWizardOpen, setAiWizardOpen] = useState(false);
  const [quickWorkoutOpen, setQuickWorkoutOpen] = useState(false);

  const hasAIAccess = can('atlas_ai');

  // ── Shared daily state (single source of truth) ──────────────────────────
  const daily = useDailyState();

  // ── AI coaching engine ──────────────────────────────────────────────────
  const ai = useAICoach({ userId: user?.id });

  // ── Stripe checkout completion ────────────────────────────────────────────
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (searchParams.get('subscribed') !== '1' || !sessionId) return;
    setSearchParams({}, { replace: true });
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) return;
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/complete-checkout`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ session_id: sessionId }),
          }
        );
        const data = await res.json();
        if (data?.success) {
          toast.success('Subscription activated! Welcome to atlas.core Pro.');
          trackEvent('payment_success', { user_id: user?.id, plan: data.plan });
          queryClient.invalidateQueries({ queryKey: ['subscription-supabase'] });
        } else {
          toast.error('Payment recorded but activation failed. Contact support if access is missing.');
        }
      } catch {
        toast.success('Payment received! Refreshing your access…');
        queryClient.invalidateQueries({ queryKey: ['subscription-supabase'] });
      }
    })();
  }, []);

  const preferredName = getPreferredName(user?.full_name || user?.email, 'Athlete');

  // ── Daily data from shared hook ──────────────────────────────────────────
  const { todayMeals, todaySession, workoutDone, nutritionLogged, weightLogged, totalKcal } = daily;

  // ── Supplementary queries (not in shared daily state) ────────────────────
  // All queries use try/catch — a single failed query must NOT crash the page
  const { data: activeWorkoutPlan, isLoading: planLoading } = useQuery({
    queryKey: ['active-workout-plan', user?.id],
    queryFn: async () => {
      try {
        const { data } = await supabase.from('workout_plans').select('*').eq('user_id', user.id).eq('active', true).maybeSingle();
        return data ?? null;
      } catch { return null; }
    },
    enabled: !!user?.id,
  });

  const { data: recentMeasurements = [], isLoading: measurementsLoading } = useQuery({
    queryKey: ['recent-measurements', user?.id],
    queryFn: async () => {
      try {
        const { data } = await supabase.from('measurements').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(5);
        return data || [];
      } catch { return []; }
    },
    enabled: !!user?.id,
  });

  const { data: progressPhotos = [] } = useQuery({
    queryKey: ['progress-photos', user?.id],
    queryFn: async () => {
      try {
        const { data } = await supabase.from('progress_photos').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5);
        return data || [];
      } catch { return []; }
    },
    enabled: !!user?.id,
  });

  const { data: lastWorkout } = useQuery({
    queryKey: ['last-workout', user?.id],
    queryFn: async () => {
      try {
        const { data } = await supabase.from('workout_logs').select('*').eq('user_id', user.id).eq('status', 'completed').order('completed_at', { ascending: false }).limit(1).maybeSingle();
        return data ?? null;
      } catch { return null; }
    },
    enabled: !!user?.id,
  });

  const { data: weekWorkouts = [] } = useQuery({
    queryKey: ['week-workouts', user?.id],
    queryFn: async () => {
      try {
        const monday = new Date();
        monday.setDate(monday.getDate() - monday.getDay() + 1);
        const { data } = await supabase.from('workout_logs').select('*').eq('user_id', user.id).eq('status', 'completed').gte('date', monday.toISOString().split('T')[0]);
        return data || [];
      } catch { return []; }
    },
    enabled: !!user?.id,
  });

  const { data: profile } = useQuery({
    queryKey: ['user-profile-today', user?.id],
    queryFn: async () => {
      try {
        const { data } = await supabase.from('profiles').select('profile_data').eq('id', user.id).single();
        return data?.profile_data || {};
      } catch { return {}; }
    },
    enabled: !!user?.id,
  });

  // ── Derived values ────────────────────────────────────────────────────────
  const isLoading = daily.isLoading || planLoading || measurementsLoading;

  // Rules-based fallbacks (used when AI engine hasn't returned yet)
  const rulesBriefing = useMemo(
    () => buildBriefing({ todaySession, todayMeals, activeWorkoutPlan, profile, preferredName, totalKcal }),
    [todaySession, todayMeals, activeWorkoutPlan, profile, preferredName, totalKcal]
  );
  const rulesAlerts = useMemo(
    () => buildAlerts({ todaySession, todayMeals, recentMeasurements, lastWorkout }),
    [todaySession, todayMeals, recentMeasurements, lastWorkout]
  );
  const rulesRecommendations = useMemo(
    () => buildRecommendations({
      todaySession, todayMeals, activeWorkoutPlan, recentMeasurements, profile, progressPhotos,
    }),
    [todaySession, todayMeals, activeWorkoutPlan, recentMeasurements, profile, progressPhotos]
  );

  // AI output when available, rules-based fallback when not
  const briefing = ai.briefing
    ? { text: ai.briefing.body, focus: ai.briefing.focus, primaryAction: null, secondaryAction: null }
    : rulesBriefing;
  const priorities = ai.priorities ?? [];
  const alerts = rulesAlerts; // alerts are always rules-based (time-sensitive, need fresh data)
  const recommendations = ai.recommendations.length > 0 ? ai.recommendations : rulesRecommendations;

  // ── AI plan generation ────────────────────────────────────────────────────
  const handleAIGenerate = async (answers) => {
    try {
      const { data, error } = await supabase.functions.invoke('invoke-llm', {
        body: {
          prompt: `Generate a workout plan for a user with the following profile:\n${JSON.stringify(profile, null, 2)}\n\nAdditional preferences:\n${JSON.stringify(answers, null, 2)}\n\nGenerate a complete workout plan with exercises, sets, reps, and rest periods.`,
          max_tokens: 2048,
          response_json_schema: {
            type: 'object',
            properties: {
              plan_name: { type: 'string' },
              description: { type: 'string' },
              exercises: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    sets: { type: 'number' },
                    reps: { type: 'string' },
                    rest_seconds: { type: 'number' },
                    muscle_group: { type: 'string' },
                  },
                },
              },
              duration_minutes: { type: 'number' },
              frequency_per_week: { type: 'number' },
            },
          },
        },
      });
      if (error) throw error;
      if (data?.data) {
        const plan = data.data;
        const { error: saveError } = await supabase.from('workout_plans').insert({
          user_id: user.id,
          name: plan.plan_name || 'AI Generated Plan',
          description: plan.description || 'Generated by Atlas AI',
          exercises: plan.exercises || [],
          duration_minutes: plan.duration_minutes || 45,
          frequency_per_week: plan.frequency_per_week || 3,
          active: true,
          source: 'ai_generated',
        });
        if (saveError) throw saveError;
        toast.success('AI workout plan created!');
        queryClient.invalidateQueries({ queryKey: ['active-workout-plan', user?.id] });
      }
    } catch {
      toast.error('Failed to generate plan. Please try again.');
    }
  };

  // ── BINARY ISOLATION: stripped render — add sections back one by one ───────
  // If this bare version crashes, the bug is in the hooks above.
  // If it renders, add back components one at a time to find the culprit.
  return (
    <TodayScreen>
      <header className="pt-1">
        <p className="text-[13px] font-medium text-[hsl(var(--fg-3))]">
          {getDateLabel(locale)}
        </p>
        <h1 className="text-[26px] font-bold tracking-[-0.03em] text-[hsl(var(--fg))] leading-tight mt-0.5">
          {preferredName}
        </h1>
      </header>

      <div className="rounded-[16px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card)/0.9)] p-4 mt-4">
        <p className="text-[14px] font-semibold text-[hsl(var(--fg))]">Today is loading</p>
        <p className="text-[12px] text-[hsl(var(--fg-3))] mt-1">
          Workout: {workoutDone ? 'done' : 'not done'} |
          Meals: {(todayMeals ?? []).length} |
          AI: {ai.hasData ? 'loaded' : ai.loading ? 'loading' : 'none'}
        </p>
      </div>

      {/* STEP 1: AICoachBriefing */}
      <AICoachBriefing
        briefing={briefing?.text ?? ''}
        focus={briefing?.focus ?? 'Today'}
        primaryAction={briefing?.primaryAction ?? null}
        secondaryAction={briefing?.secondaryAction ?? null}
        loading={isLoading}
      />

      {/* STEP 2: QuickActions */}
      <QuickActions
        workoutDone={!!workoutDone}
        nutritionLogged={!!nutritionLogged}
        weightLogged={!!weightLogged}
        onCheckin={() => setCheckinOpen(true)}
        onQuickWorkout={() => setQuickWorkoutOpen(true)}
      />

      {/* STEP 3: TodayPlanSection */}
      <TodayPlanSection
        activeWorkoutPlan={activeWorkoutPlan ?? null}
        todaySession={todaySession ?? null}
        todayMeals={todayMeals ?? []}
        kcalTarget={profile?.targets?.calories ?? 0}
        macros={profile?.targets ?? {}}
        hasAIAccess={!!hasAIAccess}
        onGenerateWorkout={() => setAiWizardOpen(true)}
      />

      {/* STEP 4: AlertsSection */}
      {Array.isArray(alerts) && alerts.length > 0 && <AlertsSection alerts={alerts} />}

      {/* STEP 5: ProgressSnapshot */}
      <ProgressSnapshot
        recentMeasurements={recentMeasurements ?? []}
        todaySession={todaySession ?? null}
        lastWorkout={lastWorkout ?? null}
        weekWorkoutCount={(weekWorkouts ?? []).length}
      />

      {/* STEP 6: AIRecommendations */}
      {Array.isArray(recommendations) && recommendations.length > 0 && (
        <AIRecommendations
          recommendations={recommendations}
          onFollow={ai.followRec}
          onDismiss={ai.dismissRec}
        />
      )}

      {/* Modals — only rendered when open */}
      {checkinOpen && <BodyCheckinSheet open={checkinOpen} onOpenChange={setCheckinOpen} />}
      {quickWorkoutOpen && (
        <QuickWorkoutModal
          open={quickWorkoutOpen}
          onClose={() => setQuickWorkoutOpen(false)}
          onStart={() => { navigate(ROUTES.workouts); setQuickWorkoutOpen(false); }}
        />
      )}
      {aiWizardOpen && (
        <AIGenerateWizard
          open={aiWizardOpen}
          onClose={() => setAiWizardOpen(false)}
          type="workout"
          profile={profile ?? {}}
          onGenerate={handleAIGenerate}
        />
      )}

    </TodayScreen>
  );
}

export default function Today() {
  return (
    <SafePageBoundary
      title="Today"
      subtitle="Your daily execution system"
      maxWidth="max-w-3xl"
      fallbackDescription="The Today screen opened in safe mode."
    >
      <TodayContent />
    </SafePageBoundary>
  );
}
