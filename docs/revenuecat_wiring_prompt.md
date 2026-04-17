# Claude Code Prompt — Wire Atlas Core Paywall via RevenueCat

Paste the block below to Claude Code (or equivalent) at the root of the `atlas.core-official` repo. Prerequisites:

1. App Store Connect: `atlas_pro_weekly`, `atlas_pro_monthly`, `atlas_pro_annual` products created with 3-day free trial intro offers, propagated (~4–24h).
2. Google Play Console: subscription `atlas_pro` with base plans `weekly`, `monthly`, `annual` + free-trial-3d offer on each, all active.
3. RevenueCat account with an existing project for Atlas Core (there's already a `revenuecat-webhook/index.ts` in the repo — so RevenueCat is partially wired).
4. Apple and Google API keys added to RevenueCat project (Project Settings → App → iOS/Google configuration).

---

## Prompt

```
You are working in the atlas.core-official repo (React + Capacitor + Base44 + Supabase). Your
job is to wire up a hard-gate paywall using RevenueCat with the Atlas Core pricing I've set up
in both stores.

CONTEXT
- Existing: src/pages/Pricing.jsx, src/pages/SubscriptionTier.jsx, src/pages/TrialStart.jsx,
  src/pages/TrialExplanation.jsx, supabase/functions/revenuecat-webhook/index.ts
- The RevenueCat project and webhook already exist. Apple/Google API keys are already
  configured in the RevenueCat dashboard.
- I have three subscription products propagated in both stores:
    iOS:     atlas_pro_weekly, atlas_pro_monthly, atlas_pro_annual
    Android: atlas_pro:weekly, atlas_pro:monthly, atlas_pro:annual
  Each has a 3-day free trial intro offer attached.

TASK 1 — RevenueCat dashboard config (I'll do this manually, but tell me exactly what to do)

Produce a step-by-step checklist for creating a RevenueCat Offering called `default` with
three packages mapped to the six store products above using the standard RevenueCat
package identifiers $rc_weekly, $rc_monthly, $rc_annual. Include:
- Which entitlement to attach (use `pro` — single entitlement gates all premium access)
- Which products to link to each package
- How to mark the Offering as Current
- How to verify it's live via the RevenueCat "Charts" or "Customers" tab

TASK 2 — Install and initialize the RevenueCat SDK

- Add the RevenueCat Capacitor plugin (cordova-plugin-purchases is what RevenueCat uses
  for Capacitor). Use the latest version compatible with this Capacitor version (check
  capacitor.config.json and package.json).
- Create src/services/revenueCatService.js that:
    - Exposes initializeRevenueCat(userId) — call on app boot after Supabase auth resolves
    - Exposes fetchOfferings() — returns the current Offering's packages
    - Exposes purchasePackage(package) — wraps Purchases.purchasePackage with error handling
    - Exposes restorePurchases() — wraps Purchases.restorePurchases
    - Exposes checkEntitlement() — returns { hasActivePro: boolean, expirationDate, willRenew }
    - Uses Capacitor.getPlatform() to branch between iOS and Android API keys
    - Logs anonymized events to console in dev, silent in prod
- Wire initializeRevenueCat() in src/App.jsx right after the Supabase user loads.

TASK 3 — Rebuild the paywall screen (src/pages/Pricing.jsx)

Match the mockup in docs/AtlasCore_Onboarding_Mockups.html (screen 26). Key requirements:
- Fetch offerings on mount via revenueCatService.fetchOfferings()
- Render three tier cards (Weekly / Monthly / Annual) with weekly pre-selected
- Weekly card shows "MOST POPULAR" badge; Annual shows "SAVE 80%" badge (dynamically
  computed from actual prices, not hardcoded)
- Single CTA: "Start 3-day free trial" — calls purchasePackage on the selected package
- Apple-compliant disclosure line below CTA: "3 days free, then $X/week. Subscription
  auto-renews unless canceled 24h before the current period ends."
- Restore / Terms / Privacy small links at the bottom
- On successful purchase, write entitlement state to Supabase `profiles.profile_data.pro_entitlement`
  (so route guards don't need a network call on every screen change) and navigate to /today
- On error: show a toast with the actual error message, stay on paywall

TASK 4 — Hard-gate route guard

- Create src/hooks/useEntitlement.js that reads profile_data.pro_entitlement + falls back
  to Purchases.getCustomerInfo() if not cached
- Create src/components/EntitlementGate.jsx that wraps protected routes
- In src/App.jsx routing, wrap TodayV2, TrainV2, Nutrition, Body, MyDiet, MyWorkout,
  Insights, Progress, Achievements, Leaderboard with EntitlementGate
- When EntitlementGate sees no active entitlement AND onboarding is complete, redirect to
  /pricing. No dismiss, no "maybe later"
- Auth screens, Landing, TermsPrivacy, HelpCenter, ContactSupport stay accessible

TASK 5 — Grandfather existing users

- Write a one-shot Supabase migration that sets profile_data.pro_entitlement.grandfathered =
  true and profile_data.pro_entitlement.tier = 'legacy_free' for every user with a
  created_at before today. Include the current UTC date in the migration name.
- Modify useEntitlement.js: if grandfathered === true, hasActivePro returns true always
  (the route guard lets them through forever without a subscription)
- Do NOT prompt grandfathered users at all. They stay on the old experience.

TASK 6 — Update the webhook handler

- Open supabase/functions/revenuecat-webhook/index.ts
- Ensure it handles INITIAL_PURCHASE, RENEWAL, CANCELLATION, EXPIRATION, BILLING_ISSUE,
  PRODUCT_CHANGE events by updating profile_data.pro_entitlement on the matching user
  (match by app_user_id, which should equal the Supabase auth.users.id)
- Log any unknown event types but don't throw — RevenueCat retries on 5xx

TASK 7 — Instrumentation

Add analytics events (wherever the existing analytics lib is — check src/lib for it) for:
- paywall_viewed
- paywall_tier_selected (with package id)
- trial_started (with package id)
- trial_converted
- trial_cancelled
- subscription_renewed

TASK 8 — Verify

- Run the app locally against a TestFlight build or Android Internal test. Confirm:
  1. Paywall loads and shows the three tiers with live prices from the stores
  2. Tapping "Start 3-day free trial" opens the native purchase sheet
  3. Sandbox purchase completes, entitlement flips to active, user is routed to /today
  4. Restore Purchases on a fresh install correctly restores entitlement
  5. A user signed in on both iOS and Android sees the same entitlement state
  6. Grandfathered users never see the paywall

DO NOT

- Do not hardcode prices anywhere in the UI — always read from the offering
- Do not cache offerings aggressively; refresh on paywall view
- Do not add a "skip" or "close" button to the paywall for non-grandfathered users
- Do not send any cancellation-prevention emails (user explicitly does not want these)
- Do not add a second paywall for upsells until the single-tier version is shipping and
  instrumented

When you're done, summarize exactly what changed, where, and what I need to test manually.
```

---

## After Claude Code finishes

Manual test checklist before you ship:

- [ ] TestFlight build: paywall renders, real prices show, purchase completes in sandbox
- [ ] Android Internal test: same three checks as above
- [ ] Grandfathered test: log in with an existing account, confirm you never hit the paywall
- [ ] Fresh account on iOS: complete onboarding, hit paywall, card sheet appears, sandbox buy
- [ ] Fresh account on Android: same
- [ ] Webhook: force a test event from the RevenueCat dashboard, confirm profile_data.pro_entitlement updates in Supabase
- [ ] Restore Purchases: uninstall, reinstall, tap Restore, confirm entitlement returns
- [ ] App Store review submission: include reviewer credentials (test account + password) and this line in notes: "Subscription required to access training, nutrition, and body tracking. Free 3-day trial. Cancellable in iOS Settings. Apple-compliant disclosure on paywall."

Expected Apple review time: 24–48h. Expect one rejection on first submission for something petty (wording on disclosure, missing restore link on login screen). Fix and resubmit same day.
