import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

const email = process.env.E2E_USER_EMAIL;
const password = process.env.E2E_USER_PASSWORD;

test.describe('Billing post-purchase sync', () => {
  test.skip(!email || !password, 'Set E2E_USER_EMAIL + E2E_USER_PASSWORD to run billing sync gate');

  test('billing UI reflects active plan after simulated webhook, survives reload, and survives logout/login', async ({ page }) => {
    await loginAs(page, email!, password!);

    await page.goto('/webapp/billing/manage');
    await expect(page).toHaveURL(/\/webapp\/billing\/manage/i, { timeout: 15_000 });
    await expect(page.getByText(/current plan/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/^pro$/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/active/i)).toBeVisible({ timeout: 10_000 });

    await page.reload();
    await expect(page.getByText(/^pro$/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/active/i)).toBeVisible({ timeout: 10_000 });

    await page.getByRole('button', { name: /sign out/i }).click();
    await expect(page).toHaveURL(/\/auth\/login|\/auth\?mode=login/i, { timeout: 15_000 });

    await loginAs(page, email!, password!);
    await page.goto('/webapp/billing/manage');
    await expect(page.getByText(/^pro$/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/active/i)).toBeVisible({ timeout: 10_000 });
  });
});
