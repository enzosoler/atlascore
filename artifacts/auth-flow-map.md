# Auth Flow Map

## Scope

This maps the current repo auth lifecycle: signup, confirmation, first login, forgot password, reset, logout, subsequent login, and reload persistence.

## Current flow map

| Flow | Entry point | Core path | Expected next state | Current launch status |
| --- | --- | --- | --- | --- |
| Signup | [`src/redesign/v3/routes/V3AuthSignup.jsx`](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v3/routes/V3AuthSignup.jsx:24) | `signUp()` in [`src/lib/AuthContext.jsx`](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/lib/AuthContext.jsx:351) calls `supabase.auth.signUp()` | If Supabase returns `user + session`, navigate to `/onboarding` or `/app/today`; otherwise stay on signup and show confirmation hint | `BLOCKED` by email confirmation / unverified first-login continuation |
| Email confirmation | Supabase email link -> `/auth/callback` | Browser client uses `detectSessionInUrl: true` in [`src/lib/supabaseClient.js`](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/lib/supabaseClient.js:18); callback UI in [`src/redesign/v3/routes/V3AuthCallback.jsx`](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v3/routes/V3AuthCallback.jsx:8) waits for auth state | Authenticated user goes to `/onboarding` or `/app/today` | `BLOCKED` in this environment; no service-role-backed verification path available for test automation |
| First login | [`src/redesign/v3/routes/V3AuthLogin.jsx`](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v3/routes/V3AuthLogin.jsx:39) | `signIn()` in [`src/lib/AuthContext.jsx`](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/lib/AuthContext.jsx:337) -> `supabase.auth.signInWithPassword()` -> profile fetch -> navigate | `/onboarding` or `/app/today` | `BLOCKED`; no known-good account available, `review` and `alex` both returned invalid credentials |
| Forgot password request | [`src/redesign/v3/routes/V3ForgotPassword.jsx`](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v3/routes/V3ForgotPassword.jsx:192) | Calls [`src/lib/emailService.js`](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/lib/emailService.js:82) -> `send-password-reset` edge function | User receives branded reset email | `BLOCKED`; depends on deployed service-role-backed edge function and email delivery |
| Password reset completion | Reset email link -> `/auth/callback?mode=reset` today | `send-password-reset` generates recovery link with `redirectTo=${APP_URL}/auth/callback?mode=reset` in [`supabase/functions/send-password-reset/index.ts`](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/supabase/functions/send-password-reset/index.ts:71) | Should land on reset form, set new password, then return to login | `FAIL RISK`; callback route does not handle `mode=reset` and currently redirects authenticated users to onboarding/today instead of `/auth/reset` |
| Logout | `logout()` consumers such as billing/account pages | [`src/lib/AuthContext.jsx`](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/lib/AuthContext.jsx:372) clears client state, signs out, then hard redirects to home route | User leaves authenticated area and must log in again | `NOT VERIFIED`; no valid account path available |
| Subsequent login | Same as first login | Password login path above | `/app/today` or `/onboarding` | `BLOCKED`; same account-access problem |
| Reload persistence | App boot + `checkAppState()` | [`src/lib/AuthContext.jsx`](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/lib/AuthContext.jsx:219) calls `supabase.auth.getSession()`, then resolves profile and user state | Stays logged in if session is valid | `NOT VERIFIED`; automation could not reach a stable logged-in session |

## Observed evidence

- The captured signup failure on iPhone stayed on `/auth/signup` and showed the confirmation hint instead of advancing. See:
  - [error-context.md](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/test-results/loop-integrity-Real-user-l-2e205----Today---actions---reload-iphone-14/error-context.md:1)
  - [test-failed-1.png](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/test-results/loop-integrity-Real-user-l-2e205----Today---actions---reload-iphone-14/test-failed-1.png)
- The loop-integrity spec confirms the automation fallback requires `SUPABASE_SERVICE_ROLE_KEY` for confirmation/admin flows:
  - [`e2e/loop-integrity.spec.ts`](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/e2e/loop-integrity.spec.ts:30)
- The local environment has public Supabase vars but no local service-role key entry:
  - [`.env.local`](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/.env.local:1)

## Confidence

- Signup confirmation block as shared desktop/mobile auth behavior: high.
- Password-reset redirect defect risk: high.
- Reload persistence and logout/login behavior: low confidence because they are not currently proven with a working account.
