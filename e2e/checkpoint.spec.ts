import { test, expect } from '@playwright/test';
import { getRuntimeContext } from './helpers/runtime-context';

/**
 * Checkpoint creation flow — /body/checkpoints/new
 * Critical on mobile: MobileFormLayout uses --app-height, CTA must be visible.
 */

test.describe('Checkpoint flow', () => {
  test.beforeEach(async ({ page }) => {
    // Skip auth for now — tests run against a dev build with a pre-logged-in session
    // Replace with storageState once you set up e2e/.auth/user.json
    await page.goto('/body');
  });

  test('Body page loads and shows progress tab', async ({ page }) => {
    await expect(page.getByText(/progress|corpo|body/i).first()).toBeVisible({ timeout: 10_000 });
  });

  test('navigating to /body/checkpoints/new shows the form', async ({ page }) => {
    await page.goto('/body/checkpoints/new');

    await expect(page.getByText(/new checkpoint/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByLabelText(/weight/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /save/i })).toBeVisible();
  });

  test('CTA Save button is within viewport on mobile', async ({ page }) => {
    // Particularly important: MobileFormLayout must not let the button
    // hide behind the address bar / nav bar on iOS
    await page.goto('/body/checkpoints/new');

    const saveBtn = page.getByRole('button', { name: /save/i });
    await expect(saveBtn).toBeVisible();

    const box = await saveBtn.boundingBox();
    expect(box).not.toBeNull();

    const viewport = page.viewportSize();
    expect(viewport).not.toBeNull();

    // Button must be fully within the current viewport height
    expect(box!.y + box!.height).toBeLessThanOrEqual(viewport!.height);
  });

  test('save button is tappable (not obscured by bottom nav)', async ({ page }) => {
    await page.goto('/body/checkpoints/new');

    const saveBtn = page.getByRole('button', { name: /save/i });
    await expect(saveBtn).toBeVisible();

    // Should not throw — if something is on top the click won't reach it
    await saveBtn.click({ trial: true });
  });

  test('form fields accept input', async ({ page }) => {
    await page.goto('/body/checkpoints/new');

    await page.getByLabel(/weight/i).fill('80.5');
    await page.getByLabel(/body fat/i).fill('15.2');

    await expect(page.getByLabel(/weight/i)).toHaveValue('80.5');
    await expect(page.getByLabel(/body fat/i)).toHaveValue('15.2');
  });

  test('shows error toast when saving with no values', async ({ page }) => {
    await page.goto('/body/checkpoints/new');

    await page.getByRole('button', { name: /save/i }).click();

    await expect(page.getByText(/enter at least one/i)).toBeVisible({ timeout: 5_000 });
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
