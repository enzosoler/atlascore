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
  ArrowRight, Sparkles, Calendar, TrendingUp, Target,
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
import { cn } from '@/lib/utils';
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

// ─── Stats Header Component ───────────────────────────────────────────────────

function StatsHeader({ workoutHistory, daily, t }) {
  // Calculate streak and weekly stats
  const stats = useMemo(() => {
    const now = new Date();
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - now.getDay());
    thisWeekStart.setHours(0, 0, 0, 0);
    
    const sessionsThisWeek = workoutHistory.filter(w => {
      const d = new Date(w.completed_at || w.date);
      return d >= thisWeekStart;
    }).length;
    
    // Calculate streak
    let streak = 0;
    const sorted = [...workoutHistory].sort((a, b) => {
      const dateA = new Date(b.completed_at || b.date).getTime();
      const dateB = new Date(a.completed_at || a.date).getTime();
      return dateA - dateB;
    });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let checkDate = new Date(today);
    
    for (const workout of sorted) {
      const workoutDate = new Date(workout.completed_at || workout.date);
      workoutDate.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((checkDate.getTime() - workoutDate.getTime()) / 86400000);
      
      if (diffDays === 0 || diffDays === 1) {
        streak++;
        checkDate = new Date(workoutDate);
      } else {
        break;
      }
    }
    
    const lastWorkout = sorted[0];
    const daysSinceLast = lastWorkout 
      ? Math.floor((today.getTime() - new Date(lastWorkout.completed_at || lastWorkout.date).getTime()) / 86400000)
      : null;
    
    return { sessionsThisWeek, streak, daysSinceLast };
  }, [workoutHistory]);
  
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="rounded-[16px] bg-[hsl(var(--card))] border border-[hsl(var(--border)/0.5)] p-3 text-center">
        <p className="text-[11px] font-medium text-[hsl(var(--fg-3))] uppercase tracking-wide">{t('train.thisWeek')}</p>
        <p className="text-[22px] font-bold text-[hsl(var(--brand))] mt-1">{stats.sessionsThisWeek}</p>
        <p className="text-[10px] text-[hsl(var(--fg-3))]">{t('train.sessions')}</p>
      </div>
      <div className="rounded-[16px] bg-[hsl(var(--card))] border border-[hsl(var(--border)/0.5)] p-3 text-center">
        <p className="text-[11px] font-medium text-[hsl(var(--fg-3))] uppercase tracking-wide">{t('train.streak')}</p>
        <p className="text-[22px] font-bold text-[hsl(var(--ok))] mt-1">{stats.streak}</p>
        <p className="text-[10px] text-[hsl(var(--fg-3))]">{t('train.days')}</p>
      </div>
      <div className="rounded-[16px] bg-[hsl(var(--card))] border border-[hsl(var(--border)/0.5)] p-3 text-center">
        <p className="text-[11px] font-medium text-[hsl(var(--fg-3))] uppercase tracking-wide">{t('train.lastSession')}</p>
        <p className="text-[22px] font-bold text-[hsl(var(--fg))] mt-1">
          {stats.daysSinceLast === null ? '—' : stats.daysSinceLast === 0 ? t('train.today') : stats.daysSinceLast}
        </p>
        <p className="text-[10px] text-[hsl(var(--fg-3))]">
          {stats.daysSinceLast === null ? '' : stats.daysSinceLast === 0 ? '' : stats.daysSinceLast === 1 ? t('train.dayAgo') : t('train.daysAgo', { count: stats.daysSinceLast })}
        </p>
      </div>
    </div>
  );
}

// ─── Resume Session Banner ───────────────────────────────────────────────────

function ResumeSessionBanner({ onResume, sessionName, t }) {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-[hsl(var(--brand)/0.15)] to-[hsl(var(--brand-ai)/0.1)] border border-[hsl(var(--brand)/0.3)] p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[hsl(var(--brand)/0.2)] flex items-center justify-center">
            <Clock className="w-5 h-5 text-[hsl(var(--brand))]" />
          </div>
          <div>
            <p className="text-subhead font-bold text-[hsl(var(--fg))]">{t('train.resumeSession')}</p>
            <p className="text-caption1 text-[hsl(var(--fg-3))]">{sessionName}</p>
          </div>
        </div>
        <Button onClick={onResume} className="rounded-xl bg-[hsl(var(--brand))] hover:bg-[hsl(var(--brand)/0.9)]">
          {t('train.continue')}
        </Button>
      </div>
    </div>
  );
}

