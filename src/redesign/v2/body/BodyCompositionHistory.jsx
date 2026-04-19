/**
 * BodyCompositionHistory — /app/body/composition
 *
 * Weight + body-fat% history chart + stats + entry list.
 * Period selector chips (7d / 30d / 90d / 1y) filter the visible data.
 *
 * TRUST RULE: never fabricates weights. If `history` is empty, renders an
 * honest empty state with a CTA to log the first weight.
 *
 * TODO (backend): Supabase table `body_weight_log`:
 *   id uuid PK
 *   user_id uuid FK
 *   measured_at timestamptz default now()
 *   weight_kg numeric not null
 *   body_fat_pct numeric null
 *   source text null  -- 'manual' | 'withings' | 'apple_health' | ...
 *   note text null
 *   created_at timestamptz default now()
 * Plus an index on (user_id, measured_at desc).
 */
import React, { useMemo, useState } from 'react';
import {
  SafeScreen,
  Glass,
  LiquidButton,
  SpringReveal,
} from '../lib/glass';
import {
  ChevronLeftIcon,
  ScaleIcon,
  TrendUpIcon,
  TrendDownIcon,
} from '../lib/icons';

const PERIODS = [
  { key: '7d',  label: '7d',  days: 7 },
  { key: '30d', label: '30d', days: 30 },
  { key: '90d', label: '90d', days: 90 },
  { key: '1y',  label: '1y',  days: 365 },
];

/**
 * BodyCompositionHistory — presentational.
 *
 * Props:
 *  - history: Array<{ id, at, weight, bodyFatPct? }>  in any order; we sort.
 *  - weightUnit: 'kg' | 'lb'
 *  - onBack, onLogWeight, onOpenEntry
 */
