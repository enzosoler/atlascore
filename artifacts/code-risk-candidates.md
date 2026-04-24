# Code Risk Candidates

## Ranked candidates

1. Password reset callback routing is likely wrong.
   - `send-password-reset` points recovery links to `/auth/callback?mode=reset`.
   - [`supabase/functions/send-password-reset/index.ts`](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/supabase/functions/send-password-reset/index.ts:73)
   - `V3AuthCallback` ignores `mode=reset` and never routes to `/auth/reset`.
   - [`src/redesign/v3/routes/V3AuthCallback.jsx`](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v3/routes/V3AuthCallback.jsx:16)
   - Legacy fallback references still point at `/auth/update-password`.
   - [`supabase/functions/auth-webhook/index.ts`](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/supabase/functions/auth-webhook/index.ts:112)
   - [`src/lib/navigation/screen-registry.ts`](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/lib/navigation/screen-registry.ts:132)

2. `seed-review.mjs` can desynchronize auth user ID from seeded app data.
   - Hardcoded `USER_ID` plus `auth.admin.createUser()` generated UUIDs.
   - [`scripts/demo/seed-review.mjs`](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/scripts/demo/seed-review.mjs:17)

3. Auth mobile layout is fragile on iPhone.
   - Fixed `100dvh`, `overflow: hidden`, no scroll fallback, `autoFocus`, and signup password field marked as `current-password`.
   - [`src/redesign/v3/layouts/V3StandaloneLayout.jsx`](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v3/layouts/V3StandaloneLayout.jsx:76)
   - [`src/redesign/v3/screens/S36_Auth.jsx`](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v3/screens/S36_Auth.jsx:130)

4. `.env.example` is incomplete for production-like local validation.
   - Missing service-role and Stripe env documentation raises false-negative setup failures.
   - [`.env.example`](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/.env.example:1)

5. Protected-route intent is dropped after auth.
   - Guard code emits `next`, but login/callback ignore it.
   - [`src/components/rbac/RouteGuard.jsx`](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/components/rbac/RouteGuard.jsx:41)
   - [`src/hooks/useAuthGate.jsx`](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/hooks/useAuthGate.jsx:70)
   - [`src/redesign/v3/routes/V3AuthLogin.jsx`](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v3/routes/V3AuthLogin.jsx:59)
   - [`src/redesign/v3/routes/V3AuthCallback.jsx`](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v3/routes/V3AuthCallback.jsx:16)

6. Web billing flow depends on the user still having a valid session when returning to public `/webapp/success`.
   - `complete-checkout` revalidates auth and fails without a session.
   - [`src/redesign/v3/routes/V3WebPurchaseSuccess.jsx`](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v3/routes/V3WebPurchaseSuccess.jsx:14)
   - [`supabase/functions/complete-checkout/index.ts`](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/supabase/functions/complete-checkout/index.ts:53)
