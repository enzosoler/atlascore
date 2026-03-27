import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  CalendarCheck,
  Camera,
  CheckCircle2,
  ChevronRight,
  Clock,
  Dumbbell,
  Flame,
  Loader2,
  Plus,
  Scale,
  Sparkles,
  Target,
  TrendingUp,
  UtensilsCrossed,
  Zap,
} from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/AuthContext';
import { useSubscription } from '@/lib/SubscriptionContext';
import { supabase } from '@/lib/supabaseClient';
import { ROUTES } from '@/lib/routes';
import { SafePageBoundary } from '@/components/shared/StablePage';
import { TodayScreen, TodaySection, TodayCard } from '@/components/today/TodayMobileUI';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WeeklyCheckinModal } from '@/components/today/WeeklyCheckinModal';
import { toast } from 'sonner';
import { trackEvent } from '@/lib/sentry';
import AIGenerateWizard from '@/components/ai/AIGenerateWizard';

// Helper functions
function getPreferredName(displayName, fallbackName = 'Athlete') {
  if (!displayName) return fallbackName;
  const [firstChunk] = String(displayName)
    .split(/[\s@._-]+/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  if (!firstChunk) return fallbackName;

  const sanitizedChunk = firstChunk.replace(/\d+$/u, '');
  const candidate = sanitizedChunk || firstChunk;

  if (!candidate) return fallbackName;

  return `${candidate.charAt(0).toLocaleUpperCase()}${candidate.slice(1)}`;
}

function getDateLabel() {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());
}

function formatRelativeDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const today = new Date();
  const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// AI Insights Generator
