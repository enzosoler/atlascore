import React, { useState } from 'react';
import { AppShell, DetailShell, FullScreenShell } from '../../layouts';
import { PageHeader, Button, Card, CardBody, Input, SectionHeader, EmptyState } from '../../ui';
import { BeforeAfterSlider, PoseGuide, TrendChart, MeasurementsList } from '../../modules';
import { mockWeightSeries } from '../../lib/mock-data';

export function WeightEntry() {
  const [value, setValue] = useState('82.1');
  return (
    <DetailShell
      title="Log weight"
      back={() => {}}
      stickyFooter={[<Button intent="primary" size="lg" block key="s">Save</Button>]}
    >
      <Card><CardBody>
        <Input label="Weight" type="number" inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} trailing={<span>kg</span>} size="lg" />
      </CardBody></Card>
      <SectionHeader className="mt-6" title="Recent" />
      <Card><CardBody><TrendChart data={mockWeightSeries.slice(-14)} accessor="kg" /></CardBody></Card>
    </DetailShell>
  );
}

export function BodyComposition() {
  return (
    <DetailShell title="Body composition" back={() => {}} stickyFooter={[<Button intent="primary" size="lg" block key="s">Save</Button>]}>
      <Card><CardBody className="space-y-3">
        <Input label="Body fat %" type="number" trailing="%" />
        <Input label="Skeletal muscle" type="number" trailing="kg" />
        <Input label="Visceral fat" type="number" />
      </CardBody></Card>
    </DetailShell>
  );
}

export function BodyProfile() {
  return (
    <DetailShell title="Body profile" back={() => {}}>
      <Card><CardBody className="space-y-3">
        <Input label="Sex at birth" defaultValue="Male" />
        <Input label="Date of birth" type="date" defaultValue="1997-04-17" />
        <Input label="Height" trailing="cm" defaultValue="180" />
      </CardBody></Card>
    </DetailShell>
  );
}

export function Measurements() {
  return (
    <AppShell current="body" topBar={<PageHeader title="Measurements" back={() => {}} />}>
      <MeasurementsList rows={[
        { id: 'ch', label: 'Chest', value: 104, unit: 'cm', date: '2026-04-10' },
        { id: 'wa', label: 'Waist', value: 82,  unit: 'cm', date: '2026-04-10' },
        { id: 'hp', label: 'Hip',   value: 98,  unit: 'cm', date: '2026-04-10' },
        { id: 'th', label: 'Thigh', value: 60,  unit: 'cm', date: '2026-04-10' },
        { id: 'ca', label: 'Calf',  value: 40,  unit: 'cm', date: '2026-04-10' },
        { id: 'ua', label: 'Upper arm', value: 38, unit: 'cm', date: '2026-04-10' },
        { id: 'ne', label: 'Neck',  value: 38,  unit: 'cm', date: '2026-04-10' },
      ]} />
    </AppShell>
  );
}

export function Progress() {
  return (
    <AppShell current="body" topBar={<PageHeader title="Progress" back={() => {}} />}>
      <Card><CardBody>
        <p className="text-rd-overline uppercase tracking-[0.08em] text-rd-fg-muted">28-day trend</p>
        <TrendChart data={mockWeightSeries} />
      </CardBody></Card>
      <SectionHeader className="mt-6" title="Summary" />
      <div className="grid gap-3 md:grid-cols-3">
        {[['Weight change','-1.2 kg','success'],['Waist','-2.0 cm','success'],['PRs this month','3','accent']].map(([l, v]) => (
          <Card key={l}><CardBody>
            <p className="text-[11px] uppercase tracking-[0.08em] text-rd-fg-muted">{l}</p>
            <p className="mt-1 text-rd-metric-md text-rd-fg rd-tnum">{v}</p>
          </CardBody></Card>
        ))}
      </div>
    </AppShell>
  );
}

export function ProgressPhotos() {
  const [pos, setPos] = useState(50);
  return (
    <AppShell current="body" topBar={<PageHeader title="Photos" back={() => {}} actions={<Button intent="primary" size="sm">+ Add</Button>} />}>
      <SectionHeader title="Compare" description="Drag to reveal before / after" />
      <BeforeAfterSlider before={null} after={null} position={pos} onChange={setPos} />
      <SectionHeader className="mt-8" title="Gallery" />
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="aspect-[4/5] rounded-rd-md border border-rd-border bg-rd-surface-2 relative">
            <span className="absolute bottom-1 left-1 text-[10px] text-rd-fg-muted">Apr {17 - i * 7}</span>
          </div>
        ))}
      </div>
    </AppShell>
  );
}

export function ProgressPhotoView() {
  return (
    <FullScreenShell topChrome={<PageHeader title="Apr 17" back={() => {}} />}>
      <div className="h-[calc(100vh-56px)] flex items-center justify-center bg-black">
        <div className="aspect-[4/5] max-h-full w-auto bg-rd-surface-2" />
      </div>
    </FullScreenShell>
  );
}

export function BodyCheckIn() {
  return (
    <DetailShell title="Weekly check-in" back={() => {}} stickyFooter={[<Button intent="primary" size="lg" block key="s">Complete check-in</Button>]}>
      <SectionHeader title="Progress photos" description="Same outfit, same lighting. Trust the trend." />
      <div className="grid grid-cols-3 gap-2">
        {['front','side','back'].map((p) => <div key={p}><PoseGuide pose={p} /></div>)}
      </div>
      <SectionHeader className="mt-8" title="Weight" />
      <Input label="Today" type="number" trailing="kg" />
      <SectionHeader className="mt-8" title="How are you feeling?" />
      <div className="flex gap-2">
        {['Great','Good','OK','Off','Rough'].map((w) => (
          <button key={w} className="flex-1 h-12 rounded-rd-control border border-rd-border bg-rd-surface text-[13px] hover:border-rd-border-strong">{w}</button>
        ))}
      </div>
    </DetailShell>
  );
}
