# Service Role Usage Map

## Summary

There is no direct browser-side use of `SUPABASE_SERVICE_ROLE_KEY` in `src/`. The client uses public Supabase vars and then calls edge functions. The service role key is consumed in edge functions, scripts, and E2E/admin helpers.

## App entrypoints that indirectly depend on the service role key

| Client path | Server path requiring service role | Why it needs admin access |
| --- | --- | --- |
| `src/redesign/v3/routes/V3Paywall.jsx:79-91` -> `src/services/billingService.js:19-52` | `supabase/functions/create-checkout/index.ts:131-205` | validate JWT server-side, look up/update `subscriptions`, create Stripe customer/session |
| `src/redesign/v3/routes/V3WebPurchaseSuccess.jsx:13-29` -> `src/services/billingService.js:73-85` | `supabase/functions/complete-checkout/index.ts:42-156` | validate JWT and upsert `subscriptions` as checkout fallback |
| `src/redesign/v3/routes/V3SubscriptionManage.jsx:52-57`, `src/hooks/useCustomerPortal.js:8-27` -> `src/services/billingService.js:54-71` | `supabase/functions/create-customer-portal/index.ts:40-159` | validate JWT, read/write `subscriptions`, reuse/create Stripe customer |
| `src/lib/SubscriptionContext.jsx:163-185` | `supabase/functions/revenuecat-webhook/index.ts:129-245` | native purchase/restore sync into `subscriptions` and `subscription_events` |

## Edge functions that directly require `SUPABASE_SERVICE_ROLE_KEY`

### Billing and entitlement flows

| File | Exact usage | Product-critical? |
| --- | --- | --- |
| `supabase/functions/create-checkout/index.ts:132-141` | creates admin client, validates JWT, bypasses RLS | Yes |
| `supabase/functions/complete-checkout/index.ts:46-60`, `:142-145` | admin client for JWT lookup and `subscriptions` upsert | Yes |
| `supabase/functions/create-customer-portal/index.ts:50-56`, `:101-137` | admin client for JWT lookup and `subscriptions` updates | Yes |
| `supabase/functions/stripe-webhook/index.ts:177-181`, `:207-245`, `:284-407` | admin client for event idempotency and subscription lifecycle writes | Yes |
| `supabase/functions/revenuecat-webhook/index.ts:131-170`, `:189-215` | admin client for entitlement and commission writes | Yes |
| `supabase/functions/self-delete-user/index.ts:62`, `:68-69`, `:75-135` | admin deletes data, storage, and auth user | Yes |

### Auth / account lifecycle

| File | Exact usage | Product-critical? |
| --- | --- | --- |
| `supabase/functions/auth-webhook/index.ts:172-194` | create profile + trial subscription on signup | Yes |
| `supabase/functions/on-auth-user-created/index.ts:15-17`, `:84-107` | compatibility signup provisioning shim | Yes while deployed |
| `supabase/functions/send-password-reset/index.ts:17-18`, `:55-74` | `auth.admin.listUsers` and `generateLink` | Yes if custom reset email path is used |
| `supabase/functions/sync-role-to-jwt/index.ts:19-20`, `:54-60` | admin JWT/role sync | Admin/ops |
| `supabase/functions/reset-user-data/index.ts:101-103` | reset path with admin deletes | Product/admin |
| `supabase/functions/admin-delete-user/index.ts:45-51` | admin delete flow | Admin |
| `supabase/functions/admin-users/index.ts:18-19` | admin user management | Admin |
| `supabase/functions/admin-audit/index.ts:18-19` | admin audit queries | Admin |
| `supabase/functions/moderation/index.ts:18-19` | moderation/admin access | Admin |

### AI / feature backends using admin tables

| File | Exact usage | Product-critical? |
| --- | --- | --- |
| `supabase/functions/log-food-text/index.ts:146-155`, `:183-205` | auth lookup plus cache and usage-log writes through service-role client | Yes for AI food text |
| `supabase/functions/food-vision/index.ts:180-194`, `:197-244` | service-role reads from `subscriptions`, `ai_spending_config`, quotas | Yes for food vision |
| `supabase/functions/ai-coach-chat/index.ts:167-220` | service-role reads/writes spending config, quotas, subscriptions | Yes for coach chat |
| `supabase/functions/log-workout-text/index.ts:142-143` | service-role configured in function | Likely yes for AI workout logging |
| `supabase/functions/invoke-llm/index.ts:55-56` | service-role client for backend LLM orchestration | Yes for generic LLM path |
| `supabase/functions/share-workout/index.ts:44-45` | admin client in share flow | Feature-specific |
| `supabase/functions/send-push/index.ts:119-120` | admin push/logging path | Feature-specific |

### Messaging / email / invite flows

| File | Exact usage | Product-critical? |
| --- | --- | --- |
| `supabase/functions/send-email/index.ts:647-648`, `:669-682` | accepts service-key auth and logs `email_events` with admin client | Supporting infra |
| `supabase/functions/send-scheduled-emails/index.ts:28-30`, `:361-375` | scheduled internal mail jobs use service role | Ops/supporting infra |
| `supabase/functions/send-beta-invite/index.ts:91-97` | admin invite creation plus user-scoped auth | Growth/admin |
| `supabase/functions/redeem-invite/index.ts:46-55`, `:83-88` | admin read of invite plus user-scoped auth | Feature-specific |

### Shared helpers

| File | Exact usage | Notes |
| --- | --- | --- |
| `supabase/functions/_shared/logger.ts:20-38` | optional admin logging client if env exists | helper, indirect dependency |
| `supabase/functions/_shared/push.ts:15-16` | admin push helper client | helper, indirect dependency |

## Scripts and E2E flows that directly require `SUPABASE_SERVICE_ROLE_KEY`

| File | Exact usage | Only helper/test? |
| --- | --- | --- |
| `e2e/loop-integrity.spec.ts:12-35`, `:46-88` | admin client creates/confirms users | Yes, helper/test only |
| `scripts/demo/seed-review.mjs:15-25` | seed review account data | Yes |
| `scripts/demo/seed-enzo.mjs:9-23` | seed demo data into target user | Yes |
| `scripts/demo/seed-alex.mjs:9-15`, `:1024-1031` | seed Alex demo account | Yes |
| `scripts/demo/find-user-id.mjs:9-21`, `:29-45` | `auth.admin.listUsers()` | Yes |
| `scripts/admin/sync_users.mjs:3-10`, `:16-40` | sync auth users to app tables | Admin helper |
| `scripts/admin/grant_admin_local.mjs:7-18`, `:24-40` | local admin grant | Admin helper |
| `scripts/seeds/seed_enzo.sh:7-16` | shell wrapper exporting service key | Helper |

## Bottom line

`SUPABASE_SERVICE_ROLE_KEY` is split across two dependency classes:

- helper-only: Playwright, seed, and admin scripts
- product-critical: billing, webhook sync, signup provisioning, self-delete, and some AI feature backends

So if the key is missing:

- E2E and seed/admin helpers will definitely fail
- the live product will also lose major server-side flows, especially Stripe and RevenueCat subscription state handling
