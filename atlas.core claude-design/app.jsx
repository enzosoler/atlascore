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

// DesktopRow — single ChromeWindow per row. Used for internal/coach tools.
function DesktopRow({ title, subtitle, idx, Comp, url = 'coach.atlas.core' }) {
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
          fontSize: 14, color: 'rgba(60,50,40,0.6)', maxWidth: 700,
        }}>{subtitle}</div>}
      </div>
      <div style={{ padding: '0 60px', width: 'max-content' }}>
        <ChromeWindow width={1280} height={860} url={url}
          tabs={[{ title: 'atlas.core · coach', active: true }, { title: 'Calendar' }]}
          activeIndex={0}>
          <Comp />
        </ChromeWindow>
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

        {/* Reference docs — standalone pages */}
        <div style={{ marginTop: 18, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{
            fontFamily: '"JetBrains Mono", monospace', fontSize: 9, letterSpacing: 2,
            textTransform: 'uppercase', color: 'rgba(40,30,20,0.5)', marginRight: 4,
          }}>docs →</span>
          {[
            ['design system', 'design-system.html'],
            ['toolkit', 'toolkit.html'],
            ['motion spec', 'Motion.html'],
          ].map(([label, href]) => (
            <a key={href} href={href} target="_top" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '5px 10px', background: 'rgba(15,10,5,0.92)', color: t.bg,
              fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 1.8,
              textTransform: 'uppercase', fontWeight: 600, textDecoration: 'none',
            }}>
              {label} <span style={{ color: t.accent }}>↗</span>
            </a>
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

      {/* ── PHASE 5 ─────────────────────────────────────── */}
      <div style={{ padding: '40px 60px 48px', maxWidth: 1100 }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase',
          color: 'rgba(40,30,20,0.6)', marginBottom: 10,
        }}>
          /// atlas.core · app · phase 05
        </div>
        <h2 style={{
          margin: 0, fontFamily: '"Archivo Black", sans-serif',
          fontSize: 72, letterSpacing: -3, lineHeight: 0.9,
          color: 'rgba(15,10,5,0.94)', textTransform: 'lowercase',
        }}>
          programs <span style={{ color: t.accent }}>+</span><br/>
          <span style={{ background: 'black', color: 'white', padding: '0 10px' }}>the crew</span>.
        </h2>
        <p style={{ margin: '18px 0 0', fontSize: 15, lineHeight: 1.6, color: 'rgba(40,30,20,0.8)', maxWidth: 720 }}>
          Five screens that expand the training surface — discover, commit, schedule, deep-dive, compare.
          Library of programs, 5/3/1 BBB program detail, calendar, deadlift exercise page, and a small social layer.
        </p>
      </div>

      <PhoneRow idx={24} title="workout · library"
        subtitle="Filterable program directory. Categories, then cards with duration · sessions/wk · difficulty stamp."
        variants={[{ label: 'library', Comp: S24_Library }]} />

      <PhoneRow idx={25} title="program · 5/3/1 BBB"
        subtitle="Program detail page. 16-week block with percentage progression, day split, and the commit CTA."
        variants={[{ label: 'program', Comp: S25_Program_Detail }]} />

      <PhoneRow idx={26} title="plan · calendar"
        subtitle="Month view with session dots, today highlight, and upcoming list. Reschedule, skip, swap inline."
        variants={[{ label: 'calendar', Comp: S26_Calendar }]} />

      <PhoneRow idx={27} title="exercise · deadlift"
        subtitle="Deep-dive on a lift: 18-month 1RM trend, cues, variants, pattern siblings. The hinge, examined."
        variants={[{ label: 'deadlift', Comp: S27_Exercise_Detail }]} />

      <PhoneRow idx={28} title="crew · leaderboard"
        subtitle="Opt-in micro-social. 5 people you train alongside. Tonnes, PRs, streak — ranked, not gamified."
        variants={[{ label: 'crew', Comp: S28_Crew }]} />

      {/* ── PHASE 6 ─────────────────────────────────────── */}
      <div style={{ padding: '40px 60px 48px', maxWidth: 1100 }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase',
          color: 'rgba(40,30,20,0.6)', marginBottom: 10,
        }}>
          /// atlas.core · app · phase 06
        </div>
        <h2 style={{
          margin: 0, fontFamily: '"Archivo Black", sans-serif',
          fontSize: 72, letterSpacing: -3, lineHeight: 0.9,
          color: 'rgba(15,10,5,0.94)', textTransform: 'lowercase',
        }}>
          bookends <span style={{ color: t.accent }}>+</span><br/>
          <span style={{ background: 'black', color: 'white', padding: '0 10px' }}>companions</span>.
        </h2>
        <p style={{ margin: '18px 0 0', fontSize: 15, lineHeight: 1.6, color: 'rgba(40,30,20,0.8)', maxWidth: 720 }}>
          Seven final surfaces. Session + week bookends (workout summary, Sunday recap zine),
          biological depth (sleep detail), capture (barcode · photo · voice — one screen, three modes),
          social identity (profile), companion (watch on the wrist), and universal find (search).
        </p>
      </div>

      <PhoneRow idx={29} title="workout · summary"
        subtitle="Post-session. Big headline, four signal grid, volume vs 12-wk avg, lift log with PR stamp, what's next preview."
        variants={[{ label: 'summary', Comp: S29_Workout_Summary }]} />

      <PhoneRow idx={30} title="weekly · recap"
        subtitle="Sunday review as a zine. Issue-numbered, poster-scale type, daily bars, moments feed, next week kicker. The only screen that leans full ink."
        variants={[{ label: 'recap', Comp: S30_Weekly_Recap }]} />

      <PhoneRow idx={31} title="sleep · detail"
        subtitle="Last-night deep-dive. Score + duration hero, stages timeline with deep/light/REM/awake strip, HRV · RHR · resp · temp tiles, coach takeaway."
        variants={[{ label: 'sleep', Comp: S31_Sleep_Detail }]} />

      <PhoneRow idx={32} title="capture · fuel"
        subtitle="Three modes in one surface — barcode scanner with product card, photo recognition with detection pins, voice log with waveform + parsed items."
        variants={[{ label: 'capture', Comp: S32_Capture }]} />

      <PhoneRow idx={33} title="profile · public"
        subtitle="You as shown to the crew. Inverted hero card, big-four PRs, current program strip, composition mini, recent activity. No streaks, no grind badges."
        variants={[{ label: 'profile', Comp: S33_Profile }]} />

      <PhoneRow idx={34} title="watch · companion"
        subtitle="Apple Watch mid-set mirror — drawn as a 44mm device. Weight + reps, rest ring, HR. Plus phone-side mirroring preferences."
        variants={[{ label: 'watch', Comp: S34_Watch }]} />

      <PhoneRow idx={35} title="search · universal"
        subtitle="Query 'deadlift' → top match card, grouped results (lifts · programs · history · articles), coach suggestion prompts. Highlights in accent."
        variants={[{ label: 'search', Comp: S35_Search }]} />

      {/* ── PHASE 7 ─────────────────────────────────────── */}
      <div style={{ padding: '40px 60px 48px', maxWidth: 1100 }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase',
          color: 'rgba(40,30,20,0.6)', marginBottom: 10,
        }}>
          /// atlas.core · app · phase 07
        </div>
        <h2 style={{
          margin: 0, fontFamily: '"Archivo Black", sans-serif',
          fontSize: 72, letterSpacing: -3, lineHeight: 0.9,
          color: 'rgba(15,10,5,0.94)', textTransform: 'lowercase',
        }}>
          edges <span style={{ color: t.accent }}>+</span><br/>
          <span style={{ background: 'black', color: 'white', padding: '0 10px' }}>the web</span>.
        </h2>
        <p style={{ margin: '18px 0 0', fontSize: 15, lineHeight: 1.6, color: 'rgba(40,30,20,0.8)', maxWidth: 720 }}>
          Seven perimeter surfaces you only see when something changes — auth, the signal inbox,
          food detail, the meal builder, billing, four error states (conflict · 500 · rate · offline),
          and the marketing landing page. The system at its edges, and on the web.
        </p>
      </div>

      <PhoneRow idx={36} title="auth · sign in"
        subtitle="One-field entry. Email + magic code, Apple · Google fallback. Health data never leaves device by default — copy carries that promise."
        variants={[{ label: 'auth', Comp: S36_Auth }]} />

      <PhoneRow idx={37} title="inbox · today's signals"
        subtitle="Signal stream with type rail (coach · plan · labs · crew · rest · billing), timestamps, inline CTAs. No streak engine — copy explicitly says so."
        variants={[{ label: 'inbox', Comp: S37_Inbox }]} />

      <PhoneRow idx={38} title="food · detail"
        subtitle="A logged meal deep-dive. Macro hero, editable items, notable micronutrients, source strip ('photo log · 92% confidence'), confirm/save footer."
        variants={[{ label: 'food', Comp: S38_Food_Detail }]} />

      <PhoneRow idx={39} title="recipe · builder"
        subtitle="Draft a meal from ingredients. Physical-feeling stacked-cards metaphor, live macro total, per-item macro band, options (template · share · add to plan)."
        variants={[{ label: 'recipe', Comp: S39_Recipe_Builder }]} />

      <PhoneRow idx={40} title="billing · subscription"
        subtitle="Plan hero, perks strip, Visa •••• 4242, invoice history, yearly upsell, danger-row cancel. All on system ink/accent; nothing that looks like a standard SaaS billing page."
        variants={[{ label: 'billing', Comp: S40_Billing }]} />

      <PhoneRow idx={41} title="errors · the edges"
        subtitle="Four states in one surface — sync conflict (watch vs phone), 500 (ECG flatline), rate-limit countdown, offline queue. Blame-free copy, ECG motif carries through."
        variants={[{ label: 'errors', Comp: S41_Errors }]} />

      {/* Web landing — full-width, desktop, no phone frame */}
      <div style={{ padding: '60px 60px 24px', maxWidth: 1200 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 4 }}>
          <span style={{
            fontFamily: '"JetBrains Mono", monospace', fontSize: 11, letterSpacing: 3,
            color: 'rgba(60,50,40,0.6)', textTransform: 'uppercase',
          }}>screen 42</span>
          <span style={{
            fontSize: 22, fontWeight: 600, letterSpacing: -0.3, color: 'rgba(40,30,20,0.9)',
          }}>web · landing</span>
        </div>
        <div style={{
          fontSize: 14, color: 'rgba(60,50,40,0.6)', maxWidth: 600, marginBottom: 24,
        }}>
          Desktop landing page. Poster-scale manifesto, ECG hero, feature grid, pricing echo, footer. Same type system extended to web.
        </div>
        <div style={{
          padding: 24, background: '#2a2a2a',
          borderRadius: 14, overflow: 'hidden',
        }}>
          <div style={{
            background: '#efe9da',
            borderRadius: 6, overflow: 'hidden',
            boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
          }}>
            <S42_Web_Landing />
          </div>
        </div>
      </div>

      {/* ── PHASE 8 ─────────────────────────────────────── */}
      <div style={{ padding: '40px 60px 48px', maxWidth: 1100 }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase',
          color: 'rgba(40,30,20,0.6)', marginBottom: 10,
        }}>
          /// atlas.core · app · phase 08
        </div>
        <h2 style={{
          margin: 0, fontFamily: '"Archivo Black", sans-serif',
          fontSize: 72, letterSpacing: -3, lineHeight: 0.9,
          color: 'rgba(15,10,5,0.94)', textTransform: 'lowercase',
        }}>
          protocols <span style={{ color: t.accent }}>+</span><br/>
          <span style={{ background: 'black', color: 'white', padding: '0 10px' }}>the stack</span>.
        </h2>
        <p style={{ margin: '18px 0 0', fontSize: 15, lineHeight: 1.6, color: 'rgba(40,30,20,0.8)', maxWidth: 720 }}>
          Eight screens covering the full protocols domain — overview (populated + empty/locked),
          protocol detail, creation form with cycle-conflict warning, substance picker, log-dose sheet
          (taken · skipped · adjusted), 90-day timeline zine, and today dose module with all-complete success.
        </p>
      </div>

      <PhoneRow idx={43} title="protocols · home"
        subtitle="P1 populated. Today's doses hero with ring, 30-day adherence strip, 5 active protocols (TRT, BPC-157, creatine, berberine paused, vit D), coach insight banner."
        variants={[{ label: 'home', Comp: S43_Protocols_Home }]} />

      <PhoneRow idx={44} title="protocols · empty + locked"
        subtitle="P1 sub-states. Toggle between first-run empty (quick-start templates + custom CTA) and Pro-locked paywall (reuses S5 vocabulary)."
        variants={[{ label: 'states', Comp: S44_Protocols_Empty_Locked }]} />

      <PhoneRow idx={45} title="protocol · detail"
        subtitle="P2 TRT cypionate deep-dive. 90d adherence ring, today-CTA banner, 12-week cadence grid with on/late/miss/today legend, coach insight, recent doses, edit/pause/end."
        variants={[{ label: 'detail', Comp: S45_Protocol_Detail }]} />

      <PhoneRow idx={46} title="protocol · form"
        subtitle="P3 authoring. Substance link, dose with unit picker, cadence with day-picker, cycle toggle, cycle-conflict warning, notes. Save in nav, validation inline."
        variants={[{ label: 'form', Comp: S46_Protocol_Form }]} />

      <PhoneRow idx={47} title="substance · picker"
        subtitle="P5 full-screen sheet. Search with highlight, category chips, results list, and 'can't find it?' custom-substance CTA covering the no-results state."
        variants={[{ label: 'picker', Comp: S47_Substance_Picker }]} />

      <PhoneRow idx={48} title="log dose · sheet"
        subtitle="P4 bottom sheet over Today. Three modes — taken (time + site + notes), skipped (reason picker), adjust (new dose + reason). Offline sync indicator in header."
        variants={[{ label: 'log', Comp: S48_Log_Dose }]} />

      <PhoneRow idx={49} title="protocols · timeline"
        subtitle="90-day cross-protocol zine. Issue-numbered header, adherence summary, 4 protocol bands (TRT cadence, BPC cycles, creatine daily, vit D start), moments strip."
        variants={[{ label: 'timeline', Comp: S49_Protocol_Timeline }]} />

      <PhoneRow idx={50} title="today · all-complete"
        subtitle="P6 module + success state. Full-accent 4/4 hero with ECG, today's logged doses with check stamps, tomorrow preview. The celebratory bookend."
        variants={[{ label: 'complete', Comp: S50_Today_Dose_Module }]} />

      {/* ── PHASE 9 · PRODUCT · BATCH A (S51–S57) ─────────────── */}
      <div style={{ padding: '60px 60px 36px', maxWidth: 1100 }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase',
          color: 'rgba(40,30,20,0.6)', marginBottom: 10,
        }}>
          /// atlas.core · product · phase 09 · batch a
        </div>
        <h2 style={{
          margin: 0, fontFamily: '"Archivo Black", sans-serif',
          fontSize: 56, letterSpacing: -2.4, lineHeight: 0.95,
          color: 'rgba(15,10,5,0.94)', textTransform: 'lowercase',
        }}>
          nutrition · history · coach insight.
        </h2>
        <p style={{ margin: '16px 0 0', fontSize: 15, lineHeight: 1.6, color: 'rgba(40,30,20,0.8)', maxWidth: 760 }}>
          Seven screens that close the loop around eating, training history, and the coach's deep-read.
          Same vocabulary as the first 50: SF Pro for UI, SF Mono for data, Archivo Black reserved for brand.
        </p>
      </div>

      <PhoneRow idx={51} title="food diary"
        subtitle="Today's meals with kcal hero, segmented progress, macro triad, capture strip (scan/snap/say/again), and four meal rows with items."
        variants={[{ label: 'diary', Comp: S51_Food_Diary }]} />

      <PhoneRow idx={52} title="macro targets"
        subtitle="kcal slider, % split bar, per-macro grams with body-mass derivation. Clean editor, no plate diagrams."
        variants={[{ label: 'targets', Comp: S52_Macro_Targets }]} />

      <PhoneRow idx={53} title="water log"
        subtitle="Hydration with 8-segment fill bar, quick-add tiles (250/500/750/1000 ml), timestamped entries in mono."
        variants={[{ label: 'water', Comp: S53_Water_Log }]} />

      <PhoneRow idx={54} title="workout history"
        subtitle="30-day stats header, week-grouped session list with letter-stamp keys (B/P/S), PR badges, tonnage + duration."
        variants={[{ label: 'history', Comp: S54_Workout_History }]} />

      <PhoneRow idx={55} title="workout detail"
        subtitle="One session deep. Volume/time/RPE triad, then per-lift set tables in mono with inline PR badges."
        variants={[{ label: 'detail', Comp: S55_Workout_Detail }]} />

      <PhoneRow idx={56} title="composition history"
        subtitle="30-day weight trend with moving average, BF% tile, lean/fat/waist sub-metrics, recent scan table."
        variants={[{ label: 'composition', Comp: S56_Composition_History }]} />

      <PhoneRow idx={57} title="coach insight"
        subtitle="Single deep-read: HRV drift. Numbered likely factors, ink-card recommendation, apply-to-plan action."
        variants={[{ label: 'insight', Comp: S57_Coach_Insight }]} />

      {/* ── PHASE 9 · PRODUCT · BATCH B (S58–S67) ─────────────── */}
      <div style={{ padding: '60px 60px 36px', maxWidth: 1100 }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase',
          color: 'rgba(40,30,20,0.6)', marginBottom: 10,
        }}>
          /// atlas.core · product · phase 09 · batch b
        </div>
        <h2 style={{
          margin: 0, fontFamily: '"Archivo Black", sans-serif',
          fontSize: 56, letterSpacing: -2.4, lineHeight: 0.95,
          color: 'rgba(15,10,5,0.94)', textTransform: 'lowercase',
        }}>
          onboarding finish · account surface.
        </h2>
        <p style={{ margin: '16px 0 0', fontSize: 15, lineHeight: 1.6, color: 'rgba(40,30,20,0.8)', maxWidth: 760 }}>
          Ten screens closing two long-open gaps. Finishes onboarding (workout prefs → habits → constraints
          → summary → tour) and covers the account surface (settings, integrations, danger zone, diagnostics,
          profile editor). Same vocabulary; the tour reuses the readiness ring with a pointer callout.
        </p>
      </div>

      <PhoneRow idx={58} title="onboarding · workout"
        subtitle="Step 3/6. Training frequency (7-day selector) and style (powerlifting / hypertrophy / hybrid / athletic) with left-border accent on selection."
        variants={[{ label: 'workout', Comp: S58_Onboard_Workout }]} />

      <PhoneRow idx={59} title="onboarding · habits"
        subtitle="Step 4/6. Pick 3 of 6 habits with iOS toggle treatment — accent fill + ink thumb to stay on-palette."
        variants={[{ label: 'habits', Comp: S59_Onboard_Habits }]} />

      <PhoneRow idx={60} title="onboarding · constraints"
        subtitle="Step 5/6. Injuries + dietary avoidances as inverse chips; free-text notes surfaced so the coach can read it."
        variants={[{ label: 'constraints', Comp: S60_Onboard_Constraints }]} />

      <PhoneRow idx={61} title="onboarding · summary"
        subtitle="Step 6/6. Definition-list review of everything they gave us, with the refusal as an ink card — no streaks, no guilt."
        variants={[{ label: 'summary', Comp: S61_Onboard_Summary }]} />

      <PhoneRow idx={62} title="onboarding · tour"
        subtitle="Post-onboard tour (2 of 4). Readiness ring with pointer callout; establishes the number that leads every day."
        variants={[{ label: 'tour', Comp: S62_Onboard_Tour }]} />

      <PhoneRow idx={63} title="account · settings"
        subtitle="Grouped iOS rows — account, plan, preferences, data, danger. Avatar row on top with MK mark."
        variants={[{ label: 'settings', Comp: S63_Account_Settings }]} />

      <PhoneRow idx={64} title="account · integrations"
        subtitle="8 services, 3 live. Summary tile with syncing sparkline; lettermark stamps invert when connected; accent toggles."
        variants={[{ label: 'integrations', Comp: S64_Integrations }]} />

      <PhoneRow idx={65} title="account · danger zone"
        subtitle="Pause, reset, export, delete. Red left-border warning up top; destructive action stamped solid-red to separate from neutral CTAs."
        variants={[{ label: 'danger', Comp: S65_Danger_Zone }]} />

      <PhoneRow idx={66} title="account · diagnostics"
        subtitle="Technical self-check. Status headline, 10-row report in mono with green/red state dots, copy-report CTA."
        variants={[{ label: 'diagnostics', Comp: S66_Diagnostics }]} />

      <PhoneRow idx={67} title="account · profile editor"
        subtitle="Avatar tile with accent + plus-mark, field rows with mono labels / body values / hint line, sticky save CTA."
        variants={[{ label: 'profile', Comp: S67_Profile_Editor }]} />

      {/* ── PHASE 11 · COACH-SIDE TOOLS (S68–S71) ─────────────── */}
      <div style={{ padding: '60px 60px 36px', maxWidth: 1100 }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase',
          color: 'rgba(40,30,20,0.6)', marginBottom: 10,
        }}>
          /// atlas.core · coach · phase 11
        </div>
        <h2 style={{
          margin: 0, fontFamily: '"Archivo Black", sans-serif',
          fontSize: 72, letterSpacing: -3, lineHeight: 0.9,
          color: 'rgba(15,10,5,0.94)', textTransform: 'lowercase',
        }}>
          the <span style={{ color: t.accent }}>coach</span> side.<br/>
          <span style={{ background: 'black', color: 'white', padding: '0 10px' }}>the other half of the product</span>.
        </h2>
        <p style={{ margin: '18px 0 0', fontSize: 15, lineHeight: 1.6, color: 'rgba(40,30,20,0.8)', maxWidth: 760 }}>
          The app implies a coach layer — AI-first, human-assisted. This is what the coach actually uses.
          Desktop web app at 1280 wide, same paper/ink/sulfur vocabulary, with data density turned up
          and Archivo Black stepped down (internal tool — brand voice breathes but doesn't shout).
          Four screens: roster, client detail, message queue, intervention.
        </p>
      </div>

      <DesktopRow idx={68} title="coach · roster"
        subtitle="The dashboard. 12 athletes, sortable, flagged. Summary strip up top, filter row, then a dense table with avatar/program/readiness/7d-spark/flag/tonnage/adherence-bar."
        Comp={S68_Coach_Roster} />

      <DesktopRow idx={69} title="coach · client detail"
        subtitle="One athlete's full read. Bio strip, 4-signal grid, 21-day HRV chart, readiness + volume mini-charts, recent sessions, thread + AI recommendation + labs rail."
        Comp={S69_Coach_Client_Detail} url="coach.atlas.core/jordan-parker" />

      <DesktopRow idx={70} title="coach · message queue"
        subtitle="Inbox of client threads, prioritized. Unread + urgent + PR + churn-risk tagged. Right pane shows context strip, quoted message, AI draft reply, and a composer with saved-template chips."
        Comp={S70_Coach_Queue} url="coach.atlas.core/queue" />

      <DesktopRow idx={71} title="coach · intervention"
        subtitle="Three-step push: the why (selected triggers), the change (type + scope + details), the message (tone chips + editable copy). Right rail renders the exact phone preview the client will see."
        Comp={S71_Coach_Intervention} url="coach.atlas.core/jordan-parker/intervention" />

      {/* ── PHASE 12 · ONBOARDING VARIANTS (S72–S75) ─────────────── */}
      <div style={{ padding: '60px 60px 36px', maxWidth: 1100 }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase',
          color: 'rgba(40,30,20,0.6)', marginBottom: 10,
        }}>
          /// atlas.core · onboarding · phase 12
        </div>
        <h2 style={{
          margin: 0, fontFamily: '"Archivo Black", sans-serif',
          fontSize: 72, letterSpacing: -3, lineHeight: 0.9,
          color: 'rgba(15,10,5,0.94)', textTransform: 'lowercase',
        }}>
          <span style={{ color: t.accent }}>other</span> ways in.<br/>
          <span style={{ background: 'black', color: 'white', padding: '0 10px' }}>not everyone starts at step one</span>.
        </h2>
        <p style={{ margin: '18px 0 0', fontSize: 15, lineHeight: 1.6, color: 'rgba(40,30,20,0.8)', maxWidth: 760 }}>
          The happy-path 5-step flow (S7–S11) covers new users. These four are the
          alternate entry points: returning after cancel, migrating from a competitor,
          landing from a referral, and corporate/insurance-sponsored enrollment.
          Each reuses the onboarding vocabulary but with a custom first beat.
        </p>
      </div>

      <PhoneRow idx={72} title="onboarding · returning user"
        subtitle="Post-cancel re-onboarding. No step counter — it's a reunion, not a setup. Archive tile shows what we still have, accent-bordered callout catches them up, two paths: resume the program or reassess."
        variants={[{ label: 'welcome back', Comp: S72_Returning_User }]} />

      <PhoneRow idx={73} title="onboarding · import from competitor"
        subtitle="Migration lane. Six sources (MacroFactor, MFP, Strong, Hevy, Apple Health, CSV) as a radio list; selected item shows a live transfer matrix — what moves, what doesn't, and why. Secondary escape to start fresh."
        variants={[{ label: 'import', Comp: S73_Import }]} />

      <PhoneRow idx={74} title="onboarding · invite landing"
        subtitle="Referral entry. Full-bleed inverted hero with ECG watermark, friend's avatar + pull quote, their 90-day numbers, then the mutual rewards (60d free, friend gets a month, auto-crewed)."
        variants={[{ label: 'invite', Comp: S74_Invite }]} />

      <PhoneRow idx={75} title="onboarding · sponsored"
        subtitle="Corporate/insurance entry. Verified sponsor card at top, 'covered in full' hero, 4-row benefits list, accent-bordered privacy pledge (enrollment status only — no weight, no labs, ever)."
        variants={[{ label: 'sponsored', Comp: S75_Sponsored }]} />

      {/* ── PHASE 15 · GAP FILLS (S76–S86) ─────────────────────── */}
      <div style={{ padding: '60px 60px 36px', maxWidth: 1100 }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase',
          color: 'rgba(40,30,20,0.6)', marginBottom: 10,
        }}>
          /// atlas.core · gap fills · phase 15
        </div>
        <h2 style={{
          margin: 0, fontFamily: '"Archivo Black", sans-serif',
          fontSize: 72, letterSpacing: -3, lineHeight: 0.9,
          color: 'rgba(15,10,5,0.94)', textTransform: 'lowercase',
        }}>
          the edges <span style={{ color: t.accent }}>we missed</span>.
        </h2>
        <p style={{ margin: '18px 0 0', fontSize: 15, lineHeight: 1.6, color: 'rgba(40,30,20,0.8)', maxWidth: 760 }}>
          Eleven screens that close the redesign-set gap — the public-facing profile, the lab capture + marker
          + history deep-dives, routine presets with detail, meal detail, and the full error/maintenance/update
          state machinery (with compact variants for mid-session interstitials). Each reuses the same vocabulary.
        </p>
      </div>

      <PhoneRow idx={76} title="public profile · shared athlete card"
        subtitle="Shareable external view. Paper header, giant name + ECG signature, 4 public metrics, share-ready meta, subtle 'verified by atlas' stamp."
        variants={[{ label: 'public', Comp: S76_Public_Profile }]} />
      <PhoneRow idx={77} title="lab upload · three paths"
        subtitle="Drop file · photograph · request panel. Three bold radio cards, live parser preview, marker extraction flow, upload confirmation."
        variants={[{ label: 'upload', Comp: S77_Lab_Upload }]} />
      <PhoneRow idx={78} title="lab exam · marker detail"
        subtitle="Single-marker deep-dive. Hero value with range band, 6-month trend sparkline, reference ranges, coach note, related markers."
        variants={[{ label: 'exam', Comp: S78_Lab_Exam_Detail }]} />
      <PhoneRow idx={79} title="lab history · timeline"
        subtitle="All panels chronologically. Year dividers, per-panel count + key movers, side-by-side compare handles."
        variants={[{ label: 'history', Comp: S79_Lab_History }]} />
      <PhoneRow idx={80} title="routine · presets browse"
        subtitle="Program picker. 6 preset cards with duration, difficulty tags, goal match, 'coach picks this' featured tile."
        variants={[{ label: 'presets', Comp: S80_Routine_Presets }]} />
      <PhoneRow idx={81} title="routine · preset detail"
        subtitle="Program expanded. Schedule grid, exercise list per day, progression model, swap-in options, start-program CTA."
        variants={[{ label: 'detail', Comp: S81_Routine_Preset_Detail }]} />
      <PhoneRow idx={82} title="meal · detail view"
        subtitle="Single meal expanded. Photo hero, macro breakdown, ingredient list with per-item kcal, edit + duplicate actions."
        variants={[{ label: 'meal', Comp: S82_Meal_Detail }]} />
      <PhoneRow idx={83} title="offline · cached-only"
        subtitle="Connection lost. Inverted full-bleed state with ECG motif, last-sync timestamp, 'still usable' list of cached features. Compact variant truncates below the fold."
        variants={[
          { label: 'offline', Comp: S83_Offline },
          { label: 'compact', Comp: S83b_Offline_Compact },
        ]} />
      <PhoneRow idx={84} title="server error · 5xx"
        subtitle="Backend down. Incident ID displayed for support, auto-retry countdown, 'it's not you' copy. Compact variant for minor routes."
        variants={[
          { label: 'error', Comp: S84_Server_Error },
          { label: 'compact', Comp: S84b_Server_Error_Compact },
        ]} />
      <PhoneRow idx={85} title="maintenance · planned"
        subtitle="Downtime window. ETA clock, per-subsystem status, notify-me signup. Compact variant for mid-session interstitial."
        variants={[
          { label: 'maint', Comp: S85_Maintenance },
          { label: 'compact', Comp: S85b_Maintenance_Compact },
        ]} />
      <PhoneRow idx={86} title="version · force update"
        subtitle="App Store redirect surface. Current vs required badges, what's-new tile, cannot-continue lock."
        variants={[{ label: 'update', Comp: S86_Force_Update }]} />

      {/* ── PHASE 16 · AUTH + MISSING ACTIVES (S87–S107) ──────── */}
      <div style={{ padding: '60px 60px 36px', maxWidth: 1100 }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase',
          color: 'rgba(40,30,20,0.6)', marginBottom: 10,
        }}>
          /// atlas.core · auth + active surfaces · phase 16
        </div>
        <h2 style={{
          margin: 0, fontFamily: '"Archivo Black", sans-serif',
          fontSize: 72, letterSpacing: -3, lineHeight: 0.9,
          color: 'rgba(15,10,5,0.94)', textTransform: 'lowercase',
        }}>
          the doors<br/>and the <span style={{ background: 'black', color: 'white', padding: '0 10px' }}>day one</span>.
        </h2>
        <p style={{ margin: '18px 0 0', fontSize: 15, lineHeight: 1.6, color: 'rgba(40,30,20,0.8)', maxWidth: 760 }}>
          Twenty-one screens: the full auth loop (magic code, not passwords), plus the high-frequency daily
          surfaces that had been missing — focus mode, ledger, celebrations, insights digest, coach home,
          search, meal plans, body check-in, account hub, subscription controls.
        </p>
      </div>

      <PhoneRow idx={87} title="sign in · email"
        subtitle="One-field login. Giant email typed in, 'we don't use passwords' card, OS sign-in alternates below the fold, clean send-code CTA."
        variants={[{ label: 'login', Comp: S87_Login }]} />
      <PhoneRow idx={88} title="magic code · enter"
        subtitle="6-digit code input with position cursor on pos-4, delivery status card, resend timer, 'paste from clipboard' hint."
        variants={[{ label: 'code', Comp: S88_Magic_Link_Sent }]} />
      <PhoneRow idx={89} title="verifying · callback"
        subtitle="Inverted brand moment. Double-ring pulse around the wordmark, sign-in steps with active-blink indicator."
        variants={[{ label: 'verify', Comp: S89_Magic_Callback }]} />
      <PhoneRow idx={90} title="sign up · create account"
        subtitle="Two fields, big 'start your system' hero with inverted word treatment, trial benefits grid, no card required."
        variants={[{ label: 'signup', Comp: S90_Signup }]} />
      <PhoneRow idx={91} title="locked out · recover"
        subtitle="'No password to forget.' Three alternate verify paths (SMS, Apple ID, support) with accent border on available ones."
        variants={[{ label: 'forgot', Comp: S91_Forgot }]} />
      <PhoneRow idx={92} title="change login · email"
        subtitle="Two-step verify surface. Current + new email, accent-bordered 2-step explainer, 'what moves' summary card."
        variants={[{ label: 'change', Comp: S92_Reset }]} />
      <PhoneRow idx={93} title="focus mode · workout timer"
        subtitle="Inverted dark screen for eyes-up training. 140px half-filled rest timer, progress bar, next-set card with target RPE, 3-button bar."
        variants={[{ label: 'focus', Comp: S93_Focus_Mode }]} />
      <PhoneRow idx={94} title="the ledger · adherence"
        subtitle="Anti-streak surface. 'Missed days are data, not debt.' 53-week GitHub-style heatmap, 4 year-summary cards, 28-day grid."
        variants={[{ label: 'ledger', Comp: S94_Streak_Ledger }]} />
      <PhoneRow idx={95} title="celebrations · PR unlock"
        subtitle="New-high moment without confetti slop. Giant ECG watermark, 140px number, +lb delta badge, path-here ledger card."
        variants={[{ label: 'PR', Comp: S95_Celebrations }]} />
      <PhoneRow idx={96} title="insights · weekly digest"
        subtitle="Coach's reads list. One hero 'big one' card with inverted ECG strip, 5 tagged items, unread dots + time-to-read."
        variants={[{ label: 'digest', Comp: S96_Insights_Digest }]} />
      <PhoneRow idx={97} title="coach · home"
        subtitle="Full coach surface (not just chat). Today's read, 3-up signals, active thread with quick-reply chips, 'what I'm watching' list."
        variants={[{ label: 'coach', Comp: S97_Coach_Home }]} />
      <PhoneRow idx={98} title="nutrition · search"
        subtitle="Food database search. Live query with cursor, top-match inverted result card, 8-result list with per-result kcal right-rail."
        variants={[{ label: 'search', Comp: S98_Nutrition_Search }]} />
      <PhoneRow idx={99} title="meal plans · templates"
        subtitle="6 plan variants as radio list. Active plan as inverted hero card, 3-letter codes on each alternative, macro targets visible."
        variants={[{ label: 'plans', Comp: S99_Meal_Plans }]} />
      <PhoneRow idx={100} title="body check-in · 4-q quick"
        subtitle="Daily morning quick entry. Two answered items as collapsed chips, active question with chip-style multi-select, coach inference callout."
        variants={[{ label: 'check-in', Comp: S100_Body_Checkin }]} />
      <PhoneRow idx={101} title="weight · ruler variant"
        subtitle="Alternative to keypad. 120px number display, drag-ruler slider input, unit toggle (lb/kg/st), 7d moving avg card."
        variants={[{ label: 'ruler', Comp: S101_Weight_Entry_Slider }]} />
      <PhoneRow idx={102} title="weight · range compare"
        subtitle="Overlay two quarters. Range picker, overlaid line chart (fg + accent), 3-up delta summary on inverted ink card."
        variants={[{ label: 'compare', Comp: S102_Weight_Trend_Compare }]} />
      <PhoneRow idx={103} title="404 · not found"
        subtitle="160px number, ECG motif divider, 4 'try instead' links with /path mono, 'nothing broken on your side' copy."
        variants={[{ label: '404', Comp: S103_NotFound }]} />
      <PhoneRow idx={104} title="account · hub"
        subtitle="Dashboard-style entry point. Monogram avatar, pro annual badge, 3-up at-a-glance, 3 sectioned link groups with accent-flagged rows."
        variants={[{ label: 'account', Comp: S104_Account_Hub }]} />
      <PhoneRow idx={105} title="subscription · manage"
        subtitle="Current plan hero in ink, $180/yr + $15/mo-eff split, 3-tier change-plan picker with CURRENT badge, danger-zone cancel block."
        variants={[{ label: 'plan', Comp: S105_Subscription_Manage }]} />
      <PhoneRow idx={106} title="data · export"
        subtitle="Format picker (JSON / CSV / PDF), include-toggle grid with iOS switches, 3-up archive estimate card, signed-link email copy."
        variants={[{ label: 'export', Comp: S106_Data_Export }]} />
      <PhoneRow idx={107} title="progress photo · 3-angle capture"
        subtitle="Camera viewfinder with accent-corner crop marks, silhouette guide, 3-angle strip (front/side/back) with completed ticks, large shutter."
        variants={[{ label: 'photo', Comp: S107_Progress_Photo_Capture }]} />

      {/* ── PHASE 10 · TEMPLATE PACK (was phase 9) ────────────── */}
      <div style={{ padding: '60px 60px 36px', maxWidth: 1100 }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase',
          color: 'rgba(40,30,20,0.6)', marginBottom: 10,
        }}>
          /// atlas.core · templates · phase 10
        </div>
        <h2 style={{
          margin: 0, fontFamily: '"Archivo Black", sans-serif',
          fontSize: 72, letterSpacing: -3, lineHeight: 0.9,
          color: 'rgba(15,10,5,0.94)', textTransform: 'lowercase',
        }}>
          the template <span style={{ color: t.accent }}>pack</span>.<br/>
          <span style={{ background: 'black', color: 'white', padding: '0 10px' }}>everything around the app</span>.
        </h2>
        <p style={{ margin: '18px 0 0', fontSize: 15, lineHeight: 1.6, color: 'rgba(40,30,20,0.8)', maxWidth: 760 }}>
          The product UI is covered by the 50 screens above. This pack is the layer <em>around</em> it —
          app store, growth, lifecycle, marketing blocks. Every template reuses the same vocabulary:
          Archivo Black head, JetBrains Mono labels, SF Pro body, paper/ink/sulfur, ECG motif.
          Designed for a cheaper model to spin variants without breaking the system.
        </p>
      </div>

      {/* AUDIT + PRIORITY + HOW-TO-EXTEND */}
      <div style={{ padding: '0 60px 48px', maxWidth: 1100, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        {[
          {
            k: 'AUDIT',
            h: 'what existed',
            rows: [
              '✓ 50 product screens · 8 phases',
              '✓ brand sheet · heart mark',
              '✓ iOS frame · browser window',
              '✓ screens-lib atoms · palettes',
              '— — — — — — — — — — —',
              '✗ app store screenshots',
              '✗ social / ad creatives',
              '✗ lifecycle emails',
              '✗ marketing building blocks',
            ],
          },
          {
            k: 'PRIORITY',
            h: 'build order',
            rows: [
              '01 · APP STORE ┈ 7 boards',
              '   hero · 2 features · credibility · cta · rules',
              '02 · CREATIVES ┈ 12 boards',
              '   square · story · announce · carousel · stat',
              '03 · EMAIL ┈ 10 boards',
              '   welcome · auth · recap · labs · billing',
              '04 · BLOCKS ┈ 12 modules',
              '   hero · pricing · stats · chips · motifs',
            ],
          },
          {
            k: 'EXTEND',
            h: 'for a cheaper model',
            rows: [
              'hold: type pair · palette · grid · ECG',
              'swap: headline · kicker · body copy',
              'swap: phone mock · stat values',
              'swap: accent for color-of-week',
              'never: invent new type · gradients',
              'never: round corners over 0px',
              'never: emoji · stock photo · gym-bro',
              'export: 2× all creatives · PNG · sRGB',
            ],
          },
        ].map(({ k, h, rows }) => (
          <div key={k} style={{ padding: 20, background: t.ink, color: t.bg }}>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 3, color: t.accent }}>{k}</div>
            <div style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 22, letterSpacing: -0.6, marginTop: 6, textTransform: 'lowercase' }}>{h}</div>
            <div style={{ marginTop: 14, fontFamily: '"JetBrains Mono", monospace', fontSize: 11, lineHeight: 1.7, color: 'rgba(239,233,218,0.78)' }}>
              {rows.map((r, i) => <div key={i}>{r}</div>)}
            </div>
          </div>
        ))}
      </div>

      {/* A · APP STORE SCREENSHOTS */}
      <DCSection
        title="A · app store · screenshot set"
        subtitle="6 screenshots + 1 rules card. Designed at 1290×2796 half-scale (645×1398). Export 2× for submission. Anatomy card codifies the 6 slots so a cheaper model can spin variants without drift."
      >
        <AS_Cover/>
        <AS_Feature_Workout/>
        <AS_Feature_Labs/>
        <AS_Feature_Coach/>
        <AS_Credibility/>
        <AS_Closer/>
        <AS_LayoutRules/>
      </DCSection>

      {/* B · CREATIVE / MARKETING */}
      <DCSection
        title="B · creatives · social + ads"
        subtitle="12 boards across 3 aspect ratios. 1:1 square (1080), 9:16 story/reel, 4:5 carousel. Copy structure for each: KICKER → HEAD (2–3 lines) → optional sub → brand footer. Every board uses one palette + one type pair."
      >
        <M_SquareAd/>
        <M_SquareAlt/>
        <M_Story/>
        <M_FeatureAnnounce/>
        <M_Teaser/>
        <M_Testimonial/>
        <M_Launch/>
        <M_CarouselCover/>
        <M_CarouselSlide/>
        <M_StatCard/>
        <M_Comparison/>
        <M_Manifesto/>
      </DCSection>

      {/* C · EMAIL TEMPLATES */}
      <DCSection
        title="C · email · lifecycle + transactional"
        subtitle="10 emails at 560px render width. Same masthead on every template: accent rule → wordmark + system label → mono preheader. CTAs are square ink buttons. Receipts and auth use monospace for data. All legal/unsub in the footer."
      >
        <E_Welcome/>
        <E_MagicCode/>
        <E_Onboarding/>
        <E_WeeklyRecap/>
        <E_WorkoutSummary/>
        <E_Labs/>
        <E_TrialEnding/>
        <E_Upgrade/>
        <E_Receipt/>
        <E_Winback/>
      </DCSection>

      {/* D · BUILDING BLOCKS */}
      <DCSection
        title="D · blocks · marketing kit"
        subtitle="12 composable modules for landing pages, decks, emails. Sized at realistic handoff widths (720–960). Mix-and-match — any block drops into a web layout or PDF export unchanged."
      >
        <B_DeviceWrapper/>
        <B_BrowserWrapper/>
        <B_SectionHeader/>
        <B_CTAStrip/>
        <B_StatCards/>
        <B_FeatureCards/>
        <B_Pricing/>
        <B_CompareBlock/>
        <B_QuoteBlock/>
        <B_Chips/>
        <B_Stickers/>
        <B_Textures/>
      </DCSection>

      {/* Footer note */}
      <div style={{ padding: '0 60px 80px', maxWidth: 900 }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 3,
          textTransform: 'uppercase', color: 'rgba(40,30,20,0.6)', marginBottom: 10,
        }}>
          /// done · 60 screens · 10 phases · 41 templates
        </div>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: 'rgba(40,30,20,0.85)' }}>
          60 product screens + 41 templates across 10 phases. One system throughout: Archivo Black for brand,
          SF Pro for UI, JetBrains Mono for data; paper + ink + sulfur; ECG as the motif that binds it all.
          The template pack is the handoff layer — a cheaper model can now generate resizes,
          audience-specific copy, and seasonal variants without breaking the rules encoded in the layout cards.
        </p>
      </div>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

// Mount the splash replay button in its own root once splash.jsx has loaded.
// splash.jsx self-boots and exposes window.AtlasSplash.ReplayButton.
(function mountReplay() {
  if (!window.AtlasSplash) return setTimeout(mountReplay, 60);
  const host = document.createElement('div');
  host.id = '__atlas_replay_host';
  document.body.appendChild(host);
  ReactDOM.createRoot(host).render(<window.AtlasSplash.ReplayButton />);
})();
