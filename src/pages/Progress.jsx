import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import { format, subDays, parseISO, isValid } from 'date-fns';
import { TrendingDown, TrendingUp, Minus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SafePageBoundary } from '@/components/shared/StablePage';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { listMeasurements } from '@/services/bodyProgressService';
import { getMeasurementFieldValue } from '@/lib/measurementModel';
import { ROUTES } from '@/lib/routes';

// ─── Time range options ────────────────────────────────────────────────────────
const RANGES = [
  { key: '7d', label: '7D', days: 7 },
  { key: '4w', label: '4W', days: 28 },
  { key: '3m', label: '3M', days: 90 },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function safeDate(value) {
  if (!value) return null;
  const d = typeof value === 'string' ? parseISO(value) : new Date(value);
  return isValid(d) ? d : null;
}

function dateLabel(dateStr, days) {
  const d = safeDate(dateStr);
  if (!d) return '';
  if (days <= 7) return format(d, 'EEE');
  if (days <= 28) return format(d, 'MMM d');
  return format(d, 'MMM d');
}

/** Linear regression — returns slope (kg/day) and intercept */
function linearRegression(points) {
  const n = points.length;
  if (n < 2) return { slope: 0, intercept: points[0]?.y ?? 0 };
  const sumX = points.reduce((s, p) => s + p.x, 0);
  const sumY = points.reduce((s, p) => s + p.y, 0);
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
  const sumX2 = points.reduce((s, p) => s + p.x * p.x, 0);
  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return { slope: 0, intercept: sumY / n };
  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

// ─── Custom tooltip ────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label, unit, valueFmt }) {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value;
  return (
    <div className="rounded-[12px] border border-[hsl(var(--border)/0.8)] bg-[hsl(var(--card))] px-3 py-2 shadow-[var(--shadow-md)]">
      <p className="text-[11px] font-medium text-[hsl(var(--fg-3))] mb-0.5">{label}</p>
      <p className="text-[14px] font-semibold text-[hsl(var(--fg))]">
        {valueFmt ? valueFmt(val) : val != null ? `${Number(val).toFixed(1)} ${unit}` : '—'}
      </p>
    </div>
  );
}

// ─── Rate badge ────────────────────────────────────────────────────────────────

function RateBadge({ slope }) {
  const weeklyRate = slope * 7;
  if (Math.abs(weeklyRate) < 0.05) {
    return (
      <span className="flex items-center gap-1 rounded-full bg-[hsl(var(--fill)/0.8)] px-2.5 py-1 text-[11px] font-semibold text-[hsl(var(--fg-2))]">
        <Minus className="w-3 h-3" strokeWidth={2.5} />
        Stable
      </span>
    );
  }
  const isDown = weeklyRate < 0;
  return (
    <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
      isDown ? 'bg-[hsl(var(--ok)/0.12)] text-[hsl(var(--ok))]' : 'bg-[hsl(var(--warn)/0.12)] text-[hsl(var(--warn))]'
    }`}>
      {isDown ? <TrendingDown className="w-3 h-3" strokeWidth={2.5} /> : <TrendingUp className="w-3 h-3" strokeWidth={2.5} />}
      {isDown ? '−' : '+'}{Math.abs(weeklyRate).toFixed(2)} kg/wk
    </span>
  );
}

// ─── Section header ────────────────────────────────────────────────────────────

function GraphHeader({ label, value, unit, badge, action }) {
  return (
    <div className="flex items-start justify-between gap-3 mb-4">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[hsl(var(--fg-3))] mb-1">{label}</p>
        {value != null && (
          <p className="text-[26px] font-bold tracking-[-0.04em] text-[hsl(var(--fg))] leading-none">
            {Number(value).toFixed(1)}
            <span className="ml-1 text-[14px] font-medium text-[hsl(var(--fg-2))]">{unit}</span>
          </p>
        )}
      </div>
      <div className="flex flex-col items-end gap-2">
        {badge}
        {action}
      </div>
    </div>
  );
}

// ─── Empty placeholder ─────────────────────────────────────────────────────────

function EmptyChart({ label, cta, to }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-[hsl(var(--border)/0.6)] bg-[hsl(var(--fill)/0.2)] py-10 gap-3 text-center">
      <p className="text-[13px] font-medium text-[hsl(var(--fg-3))]">{label}</p>
      {cta && to && (
        <Link
          to={to}
          className="flex items-center gap-1.5 text-[12px] font-semibold text-[hsl(var(--brand))] hover:opacity-80"
        >
          {cta}
          <ArrowRight className="w-3 h-3" strokeWidth={2.5} />
        </Link>
      )}
    </div>
  );
}

// ─── Range tabs ────────────────────────────────────────────────────────────────

function RangeTabs({ selected, onChange }) {
  return (
    <div className="flex gap-1 rounded-[12px] bg-[hsl(var(--fill)/0.6)] p-0.5">
      {RANGES.map((r) => (
        <button
          key={r.key}
          onClick={() => onChange(r.key)}
          className={`flex-1 rounded-[10px] py-1.5 text-[12px] font-semibold transition-all ${
            selected === r.key
              ? 'bg-[hsl(var(--card))] text-[hsl(var(--fg))] shadow-[var(--shadow-xs)]'
              : 'text-[hsl(var(--fg-3))] hover:text-[hsl(var(--fg-2))]'
          }`}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}

// ─── Main content ──────────────────────────────────────────────────────────────

function ProgressContent() {
  const { user } = useAuth();
  const [range, setRange] = useState('4w');
  const days = RANGES.find((r) => r.key === range)?.days ?? 28;
  const cutoff = subDays(new Date(), days);

  // ── Data queries ─────────────────────────────────────────────────────────────
  const { data: measurements = [] } = useQuery({
    queryKey: ['measurements-progress-v2', user?.id],
    queryFn: () => listMeasurements(user.id, 150),
    enabled: !!user?.id,
  });

  const { data: foodLogs = [] } = useQuery({
    queryKey: ['food-logs-progress', user?.id, range],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('food_logs')
        .select('date, calories')
        .eq('user_id', user.id)
        .gte('date', cutoff.toISOString())
        .order('date', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: workoutLogs = [] } = useQuery({
    queryKey: ['workout-logs-progress', user?.id, range],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workout_logs')
        .select('date, status')
        .eq('user_id', user.id)
        .gte('date', cutoff.toISOString())
        .order('date', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: profile } = useQuery({
    queryKey: ['profile-progress', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('calories_target, protein_target')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // ── Weight trend data ─────────────────────────────────────────────────────────
  const weightData = useMemo(() => {
    return measurements
      .filter((m) => {
        const d = safeDate(m.date || m.recorded_at);
        return d && d >= cutoff;
      })
      .map((m) => {
        const d = safeDate(m.date || m.recorded_at);
        const weight = getMeasurementFieldValue(m, 'weight') ?? m.weight_kg;
        return {
          date: d.toISOString().split('T')[0],
          value: weight != null ? Number(weight) : null,
          ts: d.getTime(),
        };
      })
      .filter((p) => p.value != null)
      .sort((a, b) => a.ts - b.ts);
  }, [measurements, range]);

  const weightRegression = useMemo(() => {
    if (weightData.length < 2) return null;
    const base = weightData[0].ts;
    const points = weightData.map((p) => ({ x: (p.ts - base) / 86400000, y: p.value }));
    const { slope, intercept } = linearRegression(points);
    return { slope, start: intercept, end: intercept + slope * ((weightData.at(-1).ts - base) / 86400000) };
  }, [weightData]);

  const latestWeight = weightData.at(-1)?.value ?? null;
  const firstWeight = weightData[0]?.value ?? null;
  const weightSlope = weightRegression?.slope ?? 0;

  // ── Calories vs target data ───────────────────────────────────────────────────
  const calorieTarget = profile?.calories_target ?? 2000;

  const calorieData = useMemo(() => {
    const byDay = {};
    for (const log of foodLogs) {
      const d = safeDate(log.date);
      if (!d) continue;
      const key = d.toISOString().split('T')[0];
      byDay[key] = (byDay[key] ?? 0) + (log.calories ?? 0);
    }
    // Fill all days in range
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const key = d.toISOString().split('T')[0];
      result.push({
        date: key,
        label: dateLabel(key, days),
        calories: byDay[key] ?? null,
        target: calorieTarget,
      });
    }
    return result;
  }, [foodLogs, days, calorieTarget]);

  // ── Adherence data ────────────────────────────────────────────────────────────
  const adherenceData = useMemo(() => {
    const foodDays = new Set(
      foodLogs.map((l) => safeDate(l.date)?.toISOString().split('T')[0]).filter(Boolean)
    );
    const workoutDays = new Set(
      workoutLogs.map((l) => safeDate(l.date)?.toISOString().split('T')[0]).filter(Boolean)
    );
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const key = d.toISOString().split('T')[0];
      result.push({
        date: key,
        label: dateLabel(key, days),
        nutrition: foodDays.has(key) ? 1 : 0,
        training: workoutDays.has(key) ? 1 : 0,
      });
    }
    return result;
  }, [foodLogs, workoutLogs, days]);

  const nutritionAdherencePct = Math.round(
    (adherenceData.filter((d) => d.nutrition).length / adherenceData.length) * 100
  );
  const trainingAdherencePct = Math.round(
    (adherenceData.filter((d) => d.training).length / adherenceData.length) * 100
  );

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-full bg-[hsl(var(--bg))] pb-8">
      <div className="mx-auto max-w-lg px-4 pt-5 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-bold tracking-[-0.03em] text-[hsl(var(--fg))]">Progress</h1>
          <RangeTabs selected={range} onChange={setRange} />
        </div>

        {/* ── Weight Trend ─────────────────────────────────────────────────── */}
        <div className="rounded-[20px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card)/0.9)] p-4">
          <GraphHeader
            label="Weight"
            value={latestWeight}
            unit="kg"
            badge={weightRegression && <RateBadge slope={weightSlope} />}
            action={
              latestWeight != null && firstWeight != null && Math.abs(latestWeight - firstWeight) >= 0.1 ? (
                <span className={`text-[11px] font-medium ${latestWeight < firstWeight ? 'text-[hsl(var(--ok))]' : 'text-[hsl(var(--warn))]'}`}>
                  {latestWeight < firstWeight ? '−' : '+'}{Math.abs(latestWeight - firstWeight).toFixed(1)} kg total
                </span>
              ) : null
            }
          />
          {weightData.length >= 2 ? (
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={weightData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                <defs>
                  <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--brand))" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="hsl(var(--brand))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tickFormatter={(v) => dateLabel(v, days)}
                  tick={{ fontSize: 10, fill: 'hsl(var(--fg-3))', fontWeight: 500 }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={['auto', 'auto']}
                  tick={{ fontSize: 10, fill: 'hsl(var(--fg-3))' }}
                  tickLine={false}
                  axisLine={false}
                  width={36}
                  tickCount={4}
                />
                <Tooltip content={<ChartTooltip unit="kg" />} />
                {/* Trend reference line */}
                {weightRegression && weightData.length >= 3 && (
                  <ReferenceLine
                    segment={[
                      { x: weightData[0].date, y: weightRegression.start },
                      { x: weightData.at(-1).date, y: weightRegression.end },
                    ]}
                    stroke="hsl(var(--brand))"
                    strokeDasharray="4 3"
                    strokeOpacity={0.5}
                    strokeWidth={1.5}
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--brand))"
                  fill="url(#weightGrad)"
                  strokeWidth={2.2}
                  dot={{ r: 3, fill: 'hsl(var(--brand))', strokeWidth: 0 }}
                  activeDot={{ r: 4, fill: 'hsl(var(--brand))', strokeWidth: 0 }}
                  connectNulls
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart
              label="Log your weight to see the trend"
              cta="Add measurement"
              to={ROUTES.measurements}
            />
          )}
        </div>

        {/* ── Calories vs Target ───────────────────────────────────────────── */}
        <div className="rounded-[20px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card)/0.9)] p-4">
          <GraphHeader
            label="Calories"
            value={calorieData.filter((d) => d.calories != null).at(-1)?.calories ?? null}
            unit="kcal today"
          />
          {calorieData.some((d) => d.calories != null) ? (
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={calorieData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }} barCategoryGap="28%">
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: 'hsl(var(--fg-3))', fontWeight: 500 }}
                  tickLine={false}
                  axisLine={false}
                  interval={days <= 7 ? 0 : days <= 28 ? 3 : 6}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'hsl(var(--fg-3))' }}
                  tickLine={false}
                  axisLine={false}
                  width={36}
                  tickCount={3}
                />
                <Tooltip
                  content={<ChartTooltip unit="kcal" valueFmt={(v) => v != null ? `${Math.round(v)} kcal` : 'Not logged'} />}
                />
                <ReferenceLine
                  y={calorieTarget}
                  stroke="hsl(var(--brand))"
                  strokeDasharray="4 3"
                  strokeOpacity={0.5}
                  strokeWidth={1.5}
                />
                <Bar
                  dataKey="calories"
                  fill="hsl(var(--brand))"
                  fillOpacity={0.75}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart
              label="No meals logged in this period"
              cta="Log a meal"
              to={ROUTES.nutrition}
            />
          )}
          <p className="mt-2 text-[11px] text-[hsl(var(--fg-3))]">
            Dashed line = {calorieTarget} kcal target
          </p>
        </div>

        {/* ── Adherence ────────────────────────────────────────────────────── */}
        <div className="rounded-[20px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card)/0.9)] p-4">
          <GraphHeader label="Adherence" />
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: 'Nutrition', pct: nutritionAdherencePct, color: 'hsl(var(--brand))' },
              { label: 'Training', pct: trainingAdherencePct, color: 'hsl(var(--ok))' },
            ].map(({ label, pct, color }) => (
              <div key={label} className="rounded-[14px] bg-[hsl(var(--fill)/0.4)] px-3 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[hsl(var(--fg-3))] mb-2">{label}</p>
                <p className="text-[22px] font-bold tracking-[-0.04em] text-[hsl(var(--fg))]">{pct}%</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[hsl(var(--fill)/0.8)]">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={80}>
            <BarChart data={adherenceData} margin={{ top: 0, right: 4, left: -28, bottom: 0 }} barCategoryGap="20%" barSize={days <= 7 ? 18 : days <= 28 ? 10 : 5}>
              <XAxis dataKey="label" hide />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="rounded-[10px] border border-[hsl(var(--border)/0.8)] bg-[hsl(var(--card))] px-2.5 py-2 shadow-[var(--shadow-md)] space-y-0.5">
                      <p className="text-[10px] text-[hsl(var(--fg-3))]">{label}</p>
                      <p className="text-[12px] font-semibold text-[hsl(var(--fg))]">
                        {payload.find((p) => p.dataKey === 'nutrition')?.value ? '✓ Nutrition' : '— Nutrition'}
                      </p>
                      <p className="text-[12px] font-semibold text-[hsl(var(--fg))]">
                        {payload.find((p) => p.dataKey === 'training')?.value ? '✓ Training' : '— Training'}
                      </p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="nutrition" fill="hsl(var(--brand))" fillOpacity={0.7} radius={[3, 3, 0, 0]} stackId="a" />
              <Bar dataKey="training" fill="hsl(var(--ok))" fillOpacity={0.7} radius={[3, 3, 0, 0]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-2 flex gap-4">
            {[
              { color: 'hsl(var(--brand))', label: 'Nutrition' },
              { color: 'hsl(var(--ok))', label: 'Training' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color, opacity: 0.8 }} />
                <span className="text-[11px] text-[hsl(var(--fg-3))]">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Body Composition stats ────────────────────────────────────────── */}
        {measurements.length > 0 && (() => {
          const recent = [...measurements].sort((a, b) => {
            const da = safeDate(a.date || a.recorded_at);
            const db = safeDate(b.date || b.recorded_at);
            return (db?.getTime() ?? 0) - (da?.getTime() ?? 0);
          });
          const latest = recent[0];
          const prev = recent[1];
          const fields = [
            { key: 'weight', label: 'Weight', unit: 'kg' },
            { key: 'body_fat_percent', label: 'Body Fat', unit: '%' },
          ];
          return (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[hsl(var(--fg-3))] mb-3">Body Composition</p>
              <div className="grid grid-cols-2 gap-3">
                {fields.map(({ key, label, unit }) => {
                  const latestVal = getMeasurementFieldValue(latest, key) ?? latest?.[key === 'body_fat_percent' ? 'body_fat_pct' : key];
                  const prevVal = prev ? (getMeasurementFieldValue(prev, key) ?? prev?.[key === 'body_fat_percent' ? 'body_fat_pct' : key]) : null;
                  const delta = latestVal != null && prevVal != null ? latestVal - prevVal : null;
                  return (
                    <div key={key} className="rounded-[16px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card)/0.9)] px-4 py-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[hsl(var(--fg-3))] mb-2">{label}</p>
                      <p className="text-[22px] font-bold tracking-[-0.04em] text-[hsl(var(--fg))]">
                        {latestVal != null ? Number(latestVal).toFixed(1) : '—'}
                        <span className="ml-1 text-[12px] font-medium text-[hsl(var(--fg-2))]">{unit}</span>
                      </p>
                      {delta != null && (
                        <p className={`mt-1 text-[11px] font-medium ${delta < 0 ? 'text-[hsl(var(--ok))]' : 'text-[hsl(var(--warn))]'}`}>
                          {delta < 0 ? '↓' : '↑'} {Math.abs(delta).toFixed(1)}{unit} vs prior
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* ── Footer links ─────────────────────────────────────────────────── */}
        <div className="flex gap-3">
          <Link
            to={ROUTES.measurements}
            className="flex-1 flex items-center justify-center gap-2 rounded-[14px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--fill)/0.4)] py-3 text-[13px] font-semibold text-[hsl(var(--fg-2))] hover:text-[hsl(var(--fg))] transition-colors"
          >
            All Measurements <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
          </Link>
          <Link
            to={ROUTES.labExams}
            className="flex-1 flex items-center justify-center gap-2 rounded-[14px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--fill)/0.4)] py-3 text-[13px] font-semibold text-[hsl(var(--fg-2))] hover:text-[hsl(var(--fg))] transition-colors"
          >
            Lab Results <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function Progress() {
  return (
    <SafePageBoundary
      title="Progress"
      subtitle="Your data, visualized"
      fallbackDescription="The Progress screen opened in safe mode."
    >
      <ProgressContent />
    </SafePageBoundary>
  );
}
