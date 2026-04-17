# Atlas Core — Teardown Synthesis

## Cross-screen decisions

### 1. Coach Chat owns reactive coaching. Coach Insights owns proactive coaching.

Teardowns `01-coach-chat.md` and `18-coach-insights-proactive-cards.md` are aligned on the core problem: Atlas currently blurs "the coach answered my question" and "the coach proactively nudged me." That overlap is creating product ambiguity on Today. The synthesis decision should be:

- `Coach Chat` owns user-initiated conversation, deeper reasoning, follow-up questions, and action execution after the user asks.
- `Coach Insights` owns timely proactive nudges with explicit trigger, freshness, and one next step.
- A proactive card can open chat, but it should not be implemented as "just another chat teaser."

If this boundary is not enforced, both surfaces will keep converging on the same half-explained behavior and the user will never learn when Atlas is reacting versus coaching.

### 2. Pricing, native paywall, and manage-subscription need one billing contract.

Teardowns `05-post-onboarding-paywall.md`, `21-pricing-page-web.md`, `22-native-paywall.md`, and `23-manage-subscription.md` all found the same trust risk from different angles: Atlas has multiple revenue surfaces, but not one canonical subscription promise. Trial length, checkout ownership, restore behavior, renewal clarity, and management path are still drifting by channel.

The synthesis decision should be:

- Define one canonical billing contract:
  what trial exists, when billing starts, what the renewal cadence is, how cancellation works, and which platform owns the subscription.
- Adapt only the payment rail and legal/footer details per platform.
- Route all post-purchase understanding through one authoritative billing hub.

Without this decision, every pricing improvement will keep being partially undone by copy drift and ownership confusion somewhere else in the funnel.

### 3. Account, Settings, Billing, and Integrations need an explicit information architecture.

Teardowns `24-account-profile.md`, `25-settings-hub.md`, `23-manage-subscription.md`, and `26-integrations.md` all point to the same structural issue: Atlas has the pieces of a control center, but they are distributed across too many semi-overlapping destinations. Users currently have to infer whether a row is a preference, a profile field, a billing action, or a connection state.

The synthesis decision should be:

- `Profile` = identity and branching hub.
- `Account` = account state, plan state, dangerous actions.
- `Settings` = preferences and control-plane rows only.
- `Billing` = management handoff and platform-specific billing details.
- `Integrations` = connection status, permissions, sync health, roadmap disclosure.

If that IA is not locked, each surface will keep patching around the others and the product will stay harder than necessary to trust.

### 4. Workouts need a strict separation between library, execution, and history.

Teardowns `12-workout-library.md`, `13-active-workout.md`, and `14-workout-history-protocol.md` describe a classic system-boundary problem. The app has enough pieces for a strong training product, but routine browsing, active execution, protocol structure, and history drill-down are not yet presented as one clean lifecycle.

The synthesis decision should be:

- `Workout library` = choose, clone, understand, schedule.
- `Active workout` = durable in-progress session model.
- `History & protocol` = completed-session review and structured plan context.

This matters because any ambiguity here directly hurts retention: training products live or die on whether the user trusts what is active now, what happened last time, and what they are supposed to do next.

### 5. Nutrition needs one source-of-truth hierarchy.

Teardowns `08-daily-nutrition-log.md`, `09-meal-plan-view.md`, `10-ai-food-logging-photo-text-barcode.md`, and `11-macro-target-setup.md` all recommend some version of the same correction: Atlas currently has nutrition capability fragments, not one coherent system. Planning, quick logging, AI capture, and macro control are all present, but the user is not clearly told what the canonical target is and how capture modes resolve into the same ledger.

The synthesis decision should be:

- `Macro target setup` owns the goal and target numbers.
- `Meal plan` owns planned structure.
- `Daily log` owns actual intake.
- `AI food logging` owns capture and review, then hands off into the log.

If those ownership rules are not explicit, the nutrition experience will keep feeling powerful in demos and confusing in daily use.

### 6. System states should constrain every feature team.

`31-system-states-empty-loading-errors-offline-permissions.md` is not a side document. It is a forcing function on almost every other teardown. Many surface-specific recommendations only make sense if Atlas stops treating "failed to load" and "empty" as the same thing, and if permission/offline language becomes consistent.

