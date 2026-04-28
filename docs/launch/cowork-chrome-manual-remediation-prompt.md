# atlas.core — Manual Remediation Prompt for Claude / Cowork in Chrome

Copy everything below the divider into a Cowork-in-Chrome session. The agent has access to browser-based dashboards (App Store Connect, RevenueCat, Supabase, Vercel, OpenAI, Google AI Studio, PostHog, Sentry) and, where available, the local project / Xcode environment. Code-only deferred items are explicitly out of scope unless the agent is asked to escalate.

---

You are Claude / Cowork operating in Chrome with access to browser-based dashboards and, where available, the local project / Xcode environment.

Your task is to **complete or verify the MANUAL items** from the atlas.core launch remediation checklist.

## Operating rules

- Focus on manual / dashboard / Xcode / device / browser tasks that require owner access. Do not work on code-only deferred items unless explicitly asked.
- Do not mark anything complete unless you personally verify it or complete it yourself.
- If a task requires credentials, 2FA, App Store Connect permissions, Apple Developer permissions, RevenueCat permissions, Supabase permissions, Vercel permissions, OpenAI / Gemini permissions, or physical device access that you do not have, mark it `BLOCKED — OWNER ACTION REQUIRED` and explain exactly what is needed.
- Never print secret values. Record only non-sensitive evidence (timestamp, dashboard status, last-4 of an identifier if visible).
- Do not falsely mark browser/dashboard tasks as fixed from repo inspection alone.

## Source of truth

The prior report listed 21 manual items and 16 deferred items. Your job is to complete or verify the manual ones — secret rotation, git history scrub approval, RevenueCat key verification, Xcode IAP capability, StoreKit configuration, App Store Connect subscription setup, RevenueCat dashboard setup, Supabase secret setup, Paid Apps Agreement, sandbox purchase + restore tests, trial CTA verification, weekly plan product decision, and HealthKit purpose-string verification.

---

## CRITICAL MANUAL TASKS

### C-1 — Rotate exposed secrets

Rotate every secret exposed in commit `9145b84`:

- Supabase service_role key
- OpenAI API key
- Google Gemini API key
- Vercel OIDC token / any exposed Vercel credential

For each provider:

1. Open the provider dashboard.
2. Revoke or rotate the exposed credential.
3. Create a new credential if required.
4. Update the new credential everywhere the app expects it:
   - Supabase secrets
   - Vercel environment variables
   - local `.env.local` only if needed for local builds
   - any provider-specific integration settings
5. Do not print secret values.
6. Record only: provider, secret name, rotated yes/no, where updated, evidence (timestamp, dashboard status, non-sensitive suffix if visible).

Status rules:
- `FIXED` only if rotated and updated everywhere required.
- `BLOCKED — OWNER ACTION REQUIRED` if login / permissions / 2FA prevent completion.

### C-1b — Scrub `.env.local` from git history

Perform or verify git history scrub:

- Use `git filter-repo` or BFG Repo Cleaner.
- Remove `.env.local` from all git history.
- Force-push only if owner approval is explicit and remote access is available.
- Verify with git history search that `.env.local` and exposed secret values are no longer present.

Suggested commands:

```bash
git status
git log --all -- .env.local
git filter-repo --path .env.local --invert-paths
git log --all -- .env.local
git grep -n "SUPABASE_SERVICE_ROLE\|OPENAI_API_KEY\|GEMINI\|VERCEL" $(git rev-list --all)
```

This is destructive. Do not force-push without explicit owner approval. If force-push requires owner approval, prepare exact commands and mark `OWNER ACTION REQUIRED`.

### C-2 — Verify `VITE_REVENUECAT_IOS_KEY`

1. Open RevenueCat dashboard.
2. Locate the iOS app for bundle ID `com.atlascore.app`.
3. Find the public SDK API key.
4. Verify `.env.local` contains `VITE_REVENUECAT_IOS_KEY=<RevenueCat iOS public SDK key>`.
5. Do not reveal the key in output.
6. Confirm the key will be available before `npx vite build`.

Status: `FIXED` if verified present and matching RevenueCat. `BLOCKED` if dashboard or local env access is unavailable.

### C-2b — Rebuild, archive, upload

After `VITE_REVENUECAT_IOS_KEY` is confirmed:

```bash
npx vite build
npx cap sync ios
```

Then in Xcode: clean build folder, archive the iOS app, upload archive to App Store Connect. Record build number / version uploaded.

