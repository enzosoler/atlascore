/**
 * TodayV2 — State-machine layout.
 * Zone 1 fills the viewport. Only one block owns it at a time.
 * Secondary content lives below the fold (scroll to see).
 */

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, Sparkles, X, ArrowRight, Flame } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/lib/i18nContext';
import { useDailyStateV2 } from '@/hooks/useDailyStateV2';
import { useAICoach } from '@/hooks/useAICoach';
import { getDailyCheckin, listDailyCheckins } from '@/services/checkinService';
import { supabase } from '@/lib/supabaseClient';
import { getToday } from '@/lib/atlas-theme';
import { ROUTES } from '@/lib/routes';
import CoachChatSheet from '@/components/ai/CoachChatSheet';
import PaywallTrigger from '@/components/entitlements/PaywallTrigger';
import { cn } from '@/lib/utils';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getFirstName(fullName) {
  if (!fullName) return '';
  const [first] = String(fullName).split(/[\s@._-]+/).filter(Boolean);
  if (!first) return '';
  const clean = first.replace(/\d+$/u, '') || first;
  return `${clean.charAt(0).toLocaleUpperCase()}${clean.slice(1)}`;
}

function getGreetingWord() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'Morning';
  if (h >= 12 && h < 17) return 'Afternoon';
  if (h >= 17 && h < 21) return 'Evening';
  return 'Hey';
}

function getDateLabel(locale) {
  const intlLocale = locale === 'pt-BR' ? 'pt-BR' : locale === 'es' ? 'es' : 'en-US';
  return new Intl.DateTimeFormat(intlLocale, {
    weekday: 'short', month: 'short', day: 'numeric',
  }).format(new Date());
}

