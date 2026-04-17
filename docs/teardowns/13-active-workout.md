# Teardown 13 — Active Workout

**Surface:** In-progress workout execution for plan-based sessions and quick workouts, including set logging, rest timing, session resume, and workout completion.
**Atlas file(s):** `src/pages/TrainV2.jsx` (live `/Workouts` route), `src/components/workouts/WorkoutExecutionScreen.jsx`, `src/components/workouts/QuickWorkoutModal.jsx`, `src/components/workouts/ExerciseSearch.jsx`, `src/lib/workoutSession.js`, `src/services/workoutService.js`, `src/services/workoutHistoryService.js`, `src/components/workouts/WorkoutGuardSheet.jsx`, `src/pages/WorkoutsV2.jsx` (orphaned alternate page, not routed), `src/components/workouts/WorkoutExecution.jsx` and `src/components/workouts/RestTimer.jsx` (legacy/unwired)
**Reference apps:** Hevy (primary), Strong (secondary)
**Audience tension:** Medium — serious lifters want progression, PRs, and fast logging; general users want the workout to stay simple enough that they do not bail mid-session.

---

## Why this screen matters

This is the moment where Atlas either earns trust or loses the workout. The active screen is the bridge between a plan and a logged result, so if it feels slow, confusing, or brittle, users stop recording sets in Atlas and the rest of the product loses its input data. That breaks adherence tracking, PR detection, workout history, and any coaching or plan feedback that depends on completed sessions.

For Atlas, this surface is not just a logging form. It is the operational center of the workouts area: the page where a planned day becomes an actual session, where a quick workout becomes durable history, and where interruptions need to be recoverable without losing state. If this is broken, retention drops because the app stops feeling dependable when the user is already in the gym and least tolerant of friction.

World-class here means two things at once: the screen stays fast enough for a sweaty, one-handed gym context, and it still captures enough structure for serious users to care. Atlas already has the beginnings of that balance. The remaining problem is not concept; it is consistency and execution discipline.

---

## Reference app 1 — Hevy (primary)

Hevy is the better primary reference because it serves the exact user who notices workout execution details first: someone in the gym, under time pressure, trying to log accurately without losing flow. Atlas only partially matches that audience today, so the right takeaway is not visual imitation. It is the interaction model: keep the active screen focused, keep progression visible, and keep rest dead simple.

### What Hevy does that works

**1. It turns workout execution into a single job.** The user is not asked to browse a catalog, edit a plan, or think about history while logging. The active screen is about the current workout and the current set. That discipline matters because in the gym, context switching is the real UX cost.

**2. It makes rest impossible to miss.** Hevy's rest state is visually dominant, with the countdown as the whole point of the screen. That works because the timer is the only thing the user needs during rest, and it reduces the temptation to keep poking the phone between sets.

**3. It surfaces prior performance inline.** The user gets last-session context where they are about to log, not in a separate analytics panel. This supports progressive overload without turning every set into a research task.

**4. It keeps progression feedback immediate.** When the user logs a good set, the app should reward it right away with a PR or progression cue. That feedback loop is important because it reinforces the habit of logging correctly, not just completing workouts.

**5. It keeps the entry path short.** Start workout, log set, rest, next set. That is the rhythm the screen should protect. The more the active flow resembles a checklist of tiny, unambiguous actions, the less likely users are to drop out midway.

**6. It preserves workout structure while still feeling editable.** Hevy supports template-driven sessions, but the active workout still feels like a mutable, live thing. That is the right balance for Atlas too: structure should help execution, not lock it down.

### What Hevy does that you shouldn't copy

**1. Heavy strength-jargon defaults.** Hevy assumes most users already think in lifting terms. Atlas serves a wider fitness audience, so the UI cannot depend on power-user vocabulary to make sense.

**2. A strength-only worldview.** Hevy's best patterns are great for lifting, but Atlas has to support hybrid and beginner workouts as well. Do not let the active screen become a barbell-only interface.

**3. Over-optimizing for catalog depth.** A rich exercise database is useful, but if the active flow spends too much time helping the user choose exercises, it stops being an execution screen. The plan is supposed to be ready before the workout starts.

---

