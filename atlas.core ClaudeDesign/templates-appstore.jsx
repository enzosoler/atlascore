// templates-appstore.jsx — atlas.core master template pack · part 1 of 3
// ════════════════════════════════════════════════════════════════════
// APP STORE SCREENSHOTS (priority 1)
//
// Target aspect ratios (Apple):
//   - 6.7" iPhone (primary): 1290 × 2796
//   - 6.5" iPhone (legacy):  1242 × 2688
//   - iPad 13":              2064 × 2752
// We design at half-scale (645 × 1398) so artboards fit on canvas.
// Export logic: 2× any screenshot artboard → production-ready.
//
// Template anatomy (every screenshot):
//   1. HEADLINE BAND — 2 lines max, Archivo Black 64–84px (half-scale)
//   2. SUBHEAD       — 1 line, SF Pro 20–24, dim
//   3. PHONE MOCKUP  — rotated or square, cropped at bottom
//   4. OPTIONAL CALLOUT — accent ECG chip / arrow / stat
//   5. FOOTER MARK   — brand lockup or page indicator (1/6, 2/6…)
//
// Layout slots used throughout (half-scale 645 × 1398):
//   Padding:        56 px horizontal
//   Top band:       top 420 px (head + sub)
//   Mockup zone:    y 420 → 1280
//   Footer:         bottom 80 px
//
// ════════════════════════════════════════════════════════════════════

// Half-scale Apple 6.7" (1290×2796 → 645×1398).
const ASW = 645;
const ASH = 1398;

// ── shared atoms ────────────────────────────────────────────────────
function ASPanel({ bg, children, ink = true, label, fullBleed }) {
  const t = window.useTheme();
  const bgC = bg ?? (ink ? t.ink : t.bg);
  const fg  = ink ? t.bg : t.ink;
  return (
    <DCArtboard label={label} width={ASW} height={ASH} style={{ background: bgC, borderRadius: 0 }}>
      <div style={{
        width: '100%', height: '100%', position: 'relative',
        color: fg, fontFamily: '-apple-system, "SF Pro Text", system-ui, sans-serif',
        padding: fullBleed ? 0 : '56px 48px 48px',
        overflow: 'hidden',
      }}>
        {children}
      </div>
    </DCArtboard>
  );
}

function ASHeadline({ children, color, mono, size = 72, lh = 0.94, track = -3 }) {
  return (
    <div style={{
      fontFamily: '"Archivo Black", "Arial Black", sans-serif',
      fontSize: size, lineHeight: lh, letterSpacing: track, color,
      textTransform: 'lowercase',
    }}>{children}</div>
  );
}

function ASKicker({ children, color }) {
  return (
    <div style={{
      fontFamily: '"JetBrains Mono", monospace', fontSize: 14, letterSpacing: 4,
      textTransform: 'uppercase', color, fontWeight: 600, marginBottom: 14,
      display: 'inline-flex', alignItems: 'center', gap: 8,
    }}>
      <span style={{ width: 8, height: 8, background: 'currentColor' }} />
      {children}
    </div>
  );
}

function ASSub({ children, color, size = 22 }) {
  return (
    <div style={{
      fontFamily: '-apple-system, "SF Pro Text", system-ui, sans-serif',
      fontSize: size, lineHeight: 1.35, color, fontWeight: 500,
      marginTop: 18, maxWidth: 480,
    }}>{children}</div>
  );
}

function ASPageIndex({ n, total, color }) {
  return (
    <div style={{
      position: 'absolute', left: 48, bottom: 36,
      fontFamily: '"JetBrains Mono", monospace', fontSize: 12, letterSpacing: 3,
      color, opacity: 0.6,
    }}>
      {String(n).padStart(2,'0')} / {String(total).padStart(2,'0')}
    </div>
  );
}

