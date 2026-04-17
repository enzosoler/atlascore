# Teardown 23 — Manage Subscription

**Surface:** Self-serve billing control for viewing current plan status and opening the billing/customer portal  
**Atlas file(s):** `src/pages/Account.jsx`, `src/pages/BillingManagement.jsx`, `src/pages/Settings.jsx`, `src/pages/AccountStatus.jsx`, `src/hooks/useCustomerPortal.js`, `src/lib/SubscriptionContext.jsx`, `src/App.jsx`  
**Reference apps:** Apple Settings (primary), Blinkist (secondary)  
**Audience tension:** High — serious users need fast control over renewal and cancellation, while casual users need a calm surface that does not feel technical

---

## Why this screen matters

This surface answers a high-stakes question: “What am I paying for, and how do I change or cancel it?” In Atlas, that answer is split across account summary cards, a separate `/billing` page, a settings hub, and then an external portal.

If this flow is broken, the product pays for it in churn, refunds, and support burden. If it is world-class, it should feel like iOS Settings: one clear state, one obvious action, and no ambiguity about the next stop.

---

## Reference app 1 — Apple Settings (primary)

Apple is the right primary reference because this is a utility surface, not a marketing one. The user already has a subscription and wants status, renewal timing, and a direct action.

### What Apple Settings does that works

1. **Single status row**
   Apple keeps the subscription in one visible row with plan, renewal, and action. That reduces guesswork and makes the user feel oriented immediately.

2. **Action follows state**
   The CTA changes based on what the user can do now: manage, cancel, or review. That is better than a generic billing screen because the UI stays task-first.

3. **Calm hierarchy**
   Labels come first, then values, then the action. That restraint matters because billing is a trust surface.

4. **Clear ownership**
   Apple makes it obvious which system owns the subscription. Atlas needs the same clarity because it has both web and native billing paths.

5. **Fast exit**
   The user can leave without hitting a dead end or confirmation maze. That is important because billing is usually an interruption, not a browsing session.

### What Apple Settings does that you shouldn't copy

1. **Do not copy the platform lock-in story**
   Apple can assume the store owns the subscription; Atlas cannot. The UI has to explain whether the user is going to Stripe or RevenueCat.

2. **Do not go too sparse**
   Apple can be minimal because the OS supplies context. Atlas needs a bit more explanation, especially around renewal source and where cancellation actually happens.

---

## Reference app 2 — Blinkist (secondary)

Blinkist adds the consumer SaaS angle that Apple does not cover. It helps Atlas feel understandable without sounding salesy.

### What Blinkist does that works

1. **Plain-language plan framing**
   Blinkist explains the current tier and what it means in normal language. That helps non-technical users understand the state quickly.

2. **Visible manage CTA**
   The manage action is easy to find and not buried. That is the right pattern for retention-sensitive surfaces.

3. **Mobile-friendly layout**
   The interaction is compact and thumb-friendly. Atlas is also mobile-heavy, so that matters.

### What Blinkist does that you shouldn't copy

1. **Do not over-sell**
   Blinkist can afford retention-heavy copy; Atlas should not turn management into another upsell surface.

2. **Do not flatten platform differences**
   The surface cannot hide whether control lives in Stripe, RevenueCat, or the app store. Users need that distinction.

---

## What Atlas does today (current state)

- **Layout and navigation structure:** `/account` is the main entry point in `Account.jsx`. It shows identity, plan, settings, danger zone, and logout. The management handoff is on `/billing`, and `Settings.jsx` also exposes a portal CTA.
- **Key interactions:** Subscribed users in `Account.jsx` get a `Manage Billing` button to `/billing`; free users get an upgrade CTA. `BillingManagement.jsx` routes native users to RevenueCat customer center and web users to the Stripe portal. `AccountStatus.jsx` repeats the same CTA.
- **Visual approach:** `Account.jsx` is the most polished of the group: card surfaces, rounded corners, muted fills, and icon badges. `BillingManagement.jsx` is plainer, with a generic mobile wrapper and one centered action.
- **Known issues:** `useCustomerPortal()` accepts `userId` and `email` but does not use them. It also defaults the return URL to `/Settings`. The management experience is duplicated across account, settings, status, and billing.
- **Gaps relative to the reference app:** Atlas does not show a single authoritative subscription status row like Apple. It also does not clearly state what the portal can do before the user leaves the app.

---

## Patterns to steal, ranked by ROI

### 🟢 Steal immediately — high impact, low effort

1. **One-state summary**
   Collapse the visible plan state into one row that says what the user has, when it renews, and what happens next. Start in `Account.jsx` and `Settings.jsx`. Effort: 4-8 hours.

2. **State-specific CTA**
   Make the primary action differ for free, trialing, active, native, and web users. Atlas already has the data in `SubscriptionContext.jsx`; it just needs to be surfaced consistently. Effort: 4-6 hours.

