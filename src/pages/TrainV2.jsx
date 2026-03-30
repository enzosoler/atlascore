/**
 * TrainV2 — clean rebuild of the Train page.
 *
 * Rules:
 *  - QuickWorkoutCard is ALWAYS visible (never inside a conditional)
 *  - No query may crash the route
 *  - Shares DailyStateV2 with TodayV2
 *  - Execution mode is a full takeover (same pattern as WorkoutsV2)
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Play, CheckCircle2, Dumbbell, Clock, Zap, Plus,
  ArrowRight, Sparkles, Calendar, TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/lib/i18nContext';
import { useSubscription } from '@/lib/SubscriptionContext';
import { supabase } from '@/lib/supabaseClient';
import { useDailyStateV2, DAILY_KEYS } from '@/hooks/useDailyStateV2';
import { useAICoach } from '@/hooks/useAICoach';
import WorkoutExecutionScreen from '@/components/workouts/WorkoutExecutionScreen';
import WorkoutGuardSheet from '@/components/workouts/WorkoutGuardSheet';
import QuickWorkoutModal from '@/components/workouts/QuickWorkoutModal';
import PlanBuilderWizard from '@/components/workouts/PlanBuilderWizard';
import { AppContainer } from '@/components/shared/AppContainer';
import {
  fetchRecentWorkoutHistory,
  computePersonalRecords,
} from '@/services/workoutHistoryService';
import {
  getActiveWorkoutPlans,
  createWorkoutPlan,
} from '@/services/workoutPlanService';
import { saveCompletedWorkout } from '@/services/workoutService';
import { loadSession, clearSession, hasSession } from '@/lib/workoutSession';

// ─── Build session from plan day ───────────────────────────────────────────────

function buildSessionFromPlan(plan, dayIndex, t) {
  if (!plan) return { name: t('train.freeWorkout'), exercises: [] };
  const days = Array.isArray(plan.days) ? plan.days : [];
  const day = days[dayIndex] || days[0];
  if (!day) return { name: plan.name || t('train.workout'), exercises: [] };
  return {
    name: day.name || plan.name || t('train.dayN', { n: dayIndex + 1 }),
    plan_id: plan.id,
    day_index: dayIndex,
    exercises: Array.isArray(day.exercises) ? day.exercises.map((ex) => ({
      name: ex.name || t('train.exercise'),
      primary_muscles: ex.primary_muscles || ex.muscle_group ? [ex.muscle_group] : [],
      rest_seconds: ex.rest_seconds || 60,
      target_sets: ex.sets || 3,
      target_reps: String(ex.reps || '10'),
      sets: Array.from({ length: ex.sets || 3 }, (_, i) => ({
        set_number: i + 1, target_reps: String(ex.reps || '10'), target_weight: null,
      })),
    })) : [],
  };
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatDuration(min) {
  if (!min) return '—';
  return min < 60 ? `${min} min` : `${Math.floor(min / 60)}h ${min % 60}m`;
}

function formatRelativeDate(dateStr, t) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (diff === 0) return t('train.today');
  if (diff === 1) return t('train.yesterday');
  return t('train.daysAgo', { count: diff });
}

// ─── Main ──────────────────────────────────────────────────────────────────────

export default function TrainV2() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { t } = useI18n();
  const { can } = useSubscription();
  const [searchParams, setSearchParams] = useSearchParams();
  const [mode, setMode] = useState('list');
  const [activeSession, setActiveSession] = useState(null);
  const [initialSession, setInitialSession] = useState(null);
  const [showQuickWorkout, setShowQuickWorkout] = useState(false);
  const [showPlanBuilder, setShowPlanBuilder] = useState(false);

  const daily = useDailyStateV2();
  const ai = useAICoach({ userId: user?.id });

  // Workout history for execution screen
  const { data: workoutHistory = [] } = useQuery({
    queryKey: ['workout-history', user?.id],
    queryFn: async () => { try { return await fetchRecentWorkoutHistory(user.id); } catch { return []; } },
    enabled: !!user?.id,
  });
  const personalRecords = useMemo(() => computePersonalRecords(workoutHistory), [workoutHistory]);

  // Save completed workout
  const saveMut = useMutation({
    mutationFn: ({ userId, payload, originalWorkout }) => saveCompletedWorkout(userId, payload, originalWorkout),
    onSuccess: () => {
      clearSession();
      window.dispatchEvent(new Event('atlas:session:change'));
      toast.success(t('train.toastSaved'));
      daily.invalidateAfterAction('workout');
      setMode('list');
      setActiveSession(null);
      setInitialSession(null);
    },
    onError: () => toast.error(t('train.toastSaveFailed')),
  });

  // Resume saved session on mount
  useEffect(() => {
    const saved = loadSession();
    if (saved?.workout) {
      setActiveSession(saved.workout);
      setInitialSession(saved);
      setMode('execution');
    }
  }, []);

  // Auto-start from URL param
  useEffect(() => {
    if (searchParams.get('start') === '1' && daily.activePlan && mode === 'list') {
      setSearchParams({}, { replace: true });
      const dayIdx = daily.activePlan.current_day_index ?? 0;
      setActiveSession(buildSessionFromPlan(daily.activePlan, dayIdx, t));
      setInitialSession(null);
      setMode('execution');
    }
  }, [searchParams, daily.activePlan, mode]);

  const handleStartDay = (dayIndex) => {
    setActiveSession(buildSessionFromPlan(daily.activePlan, dayIndex, t));
    setInitialSession(null);
    setMode('execution');
  };

  const handleStartQuickWorkout = (session) => {
    setActiveSession(session);
    setInitialSession(null);
    setShowQuickWorkout(false);
    setMode('execution');
  };

  const handleComplete = (completedData) => {
    if (!user?.id || !activeSession) return;
    saveMut.mutate({ userId: user.id, payload: completedData, originalWorkout: activeSession });
  };

  // ── Execution mode: full takeover ──────────────────────────────────────────
  if (mode === 'execution' && activeSession) {
    return (
      <>
        <WorkoutExecutionScreen
          workout={activeSession}
          initialSession={initialSession}
          onComplete={handleComplete}
          onCancel={() => { setMode('list'); setActiveSession(null); setInitialSession(null); }}
          workoutHistory={workoutHistory}
          personalRecords={personalRecords}
        />
      </>
    );
  }

  const exercises = daily.plan.todayExercises ?? [];
  const hasPlan = daily.plan.id != null;
  const trainMessage = ai.train?.message || null;

  // ── List mode ──────────────────────────────────────────────────────────────
  return (
    <AppContainer>
      <div className="space-y-5">

        {/* Header */}
        <div>
          <h1 className="text-title3 text-[hsl(var(--fg))]">{t('train.title')}</h1>
          {hasPlan && (
            <p className="text-footnote text-[hsl(var(--fg-3))] mt-0.5">{daily.plan.name} · {daily.plan.frequency ?? '—'}×/week</p>
          )}
        </div>

        {/* AI insight */}
        {trainMessage && (
          <div className="flex items-start gap-2.5 rounded-2xl bg-[hsl(var(--brand-ai)/0.05)] px-4 py-3.5">
            <Sparkles className="w-3.5 h-3.5 text-[hsl(var(--brand-ai))] shrink-0 mt-0.5" strokeWidth={2} />
            <p className="text-caption1 font-medium text-[hsl(var(--fg))] leading-[1.5]">{trainMessage}</p>
          </div>
        )}

        {/* Today's Workout Hero */}
        {daily.workoutDone ? (
          <div className="rounded-2xl bg-[hsl(var(--ok)/0.05)] p-5">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-[hsl(var(--ok))]" strokeWidth={2} />
              <div>
                <p className="text-body font-bold text-[hsl(var(--fg))]">{t('train.sessionComplete')}</p>
                <p className="text-caption1 text-[hsl(var(--fg-3))]">{daily.workout.sessionName || t('train.workout')} · {formatDuration(daily.workout.durationMinutes)}</p>
              </div>
            </div>
          </div>
        ) : hasPlan && exercises.length > 0 ? (
          <div className="rounded-2xl bg-[hsl(var(--card))] shadow-[var(--shadow-sm)] p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="atlas-overline">{daily.plan.todayDayLabel}</p>
                <p className="text-headline text-[hsl(var(--fg))] mt-1">{daily.plan.name}</p>
              </div>
              <div className="text-right">
                <p className="text-caption1 text-[hsl(var(--fg-3))]">{exercises.length} {t('train.exercises')}</p>
              </div>
            </div>
            {/* Exercise preview */}
            <div className="space-y-1.5 mb-4">
              {exercises.slice(0, 4).map((ex, i) => (
                <div key={i} className="flex items-center gap-2 text-caption1">
                  <span className="w-5 text-right text-[hsl(var(--fg-3))] font-medium">{i + 1}.</span>
                  <span className="text-[hsl(var(--fg))] font-medium truncate">{ex.name || t('train.exercise')}</span>
                  <span className="ml-auto text-[hsl(var(--fg-3))] shrink-0">{ex.sets || 3}×{ex.reps || '10'}</span>
                </div>
              ))}
              {exercises.length > 4 && (
                <p className="text-caption1 text-[hsl(var(--fg-3))] pl-7">{t('train.more', { count: exercises.length - 4 })}</p>
              )}
            </div>
            <Button size="lg" className="w-full rounded-xl shadow-[0_4px_14px_hsl(var(--brand)/0.2)]" onClick={() => handleStartDay(0)}>
              <Play className="w-4 h-4 fill-current" /> {t('train.startWorkout')}
            </Button>
          </div>
        ) : (
          <div className="rounded-2xl bg-[hsl(var(--fill)/0.4)] p-6 text-center">
            <Dumbbell className="w-8 h-8 text-[hsl(var(--fg-3))] mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-callout font-semibold text-[hsl(var(--fg))]">{t('train.noPlanActive')}</p>
            <p className="text-caption1 text-[hsl(var(--fg-3))] mt-1">{t('train.noPlanDesc')}</p>
            <Button className="mt-4 rounded-xl" onClick={() => setShowPlanBuilder(true)}>
              <Plus className="w-3.5 h-3.5" /> {t('train.createPlan')}
            </Button>
          </div>
        )}

        {/* Quick Workout — ALWAYS visible */}
        <button
          onClick={() => setShowQuickWorkout(true)}
          className="w-full flex items-center gap-3.5 rounded-atlas-card border border-[hsl(var(--brand)/0.2)] bg-[hsl(var(--brand)/0.06)] px-4 py-4 text-left active:bg-[hsl(var(--brand)/0.12)] transition-colors"
        >
          <div className="w-10 h-10 rounded-atlas-control bg-[hsl(var(--brand)/0.15)] flex items-center justify-center">
            <Zap className="w-5 h-5 text-[hsl(var(--brand))]" strokeWidth={2} />
          </div>
          <div className="flex-1">
            <p className="text-subhead font-bold text-[hsl(var(--fg))]">{t('train.quickWorkout')}</p>
            <p className="text-caption1 text-[hsl(var(--fg-3))] mt-0.5">{t('train.quickWorkoutDesc')}</p>
          </div>
          <ArrowRight className="w-4 h-4 text-[hsl(var(--fg-3))]" strokeWidth={2} />
        </button>

        {/* Weekly Plan */}
        {hasPlan && (() => {
          const days = Array.isArray(daily.activePlan?.days) ? daily.activePlan.days : [];
          if (days.length === 0) return null;
          return (
            <div>
              <p className="atlas-overline mb-2.5 px-0.5">{t('train.weeklyPlan')}</p>
              <div className="space-y-1.5">
                {days.map((day, idx) => {
                  const exCount = Array.isArray(day?.exercises) ? day.exercises.length : 0;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleStartDay(idx)}
                      className="w-full flex items-center gap-3 rounded-atlas-control border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card)/0.9)] px-4 py-3 text-left active:bg-[hsl(var(--fill)/0.4)] transition-colors"
                    >
                      <div className="w-7 h-7 rounded-[9px] bg-[hsl(var(--fill)/0.8)] flex items-center justify-center text-[hsl(var(--fg-3))]">
                        <Calendar className="w-3.5 h-3.5" strokeWidth={2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-footnote font-semibold text-[hsl(var(--fg))] truncate">{day?.name || t('train.dayN', { n: idx + 1 })}</p>
                        <p className="text-caption1 text-[hsl(var(--fg-3))]">{exCount} {t('train.exercises')}</p>
                      </div>
                      <Play className="w-3.5 h-3.5 text-[hsl(var(--fg-3))]" strokeWidth={2} />
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Recent Sessions */}
        {daily.recentSessions.length > 0 && (
          <div>
            <p className="atlas-overline mb-2.5 px-0.5">{t('train.recent')}</p>
            <div className="space-y-1.5">
              {daily.recentSessions.slice(0, 5).map((s, i) => (
                <div key={s.id || i} className="flex items-center gap-3 rounded-atlas-control border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--fill)/0.2)] px-4 py-3">
                  <CheckCircle2 className="w-4 h-4 text-[hsl(var(--ok))] shrink-0" strokeWidth={2} />
                  <div className="flex-1 min-w-0">
                    <p className="text-footnote font-medium text-[hsl(var(--fg))] truncate">{s.workout_name || s.name || t('train.session')}</p>
                    <p className="text-caption1 text-[hsl(var(--fg-3))]">{formatRelativeDate(s.completed_at || s.date, t)} · {formatDuration(s.duration_minutes)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Modals — only when open */}
      {showQuickWorkout && (
        <QuickWorkoutModal
          open={showQuickWorkout}
          onClose={() => setShowQuickWorkout(false)}
          onStart={handleStartQuickWorkout}
        />
      )}
      {showPlanBuilder && (
        <PlanBuilderWizard
          open={showPlanBuilder}
          onClose={() => setShowPlanBuilder(false)}
          profileData={daily.profile}
          onPlanCreated={() => {
            setShowPlanBuilder(false);
            daily.invalidateAfterAction('plan');
            toast.success(t('train.toastPlanCreated'));
          }}
        />
      )}

    </AppContainer>
  );
}
