import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACMono,
} from '../lib/paper.jsx';

export default function S94_Streak_Ledger({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
      <div style={{ padding:'14px 22px 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <ACLabel size={13} color={c.dim}>← Today</ACLabel>
        <ACLabel size={12} color={c.accent} style={{ fontWeight:600 }}>Share</ACLabel>
      </div>

      <div style={{ flex:1, overflow:'auto', padding:'14px 22px 20px' }}>
        <ACMono size={10} color={c.dim} track={1.8} style={{ textTransform:'uppercase' }}>/// the ledger</ACMono>
        <div style={{ marginTop:6, fontFamily:ACFonts.display, fontSize:28, fontWeight:700, letterSpacing:-0.8, lineHeight:1.05, color:c.fg }}>
          Showing up.<br/>
          <span style={{ fontSize:18, color:c.dim, fontWeight:600 }}>not chasing a streak</span>
        </div>

        <div style={{ marginTop:16, padding:14, background:c.ink, color:c.paper }}>
          <ACMono size={10} color={c.accent} track={1.6} style={{ textTransform:'uppercase' }}>on streaks</ACMono>
          <div style={{ marginTop:8, fontSize:12.5, lineHeight:1.55 }}>
            We don't reset to zero. Missed days are data, not debt. This is how often you showed up — over years, not weeks.
          </div>
        </div>

        <div style={{ marginTop:20, display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          {[
            { k:'2024', v:'287', sub:'sessions · 78%' },
            { k:'2023', v:'242', sub:'sessions · 66%' },
            { k:'ytd 25',v:'96',  sub:'sessions · 88%' },
            { k:'best wk',v:'7',   sub:'days · feb 24' },
          ].map(s => (
            <div key={s.k} style={{ padding:'12px 14px', background:c.card, borderRadius:ACRadii.card }}>
              <div style={{ fontFamily:ACFonts.mono, fontSize:9, letterSpacing:1.4, textTransform:'uppercase', color:c.dim }}>{s.k}</div>
              <div style={{ marginTop:4, fontFamily:ACFonts.display, fontSize:24, fontWeight:700, color:c.fg, letterSpacing:-0.6, fontVariantNumeric:'tabular-nums' }}>{s.v}</div>
              <div style={{ fontSize:10.5, color:c.mute, marginTop:2 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop:22 }}>
          <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>last 365 · showed up</ACMono>
          <div style={{
            marginTop:12, display:'grid', gridTemplateColumns:'repeat(53, 1fr)', gap:2,
          }}>
            {Array.from({length: 53*7}).map((_,i) => {
              const r = (Math.sin(i*0.13)+Math.cos(i*0.27))*0.5+0.5;
              const on = r > 0.42;
              const intensity = on ? 0.35 + r*0.65 : 0;
              return (
                <div key={i} style={{
                  aspectRatio:'1', background: on ? c.accent : c.hair,
                  opacity: on ? intensity : 1,
                }} />
              );
            })}
          </div>
          <div style={{ marginTop:8, display:'flex', justifyContent:'space-between', fontFamily:ACFonts.mono, fontSize:9, color:c.mute, letterSpacing:1.2, textTransform:'uppercase' }}>
            <span>apr '24</span><span>oct '24</span><span>apr '25</span>
          </div>
        </div>

        <div style={{ marginTop:22 }}>
          <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>last 28 days</ACMono>
          <div style={{ marginTop:10, display:'flex', gap:2, flexWrap:'wrap' }}>
            {Array.from({length:28}).map((_,i) => {
              const on = i===26 ? false : [0,3,5,10,16,22].indexOf(i) < 0;
              return (
                <div key={i} style={{
                  width:`calc(${100/14}% - 2px)`, aspectRatio:'1',
                  background: on ? c.accent : c.hair,
                  display:'grid', placeItems:'center',
                  fontFamily:ACFonts.mono, fontSize:9, fontWeight:600,
                  color: on ? c.ink : c.mute,
                }}>{i+1}</div>
              );
            })}
          </div>
          <div style={{ marginTop:10, fontSize:12, color:c.dim, lineHeight:1.5 }}>
            22 of 28 days. Two deliberate rest days, one sick day, one travel. All counted separately — not all misses are equal.
          </div>
        </div>
      </div>
    </div>
  );
}
