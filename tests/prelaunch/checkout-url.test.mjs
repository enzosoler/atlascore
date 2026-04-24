/**
 * Contract test: the current web Stripe checkout flow must include the
 * `{CHECKOUT_SESSION_ID}` placeholder and confirm checkout on `/webapp/success`.
 *
 * Why: without it, Stripe redirects to a URL missing the session_id, which
 * means the web purchase success route cannot call complete-checkout, which means the
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
const billingServicePath = path.resolve(here, '../../src/services/billingService.js');
const purchaseSuccessPath = path.resolve(here, '../../src/redesign/v3/routes/V3WebPurchaseSuccess.jsx');
const createCheckoutPath = path.resolve(here, '../../supabase/functions/create-checkout/index.ts');
const createCustomerPortalPath = path.resolve(here, '../../supabase/functions/create-customer-portal/index.ts');
const useCustomerPortalPath = path.resolve(here, '../../src/hooks/useCustomerPortal.js');

test('billingService success_url contains {CHECKOUT_SESSION_ID}', () => {
  const source = readFileSync(billingServicePath, 'utf8');
  assert.ok(
    source.includes('{CHECKOUT_SESSION_ID}'),
    'billingService must include the {CHECKOUT_SESSION_ID} placeholder so /webapp/success can confirm the subscription after redirect.',
  );
});

test('billingService success_url points at /webapp/success', () => {
  const source = readFileSync(billingServicePath, 'utf8');
  const hasSessionId = /successUrl\s*=\s*.*\{CHECKOUT_SESSION_ID\}/s.test(source);
  const hasSuccessRoute = /\/webapp\/success/.test(source);
  assert.ok(
    hasSessionId && hasSuccessRoute,
    'Expected billingService to redirect to /webapp/success with session_id on success.',
  );
});

test('V3WebPurchaseSuccess reads session_id and calls completeWebCheckout', () => {
  const source = readFileSync(purchaseSuccessPath, 'utf8');
  assert.ok(
    /URLSearchParams\(window\.location\.search\)\.get\(['"]session_id['"]\)/.test(source),
    'V3WebPurchaseSuccess must read ?session_id from the URL after Stripe redirects back.',
  );
  assert.ok(
    source.includes('completeWebCheckout(sessionId)'),
    'V3WebPurchaseSuccess must call completeWebCheckout with the session_id so the subscription row is created. Without this, the user pays Stripe but stays on the free tier.',
  );
});

test('create-checkout fallback URLs use current web billing routes', () => {
  const source = readFileSync(createCheckoutPath, 'utf8');
  assert.ok(
    source.includes('/webapp/success?session_id={CHECKOUT_SESSION_ID}'),
    'create-checkout fallback success_url must point at /webapp/success with session_id.',
  );
  assert.ok(
    source.includes('/webapp/billing/paywall'),
    'create-checkout fallback cancel_url must point at /webapp/billing/paywall.',
  );
});

test('create-checkout resolves redirect origins through a server allowlist', () => {
  const source = readFileSync(createCheckoutPath, 'utf8');
  assert.ok(
    source.includes('ALLOWED_REDIRECT_ORIGINS'),
    'create-checkout must support a server-side redirect allowlist.',
  );
  assert.ok(
    source.includes('resolveAllowedAppOrigin(appUrl, body.success_url || body.cancel_url)'),
    'create-checkout must validate redirect origins before creating Stripe sessions.',
  );
  assert.ok(
    !source.includes('success_url: body.success_url ||'),
    'create-checkout must not trust success_url from the client directly.',
  );
  assert.ok(
    !source.includes('cancel_url: body.cancel_url ||'),
    'create-checkout must not trust cancel_url from the client directly.',
  );
});

test('create-customer-portal resolves return_url through a server allowlist', () => {
  const source = readFileSync(createCustomerPortalPath, 'utf8');
  assert.ok(
    source.includes('ALLOWED_REDIRECT_ORIGINS'),
    'create-customer-portal must support a server-side redirect allowlist.',
  );
  assert.ok(
    source.includes('resolveAllowedAppOrigin(appUrl, return_url)'),
    'create-customer-portal must validate return_url before creating portal sessions.',
  );
  assert.ok(
    source.includes('return_url: `${redirectOrigin}/webapp/billing`'),
    'create-customer-portal must return users to the known billing route only.',
  );
  assert.ok(
    !source.includes('return_url: return_url ||'),
    'create-customer-portal must not trust return_url from the client directly.',
  );
});

test('useCustomerPortal sends the same auth header required by create-customer-portal', () => {
  const source = readFileSync(useCustomerPortalPath, 'utf8');
  assert.ok(
    source.includes("supabase.auth.getSession()"),
    'useCustomerPortal must read the current session before invoking create-customer-portal.',
  );
  assert.ok(
    source.includes('Authorization: `Bearer ${accessToken}`'),
    'useCustomerPortal must send the bearer token required by create-customer-portal.',
  );
});
