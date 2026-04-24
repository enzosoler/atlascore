// screens-p10.jsx — atlas.core · phase 09 · batch B (S58–S67)
// Onboarding completion (workout / habits / constraints / summary / tour)
// + account surface (settings / integrations / danger zone / diagnostics / profile editor)
// Uses screens-lib atoms; renders at 360×780 via ACScreen.

// ══════════════════════════════════════════════════════════════
// S58 — ONBOARD · WORKOUT PREFERENCES
// ══════════════════════════════════════════════════════════════
function S58_Onboard_Workout({ dark }) {
  const c = useACT(dark);
  const days = ['M','T','W','T','F','S','S'];
  const chosen = [0,2,4,5]; // M W F S

  return (<>
      <div style={{ padding:'20px 24px 0' }}>
        <ACMono size={10} color={c.mute} track={2}>STEP 03 · 06</ACMono>
        <div style={{ display:'flex', gap:4, marginTop:8, height:2 }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} style={{ flex:1, background: i<=3 ? c.fg : c.hair }} />
          ))}
        </div>
      </div>

      <div style={{ padding:'32px 24px 20px' }}>
        <div style={{ fontFamily:ACFonts.display, fontSize:30, fontWeight:700, letterSpacing:-1, lineHeight:1.1, color:c.fg }}>
          How do you train?
        </div>
        <p style={{ margin:'10px 0 0', fontSize:14, color:c.dim, lineHeight:1.5 }}>
          Frequency and style. You can change this anytime.
        </p>
      </div>

      <div style={{ padding:'0 24px 20px' }}>
        <ACMono size={10} color={c.mute} track={1.6} style={{ marginBottom:10, display:'block' }}>DAYS · PER WEEK</ACMono>
        <div style={{ display:'flex', gap:6 }}>
          {days.map((d, i) => {
            const on = chosen.includes(i);
            return (
              <div key={i} style={{
                flex:1, padding:'14px 0', textAlign:'center',
                background: on ? c.fg : c.card,
                color: on ? c.bg : c.fg,
                borderRadius: ACRadii.chip,
                fontFamily:ACFonts.mono, fontSize:13, fontWeight:600, letterSpacing:0.4,
              }}>{d}</div>
            );
          })}
        </div>
        <ACMono size={10} color={c.accent} style={{ marginTop:10, display:'block' }} track={1.4}>4 DAYS · SELECTED</ACMono>
      </div>

      <div style={{ padding:'0 24px 20px' }}>
        <ACMono size={10} color={c.mute} track={1.6} style={{ marginBottom:10, display:'block' }}>STYLE</ACMono>
        {[
          { k:'powerlifting', sel:true,  d:'Strength · compound · low volume' },
          { k:'hypertrophy',  sel:false, d:'Muscle · moderate reps · higher volume' },
          { k:'hybrid',       sel:false, d:'Mix strength + cardio' },
          { k:'athletic',     sel:false, d:'Sport-specific · explosive' },
        ].map(o => (
          <div key={o.k} style={{
            display:'flex', justifyContent:'space-between', alignItems:'center',
            padding:'14px 16px', marginBottom:8,
            background: o.sel ? c.card2 : c.card,
            borderLeft: o.sel ? `3px solid ${c.accent}` : `3px solid transparent`,
            borderRadius: ACRadii.card,
          }}>
            <div>
              <div style={{ fontFamily:ACFonts.body, fontSize:15, fontWeight:600, color:c.fg, textTransform:'capitalize' }}>{o.k}</div>
              <div style={{ fontFamily:ACFonts.body, fontSize:12, color:c.dim, marginTop:2 }}>{o.d}</div>
            </div>
            <div style={{
              width:20, height:20, borderRadius:'50%',
              border: `1.5px solid ${o.sel ? c.accent : c.faint}`,
              background: o.sel ? c.accent : 'transparent',
            }} />
          </div>
        ))}
      </div>

      <div style={{ flex:1 }} />
      <div style={{ padding:'14px 24px 20px', display:'flex', gap:10 }}>
        <ACBtn dark={dark} style={{ flex:1, justifyContent:'center' }}>Back</ACBtn>
        <ACBtn primary dark={dark} style={{ flex:2, justifyContent:'center' }}>Continue →</ACBtn>
      </div>
  </>  );
}

