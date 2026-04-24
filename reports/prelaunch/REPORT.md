# Atlas Core Prelaunch Report

## Summary

- Gate date: 2026-03-20 (America/Sao_Paulo)
- Commit: 51c3740 (fix/security-rls-entitlements)
- Decision: **NO_GO**
- Default locale: en-US
- Supported locales: en-US

## Plan and detected commands

1. Detect stack and runnable commands from package.json and the repo layout.
2. Execute local baseline commands: lint, typecheck, build, and unit tests.
3. Audit i18n coverage, locale negotiation, and formatting behavior.
4. Record that the retired TBBM catalog module is missing and block that gate explicitly.
5. Summarize P0/P1 findings and emit launch-readiness artifacts.

- Package manager: npm
- Build: npm run build
- Lint: npm run lint
- Typecheck: npm run typecheck
- Unit: npm test
- Integration: npm run prelaunch
- E2E: npm run test:e2e

## P0 findings

- Functional: BLOCKED — An E2E command is configured, but no staging smoke run was executed in this pass, so critical auth and billing flows remain unproven end-to-end.
- Security: PASS — RLS policies and runtime security headers were both detected.
- Localization & i18n: PASS — Locale normalization, Accept-Language negotiation, fallback behavior, and translation coverage passed automated checks.
- Accessibility: BLOCKED — No automated a11y audit or keyboard-navigation smoke test is configured for critical flows.
- TBBM: BLOCKED — TBBM catalog validation is blocked because the shared/tbbm module is no longer present in the repo.

## P1 findings

- Baseline & Inventory: PASS — Stack, commands, commit, env references, locale catalog, and TBBM inventory were detected locally.
- Performance: FAIL — Largest build asset is 1625.08 KiB, above the 500 KiB warning threshold.
- UX: BLOCKED — Loading, empty, error, and recovery states were not manually validated in staging during this run.
- Compliance: BLOCKED — The repo has account deletion functionality but no complete policy/consent audit or launch evidence for LGPD sign-off.
- Observability & Operation: FAIL — A launch runbook exists, but trace_id correlation is not consistently present in the repo.
- Tooling Baseline: PASS — Local lint, typecheck, build, and unit test commands were executed to establish a release baseline.

## Execution logs

### lint
- command: `npm run lint`
- exit_code: 0
```text
> atlas-core@0.0.0 lint
> eslint . --quiet
```

### typecheck
- command: `npm run typecheck`
- exit_code: 0
```text
> atlas-core@0.0.0 typecheck
> tsc -p ./jsconfig.json
```

### build
- command: `npm run build`
- exit_code: 0
```text
> atlas-core@0.0.0 build
> vite build

vite v6.4.1 building for production...
transforming...
✓ 2349 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                                         8.00 kB │ gzip:   2.75 kB
dist/assets/index-BnudDgty.css                        198.96 kB │ gzip:  31.57 kB
dist/assets/V3Landing-uwID7L_k.js                       0.14 kB │ gzip:   0.14 kB
dist/assets/V3Watch-BgmD5NmF.js                         0.17 kB │ gzip:   0.16 kB
dist/assets/V3Errors-CU-jm_3n.js                        0.18 kB │ gzip:   0.17 kB
dist/assets/V3EmptyStates-CeZRdk-Z.js                   0.20 kB │ gzip:   0.18 kB
dist/assets/V3Notifications-C1w09vdB.js                 0.20 kB │ gzip:   0.19 kB
dist/assets/platformRoutes-BVd_nVQY.js                  0.22 kB │ gzip:   0.14 kB
dist/assets/V3TodayDose-DLIgGmAI.js                     0.23 kB │ gzip:   0.21 kB
dist/assets/V3ProtocolTimeline-DXOMHgGi.js              0.24 kB │ gzip:   0.21 kB
dist/assets/V3WeightTrend-CXC2K9Ww.js                   0.25 kB │ gzip:   0.22 kB
dist/assets/V3Crew-CQiR614r.js                          0.26 kB │ gzip:   0.23 kB
dist/assets/V3LogDose-DCARspXT.js                  ...
```

### unit
- command: `npm test`
- exit_code: 0
```text
> atlas-core@0.0.0 test
> node --test tests/prelaunch/*.test.mjs

✔ writeSubscriptionByUserId inserts when the user has no subscription row (1.456916ms)
✔ writeSubscriptionByUserId updates the newest row for the user without relying on UNIQUE(user_id) (0.120792ms)
✔ writeSubscriptionByUserId prefers stripe_subscription_id replays over latest-by-user updates (0.106458ms)
✔ writeSubscriptionByUserId deactivates competing current rows for the same user (0.1045ms)
✔ billing service still creates checkout, returns success, and confirms checkout through the current functions (0.179792ms)
✔ billingService success_url contains {CHECKOUT_SESSION_ID} (0.796125ms)
✔ billingService success_url points at /webapp/success (0.159833ms)
✔ V3WebPurchaseSuccess reads session_id and calls completeWebCheckout (0.116166ms)
✔ create-checkout fallback URLs use current web billing routes (0.458084ms)
✔ create-checkout resolves redirect origins through a server allowlist (0.155667ms)
✔ create-customer-portal resolves return_url through a server allowlist (0.368084ms)
✔ useCustomerPortal sends the same auth header required by create-customer-portal (0.10525ms)
✔ returns 503 when Stripe is not configured (81....
```

## Evidence highlights

