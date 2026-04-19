import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACNum, ACBtn,
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

function S7_Onboard_Identity({ dark = false, onContinue }) {
  const c = useACT(dark);
  const [sex, setSex] = React.useState('male');
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      <OBHeader step={1} total={10} dark={dark} onBack={false} />

      <div style={{ flex: 1, overflow: 'auto', padding: '28px 28px 16px' }}>
        <ACLabel size={12} color={c.accent} style={{ fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>About you</ACLabel>
        <div style={{
          marginTop: 10, fontFamily: ACFonts.display, fontSize: 32, fontWeight: 700,
          letterSpacing: -1, lineHeight: 1.05, color: c.fg,
        }}>
          Let's get the<br/>basics right.
        </div>
        <div style={{ marginTop: 10, fontSize: 14, color: c.dim, lineHeight: 1.5 }}>
          Used for calorie + macro targets. Never shared.
        </div>

        <div style={{ marginTop: 34 }}>
          <ACLabel size={12} color={c.dim}>Sex at birth</ACLabel>
          <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
            {['male', 'female'].map(k => {
              const on = sex === k;
              return (
                <button key={k} type="button" onClick={() => setSex(k)} style={{
                  flex: 1, padding: '16px 0', textAlign: 'center',
                  borderRadius: ACRadii.input,
                  background: on ? c.fg : c.card,
                  color: on ? c.bg : c.fg,
                  fontSize: 15, fontWeight: 600, textTransform: 'capitalize',
                  cursor: 'pointer', border: 'none',
                }}>{k}</button>
              );
            })}
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <ACLabel size={12} color={c.dim}>Age</ACLabel>
          <div style={{
            marginTop: 10, padding: '16px 18px', background: c.card,
            borderRadius: ACRadii.input, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
          }}>
            <ACNum size={30} color={c.fg} weight={700}>32</ACNum>
            <ACLabel size={12} color={c.dim}>years</ACLabel>
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <ACLabel size={12} color={c.dim}>Height</ACLabel>
          <div style={{
            marginTop: 10, padding: '16px 18px', background: c.card,
            borderRadius: ACRadii.input, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
          }}>
            <div>
              <ACNum size={30} color={c.fg} weight={700}>5</ACNum>
              <span style={{ fontSize: 13, color: c.dim, marginLeft: 3 }}>ft</span>
              <span style={{ marginLeft: 14 }}>
                <ACNum size={30} color={c.fg} weight={700}>11</ACNum>
                <span style={{ fontSize: 13, color: c.dim, marginLeft: 3 }}>in</span>
              </span>
            </div>
            <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.mono }}>180 cm</ACLabel>
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 28px 26px', background: c.bg }}>
        <ACBtn primary block dark={dark} size="lg" pill onClick={onContinue}>Continue →</ACBtn>
      </div>
    </div>
  );
}

export default S7_Onboard_Identity;