## Reference app 2 — Strong (secondary)

Strong is the right secondary reference because it shows what happens when the active workout is stripped down to just the essentials. That adds something Hevy does not: a reminder that logging speed and minimal visual noise are not a downgrade. They are often the whole point for users who care about finishing the session without distraction.

### What Strong does that works

**1. It prioritizes fast numeric entry.** Strong's active logging is built around fast access to weight, reps, and rest. That is valuable because it reduces the number of gestures between finishing a set and confirming it.

**2. It keeps the screen legible at a glance.** There is little visual competition for the current set, the current exercise, and the timer. That clarity matters in the gym because users are often looking at the phone under poor lighting and with short attention spans.

**3. It treats rest as part of the workflow, not a separate feature.** The timer is integrated into the active session rather than buried in settings. That makes the workout feel like one continuous state machine instead of a sequence of unrelated screens.

**4. It favors continuity over ceremony.** Users can keep moving through a workout without feeling like they are filling in a report after every set. That is especially useful for Atlas's broader audience, which includes beginners who do not want every interaction to feel like analysis.

### What Strong does that you shouldn't copy

**1. Over-minimalism.** Strong can afford to be sparse because it is built for users who already understand their training. Atlas needs a bit more context and reassurance, especially for users who do not lift every day.

**2. Thin feedback loops.** A barebones logger can feel fast, but it can also feel emotionally flat. Atlas should keep the speed advantages while still rewarding good sessions with visible progression and PR cues.

---

## What Atlas does today (current state)

The live active workout entry point is `TrainV2`, which is routed from `/Workouts` in `src/App.jsx`. `TrainV2` switches into a full-screen execution takeover by rendering `WorkoutExecutionScreen`, so the workout does not stay embedded inside the broader workouts page. That is the right structural choice for gym use, because it protects focus and avoids mixing the active session with plan browsing or history.

- **Layout and navigation structure:** `TrainV2` has two modes: a list mode for plan discovery and a full takeover execution mode. Users can start a day from the current plan, start a quick workout from `QuickWorkoutModal`, or resume an interrupted session from `localStorage` via `src/lib/workoutSession.js`. The active surface itself is dismissible through cancel confirmation, a skip-rest action, or completion. `MyWorkout.jsx` is not part of the active surface; it is a plan library/generator page and should be treated separately.

- **Key interactions:** `WorkoutExecutionScreen` supports set-by-set logging for weight, reps, and RIR; live suggestions based on the last session for that exercise; PR detection from recent workout history; exercise addition through `ExerciseSearch`; a dedicated rest state; and completion/cancel flows. Completion is handled by a separate save mutation in the parent page, which persists the workout to Supabase through `saveCompletedWorkout`.

- **Visual approach:** The screen uses Atlas card surfaces, rounded containers, a sticky top progress header, and a full-screen portal for rest and completion states. The execution view is dense but controlled: big exercise title, small badges for muscle groups and rest, three numeric fields for the current set, and a prominent CTA. The rest state is more theatrical, with a centered countdown ring and large numeric timer, but it still stays on-brand with muted gradients and tokenized colors rather than neon-gym styling.

- **Known issues from code reading:** The session schema is inconsistent across builders. `TrainV2` writes `day_index` into the active session object, but `saveCompletedWorkout` reads `plan_day_index`, so sessions started from the live `/Workouts` route can lose plan-day linkage when saved. `WorkoutGuardSheet.jsx` exists but is not wired into the main execution flow. `WorkoutExecution.jsx` and `RestTimer.jsx` are legacy paths that do not match the current full-screen experience and appear unwired from the routed surface. `WorkoutsV2.jsx` exists as a second implementation but is not the live route.

- **Gaps relative to the reference app:** Atlas already has the hard part of the surface - a focused execution mode, rest timing, progression hints, and PR feedback - but it is missing route parity, more robust recovery, and the kind of deeply integrated in-session structure Hevy uses to keep the workout moving. There is no superset/circuit model, no explicit exercise order editing during execution, and no stronger distinction between a light logging path and an advanced one.

The main takeaway from the current state is that Atlas is not missing the active workout screen. It is missing a more reliable and more unified version of it.

