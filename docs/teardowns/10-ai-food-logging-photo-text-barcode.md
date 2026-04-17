# Teardown 10 — AI Food Logging (Photo, Text, Barcode)

**Surface:** AI-assisted food logging for meals captured by text description, meal photo, or barcode/package lookup.
**Atlas file(s):** `src/pages/Nutrition.jsx`, `src/components/nutrition/AIFoodInput.jsx`, `src/components/nutrition/FoodCameraScanner.jsx`, `src/components/nutrition/FoodPickerSheet.jsx`, `src/components/nutrition/QuickLogSheet.jsx`, `supabase/functions/log-food-text/index.ts`, `supabase/functions/food-vision/index.ts`, `supabase/functions/food-search/index.ts`, `supabase/migrations/20260325120000_ai_nutrition_feature.sql`, `supabase/config.toml`
**Reference apps:** Cal AI (primary)
**Audience tension:** High — casual users want a fast, forgiving capture flow, while serious users need enough accuracy, editability, and confidence signals to trust the log.

---

## Why this screen matters

This is one of the highest-leverage surfaces in Atlas because it turns a moment of intent into durable nutrition data. If food logging is fast, forgiving, and believable, Atlas gets the inputs that power the Today page, macro tracking, coach insights, and downstream behavior change. If it is slow or brittle, users stop logging and the rest of the product degrades with it.

The revenue impact is direct. AI logging is the kind of premium feature that can justify a subscription, but only if it feels meaningfully better than plain manual entry. Broken AI logging looks like dead ends, bad estimates, confusing fallbacks, or paywalls after effort. World-class logging feels like a single capture-review-confirm flow where users can start with a photo, a sentence, or a barcode and end up with a trustworthy meal in one pass.

---

## Reference app 1 — Cal AI (primary)

Cal AI is the right reference because it is built around the exact promise Atlas is trying to make here: “log food with minimal effort, then verify just enough to trust the result.” It serves a broad consumer fitness audience, which matches Atlas only partially. Atlas has to satisfy both that casual, speed-first user and the more exacting athlete who will inspect every gram.

### What Cal AI does that works

**1. Capture-first entry.** The fastest path is the primary path. Users are pulled immediately into taking a photo or describing a meal instead of being forced through database browsing first, which reduces decision friction and makes the feature feel modern.

**2. One clear review moment.** AI output is not treated as final until the user can inspect it. That review step is critical because it gives users a sense of control without turning the flow back into manual entry.

**3. Confidence through visible correction.** Good AI logging systems do not pretend to be exact. They make uncertainty obvious enough that users understand when to trust the result and when to edit portions or ingredients.

**4. Photo as the hero, not the only input.** Image capture is visually compelling and easy to understand, but the stronger pattern is that the app still supports text-style correction and manual adjustment when the image is ambiguous.

**5. Low-chrome presentation.** The best AI logging flows stay visually quiet. They use one dominant capture surface, a compact result card, and a limited number of next actions so the user never has to interpret a complex form.

**6. Fast recovery from misses.** When AI fails, the experience should not die. The app should offer a next move immediately, such as re-trying with a clearer input, editing the result, or switching to a different capture mode.

**7. Multi-item decomposition.** Meals are often not one thing. A strong AI logging flow lets users split a plate into separate items when the system recognizes multiple components, which is much closer to how people actually eat.

### What Cal AI does that you shouldn't copy

**1. Over-claiming precision.** Cal AI-style apps can feel magical when they are accurate, but Atlas should not imply that every estimate is exact. For serious users, false certainty is worse than an honest estimate.

**2. Hiding the math.** A consumer-first app can sometimes get away with opaque macros, but Atlas cannot. Power users need to see the assumptions behind the result, especially for mixed dishes and restaurant meals.

**3. Forcing a photo-first worldview.** Photo capture is great when it works, but Atlas serves users who may prefer text or barcode entry in many real situations. A photo-only mental model would leave speed on the table.

---

## What Atlas does today (current state)

