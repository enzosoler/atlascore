import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACMono,
} from '../lib/paper.jsx';

export default function S93_Focus_Mode({ dark }) {
  const c = useACT(dark);
  const surface = c.bg;
  const onSurface = c.fg;
  const onSurfaceDim = c.dim;
  const onSurfaceMute = c.mute;

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:surface, color:onSurface }}>
      <div style={{ padding:'14px 22px 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <ACMono size={10} color={c.accent} track={1.8} style={{ textTransform:'uppercase', fontWeight:700 }}>/// focus</ACMono>
        <ACMono size={10} color={onSurfaceMute} track={1.6} style={{ textTransform:'uppercase' }}>push · set 3/5</ACMono>
      </div>

      <div style={{ flex:1, padding:'26px 22px 12px', display:'flex', flexDirection:'column', minHeight:0 }}>
        <ACMono size={11} color={onSurfaceDim} track={1.8} style={{ textTransform:'uppercase', fontWeight:600 }}>current lift</ACMono>
        <div style={{ marginTop:6, fontFamily:ACFonts.display, fontSize:32, fontWeight:700, letterSpacing:-1, lineHeight:1, color:onSurface }}>
          Barbell<br/>bench press.
        </div>

        <div style={{ marginTop:24, textAlign:'center' }}>
          <ACMono size={11} color={c.accent} track={2.4} style={{ textTransform:'uppercase', fontWeight:700 }}>rest</ACMono>
          <div style={{
            marginTop:4,
            fontFamily:ACFonts.display, fontSize:120, fontWeight:800,
            letterSpacing:-5, lineHeight:1.05, fontVariantNumeric:'tabular-nums',
            color:onSurface, padding:'4px 0',
          }}>2:14</div>
          <div style={{ marginTop:4, height:3, background: dark ? 'rgba(239,233,218,0.14)' : 'rgba(15,10,5,0.1)', width:'100%' }}>
            <div style={{ width:'58%', height:'100%', background:c.accent }} />
          </div>
        </div>

        <div style={{ marginTop:22, padding:'14px 16px', border:`1px solid ${c.hair}` }}>
          <ACMono size={10} color={onSurfaceDim} track={1.6} style={{ textTransform:'uppercase' }}>next set</ACMono>
          <div style={{ marginTop:6, display:'flex', alignItems:'baseline', gap:14 }}>
            <div>
              <span style={{ fontFamily:ACFonts.display, fontSize:40, fontWeight:800, letterSpacing:-1.4, fontVariantNumeric:'tabular-nums', color:onSurface }}>225</span>
              <span style={{ fontSize:11, color:onSurfaceDim, marginLeft:4 }}>lb</span>
            </div>
            <div style={{ fontFamily:ACFonts.mono, fontSize:14, color:onSurfaceMute }}>×</div>
            <div>
              <span style={{ fontFamily:ACFonts.display, fontSize:40, fontWeight:800, letterSpacing:-1.4, fontVariantNumeric:'tabular-nums', color:onSurface }}>5</span>
              <span style={{ fontSize:11, color:onSurfaceDim, marginLeft:4 }}>reps</span>
            </div>
            <div style={{ marginLeft:'auto', fontFamily:ACFonts.mono, fontSize:10, color:c.accent, letterSpacing:1.4, textTransform:'uppercase', textAlign:'right', lineHeight:1.2 }}>target<br/>RPE 8</div>
          </div>
        </div>

        <div style={{ flex:1 }} />

        <div style={{ marginTop:14, paddingTop:12, borderTop:`1px solid ${c.hair}`, display:'flex', justifyContent:'space-between', fontFamily:ACFonts.mono, fontSize:10, letterSpacing:1.4, textTransform:'uppercase', color:onSurfaceMute }}>
          <span>session · 32:14</span>
          <span>tonnage · 14,280 lb</span>
        </div>
      </div>

      <div style={{ padding:'10px 22px 22px', display:'grid', gridTemplateColumns:'1fr 2fr 1fr', gap:8 }}>
        <button style={{ padding:'14px 8px', background:'transparent', border:`1px solid ${c.hair}`, color:onSurface, fontFamily:ACFonts.mono, fontSize:10.5, letterSpacing:1.2, textTransform:'uppercase', fontWeight:700, cursor:'pointer' }}>+ 30s</button>
        <button style={{ padding:'14px 8px', background:c.accent, border:0, color: dark ? c.ink : c.bg, fontFamily:ACFonts.body, fontSize:13, fontWeight:700, cursor:'pointer', borderRadius:999 }}>Complete set →</button>
        <button style={{ padding:'14px 8px', background:'transparent', border:`1px solid ${c.hair}`, color:onSurface, fontFamily:ACFonts.mono, fontSize:10.5, letterSpacing:1.2, textTransform:'uppercase', fontWeight:700, cursor:'pointer' }}>Exit</button>
      </div>
    </div>
  );
}
