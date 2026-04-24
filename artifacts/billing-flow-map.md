# Billing Flow Map

## Scope

This maps the web Stripe path in this repo: checkout initiation, success redirect, `complete-checkout`, subscription activation, and billing portal access.

## End-to-end web flow

| Step | Entry point | Server path | Auth dependency | Return / redirect | Notes |
| --- | --- | --- | --- | --- | --- |
| 1. Checkout initiation | `src/redesign/v3/routes/V3Paywall.jsx:79-90` | `src/services/billingService.js:19-46` -> `supabase/functions/create-checkout/index.ts:95-334` | Requires logged-in Supabase session. `billingService` pulls `access_token`; no token means hard failure. `src/services/billingService.js:7-16` | Success URL: `/webapp/success?session_id={CHECKOUT_SESSION_ID}`. Cancel URL: `/webapp/billing/paywall`. `src/services/billingService.js:25-31`, `supabase/functions/create-checkout/index.ts:296-301` | Current web UI always sends `plan: 'athlete_pro'`, `region: 'us'`, and monthly/yearly only. Other server-side Stripe prices exist but are not reachable from this UI. `src/redesign/v3/routes/V3Paywall.jsx:83-89` |
| 2. Stripe-hosted checkout | External Stripe page returned by `create-checkout` | Stripe | Auth already established before redirect | Stripe redirects back to `/webapp/success?session_id=...` | Server stores `user_id`, `plan`, and `email` in Checkout metadata and subscription metadata. `supabase/functions/create-checkout/index.ts:302-314` |
| 3. Success redirect landing | Public route `src/App.jsx:917` renders `src/redesign/v3/routes/V3WebPurchaseSuccess.jsx:8-84` | Client calls `completeWebCheckout(sessionId)` | Route is public, but `completeWebCheckout` still requires a live logged-in Supabase session. `src/services/billingService.js:73-85` | Reads `session_id` from URL query string. `src/redesign/v3/routes/V3WebPurchaseSuccess.jsx:14-24` | If the user lands here without a valid session, the page shows an error and activation does not complete until the same user logs in again. |
| 4. Complete checkout fallback | `src/services/billingService.js:73-85` | `supabase/functions/complete-checkout/index.ts:27-154` | Requires bearer token; function re-validates JWT with Supabase. `supabase/functions/complete-checkout/index.ts:38-57` | No redirect; returns JSON `{ success: true }` | This is the fallback that writes the `subscriptions` row even if Stripe webhook delivery/signature is broken. `supabase/functions/complete-checkout/index.ts:3-9`, `128-145` |
| 5. Subscription activation / ongoing sync | Stripe webhooks | `supabase/functions/stripe-webhook/index.ts` | No user session; uses `STRIPE_WEBHOOK_SECRET` + service role. `supabase/functions/stripe-webhook/index.ts:167-204` | N/A | Handles `checkout.session.completed`, `customer.subscription.created`, and `customer.subscription.updated`, upserting `subscriptions` and deduping via `stripe_webhook_events`. `supabase/functions/stripe-webhook/index.ts:231-292`, `294-320`; `supabase/migrations/20260328103000_stripe_webhook_idempotency.sql:4-28` |
| 6. Billing portal access | `src/redesign/v3/routes/V3SubscriptionManage.jsx:52-63`, `src/redesign/v3/routes/V3BillingHistory.jsx:42-49`, `src/redesign/v3/routes/V3Billing.jsx:39-49` | `src/services/billingService.js:48-71` -> `supabase/functions/create-customer-portal/index.ts:24-146` | Requires logged-in Supabase session; function validates bearer token itself. `src/services/billingService.js:7-16`, `48-64`; `supabase/functions/create-customer-portal/index.ts:35-60` | Default return URL is `/webapp/billing`; invoices page passes `/webapp/billing/invoices`. `src/services/billingService.js:52-59`; `src/redesign/v3/routes/V3BillingHistory.jsx:42-45` | If no `stripe_customer_id` exists, the function searches Stripe by email or creates a customer before opening the portal. `supabase/functions/create-customer-portal/index.ts:101-145` |

## Auth and logged-in-state dependencies

- Web billing routes are auth-gated except `/webapp/success`. `src/App.jsx:770-779`, `917`
- `V3Paywall` only works for authenticated users because `startWebCheckout()` requires a live access token. `src/redesign/v3/routes/V3Paywall.jsx:79-90`, `src/services/billingService.js:7-16`
- `V3WebPurchaseSuccess` is public, but activation still depends on the user remaining logged in because `completeWebCheckout()` also requires a live access token. `src/redesign/v3/routes/V3WebPurchaseSuccess.jsx:14-28`, `src/services/billingService.js:73-85`
- Subscription state shown in billing/account UI depends on both auth state and Supabase config. `SubscriptionProvider` only queries `subscriptions` when `user?.email`, `isAuthenticated`, and `authState === 'authenticated'`. `src/lib/SubscriptionContext.jsx:92-123`
- `AuthContext` refuses to consider the user ready if Supabase client config is missing or if the profile fetch fails. Billing routes therefore depend on both client env and DB profile availability. `src/lib/AuthContext.jsx:124-170`, `235-259`; `src/lib/supabaseClient.js:3-20`

