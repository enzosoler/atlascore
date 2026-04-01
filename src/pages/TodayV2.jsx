/**
 * TodayV2 — High-end iPhone experience.
 * Original design preserved. New plan features layered on top:
 * streak pill, chain dots, proactive AI card, adaptive greeting, milestones.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Dumbbell, UtensilsCrossed, Scale, Target, Camera,
  ArrowRight, Sparkles, ChevronRight, X
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { useI18n, useT } from '@/lib/i18nContext';
import { useDailyStateV2 } from '@/hooks/useDailyStateV2';
import { useAICoach } from '@/hooks/useAICoach';
import { buildBriefing, buildRecommendations } from '@/lib/rulesEngine';
import { ROUTES } from '@/lib/routes';
import { TodayScreen } from '@/components/today/TodayMobileUI';
import BodyCheckinSheet from '@/components/body/BodyCheckinSheet';
import CoachChatTrigger from '@/components/ai/CoachChatTrigger';
import CoachChatSheet from '@/components/ai/CoachChatSheet';
import { useCoachChat } from '@/hooks/useCoachChat';
import PaywallTrigger from '@/components/entitlements/PaywallTrigger';
import { getDailyCheckin, listDailyCheckins } from '@/services/checkinService';
import { getToday } from '@/lib/atlas-theme';
import { supabase } from '@/lib/supabaseClient';
import { cn } from '@/lib/utils';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDateLabel(locale) {
  const intlLocale = locale === 'pt-BR' ? 'pt-BR' : locale === 'es' ? 'es' : 'en-US';
  return new Intl.DateTimeFormat(intlLocale, {
    weekday: 'long', month: 'long', day: 'numeric',
  }).format(new Date());
}

function getFirstName(fullName) {
  if (!fullName) return '';
  const [first] = String(fullName).split(/[\s@._-]+/).filter(Boolean) || [];
  if (!first) return '';
  const clean = first.replace(/\d+$/u, '') || first;
  return `${clean.charAt(0).toLocaleUpperCase()}${clean.slice(1)}`;
}

function getGreeting(fullName, t) {
  const name = getFirstName(fullName) || t('common.athlete');
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return t('today.greeting.morning', { name });
  if (h >= 12 && h < 17) return t('today.greeting.afternoon', { name });
  if (h >= 17 && h < 21) return t('today.greeting.evening', { name });
  return t('today.greeting.late', { name });
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

function getStreakUrgency(todayCheckinExists) {
  if (todayCheckinExists) return 'done';
  const h = new Date().getHours();
  if (h >= 21) return 'urgent';
  if (h >= 17) return 'warming';
  return 'normal';
}

function getWeekDates() {
  const today = new Date();
  const dow = today.getDay();
  const mondayOffset = (dow === 0 ? -6 : 1 - dow);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + mondayOffset + i);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

// ─── New plan components ─────────────────────────────────────────────────────

function StreakPill({ streak, urgency }) {
  if (streak < 1) return null;
  return (
    <div className={cn(
      'flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-bold transition-colors duration-300',
      urgency === 'done'    && 'bg-[hsl(var(--brand)/0.12)] text-[hsl(var(--brand))]',
      urgency === 'normal'  && 'bg-[hsl(var(--fg-3)/0.12)] text-[hsl(var(--fg-3))]',
      urgency === 'warming' && 'bg-[hsl(var(--warn)/0.12)] text-[hsl(var(--warn))]',
      urgency === 'urgent'  && 'bg-[hsl(var(--warn)/0.12)] text-[hsl(var(--warn))] animate-pulse',
    )}>
      🔥 <span>{streak}</span>
    </div>
  );
}

function ChainDots({ checkinDates }) {
  const t = useT();
  const weekDates = getWeekDates();
  const checkinSet = new Set(checkinDates);
  const todayStr = getToday();

  return (
    <div className="rounded-[18px] bg-[hsl(var(--card))] border border-[hsl(var(--border)/0.5)] p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[hsl(var(--fg-3))] mb-3">{t('today.this_week')}</p>
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
    </div>
  );
}

function ProactiveAICard({ message, onOpenChat, onDismiss, streak, firstName }) {
  const t = useT();
  if (!message) return null;
  const coachLabel = streak > 14 && firstName ? t('today.coach_of', { name: firstName }) : t('today.your_coach');
  return (
    <div className="rounded-[18px] bg-[hsl(var(--card))] border border-[hsl(var(--brand-ai)/0.25)] border-l-[3px] border-l-[hsl(var(--brand-ai))] p-4">
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5 w-7 h-7 rounded-lg bg-[hsl(var(--brand-ai)/0.1)] flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-[hsl(var(--brand-ai))]" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[hsl(var(--brand-ai))] mb-1.5">
            {coachLabel}
          </p>
          <p className="text-[14px] text-[hsl(var(--fg))] leading-[1.5]">{message}</p>
          {onOpenChat && (
            <button onClick={onOpenChat} className="mt-2.5 text-[13px] font-semibold text-[hsl(var(--brand-ai))] active:opacity-70">
              {t('today.continue_conversation')}
            </button>
          )}
        </div>
        {onDismiss && (
          <button onClick={onDismiss} className="shrink-0 text-[hsl(var(--fg-3))] active:opacity-70 p-0.5">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Original components (preserved) ─────────────────────────────────────────

function Header({ weather, greeting, locale, streak, streakUrgency, adaptiveSubtitle }) {
  return (
    <header className="flex items-end justify-between px-0.5">
      <div className="space-y-0.5">
        <p className="text-[13px] font-medium text-[hsl(var(--fg-3))] uppercase tracking-tight">
          {getDateLabel(locale)}
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-[hsl(var(--fg))]">
          {greeting}
        </h1>
        {adaptiveSubtitle && (
          <p className="text-[13px] text-[hsl(var(--fg-3))] mt-0.5">{adaptiveSubtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-2 mb-1">
        <StreakPill streak={streak} urgency={streakUrgency} />
        {weather && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[hsl(var(--fill)/0.4)] border border-[hsl(var(--border)/0.5)]">
            <span className="text-sm">{weather.icon}</span>
            <span className="text-[13px] font-semibold text-[hsl(var(--fg-2))]">{weather.temp}°</span>
          </div>
        )}
      </div>
    </header>
  );
}

function PrimaryAction({ action, briefingText, kcalRemaining }) {
  const t = useT();
  if (!action) return null;

  return (
    <Link to={action.path} className="group block">
      <div className="relative overflow-hidden rounded-[24px] bg-zinc-950 dark:bg-white p-6 shadow-2xl transition-all duration-300 active:scale-[0.98] active:brightness-90">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[hsl(var(--brand)/0.15)] dark:bg-[hsl(var(--brand)/0.08)] blur-3xl" />
        <div className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-[hsl(var(--brand-ai)/0.1)] dark:bg-[hsl(var(--brand-ai)/0.05)] blur-3xl" />

        <div className="relative z-10 flex flex-col gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="flex h-1.5 w-1.5 rounded-full bg-[hsl(var(--brand))]" />
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-white/50 dark:text-zinc-950/50">
                {action.label}
              </p>
            </div>
            <h2 className="text-[21px] font-bold leading-[1.15] tracking-tight text-white dark:text-zinc-950">
              {briefingText}
            </h2>
          </div>

          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 dark:bg-zinc-950/5 border border-white/10 dark:border-zinc-950/10 backdrop-blur-md">
              <span className="text-[12px] font-bold text-white/90 dark:text-zinc-950/90">
                {kcalRemaining > 0 ? t('today.kcal_remaining', { n: kcalRemaining }) : t('today.daily_target_met')}
              </span>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white dark:bg-zinc-950 text-zinc-950 dark:text-white shadow-xl transition-transform group-hover:translate-x-1">
              <ArrowRight className="h-5 w-5" strokeWidth={3} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function QuickAction({ to, icon: Icon, label, status, colorClass }) {
  return (
    <Link to={to} className="group block">
      <div className="flex h-full flex-col justify-between rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border)/0.5)] p-4 shadow-sm transition-all duration-200 active:bg-[hsl(var(--fill)/0.5)] active:scale-[0.96]">
        <div className={cn("mb-3 flex h-10 w-10 items-center justify-center rounded-xl", colorClass)}>
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
        <div className="space-y-0.5">
          <p className="text-[14px] font-bold text-[hsl(var(--fg))]">{label}</p>
          <p className="text-[11px] font-medium text-[hsl(var(--fg-3))]">{status}</p>
        </div>
      </div>
    </Link>
  );
}

function RecommendationCard({ rec }) {
  return (
    <Link to={rec.actionPath || '#'} className="block">
      <div className="flex items-center gap-4 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border)/0.5)] p-4 shadow-sm active:bg-[hsl(var(--fill)/0.5)] transition-all">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--brand)/0.08)] text-[hsl(var(--brand))]">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-[hsl(var(--fg))] truncate">{rec.title}</p>
          <p className="text-[12px] text-[hsl(var(--fg-2))] line-clamp-1 mt-0.5">{rec.reason}</p>
        </div>
        <ChevronRight className="h-4 w-4 text-[hsl(var(--fg-3))]" strokeWidth={2.5} />
      </div>
    </Link>
  );
}

// ─── Main Content ─────────────────────────────────────────────────────────────

function TodayContent() {
  const { user } = useAuth();
  const { locale } = useI18n();
  const t = useT();
  const [weather, setWeather] = useState(null);
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [aiDismissed, setAiDismissed] = useState(false);
  const [streakCelebrationDismissed, setStreakCelebrationDismissed] = useState(false);

  const today = getToday();
  const uid = user?.id;

  useEffect(() => {
    if (!navigator?.geolocation) return;
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude.toFixed(4)}&longitude=${coords.longitude.toFixed(4)}&current=temperature_2m,weather_code`
        );
        if (res.ok) {
          const json = await res.json();
          const temp = Math.round(json.current?.temperature_2m ?? 0);
          const code = json.current?.weather_code ?? 0;
          let icon = '☀️';
          if (code > 0 && code <= 3) icon = '⛅';
          else if (code > 3 && code <= 48) icon = '🌫️';
          else if (code > 48) icon = '🌧️';
          setWeather({ temp, icon });
        }
      } catch (e) { console.error(e); }
    }, null, { timeout: 6000, maximumAge: 600000 });
  }, []);

  const daily = useDailyStateV2();
  const ai = useAICoach({ userId: uid });
  const coach = useCoachChat({
    invalidateAfterAction: daily?.invalidateAfterAction,
    activePlan: daily?.activePlan,
  });

  const safeDaily = daily || {};
  const safePlan = safeDaily?.plan || {};
  const safeNutrition = safeDaily?.nutrition || {};
  const kcalRemaining = Math.max(0, (safeNutrition.caloriesTarget || 2000) - (safeNutrition.caloriesConsumed || 0));

  const briefing = buildBriefing({
    workoutDone: safeDaily.workoutDone,
    nutritionLogged: safeDaily.nutritionLogged,
    hasActivePlan: safePlan.id != null,
    planName: safePlan.name,
    preferredName: safeDaily.preferredName,
    kcalRemaining,
    t,
  });

  const recs = buildRecommendations({
    workoutDone: safeDaily.workoutDone,
    hasActivePlan: safePlan.id != null,
    proteinConsumed: safeNutrition.proteinConsumed || 0,
    proteinTarget: safeNutrition.proteinTarget || 0,
    weightLogged: safeDaily.weightLogged,
    hasPhotos: false,
    t,
  }) || [];

  // ── New: streak + check-in data ─────────────────────────────────────────
  const { data: todayCheckin } = useQuery({
    queryKey: ['daily-checkin', uid, today],
    queryFn: () => getDailyCheckin(uid, today),
    enabled: !!uid,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const { data: recentCheckins = [] } = useQuery({
    queryKey: ['daily-checkins-streak', uid],
    queryFn: () => listDailyCheckins(uid, { limit: 35 }),
    enabled: !!uid,
    staleTime: 60_000,
  });

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

  const firstName = useMemo(() => getFirstName(safeDaily.preferredName), [safeDaily.preferredName]);
  const streak = useMemo(() => calcStreak(recentCheckins), [recentCheckins]);
  const checkinDates = useMemo(() => recentCheckins.map(c => c.date), [recentCheckins]);
  const hasCheckin = !!todayCheckin;
  const streakUrgency = getStreakUrgency(hasCheckin);

  // Adaptive subtitle
  const adaptiveSubtitle = useMemo(() => {
    if (!todayCheckin) return null;
    if (todayCheckin.energy && todayCheckin.energy <= 2) return t('today.subtitle_low_energy');
    if (todayCheckin.energy && todayCheckin.energy >= 4) return t('today.subtitle_high_energy');
    if (todayCheckin.mood && todayCheckin.mood <= 2) return t('today.subtitle_rough_day');
    return null;
  }, [todayCheckin, t]);

  // Proactive AI
  const insightAge = coachMemory?.proactive_insight_generated_at
    ? Date.now() - new Date(coachMemory.proactive_insight_generated_at).getTime()
    : Infinity;
  const insightFresh = insightAge < 24 * 60 * 60 * 1000;
  const proactiveMessage = (insightFresh && coachMemory?.proactive_insight) || ai?.briefing?.message || null;
  const showAICard = !aiDismissed && !!proactiveMessage;

  // Milestones
  const MILESTONE_THRESHOLDS = [3, 7, 14, 30];
  const streakMilestone = MILESTONE_THRESHOLDS.includes(streak) ? streak : null;
  const showMilestone = !!streakMilestone && !streakCelebrationDismissed;

  return (
    <TodayScreen>
      {/* 1. Header — with streak pill */}
      <Header
        weather={weather}
        greeting={getGreeting(safeDaily.preferredName, t)}
        locale={locale}
        streak={streak}
        streakUrgency={streakUrgency}
        adaptiveSubtitle={adaptiveSubtitle}
      />

      {/* NEW: Streak milestone celebration */}
      {showMilestone && (
        <div className="rounded-[18px] bg-[hsl(var(--brand)/0.06)] border border-[hsl(var(--brand)/0.2)] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl atlas-streak-pulse inline-block">🔥</span>
              <p className="text-[15px] font-bold text-[hsl(var(--fg))]">
                <span className="atlas-odometer-flip">{streakMilestone}</span> days.{' '}
                {streakMilestone === 3 && t('today.streak_showed_up')}
                {streakMilestone === 7 && t('today.streak_one_week')}
                {streakMilestone === 14 && t('today.streak_two_weeks')}
                {streakMilestone === 30 && t('today.streak_one_month')}
              </p>
            </div>
            <button onClick={() => setStreakCelebrationDismissed(true)} className="text-[hsl(var(--fg-3))] p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* NEW: Streak recovery */}
      {streak === 0 && recentCheckins.length > 0 && !hasCheckin && (
        <div className="rounded-[18px] bg-[hsl(var(--err)/0.06)] border border-[hsl(var(--err)/0.15)] p-4">
          <p className="text-[14px] text-[hsl(var(--fg))]">
            <span className="text-[hsl(var(--err))] font-semibold">{t('today.streak_reset')}</span>{' '}
            {t('today.streak_start_again')}
          </p>
        </div>
      )}

      {/* NEW: Streak paywall at 3 days */}
      {streak === 3 && <PaywallTrigger trigger="streak" show={streak >= 3} />}

      {/* 2. Primary Action (ORIGINAL — preserved) */}
      <PrimaryAction
        action={briefing.primaryAction}
        briefingText={briefing.text}
        kcalRemaining={kcalRemaining}
      />

      {/* NEW: Proactive AI card */}
      {showAICard && (
        <ProactiveAICard
          message={proactiveMessage}
          onOpenChat={() => setChatOpen(true)}
          onDismiss={() => setAiDismissed(true)}
          streak={streak}
          firstName={firstName}
        />
      )}

      {/* 3. Coach Input (ORIGINAL — preserved) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-0.5">
          <h3 className="text-[13px] font-bold uppercase tracking-wider text-[hsl(var(--fg-3))]">{t('today.coach_guidance')}</h3>
          <Sparkles className="h-4 w-4 text-[hsl(var(--brand-ai))]" />
        </div>
        <CoachChatTrigger
          onOpen={() => setChatOpen(true)}
          onSuggestion={(text) => { coach.sendMessage(text, 'today'); setChatOpen(true); }}
        />
      </section>

      {/* NEW: 7-day chain dots */}
      <ChainDots checkinDates={checkinDates} />

      {/* 4. Quick Actions Grid (ORIGINAL — preserved) */}
      <section className="space-y-4">
        <h3 className="text-[13px] font-bold uppercase tracking-wider text-[hsl(var(--fg-3))] px-0.5">{t('today.focus_areas')}</h3>
        <div className="grid grid-cols-2 gap-3.5">
          <QuickAction
            to={ROUTES.workouts}
            icon={Dumbbell}
            label={t('today.training')}
            status={safeDaily.workoutDone ? t('today.completed') : t('today.start_now')}
            colorClass="bg-[hsl(var(--brand)/0.08)] text-[hsl(var(--brand))]"
          />
          <QuickAction
            to={ROUTES.nutrition}
            icon={UtensilsCrossed}
            label={t('today.nutrition')}
            status={safeDaily.nutritionLogged ? t('today.tracked') : t('today.log_fuel')}
            colorClass="bg-[hsl(var(--brand-ai)/0.08)] text-[hsl(var(--brand-ai))]"
          />
          <QuickAction
            to={ROUTES.body}
            icon={Scale}
            label={t('today.checkin')}
            status={safeDaily.weightLogged ? t('today.logged') : t('today.scale_weight')}
            colorClass="bg-[hsl(var(--ok)/0.08)] text-[hsl(var(--ok))]"
          />
          <QuickAction
            to={ROUTES.goals}
            icon={Target}
            label={t('today.progress')}
            status={t('today.view_trends')}
            colorClass="bg-[hsl(var(--warn)/0.08)] text-[hsl(var(--warn))]"
          />
          <QuickAction
            to={ROUTES.progressPhotos}
            icon={Camera}
            label={t('today.photos')}
            status={t('today.capture')}
            colorClass="bg-[hsl(var(--fg)/0.08)] text-[hsl(var(--fg))]"
          />
        </div>
      </section>

      {/* 5. Today's Plan Summary (ORIGINAL — preserved) */}
      {safePlan.id && !safeDaily.workoutDone && (
        <section className="space-y-4">
          <h3 className="text-[13px] font-bold uppercase tracking-wider text-[hsl(var(--fg-3))] px-0.5">{t('today.upcoming')}</h3>
          <Link to={ROUTES.workouts} className="block">
            <div className="flex items-center gap-4 rounded-[20px] bg-[hsl(var(--fill)/0.3)] border border-[hsl(var(--border)/0.5)] p-4 active:bg-[hsl(var(--fill)/0.5)] transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
                <Dumbbell className="h-6 w-6 text-[hsl(var(--fg))]" />
              </div>
              <div className="flex-1">
                <p className="text-[15px] font-bold text-[hsl(var(--fg))]">{safePlan.name}</p>
                <p className="text-[12px] font-medium text-[hsl(var(--fg-3))] mt-0.5">
                  {safePlan.todayExercises?.length || 0} {t('today.exercises')}
                </p>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-[hsl(var(--fg))] text-white text-[12px] font-bold">
                {t('today.start')}
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* 6. Recommendations (ORIGINAL — preserved) */}
      {recs.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-[13px] font-bold uppercase tracking-wider text-[hsl(var(--fg-3))] px-0.5">{t('today.smart_recs')}</h3>
          <div className="space-y-2.5">
            {recs.map((rec) => (
              <RecommendationCard key={rec.id} rec={rec} />
            ))}
          </div>
        </section>
      )}

      {/* NEW: First workout milestone */}
      {safeDaily.recentSessions?.length === 1 && safeDaily.workoutDone && (
        <div className="rounded-[18px] bg-[hsl(var(--brand)/0.06)] border border-[hsl(var(--brand)/0.15)] p-4">
          <p className="text-[14px] text-[hsl(var(--fg))]">{t('today.first_workout')}</p>
        </div>
      )}

      <CoachChatSheet
        open={chatOpen}
        onOpenChange={setChatOpen}
        messages={coach.messages}
        isTyping={coach.isTyping}
        actionStates={coach.actionStates}
        onSendMessage={coach.sendMessage}
        onConfirmAction={coach.executeAction}
        onDismissAction={coach.dismissAction}
        pageContext="today"
      />
      <BodyCheckinSheet open={checkinOpen} onOpenChange={setCheckinOpen} />
    </TodayScreen>
  );
}

export default function TodayV2() {
  return <TodayContent />;
}
