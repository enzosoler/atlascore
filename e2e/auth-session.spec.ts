import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

const email = process.env.E2E_USER_EMAIL;
const password = process.env.E2E_USER_PASSWORD;

test.describe('Auth session gates', () => {
  test.skip(!email || !password, 'Set E2E_USER_EMAIL + E2E_USER_PASSWORD to run auth session gates');

  test('logout -> login again stays functional', async ({ page }) => {
    await loginAs(page, email, password);

    await page.goto('/app/settings');
    await expect(page.getByRole('button', { name: /sign out/i })).toBeVisible({ timeout: 10_000 });
    await page.getByRole('button', { name: /sign out/i }).click();

    await expect(page).toHaveURL(/\/(auth(\/login)?|welcome)?(?:\?.*)?$/i, { timeout: 15_000 });

    await loginAs(page, email, password);
    await expect(page).toHaveURL(/\/app\/today|\/onboarding/i, { timeout: 15_000 });
  });

  test('session persistence survives a fresh browser context', async ({ browser }) => {
    const initialContext = await browser.newContext();
    const initialPage = await initialContext.newPage();

    await loginAs(initialPage, email, password);

    const storageState = await initialContext.storageState();
    expect(
      storageState.origins.some((origin) => origin.localStorage.length > 0) || storageState.cookies.length > 0,
    ).toBeTruthy();

    await initialContext.close();

    const restoredContext = await browser.newContext({ storageState });
    const restoredPage = await restoredContext.newPage();

    await restoredPage.goto('/app/today');
    await expect(restoredPage).toHaveURL(/\/app\/today|\/onboarding/i, { timeout: 15_000 });

    await restoredContext.close();
  });
});