function generateTodayInsights({
  todaySession,
  todayMeals,
  recentMeasurements,
  activeWorkoutPlan,
  lastWorkoutDate,
  profile,
}) {
  const insights = [];

  // Priority 1: Training gap alert
  if (lastWorkoutDate) {
    const daysSinceWorkout = Math.floor(
      (new Date().getTime() - new Date(lastWorkoutDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceWorkout >= 2 && !todaySession) {
      insights.push({
        type: 'urgent',
        icon: Flame,
        title: daysSinceWorkout >= 3
          ? `You haven't trained in ${daysSinceWorkout} days`
          : 'You skipped yesterday',
        message: daysSinceWorkout >= 3
          ? 'Today is important — get back on track'
          : 'Don\'t let it become two days. Train today.',
        action: 'Start workout',
        actionPath: ROUTES.workouts,
      });
    }
  }

  // Priority 2: Workout completion celebration
  if (todaySession?.status === 'completed') {
    insights.push({
      type: 'success',
      icon: CheckCircle2,
      title: 'Workout completed today',
      message: `Great job! ${todaySession.name || 'Session'} done and logged.`,
      action: 'View summary',
      actionPath: ROUTES.workouts,
    });
  }

  // Priority 3: No plan alert
  if (!activeWorkoutPlan && !todaySession) {
    insights.push({
      type: 'action',
      icon: Target,
      title: 'No active workout plan',
      message: 'Build your plan first to unlock daily guidance.',
      action: 'Create plan',
      actionPath: ROUTES.workouts,
    });
  }

  // Priority 4: Nutrition logging prompt
  if (todayMeals.length === 0 && !todaySession) {
    insights.push({
      type: 'action',
      icon: UtensilsCrossed,
      title: 'No meals logged yet',
      message: 'Start by logging your first meal of the day.',
      action: 'Log meal',
      actionPath: ROUTES.nutrition,
    });
  }

  // Priority 5: Consistency praise
  const hasWorkoutToday = todaySession?.status === 'completed';
  const hasMealsToday = todayMeals.length > 0;
  if (hasWorkoutToday && hasMealsToday) {
    insights.push({
      type: 'success',
      icon: TrendingUp,
      title: 'You\'re on fire today',
      message: 'Workout done, nutrition logged. Keep this momentum.',
    });
  }

  // Limit to 1-2 most important insights
  return insights.slice(0, 2);
}

// Calculate priority actions based on user state
function getPriorityActions({
  activeWorkoutPlan,
  todaySession,
  todayMeals,
  recentMeasurements,
  progressPhotos,
}) {
  const actions = [];

  // Priority 1: Workout (always #1 if not completed)
  if (todaySession?.status === 'completed') {
    actions.push({
      priority: 1,
      icon: CheckCircle2,
      title: 'Workout completed',
      description: todaySession.name || 'Today\'s session',
      path: ROUTES.workouts,
      completed: true,
      tone: 'green',
    });
  } else if (activeWorkoutPlan) {
    actions.push({
      priority: 1,
      icon: Dumbbell,
      title: 'Start today\'s workout',
      description: activeWorkoutPlan.name || 'Your scheduled session',
      path: ROUTES.workouts,
      cta: 'Start now',
      tone: 'blue',
      highlighted: true,
    });
  } else {
    actions.push({
      priority: 1,
      icon: Target,
      title: 'Build your workout plan',
      description: 'Create a plan to get daily workout guidance',
      path: ROUTES.workouts,
      cta: 'Create plan',
      tone: 'orange',
      highlighted: true,
    });
  }

  // Priority 2: Nutrition
  if (todayMeals.length === 0) {
    actions.push({
      priority: 2,
      icon: UtensilsCrossed,
      title: 'Log your first meal',
      description: 'You haven\'t logged anything yet today',
      path: ROUTES.nutrition,
      cta: 'Add meal',
      tone: 'blue',
    });
  } else {
    actions.push({
      priority: 2,
      icon: UtensilsCrossed,
      title: 'Nutrition on track',
      description: `${todayMeals.length} meal${todayMeals.length > 1 ? 's' : ''} logged today`,
      path: ROUTES.nutrition,
      completed: true,
      tone: 'green',
    });
  }

  // Priority 3: Weight measurement
  const hasRecentMeasurement = recentMeasurements.length > 0 &&
    (new Date().getTime() - new Date(recentMeasurements[0].date).getTime()) / (1000 * 60 * 60 * 24) < 7;

  if (!hasRecentMeasurement) {
    actions.push({
      priority: 3,
      icon: Scale,
      title: recentMeasurements.length === 0 ? 'Add your first measurement' : 'Log today\'s weight',
      description: recentMeasurements.length === 0
        ? 'Start tracking your body composition'
        : 'Keep your progress data current',
      path: ROUTES.measurements,
      cta: 'Log weight',
      tone: 'blue',
    });
  }

  // Priority 4: Progress photo
  if (progressPhotos.length === 0) {
    actions.push({
      priority: 4,
      icon: Camera,
      title: 'Add progress photo',
      description: 'Capture a visual checkpoint',
      path: ROUTES.progressPhotos,
      cta: 'Take photo',
      tone: 'blue',
    });
  }

  return actions.sort((a, b) => a.priority - b.priority);
}

// Dominant Workout Card Component
function DominantWorkoutCard({
  activeWorkoutPlan,
  todaySession,
  onStartWorkout,
  onGenerateWorkout,
  hasAIAccess,
}) {
  const navigate = useNavigate();

  // State: Workout completed today
  if (todaySession?.status === 'completed') {
    return (
      <div className="rounded-[24px] border border-[hsl(var(--ok)/0.3)] bg-[radial-gradient(circle_at_top_right,hsl(var(--ok)/0.12),transparent_40%),linear-gradient(180deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_100%)] p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--ok)/0.16)]">
                <CheckCircle2 className="h-4 w-4 text-[hsl(var(--ok))]" strokeWidth={2} />
              </div>
              <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[hsl(var(--ok))]">
                Workout Completed
              </p>
            </div>
            <h3 className="mt-3 text-[28px] font-bold tracking-[-0.04em] text-[hsl(var(--fg))] sm:text-[32px]">
              {todaySession.name || 'Today\'s Session'}
            </h3>
            <p className="mt-2 text-[15px] text-[hsl(var(--fg-2))]">
              {todaySession.duration_minutes || 0} min · {todaySession.exercises_completed?.length || 0} exercises · Done for today
            </p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-[20px] border border-[hsl(var(--ok)/0.2)] bg-[hsl(var(--ok)/0.08)] text-[hsl(var(--ok))]">
            <Dumbbell className="h-6 w-6" strokeWidth={2} />
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <Button
            onClick={() => navigate(ROUTES.workouts)}
            variant="outline"
            className="h-12 rounded-[16px] px-6 text-[14px] font-semibold"
          >
            View Summary
          </Button>
        </div>
      </div>
    );
  }

  // State: Has active plan, workout pending
  if (activeWorkoutPlan) {
    const exerciseCount = activeWorkoutPlan.exercises?.length || 0;
    const estimatedDuration = exerciseCount * 8; // Rough estimate: 8 min per exercise

    return (
      <div className="rounded-[24px] border border-[hsl(var(--brand)/0.3)] bg-[radial-gradient(circle_at_top_right,hsl(var(--brand)/0.16),transparent_40%),linear-gradient(180deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_100%)] p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--brand)/0.16)]">
                <Zap className="h-4 w-4 text-[hsl(var(--brand))]" strokeWidth={2} />
              </div>
              <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[hsl(var(--brand))]">
                Today&apos;s Training
              </p>
            </div>
            <h3 className="mt-3 text-[28px] font-bold tracking-[-0.04em] text-[hsl(var(--fg))] sm:text-[32px]">
              {activeWorkoutPlan.name || 'Workout Day'}
            </h3>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-[14px] text-[hsl(var(--fg-2))]">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" strokeWidth={2} />
                ~{estimatedDuration} min
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Dumbbell className="h-4 w-4" strokeWidth={2} />
                {exerciseCount} exercises
              </span>
            </div>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-[20px] border border-[hsl(var(--brand)/0.2)] bg-[hsl(var(--brand)/0.08)] text-[hsl(var(--brand))]">
            <Dumbbell className="h-6 w-6" strokeWidth={2} />
          </div>
        </div>

        {/* Target muscles preview */}
        {activeWorkoutPlan.exercises && activeWorkoutPlan.exercises.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {activeWorkoutPlan.exercises.slice(0, 4).map((ex, i) => (
              <span
                key={i}
                className="inline-flex rounded-full border border-[hsl(var(--border)/0.8)] bg-[hsl(var(--fill)/0.6)] px-3 py-1.5 text-[12px] font-medium text-[hsl(var(--fg-2))]"
              >
                {ex.name}
              </span>
            ))}
            {activeWorkoutPlan.exercises.length > 4 && (
              <span className="inline-flex rounded-full border border-[hsl(var(--border)/0.8)] bg-[hsl(var(--fill)/0.6)] px-3 py-1.5 text-[12px] font-medium text-[hsl(var(--fg-3))]">
                +{activeWorkoutPlan.exercises.length - 4} more
              </span>
            )}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button
            onClick={() => navigate(ROUTES.workouts)}
            className="h-14 rounded-[16px] px-8 text-[15px] font-semibold bg-[hsl(var(--brand))] text-white hover:bg-[hsl(var(--brand)/0.9)]"
          >
            Start Workout
            <ArrowRight className="ml-2 h-4 w-4" strokeWidth={2} />
          </Button>
          {hasAIAccess && (
            <Button
              onClick={onGenerateWorkout}
              variant="outline"
              className="h-14 rounded-[16px] px-6 text-[14px] font-semibold border-[hsl(var(--brand)/0.3)]"
            >
              <Sparkles className="mr-2 h-4 w-4" strokeWidth={2} />
              Adjust with AI
            </Button>
          )}
        </div>
      </div>
    );
  }

  // State: No plan - force creation
  return (
    <div className="rounded-[24px] border border-[hsl(var(--warn)/0.3)] bg-[radial-gradient(circle_at_top_right,hsl(var(--warn)/0.12),transparent_40%),linear-gradient(180deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_100%)] p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--warn)/0.16)]">
              <Target className="h-4 w-4 text-[hsl(var(--warn))]" strokeWidth={2} />
            </div>
            <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[hsl(var(--warn))]">
              Action Required
            </p>
          </div>
          <h3 className="mt-3 text-[28px] font-bold tracking-[-0.04em] text-[hsl(var(--fg))] sm:text-[32px]">
            Build Your Plan First
          </h3>
          <p className="mt-2 max-w-md text-[15px] leading-relaxed text-[hsl(var(--fg-2))]">
            Create a workout plan to unlock daily guidance, tracking, and AI-powered adjustments.
          </p>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-[20px] border border-[hsl(var(--warn)/0.2)] bg-[hsl(var(--warn)/0.08)] text-[hsl(var(--warn))]">
          <Target className="h-6 w-6" strokeWidth={2} />
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button
          onClick={() => navigate(ROUTES.workouts)}
          className="h-14 rounded-[16px] px-8 text-[15px] font-semibold bg-[hsl(var(--warn))] text-white hover:bg-[hsl(var(--warn)/0.9)]"
        >
          Create Workout Plan
          <ArrowRight className="ml-2 h-4 w-4" strokeWidth={2} />
        </Button>
        {hasAIAccess && (
          <Button
            onClick={onGenerateWorkout}
            variant="outline"
            className="h-14 rounded-[16px] px-6 text-[14px] font-semibold border-[hsl(var(--brand)/0.3)]"
          >
            <Sparkles className="mr-2 h-4 w-4 text-[hsl(var(--brand))]" strokeWidth={2} />
            Generate with AI
          </Button>
        )}
      </div>
    </div>
  );
}

// Action-Based Nutrition Card
function ActionNutritionCard({ todayMeals, calorieTarget, macros }) {
  const navigate = useNavigate();
  const hasLoggedMeals = todayMeals.length > 0;
  const totalCalories = todayMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const totalProtein = todayMeals.reduce((sum, m) => sum + (m.protein_g || 0), 0);

  if (!hasLoggedMeals) {
    // Empty state: Action prompt
    return (
      <div className="rounded-[24px] border border-[hsl(var(--border)/0.8)] bg-[hsl(var(--card))] p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">
              Today&apos;s Nutrition
            </p>
            <h3 className="mt-3 text-[22px] font-bold tracking-[-0.03em] text-[hsl(var(--fg))]">
              Nothing logged yet
            </h3>
            <p className="mt-2 text-[14px] text-[hsl(var(--fg-2))]">
              Start by logging your first meal of the day
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-[18px] border border-[hsl(var(--border)/0.8)] bg-[hsl(var(--fill)/0.6)] text-[hsl(var(--fg-2))]">
            <UtensilsCrossed className="h-5 w-5" strokeWidth={2} />
          </div>
        </div>
        <Button
          onClick={() => navigate(ROUTES.nutrition)}
          className="mt-5 h-12 w-full rounded-[16px] text-[14px] font-semibold"
        >
          <Plus className="mr-2 h-4 w-4" strokeWidth={2} />
          Log First Meal
        </Button>
      </div>
    );
  }

  // Active state: Show progress
  const caloriePercentage = calorieTarget > 0 ? Math.round((totalCalories / calorieTarget) * 100) : 0;
  const proteinPercentage = macros?.protein > 0 ? Math.round((totalProtein / macros.protein) * 100) : 0;

  return (
    <div className="rounded-[24px] border border-[hsl(var(--accent-secondary)/0.3)] bg-[radial-gradient(circle_at_top_right,hsl(var(--accent-secondary)/0.08),transparent_40%),linear-gradient(180deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_100%)] p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[hsl(var(--accent-secondary))]">
            Today&apos;s Nutrition
          </p>
          <h3 className="mt-2 text-[28px] font-bold tracking-[-0.04em] text-[hsl(var(--fg))]">
            {totalCalories.toLocaleString()}
            <span className="ml-1 text-[16px] font-medium text-[hsl(var(--fg-3))]">kcal</span>
          </h3>
          <p className="mt-1 text-[14px] text-[hsl(var(--fg-2))]">
            {todayMeals.length} meal{todayMeals.length > 1 ? 's' : ''} logged
          </p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-[18px] border border-[hsl(var(--accent-secondary)/0.2)] bg-[hsl(var(--accent-secondary)/0.08)] text-[hsl(var(--accent-secondary))]">
          <UtensilsCrossed className="h-5 w-5" strokeWidth={2} />
        </div>
      </div>

      {/* Progress bars */}
      {calorieTarget > 0 && (
        <div className="mt-4 space-y-3">
          <div>
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-[hsl(var(--fg-3))]">Calories</span>
              <span className="font-semibold text-[hsl(var(--fg))]">{caloriePercentage}%</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[hsl(var(--fill))]">
              <div
                className="h-full rounded-full bg-[hsl(var(--accent-secondary))] transition-all duration-500"
                style={{ width: `${Math.min(100, caloriePercentage)}%` }}
              />
            </div>
          </div>
          {macros?.protein > 0 && (
            <div>
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-[hsl(var(--fg-3))]">Protein</span>
                <span className="font-semibold text-[hsl(var(--fg))]">{totalProtein}g / {macros.protein}g</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[hsl(var(--fill))]">
                <div
                  className="h-full rounded-full bg-[hsl(var(--ok))] transition-all duration-500"
                  style={{ width: `${Math.min(100, proteinPercentage)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      <Button
        onClick={() => navigate(ROUTES.nutrition)}
        variant="outline"
        className="mt-5 h-11 w-full rounded-[14px] text-[13px] font-semibold"
      >
        Add Another Meal
        <Plus className="ml-2 h-4 w-4" strokeWidth={2} />
      </Button>
    </div>
  );
}

// AI Insight Card (1-2 max)
function AIInsightCard({ insights, loading }) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card className="flex items-center gap-3 border-[hsl(var(--brand)/0.2)] bg-[hsl(var(--brand)/0.02)] p-4">
        <Loader2 className="h-5 w-5 animate-spin text-[hsl(var(--brand))]" strokeWidth={2} />
        <p className="text-[14px] text-[hsl(var(--fg-2))]">Analyzing your day...</p>
      </Card>
    );
  }

  if (!insights || insights.length === 0) {
    return (
      <Card className="border border-dashed border-[hsl(var(--border)/0.8)] bg-[hsl(var(--card))] p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[hsl(var(--fill)/0.6)] text-[hsl(var(--fg-3))]">
            <Sparkles className="h-4 w-4" strokeWidth={2} />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-[hsl(var(--fg))]">Start logging to get insights</p>
            <p className="mt-1 text-[13px] text-[hsl(var(--fg-2))]">
              Log workouts, meals, and measurements to unlock personalized guidance.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {insights.map((insight, idx) => {
        const Icon = insight.icon;
        const toneStyles = {
          urgent: 'border-[hsl(var(--warn)/0.3)] bg-[hsl(var(--warn)/0.06)] text-[hsl(var(--warn))]',
          success: 'border-[hsl(var(--ok)/0.3)] bg-[hsl(var(--ok)/0.06)] text-[hsl(var(--ok))]',
          action: 'border-[hsl(var(--brand)/0.3)] bg-[hsl(var(--brand)/0.06)] text-[hsl(var(--brand))]',
        };

        return (
          <Card
            key={idx}
            className={cn(
              'flex items-start gap-3 p-4 transition-all duration-200 hover:shadow-md',
              toneStyles[insight.type] || toneStyles.action
            )}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-white/50">
              <Icon className="h-4 w-4" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold">{insight.title}</p>
              <p className="mt-0.5 text-[13px] opacity-80">{insight.message}</p>
              {insight.action && (
                <button
                  onClick={() => insight.actionPath && navigate(insight.actionPath)}
                  className="mt-2 inline-flex items-center gap-1 text-[13px] font-semibold underline-offset-2 hover:underline"
                >
                  {insight.action}
                  <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// Priority Action List Item
function PriorityActionItem({ action, index }) {
  const navigate = useNavigate();

  const toneStyles = {
    blue: {
      icon: 'bg-[hsl(var(--brand)/0.12)] text-[hsl(var(--brand))]',
      badge: 'bg-[hsl(var(--brand)/0.12)] text-[hsl(var(--brand))]',
    },
    green: {
      icon: 'bg-[hsl(var(--ok)/0.12)] text-[hsl(var(--ok))]',
      badge: 'bg-[hsl(var(--ok)/0.12)] text-[hsl(var(--ok))]',
    },
    orange: {
      icon: 'bg-[hsl(var(--warn)/0.12)] text-[hsl(var(--warn))]',
      badge: 'bg-[hsl(var(--warn)/0.12)] text-[hsl(var(--warn))]',
    },
  };

  const styles = toneStyles[action.tone] || toneStyles.blue;
  const Icon = action.icon;

  return (
    <div
      onClick={() => navigate(action.path)}
      className={cn(
        'group flex cursor-pointer items-center gap-4 rounded-[18px] border p-4 transition-all duration-200 hover:shadow-md',
        action.highlighted
          ? 'border-[hsl(var(--brand)/0.3)] bg-[hsl(var(--brand)/0.04)]'
          : 'border-[hsl(var(--border)/0.8)] bg-[hsl(var(--card))] hover:border-[hsl(var(--border))]'
      )}
    >
      {/* Priority number */}
      <div className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[14px] font-bold',
        action.completed ? 'bg-[hsl(var(--ok)/0.16)] text-[hsl(var(--ok))]' : styles.badge
      )}>
        {action.completed ? (
          <CheckCircle2 className="h-5 w-5" strokeWidth={2} />
        ) : (
          index + 1
        )}
      </div>

      {/* Icon */}
      <div className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px]',
        action.completed ? 'bg-[hsl(var(--ok)/0.12)] text-[hsl(var(--ok))]' : styles.icon
      )}>
        <Icon className="h-5 w-5" strokeWidth={2} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className={cn(
            'text-[15px] font-semibold',
            action.completed ? 'text-[hsl(var(--ok))]' : 'text-[hsl(var(--fg))]'
          )}>
            {action.title}
          </p>
          {action.completed && (
            <span className="rounded-full bg-[hsl(var(--ok)/0.12)] px-2 py-0.5 text-[11px] font-semibold text-[hsl(var(--ok))]">
              Done
            </span>
          )}
        </div>
        <p className="text-[13px] text-[hsl(var(--fg-2))]">{action.description}</p>
      </div>

      {/* Arrow / CTA */}
      <div className="shrink-0">
        {action.completed ? (
          <ChevronRight className="h-5 w-5 text-[hsl(var(--ok))]" strokeWidth={2} />
        ) : action.cta ? (
          <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-[hsl(var(--brand))]">
            {action.cta}
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
          </span>
        ) : (
          <ChevronRight className="h-5 w-5 text-[hsl(var(--fg-3))] transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
        )}
      </div>
    </div>
  );
}

// Timeline Component with guided empty state
function TodayTimeline({ todaySession, todayMeals, recentMeasurements }) {
  const events = useMemo(() => {
    const items = [];

    // Workout event
    if (todaySession) {
      items.push({
        type: 'workout',
        time: todaySession.completed_at || todaySession.created_at,
        title: todaySession.name || 'Workout',
        status: todaySession.status === 'completed' ? 'Completed' : 'In progress',
        detail: `${todaySession.duration_minutes || 0} min · ${todaySession.exercises_completed?.length || 0} exercises`,
        icon: Dumbbell,
        completed: todaySession.status === 'completed',
      });
    }

    // Meal events
    todayMeals.forEach((meal, i) => {
      items.push({
        type: 'nutrition',
        time: meal.created_at || meal.date,
        title: meal.name || `Meal ${i + 1}`,
        detail: `${meal.calories || 0} kcal · ${meal.protein_g || 0}g protein`,
        icon: UtensilsCrossed,
        completed: true,
      });
    });

    // Measurement event
    if (recentMeasurements.length > 0) {
      const latest = recentMeasurements[0];
      const isToday = new Date(latest.date).toDateString() === new Date().toDateString();
      if (isToday) {
        items.push({
          type: 'measurement',
          time: latest.date,
          title: 'Weight logged',
          detail: `${latest.weight} kg`,
          icon: Scale,
          completed: true,
        });
      }
    }

    // Sort by time
    return items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  }, [todaySession, todayMeals, recentMeasurements]);

  if (events.length === 0) {
    return (
      <Card className="border border-dashed border-[hsl(var(--border)/0.8)] bg-[hsl(var(--card))] p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[hsl(var(--fill)/0.6)] text-[hsl(var(--fg-3))]">
            <CalendarCheck className="h-4 w-4" strokeWidth={2} />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-[hsl(var(--fg))]">Nothing logged yet today</p>
            <p className="mt-1 text-[13px] text-[hsl(var(--fg-2))]">
              Start by logging your first action — workout, meal, or measurement.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-0">
      {events.map((event, idx) => {
        const Icon = event.icon;
        const isLast = idx === events.length - 1;

        return (
          <div key={idx} className="relative flex gap-4">
            {/* Timeline line */}
            {!isLast && (
              <div className="absolute left-5 top-10 h-[calc(100%-24px)] w-px bg-[hsl(var(--border)/0.6)]" />
            )}

            {/* Icon */}
            <div className={cn(
              'relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border',
              event.completed
                ? 'border-[hsl(var(--ok)/0.3)] bg-[hsl(var(--ok)/0.12)] text-[hsl(var(--ok))]'
                : 'border-[hsl(var(--brand)/0.3)] bg-[hsl(var(--brand)/0.12)] text-[hsl(var(--brand))]'
            )}>
              <Icon className="h-4 w-4" strokeWidth={2} />
            </div>

            {/* Content */}
            <div className={cn('pb-6', isLast && 'pb-0')}>
              <p className="text-[14px] font-semibold text-[hsl(var(--fg))]">{event.title}</p>
              <p className="text-[13px] text-[hsl(var(--fg-2))]">{event.detail}</p>
              <p className="mt-0.5 text-[12px] text-[hsl(var(--fg-3))]">
                {formatRelativeDate(event.time)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Main Today Content
function TodayContent() {
  const { user } = useAuth();
  const { can } = useSubscription();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [aiWizardOpen, setAiWizardOpen] = useState(false);
  const [insightsLoading, setInsightsLoading] = useState(false);

  const hasAIAccess = can('atlas_ai');

  // Handle Stripe success redirect — call complete-checkout to write subscription row
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (searchParams.get('subscribed') !== '1' || !sessionId) return;

    // Clean the URL immediately so a refresh doesn't re-trigger
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
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ session_id: sessionId }),
          }
        );
        const data = await res.json();
        if (data?.success) {
          toast.success('Subscription activated! Welcome to Atlas Core Pro.');
          trackEvent('payment_success', { user_id: user?.id, plan: data.plan });
          // Force subscription context to refetch
          queryClient.invalidateQueries({ queryKey: ['subscription-supabase'] });
        } else {
          toast.error('Payment recorded but activation failed. Contact support if access is missing.');
          trackEvent('payment_activation_failed', { user_id: user?.id, error: data?.error });
        }
      } catch {
        toast.success('Payment received! Refreshing your access…');
        queryClient.invalidateQueries({ queryKey: ['subscription-supabase'] });
      }
    })();
  }, []);
  const preferredName = getPreferredName(user?.full_name || user?.email, 'Athlete');

  // Data queries
  const { data: todayMeals = [], isLoading: mealsLoading } = useQuery({
    queryKey: ['today-meals', user?.id],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('food_logs')
        .eq('user_id', user.id)
        .gte('date', `${today}T00:00:00`)
        .lte('date', `${today}T23:59:59`);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: todaySession, isLoading: sessionLoading } = useQuery({
    queryKey: ['today-session', user?.id],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('workout_logs')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: activeWorkoutPlan, isLoading: planLoading } = useQuery({
    queryKey: ['active-workout-plan', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('active', true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: recentMeasurements = [], isLoading: measurementsLoading } = useQuery({
    queryKey: ['recent-measurements', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('measurements')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: progressPhotos = [], isLoading: photosLoading } = useQuery({
    queryKey: ['progress-photos', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('progress_photos')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: lastWorkout } = useQuery({
    queryKey: ['last-workout', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workout_logs')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: profile } = useQuery({
    queryKey: ['user-profile-today', user?.id],
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

  // Generate insights
  const insights = useMemo(() => {
    return generateTodayInsights({
      todaySession,
      todayMeals,
      recentMeasurements,
      activeWorkoutPlan,
      lastWorkoutDate: lastWorkout?.completed_at || lastWorkout?.date,
      profile,
    });
  }, [todaySession, todayMeals, recentMeasurements, activeWorkoutPlan, lastWorkout, profile]);

  // Generate priority actions
  const priorityActions = useMemo(() => {
    return getPriorityActions({
      activeWorkoutPlan,
      todaySession,
      todayMeals,
      recentMeasurements,
      progressPhotos,
    });
  }, [activeWorkoutPlan, todaySession, todayMeals, recentMeasurements, progressPhotos]);

  const handleGenerateWorkout = async () => {
    console.log('[Today] Generate with AI clicked - opening wizard');
    setAiWizardOpen(true);
  };

  const handleAIGenerate = async (answers) => {
    console.log('[Today] AI generate started with answers:', answers);
    try {
      const { data, error } = await supabase.functions.invoke('invoke-llm', {
        body: {
          prompt: `Generate a workout plan for a user with the following profile:
${JSON.stringify(profile, null, 2)}

Additional preferences from wizard:
${JSON.stringify(answers, null, 2)}

Generate a complete workout plan with exercises, sets, reps, and rest periods.`,
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
                    muscle_group: { type: 'string' }
                  }
                }
              },
              duration_minutes: { type: 'number' },
              frequency_per_week: { type: 'number' }
            }
          }
        }
      });

      if (error) throw error;

      console.log('[Today] AI generation result:', data);

      // Save the generated plan
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
          source: 'ai_generated'
        });

        if (saveError) throw saveError;

        toast.success('AI workout plan created successfully!');
        queryClient.invalidateQueries({ queryKey: ['active-workout-plan', user?.id] });
      }
    } catch (err) {
      console.error('[Today] AI generation failed:', err);
      toast.error('Failed to generate workout plan. Please try again.');
    }
  };

  const isLoading = mealsLoading || sessionLoading || planLoading || measurementsLoading || photosLoading;

  if (isLoading) {
    return (
      <TodayScreen>
        <div className="flex h-96 items-center justify-center">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--brand))]" strokeWidth={2} />
            <p className="text-[15px] text-[hsl(var(--fg-2))]">Loading your day...</p>
          </div>
        </div>
      </TodayScreen>
    );
  }

  return (
    <TodayScreen>
      {/* New Header Section */}
      <header className="space-y-2">
        <p className="text-[13px] font-medium text-[hsl(var(--fg-3))]">{getDateLabel()}</p>
        <h1 className="text-[32px] font-bold tracking-[-0.04em] text-[hsl(var(--fg))] sm:text-[40px]">
          Here&apos;s your plan for today
        </h1>
        <p className="max-w-xl text-[16px] leading-relaxed text-[hsl(var(--fg-2))]">
          Stay on track: complete your workout, log your meals, and hit your targets.
        </p>
      </header>

      {/* Dominant Workout Card */}
      <section className="pt-2">
        <DominantWorkoutCard
          activeWorkoutPlan={activeWorkoutPlan}
          todaySession={todaySession}
          onStartWorkout={() => navigate(ROUTES.workouts)}
          onGenerateWorkout={handleGenerateWorkout}
          hasAIAccess={hasAIAccess}
        />
      </section>

      {/* Secondary Row: Nutrition + Quick Stats */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ActionNutritionCard
          todayMeals={todayMeals}
          calorieTarget={profile?.targets?.calories}
          macros={profile?.targets}
        />

        {/* Quick Adherence Card */}
        <TodayCard className="flex flex-col justify-between p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">
                Today&apos;s Progress
              </p>
              <p className="mt-2 text-[32px] font-bold tracking-[-0.04em] text-[hsl(var(--fg))]">
                {(() => {
                  let completed = 0;
                  let total = 3;
                  if (todaySession?.status === 'completed') completed++;
                  if (todayMeals.length > 0) completed++;
                  const hasRecentMeasurement = recentMeasurements.length > 0 &&
                    (new Date().getTime() - new Date(recentMeasurements[0].date).getTime()) / (1000 * 60 * 60 * 24) < 7;
                  if (hasRecentMeasurement) completed++;
                  return `${completed}/${total}`;
                })()}
              </p>
            </div>
            <button
              onClick={() => setCheckinOpen(true)}
              className="flex h-12 w-12 items-center justify-center rounded-[16px] border border-[hsl(var(--border)/0.8)] bg-[hsl(var(--fill)/0.6)] text-[hsl(var(--fg-2))] transition-all hover:scale-105 active:scale-95"
            >
              <CalendarCheck className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>
          <div className="mt-4">
            <div className="flex items-center gap-2">
              {todaySession?.status === 'completed' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--ok)/0.12)] px-2.5 py-1 text-[12px] font-semibold text-[hsl(var(--ok))]">
                  <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} />
                  Workout
                </span>
              )}
              {todayMeals.length > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--ok)/0.12)] px-2.5 py-1 text-[12px] font-semibold text-[hsl(var(--ok))]">
                  <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} />
                  Nutrition
                </span>
              )}
              {recentMeasurements.length > 0 &&
                (new Date().getTime() - new Date(recentMeasurements[0].date).getTime()) / (1000 * 60 * 60 * 24) < 7 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--ok)/0.12)] px-2.5 py-1 text-[12px] font-semibold text-[hsl(var(--ok))]">
                  <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} />
                  Weight
                </span>
              )}
            </div>
          </div>
        </TodayCard>
      </section>

      {/* AI Insights Section */}
      <TodaySection title="AI Insights" description="Personalized guidance based on your data">
        <AIInsightCard insights={insights} loading={insightsLoading} />
      </TodaySection>

      {/* Priority Actions Section */}
      <TodaySection title="Priority Actions" description="Complete these to stay on track today">
        <div className="space-y-3">
          {priorityActions.map((action, index) => (
            <PriorityActionItem key={action.priority} action={action} index={index} />
          ))}
        </div>
      </TodaySection>

      {/* Timeline Section */}
      <TodaySection title="Today&apos;s Timeline" description="Your activity so far">
        <TodayTimeline
          todaySession={todaySession}
          todayMeals={todayMeals}
          recentMeasurements={recentMeasurements}
        />
      </TodaySection>

      {/* Weekly Checkin Modal */}
      <WeeklyCheckinModal
        open={checkinOpen}
        onClose={() => setCheckinOpen(false)}
      />

      {/* AI Generate Wizard */}
      <AIGenerateWizard
        open={aiWizardOpen}
        onClose={() => setAiWizardOpen(false)}
        type="workout"
        profile={profile}
        onGenerate={handleAIGenerate}
      />
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
