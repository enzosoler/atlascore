# RevenueCat Setup Guide — atlas.core

A literal step-by-step from "I have nothing" to "products purchasable in TestFlight, Play Internal Testing, and Web checkout." No prior RevenueCat knowledge assumed.

Brand is `atlas.core` (lowercase, with a dot). Never write "Atlas Core" or "AtlasCore" in product names, descriptions, or store listings.

At the end of this guide you will have:
- A RevenueCat project with iOS + Android + Web apps connected
- Three auto-renewable subscription products live in App Store Connect, Google Play Console, and Stripe
- One entitlement (`pro`) that all three products grant
- One offering (`default`) with three packages (`$rc_weekly`, `$rc_monthly`, `$rc_annual`)
- API keys set in `.env.local` and Netlify/Vercel
- A Supabase Edge Function receiving RevenueCat webhooks and syncing the `tier` field on the user
- At least one successful sandbox purchase on iOS and one on Android

Estimated time end-to-end: 4 to 8 hours, most of which is waiting on Apple/Google paperwork review.

---

## 0. Prerequisites

Before you start, you need:
- An Apple Developer Program membership (99 USD/year, active). This must be a paid account. Free developer accounts cannot ship subscriptions.
- A Google Play Developer account (25 USD one-time). Must have completed identity verification.
- A Stripe account (free). Business details and bank account filled in.
- A Supabase project for atlas.core (you already have one).
- Admin access to your domain's DNS if you plan to use a custom subdomain for the Stripe customer portal return URL (optional).

Gotchas before you spend any time in the RevenueCat dashboard:
- Apple will not let you create subscription products until you have signed the Paid Applications Agreement in App Store Connect and filled out Banking and Tax. This can take 1 to 3 days if your tax documents need review.
- Google will not show "Subscriptions" in Play Console until Banking is filled in under "Payments profile." Can take 2 to 24 hours.
- Stripe requires the account to be out of "test mode" before real webhook secrets work. You can do all the wiring in test mode first and switch to live later.

---

## 1. Create a RevenueCat account

1. Go to https://app.revenuecat.com and click "Sign up."
2. Use your work email (`enzo@chronoinnovation.com` or equivalent).
3. Pick the free "Starter" plan. It is free under 2.5k USD tracked monthly revenue, which is plenty for launch. You can upgrade later with no data migration.
4. Verify your email and log in.

---

## 2. Create the RevenueCat project

1. After first login you will be prompted to create a project.
2. Name it exactly: `atlas.core`
3. If prompted for the project URL slug, use `atlas-core` (RevenueCat does not allow dots in slugs).
4. Skip the "Invite your team" step for now. You can add teammates under Project Settings > Members later.

You are now inside the project. The left sidebar has Apps, Products, Entitlements, Offerings, Customers, Events, Integrations, and Project Settings. You will touch all of them in this guide.

---

## 3. Connect the iOS app

### 3a. Prep in App Store Connect

1. Log in to https://appstoreconnect.apple.com with your Apple Developer account.
2. Go to My Apps > + > New App.
   - Platform: iOS
   - Name: `atlas.core`
   - Primary Language: English (U.S.)
   - Bundle ID: pick or create `com.chronoinnovation.atlascore` (must match what is in `capacitor.config.json` under `appId`)
   - SKU: `atlascore-ios-001` (internal, can be anything unique)
3. In the left sidebar of the app page: Agreements, Tax, and Banking. You must sign the Paid Applications Agreement here. Fill in Bank Account and Tax Info. This step often blocks teams for a full day because Apple reviews the legal entity information.
4. Go to App Information and note the Bundle ID. It must match `appId` in `capacitor.config.json`.

### 3b. Generate the App-Specific Shared Secret

RevenueCat needs this to verify receipts with Apple.

1. In App Store Connect, go to Users and Access > Integrations > In-App Purchase.
2. Click "App-Specific Shared Secret" for `atlas.core`.
3. Click "Generate" (or copy the existing one). This is a 32-char hex string.
4. Save it in 1Password/your password manager as `Apple App-Specific Shared Secret — atlas.core`.

