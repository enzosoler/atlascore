import { test, expect, type Page } from '@playwright/test';
import { loginAs } from './helpers/auth';

const email = process.env.E2E_USER_EMAIL;
const password = process.env.E2E_USER_PASSWORD;

const PUBLIC_ROUTES = [
  '/',
  '/landing',
  '/pricing',
  '/the-app',
  '/method',
  '/labs',
  '/terms',
  '/privacy',
  '/faq',
  '/help',
  '/download-app',
  '/welcome',
  '/auth/login',
  '/auth/signup',
  '/auth/forgot',
  '/auth/reset',
  '/maintenance',
  '/force-update',
  '/500',
  '/404',
];

const PROTECTED_ROUTES = [
  '/app/today',
  '/app/workouts',
  '/app/routines',
  '/app/nutrition',
  '/app/body',
  '/app/settings',
  '/app/coach',
  '/app/labs',
  '/app/notifications',
  '/app/workouts/active',
  '/app/nutrition/capture',
  '/app/body/measurements',
  '/app/social/share',
  '/webapp/account',
  '/webapp/export',
  '/webapp/billing',
  '/webapp/billing/manage',
  '/webapp/billing/paywall',
  '/webapp/settings',
  '/webapp/settings/danger',
];

const AUTHED_ROUTES = [
  '/app/today',
  '/app/weekly',
  '/app/workouts',
  '/app/workouts/history',
  '/app/workouts/records',
  '/app/workouts/active',
  '/app/routines',
  '/app/routines/presets',
  '/app/exercises',
  '/app/nutrition',
  '/app/nutrition/diary',
  '/app/nutrition/search',
  '/app/nutrition/capture',
  '/app/nutrition/water',
  '/app/nutrition/targets',
  '/app/body',
  '/app/body/measurements',
  '/app/body/composition',
  '/app/body/progress/photos',
  '/app/labs',
  '/app/labs/history',
  '/app/coach',
  '/app/coach/chat',
  '/app/social',
  '/app/social/friends',
  '/app/social/share',
  '/app/notifications',
  '/app/profile',
  '/app/profile/edit',
  '/app/settings',
  '/app/settings/integrations',
  '/webapp/account',
  '/webapp/export',
  '/webapp/billing/manage',
  '/webapp/billing/paywall',
  '/webapp/billing/invoices',
  '/webapp/settings',
  '/webapp/settings/danger',
  '/webapp/settings/diagnostics',
];

function isIgnoredConsole(text: string) {
  return [
    /\[i18n\] Missing translation key/i,
    /favicon|manifest/i,
    /Failed to load resource: the server responded with a status of (400|401|403|404|429)/i,
    /exercise-search/i,
    /\[ExerciseDB\]/i,
    /ResizeObserver loop/i,
    /Customer portal error/i,
    /\[AuthContext\] Profile fetch failed: TypeError: Failed to fetch/i,
  ].some((pattern) => pattern.test(text));
}

function isIgnoredFailure(url: string, status: number) {
  if (
    status === 404
    && /\/_vercel\/(insights|speed-insights)\/script\.js$/i.test(url)
  ) {
    return true;
  }

  return false;
}

async function installAuditors(page: Page) {
  const errors: string[] = [];
  const failedRequests: string[] = [];

  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' && !isIgnoredConsole(message.text())) {
      errors.push(message.text());
    }
  });
  page.on('response', (response) => {
    const status = response.status();
    const url = response.url();
    if (isIgnoredFailure(url, status)) return;
    if (status >= 500 || (status === 404 && url.startsWith(page.url().split('/').slice(0, 3).join('/')))) {
      failedRequests.push(`${status} ${url}`);
    }
  });

  return { errors, failedRequests };
}

async function expectRenderable(page: Page) {
  await expect(page.locator('body')).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('body')).not.toContainText(/something went wrong|application error|route not found/i);
}

test.describe('MVP release route audit', () => {
  for (const route of PUBLIC_ROUTES) {
    test(`public route renders: ${route}`, async ({ page }) => {
      const audit = await installAuditors(page);
      await page.goto(route);
      await expectRenderable(page);
      expect(audit.failedRequests, 'network failures').toEqual([]);
      expect(audit.errors, 'browser console/page errors').toEqual([]);
    });
  }

  for (const route of PROTECTED_ROUTES) {
    test(`logged-out route redirects to auth: ${route}`, async ({ page }) => {
      await page.context().clearCookies();
      await page.goto(route);
      await expect(page).toHaveURL(/\/auth\/login/i, { timeout: 15_000 });
    });
  }

  test.describe('authenticated route sweep', () => {
    test.skip(!email || !password, 'Set E2E_USER_EMAIL + E2E_USER_PASSWORD to run authenticated release route audit');
    test.describe.configure({ mode: 'serial' });

    for (const route of AUTHED_ROUTES) {
      test(`authed route renders: ${route}`, async ({ page }) => {
        await loginAs(page, email!, password!);
        const audit = await installAuditors(page);
        await page.goto(route);
        await expect(page).not.toHaveURL(/\/auth\/login/i, { timeout: 10_000 });
        await expectRenderable(page);
        expect(audit.failedRequests, 'network failures').toEqual([]);
        expect(audit.errors, 'browser console/page errors').toEqual([]);
      });
    }
  });

  test.describe('keyboard smoke', () => {
    for (const route of ['/auth/login?mode=password', '/auth/forgot']) {
      test(`keyboard focus reaches an interactive control: ${route}`, async ({ page }) => {
        await page.goto(route);
        await page.keyboard.press('Tab');
        const focused = page.locator(':focus');
        await expect(focused).toBeVisible({ timeout: 5_000 });
      });
    }

    test.describe('authenticated keyboard smoke', () => {
      test.skip(!email || !password, 'Set E2E_USER_EMAIL + E2E_USER_PASSWORD to run authenticated keyboard smoke');
      test.describe.configure({ mode: 'serial' });

      for (const route of ['/app/today', '/webapp/billing/paywall']) {
        test(`authenticated keyboard focus reaches an interactive control: ${route}`, async ({ page }) => {
          await loginAs(page, email!, password!);
          await page.goto(route);
          await expect(page.getByText(/initializing/i)).toHaveCount(0, { timeout: 15_000 });
          for (let i = 0; i < 3; i += 1) {
            await page.keyboard.press('Tab');
            const hasFocusedControl = await page.evaluate(() => {
              const el = document.activeElement;
              if (!el || el === document.body) return false;
              return ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName) ||
                el.getAttribute('role') === 'button' ||
                el.hasAttribute('tabindex');
            });
            if (hasFocusedControl) return;
          }
          throw new Error(`No keyboard-focusable control reached on ${route}`);
        });
      }
    });
  });
});
