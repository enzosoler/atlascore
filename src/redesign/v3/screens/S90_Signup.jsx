import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACBtn, ACMono,
} from '../lib/paper.jsx';

export default function S90_Signup({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:c.bg }}>
      <div style={{ padding:'14px 22px 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <ACLabel size={13} color={c.dim}>← Sign in</ACLabel>
        <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>1/2</ACMono>
      </div>

      <div style={{ flex:1, padding:'34px 22px 16px', display:'flex', flexDirection:'column' }}>
        <ACMono size={10} color={c.accent} track={1.8} style={{ textTransform:'uppercase', fontWeight:600 }}>/// create account</ACMono>
        <div style={{ marginTop:8, fontFamily:ACFonts.display, fontSize:38, fontWeight:800, letterSpacing:-1.4, lineHeight:0.95, color:c.fg }}>
          Start your<br/>
          <span style={{ background:c.ink, color:c.accent, padding:'0 6px' }}>system.</span>
        </div>
        <div style={{ marginTop:10, fontSize:13.5, color:c.dim, lineHeight:1.5 }}>
          14-day trial. No card. Full coach from day one.
        </div>

        <div style={{ marginTop:32, display:'flex', flexDirection:'column', gap:22 }}>
          <div>
            <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>first name</ACMono>
            <div style={{ marginTop:6, borderBottom:`2px solid ${c.fg}`, paddingBottom:8 }}>
              <span style={{ fontFamily:ACFonts.display, fontSize:20, fontWeight:600, color:c.fg, letterSpacing:-0.3 }}>
                Jordan<span style={{ display:'inline-block', width:2, height:20, background:c.accent, marginLeft:2, verticalAlign:'middle', animation:'s90-blink 1s step-end infinite' }} />
              </span>
            </div>
          </div>
          <div>
            <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>email</ACMono>
            <div style={{ marginTop:6, borderBottom:`2px solid ${c.hair}`, paddingBottom:8 }}>
              <span style={{ fontFamily:ACFonts.display, fontSize:20, fontWeight:500, color:c.mute, letterSpacing:-0.2 }}>you@example.com</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop:30, padding:14, background:c.card, borderRadius:ACRadii.card }}>
          <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>what's in the trial</ACMono>
          <div style={{ marginTop:10, display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {['Full coach','All programs','Labs intake','Protocols','Watch companion','Crew'].map(x => (
              <div key={x} style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:c.fg }}>
                <div style={{ width:5, height:5, background:c.accent }} />{x}
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex:1 }} />
        <div style={{ fontSize:11, color:c.mute, lineHeight:1.5, textAlign:'center' }}>
          By continuing you accept the <span style={{ color:c.fg, textDecoration:'underline' }}>terms</span> and <span style={{ color:c.fg, textDecoration:'underline' }}>privacy</span>.
        </div>
      </div>

      <style>{`@keyframes s90-blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>

      <div style={{ padding:'12px 22px 22px', background:c.bg }}>
        <ACBtn primary block dark={dark} size="md" pill>Continue →</ACBtn>
      </div>
    </div>
  );
}
