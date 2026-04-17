# Teardown 07 — Weekly review

**Surface:** Today/home weekly review signals and the adjacent weekly check-in flow; this is an implicit surface, not a dedicated weekly-review page.
**Atlas file(s):** [src/pages/TodayV2.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/TodayV2.jsx:496), [src/components/today/WeeklySummary.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/today/WeeklySummary.jsx:12), [src/components/today/WeeklyCheckinModal.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/today/WeeklyCheckinModal.jsx:40), [src/components/body/BodyCheckinSheet.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/body/BodyCheckinSheet.jsx:1), [src/services/checkinService.js](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/services/checkinService.js:18), [src/components/today/TodayMobileUI.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/today/TodayMobileUI.jsx:43), [src/components/today/ProgressReviewCard.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/today/ProgressReviewCard.jsx:6)
**Reference apps:** Strava (primary)
**Audience tension:** High — serious optimizers want a compact, data-backed weekly readout, while general users need a gentle recap that tells them what to do next without feeling like a spreadsheet.

---

## Why this screen matters

Weekly review is where Atlas can convert scattered daily logs into a reason to keep coming back. A good version turns “I tracked a few things this week” into “I can see the pattern, and I know what matters tomorrow.” For retention, this is one of the few surfaces that can make the product feel progressively smarter instead of just chronologically busier.

When this surface is broken, users get fragments: a streak pill, a seven-day strip, a workout counter, and a separate check-in modal that do not add up to a coherent weekly story. That weakens both behavior change and trust. A world-class weekly review gives users one clear place to answer three questions: what happened, what changed, and what should I do next.

This surface also sits at a revenue boundary. It is one of the best places to justify Pro because the value is not raw logging, it is interpretation. If Atlas gets this right, weekly review becomes the moment users feel the system earning its keep; if it gets this wrong, the product feels like a collection of disconnected widgets.

---

## Reference app 1 — Strava (primary)

