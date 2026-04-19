import React, { useState } from 'react';
import { AppShell } from '../../layouts';
import { PageHeader, Button, SectionHeader, SegmentedControl } from '../../ui';
import { WorkoutPlanCard, WorkoutFilters, HistoryRow } from '../../modules';

const plans = [
  { id: 'p1', name: 'Upper Body — Push', duration: '52 min', exercises: 6, focus: 'Chest · Shoulders · Triceps', tags: ['Push','Strength'] },
  { id: 'p2', name: 'Lower Body — Heavy',  duration: '64 min', exercises: 5, focus: 'Quads · Posterior chain',    tags: ['Legs','Strength'] },
  { id: 'p3', name: 'Pull + Conditioning', duration: '48 min', exercises: 7, focus: 'Back · Biceps · Erg',         tags: ['Pull','Conditioning'] },
];
const history = [
  { id: 'h1', name: 'Upper Body — Push',  date: 'Apr 15', duration: '54 min', volume: '7,240', prs: 1 },
  { id: 'h2', name: 'Lower Body — Heavy', date: 'Apr 13', duration: '62 min', volume: '12,120' },
  { id: 'h3', name: 'Pull + Conditioning', date: 'Apr 11', duration: '49 min', volume: '6,810' },
];

export default function WorkoutsHome() {
  const [filters, setFilters] = useState(['All']);
  const [tab, setTab] = useState('today');
  const toggle = (f) => setFilters((prev) => prev.includes(f) ? prev.filter((x) => x !== f) : [...prev.filter((x) => x !== 'All'), f]);
  return (
    <AppShell
      current="workouts"
      topBar={<PageHeader title="Workouts" actions={<Button intent="primary" size="sm">Quick workout</Button>} />}
    >
      <SegmentedControl
        value={tab}
        onChange={setTab}
        options={[{ value: 'today', label: 'Today' }, { value: 'library', label: 'Library' }, { value: 'history', label: 'History' }]}
        className="mb-4"
      />

      {tab !== 'history' && (
        <div className="mb-4">
          <WorkoutFilters filters={filters} onToggle={toggle} />
        </div>
      )}

      {tab === 'today' && (
        <div className="space-y-3">
          <SectionHeader title="Prescribed today" description="Adapted from your recovery + last session" />
          <WorkoutPlanCard plan={plans[0]} onStart={() => {}} />

          <SectionHeader title="Recommended next" className="mt-8" />
          <div className="grid gap-3 md:grid-cols-2">
            <WorkoutPlanCard plan={plans[1]} onStart={() => {}} />
            <WorkoutPlanCard plan={plans[2]} onStart={() => {}} />
          </div>
        </div>
      )}

      {tab === 'library' && (
        <div className="grid gap-3 md:grid-cols-2">
          {plans.map((p) => <WorkoutPlanCard key={p.id} plan={p} />)}
        </div>
      )}

      {tab === 'history' && (
        <div className="overflow-hidden rounded-rd-card border border-rd-border bg-rd-surface divide-y divide-rd-border">
          {history.map((h) => <HistoryRow key={h.id} entry={h} onClick={() => {}} />)}
        </div>
      )}
    </AppShell>
  );
}