// ─── Empty State Upgrade Prompt ───────────────────────────────────────────────

function EmptyStateUpgrade({ onCreatePlan, t, can }) {
  return (
    <div className="rounded-2xl bg-gradient-to-b from-[hsl(var(--fill)/0.5)] to-[hsl(var(--card))] border border-[hsl(var(--border)/0.5)] p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--brand)/0.1)] flex items-center justify-center mx-auto mb-4">
        <Target className="w-8 h-8 text-[hsl(var(--brand))]" strokeWidth={1.5} />
      </div>
      <p className="text-title3 font-bold text-[hsl(var(--fg))] mb-2">{t('train.noPlanTitle')}</p>
      <p className="text-body text-[hsl(var(--fg-2))] mb-4 max-w-[280px] mx-auto">{t('train.noPlanDesc')}</p>
      <Button 
        onClick={onCreatePlan} 
        className="rounded-xl bg-[hsl(var(--brand))] hover:bg-[hsl(var(--brand)/0.9)] shadow-[0_4px_14px_hsl(var(--brand)/0.3)]"
      >
        <Plus className="w-4 h-4 mr-2" />
        {can('plan_builder') ? t('train.createPlan') : t('train.upgradeToPlan')}
      </Button>
      {!can('plan_builder') && (
        <p className="text-caption1 text-[hsl(var(--fg-3))] mt-3">{t('train.planProFeature')}</p>
      )}
    </div>
  );
}

// ─── Workout Complete Celebration ─────────────────────────────────────────────

function WorkoutCompleteCard({ workout, onViewSummary, t }) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-[hsl(var(--ok)/0.12)] via-[hsl(var(--ok)/0.06)] to-[hsl(var(--card))] border border-[hsl(var(--ok)/0.3)] p-5">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--ok))] flex items-center justify-center shadow-lg shadow-[hsl(var(--ok)/0.3)]">
          <CheckCircle2 className="w-7 h-7 text-white" strokeWidth={2.5} />
        </div>
        <div className="flex-1">
          <p className="text-title3 font-bold text-[hsl(var(--fg))]">{t('train.sessionComplete')}</p>
          <p className="text-body text-[hsl(var(--fg-2))] mt-1">{workout.sessionName || t('train.workout')}</p>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5 text-caption1 text-[hsl(var(--fg-3))]">
              <Clock className="w-3.5 h-3.5" />
              {formatDuration(workout.durationMinutes)}
            </div>
            <button 
              onClick={onViewSummary}
              className="text-caption1 font-semibold text-[hsl(var(--brand))] hover:opacity-80"
            >
              {t('train.viewSummary')} →
            </button>
          </div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-[hsl(var(--ok)/0.2)]">
        <p className="text-caption1 text-[hsl(var(--fg-3))] text-center">{t('train.streakMessage')}</p>
      </div>
    </div>
  );
}

// ─── Weekly Plan Collapsible ─────────────────────────────────────────────────

function WeeklyPlanSection({ days, currentDayIndex, onSelectDay, t }) {
  const [expanded, setExpanded] = useState(false);
  
  if (days.length === 0) return null;
  
  const visibleDays = expanded ? days : days.slice(0, 3);
  
  return (
    <div className="rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border)/0.5)] overflow-hidden">
      <div className="px-4 py-3 border-b border-[hsl(var(--border)/0.3)]">
        <p className="atlas-overline">{t('train.weeklyPlan')}</p>
      </div>
      <div className="divide-y divide-[hsl(var(--border)/0.2)]">
        {visibleDays.map((day, idx) => {
          const exCount = Array.isArray(day?.exercises) ? day.exercises.length : 0;
          const isToday = idx === currentDayIndex;
          return (
            <button
              key={idx}
              onClick={() => onSelectDay(idx)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                isToday ? "bg-[hsl(var(--brand)/0.05)]" : "hover:bg-[hsl(var(--fill)/0.3)]"
              )}
            >
              <div className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold",
                isToday 
                  ? "bg-[hsl(var(--brand))] text-white" 
                  : "bg-[hsl(var(--fill)/0.8)] text-[hsl(var(--fg-3))]"
              )}>
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-footnote font-semibold truncate",
                  isToday ? "text-[hsl(var(--brand))]" : "text-[hsl(var(--fg))]"
                )}>{day?.name || t('train.dayN', { n: idx + 1 })}</p>
                <p className="text-caption1 text-[hsl(var(--fg-3))]">{exCount} {t('train.exercises')}</p>
              </div>
              {isToday && <span className="text-[10px] font-bold text-[hsl(var(--brand))] uppercase">{t('train.today')}</span>}
              <Play className={cn("w-3.5 h-3.5", isToday ? "text-[hsl(var(--brand))]" : "text-[hsl(var(--fg-3))]")} strokeWidth={2} />
            </button>
          );
        })}
      </div>
      {days.length > 3 && (
        <button 
          onClick={() => setExpanded(!expanded)}
          className="w-full py-2.5 text-caption1 font-medium text-[hsl(var(--brand))] hover:bg-[hsl(var(--fill)/0.3)] transition-colors"
        >
          {expanded ? t('train.showLess') : t('train.showAll', { count: days.length - 3 })}
        </button>
      )}
    </div>
  );
}

