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

      {/* ── PHASE 9 — PRODUCTION INVENTORY APPENDIX ─────────────── */}
      <div style={{ padding: '40px 60px 48px', maxWidth: 1100 }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase',
          color: 'rgba(40,30,20,0.6)', marginBottom: 10,
        }}>
          /// atlas.core · app · phase 09 · appendix
        </div>
        <h2 style={{
          margin: 0, fontFamily: '"Archivo Black", sans-serif',
          fontSize: 72, letterSpacing: -3, lineHeight: 0.9,
          color: 'rgba(15,10,5,0.94)', textTransform: 'lowercase',
        }}>
          production <span style={{ color: t.accent }}>+</span><br/>
          <span style={{ background: 'black', color: 'white', padding: '0 10px' }}>inventory</span>.
        </h2>
        <p style={{ margin: '18px 0 0', fontSize: 15, lineHeight: 1.6, color: 'rgba(40,30,20,0.8)', maxWidth: 720 }}>
          Every screen, layout, loading state, overlay, and primitive that ships in the live app —
          indexed for discoverability. Phases 1–8 show canvas artboards; this appendix is the map
          of what actually exists in <code>src/</code>. Grouped by category, one line each.
        </p>
      </div>

      <ProdInventory t={t} />

      {/* Footer note */}
      <div style={{ padding: '0 60px 80px', maxWidth: 900 }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 3,
          textTransform: 'uppercase', color: 'rgba(40,30,20,0.6)', marginBottom: 10,
        }}>
          /// done · 50 canvas screens · 8 phases · + production inventory
        </div>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: 'rgba(40,30,20,0.85)' }}>
          50 screens across 8 phases — core loop, onboarding + coach, body + biology,
          perimeter, programs + crew, bookends + companions, edges + web, and the protocols stack.
          Plus a full production inventory in phase 09 covering every route, layout, loading state,
          overlay, and AC* primitive that ships in the live app. All in light + dark, built on one system:
          Archivo Black for brand, SF Pro for UI, SF Mono for data; paper + ink + sulfur;
          ECG as the motif that binds it all.
        </p>
      </div>
    </DesignCanvas>
  );
}

