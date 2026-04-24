# E2E Artifact Guide

## Current weakness

- In [`playwright.config.ts`](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/playwright.config.ts:11), `trace: 'on-first-retry'` plus local `retries: 0` means most local failures keep no trace.

## Recommended minimum improvements

- Change Playwright trace policy to `retain-on-failure`.
- Attach shared failure artifacts for:
  - console errors
  - `pageerror`
  - `requestfailed`
  - HTTP responses `>= 400`
- Use `test.step()` in `loop-integrity.spec.ts` if it stays monolithic.
- Prefer `storageState`-backed helpers for authenticated follow-up specs instead of pre-logged assumptions.

## Why this matters

Current failures are too ambiguous for launch gating. The output needs to immediately tell whether the problem is auth setup, redirect handling, email delivery, or app logic.
