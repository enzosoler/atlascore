import React from 'react';
import { AppShell, DetailShell } from '../../layouts';
import { PageHeader, Button, Card, CardBody, SectionHeader } from '../../ui';
import { ProactiveInsightCard, ExplainabilityCard, CoachLowConfidence } from '../../modules';
import { mockInsights } from '../../lib/mock-data';

export function CoachHome() {
  return (
    <AppShell current="coach" topBar={<PageHeader title="Coach" actions={<Button intent="primary" size="sm">Chat now</Button>} />}>
      <SectionHeader title="Today" description="What your coach is watching" />
      <div className="grid gap-4 md:grid-cols-2">
        {mockInsights.map((i) => <ProactiveInsightCard key={i.id} insight={i} />)}
      </div>

      <SectionHeader className="mt-8" title="This week" />
      <Card><CardBody>
        <p className="text-rd-h4 text-rd-fg">Push for one hard session</p>
        <p className="mt-2 text-[14px] text-rd-fg-secondary leading-relaxed">
          Your average RPE is 6.8. Hit RPE 8.5+ on at least one compound lift this week — it\'s the single biggest lever for the next cycle.
        </p>
      </CardBody></Card>

      <SectionHeader className="mt-8" title="Explainability" />
      <ExplainabilityCard sources={['Last 14 days of training volume','7-day HRV trend (+6%)','Sleep baseline (7.4h avg)','Your declared goal: build muscle']} />
    </AppShell>
  );
}

export function CoachInsightDetail() {
  return (
    <DetailShell title="Recovery trending down" back={() => {}}>
      <ProactiveInsightCard insight={{ title: 'HRV down 6% over 5 days', body: 'Consider a lighter session tomorrow. Keep sleep 7.5h+ and protein ≥1.8 g/kg.', tone: 'warning' }} />
      <div className="mt-4">
        <ExplainabilityCard sources={['7-day HRV: 68 → 64 ms','Cumulative load: +12% vs previous week','Sleep debt: 1.2h','Caffeine intake: stable']} />
      </div>
      <div className="mt-4">
        <CoachLowConfidence body="HRV can also shift from alcohol, illness, or menstrual cycle. If anything feels off, trust how you feel." onRefine={() => {}} />
      </div>
    </DetailShell>
  );
}
