# Teardown 12 — Workout Library

**Surface:** Browse, organize, and create reusable workout routines and prescribed routines; this is the template/library layer, not the active workout execution screen.
**Atlas file(s):** `src/pages/Routines.jsx`, `src/components/routines/RoutineCard.jsx`, `src/components/routines/RoutineForm.jsx`, `src/pages/MyWorkout.jsx`, `src/pages/ManualWorkoutPlan.jsx`
**Reference apps:** Fitbod (primary)
**Audience tension:** Medium — serious lifters want fast access to structured templates and precise editing, while general users need a simple “pick a routine and go” path without feeling buried in training jargon.

---

## Why this screen matters

This surface is the user’s decision point before the workout starts. It should answer three questions quickly: what routine do I have, who made it, and what happens if I use it today. If Atlas makes this layer noisy or vague, the user ends up either defaulting to random free training or bouncing into execution without confidence in the plan.

The revenue and retention impact is indirect but real. A strong library keeps users in the training loop because it reduces the cost of starting, repeating, and adjusting a plan. A broken library looks like empty lists, fake cards, or unclear handoff into the actual workout screen; that creates distrust fast because the user cannot tell whether they are looking at a real template, a coach-prescribed structure, or a draft they made themselves.

World-class here means the user can scan a small number of high-signal routine cards, understand the structure at a glance, clone or edit without friction, and start the right day without re-entering the same information. The library should feel like a credible training system, not a static index.

---

## Reference app 1 — Fitbod (primary)

Fitbod is the right reference because it combines a workout generator, a deep exercise library, and constraint-based filtering into one system. That is close to what Atlas needs here: a reusable routine layer that serves both serious trainees and less technical users, while still making the underlying structure obvious. Fitbod’s official workout generator and exercise pages show the balance between guidance and control: https://fitbod.me/workouts, https://fitbod.me/about-fitbod-exercises/, https://fitbod.me/blog/best-workout-split/.

### What Fitbod does that works

1. **Constraint-first entry**  
   Fitbod starts from the user’s training constraints: muscle group, equipment, experience, and goal. That reduces blank-page pressure and makes the library feel personalized instead of generic. Atlas should keep that same “start with your context” model when the user is choosing or creating a routine.

2. **Workout split framing**  
   Fitbod organizes around common split patterns like full body, push/pull, upper/lower, and body-part focused sessions. That works because users can map a routine to a familiar mental model immediately. A library card that says “Upper A” is weaker than one that also makes the split and intent obvious.

3. **Exercise depth on demand**  
   Fitbod’s exercise pages give users a place to inspect movement details, demos, and ranking context before committing. That matters because the library is only useful if the underlying exercise choices feel trustworthy. Atlas should surface enough detail to build confidence without forcing the user into a separate research hunt.

4. **Equipment-aware filtering**  
   Fitbod’s workout generator and bodyweight pages make equipment a first-class filter, not an afterthought. This is a strong pattern because it prevents dead-end plans and makes the library usable in gym, home, and hybrid contexts. Atlas should keep equipment visible where routines are created and when they are previewed.

5. **Clear progression logic**  
   Fitbod ties workout generation to recovery, prior performance, and volume/intensity trends. Even when the user is browsing templates, the system implies that the routine is alive and adaptive. Atlas can borrow that credibility by showing active status, last completed date, and what changed since the last use.

6. **Template variety without chaos**  
   Fitbod shows a lot of possible workout shapes, but it still groups them into recognizable buckets. That keeps the catalog broad without feeling random. Atlas should use a small number of strong routine families rather than dumping every variation into one flat list.

7. **Goal-specific naming**  
   Fitbod names workouts in a way that reflects intent, not just exercise count. That helps users choose faster and makes the next workout feel pre-decided. Atlas should do the same with source, split, and purpose labels.

### What Fitbod does that you shouldn't copy

1. **Do not copy the SEO-density mindset**  
   Fitbod’s web pages can be very broad and keyword-rich. That is useful for web acquisition, but it is not the right shape for Atlas’s in-app library, where too much text slows decision-making.

2. **Do not expose every permutation equally**  
   Fitbod can afford a large matrix of goals, equipment, and body parts. Atlas should not mirror that complexity on one screen; the library has to feel curated, or general users will stall before starting.

3. **Do not make the library feel like a marketing generator**  
   Fitbod can lean on “generate your next workout” language. Atlas should be more operational: this is your routine library, here is what is active, and here is what you can do next.

4. **Do not hide structure behind AI**  
   Fitbod’s adaptive intelligence is core to the product. Atlas should not make that the only visible entrypoint, because the app also serves users who want a stable, coach-prescribed routine they can trust and repeat.

