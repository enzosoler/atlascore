import { test, expect } from '@playwright/test';
import { getRuntimeContext } from './helpers/runtime-context';
import { loginAs } from './helpers/auth';

/**
 * Checkpoint creation flow — /app/body + /app/body/measurements.
 * Critical on mobile: the measurements entry CTA must remain visible and tappable.
 */

const email = process.env.E2E_USER_EMAIL;
const password = process.env.E2E_USER_PASSWORD;

test.describe('Checkpoint flow', () => {
  test.skip(!email || !password, 'Set E2E_USER_EMAIL + E2E_USER_PASSWORD to run checkpoint flow');

  test.beforeEach(async ({ page }) => {
    await loginAs(page, email!, password!);
    await page.goto('/app/body');
  });

  test('Body page loads and shows the checkpoint CTA', async ({ page }) => {
    await expect(page.getByText(/no checkpoints yet|measurements/i).first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('button', { name: /start logging|\+ log checkpoint/i })).toBeVisible();
  });

  test('navigating to /app/body/measurements shows the form', async ({ page }) => {
    await page.goto('/app/body/measurements');

    await expect(page.getByText(/measurements/i).first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('button', { name: /waist/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /save/i })).toBeVisible();
  });

  test('CTA Save button is within viewport on mobile', async ({ page }) => {
    await page.goto('/app/body/measurements');

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
    await page.goto('/app/body/measurements');

    const saveBtn = page.getByRole('button', { name: /save/i });
    await expect(saveBtn).toBeVisible();

    // Should not throw — if something is on top the click won't reach it
    await saveBtn.click({ trial: true });
  });

  test('form fields accept input', async ({ page }) => {
    await page.goto('/app/body/measurements');

    // The measurements form is numpad-driven now, not label/input based.
    await page.getByRole('button', { name: /^8$/ }).click();
    await page.getByRole('button', { name: /^0$/ }).click();
    await page.getByRole('button', { name: /^\.$/ }).click();
    await page.getByRole('button', { name: /^5$/ }).click();

    await expect(page.getByText(/^80\.5$/)).toBeVisible();
  });

  test('empty state keeps save visually disabled until a value is entered', async ({ page }) => {
    await page.goto('/app/body/measurements');

    // The current UI uses a dimmed Save CTA instead of an inline validation toast.
    await expect(page.getByRole('button', { name: /save/i })).toHaveCSS('opacity', '0.4');
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
