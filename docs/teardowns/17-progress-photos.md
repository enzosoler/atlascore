# Teardown 17 — Progress photos

**Surface:** Photo checkpoints for body progress, with upload, per-pose organization, visual comparison, and checkpoint review.
**Atlas file(s):** `src/pages/ProgressPhotos.jsx`, `src/services/bodyProgressService.js`, `src/pages/Body.jsx`, `src/components/body/BodyCheckinSheet.jsx`
**Reference apps:** Happy Scale (primary), BodyFast (secondary)
**Audience tension:** High — serious optimizers want consistent, evidence-like comparisons; casual users want a fast, low-friction way to capture progress without turning body tracking into a chore.

---

## Why this screen matters

Progress photos are one of the few body-tracking inputs that can cut through day-to-day noise. Weight fluctuates, measurements can feel abstract, and momentum is easy to misread. This surface matters because it is the place where Atlas can turn invisible effort into something a user can actually see, revisit, and trust.

If this experience is weak, the user gets a pile of images with no structure: no clear checkpointing, no trustworthy comparison, and no obvious reason to come back. That is bad for retention because the product fails at the moment when users are asking, “Is this working?” World-class here means users can capture consistently, organize by date and pose, and compare in a way that makes change legible instead of arguable.

This is also a trust surface. Progress photos are sensitive, personal, and often tied to motivation or shame. The product has to feel private, deliberate, and precise. If Atlas makes the workflow feel random, users will not treat the photos as evidence. If it makes the workflow feel controlled and simple, the photos become a reason to keep using the app.

---

## Reference app 1 — Happy Scale (primary)

Happy Scale is the right primary reference because it is built around body progress as a calm, longitudinal story rather than a noisy archive. It serves users who care about change over time and need reassurance that small, inconsistent data points still fit into a meaningful pattern. That matches Atlas only partially: Atlas has a broader fitness audience, but the emotional job is similar.

### What Happy Scale does that works

1. **Chronology first**  
   Happy Scale frames progress as a sequence with a clear start, current state, and trend line. That matters because body change is easier to understand when the user can see where they started and what “current” means without digging through history. For Atlas, the equivalent is making checkpoints read like a narrative, not a media library.

2. **Low-anxiety language**  
   The product avoids making every fluctuation feel like a failure. That tone is important on body surfaces because users are often sensitive to judgment when they open them. Atlas should preserve that calmness for photos: the UI should feel informative, not evaluative.

3. **One dominant takeaway**  
   Happy Scale does not overload the user with too many simultaneous interpretations. It gives a primary story and lets the details support it. That is a useful pattern for Atlas because photo surfaces can easily become cluttered with dates, notes, stats, and automation all at once.

4. **Consistency over spectacle**  
   The value is in repeated, comparable input. That makes the user’s routine feel worthwhile. For Atlas, the lesson is that the capture workflow should reward consistency more than aesthetic embellishment, because the real product value is in comparable checkpoints.

5. **Simple review of trend**  
   The app makes review feel lightweight enough that users actually return to it. It does not ask for a lot of cognitive effort to understand whether the trend is moving. Atlas should use the same discipline in photo review: quickly show whether a checkpoint is complete, what changed, and what is missing.

6. **Stable mental model**  
   Happy Scale keeps the user oriented around the same core relationship between past, present, and trend. That stability matters more than visual novelty. For Atlas, the photo system should always answer the same questions in the same order: what checkpoint is this, what poses exist, and how does it compare to the last comparable one.

### What Happy Scale does that you shouldn't copy

1. **Do not make the surface too numeric**  
   Happy Scale can lean hard into numbers because that is the product. Atlas photos are different: too much emphasis on counts and deltas can make the user miss the visual story. The photo surface should keep metrics subordinate to images.

2. **Do not over-rely on reassurance copy**  
   A calm tone helps, but if every surface repeats the same soothing language it starts to feel generic. Atlas should be grounded and specific, not therapized. The user needs clarity, not motivational wallpaper.

3. **Do not flatten the workflow into a single trend card**  
   Photos need capture, organization, and comparison behaviors. A single “your progress looks good” summary would be too shallow and would hide the operational work the user has to do to keep the system useful.

