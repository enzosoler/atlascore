# Teardown 11 — Macro Target Setup

**Surface:** Distributed macro target setup flow across onboarding and settings; Atlas does not currently ship one dedicated standalone macro-target setup screen.
**Atlas file(s):** `src/components/onboarding/SmartOnboarding.jsx`, `src/features/onboarding/OnboardingContext.jsx`, `src/pages/Onboarding.jsx`, `src/pages/Goals.jsx`, `src/pages/Plan.jsx`, `src/components/profile/FitnessSetupTab.jsx`, `src/pages/Nutrition.jsx`, `src/pages/ProfileEdit.jsx`, `src/pages/Profile.jsx`
**Reference apps:** MacroFactor (primary)
**Audience tension:** High — serious users want precise, editable macro targets with clear provenance; general users want a low-friction setup that does not feel like a nutrition exam.

---

## Why this screen matters

Macro targets are the contract between Atlas and the user. If the numbers are credible, easy to find, and easy to revise, the rest of nutrition tracking feels coherent. If they are buried, duplicated, or inconsistent, the user stops trusting the app’s guidance and every downstream surface becomes harder to read.

This surface also sits directly on the retention path. A user who sets a believable target is much more likely to log meals, understand the daily dashboard, and interpret coach feedback as useful instead of arbitrary. A user who cannot tell where their targets came from will bounce between onboarding, settings, and nutrition until the product feels stitched together.

World-class here means one clear place to understand how targets are formed, one clear place to edit them, and no ambiguity about whether the app is using auto-generated or manually entered values. Broken here looks like three different screens that each appear authoritative, but do not agree with each other.

---

## Reference app 1 — MacroFactor (primary)

MacroFactor is the right primary reference because it is built for the exact user who cares whether macro targets are technically defensible. It serves serious nutrition optimizers first, but it does so with a structure that still lets a non-expert understand where to go and what will happen next. Atlas matches that audience partially: the optimizer needs are real, but Atlas also has to stay accessible to broader fitness users who do not want a coaching thesis before lunch.

### What MacroFactor does that works

1. **Strategy as the home base.** MacroFactor makes goal creation and target editing feel like a deliberate action, not an incidental setting. The user goes to a named place, chooses a goal, and knows that this is where the nutrition system is controlled. That reduces the hunt for targets later, which is exactly the problem Atlas has to solve.

2. **Separate create vs edit flows.** MacroFactor distinguishes between creating a new goal and editing an existing one. That matters because a weight-loss target, a maintenance target, and a protein tweak are not the same kind of change. Atlas should preserve that mental model instead of making every target look like the same generic form.

3. **Clear program modes.** MacroFactor’s docs make the difference between automatic, collaborative, and manual control explicit. The user can tell whether the app is proposing numbers or whether they are taking full control. This is the right kind of transparency for a target-setting surface because it reduces blame when a number changes.

4. **Review before commit.** MacroFactor shows a goal summary before the user finalizes the change. The user can verify direction, rate, and outcome before the app locks it in. That “review then save” pattern is critical for macro targets because the cost of a bad assumption compounds every day afterward.

5. **Targets tied to reality.** MacroFactor does not treat calories as a static label detached from the user’s body and goal. Its help flow frames goals around expenditure, weight change, and program context, which makes the target feel earned rather than guessed. That is the bar Atlas should hit: explain why the number exists, not just what the number is.

6. **Goal metadata is visible.** MacroFactor keeps the current goal, target direction, and nutrient targets visible from the dashboard and strategy area. That means the user can verify the active plan without digging through settings. Atlas needs the same visibility because its targets currently live in multiple places.

7. **Nutrient goal granularity.** MacroFactor’s nutrient goal editor distinguishes `Auto`, `Custom`, and `None`, and custom values can be expressed as a range. That is more sophisticated than Atlas needs on day one, but the important pattern is that the app is explicit about the type of control the user has. The user is never guessing whether a target is derived, editable, or disabled.