### 3c. Connect in RevenueCat

1. In RevenueCat, click the left sidebar > Project Settings > Apps.
2. Click "+ New app" and choose "App Store."
3. Fill in:
   - App name: `atlas.core (iOS)`
   - Bundle ID: `com.chronoinnovation.atlascore` (must match exactly)
   - App-Specific Shared Secret: paste the secret from step 3b
4. Click "Save app." You should see a green check.
5. On the same page, you will see a "Public API key" starting with `appl_`. Copy it. This goes in `VITE_REVENUECAT_IOS_KEY`.

### 3d. App Store Server Notifications (recommended, optional for MVP)

1. In RevenueCat, open the newly created iOS app.
2. Scroll to "App Store Server Notifications." You will see a URL like `https://api.revenuecat.com/v1/incoming/...`.
3. In App Store Connect, go to the app > App Information > App Store Server Notifications and paste the Production Server URL and Sandbox Server URL there. Set Version to Version 2.
4. This lets RevenueCat receive real-time events from Apple without polling.

---

## 4. Connect the Android app

### 4a. Prep in Google Play Console

1. Log in to https://play.google.com/console.
2. Create app: All apps > Create app.
   - App name: `atlas.core`
   - Default language: English (United States)
   - App or game: App
   - Free or paid: Free (the app is free; it contains in-app subscriptions)
3. Under Monetization setup > Payments profile: create or link a payments profile. Fill in bank account, tax info, and contact address. Without this, subscriptions are invisible in the sidebar.
4. Under App signing: let Google manage the signing key (default).
5. Upload at least one draft APK/AAB to the Internal Testing track. Subscriptions will not show up in the sidebar until there is an uploaded build.

### 4b. Create a Google Play service account for RevenueCat

RevenueCat uses a service account to verify purchases with Google.

1. Go to https://console.cloud.google.com (same Google account).
2. Select the project that Play Console created for your app (it usually shows up automatically).
3. APIs & Services > Library > search "Google Play Android Developer API" > Enable.
4. IAM & Admin > Service Accounts > + Create service account.
   - Name: `revenuecat-atlascore`
   - Role: none (we grant permissions inside Play Console, not here)
5. On the service account row, click the three dots > Manage keys > Add key > Create new key > JSON. Download the file. Treat it like a password; do not commit it to git.
6. Back in Play Console > Users and permissions > Invite new users. Paste the service account email (ends in `@...iam.gserviceaccount.com`).
7. Under App permissions, grant access to `atlas.core` with these scopes:
   - View financial data, orders, and cancellation survey responses
   - Manage orders and subscriptions
8. Send invite.

### 4c. Connect in RevenueCat

1. In RevenueCat, Project Settings > Apps > + New app > Play Store.
2. Fill in:
   - App name: `atlas.core (Android)`
   - Package name: `com.chronoinnovation.atlascore` (must match `capacitor.config.json` `appId`)
   - Google Service Account credentials JSON: upload the JSON file from step 4b
3. RevenueCat will run a validation check. If it says "The service account does not have permission," wait 24 hours (Google caches permissions) or re-check step 4b.6.
4. Copy the "Public API key" starting with `goog_`. This goes in `VITE_REVENUECAT_ANDROID_KEY`.

---

## 5. Connect Stripe for web

### 5a. Prep in Stripe

1. Log in to https://dashboard.stripe.com.
2. Create a Product > Subscription for each of the three pro plans (see step 6).
3. Go to Developers > API keys. Copy the Publishable key (starts with `pk_test_` or `pk_live_`). This goes in `VITE_REVENUECAT_WEB_KEY` only if you are using RevenueCat Billing (Stripe via RevenueCat). If you are running Stripe directly, this goes in `VITE_STRIPE_PUBLISHABLE_KEY` instead.
4. Copy the Secret key (starts with `sk_`). This goes in Supabase Edge Function env as `STRIPE_SECRET_KEY`.

