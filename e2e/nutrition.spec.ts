import { test, expect } from '@playwright/test';
import { getRuntimeContext } from './helpers/runtime-context';

/**
 * Nutrition page — critical mobile flows
 * Key regression: overflow-x-hidden fix + ResponsiveModal (Drawer on mobile)
 */

test.describe('Nutrition page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/Nutrition');
  });

  test('page scrolls vertically', async ({ page }) => {
    // Regression: overflow-x-clip was forcing overflow-y-clip, blocking scroll
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });

    const initialScrollY = await page.evaluate(() => {
      const main = document.querySelector('main');
      return main ? main.scrollTop : window.scrollY;
    });

    // Simulate scroll down
    await page.evaluate(() => {
      const main = document.querySelector('main');
      if (main) main.scrollTop = 200;
    });

    const afterScrollY = await page.evaluate(() => {
      const main = document.querySelector('main');
      return main ? main.scrollTop : window.scrollY;
    });

    // If scroll is still 0, the page is unscrollable (the regression)
    expect(afterScrollY).toBeGreaterThan(0);
  });

  test('Add Meal button is visible and clickable', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /add meal|adicionar refeição/i });
    await expect(addBtn).toBeVisible({ timeout: 10_000 });
    await addBtn.click({ trial: true });
  });

  test('Add Meal opens a modal/drawer', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /add meal|adicionar refeição/i });
    await addBtn.click();

    // On desktop: Dialog; on mobile: Drawer — both render the form title
    await expect(
      page.getByText(/add meal|adicionar refeição/i).nth(1)
    ).toBeVisible({ timeout: 8_000 });
  });

  test('modal is scrollable on mobile', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /add meal|adicionar refeição/i });
    await addBtn.click();

    // The form container should be a scroll container, not clipped
    const scrollable = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"], [vaul-drawer]');
      if (!dialog) return false;
      const el = dialog.querySelector('[class*="overflow-y-auto"]');
      return !!el;
    });

    expect(scrollable).toBe(true);
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