// ══════════════════════════════════════════════════════════════
// S59 — ONBOARD · HABITS
// ══════════════════════════════════════════════════════════════
function S59_Onboard_Habits({ dark }) {
  const c = useACT(dark);
  const habits = [
    { k:'Sleep 7+ hrs',          on:true },
    { k:'8k+ steps daily',       on:true },
    { k:'Hydrate to target',     on:true },
    { k:'Log every meal',        on:false },
    { k:'No alcohol on weekdays',on:false },
    { k:'Read before bed',       on:false },
  ];
  return (<>
      <div style={{ padding:'20px 24px 0' }}>
        <ACMono size={10} color={c.mute} track={2}>STEP 04 · 06</ACMono>
        <div style={{ display:'flex', gap:4, marginTop:8, height:2 }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} style={{ flex:1, background: i<=4 ? c.fg : c.hair }} />
          ))}
        </div>
      </div>

      <div style={{ padding:'32px 24px 20px' }}>
        <div style={{ fontFamily:ACFonts.display, fontSize:30, fontWeight:700, letterSpacing:-1, lineHeight:1.1, color:c.fg }}>
          Pick 3 habits.
        </div>
        <p style={{ margin:'10px 0 0', fontSize:14, color:c.dim, lineHeight:1.5 }}>
          No streaks, no guilt. Just what you'll measure.
        </p>
      </div>

      <div style={{ padding:'0 24px', flex:1, overflow:'auto' }}>
        {habits.map((h, i) => (
          <div key={i} style={{
            display:'flex', justifyContent:'space-between', alignItems:'center',
            padding:'16px 16px', marginBottom:8,
            background: h.on ? c.card2 : c.card,
            borderRadius: ACRadii.card,
          }}>
            <div style={{ fontFamily:ACFonts.body, fontSize:15, fontWeight:600, color:c.fg }}>{h.k}</div>
            <div style={{
              width:44, height:26, background: h.on ? c.accent : c.hair,
              borderRadius: 999, position:'relative', padding:2,
            }}>
              <div style={{
                width:22, height:22, background: h.on ? c.ink : c.bg,
                borderRadius:'50%',
                transform: h.on ? 'translateX(18px)' : 'translateX(0)',
                transition: 'transform 120ms',
              }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding:'14px 24px 20px', display:'flex', gap:10 }}>
        <ACBtn dark={dark} style={{ flex:1, justifyContent:'center' }}>Back</ACBtn>
        <ACBtn primary dark={dark} style={{ flex:2, justifyContent:'center' }}>Continue →</ACBtn>
      </div>
  </>  );
}

