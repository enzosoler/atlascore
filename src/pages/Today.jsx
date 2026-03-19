import React from 'react';
import { Brain, Dumbbell, Sparkles, User, UtensilsCrossed } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { ROUTES } from '@/lib/routes';
import { getGreeting } from '@/lib/atlas-theme';
import { SafePageBoundary } from '@/components/shared/StablePage';
import {
  TodayActionCard,
  TodayAdherenceCard,
  TodayCard,
  TodayInsightCard,
  TodayScreen,
  TodaySection,
  TodayStatCard,
} from '@/components/today/TodayMobileUI';

const NEXT_STEPS = [
  {
    to: ROUTES.nutrition,
    title: 'Open nutrition',
    description: 'Confirm meals, macros and the first food choice before the day gets busy.',
    icon: UtensilsCrossed,
    phase: 'Top priority',
  },
  {
    to: ROUTES.workouts,
    title: 'Review workout',
    description: 'Keep the main session ready before your training window opens.',
    icon: Dumbbell,
    phase: 'Up next',
  },
  {
    to: ROUTES.atlasAI,
    title: 'Ask Atlas AI',
    description: 'Use one short prompt when you want a clean next decision without extra noise.',
    icon: Brain,
    phase: 'Quick insight',
  },
  {
    to: ROUTES.profile,
    title: 'Refine profile',
    description: 'Keep baseline preferences aligned so the rest of the app stays accurate.',
    icon: User,
    phase: 'Keep aligned',
  },
];

const SNAPSHOT_CARDS = [
  {
    to: ROUTES.nutrition,
    label: 'Nutrition',
    value: 'Ready',
    description: 'Meals and targets are lined up for a clean start.',
    meta: 'Daily plan',
    icon: UtensilsCrossed,
    tone: 'blue',
  },
  {
    to: ROUTES.workouts,
    label: 'Workout',
    value: 'Pending',
    description: 'Your main session is prepared and waiting for execution.',
    meta: 'Today session',
    icon: Dumbbell,
    tone: 'orange',
  },
];

const ADHERENCE_SIGNALS = [
  {
    label: 'Nutrition',
    value: 82,
  },
  {
    label: 'Training',
    value: 76,
  },
  {
    label: 'Recovery',
    value: 88,
  },
];

function getPreferredName(displayName) {
  if (!displayName) return 'Athlete';
  const [firstChunk] = displayName.split(/[ @]/).filter(Boolean);
  return firstChunk || displayName;
}

function getDateLabel() {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());
}

export default function Today() {
  return (
    <SafePageBoundary
      title="Today"
      subtitle="Mobile-first daily overview."
      maxWidth="max-w-[480px]"
      fallbackDescription="The Today screen opened in safe mode."
    >
      <TodayContent />
    </SafePageBoundary>
  );
}

function TodayContent() {
  const { user } = useAuth();
  const displayName = user?.full_name || user?.email || 'Athlete';
  const preferredName = getPreferredName(displayName);
  const greeting = getGreeting();
  const adherenceAverage = Math.round(
    ADHERENCE_SIGNALS.reduce((total, item) => total + item.value, 0) / ADHERENCE_SIGNALS.length
  );

  return (
    <TodayScreen>
      <header className="flex items-start justify-between gap-4 px-1">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
            {getDateLabel()}
          </p>
          <h1 className="mt-2 text-[34px] font-bold tracking-[-0.07em] text-[#111827]">Today</h1>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/80 bg-white/80 text-[#0A84FF] shadow-[0_4px_20px_rgba(15,23,42,0.05)]">
          <Sparkles className="h-5 w-5" strokeWidth={2} />
        </div>
      </header>

      <TodayCard className="relative overflow-hidden border-[#93C5FD] bg-[linear-gradient(135deg,#0A84FF_0%,#38A3FF_55%,#79D6FF_100%)] text-white shadow-[0_14px_32px_rgba(10,132,255,0.24)]">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-28 w-28 rounded-full bg-[#BAE6FD]/35 blur-2xl" />

        <div className="relative">
          <span className="inline-flex rounded-full bg-white/16 px-3 py-1 text-[12px] font-semibold tracking-[0.04em] text-white/92">
            Local preview
          </span>

          <p className="mt-5 text-[30px] font-bold tracking-[-0.07em] text-white">
            {greeting}, {preferredName}
          </p>
          <p className="mt-2 max-w-[24rem] text-[15px] leading-6 text-white/84">
            A calm home for nutrition, training and the next decision that matters today.
          </p>
          <p className="mt-5 text-[13px] font-medium text-white/80">{displayName}</p>
        </div>
      </TodayCard>

      <TodaySection
        eyebrow="What's Next"
        title="Priority actions"
        description="Move through the day in the right order, with one clear action per card."
      >
        <div className="space-y-3">
          {NEXT_STEPS.map((item, index) => (
            <TodayActionCard
              key={item.to}
              to={item.to}
              title={item.title}
              description={item.description}
              icon={item.icon}
              priority={item.phase}
              highlighted={index === 0}
            />
          ))}
        </div>
      </TodaySection>

      <TodaySection eyebrow="Snapshot" title="Today at a glance">
        <div className="grid grid-cols-2 gap-3">
          {SNAPSHOT_CARDS.map((item) => (
            <TodayStatCard
              key={item.label}
              to={item.to}
              label={item.label}
              value={item.value}
              description={item.description}
              meta={item.meta}
              icon={item.icon}
              tone={item.tone}
            />
          ))}
        </div>
      </TodaySection>

      <TodaySection eyebrow="Adherence" title="Daily consistency">
        <TodayAdherenceCard
          score={adherenceAverage}
          summary="Nutrition is leading the day, training is queued up, and recovery is already giving you a stable base."
          items={ADHERENCE_SIGNALS}
        />
      </TodaySection>

      <TodaySection eyebrow="Atlas AI" title="Quiet guidance">
        <TodayInsightCard
          to={ROUTES.atlasAI}
          icon={Brain}
          title="Start with nutrition, then open the workout."
          description="Keeping the first meal decision visible usually makes the rest of the day feel lighter and easier to execute."
        />
      </TodaySection>
    </TodayScreen>
  );
}
