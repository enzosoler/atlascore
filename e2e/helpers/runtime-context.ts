import { Page } from '@playwright/test';

/**
 * Collects runtime context from the browser for AI-assisted bug triage.
 * Attach this to failed tests via Sentry or log to CI artifacts.
 */
export async function getRuntimeContext(page: Page) {
  return page.evaluate(() => ({
    route: window.location.pathname + window.location.search,
    width: window.innerWidth,
    height: window.innerHeight,
    userAgent: navigator.userAgent,
    language: navigator.language,
    theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
    appHeight: getComputedStyle(document.documentElement).getPropertyValue('--app-height').trim(),
    safeBottom: getComputedStyle(document.documentElement).getPropertyValue('--safe-bottom').trim(),
    modalOpen: !!document.querySelector('[role="dialog"][data-state="open"]'),
    drawerOpen: !!document.querySelector('[vaul-drawer][data-state="open"]'),
  }));
}