8. **Single-action save.** When MacroFactor commits a change, the user taps a clear confirmation action and the goal is updated. There is no mystery about whether the app saved the change or merely previewed it. That certainty is useful on a setup screen because target edits should feel trustworthy and final.

### What MacroFactor does that you shouldn't copy

1. **Overly technical nutrition taxonomy.** MacroFactor can afford to talk in terms of programs, nutrient ranges, and goal mechanics because its audience is already buying into that complexity. Atlas should not import that whole vocabulary unless it wants the setup experience to feel heavier than the rest of the product.

2. **Deep strategist framing everywhere.** MacroFactor is intentionally nutrition-centric, so it can make strategy the central metaphor. Atlas is broader, with workouts, body data, and coaching alongside nutrition. If Atlas copies the MacroFactor framing too literally, it risks making the app feel like a macro calculator with extra tabs.

3. **Too much emphasis on optimization nuance.** MacroFactor can spend time teaching users about expenditure changes and program types. Atlas needs a shorter path to a usable target, especially for users who just want “good enough” numbers and do not want to reason through metabolic nuance on day one.

---

## What Atlas does today (current state)

- **Layout and navigation structure:** There is no dedicated macro-target setup screen. Instead, the surface is split across onboarding, profile editing, nutrition, and plan/settings entry points. Macro targets can be generated during onboarding in `src/components/onboarding/SmartOnboarding.jsx` and `src/pages/Onboarding.jsx`, edited in `src/pages/Goals.jsx`, `src/pages/Plan.jsx`, and `src/components/profile/FitnessSetupTab.jsx`, and surfaced as a fallback prompt inside `src/pages/Nutrition.jsx` when targets are missing. The `Profile` hub and `ProfileEdit` tab shell provide the navigation path into those editors.

- **Key interactions:** Onboarding collects goal, body stats, activity, and nutrition mode, then computes calorie and macro targets before finishing. `Goals.jsx` exposes a metabolic estimator plus manual calorie, protein, carb, fat, and water fields with save/reset actions. `Plan.jsx` lets the user change goal, target weight, target date, and nutrition targets in one “control center” layout. `FitnessSetupTab.jsx` duplicates the same nutrition fields inside profile editing, and `Nutrition.jsx` auto-opens a target editor state when the profile has no calorie target.

- **Visual approach:** The settings-like editors use rounded cards, dense form fields, small uppercase labels, and muted fill/border treatments with brand, ok, and warn accents. The result feels utilitarian and trustworthy, but not especially guided. The onboarding flows are more expressive and visual, while the editing surfaces look like compact admin forms.

- **Known issues from code reading:** Macro target logic is duplicated across at least three places, and the save paths do not share one canonical authoring surface. The app stores target data in different shapes depending on entry point: onboarding writes to `onboarding_data` and `user_profiles`, while settings flows write to `profiles.profile_data` through `saveLocalProfile` or direct Supabase updates. That creates a real risk that the same user’s “current” target means different things in different screens. There is also a concrete bug in `Goals.jsx` and `FitnessSetupTab.jsx`: percentage descriptions can divide by zero and render `Infinity%` when calories are unset.

- **Gaps relative to the reference app:** Atlas lacks a single authoritative goal editor with a clear “current goal” summary and a distinct edit workflow. It also lacks a visible mode model that explains whether targets are automatic, suggested, or fully manual. The current system gives the user enough controls to edit numbers, but not enough structure to understand how those numbers are supposed to relate to one another.

---

## Patterns to steal, ranked by ROI

### 🟢 Steal immediately — high impact, low effort

1. **Single target summary.** Add one compact summary block that always shows the active calorie target, macro split, and goal direction in a single place. Atlas already computes all of this; the work is mainly consolidation and hierarchy. This would immediately reduce the “which screen is authoritative?” problem. **Effort: 1-2 days**

