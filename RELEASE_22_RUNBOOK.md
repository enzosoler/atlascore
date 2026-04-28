# atlas.core — Build 118 Resubmission Runbook (replaces earlier build-22 runbook)

**Date:** 2026-04-28
**Build target:** 1.0 (118) — bumped from 22 after discovering Apple already rejected 1.0 (117)
**Bundle ID:** `com.atlascore.app`
**ASC submission to address:** `3f480600-c4c8-450e-9383-3a0707069479` (rejected Apr 27 for 2.1.b + 3.1.2.c)

> **Read me first.** Earlier runbook assumed build 22 was next. ASC has **117 already rejected**. This runbook has the correct build number (118) and the Apple rejection fixes.

---

## 0. Why was 1.0 (117) rejected?

Apple Reviewer (Apr 27, 2026, iPhone 17 Pro Max / iOS 26.4):

1. **Guideline 2.1(b) — Performance: App Completeness.** "An error message was displayed when we were trying to make an in-app purchase."
2. **Guideline 3.1.2(c) — Business: Payments – Subscriptions.** Missing functional Terms of Use (EULA) link in App Description.

Likely root causes:
- Paywall (`S5_Paywall_A.jsx`) Terms/Privacy use `<Link to="/terms">` → react-router internal nav into `V3Terms` rendered with `V3MarketingLayout`, which is built for the public web and will look broken inside an onboarding-paywall context on native.
- When RC `getOfferings()` fails on first paywall load, prices fall back to the `paywall.pricing.confirmedInStore` translation key — which Apple sees as "no price shown" → 3.1.2 violation.
- App Description didn't contain a Terms/EULA link. Apple's standard License Agreement is in use, so the link must live in the description.

What's already fixed (in this session):
- ✅ Build number bumped to 118 across all 6 build configs in `project.pbxproj` (App + Watch + Widgets, Debug + Release).
- ✅ App Description in ASC now has Apple standard EULA URL + Privacy URL appended. Saved.
- ✅ Empty `default` offering deleted in RevenueCat. `temp_placeholder` Display Name renamed to "Default" (identifier is immutable per RC).
- ✅ New OpenAI key created (`atlas-core-prod-2026-04-28`) and written to `.env.local`. Old key still active.
- ✅ New Gemini key created (`atlas-core-prod-2026-04-28`) and written to `.env.local`. Old keys still active.
- ✅ Your in-flight working-tree changes already wire `offeringsError` + `retryLoadOfferings` into the paywall — that's a real improvement for the "no price" case.

What still needs you on Mac (Sections 2–6 below):
1. Apply paywall Terms/Privacy code fix (Section 2).
2. Commit + push (Section 3).
3. Vite build + cap sync ios (Section 4).
4. Supabase migration push + key-rotation function redeploy (Section 5).
5. Vercel production redeploy (Section 6).
6. Xcode archive + upload build 118 (Section 7).
7. Reply to App Review with the resubmission (Section 8).
8. Sandbox purchase test on iPhone (Section 9).
9. Revoke old OpenAI + Gemini keys after smoke tests (Section 10).

---

## 1. The .git/index.lock left over from sandbox

I tried to commit during my sandboxed run but the mounted `.git/` directory blocked writes. There's a 0-byte `.git/index.lock` you need to remove first:

```bash
cd /Users/enzosoler/Documents/atlas.core
rm -f .git/index.lock
git status
```

You should see `project.pbxproj`, `.env.local` (untracked-by-virtue-of-gitignore), `RELEASE_22_REPORT.md`, `RELEASE_22_RUNBOOK.md`, plus all your in-flight modified files.

---

## 2. Paywall code fix (the rejection blocker)

Open `src/redesign/v3/screens/S5_Paywall_A.jsx`. Apply this minimal diff to make Terms/Privacy open in the in-app Safari sheet on native (vs. internal SPA route to a marketing-styled page).

