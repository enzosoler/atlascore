import React from 'react';
import { ACFonts, ACLabel, ACBtn, ACNum, useACT } from '../lib/paper.jsx';

export default function S74_Invite({ dark = false }) {
  const c = useACT(dark);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: c.bg }}>
      <div style={{ background: c.fg, color: c.bg, padding: '20px 26px 28px', position: 'relative', overflow: 'hidden' }}>
        <svg width="100%" height="60" viewBox="0 0 320 60" style={{ position: 'absolute', inset: 'auto 0 0 0', opacity: 0.06 }} preserveAspectRatio="none"><path d="M0 30 L60 30 L72 10 L84 50 L96 30 L160 30 L172 14 L184 46 L196 30 L320 30" stroke={c.bg} strokeWidth="2" fill="none" /></svg>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <ACLabel size={10} color={`${c.bg}80`} style={{ fontFamily: ACFonts.mono, letterSpacing: 2, textTransform: 'uppercase' }}>/// Invite · #AK-248</ACLabel>
          <ACLabel size={12} color={`${c.bg}70`}>Close</ACLabel>
        </div>
        <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 52, height: 52, background: c.accent, color: c.fg, display: 'grid', placeItems: 'center', fontFamily: ACFonts.display, fontSize: 20, fontWeight: 800 }}>AK</div>
          <div><div style={{ fontSize: 13, color: `${c.bg}90` }}>Invited by</div><div style={{ fontSize: 17, fontWeight: 700, color: c.bg, letterSpacing: -0.3 }}>A. Kimura</div></div>
        </div>
        <div style={{ marginTop: 22, fontFamily: ACFonts.display, fontSize: 30, fontWeight: 800, letterSpacing: -1.1, lineHeight: 1.05, color: c.bg }}>"Train with me.<br /><span style={{ color: c.accent }}>60 days free.</span>"</div>
      </div>
      <div style={{ padding: '22px 26px 10px' }}>
        <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 1.6, textTransform: 'uppercase' }}>AK · last 90 days</ACLabel>
        <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {[['PRs', '12'], ['tonnes', '84.2k'], ['readiness', '82']].map(([k, v]) => (
            <div key={k} style={{ padding: '12px 10px', border: `1px solid ${c.fg}14` }}><ACNum size={22} color={c.fg} weight={700}>{v}</ACNum><div style={{ fontSize: 10, color: c.dim, fontFamily: ACFonts.mono, letterSpacing: 1.4, textTransform: 'uppercase', marginTop: 2 }}>{k}</div></div>
          ))}
        </div>
      </div>
      <div style={{ padding: '16px 26px 10px', flex: 1 }}>
        <ACLabel size={10} color={c.accent} style={{ fontFamily: ACFonts.mono, letterSpacing: 1.6, textTransform: 'uppercase' }}>what you both get</ACLabel>
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            ['You', '60 days Pro · free', 'No card now. No trial limits.'],
            ['Aoi', 'One month added', 'Applied automatically to her plan.'],
            ['Both', 'Auto-crewed', 'You train alongside by default.'],
          ].map(([k, v, sub]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ width: 28, height: 28, background: c.fg, color: c.bg, display: 'grid', placeItems: 'center', fontFamily: ACFonts.mono, fontSize: 10, fontWeight: 700, letterSpacing: 0.6 }}>{k}</div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 600, color: c.fg }}>{v}</div><div style={{ fontSize: 12, color: c.dim, marginTop: 2 }}>{sub}</div></div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '14px 26px 26px', background: c.bg }}>
        <ACBtn primary block dark={dark} size="lg" pill>Start 60 days — no card →</ACBtn>
        <div style={{ textAlign: 'center', paddingTop: 10 }}><ACLabel size={11} color={c.dim}>Invite expires in 7 days · terms</ACLabel></div>
      </div>
    </div>
  );
}

