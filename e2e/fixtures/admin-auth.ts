/**
 * Admin auth fixture — reusable admin session for E2E tests.
 *
 * WHY a fixture instead of beforeAll: Playwright fixtures provide automatic
 * teardown, better parallelism, and cleaner test isolation. The admin session
 * is shared across tests in the same worker to avoid repeated logins.
 */

import { test as base, expect, type Page } from '@playwright/test';
import { loginAs } from '../helpers/auth';

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || '';
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || '';

export type AdminFixtures = {
  adminPage: Page;
};

export const test = base.extend<AdminFixtures>({
  adminPage: async ({ page }, use) => {
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error('E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD must be set');
    }

    await loginAs(page, ADMIN_EMAIL, ADMIN_PASSWORD);

    // Navigate to admin and verify access
    await page.goto('/admin');
    await page.waitForURL(/\/admin/, { timeout: 15_000 });

    // WHY: Confirm the shell rendered — not a redirect to /auth or /app
    await expect(page.getByTestId('admin-shell')).toBeVisible({ timeout: 10_000 });

    await use(page);
  },
});

export { expect };