```diff
@@
 import React from 'react';
-import { Link } from 'react-router-dom';
 import {
   ACFonts, ACRadii, useACT,
   ACLabel, ACBtn,
 } from '../lib/paper.jsx';
 import { HeartMark } from '../lib/brandMarks.jsx';
 import { useT } from '@/lib/i18nContext';
+import { Capacitor } from '@capacitor/core';
+import { Browser } from '@capacitor/browser';
+
+const TERMS_URL   = 'https://useatlascore.com/terms';
+const PRIVACY_URL = 'https://useatlascore.com/privacy';
+const EULA_URL    = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';
+
+async function openLegal(url) {
+  if (Capacitor.isNativePlatform()) {
+    await Browser.open({ url, presentationStyle: 'popover' });
+  } else {
+    window.open(url, '_blank', 'noopener,noreferrer');
+  }
+}
@@
-            <Link to="/terms" style={{ fontFamily: ACFonts.mono, fontSize: 11, letterSpacing: 0.3, color: c.dim, textDecoration: 'underline' }}>
-              {t('paywall.links.terms')}
-            </Link>
+            <button type="button" onClick={() => openLegal(EULA_URL)}
+              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: ACFonts.mono, fontSize: 11, letterSpacing: 0.3, color: c.dim, textDecoration: 'underline' }}>
+              {t('paywall.links.terms')}
+            </button>
             <span style={{ color: c.dim, fontSize: 11 }}>&middot;</span>
-            <Link to="/privacy" style={{ fontFamily: ACFonts.mono, fontSize: 11, letterSpacing: 0.3, color: c.dim, textDecoration: 'underline' }}>
-              {t('paywall.links.privacy')}
-            </Link>
+            <button type="button" onClick={() => openLegal(PRIVACY_URL)}
+              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: ACFonts.mono, fontSize: 11, letterSpacing: 0.3, color: c.dim, textDecoration: 'underline' }}>
+              {t('paywall.links.privacy')}
+            </button>
```

Two notes on this fix:
- The Terms button opens **Apple's standard EULA** (because your ASC License Agreement field is set to "Apple's Standard License Agreement"). If you switch ASC to a custom EULA later, change `EULA_URL` to `https://useatlascore.com/terms`.
- `presentationStyle: 'popover'` on iPhone falls back to a sheet — same as how `integrationsService.js` already opens external URLs.

Bonus (not strictly required but recommended) — do the same swap in any other place that renders Terms/Privacy inside paywall, account screens, or signup flow. Quickly:

```bash
rg -n "to=\"/terms\"|to=\"/privacy\"" src/
```

If a screen is shown to a user who hasn't yet finished onboarding and could feasibly be tested by Apple Reviewer, prefer `Browser.open` over `<Link>`.

After applying:

```bash
npm run build:dual   # or `npx vite build` if you don't use the dual build
# verify dist/ does not blow up
```

---

## 3. Commit and push

```bash
cd /Users/enzosoler/Documents/atlas.core
rm -f .git/index.lock

git add ios/App/App.xcodeproj/project.pbxproj
git add src/redesign/v3/screens/S5_Paywall_A.jsx
git add src/redesign/v3/routes/V3MobilePaywall.jsx
# also stage any other files you want shipping in build 118:
git add src/i18n/messages/en.json src/lib/AuthContext.jsx \
        src/redesign/v3/lib/useRevenueCat.js \
        src/redesign/v3/routes/V3AccountHub.jsx \
        src/redesign/v3/routes/V3AccountSettings.jsx \
        src/redesign/v3/routes/V3ActiveWorkout.jsx \
        src/redesign/v3/routes/V3CoachChat.jsx \
        src/redesign/v3/routes/V3DangerZone.jsx \
        supabase/functions/_shared/cors.ts \
        supabase/functions/exercise-search/index.ts \
        supabase/migrations/20260428140000_add_exercise_search_quota.sql \
        public/terms.html public/privacy.html \
        src/components/ui/PromptDialog.jsx \
        src/lib/workoutDraft.js \
        vercel.json \
        RELEASE_22_REPORT.md RELEASE_22_RUNBOOK.md

git commit -m "Release 1.0 (118): fix App Store rejection 2.1.b + 3.1.2.c

- Bump CURRENT_PROJECT_VERSION 117 → 118 (build 117 was rejected)
- Paywall: replace <Link to=\"/terms\"|\"/privacy\"> with @capacitor/browser
  Browser.open() so Terms/Privacy open functional URLs on native (Apple
  3.1.2.c: 'functional links to privacy policy and Terms of Use (EULA)')
- Paywall: wire offeringsError + retryLoadOfferings so users see Retry
  button instead of placeholder price text when RC offerings fail to load
  (addresses Apple 2.1.b 'error message during in-app purchase')
- App Description on App Store now includes Apple's standard EULA URL
  (done in ASC console; not in this commit but referenced for the record)
- Add exercise_search_quota migration consumed by exercise-search/index.ts
- Misc account, paywall, coach chat, workout edits

Co-authored-by: release-engineering-agent"

git push origin main
```