// ─── Quick Workout Card ──────────────────────────────────────────────────────

function QuickWorkoutCard({ onClick, t }) {
  return (
    <button
      onClick={onClick}
      className="w-full group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[hsl(var(--brand)/0.12)] to-[hsl(var(--brand-ai)/0.06)] border border-[hsl(var(--brand)/0.25)] p-4 text-left transition-all active:scale-[0.98]"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-[hsl(var(--brand)/0.08)] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="relative flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-[hsl(var(--brand)/0.15)] flex items-center justify-center group-hover:bg-[hsl(var(--brand)/0.25)] transition-colors">
          <Zap className="w-6 h-6 text-[hsl(var(--brand))]" strokeWidth={2} />
        </div>
        <div className="flex-1">
          <p className="text-subhead font-bold text-[hsl(var(--fg))]">{t('train.quickWorkout')}</p>
          <p className="text-caption1 text-[hsl(var(--fg-3))]">{t('train.quickWorkoutDesc')}</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[hsl(var(--card))] flex items-center justify-center shadow-sm">
          <ArrowRight className="w-5 h-5 text-[hsl(var(--brand))]" strokeWidth={2} />
        </div>
      </div>
    </button>
  );
}

// ─── Recent Sessions Compact ─────────────────────────────────────────────────

