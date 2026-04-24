import React, { useState } from 'react';
import {
  ACFonts, useACT,
  ACLabel, ACMono,
} from '../lib/paper.jsx';

export default function S107_Progress_Photo_Capture({ dark }) {
  const c = useACT(dark);
  const [step, setStep] = useState(1);
  const angles = ['front','side','back'];
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:c.ink, color:c.paper }}>
      <div style={{ padding:'14px 22px 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <ACLabel size={13} color={'rgba(239,233,218,0.6)'}>✕</ACLabel>
        <ACMono size={10} color={c.accent} track={1.6} style={{ textTransform:'uppercase', fontWeight:700 }}>{step}/3 · {angles[step-1]}</ACMono>
      </div>

      <div style={{ flex:1, display:'flex', flexDirection:'column', padding:'8px 22px 16px' }}>
        {/* viewfinder */}
        <div style={{
          flex:1, margin:'12px 0', position:'relative', background:'#0a0a0a', overflow:'hidden',
          border:'1px solid rgba(239,233,218,0.1)',
        }}>
          {/* ghost silhouette */}
          <svg viewBox="0 0 180 400" style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:0.12 }} preserveAspectRatio="xMidYMid meet">
            <path d="M90,20 C105,20 115,30 115,50 C115,65 108,75 100,80 L100,110 C115,115 130,130 135,160 L135,240 C135,260 125,280 118,300 L118,360 C118,375 108,390 90,390 C72,390 62,375 62,360 L62,300 C55,280 45,260 45,240 L45,160 C50,130 65,115 80,110 L80,80 C72,75 65,65 65,50 C65,30 75,20 90,20 Z" fill={c.bg} />
          </svg>

          {/* viewfinder corners */}
          {[['tl',{top:16,left:16}],['tr',{top:16,right:16}],['bl',{bottom:16,left:16}],['br',{bottom:16,right:16}]].map(([k,pos]) => (
            <div key={k} style={{
              position:'absolute', ...pos, width:24, height:24,
              borderTop:    ['tl','tr'].includes(k) ? `2px solid ${c.accent}` : 'none',
              borderBottom: ['bl','br'].includes(k) ? `2px solid ${c.accent}` : 'none',
              borderLeft:   ['tl','bl'].includes(k) ? `2px solid ${c.accent}` : 'none',
              borderRight:  ['tr','br'].includes(k) ? `2px solid ${c.accent}` : 'none',
            }} />
          ))}

          {/* crosshair label */}
          <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', fontFamily:ACFonts.mono, fontSize:10, color:c.accent, letterSpacing:1.6, textTransform:'uppercase', fontWeight:700, textAlign:'center' }}>
            align {angles[step-1]}
          </div>

          {/* lighting indicator */}
          <div style={{ position:'absolute', bottom:12, left:16, right:16, display:'flex', alignItems:'center', gap:10, fontFamily:ACFonts.mono, fontSize:10, letterSpacing:1.4, textTransform:'uppercase' }}>
            <div style={{ display:'flex', gap:2 }}>
              {[1,2,3,4,5].map(i => (
                <div key={i} style={{ width:4, height:10, background: i<=4 ? c.accent : 'rgba(239,233,218,0.15)' }} />
              ))}
            </div>
            <span style={{ color:'rgba(239,233,218,0.75)' }}>light · good</span>
            <div style={{ marginLeft:'auto', color:'rgba(239,233,218,0.6)' }}>4.2 m</div>
          </div>
        </div>

        {/* angle strip */}
        <div style={{ display:'flex', gap:6 }}>
          {angles.map((a,i) => (
            <div key={a} style={{
              flex:1, padding:'8px 6px', textAlign:'center',
              background: i===step-1 ? c.accent : 'rgba(239,233,218,0.05)',
              color: i===step-1 ? c.ink : (i<step-1 ? c.bg : 'rgba(239,233,218,0.4)'),
              fontFamily:ACFonts.mono, fontSize:10, letterSpacing:1.6, textTransform:'uppercase', fontWeight:700,
            }}>
              {i<step-1 ? '✓ ' : ''}{a}
            </div>
          ))}
        </div>

        <div style={{ marginTop:14, fontSize:11, color:'rgba(239,233,218,0.55)', lineHeight:1.5, textAlign:'center' }}>
          Photos stay on-device. Never leave unless you share.
        </div>
      </div>

      {/* shutter */}
      <div style={{ padding:'0 22px 26px', display:'flex', alignItems:'center', justifyContent:'center', gap:30 }}>
        <div style={{ width:40, height:40, border:'1px solid rgba(239,233,218,0.25)', display:'grid', placeItems:'center', fontFamily:ACFonts.mono, fontSize:12, color:c.paper }}>⟲</div>
        <button onClick={() => setStep(Math.min(3, step+1))} style={{
          width:72, height:72, borderRadius:'50%', border:`4px solid ${c.paper}`,
          background:c.accent, cursor:'pointer',
        }} />
        <div style={{ width:40, height:40, border:'1px solid rgba(239,233,218,0.25)', display:'grid', placeItems:'center', fontFamily:ACFonts.mono, fontSize:14, color:c.paper }}>⚙</div>
      </div>
    </div>
  );
}
