// templates-marketing.jsx — atlas.core master template pack · part 2 of 3
// ════════════════════════════════════════════════════════════════════
// CREATIVE / MARKETING TEMPLATES (priority 2)
//
// Sizes (display at 1:1, export at 2×):
//   Square ad / IG feed:      1080 × 1080 → display 540
//   Vertical story / reel:    1080 × 1920 → display 405 × 720
//   Carousel cover / slide:   1080 × 1350 → display 432 × 540
//   Stat / insight card:      1080 × 1080 → display 540
//   Manifesto post:           1080 × 1350 → display 432 × 540
//
// One type pair:
//   - Archivo Black headline (lowercase, tight, -3 to -5 track)
//   - JetBrains Mono kicker + micro-labels (4pt track, upper)
//   - SF Pro body at 18–22
// One palette: ink / bg / accent.
// Every template below carries: kicker, head, (sub|body), brand footer.
// ════════════════════════════════════════════════════════════════════

// ── shared primitives ───────────────────────────────────────────────
function MPanel({ w, h, bg, fg, label, children, pad = 44, border }) {
  const t = window.useTheme();
  return (
    <DCArtboard label={label} width={w} height={h} style={{ background: bg ?? t.bg, borderRadius: 0, border: border || 'none' }}>
      <div style={{
        width: '100%', height: '100%', color: fg ?? t.ink,
        fontFamily: '-apple-system, "SF Pro Text", system-ui, sans-serif',
        padding: pad, position: 'relative', overflow: 'hidden',
      }}>{children}</div>
    </DCArtboard>
  );
}

function MKicker({ children, color, size = 11 }) {
  return (
    <div style={{
      fontFamily: '"JetBrains Mono", monospace', fontSize: size, letterSpacing: 3,
      textTransform: 'uppercase', color, fontWeight: 600,
      display: 'inline-flex', alignItems: 'center', gap: 8,
    }}>
      <span style={{ width: 6, height: 6, background: 'currentColor' }}/>
      {children}
    </div>
  );
}

function MHead({ children, color, size = 54, lh = 0.92, track = -2.4 }) {
  return (
    <div style={{
      fontFamily: '"Archivo Black", "Arial Black", sans-serif',
      fontSize: size, lineHeight: lh, letterSpacing: track, color,
      textTransform: 'lowercase',
    }}>{children}</div>
  );
}

function MFooter({ color = 'rgba(10,10,10,0.6)', right, abs = true, dark }) {
  const t = window.useTheme();
  const c = dark ? 'rgba(239,233,218,0.65)' : color;
  return (
    <div style={{
      position: abs ? 'absolute' : 'static',
      left: 44, right: 44, bottom: 28,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <HeartMark size={14} color={dark ? t.bg : t.ink} accent={t.accent}/>
        <span style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 11, letterSpacing: -0.3, color: c, textTransform: 'lowercase' }}>atlas·core</span>
      </div>
      <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 2, color: c, opacity: 0.85 }}>
        {right || 'atlas.health'}
      </div>
    </div>
  );
}

// ECG flourish (marketing)
function MECG({ w = 360, h = 28, color }) {
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <path d={`M 0 ${h/2} L ${w*0.3} ${h/2} L ${w*0.36} 4 L ${w*0.42} ${h-4} L ${w*0.5} ${h/2} L ${w*0.7} ${h/2} L ${w*0.76} 4 L ${w*0.82} ${h-4} L ${w*0.88} ${h/2} L ${w} ${h/2}`}
        fill="none" stroke={color} strokeWidth={2} strokeLinecap="square"/>
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════
// M-01 · SQUARE AD · feature launch (hero)  1080×1080 → 540
// ══════════════════════════════════════════════════════════════
function M_SquareAd() {
  const t = window.useTheme();
  return (
    <MPanel label="m-01 · square ad · feature" w={540} h={540} bg={t.ink} fg={t.bg}>
      <MKicker color={t.accent}>NEW · LABS</MKicker>
      <MHead color={t.bg} size={56} lh={0.9} track={-2.8}>
        84 biomarkers.<br/>
        <span style={{ color: t.accent }}>one dashboard.</span>
      </MHead>
      <div style={{ marginTop: 18, fontSize: 15, lineHeight: 1.45, color: 'rgba(239,233,218,0.72)', maxWidth: 360 }}>
        Trended over years. Flagged against optimal ranges, not normal.
      </div>

      {/* mini result card */}
      <div style={{
        position: 'absolute', right: 44, bottom: 88, width: 220,
        padding: 14, background: 'rgba(239,233,218,0.06)', border: '1px solid rgba(239,233,218,0.18)',
      }}>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, letterSpacing: 2, color: t.accent }}>APOB</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 4 }}>
          <span style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 30, letterSpacing: -1, color: t.bg }}>72</span>
          <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, letterSpacing: 2, color: t.accent }}>OPTIMAL</span>
        </div>
        <svg width="100%" height={20} viewBox="0 0 200 20" preserveAspectRatio="none" style={{ marginTop: 6 }}>
          <path d="M 0 14 L 40 12 L 80 13 L 120 8 L 160 5 L 200 3" fill="none" stroke={t.bg} strokeWidth={1.5}/>
        </svg>
      </div>
      <MFooter dark right="learn more →"/>
    </MPanel>
  );
}