## Stripe env and URL audit

### Server-side Stripe/Supabase secrets referenced in code

- `STRIPE_SECRET_KEY`: required by `create-checkout`, `complete-checkout`, `create-customer-portal`, and `stripe-webhook`. `supabase/functions/create-checkout/index.ts:199-210`; `supabase/functions/complete-checkout/index.ts:46-49`; `supabase/functions/create-customer-portal/index.ts:63-71`; `supabase/functions/stripe-webhook/index.ts:167-175`
- `STRIPE_WEBHOOK_SECRET`: required by `stripe-webhook`. `supabase/functions/stripe-webhook/index.ts:167-175`
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`: required by the billing edge functions that validate JWTs and upsert subscription state. `supabase/functions/create-checkout/index.ts:131-141`; `supabase/functions/complete-checkout/index.ts:45-50`; `supabase/functions/create-customer-portal/index.ts:49-53`; `supabase/functions/stripe-webhook/index.ts:177-181`
- `APP_URL`: used as origin fallback in `create-checkout`, portal return-url fallback, and email links in `stripe-webhook`. `supabase/functions/create-checkout/index.ts:293-301`; `supabase/functions/create-customer-portal/index.ts:95-96`; `supabase/functions/stripe-webhook/index.ts:123-145`

### Stripe price env vars referenced in code

- `create-checkout` and `stripe-webhook` both expect the full US/BR x monthly/yearly x plan matrix:
  - `STRIPE_PRICE_{US|BR}_{MONTHLY|YEARLY}_{ATHLETE_PRO|ATHLETE_PERFORMANCE|COACH|NUTRITIONIST|CLINICIAN}`
  - `supabase/functions/create-checkout/index.ts:34-62`
  - `supabase/functions/stripe-webhook/index.ts:29-50`
- Checked-in helper scripts exist to set and verify these secrets:
  - `scripts/set-stripe-prices.sh:8-27`
  - `scripts/verify-stripe-secrets.sh:7-16`
  - `scripts/stripe-prices.json`

### Client env vars that gate billing readiness

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` or `VITE_SUPABASE_PUBLISHABLE_KEY`
- These are required for auth session access and for invoking edge functions from the browser. `src/lib/supabaseClient.js:3-20`, `src/lib/AuthContext.jsx:239-245`

### Return URLs currently wired

- Checkout success: `/webapp/success?session_id={CHECKOUT_SESSION_ID}`. `src/services/billingService.js:25`; `supabase/functions/create-checkout/index.ts:300`
- Checkout cancel: `/webapp/billing/paywall`. `src/services/billingService.js:26`; `supabase/functions/create-checkout/index.ts:301`
- Billing portal default return: `/webapp/billing`. `src/services/billingService.js:57-59`
- Billing portal invoices return: `/webapp/billing/invoices`. `src/redesign/v3/routes/V3BillingHistory.jsx:42-45`

## What is ready vs blocked

### Ready to test from code

- Authenticated web checkout initiation for the US athlete-pro plan, monthly or yearly.
- Redirect contract for `/webapp/success?session_id=...`; this is covered by `tests/prelaunch/checkout-url.test.mjs:26-65`.
- Post-redirect fallback activation through `complete-checkout`.
- Billing portal launch from billing/manage/history pages for an authenticated user.
- Subscription row reads in the web UI once `subscriptions` contains Stripe data.

### Blocked on auth / test accounts / deployed secrets

- End-to-end live validation of checkout creation, redirect, and subscription activation is blocked here without:
  - a working Supabase client config,
  - a real authenticated web user,
  - deployed edge-function secrets (`STRIPE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, price envs, `APP_URL`),
  - and a Stripe test account/webhook destination.
- Webhook-path validation is blocked without a deployed Stripe endpoint and matching `STRIPE_WEBHOOK_SECRET`.
- Portal validation is blocked without an authenticated user that can be resolved to an existing or creatable Stripe customer.

## Readiness gaps

1. `.env.example` documents only client-side Supabase/analytics vars and does not document the server-side billing secrets or `APP_URL`, so repo-level setup docs are incomplete for billing deploys. `.env.example:1-39`
2. The current web paywall does not expose the broader price matrix already configured server-side. It hardcodes `plan: 'athlete_pro'` and `region: 'us'`, so BR pricing and professional tiers are not reachable through the current web checkout UI. `src/redesign/v3/routes/V3Paywall.jsx:83-89`
3. `/webapp/success` is intentionally public, but successful activation still depends on the user arriving with a valid Supabase session. If they are logged out or their session expires during checkout, `complete-checkout` fails with an auth error until they log back in. `src/redesign/v3/routes/V3WebPurchaseSuccess.jsx:14-28`; `src/services/billingService.js:73-85`; `supabase/functions/complete-checkout/index.ts:53-57`
4. Billing history is portal-backed, not invoice-data-backed. The page itself notes that no real invoice service is wired yet. `src/redesign/v3/routes/V3BillingHistory.jsx:8-9`
