# Teardown 06 — TodayV2 Dashboard

**Surface:** Today / home dashboard for the Atlas Core app, combining daily status, quick actions, AI guidance, streaks, plan summary, and entry points into workout, nutrition, body check-in, chat, and sharing.
**Atlas file(s):** `src/pages/TodayV2.jsx`, `src/components/today/TodayMobileUI.jsx`, `src/components/today/Day1Banner.jsx`, `src/components/today/TodayPlanSection.jsx`, `src/components/today/TodayWorkout.jsx`, `src/components/today/TodayNutrition.jsx`, `src/components/ai/AITodayInsight.jsx`, `src/components/ai/CoachChatTrigger.jsx`, `src/components/ai/CoachChatSheet.jsx`, `src/components/body/BodyCheckinSheet.jsx`, `src/components/nutrition/QuickMealSheet.jsx`, `src/components/protocols/TodayDoseSection.jsx`, `src/components/social/ShareFlow.jsx`
**Reference apps:** Whoop (primary), Apple Fitness (secondary)
**Audience tension:** High — serious users want dense, trustworthy status and fast access to logging; casual users want encouragement, clarity, and a small number of obvious next steps.

---

## Why this screen matters

This is the home base. It is the first screen most users will see repeatedly, and in a habit product that makes it the highest-frequency decision surface in the app. If Today feels confusing, the user loses the “what should I do now?” answer and starts bouncing into other tabs just to orient themselves. If it feels too thin, the app stops earning the daily open.

TodayV2 sits at the center of the retention loop because it is not just a dashboard. It is the place where Atlas converts passive checking into action: log a meal, start a workout, record a check-in, open the coach, or keep a streak alive. That means every weak moment here has compounding cost. A broken home screen does not just look bad; it breaks the habit loop that keeps users active, subscribed, and returning.

The quality bar is therefore unusually high. World-class here means the screen can answer three questions instantly: “How am I doing?”, “What should I do next?”, and “What matters most today?” It has to work for someone chasing performance with a Whoop-like mindset and also for someone who just wants a calm, motivating fitness home screen without feeling flooded.

---

## Reference app 1 — Whoop (primary)

Whoop is the right primary reference because it serves the same serious-optimizer mindset Atlas wants to keep, while still presenting a single, emotionally legible answer up front. It is strongest when the user wants a daily readiness read, a quick interpretation, and one obvious action rather than a wall of disconnected widgets.

### What Whoop does that works

1. **One dominant read.** Whoop typically leads with a single recovery or strain-style answer that frames the whole day. That works because the user does not have to assemble the story from multiple cards; the app does that synthesis for them. Atlas needs the same “one sentence, one number, one direction” discipline on Today.

2. **Metric hierarchy is obvious.** Whoop is not afraid to make one metric visually louder than the rest and let everything else support it. That keeps the dashboard from becoming a scoreboard of equal-weight modules. For Atlas, the equivalent is a primary daily status or plan card that clearly outranks streaks, weather, and secondary suggestions.

3. **Color has semantic meaning.** Good / caution / bad states are consistent and reusable across the app. The user learns the language once and can read it quickly every day. Atlas already uses accent colors, but Whoop’s value is that the colors are part of the decision system, not just decoration.

4. **Small trend context.** Whoop does not make the user dig for trend direction; it gives enough historical context to answer “is this getting better or worse?” without a separate analytics visit. That is the right level of depth for a home screen: enough to orient, not enough to send the user off into analysis mode.

5. **Action follows state.** The dashboard suggestions are not generic shortcuts. They change based on what matters now, which makes the surface feel smart rather than merely organized. Atlas should use the same principle so Today recommends the next best action from the user’s actual state, not a fixed shortcut set.

6. **Adaptive timing.** A morning Whoop check-in and an evening summary do not feel like the same experience with different labels. The same screen changes tone based on when it is opened. That matters for Atlas because the user’s motivation changes through the day, especially on a surface that mixes training, nutrition, and recovery.

