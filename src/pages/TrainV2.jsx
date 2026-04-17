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
  Play, CheckCircle2, Clock, Zap, Plus,
  ArrowRight, Sparkles, Target, Trophy, RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/lib/i18nContext';
import { useSubscription } from '@/lib/SubscriptionContext';
import { trackProductEvent } from '@/lib/productEvents';
import { useDailyStateV2 } from '@/hooks/useDailyStateV2';
import { useAICoach } from '@/hooks/useAICoach';
import WorkoutExecutionScreen from '@/components/workouts/WorkoutExecutionScreen';
import QuickWorkoutModal from '@/components/workouts/QuickWorkoutModal';
import PlanBuilderWizard from '@/components/workouts/PlanBuilderWizard';
import { AppContainer } from '@/components/shared/AppContainer';
import { cn } from '@/lib/utils';
import {
  fetchRecentWorkoutHistory,
  computePersonalRecords,
} from '@/services/workoutHistoryService';


import { saveCompletedWorkout } from '@/services/workoutService';
import { loadSession, clearSession, hasSession } from '@/lib/workoutSession';
import { lookupExerciseMedia } from '@/lib/exerciseDB';

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
    exercises: Array.isArray(day.exercises) ? day.exercises.map((ex) => {
      const media = lookupExerciseMedia(ex.name);
      return {
        name: ex.name || t('train.exercise'),
        primary_muscles: ex.primary_muscles || ex.muscle_group ? [ex.muscle_group] : [],
        rest_seconds: ex.rest_seconds || 60,
        target_sets: ex.sets || 3,
        target_reps: String(ex.reps || '10'),
        media: { gif_url: media.gif_url, image_url: null },
        sets: Array.from({ length: ex.sets || 3 }, (_, i) => ({
          set_number: i + 1, target_reps: String(ex.reps || '10'), target_weight: null,
        })),
      };
    }) : [],
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
    
    // Use centralized streak from useDailyStateV2
    const streak = daily.workoutStreak ?? 0;

    const sorted = [...workoutHistory].sort((a, b) => {
      const dateA = new Date(b.completed_at || b.date).getTime();
      const dateB = new Date(a.completed_at || a.date).getTime();
      return dateA - dateB;
    });
    const today = new Date();
    today.setHours(0, 0, 0, 0);

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

// ─── Last Workout Summary Card ──────────────────────────────────────────────

