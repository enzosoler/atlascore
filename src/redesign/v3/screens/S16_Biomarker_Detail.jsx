import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACNum,
} from '../lib/paper.jsx';

function RangeBar({ min, max, optimal, value, c }) {
  const pct = (v) => ((v - min) / (max - min)) * 100;
  return (
    <div style={{ position: 'relative', height: 10, background: c.faint, borderRadius: 5, overflow: 'hidden' }}>
      {/* optimal range band */}
      <div style={{
        position: 'absolute', top: 0, bottom: 0,
        left: `${pct(optimal.low)}%`, width: `${pct(optimal.high) - pct(optimal.low)}%`,
        background: c.fg, opacity: 0.9,
      }} />
      {/* pointer */}
      <div style={{
        position: 'absolute', top: -3, bottom: -3,
        left: `calc(${pct(value)}% - 2px)`, width: 4,
        background: c.accent, borderRadius: 1,
        boxShadow: `0 0 0 2px ${c.bg}`,
      }} />
    </div>
  );
}

function BiomarkerTrend({ data, c, dark, optimal, rangeMin, rangeMax, currentValue }) {
  const w = 276, h = 120;
  const min = rangeMin ?? 60;
  const max = rangeMax ?? 100;
  const span = max - min || 1;
  const step = data.length > 1 ? w / (data.length - 1) : w;
  const pts = data.map((d, i) => [i * step, h - ((d.v - min) / span) * (h - 20) - 10]);
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');
  // optimal band
  const yOptHigh = h - ((optimal.high - min) / span) * (h - 20) - 10;
  const yOptLow  = h - ((optimal.low  - min) / span) * (h - 20) - 10;
  const lastPt = pts[pts.length - 1];
  const labelVal = currentValue ?? data[data.length - 1]?.v ?? '';
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      {/* optimal band */}
      <rect x="0" y={yOptHigh} width={w} height={yOptLow - yOptHigh}
        fill={c.accent} opacity="0.08" />
      <line x1="0" x2={w} y1={yOptHigh} y2={yOptHigh}
        stroke={c.accent} strokeWidth="1" strokeDasharray="2 3" opacity="0.5" />
      <line x1="0" x2={w} y1={yOptLow} y2={yOptLow}
        stroke={c.accent} strokeWidth="1" strokeDasharray="2 3" opacity="0.5" />
      {/* trend line */}
      <path d={path} fill="none" stroke={c.fg} strokeWidth="2.5" strokeLinejoin="miter" />
      {/* points */}
      {pts.map((p, i) => {
        const last = i === pts.length - 1;
        const v = data[i].v;
        const outOfRange = v < optimal.low || v > optimal.high;
        return (
          <rect key={i} x={p[0] - 3} y={p[1] - 3} width="6" height="6"
            fill={last ? c.accent : (outOfRange ? c.accent : c.fg)}
            opacity={last ? 1 : 0.8} />
        );
      })}
      {/* last label */}
      {lastPt && (
        <text x={Math.max(0, lastPt[0] - 16)} y={Math.max(12, lastPt[1] - 10)}
          fontFamily="ui-monospace, SF Mono, monospace" fontSize="10" fill={c.accent} fontWeight="600">
          {labelVal}
        </text>
      )}
    </svg>
  );
}