function ASBrandFooter({ color, right }) {
  const t = window.useTheme();
  return (
    <div style={{
      position: 'absolute', right: 48, bottom: 32,
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <HeartMark size={16} color={color} accent={t.accent} />
      <span style={{
        fontFamily: '"Archivo Black", sans-serif', fontSize: 12,
        letterSpacing: -0.4, color, textTransform: 'lowercase',
      }}>atlas{'·'}core</span>
      {right}
    </div>
  );
}

// Phone frame silhouette (no scale to device; just a cropped mockup)
function ASPhone({ children, tilt = 0, y = 420, scale = 0.95, showDevice = true }) {
  const t = window.useTheme();
  return (
    <div style={{
      position: 'absolute', left: '50%', top: y,
      transform: `translateX(-50%) rotate(${tilt}deg) scale(${scale})`,
      transformOrigin: 'top center',
    }}>
      {showDevice ? (
        <div style={{
          width: 360, height: 780,
          background: t.ink, borderRadius: 44,
          padding: 10, boxShadow: '0 40px 80px rgba(0,0,0,0.35), 0 12px 24px rgba(0,0,0,0.25)',
        }}>
          <div style={{
            width: '100%', height: '100%',
            borderRadius: 34, overflow: 'hidden',
            background: t.bg, position: 'relative',
          }}>
            {children}
          </div>
        </div>
      ) : (
        <div style={{ width: 360, height: 780, borderRadius: 34, overflow: 'hidden', background: t.bg }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// AS-01 · COVER / OPENER (hero)
// Template role: app-store screenshot #1. Manifesto energy.
// ══════════════════════════════════════════════════════════════
function AS_Cover() {
  const t = window.useTheme();
  return (
    <ASPanel label="as-01 · cover (hero)" ink={true}>
      <ASKicker color={t.accent}>ATLAS.CORE · HEALTH OS</ASKicker>
      <ASHeadline color={t.bg} size={88} lh={0.9} track={-4}>
        your body,<br/>
        <span style={{ color: t.accent }}>in one</span><br/>
        system.
      </ASHeadline>
      <ASSub color="rgba(239,233,218,0.7)">
        Training, nutrition, labs, sleep, protocols. One operating system for everything you're optimizing.
      </ASSub>

      {/* ECG */}
      <div style={{ marginTop: 36 }}>
        <svg width={540} height={50} viewBox="0 0 540 50">
          <path d="M 0 25 L 140 25 L 160 25 L 180 10 L 200 40 L 220 25 L 260 25 L 280 25 L 300 8 L 320 44 L 340 25 L 540 25"
            fill="none" stroke={t.accent} strokeWidth="3" strokeLinecap="square"/>
        </svg>
      </div>

      <ASPhone y={680} tilt={-3} scale={0.88}>
        <ASMockToday />
      </ASPhone>

      <ASPageIndex n={1} total={6} color="rgba(239,233,218,0.4)" />
      <ASBrandFooter color="rgba(239,233,218,0.7)" />
    </ASPanel>
  );
}

// ══════════════════════════════════════════════════════════════
// AS-02 · FEATURE DETAIL A — workout
// ══════════════════════════════════════════════════════════════
function AS_Feature_Workout() {
  const t = window.useTheme();
  return (
    <ASPanel label="as-02 · feature · workout" ink={false}>
      <ASKicker color={t.ink}>TRAIN</ASKicker>
      <ASHeadline color={t.ink} size={76} lh={0.92} track={-3.5}>
        every rep,<br/>
        <span style={{ background: t.ink, color: t.bg, padding: '0 12px' }}>logged.</span>
      </ASHeadline>
      <ASSub color="rgba(10,10,10,0.7)">
        RPE-aware set logging. Auto-detected PRs. 18-month strength curves. Built for people who track.
      </ASSub>

      {/* Callout */}
      <ASCallout x={410} y={360}>
        <ASMono size={10} color={t.accent}>AUTO-PR</ASMono>
        <div style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 24, lineHeight: 1, color: t.ink, marginTop: 4 }}>
          +5 kg
        </div>
        <ASMono size={10} color="rgba(10,10,10,0.5)">DEADLIFT · 420 LB</ASMono>
      </ASCallout>

      <ASPhone y={640} tilt={2} scale={0.9}>
        <ASMockWorkout />
      </ASPhone>

      <ASPageIndex n={2} total={6} color="rgba(10,10,10,0.4)" />
      <ASBrandFooter color="rgba(10,10,10,0.7)" />
    </ASPanel>
  );
}

// ══════════════════════════════════════════════════════════════
// AS-03 · FEATURE DETAIL B — labs / biomarkers
// ══════════════════════════════════════════════════════════════
function AS_Feature_Labs() {
  const t = window.useTheme();
  return (
    <ASPanel label="as-03 · feature · labs" ink={true}>
      <ASKicker color={t.accent}>LABS</ASKicker>
      <ASHeadline color={t.bg} size={76} lh={0.92} track={-3.5}>
        84 markers.<br/>
        <span style={{ color: t.accent }}>one dashboard.</span>
      </ASHeadline>
      <ASSub color="rgba(239,233,218,0.7)">
        Blood panels, metabolic markers, hormone panels. Trended over years. Flagged against optimal ranges, not just "normal."
      </ASSub>

      {/* Data callout pills */}
      <div style={{
        position: 'absolute', right: 48, top: 220,
        display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end',
      }}>
        {[
          ['APOB', '72 mg/dL', 'OPTIMAL'],
          ['HS-CRP', '0.3', 'OPTIMAL'],
          ['FT', '22 pg/mL', 'ELEVATED'],
        ].map(([k, v, s], i) => (
          <div key={k} style={{
            padding: '10px 14px', background: s === 'ELEVATED' ? t.accent : 'rgba(239,233,218,0.08)',
            color: s === 'ELEVATED' ? t.ink : t.bg,
            fontFamily: '"JetBrains Mono", monospace', fontSize: 11, letterSpacing: 2,
            display: 'flex', gap: 10, alignItems: 'center',
          }}>
            <span style={{ fontWeight: 700 }}>{k}</span>
            <span style={{ fontWeight: 400, opacity: 0.85 }}>{v}</span>
            <span style={{ fontSize: 9, opacity: 0.6 }}>{s}</span>
          </div>
        ))}
      </div>

      <ASPhone y={620} tilt={0} scale={0.92}>
        <ASMockLabs />
      </ASPhone>

      <ASPageIndex n={3} total={6} color="rgba(239,233,218,0.4)" />
      <ASBrandFooter color="rgba(239,233,218,0.7)" />
    </ASPanel>
  );
}

// ══════════════════════════════════════════════════════════════
// AS-04 · FEATURE DETAIL C — coach
// ══════════════════════════════════════════════════════════════
function AS_Feature_Coach() {
  const t = window.useTheme();
  return (
    <ASPanel label="as-04 · feature · coach" ink={false}>
      <ASKicker color={t.ink}>COACH</ASKicker>
      <ASHeadline color={t.ink} size={76} lh={0.92} track={-3.5}>
        an AI that<br/>
        <span style={{ background: t.accent, color: t.ink, padding: '0 12px' }}>reads your data.</span>
      </ASHeadline>
      <ASSub color="rgba(10,10,10,0.7)">
        Every morning: readiness, priorities, one move. No streaks. No guilt. Just signal.
      </ASSub>

      <ASPhone y={620} tilt={-2} scale={0.92}>
        <ASMockBrief />
      </ASPhone>

      <ASPageIndex n={4} total={6} color="rgba(10,10,10,0.4)" />
      <ASBrandFooter color="rgba(10,10,10,0.7)" />
    </ASPanel>
  );
}

// ══════════════════════════════════════════════════════════════
// AS-05 · CREDIBILITY / PROOF
// ══════════════════════════════════════════════════════════════
function AS_Credibility() {
  const t = window.useTheme();
  return (
    <ASPanel label="as-05 · credibility" ink={true}>
      <ASKicker color={t.accent}>BUILT FOR OPERATORS</ASKicker>
      <ASHeadline color={t.bg} size={72} lh={0.94} track={-3}>
        data you can<br/>
        actually <span style={{ color: t.accent }}>act on.</span>
      </ASHeadline>

      <div style={{ marginTop: 56, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, maxWidth: 540 }}>
        {[
          ['42', 'screens designed for depth', t.accent],
          ['84', 'biomarkers tracked', t.bg],
          ['0', 'streak mechanics', t.accent],
          ['∞', 'protocols, peptides, stacks', t.bg],
        ].map(([n, l, col]) => (
          <div key={l}>
            <div style={{
              fontFamily: '"Archivo Black", sans-serif', fontSize: 72, lineHeight: 0.92,
              letterSpacing: -3, color: col,
            }}>{n}</div>
            <div style={{
              fontFamily: '"JetBrains Mono", monospace', fontSize: 12, letterSpacing: 2,
              color: 'rgba(239,233,218,0.6)', marginTop: 6, textTransform: 'uppercase',
            }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Testimonial inset */}
      <div style={{
        position: 'absolute', left: 48, right: 48, bottom: 140,
        padding: '24px 28px', borderLeft: `3px solid ${t.accent}`,
      }}>
        <div style={{
          fontFamily: '-apple-system, "SF Pro Text", system-ui, sans-serif', fontSize: 18,
          lineHeight: 1.45, color: t.bg, fontStyle: 'italic',
        }}>
          "The first health app that respects how much data I actually have."
        </div>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 11, letterSpacing: 2,
          color: 'rgba(239,233,218,0.55)', marginTop: 10, textTransform: 'uppercase',
        }}>— M.L. · BETA, Q1 '26</div>
      </div>

      <ASPageIndex n={5} total={6} color="rgba(239,233,218,0.4)" />
      <ASBrandFooter color="rgba(239,233,218,0.7)" />
    </ASPanel>
  );
}

// ══════════════════════════════════════════════════════════════
// AS-06 · CTA / CLOSER
// ══════════════════════════════════════════════════════════════
function AS_Closer() {
  const t = window.useTheme();
  return (
    <ASPanel label="as-06 · closer" bg={t.accent}>
      <ASKicker color={t.ink}>DOWNLOAD · iOS 17 +</ASKicker>
      <ASHeadline color={t.ink} size={100} lh={0.88} track={-5}>
        the system<br/>
        is yours.
      </ASHeadline>
      <ASSub color="rgba(10,10,10,0.7)">
        7-day trial. No card. Cancel in one tap. Your data never leaves device unless you say so.
      </ASSub>

      {/* Giant ECG */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 580 }}>
        <svg width={ASW} height={180} viewBox={`0 0 ${ASW} 180`}>
          <path d={`M 0 90 L 140 90 L 180 90 L 210 40 L 240 140 L 270 90 L 400 90 L 440 30 L 470 150 L 500 90 L ${ASW} 90`}
            fill="none" stroke={t.ink} strokeWidth="4" strokeLinecap="square"/>
        </svg>
      </div>

      {/* Badge row */}
      <div style={{
        position: 'absolute', left: 48, right: 48, bottom: 140,
      }}>
        <div style={{
          padding: '20px 24px', background: t.ink, color: t.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, letterSpacing: 2, opacity: 0.6 }}>AVAILABLE ON</div>
            <div style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 22, letterSpacing: -0.6, marginTop: 4 }}>app{'·'}store</div>
          </div>
          <div style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 32, letterSpacing: -1, color: t.accent }}>
            get it →
          </div>
        </div>
      </div>

      <ASPageIndex n={6} total={6} color="rgba(10,10,10,0.4)" />
      <ASBrandFooter color="rgba(10,10,10,0.75)" />
    </ASPanel>
  );
}

// ── tiny mono helper ──
function ASMono({ children, size = 11, color }) {
  return (
    <span style={{
      fontFamily: '"JetBrains Mono", monospace', fontSize: size, letterSpacing: 2,
      color, textTransform: 'uppercase',
    }}>{children}</span>
  );
}

function ASCallout({ children, x, y, rotate = 0 }) {
  const t = window.useTheme();
  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      background: t.bg, color: t.ink,
      padding: '12px 16px', border: `2px solid ${t.ink}`,
      transform: `rotate(${rotate}deg)`,
      boxShadow: `6px 6px 0 ${t.accent}`,
      maxWidth: 180,
    }}>{children}</div>
  );
}

