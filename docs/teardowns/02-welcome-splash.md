# Teardown 02 — Welcome / Splash

**Surface:** First-run welcome and splash entry points that route new or unauthenticated users into Atlas's onboarding/auth path.
**Atlas file(s):** `src/App.jsx`, `src/components/routing/WebOnlyRoute.jsx`, `src/pages/WelcomeOnboarding.jsx`, `src/pages/SplashScreen.jsx`, `src/features/onboarding/OnboardingEngine.jsx`, `src/features/onboarding/screens/SplashScreen.jsx`, `src/pages/DemoHome.jsx`, `src/pages/WelcomeScreen.jsx` (currently unreferenced), `src/pages/Auth.jsx`, `src/lib/routes.js`
**Reference apps:** Duolingo (primary)
**Audience tension:** High — serious optimizers want immediate utility and credibility, while general users need reassurance, momentum, and a low-friction first step.

---

## Why this screen matters

This surface is the first meaningful promise Atlas makes. It is where a visitor decides whether the app feels like a serious operating system for training and nutrition or just another fitness app with polished motion. That decision happens before auth, before onboarding depth, and before any durable habit has formed, so small friction here has outsized impact on signup completion, preview engagement, and early retention.

Broken here means more than a visual glitch. It means the user lands on one of several inconsistent entry experiences, cannot tell what the app does, or is delayed before reaching anything useful. World-class means the product is legible in seconds, the brand feels immediate, and the next step into preview or account creation is obvious.

For Atlas, this surface also carries a positioning risk. The app serves both serious optimizers and broader fitness users, so the welcome layer has to be confident without being intimidating. If it overpromises, users churn later; if it under-explains, they never reach the part of Atlas that makes the promise credible.

---

## Reference app 1 — Duolingo (primary)

Duolingo is the right reference because it gets a mixed-intent audience from curiosity to commitment without making the first screen feel like a tax. It turns a product with real depth into an entry experience that feels fast, light, and emotionally legible. Atlas does not need Duolingo's exact tone, but it does need the same control over attention and momentum.

### What Duolingo does that works

**1. One obvious next step.** Duolingo narrows attention to one action, then rewards it immediately. That reduces hesitation at the exact point where abandonment is most likely.

**2. Friendly but not vague.** The copy is simple but not empty. Users know what they are getting, who the app is for, and why starting now makes sense.

**3. Progress is visible early.** Duolingo makes learning feel like a sequence instead of a leap. The user sees motion and forward momentum before any deep commitment.

**4. Personality without clutter.** Character, color, and motion create warmth, but the layout stays disciplined. The screen feels alive without losing hierarchy.

**5. Rewards are immediate.** The welcome flow hints that action will produce progress right away. The screen should convince the user that the app will pay them back quickly.

**6. The journey feels bounded.** Duolingo makes it clear that the user is entering a guided path, not a loose marketing site. That structure creates trust.

### What Duolingo does that you shouldn't copy

**1. Heavy gamification.** Duolingo can lean on streaks, mascots, and playful reinforcement. Atlas should not import that level of playfulness into a fitness/productivity context where credibility matters more.

**2. Over-optimized cheerfulness.** Duolingo's tone is intentionally broad and mass-market. Atlas serves users who want performance and seriousness, so the same register would make it feel less authoritative.

**3. Broad education before value.** Duolingo can spend time teaching the system because the product itself is the lesson. Atlas should demonstrate utility faster.

---

## What Atlas does today (current state)

- **Layout and navigation structure:** The current entry path is split across multiple routes and components instead of one canonical welcome surface. `src/App.jsx` wires `/welcome` to `src/pages/WelcomeOnboarding.jsx`, `/splash` to `src/pages/SplashScreen.jsx`, and the onboarding engine's internal `splash` screen lives in `src/features/onboarding/screens/SplashScreen.jsx`. For unauthenticated native users, `RequireAuthenticatedApp` sends them to `/onboarding` on protected-route access, while `WebOnlyRoute` sends unauthenticated native users to `/welcome` or `/preview` depending on the `atlas_has_seen_welcome` flag.

- **Key interactions:** `WelcomeOnboarding.jsx` is a four-slide carousel with swipe support, a skip action on non-final slides, pagination dots, and a single bottom CTA that advances or finishes. On completion or skip it sets `atlas_has_seen_welcome`, tracks analytics, and navigates to `/preview`. `src/pages/SplashScreen.jsx` is passive: it renders a logo video and always redirects to `/auth` after two seconds. The onboarding-engine splash is non-interactive and auto-advances according to schema timing.

