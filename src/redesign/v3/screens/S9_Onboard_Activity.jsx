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

function S9_Onboard_Activity({ dark = false, onBack, onContinue, onChange, value }) {
  const c = useACT(dark);
  const [lvl, setLvl] = React.useState(value?.activity || 3);
  const levels = [
    { k: 1, t: 'Sedentary',   d: 'Desk-bound, little movement',          mult: '1.2×' },
    { k: 2, t: 'Light',       d: '1–2 training days / week',             mult: '1.38×' },
    { k: 3, t: 'Moderate',    d: '3–4 training days / week',             mult: '1.55×' },
    { k: 4, t: 'Active',      d: '5–6 training days / week',             mult: '1.73×' },
    { k: 5, t: 'Athletic',    d: 'Daily + physical job',                 mult: '1.9×' },
  ];
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      <OBHeader step={3} total={10} dark={dark} onBack={onBack} />

      <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px 16px' }}>
        <ACLabel size={12} color={c.accent} style={{ fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>Activity</ACLabel>
        <div style={{
          marginTop: 10, fontFamily: ACFonts.display, fontSize: 32, fontWeight: 700,
          letterSpacing: -1, lineHeight: 1.05, color: c.fg,
        }}>
          How hard<br/>do you train?
        </div>
        <div style={{ marginTop: 10, fontSize: 14, color: c.dim }}>
          We'll tune calorie burn from this and refine it with your logs.
        </div>

        <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {levels.map(l => {
            const on = lvl === l.k;
            return (
              <button key={l.k} type="button" onClick={() => { setLvl(l.k); onChange?.({ activity: l.k }); }} style={{
                padding: '16px 18px', borderRadius: ACRadii.input,
                background: on ? c.fg : 'transparent',
                color: on ? c.bg : c.fg,
                border: on ? 'none' : `1px solid ${c.hair}`,
                marginBottom: 6,
                display: 'flex', alignItems: 'center', gap: 14,
                cursor: 'pointer', width: '100%', textAlign: 'left',
              }}>
                <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 22 }}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} style={{
                      width: 4, borderRadius: 1.5,
                      height: 6 + i * 3.2,
                      background: i <= l.k
                        ? (on ? c.accent : c.fg)
                        : (on ? 'rgba(239,233,218,0.22)' : c.faint),
                    }} />
                  ))}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{l.t}</div>
                  <div style={{ fontSize: 12, opacity: 0.55, marginTop: 2 }}>{l.d}</div>
                </div>
                <ACLabel size={11} color={on ? c.accent : c.dim} style={{ fontFamily: ACFonts.mono, fontWeight: 600 }}>{l.mult}</ACLabel>
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

export default S9_Onboard_Activity;
