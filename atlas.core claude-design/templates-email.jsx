// templates-email.jsx — atlas.core master template pack · part 3a
// ════════════════════════════════════════════════════════════════════
// EMAIL TEMPLATES (priority 3)
//
// Render frame: 640 × variable (shown at 560 × 700 artboard, scrolled off if
// content exceeds — each template is tuned to fit on a single artboard view).
//
// Structure (every email):
//   1. HEADER BAR — atlas·core mark + system label (mono)
//   2. PRE-HEADER — micro mono label, tightly tracked
//   3. SUBJECT ECHO — Archivo Black, 32–40
//   4. BODY — SF Pro 15/1.55 on #EFE9DA paper
//   5. KEY MODULE — one data panel, CTA, or receipt block
//   6. CTA — solid ink button, no gradient, no rounded corners
//   7. FOOTER — legal + unsub, mono 10pt / 2pt track / dim
//
// HTML-safe: table-style grid is intentional — these scaffolds map 1:1 to
// production MJML/HTML blocks. Cheaper models can spin copy variants.
// ════════════════════════════════════════════════════════════════════

const EW = 560;
const EH = 760;

function EPanel({ label, children }) {
  const t = window.useTheme();
  return (
    <DCArtboard label={label} width={EW + 40} height={EH + 40} style={{ background: '#e6dfc8', borderRadius: 0 }}>
      <div style={{ padding: 20, width: '100%', height: '100%', boxSizing: 'border-box' }}>
        <div style={{
          width: EW, height: EH, background: t.bg, color: t.ink,
          fontFamily: '-apple-system, "SF Pro Text", system-ui, sans-serif',
          position: 'relative', overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
        }}>
          {children}
        </div>
      </div>
    </DCArtboard>
  );
}

function EHeader({ system, preheader }) {
  const t = window.useTheme();
  return (
    <div>
      <div style={{ height: 8, background: t.accent }}/>
      <div style={{ padding: '18px 32px', borderBottom: `1px solid rgba(10,10,10,0.1)`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <HeartMark size={16} color={t.ink} accent={t.accent}/>
          <span style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 13, letterSpacing: -0.3 }}>atlas·core</span>
        </div>
        <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, letterSpacing: 2, color: 'rgba(10,10,10,0.5)' }}>{system}</span>
      </div>
      <div style={{ padding: '14px 32px 0', fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 3, color: t.accent }}>
        {preheader}
      </div>
    </div>
  );
}

function ESubject({ children }) {
  return (
    <div style={{
      padding: '6px 32px 14px',
      fontFamily: '"Archivo Black", sans-serif', fontSize: 34, lineHeight: 1.02, letterSpacing: -1.4,
      textTransform: 'lowercase',
    }}>{children}</div>
  );
}

function EBody({ children }) {
  return (
    <div style={{ padding: '0 32px', fontSize: 14.5, lineHeight: 1.55, color: 'rgba(10,10,10,0.78)' }}>
      {children}
    </div>
  );
}

function EButton({ children, href = '#', secondary }) {
  const t = window.useTheme();
  return (
    <div style={{ padding: '20px 32px 0' }}>
      <div style={{
        display: 'inline-block', padding: '14px 22px',
        background: secondary ? 'transparent' : t.ink,
        color: secondary ? t.ink : t.bg,
        fontFamily: '"Archivo Black", sans-serif', fontSize: 13, letterSpacing: -0.3,
        textTransform: 'lowercase', border: secondary ? `1.5px solid ${t.ink}` : 'none',
      }}>{children} →</div>
    </div>
  );
}

function EFooter({ kind = 'generic' }) {
  const t = window.useTheme();
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      padding: '16px 32px', borderTop: '1px solid rgba(10,10,10,0.08)',
      fontFamily: '"JetBrains Mono", monospace', fontSize: 9, letterSpacing: 2, color: 'rgba(10,10,10,0.55)',
      display: 'flex', justifyContent: 'space-between', background: '#f4efde',
    }}>
      <span>ATLAS.CORE · SF, CA · {kind.toUpperCase()}</span>
      <span>UNSUBSCRIBE · PREFERENCES</span>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// E-01 · WELCOME (hero)
