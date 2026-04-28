# Atlas Core Release Readiness Report — Build 118 (Resubmission)

**Date:** 2026-04-28
**Build:** 1.0 (118) — bumped from 22 after discovering Apple already rejected 1.0 (117)
**Author:** release engineer agent

## Summary

- **Overall status:** Conditionally Ready. The Apple rejection from 117 has been partially fixed in dashboard + repo. Code-side paywall fix and Mac-side commands still need you.
- **Build uploaded:** No.
- **Build number:** 118 (set in `project.pbxproj` across all 6 build configs; not yet committed).
- **Headline finding this session:** Apple **already rejected** build 1.0 (117) on Apr 27 for guidelines 2.1(b) + 3.1.2(c). This was not surfaced in the prior session's context.
- **Main blockers remaining:**
  1. Apply paywall code fix (open Terms/Privacy via Capacitor Browser instead of `<Link to>`).
  2. Commit + push (Mac).
  3. `npx vite build` + `npx cap sync ios` (Mac).
  4. `supabase db push` + secrets set + functions deploy (Mac).
  5. `vercel --prod` (Mac).
  6. Xcode archive + upload build 118 (Mac).
  7. Reply to App Review with resubmission.

## Completed (verified by me)

- [x] RevenueCat offering verified Current — `temp_placeholder` (Display Name now "Default") with 3 packages
- [x] RevenueCat packages mapped: `$rc_weekly`, `$rc_monthly`, `$rc_annual` → `atlas_core_pro_weekly|monthly|yearly`
- [x] In-App Purchase Key (P8 `543R5B55GY`) status: "Valid credentials"
- [x] RevenueCat Public API key (`appl_GANHA…`) matches `.env.local` `VITE_REVENUECAT_IOS_KEY`
- [x] RevenueCat App Bundle ID matches `com.atlascore.app`
- [x] **RevenueCat cleanup applied** — empty `default` offering deleted; `temp_placeholder` Display Name renamed to "Default" (identifier is immutable per RC)
- [x] Vercel legal pages live: `https://useatlascore.com/terms` and `/privacy` both HTTP 200, brand-consistent rendering
- [x] Supabase migration validated as safe (idempotent, NOT NULL with default 0, table exists, code consumer matches)
- [x] Build number incremented to **118** in `project.pbxproj` (all 6 configs)
- [x] No committed secrets — `.env.local` is gitignored
- [x] **OpenAI key rotated** — new `atlas-core-prod-2026-04-28` (`sk-…0mAA`) created in OpenAI atlas.core project, written to `.env.local`
- [x] **Gemini key rotated** — new `atlas-core-prod-2026-04-28` (`AIza…ox0s`) created in AI Studio atlas core project, written to `.env.local`
- [x] App Store Connect verified — found rejection on 1.0 (117), root cause identified
- [x] **EULA link added to App Description** in ASC and saved (Apple standard EULA URL + Privacy URL appended)
- [x] Sandbox purchase test script written (runbook section 9)
- [x] All exact Mac commands documented in `RELEASE_22_RUNBOOK.md`

## Pending — needs your action

- [ ] Apply paywall code fix (`S5_Paywall_A.jsx` Terms/Privacy buttons → Capacitor Browser, diff in runbook §2)
- [ ] `rm -f .git/index.lock` (sandbox left a stuck lock)
- [ ] Commit + push build bump + paywall fix + in-flight files (runbook §3)
- [ ] `npx vite build` + `npx cap sync ios` (runbook §4)
- [ ] `supabase db push` (runbook §5a)
- [ ] `supabase secrets set OPENAI_API_KEY GOOGLE_GEMINI_API_KEY` (runbook §5b)
- [ ] `supabase functions deploy ai-coach-chat ai-decision-engine invoke-llm log-food-text log-workout-text food-vision parse-lab-pdf` (runbook §5b)
- [ ] AI/edge function smoke tests (runbook §5c)
- [ ] `vercel --prod` (runbook §6)
- [ ] Xcode archive + upload build 118 (runbook §7)
- [ ] Reply to App Review and resubmit (runbook §8)
- [ ] Sandbox purchase test on physical iPhone (runbook §9)
- [ ] Revoke old OpenAI keys (4 keys: y2wA, mwgA, zrUA, 5YEA) (runbook §10)
- [ ] Revoke old Gemini keys (3 keys: e8Wg, a5CI, sF-g) (runbook §10)
- [ ] Verify demo account for App Review (runbook §11)
- [ ] (non-blocking) Upload App Store Connect API P8 to RevenueCat
- [ ] (non-blocking) Add RC webhook URL to ASC App Information → "App Store Server Notifications V2"