// ══════════════════════════════════════════════════════════════
// S60 — ONBOARD · CONSTRAINTS
// ══════════════════════════════════════════════════════════════
function S60_Onboard_Constraints({ dark }) {
  const c = useACT(dark);
  return (<>
      <div style={{ padding:'20px 24px 0' }}>
        <ACMono size={10} color={c.mute} track={2}>STEP 05 · 06</ACMono>
        <div style={{ display:'flex', gap:4, marginTop:8, height:2 }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} style={{ flex:1, background: i<=5 ? c.fg : c.hair }} />
          ))}
        </div>
      </div>

      <div style={{ padding:'32px 24px 20px' }}>
        <div style={{ fontFamily:ACFonts.display, fontSize:30, fontWeight:700, letterSpacing:-1, lineHeight:1.1, color:c.fg }}>
          Anything to work around?
        </div>
        <p style={{ margin:'10px 0 0', fontSize:14, color:c.dim, lineHeight:1.5 }}>
          Injuries, allergies, dislikes. The coach will adapt.
        </p>
      </div>

      <div style={{ padding:'0 24px 14px' }}>
        <ACMono size={10} color={c.mute} track={1.6} style={{ marginBottom:10, display:'block' }}>INJURIES · MOBILITY</ACMono>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {['left knee','lower back','right shoulder'].map(t => (
            <ACChip key={t} inverse dark={dark}>{t} ×</ACChip>
          ))}
          {['none','neck','elbow','wrist','hip','ankle'].map(t => (
            <ACChip key={t} dark={dark}>{t} +</ACChip>
          ))}
        </div>
      </div>

      <div style={{ padding:'0 24px 14px' }}>
        <ACMono size={10} color={c.mute} track={1.6} style={{ marginBottom:10, display:'block' }}>DIET · AVOID</ACMono>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {['dairy','shellfish'].map(t => (
            <ACChip key={t} inverse dark={dark}>{t} ×</ACChip>
          ))}
          {['gluten','pork','eggs','nuts','soy','alcohol'].map(t => (
            <ACChip key={t} dark={dark}>{t} +</ACChip>
          ))}
        </div>
      </div>

      <div style={{ padding:'0 24px 20px' }}>
        <ACMono size={10} color={c.mute} track={1.6} style={{ marginBottom:10, display:'block' }}>ADDITIONAL NOTES</ACMono>
        <div style={{
          background:c.card, borderRadius:ACRadii.input,
          padding:'12px 14px', minHeight:70,
          fontFamily:ACFonts.body, fontSize:13, color:c.dim, lineHeight:1.5,
        }}>
          Rotator cuff twinge returning on heavy bench above 250. Tend to plateau mid-cut.
        </div>
      </div>

      <div style={{ flex:1 }} />
      <div style={{ padding:'14px 24px 20px', display:'flex', gap:10 }}>
        <ACBtn dark={dark} style={{ flex:1, justifyContent:'center' }}>Back</ACBtn>
        <ACBtn primary dark={dark} style={{ flex:2, justifyContent:'center' }}>Continue →</ACBtn>
      </div>
  </>  );
}

// ══════════════════════════════════════════════════════════════
// S61 — ONBOARD · SUMMARY (review + confirm)
// ══════════════════════════════════════════════════════════════
function S61_Onboard_Summary({ dark }) {
  const c = useACT(dark);
  const rows = [
    { k:'NAME',        v:'Mark Kelly' },
    { k:'AGE · SEX',   v:'34 · M' },
    { k:'HEIGHT · WT', v:'6\'1" · 178 lb' },
    { k:'GOAL',        v:'Re-comp · maintain strength' },
    { k:'TRAINING',    v:'4× · powerlifting' },
    { k:'HABITS',      v:'sleep · steps · hydration' },
    { k:'CONSTRAINTS', v:'knee · back · shoulder · dairy · shellfish' },
    { k:'INTEGRATIONS',v:'Apple Health · Whoop · Function' },
  ];
  return (<>
      <div style={{ padding:'20px 24px 0' }}>
        <ACMono size={10} color={c.mute} track={2}>STEP 06 · 06</ACMono>
        <div style={{ display:'flex', gap:4, marginTop:8, height:2 }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} style={{ flex:1, background: c.fg }} />
          ))}
        </div>
      </div>

      <div style={{ padding:'32px 24px 14px' }}>
        <ACMono size={10} color={c.accent} track={2} style={{ marginBottom:10, display:'block' }}>YOUR PROFILE</ACMono>
        <div style={{ fontFamily:ACFonts.display, fontSize:32, fontWeight:700, letterSpacing:-1.2, lineHeight:1.05, color:c.fg }}>
          Here's what we heard.
        </div>
      </div>

      <div style={{ padding:'0 24px', flex:1, overflow:'auto' }}>
        {rows.map((r, i) => (
          <div key={r.k} style={{
            display:'grid', gridTemplateColumns:'120px 1fr',
            padding:'14px 0',
            borderTop: i===0 ? `1px solid ${c.hair}` : `1px solid ${c.hair}`,
            alignItems:'baseline', gap:12,
          }}>
            <ACMono size={10} color={c.mute} track={1.6}>{r.k}</ACMono>
            <div style={{ fontFamily:ACFonts.body, fontSize:14, color:c.fg, lineHeight:1.4 }}>{r.v}</div>
          </div>
        ))}
        <div style={{
          marginTop:18, padding:'14px 16px',
          background:c.ink, color:c.paper, borderRadius:ACRadii.card,
        }}>
          <ACMono size={10} color={c.accent} track={1.6} style={{ marginBottom:6, display:'block' }}>THE REFUSAL</ACMono>
          <div style={{ fontFamily:ACFonts.body, fontSize:13, color:c.paper, lineHeight:1.5 }}>
            No streaks. No guilt. No badges. We'll report the numbers, you decide what to do.
          </div>
        </div>
      </div>

      <div style={{ padding:'14px 24px 20px', display:'flex', gap:10 }}>
        <ACBtn dark={dark} style={{ flex:1, justifyContent:'center' }}>Edit</ACBtn>
        <ACBtn primary dark={dark} style={{ flex:2, justifyContent:'center' }}>Begin</ACBtn>
      </div>
  </>  );
}

