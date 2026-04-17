# Teardown 14 - Workout history & protocol

**Surface:** Workout history context in the training flow, plus protocol template/adherence management in the Protocols area.
**Atlas file(s):** `src/services/workoutHistoryService.js`, `src/components/workouts/WorkoutExecutionScreen.jsx`, `src/pages/WorkoutsV2.jsx`, `src/pages/Protocols.jsx`, `src/pages/ProtocolDetail.jsx`, `src/components/protocols/ProtocolForm.jsx`, `src/components/protocols/TodayDoseSection.jsx`, `src/components/protocols/ProtocolCard.jsx`, `src/components/protocols/ProtocolTimeline.jsx`, `src/services/protocolService.js`
**Reference apps:** Hevy (primary)
**Audience tension:** High - serious lifters need precise last-session context and durable history, while general users need a simple "what is due now" surface that does not feel like a lab report.

---

## Why this screen matters

This surface is where Atlas either feels like a real training system or just another logger. The workout-history side is the execution memory that tells a user what they lifted last time and whether the next set should move up. The protocol side is the daily adherence engine that answers what is active, what is due today, and what has been finished or paused.

If this is broken, users lose trust. On the workout side, they guess loads, lose momentum, and stop believing the app remembers them. On the protocol side, they miss doses, misread status, or do not understand whether a protocol is a living template or a completed record. That is churn territory for serious users and confusion territory for general users.

World-class here means two things at once: a lifter can see the last useful training signal at the exact moment they need it, and a protocol user can see today, history, and status without ever wondering whether they are editing a template or reviewing a completed action.

---

## Reference app 1 - Hevy (primary)