---

## Patterns to steal, ranked by ROI

### 🟢 Steal immediately — high impact, low effort

**1. Full-screen execution takeover.** Keep the workout inside one dedicated state instead of a page that also wants to browse plans or history. Atlas already does this in `WorkoutExecutionScreen`; the main thing to steal is discipline. Make the active session feel like a temporary app inside the app. **Effort: 1-2 days**

**2. Dominant rest state.** The current big countdown ring is the right idea and should stay dominant. Rest should own the screen, not sit as a small timer in the corner. That is the right gym behavior because it minimizes phone checking. **Effort: 1 day**

**3. Inline progression hints.** Keep the previous-session suggestion directly above the current set inputs. That is the fastest way to preserve progressive overload without forcing users into a separate review mode. **Effort: 1 day**

**4. Immediate PR feedback.** Preserve the live PR flash and keep it visually separate from the set fields. That is a cheap but meaningful reward loop, and it makes the logging action feel consequential. **Effort: 1 day**

**5. Resume interrupted sessions.** The localStorage-backed resume path is a strong pattern; it should be present on every active workout entry point, not only one of them. Gym sessions get interrupted, and users remember apps that recover cleanly. **Effort: 1-2 days**

### 🟡 Steal soon — medium impact, medium effort

**6. Shared session model.** Build one session-shaping helper for plan-based starts, quick workouts, and resume state. Atlas currently has at least two builders with slightly different shapes, which is a reliability risk. **Effort: 2-3 days**

**7. Better set review affordance.** Add a lightweight way to inspect or adjust the most recent set in the current exercise without leaving execution mode. That keeps the user in flow when they realize the last entry was off. **Effort: 2-4 days**

**8. Route parity for recovery.** If multiple workout routes remain in the codebase, they need the same restore, confirm-exit, and completion behavior. Users should not get one quality of experience on one route and a degraded one on another. **Effort: 2-3 days**

### 🔴 Consider carefully — high effort or audience-dependent

**9. Superset and circuit handling.** Hevy-style grouping would help advanced users, but it should not be bolted onto the current screen as an afterthought. It needs a product decision about how much structure Atlas wants to impose during execution. **Effort: 4-6 days**

**10. Voice or motion-based logging shortcuts.** These can reduce friction, but they also add complexity to a surface that already has a lot of state. Only pursue them if the core active flow is stable and fast first. **Effort: 5-7 days**

---

## Atlas-specific design tensions to resolve

**Tension 1 — Serious tracking vs. beginner clarity.**
Advanced lifters want progression hints, RIR, PR feedback, and enough structure to track load progression precisely. Beginners mostly want to avoid feeling lost and to finish the workout without thinking about training theory. *Resolution:* Keep the current three-field set logger as the default, but make advanced cues optional and contextual rather than always-on. The screen should teach through inline suggestions, not through extra forms.

**Tension 2 — Workout execution vs. workout editing.**
The active screen must stay focused on logging the current session, but real gym sessions are messy and users often want to add or adjust exercises on the fly. *Resolution:* Allow add-exercise from within execution, but do not let editing become the main mode. Editing should be a rescue path, not a second planning tool.

**Tension 3 — Persistence vs. simplicity.**
Resume state, rest state, and history state all want to persist, but too many session fields make the mental model fragile. *Resolution:* Normalize the session object and keep only the minimum fields needed to resume accurately. If the session cannot be saved and restored cleanly, the rest of the execution UX is not trustworthy enough.

**Tension 4 — Shared surface vs. duplicated implementations.**
Atlas currently has a live execution path, a legacy execution component, and an orphaned alternate workout page. That fragmentation increases the risk of drift and inconsistent behavior. *Resolution:* Choose one execution model and make every route and modal use it. Do not keep parallel versions unless there is a clear migration plan.

---

## Specific changes to make (actionable list)

1. Normalize the session schema so plan-based workouts always use `plan_day_index` end-to-end.
   File(s): `src/pages/TrainV2.jsx`, `src/services/workoutService.js`, `src/components/workouts/WorkoutExecutionScreen.jsx`. Effort: 2-4 hours. Dependency: none.

