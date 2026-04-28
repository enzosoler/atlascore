// screens-p12.jsx — atlas.core · phase 12 · onboarding variants
// Four alternate entry points beyond the happy-path 5-step flow (S7–S11):
//   S72 · returning user      — re-onboarding after cancel
//   S73 · competitor import   — migrate from MacroFactor/MFP/Strong
//   S74 · invite via friend   — landing from a referral link
//   S75 · sponsored           — corporate / insurance-sponsored entry
//
// All reuse screens-p2 vocabulary: useACT, ACFonts, ACRadii, ACLabel,
// ACBtn, OBHeader pattern. 360×780 iOS frame.

// ══════════════════════════════════════════════════════════════
// S72 — RETURNING USER (post-cancel re-onboarding)
// ══════════════════════════════════════════════════════════════
function S72_Returning_User({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
      {/* Custom header — no step counter, "welcome back" instead */}
      <div style={{ padding:'14px 22px 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <ACLabel size={10} color={c.dim} style={{ fontFamily:ACFonts.mono, letterSpacing:2, textTransform:'uppercase' }}>/// WELCOME BACK</ACLabel>
        <ACLabel size={12} color={c.dim}>Sign out</ACLabel>
      </div>

      <div style={{ flex:1, overflow:'auto', padding:'28px 28px 16px' }}>
        <ACLabel size={12} color={c.accent} style={{ fontWeight:600, letterSpacing:0.3, textTransform:'uppercase' }}>Picking up where you left off</ACLabel>
        <div style={{
          marginTop:10, fontFamily:ACFonts.display, fontSize:32, fontWeight:700,
          letterSpacing:-1, lineHeight:1.05, color:c.fg,
        }}>
          Jordan — your<br/>data is still here.
        </div>
        <div style={{ marginTop:10, fontSize:14, color:c.dim, lineHeight:1.5 }}>
          You cancelled <span style={{ color:c.fg, fontWeight:600 }}>68 days ago</span>. Everything we logged for you is intact.
        </div>

        {/* What we still have */}
        <div style={{ marginTop:26, padding:18, background:c.card, borderRadius:ACRadii.card }}>
          <ACLabel size={10} color={c.dim} style={{ fontFamily:ACFonts.mono, letterSpacing:1.6, textTransform:'uppercase' }}>your archive</ACLabel>
          <div style={{ marginTop:12, display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            {[
              { k:'sessions',    v:'128' },
              { k:'prs · 4 big', v:'17'  },
              { k:'meals',       v:'1,842' },
              { k:'lab panels',  v:'3'  },
              { k:'photos',      v:'24' },
              { k:'coach msgs',  v:'312' },
            ].map(s => (
              <div key={s.k}>
                <ACNum size={22} color={c.fg} weight={700}>{s.v}</ACNum>
                <div style={{ fontSize:11, color:c.dim, fontFamily:ACFonts.mono, letterSpacing:1.4, textTransform:'uppercase', marginTop:2 }}>{s.k}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Since you've been gone */}
        <div style={{ marginTop:18, padding:'16px 18px', borderLeft:`2px solid ${c.accent}`, background:`${c.accent}14` }}>
          <ACLabel size={10} color={c.accent} style={{ fontFamily:ACFonts.mono, letterSpacing:1.6, textTransform:'uppercase' }}>since you've been gone</ACLabel>
          <div style={{ marginTop:8, fontSize:13.5, lineHeight:1.55, color:c.fg }}>
            Coach got smarter. We shipped protocols, a watch companion, and crew. Labs now accept Function Health directly.
          </div>
        </div>

        {/* Quick path */}
        <div style={{ marginTop:22, display:'flex', flexDirection:'column', gap:10 }}>
          <div style={{ padding:16, background:c.card, borderRadius:ACRadii.card, display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ width:36, height:36, background:c.fg, color:c.bg, display:'grid', placeItems:'center', fontFamily:ACFonts.mono, fontSize:13, fontWeight:700 }}>▶</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:600 }}>Resume where I left off</div>
              <div style={{ fontSize:12, color:c.dim, marginTop:2 }}>Recomp · week 04 · Tuesday push</div>
            </div>
          </div>
          <div style={{ padding:16, background:'transparent', border:`1px solid ${c.fg}18`, borderRadius:ACRadii.card, display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ width:36, height:36, border:`1px solid ${c.fg}30`, display:'grid', placeItems:'center', fontFamily:ACFonts.mono, fontSize:12 }}>↻</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:600 }}>Reassess — a lot has changed</div>
              <div style={{ fontSize:12, color:c.dim, marginTop:2 }}>3-step recheck · 2 min</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding:'14px 28px 26px', background:c.bg }}>
        <ACBtn primary block dark={dark} size="lg" pill>Resume recomp →</ACBtn>
        <div style={{ textAlign:'center', padding:'10px 0 0' }}>
          <ACLabel size={12} color={c.dim}>Need to export + delete instead?</ACLabel>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// S73 — COMPETITOR IMPORT (MacroFactor / MFP / Strong)
// ══════════════════════════════════════════════════════════════
function S73_Import({ dark }) {
  const c = useACT(dark);
  const [picked, setPicked] = React.useState('mf');
  const sources = [
    { k:'mf',     t:'MacroFactor',      sub:'14 mo · 1,204 logs',   stamp:'MF', hot:true },
    { k:'mfp',    t:'MyFitnessPal',     sub:'Full history',         stamp:'MP' },
    { k:'strong', t:'Strong',           sub:'Workouts · 240 sess',  stamp:'ST' },
    { k:'hevy',   t:'Hevy',             sub:'Workouts + PRs',       stamp:'HV' },
    { k:'apple',  t:'Apple Health',     sub:'Weight · sleep · HR',  stamp:'AH' },
    { k:'file',   t:'CSV / JSON file',  sub:'Custom export',        stamp:'··' },
  ];
  const selected = sources.find(s => s.k===picked);
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
      <OBHeader step={2} total={6} dark={dark} />

      <div style={{ flex:1, overflow:'auto', padding:'24px 28px 16px' }}>
        <ACLabel size={12} color={c.accent} style={{ fontWeight:600, letterSpacing:0.3, textTransform:'uppercase' }}>Bring your history</ACLabel>
        <div style={{
          marginTop:10, fontFamily:ACFonts.display, fontSize:32, fontWeight:700,
          letterSpacing:-1, lineHeight:1.05, color:c.fg,
        }}>
          Don't start<br/>from zero.
        </div>
        <div style={{ marginTop:10, fontSize:14, color:c.dim, lineHeight:1.5 }}>
          Your old app's data becomes your new baseline. Import once, own it forever.
        </div>

        {/* Source picker */}
        <div style={{ marginTop:24, display:'flex', flexDirection:'column', gap:8 }}>
          {sources.map(s => {
            const on = picked === s.k;
            return (
              <div key={s.k} onClick={()=>setPicked(s.k)} style={{
                padding:'14px 16px', borderRadius:ACRadii.card,
                background: on ? c.fg : c.card, color: on ? c.bg : c.fg,
                display:'flex', alignItems:'center', gap:12, cursor:'pointer',
              }}>
                <div style={{
                  width:34, height:34, background: on ? c.accent : `${c.fg}12`, color: on ? c.fg : c.fg,
                  display:'grid', placeItems:'center',
                  fontFamily:ACFonts.mono, fontSize:11, fontWeight:700,
                }}>{s.stamp}</div>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:14, fontWeight:600 }}>{s.t}</span>
                    {s.hot && <span style={{ padding:'2px 6px', background:on?c.accent:`${c.accent}30`, color: on?c.fg:c.accent, fontFamily:ACFonts.mono, fontSize:9, letterSpacing:1.2, fontWeight:700 }}>POPULAR</span>}
                  </div>
                  <div style={{ fontSize:12, marginTop:2, opacity: on ? 0.6 : 0.55 }}>{s.sub}</div>
                </div>
                <div style={{ fontFamily:ACFonts.mono, fontSize:14 }}>{on ? '●' : '○'}</div>
              </div>
            );
          })}
        </div>

        {/* What transfers — shown for picked source */}
        {selected && (
          <div style={{ marginTop:22, padding:'14px 16px', background:c.card, borderRadius:ACRadii.card }}>
            <ACLabel size={10} color={c.dim} style={{ fontFamily:ACFonts.mono, letterSpacing:1.6, textTransform:'uppercase' }}>{selected.t} → atlas.core</ACLabel>
            <div style={{ marginTop:10, display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
              {[
                { k:'foods · meals',   ok:true },
                { k:'daily totals',    ok:true },
                { k:'body weight',     ok:true },
                { k:'macro targets',   ok:true },
                { k:'workouts',        ok:selected.k==='strong'||selected.k==='hevy' },
                { k:'coach chat',      ok:false },
              ].map(r => (
                <div key={r.k} style={{ display:'flex', alignItems:'center', gap:6, fontSize:11.5 }}>
                  <span style={{
                    width:14, height:14, display:'grid', placeItems:'center',
                    background: r.ok ? c.fg : `${c.fg}14`, color: r.ok ? c.bg : c.dim,
                    fontFamily:ACFonts.mono, fontSize:9, fontWeight:700,
                  }}>{r.ok ? '✓' : '—'}</span>
                  <span style={{ color: r.ok ? c.fg : c.dim }}>{r.k}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ padding:'14px 28px 26px', background:c.bg }}>
        <ACBtn primary block dark={dark} size="lg" pill>Connect {selected?.t} →</ACBtn>
        <div style={{ textAlign:'center', padding:'10px 0 0' }}>
          <ACLabel size={12} color={c.dim}>Skip — I'll start fresh</ACLabel>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// S74 — INVITE-VIA-FRIEND landing
// ══════════════════════════════════════════════════════════════
function S74_Invite({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:c.bg }}>
      {/* Full-bleed inverted hero */}
      <div style={{
        background:c.fg, color:c.bg, padding:'20px 26px 28px',
        position:'relative', overflow:'hidden',
      }}>
        {/* ECG watermark */}
        <svg width="100%" height="60" viewBox="0 0 320 60" style={{ position:'absolute', inset:'auto 0 0 0', opacity:0.06 }} preserveAspectRatio="none">
          <path d="M0 30 L60 30 L72 10 L84 50 L96 30 L160 30 L172 14 L184 46 L196 30 L320 30" stroke={c.bg} strokeWidth="2" fill="none" />
        </svg>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <ACLabel size={10} color={`${c.bg}80`} style={{ fontFamily:ACFonts.mono, letterSpacing:2, textTransform:'uppercase' }}>/// INVITE · #AK-248</ACLabel>
          <ACLabel size={12} color={`${c.bg}70`}>Close</ACLabel>
        </div>

        <div style={{ marginTop:18, display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:52, height:52, background:c.accent, color:c.fg, display:'grid', placeItems:'center', fontFamily:ACFonts.display, fontSize:20, fontWeight:800 }}>AK</div>
          <div>
            <div style={{ fontSize:13, color:`${c.bg}90` }}>Invited by</div>
            <div style={{ fontSize:17, fontWeight:700, color:c.bg, letterSpacing:-0.3 }}>A. Kimura</div>
          </div>
        </div>

        <div style={{
          marginTop:22, fontFamily:ACFonts.display, fontSize:30, fontWeight:800,
          letterSpacing:-1.1, lineHeight:1.05, color:c.bg,
        }}>
          "Train with me.<br/>
          <span style={{ color:c.accent }}>60 days free.</span>"
        </div>
      </div>

      {/* Friend's numbers */}
      <div style={{ padding:'22px 26px 10px' }}>
        <ACLabel size={10} color={c.dim} style={{ fontFamily:ACFonts.mono, letterSpacing:1.6, textTransform:'uppercase' }}>AK · last 90 days</ACLabel>
        <div style={{ marginTop:12, display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
          {[
            { k:'PRs',        v:'12'    },
            { k:'tonnes',     v:'84.2k' },
            { k:'readiness',  v:'82'    },
          ].map(s => (
            <div key={s.k} style={{ padding:'12px 10px', border:`1px solid ${c.fg}14` }}>
              <ACNum size={22} color={c.fg} weight={700}>{s.v}</ACNum>
              <div style={{ fontSize:10, color:c.dim, fontFamily:ACFonts.mono, letterSpacing:1.4, textTransform:'uppercase', marginTop:2 }}>{s.k}</div>
            </div>
          ))}
        </div>
      </div>

      {/* What you both get */}
      <div style={{ padding:'16px 26px 10px', flex:1 }}>
        <ACLabel size={10} color={c.accent} style={{ fontFamily:ACFonts.mono, letterSpacing:1.6, textTransform:'uppercase' }}>what you both get</ACLabel>
        <div style={{ marginTop:10, display:'flex', flexDirection:'column', gap:10 }}>
          {[
            { k:'You',      v:'60 days Pro · free',     sub:'No card now. No trial limits.' },
            { k:'Aoi',      v:'One month added',        sub:'Applied automatically to her plan.' },
            { k:'Both',     v:'Auto-crewed',            sub:'You train alongside by default.' },
          ].map(r => (
            <div key={r.k} style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
              <div style={{ width:28, height:28, background:c.fg, color:c.bg, display:'grid', placeItems:'center', fontFamily:ACFonts.mono, fontSize:10, fontWeight:700, letterSpacing:0.6 }}>{r.k}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:600, color:c.fg }}>{r.v}</div>
                <div style={{ fontSize:12, color:c.dim, marginTop:2 }}>{r.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding:'14px 26px 26px', background:c.bg }}>
        <ACBtn primary block dark={dark} size="lg" pill>Start 60 days — no card →</ACBtn>
        <div style={{ textAlign:'center', padding:'10px 0 0' }}>
          <ACLabel size={11} color={c.dim}>Invite expires in 7 days · terms</ACLabel>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// S75 — SPONSORED (corporate / insurance)
// ══════════════════════════════════════════════════════════════
function S75_Sponsored({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
      {/* Minimal header — sponsor stamp instead of step counter */}
      <div style={{ padding:'14px 22px 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <ACLabel size={10} color={c.dim} style={{ fontFamily:ACFonts.mono, letterSpacing:2, textTransform:'uppercase' }}>/// SPONSORED</ACLabel>
        <ACLabel size={12} color={c.dim}>Cancel</ACLabel>
      </div>

      <div style={{ flex:1, overflow:'auto', padding:'22px 28px 16px' }}>
        {/* Sponsor card */}
        <div style={{ padding:'14px 16px', border:`1.5px solid ${c.fg}`, display:'flex', alignItems:'center', gap:12 }}>
          <div style={{
            width:40, height:40, background:c.fg, color:c.bg,
            display:'grid', placeItems:'center', fontFamily:ACFonts.display, fontSize:14, fontWeight:800,
          }}>N</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:10, fontFamily:ACFonts.mono, letterSpacing:1.6, textTransform:'uppercase', color:c.dim }}>your employer</div>
            <div style={{ fontSize:14, fontWeight:700, color:c.fg, marginTop:2 }}>Nocturne Holdings</div>
          </div>
          <div style={{ padding:'4px 8px', background:c.accent, color:c.fg, fontFamily:ACFonts.mono, fontSize:9, letterSpacing:1.4, fontWeight:700 }}>VERIFIED</div>
        </div>

        {/* Hero */}
        <div style={{ marginTop:24 }}>
          <ACLabel size={12} color={c.accent} style={{ fontWeight:600, letterSpacing:0.3, textTransform:'uppercase' }}>Covered in full</ACLabel>
          <div style={{
            marginTop:10, fontFamily:ACFonts.display, fontSize:30, fontWeight:700,
            letterSpacing:-1, lineHeight:1.05, color:c.fg,
          }}>
            atlas.core Pro<br/>
            is <span style={{ color:c.accent }}>a benefit.</span>
          </div>
          <div style={{ marginTop:10, fontSize:14, color:c.dim, lineHeight:1.55 }}>
            Nocturne pays for your Pro subscription. Your data stays with you — never visible to HR, never sold.
          </div>
        </div>

        {/* What's included */}
        <div style={{ marginTop:22, background:c.card, borderRadius:ACRadii.card, overflow:'hidden' }}>
          {[
            { k:'Pro subscription',   v:'Full · $0/mo' },
            { k:'Lab panel · yearly', v:'Included' },
            { k:'AI coach',           v:'Unlimited' },
            { k:'Function Health',    v:'84 markers' },
          ].map((r, i, arr) => (
            <div key={r.k} style={{
              padding:'13px 16px', display:'flex', justifyContent:'space-between', alignItems:'center',
              borderBottom: i<arr.length-1 ? `1px solid ${c.fg}08` : 'none',
            }}>
              <span style={{ fontSize:13.5, color:c.fg }}>{r.k}</span>
              <span style={{ fontFamily:ACFonts.mono, fontSize:11, color:c.fg, letterSpacing:1.2, textTransform:'uppercase' }}>{r.v}</span>
            </div>
          ))}
        </div>

        {/* Privacy pledge */}
        <div style={{ marginTop:18, padding:'14px 16px', borderLeft:`2px solid ${c.accent}`, background:`${c.accent}10` }}>
          <ACLabel size={10} color={c.accent} style={{ fontFamily:ACFonts.mono, letterSpacing:1.6, textTransform:'uppercase' }}>privacy · no exceptions</ACLabel>
          <div style={{ marginTop:8, fontSize:13, lineHeight:1.55, color:c.fg }}>
            Nocturne receives <span style={{ fontWeight:700 }}>enrollment status only</span>. No weight, no labs, no activity — ever.
          </div>
        </div>

        {/* Verify step preview */}
        <div style={{ marginTop:20, padding:'12px 14px', border:`1px dashed ${c.fg}24` }}>
          <ACLabel size={10} color={c.dim} style={{ fontFamily:ACFonts.mono, letterSpacing:1.6, textTransform:'uppercase' }}>next · verify</ACLabel>
          <div style={{ marginTop:6, fontSize:13, color:c.fg }}>Enter your work email to confirm eligibility.</div>
        </div>
      </div>

      <div style={{ padding:'14px 28px 26px', background:c.bg }}>
        <ACBtn primary block dark={dark} size="lg" pill>Verify with work email →</ACBtn>
        <div style={{ textAlign:'center', padding:'10px 0 0' }}>
          <ACLabel size={12} color={c.dim}>Not eligible? Start a personal plan</ACLabel>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  S72_Returning_User, S73_Import, S74_Invite, S75_Sponsored,
});
