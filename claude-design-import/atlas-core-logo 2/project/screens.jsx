// screens.jsx — atlas.core app screens v2
// SF Pro + softened radii + more breathing room.
// Archivo Black reserved for brand moments (splash title, logo lockup).

// ══════════════════════════════════════════════════════════════
// SCREEN 1 — SPLASH / WELCOME
// ══════════════════════════════════════════════════════════════
function S1_Splash_A({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '48px 28px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <ACLabel size={11} color={c.mute}>v 1.0</ACLabel>
      </div>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
        <HeartMark size={128} color={c.fg} accent={c.accent} />
        <div>
          <div style={{
            fontFamily: ACFonts.brand, fontSize: 46, letterSpacing: -2.4,
            lineHeight: 0.95, color: c.fg, textTransform: 'lowercase',
          }}>
            atlas<span style={{ color: c.accent }}>.</span>core
          </div>
          <div style={{ marginTop: 14 }}>
            <ACLabel size={13} color={c.dim} track={0}>Your body, in signal.</ACLabel>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <ACBtn primary block dark={dark} size="lg" pill>Get started</ACBtn>
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <ACLabel size={13} color={c.dim}>
            Already a member? <span style={{ color: c.fg, fontWeight: 600 }}>Sign in</span>
          </ACLabel>
        </div>
      </div>
    </div>
  );
}

