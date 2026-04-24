# Required Environment Variables

## Client-side vars

These are safe to expose to the browser and are required for the app shell and client auth.

| Var | Required for | Where consumed | Where to configure |
| --- | --- | --- | --- |
| `VITE_SUPABASE_URL` | All client Supabase access | `src/lib/supabaseClient.js:3`, `src/lib/AuthContext.jsx:239-267`, `src/lib/SubscriptionContext.jsx:22-27` | local `.env.local`, Vercel build env |
| `VITE_SUPABASE_ANON_KEY` | Preferred public client key | `src/lib/supabaseClient.js:5`, `src/services/foodSearchService.js:10-12` | local `.env.local`, Vercel build env |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Fallback public client key used throughout current codebase | `src/lib/supabaseClient.js:6`, `.env.example:10`, `.env.local:3`, `e2e/loop-integrity.spec.ts:10-15` | local `.env.local`, Vercel build env |

Notes:

- The code treats `VITE_SUPABASE_ANON_KEY` and `VITE_SUPABASE_PUBLISHABLE_KEY` as interchangeable public client credentials.
- `.env.example` currently documents only `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`: `.env.example:9-10`.

## Supabase Edge Function secrets

These must stay server-side in Supabase secrets.

| Var | Required for | Where consumed | Where to configure / verify |
| --- | --- | --- | --- |
| `SUPABASE_URL` | Admin/user-scoped edge function clients | `supabase/functions/create-checkout/index.ts:132`, `complete-checkout/index.ts:46`, `create-customer-portal/index.ts:51`, `stripe-webhook/index.ts:179`, `revenuecat-webhook/index.ts:133` | Supabase Dashboard -> Edge Functions -> Secrets or `supabase secrets set` |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin auth, RLS bypass, webhook writes, billing writes | `create-checkout/index.ts:133`, `complete-checkout/index.ts:47`, `create-customer-portal/index.ts:52`, `stripe-webhook/index.ts:180`, `revenuecat-webhook/index.ts:134`, `self-delete-user/index.ts:62` | Supabase Dashboard -> Edge Functions -> Secrets or `supabase secrets set` |
| `SUPABASE_ANON_KEY` | User-scoped JWT validation in some edge functions | `food-vision/index.ts:182`, `self-delete-user/index.ts:61`, `redeem-invite/index.ts:53`, `send-email/index.ts:652` | Supabase Dashboard -> Edge Functions -> Secrets or `supabase secrets set` |
| `APP_URL` | Billing return URLs and email links | `create-checkout/index.ts:293`, `create-customer-portal/index.ts:95`, `stripe-webhook/index.ts:123`, `send-password-reset/index.ts:16` | Supabase Dashboard -> Edge Functions -> Secrets |

## Stripe billing vars

These are product-critical for paid web billing and Stripe lifecycle sync.

| Var | Required for | Where consumed | Where to configure / verify |
| --- | --- | --- | --- |
| `STRIPE_SECRET_KEY` | Create checkout sessions, customer portal, fallback completion, self-delete cancellation, Stripe scripts | `create-checkout/index.ts:200-210`, `complete-checkout/index.ts:48-54`, `create-customer-portal/index.ts:63-71`, `stripe-webhook/index.ts:167-177`, `self-delete-user/index.ts:63`, `scripts/create-stripe-products.mjs:14`, `scripts/setup-regional-prices.js:32-37` | Supabase secrets for edge functions; local shell or `.env.local` for scripts |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signature verification | `supabase/functions/stripe-webhook/index.ts:168-199` | Supabase Dashboard -> Edge Functions -> Secrets |
| `STRIPE_PRICE_US_MONTHLY_ATHLETE_PRO` and other `STRIPE_PRICE_*` vars | Price lookup and plan mapping | `supabase/functions/create-checkout/index.ts:33-63`, `supabase/functions/stripe-webhook/index.ts:31-50` | Supabase secrets; bootstrap via `scripts/set-supabase-secrets.sh:6-35` |

## Test / seed / admin script vars

These are not required for the browser app itself, but they are required for local automation.

| Var | Required for | Where consumed | Where to configure |
| --- | --- | --- | --- |
| `SUPABASE_SERVICE_ROLE_KEY` | Playwright user creation/confirmation, demo seeds, admin scripts | `e2e/loop-integrity.spec.ts:12-35`, `scripts/demo/seed-review.mjs:16-25`, `scripts/demo/seed-enzo.mjs:13-23`, `scripts/demo/seed-alex.mjs:13-15`, `:1024-1031`, `scripts/admin/sync_users.mjs:4-10` | local shell or `.env.local` |
| `SUPABASE_URL` or `VITE_SUPABASE_URL` | Script client target | `scripts/demo/seed-enzo.mjs:9-23`, `scripts/demo/find-user-id.mjs:9-21`, `scripts/admin/grant_admin_local.mjs:7-18` | local shell or `.env.local` |
| `SEED_USER_ID` | Target account for seed data | `scripts/demo/seed-enzo.mjs:25-28`, `scripts/seeds/seed_enzo.sh:12-15` | local shell |

## Minimum required sets by scenario

### To boot the web app locally

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` or `VITE_SUPABASE_PUBLISHABLE_KEY`

### To make paid web billing work in production

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- full `STRIPE_PRICE_*` set
- `APP_URL`

### To keep native purchase entitlement sync working

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `REVENUECAT_WEBHOOK_SECRET`

Reference: `supabase/functions/revenuecat-webhook/index.ts:74-87`, `:131-215`

### To run E2E fallback flows and seed/admin helpers locally

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` or `VITE_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- scenario-specific extras such as `SEED_USER_ID`

## Immediate documentation mismatch

`SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `STRIPE_PRICE_*` are required for substantial server-side flows, but they are not represented in `.env.example`. The best current source of truth is the function code plus `scripts/set-supabase-secrets.sh:6-35`.