Status: `FIXED` if uploaded. `PARTIAL` if build/sync done but archive/upload not done. `BLOCKED` if Xcode, Apple login, signing, or 2FA blocks completion.

### C-2c — Add In-App Purchase capability to Xcode target

1. Open `ios/App/App.xcworkspace` (or correct workspace).
2. Select the App target → Signing & Capabilities.
3. Add **In-App Purchase** capability.
4. Confirm capability is reflected in the project, save, verify project files changed.

Status: `FIXED` if capability is present. `BLOCKED` if Xcode / project signing access is unavailable.

### C-2d — Create StoreKit configuration file

In Xcode:

1. Create a `.storekit` configuration file.
2. Add products: `atlas_core_pro_weekly`, `atlas_core_pro_monthly`, `atlas_core_pro_yearly`.
3. Ensure product types match auto-renewable subscriptions.
4. Add or link subscription group if supported.
5. Configure Xcode scheme to use the StoreKit file for local testing.
6. Commit / check in the `.storekit` file if appropriate.

Status: `FIXED` if file exists and scheme configured. `PARTIAL` if file exists but scheme not configured. `BLOCKED` if Xcode access unavailable.

### C-2e — Test sandbox purchase on physical device

On a physical iOS device:

1. Install latest TestFlight or Xcode build.
2. Sign into a sandbox Apple ID.
3. Create a new app account.
4. Navigate to paywall → select a subscription.
5. Confirm native StoreKit sheet appears → complete sandbox purchase.
6. Verify entitlement unlocks in app.
7. Verify RevenueCat subscriber updated.
8. Verify Supabase subscription record / webhook if applicable.

Record: device model, iOS version, app build number, product tested, purchase result, entitlement result, RevenueCat result, Supabase result.

### C-2f — Test Restore Purchases on physical device

1. Use an account / device with an existing sandbox purchase.
2. Tap **Restore Purchases** in paywall / footer / settings.
3. Verify native restore flow succeeds.
4. Verify entitlement unlocks.
5. Verify RevenueCat subscriber state is correct.

Record the same evidence fields as C-2e.

### C-2g — Set Terms of Use URL in App Store Connect

Set Terms of Use URL to `https://useatlascore.com/terms`.

Verify: URL is present in app metadata or subscription metadata where Apple expects it; URL opens successfully in browser; paywall also links to this URL if visible.

### C-2h — Set Privacy Policy URL in App Store Connect

Set Privacy Policy URL to `https://useatlascore.com/privacy`.

Verify: URL is present in app metadata; URL opens successfully; paywall also links to it if visible.

### C-2i — Verify subscription products

In App Store Connect, verify all three products exist and are **Ready to Submit**:

- `atlas_core_pro_weekly`
- `atlas_core_pro_monthly`
- `atlas_core_pro_yearly`

For each, record: product ID, subscription duration, price, status, localized display name/description present, review screenshot attached.

### C-2j — Verify subscription group

Confirm the three products are in the correct subscription group; group display name is configured; products have intended hierarchy / order.

### C-2k — Attach IAP review screenshots

Attach IAP review screenshot for each product if missing.

Status: `FIXED` if attached for all three. `PARTIAL` if some. `BLOCKED` if no screenshot asset is available or permissions block upload.

### C-2l — Verify sandbox tester account

In App Store Connect → Users and Access (Sandbox Testers): verify at least one sandbox tester exists; credentials are available to owner / tester. Do not print password.

### C-2m — Verify RevenueCat dashboard setup

Open RevenueCat → iOS app for `com.atlascore.app`. Confirm:

- entitlement `pro` exists
- products linked: `atlas_core_pro_weekly`, `atlas_core_pro_monthly`, `atlas_core_pro_yearly`
- default offering set as **Current**
- packages exist: `$rc_weekly`, `$rc_monthly`, `$rc_annual`
- each package maps to the correct App Store product

### C-2n — Verify App Store Connect shared secret in RevenueCat

In RevenueCat → App Store integration: confirm App Store Connect shared secret is entered. Do not reveal. Record only whether configured.

### C-2o — Verify RevenueCat webhook + Supabase secret

In RevenueCat: confirm webhook URL is configured, points to intended Supabase endpoint, is enabled. Send a test event if available.

In Supabase: confirm `REVENUECAT_WEBHOOK_SECRET` exists in Edge Function secrets; do not print value; verify the relevant webhook edge function uses the same secret name.

### C-2p — Verify Paid Apps Agreement

In App Store Connect → Agreements, Tax, and Banking: confirm Paid Apps Agreement is active and banking / tax status does not block IAP sales.

