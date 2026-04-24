import React from 'react';
import {
  ACFonts, ACRadii, useACT, ACMono,
} from '../lib/paper.jsx';

export default function S89_Magic_Callback({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:c.ink, color:c.paper, alignItems:'center', justifyContent:'center', padding:22 }}>
      <ACMono size={10} color={c.accent} track={2.2} style={{ textTransform:'uppercase', fontWeight:600 }}>/// verifying · 001</ACMono>

      <div style={{ marginTop:36, position:'relative', width:120, height:120, display:'grid', placeItems:'center' }}>
        <div style={{
          position:'absolute', inset:0, border:`2px solid ${c.accent}`,
          animation:'ac_pulse 2s ease-out infinite',
        }} />
        <div style={{
          position:'absolute', inset:10, border:`1px solid ${c.accent}`, opacity:0.5,
          animation:'ac_pulse 2s ease-out infinite 0.4s',
        }} />
        <div style={{ fontFamily:ACFonts.display, fontSize:48, fontWeight:800, letterSpacing:-2, color:c.accent }}>ac</div>
      </div>

      <div style={{ marginTop:36, fontFamily:ACFonts.display, fontSize:26, fontWeight:700, letterSpacing:-0.8, textAlign:'center', lineHeight:1.15 }}>
        Checking your code.
      </div>
      <div style={{ marginTop:10, fontSize:12.5, color:'rgba(239,233,218,0.55)', textAlign:'center', maxWidth:240, lineHeight:1.5 }}>
        Signing you in from <span style={{ fontFamily:ACFonts.mono }}>iPhone · Austin, TX</span>
      </div>

      <div style={{ marginTop:36, display:'flex', flexDirection:'column', gap:6, width:'100%', maxWidth:260 }}>
        {[
          { k:'code',     done:true },
          { k:'account',  done:true },
          { k:'device',   active:true },
          { k:'sync',     pending:true },
        ].map(s => (
          <div key={s.k} style={{ display:'flex', alignItems:'center', gap:10, fontFamily:ACFonts.mono, fontSize:11, letterSpacing:1.5, textTransform:'uppercase' }}>
            <div style={{
              width:10, height:10,
              background: s.done ? c.accent : s.active ? c.accent : 'rgba(239,233,218,0.15)',
              animation: s.active ? 'ac_blink 1s infinite' : 'none',
            }} />
            <span style={{ color: s.pending ? 'rgba(239,233,218,0.4)' : 'rgba(239,233,218,0.85)', flex:1 }}>verifying {s.k}</span>
            <span style={{ color: s.done ? c.accent : 'rgba(239,233,218,0.3)' }}>{s.done ? 'ok' : s.active ? '…' : ''}</span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes ac_pulse { 0% { transform:scale(0.9); opacity:0.9 } 100% { transform:scale(1.25); opacity:0 } }
        @keyframes ac_blink { 50% { opacity:0.3 } }
      `}</style>
    </div>
  );
}
