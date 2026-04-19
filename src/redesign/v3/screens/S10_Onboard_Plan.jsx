import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACNum, ACBtn, ACSpark,
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

function S10_Onboard_Plan({ dark = false, onBack, onContinue }) {
  const c = useACT(dark);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      <OBHeader step={4} total={10} dark={dark} onBack={onBack} />

      <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px 16px' }}>
        <ACLabel size={12} color={c.accent} style={{ fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>Your plan</ACLabel>
        <div style={{
          marginTop: 10, fontFamily: ACFonts.display, fontSize: 32, fontWeight: 700,
          letterSpacing: -1, lineHeight: 1.05, color: c.fg,
        }}>
          Here's your<br/>
          <span style={{ background: c.accent, color: c.ink, padding: '0 10px', borderRadius: 8 }}>daily core</span>.
        </div>

        <div style={{
          marginTop: 28, padding: 22, background: c.fg, color: c.bg, borderRadius: ACRadii.card,
        }}>
          <ACLabel size={11} color={c.accent} style={{ fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase' }}>Calories · daily</ACLabel>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
            <ACNum size={72} color={c.bg} weight={700}>2,380</ACNum>
            <ACLabel size={13} color="rgba(239,233,218,0.6)">kcal</ACLabel>
          </div>
          <ACLabel size={11} color="rgba(239,233,218,0.55)" style={{ marginTop: 2 }}>
            400 kcal deficit · 0.8 lb / wk
          </ACLabel>

          <div style={{ marginTop: 18, height: 1, background: 'rgba(239,233,218,0.12)' }} />

          <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {[
              { l: 'Protein', v: '186', u: 'g', p: 0.31, pct: '31%' },
              { l: 'Carbs',   v: '286', u: 'g', p: 0.48, pct: '48%' },
              { l: 'Fat',     v: '79',  u: 'g',  p: 0.21, pct: '21%' },
            ].map((m, i) => (
              <div key={i}>
                <ACLabel size={11} color="rgba(239,233,218,0.55)">{m.l}</ACLabel>
                <div style={{ marginTop: 6 }}>
                  <ACNum size={26} color={c.bg} weight={700}>{m.v}</ACNum>
                  <span style={{ fontSize: 11, color: 'rgba(239,233,218,0.55)', marginLeft: 3 }}>{m.u}</span>
                </div>
                <ACLabel size={10} color={c.accent} style={{ fontWeight: 600, marginTop: 2 }}>{m.pct}</ACLabel>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          marginTop: 14, padding: 18, background: c.card, borderRadius: ACRadii.card,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <ACLabel size={11} color={c.dim}>Training</ACLabel>
              <div style={{ marginTop: 4, fontSize: 15, fontWeight: 600, color: c.fg }}>
                4 days / week
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <ACLabel size={11} color={c.dim}>Target</ACLabel>
              <div style={{ marginTop: 4, fontSize: 15, fontWeight: 600, color: c.fg }}>
                175 lb by Jul
              </div>
            </div>
          </div>
          <ACSpark w={272} h={30} dark={dark} stroke={2} />
          <ACLabel size={11} color={c.mute} style={{ marginTop: 8 }}>
            Expected body composition curve · 12 weeks
          </ACLabel>
        </div>

        <div style={{ marginTop: 16, padding: '14px 16px', borderRadius: ACRadii.card, border: `1px dashed ${c.faint}` }}>
          <ACLabel size={12} color={c.dim} style={{ lineHeight: 1.5, display: 'block' }}>
            atlas.core recalibrates weekly from your weight trend, logs, and readiness.
          </ACLabel>
        </div>
      </div>

      <div style={{ padding: '14px 28px 26px', background: c.bg }}>
        <ACBtn primary block dark={dark} size="lg" pill onClick={onContinue}>Looks good →</ACBtn>
      </div>
    </div>
  );
}

export default S10_Onboard_Plan;