export default function BodyCompositionHistory({
  history = [],
  weightUnit = 'kg',
  onBack,
  onLogWeight,
  onOpenEntry,
}) {
  const [period, setPeriod] = useState('90d');

  // Sort desc (newest first), then filter by period.
  const sorted = useMemo(() => {
    const copy = [...history];
    copy.sort((a, b) => new Date(b.at) - new Date(a.at));
    return copy;
  }, [history]);

  const filtered = useMemo(() => {
    const cutoff = Date.now() - PERIODS.find((p) => p.key === period).days * 86400000;
    return sorted.filter((e) => new Date(e.at).getTime() >= cutoff);
  }, [sorted, period]);

  const hasHistory = sorted.length > 0;
  const current = sorted[0] || null;
  const latestBf = sorted.find((e) => e.bodyFatPct != null) || null;

  // Weekly delta — compare latest to the newest log 7+ days older.
  const weekDelta = useMemo(() => {
    if (!current) return null;
    const cutoff = new Date(current.at).getTime() - 7 * 86400000;
    const older = sorted.find((e) => new Date(e.at).getTime() <= cutoff);
    return older ? current.weight - older.weight : null;
  }, [sorted, current]);

  // BF delta — same idea but with body fat.
  const bfWeekDelta = useMemo(() => {
    if (!latestBf) return null;
    const cutoff = new Date(latestBf.at).getTime() - 7 * 86400000;
    const older = sorted.find((e) => e.bodyFatPct != null && new Date(e.at).getTime() <= cutoff);
    return older ? latestBf.bodyFatPct - older.bodyFatPct : null;
  }, [sorted, latestBf]);

  // Stats.
  const totalChange = useMemo(() => {
    if (filtered.length < 2) return null;
    const first = filtered[filtered.length - 1].weight;
    const last = filtered[0].weight;
    return last - first;
  }, [filtered]);

  const weeklyAvg = useMemo(() => {
    if (filtered.length < 2) return null;
    const span = (new Date(filtered[0].at) - new Date(filtered[filtered.length - 1].at)) / 86400000;
    if (span <= 0) return null;
    return ((filtered[0].weight - filtered[filtered.length - 1].weight) / span) * 7;
  }, [filtered]);

  const bestStreak = useMemo(() => computeBestStreak(sorted), [sorted]);

  const lastLogLabel = current ? relativeDate(current.at) : '—';

  return (
    <SafeScreen hasTopBar paddingX={20}>
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

      <div style={{ maxWidth: 560, margin: '0 auto', paddingBottom: 40 }}>
        <SpringReveal delay={20}>
          <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700, marginBottom: 6 }}>
            Body · composition
          </div>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            History
          </h1>
        </SpringReveal>

        {!hasHistory ? (
          /* Empty state */
          <SpringReveal delay={80}>
            <Glass radius="xl" style={{ padding: 24, marginTop: 24, textAlign: 'center' }}>
              <span
                aria-hidden
                style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: 'rgba(0,255,255,0.10)',
                  color: 'hsl(var(--rd-accent))',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 12px',
                }}
              >
                <ScaleIcon size={22} />
              </span>
              <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em', marginBottom: 6 }}>
                Nothing logged yet
              </div>
              <div style={{ fontSize: 13, color: 'hsl(var(--rd-fg-muted))', lineHeight: 1.5, marginBottom: 16, maxWidth: 340, marginInline: 'auto' }}>
                Your composition history will appear here once you log your weight.
              </div>
              <LiquidButton intent="primary" size="md" onClick={onLogWeight}>
                Log first weight
              </LiquidButton>
            </Glass>
          </SpringReveal>
        ) : (
          <>
            {/* Hero — current weight + deltas */}
            <SpringReveal delay={60}>
              <div style={{ marginTop: 20, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700, marginBottom: 4 }}>
                    Current
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontSize: 42, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                      {current.weight.toFixed(1)}
                    </span>
                    <span style={{ fontSize: 14, color: 'hsl(var(--rd-fg-muted))', fontWeight: 600 }}>{weightUnit}</span>
                  </div>
                  {weekDelta != null && (
                    <DeltaChip delta={weekDelta} unit={weightUnit} suffix="vs last week" />
                  )}
                </div>
                {latestBf && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700, marginBottom: 4 }}>
                      Body fat
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, justifyContent: 'flex-end' }}>
                      <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                        {latestBf.bodyFatPct.toFixed(1)}
                      </span>
                      <span style={{ fontSize: 13, color: 'hsl(var(--rd-fg-muted))', fontWeight: 600 }}>%</span>
                    </div>
                    {bfWeekDelta != null && (
                      <DeltaChip delta={bfWeekDelta} unit="%" suffix="vs last week" alignRight />
                    )}
                  </div>
                )}
              </div>
            </SpringReveal>

            {/* Period selector */}
            <SpringReveal delay={100}>
              <div
                style={{
                  marginTop: 20,
                  display: 'grid',
                  gridTemplateColumns: `repeat(${PERIODS.length}, 1fr)`,
                  padding: 4,
                  borderRadius: 9999,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {PERIODS.map((p) => {
                  const active = period === p.key;
                  return (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => setPeriod(p.key)}
                      style={{
                        height: 34, borderRadius: 9999, border: 'none',
                        background: active ? 'hsl(var(--rd-accent))' : 'transparent',
                        color: active ? 'hsl(var(--rd-fg-on-accent))' : 'hsl(var(--rd-fg-secondary))',
                        fontSize: 13, fontWeight: 600, letterSpacing: '-0.005em',
                        cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                        transition: 'background 200ms, color 200ms',
                      }}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </SpringReveal>

            {/* Chart */}
            <SpringReveal delay={140}>
              <div style={{ marginTop: 16 }}>
                <HistoryChart data={filtered} weightUnit={weightUnit} />
              </div>
            </SpringReveal>

            {/* Stats grid */}
            <SpringReveal delay={180}>
              <div
                style={{
                  marginTop: 20,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 10,
                }}
              >
                <StatCell
                  label="Total change"
                  value={totalChange != null ? `${totalChange > 0 ? '+' : ''}${totalChange.toFixed(1)} ${weightUnit}` : '—'}
                  tone={totalChange == null ? 'muted' : totalChange < 0 ? 'good' : totalChange > 0 ? 'warn' : 'muted'}
                />
                <StatCell
                  label="Weekly avg"
                  value={weeklyAvg != null ? `${weeklyAvg > 0 ? '+' : ''}${weeklyAvg.toFixed(2)} ${weightUnit}` : '—'}
                />
                <StatCell
                  label="Best streak"
                  value={bestStreak > 0 ? `${bestStreak} day${bestStreak === 1 ? '' : 's'}` : '—'}
                />
                <StatCell label="Last log" value={lastLogLabel} />
              </div>
            </SpringReveal>

            {/* Entry list — last 10 */}
            <SpringReveal delay={220}>
              <div style={{ marginTop: 28 }}>
                <h2 style={{ margin: 0, marginBottom: 10, fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: 'hsl(var(--rd-fg-muted))' }}>
                  Recent · {Math.min(10, sorted.length)}
                </h2>
                <div
                  style={{
                    borderRadius: 16,
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: 'rgba(255,255,255,0.02)',
                    overflow: 'hidden',
                  }}
                >
                  {sorted.slice(0, 10).map((e, i) => (
                    <EntryRow
                      key={e.id || e.at}
                      entry={e}
                      weightUnit={weightUnit}
                      isLast={i === Math.min(10, sorted.length) - 1}
                      onClick={() => onOpenEntry?.(e.id ?? e.at)}
                    />
                  ))}
                </div>
              </div>
            </SpringReveal>

            {/* CTA — log new weight */}
            <div style={{ marginTop: 24 }}>
              <LiquidButton intent="neutral" size="lg" block onClick={onLogWeight}>
                Log new weight
              </LiquidButton>
            </div>
          </>
        )}
      </div>
    </SafeScreen>
  );
}

export { BodyCompositionHistory };

/* ─── Subcomponents ─────────────────────────────────────────────────────── */

function DeltaChip({ delta, unit, suffix, alignRight }) {
  const neutral = Math.abs(delta) < 0.05;
  const color = neutral ? 'hsl(var(--rd-fg-muted))' : delta < 0 ? '#34D399' : '#FBBF24';
  const Icon = neutral ? null : delta < 0 ? TrendDownIcon : TrendUpIcon;
  return (
    <div
      style={{
        marginTop: 6,
        fontSize: 12,
        color: 'hsl(var(--rd-fg-muted))',
        fontVariantNumeric: 'tabular-nums',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        justifyContent: alignRight ? 'flex-end' : 'flex-start',
      }}
    >
      <span style={{ color, display: 'inline-flex', alignItems: 'center', gap: 3, fontWeight: 700 }}>
        {Icon ? <Icon size={12} /> : null}
        {delta > 0 ? '+' : ''}{delta.toFixed(1)}{unit}
      </span>
      <span>{suffix}</span>
    </div>
  );
}

function StatCell({ label, value, tone = 'default' }) {
  const color = tone === 'good' ? '#34D399' : tone === 'warn' ? '#FBBF24' : 'hsl(var(--rd-fg-primary))';
  return (
    <div
      style={{
        padding: '14px 14px',
        borderRadius: 14,
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.03)',
      }}
    >
      <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700, marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', color }}>
        {value}
      </div>
    </div>
  );
}

