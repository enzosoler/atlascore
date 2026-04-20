// screens-p7.jsx — atlas.core app screens, PHASE 7 (MVP completion)
// Nine utility surfaces that take the prototype to App Store submission:
// Auth entry · Auth recover · Account settings · Subscription · Help & support ·
// Legal · Food detail · Workout history · Web landing + pricing (browser frame).

// ══════════════════════════════════════════════════════════════
// P7-1 — AUTH · ENTRY (login + signup, one field)
// ══════════════════════════════════════════════════════════════
function S36_Auth_Entry({ dark }) {
  const c = useACT(dark);
  const OauthBtn = ({ icon, label }) => (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      padding: '13px 16px', background: 'transparent',
      border: `1px solid ${c.faint}`, borderRadius: ACRadii.button,
      fontFamily: ACFonts.body, fontSize: 15, fontWeight: 600,
      color: c.fg, letterSpacing: -0.2,
    }}>
      {icon}
      <span>{label}</span>
    </div>
  );
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px 24px 32px' }}>
      {/* Brand + meta */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, marginTop: 48 }}>
        <HeartMark size={48} color={c.fg} accent={c.accent} />
        <div style={{
          fontFamily: ACFonts.brand, fontSize: 28, letterSpacing: -1.2,
          color: c.fg, textTransform: 'lowercase',
          display: 'inline-flex', alignItems: 'baseline',
        }}>
          <span>atlas</span>
          <span style={{ width: 6, height: 6, background: c.accent, margin: '0 3px 2px' }} />
          <span>core</span>
        </div>
      </div>

      {/* Instructional header */}
      <div style={{ marginTop: 44, textAlign: 'center' }}>
        <ACLabel size={11} color={c.accent} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.6, textTransform: 'uppercase', fontWeight: 700 }}>
          sign in · or sign up
        </ACLabel>
        <div style={{
          marginTop: 10, fontFamily: ACFonts.display, fontSize: 26, fontWeight: 700,
          letterSpacing: -0.8, color: c.fg, lineHeight: 1.15,
        }}>
          One field.<br />Email, and we handle the rest.
        </div>
      </div>

      {/* Email input */}
      <div style={{ marginTop: 32 }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          padding: '14px 16px', background: c.card,
          borderRadius: ACRadii.input,
          border: `1px solid ${c.faint}`,
        }}>
          <svg width="18" height="14" viewBox="0 0 18 14" fill="none" style={{ marginRight: 12, opacity: 0.5 }}>
            <rect x="1" y="1" width="16" height="12" rx="1" stroke={c.fg} strokeWidth="1.4" />
            <path d="M1 2 L9 8 L17 2" stroke={c.fg} strokeWidth="1.4" fill="none" />
          </svg>
          <span style={{ fontFamily: ACFonts.body, fontSize: 16, color: c.dim, letterSpacing: -0.2 }}>you@address.com</span>
        </div>

        <div style={{ marginTop: 12 }}>
          <ACBtn primary block dark={dark} size="lg">Continue</ACBtn>
        </div>
      </div>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
        <div style={{ flex: 1, height: 1, background: c.hair }} />
        <ACLabel size={10} color={c.mute} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.6, textTransform: 'uppercase' }}>or continue with</ACLabel>
        <div style={{ flex: 1, height: 1, background: c.hair }} />
      </div>

      {/* OAuth */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <OauthBtn icon={
          <svg width="16" height="16" viewBox="0 0 16 16" fill={c.fg}>
            <path d="M12.2 8.5c0-2 1.6-3 1.7-3-0.9-1.3-2.3-1.5-2.8-1.5-1.2-0.1-2.3 0.7-2.9 0.7-0.6 0-1.5-0.7-2.5-0.7-1.3 0-2.5 0.7-3.1 1.9-1.3 2.3-0.3 5.7 1 7.6 0.6 0.9 1.4 1.9 2.4 1.8 1-0.1 1.3-0.6 2.5-0.6 1.1 0 1.4 0.6 2.5 0.6 1 0 1.7-0.9 2.3-1.8 0.7-1 1-2.1 1-2.1s-2.1-0.8-2.1-2.9zM10.3 3.3c0.5-0.7 0.9-1.6 0.8-2.5-0.8 0-1.7 0.5-2.2 1.2-0.5 0.6-0.9 1.5-0.8 2.4 0.9 0.1 1.7-0.4 2.2-1.1z"/>
          </svg>
        } label="Continue with Apple" />
        <OauthBtn icon={
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M15.5 8.2c0-0.5 0-1-0.1-1.5h-7.4v2.8h4.3c-0.2 1-0.8 1.9-1.7 2.5v2.1h2.8c1.6-1.5 2.5-3.7 2.5-5.9z" fill={c.fg}/>
            <path d="M8 16c2.3 0 4.2-0.8 5.6-2l-2.8-2.1c-0.8 0.5-1.7 0.8-2.8 0.8-2.1 0-4-1.4-4.6-3.4h-2.9v2.2c1.4 2.8 4.4 4.5 7.5 4.5z" fill={c.fg}/>
            <path d="M3.4 9.3c-0.3-0.9-0.3-1.8 0-2.7v-2.2h-2.9c-1 2-1 4.3 0 6.3l2.9-1.4z" fill={c.fg}/>
            <path d="M8 3.2c1.3 0 2.4 0.5 3.2 1.3l2.4-2.4c-1.6-1.4-3.5-2.1-5.6-2.1-3.1 0-6.1 1.7-7.5 4.5l2.9 2.2c0.6-2 2.5-3.5 4.6-3.5z" fill={c.fg}/>
          </svg>
        } label="Continue with Google" />
      </div>

      {/* Bottom fine print */}
      <div style={{ marginTop: 'auto', paddingTop: 24, textAlign: 'center' }}>
        <ACLabel size={11} color={c.mute} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.4 }}>
          by continuing you accept the <span style={{ color: c.fg, fontWeight: 600 }}>terms</span> and <span style={{ color: c.fg, fontWeight: 600 }}>privacy</span> policy
        </ACLabel>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// P7-2 — AUTH · RECOVER (request · sent · reset — combined)
