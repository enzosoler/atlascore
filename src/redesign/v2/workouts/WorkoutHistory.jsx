/**
 * WorkoutHistory — /app/workouts/history.
 * Ref: Hevy history + Strong calendar + Strava training log.
 *
 * Chronological list of completed sessions, grouped by month. Each row:
 * date chip · name · duration · volume · PR count badge. Calendar heatmap
 * at top (last 12 weeks).
 */
import React, { useMemo } from 'react';
import { SafeScreen, Glass, SpringReveal } from '../lib/glass';
import { DumbbellIcon, TrophyIcon, TrendUpIcon } from '../lib/icons';

export default function WorkoutHistory({
  sessions = [],        // [{ id, name, at, duration, volume, exerciseCount, prCount }]
  heatmap = null,       // [84] booleans or intensity 0..3
  stats = null,         // { totalSessions, totalVolumeKg, avgPerWeek }
  onBack,
  onOpenSession,
}) {
  const grouped = useMemo(() => {
    const by = {};
    for (const s of sessions) {
      const d = new Date(s.at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!by[key]) by[key] = { label: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }), items: [] };
      by[key].items.push(s);
    }
    const keys = Object.keys(by).sort().reverse();
    return keys.map((k) => by[k]);
  }, [sessions]);

  return (
    <SafeScreen hasTopBar hasBottomNav paddingX={20}>
      <div style={{ maxWidth: 560, margin: '0 auto', paddingBottom: 40 }}>

        <SpringReveal delay={20}>
          <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))', fontWeight: 700 }}>
            Training
          </div>
          <h1 style={{ margin: '6px 0 0', fontSize: 30, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1 }}>
            History
          </h1>
        </SpringReveal>

        {/* Stats strip */}
        <SpringReveal delay={60}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10, marginTop: 18 }}>
            <StatCell label="Sessions" value={stats?.totalSessions} Icon={DumbbellIcon} />
            <StatCell label="Volume"   value={stats?.totalVolumeKg} unit="kg" bigNumber Icon={TrendUpIcon} />
            <StatCell label="Per week" value={stats?.avgPerWeek} decimals={1} Icon={TrophyIcon} />
          </div>
        </SpringReveal>

        {/* Heatmap */}
        <SpringReveal delay={120}>
          <h2 style={{ margin: '24px 0 10px', fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: 'hsl(var(--rd-fg-muted))', paddingInline: 2 }}>
            Last 12 weeks
          </h2>
          <HeatmapStrip data={heatmap} />
        </SpringReveal>

        {/* Sessions grouped by month */}
        <div style={{ marginTop: 24 }}>
          {sessions.length === 0 ? (
            <Glass radius="xl" style={{ padding: 18 }}>
              <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em', marginBottom: 4 }}>
                No sessions yet
              </div>
              <p style={{ margin: 0, fontSize: 13, color: 'hsl(var(--rd-fg-muted))', lineHeight: 1.5 }}>
                Your completed workouts will appear here, newest first.
              </p>
            </Glass>
          ) : (
            grouped.map((group, gIdx) => (
              <SpringReveal key={group.label} delay={Math.min(gIdx * 40, 200)}>
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: 'hsl(var(--rd-fg-muted))', marginBottom: 8, paddingInline: 2 }}>
                    {group.label} · {group.items.length}
                  </div>
                  <div style={{ display: 'grid', gap: 8 }}>
                    {group.items.map((s) => (
                      <SessionRow key={s.id} session={s} onClick={() => onOpenSession?.(s.id)} />
                    ))}
                  </div>
                </div>
              </SpringReveal>
            ))
          )}
        </div>
      </div>
    </SafeScreen>
  );
}
export { WorkoutHistory };

function StatCell({ label, value, unit = '', decimals = 0, bigNumber, Icon }) {
  const has = value != null;
  return (
    <Glass radius="xl" style={{ padding: 14 }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'hsl(var(--rd-accent))' }}>
        {Icon && <Icon size={14} />}
        <span style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, color: 'hsl(var(--rd-fg-muted))' }}>
          {label}
        </span>
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', color: has ? 'hsl(var(--rd-fg-primary))' : 'hsl(var(--rd-fg-muted))', marginTop: 4, lineHeight: 1.1 }}>
        {has ? (bigNumber ? formatBig(value) : value.toFixed(decimals)) : '—'}
        {has && unit && <span style={{ fontSize: 11, color: 'hsl(var(--rd-fg-muted))', fontWeight: 500, marginLeft: 2 }}>{unit}</span>}
      </div>
    </Glass>
  );
}

function HeatmapStrip({ data }) {
  const weeks = 12;
  const cells = Array.isArray(data) && data.length === weeks * 7 ? data : new Array(weeks * 7).fill(null);
  return (
    <Glass radius="xl" style={{ padding: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${weeks}, minmax(0, 1fr))`, gap: 3 }}>
        {Array.from({ length: weeks }).map((_, col) => (
          <div key={col} style={{ display: 'grid', gap: 3 }}>
            {Array.from({ length: 7 }).map((__, row) => {
              const idx = col * 7 + row;
              const v = cells[idx];
              const bg =
                v == null ? 'rgba(255,255,255,0.04)'
                : v === 0 ? 'rgba(255,255,255,0.06)'
                : v === 1 ? 'rgba(0,255,255,0.25)'
                : v === 2 ? 'rgba(0,255,255,0.5)'
                : 'hsl(var(--rd-accent))';
              return (
                <div
                  key={idx}
                  style={{
                    aspectRatio: '1 / 1',
                    borderRadius: 3,
                    background: bg,
                    border: '1px solid rgba(255,255,255,0.04)',
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </Glass>
  );
}

function SessionRow({ session: s, onClick }) {
  const d = new Date(s.at);
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex', gap: 12, alignItems: 'center',
        padding: '12px 14px',
        borderRadius: 14,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        color: 'hsl(var(--rd-fg-primary))',
        textAlign: 'left',
        cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
      }}
    >
      <div style={{ width: 40, textAlign: 'center', flexShrink: 0 }}>
        <div style={{ fontSize: 9, letterSpacing: '0.08em', color: 'hsl(var(--rd-fg-muted))', fontWeight: 600, textTransform: 'uppercase' }}>
          {d.toLocaleDateString('en-US', { weekday: 'short' })}
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
          {d.getDate()}
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.005em' }} className="truncate">
            {s.name || 'Workout'}
          </span>
          {s.prCount > 0 && (
            <span
              style={{
                fontSize: 9, padding: '2px 6px', borderRadius: 9999, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                background: 'rgba(201,169,106,0.14)',
                border: '1px solid rgba(201,169,106,0.38)',
                color: 'hsl(var(--rd-premium))',
                flexShrink: 0,
              }}
            >
              {s.prCount} PR
            </span>
          )}
        </div>
        <div style={{ fontSize: 11, color: 'hsl(var(--rd-fg-muted))', marginTop: 2 }}>
          {s.duration ? `${s.duration} min` : ''}
          {s.volume ? ` · ${formatBig(s.volume)} kg` : ''}
          {s.exerciseCount ? ` · ${s.exerciseCount} exercises` : ''}
        </div>
      </div>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden style={{ color: 'hsl(var(--rd-fg-muted))', flexShrink: 0 }}>
        <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

function formatBig(n) {
  if (typeof n !== 'number') return n;
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(Math.round(n * 10) / 10);
}
