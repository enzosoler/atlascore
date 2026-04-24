import React, { useState } from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACMono,
} from '../lib/paper.jsx';

export default function S102_Weight_Trend_Compare({ dark }) {
  const c = useACT(dark);
  const [range, setRange] = useState('90d');
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
      <div style={{ padding:'14px 22px 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <ACLabel size={13} color={c.dim}>← Body</ACLabel>
        <ACLabel size={12} color={c.accent} style={{ fontWeight:600 }}>Export</ACLabel>
      </div>

      <div style={{ flex:1, overflow:'auto', padding:'14px 22px 20px' }}>
        <ACMono size={10} color={c.dim} track={1.8} style={{ textTransform:'uppercase' }}>/// trend · range compare</ACMono>
        <div style={{ marginTop:6, fontFamily:ACFonts.display, fontSize:28, fontWeight:700, letterSpacing:-0.8, lineHeight:1.05, color:c.fg }}>
          Two quarters,<br/>
          <span style={{ color:c.accent }}>side by side.</span>
        </div>

        <div style={{ marginTop:18, display:'flex', gap:6 }}>
          {[['30d','30 D'],['90d','90 D'],['180d','6 MO'],['1y','1 YR'],['all','ALL']].map(([k,l]) => (
            <button key={k} onClick={() => setRange(k)} style={{
              flex:1, padding:'7px 6px', border:0, cursor:'pointer',
              background: range===k ? c.fg : c.card, color: range===k ? c.bg : c.dim,
              fontFamily:ACFonts.mono, fontSize:10, letterSpacing:1, fontWeight:700,
            }}>{l}</button>
          ))}
        </div>

        <div style={{ marginTop:18, padding:14, background:c.card, borderRadius:ACRadii.card }}>
          <div style={{ display:'flex', gap:14, alignItems:'baseline' }}>
            <div>
              <div style={{ width:16, height:3, background:c.fg, marginBottom:4 }} />
              <ACMono size={9} color={c.dim} track={1.2}>q1 · 25</ACMono>
              <div style={{ fontFamily:ACFonts.display, fontSize:20, fontWeight:700, color:c.fg, letterSpacing:-0.4, fontVariantNumeric:'tabular-nums' }}>184.2 → 181.8</div>
            </div>
            <div>
              <div style={{ width:16, height:3, background:c.accent, marginBottom:4 }} />
              <ACMono size={9} color={c.dim} track={1.2}>q4 · 24</ACMono>
              <div style={{ fontFamily:ACFonts.display, fontSize:20, fontWeight:700, color:c.fg, letterSpacing:-0.4, fontVariantNumeric:'tabular-nums' }}>190.6 → 184.0</div>
            </div>
          </div>
          <svg viewBox="0 0 300 120" style={{ marginTop:14, width:'100%', height:120 }}>
            {[0,1,2,3].map(i => (
              <line key={i} x1={0} y1={i*30+4} x2={300} y2={i*30+4} stroke={c.hair} strokeWidth="1" />
            ))}
            <polyline fill="none" stroke={c.accent} strokeWidth="2" opacity="0.85"
              points="0,10 30,18 60,25 90,35 120,40 150,52 180,60 210,70 240,78 270,88 300,95" />
            <polyline fill="none" stroke={c.fg} strokeWidth="2"
              points="0,45 30,48 60,52 90,56 120,55 150,60 180,62 210,68 240,70 270,72 300,78" />
            <circle cx="300" cy="95" r="4" fill={c.accent} />
            <circle cx="300" cy="78" r="4" fill={c.fg} />
          </svg>
          <div style={{ marginTop:6, display:'flex', justifyContent:'space-between', fontFamily:ACFonts.mono, fontSize:9, color:c.mute, letterSpacing:1, textTransform:'uppercase' }}>
            <span>w 01</span><span>w 04</span><span>w 08</span><span>w 12</span>
          </div>
        </div>

        <div style={{ marginTop:16, padding:14, background:c.ink, color:c.paper }}>
          <ACMono size={10} color={c.accent} track={1.6} style={{ textTransform:'uppercase' }}>net delta</ACMono>
          <div style={{ marginTop:8, display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
            {[
              { k:'q4 drop', v:'-6.6', u:'lb' },
              { k:'q1 drop', v:'-2.4', u:'lb' },
              { k:'slope',   v:'-0.27', u:'/wk' },
            ].map(s => (
              <div key={s.k}>
                <ACMono size={9} color={'rgba(239,233,218,0.5)'} track={1.4} style={{ textTransform:'uppercase' }}>{s.k}</ACMono>
                <div style={{ fontFamily:ACFonts.display, fontSize:22, fontWeight:700, letterSpacing:-0.5, marginTop:3, fontVariantNumeric:'tabular-nums' }}>
                  {s.v}<span style={{ fontSize:11, color:c.accent, marginLeft:3 }}>{s.u}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop:16, padding:'10px 14px', borderLeft:`2px solid ${c.accent}`, background:`${c.accent}10`, fontSize:12, color:c.fg, lineHeight:1.5 }}>
          Q4 was aggressive cut. Q1 is maintenance-with-recomp — lower rate, more muscle retained.
        </div>
      </div>
    </div>
  );
}