// ══════════════════════════════════════════════════════════════
function S37_Auth_Recover({ dark }) {
  const c = useACT(dark);
  const [state, setState] = React.useState('sent'); // request / sent / reset
  const states = [
    { k: 'request', label: 'request' },
    { k: 'sent',    label: 'sent' },
    { k: 'reset',   label: 'reset' },
  ];

  const Pill = ({ k, label }) => {
    const on = state === k;
    return (
      <div onClick={() => setState(k)} style={{
        padding: '6px 12px', borderRadius: 999,
        background: on ? c.fg : 'transparent',
        color: on ? c.bg : c.dim,
        fontFamily: ACFonts.mono, fontSize: 10, fontWeight: 600,
        letterSpacing: 0.6, textTransform: 'uppercase', cursor: 'pointer',
      }}>{label}</div>
    );
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px 22px 28px' }}>
      {/* Back chevron */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 2L4 8l6 6" stroke={c.fg} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <ACLabel size={14} color={c.fg} style={{ fontWeight: 600 }}>Back</ACLabel>
      </div>

      {/* State pills (demo only) */}
      <div style={{ display: 'flex', gap: 6, padding: 4, background: c.card, borderRadius: 999, alignSelf: 'flex-start', marginTop: 16 }}>
        {states.map(s => <Pill key={s.k} k={s.k} label={s.label} />)}
      </div>

      {/* === STATE: REQUEST === */}
      {state === 'request' && (
        <div style={{ marginTop: 36, flex: 1, display: 'flex', flexDirection: 'column' }}>
          <ACLabel size={11} color={c.accent} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.6, textTransform: 'uppercase', fontWeight: 700 }}>
            reset password · step 1/2
          </ACLabel>
          <div style={{
            marginTop: 10, fontFamily: ACFonts.display, fontSize: 30, fontWeight: 700,
            letterSpacing: -1.2, color: c.fg, lineHeight: 1.05,
          }}>
            Forgot it?<br />We'll send a link.
          </div>
          <div style={{ marginTop: 12, fontFamily: ACFonts.body, fontSize: 14, color: c.dim, lineHeight: 1.5 }}>
            Drop the email on your account. We'll email a one-time reset link. No password recovery questions, no security hoops.
          </div>
          <div style={{ marginTop: 28 }}>
            <div style={{
              padding: '14px 16px', background: c.card,
              borderRadius: ACRadii.input, border: `1px solid ${c.faint}`,
            }}>
              <ACLabel size={10} color={c.mute} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5, textTransform: 'uppercase' }}>email</ACLabel>
              <div style={{ marginTop: 4, fontFamily: ACFonts.body, fontSize: 16, color: c.fg }}>enzo@atlas.core</div>
            </div>
            <div style={{ marginTop: 12 }}>
              <ACBtn primary block dark={dark} size="lg">Send reset link</ACBtn>
            </div>
          </div>
        </div>
      )}

      {/* === STATE: SENT === */}
      {state === 'sent' && (
        <div style={{ marginTop: 40, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          {/* Envelope mark */}
          <div style={{
            width: 84, height: 84, borderRadius: 999,
            background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `1px solid ${c.hair}`,
          }}>
            <svg width="36" height="28" viewBox="0 0 36 28" fill="none">
              <rect x="2" y="2" width="32" height="24" rx="2" stroke={c.fg} strokeWidth="1.6"/>
              <path d="M2 4 L18 16 L34 4" stroke={c.accent} strokeWidth="2" fill="none" strokeLinecap="square"/>
            </svg>
          </div>
          <div style={{
            marginTop: 24, fontFamily: ACFonts.display, fontSize: 26, fontWeight: 700,
            letterSpacing: -1, color: c.fg, lineHeight: 1.1,
          }}>
            Check your inbox.
          </div>
          <div style={{ marginTop: 12, fontFamily: ACFonts.body, fontSize: 14, color: c.dim, lineHeight: 1.55, maxWidth: 280 }}>
            Link sent to <span style={{ color: c.fg, fontWeight: 600 }}>enzo@atlas.core</span>. Tap it from the device you want to sign in on. Link expires in 30 minutes.
          </div>
          <div style={{ marginTop: 28, width: '100%' }}>
            <ACBtn block dark={dark} size="md">Open mail</ACBtn>
            <div style={{ marginTop: 10, textAlign: 'center' }}>
              <ACLabel size={12} color={c.mute}>Didn't arrive? <span style={{ color: c.accent, fontWeight: 600 }}>Resend</span></ACLabel>
            </div>
          </div>
        </div>
      )}

      {/* === STATE: RESET === */}
      {state === 'reset' && (
        <div style={{ marginTop: 36, flex: 1, display: 'flex', flexDirection: 'column' }}>
          <ACLabel size={11} color={c.accent} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.6, textTransform: 'uppercase', fontWeight: 700 }}>
            reset password · step 2/2
          </ACLabel>
          <div style={{
            marginTop: 10, fontFamily: ACFonts.display, fontSize: 26, fontWeight: 700,
            letterSpacing: -1, color: c.fg, lineHeight: 1.1,
          }}>
            New password.
          </div>
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {['new password', 'confirm new password'].map(l => (
              <div key={l} style={{
                padding: '14px 16px', background: c.card,
                borderRadius: ACRadii.input, border: `1px solid ${c.faint}`,
              }}>
                <ACLabel size={10} color={c.mute} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5, textTransform: 'uppercase' }}>{l}</ACLabel>
                <div style={{ marginTop: 4, fontFamily: ACFonts.body, fontSize: 16, color: c.fg, letterSpacing: 4 }}>••••••••</div>
              </div>
            ))}
          </div>
          {/* rule readout */}
          <div style={{ marginTop: 14, padding: 12, background: c.card2 ?? c.card, borderRadius: ACRadii.card }}>
            {[
              ['at least 10 characters', true],
              ['one number or symbol', true],
              ['different from the last one', false],
            ].map(([l, ok], i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0' }}>
                <div style={{
                  width: 14, height: 14, borderRadius: 999,
                  background: ok ? c.accent : 'transparent',
                  border: `1px solid ${ok ? c.accent : c.faint}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {ok && <svg width="8" height="8" viewBox="0 0 8 8"><path d="M1 4l2 2 4-4" stroke={c.ink} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <ACLabel size={12} color={ok ? c.fg : c.dim}>{l}</ACLabel>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 18 }}>
            <ACBtn primary block dark={dark} size="lg">Save & sign in</ACBtn>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// P7-3 — ACCOUNT SETTINGS
// ══════════════════════════════════════════════════════════════
function S38_Account_Settings({ dark }) {
  const c = useACT(dark);
  const Row = ({ k, v, trail, danger }) => (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 16px', borderBottom: `1px solid ${c.hair}`,
    }}>
      <div>
        <div style={{ fontFamily: ACFonts.body, fontSize: 15, fontWeight: 500, color: danger ? '#e8391f' : c.fg, letterSpacing: -0.2 }}>{k}</div>
        {v && <div style={{ marginTop: 2, fontFamily: ACFonts.mono, fontSize: 11, color: c.dim }}>{v}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {trail && <ACLabel size={12} color={c.dim}>{trail}</ACLabel>}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M3 1l4 4-4 4" stroke={danger ? '#e8391f' : c.dim} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
  const SectionLabel = ({ t }) => (
    <div style={{ padding: '18px 16px 8px' }}>
      <ACLabel size={10} color={c.mute} style={{ fontFamily: ACFonts.mono, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 700 }}>{t}</ACLabel>
    </div>
  );
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px 12px' }}>
        <ACLabel size={11} color={c.mute} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5, textTransform: 'uppercase' }}>settings</ACLabel>
        <div style={{ fontFamily: ACFonts.display, fontSize: 30, fontWeight: 700, letterSpacing: -1.2, color: c.fg, marginTop: 4 }}>
          Account
        </div>
      </div>

      {/* Identity card */}
      <div style={{ margin: '0 16px', padding: 16, background: c.card, borderRadius: ACRadii.card, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 52, height: 52, borderRadius: 999, background: c.fg, color: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: ACFonts.display, fontSize: 22, fontWeight: 700 }}>
          E
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: ACFonts.body, fontSize: 16, fontWeight: 600, color: c.fg }}>Enzo Soler</div>
          <div style={{ fontFamily: ACFonts.mono, fontSize: 11, color: c.dim, marginTop: 2 }}>enzo@atlas.core · @enzo</div>
        </div>
        <div style={{ padding: '6px 10px', background: c.accent, color: c.ink, fontFamily: ACFonts.mono, fontSize: 9, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' }}>pro</div>
      </div>

      {/* Profile section */}
      <SectionLabel t="profile" />
      <div style={{ background: c.card, margin: '0 16px', borderRadius: ACRadii.card, overflow: 'hidden' }}>
        <Row k="Edit profile" v="name, handle, avatar" />
        <Row k="Password" v="last changed 58 days ago" />
        <Row k="Sign-in methods" trail="3" />
      </div>

      {/* Your data section */}
      <SectionLabel t="your data" />
      <div style={{ background: c.card, margin: '0 16px', borderRadius: ACRadii.card, overflow: 'hidden' }}>
        <Row k="Export your data" v="json, csv — delivered via email" />
        <Row k="Manage consent" v="what we share and with whom" />
        <Row k="Connected services" trail="4" />
      </div>

      {/* Danger section */}
      <SectionLabel t="danger zone" />
      <div style={{ background: c.card, margin: '0 16px 24px', borderRadius: ACRadii.card, overflow: 'hidden' }}>
        <Row k="Sign out of this device" />
        <Row k="Sign out everywhere" v="5 active sessions" />
        <Row k="Delete account" v="permanent — 30-day grace window" danger />
      </div>

      {/* Footer */}
      <div style={{ padding: '0 20px 22px', textAlign: 'center' }}>
        <ACLabel size={10} color={c.mute} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.6 }}>
          v4.2.0 (8841) · device: iPhone 15 Pro
        </ACLabel>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// P7-4 — SUBSCRIPTION SETTINGS
// ══════════════════════════════════════════════════════════════
function S39_Subscription({ dark }) {
  const c = useACT(dark);
  const Row = ({ k, v, trail, danger }) => (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 16px', borderBottom: `1px solid ${c.hair}`,
    }}>
      <div>
        <div style={{ fontFamily: ACFonts.body, fontSize: 15, fontWeight: 500, color: danger ? '#e8391f' : c.fg, letterSpacing: -0.2 }}>{k}</div>
        {v && <div style={{ marginTop: 2, fontFamily: ACFonts.mono, fontSize: 11, color: c.dim }}>{v}</div>}
      </div>
      {trail && <ACLabel size={12} color={c.dim} style={{ fontFamily: ACFonts.mono }}>{trail}</ACLabel>}
    </div>
  );
  const Section = ({ t }) => (
    <div style={{ padding: '18px 16px 8px' }}>
      <ACLabel size={10} color={c.mute} style={{ fontFamily: ACFonts.mono, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 700 }}>{t}</ACLabel>
    </div>
  );
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px 12px' }}>
        <ACLabel size={11} color={c.mute} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5, textTransform: 'uppercase' }}>settings · billing</ACLabel>
        <div style={{ fontFamily: ACFonts.display, fontSize: 30, fontWeight: 700, letterSpacing: -1.2, color: c.fg, marginTop: 4 }}>
          Subscription
        </div>
      </div>

      {/* Inverted current plan card */}
      <div style={{ margin: '4px 16px 0', padding: 18, background: c.fg, color: c.bg, borderRadius: ACRadii.card }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <ACLabel size={10} color={c.accent} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.8, textTransform: 'uppercase', fontWeight: 700 }}>current plan</ACLabel>
          <div style={{ padding: '4px 8px', background: c.accent, color: c.ink, fontFamily: ACFonts.mono, fontSize: 9, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' }}>active</div>
        </div>
        <div style={{ marginTop: 10, fontFamily: ACFonts.display, fontSize: 28, fontWeight: 700, letterSpacing: -1, lineHeight: 1.05, color: c.bg }}>
          atlas<span style={{ color: c.accent }}>·</span>core Annual
        </div>
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontFamily: ACFonts.display, fontSize: 34, fontWeight: 700, letterSpacing: -1.4, color: c.bg, fontVariantNumeric: 'tabular-nums' }}>$99</span>
          <ACLabel size={12} color="rgba(239,233,218,0.55)" style={{ fontFamily: ACFonts.mono }}>/ year</ACLabel>
          <ACLabel size={11} color="rgba(239,233,218,0.4)" style={{ fontFamily: ACFonts.mono, marginLeft: 10 }}>$8.25 / mo equivalent</ACLabel>
        </div>
        <div style={{ marginTop: 14, padding: '10px 0', borderTop: '1px solid rgba(239,233,218,0.14)', display: 'flex', justifyContent: 'space-between' }}>
          <ACLabel size={11} color="rgba(239,233,218,0.55)" style={{ fontFamily: ACFonts.mono, textTransform: 'uppercase', letterSpacing: 0.6 }}>renews</ACLabel>
          <ACLabel size={11} color={c.bg} style={{ fontFamily: ACFonts.mono, fontWeight: 700 }}>MAY 12 2027</ACLabel>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0 0' }}>
          <ACLabel size={11} color="rgba(239,233,218,0.55)" style={{ fontFamily: ACFonts.mono, textTransform: 'uppercase', letterSpacing: 0.6 }}>next charge</ACLabel>
          <ACLabel size={11} color={c.bg} style={{ fontFamily: ACFonts.mono, fontWeight: 700 }}>$99.00 · visa ··4812</ACLabel>
        </div>
      </div>

      {/* Manage */}
      <Section t="manage" />
      <div style={{ background: c.card, margin: '0 16px', borderRadius: ACRadii.card, overflow: 'hidden' }}>
        <Row k="Switch plan" v="monthly, annual, or pro" trail="compare" />
        <Row k="Update payment method" v="visa ··4812, expires 08/28" />
        <Row k="Billing history" trail="18 invoices" />
        <Row k="Apply promo code" />
      </div>

      {/* Cancel */}
      <Section t="ending the relationship" />
      <div style={{ background: c.card, margin: '0 16px', borderRadius: ACRadii.card, overflow: 'hidden' }}>
        <Row k="Pause for a month" v="resume on any day — no data lost" />
        <Row k="Cancel subscription" v="keep access until MAY 12 2027" danger />
      </div>

      {/* Restore */}
      <div style={{ margin: '20px 16px 24px', padding: 14, border: `1px dashed ${c.faint}`, borderRadius: ACRadii.card, textAlign: 'center' }}>
        <ACLabel size={12} color={c.dim} style={{ fontFamily: ACFonts.body }}>
          Previously paid through the App Store?
        </ACLabel>
        <div style={{ marginTop: 8 }}>
          <ACLabel size={13} color={c.accent} style={{ fontWeight: 700 }}>Restore purchases</ACLabel>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// P7-5 — HELP & SUPPORT
// ══════════════════════════════════════════════════════════════
function S40_Help({ dark }) {
  const c = useACT(dark);
  const articles = [
    { cat: 'getting started', q: 'Your first 7 days', read: '4 min' },
    { cat: 'workouts',        q: 'Logging sets, RPE, and PRs', read: '3 min' },
    { cat: 'nutrition',       q: 'What counts as a portion', read: '2 min' },
    { cat: 'biology',         q: 'How we read your labs', read: '6 min' },
    { cat: 'privacy',         q: 'Where your photos live', read: '2 min' },
  ];
  const Row = ({ k, v, acc }) => (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 16px', borderBottom: `1px solid ${c.hair}`,
    }}>
      <div>
        <div style={{ fontFamily: ACFonts.body, fontSize: 15, fontWeight: 500, color: c.fg, letterSpacing: -0.2 }}>{k}</div>
        {v && <div style={{ marginTop: 2, fontFamily: ACFonts.mono, fontSize: 11, color: c.dim }}>{v}</div>}
      </div>
      <ACDot color={acc ? c.accent : c.faint} />
    </div>
  );
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
      <div style={{ padding: '16px 20px 12px' }}>
        <ACLabel size={11} color={c.mute} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5, textTransform: 'uppercase' }}>settings</ACLabel>
        <div style={{ fontFamily: ACFonts.display, fontSize: 30, fontWeight: 700, letterSpacing: -1.2, color: c.fg, marginTop: 4 }}>
          Help & support
        </div>
      </div>

      {/* Search */}
      <div style={{ margin: '8px 16px 0', display: 'flex', alignItems: 'center', padding: '12px 14px', background: c.card, borderRadius: ACRadii.input, border: `1px solid ${c.faint}` }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ marginRight: 10, opacity: 0.55 }}>
          <circle cx="6" cy="6" r="4.5" stroke={c.fg} strokeWidth="1.4"/>
          <path d="M9.5 9.5 L13 13" stroke={c.fg} strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
        <span style={{ fontFamily: ACFonts.body, fontSize: 14, color: c.dim }}>search help — try "rest day"</span>
      </div>

      {/* Featured */}
      <div style={{ padding: '18px 16px 8px' }}>
        <ACLabel size={10} color={c.mute} style={{ fontFamily: ACFonts.mono, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 700 }}>featured articles</ACLabel>
      </div>
      <div style={{ margin: '0 16px', background: c.card, borderRadius: ACRadii.card, overflow: 'hidden' }}>
        {articles.map((a, i) => (
          <div key={i} style={{
            padding: '12px 16px', borderBottom: i === articles.length - 1 ? 'none' : `1px solid ${c.hair}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <ACLabel size={9} color={c.accent} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.8, textTransform: 'uppercase', fontWeight: 700 }}>{a.cat}</ACLabel>
              <div style={{ marginTop: 3, fontFamily: ACFonts.body, fontSize: 14.5, fontWeight: 600, color: c.fg, letterSpacing: -0.2 }}>{a.q}</div>
            </div>
            <ACLabel size={10} color={c.mute} style={{ fontFamily: ACFonts.mono }}>{a.read}</ACLabel>
          </div>
        ))}
      </div>

      {/* Contact */}
      <div style={{ padding: '18px 16px 8px' }}>
        <ACLabel size={10} color={c.mute} style={{ fontFamily: ACFonts.mono, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 700 }}>contact us</ACLabel>
      </div>
      <div style={{ margin: '0 16px', background: c.card, borderRadius: ACRadii.card, overflow: 'hidden' }}>
        <Row k="Chat with an engineer" v="M–F · 9–5 PT · usually < 4 min" acc />
        <Row k="Send an email" v="support@atlas.core · 24h SLA" />
        <Row k="Report a problem" v="shares device logs — you can redact first" />
      </div>

      {/* Rate */}
      <div style={{ margin: '20px 16px 24px', padding: 16, background: c.card2 ?? c.card, borderRadius: ACRadii.card, textAlign: 'center' }}>
        <div style={{ fontFamily: ACFonts.display, fontSize: 18, fontWeight: 700, letterSpacing: -0.6, color: c.fg }}>Like atlas.core?</div>
        <div style={{ marginTop: 4, fontFamily: ACFonts.body, fontSize: 12, color: c.dim, lineHeight: 1.5 }}>
          One tap · sets us straight with the App Store ranking
        </div>
        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center', gap: 6 }}>
          {[0,1,2,3,4].map(i => (
            <svg key={i} width="22" height="22" viewBox="0 0 22 22" fill={i < 4 ? c.accent : 'none'} stroke={c.accent} strokeWidth="1.2">
              <path d="M11 2l2.8 5.6 6.2 0.9-4.5 4.4 1 6.1-5.5-2.9-5.5 2.9 1-6.1L2 8.5l6.2-0.9z"/>
            </svg>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// P7-6 — LEGAL (terms · privacy · changelog — one screen, 3 tabs)
// ══════════════════════════════════════════════════════════════
function S41_Legal({ dark }) {
  const c = useACT(dark);
  const [tab, setTab] = React.useState('terms');
  const tabs = [
    { k: 'terms',    label: 'Terms' },
    { k: 'privacy',  label: 'Privacy' },
    { k: 'changelog', label: 'Changelog' },
  ];
  const Pill = ({ k, label }) => {
    const on = tab === k;
    return (
      <div onClick={() => setTab(k)} style={{
        flex: 1, padding: '9px 0', textAlign: 'center',
        background: on ? c.fg : 'transparent',
        color: on ? c.bg : c.dim,
        fontFamily: ACFonts.mono, fontSize: 11, fontWeight: 700,
        letterSpacing: 0.6, textTransform: 'uppercase', cursor: 'pointer',
      }}>{label}</div>
    );
  };
  const Section = ({ num, title, body }) => (
    <div style={{ padding: '16px 18px', borderBottom: `1px solid ${c.hair}` }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
        <ACLabel size={11} color={c.accent} style={{ fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.5 }}>§{num}</ACLabel>
        <div style={{ fontFamily: ACFonts.body, fontSize: 14, fontWeight: 600, color: c.fg, letterSpacing: -0.2 }}>{title}</div>
      </div>
      <div style={{ marginTop: 8, fontFamily: ACFonts.body, fontSize: 12.5, lineHeight: 1.55, color: c.dim }}>{body}</div>
    </div>
  );
  const Entry = ({ v, date, items }) => (
    <div style={{ padding: '16px 18px', borderBottom: `1px solid ${c.hair}` }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
        <ACLabel size={11} color={c.accent} style={{ fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.5 }}>v{v}</ACLabel>
        <ACLabel size={10} color={c.mute} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5 }}>{date}</ACLabel>
      </div>
      <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map((it, i) => (
          <div key={i} style={{ display: 'flex', gap: 8 }}>
            <span style={{ width: 4, height: 4, background: c.accent, marginTop: 7, flexShrink: 0 }} />
            <ACLabel size={12.5} color={c.fg}>{it}</ACLabel>
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px 10px' }}>
        <ACLabel size={11} color={c.mute} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5, textTransform: 'uppercase' }}>legal</ACLabel>
        <div style={{ fontFamily: ACFonts.display, fontSize: 28, fontWeight: 700, letterSpacing: -1.1, color: c.fg, marginTop: 4 }}>
          {tab === 'terms' ? 'Terms of use' : tab === 'privacy' ? 'Privacy policy' : 'Changelog'}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', margin: '4px 20px 12px', background: c.card, borderRadius: 999, padding: 3 }}>
        {tabs.map(t => <Pill key={t.k} k={t.k} label={t.label} />)}
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {tab === 'terms' && (
          <>
            <Section num="1" title="Who this is for"
              body="You are an adult using atlas.core for personal fitness, nutrition, and wellness tracking. You are not a medical professional acting on behalf of patients, unless you've separately signed the clinician agreement." />
            <Section num="2" title="What we do"
              body="We provide software that logs your training, fuel, labs, and composition. We offer a coach powered by AI. We do not diagnose, treat, or prescribe. For that, see a clinician." />
            <Section num="3" title="What you own"
              body="Everything you log is yours. Export anytime. Delete anytime. We retain anonymized aggregates for 90 days after you delete — and you can opt out of that in Privacy." />
            <Section num="4" title="What we charge"
              body="Free tier exists. Paid tiers are clearly labeled. Prices are locked the moment you pay; renewal prices may change with 30 days notice." />
            <Section num="5" title="Refunds"
              body="Annual: refund any day, no questions, prorated to the day. Monthly: next month off. App Store: Apple's refund policy applies." />
            <div style={{ padding: '20px 20px 28px', textAlign: 'center' }}>
              <ACLabel size={10} color={c.mute} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5 }}>last updated · 12 APR 2026 · version 2.1</ACLabel>
            </div>
          </>
        )}
        {tab === 'privacy' && (
          <>
            <Section num="1" title="What we collect"
              body="Email, account prefs, logged workouts, logged fuel, body metrics, connected-service data (HealthKit, wearables, labs). Device crash reports with your consent." />
            <Section num="2" title="What stays on-device"
              body="Progress photos. Voice recordings. Barcode scans. These never leave your phone unless you explicitly share them." />
            <Section num="3" title="What we never sell"
              body="Any of it. We do not sell, rent, or trade your data. We don't have a data-broker pipeline. There is no advertiser." />
            <Section num="4" title="Who sees what"
              body="You see everything. Your coach (if assigned) sees what you grant. Aggregate analytics uses anonymized data — you can opt out." />
            <Section num="5" title="Deletion"
              body="Delete account → 30-day soft window (reversible) → permanent hard delete. Backups purge within 60 days." />
            <div style={{ padding: '20px 20px 28px', textAlign: 'center' }}>
              <ACLabel size={10} color={c.mute} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5 }}>last updated · 12 APR 2026 · version 3.0</ACLabel>
            </div>
          </>
        )}
        {tab === 'changelog' && (
          <>
            <Entry v="4.2.0" date="18 APR 2026" items={[
              'Weekly recap zine (new)',
              'Sleep detail now shows HRV deviation band',
              'Post-session summary is the default destination after a workout',
              'Fixed: tonnage chart y-axis clipped at 20k',
            ]} />
            <Entry v="4.1.2" date="04 APR 2026" items={[
              'Voice-log accuracy improved on Spanish and Portuguese',
              'Crew leaderboard now respects your privacy settings',
              'Fixed: labs inbox lost sort order on rotate',
            ]} />
            <Entry v="4.1.0" date="21 MAR 2026" items={[
              'Apple Watch companion screen',
              'Universal search across lifts, programs, and articles',
              'Public profile handles',
            ]} />
            <Entry v="4.0.0" date="01 MAR 2026" items={[
              'Body + biology tab',
              'Lab import — pdf, hl7, fhir',
              'Biomarker deep-dive pages',
            ]} />
          </>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// P7-7 — FOOD DETAIL
// ══════════════════════════════════════════════════════════════
function S42_Food_Detail({ dark }) {
  const c = useACT(dark);
  const macros = [
    { k: 'Protein', v: 31,  u: 'g', pct: 0.58, color: c.accent },
    { k: 'Carbs',   v: 0,   u: 'g', pct: 0.00, color: c.fg },
    { k: 'Fat',     v: 3.6, u: 'g', pct: 0.07, color: c.dim },
  ];
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
      {/* Top strip */}
      <div style={{ padding: '12px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 2L4 8l6 6" stroke={c.fg} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <ACLabel size={14} color={c.fg} style={{ fontWeight: 600 }}>Back</ACLabel>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2v14M2 9h14" stroke={c.fg} strokeWidth="1.6" strokeLinecap="round"/></svg>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="1.2" fill={c.fg}/><circle cx="9" cy="3" r="1.2" fill={c.fg}/><circle cx="9" cy="15" r="1.2" fill={c.fg}/></svg>
        </div>
      </div>

      {/* Hero */}
      <div style={{ padding: '18px 20px 12px' }}>
        <ACLabel size={10} color={c.accent} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.8, textTransform: 'uppercase', fontWeight: 700 }}>
          fuel · protein · lean
        </ACLabel>
        <div style={{ marginTop: 8, fontFamily: ACFonts.display, fontSize: 30, fontWeight: 700, letterSpacing: -1.2, color: c.fg, lineHeight: 1 }}>
          Chicken breast<br />
          <span style={{ color: c.dim, fontSize: 18, fontWeight: 600, letterSpacing: -0.4 }}>grilled, skinless</span>
        </div>
        <div style={{ marginTop: 6, fontFamily: ACFonts.mono, fontSize: 11, color: c.mute, letterSpacing: 0.4 }}>
          USDA · FDC 171077 · verified
        </div>
      </div>

      {/* Calorie + macro tile */}
      <div style={{ margin: '6px 16px 0', padding: 18, background: c.fg, color: c.bg, borderRadius: ACRadii.card }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <ACLabel size={10} color="rgba(239,233,218,0.55)" style={{ fontFamily: ACFonts.mono, letterSpacing: 0.6, textTransform: 'uppercase' }}>per 100g</ACLabel>
            <div style={{ marginTop: 6, display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontFamily: ACFonts.display, fontSize: 46, fontWeight: 700, letterSpacing: -1.8, color: c.bg, fontVariantNumeric: 'tabular-nums' }}>165</span>
              <ACLabel size={12} color="rgba(239,233,218,0.55)" style={{ fontFamily: ACFonts.mono }}>kcal</ACLabel>
            </div>
          </div>
          <ACRing size={78} value={58} dark={!dark} thickness={8} color={c.accent} />
        </div>
        {/* Macros stacked bar */}
        <div style={{ marginTop: 14, height: 6, background: 'rgba(239,233,218,0.1)', display: 'flex', overflow: 'hidden' }}>
          {macros.map((m, i) => (
            <div key={i} style={{ width: `${m.pct * 100}%`, background: m.color }} />
          ))}
        </div>
        <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {macros.map((m, i) => (
            <div key={i} style={{ padding: '6px 0', borderLeft: i > 0 ? '1px solid rgba(239,233,218,0.14)' : 'none', paddingLeft: i > 0 ? 12 : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, background: m.color }} />
                <ACLabel size={9} color="rgba(239,233,218,0.55)" style={{ fontFamily: ACFonts.mono, letterSpacing: 0.6, textTransform: 'uppercase', fontWeight: 700 }}>{m.k}</ACLabel>
              </div>
              <div style={{ marginTop: 6, display: 'flex', alignItems: 'baseline', gap: 3 }}>
                <span style={{ fontFamily: ACFonts.display, fontSize: 20, fontWeight: 700, letterSpacing: -0.5, color: c.bg, fontVariantNumeric: 'tabular-nums' }}>{m.v}</span>
                <ACLabel size={10} color="rgba(239,233,218,0.5)" style={{ fontFamily: ACFonts.mono }}>{m.u}</ACLabel>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Portion picker */}
      <div style={{ padding: '18px 16px 8px' }}>
        <ACLabel size={10} color={c.mute} style={{ fontFamily: ACFonts.mono, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 700 }}>serving</ACLabel>
      </div>
      <div style={{ margin: '0 16px', background: c.card, borderRadius: ACRadii.card, padding: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <ACLabel size={12} color={c.dim}>portion size</ACLabel>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontFamily: ACFonts.display, fontSize: 22, fontWeight: 700, letterSpacing: -0.6, color: c.fg, fontVariantNumeric: 'tabular-nums' }}>180</span>
            <ACLabel size={11} color={c.dim} style={{ fontFamily: ACFonts.mono }}>g</ACLabel>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['80g', '120g', '180g', '1 breast', 'custom'].map((x, i) => (
            <div key={i} style={{
              padding: '6px 10px', borderRadius: ACRadii.chip,
              background: i === 2 ? c.accent : 'transparent',
              border: `1px solid ${i === 2 ? c.accent : c.faint}`,
              color: i === 2 ? c.ink : c.fg,
              fontFamily: ACFonts.mono, fontSize: 11, fontWeight: 600,
            }}>{x}</div>
          ))}
        </div>
      </div>

      {/* Similar items */}
      <div style={{ padding: '18px 16px 8px' }}>
        <ACLabel size={10} color={c.mute} style={{ fontFamily: ACFonts.mono, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 700 }}>similar</ACLabel>
      </div>
      <div style={{ margin: '0 16px 16px', background: c.card, borderRadius: ACRadii.card, overflow: 'hidden' }}>
        {[
          { n: 'Chicken thigh, grilled', m: '209 kcal · 26P 0C 11F' },
          { n: 'Turkey breast, roasted',  m: '135 kcal · 30P 0C 1F' },
          { n: 'Chicken breast, rotisserie', m: '182 kcal · 28P 0C 7F' },
        ].map((x, i, a) => (
          <div key={i} style={{ padding: '12px 14px', borderBottom: i === a.length - 1 ? 'none' : `1px solid ${c.hair}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: ACFonts.body, fontSize: 14, fontWeight: 500, color: c.fg, letterSpacing: -0.2 }}>{x.n}</div>
              <div style={{ marginTop: 2, fontFamily: ACFonts.mono, fontSize: 10.5, color: c.dim }}>{x.m}</div>
            </div>
            <svg width="9" height="9" viewBox="0 0 9 9"><path d="M2 1l4 3.5L2 8" stroke={c.dim} strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ padding: '0 16px 22px' }}>
        <ACBtn primary block dark={dark} size="lg">Add to lunch · 297 kcal</ACBtn>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// P7-8 — WORKOUT HISTORY
// ══════════════════════════════════════════════════════════════
function S43_Workout_History({ dark }) {
  const c = useACT(dark);
  const days = Array.from({ length: 30 }, (_, i) => {
    const v = (i === 1 || i === 3 || i === 6 || i === 8 || i === 10 || i === 13 || i === 15 || i === 17 || i === 20 || i === 22 || i === 24 || i === 27) ? 0.95 : (i % 3 === 0 ? 0.5 : 0.12);
    return v;
  });
  const sessions = [
    { d: '17 APR', wd: 'FRI', n: 'Heavy Lower',    t: '58m', v: '18,420', pr: true,  top: 'DL 415' },
    { d: '15 APR', wd: 'WED', n: 'Upper Push',     t: '44m', v: '9,840',  pr: false, top: 'BP 245' },
    { d: '13 APR', wd: 'MON', n: 'Pull + Arms',    t: '52m', v: '12,680', pr: false, top: 'OHP 145' },
    { d: '10 APR', wd: 'FRI', n: 'Heavy Lower',    t: '61m', v: '17,900', pr: false, top: 'DL 405' },
    { d: '08 APR', wd: 'WED', n: 'Upper Push',     t: '42m', v: '9,600',  pr: true,  top: 'BP 240' },
    { d: '06 APR', wd: 'MON', n: 'Pull + Arms',    t: '49m', v: '11,850', pr: false, top: 'OHP 140' },
    { d: '03 APR', wd: 'FRI', n: 'Deload · Lower', t: '36m', v: '9,200',  pr: false, top: 'DL 305' },
    { d: '01 APR', wd: 'WED', n: 'Deload · Upper', t: '34m', v: '4,880',  pr: false, top: 'BP 195' },
  ];
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px 10px' }}>
        <ACLabel size={11} color={c.mute} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5, textTransform: 'uppercase' }}>train · history</ACLabel>
        <div style={{ fontFamily: ACFonts.display, fontSize: 30, fontWeight: 700, letterSpacing: -1.2, color: c.fg, marginTop: 4 }}>
          April 2026
        </div>
        <div style={{ marginTop: 6, fontFamily: ACFonts.mono, fontSize: 11, color: c.dim, letterSpacing: 0.3 }}>
          12 SESSIONS · 112,370 LB · 3 PRs
        </div>
      </div>

      {/* Heat strip */}
      <div style={{ margin: '6px 16px 0', padding: 14, background: c.card, borderRadius: ACRadii.card }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <ACLabel size={10} color={c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.6, textTransform: 'uppercase', fontWeight: 700 }}>last 30 days</ACLabel>
          <ACLabel size={10} color={c.accent} style={{ fontFamily: ACFonts.mono, fontWeight: 700 }}>40%</ACLabel>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(30, 1fr)', gap: 3 }}>
          {days.map((v, i) => (
            <div key={i} style={{
              height: 22, background: c.fg, opacity: v,
            }} />
          ))}
        </div>
        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
          <ACLabel size={9} color={c.mute} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.4 }}>MAR 20</ACLabel>
          <ACLabel size={9} color={c.mute} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.4 }}>APR 18</ACLabel>
        </div>
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 6, padding: '14px 16px 8px', overflow: 'auto' }}>
        {[['all', true], ['program', false], ['lift', false], ['PRs', false], ['deload', false]].map(([k, on], i) => (
          <div key={i} style={{
            padding: '6px 12px', borderRadius: ACRadii.chip, flexShrink: 0,
            background: on ? c.fg : 'transparent',
            color: on ? c.bg : c.dim,
            border: on ? 'none' : `1px solid ${c.faint}`,
            fontFamily: ACFonts.mono, fontSize: 11, fontWeight: 600,
            letterSpacing: 0.2,
          }}>{k}</div>
        ))}
      </div>

      {/* Sessions */}
      <div style={{ margin: '4px 16px 20px', background: c.card, borderRadius: ACRadii.card, overflow: 'hidden' }}>
        {sessions.map((s, i) => (
          <div key={i} style={{
            padding: '14px 16px', borderBottom: i === sessions.length - 1 ? 'none' : `1px solid ${c.hair}`,
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            {/* Date block */}
            <div style={{ width: 42, textAlign: 'center' }}>
              <div style={{ fontFamily: ACFonts.display, fontSize: 18, fontWeight: 700, letterSpacing: -0.4, color: c.fg, lineHeight: 1 }}>{s.d.split(' ')[0]}</div>
              <div style={{ fontFamily: ACFonts.mono, fontSize: 9, color: c.mute, letterSpacing: 0.6, marginTop: 2 }}>{s.wd}</div>
            </div>
            <div style={{ width: 1, height: 34, background: c.hair }} />
            {/* Middle */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ fontFamily: ACFonts.body, fontSize: 14.5, fontWeight: 600, color: c.fg, letterSpacing: -0.2 }}>{s.n}</div>
                {s.pr && <div style={{ padding: '1px 6px', background: c.accent, color: c.ink, fontFamily: ACFonts.mono, fontSize: 8, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' }}>PR</div>}
              </div>
              <div style={{ marginTop: 3, fontFamily: ACFonts.mono, fontSize: 10.5, color: c.dim, letterSpacing: 0.2 }}>
                {s.t} · {s.v} lb · top {s.top}
              </div>
            </div>
            {/* Chevron */}
            <svg width="9" height="9" viewBox="0 0 9 9"><path d="M2 1l4 3.5L2 8" stroke={c.dim} strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        ))}
      </div>

      {/* Month nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 20px 22px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M7 1L3 5l4 4" stroke={c.fg} strokeWidth="1.6" fill="none" strokeLinecap="round"/></svg>
          <ACLabel size={12} color={c.fg} style={{ fontWeight: 600 }}>March</ACLabel>
        </div>
        <ACLabel size={10} color={c.mute} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.5, textTransform: 'uppercase' }}>scroll for older</ACLabel>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: 0.3 }}>
          <ACLabel size={12} color={c.fg} style={{ fontWeight: 600 }}>May</ACLabel>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M3 1l4 4-4 4" stroke={c.fg} strokeWidth="1.6" fill="none" strokeLinecap="round"/></svg>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// P7-9 — WEB LANDING + PRICING (browser frame, desktop)
// The ONE non-iOS screen. Rendered at 1024×720 inside a Chrome-ish chrome.
// ══════════════════════════════════════════════════════════════
function BrowserFrame({ url, children, width = 1024, height = 720, dark }) {
  const bgChrome = dark ? '#1a1915' : '#d8d2c1';
  const barBg = dark ? '#252420' : '#eae3d0';
  const urlBg = dark ? '#1a1915' : '#f8f3e4';
  const dot = ['#fc615a', '#ffbd2e', '#28c93f'];
  const textCol = dark ? '#efe9da' : '#0a0a0a';
  return (
    <div style={{
      width, background: bgChrome, border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'}`,
      boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
      overflow: 'hidden',
    }}>
      {/* Title bar */}
      <div style={{ padding: '10px 14px', background: barBg, display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}` }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {dot.map(col => <div key={col} style={{ width: 12, height: 12, borderRadius: 999, background: col }} />)}
        </div>
        <div style={{ flex: 1, padding: '5px 12px', background: urlBg, borderRadius: 6, border: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}`, fontFamily: 'ui-monospace, SF Mono, Menlo, monospace', fontSize: 11, color: textCol, display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><rect x="2" y="4" width="6" height="5" stroke={textCol} strokeWidth="1.2" fill="none"/><path d="M4 4V3a1 1 0 012 0v1" stroke={textCol} strokeWidth="1.2" fill="none"/></svg>
          {url}
        </div>
        <div style={{ opacity: 0.4, fontFamily: 'ui-monospace, SF Mono, Menlo, monospace', fontSize: 10, color: textCol }}>⌘T</div>
      </div>
      <div style={{ width, height, overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );
}

function WebLandingBody({ dark }) {
  const c = useACT(dark);
  return (
    <div style={{
      width: '100%', height: '100%', background: c.bg, color: c.fg,
      fontFamily: ACFonts.body, display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Nav */}
      <div style={{ padding: '18px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${c.hair}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <HeartMark size={22} color={c.fg} accent={c.accent} />
          <div style={{ fontFamily: ACFonts.brand, fontSize: 18, letterSpacing: -0.6, color: c.fg, textTransform: 'lowercase', display: 'inline-flex', alignItems: 'baseline' }}>
            <span>atlas</span>
            <span style={{ width: 4, height: 4, background: c.accent, margin: '0 2px 1px' }} />
            <span>core</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 28 }}>
          {['the system', 'pricing', 'science', 'changelog'].map(k => (
            <span key={k} style={{ fontFamily: ACFonts.body, fontSize: 13, fontWeight: 500, color: c.dim, letterSpacing: -0.2 }}>{k}</span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <span style={{ fontFamily: ACFonts.body, fontSize: 13, fontWeight: 600, color: c.fg, letterSpacing: -0.2 }}>sign in</span>
          <div style={{ padding: '6px 14px', background: c.accent, color: c.ink, fontFamily: ACFonts.body, fontSize: 13, fontWeight: 700, letterSpacing: -0.2 }}>download</div>
        </div>
      </div>

      {/* Hero */}
      <div style={{ padding: '48px 40px 32px', display: 'flex', gap: 40, flex: 1 }}>
        <div style={{ flex: 1.3 }}>
          <ACLabel size={11} color={c.accent} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.8, textTransform: 'uppercase', fontWeight: 700 }}>
            · the body, operationalized
          </ACLabel>
          <h1 style={{
            margin: '14px 0 0', fontFamily: ACFonts.display, fontSize: 72,
            letterSpacing: -3.6, lineHeight: 0.9, color: c.fg, textTransform: 'lowercase',
          }}>
            train. fuel.<br />
            read your<br />
            <span style={{ background: c.fg, color: c.bg, padding: '0 10px' }}>biology.</span>
          </h1>
          <p style={{ margin: '22px 0 0', fontSize: 15, lineHeight: 1.55, color: c.dim, maxWidth: 460 }}>
            One app for the loop: workouts, meals, labs, sleep. A coach that reads all of it. No streaks. No guilt. No ads. Your data stays yours.
          </p>
          <div style={{ marginTop: 26, display: 'flex', gap: 10 }}>
            <div style={{ padding: '12px 20px', background: c.accent, color: c.ink, fontFamily: ACFonts.body, fontSize: 14, fontWeight: 700, letterSpacing: -0.2 }}>Start free · 14 days</div>
            <div style={{ padding: '12px 20px', border: `1px solid ${c.faint}`, color: c.fg, fontFamily: ACFonts.body, fontSize: 14, fontWeight: 600, letterSpacing: -0.2 }}>Read the manifesto</div>
          </div>
          {/* Social proof strip */}
          <div style={{ marginTop: 40, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ display: 'flex' }}>
              {[0,1,2,3].map(i => (
                <div key={i} style={{ width: 24, height: 24, borderRadius: 999, background: [c.fg, c.accent, c.dim, c.mute][i], marginLeft: i === 0 ? 0 : -6, border: `2px solid ${c.bg}` }} />
              ))}
            </div>
            <ACLabel size={11} color={c.dim}>
              <span style={{ color: c.fg, fontWeight: 700 }}>8,412</span> people training this week
            </ACLabel>
          </div>
        </div>
        {/* Phone mockup (very light) */}
        <div style={{ flex: 0.9, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 240, height: 480, background: c.fg, borderRadius: 32, padding: 12, boxShadow: '0 30px 80px rgba(0,0,0,0.25)' }}>
            <div style={{ width: '100%', height: '100%', background: c.bg, borderRadius: 22, padding: 20, display: 'flex', flexDirection: 'column' }}>
              <ACLabel size={9} color={c.accent} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.8, textTransform: 'uppercase', fontWeight: 700 }}>today · 18 apr</ACLabel>
              <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
                <ACRing size={150} value={87} dark={dark} thickness={10} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontFamily: ACFonts.display, fontSize: 36, fontWeight: 700, letterSpacing: -1.4, color: c.fg }}>87</span>
                <ACLabel size={10} color={c.dim} style={{ display: 'block', fontFamily: ACFonts.mono, letterSpacing: 0.5, textTransform: 'uppercase', marginTop: 2 }}>ready</ACLabel>
              </div>
              <div style={{ marginTop: 12, padding: 10, background: c.card, borderRadius: 10, flex: 1 }}>
                <ACLabel size={8} color={c.accent} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.6, textTransform: 'uppercase', fontWeight: 700 }}>next</ACLabel>
                <div style={{ marginTop: 4, fontFamily: ACFonts.display, fontSize: 15, fontWeight: 700, color: c.fg, letterSpacing: -0.3 }}>Heavy Lower</div>
                <div style={{ marginTop: 2, fontFamily: ACFonts.mono, fontSize: 9, color: c.dim }}>58 min · 5 lifts</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing strip */}
      <div style={{ padding: '0 40px 28px', display: 'flex', gap: 14, borderTop: `1px solid ${c.hair}`, paddingTop: 28 }}>
        {[
          { plan: 'free',   price: '$0',  per: '/ forever', blurb: 'log workouts, fuel, weight. core loop, no lock-ins.', cta: 'Download', active: false },
          { plan: 'annual', price: '$99', per: '/ year',    blurb: 'everything. labs, coach, body + biology. best value.', cta: 'Start 14-day trial', active: true, save: '-17%' },
          { plan: 'pro',    price: '$249',per: '/ year',    blurb: 'annual + clinician share + priority coach + exports.', cta: 'Go pro', active: false },
        ].map((p, i) => (
          <div key={i} style={{
            flex: 1, padding: 18, background: p.active ? c.fg : c.card, color: p.active ? c.bg : c.fg,
            borderRadius: 0, border: p.active ? 'none' : `1px solid ${c.hair}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <ACLabel size={10} color={p.active ? c.accent : c.dim} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.8, textTransform: 'uppercase', fontWeight: 700 }}>{p.plan}</ACLabel>
              {p.save && <div style={{ padding: '2px 6px', background: c.accent, color: c.ink, fontFamily: ACFonts.mono, fontSize: 8, fontWeight: 700, letterSpacing: 0.6 }}>{p.save}</div>}
            </div>
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontFamily: ACFonts.display, fontSize: 36, fontWeight: 700, letterSpacing: -1.6, fontVariantNumeric: 'tabular-nums' }}>{p.price}</span>
              <ACLabel size={11} color={p.active ? 'rgba(239,233,218,0.55)' : c.dim} style={{ fontFamily: ACFonts.mono }}>{p.per}</ACLabel>
            </div>
            <div style={{ marginTop: 12, fontFamily: ACFonts.body, fontSize: 11.5, lineHeight: 1.55, color: p.active ? 'rgba(239,233,218,0.7)' : c.dim, minHeight: 32 }}>
              {p.blurb}
            </div>
            <div style={{ marginTop: 14, padding: '9px 12px', textAlign: 'center',
              background: p.active ? c.accent : 'transparent',
              border: p.active ? 'none' : `1px solid ${c.faint}`,
              color: p.active ? c.ink : c.fg,
              fontFamily: ACFonts.body, fontSize: 12, fontWeight: 700, letterSpacing: -0.2,
            }}>{p.cta}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function S44_Web_Landing({ dark }) {
  return (
    <BrowserFrame url="atlas.core" width={1024} height={720} dark={dark}>
      <WebLandingBody dark={dark} />
    </BrowserFrame>
  );
}

Object.assign(window, {
  S36_Auth_Entry, S37_Auth_Recover, S38_Account_Settings, S39_Subscription,
  S40_Help, S41_Legal, S42_Food_Detail, S43_Workout_History, S44_Web_Landing,
  BrowserFrame, WebLandingBody,
});
