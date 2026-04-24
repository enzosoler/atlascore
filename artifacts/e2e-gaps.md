# E2E Gaps

## Main gaps

- Auth coverage is buried inside a single monolithic loop spec, making failures hard to localize.
- Password reset request still lacks live email validation.
- Password reset route/callback wiring is now directly covered by `e2e/auth-reset-routing.spec.ts`, but end-to-end reset via real recovery email is still not covered.
- Logout -> login again is not directly covered.
- Billing portal and live web checkout are not directly covered.
- Login persistence is only inferred from same-context reload, not proven from a clean lifecycle-focused spec.

## Smallest useful additions

- `e2e/auth-signup-confirmation.spec.ts`
- `e2e/auth-reset-password.spec.ts`
- `e2e/auth-session.spec.ts`
- `e2e/web-billing.spec.ts`

## Release implication

Unverified flows remain launch blockers even if contract tests are green.
