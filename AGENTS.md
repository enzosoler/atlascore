# atlas.core — Design & UI System Instructions

## 1. Product Definition (NON-NEGOTIABLE)

atlas.core is a self-optimization operating system.

It replaces user decision-making with guided execution across:
- nutrition
- training
- recovery
- hormones

Every screen MUST answer:
1. What is my current state?
2. What should I do next?
3. What happens if I do it?

This is NOT a tracker.
This is NOT a dashboard.
This is a decision engine.

---

## 2. System Architecture (SOURCE OF TRUTH)

All UI must follow the existing system.

Primary files:
- screens.jsx
- screens-p2.jsx → screens-p8.jsx
- screens-lib.jsx
- design-canvas.jsx
- ios-frame.jsx

Rules:
- NEVER create a new layout system
- ALWAYS reuse existing component patterns
- EXTEND, do not reinvent

If unsure:
→ copy an existing screen structure and adapt it

---

## 3. Visual System

Theme system is controlled via:
- ACPalettes
- ACTheme
- ACTweaks

DO NOT hardcode colors.

Use theme tokens:
- ink
- bg
- accent

Design characteristics:
- High contrast
- Minimal but bold
- Strong typography hierarchy
- Generous spacing
- Card-based layout

Typography:
- Headers = dominant, high weight
- Secondary text = minimal, low emphasis
- Avoid long paragraphs

Avoid:
- clutter
- dense UI
- small unreadable text
- generic SaaS layouts

---

## 4. Interaction Model (CRITICAL)

Each screen must be executable.

Rules:
- ONE primary action per screen
- Max 1–2 taps to execute
- No multi-step flows unless unavoidable

Always include:
- Current state
- Clear action
- Expected outcome

No empty states.
No passive screens.

---

## 5. Screen Construction Framework

Every screen MUST follow this structure:

### 1. State Header
- current condition (recovery, metabolic, adherence, etc.)

### 2. Insight Block
- what is happening
- why it matters

### 3. Action Block (PRIMARY)
- what to do next

### 4. Trajectory / Feedback
- what happens if followed

### 5. Secondary Elements
- minimal, optional

---

## 6. Intelligence Layer (MANDATORY)

atlas.core is not UI-first.
It is intelligence-first.

Every feature must:
- predict
- recommend
- explain cause-effect

Avoid:
- raw numbers without meaning
- isolated metrics

Prefer:
- scores
- states
- risk indicators
- projections

---

## 7. UX Philosophy

Core principles:

- Replace thinking with execution
- Reduce friction to near-zero
- Show trajectory, not snapshots
- Always answer: "what should I do next?"

System must feel:
- precise
- directive
- intelligent
- alive

NOT:
- exploratory
- analytical-only
- passive

---

## 8. Strict Rules (DO NOT BREAK)

- DO NOT redesign existing components
- DO NOT introduce new design patterns unnecessarily
- DO NOT simplify into generic UI
- DO NOT add decorative elements without function
- DO NOT hardcode UI text (must support i18n)

Always:
- reuse patterns
- extend components
- maintain consistency

---

## 9. Design Tone

atlas.core should feel like:

- a control system
- a performance console
- a biological operating system

NOT:
- a fitness app
- a health tracker
- a dashboard tool

Language should be:
- direct
- outcome-driven
- system-oriented

---

## 10. When Generating New Screens

Follow this process:

1. Identify closest existing screen
2. Reuse its structure
3. Adapt content (state, action, trajectory)
4. Keep interaction minimal
5. Ensure it answers the 3 core questions

If uncertain:
→ default to simplicity

---

## 11. Anti-Drift Safeguard

If a design decision is unclear:

DO NOT invent.

Instead:
- reuse an existing screen pattern
- keep UI minimal
- prioritize action over information

Consistency > creativity

---

## Build & Deploy (MANDATORY)

After EVERY change — no matter how small:

1. `npx vite build` — verify production build passes
2. `npx cap sync ios` — sync to Xcode iOS project

This is NON-NEGOTIABLE. The user tests on a physical iPhone via Xcode.
Never report a change as done without running both commands.

---

## Scrolling Rule

Every screen inside V3AppShell MUST scroll properly on iOS:
- Outer container: `flex: 1, minHeight: 0`
- Scroll area: `flex: 1, minHeight: 0, overflow: 'auto', WebkitOverflowScrolling: 'touch'`
- The tab bar must NEVER scroll with content — it stays fixed at the bottom
- Tab bar is rendered by V3AppShell, NOT by individual screens (`showTabBar={false}`)

