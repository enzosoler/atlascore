import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACMono,
} from '../lib/paper.jsx';

export default function S105_Subscription_Manage({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
      <div style={{ padding:'14px 22px 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <ACLabel size={13} color={c.dim}>← Account</ACLabel>
        <ACLabel size={12} color={c.dim}>Support</ACLabel>
      </div>

      <div style={{ flex:1, overflow:'auto', padding:'14px 22px 20px' }}>
        {/* current plan card */}
        <div style={{ padding:'20px 18px', background:c.ink, color:c.paper, position:'relative', overflow:'hidden' }}>
          <ACMono size={10} color={c.accent} track={1.8} style={{ textTransform:'uppercase', fontWeight:700 }}>/// current plan</ACMono>
          <div style={{ marginTop:10, fontFamily:ACFonts.display, fontSize:38, fontWeight:800, letterSpacing:-1.4, lineHeight:0.9 }}>
            Pro <span style={{ color:c.accent }}>·</span> Annual
          </div>
          <div style={{ marginTop:10, display:'flex', gap:14, alignItems:'baseline' }}>
            <div>
              <div style={{ fontFamily:ACFonts.display, fontSize:24, fontWeight:700, letterSpacing:-0.6, fontVariantNumeric:'tabular-nums' }}>$180</div>
              <div style={{ fontFamily:ACFonts.mono, fontSize:9, color:'rgba(239,233,218,0.55)', letterSpacing:1.4, textTransform:'uppercase' }}>per year</div>
            </div>
            <div style={{ height:36, width:1, background:'rgba(239,233,218,0.2)' }} />
            <div>
              <div style={{ fontFamily:ACFonts.display, fontSize:24, fontWeight:700, letterSpacing:-0.6, fontVariantNumeric:'tabular-nums' }}>$15</div>
              <div style={{ fontFamily:ACFonts.mono, fontSize:9, color:'rgba(239,233,218,0.55)', letterSpacing:1.4, textTransform:'uppercase' }}>per month · eff</div>
            </div>
          </div>
          <div style={{ marginTop:14, fontSize:11.5, color:'rgba(239,233,218,0.65)' }}>Next charge · Sep 14, 2025 · Visa •••• 4242</div>
        </div>

        {/* change plan */}
        <div style={{ marginTop:18 }}>
          <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>change plan</ACMono>
          <div style={{ marginTop:10, display:'flex', flexDirection:'column', gap:8 }}>
            {[
              { k:'Monthly',  v:'$22/mo',  sub:'Billed every month',            tag:null,      active:false },
              { k:'Annual',   v:'$180/yr', sub:'Save $84/yr · currently active', tag:'CURRENT', active:true  },
              { k:'Lifetime', v:'$480',    sub:'One payment · forever',          tag:'NEW',     active:false },
            ].map(p => (
              <div key={p.k} style={{
                padding:'14px 14px', background: p.active ? `${c.accent}10` : c.card,
                border: p.active ? `1px solid ${c.accent}` : `1px solid transparent`,
                borderRadius:ACRadii.card,
                display:'flex', alignItems:'center', gap:12,
              }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <span style={{ fontSize:13.5, fontWeight:700, color:c.fg }}>{p.k}</span>
                    {p.tag && <span style={{
                      fontFamily:ACFonts.mono, fontSize:8.5, letterSpacing:1.4, textTransform:'uppercase',
                      padding:'2px 5px', background: p.active ? c.accent : c.fg, color: p.active ? c.ink : c.bg, fontWeight:700,
                    }}>{p.tag}</span>}
                  </div>
                  <div style={{ fontSize:11, color:c.dim, marginTop:2 }}>{p.sub}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontFamily:ACFonts.display, fontSize:16, fontWeight:700, color:c.fg, letterSpacing:-0.3, fontVariantNumeric:'tabular-nums' }}>{p.v}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* payment method */}
        <div style={{ marginTop:22 }}>
          <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>payment method</ACMono>
          <div style={{ marginTop:10, padding:'14px 14px', background:c.card, borderRadius:ACRadii.card, display:'flex', alignItems:'center', gap:12 }}>
            <div style={{
              padding:'4px 8px', background:c.ink, color:c.paper, fontFamily:ACFonts.mono, fontSize:10, fontWeight:700, letterSpacing:1,
            }}>VISA</div>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:ACFonts.mono, fontSize:13, color:c.fg, letterSpacing:1 }}>•••• 4242</div>
              <div style={{ fontSize:11, color:c.dim, marginTop:2 }}>Exp 08/28 · Jordan K.</div>
            </div>
            <div style={{ fontSize:11, color:c.accent, fontWeight:600 }}>Edit</div>
          </div>
        </div>

        {/* cancel */}
        <div style={{ marginTop:22 }}>
          <ACMono size={10} color={'#d64545'} track={1.6} style={{ textTransform:'uppercase', fontWeight:700 }}>cancel · danger</ACMono>
          <div style={{ marginTop:10, padding:14, borderLeft:`3px solid #d64545`, background:'rgba(214,69,69,0.08)' }}>
            <div style={{ fontSize:12.5, color:c.fg, lineHeight:1.5 }}>
              Cancelling keeps your data and history. You revert to the free tier on Sep 14. Re-subscribe anytime.
            </div>
            <div style={{ marginTop:10, fontSize:12, color:'#d64545', fontWeight:700, textTransform:'uppercase', letterSpacing:1.2, fontFamily:ACFonts.mono }}>
              Cancel subscription →
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