// ── Production inventory ─────────────────────────────────────────────────
// Every screen, layout, loading state, overlay, and reusable primitive
// that ships in the live app under src/. Grouped for discoverability.
const INVENTORY = {
  'v3 routes (public web + shell entries)': [
    ['V3Landing', 'Public marketing landing — hero, ECG, features, pricing echo, footer.'],
    ['V3MethodPage', 'Marketing: the method / system explainer page.'],
    ['V3LabsPage', 'Marketing: labs product page.'],
    ['V3AppPage', 'Marketing: the-app product page.'],
    ['V3PricingPage', 'Marketing: pricing tiers + FAQ.'],
    ['V3Manifesto', 'Manifesto / about moment with poster-scale type.'],
    ['V3Welcome', 'Welcome / splash entry for mobile auth flow.'],
    ['V3Terms', 'Legal: terms of service.'],
    ['V3Privacy', 'Legal: privacy policy.'],
    ['V3DownloadApp', 'Public-web redirect target: QR + App Store badges.'],
    ['V3WebAppEntry', 'Post-purchase web app bridge.'],
    ['V3WebPurchaseSuccess', 'Web checkout success confirmation.'],
    ['V3AuthLogin', 'Sign in — email + magic, Apple / Google fallback.'],
    ['V3AuthSignup', 'Sign up — create account, handoff to onboarding.'],
    ['V3ForgotPassword', 'Password reset request form.'],
    ['V3ResetPassword', 'Password reset completion form (with token).'],
    ['V3MagicLinkSent', 'Magic link confirmation intermediate screen.'],
    ['V3AuthCallback', 'OAuth / magic link callback handler with spinner.'],
    ['V3Today', 'Today tab — readiness ring, session card, fuel + weight tiles, coach strip.'],
    ['V3Train', 'Train tab — routines, history, active-session launcher.'],
    ['V3Eat', 'Eat tab — macros hero, meal ledger, quick capture row.'],
    ['V3Body', 'Body tab — composition, measurements, progress photos launcher.'],
    ['V3You', 'You tab — profile, achievements, preferences overview.'],
    ['V3Settings', 'Settings hub — account, integrations, preferences, data & privacy.'],
    ['V3CoachHome', 'Coach home — morning brief hero + insights list.'],
    ['V3CoachChat', 'Live AI coach thread with suggestion chips.'],
    ['V3ExerciseLibrary', 'Searchable exercise directory with filters.'],
    ['V3ExerciseDetail', 'Single-lift deep-dive: 1RM trend, cues, variants.'],
    ['V3RoutineDetail', 'Program / routine detail with schedule + commit CTA.'],
    ['V3Labs', 'Labs inbox — chronological panels with flags.'],
    ['V3BiomarkerDetail', 'Biomarker deep-dive: band, 24mo trend, protocols, coach note.'],
    ['V3NutritionSearch', 'Food + barcode + recent search fullscreen.'],
    ['V3Notifications', 'Signals inbox + granular notification preferences.'],
    ['V3ProgressPhotos', 'Progress photos compare hero + monthly grid.'],
    ['V3WeeklyReview', 'Sunday recap zine — daily bars, moments feed.'],
    ['V3Paywall', 'Trial / subscription paywall with plan comparison.'],
    ['V3AccountHub', 'Web account management landing (full-width).'],
    ['V3DataExport', 'Request + download user data export.'],
    ['V3BillingHistory', 'Invoice history list with download links.'],
    ['V3SubscriptionManage', 'Manage subscription — plan, payment, cancel.'],
    ['V3NotFound', '404 not found — ECG flatline, return-home CTA.'],
    ['V3LoadingSplash', 'Eager splash / Suspense fallback for boot + sync phases.'],
    ['V3OnboardingRoutes', 'Module: exports identity/goal/activity/plan/permissions v3 steps.'],
  ],
  'v3 canvas screens (S1–S50 source of truth)': [
    ['S1_Splash_A / S1_Splash_B', 'Welcome + manifesto variants.'],
    ['S2_Today_A', 'Today — readiness ring canvas.'],
    ['S3_Workout_A', 'Active workout logging.'],
    ['S4_Nutrition_A', 'Nutrition fuel ledger.'],
    ['S5_Paywall_A / S5_Paywall_B', 'Trial plans + post-PR upgrade moments.'],
    ['S6_Weight_A / S6_Weight_B', 'Bodyweight trend + entry keypad.'],
    ['S7–S11', 'Onboarding: identity, goal, activity, plan, permissions.'],
    ['S12 / S13', 'Coach chat + daily brief.'],
    ['S14–S18', 'Body dashboard, labs inbox, biomarker, measurements, photos.'],
    ['S19–S23', 'Settings, PR gallery, share card, notifications, empty states.'],
    ['S24–S28', 'Library, program 5/3/1, calendar, exercise, crew.'],
    ['S29–S35', 'Workout summary, weekly recap, sleep, capture, profile, watch, search.'],
    ['S36–S41', 'Auth, inbox, food detail, recipe, billing, error edges.'],
    ['S42', 'Web landing (desktop, no phone frame).'],
    ['S43–S50', 'Protocols: home, empty/locked, detail, form, picker, log dose, timeline, today-complete.'],
  ],
  'v2 screens still mounted in src/App.jsx': [
    ['OnboardingWorkout', 'Onboarding: workout preference (days/week, equipment).'],
    ['OnboardingHabits', 'Onboarding: habits + behavioural anchors.'],
    ['OnboardingConstraints', 'Onboarding: injuries, dietary + schedule constraints.'],
    ['OnboardingSummary', 'Onboarding: computed plan summary before paywall.'],
    ['OnboardingPaywall', 'Onboarding paywall (RevenueCat gated).'],
    ['OnboardingTour', 'Onboarding: post-trial feature tour.'],
    ['SmartOnboarding', 'Alt AI-guided onboarding flow.'],
    ['FoodDetail', 'Logged meal deep-dive with macro edit.'],
    ['PhotoScan', 'Camera capture for meal photo log.'],
    ['PhotoScanConfirm', 'Photo scan detection confirmation + edit items.'],
    ['VoiceLog', 'Voice meal log with transcript parsing.'],
    ['FoodDiary', 'Full-day food diary timeline.'],
    ['MacroTargets', 'Macro / calorie target editor.'],
    ['WaterLog', 'Water intake log with preset quick-adds.'],
    ['MealPlans', 'Saved meal plans index.'],
    ['MealDetail', 'Meal plan detail.'],
    ['CustomFood', 'Create custom food entry.'],
    ['ActiveWorkout', 'Live workout logger (Hevy-style).'],
    ['ExerciseLibrary (v2)', 'Exercise picker modal (used by ManualWorkoutPlan).'],
    ['RoutinePresets', 'Preset routines catalog.'],
    ['RoutinePresetDetail', 'Preset routine detail + clone CTA.'],
    ['WorkoutDetail', 'Session / template detail view.'],
    ['WorkoutHistory', 'Recent sessions list + stats strip.'],
    ['ManualWorkoutPlan', 'Build a routine manually with picker overlay.'],
    ['CoachInsightDetail', 'Single coach-insight deep-dive.'],
    ['BodyCheckIn', 'Weekly body check-in multi-field form.'],
    ['BodyCompositionHistory', 'Weight + composition history chart.'],
    ['ProgressComparison', 'Side-by-side progress photo compare.'],
    ['ProfileEditor', 'Edit profile — name, DOB, height, bio, avatar.'],
    ['AccountSettings', 'Email, password, 2FA, sessions, unlink providers.'],
    ['Integrations', 'HealthKit / Google Fit / wearables connection status.'],
    ['DangerZone', 'Export, reset, delete account.'],
    ['Insights', 'Today insights feed (premium-gated).'],
    ['Diary', 'Personal journal with mood + metrics.'],
    ['FocusMode', 'Distraction-free today focus screen.'],
    ['StreaksDetail', 'Anti-streak detail view (calendar without guilt).'],
    ['Celebrations', 'Celebration moment screen (PR, milestone kinds).'],
    ['LabExamDetail', 'Full lab exam detail with all biomarkers.'],
    ['LabUpload', 'Upload lab PDF → parse pipeline.'],
    ['LabHistory', 'Chronological lab exam list.'],
    ['SocialFeed', 'Social feed of friends activity.'],
    ['Friends', 'Friends list + search.'],
    ['ShareWorkout', 'Share a workout summary externally.'],
    ['Follow', 'Follow / discover users.'],
    ['PublicProfile', 'Public profile @username (no shell).'],
  ],
  'layouts + shells': [
    ['V3AppShell', 'Authed bottom-tab shell — today / train / eat / body / you.'],
    ['V3StandaloneLayout', 'Fullscreen standalone flow wrapper (no tab bar).'],
    ['V3MarketingLayout', 'Public web marketing layout — nav + footer.'],
    ['redesign/layouts/AppShell', 'Legacy v1 redesign AppShell (kept for migration).'],
    ['redesign/layouts/nav', 'Legacy v1 redesign nav config.'],
    ['v2/layouts/AppShell', 'v2 AppShell used by v2-mounted routes.'],
    ['v2/layouts/AuthShell', 'v2 AuthShell wrapping login / signup / reset.'],
    ['v2/onboarding/OnboardingShell', 'Onboarding multi-step wrapper with progress.'],
    ['v2/marketing/MarketingShell', 'Legacy marketing shell (replaced by V3MarketingLayout).'],
    ['components/app/AppShell', 'Top-level app shell with providers + chrome.'],
    ['components/app/AppBootstrap', 'First-paint bootstrap + chunk-reload guard.'],
    ['components/app/MobileFormLayout', 'Mobile form layout primitive.'],
  ],
  'loading + splash states': [
    ['V3LoadingSplash', 'Primary splash — boot + syncing phases, ECG spinner.'],
    ['V2 Splash', 'Legacy auth splash (v2/auth/Splash.jsx).'],
    ['Suspense fallback', 'React.Suspense lazy-loader — wraps V3LoadingSplash in App.jsx.'],
    ['DailyCheckinGate', 'Gate screen before today tab if check-in pending.'],
  ],
  'auth screens': [
    ['V3AuthLogin', 'Primary login (email + OAuth).'],
    ['V3AuthSignup', 'Primary signup.'],
    ['V3ForgotPassword', 'Primary password-reset request.'],
    ['V3ResetPassword', 'Primary password-reset completion.'],
    ['V3MagicLinkSent', 'Magic link sent confirmation.'],
    ['V3AuthCallback', 'OAuth / magic link callback.'],
    ['V3Welcome', 'Pre-auth welcome (mobile entry).'],
    ['v2/auth/Login', 'Legacy v2 login (not mounted, kept for migration).'],
    ['v2/auth/Signup', 'Legacy v2 signup.'],
    ['v2/auth/ForgotPassword', 'Legacy v2 forgot.'],
    ['v2/auth/ResetPassword', 'Legacy v2 reset.'],
    ['v2/auth/MagicLinkSent', 'Legacy v2 magic-link.'],
    ['v2/auth/Welcome', 'Legacy v2 welcome.'],
    ['v2/auth/_AuthPrimitives', 'Shared auth input / button primitives.'],
  ],
  'onboarding screens': [
    ['V3OnboardingIdentity', 'Step 1 — sex, age, height.'],
    ['V3OnboardingGoal', 'Step 2 — goal archetype.'],
    ['V3OnboardingActivity', 'Step 3 — activity ladder + TDEE.'],
    ['V3OnboardingPlan', 'Step 4 — computed plan preview.'],
    ['V3OnboardingPermissions', 'Step 5 — HealthKit + notifications.'],
    ['OnboardingWorkout', 'v2 step — workout preference.'],
    ['OnboardingHabits', 'v2 step — habits.'],
    ['OnboardingConstraints', 'v2 step — constraints.'],
    ['OnboardingSummary', 'v2 step — summary.'],
    ['OnboardingPaywall', 'v2 step — paywall.'],
    ['OnboardingTour', 'v2 step — post-trial tour.'],
    ['SmartOnboarding', 'v2 alt AI-guided flow.'],
    ['OnboardingRoot', 'v2 root router for legacy flow.'],
    ['OnboardingShell', 'Shared shell with progress dots.'],
    ['OnboardingGoal / Stats / Diet / Activity (v2)', 'Legacy v2 steps (superseded by v3).'],
  ],
  'overlays + modals + dialogs': [
    ['ResetAccountDialog', 'Confirm destructive reset with typed-match gate.'],
    ['ResponsiveModal', 'Responsive modal primitive (sheet on mobile, dialog on web).'],
    ['redesign/overlays/index', 'Overlays registry (currently only ResetAccountDialog).'],
    ['v2/overlays (empty)', 'Reserved directory for future v2 overlays.'],
    ['ExerciseLibrary picker', 'ManualWorkoutPlan overlay — full-screen exercise picker.'],
    ['Sonner toaster', 'Global toast container (from sonner).'],
    ['toast()', 'todoToast helper for "coming soon" placeholders.'],
    ['window.confirm', 'Native confirm for destructive discard actions.'],
  ],
  'error + system screens': [
    ['Offline', 'Offline — local queue readout, retry CTA.'],
    ['Maintenance', 'Scheduled maintenance splash.'],
    ['ForceUpdate', 'Force-update required gate.'],
    ['ServerError (500)', 'Server error — ECG flatline motif.'],
    ['V3NotFound (404)', 'Primary 404 catch-all.'],
    ['v2 NotFound', 'Legacy 404 (unmounted).'],
    ['ComingSoon', 'Placeholder for routes pending wiring.'],
    ['AppDiagnostics', 'Diagnostics panel for dev / support.'],
    ['NotificationsCenter', 'Legacy v2 notifications center (superseded by V3Notifications).'],
  ],
  'AC* + IOS* primitives (canvas lib)': [
    ['ACFonts / ACRadii', 'Font + radius design tokens.'],
    ['ACDot', 'Status dot with color + size.'],
    ['ACLabel', 'Uppercase JetBrains Mono label with tracking.'],
    ['ACMono', 'Tabular mono text for data.'],
    ['ACNum', 'Large tabular number display.'],
    ['ACBtn', 'Button — primary/secondary, pill, block, sizes.'],
    ['ACSpark', 'Sparkline SVG with last-point highlight.'],
    ['ACRing', 'Progress ring (readiness hero).'],
    ['ACBars', 'Bar-chart primitive for daily / weekly strips.'],
    ['ACLine', 'Line chart primitive.'],
    ['ACChip', 'Chip / pill with optional dot + accent.'],
    ['ACTabBar', 'Bottom tab bar (today / train / eat / body / you).'],
    ['ACHeader', 'Screen header — title + sub + trailing.'],
    ['ACBrand', 'Atlas wordmark at brand scale.'],
    ['ACScreen', 'Phone artboard frame wrapping a screen component.'],
    ['IOSStatusBar', '9:41 status bar with signal / wifi / battery.'],
    ['IOSGlassPill', 'Liquid-glass pill container.'],
    ['IOSNavBar', 'iOS nav bar with back + trailing icon.'],
    ['IOSListRow', 'iOS grouped list row.'],
    ['IOSList', 'iOS grouped list wrapper with header.'],
    ['IOSDevice', 'iPhone hardware frame for canvas.'],
    ['IOSKeyboard', 'iOS keyboard drawing for entry states.'],
  ],
};

