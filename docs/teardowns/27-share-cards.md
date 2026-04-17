# Teardown 27 — Share cards

**Surface:** Social sharing artifacts for Atlas Core, especially the designed milestone and proof-card surfaces that can be exported as images or shared through the OS share sheet.
**Atlas file(s):** [src/components/social/StreakShareCard.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/social/StreakShareCard.jsx:32), [src/components/social/ShareFlow.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/social/ShareFlow.jsx:36), [src/components/social/ShareableProofCards.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/social/ShareableProofCards.jsx:71), [src/pages/Social.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/Social.jsx:169), [src/components/dashboard/DecisionEngineDashboard.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/dashboard/DecisionEngineDashboard.jsx:551), [src/pages/TodayV2.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/TodayV2.jsx:733), [src/components/social/EnhancedShareModal.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/social/EnhancedShareModal.jsx:55)
**Reference apps:** Strava (primary), Spotify Wrapped (secondary)
**Audience tension:** High - serious optimizers want shareable proof that feels accurate and earned, while casual users want a celebratory artifact that is fast, flattering, and easy to post.

---

## Why this screen matters

Share cards sit at the boundary between private progress and public proof. In Atlas, they are not just a utility for exporting an image; they are part of the retention and acquisition loop, because a good card can reinforce a streak, validate progress, and bring a new user into the product. If this surface feels polished and truthful, it makes Atlas feel more premium and more worth talking about.

If it breaks, the failure is immediate and visible. A dead share button, a broken capture pipeline, or a card full of fake-looking numbers turns an earned moment into a dead end. That weakens trust for serious users and strips away the social proof that makes the surface valuable in the first place. World-class here means one obvious artifact per context, one reliable export path, and a design that feels like a finished shareable object rather than a screenshot of an app screen.

This surface also has an audience split that matters more than usual. Serious users care whether the card is honest, data-backed, and worth keeping. General users care whether it looks good enough to post and whether the flow is too heavy. Atlas has to serve both without turning the surface into either a spreadsheet or an ad.

---

## Reference app 1 — Strava (primary)

Strava is the right primary reference because it treats recap and share as extensions of training evidence, not as generic social decoration. Its Monthly Recap and Progress surfaces are private by default, accessible in the mobile app, and still easy to share or download directly from the recap view. That is the right model for Atlas: make the proof feel earned first, then make sharing optional and friction-light. See Strava's [Monthly Recap](https://support.strava.com/hc/en-us/articles/360057807412-Monthly-Recap), [Progress Summary Chart](https://support.strava.com/hc/en-us/articles/28437860016141-Progress-Summary-Chart), and [Training Log](https://support.strava.com/hc/en-us/articles/206535704-Training-Log).

### What Strava does that works

1. **One review destination.** Strava makes recap feel like a destination, not a loose collection of widgets. The user knows where to go to see their month or training history, and the product reinforces that habit consistently. Atlas needs the same clarity so share cards do not fracture across different surfaces with different logic.

2. **Private first, share second.** The recap exists for the user first, and the share/download affordance comes after the value is established. That matters because it keeps the artifact from feeling like marketing. For Atlas, the right order is "see my progress" before "post my progress."

3. **Week or month first, detail second.** Strava's recap and progress views let users orient themselves in a time window before they drill deeper. That sequencing makes the result readable even for people who are not metric-native. Atlas should keep the same hierarchy: big pattern first, specific data second.

4. **Optional sharing without blocking the result.** The user can share the recap section they want, or just keep it for themselves. That avoids forcing a distribution choice on everyone. Atlas should preserve this optionality so sharing remains a bonus rather than a mandatory next step.

5. **Consistent visual encoding.** Strava's recap patterns are learned quickly because activity and progress states are encoded consistently. The user does not need to re-interpret the visual language each time. Atlas share cards should feel equally stable, especially across streaks, weekly proof, and body-composition summaries.

6. **Drill-down is part of trust.** A recap is stronger when the user can trace the numbers back to actual activity. That is what makes a score feel credible instead of decorative. Atlas should keep the same principle: if a card says the week was strong, the user should be able to see what made it strong.

### What Strava does that you shouldn't copy

1. **Do not copy the sport-analytics density wholesale.** Strava can lean into multi-sport context and a deep training vocabulary. Atlas should stay more opinionated and less configurable on this surface, or the card system will start to feel like reporting instead of sharing.

2. **Do not copy a public-feed assumption.** Strava can be socially visible because public activity is part of the product's core model. Atlas should keep the default posture private and intentional, especially for body, nutrition, and recovery data.

