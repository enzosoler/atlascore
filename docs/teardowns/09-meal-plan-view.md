# Teardown 09 — Meal Plan View

**Surface:** Meal plan view for prescribed or generated nutrition plans, plus the adjacent plan/execution handoff.
**Atlas file(s):** not yet implemented as a single surface; closest pieces live in `src/pages/MyDiet.jsx`, `src/pages/Nutrition.jsx`, `src/pages/MyPrescribedDiet.jsx`, and `src/services/dietPlanService.js`
**Reference apps:** MacroFactor (primary)
**Audience tension:** High — serious optimizers want precise, meal-by-meal structure and fast adjustments, while general users need a clear plan that does not feel clinical or burdensome.

---

## Why this screen matters

This surface is where nutrition stops being abstract. If Atlas gets it right, users can look at one place and immediately understand what they are supposed to eat, what the plan totals are, and how to adapt when life changes. That is the difference between a subscription feature that feels valuable once and a habit surface that gets opened every day.

The retention impact is direct. A meal-plan view should reduce decision fatigue and make adherence feel doable; if it is fragmented, stale, or read-only, users fall back to ad hoc logging and eventually stop trusting the plan. Broken here looks like a plan that exists in name only, with no clear meal structure, no easy editing, and no obvious link between prescription and execution. World-class means the plan feels operational: easy to scan, easy to adjust, and easy to execute.

---

## Reference app 1 — MacroFactor (primary)

MacroFactor is the right reference because it serves the same serious-nutrition audience Atlas wants to support: users who care about calories, macros, adherence, and the practical mechanics of following a plan. It is not identical to Atlas, because MacroFactor is primarily a tracking product rather than a broader coaching platform, but its meal-handling patterns are directly relevant.

### What MacroFactor does that works

1. **Timeline-first layout.** MacroFactor’s food log represents the day as a timeline rather than a rigid breakfast/lunch/dinner checklist. That makes the day feel continuous and easier to edit, because a meal can move in time without the user mentally rebuilding the whole day. For Atlas, this is the strongest cue that the view should feel like a living plan, not a static document.

2. **Plate staging before logging.** MacroFactor lets users build up a plate, review it, and then log it. That pattern reduces accidental mistakes and supports multi-food meals without forcing the user through a separate screen for every item. In a meal-plan context, this is a strong model for drafting or revising a meal before committing it.

3. **Fast entry, deeper detail on demand.** Search, quick add, barcode, and describe all lead into a detail screen where quantity and units can be adjusted. The core lesson is not the specific input method; it is the clear split between speed and precision. Atlas should let simple repeat meals stay fast while still allowing exact edits when the user cares.

4. **Expandable detail density.** MacroFactor can hide food details and collapse the timeline into a denser view. That keeps the screen readable for daily use without removing information for power users. This is a good pattern for meal plans because the default state should show structure first and ingredients second.

5. **Move, do not retype.** MacroFactor supports moving foods to another time or day instead of making the user recreate them. That respects real-world behavior, where meals slip and plans change after the fact. For Atlas, this is an important adherence pattern: the plan should flex without breaking.

6. **Reusable meals / recipes.** Saving a meal for later use turns repeated eating into a one-step action instead of repetitive data entry. This is especially valuable for breakfast and lunch habits, which are often repeated with small variations. A strong meal-plan view should reward repeat behavior rather than make it tedious.

### What MacroFactor does that you shouldn't copy

1. **Do not copy the timeline shape if Atlas cannot support real execution time.** A fake timeline looks sophisticated but creates false precision. If Atlas cannot actually move a meal through time-based plan/execution state, a simpler meal stack is more honest.

2. **Do not copy MacroFactor’s logging-centric surface verbatim.** MacroFactor is optimized for capturing intake; Atlas needs to present a prescribed plan and connect it back to logging. If Atlas copies the plate workflow without the plan context, it will feel like a duplicate tracker instead of a planning tool.

3. **Do not flood the screen with every possible nutrient detail by default.** MacroFactor can lean dense because its users expect heavy tracking. Atlas serves a mixed audience, so the first read must stay legible even when the plan is precise.

---

## What Atlas does today (current state)

