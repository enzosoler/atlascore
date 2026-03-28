/**
 * TodayV2 — clean rebuild of the Today page.
 *
 * Rules:
 *  - No query may crash the route
 *  - No .map() on potentially undefined
 *  - No deep access without optional chaining
 *  - If workout is done, NEVER suggest "Start workout"
 *  - Every component receives safe defaults
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell, Sparkles, Dumbbell, UtensilsCrossed, Scale, Heart,
  ArrowRight, Flame, Target, Pill,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/lib/i18nContext';
import { useDailyStateV2 } from '@/hooks/useDailyStateV2';
import { useAICoach } from '@/hooks/useAICoach';
import { buildBriefing, buildRecommendations } from '@/lib/rulesEngine';
import { ROUTES } from '@/lib/routes';
import { TodayScreen } from '@/components/today/TodayMobileUI';
import BodyCheckinSheet from '@/components/body/BodyCheckinSheet';

// ─── Date / greeting / weather helpers ─────────────────────────────────────────

function getDateLabel(locale) {
  return new Intl.DateTimeFormat(locale === 'pt-BR' ? 'pt-BR' : 'en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  }).format(new Date());
}

function getFirstName(fullName) {
  if (!fullName) return 'Athlete';
  const [first] = String(fullName).split(/[\s@._-]+/).filter(Boolean);
  if (!first) return 'Athlete';
  const clean = first.replace(/\d+$/u, '') || first;
  return `${clean.charAt(0).toLocaleUpperCase()}${clean.slice(1)}`;
}

function getGreeting(fullName) {
  const name = getFirstName(fullName);
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return `Good morning, ${name}`;
  if (h >= 12 && h < 17) return `Good afternoon, ${name}`;
  if (h >= 17 && h < 21) return `Good evening, ${name}`;
  return `Hey ${name}, up late?`;
}

function interpretWeather(temp, code) {
  let icon, condition;
  if (code === 0)       { icon = '☀️'; condition = 'clear'; }
  else if (code <= 3)   { icon = '⛅'; condition = 'cloudy'; }
  else if (code <= 48)  { icon = '🌫️'; condition = 'foggy'; }
  else if (code <= 67)  { icon = '🌧️'; condition = 'rainy'; }
  else if (code <= 77)  { icon = '❄️'; condition = 'snowy'; }
  else if (code <= 82)  { icon = '🌦️'; condition = 'showers'; }
  else                  { icon = '⛈️'; condition = 'stormy'; }
  const comments = {
    clear:   temp > 28 ? 'Hot outside. Stay hydrated.' : temp < 10 ? 'Cold but clear — good energy.' : 'Clear skies. No excuses today.',
    cloudy:  'Overcast. Perfect for a focused session.',
    foggy:   'Moody out there. Channel it.',
    rainy:   "Rain can't stop the work.",
    snowy:   'Frozen outside. Even better reason to warm up.',
    showers: 'Wet out there. Train indoors.',
    stormy:  'Stay in and train hard.',
  };
  return { temp, icon, comment: comments[condition] ?? null };
}

// ─── Hero Card ─────────────────────────────────────────────────────────────────

function HeroCard({ text, focus, primaryAction, loading }) {
  if (loading) {
    return (
      <div className="rounded-[20px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card)/0.9)] p-5 space-y-3">
        <div className="h-4 w-32 rounded-md bg-[hsl(var(--fill)/0.6)] animate-pulse" />
        <div className="h-3 w-48 rounded-md bg-[hsl(var(--fill)/0.4)] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="rounded-[20px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card)/0.9)] overflow-hidden">
      <div className="h-[2px] bg-gradient-to-r from-[hsl(var(--brand))] via-[hsl(var(--brand-ai))] to-transparent" />
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-[hsl(var(--brand-ai))]" strokeWidth={2} />
          <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[hsl(var(--brand-ai))]">Atlas Coach</span>
          {focus && (
            <span className="ml-auto text-[10px] font-bold uppercase tracking-[0.08em] text-[hsl(var(--fg-3))] bg-[hsl(var(--fill)/0.6)] px-2 py-0.5 rounded-full">{focus}</span>
          )}
        </div>
        <p className="text-[15px] font-semibold text-[hsl(var(--fg))] leading-snug">{text || 'Welcome back.'}</p>
        {primaryAction && (
          <Link
            to={primaryAction.path}
            className="mt-4 flex items-center justify-center gap-2 h-11 w-full rounded-[13px] bg-[hsl(var(--brand))] text-white text-[14px] font-semibold transition-opacity hover:opacity-90 active:opacity-75"
          >
            {primaryAction.label}
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
          </Link>
        )}
      </div>
    </div>
  );
}

// ─── Quick Action Tile ─────────────────────────────────────────────────────────

function ActionTile({ icon: Icon, label, done, to, onClick }) {
  const content = (
    <div className={`flex flex-col items-center justify-center gap-1.5 rounded-[16px] border p-3 transition-colors active:scale-[0.97] ${
      done
        ? 'border-[hsl(var(--ok)/0.25)] bg-[hsl(var(--ok)/0.06)]'
        : 'border-[hsl(var(--border)/0.7)] bg-[hsl(var(--fill)/0.3)]'
    }`}>
      <Icon className={`w-5 h-5 ${done ? 'text-[hsl(var(--ok))]' : 'text-[hsl(var(--fg-2))]'}`} strokeWidth={1.8} />
      <span className={`text-[11px] font-semibold ${done ? 'text-[hsl(var(--ok))]' : 'text-[hsl(var(--fg-2))]'}`}>{label}</span>
    </div>
  );

  if (onClick) return <button onClick={onClick} className="text-center">{content}</button>;
  return <Link to={to} className="text-center">{content}</Link>;
}

// ─── Plan Card ─────────────────────────────────────────────────────────────────

function PlanCard({ icon: Icon, label, value, sub, to, color = 'brand' }) {
  return (
    <Link to={to} className="flex items-center gap-3 rounded-[16px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card)/0.9)] px-4 py-3.5 active:bg-[hsl(var(--fill)/0.4)] transition-colors">
      <div className={`w-9 h-9 rounded-[12px] flex items-center justify-center bg-[hsl(var(--${color})/0.1)] text-[hsl(var(--${color}))]`}>
        <Icon className="w-4 h-4" strokeWidth={1.9} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[hsl(var(--fg))]">{label}</p>
        {sub && <p className="text-[11px] text-[hsl(var(--fg-3))] mt-0.5">{sub}</p>}
      </div>
      <p className="text-[15px] font-bold text-[hsl(var(--fg))] shrink-0">{value}</p>
    </Link>
  );
}

// ─── Recommendation Card ───────────────────────────────────────────────────────

function RecCard({ rec, onDismiss }) {
  return (
    <div className="rounded-[16px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--fill)/0.3)] p-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-[hsl(var(--fg))]">{rec.title}</p>
          {rec.reason && <p className="text-[11px] text-[hsl(var(--fg-3))] mt-1 leading-4">{rec.reason}</p>}
        </div>
        <button onClick={() => onDismiss?.(rec)} className="text-[11px] text-[hsl(var(--fg-3))] hover:text-[hsl(var(--fg-2))] shrink-0">dismiss</button>
      </div>
      {rec.actionPath && (
        <Link to={rec.actionPath} className="mt-2.5 flex items-center gap-1.5 text-[12px] font-semibold text-[hsl(var(--brand))]">
          {rec.actionLabel || 'Do this'} <ArrowRight className="w-3 h-3" strokeWidth={2.5} />
        </Link>
      )}
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────

function TodayContent() {
  const { user } = useAuth();
  const { locale } = useI18n();
  const navigate = useNavigate();
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    if (!navigator?.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude.toFixed(4)}&longitude=${coords.longitude.toFixed(4)}&current=temperature_2m,weather_code`
          );
          if (!res.ok) return;
          const json = await res.json();
          const temp = Math.round(json.current?.temperature_2m ?? 0);
          const code = json.current?.weather_code ?? 0;
          setWeather(interpretWeather(temp, code));
        } catch {}
      },
      () => {},
      { timeout: 6000, maximumAge: 600000 }
    );
  }, []);

  const daily = useDailyStateV2();
  const ai = useAICoach({ userId: user?.id });

  // Briefing: AI when available, rules-based fallback
  const kcalRemaining = Math.max(0, (daily.nutrition.caloriesTarget || 2000) - daily.nutrition.caloriesConsumed);
  const briefing = ai.briefing
    ? { text: ai.briefing.body || ai.briefing.title, focus: ai.briefing.focus, primaryAction: null, secondaryAction: null }
    : buildBriefing({
        workoutDone: daily.workoutDone,
        nutritionLogged: daily.nutritionLogged,
        hasActivePlan: daily.plan.id != null,
        planName: daily.plan.name,
        preferredName: daily.preferredName,
        kcalRemaining,
      });

  // Recommendations: AI when available, rules-based fallback (max 2)
  const recs = (ai.recommendations?.length > 0)
    ? ai.recommendations.slice(0, 2)
    : buildRecommendations({
        workoutDone: daily.workoutDone,
        hasActivePlan: daily.plan.id != null,
        proteinConsumed: daily.nutrition.proteinConsumed,
        proteinTarget: daily.nutrition.proteinTarget,
        weightLogged: daily.weightLogged,
        hasPhotos: false,
      });

  return (
    <TodayScreen>

      {/* Header */}
      <header className="pt-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-[hsl(var(--fg-3))]">{getDateLabel(locale)}</p>
            <h1 className="text-[24px] font-bold tracking-[-0.03em] text-[hsl(var(--fg))] leading-tight mt-0.5">
              {getGreeting(daily.preferredName)}
            </h1>
            {weather?.comment && (
              <p className="text-[12px] text-[hsl(var(--fg-3))] mt-1">{weather.comment}</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0 mt-1">
            {weather && (
              <div className="flex items-center gap-1.5 rounded-full bg-[hsl(var(--fill)/0.8)] border border-[hsl(var(--border)/0.5)] px-2.5 py-1">
                <span className="text-[15px] leading-none">{weather.icon}</span>
                <span className="text-[12px] font-semibold text-[hsl(var(--fg-2))]">{weather.temp}°</span>
              </div>
            )}
            <button
              onClick={() => navigate('/notifications')}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--fill)/0.5)] text-[hsl(var(--fg-2))]"
            >
              <Bell className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      </header>

      {/* AI Hero */}
      <HeroCard
        text={briefing.text}
        focus={briefing.focus}
        primaryAction={briefing.primaryAction}
        loading={daily.isLoading}
      />

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-2">
        <ActionTile icon={Dumbbell} label={daily.workoutDone ? 'Done' : 'Train'} done={daily.workoutDone} to={ROUTES.workouts} />
        <ActionTile icon={UtensilsCrossed} label={daily.nutritionLogged ? 'Logged' : 'Eat'} done={daily.nutritionLogged} to={ROUTES.nutrition} />
        <ActionTile icon={Scale} label={daily.weightLogged ? 'Logged' : 'Weight'} done={daily.weightLogged} onClick={() => setCheckinOpen(true)} />
        <ActionTile icon={Heart} label="Check in" onClick={() => setCheckinOpen(true)} />
      </div>

      {/* Today Plan */}
      <div className="space-y-2.5">
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[hsl(var(--fg-3))] px-0.5">Today's plan</p>

        <PlanCard
          icon={Dumbbell}
          label={daily.workoutDone ? 'Workout complete' : (daily.plan.name || 'No plan')}
          value={daily.workoutDone ? '✓' : (daily.plan.todayExercises.length > 0 ? `${daily.plan.todayExercises.length} ex` : '—')}
          sub={daily.workoutDone ? daily.workout.sessionName : daily.plan.todayDayLabel}
          to={ROUTES.workouts}
          color={daily.workoutDone ? 'ok' : 'brand'}
        />

        <PlanCard
          icon={Flame}
          label="Nutrition"
          value={daily.nutrition.caloriesTarget > 0 ? `${Math.round(kcalRemaining)} left` : '—'}
          sub={`${daily.nutrition.mealsLogged} meals · ${Math.round(daily.nutrition.proteinConsumed)}g protein`}
          to={ROUTES.nutrition}
        />

        {daily.protocols.dueToday > 0 && (
          <PlanCard
            icon={Pill}
            label="Protocols"
            value={`${daily.protocols.completedToday}/${daily.protocols.dueToday}`}
            sub={daily.protocols.pending > 0 ? `${daily.protocols.pending} pending` : 'All done'}
            to={ROUTES.protocols}
            color={daily.protocols.pending > 0 ? 'warn' : 'ok'}
          />
        )}
      </div>

      {/* Recommendations */}
      {Array.isArray(recs) && recs.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-0.5">
            <Sparkles className="w-3.5 h-3.5 text-[hsl(var(--brand-ai))]" strokeWidth={2} />
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[hsl(var(--fg-3))]">For you</p>
          </div>
          {recs.map((rec, i) => (
            <RecCard key={rec.id || i} rec={rec} onDismiss={ai.dismissRec} />
          ))}
        </div>
      )}

      {/* Body Check-in Sheet */}
      <BodyCheckinSheet open={checkinOpen} onOpenChange={setCheckinOpen} />

    </TodayScreen>
  );
}

export default function TodayV2() {
  return <TodayContent />;
}
