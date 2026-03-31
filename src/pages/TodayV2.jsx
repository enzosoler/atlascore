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

function getTimeOfDay(hour) {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

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
  const t = useT();
  const hour = new Date().getHours();
  
  console.log('DynamicHero props:', { weather, greeting, locale });
  
  // Time-based atmospheric gradients
  const getAtmosphericGradient = (hour, weatherCondition) => {
    const timeOfDay = getTimeOfDay(hour);
    
    const gradients = {
      morning: {
        clear: 'bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100',
        cloudy: 'bg-gradient-to-br from-gray-50 via-slate-50 to-blue-50',
        rainy: 'bg-gradient-to-br from-slate-100 via-gray-100 to-blue-100',
        default: 'bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100'
      },
      afternoon: {
        clear: 'bg-gradient-to-br from-blue-50 via-cyan-50 to-white',
        cloudy: 'bg-gradient-to-br from-gray-50 via-slate-50 to-neutral-50',
        rainy: 'bg-gradient-to-br from-gray-100 via-slate-100 to-blue-50',
        default: 'bg-gradient-to-br from-blue-50 via-cyan-50 to-white'
      },
      evening: {
        clear: 'bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100',
        cloudy: 'bg-gradient-to-br from-slate-100 via-gray-100 to-purple-50',
        rainy: 'bg-gradient-to-br from-gray-200 via-slate-200 to-blue-100',
        default: 'bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100'
      },
      night: {
        clear: 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800',
        cloudy: 'bg-gradient-to-br from-slate-800 via-gray-800 to-slate-700',
        rainy: 'bg-gradient-to-br from-slate-900 via-gray-900 to-blue-900',
        default: 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800'
      }
    };
    
    return gradients[timeOfDay]?.[weatherCondition] || gradients[timeOfDay].default;
  };

  // Contextual messages based on time and conditions
  const getContextualMessage = (hour, weather) => {
    const timeOfDay = getTimeOfDay(hour);
    
    if (!weather) {
      const messages = {
        morning: t('today.hero.morning.focus'),
        afternoon: t('today.hero.afternoon.energy'),
        evening: t('today.hero.evening.consistency'),
        night: t('today.hero.night.recovery')
      };
      return messages[timeOfDay];
    }
    
    // Weather-aware contextual messages
    if (weather.condition === 'clear') {
      const messages = {
        morning: t('today.hero.morning.perfect'),
        afternoon: t('today.hero.afternoon.strong'),
        evening: t('today.hero.evening.clear'),
        night: t('today.hero.night.clear')
      };
      return messages[timeOfDay];
    }
    
    return t('today.hero.default.consistency');
  };

  // Safe defaults
  const safeWeather = weather || { temp: 20, condition: 'clear', icon: '☀️' };
  const safeGreeting = greeting || t('today.greeting.default');
  const timeOfDay = getTimeOfDay(hour);
  const weatherCondition = safeWeather.condition || 'clear';
  
  console.log('DynamicHero config:', { timeOfDay, weatherCondition, hour });
  
  const backgroundGradient = getAtmosphericGradient(hour, weatherCondition);
  const contextualMessage = getContextualMessage(hour, safeWeather);
  
  console.log('DynamicHero gradient:', { backgroundGradient });
  
  // Time-based text colors
  const textColors = {
    morning: 'text-amber-900',
    afternoon: 'text-blue-900', 
    evening: 'text-purple-900',
    night: 'text-slate-100'
  };
  
  const subTextColors = {
    morning: 'text-amber-700',
    afternoon: 'text-blue-700',
    evening: 'text-purple-700', 
    night: 'text-slate-300'
  };
  
  const textColor = textColors[timeOfDay];
  const subTextColor = subTextColors[timeOfDay];
  const isDarkTime = timeOfDay === 'night';

  try {
    return (
      <div className={`relative overflow-hidden rounded-3xl ${backgroundGradient} transition-all duration-1000`}>
        {/* Atmospheric light source overlay */}
        <div className={`absolute inset-0 opacity-20 ${
          timeOfDay === 'morning' ? 'bg-radial-gradient from-amber-200 at-20%_20% to-transparent' :
          timeOfDay === 'afternoon' ? 'bg-radial-gradient from-blue-100 at-50%_10% to-transparent' :
          timeOfDay === 'evening' ? 'bg-radial-gradient from-purple-200 at-80%_20% to-transparent' :
          'bg-radial-gradient from-indigo-400 at-30%_30% to-transparent'
        }`} />
        
        {/* Subtle noise overlay for depth */}
        <div className="absolute inset-0 opacity-30 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsdGVyVW5pdHM9InVzZXJTcGFjZU5vdGhpbmciICAvPjxmZVRyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbHRlcj0idXJsKCNmZmZmZmYpIiAvPjwvZmlsdGVyPjwvc3ZnPj0=')]" />

        {/* Dark overlay for text readability */}
        <div className={`absolute inset-0 ${isDarkTime ? 'bg-black/20' : 'bg-white/10'}`} />

        {/* Content */}
        <div className="relative z-10 p-8 text-center">
          <div className="max-w-md mx-auto">
            {/* Greeting */}
            <h1 className={`text-3xl font-bold mb-3 ${textColor} leading-tight`}>
              {safeGreeting}
            </h1>

            {/* Contextual message */}
            <p className={`text-lg font-medium mb-4 ${subTextColor} leading-tight`}>
              {contextualMessage}
            </p>

            {/* Weather info */}
            {safeWeather && (
              <div className={`flex items-center justify-center gap-3 ${subTextColor}`}>
                <span className="text-2xl">{safeWeather.icon}</span>
                <div className="text-left">
                  <p className="text-sm font-medium capitalize">{safeWeather.condition}</p>
                  <p className="text-lg font-semibold">{safeWeather.temp}°</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('DynamicHero error:', error);
    // Fallback hero
    return (
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-100 to-purple-100 p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{safeGreeting}</h1>
        <p className="text-lg text-gray-700">{t('today.hero.default.consistency')}</p>
        {safeWeather && (
          <div className="flex items-center justify-center gap-3 text-gray-600">
            <span className="text-2xl">{safeWeather.icon}</span>
            <span className="text-lg font-semibold">{safeWeather.temp}°</span>
          </div>
        )}
      </div>
    );
  }
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
  console.log('TodayContent starting...');
  
  const { user } = useAuth();
  const { locale } = useI18n();
  const t = useT();
  const navigate = useNavigate();
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [weather, setWeather] = useState(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    console.log('Weather effect starting...');
    if (!navigator?.geolocation) {
      console.log('Geolocation not available');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          console.log('Weather API call:', { lat: coords.latitude, lon: coords.longitude });
          const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude.toFixed(4)}&longitude=${coords.longitude.toFixed(4)}&current=temperature_2m,weather_code`
          );
          if (!res.ok) {
            console.log('Weather API failed:', res.status);
            return;
          }
          const json = await res.json();
          console.log('Weather API response:', json);
          const temp = Math.round(json.current?.temperature_2m ?? 0);
          const code = json.current?.weather_code ?? 0;
          const weatherData = interpretWeather(temp, code, t);
          console.log('Weather data processed:', weatherData);
          setWeather(weatherData);
        } catch (error) {
          console.error('Weather fetch error:', error);
          setHasError(true);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setHasError(true);
      },
      { timeout: 6000, maximumAge: 600000 }
    );
  }, []);

  const daily = useDailyStateV2();
  const ai = useAICoach({ userId: user?.id });

  const chat = useCoachChat({
    userId: user?.id,
    invalidateAfterAction: daily?.invalidateAfterAction,
    activePlan: daily?.activePlan,
  });

  // Defensive defaults for all data
  const safeDaily = daily || {};
  const safePlan = safeDaily?.plan || {};
  const safeNutrition = safeDaily?.nutrition || {};
  const safeProtocols = safeDaily?.protocols || {};
  const safeAi = ai || {};
  const safeChat = chat || {};
  
  // Briefing: AI when available, rules-based fallback
  const kcalRemaining = Math.max(0, (safeNutrition.caloriesTarget || 2000) - (safeNutrition.caloriesConsumed || 0));
  const briefing = safeAi.briefing
    ? { text: safeAi.briefing.body || safeAi.briefing.title, focus: safeAi.briefing.focus, primaryAction: null, secondaryAction: null }
    : buildBriefing({
        workoutDone: safeDaily.workoutDone,
        nutritionLogged: safeDaily.nutritionLogged,
        hasActivePlan: safePlan.id != null,
        planName: safePlan.name,
        preferredName: safeDaily.preferredName,
        kcalRemaining,
        t,
      });

  // Recommendations: AI when available, rules-based fallback (max 2)
  const aiRecs = safeAi.recommendations || [];
  const fallbackRecs = buildRecommendations({
    workoutDone: safeDaily.workoutDone,
    hasActivePlan: safePlan.id != null,
    proteinConsumed: safeNutrition.proteinConsumed || 0,
    proteinTarget: safeNutrition.proteinTarget || 0,
    weightLogged: safeDaily.weightLogged,
    hasPhotos: false,
    t,
  }) || [];
  
  const recs = Array.isArray(aiRecs) && aiRecs.length > 0 ? aiRecs.slice(0, 2) : (Array.isArray(fallbackRecs) ? fallbackRecs : []);

  console.log('TodayContent state:', { safeDaily, weather, hasError, briefing, recs });

  try {
    return (
      <TodayScreen>
        {/* Error Fallback */}
        {hasError && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200">
            <p className="text-red-800">Something went wrong. Please refresh the page.</p>
          </div>
        )}

        {/* Dynamic Hero - Priority 1 */}
        <div className="mb-6">
          <DynamicHero 
            weather={weather} 
            greeting={getGreeting(safeDaily.preferredName, t)}
            locale={locale}
          />
        </div>

        {/* ONE Primary Next Action - Priority 2 */}
        {briefing.primaryAction && (
          <div className="mb-8">
            <Link to={briefing.primaryAction.path} className="block">
              <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-[hsl(var(--brand))] to-[hsl(var(--brand-dark))] text-white px-8 py-5 shadow-xl transform transition-all duration-200 hover:scale-105 active:scale-95">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <Dumbbell className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="text-[18px] font-bold leading-tight">{briefing.primaryAction.label}</p>
                    <p className="text-[13px] opacity-90 mt-1">{kcalRemaining > 0 ? `${kcalRemaining} kcal remaining` : 'Daily target met'}</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5" />
              </div>
            </Link>
          </div>
        )}

        {/* Coach Input - Priority 3 */}
        <div className="mb-6">
          <CoachChatTrigger />
        </div>

        {/* Quick Actions (4) - Priority 4 */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Link to={ROUTES.workouts} className="block">
            <div className="flex items-center gap-3 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border)/0.5)] p-4 transition-all duration-200 hover:bg-[hsl(var(--fill))] hover:shadow-md active:scale-95">
              <Dumbbell className="w-5 h-5 text-[hsl(var(--brand))]" />
              <div>
                <p className="text-[14px] font-semibold text-[hsl(var(--fg))]">Train</p>
                <p className="text-[12px] text-[hsl(var(--fg-3))]">{safeDaily.workoutDone ? 'Completed' : 'Start session'}</p>
              </div>
            </div>
          </Link>
          <Link to={ROUTES.nutrition} className="block">
            <div className="flex items-center gap-3 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border)/0.5)] p-4 transition-all duration-200 hover:bg-[hsl(var(--fill))] hover:shadow-md active:scale-95">
              <UtensilsCrossed className="w-5 h-5 text-[hsl(var(--brand-ai))]" />
              <div>
                <p className="text-[14px] font-semibold text-[hsl(var(--fg))]">Fuel</p>
                <p className="text-[12px] text-[hsl(var(--fg-3))]">{safeDaily.nutritionLogged ? 'Track meals' : 'Log first meal'}</p>
              </div>
            </div>
          </Link>
          <Link to={ROUTES.body} className="block">
            <div className="flex items-center gap-3 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border)/0.5)] p-4 transition-all duration-200 hover:bg-[hsl(var(--fill))] hover:shadow-md active:scale-95">
              <Scale className="w-5 h-5 text-[hsl(var(--ok))]" />
              <div>
                <p className="text-[14px] font-semibold text-[hsl(var(--fg))]">Check-in</p>
                <p className="text-[12px] text-[hsl(var(--fg-3))]">{safeDaily.weightLogged ? 'Logged' : 'Update metrics'}</p>
              </div>
            </div>
          </Link>
          <Link to={ROUTES.goals} className="block">
            <div className="flex items-center gap-3 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border)/0.5)] p-4 transition-all duration-200 hover:bg-[hsl(var(--fill))] hover:shadow-md active:scale-95">
              <Target className="w-5 h-5 text-[hsl(var(--warn))]" />
              <div>
                <p className="text-[14px] font-semibold text-[hsl(var(--fg))]">Progress</p>
                <p className="text-[12px] text-[hsl(var(--fg-3))]">Review trends</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Today's Plan - Priority 5 */}
        {safePlan.id && (
          <div className="mb-6">
            <PlanCard
              icon={Dumbbell}
              label={safePlan.name || 'Today\'s workout'}
              value={safeDaily.workoutDone ? 'Done' : 'Start'}
              sub={safePlan.todayExercises?.length ? `${safePlan.todayExercises.length} exercises` : null}
              to={ROUTES.workouts}
              color={safeDaily.workoutDone ? 'ok' : 'brand'}
            />
          </div>
        )}

        {/* Recommendations - Only if compelling */}
        {Array.isArray(recs) && recs.length > 0 && (
          <div className="mb-6">
            <p className="text-[13px] font-medium text-[hsl(var(--fg-3))] mb-3">Recommendations</p>
            <div className="space-y-3">
              {recs.map((rec) => (
                <RecCard key={rec.id || Math.random()} rec={rec} onDismiss={() => {}} />
              ))}
            </div>
          </div>
        )}

        {/* Coach Chat Sheet */}
        <CoachChatSheet open={chatOpen} onOpenChange={setChatOpen} />
        <BodyCheckinSheet open={checkinOpen} onOpenChange={setCheckinOpen} />
      </TodayScreen>
    );
  } catch (error) {
    console.error('TodayContent error:', error);
    setHasError(true);
    return (
      <TodayScreen>
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200">
          <p className="text-red-800">Something went wrong. Please refresh the page.</p>
        </div>
      </TodayScreen>
    );
  }
}

export default function TodayV2() {
  return <TodayContent />;
}
