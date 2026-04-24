import React from 'react';
import { ACFonts, ACBtn, useACT } from '../lib/paper.jsx';

export default function S84b_Server_Error_Compact({ dark = false }) {
  const c = useACT(dark);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: c.bg, alignItems: 'center', justifyContent: 'center', padding: 22 }}>
      <div style={{ fontFamily: ACFonts.display, fontSize: 96, fontWeight: 800, letterSpacing: -4, color: c.fg, lineHeight: 0.9 }}>500</div>
      <svg viewBox="0 0 200 20" style={{ width: 200, height: 14, marginTop: 10 }}><line x1="0" y1="10" x2="200" y2="10" stroke={c.fg} strokeWidth="1.5" strokeDasharray="5 5" opacity="0.4" /></svg>
      <div style={{ marginTop: 16, fontFamily: ACFonts.display, fontSize: 22, fontWeight: 700, letterSpacing: -0.6, textAlign: 'center', color: c.fg, lineHeight: 1.2 }}>Something broke<br />on our side.</div>
      <div style={{ marginTop: 10, fontFamily: ACFonts.mono, fontSize: 10, color: c.mute, letterSpacing: 1.4, textTransform: 'uppercase' }}>ref · ax-3f91</div>
      <div style={{ marginTop: 24, width: '100%', maxWidth: 260, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <ACBtn primary block dark={dark} size="md" pill>Try again</ACBtn>
        <ACBtn block dark={dark} size="sm" pill>Status page</ACBtn>
      </div>
    </div>
  );
}