// ══════════════════════════════════════════════════════════════
// S62 — ONBOARD · TOUR (post-onboard feature walkthrough)
// ══════════════════════════════════════════════════════════════
function S62_Onboard_Tour({ dark }) {
  const c = useACT(dark);
  return (<>
      <div style={{ padding:'20px 24px 0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <ACMono size={10} color={c.mute} track={2}>TOUR · 02 · 04</ACMono>
        <ACMono size={10} color={c.dim} track={1.4}>SKIP ALL →</ACMono>
      </div>

      {/* hero stage */}
      <div style={{ padding:'30px 24px 0', display:'flex', justifyContent:'center' }}>
        <div style={{ position:'relative' }}>
          <ACRing size={200} value={87} dark={dark} thickness={14} />
          <div style={{
            position:'absolute', inset:0, display:'grid', placeItems:'center',
          }}>
            <div style={{ textAlign:'center' }}>
              <ACMono size={10} color={c.mute} track={1.6}>READINESS</ACMono>
              <div style={{ marginTop:2 }}><ACNum size={56} color={c.fg}>87</ACNum></div>
            </div>
          </div>
          {/* pointer callout */}
          <div style={{
            position:'absolute', top:30, right:-30,
            padding:'6px 10px', background:c.accent, color:c.ink,
            fontFamily:ACFonts.mono, fontSize:10, fontWeight:700,
            letterSpacing:1.2, textTransform:'uppercase',
          }}>THIS NUMBER</div>
        </div>
      </div>

      <div style={{ padding:'40px 24px 20px' }}>
        <div style={{ fontFamily:ACFonts.display, fontSize:28, fontWeight:700, letterSpacing:-0.9, lineHeight:1.1, color:c.fg }}>
          Readiness is the header of every day.
        </div>
        <p style={{ margin:'12px 0 0', fontSize:15, lineHeight:1.55, color:c.dim }}>
          HRV, RHR, sleep quality, training load — distilled into one honest number. If it drops, we tell you. If you push through, we log it.
        </p>
      </div>

      <div style={{ flex:1 }} />

      <div style={{ padding:'0 24px 12px', display:'flex', gap:6 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ flex:1, height:3, background: i===1 ? c.accent : c.hair }} />
        ))}
      </div>
      <div style={{ padding:'0 24px 20px', display:'flex', gap:10 }}>
        <ACBtn dark={dark} style={{ flex:1, justifyContent:'center' }}>Back</ACBtn>
        <ACBtn primary dark={dark} style={{ flex:2, justifyContent:'center' }}>Next →</ACBtn>
      </div>
  </>  );
}

