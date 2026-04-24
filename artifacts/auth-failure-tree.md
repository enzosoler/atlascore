# Auth Failure Tree

## 1. Why does signup stop at email confirmation?

### Observed state

- After submit, signup remains on `/auth/signup` and shows: "Check your inbox and confirm your email, then come back and sign in."
- Evidence:
  - [error-context.md](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/test-results/loop-integrity-Real-user-l-2e205----Today---actions---reload-iphone-14/error-context.md:1)
  - [V3AuthSignup.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v3/routes/V3AuthSignup.jsx:45)

### Branches

1. Supabase returned `user` without `session`.
   - `V3AuthSignup` treats that as `needsEmailConfirmation`.
   - [`src/lib/AuthContext.jsx`](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/lib/AuthContext.jsx:362)
   - Confidence: high.

2. Test automation cannot complete confirmation fallback.
   - `e2e/loop-integrity.spec.ts` tries to confirm the user through admin APIs and fails when `SUPABASE_SERVICE_ROLE_KEY` is absent.
   - [`e2e/loop-integrity.spec.ts`](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/e2e/loop-integrity.spec.ts:30)
   - Confidence: high.

3. This could still hide a confirmation email delivery problem.
   - `auth-webhook` and `send-password-reset` both depend on server secrets and email infra.
   - [`supabase/functions/auth-webhook/index.ts`](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/supabase/functions/auth-webhook/index.ts:24)
   - Confidence: medium until live email delivery is tested.

## 2. Why is forgot password still blocked?

### Environment blocker

- Password-reset email generation relies on `send-password-reset`, which uses `SUPABASE_SERVICE_ROLE_KEY` server-side.
- [`supabase/functions/send-password-reset/index.ts`](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/supabase/functions/send-password-reset/index.ts:18)

### App-code risk

- Recovery links redirect to `/auth/callback?mode=reset`.
- [`supabase/functions/send-password-reset/index.ts`](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/supabase/functions/send-password-reset/index.ts:73)
- The callback route does not branch on `mode=reset`; it redirects authenticated users to onboarding/today and unauthenticated users to login.
- [`src/redesign/v3/routes/V3AuthCallback.jsx`](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v3/routes/V3AuthCallback.jsx:16)
- `/auth/reset` exists, but nothing in the callback path routes there.
- [`src/App.jsx`](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/App.jsx:935)

Conclusion:
- Password reset is not merely unverified. There is a strong code-level risk that the current redirect wiring is wrong even after environment setup is fixed.

## 3. Why are login, reload persistence, and logout/login blocked?

1. No working seeded or known-good account was available.
   - `review@useatlascore.com` failed login.
   - `inbox+alex@enzosoler.com` also failed login in local probe.
   - Test-account findings: [artifacts/test-account-audit.md](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/artifacts/test-account-audit.md:1)

2. The review seed path is structurally unreliable.
   - `seed-review.mjs` does not reset existing passwords and hardcodes a user ID that can diverge from the created auth user.
   - [`scripts/demo/seed-review.mjs`](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/scripts/demo/seed-review.mjs:17)

3. Without a valid user session, reload persistence and logout/login cannot be truthfully marked pass.

## Root-cause split

- Environment / access blockers:
  - no configured local service-role key
  - no verified working test account
  - no live confirmation/reset email validation
- Likely app defect:
  - password reset callback flow likely routes to the wrong screen
