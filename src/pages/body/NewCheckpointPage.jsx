import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Check, Loader2, ChevronDown, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { MobileFormLayout } from '@/components/app/MobileFormLayout';
import { useAuth } from '@/lib/AuthContext';
import { createMeasurement, listMeasurements } from '@/services/bodyProgressService';
import { getMeasurementFieldValue } from '@/lib/measurementModel';
import { getToday } from '@/lib/atlas-theme';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ── Happy Scale-inspired weight entry ────────────────────────────────────────
//
// Top:    tiny sparkline/trend chip showing direction
// Middle: large centered weight input (dominant field)
// Below:  optional body-comp fields collapsed by default
// Bottom: save CTA with fast single-entry confirmation

const FIELD_LABEL = 'block text-[11px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))] mb-1.5';
const INPUT = 'w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--fill)/0.3)] px-4 py-3 text-sm text-[hsl(var(--fg))] placeholder:text-[hsl(var(--fg-3))] focus:outline-none focus:border-[hsl(var(--brand))] transition-colors';

const EXTRA_FIELDS = [
  { key: 'body_fat_percent', label: 'Body Fat',    unit: '%',  step: '0.1', placeholder: '0.0' },
  { key: 'muscle_mass',      label: 'Muscle Mass', unit: 'kg', step: '0.1', placeholder: '0.0' },
  { key: 'waist',            label: 'Waist',       unit: 'cm', step: '0.5', placeholder: '0.0' },
  { key: 'hips',             label: 'Hips',        unit: 'cm', step: '0.5', placeholder: '0.0' },
  { key: 'chest',            label: 'Chest',       unit: 'cm', step: '0.5', placeholder: '0.0' },
];

// ── Tiny sparkline ───────────────────────────────────────────────────────────

function MiniSparkline({ data, color = 'hsl(var(--brand))' }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const h = 28;
  const w = 72;
  const step = w / (data.length - 1);

  const points = data.map((v, i) => `${i * step},${h - ((v - min) / range) * h}`).join(' ');

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── Trend chip ───────────────────────────────────────────────────────────────

function TrendChip({ current, previous, recentValues }) {
  if (current == null || previous == null) return null;
  const delta = current - previous;
  const absDelta = Math.abs(delta);
  if (absDelta < 0.05) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border)/0.6)] bg-[hsl(var(--fill)/0.5)] px-3 py-1.5">
        <Minus className="h-3 w-3 text-[hsl(var(--fg-3))]" strokeWidth={2} />
        <MiniSparkline data={recentValues} />
        <span className="text-[12px] font-medium text-[hsl(var(--fg-2))]">Holding steady</span>
      </div>
    );
  }
  const losing = delta < 0;
  return (
    <div className={cn(
      'inline-flex items-center gap-2 rounded-full border px-3 py-1.5',
      losing
        ? 'border-[hsl(var(--ok)/0.25)] bg-[hsl(var(--ok)/0.08)]'
        : 'border-[hsl(var(--warn)/0.25)] bg-[hsl(var(--warn)/0.08)]'
    )}>
      {losing
        ? <TrendingDown className="h-3 w-3 text-[hsl(var(--ok))]" strokeWidth={2} />
        : <TrendingUp className="h-3 w-3 text-[hsl(var(--warn))]" strokeWidth={2} />}
      <MiniSparkline data={recentValues} color={losing ? 'hsl(var(--ok))' : 'hsl(var(--warn))'} />
      <span className={cn('text-[12px] font-semibold', losing ? 'text-[hsl(var(--ok))]' : 'text-[hsl(var(--warn))]')}>
        {delta > 0 ? '+' : ''}{delta.toFixed(1)} kg
      </span>
    </div>
  );
}

// ── Saved confirmation overlay ───────────────────────────────────────────────

