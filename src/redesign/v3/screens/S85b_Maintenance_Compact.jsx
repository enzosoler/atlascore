import React from 'react';
import { ACFonts, ACBtn, useACT } from '../lib/paper.jsx';

export default function S85b_Maintenance_Compact({ dark = false }) {
  const c = useACT(dark);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: c.bg, alignItems: 'center', justifyContent: 'center', padding: 22 }}>
      <div style={{ width: 56, height: 56, background: c.accent, display: 'grid', placeItems: 'center', color: c.ink, fontFamily: ACFonts.display, fontSize: 28, fontWeight: 800 }}>✕</div>
      <div style={{ marginTop: 20, fontFamily: ACFonts.display, fontSize: 30, fontWeight: 700, letterSpacing: -0.9, textAlign: 'center', color: c.fg, lineHeight: 1.05 }}>Back at 4:30 am.</div>
      <div style={{ marginTop: 10, fontSize: 13, color: c.dim, textAlign: 'center', maxWidth: 260, lineHeight: 1.5 }}>We're upgrading the coach model. On-device features still work.</div>
      <div style={{ marginTop: 22, padding: '10px 16px', border: `1px solid ${c.hair}`, fontFamily: ACFonts.mono, fontSize: 10.5, letterSpacing: 1.2, color: c.dim, textTransform: 'uppercase' }}>est · 0h 58m</div>
      <div style={{ marginTop: 18, width: '100%', maxWidth: 260 }}><ACBtn primary block dark={dark} size="md" pill>Keep logging</ACBtn></div>
    </div>
  );
}

