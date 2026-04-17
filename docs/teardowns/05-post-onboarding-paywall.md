# Teardown 05 — Post-onboarding Paywall

**Surface:** The conversion point that follows onboarding and decides whether a user gets into the paid product on native or stays on the public web pricing path.
**Atlas file(s):** `src/App.jsx`, `src/components/EntitlementGate.jsx`, `src/components/routing/WebOnlyRoute.jsx`, `src/features/onboarding/screens/TrialExplainerScreen.jsx`, `src/features/onboarding/screens/PaywallScreen.jsx`, `src/lib/revenueCat.js`, `src/pages/Pricing.jsx`, `src/pages/UpgradePrompts.jsx`
**Reference apps:** Cal AI (primary), Fastic (secondary)
**Audience tension:** High — serious users want exact terms, plan differences, and a clean billing path; general users want reassurance, proof, and a low-friction promise that does not feel like a trap.

---

## Why this screen matters

This is the moment Atlas turns onboarding effort into revenue. Users have already answered questions, seen the product promise, and invested enough time to care. If the paywall feels confusing, contradictory, or like a dead end, Atlas loses the highest-intent user in the funnel right after it has already earned some trust.

The surface matters more than a generic pricing page because it sits at the seam between identity and payment. A broken paywall does not just reduce conversion. It creates a trust scar: users have to decide whether Atlas is honest about trial length, platform differences, cancellation, and access. If that answer is unclear, the product starts looking like a bait-and-switch rather than a serious coaching app.

World-class here means one consistent promise, one obvious next step, and no route loops. The user should understand what is free, what starts today, what renews later, and how to leave without digging through support pages. The right experience reduces friction without hiding terms. The wrong one makes Atlas feel smaller, less credible, and less worth paying for.

---

## Reference app 1 — Cal AI (primary)

Cal AI is a strong primary reference because it sells a consumer fitness habit product with a very short time-to-value. That is only a partial match to Atlas - Atlas also has more serious, data-dense users - but the conversion mechanics are relevant because Cal AI asks for commitment at a moment when the user already understands the core promise.

### What Cal AI does that works

**1. Single dominant ask.** Cal AI keeps the offer simple: start the free trial, enter the email, move on. There is no sprawling pricing matrix in front of the user at the decision point. That works because the user is not being asked to compare ten product states; they are being asked to accept one clear next step.

**2. Value-first headline.** The public trial ask is tied to the core job-to-be-done: track calories with a photo, scan, or description. The paywall does not float in abstract wellness language. It reminds the user why they came in the first place, which makes the upgrade feel like access to capability rather than a fee for permission.

**3. Trial promise up front.** The offer is framed as a 3-day free trial with a cancellation promise right beside the CTA. That is effective because the user gets the contract summary before they make the click, not after a surprise checkout step.

**4. Social proof near the ask.** Cal AI leans hard on rating, user count, and influencer quotes. That reduces uncertainty right when the user is deciding whether the product is legit. For a consumer app, this is doing trust work that a feature list alone cannot do.

**5. Product screenshots as proof.** The trial and landing surfaces show the actual app UI, not abstract marketing graphics. That makes the offer feel real and lowers the cognitive gap between promise and product.

**6. Lightweight capture.** The public funnel uses a single email input and one CTA rather than a multi-step form. That reduces friction for users who are still deciding and keeps the offer feeling immediate.

**7. Clear cancellation language.** The public copy answers the most common objection inline: no commitment, cancel anytime. That is simple, but it matters because it removes the need to hunt for reassurance.

### What Cal AI does that you shouldn't copy

**1. Influencer-heavy proof.** Cal AI can lean on social-creator credibility because that is part of its brand. Atlas should not fake that layer unless it actually has it. A paywall stuffed with influencer praise will feel noisy and inauthentic if the product is trying to speak to serious users.

**2. Hyper-compressed framing.** Cal AI can compress the offer into a very small consumer pitch. Atlas has more complex value - training, nutrition, body tracking, AI coaching - and needs enough detail for the serious segment to trust the purchase.

**3. Hype over precision.** Cal AI can afford a more aggressive ad-style tone. Atlas should stay more exact about what the user gets and when billing starts, because trust is part of the brand promise.

---

## Reference app 2 — Fastic (secondary)

Fastic is useful because it adds lifecycle trust patterns that Cal AI does not emphasize as strongly. It is a mainstream health app with explicit trial, cancellation, and discount language, which makes it a better reference for the "can I trust this subscription?" layer of the experience.

