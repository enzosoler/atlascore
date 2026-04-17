# Teardown 31 — Empty, loading, errors, offline, permissions

**Surface:** Cross-cutting system states for loading, empty, error, offline, and permission moments across Atlas Core.
**Atlas file(s):** `src/components/shared/StablePage.jsx`, `src/components/layout/AppLayout.jsx`, `src/hooks/useOnlineStatus.js`, `src/hooks/useSessionExpiry.js`, `src/pages/PermissionsScreen.jsx`, `src/features/onboarding/screens/NotificationsScreen.jsx`, `src/pages/NotificationSettings.jsx`, `src/pages/ProfileEdit.jsx`, `src/pages/BodyProfile.jsx`, `src/pages/Protocols.jsx`, `src/pages/ProtocolDetail.jsx`, `src/pages/Insights.jsx`, `src/pages/Measurements.jsx`, `src/pages/Progress.jsx`, `src/pages/MyDiet.jsx`, `src/pages/MyWorkout.jsx`, `src/pages/LabExams.jsx`, `src/pages/BlockReview.jsx`, `src/pages/OfflineState.jsx`, `src/pages/LoadingState.jsx`, `src/pages/ErrorState.jsx`, `src/pages/PermissionDenied.jsx`
**Reference apps:** Linear (primary), Things 3 + Duolingo (secondary)
**Audience tension:** High — serious users want explicit recovery, trust, and data integrity, while general users need calm language and low-friction guidance when something is missing or blocked.

---

## Why this screen matters

System states are not a support layer in Atlas. They are the trust layer. Most of the app's core value depends on showing a user that data is present, recent, or recoverable. When a measurement, protocol, insight, or permission fails, Atlas has to answer one question immediately: is this genuinely empty, temporarily unavailable, or only blocked until the user takes an action?

That distinction matters for retention and revenue because the highest-friction moments often happen when a user is trying to start, continue, or recover a habit. If Atlas collapses "no data," "loading," and "error" into the same quiet blank space, serious users lose confidence fast and casual users assume the product is broken. A weak state system makes the app feel smaller than it is.

World-class here means every state carries three things at once: a truthful diagnosis, a clear next move, and a visual tone that fits a high-trust health product. Atlas should feel as composed when it cannot load data as it does when the charts are working. The user should never have to guess whether to wait, retry, grant permission, or create something new.

---

## Reference app 1 — Linear (primary)

Linear is the best primary reference because it treats system states as part of the product grammar, not as temporary placeholders. Its audience overlaps with Atlas's serious half: people who want speed, clarity, and precise recovery when work is interrupted. Linear's empty and failure states tend to feel like an extension of the workspace, which is exactly the bar Atlas should hit for health data.

### What Linear does that works

1. **Keeps context visible.** Linear usually preserves the surrounding workspace instead of swapping to a dramatic full-page dead end. That matters because a user can see what still exists, what failed, and where to continue without losing orientation. For Atlas, this is the right model for partial failures on insight and analytics pages.

2. **Uses one primary recovery action.** Linear tends to make the next step obvious, whether that is creating the first item, retrying a failed load, or adjusting a filter. The user is not presented with a menu of equally weighted choices. That focus is important for Atlas because system states should reduce decision load, not add it.

3. **Speaks in operational copy.** Linear's state language is short, plain, and specific. It tells the user what happened and what to do next, without overexplaining. Atlas should borrow that same tone for loading failures, offline messaging, and permissions because the app already serves a serious, goal-driven audience.

4. **Makes emptiness actionable.** Empty spaces in Linear are not dead ends; they are invitations with a clear first step. Even when the surface is empty, the screen still feels intentional and inhabited. That is a strong pattern for Atlas's workout, diet, measurement, and protocol surfaces, where the first successful action is the retention moment.

5. **Differentiates soft and hard failure.** Linear is good at not turning every hiccup into a blocking error. Some issues are shown inline, some are shown as banners, and only true failures become stronger interruptions. Atlas needs the same judgment because the app frequently has enough data to be useful even when one source fails.

6. **Avoids decorative apology.** Linear does not waste the user's time with apologetic illustrations or mascot energy. The visual language stays calm and professional, which increases confidence. That restraint is especially relevant for Atlas because a health app should feel dependable, not theatrical.

### What Linear does that you shouldn't copy

1. **Do not copy the workspace-as-software tone too literally.** Linear can lean into an engineering-product voice because that matches its audience. Atlas serves health and fitness users, so the copy still needs warmth and encouragement when a permission or data source blocks progress.