function EntryRow({ entry, weightUnit, isLast, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 14px',
        background: 'transparent',
        border: 'none',
        borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.06)',
        color: 'hsl(var(--rd-fg-primary))',
        textAlign: 'left',
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.005em' }}>
          {formatDate(entry.at)}
        </span>
        <span style={{ fontSize: 11, color: 'hsl(var(--rd-fg-muted))' }}>
          {formatTime(entry.at)}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        {entry.bodyFatPct != null && (
          <span style={{ fontSize: 12, color: 'hsl(var(--rd-fg-muted))', fontVariantNumeric: 'tabular-nums' }}>
            {entry.bodyFatPct.toFixed(1)}%
          </span>
        )}
        <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums' }}>
          {entry.weight.toFixed(1)}
          <span style={{ fontSize: 11, color: 'hsl(var(--rd-fg-muted))', fontWeight: 500, marginLeft: 2 }}>{weightUnit}</span>
        </span>
      </div>
    </button>
  );
}

/* ─── History chart (inline SVG) ────────────────────────────────────────── */

function HistoryChart({ data, weightUnit }) {
  if (!data || data.length === 0) {
    return (
      <div
        style={{
          height: 180,
          borderRadius: 18,
          border: '1px dashed rgba(255,255,255,0.12)',
          background: 'rgba(255,255,255,0.02)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, color: 'hsl(var(--rd-fg-muted))',
          padding: 20,
          textAlign: 'center',
        }}
      >
        No entries in this period.
      </div>
    );
  }
  // Order ascending by date for drawing.
  const ordered = [...data].sort((a, b) => new Date(a.at) - new Date(b.at));
  const weights = ordered.map((e) => e.weight);
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const pad = (max - min) * 0.1 || 0.5;
  const yMin = min - pad;
  const yMax = max + pad;
  const range = yMax - yMin || 1;

  const tFirst = new Date(ordered[0].at).getTime();
  const tLast = new Date(ordered[ordered.length - 1].at).getTime();
  const tSpan = tLast - tFirst || 1;

  const points = ordered.map((e) => {
    const x = ((new Date(e.at).getTime() - tFirst) / tSpan) * 100;
    const y = 100 - ((e.weight - yMin) / range) * 100;
    return { x, y, e };
  });

  const linePath = `M ${points.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' L ')}`;
  const areaPath = `M 0,100 L ${points.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' L ')} L 100,100 Z`;

  return (
    <div
      style={{
        position: 'relative',
        height: 180,
        borderRadius: 18,
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'linear-gradient(180deg, rgba(0,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
        padding: '14px 14px 22px',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: 10, left: 14, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700 }}>
        {yMax.toFixed(1)} {weightUnit}
      </div>
      <div style={{ position: 'absolute', bottom: 6, left: 14, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700 }}>
        {yMin.toFixed(1)} {weightUnit}
      </div>
      <div style={{ position: 'absolute', top: 10, right: 14, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700 }}>
        {formatDate(ordered[ordered.length - 1].at)}
      </div>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ width: '100%', height: '100%' }}
        aria-hidden
      >
        <defs>
          <linearGradient id="compHistArea" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--rd-accent))" stopOpacity="0.35" />
            <stop offset="100%" stopColor="hsl(var(--rd-accent))" stopOpacity="0" />
          </linearGradient>
        </defs>
        {points.length >= 2 && <path d={areaPath} fill="url(#compHistArea)" />}
        {points.length >= 2 && (
          <path
            d={linePath}
            fill="none"
            stroke="hsl(var(--rd-accent))"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        )}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="1.4"
            fill="hsl(var(--rd-accent))"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
    </div>
  );
}