function SavedConfirmation({ visible }) {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="flex flex-col items-center gap-3 rounded-3xl bg-[hsl(var(--card))] px-10 py-8 shadow-xl animate-in zoom-in-95 duration-300">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--ok)/0.15)]">
          <Check className="h-7 w-7 text-[hsl(var(--ok))]" strokeWidth={2.5} />
        </div>
        <p className="text-[15px] font-semibold text-[hsl(var(--fg))]">Saved</p>
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function NewCheckpointPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const weightInputRef = useRef(null);

  const [date, setDate] = useState(getToday());
  const [weight, setWeight] = useState('');
  const [values, setValues] = useState({});
  const [showExtra, setShowExtra] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  // Fetch recent measurements for trend context
  const { data: recentMeasurements = [] } = useQuery({
    queryKey: ['measurements', user?.id],
    queryFn: () => listMeasurements(user.id, 30),
    enabled: !!user?.id,
    staleTime: 120_000,
  });

  const trendData = useMemo(() => {
    const sorted = [...recentMeasurements]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((m) => getMeasurementFieldValue(m, 'weight'))
      .filter((v) => v != null);
    const recent = sorted.slice(-10);
    const latestWeight = sorted[sorted.length - 1] ?? null;
    const previousWeight = sorted[sorted.length - 2] ?? null;
    return { recentValues: recent, latestWeight, previousWeight };
  }, [recentMeasurements]);

  // Auto-focus the weight input
  useEffect(() => {
    const timer = setTimeout(() => weightInputRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, []);

  const { mutate: save, isPending } = useMutation({
    mutationFn: () => {
      const payload = { date };
      if (weight !== '') payload.weight = parseFloat(weight);
      for (const { key } of EXTRA_FIELDS) {
        if (values[key] !== undefined && values[key] !== '') {
          payload[key] = parseFloat(values[key]);
        }
      }
      return createMeasurement(user.id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['measurements'] });
      setShowSaved(true);
      setTimeout(() => {
        toast.success('Checkpoint saved');
        navigate(-1);
      }, 700);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to save');
    },
  });

  const handleSave = () => {
    const hasWeight = weight !== '';
    const hasOther = EXTRA_FIELDS.some(({ key }) => values[key] !== undefined && values[key] !== '');
    if (!hasWeight && !hasOther) {
      toast.error('Enter at least your weight');
      weightInputRef.current?.focus();
      return;
    }
    save();
  };

  const setValue = (key, raw) =>
    setValues((prev) => ({ ...prev, [key]: raw }));

  const header = (
    <div
      className="flex items-center justify-between px-4 py-3 border-b border-[hsl(var(--border))]"
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}
    >
      <button
        onClick={() => navigate(-1)}
        className="flex h-9 w-9 items-center justify-center rounded-xl text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--fill))] transition-colors"
        aria-label="Go back"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>

      <h1 className="text-base font-semibold text-[hsl(var(--fg))]">Log Weight</h1>

      <div className="w-9" /> {/* Spacer for centering */}
    </div>
  );

  const footer = (
    <button
      onClick={handleSave}
      disabled={isPending}
      className={cn(
        'w-full flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-[15px] font-semibold text-white transition-all',
        isPending
          ? 'bg-[hsl(var(--brand)/0.6)] cursor-wait'
          : 'bg-[hsl(var(--brand))] active:scale-[0.98] hover:brightness-110'
      )}
    >
      {isPending ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Check className="h-5 w-5" strokeWidth={2} />
      )}
      {isPending ? 'Saving...' : 'Save Entry'}
    </button>
  );

  return (
    <MobileFormLayout header={header} footer={footer}>
      <div className="flex flex-col items-center px-4 pt-6 pb-4">
        {/* Date selector — compact */}
        <div className="mb-6">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-full border border-[hsl(var(--border)/0.6)] bg-[hsl(var(--fill)/0.3)] px-4 py-1.5 text-[13px] font-medium text-[hsl(var(--fg))] focus:outline-none focus:border-[hsl(var(--brand))]"
          />
        </div>

        {/* Trend chip with sparkline */}
        <div className="mb-8">
          <TrendChip
            current={trendData.latestWeight}
            previous={trendData.previousWeight}
            recentValues={trendData.recentValues}
          />
          {trendData.recentValues.length === 0 && (
            <p className="text-[12px] text-[hsl(var(--fg-3))] text-center">Your first entry — start tracking</p>
          )}
        </div>

        {/* Primary weight input — large, centered, dominant */}
        <div className="w-full max-w-xs flex flex-col items-center">
          <label className={FIELD_LABEL}>Weight</label>
          <div className="relative w-full mt-1">
            <input
              ref={weightInputRef}
              type="number"
              inputMode="decimal"
              step="0.1"
              min="0"
              placeholder="0.0"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full rounded-2xl border-2 border-[hsl(var(--border))] bg-[hsl(var(--card))] px-6 py-5 text-center text-[2.5rem] font-bold tracking-[-0.06em] text-[hsl(var(--fg))] placeholder:text-[hsl(var(--fg-3)/0.4)] focus:outline-none focus:border-[hsl(var(--brand))] transition-colors"
            />
            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[14px] font-semibold text-[hsl(var(--fg-3))]">kg</span>
          </div>
          {trendData.latestWeight != null && weight !== '' && (
            <p className="mt-2 text-[12px] text-[hsl(var(--fg-3))]">
              {(() => {
                const diff = parseFloat(weight) - trendData.latestWeight;
                if (Math.abs(diff) < 0.05) return 'Same as last entry';
                return `${diff > 0 ? '+' : ''}${diff.toFixed(1)} kg vs last`;
              })()}
            </p>
          )}
        </div>

        {/* Collapsible extra fields */}
        <div className="w-full mt-8">
          <button
            type="button"
            onClick={() => setShowExtra((v) => !v)}
            className="flex items-center gap-2 mx-auto text-[13px] font-medium text-[hsl(var(--fg-2))] hover:text-[hsl(var(--fg))] transition-colors"
          >
            <ChevronDown className={cn('h-4 w-4 transition-transform', showExtra && 'rotate-180')} strokeWidth={2} />
            {showExtra ? 'Hide body composition' : 'Add body composition'}
          </button>

          {showExtra && (
            <div className="mt-4 grid grid-cols-2 gap-3 animate-in slide-in-from-top-2 duration-200">
              {EXTRA_FIELDS.map(({ key, label, unit, step, placeholder }) => (
                <div key={key}>
                  <label className={FIELD_LABEL}>
                    {label}
                    <span className="ml-1 text-[10px] font-medium tracking-normal text-[hsl(var(--fg-3))]">({unit})</span>
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step={step}
                    min="0"
                    placeholder={placeholder}
                    value={values[key] ?? ''}
                    onChange={(e) => setValue(key, e.target.value)}
                    className={INPUT}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <SavedConfirmation visible={showSaved} />
    </MobileFormLayout>
  );
}
