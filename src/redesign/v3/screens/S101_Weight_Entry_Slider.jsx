import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACBtn, ACMono,
} from '../lib/paper.jsx';

export default function S101_Weight_Entry_Slider({ dark }) {
  const c = useACT(dark);
  const ticks = 40;
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
      <div style={{ padding:'14px 22px 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <ACLabel size={13} color={c.dim}>✕</ACLabel>
        <ACLabel size={12} color={c.accent} style={{ fontWeight:600 }}>Save</ACLabel>
      </div>

      <div style={{ flex:1, padding:'30px 22px 16px', display:'flex', flexDirection:'column' }}>
        <ACMono size={10} color={c.accent} track={1.8} style={{ textTransform:'uppercase', fontWeight:600 }}>/// weight · tue morning</ACMono>

        <div style={{ marginTop:22, textAlign:'center' }}>
          <div style={{
            fontFamily:ACFonts.display, fontSize:120, fontWeight:800,
            letterSpacing:-5, lineHeight:0.88, color:c.fg, fontVariantNumeric:'tabular-nums',
          }}>
            182.<span style={{ color:c.accent }}>4</span>
          </div>
          <div style={{ marginTop:4, fontFamily:ACFonts.mono, fontSize:12, color:c.dim, letterSpacing:1.6, textTransform:'uppercase', fontWeight:600 }}>
            lb · -0.2 from yesterday
          </div>
        </div>

        <div style={{ marginTop:46 }}>
          <div style={{
            position:'relative', height:56, display:'flex', alignItems:'flex-end',
            overflow:'hidden', borderLeft:`1px solid ${c.hair}`, borderRight:`1px solid ${c.hair}`,
          }}>
            {Array.from({length:ticks}).map((_,i) => {
              const mid = i===Math.floor(ticks/2);
              const major = i%5===0;
              return (
                <div key={i} style={{
                  flex:1, position:'relative', height: mid ? 52 : major ? 40 : 24,
                  borderLeft: i===0 ? 'none' : `1px solid ${mid ? c.accent : major ? c.fg : c.hair}`,
                  borderLeftWidth: mid ? 2 : 1,
                }} />
              );
            })}
            <div style={{
              position:'absolute', left:'50%', top:-2, bottom:0, width:2, background:c.accent, transform:'translateX(-50%)',
            }} />
          </div>
          <div style={{ marginTop:8, display:'flex', justifyContent:'space-between', fontFamily:ACFonts.mono, fontSize:10, color:c.mute, letterSpacing:1, textTransform:'uppercase' }}>
            <span>180.0</span>
            <span style={{ color:c.accent, fontWeight:700 }}>182.4</span>
            <span>184.0</span>
          </div>
        </div>

        <div style={{ marginTop:26, display:'flex', gap:4, padding:3, background:c.card, borderRadius:ACRadii.chip, alignSelf:'center' }}>
          {[['lb','lb'],['kg','kg'],['st','st lb']].map(([k,l]) => (
            <div key={k} style={{
              padding:'6px 14px', background: k==='lb' ? c.fg : 'transparent',
              color: k==='lb' ? c.bg : c.dim,
              fontFamily:ACFonts.body, fontSize:11.5, fontWeight:600,
              borderRadius:ACRadii.chip-2,
            }}>{l}</div>
          ))}
        </div>

        <div style={{ marginTop:26, padding:14, background:c.card, borderRadius:ACRadii.card }}>
          <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>7d moving avg</ACMono>
          <div style={{ marginTop:6, display:'flex', alignItems:'baseline', gap:8 }}>
            <span style={{ fontFamily:ACFonts.display, fontSize:22, fontWeight:700, color:c.fg, letterSpacing:-0.5, fontVariantNumeric:'tabular-nums' }}>182.6</span>
            <span style={{ fontFamily:ACFonts.mono, fontSize:11, color:c.accent, fontWeight:700 }}>↓ 0.8 in 14d</span>
          </div>
        </div>

        <div style={{ flex:1 }} />
      </div>

      <div style={{ padding:'12px 22px 22px', background:c.bg }}>
        <ACBtn primary block dark={dark} size="md" pill>Log at 6:42 am</ACBtn>
      </div>
    </div>
  );
}