- **Visual approach:** The live `/welcome` screen is a minimal full-screen layout with a top bar, centered icon-and-copy slide, and a single CTA rail at the bottom. It feels functional and light, but not especially premium or distinctive. The standalone `/splash` route is even thinner: it is essentially a video on a blank background. The onboarding-engine splash is the most branded of the three, with a gradient background, logo lockup, tagline, and animated loading dots. These three entry looks do not feel like one system.

- **Known issues from code reading:** `src/pages/WelcomeScreen.jsx` appears to be dead or abandoned; `rg` found no routing or import references to it. `src/pages/SplashScreen.jsx` allocates `videoRef` but never uses it for behavior, and it always waits exactly two seconds regardless of auth state or load state. `WelcomeOnboarding.jsx` depends on translated slide objects; if the translation payload is missing or malformed, the screen can degrade into an empty slide area with a still-active four-dot stepper because `total` falls back to `4` even when `slides` is empty. The app also has multiple competing first-run surfaces, which makes the experience harder to reason about.

- **Gaps relative to the reference app:** Atlas lacks a single, obvious first-run story. Duolingo makes the next step feel inevitable; Atlas currently splits that job across `/welcome`, `/preview`, `/splash`, and the internal onboarding splash. Atlas also lacks a strong value promise tied to a user's immediate intent, and it does not yet use motion and progress to explain "what happens next" as cleanly as Duolingo does.

---

## Patterns to steal, ranked by ROI

### 🟢 Steal immediately — high impact, low effort

**1. Collapse the first-run decision into one canonical path.** Atlas should present one entry story, not three different ones that share branding. The first screen should consistently answer: am I previewing, signing in, or starting onboarding? **Effort: 1-2 days**

**2. Make the value proposition concrete in the first sentence.** Replace broad product-category copy with a short promise that names the outcome the user wants. **Effort: 0.5-1 day**

**3. Keep one dominant primary action.** Duolingo does not dilute the first decision with too many equally-weighted exits. Atlas should preserve a clean hierarchy between "start" and "sign in." **Effort: 0.5 day**

**4. Show progress as a bounded journey.** A small step indicator or stateful promise is enough to make the user feel the screen is moving somewhere. Atlas already has dots on `/welcome`; make them feel guided, not generic. **Effort: 0.5-1 day**

### 🟡 Steal soon — medium impact, medium effort

**5. Use intent-based branching.** If the user arrives from a web-only preview, the welcome layer should acknowledge that intent and make preview easy. If they arrive cold, bias toward the shortest path into the story. **Effort: 1-2 days**

**6. Replace the splash timer with a meaningful transition.** The current `/splash` route is a fixed delay with a video asset. Tie the transition to auth or onboarding readiness so the user never feels stuck waiting. **Effort: 1 day**

**7. Add fallback content for missing onboarding copy.** The welcome screen should never render an empty state just because translation data is incomplete. **Effort: 0.5-1 day**

### 🔴 Consider carefully — high effort or audience-dependent

**8. Merge the route-level and engine-level splash experiences into a single design system component.** This would eliminate duplication between `src/pages/SplashScreen.jsx` and `src/features/onboarding/screens/SplashScreen.jsx`, but it touches routing, onboarding schema, and native/web behavior. **Effort: 2-4 days**

**9. Build an interactive demo before auth.** Letting users touch core value before registration could improve conversion, but it requires product decisions about data access and state persistence. **Effort: 3-5 days**

---

## Atlas-specific design tensions to resolve

**Tension 1 — Preview first vs. account first.**
Atlas needs to support users who want value immediately and users ready to create an account. The current routing splits those paths across `/welcome`, `/preview`, and `/auth`, which makes the funnel harder to understand. *Resolution:* keep preview as the default continuation from welcome, but make sign-in visible in the same frame.

**Tension 2 — Brand theater vs. time-to-value.**
Motion and splash can create emotional momentum, but too much of it turns into delay. The existing two-second `/splash` route risks feeling like dead time. *Resolution:* use animation as a transition cue, not as an event.

**Tension 3 — Serious credibility vs. casual friendliness.**
Atlas serves both performance-minded users and general fitness users, so the welcome layer has to be warm without becoming goofy. Duolingo can get away with a mascot-first tone; Atlas cannot. *Resolution:* keep the interface friendly, but anchor the copy in concrete outcomes.

