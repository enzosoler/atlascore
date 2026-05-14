import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACMono,
} from '../lib/paper.jsx';

export default function S99_Meal_Plans({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
      <div style={{ padding:'14px 22px 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <ACLabel size={13} color={c.dim}>← Nutrition</ACLabel>
        <ACLabel size={12} color={c.accent} style={{ fontWeight:600 }}>+ New</ACLabel>
      </div>

      <div style={{ flex:1, overflow:'auto', padding:'14px 22px 20px' }}>
        <ACMono size={10} color={c.dim} track={1.8} style={{ textTransform:'uppercase' }}>/// meal templates</ACMono>
        <div style={{ marginTop:6, fontFamily:ACFonts.display, fontSize:28, fontWeight:700, letterSpacing:-0.8, lineHeight:1.05, color:c.fg }}>
          One tap.<br/>
          <span style={{ fontSize:18, color:c.dim, fontWeight:600 }}>whole day on the plan</span>
        </div>

        <div style={{ marginTop:18, padding:16, background:c.ink, color:c.paper }}>
          <ACMono size={10} color={c.accent} track={1.6} style={{ textTransform:'uppercase', fontWeight:700 }}>active plan</ACMono>
          <div style={{ marginTop:8, fontFamily:ACFonts.display, fontSize:22, fontWeight:700, letterSpacing:-0.5 }}>Recomp · 220 g P · 2,640 kcal</div>
          <div style={{ marginTop:4, fontSize:11.5, color:'rgba(239,233,218,0.6)' }}>Matches your macro targets · 5 meals</div>
          <div style={{ marginTop:12, display:'flex', gap:8 }}>
            <button style={{ padding:'8px 12px', background:c.accent, border:0, color:c.ink, fontFamily:ACFonts.body, fontSize:11.5, fontWeight:700, cursor:'pointer' }}>Log today</button>
            <button style={{ padding:'8px 12px', background:'transparent', border:'1px solid rgba(239,233,218,0.2)', color:c.paper, fontFamily:ACFonts.body, fontSize:11.5, fontWeight:600, cursor:'pointer' }}>Swap</button>
          </div>
        </div>

        <div style={{ marginTop:22 }}>
          <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>alternatives · 8</ACMono>
          <div style={{ marginTop:10, display:'flex', flexDirection:'column', gap:8 }}>
            {[
              { k:'Cut · aggressive',      sub:'200 g P · 2,080 kcal',    tag:'LOW',  meals:4 },
              { k:'Lean bulk',             sub:'220 g P · 3,100 kcal',    tag:'HI',   meals:6 },
              { k:'Maintenance',           sub:'200 g P · 2,720 kcal',    tag:'BASE', meals:4 },
              { k:'Endurance · high carb', sub:'180 g P · 3,400 kcal',    tag:'CHO',  meals:5 },
              { k:'Low-FODMAP',            sub:'180 g P · 2,400 kcal',    tag:'GI',   meals:4 },
              { k:'Plant-forward recomp',  sub:'160 g P · 2,400 kcal',    tag:'PV',   meals:5 },
            ].map((r,i) => (
              <div key={i} style={{
                padding:'12px 14px', background:c.card, borderRadius:ACRadii.card,
                display:'flex', alignItems:'center', gap:12,
              }}>
                <div style={{
                  width:36, height:36, background:c.bg, color:c.fg, border:`1px solid ${c.hair}`,
                  display:'grid', placeItems:'center', fontFamily:ACFonts.mono, fontSize:10, fontWeight:700, letterSpacing:0.5,
                }}>{r.tag}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13.5, fontWeight:600, color:c.fg }}>{r.k}</div>
                  <div style={{ fontSize:11, color:c.dim, marginTop:2, fontFamily:ACFonts.mono, letterSpacing:0.3 }}>{r.sub}</div>
                </div>
                <div style={{ fontSize:11, color:c.mute, fontFamily:ACFonts.mono, letterSpacing:0.4 }}>{r.meals}×/day</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop:18, padding:14, background:c.card, borderRadius:ACRadii.card }}>
          <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>note</ACMono>
          <div style={{ marginTop:8, fontSize:12, color:c.fg, lineHeight:1.5 }}>
            Plans are starting points, not prescriptions. Coach tunes macros daily based on your log.
          </div>
        </div>
      </div>
    </div>
  );
}