7. **Legible urgency.** When something is off, Whoop does not bury it. It signals the issue early enough that the user can still act on it. Atlas should preserve that sense of “this is the one thing to handle now” without turning the screen into an alarm system.

8. **One-tap escape hatches.** Secondary detail is present, but the path to deeper data is always obvious and short. That keeps power users satisfied without making the first screen feel like a report. Atlas needs this same pattern because its audience includes users who will inspect every number and users who only want a nudge.

### What Whoop does that you shouldn't copy

1. **Medicalized language.** Whoop can lean on specialized terms because its audience expects it. Atlas should not mirror that vocabulary everywhere, because a casual user will not need “recovery,” “readiness,” or training language in every corner of the screen unless it is translated into plain benefits.

2. **A single-track personal loop.** Whoop is mostly about the individual and the body. Atlas also has to support nutrition, coach interaction, progress sharing, and habit formation, so the home screen cannot collapse into only training status.

3. **Over-indexing on severity.** Whoop can afford to make a day feel medically consequential because that is part of its value proposition. Atlas should be more balanced and less intense, especially for users who are here to build consistency rather than optimize like an athlete.

4. **Paywall pressure as a primary UI strategy.** Whoop can lean into gated detail because its core product story is premium analytics. Atlas should not make the home screen feel like a teaser wall; it needs to prove value first and monetize without eroding trust.

---

## Reference app 2 — Apple Fitness (secondary)

Apple Fitness is the right secondary reference because it fills in the motivational side that Whoop does not prioritize. It is especially useful for Atlas because it handles progress visibility and encouragement without making the screen feel like enterprise software for your body.

### What Apple Fitness does that works

1. **Instant progress rings.** The rings are a compact, legible progress model that users can understand at a glance. They are also emotionally satisfying because you can see the shape of completion, not just a number. Atlas can borrow that compactness for daily progress without copying the exact visual treatment.

2. **Encouragement without clutter.** Apple Fitness uses celebratory language and visual reinforcement in small doses. That keeps the experience positive for casual users while still giving motivated users a sense of momentum. Atlas needs more of this restraint on Today, especially around streaks and completed tasks.

3. **Milestones feel earned.** When Apple Fitness celebrates, it feels like a reward for something the user already understands. That matters because a celebration that arrives without context feels fake. Atlas should celebrate streaks and check-in streaks, but only when the user can connect the celebration to a real behavior.

4. **Clean progress typography.** The interface tends to give the user simple numbers, short labels, and highly readable spacing. That works on a home screen because it reduces interpretation cost. Atlas can use this discipline to make dense data feel lighter.

5. **Gentle motivation.** Apple Fitness does not shame. It nudges. That is important for Atlas because some users will open Today on a bad day, and the screen should still feel usable rather than accusatory.

### What Apple Fitness does that you shouldn't copy

1. **Oversimplification of the model.** Apple Fitness can keep the model narrow because it only needs to represent movement and activity rings. Atlas has more domains, so it would be a mistake to flatten the dashboard until it loses meaning for nutrition, workouts, body checks, and AI guidance.

2. **Ecosystem assumptions.** Apple Fitness works best when the user is already inside Apple’s hardware and service stack. Atlas cannot rely on that kind of lock-in, so the home screen needs to be useful on its own, with or without connected devices.

---

## What Atlas does today (current state)

- **Layout and navigation structure:** `TodayV2` is the `/Today` home route and is included in the main app shell bottom navigation for the athlete role. It is also wrapped in `EntitlementGate`, so access to the surface can be gated before the user reaches the dashboard. The screen is entered by normal app navigation, onboarding redirects, and tab-bar selection; it is dismissed by leaving the route or switching to another tab.

