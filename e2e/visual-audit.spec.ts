import { test, expect, type Page } from '@playwright/test';
import { loginAs } from './helpers/auth';
import { VISUAL_AUDIT_ROUTES } from './visual-route-inventory';

const email = process.env.E2E_USER_EMAIL;
const password = process.env.E2E_USER_PASSWORD;

function isIgnoredConsole(text: string) {
  return [
    /\[i18n\] Missing translation key/i,
    /ResizeObserver loop/i,
    /favicon|manifest/i,
    /Failed to load resource: the server responded with a status of (400|401|403|404|429)/i,
    /exercise-search/i,
    /\[ExerciseDB\]/i,
    /Customer portal error/i,
    /\[AuthContext\] Profile fetch failed: TypeError: Failed to fetch/i,
    /\[AuthContext\] Profile fetch failed: Profile fetch timeout/i,
    /due to access control checks/i,
  ].some((pattern) => pattern.test(text));
}

async function stabilizePage(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addStyleTag({
    content: `
      *,
      *::before,
      *::after {
        animation: none !important;
        transition: none !important;
        caret-color: transparent !important;
      }
      html {
        scroll-behavior: auto !important;
      }
    `,
  });
}

async function waitForRenderable(page: Page) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(350);
  await expect(page.locator('body')).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('body')).not.toContainText(/something went wrong|application error|route not found/i);
}

async function installAuditors(page: Page) {
  const errors: string[] = [];

  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' && !isIgnoredConsole(message.text())) {
      errors.push(message.text());
    }
  });

  return errors;
}

function routeFileName(slug: string, path: string) {
  const normalizedPath = path === '/'
    ? 'root'
    : path.replace(/^\//, '').replace(/[/:]+/g, '__');
  return `${slug}__${normalizedPath}.png`;
}

async function captureRoute(page: Page, slug: string, path: string) {
  const errors = await installAuditors(page);
  try {
    await page.goto(path, { waitUntil: 'domcontentloaded' });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const isNavigationRace =
      /interrupted by another navigation|Frame load interrupted/i.test(message);
    if (!isNavigationRace) throw error;
    await page.waitForTimeout(1200);
    await page.goto(path, { waitUntil: 'domcontentloaded' });
  }
  await stabilizePage(page);
  await waitForRenderable(page);
  expect(errors, `console/page errors for ${path}`).toEqual([]);
  return routeFileName(slug, path);
}

test.describe('visual audit screenshots', () => {
  for (const route of VISUAL_AUDIT_ROUTES.filter((entry) => entry.auth === 'public')) {
    test(`${route.category}: ${route.path}`, async ({ page }, testInfo) => {
      const fileName = await captureRoute(page, route.slug, route.path);
      const screenshot = await page.screenshot({
        fullPage: false,
        animations: 'disabled',
        path: testInfo.outputPath(fileName),
      });
      await testInfo.attach(fileName, {
        body: screenshot,
        contentType: 'image/png',
      });
    });
  }

  test.describe('authenticated routes', () => {
    test.describe.configure({ mode: 'serial' });
    test.skip(!email || !password, 'Set E2E_USER_EMAIL + E2E_USER_PASSWORD to run visual auth route audit');

    for (const route of VISUAL_AUDIT_ROUTES.filter((entry) => entry.auth === 'user')) {
      test(`${route.category}: ${route.path}`, async ({ page }, testInfo) => {
        await loginAs(page, email!, password!);
        await page.waitForLoadState('networkidle').catch(() => {});
        await page.waitForTimeout(1000);
        const fileName = await captureRoute(page, route.slug, route.path);
        await expect(page).not.toHaveURL(/\/auth\/login/i, { timeout: 10_000 });
        const screenshot = await page.screenshot({
          fullPage: false,
          animations: 'disabled',
          path: testInfo.outputPath(fileName),
        });
        await testInfo.attach(fileName, {
          body: screenshot,
          contentType: 'image/png',
        });
      });
    }
  });
});