2. **Do not make every empty state ultra-minimal.** Linear can be sparse because its users are already fluent in the product. Atlas has more general-fitness users who need a bit more explanation and a more obvious next action when they land in a blank state.

3. **Do not over-index on terse error messaging.** Linear can afford brevity because its users tolerate ambiguity and often know how to recover. Atlas should be concise, but not cryptic, especially in offline and permission states where users need to understand why the app is asking for something.

---

## Reference app 2 — Things 3 + Duolingo (secondary)

This secondary pairing adds two things Linear does not fully cover. Things 3 is useful for its calm, settings-like emptiness and quiet state transitions. Duolingo is useful for permissions because it stages the ask, explains the benefit first, and gives the user a low-friction way to defer. Atlas needs both of those lessons.

### What Things 3 + Duolingo does that works

1. **Uses calm, non-alarming emptiness.** Things 3 makes blank or near-blank states feel tidy instead of broken. That is a good model for Atlas when the user has not yet connected a source or created any content.

2. **Explains why a permission matters before asking.** Duolingo does not just throw the system prompt at the user. It primes the ask with a benefit and a specific use case, which is exactly what Atlas should do for notifications, camera, location, and HealthKit.

3. **Offers a dignified skip path.** Duolingo's permission flow works because it allows the user to continue without shame. Atlas should do the same for notifications and optional integrations so users do not feel trapped at the gate.

4. **Treats settings as part of the product, not a dump.** Things 3's settings and preferences feel like a coherent system, not an afterthought. Atlas can use that same calm discipline for notification settings, consent, and integration states.

5. **Keeps recovery low-friction.** Both apps are good at making the next step feel small. That matters in Atlas because users are more likely to complete a permission ask or retry a failed fetch if the action feels lightweight.

### What Things 3 + Duolingo does that you shouldn't copy

1. **Do not copy Duolingo's whimsy.** The playful tone that works for language learning would feel out of place in a health app. Atlas should be encouraging, not cute.

2. **Do not copy Things 3's extreme minimalism for every state.** In a productivity app, sparse can be elegant. In Atlas, sparse can also read as incomplete unless the state makes the recovery path obvious.

---

## What Atlas does today (current state)

- Layout and navigation structure: `src/components/layout/AppLayout.jsx` is the main shell-level home for state feedback. It shows a sticky offline banner when `useOnlineStatus()` reports offline, and it also shows a pull-to-refresh indicator on mobile. Page-level states are mostly embedded inside each screen through `PageShell`, `SectionCard`, `LoadingState`, `ErrorState`, `EmptyState`, and `StatusBanner` from `src/components/shared/StablePage.jsx`.
- Key interactions: The strongest recovery affordances are reload, go back, retry-by-reload, and primary CTA buttons. `SafePageBoundary` swaps a crashed section into a full page shell with Try again and Go back. Many empty states on data-heavy pages expose a direct creation action, such as add the first measurement, build a plan, or create a protocol.
- Visual approach: States are intentionally restrained. Loading is usually a small spinner with text or a card-level loader; empty states use dashed borders or soft tinted panels; error and warning banners lean on warm orange/red accents; permissions use stacked cards and checklist-like rows. The overall feel is calm and functional rather than illustration-heavy.
- Known issues from code reading: Several screens still swallow fetch failures by returning empty arrays or nulls, which makes "failed to load" look like "no data" on pages such as `MyDiet.jsx`, `MyWorkout.jsx`, and some dashboard queries. `src/pages/OfflineState.jsx`, `src/pages/LoadingState.jsx`, `src/pages/ErrorState.jsx`, and `src/pages/PermissionDenied.jsx` exist as standalone fallbacks, but the shared flow is not centered on them and they appear decoupled from routing. Permission handling is also split: `PermissionsScreen.jsx` only requests notifications, `NotificationSettings.jsx` handles the settings-side prompt, and camera/location are only described as "on first use" instead of being governed by one visible permission model.
- Gaps relative to the reference app: Atlas is good at putting a button under an empty card, but weaker at distinguishing partial failure from genuine emptiness. It also lacks a single, obvious recovery grammar for offline and permission states, so the experience feels locally solved instead of systemically designed. Compared with Linear, Atlas is less consistent about where state should live: inline, banner, card, or full-screen boundary.

---

## Patterns to steal, ranked by ROI

