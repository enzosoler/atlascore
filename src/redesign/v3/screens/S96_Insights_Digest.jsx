import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACMono,
} from '../lib/paper.jsx';

export default function S96_Insights_Digest({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
      <div style={{ padding:'14px 22px 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <ACLabel size={13} color={c.dim}>← Today</ACLabel>
        <ACLabel size={12} color={c.accent} style={{ fontWeight:600 }}>Archive</ACLabel>
      </div>

      <div style={{ flex:1, overflow:'auto', padding:'14px 22px 20px' }}>
        <ACMono size={10} color={c.dim} track={1.8} style={{ textTransform:'uppercase' }}>/// coach insights · this week</ACMono>
        <div style={{ marginTop:6, fontFamily:ACFonts.display, fontSize:32, fontWeight:700, letterSpacing:-1, lineHeight:1, color:c.fg }}>
          6 reads.<br/>
          <span style={{ fontSize:20, color:c.dim, fontWeight:600 }}>4 unread</span>
        </div>

        <div style={{ marginTop:18, padding:18, background:c.ink, color:c.paper, position:'relative', overflow:'hidden' }}>
          <svg viewBox="0 0 400 60" style={{ position:'absolute', top:0, right:-40, width:280, height:40, opacity:0.15 }}>
            <polyline fill="none" stroke={c.accent} strokeWidth="1.5" points="0,30 80,30 95,12 110,48 125,18 140,30 400,30" />
          </svg>
          <ACMono size={10} color={c.accent} track={1.8} style={{ textTransform:'uppercase', fontWeight:700 }}>the big one · 6 min read</ACMono>
          <div style={{ marginTop:10, fontFamily:ACFonts.display, fontSize:24, fontWeight:700, letterSpacing:-0.6, lineHeight:1.1 }}>
            Your HRV drift has a story.<br/>
            It's three weeks long.
          </div>
          <div style={{ marginTop:10, fontSize:12.5, color:'rgba(239,233,218,0.72)', lineHeight:1.5 }}>
            Resting HRV is down 18% since Mar 15. Sleep's the primary driver, not training load — and the fix isn't what you'd guess.
          </div>
          <div style={{ marginTop:12, display:'flex', alignItems:'center', gap:10, fontFamily:ACFonts.mono, fontSize:10, letterSpacing:1.4, textTransform:'uppercase', color:c.accent, fontWeight:700 }}>
            open →
          </div>
        </div>

        <div style={{ marginTop:20 }}>
          {[
            { tag:'NUTRITION',  t:'Protein timing mattered more than I thought', d:'4 min', unread:true },
            { tag:'LABS',       t:"Why your ferritin drop isn't a red flag yet",  d:'3 min', unread:true },
            { tag:'RECOVERY',   t:'Two nights of poor sleep = one lost session',  d:'5 min', unread:true },
            { tag:'TRAINING',   t:'When to deload, by the actual numbers',        d:'4 min', unread:false },
            { tag:'PROTOCOLS',  t:'Creatine compliance is the whole game',        d:'2 min', unread:false },
          ].map((r,i,arr) => (
            <div key={i} style={{
              padding:'14px 0', borderBottom: i<arr.length-1 ? `1px solid ${c.hair}` : 'none',
              display:'flex', alignItems:'flex-start', gap:12,
            }}>
              <div style={{
                fontFamily:ACFonts.mono, fontSize:9, letterSpacing:1.4, textTransform:'uppercase', fontWeight:700,
                padding:'3px 5px', background: r.unread ? c.accent : c.hair, color: r.unread ? c.ink : c.dim,
                marginTop:3, whiteSpace:'nowrap',
              }}>{r.tag}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13.5, fontWeight: r.unread ? 700 : 500, color:c.fg, lineHeight:1.35 }}>{r.t}</div>
                <div style={{ fontSize:11, color:c.mute, marginTop:4 }}>{r.d}</div>
              </div>
              {r.unread && <div style={{ width:6, height:6, background:c.accent, marginTop:6 }} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
