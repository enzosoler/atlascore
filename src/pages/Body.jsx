import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Camera, Ruler, TrendingUp, ArrowRight, Target, Zap, Scale, Activity } from 'lucide-react';
import { AppContainer, Card, PageHeader, Section } from '@/components/shared/AppContainer';
import { FilterChip, EmptyState } from '@/components/shared/StablePage';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { listMeasurements, listProgressPhotos } from '@/services/bodyProgressService';
import { getMeasurementFieldValue } from '@/lib/measurementModel';
import { format, subDays } from 'date-fns';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import Progress from './Progress';
import Measurements from './Measurements';
import ProgressPhotos from './ProgressPhotos';
import { useT } from '@/lib/i18nContext';
import { ROUTES } from '@/lib/routes';

const TAB_IDS = ['overview', 'measurements', 'photos'];

// ── Trend chart ─────────────────────────────────────────────────────────────

function TrendChart({ data, dataKey, color, unit, label }) {
  if (!data || data.length < 2) {
    return (
      <Card className="px-5 py-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))] mb-3">{label}</p>
        <p className="text-[13px] text-[hsl(var(--fg-2))]">Need at least 2 data points to show a trend.</p>
      </Card>
    );
  }

  return (
    <Card className="px-5 py-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))] mb-4">{label}</p>
      <div className="h-[180px] -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.2} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="hsl(var(--border))" strokeOpacity={0.3} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: 'hsl(var(--fg-3))' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'hsl(var(--fg-3))' }}
              axisLine={false}
              tickLine={false}
              domain={['dataMin - 1', 'dataMax + 1']}
            />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 12,
                fontSize: 12,
              }}
              formatter={(v) => [`${v}${unit}`, label]}
            />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              fill={`url(#grad-${dataKey})`}
              dot={{ r: 3, fill: color, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: color, strokeWidth: 2, stroke: 'hsl(var(--card))' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

// ── Trend interpretation ────────────────────────────────────────────────────

function TrendInterpretation({ weightData, bodyFatData }) {
  const insights = [];

  if (weightData.length >= 3) {
    const recent = weightData.slice(0, 3).map((d) => d.weight);
    const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const oldest = weightData[weightData.length - 1]?.weight;
    if (oldest) {
      const delta = avg - oldest;
      if (Math.abs(delta) < 0.5) {
        insights.push({ text: 'Weight is stable — great for maintenance phases.', tone: 'neutral' });
      } else if (delta < 0) {
        insights.push({ text: `Weight trending down ${Math.abs(delta).toFixed(1)}kg — monitor energy and recovery.`, tone: 'ok' });
      } else {
        insights.push({ text: `Weight trending up ${delta.toFixed(1)}kg — check if this aligns with your goal.`, tone: 'warn' });
      }
    }
  }

  if (bodyFatData.length >= 3) {
    const recent = bodyFatData.slice(0, 3).map((d) => d.bodyFat);
    const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const oldest = bodyFatData[bodyFatData.length - 1]?.bodyFat;
    if (oldest) {
      const delta = avg - oldest;
      if (delta < -1) {
        insights.push({ text: `Body fat dropping — your training and nutrition are working.`, tone: 'ok' });
      } else if (delta > 1) {
        insights.push({ text: `Body fat increasing — consider reviewing calorie intake.`, tone: 'warn' });
      }
    }
  }

  if (insights.length === 0) return null;

  const toneColors = {
    ok: 'text-[hsl(var(--ok))]',
    warn: 'text-[hsl(var(--warn))]',
    neutral: 'text-[hsl(var(--fg-2))]',
  };

  return (
    <Card className="px-5 py-5 space-y-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">Trend Analysis</p>
      {insights.map((ins, i) => (
        <div key={i} className="flex items-start gap-2">
          <Activity className={`w-4 h-4 mt-0.5 shrink-0 ${toneColors[ins.tone]}`} strokeWidth={2} />
          <p className="text-[13px] leading-relaxed text-[hsl(var(--fg))]">{ins.text}</p>
        </div>
      ))}
    </Card>
  );
}

// ── Next action ─────────────────────────────────────────────────────────────

function NextAction({ measurements }) {
  const latest = measurements[0];
  const weight = getMeasurementFieldValue(latest, 'weight');
  const bodyFat = getMeasurementFieldValue(latest, 'body_fat_percent');

  let action, description, path;

  if (measurements.length === 0) {
    action = 'Log your first body checkpoint';
    description = 'Start tracking to unlock trend analysis.';
    path = ROUTES.measurements;
  } else if (!weight) {
    action = 'Add a weight measurement';
    description = 'Weight is the foundation of body tracking.';
    path = ROUTES.measurements;
  } else if (!bodyFat) {
    action = 'Log body fat percentage';
    description = 'Unlock body composition trends.';
    path = ROUTES.measurements;
  } else if (measurements.length < 3) {
    action = 'Keep logging weekly';
    description = `${3 - measurements.length} more entries to unlock trend charts.`;
    path = ROUTES.measurements;
  } else {
    action = 'Take a progress photo';
    description = 'Visual evidence compounds over time.';
    path = '/Body?tab=photos';
  }

  return (
    <Link to={path}>
      <Card className="px-5 py-5 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] active:scale-[0.98]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[18px] border border-[hsl(var(--brand)/0.2)] bg-[hsl(var(--brand)/0.08)] text-[hsl(var(--brand))]">
            <Target className="h-4 w-4" strokeWidth={1.9} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold tracking-[-0.016em] text-[hsl(var(--fg))]">{action}</p>
            <p className="text-[12px] text-[hsl(var(--fg-2))]">{description}</p>
          </div>
          <ArrowRight className="w-4 h-4 text-[hsl(var(--fg-3))] shrink-0" strokeWidth={2} />
        </div>
      </Card>
    </Link>
  );
}

// ── Summary cards ───────────────────────────────────────────────────────────

function BodySummary({ measurements }) {
  const t = useT();
  const weeksBack = 4;
  const startDate = subDays(new Date(), weeksBack * 7);

  const filtered = measurements.filter((m) => new Date(m.date) >= startDate);

  const latest = filtered[0];
  const oldest = filtered[filtered.length - 1];
  const latestWeight = getMeasurementFieldValue(latest, 'weight');
  const oldestWeight = getMeasurementFieldValue(oldest, 'weight');
  const latestBodyFat = getMeasurementFieldValue(latest, 'body_fat_percent');
  const oldestBodyFat = getMeasurementFieldValue(oldest, 'body_fat_percent');

  const weightChange = latestWeight != null && oldestWeight != null ? latestWeight - oldestWeight : 0;
  const bodyFatChange = latestBodyFat != null && oldestBodyFat != null ? latestBodyFat - oldestBodyFat : 0;

  const getTrendBadge = (change, unit, goodIfNeg = true) => {
    const isGood = goodIfNeg ? change < 0 : change > 0;
    const color = change === 0 ? 'text-[hsl(var(--fg-2))] bg-[hsl(var(--fill)/0.5)]'
      : isGood ? 'text-[hsl(var(--ok))] bg-[hsl(var(--ok)/0.12)]'
      : 'text-[hsl(var(--warn))] bg-[hsl(var(--warn)/0.12)]';
    const sign = change > 0 ? '+' : '';
    const label = change === 0 ? t('body.summary.stable') : `${sign}${Math.abs(change).toFixed(1)}${unit}`;
    return <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${color}`}>{label}</span>;
  };

  return (
    <div className="grid gap-3 md:grid-cols-3">
      <Card className="px-5 py-5">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">{t('body.summary.weight')}</p>
          {getTrendBadge(weightChange, 'kg')}
        </div>
        <p className="mt-3 text-[1.5rem] font-semibold tracking-[-0.05em] text-[hsl(var(--fg))]">
          {latestWeight ? `${latestWeight.toFixed(1)} kg` : '—'}
        </p>
      </Card>

      <Card className="px-5 py-5">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--fg-3))]">{t('body.summary.body_fat')}</p>
          {getTrendBadge(bodyFatChange, '%')}
        </div>
        <p className="mt-3 text-[1.5rem] font-semibold tracking-[-0.05em] text-[hsl(var(--fg))]">
          {latestBodyFat ? `${latestBodyFat.toFixed(1)}%` : '—'}
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
      </Card>
    </div>
  );
}

// ── Main ────────────────────────────────────────────────────────────────────

export default function Body() {
  const t = useT();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');

  const TABS = useMemo(() => [
    { id: 'overview',      label: t('body.tabs.overview_label'),      icon: TrendingUp },
    { id: 'measurements',  label: t('body.tabs.measurements_label'),  icon: Ruler },
    { id: 'photos',        label: t('body.tabs.photos_label'),        icon: Camera },
  ], [t]);

  const validTab = TABS.some((tab) => tab.id === tabFromUrl) ? tabFromUrl : 'overview';
  const [activeTab, setActiveTab] = useState(validTab);
  const { user } = useAuth();

  // Sync activeTab when URL search params change (e.g. via redirect to /body?tab=measurements)
  React.useEffect(() => {
    if (tabFromUrl && TAB_IDS.includes(tabFromUrl) && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data: measurements = [] } = useQuery({
    queryKey: ['body-measurements', user?.id],
    queryFn: () => listMeasurements(user.id, 200),
    enabled: !!user?.id,
  });

  const { data: photos = [] } = useQuery({
    queryKey: ['body-photos', user?.id],
    queryFn: () => listProgressPhotos(user.id, 50),
    enabled: !!user?.id,
  });

  // Build chart data
  const weightData = useMemo(() => {
    return measurements
      .map((m) => {
        const w = getMeasurementFieldValue(m, 'weight');
        return w != null ? { date: m.date, label: format(new Date(m.date), 'MMM d'), weight: parseFloat(w.toFixed(1)) } : null;
      })
      .filter(Boolean)
      .reverse();
  }, [measurements]);

  const bodyFatData = useMemo(() => {
    return measurements
      .map((m) => {
        const bf = getMeasurementFieldValue(m, 'body_fat_percent');
        return bf != null ? { date: m.date, label: format(new Date(m.date), 'MMM d'), bodyFat: parseFloat(bf.toFixed(1)) } : null;
      })
      .filter(Boolean)
      .reverse();
  }, [measurements]);

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
      />

      {/* Summary cards */}
      <BodySummary measurements={measurements} />

      {/* Trend charts */}
      <Section title="Trends">
        <div className="grid gap-3 md:grid-cols-2">
          <TrendChart data={weightData} dataKey="weight" color="hsl(var(--brand))" unit=" kg" label="Weight" />
          <TrendChart data={bodyFatData} dataKey="bodyFat" color="hsl(var(--warn))" unit="%" label="Body Fat" />
        </div>
      </Section>

      {/* Interpretation */}
      <TrendInterpretation weightData={weightData} bodyFatData={bodyFatData} />

      {/* Recommended action */}
      <NextAction measurements={measurements} />

      {/* Tab navigation */}
      <Card className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <FilterChip key={tab.id} active={activeTab === tab.id} onClick={() => handleTab(tab.id)} className="gap-2">
                <Icon className="h-4 w-4" strokeWidth={1.9} />
                {tab.label}
              </FilterChip>
            );
          })}
        </div>
      </Card>

      {activeTab === 'overview' ? <Progress embedded measurements={measurements} photos={photos} /> : null}
      {activeTab === 'measurements' ? <Measurements embedded measurements={measurements} /> : null}
      {activeTab === 'photos' ? <ProgressPhotos embedded photos={photos} /> : null}
    </AppContainer>
  );
}