### 🟢 Steal immediately - high impact, low effort

1. **Unify the shared state primitive.** `src/components/shared/StablePage.jsx` already contains the right ingredients: safe boundary, loading state, error state, empty state, and banners. Tighten that into one explicit system-state contract and make every page speak the same language. Effort: 1 day.

2. **Make every empty state action-first.** The strongest Atlas screens already do this, but the pattern is not consistent. Bring the same clarity to `Progress.jsx`, `Insights.jsx`, `ProtocolDetail.jsx`, `Measurements.jsx`, and `ProgressPhotos.jsx` so the user always gets a next move, not just a message. Effort: 1-2 days.

3. **Keep partial data visible.** When only one source fails, do not hide the entire screen. This is especially important on analytics pages where half the chart can still be trusted. Effort: 1 day.

4. **Use a single offline language.** `useOnlineStatus.js` and `AppLayout.jsx` already provide a persistent banner and a back-online toast. Make that the default offline pattern everywhere instead of relying on isolated reload buttons or one-off screens. Effort: 0.5-1 day.

### 🟡 Steal soon - medium impact, medium effort

1. **Differentiate "empty" from "error."** Right now some queries return `[]` on failure, which hides bugs as legitimate blank states. Replace those fallbacks with explicit error handling and a separate empty-state branch. Effort: 1-2 days.

2. **Stage permissions before the OS prompt.** `src/features/onboarding/screens/NotificationsScreen.jsx` is already close to the right pattern. Extend that logic to the rest of the permission surface so Atlas explains the benefit before it asks. Effort: 1-2 days.

3. **Add section-level retries.** A reload button is a blunt instrument. The better pattern is a local retry on the affected section so the rest of the page stays usable. Effort: 1 day.

4. **Standardize loaders by intensity.** Use card-level skeletons or branded loaders on dense data pages, and reserve full-screen loaders for first-run or route-blocking cases. Effort: 1 day.

### 🔴 Consider carefully - high effort or audience-dependent

1. **Build a true state orchestration layer.** A single policy for load, empty, error, offline, and permission states would be the cleanest outcome, but it requires touching many screens and agreeing on product rules first. Effort: 3-5 days.

2. **Create a dedicated permission hub.** A consolidated permissions center could reduce duplication across onboarding, settings, and feature entry points. It is a strong system move, but it only works if Atlas wants permissions to feel like a first-class product area rather than a utility screen. Effort: 2-4 days.

---

## Atlas-specific design tensions to resolve

**Tension 1 - Calm versus urgency.**
An offline banner, a denied permission, and a fatal load error should not all feel equally loud. If everything is red and blocking, the product feels panicked; if everything is quiet, the user misses the urgency. *Resolution:* Keep the tone calm by default, but use one clear visual escalation for truly blocking cases and a second, softer style for partial failure. That gives Atlas a composed voice without hiding real problems.

**Tension 2 - Empty versus broken.**
Atlas has several query paths that currently turn failure into an empty array. That creates false emptiness, which is worse than a visible error because the user thinks their data is gone. *Resolution:* Never render an empty state unless the app can prove the state is genuinely empty; if data failed to load, say so explicitly and keep the last known or partial data on screen.

**Tension 3 - Global versus local recovery.**
Some problems deserve a page-level boundary, but many only affect one card, one query, or one permission. A full-screen interruption is too expensive when the user still has usable context. *Resolution:* Default to inline or section-level recovery, and reserve full-screen boundaries for first-load, authentication, or truly unrecoverable route failures.

**Tension 4 - Permission education versus permission fatigue.**
Atlas needs notifications, camera, location, and possibly HealthKit, but asking too early or too often will feel manipulative. Yet asking too late creates friction when the user is already trying to do the thing. *Resolution:* Explain the benefit in-app, ask only when the feature is relevant, and always give a clean skip or later path. That is the best balance between conversion and trust.

---

## Specific changes to make (actionable list)

1. **Add a shared `DataState` contract to `StablePage.jsx` for loading, empty, error, and retry states.**
   File(s) to touch: `src/components/shared/StablePage.jsx`, then consuming pages.
   Effort: 1 day.
   Dependency: none.

2. **Replace silent `catch { return [] }` patterns with explicit error handling on data-fetching screens.**
   File(s) to touch: `src/pages/MyDiet.jsx`, `src/pages/MyWorkout.jsx`, `src/pages/Protocols.jsx`, `src/pages/Insights.jsx`, `src/pages/Measurements.jsx`, `src/pages/BlockReview.jsx`.
   Effort: 1-2 days.
   Dependency: task 1.