// ══════════════════════════════════════════════════════════════
// M-02 · STORY / REEL  1080×1920 → 405×720
// ══════════════════════════════════════════════════════════════
function M_Story() {
  const t = window.useTheme();
  return (
    <MPanel label="m-02 · story · teaser" w={405} h={720} bg={t.bg} fg={t.ink} pad={28}>
      <MKicker color={t.accent}>NEW RELEASE · Q2 '26</MKicker>
      <MHead color={t.ink} size={64} lh={0.9} track={-3}>
        your body,<br/>
        <span style={{ background: t.ink, color: t.bg, padding: '0 10px' }}>readable.</span>
      </MHead>

      {/* vertical ECG */}
      <div style={{ margin: '28px 0 20px' }}>
        <MECG w={340} h={26} color={t.accent}/>
      </div>

      {/* mock preview (phone cropped) */}
      <div style={{
        position: 'absolute', left: 28, right: 28, top: 380, bottom: 100,
        background: t.ink, color: t.bg, padding: 20,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, letterSpacing: 2, color: t.accent }}>READINESS</div>
          <div style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 96, letterSpacing: -4, lineHeight: 0.9, marginTop: 4 }}>87</div>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 3, opacity: 0.55, marginTop: 2 }}>/ 100 · GO</div>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>The system is yours.</div>
          <div style={{ padding: '10px 12px', background: t.accent, color: t.ink, fontFamily: '"Archivo Black", sans-serif', fontSize: 13, letterSpacing: -0.2, textAlign: 'center' }}>
            get the app →
          </div>
        </div>
      </div>
      <MFooter/>
    </MPanel>
  );
}

// ══════════════════════════════════════════════════════════════
// M-03 · FEATURE ANNOUNCEMENT POST (1080×1080)
// ══════════════════════════════════════════════════════════════
function M_FeatureAnnounce() {
  const t = window.useTheme();
  return (
    <MPanel label="m-03 · feature announce" w={540} h={540} bg={t.bg} fg={t.ink}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <MKicker color={t.ink}>SHIPPING · v2.4</MKicker>
        <MKicker color={t.accent}>NOW LIVE</MKicker>
      </div>
      <div style={{ marginTop: 80 }}>
        <MHead color={t.ink} size={64} lh={0.9} track={-3}>
          protocols,<br/>now in <span style={{ color: t.accent }}>beta</span>.
        </MHead>
      </div>
      <div style={{ marginTop: 22, fontSize: 15, lineHeight: 1.5, color: 'rgba(10,10,10,0.7)', maxWidth: 420 }}>
        Build stacks for sleep, recovery, performance. Schedule dosing. Track response against your labs.
      </div>
      {/* feature chips */}
      <div style={{ position: 'absolute', left: 44, right: 44, bottom: 90, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {['PEPTIDES', 'SLEEP STACKS', 'DOSING', 'RESPONSE TRACKING'].map(x => (
          <span key={x} style={{
            padding: '8px 12px', background: t.ink, color: t.bg,
            fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 2,
          }}>{x}</span>
        ))}
      </div>
      <MFooter right="changelog →"/>
    </MPanel>
  );
}

// ══════════════════════════════════════════════════════════════
// M-04 · PRODUCT TEASER (pre-launch)
// ══════════════════════════════════════════════════════════════
function M_Teaser() {
  const t = window.useTheme();
  return (
    <MPanel label="m-04 · teaser · coming" w={540} h={540} bg={t.accent} fg={t.ink}>
      <MKicker color={t.ink}>SOON · Q2 '26</MKicker>
      {/* Large type */}
      <div style={{ position: 'absolute', left: 44, right: 44, top: 140 }}>
        <div style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 148, letterSpacing: -7, lineHeight: 0.85, color: t.ink }}>
          soon.
        </div>
      </div>
      {/* bar */}
      <div style={{ position: 'absolute', left: 44, right: 44, bottom: 130, height: 6, background: 'rgba(10,10,10,0.2)' }}>
        <div style={{ width: '78%', height: '100%', background: t.ink }}/>
      </div>
      <div style={{ position: 'absolute', left: 44, right: 44, bottom: 90, display: 'flex', justifyContent: 'space-between', fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 2, color: 'rgba(10,10,10,0.7)' }}>
        <span>BUILD 0.78 / 1.00</span><span>WAITLIST OPEN</span>
      </div>
      <MFooter right="atlas.health/wait"/>
    </MPanel>
  );
}

