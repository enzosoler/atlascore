/**
 * v3 gallery — walks through every translated screen from the Claude Design
 * canvas in light + dark, grouped by phase. Mount at `/v3` in the app to
 * review progress before flipping the production screens over to v3.
 *
 * Mirrors the original atlas-core/app.jsx canvas layout, but wired to live
 * React components instead of window-globals.
 */

import React from 'react';
import IOSFrame from './IOSFrame.jsx';
import { PaperThemeProvider, ACFonts } from '../lib/paper.jsx';
import * as Screens from '../screens/index.js';

const PHASES = [
  {
    n: 1,
    title: 'core loop',
    blurb:
      'Six screens from the core loop — welcome, today, active workout, nutrition, paywall, bodyweight.',
    rows: [
      {
        idx: 1,
        title: 'splash / welcome',
        subtitle:
          'Two coexisting entry points. Welcome — Duolingo-energy hero for first open. Manifesto — about/brand moment with ECG divider.',
        variants: [
          { label: 'welcome',   Comp: Screens.S1_Splash_A },
          { label: 'manifesto', Comp: Screens.S1_Splash_B },
        ],
      },
      {
        idx: 2,
        title: 'today · readiness',
        subtitle:
          'Readiness ring hero + session card + fuel/weight tiles + coach strip.',
        variants: [{ label: 'today', Comp: Screens.S2_Today_A }],
      },
      {
        idx: 3,
        title: 'workout · active session',
        subtitle:
          'Hevy-style logging: progress bar, current-set card with RPE, queued exercises below.',
        variants: [{ label: 'workout', Comp: Screens.S3_Workout_A }],
      },
      {
        idx: 4,
        title: 'nutrition · fuel',
        subtitle:
          'Day ledger with macros hero, meal sections, quick-capture row at the top.',
        variants: [{ label: 'fuel', Comp: Screens.S4_Nutrition_A }],
      },
      {
        idx: 5,
        title: 'paywall · trial gate',
        subtitle:
          'Plans — Cal AI-style trial comparison. PR moment — post-record upgrade pitch.',
        variants: [
          { label: 'plans',     Comp: Screens.S5_Paywall_A },
          { label: 'pr moment', Comp: Screens.S5_Paywall_B },
        ],
      },
      {
        idx: 6,
        title: 'bodyweight · trend & entry',
        subtitle:
          'Trend — MacroFactor/Happy Scale view with 7-day moving average. Entry — giant number + full number pad.',
        variants: [
          { label: 'trend', Comp: Screens.S6_Weight_A },
          { label: 'entry', Comp: Screens.S6_Weight_B },
        ],
      },
    ],
  },
  {
    n: 2,
    title: 'onboarding + the coach',
    blurb:
      'Five-step onboarding (identity → goal → activity → plan preview → permissions), plus two AI coach surfaces — live chat and the morning daily brief.',
    rows: [
      { idx: 7,  title: 'onboarding · identity',    subtitle: 'Sex, age, height. Used for calorie + macro math.',            variants: [{ label: 'identity',  Comp: Screens.S7_Onboard_Identity }] },
      { idx: 8,  title: 'onboarding · goal',        subtitle: 'Four archetypes: lose, recomp, maintain, build.',             variants: [{ label: 'goal',      Comp: Screens.S8_Onboard_Goal }] },
      { idx: 9,  title: 'onboarding · activity',    subtitle: 'Sedentary → athletic on a 5-step ladder, with TDEE exposed.', variants: [{ label: 'activity',  Comp: Screens.S9_Onboard_Activity }] },
      { idx: 10, title: 'onboarding · plan preview',subtitle: 'Calculated daily target — kcal + macro split + projected trend.', variants: [{ label: 'plan', Comp: Screens.S10_Onboard_Plan }] },
      { idx: 11, title: 'onboarding · connect',     subtitle: 'HealthKit, notifications, optional wearable. Privacy-forward copy.', variants: [{ label: 'connect', Comp: Screens.S11_Onboard_Permissions }] },
      { idx: 12, title: 'coach · chat',             subtitle: 'Live AI coach thread with suggestion cards and quick-reply chips.', variants: [{ label: 'chat',    Comp: Screens.S12_Coach_Chat }] },
      { idx: 13, title: 'coach · daily brief',      subtitle: 'Morning summary. Readiness hero, three-move plan, 14d signal strip.', variants: [{ label: 'brief', Comp: Screens.S13_Coach_Brief }] },
    ],
  },
  {
    n: 3,
    title: 'body + biology',
    blurb:
      'Five screens for the deeper body layer — composition dashboard, lab results inbox, biomarker deep-dive (ApoB), measurements entry, progress photos.',
    rows: [
      { idx: 14, title: 'body · dashboard',        subtitle: 'Hero + BF%/lean/waist tiles + silhouette + inbox teaser.',    variants: [{ label: 'body',  Comp: Screens.S14_Body_Dashboard }] },
      { idx: 15, title: 'labs · inbox',            subtitle: 'Chronological panel list with optimal/elevated/low flags.',  variants: [{ label: 'labs',  Comp: Screens.S15_Labs_Inbox }] },
      { idx: 16, title: 'biomarker · detail',      subtitle: 'ApoB deep-dive. Current vs optimal, 24-month trend, drivers.',variants: [{ label: 'apob',  Comp: Screens.S16_Biomarker_Detail }] },
      { idx: 17, title: 'measurements · entry',    subtitle: 'Giant tabular number, pill tabs, mini trend, numeric keypad.',variants: [{ label: 'entry', Comp: Screens.S17_Measurements_Entry }] },
      { idx: 18, title: 'progress · photos',       subtitle: 'Nov → Apr compare hero, grid of 6 months. On-device only.',  variants: [{ label: 'photos',Comp: Screens.S18_Progress_Photos }] },
    ],
  },
  {
    n: 4,
    title: 'settings + the edges',
    blurb:
      'Five screens for the perimeter — settings, PR gallery, shareable PR card, notifications, empty/edge states.',
    rows: [
      { idx: 19, title: 'settings · system',         subtitle: 'Account, integrations, preferences, data & privacy.',       variants: [{ label: 'settings',Comp: Screens.S19_Settings }] },
      { idx: 20, title: 'PR · gallery',              subtitle: 'Personal records as a wall. Filter chips by lift family.',  variants: [{ label: 'wall',   Comp: Screens.S20_PR_Gallery }] },
      { idx: 21, title: 'PR · share card',           subtitle: 'Post-PR share moment, 9:16 aspect, ECG divider, watermark.',variants: [{ label: 'share',  Comp: Screens.S21_Share_Card }] },
      { idx: 22, title: 'notifications · inbox + prefs',subtitle: 'Recent alerts + granular toggles. No streaks, no guilt.',variants: [{ label: 'notifs', Comp: Screens.S22_Notifications }] },
      { idx: 23, title: 'states · empty & edges',    subtitle: 'First-run, no-data, offline — tested at the rough edges.',  variants: [{ label: 'states', Comp: Screens.S23_Empty_States }] },
    ],
  },
  {
    n: 5,
    title: 'library + training',
    blurb:
      'Training catalog, program detail, calendar, exercise detail, and the crew surface for the human layer.',
    rows: [
      { idx: 24, title: 'library',           subtitle: 'Program catalog with trainer-led + algorithmic picks.',   variants: [{ label: 'library',  Comp: Screens.S24_Library }] },
      { idx: 25, title: 'program detail',    subtitle: 'Volume/intensity chart, week-by-week, progression notes.',variants: [{ label: 'program',  Comp: Screens.S25_Program_Detail }] },
      { idx: 26, title: 'calendar',          subtitle: 'Month view with session type chips + load heatmap.',      variants: [{ label: 'calendar', Comp: Screens.S26_Calendar }] },
      { idx: 27, title: 'exercise detail',   subtitle: 'Muscle map, cues, e1RM trend, recent sets, variations.',  variants: [{ label: 'exercise', Comp: Screens.S27_Exercise_Detail }] },
      { idx: 28, title: 'crew',              subtitle: 'Lightweight social surface. No metrics arms race.',       variants: [{ label: 'crew',     Comp: Screens.S28_Crew }] },
    ],
  },
  {
    n: 6,
    title: 'summary + watch + search',
    blurb:
      'Post-session summary, weekly zine, sleep deep-dive, capture modes, profile, Apple Watch companion, and global search.',
    rows: [
      { idx: 29, title: 'workout · summary',subtitle: 'Post-session tonnage, lift log, next-up card.',             variants: [{ label: 'summary',  Comp: Screens.S29_Workout_Summary }] },
      { idx: 30, title: 'weekly · recap',   subtitle: 'Zine/poster on ink. Archivo Black moments, shareable.',      variants: [{ label: 'recap',    Comp: Screens.S30_Weekly_Recap }] },
      { idx: 31, title: 'sleep · detail',   subtitle: 'Stages timeline, HRV/RHR/RESP/TEMP strips.',                 variants: [{ label: 'sleep',    Comp: Screens.S31_Sleep_Detail }] },
      { idx: 32, title: 'capture · quick',  subtitle: '3-mode switcher — scan / camera / voice. The fast path.',   variants: [{ label: 'capture',  Comp: Screens.S32_Capture }] },
      { idx: 33, title: 'you · profile',    subtitle: 'Inverted hero, Big 4 grid, program strip, composition line.',variants: [{ label: 'profile',  Comp: Screens.S33_Profile }] },
      { idx: 34, title: 'watch · companion',subtitle: 'Apple Watch face preview + mirror configuration.',          variants: [{ label: 'watch',    Comp: Screens.S34_Watch }] },
      { idx: 35, title: 'search · global',  subtitle: 'Query box + scope chips + top-match hero + grouped results.',variants: [{ label: 'search',   Comp: Screens.S35_Search }] },
    ],
  },
  {
    n: 7,
    title: 'auth + food + web',
    blurb:
      'Auth flows, food detail & recipe builder, billing, errors, and the marketing landing page.',
    rows: [
      { idx: 36, title: 'auth · login/signup',    subtitle: 'Email + social auth, magic link, password reset.',              variants: [{ label: 'auth',    Comp: Screens.S36_Auth }] },
      { idx: 37, title: 'inbox · signals',        subtitle: 'Coach, plan, labs, crew — no streak, no guilt, just signals.', variants: [{ label: 'inbox',   Comp: Screens.S37_Inbox }] },
      { idx: 38, title: 'food · detail',         subtitle: 'Macro hero, item list, micronutrients, source badge.',        variants: [{ label: 'detail',  Comp: Screens.S38_Food_Detail }] },
      { idx: 39, title: 'recipe · builder',       subtitle: 'Ingredient stack, summary strip, options toggles.',           variants: [{ label: 'builder', Comp: Screens.S39_Recipe_Builder }] },
      { idx: 40, title: 'billing · subscription', subtitle: 'Plan hero, perks, payment, invoices, upgrade CTA.',          variants: [{ label: 'billing', Comp: Screens.S40_Billing }] },
      { idx: 41, title: 'errors · edge states',   subtitle: 'Sync conflict, 500, rate limit, offline queue.',             variants: [{ label: 'errors',  Comp: Screens.S41_Errors }] },
      { idx: 42, title: 'web · landing',           subtitle: 'Desktop poster marketing page. Always light.',                  variants: [{ label: 'landing', Comp: Screens.S42_Web_Landing }] },
    ],
  },
  {
    n: 8,
    title: 'protocols',
    blurb:
      'The hormones/supplements module — protocols home, empty+locked states, detail, form, substance picker, dose log, timeline, and today completion.',
    rows: [
      { idx: 43, title: 'protocols · home',        subtitle: 'Today doses ring, 30d adherence strip, active list, coach insight.',  variants: [{ label: 'home',    Comp: Screens.S43_Protocols_Home }] },
      { idx: 44, title: 'protocols · empty/locked', subtitle: 'First-run empty state + paywall-locked gate.',                       variants: [{ label: 'states',  Comp: Screens.S44_Protocols_Empty_Locked }] },
      { idx: 45, title: 'protocol · detail',        subtitle: 'TRT cypionate. Adherence ring, cadence grid, history, coach.',       variants: [{ label: 'detail',  Comp: Screens.S45_Protocol_Detail }] },
      { idx: 46, title: 'protocol · form',          subtitle: 'New protocol. Substance, dose, cadence, cycle, conflict warning.',   variants: [{ label: 'form',    Comp: Screens.S46_Protocol_Form }] },
      { idx: 47, title: 'substance · picker',       subtitle: 'Search, category chips, results, custom add.',                       variants: [{ label: 'picker',  Comp: Screens.S47_Substance_Picker }] },
      { idx: 48, title: 'dose · log sheet',         subtitle: 'Taken/skipped/adjust modes, offline indicator.',                     variants: [{ label: 'log',     Comp: Screens.S48_Log_Dose }] },
      { idx: 49, title: 'protocol · timeline',      subtitle: '90-day cross-protocol adherence zine.',                              variants: [{ label: 'timeline',Comp: Screens.S49_Protocol_Timeline }] },
      { idx: 50, title: 'today · stack complete',   subtitle: 'All doses logged, success hero, tomorrow preview.',                  variants: [{ label: 'complete',Comp: Screens.S50_Today_Dose_Module }] },
    ],
  },
];