3. **Upgrade `SafePageBoundary` so its recovery path is local and contextual, not only reload/back.**
   File(s) to touch: `src/components/shared/StablePage.jsx`.
   Effort: 0.5-1 day.
   Dependency: task 1.

4. **Wire offline state into a reusable inline banner that can appear in any data-heavy page.**
   File(s) to touch: `src/hooks/useOnlineStatus.js`, `src/components/layout/AppLayout.jsx`, `src/components/shared/StablePage.jsx`, selected consumers.
   Effort: 1 day.
   Dependency: task 1.

5. **Consolidate or retire the standalone fallback pages that are drifting away from the shared system.**
   File(s) to touch: `src/pages/OfflineState.jsx`, `src/pages/LoadingState.jsx`, `src/pages/ErrorState.jsx`, `src/pages/PermissionDenied.jsx`, and routing if any of them should stay.
   Effort: 0.5 day.
   Dependency: task 1.

6. **Turn notification permission into a staged benefit-first flow across onboarding and settings.**
   File(s) to touch: `src/features/onboarding/screens/NotificationsScreen.jsx`, `src/pages/PermissionsScreen.jsx`, `src/pages/NotificationSettings.jsx`.
   Effort: 1-2 days.
   Dependency: none.

7. **Add explicit first-use permission education for camera, location, and HealthKit where those features are introduced.**
   File(s) to touch: `src/pages/PermissionsScreen.jsx`, `src/pages/Integrations.jsx`, `src/hooks/useHealthKit.js`, `src/services/healthKitService.js`.
   Effort: 1-2 days.
   Dependency: task 6.

8. **Normalize all empty states to include a next action and a short "why this is empty" line.**
   File(s) to touch: `src/pages/Progress.jsx`, `src/pages/ProgressPhotos.jsx`, `src/pages/ProtocolDetail.jsx`, `src/pages/Measurements.jsx`, `src/pages/Insights.jsx`, `src/pages/LabExams.jsx`.
   Effort: 1-2 days.
   Dependency: task 1.

9. **Replace page-wide spinners with section skeletons or branded loaders on the heaviest screens.**
   File(s) to touch: `src/pages/LabExams.jsx`, `src/pages/MyDiet.jsx`, `src/pages/MyWorkout.jsx`, `src/pages/nutritionist/NutritionistDashboard.jsx`, `src/pages/clinician/ClinicianDashboard.jsx`.
   Effort: 1-2 days.
   Dependency: task 1.

10. **Add a consistent offline-aware save pattern to flows that users may attempt while disconnected.**
    File(s) to touch: `src/pages/TodayV2.jsx`, `src/pages/Measurements.jsx`, `src/pages/ProtocolFormPage.jsx`, `src/pages/NotificationSettings.jsx`.
    Effort: 2 days.
    Dependency: tasks 1 and 4.

Total effort: roughly 8-12 engineer-days.

Biggest jump in perceived quality: tasks 1, 2, 6, and 4. Those four remove the biggest trust leaks: inconsistent state grammar, hidden failures, weak permission staging, and offline ambiguity.

---

## What NOT to do

1. Do **not** turn every loading state into a full-screen blocker; Atlas has enough partial data to keep useful context visible in many places.
2. Do **not** use empty arrays or nulls as a substitute for error handling; that makes real failures look like genuine emptiness.
3. Do **not** make permissions feel playful or gimmicky; the user needs clarity, not persuasion theater.
4. Do **not** rely on a toast alone for offline status; a persistent banner or inline indicator is easier to trust and harder to miss.
5. Do **not** show raw technical errors or stack traces to end users; keep the tone operational and the recovery path obvious.
6. Do **not** invent a different visual language for every page; the state system should feel like one product, not a collection of unrelated fallbacks.

---

## The single highest-leverage thing

Build one shared system-state contract in `src/components/shared/StablePage.jsx` and apply it to the major data screens that currently blur failure into emptiness. That is the highest-leverage move because it fixes the core trust problem in Atlas: the user needs to know whether a screen is empty, loading, blocked, or broken. Once that distinction is reliable, offline banners, permission asks, and retry actions all become easier to standardize, and the product starts to feel like one coherent system instead of a set of separate screens with their own fallbacks.

**File status:** Draft 1. To be revised after implementation against reality.