Strava is the right primary reference because its Progress/Training surfaces are built for people who want to inspect history, not just complete tasks. That overlaps with Atlas’s serious-optimizer segment, but Strava still keeps the experience legible enough that casual athletes can understand the signal quickly. The current Strava support docs make this visible across the Training Log, Progress Summary Chart, Relative Effort, Monthly Recap, and training-log privacy controls. See [Training Log](https://support.strava.com/hc/en-us/articles/206535704-Training-Log), [Progress Summary Chart](https://support.strava.com/hc/en-us/articles/28437860016141-Progress-Summary-Chart), [Relative Effort](https://support.strava.com/hc/en-us/articles/360000197364-Relative-Effort), [Monthly Recap](https://support.strava.com/hc/en-us/articles/360057807412-Monthly-Recap), and [Training Log Privacy Controls](https://support.strava.com/hc/en-us/articles/219868027-Training-Log-Privacy-Controls).

### What Strava does that works

1. **Gives one canonical place to review training.** Strava’s Training Log is presented as the place where all training lives, rather than scattering weekly context across unrelated screens. That matters because users do not have to remember where to inspect their progress; the mental model is simple, and the product keeps reinforcing it.

2. **Shows weekly history before summary opinion.** The Training Log and Progress Summary Chart both foreground a week-first view, then let users drill into days or activity lists. That sequencing is strong because it respects the user’s need to see evidence before narrative.

3. **Supports drill-down from trend to source data.** Strava’s chart allows tapping into a specific week and then the activities that created that signal. That is the right shape for weekly review: users trust a score more when they can inspect the raw contributors immediately after.

4. **Adds comparison, not just counting.** Relative Effort introduces a weekly range and a comparison against recent baseline, which is more useful than “you did 4 workouts.” The value is not the absolute number; it is the context that tells users whether they are undercooking, overreaching, or simply on pace.

5. **Uses time-range controls to support different moods.** The Progress Summary Chart exposes multiple windows, including 1W, 1M, 3M, 6M, YTD, and 1Y. That lets athletes shift between “what happened this week?” and “what is my broader pattern?” without leaving the same review system.

6. **Keeps the visual encoding consistent.** Training Log uses a stable mapping of colors and symbols to activity types, so users can learn the pattern once and read it fast afterward. For weekly review, consistency matters more than ornamental variety.

7. **Makes the recap shareable, but optional.** Monthly Recap includes share/download affordances, while the underlying profile remains private by default. That balance is smart: review can be social when the user wants it, but it does not force public performance into a health workflow.

### What Strava does that you shouldn't copy

1. **Do not copy the sport-analytics density wholesale.** Strava can afford activity-type filters, per-sport metrics, and a deep training vocabulary because its core audience lives in that language. Atlas needs to stay much more opinionated and much less configurable on this surface, or the weekly review will feel like admin.

2. **Do not copy public-social framing into a private coaching surface.** Strava’s shareable recaps and public training artifacts work because the product is explicitly social. Atlas should borrow the optional share mechanic, not the assumption that users want to perform their week for other people.

3. **Do not copy a graph-first hierarchy if the graph cannot explain itself.** Strava’s graphs work because they connect to drill-down, baseline comparisons, and activity lists. A nice-looking chart with no explanation would be weak in Atlas, especially for users who are not already fluent in training metrics.

---

## What Atlas does today (current state)

This surface is partial and implicit rather than dedicated. The visible Today/home experience lives in [TodayV2.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/TodayV2.jsx:741), which mounts a streak pill, a seven-day chain-dot strip, and a weekly workout progress bar inline. Those are the only weekly-review-like elements actually rendered on the screen; there is no standalone weekly review page.

The codebase also contains a standalone [WeeklySummary.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/today/WeeklySummary.jsx:12), but `rg` finds no import or usage anywhere else in `src/`. It computes a seven-day bar chart from check-ins, meals, and workouts, scoring each day with a fixed 40/30/30 heuristic, but that component is currently dead code. The same is true of [WeeklyCheckinModal.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/today/WeeklyCheckinModal.jsx:40), which renders a “Weekly check-in” dialog, but is not mounted from TodayV2; the active check-in quick action opens [BodyCheckinSheet.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/body/BodyCheckinSheet.jsx:1) instead.

The interaction model is therefore fragmented. TodayV2 opens `BodyCheckinSheet` for the scale/check-in action, `QuickMealSheet` for meals, and `CoachChatSheet` for coaching, while the weekly review logic is split across the chain dots, the workout count, and the unused weekly summary/modal components. `ProgressReviewCard.jsx` adds another disconnected signal by linking to Insights with the label “Your weekly summary hub,” but it is not wired into Today/home either.

Visually, the surface follows the rest of TodayV2’s compact card stack: rounded 18-24px surfaces, muted card and shell backgrounds, low-contrast labels around 10-13px, and brand color used only for emphasis. The weekly bar chart in `WeeklySummary.jsx` is especially simple: a seven-column bar view with day labels and three small metrics, not a full review narrative. That keeps the surface calm, but it also means the current implementation reads as “status fragments” rather than a weekly review.

Known issues from code reading:

- `WeeklySummary.jsx` and `WeeklyCheckinModal.jsx` both use `new Date().toISOString().split('T')[0]` for day keys, while the service layer in `checkinService.js` normalizes to local date keys. That creates a timezone mismatch risk for users outside UTC.
- `WeeklySummary.jsx` assumes `allCheckins`, `meals`, and `workouts` are always arrays. If someone wires the component with missing props, it will throw.
- `WeeklySummary.jsx` counts `workoutsThisWeek` as the number of days with workouts, not the number of completed workouts. That label is easy to misread.
- `WeeklyCheckinModal.jsx` says “Weekly check-in” but saves a payload for today’s date and only captures today-level energy, mood, sleep, and notes. The naming and the data model are not aligned.
- `ProgressReviewCard.jsx`, `WeeklySummary.jsx`, and `WeeklyCheckinModal.jsx` look like a partially abandoned review system rather than one coherent entry point.

Gaps relative to Strava:

- There is no canonical weekly review surface with one entry point.
- There is no week drill-down, calendar navigation, or date-range comparison.
- There is no trend context beyond simple counts and the 40/30/30 day score.
- There is no shareable recap or optional export path.
- There is no equivalent of Strava’s “show me the week, then let me inspect the source” flow.

---

## Patterns to steal, ranked by ROI

### 🟢 Steal immediately — high impact, low effort

1. **Make one weekly anchor.** Atlas should not ask users to parse chain dots, workout counts, and a dead summary component as separate signals. Put the weekly review behind one visible card or module on Today/home so the user knows exactly where to look. Effort: 1-2 days.

2. **Show the week before the opinion.** Borrow Strava’s habit of showing a seven-day pattern first, then a compact takeaway. Atlas already has the raw week data; the immediate win is making the week itself readable before asking users to interpret it. Effort: 1-2 days.

3. **Keep the score explainable.** If Atlas uses a weekly score, it needs to show what moved it. Strava’s relative-effort style works because the number has context; Atlas’s 40/30/30 scoring should be paired with the underlying contributors. Effort: 1 day.

4. **Add a true empty state.** Weekly review has to remain useful on a weak week, not only a perfect one. A clean “you logged three days, here is what that means” state would be much better than a blank bar chart or a generic encouragement message. Effort: 0.5-1 day.

### 🟡 Steal soon — medium impact, medium effort

1. **Add drill-down on tap.** The user should be able to tap a day in the weekly view and see the check-in, workouts, meals, and notes that created that day. This is the single best way to move the screen from vanity summary to actual review. Effort: 2-4 days.

2. **Compare to a recent baseline.** Strava’s weekly range and compare-date-range pattern is the right inspiration here. Atlas should show whether this week is up, flat, or down versus the last 3 weeks, because that is what makes a review actionable. Effort: 2-3 days.

3. **Create one follow-through action.** After the week is summarized, give the user one next step: adjust plan, log a check-in, or open coaching. That closes the loop and prevents the review from becoming an end state with no behavior change. Effort: 1-2 days.

4. **Normalize the date layer.** This is less glamorous than a new chart, but it matters more. Use one shared local-date helper for every weekly-review component so the same day never resolves differently in the UI and in storage. Effort: 0.5-1 day.

### 🔴 Consider carefully — high effort or audience-dependent

1. **Add shareable recap artifacts.** Strava’s recap/export pattern is strong, but Atlas should only do this if the product strategy actually wants social proof or coach-sharing on this surface. If it is added too early, it will feel like marketing instead of review. Effort: 2-5 days.

2. **Add calendar-style browsing.** A full month/year navigator can be useful for power users, but it is a big jump in complexity for a surface that is still missing its core weekly anchor. Do this only if the weekly view becomes a high-traffic destination. Effort: 3-5 days.

3. **Add more metrics than the user can actually act on.** Strava can sustain multiple overlays because it serves athletes with a strong metric vocabulary. Atlas should not add hydration, sleep, recovery, weight, and training load all at once unless the screen has a strong hierarchy. Effort: variable, but product-heavy.

---

## Atlas-specific design tensions to resolve

**Tension 1 — Encouragement vs diagnosis.**  
Weekly review can either feel like a supportive recap or a scorecard that judges the user’s week. Atlas currently leans toward supportive fragments, but that also makes the output vague. *Resolution:* keep the tone warm, but make the week legible and specific; users should leave knowing what happened and what to do next.

**Tension 2 — One score vs many signals.**  
A single weekly score is easy to scan, but it hides the reason the score exists. The current 40/30/30 implementation in `WeeklySummary.jsx` is simple enough to understand, but not enough to trust on its own. *Resolution:* keep one headline score, but always show the three to four inputs that produced it.

**Tension 3 — Implicit habit vs explicit destination.**  
Today/home is already crowded with actions, streaks, nutrition, plans, and AI. A weekly review hidden inside that stack will be easy to miss unless it is visually named and placed as a destination. *Resolution:* give weekly review its own card and its own CTA, even if it still lives on Today.

**Tension 4 — Serious optimizer vs general wellness user.**  
Serious users want trend deltas, ranges, and drill-down. Casual users want reassurance and a simple nudge. *Resolution:* show the same weekly view to both, but layer the detail progressively so the top level reads in one second and the drill-down serves the power user.

---

## Specific changes to make (actionable list)

1. **Create one explicit weekly review card on Today and make it the entry point for the surface.** Replace the current split of `ChainDots` plus `WeeklyProgress` with a single weekly module that says what the week was, not just how many dots are filled.  
Files: [src/pages/TodayV2.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/TodayV2.jsx:849), [src/components/today/WeeklySummary.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/today/WeeklySummary.jsx:12)  
Effort: 1-2 days  
Depends on: none

2. **Wire the existing weekly summary component into the Today surface or delete it.** Right now `WeeklySummary.jsx` is dead code; if the team wants a weekly review, this is the most obvious component to revive and refine.  
Files: [src/components/today/WeeklySummary.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/today/WeeklySummary.jsx:12), [src/pages/TodayV2.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/TodayV2.jsx:741)  
Effort: 1-2 days  
Depends on: 1

3. **Make the weekly summary drillable by day.** Tapping a day should open a bottom sheet or drawer that shows the check-ins, meals, workouts, and any note attached to that date.  
Files: [src/components/today/WeeklySummary.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/today/WeeklySummary.jsx:12), [src/services/checkinService.js](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/services/checkinService.js:108)  
Effort: 2-4 days  
Depends on: 1

4. **Fix date handling so weekly review uses one local date key everywhere.** Stop deriving review dates from `toISOString()` in the UI and align all date keys with the local-date helpers used in `checkinService.js`.  
Files: [src/components/today/WeeklySummary.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/today/WeeklySummary.jsx:15), [src/components/today/WeeklyCheckinModal.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/today/WeeklyCheckinModal.jsx:69), [src/services/checkinService.js](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/services/checkinService.js:18)  
Effort: 0.5-1 day  
Depends on: none

5. **Resolve the `WeeklyCheckinModal` naming and behavior mismatch.** Either make it a real weekly reflection flow or rename it so it matches the data it writes; right now it says “weekly” while saving today-level energy and mood.  
Files: [src/components/today/WeeklyCheckinModal.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/today/WeeklyCheckinModal.jsx:40), [src/services/checkinService.js](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/services/checkinService.js:163)  
Effort: 1-2 days  
Depends on: 1

6. **Replace the current workout count with a clearer trend comparison.** Keep the count if needed, but add “up/down vs last week” or “within range” context so the user can tell whether they are improving or just accumulating sessions.  
Files: [src/pages/TodayV2.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/TodayV2.jsx:465), [src/components/today/WeeklySummary.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/today/WeeklySummary.jsx:33)  
Effort: 1-2 days  
Depends on: 1

7. **Add a sparse-data empty state for low-logging weeks.** If there are only one or two logged days, the weekly review should still explain the week instead of pretending the bar chart is meaningful.  
Files: [src/components/today/WeeklySummary.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/today/WeeklySummary.jsx:12)  
Effort: 0.5-1 day  
Depends on: 1

8. **Decide whether `ProgressReviewCard` belongs in Today or in Insights.** If it is meant to be a weekly-review gateway, wire it into the home surface; if not, remove it so the product does not imply a second weekly hub that does not exist.  
Files: [src/components/today/ProgressReviewCard.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/today/ProgressReviewCard.jsx:6), [src/pages/TodayV2.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/TodayV2.jsx:741)  
Effort: 0.5-1 day  
Depends on: 1

9. **Add one follow-through CTA after the weekly review is seen or completed.** After the user reads the week, offer a single next action such as opening coaching, adjusting the plan, or logging the missing check-in.  
Files: [src/pages/TodayV2.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/TodayV2.jsx:826), [src/components/today/WeeklySummary.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/today/WeeklySummary.jsx:37)  
Effort: 1 day  
Depends on: 1, 3

10. **Keep the weekly review visually aligned with Today but more clearly labeled.** Reuse the existing card system from `TodayMobileUI.jsx`, but make the review feel like a deliberate destination instead of another anonymous status tile.  
Files: [src/components/today/TodayMobileUI.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/today/TodayMobileUI.jsx:43), [src/pages/TodayV2.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/TodayV2.jsx:741)  
Effort: 0.5-1 day  
Depends on: 1

Total effort: roughly 8-15 days, depending on whether the team wants just a visible weekly summary or a fully drillable review flow. The biggest perceived quality jump will come from making the weekly surface explicit, making each day tappable, and fixing the date/behavior mismatch in the current check-in components.

---

## What NOT to do

1. Do **not** add a second generic dashboard chart that repeats the same information in a different shape.
2. Do **not** turn the weekly review into a social feed or public brag card by default.
3. Do **not** copy Strava’s multi-filter complexity unless Atlas first has a strong weekly destination that users already trust.
4. Do **not** leave `WeeklyCheckinModal` titled as weekly while it saves only today’s date and inputs.
5. Do **not** make the surface feel punitive; a weekly review that reads like a bad report card will cause avoidance, not reflection.

---

## The single highest-leverage thing

Make weekly review a single explicit card on Today that summarizes the week, explains what drove the score, and lets the user drill into any day. That one move would fix the current fragmentation problem, give the team a real place to evolve the surface, and align Atlas with the strongest Strava pattern: show the week first, then let the user inspect the evidence behind it.

---

**File status:** Draft 1. To be revised after implementation against reality.