// ══════════════════════════════════════════════════════════════
function E_Welcome() {
  const t = window.useTheme();
  return (
    <EPanel label="e-01 · welcome">
      <EHeader system="LIFECYCLE · T-0" preheader="DAY ZERO · YOUR SYSTEM IS LIVE"/>
      <ESubject>welcome to the<br/>operating system.</ESubject>
      <EBody>
        <p style={{ margin: 0 }}>Hey [first_name],</p>
        <p style={{ marginTop: 12 }}>
          atlas.core isn't a tracker. It's the dashboard for everything you're already doing — training, eating, sleeping, testing. We read the signals. You make the calls.
        </p>
        <p style={{ marginTop: 12 }}>
          Three things to set up today, 4 minutes total:
        </p>
      </EBody>
      {/* Module: checklist */}
      <div style={{ padding: '16px 32px 0' }}>
        {[
          ['01', 'CONNECT WEARABLE', '2 min · Apple Health / Whoop / Garmin'],
          ['02', 'IMPORT LAB PDF',   '1 min · Quest / LabCorp / Function'],
          ['03', 'PICK A PROTOCOL',  '1 min · Strength / longevity / cut'],
        ].map(([n, l, s]) => (
          <div key={n} style={{ padding: '10px 0', borderBottom: '1px solid rgba(10,10,10,0.08)', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 28, height: 28, background: t.ink, color: t.bg, fontFamily: '"Archivo Black", sans-serif', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{n}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700 }}>{l}</div>
              <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 2, color: 'rgba(10,10,10,0.55)', marginTop: 2 }}>{s}</div>
            </div>
            <div style={{ fontSize: 18, color: t.accent }}>→</div>
          </div>
        ))}
      </div>
      <EButton>open atlas.core</EButton>
      <EFooter kind="welcome · t-0"/>
    </EPanel>
  );
}

// ══════════════════════════════════════════════════════════════
// E-02 · MAGIC CODE / SIGN-IN
// ══════════════════════════════════════════════════════════════
function E_MagicCode() {
  const t = window.useTheme();
  return (
    <EPanel label="e-02 · magic code">
      <EHeader system="AUTH · TRANSACTIONAL" preheader="SIGN-IN CODE · EXPIRES 10 MIN"/>
      <ESubject>your code:</ESubject>
      {/* Code block */}
      <div style={{ padding: '4px 32px 0' }}>
        <div style={{
          padding: '22px 0', textAlign: 'center',
          background: t.ink, color: t.bg,
          fontFamily: '"JetBrains Mono", monospace', fontSize: 52, letterSpacing: 18, fontWeight: 700,
        }}>
          <span style={{ marginLeft: 18 }}>482 · 196</span>
        </div>
      </div>
      <div style={{ padding: '14px 32px 0', fontSize: 13.5, lineHeight: 1.55, color: 'rgba(10,10,10,0.72)' }}>
        Enter this in the atlas.core sign-in screen on [device]. It expires in <strong>10 minutes</strong>.
      </div>
      <div style={{ padding: '18px 32px 0' }}>
        <div style={{ padding: '12px 14px', background: '#f4efde', fontSize: 12.5, lineHeight: 1.5, color: 'rgba(10,10,10,0.7)' }}>
          Didn't request this? Someone may have mistyped their email. Ignore this message — we never ask for codes over chat or phone.
        </div>
      </div>
      <EFooter kind="auth · tx"/>
    </EPanel>
  );
}

// ══════════════════════════════════════════════════════════════
// E-03 · ONBOARDING DAY 3
// ══════════════════════════════════════════════════════════════
function E_Onboarding() {
  const t = window.useTheme();
  return (
    <EPanel label="e-03 · onboarding · day 3">
      <EHeader system="LIFECYCLE · T+3" preheader="DAY 03 · FIRST SIGNAL"/>
      <ESubject>your first<br/>reading is in.</ESubject>
      <EBody>
        <p style={{ margin: 0 }}>Three days of data. Here's what the system is picking up so far:</p>
      </EBody>
      {/* module: readiness tile */}
      <div style={{ padding: '16px 32px 0' }}>
        <div style={{ padding: 18, background: t.ink, color: t.bg }}>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 2, color: t.accent }}>READINESS · 3-DAY AVG</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 8 }}>
            <span style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 60, letterSpacing: -2.5, lineHeight: 1 }}>82</span>
            <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, letterSpacing: 2, color: 'rgba(239,233,218,0.55)' }}>+6 VS BASELINE</span>
          </div>
          <svg width="100%" height={30} viewBox="0 0 500 30" preserveAspectRatio="none" style={{ marginTop: 10 }}>
            <path d="M 0 22 L 100 20 L 200 16 L 300 14 L 400 10 L 500 8" fill="none" stroke={t.accent} strokeWidth={2}/>
          </svg>
        </div>
      </div>
      <EBody>
        <p style={{ marginTop: 16 }}>Want to sharpen the signal? Add a sleep track and a lab PDF — the coach recalibrates.</p>
      </EBody>
      <EButton>open today →</EButton>
      <EFooter kind="lifecycle · d3"/>
    </EPanel>
  );
}