### 5b. Connect Stripe to RevenueCat (optional — only if you want RevenueCat to be the single source of truth across platforms)

1. In RevenueCat, Project Settings > Apps > + New app > Stripe.
2. Follow the OAuth flow. You will be redirected to Stripe to authorize.
3. Copy the "Public API key" starting with `strp_`. This goes in `VITE_REVENUECAT_WEB_KEY`.

If you prefer to keep Stripe separate (the existing `stripe-webhook` Edge Function path), skip this step and set `VITE_REVENUECAT_WEB_KEY` to an empty string. The app will fall back to the existing Stripe Checkout flow for web users.

---

## 6. Create the three subscription products

You create these in the native stores first, then link them inside RevenueCat.

The three products are:
| Product ID                   | Price      | Trial        | Billing period |
| ---------------------------- | ---------- | ------------ | -------------- |
| `atlas_core_pro_weekly`      | 3.99 USD   | none         | 1 week         |
| `atlas_core_pro_monthly`     | 9.99 USD   | 7-day trial  | 1 month        |
| `atlas_core_pro_yearly`      | 79.00 USD  | 7-day trial  | 1 year         |

All three belong to the same subscription group so only one can be active at a time and upgrades/downgrades work correctly.

### 6a. In App Store Connect

1. Open the iOS app > Monetization > Subscriptions.
2. Create a Subscription Group:
   - Reference Name: `atlas_core_pro`
   - Display Name: `atlas.core Pro`
3. Inside the group, click "+" to create the first subscription:
   - Reference Name: `atlas_core_pro_weekly`
   - Product ID: `atlas_core_pro_weekly` (must match exactly — this is what RevenueCat looks up)
   - Subscription Duration: 1 week
   - Pricing: 3.99 USD, tier that matches 3.99 in your base currency
   - Localizations: add English (U.S.) — Display Name `Pro Weekly`, Description `Unlimited access, billed weekly.`
   - Review Information: paste a screenshot of the paywall (App Review needs this) and a review note like `Paywall reached from Settings > Subscription in the app.`
4. Repeat for `atlas_core_pro_monthly`:
   - Duration: 1 month
   - Price: 9.99 USD
   - Introductory Offer: Free Trial, 7 days, type "pay as you go" / "free."
5. Repeat for `atlas_core_pro_yearly`:
   - Duration: 1 year
   - Price: 79.00 USD
   - Introductory Offer: Free Trial, 7 days.
6. Each product will say "Missing Metadata" until you fill in localizations and a review screenshot. You must then click "Submit for Review" on each — or Apple will reject the first app submission. Products review in the app review queue, not separately.

### 6b. In Google Play Console

1. Open the Android app > Monetize > Products > Subscriptions.
2. Click "Create subscription."
   - Product ID: `atlas_core_pro_weekly`
   - Name: `Pro Weekly`
   - Description: `Unlimited access, billed weekly.`
   - Base plan > Create:
     - Base plan ID: `weekly`
     - Billing period: 1 week
     - Auto-renewing: yes
     - Price: 3.99 USD (Google will auto-convert for other regions; review before activating)
3. Repeat for `atlas_core_pro_monthly`:
   - Base plan ID: `monthly`
   - Billing period: 1 month
   - Price: 9.99 USD
   - Offer > Create offer > Free trial, 7 days.
4. Repeat for `atlas_core_pro_yearly`:
   - Base plan ID: `annual`
   - Billing period: 1 year
   - Price: 79.00 USD
   - Offer > Create offer > Free trial, 7 days.
5. Activate each base plan. Google lets you save but not activate until banking is set.

Gotcha: Google Play uses a product/base-plan model; RevenueCat maps the "product + base plan" pair to a single RevenueCat product. When you import in step 7, select the base plan ID along with the product ID.

### 6c. In Stripe

