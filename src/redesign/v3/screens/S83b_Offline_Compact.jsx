import React from 'react';
import { ACFonts, ACBtn, useACT } from '../lib/paper.jsx';

export default function S83b_Offline_Compact({ dark = false }) {
  const c = useACT(dark);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: c.bg, alignItems: 'center', justifyContent: 'center', padding: 22 }}>
      <div style={{ width: 56, height: 56, display: 'grid', placeItems: 'center', background: c.card, borderRadius: '50%' }}>
        <svg viewBox="0 0 40 40" style={{ width: 32, height: 32 }}><circle cx="20" cy="20" r="14" fill="none" stroke={c.dim} strokeWidth="2" /><line x1="8" y1="8" x2="32" y2="32" stroke="#d64545" strokeWidth="2.5" /></svg>
      </div>
      <div style={{ marginTop: 20, fontFamily: ACFonts.display, fontSize: 28, fontWeight: 700, letterSpacing: -0.8, textAlign: 'center', color: c.fg, lineHeight: 1.1 }}>No connection.</div>
      <div style={{ marginTop: 8, fontSize: 13, color: c.dim, textAlign: 'center', maxWidth: 240, lineHeight: 1.5 }}>Everything saves locally. We'll catch up when you're back online.</div>
      <div style={{ marginTop: 24, fontFamily: ACFonts.mono, fontSize: 10, color: c.mute, letterSpacing: 1.4, textTransform: 'uppercase' }}>12 items queued</div>
      <div style={{ marginTop: 18, width: '100%', maxWidth: 260 }}><ACBtn primary block dark={dark} size="md" pill>Retry</ACBtn></div>
    </div>
  );
}

