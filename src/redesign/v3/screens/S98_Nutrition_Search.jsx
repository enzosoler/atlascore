import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACMono,
} from '../lib/paper.jsx';

export default function S98_Nutrition_Search({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
      <div style={{ padding:'14px 22px 10px', display:'flex', alignItems:'center', gap:10 }}>
        <ACLabel size={13} color={c.dim}>← Nutrition</ACLabel>
        <div style={{ flex:1 }} />
      </div>

      <div style={{ padding:'0 22px' }}>
        <div style={{
          padding:'10px 14px', background:c.card, borderRadius:ACRadii.button,
          display:'flex', alignItems:'center', gap:10,
        }}>
          <span style={{ fontFamily:ACFonts.mono, fontSize:14, color:c.dim }}>⌕</span>
          <span style={{ fontFamily:ACFonts.display, fontSize:16, color:c.fg, fontWeight:600, letterSpacing:-0.2 }}>
            chicken breast grilled
            <span style={{ display:'inline-block', width:2, height:16, background:c.accent, marginLeft:2, verticalAlign:'middle' }} />
          </span>
        </div>
      </div>

      <div style={{ flex:1, overflow:'auto', padding:'14px 22px 16px' }}>
        <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>top match</ACMono>
        <div style={{ marginTop:8, padding:14, background:c.ink, color:c.paper, position:'relative', overflow:'hidden' }}>
          <ACMono size={9} color={c.accent} track={1.6} style={{ textTransform:'uppercase', fontWeight:700 }}>usda · verified</ACMono>
          <div style={{ marginTop:6, fontFamily:ACFonts.display, fontSize:20, fontWeight:700, letterSpacing:-0.4 }}>Chicken breast, grilled</div>
          <div style={{ marginTop:4, fontSize:11.5, color:'rgba(239,233,218,0.6)' }}>boneless, skinless · no oil · 4 oz portion</div>
          <div style={{ marginTop:12, display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, paddingTop:10, borderTop:'1px solid rgba(239,233,218,0.15)' }}>
            {[
              { k:'kcal',v:'187' },
              { k:'p',   v:'35 g' },
              { k:'c',   v:'0 g' },
              { k:'f',   v:'4 g' },
            ].map(m => (
              <div key={m.k}>
                <div style={{ fontFamily:ACFonts.display, fontSize:16, fontWeight:700, letterSpacing:-0.3, fontVariantNumeric:'tabular-nums' }}>{m.v}</div>
                <div style={{ fontFamily:ACFonts.mono, fontSize:8.5, color:c.accent, letterSpacing:1.4, textTransform:'uppercase', marginTop:2 }}>{m.k}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop:22 }}>
          <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>42 results</ACMono>
          <div style={{ marginTop:10 }}>
            {[
              { t:'Chicken breast, grilled',        sub:'USDA · 4 oz',         k:'187' },
              { t:'Chicken breast, breaded',         sub:'USDA · 4 oz',         k:'248' },
              { t:'Chicken breast, rotisserie',      sub:'Whole Foods · 4 oz',  k:'195' },
              { t:"Trader Joe's · Just chicken",     sub:'TJ · 3 oz',           k:'140' },
              { t:'Chicken breast, air-fried (home)',sub:'Your recipe · 4 oz',  k:'192', own:true },
              { t:'Chipotle chicken',                sub:'Chipotle · 4 oz',     k:'180' },
              { t:'Sweetgreen · Mexican chicken',    sub:'Sweetgreen',          k:'165' },
              { t:'Poached chicken',                 sub:'USDA · 4 oz',         k:'170' },
            ].map((r,i,arr) => (
              <div key={i} style={{
                padding:'12px 0', borderBottom: i<arr.length-1 ? `1px solid ${c.hair}` : 'none',
                display:'flex', alignItems:'center', gap:12,
              }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13.5, fontWeight:600, color:c.fg, display:'flex', alignItems:'center', gap:6 }}>
                    <span>{r.t}</span>
                    {r.own && <span style={{ fontFamily:ACFonts.mono, fontSize:8.5, letterSpacing:1.4, textTransform:'uppercase', padding:'1px 4px', background:c.accent, color:c.ink, fontWeight:700 }}>mine</span>}
                  </div>
                  <div style={{ fontSize:11, color:c.mute, marginTop:3, fontFamily:ACFonts.mono, letterSpacing:0.3 }}>{r.sub}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontFamily:ACFonts.display, fontSize:16, fontWeight:700, color:c.fg, letterSpacing:-0.3, fontVariantNumeric:'tabular-nums' }}>{r.k}</div>
                  <div style={{ fontFamily:ACFonts.mono, fontSize:9, color:c.mute, letterSpacing:1, textTransform:'uppercase' }}>kcal</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding:'10px 22px 20px', background:c.bg, borderTop:`1px solid ${c.hair}` }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <ACLabel size={11} color={c.dim}>Can't find it?</ACLabel>
          <ACLabel size={12} color={c.accent} style={{ fontWeight:600 }}>+ Create food</ACLabel>
        </div>
      </div>
    </div>
  );
}
