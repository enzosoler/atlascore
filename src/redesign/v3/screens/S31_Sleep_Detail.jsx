import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACNum, ACSpark, ACTabBar,
} from '../lib/paper.jsx';
import { HeartMark } from '../lib/brandMarks.jsx';

/**
 * S31_Sleep_Detail — single night sleep drill-down.
 *
 * Gallery:    <S31_Sleep_Detail dark />
 * Production: <S31_Sleep_Detail dark nightLabel="LAST NIGHT · 17→18 APR"
 *               scoreLabel="Sleep · 84 / 100" durationDisplay="7:42"
 *               windowLabel="23:18 → 07:00 · 94% EFFICIENCY"
 *               stageLegend={[...]} stageHours={[...]}
 *               signals={[...]} coachNote="..." showTabBar={false}
 *               onBack={fn} onShare={fn} onConnectDevice={fn} />
 *
 * stageLegend: [{k, v, sub}] — e.g. [{k:'DEEP', v:'1:48', sub:'23%'}, ...]
 * signals: [{k, v, u, trend, data}] — 4 biometric sparklines
 * onShare({nightLabel, scoreLabel, durationDisplay, stageLegend, sharedAt})
 * onConnectDevice() — CTA in noData state to trigger device pairing flow
 */

const DEMO_STAGE_LEGEND = [
  { k: 'DEEP',  v: '1:48', sub: '23%' },
  { k: 'LIGHT', v: '3:32', sub: '46%' },
  { k: 'REM',   v: '2:04', sub: '27%' },
  { k: 'AWAKE', v: '0:18', sub: '4%' },
];

const DEMO_SIGNALS = [
  { k: 'HRV',  v: '62',   u: 'ms',   trend: '+4',    data: [45,48,52,50,55,58,62,60,58,62,65,60,58,62] },
  { k: 'RHR',  v: '51',   u: 'bpm',  trend: '−2',    data: [62,58,55,52,50,48,50,52,49,51,50,48,50,51] },
  { k: 'RESP', v: '14.8', u: '/min', trend: '+0.2',   data: [14,15,14,13,14,15,14,14,15,15,14,14,15,14.8] },
  { k: 'TEMP', v: '+0.3', u: '°F',   trend: 'normal', data: [0,-0.1,0.1,0.2,0.3,0.4,0.5,0.4,0.3,0.2,0.3,0.3,0.4,0.3] },
];

// Visual stage segment colours map: index → style
const STAGE_COLORS = {
  0: { fill: 'awake' },
  1: { fill: 'rem' },
  2: { fill: 'light' },
  3: { fill: 'deep' },
};

const DEMO_SEGS = [
  [0, 6, 2],[6, 30, 3],[30, 50, 2],[50, 72, 3],[72, 100, 1],
  [100, 120, 2],[120, 128, 0],[128, 160, 1],[160, 186, 2],
  [186, 205, 3],[205, 232, 1],[232, 260, 2],[260, 280, 1],
];

