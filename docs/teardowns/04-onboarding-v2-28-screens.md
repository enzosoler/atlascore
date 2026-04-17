# Teardown 04 - Onboarding V2 (28 screens)

**Surface:** Rebuilt onboarding and auth flow that lives at `/onboarding`, persists quiz answers, branches into account creation, and hands the user into the core app.
**Atlas file(s):** [src/pages/OnboardingV2.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/OnboardingV2.jsx:16), [src/App.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/App.jsx:301), [src/features/onboarding/schema.js](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/features/onboarding/schema.js:8), [src/features/onboarding/OnboardingEngine.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/features/onboarding/OnboardingEngine.jsx:309), [src/features/onboarding/OnboardingContext.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/features/onboarding/OnboardingContext.jsx:223), [src/features/onboarding/projectionEngine.js](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/features/onboarding/projectionEngine.js:1), [src/features/onboarding/screens/AccountCreationScreen.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/features/onboarding/screens/AccountCreationScreen.jsx:21), [src/pages/Auth.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/Auth.jsx:283), [src/pages/AuthCallback.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/AuthCallback.jsx:1), [src/pages/Onboarding.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/Onboarding.jsx:581), [src/components/onboarding/SmartOnboarding.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/onboarding/SmartOnboarding.jsx:111)
**Reference apps:** Cal AI (primary), Noom (secondary)
**Audience tension:** High - serious users want a precise, credible plan while general users need a short, reassuring path that does not feel like a survey.

---

## Why this screen matters

This surface is the bridge between curiosity and commitment. It has to turn a new user into an activated user, but it also has to earn enough trust that the user accepts the data collection, the projection, and eventually the paywall. If the onboarding feels fake, confusing, or too long, Atlas loses the user before any real retention loop starts.

This flow matters directly to revenue and retention because it is where Atlas proves that the promise is not just branding. A broken onboarding path means users never reach their plan, never complete account creation, or never believe the app can personalize anything. A world-class version should feel like a guided intake with visible payoff on every screen: every question should reduce uncertainty, and every transition should make the next step feel more concrete.

Atlas serves both serious optimizers and general fitness users, so the onboarding has to do two jobs at once. Serious users want fast, legible numbers and a clear model. General users want reassurance, fewer decisions, and copy that does not sound like a laboratory intake form. The current flow leans toward ambition, but it does not yet make the tradeoff explicit enough.

---

## Reference app 1 - Cal AI (primary)

Cal AI is the right primary reference because it sits close to Atlas's strongest onboarding promise: use a small amount of user input to produce a confident, body-change-oriented payoff before asking for money. It serves a body-composition audience that is partly serious and partly casual, which matches Atlas more closely than a generic wellness app.

### What Cal AI does that works

1. **It gets to the point quickly.** Cal AI-style onboarding is effective when the first screens feel like a short intake, not a brand tour. That matters for Atlas because the user needs to believe there is a real system behind the app before they are asked for more data.

2. **It turns inputs into a visible outcome.** The best part of this pattern is that the user does not just answer questions; they get a projection, a target, or a plan back almost immediately. Atlas needs that same cause-and-effect feel so the quiz does not read like extraction.

3. **It uses visual choices instead of wall-of-text forms.** Big cards, low-typing inputs, and single-purpose screens reduce fatigue and make the flow easier to complete on mobile. Atlas already has that direction in places; it should double down on it.

4. **It treats the body goal as the core job.** The onboarding is not trying to teach every feature first. It centers the user's goal, then uses the product to solve it. That is the correct framing for Atlas too because the product is selling outcome, not software novelty.

5. **It makes realism part of the pitch.** The strongest version of this pattern does not promise magic; it tells the user whether the goal is aggressive, sustainable, or needs adjustment. That is especially valuable for Atlas because a serious user will notice fake precision instantly.

6. **It places trust near conversion.** Cal AI-style flows usually put social proof, trial language, and subscription framing close to the moment of commitment. That works because the user has just seen enough value to understand what they are buying.

### What Cal AI does that you shouldn't copy

1. **Do not copy aggressive certainty without matching accuracy.** If the plan feels more confident than the math behind it, Atlas will lose trust fast. The product can be direct, but only where the implementation is actually real.

2. **Do not turn every screen into a conversion nudge.** Cal AI can lean heavily into progress and premium framing because that is its business. Atlas should protect the user's sense of momentum and not make the early flow feel like a funnel trap.