---

## 12. Reward System — 3-Stage Gift Framework (CRITICAL)

atlas.core uses a selective reward system.

DO NOT apply animations or ceremony everywhere.
Only apply the 3-stage sequence to key **gift moments**.

### Gift moments (ONLY these)

1. **Readiness score** — user opens app, system tells them their state
2. **Daily protocol / recommendations** — "what should I do today"
3. **Workout completion** — session summary, PRs, volume
4. **Meal logging result** — macros appear after photo/voice/text
5. **Body / composition update** — weight trend, measurements
6. **Lab result parsing** — biomarkers appear progressively
7. **Streak / adherence update** — identity reinforcement
8. **Purchase confirmation** — "system activated" feeling

### The 3 stages

**1. Anticipation**
- Brief buildup before result
- Creates uncertainty
- Example: "Analyzing recovery, training load, sleep..."

**2. Reveal**
- Result appears with weight
- NOT instant, NOT flat
- Example: readiness score animates in, weighted

**3. Celebration**
- Reinforces meaning, shows impact
- Example: "You're primed for strength today (+8%)"

### Where NOT to use it

DO NOT apply to:
- navigation
- settings
- editing flows
- forms
- admin screens
- dense data tables
- secondary screens

### Rules

- Never slow down core flows
- Must feel purposeful, not decorative
- Duration: short and controlled
- Same data, different delivery → higher perceived value

### Implementation principle

You don't tag screens. You tag **moments inside screens**.

Every screen that contains a gift moment → uses the 3-stage system.
Everything else → stays fast, minimal, silent.

If done right: app feels alive, outputs feel valuable, users feel guided.
If done wrong: gimmicky animation layer that kills the system feeling.

---

## 13. Platform Model (NON-NEGOTIABLE)

atlas.core is a **mobile-first product**.

The **mobile app is the real product**:
- training
- nutrition
- body/composition
- labs
- coach
- daily logging
- execution flows
- ongoing usage

The **web is not the app** for users.

The web exists only for:
- marketing
- explaining the product
- showing polished app preview screenshots with fake but coherent data
- billing actions (pay / subscribe / renew / manage / cancel)

### Hard rule

Real users must **not** be able to use the app through web routes.

If a route represents actual product usage, it should not be accessible on the public web.

Web app-like routes exist only for:
- internal development
- testing / QA
- design review
- personal preview

They are **not** part of the intended public user experience.

---

## 14. Route-Level Intent

### Mobile-only product surfaces

These are mobile-only in the real product experience:
- Today
- Train / workouts
- Eat / nutrition logging
- Body / measurements / progress
- You / profile
- logging flows (camera, voice, text)
- workout execution
- coach usage flows
- check-ins
- daily operating-system surfaces

These may exist in web builds for internal testing only.

### Dual-platform surfaces

These can exist on both mobile and web:
- paywall
- billing / subscription management
- renew / cancel / restore / manage plan

Behavior must differ by platform:
- mobile → RevenueCat / native purchase flow
- web → Stripe / web checkout

### Web-only surfaces

These belong on web:
- landing page
- pricing
- marketing pages
- feature explanation pages
- app preview page (fake data screenshots)
- legal pages (terms, privacy)
- conversion pages

---

## 15. Web UX Principle

The web must never feel like a usable version of atlas.core.

It must feel like:
- a conversion layer
- a billing layer
- an explanation layer

NOT:
- a desktop version of the product
- a full web app
- a place where users do daily use

### Decision rule

"Is this a conversion/billing surface, or is this a daily-use product surface?"
- conversion/billing → web allowed
- daily-use product → mobile only

### Enforcement

If a user on web tries to access a real product flow:
- redirect to marketing / app preview / download app
- show a gate explaining the full experience is in the mobile app
- allow only internal/dev access if explicitly enabled

Do not casually expose real app tabs on web just because the route technically works.

---

## 16. Platform Access Summary

### Public web allowed:
- marketing, pricing, product explanation
- app preview screenshots (fake data)
- checkout / paywall / subscription management
- legal pages

### Public web NOT allowed:
- actual daily app usage
- primary product tabs
- logging flows
- execution flows
- coach usage
- body/nutrition/training operating flows

### Internal-only web routes
App-like web routes for dev/QA/design review must not be treated as public product behavior.

