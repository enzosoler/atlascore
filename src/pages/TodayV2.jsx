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
  Bell, Dumbbell, UtensilsCrossed, Scale, Heart,
  ArrowRight, Flame, Pill,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';
import { useI18n, useT } from '@/lib/i18nContext';
import { useDailyStateV2 } from '@/hooks/useDailyStateV2';
import { useAICoach } from '@/hooks/useAICoach';
import { useCoachChat } from '@/hooks/useCoachChat';
import { buildBriefing, buildRecommendations } from '@/lib/rulesEngine';
import { ROUTES } from '@/lib/routes';
import { TodayScreen } from '@/components/today/TodayMobileUI';
import BodyCheckinSheet from '@/components/body/BodyCheckinSheet';
import CoachChatTrigger from '@/components/ai/CoachChatTrigger';
import CoachChatSheet from '@/components/ai/CoachChatSheet';

// ─── Date / greeting / weather helpers ─────────────────────────────────────────

function getDateLabel(locale) {
  const intlLocale = locale === 'pt-BR' ? 'pt-BR' : locale === 'es' ? 'es' : 'en-US';
  return new Intl.DateTimeFormat(intlLocale, {
    weekday: 'long', month: 'long', day: 'numeric',
  }).format(new Date());
}

function getFirstName(fullName) {
  if (!fullName) return '';
  const [first] = String(fullName).split(/[\s@._-]+/).filter(Boolean);
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

function interpretWeather(temp, code, t) {
  let icon, condition;
  if (code === 0)       { icon = '☀️'; condition = 'clear'; }
  else if (code <= 3)   { icon = '⛅'; condition = 'cloudy'; }
  else if (code <= 48)  { icon = '🌫️'; condition = 'foggy'; }
  else if (code <= 67)  { icon = '🌧️'; condition = 'rainy'; }
  else if (code <= 77)  { icon = '❄️'; condition = 'snowy'; }
  else if (code <= 82)  { icon = '🌦️'; condition = 'showers'; }
  else                  { icon = '⛈️'; condition = 'stormy'; }
  
  // Use fallback translations if i18n keys are missing
  const fallbackComments = {
    clear:   temp > 28 ? 'Hot day' : temp < 10 ? 'Cold day' : 'Clear day',
    cloudy:  'Overcast',
    foggy:   'Foggy',
    rainy:   'Rainy',
    snowy:   'Snowy',
    showers: 'Showers',
    stormy:  'Stormy',
  };
  
  const comments = {
    clear:   temp > 28 ? (t?.('today.weather.hot') ?? 'Hot day') : temp < 10 ? (t?.('today.weather.cold') ?? 'Cold day') : (t?.('today.weather.clear') ?? 'Clear day'),
    cloudy:  (t?.('today.weather.cloudy') ?? 'Overcast'),
    foggy:   (t?.('today.weather.foggy') ?? 'Foggy'),
    rainy:   (t?.('today.weather.rainy') ?? 'Rainy'),
    snowy:   (t?.('today.weather.snowy') ?? 'Snowy'),
    showers: (t?.('today.weather.showers') ?? 'Showers'),
    stormy:  (t?.('today.weather.stormy') ?? 'Stormy'),
  };
  
  const comment = comments[condition];
  
  // Only return weather comment if we actually have weather data
  // Don't show fake weather descriptions
  if (!comment || comment === fallbackComments[condition]) {
    return { temp, icon, comment: null };
  }
  
  return { temp, icon, comment };
}

// ─── Hero Card ─────────────────────────────────────────────────────────────────

function HeroCard({ text, focus, primaryAction, loading }) {
  if (loading) {
    return (
      <div className="space-y-2.5 rounded-2xl bg-[hsl(var(--card))] shadow-[var(--shadow-xs)] p-5">
        <div className="h-4 w-44 rounded-lg bg-[hsl(var(--fill))] animate-pulse" />
        <div className="h-3 w-60 rounded-lg bg-[hsl(var(--fill)/0.6)] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-[hsl(var(--card))] shadow-[var(--shadow-xs)] p-5 space-y-3">
      <p className="text-[15px] font-medium text-[hsl(var(--fg-2))] leading-relaxed">{text}</p>
      {primaryAction && (
        <Button asChild variant="outline" size="sm" className="rounded-xl">
          <Link to={primaryAction.path}>
            {primaryAction.label}
            <ArrowRight className="w-3.5 h-3.5 ml-1" strokeWidth={2} />
          </Link>
        </Button>
      )}
    </div>
  );
}

// ─── Quick Action Tile ─────────────────────────────────────────────────────────

function ActionTile({ icon: Icon, label, done = false, to, onClick }) {
  const content = (
    <div className={`flex flex-col items-center justify-center gap-2 rounded-2xl py-4 px-3 transition-all active:scale-[0.97] ${
      done
        ? 'bg-[hsl(var(--ok)/0.06)]'
        : 'bg-[hsl(var(--card))] shadow-[var(--shadow-xs)]'
    }`}>
      <Icon className={`w-5 h-5 ${done ? 'text-[hsl(var(--ok))]' : 'text-[hsl(var(--fg-3))]'}`} strokeWidth={1.8} />
      <span className={`text-[11px] font-semibold ${done ? 'text-[hsl(var(--ok))]' : 'text-[hsl(var(--fg-2))]'}`}>{label}</span>
    </div>
  );

  if (onClick) return <button onClick={onClick} className="text-center w-full">{content}</button>;
  return <Link to={to} className="text-center">{content}</Link>;
}

// ─── Plan Card ─────────────────────────────────────────────────────────────────

const planIconColors = {
  brand: 'bg-[hsl(var(--brand)/0.08)] text-[hsl(var(--brand))]',
  ok: 'bg-[hsl(var(--ok)/0.08)] text-[hsl(var(--ok))]',
  warn: 'bg-[hsl(var(--warn)/0.08)] text-[hsl(var(--warn))]',
};

function PlanCard({ icon: Icon, label, value, sub, to, color = 'brand' }) {
  return (
    <Link to={to} className="flex items-center gap-3.5 rounded-2xl px-4 py-3.5 bg-[hsl(var(--card))] shadow-[var(--shadow-xs)] active:bg-[hsl(var(--fill)/0.4)] transition-colors">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${planIconColors[color] || planIconColors.brand}`}>
        <Icon className="w-4 h-4" strokeWidth={1.8} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[hsl(var(--fg))] tracking-[-0.01em]">{label}</p>
        {sub && <p className="text-[11px] text-[hsl(var(--fg-3))] mt-0.5">{sub}</p>}
      </div>
      <p className="text-[14px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg-2))] shrink-0">{value}</p>
    </Link>
  );
}

// ─── Recommendation Card ───────────────────────────────────────────────────────

function RecCard({ rec, onDismiss }) {
  const t = useT();
  return (
    <div className="flex items-start gap-3 py-3 px-4 rounded-2xl bg-[hsl(var(--card))] shadow-[var(--shadow-xs)]">
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-[hsl(var(--fg))]">{rec.title}</p>
        {rec.reason && <p className="text-[12px] text-[hsl(var(--fg-3))] mt-0.5 leading-relaxed">{rec.reason}</p>}
        {rec.actionPath && (
          <Link to={rec.actionPath} className="mt-1.5 inline-flex items-center gap-1 text-[12px] font-semibold text-[hsl(var(--brand))]">
            {rec.actionLabel || t('today.doThis')} <ArrowRight className="w-3 h-3" strokeWidth={2} />
          </Link>
        )}
      </div>
      <button onClick={() => onDismiss?.(rec)} className="text-[12px] py-1 px-2 text-[hsl(var(--fg-3))] shrink-0 rounded-lg hover:bg-[hsl(var(--fill))] transition-colors">
        {rec.dismissLabel || t('common.dismiss')}
      </button>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────

function TodayContent() {
  const { user } = useAuth();
  const { locale } = useI18n();
  const t = useT();
  const navigate = useNavigate();
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
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
          setWeather(interpretWeather(temp, code, t));
        } catch {}
      },
      () => {},
      { timeout: 6000, maximumAge: 600000 }
    );
  }, []);

  const daily = useDailyStateV2();
  const ai = useAICoach({ userId: user?.id });

  const chat = useCoachChat({
    userId: user?.id,
    invalidateAfterAction: daily.invalidateAfterAction,
    activePlan: daily.activePlan,
  });

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
        t,
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
        t,
      });

  return (
    <TodayScreen>

      {/* Header */}
      <header className="pt-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-footnote text-[hsl(var(--fg-3))]">{getDateLabel(locale)}</p>
            <h1 className="text-title2 text-[hsl(var(--fg))] leading-tight mt-0.5">
              {getGreeting(daily.preferredName, t)}
            </h1>
            {weather?.comment && (
              <p className="text-caption1 text-[hsl(var(--fg-3))] mt-1">{weather.comment}</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0 mt-1">
            {weather && (
              <div className="flex items-center gap-1 text-[hsl(var(--fg-3))]">
                <span className="text-[14px] leading-none">{weather.icon}</span>
                <span className="text-[13px] font-medium">{weather.temp}°</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(ROUTES.notifications)}
              className="w-8 h-8 rounded-full text-[hsl(var(--fg-3))]"
            >
              <Bell className="w-4 h-4" strokeWidth={1.8} />
            </Button>
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

      {/* AI Coach Chat Trigger */}
      <CoachChatTrigger
        pageContext="today"
        onOpen={() => setChatOpen(true)}
        onSuggestion={(text) => { setChatOpen(true); chat.sendMessage(text, 'today'); }}
      />

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <ActionTile icon={Dumbbell} label={daily.workoutDone ? t('today.actions.done') : t('today.actions.train')} done={daily.workoutDone} to={ROUTES.workouts} />
        <ActionTile icon={UtensilsCrossed} label={daily.nutritionLogged ? t('today.actions.logged') : t('today.actions.eat')} done={daily.nutritionLogged} to={ROUTES.nutrition} />
        <ActionTile icon={Scale} label={daily.weightLogged ? t('today.actions.logged') : t('today.actions.weight')} done={daily.weightLogged} onClick={() => setCheckinOpen(true)} />
        <ActionTile icon={Heart} label={t('today.actions.checkin')} onClick={() => setCheckinOpen(true)} />
      </div>

      {/* Today Plan */}
      <div className="space-y-2">
        <p className="atlas-overline px-0.5">{t('today.plan.title')}</p>

        <PlanCard
          icon={Dumbbell}
          label={daily.workoutDone ? t('today.plan.workoutComplete') : (daily.plan.name || t('today.plan.noPlan'))}
          value={daily.workoutDone ? '✓' : (daily.plan.todayExercises.length > 0 ? `${daily.plan.todayExercises.length} ${t('today.plan.ex')}` : '—')}
          sub={daily.workoutDone ? daily.workout.sessionName : (daily.plan.todayDayLabel || t('today.plan.day', { n: daily.plan.todayDayIndex + 1 }))}
          to={ROUTES.workouts}
          color={daily.workoutDone ? 'ok' : 'brand'}
        />

        <PlanCard
          icon={Flame}
          label={t('today.plan.nutrition')}
          value={daily.nutrition.caloriesTarget > 0 ? `${Math.round(kcalRemaining)} ${t('today.plan.left')}` : '—'}
          sub={`${daily.nutrition.mealsLogged} ${t('today.plan.meals')} · ${Math.round(daily.nutrition.proteinConsumed)}g ${t('today.plan.protein')}`}
          to={ROUTES.nutrition}
        />

        {daily.protocols.dueToday > 0 && (
          <PlanCard
            icon={Pill}
            label={t('today.plan.protocols')}
            value={`${daily.protocols.completedToday}/${daily.protocols.dueToday}`}
            sub={daily.protocols.pending > 0 ? `${daily.protocols.pending} ${t('today.plan.pending')}` : t('today.plan.allDone')}
            to={ROUTES.protocols}
            color={daily.protocols.pending > 0 ? 'warn' : 'ok'}
          />
        )}
      </div>

      {/* Recommendations */}
      {Array.isArray(recs) && recs.length > 0 && (
        <div className="space-y-2">
          <p className="atlas-overline px-0.5">{t('today.forYou')}</p>
          {recs.map((rec, i) => (
            <RecCard key={rec.id || i} rec={rec} onDismiss={ai.dismissRec} />
          ))}
        </div>
      )}

      {/* Body Check-in Sheet */}
      <BodyCheckinSheet open={checkinOpen} onOpenChange={setCheckinOpen} />

      {/* AI Coach Chat Sheet */}
      <CoachChatSheet
        open={chatOpen}
        onOpenChange={setChatOpen}
        messages={chat.messages}
        isTyping={chat.isTyping}
        actionStates={chat.actionStates}
        onSendMessage={chat.sendMessage}
        onConfirmAction={chat.executeAction}
        onDismissAction={chat.dismissAction}
        pageContext="today"
      />

    </TodayScreen>
  );
}

export default function TodayV2() {
  return <TodayContent />;
}
