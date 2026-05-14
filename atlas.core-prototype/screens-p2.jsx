// screens-p2.jsx — atlas.core app screens, PHASE 2
// Onboarding (5 steps) + AI coach chat + daily brief.
// Uses the same AC* primitives as phase 1.

// ── tiny shared bits ─────────────────────────────────────────
function OBHeader({ step, total, dark, onBack = true }) {
  const c = useACT(dark);
  return (
    <div style={{ padding: '14px 22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      {onBack ? (
        <div style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M7 1L3 5l4 4" stroke={c.fg} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
      ) : <div style={{ width: 28 }} />}
      <div style={{ flex: 1, margin: '0 14px', display: 'flex', gap: 4 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i < step ? c.accent : (i === step ? c.fg : c.faint),
          }} />
        ))}
      </div>
      <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.mono }}>{step}/{total}</ACLabel>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// P2-1 — WELCOME / IDENTITY (age, sex, height)
// ══════════════════════════════════════════════════════════════
function S7_Onboard_Identity({ dark }) {
  const c = useACT(dark);
  const [sex, setSex] = React.useState('male');
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <OBHeader step={1} total={5} dark={dark} onBack={false} />

      <div style={{ flex: 1, overflow: 'auto', padding: '28px 28px 16px' }}>
        <ACLabel size={12} color={c.accent} style={{ fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>About you</ACLabel>
        <div style={{
          marginTop: 10, fontFamily: ACFonts.display, fontSize: 32, fontWeight: 700,
          letterSpacing: -1, lineHeight: 1.05, color: c.fg,
        }}>
          Let's get the<br/>basics right.
        </div>
        <div style={{ marginTop: 10, fontSize: 14, color: c.dim, lineHeight: 1.5 }}>
          Used for calorie + macro targets. Never shared.
        </div>

        <div style={{ marginTop: 34 }}>
          <ACLabel size={12} color={c.dim}>Sex at birth</ACLabel>
          <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
            {['male', 'female'].map(k => {
              const on = sex === k;
              return (
                <div key={k} onClick={() => setSex(k)} style={{
                  flex: 1, padding: '16px 0', textAlign: 'center',
                  borderRadius: ACRadii.input,
                  background: on ? c.fg : c.card,
                  color: on ? c.bg : c.fg,
                  fontSize: 15, fontWeight: 600, textTransform: 'capitalize',
                  cursor: 'pointer',
                }}>{k}</div>
              );
            })}
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <ACLabel size={12} color={c.dim}>Age</ACLabel>
          <div style={{
            marginTop: 10, padding: '16px 18px', background: c.card,
            borderRadius: ACRadii.input, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
          }}>
            <ACNum size={30} color={c.fg} weight={700}>32</ACNum>
            <ACLabel size={12} color={c.dim}>years</ACLabel>
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <ACLabel size={12} color={c.dim}>Height</ACLabel>
          <div style={{
            marginTop: 10, padding: '16px 18px', background: c.card,
            borderRadius: ACRadii.input, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
          }}>
            <div>
              <ACNum size={30} color={c.fg} weight={700}>5</ACNum>
              <span style={{ fontSize: 13, color: c.dim, marginLeft: 3 }}>ft</span>
              <span style={{ marginLeft: 14 }}>
                <ACNum size={30} color={c.fg} weight={700}>11</ACNum>
                <span style={{ fontSize: 13, color: c.dim, marginLeft: 3 }}>in</span>
              </span>
            </div>
            <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.mono }}>180 cm</ACLabel>
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 28px 26px', background: c.bg }}>
        <ACBtn primary block dark={dark} size="lg" pill>Continue →</ACBtn>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// P2-2 — GOAL PICKER
// ══════════════════════════════════════════════════════════════
function S8_Onboard_Goal({ dark }) {
  const c = useACT(dark);
  const [goal, setGoal] = React.useState('recomp');
  const goals = [
    { k: 'lose',     t: 'Lose fat',        d: 'Cut body fat, hold strength',      trend: 'down' },
    { k: 'recomp',   t: 'Recomp',          d: 'Replace fat with muscle',          trend: 'level' },
    { k: 'maintain', t: 'Maintain',        d: 'Hold weight, optimize readiness',  trend: 'level' },
    { k: 'gain',     t: 'Build muscle',    d: 'Lean bulk, track PRs',             trend: 'up' },
  ];
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <OBHeader step={2} total={5} dark={dark} />

      <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px 16px' }}>
        <ACLabel size={12} color={c.accent} style={{ fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>Your goal</ACLabel>
        <div style={{
          marginTop: 10, fontFamily: ACFonts.display, fontSize: 32, fontWeight: 700,
          letterSpacing: -1, lineHeight: 1.05, color: c.fg,
        }}>
          What are we<br/>building toward?
        </div>

        <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {goals.map(g => {
            const on = goal === g.k;
            return (
              <div key={g.k} onClick={() => setGoal(g.k)} style={{
                padding: 18, borderRadius: ACRadii.card,
                background: on ? c.fg : c.card,
                color: on ? c.bg : c.fg,
                display: 'flex', alignItems: 'center', gap: 14,
                cursor: 'pointer',
              }}>
                <TrendIcon k={g.trend} color={on ? c.accent : c.fg} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: -0.2 }}>{g.t}</div>
                  <div style={{ fontSize: 12, marginTop: 3, opacity: on ? 0.6 : 0.55 }}>{g.d}</div>
                </div>
                <div style={{
                  width: 20, height: 20, borderRadius: 999,
                  border: `1.8px solid ${on ? c.accent : c.faint}`,
                  background: on ? c.accent : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {on && <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5l2 2 4-4" stroke={c.ink} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '14px 28px 26px', background: c.bg }}>
        <ACBtn primary block dark={dark} size="lg" pill>Continue →</ACBtn>
      </div>
    </div>
  );
}

function TrendIcon({ k, color, size = 28 }) {
  if (k === 'down') return <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
    <path d="M4 10l8 6 6-4 6 8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M24 20v-6h-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>;
  if (k === 'up') return <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
    <path d="M4 20l8-6 6 4 6-8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M24 8v6h-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>;
  return <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
    <path d="M4 14h20" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M18 9l5 5-5 5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>;
}

// ══════════════════════════════════════════════════════════════
// P2-3 — ACTIVITY LEVEL
// ══════════════════════════════════════════════════════════════
function S9_Onboard_Activity({ dark }) {
  const c = useACT(dark);
  const [lvl, setLvl] = React.useState(3);
  const levels = [
    { k: 1, t: 'Sedentary',   d: 'Desk-bound, little movement',          mult: '1.2×' },
    { k: 2, t: 'Light',       d: '1–2 training days / week',             mult: '1.38×' },
    { k: 3, t: 'Moderate',    d: '3–4 training days / week',             mult: '1.55×' },
    { k: 4, t: 'Active',      d: '5–6 training days / week',             mult: '1.73×' },
    { k: 5, t: 'Athletic',    d: 'Daily + physical job',                 mult: '1.9×' },
  ];
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <OBHeader step={3} total={5} dark={dark} />

      <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px 16px' }}>
        <ACLabel size={12} color={c.accent} style={{ fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>Activity</ACLabel>
        <div style={{
          marginTop: 10, fontFamily: ACFonts.display, fontSize: 32, fontWeight: 700,
          letterSpacing: -1, lineHeight: 1.05, color: c.fg,
        }}>
          How hard<br/>do you train?
        </div>
        <div style={{ marginTop: 10, fontSize: 14, color: c.dim }}>
          We'll tune calorie burn from this and refine it with your logs.
        </div>

        <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {levels.map(l => {
            const on = lvl === l.k;
            return (
              <div key={l.k} onClick={() => setLvl(l.k)} style={{
                padding: '16px 18px', borderRadius: ACRadii.input,
                background: on ? c.fg : 'transparent',
                color: on ? c.bg : c.fg,
                border: on ? 'none' : `1px solid ${c.hair}`,
                marginBottom: 6,
                display: 'flex', alignItems: 'center', gap: 14,
                cursor: 'pointer',
              }}>
                <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 22 }}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} style={{
                      width: 4, borderRadius: 1.5,
                      height: 6 + i * 3.2,
                      background: i <= l.k
                        ? (on ? c.accent : c.fg)
                        : (on ? 'rgba(239,233,218,0.22)' : c.faint),
                    }} />
                  ))}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{l.t}</div>
                  <div style={{ fontSize: 12, opacity: 0.55, marginTop: 2 }}>{l.d}</div>
                </div>
                <ACLabel size={11} color={on ? c.accent : c.dim} style={{ fontFamily: ACFonts.mono, fontWeight: 600 }}>{l.mult}</ACLabel>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '14px 28px 26px', background: c.bg }}>
        <ACBtn primary block dark={dark} size="lg" pill>Continue →</ACBtn>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// P2-4 — PLAN PREVIEW (calories + macros)
// ══════════════════════════════════════════════════════════════
function S10_Onboard_Plan({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <OBHeader step={4} total={5} dark={dark} />

      <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px 16px' }}>
        <ACLabel size={12} color={c.accent} style={{ fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>Your plan</ACLabel>
        <div style={{
          marginTop: 10, fontFamily: ACFonts.display, fontSize: 32, fontWeight: 700,
          letterSpacing: -1, lineHeight: 1.05, color: c.fg,
        }}>
          Here's your<br/>
          <span style={{ background: c.accent, color: c.ink, padding: '0 10px', borderRadius: 8 }}>daily core</span>.
        </div>

        <div style={{
          marginTop: 28, padding: 22, background: c.fg, color: c.bg, borderRadius: ACRadii.card,
        }}>
          <ACLabel size={11} color={c.accent} style={{ fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase' }}>Calories · daily</ACLabel>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
            <ACNum size={72} color={c.bg} weight={700}>2,380</ACNum>
            <ACLabel size={13} color="rgba(239,233,218,0.6)">kcal</ACLabel>
          </div>
          <ACLabel size={11} color="rgba(239,233,218,0.55)" style={{ marginTop: 2 }}>
            400 kcal deficit · 0.8 lb / wk
          </ACLabel>

          <div style={{ marginTop: 18, height: 1, background: 'rgba(239,233,218,0.12)' }} />

          <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {[
              { l: 'Protein', v: '186', u: 'g', p: 0.31, pct: '31%' },
              { l: 'Carbs',   v: '286', u: 'g', p: 0.48, pct: '48%' },
              { l: 'Fat',     v: '79',  u: 'g',  p: 0.21, pct: '21%' },
            ].map((m, i) => (
              <div key={i}>
                <ACLabel size={11} color="rgba(239,233,218,0.55)">{m.l}</ACLabel>
                <div style={{ marginTop: 6 }}>
                  <ACNum size={26} color={c.bg} weight={700}>{m.v}</ACNum>
                  <span style={{ fontSize: 11, color: 'rgba(239,233,218,0.55)', marginLeft: 3 }}>{m.u}</span>
                </div>
                <ACLabel size={10} color={c.accent} style={{ fontWeight: 600, marginTop: 2 }}>{m.pct}</ACLabel>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          marginTop: 14, padding: 18, background: c.card, borderRadius: ACRadii.card,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <ACLabel size={11} color={c.dim}>Training</ACLabel>
              <div style={{ marginTop: 4, fontSize: 15, fontWeight: 600, color: c.fg }}>
                4 days / week
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <ACLabel size={11} color={c.dim}>Target</ACLabel>
              <div style={{ marginTop: 4, fontSize: 15, fontWeight: 600, color: c.fg }}>
                175 lb by Jul
              </div>
            </div>
          </div>
          <ACSpark w={272} h={30} dark={dark} stroke={2} />
          <ACLabel size={11} color={c.mute} style={{ marginTop: 8 }}>
            Expected body composition curve · 12 weeks
          </ACLabel>
        </div>

        <div style={{ marginTop: 16, padding: '14px 16px', borderRadius: ACRadii.card, border: `1px dashed ${c.faint}` }}>
          <ACLabel size={12} color={c.dim} style={{ lineHeight: 1.5, display: 'block' }}>
            atlas.core recalibrates weekly from your weight trend, logs, and readiness.
          </ACLabel>
        </div>
      </div>

      <div style={{ padding: '14px 28px 26px', background: c.bg }}>
        <ACBtn primary block dark={dark} size="lg" pill>Looks good →</ACBtn>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// P2-5 — PERMISSIONS (HealthKit + notifications)
// ══════════════════════════════════════════════════════════════
function S11_Onboard_Permissions({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <OBHeader step={5} total={5} dark={dark} />

      <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px 16px' }}>
        <ACLabel size={12} color={c.accent} style={{ fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>Connect</ACLabel>
        <div style={{
          marginTop: 10, fontFamily: ACFonts.display, fontSize: 32, fontWeight: 700,
          letterSpacing: -1, lineHeight: 1.05, color: c.fg,
        }}>
          One last thing.
        </div>
        <div style={{ marginTop: 10, fontSize: 14, color: c.dim, lineHeight: 1.5 }}>
          atlas.core reads signal — never writes without asking.
        </div>

        <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            {
              k: 'health',
              t: 'Apple Health',
              d: 'HRV, sleep, steps, heart rate',
              status: 'Connected', on: true,
            },
            {
              k: 'notif',
              t: 'Notifications',
              d: 'Coach check-ins, workout reminders',
              status: 'Enable', on: false,
            },
            {
              k: 'whoop',
              t: 'Whoop / Oura',
              d: 'Optional · import recovery scores',
              status: 'Skip for now', on: false, muted: true,
            },
          ].map((p, i) => (
            <div key={i} style={{
              padding: 18, borderRadius: ACRadii.card,
              background: c.card,
              display: 'flex', alignItems: 'center', gap: 14,
              opacity: p.muted ? 0.6 : 1,
            }}>
              <PermIcon k={p.k} on={p.on} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: c.fg }}>{p.t}</div>
                <ACLabel size={12} color={c.dim}>{p.d}</ACLabel>
              </div>
              <ACChip accent={p.on} dark={dark}>{p.status}</ACChip>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 22, padding: '14px 16px', borderRadius: ACRadii.card,
          borderLeft: `3px solid ${c.accent}`, background: c.card,
        }}>
          <ACLabel size={11} color={c.accent} style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3 }}>Privacy</ACLabel>
          <div style={{ marginTop: 4, fontSize: 13, color: c.fg, lineHeight: 1.5 }}>
            All data stays on-device by default. Cloud sync is opt-in, encrypted, and exportable.
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 28px 26px', background: c.bg, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <ACBtn primary block dark={dark} size="lg" pill>Open atlas.core →</ACBtn>
        <div style={{ textAlign: 'center', padding: 4 }}>
          <ACLabel size={12} color={c.dim}>Skip for now</ACLabel>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// P2-6 — AI COACH CHAT
// ══════════════════════════════════════════════════════════════
function S12_Coach_Chat({ dark }) {
  const c = useACT(dark);
  const Bubble = ({ mine, children, meta }) => (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: mine ? 'flex-end' : 'flex-start',
      marginBottom: 14,
    }}>
      <div style={{
        maxWidth: '82%', padding: '12px 14px',
        borderRadius: mine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        background: mine ? c.fg : c.card,
        color: mine ? c.bg : c.fg,
        fontSize: 14.5, lineHeight: 1.45,
      }}>{children}</div>
      {meta && <ACLabel size={10} color={c.mute} style={{ marginTop: 4, padding: '0 4px' }}>{meta}</ACLabel>}
    </div>
  );

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 22px 12px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${c.hair}` }}>
        <div style={{
          width: 36, height: 36, borderRadius: 999, background: c.accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <HeartMark size={18} color={c.ink} accent="transparent" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: c.fg, letterSpacing: -0.2 }}>Coach</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
            <div style={{ width: 6, height: 6, borderRadius: 999, background: c.accent }} />
            <ACLabel size={11} color={c.dim}>Reading your signal · live</ACLabel>
          </div>
        </div>
        <div style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="16" height="4" viewBox="0 0 16 4"><circle cx="2" cy="2" r="1.6" fill={c.fg}/><circle cx="8" cy="2" r="1.6" fill={c.fg}/><circle cx="14" cy="2" r="1.6" fill={c.fg}/></svg>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '16px 22px' }}>
        <div style={{ textAlign: 'center', margin: '4px 0 18px' }}>
          <ACLabel size={10} color={c.mute} style={{ fontFamily: ACFonts.mono, letterSpacing: 1, textTransform: 'uppercase' }}>Today · 07:42 AM</ACLabel>
        </div>

        <Bubble meta="Coach · context: readiness 87, HRV 72ms">
          Good morning. HRV came back strong — <b style={{ color: c.accent }}>72 ms</b>, up 8 from your rolling average. Your body's ready for heavy lower today.
        </Bubble>

        <Bubble>
          One flag: protein landed at <b>128g</b> yesterday vs your target of 186g. That's a 58g gap — shows up as slower recovery if it becomes a pattern.
        </Bubble>

        <div style={{ marginBottom: 14, padding: 12, background: c.card, borderRadius: ACRadii.input, borderLeft: `3px solid ${c.accent}` }}>
          <ACLabel size={11} color={c.accent} style={{ fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>Suggested · today</ACLabel>
          <div style={{ marginTop: 6, fontSize: 13.5, color: c.fg, lineHeight: 1.5 }}>
            Add a 30g protein shake between lunch and training. Keeps you above threshold without extra meals.
          </div>
          <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
            <div style={{ padding: '7px 12px', background: c.accent, color: c.ink, fontSize: 12, fontWeight: 600, borderRadius: 8 }}>Add to plan</div>
            <div style={{ padding: '7px 12px', background: 'transparent', color: c.dim, fontSize: 12, fontWeight: 600, borderRadius: 8, border: `1px solid ${c.faint}` }}>Not today</div>
          </div>
        </div>

        <Bubble mine>Got it. What should I aim for pre-workout?</Bubble>

        <Bubble meta="Coach · just now">
          ~40g carbs + 20g protein, 60–90 min before. A banana with Greek yogurt or oats with whey hits it clean. Want me to log one?
        </Bubble>

        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          {['Log oats + whey', 'Show me options', 'Later'].map((s, i) => (
            <div key={i} style={{
              padding: '8px 12px', background: 'transparent', border: `1px solid ${c.faint}`,
              borderRadius: 999, fontSize: 12, color: c.fg, fontWeight: 500,
            }}>{s}</div>
          ))}
        </div>
      </div>

      <div style={{ padding: '10px 16px 18px', borderTop: `1px solid ${c.hair}` }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
          background: c.card, borderRadius: 999,
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3 9l6 6M9 15V3M9 3l6 6" stroke={c.dim} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ flex: 1, fontSize: 14, color: c.dim }}>Ask the coach…</span>
          <div style={{
            width: 30, height: 30, borderRadius: 999, background: c.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14"><path d="M7 11V3M3 7l4-4 4 4" stroke={c.ink} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// P2-7 — DAILY BRIEF (AI morning summary)
// ══════════════════════════════════════════════════════════════
function S13_Coach_Brief({ dark }) {
  const c = useACT(dark);
  // 14d sparkline for the hero — readiness climbing to today's 87
  const readinessHistory = [62,58,70,66,72,68,75,71,78,74,80,76,83,87].map((v,k) => ({k, v}));
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: c.fg, color: c.bg }}>
      {/* ── DARK HERO BLOCK ── */}
      <div style={{ padding: '14px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{
          width: 28, height: 28, borderRadius: 999,
          background: 'rgba(239,233,218,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M1 1l8 8M9 1l-8 8" stroke={c.bg} strokeWidth="1.8" strokeLinecap="round" opacity="0.7"/></svg>
        </div>
        <ACLabel size={11} color="rgba(239,233,218,0.55)" style={{ fontFamily: ACFonts.mono, letterSpacing: 0.4 }}>SAT · 18 APR · 07:42</ACLabel>
        <div style={{ width: 28 }} />
      </div>

      <div style={{ padding: '28px 28px 24px' }}>
        <ACLabel size={11} color={c.accent} style={{ fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' }}>
          Morning brief · day 142
        </ACLabel>

        {/* Big statement */}
        <div style={{
          marginTop: 14, fontFamily: ACFonts.display,
          fontSize: 54, fontWeight: 700,
          letterSpacing: -2.4, lineHeight: 0.92,
          textWrap: 'pretty',
        }}>
          You're<br/>
          <span style={{ color: c.accent }}>Ready</span><span style={{ color: c.accent }}>.</span>
        </div>

        {/* Readiness number, right-aligned, brutal */}
        <div style={{
          marginTop: 24, display: 'flex', alignItems: 'flex-end',
          justifyContent: 'space-between', gap: 12,
        }}>
          <div>
            <ACLabel size={10} color="rgba(239,233,218,0.55)" style={{ fontFamily: ACFonts.mono, letterSpacing: 0.6, textTransform: 'uppercase' }}>Readiness</ACLabel>
            <div style={{
              fontFamily: ACFonts.display, fontSize: 120, fontWeight: 700,
              letterSpacing: -5, lineHeight: 0.85, color: c.bg,
              fontVariantNumeric: 'tabular-nums',
            }}>87</div>
          </div>
          <div style={{ textAlign: 'right', paddingBottom: 4 }}>
            <ACLabel size={10} color="rgba(239,233,218,0.55)" style={{ fontFamily: ACFonts.mono, letterSpacing: 0.6, textTransform: 'uppercase' }}>vs 14d avg</ACLabel>
            <div style={{ fontFamily: ACFonts.mono, fontSize: 18, fontWeight: 700, color: c.accent, marginTop: 4 }}>+11</div>
          </div>
        </div>

        {/* Sparkline with explicit x-axis */}
        <div style={{ marginTop: 14 }}>
          <ACLine w={300} h={36} dark={true} data={readinessHistory} />
        </div>
        <div style={{
          marginTop: 6, display: 'flex', justifyContent: 'space-between',
          fontFamily: ACFonts.mono, fontSize: 9, color: 'rgba(239,233,218,0.45)',
          letterSpacing: 0.5,
        }}>
          <span>APR 05</span>
          <span>APR 12</span>
          <span style={{ color: c.accent }}>TODAY</span>
        </div>

        {/* One-liner why */}
        <div style={{
          marginTop: 22, paddingTop: 20,
          borderTop: '1px solid rgba(239,233,218,0.12)',
          fontSize: 14, color: 'rgba(239,233,218,0.78)',
          lineHeight: 1.55, textWrap: 'pretty',
        }}>
          HRV recovered above baseline overnight. Four training days this week — hitting today puts you in the <span style={{ color: c.accent, fontWeight: 600 }}>top 5%</span> of your age bracket.
        </div>
      </div>

      {/* ── LIGHT BODY ── */}
      <div style={{
        flex: 1, background: c.bg, color: c.fg,
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: '24px 22px 16px',
        overflow: 'auto',
        marginTop: -2,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5, textTransform: 'uppercase' }}>Today · three moves</ACLabel>
          <ACLabel size={11} color={c.mute} style={{ fontFamily: ACFonts.mono }}>01 / 03</ACLabel>
        </div>

        {/* Three moves — bigger, more breathing room, clearer lead item */}
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column' }}>
          {[
            { n: '01', t: 'Train', d: 'Heavy Lower · 58 min', meta: '4 PR attempts queued', lead: true },
            { n: '02', t: 'Nutrition', d: 'Hit 186g protein', meta: '148g tracked · 38g to go' },
            { n: '03', t: 'Sleep', d: 'In bed by 10:30', meta: 'Shifted 42 min later this week' },
          ].map((r, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '16px 0',
              borderTop: i === 0 ? 'none' : `1px solid ${c.hair}`,
            }}>
              <div style={{
                width: 32, textAlign: 'left',
                fontFamily: ACFonts.mono, fontSize: 13, fontWeight: 700,
                color: r.lead ? c.accent : c.mute, letterSpacing: 0.3,
              }}>{r.n}</div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: ACFonts.display, fontSize: 18, fontWeight: 600,
                  letterSpacing: -0.4, color: c.fg,
                }}>
                  {r.t} <span style={{ color: c.mute, fontWeight: 400 }}>·</span> <span style={{ fontWeight: 500, color: c.fg }}>{r.d}</span>
                </div>
                <ACLabel size={12} color={c.dim} style={{ marginTop: 2 }}>{r.meta}</ACLabel>
              </div>
              {r.lead ? (
                <div style={{
                  width: 28, height: 28, borderRadius: 999,
                  background: c.accent, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 1l4 4-4 4" stroke={c.ink} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              ) : (
                <svg width="10" height="12" viewBox="0 0 10 12"><path d="M2 1l5 5-5 5" stroke={c.mute} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
              )}
            </div>
          ))}
        </div>

        {/* Signal trend — redesigned as horizontal pills with micro-sparks */}
        <div style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5, textTransform: 'uppercase' }}>Body trend · 14d</ACLabel>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: 999, background: c.accent }} />
              <ACLabel size={11} color={c.accent} style={{ fontWeight: 600 }}>All green</ACLabel>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { k: 'HRV',    v: '72',    u: 'ms', d: '+6',    data: [62,64,66,63,68,70,72] },
              { k: 'Sleep',  v: '7:42',  u: 'hr', d: '+0:18', data: [6.8,7.0,6.9,7.2,7.3,7.4,7.7] },
              { k: 'Weight', v: '182.4', u: 'lb', d: '−1.8',  data: [184.2,184.0,183.6,183.2,183.0,182.7,182.4] },
            ].map((m, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px', background: c.card, borderRadius: ACRadii.input,
              }}>
                <div style={{ width: 56 }}>
                  <ACLabel size={9} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>{m.k}</ACLabel>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginTop: 2 }}>
                    <ACNum size={20} color={c.fg} weight={700}>{m.v}</ACNum>
                    <span style={{ fontSize: 10, color: c.mute, fontFamily: ACFonts.mono }}>{m.u}</span>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <ACLine w={150} h={26} dark={dark} data={m.data.map((v,k)=>({k,v}))} />
                </div>
                <div style={{
                  fontFamily: ACFonts.mono, fontSize: 12, fontWeight: 700,
                  color: c.accent, minWidth: 42, textAlign: 'right',
                }}>{m.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer CTAs — single primary, ghost secondary underneath */}
      <div style={{ padding: '12px 22px 22px', background: c.bg, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <ACBtn primary dark={dark} size="lg" pill style={{ width: '100%' }}>Start today →</ACBtn>
        <div style={{
          textAlign: 'center', padding: '6px 0',
          fontSize: 13, fontWeight: 500, color: c.dim,
        }}>
          or <span style={{ color: c.fg, fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 3 }}>ask coach anything</span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  S7_Onboard_Identity, S8_Onboard_Goal, S9_Onboard_Activity,
  S10_Onboard_Plan, S11_Onboard_Permissions,
  S12_Coach_Chat, S13_Coach_Brief,
});

// Real brand-ish icons for permission cards.
function PermIcon({ k, on }) {
  // Apple Health — white rounded square w/ pink heart (brand-accurate)
  if (k === 'health') return (
    <div style={{
      width: 38, height: 38, borderRadius: 10,
      background: '#fff',
      boxShadow: '0 0 0 1px rgba(0,0,0,0.05), 0 2px 6px rgba(0,0,0,0.08)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 18.5s-7-4.3-7-9.4a4.3 4.3 0 0 1 7-3.3 4.3 4.3 0 0 1 7 3.3c0 5.1-7 9.4-7 9.4Z"
          fill="#FF2D55" />
      </svg>
    </div>
  );
  // Notifications — iOS bell in accent-filled rounded square
  if (k === 'notif') return (
    <div style={{
      width: 38, height: 38, borderRadius: 10,
      background: '#FF3B30',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 3c-3 0-5 2.2-5 5v2.5L3.5 13h13L15 10.5V8c0-2.8-2-5-5-5Z"
          stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" fill="none" />
        <path d="M8 15a2 2 0 0 0 4 0" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      </svg>
    </div>
  );
  // Whoop — black disc with bold white W
  if (k === 'whoop') return (
    <div style={{
      width: 38, height: 38, borderRadius: 999,
      background: '#000',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: '"Archivo Black", sans-serif',
      color: '#fff', fontSize: 17, letterSpacing: -0.5,
      lineHeight: 1,
    }}>W</div>
  );
  return null;
}

Object.assign(window, { PermIcon });
