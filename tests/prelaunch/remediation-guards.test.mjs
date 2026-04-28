import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { test } from 'node:test';

const here = path.dirname(new URL(import.meta.url).pathname);
const fileUrl = (relativePath) => pathToFileURL(path.resolve(here, '../..', relativePath)).href;

const envGuards = await import(fileUrl('src/lib/envGuards.js'));
const subscriptionState = await import(fileUrl('src/lib/subscriptionState.js'));
const gatePolicy = await import(fileUrl('src/lib/entitlementGatePolicy.js'));
const aiCoachErrors = await import(fileUrl('src/lib/aiCoachErrors.js'));
const revenueCatPurchase = await import(fileUrl('src/lib/revenueCatPurchase.js'));

test('hasSupabaseConfigFromEnv requires URL plus anon or publishable key', () => {
  assert.equal(envGuards.hasSupabaseConfigFromEnv({}), false);
  assert.equal(envGuards.hasSupabaseConfigFromEnv({ VITE_SUPABASE_URL: 'https://x.supabase.co' }), false);
  assert.equal(envGuards.hasSupabaseConfigFromEnv({
    VITE_SUPABASE_URL: 'https://x.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'anon',
  }), true);
  assert.equal(envGuards.hasSupabaseConfigFromEnv({
    VITE_SUPABASE_URL: 'https://x.supabase.co',
    VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable',
  }), true);
});

test('auth bypass only enables in dev with explicit true flag', () => {
  assert.equal(envGuards.isAuthBypassEnabledFromEnv({ DEV: true, VITE_ENABLE_AUTH_BYPASS: 'true' }), true);
  assert.equal(envGuards.isAuthBypassEnabledFromEnv({ DEV: false, VITE_ENABLE_AUTH_BYPASS: 'true' }), false);
  assert.equal(envGuards.isAuthBypassEnabledFromEnv({ DEV: true, VITE_ENABLE_AUTH_BYPASS: '1' }), false);
});

test('food-search is not anonymously callable in Supabase config', () => {
  const config = readFileSync(path.resolve(here, '../../supabase/config.toml'), 'utf8');
  assert.match(config, /\[functions\.food-search\]\s+verify_jwt\s*=\s*true/s);
});

test('EntitlementGate policy loads, redirects, and allows correctly', () => {
  assert.deepEqual(gatePolicy.resolveEntitlementGateState({ isLoadingAuth: true }), { type: 'loading' });
  assert.deepEqual(gatePolicy.resolveEntitlementGateState({ user: { onboarding_completed: false } }), {
    type: 'redirect',
    to: '/onboarding',
  });
  assert.deepEqual(gatePolicy.resolveEntitlementGateState({
    user: { onboarding_completed: true },
    hasActivePro: true,
  }), { type: 'allow' });
  assert.deepEqual(gatePolicy.resolveEntitlementGateState({
    user: { onboarding_completed: true },
    hasActivePro: false,
    isNative: true,
  }), { type: 'redirect', to: '/app/paywall' });
});

test('subscription state normalizes Supabase rows and prefers RevenueCat on native', () => {
  const row = subscriptionState.normalizeSupabaseSubscription({
    id: 'sub-1',
    tier: 'pro',
    status: 'active',
    started_at: '2026-04-20T10:20:30Z',
    current_period_ends_at: '2026-05-20T10:20:30Z',
  });

  assert.equal(row.tier, 'pro');
  assert.equal(row.started_at, '2026-04-20');
  assert.equal(row.expires_at, '2026-05-20');

  const rc = { source: 'revenuecat', status: 'active', tier: 'pro' };
  assert.equal(subscriptionState.mergeSubscriptionState({
    isNative: true,
    rcSubscription: rc,
    subscriptions: [row],
  }), rc);
});

test('subscription state falls back to newest active Supabase row', () => {
  const older = { id: 'old', status: 'active', started_at: '2026-01-01' };
  const newer = { id: 'new', status: 'trialing', started_at: '2026-02-01' };
  assert.equal(subscriptionState.mergeSubscriptionState({
    isNative: true,
    rcSubscription: { status: 'inactive' },
    subscriptions: [older, newer],
  }).id, 'new');
});

test('AI coach error mapper covers common backend failures', () => {
  assert.match(aiCoachErrors.mapAICoachError(503), /temporarily unavailable/);
  assert.match(aiCoachErrors.mapAICoachError(429), /rate limit/);
  assert.match(aiCoachErrors.mapAICoachError(401), /Authentication failed/);
  assert.equal(aiCoachErrors.mapAICoachError(500, { error: 'provider_failed' }), 'provider_failed');
});

test('RevenueCat purchase helper resolves packages and reports active entitlement', async () => {
  const monthly = { identifier: '$rc_monthly' };
  const calls = [];
  const result = await revenueCatPurchase.executeRevenueCatPurchase({
    pkgOrIdentifier: '$rc_monthly',
    isAvailable: true,
    getCurrentOffering: async () => ({ availablePackages: [monthly] }),
    purchases: {
      async purchasePackage(payload) {
        calls.push(payload);
        return { customerInfo: { entitlements: { active: { pro: {} } } } };
      },
    },
  });

  assert.equal(result.success, true);
  assert.deepEqual(calls, [{ aPackage: monthly }]);
});

test('RevenueCat purchase helper handles missing packages and user cancellation', async () => {
  const missing = await revenueCatPurchase.executeRevenueCatPurchase({
    pkgOrIdentifier: '$rc_yearly',
    isAvailable: true,
    getCurrentOffering: async () => ({ availablePackages: [{ identifier: '$rc_monthly' }] }),
    purchases: { purchasePackage: async () => { throw new Error('should not purchase'); } },
  });
  assert.equal(missing.error, 'package_not_found:$rc_yearly');

  const cancelled = await revenueCatPurchase.executeRevenueCatPurchase({
    pkgOrIdentifier: { identifier: '$rc_monthly' },
    isAvailable: true,
    getCurrentOffering: async () => null,
    purchases: { purchasePackage: async () => { throw { userCancelled: true }; } },
  });
  assert.equal(cancelled.userCancelled, true);
  assert.equal(cancelled.error, null);
});