// ══════════════════════════════════════════════════════════════
// E-04 · WEEKLY RECAP
// ══════════════════════════════════════════════════════════════
function E_WeeklyRecap() {
  const t = window.useTheme();
  const Cell = ({ k, v, d, up }) => (
    <div style={{ padding: 12, background: '#f4efde' }}>
      <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, letterSpacing: 2, color: 'rgba(10,10,10,0.5)' }}>{k}</div>
      <div style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 22, letterSpacing: -0.8, lineHeight: 1, marginTop: 4 }}>{v}</div>
      <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, letterSpacing: 2, color: up ? t.accent : 'rgba(10,10,10,0.45)', marginTop: 4 }}>{d}</div>
    </div>
  );
  return (
    <EPanel label="e-04 · weekly recap">
      <EHeader system="RECAP · W17 '26" preheader="WEEK 17 · YOU'RE UP"/>
      <ESubject>week 17.<br/>you're up.</ESubject>
      <EBody>
        <p style={{ margin: 0 }}>Signal-over-noise summary for the week of Apr 20.</p>
      </EBody>
      <div style={{ padding: '16px 32px 0', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        <Cell k="TRAIN"    v="5 / 5"    d="+1 VS W16" up/>
        <Cell k="PROTEIN"  v="94%"      d="ON TARGET" up/>
        <Cell k="SLEEP"    v="7h 24m"   d="-12 MIN"/>
        <Cell k="HRV"      v="54 ms"    d="+4" up/>
        <Cell k="STEPS"    v="11.2k"    d="ABOVE AVG" up/>
        <Cell k="RHR"      v="52"       d="STABLE"/>
      </div>
      <div style={{ padding: '16px 32px 0', fontSize: 13.5, lineHeight: 1.55, color: 'rgba(10,10,10,0.75)' }}>
        <strong>What to do this week:</strong> lean into the recovery tailwind — add one Zone-2 session.
      </div>
      <EButton>see full recap →</EButton>
      <EFooter kind="recap · weekly"/>
    </EPanel>
  );
}

// ══════════════════════════════════════════════════════════════
// E-05 · WORKOUT SUMMARY
// ══════════════════════════════════════════════════════════════
function E_WorkoutSummary() {
  const t = window.useTheme();
  return (
    <EPanel label="e-05 · workout summary">
      <EHeader system="POST-SESSION · T+5m" preheader="SESSION LOGGED · LOWER 5×5"/>
      <ESubject>lower · 5×5.<br/>logged.</ESubject>
      <EBody>
        <p style={{ margin: 0 }}>42 min · 6 exercises · avg RPE 8.2. One auto-PR.</p>
      </EBody>
      <div style={{ padding: '16px 32px 0' }}>
        <div style={{ padding: 16, background: t.accent, color: t.ink }}>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 2 }}>AUTO-PR · DEADLIFT</div>
          <div style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 38, letterSpacing: -1.4, lineHeight: 1, marginTop: 4 }}>420 lb × 5</div>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 2, marginTop: 4, opacity: 0.7 }}>NEW 5RM · +5 LB</div>
        </div>
      </div>
      {/* set list */}
      <div style={{ padding: '12px 32px 0' }}>
        {[
          ['DEADLIFT',     '420 × 5 · RPE 8.5'],
          ['FRONT SQUAT',  '225 × 5 · RPE 7.5'],
          ['RDL',          '185 × 8 · RPE 7'],
          ['LEG PRESS',    '4 × 10'],
        ].map(([k, v]) => (
          <div key={k} style={{ padding: '8px 0', borderBottom: '1px solid rgba(10,10,10,0.08)', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{k}</span>
            <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(10,10,10,0.7)' }}>{v}</span>
          </div>
        ))}
      </div>
      <EButton>session detail →</EButton>
      <EFooter kind="activity · session"/>
    </EPanel>
  );
}

