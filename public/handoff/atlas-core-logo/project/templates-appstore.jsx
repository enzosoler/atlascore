// templates-appstore.jsx — atlas.core master template pack · part 1 of 3
// ════════════════════════════════════════════════════════════════════
// APP STORE SCREENSHOTS — v2 (denser, layered, not "too simple")
//
// Philosophy shift: app-store screenshots are ads, not dashboards.
// Each one should feel LOUD — overlapping numerical decor, stacked
// mockup layers, diagonal ECG bleed, edge-bleeding type, receipts,
// grids behind, stamps, torn-label badges, multi-device stacks.
//
// Target (Apple 6.7"): 1290 × 2796 → we design at half scale 645×1398.
// ════════════════════════════════════════════════════════════════════

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
        {/* faint grid backdrop — just 2% opacity; adds texture without noise */}
        <div aria-hidden style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: `linear-gradient(to right, ${fg} 1px, transparent 1px),
                            linear-gradient(to bottom, ${fg} 1px, transparent 1px)`,
          backgroundSize: '32px 32px', opacity: 0.035,
        }}/>
        {children}
      </div>
    </DCArtboard>
  );
}

function ASHeadline({ children, color, size = 72, lh = 0.94, track = -3, style }) {
  return (
    <div style={{
      fontFamily: '"Archivo Black", "Arial Black", sans-serif',
      fontSize: size, lineHeight: lh, letterSpacing: track, color,
      textTransform: 'lowercase', ...style,
    }}>{children}</div>
  );
}

function ASKicker({ children, color, dot = true }) {
  return (
    <div style={{
      fontFamily: '"JetBrains Mono", monospace', fontSize: 13, letterSpacing: 3.5,
      textTransform: 'uppercase', color, fontWeight: 600,
      display: 'inline-flex', alignItems: 'center', gap: 8,
    }}>
      {dot && <span style={{ width: 7, height: 7, background: 'currentColor' }} />}
      {children}
    </div>
  );
}

function ASSub({ children, color, size = 20, maxWidth = 460, style }) {
  return (
    <div style={{
      fontFamily: '-apple-system, "SF Pro Text", system-ui, sans-serif',
      fontSize: size, lineHeight: 1.38, color, fontWeight: 500, maxWidth, ...style,
    }}>{children}</div>
  );
}

function ASPageIndex({ n, total, color }) {
  return (
    <div style={{
      position: 'absolute', left: 48, bottom: 36,
      fontFamily: '"JetBrains Mono", monospace', fontSize: 11, letterSpacing: 3, color, opacity: 0.6,
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

// Phone silhouette.
function ASPhone({ children, tilt = 0, y = 420, x = '50%', scale = 0.95, showDevice = true, style }) {
  const t = window.useTheme();
  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      transform: `translateX(-50%) rotate(${tilt}deg) scale(${scale})`,
      transformOrigin: 'top center', ...style,
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

// ── decorative atoms (new) ──────────────────────────────────────────
function ASNumDecor({ n, color, size = 300, x, y, rotate = 0, opacity = 0.08, style }) {
  return (
    <div aria-hidden style={{
      position: 'absolute', left: x, top: y,
      fontFamily: '"Archivo Black", sans-serif', fontSize: size,
      letterSpacing: -size * 0.05, lineHeight: 0.85,
      color, opacity, pointerEvents: 'none',
      transform: `rotate(${rotate}deg)`, userSelect: 'none',
      ...style,
    }}>{n}</div>
  );
}

function ASRuler({ color, orientation = 'h', length = 300, x, y, ticks = 10 }) {
  const h = orientation === 'h';
  return (
    <div aria-hidden style={{
      position: 'absolute', left: x, top: y,
      width: h ? length : 1, height: h ? 1 : length,
      background: color,
    }}>
      {Array.from({ length: ticks + 1 }).map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: h ? `${(i / ticks) * 100}%` : 0,
          top:  h ? 0 : `${(i / ticks) * 100}%`,
          width:  h ? 1 : (i % 5 === 0 ? 8 : 4),
          height: h ? (i % 5 === 0 ? 8 : 4) : 1,
          background: color,
        }}/>
      ))}
    </div>
  );
}

function ASStamp({ children, color, rotate = -12, x, y }) {
  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      transform: `rotate(${rotate}deg)`,
      border: `2px solid ${color}`, padding: '6px 12px',
      fontFamily: '"JetBrains Mono", monospace', fontSize: 11, letterSpacing: 2.5,
      textTransform: 'uppercase', color, fontWeight: 700,
    }}>{children}</div>
  );
}