### What Fastic does that works

**1. Explicit trial terms.** Fastic spells out that the trial is time-limited and what happens if the user does not cancel. That helps because the user can verify the promise without guessing.

**2. Risk-free guarantee language.** The guarantee page makes the subscription feel reversible and bounded. That is valuable on a paywall because the user is not just buying access - they are buying the confidence that they can back out if the product is not a fit.

**3. Cancellation clarity.** Fastic explains where cancellation happens and when renewal kicks in. That is not glamorous, but it removes fear and reduces support friction later.

**4. Separate promo pathways.** Discount and redeem-code flows exist, but they are not mixed into the core promise. That keeps the primary subscription decision clean while still leaving room for special cases.

**5. Web and app terms are differentiated.** Fastic is explicit that website purchases, in-app purchases, and payment behavior can differ by channel. That separation is useful for Atlas because the native and web flows are also not the same.

### What Fastic does that you shouldn't copy

**1. Legal-heavy presentation.** Fastic can get away with a lot of contract language because it is also operating as a terms-and-funnel machine. Atlas should not make the paywall feel like a compliance document.

**2. Discount sprawl.** Once discounts and redemption become a visible part of the main flow, users start waiting for a better deal. That hurts perceived fairness and can lower conversion quality.

---

## What Atlas does today (current state)

- **Native / in-app behavior:** The active native paywall lives in `src/features/onboarding/screens/PaywallScreen.jsx` and is reached from `TrialExplainerScreen` through `OnboardingEngine`. The screen is a centered, single-column mobile layout with three stacked plan cards, one primary CTA, a restore purchases button, and a short disclosure line. It fetches RevenueCat offerings only on native platforms, stores the selected plan and billing cycle in onboarding state, and only purchases the selected package on native. There is no dismiss button, no skip link, and no in-screen back exit.
- **Native entitlement gating:** `src/components/EntitlementGate.jsx` hard-redirects authenticated users without an active Pro entitlement to `/pricing`, and unauthenticated pre-onboarding users to `/onboarding`. The gate itself is clean and strict, but it only works if the downstream pricing path is real on the current platform.
- **Web pricing behavior:** `src/pages/Pricing.jsx` is the web subscription surface. It renders inside `PublicSiteShell`, starts with region detection and a monthly/yearly toggle, then shows a comparison table, three athlete plan cards, creator-code handling, and a professional waitlist CTA. Anonymous users who choose a paid plan are pushed to auth first, then to Supabase `create-checkout`, and then out to Stripe. This is not a modal paywall; it is a public pricing page with a checkout branch.
- **Native web-route fallback:** `src/components/routing/WebOnlyRoute.jsx` sends native users away from `/Pricing` to `/upgrade`, and `src/pages/UpgradePrompts.jsx` renders a generic upgrade modal with a close button, a "Maybe later" button, and a CTA that navigates back to `/pricing`. On native, that loop sends users right back into the web-only redirect, so the fallback does not currently lead to checkout.
- **Adjacent upgrade surfaces:** `src/components/entitlements/PaywallTrigger.jsx` and `src/components/shared/TrialBanner.jsx` also route users into `/Pricing`, so any dead-end in the pricing path affects upgrade prompts outside onboarding too.
- **Visual approach:** Native paywall is compact, mobile-first, and low-chrome. It uses rounded cards, a single brand CTA, small trust text, and a simple progress-free layout. Web pricing is much denser: larger sections, a feature comparison table, billing controls, and multiple secondary conversion objects. The native surface feels transactional; the web surface feels editorial and public-facing.
- **Known issues from code reading:** The current implementation has a hard trial-duration mismatch. `TrialExplainerScreen` and `Pricing.jsx` are framed around a 7-day free trial, while `PaywallScreen.jsx` says 3 days free and the CTA says "Start 3-day free trial." `src/lib/revenueCat.js` also contains an Android API key placeholder, and its `presentPaywall()` helper is unused. In `Pricing.jsx`, the yearly toggle shows a hard-coded "Save 31%" badge even though savings vary by region and plan. The pricing page also forces an auth step before paid checkout for anonymous users, which adds one extra barrier at the highest-intent point.
- **Gaps relative to the reference app:** Atlas does not yet have one clean, consistent trial story across channels. It also lacks a simple guarantee/cancellation block near the primary CTA, and the native fallback path currently loops instead of taking the user to a true purchase screen.

