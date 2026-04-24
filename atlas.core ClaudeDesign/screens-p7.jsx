// screens-p7.jsx — atlas.core app screens, PHASE 7
// The perimeter screens you only see when something changes:
// Auth · Today inbox · Food detail · Recipe builder · Billing · Errors · Web landing

// ══════════════════════════════════════════════════════════════
// P7-1 — AUTH / SIGN IN
// ══════════════════════════════════════════════════════════════
function S36_Auth({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* top bar — close only */}
      <div style={{ padding: '14px 22px 0', display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M1 1l8 8M9 1l-8 8" stroke={c.fg} strokeWidth="1.8" strokeLinecap="round"/></svg>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px 24px 0' }}>
        {/* Brand block */}
        <div style={{ marginTop: 14 }}>
          <HeartMark size={40} color={c.fg} accent={c.accent} />
        </div>
        <div style={{
          marginTop: 22, fontFamily: ACFonts.brand, fontSize: 44,
          letterSpacing: -2, lineHeight: 0.9, color: c.fg,
          textTransform: 'lowercase',
        }}>
          one screen.<br/>
          one <span style={{ color: c.accent }}>field.</span>
        </div>
        <div style={{
          marginTop: 12, fontSize: 14, color: c.dim, lineHeight: 1.55, maxWidth: 300,
        }}>
          We'll email you a six-digit code. No passwords to remember.
        </div>

        {/* Email field */}
        <div style={{ marginTop: 34 }}>
          <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>Email</ACLabel>
          <div style={{
            marginTop: 8, padding: '14px 16px',
            background: c.card, borderRadius: 12,
            borderBottom: `2px solid ${c.accent}`,
            display: 'flex', alignItems: 'center',
          }}>
            <span style={{ fontSize: 16, color: c.fg, letterSpacing: -0.2, fontWeight: 500 }}>
              marcus@kane.co
            </span>
            <span style={{
              display: 'inline-block', width: 2, height: 18, marginLeft: 2,
              background: c.accent,
            }} />
          </div>
          <ACLabel size={10} color={c.mute} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.4, marginTop: 8, display: 'block' }}>
            Returning · we'll recognize this one
          </ACLabel>
        </div>

        {/* Continue CTA */}
        <div style={{ marginTop: 22 }}>
          <ACBtn primary dark={dark} size="lg" pill block>
            Send code →
          </ACBtn>
        </div>

        {/* Divider */}
        <div style={{
          marginTop: 30, display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ flex: 1, height: 1, background: c.hair }} />
          <ACLabel size={10} color={c.mute} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.8, textTransform: 'uppercase' }}>
            Or use
          </ACLabel>
          <div style={{ flex: 1, height: 1, background: c.hair }} />
        </div>

        {/* SSO buttons */}
        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { l: 'Continue with Apple', g: 'apple' },
            { l: 'Continue with Google', g: 'google' },
          ].map(p => (
            <div key={p.g} style={{
              padding: '14px 18px', border: `1px solid ${c.hair}`,
              borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12,
              background: c.bg,
            }}>
              {/* icon placeholder — kept simple */}
              <div style={{
                width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {p.g === 'apple' ? (
                  <svg width="18" height="20" viewBox="0 0 18 20" fill={c.fg}>
                    <path d="M14.2 10.3c0-2.4 1.9-3.5 2-3.6-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.6.9-.7 0-1.9-.8-3.2-.8-1.6 0-3.1 1-4 2.4C.2 10.4 1.4 14.4 3.2 16.6c.9 1.1 1.9 2.3 3.3 2.2 1.3-.1 1.8-.9 3.4-.9 1.6 0 2 .9 3.4.8 1.4 0 2.3-1.1 3.2-2.2.7-.8 1.2-1.7 1.7-2.7-.1 0-3.2-1.2-3.2-3.6M11.5 2.8c.7-.9 1.2-2.1 1.1-3.3-1 0-2.2.7-3 1.6-.6.8-1.2 2-1.1 3.2 1.1.1 2.3-.6 3-1.5"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 18 18">
                    <path fill="#4285F4" d="M17.6 9.2c0-.6 0-1.2-.2-1.8H9v3.4h4.8c-.2 1.1-.8 2-1.8 2.7v2.2h2.9c1.7-1.6 2.7-3.9 2.7-6.5"/>
                    <path fill="#34A853" d="M9 18c2.4 0 4.5-.8 6-2.2l-2.9-2.3c-.8.5-1.8.9-3.1.9-2.4 0-4.4-1.6-5.1-3.8H.9v2.3C2.4 15.9 5.5 18 9 18"/>
                    <path fill="#FBBC05" d="M3.9 10.7c-.2-.5-.3-1.1-.3-1.7s.1-1.2.3-1.7V4.9H.9C.3 6.2 0 7.6 0 9s.3 2.8.9 4.1l3-2.4"/>
                    <path fill="#EA4335" d="M9 3.6c1.3 0 2.5.5 3.4 1.3l2.6-2.6C13.4.9 11.4 0 9 0 5.5 0 2.4 2.1.9 4.9l3 2.3C4.6 5.1 6.6 3.6 9 3.6"/>
                  </svg>
                )}
              </div>
              <div style={{ flex: 1, fontSize: 14.5, fontWeight: 600, color: c.fg, letterSpacing: -0.2 }}>{p.l}</div>
            </div>
          ))}
        </div>

        {/* Legal foot */}
        <div style={{
          marginTop: 'auto', paddingTop: 30, paddingBottom: 20,
          fontFamily: ACFonts.mono, fontSize: 10, color: c.mute,
          letterSpacing: 0.4, lineHeight: 1.5, maxWidth: 280,
        }}>
          By continuing you accept our <span style={{ color: c.fg, textDecoration: 'underline', textUnderlineOffset: 3 }}>terms</span> and <span style={{ color: c.fg, textDecoration: 'underline', textUnderlineOffset: 3 }}>privacy</span> notice. Health data never leaves this device by default.
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// P7-2 — TODAY INBOX (reminder / nudge list, no streaks)
// ══════════════════════════════════════════════════════════════
function S37_Inbox({ dark }) {
  const c = useACT(dark);
  const items = [
    { t: 'coach', when: '06:41', title: 'Readiness held at 87', body: 'Sleep was good, HRV top-band. Heavy Lower is on the plan — pull when you are ready.', cta: 'Open today', hi: true },
    { t: 'plan',  when: '12:00', title: 'Protein · 64g of 186', body: 'Track to land the target. Suggest 8oz chicken or a FairLife bottle next.', cta: 'Log fuel' },
    { t: 'labs',  when: '09:14', title: 'Your Q3 panel arrived', body: '18 markers. 15 optimal, 2 elevated (ApoB, LDL-P), 1 borderline. Tap to read.', cta: 'Open labs', hi: true },
    { t: 'crew',  when: '08:02', title: 'Mara hit 315 squat',     body: 'Third session of the week. She added a note: "felt grippy."', cta: 'Send kudos' },
    { t: 'rest',  when: 'Yest',  title: 'Rescheduled Heavy Pull', body: 'HRV dropped on Wed. Moved to Sat. Keep Thu mobility as planned.' },
    { t: 'bill',  when: 'Mon',   title: 'Receipt · Core $12',     body: 'Your monthly subscription renewed.' },
  ];

  const typeCol = (t) => ({
    coach: c.accent, labs: c.accent, plan: c.fg,
    crew: c.fg, rest: c.mute, bill: c.mute,
  })[t] || c.fg;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 6h8M6 2v8" stroke={c.fg} strokeWidth="1.8" strokeLinecap="round"/></svg>
        </div>
        <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.6, textTransform: 'uppercase' }}>
          Inbox · 6 new
        </ACLabel>
        <div style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6" stroke={c.fg} strokeWidth="1.4" fill="none" />
            <path d="M5 7l1.5 1.5L9 5.5" stroke={c.fg} strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      <div style={{ padding: '18px 22px 12px' }}>
        <div style={{
          fontFamily: ACFonts.display, fontSize: 34, fontWeight: 700,
          letterSpacing: -1.4, lineHeight: 1, color: c.fg,
        }}>
          Today's<br/>
          <span style={{ color: c.accent }}>signals.</span>
        </div>
        <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.3, marginTop: 8, display: 'block' }}>
          We don't remind you to open the app. We tell you when something matters.
        </ACLabel>
      </div>

      {/* filter chips */}
      <div style={{ padding: '2px 22px 0', display: 'flex', gap: 6, overflow: 'auto' }}>
        {['All', 'Coach', 'Plan', 'Labs', 'Crew', 'Billing'].map((s, i) => (
          <div key={s} style={{
            padding: '6px 12px', borderRadius: 999,
            background: i === 0 ? c.fg : 'transparent',
            border: i === 0 ? 'none' : `1px solid ${c.hair}`,
            color: i === 0 ? c.bg : c.dim,
            fontSize: 11, fontWeight: 600, flexShrink: 0,
          }}>{s}</div>
        ))}
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '12px 22px 20px' }}>
        {items.map((it, i) => (
          <div key={i} style={{
            display: 'flex', gap: 12, padding: '14px 0',
            borderTop: i === 0 ? `1px solid ${c.hair}` : 'none',
            borderBottom: `1px solid ${c.hair}`,
            opacity: it.t === 'bill' ? 0.72 : 1,
          }}>
            {/* left rail: type tick + time */}
            <div style={{ width: 46, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <div style={{
                width: 3, height: 20, background: typeCol(it.t),
              }} />
              <ACLabel size={9} color={c.mute} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5, marginTop: 8, textTransform: 'uppercase' }}>
                {it.when}
              </ACLabel>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <ACLabel size={9} color={typeCol(it.t)} style={{ fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.7, textTransform: 'uppercase' }}>
                  {it.t}
                </ACLabel>
                {it.hi && (
                  <div style={{
                    padding: '1px 6px', fontSize: 9,
                    fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.4,
                    background: c.accent, color: c.ink,
                  }}>NEW</div>
                )}
              </div>
              <div style={{
                marginTop: 5, fontSize: 14.5, fontWeight: 600,
                color: c.fg, letterSpacing: -0.2, lineHeight: 1.3,
              }}>
                {it.title}
              </div>
              <div style={{
                marginTop: 4, fontSize: 12.5, color: c.dim, lineHeight: 1.45,
              }}>
                {it.body}
              </div>
              {it.cta && (
                <div style={{
                  marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 6,
                  fontFamily: ACFonts.mono, fontSize: 10, fontWeight: 700,
                  color: c.accent, letterSpacing: 0.5, textTransform: 'uppercase',
                }}>
                  {it.cta}
                  <svg width="8" height="8" viewBox="0 0 8 8"><path d="M1 1l6 6M7 1v6H1" stroke={c.accent} strokeWidth="1.6" fill="none" strokeLinecap="round"/></svg>
                </div>
              )}
            </div>
          </div>
        ))}
        <div style={{
          marginTop: 22, textAlign: 'center',
          fontFamily: ACFonts.mono, fontSize: 10, color: c.mute, letterSpacing: 0.5,
        }}>
          No streak. No guilt. Just signals.
        </div>
      </div>

      <ACTabBar active="today" dark={dark} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// P7-3 — FOOD DETAIL
