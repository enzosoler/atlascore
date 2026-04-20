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

function S7_Onboard_Identity({ dark = false, onContinue, onBack, onChange, value }) {
  const c = useACT(dark);
  const [sex, setSex] = React.useState(value?.sex || 'male');
  const [ageRaw, setAgeRaw] = React.useState(value?.age ? String(value.age) : '');
  const [heightCmRaw, setHeightCmRaw] = React.useState(value?.heightCm ? String(value.heightCm) : '');

  const age = parseInt(ageRaw) || 0;
  const heightCm = parseInt(heightCmRaw) || 0;
  const heightFt = Math.floor(heightCm / 30.48);
  const heightIn = Math.round((heightCm - heightFt * 30.48) / 2.54);
  const canContinue = age >= 13 && age <= 120 && heightCm >= 100 && heightCm <= 250;

  function emit(patch) {
    onChange?.({ sex, age: parseInt(ageRaw) || 0, heightCm: parseInt(heightCmRaw) || 0, ...patch });
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      <OBHeader step={1} total={10} dark={dark} onBack={onBack || false} />

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
                <button key={k} type="button" onClick={() => { setSex(k); emit({ sex: k }); }} style={{
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
            marginTop: 10, padding: '12px 18px', background: c.card,
            borderRadius: ACRadii.input, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
          }}>
            <input
              type="text"
              inputMode="numeric"
              placeholder="28"
              value={ageRaw}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '').slice(0, 3);
                setAgeRaw(v);
                emit({ age: parseInt(v) || 0 });
              }}
              style={{
                fontFamily: ACFonts.display, fontSize: 30, fontWeight: 700,
                color: c.fg, background: 'transparent', border: 'none', outline: 'none',
                width: 80, padding: 0, fontVariantNumeric: 'tabular-nums',
              }}
            />
            <ACLabel size={12} color={c.dim}>years</ACLabel>
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <ACLabel size={12} color={c.dim}>Height</ACLabel>
          <div style={{
            marginTop: 10, padding: '12px 18px', background: c.card,
            borderRadius: ACRadii.input, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <input
                type="text"
                inputMode="numeric"
                placeholder="180"
                value={heightCmRaw}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '').slice(0, 3);
                  setHeightCmRaw(v);
                  emit({ heightCm: parseInt(v) || 0 });
                }}
                style={{
                  fontFamily: ACFonts.display, fontSize: 30, fontWeight: 700,
                  color: c.fg, background: 'transparent', border: 'none', outline: 'none',
                  width: 60, padding: 0, fontVariantNumeric: 'tabular-nums',
                }}
              />
              <span style={{ fontSize: 13, color: c.dim }}>cm</span>
            </div>
            {heightCm >= 100 && (
              <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.mono }}>
                {heightFt}'{heightIn}"
              </ACLabel>
            )}
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 28px 26px', background: c.bg }}>
        <ACBtn
          primary block dark={dark} size="lg" pill
          onClick={canContinue ? onContinue : undefined}
          style={{ opacity: canContinue ? 1 : 0.4, pointerEvents: canContinue ? 'auto' : 'none' }}
        >
          Continue →
        </ACBtn>
      </div>
    </div>
  );
}

export default S7_Onboard_Identity;
