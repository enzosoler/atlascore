import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

const email = process.env.E2E_USER_EMAIL;
const password = process.env.E2E_USER_PASSWORD;
const stripePublishableKey = process.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripeModeFlag = process.env.VITE_STRIPE_TEST_MODE;

test.describe('Billing entry gate', () => {
  test.skip(!email || !password, 'Set E2E_USER_EMAIL + E2E_USER_PASSWORD to run billing entry gate');
  test.skip(
    !stripePublishableKey && !stripeModeFlag,
    'Stripe checkout E2E requires local Stripe billing env to be configured.',
  );

  test('authenticated web user can create a checkout session and reach Stripe Checkout', async ({ page }) => {
    await loginAs(page, email!, password!);

    await page.goto('/webapp/billing/paywall');
    await expect(page).toHaveURL(/\/webapp\/billing\/paywall/i, { timeout: 15_000 });

    const yearlyPlan = page.getByText(/\$79/).first();
    await expect(yearlyPlan).toBeVisible({ timeout: 10_000 });
    await yearlyPlan.click();

    await page.getByRole('button', { name: /get the app to subscribe/i }).click();
    await page.waitForURL(/checkout\.stripe\.com/, { timeout: 20_000 });
  });
});