---

## Patterns to steal, ranked by ROI

### 🟢 Steal immediately — high impact, low effort

**1. One trial story everywhere.** Unify the trial length, renewal timing, and cancellation language across native onboarding, web pricing, and any fallback modal. Right now the code says 7 days in some places and 3 days in others, which is the fastest way to damage trust at checkout. This is mostly copy and config work, but it matters more than any visual polish. **Effort: 4-6 hours.**

**2. Replace the native loop with a real native entry.** Native users should never land on a web-only pricing page that redirects back to a modal that sends them back to the same page. If the product wants a native upgrade path, it should be one actual checkout surface, not a redirect loop. **Effort: 1 day.**

**3. Remove the hard-coded savings badge.** The "Save 31%" chip in the web billing toggle is static and will drift from reality. Derive the badge from the active region pricing data or remove it until it can be correct per locale. Small trust fixes like this matter because pricing is one of the few places users actively check the math. **Effort: 2-3 hours.**

**4. Collapse the first web view.** Keep one default plan visually dominant and push the comparison table lower or behind a secondary reveal. Atlas can still serve serious users with the full matrix, but the first screen should ask for one decision, not three. That reduces choice fatigue without deleting information. **Effort: 1-2 days.**

**5. Add a compact trust row beside the CTA.** Cal AI and Fastic both win by answering the obvious questions in the moment: what starts today, what bills later, and how to cancel. Atlas should do the same on both native and web so users do not have to infer the contract. **Effort: 4-8 hours.**

### 🟡 Steal soon — medium impact, medium effort

**6. Make the auth step feel like continuation, not interruption.** For anonymous web users, preserve the selected plan, surface the next step clearly, and keep the plan choice visible after sign-up. The current path sends users to auth first and relies on session storage to pick up the plan later; that works, but it is not especially reassuring. **Effort: 1 day.**

**7. Separate primary conversion from promo clutter.** Move creator-code entry, professional waitlist language, and other secondary business paths out of the main pricing decision. Those elements are valid, but they should not compete with the upgrade ask itself. **Effort: 4-6 hours.**

**8. Make restore purchases more legible on native.** The restore button exists, but it is visually buried under a lot of small-print trust copy. Give it a clearer "Already subscribed? Restore purchases" treatment so users know what it is for and when to use it. **Effort: 4-6 hours.**

### 🔴 Consider carefully — high effort or audience-dependent

**9. Introduce a single RevenueCat-managed native paywall UI.** `src/lib/revenueCat.js` already has a `presentPaywall()` helper, but the app does not use it. Wiring a native system sheet could make the checkout path cleaner, but it is a product decision because it changes how much control Atlas keeps over the message, layout, and analytics. **Effort: 2-3 days.**

**10. Add a guarantee or refund explanation to the core paywall.** Fastic's guarantee pattern lowers fear, but Atlas should only add something similar if the business is ready to support it consistently. This is not just a UI decision; it is a promise the company has to be willing to honor. **Effort: 1-2 days plus policy sign-off.**

---

## Atlas-specific design tensions to resolve

**Tension 1 — Hard gate vs. perceived fairness.**
Atlas uses a hard entitlement gate, which is fine for revenue, but hard gates are only tolerated when the promise feels consistent and honest. If the user sees different trial lengths or a route loop, the gate reads as coercive instead of premium. *Resolution:* keep the hard gate, but make the contract obvious before the click and identical across native and web. Do not soften the gate with dismiss controls; fix the clarity instead.

**Tension 2 — Serious optimizer vs. general consumer.**
The serious segment wants exact billing, exact plan differences, and visible tradeoffs. The general segment wants one obvious choice and a lot less reading. *Resolution:* make the native paywall short and decisive, then let the web pricing page carry the richer comparison content as a secondary layer. Atlas should not force both audiences through the same dense first screen.

**Tension 3 — Native parity vs. web flexibility.**
Atlas currently has a native onboarding paywall, a web pricing page, and a native fallback modal that do not agree with each other. That is not a styling problem; it is a contract problem. *Resolution:* choose one canonical trial promise and one canonical upgrade path, then adapt only the payment rails per platform. The words should be the same even if the processors are not.

**Tension 4 — Trust language vs. conversion urgency.**
The paywall needs proof, but it also needs focus. Too much extra business logic, promo handling, and secondary CTA noise turns the surface into a marketplace instead of a decision point. *Resolution:* keep only one primary CTA, one concise trust block, and one secondary recovery path. Everything else should move below the fold or out of the flow entirely.

