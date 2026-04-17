/**
 * Contract test: the Stripe checkout success URL constructed in
 * src/pages/Pricing.jsx must include the `{CHECKOUT_SESSION_ID}` placeholder.
 *
 * Why: without it, Stripe redirects to a URL missing the session_id, which
 * means src/pages/TodayV2.jsx cannot call complete-checkout, which means the
 * user's subscription never activates in the database even though Stripe
 * collected payment. This is a silent revenue-leak bug that happened once
 * (fixed in the QA pass of 2026-04-17) and should never happen again.
 *
 * This test works by reading the source file and grepping for the expected
 * substring. It is intentionally low-tech so it survives refactors and does
 * not require a DOM / test renderer.
 */

import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import path from 'node:path';

const here = path.dirname(new URL(import.meta.url).pathname);
const pricingPath = path.resolve(here, '../../src/pages/Pricing.jsx');
const todayPath = path.resolve(here, '../../src/pages/TodayV2.jsx');

test('Pricing.jsx success_url contains {CHECKOUT_SESSION_ID}', () => {
  const source = readFileSync(pricingPath, 'utf8');
  assert.ok(
    source.includes('{CHECKOUT_SESSION_ID}'),
    'Pricing.jsx must include the {CHECKOUT_SESSION_ID} placeholder in success_url so that TodayV2 can call complete-checkout after redirect. Without this, subscriptions never activate.',
  );
});

test('Pricing.jsx success_url points at /Today', () => {
  const source = readFileSync(pricingPath, 'utf8');
  // Match success_url containing either literal "/Today" or ROUTES.today + {CHECKOUT_SESSION_ID}
  const hasSessionId = /success_url:[^\n]*\{CHECKOUT_SESSION_ID\}/s.test(source);
  const hasTodayRoute = /success_url:[^\n]*(\/Today|ROUTES\.today)/s.test(source);
  assert.ok(
    hasSessionId && hasTodayRoute,
    'Expected Pricing.jsx to redirect to /Today (or ROUTES.today) with session_id on success.',
  );
});

test('TodayV2.jsx reads session_id from search params and calls complete-checkout', () => {
  const source = readFileSync(todayPath, 'utf8');
  assert.ok(
    /searchParams\.get\(['"]session_id['"]\)/.test(source),
    'TodayV2.jsx must read ?session_id from the URL after Stripe redirects back.',
  );
  assert.ok(
    source.includes("supabase.functions.invoke('complete-checkout'"),
    'TodayV2.jsx must call complete-checkout with the session_id so the subscription row is created. Without this, the user pays Stripe but stays on the free tier.',
  );
});