2. **Create/edit distinction.** Split setup into a clear creation step and a clear edit step, even if they live in the same route. That gives users a sense that they are either establishing a plan or adjusting an existing one, which is the right mental model for nutrition targets. **Effort: 1-2 days**

3. **Explicit control mode.** Show whether targets were auto-generated, manually entered, or copied from another flow. This is a small label-level change that would make the whole system feel more honest and less magical. **Effort: 1 day**

4. **Review before save.** Insert a short review state before committing target changes, especially after onboarding or estimator use. Users should see the numbers one last time before they become active. **Effort: 1-2 days**

### 🟡 Steal soon — medium impact, medium effort

1. **Goal provenance copy.** Explain where targets came from and what assumptions produced them. A short line like “based on your weight, activity, and goal” gives the number legitimacy without over-explaining the math. **Effort: 2 days**

2. **Progressive disclosure for detail.** Keep the main setup fast, then reveal deeper nutrition context only when the user asks for it. That preserves the serious-user need for precision without making the casual path feel academic. **Effort: 2-3 days**

3. **One authoritative persistence path.** Normalize target writes through one helper and one profile schema. This is not a visual polish task, but it pays back in reduced confusion and fewer cross-screen mismatches. **Effort: 3-4 days**

### 🔴 Consider carefully — high effort or audience-dependent

1. **MacroFactor-style auto-adaptive targets.** Let Atlas update targets based on trend data and behavior, not just onboarding math. That would be valuable, but it is a product decision, not a UI tweak, because it changes the promise the app makes to the user. **Effort: 1-2 weeks**

2. **Range-based nutrient targets.** Add floor/target/ceiling behavior for protein, carbs, and fat. This would improve precision for advanced users, but it also raises the complexity of the editing model and the daily logging interpretation. **Effort: 1+ week**

3. **A dedicated strategy hub.** Build a dedicated nutrition strategy area rather than keeping targets spread across onboarding, goals, plan, and profile. This would solve the IA problem, but it is only worth it if Atlas is ready to commit to a stronger nutrition hierarchy across the whole app. **Effort: 1-2 weeks**

---

## Atlas-specific design tensions to resolve

**Tension 1 — One truth vs. many entry points.** Atlas currently lets the user arrive at macro targets from onboarding, profile settings, plan editing, and nutrition fallback prompts. That is convenient, but it also fragments authority. *Resolution:* Keep the multiple entry points, but make them all point to one canonical target summary and one canonical save path. Every other surface should be a doorway, not a second source of truth.

**Tension 2 — Automatic guidance vs. manual control.** Serious users want to tweak every macro, while casual users want the app to pick a sensible number and move on. The risk is that the setup becomes either too dumb for optimizers or too complex for everyone else. *Resolution:* Default to guided auto-generation, then expose manual editing behind an obvious “customize” action. The product should feel opinionated first and editable second.

**Tension 3 — Nutrition clarity vs. broader app scope.** Macro targets are important, but Atlas is not a nutrition-only app. If the setup surface becomes too nutrition-heavy, it will distort the rest of the experience. *Resolution:* Keep the target setup tied to the broader plan language: goal, weight, activity, and food approach. Do not make macro calibration the identity of the product.

**Tension 4 — Convenience vs. schema integrity.** The current implementation is easy to reach because the logic is repeated in multiple places. That convenience is costly because it makes the data model harder to trust. *Resolution:* Sacrifice some convenience now and normalize the data model. A slightly less convenient edit path is better than a surface that can produce conflicting targets.

---

## Specific changes to make (actionable list)

1. **Create one canonical macro-target editor component and reuse it across onboarding, Goals, Plan, Fitness setup, and Nutrition fallback.** Files to touch: `src/components/onboarding/SmartOnboarding.jsx`, `src/pages/Onboarding.jsx`, `src/pages/Goals.jsx`, `src/pages/Plan.jsx`, `src/components/profile/FitnessSetupTab.jsx`, `src/pages/Nutrition.jsx`. **Effort: 3-5 days.** Dependency: none.