// ══════════════════════════════════════════════════════════════
// S63 — ACCOUNT SETTINGS
// ══════════════════════════════════════════════════════════════
function S63_Account_Settings({ dark }) {
  const c = useACT(dark);

  const Row = ({ label, value, danger, chevron = true }) => (
    <div style={{
      display:'grid', gridTemplateColumns:'1fr auto',
      alignItems:'center', padding:'14px 16px',
      borderTop:`1px solid ${c.hair}`,
      color: danger ? '#e8391f' : c.fg,
    }}>
      <div style={{ fontFamily:ACFonts.body, fontSize:15, fontWeight:500, letterSpacing:-0.1 }}>{label}</div>
      <div style={{ display:'flex', alignItems:'center', gap:8, color:c.dim }}>
        {value && <ACMono size={11} color={c.dim}>{value}</ACMono>}
        {chevron && <span style={{ fontFamily:ACFonts.mono, fontSize:16, color:c.faint }}>›</span>}
      </div>
    </div>
  );

  const Section = ({ title, children }) => (
    <div style={{ padding:'0 20px 18px' }}>
      <ACMono size={10} color={c.mute} track={1.6} style={{ marginBottom:8, display:'block' }}>{title}</ACMono>
      <div style={{ background:c.card, borderRadius:ACRadii.card, overflow:'hidden' }}>{children}</div>
    </div>
  );

  return (<>
      <ACHeader sub="YOU" title="Account" dark={dark} />

      <div style={{ padding:'0 20px 18px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px', background:c.card, borderRadius:ACRadii.card }}>
          <div style={{
            width:52, height:52, borderRadius:'50%',
            background:c.ink, color:c.paper,
            display:'grid', placeItems:'center',
            fontFamily:ACFonts.display, fontSize:20, fontWeight:700,
          }}>MK</div>
          <div>
            <div style={{ fontFamily:ACFonts.body, fontSize:15, fontWeight:600, color:c.fg }}>Mark Kelly</div>
            <ACMono size={11} color={c.dim} style={{ marginTop:2, display:'block' }}>mark@kelly.co · pro</ACMono>
          </div>
        </div>
      </div>

      <div style={{ flex:1, overflow:'auto' }}>
        <Section title="ACCOUNT">
          <Row label="Name" value="Mark Kelly" />
          <Row label="Email" value="mark@kelly.co" />
          <Row label="Password" value="●●●●●●●●" />
          <Row label="Two-factor" value="On" chevron={false} />
        </Section>

        <Section title="PLAN">
          <Row label="Plan" value="Pro · $19/mo" />
          <Row label="Billing" value="Apr 22 · Visa 4242" />
          <Row label="Invoices" />
        </Section>

        <Section title="PREFERENCES">
          <Row label="Units" value="lb · ft · °F" />
          <Row label="Week starts" value="Monday" />
          <Row label="Appearance" value="Auto" />
          <Row label="Notifications" />
        </Section>

        <Section title="DATA">
          <Row label="Integrations" value="3 connected" />
          <Row label="Export data" />
          <Row label="Privacy" />
        </Section>

        <Section title="DANGER">
          <Row label="Sign out" chevron={false} />
          <Row label="Delete account" danger chevron={false} />
        </Section>
      </div>

      <ACTabBar active="you" dark={dark} />
  </>  );
}

