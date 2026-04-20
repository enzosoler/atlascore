// app.jsx — atlas.core app screens, phase 1
// 6 screens × 2 variations × (light + dark) laid out on the design canvas.

// PhoneRow now accepts an array of { Comp, label } — each shown in light + dark.
// Single-variation screens pass one entry; coexisting screens pass two.
function PhoneRow({ title, subtitle, variants, idx }) {
  return (
    <div style={{ marginBottom: 110 }}>
      <div style={{ padding: '0 60px 24px', maxWidth: 1100 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 4 }}>
          <span style={{
            fontFamily: '"JetBrains Mono", monospace', fontSize: 11, letterSpacing: 3,
            color: 'rgba(60,50,40,0.6)', textTransform: 'uppercase',
          }}>screen {String(idx).padStart(2, '0')}</span>
          <span style={{
            fontSize: 22, fontWeight: 600, letterSpacing: -0.3, color: 'rgba(40,30,20,0.9)',
          }}>{title}</span>
        </div>
        {subtitle && <div style={{
          fontSize: 14, color: 'rgba(60,50,40,0.6)', maxWidth: 600,
        }}>{subtitle}</div>}
      </div>

      <div style={{
        display: 'flex', gap: 32, padding: '0 60px',
        alignItems: 'flex-start', width: 'max-content',
      }}>
        {variants.map((v, vi) => (
          <React.Fragment key={vi}>
            {vi > 0 && <div style={{ width: 40 }} />}
            <ACScreen label={v.label} dark={false}><v.Comp dark={false} /></ACScreen>
            <ACScreen label={v.label} dark={true}><v.Comp dark={true} /></ACScreen>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function App() {
  const t = window.useTheme();
  return (
    <DesignCanvas>
      {/* Title strip */}
      <div style={{ padding: '12px 60px 48px', maxWidth: 1100 }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase',
          color: 'rgba(40,30,20,0.6)', marginBottom: 10,
        }}>
          /// atlas.core · app · phase 01
        </div>
        <h1 style={{
          margin: 0, fontFamily: '"Archivo Black", sans-serif',
          fontSize: 84, letterSpacing: -4, lineHeight: 0.88,
          color: 'rgba(15,10,5,0.94)', textTransform: 'lowercase',
        }}>
          the system,<br/>
          <span style={{ background: 'black', color: 'white', padding: '0 10px' }}>on a phone.</span>
        </h1>
        <p style={{ margin: '18px 0 0', fontSize: 15, lineHeight: 1.6, color: 'rgba(40,30,20,0.8)', maxWidth: 720 }}>
          Six screens from the core loop — welcome, today, active workout, nutrition, paywall, bodyweight.
          Two variations each, paired in light + dark. Everything built from the brand system:
          SF Pro for UI, Archivo Black for brand moments, paper + ink + sulfur, softened corners, ECG as motif, heart as the only icon that matters.
        </p>
        <div style={{ marginTop: 24, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            ['brand', 'archivo black'],
            ['ui', 'sf pro'],
            ['data', 'sf mono'],
            ['paper', t.bg.toUpperCase()],
            ['ink', t.ink.toUpperCase()],
            ['accent', t.accent.toUpperCase()],
          ].map(([k, v]) => (
            <div key={k} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 8px', border: '1px solid rgba(0,0,0,0.15)',
              fontFamily: '"JetBrains Mono", monospace', fontSize: 9, letterSpacing: 2,
              textTransform: 'uppercase', color: 'rgba(40,30,20,0.8)',
            }}>
              <span style={{ opacity: 0.55 }}>{k}</span>
              <span>{v}</span>
            </div>
          ))}
        </div>
      </div>

      <PhoneRow idx={1} title="splash / welcome"
        subtitle="Two coexisting entry points. Welcome — Duolingo-energy hero for first open. Manifesto — about/brand moment with ECG divider. Both shown in light + dark."
        variants={[
          { label: 'welcome', Comp: S1_Splash_A },
          { label: 'manifesto', Comp: S1_Splash_B },
        ]} />

      <PhoneRow idx={2} title="today · readiness"
        subtitle="Readiness ring hero + session card + fuel/weight tiles + coach strip. Whoop × Apple Fitness pattern."
        variants={[{ label: 'today', Comp: S2_Today_A }]} />

      <PhoneRow idx={3} title="workout · active session"
        subtitle="Hevy-style logging: progress bar, current-set card with RPE, queued exercises below."
        variants={[{ label: 'workout', Comp: S3_Workout_A }]} />

      <PhoneRow idx={4} title="nutrition · fuel"
        subtitle="Day ledger with macros hero, meal sections, and a quick-capture row (scan / camera / voice / recents) at the top."
        variants={[{ label: 'fuel', Comp: S4_Nutrition_A }]} />

      <PhoneRow idx={5} title="paywall · trial gate"
        subtitle="Two coexisting moments. Plans — Cal AI-style trial comparison. PR moment — post-record upgrade pitch."
        variants={[
          { label: 'plans', Comp: S5_Paywall_A },
          { label: 'pr moment', Comp: S5_Paywall_B },
        ]} />

      <PhoneRow idx={6} title="bodyweight · trend & entry"
        subtitle="Two coexisting screens. Trend — MacroFactor/Happy Scale view with 7-day moving average. Entry — giant number + full number pad modal."
        variants={[
          { label: 'trend', Comp: S6_Weight_A },
          { label: 'entry', Comp: S6_Weight_B },
        ]} />

      {/* ── PHASE 2 ─────────────────────────────────────── */}
      <div style={{ padding: '40px 60px 48px', maxWidth: 1100 }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase',
          color: 'rgba(40,30,20,0.6)', marginBottom: 10,
        }}>
          /// atlas.core · app · phase 02
        </div>
        <h2 style={{
          margin: 0, fontFamily: '"Archivo Black", sans-serif',
          fontSize: 72, letterSpacing: -3, lineHeight: 0.9,
          color: 'rgba(15,10,5,0.94)', textTransform: 'lowercase',
        }}>
          onboarding <span style={{ color: t.accent }}>+</span><br/>
          <span style={{ background: 'black', color: 'white', padding: '0 10px' }}>the coach</span>.
        </h2>
        <p style={{ margin: '18px 0 0', fontSize: 15, lineHeight: 1.6, color: 'rgba(40,30,20,0.8)', maxWidth: 720 }}>
          Five-step onboarding (identity → goal → activity → plan preview → permissions), plus two AI coach surfaces — live chat and the morning daily brief.
          Same system, same vocabulary. Light + dark each.
        </p>
      </div>

      <PhoneRow idx={7} title="onboarding · identity"
        subtitle="Step 1 of 5. Sex, age, height. Used for calorie + macro math."
        variants={[{ label: 'identity', Comp: S7_Onboard_Identity }]} />

      <PhoneRow idx={8} title="onboarding · goal"
        subtitle="Step 2 of 5. Four archetypes: lose, recomp, maintain, build. Each with a trend icon."
        variants={[{ label: 'goal', Comp: S8_Onboard_Goal }]} />

      <PhoneRow idx={9} title="onboarding · activity"
        subtitle="Step 3 of 5. Sedentary → athletic on a 5-step ladder, with the TDEE multiplier exposed."
        variants={[{ label: 'activity', Comp: S9_Onboard_Activity }]} />

      <PhoneRow idx={10} title="onboarding · plan preview"
        subtitle="Step 4 of 5. The calculated daily target — kcal + macro split + projected trend."
        variants={[{ label: 'plan', Comp: S10_Onboard_Plan }]} />

      <PhoneRow idx={11} title="onboarding · connect"
        subtitle="Step 5 of 5. HealthKit, notifications, optional wearable. Privacy-forward copy."
        variants={[{ label: 'connect', Comp: S11_Onboard_Permissions }]} />

      <PhoneRow idx={12} title="coach · chat"
        subtitle="Live AI coach thread. Context-aware bubbles, inline suggestion cards, quick-reply chips."
        variants={[{ label: 'chat', Comp: S12_Coach_Chat }]} />

      <PhoneRow idx={13} title="coach · daily brief"
        subtitle="Morning summary. Readiness hero, three-move plan, 14d signal strip. The AI's opening move every day."
        variants={[{ label: 'brief', Comp: S13_Coach_Brief }]} />

      {/* ── PHASE 3 ─────────────────────────────────────── */}
      <div style={{ padding: '40px 60px 48px', maxWidth: 1100 }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase',
          color: 'rgba(40,30,20,0.6)', marginBottom: 10,
        }}>
          /// atlas.core · app · phase 03
        </div>
        <h2 style={{
          margin: 0, fontFamily: '"Archivo Black", sans-serif',
          fontSize: 72, letterSpacing: -3, lineHeight: 0.9,
          color: 'rgba(15,10,5,0.94)', textTransform: 'lowercase',
        }}>
          body <span style={{ color: t.accent }}>+</span><br/>
          <span style={{ background: 'black', color: 'white', padding: '0 10px' }}>biology</span>.
        </h2>
        <p style={{ margin: '18px 0 0', fontSize: 15, lineHeight: 1.6, color: 'rgba(40,30,20,0.8)', maxWidth: 720 }}>
          Five screens for the deeper body layer — composition dashboard, lab results inbox,
          biomarker deep-dive (ApoB), measurements entry, progress photos. Same vocabulary
          extended to a richer dataset.
        </p>
      </div>

      <PhoneRow idx={14} title="body · dashboard"
        subtitle="Composition hero with weight + trend, 3-up tiles (BF%, lean mass, waist:hip), silhouette with measurement rings, and an inbox teaser for flagged biomarkers."
        variants={[{ label: 'body', Comp: S14_Body_Dashboard }]} />

      <PhoneRow idx={15} title="labs · inbox"
        subtitle="Chronological panel list with optimal/elevated/low flags. Summary bar shows the full breakdown across 84 markers."
        variants={[{ label: 'labs', Comp: S15_Labs_Inbox }]} />

      <PhoneRow idx={16} title="biomarker · detail"
        subtitle="ApoB deep-dive. Current value vs optimal band, 24-month trend with optimal overlay, what-drives-this protocol items, coach note CTA."
        variants={[{ label: 'apob', Comp: S16_Biomarker_Detail }]} />

      <PhoneRow idx={17} title="measurements · entry"
        subtitle="Giant tabular number with accent decimal, pill tabs for body sites, mini trend chart, full numeric keypad."
        variants={[{ label: 'entry', Comp: S17_Measurements_Entry }]} />

      <PhoneRow idx={18} title="progress · photos"
        subtitle="Nov → Apr compare hero, then grid of 6 months with stats pinned to each. Photos stay on-device — privacy-forward copy."
        variants={[{ label: 'photos', Comp: S18_Progress_Photos }]} />

      {/* ── PHASE 4 ─────────────────────────────────────── */}
      <div style={{ padding: '40px 60px 48px', maxWidth: 1100 }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase',
          color: 'rgba(40,30,20,0.6)', marginBottom: 10,
        }}>
          /// atlas.core · app · phase 04
        </div>
        <h2 style={{
          margin: 0, fontFamily: '"Archivo Black", sans-serif',
          fontSize: 72, letterSpacing: -3, lineHeight: 0.9,
          color: 'rgba(15,10,5,0.94)', textTransform: 'lowercase',
        }}>
          settings <span style={{ color: t.accent }}>+</span><br/>
          <span style={{ background: 'black', color: 'white', padding: '0 10px' }}>the edges</span>.
        </h2>
        <p style={{ margin: '18px 0 0', fontSize: 15, lineHeight: 1.6, color: 'rgba(40,30,20,0.8)', maxWidth: 720 }}>
          Five screens for the system's perimeter — settings, PR gallery, shareable PR card,
          notification inbox + prefs, and three empty/edge states (first run, no data, offline).
          Same system, tested at its rough edges.
        </p>
      </div>

      <PhoneRow idx={19} title="settings · system"
        subtitle="Account, integrations, preferences, data & privacy. iOS-grouped rows with our type discipline — accent dots for integration status, danger-red for destructive actions."
        variants={[{ label: 'settings', Comp: S19_Settings }]} />

      <PhoneRow idx={20} title="PR · gallery"
        subtitle="Personal records as a wall. April summary hero, filter chips by lift family, chronological list with barbell stamp, e1RM, and time-since badges."
        variants={[{ label: 'wall', Comp: S20_PR_Gallery }]} />

      <PhoneRow idx={21} title="PR · share card"
        subtitle="Post-PR share moment, optimized for screenshot → IG. 9:12 aspect. 140px tabular lift number, ECG divider, three-up metadata strip, atlas.core watermark."
        variants={[{ label: 'share', Comp: S21_Share_Card }]} />

      <PhoneRow idx={22} title="notifications · inbox + prefs"
        subtitle="Recent alerts list + granular toggles. Morning brief, PR windows, fuel nudges, lab results, sleep, social. Copy explicitly rejects streak/guilt mechanics."
        variants={[{ label: 'notifs', Comp: S22_Notifications }]} />

      <PhoneRow idx={23} title="states · empty &amp; edges"
        subtitle="Three compact states switchable via pill tabs. First-run empty, no-data chart (pending Function panel), offline with local queue readout."
        variants={[{ label: 'states', Comp: S23_Empty_States }]} />

      {/* Footer note */}
      <div style={{ padding: '0 60px 80px', maxWidth: 900 }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 3,
          textTransform: 'uppercase', color: 'rgba(40,30,20,0.6)', marginBottom: 10,
        }}>
          /// done · 23 screens
        </div>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: 'rgba(40,30,20,0.85)' }}>
          23 screens across 4 phases — core loop, onboarding + coach, body + biology, perimeter.
          All in light + dark, built on a shared system: Archivo Black for brand, SF Pro for UI,
          SF Mono for data; paper + ink + sulfur; ECG as the motif that binds it all.
        </p>
      </div>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