- **Module composition:** The page is a long, stacked mobile dashboard built inside `TodayScreen` from `TodayMobileUI`. The actual top-level order is header, day-1 banner or daily status + narrative + trial countdown, streak milestone or recovery state, paywall trigger, primary action, macro rings, proactive AI card, coach guidance section, streak chain dots, protocol summary, weekly workout progress, a five-tile quick actions grid, upcoming plan summary, recommendations, first-workout milestone, and then three overlays/sheets: `CoachChatSheet`, `BodyCheckinSheet`, `QuickMealSheet`, plus `ShareFlow`.

- **Key interactions:** The screen supports opening coach chat, sending suggested AI messages, logging body checks, logging quick meals, navigating to workouts/nutrition/progress/goals/photos, opening a share modal at milestone streaks, triggering a 3-day paywall, and deep-linking into the Stripe completion flow via `?subscribed=1&session_id=...`. It also opens `Day1Banner` actions for brand-new users and uses geolocation to fetch weather.

- **Visual approach:** The page mixes premium dark hero treatment with many rounded light cards, chips, and pills. It uses multiple accent tokens (`brand`, `brand-ai`, `warn`, `ok`) and several card systems at once: some modules are highly polished custom cards, while others lean on the shared `atlas-card`/`atlas-overline` language. The result is dense, mobile-first, and visually energetic, but not fully unified.

- **Loading and empty-state handling:** There is no top-level loading shell. `useDailyStateV2`, `useAICoach`, and the `today-checkin` query all feed the dashboard with fallback values, so the page renders immediately with zeros, nulls, or hidden sections rather than a skeleton. That means the user can briefly see a dashboard that looks complete even when data is still loading, and there is no explicit page-level error state for failed daily data. Some child components do handle their own empty states, such as `CoachChatSheet`, but the home screen itself does not explain partial or missing data.

- **Known issues from code reading:** The dashboard is doing a lot of work in one file, which makes visual rules harder to keep consistent. It relies on multiple independently fetched sources and derived fallbacks, so the “today” story can fragment if one source is stale and another is fresh. Weather is opportunistic and silent if geolocation fails. The page also auto-opens the streak share flow when a milestone is reached and not dismissed, which is good for engagement but potentially interruptive if the user just wanted to review the dashboard.

- **Gaps relative to the reference app:** Compared with Whoop, the screen lacks a single dominant status read with strong hierarchy. Compared with Apple Fitness, it lacks one cohesive visual progress system. The page already has a lot of content, but the content is not yet organized into a clean “read first, act second, inspect third” structure. The dashboard does not yet make it obvious which module is the one thing that matters most today.

---

## Patterns to steal, ranked by ROI

### 🟢 Steal immediately — high impact, low effort

1. **One dominant day read.** Collapse the top of the screen into a single summary card that answers “how is today going?” in one glance. Atlas already computes enough state to do this; the work is mostly presentation and prioritization. This would immediately reduce the feeling that the page is a collage. **Effort: 1-2 days**

2. **One consistent state language.** Normalize the meaning of green, amber, red, and neutral across status, streaks, plan completion, and recommendations. Right now the page uses the colors well enough individually, but not as a coherent language. A consistent state system will make the screen feel more trustworthy and less decorative. **Effort: 1 day**

3. **Contextual first actions.** Surface 2-3 actions at the top based on the biggest actual gap today: log meal, start workout, body check-in, or coach prompt. This is the highest value “Whoop principle” for Atlas because it turns the dashboard from reporting into decision support. **Effort: 1-2 days**

4. **Compact trend cues.** Add tiny trend bars or sparklines for the most important daily signals, especially workout consistency and nutrition adherence. The user does not need a full analytics module here, only enough signal to understand direction. **Effort: 2-3 days**

5. **Explicit partial-state messaging.** When data is missing, say so directly instead of silently falling back to zeros or hiding cards. This is a low-effort trust win and matters a lot for casual users who may not know whether they are behind or the app has not loaded yet. **Effort: 1-2 days**

