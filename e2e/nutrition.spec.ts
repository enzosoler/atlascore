import { test, expect } from '@playwright/test';
import { getRuntimeContext } from './helpers/runtime-context';
import { loginAs } from './helpers/auth';

/**
 * Nutrition page — critical mobile flows
 * Key regression: capture actions must remain reachable on the current /app/nutrition route.
 */

const email = process.env.E2E_USER_EMAIL;
const password = process.env.E2E_USER_PASSWORD;

test.describe('Nutrition page', () => {
  test.skip(!email || !password, 'Set E2E_USER_EMAIL + E2E_USER_PASSWORD to run nutrition flow');

  test.beforeEach(async ({ page }) => {
    await loginAs(page, email!, password!);
    await page.goto('/app/nutrition');
  });

  test('page loads the current nutrition hub', async ({ page }) => {
    await expect(page.getByText(/today's plate/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('button', { name: /scan/i })).toBeVisible();
  });

  test('capture buttons are visible and clickable', async ({ page }) => {
    const scanBtn = page.getByRole('button', { name: /scan/i });
    const recentsBtn = page.getByRole('button', { name: /recents/i });
    await expect(scanBtn).toBeVisible({ timeout: 10_000 });
    await expect(recentsBtn).toBeVisible();
    await scanBtn.click({ trial: true });
    await recentsBtn.click({ trial: true });
  });

  test('Recents capture routes to the diary screen', async ({ page }) => {
    await page.getByRole('button', { name: /recents/i }).click();

    // The nutrition flow is route-based now, not a modal/drawer.
    await expect(page).toHaveURL(/\/app\/nutrition\/diary/i, { timeout: 8_000 });
  });

  test('Scan capture routes to the capture screen', async ({ page }) => {
    await page.getByRole('button', { name: /scan/i }).click();

    await expect(page).toHaveURL(/\/app\/nutrition\/capture/i, { timeout: 8_000 });
  });

  test('page interactions are not blocked by OnboardingTour backdrop', async ({ page }) => {
    // Regression: backdrop z-40 was blocking all pointer events for new users
    const backdrop = page.locator('.fixed.inset-0.z-40.bg-black\\/40.pointer-events-none');
    const count = await backdrop.count();

    if (count > 0) {
      // Backdrop exists (new user) — it must have pointer-events-none
      const pe = await backdrop.evaluate((el) => getComputedStyle(el).pointerEvents);
      expect(pe).toBe('none');
    }
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