// ── Phone content mocks (compressed / simplified for the screenshot role) ──
function ASMockToday() {
  const t = window.useTheme();
  return (
    <div style={{ width: '100%', height: '100%', background: t.bg, padding: '60px 20px 30px', color: t.ink, fontFamily: '-apple-system, "SF Pro Text", system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <HeartMark size={14} color={t.ink} accent={t.accent}/>
          <span style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 12, letterSpacing: -0.4 }}>atlas·core</span>
        </div>
        <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, letterSpacing: 2, opacity: 0.5 }}>FRI 18:00</span>
      </div>
      <div style={{ fontFamily: '-apple-system, system-ui', fontSize: 11, letterSpacing: 2, opacity: 0.55, textTransform: 'uppercase', fontWeight: 500 }}>READINESS</div>
      <div style={{ fontFamily: '-apple-system, system-ui', fontSize: 32, fontWeight: 700, letterSpacing: -0.8, marginTop: 4 }}>Today.</div>
      {/* ring */}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '22px 0' }}>
        <svg width={210} height={210}>
          <circle cx={105} cy={105} r={94} fill="none" stroke="rgba(10,10,10,0.12)" strokeWidth={14} />
          <circle cx={105} cy={105} r={94} fill="none" stroke={t.accent} strokeWidth={14}
            strokeDasharray={`${0.87 * 2*Math.PI*94} ${2*Math.PI*94}`}
            transform="rotate(-90 105 105)" strokeLinecap="butt" />
          <text x={105} y={102} textAnchor="middle" fontFamily="-apple-system, system-ui" fontSize={52} fontWeight={800} letterSpacing={-2} fill={t.ink}>87</text>
          <text x={105} y={128} textAnchor="middle" fontFamily='"JetBrains Mono", monospace' fontSize={10} letterSpacing={3} fill="rgba(10,10,10,0.5)">READY</text>
        </svg>
      </div>
      <div style={{ padding: 14, background: '#f4efde', marginBottom: 8 }}>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, letterSpacing: 2, opacity: 0.5 }}>TODAY · 18:00</div>
        <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.2, marginTop: 4 }}>Lower · 5×5</div>
      </div>
      <div style={{ padding: 14, background: t.accent, color: t.ink, display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, fontWeight: 700 }}>Morning brief</span>
        <span style={{ fontSize: 13, fontWeight: 700 }}>→</span>
      </div>
    </div>
  );
}

