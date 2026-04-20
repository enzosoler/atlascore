/**
 * S56_Composition_History -- body composition trend view.
 *
 * Replaces v2 BodyCompositionHistory. Uses the v3 paper design system
 * exclusively (no glass, no CSS variables, no hardcoded colors).
 *
 * Gallery:    <S56_Composition_History dark />
 * Production: <S56_Composition_History dark={false}
 *               current={{weight: 182.4, bodyFatPct: 17.2, weightDelta: -0.8, bfDelta: -0.3}}
 *               history={[...]} stats={{totalChange: -4.2, weeklyAvg: -0.42, bestStreak: 12, lastLogDate: '2026-04-19'}}
 *               weightUnit="lb"
 *               onLogWeight={fn} onOpenEntry={fn} onBack={fn} />
 *
 * Props contract:
 *   { dark, current: {weight, bodyFatPct, weightDelta, bfDelta},
 *     history: [{id, date, weight, bodyFatPct}],
 *     stats: {totalChange, weeklyAvg, bestStreak, lastLogDate},
 *     weightUnit,
 *     onLogWeight(), onOpenEntry(id), onBack() }
 */
import React, { useState, useMemo } from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACNum, ACBtn, ACChip, ACMono,
} from '../lib/paper.jsx';

/* ── DEMO data (gallery fallback) ─────────────────────────────── */
const DEMO_CURRENT = {
  weight: 182.4,
  bodyFatPct: 17.2,
  weightDelta: -0.8,
  bfDelta: -0.3,
};

const _base = Date.now();
const DEMO_HISTORY = Array.from({ length: 30 }, (_, i) => ({
  id: `entry-${30 - i}`,
  date: new Date(_base - (30 - i) * 86400000).toISOString(),
  weight: 186.6 - i * 0.14 + (Math.sin(i * 0.5) * 0.4),
  bodyFatPct: i < 25 ? 18.0 - i * 0.03 + (Math.cos(i * 0.7) * 0.15) : null,
}));

const DEMO_STATS = {
  totalChange: -4.2,
  weeklyAvg: -0.42,
  bestStreak: 12,
  lastLogDate: '2026-04-19',
};

const PERIODS = [
  { key: '7d', label: '7d', days: 7 },
  { key: '30d', label: '30d', days: 30 },
  { key: '90d', label: '90d', days: 90 },
  { key: '1y', label: '1y', days: 365 },
];

/* ── helpers ───────────────────────────────────────────────────── */
function fmtDate(iso) {
  if (!iso) return '\u2014';
  const d = new Date(iso);
  const m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${m[d.getMonth()]} ${d.getDate()}`;
}

function fmtDelta(v) {
  if (v == null) return null;
  const sign = v > 0 ? '+' : '';
  return `${sign}${v.toFixed(1)}`;
}

/* ── area chart (SVG, theme-aware) ─────────────────────────────── */
function AreaChart({ data, w, h, dark }) {
  const c = useACT(dark);
  if (!data || data.length < 2) {
    return (
      <div style={{
        height: h, borderRadius: ACRadii.card,
        border: `1px dashed ${c.hair}`, background: c.card,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <ACLabel size={12} color={c.mute}>Not enough data for this period</ACLabel>
      </div>
    );
  }
  const ordered = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
  const weights = ordered.map(e => e.weight);
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const pad = (max - min) * 0.15 || 0.5;
  const yMin = min - pad;
  const yMax = max + pad;
  const range = yMax - yMin || 1;

  const tFirst = new Date(ordered[0].date).getTime();
  const tLast = new Date(ordered[ordered.length - 1].date).getTime();
  const tSpan = tLast - tFirst || 1;

  const points = ordered.map(e => {
    const x = ((new Date(e.date).getTime() - tFirst) / tSpan) * w;
    const y = h - 10 - ((e.weight - yMin) / range) * (h - 20);
    return { x, y, e };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaPath = `M ${points[0].x.toFixed(1)} ${h} ${linePath} L ${points[points.length - 1].x.toFixed(1)} ${h} Z`;

  const gradId = `compAreaGrad_${dark ? 'd' : 'l'}`;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={c.accent} stopOpacity="0.30" />
          <stop offset="100%" stopColor={c.accent} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {/* guide lines */}
      {[0, 0.5, 1].map((v, i) => (
        <line key={i} x1="0" x2={w}
          y1={10 + (1 - v) * (h - 20)} y2={10 + (1 - v) * (h - 20)}
          stroke={c.hair} strokeDasharray="2 4" />
      ))}
      <path d={areaPath} fill={`url(#${gradId})`} />
      <path d={linePath} fill="none" stroke={c.accent} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
      {/* data dots */}
      {points.map((p, i) => {
        const last = i === points.length - 1;
        return (
          <circle key={i} cx={p.x} cy={p.y} r={last ? 4 : 2}
            fill={last ? c.accent : c.dim} />
        );
      })}
      {/* last point label */}
      {points.length > 0 && (() => {
        const lp = points[points.length - 1];
        return (
          <text x={lp.x - 4} y={lp.y - 10}
            fill={c.accent} fontSize="10" fontFamily={ACFonts.mono}
            fontWeight="700" textAnchor="end">
            {lp.e.weight.toFixed(1)}
          </text>
        );
      })()}
    </svg>
  );
}