**Tension 4 — Multiple entry surfaces vs. one mental model.**
There are currently several first-run experiences that solve overlapping jobs: `/welcome`, `/splash`, the onboarding-engine splash, and the older un-routed `WelcomeScreen.jsx`. *Resolution:* make one route the canonical first-run shell and fold the others into it or retire them.

---

## Specific changes to make (actionable list)

1. **Make `/welcome` the single canonical first-run shell and remove or repurpose the orphaned welcome screen.** Touch `src/App.jsx`, `src/pages/WelcomeOnboarding.jsx`, and `src/pages/WelcomeScreen.jsx`. **Effort: 1-2 days.**

2. **Rewrite the welcome copy so the first screen states one clear Atlas promise.** Touch `src/pages/WelcomeOnboarding.jsx` and any locale strings it consumes. **Effort: 0.5-1 day.**

3. **Change `/splash` so it respects app readiness instead of waiting on a fixed timer.** Touch `src/pages/SplashScreen.jsx` and `src/App.jsx`. **Effort: 1 day.**

4. **Unify the two splash implementations into one shared branded component.** Touch `src/pages/SplashScreen.jsx`, `src/features/onboarding/screens/SplashScreen.jsx`, `src/features/onboarding/OnboardingEngine.jsx`, and `src/App.jsx`. **Effort: 2-4 days.**

5. **Preserve the current `atlas_has_seen_welcome` behavior, but make the redirect logic explicit in the UI copy.** Touch `src/components/routing/WebOnlyRoute.jsx`, `src/pages/WelcomeOnboarding.jsx`, and `src/pages/DemoHome.jsx`. **Effort: 0.5-1 day.**

6. **Add a visible progress indicator and a stronger finish state to the welcome flow.** Touch `src/pages/WelcomeOnboarding.jsx`. **Effort: 0.5-1 day.**

7. **Add safe fallbacks for missing slide data so the screen never renders empty.** Touch `src/pages/WelcomeOnboarding.jsx` and the translation source it uses. **Effort: 0.5 day.**

8. **Make the primary CTA and the secondary sign-in path visually distinct.** Touch `src/pages/WelcomeOnboarding.jsx` and `src/pages/Auth.jsx` if the destination text needs to line up. **Effort: 0.5-1 day.**

9. **Add analytics for welcome view, skip, completion, and splash exit so drop-off is measurable.** Touch `src/pages/WelcomeOnboarding.jsx`, `src/pages/SplashScreen.jsx`, `src/features/onboarding/screens/SplashScreen.jsx`, and `src/lib/analytics`. **Effort: 0.5 day.**

10. **Align the welcome and onboarding-engine splash visuals to one system-level brand language.** Touch `src/pages/WelcomeOnboarding.jsx` and `src/features/onboarding/screens/SplashScreen.jsx`. **Effort: 1 day.**

11. **If `/welcome` remains a carousel, make the slide content intent-aware instead of generic feature nouns.** Touch `src/pages/WelcomeOnboarding.jsx` and its source copy. **Effort: 1 day.**

Total effort: **~8-14 days** depending on whether the team merges the splash variants now or defers that cleanup. The biggest perceived-quality jumps come from items **1, 2, 3, 4, and 8** because they reduce confusion, sharpen the promise, and remove dead time.

---

## What NOT to do

1. Do **not** keep `/welcome`, `/splash`, and the onboarding-engine splash as three unrelated first impressions.
2. Do **not** leave a fixed two-second splash delay in front of auth or onboarding unless it is tied to a clear transition state.
3. Do **not** turn the welcome screen into a long feature list that asks the user to read before they can act.
4. Do **not** copy Duolingo's mascot-heavy, streak-heavy tone into a product that needs to feel credible and performance-oriented.
5. Do **not** let translation or copy-data failures produce a blank or half-rendered welcome state.
6. Do **not** bury the sign-in path so deep that returning users have to tour the product again.

---

## The single highest-leverage thing

If the team only does one thing from this teardown, it should be to make Atlas's first-run path feel like one deliberate system instead of several overlapping screens. Right now the app splits the welcome job across `/welcome`, `/splash`, and an internal onboarding splash, which dilutes the brand and makes the entry experience harder to trust. Collapsing that into one canonical first-run story would immediately improve clarity, reduce maintenance risk, and make every later improvement to copy, motion, or onboarding much more effective.

---

**File status:** Draft 1. To be revised after implementation against reality.
