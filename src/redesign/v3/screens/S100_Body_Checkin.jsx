import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACBtn, ACMono,
} from '../lib/paper.jsx';

export default function S100_Body_Checkin({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
      <div style={{ padding:'14px 22px 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <ACLabel size={13} color={c.dim}>✕</ACLabel>
        <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>3/4</ACMono>
      </div>

      <div style={{ flex:1, overflow:'auto', padding:'24px 22px 16px' }}>
        <ACMono size={10} color={c.accent} track={1.8} style={{ textTransform:'uppercase', fontWeight:600 }}>/// morning check-in · 90s</ACMono>
        <div style={{ marginTop:6, fontFamily:ACFonts.display, fontSize:28, fontWeight:700, letterSpacing:-0.8, lineHeight:1.05, color:c.fg }}>
          How's the body?
        </div>

        <div style={{ marginTop:20, display:'flex', flexDirection:'column', gap:8 }}>
          {[
            { k:'sleep quality',  v:'7/10',  done:true },
            { k:'mood',           v:'solid', done:true },
          ].map(r => (
            <div key={r.k} style={{ padding:'10px 14px', background:c.card, borderRadius:ACRadii.chip, display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:5, height:5, background:c.accent }} />
              <div style={{ flex:1, fontFamily:ACFonts.mono, fontSize:10, letterSpacing:1.4, textTransform:'uppercase', color:c.dim }}>{r.k}</div>
              <div style={{ fontSize:12.5, fontWeight:600, color:c.fg }}>{r.v}</div>
              <div style={{ fontSize:12, color:c.accent }}>✓</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop:28 }}>
          <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>question 3</ACMono>
          <div style={{ marginTop:6, fontFamily:ACFonts.display, fontSize:24, fontWeight:700, letterSpacing:-0.6, lineHeight:1.15, color:c.fg }}>
            Any soreness?
          </div>
          <div style={{ marginTop:4, fontSize:12, color:c.dim }}>Pick any that apply</div>

          <div style={{ marginTop:18, display:'flex', flexWrap:'wrap', gap:8 }}>
            {[
              { k:'lower back', on:true },
              { k:'hamstrings', on:true },
              { k:'glutes',     on:false },
              { k:'quads',      on:false },
              { k:'upper back', on:false },
              { k:'shoulders',  on:false },
              { k:'chest',      on:false },
              { k:'arms',       on:false },
              { k:'none',       on:false },
            ].map(ch => (
              <div key={ch.k} style={{
                padding:'8px 14px',
                background: ch.on ? c.fg : 'transparent',
                color: ch.on ? c.bg : c.fg,
                border: ch.on ? 'none' : `1px solid ${c.fg}22`,
                fontFamily:ACFonts.body, fontSize:12.5, fontWeight:600,
                borderRadius:ACRadii.chip,
              }}>{ch.k}</div>
            ))}
          </div>

          <div style={{ marginTop:18, padding:'10px 14px', borderLeft:`2px solid ${c.accent}`, background:`${c.accent}10`, fontSize:12, color:c.fg, lineHeight:1.5 }}>
            Deadlift day was yesterday — lower back + hamstring soreness is on-pattern, not a flag.
          </div>
        </div>

        <div style={{ marginTop:26, display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:5, height:5, background:c.hair }} />
          <ACMono size={10} color={c.mute} track={1.4} style={{ textTransform:'uppercase' }}>next · stress level (1 q)</ACMono>
        </div>
      </div>

      <div style={{ padding:'12px 22px 22px', background:c.bg, borderTop:`1px solid ${c.hair}`, display:'flex', gap:10 }}>
        <ACBtn block dark={dark} size="md" pill>Skip</ACBtn>
        <ACBtn primary block dark={dark} size="md" pill>Next →</ACBtn>
      </div>
    </div>
  );
}
