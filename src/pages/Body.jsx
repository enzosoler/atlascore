import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Camera, Ruler, TrendingUp, ArrowRight, Target, Zap } from 'lucide-react';
import { AppContainer, Card, PageHeader } from '@/components/shared/AppContainer';
import { FilterChip } from '@/components/shared/StablePage';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { listMeasurements, listProgressPhotos } from '@/services/bodyProgressService';
import { getMeasurementFieldValue } from '@/lib/measurementModel';
import { format, subDays } from 'date-fns';
import Progress from './Progress';
import Measurements from './Measurements';
import ProgressPhotos from './ProgressPhotos';
import { useT } from '@/lib/i18nContext';

const TAB_IDS = ['overview', 'measurements', 'photos'];
const TAB_ICONS = { overview: TrendingUp, measurements: Ruler, photos: Camera };

function BodySummary({ measurements, photos }) {
  const t = useT();
  const weeksBack = 4;
  const startDate = subDays(new Date(), weeksBack * 7);

  const filteredMeasurements = measurements.filter((m) => {
    const measurementDate = new Date(m.date);
    return measurementDate >= startDate;
  });

  const latest = filteredMeasurements[0];
  const oldest = filteredMeasurements[filteredMeasurements.length - 1];
  const latestWeight = getMeasurementFieldValue(latest, 'weight');
  const oldestWeight = getMeasurementFieldValue(oldest, 'weight');
  const latestBodyFat = getMeasurementFieldValue(latest, 'body_fat_percent');
  const oldestBodyFat = getMeasurementFieldValue(oldest, 'body_fat_percent');

  const weightChange = latestWeight !== null && oldestWeight !== null ? latestWeight - oldestWeight : 0;
  const bodyFatChange = latestBodyFat !== null && oldestBodyFat !== null ? latestBodyFat - oldestBodyFat : 0;

  const weightTrend = weightChange < 0 ? 'down' : weightChange > 0 ? 'up' : 'stable';
  const bodyFatTrend = bodyFatChange < 0 ? 'down' : bodyFatChange > 0 ? 'up' : 'stable';

  const getTrendColor = (trend, isGood) => {
    if (trend === 'stable') return 'text-[hsl(var(--fg-2))]';
    if (isGood) return 'text-[hsl(var(--ok))]';
    return 'text-[hsl(var(--warn))]';
  };

  const getTrendBg = (trend, isGood) => {
    if (trend === 'stable') return 'bg-[hsl(var(--fill)/0.5)]';
    if (isGood) return 'bg-[hsl(var(--ok)/0.12)]';
    return 'bg-[hsl(var(--warn)/0.12)]';
  };

  const weightIsGood = weightChange < 0;
  const bodyFatIsGood = bodyFatChange < 0;

  return (
    <div className="grid gap-3 md:grid-cols-3">
      <Card className="px-5 py-5">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">{t('body.summary.weight')}</p>
          <div className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${getTrendBg(weightTrend, weightIsGood)} ${getTrendColor(weightTrend, weightIsGood)}`}>
            {weightTrend === 'stable' ? t('body.summary.stable') : weightChange > 0 ? `+${Math.abs(weightChange).toFixed(1)}kg` : `${Math.abs(weightChange).toFixed(1)}kg`}
          </div>
        </div>
        <p className="mt-3 text-[1.5rem] font-semibold tracking-[-0.05em] text-[hsl(var(--fg))]">
          {latestWeight ? `${latestWeight.toFixed(1)} kg` : '—'}
        </p>
        <p className="mt-2 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
          {weightTrend === 'stable' ? t('body.summary.no_change_4w') : weightIsGood ? t('body.summary.moving_right_direction') : t('body.summary.consider_nutrition')}
        </p>
      </Card>

      <Card className="px-5 py-5">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">{t('body.summary.body_fat')}</p>
          <div className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${getTrendBg(bodyFatTrend, bodyFatIsGood)} ${getTrendColor(bodyFatTrend, bodyFatIsGood)}`}>
            {bodyFatTrend === 'stable' ? t('body.summary.stable') : bodyFatChange > 0 ? `+${Math.abs(bodyFatChange).toFixed(1)}%` : `${Math.abs(bodyFatChange).toFixed(1)}%`}
          </div>
        </div>
        <p className="mt-3 text-[1.5rem] font-semibold tracking-[-0.05em] text-[hsl(var(--fg))]">
          {latestBodyFat ? `${latestBodyFat.toFixed(1)}%` : '—'}
        </p>
        <p className="mt-2 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
          {bodyFatTrend === 'stable' ? t('body.summary.holding_steady') : bodyFatIsGood ? t('body.summary.fat_loss_progress') : t('body.summary.monitor_calorie')}
        </p>
      </Card>

      <Card className="px-5 py-5">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">{t('body.summary.progress_score')}</p>
          <Zap className="h-4 w-4 text-[hsl(var(--brand))]" strokeWidth={1.9} />
        </div>
        <p className="mt-3 text-[1.5rem] font-semibold tracking-[-0.05em] text-[hsl(var(--fg))]">
          {measurements.length > 0 ? Math.min(100, Math.round(60 + measurements.length * 2 + Math.abs(weightChange) * 5)) : '—'}
          <span className="ml-1 text-[14px] font-medium text-[hsl(var(--fg-2))]">{t('body.summary.out_of_100')}</span>
        </p>
        <p className="mt-2 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
          {t('body.summary.based_on_consistency')}
        </p>
      </Card>
    </div>
  );
}

