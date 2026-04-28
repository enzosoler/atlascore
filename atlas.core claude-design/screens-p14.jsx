// screens-p14.jsx — atlas.core · phase 16 · auth flow + missing active screens
//
// Auth flow (6):
//   S87  · login (email)
//   S88  · magic link sent
//   S89  · magic link callback (verifying)
//   S90  · signup (name + email)
//   S91  · forgot password
//   S92  · reset password
//
// Missing active screens (14):
//   S93  · focus mode (minimal workout timer)
//   S94  · streak ledger (anti-streak — adherence)
//   S95  · celebrations (PR unlock animation moment)
//   S96  · insights digest (weekly reads list)
//   S97  · coach home (AI coach full surface, not just chat)
//   S98  · nutrition search
//   S99  · meal plans (template picker)
//   S100 · body check-in (daily quick entry)
//   S101 · weight entry (keypad alt · second variant)
//   S102 · weight trend (alt · range compare)
//   S103 · 404 / not found
//   S104 · account hub (dashboard-style entry point)
//   S105 · subscription manage (inline upgrade/downgrade)
//   S106 · data export
//   S107 · progress photo capture (3-angle)

// ══════════════════════════════════════════════════════════════
// S87 — LOGIN (email magic link)
// ══════════════════════════════════════════════════════════════
function S87_Login({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:c.bg }}>
      <div style={{ padding:'14px 22px 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <ACBrand dark={dark} size={16} />
        <ACLabel size={12} color={c.dim}>Help</ACLabel>
      </div>

      <div style={{ flex:1, padding:'44px 22px 16px', display:'flex', flexDirection:'column' }}>
        <ACMono size={10} color={c.accent} track={1.8} style={{ textTransform:'uppercase', fontWeight:600 }}>/// sign in</ACMono>
        <div style={{ marginTop:8, fontFamily:ACFonts.display, fontSize:42, fontWeight:800, letterSpacing:-1.6, lineHeight:0.95, color:c.fg }}>
          Welcome back.
        </div>
        <div style={{ marginTop:10, fontSize:14, color:c.dim, lineHeight:1.5 }}>
          One field. No password. We'll send a code.
        </div>

        <div style={{ marginTop:32 }}>
          <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>email</ACMono>
          <div style={{ marginTop:8, borderBottom:`2px solid ${c.fg}`, paddingBottom:10 }}>
            <span style={{ fontFamily:ACFonts.display, fontSize:22, fontWeight:600, color:c.fg, letterSpacing:-0.4 }}>
              jordan@figma.com
              <span style={{ display:'inline-block', width:2, height:24, background:c.accent, marginLeft:2, verticalAlign:'middle', animation:'blink 1s infinite' }} />
            </span>
          </div>
        </div>

        <div style={{ marginTop:14, padding:'10px 12px', borderLeft:`2px solid ${c.accent}`, background:`${c.accent}12`, fontSize:12, color:c.fg, lineHeight:1.45 }}>
          We'll email you a 6-digit code. No password to remember, nothing to phish.
        </div>

        <div style={{ flex:1 }} />

        {/* divider */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:28 }}>
          <div style={{ flex:1, height:1, background:c.hair }} />
          <ACMono size={9} color={c.mute} track={1.6} style={{ textTransform:'uppercase' }}>or</ACMono>
          <div style={{ flex:1, height:1, background:c.hair }} />
        </div>
        <div style={{ marginTop:14, display:'flex', flexDirection:'column', gap:8 }}>
          {[
            { k:'apple', l:'Continue with Apple' },
            { k:'google',l:'Continue with Google' },
          ].map(p => (
            <button key={p.k} style={{
              padding:'14px 16px', border:`1px solid ${c.fg}18`, background:'transparent',
              color:c.fg, fontFamily:ACFonts.body, fontSize:13.5, fontWeight:600,
              display:'flex', alignItems:'center', gap:12, cursor:'pointer', borderRadius:ACRadii.button,
            }}>
              <div style={{ width:18, height:18, background:c.fg, color:c.bg, display:'grid', placeItems:'center', fontFamily:ACFonts.mono, fontSize:10, fontWeight:700 }}>
                {p.k==='apple' ? '' : 'G'}
              </div>
              <span>{p.l}</span>
              <span style={{ marginLeft:'auto', color:c.mute, fontSize:14 }}>→</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding:'12px 22px 22px', background:c.bg }}>
        <ACBtn primary block dark={dark} size="md" pill>Send code →</ACBtn>
        <div style={{ textAlign:'center', marginTop:10 }}>
          <ACLabel size={12} color={c.dim}>No account? <span style={{ color:c.accent, fontWeight:600 }}>Start here</span></ACLabel>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// S88 — MAGIC LINK SENT (enter code)
// ══════════════════════════════════════════════════════════════
function S88_Magic_Link_Sent({ dark }) {
  const c = useACT(dark);
  const code = ['4','7','2','','','']; // positions
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:c.bg }}>
      <div style={{ padding:'14px 22px 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <ACLabel size={13} color={c.dim}>← Back</ACLabel>
        <ACLabel size={12} color={c.dim}>Help</ACLabel>
      </div>

      <div style={{ flex:1, padding:'40px 22px 16px', display:'flex', flexDirection:'column' }}>
        <ACMono size={10} color={c.accent} track={1.8} style={{ textTransform:'uppercase', fontWeight:600 }}>/// check email</ACMono>
        <div style={{ marginTop:8, fontFamily:ACFonts.display, fontSize:38, fontWeight:800, letterSpacing:-1.4, lineHeight:0.95, color:c.fg }}>
          Code sent.
        </div>
        <div style={{ marginTop:10, fontSize:14, color:c.dim, lineHeight:1.5 }}>
          Enter the 6-digit code we sent to<br/>
          <span style={{ color:c.fg, fontWeight:600 }}>jordan@figma.com</span>
        </div>

        {/* code input */}
        <div style={{ marginTop:36, display:'flex', gap:8, justifyContent:'center' }}>
          {code.map((d,i) => (
            <div key={i} style={{
              width:42, height:56, border:`2px solid ${d ? c.fg : c.hair}`,
              display:'grid', placeItems:'center',
              background: i===3 ? `${c.accent}14` : 'transparent',
              borderColor: i===3 ? c.accent : (d ? c.fg : c.hair),
            }}>
              <span style={{ fontFamily:ACFonts.display, fontSize:26, fontWeight:700, color:c.fg, fontVariantNumeric:'tabular-nums' }}>
                {d || (i===3 ? <span style={{ width:2, height:28, background:c.accent, display:'inline-block' }} /> : '')}
              </span>
            </div>
          ))}
        </div>

        <div style={{ marginTop:28, padding:16, background:c.card, borderRadius:ACRadii.card }}>
          <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>delivery</ACMono>
          <div style={{ marginTop:8, display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:6, height:6, background:c.accent }} />
            <div style={{ flex:1, fontSize:12.5, color:c.fg }}>Delivered · 0:08 ago</div>
            <ACMono size={10.5} color={c.mute} track={0.4}>via email</ACMono>
          </div>
        </div>

        <div style={{ marginTop:16, fontSize:12, color:c.dim, lineHeight:1.5 }}>
          Didn't arrive? <span style={{ color:c.accent, fontWeight:600 }}>Resend in 0:47</span> or <span style={{ color:c.accent, fontWeight:600 }}>try another email</span>.
        </div>

        <div style={{ flex:1 }} />

        {/* keypad hint */}
        <div style={{ marginTop:14, padding:10, textAlign:'center', fontFamily:ACFonts.mono, fontSize:10.5, color:c.mute, letterSpacing:1.4, textTransform:'uppercase' }}>
          ⌨ paste from clipboard · keyboard ready
        </div>
      </div>

      <div style={{ padding:'12px 22px 22px', background:c.bg }}>
        <ACBtn primary block dark={dark} size="md" pill>Verify →</ACBtn>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// S89 — MAGIC LINK CALLBACK (verifying)
// ══════════════════════════════════════════════════════════════
function S89_Magic_Callback({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:c.ink, color:c.paper, alignItems:'center', justifyContent:'center', padding:22 }}>
      <ACMono size={10} color={c.accent} track={2.2} style={{ textTransform:'uppercase', fontWeight:600 }}>/// verifying · 001</ACMono>

      {/* animated pulse lockup */}
      <div style={{ marginTop:36, position:'relative', width:120, height:120, display:'grid', placeItems:'center' }}>
        <div style={{
          position:'absolute', inset:0, border:`2px solid ${c.accent}`,
          animation:'ac_pulse 2s ease-out infinite',
        }} />
        <div style={{
          position:'absolute', inset:10, border:`1px solid ${c.accent}`, opacity:0.5,
          animation:'ac_pulse 2s ease-out infinite 0.4s',
        }} />
        <div style={{ fontFamily:ACFonts.display, fontSize:48, fontWeight:800, letterSpacing:-2, color:c.accent }}>ac</div>
      </div>

      <div style={{ marginTop:36, fontFamily:ACFonts.display, fontSize:26, fontWeight:700, letterSpacing:-0.8, textAlign:'center', lineHeight:1.15 }}>
        Checking your code.
      </div>
      <div style={{ marginTop:10, fontSize:12.5, color:'rgba(239,233,218,0.55)', textAlign:'center', maxWidth:240, lineHeight:1.5 }}>
        Signing you in from <span style={{ fontFamily:ACFonts.mono }}>iPhone · Austin, TX</span>
      </div>

      {/* steps */}
      <div style={{ marginTop:36, display:'flex', flexDirection:'column', gap:6, width:'100%', maxWidth:260 }}>
        {[
          { k:'code',     done:true },
          { k:'account',  done:true },
          { k:'device',   active:true },
          { k:'sync',     pending:true },
        ].map(s => (
          <div key={s.k} style={{ display:'flex', alignItems:'center', gap:10, fontFamily:ACFonts.mono, fontSize:11, letterSpacing:1.5, textTransform:'uppercase' }}>
            <div style={{
              width:10, height:10,
              background: s.done ? c.accent : s.active ? c.accent : 'rgba(239,233,218,0.15)',
              animation: s.active ? 'ac_blink 1s infinite' : 'none',
            }} />
            <span style={{ color: s.pending ? 'rgba(239,233,218,0.4)' : 'rgba(239,233,218,0.85)', flex:1 }}>verifying {s.k}</span>
            <span style={{ color: s.done ? c.accent : 'rgba(239,233,218,0.3)' }}>{s.done ? 'ok' : s.active ? '…' : ''}</span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes ac_pulse { 0% { transform:scale(0.9); opacity:0.9 } 100% { transform:scale(1.25); opacity:0 } }
        @keyframes ac_blink { 50% { opacity:0.3 } }
      `}</style>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// S90 — SIGNUP (name + email)
// ══════════════════════════════════════════════════════════════
function S90_Signup({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:c.bg }}>
      <div style={{ padding:'14px 22px 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <ACLabel size={13} color={c.dim}>← Sign in</ACLabel>
        <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>1/2</ACMono>
      </div>

      <div style={{ flex:1, padding:'34px 22px 16px', display:'flex', flexDirection:'column' }}>
        <ACMono size={10} color={c.accent} track={1.8} style={{ textTransform:'uppercase', fontWeight:600 }}>/// create account</ACMono>
        <div style={{ marginTop:8, fontFamily:ACFonts.display, fontSize:38, fontWeight:800, letterSpacing:-1.4, lineHeight:0.95, color:c.fg }}>
          Start your<br/>
          <span style={{ background:c.ink, color:c.accent, padding:'0 6px' }}>system.</span>
        </div>
        <div style={{ marginTop:10, fontSize:13.5, color:c.dim, lineHeight:1.5 }}>
          14-day trial. No card. Full coach from day one.
        </div>

        {/* fields */}
        <div style={{ marginTop:32, display:'flex', flexDirection:'column', gap:22 }}>
          <div>
            <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>first name</ACMono>
            <div style={{ marginTop:6, borderBottom:`2px solid ${c.fg}`, paddingBottom:8 }}>
              <span style={{ fontFamily:ACFonts.display, fontSize:20, fontWeight:600, color:c.fg, letterSpacing:-0.3 }}>Jordan</span>
            </div>
          </div>
          <div>
            <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>email</ACMono>
            <div style={{ marginTop:6, borderBottom:`2px solid ${c.hair}`, paddingBottom:8 }}>
              <span style={{ fontFamily:ACFonts.display, fontSize:20, fontWeight:500, color:c.mute, letterSpacing:-0.2 }}>you@example.com</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop:30, padding:14, background:c.card, borderRadius:ACRadii.card }}>
          <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>what's in the trial</ACMono>
          <div style={{ marginTop:10, display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {['Full coach','All programs','Labs intake','Protocols','Watch companion','Crew'].map(x => (
              <div key={x} style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:c.fg }}>
                <div style={{ width:5, height:5, background:c.accent }} />{x}
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex:1 }} />
        <div style={{ fontSize:11, color:c.mute, lineHeight:1.5, textAlign:'center' }}>
          By continuing you accept the <span style={{ color:c.fg, textDecoration:'underline' }}>terms</span> and <span style={{ color:c.fg, textDecoration:'underline' }}>privacy</span>.
        </div>
      </div>

      <div style={{ padding:'12px 22px 22px', background:c.bg }}>
        <ACBtn primary block dark={dark} size="md" pill>Continue →</ACBtn>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// S91 — FORGOT PASSWORD (we don't have one — request magic code)
// ══════════════════════════════════════════════════════════════
function S91_Forgot({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:c.bg }}>
      <div style={{ padding:'14px 22px 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <ACLabel size={13} color={c.dim}>← Sign in</ACLabel>
        <ACLabel size={12} color={c.dim}>Help</ACLabel>
      </div>

      <div style={{ flex:1, padding:'34px 22px 16px', display:'flex', flexDirection:'column' }}>
        <ACMono size={10} color={c.accent} track={1.8} style={{ textTransform:'uppercase', fontWeight:600 }}>/// locked out</ACMono>
        <div style={{ marginTop:8, fontFamily:ACFonts.display, fontSize:34, fontWeight:800, letterSpacing:-1.2, lineHeight:0.95, color:c.fg }}>
          No password<br/>to forget.
        </div>
        <div style={{ marginTop:12, fontSize:13.5, color:c.dim, lineHeight:1.55 }}>
          atlas.core doesn't use passwords. If you can't access your email, tell us how to reach you and we'll verify another way.
        </div>

        <div style={{ marginTop:30 }}>
          <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>account email</ACMono>
          <div style={{ marginTop:6, borderBottom:`2px solid ${c.fg}`, paddingBottom:8 }}>
            <span style={{ fontFamily:ACFonts.display, fontSize:20, fontWeight:600, color:c.fg }}>jordan@figma.com</span>
          </div>
        </div>

        <div style={{ marginTop:26, display:'flex', flexDirection:'column', gap:10 }}>
          <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>instead, verify via</ACMono>
          {[
            { k:'sms',   l:'Text to ••• ••• 4412', avail:true },
            { k:'apple', l:'Apple ID · Jordan Kim',  avail:true },
            { k:'sup',   l:'Contact support',        avail:false },
          ].map(p => (
            <div key={p.k} style={{
              padding:'14px 14px', background:c.card, borderRadius:ACRadii.card,
              display:'flex', alignItems:'center', gap:12,
              borderLeft: p.avail ? `3px solid ${c.accent}` : '3px solid transparent',
              opacity: p.avail ? 1 : 0.6,
            }}>
              <div style={{
                width:32, height:32, background:c.ink, color:c.accent,
                display:'grid', placeItems:'center', fontFamily:ACFonts.mono, fontSize:11, fontWeight:700,
              }}>{p.k.slice(0,2).toUpperCase()}</div>
              <div style={{ flex:1, fontSize:13.5, fontWeight:600, color:c.fg }}>{p.l}</div>
              <div style={{ fontSize:14, color:c.mute }}>→</div>
            </div>
          ))}
        </div>

        <div style={{ flex:1 }} />
      </div>

      <div style={{ padding:'12px 22px 22px', background:c.bg }}>
        <ACBtn primary block dark={dark} size="md" pill>Send code to email</ACBtn>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// S92 — RESET (set a new email · change login email)
// ══════════════════════════════════════════════════════════════
function S92_Reset({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:c.bg }}>
      <div style={{ padding:'14px 22px 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <ACLabel size={13} color={c.dim}>← Account</ACLabel>
        <ACLabel size={12} color={c.accent} style={{ fontWeight:600 }}>Save</ACLabel>
      </div>

      <div style={{ flex:1, padding:'24px 22px 16px', display:'flex', flexDirection:'column' }}>
        <ACMono size={10} color={c.accent} track={1.8} style={{ textTransform:'uppercase', fontWeight:600 }}>/// change login email</ACMono>
        <div style={{ marginTop:8, fontFamily:ACFonts.display, fontSize:30, fontWeight:700, letterSpacing:-1, lineHeight:1, color:c.fg }}>
          Move your account.
        </div>

        <div style={{ marginTop:22, padding:14, background:c.card, borderRadius:ACRadii.card }}>
          <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>current</ACMono>
          <div style={{ marginTop:4, fontFamily:ACFonts.display, fontSize:18, color:c.fg, fontWeight:600, letterSpacing:-0.2 }}>jordan@figma.com</div>
        </div>

        <div style={{ marginTop:18 }}>
          <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>new email</ACMono>
          <div style={{ marginTop:6, borderBottom:`2px solid ${c.fg}`, paddingBottom:8 }}>
            <span style={{ fontFamily:ACFonts.display, fontSize:20, fontWeight:600, color:c.fg, letterSpacing:-0.3 }}>
              jordan.kim@gmail.com
              <span style={{ display:'inline-block', width:2, height:22, background:c.accent, marginLeft:2, verticalAlign:'middle' }} />
            </span>
          </div>
        </div>

        {/* 2-step verification */}
        <div style={{ marginTop:22, padding:'14px 14px', border:`2px solid ${c.accent}`, background:`${c.accent}10` }}>
          <ACMono size={10} color={c.accent} track={1.6} style={{ textTransform:'uppercase', fontWeight:700 }}>2-step verify</ACMono>
          <div style={{ marginTop:8, fontSize:12.5, color:c.fg, lineHeight:1.5 }}>
            We'll send a code to both the old and new address. Both must confirm before the change takes effect.
          </div>
        </div>

        <div style={{ marginTop:22, padding:14, background:c.card, borderRadius:ACRadii.card }}>
          <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>what moves</ACMono>
          <div style={{ marginTop:10, display:'flex', flexDirection:'column', gap:6, fontSize:12, color:c.fg }}>
            {['All logs, labs, protocols','14mo of history','Crew + coach state','Subscription (same Apple ID)'].map(x => (
              <div key={x} style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:5, height:5, background:c.accent }} />{x}
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex:1 }} />
        <div style={{ marginTop:14, fontSize:11, color:c.mute, lineHeight:1.5, textAlign:'center' }}>
          You'll be signed out of other devices · resigning takes 30s
        </div>
      </div>

      <div style={{ padding:'12px 22px 22px', background:c.bg }}>
        <ACBtn primary block dark={dark} size="md" pill>Send verification →</ACBtn>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// S93 — FOCUS MODE (minimal workout timer · screen dim-friendly)
//   Honors light/dark prop. In both, the surface is high-contrast
//   and stripped back. The rest timer is the hero — no gradient
//   clipping; solid glyph with an independent half-fill progress bar.
// ══════════════════════════════════════════════════════════════
function S93_Focus_Mode({ dark }) {
  const c = useACT(dark);
  // focus mode is always high-contrast: light mode = paper on paper,
  // dark mode = ink. surface = bg, text = fg — same tokens, just inverted.
  const surface = c.bg;
  const onSurface = c.fg;
  const onSurfaceDim = c.dim;
  const onSurfaceMute = c.mute;

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:surface, color:onSurface }}>
      {/* minimal header */}
      <div style={{ padding:'14px 22px 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <ACMono size={10} color={c.accent} track={1.8} style={{ textTransform:'uppercase', fontWeight:700 }}>/// focus</ACMono>
        <ACMono size={10} color={onSurfaceMute} track={1.6} style={{ textTransform:'uppercase' }}>push · set 3/5</ACMono>
      </div>

      <div style={{ flex:1, padding:'26px 22px 12px', display:'flex', flexDirection:'column', minHeight:0 }}>
        <ACMono size={11} color={onSurfaceDim} track={1.8} style={{ textTransform:'uppercase', fontWeight:600 }}>current lift</ACMono>
        <div style={{ marginTop:6, fontFamily:ACFonts.display, fontSize:32, fontWeight:700, letterSpacing:-1, lineHeight:1, color:onSurface }}>
          Barbell<br/>bench press.
        </div>

        {/* rest timer giant — solid, legible, not clipped */}
        <div style={{ marginTop:24, textAlign:'center' }}>
          <ACMono size={11} color={c.accent} track={2.4} style={{ textTransform:'uppercase', fontWeight:700 }}>rest</ACMono>
          <div style={{
            marginTop:4,
            fontFamily:ACFonts.display, fontSize:120, fontWeight:800,
            letterSpacing:-5, lineHeight:1.05, fontVariantNumeric:'tabular-nums',
            color:onSurface, padding:'4px 0',
          }}>2:14</div>
          {/* progress bar */}
          <div style={{ marginTop:4, height:3, background: dark ? 'rgba(239,233,218,0.14)' : 'rgba(15,10,5,0.1)', width:'100%' }}>
            <div style={{ width:'58%', height:'100%', background:c.accent }} />
          </div>
        </div>

        <div style={{ marginTop:22, padding:'14px 16px', border:`1px solid ${c.hair}` }}>
          <ACMono size={10} color={onSurfaceDim} track={1.6} style={{ textTransform:'uppercase' }}>next set</ACMono>
          <div style={{ marginTop:6, display:'flex', alignItems:'baseline', gap:14 }}>
            <div>
              <span style={{ fontFamily:ACFonts.display, fontSize:40, fontWeight:800, letterSpacing:-1.4, fontVariantNumeric:'tabular-nums', color:onSurface }}>225</span>
              <span style={{ fontSize:11, color:onSurfaceDim, marginLeft:4 }}>lb</span>
            </div>
            <div style={{ fontFamily:ACFonts.mono, fontSize:14, color:onSurfaceMute }}>×</div>
            <div>
              <span style={{ fontFamily:ACFonts.display, fontSize:40, fontWeight:800, letterSpacing:-1.4, fontVariantNumeric:'tabular-nums', color:onSurface }}>5</span>
              <span style={{ fontSize:11, color:onSurfaceDim, marginLeft:4 }}>reps</span>
            </div>
            <div style={{ marginLeft:'auto', fontFamily:ACFonts.mono, fontSize:10, color:c.accent, letterSpacing:1.4, textTransform:'uppercase', textAlign:'right', lineHeight:1.2 }}>target<br/>RPE 8</div>
          </div>
        </div>

        <div style={{ flex:1 }} />

        <div style={{ marginTop:14, paddingTop:12, borderTop:`1px solid ${c.hair}`, display:'flex', justifyContent:'space-between', fontFamily:ACFonts.mono, fontSize:10, letterSpacing:1.4, textTransform:'uppercase', color:onSurfaceMute }}>
          <span>session · 32:14</span>
          <span>tonnage · 14,280 lb</span>
        </div>
      </div>

      {/* 3-button bar */}
      <div style={{ padding:'10px 22px 22px', display:'grid', gridTemplateColumns:'1fr 2fr 1fr', gap:8 }}>
        <button style={{ padding:'14px 8px', background:'transparent', border:`1px solid ${c.hair}`, color:onSurface, fontFamily:ACFonts.mono, fontSize:10.5, letterSpacing:1.2, textTransform:'uppercase', fontWeight:700, cursor:'pointer' }}>+ 30s</button>
        <button style={{ padding:'14px 8px', background:c.accent, border:0, color: dark ? c.ink : c.bg, fontFamily:ACFonts.body, fontSize:13, fontWeight:700, cursor:'pointer', borderRadius:999 }}>Complete set →</button>
        <button style={{ padding:'14px 8px', background:'transparent', border:`1px solid ${c.hair}`, color:onSurface, fontFamily:ACFonts.mono, fontSize:10.5, letterSpacing:1.2, textTransform:'uppercase', fontWeight:700, cursor:'pointer' }}>Exit</button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// S94 — STREAK LEDGER (adherence, not streak — refuses guilt)
// ══════════════════════════════════════════════════════════════
function S94_Streak_Ledger({ dark }) {
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

        {/* refusal card */}
        <div style={{ marginTop:16, padding:14, background:c.ink, color:c.paper }}>
          <ACMono size={10} color={c.accent} track={1.6} style={{ textTransform:'uppercase' }}>on streaks</ACMono>
          <div style={{ marginTop:8, fontSize:12.5, lineHeight:1.55 }}>
            We don't reset to zero. Missed days are data, not debt. This is how often you showed up — over years, not weeks.
          </div>
        </div>

        {/* year summary */}
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

        {/* 365-day heatmap */}
        <div style={{ marginTop:22 }}>
          <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>last 365 · showed up</ACMono>
          <div style={{
            marginTop:12, display:'grid', gridTemplateColumns:'repeat(53, 1fr)', gap:2, fontFamily:ACFonts.mono,
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

        {/* recent run */}
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

// ══════════════════════════════════════════════════════════════
// S95 — CELEBRATIONS (PR unlock moment)
// ══════════════════════════════════════════════════════════════
function S95_Celebrations({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:c.bg, position:'relative', overflow:'hidden' }}>
      {/* confetti-free — instead, a giant ECG spike */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', opacity:0.12 }}>
        <svg viewBox="0 0 360 800" style={{ width:'100%', height:'100%' }}>
          <polyline fill="none" stroke={c.accent} strokeWidth="1.5" points="0,400 90,400 105,380 120,420 135,200 150,600 165,380 180,420 195,400 270,400 360,400" />
          <polyline fill="none" stroke={c.fg} strokeWidth="1" points="0,300 360,300" opacity="0.5" strokeDasharray="4 4" />
          <polyline fill="none" stroke={c.fg} strokeWidth="1" points="0,500 360,500" opacity="0.5" strokeDasharray="4 4" />
        </svg>
      </div>

      <div style={{ padding:'14px 22px 0', display:'flex', alignItems:'center', justifyContent:'space-between', position:'relative', zIndex:1 }}>
        <ACLabel size={13} color={c.dim}>✕</ACLabel>
        <ACLabel size={12} color={c.dim}>Skip</ACLabel>
      </div>

      <div style={{ flex:1, padding:'32px 22px 16px', position:'relative', zIndex:1, display:'flex', flexDirection:'column' }}>
        <ACMono size={11} color={c.accent} track={2.4} style={{ textTransform:'uppercase', fontWeight:700 }}>/// personal record · 014</ACMono>

        <div style={{ marginTop:24, fontFamily:ACFonts.display, fontSize:140, fontWeight:800, letterSpacing:-6, lineHeight:0.85, color:c.fg, fontVariantNumeric:'tabular-nums' }}>
          485
        </div>
        <div style={{ marginTop:4, fontFamily:ACFonts.mono, fontSize:13, color:c.accent, letterSpacing:2, textTransform:'uppercase', fontWeight:700 }}>
          lb · deadlift · new high
        </div>

        <div style={{ marginTop:12, padding:'10px 14px', background:c.ink, color:c.paper, alignSelf:'flex-start' }}>
          <ACMono size={10} color={c.accent} track={1.6} style={{ textTransform:'uppercase', fontWeight:700 }}>
            +15 lb from previous · mar 2025
          </ACMono>
        </div>

        <div style={{ marginTop:26, fontFamily:ACFonts.display, fontSize:26, fontWeight:700, letterSpacing:-0.8, lineHeight:1.15, color:c.fg }}>
          Seven months ago you<br/>thought 405 was your ceiling.
        </div>

        <div style={{ marginTop:28, padding:14, background:c.card, borderRadius:ACRadii.card }}>
          <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>the path here</ACMono>
          <div style={{ marginTop:12 }}>
            {[
              { d:'aug 24', v:'405', tag:'prev PR' },
              { d:'nov 24', v:'425' },
              { d:'jan 25', v:'455' },
              { d:'apr 25', v:'485', tag:'today', hot:true },
            ].map((r,i,arr) => (
              <div key={i} style={{
                padding:'6px 0', borderBottom: i<arr.length-1 ? `1px solid ${c.hair}` : 'none',
                display:'flex', alignItems:'baseline', gap:10,
              }}>
                <span style={{ fontFamily:ACFonts.mono, fontSize:10, color:c.mute, letterSpacing:1, textTransform:'uppercase', width:56 }}>{r.d}</span>
                <span style={{ flex:1, fontFamily:ACFonts.display, fontSize:18, fontWeight:600, color: r.hot ? c.accent : c.fg, letterSpacing:-0.3, fontVariantNumeric:'tabular-nums' }}>{r.v} lb</span>
                {r.tag && <span style={{ fontFamily:ACFonts.mono, fontSize:9, letterSpacing:1.4, textTransform:'uppercase', color: r.hot ? c.accent : c.mute, fontWeight:700 }}>{r.tag}</span>}
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex:1 }} />
      </div>

      <div style={{ padding:'12px 22px 22px', background:c.bg, position:'relative', zIndex:1, display:'flex', gap:10 }}>
        <ACBtn block dark={dark} size="md" pill>Keep private</ACBtn>
        <ACBtn primary block dark={dark} size="md" pill>Share card →</ACBtn>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// S96 — INSIGHTS DIGEST (weekly reads list)
// ══════════════════════════════════════════════════════════════
function S96_Insights_Digest({ dark }) {
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

        {/* featured */}
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

        {/* list */}
        <div style={{ marginTop:20 }}>
          {[
            { tag:'NUTRITION',  t:'Protein timing mattered more than I thought', d:'4 min', unread:true },
            { tag:'LABS',       t:'Why your ferritin drop isn\'t a red flag yet', d:'3 min', unread:true },
            { tag:'RECOVERY',   t:'Two nights of poor sleep = one lost session', d:'5 min', unread:true },
            { tag:'TRAINING',   t:'When to deload, by the actual numbers',       d:'4 min', unread:false },
            { tag:'PROTOCOLS',  t:'Creatine compliance is the whole game',       d:'2 min', unread:false },
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

// ══════════════════════════════════════════════════════════════
// S97 — COACH HOME (full coach surface, not just chat)
// ══════════════════════════════════════════════════════════════
function S97_Coach_Home({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
      <div style={{ padding:'14px 22px 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <ACBrand dark={dark} size={15} />
        <ACLabel size={12} color={c.dim}>Settings</ACLabel>
      </div>

      <div style={{ flex:1, overflow:'auto', padding:'14px 22px 80px' }}>
        <ACMono size={10} color={c.accent} track={1.8} style={{ textTransform:'uppercase', fontWeight:600 }}>/// coach · tue · 7:04 am</ACMono>
        <div style={{ marginTop:6, fontFamily:ACFonts.display, fontSize:28, fontWeight:700, letterSpacing:-0.8, lineHeight:1.05, color:c.fg }}>
          Good morning,<br/>Jordan.
        </div>

        {/* today's read */}
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

        {/* 3-up signals */}
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

        {/* active thread */}
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

        {/* three suggestions */}
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

// ══════════════════════════════════════════════════════════════
// S98 — NUTRITION SEARCH
// ══════════════════════════════════════════════════════════════
function S98_Nutrition_Search({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
      <div style={{ padding:'14px 22px 10px', display:'flex', alignItems:'center', gap:10 }}>
        <ACLabel size={13} color={c.dim}>← Fuel</ACLabel>
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
        {/* top match */}
        <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>top match</ACMono>
        <div style={{
          marginTop:8, padding:14, background:c.ink, color:c.paper, position:'relative', overflow:'hidden',
        }}>
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

        {/* results list */}
        <div style={{ marginTop:22 }}>
          <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>42 results</ACMono>
          <div style={{ marginTop:10 }}>
            {[
              { t:'Chicken breast, grilled', sub:'USDA · 4 oz', k:'187', hot:false },
              { t:'Chicken breast, breaded',  sub:'USDA · 4 oz', k:'248' },
              { t:'Chicken breast, rotisserie',sub:'Whole Foods · 4 oz', k:'195' },
              { t:'Trader Joe\'s · Just chicken', sub:'TJ · 3 oz', k:'140' },
              { t:'Chicken breast, air-fried (home)', sub:'Your recipe · 4 oz', k:'192', own:true },
              { t:'Chipotle chicken', sub:'Chipotle · 4 oz', k:'180' },
              { t:'Sweetgreen · Mexican chicken', sub:'Sweetgreen', k:'165' },
              { t:'Poached chicken', sub:'USDA · 4 oz', k:'170' },
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

// ══════════════════════════════════════════════════════════════
// S99 — MEAL PLANS (template picker)
// ══════════════════════════════════════════════════════════════
function S99_Meal_Plans({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
      <div style={{ padding:'14px 22px 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <ACLabel size={13} color={c.dim}>← Fuel</ACLabel>
        <ACLabel size={12} color={c.accent} style={{ fontWeight:600 }}>+ New</ACLabel>
      </div>

      <div style={{ flex:1, overflow:'auto', padding:'14px 22px 20px' }}>
        <ACMono size={10} color={c.dim} track={1.8} style={{ textTransform:'uppercase' }}>/// meal templates</ACMono>
        <div style={{ marginTop:6, fontFamily:ACFonts.display, fontSize:28, fontWeight:700, letterSpacing:-0.8, lineHeight:1.05, color:c.fg }}>
          One tap.<br/>
          <span style={{ fontSize:18, color:c.dim, fontWeight:600 }}>whole day on the plan</span>
        </div>

        {/* active */}
        <div style={{ marginTop:18, padding:16, background:c.ink, color:c.paper }}>
          <ACMono size={10} color={c.accent} track={1.6} style={{ textTransform:'uppercase', fontWeight:700 }}>active plan</ACMono>
          <div style={{ marginTop:8, fontFamily:ACFonts.display, fontSize:22, fontWeight:700, letterSpacing:-0.5 }}>Recomp · 220 g P · 2,640 kcal</div>
          <div style={{ marginTop:4, fontSize:11.5, color:'rgba(239,233,218,0.6)' }}>Matches your macro targets · 5 meals</div>
          <div style={{ marginTop:12, display:'flex', gap:8 }}>
            <button style={{ padding:'8px 12px', background:c.accent, border:0, color:c.ink, fontFamily:ACFonts.body, fontSize:11.5, fontWeight:700, cursor:'pointer' }}>Log today</button>
            <button style={{ padding:'8px 12px', background:'transparent', border:'1px solid rgba(239,233,218,0.2)', color:c.paper, fontFamily:ACFonts.body, fontSize:11.5, fontWeight:600, cursor:'pointer' }}>Swap</button>
          </div>
        </div>

        {/* alternatives */}
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

// ══════════════════════════════════════════════════════════════
// S100 — BODY CHECK-IN (daily 4-question quick entry)
// ══════════════════════════════════════════════════════════════
function S100_Body_Checkin({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
      <div style={{ padding:'14px 22px 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <ACLabel size={13} color={c.dim}>✕</ACLabel>
        <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>3/4</ACMono>
      </div>

      <div style={{ flex:1, overflow:'auto', padding:'24px 22px 16px' }}>
        <ACMono size={10} color={c.accent} track={1.8} style={{ textTransform:'uppercase', fontWeight:600 }}>/// morning check-in · 90s</ACMono>
        <div style={{ marginTop:6, fontFamily:ACFonts.display, fontSize:28, fontWeight:700, letterSpacing:-0.8, lineHeight:1.05, color:c.fg }}>
          How's the body?
        </div>

        {/* already answered preview */}
        <div style={{ marginTop:20, display:'flex', flexDirection:'column', gap:8 }}>
          {[
            { k:'sleep quality',  v:'7/10',  done:true },
            { k:'mood',           v:'solid', done:true },
          ].map(r => (
            <div key={r.k} style={{ padding:'10px 14px', background:c.card, borderRadius:ACRadii.chip, display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:5, height:5, background:c.accent }} />
              <div style={{ flex:1, fontFamily:ACFonts.mono, fontSize:10, letterSpacing:1.4, textTransform:'uppercase', color:c.dim }}>{r.k}</div>
              <div style={{ fontSize:12.5, fontWeight:600, color:c.fg }}>{r.v}</div>
              <div style={{ fontSize:12, color:c.accent }}>✓</div>
            </div>
          ))}
        </div>

        {/* active question */}
        <div style={{ marginTop:28 }}>
          <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>question 3</ACMono>
          <div style={{ marginTop:6, fontFamily:ACFonts.display, fontSize:24, fontWeight:700, letterSpacing:-0.6, lineHeight:1.15, color:c.fg }}>
            Any soreness?
          </div>
          <div style={{ marginTop:4, fontSize:12, color:c.dim }}>Pick any that apply</div>

          <div style={{ marginTop:18, display:'flex', flexWrap:'wrap', gap:8 }}>
            {[
              { k:'lower back', on:true },
              { k:'hamstrings', on:true },
              { k:'glutes',     on:false },
              { k:'quads',      on:false },
              { k:'upper back', on:false },
              { k:'shoulders',  on:false },
              { k:'chest',      on:false },
              { k:'arms',       on:false },
              { k:'none',       on:false },
            ].map(ch => (
              <div key={ch.k} style={{
                padding:'8px 14px',
                background: ch.on ? c.fg : 'transparent',
                color: ch.on ? c.bg : c.fg,
                border: ch.on ? 'none' : `1px solid ${c.fg}22`,
                fontFamily:ACFonts.body, fontSize:12.5, fontWeight:600,
                borderRadius:ACRadii.chip,
              }}>{ch.k}</div>
            ))}
          </div>

          <div style={{ marginTop:18, padding:'10px 14px', borderLeft:`2px solid ${c.accent}`, background:`${c.accent}10`, fontSize:12, color:c.fg, lineHeight:1.5 }}>
            Deadlift day was yesterday — lower back + hamstring soreness is on-pattern, not a flag.
          </div>
        </div>

        {/* upcoming */}
        <div style={{ marginTop:26, display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:5, height:5, background:c.hair }} />
          <ACMono size={10} color={c.mute} track={1.4} style={{ textTransform:'uppercase' }}>next · stress level (1 q)</ACMono>
        </div>
      </div>

      <div style={{ padding:'12px 22px 22px', background:c.bg, borderTop:`1px solid ${c.hair}`, display:'flex', gap:10 }}>
        <ACBtn block dark={dark} size="md" pill>Skip</ACBtn>
        <ACBtn primary block dark={dark} size="md" pill>Next →</ACBtn>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// S101 — WEIGHT ENTRY (range slider variant · alternative to numeric keypad S6b)
// ══════════════════════════════════════════════════════════════
function S101_Weight_Entry_Slider({ dark }) {
  const c = useACT(dark);
  const ticks = 40;
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
      <div style={{ padding:'14px 22px 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <ACLabel size={13} color={c.dim}>✕</ACLabel>
        <ACLabel size={12} color={c.accent} style={{ fontWeight:600 }}>Save</ACLabel>
      </div>

      <div style={{ flex:1, padding:'30px 22px 16px', display:'flex', flexDirection:'column' }}>
        <ACMono size={10} color={c.accent} track={1.8} style={{ textTransform:'uppercase', fontWeight:600 }}>/// weight · tue morning</ACMono>

        {/* huge number */}
        <div style={{ marginTop:22, textAlign:'center' }}>
          <div style={{
            fontFamily:ACFonts.display, fontSize:120, fontWeight:800,
            letterSpacing:-5, lineHeight:0.88, color:c.fg, fontVariantNumeric:'tabular-nums',
          }}>
            182.<span style={{ color:c.accent }}>4</span>
          </div>
          <div style={{ marginTop:4, fontFamily:ACFonts.mono, fontSize:12, color:c.dim, letterSpacing:1.6, textTransform:'uppercase', fontWeight:600 }}>
            lb · -0.2 from yesterday
          </div>
        </div>

        {/* ruler slider */}
        <div style={{ marginTop:46 }}>
          <div style={{
            position:'relative', height:56, display:'flex', alignItems:'flex-end',
            overflow:'hidden', borderLeft:`1px solid ${c.hair}`, borderRight:`1px solid ${c.hair}`,
          }}>
            {Array.from({length:ticks}).map((_,i) => {
              const mid = i===Math.floor(ticks/2);
              const major = i%5===0;
              return (
                <div key={i} style={{
                  flex:1, position:'relative', height: mid ? 52 : major ? 40 : 24,
                  borderLeft: i===0 ? 'none' : `1px solid ${mid ? c.accent : major ? c.fg : c.hair}`,
                  borderLeftWidth: mid ? 2 : 1,
                }} />
              );
            })}
            {/* center marker */}
            <div style={{
              position:'absolute', left:'50%', top:-2, bottom:0, width:2, background:c.accent, transform:'translateX(-50%)',
            }} />
          </div>
          <div style={{ marginTop:8, display:'flex', justifyContent:'space-between', fontFamily:ACFonts.mono, fontSize:10, color:c.mute, letterSpacing:1, textTransform:'uppercase' }}>
            <span>180.0</span>
            <span style={{ color:c.accent, fontWeight:700 }}>182.4</span>
            <span>184.0</span>
          </div>
        </div>

        {/* unit toggle */}
        <div style={{ marginTop:26, display:'flex', gap:4, padding:3, background:c.card, borderRadius:ACRadii.chip, alignSelf:'center' }}>
          {[['lb','lb'],['kg','kg'],['st','st lb']].map(([k,l]) => (
            <div key={k} style={{
              padding:'6px 14px', background: k==='lb' ? c.fg : 'transparent',
              color: k==='lb' ? c.bg : c.dim,
              fontFamily:ACFonts.body, fontSize:11.5, fontWeight:600,
              borderRadius:ACRadii.chip-2,
            }}>{l}</div>
          ))}
        </div>

        <div style={{ marginTop:26, padding:14, background:c.card, borderRadius:ACRadii.card }}>
          <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>7d moving avg</ACMono>
          <div style={{ marginTop:6, display:'flex', alignItems:'baseline', gap:8 }}>
            <span style={{ fontFamily:ACFonts.display, fontSize:22, fontWeight:700, color:c.fg, letterSpacing:-0.5, fontVariantNumeric:'tabular-nums' }}>182.6</span>
            <span style={{ fontFamily:ACFonts.mono, fontSize:11, color:c.accent, fontWeight:700 }}>↓ 0.8 in 14d</span>
          </div>
        </div>

        <div style={{ flex:1 }} />
      </div>

      <div style={{ padding:'12px 22px 22px', background:c.bg }}>
        <ACBtn primary block dark={dark} size="md" pill>Log at 6:42 am</ACBtn>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// S102 — WEIGHT TREND RANGE COMPARE
// ══════════════════════════════════════════════════════════════
function S102_Weight_Trend_Compare({ dark }) {
  const c = useACT(dark);
  const [range, setRange] = React.useState('90d');
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
      <div style={{ padding:'14px 22px 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <ACLabel size={13} color={c.dim}>← Body</ACLabel>
        <ACLabel size={12} color={c.accent} style={{ fontWeight:600 }}>Export</ACLabel>
      </div>

      <div style={{ flex:1, overflow:'auto', padding:'14px 22px 20px' }}>
        <ACMono size={10} color={c.dim} track={1.8} style={{ textTransform:'uppercase' }}>/// trend · range compare</ACMono>
        <div style={{ marginTop:6, fontFamily:ACFonts.display, fontSize:28, fontWeight:700, letterSpacing:-0.8, lineHeight:1.05, color:c.fg }}>
          Two quarters,<br/>
          <span style={{ color:c.accent }}>side by side.</span>
        </div>

        {/* range picker */}
        <div style={{ marginTop:18, display:'flex', gap:6 }}>
          {[['30d','30 D'],['90d','90 D'],['180d','6 MO'],['1y','1 YR'],['all','ALL']].map(([k,l]) => (
            <button key={k} onClick={() => setRange(k)} style={{
              flex:1, padding:'7px 6px', border:0, cursor:'pointer',
              background: range===k ? c.fg : c.card, color: range===k ? c.bg : c.dim,
              fontFamily:ACFonts.mono, fontSize:10, letterSpacing:1, fontWeight:700,
            }}>{l}</button>
          ))}
        </div>

        {/* overlaid chart */}
        <div style={{ marginTop:18, padding:14, background:c.card, borderRadius:ACRadii.card }}>
          <div style={{ display:'flex', gap:14, alignItems:'baseline' }}>
            <div>
              <div style={{ width:16, height:3, background:c.fg, marginBottom:4 }} />
              <ACMono size={9} color={c.dim} track={1.2}>q1 · 25</ACMono>
              <div style={{ fontFamily:ACFonts.display, fontSize:20, fontWeight:700, color:c.fg, letterSpacing:-0.4, fontVariantNumeric:'tabular-nums' }}>184.2 → 181.8</div>
            </div>
            <div>
              <div style={{ width:16, height:3, background:c.accent, marginBottom:4 }} />
              <ACMono size={9} color={c.dim} track={1.2}>q4 · 24</ACMono>
              <div style={{ fontFamily:ACFonts.display, fontSize:20, fontWeight:700, color:c.fg, letterSpacing:-0.4, fontVariantNumeric:'tabular-nums' }}>190.6 → 184.0</div>
            </div>
          </div>
          <svg viewBox="0 0 300 120" style={{ marginTop:14, width:'100%', height:120 }}>
            {/* grid */}
            {[0,1,2,3].map(i => (
              <line key={i} x1={0} y1={i*30+4} x2={300} y2={i*30+4} stroke={c.hair} strokeWidth="1" />
            ))}
            {/* q4 · 24 (accent) */}
            <polyline fill="none" stroke={c.accent} strokeWidth="2" opacity="0.85"
              points="0,10 30,18 60,25 90,35 120,40 150,52 180,60 210,70 240,78 270,88 300,95" />
            {/* q1 · 25 (fg) */}
            <polyline fill="none" stroke={c.fg} strokeWidth="2"
              points="0,45 30,48 60,52 90,56 120,55 150,60 180,62 210,68 240,70 270,72 300,78" />
            {/* end dots */}
            <circle cx="300" cy="95" r="4" fill={c.accent} />
            <circle cx="300" cy="78" r="4" fill={c.fg} />
          </svg>
          <div style={{ marginTop:6, display:'flex', justifyContent:'space-between', fontFamily:ACFonts.mono, fontSize:9, color:c.mute, letterSpacing:1, textTransform:'uppercase' }}>
            <span>w 01</span><span>w 04</span><span>w 08</span><span>w 12</span>
          </div>
        </div>

        {/* delta summary */}
        <div style={{ marginTop:16, padding:14, background:c.ink, color:c.paper }}>
          <ACMono size={10} color={c.accent} track={1.6} style={{ textTransform:'uppercase' }}>net delta</ACMono>
          <div style={{ marginTop:8, display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
            {[
              { k:'q4 drop', v:'-6.6', u:'lb' },
              { k:'q1 drop', v:'-2.4', u:'lb' },
              { k:'slope',   v:'-0.27', u:'/wk' },
            ].map(s => (
              <div key={s.k}>
                <ACMono size={9} color={'rgba(239,233,218,0.5)'} track={1.4} style={{ textTransform:'uppercase' }}>{s.k}</ACMono>
                <div style={{ fontFamily:ACFonts.display, fontSize:22, fontWeight:700, letterSpacing:-0.5, marginTop:3, fontVariantNumeric:'tabular-nums' }}>
                  {s.v}<span style={{ fontSize:11, color:c.accent, marginLeft:3 }}>{s.u}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop:16, padding:'10px 14px', borderLeft:`2px solid ${c.accent}`, background:`${c.accent}10`, fontSize:12, color:c.fg, lineHeight:1.5 }}>
          Q4 was aggressive cut. Q1 is maintenance-with-recomp — lower rate, more muscle retained.
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// S103 — 404 NOT FOUND
// ══════════════════════════════════════════════════════════════
function S103_NotFound({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:c.bg }}>
      <div style={{ padding:'14px 22px 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <ACLabel size={13} color={c.dim}>← Back</ACLabel>
        <ACBrand dark={dark} size={14} />
      </div>

      <div style={{ flex:1, padding:'40px 22px 16px', display:'flex', flexDirection:'column' }}>
        <ACMono size={10} color={c.accent} track={2} style={{ textTransform:'uppercase', fontWeight:700 }}>/// 404 · not found</ACMono>
        <div style={{
          marginTop:16, fontFamily:ACFonts.display, fontSize:160, fontWeight:800,
          letterSpacing:-8, lineHeight:0.82, color:c.fg, fontVariantNumeric:'tabular-nums',
        }}>
          404.
        </div>
        <div style={{ marginTop:12, fontFamily:ACFonts.display, fontSize:26, fontWeight:700, letterSpacing:-0.8, lineHeight:1.15, color:c.fg }}>
          This page isn't here.<br/>
          <span style={{ color:c.dim }}>Nothing broken on your side.</span>
        </div>

        {/* motif */}
        <div style={{ marginTop:30, margin:'30px -22px 0' }}>
          <svg viewBox="0 0 360 40" style={{ width:'100%', height:40 }}>
            <polyline fill="none" stroke={c.fg} strokeWidth="1.5" opacity="0.3"
              points="0,20 80,20 95,10 110,30 125,20 140,20" />
            <text x="170" y="24" fontFamily="JetBrains Mono" fontSize="10" fill={c.accent} letterSpacing="2" fontWeight="700" style={{ textTransform:'uppercase' }}>/ ? /</text>
            <polyline fill="none" stroke={c.fg} strokeWidth="1.5" opacity="0.3"
              points="210,20 280,20 295,10 310,30 325,20 360,20" />
          </svg>
        </div>

        <div style={{ marginTop:30, padding:14, background:c.card, borderRadius:ACRadii.card }}>
          <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>try instead</ACMono>
          <div style={{ marginTop:10, display:'flex', flexDirection:'column', gap:6 }}>
            {[
              { l:'Today · readiness', u:'/today' },
              { l:'Your coach',        u:'/coach' },
              { l:'Labs',              u:'/labs' },
              { l:'Settings',          u:'/settings' },
            ].map(r => (
              <div key={r.l} style={{ padding:'8px 0', display:'flex', alignItems:'center', gap:10, borderBottom:`1px solid ${c.hair}` }}>
                <div style={{ width:5, height:5, background:c.accent }} />
                <div style={{ flex:1, fontSize:12.5, color:c.fg, fontWeight:600 }}>{r.l}</div>
                <ACMono size={10} color={c.mute} track={0.3}>{r.u}</ACMono>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex:1 }} />
      </div>

      <div style={{ padding:'12px 22px 22px', background:c.bg }}>
        <ACBtn primary block dark={dark} size="md" pill>Go to today</ACBtn>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// S104 — ACCOUNT HUB
// ══════════════════════════════════════════════════════════════
function S104_Account_Hub({ dark }) {
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
            { k:'data', v:'47 MB' },
            { k:'renews',v:'sep 24' },
            { k:'devices',v:'3' },
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
              ['Profile',     'Jordan Kim · he/him'],
              ['Login email', 'jordan@figma.com'],
              ['Phone',       '••• ••• 4412'],
              ['Sign-in method','Magic code + Apple'],
            ],
          },
          {
            h:'plan',
            rows:[
              ['Subscription', 'Pro · annual',    { accent:true }],
              ['Next charge',  '$180.00 · sep 24'],
              ['Invoices',     '12 saved'],
              ['Billing email','jordan@figma.com'],
            ],
          },
          {
            h:'data',
            rows:[
              ['Integrations', '3 of 8 linked'],
              ['Export',       'JSON · CSV'],
              ['iCloud backup','On · 2 min ago',  { accent:true }],
              ['Delete account', '', { danger:true }],
            ],
          },
        ].map(sec => (
          <div key={sec.h} style={{ marginTop:22 }}>
            <ACMono size={10} color={c.dim} track={1.6} style={{ textTransform:'uppercase' }}>{sec.h}</ACMono>
            <div style={{ marginTop:10, background:c.card, borderRadius:ACRadii.card, overflow:'hidden' }}>
              {sec.rows.map(([k,v,opts={}], i, arr) => (
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

// ══════════════════════════════════════════════════════════════
// S105 — SUBSCRIPTION MANAGE
// ══════════════════════════════════════════════════════════════
function S105_Subscription_Manage({ dark }) {
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
              { k:'Monthly', v:'$22/mo', sub:'Billed every month',           tag:null },
              { k:'Annual',  v:'$180/yr', sub:'Save $84/yr · currently active',tag:'CURRENT', active:true },
              { k:'Lifetime',v:'$480',   sub:'One payment · forever',         tag:'NEW' },
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

// ══════════════════════════════════════════════════════════════
// S106 — DATA EXPORT
// ══════════════════════════════════════════════════════════════
function S106_Data_Export({ dark }) {
  const c = useACT(dark);
  const [fmt, setFmt] = React.useState('json');
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
              { k:'json',  l:'JSON',  sub:'full fidelity' },
              { k:'csv',   l:'CSV',   sub:'spreadsheet' },
              { k:'pdf',   l:'PDF',   sub:'human read' },
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
              { k:'Workouts · 468 sessions',     on:true },
              { k:'Meals · 2,142 entries',        on:true },
              { k:'Weights · 384 entries',         on:true },
              { k:'Labs · 8 panels · 84 markers', on:true },
              { k:'Protocols · 47 doses',          on:true },
              { k:'Coach threads · 312 messages',   on:false },
              { k:'Progress photos · 28 photos',    on:false },
              { k:'App events · debug data',        on:false },
            ].map((r,i,arr) => (
              <div key={i} style={{
                padding:'12px 14px', display:'flex', alignItems:'center', gap:12,
                borderBottom: i<arr.length-1 ? `1px solid ${c.hair}` : 'none',
              }}>
                <div style={{ flex:1, fontSize:12.5, color:c.fg }}>{r.k}</div>
                {/* ios toggle */}
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

// ══════════════════════════════════════════════════════════════
// S107 — PROGRESS PHOTO CAPTURE (3-angle)
// ══════════════════════════════════════════════════════════════
function S107_Progress_Photo_Capture({ dark }) {
  const c = useACT(dark);
  const [step, setStep] = React.useState(1);
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
          {[['tl',{top:16, left:16}], ['tr',{top:16, right:16}], ['bl',{bottom:16, left:16}], ['br',{bottom:16, right:16}]].map(([k,pos]) => (
            <div key={k} style={{
              position:'absolute', ...pos, width:24, height:24,
              borderTop:    ['tl','tr'].includes(k) ? `2px solid ${c.accent}` : 'none',
              borderBottom: ['bl','br'].includes(k) ? `2px solid ${c.accent}` : 'none',
              borderLeft:   ['tl','bl'].includes(k) ? `2px solid ${c.accent}` : 'none',
              borderRight:  ['tr','br'].includes(k) ? `2px solid ${c.accent}` : 'none',
            }} />
          ))}

          {/* crosshair */}
          <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', fontFamily:ACFonts.mono, fontSize:10, color:c.accent, letterSpacing:1.6, textTransform:'uppercase', fontWeight:700, textAlign:'center' }}>
            align {angles[step-1]}
          </div>

          {/* bottom lighting indicator */}
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

Object.assign(window, {
  S87_Login,
  S88_Magic_Link_Sent,
  S89_Magic_Callback,
  S90_Signup,
  S91_Forgot,
  S92_Reset,
  S93_Focus_Mode,
  S94_Streak_Ledger,
  S95_Celebrations,
  S96_Insights_Digest,
  S97_Coach_Home,
  S98_Nutrition_Search,
  S99_Meal_Plans,
  S100_Body_Checkin,
  S101_Weight_Entry_Slider,
  S102_Weight_Trend_Compare,
  S103_NotFound,
  S104_Account_Hub,
  S105_Subscription_Manage,
  S106_Data_Export,
  S107_Progress_Photo_Capture,
});
