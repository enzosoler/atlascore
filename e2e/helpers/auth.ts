import { Page } from '@playwright/test';

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
  await page.goto('/auth/login?mode=password');
  const emailInput = page.getByPlaceholder(/you@email\.com/i);
  const crashHeading = page.getByRole('heading', { name: /system interruption/i });

  // The login route can either render the form, redirect an existing session, or crash.
  await Promise.race([
    emailInput.waitFor({ state: 'visible', timeout: 15_000 }),
    page.waitForURL(/\/app\/today|\/onboarding/i, { timeout: 15_000 }),
    crashHeading.waitFor({ state: 'visible', timeout: 15_000 }),
  ]);

  if (/\/app\/today|\/onboarding/i.test(page.url())) {
    return;
  }

  if (await crashHeading.isVisible().catch(() => false)) {
    throw new Error('Login screen crashed before the auth form rendered.');
  }

  await page.getByRole('button', { name: /password/i }).click();
  await emailInput.fill(email);
  await page.getByPlaceholder(/•+|\*+/i).fill(password);
  await page.getByRole('button', { name: /sign in|log in|entrar/i }).click();
  await page.waitForURL(/\/app\/today|\/onboarding/i, { timeout: 15_000 });
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