// ══════════════════════════════════════════════════════════════
function S38_Food_Detail({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M7 1L3 5l4 4" stroke={c.fg} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5 }}>FOOD · LUNCH</ACLabel>
        <div style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="4" height="14" viewBox="0 0 4 14">
            <circle cx="2" cy="2" r="1.6" fill={c.fg}/>
            <circle cx="2" cy="7" r="1.6" fill={c.fg}/>
            <circle cx="2" cy="12" r="1.6" fill={c.fg}/>
          </svg>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '14px 22px 20px' }}>
        {/* Heading block */}
        <ACLabel size={10} color={c.accent} style={{ fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.7, textTransform: 'uppercase' }}>
          From your log · 12:41
        </ACLabel>
        <div style={{
          marginTop: 10, fontFamily: ACFonts.display, fontSize: 34, fontWeight: 700,
          letterSpacing: -1.4, lineHeight: 1.02, color: c.fg,
        }}>
          Chicken · rice · broccoli
        </div>
        <div style={{
          marginTop: 6, fontFamily: ACFonts.mono, fontSize: 11,
          color: c.dim, letterSpacing: 0.3,
        }}>
          MEAL · 3 ITEMS · DETECTED FROM PHOTO
        </div>

        {/* Macro hero — inverted card */}
        <div style={{
          marginTop: 22, padding: 22,
          background: c.fg, color: c.bg,
          borderRadius: ACRadii.card,
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <div style={{
              fontFamily: ACFonts.display, fontSize: 54, fontWeight: 700,
              letterSpacing: -2.4, lineHeight: 1,
              color: c.accent, fontVariantNumeric: 'tabular-nums',
            }}>540</div>
            <div style={{ fontFamily: ACFonts.mono, fontSize: 12, color: dark ? 'rgba(10,10,10,0.55)' : 'rgba(239,233,218,0.55)', letterSpacing: 0.4, fontWeight: 600 }}>
              KCAL
            </div>
          </div>

          {/* stacked macro bar */}
          <div style={{
            marginTop: 18, height: 10, display: 'flex', gap: 2,
          }}>
            <div style={{ flex: 48, background: c.accent }} />
            <div style={{ flex: 52, background: dark ? 'rgba(10,10,10,0.55)' : 'rgba(239,233,218,0.6)' }} />
            <div style={{ flex: 14, background: dark ? 'rgba(10,10,10,0.3)' : 'rgba(239,233,218,0.35)' }} />
          </div>

          <div style={{
            marginTop: 14, display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)', gap: 0,
          }}>
            {[
              { k: 'PROTEIN', v: '48', u: 'g', pct: '36%', hi: true },
              { k: 'CARBS',   v: '52', u: 'g', pct: '38%' },
              { k: 'FAT',     v: '14', u: 'g', pct: '23%' },
            ].map((m, i) => (
              <div key={i} style={{
                paddingLeft: i === 0 ? 0 : 14,
                borderLeft: i === 0 ? 'none' : `1px solid ${dark ? 'rgba(10,10,10,0.14)' : 'rgba(239,233,218,0.14)'}`,
              }}>
                <div style={{ fontFamily: ACFonts.mono, fontSize: 9, color: dark ? 'rgba(10,10,10,0.55)' : 'rgba(239,233,218,0.55)', letterSpacing: 0.7 }}>{m.k}</div>
                <div style={{
                  marginTop: 6, fontFamily: ACFonts.display, fontSize: 22, fontWeight: 700,
                  letterSpacing: -0.7, color: m.hi ? c.accent : c.bg,
                  fontVariantNumeric: 'tabular-nums',
                }}>{m.v}<span style={{ fontSize: 12, fontFamily: ACFonts.mono, color: dark ? 'rgba(10,10,10,0.5)' : 'rgba(239,233,218,0.5)', marginLeft: 2 }}>{m.u}</span></div>
                <div style={{ fontFamily: ACFonts.mono, fontSize: 9, color: dark ? 'rgba(10,10,10,0.45)' : 'rgba(239,233,218,0.45)', marginTop: 2 }}>{m.pct} of day</div>
              </div>
            ))}
          </div>
        </div>

        {/* Items list */}
        <div style={{ marginTop: 22 }}>
          <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>
            Items · editable
          </ACLabel>
          <div style={{ marginTop: 10 }}>
            {[
              { t: 'Chicken breast',  v: '6 oz',   k: '280 · 48P · 0C · 6F', edit: true },
              { t: 'Jasmine rice',    v: '1 cup',  k: '205 · 4P · 44C · 0F' },
              { t: 'Broccoli florets', v: '~2 cups', k: '55 · 4P · 12C · 0F', low: true },
            ].map((r, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 0',
                borderTop: i === 0 ? `1px solid ${c.hair}` : 'none',
                borderBottom: `1px solid ${c.hair}`,
              }}>
                <div style={{
                  width: 36, height: 36, background: c.card,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, borderRadius: 8,
                }}>
                  <div style={{
                    width: 16, height: 16,
                    background: r.low ? c.mute : c.fg, opacity: r.low ? 0.4 : 1,
                  }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: c.fg, letterSpacing: -0.2 }}>{r.t}</div>
                  <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.2, marginTop: 2, display: 'block' }}>
                    {r.v} · {r.k}
                  </ACLabel>
                </div>
                {r.edit && (
                  <div style={{
                    padding: '4px 10px', border: `1px solid ${c.hair}`, borderRadius: 999,
                    fontFamily: ACFonts.mono, fontSize: 10, color: c.dim, letterSpacing: 0.4,
                  }}>EDIT</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Micronutrient strip (no data slop — pick 4 that matter) */}
        <div style={{ marginTop: 22 }}>
          <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>
            Notable · 4 of 23 shown
          </ACLabel>
          <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { k: 'Fiber',    v: '6.2g', pct: 80, hi: true },
              { k: 'Sodium',   v: '420mg', pct: 18 },
              { k: 'Iron',     v: '2.1mg', pct: 26 },
              { k: 'Vit K',    v: '218µg', pct: 100, hi: true },
            ].map((m, i) => (
              <div key={i} style={{ padding: 12, background: c.card, borderRadius: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.4 }}>{m.k}</ACLabel>
                  <span style={{ fontFamily: ACFonts.mono, fontSize: 11, color: m.hi ? c.accent : c.fg, fontWeight: 700 }}>{m.v}</span>
                </div>
                <div style={{ marginTop: 8, height: 3, background: c.faint }}>
                  <div style={{ width: `${m.pct}%`, height: '100%', background: m.hi ? c.accent : c.dim }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Where it came from */}
        <div style={{
          marginTop: 22, padding: 14,
          background: c.card, borderRadius: ACRadii.card,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 36, height: 36, background: c.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `1px dashed ${c.faint}`, flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="2" y="4" width="14" height="11" stroke={c.fg} strokeWidth="1.4"/>
              <circle cx="9" cy="10" r="2.4" stroke={c.fg} strokeWidth="1.4"/>
              <rect x="6" y="2" width="6" height="2.5" stroke={c.fg} strokeWidth="1.4"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.4, textTransform: 'uppercase' }}>Source</ACLabel>
            <div style={{ fontSize: 13, fontWeight: 600, color: c.fg, marginTop: 2 }}>Photo log · 92% confidence</div>
          </div>
          <svg width="8" height="12" viewBox="0 0 8 12">
            <path d="M1 1l5 5-5 5" stroke={c.mute} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      <div style={{ padding: '12px 22px 22px', display: 'flex', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <ACBtn dark={dark} size="lg" pill block>Save as meal</ACBtn>
        </div>
        <div style={{ flex: 1.2 }}>
          <ACBtn primary dark={dark} size="lg" pill block>Confirm · log</ACBtn>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// P7-4 — RECIPE / MEAL BUILDER
// ══════════════════════════════════════════════════════════════
function S39_Recipe_Builder({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M1 1l8 8M9 1l-8 8" stroke={c.fg} strokeWidth="1.8" strokeLinecap="round"/></svg>
        </div>
        <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5 }}>NEW MEAL · DRAFT</ACLabel>
        <div style={{
          padding: '4px 10px', background: c.accent, color: c.ink,
          fontFamily: ACFonts.mono, fontSize: 10, fontWeight: 700,
          letterSpacing: 0.4, borderRadius: 999,
        }}>SAVE</div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '14px 22px 20px' }}>
        {/* Name */}
        <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>
          Meal name
        </ACLabel>
        <div style={{
          marginTop: 6, padding: '8px 0', borderBottom: `2px solid ${c.accent}`,
          fontFamily: ACFonts.display, fontSize: 26, fontWeight: 700,
          letterSpacing: -1, color: c.fg,
        }}>
          Post-lift bowl<span style={{ display: 'inline-block', width: 2, height: 22, marginLeft: 3, background: c.accent, verticalAlign: 'middle' }} />
        </div>

        {/* Ingredient stack visualization — novel: physical-looking stack */}
        <div style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>
              The stack · 5 items
            </ACLabel>
            <ACLabel size={10} color={c.accent} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5, fontWeight: 700 }}>
              620 kcal
            </ACLabel>
          </div>

          <div style={{ marginTop: 14, position: 'relative' }}>
            {[
              { n: 'Jasmine rice',     v: '1 cup',   k: 205, p: 4,  band: 0.78 },
              { n: 'Grilled chicken',  v: '6 oz',    k: 280, p: 48, band: 0.9, hi: true },
              { n: 'Avocado',          v: '½',        k: 120, p: 1,  band: 0.55 },
              { n: 'Broccoli',         v: '1 cup',   k: 30,  p: 2,  band: 0.4 },
              { n: 'Sesame · tamari',  v: '1 tbsp',  k: 35,  p: 1,  band: 0.28 },
            ].map((r, i) => (
              <div key={i} style={{
                marginTop: i === 0 ? 0 : -4,
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px',
                background: r.hi ? c.fg : c.card,
                color: r.hi ? c.bg : c.fg,
                borderRadius: 6,
                boxShadow: `0 2px 0 ${c.hair}`,
                position: 'relative', zIndex: 10 - i,
                transform: `translateX(${(i % 2 === 0 ? 0 : 4)}px)`,
              }}>
                {/* left handle */}
                <svg width="10" height="14" viewBox="0 0 10 14" style={{ flexShrink: 0, opacity: 0.5 }}>
                  <circle cx="3" cy="3" r="1.1" fill={r.hi ? c.bg : c.dim}/>
                  <circle cx="7" cy="3" r="1.1" fill={r.hi ? c.bg : c.dim}/>
                  <circle cx="3" cy="7" r="1.1" fill={r.hi ? c.bg : c.dim}/>
                  <circle cx="7" cy="7" r="1.1" fill={r.hi ? c.bg : c.dim}/>
                  <circle cx="3" cy="11" r="1.1" fill={r.hi ? c.bg : c.dim}/>
                  <circle cx="7" cy="11" r="1.1" fill={r.hi ? c.bg : c.dim}/>
                </svg>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13.5, fontWeight: 600, letterSpacing: -0.2,
                    color: r.hi ? c.bg : c.fg,
                  }}>{r.n}</div>
                  <div style={{
                    marginTop: 2, fontFamily: ACFonts.mono, fontSize: 10,
                    color: r.hi ? (dark ? 'rgba(10,10,10,0.55)' : 'rgba(239,233,218,0.55)') : c.dim,
                    letterSpacing: 0.3,
                  }}>{r.v} · {r.k} kcal · {r.p}P</div>
                </div>
                {/* proportional band */}
                <div style={{
                  width: 48, height: 5,
                  background: r.hi ? (dark ? 'rgba(10,10,10,0.2)' : 'rgba(239,233,218,0.2)') : c.faint,
                }}>
                  <div style={{
                    width: `${r.band * 100}%`, height: '100%',
                    background: r.hi ? c.accent : c.dim,
                  }} />
                </div>
              </div>
            ))}

            {/* add row */}
            <div style={{
              marginTop: 10, padding: '12px', border: `1px dashed ${c.faint}`,
              borderRadius: 6, display: 'flex', alignItems: 'center', gap: 8,
              color: c.dim,
            }}>
              <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 6h8M6 2v8" stroke={c.accent} strokeWidth="1.8" strokeLinecap="round"/></svg>
              <span style={{ flex: 1, fontSize: 13, color: c.dim, fontWeight: 500, letterSpacing: -0.2 }}>Add ingredient</span>
              <ACLabel size={10} color={c.mute} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.4, textTransform: 'uppercase' }}>Scan · search</ACLabel>
            </div>
          </div>
        </div>

        {/* Summary strip */}
        <div style={{
          marginTop: 22, padding: 16, background: c.fg, color: c.bg,
          borderRadius: ACRadii.card,
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0,
        }}>
          {[
            { k: 'KCAL',    v: '620', hi: true },
            { k: 'PROTEIN', v: '56g' },
            { k: 'CARBS',   v: '62g' },
            { k: 'FAT',     v: '18g' },
          ].map((m, i) => (
            <div key={i} style={{
              paddingLeft: i === 0 ? 0 : 10,
              borderLeft: i === 0 ? 'none' : `1px solid ${dark ? 'rgba(10,10,10,0.16)' : 'rgba(239,233,218,0.16)'}`,
            }}>
              <div style={{ fontFamily: ACFonts.mono, fontSize: 9, color: dark ? 'rgba(10,10,10,0.55)' : 'rgba(239,233,218,0.55)', letterSpacing: 0.7 }}>{m.k}</div>
              <div style={{
                marginTop: 6, fontFamily: ACFonts.display, fontSize: 18, fontWeight: 700,
                letterSpacing: -0.5, color: m.hi ? c.accent : c.bg,
                fontVariantNumeric: 'tabular-nums',
              }}>{m.v}</div>
            </div>
          ))}
        </div>

        {/* options */}
        <div style={{ marginTop: 22 }}>
          <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>
            Options
          </ACLabel>
          <div style={{ marginTop: 10 }}>
            {[
              { k: 'Save as meal template', on: true, sub: 'One-tap log next time' },
              { k: 'Share with crew', on: false, sub: 'Mara · Ash · Joon · 2 more' },
              { k: 'Add to plan · Mon lunch', on: true, sub: 'Fits today\'s remaining macros' },
            ].map((r, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 0',
                borderTop: i === 0 ? `1px solid ${c.hair}` : 'none',
                borderBottom: `1px solid ${c.hair}`,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500, color: c.fg }}>{r.k}</div>
                  <ACLabel size={11} color={c.dim} style={{ marginTop: 2, display: 'block' }}>{r.sub}</ACLabel>
                </div>
                <div style={{
                  width: 36, height: 20, borderRadius: 999,
                  background: r.on ? c.accent : c.faint, position: 'relative',
                }}>
                  <div style={{
                    position: 'absolute', top: 2, left: r.on ? 18 : 2,
                    width: 16, height: 16, background: r.on ? c.ink : c.bg,
                    borderRadius: 999,
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// P7-5 — BILLING / SUBSCRIPTION
// ══════════════════════════════════════════════════════════════
function S40_Billing({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M7 1L3 5l4 4" stroke={c.fg} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5 }}>BILLING</ACLabel>
        <div style={{ width: 28 }} />
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '14px 22px 20px' }}>
        {/* Plan hero — inverted card */}
        <div style={{
          padding: 22, background: c.fg, color: c.bg,
          borderRadius: ACRadii.card,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <ACLabel size={10} color={c.accent} style={{ fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.7, textTransform: 'uppercase' }}>
                Current plan
              </ACLabel>
              <div style={{
                marginTop: 8, fontFamily: ACFonts.display, fontSize: 32, fontWeight: 700,
                letterSpacing: -1.2, lineHeight: 1, color: c.bg,
              }}>
                atlas.<span style={{ color: c.accent }}>core</span>
              </div>
            </div>
            <div style={{
              padding: '4px 10px', fontFamily: ACFonts.mono, fontSize: 10,
              background: c.accent, color: c.ink,
              fontWeight: 700, letterSpacing: 0.4,
            }}>ACTIVE</div>
          </div>
          <div style={{
            marginTop: 18, paddingTop: 18,
            borderTop: `1px solid ${dark ? 'rgba(10,10,10,0.16)' : 'rgba(239,233,218,0.16)'}`,
            display: 'flex', alignItems: 'baseline', gap: 12,
          }}>
            <div style={{
              fontFamily: ACFonts.display, fontSize: 42, fontWeight: 700,
              letterSpacing: -1.8, color: c.bg, lineHeight: 1,
              fontVariantNumeric: 'tabular-nums',
            }}>$12</div>
            <div style={{ fontFamily: ACFonts.mono, fontSize: 11, color: dark ? 'rgba(10,10,10,0.55)' : 'rgba(239,233,218,0.55)', letterSpacing: 0.4 }}>
              /month · next charge<br/>MAY 18
            </div>
          </div>
        </div>

        {/* Perks strip */}
        <div style={{ marginTop: 14 }}>
          <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>
            In your plan
          </ACLabel>
          <div style={{ marginTop: 10 }}>
            {[
              'Unlimited AI coach conversations',
              'Full lab panel ingestion + tracking',
              'Programs library + custom builder',
              'Crew of up to 10 people',
              'Priority Function panel scheduling',
            ].map((p, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 0',
                borderTop: i === 0 ? `1px solid ${c.hair}` : 'none',
                borderBottom: `1px solid ${c.hair}`,
              }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M1 6L4 9L11 2" stroke={c.accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{ flex: 1, fontSize: 13, color: c.fg, letterSpacing: -0.1 }}>{p}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment method */}
        <div style={{ marginTop: 22 }}>
          <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>
            Payment
          </ACLabel>
          <div style={{
            marginTop: 10, padding: 14, background: c.card, borderRadius: ACRadii.card,
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 46, height: 32, background: c.fg, color: c.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: ACFonts.mono, fontSize: 10, fontWeight: 700,
              letterSpacing: 0.6, borderRadius: 4,
            }}>VISA</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: ACFonts.mono, fontSize: 12, fontWeight: 600, color: c.fg, letterSpacing: 0.4 }}>
                •••• 4242
              </div>
              <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.3, marginTop: 2, display: 'block' }}>
                EXPIRES 08/27
              </ACLabel>
            </div>
            <ACLabel size={10} color={c.accent} style={{ fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.6 }}>
              EDIT
            </ACLabel>
          </div>
        </div>

        {/* Invoice history */}
        <div style={{ marginTop: 22 }}>
          <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>
            Invoices · 14 total
          </ACLabel>
          <div style={{ marginTop: 10 }}>
            {[
              { d: '18 APR 26', n: 'INV-0014', a: '$12.00', s: 'PAID' },
              { d: '18 MAR 26', n: 'INV-0013', a: '$12.00', s: 'PAID' },
              { d: '18 FEB 26', n: 'INV-0012', a: '$12.00', s: 'PAID' },
              { d: '18 JAN 26', n: 'INV-0011', a: '$12.00', s: 'PAID' },
            ].map((r, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '11px 0',
                borderTop: i === 0 ? `1px solid ${c.hair}` : 'none',
                borderBottom: `1px solid ${c.hair}`,
              }}>
                <div style={{
                  fontFamily: ACFonts.mono, fontSize: 10, color: c.dim,
                  letterSpacing: 0.4, width: 76,
                }}>{r.d}</div>
                <div style={{ flex: 1, fontFamily: ACFonts.mono, fontSize: 11, color: c.fg, letterSpacing: 0.3, fontWeight: 600 }}>
                  {r.n}
                </div>
                <div style={{
                  fontFamily: ACFonts.mono, fontSize: 11, fontWeight: 700,
                  color: c.fg, fontVariantNumeric: 'tabular-nums',
                }}>{r.a}</div>
                <div style={{
                  padding: '2px 7px', fontFamily: ACFonts.mono, fontSize: 9,
                  color: c.accent, border: `1px solid ${c.accent}`,
                  letterSpacing: 0.5, fontWeight: 700,
                }}>{r.s}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Plan swap CTA */}
        <div style={{
          marginTop: 22, padding: 16,
          background: c.card, borderRadius: ACRadii.card,
          borderLeft: `3px solid ${c.accent}`,
        }}>
          <ACLabel size={10} color={c.accent} style={{ fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.7, textTransform: 'uppercase' }}>
            Annual saves $24
          </ACLabel>
          <div style={{ marginTop: 6, fontSize: 14.5, fontWeight: 600, color: c.fg, letterSpacing: -0.2 }}>
            Switch to yearly · $120/yr
          </div>
          <div style={{ marginTop: 4, fontFamily: ACFonts.mono, fontSize: 11, color: c.dim, letterSpacing: 0.3 }}>
            Two months on the house. Cancel anytime.
          </div>
        </div>

        {/* Danger row */}
        <div style={{
          marginTop: 22, textAlign: 'center',
          fontFamily: ACFonts.mono, fontSize: 11, letterSpacing: 0.5,
          color: '#c2391a', textTransform: 'uppercase', fontWeight: 600,
        }}>
          Cancel subscription
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// P7-6 — ERROR STATES (sync conflict · 500 · rate limit · offline queue)
// ══════════════════════════════════════════════════════════════
function S41_Errors({ dark }) {
  const [tab, setTab] = React.useState('conflict');
  const c = useACT(dark);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M7 1L3 5l4 4" stroke={c.fg} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5 }}>EDGES · ERRORS</ACLabel>
        <div style={{ width: 28 }} />
      </div>

      {/* state switcher */}
      <div style={{ padding: '14px 22px 8px' }}>
        <div style={{
          padding: 4, display: 'flex', gap: 2,
          background: c.card, borderRadius: 999,
        }}>
          {[
            { k: 'conflict', l: 'Conflict' },
            { k: 'server',   l: '500' },
            { k: 'limit',    l: 'Rate' },
            { k: 'offline',  l: 'Queue' },
          ].map(t => (
            <div key={t.k} onClick={() => setTab(t.k)} style={{
              flex: 1, padding: '8px 0', textAlign: 'center',
              background: t.k === tab ? c.fg : 'transparent',
              color: t.k === tab ? c.bg : c.dim,
              fontFamily: ACFonts.mono, fontSize: 10, fontWeight: 700,
              letterSpacing: 0.5, borderRadius: 999, cursor: 'pointer',
              textTransform: 'uppercase',
            }}>{t.l}</div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '14px 22px 22px' }}>
        {tab === 'conflict' && <ErrConflict c={c} dark={dark} />}
        {tab === 'server'   && <ErrServer c={c} dark={dark} />}
        {tab === 'limit'    && <ErrLimit c={c} dark={dark} />}
        {tab === 'offline'  && <ErrOffline c={c} dark={dark} />}
      </div>
    </div>
  );
}

function ErrConflict({ c, dark }) {
  return (
    <div>
      <ACLabel size={10} color="#c2391a" style={{ fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.7, textTransform: 'uppercase' }}>
        Sync conflict
      </ACLabel>
      <div style={{
        marginTop: 8, fontFamily: ACFonts.display, fontSize: 28, fontWeight: 700,
        letterSpacing: -1, lineHeight: 1.05, color: c.fg,
      }}>
        Same set, two devices.
      </div>
      <div style={{ marginTop: 8, fontSize: 13.5, color: c.dim, lineHeight: 1.5 }}>
        You logged set 4 of deadlift on your watch and again on phone. Pick which to keep — we won't guess on lift data.
      </div>

      {/* Two candidates */}
      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          { src: 'Watch',  t: '15:42', reps: 1, w: 415, rpe: 9.0, hi: true },
          { src: 'Phone',  t: '15:43', reps: 2, w: 415, rpe: 8.5 },
        ].map((r, i) => (
          <div key={i} style={{
            padding: 16, borderRadius: ACRadii.card,
            border: r.hi ? `2px solid ${c.accent}` : `1px solid ${c.hair}`,
            background: c.card,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.7, textTransform: 'uppercase' }}>
                {r.src} · logged {r.t}
              </ACLabel>
              {r.hi && <ACLabel size={10} color={c.accent} style={{ fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.5 }}>KEEP</ACLabel>}
            </div>
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'baseline', gap: 14 }}>
              <div>
                <ACLabel size={10} color={c.mute} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5 }}>REPS × WEIGHT</ACLabel>
                <div style={{
                  fontFamily: ACFonts.display, fontSize: 24, fontWeight: 700,
                  letterSpacing: -0.7, color: c.fg, fontVariantNumeric: 'tabular-nums',
                }}>
                  {r.reps} × {r.w}<span style={{ fontFamily: ACFonts.mono, fontSize: 10, color: c.dim, marginLeft: 3 }}>lb</span>
                </div>
              </div>
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <ACLabel size={10} color={c.mute} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5 }}>RPE</ACLabel>
                <div style={{ fontFamily: ACFonts.display, fontSize: 22, fontWeight: 700, color: c.fg, letterSpacing: -0.5 }}>{r.rpe}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 22 }}>
        <ACBtn primary dark={dark} size="lg" pill block>Keep watch · discard phone</ACBtn>
      </div>
      <div style={{ marginTop: 10, textAlign: 'center' }}>
        <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.4, textTransform: 'uppercase' }}>
          Keep both as separate sets
        </ACLabel>
      </div>
    </div>
  );
}