4. **Do not hide incompleteness**  
   A progress surface that only celebrates the successful data points can mislead the user. Atlas should make missing poses, incomplete checkpoints, and stale dates visible so the user understands whether the system is actually trustworthy.

---

## Reference app 2 — BodyFast (secondary)

BodyFast adds the photo-specific layer Happy Scale does not provide: explicit checkpoint habits, pose consistency, and side-by-side visual comparison. It is a better reference for the mechanics of progress photos, because it frames the activity as a repeatable body-composition ritual rather than a one-off upload.

### What BodyFast does that works

1. **Checkpoint thinking**  
   BodyFast’s useful pattern is to treat progress as checkpoints, not random uploads. That makes the user think in sessions, which is the right mental model for body photos. Atlas already uses the checkpoint idea in code; it should keep sharpening that model.

2. **Comparison as the payoff**  
   The app makes comparison feel like the reward for the workflow. That is the correct hierarchy: capture first, organize second, compare third. Atlas should keep the compare interaction prominent enough that users know why they are doing the capture work.

3. **Pose consistency guidance**  
   Progress photos only become trustworthy when the pose stays stable. BodyFast’s value here is in making the comparison conditions obvious. Atlas should keep guiding front, side, back, and free pose capture so users do not compare mismatched images later.

4. **Routine framing**  
   The product encourages the user to repeat the same habit over time. That helps retention because progress photos become part of a ritual instead of a guilt-driven task. Atlas should borrow that rhythm without becoming overly gamified.

5. **Simple before/after logic**  
   BodyFast’s strongest pattern is the easy mental bridge from “then” to “now.” Users should not need to assemble the comparison in their head. Atlas should keep the before/after structure explicit, especially on mobile.

### What BodyFast does that you shouldn't copy

1. **Do not turn the surface into a streak game**  
   Streak pressure can help capture frequency, but it can also make body photos feel punitive. Atlas serves a mixed audience, so the surface should encourage consistency without making missed sessions feel like failure.

2. **Do not oversimplify by forcing one comparison path**  
   A single rigid “before/after” pairing is not enough for users who want to inspect a specific pose or date range. Atlas needs more control than a narrow comparison model, even if the default stays simple.

3. **Do not over-index on transformation hype**  
   Photos are sensitive. If the UI leans too far into hype, it can become emotionally manipulative or corny. Atlas should feel precise and useful, not like a makeover reel.

---

## What Atlas does today (current state)

- Layout and navigation structure: the main surface lives at `/progress-photos` behind `EntitlementGate`, with an unauthenticated branch that shows a sign-in prompt instead of the page; it is also embedded in `src/pages/Body.jsx` under the `photos` tab, and `src/components/body/BodyCheckinSheet.jsx` uses the Photos action to navigate there.
- Key interactions: users create a new checkpoint in a modal, pick the date with a custom wheel picker, optionally auto-fill weight and body fat from the latest measurement, upload one image per pose, crop the image before saving, delete individual photos, filter by pose, compare photos with a drag slider, and browse checkpoints in a timeline and expandable cards.
- Organization model: each checkpoint is organized by date plus four fixed pose keys (`front`, `side`, `back`, `pose`), and the page groups records by checkpoint date rather than by album, tag, or freeform collection; the service layer reads and writes `progress_photos`, with a fallback to `profiles.profile_data.progress_photos` if the table is missing.
- Visual approach: the page uses Atlas cards, soft gradient accents, compact overline/subtitle text, a dense but mobile-friendly layout, pose chips, thumbnail timelines, and a single large comparison panel to make the surface feel controlled rather than gallery-like.
- Known issues from code reading: `selectedDate` is set from the timeline but never used, so timeline clicks do not visibly change the page; `checkpointDates` only exists in component state, so a checkpoint can be created without a persisted backend record until a photo upload happens; `ComparisonSlider` only compares the earliest and latest checkpoint for the active pose filter, not an arbitrary user-selected pair; `src/components/progress/ProgressPhotoCarousel.jsx` exists but is not referenced anywhere; capture is file-input based, not camera-first.
- Privacy and upload handling: photo uploads go through `stripExif`, then `resizeImage(..., 2048)`, then Supabase Storage with signed URLs; the signed photo URLs are created with a 24-hour TTL so images survive browsing sessions but still expire.
- Limit and promotion behavior: the page shows a free-plan checkpoint limit of 5, and it separately triggers a one-time `PaywallTrigger` after the first successful photo upload using a localStorage flag.
- Gaps relative to the reference apps: there is no camera-guided capture flow, no persistent checkpoint selection UI, no way to choose an arbitrary before/after pair, no note or caption system, and no stronger “complete vs incomplete checkpoint” state beyond counts and thumbnails.

