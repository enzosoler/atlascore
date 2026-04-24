import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACMono,
} from '../lib/paper.jsx';

export default function S104_Account_Hub({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
      <div style={{ padding:'14px 22px 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <ACLabel size={13} color={c.dim}>← Settings</ACLabel>
        <ACLabel size={12} color={c.accent} style={{ fontWeight:600 }}>Edit</ACLabel>
      </div>

      <div style={{ flex:1, overflow:'auto', padding:'14px 22px 20px' }}>
        {/* identity hero */}
        <div style={{ padding:'20px 4px 12px', display:'flex', alignItems:'center', gap:14 }}>
          <div style={{
            width:64, height:64, background:c.accent, color:c.ink,
            display:'grid', placeItems:'center', fontFamily:ACFonts.display, fontSize:24, fontWeight:800, letterSpacing:-1,
          }}>JK</div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:ACFonts.display, fontSize:22, fontWeight:700, color:c.fg, letterSpacing:-0.4, lineHeight:1 }}>Jordan Kim</div>
            <div style={{ marginTop:4, fontSize:11, color:c.dim }}>jordan@figma.com · member 14 mo</div>
            <div style={{ marginTop:6, display:'inline-flex', alignItems:'center', gap:4, padding:'3px 8px', background:c.accent, color:c.ink, fontFamily:ACFonts.mono, fontSize:9, letterSpacing:1.4, textTransform:'uppercase', fontWeight:700 }}>PRO · ANNUAL</div>
          </div>
        </div>

        {/* at-a-glance */}
        <div style={{ marginTop:14, display:'grid', gridTemplateColumns:'repeat(3, 1fr)', border:`1px solid ${c.hair}` }}>
          {[
            { k:'data',    v:'47 MB' },
            { k:'renews',  v:'sep 24' },
            { k:'devices', v:'3' },
          ].map((s,i) => (
            <div key={s.k} style={{ padding:'12px 10px', borderRight: i<2 ? `1px solid ${c.hair}` : 'none' }}>
              <div style={{ fontFamily:ACFonts.mono, fontSize:9, letterSpacing:1.4, textTransform:'uppercase', color:c.dim }}>{s.k}</div>
              <div style={{ marginTop:3, fontFamily:ACFonts.display, fontSize:18, fontWeight:700, color:c.fg, letterSpacing:-0.4, fontVariantNumeric:'tabular-nums' }}>{s.v}</div>
            </div>
          ))}
        </div>

        {/* sections */}
        {[
          {
            h:'account',
            rows:[
              ['Profile',          'Jordan Kim · he/him', {}],
              ['Login email',      'jordan@figma.com',    {}],
              ['Phone',            '••• ••• 4412',        {}],
              ['Sign-in method',   'Magic code + Apple',  {}],
            ],
          },
          {
            h:'plan',
            rows:[
              ['Subscription', 'Pro · annual',    { accent:true }],
              ['Next charge',  '$180.00 · sep 24', {}],
              ['Invoices',     '12 saved',         {}],
              ['Billing email','jordan@figma.com', {}],
            ],
          },
          {
            h:'data',
            rows:[
              ['Integrations',  '3 of 8 linked',  {}],
              ['Export',        'JSON · CSV',      {}],
              ['iCloud backup', 'On · 2 min ago',  { accent:true }],
              ['Delete account','',                { danger:true }],
            ],
          },
        ].map(sec => (
          <div key={sec.h} style={{ marginTop:22 }}>
            <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>{sec.h}</ACMono>
            <div style={{ marginTop:10, background:c.card, borderRadius:ACRadii.card, overflow:'hidden' }}>
              {sec.rows.map(([k,v,opts], i, arr) => (
                <div key={i} style={{
                  padding:'12px 14px', display:'flex', alignItems:'center', gap:10,
                  borderBottom: i<arr.length-1 ? `1px solid ${c.hair}` : 'none',
                }}>
                  <div style={{ flex:1, fontSize:13, color: opts.danger ? '#d64545' : c.fg, fontWeight: opts.danger ? 700 : 500 }}>{k}</div>
                  {v && <div style={{ fontSize:12, color: opts.accent ? c.accent : c.dim, fontWeight: opts.accent ? 600 : 500 }}>{v}</div>}
                  <div style={{ color:c.mute, fontSize:13 }}>›</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
