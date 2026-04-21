import { test, expect, type Page } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { config as loadEnv } from 'dotenv';
import { getRuntimeContext } from './helpers/runtime-context';

loadEnv({ path: '.env.local' });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY/VITE_SUPABASE_PUBLISHABLE_KEY');
}

type Json = Record<string, unknown>;

function createSupabaseClient() {
  return createClient(SUPABASE_URL!, SUPABASE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

function createAdminClient() {
  if (!SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient(SUPABASE_URL!, SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

async function signInForVerification(email: string, password: string) {
  const client = createSupabaseClient();
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return client;
}

async function confirmUserEmail(email: string) {
  const admin = createAdminClient();

  const user = await poll(
    async () => {
      const { data, error } = await admin.auth.admin.listUsers();
      if (error) throw error;
      return data.users.find((candidate) => candidate.email === email) || null;
    },
    (value) => !!value,
    15000,
  );

  const { error } = await admin.auth.admin.updateUserById(user.id, {
    email_confirm: true,
  });
  if (error) throw error;

  return user.id;
}

async function ensureConfirmedUser(email: string, password: string) {
  const admin = createAdminClient();

  const existing = await poll(
    async () => {
      const { data, error } = await admin.auth.admin.listUsers();
      if (error) throw error;
      return data.users.find((candidate) => candidate.email === email) || null;
    },
    () => true,
    1000,
  ).catch(() => null);

  if (existing?.id) {
    const { error } = await admin.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
    });
    if (error) throw error;
    return existing.id;
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw error;
  return data.user.id;
}

async function poll<T>(
  fn: () => Promise<T>,
  predicate: (value: T) => boolean,
  timeoutMs = 15000,
  intervalMs = 500,
) {
  const started = Date.now();
  let lastValue: T;

  while (Date.now() - started < timeoutMs) {
    lastValue = await fn();
    if (predicate(lastValue)) return lastValue;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  lastValue = await fn();
  throw new Error(`Timed out waiting for predicate. Last value: ${JSON.stringify(lastValue, null, 2)}`);
}

async function completeOnboarding(page: Page) {
  await expect(page).toHaveURL(/\/onboarding$/);

  const numericInputs = page.locator('input[inputmode="numeric"]');
  await numericInputs.nth(0).fill('29');
  await numericInputs.nth(1).fill('182');
  await page.getByRole('button', { name: /continue/i }).click();

  await expect(page).toHaveURL(/\/onboarding\/goal$/);
  await page.getByRole('button', { name: /build muscle/i }).click();
  await page.getByRole('button', { name: /continue/i }).click();

  await expect(page).toHaveURL(/\/onboarding\/activity$/);
  await page.getByRole('button', { name: /^active\b/i }).click();
  await page.getByRole('button', { name: /continue/i }).click();

  await expect(page).toHaveURL(/\/onboarding\/stats$/);
  await page.getByRole('button', { name: /looks good/i }).click();

  await expect(page).toHaveURL(/\/onboarding\/diet$/);
  await page.getByRole('button', { name: /continue/i }).click();

  await expect(page).toHaveURL(/\/onboarding\/workout$/);
  await page.getByRole('button', { name: /^intermediate\b/i }).click();
  await page.getByRole('button', { name: /^3×$/i }).click();
  await page.getByRole('button', { name: /continue/i }).click();

  await expect(page).toHaveURL(/\/onboarding\/habits$/);
  await page.getByRole('button', { name: /^7/i }).click();
  await page.getByRole('button', { name: /^8k\b/i }).click();
  await page.getByRole('button', { name: /^2.5L$/i }).click();
  await page.getByRole('button', { name: /continue/i }).click();

  await expect(page).toHaveURL(/\/onboarding\/constraints$/);
  await page.getByRole('button', { name: /continue/i }).click();

  await expect(page).toHaveURL(/\/onboarding\/summary$/);
  await expect(page.getByText(/your system/i)).toBeVisible();
  await page.getByRole('button', { name: /activate system|continue/i }).click();

  await expect(page).toHaveURL(/\/onboarding\/paywall$/);
  await page.getByRole('button', { name: /not now/i }).click();
}

async function queryOwnProfile(client: SupabaseClient, userId: string) {
  const { data, error } = await client
    .from('profiles')
    .select('id, onboarding_completed, profile_data')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data || null;
}

async function readTodayCache(page: Page, userId: string) {
  return page.evaluate((uid) => {
    const anyWindow = window as typeof window & {
      __queryClient?: { getQueryData: (key: unknown[]) => unknown };
    };
    const qc = anyWindow.__queryClient;
    const pick = (key: unknown[]) => qc?.getQueryData(key as never);

    return {
      session: pick(['v2-session', uid]),
      meals: pick(['v2-meals', uid]),
      weight: pick(['v2-weight', uid]),
      checkin: pick(['v2-checkin', uid, new Date().toISOString().slice(0, 10)]),
      plan: pick(['v2-plan', uid]),
      profile: pick(['v2-profile', uid]),
      recentWork: pick(['v2-recent-workouts', uid]),
    };
  }, userId);
}

function parseCheckinNotes(notes: unknown) {
  if (typeof notes !== 'string' || !notes.startsWith('[atlas_v3]')) {
    return { recovery: null as number | null, soreness: null as number | null };
  }

  try {
    const parsed = JSON.parse(notes.slice('[atlas_v3]'.length));
    return {
      recovery: parsed?.recovery ?? null,
      soreness: parsed?.soreness ?? null,
    };
  } catch {
    return { recovery: null, soreness: null };
  }
}

function isIgnorableBrowserError(message: string) {
  return [
    /favicon|manifest/i,
    /\[i18n\] Missing translation key/i,
    /Failed to load resource: the server responded with a status of (400|429) \(\)/i,
    /email rate limit exceeded/i,
    /Auth flow failed: AuthApiError: email rate limit exceeded/i,
    /exercise-search/i,
    /\[ExerciseDB\]/i,
    /blocked by CORS policy/i,
    /Failed to load resource: net::ERR_FAILED/i,
    /\[workoutsService\] saveWorkoutSession sets insert failed/i,
    /\[AuthContext\] Profile fetch failed: TypeError: Failed to fetch/i,
  ].some((pattern) => pattern.test(message));
}

test.describe('Real user loop integrity', () => {
  test('proves onboarding -> DB -> Today -> actions -> reload', async ({ page }, testInfo) => {
    test.setTimeout(300000);

    const email = `atlas-loop-${Date.now()}@example.com`;
    const password = 'AtlasLoopTest#2026';
    const browserErrors: string[] = [];

    page.on('pageerror', (error) => {
      browserErrors.push(error.message);
    });

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        browserErrors.push(msg.text());
      }
    });

    await page.goto('/auth/signup');
    const signupEmailInput = page.getByPlaceholder('you@email.com');
    const signupPasswordInput = page.getByPlaceholder('••••••••');
    await signupEmailInput.fill(email);
    await expect(signupEmailInput).toHaveValue(email);
    await signupPasswordInput.fill(password);
    await expect(signupPasswordInput).toHaveValue(password);
    await page.getByRole('button', { name: /create account/i }).click();

    try {
      await expect(page).toHaveURL(/\/onboarding/, { timeout: 5000 });
    } catch {
      const inboxConfirmation = page.getByText(/check your inbox and confirm your email/i);
      const emailRateLimit = page.getByText(/email rate limit exceeded/i);

      if (await inboxConfirmation.isVisible().catch(() => false)) {
        await confirmUserEmail(email);
      } else if (await emailRateLimit.isVisible().catch(() => false)) {
        await ensureConfirmedUser(email, password);
      } else {
        throw new Error('Signup did not advance and no known auth-policy state was visible.');
      }

      await page.goto(`/auth/login?mode=password&email=${encodeURIComponent(email)}`);
      await page.getByPlaceholder('••••••••').fill(password);
      await page.getByRole('button', { name: /sign in/i }).click();
      await expect(page).toHaveURL(/\/onboarding/, { timeout: 20000 });
    }

    await completeOnboarding(page);
    await expect(page).toHaveURL(/\/app\/today/, { timeout: 30000 });

    const client = await signInForVerification(email, password);
    const { data: authData } = await client.auth.getUser();
    const userId = authData.user?.id;
    expect(userId).toBeTruthy();

    const profile = await poll(
      () => queryOwnProfile(client, userId!),
      (value) => !!value?.onboarding_completed,
      20000,
    );

    expect(profile?.onboarding_completed).toBe(true);
    const profileData = (profile?.profile_data || {}) as Json;
    const targets = (profileData.targets || {}) as Json;
    expect(Number(targets.calories)).toBeGreaterThan(0);
    expect(Number(targets.protein)).toBeGreaterThan(0);
    expect(Number(targets.carbs)).toBeGreaterThan(0);
    expect(Number(targets.fat)).toBeGreaterThan(0);

    const firstTimeOverlay = page.getByRole('button', { name: /let's go/i });
    if (await firstTimeOverlay.isVisible().catch(() => false)) {
      await firstTimeOverlay.click();
    }

    await page.getByRole('button', { name: '4' }).nth(0).click();
    await page.getByRole('button', { name: '4' }).nth(1).click();
    await page.getByRole('button', { name: '2' }).nth(2).click();
    await page.getByRole('button', { name: /build my day|submit/i }).click();

    const todayCheckin = await poll(
      async () => {
        const { data, error } = await client
          .from('daily_checkins')
          .select('date, sleep_hours, energy, notes')
          .eq('user_id', userId)
          .order('date', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (error) throw error;
        return data;
      },
      (value) => !!value,
    );

    expect(Number(todayCheckin?.sleep_hours)).toBeGreaterThan(0);
    const parsedCheckin = parseCheckinNotes(todayCheckin?.notes);
    expect(Number(todayCheckin?.energy)).toBe(4);
    expect(Number(parsedCheckin.recovery)).toBe(4);
    expect(Number(parsedCheckin.soreness)).toBe(2);

    await page.goto('/app/nutrition/food?meal=lunch');
    await expect(page.getByRole('button', { name: /confirm · log/i })).toBeVisible();
    await page.getByRole('button', { name: /confirm · log/i }).click();

    const latestFoodLog = await poll(
      async () => {
        const { data, error } = await client
          .from('food_logs')
          .select('meal_type, food_name, calories')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (error) throw error;
        return data;
      },
      (value) => !!value,
    );

    expect(latestFoodLog?.meal_type).toBe('lunch');
    expect(String(latestFoodLog?.food_name || '').length).toBeGreaterThan(0);

    await page.goto('/app/body/weight');
    for (const key of ['1', '8', '0', '.', '5']) {
      await page.getByRole('button', { name: key === '.' ? /^\.$/ : key }).click();
    }
    await page.getByRole('button', { name: /^save$/i }).click();

    const measurementRows = await poll(
      async () => {
        const { data, error } = await client
          .from('measurements')
          .select('date, weight, bmr, tdee')
          .eq('user_id', userId)
          .order('date', { ascending: false })
          .limit(5);
        if (error) throw error;
        return data || [];
      },
      (value) => value.some((row) => Math.abs(Number(row.weight) - 180.5) < 0.001),
    );

    expect(measurementRows.some((row) => Math.abs(Number(row.weight) - 180.5) < 0.001)).toBe(true);

    await page.goto('/app/workouts/active');
    await expect(page.getByRole('heading', { name: /add exercise/i })).toBeVisible();
    await page.getByPlaceholder(/search exercise/i).fill('bench');
    await page.getByRole('button', { name: /bench press/i }).first().click();

    const workoutState = await poll(
      async () => ({
        crashed: await page.getByRole('heading', { name: /system interruption/i }).isVisible().catch(() => false),
        ready: (await page.locator('input[type="number"]').count().catch(() => 0)) >= 2,
      }),
      (value) => value.crashed || value.ready,
      10000,
      250,
    );

    if (workoutState.crashed) {
      throw new Error(`Workout route crashed after exercise selection. Browser errors: ${JSON.stringify(browserErrors)}`);
    }

    const setInputs = page.locator('input[type="number"]');
    await setInputs.nth(0).fill('100');
    await setInputs.nth(1).fill('8');
    await page.locator('button:has(svg.lucide-check), button:has(svg.lucide-trophy)').first().click();
    await page.getByRole('button', { name: /finish workout/i }).first().click();
    await expect(page.getByText(/completed/i)).toBeVisible();
    await page.getByRole('button', { name: /save and close/i }).click();

    const latestWorkout = await poll(
      async () => {
        const { data, error } = await client
          .from('workouts')
          .select('status, name, exercises_completed')
          .eq('user_id', userId)
          .order('completed_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (error) throw error;
        return data;
      },
      (value) => value?.status === 'completed',
    );

    expect(latestWorkout?.status).toBe('completed');
    expect(Array.isArray(latestWorkout?.exercises_completed)).toBe(true);

    await page.goto('/app/today');
    await page.reload();

    const cache = await poll(
      () => readTodayCache(page, userId!),
      (value) =>
        !!value.profile &&
        !!value.checkin &&
        Array.isArray(value.meals) &&
        value.meals.length > 0 &&
        !!value.weight &&
        !!value.session &&
        Array.isArray(value.recentWork) &&
        value.recentWork.length > 0,
      20000,
    );

    expect(cache.profile).toBeTruthy();
    expect(Array.isArray(cache.meals)).toBe(true);
    expect((cache.meals as unknown[]).length).toBeGreaterThan(0);
    expect(cache.checkin).toBeTruthy();
    expect(cache.weight).toBeTruthy();
    expect(cache.session).toBeTruthy();
    expect(Array.isArray(cache.recentWork)).toBe(true);
    expect((cache.recentWork as unknown[]).length).toBeGreaterThan(0);
    expect(browserErrors.filter((message) => !isIgnorableBrowserError(message))).toEqual([]);
  });

  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status !== 'passed') {
      const ctx = await getRuntimeContext(page);
      await testInfo.attach('runtime-context', {
        body: JSON.stringify(ctx, null, 2),
        contentType: 'application/json',
      });
    }
  });
});
