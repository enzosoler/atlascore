# atlas.core — MVP Release Readiness Report

**Date:** 2026-04-24
**Branch:** `fix/security-rls-entitlements`
**Latest commit:** `e781085` — *Checkpoint deployed runtime setup*
**Target:** iOS (Capacitor → App Store) per user direction
**Reviewer:** release-readiness pass (no submission, no deploy)

---

## Verdict

# **NO_GO** for App Store submission today.

CONDITIONAL_GO is reachable in 1–2 working sessions if the launch-blockers
listed in §3 are resolved. Several yesterday's NO_GO blockers have moved —
including a meaningful bundle-size win (1625 KB → 787 KB on the largest chunk)
— but **new evidence from today's Playwright runs shows fresh launch-blocking
failures on the iPhone-14 viewport that are not yet reflected in your verbal
QA summary.**

---

## 1. What I actually executed

| # | Action | Result |
|---|---|---|
| 1 | Read `CLAUDE.md`, `reports/prelaunch/REPORT.md`, `artifacts/go-no-go.md`, `artifacts/release-gates.md` | All loaded. |
| 2 | Decoded `playwright-report/index.html` (run from 21:45 today) | 1 unexpected, 2 expected, 2 skipped. Failure parsed below. |
| 3 | Inspected `test-results/` (run from 22:10 today) | 1 additional failure on iPhone-14 keyboard a11y. |
| 4 | Audited `.env.local` keys + redacted contents | Stripe/RevenueCat keys not present locally — by design (Supabase Edge secrets / Vercel envs). |
| 5 | Scanned `dist/assets/*.js` for leaked test/dev keys | No `sk_test_`, `pk_test_`, `sk_live_`, or `pk_live_` strings found. |
| 6 | Confirmed prod Supabase URL baked into bundle | `https://xrtqwdpczgdomqebmfkk.supabase.co` ✓ |
| 7 | Confirmed `dist/index.html` build time | 2026-04-24 21:54 UTC (today, on user's Mac). |
| 8 | Compared `dist/index.html` vs `ios/App/App/public/index.html` | **iOS bundle is ~2 hours stale (19:56) — Capacitor sync was not run after the last build.** |
| 9 | Read `ios/App/App/Info.plist` and `App.entitlements` | Multiple entitlement issues — see §3. |
| 10 | Computed full bundle size (raw + gzip) | 2.92 MiB raw / 0.89 MiB gzipped JS + 194 KiB CSS. Largest chunk 787 KiB raw / 240 KiB gz. |
| 11 | Verified previous `npm test` + `npx vite build` from prelaunch report | Both PASS (build 0 exit, all unit tests green). |

### What I deliberately did **not** do
- Did **not** run `npx vite build` in this sandbox. The Linux sandbox uses a
  different platform than your Mac and the cached `node_modules` only has
  `darwin-arm64` rollup binaries. Mutating `node_modules` to install Linux
  binaries would pollute your install. Your most recent local build (21:54)
  is therefore the artifact under review.
- Did **not** run `npx cap sync ios`. Same reason; this needs to run on your Mac.
- Did **not** archive an iOS build, upload to App Store Connect, capture device
  screenshots, or deploy to Vercel. None are possible from this environment.

---

## 2. CLAUDE.md NO_GO blockers — reconciled against today's evidence

| Yesterday's blocker | Status today | Evidence |
|---|---|---|
| Signup → confirmation → first login | **UNVERIFIED** | No new evidence file. `e2e/loop-integrity.spec.ts` exists; user said "auth/session/reset passed" but no committed report shows the green run. |
| Login | **PARTIAL PASS** | `loginAs()` succeeded in today's Playwright run (the failed `/app/workouts` test got past login first). |
| Forgot password | **UNVERIFIED** | `e2e/auth-recovery-link.spec.ts`, `auth-reset.spec.ts`, `auth-reset-routing.spec.ts` exist (modified today). No archived run output. |
| Checkout entry/completion | **UNVERIFIED** | Unit tests `tests/prelaunch/checkout-url.test.mjs`, `complete-checkout.test.mjs` were green per yesterday's prelaunch. No live Stripe smoke evidence today. |
| Billing portal | **UNVERIFIED** | Same as checkout — code path exists; no live verification. |
| Reload / session persistence | **UNVERIFIED** | `e2e/auth-session.spec.ts` was modified today but no archived run output. |
| Accessibility gate | **PARTIAL FAIL** | Keyboard-smoke tests now exist in `e2e/mvp-release-audit.spec.ts`. **Today's run shows the keyboard test on `/app/today` fails on iPhone-14.** Not "non-blocking." |
| Bundle size | **MUCH IMPROVED** | Largest chunk went 1625 KiB → 787 KiB (52% reduction). Total JS 2.92 MiB raw / 0.89 MiB gzipped. Still above Vite's 500 KiB warning, but acceptable for an MVP. |

---

## 3. NEW launch-blockers found today (not in yesterday's CLAUDE.md)

### 3.1 — `/app/workouts` bounces to `/auth/login` on iPhone-14 (CRITICAL)

**Source of truth:** `playwright-report/index.html` decoded, run at 2026-04-24 21:45 UTC.
- `mvp-release-audit.spec.ts > authenticated route sweep > authed route renders: /app/workouts` — **unexpected (failed)** on `iphone-14` project.
- `/app/today` and `/app/weekly` from the same logged-in session both **passed**.
- Tests are configured `serial`, so `/app/routines` and `/app/nutrition` were skipped after the failure.

**Failure screenshot (`playwright-report/data/511148a171708c93eec06c1fc7c3c24bad777337.png`)
shows the magic-link login screen — meaning the test was bounced back to
`/auth/login` when navigating to `/app/workouts`.** Test duration was 11.3 s,
which is consistent with the route guard timing out the
`expect(page).not.toHaveURL(/\/auth\/login/i, { timeout: 10_000 })` assertion.

This is **not** a keyboard a11y issue. It is a real session-loss-on-route-change
defect on the exact viewport you are shipping to. **Workouts is one of the four
tabs you must show in your store screenshots.** Submitting with this defect
risks both bad first impressions and an Apple reviewer rejection if they tap
through the tabs.

**Recommended next step:** reproduce on the user's Mac with iPhone-14 viewport,
isolate whether the bounce is caused by the route guard, the workouts loader's
RLS query, or `installAuditors`'s captured network failures, then patch.

### 3.2 — `aps-environment = development` in entitlements

**Source:** `ios/App/App/App.entitlements`
```xml
<key>aps-environment</key>
<string>development</string>
```
Apple **requires** `production` for App Store builds. Push notifications will
not work in production with this value, and the App Store may reject the
binary or silently drop your APNs tokens.

### 3.3 — Stray third-party app groups in entitlements

**Source:** `ios/App/App/App.entitlements`
```xml
<key>com.apple.security.application-groups</key>
<array>
  <string>group.CY-0D901D06-CB9F-11E6-B9BF-4725D42B7718.snapchat.picaboo</string>
  <string>group.com.atlascore.app</string>
  <string>group.com.rileytestut.AltStore.545KQXEK7J</string>
  <string>group.com.rileytestut.Clip.545KQXEK7J</string>
</array>
```
Snapchat and AltStore groups are leftovers from the developer Mac's profile.
**Apple will reject any app declaring app-groups that do not belong to the
developer's Team ID.** Remove all but `group.com.atlascore.app`.

### 3.4 — iOS web bundle is stale (`public/` is older than `dist/`)

```
dist/index.html              2026-04-24 21:54 UTC
ios/App/App/public/index.html 2026-04-24 19:56 UTC   ← almost 2 hours behind
```
If you archive iOS now, the App Store gets a 2-hour-old bundle that does not
include any of the most recent code or fixes. Your CLAUDE.md §"Build & Deploy"
says this is non-negotiable. **Run `npx cap sync ios` immediately before any
archive.**

### 3.5 — Working tree is dirty on a non-main branch

- Branch: `fix/security-rls-entitlements` (not `main`)
- Modified, uncommitted files (14):
  `e2e/auth-session.spec.ts`, `e2e/billing-entry.spec.ts`,
  `e2e/checkpoint.spec.ts`, `e2e/helpers/auth.ts`,
  `e2e/mvp-release-audit.spec.ts`, `playwright.global-setup.ts`,
  `src/components/ErrorBoundary.jsx`, `src/lib/SubscriptionContext.jsx`,
  `src/redesign/v3/routes/V3MagicLinkSent.jsx`,
  `src/redesign/v3/screens/S17_Measurements_Entry.jsx`,
  `src/routes/app/MeasurementsRoute.jsx`,
  `src/services/billingService.js`,
  `supabase/functions/_shared/email-templates.js`,
  `supabase/functions/auth-webhook/index.ts`,
  `supabase/functions/send-test-emails/index.ts`

You must not ship from a dirty branch. Either commit/discard, then merge to
`main` and tag a release commit before archiving.

### 3.6 — `MARKETING_VERSION = 1.0` / `CURRENT_PROJECT_VERSION = 21`

`1.0 (21)` is fine for a first MVP, but build number 21 implies you have
already used 1‑20 for TestFlight uploads. Make sure App Store Connect does not
have a previously-uploaded `1.0 (21)` — uploads must be monotonically
increasing per marketing version.

---

## 4. Cleanups that should happen before archive (non-blocking, but visible)

- **`ios/App/App/config 2.xml` … `config 21.xml`** — 21 numbered duplicate
  Capacitor config files. They look like Finder copy-paste accidents. Confirm
  only `config.xml` is loaded by Capacitor and remove the duplicates.
- **`ios/debug.xcconfig` has `CAPACITOR_DEBUG = true`** — verify this is
  scoped to the Debug build configuration only and not inherited by Release.
- **`docs/email-rebuild/` and `docs/email-system/`** still referenced in
  CLAUDE.md as the source of truth — make sure approval preview still
  matches the live `supabase/functions/_shared/templates.ts`.

---

## 5. Production env audit

`.env.local` (used for local builds) contains, in live (uncommented) form:

```
VERCEL_OIDC_TOKEN
VITE_ENABLE_PRO_ROUTES
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_SUPABASE_URL          → https://xrtqwdpczgdomqebmfkk.supabase.co
VITE_POSTHOG_KEY
VITE_POSTHOG_HOST
VITE_SENTRY_DSN
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
GOOGLE_GEMINI_API_KEY
```

✓ No live Stripe test keys (only commented placeholders).
✓ No `localhost` baked into client bundles (vendor-supabase has lib defaults; harmless).
✓ Production Supabase URL appears in `dist/assets/*.js`.
✓ No `sk_test_*` / `sk_live_*` / `pk_test_*` / `pk_live_*` strings in built JS.

⚠ `VITE_STRIPE_PUBLISHABLE_KEY` is **not** set locally. For iOS this is fine
(billing is RevenueCat). For web it would be needed for a Stripe-rendered
paywall. If the web paywall is currently broken, this is why.

⚠ `VITE_REVENUECAT_IOS_KEY` is referenced in `prelaunch` env-refs but **not**
present in your `.env.local`. Verify it is set in your Vercel build env so
that the bundle that ships with iOS contains it. If missing, native purchase
flow on iOS will silently break.

---

## 6. Bundle size analysis

| Metric | Value | Verdict |
|---|---|---|
| Total JS (raw) | 2.92 MiB | Acceptable for MVP |
| Total JS (gzip) | 0.89 MiB | Acceptable |
| CSS | 194 KiB raw / ~32 KiB gz | Good |
| Largest chunk (`index-Bt3EGbwy.js`) | 787 KiB raw / 240 KiB gz | Was 1625 KiB yesterday — 52% reduction. Still above Vite's 500 KiB warning. |
| Number of code-split chunks | 186 JS files | Healthy code-splitting |
| Top vendors | export 198 KB, posthog 173 KB, supabase 173 KB, react 145 KB | Reasonable |

**Verdict:** `Performance: FAIL` from yesterday's prelaunch report should
downgrade to `WARN`. Not blocking submission.

---

## 7. Submission risks (Apple-specific) before App Store Connect upload

| Risk | Severity | Mitigation |
|---|---|---|
| Stale `ios/App/App/public/` from before latest build | **High** | Run `npm run build && npx cap sync ios` immediately before Archive. |
| `aps-environment = development` | **High (likely reject)** | Switch to `production` (Xcode → Signing & Capabilities → Push Notifications). |
| Foreign app groups in entitlements | **High (likely reject)** | Remove Snapchat + AltStore groups; keep only `group.com.atlascore.app`. |
| `/app/workouts` 401-bouncing on mobile | **High** | Reproduce locally, fix, re-run iphone-14 sweep. Without a fix, the Workouts tab is non-functional for users and reviewers. |
| Keyboard a11y on `/app/today` (iphone-14) | Medium | Add visible focus order; not a hard reject but degrades VoiceOver UX. |
| Privacy nutrition labels in App Store Connect | Medium | Make sure HealthKit + Camera + Microphone + Location + Photos disclosures match Info.plist. |
| Account Deletion (App Store policy) | Medium | You have `self-delete-user` edge function — confirm the in-app flow points at it and is reachable without contacting support. |
| Sign in with Apple | Medium | Info.plist Apple-Sign-In capability not yet inspected. Verify present (Apple requires SIWA if you offer any third-party login like Google). |

---

## 8. What I will need from you to push this from NO_GO → CONDITIONAL_GO

On your Mac, in the repo folder:

```bash
# 1. Reproduce the workouts route bounce (so we can fix it)
npx playwright test e2e/mvp-release-audit.spec.ts --project=iphone-14 \
  -g "authed route renders: /app/workouts" --headed --timeout 30000

# 2. After fix, re-run mobile sweep
npx playwright test e2e/mvp-release-audit.spec.ts --project=iphone-14

# 3. Build + sync
npm run build
npx cap sync ios

# 4. In Xcode (App.xcworkspace):
#    - Signing & Capabilities → Push Notifications → set environment to Production
#    - Signing & Capabilities → App Groups → keep only group.com.atlascore.app
#    - Verify MARKETING_VERSION 1.0 / CURRENT_PROJECT_VERSION 21 is unused on App Store Connect
#    - Product → Archive
```

I cannot do any of those four steps from this environment.

---

## 9. Store-listing assets — checklist (not generated)

Per your direction "do not fake screenshots", I have produced no screenshots
or copy. When you are ready:

- App icon source files exist at `dist/branding/v3/app-icon/` in
  ink/paper/accent variants, sizes 180/192/256/512/1024. Confirm the
  `Assets.xcassets/AppIcon.appiconset/` set in iOS matches the variant you
  intend to ship.
- Required iOS screenshot sizes:
  6.7" (iPhone 15 Pro Max) — 1290×2796
  6.5" (iPhone 11 Pro Max) — 1284×2778 *(may be derived)*
  5.5" (iPhone 8 Plus) — 1242×2208 *(if still required by Apple — check)*
  iPad 12.9" — 2048×2732 *(only if you ship iPad)*
- Required screenshots — at minimum: Today, Workouts, Nutrition, Body, Coach.
- App description (short + long) — to be drafted from your existing marketing
  copy in `src/i18n/messages/en.json` once it is verified clean.
- Keywords — ASO research not done in this session.

---

## 10. UNVERIFIED items (cannot be checked from this environment)

- Live signup → email confirmation → first login (needs real inbox).
- Live forgot-password email round-trip (needs real inbox).
- Live Stripe checkout completion (needs deployed Stripe + Supabase secrets, real card).
- Live billing portal open (same).
- Reload-persistence on a real device with backgrounding.
- Sentry actually receiving errors in production (needs a deliberate test error).
- PostHog event ingest in production (needs a deliberate event).
- Apple Health read/write actually working on a real device.
- Any RevenueCat-side configuration for products / entitlements.

These should each be a one-line ✅ in the next pass.

---

## 11. Risks if you submit anyway today

1. **Apple rejection on entitlements** — the Snapchat/AltStore app groups
   alone will likely cause Resolution Center to bounce the binary back.
2. **Functional regression visible to reviewer** — when the reviewer taps
   Workouts after logging in, they may see the same auth bounce we observed
   on iPhone-14. That is a 4.0 / 2.1 rejection class.
3. **Push notifications silently broken** in production due to development
   APNs environment.
4. **Stale web bundle** — even if Apple approves, the v1.0 (21) build will
   not have the latest fixes the user pushed in commits `e781085`/`a36cbfe`.

---

## Final status

- **Build:** PASS (your local 21:54 build, exit 0 per yesterday's prelaunch and visually verified in `dist/`).
- **Unit tests:** PASS (per latest prelaunch run, all green).
- **Lint / typecheck:** PASS (per latest prelaunch run).
- **Mobile route sweep (iphone-14):** **FAIL** — `/app/workouts` 401-bounces.
- **Mobile keyboard a11y (iphone-14):** **FAIL** — `/app/today` does not reach a focusable control.
- **iOS entitlements:** **FAIL** — dev APNs + foreign app groups.
- **iOS bundle freshness:** **STALE** — `cap sync` not run after latest build.
- **Branch state:** **DIRTY** — 14 modified files on a feature branch.
- **Bundle size:** WARN — improved 52% but still above 500 KiB threshold.
- **Live verification of auth/billing flows:** **UNVERIFIED**.

**Decision: NO_GO for App Store submission.**
**Path to GO: §3 fixes + §8 rebuild/sync + the four UNVERIFIED live smokes in §10.**