// ══════════════════════════════════════════════════════════════
// S64 — INTEGRATIONS
// ══════════════════════════════════════════════════════════════
function S64_Integrations({ dark }) {
  const c = useACT(dark);
  const services = [
    { k:'Apple Health', stamp:'A', on:true, meta:'Syncing · 2 min ago' },
    { k:'Whoop',        stamp:'W', on:true, meta:'Syncing · live' },
    { k:'Function',     stamp:'F', on:true, meta:'Last labs · Apr 12' },
    { k:'Oura',         stamp:'O', on:false, meta:'Tap to connect' },
    { k:'Garmin',       stamp:'G', on:false, meta:'Tap to connect' },
    { k:'MyFitnessPal', stamp:'M', on:false, meta:'Tap to connect' },
    { k:'Google Fit',   stamp:'g', on:false, meta:'Tap to connect' },
    { k:'Strava',       stamp:'S', on:false, meta:'Tap to connect' },
  ];
  return (<>
      <ACHeader sub="ACCOUNT · DATA" title="Integrations" right={
        <ACChip dot dark={dark}>3 · live</ACChip>
      } dark={dark} />

      <div style={{ padding:'0 20px 16px' }}>
        <div style={{ background:c.card, padding:16, borderRadius:ACRadii.card, display:'flex', alignItems:'baseline', justifyContent:'space-between' }}>
          <div>
            <ACMono size={10} color={c.mute} track={1.6}>SYNCED · 30 DAYS</ACMono>
            <div style={{ marginTop:6 }}><ACNum size={26} color={c.fg}>42,118</ACNum></div>
            <ACMono size={10} color={c.mute} style={{ marginTop:4, display:'block' }}>DATA POINTS</ACMono>
          </div>
          <ACSpark w={140} h={40} dark={dark} />
        </div>
      </div>

      <div style={{ padding:'0 20px', flex:1, overflow:'auto' }}>
        {services.map((s, i) => (
          <div key={s.k} style={{
            display:'grid', gridTemplateColumns:'auto 1fr auto',
            alignItems:'center', gap:14, padding:'14px 0',
            borderTop: `1px solid ${c.hair}`,
          }}>
            <div style={{
              width:40, height:40, background: s.on ? c.fg : c.card2,
              color: s.on ? c.bg : c.fg,
              borderRadius:10, display:'grid', placeItems:'center',
              fontFamily:ACFonts.mono, fontSize:15, fontWeight:700,
            }}>{s.stamp}</div>
            <div>
              <div style={{ fontFamily:ACFonts.body, fontSize:15, fontWeight:600, color:c.fg, letterSpacing:-0.15 }}>{s.k}</div>
              <ACMono size={10} color={s.on ? c.accent : c.mute} style={{ marginTop:3, display:'block' }} track={1.2}>{s.meta}</ACMono>
            </div>
            <div style={{
              width:44, height:26, background: s.on ? c.accent : c.hair,
              borderRadius: 999, padding:2,
            }}>
              <div style={{
                width:22, height:22, background: s.on ? c.ink : c.bg,
                borderRadius:'50%',
                transform: s.on ? 'translateX(18px)' : 'translateX(0)',
                transition:'transform 120ms',
              }} />
            </div>
          </div>
        ))}
      </div>

      <ACTabBar active="you" dark={dark} />
  </>  );
}