## Apple Rejection (1.0 build 117) — what we know

- **Submission ID:** `3f480600-c4c8-450e-9383-3a0707069479`
- **Review date:** April 27, 2026
- **Review device:** iPhone 17 Pro Max, iOS 26.4
- **Reviewer message:** rejected for both:
  - **2.1(b) Performance — App Completeness.** "An error message was displayed when we were trying to make an in-app purchase."
  - **3.1.2(c) Business — Payments – Subscriptions.** Missing functional Terms of Use (EULA) link in App Description.

### Root-cause analysis

**3.1.2(c)** — App Description on ASC didn't contain a Terms/EULA link. Now fixed in this session.

**2.1(b)** — Most likely two compounding issues in the paywall:
- Terms/Privacy were `<Link to="/terms">` / `<Link to="/privacy">` (react-router internal). On native iOS that navigates to `V3Terms` / `V3Privacy` rendered with `V3MarketingLayout` — a marketing-styled page, awkward inside an onboarding-paywall flow. To Apple Reviewer this looks like a non-functional EULA link.
- When RC `getOfferings()` failed on first load, prices fell back to `paywall.pricing.confirmedInStore` translation key — Apple sees no real price = subscription information not present in app. Your in-flight branch already wires `offeringsError` + `retryLoadOfferings` for a better UX in this case.

The paywall code fix in runbook §2 addresses both — Terms/Privacy now open in the in-app Safari sheet via `@capacitor/browser`, so Apple sees functional links to live legal pages.

## Subscription Products (App Store Connect) — fixed this session

| Product | Before | After | Notes |
|---|---|---|---|
| atlas_core_pro_yearly | Developer Action Needed (Rejected loc) | **Waiting for Review** | Localization edit + Submit for Review clicked |
| atlas_core_pro_weekly | Missing Metadata (no screenshot) | **Ready to Submit** | Paywall screenshot programmatically uploaded; first-time submission must attach to build 118 |
| atlas_core_pro_monthly | Developer Action Needed (Rejected loc) | **Waiting for Review** | Localization edit + Submit for Review clicked |

This was the actual root cause of `OfferingsManager.Error 1 / no products fetchable` on the device. With Yearly + Monthly now in "Waiting for Review", StoreKit can fetch them in TestFlight/sandbox. Weekly stays in "Ready to Submit" until you attach it to the build 118 version submission (Apple requires first-ever subscription submission to ride with a version).

Side effect: I edited Yearly + Monthly localizations (removed trailing period from description) to clear the cascaded Rejected state. If you want a different description (e.g., explicit auto-renew language: "Auto-renews weekly. Cancel anytime."), edit each localization in ASC.

## Dashboard Changes Made

| Where | Change |
|---|---|
| RevenueCat → atlas.core → Offerings | Deleted empty `default` offering. Renamed `temp_placeholder` Display Name to "Default" (identifier is immutable). |
| OpenAI → atlas.core project | Created `atlas-core-prod-2026-04-28` API key (sk-…0mAA). Old keys not yet revoked. |
| Google AI Studio → atlas core project | Created `atlas-core-prod-2026-04-28` API key (AIza…ox0s). Old keys not yet revoked. |
| App Store Connect → atlas.core - Fitness AI → version 1.0 → Description | Appended Apple standard EULA URL + Privacy URL. Saved. |

No secrets exposed in this report — keys are referred to by suffix only.

## Codebase Changes Made

