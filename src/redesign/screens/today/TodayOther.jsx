import React from 'react';
import { AppShell, DetailShell } from '../../layouts';
import { PageHeader, Card, CardBody, Button, SectionHeader, Badge, EmptyState, LockedState } from '../../ui';
import { WeeklyReviewCard, AIInsightCard, TrendChart } from '../../modules';
import { mockWeightSeries, mockInsights } from '../../lib/mock-data';

export function WeeklyReview() {
  return (
    <AppShell current="today" topBar={<PageHeader title="Weekly review" subtitle="Apr 10 – Apr 16" back={() => {}} />}>
      <WeeklyReviewCard kcalAvg={2310} pr={2} workouts={4} trend="Your lifts are up 3.1% vs last week. Sleep is the lever to keep pressing." />

      <SectionHeader className="mt-8" title="What went well" />
      <ul className="space-y-2 text-[14px] text-rd-fg-secondary">
        {['Hit protein target 6/7 days','Two new PRs (bench + row)','HRV trended up +6%'].map((x) => <li key={x} className="flex gap-2"><span className="text-rd-success">✓</span>{x}</li>)}
      </ul>

      <SectionHeader className="mt-8" title="Where to focus" />
      <ul className="space-y-2 text-[14px] text-rd-fg-secondary">
        {['Average sleep 6.9h — aim for 7.5h','Missed one planned leg session','Carbs came in 14% under target'].map((x) => <li key={x} className="flex gap-2"><span className="text-rd-warning">!</span>{x}</li>)}
      </ul>
    </AppShell>
  );
}

export function Insights({ locked = false }) {
  if (locked) {
    return (
      <AppShell current="today" topBar={<PageHeader title="Insights" back={() => {}} />}>
        <LockedState title="Insights are a Pro feature" description="Proactive coaching based on your last 14 days of data." onUpgrade={() => {}} />
      </AppShell>
    );
  }
  return (
    <AppShell current="today" topBar={<PageHeader title="Insights" back={() => {}} />}>
      <div className="grid gap-4 md:grid-cols-2">
        {mockInsights.map((i) => <AIInsightCard key={i.id} title={i.title} body={i.body} />)}
      </div>
      <SectionHeader className="mt-8" title="Weight trend" />
      <Card><CardBody><TrendChart data={mockWeightSeries} /></CardBody></Card>
    </AppShell>
  );
}

export function Diary() {
  return (
    <AppShell current="today" topBar={<PageHeader title="Diary" />}>
      <div className="space-y-2">
        {Array.from({ length: 5 }, (_, i) => (
          <Card key={i}><CardBody>
            <div className="flex items-baseline justify-between">
              <p className="text-rd-h4 text-rd-fg">Apr {17 - i}</p>
              <Badge tone="neutral" size="xs">{2400 - i * 50} kcal</Badge>
            </div>
            <p className="mt-1 text-[13px] text-rd-fg-muted">4 meals · Upper Body Push · 82.1 kg</p>
          </CardBody></Card>
        ))}
      </div>
    </AppShell>
  );
}

export function BlockReview() {
  return (
    <DetailShell title="Training block review" back={() => {}}>
      <Card><CardBody>
        <p className="text-rd-overline uppercase tracking-[0.08em] text-rd-fg-muted">Block 4 · Hypertrophy</p>
        <p className="mt-1 text-rd-h3 text-rd-fg">4-week review</p>
        <p className="mt-2 text-[14px] text-rd-fg-secondary">Big jumps in bench and row. Squat plateau — next block shifts to RDL-led legs.</p>
      </CardBody></Card>
    </DetailShell>
  );
}

export function Plan() {
  return (
    <AppShell current="today" topBar={<PageHeader title="Your plan" />}>
      <Card><CardBody>
        <p className="text-rd-h3 text-rd-fg">Week of Apr 13</p>
        <p className="mt-2 text-[13px] text-rd-fg-muted">4 workouts · ~17,000 kg total volume · 2,460 kcal/day</p>
      </CardBody></Card>
    </AppShell>
  );
}

export function DecisionEngine() {
  return (
    <AppShell current="today" topBar={<PageHeader title="Decision engine" />}>
      <EmptyState title="Internal only" description="Surfaces triggered rules and recent decisions." />
    </AppShell>
  );
}
