# Billing Readiness Checklist

## Ready now

- `create-checkout` exists, validates bearer JWT itself, resolves Stripe price IDs from server env, and creates subscription checkout sessions with the correct success and cancel URLs. `supabase/functions/create-checkout/index.ts:108-167`, `212-231`, `296-317`
- `complete-checkout` exists as a post-redirect fallback and upserts the `subscriptions` row from the Stripe Checkout session. `supabase/functions/complete-checkout/index.ts:38-57`, `78-145`
- `stripe-webhook` exists, verifies Stripe signatures, dedupes events, and upserts subscription state. `supabase/functions/stripe-webhook/index.ts:167-204`, `209-229`, `231-320`
- `create-customer-portal` exists and is wired from the web billing pages. `supabase/functions/create-customer-portal/index.ts:35-60`, `101-145`; `src/services/billingService.js:48-71`
- The checkout success redirect contract is guarded by source-level tests. `tests/prelaunch/checkout-url.test.mjs:26-65`
- Schema support for Stripe IDs and webhook idempotency exists. `supabase/migrations/20260319100000_stripe_subscription_sync.sql:6-29`; `supabase/migrations/20260328103000_stripe_webhook_idempotency.sql:4-28`
- Schema support for `performance`, `coach`, `nutritionist`, and `clinician` tiers exists in later migrations. `supabase/migrations/20260326200000_add_professional_tiers.sql:10-27`; `supabase/migrations/20260326200001_fix_tier_constraints_and_ai_limits.sql:14-32`

## Blocked on auth / deployment / test data

- Cannot verify actual secret presence from the repo alone. Billing requires deployed Supabase secrets for:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `APP_URL`
  - all `STRIPE_PRICE_*` vars used by `create-checkout` and `stripe-webhook`
- Cannot run a real checkout without an authenticated web user because the browser helpers require `supabase.auth.getSession()` to return an access token. `src/services/billingService.js:7-16`
- Cannot verify redirect completion without that same logged-in user reaching `/webapp/success` with a valid `session_id`. `src/redesign/v3/routes/V3WebPurchaseSuccess.jsx:14-28`
- Cannot verify webhook-driven activation without a deployed Stripe webhook endpoint and matching `STRIPE_WEBHOOK_SECRET`.
- Cannot verify portal access without an authenticated user whose email resolves to an existing Stripe customer or can create one. `supabase/functions/create-customer-portal/index.ts:101-145`

## Known readiness gaps

- `.env.example` does not document the server-side billing secrets, so billing setup is not self-documented in checked-in env docs. `.env.example:1-39`
- The current web paywall only exercises US athlete-pro pricing. BR pricing and professional plans are configured server-side but not reachable from the present web UI. `src/redesign/v3/routes/V3Paywall.jsx:83-89`; `supabase/functions/create-checkout/index.ts:34-62`
- Activation after Stripe success depends on the user still being logged in when `/webapp/success` loads. If not, `complete-checkout` returns unauthorized. `src/services/billingService.js:73-85`; `supabase/functions/complete-checkout/index.ts:53-57`
- Billing history is a portal launcher, not a first-party invoice sync. `src/redesign/v3/routes/V3BillingHistory.jsx:8-9`, `42-45`

## Recommended test order

1. Confirm deployed secrets with `scripts/verify-stripe-secrets.sh` and Supabase dashboard function secrets. `scripts/verify-stripe-secrets.sh:4-16`
2. Sign in as a real web test user and confirm `/webapp/billing/paywall` loads. `src/App.jsx:774-775`
3. Start checkout from `V3Paywall`, complete a Stripe test payment, and verify redirect to `/webapp/success?session_id=...`. `src/redesign/v3/routes/V3Paywall.jsx:79-90`; `src/services/billingService.js:25-31`
4. Confirm `complete-checkout` writes an `active` or `trialing` row in `subscriptions`. `supabase/functions/complete-checkout/index.ts:116-145`
5. Confirm the webhook also records the same subscription state and idempotency row. `supabase/functions/stripe-webhook/index.ts:209-229`, `231-320`
6. Open the billing portal from `/webapp/billing` and `/webapp/billing/invoices` and confirm the return URL lands back on the expected page. `src/redesign/v3/routes/V3SubscriptionManage.jsx:52-57`; `src/redesign/v3/routes/V3BillingHistory.jsx:42-45`