function ErrServer({ c, dark }) {
  return (
    <div style={{ padding: '30px 0 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      {/* ECG flatline */}
      <svg width="220" height="46" viewBox="0 0 220 46" style={{ marginBottom: 26 }}>
        <line x1="0" x2="70" y1="23" y2="23" stroke={c.dim} strokeWidth="1.4"/>
        <path d="M70 23 L82 23 L88 6 L96 40 L104 14 L112 23 L130 23" stroke={c.mute} strokeWidth="1.4" fill="none" opacity="0.4"/>
        <line x1="130" x2="220" y1="23" y2="23" stroke="#c2391a" strokeWidth="1.4" strokeDasharray="3 3"/>
      </svg>
      <ACLabel size={10} color="#c2391a" style={{ fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase' }}>
        Error · 500
      </ACLabel>
      <div style={{
        marginTop: 12, fontFamily: ACFonts.display, fontSize: 32, fontWeight: 700,
        letterSpacing: -1.2, lineHeight: 1.02, color: c.fg, textAlign: 'center',
      }}>
        Our side<br/>went <span style={{ color: '#c2391a' }}>flat.</span>
      </div>
      <div style={{ marginTop: 12, fontSize: 13.5, color: c.dim, lineHeight: 1.55, maxWidth: 260 }}>
        We failed to reach the server. Your log is safe on this device — we'll retry the moment we're back.
      </div>

      <div style={{
        marginTop: 26, padding: 14, background: c.card, borderRadius: ACRadii.card,
        width: '100%',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <ACLabel size={9} color={c.mute} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.6 }}>REQ ID</ACLabel>
          <ACLabel size={9} color={c.fg} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.6 }}>r-87b-41d2-c0a9</ACLabel>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <ACLabel size={9} color={c.mute} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.6 }}>TIME</ACLabel>
          <ACLabel size={9} color={c.fg} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.6 }}>15:42:08 UTC</ACLabel>
        </div>
      </div>

      <div style={{ marginTop: 22, width: '100%' }}>
        <ACBtn primary dark={dark} size="lg" pill block>Retry</ACBtn>
      </div>
      <div style={{ marginTop: 10 }}>
        <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.4, textTransform: 'uppercase' }}>
          Copy ID · contact support
        </ACLabel>
      </div>
    </div>
  );
}

