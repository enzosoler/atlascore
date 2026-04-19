import React from 'react';
import { AppShell, DetailShell, FullScreenShell } from '../../layouts';
import { PageHeader, Button, Card, CardBody, Badge, SectionHeader, EmptyState, LockedState, ListRow, Chip } from '../../ui';
import { WorkoutPlanCard, WorkoutFilters, HistoryRow } from '../../modules';

export function WorkoutLibrary() {
  return (
    <AppShell current="workouts" topBar={<PageHeader title="Library" back={() => {}} />}>
      <div className="mb-4"><WorkoutFilters filters={['All']} onToggle={() => {}} /></div>
      <div className="grid gap-3 md:grid-cols-2">
        {Array.from({ length: 8 }, (_, i) => (
          <WorkoutPlanCard
            key={i}
            plan={{ id: `p${i}`, name: `Program ${i + 1}`, duration: '45 min', exercises: 6, focus: 'Full body', tags: ['Strength'] }}
          />
        ))}
      </div>
    </AppShell>
  );
}

export function WorkoutDetail() {
  return (
    <DetailShell
      title="Upper Body — Push"
      back={() => {}}
      stickyFooter={[<Button intent="primary" size="lg" block key="s">Start workout</Button>]}
    >
      <Card>
        <CardBody>
          <p className="text-rd-overline uppercase tracking-[0.08em] text-rd-fg-muted">Focus</p>
          <p className="mt-1 text-rd-h3 text-rd-fg">Chest · Shoulders · Triceps</p>
          <p className="mt-2 text-[13px] text-rd-fg-muted">52 min · 6 exercises · ~7,200 kg total volume</p>
          <div className="mt-3 flex gap-2">
            <Badge tone="neutral" size="sm">Push</Badge>
            <Badge tone="neutral" size="sm">Strength</Badge>
          </div>
        </CardBody>
      </Card>
      <SectionHeader className="mt-6" title="Exercises" />
      <Card className="divide-y divide-rd-border">
        {['Barbell Bench Press','Overhead Press','Incline DB Press','Lateral Raise','Triceps Pushdown','Dips'].map((e, i) => (
          <ListRow key={e} leading={<span className="rd-tnum text-rd-fg-muted">{i + 1}</span>} title={e} subtitle="4 × 6-8 @ RPE 8" />
        ))}
      </Card>
    </DetailShell>
  );
}

export function WorkoutHistory() {
  return (
    <AppShell current="workouts" topBar={<PageHeader title="History" back={() => {}} />}>
      <div className="overflow-hidden rounded-rd-card border border-rd-border bg-rd-surface divide-y divide-rd-border">
        {Array.from({ length: 8 }, (_, i) => (
          <HistoryRow
            key={i}
            entry={{ id: i, name: ['Upper Push','Lower Heavy','Pull + Cond.','Full body'][i % 4], date: `Apr ${15 - i}`, duration: '48 min', volume: '6,900', prs: i === 0 ? 1 : 0 }}
            onClick={() => {}}
          />
        ))}
      </div>
    </AppShell>
  );
}

export function ExerciseLibrary() {
  return (
    <AppShell current="workouts" topBar={<PageHeader title="Exercises" back={() => {}} />}>
      <div className="mb-4 flex gap-2 overflow-x-auto rd-scroll-hide">
        {['All','Chest','Back','Legs','Shoulders','Arms','Core','Barbell','Dumbbell','Cable'].map((c, i) => <Chip key={c} active={i === 0}>{c}</Chip>)}
      </div>
      <div className="overflow-hidden rounded-rd-card border border-rd-border bg-rd-surface divide-y divide-rd-border">
        {['Barbell Bench Press','Overhead Press','Pull-up','Squat','Deadlift','Row','Curl'].map((e) => (
          <ListRow key={e} title={e} subtitle="Chest · Barbell" trailing={<span className="text-rd-fg-muted" aria-hidden>›</span>} />
        ))}
      </div>
    </AppShell>
  );
}

