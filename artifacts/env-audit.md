# Environment Audit

## Scope

Audit target: `SUPABASE_SERVICE_ROLE_KEY`, Supabase URL/public auth vars, and Stripe billing vars across app code, edge functions, scripts, and E2E helpers.

## Current state

- Local client config is present in `.env.local` for `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` at `.env.local:3-4`.
- `.env.example` documents only the public client vars, not `SUPABASE_SERVICE_ROLE_KEY` or Stripe billing vars at `.env.example:9-10`.
- The client bootstrap accepts either `VITE_SUPABASE_ANON_KEY` or `VITE_SUPABASE_PUBLISHABLE_KEY` and only needs those public vars plus the URL: `src/lib/supabaseClient.js:3-20`.
- `.gitignore` correctly excludes `.env`, `.env.*`, and `.env*.local`: `.gitignore:1-5`, `.gitignore:34`.

## Answer to the main question

`SUPABASE_SERVICE_ROLE_KEY` is not only a test-helper blocker in this repo.

It is required for live product flows on the server side, including:

- Web Stripe checkout creation: `src/services/billingService.js:19-52` -> `supabase/functions/create-checkout/index.ts:131-205`
- Web Stripe purchase completion fallback: `src/redesign/v3/routes/V3WebPurchaseSuccess.jsx:13-29` -> `src/services/billingService.js:73-85` -> `supabase/functions/complete-checkout/index.ts:42-156`
- Web billing portal access: `src/services/billingService.js:54-71`, `src/redesign/v3/routes/V3SubscriptionManage.jsx:52-57`, `src/hooks/useCustomerPortal.js:8-27` -> `supabase/functions/create-customer-portal/index.ts:40-159`
- Stripe webhook subscription sync for renewals/cancellations/payment failures: `supabase/functions/stripe-webhook/index.ts:167-245`, `:247-478`
- RevenueCat webhook entitlement sync for native purchases/restores: `src/lib/SubscriptionContext.jsx:163-185` -> `supabase/functions/revenuecat-webhook/index.ts:129-245`
- Signup/profile/subscription provisioning in auth hooks: `supabase/functions/auth-webhook/index.ts:169-207`, `supabase/functions/on-auth-user-created/index.ts:81-127`
- Self-serve account deletion and Stripe cancellation: `supabase/functions/self-delete-user/index.ts:60-135`
- Some production AI flows that read/write admin/global tables: `supabase/functions/log-food-text/index.ts:146-205`, `supabase/functions/food-vision/index.ts:180-244`, `supabase/functions/ai-coach-chat/index.ts:167-220`

Without `SUPABASE_SERVICE_ROLE_KEY`, the app can still boot and basic client-authenticated reads can work if the public Supabase vars are set, but several product-critical server flows will fail.

## What each env plane needs

### 1. Local web app / client bundle

Configure in local `.env.local` or deployment env passed to Vite:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` or `VITE_SUPABASE_PUBLISHABLE_KEY`

Verified by:

- `src/lib/supabaseClient.js:3-20`
- `src/lib/AuthContext.jsx:239-267`
- `src/lib/SubscriptionContext.jsx:22-27`
- `src/redesign/v3/routes/V3AuthLogin.jsx:27-28`

If missing, auth and Supabase-backed client features degrade immediately.

### 2. Supabase Edge Function secrets

Must be configured in Supabase project secrets, not Vite client env:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY` for functions that validate JWTs with a user-scoped client
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `APP_URL`
- `STRIPE_PRICE_*` catalog used by checkout/webhook mapping

Exact verification points:

- `supabase/functions/create-checkout/index.ts:33-63`, `:131-205`, `:293-317`
- `supabase/functions/complete-checkout/index.ts:46-56`
- `supabase/functions/create-customer-portal/index.ts:50-71`, `:95-144`
- `supabase/functions/stripe-webhook/index.ts:31-50`, `:167-181`
- `supabase/functions/revenuecat-webhook/index.ts:131-135`
- `supabase/functions/self-delete-user/index.ts:60-68`
- `scripts/set-supabase-secrets.sh:6-35`
- `supabase/config.toml:13-26`

### 3. Local scripts and E2E helpers

Need shell env or `.env.local` entries for direct admin access:

- `SUPABASE_SERVICE_ROLE_KEY`
- `VITE_SUPABASE_URL` or `SUPABASE_URL`
- `SEED_USER_ID` for some seed flows
- `STRIPE_SECRET_KEY` for Stripe maintenance scripts

Verified by:

- `e2e/loop-integrity.spec.ts:8-35`
- `scripts/demo/seed-review.mjs:15-25`
- `scripts/demo/seed-enzo.mjs:9-23`
- `scripts/demo/seed-alex.mjs:9-15`, `:1024-1031`
- `scripts/demo/find-user-id.mjs:9-21`
- `scripts/admin/sync_users.mjs:3-10`
- `scripts/admin/grant_admin_local.mjs:7-18`
- `scripts/seeds/seed_enzo.sh:7-16`
- `scripts/create-stripe-products.mjs:5-15`
- `scripts/setup-regional-prices.js:32-37`

## Concrete gaps

### Documentation gap

`.env.example` is incomplete for anyone trying to run billing, edge functions, E2E, or seed/admin scripts locally. It only documents public Vite vars: `.env.example:9-10`.

### Product risk

The most important missing-key risk is server-side billing and entitlement sync, not tests:

- `create-checkout` returns `500` if `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` is missing: `supabase/functions/create-checkout/index.ts:132-138`
- `complete-checkout` cannot authenticate the JWT or upsert the subscription without the service key: `supabase/functions/complete-checkout/index.ts:46-60`, `:142-150`
- `create-customer-portal` cannot validate the user or persist Stripe customer IDs without the service key: `supabase/functions/create-customer-portal/index.ts:49-61`, `:101-137`
- `stripe-webhook` cannot update `subscriptions` without the service key: `supabase/functions/stripe-webhook/index.ts:177-181`, `:284-287`, `:330-333`, `:359-365`, `:400-407`
- `revenuecat-webhook` cannot mirror native purchase state into `subscriptions` and `subscription_events` without the service key: `supabase/functions/revenuecat-webhook/index.ts:131-170`, `:189-215`

### Known billing fallback nuance

`complete-checkout` is explicitly documented as the fallback when Stripe webhook signature config is broken: `supabase/functions/complete-checkout/index.ts:4-10`.

That means:

- missing `SUPABASE_SERVICE_ROLE_KEY` breaks the fallback path itself
- missing `STRIPE_WEBHOOK_SECRET` is not the same failure mode
- both matter, but the service role key is directly product-critical

This aligns with `docs/LAUNCH_OPS.md:6-11`, `:17-23`, `:88-94`.

## Recommended verification checklist

Before treating the repo as correctly configured, verify in these exact places:

- Local web app: `.env.local` has `VITE_SUPABASE_URL` plus `VITE_SUPABASE_ANON_KEY` or `VITE_SUPABASE_PUBLISHABLE_KEY`
- Supabase secrets: Dashboard -> Project Settings -> Edge Functions -> Secrets contains `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `APP_URL`, and the `STRIPE_PRICE_*` set
- Billing path: confirm `create-checkout`, `complete-checkout`, `create-customer-portal`, `stripe-webhook`, and `revenuecat-webhook` are deployed/configured per `supabase/config.toml:13-26` and function source refs above
- E2E/seed path: local shell or `.env.local` contains `SUPABASE_SERVICE_ROLE_KEY` before running Playwright or demo/admin scripts