function ErrLimit({ c, dark }) {
  return (
    <div>
      <ACLabel size={10} color={c.accent} style={{ fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.7, textTransform: 'uppercase' }}>
        Coach · rate limit
      </ACLabel>
      <div style={{
        marginTop: 8, fontFamily: ACFonts.display, fontSize: 30, fontWeight: 700,
        letterSpacing: -1.2, lineHeight: 1.02, color: c.fg,
      }}>
        Take the rest.
      </div>
      <div style={{ marginTop: 10, fontSize: 13.5, color: c.dim, lineHeight: 1.55, maxWidth: 280 }}>
        You've asked the coach twelve questions in the last hour. That's plenty. New question in 00:14:22.
      </div>

      {/* Countdown card */}
      <div style={{
        marginTop: 22, padding: 22, background: c.fg, color: c.bg,
        borderRadius: ACRadii.card, textAlign: 'center',
      }}>
        <ACLabel size={10} color={c.accent} style={{ fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.7, textTransform: 'uppercase' }}>
          Resets in
        </ACLabel>
        <div style={{
          marginTop: 8, fontFamily: ACFonts.display, fontSize: 58, fontWeight: 700,
          letterSpacing: -2.6, lineHeight: 1, color: c.bg,
          fontVariantNumeric: 'tabular-nums',
        }}>
          14<span style={{ color: c.accent }}>:</span>22
        </div>
        <ACLabel size={10} color={dark ? 'rgba(10,10,10,0.55)' : 'rgba(239,233,218,0.55)'} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.4, marginTop: 8, display: 'block', textTransform: 'uppercase' }}>
          MM : SS
        </ACLabel>
      </div>

      {/* What's still open */}
      <div style={{ marginTop: 22 }}>
        <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>
          Still available
        </ACLabel>
        <div style={{ marginTop: 10 }}>
          {[
            'Log workouts and fuel',
            'Read the daily brief',
            'Browse your labs + history',
            'Search the library',
          ].map((p, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 0',
              borderTop: i === 0 ? `1px solid ${c.hair}` : 'none',
              borderBottom: `1px solid ${c.hair}`,
            }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1 6L4 9L11 2" stroke={c.fg} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ flex: 1, fontSize: 13, color: c.fg }}>{p}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 22 }}>
        <ACBtn dark={dark} size="lg" pill block>Notify me when ready</ACBtn>
      </div>
    </div>
  );
}

