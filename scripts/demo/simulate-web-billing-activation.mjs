#!/usr/bin/env node

import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

const here = path.dirname(new URL(import.meta.url).pathname);
const helperUrl = pathToFileURL(
  path.resolve(here, '../../supabase/functions/_shared/subscription-write.js'),
).href;
const { writeSubscriptionByUserId } = await import(helperUrl);

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const TARGET_EMAIL = process.env.E2E_USER_EMAIL || process.argv[2] || 'e2e-user@example.com';
const TARGET_PASSWORD = process.env.E2E_USER_PASSWORD || process.argv[3];
if (!TARGET_PASSWORD) { console.error('E2E_USER_PASSWORD env var or argv[3] required'); process.exit(1); }
const TARGET_NAME = process.env.E2E_USER_NAME || 'E2E User';
const PLAN = process.env.E2E_BILLING_PLAN || 'pro';

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function listUsers() {
  try {
    const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (error) throw error;
    return data?.users || [];
  } catch {
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) throw error;
    return data?.users || [];
  }
}

async function ensureUser() {
  const users = await listUsers();
  const existing = users.find((user) => user.email?.toLowerCase() === TARGET_EMAIL.toLowerCase());
  const metadata = {
    full_name: TARGET_NAME,
    atlas_role: 'athlete',
    onboarding_completed: true,
    language: 'en',
  };

  if (existing) {
    const { data, error } = await supabase.auth.admin.updateUserById(existing.id, {
      password: TARGET_PASSWORD,
      email_confirm: true,
      user_metadata: {
        ...(existing.user_metadata || {}),
        ...metadata,
      },
    });
    if (error) throw error;
    return data.user;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: TARGET_EMAIL,
    password: TARGET_PASSWORD,
    email_confirm: true,
    user_metadata: metadata,
  });
  if (error) throw error;
  return data.user;
}

async function ensureProfile(user) {
  const { error } = await supabase.from('profiles').upsert({
    id: user.id,
    role: 'user',
    full_name: TARGET_NAME,
    email: TARGET_EMAIL,
    onboarding_completed: true,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'id' });

  if (error) throw error;
}

const now = new Date();
const periodEnd = new Date(now.getTime() + 31 * 24 * 60 * 60 * 1000);
const stripeSuffix = Date.now();

const user = await ensureUser();
await ensureProfile(user);

const writeResult = await writeSubscriptionByUserId(supabase, {
  user_id: user.id,
  user_email: TARGET_EMAIL,
  tier: PLAN,
  status: 'active',
  stripe_customer_id: null,
  stripe_subscription_id: `sub_e2e_${stripeSuffix}`,
  stripe_price_id: 'price_e2e_simulated',
  current_period_starts_at: now.toISOString(),
  current_period_ends_at: periodEnd.toISOString(),
  cancel_at_period_end: false,
});

const eventId = `evt_e2e_${stripeSuffix}`;
const { error: eventError } = await supabase
  .from('stripe_webhook_events')
  .upsert({
    stripe_event_id: eventId,
    event_type: 'checkout.session.completed',
    processed_at: new Date().toISOString(),
  }, { onConflict: 'stripe_event_id' });

if (eventError) {
  throw eventError;
}

const { data: currentRows, error: currentError } = await supabase
  .from('subscriptions')
  .select('id,status,tier,stripe_subscription_id,current_period_ends_at')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false });

if (currentError) {
  throw currentError;
}

const currentCount = (currentRows || []).filter((row) =>
  ['trialing', 'active', 'granted', 'past_due'].includes(row.status)
).length;

console.log(JSON.stringify({
  email: TARGET_EMAIL,
  password: TARGET_PASSWORD,
  userId: user.id,
  eventId,
  action: writeResult.action,
  currentCount,
  latest: currentRows?.[0] || null,
}, null, 2));