// ══════════════════════════════════════════════════════════════
// E-06 · LAB RESULTS AVAILABLE
// ══════════════════════════════════════════════════════════════
function E_Labs() {
  const t = window.useTheme();
  return (
    <EPanel label="e-06 · labs · available">
      <EHeader system="LABS · RESULTS READY" preheader="Q2 PANEL · 3 FLAGGED"/>
      <ESubject>results in.<br/>3 flagged.</ESubject>
      <EBody>
        <p style={{ margin: 0 }}>Your Q2 panel posted at 06:14. 84 markers. The system flagged 3 outside optimal range.</p>
      </EBody>
      <div style={{ padding: '16px 32px 0' }}>
        {[
          ['FT',   'FREE TESTOSTERONE',  '22 pg/mL',   'ELEVATED'],
          ['APOB', 'APOLIPOPROTEIN B',    '92 mg/dL',   'ELEVATED'],
          ['VIT D','25-HYDROXY',          '22 ng/mL',   'LOW'],
        ].map(([k, n, v, s]) => (
          <div key={k} style={{ padding: '10px 12px', background: '#f4efde', marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, letterSpacing: 2, color: t.accent }}>{k}</div>
              <div style={{ fontSize: 12, fontWeight: 600, marginTop: 2 }}>{n}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12, fontWeight: 700 }}>{v}</div>
              <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, letterSpacing: 2, color: t.accent }}>{s}</div>
            </div>
          </div>
        ))}
      </div>
      <EButton>review panel →</EButton>
      <EFooter kind="labs · notification"/>
    </EPanel>
  );
}

// ══════════════════════════════════════════════════════════════
// E-07 · TRIAL ENDING
// ══════════════════════════════════════════════════════════════
function E_TrialEnding() {
  const t = window.useTheme();
  return (
    <EPanel label="e-07 · trial ending">
      <EHeader system="BILLING · T-2" preheader="2 DAYS LEFT · NO CARD YET"/>
      <ESubject>2 days left.</ESubject>
      <EBody>
        <p style={{ margin: 0 }}>Your trial ends <strong>Friday 26 Apr</strong>. No card on file yet — so you'll simply lose access.</p>
        <p style={{ marginTop: 12 }}>What you'd keep:</p>
      </EBody>
      <div style={{ padding: '12px 32px 0' }}>
        {[
          ['84 lab markers, trended'],
          ['Protocol builder · beta'],
          ['Morning brief · coach'],
          ['42 PRs & 3-month strength curves'],
        ].map(x => (
          <div key={x} style={{ padding: '7px 0', display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 6, height: 6, background: t.accent }}/>
            <span style={{ fontSize: 13.5 }}>{x}</span>
          </div>
        ))}
      </div>
      <div style={{ padding: '20px 32px 0', display: 'flex', gap: 10 }}>
        <div style={{ padding: '14px 18px', background: t.ink, color: t.bg, fontFamily: '"Archivo Black", sans-serif', fontSize: 13, letterSpacing: -0.3 }}>continue · $14/mo →</div>
        <div style={{ padding: '14px 18px', background: 'transparent', border: `1.5px solid ${t.ink}`, color: t.ink, fontFamily: '"Archivo Black", sans-serif', fontSize: 13, letterSpacing: -0.3 }}>annual · save 30%</div>
      </div>
      <EFooter kind="billing · t-2"/>
    </EPanel>
  );
}

