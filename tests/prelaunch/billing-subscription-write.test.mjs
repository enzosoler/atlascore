import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { readFileSync } from 'node:fs';

const here = path.dirname(new URL(import.meta.url).pathname);
const helperUrl = pathToFileURL(
  path.resolve(here, '../../supabase/functions/_shared/subscription-write.js'),
).href;
const { writeSubscriptionByUserId } = await import(helperUrl);

function createSupabaseMock({ stripeMatch = null, userMatch = null } = {}) {
  const calls = [];

  return {
    calls,
    from(table) {
      assert.equal(table, 'subscriptions');
      return {
        select(columns) {
          const state = { columns };
          return {
            eq(column, value) {
              state.eq = [column, value];
              return this;
            },
            order(column, options) {
              state.order = [column, options];
              return this;
            },
            limit(value) {
              state.limit = value;
              return this;
            },
            async maybeSingle() {
              calls.push({ type: 'lookup', ...state });
              if (state.eq?.[0] === 'stripe_subscription_id') {
                return { data: stripeMatch, error: null };
              }
              if (state.eq?.[0] === 'user_id') {
                return { data: userMatch, error: null };
              }
              return { data: null, error: null };
            },
          };
        },
        update(payload) {
          return {
            eq(column, value) {
              const updateCall = { type: 'update', payload, eq: [column, value] };
              calls.push(updateCall);
              return {
                neq(nextColumn, nextValue) {
                  updateCall.neq = [nextColumn, nextValue];
                  return this;
                },
                in(nextColumn, nextValue) {
                  updateCall.in = [nextColumn, nextValue];
                  return Promise.resolve({ error: null });
                },
                select() {
                  return {
                    async single() {
                      return { data: { id: value, ...payload }, error: null };
                    },
                  };
                },
              };
            },
          };
        },
        insert(payload) {
          calls.push({ type: 'insert', payload });
          return {
            select() {
              return {
                async single() {
                  return { data: { id: 'new-sub', ...payload }, error: null };
                },
              };
            },
          };
        },
      };
    },
  };
}

test('writeSubscriptionByUserId inserts when the user has no subscription row', async () => {
  const supabase = createSupabaseMock();
  const row = { user_id: 'user-1', tier: 'pro', status: 'active' };

  const result = await writeSubscriptionByUserId(supabase, row);

  assert.equal(result.action, 'insert');
  assert.deepEqual(
    supabase.calls.map((call) => call.type),
    ['lookup', 'insert', 'update'],
  );
});

test('writeSubscriptionByUserId updates the newest row for the user without relying on UNIQUE(user_id)', async () => {
  const supabase = createSupabaseMock({
    userMatch: { id: 'existing-subscription' },
  });
  const row = { user_id: 'user-2', tier: 'pro', status: 'active' };

  const result = await writeSubscriptionByUserId(supabase, row);

  assert.equal(result.action, 'update');
  assert.deepEqual(
    supabase.calls.map((call) => call.type),
    ['lookup', 'update', 'update'],
  );
  assert.deepEqual(
    supabase.calls.find((call) => call.type === 'update')?.eq,
    ['id', 'existing-subscription'],
  );
});

test('writeSubscriptionByUserId prefers stripe_subscription_id replays over latest-by-user updates', async () => {
  const supabase = createSupabaseMock({
    stripeMatch: { id: 'stripe-sub-row', user_id: 'user-3' },
    userMatch: { id: 'newer-row-that-must-not-be-used' },
  });
  const row = {
    user_id: 'user-3',
    tier: 'pro',
    status: 'active',
    stripe_subscription_id: 'sub_123',
  };

  const result = await writeSubscriptionByUserId(supabase, row);

  assert.equal(result.action, 'update');
  assert.deepEqual(
    supabase.calls.map((call) => call.type),
    ['lookup', 'update', 'update'],
  );
  assert.deepEqual(
    supabase.calls.find((call) => call.type === 'update')?.eq,
    ['id', 'stripe-sub-row'],
  );
});

test('writeSubscriptionByUserId deactivates competing current rows for the same user', async () => {
  const supabase = createSupabaseMock({
    userMatch: { id: 'current-subscription' },
  });

  await writeSubscriptionByUserId(supabase, {
    user_id: 'user-4',
    tier: 'pro',
    status: 'active',
  });

  const cleanupCall = supabase.calls.at(-1);
  assert.equal(cleanupCall.type, 'update');
  assert.deepEqual(cleanupCall.payload, { status: 'inactive' });
  assert.deepEqual(cleanupCall.eq, ['user_id', 'user-4']);
  assert.deepEqual(cleanupCall.neq, ['id', 'current-subscription']);
  assert.deepEqual(cleanupCall.in, ['status', ['trialing', 'active', 'granted', 'past_due']]);
});

test('billing service still creates checkout, returns success, and confirms checkout through the current functions', () => {
  const source = readFileSync(
    path.resolve(here, '../../src/services/billingService.js'),
    'utf8',
  );

  assert.match(source, /functions\.invoke\('create-checkout'/);
  assert.match(source, /url:\s*data\.url/);
  assert.match(source, /functions\.invoke\('complete-checkout'/);
  assert.match(source, /return data;/);
});