// ══════════════════════════════════════════════════════════════
// M-05 · TESTIMONIAL / QUOTE CARD (hero)
// ══════════════════════════════════════════════════════════════
function M_Testimonial() {
  const t = window.useTheme();
  return (
    <MPanel label="m-05 · testimonial" w={540} h={540} bg={t.bg} fg={t.ink}>
      <MKicker color={t.accent}>FROM · BETA</MKicker>
      {/* giant quote mark */}
      <div style={{ position: 'absolute', top: 40, right: 44, fontFamily: '"Archivo Black", sans-serif', fontSize: 180, lineHeight: 0.8, color: t.accent, opacity: 0.22 }}>
        "
      </div>
      <div style={{ marginTop: 90, maxWidth: 440 }}>
        <div style={{
          fontFamily: '"Archivo Black", sans-serif', fontSize: 32, lineHeight: 1.1, letterSpacing: -1.2, color: t.ink,
          textTransform: 'none',
        }}>
          The first health app<br/>that respects how much<br/>data I actually have.
        </div>
      </div>
      <div style={{ position: 'absolute', left: 44, bottom: 78, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 44, height: 44, background: t.ink, color: t.bg, fontFamily: '"Archivo Black", sans-serif', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>ML</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: -0.2 }}>Marcus L.</div>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 2, color: 'rgba(10,10,10,0.55)' }}>FOUNDER · 41 · BETA Q1</div>
        </div>
      </div>
      <MFooter right="+ 300 in beta"/>
    </MPanel>
  );
}

// ══════════════════════════════════════════════════════════════
// M-06 · LAUNCH ANNOUNCEMENT (1080×1350)
// ══════════════════════════════════════════════════════════════
function M_Launch() {
  const t = window.useTheme();
  return (
    <MPanel label="m-06 · launch day" w={432} h={540} bg={t.ink} fg={t.bg}>
      <MKicker color={t.accent}>NOW LIVE · DAY 01</MKicker>
      <div style={{ marginTop: 14 }}>
        <MHead color={t.bg} size={56} lh={0.88} track={-2.5}>
          atlas.core<br/>
          <span style={{ color: t.accent }}>is live.</span>
        </MHead>
      </div>
      <div style={{ marginTop: 18, fontSize: 14, lineHeight: 1.5, color: 'rgba(239,233,218,0.72)' }}>
        Two years of building. One operating system for training, nutrition, labs, recovery.
      </div>
      {/* feature grid */}
      <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {[
          ['01', 'TRAIN'],
          ['02', 'EAT'],
          ['03', 'LABS'],
          ['04', 'COACH'],
        ].map(([n, l]) => (
          <div key={n} style={{ padding: 14, background: 'rgba(239,233,218,0.06)', border: '1px solid rgba(239,233,218,0.15)' }}>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, letterSpacing: 2, color: t.accent }}>{n}</div>
            <div style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 18, letterSpacing: -0.6, marginTop: 4 }}>{l.toLowerCase()}</div>
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', left: 44, right: 44, bottom: 70, padding: '12px 14px', background: t.accent, color: t.ink, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 14, letterSpacing: -0.4 }}>download · iOS</span>
        <span style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 14 }}>→</span>
      </div>
      <MFooter dark right="v1.0 · apr '26"/>
    </MPanel>
  );
}

