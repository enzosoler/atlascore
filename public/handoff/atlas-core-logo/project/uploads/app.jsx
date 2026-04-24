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

      {/* ── PHASE 9 · TEMPLATE PACK ──────────────────────────────── */}
      <div style={{ padding: '60px 60px 36px', maxWidth: 1100 }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase',
          color: 'rgba(40,30,20,0.6)', marginBottom: 10,
        }}>
          /// atlas.core · templates · phase 09
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
          /// done · 50 screens · 9 phases · 41 templates
        </div>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: 'rgba(40,30,20,0.85)' }}>
          50 product screens + 41 templates across 9 phases. One system throughout: Archivo Black for brand,
          SF Pro for UI, JetBrains Mono for data; paper + ink + sulfur; ECG as the motif that binds it all.
          The template pack is the handoff layer — a cheaper model can now generate resizes,
          audience-specific copy, and seasonal variants without breaking the rules encoded in the layout cards.
        </p>
      </div>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