export function ExerciseDetail() {
  return (
    <DetailShell title="Barbell Bench Press" back={() => {}}>
      <div className="aspect-[4/3] w-full rounded-rd-card border border-rd-border bg-rd-surface-2 flex items-center justify-center text-rd-fg-muted">Demo video</div>
      <Card className="mt-4"><CardBody>
        <p className="text-rd-overline uppercase tracking-[0.08em] text-rd-fg-muted">Primary muscles</p>
        <p className="mt-1 text-[14px] text-rd-fg">Pectoralis major · Anterior deltoid · Triceps</p>
      </CardBody></Card>
      <SectionHeader className="mt-6" title="Your history" />
      <Card className="divide-y divide-rd-border">
        {[['Apr 15','92.5 kg × 5'],['Apr 8','90.0 kg × 6'],['Apr 1','87.5 kg × 7']].map(([d, v]) => (
          <ListRow key={d} title={v} subtitle={d} />
        ))}
      </Card>
    </DetailShell>
  );
}

export function Routines() {
  return (
    <AppShell current="workouts" topBar={<PageHeader title="Routines" back={() => {}} actions={<Button intent="primary" size="sm">+ New</Button>} />}>
      <EmptyState icon={<span>🗓</span>} title="No routines yet" description="Routines are reusable weekly schedules — build once, repeat forever." action={<Button intent="primary" size="sm">Create routine</Button>} />
    </AppShell>
  );
}

export function Protocols() {
  return (
    <AppShell current="workouts" topBar={<PageHeader title="Protocols" />}>
      <div className="grid gap-3 md:grid-cols-2">
        {['5/3/1 BBB','Push Pull Legs','Upper Lower 4-day','Texas Method'].map((n) => (
          <Card key={n} interactive><CardBody>
            <p className="text-rd-h4 text-rd-fg">{n}</p>
            <p className="mt-1 text-[12px] text-rd-fg-muted">4-6 weeks · Intermediate</p>
          </CardBody></Card>
        ))}
      </div>
    </AppShell>
  );
}

export function ProtocolDetail() {
  return <DetailShell title="5/3/1 BBB" back={() => {}}><Card><CardBody><p className="text-[14px] text-rd-fg-secondary">Jim Wendler's 5/3/1 with Boring But Big accessory work.</p></CardBody></Card></DetailShell>;
}

export function ProtocolForm() {
  return (
    <DetailShell title="New protocol" back={() => {}} stickyFooter={[<Button intent="primary" size="lg" block key="s">Save protocol</Button>]}>
      <Card><CardBody className="space-y-3"><p className="text-[14px] text-rd-fg-secondary">Build from scratch or fork an existing template.</p></CardBody></Card>
    </DetailShell>
  );
}

export function MyWorkout() {
  return <AppShell current="workouts" topBar={<PageHeader title="My workout" />}><WorkoutDetail /></AppShell>;
}

export function PrescribedWorkout() {
  return <DetailShell title="Prescribed workout" back={() => {}}><WorkoutDetail /></DetailShell>;
}

export function ManualWorkoutPlan() {
  return <DetailShell title="Manual plan" back={() => {}}><Card><CardBody><p className="text-[14px] text-rd-fg-secondary">Drag exercises to build your weekly plan.</p></CardBody></Card></DetailShell>;
}

export function PlanBuilderWizard() {
  return (
    <FullScreenShell topChrome={<PageHeader title="Plan builder" back={() => {}} />}>
      <div className="mx-auto max-w-[560px] p-6 space-y-4">
        <Card><CardBody>
          <p className="text-rd-overline uppercase tracking-[0.08em] text-rd-fg-muted">Step 1 of 4</p>
          <p className="mt-1 text-rd-h2 text-rd-fg">How many days a week?</p>
        </CardBody></Card>
      </div>
    </FullScreenShell>
  );
}