Hevy is the right reference because it is built for strength-training users who care about logging quality, previous values, routines, and completed-session history. That is close to Atlas's serious-user segment. The Hevy patterns come from making history actionable at the point of entry. See Hevy's official [Previous Workout Values](https://www.hevyapp.com/features/track-exercises/), [Track Workouts](https://www.hevyapp.com/features/track-workouts/), [Features guide](https://help.hevyapp.com/hc/en-us/articles/33106320824727-Everything-You-Need-to-Know-About-the-Hevy-App-2025-Features-Guide), and [Calendar and streak features](https://help.hevyapp.com/hc/en-us/articles/35380117933207-Track-Your-Workout-Consistency-with-the-Calendar-and-Streak-Features).

### What Hevy does that works

1. **Previous values inline**. Hevy shows prior performance while you are logging the exercise, not in a separate stats page. That matters because the user can compare against the last session without leaving the current action. This is the core history pattern Atlas should keep: history as a decision aid, not a museum.

2. **Routines and empty workouts coexist**. Hevy supports reusable routines and ad hoc empty workouts without forcing one mental model on everyone. That is valuable because it serves both planners and improvisers. Atlas should preserve that split, especially for users who follow templates sometimes and freestyle other days.

3. **Completion recap has meaning**. Hevy does not treat a finished workout as a dead row. It gives the session a recap moment with PR context, streak context, and a sense of progress. That helps retention because completion feels like a reward, not just a data write.

4. **Calendar-based history browsing**. The calendar makes completed workouts easy to scan by date, with clear highlight states and direct entry into a logged session. That gives users a chronological archive that is faster than searching a feed. Atlas needs some version of this for workouts and probably a lighter version for protocol logs.

5. **Exercise library carries history forward**. Hevy surfaces recent performance and exercise performance charts from the exercise context itself. That is strong because the history is attached to the movement, which is how lifters think. Atlas's exercise history should feel like an extension of the exercise, not a detached report.

6. **Saved workout archive is navigable**. Hevy keeps completed workouts as persistent objects with summary data, so users can always open a session and inspect what happened. Atlas should do the same for completed workouts if it wants to feel serious.

7. **Progress metrics stay concrete**. Hevy emphasizes PRs, volume, frequency, and consistency instead of vague encouragement. Atlas should steal that specificity.

### What Hevy does that you shouldn't copy

1. **Do not copy the social layer wholesale**. Hevy's comments, likes, and feed mechanics are useful for community-driven retention, but Atlas is not trying to become a social network first. For Atlas, those mechanics would dilute the core promise of clarity and personal execution.

2. **Do not lean too hard on streak theater**. Streaks are motivating in a generic workout app, but they can become noisy or guilt-inducing when the user is following a structured protocol or recovering. Atlas should favor adherence, recency, and completion over trophy logic.

3. **Do not copy smartwatch-first assumptions**. Hevy spans phone, web, and wearables; Atlas's current product shape is more specific and does not need that complexity yet. Copying the device breadth would create scope without improving this surface.

---

## What Atlas does today (current state)

- **Layout and navigation structure.** Workout history lives inside the training flow, mainly in `src/pages/WorkoutsV2.jsx`, where list mode shows an active plan, upcoming days, and a `History` section with recent sessions, while execution mode swaps the whole page into `WorkoutExecutionScreen`. Protocols live separately in `src/pages/Protocols.jsx` with a route-level page shell, an add button, today focus, schedule, timeline, active cards, adherence, and an advanced analysis gate. A dedicated detail route exists in `src/pages/ProtocolDetail.jsx` with back/edit actions and a recent-history section. The code separates protocol templates from completed workout history, but the UI does not yet make that distinction explicit enough.

- **Key interactions.** Workout history is live execution context: `src/services/workoutHistoryService.js` fetches the last 30 completed workouts, `WorkoutExecutionScreen` uses the last session for each exercise to prefill weight and reps, and the screen shows immediate per-set history after a set is saved. On the protocol side, `src/pages/Protocols.jsx` supports create/edit, quick-add templates, log dose, pause/resume/finish/delete, and status-driven cards. `ProtocolDetail.jsx` supports logging taken or skipped doses and changing status.

- **Visual approach.** Both surfaces use rounded cards, soft fills, subdued borders, and gradient accents rather than loud dashboards. Workout history is visually lighter and more execution-oriented. Protocols are denser and more dashboard-like, with today cards, schedule/timeline panels, and concentration analysis that feels more clinical and operational.

- **Known issues from code reading.** `src/pages/ProtocolDetail.jsx` has a placeholder `_buildDaily14()` that returns an empty array, so the 14-day adherence bar cannot render daily breakdown. `src/components/protocols/TodayDoseSection.jsx` and `src/components/protocols/ProtocolCard.jsx` infer due and missed states mostly from free-text frequency and date-string matching, which is coarse. `src/components/protocols/ProtocolTimeline.jsx` only renders active protocols and slices to five items. `src/services/workoutHistoryService.js` only looks back 30 workouts, and `src/pages/WorkoutsV2.jsx` only shows a short recent-session list.

- **Gaps relative to Hevy.** Atlas has the raw data and some nice local affordances, but it lacks a browseable completed-workout archive, a clear post-session recap, and a clean drill-down from recent sessions into exercise-level history. On the protocol side, Atlas has more advanced analysis than Hevy, but it still needs a clearer separation between living templates, active adherence, and completed history if it wants to stay legible.

---

## Patterns to steal, ranked by ROI

### 🟢 Steal immediately - high impact, low effort

1. **Inline last-session context**. Copy the Hevy pattern of showing the previous session right where the set is logged. Atlas already has the data flow in `WorkoutExecutionScreen`, so the missing work is mostly presentation and microcopy. Effort: 1-2 days.

2. **Today-first layout**. Make the top of each surface answer the current question before anything else. In workouts that means the current training session or today's plan; in protocols that means what is due now. This reduces scanning and makes the surface feel decisive. Effort: 0.5-1 day.

3. **Post-completion recap**. Add a real "session saved" view that summarizes what changed, what PRs happened, and what the next action is. This is a high-retention moment because it gives the workout history emotional and practical weight. Effort: 2-3 days.

4. **Recent-session drill-in**. Turn the recent workouts list into an entry point, not an endpoint. Users should be able to open a session and see exercise-level context, not just a one-line summary. Effort: 1-2 days.

### 🟡 Steal soon - medium impact, medium effort

1. **Real daily adherence breakdown**. Replace the placeholder daily bar in `ProtocolDetail.jsx` with actual log-level data. This would make the protocol history section feel credible instead of decorative. Effort: 1-2 days.

2. **Structured schedule model**. Replace free-text cadence inference with structured schedule state for protocols. That will make due logic more reliable and reduce the number of places that need date-string heuristics. Effort: 2-4 days.

3. **Exercise-level history panel**. Add a stronger history card in the training flow that shows last use, last load, and PR context for the selected exercise. This is the closest Atlas equivalent to Hevy's previous-values affordance. Effort: 2-4 days.

### 🔴 Consider carefully - high effort or audience-dependent

1. **Archive-grade protocol history**. Build a true archive for finished protocols instead of letting them disappear from the active view. This is valuable, but it needs a product decision about how much historical state should remain editable versus read-only. Effort: 3-5 days.

2. **Deeper analytics panels**. The concentration curve and half-life analysis are interesting, but they only pay off if the underlying history model is already trustworthy and easy to read. Do this last, not first. Effort: 3-5 days.

---

## Atlas-specific design tensions to resolve

**Tension 1 - Template vs history.**
The repo already separates protocol templates from completed workout history in code, but the UI still invites confusion because both are presented as "cards with status". *Resolution:* keep protocol templates and workout history on different visual rails. Protocol rows should look editable and operational; completed workouts should look immutable and chronological.

**Tension 2 - Serious lifter vs general user.**
Serious users want set-level memory, recent load comparisons, and accurate adherence state. General users want to know what to do today without decoding a dashboard. *Resolution:* make the top-level view extremely simple, then reveal history depth through drill-downs and secondary panels.

**Tension 3 - Due now vs browse later.**
Both surfaces are trying to show current action and historical context at once. That can turn into a cluttered dashboard if the archive fights the CTA. *Resolution:* always place "what is due or active now" above "what happened before", and keep the archive visually quieter.

**Tension 4 - Compliance vs flexibility.**
Protocols imply adherence, but workouts imply adaptation. If the UI treats everything like a fixed plan, it will frustrate users who need to adjust on the fly. *Resolution:* make protocols easy to edit, but treat completed workout history as append-only and resistant to silent rewrites.

---

## Specific changes to make (actionable list)

1. **Add a drill-down from `Recent sessions` into a completed-workout detail view.** File(s) to touch: `src/pages/WorkoutsV2.jsx`, `src/services/workoutService.js`. Effort: 2-3 days. Dependency: none.

2. **Show exercise-level previous values before the user starts logging the first set.** File(s) to touch: `src/components/workouts/WorkoutExecutionScreen.jsx`, `src/services/workoutHistoryService.js`. Effort: 1-2 days. Dependency: none.

3. **Replace the placeholder 14-day adherence builder with actual per-day protocol logs.** File(s) to touch: `src/pages/ProtocolDetail.jsx`, `src/services/protocolService.js`. Effort: 1-2 days. Dependency: none.

4. **Normalize protocol cadence into structured schedule data.** File(s) to touch: `src/components/protocols/ProtocolForm.jsx`, `src/components/protocols/TodayDoseSection.jsx`, `src/services/protocolService.js`. Effort: 2-4 days. Dependency: task 3.

5. **Split the Protocols page into clearer live and archived states.** File(s) to touch: `src/pages/Protocols.jsx`, `src/components/protocols/ProtocolCard.jsx`, `src/components/protocols/ProtocolTimeline.jsx`. Effort: 2-3 days. Dependency: task 4.

6. **Make today's protocol block the primary action and reduce its reliance on inferred text cadence.** File(s) to touch: `src/components/protocols/TodayDoseSection.jsx`, `src/components/protocols/ProtocolCard.jsx`. Effort: 1-2 days. Dependency: task 4.

7. **Add a post-session recap that highlights PRs, last-session deltas, and the next suggested load.** File(s) to touch: `src/components/workouts/WorkoutExecutionScreen.jsx`, `src/pages/WorkoutsV2.jsx`. Effort: 2-3 days. Dependency: task 2.

8. **Expose a completed workout archive with filters for date, duration, and volume.** File(s) to touch: `src/pages/WorkoutsV2.jsx`, `src/services/workoutHistoryService.js`, `src/services/workoutService.js`. Effort: 2-4 days. Dependency: task 1.

9. **Add a clearer archived-protocol state for finished items.** File(s) to touch: `src/pages/Protocols.jsx`, `src/pages/ProtocolDetail.jsx`. Effort: 2-3 days. Dependency: task 5.

10. **Make the empty and error states point to one obvious next step.** File(s) to touch: `src/pages/WorkoutsV2.jsx`, `src/pages/Protocols.jsx`, `src/pages/ProtocolDetail.jsx`. Effort: 1 day. Dependency: none.

11. **Reduce duplicate status logic across protocol components.** File(s) to touch: `src/components/protocols/ProtocolCard.jsx`, `src/components/protocols/TodayDoseSection.jsx`, `src/pages/ProtocolDetail.jsx`, `src/services/protocolService.js`. Effort: 1-2 days. Dependency: task 4.

Total effort: about 16-24 days.

Biggest perceived-quality jumps: tasks 1, 2, 3, and 4. Those four make the surface feel trustworthy, legible, and meaningfully different from a generic list view.

---

## What NOT to do

1. **Do not merge workout history and protocol templates into one generic list.**

2. **Do not add social-feed mechanics, likes, or comments to the workout history surface.**

3. **Do not bury the current action under charts, timelines, or pharmacokinetic visuals.**

4. **Do not use streak language as the main framing for protocols if adherence is the real behavior you care about.**

5. **Do not make completed workouts feel editable in ways that quietly rewrite the historical record.**

---

## The single highest-leverage thing

Build a real drill-down from the recent workout list into a completed-session detail view, and keep that history visually separate from live protocol management. Right now Atlas has enough data to suggest the next set and enough protocol state to show today, but it still does not give users a clean answer to the most important historical question: "What did I do last time, and what should change now?" If the team fixes that one loop, the surface stops feeling like summary widgets and starts feeling like an execution system.

**File status:** Draft 1. To be revised after implementation against reality.
