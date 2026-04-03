/**
 * Progress — Full analytics dashboard.
 *
 * Graphs: weight trend, body-fat trend, calories vs target, protein vs target,
 * workout trend, adherence, lab trends, photos timeline, AI interpretation.
 */

import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ReferenceLine,
} from 'recharts';
import { format, subDays, parseISO, isValid, startOfWeek, isSameDay } from 'date-fns';
import {
  TrendingDown, TrendingUp, Minus, ArrowRight,
  Camera, Sparkles, FlaskConical, Plus, Target,
  Zap, Dumbbell, UtensilsCrossed, Scale,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SafePageBoundary } from '@/components/shared/StablePage';
import { ChartCard, ChartHeader, EmptyChart } from '@/components/progress/ChartCard';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { listMeasurements, listProgressPhotos } from '@/services/bodyProgressService';
import { getMeasurementFieldValue } from '@/lib/measurementModel';
import { ROUTES } from '@/lib/routes';
import { useAICoach } from '@/hooks/useAICoach';
import { useT } from '@/lib/i18nContext';
import { cn } from '@/lib/utils';

// ─── Constants ─────────────────────────────────────────────────────────────────

const RANGES = [
  { key: '7d', label: '7D', days: 7 },
  { key: '4w', label: '4W', days: 28 },
  { key: '3m', label: '3M', days: 90 },
  { key: '1y', label: '1Y', days: 365 },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function safeDate(v) {
  if (!v) return null;
  const d = typeof v === 'string' ? parseISO(v) : new Date(v);
  return isValid(d) ? d : null;
}

function formatDateKey(date) {
  const d = safeDate(date);
  if (!d) return '';
  return format(d, 'yyyy-MM-dd');
}

function dateLabel(dateStr, days) {
  const d = safeDate(dateStr);
  if (!d) return '';
  if (days <= 7) return format(d, 'EEE');
  if (days <= 28) return format(d, 'MMM d');
  return format(d, 'M/d');
}

function linearRegression(points) {
  const n = points.length;
  if (n < 2) return { slope: 0, intercept: points[0]?.y ?? 0 };
  const sumX = points.reduce((s, p) => s + p.x, 0);
  const sumY = points.reduce((s, p) => s + p.y, 0);
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
  const sumX2 = points.reduce((s, p) => s + p.x * p.x, 0);
  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return { slope: 0, intercept: sumY / n };
  return {
    slope: (n * sumXY - sumX * sumY) / denom,
    intercept: (sumY * sumX2 - sumX * sumXY) / (n * denom),
  };
}

// ─── Progress Stats Header ────────────────────────────────────────────────────

function ProgressStatsHeader({ measurements, workoutLogs, foodLogs, photos, days, t }) {
  const stats = useMemo(() => {
    const measurementCount = measurements.filter((m) => {
      const d = safeDate(m.date);
      return d && d >= subDays(new Date(), days);
    }).length;
    
    const workoutCount = workoutLogs.length;
    const nutritionDays = new Set(foodLogs.map((l) => l.date?.split('T')[0]).filter(Boolean)).size;
    const hasPhotos = photos.length > 0;
    
    return { measurementCount, workoutCount, nutritionDays, hasPhotos };
  }, [measurements, workoutLogs, foodLogs, photos, days]);
  
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-[18px] bg-[hsl(var(--card))] border border-[hsl(var(--border)/0.5)] p-3 text-center">
        <p className="text-[11px] font-medium text-[hsl(var(--fg-3))] uppercase tracking-wide">{t('progress.stats.measurements')}</p>
        <p className="text-[22px] font-bold text-[hsl(var(--brand))] mt-1">{stats.measurementCount}</p>
        <p className="text-[10px] text-[hsl(var(--fg-3))]">{t('progress.stats.logged')}</p>
      </div>
      <div className="rounded-[18px] bg-[hsl(var(--card))] border border-[hsl(var(--border)/0.5)] p-3 text-center">
        <p className="text-[11px] font-medium text-[hsl(var(--fg-3))] uppercase tracking-wide">{t('progress.stats.workouts')}</p>
        <p className="text-[22px] font-bold text-[hsl(var(--ok))] mt-1">{stats.workoutCount}</p>
        <p className="text-[10px] text-[hsl(var(--fg-3))]">{t('progress.stats.sessions')}</p>
      </div>
    </div>
  );
}

