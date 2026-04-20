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
