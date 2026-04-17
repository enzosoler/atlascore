# Teardown 08 — Daily Nutrition Log

**Surface:** Daily intake logging for meals, foods, portions, and daily macro tracking
**Atlas file(s):** `src/pages/Nutrition.jsx`, `src/pages/TodayV2.jsx`, `src/components/nutrition/AIFoodInput.jsx`, `src/components/nutrition/FoodCameraScanner.jsx`, `src/components/nutrition/QuickLogSheet.jsx`, `src/components/nutrition/QuickMealSheet.jsx`, `src/components/nutrition/FoodPickerSheet.jsx`, `src/components/nutrition/FoodSearch.jsx`, `src/components/nutrition/MealEditModal.jsx`, `src/components/nutrition/ManualFoodEntry.jsx`, `src/components/nutrition/MealTimeline.jsx`, `src/components/nutrition/NutritionQuickActions.jsx`, `src/components/nutrition/QuickMealLog.jsx`
**Reference apps:** MyFitnessPal (primary)
**Audience tension:** High — serious users want fast, precise, repeatable logging; general users want something forgiving enough that they do not quit after one hard meal.

---

## Why this screen matters

This is one of the highest-leverage surfaces in Atlas because it creates the nutrition record that everything else depends on. The AI coach, macro summaries, streaks, and any future diet guidance only work if the log is used daily and used honestly. If this surface is slow, ambiguous, or fragile, the whole nutrition story collapses into a nice-looking dashboard with no trustworthy data behind it.

The retention impact is direct. A user who can log breakfast in under 10 seconds is much more likely to come back at lunch and dinner. A user who has to bounce between AI, search, portion screens, and undo-heavy edit flows will stop logging, even if the visual presentation is polished. Broken logging here does not just reduce nutrition utility; it undermines Atlas’s broader promise that coaching will adapt to what the user actually did.

World-class here means the app can handle three distinct jobs without friction: fast repeated logging, accurate food search for known items, and graceful fallback when the user does not know exact portions. It should feel like one coherent system with multiple entry modes, not a cluster of half-related components.

---

## Reference app 1 — MyFitnessPal (primary)

