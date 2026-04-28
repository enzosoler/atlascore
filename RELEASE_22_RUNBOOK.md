# atlas.core — Build 22 Release Runbook

**Date:** 2026-04-28
**Build:** 1.0 (22)
**Bundle ID:** `com.atlascore.app`
**Author:** release engineer agent

This runbook covers everything that must be executed on your Mac to ship build 22, plus the sandbox purchase test script. The codebase changes (build number bump in `project.pbxproj`) are already committed in the working tree.

---

## 1. Mac terminal commands (in order)

Run these from the repo root: `/Users/enzosoler/Documents/atlas.core`

### 1a. Production build + iOS sync

```bash
npx vite build
npx cap sync ios
```

Expected: vite build succeeds (~8–15s), cap sync copies `dist/` into `ios/App/App/public/` and updates the Capacitor plugin manifest. If either fails, do not proceed — fix first.

### 1b. Push the Supabase migration

```bash
supabase link --project-ref xrtqwdpczgdomqebmfkk   # only if not already linked
supabase db push
```

What this applies: `supabase/migrations/20260428140000_add_exercise_search_quota.sql` — adds `exercise_search_today INTEGER NOT NULL DEFAULT 0` to `public.ai_usage_quotas`. Idempotent (uses `IF NOT EXISTS`). Required because `supabase/functions/exercise-search/index.ts` reads/writes this column.

Verify after push:

```bash
supabase db remote commit --dry-run   # should show no pending diff
# OR via psql:
psql "$DATABASE_URL" -c "\d public.ai_usage_quotas" | grep exercise_search_today
```

### 1c. Vercel production deploy

```bash
vercel --prod
```

The project is already linked (`.vercel/project.json` shows `prj_PFPQsmU5aZ5oF6vyYRnoClbcQ0dq`). After deploy, verify in a private window:

- https://useatlascore.com/terms → HTTP 200, renders Terms of Service
- https://useatlascore.com/privacy → HTTP 200, renders Privacy Policy

(`vercel.json` rewrites `/terms` → `/terms.html` and `/privacy` → `/privacy.html`.)

### 1d. Commit the build bump + push

```bash
git add ios/App/App.xcodeproj/project.pbxproj RELEASE_22_RUNBOOK.md
git commit -m "Release 1.0 (22): bump build number for App Store submission"
git push origin main
```

### 1e. Xcode archive + upload

```bash
open ios/App/App.xcworkspace    # NOT .xcodeproj
```

In Xcode:

1. Scheme: **App**, destination: **Any iOS Device (arm64)**.
2. Verify Signing & Capabilities for App target:
   - Team: 545KQXEK7J
   - Bundle ID: `com.atlascore.app`
   - Push Notifications capability present, APS env = production
   - App Groups: only `group.com.atlascore.app`
   - HealthKit capability present
3. Build Settings: confirm `MARKETING_VERSION = 1.0`, `CURRENT_PROJECT_VERSION = 22` (already set).
4. **Product → Archive**.
5. In Organizer: **Distribute App → App Store Connect → Upload**. Strip Swift symbols ON, upload symbols ON, manage version OFF.
6. Watch App Store Connect for "Processing" then "Ready to Submit".

### Why not via xcodebuild from CLI?

Xcode archive + upload requires your Apple Developer signing identity in your local keychain and access to your provisioning profiles. Driving it via `xcodebuild archive -exportArchive -exportOptionsPlist` is technically possible but signing failures are the common case on a dev machine that hasn't been pre-configured for headless distribution. The Xcode Organizer path is more reliable for a release build. If you want me to attempt CLI archive next session, set up an export options plist and an `XCBUILDLOG` capture and I can drive it.

---

## 2. Sandbox purchase test script (your iPhone)

**Prereqs**

- Build 22 installed via TestFlight (or run-on-device from Xcode in Release config).
- iPhone signed in to a sandbox tester account (Settings → App Store → Sandbox Account).
- Settings → Developer → "Sandbox Apple Account" populated.
- Same iPhone signed out of any prior atlas.core entitlement (to start clean), or use a fresh sandbox tester.

**Test 1 — products load on paywall**

1. Launch atlas.core.
2. Sign in (or sign up — to get to the paywall).
3. Navigate to the paywall (`V3MobilePaywall` / `S5_Paywall_A`).
4. Confirm three products appear: Weekly, Monthly, Yearly with localized prices.

PASS criteria: all three prices render, no "Loading…" stuck state, no missing product errors in console (Console.app filter `RevenueCat`).

If FAIL: products didn't fetch from RevenueCat. Likely causes:
- Bundle ID mismatch between archive and RC dashboard (verify in Xcode Build Settings)
- `VITE_REVENUECAT_IOS_KEY` not bundled in Release build (check `dist/assets/*.js | grep appl_`)
- Sandbox tester from wrong storefront — RC needs a tester that can see the products

**Test 2 — purchase the weekly plan**

1. Tap Weekly.
2. Sign in to sandbox account if prompted.
3. Confirm purchase sheet shows correct price + duration.
4. Tap **Subscribe** (sandbox).

PASS criteria:
- Purchase completes without StoreKit error.
- App returns to a Pro-unlocked state (whatever your post-paywall route is).
- RevenueCat dashboard → atlas.core → Customers → search by your sandbox `appUserId` shows an active entitlement on `atlas_core_pro_weekly`.
- Supabase: `select * from subscription_events order by created_at desc limit 5;` shows the new event from `revenuecat-webhook`.

If FAIL: capture the error code shown to the user AND the RevenueCat dashboard → Customers → your tester → "Recent Events" tab. Most common failures:
- `STOREKIT_INVALID_RECEIPT` → in-app purchase P8 not configured (already verified ✓)
- `PRODUCT_NOT_AVAILABLE` → product status in App Store Connect not "Ready to Submit"
- `PURCHASE_CANCELLED` → user dismissed the sheet, retry

