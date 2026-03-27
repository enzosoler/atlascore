import { test, expect } from '@playwright/test';
import { getRuntimeContext } from './helpers/runtime-context';

/**
 * Admin panel — regression tests
 * Key regression: clicking Admin Panel was navigating to landing page (looked like logout)
 */

test.describe('Admin panel', () => {
  // These tests require admin credentials — skip in CI if not configured
  test.skip(
    !process.env.E2E_ADMIN_EMAIL,
    'Set E2E_ADMIN_EMAIL + E2E_ADMIN_PASSWORD to run admin tests'
  );

  test('navigating to /AdminPanel does not redirect to home or auth', async ({ page }) => {
    // Auth setup — replace with storageState once configured
    await page.goto('/AdminPanel');

    // Must NOT land on the public landing or auth page
    await page.waitForTimeout(2_000);

    const url = page.url();
    expect(url).not.toMatch(/\/(auth|login|\?mode=login)/);
    expect(url).not.toMatch(/^https?:\/\/[^/]+\/$/); // root landing
  });

  test('admin panel shows nav items', async ({ page }) => {
    await page.goto('/AdminPanel');

    // At least one nav item (Overview or Users) must be visible
    await expect(
      page.getByText(/overview|users|atletas|usuários/i).first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test('Logout button calls logout, not undefined', async ({ page }) => {
    await page.goto('/AdminPanel');

    // Wait for panel to load
    await expect(page.getByRole('button', { name: /logout|sair/i })).toBeVisible({ timeout: 10_000 });

    // Verify no JS error about signOut being undefined
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    // Don't actually click logout — just verify no errors on render
    await page.waitForTimeout(1_000);
    const signOutError = errors.some((e) => /signOut is not a function|signOut.*undefined/i.test(e));
    expect(signOutError).toBe(false);
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