The synthesis decision should be:

- No surface gets to invent its own state grammar if `StablePage.jsx` can handle it.
- No empty state ships without a verified empty branch and a next action.
- No permission or offline treatment should be one-off unless the use case is truly exceptional.

This is the design-system equivalent of fixing foundations before repainting walls.

## Repeated themes

### 1. One canonical owner per domain

This showed up everywhere: coaching, billing, workouts, nutrition, settings, and integrations. Atlas repeatedly has multiple partial surfaces touching the same job. The repeated recommendation is not "make each one better." It is "pick one owner and make the other surfaces hand off cleanly."

### 2. One obvious next action

Many teardowns converged on the same interaction principle:

- Today should end in one daily action.
- Weekly review should lead to one drill-down.
- Coach chat should end in one concrete next step.
- Empty states should include one action-first CTA.
- Account and billing rows should pair state with the next move.

Atlas often has useful information already; it loses perceived quality when it does not translate that information into a decisive action.

### 3. Truthful state beats decorative polish

This is probably the loudest repeated theme in the whole exercise. The teardowns keep returning to the same trust gap:

- fake emptiness caused by hidden errors
- placeholder pages linked from serious surfaces
- library shells with no-op mutations
- duplicate continue paths on paywalls
- settings pages that look real but are still demo-grade
- billing language that changes by route

The pattern is clear: the app is more often hurt by untruthful state than by imperfect visual design.

### 4. Explain context, source, and freshness

This theme appeared in coach chat, proactive insights, integrations, routine cards, charts, billing, and account rows. Users need small contextual labels that answer:

- where did this come from?
- why is this showing now?
- is this current?
- who owns this state?

Atlas has a lot of smart logic under the hood. The UI often fails to expose that logic in a legible way.

### 5. Persistence matters more than flair

Repeated recommendations favored durable lifecycle behavior over novel interaction:

- persist dismissals
- persist checkpoint/photo drafts
- make active workout sessions durable
- make check-ins local-day aware
- make billing source and renewal state persistent and visible
- make integrations show true sync state

Across the set, "feels reliable tomorrow" mattered more than "feels exciting for 30 seconds."

### 6. Separate browse, summary, and execution

This came up in workouts, nutrition, coaching, account/settings, and reporting surfaces. Atlas often combines or blurs these modes:

- browse library vs execute workout
- proactive insight vs reactive chat
- profile hub vs settings control plane
- meal plan vs actual log
- weekly summary vs daily action

The repeated design principle is that these modes should connect tightly but not collapse into each other.

## Cheap wins

Ranked by impact across the whole app:

1. **Adopt one shared data-state contract in `StablePage.jsx`.** This is the cleanest high-leverage fix because it improves empty, loading, error, offline, and retry handling across multiple revenue and retention surfaces at once.
2. **Unify the billing promise everywhere.** Make trial length, first charge timing, cancellation language, restore language, and platform ownership read the same across onboarding paywall, native paywall, pricing, and billing management.
3. **Make `Settings` the truthful control plane and remove duplicate/stub destinations.** This is mostly information-architecture cleanup and wiring, but it removes a large amount of trust erosion.
4. **Add explicit context/source/freshness labels to AI and insight surfaces.** Coach chat, proactive cards, integrations, and dashboard summaries all benefit immediately from small status labels that explain why something is present.
5. **Stop silent fallback from error to empty state.** This was called out directly in system states and implied in workouts, nutrition, and dashboard surfaces. It is not glamorous, but it is one of the fastest ways to make the app feel materially more serious.
6. **Make the top of Today a single synthesized daily status with one next action.** This is a focused UI change with disproportionate perceived-value upside because Today is where the product reintroduces itself every day.
7. **Make restore and purchase-sync states unmistakable on native billing surfaces.** Low effort, high trust impact, especially for already-paying users.
8. **Tighten account/subscription rows so state and next action live together.** This pattern repeats across account, settings, pricing, and billing.
9. **Normalize action-first empty states.** Atlas already has this pattern in places; making it consistent is a fast win.
10. **Add one visible "why" label to proactive insight cards.** This is small, but it fixes a major comprehension problem in one of Atlas's differentiating surfaces.

