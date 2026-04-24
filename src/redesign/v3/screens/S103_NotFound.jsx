import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACBtn, ACMono, ACBrandMark,
} from '../lib/paper.jsx';
import { HeartMark } from '../lib/brandMarks.jsx';

export default function S103_NotFound({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:c.bg }}>
      <div style={{ padding:'14px 22px 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <ACLabel size={13} color={c.dim}>← Back</ACLabel>
        <ACBrandMark HeartMarkComp={HeartMark} dark={dark} size={14} />
      </div>

      <div style={{ flex:1, padding:'40px 22px 16px', display:'flex', flexDirection:'column' }}>
        <ACMono size={10} color={c.accent} track={2} style={{ textTransform:'uppercase', fontWeight:700 }}>/// 404 · not found</ACMono>
        <div style={{
          marginTop:16, fontFamily:ACFonts.display, fontSize:160, fontWeight:800,
          letterSpacing:-8, lineHeight:0.82, color:c.fg, fontVariantNumeric:'tabular-nums',
        }}>
          404.
        </div>
        <div style={{ marginTop:12, fontFamily:ACFonts.display, fontSize:26, fontWeight:700, letterSpacing:-0.8, lineHeight:1.15, color:c.fg }}>
          This page isn't here.<br/>
          <span style={{ color:c.dim }}>Nothing broken on your side.</span>
        </div>

        <div style={{ marginTop:30, margin:'30px -22px 0' }}>
          <svg viewBox="0 0 360 40" style={{ width:'100%', height:40 }}>
            <polyline fill="none" stroke={c.fg} strokeWidth="1.5" opacity="0.3"
              points="0,20 80,20 95,10 110,30 125,20 140,20" />
            <text x="170" y="24" fontFamily="JetBrains Mono" fontSize="10" fill={c.accent} letterSpacing="2" fontWeight="700" style={{ textTransform:'uppercase' }}>/ ? /</text>
            <polyline fill="none" stroke={c.fg} strokeWidth="1.5" opacity="0.3"
              points="210,20 280,20 295,10 310,30 325,20 360,20" />
          </svg>
        </div>

        <div style={{ marginTop:30, padding:14, background:c.card, borderRadius:ACRadii.card }}>
          <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>try instead</ACMono>
          <div style={{ marginTop:10, display:'flex', flexDirection:'column', gap:6 }}>
            {[
              { l:'Today · readiness', u:'/today' },
              { l:'Your coach',        u:'/coach' },
              { l:'Labs',              u:'/labs' },
              { l:'Settings',          u:'/settings' },
            ].map(r => (
              <div key={r.l} style={{ padding:'8px 0', display:'flex', alignItems:'center', gap:10, borderBottom:`1px solid ${c.hair}` }}>
                <div style={{ width:5, height:5, background:c.accent }} />
                <div style={{ flex:1, fontSize:12.5, color:c.fg, fontWeight:600 }}>{r.l}</div>
                <ACMono size={10} color={c.mute} track={0.3}>{r.u}</ACMono>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex:1 }} />
      </div>

      <div style={{ padding:'12px 22px 22px', background:c.bg }}>
        <ACBtn primary block dark={dark} size="md" pill>Go to today</ACBtn>
      </div>
    </div>
  );
}