2. Extract one shared `buildSessionFromPlan` helper and use it from every workout entry point.
   File(s): `src/pages/TrainV2.jsx`, `src/pages/WorkoutsV2.jsx`, `src/components/workouts/QuickWorkoutModal.jsx`. Effort: 4-6 hours. Dependency: 1.

3. Add resume-session parity to the live route that currently lacks the localStorage restore path.
   File(s): `src/pages/TrainV2.jsx` or `src/pages/WorkoutsV2.jsx` depending on which page stays live, `src/lib/workoutSession.js`. Effort: 3-5 hours. Dependency: 2.

4. Wire `WorkoutGuardSheet` into the active workout exit flow instead of leaving it as dead UI.
   File(s): `src/components/workouts/WorkoutExecutionScreen.jsx`, `src/components/workouts/WorkoutGuardSheet.jsx`. Effort: 2-3 hours. Dependency: none.

5. Replace the legacy `WorkoutExecution.jsx` / `RestTimer.jsx` path or clearly retire it.
   File(s): `src/components/workouts/WorkoutExecution.jsx`, `src/components/workouts/RestTimer.jsx`, `src/components/workouts/WorkoutExecutionScreen.jsx`. Effort: 1-2 days. Dependency: 2.

6. Add a tiny current-set history strip that lets the user inspect the last logged set without leaving the active screen.
   File(s): `src/components/workouts/WorkoutExecutionScreen.jsx`, `src/services/workoutHistoryService.js`. Effort: 1-2 days. Dependency: none.

7. Make the active workout state machine explicit and shared between start, rest, and completion.
   File(s): `src/components/workouts/WorkoutExecutionScreen.jsx`, `src/lib/workoutSession.js`. Effort: 1-2 days. Dependency: 1.

8. Move any remaining hard-coded execution labels into translation keys so the active surface stays consistent across locales.
   File(s): `src/components/workouts/WorkoutExecutionScreen.jsx`, `src/components/workouts/QuickWorkoutModal.jsx`, `src/lib/translations/en-US.json`, `src/lib/translations/pt-BR.json`. Effort: 1 day. Dependency: none.

9. Remove or isolate `src/pages/WorkoutsV2.jsx` so the codebase does not keep two different mental models for active workout.
   File(s): `src/pages/WorkoutsV2.jsx`, `src/App.jsx`. Effort: 1-2 days. Dependency: 2.

10. Tighten the completion/save handoff so the post-workout celebration, paywall trigger, and save mutation cannot race each other.
   File(s): `src/components/workouts/WorkoutExecutionScreen.jsx`, `src/pages/TrainV2.jsx`. Effort: 4-6 hours. Dependency: 1.

Total effort: about 5-8 days.

Biggest perceived-quality jumps come from items 1, 3, 4, 5, and 9. Those fix trust, route parity, and model drift, which matter more than adding another visual flourish.

---

## What NOT to do

1. Do **not** split the active workout experience across multiple competing components or pages. The user should have one execution model, not a maze of similar-looking files.

2. Do **not** make the rest timer a small inline utility. Rest is a first-class state in the active workout and should remain visually dominant.

3. Do **not** turn the active screen into a plan editor. Editing should stay available, but it should not compete with set logging for attention.

4. Do **not** copy Hevy's strength-centric jargon wholesale. Atlas needs to work for beginners and hybrid training, not just lifters who already know the vocabulary.

5. Do **not** drop plan-day metadata anywhere in the save path. That breaks downstream history, adherence, and plan analytics.

6. Do **not** let the legacy `WorkoutExecution.jsx` path quietly diverge from the live screen. Parallel active-workout implementations are a maintenance trap.

---

## The single highest-leverage thing

Normalize the active workout into one shared, durable session model and make every entry point use it. Right now Atlas has the right visual ingredients - a full-screen execution takeover, a serious rest state, progression cues, and PR feedback - but they are only valuable if the workout can be resumed, saved, and linked back to the right plan day every time. Fixing the schema and route parity problem gives the team a reliable base to build on, and it immediately raises trust in the surface because the app stops feeling like it might lose the workout mid-session.

---

**File status:** Draft 1. To be revised after implementation against reality.
