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
  await page.goto('/auth?mode=login');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole('button', { name: /sign in|log in|entrar/i }).click();
  await page.waitForURL(/Today|\/today/i, { timeout: 15_000 });
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