// ══════════════════════════════════════════════════════════════
// E-08 · UPGRADE
// ══════════════════════════════════════════════════════════════
function E_Upgrade() {
  const t = window.useTheme();
  return (
    <EPanel label="e-08 · upgrade">
      <EHeader system="PLAN · UPGRADE" preheader="ATLAS PRO · NOW OPEN"/>
      <ESubject>atlas pro.<br/>for operators.</ESubject>
      <EBody>
        <p style={{ margin: 0 }}>Labs memory. Unlimited protocols. A coach that reads every signal across 18 months.</p>
      </EBody>
      {/* Plan block */}
      <div style={{ padding: '16px 32px 0' }}>
        <div style={{ padding: 18, border: `2px solid ${t.ink}`, position: 'relative' }}>
          <span style={{ position: 'absolute', top: -10, left: 14, padding: '2px 8px', background: t.accent, color: t.ink, fontFamily: '"JetBrains Mono", monospace', fontSize: 9, letterSpacing: 2 }}>RECOMMENDED</span>
          <div style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 22, letterSpacing: -0.8, textTransform: 'lowercase' }}>atlas pro</div>
          <div style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 44, letterSpacing: -1.6, marginTop: 6 }}>$24<span style={{ fontSize: 14, opacity: 0.6 }}> /mo</span></div>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 2, color: 'rgba(10,10,10,0.55)', marginTop: 4 }}>OR $199 / YR · SAVE 30%</div>
        </div>
      </div>
      <EButton>upgrade →</EButton>
      <EFooter kind="billing · upgrade"/>
    </EPanel>
  );
}

// ══════════════════════════════════════════════════════════════
// E-09 · BILLING / RECEIPT
// ══════════════════════════════════════════════════════════════
function E_Receipt() {
  const t = window.useTheme();
  const Row = ({ k, v }) => (
    <div style={{ padding: '8px 0', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(10,10,10,0.08)' }}>
      <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, letterSpacing: 2, color: 'rgba(10,10,10,0.55)' }}>{k}</span>
      <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12, fontWeight: 600 }}>{v}</span>
    </div>
  );
  return (
    <EPanel label="e-09 · receipt">
      <EHeader system="RECEIPT · TX" preheader="RECEIPT · APR 24 2026"/>
      <ESubject>receipt.<br/>$24.00.</ESubject>
      <EBody>
        <p style={{ margin: 0 }}>Payment received for atlas.core · pro.</p>
      </EBody>
      <div style={{ padding: '16px 32px 0' }}>
        <div style={{ padding: 14, background: '#f4efde' }}>
          <Row k="PRODUCT"     v="atlas.core · pro"/>
          <Row k="PERIOD"      v="APR 24 → MAY 24"/>
          <Row k="PAYMENT"     v="VISA ··· 4821"/>
          <Row k="SUBTOTAL"    v="$24.00"/>
          <Row k="TAX"         v="$0.00"/>
          <div style={{ padding: '12px 0 0', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 16, letterSpacing: -0.4 }}>TOTAL</span>
            <span style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 20, letterSpacing: -0.6, color: t.accent }}>$24.00</span>
          </div>
        </div>
      </div>
      <EButton secondary>download pdf</EButton>
      <EFooter kind="billing · tx"/>
    </EPanel>
  );
}

// ══════════════════════════════════════════════════════════════
// E-10 · WINBACK
// ══════════════════════════════════════════════════════════════
function E_Winback() {
  const t = window.useTheme();
  return (
    <EPanel label="e-10 · winback">
      <EHeader system="LIFECYCLE · T+45" preheader="WE SAVED YOUR DATA"/>
      <ESubject>your numbers<br/>are still here.</ESubject>
      <EBody>
        <p style={{ margin: 0 }}>You left 45 days ago. We kept everything — labs, PRs, 6 months of strength data — intact.</p>
      </EBody>
      {/* data snapshot */}
      <div style={{ padding: '16px 32px 0', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {[
          ['42', 'PRS ON FILE'],
          ['84', 'LAB MARKERS'],
          ['18', 'MONTHS OF DATA'],
        ].map(([n, l]) => (
          <div key={l} style={{ padding: 14, background: t.ink, color: t.bg }}>
            <div style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 28, letterSpacing: -1, lineHeight: 1 }}>{n}</div>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 8.5, letterSpacing: 2, color: t.accent, marginTop: 6 }}>{l}</div>
          </div>
        ))}
      </div>
      <EBody>
        <p style={{ marginTop: 14 }}>Come back. One month on us.</p>
      </EBody>
      <EButton>resume · 30 days free →</EButton>
      <EFooter kind="lifecycle · winback"/>
    </EPanel>
  );
}

Object.assign(window, {
  E_Welcome, E_MagicCode, E_Onboarding, E_WeeklyRecap, E_WorkoutSummary,
  E_Labs, E_TrialEnding, E_Upgrade, E_Receipt, E_Winback,
});
