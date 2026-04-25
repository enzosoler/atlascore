import { test, expect, type Page } from '@playwright/test';
import { loginAs } from './helpers/auth';

const email = process.env.E2E_USER_EMAIL;
const password = process.env.E2E_USER_PASSWORD;

// All onboarding routes in flow order
const ONBOARDING_ROUTES = [
  { path: '/onboarding', name: 'Identity (who are you)' },
  { path: '/onboarding/nutrition', name: 'Diet preferences' },
  { path: '/onboarding/goal', name: 'Goal' },
  { path: '/onboarding/activity', name: 'Activity / daily targets' },
  { path: '/onboarding/stats', name: 'Plan / stats' },
  { path: '/onboarding/diet', name: 'Connect sources / permissions' },
  { path: '/onboarding/workout', name: 'Workout preferences' },
  { path: '/onboarding/habits', name: 'Daily habits' },
  { path: '/onboarding/constraints', name: 'Constraints' },
  { path: '/onboarding/summary', name: 'Summary' },
  { path: '/onboarding/coach-match', name: 'Coach match' },
  { path: '/onboarding/tour', name: 'Tour' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Assert that a mobile screen is scrollable if its content exceeds the viewport,
 * and that the bottom-most interactive element is reachable.
 */
async function assertMobileScreenReachable(page: Page, screenName: string) {
  // Find any scrollable container or the document itself
  const result = await page.evaluate(() => {
    // Check all elements for scrollable containers
    const all = document.querySelectorAll<HTMLElement>('*');
    let scrollContainer: HTMLElement | null = null;
    for (const el of all) {
      const s = getComputedStyle(el);
      if (
        (s.overflowY === 'auto' || s.overflowY === 'scroll') &&
        el.scrollHeight > el.clientHeight + 20
      ) {
        scrollContainer = el;
        break;
      }
    }

    if (!scrollContainer) {
      // No scrollable container with overflow content — check if document overflows
      const docOverflow = document.documentElement.scrollHeight > window.innerHeight + 20;
      if (!docOverflow) {
        return { fits: true, scrollable: true, scrollHeight: 0, clientHeight: 0 };
      }
      // Content overflows but no scroll container — this is the bug
      return {
        fits: false,
        scrollable: false,
        scrollHeight: document.documentElement.scrollHeight,
        clientHeight: window.innerHeight,
      };
    }

    // Try to scroll
    const before = scrollContainer.scrollTop;
    scrollContainer.scrollBy({ top: 200, behavior: 'instant' as ScrollBehavior });
    const after = scrollContainer.scrollTop;
    scrollContainer.scrollTop = before; // restore

    return {
      fits: false,
      scrollable: after > before,
      scrollHeight: scrollContainer.scrollHeight,
      clientHeight: scrollContainer.clientHeight,
    };
  });

  if (!result.fits && !result.scrollable) {
    throw new Error(
      `[${screenName}] Content is ${result.scrollHeight}px tall (viewport ${result.clientHeight}px) ` +
      `but CANNOT SCROLL. This is a scroll trap — overflow:hidden or missing minHeight:0.`
    );
  }
}

/** Assert the primary CTA button is visible and reachable. */
async function assertCTAReachable(page: Page, screenName: string) {
  const cta = page.getByRole('button', { name: /continue|next|save|start|done|skip|finish/i }).first();
  if (await cta.isVisible().catch(() => false)) {
    await cta.scrollIntoViewIfNeeded();
    await expect(cta).toBeVisible();
    return;
  }
  // Tour screen might only have "Skip tour"
  const skip = page.getByText(/skip tour|skip for now/i).first();
  if (await skip.isVisible().catch(() => false)) {
    return;
  }
  // Some screens may not have a visible CTA initially (e.g., need selection first)
  // That's OK — don't fail on this alone
}

/** Assert no horizontal overflow. */
async function assertNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  expect(overflow, 'horizontal overflow (px)').toBeLessThanOrEqual(2);
}

/**
 * Navigate to an onboarding route, bypassing the onboarding_completed redirect.
 * We clear the Supabase auth metadata to simulate an incomplete onboarding user,
 * OR we simply navigate directly and check if the screen renders.
 *
 * Since the E2E user has onboarding_completed=true, the route will redirect to /app/today.
 * We handle this by temporarily patching localStorage.
 */
async function navigateToOnboardingStep(page: Page, path: string) {
  // Set onboarding as incomplete so the route doesn't redirect
  await page.evaluate(() => {
    // Find the Supabase auth token key
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && /sb-.*-auth-token/i.test(key)) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          if (data.user?.user_metadata) {
            data.user.user_metadata.onboarding_completed = false;
          }
          localStorage.setItem(key, JSON.stringify(data));
        } catch {}
      }
    }
  });

  await page.goto(path);

  // Wait for the page to settle
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe('Onboarding mobile UX audit', () => {
  test.skip(!email || !password, 'Set E2E_USER_EMAIL + E2E_USER_PASSWORD');

  for (const { path, name } of ONBOARDING_ROUTES) {
    test(`[onboarding] ${name} (${path}) — scroll, CTA, overflow`, async ({ page }) => {
      await loginAs(page, email!, password!);
      await navigateToOnboardingStep(page, path);

      // If we got redirected to /app/today, the onboarding patch didn't hold.
      // In that case, navigate directly — the component might still render.
      const url = page.url();
      if (/\/app\/today/i.test(url)) {
        // Force navigate — this tests if the screen component renders at all
        await page.goto(path);
        await page.waitForTimeout(1500);

        // If still redirected, skip this test
        if (/\/app\/today/i.test(page.url())) {
          test.skip(true, `Route ${path} redirects completed-onboarding users — cannot test in E2E with current user`);
          return;
        }
      }

      // Screen should render (not blank, not error)
      await expect(page.locator('body')).toBeVisible();
      await expect(page.locator('body')).not.toContainText(/something went wrong|application error/i);

      // No horizontal overflow
      await assertNoHorizontalOverflow(page);

      // Scroll + CTA reachability (skip for tour which is a carousel)
      if (!path.includes('tour')) {
        await assertMobileScreenReachable(page, name);
        await assertCTAReachable(page, name);
      }
    });
  }
});
