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
const TARGET_PASSWORD = process.env.E2E_USER_PASSWORD || process.argv[3] || 'AtlasAuth#2026';
const TARGET_NAME = process.env.E2E_USER_NAME || 'E2E User';

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

async function ensureAuthUser() {
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

    if (error) {
      throw error;
    }

    return data.user;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: TARGET_EMAIL,
    password: TARGET_PASSWORD,
    email_confirm: true,
    user_metadata: metadata,
  });

  if (error) {
    throw error;
  }

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

  if (error) {
    throw error;
  }
}

async function ensureSubscription(user) {
  const now = new Date();
  const trialEndsAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  await writeSubscriptionByUserId(supabase, {
    user_id: user.id,
    tier: 'free',
    status: 'trialing',
    trial_starts_at: now.toISOString(),
    trial_ends_at: trialEndsAt.toISOString(),
  });
}

const user = await ensureAuthUser();
await ensureProfile(user);
await ensureSubscription(user);

console.log(JSON.stringify({
  email: TARGET_EMAIL,
  password: TARGET_PASSWORD,
  userId: user.id,
  emailConfirmed: Boolean(user.email_confirmed_at),
}, null, 2));
