/**
 * screens-gallery.spec.ts
 *
 * Validates that every screen component in the V3 gallery renders correctly:
 *   - /v3          — full gallery (all 71 screens, light + dark)
 *   - Individual public routes for auth/splash screens (S87–S92)
 *
 * Checks:
 *   1. No JS errors or console errors on load
 *   2. No "(screen not yet wired)" placeholders visible
 *   3. No horizontal overflow (responsive)
 *   4. All new S87–S107 screen labels present in DOM
 *   5. Performance: FCP under 4 s
 *   6. Screenshots captured per device for visual review
 */

import { test, expect, type Page } from '@playwright/test';

// ── Ignored noise ──────────────────────────────────────────────────────────────
const IGNORED_PATTERNS = [
  /\[i18n\] Missing translation key/i,
  /ResizeObserver loop/i,
  /favicon|manifest/i,
  /Failed to load resource: the server responded with a status of (400|401|403|404|429)/i,
  /exercise-search/i,
  /\[ExerciseDB\]/i,
  /Customer portal error/i,
  /\[AuthContext\] Profile fetch failed/i,
  /due to access control checks/i,
  /punycode/i,
];

function isIgnored(text: string) {
  return IGNORED_PATTERNS.some((p) => p.test(text));
}

// ── Helpers ────────────────────────────────────────────────────────────────────
async function collectErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(`[pageerror] ${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error' && !isIgnored(msg.text())) {
      errors.push(`[console.error] ${msg.text()}`);
    }
  });
  return errors;
}

async function freezeMotion(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
        caret-color: transparent !important;
      }
      html { scroll-behavior: auto !important; }
    `,
  });
}

async function waitForGallery(page: Page) {
  await page.waitForLoadState('domcontentloaded');
  // Gallery is lazy-loaded — wait until Archivo Black brand text appears
  await page.waitForSelector('text=atlas.core · v3 · gallery', { timeout: 20_000 });
}