// ─── Progress Empty State ─────────────────────────────────────────────────────

function ProgressEmptyState({ hasNoData, t }) {
  if (!hasNoData) return null;
  
  return (
    <div className="rounded-2xl bg-gradient-to-b from-[hsl(var(--fill)/0.5)] to-[hsl(var(--card))] border border-[hsl(var(--border)/0.5)] p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--brand)/0.1)] flex items-center justify-center mx-auto mb-4">
        <TrendingUp className="w-8 h-8 text-[hsl(var(--brand))]" strokeWidth={1.5} />
      </div>
      <p className="text-title3 font-bold text-[hsl(var(--fg))] mb-2">{t('progress.empty.title')}</p>
      <p className="text-body text-[hsl(var(--fg-2))] mb-5 max-w-[280px] mx-auto">{t('progress.empty.desc')}</p>
      <Link 
        to={ROUTES.measurements}
        className="inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--brand))] text-white px-6 py-3 text-[14px] font-semibold hover:bg-[hsl(var(--brand)/0.9)] transition-colors shadow-[0_4px_14px_hsl(var(--brand)/0.3)]"
      >
        <Plus className="w-4 h-4" />
        {t('progress.empty.cta')}
      </Link>
    </div>
  );
}

// ─── Next Action Card ─────────────────────────────────────────────────────────

function NextActionCard({ weightData, workoutLogs, foodLogs, photos, t }) {
  const hasWeight = weightData.length >= 2;
  const hasWorkouts = workoutLogs.length > 0;
  const hasNutrition = foodLogs.length > 0;
  const hasPhotos = photos.length > 0;
  
  let action = null;
  let priority = 'medium';
  
  if (!hasWeight) {
    action = {
      title: t('progress.action.logWeight'),
      subtitle: t('progress.action.logWeightDesc'),
      icon: Scale,
      cta: t('progress.action.addNow'),
      to: ROUTES.measurements,
    };
    priority = 'high';
  } else if (!hasPhotos) {
    action = {
      title: t('progress.action.takePhoto'),
      subtitle: t('progress.action.takePhotoDesc'),
      icon: Camera,
      cta: t('progress.action.addPhoto'),
      to: ROUTES.progressPhotos,
    };
    priority = 'medium';
  } else if (!hasWorkouts) {
    action = {
      title: t('progress.action.logWorkout'),
      subtitle: t('progress.action.logWorkoutDesc'),
      icon: Dumbbell,
      cta: t('progress.action.trainNow'),
    };
    priority = 'medium';
  } else if (!hasNutrition) {
    action = {
      title: t('progress.action.logNutrition'),
      subtitle: t('progress.action.logNutritionDesc'),
      icon: UtensilsCrossed,
      cta: t('progress.action.logMeal'),
    };
    priority = 'low';
  } else {
    action = {
      title: t('progress.action.keepGoing'),
      subtitle: t('progress.action.keepGoingDesc'),
      icon: Sparkles,
      cta: t('progress.action.viewAll'),
    };
    priority = 'low';
  }
  
  if (!action) return null;
  
  const Icon = action.icon;
  const isViewAll = action.cta === t('progress.action.viewAll');
  
  const buttonClass = cn(
    "rounded-xl px-4 py-2 text-[13px] font-semibold transition-colors shrink-0",
    priority === 'high' && "bg-[hsl(var(--err))] text-white hover:bg-[hsl(var(--err)/0.9)]",
    priority === 'medium' && "bg-[hsl(var(--warn))] text-white hover:bg-[hsl(var(--warn)/0.9)]",
    priority === 'low' && "bg-[hsl(var(--success))] text-white hover:bg-[hsl(var(--success)/0.9)]",
  );
  
  return (
    <div className={cn(
      "rounded-2xl border p-4",
      priority === 'high' && "bg-[hsl(var(--err)/0.06)] border-[hsl(var(--err)/0.2)]",
      priority === 'medium' && "bg-[hsl(var(--warn)/0.06)] border-[hsl(var(--warn)/0.2)]",
      priority === 'low' && "bg-[hsl(var(--success)/0.06)] border-[hsl(var(--success)/0.2)]",
    )}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            priority === 'high' && "bg-[hsl(var(--err)/0.15)] text-[hsl(var(--err))]",
            priority === 'medium' && "bg-[hsl(var(--warn)/0.15)] text-[hsl(var(--warn))]",
            priority === 'low' && "bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))]",
          )}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-subhead font-bold text-[hsl(var(--fg))]">{action.title}</p>
            <p className="text-caption1 text-[hsl(var(--fg-3))]">{action.subtitle}</p>
          </div>
        </div>
        <Link to={action.to || ROUTES.measurements} className={buttonClass}>
          {action.cta}
        </Link>
      </div>
    </div>
  );
}