---

## Patterns to steal, ranked by ROI

### 🟢 Steal immediately — high impact, low effort

1. **Make checkpoint completeness unmistakable**  
   Borrow Happy Scale’s calm clarity by showing whether a checkpoint is complete, partial, or stale right at the card and timeline level. Atlas already has the raw counts, so this is mostly a presentation problem. Effort: 0.5-1 day.

2. **Give comparison a single obvious default**  
   Keep the current compare concept, but make the default pair and pose context explicit so users do not have to infer what they are looking at. The current latest-vs-earliest behavior is functional, but the mental model is too hidden. Effort: 0.5-1 day.

3. **Persist the checkpoint draft state**  
   Move checkpoint creation out of transient component state and into something durable so the user does not lose a newly created date when they leave. This is a high-leverage fix because it turns a loose upload form into a real progress system. Effort: 1-2 days.

4. **Strengthen pose guidance in the capture path**  
   Keep the four-pose model, but make the guidance harder to miss before upload so users are less likely to create incomparable photos. This is one of the cheapest ways to improve future comparison quality. Effort: 0.5-1 day.

### 🟡 Steal soon — medium impact, medium effort

1. **Let users choose the comparison pair**  
   Add a direct picker for “before” and “after” checkpoints instead of always defaulting to the oldest and newest photos. That gives serious users control without making the default flow heavier for casual users. Effort: 1-2 days.

2. **Turn the timeline into a real selector**  
   Use the existing `selectedDate` state to open a date-focused detail view or scroll focus, rather than letting timeline taps disappear into state. This would make the timeline feel like navigation, not decoration. Effort: 1-2 days.

3. **Add a checkpoint review step before upload**  
   After the cropper, show a small review screen with date, pose, and any metadata before committing the upload. That would reduce accidental uploads and make the flow feel more deliberate. Effort: 2-3 days.

4. **Unify the page and embedded entry points**  
   Make the `/progress-photos` page and the embedded `Body` tab share a clearer common header and action pattern so the experience does not feel like two slightly different products. Effort: 1-2 days.

### 🔴 Consider carefully — high effort or audience-dependent

1. **Build a camera-first capture flow**  
   An in-app camera with guidance overlay would be strong, but it is a product and platform commitment, not a small UI tweak. It is only worth it if progress photos become a core differentiator and the team is ready to own capture quality end to end. Effort: 3-5 days for a basic version, longer for a polished one.

2. **Add automated visual change callouts**  
   AI-generated “waist looks leaner” style annotations would raise engagement, but they also carry a risk of being wrong, creepy, or emotionally abrasive. This needs a very careful product decision, not just implementation. Effort: 1-2 weeks.

3. **Introduce a richer photo library model**  
   Tags, notes, albums, and custom compare sets would help advanced users, but they can easily overcomplicate a surface that should stay emotionally light. This only makes sense if Atlas decides progress photos are a premium, power-user workflow. Effort: 1+ week.

---

## Atlas-specific design tensions to resolve

**Tension 1 — Guided capture vs. fast upload.**  
The current surface relies on file input and a crop step, which is fast but does not guarantee consistent photos. Serious users need guidance; casual users just want to get the image in quickly. *Resolution:* keep upload fast, but make the four-pose guidance and date checkpoint flow unavoidable before save, then let the OS camera/file picker remain the entry point.

**Tension 2 — Evidence vs. inspiration.**  
Progress photos can function as proof, but they can also become a motivational scrapbook. If Atlas leans too hard into inspiration, the user may not trust the comparisons; if it leans too hard into evidence, the surface can feel clinical. *Resolution:* make the default tone precise and calm, and let the comparison result speak for itself instead of adding hype copy.

**Tension 3 — Local draft vs. persisted record.**  
Right now a checkpoint can exist as component state before it exists in the backend, which makes the model fragile. That is tolerable for a prototype but bad for a progress system that is supposed to be durable. *Resolution:* treat checkpoint creation as a persisted event, not a temporary UI state, and only use local state for in-progress edits.