function LastWorkoutSummaryCard({ workoutHistory, personalRecords, onRepeat, t }) {
  if (!workoutHistory || workoutHistory.length === 0) return null;

  const last = workoutHistory[0];
  const exList = Array.isArray(last.exercises_completed) ? last.exercises_completed : [];
  const totalSets = exList.reduce((acc, ex) => acc + (ex.sets_completed?.length || 0), 0);
  const totalVolume = exList.reduce((acc, ex) => {
    return acc + (ex.sets_completed || []).reduce((a, s) => {
      return a + (Number(s.load_actual) || 0) * (Number(s.reps_actual) || 0);
    }, 0);
  }, 0);

  const completedDate = last.completed_at ? new Date(last.completed_at) : null;
  const dateLabel = completedDate
    ? completedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    : '';

  // Check for PRs in this workout
  const exercisesWithPR = exList.filter((ex) => {
    const key = (ex.name || '').toLowerCase().trim().replace(/\s+/g, ' ');
    const rec = personalRecords[key];
    if (!rec) return false;
    return (ex.sets_completed || []).some((s) => {
      const load = Number(s.load_actual) || 0;
      const reps = Number(s.reps_actual) || 0;
      const volume = load * reps;
      return load >= rec.bestWeight || volume >= rec.bestVolume;
    });
  });

  return (
    <div className="rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border)/0.5)] shadow-[var(--shadow-sm)] overflow-hidden">
      <div className="px-4 py-3 border-b border-[hsl(var(--border)/0.2)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[hsl(var(--ok))]" strokeWidth={2} />
          <p className="text-[12px] font-semibold text-[hsl(var(--fg))] uppercase tracking-wide">
            {t('train.lastWorkoutSummary')}
          </p>
        </div>
        <span className="text-[11px] text-[hsl(var(--fg-3))]">{dateLabel}</span>
      </div>

      <div className="p-4">
        {/* Workout name + stats */}
        <p className="text-[16px] font-bold text-[hsl(var(--fg))]">{last.name || t('train.workout')}</p>

        <div className="grid grid-cols-3 gap-3 mt-3">
          <div className="text-center">
            <p className="text-[10px] font-semibold text-[hsl(var(--fg-3))] uppercase">{t('train.totalSets')}</p>
            <p className="text-[18px] font-bold text-[hsl(var(--fg))] mt-0.5">{totalSets}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-semibold text-[hsl(var(--fg-3))] uppercase">{t('train.totalVolume')}</p>
            <p className="text-[18px] font-bold text-[hsl(var(--fg))] mt-0.5">{totalVolume > 0 ? `${Math.round(totalVolume / 1000)}k` : '---'}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-semibold text-[hsl(var(--fg-3))] uppercase">{t('train.duration')}</p>
            <p className="text-[18px] font-bold text-[hsl(var(--fg))] mt-0.5">{formatDuration(last.duration_minutes || 0)}</p>
          </div>
        </div>

        {/* Exercise list with PR badges */}
        <div className="mt-4 space-y-1.5">
          {exList.slice(0, 5).map((ex, i) => {
            const hasPR = exercisesWithPR.includes(ex);
            const bestSet = (ex.sets_completed || []).reduce((best, s) => {
              const load = Number(s.load_actual) || 0;
              if (load > (best?.load || 0)) return { load, reps: Number(s.reps_actual) || 0 };
              return best;
            }, null);

            return (
              <div key={i} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-[13px] text-[hsl(var(--fg))] font-medium truncate">{ex.name}</span>
                  {hasPR && (
                    <span className="shrink-0 inline-flex items-center gap-0.5 rounded-full bg-[hsl(var(--ok)/0.12)] border border-[hsl(var(--ok)/0.25)] px-1.5 py-0.5">
                      <Trophy className="w-2.5 h-2.5 text-[hsl(var(--ok))]" strokeWidth={2.5} />
                      <span className="text-[9px] font-bold text-[hsl(var(--ok))] uppercase">{t('train.prBadge')}</span>
                    </span>
                  )}
                </div>
                {bestSet && (
                  <span className="text-[12px] text-[hsl(var(--fg-3))] shrink-0 ml-2">
                    {bestSet.load > 0 ? `${bestSet.load}kg` : ''} {bestSet.reps > 0 ? `x${bestSet.reps}` : ''}
                  </span>
                )}
              </div>
            );
          })}
          {exList.length > 5 && (
            <p className="text-[11px] text-[hsl(var(--fg-3))]">+{exList.length - 5} more</p>
          )}
        </div>

        {/* Repeat workout CTA */}
        <Button
          variant="outline"
          className="w-full mt-4 rounded-xl h-10 text-[13px] font-semibold"
          onClick={() => onRepeat(last)}
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" strokeWidth={2} />
          {t('train.repeatWorkout')}
        </Button>
      </div>
    </div>
  );
}

// ─── Volume Trend Mini Chart ────────────────────────────────────────────────

