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
  Target,
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
  
  // Smart contextual comments based on actual weather + time of day + user intent
  const hour = new Date().getHours();
  const isMorning = hour >= 5 && hour < 12;
  const isAfternoon = hour >= 12 && hour < 17;
  const isEvening = hour >= 17 && hour < 21;
  
  // Contextual weather messages that are safe and motivating
  const contextualComments = {
    clear: {
      morning: temp > 20 ? 'Great morning for outdoor training' : 'Cool start, perfect for focus',
      afternoon: temp > 25 ? 'Hot afternoon, stay hydrated' : 'Perfect conditions for activity',
      evening: temp > 18 ? 'Pleasant evening for recovery' : 'Cool evening, ideal for rest',
    },
    cloudy: {
      morning: 'Overcast morning, great for consistent work',
      afternoon: 'Comfortable conditions, no distractions',
      evening: 'Calm evening, perfect for planning',
    },
    foggy: {
      morning: 'Foggy start, stay focused on goals',
      afternoon: 'Limited visibility, time for indoor work',
      evening: 'Mysterious evening, reflect on progress',
    },
    rainy: {
      morning: 'Rainy morning, perfect for indoor training',
      afternoon: 'Rainy afternoon, ideal for recovery work',
      evening: 'Cozy evening, great for meal prep',
    },
    snowy: {
      morning: 'Snowy morning, extra energy for warming up',
      afternoon: 'Winter conditions, conserve energy wisely',
      evening: 'Cold evening, focus on nutrition',
    },
    showers: {
      morning: 'Intermittent showers, flexible training day',
      afternoon: 'Showers passing, time for quick sessions',
      evening: 'Wet evening, prioritize recovery',
    },
    stormy: {
      morning: 'Stormy morning, safety first today',
      afternoon: 'Rough weather, perfect for rest and planning',
      evening: 'Stormy evening, stay safe and recover',
    },
  };
  
  // Neutral fallback messages when weather is unavailable
  const neutralMessages = [
    'Focus on consistency today',
    'Every day is progress',
    'Stay committed to your goals',
    'Building momentum daily',
    'Execution over everything',
    'Progress is a habit',
  ];
  
  // Get contextual comment if weather data exists
  const timeOfDay = isMorning ? 'morning' : isAfternoon ? 'afternoon' : isEvening ? 'evening' : 'morning';
  const weatherComment = contextualComments[condition]?.[timeOfDay];
  
  // Return weather data with smart comment or neutral fallback
  if (weatherComment && t) {
    return { temp, icon, comment: weatherComment };
  }
  
  // If no weather data or translation issues, return neutral message
  const neutralComment = neutralMessages[Math.floor(Math.random() * neutralMessages.length)];
  return { temp, icon, comment: neutralComment };
}

// ─── Dynamic Hero Component ─────────────────────────────────────────────────────────

