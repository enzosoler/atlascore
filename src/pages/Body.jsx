import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Camera, Ruler, TrendingUp } from 'lucide-react';
import { AppContainer, Card, PageHeader } from '@/components/shared/AppContainer';
import { FilterChip } from '@/components/shared/StablePage';
import Progress from './Progress';
import Measurements from './Measurements';
import ProgressPhotos from './ProgressPhotos';

const TABS = [
  {
    id: 'overview',
    label: 'Progress',
    description: 'Weight, composition, and body trend reading.',
    icon: TrendingUp,
  },
  {
    id: 'measurements',
    label: 'Measurements',
    description: 'Structured body checkpoints and historical entries.',
    icon: Ruler,
  },
  {
    id: 'photos',
    label: 'Photos',
    description: 'Private visual checkpoints grouped by date.',
    icon: Camera,
  },
];

export default function Body() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const validTab = TABS.some((tab) => tab.id === tabFromUrl) ? tabFromUrl : 'overview';
  const [activeTab, setActiveTab] = useState(validTab);

  const activeTabMeta = useMemo(
    () => TABS.find((tab) => tab.id === activeTab) || TABS[0],
    [activeTab]
  );
  const ActiveIcon = activeTabMeta.icon;

  function handleTab(id) {
    setActiveTab(id);
    setSearchParams(id === 'overview' ? {} : { tab: id }, { replace: true });
  }

  return (
    <AppContainer maxWidth="max-w-6xl">
      <PageHeader
        eyebrow="Body"
        title="A single body hub for change you can actually read."
        subtitle="Measurements, visual checkpoints, and trend summaries now live together with calmer hierarchy and less route hopping."
        accentClassName="from-[hsl(var(--brand)/0.14)] via-[hsl(var(--brand)/0.04)]"
      >
        <div className="grid gap-3 md:grid-cols-3">
          <Card className="px-4 py-4">
            <p className="atlas-metric-label">Current area</p>
            <p className="mt-3 text-[1.15rem] font-semibold tracking-[-0.035em] text-[hsl(var(--fg))]">
              {activeTabMeta.label}
            </p>
            <p className="mt-2 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
              {activeTabMeta.description}
            </p>
          </Card>
          <Card className="px-4 py-4">
            <p className="atlas-metric-label">Hub structure</p>
            <p className="mt-3 text-[1.15rem] font-semibold tracking-[-0.035em] text-[hsl(var(--fg))]">
              Trends, checkpoints, visuals
            </p>
            <p className="mt-2 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
              The tabbed flow mirrors the handoff without splitting the body story apart.
            </p>
          </Card>
          <Card className="px-4 py-4">
            <p className="atlas-metric-label">Navigation</p>
            <p className="mt-3 text-[1.15rem] font-semibold tracking-[-0.035em] text-[hsl(var(--fg))]">
              Large-title entry, embedded sections
            </p>
            <p className="mt-2 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
              Each tab keeps native section rhythm without duplicating full page headers.
            </p>
          </Card>
        </div>
      </PageHeader>

      <Card className="space-y-4 px-4 py-4 sm:px-5">
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <FilterChip
                key={tab.id}
                active={activeTab === tab.id}
                onClick={() => handleTab(tab.id)}
                className="gap-2"
              >
                <Icon className="h-4 w-4" strokeWidth={1.9} />
                {tab.label}
              </FilterChip>
            );
          })}
        </div>

        <div className="rounded-[18px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.6)] px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[16px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.88)] text-[hsl(var(--brand))]">
              <ActiveIcon className="h-4 w-4" strokeWidth={1.9} />
            </div>
            <div>
              <p className="text-[14px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
                {activeTabMeta.label}
              </p>
              <p className="text-[13px] leading-6 text-[hsl(var(--fg-2))]">
                {activeTabMeta.description}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {activeTab === 'overview' ? <Progress embedded /> : null}
      {activeTab === 'measurements' ? <Measurements embedded /> : null}
      {activeTab === 'photos' ? <ProgressPhotos embedded /> : null}
    </AppContainer>
  );
}