// ══════════════════════════════════════════════════════════════
// M-07 · CAROUSEL COVER (1080×1350)
// ══════════════════════════════════════════════════════════════
function M_CarouselCover() {
  const t = window.useTheme();
  return (
    <MPanel label="m-07 · carousel · cover" w={432} h={540} bg={t.bg} fg={t.ink}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <MKicker color={t.ink}>GUIDE · 06 SLIDES</MKicker>
        <MKicker color={t.accent}>SWIPE →</MKicker>
      </div>
      <div style={{ marginTop: 80 }}>
        <MHead color={t.ink} size={60} lh={0.9} track={-3}>
          read your<br/>
          <span style={{ color: t.accent }}>blood work</span><br/>
          like a pro.
        </MHead>
      </div>
      <div style={{ marginTop: 20, fontSize: 14, lineHeight: 1.5, color: 'rgba(10,10,10,0.7)' }}>
        A 6-step guide to the markers that actually tell you something. No noise.
      </div>

      {/* swipe indicator */}
      <div style={{ position: 'absolute', left: 44, right: 44, bottom: 82, display: 'flex', gap: 4 }}>
        {[0, 1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{ flex: 1, height: 3, background: i === 0 ? t.ink : 'rgba(10,10,10,0.2)' }}/>
        ))}
      </div>
      <MFooter right="@atlas.core"/>
    </MPanel>
  );
}

// ══════════════════════════════════════════════════════════════
// M-08 · CAROUSEL CONTENT SLIDE (1080×1350)
// ══════════════════════════════════════════════════════════════
function M_CarouselSlide() {
  const t = window.useTheme();
  return (
    <MPanel label="m-08 · carousel · content 03" w={432} h={540} bg={t.bg} fg={t.ink}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <MKicker color={t.ink}>03 · APOB</MKicker>
        <MKicker color={t.accent}>03 / 06</MKicker>
      </div>

      <div style={{ marginTop: 56 }}>
        <div style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 38, lineHeight: 0.95, letterSpacing: -1.4, color: t.ink, textTransform: 'lowercase' }}>
          apolipoprotein b<br/>is <span style={{ color: t.accent }}>the signal.</span>
        </div>
      </div>

      <div style={{ marginTop: 22, fontSize: 14, lineHeight: 1.5, color: 'rgba(10,10,10,0.72)' }}>
        It counts the particles that actually drive cardiovascular risk. LDL-C is a proxy. ApoB is the number.
      </div>

      {/* callout stat */}
      <div style={{ marginTop: 28, padding: 18, background: t.ink, color: t.bg, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 2, color: t.accent }}>OPTIMAL</div>
          <div style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 36, letterSpacing: -1.5, lineHeight: 1, marginTop: 4 }}>&lt; 80<span style={{ fontSize: 14, opacity: 0.7 }}> mg/dL</span></div>
        </div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 2, color: 'rgba(239,233,218,0.5)', textAlign: 'right', maxWidth: 130 }}>
          POP. AVG 95 · CVD RISK RISES ABOVE 90
        </div>
      </div>

      {/* swipe indicator */}
      <div style={{ position: 'absolute', left: 44, right: 44, bottom: 82, display: 'flex', gap: 4 }}>
        {[0, 1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{ flex: 1, height: 3, background: i === 2 ? t.ink : 'rgba(10,10,10,0.2)' }}/>
        ))}
      </div>
      <MFooter right="keep swiping →"/>
    </MPanel>
  );
}

// ══════════════════════════════════════════════════════════════
// M-09 · STAT / INSIGHT CARD
// ══════════════════════════════════════════════════════════════
function M_StatCard() {
  const t = window.useTheme();
  return (
    <MPanel label="m-09 · stat · insight" w={540} h={540} bg={t.bg} fg={t.ink}>
      <MKicker color={t.accent}>DATA · Q1 '26</MKicker>
      <div style={{ marginTop: 40 }}>
        <div style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 260, lineHeight: 0.85, letterSpacing: -14, color: t.ink }}>
          87<span style={{ fontSize: 80, letterSpacing: -3, color: t.accent }}>%</span>
        </div>
      </div>
      <div style={{ marginTop: 12, fontFamily: '-apple-system, system-ui', fontSize: 20, lineHeight: 1.35, fontWeight: 600, color: t.ink, letterSpacing: -0.3, maxWidth: 420 }}>
        of atlas.core users hit their protein target every training day.
      </div>
      <div style={{ marginTop: 12, fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 2, color: 'rgba(10,10,10,0.5)' }}>
        N = 412 · 90-DAY AVG · APR '26
      </div>
      <MFooter right="more data →"/>
    </MPanel>
  );
}