function DynamicHero({ weather, greeting, locale }) {
  const hour = new Date().getHours();
  
  // Time of day definitions
  const isMorning = hour >= 5 && hour < 12;
  const isAfternoon = hour >= 12 && hour < 17;
  const isEvening = hour >= 17 && hour < 21;
  const isNight = hour >= 21 || hour < 5;
  
  const timeOfDay = isMorning ? 'morning' : isAfternoon ? 'afternoon' : isEvening ? 'evening' : 'night';
  
  // Weather condition from API
  const weatherCondition = weather?.condition || 'clear';
  
  // Dynamic gradient backgrounds based on time + weather
  const gradientVariants = {
    // Morning variants
    'morning-clear': 'from-orange-100 via-yellow-50 to-blue-100',
    'morning-cloudy': 'from-gray-100 via-slate-50 to-blue-50',
    'morning-rainy': 'from-gray-200 via-slate-100 to-blue-100',
    'morning-stormy': 'from-gray-300 via-slate-200 to-gray-100',
    
    // Afternoon variants  
    'afternoon-clear': 'from-blue-100 via-cyan-50 to-yellow-50',
    'afternoon-cloudy': 'from-gray-100 via-slate-50 to-blue-50',
    'afternoon-rainy': 'from-gray-200 via-slate-100 to-blue-100',
    'afternoon-stormy': 'from-gray-300 via-slate-200 to-gray-100',
    
    // Evening variants
    'evening-clear': 'from-orange-200 via-pink-100 to-purple-100',
    'evening-cloudy': 'from-gray-200 via-slate-100 to-purple-50',
    'evening-rainy': 'from-gray-300 via-slate-200 to-blue-100',
    'evening-stormy': 'from-gray-400 via-slate-300 to-gray-200',
    
    // Night variants
    'night-clear': 'from-slate-900 via-blue-900 to-slate-800',
    'night-cloudy': 'from-slate-800 via-gray-800 to-slate-700',
    'night-rainy': 'from-slate-900 via-blue-800 to-gray-800',
    'night-stormy': 'from-gray-900 via-slate-900 to-black',
  };
  
  const gradientKey = `${timeOfDay}-${weatherCondition}`;
  const backgroundGradient = gradientVariants[gradientKey] || gradientVariants['morning-clear'];
  
  // Text color based on time
  const isDarkTime = isNight || (isEvening && weatherCondition !== 'clear');
  const textColor = isDarkTime ? 'text-white' : 'text-gray-900';
  const subTextColor = isDarkTime ? 'text-gray-200' : 'text-gray-600';
  
  return (
    <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${backgroundGradient} transition-all duration-1000`}>
      {/* Subtle noise overlay for depth */}
      <div className="absolute inset-0 opacity-30 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsdGVyVW5pdHM9InVzZXJTcGFjZU25vdGhpbmciIgLz48ZmVUcmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWx0ZXI9InVybCgjZmZmZmZmYiIC8+PC9mZT48L2ZpbHRlcj48L3N2Zz4=')]" />
      
      {/* Dark overlay for text readability */}
      <div className={`absolute inset-0 ${isDarkTime ? 'bg-black/20' : 'bg-white/10'}`} />
      
      {/* Content */}
      <div className="relative z-10 p-8 text-center">
        <div className="max-w-md mx-auto">
          {/* Greeting */}
          <h1 className={`text-3xl font-bold mb-2 ${textColor} leading-tight`}>
            {greeting}
          </h1>
          
          {/* Weather info */}
          {weather && (
            <div className={`flex items-center justify-center gap-3 mb-4 ${subTextColor}`}>
              <span className="text-2xl">{weather.icon}</span>
              <div className="text-left">
                <p className="text-sm font-medium capitalize">{weather.condition}</p>
                <p className="text-lg font-semibold">{weather.temp}°</p>
              </div>
            </div>
          )}
          
          {/* Weather comment */}
          {weather?.comment && (
            <p className={`text-sm ${subTextColor} italic max-w-sm mx-auto`}>
              {weather.comment}
            </p>
          )}
        </div>
      </div>
    </div>
  );
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

      {/* Dynamic Hero - Priority 1 */}
      <div className="mb-6">
        <DynamicHero 
          weather={weather} 
          greeting={getGreeting(daily.preferredName, t)}
          locale={locale}
        />
      </div>

      {/* ONE Primary Next Action - Priority 2 */}
      {briefing.primaryAction && (
        <div className="mb-6">
          <ActionLink 
            to={briefing.primaryAction.path}
            content={
              <div className="flex items-center gap-3 rounded-2xl bg-[hsl(var(--brand))] text-white px-6 py-4 shadow-lg">
                <Dumbbell className="w-5 h-5" />
                <span className="text-[16px] font-semibold">{briefing.primaryAction.label}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            }
          />
        </div>
      )}

      {/* Coach Input - Priority 3 */}
      <div className="mb-6">
        <CoachChatTrigger />
      </div>

      {/* Quick Actions (4) - Priority 4 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <ActionLink
          to={ROUTES.workouts}
          content={
            <div className="flex items-center gap-3 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border)/0.5)] p-4">
              <Dumbbell className="w-5 h-5 text-[hsl(var(--brand))]" />
              <div>
                <p className="text-[14px] font-semibold text-[hsl(var(--fg))]">Workout</p>
                <p className="text-[12px] text-[hsl(var(--fg-3))]">{daily.workoutDone ? 'Completed' : 'Start today'}</p>
              </div>
            </div>
          }
        />
        <ActionLink
          to={ROUTES.nutrition}
          content={
            <div className="flex items-center gap-3 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border)/0.5)] p-4">
              <UtensilsCrossed className="w-5 h-5 text-[hsl(var(--brand-ai))]" />
              <div>
                <p className="text-[14px] font-semibold text-[hsl(var(--fg))]">Nutrition</p>
                <p className="text-[12px] text-[hsl(var(--fg-3))]">{daily.nutritionLogged ? 'Track meals' : 'Log first meal'}</p>
              </div>
            </div>
          }
        />
      </div>

      {/* Recommendations - Only if compelling */}
      {recs.length > 0 && (
        <div className="mb-6">
          <p className="text-[13px] font-medium text-[hsl(var(--fg-3))] mb-3">Recommendations</p>
          <div className="space-y-3">
            {recs.map((rec) => (
              <RecCard key={rec.id} rec={rec} />
            ))}
          </div>
        </div>
      )}

      {/* Coach Chat Sheet */}
      <CoachChatSheet isOpen={chatOpen} onOpenChange={setChatOpen} />
      <BodyCheckinSheet isOpen={checkinOpen} onOpenChange={setCheckinOpen} />
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
