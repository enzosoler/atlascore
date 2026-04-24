import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

const email = process.env.E2E_USER_EMAIL;
const password = process.env.E2E_USER_PASSWORD;
const MOCK_CHECKOUT_URL = 'https://checkout.stripe.com/c/pay/cs_test_mock_session';

test.describe('Billing entry gate', () => {
  test.skip(!email || !password, 'Set E2E_USER_EMAIL + E2E_USER_PASSWORD to run billing entry gate');

  test('authenticated web user can create a checkout session and reach Stripe Checkout', async ({ page }) => {
    let checkoutRequestBody: Record<string, unknown> | null = null;

    await page.route('**/functions/v1/create-checkout', async (route) => {
      checkoutRequestBody = route.request().postDataJSON() as Record<string, unknown>;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          url: MOCK_CHECKOUT_URL,
          sessionId: 'cs_test_mock_session',
          publishableKey: 'pk_test_mock_123',
          testMode: true,
        }),
      });
    });

    await page.route('https://checkout.stripe.com/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<!doctype html><html><head><title>Mock Stripe Checkout</title></head><body><h1>Mock Stripe Checkout</h1></body></html>',
      });
    });

    await loginAs(page, email!, password!);

    await page.goto('/webapp/billing/paywall');
    await expect(page).toHaveURL(/\/webapp\/billing\/paywall/i, { timeout: 15_000 });

    const yearlyPlan = page.getByText(/\$79/).first();
    await expect(yearlyPlan).toBeVisible({ timeout: 10_000 });
    await yearlyPlan.click();

    await page.getByRole('button', { name: /get the app to subscribe/i }).click();
    await page.waitForURL(/checkout\.stripe\.com/, { timeout: 20_000 });
    await expect(page.getByRole('heading', { name: /mock stripe checkout/i })).toBeVisible();

    expect(checkoutRequestBody).toMatchObject({
      plan: 'athlete_pro',
      billing: 'yearly',
      region: 'us',
      email,
    });
    expect(String(checkoutRequestBody?.success_url || '')).toContain('/webapp/success?session_id={CHECKOUT_SESSION_ID}');
    expect(String(checkoutRequestBody?.cancel_url || '')).toContain('/webapp/billing/paywall');
  });
});
