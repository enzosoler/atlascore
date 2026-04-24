import React from 'react';
import { ACFonts, ACRadii, ACLabel, ACBtn, ACNum, useACT } from '../lib/paper.jsx';

export default function S72_Returning_User({ dark = false }) {
  const c = useACT(dark);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 2, textTransform: 'uppercase' }}>/// Welcome back</ACLabel>
        <ACLabel size={12} color={c.dim}>Sign out</ACLabel>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '28px 28px 16px' }}>
        <ACLabel size={12} color={c.accent} style={{ fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>Picking up where you left off</ACLabel>
        <div style={{ marginTop: 10, fontFamily: ACFonts.display, fontSize: 32, fontWeight: 700, letterSpacing: -1, lineHeight: 1.05, color: c.fg }}>Jordan — your<br />data is still here.</div>
        <div style={{ marginTop: 10, fontSize: 14, color: c.dim, lineHeight: 1.5 }}>You cancelled <span style={{ color: c.fg, fontWeight: 600 }}>68 days ago</span>. Everything we logged for you is intact.</div>
        <div style={{ marginTop: 26, padding: 18, background: c.card, borderRadius: ACRadii.card }}>
          <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 1.6, textTransform: 'uppercase' }}>your archive</ACLabel>
          <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[
              ['sessions', '128'], ['prs · 4 big', '17'], ['meals', '1,842'],
              ['lab panels', '3'], ['photos', '24'], ['coach msgs', '312'],
            ].map(([k, v]) => (
              <div key={k}><ACNum size={22} color={c.fg} weight={700}>{v}</ACNum><div style={{ fontSize: 11, color: c.dim, fontFamily: ACFonts.mono, letterSpacing: 1.4, textTransform: 'uppercase', marginTop: 2 }}>{k}</div></div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 18, padding: '16px 18px', borderLeft: `2px solid ${c.accent}`, background: `${c.accent}14` }}>
          <ACLabel size={10} color={c.accent} style={{ fontFamily: ACFonts.mono, letterSpacing: 1.6, textTransform: 'uppercase' }}>since you've been gone</ACLabel>
          <div style={{ marginTop: 8, fontSize: 13.5, lineHeight: 1.55, color: c.fg }}>Coach got smarter. We shipped protocols, a watch companion, and crew. Labs now accept Function Health directly.</div>
        </div>
        <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ padding: 16, background: c.card, borderRadius: ACRadii.card, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 36, height: 36, background: c.fg, color: c.bg, display: 'grid', placeItems: 'center', fontFamily: ACFonts.mono, fontSize: 13, fontWeight: 700 }}>▶</div>
            <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 600 }}>Resume where I left off</div><div style={{ fontSize: 12, color: c.dim, marginTop: 2 }}>Recomp · week 04 · Tuesday push</div></div>
          </div>
          <div style={{ padding: 16, border: `1px solid ${c.fg}18`, borderRadius: ACRadii.card, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 36, height: 36, border: `1px solid ${c.fg}30`, display: 'grid', placeItems: 'center', fontFamily: ACFonts.mono, fontSize: 12 }}>↻</div>
            <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 600 }}>Reassess — a lot has changed</div><div style={{ fontSize: 12, color: c.dim, marginTop: 2 }}>3-step recheck · 2 min</div></div>
          </div>
        </div>
      </div>
      <div style={{ padding: '14px 28px 26px', background: c.bg }}>
        <ACBtn primary block dark={dark} size="lg" pill>Resume recomp →</ACBtn>
        <div style={{ textAlign: 'center', paddingTop: 10 }}><ACLabel size={12} color={c.dim}>Need to export + delete instead?</ACLabel></div>
      </div>
    </div>
  );
}