/* ─── Helpers ───────────────────────────────────────────────────────────── */

function computeBestStreak(entries) {
  if (!entries || entries.length < 2) return entries?.length || 0;
  // Sort ascending by day.
  const days = entries
    .map((e) => {
      const d = new Date(e.at);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })
    .sort((a, b) => a - b);
  let best = 1;
  let cur = 1;
  for (let i = 1; i < days.length; i += 1) {
    const diff = (days[i] - days[i - 1]) / 86400000;
    if (diff === 0) continue; // dedupe same-day
    if (diff === 1) {
      cur += 1;
      if (cur > best) best = cur;
    } else {
      cur = 1;
    }
  }
  return best;
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
function formatTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}
function relativeDate(iso) {
  if (!iso) return '—';
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (diff <= 0) return 'today';
  if (diff === 1) return 'yesterday';
  if (diff < 7) return `${diff}d ago`;
  if (diff < 30) return `${Math.floor(diff / 7)}w ago`;
  return formatDate(iso);
}

/* ─── Route wrapper ─────────────────────────────────────────────────────── */
/**
 * MVP: renders the empty state until the bodyProgressService is wired.
 * When `history` arrives, pass it in as an array of { id, at, weight, bodyFatPct? }.
 */
export function BodyCompositionHistoryRoute() {
  // TODO: const { data: history = [] } = useQuery(['body-weight-log'], fetchWeights);
  const history = [];

  return (
    <BodyCompositionHistory
      history={history}
      weightUnit="kg"
      onBack={() => window.history.back()}
      onLogWeight={() => {
        window.location.assign('/app/body/weight');
      }}
      onOpenEntry={() => {
        // Tapping an entry opens WeightEntry to edit. TODO: pass entry id.
        window.location.assign('/app/body/weight');
      }}
    />
  );
}