function ASMockWorkout() {
  const t = window.useTheme();
  return (
    <div style={{ width: '100%', height: '100%', background: t.ink, padding: '60px 20px 30px', color: t.bg, fontFamily: '-apple-system, system-ui' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontSize: 11, letterSpacing: 2, opacity: 0.55, textTransform: 'uppercase' }}>DEADLIFT</span>
        <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: t.accent }}>SET 5 / 5</span>
      </div>
      <div style={{ fontSize: 80, fontWeight: 800, letterSpacing: -3, lineHeight: 0.95 }}>420<span style={{ fontSize: 30, opacity: 0.6 }}> lb</span></div>
      <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12, letterSpacing: 2, color: t.accent, marginTop: 6 }}>× 5 · RPE 8.5</div>
      <div style={{ marginTop: 30, display: 'flex', gap: 4, alignItems: 'flex-end', height: 80 }}>
        {[40, 60, 70, 85, 100].map((h, i) => (
          <div key={i} style={{ flex: 1, height: `${h}%`, background: i === 4 ? t.accent : t.bg, opacity: i === 4 ? 1 : 0.55 }} />
        ))}
      </div>
      <div style={{ marginTop: 16, padding: 14, background: 'rgba(239,233,218,0.08)' }}>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, letterSpacing: 2, color: t.accent }}>AUTO-PR</div>
        <div style={{ fontSize: 15, fontWeight: 700, marginTop: 2 }}>New 5RM: 420 lb</div>
      </div>
      <div style={{ marginTop: 20, padding: '14px 16px', background: t.accent, color: t.ink, textAlign: 'center', fontSize: 15, fontWeight: 700 }}>
        Rest · 2:00
      </div>
    </div>
  );
}

