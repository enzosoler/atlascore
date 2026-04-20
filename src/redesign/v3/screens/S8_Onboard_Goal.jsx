import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACBtn,
} from '../lib/paper.jsx';

function OBHeader({ step, total, dark, onBack = true }) {
  const c = useACT(dark);
  return (
    <div style={{ padding: '14px 22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      {onBack ? (
        <button type="button" onClick={typeof onBack === 'function' ? onBack : undefined} style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M7 1L3 5l4 4" stroke={c.fg} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      ) : <div style={{ width: 28 }} />}
      <div style={{ flex: 1, margin: '0 14px', display: 'flex', gap: 4 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i < step ? c.accent : (i === step ? c.fg : c.faint),
          }} />
        ))}
      </div>
      <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.body, fontWeight: 600 }}>{step}/{total}</ACLabel>
    </div>
  );
}

function TrendIcon({ k, color, size = 28 }) {
  if (k === 'down') return <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
    <path d="M4 10l8 6 6-4 6 8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M24 20v-6h-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>;
  if (k === 'up') return <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
    <path d="M4 20l8-6 6 4 6-8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M24 8v6h-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>;
  return <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
    <path d="M4 14h20" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M18 9l5 5-5 5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>;
}

function S8_Onboard_Goal({ dark = false, onBack, onContinue, onChange, value }) {
  const c = useACT(dark);
  const [goal, setGoal] = React.useState(value?.goal || 'recomp');
  const goals = [
    { k: 'lose',     t: 'Lose fat',        d: 'Cut body fat, hold strength',      trend: 'down' },
    { k: 'recomp',   t: 'Recomp',          d: 'Replace fat with muscle',          trend: 'level' },
    { k: 'maintain', t: 'Maintain',        d: 'Hold weight, optimize readiness',  trend: 'level' },
    { k: 'gain',     t: 'Build muscle',    d: 'Lean bulk, track PRs',             trend: 'up' },
  ];
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      <OBHeader step={2} total={10} dark={dark} onBack={onBack} />

      <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px 16px' }}>
        <ACLabel size={12} color={c.accent} style={{ fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>Your goal</ACLabel>
        <div style={{
          marginTop: 10, fontFamily: ACFonts.display, fontSize: 32, fontWeight: 700,
          letterSpacing: -1, lineHeight: 1.05, color: c.fg,
        }}>
          What are we<br/>building toward?
        </div>

        <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {goals.map(g => {
            const on = goal === g.k;
            return (
              <button key={g.k} type="button" onClick={() => { setGoal(g.k); onChange?.({ goal: g.k }); }} style={{
                padding: 18, borderRadius: ACRadii.card,
                background: on ? c.fg : c.card,
                color: on ? c.bg : c.fg,
                display: 'flex', alignItems: 'center', gap: 14,
                cursor: 'pointer', border: 'none', width: '100%', textAlign: 'left',
              }}>
                <TrendIcon k={g.trend} color={on ? c.accent : c.fg} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: -0.2 }}>{g.t}</div>
                  <div style={{ fontSize: 12, marginTop: 3, opacity: on ? 0.6 : 0.55 }}>{g.d}</div>
                </div>
                <div style={{
                  width: 20, height: 20, borderRadius: 999,
                  border: `1.8px solid ${on ? c.accent : c.faint}`,
                  background: on ? c.accent : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {on && <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5l2 2 4-4" stroke={c.ink} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '14px 28px 26px', background: c.bg }}>
        <ACBtn primary block dark={dark} size="lg" pill onClick={onContinue}>Continue →</ACBtn>
      </div>
    </div>
  );
}

export default S8_Onboard_Goal;