### 🟡 Steal soon — medium impact, medium effort

1. **Progress rings with one job each.** Give the rings or counters a clear daily meaning rather than four equal-weight macro visuals. The Apple Fitness lesson here is not to copy rings literally; it is to give the user a compact shape of progress that feels satisfying at a glance. **Effort: 2-4 days**

2. **Milestone celebration discipline.** Keep celebrations, but make them rarer, more contextual, and easier to dismiss permanently. The current streak/share system is useful, but it needs more control so it feels like a reward, not a pop-up tactic. **Effort: 2-3 days**

3. **Progressive disclosure for secondary data.** Keep Today dense for power users, but make the secondary modules collapsible or de-emphasized when the user is in casual mode. That keeps the screen from becoming a vertical dump of good intentions. **Effort: 3-4 days**

4. **Per-state dashboard copy.** Add more specific copy for “just started,” “on track,” “missing one thing,” and “falling behind.” A fitness dashboard wins when the user feels accurately diagnosed, not merely encouraged. **Effort: 2 days**

### 🔴 Consider carefully — high effort or audience-dependent

1. **Customizable home layout.** Let users decide what lives above the fold and in what order. This would satisfy power users, but it risks turning the home screen into a preferences project instead of a daily habit surface. **Effort: 1-2 weeks**

2. **Predictive next-best-action engine.** Replace rule-based prioritization with a more adaptive recommendation engine. That could be powerful, but it should only happen after the dashboard language is already clear, because a smart but poorly framed recommendation feels random. **Effort: 1-2 weeks**

3. **Full social layer on Today.** A friend feed or community comparison could be useful, but it would pull the surface away from the current serious-casual balance. Social belongs here only if it is subtle, optional, and clearly secondary to the user’s own plan. **Effort: 1+ week**

---

## Atlas-specific design tensions to resolve

**Tension 1 — Dense optimizer dashboard vs. calm daily home.** The page currently has enough modules to satisfy a power user, but that same density makes it harder for a casual user to know where to look first. *Resolution:* Make the top 25 percent of the screen ruthlessly simple and use the rest of the page for depth. The first screenful should answer the day; everything below it should deepen the story, not compete with it.

**Tension 2 — Synthesis vs. raw data.** Atlas has a lot of actual state, and it is tempting to expose all of it as separate cards. That creates accuracy, but it also creates fragmentation. *Resolution:* Keep the underlying detail, but summarize it into one dominant daily narrative card and one dominant action card. Let raw data live below the fold or one tap away.

**Tension 3 — Serious coaching vs. casual motivation.** Serious users need truthful feedback, and casual users need an experience that does not feel punitive. Those goals conflict when the dashboard is behind on progress. *Resolution:* Use neutral, specific language for the baseline state and reserve stronger urgency only for truly actionable misses. The screen should feel honest first and motivational second, never the other way around.

**Tension 4 — Always-on AI vs. dependable manual UI.** Atlas mixes rule-based guidance, AI briefing, proactive insights, and manual quick actions. That is powerful, but it risks making the AI feel like the center of gravity when the user just needs to log food or start training. *Resolution:* Keep AI as the interpreter and coach, not the primary navigation layer. The user should be able to succeed on Today even if every AI module disappears.

---

## Specific changes to make (actionable list)

1. **Add a single top-level daily status card that synthesizes workout, nutrition, check-in, and protocol progress.** Touch `src/pages/TodayV2.jsx` and `src/components/today/TodayMobileUI.jsx`. **Effort: 1-2 days.** Dependency: none.

2. **Reorder the top of Today so the synthesized status appears before streaks, weather, and secondary banners.** Touch `src/pages/TodayV2.jsx`. **Effort: 0.5-1 day.** Dependency: task 1.