- The main nutrition surface lives in `src/pages/Nutrition.jsx`. It opens food entry from the page itself, from a quick-log drawer, and from the meal editor rather than from a dedicated standalone AI-only page.
- Text-based AI logging is implemented in `src/components/nutrition/AIFoodInput.jsx`. The component normalizes some pt-BR phrasing, accepts prefill text from quick suggestions, and calls the `log-food-text` edge function with the raw and normalized query.
- The text flow has a real result state. It renders the AI meal name, serving description, macros, confidence, and item breakdown when the model returns multiple items. It can add either the whole meal or individual sub-items.
- Photo logging is implemented in `src/components/nutrition/FoodCameraScanner.jsx` and used from `src/pages/Nutrition.jsx` and `src/components/nutrition/MealEditModal.jsx`. It is not a live camera scanner; it is a file-picker flow with `capture="environment"` and an image preview before analysis.
- The photo flow calls the `food-vision` edge function, auto-selects all detected foods, and lets the user deselect items before confirming. It shows confidence and macro estimates for each detected food.
- The quick-log drawer in `src/components/nutrition/QuickLogSheet.jsx` exposes AI text input, recent foods, and buttons labeled Scan and Search. In `src/pages/Nutrition.jsx`, those Scan/Search hooks currently route back to the generic add-meal flow rather than a barcode or search-specific flow.
- There is no dedicated barcode scanner component, no barcode edge function, and no barcode-specific route found in the codebase. The only barcode-adjacent implementation is `src/components/nutrition/FoodSearch.jsx`, which is a free-text search UI backed by TACO and search APIs, not package scanning.
- The AI text edge function `supabase/functions/log-food-text/index.ts` is real and fairly complete. It authenticates the user, checks a shared cache, enforces tier-based daily limits and spending caps, calls OpenAI `gpt-4.1-nano`, logs usage, and upserts cache results.
- The photo edge function `supabase/functions/food-vision/index.ts` is also real. It authenticates, checks subscription tier, enforces daily limits and spending caps, calls Gemini 2.0 Flash Vision, logs usage, and increments user quotas.
- There are two notable mismatches in the current implementation. First, `AIFoodInput` disables the “Add anyway (low confidence)” button when confidence is low, so the user cannot actually proceed even though the label promises it. Second, `QuickLogSheet`’s `onAISubmit`, `onOpenBarcode`, and `onOpenSearch` are wired in `src/pages/Nutrition.jsx` to `handleAddMeal()`, which opens the generic meal form instead of a dedicated AI, barcode, or search path.
- `supabase/config.toml` explicitly includes `log-food-text`, but I did not find a matching config stanza for `food-vision` in the grep pass. That means the function exists in source, but its deployment/configuration wiring is less obvious from the repository.
- Visually, the surface is clean and utilitarian. The main page uses dense rounded cards, brand-tinted AI accents, and compact utility controls. The scanner modal is plain and functional. The overall tone is more “reliable nutrition tool” than “delightful AI assistant.”

---

## Patterns to steal, ranked by ROI

### 🟢 Steal immediately — high impact, low effort

**1. Unify capture and confirm.** Keep photo, text, and barcode inside one mental model with the same review card and the same commit button. Atlas already has pieces of this, but they are scattered across drawers and page-level controls. **Effort: 1-2 days**

**2. Make uncertainty explicit.** Surface confidence, serving assumptions, and item-level breakdowns before save. The current text and photo flows already compute some of this; the win is making it visible and actionable instead of hidden in the component state. **Effort: 1 day**

**3. Preserve fallback context.** When AI fails, carry the exact phrase or image-derived description into the next step. Right now the main nutrition page does this better than the `FoodPickerSheet` path, so the pattern should be standardized. **Effort: 0.5-1 day**

**4. Promote recent successful logs.** Show recently confirmed meals and recent AI queries as one-tap shortcuts at the top of the logging experience. That is the fastest way to improve retention without changing model quality. **Effort: 1-2 days**

**5. Clean up dead-end actions.** Replace placeholder Scan/Search behavior with actual entry points or remove the buttons until they work. Broken affordances are expensive on a surface that depends on trust. **Effort: 0.5-1 day**

### 🟡 Steal soon — medium impact, medium effort

**6. Add a real barcode path.** Build a barcode scanner that resolves to food search or a barcode database, then drops into the same portion-confirm flow as text and photo. This is the biggest speed win for packaged foods. **Effort: 3-5 days**

**7. Add editable item-level photo review.** For multi-food plates, let users edit names and portions inline before saving. The existing photo function already returns multiple foods; the missing piece is a polished correction UI. **Effort: 2-3 days**

**8. Rework quick log into a true fast lane.** The drawer should be a lightweight entry hub, not a placeholder that punts back to the full meal form. That gives Atlas a better “one-thumb” logging experience on mobile. **Effort: 1-2 days**

### 🔴 Consider carefully — high effort or audience-dependent

**9. Add continuous camera scanning.** A live scanner feels premium, but it is much more complex than the current file-picker capture flow and may not be worth the engineering cost until barcode and photo review are already solid. **Effort: 1-2 weeks**

**10. Add automatic meal decomposition.** Segmenting bowls, plates, and mixed meals into accurate ingredient-level entries could be powerful, but the accuracy bar is high and correction UX becomes mission-critical. **Effort: 1 week**

---

## Atlas-specific design tensions to resolve

**Tension 1 — Speed vs. trust.**
Users want to log in seconds, but AI estimates are inherently uncertain. *Resolution:* Default to a fast capture flow, but never skip the review card. Make the confirm step cheap, not absent.

