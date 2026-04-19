import React from 'react';
import { AppShell } from '../../layouts';
import { PageHeader, SectionHeader, Button } from '../../ui';
import {
  ReadinessCard, DailyTargetsCard, TodayAgendaCard, StreakCard,
  AIInsightCard, WeeklyReviewCard, QuickActionsRow,
} from '../../modules';
import { mockToday, mockMacros, mockInsights, mockUser } from '../../lib/mock-data';

export default function Today() {
  return (
    <AppShell
      current="today"
      topBar={<PageHeader
        title={`Hi, ${mockUser.name.split(' ')[0]}`}
        subtitle="Friday · Apr 17"
        actions={<Button intent="ghost" size="sm">Weekly review</Button>}
      />}
    >
      {/* Row 1 — hero card */}
      <ReadinessCard
        score={mockToday.readiness}
        hrv={mockToday.hrv}
        rhr={mockToday.restingHr}
        sleepHours={mockToday.sleepHours}
      />

      {/* Row 2 — actions */}
      <div className="mt-4">
        <QuickActionsRow />
      </div>

      {/* Row 3 — side by side on desktop */}
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <DailyTargetsCard macros={mockMacros} />
        <TodayAgendaCard tasks={mockToday.tasks} />
      </div>

      {/* Row 4 — insights strip */}
      <SectionHeader className="mt-8" title="Insights" description="What we noticed this week" action={<Button intent="ghost" size="sm">See all</Button>} />
      <div className="grid gap-4 md:grid-cols-2">
        <AIInsightCard title={mockInsights[0].title} body={mockInsights[0].body} onExplain={() => {}} onAct={() => {}} />
        <AIInsightCard title={mockInsights[1].title} body={mockInsights[1].body} onExplain={() => {}} />
      </div>

      {/* Row 5 — streak + weekly review */}
      <div className="mt-6 grid gap-4 md:grid-cols-[1fr_1.5fr]">
        <StreakCard days={mockToday.streakDays} />
        <WeeklyReviewCard
          kcalAvg={2310}
          pr={2}
          workouts={4}
          trend="Your lifts are up 3.1% vs last week. Sleep is the lever to keep pressing."
        />
      </div>
    </AppShell>
  );
}
