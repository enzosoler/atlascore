import React from 'react';
import { ACFonts, ACRadii, useACT, ACLabel, ACNum, ACSpark } from '../lib/paper.jsx';

export default function S3_Workout_B({ dark = false }) {
  const c = useACT(dark);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: c.fg, color: c.bg }}>
      <div style={{ padding: '14px 22px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <ACLabel size={11} color="rgba(239,233,218,0.5)">Rest · between sets</ACLabel>
        <ACLabel size={11} color="rgba(239,233,218,0.5)">Back squat · Set 4/6</ACLabel>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '0 28px' }}>
        <ACLabel size={12} color={c.accent} style={{ fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>Recover · breathe</ACLabel>
        <div style={{ fontFamily: ACFonts.display, fontSize: 180, fontWeight: 700, letterSpacing: -8, lineHeight: 0.9, color: c.bg, marginTop: 16, fontVariantNumeric: 'tabular-nums' }}>
          1<span style={{ color: c.accent }}>:</span>42
        </div>
        <ACLabel size={12} color="rgba(239,233,218,0.5)" style={{ marginTop: 6 }}>of 2:30 programmed</ACLabel>
        <div style={{ marginTop: 40, width: '100%' }}>
          <ACSpark w={312} h={44} stroke={2.6} dark color={c.accent} />
        </div>
        <div style={{ marginTop: 44, width: '100%', borderRadius: ACRadii.card, border: '1px solid rgba(239,233,218,0.12)', padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <ACLabel size={11} color="rgba(239,233,218,0.5)">Up next · Set 4</ACLabel>
            <ACLabel size={11} color={c.accent} style={{ fontWeight: 600 }}>+10 lb</ACLabel>
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'baseline' }}>
            <div><ACNum size={52} color={c.bg} weight={700}>225</ACNum><ACLabel size={10} color="rgba(239,233,218,0.5)" style={{ marginLeft: 4 }}>lb</ACLabel></div>
            <div style={{ width: 1, height: 40, background: 'rgba(239,233,218,0.12)' }} />
            <div><ACNum size={52} color={c.bg} weight={700}>5</ACNum><ACLabel size={10} color="rgba(239,233,218,0.5)" style={{ marginLeft: 4 }}>rep</ACLabel></div>
            <div style={{ width: 1, height: 40, background: 'rgba(239,233,218,0.12)' }} />
            <div><ACNum size={52} color={c.accent} weight={700}>8</ACNum><ACLabel size={10} color="rgba(239,233,218,0.5)" style={{ marginLeft: 4 }}>rpe</ACLabel></div>
          </div>
        </div>
      </div>
      <div style={{ padding: 22, display: 'flex', gap: 10 }}>
        <div style={{ flex: 1, padding: '15px 0', textAlign: 'center', borderRadius: 999, border: '1px solid rgba(239,233,218,0.22)', color: c.bg, fontSize: 15, fontWeight: 600 }}>+ 30s</div>
        <div style={{ flex: 2, padding: '15px 0', textAlign: 'center', borderRadius: 999, background: c.accent, color: c.ink, fontSize: 16, fontWeight: 600 }}>Skip rest →</div>
      </div>
    </div>
  );
}