function calcStreak(checkins = []) {
  if (!checkins.length) return 0;
  const sorted = [...checkins].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  let streak = 0;
  for (let i = 0; i < 60; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (sorted.some(c => c.date === dateStr)) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

/** Returns urgency level for the streak pill based on time of day and check-in status. */
function getStreakUrgency(todayCheckinExists) {
  if (todayCheckinExists) return 'done';
  const h = new Date().getHours();
  if (h >= 21) return 'urgent';   // 9pm+: pulsing warn
  if (h >= 17) return 'warming';  // 5pm–9pm: warm tint
  return 'normal';
}

/** Returns the current week's Mon–Sun date strings. */
function getWeekDates() {
  const today = new Date();
  const dow = today.getDay(); // 0=Sun
  const mondayOffset = (dow === 0 ? -6 : 1 - dow);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + mondayOffset + i);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

// ─── Sub-components ──────────────────────────────────────────────────────────

function StreakPill({ streak, urgency }) {
  if (streak < 1) return null;

  const pillClass = cn(
    'flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-bold transition-colors duration-300',
    urgency === 'done'    && 'bg-[hsl(var(--brand)/0.12)] text-[hsl(var(--brand))]',
    urgency === 'normal'  && 'bg-[hsl(var(--fg-3)/0.12)] text-[hsl(var(--fg-3))]',
    urgency === 'warming' && 'bg-[hsl(var(--warn)/0.12)] text-[hsl(var(--warn))]',
    urgency === 'urgent'  && 'bg-[hsl(var(--warn)/0.12)] text-[hsl(var(--warn))] animate-pulse',
  );

  return (
    <div className={pillClass}>
      🔥 <span>{streak}</span>
    </div>
  );
}

function ChainDots({ checkinDates }) {
  const weekDates = getWeekDates();
  const checkinSet = new Set(checkinDates);
  const todayStr = getToday();

  return (
    <div className="flex items-center justify-between gap-1 px-1">
      {weekDates.map((date, i) => {
        const isDone = checkinSet.has(date);
        const isToday = date === todayStr;
        return (
          <div key={date} className="flex flex-col items-center gap-1.5">
            <div className={cn(
              'w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-200',
              isDone
                ? 'bg-[hsl(var(--brand))] border-[hsl(var(--brand))]'
                : isToday
                  ? 'border-[hsl(var(--brand)/0.5)] bg-transparent animate-pulse'
                  : 'border-[hsl(var(--border))] bg-transparent'
            )}>
              {isDone && <span className="text-white text-[10px] font-bold">✓</span>}
            </div>
            <span className={cn(
              'text-[10px] font-semibold uppercase tracking-wide',
              isToday ? 'text-[hsl(var(--brand))]' : 'text-[hsl(var(--fg-3))]'
            )}>
              {DAY_LABELS[i]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** Zone 1 — State B: workout card */
function ZoneWorkout({ plan }) {
  const exercises = plan.todayExercises?.slice(0, 3) || [];
  return (
    <Link to={ROUTES.workouts} className="block h-full">
      <div className="flex flex-col h-full rounded-[18px] bg-[hsl(var(--card))] border border-[hsl(var(--brand)/0.2)] border-t-[hsl(var(--brand))] overflow-hidden active:scale-[0.985] transition-transform duration-100">
        <div className="px-5 pt-5 pb-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[hsl(var(--fg-3))] mb-1">
            {plan.name || 'Today'}
          </p>
          <h2 className="text-[22px] font-bold tracking-[-0.03em] text-[hsl(var(--fg))] leading-[1.2]">
            {plan.todayDayLabel || 'Workout'}
          </h2>
          {plan.todayDayIndex != null && plan.totalDays > 0 && (
            <p className="text-[13px] text-[hsl(var(--fg-3))] mt-0.5">
              Day {plan.todayDayIndex + 1} of {plan.totalDays}
            </p>
          )}
        </div>

        {exercises.length > 0 && (
          <div className="px-5 py-3 flex-1 space-y-2.5">
            {exercises.map((ex, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-5 text-[11px] font-bold text-[hsl(var(--fg-3))] text-right shrink-0">{i + 1}</span>
                <span className="text-[14px] font-medium text-[hsl(var(--fg))] flex-1 truncate">{ex.name || ex.exercise_name || ex}</span>
                {(ex.sets || ex.reps) && (
                  <span className="text-[12px] font-mono text-[hsl(var(--fg-3))] shrink-0">
                    {ex.sets && `${ex.sets}×`}{ex.reps}
                  </span>
                )}
              </div>
            ))}
            {plan.todayExercises?.length > 3 && (
              <p className="text-[12px] text-[hsl(var(--fg-3))] pl-8">
                +{plan.todayExercises.length - 3} more exercises
              </p>
            )}
          </div>
        )}

        <div className="px-5 pb-5 pt-3">
          <div className="flex items-center justify-center gap-2 h-12 rounded-[12px] bg-[hsl(var(--brand))] text-white font-semibold text-[15px] tracking-[-0.01em]">
            Start workout
            <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
          </div>
        </div>
      </div>
    </Link>
  );
}

/** Zone 1 — State C: calorie remaining hero */
function ZoneCalories({ nutrition, firstName }) {
  const { caloriesTarget, caloriesConsumed, proteinTarget, proteinConsumed } = nutrition;
  const hasTarget = caloriesTarget > 0;
  const remaining = Math.max(0, caloriesTarget - caloriesConsumed);
  const proteinRemaining = Math.max(0, proteinTarget - proteinConsumed);
  const pctEaten = hasTarget ? Math.min(1, caloriesConsumed / caloriesTarget) : 0;

  return (
    <Link to={ROUTES.nutrition} className="block h-full">
      <div className="flex flex-col justify-between h-full rounded-[18px] bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-6 active:scale-[0.985] transition-transform duration-100">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[hsl(var(--fg-3))] mb-4">
            Nutrition
          </p>

          {hasTarget ? (
            <>
              <p className="text-[56px] font-bold tracking-[-0.04em] text-[hsl(var(--brand))] leading-none">
                {remaining.toLocaleString()}
              </p>
              <p className="text-[15px] text-[hsl(var(--fg-2))] mt-1">kcal remaining</p>
              <p className="text-[13px] text-[hsl(var(--fg-3))] mt-0.5">
                {caloriesConsumed} eaten · {caloriesTarget} your target
              </p>
            </>
          ) : (
            <>
              {caloriesConsumed > 0 ? (
                <>
                  <p className="text-[56px] font-bold tracking-[-0.04em] text-[hsl(var(--fg))] leading-none">
                    {caloriesConsumed.toLocaleString()}
                  </p>
                  <p className="text-[15px] text-[hsl(var(--fg-2))] mt-1">kcal eaten today</p>
                </>
              ) : (
                <>
                  <p className="text-[28px] font-bold tracking-[-0.03em] text-[hsl(var(--fg))] leading-[1.2]">
                    No meals logged yet.
                  </p>
                  <p className="text-[15px] text-[hsl(var(--fg-3))] mt-2">
                    Start tracking to see your numbers.
                  </p>
                </>
              )}
              <p className="text-[12px] text-[hsl(var(--warn))] mt-3 font-medium">
                Set your calorie target in Profile → Goals
              </p>
            </>
          )}
        </div>

        {/* Macro quick stats */}
        <div className="space-y-3 mt-6">
          {hasTarget && (
            <div className="h-1.5 w-full rounded-full bg-[hsl(var(--border))] overflow-hidden">
              <div
                className="h-full rounded-full bg-[hsl(var(--brand))] transition-all duration-500"
                style={{ width: `${pctEaten * 100}%` }}
              />
            </div>
          )}
          {proteinTarget > 0 && (
            <p className="text-[13px] text-[hsl(var(--fg-3))]">
              <span className="text-[hsl(var(--fg-2))] font-medium">{proteinRemaining}g protein</span> left today
            </p>
          )}
          <div className="flex items-center justify-center gap-2 h-12 rounded-[12px] bg-[hsl(var(--brand))] text-white font-semibold text-[15px]">
            {caloriesConsumed > 0 ? 'Log meal' : 'Log your first meal'}
          </div>
        </div>
      </div>
    </Link>
  );
}

/** Zone 1 — State D: all done */
function ZoneOnTrack({ streak, firstName }) {
  return (
    <div className="flex flex-col justify-between h-full rounded-[18px] bg-[hsl(var(--ok)/0.06)] border border-[hsl(var(--ok)/0.2)] p-5">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[hsl(var(--ok))] mb-4">
          Today
        </p>
        <h2 className="text-[28px] font-bold tracking-[-0.03em] text-[hsl(var(--fg))] leading-[1.2]">
          Everything&apos;s green today.
        </h2>
        {firstName && (
          <p className="text-[15px] text-[hsl(var(--fg-2))] mt-2">
            You showed up, {firstName}.
          </p>
        )}
      </div>
      {streak > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-[12px] bg-[hsl(var(--ok)/0.1)]">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="text-[20px] font-bold text-[hsl(var(--fg))] leading-none">{streak}</p>
              <p className="text-[11px] text-[hsl(var(--fg-3))]">day streak</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Zone 1 — Fallback: calorie hero (no workout scheduled) */
function ZoneFallback({ nutrition, firstName }) {
  return <ZoneCalories nutrition={nutrition} firstName={firstName} />;
}

/** Zone 2 — Proactive AI card */
function ProactiveAICard({ message, onOpenChat, onDismiss, streak, firstName }) {
  if (!message) return null;

  return (
    <div className="rounded-[18px] bg-[hsl(var(--card))] border border-[hsl(var(--brand-ai)/0.25)] border-l-[3px] border-l-[hsl(var(--brand-ai))] p-4">
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5 w-7 h-7 rounded-lg bg-[hsl(var(--brand-ai)/0.1)] flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-[hsl(var(--brand-ai))]" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[hsl(var(--brand-ai))] mb-1.5">
            {streak > 14 && firstName ? `${firstName}'s coach` : 'Your coach'}
          </p>
          <p className="text-[14px] text-[hsl(var(--fg))] leading-[1.5]">{message}</p>
          {onOpenChat && (
            <button
              onClick={onOpenChat}
              className="mt-2.5 text-[13px] font-semibold text-[hsl(var(--brand-ai))] active:opacity-70"
            >
              Continue conversation →
            </button>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="shrink-0 text-[hsl(var(--fg-3))] active:opacity-70 p-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Content ─────────────────────────────────────────────────────────────

function TodayContent() {
  const { user } = useAuth();
  const { locale } = useI18n();
  const [chatOpen, setChatOpen] = useState(false);
  const [aiDismissed, setAiDismissed] = useState(false);
  const [streakCelebrationDismissed, setStreakCelebrationDismissed] = useState(false);
  const today = getToday();
  const uid = user?.id;

  const daily = useDailyStateV2();
  const ai = useAICoach({ userId: uid });

  // Today's check-in
  const { data: todayCheckin } = useQuery({
    queryKey: ['daily-checkin', uid, today],
    queryFn: () => getDailyCheckin(uid, today),
    enabled: !!uid,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // Last 30 check-ins (for streak + chain dots)
  const { data: recentCheckins = [] } = useQuery({
    queryKey: ['daily-checkins-streak', uid],
    queryFn: () => listDailyCheckins(uid, { limit: 35 }),
    enabled: !!uid,
    staleTime: 60_000,
  });

  // Proactive insight from coach_memory
  const { data: coachMemory } = useQuery({
    queryKey: ['coach-memory-insight', uid],
    queryFn: async () => {
      const { data } = await supabase
        .from('coach_memory')
        .select('proactive_insight, proactive_insight_generated_at')
        .eq('user_id', uid)
        .maybeSingle();
      return data;
    },
    enabled: !!uid,
    staleTime: 120_000,
    refetchOnWindowFocus: true,
  });

  const safeDaily = daily || {};
  const safePlan = safeDaily.plan || {};
  const safeNutrition = safeDaily.nutrition || {};

  const firstName = useMemo(
    () => getFirstName(safeDaily.preferredName),
    [safeDaily.preferredName]
  );
  const greetingWord = getGreetingWord();
  const dateLabel = getDateLabel(locale);

  const streak = useMemo(() => calcStreak(recentCheckins), [recentCheckins]);
  const checkinDates = useMemo(() => recentCheckins.map(c => c.date), [recentCheckins]);
  const hasCheckin = !!todayCheckin;
  const streakUrgency = getStreakUrgency(hasCheckin);

  // ── Zone 1 state machine ──────────────────────────────────────────────────
  // P1 (check-in gate) is handled by DailyCheckinGate overlay in AppLayout.
  // Here we determine Zone 1 from P2–P4.
  const caloriesOff = Math.abs(
    (safeNutrition.caloriesTarget || 0) - (safeNutrition.caloriesConsumed || 0)
  ) > 200;
  const hasPlan = !!safePlan.id;
  const workoutStarted = safeDaily.workout?.planned;
  const workoutDone = safeDaily.workoutDone;
  const allDone = hasCheckin && workoutDone && !caloriesOff;

  let zone1State;
  if (hasCheckin && !workoutStarted && hasPlan) {
    zone1State = 'workout';
  } else if (hasCheckin && workoutDone && caloriesOff) {
    zone1State = 'calories';
  } else if (allDone) {
    zone1State = 'ontrack';
  } else {
    zone1State = 'fallback';
  }

  // ── Streak milestones & recovery ────────────────────────────────────────
  const MILESTONE_THRESHOLDS = [3, 7, 14, 30];
  const streakMilestone = MILESTONE_THRESHOLDS.includes(streak) ? streak : null;
  const showMilestoneCelebration = !!streakMilestone && !streakCelebrationDismissed;

  // Adaptive subtitle based on check-in data
  const adaptiveSubtitle = useMemo(() => {
    if (!todayCheckin) return null;
    const energy = todayCheckin.energy;
    const mood = todayCheckin.mood;
    if (energy && energy <= 2) return 'Low energy today — protect the essentials.';
    if (energy && energy >= 4) return 'High energy. Make today count.';
    if (mood && mood <= 2) return 'Rough day. One step at a time.';
    return null;
  }, [todayCheckin]);

  // ── Proactive AI message (from coach_memory, fallback to ai.briefing) ────
  const insightAge = coachMemory?.proactive_insight_generated_at
    ? Date.now() - new Date(coachMemory.proactive_insight_generated_at).getTime()
    : Infinity;
  const insightFresh = insightAge < 24 * 60 * 60 * 1000; // < 24h old
  const proactiveMessage = (insightFresh && coachMemory?.proactive_insight) || ai?.briefing?.message || null;
  const showAICard = !aiDismissed && !!proactiveMessage;

  return (
    <div className="min-h-full bg-transparent text-[hsl(var(--fg))] atlas-page-enter">
      <div className="mx-auto flex w-full max-w-[640px] flex-col px-4 pt-4 pb-12 sm:px-6">

        {/* ── Chrome ───────────────────────────────────────────────────────── */}
        <header className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[hsl(var(--fg-3))]">
              {dateLabel}
            </p>
            <h1 className="text-[22px] font-bold tracking-[-0.03em] text-[hsl(var(--fg))] leading-[1.2]">
              {greetingWord}{firstName ? `, ${firstName}` : ''}
            </h1>
            {adaptiveSubtitle && (
              <p className="text-[13px] text-[hsl(var(--fg-3))] mt-0.5">{adaptiveSubtitle}</p>
            )}
          </div>
          <StreakPill streak={streak} urgency={streakUrgency} />
        </header>

        {/* ── Streak milestone celebration ──────────────────────────────── */}
        {showMilestoneCelebration && (
          <div className="mb-4 rounded-[18px] bg-[hsl(var(--brand)/0.06)] border border-[hsl(var(--brand)/0.2)] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl atlas-streak-pulse inline-block">🔥</span>
                <div>
                  <p className="text-[16px] font-bold text-[hsl(var(--fg))]">
                    <span className="atlas-odometer-flip">{streakMilestone}</span> days.{' '}
                    {streakMilestone === 3 && 'You showed up.'}
                    {streakMilestone === 7 && 'One week. Consistent.'}
                    {streakMilestone === 14 && 'Two weeks. The habit is forming.'}
                    {streakMilestone === 30 && 'One month. This is who you are now.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setStreakCelebrationDismissed(true)}
                className="text-[hsl(var(--fg-3))] p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── Streak paywall trigger (3-day) ────────────────────────────── */}
        {streak === 3 && (
          <div className="mb-4">
            <PaywallTrigger trigger="streak" show={streak >= 3} />
          </div>
        )}

        {/* ── Streak recovery (broken) ─────────────────────────────────── */}
        {streak === 0 && recentCheckins.length > 0 && !hasCheckin && (
          <div className="mb-4 rounded-[18px] bg-[hsl(var(--err)/0.06)] border border-[hsl(var(--err)/0.15)] p-4">
            <p className="text-[14px] text-[hsl(var(--fg))]">
              <span className="text-[hsl(var(--err))] font-semibold">Streak reset.</span>{' '}
              Start again today.
            </p>
          </div>
        )}

        {/* ── Zone 1 — fills viewport ────────────────────────────────────── */}
        <div className="min-h-[calc(100svh-160px)] sm:min-h-0 sm:h-auto mb-6">
          {zone1State === 'workout' && <ZoneWorkout plan={safePlan} />}
          {zone1State === 'calories' && <ZoneCalories nutrition={safeNutrition} firstName={firstName} />}
          {zone1State === 'ontrack' && <ZoneOnTrack streak={streak} firstName={firstName} />}
          {zone1State === 'fallback' && <ZoneFallback nutrition={safeNutrition} firstName={firstName} />}
        </div>

        {/* ── Zone 2 — Proactive AI card ─────────────────────────────────── */}
        {showAICard && (
          <div className="mb-5">
            <ProactiveAICard
              message={proactiveMessage}
              onOpenChat={() => setChatOpen(true)}
              onDismiss={() => setAiDismissed(true)}
              streak={streak}
              firstName={firstName}
            />
          </div>
        )}

        {/* ── Zone 3 — 7-day chain dots ──────────────────────────────────── */}
        <div className="mb-6 rounded-[18px] bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[hsl(var(--fg-3))] mb-3">
            This week
          </p>
          <ChainDots checkinDates={checkinDates} />
        </div>

        {/* ── Milestone memory banners ────────────────────────────────── */}
        {safeDaily.recentSessions?.length === 1 && safeDaily.workoutDone && (
          <MilestoneBanner text="First workout logged — your journey starts today." />
        )}

        {/* ── Zone 4 — Secondary (scroll only) ──────────────────────────── */}
        {/* Nutrition summary card (if workout is Zone 1, show nutrition summary below) */}
        {zone1State === 'workout' && safeNutrition.caloriesTarget > 0 && (
          <Link to={ROUTES.nutrition} className="block mb-4">
            <div className="rounded-[18px] bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[hsl(var(--fg-3))]">Nutrition</p>
                <p className="text-[13px] font-semibold text-[hsl(var(--brand))]">
                  {Math.max(0, safeNutrition.caloriesTarget - safeNutrition.caloriesConsumed)} kcal left
                </p>
              </div>
              <MacroRow label="Protein" consumed={safeNutrition.proteinConsumed} target={safeNutrition.proteinTarget} color="var(--brand)" />
            </div>
          </Link>
        )}

      </div>

      <CoachChatSheet open={chatOpen} onOpenChange={setChatOpen} />
    </div>
  );
}

function MilestoneBanner({ text }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div className="mb-4 rounded-[18px] bg-[hsl(var(--brand)/0.06)] border border-[hsl(var(--brand)/0.15)] p-4 flex items-center justify-between">
      <p className="text-[14px] text-[hsl(var(--fg))] leading-[1.4]">{text}</p>
      <button onClick={() => setDismissed(true)} className="shrink-0 text-[hsl(var(--fg-3))] p-1 ml-2">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function MacroRow({ label, consumed, target, color }) {
  const pct = target > 0 ? Math.min(1, consumed / target) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[12px]">
        <span className="text-[hsl(var(--fg-2))]">{label}</span>
        <span className="text-[hsl(var(--fg-3))]">{consumed}g / {target}g</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-[hsl(var(--border))] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct * 100}%`, background: `hsl(${color})` }}
        />
      </div>
    </div>
  );
}

export default function TodayV2() {
  return <TodayContent />;
}