export default function S31_Sleep_Detail({
  dark = false,
  noData = false,
  nightLabel = 'LAST NIGHT · 17→18 APR',
  scoreLabel = 'Sleep · 84 / 100',
  durationDisplay = '7:42',
  windowLabel = '23:18 → 07:00 · 94% EFFICIENCY',
  stageLegend,
  stageHours = ['23','00','02','04','06','07'],
  stageSegments,
  signals,
  coachNote = 'Deep sleep came early and held — that\'s why readiness is 87 this morning. HRV is at the top of your 30-day band. Pull heavy today if the bar feels warm.',
  showTabBar = false,
  onBack,
  onShare,
  onConnectDevice,
}) {
  const c = useACT(dark);
  const _legend = stageLegend || DEMO_STAGE_LEGEND;
  const _signals = signals || DEMO_SIGNALS;
  const _segs = stageSegments || DEMO_SEGS;

  const handleShare = () => {
    if (typeof onShare === 'function')
      onShare({ nightLabel, scoreLabel, durationDisplay, stageLegend: _legend, sharedAt: Date.now() });
  };

  // Legend colour mapping: DEEP → fg, LIGHT/REM → dim, AWAKE → accent
  function legendColor(k) {
    if (k === 'DEEP') return { col: c.fg, op: 1 };
    if (k === 'AWAKE') return { col: c.accent, op: 1 };
    return { col: c.dim, op: 0.55 };
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      <div style={{ padding: '14px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button type="button" onClick={onBack} style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: onBack ? 'pointer' : 'default' }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M7 1L3 5l4 4" stroke={c.fg} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5 }}>{nightLabel}</ACLabel>
        <button type="button" onClick={handleShare} style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: onShare ? 'pointer' : 'default' }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2h8v8M2 10l8-8" stroke={c.fg} strokeWidth="1.6" strokeLinecap="round"/></svg>
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: '14px 22px 20px' }}>
        {noData ? (
          <>
            <ACLabel size={10} color={c.accent} style={{ fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' }}>
              No sleep data
            </ACLabel>
            <div style={{
              marginTop: 10, fontFamily: ACFonts.display, fontSize: 56, fontWeight: 700,
              letterSpacing: -2.2, lineHeight: 0.95, color: c.fg,
            }}>
              —<span style={{ color: c.accent }}>:</span>—
            </div>
            <div style={{ marginTop: 14, padding: 18, background: c.card, borderRadius: ACRadii.card }}>
              <div style={{ fontSize: 14.5, fontWeight: 600, color: c.fg }}>No reading for this night</div>
              <div style={{ marginTop: 6, fontSize: 13, color: c.dim, lineHeight: 1.55 }}>
                Connect Apple Watch, Oura, or Whoop to unlock sleep stages, HRV, and coach interpretation.
              </div>
              {onConnectDevice && (
                <button type="button" onClick={onConnectDevice} style={{
                  marginTop: 14, padding: '9px 16px', borderRadius: 999,
                  border: 'none', background: c.accent, color: c.ink,
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                }}>Connect device →</button>
              )}
            </div>
          </>
        ) : (
          <>
            <ACLabel size={10} color={c.accent} style={{ fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' }}>
              {scoreLabel}
            </ACLabel>
            <div style={{
              marginTop: 10, fontFamily: ACFonts.display, fontSize: 56, fontWeight: 700,
              letterSpacing: -2.2, lineHeight: 0.95, color: c.fg,
              fontVariantNumeric: 'tabular-nums',
            }}>
              {durationDisplay.replace(':', String.fromCharCode(58)).split(':').map((part, i) => (
                <span key={i}>{i === 1 ? <><span style={{ color: c.accent }}>:</span>{part}</> : part}</span>
              ))}
            </div>
            <div style={{
              marginTop: 6, fontFamily: ACFonts.mono, fontSize: 11,
              color: c.dim, letterSpacing: 0.3,
            }}>
              {windowLabel}
            </div>

            {/* Stages timeline */}
            <div style={{
              marginTop: 22, padding: 18, background: c.card, borderRadius: ACRadii.card,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.6, textTransform: 'uppercase' }}>Stages</ACLabel>
                <ACLabel size={10} color={c.mute} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.3 }}>{stageHours[0]} — {stageHours[stageHours.length - 1]}</ACLabel>
              </div>
              <div style={{ display: 'flex', gap: 8, height: 110, alignItems: 'stretch' }}>
                <div style={{
                  display: 'flex', flexDirection: 'column',
                  justifyContent: 'space-between', paddingTop: 2, paddingBottom: 2,
                }}>
                  {['AWAKE','REM','LIGHT','DEEP'].map(l => (
                    <div key={l} style={{
                      fontFamily: ACFonts.mono, fontSize: 8.5, color: c.mute,
                      letterSpacing: 0.5, textAlign: 'right',
                    }}>{l}</div>
                  ))}
                </div>
                <div style={{ flex: 1, position: 'relative' }}>
                  <svg width="100%" height="110" viewBox="0 0 280 110" preserveAspectRatio="none">
                    {[0,1,2,3].map(i => (
                      <line key={i} x1="0" x2="280" y1={i * 28 + 8} y2={i * 28 + 8}
                        stroke={c.hair} strokeDasharray="2 3"/>
                    ))}
                    {_segs.map((s, i) => {
                      const y = s[2] * 28 + 4;
                      const isDeep = s[2] === 3;
                      const isAwake = s[2] === 0;
                      return (
                        <rect key={i}
                          x={s[0]} y={y} width={s[1] - s[0]} height={8}
                          fill={isAwake ? c.accent : (isDeep ? c.fg : c.dim)}
                          opacity={isDeep ? 1 : (isAwake ? 1 : 0.55)} />
                      );
                    })}
                    <path d="M3 64 L6 64 L6 92 L30 92 L30 64 L50 64 L50 92 L72 92 L72 36 L100 36 L100 64 L120 64 L120 8 L128 8 L128 36 L160 36 L160 64 L186 64 L186 92 L205 92 L205 36 L232 36 L232 64 L260 64 L260 36 L280 36"
                      fill="none" stroke={c.mute} strokeWidth="0.8" opacity="0.6" />
                  </svg>
                </div>
              </div>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                marginLeft: 44, marginTop: 6,
              }}>
                {stageHours.map(h => (
                  <span key={h} style={{ fontFamily: ACFonts.mono, fontSize: 9, color: c.mute, letterSpacing: 0.5 }}>{h}</span>
                ))}
              </div>

              <div style={{
                marginTop: 16, paddingTop: 14,
                borderTop: `1px solid ${c.hair}`,
                display: 'grid', gridTemplateColumns: `repeat(${_legend.length}, 1fr)`, gap: 0,
              }}>
                {_legend.map((s, i) => {
                  const { col, op } = legendColor(s.k);
                  return (
                    <div key={i} style={{
                      paddingLeft: i === 0 ? 0 : 10,
                      borderLeft: i === 0 ? 'none' : `1px solid ${c.hair}`,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <div style={{ width: 6, height: 6, background: col, opacity: op }} />
                        <span style={{ fontFamily: ACFonts.mono, fontSize: 9, color: c.dim, letterSpacing: 0.5 }}>{s.k}</span>
                      </div>
                      <div style={{
                        fontFamily: ACFonts.display, fontSize: 15, fontWeight: 700,
                        color: c.fg, marginTop: 4, fontVariantNumeric: 'tabular-nums',
                      }}>{s.v}</div>
                      <div style={{ fontFamily: ACFonts.mono, fontSize: 9, color: c.mute, marginTop: 1 }}>{s.sub}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Signals during night */}
            <div style={{
              marginTop: 14, display: 'grid',
              gridTemplateColumns: '1fr 1fr', gap: 10,
            }}>
              {_signals.map((m, i) => {
                const maxVal = Math.max(...m.data.map(Math.abs), 0.001);
                const normalized = m.data.map(v => (v / maxVal) * 80 + 10);
                return (
                  <div key={i} style={{
                    padding: 14, background: c.card, borderRadius: ACRadii.card,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <ACLabel size={9} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>{m.k}</ACLabel>
                      <ACLabel size={9} color={c.accent} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.3, fontWeight: 700 }}>{m.trend}</ACLabel>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 6 }}>
                      <ACNum size={24} color={c.fg} weight={700}>{m.v}</ACNum>
                      <span style={{ fontFamily: ACFonts.mono, fontSize: 10, color: c.dim }}>{m.u}</span>
                    </div>
                    <div style={{ marginTop: 6 }}>
                      <ACSpark w={130} h={20} dark={dark} data={normalized} stroke={1.4} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Coach takeaway */}
            <div style={{
              marginTop: 16, padding: 18,
              background: c.card, borderRadius: ACRadii.card,
              borderLeft: `3px solid ${c.accent}`,
            }}>
              <ACLabel size={10} color={c.accent} style={{ fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' }}>
                Coach take
              </ACLabel>
              <div style={{ marginTop: 8, fontSize: 13.5, color: c.fg, lineHeight: 1.55 }}>
                {coachNote}
              </div>
            </div>
          </>
        )}
      </div>

      {showTabBar ? <ACTabBar active="body" dark={dark} HeartMarkComp={HeartMark} /> : null}
    </div>
  );
}
