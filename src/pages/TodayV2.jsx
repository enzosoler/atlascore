/**
 * TodayV2 — Redesigned for a high-end iPhone experience.
 * Focus: hierarchy, restraint, and native feel.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Dumbbell, UtensilsCrossed, Scale, Target,
  ArrowRight, Sparkles, ChevronRight
} from 'lucide-react';
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

// ─── Components ───────────────────────────────────────────────────────────────

function Header({ weather, greeting, locale }) {
  return (
    <header className="flex items-end justify-between px-0.5">
      <div className="space-y-0.5">
        <p className="text-[13px] font-medium text-[hsl(var(--fg-3))] uppercase tracking-tight">
          {getDateLabel(locale)}
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-[hsl(var(--fg))]">
          {greeting}
        </h1>
      </div>
      {weather && (
        <div className="flex items-center gap-1.5 mb-1 px-3 py-1.5 rounded-full bg-[hsl(var(--fill)/0.4)] border border-[hsl(var(--border)/0.5)]">
          <span className="text-sm">{weather.icon}</span>
          <span className="text-[13px] font-semibold text-[hsl(var(--fg-2))]">{weather.temp}°</span>
        </div>
      )}
    </header>
  );
}

function PrimaryAction({ action, briefingText, kcalRemaining }) {
  if (!action) return null;
  
  return (
    <Link to={action.path} className="group block">
      <div className="relative overflow-hidden rounded-[24px] bg-zinc-900 p-6 shadow-lg transition-all duration-300 active:scale-[0.98] active:brightness-90">
        {/* Subtle decorative glow - brand colored */}
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[hsl(var(--brand)/0.15)] blur-3xl" />
        <div className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-[hsl(var(--brand-ai)/0.1)] blur-3xl" />
        
        <div className="relative z-10 flex flex-col gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="flex h-1.5 w-1.5 rounded-full bg-[hsl(var(--brand))]" />
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-white/50">
                {action.label}
              </p>
            </div>
            <h2 className="text-[20px] font-bold leading-[1.2] tracking-tight text-white">
              {briefingText}
            </h2>
          </div>
          
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 backdrop-blur-md">
              <span className="text-[12px] font-bold text-white/90">
                {kcalRemaining > 0 ? `${kcalRemaining} kcal remaining` : 'Daily target met'}
              </span>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-zinc-900 shadow-xl transition-transform group-hover:translate-x-1">
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
  const ai = useAICoach({ userId: user?.id });
  
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

  return (
    <TodayScreen>
      {/* 1. Header */}
      <Header 
        weather={weather} 
        greeting={getGreeting(safeDaily.preferredName, t)}
        locale={locale}
      />

      {/* 2. Primary Action */}
      <PrimaryAction 
        action={briefing.primaryAction} 
        briefingText={briefing.text}
        kcalRemaining={kcalRemaining}
      />

      {/* 3. Coach Input */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-0.5">
          <h3 className="text-[13px] font-bold uppercase tracking-wider text-[hsl(var(--fg-3))]">Coach Guidance</h3>
          <Sparkles className="h-4 w-4 text-[hsl(var(--brand-ai))]" />
        </div>
        <CoachChatTrigger onOpen={() => setChatOpen(true)} />
      </section>

      {/* 4. Quick Actions Grid */}
      <section className="space-y-4">
        <h3 className="text-[13px] font-bold uppercase tracking-wider text-[hsl(var(--fg-3))] px-0.5">Focus Areas</h3>
        <div className="grid grid-cols-2 gap-3.5">
          <QuickAction 
            to={ROUTES.workouts}
            icon={Dumbbell}
            label="Training"
            status={safeDaily.workoutDone ? "Completed" : "Start now"}
            colorClass="bg-[hsl(var(--brand)/0.08)] text-[hsl(var(--brand))]"
          />
          <QuickAction 
            to={ROUTES.nutrition}
            icon={UtensilsCrossed}
            label="Nutrition"
            status={safeDaily.nutritionLogged ? "Tracked" : "Log fuel"}
            colorClass="bg-[hsl(var(--brand-ai)/0.08)] text-[hsl(var(--brand-ai))]"
          />
          <QuickAction 
            to={ROUTES.body}
            icon={Scale}
            label="Check-in"
            status={safeDaily.weightLogged ? "Logged" : "Scale weight"}
            colorClass="bg-[hsl(var(--ok)/0.08)] text-[hsl(var(--ok))]"
          />
          <QuickAction 
            to={ROUTES.goals}
            icon={Target}
            label="Progress"
            status="View trends"
            colorClass="bg-[hsl(var(--warn)/0.08)] text-[hsl(var(--warn))]"
          />
        </div>
      </section>

      {/* 5. Today's Plan Summary (if exists) */}
      {safePlan.id && !safeDaily.workoutDone && (
        <section className="space-y-4">
          <h3 className="text-[13px] font-bold uppercase tracking-wider text-[hsl(var(--fg-3))] px-0.5">Upcoming</h3>
          <Link to={ROUTES.workouts} className="block">
            <div className="flex items-center gap-4 rounded-[20px] bg-[hsl(var(--fill)/0.3)] border border-[hsl(var(--border)/0.5)] p-4 active:bg-[hsl(var(--fill)/0.5)] transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
                <Dumbbell className="h-6 w-6 text-[hsl(var(--fg))]" />
              </div>
              <div className="flex-1">
                <p className="text-[15px] font-bold text-[hsl(var(--fg))]">{safePlan.name}</p>
                <p className="text-[12px] font-medium text-[hsl(var(--fg-3))] mt-0.5">
                  {safePlan.todayExercises?.length || 0} exercises • 45 min
                </p>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-[hsl(var(--fg))] text-white text-[12px] font-bold">
                Start
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* 6. Recommendations */}
      {recs.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-[13px] font-bold uppercase tracking-wider text-[hsl(var(--fg-3))] px-0.5">Smart Recs</h3>
          <div className="space-y-2.5">
            {recs.map((rec) => (
              <RecommendationCard key={rec.id} rec={rec} />
            ))}
          </div>
        </section>
      )}

      <CoachChatSheet open={chatOpen} onOpenChange={setChatOpen} />
      <BodyCheckinSheet open={checkinOpen} onOpenChange={setCheckinOpen} />
    </TodayScreen>
  );
}

export default function TodayV2() {
  return <TodayContent />;
}