**Tension 2 — One surface vs. three modes.**
Photo, text, and barcode all solve the same job in different contexts, but splitting them into separate experiences creates fragmentation. *Resolution:* Build one logging shell with mode switching, one result vocabulary, and one save action.

**Tension 3 — Casual users vs. serious users.**
Casual users want “good enough” logging; serious users want the knobs. *Resolution:* Keep the first pass minimal, then reveal precision controls only after AI has done the first draft.

**Tension 4 — Premium feature vs. basic utility.**
Photo analysis is premium, but food logging is core utility. If the premium gate appears too late, it feels like a trap. *Resolution:* State access expectations before capture and offer text fallback immediately when photo is unavailable.

---

## Specific changes to make (actionable list)

1. Replace the `QuickLogSheet` AI submit placeholder with the actual `AIFoodInput` flow or a shared text-analysis handler. Files: `src/pages/Nutrition.jsx`, `src/components/nutrition/QuickLogSheet.jsx`. Effort: 0.5-1 day. Dependency: none.
2. Wire the quick-log Scan and Search buttons to real barcode and search entry points instead of `handleAddMeal()`. Files: `src/pages/Nutrition.jsx`, `src/components/nutrition/QuickLogSheet.jsx`. Effort: 1 day. Dependency: 1.
3. Fix the low-confidence CTA in `AIFoodInput` so users can actually proceed or explicitly edit the result. Files: `src/components/nutrition/AIFoodInput.jsx`. Effort: 0.5 day. Dependency: none.
4. Standardize fallback behavior so the suggested search term is preserved across both the main nutrition page and `FoodPickerSheet`. Files: `src/pages/Nutrition.jsx`, `src/components/nutrition/FoodPickerSheet.jsx`, `src/components/nutrition/AIFoodInput.jsx`. Effort: 0.5-1 day. Dependency: 1.
5. Add a dedicated barcode scanner component and connect it to a food lookup source. Files: new `src/components/nutrition/FoodBarcodeScanner.jsx`, `src/pages/Nutrition.jsx`, `supabase/functions/food-search/index.ts` or a new barcode lookup function. Effort: 3-5 days. Dependency: 2.
6. Merge the text/photo/barcode entry states into one consistent result card and save affordance. Files: `src/pages/Nutrition.jsx`, `src/components/nutrition/FoodPickerSheet.jsx`, `src/components/nutrition/FoodCameraScanner.jsx`. Effort: 2-3 days. Dependency: 1, 2, 3.
7. Add inline editing for multi-item photo results before confirmation. Files: `src/components/nutrition/FoodCameraScanner.jsx`, `src/pages/Nutrition.jsx`. Effort: 1-2 days. Dependency: 6.
8. Add recent AI meals and one-tap re-log chips at the top of the nutrition entry experience. Files: `src/pages/Nutrition.jsx`, `src/components/nutrition/QuickLogSheet.jsx`. Effort: 1-2 days. Dependency: none.
9. Clean up `FoodCameraScanner` object URL handling and error states. Files: `src/components/nutrition/FoodCameraScanner.jsx`. Effort: 0.5 day. Dependency: none.
10. Register `food-vision` in `supabase/config.toml` and align auth verification patterns across AI food functions. Files: `supabase/config.toml`, `supabase/functions/food-vision/index.ts`, `supabase/functions/log-food-text/index.ts`. Effort: 0.5-1 day. Dependency: none.

Total estimate: about 10-16 days for a strong version, with the biggest perceived quality jump coming from items 1, 2, 3, 5, and 6.

---

## What NOT to do

1. Do **not** make AI logging branch into separate hidden experiences for photo, text, and barcode. Fragmentation is the fastest way to make the feature feel unfinished.
2. Do **not** auto-save AI estimates without a review step. The estimate is the product, but the user still needs a chance to catch obvious mistakes.
3. Do **not** keep a button labeled “Scan” if it only opens the generic meal form. Misleading affordances erode trust on a core logging surface.
4. Do **not** bury confidence and portion assumptions in a tooltip or debug panel. If the result is uncertain, the uncertainty needs to be visible in the main flow.
5. Do **not** make premium gating happen after the user has already captured a photo and waited for analysis. That feels wasteful and hostile.
6. Do **not** optimize only for power users. If the first-time user cannot complete a simple meal in under a minute, the AI coach and macro tracking never get enough input to matter.

---

## The single highest-leverage thing

The biggest win is to turn food logging into one unified capture-review-commit flow with honest confidence and real fallback paths. Right now Atlas has the ingredients: a text analyzer, a photo analyzer, a search fallback, and a quick-log drawer. What it lacks is a single surface that makes those options feel like one coherent system. Fix that, and the feature stops feeling like several partial tools stapled together and starts feeling like the reason to subscribe.

---

**File status:** Draft 1. To be revised after implementation against reality.