**Tension 4 — Simple default compare vs. user control.**  
The current earliest-to-latest compare is simple, but it is not always the most useful pair. Power users will eventually want to compare a specific phase, pose, or milestone. *Resolution:* keep one simple default compare, but add an explicit pair selector so advanced users can override it without losing speed.

---

## Specific changes to make (actionable list)

1. Persist checkpoints as first-class records instead of only keeping new dates in component state. Files: `src/pages/ProgressPhotos.jsx`, `src/services/bodyProgressService.js`. Effort: 1-2 days. Dependency: none.
2. Wire the existing `selectedDate` state into a real timeline detail or focus behavior. Files: `src/pages/ProgressPhotos.jsx`. Effort: 0.5-1 day. Dependency: 1.
3. Add a pair selector for before/after comparison so users can choose any two checkpoints. Files: `src/pages/ProgressPhotos.jsx`. Effort: 1-2 days. Dependency: 1.
4. Make the active pose filter visibly affect the compare header so users know which pose is being compared. Files: `src/pages/ProgressPhotos.jsx`. Effort: 0.5 day. Dependency: 3.
5. Turn the capture guidance into a compact pre-upload checklist or banner that is visible before users choose a file. Files: `src/pages/ProgressPhotos.jsx`. Effort: 0.5-1 day. Dependency: none.
6. Replace the one-time post-upload paywall reveal with a clearer locked-state treatment when the free checkpoint limit is reached. Files: `src/pages/ProgressPhotos.jsx`. Effort: 1 day. Dependency: none.
7. Make checkpoint completion status explicit on each card and in the timeline thumbnails. Files: `src/pages/ProgressPhotos.jsx`. Effort: 1 day. Dependency: 1.
8. Decide whether `src/components/progress/ProgressPhotoCarousel.jsx` is dead code or a real reusable browser, then either wire it into a live surface or remove it. Files: `src/components/progress/ProgressPhotoCarousel.jsx`, `src/pages/ProgressPhotos.jsx` if wiring. Effort: 0.5-1 day. Dependency: none.
9. Add a lightweight note or caption field to checkpoint creation so users can remember what changed. Files: `src/pages/ProgressPhotos.jsx`, `src/services/bodyProgressService.js`. Effort: 1-2 days. Dependency: 1.
10. Make the Body check-in photo shortcut communicate that it opens the dedicated photo workflow instead of implying inline capture. Files: `src/components/body/BodyCheckinSheet.jsx`. Effort: 0.5 day. Dependency: none.
11. Consider adding a camera-aware upload option only after the main checkpoint persistence and comparison flow is stable. Files: `src/pages/ProgressPhotos.jsx`, possibly a new capture component. Effort: 3-5 days. Dependency: 1, 3, 5.

Total effort: about 8-15 days for the practical improvements, with the biggest quality jump coming from persisting checkpoints, making comparison selectable, and fixing the timeline/compare model so the surface behaves like a real progress system instead of a transient upload form.

---

## What NOT to do

1. Do **not** turn the page into a social gallery or feed; progress photos are private evidence first, not content.
2. Do **not** make comparison auto-interpret body change in a way that sounds medical or judgmental; Atlas should stay useful, not overconfident.
3. Do **not** hide missing poses behind a polished slider; incomplete checkpoints need to be visible so users trust the result.
4. Do **not** make the user manage uploads through unrelated measurement screens; the photo workflow should stay self-contained.
5. Do **not** force a camera-only path; file upload is currently the working path and should remain a fallback even if camera capture improves later.
6. Do **not** bury the date or pose context under decorative graphics; the user needs to know what is being compared immediately.

---

## The single highest-leverage thing

Turn progress photos into a persisted checkpoint system with explicit pose slots and user-selectable comparison pairs. That one change fixes the biggest current weakness in the surface: today the page can look complete while still behaving like a transient upload form with local draft state, a hidden compare default, and timeline taps that do not actually drive anything. If Atlas makes checkpoints durable and comparison explicit, the screen stops being a folder of images and starts acting like a trustworthy body-progress tool.

**File status:** Draft 1. To be revised after implementation against reality.