// ══════════════════════════════════════════════════════════════
// S65 — DANGER ZONE
// ══════════════════════════════════════════════════════════════
function S65_Danger_Zone({ dark }) {
  const c = useACT(dark);
  const actions = [
    { k:'Pause account',   d:'Stop sync, keep data. Reversible.', danger:false, cta:'Pause' },
    { k:'Reset progress',  d:'Clear logs, keep identity and preferences.', danger:false, cta:'Reset' },
    { k:'Export all data', d:'CSV + JSON, emailed within the hour.',     danger:false, cta:'Export' },
    { k:'Delete account',  d:'Permanent. 30-day grace window.',           danger:true,  cta:'Delete' },
  ];
  return (<>
      <ACHeader sub="ACCOUNT" title="Danger zone" dark={dark} />

      <div style={{ padding:'0 20px 14px' }}>
        <div style={{
          padding:'14px 16px', background: dark ? 'rgba(232,57,31,0.12)' : 'rgba(232,57,31,0.08)',
          borderLeft: '3px solid #e8391f',
          borderRadius: ACRadii.card,
        }}>
          <ACMono size={10} color="#e8391f" track={1.8} style={{ display:'block', marginBottom:4 }}>READ FIRST</ACMono>
          <div style={{ fontFamily:ACFonts.body, fontSize:13, color:c.fg, lineHeight:1.5 }}>
            These actions are not undoable from the app. Export first if in doubt.
          </div>
        </div>
      </div>

      <div style={{ padding:'0 20px', flex:1, overflow:'auto' }}>
        {actions.map((a, i) => (
          <div key={a.k} style={{
            padding:'16px 0', borderTop: `1px solid ${c.hair}`,
            display:'grid', gridTemplateColumns:'1fr auto', gap:14, alignItems:'center',
          }}>
            <div>
              <div style={{ fontFamily:ACFonts.body, fontSize:15, fontWeight:600, color: a.danger ? '#e8391f' : c.fg }}>{a.k}</div>
              <div style={{ fontFamily:ACFonts.body, fontSize:12, color:c.dim, marginTop:4, lineHeight:1.5 }}>{a.d}</div>
            </div>
            <div style={{
              padding:'10px 14px',
              background: a.danger ? '#e8391f' : c.card2,
              color: a.danger ? c.paper : c.fg,
              fontFamily:ACFonts.body, fontSize:13, fontWeight:600,
              borderRadius: ACRadii.button, letterSpacing:-0.1,
            }}>{a.cta}</div>
          </div>
        ))}
      </div>

      <ACTabBar active="you" dark={dark} />
  </>  );
}