// ─── Goal Celebration Card ────────────────────────────────────────────────────

function GoalCelebrationCard({ weightData, adherence, t }) {
  const hasWeightGoal = weightData.length >= 2;
  const strongAdherence = adherence.nutrition >= 80 && adherence.training >= 70;
  
  if (!hasWeightGoal && !strongAdherence) return null;
  
  return (
    <div className="rounded-2xl bg-gradient-to-br from-[hsl(var(--ok)/0.12)] via-[hsl(var(--ok)/0.06)] to-[hsl(var(--card))] border border-[hsl(var(--ok)/0.3)] p-5">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--ok))] flex items-center justify-center shadow-lg shadow-[hsl(var(--ok)/0.3)]">
          <Target className="w-7 h-7 text-white" strokeWidth={2.5} />
        </div>
        <div className="flex-1">
          <p className="text-title3 font-bold text-[hsl(var(--fg))]">{t('progress.celebration.title')}</p>
          <p className="text-body text-[hsl(var(--fg-2))] mt-1">{t('progress.celebration.subtitle')}</p>
          <div className="flex items-center gap-4 mt-3">
            {hasWeightGoal && (
              <div className="flex items-center gap-1.5 text-caption1 text-[hsl(var(--fg-3))]">
                <TrendingUp className="w-3.5 h-3.5" />
                {weightData.length} {t('progress.celebration.measurements')}
              </div>
            )}
            {strongAdherence && (
              <div className="flex items-center gap-1.5 text-caption1 text-[hsl(var(--fg-3))]">
                <Zap className="w-3.5 h-3.5" />
                {t('progress.celebration.consistency')}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-[hsl(var(--ok)/0.2)]">
        <p className="text-caption1 text-[hsl(var(--fg-3))] text-center">{t('progress.celebration.message')}</p>
      </div>
    </div>
  );
}

// ─── Chart tooltip ─────────────────────────────────────────────────────────────

function Tip({ active, payload, label, unit, fmt }) {
  if (!active || !payload?.length) return null;
  const v = payload[0]?.value;
  return (
    <div className="rounded-[10px] border border-[hsl(var(--border)/0.8)] bg-[hsl(var(--card))] px-2.5 py-1.5 shadow-[var(--shadow-md)]">
      <p className="text-[10px] text-[hsl(var(--fg-3))]">{label}</p>
      <p className="text-[13px] font-semibold text-[hsl(var(--fg))]">
        {fmt ? fmt(v) : v != null ? `${Number(v).toFixed(1)} ${unit}` : '—'}
      </p>
    </div>
  );
}

// ─── Rate badge ────────────────────────────────────────────────────────────────