3. **Introduce a real loading shell for TodayV2 instead of rendering fallback zeros immediately.** Touch `src/pages/TodayV2.jsx` and, if needed, `src/components/today/TodayMobileUI.jsx`. **Effort: 1-2 days.** Dependency: none.

4. **Add an explicit empty-state treatment for missing daily data, especially nutrition and workouts.** Touch `src/pages/TodayV2.jsx`, `src/components/today/TodayPlanSection.jsx`, `src/components/today/TodayNutrition.jsx`, and `src/components/today/TodayWorkout.jsx`. **Effort: 1-2 days.** Dependency: task 3.

5. **Unify the color and radius system across the custom cards on Today.** Touch `src/pages/TodayV2.jsx` and `src/components/today/TodayMobileUI.jsx`. **Effort: 2-3 days.** Dependency: none.

6. **Reduce the number of competing top-of-screen modules by collapsing or demoting low-priority sections.** Touch `src/pages/TodayV2.jsx`. **Effort: 1-2 days.** Dependency: task 1.

7. **Turn the quick actions grid into a state-aware set of recommendations rather than a fixed five-tile matrix.** Touch `src/pages/TodayV2.jsx`. **Effort: 2 days.** Dependency: task 1.

8. **Add tiny trend indicators to the daily summary areas for workout consistency and nutrition adherence.** Touch `src/pages/TodayV2.jsx` and optionally `src/components/today/TodayMobileUI.jsx`. **Effort: 2-3 days.** Dependency: task 1.

9. **Make milestone and share prompts less interruptive by adding stricter frequency control and clearer dismissal memory.** Touch `src/pages/TodayV2.jsx` and `src/components/social/ShareFlow.jsx`. **Effort: 1-2 days.** Dependency: none.

10. **Surface AI availability and fallback states directly in the dashboard when proactive coaching is missing or stale.** Touch `src/pages/TodayV2.jsx` and `src/components/ai/AITodayInsight.jsx`. **Effort: 1 day.** Dependency: none.

11. **Standardize the text copy for “done”, “missing”, and “next step” states so the home screen reads like one product voice.** Touch `src/pages/TodayV2.jsx`, `src/components/today/Day1Banner.jsx`, and `src/components/ai/CoachChatTrigger.jsx`. **Effort: 1-2 days.** Dependency: tasks 1 and 4.

12. **Audit the page for sections that can collapse into a single reusable `TodayCard` pattern.** Touch `src/pages/TodayV2.jsx` and `src/components/today/TodayMobileUI.jsx`. **Effort: 2-4 days.** Dependency: task 5.

**Total estimate: ~14-21 days.** The biggest perceived-quality jump will come from tasks 1, 3, 4, 5, and 6 because they change how fast the user can read the page, not just how much content it contains.

---

## What NOT to do

1. Do **not** turn Today into a scrolling feed of every available metric. That would satisfy data hunger but destroy the “what matters now” answer.

2. Do **not** hide the primary action behind an AI prompt. Atlas can use AI to guide, but the user still needs direct paths to log, train, and check in.

3. Do **not** copy Apple Fitness rings as a literal visual system if they do not map to Atlas’s actual behavior. Pretty progress without truthful semantics becomes decoration.

4. Do **not** rely on silent fallbacks for missing data. If the app does not know, it should say so cleanly.

5. Do **not** let milestone celebrations interrupt every session. Rewards should reinforce behavior, not feel like a modal tax.

6. Do **not** make casual users decode athlete jargon to understand the day. The screen should translate status into plain language first.

---

## The single highest-leverage thing

If the team only does one thing here, it should be to make the top of Today a single synthesized daily status card with one clear next action. That change fixes the core problem this surface has today: the dashboard contains many useful pieces, but it does not yet tell the user the answer fast enough. Once the screen can say, in one glance, “here is your day and here is what to do next,” the rest of the modules become supporting detail instead of competing for attention.

---

**File status:** Draft 1. To be revised after implementation against reality.
