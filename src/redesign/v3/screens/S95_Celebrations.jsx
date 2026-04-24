import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACBtn, ACMono,
} from '../lib/paper.jsx';

export default function S95_Celebrations({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:c.bg, position:'relative', overflow:'hidden' }}>
      {/* stage 1 — anticipation: ECG background trace builds in */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', opacity:0.12, animation:'s95-ecg-bg 1.2s ease-out both' }}>
        <svg viewBox="0 0 360 800" style={{ width:'100%', height:'100%' }}>
          <polyline fill="none" stroke={c.accent} strokeWidth="1.5" points="0,400 90,400 105,380 120,420 135,200 150,600 165,380 180,420 195,400 270,400 360,400" />
          <polyline fill="none" stroke={c.fg} strokeWidth="1" points="0,300 360,300" opacity="0.5" strokeDasharray="4 4" />
          <polyline fill="none" stroke={c.fg} strokeWidth="1" points="0,500 360,500" opacity="0.5" strokeDasharray="4 4" />
        </svg>
      </div>

      <div style={{ padding:'14px 22px 0', display:'flex', alignItems:'center', justifyContent:'space-between', position:'relative', zIndex:1 }}>
        <ACLabel size={13} color={c.dim}>✕</ACLabel>
        <ACLabel size={12} color={c.dim}>Skip</ACLabel>
      </div>

      <div style={{ flex:1, padding:'32px 22px 16px', position:'relative', zIndex:1, display:'flex', flexDirection:'column' }}>
        <ACMono size={11} color={c.accent} track={2.4} style={{ textTransform:'uppercase', fontWeight:700, animation:'s95-fade-up 0.5s 0.1s ease-out both' }}>/// personal record · 014</ACMono>

        {/* stage 2 — reveal: PR number scales in with weight */}
        <div style={{ marginTop:24, fontFamily:ACFonts.display, fontSize:140, fontWeight:800, letterSpacing:-6, lineHeight:0.85, color:c.fg, fontVariantNumeric:'tabular-nums', animation:'s95-pr-reveal 0.6s 0.35s cubic-bezier(0.16,1,0.3,1) both' }}>
          485
        </div>
        <div style={{ marginTop:4, fontFamily:ACFonts.mono, fontSize:13, color:c.accent, letterSpacing:2, textTransform:'uppercase', fontWeight:700, animation:'s95-fade-up 0.4s 0.7s ease-out both' }}>
          lb · deadlift · new high
        </div>

        {/* stage 3 — celebration: delta badge pops in */}
        <div style={{ marginTop:12, padding:'10px 14px', background:c.ink, color:c.paper, alignSelf:'flex-start', animation:'s95-badge-pop 0.5s 0.95s cubic-bezier(0.34,1.56,0.64,1) both' }}>
          <ACMono size={10} color={c.accent} track={1.6} style={{ textTransform:'uppercase', fontWeight:700 }}>
            +15 lb from previous · mar 2025
          </ACMono>
        </div>

        <div style={{ marginTop:26, fontFamily:ACFonts.display, fontSize:26, fontWeight:700, letterSpacing:-0.8, lineHeight:1.15, color:c.fg, animation:'s95-fade-up 0.5s 1.1s ease-out both' }}>
          Seven months ago you<br/>thought 405 was your ceiling.
        </div>

        <div style={{ marginTop:28, padding:14, background:c.card, borderRadius:ACRadii.card }}>
          <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>the path here</ACMono>
          <div style={{ marginTop:12 }}>
            {[
              { d:'aug 24', v:'405', tag:'prev PR' },
              { d:'nov 24', v:'425' },
              { d:'jan 25', v:'455' },
              { d:'apr 25', v:'485', tag:'today', hot:true },
            ].map((r,i,arr) => (
              <div key={i} style={{
                padding:'6px 0', borderBottom: i<arr.length-1 ? `1px solid ${c.hair}` : 'none',
                display:'flex', alignItems:'baseline', gap:10,
              }}>
                <span style={{ fontFamily:ACFonts.mono, fontSize:10, color:c.mute, letterSpacing:1, textTransform:'uppercase', width:56 }}>{r.d}</span>
                <span style={{ flex:1, fontFamily:ACFonts.display, fontSize:18, fontWeight:600, color: r.hot ? c.accent : c.fg, letterSpacing:-0.3, fontVariantNumeric:'tabular-nums' }}>{r.v} lb</span>
                {r.tag && <span style={{ fontFamily:ACFonts.mono, fontSize:9, letterSpacing:1.4, textTransform:'uppercase', color: r.hot ? c.accent : c.mute, fontWeight:700 }}>{r.tag}</span>}
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex:1 }} />
      </div>

      <style>{`
        @keyframes s95-ecg-bg  { from{opacity:0} to{opacity:0.12} }
        @keyframes s95-fade-up { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes s95-pr-reveal {
          from { opacity:0; transform:scale(0.72) translateY(8px); }
          to   { opacity:1; transform:scale(1)    translateY(0); }
        }
        @keyframes s95-badge-pop {
          from { opacity:0; transform:scale(0.8); }
          to   { opacity:1; transform:scale(1); }
        }
      `}</style>

      <div style={{ padding:'12px 22px 22px', background:c.bg, position:'relative', zIndex:1, display:'flex', gap:10 }}>
        <ACBtn block dark={dark} size="md" pill>Keep private</ACBtn>
        <ACBtn primary block dark={dark} size="md" pill>Share card →</ACBtn>
      </div>
    </div>
  );
}
