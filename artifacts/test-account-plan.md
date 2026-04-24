# Test Account Plan

## Goal

Define one safe free account and one safe subscribed account using current repo behavior, without relying on the broken `review@useatlascore.com` seed.

## Recommendation

Use:
- subscribed account: the Alex demo seed flow
- free account: a normal signup plus an explicit admin revoke to `inactive`

Reason:
- the Alex flow resolves the real auth UUID and can reset the password on reruns (`scripts/demo/seed-alex.mjs:1652-1679`)
- normal signups always create a `trialing` subscription, not a true free/locked account (`supabase/migrations/002_auto_setup_on_signup.sql:21-40`, `supabase/functions/auth-webhook/index.ts:185-194`, `supabase/migrations/011_create_user_trigger.sql:52-77`)
- entitlement treats `trialing` as active paid access (`src/hooks/useEntitlement.js:103-115`)
- admin revoke sets active/trialing/granted subscriptions to `inactive` (`src/lib/adminService.js:505-517`)

## Account A: Verified Subscribed Account

Proposed identity:
- email: `inbox+alex@enzosoler.com`
- password: `demo123`

Repo evidence:
- email/password source: `scripts/demo/seed-alex.mjs:20-24`
- existing-user password reset: `scripts/demo/seed-alex.mjs:1652-1669`
- create-if-missing: `scripts/demo/seed-alex.mjs:1673-1682`
- active subscription seed: `scripts/demo/seed-alex.mjs:1723-1731`

Safe procedure:
1. Run `npm run seed:alex`.
2. Confirm the auth user can sign in with `inbox+alex@enzosoler.com` / `demo123`.
3. Confirm the latest `subscriptions` row for that user is `status = 'active'`.
4. Confirm the row also has `tier = 'pro'`.

Verification note:
- `seed-alex.mjs` seeds `plan_code: 'pro'`, not `tier: 'pro'` (`scripts/demo/seed-alex.mjs:1723-1731`).
- Current schema prefers `tier` (`supabase/migrations/20260326190000_add_performance_tier.sql:1-30`).
- If `plan_code` no longer exists in the live DB, the seed may still produce an active account but with default/fallback tier labeling. Verify `tier` after seeding instead of assuming it.

Acceptance criteria:
- auth login succeeds
- `subscriptions.status` is `active`
- `subscriptions.tier` is `pro`
- app entitlement resolves as active (`src/hooks/useEntitlement.js:103-115`)

## Account B: Verified Free Account

Proposed identity:
- use a new dedicated QA email, for example `inbox+free-qa@enzosoler.com`
- choose a disposable known password and store it in internal QA docs, not in repo

Why this must be explicit:
- signup paths auto-create `trialing` access, not a locked free account:
  - `supabase/migrations/002_auto_setup_on_signup.sql:21-40`
  - `supabase/functions/auth-webhook/index.ts:185-194`
  - `supabase/migrations/011_create_user_trigger.sql:67-77`
- the app treats `trialing` as active entitlement:
  - `src/hooks/useEntitlement.js:103-115`
  - `src/lib/SubscriptionContext.jsx:138-143`

Safe procedure:
1. Create a brand-new account through the normal signup flow.
2. Verify the auth user exists and can sign in.
3. Verify the initial subscription row is `status = 'trialing'`.
4. Immediately revoke access so the latest subscription row becomes `inactive`.
   Repo path for this action: `src/lib/adminService.js:505-517`.
5. Re-sign in and verify the account is treated as free/no active pro.

Acceptance criteria:
- auth login succeeds
- latest `subscriptions.status` is `inactive` or `expired`
- entitlement resolves `hasActivePro: false` and `tier: 'free'` (`src/hooks/useEntitlement.js:117-123`)
- account surfaces as Free in UI helpers (`src/lib/accountPresentation.js:18-26`)

## Do Not Use

- `review@useatlascore.com`

Reason:
- only manual seed path in repo: `scripts/demo/seed-review.mjs:17-23`
- no password refresh for existing user: `scripts/demo/seed-review.mjs:669-701`
- hardcoded UUID mismatch makes the seed structurally unsafe on fresh environments: `scripts/demo/seed-review.mjs:17`, `scripts/demo/seed-review.mjs:176-234`

## Minimal Verification Checklist

For any candidate test account, verify all four before publishing it to QA:

1. `auth.users` contains the email and sign-in succeeds.
2. `auth.users.email_confirmed_at` is non-null for password-based login accounts.
3. The latest `subscriptions` row has the intended `status`.
4. The latest `subscriptions` row has the intended `tier`.

Without those four checks, the account is not verified.