## Design system implications

### 1. A real system-state primitive

This should be built once and reused broadly:

- loading
- empty
- partial failure
- blocking failure
- offline
- retry
- permission pre-prompt / denied state

The existing `StablePage.jsx` is the right seed. It should become a contract, not just a utility file.

### 2. Status rows and disclosure rows

A lot of surfaces want the same atom:

- label
- current value/status
- small source/freshness/ownership badge
- one next action

Billing, account, integrations, coach context badges, and settings rows all want variants of this.

### 3. Trend-card and chart frame primitives

Measurements, weight, weekly review, Today, coach context, and nutrition all want some combination of:

- a trend headline
- a time-window switcher
- chart area
- comparison baseline
- compact explanation text

That should not be reinvented in each surface.

### 4. Reusable coach/action patterns

Coach surfaces repeatedly want:

- context lines
- freshness labels
- one suggested next action
- dismiss / regenerate / continue affordances

If Atlas wants the AI layer to feel coherent, these patterns need a shared design language rather than bespoke implementations.

### 5. Checkpoint/composer flows

Several surfaces point toward the same multi-step pattern:

- progress-photo checkpoint capture
- weight/body entry
- AI food capture review
- daily check-in composer

They all want staged input, review-before-save, clear success, and draft persistence. That is a reusable flow model, not four isolated designs.

### 6. Export/share pipeline

`27-share-cards.md` makes a strong case that Atlas should have one export pipeline and one truth-first share shell. If built well, that same export/rendering discipline can help reporting and progress snapshots too.

## What I'm most worried about

The biggest product risk is that Atlas is drifting toward "premium-feeling shells over inconsistent system truth." Many of the surfaces look directionally good in code, but too many of them still contain placeholder pages, duplicate ownership, hidden no-op logic, or fallback behavior that masks failure as emptiness. That is more dangerous than visibly rough UI. Rough UI can still be trusted. Polished but misleading UI cannot.

The second risk is that the app's differentiators are not yet sharply separated. Coaching appears in chat, in Today, in briefing logic, and in a separate unused insights service. Nutrition exists as targets, planning, AI capture, and logging, but the source of truth is not obvious. Workouts have library, execution, and history pieces, but not one fully reliable lifecycle. If these domains stay architecturally blurred, Atlas will keep shipping "more capability" without getting much more legible to the user.

The third risk is billing trust. Subscription products can survive a mediocre paywall longer than they can survive contradictory purchase rules. Right now the teardowns suggest Atlas is still too willing to let web, native, onboarding, and account surfaces describe the same contract differently. That is a conversion problem, a support problem, and eventually a reputation problem.

The last risk is that the team may attack this as a visual-refresh project when it is really an ownership-and-truth project. The highest-ROI work here is not "make it prettier." It is: define who owns each user job, make state honest, and make the system explain itself in small but consistent ways.

## Suggested reading order for Enzo

1. `05-post-onboarding-paywall.md`
2. `22-native-paywall.md`
3. `21-pricing-page-web.md`
4. `01-coach-chat.md`
5. `06-todayv2-dashboard.md`
6. `18-coach-insights-proactive-cards.md`
7. `08-daily-nutrition-log.md`
8. `13-active-workout.md`
9. `04-onboarding-v2-28-screens.md`
10. `23-manage-subscription.md`
11. `31-system-states-empty-loading-errors-offline-permissions.md`
12. `25-settings-hub.md`
13. `24-account-profile.md`
14. `26-integrations.md`
15. `16-measurements-history-charts.md`
16. `17-progress-photos.md`
17. `10-ai-food-logging-photo-text-barcode.md`
18. `11-macro-target-setup.md`
19. `07-weekly-review.md`
20. `12-workout-library.md`
21. `14-workout-history-protocol.md`
22. `09-meal-plan-view.md`
23. `19-daily-check-in-flow.md`
24. `20-lab-results.md`
25. `27-share-cards.md`
26. `03-sign-up-log-in.md`
27. `02-welcome-splash.md`
28. `28-affiliate-creator-code.md`
29. `29-admin-dashboard-settings-audit-users.md`
30. `30-styleguide.md`
31. `15-weight-body-comp-entry.md`
