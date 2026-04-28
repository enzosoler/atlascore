import { test, expect } from '@playwright/test';
import { config as loadEnv } from 'dotenv';
import { getRuntimeContext } from './helpers/runtime-context';

loadEnv({ path: '.env.local' });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;

if (!SUPABASE_URL) {
  throw new Error('Missing VITE_SUPABASE_URL');
}

const STORAGE_KEY = `sb-${new URL(SUPABASE_URL).hostname.split('.')[0]}-auth-token`;

const session = {
  access_token: 'test-access-token',
  refresh_token: 'test-refresh-token',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  user: {
    id: '00000000-0000-4000-8000-000000000001',
    aud: 'authenticated',
    role: 'authenticated',
    email: 'reset-test@example.com',
    email_confirmed_at: '2026-04-23T00:00:00.000Z',
    phone: '',
    confirmed_at: '2026-04-23T00:00:00.000Z',
    last_sign_in_at: '2026-04-23T00:00:00.000Z',
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: { full_name: 'Reset Test' },
    identities: [],
    created_at: '2026-04-23T00:00:00.000Z',
    updated_at: '2026-04-23T00:00:00.000Z',
    is_anonymous: false,
  },
};

async function mockAuthenticatedResetSession(page) {
  await page.addInitScript(
    ({ storageKey, storedSession }) => {
      window.localStorage.setItem(storageKey, JSON.stringify(storedSession));
    },
    { storageKey: STORAGE_KEY, storedSession: session },
  );

  await page.route(`${SUPABASE_URL}/rest/v1/profiles*`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: session.user.id,
        role: 'athlete',
        onboarding_completed: false,
      }),
    });
  });
}

test.describe('Auth reset routing', () => {
  test('authenticated reset callback redirects to /auth/reset', async ({ page }) => {
    await mockAuthenticatedResetSession(page);

    await page.goto('/auth/callback?mode=reset');

    await expect(page).toHaveURL(/\/auth\/reset$/);
    await expect(page.locator('input[type="password"]')).toHaveCount(2);
    await expect(page.getByRole('button')).toContainText(/update|reset/i);
  });

  test('legacy /auth/update-password redirects to /auth/reset', async ({ page }) => {
    await page.goto('/auth/update-password');

    await expect(page).toHaveURL(/\/auth\/reset$/);
  });

  test('reset page renders correctly', async ({ page }) => {
    await page.goto('/auth/reset');

    await expect(page.locator('input[type="password"]')).toHaveCount(2);
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"]').nth(1)).toBeVisible();
    await expect(page.getByRole('button')).toContainText(/update|reset/i);
  });

  test('reset page blocks short passwords with a visible validation message', async ({ page }) => {
    await page.goto('/auth/reset');

    const passwordInputs = page.locator('input[type="password"]');
    await expect(passwordInputs).toHaveCount(2);

    await passwordInputs.first().fill('short');
    await passwordInputs.nth(1).fill('short');
    await page.getByRole('button', { name: /update|reset/i }).click();

    await expect(page).toHaveURL(/\/auth\/reset$/);
    await expect(page.getByText(/password must be at least 8 characters|8 characters or more|minimum 8 characters/i)).toBeVisible();
  });

  test('reset page blocks mismatched passwords with a visible validation message', async ({ page }) => {
    await page.goto('/auth/reset');

    const passwordInputs = page.locator('input[type="password"]');
    await expect(passwordInputs).toHaveCount(2);

    const testPwd = process.env.E2E_USER_PASSWORD || 'TestReset#9999';
    await passwordInputs.first().fill(testPwd);
    await passwordInputs.nth(1).fill(testPwd + '1');
    await page.getByRole('button', { name: /update|reset/i }).click();

    await expect(page).toHaveURL(/\/auth\/reset$/);
    await expect(page.getByText(/passwords.*match|match/i)).toBeVisible();
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