1. Products > + Add product.
2. Name: `atlas.core Pro — Weekly`
   - Pricing: Recurring, 3.99 USD, weekly.
   - Save. Copy the Price ID (starts with `price_...`).
3. Repeat for `atlas.core Pro — Monthly`: 9.99 USD monthly, Free trial 7 days.
4. Repeat for `atlas.core Pro — Yearly`: 79.00 USD yearly, Free trial 7 days.

---

## 7. Import the three products into RevenueCat

1. RevenueCat sidebar > Products > + New product.
2. For each product, pick the store (App Store / Play Store / Stripe) and select the product you just created.
3. Use these exact RevenueCat product IDs (this is what your code will reference via the offerings package; the store product ID and the RevenueCat product ID are separate fields):
   - `atlas_core_pro_weekly`
   - `atlas_core_pro_monthly`
   - `atlas_core_pro_yearly`
4. RevenueCat will fetch metadata from the stores. If it says "Product not found," double-check:
   - App Store: the product is in at least "Ready to Submit" state. Products in "Missing Metadata" are invisible to RevenueCat.
   - Play Store: the base plan is activated (not just saved).
   - Stripe: the product and price are both live (not archived).

---

## 8. Create the `pro` entitlement

1. Sidebar > Entitlements > + New entitlement.
2. Identifier: `pro` (lowercase — this is the string the code checks against in `revenueCat.js`: `ENTITLEMENT_ID = 'pro'`).
3. Display Name: `Pro`
4. Description: `Grants full access to atlas.core Pro features.`
5. Click Save.
6. Open the entitlement and click "Attach products." Attach all three: weekly, monthly, yearly, for all three store platforms. You should see 9 rows total (3 products × 3 stores) if you set up all three platforms.

---

## 9. Create the `default` offering with packages

An Offering is a bundle of Packages you show to users. A Package is a pointer to a Product in each store.

1. Sidebar > Offerings > + New offering.
2. Identifier: `default`
3. Display Name: `Default`
4. Description: `Default offering shown on the paywall.`
5. Mark it as Current. Exactly one offering must be Current at a time.
6. Click into the offering > + New package.
   - Package identifier: `$rc_weekly` (the `$rc_` prefix tells RevenueCat this is a predefined "weekly" package type; the SDK returns this as `weekly` in `current.weekly`).
   - Products: attach `atlas_core_pro_weekly` for App Store, Play Store, and Stripe.
7. Repeat with `$rc_monthly` > `atlas_core_pro_monthly`.
8. Repeat with `$rc_annual` > `atlas_core_pro_yearly`.

Gotcha: the annual package identifier is `$rc_annual`, not `$rc_yearly`. The SDK will not find it otherwise.

---

## 10. Copy the API keys into your env