3. **Do not make the onboarding feel like a single-purpose sales script.** Atlas has a broader operating-system ambition than a one-problem app. The design should still feel like it leads into a living product, not just a paywall.

---

## Reference app 2 - Noom (secondary)

Noom is the better secondary reference because it solves the behavioral side of onboarding: how to make a general user feel supported, not judged, while moving them toward commitment. Where Cal AI is strong on outcome and speed, Noom adds the emotional pacing Atlas needs for less technical users.

### What Noom does that works

1. **It normalizes the user's struggle.** The best Noom-style flows reduce shame and make the user feel seen before asking for more effort. Atlas needs that because not every user arrives as an optimizer; some arrive uncertain and defensive.

2. **It uses micro-commitments.** Noom is good at turning a big life change into a series of smaller yeses. That pattern is useful for Atlas because it keeps the flow moving without making the user feel locked into a single irreversible decision.

3. **It explains why questions matter.** General users tolerate long onboarding better when the app says why each input exists. Atlas can steal that without becoming verbose.

4. **It keeps the tone encouraging without becoming fluffy.** Noom's value is that it feels supportive, not cold. Atlas should borrow that emotional shape for the general audience while still keeping the copy concise.

### What Noom does that you shouldn't copy

1. **Do not copy the over-explained self-help voice.** Atlas should not bury the user in motivational paragraphs. Serious users will bounce if the flow starts sounding like a wellness blog.

2. **Do not copy long, abstract education before payoff.** Noom can spend more time on behavior change because that is part of the product's identity. Atlas needs to earn attention with a concrete plan faster than that.

---

## What Atlas does today (current state)

- **Layout and navigation structure:** The live route is `/onboarding`, mounted by `[src/App.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/App.jsx:376)` to `[src/pages/OnboardingV2.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/OnboardingV2.jsx:16)`. The page itself is a thin wrapper: it mounts `[OnboardingProvider](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/features/onboarding/OnboardingContext.jsx:223)` and `[OnboardingEngine](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/features/onboarding/OnboardingEngine.jsx:406)`, and it redirects authenticated users with `onboarding_completed === true` straight to `/Today`. Entry into this flow happens from `RequireAuthenticatedApp`, from `Auth.jsx` after sign-up/login, from `AuthCallback.jsx` after OAuth, and from `StoryLanding.jsx` for some unauthenticated journeys.

- **Key interactions:** The engine supports back navigation, a quiz progress bar, auto-advancing single-select and interstitial screens, multi-select chips, numeric input, body selection cards, a fake-building sequence, a projection screen, social proof, a commitment screen, a trial explainer, a paywall, and account creation. Draft answers are persisted to localStorage every 500ms in `OnboardingContext`. The paywall is real on native via RevenueCat, but on web it simply advances to account creation.

- **Visual approach:** The flow uses a full-height gradient shell, a top bar with a back button, and animated screen transitions. Most quiz screens are compact, card-based, and mobile-first, with large text and low-density controls. The visual system is polished, but the treatment changes by screen type: splash and building are branded and theatrical, while quiz steps are minimal and utility-first. That inconsistency makes the flow feel like a bundle of parts rather than one designed arc.

- **Known issues from code reading:** The `schema.js` comment says 28 screens, and the list does contain 28 entries, but not all of them are distinct in practice. `body-stats` is present in the schema at [src/features/onboarding/schema.js:87](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/features/onboarding/schema.js:87), but `ScreenRenderer` has no `body-stats` case in [src/features/onboarding/OnboardingEngine.jsx:309](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/features/onboarding/OnboardingEngine.jsx:309), so the flow falls back to `PlaceholderScreen` and the step cannot actually collect the data it requires. The schema also includes both `analysis` and `projection`, but both map to the same `ProjectionScreen`, so the user sees two identical projection states instead of two different moments. `ProjectionScreen` passes `answers.height` to `computeProjection`, while the schema calls the field `height_cm`, and the projection engine itself does not use age, sex, height, or activity at all. `AccountCreationScreen` claims the OAuth path will restore from draft and persist automatically, but there is no corresponding auth-aware effect in `OnboardingContext`. Finally, `OnboardingEngine` shows a footer continue button on `account-creation`, but `goNext` cannot advance past the last index, so that button is a no-op.