- Layout and navigation structure: there is no single dedicated meal-plan screen. The closest consumer-facing view is `src/pages/MyDiet.jsx` on `/my-diet`, which renders inside `AppContainer` with a `PageHeader`, a generated plan summary, macro totals, a meal list, and notes. The execution surface is separate: `src/pages/Nutrition.jsx` on `/Nutrition` is a day-based meal log with add/edit/delete flows. `src/pages/MyPrescribedDiet.jsx` exists on `/prescribed-diet`, but it is routed as if real while the implementation is effectively stubbed. `src/pages/Plan.jsx` is not a meal-plan view at all; it is a nutrition-target and training control center.
- Key interactions: `MyDiet` can generate a diet plan through `invokeLLMJson`, choose diet style, choose meals per day, and create an AI plan. Its meal cards are collapsible but mostly read-only. `Nutrition.jsx` supports logging meals through AI text input, food search, camera, quick add, and per-meal edit/delete. `MyPrescribedDiet.jsx` shows plan cards and a create dialog, but its query and mutation functions currently return empty placeholders. `Plan.jsx` lets users edit goal, target weight, and macro targets, but those changes are not a meal-plan structure.
- Visual approach: the current look is clean and utility-driven, but the surfaces do not share one visual language. `MyDiet` uses card stacks, badges, and compact plan blocks. `Nutrition.jsx` is denser and more operational, with timeline-like buckets, progress-like summaries, and modal-based entry. `Plan.jsx` is more like a settings hub with small section cards and input grids.
- Known issues from code reading: `src/pages/MyPrescribedDiet.jsx` is a stub masquerading as a live screen, with `queryFn: async () => []` and mutations that return `{}`. `src/pages/Plan.jsx` has a dead `targetDate` field that is never saved and a target-delta block that checks `profileRow?.weight_kg`, even though the loaded shape exposes `current_weight`, so the delta UI may never appear. The meal-plan story is also fragmented across routes, which makes the product feel inconsistent.
- Gaps relative to the reference app: there is no timeline-like day structure, no obvious plan-vs-execution distinction inside the meal-plan surface, no reusable meal library, no move/reschedule interaction, and no staged “draft then commit” flow. Atlas also lacks a clear source/version badge for the meal plan, which matters when a plan is AI-generated, user-generated, or prescribed by a professional.

---

## Patterns to steal, ranked by ROI

### 🟢 Steal immediately — high impact, low effort

1. **Meal-card collapse model.** Keep each meal as a compact block with totals in the header and details hidden until needed. Atlas already has the raw meal data, so this is mostly an interaction and presentation upgrade rather than a data-model rewrite. Effort: 4-8 hours.

2. **Fast repeat meals.** Add a reusable recent-meals row or template chips for breakfast/lunch/dinner staples. This is the quickest way to make the plan feel useful on day two, not just impressive on day one. Effort: 1-2 days.

3. **Staged meal edits.** Let users adjust portions, remove items, and confirm a meal in a single focused editor instead of forcing full rebuilds. That is the plate pattern translated into a plan context and it directly reduces friction. Effort: 1 day.

4. **Plan-to-log handoff.** Give every planned meal a clear action to send it into today’s execution flow. This makes the plan feel actionable instead of decorative and keeps Atlas from becoming a read-only prescription wall. Effort: 1-2 days.

### 🟡 Steal soon — medium impact, medium effort

1. **Day navigator.** Add previous/next day or week navigation so the plan can represent more than a single static card stack. A meal plan becomes much more useful when the user can see what is scheduled tomorrow or compare days. Effort: 2-4 days.

2. **Source and version context.** Show whether the plan is AI-generated, user-made, or prescribed, plus version and start date. This matters because users will trust and modify the plan differently depending on who created it. Effort: 4-8 hours.

3. **Remaining-at-a-glance summary.** Keep calories and protein remaining visible near the top rather than buried in a section. MacroFactor’s strength is that the user always understands the remaining budget, and Atlas should match that clarity. Effort: 1 day.

### 🔴 Consider carefully — high effort or audience-dependent

1. **True timeline and drag/drop editing.** This is powerful, but only if Atlas is ready to represent actual time-based meal execution rather than just meals in a list. Without that backend and mental model, a timeline becomes a decorative lie. Effort: 1-2 weeks.

2. **Recipe explosion for plan meals.** Let repeated meals expand into ingredients and portions when the user needs finer control. This is valuable for serious users, but it adds complexity, so it should land after the core plan flow is coherent. Effort: 1 week.

---

## Atlas-specific design tensions to resolve

**Tension 1 — Prescription vs flexibility.**
The product needs to show an actual plan, but users also need permission to deviate without feeling like they failed. If the UI is too rigid, general users will avoid it; if it is too loose, serious users will not trust it. *Resolution:* make the plan structured by default, but let every meal be edited, moved, or duplicated in one tap so flexibility is built into the surface rather than hidden in help text.

**Tension 2 — Plan view vs logging view.**
`/my-diet` should read like the plan, while `/Nutrition` should read like execution. Today those responsibilities are blurred, and that hurts clarity. *Resolution:* make the meal-plan surface visually and behaviorally distinct from the log, then add a direct handoff between them so the separation is obvious but not cumbersome.

