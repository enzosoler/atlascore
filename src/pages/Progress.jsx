import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { format, subDays, parseISO, isValid } from 'date-fns';
import AIProgressAnalysis from '@/components/ai/AIProgressAnalysis';
import ProgressPhotoCarousel from '@/components/progress/ProgressPhotoCarousel';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import {
  listMeasurements,
  listProgressPhotos,
} from '@/services/bodyProgressService';

function MetricCard({ label, value, unit, change, goal, data }) {
  const isPositive = change > 0;
  const hasValue = value != null && !Number.isNaN(Number(value));
  const isGoal = goal && hasValue && Math.abs(goal - value) < Math.abs(goal - (data?.[0]?.value || value));

  return (
    <div className="surface rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="t-small text-[hsl(var(--fg-2))]">{label}</p>
          <p className="t-kpi-sm mt-1">
            {hasValue ? Number(value).toFixed(1) : '—'}
            <span className="text-[14px] font-normal ml-1 text-[hsl(var(--fg-2))]">{unit}</span>
          </p>
        </div>
        {change !== 0 && hasValue && (
          <div className={`flex items-center gap-1 text-[12px] font-medium ${isPositive ? 'text-[hsl(var(--ok))]' : 'text-[hsl(var(--warn))]'}`}>
            {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {Math.abs(change).toFixed(1)}
          </div>
        )}
      </div>

      {/* Chart */}
      {data && data.length > 1 && (
        <ResponsiveContainer width="100%" height={60}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorChart" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--brand))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--brand))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="value" stroke="hsl(var(--brand))" fill="url(#colorChart)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      )}

      {/* Goal — only render when both value and goal are valid numbers */}
      {goal && hasValue && (
        <div className="pt-2 border-t border-[hsl(var(--border-h))]">
          <div className="flex items-center justify-between text-[12px] mb-1">
            <span className="text-[hsl(var(--fg-2))]">Goal: {goal}</span>
            <span className={`font-medium ${isGoal ? 'text-[hsl(var(--ok))]' : 'text-[hsl(var(--warn))]'}`}>
              {Math.abs(goal - value).toFixed(1)} to go
            </span>
          </div>
          <div className="h-1.5 bg-[hsl(var(--shell))] rounded-full overflow-hidden">
            <div
              className="h-full bg-[hsl(var(--brand))] rounded-full transition-all"
              style={{ width: `${Math.min(((value || 0) / (goal || 1)) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function Progress() {
  const [timeframe, setTimeframe] = useState('12w'); // 4w, 8w, 12w
  const { user } = useAuth();

  const weeksBack = timeframe === '4w' ? 4 : timeframe === '8w' ? 8 : 12;
  const startDate = subDays(new Date(), weeksBack * 7);

  const { data: measurements = [], isLoading: measurementsLoading } = useQuery({
    queryKey: ['measurements-progress', user?.id, timeframe],
    queryFn: () => listMeasurements(user.id, 100),
    enabled: !!user?.id,
  });

  const { data: profile } = useQuery({
    queryKey: ['user-profile-progress', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('profile_data')
        .eq('id', user.id)
        .single();

      if (error) {
        throw error;
      }

      return data?.profile_data || {};
    },
    enabled: !!user?.id,
  });

  // Demo photos with realistic dates (60 days span)
  const DEMO_PHOTOS = [
    {
      id: 'demo-1',
      date: '2026-01-01',
      photo_url: '/demo-progress-photos/progress_casual_1.jpg',
    },
    {
      id: 'demo-2',
      date: '2026-02-15',
      photo_url: '/demo-progress-photos/progress_casual_2.jpg',
    },
    {
      id: 'demo-3',
      date: '2026-03-19',
      photo_url: '/demo-progress-photos/progress_photo_3_after.jpg',
    },
  ];

  const { data: photos = DEMO_PHOTOS, isLoading: photosLoading } = useQuery({
    queryKey: ['progress-photos', user?.id],
    queryFn: async () => {
      const items = await listProgressPhotos(user.id, 50);
      return items.length > 0 ? items : DEMO_PHOTOS;
    },
    enabled: !!user?.id,
  });

  const isLoading = measurementsLoading || photosLoading;

  // Filter by timeframe
  const filteredMeasurements = measurements.filter(m => {
    const mDate = new Date(m.date);
    return mDate >= startDate;
  });

  // Calculate trends
  const latest = filteredMeasurements[0];
  const oldest = filteredMeasurements[filteredMeasurements.length - 1];

  const weightChange = latest && oldest ? latest.weight - oldest.weight : 0;
  const bfChange = latest && oldest ? latest.body_fat - oldest.body_fat : 0;

  // Chart data
  const chartData = filteredMeasurements
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(m => ({
      date: format(new Date(m.date), 'MMM d'),
      weight: m.weight,
      body_fat: m.body_fat,
      waist: m.waist,
      chest: m.chest,
      arms: m.arms,
      thighs: m.thighs,
      hips: m.hips,
      neck: m.neck,
    }));

  // ── Safe date formatter — avoids Invalid Date crash ────────────────
  const safeFormatDate = (dateValue, fmt = 'MMM d') => {
    if (!dateValue) return '—';
    try {
      const d = typeof dateValue === 'string' ? parseISO(dateValue) : new Date(dateValue);
      return isValid(d) ? format(d, fmt) : '—';
    } catch {
      return '—';
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-5 lg:p-8 space-y-6">
      <div>
        <h1 className="t-headline mb-1">Your Progress</h1>
        <p className="t-caption">Track trends over time</p>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--brand))]" strokeWidth={1.9} />
            <p className="text-[13px] text-[hsl(var(--fg-2))]">Loading progress…</p>
          </div>
        </div>
      )}

      {/* Empty state — no measurements yet */}
      {!isLoading && measurements.length === 0 && (
        <div className="surface rounded-xl p-10 text-center space-y-3">
          <p className="t-subtitle text-[hsl(var(--fg))]">No measurements recorded yet</p>
          <p className="t-small text-[hsl(var(--fg-2))]">
            Go to the Measurements page to record your first body checkpoint.
          </p>
        </div>
      )}

      {/* Timeframe toggle */}
      <div className="flex gap-2">
        {['4w', '8w', '12w'].map(tf => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={`px-4 h-9 rounded-lg text-[12px] font-medium transition-colors ${
              timeframe === tf
                ? 'bg-[hsl(var(--brand))] text-white'
                : 'bg-[hsl(var(--shell))] text-[hsl(var(--fg-2))] hover:text-[hsl(var(--fg))]'
            }`}
          >
            {tf}
          </button>
        ))}
      </div>

      {/* AI Analysis */}
      <AIProgressAnalysis measurements={filteredMeasurements} profile={profile} />

      {/* Weight + Body Fat side-by-side on desktop */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MetricCard
          label="Weight"
          value={latest?.weight}
          unit="kg"
          change={weightChange}
          goal={profile?.target_weight}
          data={chartData.map(d => ({ date: d.date, value: d.weight }))}
        />

        {latest?.body_fat && (
          <MetricCard
            label="Body Fat"
            value={latest.body_fat}
            unit="%"
            change={bfChange}
            goal={profile?.body_fat_goal}
            data={chartData.map(d => ({ date: d.date, value: d.body_fat }))}
          />
        )}
      </div>

      {/* Measurements */}
      {latest?.waist && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[
            { key: 'waist', label: 'Waist', unit: 'cm' },
            { key: 'chest', label: 'Chest', unit: 'cm' },
            { key: 'arms', label: 'Arms', unit: 'cm' },
            { key: 'thighs', label: 'Thighs', unit: 'cm' },
            { key: 'hips', label: 'Hips', unit: 'cm' },
            { key: 'neck', label: 'Neck', unit: 'cm' },
          ].map(({ key, label, unit }) => {
            const latestVal = latest?.[key];
            const oldestVal = oldest?.[key];
            const change = latestVal && oldestVal ? latestVal - oldestVal : 0;
            return latestVal ? (
              <MetricCard
                key={key}
                label={label}
                value={latestVal}
                unit={unit}
                change={change}
                data={chartData.map(d => ({ date: d.date, value: d[key] }))}
              />
            ) : null;
          })}
        </div>
      )}

      {/* Photos Carousel */}
      {photos.length > 0 && (
        <ProgressPhotoCarousel photos={photos} />
      )}
    </div>
  );
}