- i18n samples: `{"negotiation_fr":"en-US","negotiation_en":"en-US","fallback_frFR":["en-US"],"fallback_frCA":["en-US"],"currency_fallback":"$123.45","currency_enUS":"$123.45"}`
- TBBM coverage: `blocked (shared/tbbm missing)`
- Top asset: `dist/assets/index-YlsqrBFn.js (1625.08 KiB)`
- Changed files observed: `M .env.example`, `M CLAUDE.md`, `M docs/email-rebuild/email-approval-preview.html`, `M e2e/helpers/auth.ts`, `M eslint.config.js`, `M jsconfig.json`, `M package.json`, `M scripts/prelaunch/run.mjs`, `M src/App.jsx`, `M src/components/ErrorBoundary.jsx`, `M src/components/NavigationV2.jsx`, `M src/components/admin/AdminLayoutV2.jsx`, `M src/components/ai/AITodayInsightV2.jsx`, `M src/components/ai/CoachChatSheetV2.jsx`, `M src/components/body/BodyCheckinSheetV2.jsx`, `M src/components/dashboard/DecisionEngineDashboard.jsx`, `M src/components/layout/AppLayoutV2.jsx`, `M src/components/nutrition/NutritionTrackerV2.jsx`, `M src/components/onboarding/SmartOnboarding.jsx`, `M src/components/shared/DataState.jsx`, `M src/components/shared/StablePage.jsx`, `M src/components/social/EnhancedShareModal.jsx`, `M src/components/social/ShareFlow.jsx`, `M src/components/social/ShareableProofCards.jsx`, `M src/components/system/MilestoneSystem.jsx`, `M src/components/system/StartFreshModal.jsx`, `M src/components/today/DailyHeroCard.jsx`, `M src/components/today/WeeklyReview.jsx`, `M src/hooks/useCustomerPortal.js`, `M src/lib/navigation/screen-registry.ts`, `M src/lib/register-sw.js`, `M src/redesign/v3/routes/V3AuthCallback.jsx`, `M src/redesign/v3/screens/S73_Focus_Mode.jsx`, `M supabase/.temp/cli-latest`, `M supabase/.temp/storage-migration`, `M supabase/.temp/storage-version`, `M supabase/config.toml`, `M supabase/functions/_shared/templates.ts`, `M supabase/functions/auth-webhook/index.ts`, `M supabase/functions/complete-checkout/index.ts`, `M supabase/functions/create-checkout/index.ts`, `M supabase/functions/create-customer-portal/index.ts`, `M supabase/functions/revenuecat-webhook/index.ts`, `M supabase/functions/send-email/index.ts`, `M supabase/functions/send-password-reset/index.ts`, `M supabase/functions/send-test-emails/index.ts`, `M supabase/functions/stripe-webhook/index.ts`, `M tests/prelaunch/checkout-url.test.mjs`, `?? .agents/skills/stripe-best-practices/`, `?? .agents/skills/stripe-projects/`, `?? .agents/skills/upgrade-stripe/`, `?? .claude/skills/stripe-best-practices`, `?? .claude/skills/stripe-projects`, `?? .claude/skills/upgrade-stripe`, `?? .windsurf/`, `?? artifacts/`, `?? docs/email-rebuild/chat-summary.md`, `?? docs/email-system/`, `?? docs/runbooks/`, `?? e2e/auth-recovery-link.spec.ts`, `?? e2e/auth-reset-routing.spec.ts`, `?? e2e/auth-reset.spec.ts`, `?? e2e/auth-session.spec.ts`, `?? e2e/billing-entry.spec.ts`, `?? e2e/billing-post-purchase-sync.spec.ts`, `?? e2e/iphone-billing-smoke.spec.ts`, `?? reports/`, `?? scripts/demo/ensure-e2e-user.mjs`, `?? scripts/demo/simulate-web-billing-activation.mjs`, `?? scripts/email/`, `?? scripts/env/`, `?? skills-lock.json`, `?? supabase/functions/_shared/email-components.js`, `?? supabase/functions/_shared/email-renderer.js`, `?? supabase/functions/_shared/email-templates.js`, `?? supabase/functions/_shared/email-tokens.js`, `?? supabase/functions/_shared/subscription-write.js`, `?? supabase/migrations/20260423152000_fix_subscription_write_conflict_target.sql`, `?? supabase/migrations/20260423215446_add_missing_trial_ends_at_to_subscriptions.sql`, `?? supabase/migrations/20260423223000_align_subscriptions_runtime_schema.sql`, `?? supabase/migrations/20260424010000_security_rls_entitlements.sql`, `?? tests/prelaunch/billing-subscription-write.test.mjs`, `?? tests/prelaunch/complete-checkout.test.mjs`, `?? tests/prelaunch/send-password-reset.test.mjs`

## Risks

- RISK-001 (P0): No staging smoke or E2E verification for critical auth and persistence flows — Add a staging seed plus Playwright smoke coverage for signup/login/logout/reset and refresh persistence.
- RISK-002 (P0): Security-header baseline is incomplete — Add CSP and related response-header enforcement, then validate in staging.
- RISK-003 (P1): Bundle size regression on the main client chunk — Split the 2.5+ MiB client bundle and add bundle budgets to CI.
- RISK-004 (P0): Accessibility gate is missing — Add automated axe/keyboard checks on critical routes before launch.
- RISK-005 (P1): Legacy auth/email compatibility paths still exist alongside the canonical webhook — Retire the old auth/email wrappers after production confirms auth-webhook is the sole owner of signup, confirmation, and reset flows.

## Final decision

**NO_GO**

Reason: 3 P0 area(s) are not ready: Functional, Accessibility, TBBM.