3. **Do not copy graph-first storytelling if the graph cannot explain itself.** Strava's charts work because they sit inside a known training model and connect back to source activity. A pretty chart with no narrative would be weaker in Atlas than no chart at all.

---

## Reference app 2 — Spotify Wrapped (secondary)

Spotify Wrapped is the right secondary reference because it turns personal data into a sequence of designed story cards, not just a dashboard. That is especially useful for Atlas's share-card work, because the goal is not only to show a metric but to make the metric worth sending to someone else. Wrapped's official experience and support pages emphasize personalized story cards, a one-stop Wrapped hub, and direct sharing from the experience. See Spotify's [2025 Wrapped user experience](https://newsroom.spotify.com/2025-12-03/2025-wrapped-user-experience/) and [Spotify Wrapped support](https://support.spotify.com/xk-en/article/spotify-wrapped/).

### What Spotify Wrapped does that works

1. **Each card has one job.** Wrapped is strong because every slide or card communicates a single idea before moving on. That keeps the experience from becoming noisy. Atlas can steal that rhythm for weekly proof, streak milestones, and physique cards.

2. **The data feels personal, not generic.** Wrapped works because it makes the user feel seen through their own listening history. Atlas should aim for the same effect with workouts, meals, weight, and check-ins, so the card feels like evidence of a real person, not a template.

3. **Bold hierarchy carries the story.** Wrapped uses strong type, contrast, and pacing so the eye always knows where to land. That is useful for Atlas because share cards need to read instantly when posted in another app or seen in a feed.

4. **Shareability is built into the format.** Wrapped does not treat sharing as an afterthought; the cards themselves are the thing people want to post. Atlas's share cards should aim for that same self-contained quality, where the artifact is complete without additional explanation.

5. **A hub can collect multiple stories.** Wrapped gives users one place to revisit different cards and data stories. Atlas's Social surface is closest to this pattern today, and it should become the canonical place to pick a card rather than a loose gallery of alternatives.

### What Spotify Wrapped does that you shouldn't copy

1. **Do not copy the annual-event energy as a routine product pattern.** Wrapped works because it is a cultural moment. Atlas is a daily fitness app, so its share cards need to feel available whenever progress happens, not only when the calendar says it is time to celebrate.

2. **Do not copy the over-produced hype if the numbers are not real.** Wrapped can afford spectacle because the whole point is a polished summary of a known dataset. Atlas should avoid hype that outruns its data quality, especially on body and adherence cards.

---

## What Atlas does today (current state)

- **Layout and navigation structure:** There are three live share-card entry points and several adjacent generic share utilities. `TodayV2` auto-opens `ShareFlow` when a streak hits one of the configured milestones and the user has not dismissed that exact milestone before. `Social.jsx` is a full route with a card gallery and export controls. `DecisionEngineDashboard.jsx` mounts `ShareableProofCards` as a modal. `EnhancedShareModal.jsx` exists as a broader alternate composer, but I found no live import site for it in `src`, so it reads more like latent or abandoned code than current UX. Nearby but separate, `ShareWorkoutModal.jsx`, `Referral.jsx`, and `ShareTarget.jsx` handle link or OS-share flows; those are distribution utilities, not designed share-card surfaces.
- **Key interactions:** `ShareFlow` renders a fixed 1080x1920 streak card via `html2canvas`, then shares it through `navigator.share` with file support or downloads it as a PNG fallback. `Social.jsx` offers five selector tiles, a preview, and share/download controls with platform-specific hooks for Instagram, Twitter, and Facebook. `ShareableProofCards.jsx` offers four proof-card types - Weekly Proof, Physique Trajectory, Adherence Score, and Milestone - and then routes them through the same capture/share pattern. `EnhancedShareModal.jsx` repeats that basic pattern with six template variants plus copy/download/share actions.
- **Visual approach:** The share-card surfaces are intentionally loud, but they are not unified. `StreakShareCard` is a centered, dark 9:16 card with a fixed black background, orange glow, uppercase branding, and a very simple milestone narrative. `Social.jsx` is more playful and pastel, with five distinct gradient tiles and a smaller square preview card. `ShareableProofCards.jsx` is a desktop-style two-column modal with jewel-tone gradients, metric tiles, and a branded footer. `EnhancedShareModal.jsx` sits somewhere in between, with template selection on the left and a story-card preview on the right.
- **Known issues from code reading:** `ShareableProofCards.jsx` appears to have a real data-shape bug: `weekData` is the query result, but the render guard checks `weekData?.data` and then reads `weekData.data.weights`, which does not match the query return shape. That means the proof-card availability and preview path may never activate correctly. The file also imports `calculateWeightTrend`, `detectPlateau`, `calculateSmoothedWeight`, and `AlertTriangle` but does not use them, which suggests partial or abandoned work. `ShareFlow.jsx` contains a dead `dataUrl` branch in the plain `navigator.share` path and imports `Download` without using it. `TodayV2` auto-opens the share flow on milestone streaks, which is good for virality but can interrupt the home experience if it fires too aggressively.
- **Gaps relative to the reference apps:** Atlas does not yet have one canonical share-card system. The milestone card, proof-card composer, and Social page all use different shell styles, copy, and output assumptions. There is no actual `@capacitor/share` plugin wiring in the codebase search, so the implementation relies on `navigator.share` and download fallbacks rather than a clearly native share pipeline. Compared with Strava and Wrapped, Atlas is still missing a single destination that says "this is the share story" and one shared asset pipeline that powers all of the variants.