3. **Clear portal handoff copy**
   Before leaving the app, tell the user exactly where they are going and what they can change there. This is a small copy and layout change in `BillingManagement.jsx` and `useCustomerPortal.js`. Effort: 2-4 hours.

### 🟡 Steal soon — medium impact, medium effort

1. **Add renewal and source metadata**
   Show whether billing is managed by Stripe, RevenueCat, or store billing, plus the next renewal date when available. That brings Atlas closer to Apple’s clarity. Effort: 1-2 days.

2. **Add explicit recovery path**
   If the portal fails to open, show retry and support instead of only a toast. That belongs in `useCustomerPortal.js` and `BillingManagement.jsx`. Effort: 1 day.

3. **Make mobile billing feel native**
   Replace the plain centered card in `BillingManagement.jsx` with the same tokenized card hierarchy used elsewhere in Atlas. Effort: 1 day.

### 🔴 Consider carefully — high effort or audience-dependent

1. **Build a first-class subscription hub**
   Merge status, portal access, support, and platform-specific instructions into one billing hub. Best experience, but it needs product agreement on what stays in-app versus in the portal. Effort: 3-5 days.

2. **Surface invoice or payment history in-app**
   Pull billing history into Atlas instead of delegating everything to the portal. Useful for power users, but only if the backend sources are reliable enough to unify cleanly. Effort: 2-4 days.

---

## Atlas-specific design tensions to resolve

**Tension 1 — Summary vs management.**  
`Account.jsx` behaves like a summary page, while `BillingManagement.jsx` is the real control surface. *Resolution:* make `/account` the authoritative billing hub and keep `/billing` as a utility handoff screen.

**Tension 2 — Web vs native ownership.**  
Atlas has Stripe on web and RevenueCat on native, so the source of truth changes by platform. *Resolution:* say that explicitly in the UI and route to the correct tool without hiding the distinction.

**Tension 3 — Calm vs complete.**  
A minimal Apple-style surface is trustworthy, but users still need enough detail to know what is billed, when, and where to change it. *Resolution:* keep the page restrained, but show the operational facts users actually ask support for.

---

## Specific changes to make (actionable list)

1. Reframe `Account.jsx` so the plan card becomes the primary subscription hub with status, source, and next action. Files: `src/pages/Account.jsx`, `src/lib/SubscriptionContext.jsx`. Effort: 1-2 days. Dependency: none.
2. Merge the `Manage Billing` affordance from `Account.jsx`, `Settings.jsx`, and `AccountStatus.jsx` into one canonical path. Files: `src/pages/Account.jsx`, `src/pages/Settings.jsx`, `src/pages/AccountStatus.jsx`, `src/App.jsx`. Effort: 4-8 hours. Dependency: 1.
3. Update `BillingManagement.jsx` to explain what the portal can do on the current platform before the user clicks through. Files: `src/pages/BillingManagement.jsx`, `src/lib/SubscriptionContext.jsx`. Effort: 4-6 hours. Dependency: 1.
4. Add renewal date and billing source to the visible manage-subscription UI wherever the data exists. Files: `src/pages/Account.jsx`, `src/pages/Settings.jsx`, `src/pages/BillingManagement.jsx`, `src/lib/SubscriptionContext.jsx`. Effort: 1-2 days. Dependency: 1.
5. Replace the hardcoded `/Settings` return URL in `useCustomerPortal.js` with a caller-provided current route. Files: `src/hooks/useCustomerPortal.js`, `src/pages/BillingManagement.jsx`, `src/pages/Settings.jsx`. Effort: 2-4 hours. Dependency: 2.
6. Remove the unused `userId` and `email` parameters from `useCustomerPortal()` unless the edge function will actually use them. Files: `src/hooks/useCustomerPortal.js`. Effort: 1 hour. Dependency: none.
7. Add a fallback error state when portal launch fails, including retry and support. Files: `src/pages/BillingManagement.jsx`, `src/hooks/useCustomerPortal.js`. Effort: 4-6 hours. Dependency: 5.
8. Make native billing copy explicitly mention RevenueCat customer center instead of a generic portal. Files: `src/pages/BillingManagement.jsx`, `src/pages/Settings.jsx`, `src/lib/translations/*`. Effort: 2-4 hours. Dependency: none.

Total effort: about 4-7 days, depending on whether the team stops at cleanup or builds a real billing hub. The biggest jump in perceived quality comes from items 1, 2, 4, and 7.

---

## What NOT to do

1. Do **not** bury cancellation inside a generic settings menu.
2. Do **not** turn the manage-subscription surface into an upsell screen.
3. Do **not** expose Stripe or RevenueCat jargon without explaining ownership.

---

## The single highest-leverage thing

Unify the subscription experience around one authoritative Atlas billing hub that shows current plan state, renewal timing, and the exact management path for the user’s platform. Right now the surface is spread across `Account.jsx`, `Settings.jsx`, `AccountStatus.jsx`, and `BillingManagement.jsx`, which makes the user work to understand who owns the subscription.

**File status:** Draft 1. To be revised after implementation against reality.