- **Gaps relative to the reference app:** Cal AI gives the user a visible reward for answering the questions; Atlas still has too many questions whose outputs are either invisible or purely theatrical. Noom does a better job of making the user feel supported at different readiness levels, while Atlas currently assumes one intensity level and one tone for everyone. The flow also lacks a clean, single emotional arc: the design oscillates between utility, fake progress, social proof, and conversion without fully connecting those modes.

---

## Patterns to steal, ranked by ROI

### 🟢 Steal immediately - high impact, low effort

1. **Make every screen visibly earn its existence.** If a question does not change a later output, remove it or make the output change obvious. That is the fastest way to make the flow feel honest to both serious and general users. Effort: 1-2 days.

2. **Turn the projection into the reward, not another form step.** The current flow already hints at this, but the projection screen should feel like the moment the app "gets" the user. Use it as a payoff for the quiz, not as another explanatory middle screen. Effort: 1 day.

3. **Keep the control density low.** The strongest screens in the current flow are the ones that ask for one choice at a time. That pattern should stay dominant because it reduces friction on mobile and keeps the mixed audience from feeling overwhelmed. Effort: 0.5-1 day.

4. **Put trust language right next to the commitment moment.** The more the app asks for account creation or trial acceptance, the more it needs to state what happens next in plain language. That is a low-cost way to reduce drop-off and improve conversion quality. Effort: 0.5 day.

### 🟡 Steal soon - medium impact, medium effort

1. **Add a real explanation line under every "why are we asking this?" question.** Noom does this well, and Atlas should use it for the body and behavior questions that feel personal. It gives general users reassurance without slowing down serious users. Effort: 1 day.

2. **Make the flow adapt to user readiness.** A user who says they have tracked before should not get the same amount of hand-holding as a first-timer. That matters because Atlas serves both power users and beginners, and the current flow does not separate those cases enough. Effort: 1-2 days.

3. **Use one consistent brand mode across splash, quiz, and conversion.** Right now the flow swings between playful, clinical, and salesy. Consolidating the emotional register will make the experience feel more premium and less assembled. Effort: 1-2 days.

4. **Show a visible end state before the account step.** The user should know they are nearly done before they are asked to sign up or pay. This is especially important for the general audience, which needs a clearer sense of progress to stay engaged. Effort: 0.5-1 day.

### 🔴 Consider carefully - high effort or audience-dependent

1. **Make the projection math truly personalized, or remove the inputs that are only there for theater.** This is the biggest product decision in the flow. If Atlas wants to ask for age, sex, height, and activity, those inputs need to change the plan; if not, the quiz should be shorter and more honest. Effort: 1-2 days plus product decision.

2. **Consolidate all onboarding/auth variants into one canonical flow.** The old `[src/pages/Onboarding.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/Onboarding.jsx:581)` and `[src/components/onboarding/SmartOnboarding.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/onboarding/SmartOnboarding.jsx:111)` paths still exist alongside V2, which fragments the story. Cleaning that up is worthwhile, but it should be done deliberately so it does not break parallel work. Effort: 2-4 days.

---

## Atlas-specific design tensions to resolve

**Tension 1 - Precision vs. speed.** Serious users want enough data to trust the result, but every additional question increases the chance that a general user drops. *Resolution:* keep the quiz short by default, and make only the questions that affect the plan mandatory. If a question does not change the output, either remove it or make it explicitly optional.

**Tension 2 - Personality vs. credibility.** The current flow wants to feel energetic and modern, but Atlas is selling a serious outcome. *Resolution:* keep the motion, but make the copy calmer and more concrete. Confidence should come from the result and the math, not from exaggerated hype.

**Tension 3 - Guidance vs. fake choice.** Several screens currently present emotional choices that do not alter the path. That can feel manipulative once users notice it. *Resolution:* either make the choice real or make it a labeled continuation. Do not keep semantic choices that are functionally identical.

**Tension 4 - Mixed audience vs. single script.** Power users want directness; general users need reassurance and explanation. *Resolution:* keep one flow, but vary the depth of the subcopy and the amount of hand-holding based on readiness signals like prior tracking experience and goal type. Do not fork the product into separate "serious" and "casual" onboarding paths.

---

## Specific changes to make (actionable list)

1. **Implement a real `body-stats` screen instead of falling back to `PlaceholderScreen`.** File(s) to touch: `src/features/onboarding/OnboardingEngine.jsx`, `src/features/onboarding/schema.js`, and a new `src/features/onboarding/screens/BodyStatsScreen.jsx`. Effort: 1-2 days. Dependency: none.

