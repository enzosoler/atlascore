import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACBtn, ACMono,
} from '../lib/paper.jsx';

export default function S88_Magic_Link_Sent({ dark }) {
  const c = useACT(dark);
  const code = ['4','7','2','','',''];
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:c.bg }}>
      <div style={{ padding:'14px 22px 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <ACLabel size={13} color={c.dim}>← Back</ACLabel>
        <ACLabel size={12} color={c.dim}>Help</ACLabel>
      </div>

      <div style={{ flex:1, padding:'40px 22px 16px', display:'flex', flexDirection:'column' }}>
        <ACMono size={10} color={c.accent} track={1.8} style={{ textTransform:'uppercase', fontWeight:600 }}>/// check email</ACMono>
        <div style={{ marginTop:8, fontFamily:ACFonts.display, fontSize:38, fontWeight:800, letterSpacing:-1.4, lineHeight:0.95, color:c.fg }}>
          Code sent.
        </div>
        <div style={{ marginTop:10, fontSize:14, color:c.dim, lineHeight:1.5 }}>
          Enter the 6-digit code we sent to<br/>
          <span style={{ color:c.fg, fontWeight:600 }}>jordan@figma.com</span>
        </div>

        <div style={{ marginTop:36, display:'flex', gap:8, justifyContent:'center' }}>
          {code.map((d,i) => (
            <div key={i} style={{
              width:42, height:56, border:`2px solid ${d ? c.fg : c.hair}`,
              display:'grid', placeItems:'center',
              background: i===3 ? `${c.accent}14` : 'transparent',
              borderColor: i===3 ? c.accent : (d ? c.fg : c.hair),
            }}>
              <span style={{ fontFamily:ACFonts.display, fontSize:26, fontWeight:700, color:c.fg, fontVariantNumeric:'tabular-nums' }}>
                {d || (i===3 ? <span style={{ width:2, height:28, background:c.accent, display:'inline-block' }} /> : '')}
              </span>
            </div>
          ))}
        </div>

        <div style={{ marginTop:28, padding:16, background:c.card, borderRadius:ACRadii.card }}>
          <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>delivery</ACMono>
          <div style={{ marginTop:8, display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:6, height:6, background:c.accent }} />
            <div style={{ flex:1, fontSize:12.5, color:c.fg }}>Delivered · 0:08 ago</div>
            <ACMono size={10.5} color={c.mute} track={0.4}>via email</ACMono>
          </div>
        </div>

        <div style={{ marginTop:16, fontSize:12, color:c.dim, lineHeight:1.5 }}>
          Didn't arrive? <span style={{ color:c.accent, fontWeight:600 }}>Resend in 0:47</span> or <span style={{ color:c.accent, fontWeight:600 }}>try another email</span>.
        </div>

        <div style={{ flex:1 }} />

        <div style={{ marginTop:14, padding:10, textAlign:'center', fontFamily:ACFonts.mono, fontSize:10.5, color:c.mute, letterSpacing:1.4, textTransform:'uppercase' }}>
          ⌨ paste from clipboard · keyboard ready
        </div>
      </div>

      <div style={{ padding:'12px 22px 22px', background:c.bg }}>
        <ACBtn primary block dark={dark} size="md" pill>Verify →</ACBtn>
      </div>
    </div>
  );
}