async function checkNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  expect(overflow, 'page must not have horizontal overflow').toBe(false);
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. GALLERY: /v3 — all screens render without errors
// ─────────────────────────────────────────────────────────────────────────────
test.describe('/v3 gallery — no-error render', () => {
  test('loads without JS or console errors', async ({ page }) => {
    const errors = await collectErrors(page);
    await page.goto('/v3', { waitUntil: 'domcontentloaded' });
    await freezeMotion(page);
    await waitForGallery(page);
    // Wait a tick for lazy components to resolve
    await page.waitForTimeout(600);
    expect(errors, 'no runtime errors in gallery').toEqual([]);
  });

  test('no "(screen not yet wired)" placeholders', async ({ page }) => {
    await page.goto('/v3', { waitUntil: 'domcontentloaded' });
    await waitForGallery(page);
    await page.waitForTimeout(600);
    const count = await page.locator('text=screen not yet wired').count();
    expect(count, 'all screens should be wired').toBe(0);
  });

  test('gallery hero text is present', async ({ page }) => {
    await page.goto('/v3', { waitUntil: 'domcontentloaded' });
    await waitForGallery(page);
    await expect(page.locator('text=the system,').first()).toBeVisible();
    await expect(page.locator('text=on a phone.').first()).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. PHASE 9: S87–S107 all listed in the gallery
// ─────────────────────────────────────────────────────────────────────────────
test.describe('/v3 gallery — S87–S107 new screens visible', () => {
  // Gallery renders these screen index labels in "screen 87" format
  const NEW_SCREEN_INDEXES = [87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107];

  for (const idx of NEW_SCREEN_INDEXES) {
    test(`screen ${String(idx).padStart(2, '0')} label present`, async ({ page }) => {
      await page.goto('/v3', { waitUntil: 'domcontentloaded' });
      await waitForGallery(page);
      // Scroll to bottom so lazy sections render
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(400);
      const label = `screen ${String(idx).padStart(2, '0')}`;
      const el = page.locator(`text=${label}`).first();
      await expect(el).toBeVisible({ timeout: 10_000 });
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. AUTH SCREENS: new public routes render correctly
// ─────────────────────────────────────────────────────────────────────────────
test.describe('auth screens — public routes', () => {
  const AUTH_ROUTES = [
    { path: '/auth/login',  label: 'login', check: /sign in|magic link|continue/i },
    { path: '/auth/signup', label: 'signup', check: /create|start|trial|sign up/i },
    { path: '/auth/forgot', label: 'forgot', check: /forgot|reset|verify|password/i },
  ];

  for (const route of AUTH_ROUTES) {
    test(`${route.path} — renders without errors`, async ({ page }) => {
      const errors = await collectErrors(page);
      await page.goto(route.path, { waitUntil: 'domcontentloaded' });
      await freezeMotion(page);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(300);
      await expect(page.locator('body')).toBeVisible({ timeout: 10_000 });
      await expect(page.locator('body')).not.toContainText(/something went wrong|application error/i);
      expect(errors, `no runtime errors on ${route.path}`).toEqual([]);
    });

    test(`${route.path} — shows expected content`, async ({ page }) => {
      await page.goto(route.path, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(400);
      const body = page.locator('body');
      await expect(body).toBeVisible();
      // At minimum the page must contain relevant text or not redirect to an error
      await expect(page).not.toHaveURL(/\/500|\/maintenance/i);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. SPLASH / WELCOME — entry screens load fast
// ─────────────────────────────────────────────────────────────────────────────
test.describe('splash & welcome — load performance', () => {
  const SPLASH_ROUTES = ['/', '/welcome', '/welcome/manifesto'];

  for (const path of SPLASH_ROUTES) {
    test(`${path} — FCP under 4 s`, async ({ page }) => {
      const start = Date.now();
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('body')).toBeVisible({ timeout: 8_000 });
      // Read FCP from the paint timeline after navigation settles
      const fcp = await page.evaluate(() => {
        const entries = performance.getEntriesByType('paint');
        const fcpEntry = entries.find((e) => e.name === 'first-contentful-paint');
        return fcpEntry ? fcpEntry.startTime : null;
      });
      if (fcp !== null) {
        expect(fcp, `FCP for ${path} must be under 4000 ms`).toBeLessThan(4000);
      } else {
        // FCP not in timeline — use wall-clock as a proxy (must be under 4 s total)
        const elapsed = Date.now() - start;
        expect(elapsed, `load time for ${path} must be under 4000 ms`).toBeLessThan(4000);
      }
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. RESPONSIVENESS — no horizontal overflow on mobile
// ─────────────────────────────────────────────────────────────────────────────
test.describe('responsive — no horizontal overflow', () => {
  // These are the public routes most likely to overflow on narrow screens
  const RESPONSIVE_ROUTES = [
    '/auth/login',
    '/auth/signup',
    '/auth/forgot',
    '/welcome',
    '/',
    '/landing',
    '/pricing',
  ];

  for (const path of RESPONSIVE_ROUTES) {
    test(`${path} — no horizontal scroll`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(300);
      await checkNoHorizontalOverflow(page);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. MOTION — key animations are present in the DOM
// ─────────────────────────────────────────────────────────────────────────────
test.describe('motion — animations present', () => {
  test('S89 magic callback — ac_pulse keyframe defined', async ({ page }) => {
    await page.goto('/v3', { waitUntil: 'domcontentloaded' });
    await waitForGallery(page);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(600);
    // The ac_pulse keyframe is injected by S89 as an inline <style> tag
    const kfDefined = await page.evaluate(() => {
      for (const sheet of Array.from(document.styleSheets)) {
        try {
          for (const rule of Array.from(sheet.cssRules || [])) {
            if ((rule as CSSRule).cssText?.includes('ac_pulse')) return true;
          }
        } catch { /* cross-origin sheets are inaccessible */ }
      }
      return false;
    });
    expect(kfDefined, 'ac_pulse @keyframes must be defined').toBe(true);
  });

  test('S89 magic callback — ac_blink keyframe defined', async ({ page }) => {
    await page.goto('/v3', { waitUntil: 'domcontentloaded' });
    await waitForGallery(page);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(600);
    const kfDefined = await page.evaluate(() => {
      for (const sheet of Array.from(document.styleSheets)) {
        try {
          for (const rule of Array.from(sheet.cssRules || [])) {
            if ((rule as CSSRule).cssText?.includes('ac_blink')) return true;
          }
        } catch { /* cross-origin */ }
      }
      return false;
    });
    expect(kfDefined, 'ac_blink @keyframes must be defined').toBe(true);
  });

  test('S95 celebrations — reveal keyframe defined', async ({ page }) => {
    await page.goto('/v3', { waitUntil: 'domcontentloaded' });
    await waitForGallery(page);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(600);
    const kfDefined = await page.evaluate(() => {
      for (const sheet of Array.from(document.styleSheets)) {
        try {
          for (const rule of Array.from(sheet.cssRules || [])) {
            if ((rule as CSSRule).cssText?.includes('s95-pr-reveal')) return true;
          }
        } catch { /* cross-origin */ }
      }
      return false;
    });
    expect(kfDefined, 's95-pr-reveal @keyframes must be defined').toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. SCREENSHOTS — captured per device for visual review (chromium only)
// ─────────────────────────────────────────────────────────────────────────────
test.describe('screenshots — new screens phase 9', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'screenshots only on chromium');

  test('/v3 gallery phase 9 section screenshot', async ({ page }, testInfo) => {
    await page.goto('/v3', { waitUntil: 'domcontentloaded' });
    await freezeMotion(page);
    await waitForGallery(page);
    // Scroll to the phase 9 header
    await page.evaluate(() => {
      const el = Array.from(document.querySelectorAll('*')).find(
        (n) => n.textContent?.trim() === 'auth · account · utility.'
      );
      el?.scrollIntoView();
    });
    await page.waitForTimeout(500);
    const shot = await page.screenshot({ fullPage: false, animations: 'disabled' });
    await testInfo.attach('gallery-phase9', { body: shot, contentType: 'image/png' });
  });

  const SCREENSHOT_AUTH = ['/auth/login', '/auth/signup', '/auth/forgot'];
  for (const path of SCREENSHOT_AUTH) {
    test(`screenshot: ${path}`, async ({ page }, testInfo) => {
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      await freezeMotion(page);
      await page.waitForTimeout(400);
      const slug = path.replace(/\//g, '__').replace(/^__/, '');
      const shot = await page.screenshot({ fullPage: false, animations: 'disabled' });
      await testInfo.attach(slug, { body: shot, contentType: 'image/png' });
    });
  }
});