function RecentSessionsCompact({ sessions, t }) {
  if (sessions.length === 0) return null;
  
  return (
    <div>
      <p className="atlas-overline mb-2.5 px-0.5">{t('train.recent')}</p>
      <div className="space-y-2">
        {sessions.slice(0, 3).map((s, i) => (
          <div key={s.id || i} className="flex items-center gap-3 rounded-xl bg-[hsl(var(--fill)/0.3)] px-3 py-2.5">
            <CheckCircle2 className="w-4 h-4 text-[hsl(var(--ok)/0.8)] shrink-0" strokeWidth={2} />
            <div className="flex-1 min-w-0">
              <p className="text-footnote font-medium text-[hsl(var(--fg))] truncate">{s.workout_name || s.name || t('train.session')}</p>
            </div>
            <p className="text-caption1 text-[hsl(var(--fg-3))] shrink-0">{formatDuration(s.duration_minutes)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Today's Workout Hero ────────────────────────────────────────────────────

function TodayWorkoutHero({ plan, exercises, onStart, t }) {
  return (
    <div className="rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border)/0.5)] shadow-[var(--shadow-sm)] overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="text-caption1 font-medium text-[hsl(var(--brand))] uppercase tracking-wide">{plan.todayDayLabel}</p>
            <p className="text-title2 font-bold text-[hsl(var(--fg))] mt-1">{plan.name}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-headline font-bold text-[hsl(var(--fg))]">{exercises.length}</p>
            <p className="text-caption1 text-[hsl(var(--fg-3))]">{t('train.exercises')}</p>
          </div>
        </div>
        
        {/* Exercise Preview */}
        <div className="space-y-2 mb-5">
          {exercises.slice(0, 4).map((ex, i) => (
            <div key={i} className="flex items-center gap-3 text-body">
              <span className="w-6 h-6 rounded-md bg-[hsl(var(--fill)/0.6)] flex items-center justify-center text-[11px] font-semibold text-[hsl(var(--fg-3))]">
                {i + 1}
              </span>
              <span className="text-[hsl(var(--fg))] font-medium truncate flex-1">{ex.name || t('train.exercise')}</span>
              <span className="text-caption1 text-[hsl(var(--fg-3))] shrink-0">{ex.sets || 3}×{ex.reps || '10'}</span>
            </div>
          ))}
          {exercises.length > 4 && (
            <p className="text-caption1 text-[hsl(var(--fg-3))] pl-9">+{exercises.length - 4} {t('train.more')}</p>
          )}
        </div>
        
        <Button 
          size="lg" 
          className="w-full rounded-xl bg-[hsl(var(--brand))] hover:bg-[hsl(var(--brand)/0.9)] shadow-[0_4px_16px_hsl(var(--brand)/0.35)] h-12"
          onClick={() => onStart(0)}
        >
          <Play className="w-5 h-5 fill-current mr-2" /> {t('train.startWorkout')}
        </Button>
      </div>
      
      {/* Progress Bar */}
      <div className="h-1 bg-[hsl(var(--fill)/0.5)]">
        <div className="h-full bg-[hsl(var(--brand))] w-0" /> {/* Would show plan progress */}
      </div>
    </div>
  );
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

  const handleResumeSession = () => {
    const saved = loadSession();
    if (saved?.workout) {
      setActiveSession(saved.workout);
      setInitialSession(saved);
      setMode('execution');
    }
  };

  // ── Execution mode: full takeover ──────────────────────────────────────────
  if (mode === 'execution' && activeSession) {
    return (
      <WorkoutExecutionScreen
        workout={activeSession}
        initialSession={initialSession}
        onComplete={handleComplete}
        onCancel={() => { setMode('list'); setActiveSession(null); setInitialSession(null); }}
        workoutHistory={workoutHistory}
        personalRecords={personalRecords}
      />
    );
  }

  const exercises = daily.plan.todayExercises ?? [];
  const hasPlan = daily.plan.id != null;
  const trainMessage = ai.train?.message || null;
  const days = Array.isArray(daily.activePlan?.days) ? daily.activePlan.days : [];
  const currentDayIndex = daily.activePlan?.current_day_index ?? 0;

  // ── List mode ──────────────────────────────────────────────────────────────
  return (
    <AppContainer>
      <div className="space-y-5">

        {/* Header */}
        <div>
          <h1 className="text-title3 text-[hsl(var(--fg))]">{t('train.title')}</h1>
        </div>

        {/* Stats Row */}
        <StatsHeader workoutHistory={workoutHistory} daily={daily} t={t} />

        {/* Resume Session Banner (if saved session exists) */}
        {hasSession() && (
          <ResumeSessionBanner 
            onResume={handleResumeSession}
            sessionName={loadSession()?.workout?.name || t('train.unfinishedSession')}
            t={t}
          />
        )}

        {/* AI insight */}
        {trainMessage && (
          <div className="flex items-start gap-2.5 rounded-2xl bg-[hsl(var(--brand-ai)/0.05)] px-4 py-3.5">
            <Sparkles className="w-3.5 h-3.5 text-[hsl(var(--brand-ai))] shrink-0 mt-0.5" strokeWidth={2} />
            <p className="text-caption1 font-medium text-[hsl(var(--fg))] leading-[1.5]">{trainMessage}</p>
          </div>
        )}

        {/* Today's Workout / Complete / Empty State */}
        {daily.workoutDone ? (
          <WorkoutCompleteCard 
            workout={daily.workout} 
            onViewSummary={() => {}}
            t={t}
          />
        ) : hasPlan && exercises.length > 0 ? (
          <TodayWorkoutHero 
            plan={daily.plan}
            exercises={exercises}
            onStart={handleStartDay}
            t={t}
          />
        ) : (
          <EmptyStateUpgrade 
            onCreatePlan={() => setShowPlanBuilder(true)}
            t={t}
            can={can}
          />
        )}

        {/* Quick Workout */}
        <QuickWorkoutCard 
          onClick={() => setShowQuickWorkout(true)}
          t={t}
        />

        {/* Weekly Plan */}
        {hasPlan && days.length > 0 && (
          <WeeklyPlanSection 
            days={days}
            currentDayIndex={currentDayIndex}
            onSelectDay={handleStartDay}
            t={t}
          />
        )}

        {/* Recent Sessions */}
        {daily.recentSessions.length > 0 && (
          <RecentSessionsCompact 
            sessions={daily.recentSessions}
            t={t}
          />
        )}

      </div>

      {/* Modals */}
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