// ══════════════════════════════════════════════════════════════
// S66 — DIAGNOSTICS (technical self-check)
// ══════════════════════════════════════════════════════════════
function S66_Diagnostics({ dark }) {
  const c = useACT(dark);
  const rows = [
    { k:'app version',    v:'2.4.1', ok:true },
    { k:'build',          v:'8412',  ok:true },
    { k:'device',         v:'iPhone 16 Pro · iOS 26.1', ok:true },
    { k:'network',        v:'5G · 142 ms', ok:true },
    { k:'sync queue',     v:'0 items', ok:true },
    { k:'health kit',     v:'42 types · granted', ok:true },
    { k:'whoop api',      v:'ok · 74 ms', ok:true },
    { k:'function api',   v:'degraded · 620 ms', ok:false },
    { k:'push token',     v:'active', ok:true },
    { k:'last crash',     v:'none · 14 days', ok:true },
  ];
  return (<>
      <ACHeader sub="ACCOUNT · TECH" title="Diagnostics" right={
        <ACMono size={10} color={c.accent} track={1.4}>EXPORT</ACMono>
      } dark={dark} />

      <div style={{ padding:'0 20px 16px' }}>
        <div style={{ background:c.card, padding:16, borderRadius:ACRadii.card, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <ACMono size={10} color={c.mute} track={1.6}>STATUS</ACMono>
            <div style={{ marginTop:6, display:'flex', alignItems:'baseline', gap:10 }}>
              <span style={{
                width:10, height:10, background: c.accent,
                display:'inline-block',
              }} />
              <span style={{ fontFamily:ACFonts.display, fontSize:22, fontWeight:600, color:c.fg }}>Mostly healthy</span>
            </div>
            <ACMono size={10} color={c.mute} style={{ marginTop:4, display:'block' }}>1 · degraded service</ACMono>
          </div>
        </div>
      </div>

      <div style={{ padding:'0 20px', flex:1, overflow:'auto' }}>
        <ACMono size={10} color={c.mute} track={1.6} style={{ marginBottom:6, display:'block' }}>REPORT</ACMono>
        <div style={{ background:c.card, borderRadius:ACRadii.card, padding:'6px 14px' }}>
          {rows.map((r, i) => (
            <div key={r.k} style={{
              display:'grid', gridTemplateColumns:'1fr auto auto',
              padding:'10px 0', alignItems:'center', gap:10,
              borderTop: i===0 ? 'none' : `1px solid ${c.hair}`,
            }}>
              <ACMono size={11} color={c.dim} track={0.4}>{r.k}</ACMono>
              <ACMono size={11} color={c.fg} track={0.4}>{r.v}</ACMono>
              <span style={{
                width:6, height:6,
                background: r.ok ? c.accent : '#e8391f',
                display:'inline-block',
              }} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding:'14px 20px 16px' }}>
        <ACBtn dark={dark} block style={{ justifyContent:'center' }}>Copy report to clipboard</ACBtn>
      </div>

      <ACTabBar active="you" dark={dark} />
  </>  );
}

// ══════════════════════════════════════════════════════════════
// S67 — PROFILE EDITOR
// ══════════════════════════════════════════════════════════════
function S67_Profile_Editor({ dark }) {
  const c = useACT(dark);
  const Field = ({ label, value, hint }) => (
    <div style={{ padding:'14px 16px', borderTop:`1px solid ${c.hair}` }}>
      <ACMono size={10} color={c.mute} track={1.6}>{label}</ACMono>
      <div style={{ marginTop:4, fontFamily:ACFonts.body, fontSize:15, color:c.fg, fontWeight:500 }}>{value}</div>
      {hint && <ACMono size={10} color={c.dim} style={{ marginTop:4, display:'block' }}>{hint}</ACMono>}
    </div>
  );
  return (<>
      <ACHeader sub="YOU" title="Edit profile" right={
        <ACMono size={10} color={c.accent} track={1.4}>SAVE</ACMono>
      } dark={dark} />

      <div style={{ padding:'0 20px 16px' }}>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10, padding:'22px 0', background:c.card, borderRadius:ACRadii.card }}>
          <div style={{
            width:84, height:84, borderRadius:'50%',
            background:c.ink, color:c.paper,
            display:'grid', placeItems:'center',
            fontFamily:ACFonts.display, fontSize:30, fontWeight:700,
            position:'relative',
          }}>
            MK
            <div style={{
              position:'absolute', right:-4, bottom:-4,
              width:28, height:28, background:c.accent, borderRadius:'50%',
              display:'grid', placeItems:'center',
              fontFamily:ACFonts.mono, fontSize:12, fontWeight:700, color:c.ink,
            }}>+</div>
          </div>
          <ACMono size={10} color={c.mute} track={1.4}>TAP TO CHANGE</ACMono>
        </div>
      </div>

      <div style={{ padding:'0 20px', flex:1, overflow:'auto' }}>
        <div style={{ background:c.card, borderRadius:ACRadii.card, overflow:'hidden' }}>
          <Field label="FULL NAME"   value="Mark Kelly" />
          <Field label="HANDLE"      value="@markk"        hint="atlas.core/@markk" />
          <Field label="DATE OF BIRTH" value="May 12, 1991" hint="34 years old" />
          <Field label="SEX"         value="Male" />
          <Field label="HEIGHT"      value="6′ 1″ · 185 cm" />
          <Field label="LOCATION"    value="San Francisco, CA" />
          <Field label="BIO"         value="Building, lifting, labs." />
        </div>
      </div>

      <div style={{ padding:'14px 20px 16px' }}>
        <ACBtn primary dark={dark} block style={{ justifyContent:'center' }}>Save changes</ACBtn>
      </div>

      <ACTabBar active="you" dark={dark} />
  </>  );
}

Object.assign(window, {
  S58_Onboard_Workout, S59_Onboard_Habits, S60_Onboard_Constraints,
  S61_Onboard_Summary, S62_Onboard_Tour,
  S63_Account_Settings, S64_Integrations,
  S65_Danger_Zone, S66_Diagnostics, S67_Profile_Editor,
});