**Test 3 — restore purchases**

1. Force-quit, relaunch app.
2. Settings / Account → Restore Purchases.

PASS criteria: entitlement restores within ~3s, app shows Pro state.

**Test 4 — webhook → Supabase**

Open RC dashboard → Integrations → Webhooks. Confirm the `revenuecat-webhook` Supabase function fired for the test purchase (status 2xx). Then in Supabase SQL editor:

```sql
select event_type, product_id, environment, created_at
from subscription_events
where user_id = '<your sandbox tester user id>'
order by created_at desc limit 10;
```

Expected: at least one `INITIAL_PURCHASE` row in `SANDBOX` env.

**Test 5 — entitlement gating**

Navigate to a Pro-only feature (AI coach chat / advanced workout flows). Confirm no paywall reappears.

---

## 3. Key rotation runbook (do this YOURSELF in the provider dashboards)

You said you want to do all key rotation. Here is the exact sequence so nothing breaks.

### OpenAI (https://platform.openai.com/api-keys)

1. Create a new project-scoped key. Name: `atlas-core-prod-2026-04-28`.
2. Copy the new key.
3. Edit `/Users/enzosoler/Documents/atlas.core/.env.local`, replace the `OPENAI_API_KEY=...` line.
4. Update Supabase function secrets:
   ```bash
   supabase secrets set OPENAI_API_KEY="<new-key>" --project-ref xrtqwdpczgdomqebmfkk
   ```
5. Redeploy the 5 OpenAI-using functions:
   ```bash
   supabase functions deploy ai-coach-chat ai-decision-engine invoke-llm log-food-text log-workout-text --project-ref xrtqwdpczgdomqebmfkk
   ```
6. Smoke test (replace TOKEN with a real session JWT):
   ```bash
   curl -X POST "https://xrtqwdpczgdomqebmfkk.supabase.co/functions/v1/ai-coach-chat" \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"message":"ping"}'
   ```
7. Once verified, **revoke the old key** in the OpenAI dashboard.

### Gemini (https://aistudio.google.com/apikey)

1. Create a new API key, restrict to Generative Language API.
2. Edit `.env.local`, replace `GOOGLE_GEMINI_API_KEY=...`.
3. Update Supabase secrets:
   ```bash
   supabase secrets set GOOGLE_GEMINI_API_KEY="<new-key>" --project-ref xrtqwdpczgdomqebmfkk
   ```
4. Redeploy the 2 Gemini-using functions:
   ```bash
   supabase functions deploy food-vision parse-lab-pdf --project-ref xrtqwdpczgdomqebmfkk
   ```
5. Smoke test `food-vision` with a small JPG (or via the app's logging flow).
6. **Revoke the old Gemini key** in AI Studio.

### After rotation

- `git status` should show NO changes (`.env.local` is gitignored — confirm with `git check-ignore .env.local`).
- Hit the paywall once with the iPhone build to confirm no auth errors propagate (these functions are downstream of normal use).

---

## 4. Items that need your attention in dashboards

These were found during the audit and are NOT in code:

### RevenueCat (https://app.revenuecat.com/projects/50255fc4)

- **`temp_placeholder` is your Current offering.** That identifier is shipped in your config; it works, but it's an unprofessional name. Suggested fix: rename `temp_placeholder` → `default` (and delete the existing empty `default` offering first). The 3 packages and product mappings are correct as-is.
- **`default` offering exists with 0 packages.** Either populate or delete it.
- **App Store Connect API P8 not uploaded** (separate from the In-App Purchase Key, which IS configured and showing "Valid credentials"). Non-blocking for launch since products are already imported, but you'll want this for automatic price-change sync later.
- **Apple Server Notification URL on RC side shows "No notifications received."** Means App Store Connect → your app → App Information → "App Store Server Notifications" is missing the RC webhook URL `https://api.revenuecat.com/v1/incoming-webhooks/apple/...`. Add it for production-grade subscription event delivery.

### App Store Connect (verification needed — Chrome dropped before I could check)

Per the audit checklist, please verify in App Store Connect:

- 3 subscription products `atlas_core_pro_weekly|monthly|yearly` are in **"Ready to Submit"** or **"Approved"** status.
- App listing → App Information → Privacy Policy URL = `https://useatlascore.com/privacy`
- App listing → App Information → Terms of Service URL (EULA) = `https://useatlascore.com/terms`
- Build 22 selected for review once it finishes processing.
- App Review Information → Sign-in required = ON, with a working demo account. If you don't have one yet, create a dedicated `apple-review@useatlascore.com` test user with a paid entitlement applied via RC → Customers → Manage → Grant Promotional.
- Review notes mention sandbox subscription testing instructions.

---

## 5. Open blockers / risks

| Area | Risk | Mitigation |
|---|---|---|
| Offering identifier `temp_placeholder` | Apple reviewers can see the package identifier in receipts. Cosmetic concern. | Rename to `default` in RC dashboard before submission. |
| ASC API P8 missing in RC | Future product/price changes won't auto-sync. | Upload P8 (low-priority post-launch). |
| Apple Server Notification URL not registered in ASC | Subscription state changes (cancellations, renewals) may lag. | Add URL in ASC App Information. |
| Watch / Widget Info.plist hardcoded `1.0/1` | Could trip Apple validator if it enforces consistent build numbers across bundles. Has not blocked builds 1–21 historically. | Watch upload; if rejected, change Info.plist values to `$(MARKETING_VERSION)` / `$(CURRENT_PROJECT_VERSION)`. |
| Sandbox purchase not yet executed on device | Apple Review may catch a broken purchase flow. | Run script in Section 2 before submitting for review. |
