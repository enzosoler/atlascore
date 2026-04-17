# Atlas Core — Launch Ops Playbook

**Last updated:** 2026-04-17
**Owner:** Enzo Soler

> **Recent QA pass (2026-04-17):** see `docs/QA_FINDINGS_2026-04-17.md` for the full audit. Summary of what changed:
> - **Web Stripe activation bug fixed** — `Pricing.jsx` now passes `{CHECKOUT_SESSION_ID}` through the success URL and `TodayV2.jsx` calls `complete-checkout` on return. This is the primary fix for the issue noted in row 1 below.
> - **RevenueCat webhook now grants entitlements** — previously it only recorded commissions. iOS/Android purchases now upsert the `subscriptions` row. See `supabase/functions/revenuecat-webhook/index.ts`.
> - **Broken `stripe-webhook` call removed from `SubscriptionContext`** — it was invoking the wrong function with an invalid payload; it has been replaced with a React Query refetch-with-backoff pattern that waits for the RevenueCat webhook.
> - **Unit tests added** for `lib/entitlements.js` and a contract test guards the checkout success URL against regressing.
> - **Still required:** rotate `STRIPE_WEBHOOK_SECRET` per §5 below. `complete-checkout` is now wired up as a redundant frontend path, but the webhook remains the source of truth for renewals, payment failures, and cancellations.

---

## 1. Known Limitations at Launch

| # | Area | Limitation | Workaround |
|---|------|-----------|------------|
| 1 | Stripe webhooks | `STRIPE_WEBHOOK_SECRET` in Supabase secrets is still misconfigured — webhook signature verification fails until rotated. | **[FIXED 2026-04-17]** `complete-checkout` is now actually called from the frontend as a redundant activation path (previously documented but not wired up). For renewals, payment failures, and cancellations you still need to fix the webhook — see §5. |
| 2 | AI food logging | `log-food-text` edge function returns 401 for some users under specific session states | User can log out and back in to refresh the JWT. Root cause: stale session tokens not refreshing automatically in some edge cases. |
| 3 | Trial period | 7-day trial is set in `create-checkout` — no email reminder before trial ends | Stripe handles trial expiry emails via its built-in dunning. Ensure Stripe email settings are enabled in the Stripe dashboard. |
| 4 | Mobile builds | iOS/Android require separate App Store / Play Store deployment — web-only at launch | Capacitor config is ready. Native builds can be submitted after web launch stabilizes. RevenueCat webhook entitlement sync was wired up on 2026-04-17; configure `REVENUECAT_WEBHOOK_SECRET` before mobile launch. |

---

## 2. Rollback / Kill-Switch Plan

### A. Disable a feature for all users
1. Go to `/admin/settings` in the admin panel
2. Toggle the relevant feature flag off (if implemented) or set the `maintenance_mode` flag
3. Changes take effect immediately — no redeploy needed

### B. Revoke or downgrade a subscription manually
1. Go to `/admin/subscriptions`
2. Find the user by email or ID
3. Use "Grant Access" / "Revoke Access" to override their plan
4. This writes directly to the `subscriptions` table, bypassing Stripe

### C. Take down the entire app
1. In Vercel: go to Deployments → select current deployment → "Instant Rollback" to the previous build
2. Or in Vercel project settings → Environment Variables → set `VITE_MAINTENANCE=true` and redeploy

### D. Ban or suspend a user
1. Go to `/admin/users` → find user → Suspend (7-day ban) or Ban (permanent)
2. This calls `supabase.auth.admin.updateUserById` with `banned_until`
3. Banned users are blocked at the auth layer — no app-level changes needed

### E. Emergency: disable Stripe checkout entirely
1. In Stripe Dashboard → Developers → Restricted Keys → revoke the live key
2. The `create-checkout` edge function will return 500 with a clear error
3. Update `STRIPE_SECRET_KEY` in Supabase secrets when ready to re-enable

---

## 3. On-Call Procedure

**Primary responder:** Enzo Soler
**Monitoring:** `/admin/errors` panel — check for spike in error rate
**Logs:** Supabase Dashboard → Edge Functions → select function → Logs tab

### Triage steps
1. Check `/admin/errors` for recent error messages with context
2. Check Supabase edge function logs for the relevant function
3. If auth-related: check Supabase Auth logs in the Supabase dashboard
4. If payment-related: check Stripe Dashboard → Events for failed webhooks or sessions

### Escalation
- If the DB is down: Supabase status page at https://status.supabase.com
- If Stripe is down: https://status.stripe.com
- If Vercel is down: https://www.vercel-status.com

---

## 4. Launch Day Checklist

- [ ] Verify `STRIPE_SECRET_KEY` is the **live** key (not test `sk_test_...`)
- [ ] Verify `STRIPE_PRICE_US_MONTHLY_*` and `STRIPE_PRICE_US_YEARLY_*` are live price IDs
- [ ] Confirm Stripe webhook is pointed at production URL (even if currently broken — for future fix)
- [ ] Confirm Supabase project is not paused (check project status)
- [ ] Smoke test: create account → select plan → complete checkout → verify subscription row in DB
- [ ] Check `/admin/errors` is empty or only showing expected events
- [ ] Confirm Vercel Analytics is receiving pageview data

---

## 5. Post-Launch: Fix Stripe Webhook

The webhook signature mismatch is the only broken infra piece. To fix after launch:

1. In Stripe Dashboard → Webhooks → find the endpoint for the Supabase function URL
2. Copy the **Signing secret** (`whsec_...`)
3. In Supabase Dashboard → Project Settings → Edge Functions → Secrets → update `STRIPE_WEBHOOK_SECRET`
4. Test with a `stripe trigger checkout.session.completed` from the Stripe CLI
5. Once confirmed working, the webhook becomes the primary activation path (redundant with `complete-checkout`)
