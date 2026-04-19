import React from 'react';
import { AppShell } from '../../layouts';
import { PageHeader, Card, CardHeader, CardBody, Button, SectionHeader } from '../../ui';
import { WeightEntryCard, TrendChart, MeasurementsList } from '../../modules';
import { mockWeightSeries } from '../../lib/mock-data';

const measurements = [
  { id: 'w', label: 'Weight',       value: 82.1, unit: 'kg',  date: '2026-04-17' },
  { id: 'bf', label: 'Body fat',    value: 16.4, unit: '%',   date: '2026-04-14' },
  { id: 'ch', label: 'Chest',       value: 104,  unit: 'cm',  date: '2026-04-10' },
  { id: 'wa', label: 'Waist',       value: 82,   unit: 'cm',  date: '2026-04-10' },
  { id: 'th', label: 'Thigh',       value: 60,   unit: 'cm',  date: '2026-04-10' },
  { id: 'ar', label: 'Upper arm',   value: 38,   unit: 'cm',  date: '2026-04-10' },
];

export default function BodyOverview() {
  const latest = mockWeightSeries[mockWeightSeries.length - 1];
  return (
    <AppShell current="body" topBar={<PageHeader title="Body" actions={<Button intent="primary" size="sm">Log weight</Button>} />}>
      <WeightEntryCard latest={{ kg: latest.kg, date: latest.date }} onLog={() => {}} />

      <SectionHeader className="mt-6" title="Trend" description="28-day moving average" />
      <Card>
        <CardBody>
          <TrendChart data={mockWeightSeries} accessor="kg" unit="kg" />
        </CardBody>
      </Card>

      <SectionHeader className="mt-8" title="Measurements" action={<Button intent="ghost" size="sm">Add</Button>} />
      <MeasurementsList rows={measurements} />

      <SectionHeader className="mt-8" title="Progress photos" action={<Button intent="ghost" size="sm">Open</Button>} />
      <div className="grid grid-cols-3 gap-3">
        {['Apr 3','Mar 20','Mar 6'].map((d) => (
          <div key={d} className="aspect-[4/5] rounded-rd-card border border-rd-border bg-rd-surface-2 relative overflow-hidden">
            <span className="absolute bottom-2 left-2 text-[11px] text-rd-fg-muted">{d}</span>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
