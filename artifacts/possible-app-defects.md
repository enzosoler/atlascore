# Possible App Defects

## Fixed defect

### Password reset route mismatch

- The callback/reset route mismatch was patched and browser-validated in:
  - [`src/redesign/v3/routes/V3AuthCallback.jsx`](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v3/routes/V3AuthCallback.jsx:1)
  - [`src/App.jsx`](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/App.jsx:935)
  - [`supabase/functions/auth-webhook/index.ts`](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/supabase/functions/auth-webhook/index.ts:107)
  - [`src/lib/navigation/screen-registry.ts`](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/lib/navigation/screen-registry.ts:132)
  - [`e2e/auth-reset-routing.spec.ts`](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/e2e/auth-reset-routing.spec.ts:1)

Remaining implication:
- Full forgot-password remains blocked on real email/account validation, but the confirmed route bug is no longer open.

## Medium-confidence defects

### Review seed strategy is broken

- `seed-review.mjs` can create auth data and app data under different user IDs.
- It also does not refresh passwords for existing users.

### Mobile auth UX can fail under keyboard pressure

- The current auth layout may clip or hide lower controls on smaller iPhones because it is fixed-height and non-scrollable.

### Post-auth `next` intent is not restored

- Guard code emits a `next` parameter, but login and callback do not restore it after auth.

## Not yet proven as app defects

- Signup confirmation behavior itself. Current evidence shows a valid "needs email confirmation" state, but the repo has not proven whether the actual confirmation email delivery and return path work end to end.
- Reload persistence and logout/login. They are blocked by missing usable accounts, not yet confirmed broken in code.