function S1_Splash_B({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px 28px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <ACBrand size={18} dark={dark} />
        <ACLabel size={11} color={c.mute}>est. 2026</ACLabel>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 18 }}>
        <ACLabel size={12} color={c.accent} style={{ fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>Manifesto</ACLabel>
        <div style={{
          fontFamily: ACFonts.brand, fontSize: 44, letterSpacing: -2.2,
          lineHeight: 1, color: c.fg, textTransform: 'lowercase',
        }}>
          The heart<br/>
          is the <span style={{ background: c.accent, color: c.ink, padding: '2px 10px', borderRadius: 8 }}>core</span>.
        </div>
        <div style={{ maxWidth: 290, fontSize: 15, lineHeight: 1.5, color: c.dim }}>
          One app for lift, eat, and readiness. No streaks. No coaching that sounds like a coach. Just signal.
        </div>

        <div style={{ marginTop: 14, padding: '18px 0', borderTop: `1px solid ${c.hair}`, borderBottom: `1px solid ${c.hair}` }}>
          <ACSpark w={300} h={30} stroke={2.2} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <ACBtn primary dark={dark} size="lg" pill style={{ flex: 1 }}>Create account</ACBtn>
        <ACBtn dark={dark} size="lg" pill>Sign in</ACBtn>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// SCREEN 2 — TODAY / HOME
// ══════════════════════════════════════════════════════════════
function S2_Today_A({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 22px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <ACBrand size={16} dark={dark} />
        <ACLabel size={12} color={c.dim}>Sat · 18 Apr</ACLabel>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '8px 22px 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '22px 0 24px' }}>
          <div style={{ position: 'relative' }}>
            <ACRing size={224} value={87} dark={dark} thickness={10} />
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <ACLabel size={11} color={c.dim} style={{ fontWeight: 500 }}>Readiness</ACLabel>
              <ACNum size={80} color={c.fg} weight={700} style={{ marginTop: 4 }}>87</ACNum>
              <div style={{ marginTop: 8 }}>
                <ACChip accent dark={dark}>Rising · +4</ACChip>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 18, fontSize: 14, color: c.dim, textAlign: 'center', maxWidth: 270, lineHeight: 1.5 }}>
            HRV 72 ms. Sleep 7h 42m. <span style={{ color: c.fg, fontWeight: 500 }}>Push lower body today.</span>
          </div>
        </div>

        <div style={{ background: c.fg, color: c.bg, padding: 20, borderRadius: ACRadii.card, marginTop: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <ACLabel size={11} color={c.accent} style={{ fontWeight: 600 }}>Today · Session 24</ACLabel>
            <ACLabel size={11} color="rgba(239,233,218,0.5)">58 min</ACLabel>
          </div>
          <div style={{ fontFamily: ACFonts.display, fontSize: 26, fontWeight: 700, letterSpacing: -0.8, lineHeight: 1.1 }}>
            Heavy Lower
          </div>
          <div style={{ fontSize: 13, marginTop: 6, opacity: 0.7 }}>
            Back squat · RDL · Bulgarian split · Calf raise
          </div>
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(239,233,218,0.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <ACLabel size={10} color="rgba(239,233,218,0.5)">Projected volume</ACLabel>
              <div style={{ fontFamily: ACFonts.display, fontSize: 20, fontWeight: 700, letterSpacing: -0.4, marginTop: 2 }}>18,420 lb</div>
            </div>
            <div style={{ background: c.accent, color: c.ink, padding: '10px 18px', borderRadius: 999, fontSize: 14, fontWeight: 600 }}>
              Start →
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
          <div style={{ padding: 18, background: c.card, borderRadius: ACRadii.card }}>
            <ACLabel size={11} color={c.dim}>Fuel · today</ACLabel>
            <div style={{ marginTop: 10 }}><ACNum size={34} color={c.fg}>1,842</ACNum></div>
            <div style={{ marginTop: 4 }}><ACLabel size={11} color={c.dim}>of 2,380 kcal</ACLabel></div>
            <div style={{ marginTop: 12, display: 'flex', height: 6, gap: 2, borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ flex: 2, background: c.accent }} />
              <div style={{ flex: 3, background: c.fg }} />
              <div style={{ flex: 1, background: c.faint }} />
            </div>
          </div>
          <div style={{ padding: 18, background: c.card, borderRadius: ACRadii.card }}>
            <ACLabel size={11} color={c.dim}>Weight · 14d</ACLabel>
            <div style={{ marginTop: 10 }}><ACNum size={34} color={c.fg}>182.4</ACNum></div>
            <div style={{ marginTop: 4 }}>
              <ACLabel size={11} color={c.accent} style={{ fontWeight: 600 }}>↓ 1.8 lb</ACLabel>
            </div>
            <div style={{ marginTop: 12 }}>
              <ACLine w={132} h={28} dark={dark} data={
                [188,187.6,186.9,186.1,185.8,185.2,184.9,184.3,184,183.4,183.2,182.8,182.6,182.4].map((v,i)=>({k:i,v}))
              } />
            </div>
          </div>
        </div>

        <div style={{ marginTop: 10, padding: 18, background: c.card, borderRadius: ACRadii.card, borderLeft: `3px solid ${c.accent}` }}>
          <ACLabel size={11} color={c.accent} style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>Coach</ACLabel>
          <div style={{ marginTop: 6, fontSize: 14, color: c.fg, lineHeight: 1.5 }}>
            Your sleep window has shifted 42 min later across the week. Protein was short by ~18g yesterday.
          </div>
        </div>
      </div>

      <ACTabBar active="today" dark={dark} />
    </div>
  );
}

function S2_Today_B({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 22px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <ACBrand size={16} dark={dark} />
        <ACChip dark={dark} dot>Streak · 14</ACChip>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '12px 22px 20px' }}>
        <div style={{ padding: '14px 0 8px' }}>
          <ACLabel size={12} color={c.dim}>Readiness · Sat 18 Apr</ACLabel>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <ACNum size={144} color={c.fg} weight={700}>87</ACNum>
          <div style={{ textAlign: 'right', paddingBottom: 14 }}>
            <ACChip accent dark={dark}>Rising</ACChip>
            <div style={{ marginTop: 8 }}><ACLabel size={11} color={c.dim}>+4 vs avg</ACLabel></div>
          </div>
        </div>

        <div style={{ margin: '10px 0 18px' }}>
          <ACSpark w={312} h={40} stroke={2.4} dark={dark} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderRadius: ACRadii.card, overflow: 'hidden', background: c.card }}>
          {[
            { k: 'HRV',   v: '72',   u: 'ms' },
            { k: 'RHR',   v: '54',   u: 'bpm' },
            { k: 'Sleep', v: '7:42', u: 'hrs' },
          ].map((m, i) => (
            <div key={m.k} style={{
              padding: '16px 10px', textAlign: 'center',
              borderRight: i < 2 ? `1px solid ${c.hair}` : 'none',
            }}>
              <ACLabel size={11} color={c.dim}>{m.k}</ACLabel>
              <div style={{ marginTop: 6 }}>
                <ACNum size={24} color={c.fg} weight={700}>{m.v}</ACNum>
                <span style={{ fontSize: 11, color: c.dim, marginLeft: 3 }}>{m.u}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <ACLabel size={12} color={c.dim}>Today · Plan</ACLabel>
            <ACLabel size={12} color={c.dim}>3 of 4 done</ACLabel>
          </div>
          {[
            { t: 'Workout · Heavy Lower', d: '58 min · 8 exercises', done: false, active: true },
            { t: 'Meals · 1,842 / 2,380 kcal', d: 'Breakfast · lunch logged', done: false },
            { t: 'Weight · 182.4 lb', d: 'Logged 7:14 AM', done: true },
            { t: 'Check-in · evening', d: 'Tonight 9:00 PM', done: false },
          ].map((r, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0',
              borderTop: i === 0 ? `1px solid ${c.hair}` : 'none',
              borderBottom: `1px solid ${c.hair}`,
            }}>
              <div style={{
                width: 18, height: 18, borderRadius: 6,
                background: r.done ? c.accent : (r.active ? c.fg : 'transparent'),
                border: r.done || r.active ? 'none' : `1.5px solid ${c.faint}`,
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 500, color: r.done ? c.dim : c.fg, textDecoration: r.done ? 'line-through' : 'none' }}>
                  {r.t}
                </div>
                <ACLabel size={12} color={c.mute}>{r.d}</ACLabel>
              </div>
              {r.active && <ACChip accent dark={dark}>Now</ACChip>}
            </div>
          ))}
        </div>
      </div>

      <ACTabBar active="today" dark={dark} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// SCREEN 3 — ACTIVE WORKOUT + REST TIMER
// ══════════════════════════════════════════════════════════════
function S3_Workout_A({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 22px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <ACLabel size={11} color={c.dim}>Session 24</ACLabel>
          <div style={{ fontFamily: ACFonts.display, fontSize: 24, fontWeight: 700, letterSpacing: -0.6, color: c.fg, marginTop: 2 }}>
            Heavy Lower
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <ACLabel size={11} color={c.dim}>Elapsed</ACLabel>
          <div style={{ fontFamily: ACFonts.mono, fontSize: 18, fontWeight: 600, color: c.accent, marginTop: 2 }}>
            24:18
          </div>
        </div>
      </div>

      <div style={{ padding: '12px 22px' }}>
        <div style={{ display: 'flex', height: 6, gap: 3, borderRadius: 3, overflow: 'hidden' }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{
              flex: 1,
              background: i < 3 ? c.accent : (i === 3 ? c.fg : c.faint),
            }} />
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '8px 22px 20px' }}>
        <div style={{ padding: 20, background: c.fg, color: c.bg, borderRadius: ACRadii.card, marginTop: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <ACLabel size={11} color={c.accent} style={{ fontWeight: 600 }}>Now · Exercise 4</ACLabel>
            <ACLabel size={11} color="rgba(239,233,218,0.5)">Last: 215×5</ACLabel>
          </div>
          <div style={{ fontFamily: ACFonts.display, fontSize: 28, fontWeight: 700, letterSpacing: -0.8, marginTop: 8 }}>
            Back Squat
          </div>
          <div style={{ marginTop: 14, borderTop: '1px solid rgba(239,233,218,0.12)' }}>
            {[
              { n: 1, w: 215, r: 5, rpe: 7,   done: true },
              { n: 2, w: 215, r: 5, rpe: 8,   done: true },
              { n: 3, w: 225, r: 5, rpe: 8.5, done: true },
              { n: 4, w: 225, r: 5, rpe: null, done: false, active: true },
              { n: 5, w: 225, r: 5, rpe: null, done: false },
              { n: 6, w: 230, r: 4, rpe: null, done: false },
            ].map(s => (
              <div key={s.n} style={{
                display: 'grid', gridTemplateColumns: '32px 1fr 1fr 1fr 28px',
                alignItems: 'center', padding: '10px 8px',
                borderBottom: '1px solid rgba(239,233,218,0.08)',
                opacity: s.done ? 0.55 : 1,
                background: s.active ? 'rgba(232,181,0,0.14)' : 'transparent',
                borderRadius: s.active ? 10 : 0,
                margin: s.active ? '2px -8px' : 0,
              }}>
                <span style={{ fontFamily: ACFonts.mono, fontSize: 11, color: s.active ? c.accent : 'rgba(239,233,218,0.55)', fontWeight: 600 }}>{String(s.n).padStart(2,'0')}</span>
                <div style={{ fontFamily: ACFonts.mono, fontSize: 14, fontWeight: 600 }}>{s.w} <span style={{ opacity: 0.5, fontSize: 11 }}>lb</span></div>
                <div style={{ fontFamily: ACFonts.mono, fontSize: 14, fontWeight: 600 }}>{s.r} <span style={{ opacity: 0.5, fontSize: 11 }}>rep</span></div>
                <div style={{ fontFamily: ACFonts.mono, fontSize: 12, color: s.rpe ? c.accent : 'rgba(239,233,218,0.3)', fontWeight: 600 }}>
                  {s.rpe ? `@${s.rpe}` : '—'}
                </div>
                <div style={{ width: 18, height: 18, borderRadius: 6, background: s.done ? c.accent : 'transparent', border: s.done ? 'none' : '1.5px solid rgba(239,233,218,0.3)', justifySelf: 'end' }} />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, padding: '15px 0', background: c.accent, color: c.ink, textAlign: 'center', borderRadius: ACRadii.button, fontSize: 16, fontWeight: 600, letterSpacing: -0.2 }}>
            Log set · 225 × 5
          </div>
        </div>

        <div style={{ marginTop: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <ACLabel size={12} color={c.dim}>Queue · 4 more</ACLabel>
            <ACLabel size={12} color={c.dim}>Est. 34 min</ACLabel>
          </div>
          {[
            { n: '05', t: 'Romanian deadlift', sx: '4 × 8 · 185 lb' },
            { n: '06', t: 'Bulgarian split squat', sx: '3 × 10 · 45 lb' },
            { n: '07', t: 'Leg curl', sx: '4 × 12' },
            { n: '08', t: 'Standing calf raise', sx: '5 × 15' },
          ].map((e, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0',
              borderTop: i === 0 ? `1px solid ${c.hair}` : 'none',
              borderBottom: `1px solid ${c.hair}`,
            }}>
              <ACLabel size={12} color={c.mute} style={{ fontFamily: ACFonts.mono }}>{e.n}</ACLabel>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 500, color: c.fg }}>{e.t}</div>
                <ACLabel size={12} color={c.dim}>{e.sx}</ACLabel>
              </div>
              <div style={{ width: 14, height: 14, borderRadius: 5, background: c.faint }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function S3_Workout_B({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: c.fg, color: c.bg }}>
      <div style={{ padding: '14px 22px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <ACLabel size={11} color="rgba(239,233,218,0.5)">Rest · between sets</ACLabel>
        <ACLabel size={11} color="rgba(239,233,218,0.5)">Back squat · Set 4/6</ACLabel>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '0 28px' }}>
        <ACLabel size={12} color={c.accent} style={{ fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>Recover · breathe</ACLabel>
        <div style={{
          fontFamily: ACFonts.display, fontSize: 180, fontWeight: 700,
          letterSpacing: -8, lineHeight: 0.9, color: c.bg, marginTop: 16,
          fontVariantNumeric: 'tabular-nums',
        }}>
          1<span style={{ color: c.accent }}>:</span>42
        </div>
        <ACLabel size={12} color="rgba(239,233,218,0.5)" style={{ marginTop: 6 }}>
          of 2:30 programmed
        </ACLabel>

        <div style={{ marginTop: 40, width: '100%' }}>
          <ACSpark w={312} h={44} stroke={2.6} dark={true} color={c.accent} />
        </div>

        <div style={{ marginTop: 44, width: '100%', borderRadius: ACRadii.card, border: '1px solid rgba(239,233,218,0.12)', padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <ACLabel size={11} color="rgba(239,233,218,0.5)">Up next · Set 4</ACLabel>
            <ACLabel size={11} color={c.accent} style={{ fontWeight: 600 }}>+10 lb</ACLabel>
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'baseline' }}>
            <div>
              <ACNum size={52} color={c.bg} weight={700}>225</ACNum>
              <ACLabel size={10} color="rgba(239,233,218,0.5)" style={{ marginLeft: 4 }}>lb</ACLabel>
            </div>
            <div style={{ width: 1, height: 40, background: 'rgba(239,233,218,0.12)' }} />
            <div>
              <ACNum size={52} color={c.bg} weight={700}>5</ACNum>
              <ACLabel size={10} color="rgba(239,233,218,0.5)" style={{ marginLeft: 4 }}>rep</ACLabel>
            </div>
            <div style={{ width: 1, height: 40, background: 'rgba(239,233,218,0.12)' }} />
            <div>
              <ACNum size={52} color={c.accent} weight={700}>8</ACNum>
              <ACLabel size={10} color="rgba(239,233,218,0.5)" style={{ marginLeft: 4 }}>rpe</ACLabel>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: 22, display: 'flex', gap: 10 }}>
        <div style={{ flex: 1, padding: '15px 0', textAlign: 'center', borderRadius: 999, border: `1px solid rgba(239,233,218,0.22)`, color: c.bg, fontSize: 15, fontWeight: 600 }}>
          + 30s
        </div>
        <div style={{ flex: 2, padding: '15px 0', textAlign: 'center', borderRadius: 999, background: c.accent, color: c.ink, fontSize: 16, fontWeight: 600 }}>
          Skip rest →
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// SCREEN 4 — NUTRITION LOG
// ══════════════════════════════════════════════════════════════
function S4_Nutrition_A({ dark }) {
  const c = useACT(dark);
  const macros = [
    { k: 'p', label: 'Protein', v: 148, t: 186, u: 'g' },
    { k: 'c', label: 'Carbs',   v: 224, t: 286, u: 'g' },
    { k: 'f', label: 'Fat',     v: 62,  t: 79,  u: 'g' },
  ];
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 22px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <ACLabel size={11} color={c.dim}>Fuel · Sat 18 Apr</ACLabel>
          <div style={{ fontFamily: ACFonts.display, fontSize: 26, fontWeight: 700, letterSpacing: -0.8, color: c.fg, marginTop: 4 }}>
            Today's plate
          </div>
        </div>
        <ACChip accent dark={dark}>On track</ACChip>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '12px 22px 20px' }}>
        {/* Quick capture row */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {[
            { t: 'Scan', k: 'scan' },
            { t: 'Camera', k: 'camera' },
            { t: 'Voice', k: 'voice' },
            { t: 'Recents', k: 'recents' },
          ].map(b => (
            <div key={b.k} style={{
              flex: 1, padding: '14px 0 12px', borderRadius: ACRadii.input,
              background: c.card,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            }}>
              <CaptureIcon k={b.k} color={c.fg} accent={c.accent} />
              <ACLabel size={11} color={c.fg} style={{ fontWeight: 500 }}>{b.t}</ACLabel>
            </div>
          ))}
        </div>

        <div style={{ padding: 20, background: c.card, borderRadius: ACRadii.card }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <ACLabel size={11} color={c.dim}>Intake · kcal</ACLabel>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                <ACNum size={54} color={c.fg} weight={700}>1,842</ACNum>
                <ACLabel size={13} color={c.dim}>/ 2,380</ACLabel>
              </div>
            </div>
            <div style={{ textAlign: 'right', paddingBottom: 10 }}>
              <ACLabel size={12} color={c.accent} style={{ fontWeight: 600 }}>538 left</ACLabel>
              <div style={{ marginTop: 4 }}><ACLabel size={11} color={c.dim}>77%</ACLabel></div>
            </div>
          </div>

          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {macros.map(m => (
              <div key={m.k}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <ACLabel size={12} color={c.dim}>{m.label}</ACLabel>
                  <span style={{ fontSize: 12, color: c.fg }}>
                    <b style={{ fontWeight: 600 }}>{m.v}</b>
                    <span style={{ opacity: 0.5 }}>{m.u} / {m.t}{m.u}</span>
                  </span>
                </div>
                <div style={{ height: 6, background: c.faint, borderRadius: 3, overflow: 'hidden', position: 'relative' }}>
                  <div style={{
                    position: 'absolute', inset: 0, width: `${(m.v / m.t) * 100}%`,
                    background: m.k === 'p' ? c.accent : c.fg,
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {[
          {
            name: 'Breakfast', time: '08:12', kcal: 842, items: [
              { t: 'Greek yogurt, Fage 0%', d: '1 cup', k: 140 },
              { t: 'Overnight oats', d: 'Homemade · 85g', k: 312 },
              { t: 'Blueberries', d: 'Fresh · ¾ cup', k: 42 },
              { t: 'Peanut butter', d: '2 tbsp', k: 188 },
              { t: 'Coffee w/ milk', d: '350 ml', k: 160 },
            ]
          },
          {
            name: 'Lunch', time: '12:45', kcal: 720, items: [
              { t: 'Chicken rice bowl', d: 'Sweetgreen', k: 580 },
              { t: 'Apple', d: '1 medium', k: 95 },
              { t: 'Almonds', d: '25g', k: 45 },
            ]
          },
          {
            name: 'Dinner', time: '—', kcal: 0, items: [], empty: true
          },
        ].map((meal, mi) => (
          <div key={mi} style={{ marginTop: 22 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', paddingBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <div style={{ fontFamily: ACFonts.display, fontSize: 17, fontWeight: 600, color: c.fg }}>
                  {meal.name}
                </div>
                <ACLabel size={11} color={c.dim}>{meal.time}</ACLabel>
              </div>
              <ACLabel size={12} color={meal.empty ? c.mute : c.fg} style={{ fontWeight: 500 }}>
                {meal.empty ? 'Empty' : `${meal.kcal} kcal`}
              </ACLabel>
            </div>
            {meal.items.map((it, i) => (
              <div key={i} style={{
                display: 'flex', padding: '12px 0', alignItems: 'flex-start',
                borderTop: `1px solid ${c.hair}`,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14.5, color: c.fg }}>{it.t}</div>
                  <ACLabel size={11} color={c.dim}>{it.d}</ACLabel>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: c.fg }}>
                  {it.k}
                </span>
              </div>
            ))}
            <div style={{
              padding: '12px 0', display: 'flex', alignItems: 'center', gap: 10,
              color: c.accent, fontSize: 13, fontWeight: 600, borderTop: `1px solid ${c.hair}`,
            }}>
              <span style={{ width: 20, height: 20, borderRadius: 6, background: c.accent, color: c.ink, textAlign: 'center', lineHeight: '20px', fontSize: 16, fontWeight: 600 }}>+</span>
              Add to {meal.name.toLowerCase()}
            </div>
          </div>
        ))}
      </div>

      <ACTabBar active="eat" dark={dark} />
    </div>
  );
}

function S4_Nutrition_B({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 22px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 10, height: 10, borderLeft: `2px solid ${c.fg}`, borderBottom: `2px solid ${c.fg}`, transform: 'rotate(45deg) translate(2px, -2px)' }} />
        <ACLabel size={13} color={c.fg} style={{ fontWeight: 500 }}>Add to Breakfast</ACLabel>
      </div>

      <div style={{ padding: '0 22px 14px' }}>
        <div style={{
          padding: '14px 16px', background: c.card, borderRadius: ACRadii.input,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5" stroke={c.dim} strokeWidth="2" />
            <path d="M11 11l3 3" stroke={c.dim} strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span style={{ fontSize: 15, color: c.fg }}>greek</span>
          <div style={{ width: 1, height: 18, background: c.accent }} />
        </div>
      </div>

      <div style={{ padding: '0 22px 18px', display: 'flex', gap: 8 }}>
        {[
          { t: 'Scan' }, { t: 'Camera' }, { t: 'Voice' }, { t: 'Recents' },
        ].map((b, i) => (
          <div key={i} style={{
            flex: 1, padding: '14px 0', borderRadius: ACRadii.input,
            background: c.card,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          }}>
            <div style={{ width: 18, height: 18, borderRadius: 5, background: c.fg, opacity: 0.85 }} />
            <ACLabel size={11} color={c.fg} style={{ fontWeight: 500 }}>{b.t}</ACLabel>
          </div>
        ))}
      </div>

      <div style={{ padding: '0 22px 8px' }}>
        <ACLabel size={12} color={c.dim}>Results · 6</ACLabel>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '0 22px 20px' }}>
        {[
          { t: 'Greek yogurt, Fage 0%', d: '1 cup · 245g', k: 140, ai: true },
          { t: 'Greek yogurt, plain whole', d: '1 cup · 245g', k: 220 },
          { t: 'Greek salad', d: 'Restaurant · avg', k: 285 },
          { t: 'Greek chicken pita', d: "Trader Joe's", k: 410 },
          { t: 'Greek olives, kalamata', d: '10 olives · 35g', k: 58 },
          { t: 'Greek seasoning', d: '1 tsp', k: 5 },
        ].map((r, i) => (
          <div key={i} style={{
            padding: '14px 0', borderBottom: `1px solid ${c.hair}`,
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: 15, color: c.fg }}>{r.t}</div>
                {r.ai && <ACChip accent dark={dark}>AI</ACChip>}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <ACLabel size={12} color={c.dim}>{r.d}</ACLabel>
                <ACLabel size={12} color={c.dim}>·</ACLabel>
                <ACLabel size={12} color={c.accent} style={{ fontWeight: 600 }}>{r.k} kcal</ACLabel>
              </div>
            </div>
            <div style={{
              width: 38, height: 38, borderRadius: 12, background: c.fg, color: c.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 500,
            }}>+</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// SCREEN 5 — PAYWALL
// ══════════════════════════════════════════════════════════════
function S5_Paywall_A({ dark }) {
  const c = useACT(dark);
  const [plan, setPlan] = React.useState('yearly');
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M1 1l8 8M9 1l-8 8" stroke={c.fg} strokeWidth="1.8" strokeLinecap="round" /></svg>
        </div>
        <ACLabel size={11} color={c.dim}>Step 3 of 3</ACLabel>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px 16px' }}>
        <HeartMark size={44} color={c.fg} accent={c.accent} />
        <div style={{
          marginTop: 18, fontFamily: ACFonts.display, fontSize: 38, fontWeight: 700,
          letterSpacing: -1.4, lineHeight: 1.05, color: c.fg,
        }}>
          Unlock<br/>your <span style={{ background: c.accent, color: c.ink, padding: '2px 8px', borderRadius: 8 }}>core</span>.
        </div>
        <div style={{ marginTop: 16, fontSize: 15, lineHeight: 1.5, color: c.dim }}>
          3-day free trial. Cancel in one tap. Your data is yours to export forever.
        </div>

        <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            'AI coach & daily brief',
            'Unlimited workout & food logs',
            'Readiness + recovery tracking',
            'Lab results & biomarker trends',
            'Full data export · CSV + JSON',
          ].map((b, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 20, height: 20, borderRadius: 7, background: c.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="12" height="12" viewBox="0 0 14 14"><path d="M3 7l3 3 5-6" stroke={c.ink} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <div style={{ fontSize: 14.5, color: c.fg }}>{b}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { k: 'yearly',  t: '12 months', p: '$79.99', pm: '$6.67 / mo',  save: 'Save 58%' },
            { k: 'monthly', t: '1 month',   p: '$15.99', pm: '$15.99 / mo', save: null },
          ].map(p => {
            const on = p.k === plan;
            return (
              <div key={p.k} onClick={() => setPlan(p.k)}
                style={{
                  padding: 18, borderRadius: ACRadii.card,
                  border: `2px solid ${on ? c.accent : c.hair}`,
                  background: on ? (dark ? 'rgba(232,181,0,0.08)' : 'rgba(232,181,0,0.1)') : 'transparent',
                  position: 'relative', cursor: 'pointer',
                }}>
                {p.save && <div style={{
                  position: 'absolute', top: -10, right: 14,
                  background: c.accent, color: c.ink, padding: '3px 10px', borderRadius: 6,
                  fontSize: 10, fontWeight: 700, letterSpacing: 0.2,
                }}>{p.save}</div>}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: c.fg }}>{p.t}</div>
                    <ACLabel size={11} color={c.dim}>{p.pm}</ACLabel>
                  </div>
                  <div style={{ fontFamily: ACFonts.display, fontSize: 22, fontWeight: 700, letterSpacing: -0.6, color: c.fg }}>{p.p}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '14px 28px 26px', background: c.bg }}>
        <ACBtn primary block dark={dark} size="lg" pill>Start 3-day free trial →</ACBtn>
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <ACLabel size={11} color={c.dim}>No charge today · remind before billing</ACLabel>
        </div>
      </div>
    </div>
  );
}

function S5_Paywall_B({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px 28px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <ACLabel size={11} color={c.dim}>New · Personal Record</ACLabel>
        <div style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M1 1l8 8M9 1l-8 8" stroke={c.fg} strokeWidth="1.8" strokeLinecap="round" /></svg>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '14px 0 16px' }}>
        <div style={{ padding: 28, background: c.fg, color: c.bg, margin: '0 20px', borderRadius: ACRadii.card }}>
          <ACLabel size={11} color={c.accent} style={{ fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase' }}>Back squat · 1RM est.</ACLabel>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
            <ACNum size={96} color={c.bg} weight={700}>268</ACNum>
            <ACLabel size={13} color="rgba(239,233,218,0.6)">lb</ACLabel>
          </div>
          <div style={{ marginTop: 6 }}>
            <ACLabel size={12} color={c.accent} style={{ fontWeight: 600 }}>+8 lb · new all-time high</ACLabel>
          </div>
          <div style={{ marginTop: 22 }}>
            <ACSpark w={272} h={38} dark={true} color={c.accent} stroke={2.4} />
          </div>
        </div>

        <div style={{ padding: '0 28px', marginTop: 26 }}>
          <div style={{
            fontFamily: ACFonts.display, fontSize: 30, fontWeight: 700,
            letterSpacing: -1, lineHeight: 1.1, color: c.fg,
          }}>
            You're in the<br/>
            top <span style={{ background: c.accent, color: c.ink, padding: '0 8px', borderRadius: 8 }}>12%</span> for<br/>
            your weight class.
          </div>
          <div style={{ marginTop: 14, fontSize: 14.5, lineHeight: 1.5, color: c.dim }}>
            atlas.core Pro unlocks full 1RM tracking, powerlifting ranks,
            readiness-adjusted programming, and the AI coach.
          </div>

          <div style={{
            marginTop: 26, padding: 22, borderRadius: ACRadii.card,
            border: `2px solid ${c.accent}`,
            background: dark ? 'rgba(232,181,0,0.08)' : 'rgba(232,181,0,0.1)',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute', top: -10, left: 18,
              background: c.accent, color: c.ink, padding: '3px 10px', borderRadius: 6,
              fontSize: 10, fontWeight: 700, letterSpacing: 0.3,
            }}>PRO · YEARLY</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <ACNum size={52} color={c.fg} weight={700}>$79</ACNum>
              <div style={{ fontFamily: ACFonts.display, fontSize: 22, fontWeight: 700, color: c.fg }}>.99</div>
              <ACLabel size={12} color={c.dim} style={{ marginLeft: 6 }}>/ year</ACLabel>
            </div>
            <ACLabel size={12} color={c.accent} style={{ marginTop: 6, fontWeight: 600 }}>$6.67 / mo · billed yearly</ACLabel>
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 28px 26px', background: c.bg }}>
        <ACBtn primary block dark={dark} size="lg" pill>Upgrade to Pro →</ACBtn>
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <ACLabel size={11} color={c.dim}>Restore · Terms · Privacy</ACLabel>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// SCREEN 6 — WEIGHT ENTRY + TREND
// ══════════════════════════════════════════════════════════════
function S6_Weight_A({ dark }) {
  const c = useACT(dark);
  const days = [188.2,187.9,187.6,186.9,186.5,186.1,185.8,185.9,185.4,185.2,184.7,184.3,184.4,184,183.7,183.4,183.2,182.8,182.6,182.4];
  const data = days.map((v, i) => ({ k: i, v }));
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 22px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <ACLabel size={11} color={c.dim}>Body · Readings</ACLabel>
          <div style={{ fontFamily: ACFonts.display, fontSize: 26, fontWeight: 700, letterSpacing: -0.8, color: c.fg, marginTop: 4 }}>
            Bodyweight
          </div>
        </div>
        <div style={{ display: 'flex', gap: 2, padding: 3, background: c.card, borderRadius: 10 }}>
          {['14d', '30d', '1y'].map((r, i) => (
            <div key={r} style={{
              padding: '6px 12px', borderRadius: 7,
              background: i === 0 ? c.fg : 'transparent',
              color: i === 0 ? c.bg : c.dim,
              fontSize: 12, fontWeight: 600,
            }}>{r}</div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '14px 22px 20px' }}>
        <div style={{ padding: '10px 0 20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
            <ACNum size={92} color={c.fg} weight={700}>182.4</ACNum>
            <div style={{ paddingBottom: 10 }}>
              <ACLabel size={12} color={c.dim}>lb · today</ACLabel>
              <div style={{ marginTop: 6 }}>
                <ACChip accent dark={dark}>↓ 1.8 · 14d</ACChip>
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: 20, background: c.card, borderRadius: ACRadii.card }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <ACLabel size={12} color={c.dim}>7-day avg trend</ACLabel>
            <ACLabel size={12} color={c.accent} style={{ fontWeight: 600 }}>↓ 0.3 lb / wk</ACLabel>
          </div>
          <ACLine w={296} h={140} data={data} dark={dark} />
          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
            <ACLabel size={11} color={c.mute}>Apr 01</ACLabel>
            <ACLabel size={11} color={c.mute}>Apr 18</ACLabel>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', marginTop: 12, borderRadius: ACRadii.card, overflow: 'hidden', background: c.card }}>
          {[
            { l: 'Start', v: '188.2', u: 'lb', d: 'Apr 01' },
            { l: 'Goal',  v: '175.0', u: 'lb', d: 'Jul 01' },
            { l: 'To go', v: '7.4',   u: 'lb', d: '24 wk' },
          ].map((s, i) => (
            <div key={i} style={{
              padding: 16, borderRight: i < 2 ? `1px solid ${c.hair}` : 'none',
            }}>
              <ACLabel size={11} color={c.dim}>{s.l}</ACLabel>
              <div style={{ marginTop: 6 }}>
                <ACNum size={22} color={c.fg} weight={700}>{s.v}</ACNum>
                <span style={{ fontSize: 11, color: c.dim, marginLeft: 3 }}>{s.u}</span>
              </div>
              <ACLabel size={11} color={c.mute}>{s.d}</ACLabel>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <ACLabel size={12} color={c.dim}>Log · recent</ACLabel>
            <ACLabel size={12} color={c.accent} style={{ fontWeight: 600 }}>View all</ACLabel>
          </div>
          {[
            { d: 'Today · 7:14 AM', v: '182.4', delta: '−0.2' },
            { d: 'Fri · 7:22 AM',   v: '182.6', delta: '−0.2' },
            { d: 'Thu · 7:08 AM',   v: '182.8', delta: '−0.4' },
          ].map((r, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', padding: '14px 0',
              borderTop: i === 0 ? `1px solid ${c.hair}` : 'none',
              borderBottom: `1px solid ${c.hair}`,
            }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 13.5, color: c.fg }}>{r.d}</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: c.fg, marginRight: 16 }}>
                {r.v}
              </div>
              <ACLabel size={12} color={c.accent} style={{ fontWeight: 600 }}>{r.delta}</ACLabel>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '12px 22px 6px' }}>
        <ACBtn primary block dark={dark} size="md" pill>+ Log today's weight</ACBtn>
      </div>
      <ACTabBar active="body" dark={dark} />
    </div>
  );
}

function S6_Weight_B({ dark }) {
  const c = useACT(dark);
  const Key = ({ v, dimmed }) => (
    <div style={{
      padding: '18px 0', textAlign: 'center',
      fontFamily: ACFonts.display, fontSize: 26, fontWeight: 500,
      color: dimmed ? c.dim : c.fg,
    }}>{v}</div>
  );
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M7 1L3 5l4 4" stroke={c.fg} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <ACLabel size={12} color={c.dim} style={{ fontWeight: 500 }}>Log weight</ACLabel>
        <div style={{ width: 28 }} />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px 28px 0' }}>
        <ACLabel size={12} color={c.dim}>Sat · 18 Apr · 7:14 AM</ACLabel>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <div style={{
              fontFamily: ACFonts.display, fontSize: 120, fontWeight: 700,
              letterSpacing: -5, lineHeight: 0.9, color: c.fg,
              fontVariantNumeric: 'tabular-nums',
            }}>
              182<span style={{ color: c.accent }}>.4</span>
            </div>
            <ACLabel size={13} color={c.dim} style={{ paddingBottom: 20 }}>lb</ACLabel>
          </div>

          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
            <ACChip accent dark={dark}>↓ 0.2 vs yesterday</ACChip>
            <ACLabel size={11} color={c.dim}>7d avg 183.1</ACLabel>
          </div>

          <div style={{ marginTop: 26, padding: 18, borderRadius: ACRadii.card, background: c.card }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <ACLabel size={12} color={c.dim}>Last 7 days</ACLabel>
              <ACLabel size={12} color={c.accent} style={{ fontWeight: 600 }}>All on track</ACLabel>
            </div>
            <ACLine w={270} h={60} dark={dark} data={
              [183.8,183.6,183.2,183.1,182.8,182.6,182.4].map((v,i)=>({k:i,v}))
            }/>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 14px 24px', background: c.bg }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
          {['1','2','3','4','5','6','7','8','9','.','0','⌫'].map((k, i) => (
            <div key={k + i} style={{ borderRadius: 14, background: k === '⌫' ? 'transparent' : c.card }}>
              <Key v={k} dimmed={k === '⌫' || k === '.'} />
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12 }}>
          <ACBtn primary block dark={dark} size="lg" pill>Save</ACBtn>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  S1_Splash_A, S1_Splash_B,
  S2_Today_A, S2_Today_B,
  S3_Workout_A, S3_Workout_B,
  S4_Nutrition_A, S4_Nutrition_B,
  S5_Paywall_A, S5_Paywall_B,
  S6_Weight_A, S6_Weight_B,
});
