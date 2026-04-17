# Teardown 19 — Daily check-in flow

**Surface:** Daily self-reporting flow for sleep, mood, energy, and related habit/streak state, with a separate set of passive streak and milestone surfaces around it.
**Atlas file(s):** `src/components/app/DailyCheckinGate.jsx`, `src/components/today/WeeklyCheckinModal.jsx`, `src/components/today/QuickCheckin.jsx`, `src/components/body/BodyCheckinSheet.jsx`, `src/components/checkin/StreakBadge.jsx`, `src/components/today/MilestoneCard.jsx`, `src/components/layout/AppLayout.jsx`, `src/pages/TodayV2.jsx`, `src/services/checkinService.js`, `src/services/reminderService.js`, `src/pages/StreaksMilestones.jsx`
**Reference apps:** Stoic (primary), Finch (secondary)
**Audience tension:** High — this surface has to satisfy serious users who want honest, useful reflection without turning the experience into a toy, while still staying easy enough that general fitness users will actually complete it every day.

---

## Why this screen matters

The daily check-in is one of the few Atlas surfaces that can change user behavior every single day. It is not just data entry, it is the moment where Atlas decides whether the user feels coached, monitored, or supported. If this flow feels clumsy, punitive, or repetitive, the user loses the habit loop and the app loses the freshest signal it has for coaching, reminders, and streak-related motivation.

This surface has direct retention value because it is the clearest daily commitment point in the product. A broken check-in flow looks like duplicate prompts, inconsistent dates, unclear save states, or a hard gate that feels like a lock screen. World-class would be a single coherent ritual: fast to complete, emotionally readable, forgiving about context, and immediately reflected in the user’s status without making the form itself carry the weight of every streak badge and milestone.

---

## Reference app 1 — Stoic (primary)