function RateBadge({ slope, unit = 'kg/wk' }) {
  const t = useT();
  const rate = slope * 7;
  if (Math.abs(rate) < 0.05) {
    return <span className="flex items-center gap-1 rounded-full bg-[hsl(var(--fill)/0.8)] px-2 py-1 text-[10px] font-semibold text-[hsl(var(--fg-2))]"><Minus className="w-3 h-3" />{t('progress.rate_stable')}</span>;
  }
  const down = rate < 0;
  return (
    <span className={`flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${down ? 'bg-[hsl(var(--ok)/0.12)] text-[hsl(var(--ok))]' : 'bg-[hsl(var(--warn)/0.12)] text-[hsl(var(--warn))]'}`}>
      {down ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
      {down ? '-' : '+'}{Math.abs(rate).toFixed(2)} {unit}
    </span>
  );
}

// ─── Range tabs ────────────────────────────────────────────────────────────────

function RangeTabs({ selected, onChange }) {
  return (
    <div className="flex gap-0.5 rounded-[12px] bg-[hsl(var(--fill)/0.6)] p-0.5">
      {RANGES.map((r) => (
        <button key={r.key} onClick={() => onChange(r.key)}
          className={`flex-1 rounded-[10px] py-1.5 text-[11px] font-semibold transition-all ${
            selected === r.key
              ? 'bg-[hsl(var(--card))] text-[hsl(var(--fg))] shadow-[var(--shadow-xs)]'
              : 'text-[hsl(var(--fg-3))]'
          }`}>{r.label}</button>
      ))}
    </div>
  );
}

// ─── Trend Line Chart (reused for weight + body fat) ──────────────────────────

function TrendLineChart({ data, dataKey, gradientId, color, days, unit, showRegression, emptyLabel, emptyCta }) {
  if (!data || data.length < 2) return <EmptyChart label={emptyLabel} cta={emptyCta} to={ROUTES.measurements} />;

  const regression = showRegression && data.length >= 3 ? (() => {
    const base = data[0].ts;
    const pts = data.map((p) => ({ x: (p.ts - base) / 86400000, y: p[dataKey] }));
    return linearRegression(pts);
  })() : null;

  return (
    <ResponsiveContainer width="100%" height={130}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.2} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'hsl(var(--fg-3))' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
        <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: 'hsl(var(--fg-3))' }} tickLine={false} axisLine={false} width={36} tickCount={4} />
        <Tooltip content={<Tip unit={unit} />} />
        <Area type="monotone" dataKey={dataKey} stroke={color} fill={`url(#${gradientId})`} strokeWidth={2} dot={{ r: 2.5, fill: color, strokeWidth: 0 }} activeDot={{ r: 4, fill: color }} connectNulls />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── Bar Chart (reused for calories, protein, workout) ────────────────────────

function TargetBarChart({ data, dataKey, targetValue, color, days, unit, emptyLabel, emptyCta, noDataLabel = 'No data' }) {
  if (!data || !data.some((d) => d[dataKey] != null)) return <EmptyChart label={emptyLabel} cta={emptyCta} to={ROUTES.nutrition} />;
  
  // Ensure the chart doesn't look "full" if values are tiny and target is 0
  const maxValue = Math.max(...data.map(d => d[dataKey] || 0));
  const defaultTarget = unit === 'g' ? 120 : unit === 'kcal' ? 2000 : 0;
  const effectiveTarget = targetValue > 0 ? targetValue : defaultTarget;
  const domainMax = Math.max(maxValue * 1.1, effectiveTarget * 1.05);

  return (
    <ResponsiveContainer width="100%" height={110}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }} barCategoryGap="25%">
        <XAxis dataKey="label" tick={{ fontSize: 9, fill: 'hsl(var(--fg-3))' }} tickLine={false} axisLine={false} interval={days <= 7 ? 0 : days <= 28 ? 3 : 6} />
        <YAxis domain={[0, domainMax]} tick={{ fontSize: 10, fill: 'hsl(var(--fg-3))' }} tickLine={false} axisLine={false} width={36} tickCount={3} />
        <Tooltip cursor={{ fill: 'hsl(var(--fill)/0.4)' }} content={<Tip unit={unit} fmt={(v) => v != null ? `${Math.round(v)} ${unit}` : noDataLabel} />} />
        {targetValue > 0 && <ReferenceLine y={targetValue} stroke="hsl(var(--brand))" strokeDasharray="4 3" strokeOpacity={0.5} strokeWidth={1.5} />}
        <Bar dataKey={dataKey} fill={color} fillOpacity={0.75} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────