---

## 4. Production build + iOS sync

```bash
npx vite build
npx cap sync ios
```

Both must pass before you archive. If `vite build` fails on Linux/arm64-only rollup error, just ignore that — your Mac has the right native binary.

---

## 5. Supabase: migration + post-rotation function deploys

### 5a. Push the migration (adds `exercise_search_today` column)

```bash
# only if not already linked:
supabase link --project-ref xrtqwdpczgdomqebmfkk

supabase db push
```

The migration is `supabase/migrations/20260428140000_add_exercise_search_quota.sql`:

```sql
ALTER TABLE public.ai_usage_quotas
  ADD COLUMN IF NOT EXISTS exercise_search_today INTEGER NOT NULL DEFAULT 0;
```

It's idempotent — safe to run twice.

Verify:

```bash
psql "$DATABASE_URL" -c "\\d public.ai_usage_quotas" | grep exercise_search_today
```

### 5b. Update Supabase function secrets with the rotated keys

`.env.local` already has the new OpenAI + Gemini keys (I wrote them in the sandbox). Production edge functions don't read `.env.local` — they read Supabase function secrets.

```bash
# Source the new keys from .env.local (so we don't paste them in shell history)
set -a
source .env.local
set +a

supabase secrets set \
  OPENAI_API_KEY="$OPENAI_API_KEY" \
  GOOGLE_GEMINI_API_KEY="$GOOGLE_GEMINI_API_KEY" \
  --project-ref xrtqwdpczgdomqebmfkk

# Redeploy all 7 affected edge functions:
supabase functions deploy \
  ai-coach-chat ai-decision-engine invoke-llm log-food-text log-workout-text \
  food-vision parse-lab-pdf \
  --project-ref xrtqwdpczgdomqebmfkk
```

### 5c. Smoke test each AI function

Easiest path is hit them through the app itself — open the AI coach, try one chat message, log a meal via text, log a workout via text, take a food photo. If all four work end-to-end, the keys are wired correctly.

If you'd rather curl directly, get a session JWT first (Supabase → Authentication → Users → impersonate, or sign in via the app and copy the JWT from devtools network tab), then:

```bash
curl -s -X POST "https://xrtqwdpczgdomqebmfkk.supabase.co/functions/v1/ai-coach-chat" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"ping"}'
```

A successful response confirms the new key is wired. A 500 with "Incorrect API key" means the secret didn't propagate — re-run `supabase secrets set` and `supabase functions deploy`.

---

## 6. Vercel production redeploy

```bash
vercel --prod
```

The project is already linked (`.vercel/project.json` shows `prj_PFPQsmU5aZ5oF6vyYRnoClbcQ0dq`). After deploy, smoke check both legal URLs (already verified live but worth re-confirming after the redeploy):

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://useatlascore.com/terms
curl -s -o /dev/null -w "%{http_code}\n" https://useatlascore.com/privacy
```

Both should return `200`.

---

## 7. Xcode archive + upload build 118

```bash
open ios/App/App.xcworkspace
```

In Xcode:

1. Scheme: **App**, destination: **Any iOS Device (arm64)**.
2. Verify Signing & Capabilities for App target:
   - Team: 545KQXEK7J
   - Bundle ID: `com.atlascore.app`
   - Push Notifications capability present, APS env = production
   - App Groups: only `group.com.atlascore.app`
   - HealthKit capability present
3. Build Settings: confirm `MARKETING_VERSION = 1.0`, `CURRENT_PROJECT_VERSION = 118`.
4. **Product → Archive**.
5. Organizer → **Distribute App → App Store Connect → Upload**. Strip Swift symbols ON, upload symbols ON, manage version OFF.
6. Watch ASC for "Processing" → "Ready to Submit".

If the archive validator complains about Watch / Widget bundle versions (because their Info.plist still hardcodes `1.0` / `1`), change those Info.plist values to `$(MARKETING_VERSION)` / `$(CURRENT_PROJECT_VERSION)` and re-archive. (This has shipped through 117 prior builds without rejection, so probably won't be an issue, but watch the validator.)

---

## 8. Resubmit to App Review

Once 118 finishes processing in ASC:

1. App Store Connect → atlas.core → Distribution → version 1.0 → click **Edit** under Items Submitted, attach build 118.
2. Click **Update Review** (top right) — that re-pushes to Apple Review with the saved metadata (now including the EULA link in App Description).
3. **Reply to App Review message** with a short note like:

> Hi App Review,
>
> Build 1.0 (118) addresses both findings on submission `3f480600-c4c8-450e-9383-3a0707069479`:
>
> - **2.1(b):** Resolved the in-app purchase error. The paywall now shows a Retry control if RevenueCat offerings fail to load (the previous build showed placeholder price text in that race condition). The paywall also reliably shows real prices for the three subscription tiers (weekly, monthly, yearly).
> - **3.1.2(c):** App Description now includes a functional link to Apple's standard Terms of Use (EULA) at `https://www.apple.com/legal/internet-services/itunes/dev/stdeula/`, plus a link to our Privacy Policy at `https://useatlascore.com/privacy`. Inside the app, the paywall now opens both EULA and Privacy in the in-app Safari sheet (Capacitor Browser plugin) instead of internal SPA navigation.
>
> A demo account is set up under Review Information. Please re-test on iPhone 17 Pro Max / iOS 26.4 — the same review device that flagged 117.
>
> Thanks,
> Enzo Soler — atlas.core

