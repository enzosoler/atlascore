import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACBtn, ACMono,
} from '../lib/paper.jsx';

export default function S92_Reset({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:c.bg }}>
      <div style={{ padding:'14px 22px 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <ACLabel size={13} color={c.dim}>← Account</ACLabel>
        <ACLabel size={12} color={c.accent} style={{ fontWeight:600 }}>Save</ACLabel>
      </div>

      <div style={{ flex:1, padding:'24px 22px 16px', display:'flex', flexDirection:'column' }}>
        <ACMono size={10} color={c.accent} track={1.8} style={{ textTransform:'uppercase', fontWeight:600 }}>/// change login email</ACMono>
        <div style={{ marginTop:8, fontFamily:ACFonts.display, fontSize:30, fontWeight:700, letterSpacing:-1, lineHeight:1, color:c.fg }}>
          Move your account.
        </div>

        <div style={{ marginTop:22, padding:14, background:c.card, borderRadius:ACRadii.card }}>
          <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>current</ACMono>
          <div style={{ marginTop:4, fontFamily:ACFonts.display, fontSize:18, color:c.fg, fontWeight:600, letterSpacing:-0.2 }}>jordan@figma.com</div>
        </div>

        <div style={{ marginTop:18 }}>
          <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>new email</ACMono>
          <div style={{ marginTop:6, borderBottom:`2px solid ${c.fg}`, paddingBottom:8 }}>
            <span style={{ fontFamily:ACFonts.display, fontSize:20, fontWeight:600, color:c.fg, letterSpacing:-0.3 }}>
              jordan.kim@gmail.com
              <span style={{ display:'inline-block', width:2, height:22, background:c.accent, marginLeft:2, verticalAlign:'middle' }} />
            </span>
          </div>
        </div>

        <div style={{ marginTop:22, padding:'14px 14px', border:`2px solid ${c.accent}`, background:`${c.accent}10` }}>
          <ACMono size={10} color={c.accent} track={1.6} style={{ textTransform:'uppercase', fontWeight:700 }}>2-step verify</ACMono>
          <div style={{ marginTop:8, fontSize:12.5, color:c.fg, lineHeight:1.5 }}>
            We'll send a code to both the old and new address. Both must confirm before the change takes effect.
          </div>
        </div>

        <div style={{ marginTop:22, padding:14, background:c.card, borderRadius:ACRadii.card }}>
          <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>what moves</ACMono>
          <div style={{ marginTop:10, display:'flex', flexDirection:'column', gap:6, fontSize:12, color:c.fg }}>
            {['All logs, labs, protocols','14mo of history','Crew + coach state','Subscription (same Apple ID)'].map(x => (
              <div key={x} style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:5, height:5, background:c.accent }} />{x}
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex:1 }} />
        <div style={{ marginTop:14, fontSize:11, color:c.mute, lineHeight:1.5, textAlign:'center' }}>
          You'll be signed out of other devices · resigning takes 30s
        </div>
      </div>

      <div style={{ padding:'12px 22px 22px', background:c.bg }}>
        <ACBtn primary block dark={dark} size="md" pill>Send verification →</ACBtn>
      </div>
    </div>
  );
}