**Tension 3 — Serious tool vs approachable product.**
MacroFactor-style density is useful for power users, but Atlas also serves people who just want to know what to eat next. The wrong answer is a sterile spreadsheet or an over-gamified card stack. *Resolution:* keep the first layer simple and calm, then reveal exact foods, portions, and totals only when the user opens a meal.

**Tension 4 — Single source of truth vs fragmented implementation.**
The current repo has plan data in multiple places, including a stubbed prescribed-diet route and a separate control center on `/Plan`. That fragmentation makes it hard to know which screen owns the meal plan. *Resolution:* pick one canonical meal-plan surface and make everything else clearly subordinate to it.

---

## Specific changes to make (actionable list)

1. Decide the canonical meal-plan surface and rename labels so `/my-diet` is the meal-plan view while `/Nutrition` remains the execution log.
Files: `src/App.jsx`, `src/lib/routes.js`, `src/pages/MyDiet.jsx`, `src/pages/Nutrition.jsx`, `src/pages/Plan.jsx`
Effort: 1-2 days
Dependency: none

2. Replace the `MyPrescribedDiet.jsx` stub with real `diet_plans` queries and mutations, or hide the route until the backend is ready.
Files: `src/pages/MyPrescribedDiet.jsx`, `src/services/dietPlanService.js`
Effort: 1-2 days
Dependency: #1

3. Add a plan summary header to the meal-plan view with source, version, start date, and total macros.
Files: `src/pages/MyDiet.jsx`
Effort: 4-8 hours
Dependency: #1

4. Add previous/next day or week navigation and distinct empty states for current, future, and past plans.
Files: `src/pages/MyDiet.jsx`
Effort: 1-2 days
Dependency: #1

5. Convert meal cards into editable blocks with duplicate, remove, and portion-adjust actions.
Files: `src/pages/MyDiet.jsx`
Effort: 1-2 days
Dependency: #3

6. Add a reusable meal library or recent-meals row so common breakfasts and lunches can be inserted quickly.
Files: `src/pages/MyDiet.jsx`, `src/pages/Nutrition.jsx`
Effort: 1 day
Dependency: #5

7. Add a one-tap handoff from a planned meal into the execution logger, preserving foods, date, and time.
Files: `src/pages/MyDiet.jsx`, `src/pages/Nutrition.jsx`
Effort: 1-2 days
Dependency: #5

8. Surface a plan-vs-execution strip in the logging screen that compares today’s intake with the active diet plan.
Files: `src/pages/Nutrition.jsx`, `src/services/dietPlanService.js`
Effort: 1-2 days
Dependency: #2

9. Fix `Plan.jsx` so the target-delta block uses the actual current-weight field and either saves or removes the dead target-date control.
Files: `src/pages/Plan.jsx`
Effort: 2-4 hours
Dependency: none

10. Add explicit loading, empty, and inactive-plan states so the user can distinguish “no plan yet” from “plan exists but has no meals.”
Files: `src/pages/MyDiet.jsx`, `src/pages/MyPrescribedDiet.jsx`, `src/pages/Nutrition.jsx`
Effort: 4-8 hours
Dependency: #2

Total effort: roughly 1.5-2.5 weeks, depending on how much route cleanup and backend wiring is required.
Biggest perceived-quality jumps come from #1, #2, #3, #7, and #8 because they turn the surface from fragmented nutrition settings into a coherent plan-to-execution workflow.

---

## What NOT to do

1. Do **not** build a second generic nutrition dashboard that only repeats calories and macros.
2. Do **not** copy MacroFactor’s timeline mechanics before Atlas can actually support time-based meal execution.
3. Do **not** leave `MyPrescribedDiet.jsx` as a live route with fake queries; that reads as broken, not unfinished.
4. Do **not** bury the meal source and version so users cannot tell whether they are following an AI plan, a coach plan, or their own plan.
5. Do **not** make the plan screen feel like a PDF or a locked report; users need to act on it, not admire it.

---

## The single highest-leverage thing

Unify the meal-plan story into one canonical, editable surface with clear source context and a direct handoff into logging. Right now Atlas has pieces of planning, pieces of execution, and one stubbed prescribed-diet route, which makes the whole nutrition experience feel provisional. If the team only does one thing, it should be to make `/my-diet` the unmistakable meal-plan home, with real meal structure, editability, and one-tap movement into `/Nutrition`; that is the change most likely to make the feature feel trustworthy and worth returning to.

**File status:** Draft 1. To be revised after implementation against reality.