### Non-negotiable
- Mobile is the product
- Web is support/conversion/billing
- Real users should not use atlas.core through web routes
- The web must push users toward the mobile app, not replace it

---

## 17. Launch Gate Session Context (2026-04-23)

This section is session context, not a replacement for the core product/design rules above.

### Role / Agent Context

Best label for the work done in this session:
- `atlas-launch-gate-staff-engineer`

Scope covered:
- principal-engineer style launch audit
- full-stack repo cleanup
- launch QA / systems audit
- i18n and platform-separation enforcement
- auth/email flow normalization

### What was audited

The session was a launch-readiness sweep across:
- product truth
- core loop integrity
- AI truth
- input friction
- progress visibility / gamification
- design-system consistency
- platform separation
- i18n correctness
- route/navigation integrity
- backend / infra truth
- brand consistency outside the app

### Canonical launch rules established in this session

- Mobile is the execution product.
- Web is utility-only: account, billing, export, settings, legal, help.
- If pt-BR is exposed anywhere, it must be complete. Mixed EN/PT is a launch bug.
- Fake or placeholder behavior on launch-critical paths is not acceptable.
- Passing build is not sufficient evidence of launch readiness.

### High-confidence fixes already implemented

- Hardened platform gating so public users cannot bypass mobile/web separation with `?dev=1` unless an explicit internal env flag is enabled.
- Disabled fake standalone insights behavior and removed the nonexistent `generate-holistic-insight` dependency from the live path.
- Rewired password reset UI to the branded email flow.
- Updated checkout success/cancel routing and repaired the checkout prelaunch contract test.
- Removed exposed hardcoded `service_role` usage from repo scripts/tests that were patched in this session.
- Cleaned visible PT-BR launch-path leakage on:
  - `src/App.jsx`
  - `src/redesign/v3/routes/V3ActiveWorkout.jsx`
  - `src/redesign/v3/routes/V3NutritionSearch.jsx`
  - `src/redesign/v3/routes/V3SharePR.jsx`
  - `src/redesign/v3/routes/V3Today.jsx`
- Consolidated auth/email architecture toward:
  - canonical auth path: `supabase/functions/auth-webhook`
  - canonical transactional renderer: `supabase/functions/send-email`
- Converted legacy paths into compatibility wrappers/shims instead of parallel systems:
  - `supabase/functions/on-auth-user-created/index.ts`
  - `supabase/functions/send-welcome-email/index.ts`
- Repaired the broken prelaunch runner so it emits artifacts again instead of crashing on malformed code.
- Converted the dead `shared/tbbm` dependency from a crash into an explicit blocked/retired prelaunch gate.

### Launch status (updated 2026-04-25)

- Launch is `GO` — TestFlight build 21 (v1.0) uploaded and processing.
- E2E staging verification completed:
  - login: PASS (auth-session.spec.ts — 4/4)
  - forgot password: PASS (auth-reset-routing.spec.ts — 10/10, fallback to native reset added)
  - signup: retry-on-timeout added for auth webhook cold start
  - checkout: billing-entry.spec.ts PASS (mocked), web redirect no longer blocks on missing publishableKey
  - all 39 authenticated routes: PASS on iphone-14 (mvp-release-audit.spec.ts — 81/83)
  - checkpoint/body flow: PASS (checkpoint.spec.ts — 7/7)
  - onboarding scroll: PASS all 12 screens (onboarding-mobile-ux.spec.ts — 12/12)
- Accessibility: Switch tap target fixed to 44px, keyboard focus added to Today screen.
- iOS entitlements: aps-environment set to production, foreign app groups removed.
- Apple Health: real HealthKit integration via @capgo/capacitor-health.
- Camera/Notifications: real native permission prompts via Capacitor plugins.
- Bundle size: 805KB main chunk (large but not blocking — code-split candidates identified).
- Supabase key rotation: deferred — live edge functions still depend on current JWT. Not blocking for MVP.
- Remaining lint/typecheck debt: not blocking for MVP launch.

### Commits produced during this session

- `d5275d6` — `Harden launch paths and normalize account flows`
- `51c3740` — `Consolidate auth email paths and repair prelaunch gate`

Current expectation:
- `origin/main` should include both of the commits above.

### Files that became important launch touchpoints

