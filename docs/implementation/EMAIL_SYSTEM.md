# Atlas Core — Email System

Production-grade transactional email system built on **Resend**, replacing all Supabase default emails.

---

## Architecture Overview

```
User action / Cron
      │
      ▼
Frontend emailService.js
  OR  Supabase Auth webhook
      │
      ▼
Edge Function: send-email          ← main dispatcher (all 11 types)
Edge Function: send-password-reset ← generates link + sends
Edge Function: send-scheduled-emails ← cron: trial/inactivity/weekly
      │
      ▼
Resend API (noreply@atlascore.app)
      │
      ▼
User inbox
      │
      ▼
email_events table  ← audit log (every send/failure)
```

---

## Step 1 — Disable Supabase Default Emails

Supabase sends its own plain-text emails for signup confirmation, password reset, and magic links. You must disable these so users only receive the Atlas branded emails.

### Option A — Disable in Supabase Dashboard (Recommended)

1. Go to **Supabase Dashboard → Authentication → Email Templates**
2. For each template (Confirm Signup, Reset Password, Magic Link):
   - Replace the **Subject** with `[Atlas] No-op — handled by Resend`
   - Replace the **Body** with a blank placeholder or:
     ```
     This email is handled by Atlas Core's email system. If you received this, please contact support@atlascore.app.
     ```
3. Go to **Authentication → Settings → Email**:
   - Set **"Enable email confirmations"** → your preference
   - If you want the auth flow to work without confirmation (users logged in immediately on signup), set it to **disabled**. Our on-auth-user-created hook still sends the confirmation email via Resend, but Supabase won't block login.
   - If you want strict email confirmation before login: **keep it enabled** — users will need to click the link in our branded email before they can sign in.

### Option B — Configure Custom SMTP via Resend SMTP Bridge

If you need Supabase to "send" emails through Resend's infrastructure (for Supabase's own link generation), you can configure Resend as a custom SMTP provider:

- **SMTP Host**: `smtp.resend.com`
- **SMTP Port**: `465` (SSL) or `587` (TLS)
- **Username**: `resend`
- **Password**: Your `RESEND_API_KEY`
- **Sender**: `noreply@atlascore.app`

This routes Supabase's own emails through Resend. However, you lose control of the template. **Preferred approach is Option A + our custom edge functions.**

---

## Step 2 — Set Supabase Secrets

```bash
# Required
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
supabase secrets set APP_URL=https://atlascore.app
supabase secrets set FROM_EMAIL="Atlas Core <noreply@atlascore.app>"
```