/* ── main component ────────────────────────────────────────────── */
export default function S56_Composition_History({
  dark = false,
  current,
  history,
  stats,
  weightUnit = 'lb',
  onLogWeight,
  onOpenEntry,
  onBack,
}) {
  const c = useACT(dark);
  const cur = current || DEMO_CURRENT;
  const entries = history === undefined ? DEMO_HISTORY : history;
  const st = stats || DEMO_STATS;

  const [period, setPeriod] = useState('30d');

  // Sort newest first
  const sorted = useMemo(() => {
    const copy = [...(entries || [])];
    copy.sort((a, b) => new Date(b.date) - new Date(a.date));
    return copy;
  }, [entries]);

  // Filter by period
  const filtered = useMemo(() => {
    const days = PERIODS.find(p => p.key === period)?.days || 30;
    const cutoff = Date.now() - days * 86400000;
    return sorted.filter(e => new Date(e.date).getTime() >= cutoff);
  }, [sorted, period]);

  const hasData = sorted.length > 0;

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      {/* ── top bar ── */}
      <div style={{ padding: '14px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button type="button" onClick={() => { if (typeof onBack === 'function') onBack(); }} style={{
          width: 28, height: 28, borderRadius: 999,
          background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: 'none', cursor: 'pointer',
        }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M7 1L3 5l4 4" stroke={c.fg} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <ACLabel size={12} color={c.dim} style={{ fontWeight: 500 }}>Composition history</ACLabel>
        <div style={{ width: 28 }} />
      </div>

      {/* ── scroll area ── */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: '14px 22px 28px' }}>

        {/* ── STATE HEADER: hero numbers ── */}
        <div style={{
          padding: '16px 18px', background: c.fg, color: c.bg, borderRadius: ACRadii.card,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            {/* Weight */}
            <div>
              <ACLabel size={10} color={c.accent} style={{ fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>
                Weight
              </ACLabel>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                <ACNum size={44} color={c.bg} weight={700}>
                  {typeof cur.weight === 'number' ? cur.weight.toFixed(1) : cur.weight}
                </ACNum>
                <ACLabel size={12} color="rgba(239,233,218,0.55)">{weightUnit}</ACLabel>
              </div>
              {cur.weightDelta != null && (
                <div style={{ marginTop: 6 }}>
                  <ACChip accent dark={true} style={{ fontSize: 10 }}>
                    {cur.weightDelta <= 0 ? '\u2193' : '\u2191'} {Math.abs(cur.weightDelta).toFixed(1)} this week
                  </ACChip>
                </div>
              )}
            </div>
            {/* Body fat */}
            {cur.bodyFatPct != null && (
              <div style={{ textAlign: 'right' }}>
                <ACLabel size={10} color={c.accent} style={{ fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>
                  Body fat
                </ACLabel>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4, justifyContent: 'flex-end' }}>
                  <ACNum size={30} color={c.bg} weight={700}>
                    {typeof cur.bodyFatPct === 'number' ? cur.bodyFatPct.toFixed(1) : cur.bodyFatPct}
                  </ACNum>
                  <ACLabel size={12} color="rgba(239,233,218,0.55)">%</ACLabel>
                </div>
                {cur.bfDelta != null && (
                  <div style={{ marginTop: 6, display: 'flex', justifyContent: 'flex-end' }}>
                    <ACChip accent dark={true} style={{ fontSize: 10 }}>
                      {cur.bfDelta <= 0 ? '\u2193' : '\u2191'} {Math.abs(cur.bfDelta).toFixed(1)}%
                    </ACChip>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── INSIGHT BLOCK: period selector + chart ── */}
        {hasData && (
          <>
            {/* Period tabs */}
            <div style={{
              marginTop: 16, display: 'grid',
              gridTemplateColumns: `repeat(${PERIODS.length}, 1fr)`,
              padding: 3, borderRadius: 999,
              background: c.card,
            }}>
              {PERIODS.map(p => {
                const active = period === p.key;
                return (
                  <button key={p.key} type="button" onClick={() => setPeriod(p.key)} style={{
                    height: 32, borderRadius: 999, border: 'none',
                    background: active ? c.accent : 'transparent',
                    color: active ? c.ink : c.dim,
                    fontSize: 13, fontWeight: 600, letterSpacing: -0.1,
                    fontFamily: ACFonts.body,
                    cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                  }}>
                    {p.label}
                  </button>
                );
              })}
            </div>

            {/* SVG area chart */}
            <div style={{ marginTop: 14, padding: 14, background: c.card, borderRadius: ACRadii.card }}>
              <AreaChart data={filtered} w={300} h={150} dark={dark} />
              <div style={{
                marginTop: 8, display: 'flex', justifyContent: 'space-between',
                paddingInline: 2,
              }}>
                {filtered.length > 0 && (
                  <>
                    <ACMono size={9} color={c.mute}>{fmtDate(filtered[filtered.length - 1]?.date)}</ACMono>
                    <ACMono size={9} color={c.accent}>{fmtDate(filtered[0]?.date)}</ACMono>
                  </>
                )}
              </div>
            </div>
          </>
        )}

        {/* ── TRAJECTORY: stat cells ── */}
        <div style={{
          marginTop: 14, display: 'grid',
          gridTemplateColumns: '1fr 1fr', gap: 8,
        }}>
          <StatCell dark={dark} label="Total change"
            value={st.totalChange != null ? `${fmtDelta(st.totalChange)} ${weightUnit}` : '\u2014'}
            tone={st.totalChange == null ? 'neutral' : st.totalChange < 0 ? 'positive' : 'warning'} />
          <StatCell dark={dark} label="Weekly avg"
            value={st.weeklyAvg != null ? `${fmtDelta(st.weeklyAvg)} ${weightUnit}` : '\u2014'} />
          <StatCell dark={dark} label="Best streak"
            value={st.bestStreak != null && st.bestStreak > 0 ? `${st.bestStreak} day${st.bestStreak === 1 ? '' : 's'}` : '\u2014'} />
          <StatCell dark={dark} label="Last log"
            value={st.lastLogDate ? fmtDate(st.lastLogDate) : '\u2014'} />
        </div>

        {/* ── SECONDARY: recent entries ── */}
        {sorted.length > 0 && (
          <div style={{ marginTop: 22 }}>
            <ACLabel size={11} color={c.dim} style={{
              fontFamily: ACFonts.body, fontWeight: 600, letterSpacing: 0.25, textTransform: 'uppercase',
            }}>
              Recent entries
            </ACLabel>
            <div style={{ marginTop: 10, borderRadius: ACRadii.card, background: c.card, overflow: 'hidden' }}>
              {sorted.slice(0, 10).map((e, i) => (
                <button key={e.id || i} type="button"
                  onClick={() => { if (typeof onOpenEntry === 'function') onOpenEntry(e.id); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', padding: '14px 16px',
                    background: 'transparent', border: 'none',
                    borderBottom: i < Math.min(9, sorted.length - 1) ? `1px solid ${c.hair}` : 'none',
                    cursor: 'pointer', textAlign: 'left',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <div>
                    <div style={{
                      fontFamily: ACFonts.body, fontSize: 14, fontWeight: 600,
                      letterSpacing: -0.1, color: c.fg,
                    }}>
                      {fmtDate(e.date)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                    {e.bodyFatPct != null && (
                      <ACMono size={11} color={c.mute}>
                        {typeof e.bodyFatPct === 'number' ? e.bodyFatPct.toFixed(1) : e.bodyFatPct}%
                      </ACMono>
                    )}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                      <ACNum size={17} color={c.fg} weight={700}>
                        {typeof e.weight === 'number' ? e.weight.toFixed(1) : e.weight}
                      </ACNum>
                      <span style={{ fontFamily: ACFonts.mono, fontSize: 10, color: c.mute }}>{weightUnit}</span>
                    </div>
                    <svg width="8" height="12" viewBox="0 0 8 12" fill="none">
                      <path d="M1 1l5 5-5 5" stroke={c.mute} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── no-data empty state ── */}
        {!hasData && (
          <div style={{
            marginTop: 22, padding: 24, borderRadius: ACRadii.card,
            background: c.card, textAlign: 'center',
          }}>
            <div style={{
              fontFamily: ACFonts.display, fontSize: 17, fontWeight: 700,
              color: c.fg, marginBottom: 8,
            }}>
              No history yet
            </div>
            <ACLabel size={13} color={c.dim} style={{ lineHeight: 1.5 }}>
              Log your first weight to see composition trends here.
            </ACLabel>
          </div>
        )}
      </div>

      {/* ── ACTION: log weight CTA (sticky bottom) ── */}
      <div style={{ padding: '12px 22px 24px', background: c.bg }}>
        <ACBtn primary dark={dark} size="lg" pill block
          onClick={() => { if (typeof onLogWeight === 'function') onLogWeight(); }}>
          Log weight
        </ACBtn>
      </div>
    </div>
  );
}

/* ── stat cell sub-component ──────────────────────────────────── */
function StatCell({ dark, label, value, tone = 'neutral' }) {
  const c = useACT(dark);
  const col = tone === 'positive' ? c.accent
    : tone === 'warning' ? '#e8a020'
    : c.fg;
  return (
    <div style={{
      padding: 14, borderRadius: ACRadii.card, background: c.card,
    }}>
      <ACLabel size={10} color={c.dim} style={{
        fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase',
      }}>
        {label}
      </ACLabel>
      <div style={{
        marginTop: 6,
        fontFamily: ACFonts.display, fontSize: 17, fontWeight: 700,
        letterSpacing: -0.3, color: col, fontVariantNumeric: 'tabular-nums',
      }}>
        {value}
      </div>
    </div>
  );
}