---

## Patterns to steal, ranked by ROI

### 🟢 Steal immediately - high impact, low effort

1. **One shared export pipeline.** Every card surface should use the same `html2canvas -> blob/file -> share/download` helper so failures behave the same way everywhere. That removes duplicate logic, reduces platform drift, and makes the surface easier to trust. Effort: 0.5-1 day.

2. **One truth-first card shell.** Reuse a single branded shell with the Atlas wordmark, one headline, one metric block, and one footer CTA, then swap the content block by context. That is the fastest way to make the surface feel like one product instead of three demos. Effort: 1-2 days.

3. **Durable dismissal and timing.** Keep the milestone dismissal memory, but make the trigger stricter so share cards only interrupt when the moment is genuinely worth celebrating. That preserves reward energy without turning the dashboard into a modal trap. Effort: 0.5-1 day.

4. **Platform labels that match output.** Buttons should say what they actually do - share image, download image, copy link - instead of overloading "Share" for every route. The current surfaces already have different outputs; the UI should make that obvious. Effort: 0.5 day.

### 🟡 Steal soon - medium impact, medium effort

1. **Unify the story vocabulary.** Weekly proof, physique trajectory, streak, and milestone should use the same naming and hierarchy across `Social.jsx` and `ShareableProofCards.jsx`. Right now each surface speaks a slightly different dialect, which makes the product feel less intentional. Effort: 1-2 days.

2. **Add a single share-card hub.** Atlas should have one obvious place where users can choose among available cards without context switching between Today, Social, and the dashboard modal. That would make the share system feel deliberate instead of opportunistic. Effort: 1-2 days.

3. **Make availability states explicit.** Card types that are not available should explain why, and available cards should preview immediately without relying on implicit data checks. This matters because a hidden or broken selector feels like a dead feature. Effort: 0.5-1 day.

### 🔴 Consider carefully - high effort or audience-dependent

1. **Native plugin integration.** Adding a real Capacitor share plugin could improve mobile behavior, but only if the team truly needs native file-share parity beyond `navigator.share`. This is a platform decision, not a cosmetic one. Effort: 1-2 days.

2. **Inbound share-loop integration.** Connecting the output cards to `ShareTarget` would be powerful if Atlas wants the viral loop to run both outbound and inbound. That is a product strategy choice, not just a UI refactor. Effort: 2-4 days.

3. **A richer story feed.** A full share gallery or chronological story hub could make the surface feel more like Wrapped, but it risks becoming another content page if the basics are not solid first. Only do this if the team is ready to own it as a real destination. Effort: 3-5 days.

---

## Atlas-specific design tensions to resolve

**Tension 1 - Reward vs interruption.** The streak modal is useful because it catches a moment of momentum, but automatic pop-ups can also break the user's flow on Today. *Resolution:* keep auto-open only for the most meaningful milestones, and make all other share prompts explicit, inline, and skippable.

**Tension 2 - Truth vs spectacle.** These cards need to look good enough to post, but they cannot drift into generic promo art with fake-feeling metrics. *Resolution:* always anchor the card in real derived data first, then add one strong visual flourish and one short brand line.

**Tension 3 - One system vs several surfaces.** Atlas currently has a milestone card, a proof-card composer, a Social gallery, and a separate set of generic share utilities. That fragmentation creates maintenance cost and makes the experience harder to learn. *Resolution:* unify the share-card shells and export path, but allow each context to swap only the content block.

**Tension 4 - Serious optimizer vs casual sharer.** Serious users want proof, context, and maybe a download they can keep. Casual users want a fast, flattering artifact that does not ask them to think too hard. *Resolution:* default to a simple, beautiful image card, then progressively reveal richer data and more options without making them required.

---

