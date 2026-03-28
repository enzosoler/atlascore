import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowRight,
  Battery,
  Bell,
  CheckCircle2,
  ChevronRight,
  Droplets,
  Dumbbell,
  Flame,
  Loader2,
  Minus,
  Moon,
  Plus,
  Scale,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  UtensilsCrossed,
  X,
  Zap,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/AuthContext';
import { useSubscription } from '@/lib/SubscriptionContext';
import { supabase } from '@/lib/supabaseClient';
import { ROUTES } from '@/lib/routes';
import { SafePageBoundary } from '@/components/shared/StablePage';
import { WeeklyCheckinModal } from '@/components/today/WeeklyCheckinModal';
import { toast } from 'sonner';
import { trackEvent } from '@/lib/sentry';
import AIGenerateWizard from '@/components/ai/AIGenerateWizard';
import { useT, useI18n } from '@/lib/i18nContext';
import { getDailyCheckin, upsertDailyCheckin } from '@/services/checkinService';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getPreferredName(displayName, fallback = 'Athlete') {
  if (!displayName) return fallback;
  const [chunk] = String(displayName).split(/[\s@._-]+/).filter(Boolean);
  if (!chunk) return fallback;
  const clean = chunk.replace(/\d+$/u, '') || chunk;
  return `${clean.charAt(0).toLocaleUpperCase()}${clean.slice(1)}`;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getDateLabel(locale) {
  return new Intl.DateTimeFormat(locale === 'pt-BR' ? 'pt-BR' : 'en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());
}

function todayKey() {
  return new Date().toISOString().split('T')[0];
}

function computeStreak(workouts) {
  if (!workouts.length) return 0;
  const dates = new Set(workouts.map(w => {
    const d = new Date(w.date || w.completed_at);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }));
  const today = todayKey();
  const yesterday = (() => {
    const d = new Date(); d.setDate(d.getDate() - 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();
  if (!dates.has(today) && !dates.has(yesterday)) return 0;
  let count = 0;
  let cursor = new Date(dates.has(today) ? today : yesterday);
  while (true) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
    if (!dates.has(key)) break;
    count++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

function generateCoachBriefing({ todaySession, todayMeals, activeWorkoutPlan, lastWorkout, profile }) {
  const daysSince = lastWorkout
    ? Math.floor((Date.now() - new Date(lastWorkout.completed_at || lastWorkout.date).getTime()) / 86400000)
    : null;

  if (todaySession?.status === 'completed') {
    const hasMeals = todayMeals.length > 0;
    return {
      tone: 'success',
      headline: 'Workout done. Nail recovery.',
      recommendation: hasMeals
        ? 'Keep hitting your protein target to maximise today\'s training stimulus.'
        : 'Log your post-workout meal now — protein within 2h accelerates recovery.',
      reason: 'Muscle protein synthesis peaks in the hours after training. Nutrition is the multiplier.',
      primary: { label: hasMeals ? 'View nutrition' : 'Log a meal', path: ROUTES.nutrition },
      secondary: { label: 'View workout', path: ROUTES.workouts },
    };
  }

  if (activeWorkoutPlan) {
    return {
      tone: 'action',
      headline: 'Time to train.',
      recommendation: `Start ${activeWorkoutPlan.name || 'your session'} — ${activeWorkoutPlan.exercises?.length || 0} exercises ready.`,
      reason: daysSince >= 2
        ? `${daysSince} days since your last session. Don't let the gap compound.`
        : 'Consistency is the variable you control. Show up today.',
      primary: { label: 'Start workout', path: ROUTES.workouts },
      secondary: { label: 'Adjust with AI', path: ROUTES.workouts },
    };
  }

  if (todayMeals.length === 0) {
    return {
      tone: 'neutral',
      headline: 'Start your day right.',
      recommendation: 'Log your first meal to activate your nutrition tracking.',
      reason: 'Awareness of intake is the foundation of any physique goal.',
      primary: { label: 'Log a meal', path: ROUTES.nutrition },
      secondary: { label: 'Build a plan', path: ROUTES.workouts },
    };
  }

  return {
    tone: 'setup',
    headline: 'Build your training plan.',
    recommendation: 'You have no active workout plan. Structured training outperforms ad-hoc effort every time.',
    reason: 'Athletes with periodized plans are 3× more consistent over 12 weeks.',
    primary: { label: 'Create plan', path: ROUTES.workouts },
    secondary: null,
  };
}

const DISMISSED_KEY = 'atlas_dismissed_recs';
function getDismissed() {
  try {
    const raw = JSON.parse(localStorage.getItem(DISMISSED_KEY) || '{}');
    const today = todayKey();
    return raw[today] || [];
  } catch { return []; }
}
function saveDismissed(ids) {
  try {
    const today = todayKey();
    localStorage.setItem(DISMISSED_KEY, JSON.stringify({ [today]: ids }));
  } catch {}
}

// ─── 1. SafeHeader ────────────────────────────────────────────────────────────

function SafeHeader({ name, locale }) {
  return (
    <header className="flex items-start justify-between gap-3 pt-1">
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-[hsl(var(--fg-3))]">{getDateLabel(locale)}</p>
        <h1 className="mt-0.5 truncate text-[22px] font-bold tracking-[-0.03em] text-[hsl(var(--fg))]">
          {getGreeting()}, {name}
        </h1>
      </div>
      <button
        className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-[hsl(var(--border)/0.8)] bg-[hsl(var(--fill)/0.6)] text-[hsl(var(--fg-2))] transition-colors hover:bg-[hsl(var(--fill))]"
        aria-label="Notifications"
      >
        <Bell className="h-[18px] w-[18px]" strokeWidth={2} />
      </button>
    </header>
  );
}

// ─── 2. AICoachBriefing ───────────────────────────────────────────────────────

function AICoachBriefing({ briefing, hasAI, onGenerateWorkout }) {
  const navigate = useNavigate();
  const toneAccent = {
    success: 'hsl(142 60% 40%)',
    action: 'hsl(217 91% 60%)',
    neutral: 'hsl(217 91% 60%)',
    setup: 'hsl(38 92% 50%)',
  }[briefing.tone] || 'hsl(217 91% 60%)';

  return (
    <div
      className="relative overflow-hidden rounded-[24px] border border-[hsl(240_30%_30%/0.5)] p-5"
      style={{
        background: 'linear-gradient(160deg, hsl(240 35% 13%) 0%, hsl(260 30% 9%) 100%)',
      }}
    >
      {/* Glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[24px]"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 90% 10%, ${toneAccent.replace(')', '/0.18)')}, transparent 60%)`,
        }}
        aria-hidden="true"
      />

      {/* Header row */}
      <div className="relative flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[hsl(240_60%_60%/0.2)]">
          <Sparkles className="h-3.5 w-3.5 text-[hsl(240_80%_75%)]" strokeWidth={2} />
        </div>
        <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[hsl(240_60%_70%)]">
          AI Coach
        </span>
      </div>

      {/* Headline */}
      <h2 className="relative mt-3 text-[24px] font-bold leading-tight tracking-[-0.03em] text-white">
        {briefing.headline}
      </h2>

      {/* Recommendation */}
      <p className="relative mt-2 text-[14px] leading-relaxed text-[hsl(240_30%_80%)]">
        {briefing.recommendation}
      </p>

      {/* Reason */}
      <p className="relative mt-2 text-[12px] leading-relaxed text-[hsl(240_20%_55%)]">
        {briefing.reason}
      </p>

      {/* Actions */}
      <div className="relative mt-5 flex gap-2.5">
        <button
          onClick={() => navigate(briefing.primary.path)}
          className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-[14px] bg-[hsl(240_60%_55%)] px-4 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
        >
          {briefing.primary.label}
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
        </button>
        {briefing.secondary && (
          <button
            onClick={() => {
              if (hasAI && briefing.secondary.label.toLowerCase().includes('ai')) {
                onGenerateWorkout();
              } else {
                navigate(briefing.secondary.path);
              }
            }}
            className="flex h-11 items-center justify-center gap-1.5 rounded-[14px] border border-[hsl(240_30%_40%/0.8)] bg-[hsl(240_30%_20%/0.5)] px-4 text-[13px] font-semibold text-[hsl(240_40%_75%)] transition-opacity hover:opacity-90 active:scale-[0.98]"
          >
            {briefing.secondary.label}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── 3. ReadinessRow ─────────────────────────────────────────────────────────

const READINESS_METRICS = [
  { key: 'sleep_hours', icon: Moon, label: 'Sleep', format: v => v != null ? `${v}h` : '—', unit: 'h', min: 0, max: 12, step: 0.5 },
  { key: 'energy', icon: Battery, label: 'Energy', format: v => v != null ? `${v}/5` : '—', unit: '/5', min: 1, max: 5, step: 1 },
  { key: 'mood', icon: Activity, label: 'Recovery', format: v => v != null ? `${v}/5` : '—', unit: '/5', min: 1, max: 5, step: 1 },
  { key: 'hydration_liters', icon: Droplets, label: 'Water', format: v => v != null ? `${v}L` : '—', unit: 'L', min: 0, max: 6, step: 0.5 },
];

function ReadinessRow({ checkin, userId, onUpdate }) {
  const [open, setOpen] = useState(null); // key of metric being edited
  const [draft, setDraft] = useState(null);

  const metric = READINESS_METRICS.find(m => m.key === open);

  const handleOpen = (key) => {
    setDraft(checkin?.[key] ?? null);
    setOpen(key);
  };

  const handleSave = async () => {
    if (!metric || draft == null) { setOpen(null); return; }
    await onUpdate({ [metric.key]: draft });
    setOpen(null);
  };

  return (
    <>
      <div className="flex gap-2">
        {READINESS_METRICS.map(({ key, icon: Icon, label, format }) => {
          const val = checkin?.[key];
          const filled = val != null;
          return (
            <button
              key={key}
              onClick={() => handleOpen(key)}
              className={cn(
                'flex flex-1 flex-col items-center gap-1.5 rounded-[16px] border py-3 transition-colors active:scale-95',
                filled
                  ? 'border-[hsl(var(--brand)/0.25)] bg-[hsl(var(--brand)/0.08)]'
                  : 'border-[hsl(var(--border)/0.7)] bg-[hsl(var(--fill)/0.4)]'
              )}
            >
              <Icon
                className={cn('h-4 w-4', filled ? 'text-[hsl(var(--brand))]' : 'text-[hsl(var(--fg-3))]')}
                strokeWidth={2}
              />
              <span className={cn('text-[11px] font-semibold tabular-nums', filled ? 'text-[hsl(var(--fg))]' : 'text-[hsl(var(--fg-3))]')}>
                {format(val)}
              </span>
              <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-[hsl(var(--fg-3))]">
                {label}
              </span>
            </button>
          );
        })}
      </div>

      <Drawer open={!!open} onOpenChange={v => { if (!v) setOpen(null); }}>
        <DrawerContent className="pb-safe">
          {metric && (
            <div className="px-5 pb-8 pt-2">
              <DrawerHeader className="px-0 pb-4">
                <DrawerTitle className="flex items-center gap-2 text-left text-[18px] font-semibold">
                  <metric.icon className="h-5 w-5 text-[hsl(var(--brand))]" strokeWidth={2} />
                  {metric.label}
                </DrawerTitle>
              </DrawerHeader>

              {/* Value display */}
              <div className="mb-6 text-center">
                <span className="text-[48px] font-bold tabular-nums tracking-[-0.04em] text-[hsl(var(--fg))]">
                  {draft ?? '—'}
                </span>
                <span className="ml-1 text-[20px] font-medium text-[hsl(var(--fg-3))]">{metric.unit}</span>
              </div>

              {/* Slider */}
              <input
                type="range"
                min={metric.min}
                max={metric.max}
                step={metric.step}
                value={draft ?? metric.min}
                onChange={e => setDraft(Number(e.target.value))}
                className="w-full accent-[hsl(var(--brand))]"
              />
              <div className="mt-1 flex justify-between text-[11px] text-[hsl(var(--fg-3))]">
                <span>{metric.min}{metric.unit}</span>
                <span>{metric.max}{metric.unit}</span>
              </div>

              <button
                onClick={handleSave}
                className="mt-6 h-12 w-full rounded-[14px] bg-[hsl(var(--brand))] text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
              >
                Save
              </button>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
}

// ─── 4. QuickActions ─────────────────────────────────────────────────────────

function QuickActions({ todaySession, todayMeals, recentMeasurements, onCheckin, navigate }) {
  const workoutDone = todaySession?.status === 'completed';
  const mealsDone = todayMeals.length > 0;
  const weightRecent = recentMeasurements.length > 0 &&
    (Date.now() - new Date(recentMeasurements[0].date).getTime()) / 86400000 < 7;

  // Determine which action is most relevant to highlight
  const highlight = !workoutDone ? 'workout' : !mealsDone ? 'meal' : !weightRecent ? 'weight' : 'checkin';

  const actions = [
    {
      key: 'meal',
      icon: UtensilsCrossed,
      label: 'Log meal',
      done: mealsDone,
      onPress: () => navigate(ROUTES.nutrition),
    },
    {
      key: 'workout',
      icon: Dumbbell,
      label: workoutDone ? 'Workout done' : 'Start workout',
      done: workoutDone,
      onPress: () => navigate(ROUTES.workouts),
    },
    {
      key: 'weight',
      icon: Scale,
      label: 'Add weight',
      done: weightRecent,
      onPress: () => navigate(ROUTES.body),
    },
    {
      key: 'checkin',
      icon: Zap,
      label: 'Check in',
      done: false,
      onPress: onCheckin,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {actions.map(({ key, icon: Icon, label, done, onPress }) => {
        const isHighlight = highlight === key && !done;
        return (
          <button
            key={key}
            onClick={onPress}
            className={cn(
              'flex flex-col items-center justify-center gap-2 rounded-[20px] border py-5 transition-all active:scale-[0.97]',
              done
                ? 'border-[hsl(var(--ok)/0.25)] bg-[hsl(var(--ok)/0.07)]'
                : isHighlight
                  ? 'border-[hsl(var(--brand)/0.35)] bg-[hsl(var(--brand)/0.1)] shadow-[0_0_0_1px_hsl(var(--brand)/0.15)]'
                  : 'border-[hsl(var(--border)/0.7)] bg-[hsl(var(--fill)/0.4)]'
            )}
          >
            <div className={cn(
              'flex h-10 w-10 items-center justify-center rounded-[14px]',
              done
                ? 'bg-[hsl(var(--ok)/0.14)] text-[hsl(var(--ok))]'
                : isHighlight
                  ? 'bg-[hsl(var(--brand)/0.15)] text-[hsl(var(--brand))]'
                  : 'bg-[hsl(var(--fill))] text-[hsl(var(--fg-2))]'
            )}>
              {done ? <CheckCircle2 className="h-5 w-5" strokeWidth={2} /> : <Icon className="h-5 w-5" strokeWidth={2} />}
            </div>
            <span className={cn(
              'text-[12px] font-semibold',
              done ? 'text-[hsl(var(--ok))]' : isHighlight ? 'text-[hsl(var(--fg))]' : 'text-[hsl(var(--fg-2))]'
            )}>
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── 5. TodayPlan ─────────────────────────────────────────────────────────────

function TodayPlan({ activeWorkoutPlan, todaySession, todayMeals, profile, navigate }) {
  const totalCal = todayMeals.reduce((s, m) => s + (m.calories || 0), 0);
  const calTarget = profile?.targets?.calories || 0;
  const calPct = calTarget > 0 ? Math.min(100, Math.round((totalCal / calTarget) * 100)) : 0;

  return (
    <div className="space-y-2">
      <p className="px-0.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[hsl(var(--fg-3))]">Today's Plan</p>

      {/* Workout row */}
      <button
        onClick={() => navigate(ROUTES.workouts)}
        className="flex w-full items-center gap-3 rounded-[16px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card))] px-4 py-3.5 text-left transition-colors hover:bg-[hsl(var(--fill)/0.4)] active:scale-[0.99]"
      >
        <div className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px]',
          todaySession?.status === 'completed'
            ? 'bg-[hsl(var(--ok)/0.12)] text-[hsl(var(--ok))]'
            : 'bg-[hsl(var(--brand)/0.1)] text-[hsl(var(--brand))]'
        )}>
          {todaySession?.status === 'completed'
            ? <CheckCircle2 className="h-4.5 w-4.5" strokeWidth={2} />
            : <Dumbbell className="h-[18px] w-[18px]" strokeWidth={2} />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold text-[hsl(var(--fg))]">
            {todaySession?.status === 'completed'
              ? (todaySession.name || 'Workout')
              : activeWorkoutPlan?.name || 'No plan yet'}
          </p>
          <p className="text-[12px] text-[hsl(var(--fg-3))]">
            {todaySession?.status === 'completed'
              ? `${todaySession.duration_minutes || 0} min · ${todaySession.exercises_completed?.length || 0} exercises`
              : activeWorkoutPlan
                ? `${activeWorkoutPlan.exercises?.length || 0} exercises · ${(activeWorkoutPlan.exercises?.length || 0) * 8} min est.`
                : 'Tap to create a plan'}
          </p>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-[hsl(var(--fg-3))]" strokeWidth={2} />
      </button>

      {/* Nutrition row */}
      <button
        onClick={() => navigate(ROUTES.nutrition)}
        className="flex w-full items-center gap-3 rounded-[16px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card))] px-4 py-3.5 text-left transition-colors hover:bg-[hsl(var(--fill)/0.4)] active:scale-[0.99]"
      >
        <div className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px]',
          todayMeals.length > 0
            ? 'bg-[hsl(var(--ok)/0.12)] text-[hsl(var(--ok))]'
            : 'bg-[hsl(var(--fill))] text-[hsl(var(--fg-3))]'
        )}>
          <UtensilsCrossed className="h-[18px] w-[18px]" strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-[14px] font-semibold text-[hsl(var(--fg))]">
              {todayMeals.length > 0 ? `${totalCal.toLocaleString()} kcal` : 'Nothing logged yet'}
            </p>
            {calTarget > 0 && todayMeals.length > 0 && (
              <span className="shrink-0 text-[12px] font-medium text-[hsl(var(--fg-3))]">{calPct}%</span>
            )}
          </div>
          {calTarget > 0 && todayMeals.length > 0 ? (
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[hsl(var(--fill))]">
              <div
                className="h-full rounded-full bg-[hsl(var(--ok))] transition-all"
                style={{ width: `${calPct}%` }}
              />
            </div>
          ) : (
            <p className="text-[12px] text-[hsl(var(--fg-3))]">
              {todayMeals.length > 0 ? `${todayMeals.length} meal${todayMeals.length > 1 ? 's' : ''}` : 'Tap to log a meal'}
            </p>
          )}
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-[hsl(var(--fg-3))]" strokeWidth={2} />
      </button>
    </div>
  );
}

// ─── 6. AlertsSection ────────────────────────────────────────────────────────

function AlertsSection({ todaySession, activeWorkoutPlan, lastWorkout, navigate }) {
  const alerts = useMemo(() => {
    const list = [];
    const daysSince = lastWorkout
      ? Math.floor((Date.now() - new Date(lastWorkout.completed_at || lastWorkout.date).getTime()) / 86400000)
      : null;

    if (!activeWorkoutPlan && !todaySession) {
      list.push({
        id: 'no-plan',
        icon: Target,
        tone: 'warn',
        text: 'No active training plan. Your results depend on structure.',
        cta: 'Create plan',
        path: ROUTES.workouts,
      });
    }

    if (daysSince >= 3 && todaySession?.status !== 'completed') {
      list.push({
        id: 'training-gap',
        icon: Flame,
        tone: 'urgent',
        text: `${daysSince} days without a workout. A long gap hurts more than one session.`,
        cta: 'Train now',
        path: ROUTES.workouts,
      });
    }

    return list.slice(0, 2);
  }, [todaySession, activeWorkoutPlan, lastWorkout]);

  if (!alerts.length) return null;

  return (
    <div className="space-y-2">
      {alerts.map(({ id, icon: Icon, tone, text, cta, path }) => (
        <div
          key={id}
          className={cn(
            'flex items-center gap-3 rounded-[16px] border-l-[3px] px-4 py-3',
            tone === 'urgent'
              ? 'border-l-[hsl(var(--err))] bg-[hsl(var(--err)/0.06)]'
              : 'border-l-[hsl(var(--warn))] bg-[hsl(var(--warn)/0.06)]'
          )}
        >
          <Icon
            className={cn('h-4 w-4 shrink-0', tone === 'urgent' ? 'text-[hsl(var(--err))]' : 'text-[hsl(var(--warn))]')}
            strokeWidth={2}
          />
          <p className="min-w-0 flex-1 text-[13px] text-[hsl(var(--fg-2))]">{text}</p>
          <button
            onClick={() => navigate(path)}
            className={cn(
              'shrink-0 rounded-[10px] px-3 py-1.5 text-[12px] font-semibold',
              tone === 'urgent'
                ? 'bg-[hsl(var(--err)/0.12)] text-[hsl(var(--err))]'
                : 'bg-[hsl(var(--warn)/0.12)] text-[hsl(var(--warn))]'
            )}
          >
            {cta}
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── 7. ProgressSnapshot ─────────────────────────────────────────────────────

function ProgressSnapshot({ streak, weekWorkoutsCount, recentMeasurements }) {
  const weightDelta = useMemo(() => {
    if (recentMeasurements.length < 2) return null;
    const latest = recentMeasurements[0]?.weight;
    const prev = recentMeasurements[recentMeasurements.length - 1]?.weight;
    if (latest == null || prev == null) return null;
    return Math.round((latest - prev) * 10) / 10;
  }, [recentMeasurements]);

  const stats = [
    {
      label: 'Streak',
      value: streak,
      unit: streak === 1 ? 'day' : 'days',
      icon: Flame,
      tone: streak >= 3 ? 'ok' : 'neutral',
    },
    {
      label: 'This week',
      value: weekWorkoutsCount,
      unit: weekWorkoutsCount === 1 ? 'session' : 'sessions',
      icon: Dumbbell,
      tone: weekWorkoutsCount >= 3 ? 'ok' : 'neutral',
    },
    {
      label: 'Weight',
      value: weightDelta != null
        ? `${weightDelta > 0 ? '+' : ''}${weightDelta}`
        : recentMeasurements[0]?.weight ?? '—',
      unit: weightDelta != null ? 'kg Δ' : recentMeasurements.length ? 'kg' : '',
      icon: weightDelta != null && weightDelta < 0 ? TrendingDown : weightDelta != null && weightDelta > 0 ? TrendingUp : Scale,
      tone: 'neutral',
    },
  ];

  return (
    <div className="space-y-2">
      <p className="px-0.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[hsl(var(--fg-3))]">Progress</p>
      <div className="grid grid-cols-3 gap-2">
        {stats.map(({ label, value, unit, icon: Icon, tone }) => (
          <div
            key={label}
            className="flex flex-col gap-1 rounded-[16px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card))] px-3 py-3.5"
          >
            <Icon
              className={cn('h-4 w-4', tone === 'ok' ? 'text-[hsl(var(--ok))]' : 'text-[hsl(var(--fg-3))]')}
              strokeWidth={2}
            />
            <p className="mt-1 text-[20px] font-bold tabular-nums tracking-[-0.04em] text-[hsl(var(--fg))]">
              {value === null || value === undefined ? '—' : value}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[hsl(var(--fg-3))]">
              {unit || label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 8. AIRecommendations ────────────────────────────────────────────────────

function AIRecommendations({ todaySession, todayMeals, activeWorkoutPlan, lastWorkout, recentMeasurements }) {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(getDismissed);

  const recs = useMemo(() => {
    const list = [];
    const daysSince = lastWorkout
      ? Math.floor((Date.now() - new Date(lastWorkout.completed_at || lastWorkout.date).getTime()) / 86400000)
      : null;

    if (todaySession?.status === 'completed' && todayMeals.length === 0) {
      list.push({
        id: 'post-workout-nutrition',
        type: 'Nutrition',
        title: 'Log your post-workout meal',
        reason: 'You trained today but haven\'t logged food. Post-workout protein is critical for recovery.',
        action: 'Log now',
        path: ROUTES.nutrition,
      });
    }

    if (daysSince != null && daysSince >= 2 && todaySession?.status !== 'completed') {
      list.push({
        id: 'training-gap-rec',
        type: 'Training',
        title: `${daysSince}-day gap. Get back on track.`,
        reason: 'Frequency drives adaptation. Even a short session resets your momentum.',
        action: 'Start workout',
        path: ROUTES.workouts,
      });
    }

    if (recentMeasurements.length === 0) {
      list.push({
        id: 'first-measurement',
        type: 'Body',
        title: 'Log your first weight measurement',
        reason: 'Tracking weight weekly reveals trends that daily check-ins miss.',
        action: 'Log weight',
        path: ROUTES.body,
      });
    }

    if (todayMeals.length > 0 && todayMeals.length < 3) {
      list.push({
        id: 'meal-frequency',
        type: 'Nutrition',
        title: 'Add another meal',
        reason: 'Spreading intake across 3–4 meals optimises muscle protein synthesis throughout the day.',
        action: 'Log meal',
        path: ROUTES.nutrition,
      });
    }

    return list.filter(r => !dismissed.includes(r.id)).slice(0, 3);
  }, [todaySession, todayMeals, activeWorkoutPlan, lastWorkout, recentMeasurements, dismissed]);

  const handleDismiss = (id) => {
    const next = [...dismissed, id];
    setDismissed(next);
    saveDismissed(next);
  };

  if (!recs.length) return null;

  return (
    <div className="space-y-2">
      <p className="px-0.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[hsl(var(--fg-3))]">Recommendations</p>
      {recs.map(({ id, type, title, reason, action, path }) => (
        <div
          key={id}
          className="relative rounded-[16px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card))] p-4"
        >
          <button
            onClick={() => handleDismiss(id)}
            className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full text-[hsl(var(--fg-3))] transition-colors hover:bg-[hsl(var(--fill))] hover:text-[hsl(var(--fg-2))]"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
          <span className="inline-block rounded-full border border-[hsl(var(--brand)/0.2)] bg-[hsl(var(--brand)/0.08)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[hsl(var(--brand))]">
            {type}
          </span>
          <p className="mt-2 pr-6 text-[14px] font-semibold text-[hsl(var(--fg))]">{title}</p>
          <p className="mt-1 text-[12px] leading-relaxed text-[hsl(var(--fg-3))]">{reason}</p>
          <button
            onClick={() => navigate(path)}
            className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-[hsl(var(--brand))]"
          >
            {action}
            <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.5} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Main Content ─────────────────────────────────────────────────────────────

function TodayContent() {
  const { user } = useAuth();
  const { can } = useSubscription();
  const navigate = useNavigate();
  const { locale } = useI18n();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [aiWizardOpen, setAiWizardOpen] = useState(false);

  const hasAIAccess = can('atlas_ai');
  const preferredName = getPreferredName(user?.full_name || user?.email);

  // Stripe success redirect
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
          { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ session_id: sessionId }) }
        );
        const data = await res.json();
        if (data?.success) {
          toast.success('Subscription activated! Welcome to Atlas Core Pro.');
          trackEvent('payment_success', { user_id: user?.id });
          queryClient.invalidateQueries({ queryKey: ['subscription-supabase'] });
        }
      } catch {
        queryClient.invalidateQueries({ queryKey: ['subscription-supabase'] });
      }
    })();
  }, []);

  // ── Data queries ──────────────────────────────────────────────────────────

  const { data: todayMeals = [], isLoading: mealsLoading } = useQuery({
    queryKey: ['today-meals', user?.id],
    queryFn: async () => {
      const today = todayKey();
      const { data, error } = await supabase.from('food_logs').eq('user_id', user.id)
        .gte('date', `${today}T00:00:00`).lte('date', `${today}T23:59:59`);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: todaySession, isLoading: sessionLoading } = useQuery({
    queryKey: ['today-session', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('workout_logs').eq('user_id', user.id)
        .eq('date', todayKey()).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: activeWorkoutPlan, isLoading: planLoading } = useQuery({
    queryKey: ['active-workout-plan', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('workout_plans').select('*')
        .eq('user_id', user.id).eq('active', true).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: recentMeasurements = [], isLoading: measurementsLoading } = useQuery({
    queryKey: ['recent-measurements', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('measurements').eq('user_id', user.id)
        .order('date', { ascending: false }).limit(5);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: lastWorkout } = useQuery({
    queryKey: ['last-workout', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('workout_logs').eq('user_id', user.id)
        .eq('status', 'completed').order('completed_at', { ascending: false }).limit(1).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: profile } = useQuery({
    queryKey: ['user-profile-today', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('profile_data')
        .eq('id', user.id).single();
      if (error) throw error;
      return data?.profile_data || {};
    },
    enabled: !!user?.id,
  });

  const { data: recentWorkouts = [] } = useQuery({
    queryKey: ['streak-workouts', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('workout_logs').select('date, completed_at')
        .eq('user_id', user.id).eq('status', 'completed')
        .order('date', { ascending: false }).limit(30);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: weekWorkouts = [] } = useQuery({
    queryKey: ['week-workouts', user?.id],
    queryFn: async () => {
      const start = new Date();
      start.setDate(start.getDate() - start.getDay());
      start.setHours(0, 0, 0, 0);
      const { data, error } = await supabase.from('workout_logs').select('id')
        .eq('user_id', user.id).eq('status', 'completed').gte('completed_at', start.toISOString());
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: dailyCheckin, refetch: refetchCheckin } = useQuery({
    queryKey: ['daily-checkin', user?.id],
    queryFn: () => getDailyCheckin(user.id),
    enabled: !!user?.id,
  });

  // Readiness update mutation
  const updateCheckin = useMutation({
    mutationFn: (payload) => upsertDailyCheckin(user.id, { date: todayKey(), ...payload }),
    onSuccess: () => refetchCheckin(),
  });

  // AI wizard
  const handleGenerateWorkout = () => setAiWizardOpen(true);
  const handleAIGenerate = async (answers) => {
    try {
      const { data, error } = await supabase.functions.invoke('invoke-llm', {
        body: { prompt: `Generate a workout plan.\nProfile: ${JSON.stringify(profile)}\nPreferences: ${JSON.stringify(answers)}`, max_tokens: 2048 }
      });
      if (error) throw error;
      if (data?.data) {
        const plan = data.data;
        await supabase.from('workout_plans').insert({
          user_id: user.id, name: plan.plan_name || 'AI Plan', description: plan.description || '',
          exercises: plan.exercises || [], active: true, source: 'ai_generated'
        });
        toast.success('AI workout plan created!');
        queryClient.invalidateQueries({ queryKey: ['active-workout-plan', user?.id] });
      }
    } catch { toast.error('Failed to generate plan.'); }
  };

  // Computed
  const streak = useMemo(() => computeStreak(recentWorkouts), [recentWorkouts]);
  const briefing = useMemo(() => generateCoachBriefing({ todaySession, todayMeals, activeWorkoutPlan, lastWorkout, profile }), [todaySession, todayMeals, activeWorkoutPlan, lastWorkout, profile]);

  const isLoading = mealsLoading || sessionLoading || planLoading || measurementsLoading;

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--brand))]" strokeWidth={2} />
      </div>
    );
  }

  // ── Component tree (in exact specified order) ────────────────────────────

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-4 pb-12 pt-4 sm:px-5">

      {/* 1. Safe header */}
      <SafeHeader name={preferredName} locale={locale} />

      {/* 2. AI coach briefing — dominant above-the-fold card */}
      <AICoachBriefing
        briefing={briefing}
        hasAI={hasAIAccess}
        onGenerateWorkout={handleGenerateWorkout}
      />

      {/* 3. Readiness row */}
      <ReadinessRow
        checkin={dailyCheckin}
        userId={user?.id}
        onUpdate={(payload) => updateCheckin.mutate(payload)}
      />

      {/* 4. Quick actions — 2×2 grid */}
      <QuickActions
        todaySession={todaySession}
        todayMeals={todayMeals}
        recentMeasurements={recentMeasurements}
        onCheckin={() => setCheckinOpen(true)}
        navigate={navigate}
      />

      {/* 5. Today's plan */}
      <TodayPlan
        activeWorkoutPlan={activeWorkoutPlan}
        todaySession={todaySession}
        todayMeals={todayMeals}
        profile={profile}
        navigate={navigate}
      />

      {/* 6. Alerts — only when relevant */}
      <AlertsSection
        todaySession={todaySession}
        activeWorkoutPlan={activeWorkoutPlan}
        lastWorkout={lastWorkout}
        navigate={navigate}
      />

      {/* 7. Progress snapshot */}
      <ProgressSnapshot
        streak={streak}
        weekWorkoutsCount={weekWorkouts.length}
        recentMeasurements={recentMeasurements}
      />

      {/* 8. AI recommendations — below the fold */}
      <AIRecommendations
        todaySession={todaySession}
        todayMeals={todayMeals}
        activeWorkoutPlan={activeWorkoutPlan}
        lastWorkout={lastWorkout}
        recentMeasurements={recentMeasurements}
      />

      {/* Modals */}
      <WeeklyCheckinModal open={checkinOpen} onClose={() => setCheckinOpen(false)} />
      <AIGenerateWizard
        open={aiWizardOpen}
        onClose={() => setAiWizardOpen(false)}
        type="workout"
        profile={profile}
        onGenerate={handleAIGenerate}
      />
    </div>
  );
}

export default function Today() {
  return (
    <SafePageBoundary
      title="Today"
      subtitle="Your daily execution system"
      maxWidth="max-w-2xl"
      fallbackDescription="The Today screen opened in safe mode."
    >
      <TodayContent />
    </SafePageBoundary>
  );
}