function ErrOffline({ c, dark }) {
  const queue = [
    { t: 'Deadlift · set 4 · 415×1', at: '15:42' },
    { t: 'Deadlift · set 5 · 415×1', at: '15:47' },
    { t: 'Fuel · chicken · 6 oz',    at: '12:41' },
    { t: 'Bodyweight · 182.4 lb',     at: '08:02' },
    { t: 'Sleep sync · 7:42',         at: '07:00' },
  ];
  return (
    <div>
      <ACLabel size={10} color={c.accent} style={{ fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.7, textTransform: 'uppercase' }}>
        Offline · queue
      </ACLabel>
      <div style={{
        marginTop: 8, fontFamily: ACFonts.display, fontSize: 30, fontWeight: 700,
        letterSpacing: -1.2, lineHeight: 1.02, color: c.fg,
      }}>
        Five things<br/>waiting.
      </div>
      <div style={{ marginTop: 10, fontSize: 13.5, color: c.dim, lineHeight: 1.55, maxWidth: 280 }}>
        You're offline — all data still saves locally. The moment we reconnect, this queue flushes.
      </div>

      {/* signal */}
      <div style={{
        marginTop: 22, padding: 16, background: c.card, borderRadius: ACRadii.card,
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 18 }}>
          {[3, 6, 9, 12].map((h, i) => (
            <div key={i} style={{ width: 3, height: h, background: i < 0 ? c.accent : c.faint }} />
          ))}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: c.fg }}>No connection</div>
          <ACLabel size={11} color={c.dim} style={{ marginTop: 1, display: 'block', fontFamily: ACFonts.mono, letterSpacing: 0.3 }}>
            Retrying every 30s
          </ACLabel>
        </div>
        <div style={{
          width: 14, height: 14, borderRadius: 999,
          border: `2px solid ${c.accent}`, borderTopColor: 'transparent',
          animation: 'ac-spin 1.2s linear infinite',
        }} />
      </div>
      <style>{`@keyframes ac-spin { to { transform: rotate(360deg); } }`}</style>

      {/* Queue list */}
      <div style={{ marginTop: 22 }}>
        <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.7, textTransform: 'uppercase' }}>
          Waiting · 5 items
        </ACLabel>
        <div style={{ marginTop: 10 }}>
          {queue.map((q, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 0',
              borderTop: i === 0 ? `1px solid ${c.hair}` : 'none',
              borderBottom: `1px solid ${c.hair}`,
            }}>
              <div style={{ width: 8, height: 8, background: c.accent, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: c.fg, fontWeight: 500, letterSpacing: -0.1 }}>{q.t}</div>
              </div>
              <ACLabel size={10} color={c.mute} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.4 }}>{q.at}</ACLabel>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 22 }}>
        <ACBtn dark={dark} size="lg" pill block>Retry now</ACBtn>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// P7-7 — WEB LANDING (poster marketing page, desktop)