The `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are automatically injected into all edge functions by Supabase.

---

## Step 3 — Run the Migration

```bash
supabase db push
# or apply manually:
supabase migration up
```

Migration `004_add_language_email_events.sql` adds:
- `language` column to `profiles` table (`en` | `pt`, default `en`)
- `full_name` column to `profiles` table
- `email_events` audit log table with RLS

---

## Step 4 — Deploy Edge Functions

```bash
# Deploy all four functions
supabase functions deploy send-email
supabase functions deploy send-password-reset
supabase functions deploy on-auth-user-created
supabase functions deploy send-scheduled-emails
```

---

## Step 5 — Configure Auth Webhook

In **Supabase Dashboard → Authentication → Hooks**:

| Hook | Function |
|------|----------|
| Send Email (on signup) | `on-auth-user-created` |

> **Note**: The "Send Email" hook intercepts Supabase's email sending. Point it to `on-auth-user-created` so our function fires instead of Supabase's default email.

Alternatively, if you can't use the Send Email hook, configure a **Database Webhook** on `auth.users` INSERT events pointing to `on-auth-user-created`.

---

## Step 6 — Configure Scheduled Emails (Cron)

Set up a daily cron job using `pg_cron` or Supabase's built-in cron:

```sql
-- In Supabase Dashboard → Database → Extensions → enable pg_cron
-- Then in SQL Editor:
SELECT cron.schedule(
  'atlas-scheduled-emails',
  '0 8 * * *',  -- every day at 8:00 UTC
  $$
  SELECT net.http_post(
    url := 'https://<YOUR_PROJECT>.supabase.co/functions/v1/send-scheduled-emails',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.service_role_key'),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
```

Or use Supabase's **Edge Function Cron** (Dashboard → Edge Functions → Schedules).

---

## Email Types

| Type | Trigger | Template |
|------|---------|----------|
| `welcome` | On signup | Onboarding intro, feature list, CTA to app |
| `confirm_email` | On signup (needs confirmation) | Branded confirmation link |
| `reset_password` | Password reset request | Branded recovery link |
| `trial_started` | On signup | Trial activation, what to do in 7 days |
| `trial_ending` | 48h before trial expires | Urgency + upgrade CTA |
| `trial_expired` | Trial period ends | Data safety + reactivation CTA |
| `payment_success` | After successful charge | Receipt + plan details |
| `payment_failed` | After failed charge | Alert + update payment method |
| `inactivity_nudge` | 3–5 days no activity | Gentle re-engagement |
| `weekly_report` | Every Monday | Stats: workouts, nutrition, weight, streak |
| `milestone` | On achievement unlock | Personalised congratulation |

---

## Integration Points

### Auth Flow (AuthContext.jsx)

The password reset flow needs to call our edge function instead of Supabase's native method:

```js
// BEFORE (uses Supabase default email):
await supabase.auth.resetPasswordForEmail(email);

// AFTER (uses our branded email):
import { email as emailService } from '@/lib/emailService';
await emailService.passwordReset({ email });
```

### Billing (Stripe Webhooks)

In your Stripe webhook handler (edge function or server), call `email.paymentSuccess()` / `email.paymentFailed()`:

```js
import { emailEvents } from '@/lib/emailService';

// In Stripe webhook handler:
case 'invoice.payment_succeeded':
  emailEvents.onPaymentSuccess({
    user: { email: customerEmail, full_name: customerName, id: userId },
    planName: 'Pro',
    amount: '$19.99',
    invoiceUrl: invoice.hosted_invoice_url,
  });
  break;

case 'invoice.payment_failed':
  emailEvents.onPaymentFailed({
    user: { email: customerEmail, full_name: customerName, id: userId },
  });
  break;
```

### Workout Completion

After a workout is saved, check milestone thresholds:

```js
import { emailEvents } from '@/lib/emailService';

// After saving a workout:
const { count } = await supabase
  .from('workout_sessions')
  .select('id', { count: 'exact', head: true })
  .eq('user_id', user.id);

if (count === 1) emailEvents.onFirstWorkout({ user });
if ([5, 10].includes(count)) emailEvents.onWorkoutCountMilestone({ user, totalWorkouts: count });
```

---

## Example Payloads

```js
// Welcome
email.welcome({ email: 'user@example.com', firstName: 'João', language: 'pt', userId });

// Confirmation
email.confirmEmail({ email, firstName, confirmUrl: 'https://...', language: 'en', userId });

// Password reset (awaitable)
await email.passwordReset({ email: 'user@example.com', language: 'pt' });

// Trial ending
email.trialEnding({ email, firstName, trialDaysLeft: 2, trialEndsAt: '2026-03-22T00:00:00Z', language: 'en', userId });

// Payment success
email.paymentSuccess({ email, firstName, planName: 'Pro', amount: '$19.99', invoiceUrl, language: 'pt', userId });

// Weekly report
email.weeklyReport({
  email, firstName,
  weekWorkouts: 4,
  weekNutritionDays: 5,
  weightChange: -0.3,
  currentStreak: 12,
  language: 'en',
  userId,
});

// Milestone
email.milestone({ email, firstName, milestoneKey: 'streak_7', language: 'pt', userId });
```

---

## Audit Log

Every email send is recorded in `public.email_events`:

```sql
SELECT type, email, language, status, resend_id, created_at
FROM email_events
ORDER BY created_at DESC
LIMIT 50;
```

Fields: `user_id`, `email`, `type`, `language`, `status` (sent/failed/skipped), `resend_id`, `error_message`, `metadata`, `created_at`.

---

## Resend Domain Verification

Before emails can be sent from `noreply@atlascore.app`:

1. Log into [resend.com](https://resend.com)
2. Go to **Domains → Add Domain**
3. Enter `atlascore.app`
4. Add the provided DNS records (SPF, DKIM, DMARC) to your domain's DNS
5. Verify → you can now send from `*@atlascore.app`

---

## Testing

```bash
# Test welcome email (requires valid user JWT)
curl -X POST https://<project>.supabase.co/functions/v1/send-email \
  -H "Authorization: Bearer <USER_JWT>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "weekly_report",
    "to": "test@example.com",
    "language": "en",
    "payload": {
      "firstName": "Enzo",
      "weekWorkouts": 4,
      "weekNutritionDays": 6,
      "weightChange": -0.5,
      "currentStreak": 14
    }
  }'

# Test scheduled emails (requires service role key)
curl -X POST https://<project>.supabase.co/functions/v1/send-scheduled-emails \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"jobs": ["trial_ending"]}'
```