Stoic is the closer reference because it treats daily reflection as a mental ritual, not a generic tracker. Its App Store listing explicitly frames the product around morning preparation and evening reflection, plus journaling prompts, mood tracking, streaks and badges, journey history, and trends. That is the right model for Atlas because the check-in should feel like a deliberate self-review, while the streak layer stays supportive rather than dominant. Reference: [Stoic App Store listing](https://apps.apple.com/us/app/stoic-journal-mental-health/id1312926037).

### What Stoic does that works

1. **Batched daily ritual.** Stoic frames the day as two moments, morning and evening, instead of an always-on form. That works because it gives the user a clear mental slot for reflection and makes the action feel intentional rather than incidental.

2. **Prompts before judgment.** The product leans on guided journaling and thought-provoking prompts, which reduces blank-page friction. Atlas’s check-in should borrow that structure by giving the user a reason to answer, not just fields to fill.

3. **History as meaning.** Stoic emphasizes Journey and Trends, so past entries are not dead data. That matters because a reflection app is only valuable when the user can later see patterns, not just a single score from today.

4. **Mood plus context.** Mood tracking is presented alongside sleep, writing, and other themes, which makes the reflection feel multidimensional. Atlas has the same opportunity, especially because its check-ins already touch energy, mood, sleep, and recovery.

5. **Motivation stays secondary.** Streaks and badges exist, but they are not the main content. That is a good fit for Atlas because the user should care first about the quality of the check-in, then about the streak as reinforcement.

6. **Exportable seriousness.** Stoic’s export and therapist-sharing framing signal that the data has real value beyond the app. Atlas does not need the exact same feature, but it should treat check-ins as durable records, not disposable UI state.

### What Stoic does that you shouldn’t copy

1. **Do not copy the content sprawl.** Stoic can afford meditation, quotes, and wider mental-health scaffolding because that is its product. Atlas should not bury the check-in inside a library of adjacent content, or the ritual becomes diluted.

2. **Do not copy the generic wellness tone.** Stoic can stay broad and reflective. Atlas serves users who want actionable coaching, so the copy has to stay concrete and behavior-linked.

3. **Do not copy a library-first information architecture.** A reflection surface should land on the act of checking in, not on reading or browsing. Atlas should keep the composer in front of the user and push archive/trends deeper.

---

## Reference app 2 — Finch (secondary)

Finch adds the motivation layer Stoic does not emphasize as much. Its help center describes streaks, goal-of-the-day, retroactive completion, pause mode, and a gentler approach to missed days. That is useful for Atlas because it shows how to preserve consistency without making the user feel punished for missing one day. Reference: [Finch streaks](https://help.finchcare.com/hc/en-us/articles/37780736136205-Understanding-Streaks), [Goal of the Day](https://help.finchcare.com/hc/en-us/articles/37780061122957-Goal-of-the-Day-Explained), [Creating and Completing Goals](https://help.finchcare.com/hc/en-us/articles/37779940291213-Creating-and-Completing-Goals), [Our Approach to Self-Care](https://help.finchcare.com/hc/en-us/articles/37935669335309-Our-Approach-to-Self-Care).

### What Finch does that works

1. **Low-friction daily goal.** Finch keeps the daily action visible on the home screen and makes completion one tap away. That matters because the check-in must be hard to forget, but easy to finish.

2. **Clear one-focus priority.** Goal of the Day is a smart narrowing mechanism. Atlas could use the same idea to make the daily check-in feel like the day’s key ritual, not one more task among many.

3. **Repair over shame.** Finch’s streak repair and pause mode explicitly soften the cost of missed days. That is a strong pattern for habit apps because it keeps the user in the loop instead of turning a single miss into abandonment.

4. **History is editable.** Finch allows users to update mood check-ins from history. That is valuable because real reflection often gets revised after the moment passes, and the product should allow honesty rather than freeze the first answer.

5. **Gentle reinforcement.** The app uses rewards and encouragement to make progress feel achievable. Atlas can borrow the emotional tone without copying the game layer.

### What Finch does that you shouldn’t copy

1. **Do not copy the mascot economy.** Rainbow Stones, pets, and adventure loops work for Finch’s audience, but they would cheapen Atlas’s coaching position if copied directly.

2. **Do not copy guilt-free streak tricks as the main hook.** Repair and pause are useful, but if they become the headline, the product risks feeling like a game about avoiding punishment instead of a serious check-in tool.

3. **Do not copy the childlike framing.** Finch’s warmth is part of its brand. Atlas needs a calmer, more adult tone that can still be friendly without becoming cute.

---

## What Atlas does today (current state)

- **Layout and navigation structure:** The actual gate lives in `AppLayout`, where `<DailyCheckinGate />` renders after the main app content as a full-screen overlay after 10am. On the Today screen, `TodayV2` also includes streak-related cards, milestone celebrations, and a recovery banner, so the check-in experience is split between a modal-like gate and passive status surfaces rather than one dedicated page.

- **Key interactions:** `DailyCheckinGate` collects sleep, energy, and mood with sliders, then writes through `checkinService.upsertDailyCheckin`. `WeeklyCheckinModal` collects energy, mood, optional sleep, and a note. `QuickCheckin` offers mood, energy, sleep, and hydration sliders, and `BodyCheckinSheet` adds sleep, energy, and recovery sub-panels. In practice, the repository contains several different composers for the same table.

- **Visual approach:** The gate uses a blurred dark backdrop, a rounded card, and a single primary CTA. `WeeklyCheckinModal` uses a gradient-topped dialog with explicit success state. `QuickCheckin` is a compact atlas card. `BodyCheckinSheet` uses mobile-sheet panels with simple grid buttons. The streak surfaces use warmer orange/warn accents, with flame and trophy icons to signal progress rather than reflection.

- **Known issues from code reading:** The surface is fragmented across multiple entry points, and I found no repo-wide import hits for `QuickCheckin` or `WeeklyCheckinModal`, so they read as secondary or possibly dormant. Date handling is inconsistent, because `DailyCheckinGate` uses `getToday()` while `WeeklyCheckinModal` and some other variants derive the date with `new Date().toISOString().split('T')[0]`, which can drift from local-day behavior. Streak logic is duplicated in `TodayV2`, `StreakBadge`, and `MilestoneCard`, with different lookback windows and even different sources, so the user can see inconsistent counts. `checkinService` also has a fallback to `profiles.profile_data.daily_checkins`, which means the data model still straddles canonical table storage and legacy profile storage.

- **Gaps relative to the reference app:** Atlas does not yet have a single reflective archive or history view comparable to Stoic’s Journey/Trends or Finch’s history editing. There is no clear “repair” model for missed days, no prompt-based reflection path, and no obvious way to revisit or edit the day’s entry from the passive status surfaces. The current design is more of a forced daily form plus a set of streak indicators than a cohesive reflection system.

---

## Patterns to steal, ranked by ROI

### 🟢 Steal immediately — high impact, low effort

1. **One daily ritual, one obvious action.** Keep the primary check-in to one short composer with a single save path, then make all streak and milestone surfaces read from that state. This reduces confusion immediately and makes the habit easier to complete. Effort: 1-2 days.

2. **Local-day date normalization.** Standardize every check-in write path on the same local date helper so the day never flips at UTC midnight. That is a small technical fix with a big trust payoff because habit data has to match the user’s sense of “today.” Effort: 2-4 hours.

3. **Clear save confirmation.** Give the user an explicit success state and immediate status update after saving, not just a toast. The reference apps both make completion feel like an event, and Atlas should do the same. Effort: 4-6 hours.

4. **Passive streak separation.** Keep streak pills, milestone cards, and recovery language outside the input form. That preserves the reflective tone in the composer and lets the motivational layer do its job elsewhere. Effort: 1 day.

### 🟡 Steal soon — medium impact, medium effort

1. **Edit history path.** Add a simple way to revisit and revise today’s or prior check-ins from TodayV2. Stoic and Finch both make history useful, and Atlas needs that if the data is going to matter beyond the moment of entry. Effort: 1-2 days.

2. **One-sentence context field.** Add a short optional note or prompt to the main composer so the check-in is not only numeric. This gives the coach better signal without turning the flow into a full journal. Effort: 4-8 hours.

3. **Shared streak helper.** Replace the multiple local streak calculators with one helper and one source of truth. That cuts down on drift between the header pill, milestones, and share-flow thresholds. Effort: 4-6 hours.

4. **Softened gate copy.** Rewrite the gate as a helpful checkpoint rather than a hard lock, and add a later snooze or retry state. That keeps the app from feeling punitive while still preserving the ritual. Effort: 4-8 hours.

### 🔴 Consider carefully — high effort or audience-dependent

1. **Streak repair or pause mode.** Finch’s repair model is good, but it needs a product decision because Atlas’s audience may want adherence without game-like forgiveness mechanics. Effort: 2-4 days.

2. **Prompt-led reflection layer.** Stoic’s prompt model could make the check-in feel richer, but it changes the surface from a quick self-report to a guided reflection system. That is valuable only if the team wants the flow to become a true journal entry, not just a mood tracker. Effort: 2-5 days.

3. **Unified archive and trend view.** A proper check-in history, trend chart, and edit flow would make the surface much stronger, but it is a larger product slice and should not be bolted on before the composer is coherent. Effort: 3-6 days.

Total effort for the recommended set is roughly 1-2 weeks depending on whether the team folds the duplicate entry points into one composer or leaves them as secondary paths. The biggest perceived-quality jumps come from the unified composer, date normalization, passive streak separation, edit history, and a single shared streak helper.

---

## Atlas-specific design tensions to resolve

**Tension 1 — Reflection vs measurement.**
The surface currently mixes reflective self-reporting with status badges and streak pressure. *Resolution:* make the composer feel like a calm check-in first, then expose metrics, streaks, and milestones only after submission or in separate passive cards.

**Tension 2 — Helpful gate vs punitive lock.**
The current gate blocks the app after 10am until the form is filled, which is effective but can feel coercive. *Resolution:* keep the gate as the first prompt of the day, but offer a clear later-dismiss path so the experience nudges completion without feeling like a trap.

**Tension 3 — General user ease vs serious-user fidelity.**
General users want a fast, low-friction check-in, while serious users need accurate history and reliable dates. *Resolution:* keep the default flow very short, but make date handling, edit history, and streak math precise under the hood so power users trust the data.

**Tension 4 — Consistency vs flexibility.**
Atlas currently has several check-in variants, which creates flexibility but also fragmented behavior. *Resolution:* converge the core flow into one canonical composer and treat the other variants as explicit secondary affordances, not equal peers.

---

## Specific changes to make (actionable list)

1. **Extract a shared local-day helper and use it in every check-in write path.** Files: `src/services/checkinService.js`, `src/components/today/WeeklyCheckinModal.jsx`, `src/components/today/QuickCheckin.jsx`, `src/components/body/BodyCheckinSheet.jsx`. Effort: 2-4 hours. Dependency: none.

2. **Make `checkinService` the only canonical save/read adapter for daily check-ins.** Files: `src/services/checkinService.js`, `src/components/app/DailyCheckinGate.jsx`, `src/components/today/QuickCheckin.jsx`, `src/components/today/WeeklyCheckinModal.jsx`, `src/components/body/BodyCheckinSheet.jsx`. Effort: 1 day. Dependency: task 1.

3. **Unify the daily composer around the gate and retire duplicate primary forms.** Files: `src/components/app/DailyCheckinGate.jsx`, `src/components/today/WeeklyCheckinModal.jsx`, `src/components/today/QuickCheckin.jsx`. Effort: 1-2 days. Dependency: tasks 1-2.

4. **Add an optional note or prompt field to the main check-in flow.** Files: `src/components/app/DailyCheckinGate.jsx` or the unified composer component. Effort: 4-8 hours. Dependency: task 3.

5. **Replace the hard-block feel with a softer dismissal or snooze state after the first prompt.** Files: `src/components/app/DailyCheckinGate.jsx`, `src/services/reminderService.js`. Effort: 4-8 hours. Dependency: none.

6. **Add a visible post-save confirmation state that reflects the values the user just entered.** Files: `src/components/app/DailyCheckinGate.jsx`, `src/components/today/WeeklyCheckinModal.jsx`. Effort: 4-6 hours. Dependency: task 2.

7. **Create an edit-history path for today’s check-in and at least the most recent entries.** Files: `src/pages/TodayV2.jsx`, `src/services/checkinService.js`, plus a new history modal or section. Effort: 1-2 days. Dependency: tasks 1-2.

8. **Centralize streak calculation into one helper and reuse it in every streak surface.** Files: `src/pages/TodayV2.jsx`, `src/components/checkin/StreakBadge.jsx`, `src/components/today/MilestoneCard.jsx`, possibly `src/components/social/StreakShareCard.jsx`. Effort: 4-6 hours. Dependency: none.

9. **Separate check-in reflection state from streak status state in TodayV2.** Files: `src/pages/TodayV2.jsx`, `src/components/today/MilestoneCard.jsx`, `src/components/checkin/StreakBadge.jsx`. Effort: 1 day. Dependency: task 8.

10. **Add explicit loading and error states to the gate so it does not feel like a silent lock.** Files: `src/components/app/DailyCheckinGate.jsx`, `src/services/checkinService.js`. Effort: 3-4 hours. Dependency: none.

11. **Decide whether `BodyCheckinSheet` and `QuickCheckin` are real product surfaces or legacy variants, then either wire them intentionally or remove them from the primary path.** Files: `src/components/body/BodyCheckinSheet.jsx`, `src/components/today/QuickCheckin.jsx`, `src/pages/TodayV2.jsx`. Effort: 1 day. Dependency: tasks 1-3.

12. **Align reminder copy with the actual product stance on check-ins, especially the evening closure and streak warning notifications.** Files: `src/services/reminderService.js`. Effort: 2-4 hours. Dependency: task 5.

Total effort: roughly 3-6 days for the core cleanup, or closer to 1-2 weeks if the team also adds history and a canonical edit surface. The biggest quality jump will come from tasks 1, 2, 3, 7, and 8 because they remove fragmentation and make the user’s daily ritual feel trustworthy.

---

## What NOT to do

1. **Do not** turn the check-in into a long onboarding-style questionnaire, because the whole point of this surface is to be repeatable every day.

2. **Do not** mix streak trophies into the form itself, because that confuses reflection with performance and makes the daily ritual feel like a scoreboard.

3. **Do not** copy Finch’s pet-and-currency economy, because Atlas needs adult, coach-like motivation rather than a game loop.

4. **Do not** use UTC midnight as the definition of the day for user-visible check-ins, because that will create trust issues in a local habit product.

5. **Do not** leave multiple equally valid save paths in the product, because users will eventually get inconsistent dates, inconsistent fields, or inconsistent counts.

6. **Do not** make a missed day feel like a moral failure, because the best reference patterns recover the user instead of shaming them out of the habit.

---

## The single highest-leverage thing

Build one canonical, local-day-aware daily check-in composer and make every other check-in surface feed into it or read from it. That one decision fixes the fragmentation problem, removes date drift, makes streaks consistent, and gives Atlas a single reflective ritual that can be coached, reviewed, and surfaced elsewhere without turning the form into a pile of duplicate behavior.

**File status:** Draft 1. To be revised after implementation against reality.
