# Teardown 22 — Native paywall

**Surface:** The in-app mobile subscription gate and purchase flow, including native RevenueCat purchase, restore, and entitlement handoff. This is the onboarding paywall variant, not the public web pricing page.
**Atlas file(s):** [src/features/onboarding/screens/PaywallScreen.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/features/onboarding/screens/PaywallScreen.jsx:1), [src/features/onboarding/OnboardingEngine.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/features/onboarding/OnboardingEngine.jsx:1), [src/features/onboarding/OnboardingContext.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/features/onboarding/OnboardingContext.jsx:1), [src/components/EntitlementGate.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/EntitlementGate.jsx:1), [src/lib/SubscriptionContext.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/lib/SubscriptionContext.jsx:1), [src/lib/revenueCat.js](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/lib/revenueCat.js:1), [src/App.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/App.jsx:570), [src/pages/BillingManagement.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/BillingManagement.jsx:1), [src/pages/RestorePurchases.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/RestorePurchases.jsx:1), [supabase/functions/revenuecat-webhook/index.ts](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/supabase/functions/revenuecat-webhook/index.ts:1)
**Reference apps:** Cal AI (primary)
**Audience tension:** High — serious users want exact billing terms, a believable restore path, and no purchase ambiguity; general users want one obvious action and reassurance that the trial is not a trap.

---

## Why this screen matters

This is the moment Atlas converts product curiosity into a billing relationship on mobile. The user has already accepted the onboarding story, seen the promise, and is now deciding whether the app deserves a card-level commitment. If this surface is vague, contradictory, or easy to bypass, the revenue problem is immediate. If it is clear and trustworthy, the user can move from intent to payment without feeling manipulated.

The native paywall also has outsized retention impact because it sits at the boundary between onboarding and entitlement enforcement. A broken paywall does not just lose one sale. It creates a trust stain that follows the user into restore, billing management, and every later gate. World-class here means the contract is legible, the recovery paths are obvious, and the app behaves the same way every time the user tries to pay, restore, or come back after a reinstall.

---

## Reference app 1 — Cal AI (primary)