2. **Normalize the height field name across the flow.** File(s) to touch: `src/features/onboarding/schema.js`, `src/features/onboarding/OnboardingContext.jsx`, `src/features/onboarding/screens/ProjectionScreen.jsx`, `src/features/onboarding/projectionEngine.js`, and any profile save code that maps onboarding answers into profile data. Effort: 0.5-1 day. Dependency: task 1.

3. **Delete the duplicate projection branch or make `analysis` a real insight screen.** File(s) to touch: `src/features/onboarding/schema.js`, `src/features/onboarding/screens/ProjectionScreen.jsx`, `src/features/onboarding/OnboardingEngine.jsx`. Effort: 0.5-1 day. Dependency: none.

4. **Either make `computeProjection` use the collected inputs or stop asking for inputs the math ignores.** File(s) to touch: `src/features/onboarding/projectionEngine.js`, `src/features/onboarding/screens/ProjectionScreen.jsx`, `src/features/onboarding/schema.js`. Effort: 1-2 days. Dependency: task 2.

5. **Fix the OAuth completion path so Google and Apple sign-in actually finish onboarding.** File(s) to touch: `src/features/onboarding/screens/AccountCreationScreen.jsx`, `src/features/onboarding/OnboardingContext.jsx`, `src/pages/AuthCallback.jsx`, `src/pages/Auth.jsx`. Effort: 1 day. Dependency: none.

6. **Remove the no-op footer continue button on the last screen or repoint it at the real completion action.** File(s) to touch: `src/features/onboarding/OnboardingEngine.jsx`, `src/features/onboarding/screens/AccountCreationScreen.jsx`. Effort: 0.5 day. Dependency: task 5.

7. **Make the commitment step real by giving the secondary action an actual branch or renaming it to plain continuation.** File(s) to touch: `src/features/onboarding/screens/CommitmentScreen.jsx`, `src/features/onboarding/schema.js`, `src/features/onboarding/OnboardingEngine.jsx`. Effort: 0.5-1 day. Dependency: none.

8. **Make the paywall and trial explainer data-driven instead of mostly static.** File(s) to touch: `src/features/onboarding/screens/PaywallScreen.jsx`, `src/features/onboarding/screens/TrialExplainerScreen.jsx`, `src/features/onboarding/schema.js`. Effort: 1 day. Dependency: none.

9. **Add explicit resume handling for the draft when the user comes back from OAuth.** File(s) to touch: `src/features/onboarding/OnboardingContext.jsx`, `src/features/onboarding/screens/AccountCreationScreen.jsx`, `src/pages/AuthCallback.jsx`. Effort: 1 day. Dependency: task 5.

10. **Collapse or quarantine the legacy onboarding branches.** File(s) to touch: `src/App.jsx`, `src/pages/Onboarding.jsx`, `src/components/onboarding/SmartOnboarding.jsx`. Effort: 1-2 days. Dependency: none, but this should happen after the V2 fixes are stable.

11. **Add a flow test that covers the real V2 path from `/onboarding` through completion.** File(s) to touch: a new onboarding test file plus `src/App.jsx` if test setup needs route mounting. Effort: 1 day. Dependency: tasks 1, 5, and 6.

Total effort: **~7-13 days** depending on how much of the math, OAuth, and legacy cleanup the team folds into the same pass. The biggest jump in perceived quality comes from tasks **1, 3, 5, 6, and 9** because they remove the broken branches and make the flow feel intentionally finished instead of partially assembled.

---

## What NOT to do

1. Do **not** leave `body-stats` as a placeholder step that looks important but cannot collect data.
2. Do **not** keep two identical projection screens back-to-back unless they each have a distinct job.
3. Do **not** let Google or Apple sign-in fall back into onboarding without a code path that actually persists the draft and completes the flow.
4. Do **not** keep a footer continue button on the last screen if it cannot advance anywhere.
5. Do **not** ask for "personalization" inputs unless those inputs visibly affect the plan or the output.
6. Do **not** preserve the legacy onboarding routes as if they are equal alternatives to V2; that will keep the product story fragmented.

---

## The single highest-leverage thing

If the team only does one thing from this teardown, it should be to make the 28-screen flow internally honest. Right now the user is asked for data that does not always exist in the renderer, does not always affect the projection, and does not always complete the auth handoff. Fixing that mismatch would immediately improve trust, reduce dead ends, and make the rest of the visual polish feel earned instead of decorative.

**File status:** Draft 1. To be revised after implementation against reality.