function WhatToDoNext({ measurements }) {
  const t = useT();
  const latest = measurements[0];
  const weight = getMeasurementFieldValue(latest, 'weight');
  const bodyFat = getMeasurementFieldValue(latest, 'body_fat_percent');

  const actions = [];

  if (measurements.length < 3) {
    actions.push(t('body.what_to_do_next.record_measurements_weekly'));
  }

  if (bodyFat !== null && bodyFat > 20) {
    actions.push(t('body.what_to_do_next.keep_training_volume'));
    actions.push(t('body.what_to_do_next.prioritize_protein'));
  } else if (bodyFat !== null && bodyFat < 12) {
    actions.push(t('body.what_to_do_next.consider_surplus'));
  }

  if (weight !== null) {
    actions.push(t('body.what_to_do_next.stay_consistent'));
    actions.push(t('body.what_to_do_next.track_energy'));
  }

  if (actions.length === 0) {
    actions.push(t('body.what_to_do_next.log_checkpoint'));
    actions.push(t('body.what_to_do_next.take_photos'));
  }

  return (
    <Card className="px-5 py-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-[18px] border border-[hsl(var(--brand)/0.2)] bg-[hsl(var(--brand)/0.08)] text-[hsl(var(--brand))]">
          <Target className="h-4 w-4" strokeWidth={1.9} />
        </div>
        <div>
          <p className="text-[13px] font-semibold tracking-[-0.016em] text-[hsl(var(--fg))]">{t('body.what_to_do_next.title')}</p>
          <p className="text-[12px] text-[hsl(var(--fg-2))]">{t('body.what_to_do_next.subtitle')}</p>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {actions.slice(0, 3).map((action, i) => (
          <div key={i} className="flex items-center gap-2 text-[13px] text-[hsl(var(--fg))]">
            <ArrowRight className="h-3.5 w-3.5 text-[hsl(var(--brand))]" strokeWidth={2} />
            {action}
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function Body() {
  const t = useT();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');

  const TABS = useMemo(() => [
    {
      id: 'overview',
      label: t('body.tabs.overview_label'),
      description: t('body.tabs.overview_description'),
      icon: TrendingUp,
    },
    {
      id: 'measurements',
      label: t('body.tabs.measurements_label'),
      description: t('body.tabs.measurements_description'),
      icon: Ruler,
    },
    {
      id: 'photos',
      label: t('body.tabs.photos_label'),
      description: t('body.tabs.photos_description'),
      icon: Camera,
    },
  ], [t]);

  const validTab = TABS.some((tab) => tab.id === tabFromUrl) ? tabFromUrl : 'overview';
  const [activeTab, setActiveTab] = useState(validTab);
  const { user } = useAuth();

  const { data: measurements = [] } = useQuery({
    queryKey: ['body-measurements', user?.id],
    queryFn: () => listMeasurements(user.id, 50),
    enabled: !!user?.id,
  });

  const { data: photos = [] } = useQuery({
    queryKey: ['body-photos', user?.id],
    queryFn: () => listProgressPhotos(user.id, 50),
    enabled: !!user?.id,
  });

  const activeTabMeta = useMemo(
    () => TABS.find((tab) => tab.id === activeTab) || TABS[0],
    [activeTab, TABS]
  );
  const ActiveIcon = activeTabMeta.icon;

  function handleTab(id) {
    setActiveTab(id);
    setSearchParams(id === 'overview' ? {} : { tab: id }, { replace: true });
  }

  return (
    <AppContainer maxWidth="max-w-6xl">
      <PageHeader
        eyebrow={t('body.eyebrow')}
        title={t('body.title')}
        subtitle={t('body.subtitle')}
        accentClassName="from-[hsl(var(--brand)/0.14)] via-[hsl(var(--brand)/0.04)]"
        actions={null}
      >
        <BodySummary measurements={measurements} photos={photos} />
        <WhatToDoNext measurements={measurements} />
      </PageHeader>

      <Card className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">
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

        <div className="rounded-[20px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.6)] px-4 py-4 sm:px-5">
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

      {activeTab === 'overview' ? <Progress embedded measurements={measurements} photos={photos} /> : null}
      {activeTab === 'measurements' ? <Measurements embedded measurements={measurements} /> : null}
      {activeTab === 'photos' ? <ProgressPhotos embedded photos={photos} /> : null}
    </AppContainer>
  );
}