Cal AI is the right reference because it sells a narrow consumer promise in the exact same environment Atlas is trying to win in: a native subscription ask with a short decision window, explicit restore behavior, and a visual language built for app-store conversion. Recent screenshots on [PaywallScreens](https://www.paywallscreens.com/apps/cal-ai-food-calorie-tracker-mobile-paywall-79ca) show both the older bottom-sheet pricing treatment and a newer full-screen free-trial offer, which makes it useful as a living reference rather than a frozen mock.

### What Cal AI does that works

1. **One decision at a time.** The paywall centers a single purchase moment instead of turning the screen into a pricing explainer. The newer version leads with one big promise, one CTA, and one price note. That works because users do not need to assemble the business model themselves before they can decide.

2. **Restore is visible.** Cal AI keeps Restore in the top-right corner on the newer full-screen treatment, and it is still present as a familiar recovery path on the older bottom sheet. That matters because users who already paid need a fast way to self-rescue without hunting through settings or support.

3. **Concrete trial framing.** The paywall states the trial outcome directly, then tells the user exactly when money starts. In the older variant, the annual price and monthly equivalent are both visible; in the newer one, the $0 trial is explicit. That combination lowers uncertainty because the user is not left translating marketing language into billing math.

4. **Price hierarchy is obvious.** The older variant shows monthly and yearly side by side, with the yearly plan visually emphasized and a savings badge attached. This is useful because it lets the app steer toward the best LTV option without forcing a read-through of a full comparison table.

5. **No chrome noise.** The screen uses little or no extra navigation, no dense footer, and no competing controls. That keeps the user anchored on the conversion decision. In a subscription flow, anything that looks like browsing dilutes the sense that this is the moment of commitment.

6. **Product proof stays adjacent.** Cal AI pairs the ask with a visual of the product in action or social proof in the background. That works because the user sees why they are paying in the same frame as the ask. The sale feels like access to capability, not a toll booth.

7. **The sheet feels native to the app.** Even when the structure is ad-like, the controls still read like an iOS purchase surface rather than a web checkout page. That matters because the user is already in mobile mode and expects native trust cues, not browser checkout semantics.

### What Cal AI does that you shouldn't copy

1. **Aggressive ad voice.** Cal AI can lean into hype because its brand is built around a viral consumer promise. Atlas should not copy that tone. Atlas is broader and more systems-oriented, so the paywall needs to feel exact, not shouty.

2. **Single-problem framing.** Cal AI sells one core job-to-be-done. Atlas does not. If Atlas makes the paywall sound like the entire product is just one trick, the app will undercut its own operating-system positioning.

3. **Visual proof overload.** Cal AI can use big product imagery and creator-style proof because that is part of its marketing language. Atlas should be more restrained. Too much visual persuasion on a premium workflow reads as compensation for unclear billing terms.

---

## What Atlas does today (current state)

- **Layout and navigation structure:** The native paywall lives inside the onboarding flow as the `paywall` step in [OnboardingEngine](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/features/onboarding/OnboardingEngine.jsx:366), immediately after `trial-explainer`. The screen itself is a centered, single-column mobile layout with three plan cards, a primary CTA, a restore button, small trust text, and terms links in [PaywallScreen](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/features/onboarding/screens/PaywallScreen.jsx:1). There is no local close button or skip link, but the onboarding engine still shows its global back button above the screen, so the only way out is to go backward in onboarding rather than dismiss the paywall itself. After that step, [EntitlementGate](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/EntitlementGate.jsx:1) hard-redirects users without a Pro entitlement to `/pricing` or `/onboarding`, so the paywall is only one half of the conversion contract.
- **Key interactions:** On native, the screen fetches RevenueCat offerings, maps them to weekly/monthly/annual cards, persists the selected package and billing cycle into onboarding state, and purchases the chosen package on `Start 3-day free trial`. Restore is handled inline with `restorePurchases()`, and a successful restore advances the flow. After purchase, [SubscriptionContext](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/lib/SubscriptionContext.jsx:1) and [revenuecat-webhook](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/supabase/functions/revenuecat-webhook/index.ts:1) are what actually make access stick: the client trusts RevenueCat on native, then backfills the `subscriptions` row as the webhook lands. On web, the same screen simply calls `goNext()` and leaves payment to the later web checkout path, which is another reason this surface must be read separately from `src/pages/Pricing.jsx`.
- **Visual approach:** The design is light, compact, and mobile-first rather than theatrical. It uses rounded plan cards, a brand-colored CTA, small neutral disclosure text, and a minimal trust row. Compared with Cal AI, Atlas is less ad-like and more utility-like. That is good for credibility, but it also makes the conversion moment feel more like a settings step than a purchase.
- **Known issues from code reading:** The biggest bug is that native continue falls through to `goNext()` whenever `packages?.[selected]` is missing, so an offerings fetch failure or identifier mismatch can let the user advance without actually purchasing. The onboarding engine also renders its generic bottom `Continue` button on this step because `paywall` is not in `HIDE_CONTINUE_TYPES`, which creates a second path that does not purchase at all. In `src/lib/revenueCat.js`, `presentPaywall()` and the `showPaywall()` context method exist but are unused, and `RC_API_KEY_ANDROID` is still a placeholder. Those are all trust and revenue risks, not just code tidy-up issues.
- **Gaps relative to Cal AI:** Atlas has restore, disclosure, and trial language, but it spreads them across more chrome and more states than Cal AI does. There is no equivalent of Cal AI's top-right restore placement, and the presence of an extra engine-level continue button weakens the sense that the paywall is the single commit point. Atlas also has billing copy drift elsewhere in the codebase - for example, `src/pages/TrialExplanation.jsx` and `src/pages/TrialStart.jsx` still describe different trial lengths and post-trial prices - which makes the native promise harder to trust if users encounter those routes later.

---

## Patterns to steal, ranked by ROI

### 🟢 Steal immediately - high impact, low effort

1. **Make restore unmistakable.** Move restore closer to the primary decision, or label it more explicitly as "Already subscribed? Restore purchases." Atlas already has restore, but it is too easy to overlook because it sits under the main CTA and small-print trust row. Effort: 4-6 hours.

2. **Remove the duplicate continue path.** The onboarding engine should not render its generic bottom continue button on the paywall step. Right now the screen has one purchase CTA and the engine adds a second, non-purchase continue action below it. That is a conversion leak and a trust leak. Effort: 2-4 hours.

3. **Show a purchase-sync state.** After a successful native purchase, show a short "activating your subscription" state until RevenueCat and the backend entitlement row agree. Atlas already polls with backoff in `SubscriptionContext`, but the user should see that work instead of jumping blindly to the next step. Effort: 1 day.

4. **Fail visibly when offerings are missing.** If RevenueCat offerings do not load or the selected package is missing, block purchase and show retry instead of silently advancing. This is the most serious native bug in the current code because it can let users bypass payment when the product data is wrong. Effort: 1 day.

### 🟡 Steal soon - medium impact, medium effort

1. **Collapse the decision to one favored path.** Keep the other plans available, but make one plan visually dominant and explain why it is the default. Cal AI does this by making the user feel there is a clear best choice, not three equal options. Atlas's current equal-weight card stack makes the user do more work than necessary. Effort: 1-2 days.

2. **Replace scattered trust copy with a fact block.** Put trial length, first charge timing, cancellation, and restore into one compact block near the CTA instead of splitting them across a row, a disclosure line, and terms links. That would reduce reading friction while making the billing contract easier to verify at a glance. Effort: 4-8 hours.

3. **Unify trial language across all billing screens.** Make the native paywall, onboarding trial explainer, and legacy trial pages say the same thing about trial length and post-trial price. Trust falls apart fast when one screen says 3 days, another says 14 days, and a third uses different pricing language. Effort: 1 day.

### 🔴 Consider carefully - high effort or audience-dependent

1. **Adopt the RevenueCat native paywall sheet.** The library already has `presentPaywall()`, but Atlas is not using it. Switching would reduce custom UI maintenance and might increase platform familiarity, but it would also surrender message control and make the current onboarding story less bespoke. Effort: 2-3 days plus product decision.

2. **Default the native flow to annual.** For some users, annual is the right monetization move. For Atlas's mixed audience, though, that is a product bet, not just a UI change. Serious users may appreciate the savings; general users may interpret it as pushy if the default is too aggressive. Effort: 1-2 days plus pricing decision.

---

## Atlas-specific design tensions to resolve

**Tension 1 - Hard gate vs. graceful recovery.** Atlas wants the paywall to be non-negotiable, which is correct for revenue, but native users also need obvious recovery when they already paid or when the store sync is delayed. If the screen feels like a dead end, users blame the product rather than the store. *Resolution:* keep the hard gate, but make restore and sync states first-class. Do not add a dismiss button; instead, give the user one clear purchase path, one clear restore path, and one explicit waiting state when entitlement is still propagating.

**Tension 2 - Simple purchase vs. plan flexibility.** Serious users want to compare price cadence and savings, while general users want the app to just tell them what to do. Three equal cards satisfy neither group perfectly. *Resolution:* keep all plan options available, but make one plan the visual default and collapse secondary detail behind a smaller disclosure row. The native paywall should feel like a decision, not a catalog.

**Tension 3 - Native trust vs. cross-platform consistency.** Atlas uses RevenueCat on native and Stripe on web, which is fine technically but dangerous narratively if the wording drifts. A user should not have to relearn the billing promise when they switch devices. *Resolution:* define one canonical subscription promise in the product copy, then adapt only the payment rail and legal footer per platform. The trial length, billing start, and cancellation story should read the same everywhere.

**Tension 4 - Utility screen vs. premium moment.** The current native paywall reads clean and efficient, but it is so restrained that it risks feeling like a settings panel. Cal AI proves that a mobile paywall can be decisive without being cluttered. *Resolution:* add one stronger hero line, one stronger decision cue, and a clearer restore affordance. Make it feel intentional and premium without turning it into a sales page.

---

## Specific changes to make (actionable list)

1. **Remove the engine-level continue button from the paywall step.** Touch [src/features/onboarding/OnboardingEngine.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/features/onboarding/OnboardingEngine.jsx:499) and [src/features/onboarding/screens/PaywallScreen.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/features/onboarding/screens/PaywallScreen.jsx:1). Effort: 2-4 hours. Dependency: none.

2. **Block native advancement when RevenueCat offerings are unavailable or incomplete.** Touch [src/features/onboarding/screens/PaywallScreen.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/features/onboarding/screens/PaywallScreen.jsx:1) and [src/lib/revenueCat.js](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/lib/revenueCat.js:1). Effort: 4-8 hours. Dependency: none.

3. **Add a post-purchase syncing state before the paywall advances.** Touch [src/features/onboarding/screens/PaywallScreen.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/features/onboarding/screens/PaywallScreen.jsx:1), [src/lib/SubscriptionContext.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/lib/SubscriptionContext.jsx:1), and [src/App.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/App.jsx:570). Effort: 1 day. Dependency: 2.

4. **Make restore more discoverable and more self-explanatory.** Touch [src/features/onboarding/screens/PaywallScreen.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/features/onboarding/screens/PaywallScreen.jsx:1) and [src/pages/RestorePurchases.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/RestorePurchases.jsx:1). Effort: 4-6 hours. Dependency: none.

5. **Unify the billing promise across the native paywall and adjacent trial screens.** Touch [src/features/onboarding/screens/PaywallScreen.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/features/onboarding/screens/PaywallScreen.jsx:1), [src/features/onboarding/schema.js](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/features/onboarding/schema.js:420), [src/pages/TrialExplanation.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/TrialExplanation.jsx:1), [src/pages/TrialStart.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/TrialStart.jsx:1), and any translation strings that still describe different durations. Effort: 1 day. Dependency: none.

6. **Replace the loose trust row with a compact billing fact block.** Touch [src/features/onboarding/screens/PaywallScreen.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/features/onboarding/screens/PaywallScreen.jsx:1) and the relevant i18n entries. Effort: 4-8 hours. Dependency: 5.

7. **Make one plan visually dominant instead of presenting three equal cards.** Touch [src/features/onboarding/screens/PaywallScreen.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/features/onboarding/screens/PaywallScreen.jsx:1). Effort: 1-2 days. Dependency: none.

8. **Fix the Android RevenueCat key and verify native offering fetch on a real Android build.** Touch [src/lib/revenueCat.js](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/lib/revenueCat.js:1) and any native config needed to ship the correct key. Effort: 2-4 hours. Dependency: none.

9. **Either wire the RevenueCat native paywall helper or delete the dead code.** Touch [src/lib/revenueCat.js](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/lib/revenueCat.js:1), [src/lib/SubscriptionContext.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/lib/SubscriptionContext.jsx:1), and [src/App.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/App.jsx:570). Effort: 1-2 days. Dependency: none.

10. **Make native billing management easy to find after the paywall.** Touch [src/pages/BillingManagement.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/BillingManagement.jsx:1), [src/pages/Account.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/Account.jsx:324), and [src/pages/Settings.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/pages/Settings.jsx:1). Effort: 4-6 hours. Dependency: none.

Total effort: about 5-7 days. The biggest jumps in perceived quality come from removing the duplicate continue path, blocking silent advancement on offerings failure, adding an explicit purchase-sync state, and making restore obviously available.

---

## What NOT to do

1. Do **not** add a dismiss or "maybe later" escape hatch to the native paywall itself. That weakens the revenue model without fixing the trust problem.
2. Do **not** let native onboarding advance when offerings fail to load. Silent bypass is worse than an explicit error because it creates fake completion.
3. Do **not** copy the web pricing page layout onto mobile. A native paywall should make one decision, not ask users to read a public pricing brochure.
4. Do **not** bury restore under tiny copy only. If a user already paid, recovery should be visible and obvious.
5. Do **not** keep conflicting trial lengths or post-trial prices in adjacent billing screens. That makes the whole subscription contract feel unreliable.
6. Do **not** use the system paywall sheet just because it exists. Use it only if the team wants RevenueCat to own the presentation and trade away custom control.

---

## The single highest-leverage thing

Make the native paywall a single, trustworthy, purchase-only step with no duplicate continue path and no silent fallback around missing offerings. Right now the biggest risk is not visual polish. It is that the screen can advance without actually purchasing, while the onboarding engine still gives the user a second non-purchase continue button. Fixing that turns the paywall back into a real commitment point, which is the only reason this surface exists.

---

**File status:** Draft 1. To be revised after implementation against reality.
