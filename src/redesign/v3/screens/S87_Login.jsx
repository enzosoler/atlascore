import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACBtn, ACMono, ACBrandMark,
} from '../lib/paper.jsx';
import { HeartMark } from '../lib/brandMarks.jsx';

export default function S87_Login({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:c.bg }}>
      <div style={{ padding:'14px 22px 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <ACBrandMark HeartMarkComp={HeartMark} dark={dark} size={16} />
        <ACLabel size={12} color={c.dim}>Help</ACLabel>
      </div>

      <div style={{ flex:1, padding:'44px 22px 16px', display:'flex', flexDirection:'column' }}>
        <ACMono size={10} color={c.accent} track={1.8} style={{ textTransform:'uppercase', fontWeight:600 }}>/// sign in</ACMono>
        <div style={{ marginTop:8, fontFamily:ACFonts.display, fontSize:42, fontWeight:800, letterSpacing:-1.6, lineHeight:0.95, color:c.fg }}>
          Welcome back.
        </div>
        <div style={{ marginTop:10, fontSize:14, color:c.dim, lineHeight:1.5 }}>
          One field. No password. We'll send a code.
        </div>

        <div style={{ marginTop:32 }}>
          <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>email</ACMono>
          <div style={{ marginTop:8, borderBottom:`2px solid ${c.fg}`, paddingBottom:10 }}>
            <span style={{ fontFamily:ACFonts.display, fontSize:22, fontWeight:600, color:c.fg, letterSpacing:-0.4 }}>
              jordan@figma.com
              <span style={{ display:'inline-block', width:2, height:24, background:c.accent, marginLeft:2, verticalAlign:'middle', animation:'s87-blink 1s step-end infinite' }} />
            </span>
          </div>
        </div>

        <div style={{ marginTop:14, padding:'10px 12px', borderLeft:`2px solid ${c.accent}`, background:`${c.accent}12`, fontSize:12, color:c.fg, lineHeight:1.45 }}>
          We'll email you a 6-digit code. No password to remember, nothing to phish.
        </div>

        <div style={{ flex:1 }} />

        <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:28 }}>
          <div style={{ flex:1, height:1, background:c.hair }} />
          <ACMono size={9} color={c.mute} track={1.6} style={{ textTransform:'uppercase' }}>or</ACMono>
          <div style={{ flex:1, height:1, background:c.hair }} />
        </div>
        <div style={{ marginTop:14, display:'flex', flexDirection:'column', gap:8 }}>
          {[
            { k:'apple', l:'Continue with Apple' },
            { k:'google',l:'Continue with Google' },
          ].map(p => (
            <button key={p.k} style={{
              padding:'14px 16px', border:`1px solid ${c.fg}18`, background:'transparent',
              color:c.fg, fontFamily:ACFonts.body, fontSize:13.5, fontWeight:600,
              display:'flex', alignItems:'center', gap:12, cursor:'pointer', borderRadius:ACRadii.button,
            }}>
              <div style={{ width:18, height:18, background:c.fg, color:c.bg, display:'grid', placeItems:'center', fontFamily:ACFonts.mono, fontSize:10, fontWeight:700 }}>
                {p.k==='apple' ? '' : 'G'}
              </div>
              <span>{p.l}</span>
              <span style={{ marginLeft:'auto', color:c.mute, fontSize:14 }}>→</span>
            </button>
          ))}
        </div>
      </div>

      <style>{`@keyframes s87-blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>

      <div style={{ padding:'12px 22px 22px', background:c.bg }}>
        <ACBtn primary block dark={dark} size="md" pill>Send code →</ACBtn>
        <div style={{ textAlign:'center', marginTop:10 }}>
          <ACLabel size={12} color={c.dim}>No account? <span style={{ color:c.accent, fontWeight:600 }}>Start here</span></ACLabel>
        </div>
      </div>
    </div>
  );
}
