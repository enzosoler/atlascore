import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACBtn, ACMono,
} from '../lib/paper.jsx';

export default function S91_Forgot({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:c.bg }}>
      <div style={{ padding:'14px 22px 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <ACLabel size={13} color={c.dim}>← Sign in</ACLabel>
        <ACLabel size={12} color={c.dim}>Help</ACLabel>
      </div>

      <div style={{ flex:1, padding:'34px 22px 16px', display:'flex', flexDirection:'column' }}>
        <ACMono size={10} color={c.accent} track={1.8} style={{ textTransform:'uppercase', fontWeight:600 }}>/// locked out</ACMono>
        <div style={{ marginTop:8, fontFamily:ACFonts.display, fontSize:34, fontWeight:800, letterSpacing:-1.2, lineHeight:0.95, color:c.fg }}>
          No password<br/>to forget.
        </div>
        <div style={{ marginTop:12, fontSize:13.5, color:c.dim, lineHeight:1.55 }}>
          atlas.core doesn't use passwords. If you can't access your email, tell us how to reach you and we'll verify another way.
        </div>

        <div style={{ marginTop:30 }}>
          <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>account email</ACMono>
          <div style={{ marginTop:6, borderBottom:`2px solid ${c.fg}`, paddingBottom:8 }}>
            <span style={{ fontFamily:ACFonts.display, fontSize:20, fontWeight:600, color:c.fg }}>jordan@figma.com</span>
          </div>
        </div>

        <div style={{ marginTop:26, display:'flex', flexDirection:'column', gap:10 }}>
          <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>instead, verify via</ACMono>
          {[
            { k:'sms',   l:'Text to ••• ••• 4412', avail:true },
            { k:'apple', l:'Apple ID · Jordan Kim',  avail:true },
            { k:'sup',   l:'Contact support',        avail:false },
          ].map(p => (
            <div key={p.k} style={{
              padding:'14px 14px', background:c.card, borderRadius:ACRadii.card,
              display:'flex', alignItems:'center', gap:12,
              borderLeft: p.avail ? `3px solid ${c.accent}` : '3px solid transparent',
              opacity: p.avail ? 1 : 0.6,
            }}>
              <div style={{
                width:32, height:32, background:c.ink, color:c.accent,
                display:'grid', placeItems:'center', fontFamily:ACFonts.mono, fontSize:11, fontWeight:700,
              }}>{p.k.slice(0,2).toUpperCase()}</div>
              <div style={{ flex:1, fontSize:13.5, fontWeight:600, color:c.fg }}>{p.l}</div>
              <div style={{ fontSize:14, color:c.mute }}>→</div>
            </div>
          ))}
        </div>

        <div style={{ flex:1 }} />
      </div>

      <div style={{ padding:'12px 22px 22px', background:c.bg }}>
        <ACBtn primary block dark={dark} size="md" pill>Send code to email</ACBtn>
      </div>
    </div>
  );
}
