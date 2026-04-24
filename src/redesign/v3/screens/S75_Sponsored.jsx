import React from 'react';
import { ACFonts, ACRadii, ACLabel, ACBtn, useACT } from '../lib/paper.jsx';

export default function S75_Sponsored({ dark = false }) {
  const c = useACT(dark);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 2, textTransform: 'uppercase' }}>/// Sponsored</ACLabel>
        <ACLabel size={12} color={c.dim}>Cancel</ACLabel>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '22px 28px 16px' }}>
        <div style={{ padding: '14px 16px', border: `1.5px solid ${c.fg}`, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, background: c.fg, color: c.bg, display: 'grid', placeItems: 'center', fontFamily: ACFonts.display, fontSize: 14, fontWeight: 800 }}>N</div>
          <div style={{ flex: 1 }}><div style={{ fontSize: 10, fontFamily: ACFonts.mono, letterSpacing: 1.6, textTransform: 'uppercase', color: c.dim }}>your employer</div><div style={{ fontSize: 14, fontWeight: 700, color: c.fg, marginTop: 2 }}>Nocturne Holdings</div></div>
          <div style={{ padding: '4px 8px', background: c.accent, color: c.fg, fontFamily: ACFonts.mono, fontSize: 9, letterSpacing: 1.4, fontWeight: 700 }}>VERIFIED</div>
        </div>
        <div style={{ marginTop: 24 }}>
          <ACLabel size={12} color={c.accent} style={{ fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>Covered in full</ACLabel>
          <div style={{ marginTop: 10, fontFamily: ACFonts.display, fontSize: 30, fontWeight: 700, letterSpacing: -1, lineHeight: 1.05, color: c.fg }}>atlas.core Pro<br />is <span style={{ color: c.accent }}>a benefit.</span></div>
          <div style={{ marginTop: 10, fontSize: 14, color: c.dim, lineHeight: 1.55 }}>Nocturne pays for your Pro subscription. Your data stays with you — never visible to HR, never sold.</div>
        </div>
        <div style={{ marginTop: 22, background: c.card, borderRadius: ACRadii.card, overflow: 'hidden' }}>
          {[
            ['Pro subscription', 'Full · $0/mo'],
            ['Lab panel · yearly', 'Included'],
            ['AI coach', 'Unlimited'],
            ['Function Health', '84 markers'],
          ].map(([k, v], i, arr) => (
            <div key={k} style={{ padding: '13px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: i < arr.length - 1 ? `1px solid ${c.fg}08` : 'none' }}>
              <span style={{ fontSize: 13.5, color: c.fg }}>{k}</span>
              <span style={{ fontFamily: ACFonts.mono, fontSize: 11, color: c.fg, letterSpacing: 1.2, textTransform: 'uppercase' }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 18, padding: '14px 16px', borderLeft: `2px solid ${c.accent}`, background: `${c.accent}10` }}>
          <ACLabel size={10} color={c.accent} style={{ fontFamily: ACFonts.mono, letterSpacing: 1.6, textTransform: 'uppercase' }}>privacy · no exceptions</ACLabel>
          <div style={{ marginTop: 8, fontSize: 13, lineHeight: 1.55, color: c.fg }}>Nocturne receives <span style={{ fontWeight: 700 }}>enrollment status only</span>. No weight, no labs, no activity — ever.</div>
        </div>
        <div style={{ marginTop: 20, padding: '12px 14px', border: `1px dashed ${c.fg}24` }}>
          <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 1.6, textTransform: 'uppercase' }}>next · verify</ACLabel>
          <div style={{ marginTop: 6, fontSize: 13, color: c.fg }}>Enter your work email to confirm eligibility.</div>
        </div>
      </div>
      <div style={{ padding: '14px 28px 26px', background: c.bg }}>
        <ACBtn primary block dark={dark} size="lg" pill>Verify with work email →</ACBtn>
        <div style={{ textAlign: 'center', paddingTop: 10 }}><ACLabel size={12} color={c.dim}>Not eligible? Start a personal plan</ACLabel></div>
      </div>
    </div>
  );
}