// ══════════════════════════════════════════════════════════════
// AS-01 · COVER / OPENER — hero, LOUDER
// Change log: added oversize bleeding "01" numeral, stacked mini-phone
// behind the hero phone, receipts column on right, diagonal ECG
// bleeding to the edge, corner meta-stamp, stat row under head.
// ══════════════════════════════════════════════════════════════
function AS_Cover() {
  const t = window.useTheme();
  return (
    <ASPanel label="as-01 · cover (hero)" ink={true}>
      {/* oversize "01" bleed */}
      <ASNumDecor n="01" color={t.bg} size={380} x={-40} y={-40} opacity={0.05}/>

      {/* corner stamp */}
      <div style={{ position: 'absolute', right: 48, top: 56, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
        <ASStamp color={t.accent} rotate={6} x={undefined} y={undefined}>v.2026.1</ASStamp>
        <div style={{ fontFamily:'"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 2, color: 'rgba(239,233,218,0.45)', textAlign: 'right' }}>
          iPhone · iPad<br/>iOS 17 +
        </div>
      </div>

      <ASKicker color={t.accent}>ATLAS.CORE · HEALTH OS</ASKicker>

      <ASHeadline color={t.bg} size={92} lh={0.88} track={-4.5} style={{ marginTop: 16 }}>
        your body,<br/>
        <span style={{ color: t.accent }}>in one</span><br/>
        system.
      </ASHeadline>

      {/* stat row under head */}
      <div style={{ marginTop: 26, display: 'flex', gap: 22, alignItems: 'flex-start' }}>
        {[
          ['42', 'screens'],
          ['84', 'markers'],
          ['∞', 'protocols'],
        ].map(([n, l]) => (
          <div key={l}>
            <div style={{ fontFamily:'"Archivo Black",sans-serif', fontSize: 34, letterSpacing: -1.2, lineHeight: 0.9, color: t.bg }}>{n}</div>
            <div style={{ fontFamily:'"JetBrains Mono",monospace', fontSize: 10, letterSpacing: 2, color: 'rgba(239,233,218,0.55)', marginTop: 4, textTransform: 'uppercase' }}>{l}</div>
          </div>
        ))}
        <div style={{ flex: 1 }}/>
        <ASSub color="rgba(239,233,218,0.7)" size={14} maxWidth={180} style={{ marginTop: 4 }}>
          Training, nutrition, labs, sleep, protocols — one OS for everything you're optimizing.
        </ASSub>
      </div>

      {/* diagonal ECG bleed, top-right to phone */}
      <svg aria-hidden style={{ position:'absolute', left: -40, top: 500, width: ASW + 80, height: 60, opacity: 0.9 }} viewBox="0 0 720 60" preserveAspectRatio="none">
        <path d="M 0 30 L 160 30 L 200 30 L 230 10 L 260 50 L 290 30 L 460 30 L 500 6 L 530 54 L 560 30 L 720 30"
          fill="none" stroke={t.accent} strokeWidth="2.5" strokeLinecap="square"/>
      </svg>

      {/* mini phone behind-left (peek) */}
      <ASPhone y={720} x={'22%'} tilt={-8} scale={0.55} showDevice={true}>
        <ASMockBriefMini/>
      </ASPhone>

      {/* main hero phone */}
      <ASPhone y={560} tilt={-2} scale={0.86}>
        <ASMockToday />
      </ASPhone>

      {/* receipts column right */}
      <div style={{ position: 'absolute', right: 40, top: 700, width: 160, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          ['HRV', '58', '+4'],
          ['SLEEP', '7:42', 'REM 1:48'],
          ['LOAD', '8.4', 'DL 420'],
        ].map(([k, v, s]) => (
          <div key={k} style={{
            background: 'rgba(239,233,218,0.06)', borderLeft: `2px solid ${t.accent}`,
            padding: '10px 12px',
          }}>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, letterSpacing: 2, color: t.accent }}>{k}</div>
            <div style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 22, letterSpacing: -0.8, color: t.bg, marginTop: 2 }}>{v}</div>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, letterSpacing: 1.5, color: 'rgba(239,233,218,0.5)', marginTop: 2 }}>{s}</div>
          </div>
        ))}
      </div>

      {/* bottom tagline strip */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 72,
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 48px', background: t.accent, color: t.ink,
        fontFamily: '"JetBrains Mono", monospace', fontSize: 11, letterSpacing: 3, textTransform: 'uppercase',
      }}>
        <span style={{ fontWeight: 700 }}>→</span>
        <span style={{ fontWeight: 700 }}>measure everything.</span>
        <span style={{ opacity: 0.55 }}>—</span>
        <span style={{ fontWeight: 700 }}>act on signal.</span>
        <span style={{ opacity: 0.55 }}>—</span>
        <span style={{ fontWeight: 700 }}>not streaks.</span>
      </div>

      <ASPageIndex n={1} total={6} color="rgba(239,233,218,0.5)" />
      <ASBrandFooter color="rgba(239,233,218,0.75)" />
    </ASPanel>
  );
}