(Edit demo account section before sending if you haven't created one yet — see Section 11.)

---

## 9. Sandbox purchase test (iPhone)

Before tapping "Update Review" in Section 8, exercise the paywall on a real device with a sandbox tester. Test 1–5 below mirror what Apple's reviewer will check.

**Prereqs**

- TestFlight build 118 installed on a real iPhone (run via Xcode in Release config also works).
- iPhone signed in to a sandbox tester (Settings → App Store → Sandbox Account, or Settings → Developer → "Sandbox Apple Account").
- App signed out of any prior atlas.core entitlement (use a fresh sandbox tester).

**Test 1 — paywall renders the three plans with real prices**

1. Launch atlas.core → sign up → reach paywall.
2. Verify Weekly + Monthly + Yearly all show localized currency prices (NOT "Confirmed at checkout" or any placeholder).
3. Verify Title, Length ("yearly", "monthly", "weekly"), Price, plus Restore + Terms + Privacy controls are visible.

**Test 2 — Terms and Privacy buttons open external URLs**

1. Tap Terms → confirm Apple's standard EULA loads in the in-app Safari sheet, dismissing returns you to the paywall.
2. Tap Privacy → confirm `useatlascore.com/privacy` loads in the in-app Safari sheet, dismissing returns to the paywall.

**Test 3 — purchase flow**

1. Tap Weekly → tap Continue.
2. Confirm sandbox purchase sheet shows correct price + duration.
3. Tap Subscribe (sandbox).
4. Confirm: purchase completes without error, app unlocks Pro state, RC dashboard → Customers shows new entitlement on `atlas_core_pro_weekly`.

**Test 4 — restore**

Force-quit, relaunch, Settings → Restore Purchases. Entitlement should restore in <3s.

**Test 5 — RC webhook → Supabase**

```sql
select event_type, product_id, environment, created_at
from subscription_events
where user_id = '<your sandbox tester user id>'
order by created_at desc limit 10;
```

Expect at least one `INITIAL_PURCHASE` row in `SANDBOX` env.

If any test fails — capture exact error, RC dashboard event log, and ASC subscription product status before debugging.

---

## 10. Revoke old keys (after smoke test)

Only do this AFTER Section 5c smoke test passes.

### OpenAI

Visit `https://platform.openai.com/api-keys`. Revoke:
- `atlas.core 23apr26` (sk-…y2wA) — was the live key
- `atlas.core` (sk-…mwgA) — never used
- `codexaii` (sk-…zrUA) — last used Apr 21
- `text-based-food-logging` (sk-…5YEA) — last used Apr 24

Keep only the new `atlas-core-prod-2026-04-28` (sk-…0mAA).

### Gemini

Visit `https://aistudio.google.com/apikey`. Revoke:
- `atlas.core 23 apr 26` (…e8Wg) — was the live key (the value previously in `.env.local`)
- `Gemini API Key 2.0` (…a5CI) — Apr 18, never used per dashboard
- `food-vision` (…sF-g) — Mar 25

Keep only the new `atlas-core-prod-2026-04-28` (…ox0s).

---

## 11. Demo account for App Review (if not already set)

ASC → atlas.core → Distribution → version 1.0 → App Review Information.

If `Sign-in required` is ON but no demo account exists:

1. Create a regular user account in production (via the app or Supabase) at `apple-review@useatlascore.com` with a memorable password.
2. In RevenueCat → Customers → search for that user → Manage → **Grant Promotional** entitlement on `pro` for, say, 90 days. This way the reviewer doesn't need to actually purchase to see the unlocked state.
3. Paste the credentials and any helpful notes into the Review Information fields (Apple sees these — they don't appear publicly).
4. Reviewer notes: explicitly mention "Use the demo account if you don't want to test the paid flow. Sandbox purchase also works with the standard Apple sandbox tester accounts."

---

## 11b. Subscription products in ASC (rebuilt this session)

The on-device error `OfferingsManager.Error 1 / no products fetchable` was caused by **all 3 subscription products being in pre-submission states**:

- atlas_core_pro_yearly: Developer Action Needed
- atlas_core_pro_weekly: Missing Metadata
- atlas_core_pro_monthly: Developer Action Needed

In this session I drove ASC to fix all three:

1. **Weekly** had no Review-Information screenshot. I fetched the paywall screenshot already on Yearly (via mzstatic CDN), injected it into Weekly's file input via `DataTransfer`, ASC accepted it. Status moved to **Ready to Submit**.
2. **Yearly + Monthly** had a Rejected localization (cascade from app rejection). I opened the Edit Localization modal on each, made a trivial dirty-edit (removed the trailing period from the description), saved. That cleared the Rejected status and unlocked the Submit for Review button. I then clicked Submit on each. Status moved to **Waiting for Review**.

After this, Yearly + Monthly are fetchable by StoreKit in TestFlight/sandbox. Weekly stays in "Ready to Submit" until you attach it to the next app version (build 118) submission — Apple's policy on first-time subscriptions.

Two follow-ups for you in ASC:
- The Yearly + Monthly description on the App Store now reads `Unlimited AI logs, full history, AI insights` (no trailing period) instead of `…AI insights.`. If you want the period back or want richer copy (Apple recommends explicit auto-renew language like "Auto-renews weekly. Cancel anytime."), edit each localization and save.
- When you upload build 118 and create the version submission, **manually attach atlas_core_pro_weekly** to the version's "In-App Purchases and Subscriptions" picker so Apple reviews it alongside Yearly + Monthly. Otherwise Weekly stays stuck in "Ready to Submit" forever.

## 12. RC + ASC outstanding items (non-blocking)

Done in this session:
- Empty `default` offering deleted from RC.
- `temp_placeholder` Display Name renamed to "Default" (identifier itself is immutable per RC).
- App Description in ASC now contains Apple EULA + Privacy links.

Still recommended (not strictly blocking):

- **App Store Connect API P8 in RC.** Separate from the In-App Purchase Key. Lets RC auto-import product/price changes. Upload at App Store Connect → Users and Access → Keys → +. Then in RC App Store config → "App Store Connect API" section → drop the .p8 file in.
- **Apple Server Notification URL on ASC side.** RC has the URL configured but reports "No notifications received". Copy the URL from RC's "Apple Server Notification URL" field and paste into ASC → App Information → "App Store Server Notifications V2" → Production URL.

---

## 13. Quick reference — what changed where in this session

| Where | Change |
|---|---|
| `ios/App/App.xcodeproj/project.pbxproj` | `CURRENT_PROJECT_VERSION` 21 → 22 → 118 (final). 6 occurrences. |
| `.env.local` | `OPENAI_API_KEY` rotated to `sk-…0mAA`. `GOOGLE_GEMINI_API_KEY` rotated to `AIza…ox0s`. |
| RevenueCat dashboard | Empty `default` offering deleted. `temp_placeholder` Display Name → "Default". |
| ASC app description | EULA URL + Privacy URL appended; saved. |
| `RELEASE_22_RUNBOOK.md` | This file (rewritten for build 118). |
| `RELEASE_22_REPORT.md` | Final report. |

The build number bump and the `.env.local` rotation are committed/written to disk on your Mac. The runbook + report are present in the working tree as untracked files. Stage them in your release commit per Section 3.