function ArrowIcon({ dir, color, size = 20 }) {
  if (dir === 'up') return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M10 16V4M5 9l5-5 5 5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M10 4v12M15 11l-5 5-5-5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/**
 * S16_Biomarker_Detail — single biomarker drill-down.
 * Gift moment: lab result parsing (§12). Plays 3-stage reveal on mount.
 *
 * Gallery:    <S16_Biomarker_Detail dark />
 * Production: <S16_Biomarker_Detail dark biomarkerName="ApoB"
 *               currentValue={82} currentUnit="mg/dL"
 *               statusLabel="Elevated · above optimal"
 *               deltaLabel="↑ 4 since Jan · 2 above optimal range"
 *               range={{ min:50, max:110, optimal:{ low:60, high:80 } }}
 *               history={[{d,v},...]}
 *               drivers={[{t,d,dir},...]}
 *               coachNote="..." coachCta="Start 4-week protocol →"
 *               onBack={fn} onShare={fn} onOpenUpload={fn} onAskCoach={fn}
 *               onCoachCta={fn} onMore={fn} />
 *
 * onShare({biomarkerName, currentValue, currentUnit, statusLabel}) — share result
 * onAskCoach({biomarkerName, currentValue}) — ask coach about this marker
 * onCoachCta({biomarkerName, currentValue, ctaLabel}) — act on coach recommendation
 * onMore({biomarkerName, currentValue}) — 3-dot menu
 */
const DEMO_HISTORY = [
  { d: 'Apr 23', v: 92 },
  { d: 'Oct 23', v: 88 },
  { d: 'Jan 24', v: 85 },
  { d: 'Apr 24', v: 80 },
  { d: 'Jul 24', v: 76 },
  { d: 'Oct 24', v: 75 },
  { d: 'Jan 25', v: 78 },
  { d: 'Apr 25', v: 82 },
];

const DEMO_DRIVERS = [
  { t: 'Saturated fat intake', d: 'Lower sat fat to ≤20g / day', dir: 'down' },
  { t: 'Soluble fiber', d: 'Oats, beans, psyllium — target 10g', dir: 'up' },
  { t: 'Weekly cardio minutes', d: 'Currently 140 / 180 target', dir: 'up' },
  { t: 'Alcohol frequency', d: 'Currently 4× / week', dir: 'down' },
];

function S16_Biomarker_Detail({
  dark = false,
  biomarkerName = 'Apo B',
  noData = false,
  currentValue = 82,
  currentUnit = 'mg/dL',
  statusLabel = 'Elevated · above optimal',
  deltaLabel = '↑ 4 since Jan · 2 above optimal range',
  range,
  history,
  drivers,
  coachNote = 'ApoB above 80 raises cardiovascular risk independently of LDL. You were at 75 last quarter — the drift correlates with your sat-fat intake climbing to 28g/day. Let\'s plan four weeks.',
  coachCta = 'Start 4-week protocol →',
  onBack,
  onShare,
  onOpenUpload,
  onAskCoach,
  onCoachCta,
  onMore,
}) {
  const c = useACT(dark);
  const _history = history || DEMO_HISTORY;
  const _drivers = drivers || DEMO_DRIVERS;
  const _range = range || { min: 50, max: 110, optimal: { low: 60, high: 80 } };
  const { min, max, optimal } = _range;

  // 3-stage gift moment reveal (§12: lab result parsing)
  const [phase, setPhase] = React.useState(0);
  React.useEffect(() => {
    if (noData) { setPhase(2); return; }
    const t1 = setTimeout(() => setPhase(1), 500);
    const t2 = setTimeout(() => setPhase(2), 950);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [noData]);

  const handleShare = () => {
    if (typeof onShare === 'function')
      onShare({ biomarkerName, currentValue, currentUnit, statusLabel });
  };
  const handleAskCoach = () => {
    if (typeof onAskCoach === 'function') onAskCoach({ biomarkerName, currentValue });
  };
  const handleCoachCta = () => {
    if (typeof onCoachCta === 'function') onCoachCta({ biomarkerName, currentValue, ctaLabel: coachCta });
  };
  const handleMore = () => {
    if (typeof onMore === 'function') onMore({ biomarkerName, currentValue });
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      <div style={{ padding: '14px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button type="button" onClick={onBack} style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M7 1L3 5l4 4" stroke={c.fg} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <ACLabel size={12} color={c.dim} style={{ fontWeight: 500 }}>{biomarkerName}</ACLabel>
        <button type="button" onClick={handleMore} style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: onMore ? 'pointer' : 'default' }}>
          <svg width="14" height="3" viewBox="0 0 14 3"><circle cx="2" cy="1.5" r="1.3" fill={c.fg}/><circle cx="7" cy="1.5" r="1.3" fill={c.fg}/><circle cx="12" cy="1.5" r="1.3" fill={c.fg}/></svg>
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: '20px 22px 20px', position: 'relative' }}>
        {/* Anticipation overlay — phase 0, data path only */}
        {phase === 0 && !noData && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 10,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: c.bg,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 999,
              border: `2px solid ${c.faint}`,
              borderTopColor: c.accent,
              animation: 'spin 0.9s linear infinite',
            }} />
            <div style={{
              marginTop: 14, fontFamily: ACFonts.mono, fontSize: 11,
              color: c.dim, letterSpacing: 0.8, textTransform: 'uppercase',
            }}>
              Loading {biomarkerName}...
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}
        {noData ? (
          <>
            <ACLabel size={12} color={c.accent} style={{ fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>No reading loaded</ACLabel>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 8 }}>
              <ACNum size={88} color={c.fg} weight={700}>—</ACNum>
            </div>
            <div style={{ marginTop: 4 }}>
              <ACLabel size={12} color={c.dim} style={{ fontWeight: 600 }}>Upload a panel to unlock range, trend, and coaching context.</ACLabel>
            </div>

            <div style={{ marginTop: 22, padding: 18, background: c.card, borderRadius: ACRadii.card }}>
              <div style={{ fontSize: 14.5, fontWeight: 600, color: c.fg }}>No biomarker history yet</div>
              <div style={{ marginTop: 6, fontSize: 13, color: c.dim, lineHeight: 1.55 }}>
                Once you upload a lab panel, atlas.core will show the current value, range position, trend line, and a coach interpretation here.
              </div>
              <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
                <button type="button" onClick={onOpenUpload} style={{ padding: '10px 14px', borderRadius: 999, border: 'none', background: c.fg, color: c.bg, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>
                  Upload panel →
                </button>
                <button type="button" onClick={handleAskCoach} style={{ padding: '10px 14px', borderRadius: 999, border: `1px solid ${c.faint}`, background: 'transparent', color: c.fg, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>
                  Ask coach
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Stage 1 reveal: value + range bar (phase >= 1) */}
            <div style={{
              opacity: phase >= 1 ? 1 : 0,
              transform: phase >= 1 ? 'translateY(0)' : 'translateY(8px)',
              transition: 'opacity 0.4s ease, transform 0.4s ease',
            }}>
              <ACLabel size={12} color={c.accent} style={{ fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>{statusLabel}</ACLabel>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 8 }}>
                <ACNum size={88} color={c.fg} weight={700}>{currentValue}</ACNum>
                <ACLabel size={14} color={c.dim}>{currentUnit}</ACLabel>
              </div>
              <div style={{ marginTop: 4 }}>
                <ACLabel size={12} color={c.accent} style={{ fontWeight: 600 }}>{deltaLabel}</ACLabel>
              </div>

              {/* Range bar */}
              <div style={{ marginTop: 22, padding: 18, background: c.card, borderRadius: ACRadii.card }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                  <ACLabel size={11} color={c.dim}>Your reading vs optimal range</ACLabel>
                  <ACLabel size={11} color={c.mute} style={{ fontFamily: ACFonts.mono }}>{min} – {max}</ACLabel>
                </div>
                <RangeBar min={min} max={max} optimal={optimal} value={currentValue} c={c} />
                <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between' }}>
                  <ACLabel size={10} color={c.mute} style={{ fontFamily: ACFonts.mono }}>Low</ACLabel>
                  <ACLabel size={10} color={c.mute} style={{ fontFamily: ACFonts.mono }}>Optimal {optimal.low}–{optimal.high}</ACLabel>
                  <ACLabel size={10} color={c.mute} style={{ fontFamily: ACFonts.mono }}>High</ACLabel>
                </div>
              </div>
            </div>

            {/* Stage 2 celebration: trend + drivers + coach note (phase >= 2) */}
            <div style={{
              opacity: phase >= 2 ? 1 : 0,
              transform: phase >= 2 ? 'translateY(0)' : 'translateY(8px)',
              transition: 'opacity 0.4s ease, transform 0.4s ease',
            }}>
              {/* Trend */}
              <div style={{ marginTop: 12, padding: 18, background: c.card, borderRadius: ACRadii.card }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <ACLabel size={12} color={c.dim}>24-month trend</ACLabel>
                  <ACLabel size={12} color={c.accent} style={{ fontWeight: 600 }}>{_history.length} readings</ACLabel>
                </div>
                <BiomarkerTrend data={_history} c={c} dark={dark} optimal={optimal} rangeMin={min} rangeMax={max} currentValue={currentValue} />
              </div>

              {/* What drives this */}
              <div style={{ marginTop: 22 }}>
                <ACLabel size={12} color={c.dim}>What drives this</ACLabel>
                {_drivers.map((r, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0',
                    borderTop: i === 0 ? `1px solid ${c.hair}` : 'none',
                    borderBottom: `1px solid ${c.hair}`,
                  }}>
                    <ArrowIcon dir={r.dir} color={c.accent} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 500, color: c.fg }}>{r.t}</div>
                      <ACLabel size={12} color={c.dim}>{r.d}</ACLabel>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coach note + share */}
              {coachNote && (
                <div style={{ marginTop: 22, padding: 16, background: c.card, borderRadius: ACRadii.card, borderLeft: `3px solid ${c.accent}` }}>
                  <ACLabel size={11} color={c.accent} style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3 }}>Coach</ACLabel>
                  <div style={{ marginTop: 6, fontSize: 14, color: c.fg, lineHeight: 1.5 }}>
                    {coachNote}
                  </div>
                  <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {coachCta && (
                      <button type="button" onClick={handleCoachCta} style={{ padding: '8px 12px', background: c.accent, color: c.ink, fontSize: 12, fontWeight: 600, borderRadius: 8, border: 'none', cursor: onCoachCta ? 'pointer' : 'default' }}>
                        {coachCta}
                      </button>
                    )}
                    {onShare && (
                      <button type="button" onClick={handleShare} style={{ padding: '8px 12px', background: 'transparent', color: c.fg, fontSize: 12, fontWeight: 600, borderRadius: 8, border: `1px solid ${c.faint}`, cursor: 'pointer' }}>
                        Share result
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default S16_Biomarker_Detail;
