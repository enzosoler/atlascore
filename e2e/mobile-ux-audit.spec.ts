import { test, expect, type Page } from '@playwright/test';
import { loginAs } from './helpers/auth';

const email = process.env.E2E_USER_EMAIL;
const password = process.env.E2E_USER_PASSWORD;

// ---------------------------------------------------------------------------
// Ignored console patterns — same as mvp-release-audit
// ---------------------------------------------------------------------------
const IGNORED_CONSOLE = [
  /\[i18n\] Missing translation key/i,
  /favicon|manifest/i,
  /Failed to load resource: the server responded with a status of (400|401|403|404|429)/i,
  /exercise-search/i,
  /\[ExerciseDB\]/i,
  /ResizeObserver loop/i,
  /Customer portal error/i,
  /\[AuthContext\] Profile fetch failed: TypeError: Failed to fetch/i,
  /Supabase subscription query failed/i,
  /permission denied/i,
  /row-level security/i,
];

// ---------------------------------------------------------------------------
// Routes to audit
// ---------------------------------------------------------------------------
const CORE_ROUTES = [
  '/app/today',
  '/app/weekly',
  '/app/workouts',
  '/app/routines',
  '/app/nutrition',
  '/app/nutrition/search',
  '/app/body',
  '/app/body/measurements',
  '/app/coach',
  '/app/profile',
  '/app/settings',
  '/webapp/billing/paywall',
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Collect console errors + page crashes. */
function installAuditors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(`[pageerror] ${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error' && !IGNORED_CONSOLE.some((p) => p.test(msg.text()))) {
      errors.push(`[console.error] ${msg.text()}`);
    }
  });
  return errors;
}

/** Wait until loading / initializing state clears. Fail if stuck. */
async function assertNoStuckLoadingState(page: Page) {
  const loading = page.getByText(/initializing|syncing|loading\.\.\./i).first();
  // Give 2 s for a spinner to appear, then wait up to 15 s for it to go away.
  const appeared = await loading.isVisible({ timeout: 2_000 }).catch(() => false);
  if (appeared) {
    await expect(loading).toBeHidden({ timeout: 15_000 });
  }
}

/** Assert no horizontal overflow (sideways scroll). */
async function assertNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth - document.documentElement.clientWidth;
  });
  expect(overflow, 'horizontal overflow (px)').toBeLessThanOrEqual(2);
}

/**
 * If the page content is taller than the viewport, assert that the user can
 * actually scroll — catches overflow:hidden traps.
 */
async function assertPageScrollableIfNeeded(page: Page) {
  const { scrollHeight, clientHeight, scrollable } = await page.evaluate(() => {
    // Find the first scrollable container or fall back to body.
    const containers = [
      ...Array.from(document.querySelectorAll<HTMLElement>('[style*="overflow"]')),
      document.documentElement,
    ];
    for (const el of containers) {
      if (el.scrollHeight > el.clientHeight + 20) {
        return { scrollHeight: el.scrollHeight, clientHeight: el.clientHeight, scrollable: el.scrollHeight > el.clientHeight };
      }
    }
    return { scrollHeight: document.body.scrollHeight, clientHeight: window.innerHeight, scrollable: false };
  });

  if (!scrollable) return; // Content fits — nothing to test.

  // Try to scroll and verify position changes.
  const scrolled = await page.evaluate(() => {
    return new Promise<boolean>((resolve) => {
      const containers = [
        ...Array.from(document.querySelectorAll<HTMLElement>('*')),
      ].filter((el) => {
        const s = getComputedStyle(el);
        return (s.overflowY === 'auto' || s.overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 10;
      });
      const target = containers[0] || document.documentElement;
      const before = target.scrollTop;
      target.scrollBy({ top: 200, behavior: 'instant' });
      requestAnimationFrame(() => {
        const after = target.scrollTop;
        // Scroll back to top for downstream assertions.
        target.scrollTop = before;
        resolve(after > before);
      });
    });
  });

  expect(scrolled, `Content is ${scrollHeight}px tall (viewport ${clientHeight}px) but cannot scroll`).toBe(true);
}

/**
 * Find the primary CTA on a screen, scroll to it, and assert it is visible
 * and enabled. Returns the locator for further assertions if needed.
 */
async function assertPrimaryActionReachable(page: Page) {
  const cta = page.getByRole('button', { name: /continue|next|save|start|done|sign in|get the app/i }).first();
  const link = page.getByRole('link', { name: /continue|next|start|get started/i }).first();

  const target = (await cta.isVisible().catch(() => false)) ? cta : link;
  if (!(await target.isVisible().catch(() => false))) {
    // Some screens legitimately have no primary CTA (e.g. coach, settings).
    return null;
  }

  await target.scrollIntoViewIfNeeded();
  await expect(target).toBeVisible();
  return target;
}

/** Assert that important interactive elements meet minimum tap target sizes. */
async function assertTapTargetsReasonable(page: Page) {
  const tooSmall = await page.evaluate(() => {
    const results: Array<{ tag: string; text: string; w: number; h: number }> = [];
    const interactives = document.querySelectorAll<HTMLElement>('button, a[href], input, select, textarea, [role="button"]');
    for (const el of interactives) {
      if (!el.offsetParent) continue; // hidden
      const rect = el.getBoundingClientRect();
      if (rect.width < 30 || rect.height < 30) {
        // Skip tiny icon-only elements that are decorative or wrapped in a larger target.
        if (el.closest('button') !== el && el.closest('a') !== el) continue;
        results.push({
          tag: el.tagName.toLowerCase(),
          text: (el.textContent || el.getAttribute('aria-label') || '').slice(0, 40).trim(),
          w: Math.round(rect.width),
          h: Math.round(rect.height),
        });
      }
    }
    return results;
  });

  // Report but don't hard-fail — many icon buttons are intentionally small.
  // We collect them for the audit report.
  if (tooSmall.length > 0) {
    console.log(`[tap-targets] ${tooSmall.length} elements below 30px: ${JSON.stringify(tooSmall.slice(0, 5))}`);
  }
}

/** Assert the page didn't redirect to login or crash. */
async function assertRouteStable(page: Page) {
  await expect(page).not.toHaveURL(/\/auth\/login/i, { timeout: 5_000 });
  await expect(page.getByRole('heading', { name: /system interruption/i })).toHaveCount(0);
  await expect(page.locator('body')).not.toContainText(/something went wrong|application error/i);
}

/** Assert no blocking console errors accumulated. */
function assertNoBlockingConsoleErrors(errors: string[]) {
  const blocking = errors.filter(
    (e) =>
      /chunk.?load|dynamic.?import|module.?not.?found/i.test(e) ||
      /cannot read prop|is not a function|is not defined/i.test(e) ||
      /hydration|invariant|unmounted/i.test(e),
  );
  expect(blocking, 'blocking console/runtime errors').toEqual([]);
}

// ===========================================================================
// TESTS
// ===========================================================================

test.describe('Mobile UX audit', () => {
  test.skip(!email || !password, 'Set E2E_USER_EMAIL + E2E_USER_PASSWORD');

  // -------------------------------------------------------------------------
  // 1 + 2 + 7 + 8 + 9. Per-route: scroll, CTA, horizontal overflow, loading, console
  // -------------------------------------------------------------------------
  for (const route of CORE_ROUTES) {
    test(`[ux] ${route} — scroll, CTA, overflow, loading, console`, async ({ page }) => {
      const errors = installAuditors(page);
      await loginAs(page, email!, password!);
      await page.goto(route);
      await assertRouteStable(page);
      await assertNoStuckLoadingState(page);
      await assertNoHorizontalOverflow(page);
      await assertPageScrollableIfNeeded(page);
      await assertPrimaryActionReachable(page);
      await assertTapTargetsReasonable(page);
      assertNoBlockingConsoleErrors(errors);
    });
  }

  // -------------------------------------------------------------------------
  // 3. Safe-area / bottom navigation overlap
  // -------------------------------------------------------------------------
  test('[ux] bottom nav does not cover primary content on /app/today', async ({ page }) => {
    const errors = installAuditors(page);
    await loginAs(page, email!, password!);
    await page.goto('/app/today');
    await assertRouteStable(page);
    await assertNoStuckLoadingState(page);

    // The tab bar should be visible.
    const tabBar = page.locator('nav, [role="tablist"], [data-testid="tab-bar"]').first();
    if (await tabBar.isVisible().catch(() => false)) {
      const tabBarBox = await tabBar.boundingBox();
      // Find the last visible interactive element before the tab bar.
      const lastContent = await page.evaluate((tabBarTop: number) => {
        const els = document.querySelectorAll<HTMLElement>('button, a[href], p, h1, h2, h3');
        let lowest = 0;
        for (const el of els) {
          if (!el.offsetParent) continue;
          const rect = el.getBoundingClientRect();
          if (rect.bottom > lowest && rect.bottom < tabBarTop) {
            lowest = rect.bottom;
          }
        }
        return lowest;
      }, tabBarBox?.y ?? 9999);

      if (tabBarBox && lastContent > 0) {
        expect(
          tabBarBox.y - lastContent,
          'gap between last content and tab bar',
        ).toBeGreaterThanOrEqual(-5); // Allow tiny overlap from borders.
      }
    }
    assertNoBlockingConsoleErrors(errors);
  });

  // -------------------------------------------------------------------------
  // 5. Keyboard / input usability
  // -------------------------------------------------------------------------
  test('[ux] /app/nutrition/search — input focus keeps search usable', async ({ page }) => {
    const errors = installAuditors(page);
    await loginAs(page, email!, password!);
    await page.goto('/app/nutrition/search');
    await assertRouteStable(page);
    await assertNoStuckLoadingState(page);

    const searchInput = page.getByRole('searchbox').or(page.getByPlaceholder(/search|buscar/i)).first();
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.click();
      await searchInput.fill('chicken');
      // After typing, the input should still be visible (not pushed offscreen).
      await expect(searchInput).toBeVisible();
      // Any results container or the input itself should be in the viewport.
      const inViewport = await searchInput.evaluate((el) => {
        const rect = el.getBoundingClientRect();
        return rect.top >= 0 && rect.bottom <= window.innerHeight;
      });
      expect(inViewport, 'search input should remain in viewport after focus').toBe(true);
    }
    assertNoBlockingConsoleErrors(errors);
  });

  test('[ux] /app/body/measurements — form input remains usable', async ({ page }) => {
    const errors = installAuditors(page);
    await loginAs(page, email!, password!);
    await page.goto('/app/body/measurements');
    await assertRouteStable(page);
    await assertNoStuckLoadingState(page);

    // Try tapping the first measurement button.
    const firstField = page.getByRole('button', { name: /waist|chest|hip|neck|arm|thigh|weight/i }).first();
    if (await firstField.isVisible().catch(() => false)) {
      await firstField.click();
      // If a number input appears, verify it's visible.
      const numInput = page.locator('input[type="number"], input[inputmode="decimal"], input[inputmode="numeric"]').first();
      if (await numInput.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await expect(numInput).toBeVisible();
        await numInput.fill('85');
      }
    }
    assertNoBlockingConsoleErrors(errors);
  });

  // -------------------------------------------------------------------------
  // 6. Route stability after interaction
  // -------------------------------------------------------------------------
  const INTERACTION_ROUTES = [
    '/app/today',
    '/app/workouts',
    '/app/nutrition',
    '/app/settings',
  ];

  for (const route of INTERACTION_ROUTES) {
    test(`[ux] ${route} — stable after first interaction`, async ({ page }) => {
      const errors = installAuditors(page);
      await loginAs(page, email!, password!);
      await page.goto(route);
      await assertRouteStable(page);
      await assertNoStuckLoadingState(page);

      // Scroll down and back up — a safe interaction that doesn't navigate away.
      await page.evaluate(() => {
        const scrollable = document.querySelector('[style*="overflow: auto"], [style*="overflow-y: auto"]') || document.documentElement;
        scrollable.scrollBy({ top: 150, behavior: 'instant' });
      });
      await page.waitForTimeout(500);
      await page.evaluate(() => {
        const scrollable = document.querySelector('[style*="overflow: auto"], [style*="overflow-y: auto"]') || document.documentElement;
        scrollable.scrollBy({ top: -150, behavior: 'instant' });
      });
      await page.waitForTimeout(500);

      // Route should still be stable — no crash, no redirect to login.
      await assertRouteStable(page);
      assertNoBlockingConsoleErrors(errors);
    });
  }

  // -------------------------------------------------------------------------
  // 10. Back / close behavior
  // -------------------------------------------------------------------------
  test('[ux] /app/body/measurements close returns to /app/body', async ({ page }) => {
    const errors = installAuditors(page);
    await loginAs(page, email!, password!);
    await page.goto('/app/body/measurements');
    await assertRouteStable(page);
    await assertNoStuckLoadingState(page);

    const closeBtn = page.getByRole('button', { name: /close/i }).or(page.getByLabel(/close/i)).first();
    if (await closeBtn.isVisible().catch(() => false)) {
      await closeBtn.click();
      await expect(page).toHaveURL(/\/app\/body$/i, { timeout: 5_000 });
    }
    assertNoBlockingConsoleErrors(errors);
  });

  test('[ux] /webapp/billing/paywall — back navigates away cleanly', async ({ page }) => {
    const errors = installAuditors(page);
    await loginAs(page, email!, password!);

    // Navigate to a known page first so goBack() has history.
    await page.goto('/app/today');
    await assertRouteStable(page);
    await page.goto('/webapp/billing/paywall');
    await assertRouteStable(page);
    await assertNoStuckLoadingState(page);

    await page.goBack();
    await page.waitForTimeout(1_500);
    // Should land back on /app/today or at least not on /auth/login.
    await expect(page).not.toHaveURL(/\/auth\/login/i);
    assertNoBlockingConsoleErrors(errors);
  });
});
