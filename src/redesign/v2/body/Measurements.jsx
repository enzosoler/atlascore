/**
 * Measurements — /app/body/measurements
 *
 * Circumference tracking. Users log waist, hips, chest, biceps, thighs,
 * calves, neck, shoulders. Grid of 8 body parts, each with icon + label +
 * current value + delta vs last entry.
 *
 * TRUST RULE: never invents measurements. `previous` is the last real log
 * (null if nothing logged yet). Delta is only shown when previous exists.
 *
 * MVP persistence: local useState in the route wrapper. TODO (backend):
 * create a Supabase table `body_measurements`:
 *   id uuid PK
 *   user_id uuid FK
 *   measured_at timestamptz default now()
 *   unit text check (unit in ('cm','in'))
 *   waist numeric, hips numeric, chest numeric,
 *   left_bicep numeric, right_bicep numeric,
 *   left_thigh numeric, right_thigh numeric,
 *   left_calf numeric, right_calf numeric,
 *   neck numeric, shoulders numeric
 * (All numeric fields nullable — a log may only update a subset.)
 */
import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  SafeScreen,
  Glass,
  LiquidButton,
  SpringReveal,
} from '../lib/glass';
import {
  ChevronLeftIcon,
  WaistIcon,
  HipsIcon,
  ChestIcon,
  ArmsIcon,
  LegsIcon,
  CalvesIcon,
  NeckIcon,
  ShouldersIcon,
  RulerIcon,
} from '../lib/icons';

/** Canonical list — key + label + icon + placeholder range. */
const PARTS = [
  { key: 'waist',     label: 'Waist',     icon: WaistIcon,     rangeCm: [60, 110], rangeIn: [24, 44] },
  { key: 'hips',      label: 'Hips',      icon: HipsIcon,      rangeCm: [75, 120], rangeIn: [30, 48] },
  { key: 'chest',     label: 'Chest',     icon: ChestIcon,     rangeCm: [80, 130], rangeIn: [32, 52] },
  { key: 'biceps',    label: 'Biceps',    icon: ArmsIcon,      rangeCm: [25, 50],  rangeIn: [10, 20] },
  { key: 'thighs',    label: 'Thighs',    icon: LegsIcon,      rangeCm: [45, 80],  rangeIn: [18, 32] },
  { key: 'calves',    label: 'Calves',    icon: CalvesIcon,    rangeCm: [30, 50],  rangeIn: [12, 20] },
  { key: 'neck',      label: 'Neck',      icon: NeckIcon,      rangeCm: [32, 48],  rangeIn: [13, 19] },
  { key: 'shoulders', label: 'Shoulders', icon: ShouldersIcon, rangeCm: [95, 140], rangeIn: [38, 56] },
];

/**
 * Measurements — the presentational screen.
 *
 * Props:
 *  - current: { [key]: number } | null — the values currently on screen
 *  - previous: { [key]: number } | null — the previous saved log (for deltas)
 *  - defaultUnit: 'cm' | 'in'
 *  - onBack, onSave
 */