---

## What Atlas does today (current state)

The actual browse/library surface is `src/pages/Routines.jsx`, with `RoutineCard` and `RoutineForm` handling the card and create/clone dialogs. The route is separate from `/Workouts`, and that separation matters: `/Workouts` now mounts `TrainV2`, which is execution-first, while `Routines` is the list/catalog layer.

- Layout and navigation structure: `Routines` opens inside `AppContainer` with a hero `PageHeader`, an active-routine banner, an “All routines” library section, and a separate “Prescribed routines” section. Creation and cloning happen in dialogs; there is no detail page for a routine. The “Start today” action on each card deep-links to `/workouts?routine=...`, which hands off to the execution surface rather than staying in the library.
- Key interactions: users can create a routine, clone a routine, delete a routine, inspect a weekly day grid, and see basic summary stats such as duration, total exercises, and last completed date. `MyWorkout.jsx` and `ManualWorkoutPlan.jsx` are adjacent creation surfaces: one generates a single active plan and the other builds a plan manually with exercise search.
- Visual approach: the UI is card-heavy, rounded, and subdued, with small badges for state and source. The active routine gets a highlighted banner, while personal and prescribed lists are visually similar aside from section titles and badges. It looks consistent with Atlas, but not especially “library-like” or browse-dense.
- Known issues from code reading: the main list and prescribed list queries in `Routines.jsx` return empty arrays, and the create/clone/delete mutations are no-ops returning `{}`. That means the library is currently a shell, not a data-backed surface. `RoutineForm` also queries `prescribed-workouts` but never uses the result, which reads like abandoned wiring.
- Gaps relative to the reference app: there is no real filtering by goal, split, equipment, or training context; no searchable catalog; no exercise-level detail drill-in; and no visible adaptation logic. The biggest functional gap is that the “Start today” path does not preserve a routine-specific context inside the workout execution route, so the handoff is weaker than it looks.

The surface is reusable templates plus prescribed routines, not a pure exercise library. That is verified by the code: `RoutineCard` shows weekly placement and summary stats, `RoutineForm` creates a schedule, and exercise selection happens elsewhere in `ExerciseSearch` and `ManualWorkoutPlan`, not in the library itself.

---

## Patterns to steal, ranked by ROI

### 🟢 Steal immediately — high impact, low effort

1. **Source badges on every card**  
   Show whether a routine is user-made, AI-generated, or prescribed at the card level, not just in section headers. Atlas already has the concept in code; making it explicit improves trust and reduces accidental misuse. Effort: 4-8 hours.

2. **Weekly structure preview**  
   Keep the seven-day grid on the card, but make the active days and exercise count easier to parse at a glance. This is a low-cost way to communicate “this is a real plan,” not just a saved object. Effort: 1 day.

3. **Clone as the default action**  
   For library surfaces, duplication is usually more valuable than blank-slate creation. Fitbod-style users want to adapt a good structure rather than rebuild it, and Atlas already supports clone affordances. Effort: 1 day.

4. **Explicit active-state pinning**  
   Keep the active routine visually pinned at the top and separate it from the rest of the library. This reduces confusion between “what I’m using now” and “what else I own.” Effort: 4-6 hours.

### 🟡 Steal soon — medium impact, medium effort

1. **Routine search and filters**  
   Add a compact search field plus 3-4 filters such as personal, prescribed, active, and archived. This is the minimum viable browse experience for a library that will grow beyond a few mock cards. Effort: 1-2 days.

2. **Routine detail drawer**  
   Add a side sheet or modal that expands a card into day-by-day exercises, not just the weekly summary. Fitbod’s exercise depth works because users can inspect before committing; Atlas needs a lighter version of that. Effort: 2-3 days.

3. **Better handoff to execution**  
   Make the “Start today” action carry routine identity into the workout screen so the user knows what they are executing. This is more than navigation; it is the moment the library becomes actionable. Effort: 1-2 days.

### 🔴 Consider carefully — high effort or audience-dependent

1. **Auto-generated routine recommendations**  
   A Fitbod-like recommendation engine would be powerful, but it is a product decision, not a UI tweak. It only makes sense if Atlas is ready to invest in stable workout intelligence and explainability. Effort: 1-2 weeks plus product work.

2. **Exercise-level library inside routines**  
   Folding a full exercise encyclopedia into the routine library would help serious users, but it risks turning the surface into a database. That should only happen if Atlas wants to compete on depth rather than simplicity. Effort: 2-4 weeks.

