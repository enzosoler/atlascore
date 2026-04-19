import React from 'react';
import { AppShell, DetailShell } from '../../layouts';
import { PageHeader, Button, Card, CardBody, Badge, SectionHeader, LockedState, EmptyState } from '../../ui';
import { BiomarkerCard, CategoryScore, InterpretationPanel, BiomarkerRange } from '../../modules';
import { mockBiomarkers } from '../../lib/mock-data';

export function LabsOverview({ locked = false }) {
  if (locked) {
    return (
      <AppShell current="labs" topBar={<PageHeader title="Labs" back={() => {}} />}>
        <LockedState title="Labs is a Pro feature" description="Upload your bloodwork and get clear, human-friendly interpretation." onUpgrade={() => {}} />
      </AppShell>
    );
  }
  return (
    <AppShell current="labs" topBar={<PageHeader title="Labs" back={() => {}} actions={<Button intent="primary" size="sm">+ Upload</Button>} />}>
      <SectionHeader title="Snapshot" description="Latest panel · Mar 28, 2026" />
      <div className="grid gap-3 md:grid-cols-3">
        <CategoryScore title="Cardiometabolic" score={72} insights={['LDL slightly elevated','HDL optimal']} />
        <CategoryScore title="Nutrients"       score={58} insights={['Vitamin D low','Ferritin optimal']} />
        <CategoryScore title="Hormones"        score={80} insights={['Testosterone optimal']} />
      </div>

      <SectionHeader className="mt-8" title="All biomarkers" />
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {mockBiomarkers.map((b) => <BiomarkerCard key={b.id} biomarker={b} onClick={() => {}} />)}
      </div>
    </AppShell>
  );
}

export function BiomarkerDetail() {
  const b = mockBiomarkers[0];
  return (
    <DetailShell title={b.name} back={() => {}}>
      <Card>
        <CardBody>
          <Badge tone="warning">Elevated</Badge>
          <p className="mt-3 text-rd-metric-xl text-rd-fg rd-tnum">{b.value}<span className="text-[14px] text-rd-fg-muted font-normal"> {b.unit}</span></p>
          <div className="mt-4"><BiomarkerRange value={b.value} range={b.range} status={b.status} /></div>
        </CardBody>
      </Card>
      <div className="mt-4">
        <InterpretationPanel
          biomarker={b}
          explanation="LDL cholesterol is slightly above the optimal range. LDL is often called 'bad' cholesterol because higher levels are associated with cardiovascular risk over time."
          recommendations={[
            'Increase soluble fiber (oats, beans, chia) by 5–10 g/day.',
            'Aim for ≥150 min/week of zone 2 cardio.',
            'Retest in 8–12 weeks. We\'ll remind you.',
          ]}
        />
      </div>
      <SectionHeader className="mt-6" title="Your trend" />
      <Card><CardBody>
        <p className="text-[13px] text-rd-fg-muted">Previous: 125 mg/dL (Oct 2025) · 132 mg/dL (May 2025)</p>
      </CardBody></Card>
    </DetailShell>
  );
}

export function LabExamDetail() {
  return (
    <DetailShell title="Comprehensive Panel" back={() => {}}>
      <Card><CardBody>
        <p className="text-rd-h3 text-rd-fg">Quest Diagnostics · Mar 28</p>
        <p className="mt-1 text-[13px] text-rd-fg-muted">42 biomarkers · Interpreted</p>
      </CardBody></Card>
      <SectionHeader className="mt-6" title="Biomarkers" />
      <div className="grid gap-3 md:grid-cols-2">
        {mockBiomarkers.map((b) => <BiomarkerCard key={b.id} biomarker={b} />)}
      </div>
    </DetailShell>
  );
}

export function LabUpload() {
  return (
    <DetailShell title="Upload labs" back={() => {}}>
      <Card><CardBody>
        <p className="text-rd-h4 text-rd-fg">Drop or choose a PDF</p>
        <p className="mt-1 text-[13px] text-rd-fg-muted">We\'ll parse it in about 60 seconds.</p>
        <div className="mt-4 aspect-[4/1] rounded-rd-card border-2 border-dashed border-rd-border flex items-center justify-center text-rd-fg-muted text-[13px]">
          Drag & drop a lab PDF here
        </div>
      </CardBody></Card>
    </DetailShell>
  );
}

export function LabHistory() {
  return (
    <AppShell current="labs" topBar={<PageHeader title="Lab history" back={() => {}} />}>
      <EmptyState icon={<span>📂</span>} title="Just one panel so far" description="We\'ll show side-by-side comparisons once you have 2+." />
    </AppShell>
  );
}
