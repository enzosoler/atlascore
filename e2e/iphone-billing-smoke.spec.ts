import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

const email = process.env.E2E_USER_EMAIL;
const password = process.env.E2E_USER_PASSWORD;

test.describe('iPhone billing smoke', () => {
  test.skip(!email || !password, 'Set E2E_USER_EMAIL + E2E_USER_PASSWORD to run iPhone billing smoke');

  test('login, open core app, and reach Stripe checkout entry point', async ({ page }) => {
    await loginAs(page, email!, password!);

    await expect(page).toHaveURL(/\/app\/today|\/onboarding/i, { timeout: 15_000 });
    await expect(page.getByText(/good (morning|afternoon|evening)|how are you today/i).first()).toBeVisible({ timeout: 10_000 });

    await page.goto('/webapp/billing/paywall');
    await expect(page.getByText(/\$79/).first()).toBeVisible({ timeout: 10_000 });
    await page.getByRole('button', { name: /get the app to subscribe/i }).click();
    await page.waitForURL(/checkout\.stripe\.com/, { timeout: 20_000 });
  });
});