// ══════════════════════════════════════════════════════════════
// AS-02 · FEATURE · WORKOUT — editorial receipt energy
// Changes: split-screen composition, real training data table, torn
// receipt log, "PR" stamp, density vs AS-01's airiness.
// ══════════════════════════════════════════════════════════════
function AS_Feature_Workout() {
  const t = window.useTheme();
  return (
    <ASPanel label="as-02 · feature · workout" ink={false}>
      <ASNumDecor n="02" color={t.ink} size={340} x={ASW - 240} y={-30} opacity={0.06} rotate={0}/>

      <ASKicker color={t.ink}>TRAIN · LOG · ANALYZE</ASKicker>

      <ASHeadline color={t.ink} size={80} lh={0.9} track={-3.8} style={{ marginTop: 16 }}>
        every rep,<br/>
        <span style={{ background: t.ink, color: t.bg, padding: '2px 10px', boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone' }}>logged.</span>
      </ASHeadline>

      <ASSub color="rgba(10,10,10,0.72)" style={{ marginTop: 18 }}>
        RPE-aware set logging. Auto-detected PRs. 18-month strength curves. Built for people who actually track.
      </ASSub>

      {/* strength curve chart */}
      <div style={{ marginTop: 28, padding: '14px 16px', background: '#ebe4cd', borderLeft: `4px solid ${t.ink}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 2, color: 'rgba(10,10,10,0.55)' }}>DEADLIFT · 5RM</div>
            <div style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 30, letterSpacing: -1, marginTop: 2 }}>420 lb</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 2, color: t.accent, fontWeight: 700 }}>+38 LB · 18 MO</div>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 2, color: 'rgba(10,10,10,0.5)' }}>RPE 8.5</div>
          </div>
        </div>
        <svg width="100%" height={70} viewBox="0 0 400 70" preserveAspectRatio="none" style={{ marginTop: 10 }}>
          <rect x={0} y={10} width={400} height={50} fill="rgba(10,10,10,0.05)"/>
          <path d="M 0 56 L 40 52 L 80 48 L 120 50 L 160 40 L 200 36 L 240 30 L 280 26 L 320 22 L 360 18 L 400 12"
            fill="none" stroke={t.ink} strokeWidth={2.5}/>
          <circle cx={400} cy={12} r={5} fill={t.accent} stroke={t.ink} strokeWidth={2}/>
        </svg>
      </div>

      {/* hero phone left-tilt */}
      <ASPhone y={690} x="38%" tilt={-3} scale={0.82}>
        <ASMockWorkout/>
      </ASPhone>

      {/* PR stamp */}
      <ASStamp color={t.accent} rotate={-10} x={200} y={660}>NEW 5RM · AUTO PR</ASStamp>

      {/* right-side set-receipt */}
      <div style={{
        position: 'absolute', right: 36, top: 700, width: 200,
        background: t.bg, border: `1px solid rgba(10,10,10,0.15)`,
        padding: '12px 14px', fontFamily: '"JetBrains Mono", monospace', fontSize: 11, letterSpacing: 1.4,
        boxShadow: `8px 8px 0 ${t.ink}`,
      }}>
        <div style={{ fontSize: 9, letterSpacing: 2, color: t.accent, fontWeight: 700, textTransform: 'uppercase' }}>session · 18:02</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: t.ink, marginTop: 4, fontFamily:'"Archivo Black",sans-serif', letterSpacing: -0.3 }}>deadlift 5×5</div>
        <div style={{ height: 1, background: 'rgba(10,10,10,0.12)', margin: '10px 0' }}/>
        {[
          ['01', '335 · 5', 'RPE 6'],
          ['02', '355 · 5', 'RPE 7'],
          ['03', '385 · 5', 'RPE 8'],
          ['04', '405 · 5', 'RPE 8.5'],
          ['05', '420 · 5', 'RPE 9 ★'],
        ].map(([i, w, r]) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: r.includes('★') ? t.accent : 'rgba(10,10,10,0.75)', fontWeight: r.includes('★') ? 700 : 400 }}>
            <span style={{ opacity: 0.5 }}>{i}</span>
            <span>{w}</span>
            <span>{r}</span>
          </div>
        ))}
        <div style={{ height: 1, background: 'rgba(10,10,10,0.12)', margin: '10px 0' }}/>
        <div style={{ fontSize: 9, letterSpacing: 2, color: 'rgba(10,10,10,0.5)', textTransform: 'uppercase' }}>tonnage · 9,600 lb</div>
      </div>

      <ASPageIndex n={2} total={6} color="rgba(10,10,10,0.5)" />
      <ASBrandFooter color="rgba(10,10,10,0.75)" />
    </ASPanel>
  );
}

// ══════════════════════════════════════════════════════════════
// AS-03 · FEATURE · LABS — data maximalism
// Changes: marker wall (9-up grid), flagged-marker callout, time-series
// strip across mid, 3D-look panel overlap.
// ══════════════════════════════════════════════════════════════
function AS_Feature_Labs() {
  const t = window.useTheme();
  const markers = [
    ['APOB', '72', 'OPT'], ['HS-CRP', '0.3', 'OPT'], ['FT', '22', 'ELEV'],
    ['HBA1C', '5.1', 'OPT'], ['ALT', '18', 'OPT'], ['TSH', '1.8', 'OPT'],
    ['FERR', '94', 'OPT'], ['VIT D', '54', 'OPT'], ['E2', '34', 'WATCH'],
  ];
  return (
    <ASPanel label="as-03 · feature · labs" ink={true}>
      <ASNumDecor n="03" color={t.bg} size={340} x={-30} y={-50} opacity={0.04}/>

      <ASKicker color={t.accent}>LABS · PANELS · TRENDS</ASKicker>

      <ASHeadline color={t.bg} size={82} lh={0.9} track={-4} style={{ marginTop: 16 }}>
        <span style={{ fontFamily:'"JetBrains Mono",monospace', fontSize: 68, letterSpacing: -2, color: t.accent }}>84</span> markers.<br/>
        <span style={{ color: t.accent }}>one</span> dashboard.
      </ASHeadline>

      <ASSub color="rgba(239,233,218,0.7)" style={{ marginTop: 18 }}>
        Blood · metabolic · hormones. Trended over years, flagged against <em style={{ fontStyle:'italic', color: t.accent, fontWeight: 600 }}>optimal</em> — not just "normal."
      </ASSub>

      {/* time-series strip */}
      <div style={{ marginTop: 28, padding: '14px 16px', background: 'rgba(239,233,218,0.05)', borderTop: `1px solid rgba(239,233,218,0.18)`, borderBottom: `1px solid rgba(239,233,218,0.18)` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ fontFamily:'"JetBrains Mono",monospace', fontSize: 10, letterSpacing: 2, color: t.accent }}>APOB · 24 MO</div>
          <div style={{ fontFamily:'"JetBrains Mono",monospace', fontSize: 10, letterSpacing: 2, color: 'rgba(239,233,218,0.55)' }}>-34% · OPTIMAL RANGE</div>
        </div>
        <svg width="100%" height={56} viewBox="0 0 540 56" preserveAspectRatio="none" style={{ marginTop: 6 }}>
          <rect x={0} y={8} width={540} height={10} fill={t.accent} opacity={0.15}/>
          <line x1={0} y1={13} x2={540} y2={13} stroke={t.accent} strokeDasharray="4 4" strokeWidth={1} opacity={0.4}/>
          <path d="M 0 44 L 60 40 L 120 42 L 180 34 L 240 30 L 300 22 L 360 18 L 420 16 L 480 12 L 540 10"
            fill="none" stroke={t.bg} strokeWidth={2.5}/>
          {[0, 60, 120, 180, 240, 300, 360, 420, 480, 540].map((x, i) => (
            <circle key={i} cx={x} cy={[44,40,42,34,30,22,18,16,12,10][i]} r={2.5} fill={i === 9 ? t.accent : t.bg}/>
          ))}
        </svg>
      </div>

      {/* marker wall 3×3 */}
      <div style={{
        position: 'absolute', left: 48, top: 560, right: 260,
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6,
      }}>
        {markers.map(([k, v, s], i) => {
          const flagged = s !== 'OPT';
          return (
            <div key={k} style={{
              padding: '10px 12px',
              background: flagged ? t.accent : 'rgba(239,233,218,0.06)',
              color: flagged ? t.ink : t.bg,
              borderLeft: flagged ? 'none' : `2px solid rgba(239,233,218,0.3)`,
            }}>
              <div style={{ fontFamily:'"JetBrains Mono",monospace', fontSize: 9, letterSpacing: 1.5, opacity: 0.7, fontWeight: 700 }}>{k}</div>
              <div style={{ fontFamily:'"Archivo Black",sans-serif', fontSize: 22, letterSpacing: -0.8, lineHeight: 1, marginTop: 2 }}>{v}</div>
              <div style={{ fontFamily:'"JetBrains Mono",monospace', fontSize: 8, letterSpacing: 1.5, opacity: flagged ? 0.85 : 0.5, marginTop: 2 }}>{s}</div>
            </div>
          );
        })}
      </div>

      {/* hero phone right */}
      <ASPhone y={680} x="75%" tilt={3} scale={0.72}>
        <ASMockLabs/>
      </ASPhone>

      {/* flagged callout */}
      <div style={{
        position: 'absolute', left: 48, bottom: 120, right: 260,
        padding: '14px 16px', background: t.bg, color: t.ink,
        boxShadow: `6px 6px 0 ${t.accent}`,
      }}>
        <div style={{ fontFamily:'"JetBrains Mono",monospace', fontSize: 10, letterSpacing: 2, color: t.accent, fontWeight: 700 }}>FLAGGED · 2 OF 84</div>
        <div style={{ fontSize: 13, lineHeight: 1.45, marginTop: 6, color: 'rgba(10,10,10,0.85)' }}>
          Free T elevated vs. your 12-mo baseline. E2 trending up — watch next panel. No alarms. Just context.
        </div>
      </div>

      <ASPageIndex n={3} total={6} color="rgba(239,233,218,0.5)" />
      <ASBrandFooter color="rgba(239,233,218,0.75)" />
    </ASPanel>
  );
}

// ══════════════════════════════════════════════════════════════
// AS-04 · FEATURE · COACH — conversational, layered
// Changes: chat-thread backdrop behind phone, coach signature stamp,
// 3 signal receipts, "one move" highlighted card outside phone.
// ══════════════════════════════════════════════════════════════
function AS_Feature_Coach() {
  const t = window.useTheme();
  return (
    <ASPanel label="as-04 · feature · coach" ink={false}>
      <ASNumDecor n="04" color={t.ink} size={320} x={ASW - 210} y={-20} opacity={0.05}/>

      <ASKicker color={t.ink}>COACH · AI · CONTEXTUAL</ASKicker>

      <ASHeadline color={t.ink} size={80} lh={0.9} track={-3.8} style={{ marginTop: 16 }}>
        an AI that<br/>
        <span style={{ background: t.accent, color: t.ink, padding: '2px 10px', boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone' }}>reads your data.</span>
      </ASHeadline>

      <ASSub color="rgba(10,10,10,0.72)" style={{ marginTop: 18 }}>
        Every morning — readiness, priorities, one move. No streaks. No guilt. Just signal, translated.
      </ASSub>

      {/* chat thread backdrop */}
      <div style={{ position: 'absolute', left: 48, top: 500, right: 260, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ alignSelf: 'flex-start', padding: '10px 14px', background: t.ink, color: t.bg, maxWidth: 240, fontSize: 12.5, lineHeight: 1.45 }}>
          <div style={{ fontFamily:'"JetBrains Mono",monospace', fontSize: 9, letterSpacing: 1.8, color: t.accent, marginBottom: 4 }}>COACH · 06:42</div>
          HRV 58 (+8 vs baseline). Sleep solid. You're a go for heavy pulls today.
        </div>
        <div style={{ alignSelf: 'flex-end', padding: '10px 14px', background: '#ebe4cd', color: t.ink, maxWidth: 200, fontSize: 12.5, lineHeight: 1.45 }}>
          <div style={{ fontFamily:'"JetBrains Mono",monospace', fontSize: 9, letterSpacing: 1.8, color: 'rgba(10,10,10,0.45)', marginBottom: 4 }}>YOU · 06:58</div>
          5RM target today?
        </div>
        <div style={{ alignSelf: 'flex-start', padding: '10px 14px', background: t.ink, color: t.bg, maxWidth: 240, fontSize: 12.5, lineHeight: 1.45 }}>
          <div style={{ fontFamily:'"JetBrains Mono",monospace', fontSize: 9, letterSpacing: 1.8, color: t.accent, marginBottom: 4 }}>COACH · 06:59</div>
          420. Your 405 last week was RPE 8. Room for one more plate.
        </div>
      </div>

      {/* one-move callout — huge */}
      <div style={{
        position: 'absolute', left: 48, bottom: 240, right: 260,
        padding: '16px 18px', background: t.accent, color: t.ink,
        borderLeft: `8px solid ${t.ink}`,
      }}>
        <div style={{ fontFamily:'"JetBrains Mono",monospace', fontSize: 10, letterSpacing: 2, fontWeight: 700 }}>TODAY · ONE MOVE</div>
        <div style={{ fontFamily:'"Archivo Black",sans-serif', fontSize: 28, letterSpacing: -1, marginTop: 4, lineHeight: 0.95 }}>
          Deadlift 5×5 @ 420 lb. Stop at RPE 8.5.
        </div>
      </div>

      {/* hero phone right */}
      <ASPhone y={620} x="76%" tilt={-2} scale={0.72}>
        <ASMockBrief/>
      </ASPhone>

      {/* signature stamp */}
      <ASStamp color={t.ink} rotate={-6} x={58} y={ASH - 240}>no streaks · no guilt</ASStamp>

      <ASPageIndex n={4} total={6} color="rgba(10,10,10,0.5)" />
      <ASBrandFooter color="rgba(10,10,10,0.75)" />
    </ASPanel>
  );
}

// ══════════════════════════════════════════════════════════════
// AS-05 · CREDIBILITY — dense stat atlas + testimonial stack
// Changes: 4×2 stat grid, secondary data columns, multi-testimonial,
// "built by operators" signature block.
// ══════════════════════════════════════════════════════════════
function AS_Credibility() {
  const t = window.useTheme();
  const stats = [
    ['42',  'SCREENS',        t.accent, 'designed for depth'],
    ['84',  'BIOMARKERS',     t.bg,     'panel + trend lines'],
    ['0',   'STREAK DEBT',    t.accent, 'no guilt mechanics'],
    ['∞',   'PROTOCOLS',      t.bg,     'peptides · stacks'],
    ['18',  'MONTHS',         t.bg,     'strength curves kept'],
    ['12',  'INTEGRATIONS',   t.bg,     'whoop · oura · dexa'],
    ['1 s', 'SET LOG',        t.accent, 'tap · done'],
    ['ε',   'SUBSCRIPTION',   t.bg,     'pay once for v.1'],
  ];
  return (
    <ASPanel label="as-05 · credibility" ink={true}>
      <ASNumDecor n="05" color={t.bg} size={340} x={-20} y={ASH - 340} opacity={0.04}/>

      <ASKicker color={t.accent}>BUILT FOR OPERATORS</ASKicker>

      <ASHeadline color={t.bg} size={76} lh={0.92} track={-3.5} style={{ marginTop: 16 }}>
        data you can<br/>
        actually <span style={{ color: t.accent }}>act on.</span>
      </ASHeadline>

      <ASSub color="rgba(239,233,218,0.65)" style={{ marginTop: 16 }}>
        Shipped by people who log their own lifts, track their own labs, and refuse to wear a smart ring that yells at them.
      </ASSub>

      {/* 4×2 stat grid */}
      <div style={{
        marginTop: 32,
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        columnGap: 14, rowGap: 22,
      }}>
        {stats.map(([n, l, col, sub]) => (
          <div key={l} style={{ borderTop: `1px solid rgba(239,233,218,0.2)`, paddingTop: 10 }}>
            <div style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 44, lineHeight: 0.92, letterSpacing: -2, color: col }}>{n}</div>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 1.8, color: 'rgba(239,233,218,0.7)', marginTop: 6, textTransform: 'uppercase', fontWeight: 700 }}>{l}</div>
            <div style={{ fontSize: 11, color: 'rgba(239,233,218,0.45)', marginTop: 2 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* testimonial stack */}
      <div style={{ position: 'absolute', left: 48, right: 48, bottom: 200, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          ['"The first health app that respects how much data I actually have."', 'M.L. · BETA, Q1 ‘26 · QUANT @ 2-SIGMA'],
          ['"I stopped checking five different apps. It\'s just atlas now."', 'J.K. · BETA, Q4 ‘25 · PM @ STRIPE'],
        ].map(([q, who], i) => (
          <div key={i} style={{
            padding: '14px 18px',
            borderLeft: `3px solid ${i === 0 ? t.accent : 'rgba(239,233,218,0.3)'}`,
            background: i === 0 ? 'rgba(239,233,218,0.04)' : 'transparent',
          }}>
            <div style={{ fontFamily: '-apple-system, system-ui', fontSize: 15, lineHeight: 1.45, color: t.bg, fontStyle: 'italic' }}>
              {q}
            </div>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 1.8, color: 'rgba(239,233,218,0.55)', marginTop: 8 }}>{who}</div>
          </div>
        ))}
      </div>

      {/* built-by signature */}
      <div style={{ position: 'absolute', right: 48, bottom: 120, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 34, height: 34, background: t.accent, display: 'grid', placeItems: 'center', color: t.ink, fontFamily:'"Archivo Black",sans-serif', fontSize: 16 }}>A</div>
        <div>
          <div style={{ fontFamily:'"JetBrains Mono",monospace', fontSize: 10, letterSpacing: 2, color: 'rgba(239,233,218,0.5)' }}>BUILT IN AUSTIN, TX</div>
          <div style={{ fontFamily:'"Archivo Black",sans-serif', fontSize: 13, letterSpacing: -0.3, color: t.bg, marginTop: 2 }}>team of 6. no SDR. no BDR.</div>
        </div>
      </div>

      <ASPageIndex n={5} total={6} color="rgba(239,233,218,0.5)" />
      <ASBrandFooter color="rgba(239,233,218,0.75)" />
    </ASPanel>
  );
}

// ══════════════════════════════════════════════════════════════
// AS-06 · CLOSER — massive typographic, pricing panel, QR, badges
// Changes: huge edge-bleed head, structured pricing block, QR block,
// trust-signals row.
// ══════════════════════════════════════════════════════════════
function AS_Closer() {
  const t = window.useTheme();
  return (
    <ASPanel label="as-06 · closer" bg={t.accent}>
      <ASNumDecor n="06" color={t.ink} size={400} x={ASW - 280} y={-60} opacity={0.08}/>

      <ASKicker color={t.ink}>DOWNLOAD · iOS 17 +</ASKicker>

      <ASHeadline color={t.ink} size={108} lh={0.86} track={-5.5} style={{ marginTop: 14 }}>
        the system<br/>
        is <span style={{ WebkitTextStroke: `2px ${t.ink}`, color: 'transparent' }}>yours.</span>
      </ASHeadline>

      <ASSub color="rgba(10,10,10,0.72)" style={{ marginTop: 16 }}>
        7-day trial. No card. Cancel in one tap. Your data never leaves device unless you say so.
      </ASSub>

      {/* giant ECG */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 580 }}>
        <svg width={ASW} height={140} viewBox={`0 0 ${ASW} 140`}>
          <path d={`M 0 70 L 140 70 L 180 70 L 210 30 L 240 110 L 270 70 L 400 70 L 440 20 L 470 120 L 500 70 L ${ASW} 70`}
            fill="none" stroke={t.ink} strokeWidth="4" strokeLinecap="square"/>
        </svg>
      </div>

      {/* pricing card */}
      <div style={{
        position: 'absolute', left: 48, top: 760, right: 280,
        background: t.ink, color: t.bg, padding: '20px 22px',
        boxShadow: `10px 10px 0 rgba(10,10,10,0.18)`,
      }}>
        <div style={{ fontFamily:'"JetBrains Mono",monospace', fontSize: 10, letterSpacing: 2, color: t.accent, fontWeight: 700 }}>FOUNDERS · 1,000 SEATS</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 6 }}>
          <div style={{ fontFamily:'"Archivo Black",sans-serif', fontSize: 56, letterSpacing: -2, lineHeight: 0.9 }}>$8</div>
          <div style={{ fontFamily:'"JetBrains Mono",monospace', fontSize: 11, letterSpacing: 2, opacity: 0.6 }}>/ MONTH</div>
          <div style={{ marginLeft: 'auto', fontFamily: '-apple-system, system-ui', fontSize: 11, textDecoration: 'line-through', opacity: 0.55 }}>$16</div>
        </div>
        <div style={{ height: 1, background: 'rgba(239,233,218,0.15)', margin: '14px 0 10px' }}/>
        {[
          'all 84 biomarkers',
          'unlimited protocols + stacks',
          'locked-in rate for life',
        ].map(l => (
          <div key={l} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '3px 0', fontSize: 12 }}>
            <span style={{ color: t.accent, fontFamily:'"Archivo Black",sans-serif' }}>✓</span>
            <span style={{ color: 'rgba(239,233,218,0.85)' }}>{l}</span>
          </div>
        ))}
      </div>

      {/* QR + badge tower right */}
      <div style={{ position: 'absolute', right: 48, top: 760, width: 200, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ background: t.ink, padding: 14, color: t.bg }}>
          {/* fake QR grid */}
          <div style={{
            width: '100%', aspectRatio: '1/1',
            backgroundImage: `radial-gradient(${t.bg} 38%, transparent 42%)`,
            backgroundSize: '10px 10px', backgroundColor: t.ink,
            border: `1px solid rgba(239,233,218,0.3)`,
          }}/>
          <div style={{ fontFamily:'"JetBrains Mono",monospace', fontSize: 9, letterSpacing: 2, color: t.accent, marginTop: 8, textAlign:'center' }}>SCAN → INSTALL</div>
        </div>
        <div style={{ background: t.ink, padding: '10px 14px' }}>
          <div style={{ fontFamily:'"JetBrains Mono",monospace', fontSize: 10, letterSpacing: 2, color: 'rgba(239,233,218,0.55)' }}>AVAILABLE ON</div>
          <div style={{ fontFamily:'"Archivo Black",sans-serif', fontSize: 18, letterSpacing: -0.5, marginTop: 2, color: t.bg }}>app · store</div>
        </div>
      </div>

      {/* trust row */}
      <div style={{
        position: 'absolute', left: 48, right: 48, bottom: 120,
        display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap',
      }}>
        {[
          'on-device AI',
          'HIPAA-aware',
          'HealthKit · Whoop · Oura',
          'export your data anytime',
        ].map((x, i) => (
          <div key={x} style={{
            fontFamily:'"JetBrains Mono",monospace', fontSize: 10, letterSpacing: 2,
            color: t.ink, textTransform: 'uppercase', fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{ width: 6, height: 6, background: t.ink }}/>
            {x}
          </div>
        ))}
      </div>

      <ASPageIndex n={6} total={6} color="rgba(10,10,10,0.5)" />
      <ASBrandFooter color="rgba(10,10,10,0.8)" />
    </ASPanel>
  );
}

// ── tiny helpers ─────────────────────────────────────────────────
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

// ── Phone content mocks ─────────────────────────────────────────────
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

function ASMockBriefMini() {
  const t = window.useTheme();
  return (
    <div style={{ width: '100%', height: '100%', background: t.accent, padding: '60px 20px 30px', color: t.ink, fontFamily: '-apple-system, system-ui' }}>
      <div style={{ fontFamily:'"JetBrains Mono",monospace', fontSize: 10, letterSpacing: 2, fontWeight: 700 }}>BRIEF · FRI</div>
      <div style={{ fontFamily:'"Archivo Black",sans-serif', fontSize: 42, letterSpacing: -1.5, lineHeight: 0.9, marginTop: 6 }}>
        You're<br/>a go.
      </div>
      <div style={{ marginTop: 20, padding: 10, background: t.ink, color: t.bg, fontSize: 12, lineHeight: 1.4 }}>
        HRV 58 (+8). Sleep 7:42. Lift heavy today.
      </div>
      <div style={{ marginTop: 100, fontFamily:'"JetBrains Mono",monospace', fontSize: 9, letterSpacing: 2, fontWeight: 700 }}>ONE MOVE</div>
      <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: -0.5, marginTop: 2 }}>Deadlift 5×5 @ 420.</div>
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
      <div style={{ marginTop: 22, padding: 16, background: t.ink, color: t.bg }}>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 2, color: t.accent }}>COACH</div>
        <div style={{ fontSize: 13, lineHeight: 1.5, marginTop: 6 }}>
          HRV is 54 (+8 vs baseline). Lift heavy today — pull pattern or squat. Keep protein ≥ 180g.
        </div>
      </div>
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

// ── layout rules card (reference) ──────────────
function AS_LayoutRules() {
  const t = window.useTheme();
  return (
    <DCArtboard label="as-ruleset · anatomy" width={ASW} height={ASH} style={{ background: t.bg, borderRadius: 0 }}>
      <div style={{ width: '100%', height: '100%', color: t.ink, padding: '56px 48px', fontFamily: '-apple-system, system-ui', position: 'relative' }}>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12, letterSpacing: 3, color: t.accent }}>TEMPLATE · RULES · v2</div>
        <div style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 52, lineHeight: 0.95, letterSpacing: -2.3, marginTop: 14 }}>
          anatomy<br/>of a screenshot.
        </div>
        <div style={{ marginTop: 28, fontSize: 14, lineHeight: 1.55, color: 'rgba(10,10,10,0.75)', maxWidth: 500 }}>
          Every screenshot now runs LOUD: numeric bleed decor, stacked mockups, receipts, stamps, trust-rows. Same grid, denser payload.
        </div>

        <div style={{ marginTop: 28, borderTop: `1px solid rgba(10,10,10,0.2)`, paddingTop: 18 }}>
          {[
            ['A', 'KICKER',     '"JetBrains Mono" 13 / 3.5pt track / dot + uppercase'],
            ['B', 'HEADLINE',   '"Archivo Black" 76–108 / lh 0.86–0.92 / lowercase'],
            ['C', 'SUBHEAD',    'SF Pro Text 20 / lh 1.38 / 65–72% fg / max-width 460'],
            ['D', 'DECOR NUM',  'Oversize 2-digit index bled off edge · 4–8% opacity'],
            ['E', 'MOCKUP',     'Primary phone tilt ±2–3° · scale 0.72–0.88 · may stack'],
            ['F', 'RECEIPT',    'Right-column stat/set/log strip · mono body · accent key'],
            ['G', 'STAMP',      'Mono · ±6–12° rotate · accent or ink border · trust cue'],
            ['H', 'FOOTER',     'Page NN/06 · heart mark · atlas·core wordmark'],
          ].map(([k, l, r]) => (
            <div key={k} style={{ display: 'flex', gap: 14, padding: '10px 0', borderBottom: '1px solid rgba(10,10,10,0.08)' }}>
              <div style={{ width: 26, height: 26, background: t.ink, color: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Archivo Black", sans-serif', fontSize: 13 }}>{k}</div>
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