---

## Specific changes to make (actionable list)

1. **Unify the trial duration and renewal language across native paywall, trial explainer, web pricing, and translation files.** Files: `src/features/onboarding/screens/TrialExplainerScreen.jsx`, `src/features/onboarding/screens/PaywallScreen.jsx`, `src/pages/Pricing.jsx`, `src/lib/revenueCat.js`, `src/i18n/messages/en-onboarding.json`, `src/i18n/messages/en.json`. Effort: 4-6 hours. Dependency: none.

2. **Replace the native `/upgrade` loop with a real native upgrade path or remove the fallback redirect entirely.** Files: `src/App.jsx`, `src/components/routing/WebOnlyRoute.jsx`, `src/pages/UpgradePrompts.jsx`. Effort: 1 day. Dependency: item 1.

3. **Wire the native RevenueCat paywall helper or delete it if the app will keep the custom onboarding paywall.** Files: `src/lib/revenueCat.js`, `src/features/onboarding/screens/PaywallScreen.jsx`, `src/App.jsx`. Effort: 2-3 days. Dependency: item 2.

4. **Replace the Android RevenueCat API key placeholder and verify purchase/restore behavior on Android.** Files: `src/lib/revenueCat.js`. Effort: 2-4 hours. Dependency: none.

5. **Derive the yearly savings badge from active pricing data instead of hard-coding `Save 31%`.** Files: `src/pages/Pricing.jsx`. Effort: 2-3 hours. Dependency: none.

6. **Simplify the first pricing viewport so one plan is clearly the default and the comparison table reads as secondary detail.** Files: `src/pages/Pricing.jsx`, `src/components/pricing/RegionSelector.jsx` if needed for layout spacing. Effort: 1-2 days. Dependency: item 5.

7. **Add a short trust block beside the primary CTA that states trial length, billing start, cancellation, and restore behavior in one place.** Files: `src/features/onboarding/screens/PaywallScreen.jsx`, `src/pages/Pricing.jsx`, `src/i18n/messages/en-onboarding.json`, `src/i18n/messages/en.json`. Effort: 1 day. Dependency: item 1.

8. **Preserve the selected plan and step more transparently through auth for anonymous web users.** Files: `src/pages/Pricing.jsx`, `src/pages/Auth.jsx` if a copy or handoff state is added. Effort: 1 day. Dependency: none.

9. **Move creator-code and professional waitlist elements away from the main conversion block.** Files: `src/pages/Pricing.jsx`, `src/components/affiliate/CreatorCodeModal.jsx` if the trigger copy changes. Effort: 4-6 hours. Dependency: item 6.

10. **Make native restore purchases more discoverable with a clearer label and spacing treatment.** Files: `src/features/onboarding/screens/PaywallScreen.jsx`. Effort: 4-6 hours. Dependency: item 7.

Total effort: about 5-7 days, depending on whether the team keeps the custom native paywall or swaps to the RevenueCat sheet.

Biggest perceived-quality jumps come from items 1, 2, 6, 7, and 8. Those changes remove the trust mismatch, eliminate the native loop, and make the user understand the offer faster.

---

## What NOT to do

1. Do **not** keep two different trial promises in different parts of the funnel. That reads as a mistake at best and a bait-and-switch at worst.
2. Do **not** turn the pricing page into a giant feature spreadsheet on mobile. Serious users want detail, but they still need one dominant action.
3. Do **not** add a dismiss or "maybe later" escape hatch to the hard entitlement gate. That weakens the revenue model without fixing the trust problem.
4. Do **not** copy Cal AI's hype language or Fastic's promo-code density into Atlas's primary conversion path. Atlas should feel clearer, not louder.
5. Do **not** leave the native fallback route looping back to the web pricing page. A paywall that cannot actually complete is worse than no paywall at all.

---

## The single highest-leverage thing

If the team only does one thing, make the paywall promise consistent and real across channels: one trial length, one cancellation story, and one native/web path that actually completes checkout. Right now the biggest conversion risk is not a lack of color or polish. It is the fact that the user can see different billing promises in different places and, on native, can get routed into a loop instead of a purchase. Fixing that removes the trust tax that sits on top of every other upgrade decision.

**File status:** Draft 1. To be revised after implementation against reality.