function ASMockLabs() {
  const t = window.useTheme();
  return (
    <div style={{ width: '100%', height: '100%', background: t.bg, padding: '60px 20px 30px', color: t.ink, fontFamily: '-apple-system, system-ui' }}>
      <div style={{ fontSize: 11, letterSpacing: 2, opacity: 0.55, textTransform: 'uppercase', fontWeight: 500 }}>LABS</div>
      <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.8, marginTop: 4 }}>84 markers.</div>
      <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, letterSpacing: 2, opacity: 0.5, marginTop: 4 }}>Q1 2026 · 3 FLAGGED</div>

      <div style={{ marginTop: 18, padding: 14, background: '#f4efde' }}>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, letterSpacing: 2, opacity: 0.5 }}>APOB</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontSize: 32, fontWeight: 800, letterSpacing: -1 }}>72<span style={{ fontSize: 13, opacity: 0.55 }}> mg/dL</span></span>
          <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: t.accent, letterSpacing: 2 }}>OPTIMAL</span>
        </div>
        {/* mini trend */}
        <svg width="100%" height={38} style={{ marginTop: 8 }} viewBox="0 0 260 38" preserveAspectRatio="none">
          <path d="M 0 28 L 40 24 L 80 26 L 120 20 L 160 14 L 200 10 L 260 8" fill="none" stroke={t.ink} strokeWidth={2}/>
          <rect x={0} y={4} width={260} height={8} fill={t.accent} opacity={0.12}/>
        </svg>
      </div>
      {[
        ['FT', 'FREE TESTOSTERONE', '22 pg/mL', 'ELEVATED'],
        ['HS-CRP', 'INFLAMMATION', '0.3', 'OPTIMAL'],
        ['HBA1C', 'GLYCEMIC', '5.1%', 'OPTIMAL'],
        ['VIT D', '25-OH', '54 ng/mL', 'OPTIMAL'],
      ].map(([k, n, v, s], i) => (
        <div key={k} style={{
          marginTop: 8, padding: '12px 14px', background: '#f4efde',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, letterSpacing: 2, color: s === 'ELEVATED' ? t.accent : 'rgba(10,10,10,0.5)' }}>{k}</div>
            <div style={{ fontSize: 12, fontWeight: 600, marginTop: 2 }}>{n}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 13, fontWeight: 700 }}>{v}</div>
            <div style={{ fontSize: 9, letterSpacing: 2, color: s === 'ELEVATED' ? t.accent : 'rgba(10,10,10,0.45)' }}>{s}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ASMockBrief() {
  const t = window.useTheme();
  return (
    <div style={{ width: '100%', height: '100%', background: t.bg, padding: '60px 20px 30px', color: t.ink, fontFamily: '-apple-system, system-ui' }}>
      <div style={{ fontSize: 11, letterSpacing: 3, opacity: 0.55, textTransform: 'uppercase' }}>MORNING · BRIEF</div>
      <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.8, marginTop: 6 }}>Friday.<br/>You're a go.</div>
      {/* coach bubble */}
      <div style={{ marginTop: 22, padding: 16, background: t.ink, color: t.bg }}>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 2, color: t.accent }}>COACH</div>
        <div style={{ fontSize: 13, lineHeight: 1.5, marginTop: 6 }}>
          HRV is 54 (+8 vs baseline). Lift heavy today — pull pattern or squat. Keep protein ≥ 180g.
        </div>
      </div>
      {/* 3-move card */}
      <div style={{ marginTop: 14 }}>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 2, opacity: 0.55 }}>TODAY · 3 MOVES</div>
        {[
          ['TRAIN', '5×5 lower · DL focus', t.accent],
          ['EAT',   '2 600 kcal · 180p/80f/280c', t.ink],
          ['REST',  'In bed by 22:30', t.ink],
        ].map(([k, v, col], i) => (
          <div key={k} style={{ padding: '12px 0', borderBottom: '1px solid rgba(10,10,10,0.08)', display: 'flex', gap: 10 }}>
            <div style={{ width: 6, height: 6, marginTop: 5, background: col }} />
            <div>
              <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, letterSpacing: 2, color: col }}>{k}</div>
              <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{v}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── layout rules card (shown alongside as a reference) ──────────────
function AS_LayoutRules() {
  const t = window.useTheme();
  return (
    <DCArtboard label="as-ruleset · anatomy" width={ASW} height={ASH} style={{ background: t.bg, borderRadius: 0 }}>
      <div style={{ width: '100%', height: '100%', color: t.ink, padding: '56px 48px', fontFamily: '-apple-system, system-ui', position: 'relative' }}>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12, letterSpacing: 3, color: t.accent }}>TEMPLATE · RULES</div>
        <div style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 56, lineHeight: 0.95, letterSpacing: -2.5, marginTop: 14 }}>
          anatomy<br/>of a screenshot.
        </div>
        <div style={{ marginTop: 28, fontSize: 14, lineHeight: 1.55, color: 'rgba(10,10,10,0.75)', maxWidth: 500 }}>
          Six slots. One grid. One type pair. Every artboard below obeys the same rules so a cheaper model can spin variants without breaking the system.
        </div>

        <div style={{ marginTop: 32, borderTop: `1px solid rgba(10,10,10,0.2)`, paddingTop: 20 }}>
          {[
            ['A', 'KICKER',     '"JetBrains Mono" 14 / 4pt track / uppercase / accent'],
            ['B', 'HEADLINE',   '"Archivo Black" 72–100 / lh 0.88–0.94 / lowercase'],
            ['C', 'SUBHEAD',    'SF Pro Text 20–24 / lh 1.35 / 60–70% fg / max-width 480'],
            ['D', 'MOCKUP',     'Phone frame · tilt ±2–3° · scale 0.88–0.95 · cropped bottom'],
            ['E', 'CALLOUT',    'Paper bg / ink border 2px / 6px accent drop · optional'],
            ['F', 'FOOTER',     'Heart mark + atlas·core wordmark · index NN/06'],
          ].map(([k, l, r]) => (
            <div key={k} style={{ display: 'flex', gap: 14, padding: '12px 0', borderBottom: '1px solid rgba(10,10,10,0.08)' }}>
              <div style={{ width: 28, height: 28, background: t.ink, color: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Archivo Black", sans-serif', fontSize: 14 }}>{k}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 2, color: t.accent }}>{l}</div>
                <div style={{ fontSize: 12, color: 'rgba(10,10,10,0.75)', marginTop: 2 }}>{r}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ position: 'absolute', left: 48, right: 48, bottom: 48 }}>
          <div style={{ padding: '14px 16px', background: t.ink, color: t.bg }}>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 2, color: t.accent }}>EXPORT</div>
            <div style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 20, letterSpacing: -0.5, marginTop: 4 }}>
              2× → 1290 × 2796
            </div>
            <div style={{ fontSize: 11, opacity: 0.65, marginTop: 4 }}>6.7" iPhone. Multiply up for iPad (2064 × 2752).</div>
          </div>
        </div>
      </div>
    </DCArtboard>
  );
}

Object.assign(window, {
  AS_Cover, AS_Feature_Workout, AS_Feature_Labs, AS_Feature_Coach,
  AS_Credibility, AS_Closer, AS_LayoutRules,
});
