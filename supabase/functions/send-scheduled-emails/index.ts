/**
 * send-scheduled-emails — Atlas Core Scheduled Email Dispatcher
 *
 * Runs on a cron schedule to send time-sensitive emails:
 *   - Trial ending (48h before expiry)
 *   - Trial expired (on the day of expiry)
 *   - Inactivity nudge (3–5 days no activity)
 *   - Weekly progress report (every Monday)
 *
 * Set up with pg_cron in Supabase or via Supabase's built-in cron:
 *   supabase functions deploy send-scheduled-emails
 *
 * Then in Supabase Dashboard → Database → Extensions → pg_cron:
 *   SELECT cron.schedule('atlas-scheduled-emails', '0 8 * * *',
 *     $$SELECT net.http_post(
 *       url:='https://<project>.supabase.co/functions/v1/send-scheduled-emails',
 *       headers:='{"Authorization":"Bearer <SERVICE_ROLE_KEY>","Content-Type":"application/json"}'::jsonb,
 *       body:='{}'::jsonb
 *     ) AS request_id;$$
 *   );
 *
 * The function is idempotent — it checks email_events to avoid duplicate sends.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { buildPreflightResponse, getCorsHeaders } from '../_shared/cors.ts';

const APP_URL = Deno.env.get('APP_URL') || 'https://useatlascore.com';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const SEND_EMAIL_URL = `${SUPABASE_URL}/functions/v1/send-email`;


// ─── Types ──────────────────────────────────────────────────────────────────

interface UserEmailTarget {
  userId: string;
  email: string;
  firstName: string;
  language: 'en';
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function nameFromMeta(meta: Record<string, unknown>, email: string): string {
  const fullName = (meta?.full_name || meta?.name || '') as string;
  if (fullName) return fullName.trim().split(/\s+/)[0];
  return email.split('@')[0] || '';
}

function langFromMeta(_meta: Record<string, unknown>): 'en' {
  return 'en';
}

async function sendEmail(opts: {
  type: string;
  to: string;
  userId: string;
  language: string;
  payload: Record<string, unknown>;
}): Promise<boolean> {
  try {
    const res = await fetch(SEND_EMAIL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ ...opts }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.warn(`send-scheduled-emails: [${opts.type}] → ${opts.to} failed ${res.status}:`, text);
      return false;
    }

    console.log(`send-scheduled-emails: ✓ [${opts.type}] → ${opts.to}`);
    return true;
  } catch (e) {
    console.warn(`send-scheduled-emails: [${opts.type}] → ${opts.to} exception:`, e);
    return false;
  }
}

// Check if an email of this type was sent within the last N days for a user
async function wasSentRecently(
  admin: ReturnType<typeof createClient>,
  userId: string,
  type: string,
  withinHours: number
): Promise<boolean> {
  const since = new Date(Date.now() - withinHours * 60 * 60 * 1000).toISOString();
  const { data } = await admin
    .from('email_events')
    .select('id')
    .eq('user_id', userId)
    .eq('type', type)
    .eq('status', 'sent')
    .gte('created_at', since)
    .limit(1);

  return (data?.length ?? 0) > 0;
}

// ─── Job: Trial Ending ───────────────────────────────────────────────────────

async function runTrialEnding(admin: ReturnType<typeof createClient>): Promise<number> {
  // Find users whose trial ends in 24–72h (catch 48h window)
  const now = new Date();
  const from = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
  const to = new Date(now.getTime() + 72 * 60 * 60 * 1000).toISOString();

  const { data: subs } = await admin
    .from('subscriptions')
    .select('user_id, trial_ends_at')
    .eq('status', 'trialing')
    .gte('trial_ends_at', from)
    .lte('trial_ends_at', to);

  if (!subs?.length) return 0;

  let sent = 0;
  for (const sub of subs) {
    const alreadySent = await wasSentRecently(admin, sub.user_id, 'trial_ending', 48);
    if (alreadySent) continue;

    // Fetch user details
    const { data: userData } = await admin.auth.admin.getUserById(sub.user_id);
    if (!userData?.user?.email) continue;

    const { user } = userData;
    const meta = user.user_metadata ?? {};
    const target: UserEmailTarget = {
      userId: sub.user_id,
      email: user.email!,
      firstName: nameFromMeta(meta, user.email!),
      language: langFromMeta(meta),
    };

    const trialEnd = new Date(sub.trial_ends_at);
    const hoursLeft = Math.round((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60));
    const daysLeft = Math.ceil(hoursLeft / 24);

    const ok = await sendEmail({
      type: 'trial_ending',
      to: target.email,
      userId: target.userId,
      language: target.language,
      payload: {
        firstName: target.firstName,
        trialDaysLeft: daysLeft,
        trialEndsAt: sub.trial_ends_at,
        appUrl: APP_URL,
      },
    });

    if (ok) sent++;
  }

  return sent;
}

// ─── Job: Trial Expired ─────────────────────────────────────────────────────

async function runTrialExpired(admin: ReturnType<typeof createClient>): Promise<number> {
  // Find users whose trial expired in the last 48h (not yet updated to expired status)
  const now = new Date();
  const from = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();

  const { data: subs } = await admin
    .from('subscriptions')
    .select('user_id, trial_ends_at')
    .eq('status', 'trialing')
    .lte('trial_ends_at', now.toISOString())
    .gte('trial_ends_at', from);

  if (!subs?.length) return 0;

  let sent = 0;
  for (const sub of subs) {
    const alreadySent = await wasSentRecently(admin, sub.user_id, 'trial_expired', 72);
    if (alreadySent) continue;

    const { data: userData } = await admin.auth.admin.getUserById(sub.user_id);
    if (!userData?.user?.email) continue;

    const { user } = userData;
    const meta = user.user_metadata ?? {};
    const target: UserEmailTarget = {
      userId: sub.user_id,
      email: user.email!,
      firstName: nameFromMeta(meta, user.email!),
      language: langFromMeta(meta),
    };

    const ok = await sendEmail({
      type: 'trial_expired',
      to: target.email,
      userId: target.userId,
      language: target.language,
      payload: { firstName: target.firstName, appUrl: APP_URL },
    });

    if (ok) {
      // Update subscription status to expired
      await admin.from('subscriptions').update({ status: 'expired' }).eq('user_id', sub.user_id).eq('status', 'trialing');
      sent++;
    }
  }

  return sent;
}

// ─── Job: Inactivity Nudge ───────────────────────────────────────────────────

async function runInactivityNudge(admin: ReturnType<typeof createClient>): Promise<number> {
  // Find active/trialing users who haven't logged anything in 3–5 days
  // We check auth.users.last_sign_in_at as a proxy for activity
  // (In production, query workout_sessions / food_logs for true last-activity)
  const now = new Date();
  const inactiveFrom = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString();
  const inactiveTo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();

  // Get all active/trialing subscription user IDs
  const { data: subs } = await admin
    .from('subscriptions')
    .select('user_id')
    .in('status', ['active', 'trialing']);

  if (!subs?.length) return 0;

  let sent = 0;

  for (const sub of subs) {
    // Skip if already nudged recently (within 7 days)
    const alreadySent = await wasSentRecently(admin, sub.user_id, 'inactivity_nudge', 7 * 24);
    if (alreadySent) continue;

    const { data: userData } = await admin.auth.admin.getUserById(sub.user_id);
    if (!userData?.user?.email) continue;

    const { user } = userData;
    const lastSignIn = user.last_sign_in_at ? new Date(user.last_sign_in_at) : null;

    // Only nudge if last sign-in is in the 3–5 day inactive window
    if (!lastSignIn || lastSignIn.toISOString() < inactiveFrom || lastSignIn.toISOString() > inactiveTo) {
      continue;
    }

    const meta = user.user_metadata ?? {};
    const daysSince = Math.round((now.getTime() - lastSignIn.getTime()) / (1000 * 60 * 60 * 24));

    const ok = await sendEmail({
      type: 'inactivity_nudge',
      to: user.email!,
      userId: sub.user_id,
      language: langFromMeta(meta),
      payload: {
        firstName: nameFromMeta(meta, user.email!),
        lastActivityDays: daysSince,
        appUrl: APP_URL,
      },
    });

    if (ok) sent++;
  }

  return sent;
}

// ─── Job: Weekly Report ──────────────────────────────────────────────────────

async function runWeeklyReport(admin: ReturnType<typeof createClient>): Promise<number> {
  // Only run on Mondays (day 1)
  const today = new Date();
  if (today.getDay() !== 1) {
    console.log('send-scheduled-emails: weekly report skipped (not Monday)');
    return 0;
  }

  // Get all active/trialing users who haven't received a weekly report this week
  const { data: subs } = await admin
    .from('subscriptions')
    .select('user_id')
    .in('status', ['active', 'trialing']);

  if (!subs?.length) return 0;

  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  let sent = 0;

  for (const sub of subs) {
    const alreadySent = await wasSentRecently(admin, sub.user_id, 'weekly_report', 6 * 24);
    if (alreadySent) continue;

    const { data: userData } = await admin.auth.admin.getUserById(sub.user_id);
    if (!userData?.user?.email) continue;

    const { user } = userData;
    const meta = user.user_metadata ?? {};

    // Fetch workout count for the past week
    const { count: workoutCount } = await admin
      .from('workout_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', sub.user_id)
      .gte('created_at', weekAgo.toISOString());

    // Fetch nutrition log days for the past week
    const { count: nutritionCount } = await admin
      .from('food_logs')
      .select('logged_date', { count: 'exact', head: true })
      .eq('user_id', sub.user_id)
      .gte('logged_date', weekAgo.toISOString().split('T')[0]);

    // Fetch body weight change (latest two measurements)
    const { data: weights } = await admin
      .from('body_measurements')
      .select('weight, measured_at')
      .eq('user_id', sub.user_id)
      .order('measured_at', { ascending: false })
      .limit(2);

    let weightChange: number | undefined;
    if (weights && weights.length === 2 && weights[0].weight && weights[1].weight) {
      weightChange = parseFloat((weights[0].weight - weights[1].weight).toFixed(1));
    }

    const ok = await sendEmail({
      type: 'weekly_report',
      to: user.email!,
      userId: sub.user_id,
      language: langFromMeta(meta),
      payload: {
        firstName: nameFromMeta(meta, user.email!),
        weekWorkouts: workoutCount ?? 0,
        weekNutritionDays: nutritionCount ?? 0,
        weightChange,
        appUrl: APP_URL,
      },
    });

    if (ok) sent++;
  }

  return sent;
}

// ─── Handler ─────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') {
    return buildPreflightResponse(req);
  }

  // Verify this is a service-role call (cron or internal)
  const authHeader = req.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '');
  if (!SERVICE_ROLE_KEY || token !== SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // Parse optional job filter from body
  let jobs: string[] = ['trial_ending', 'trial_expired', 'inactivity_nudge', 'weekly_report'];
  try {
    const body = await req.json();
    if (body.jobs && Array.isArray(body.jobs)) jobs = body.jobs;
  } catch {
    // No body — run all jobs
  }

  const results: Record<string, number> = {};
  const start = Date.now();

  if (jobs.includes('trial_ending'))    results.trial_ending    = await runTrialEnding(admin);
  if (jobs.includes('trial_expired'))   results.trial_expired   = await runTrialExpired(admin);
  if (jobs.includes('inactivity_nudge')) results.inactivity_nudge = await runInactivityNudge(admin);
  if (jobs.includes('weekly_report'))   results.weekly_report   = await runWeeklyReport(admin);

  const elapsed = Date.now() - start;
  console.log(`send-scheduled-emails: done in ${elapsed}ms`, results);

  return new Response(JSON.stringify({ success: true, results, elapsed }), {
    status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
