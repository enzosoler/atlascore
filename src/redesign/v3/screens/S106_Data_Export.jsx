import React, { useState } from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACBtn, ACMono,
} from '../lib/paper.jsx';

export default function S106_Data_Export({ dark }) {
  const c = useACT(dark);
  const [fmt, setFmt] = useState('json');
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
      <div style={{ padding:'14px 22px 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <ACLabel size={13} color={c.dim}>← Account</ACLabel>
        <ACLabel size={12} color={c.dim}>Help</ACLabel>
      </div>

      <div style={{ flex:1, overflow:'auto', padding:'14px 22px 20px' }}>
        <ACMono size={10} color={c.accent} track={1.8} style={{ textTransform:'uppercase', fontWeight:600 }}>/// export · your data</ACMono>
        <div style={{ marginTop:6, fontFamily:ACFonts.display, fontSize:28, fontWeight:700, letterSpacing:-0.8, lineHeight:1.05, color:c.fg }}>
          All of it. Yours.
        </div>
        <div style={{ marginTop:8, fontSize:13, color:c.dim, lineHeight:1.5 }}>
          We don't hold anything hostage. Pick a format, pick what to include, we'll email you a signed archive.
        </div>

        {/* format picker */}
        <div style={{ marginTop:20 }}>
          <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>format</ACMono>
          <div style={{ marginTop:10, display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
            {[
              { k:'json', l:'JSON', sub:'full fidelity' },
              { k:'csv',  l:'CSV',  sub:'spreadsheet' },
              { k:'pdf',  l:'PDF',  sub:'human read' },
            ].map(f => (
              <button key={f.k} onClick={() => setFmt(f.k)} style={{
                padding:'12px 8px', border: fmt===f.k ? `2px solid ${c.fg}` : `1px solid ${c.hair}`,
                background:'transparent', cursor:'pointer', borderRadius:ACRadii.chip,
                textAlign:'left',
              }}>
                <div style={{ fontFamily:ACFonts.display, fontSize:16, fontWeight:700, color:c.fg, letterSpacing:-0.3 }}>{f.l}</div>
                <div style={{ fontSize:10.5, color:c.dim, marginTop:3 }}>{f.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* include */}
        <div style={{ marginTop:22 }}>
          <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>include</ACMono>
          <div style={{ marginTop:10, background:c.card, borderRadius:ACRadii.card, overflow:'hidden' }}>
            {[
              { k:'Workouts · 468 sessions',      on:true  },
              { k:'Meals · 2,142 entries',         on:true  },
              { k:'Weights · 384 entries',          on:true  },
              { k:'Labs · 8 panels · 84 markers',  on:true  },
              { k:'Protocols · 47 doses',           on:true  },
              { k:'Coach threads · 312 messages',   on:false },
              { k:'Progress photos · 28 photos',    on:false },
              { k:'App events · debug data',        on:false },
            ].map((r,i,arr) => (
              <div key={i} style={{
                padding:'12px 14px', display:'flex', alignItems:'center', gap:12,
                borderBottom: i<arr.length-1 ? `1px solid ${c.hair}` : 'none',
              }}>
                <div style={{ flex:1, fontSize:12.5, color:c.fg }}>{r.k}</div>
                <div style={{
                  width:34, height:20, background: r.on ? c.accent : c.hair,
                  position:'relative', borderRadius:999,
                }}>
                  <div style={{
                    position:'absolute', top:2, left: r.on ? 16 : 2, width:16, height:16,
                    background:c.ink, borderRadius:'50%',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* estimate */}
        <div style={{ marginTop:18, padding:14, background:c.ink, color:c.paper }}>
          <ACMono size={10} color={c.accent} track={1.6} style={{ textTransform:'uppercase' }}>archive</ACMono>
          <div style={{ marginTop:8, display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
            {[
              { k:'size',  v:'42 MB' },
              { k:'files', v:'5,280' },
              { k:'ready', v:'~4 min' },
            ].map(s => (
              <div key={s.k}>
                <ACMono size={9} color={'rgba(239,233,218,0.5)'} track={1.4} style={{ textTransform:'uppercase' }}>{s.k}</ACMono>
                <div style={{ fontFamily:ACFonts.display, fontSize:18, fontWeight:700, letterSpacing:-0.3, marginTop:3, fontVariantNumeric:'tabular-nums' }}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop:14, fontSize:11, color:c.mute, lineHeight:1.5 }}>
          We'll email the link to <span style={{ fontFamily:ACFonts.mono, color:c.fg }}>jordan@figma.com</span>. Link expires in 24h.
        </div>
      </div>

      <div style={{ padding:'12px 22px 22px', background:c.bg, borderTop:`1px solid ${c.hair}` }}>
        <ACBtn primary block dark={dark} size="md" pill>Generate archive →</ACBtn>
      </div>
    </div>
  );
}