function Row({ row, phaseN }) {
  return (
    <div style={{ marginBottom: 110 }}>
      <div style={{ padding: '0 60px 24px', maxWidth: 1100 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 12,
            marginBottom: 4,
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              fontFamily: ACFonts.mono,
              fontSize: 11,
              letterSpacing: 3,
              color: 'rgba(60,50,40,0.6)',
              textTransform: 'uppercase',
            }}
          >
            screen {String(row.idx).padStart(2, '0')}
          </span>
          <span
            style={{
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: -0.3,
              color: 'rgba(40,30,20,0.9)',
            }}
          >
            {row.title}
          </span>
        </div>
        {row.subtitle && (
          <div style={{ fontSize: 14, color: 'rgba(60,50,40,0.6)', maxWidth: 600 }}>
            {row.subtitle}
          </div>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          gap: 32,
          padding: '0 60px',
          alignItems: 'flex-start',
          width: 'max-content',
        }}
      >
        {row.variants.map((v, vi) => (
          <React.Fragment key={vi}>
            {vi > 0 && <div style={{ width: 40 }} />}
            <ScreenCard label={v.label} dark={false} Comp={v.Comp} />
            <ScreenCard label={v.label} dark={true}  Comp={v.Comp} />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function ScreenCard({ label, dark, Comp }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span
          style={{
            fontFamily: ACFonts.body,
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: -0.1,
            color: 'rgba(60,50,40,0.75)',
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: ACFonts.body,
            fontSize: 11,
            padding: '2px 8px',
            borderRadius: 999,
            background: dark ? 'rgba(10,10,10,0.85)' : 'rgba(10,10,10,0.06)',
            color: dark ? '#efe9da' : 'rgba(60,50,40,0.7)',
          }}
        >
          {dark ? 'dark' : 'light'}
        </span>
      </div>
      <IOSFrame dark={dark}>
        {Comp ? <Comp dark={dark} /> : (
          <div style={{ padding: 24, fontFamily: ACFonts.body, color: dark ? '#efe9da' : '#0a0a0a' }}>
            (screen not yet wired)
          </div>
        )}
      </IOSFrame>
    </div>
  );
}

function PhaseHeader({ phase }) {
  return (
    <div style={{ padding: '40px 60px 48px', maxWidth: 1100 }}>
      <div
        style={{
          fontFamily: ACFonts.mono,
          fontSize: 10,
          letterSpacing: 3,
          textTransform: 'uppercase',
          color: 'rgba(40,30,20,0.6)',
          marginBottom: 10,
        }}
      >
        /// atlas.core · v3 · phase {String(phase.n).padStart(2, '0')}
      </div>
      <h2
        style={{
          margin: 0,
          fontFamily: ACFonts.brand,
          fontSize: 72,
          letterSpacing: -3,
          lineHeight: 0.9,
          color: 'rgba(15,10,5,0.94)',
          textTransform: 'lowercase',
        }}
      >
        {phase.title}.
      </h2>
      <p
        style={{
          margin: '18px 0 0',
          fontSize: 15,
          lineHeight: 1.6,
          color: 'rgba(40,30,20,0.8)',
          maxWidth: 720,
        }}
      >
        {phase.blurb}
      </p>
    </div>
  );
}

export default function V3Gallery() {
  return (
    <PaperThemeProvider>
      <div
        style={{
          minHeight: '100vh',
          background: '#efe9da',
          overflowX: 'auto',
          fontFamily: ACFonts.body,
          paddingBottom: 80,
        }}
      >
        {/* hero */}
        <div style={{ padding: '48px 60px 32px', maxWidth: 1100 }}>
          <div
            style={{
              fontFamily: ACFonts.mono,
              fontSize: 10,
              letterSpacing: 3,
              textTransform: 'uppercase',
              color: 'rgba(40,30,20,0.6)',
              marginBottom: 10,
            }}
          >
            /// atlas.core · v3 · gallery
          </div>
          <h1
            style={{
              margin: 0,
              fontFamily: ACFonts.brand,
              fontSize: 84,
              letterSpacing: -4,
              lineHeight: 0.88,
              color: 'rgba(15,10,5,0.94)',
              textTransform: 'lowercase',
            }}
          >
            the system,
            <br />
            <span style={{ background: 'black', color: 'white', padding: '0 10px' }}>
              on a phone.
            </span>
          </h1>
          <p
            style={{
              margin: '18px 0 0',
              fontSize: 15,
              lineHeight: 1.6,
              color: 'rgba(40,30,20,0.85)',
              maxWidth: 720,
            }}
          >
            35 screens translated from Claude Design. Paper + ink + amber. SF Pro for UI,
            Archivo Black for brand moments, JetBrains Mono for data. Preview each screen
            in light and dark, device-framed, scrolling inside its own bezel.
          </p>
        </div>

        {PHASES.map((phase) => (
          <React.Fragment key={phase.n}>
            <PhaseHeader phase={phase} />
            {phase.rows.map((row) => (
              <Row key={row.idx} row={row} phaseN={phase.n} />
            ))}
          </React.Fragment>
        ))}

        <div style={{ padding: '0 60px', maxWidth: 900 }}>
          <div
            style={{
              fontFamily: ACFonts.mono,
              fontSize: 10,
              letterSpacing: 3,
              textTransform: 'uppercase',
              color: 'rgba(40,30,20,0.6)',
              marginBottom: 10,
            }}
          >
            /// done · 35 screens
          </div>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: 'rgba(40,30,20,0.85)' }}>
            Ready for review. Next pass: wire the v3 screens to real navigation + Supabase data and
            flip production from v2 to v3 one route at a time.
          </p>
        </div>
      </div>
    </PaperThemeProvider>
  );
}
