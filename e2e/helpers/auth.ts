import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import type { Page } from '@playwright/test';

export const E2E_AUTH_STORAGE_PATH = 'e2e/.auth/user.json';
const DEFAULT_BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';
const AUTH_STORAGE_PATTERNS = [/auth-token/i, /\bsb-.*-auth-token\b/i, /^atlas\.authBypassUser$/i];

type PlaywrightStorageState = {
  cookies?: Array<{
    name: string;
    value: string;
    domain: string;
    path: string;
    expires: number;
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'Strict' | 'Lax' | 'None';
  }>;
  origins?: Array<{
    origin: string;
    localStorage?: Array<{ name: string; value: string }>;
  }>;
};

function isAuthedUrl(url: string) {
  return /\/app\/today|\/onboarding/i.test(url);
}

function getTargetOrigin() {
  return new URL(DEFAULT_BASE_URL).origin;
}

function hasAuthStorageEntries(entries: Array<{ name: string; value: string }> = []) {
  return entries.some((entry) => AUTH_STORAGE_PATTERNS.some((pattern) => pattern.test(entry.name)));
}

async function gotoForStorageAccess(page: Page) {
  try {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  } catch (error) {
    if (!/interrupted|frame.*load/i.test(String(error))) {
      throw error;
    }
    await page.waitForLoadState('domcontentloaded').catch(() => null);
  }
}

async function clearBrowserAuthState(page: Page) {
  await page.context().clearCookies();
  await gotoForStorageAccess(page);
  await page.evaluate(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
}

function readStoredAuthState(): PlaywrightStorageState | null {
  if (!existsSync(E2E_AUTH_STORAGE_PATH)) {
    return null;
  }

  try {
    return JSON.parse(readFileSync(E2E_AUTH_STORAGE_PATH, 'utf8')) as PlaywrightStorageState;
  } catch {
    return null;
  }
}

async function hydrateStoredAuthState(page: Page, storageState: PlaywrightStorageState) {
  if (storageState.cookies?.length) {
    await page.context().addCookies(storageState.cookies);
  }

  const targetOrigin = getTargetOrigin();
  const matchingOrigin = storageState.origins?.find((entry) => entry.origin === targetOrigin);
  if (!matchingOrigin?.localStorage?.length) {
    return;
  }

  await gotoForStorageAccess(page);
  await page.evaluate((entries) => {
    window.localStorage.clear();
    for (const entry of entries) {
      window.localStorage.setItem(entry.name, entry.value);
    }
  }, matchingOrigin.localStorage);
}

async function persistStoredAuthState(page: Page) {
  const origin = new URL(page.url() || DEFAULT_BASE_URL).origin;
  const cookies = await page.context().cookies([origin]);
  const localStorage = await page.evaluate(() =>
    Object.entries(window.localStorage).map(([name, value]) => ({ name, value })),
  );

  if (!hasAuthStorageEntries(localStorage)) {
    throw new Error(
      'E2E auth state was created but contains no Supabase session tokens. ' +
      'Login likely failed silently. Check credentials and Supabase connectivity.',
    );
  }

  writeFileSync(
    E2E_AUTH_STORAGE_PATH,
    JSON.stringify({
      cookies,
      origins: [{ origin, localStorage }],
    }, null, 2),
  );
}

async function tryReuseStoredAuthState(page: Page) {
  const storageState = readStoredAuthState();
  if (!storageState) {
    return false;
  }

  const targetOrigin = getTargetOrigin();
  const matchingOrigin = storageState.origins?.find((entry) => entry.origin === targetOrigin);
  if (!matchingOrigin || !hasAuthStorageEntries(matchingOrigin.localStorage)) {
    return false;
  }

  await clearBrowserAuthState(page);
  await hydrateStoredAuthState(page, storageState);
  await page.goto('/app/today');

  if (!isAuthedUrl(page.url())) {
    await clearBrowserAuthState(page);
    return false;
  }

  await waitForPostAuthReady(page);
  return true;
}

async function confirmProtectedSession(page: Page) {
  await page.goto('/app/today');
  await page.waitForURL(/\/app\/today|\/onboarding/i, { timeout: 15_000 });
  await waitForPostAuthReady(page);
}

async function waitForPostAuthReady(page: Page) {
  const loadingStatus = page.getByRole('status').filter({ hasText: /initializing|syncing/i });
  const crashHeading = page.getByRole('heading', { name: /system interruption/i });

  await Promise.race([
    loadingStatus.waitFor({ state: 'visible', timeout: 2_000 }).catch(() => null),
    crashHeading.waitFor({ state: 'visible', timeout: 2_000 }).catch(() => null),
    page.waitForLoadState('domcontentloaded'),
  ]);

  if (await crashHeading.isVisible().catch(() => false)) {
    throw new Error('Authenticated route crashed before the app shell finished mounting.');
  }

  await loadingStatus.waitFor({ state: 'hidden', timeout: 15_000 }).catch(() => null);
  await page.waitForLoadState('networkidle', { timeout: 5_000 }).catch(() => null);
}

/**
 * Log in via the app's auth form. Call once, then save storage state.
 *
 * Usage:
 *   test.beforeAll(async ({ browser }) => {
 *     const page = await browser.newPage();
 *     await loginAs(page, process.env.E2E_USER_EMAIL!, process.env.E2E_USER_PASSWORD!);
 *     await page.context().storageState({ path: 'e2e/.auth/user.json' });
 *   });
 */
export async function loginAs(page: Page, email: string, password: string) {
  if (await tryReuseStoredAuthState(page)) {
    return;
  }

  await page.goto('/auth/login?mode=password');
  const emailInput = page.getByPlaceholder(/you@email\.com/i);
  const crashHeading = page.getByRole('heading', { name: /system interruption/i });

  // The login route can either render the form, redirect an existing session, or crash.
  await Promise.race([
    emailInput.waitFor({ state: 'visible', timeout: 15_000 }),
    page.waitForURL(/\/app\/today|\/onboarding/i, { timeout: 15_000 }),
    crashHeading.waitFor({ state: 'visible', timeout: 15_000 }),
  ]);

  if (isAuthedUrl(page.url())) {
    await confirmProtectedSession(page);
    await persistStoredAuthState(page);
    return;
  }

  if (await crashHeading.isVisible().catch(() => false)) {
    throw new Error('Login screen crashed before the auth form rendered.');
  }

  await page.getByRole('button', { name: /password/i }).click();
  await emailInput.fill(email);
  await page.getByPlaceholder(/•+|\*+/i).fill(password);
  await page.getByRole('button', { name: /sign in|log in|entrar/i }).click();

  // Wait for the SPA to navigate after sign-in — do NOT call page.goto() here
  // because a full-page reload races against Supabase session restoration.
  await page.waitForURL(/\/app\/today|\/onboarding/i, { timeout: 15_000 });
  await waitForPostAuthReady(page);
  await persistStoredAuthState(page);
}

/**
 * Log in as admin. Reads E2E_ADMIN_EMAIL + E2E_ADMIN_PASSWORD from env.
 */
export async function loginAsAdmin(page: Page) {
  const email = process.env.E2E_ADMIN_EMAIL;
  const password = process.env.E2E_ADMIN_PASSWORD;
  if (!email || !password) throw new Error('E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD not set');
  await loginAs(page, email, password);
}