function ProgressContent() {
  const t = useT();
  const { user } = useAuth();
  const ai = useAICoach({ userId: user?.id });
  const [range, setRange] = useState('4w');
  const days = RANGES.find((r) => r.key === range)?.days ?? 28;
  const cutoff = subDays(new Date(), days);

  // ── Queries ─────────────────────────────────────────────────────────────────
  const { data: measurements = [] } = useQuery({
    queryKey: ['progress-measurements', user?.id],
    queryFn: () => listMeasurements(user.id, 200),
    enabled: !!user?.id,
  });

  const { data: foodLogs = [] } = useQuery({
    queryKey: ['progress-food', user?.id, range],
    queryFn: async () => {
      const { data } = await supabase.from('food_logs').select('date, calories, protein').eq('user_id', user.id).gte('date', cutoff.toISOString()).order('date');
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: workoutLogs = [] } = useQuery({
    queryKey: ['progress-workouts', user?.id, range],
    queryFn: async () => {
      const { data } = await supabase.from('workouts').select('completed_at, status').eq('user_id', user.id).gte('completed_at', cutoff.toISOString()).order('completed_at');
      // Normalize: rest of the page reads .date — map completed_at → date
      return (data || []).map((w) => ({ ...w, date: w.completed_at }));
    },
    enabled: !!user?.id,
  });

  const { data: photos = [] } = useQuery({
    queryKey: ['progress-photos', user?.id],
    queryFn: () => listProgressPhotos(user.id, 10),
    enabled: !!user?.id,
  });

  const { data: profile } = useQuery({
    queryKey: ['progress-profile', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('profile_data').eq('id', user.id).single();
      const pd = data?.profile_data ?? {};
      return {
        calories_target: pd.calories_target ?? pd.targets?.calories ?? 0,
        protein_target: pd.protein_target ?? pd.targets?.protein ?? 0,
      };
    },
    enabled: !!user?.id,
  });

  const kcalTarget = profile?.calories_target ?? 0;
  const proteinTarget = profile?.protein_target ?? 0;

  // ── Weight data ─────────────────────────────────────────────────────────────
  const weightData = useMemo(() => {
    return measurements
      .filter((m) => { const d = safeDate(m.date); return d && d >= cutoff; })
      .map((m) => {
        const d = safeDate(m.date);
        const w = getMeasurementFieldValue(m, 'weight');
        return w != null ? { date: m.date, label: dateLabel(m.date, days), value: Number(w), ts: d.getTime() } : null;
      })
      .filter(Boolean)
      .sort((a, b) => a.ts - b.ts);
  }, [measurements, range]);

  const weightSlope = useMemo(() => {
    if (weightData.length < 2) return 0;
    const base = weightData[0].ts;
    const pts = weightData.map((p) => ({ x: (p.ts - base) / 86400000, y: p.value }));
    return linearRegression(pts).slope;
  }, [weightData]);

  // ── Body fat data ───────────────────────────────────────────────────────────
  const bfData = useMemo(() => {
    return measurements
      .filter((m) => { const d = safeDate(m.date); return d && d >= cutoff; })
      .map((m) => {
        const d = safeDate(m.date);
        const bf = getMeasurementFieldValue(m, 'body_fat_percent');
        return bf != null ? { date: m.date, label: dateLabel(m.date, days), value: Number(bf), ts: d.getTime() } : null;
      })
      .filter(Boolean)
      .sort((a, b) => a.ts - b.ts);
  }, [measurements, range]);

  // ── Calorie data ────────────────────────────────────────────────────────────
  const calorieData = useMemo(() => {
    const byDay = {};
    for (const l of foodLogs) {
      const k = formatDateKey(l.date);
      if (k) byDay[k] = (byDay[k] ?? 0) + (l.calories ?? 0);
    }
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const k = formatDateKey(d);
      result.push({ date: k, label: dateLabel(k, days), calories: byDay[k] ?? null });
    }
    return result;
  }, [foodLogs, days]);

  // ── Protein data ────────────────────────────────────────────────────────────
  const proteinData = useMemo(() => {
    const byDay = {};
    for (const l of foodLogs) {
      const k = formatDateKey(l.date);
      if (k) byDay[k] = (byDay[k] ?? 0) + (l.protein ?? 0);
    }
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const k = formatDateKey(d);
      result.push({ date: k, label: dateLabel(k, days), protein: byDay[k] ?? null });
    }
    return result;
  }, [foodLogs, days]);

  // ── Workout trend (weekly count) ────────────────────────────────────────────
  const workoutWeekData = useMemo(() => {
    const byWeek = {};
    // Group all workouts into weeks (Monday start)
    for (const l of workoutLogs) {
      const d = safeDate(l.date);
      if (!d) continue;
      const ws = startOfWeek(d, { weekStartsOn: 1 });
      const k = formatDateKey(ws);
      byWeek[k] = (byWeek[k] ?? 0) + 1;
    }
    // Convert to sorted array
    return Object.entries(byWeek)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([k, v]) => ({ 
        label: format(parseISO(k), 'MMM d'), 
        date: k, 
        count: v 
      }));
  }, [workoutLogs]);

  // ── Adherence ───────────────────────────────────────────────────────────────
  const adherence = useMemo(() => {
    const foodDays = new Set(foodLogs.map((l) => formatDateKey(l.date)).filter(Boolean));
    const wkDays = new Set(workoutLogs.map((l) => formatDateKey(l.date)).filter(Boolean));
    return {
      nutrition: Math.round((foodDays.size / days) * 100),
      training: Math.round((wkDays.size / days) * 100),
    };
  }, [foodLogs, workoutLogs, days]);

  // ── AI interpretation — engine-driven when available, rules-based fallback ──
  const insights = useMemo(() => {
    // Use engine's progress section if available
    if (ai.progress?.headline) {
      const lines = [ai.progress.headline];
      if (ai.progress.interpretation) lines.push(ai.progress.interpretation);
      if (ai.progress.action) lines.push(ai.progress.action);
      return lines;
    }
    // Fallback to rules-based
    const lines = [];
    if (weightData.length >= 2) {
      const weekRate = weightSlope * 7;
      if (weekRate < -0.1) lines.push(t('progress.fallback_weight_down').replace('{rate}', Math.abs(weekRate).toFixed(2)));
      else if (weekRate > 0.1) lines.push(t('progress.fallback_weight_up').replace('{rate}', weekRate.toFixed(2)));
      else lines.push(t('progress.fallback_weight_stable'));
    }
    if (adherence.nutrition >= 80) lines.push(t('progress.fallback_nutrition_strong').replace('{pct}', adherence.nutrition));
    else if (adherence.nutrition < 50) lines.push(t('progress.fallback_nutrition_low').replace('{pct}', adherence.nutrition));
    if (adherence.training >= 70) lines.push(t('progress.fallback_training_solid').replace('{pct}', adherence.training));
    else if (adherence.training < 40) lines.push(t('progress.fallback_training_low').replace('{pct}', adherence.training));
    return lines.slice(0, 3);
  }, [ai.progress, weightData, weightSlope, adherence]);

  // ── Render ──────────────────────────────────────────────────────────────────
  const hasAnyData = weightData.length > 0 || workoutLogs.length > 0 || foodLogs.length > 0 || photos.length > 0;
  
  return (
    <div className="min-h-full bg-[hsl(var(--bg))] atlas-page-enter">
      <div className="mx-auto max-w-lg px-4 pt-6 pb-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-bold tracking-[-0.03em] text-[hsl(var(--fg))]">{t('progress.page_title')}</h1>
          <RangeTabs selected={range} onChange={setRange} />
        </div>

        {/* 1 — Stats Header */}
        <ProgressStatsHeader 
          measurements={measurements}
          workoutLogs={workoutLogs}
          foodLogs={foodLogs}
          photos={photos}
          days={days}
          t={t}
        />

        {/* 2 — Empty State (if no data) */}
        {!hasAnyData && (
          <ProgressEmptyState 
            hasNoData={!hasAnyData}
            t={t}
          />
        )}

        {/* 3 — Goal Celebration */}
        <GoalCelebrationCard 
          weightData={weightData}
          adherence={adherence}
          t={t}
        />

        {/* 4 — Next Action Guidance */}
        <NextActionCard 
          weightData={weightData}
          workoutLogs={workoutLogs}
          foodLogs={foodLogs}
          photos={photos}
          t={t}
        />

        {/* 5 — Weight Trend (only if has data) */}
        {weightData.length > 0 && (
          <ChartCard className="py-5">
            <ChartHeader label={t('progress.chart_weight')} value={weightData.at(-1)?.value ?? null} unit="kg" badge={null} sublabel={null}
            />
            <div className="mt-4">
              <TrendLineChart data={weightData} dataKey="value" gradientId="wg" color="hsl(var(--brand))" days={days} unit="kg" showRegression={true} emptyLabel={t('progress.need_data_points')} emptyCta={t('progress.log_measurement')} />
            </div>
          </ChartCard>
        )}

        {/* 6 — Body Fat Trend */}
        {bfData.length > 0 && (
          <ChartCard className="py-5">
            <ChartHeader label={t('progress.chart_body_fat')} value={bfData.at(-1)?.value ?? null} unit="%" badge={null} sublabel={null}
            />
            <div className="mt-4">
              <TrendLineChart data={bfData} dataKey="value" gradientId="bf" color="hsl(var(--warn))" days={days} unit="%" showRegression={false} emptyLabel={t('progress.need_data_points')} emptyCta={t('progress.log_measurement')} />
            </div>
          </ChartCard>
        )}

        {/* 7 — Calories vs Target */}
        {foodLogs.length > 0 && (
          <ChartCard className="py-5">
            <ChartHeader label={t('progress.chart_calories')} value={calorieData.filter((d) => d.calories != null).at(-1)?.calories ?? null} unit="kcal" badge={null} sublabel={kcalTarget > 0 ? t('progress.target_label').replace('{value}', kcalTarget).replace('{unit}', 'kcal') : null}
            />
            <div className="mt-4">
              <TargetBarChart data={calorieData} dataKey="calories" targetValue={kcalTarget} color="hsl(var(--brand))" days={days} unit="kcal" emptyLabel={t('progress.no_data_period')} emptyCta={t('progress.start_logging')} noDataLabel={t('progress.no_data_tooltip')} />
            </div>
          </ChartCard>
        )}

        {/* 8 — Protein vs Target */}
        {foodLogs.length > 0 && (
          <ChartCard className="py-5">
            <ChartHeader label={t('progress.chart_protein')} value={proteinData.filter((d) => d.protein != null).at(-1)?.protein ?? null} unit="g" badge={null} sublabel={proteinTarget > 0 ? t('progress.target_label').replace('{value}', proteinTarget).replace('{unit}', 'g') : null}
            />
            <div className="mt-4">
              <TargetBarChart data={proteinData} dataKey="protein" targetValue={proteinTarget} color="hsl(var(--ok))" days={days} unit="g" emptyLabel={t('progress.no_data_period')} emptyCta={t('progress.start_logging')} noDataLabel={t('progress.no_data_tooltip')} />
            </div>
          </ChartCard>
        )}

        {/* 9 — Workout Trend */}
        {workoutWeekData.length > 0 && (
          <ChartCard className="py-5">
            <ChartHeader label={t('progress.chart_workouts_week')} value={null} unit="" badge={null} sublabel={null}
            />
            <div className="mt-4">
              <ResponsiveContainer width="100%" height={90}>
                <BarChart data={workoutWeekData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                  <XAxis dataKey="label" tick={{ fontSize: 9, fill: 'hsl(var(--fg-3))' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--fg-3))' }} tickLine={false} axisLine={false} width={28} tickCount={3} />
                  <Tooltip content={<Tip unit="sessions" fmt={(v) => v != null ? `${Math.round(v)} sessions` : 'No data'} />} />
                  <Bar dataKey="count" fill="hsl(var(--ok))" fillOpacity={0.75} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        )}

        {/* 10 — Adherence */}
        {hasAnyData && (
          <ChartCard className="py-5">
            <ChartHeader label={t('progress.chart_adherence')} value={null} unit="" badge={null} sublabel={null}
            />
            <div className="mt-4 grid grid-cols-2 gap-4">
              {[
                { label: t('progress.chart_adherence_nutrition'), pct: adherence.nutrition, color: 'hsl(var(--brand))' },
                { label: t('progress.chart_adherence_training'), pct: adherence.training, color: 'hsl(var(--ok))' },
              ].map(({ label, pct, color }) => (
                <div key={label} className="rounded-[14px] bg-[hsl(var(--fill)/0.4)] px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">{label}</p>
                  <p className="mt-2 text-[1.75rem] font-bold tracking-[-0.04em] text-[hsl(var(--fg))]">{pct}%</p>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[hsl(var(--fill)/0.8)]">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        )}

        {/* 11 — Photos Timeline */}
        {photos.length > 0 && (
          <ChartCard className="py-5">
            <ChartHeader label={t('progress.chart_progress_photos')} value={null} unit="" badge={null} sublabel={null}
            />
            <div className="mt-4 flex gap-3 overflow-x-auto pb-1 scrollbar-none">
              {photos.slice(0, 6).map((p) => (
                <div key={p.id} className="w-16 h-20 rounded-[10px] bg-[hsl(var(--fill)/0.6)] shrink-0 overflow-hidden">
                  {p.url && <img src={p.url} alt="" className="w-full h-full object-cover" />}
                </div>
              ))}
            </div>
            <Link to={ROUTES.progressPhotos} className="mt-4 flex items-center gap-1 text-[12px] font-semibold text-[hsl(var(--brand))]">
              {t('progress.view_all_photos')} <ArrowRight className="w-3 h-3" />
            </Link>
          </ChartCard>
        )}

        {/* 12 — AI Interpretation */}
        {insights.length > 0 && (
          <div className="rounded-[18px] border border-[hsl(var(--brand-ai)/0.18)] overflow-hidden"
               style={{ background: 'radial-gradient(ellipse at top right, hsl(var(--brand-ai) / 0.07) 0%, transparent 55%), hsl(var(--card))' }}>
            <div className="h-[2px] bg-gradient-to-r from-[hsl(var(--brand-ai)/0.7)] via-[hsl(var(--brand-ai)/0.3)] to-transparent" />
            <div className="px-5 py-5 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[hsl(var(--brand-ai))]" strokeWidth={2} />
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[hsl(var(--brand-ai))]">{t('progress.ai_interpretation')}</p>
              </div>
              {insights.map((line, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-1 h-1 rounded-full bg-[hsl(var(--brand-ai))] mt-2 shrink-0" />
                  <p className="text-[13px] leading-relaxed text-[hsl(var(--fg))]">{line}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 13 — Quick links */}
        <div className="flex gap-3">
          <Link to={ROUTES.labExams}
            className="flex-1 flex items-center justify-center gap-2 rounded-[14px] border border-[hsl(var(--border)/0.5)] bg-[hsl(var(--fill)/0.4)] py-3 text-[12px] font-semibold text-[hsl(var(--fg-2))]">
            <FlaskConical className="w-3.5 h-3.5" /> {t('progress.lab_results_link')} <ArrowRight className="w-3 h-3" />
          </Link>
          <Link to={ROUTES.progressPhotos}
            className="flex-1 flex items-center justify-center gap-2 rounded-[14px] border border-[hsl(var(--border)/0.5)] bg-[hsl(var(--fill)/0.4)] py-3 text-[12px] font-semibold text-[hsl(var(--fg-2))]">
            <Camera className="w-3.5 h-3.5" /> {t('progress.photos_link')} <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function Progress({ embedded = false }) {
  const t = useT();
  if (embedded) {
    return <ProgressContent />;
  }
  return (
    <SafePageBoundary title={t('progress.page_title')} subtitle={t('progress.page_subtitle')} fallbackDescription={t('progress.safe_boundary_fallback')}>
      <ProgressContent />
    </SafePageBoundary>
  );
}