export default function Measurements({
  current = null,
  previous = null,
  defaultUnit = 'cm',
  onBack,
  onSave,
}) {
  const [unit, setUnit] = useState(defaultUnit);
  const [values, setValues] = useState(() => ({ ...(current || {}) }));

  const hasAny = Object.values(values).some((v) => v != null && v !== '');
  const hasPrior = previous && Object.values(previous).some((v) => v != null);

  const setVal = (k, v) => {
    const cleaned = String(v).replace(/[^\d.,]/g, '').replace(',', '.');
    setValues((p) => ({ ...p, [k]: cleaned }));
  };

  const handleSave = () => {
    // Coerce strings to numbers, drop empties.
    const payload = Object.fromEntries(
      Object.entries(values)
        .filter(([, v]) => v !== '' && v != null)
        .map(([k, v]) => [k, Number(v)])
        .filter(([, v]) => Number.isFinite(v) && v > 0),
    );
    onSave?.({ values: payload, unit, at: new Date().toISOString() });
    toast.success('Measurements saved');
  };

  return (
    <SafeScreen paddingX={20} style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 100px)' }}>
      {/* Back */}
      <button
        type="button"
        onClick={onBack}
        aria-label="Back"
        style={{
          position: 'fixed',
          top: 'calc(env(safe-area-inset-top) + 14px)',
          left: 'max(16px, env(safe-area-inset-left))',
          zIndex: 45,
          width: 36, height: 36, borderRadius: 9999,
          background: 'rgba(10,14,20,0.55)',
          backdropFilter: 'blur(18px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(18px) saturate(1.4)',
          border: '1px solid rgba(255,255,255,0.10)',
          color: 'hsl(var(--rd-fg-primary))',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
        }}
      >
        <ChevronLeftIcon size={18} />
      </button>

      <div style={{ paddingTop: 'calc(env(safe-area-inset-top) + 72px)', maxWidth: 560, margin: '0 auto' }}>
        {/* Hero */}
        <SpringReveal delay={20}>
          <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700, marginBottom: 6 }}>
            Body
          </div>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Measurements
          </h1>
          <div
            style={{
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: 10,
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              color: 'hsl(var(--rd-accent))',
              marginTop: 6,
            }}
          >
            Used to track physique trajectory
          </div>
          <p style={{ fontSize: 14, color: 'hsl(var(--rd-fg-muted))', marginTop: 8, marginBottom: 0, lineHeight: 1.45 }}>
            Track girth in {unit === 'cm' ? 'cm (or inches via settings)' : 'inches (or cm via settings)'}.
          </p>
        </SpringReveal>

        {/* Unit toggle */}
        <SpringReveal delay={60}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              padding: 4,
              borderRadius: 9999,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              marginTop: 20,
            }}
          >
            {['cm', 'in'].map((u) => {
              const active = unit === u;
              return (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUnit(u)}
                  style={{
                    height: 36, borderRadius: 9999, border: 'none',
                    background: active ? 'hsl(var(--rd-accent))' : 'transparent',
                    color: active ? 'hsl(var(--rd-fg-on-accent))' : 'hsl(var(--rd-fg-secondary))',
                    fontWeight: 600, fontSize: 13, letterSpacing: '-0.01em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'background 220ms, color 220ms',
                  }}
                >
                  {u}
                </button>
              );
            })}
          </div>
        </SpringReveal>

        {/* Empty-state hint (first log) */}
        {!hasPrior && (
          <SpringReveal delay={100}>
            <Glass tint="accent" radius="lg" style={{ padding: 14, marginTop: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  aria-hidden
                  style={{
                    width: 32, height: 32, borderRadius: 10,
                    background: 'rgba(0,255,255,0.12)',
                    color: 'hsl(var(--rd-accent))',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <RulerIcon size={16} />
                </span>
                <div style={{ fontSize: 13, color: 'hsl(var(--rd-fg-secondary))', lineHeight: 1.4 }}>
                  Log your first measurements to start tracking. Same tape, same spot, once a week.
                </div>
              </div>
            </Glass>
          </SpringReveal>
        )}

        {/* Grid of 8 parts */}
        <SpringReveal delay={140}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 10,
              marginTop: 18,
            }}
          >
            {PARTS.map((p) => {
              const prev = previous?.[p.key] ?? null;
              const cur = values[p.key];
              const curNum = cur !== '' && cur != null ? Number(cur) : null;
              const delta = curNum != null && prev != null && Number.isFinite(curNum)
                ? curNum - prev
                : null;
              const placeholder = unit === 'cm' ? p.rangeCm[0] : p.rangeIn[0];
              const Icon = p.icon;
              return (
                <div
                  key={p.key}
                  style={{
                    borderRadius: 16,
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: 'rgba(255,255,255,0.03)',
                    padding: 12,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      aria-hidden
                      style={{
                        width: 28, height: 28, borderRadius: 8,
                        background: 'rgba(255,255,255,0.06)',
                        color: 'hsl(var(--rd-fg-secondary))',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={16} />
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.005em', color: 'hsl(var(--rd-fg-primary))' }}>
                      {p.label}
                    </span>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={cur ?? ''}
                      onChange={(e) => setVal(p.key, e.target.value)}
                      placeholder={String(placeholder)}
                      aria-label={`${p.label} in ${unit}`}
                      style={{
                        width: '100%',
                        height: 44,
                        borderRadius: 12,
                        background: 'rgba(0,0,0,0.25)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: 'hsl(var(--rd-fg-primary))',
                        padding: '0 36px 0 12px',
                        fontSize: 17, fontWeight: 700,
                        fontVariantNumeric: 'tabular-nums',
                        letterSpacing: '-0.01em',
                        outline: 'none',
                      }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        right: 12, top: '50%', transform: 'translateY(-50%)',
                        fontSize: 12, color: 'hsl(var(--rd-fg-muted))', fontWeight: 600,
                      }}
                    >
                      {unit}
                    </span>
                  </div>
                  {delta != null && Math.abs(delta) < 50 && (
                    <div
                      style={{
                        fontSize: 11,
                        fontVariantNumeric: 'tabular-nums',
                        color: delta === 0
                          ? 'hsl(var(--rd-fg-muted))'
                          : delta < 0 ? '#34D399' : '#FBBF24',
                        fontWeight: 600,
                      }}
                    >
                      {delta > 0 ? '+' : ''}{delta.toFixed(1)} {unit} since last
                    </div>
                  )}
                  {delta == null && prev != null && (
                    <div style={{ fontSize: 11, color: 'hsl(var(--rd-fg-muted))' }}>
                      Last: <span style={{ fontVariantNumeric: 'tabular-nums', color: 'hsl(var(--rd-fg-secondary))' }}>{Number(prev).toFixed(1)} {unit}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </SpringReveal>
      </div>

      {/* Save CTA sticky */}
      <div
        style={{
          position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 40,
          paddingBottom: 'env(safe-area-inset-bottom)',
          backgroundImage: 'linear-gradient(180deg, rgba(5,7,10,0) 0%, rgba(5,7,10,0.85) 30%, rgba(5,7,10,0.98) 100%)',
          backdropFilter: 'blur(22px) saturate(1.6)',
          WebkitBackdropFilter: 'blur(22px) saturate(1.6)',
        }}
      >
        <div style={{ padding: '12px max(16px, env(safe-area-inset-left))', maxWidth: 560, margin: '0 auto' }}>
          <LiquidButton intent="primary" size="xl" block disabled={!hasAny} onClick={handleSave}>
            Save measurements
          </LiquidButton>
        </div>
      </div>
    </SafeScreen>
  );
}

export { Measurements };

/* ─── Route wrapper ────────────────────────────────────────────────────────
   MVP: keeps the latest saved log in useState. When the user returns to the
   screen in the same session, we preload the values + use the prior log as
   the "previous" comparison.
   TODO: replace with bodyMeasurementsService.list() + .save() backed by
   Supabase `body_measurements`. */
export function MeasurementsRoute() {
  const [log, setLog] = useState(null); // { values, unit, at }
  const [prevLog, setPrevLog] = useState(null);

  return (
    <Measurements
      current={log?.values || null}
      previous={prevLog?.values || null}
      defaultUnit={log?.unit || prevLog?.unit || 'cm'}
      onBack={() => window.history.back()}
      onSave={(entry) => {
        // TODO: persist to bodyMeasurementsService.save(entry)
        setPrevLog(log);
        setLog(entry);
      }}
    />
  );
}
