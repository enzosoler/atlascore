# Auth Risk Summary

## High-confidence blockers

- Signup confirmation is not currently end-to-end verifiable because the local environment lacks a service-role-backed admin confirmation path and no physical-email confirmation pass has been completed.
- No working seeded test account is available. Both `review` and `alex` login probes returned invalid credentials.
- Reload persistence, logout/login again, and first-login continuation therefore remain blocked rather than passed.

## Fixed in code, still pending live verification

- The reset-route mismatch was patched:
  - `/auth/callback?mode=reset` now redirects to `/auth/reset`
  - stale `/auth/update-password` links now redirect to `/auth/reset`
  - fallback references were updated to the canonical route
- Browser validation now exists in:
  - [`e2e/auth-reset-routing.spec.ts`](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/e2e/auth-reset-routing.spec.ts:1)

Remaining reset-flow risk:
- Full forgot-password -> email -> token-bearing callback -> password update -> login is still blocked on usable email delivery and a real account.

## Additional app risks

- Protected-route intent is likely dropped after auth.
  - Guard code emits a `next` destination.
  - [`src/components/rbac/RouteGuard.jsx`](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/rbac/RouteGuard.jsx:41)
  - [`src/hooks/useAuthGate.jsx`](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/hooks/useAuthGate.jsx:70)
  - Login and callback do not restore it; they only branch to onboarding/today/login.
  - [`src/redesign/v3/routes/V3AuthLogin.jsx`](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v3/routes/V3AuthLogin.jsx:59)
  - [`src/redesign/v3/routes/V3AuthCallback.jsx`](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v3/routes/V3AuthCallback.jsx:16)

## Secondary mobile-auth risks

- Native/dev auth layout is fixed to `100dvh` with `overflow: hidden`.
- Auth form has no internal scroll fallback.
- Signup password field uses `autoComplete="current-password"` rather than `new-password`.
- These are real iPhone UX risks, but current evidence still points to the same primary auth block as desktop.

See:
- [artifacts/mobile-auth-findings.md](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/artifacts/mobile-auth-findings.md:1)

## What must be proven next

1. Configure working test access:
   - service-role-backed auth/admin path
   - one valid verified account
2. Re-run:
   - signup -> confirmation -> first login
   - forgot password -> reset -> login
   - reload persistence
   - logout -> login again
3. Re-run the full reset flow with a real recovery email to confirm the token-bearing path works end to end.