2. **Add a visible “target source” label to every macro-target summary.** Files to touch: `src/pages/Goals.jsx`, `src/pages/Plan.jsx`, `src/components/profile/FitnessSetupTab.jsx`, `src/pages/Nutrition.jsx`. **Effort: 1-2 days.** Dependency: task 1.

3. **Fix the zero-calorie percentage bug in the goals and fitness editors.** Files to touch: `src/pages/Goals.jsx`, `src/components/profile/FitnessSetupTab.jsx`. **Effort: 1-2 hours.** Dependency: none.

4. **Consolidate target persistence into one helper that writes a single profile shape.** Files to touch: `src/lib/profileUtils.js`, `src/pages/Onboarding.jsx`, `src/pages/Goals.jsx`, `src/pages/Plan.jsx`, `src/components/profile/FitnessSetupTab.jsx`, `src/pages/Nutrition.jsx`. **Effort: 2-4 days.** Dependency: task 1.

5. **Remove or down-rank duplicate target fields where they are not necessary.** Files to touch: `src/pages/Plan.jsx`, `src/components/profile/FitnessSetupTab.jsx`, `src/pages/Goals.jsx`. **Effort: 1-2 days.** Dependency: tasks 1 and 4.

6. **Introduce a short review state before finalizing onboarding-generated targets.** Files to touch: `src/components/onboarding/SmartOnboarding.jsx`, `src/pages/Onboarding.jsx`. **Effort: 2-3 days.** Dependency: none.

7. **Make the Nutrition page target editor an explicit modal or sheet with clear entry and exit states.** Files to touch: `src/pages/Nutrition.jsx`. **Effort: 1-2 days.** Dependency: task 1.

8. **Add a single “current goal” widget in Profile/More that links to the authoritative target editor.** Files to touch: `src/pages/Profile.jsx`, `src/pages/ProfileEdit.jsx`. **Effort: 1 day.** Dependency: task 1.

9. **Normalize target-related copy so all flows use the same language for goal, target, and mode.** Files to touch: `src/components/onboarding/SmartOnboarding.jsx`, `src/pages/Onboarding.jsx`, `src/pages/Goals.jsx`, `src/pages/Plan.jsx`, `src/components/profile/FitnessSetupTab.jsx`, `src/pages/Nutrition.jsx`. **Effort: 1-2 days.** Dependency: none.

10. **Add a lightweight audit or debug view for target provenance so support can inspect which flow last wrote the values.** Files to touch: `src/lib/profileUtils.js`, `src/pages/admin/AdminUserProfile.jsx` if needed. **Effort: 2-3 days.** Dependency: task 4.

**Total estimate: ~13-23 days.** The biggest jump in perceived quality comes from tasks 1, 4, 6, 7, and 9 because they make the flow feel like one product instead of several overlapping forms.

---

## What NOT to do

1. Do **not** keep multiple screens that each look authoritative but write different target shapes.
2. Do **not** bury the actual target numbers behind estimator math without telling the user where they came from.
3. Do **not** copy MacroFactor’s full program taxonomy unless Atlas is ready to become nutrition-first.
4. Do **not** let onboarding, plan editing, and profile editing drift into different macro definitions.
5. Do **not** show percentage feedback when calories are zero; that produces nonsense and erodes trust immediately.
6. Do **not** make macro setup feel like a one-time wizard with no visible way to revisit it later.

---

## The single highest-leverage thing

The highest-leverage change is to make macro targets feel like one canonical system, not three overlapping implementations. If Atlas can give the user one clearly labeled source of truth for goal, calories, and macros, the rest of the nutrition experience gets easier to understand, easier to trust, and easier to keep using. That is more valuable than adding another calculator or a prettier card, because the real problem here is not number generation. It is authority.

---

**File status:** Draft 1. To be revised after implementation against reality.
