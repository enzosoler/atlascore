# Test Account Audit

## Scope

Audit target: `review@useatlascore.com` with expected password `ReviewAtlas2026!`.

Key login path:
- `src/lib/AuthContext.jsx:337-349` calls `supabase.auth.signInWithPassword({ email, password })`, so "invalid login credentials" is coming from Supabase Auth, before app profile/subscription reads.

## Findings

### 1. The review account is not created by normal repo bootstrap or signup flows

The repo has exactly one place that defines `review@useatlascore.com`: `scripts/demo/seed-review.mjs:17-18`. There is no `package.json` script for it, while `seed:alex`, `seed:enzo`, and `find:user` do exist in `package.json:20-25`.

Implication:
- If nobody manually ran `scripts/demo/seed-review.mjs` against the active Supabase project, the auth user simply does not exist and login will fail with invalid credentials.

### 2. `seed-review.mjs` is easy to not run successfully

`scripts/demo/seed-review.mjs:15-23` reads `VITE_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` directly from `process.env`, but unlike `scripts/demo/seed-alex.mjs:3-7` and `scripts/demo/find-user-id.mjs:3-7`, it does not load `.env.local` via `dotenv`.

Implication:
- The documented usage string in `scripts/demo/seed-review.mjs:8` (`node scripts/demo/seed-review.mjs`) is incomplete. On a normal local shell, that command will fail unless `SUPABASE_SERVICE_ROLE_KEY` was already exported into the environment.

### 3. If the review auth user already exists, the script does not reset the password

In `scripts/demo/seed-review.mjs:669-701`, the script:
- lists users,
- checks for an existing `review@useatlascore.com`,
- only creates the user if missing.

If the user already exists, it logs the existing ID and does nothing else. It does not call `updateUserById()` to force the password to `ReviewAtlas2026!`.

Contrast:
- `scripts/demo/seed-alex.mjs:1652-1669` explicitly updates the existing auth user password and confirmation state before continuing.

Implication:
- A stale review account is plausible from repo evidence alone: the email may exist in Auth, but with an old password, causing the exact invalid-credentials failure.

### 4. The review seed is structurally broken for fresh environments

`scripts/demo/seed-review.mjs` hardcodes:
- `USER_ID = '13f976a2-006a-45b9-88c5-6c85f7ffc40a'` at `scripts/demo/seed-review.mjs:17`
- `USER_EMAIL = 'review@useatlascore.com'` at `scripts/demo/seed-review.mjs:18`

But when it creates the auth user, it uses `supabase.auth.admin.createUser(...)` at `scripts/demo/seed-review.mjs:680-690`, which returns a Supabase-generated UUID. The script never uses that returned UUID for downstream seeding.

It then seeds:
- `profiles.id = USER_ID` in `scripts/demo/seed-review.mjs:176-221`
- `subscriptions.user_id = USER_ID` in `scripts/demo/seed-review.mjs:225-234`

Those tables reference `auth.users(id)`:
- `supabase/migrations/001_create_profiles_subscriptions.sql:7-12`
- `supabase/migrations/001_create_profiles_subscriptions.sql:18-40`

Implication:
- On a fresh project, the script can create the auth user under one UUID and then try to seed app data under a different hardcoded UUID. That makes the seed stale/broken even if login later succeeds.

### 5. "Unconfirmed account" is unlikely from repo evidence

When the review script creates the auth user, it passes `email_confirm: true` at `scripts/demo/seed-review.mjs:680-684`.

Implication:
- If the review account was created by this script, lack of email confirmation is not the likely cause of login failure.

### 6. "Wrong environment" is not the default repo explanation

The repo-local project URL in `.env.local:3-4` points to `https://xrtqwdpczgdomqebmfkk.supabase.co`.
The review seed default URL is the same at `scripts/demo/seed-review.mjs:15`.

Implication:
- From repo context alone, the default target is the same environment, not a separate review/test project. Environment drift is still possible via exported env vars, but it is not the primary repo-level explanation.

## Most Likely Root Cause

From repo evidence only, the strongest explanation is:

1. `review@useatlascore.com` is not a durable seeded account.
2. It only exists if `scripts/demo/seed-review.mjs` was run manually with a service-role key exported.
3. Even if it exists, the script never refreshes the password for an existing user.

So the likely failure mode is one of:
- missing auth user,
- stale auth password on an existing user,
- or both.

Secondary issue:
- even a "successful" first-time run of `seed-review.mjs` is not trustworthy because the script seeds app data against a hardcoded UUID instead of the created auth UUID.

## Status By Hypothesis

- Missing account: likely.
- Stale password on existing account: plausible and directly supported by code.
- Another environment: possible, but not supported by default repo config.
- Unconfirmed account: unlikely if created by the review seed.
- Broken seed linkage / stale fixture design: confirmed by code.

## Evidence Index

- Login path: `src/lib/AuthContext.jsx:337-349`
- Review account definition: `scripts/demo/seed-review.mjs:15-23`
- Review auth-user handling: `scripts/demo/seed-review.mjs:666-704`
- Review hardcoded profile/subscription UUID usage: `scripts/demo/seed-review.mjs:176-234`
- Review password source: `scripts/demo/seed-review.mjs:680-684`
- Alex script robust auth update path: `scripts/demo/seed-alex.mjs:1652-1679`
- Package scripts present / absent: `package.json:20-25`
- Subscription/profile FK schema: `supabase/migrations/001_create_profiles_subscriptions.sql:7-40`
- Local project ref alignment: `.env.local:3-4`, `scripts/demo/seed-review.mjs:15`