function ProdInventory({ t }) {
  return (
    <div style={{ padding: '0 60px 40px', maxWidth: 1100 }}>
      {Object.entries(INVENTORY).map(([group, items]) => (
        <div key={group} style={{ marginBottom: 48 }}>
          <div style={{
            display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 14,
            paddingBottom: 8, borderBottom: '1px solid rgba(40,30,20,0.18)',
          }}>
            <span style={{
              fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 3,
              color: 'rgba(60,50,40,0.55)', textTransform: 'uppercase',
            }}>
              {String(Object.keys(INVENTORY).indexOf(group) + 1).padStart(2, '0')}
            </span>
            <span style={{
              fontFamily: '"Archivo Black", sans-serif', fontSize: 22,
              letterSpacing: -0.8, color: 'rgba(15,10,5,0.92)', textTransform: 'lowercase',
            }}>
              {group.split(' ')[0]} <span style={{ color: t.accent }}>+</span>{' '}
              {group.split(' ').slice(1).join(' ')}
            </span>
            <span style={{
              marginLeft: 'auto',
              fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 2,
              color: 'rgba(60,50,40,0.55)', textTransform: 'uppercase',
            }}>
              {items.length} entries
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', rowGap: 6, columnGap: 20 }}>
            {items.map(([name, desc]) => (
              <React.Fragment key={name}>
                <div style={{
                  fontFamily: '"JetBrains Mono", monospace', fontSize: 11,
                  color: 'rgba(15,10,5,0.88)', letterSpacing: 0.2,
                  fontWeight: 600,
                }}>{name}</div>
                <div style={{
                  fontSize: 13, lineHeight: 1.55, color: 'rgba(40,30,20,0.78)',
                }}>{desc}</div>
              </React.Fragment>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