| File | Change |
|---|---|
| `ios/App/App.xcodeproj/project.pbxproj` | `CURRENT_PROJECT_VERSION` 21 → 22 → **118**. 6 occurrences. |
| `.env.local` | `OPENAI_API_KEY` rotated to new value. `GOOGLE_GEMINI_API_KEY` rotated to new value. (gitignored) |
| `RELEASE_22_RUNBOOK.md` | Rewritten for build 118 with full Mac command set, paywall code diff, smoke tests, key-revocation steps, and demo-account guidance. |
| `RELEASE_22_REPORT.md` | This report. |

I did NOT modify the user's in-flight working-tree files (paywall offerings-error wiring, account screens, exercise-search function, vercel.json, etc.). Those should be staged in the same release commit as the build bump.

## Commands Run (sandbox)

Non-sensitive only. No keys appear here.

```bash
# audit
ls ios/, find ios -name "*.pbxproj"
grep -E "CURRENT_PROJECT_VERSION|MARKETING_VERSION|PRODUCT_BUNDLE_IDENTIFIER" \
     ios/App/App.xcodeproj/project.pbxproj
grep -lE "OPENAI_API_KEY|openai" supabase/functions/*/index.ts
grep -lE "GEMINI_API_KEY|gemini" supabase/functions/*/index.ts
grep -nE "exercise_search_today" supabase/functions/exercise-search/index.ts
git ls-files | xargs grep -lE "sk-[a-zA-Z0-9]{20,}|AIza[0-9A-Za-z_-]{35}"   # empty ✓

# build bump
Edit project.pbxproj — replace_all "CURRENT_PROJECT_VERSION = 21;" → "= 22;" (6 occurrences)
Edit project.pbxproj — replace_all "CURRENT_PROJECT_VERSION = 22;" → "= 118;" (6 occurrences)
grep -nE "CURRENT_PROJECT_VERSION = 118" ios/App/App.xcodeproj/project.pbxproj | wc -l   # 6 ✓

# paywall context
grep -nE "Link to=\"/(terms|privacy)\"" src/redesign/v3/screens/S5_Paywall_A.jsx
grep -rn "@capacitor/browser\|Browser.open" src/   # confirmed pattern available
git diff --stat                                    # captured user's in-flight changes
```

## Verification Evidence

### RevenueCat (https://app.revenuecat.com/projects/50255fc4)
- Project: `atlas.core` (id `50255fc4`)
- App config: `atlas.core (App Store)` — RC App ID `appc52688664e`, Bundle ID `com.atlascore.app` ✓
- In-App Purchase Key: P8 `543R5B55GY.p8` uploaded, "Valid credentials" ✓
- Public SDK Key prefix matches `.env.local` ✓
- Offerings: 1 active offering "Default" (id `temp_placeholder`), 3 packages mapped correctly
- App Store Connect API P8 (separate field): not uploaded (non-blocking)
- Apple Server Notification URL: configured on RC side, "No notifications received" — needs ASC mirror

### App Store Connect (https://appstoreconnect.apple.com/apps/6761517180)
- App: atlas.core - Fitness AI, App ID 6761517180, Bundle ID `com.atlascore.app`
- License Agreement: Apple's Standard License Agreement
- Description: now includes Apple standard EULA URL + Privacy URL (saved this session)
- Subscriptions: 3 products in `atlas.core Pro` group, all flagged for action — cascade from app rejection
- iOS App Version 1.0 status: 1.0 Rejected (build 117)

### Vercel / legal pages
- `https://useatlascore.com/terms` — HTTP 200, "Terms of Service. Last updated April 2026", 14-section ToS rendered with brand styling (verified in Chrome)
- `https://useatlascore.com/privacy` — HTTP 200, "Privacy Policy. Last updated April 2026", brand-consistent (verified in Chrome)
- `.vercel/project.json` linked: `prj_PFPQsmU5aZ5oF6vyYRnoClbcQ0dq`
- `vercel.json` rewrites `/terms` → `/terms.html` and `/privacy` → `/privacy.html` ✓