function VolumeTrendChart({ workoutHistory, t }) {
  // Build weekly volume data from last 4 weeks
  const weeklyData = useMemo(() => {
    const now = new Date();
    const weeks = [];
    for (let w = 3; w >= 0; w--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay() - (w * 7));
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);

      let volume = 0;
      let sessions = 0;
      workoutHistory.forEach((wk) => {
        const d = new Date(wk.completed_at || wk.date);
        if (d >= weekStart && d < weekEnd) {
          sessions++;
          const exList = Array.isArray(wk.exercises_completed) ? wk.exercises_completed : [];
          exList.forEach((ex) => {
            (ex.sets_completed || []).forEach((s) => {
              volume += (Number(s.load_actual) || 0) * (Number(s.reps_actual) || 0);
            });
          });
        }
      });

      const label = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      weeks.push({ label, volume: Math.round(volume), sessions });
    }
    return weeks;
  }, [workoutHistory]);

  const maxVolume = Math.max(...weeklyData.map((w) => w.volume), 1);
  if (maxVolume === 0) return null;

  return (
    <div className="rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border)/0.5)] p-4">
      <p className="text-[12px] font-semibold text-[hsl(var(--fg))] uppercase tracking-wide mb-3">
        {t('train.weeklyVolume')}
      </p>
      <div className="flex items-end gap-2 h-20">
        {weeklyData.map((week, i) => {
          const heightPct = maxVolume > 0 ? (week.volume / maxVolume) * 100 : 0;
          const isCurrentWeek = i === weeklyData.length - 1;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[9px] font-bold text-[hsl(var(--fg-3))]">
                {week.volume > 0 ? `${Math.round(week.volume / 1000)}k` : '0'}
              </span>
              <div className="w-full flex justify-center">
                <div
                  className={`w-full max-w-[32px] rounded-t-md transition-all ${
                    isCurrentWeek
                      ? 'bg-[hsl(var(--brand))]'
                      : 'bg-[hsl(var(--brand)/0.25)]'
                  }`}
                  style={{ height: `${Math.max(heightPct, 4)}%`, minHeight: '3px' }}
                />
              </div>
              <span className="text-[9px] text-[hsl(var(--fg-3))]">{week.label}</span>
            </div>
          );
        })}
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
            <p className="text-caption1 text-[hsl(var(--fg-3))] pl-9">+{exercises.length - 4} more</p>
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
  const [previewDayIndex, setPreviewDayIndex] = useState(null);

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
      trackProductEvent(user?.id, 'workout_completed');
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

  const handlePreviewDay = (dayIndex) => {
    setPreviewDayIndex(dayIndex);
  };

  const handleStartDay = (dayIndex) => {
    setPreviewDayIndex(null);
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

  const handleRepeatWorkout = (historyWorkout) => {
    const exList = Array.isArray(historyWorkout.exercises_completed) ? historyWorkout.exercises_completed : [];
    const session = {
      name: historyWorkout.name || t('train.workout'),
      exercises: exList.map((ex) => {
        const media = lookupExerciseMedia(ex.name);
        const setCount = ex.sets_completed?.length || ex.target_sets || 3;
        return {
          name: ex.name,
          primary_muscles: [],
          rest_seconds: 60,
          target_sets: setCount,
          target_reps: ex.target_reps || '10',
          media: { gif_url: media.gif_url, image_url: null },
          sets: Array.from({ length: setCount }, (_, i) => ({
            set_number: i + 1,
            target_reps: ex.target_reps || '10',
            target_weight: null,
          })),
        };
      }),
    };
    setActiveSession(session);
    setInitialSession(null);
    setMode('execution');
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
      <div className="space-y-5 atlas-page-enter">

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
            onSelectDay={handlePreviewDay}
            t={t}
          />
        )}

        {/* Last Workout Summary with PR badges */}
        {workoutHistory.length > 0 && (
          <LastWorkoutSummaryCard
            workoutHistory={workoutHistory}
            personalRecords={personalRecords}
            onRepeat={handleRepeatWorkout}
            t={t}
          />
        )}

        {/* Volume Trend Chart */}
        {workoutHistory.length > 1 && (
          <VolumeTrendChart workoutHistory={workoutHistory} t={t} />
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

      {/* Day Preview Dialog */}
      {previewDayIndex !== null && daily.activePlan && (() => {
        const dayData = daily.activePlan.days?.[previewDayIndex];
        if (!dayData) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50" onClick={() => setPreviewDayIndex(null)}>
            <div className="w-full max-w-md bg-[hsl(var(--card))] rounded-t-2xl sm:rounded-2xl p-5 space-y-4 max-h-[70vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h3 className="text-[17px] font-bold text-[hsl(var(--fg))]">{dayData.name || t('train.dayN', { n: previewDayIndex + 1 })}</h3>
                <button onClick={() => setPreviewDayIndex(null)} className="text-[hsl(var(--fg-3))] hover:text-[hsl(var(--fg))]">&times;</button>
              </div>
              <div className="space-y-2">
                {(dayData.exercises || []).map((ex, i) => (
                  <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-[hsl(var(--fill)/0.3)]">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-[hsl(var(--fill))] flex items-center justify-center text-[10px] text-[hsl(var(--fg-3))]">{i + 1}</span>
                      <span className="text-sm text-[hsl(var(--fg))]">{ex.name}</span>
                    </div>
                    <span className="text-xs text-[hsl(var(--fg-2))]">{ex.sets}&times;{ex.reps || ex.rep_range}</span>
                  </div>
                ))}
              </div>
              <Button className="w-full h-11 rounded-xl" onClick={() => handleStartDay(previewDayIndex)}>
                <Play className="w-4 h-4 mr-2" /> {t('train.startWorkout')}
              </Button>
            </div>
          </div>
        );
      })()}

    </AppContainer>
  );
}
