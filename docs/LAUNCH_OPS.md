# Atlas Core — Launch Ops Playbook

**Last updated:** 2026-03-27
**Owner:** Enzo Soler

---

## 1. Known Limitations at Launch

| # | Area | Limitation | Workaround |
|---|------|-----------|------------|
| 1 | Stripe webhooks | `STRIPE_WEBHOOK_SECRET` in Supabase secrets is misconfigured — webhook signature verification fails | The `complete-checkout` edge function is the primary activation path. It's called directly from the frontend after Stripe redirects back, so subscriptions activate without needing the webhook. |
| 2 | AI food logging | `log-food-text` edge function returns 401 for some users under specific session states | User can log out and back in to refresh the JWT. Root cause: stale session tokens not refreshing automatically in some edge cases. |
| 3 | Trial period | 7-day trial is set in `create-checkout` — no email reminder before trial ends | Stripe handles trial expiry emails via its built-in dunning. Ensure Stripe email settings are enabled in the Stripe dashboard. |
| 4 | Mobile builds | iOS/Android require separate App Store / Play Store deployment — web-only at launch | Capacitor config is ready. Native builds can be submitted after web launch stabilizes. |

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