### OpenAI / Gemini key rotation
- New OpenAI key created (`atlas-core-prod-2026-04-28`, sk-…0mAA), Active, never used yet.
- New Gemini key created (`atlas-core-prod-2026-04-28`, AIza…ox0s), in `atlas core` project (317097569325).
- Both keys written to `.env.local`. Old keys still active until §10 revocation.
- Production edge functions still using old keys until §5b is run on Mac.

### Supabase
- Migration: `supabase/migrations/20260428140000_add_exercise_search_quota.sql`
- Statement: `ALTER TABLE public.ai_usage_quotas ADD COLUMN IF NOT EXISTS exercise_search_today INTEGER NOT NULL DEFAULT 0;`
- Code consumer: `supabase/functions/exercise-search/index.ts` lines 72, 79, 81, 84, 166 read/write the column
- Push pending — needs CLI run on your Mac (sandbox can't authenticate)

### Edge functions
- 5 OpenAI: `ai-coach-chat`, `ai-decision-engine`, `invoke-llm`, `log-food-text`, `log-workout-text`
- 2 Gemini: `food-vision`, `parse-lab-pdf`
- Redeploy commands documented in runbook §5b. Smoke tests in §5c.

### Sandbox purchase
- Test script in runbook §9 — covers product load, Terms/Privacy button behavior, purchase flow, restore, RC + Supabase verification.

### Xcode / App Store upload
- Build number bumped to 118 on disk.
- Mac commands in runbook §7. Suggest using Xcode Organizer (more reliable than xcodebuild for signing).
- Resubmission reply text suggested in runbook §8.

## Blockers

| Area | Issue | Owner | Next step |
|---|---|---|---|
| Paywall code | Terms/Privacy use react-router `<Link>` — needs Capacitor Browser | You | Apply diff in runbook §2 |
| Stuck `.git/index.lock` | Sandbox left it behind; can't unlink remotely | You | `rm -f .git/index.lock` |
| Mac CLIs | Sandbox is Linux; supabase + vercel + xcodebuild + cap sync need macOS | You | Run sections 4–7 of runbook on Mac |
| App Review reply | Need to message Apple with the build 118 fixes | You | Use template in runbook §8 |
| Sandbox purchase | Physical iPhone needed | You | Run runbook §9 before clicking Update Review |

## Risks / Notes

1. **Build numbers were drifting from project.pbxproj**. The pbxproj was at 21, but ASC has uploads up to 117. Something — Xcode auto-increment, manual override during archive, or a CI step — has been bumping the actual uploaded build. Either trust ASC as source of truth and reset pbxproj to one above the highest uploaded, or turn OFF auto-increment in Xcode so pbxproj stays the source of truth. Either way, document for your team.

2. **Paywall code fix is the actual rejection-clearing change.** The dashboard work and EULA addition fix 3.1.2(c). The paywall code fix addresses 2.1(b). Without it, build 118 will likely be rejected for the same reason 117 was.

3. **In-flight working-tree changes are unverified.** I didn't run vite build / cap sync / lint. Your `useRevenueCat` + paywall + exercise-search edits look reasonable from the diff, but you should run the build locally before archiving.

4. **Watch + Widget Info.plists hardcode `1.0` / `1`.** Has shipped through 117 builds without rejection. If validator flags it on 118, switch to `$(MARKETING_VERSION)` / `$(CURRENT_PROJECT_VERSION)` and re-archive.

5. **Demo account for review.** If you don't have one set up, runbook §11 walks through creating it and granting promotional entitlement via RC. Skipping this is a rejection risk if Apple is told sign-in is required and they can't get past auth.

6. **Old AI keys still active until you revoke them.** Until §10, you're paying for two keys per provider — minor cost concern but more importantly, an old key in someone's clipboard is still a valid key. Revoke promptly after smoke tests pass.

## Files to look at

- `RELEASE_22_RUNBOOK.md` — every Mac command, paywall code diff, sandbox purchase test, key revocation list, demo account setup
- `RELEASE_22_REPORT.md` — this report
- `ios/App/App.xcodeproj/project.pbxproj` — build number diff (21 → 118)
- `.env.local` — rotated key values (gitignored, do not commit)