// ══════════════════════════════════════════════════════════════
function S42_Web_Landing() {
  // Always light. Desktop canvas. Poster energy.
  const bg = '#efe9da', ink = '#0a0a0a', accent = '#e8b500';
  const mono = '"JetBrains Mono", monospace';
  const brand = '"Archivo Black", sans-serif';
  const body  = '-apple-system, BlinkMacSystemFont, "SF Pro Text", Inter, sans-serif';

  return (
    <div style={{ background: bg, color: ink, fontFamily: body, minHeight: '100%' }}>
      {/* Nav */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 32,
        padding: '22px 56px', borderBottom: `1px solid rgba(10,10,10,0.1)`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Using the heart mark inline */}
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <path d="M13 22c-4-3-10-7-10-13 0-3 2.5-5 5-5 2 0 3.5 1 5 3 1.5-2 3-3 5-3 2.5 0 5 2 5 5 0 6-6 10-10 13Z" stroke={ink} strokeWidth="2" strokeLinejoin="round"/>
            <path d="M7 13h3l2-3 2 6 2-3h3" stroke={accent} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontFamily: brand, fontSize: 18, letterSpacing: -0.5, textTransform: 'lowercase' }}>
            atlas.<span style={{ color: accent }}>core</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 28, fontFamily: mono, fontSize: 12, letterSpacing: 0.3 }}>
          {['The app', 'Method', 'Labs', 'Pricing', 'Field notes'].map(n => (
            <span key={n} style={{ cursor: 'pointer', textTransform: 'uppercase', fontWeight: 600 }}>{n}</span>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontFamily: mono, fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>Sign in</span>
          <div style={{
            padding: '10px 18px', background: ink, color: bg,
            fontFamily: mono, fontSize: 11, letterSpacing: 0.7, fontWeight: 700,
            borderRadius: 999, textTransform: 'uppercase',
          }}>Start · $12</div>
        </div>
      </div>

      {/* Hero */}
      <div style={{ padding: '80px 56px 48px', maxWidth: 1280 }}>
        <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: 2.5, textTransform: 'uppercase', color: 'rgba(10,10,10,0.6)' }}>
          /// the composition app for people who lift
        </div>
        <h1 style={{
          margin: '22px 0 0', fontFamily: brand, fontSize: 152,
          letterSpacing: -8, lineHeight: 0.82, textTransform: 'lowercase',
          maxWidth: 1100,
        }}>
          your body,<br/>
          on the <span style={{ background: ink, color: bg, padding: '0 14px' }}>record</span>.
        </h1>

        <div style={{
          marginTop: 40, display: 'grid',
          gridTemplateColumns: '1.2fr 1fr', gap: 80, alignItems: 'start',
        }}>
          <p style={{ margin: 0, fontSize: 20, lineHeight: 1.5, color: 'rgba(10,10,10,0.82)', letterSpacing: -0.2 }}>
            Training, fuel, sleep and labs — one system, one file, one calm
            coach who speaks in <span style={{ color: accent, fontWeight: 600 }}>measurements, not motivation.</span>
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{
              padding: '18px 28px', background: ink, color: bg,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'space-between', gap: 14,
              borderRadius: 999,
            }}>
              <span style={{ fontFamily: brand, fontSize: 22, letterSpacing: -0.7, textTransform: 'lowercase' }}>start free · 14 days</span>
              <svg width="18" height="14" viewBox="0 0 18 14"><path d="M1 7h15M10 1l6 6-6 6" stroke={accent} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div style={{ fontFamily: mono, fontSize: 11, color: 'rgba(10,10,10,0.6)', letterSpacing: 0.4, textAlign: 'center' }}>
              NO CARD · NO STREAKS · CANCEL IN ONE TAP
            </div>
          </div>
        </div>
      </div>

      {/* ECG divider */}
      <div style={{ padding: '0 56px 60px' }}>
        <svg width="100%" height="48" viewBox="0 0 1200 48" preserveAspectRatio="none">
          <line x1="0" x2="1200" y1="24" y2="24" stroke="rgba(10,10,10,0.2)" strokeWidth="1"/>
          {[180, 520, 860].map((x, i) => (
            <g key={i}>
              <path d={`M${x} 24 L${x + 10} 24 L${x + 16} 4 L${x + 24} 44 L${x + 32} 14 L${x + 40} 24 L${x + 70} 24`}
                stroke={accent} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </g>
          ))}
        </svg>
      </div>

      {/* Three pillars */}
      <div style={{ padding: '0 56px 100px', maxWidth: 1280 }}>
        <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: 2.5, textTransform: 'uppercase', color: 'rgba(10,10,10,0.6)' }}>
          /// what it does
        </div>
        <div style={{
          marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0,
          borderTop: `1px solid rgba(10,10,10,0.15)`,
        }}>
          {[
            { n: '01', k: 'Training', v: 'Hypertrophy + strength programs, live logging, watch-mirrored.', stat: '87', sub: 'sessions logged' },
            { n: '02', k: 'Fuel', v: 'Scan, snap, speak — three ways to log. Precision without the ledger.', stat: '186g', sub: 'avg protein · you' },
            { n: '03', k: 'Biology', v: 'Panels from Function, ApoB on the ring, sleep autopsy every morning.', stat: '84', sub: 'markers tracked' },
          ].map((p, i) => (
            <div key={i} style={{
              padding: '28px 28px 28px 0',
              paddingLeft: i === 0 ? 0 : 40,
              borderRight: i < 2 ? `1px solid rgba(10,10,10,0.15)` : 'none',
              borderBottom: `1px solid rgba(10,10,10,0.15)`,
              paddingRight: i < 2 ? 40 : 28,
            }}>
              <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: 0.8, color: accent, fontWeight: 700 }}>{p.n}</div>
              <div style={{ fontFamily: brand, fontSize: 40, letterSpacing: -1.6, textTransform: 'lowercase', marginTop: 12, lineHeight: 1 }}>
                {p.k.toLowerCase()}.
              </div>
              <div style={{ marginTop: 12, fontSize: 15, lineHeight: 1.5, color: 'rgba(10,10,10,0.75)', minHeight: 80 }}>
                {p.v}
              </div>
              <div style={{ marginTop: 18, display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <span style={{
                  fontFamily: brand, fontSize: 56, letterSpacing: -2.5, color: ink, lineHeight: 1,
                  fontVariantNumeric: 'tabular-nums',
                }}>{p.stat}</span>
                <span style={{ fontFamily: mono, fontSize: 11, color: 'rgba(10,10,10,0.6)', letterSpacing: 0.3 }}>{p.sub}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Principles */}
      <div style={{ background: ink, color: bg, padding: '100px 56px' }}>
        <div style={{ maxWidth: 1280 }}>
          <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: 2.5, textTransform: 'uppercase', color: accent, fontWeight: 700 }}>
            /// the method
          </div>
          <div style={{
            marginTop: 24, fontFamily: brand, fontSize: 88,
            letterSpacing: -4.5, lineHeight: 0.92, textTransform: 'lowercase',
            maxWidth: 1100,
          }}>
            measurements<br/>
            over <span style={{ color: accent }}>motivation.</span>
          </div>
          <div style={{
            marginTop: 60, display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)', gap: 48,
          }}>
            {[
              { n: 'I.',   k: 'No streaks.',       v: 'Consistency is a number, not a theatre. Miss a day without shame.' },
              { n: 'II.',  k: 'Your data stays put.', v: 'Health readings are stored locally first. Cloud sync is opt-in and encrypted.' },
              { n: 'III.', k: 'The coach is quiet.', v: 'Twelve questions an hour is plenty. We don\'t chase engagement.' },
            ].map(p => (
              <div key={p.n}>
                <div style={{ fontFamily: brand, fontSize: 22, letterSpacing: -0.4, color: accent }}>{p.n}</div>
                <div style={{ marginTop: 14, fontFamily: brand, fontSize: 26, letterSpacing: -0.8, textTransform: 'lowercase', lineHeight: 1.1 }}>
                  {p.k.toLowerCase()}
                </div>
                <div style={{ marginTop: 10, fontSize: 14.5, color: 'rgba(239,233,218,0.7)', lineHeight: 1.6 }}>
                  {p.v}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing strip */}
      <div style={{ padding: '100px 56px', maxWidth: 1280 }}>
        <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: 2.5, textTransform: 'uppercase', color: 'rgba(10,10,10,0.6)' }}>
          /// one plan
        </div>
        <div style={{
          marginTop: 20, display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 64, alignItems: 'end',
        }}>
          <div>
            <div style={{ fontFamily: brand, fontSize: 88, letterSpacing: -4, textTransform: 'lowercase', lineHeight: 0.9 }}>
              $12<span style={{ color: 'rgba(10,10,10,0.45)' }}>/mo</span>
            </div>
            <div style={{ marginTop: 14, fontSize: 16, color: 'rgba(10,10,10,0.75)', lineHeight: 1.55, maxWidth: 480 }}>
              Everything. The full app, unlimited coach, labs integration, crew of ten. Annual takes two months off.
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {['Unlimited coach', 'Programs library', 'Labs ingestion', 'Watch companion', 'Crew of 10', 'Privacy-first'].map(p => (
              <div key={p} style={{
                padding: '10px 14px', border: `1px solid rgba(10,10,10,0.2)`,
                fontFamily: mono, fontSize: 11, letterSpacing: 0.3,
                color: 'rgba(10,10,10,0.8)', fontWeight: 600,
              }}>{p}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: '48px 56px', borderTop: `1px solid rgba(10,10,10,0.15)`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: mono, fontSize: 11, letterSpacing: 0.5, color: 'rgba(10,10,10,0.6)',
      }}>
        <span>© 2026 atlas.core · field notes from the body</span>
        <span style={{ display: 'flex', gap: 20 }}>
          {['TERMS', 'PRIVACY', 'SECURITY', 'CONTACT'].map(n => <span key={n} style={{ fontWeight: 600 }}>{n}</span>)}
        </span>
      </div>
    </div>
  );
}

Object.assign(window, {
  S36_Auth, S37_Inbox, S38_Food_Detail, S39_Recipe_Builder,
  S40_Billing, S41_Errors, S42_Web_Landing,
});