---

## HIGH MANUAL OR BROWSER-REQUIRED TASKS

### H-4d — HealthKit purpose strings

In Xcode / Info.plist, verify or edit:

- `NSHealthShareUsageDescription`
- `NSHealthUpdateUsageDescription`
- any related HealthKit purpose strings

Strings must disclose that health-derived data may be used for personalized coaching and may be processed by third-party AI providers where applicable.

Status: `FIXED` if Info.plist / project contains updated strings. `PARTIAL` if only documentation exists. `BLOCKED` if Xcode / project access unavailable.

### H-5c — PostHog / Sentry deletion handling

Check:

1. Whether account deletion flow includes PostHog and Sentry user deletion / anonymization.
2. Whether admin documentation exists for manual deletion.
3. Whether PostHog dashboard supports person deletion and is documented.
4. Whether Sentry user deletion / scrubbing is documented or implemented.

Status: `FIXED` if implemented in account deletion flow. `VERIFIED MANUAL` if a precise owner-run deletion process exists. `NOT FIXED` if only "considered" or left as TODO.

---

## MEDIUM MANUAL TASKS

### M-10 — Verify "3-day free trial" CTA against App Store Connect

In App Store Connect → each subscription product:

1. Verify whether introductory offer / free trial exists.
2. Confirm trial length.
3. Compare to app / paywall CTA text.
4. If app says "3-day free trial" but ASC does not match, update app copy or update ASC trial configuration depending on product decision.

Record per product: product ID, free trial yes/no, trial length, app text matches yes/no, action taken.

---

## LOW MANUAL / PRODUCT DECISION TASKS

### L-2 — npm audit fix

If not already done:

```bash
npm audit
npm audit fix
npm audit
```

If `npm audit fix --force` is required, do not run it without owner approval. Record remaining vulnerabilities and whether they are dev/build-only or production-impacting.

Status: `FIXED` if resolved without breaking build/tests. `PARTIAL` if some remain with justification. `BLOCKED` if force upgrade requires owner approval.

### L-16 — Weekly plan discrepancy

State of play:

- Web paywall shows weekly / monthly / yearly.
- Mobile paywall reportedly shows only monthly / yearly.
- RevenueCat offering includes `$rc_weekly`.

Decision options:

- A. Show weekly / monthly / yearly consistently on mobile and web.
- B. Hide weekly consistently everywhere.
- C. Keep platform-specific offerings but document why.

Required:

1. Inspect App Store Connect weekly product status.
2. Inspect RevenueCat `$rc_weekly` package.
3. Inspect mobile and web paywalls.
4. Choose and document the decision.
5. If code changes are needed, make them or mark `CODE REQUIRED`.
6. Verify final behavior is consistent with the decision.

---

## Output format

### atlas.core Manual Remediation Completion Report

**Executive summary**
- Overall status: PASS / PARTIAL PASS / FAIL
- Manual tasks completed:
- Manual tasks blocked:
- Manual tasks requiring owner action:
- Code follow-up required:

**Completed manual tasks**

| ID | Task | Status | Evidence | Dashboard / Xcode location | Remaining action |

**Blocked tasks**

| ID | Task | Blocking reason | Exact owner action required | Link / location to complete |

**App Store Connect verification**
Terms URL · Privacy URL · subscription products · subscription group · IAP screenshots · sandbox tester · Paid Apps Agreement · trial period configuration.

**RevenueCat verification**
iOS app bundle ID · entitlement `pro` · products linked · Current offering · `$rc_weekly` / `$rc_monthly` / `$rc_annual` · shared secret configured · webhook URL configured · webhook test result if available.

**Supabase verification**
`REVENUECAT_WEBHOOK_SECRET` · updated rotated secrets · edge function secret status · do not print secret values.

**Xcode / iOS verification**
IAP capability · StoreKit config file · scheme StoreKit config · HealthKit purpose strings · archive / upload status · build number uploaded.

**Physical device testing**
sandbox purchase test result · restore purchases test result · device · iOS version · app build number · product tested · RevenueCat entitlement result · Supabase subscription / webhook result.

**Secret rotation / git history**
provider-by-provider rotation status · `.env.local` git history scrub status · force-push status · remaining owner approval required.

**Final verdict** (choose exactly one)
- PASS: all manual tasks completed or properly verified.
- PARTIAL PASS: some manual tasks completed, but owner action remains.
- FAIL: critical manual blockers remain.

Be strict. Do not mark anything complete without direct evidence.
