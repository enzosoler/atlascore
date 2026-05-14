import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACNum, ACBtn, ACLine,
} from '../lib/paper.jsx';

function normalizeLinePoints(points) {
  if (!Array.isArray(points)) return [];

  return points
    .map((point, index) => {
      if (typeof point === 'number' && Number.isFinite(point)) {
        return { k: index, v: point };
      }

      if (point && typeof point === 'object') {
        const rawX = typeof point.k === 'number' && Number.isFinite(point.k) ? point.k : index;
        const rawY = Number(point.v);
        if (Number.isFinite(rawY)) {
          return { k: rawX, v: rawY };
        }
      }

      return null;
    })
    .filter(Boolean);
}

function S13_Coach_Brief({
  dark = false,
  timestampLabel = 'SAT · 18 APR · 07:42',
  briefLabel = 'Morning brief · day 142',
  headlineLead = "You're",
  headlineAccent = 'Ready',
  metricLabel = 'Readiness',
  metricValue = '87',
  deltaLabel = 'vs 14d avg',
  deltaValue = '+11',
  timelineLabels = ['APR 05', 'APR 12', 'TODAY'],
  sparklineData = null,
  reasonText = 'HRV recovered above baseline overnight. Four training days this week — hitting today puts you in the top 5% of your age bracket.',
  movesLabel = 'Today · three moves',
  movesProgressLabel,
  moves,
  signalLabel = 'Body trend · 14d',
  signalStatus = 'All green',
  signals,
  primaryActionLabel = 'Start today →',
  secondaryActionLabel = 'ask coach anything',
  onClose,
  onStartToday,
  onAskCoach,
  onToggleMove,
}) {
  const c = useACT(dark);
  const readinessHistory = Array.isArray(sparklineData) && sparklineData.length > 0 ? sparklineData : null;
  
  const defaultMoves = [
    { id: 'm1', n: '01', t: 'Train', d: 'Heavy Lower · 58 min', meta: '4 PR attempts queued', lead: true },
    { id: 'm2', n: '02', t: 'Nutrition', d: 'Hit 186g protein', meta: '148g tracked · 38g to go' },
    { id: 'm3', n: '03', t: 'Sleep', d: 'In bed by 10:30', meta: 'Shifted 42 min later this week' },
  ];

  const moveRows = moves || defaultMoves;
  const [checkedMoves, setCheckedMoves] = React.useState({});

  const doneCount = moveRows.filter(m => checkedMoves[m.id || m.n]).length;
  const progressLabel = movesProgressLabel || `${String(doneCount).padStart(2, '0')} / ${String(moveRows.length).padStart(2, '0')}`;

  function handleToggle(m) {
    const key = m.id || m.n;
    const next = { ...checkedMoves, [key]: !checkedMoves[key] };
    setCheckedMoves(next);
    onToggleMove?.(m, next[key]);
  }

  const signalRows = (signals || []).map((signal) => ({
    ...signal,
    data: normalizeLinePoints(signal?.data),
  }));
  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: c.fg, color: c.bg }}>
      {/* ── DARK HERO BLOCK ── */}
      <div style={{ padding: '14px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button type="button" onClick={onClose} style={{
          width: 28, height: 28, borderRadius: 999,
          background: 'rgba(239,233,218,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: 'none', cursor: 'pointer',
        }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M1 1l8 8M9 1l-8 8" stroke={c.bg} strokeWidth="1.8" strokeLinecap="round" opacity="0.7"/></svg>
        </button>
        <ACLabel size={11} color="rgba(239,233,218,0.55)" style={{ fontFamily: ACFonts.body, fontWeight: 600, letterSpacing: 0.1 }}>{timestampLabel}</ACLabel>
        <div style={{ width: 28 }} />
      </div>

      <div style={{ padding: '28px 28px 24px' }}>
        <ACLabel size={11} color={c.accent} style={{ fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase' }}>
          {briefLabel}
        </ACLabel>

        {/* Big statement */}
        <div style={{
          marginTop: 14, fontFamily: ACFonts.display,
          fontSize: 54, fontWeight: 700,
          letterSpacing: -2.4, lineHeight: 0.92,
          textWrap: 'pretty',
        }}>
          {headlineLead}<br/>
          <span style={{ color: c.accent }}>{headlineAccent}</span><span style={{ color: c.accent }}>.</span>
        </div>

        {/* Readiness number, right-aligned, brutal */}
        <div style={{
          marginTop: 24, display: 'flex', alignItems: 'flex-end',
          justifyContent: 'space-between', gap: 12,
        }}>
          <div>
            <ACLabel size={10} color="rgba(239,233,218,0.55)" style={{ fontFamily: ACFonts.body, fontWeight: 600, letterSpacing: 0.2, textTransform: 'uppercase' }}>{metricLabel}</ACLabel>
            <div style={{
              fontFamily: ACFonts.display, fontSize: 120, fontWeight: 700,
              letterSpacing: -5, lineHeight: 0.85, color: c.bg,
              fontVariantNumeric: 'tabular-nums',
            }}>{metricValue}</div>
          </div>
          <div style={{ textAlign: 'right', paddingBottom: 4 }}>
            <ACLabel size={10} color="rgba(239,233,218,0.55)" style={{ fontFamily: ACFonts.body, fontWeight: 600, letterSpacing: 0.2, textTransform: 'uppercase' }}>{deltaLabel}</ACLabel>
            <div style={{ fontFamily: ACFonts.body, fontSize: 18, fontWeight: 700, color: c.accent, marginTop: 4 }}>{deltaValue}</div>
          </div>
        </div>

        {/* Sparkline with explicit x-axis — only shown when real data is available */}
        {readinessHistory && (
          <>
            <div style={{ marginTop: 14 }}>
              <ACLine w={300} h={36} dark={true} data={readinessHistory} />
            </div>
            <div style={{
              marginTop: 6, display: 'flex', justifyContent: 'space-between',
              fontFamily: ACFonts.mono, fontSize: 9, color: 'rgba(239,233,218,0.45)',
              letterSpacing: 0.5,
            }}>
              <span>{timelineLabels[0]}</span>
              <span>{timelineLabels[1]}</span>
              <span style={{ color: c.accent }}>{timelineLabels[2]}</span>
            </div>
          </>
        )}

        {/* One-liner why */}
        <div style={{
          marginTop: 22, paddingTop: 20,
          borderTop: '1px solid rgba(239,233,218,0.12)',
          fontSize: 14, color: 'rgba(239,233,218,0.78)',
          lineHeight: 1.55, textWrap: 'pretty',
        }}>
          {reasonText}
        </div>
      </div>

      {/* ── LIGHT BODY ── */}
      <div style={{
        flex: 1, minHeight: 0, background: c.bg, color: c.fg,
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: '24px 22px 16px',
        overflow: 'auto', WebkitOverflowScrolling: 'touch',
        marginTop: -2,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.body, fontWeight: 600, letterSpacing: 0.25, textTransform: 'uppercase' }}>{movesLabel}</ACLabel>
          <ACLabel size={11} color={c.mute} style={{ fontFamily: ACFonts.body, fontWeight: 600 }}>{progressLabel}</ACLabel>
        </div>

        {/* Three moves — bigger, more breathing room, clearer lead item */}
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column' }}>
          {moveRows.map((r, i) => {
            const isDone = checkedMoves[r.id || r.n];
            return (
              <button key={i} type="button" onClick={() => handleToggle(r)} style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '16px 0',
                borderTop: i === 0 ? 'none' : `1px solid ${c.hair}`,
                background: 'transparent', borderLeft: 'none', borderRight: 'none', borderBottom: 'none',
                width: '100%', textAlign: 'left', cursor: 'pointer',
                opacity: isDone ? 0.5 : 1,
              }}>
                <div style={{
                  width: 32, textAlign: 'left',
                  fontFamily: ACFonts.mono, fontSize: 13, fontWeight: 700,
                  color: isDone ? c.dim : (r.lead ? c.accent : c.mute), letterSpacing: 0.3,
                }}>{r.n}</div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: ACFonts.display, fontSize: 18, fontWeight: 600,
                    letterSpacing: -0.4, color: c.fg,
                    textDecoration: isDone ? 'line-through' : 'none',
                  }}>
                    {r.t} <span style={{ color: c.mute, fontWeight: 400 }}>·</span> <span style={{ fontWeight: 500, color: c.fg }}>{r.d}</span>
                  </div>
                  <ACLabel size={12} color={c.dim} style={{ marginTop: 2 }}>{r.meta}</ACLabel>
                </div>
                {isDone ? (
                  <div style={{
                    width: 28, height: 28, borderRadius: 999,
                    background: c.faint, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6l2.5 3 4.5-6" stroke={c.fg} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                ) : r.lead ? (
                  <div style={{
                    width: 28, height: 28, borderRadius: 999,
                    background: c.accent, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 1l4 4-4 4" stroke={c.ink} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                ) : (
                  <svg width="10" height="12" viewBox="0 0 10 12"><path d="M2 1l5 5-5 5" stroke={c.mute} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                )}
              </button>
            );
          })}
        </div>

        {/* Signal trend — redesigned as horizontal pills with micro-sparks */}
        {signalRows.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
              <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.body, fontWeight: 600, letterSpacing: 0.25, textTransform: 'uppercase' }}>{signalLabel}</ACLabel>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: 999, background: c.accent }} />
                <ACLabel size={11} color={c.accent} style={{ fontWeight: 600 }}>{signalStatus}</ACLabel>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {signalRows.map((m, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px', background: c.card, borderRadius: ACRadii.input,
                }}>
                  <div style={{ width: 56 }}>
                    <ACLabel size={9} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>{m.k}</ACLabel>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginTop: 2 }}>
                      <ACNum size={20} color={c.fg} weight={700}>{m.v}</ACNum>
                      <span style={{ fontSize: 10, color: c.mute, fontFamily: ACFonts.mono }}>{m.u}</span>
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    {m.data.length > 0 && (
                      <ACLine w={150} h={26} dark={dark} data={m.data} />
                    )}
                  </div>
                  <div style={{
                    fontFamily: ACFonts.mono, fontSize: 12, fontWeight: 700,
                    color: c.accent, minWidth: 42, textAlign: 'right',
                  }}>{m.d}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer CTAs — single primary, ghost secondary underneath */}
      <div style={{ padding: '12px 22px 22px', background: c.bg, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <ACBtn primary dark={dark} size="lg" pill style={{ width: '100%' }} onClick={onStartToday}>{primaryActionLabel}</ACBtn>
        <div style={{
          textAlign: 'center', padding: '6px 0',
          fontSize: 13, fontWeight: 500, color: c.dim,
        }}>
          or <button type="button" onClick={onAskCoach} style={{ color: c.fg, fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 3, border: 'none', background: 'transparent', padding: 0, cursor: 'pointer' }}>{secondaryActionLabel}</button>
        </div>
      </div>
    </div>
  );
}

export default S13_Coach_Brief;
