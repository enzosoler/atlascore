# Claude Code Prompt — Atlas Core Onboarding Rebuild

Paste the block below into Claude Code at the root of the `atlas.core-official` repo.

**Specs live at:**
- `docs/AtlasCore_Onboarding_Rebuild.docx` — strategy, emotional arc, all copy
- `docs/AtlasCore_Onboarding_Mockups.html` — **wireframes only** (flow + copy reference; ignore visual styling)

---

## Prompt

```
You are rebuilding the onboarding flow for Atlas Core — a weight-loss / body-composition
fitness app. The current onboarding is disconnected from the app, shows everything at once,
has no emotional arc, and doesn't drive conversion. Your job is to replace it end-to-end.

CRITICAL READ-FIRST (do these before writing a single line)

1. Read docs/AtlasCore_Onboarding_Rebuild.docx. This is the strategic brief. It explains the
   5-act emotional arc (Hook → Quiz → Reveal → Sell → Activate), the 28-screen structure,
   every screen's copy in Atlas's voice, the paywall spec (3-day trial, weekly default, hard
   gate, $6.99 / $12.99 / $79.99), and the Day-1 continuity banner. Treat this as the intent
   contract. Do not deviate from the strategic structure or copy voice without a strong reason.

2. Open docs/AtlasCore_Onboarding_Mockups.html in your head. Use it ONLY for flow, order, and
   copy-in-context reference. IGNORE its visual styling completely. The mockup's silhouettes,
   spacing, colors, and typography are wireframe sketches, not design spec. You will produce
   design that is much better.

3. Study Atlas's actual design system before touching any screen:
     - tailwind.config.js — color tokens, radii, spacing scale
     - src/index.css — hsl CSS variables (--bg, --fg, --accent-primary, etc.)
     - src/components/shared/AppContainer, Card, PageHeader, StablePage
     - src/components/ui/* (shadcn primitives already in use)
     - src/pages/TodayV2.jsx, Body.jsx, Measurements.jsx, Insights.jsx — existing visual
       patterns for cards, headings, motion, data display
     - src/lib/i18nContext — translation system (every user-facing string must use useT())
     - Framer Motion usage patterns (look at how existing pages animate entry/exit)

4. Read docs/COPYWRITING_SYSTEM.md — this is the existing voice guide. The onboarding doc
   extends it; the voice is the same.

DESIGN PRINCIPLES (non-negotiable)

- Match Atlas's existing visual language. Same spacing, same typography hierarchy, same hsl
  color tokens, same card / button / input patterns. A screenshot of any new onboarding
  screen next to a screenshot of TodayV2 should feel like the same app.
- Motion: use Framer Motion, match the existing subtle-fade-slide patterns. Don't introduce
  bounce, spring overshoot, or anything flashy. This is a serious-training app, not a kids
  game.
- Typography hierarchy: large headline → single-idea subtext → one primary CTA per screen.
  No walls of text. Quiz questions are short and conversational.
- One idea per screen. One question per screen. One primary action per screen.
- No unicode bullets in UI (use design system list components). No emoji chrome unless it's
  intentional (the mockup used emojis as placeholder icons — replace with proper Lucide icons
  or Atlas's icon system).
- Back chevron top-left. Progress bar top-center. No dismiss "X" button anywhere in the quiz.
- Silhouette picker (screens 14, 15): if you can design a better visual commitment anchor
  using Atlas's design system, do it. The goal is "user visualizes current vs target body" —
  the implementation is up to you.

PHASE-BASED EXECUTION

Ship one phase at a time. After each phase: run `npm run build`, run the existing test suite,
and summarize exactly what changed. Wait for the user to approve before moving to the next
phase. Do not batch multiple phases.

=== PHASE 0 — Foundation ===

Objective: set up the shared state and routing pattern that all 28 screens will use.

- Create src/store/onboardingStore.js using Zustand (check existing stores in src/store/
  for pattern). Schema:
    { goal, targetAmount, targetUnit, targetDate, sex, age, height, weight, activity,
      pastAttempts[], blocker, eatingPattern, trainingLocation, sessionMinutes,
      currentBody, desiredBody, motivations[], trackingHistory, connectedApps[],
      pushPermission, healthKitConnected }
- Persist to Supabase profiles.profile_data.onboarding on submit. On load, hydrate from
  Supabase if the user has a partial or complete state.
- Refactor src/pages/Onboarding.jsx to be a schema-driven phase controller. The schema lives
  in src/config/onboardingSchema.js and defines the 28 screens in order with per-screen
  component, validation, and transition logic.
- Add src/components/onboarding/ShellFrame.jsx — the chrome that wraps every screen: status
  bar spacing, back chevron, optional progress bar, primary CTA slot. Every screen below uses
  it.
- Add src/components/onboarding/ProgressBar.jsx (top of quiz act).
- Deliverable: empty shell that routes through 28 numbered stub screens, back/forward
  navigation works, state persists.

=== PHASE 1 — Act 1 Hook (screens 1–2) ===

- Splash (screen 1): Atlas logo + "Stop guessing your progress." — 1.5s auto-advance.
- Welcome/Hook (screen 2): headline "The scale lies. Your mirror lies. Your last app had no
  idea what was working." + Atlas's signature subtext + "Build my plan" CTA + "I already
  have an account" secondary link (routes to existing Auth flow).
- Verify: matches Atlas's brand. Dark-mode-safe if the app has dark mode.

=== PHASE 2 — Act 2 Quiz (screens 3–19) ===

15 questions + 3 validation interstitials. See docs/AtlasCore_Onboarding_Rebuild.docx
Section 5 for exact copy and answer options for each. Key components to build:

- QuestionSingle — single-select card list (Q1, Q3, Q5, Q7, Q8, Q9 location, Q13, Q14)
- QuestionMulti — multi-select with max (Q6 past attempts, Q12 motivations: max 3)
- QuestionNumberInput — weight, height, age (Q2, Q4)
- QuestionSlider — target weight (Q2 slider variant) + session minutes
- QuestionDatePicker — target date (Q3 specific-date branch)
- QuestionBodyPicker — current + target body visualization (Q10, Q11). Re-imagine the
  mockup's crude silhouettes. Suggestions: CSS-drawn proportional silhouettes parameterized
  by sex + BMI hint, OR a minimal illustration set from Lucide-like icon pack, OR a gradient
  slider showing body-fat % spectrum. Pick what looks best in Atlas's visual system.
- Interstitial #1 (after Q5) — dynamic percentage stat based on age cohort
- Interstitial #2 (after Q9) — star rating + 3 app-store-style micro-quotes (use mocked
  content for now; swap to real App Store review data post-launch)
- Interstitial #3 (before Act 3) — "Building your plan..." with progress shimmer, 2–3s pause
- Notification permission (Q15) — TWO-STEP pattern: show the in-app "Turn on nudges" screen
  FIRST, then trigger the native iOS permission prompt only after the user taps. Use
  Capacitor's LocalNotifications.requestPermissions when they tap.
- Connected apps (Q14) — ONLY show Apple Health on iOS. On Android, skip the screen entirely
  (or show a single "Google Health Connect coming soon" tile). DO NOT show Garmin, Strava,
  MyFitnessPal — there is no backing integration for those in the codebase and showing
  non-functional tiles breaks user trust.

=== PHASE 3 — Act 3 Reveal (screens 20–22) ===

This is the hero. Do not cut corners.

- Building (screen 20): 2–3s intentional pause with rotating subtext ("Matching against
  12,000+ profiles...", "Calibrating for [their date]..."). Use Framer Motion.
- Analysis (screen 21): 3 insight cards that animate in. Compute real values from the quiz
  answers:
    card 1: daily calorie target (simple Mifflin-St Jeor × activity multiplier − 500 kcal
      deficit for fat loss)
    card 2: weekly session count recommendation based on activity + training location
    card 3: callback to their chosen blocker ("Your biggest risk: [blocker]. We've built
      guardrails for it.")
- Projection (screen 22) — THE MONEY SCREEN: a clean weight-curve SVG/Recharts chart
  showing their current weight on the left, target weight on the right, projected curve
  between. Optional: faint dashed "no-app" flat line for contrast. Date axis. Starting +
  ending weight values on the card. Copy: "You can be at [X lb] by [target date]." Subtext
  "That's [N] weeks from today. Not a miracle — just a plan that actually matches your body
  and your schedule." Make this screen feel earned. If there's any one screen in this
  rebuild that deserves extra design attention, it's this one.

=== PHASE 4 — Act 4 Sell (screens 23–27) ===

- Social Proof (screen 23): 3 testimonial cards. For now, use 3 hardcoded testimonials
  stored in src/config/onboardingTestimonials.js (we'll swap in real reviews later).
  Match-by-demographics is nice-to-have but not critical for v1.
- Commitment Pledge (screen 24): primary "I'm in", secondary "I'll decide as I go" — both
  advance. Use Framer to animate the pledge text in with weight/emphasis.
- Trial Explanation (screen 25): 3-dot timeline. Day 0 = full access, Day 2 = Apple emails
  you (this is automatic, not something we send), Day 3 = trial ends. Copy per doc.
- Paywall (screen 26) — HARD GATE. Build UI against MOCKED data for now:
    - Create src/hooks/usePaywallData.js that returns 3 packages in the shape RevenueCat's
      `Purchases.getOfferings()` returns. Hardcode:
        weekly: { identifier: '$rc_weekly', price: 6.99, period: 'WEEKLY',  storeProduct: 'atlas_pro_weekly' }
        monthly: { identifier: '$rc_monthly', price: 12.99, period: 'MONTHLY', storeProduct: 'atlas_pro_monthly' }
        annual: { identifier: '$rc_annual', price: 79.99, period: 'ANNUAL', storeProduct: 'atlas_pro_annual' }
      The shape MUST match RevenueCat's output so that when we swap mock → real, the
      component code doesn't change.
    - Build Pricing.jsx: weekly pre-selected with "MOST POPULAR" tag, "SAVE 80%" badge on
      annual (compute the % from the mock prices, don't hardcode the string), single hero
      CTA "Start 3-day free trial", Apple-required disclosure below, small Restore / Terms /
      Privacy row at the bottom.
    - On CTA tap, for now: write a stub purchase function that fakes success and advances to
      the next screen. When the RevenueCat wiring prompt runs later, that stub gets replaced
      with `Purchases.purchasePackage(pkg)`.
- Account Creation (screen 27): reuse existing Auth.jsx / AppleAuth.jsx / SocialAuth.jsx
  patterns. Move them to AFTER paywall, not before. Three stacked options: Apple, Google,
  Email.

=== PHASE 5 — Act 5 Activate (screen 28) ===

Modify src/pages/TodayV2.jsx:
- Add a banner at the top of the screen for newly-onboarded users (or permanently for the
  first 4 weeks): "Day [X] of your [Y]-week plan to [goal] by [date]." Computed live from
  onboarding state + current date.
- Add today's-jobs cards: breakfast target, today's workout (reference their training
  location + session length), and next weigh-in.
- Add an AI coach message card at the bottom of Today for week 1: "You told me [their
  blocker] is what usually gets in the way. We'll work around it. Let's start today." Pull
  the blocker from onboardingStore.

=== PHASE 6 — Polish + Handoff ===

- Run npm run build, fix any errors.
- Run existing tests.
- Manual smoke test: complete the full onboarding end-to-end in dev mode as a new user,
  then refresh and verify state persists via Supabase.
- Verify no translation regressions — every new string must use useT() and the new keys
  must be added to src/i18n/messages/en.json and src/i18n/messages/pt-BR.json (Portuguese
  translations can be machine-translated placeholders; flag the strings for human review).
- Summarize: files created, files modified, what you'd do differently with more time,
  known gaps.

BRAND VOICE REMINDERS (per docs/COPYWRITING_SYSTEM.md)

- Direct. Specific. No BS. A little confident. Never corporate or chirpy.
- "Stop guessing your progress." is the north-star line — the whole onboarding is a 2-minute
  proof of that promise.
- Avoid "unlock", "journey", "seamless", "empower", "amazing", any other SaaS stock words.
- Avoid Duolingo-style mascot chirp.

DO NOT

- Do not copy the mockup HTML's styling. It's wireframe-only.
- Do not use emojis as UI chrome (accent icons can be Lucide or the existing icon system).
- Do not add ads, analytics SDKs, or third-party SDKs beyond what's already in the repo.
- Do not introduce a new routing library, state library, or UI framework. Work within what
  exists.
- Do not ship the full 28 screens in one commit. Ship phase-by-phase.
- Do not wire real RevenueCat here — that's the other prompt (docs/revenuecat_wiring_prompt.md).
- Do not change the strategic structure or order of screens. The 5-act emotional arc is the
  product.

At the end of every phase, report what changed, what you tested, and what's still pending.
Wait for approval before moving to the next phase.
```

---

## How to use this

1. Open Claude Code in the `atlas.core-official` repo root.
2. Paste the prompt above.
3. Approve phase-by-phase. Don't let it barrel through all 6 phases without you seeing each step.
4. Between phases, run the app on your phone via TestFlight / local dev and feel the flow. The Reveal screen (Phase 3) is the most important to sanity-check visually.
5. The Paywall screen at Phase 4 will work end-to-end with mocked RevenueCat data. When Paid Apps goes Active and you run `docs/revenuecat_wiring_prompt.md`, the stubbed `usePaywallData` hook gets swapped to the real `Purchases.getOfferings()` — zero other code changes needed.

Total estimated Claude Code time: 6–10 hours of agent work across the 6 phases, depending on how chatty you want it to be between phases.