- `src/redesign/v3/lib/PlatformGate.jsx`
- `src/redesign/v3/routes/V3Insights.jsx`
- `src/services/aiInsightsService.js`
- `src/App.jsx`
- `src/i18n/messages/en.json`
- `src/i18n/messages/pt-BR.json`
- `src/lib/emailService.js`
- `supabase/functions/auth-webhook/index.ts`
- `supabase/functions/send-email/index.ts`
- `supabase/functions/send-password-reset/index.ts`
- `supabase/functions/on-auth-user-created/index.ts`
- `supabase/functions/send-welcome-email/index.ts`
- `supabase/functions/create-checkout/index.ts`
- `tests/prelaunch/checkout-url.test.mjs`
- `tests/prelaunch/tbbm.test.mjs`
- `scripts/prelaunch/run.mjs`

### Operational guidance for future agents

- Do not rotate Supabase JWT / legacy keys casually; first verify which live edge functions still depend on legacy verification.
- Treat `auth-webhook` as the owner of signup / confirmation / recovery auth-email behavior unless the deployment proves otherwise.
- Prefer adding distilled session context like this instead of dumping raw chat transcripts into agent context files.
- If updating this section later, append a new dated subsection rather than rewriting history.

---

## 17. Email System Context

Lifecycle and transactional email work has already been reviewed in detail.

Current direction:
- use the shared email renderer as the source of truth
- avoid creating new duplicate email systems
- keep branding aligned with the approved atlas.core visual language
- treat email as part of the product system, not as generic SaaS marketing output

Primary files:
- `supabase/functions/_shared/templates.ts`
- `supabase/functions/_shared/email-service.ts`
- `supabase/functions/send-test-emails/index.ts`
- `docs/email-rebuild/email-approval-preview.html`

Rules:
- DO NOT create a second template system if the shared renderer can be extended
- DO NOT ship placeholder or generic transactional copy
- DO NOT use default vendor-looking email styling
- ALWAYS review copy and rendering together
- ALWAYS preserve desktop and mobile previewability for approval

---

## 18. Email Brand Direction

atlas.core emails should follow the same approved system used in the design work:

- paper + ink + sulfur
- lower-case `atlas.core`
- stronger editorial hierarchy
- functional, deliberate spacing
- brand moments can be bold, but the layout must stay readable

Typography direction:
- brand/headline moments should feel assertive
- system/supporting lines can feel operational and restrained
- avoid anonymous SaaS tone

Avoid:
- overdesigned marketing-email tricks
- loud gradient-heavy email aesthetics
- generic startup copy
- hollow hype language

Prefer:
- calm clarity
- strong structure
- direct language
- credible product tone

---

## 19. Email Copy Rules

Transactional email copy must be:

- clear
- useful
- trustworthy
- specific

It must not sound like:
- placeholder copy
- vague conversion copy
- forced motivational writing
- generic wellness marketing

Every lifecycle email should answer:
1. What happened?
2. What does it mean for the user?
3. What should they do next?

Good examples of intent:
- welcome → orient the user and get them into a real first action
- confirm email → explain why confirmation matters and remove friction
- reset password → be calm, secure, and immediate
- trial ending / ended → be explicit, not manipulative
- founder email → feel personal, specific, and signed by a real person

---

## 20. Founder Email Rules

Founder emails are part of the lifecycle system and must feel human.

Requirements:
- include a real founder sign-off
- include a founder name
- include role/title
- sound like a real note, not a campaign automation pretending to be personal

Current founder signature standard:
- `Enzo Soler`
- `Founder, atlas.core`

Founder emails should:
- explain why the product exists
- invite direct feedback
- acknowledge early-stage product reality honestly
- avoid fake intimacy or manipulative familiarity

Weekly founder follow-ups:
- should feel like promised check-ins, not spam
- should invite honest product feedback
- should be easy to stop by replying

---

## 21. Email Review Workflow

The approval artifact for this work is:
- `docs/email-rebuild/email-approval-preview.html`

That file must remain useful for review:
- render actual email HTML, not abstract descriptions
- show subject + preheader
- show desktop preview
- show mobile preview
- allow quick approve / needs work / hold review behavior

When updating email templates:
1. change the shared source templates first
2. keep the approval preview aligned with the latest drafts
3. review both copy and rendering
4. do not treat a template as done until it reads well and previews well

---

## 22. Known Email State

Known facts from prior work:
- founder lifecycle templates were added to the shared system
- founder signature support was added
- the approval preview exists
- desktop + mobile preview were explicitly requested and added
- a hardcoded `Resend` API key was removed from the local test script

Still true:
- the repo still contains duplicate / older email paths
- the shared renderer should become the canonical path
- full consolidation is still a remaining task