MyFitnessPal is the right reference because it is opinionated about the exact problem Atlas is solving: help people log food fast enough that they keep doing it. I reviewed MyFitnessPal’s current public help pages for [adding food](https://support.myfitnesspal.com/hc/en-us/articles/360032274592-How-do-I-add-a-food-to-my-food-diary-), [Quick Log](https://support.myfitnesspal.com/hc/en-us/articles/360032622491-What-is-Quick-Log-and-how-does-it-work), [remembered meals](https://support.myfitnesspal.com/hc/en-us/articles/360032272432-How-do-I-create-and-log-remembered-meals-), [suggested searches](https://support.myfitnesspal.com/hc/en-us/articles/12338510991117-Suggested-Searches), [barcode scan](https://support.myfitnesspal.com/hc/en-us/articles/360032624771-How-do-I-use-the-barcode-scanner-to-log-foods-), [meal scan](https://support.myfitnesspal.com/hc/en-us/articles/360045761612-Meal-Scan-FAQ), and [food timestamps](https://support.myfitnesspal.com/hc/en-us/articles/360036224752-Food-Timestamps-FAQs). That mix maps closely to Atlas’s problem: a high-frequency logging workflow that has to support both speed and precision.

### What MyFitnessPal does that works

1. **Single diary entry point.** MyFitnessPal keeps the user oriented around the diary and the meal they are adding to, rather than asking them to think in terms of separate modules. The user starts from a meal context, then chooses the method that fits the moment. That reduces navigation overhead and keeps the task anchored to “add this meal” instead of “find a feature.”

2. **Fast search with typed intent.** The search flow is built for intent-driven input: type a brand or keyword, get suggested search strings, and see the add affordance right beside the result. The critical part is that search does not end at discovery; it ends at a one-tap add with the current portion, which keeps the task short even when the database is huge.

3. **Quick Log for known items.** MyFitnessPal’s Quick Log is useful because it strips the workflow down to the one thing many users already know: the item and the portion they want to record. That is a smart escape hatch for repeat foods and restaurant items where the user is not trying to be perfectly rigorous.

4. **Recent and frequent foods.** The app surfaces recently used foods and saved items because repetition is the norm, not the exception. This matters more than fancy AI for most users; the same breakfast, the same lunch, and the same snacks are what drive daily logging consistency.

5. **Remembered meals as first-class objects.** MyFitnessPal treats repeated multi-food combinations as something you can save and re-log. That is a powerful middle ground between single-item logging and full recipe creation. It reduces friction for people who think in meals, not ingredients, and it avoids making the user rebuild the same plate every day.

6. **Barcode and meal scan as alternate fast paths.** MyFitnessPal offers camera-based shortcuts for packaged foods and photo-based meal recognition, and it makes them feel like alternate entrances to the same log, not separate products. The user can start from the source of truth they have in hand: a package, a plate, or a typed description.

7. **Time and meal grouping.** Food timestamps and meal grouping add structure without forcing the user into a rigid ritual. The diary can still stay readable when the app preserves both the meal category and the approximate time of intake. That helps users understand patterns without making logging feel bureaucratic.

### What MyFitnessPal does that you shouldn't copy

1. **Do not copy the premium gating of core logging paths.** MyFitnessPal is comfortable hiding useful shortcuts behind subscriptions, but Atlas should not make the basic act of logging food feel artificially partitioned. If search, quick log, or scan becomes a business-model minefield, trust drops immediately.

2. **Do not copy the cluttered diary density.** MyFitnessPal’s power comes with a dense interface that can feel heavy for casual users. Atlas serves a mixed audience, so the logging surface should stay legible and calm even while it supports advanced workflows.

3. **Do not copy the guilt-first tone.** MyFitnessPal can sometimes feel like it is managing compliance more than helping the user. Atlas should stay supportive and operational, not moralizing. The surface should help the user continue, not make them feel judged for imperfect entries.

---

## What Atlas does today (current state)

Atlas has the beginnings of a real logging system, but it is spread across several overlapping paths and only some of them actually complete a log to `food_logs`.

- The main `Nutrition` page loads the user’s profile targets from `profiles.profile_data`, loads all `food_logs` for the user, converts each row into a meal-like card, and renders the selected day with a date stepper. It computes daily totals, a logging streak, and a “repeat yesterday’s breakfast” prompt for today.
- The page uses a big empty-state CTA when there are no meals, and a more guidance-heavy layout when there are already meals. In both states, the primary action is still “add meal,” not “log food,” which pushes users into a multi-item meal form rather than a direct diary entry.
- The actual add/edit flow is a modal meal builder with three input modes: AI text, database search, and camera. AI text calls the `log-food-text` edge function. Search combines local TACO hits with FatSecret results after a debounce. Camera opens `FoodCameraScanner`, which calls the `food-vision` edge function and returns detected items for selection.
- Saving a meal writes one `food_logs` row per food item, not one row per meal. Editing a meal deletes the original row and reinserts the current food list. Deleting is optimistic and uses an undo toast before the delete commits.
- There is also a separate `QuickMealSheet` on `TodayV2` that logs a simple name + calories + protein entry directly to `food_logs`, infers meal type from the time of day, and invalidates today/coach queries. That is the only truly short-path logger in the codebase.
- The visual style is clean, card-heavy, and soft-edged. The page leans on pale borders, rounded panels, strong spacing, and a few gradient hero blocks. It looks pleasant, but the density of controls inside the add-meal modal is much higher than the rest of the page suggests.
- Several adjacent components are present but not fully wired: `QuickLogSheet` routes recent-food taps, AI submit, barcode, and search actions back into the generic add-meal flow instead of performing a direct log; `FoodSearch` has placeholder query functions that return empty arrays; `QuickMealLog` and `MealEditModal` use stub mutation functions; `FoodPickerSheet` is a cleaner shell around `FoodSearch` and `AIFoodInput`, but it is not the main page path.
- The biggest code smell is that “meal” is mostly a presentation concept. The storage model is a list of food log rows, the UI groups them into meal buckets, and edit/delete logic has to reconstruct the grouping each time. That works, but it is not yet a first-class meal object.

---

## Patterns to steal, ranked by ROI

### 🟢 Steal immediately — high impact, low effort

1. **One dominant action with clear subpaths.** MyFitnessPal’s add-food entry starts from one job and lets the user choose the method that suits the moment. Atlas should keep a single primary “log meal” action, but make the downstream choice between AI, search, scan, and quick add explicit and fast. Effort: 1-2 days.

2. **Recent and frequent foods at the point of entry.** Atlas already stores recent foods in local storage, but it does not use them as aggressively as it should. MyFitnessPal’s strength is that repeated foods are surfaced before the user starts typing, which removes the most common logging burden. Effort: 1 day.

3. **Current-portion quick log.** The fastest path should be “I know this item; log it now” with a default portion and a single confirmation. That is the one-tap pattern MyFitnessPal uses to keep power users moving. Effort: 1-2 days.

4. **Meal-grouping clarity.** MyFitnessPal makes it obvious whether the user is adding to breakfast, lunch, or a saved meal. Atlas already has meal types, but the modal currently treats them like a dropdown attribute instead of the organizing principle of the flow. Effort: 1 day.

5. **Soft fallback when exact data is missing.** When the AI or search route is uncertain, the user should not hit a dead end. MyFitnessPal’s flow always offers a way to keep going, even if the exact match is imperfect. Atlas already has some of this in AI fallback-to-search, but it should be made more visible and faster. Effort: 1 day.

### 🟡 Steal soon — medium impact, medium effort

1. **Saved meals as a real library.** MyFitnessPal’s remembered meals are one of the most valuable repeat-use accelerators in the whole category. Atlas has a repeat-yesterday-breakfast shortcut, but that is not enough. The app should let users save any repeated combination as a reusable meal object. Effort: 3-5 days.

2. **Barcode scan as a true alternate start.** The current camera flow is photo-based meal recognition, which is useful but not the same as package scanning. A barcode path would make packaged foods much faster and more deterministic. Effort: 3-4 days.

3. **Suggested searches and smarter ranking.** MyFitnessPal’s suggested search strings reduce typing and disambiguation work. Atlas’s inline search should rank recent foods, frequently used items, and local database hits before generic external results. Effort: 2-3 days.

4. **Food timestamps or meal-time hints.** Atlas already infers meal type from time in some paths, but it does not expose time as a meaningful part of the logging story. MyFitnessPal’s timestamp model is a useful way to make meal timing legible without forcing users to micromanage it. Effort: 2-3 days.

### 🔴 Consider carefully — high effort or audience-dependent

1. **Recipe and ingredient builder.** A full recipe system would help serious users, but it is much more product surface area than Atlas currently needs. The value is high for home cooks and batch preparers, but it is not the best first fix for the daily log. Effort: 1-2 weeks.

2. **Deep photo recognition with verification.** The existing camera scanner can be improved, but a truly robust meal scan with confidence handling, item grouping, and portion correction is a larger investment. It is attractive, but it only works if the rest of the log remains simpler than the scan fallback. Effort: 1-2 weeks.

3. **Cross-meal and multi-day copy tools.** Copying yesterday’s breakfast is a good start, but broader duplication tools need product decisions about how much reuse Atlas should encourage versus how much novelty it should preserve. This is high leverage for disciplined users, but it can clutter the surface if introduced too early. Effort: 4-6 days.

---

## Atlas-specific design tensions to resolve

**Tension 1 — Fast logging vs. structured meals.** Atlas currently behaves as though every log should be a meal bundle, even when the user really wants to add one item quickly. That slows down the most common case: repeat foods and packaged foods. *Resolution:* make one-tap item logging the default, and keep the meal builder as the “add multiple items” path, not the entry requirement.

**Tension 2 — AI first vs. search first.** The page starts with AI, but the code and the fallback behavior make it clear that search is still the more reliable path. That is a mismatch between the visual pitch and the actual system reliability. *Resolution:* keep AI as an assistive mode, but promote search and recent foods as equally visible primary paths so the UI reflects what really works today.

**Tension 3 — Meal as a concept vs. log row as storage.** The UI wants to present coherent meals, but persistence is row-based and edit/delete logic has to rebuild the grouping every time. That creates complexity in the code and ambiguity in the interface. *Resolution:* either commit to a first-class meal object in the data model or stop pretending the log rows are meals; in the short term, preserve the meal presentation but simplify the editing model so users do not feel the seam.

**Tension 4 — Helpful guidance vs. clutter.** The page uses several guidance surfaces at once: next action, empty state prompts, streak cards, macro summaries, quick suggestions, repeat breakfast, and quick log. That is good for retention but easy to overdo. *Resolution:* keep one guidance surface dominant at a time based on state, and collapse the rest into secondary actions so the page does not become a recommendation wall.

---

## Specific changes to make (actionable list)

1. Add a real quick-log path that can log from text, recent food, barcode, or search without routing everything back through the full meal modal. File(s): `src/components/nutrition/QuickLogSheet.jsx`, `src/pages/Nutrition.jsx`, `src/components/nutrition/QuickMealSheet.jsx`. Effort: 2-3 days. Dependency: none.

2. Make recent foods a first-class rail in the add flow, not just a local-storage fallback. File(s): `src/pages/Nutrition.jsx`, `src/components/nutrition/QuickLogSheet.jsx`, `src/components/nutrition/FoodSearch.jsx`. Effort: 1-2 days. Dependency: none.

3. Replace the current stubbed `FoodSearch` data hooks with a real data source or remove the component from the active flow. File(s): `src/components/nutrition/FoodSearch.jsx`, `src/components/nutrition/FoodPickerSheet.jsx`. Effort: 1-2 days. Dependency: none.

4. Turn `QuickMealSheet` into the canonical approximate-log flow for Today, and expose it from the Nutrition page as a secondary quick add path. File(s): `src/components/nutrition/QuickMealSheet.jsx`, `src/pages/TodayV2.jsx`, `src/pages/Nutrition.jsx`. Effort: 1 day. Dependency: task 1.

5. Add a reusable meal template model so repeated combinations can be saved and re-logged without rebuilding rows. File(s): `src/pages/Nutrition.jsx`, `src/components/nutrition/MealEditModal.jsx`, `src/components/nutrition/QuickMealLog.jsx`. Effort: 4-5 days. Dependency: none.

6. Simplify the add-meal modal by making AI, search, and camera explicit branches with different affordances instead of a single dense control cluster. File(s): `src/pages/Nutrition.jsx`, `src/components/nutrition/AIFoodInput.jsx`, `src/components/nutrition/FoodCameraScanner.jsx`, `src/components/nutrition/FoodPickerSheet.jsx`. Effort: 2-3 days. Dependency: task 1.

7. Add a barcode path that can sit beside the existing camera scan and search modes. File(s): `src/pages/Nutrition.jsx`, `src/components/nutrition/QuickLogSheet.jsx`, new scanner component or shared scan service. Effort: 3-4 days. Dependency: none.

8. Make search ranking favor recent items, frequent items, and local matches before external database hits. File(s): `src/pages/Nutrition.jsx`, `src/components/nutrition/FoodSearch.jsx`, `src/services/foodSearchService` if needed. Effort: 2-3 days. Dependency: task 2.

9. Reduce the meal-row reconstruction complexity by introducing a single meal save/update abstraction. File(s): `src/pages/Nutrition.jsx`, `src/components/nutrition/MealEditModal.jsx`. Effort: 3-4 days. Dependency: none.

10. Tighten the camera and AI fallback states so they always end in either add, edit, or search, never in a dead-end warning. File(s): `src/components/nutrition/AIFoodInput.jsx`, `src/components/nutrition/FoodCameraScanner.jsx`, `src/pages/Nutrition.jsx`. Effort: 2 days. Dependency: task 1.

11. Remove or finish the stubbed companion components (`QuickMealLog`, `MealEditModal`) so the codebase does not suggest flows that do not persist. File(s): `src/components/nutrition/QuickMealLog.jsx`, `src/components/nutrition/MealEditModal.jsx`. Effort: 1-2 days. Dependency: none.

12. Collapse repeated guidance into a single state-aware hero so the page is not competing with itself for attention. File(s): `src/pages/Nutrition.jsx`, possibly `src/components/nutrition/NutritionQuickActions.jsx`. Effort: 1-2 days. Dependency: none.

Total effort: about 22-30 days depending on whether barcode and meal templates are built as small increments or a more unified logging architecture. The biggest perceived-quality jumps come from tasks 1, 2, 5, 6, and 8 because they change the speed of logging, the quality of the search path, and the coherence of the meal model without requiring a full redesign.

---

## What NOT to do

1. Do **not** make the user choose between too many entry modes before they can save anything. The surface should offer options, but the fastest path must always be obvious.

2. Do **not** keep the current pattern where “quick log” buttons simply reopen the full meal form. That creates the illusion of speed without actually reducing work.

3. Do **not** force the user to think in grams for every entry. Approximate logging is essential for restaurant meals, AI-detected foods, and general users who will not weigh everything.

4. Do **not** copy MyFitnessPal’s density for density’s sake. Atlas should be faster and calmer, not just a smaller clone of a crowded diary.

5. Do **not** treat AI as the only premium-looking feature. Search, recent foods, and templates are more valuable day-to-day than an impressive but unreliable analysis step.

6. Do **not** let meal editing continue to feel like delete-and-rebuild. That is fine for a prototype, but it is not acceptable for a daily logging surface that should feel dependable.

---

## The single highest-leverage thing

If the team only does one thing from this teardown, make the surface support a true one-tap repeat log path: recent foods, saved meals, and approximate quick add should all be able to finish a log without forcing the user through the full meal builder. That is the shortest path to improving retention because it addresses the main failure mode in the current code: Atlas has a lot of logging intent, but too much of it collapses back into the same slow multi-step modal. Fix the repeat path and the entire nutrition surface gets faster, more trustworthy, and more worth opening twice a day.

---

**File status:** Draft 1. To be revised after implementation against reality.