## Specific changes to make (actionable list)

1. **Fix the `ShareableProofCards` data-shape bug so the proof cards can actually render and enable correctly.** Update the `weekData` guards and the `data` access to match the query result shape. Files: `src/components/social/ShareableProofCards.jsx`. Effort: 0.5 day. Dependency: none.
2. **Extract one shared share-asset helper for capture, file creation, and fallback logic.** Use it from `ShareFlow`, `ShareableProofCards`, `Social`, and any future share-card composer. Files: `src/components/social/ShareFlow.jsx`, `src/components/social/ShareableProofCards.jsx`, `src/pages/Social.jsx`, `src/components/social/EnhancedShareModal.jsx`. Effort: 1 day. Dependency: 1.
3. **Collapse the card shell styles into one reusable branded frame.** Keep the content variants, but share the same spacing, wordmark, CTA footer, and export framing. Files: `src/components/social/StreakShareCard.jsx`, `src/components/social/ShareableProofCards.jsx`, `src/pages/Social.jsx`, `src/components/social/EnhancedShareModal.jsx`. Effort: 1-2 days. Dependency: 2.
4. **Replace hard-coded sample stats with real derived values everywhere the product is pretending to show user data.** The most obvious targets are `Social.jsx` and `EnhancedShareModal.jsx`. Files: `src/pages/Social.jsx`, `src/components/social/EnhancedShareModal.jsx`. Effort: 0.5-1 day. Dependency: 3.
5. **Reduce the aggressiveness of the Today milestone share prompt.** Keep the milestone reward, but add stricter trigger thresholds or a softer inline entry point so the home screen does not feel hijacked. Files: `src/pages/TodayV2.jsx`, `src/components/social/ShareFlow.jsx`. Effort: 0.5-1 day. Dependency: none.
6. **Decide whether `EnhancedShareModal` is alive or dead.** If it is not meant to ship, remove it; if it is meant to ship, wire it into a visible route or button and align it with the shared shell. Files: `src/components/social/EnhancedShareModal.jsx`, `src/pages/Social.jsx`, `src/components/dashboard/DecisionEngineDashboard.jsx` if the modal is exposed there. Effort: 0.5-1 day. Dependency: 2.
7. **Normalize button copy and fallback order across all share-card surfaces.** Every surface should make it clear when it is sharing an image, downloading a file, or copying a link. Files: `src/components/social/ShareFlow.jsx`, `src/pages/Social.jsx`, `src/components/social/ShareableProofCards.jsx`, `src/components/workouts/ShareWorkoutModal.jsx`, `src/pages/Referral.jsx`. Effort: 0.5 day. Dependency: 2.
8. **Separate generic share utilities from designed share-card UX in the interface language.** Keep `ShareWorkoutModal`, `Referral`, and `ShareTarget` useful, but do not let them read like the same feature as the image-card composer. Files: `src/components/workouts/ShareWorkoutModal.jsx`, `src/pages/Referral.jsx`, `src/pages/ShareTarget.jsx`, `src/pages/Social.jsx`. Effort: 0.5-1 day. Dependency: 7.
9. **Add tests for the share-card availability path and the milestone dismissal path.** The current surface has enough branching that regressions will be easy to miss without coverage. Files: `src/components/social/__tests__/ShareFlow.test.jsx`, `src/components/social/__tests__/ShareableProofCards.test.jsx`. Effort: 1 day. Dependency: 1, 2, 5.

Total effort: about 1-2 weeks if the team wants one coherent share system instead of several loosely related variants. The biggest perceived-quality jump comes from fixing the proof-card bug, unifying the export pipeline, consolidating the branded shell, and making the Today share prompt less interruptive.

---

## What NOT to do

1. Do **not** keep three separate share-card systems that drift in copy, shell, and export behavior.
2. Do **not** turn the cards into generic marketing art with numbers that are not obviously derived from the user's data.
3. Do **not** auto-post or auto-share anything without an explicit user action.
4. Do **not** treat link-sharing utilities like `Referral` and `ShareWorkoutModal` as if they were the same design problem as a branded share card.
5. Do **not** copy Wrapped-style spectacle so aggressively that the artifact stops feeling truthful or fitness-specific.

---

## The single highest-leverage thing

Unify every designed share-card surface behind one truth-first branded shell and one export pipeline, then feed it real data. That one move would fix the current `ShareableProofCards` bug, reduce duplicate capture logic, make the Today milestone card and Social proof cards feel like one product, and give Atlas a clearer social-sharing identity instead of three half-aligned implementations.

**File status:** Draft 1. To be revised after implementation against reality.