3. **Shared/public routine marketplace**  
   A browseable community or coach marketplace could be compelling, but it changes moderation, attribution, and quality control requirements. It is not a first-pass library fix. Effort: multiple weeks and a separate trust design.

---

## Atlas-specific design tensions to resolve

**Tension 1 — Library vs execution.**  
The current codebase has separate surfaces for browsing routines and actually running a workout, but the transition between them is loose. *Resolution:* keep the library strictly about choosing, cloning, and understanding plans, and make execution a single decisive handoff with the selected routine clearly carried through.

**Tension 2 — Template reuse vs personalization.**  
Serious users want to tweak every detail; general users want one good option they do not have to edit. *Resolution:* show a strong default routine card with simple clone/edit actions, and keep advanced editing behind a deliberate detail view rather than on the main grid.

**Tension 3 — Prescribed vs self-authored.**  
Atlas supports both coach-prescribed and user-created routines, but the current UI does not separate them enough. *Resolution:* make source a first-class visual attribute and sort the active, prescribed, and personal routines into clearly labeled groups so the user never confuses ownership or intent.

**Tension 4 — Compact scan vs deep confidence.**  
The library must be fast to scan, but users still need enough detail to trust the plan before starting. *Resolution:* keep cards terse and add one expandable layer for exercise preview, volume, and last-used context instead of making every card verbose.

---

## Specific changes to make (actionable list)

1. **Replace the stubbed routine queries with real `workout_plans` data.** File(s): `src/pages/Routines.jsx`, `src/services/workoutPlanService.js`. Effort: 1-2 days. Dependency: none.
2. **Implement create, clone, and delete mutations against the workout plan table.** File(s): `src/pages/Routines.jsx`, `src/components/routines/RoutineForm.jsx`, `src/components/routines/RoutineCard.jsx`. Effort: 1-2 days. Dependency: task 1.
3. **Fix the “Start today” handoff so it passes a routine identifier into the execution flow.** File(s): `src/components/routines/RoutineCard.jsx`, `src/pages/TrainV2.jsx`. Effort: 1 day. Dependency: task 1.
4. **Add a compact search input and source filters for personal, prescribed, and active routines.** File(s): `src/pages/Routines.jsx`. Effort: 1-2 days. Dependency: task 1.
5. **Add a routine detail drawer with day-level exercise preview and summary metadata.** File(s): `src/pages/Routines.jsx`, `src/components/routines/RoutineCard.jsx`. Effort: 2-3 days. Dependency: task 1.
6. **Make source and ownership badges visually stronger on both library and card views.** File(s): `src/pages/Routines.jsx`, `src/components/routines/RoutineCard.jsx`. Effort: 4-8 hours. Dependency: none.
7. **Link the active routine banner to the current day’s session preview instead of only showing the top line.** File(s): `src/pages/Routines.jsx`. Effort: 4-6 hours. Dependency: task 1.
8. **Remove dead or unused wiring in `RoutineForm` and bind the prescribed-routines concept to actual data.** File(s): `src/components/routines/RoutineForm.jsx`, `src/pages/Routines.jsx`. Effort: 4-8 hours. Dependency: task 1.
9. **Align `MyWorkout` and `ManualWorkoutPlan` with the library so generated plans appear as real reusable templates.** File(s): `src/pages/MyWorkout.jsx`, `src/pages/ManualWorkoutPlan.jsx`, `src/pages/Routines.jsx`. Effort: 1-2 days. Dependency: task 1.

Total effort: roughly 1-2 weeks for a credible v1, depending on how much backend wiring already exists. The biggest perceived-quality jumps come from real data binding, a reliable execution handoff, and a clearer separation of personal vs prescribed routines.

---

## What NOT to do

1. **Do not merge the library into the active workout screen.** That collapses browse and execution into one flow and makes both weaker.
2. **Do not leave the section titles as the only cue for source.** If user-created and prescribed routines look identical, trust drops.
3. **Do not turn this into a giant exercise encyclopedia.** The library should stay about routines and templates, not become a second `Exercises` page.
4. **Do not copy Fitbod’s entire filtering matrix.** Too many constraints at once will make Atlas feel technical and heavy for general users.
5. **Do not keep fake empty arrays and no-op mutations in production UI.** A polished shell is worse than a simple but truthful list.

---

## The single highest-leverage thing

Wire this surface to real routine data and make each card clearly state what it is, who owns it, and how it maps to today’s workout. That one change would turn the screen from a decorative shell into a trustworthy library: users would be able to find a routine, understand whether it is personal or prescribed, and start it with confidence. Until that exists, the rest of the design work is mostly theater.

**File status:** Draft 1. To be revised after implementation against reality.