// ══════════════════════════════════════════════════════════════
// M-10 · COMPARISON CARD (versus)
// ══════════════════════════════════════════════════════════════
function M_Comparison() {
  const t = window.useTheme();
  const Row = ({ label, left, right, win }) => (
    <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 1fr', gap: 0, borderTop: '1px solid rgba(10,10,10,0.15)', padding: '10px 0' }}>
      <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 2, color: 'rgba(10,10,10,0.55)' }}>{label}</div>
      <div style={{ fontSize: 13, color: 'rgba(10,10,10,0.55)' }}>{left}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: win ? t.accent : t.ink }}>{right}</div>
    </div>
  );
  return (
    <MPanel label="m-10 · comparison" w={540} h={540} bg={t.bg} fg={t.ink}>
      <MKicker color={t.accent}>WHY ATLAS</MKicker>
      <MHead color={t.ink} size={38} lh={0.95} track={-1.5}>
        tracker vs.<br/>
        <span style={{ color: t.accent }}>operating system.</span>
      </MHead>

      <div style={{ marginTop: 26 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 1fr', padding: '0 0 10px' }}>
          <div/>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 2, color: 'rgba(10,10,10,0.45)' }}>GENERIC</div>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 2, color: t.accent }}>ATLAS.CORE</div>
        </div>
        <Row label="LABS"      left="—"           right="84 markers"  win/>
        <Row label="PROTOCOLS" left="—"           right="first-class" win/>
        <Row label="COACH"     left="streaks"     right="signal-led"  win/>
        <Row label="DATA"      left="locked"      right="yours"       win/>
        <Row label="TONE"      left="wellness"    right="analytical"  win/>
      </div>
      <MFooter right="see full spec →"/>
    </MPanel>
  );
}

// ══════════════════════════════════════════════════════════════
// M-11 · FOUNDER / MANIFESTO POST (1080×1350)
// ══════════════════════════════════════════════════════════════
function M_Manifesto() {
  const t = window.useTheme();
  return (
    <MPanel label="m-11 · manifesto" w={432} h={540} bg={t.ink} fg={t.bg} pad={32}>
      <MKicker color={t.accent}>MANIFESTO · 001</MKicker>
      <div style={{ marginTop: 18 }}>
        <div style={{
          fontFamily: '-apple-system, "SF Pro Text", Georgia, serif', fontSize: 17, lineHeight: 1.55,
          color: t.bg, maxWidth: 360,
        }}>
          We built atlas.core because the market treats your body like a <em style={{ color: t.accent, fontStyle: 'normal', fontWeight: 700 }}>lifestyle</em>.
          <br/><br/>
          It is not. It is a system.<br/>
          With inputs. Outputs. Signals. State.<br/><br/>
          So we designed the first tool that respects how much data you actually have — and how few decisions you actually need to make.
        </div>
      </div>
      <div style={{ position: 'absolute', left: 32, right: 32, bottom: 70 }}>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 2, color: 'rgba(239,233,218,0.55)' }}>— E.S. · FOUNDER</div>
        <div style={{ marginTop: 10 }}>
          <MECG w={360} h={22} color={t.accent}/>
        </div>
      </div>
      <MFooter dark right="read full →"/>
    </MPanel>
  );
}

// ══════════════════════════════════════════════════════════════
// M-12 · ALT · SQUARE DARK MINIMAL (alt treatment)
// ══════════════════════════════════════════════════════════════
function M_SquareAlt() {
  const t = window.useTheme();
  return (
    <MPanel label="m-12 · square · minimal alt" w={540} h={540} bg={t.bg} fg={t.ink}>
      <MKicker color={t.accent}>NEW</MKicker>
      {/* massive type, lots of air */}
      <div style={{ position: 'absolute', left: 44, right: 44, top: 200 }}>
        <div style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 120, letterSpacing: -6, lineHeight: 0.85, color: t.ink }}>
          less,<br/>
          <span style={{ color: t.accent }}>measured.</span>
        </div>
      </div>
      <MFooter right="atlas.health →"/>
    </MPanel>
  );
}

Object.assign(window, {
  M_SquareAd, M_Story, M_FeatureAnnounce, M_Teaser, M_Testimonial,
  M_Launch, M_CarouselCover, M_CarouselSlide, M_StatCard,
  M_Comparison, M_Manifesto, M_SquareAlt,
});