Open `.env.local` in the repo root (create it if it doesn't exist). Add:

```
VITE_REVENUECAT_IOS_KEY=appl_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_REVENUECAT_ANDROID_KEY=goog_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_REVENUECAT_WEB_KEY=strp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

If you are not using RevenueCat Billing for web (using native Stripe Checkout via the existing `create-checkout` edge function), leave `VITE_REVENUECAT_WEB_KEY` unset and the app will fall through to the Stripe path.

In Netlify (or Vercel), set the same three vars under Site Settings > Environment Variables. Redeploy after adding.

Where to find each key in the RevenueCat dashboard:
- iOS: Project Settings > Apps > atlas.core (iOS) > "Public API key"
- Android: Project Settings > Apps > atlas.core (Android) > "Public API key"
- Web: Project Settings > Apps > atlas.core (Stripe) > "Public API key"

Never commit these keys. They are public (safe to ship to clients) but pollute the git history if leaked in other repos.

---

## 11. Sandbox testing

### 11a. iOS sandbox

1. App Store Connect > Users and Access > Sandbox > Testers > + New tester.
2. Fill in a fake name and a fresh email (must not be linked to an Apple ID already). Google "burner Apple ID" for best practices — do not use your real email.
3. Password: pick something you will remember (Apple's password rules apply).
4. On the test device:
   - Settings > App Store > Sandbox Account > sign in with the sandbox email.
   - Install the app from TestFlight.
   - Open the paywall, tap a package, complete the purchase. You will be prompted with "This will be a sandbox purchase."
5. In RevenueCat > Customers, search by user ID. The sandbox purchase should show up within 30 seconds.

Gotcha: you cannot test on the iOS Simulator; purchases only work on a real device signed in to a sandbox Apple ID.

### 11b. Android sandbox (Internal Testing)

1. Play Console > Testing > Internal testing > Create new release. Upload an AAB signed with your release key.
2. Under Testers, create a list with your own Google account email.
3. Copy the "opt-in URL" and open it on the Android device. Accept.
4. Install the app from the Play Store (not a sideloaded APK). Open the paywall, tap a package. You should see "This is a test purchase. You will not be charged."
5. Gotcha: the Google account used on the device must be in the testers list and must have opted in via the URL. If the purchase goes through at real cost, you did not opt in correctly. Contact Google within 48 hours to refund.

### 11c. Web (Stripe test mode)

1. Stripe dashboard > toggle "Test mode" on.
2. Use test card `4242 4242 4242 4242`, any future expiry, any CVC, any postal code.
3. Purchase completes. Check RevenueCat > Customers to confirm the purchase synced.

---

## 12. Webhook to Supabase Edge Function (for backend sync)

You already have a `revenuecat-webhook` Edge Function. If not, create one.

### 12a. Supabase schema

Add a table to track events (idempotent dedupe, audit trail):

```sql
create table if not exists public.subscription_events (
  id                 uuid primary key default gen_random_uuid(),
  event_id           text unique not null,           -- RevenueCat event_id, for idempotency
  event_type         text not null,                  -- INITIAL_PURCHASE, RENEWAL, CANCELLATION, EXPIRATION, REFUND, etc
  app_user_id        text not null,                  -- matches auth.users.id
  product_identifier text,                           -- atlas_core_pro_monthly, etc.
  entitlement_ids    text[],                         -- ['pro']
  period_type        text,                           -- NORMAL, TRIAL, INTRO
  price              numeric,
  currency           text,
  environment        text,                           -- SANDBOX or PRODUCTION
  store              text,                           -- APP_STORE, PLAY_STORE, STRIPE, PROMOTIONAL
  expiration_at_ms   bigint,
  raw                jsonb not null,
  received_at        timestamptz not null default now()
);

create index if not exists subscription_events_user_idx
  on public.subscription_events(app_user_id, received_at desc);

-- Mirror the "current" state to profiles so feature gates can read it cheaply
alter table public.profiles
  add column if not exists tier text not null default 'free',
  add column if not exists subscription_status text,
  add column if not exists subscription_expires_at timestamptz,
  add column if not exists subscription_product_id text;
```

### 12b. Edge Function

The edge function at `supabase/functions/revenuecat-webhook/index.ts` should:
1. Verify the `Authorization: Bearer <shared-secret>` header matches an env var `REVENUECAT_WEBHOOK_AUTH`.
2. Insert into `subscription_events` with `event_id` for idempotency (on conflict do nothing).
3. For events `INITIAL_PURCHASE`, `RENEWAL`, `PRODUCT_CHANGE`: update `profiles.tier = 'pro'`, `subscription_status = 'active'` (or `'trialing'` if `period_type='TRIAL'`), `subscription_expires_at`, `subscription_product_id`.
4. For events `CANCELLATION`, `EXPIRATION`, `REFUND`: update `profiles.tier = 'free'`, `subscription_status = 'canceled'` or `'expired'`.

Set the env var in the Supabase dashboard > Edge Functions > revenuecat-webhook > Secrets:
- `REVENUECAT_WEBHOOK_AUTH` — pick a long random string, e.g. `openssl rand -hex 32`.

### 12c. Point RevenueCat at it

1. RevenueCat sidebar > Integrations > + Add > Webhook.
2. URL: `https://<project-ref>.supabase.co/functions/v1/revenuecat-webhook`
3. Authorization header value: `Bearer <same random string you set in Supabase secrets>`
4. Send a test event. Check Supabase Function logs — you should see the event logged.

Gotcha: the Supabase URL needs the Function to be deployed first (`supabase functions deploy revenuecat-webhook`). Logs live in the dashboard under the Function.

---

## 13. Fill in `plans.js` product IDs

Once products are live in RevenueCat, edit `src/redesign/archived/v2/billing/plans.js`:

```js
productIdWeekly:  'atlas_core_pro_weekly',
productIdMonthly: 'atlas_core_pro_monthly',
productIdYearly:  'atlas_core_pro_yearly',
```

These IDs are used as a fallback and for display only. The real purchase flow reads the current offering from `Purchases.getOfferings()` at runtime and never depends on these IDs matching exactly.

---

## 14. Checklist: can we ship?

Before submitting to App Review:
- [ ] Paid Applications Agreement signed in App Store Connect
- [ ] Banking and tax filled in App Store Connect
- [ ] Banking and tax filled in Play Console
- [ ] All three iOS products at "Ready to Submit"
- [ ] All three Android base plans Activated
- [ ] Entitlement `pro` attached to all three products on all three stores
- [ ] Offering `default` marked Current with three packages: `$rc_weekly`, `$rc_monthly`, `$rc_annual`
- [ ] `VITE_REVENUECAT_IOS_KEY`, `VITE_REVENUECAT_ANDROID_KEY`, `VITE_REVENUECAT_WEB_KEY` set in `.env.local` and in Netlify/Vercel
- [ ] Webhook URL registered in RevenueCat Integrations and test event succeeds
- [ ] At least one successful sandbox purchase on iOS
- [ ] At least one successful sandbox purchase on Android
- [ ] At least one successful Stripe test-mode purchase on web
- [ ] `profiles.tier` flips to `pro` after a test purchase (check in SQL editor)
- [ ] `profiles.tier` flips back to `free` after a test cancellation or expiration

---

## 15. Common errors and how to fix them

- "No offerings configured." — the SDK returns null current. You forgot to mark an offering as Current, or the device/user region is restricted. Set `default` as Current in RevenueCat.
- "Product not available for purchase." — product is not in Ready state in App Store Connect, or the base plan is not Activated in Play Console. Fix in the store, then wait 15 minutes for RevenueCat to re-sync.
- "The service account does not have permission." — Google Play permissions take up to 24 hours to propagate after you invite a service account. If still failing after 24h, re-check the scopes granted in Play Console Users and permissions.
- "Invalid receipt." — App-Specific Shared Secret is wrong or the app Bundle ID in RevenueCat does not match the signed binary. Re-copy the Shared Secret from App Store Connect.
- Sandbox purchase succeeds but `profiles.tier` stays `free`. — webhook did not fire or auth header is wrong. Check Supabase Function logs. Verify `REVENUECAT_WEBHOOK_AUTH` matches the `Authorization` value RevenueCat is sending.
- "You cannot have two subscriptions in the same group." — this is expected behavior on iOS; when a user upgrades from monthly to yearly, the old one cancels and the new one starts on the next renewal. Do not try to create parallel subscriptions.
- Stripe webhook signing fails. — you must use the signing secret from the specific webhook endpoint you created in Stripe, not the account-wide one. Copy `whsec_...` from the endpoint details page.

---

## 16. Next steps (post-launch)

- Add localized pricing for BRL, MXN, EUR. RevenueCat lets you attach regional products to the same package.
- Swap the default offering for an A/B-tested one (`paywall_v2`) and use the `Experiments` feature in RevenueCat to measure conversion.
- Add promotional offers (win-back discounts) via App Store Connect > Subscription > Subscription Offers. RevenueCat surfaces these as additional packages you can target.
- Wire the `CancelFlow` discount CTA to a RevenueCat "Offer Code" you configure in the dashboard.
