import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACMono, ACBrandMark,
} from '../lib/paper.jsx';
import { HeartMark } from '../lib/brandMarks.jsx';

export default function S97_Coach_Home({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
      <div style={{ padding:'14px 22px 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <ACBrandMark HeartMarkComp={HeartMark} dark={dark} size={15} />
        <ACLabel size={12} color={c.dim}>Settings</ACLabel>
      </div>

      <div style={{ flex:1, overflow:'auto', padding:'14px 22px 80px' }}>
        <ACMono size={10} color={c.accent} track={1.8} style={{ textTransform:'uppercase', fontWeight:600 }}>/// coach · tue · 7:04 am</ACMono>
        <div style={{ marginTop:6, fontFamily:ACFonts.display, fontSize:28, fontWeight:700, letterSpacing:-0.8, lineHeight:1.05, color:c.fg }}>
          Good morning,<br/>Jordan.
        </div>

        <div style={{ marginTop:18, padding:16, background:c.ink, color:c.paper }}>
          <ACMono size={10} color={c.accent} track={1.6} style={{ textTransform:'uppercase' }}>today's read</ACMono>
          <div style={{ marginTop:8, fontSize:13.5, lineHeight:1.55 }}>
            Sleep is up, HRV is recovering, and your deload paid off. Bench day is on — aim for RPE 8, not a PR. That comes next week.
          </div>
          <div style={{ marginTop:12, display:'flex', alignItems:'center', gap:10 }}>
            <button style={{ padding:'8px 14px', background:c.accent, border:0, color:c.ink, fontFamily:ACFonts.body, fontSize:12, fontWeight:700, cursor:'pointer' }}>Open brief</button>
            <button style={{ padding:'8px 12px', background:'transparent', border:'1px solid rgba(239,233,218,0.2)', color:c.paper, fontFamily:ACFonts.body, fontSize:12, fontWeight:600, cursor:'pointer' }}>Ask</button>
          </div>
        </div>

        <div style={{ marginTop:18, display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:8 }}>
          {[
            { k:'readiness', v:'74', t:'+6' },
            { k:'hrv',       v:'58', t:'+4' },
            { k:'sleep',     v:'7:42', u:'hr' },
          ].map(s => (
            <div key={s.k} style={{ padding:'10px 12px', background:c.card, borderRadius:ACRadii.chip }}>
              <div style={{ fontFamily:ACFonts.mono, fontSize:9, letterSpacing:1.4, textTransform:'uppercase', color:c.dim }}>{s.k}</div>
              <div style={{ marginTop:4, display:'flex', alignItems:'baseline', gap:2 }}>
                <span style={{ fontFamily:ACFonts.display, fontSize:22, fontWeight:700, color:c.fg, letterSpacing:-0.5, fontVariantNumeric:'tabular-nums' }}>{s.v}</span>
                {s.u && <span style={{ fontSize:10, color:c.dim }}>{s.u}</span>}
              </div>
              {s.t && <div style={{ fontFamily:ACFonts.mono, fontSize:10, color:c.accent, letterSpacing:0.5, marginTop:2 }}>{s.t}</div>}
            </div>
          ))}
        </div>

        <div style={{ marginTop:20 }}>
          <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>active thread</ACMono>
          <div style={{ marginTop:8, padding:14, background:c.card, borderRadius:ACRadii.card }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:26, height:26, background:c.accent, color:c.ink, display:'grid', placeItems:'center', fontFamily:ACFonts.display, fontSize:12, fontWeight:800 }}>ac</div>
              <div style={{ fontSize:12, color:c.dim }}>coach · 6 min ago</div>
            </div>
            <div style={{ marginTop:8, fontSize:13, color:c.fg, lineHeight:1.5 }}>
              "How did bench feel yesterday at RPE 8? If it was easy, we push 235 this Tuesday."
            </div>
            <div style={{ marginTop:10, display:'flex', gap:6, flexWrap:'wrap' }}>
              {['Felt solid','Too heavy','Need to go heavier'].map(q => (
                <button key={q} style={{ padding:'6px 10px', background:c.bg, border:`1px solid ${c.hair}`, color:c.fg, fontFamily:ACFonts.body, fontSize:11, fontWeight:600, cursor:'pointer' }}>{q}</button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop:20 }}>
          <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>what i'm watching</ACMono>
          <div style={{ marginTop:10, display:'flex', flexDirection:'column', gap:8 }}>
            {[
              { n:'01', t:'Protein shortfall · 4 of 7 days', sub:'avg 148 g, target 180' },
              { n:'02', t:'Sleep window drifted', sub:'midpoint +42 min later vs Mar' },
              { n:'03', t:'RHR trending up', sub:'+4 bpm over 10 days' },
            ].map(s => (
              <div key={s.n} style={{
                padding:'12px 14px', background:c.card, borderRadius:ACRadii.chip,
                display:'flex', alignItems:'center', gap:12,
              }}>
                <div style={{ fontFamily:ACFonts.mono, fontSize:11, color:c.accent, fontWeight:700, letterSpacing:1 }}>{s.n}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12.5, fontWeight:600, color:c.fg }}>{s.t}</div>
                  <div style={{ fontSize:10.5, color:c.dim, marginTop:2 }}>{s.sub}</div>
                </div>
                <div style={{ fontSize:14, color:c.mute }}>→</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
