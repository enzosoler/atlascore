import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import ts from 'typescript';

const here = path.dirname(new URL(import.meta.url).pathname);
const sourcePath = path.resolve(here, '../../supabase/functions/complete-checkout/index.ts');

async function loadHandler({
  env = {},
  user = { id: 'user-1', email: 'athlete@example.com' },
  authError = null,
  stripeRetrieveResult,
  stripeRetrieveError = null,
  writeError = null,
} = {}) {
  const source = readFileSync(sourcePath, 'utf8')
    .replace(
      "import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';",
      'const { serve } = globalThis.__completeCheckoutTestMocks;',
    )
    .replace(
      "import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';",
      'const { createClient } = globalThis.__completeCheckoutTestMocks;',
    )
    .replace(
      "import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno';",
      'const { Stripe } = globalThis.__completeCheckoutTestMocks;',
    )
    .replace(
      "import { writeSubscriptionByUserId } from '../_shared/subscription-write.js';",
      'const { writeSubscriptionByUserId } = globalThis.__completeCheckoutTestMocks;',
    )
    .replace(
      "import { getCorsHeaders, buildPreflightResponse } from '../_shared/cors.ts';",
      'const { getCorsHeaders, buildPreflightResponse } = globalThis.__completeCheckoutTestMocks;',
    );

  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;

  const originalMocks = globalThis.__completeCheckoutTestMocks;
  const originalDeno = globalThis.Deno;
  const originalConsoleError = console.error;
  const originalConsoleLog = console.log;

  let handler = null;
  const stripeCalls = [];
  const writeCalls = [];
  const createClientCalls = [];
  const errorLogs = [];
  const infoLogs = [];

  globalThis.__completeCheckoutTestMocks = {
    serve(fn) {
      handler = fn;
    },
    createClient(url, key) {
      createClientCalls.push({ url, key });
      return {
        auth: {
          async getUser(jwt) {
            return {
              data: { user },
              error: authError,
              jwt,
            };
          },
        },
      };
    },
    Stripe: class StripeMock {
      constructor(secret, options) {
        this.secret = secret;
        this.options = options;
        this.checkout = {
          sessions: {
            retrieve: async (sessionId, options) => {
              stripeCalls.push({ sessionId, options, secret });
              if (stripeRetrieveError) throw stripeRetrieveError;
              return typeof stripeRetrieveResult === 'function'
                ? stripeRetrieveResult(sessionId, options)
                : stripeRetrieveResult;
            },
          },
        };
      }
    },
    async writeSubscriptionByUserId(_supabase, row) {
      writeCalls.push(row);
      if (writeError) throw writeError;
      return { action: 'update', data: row };
    },
    getCorsHeaders() {
      return {
        'Access-Control-Allow-Origin': 'https://useatlascore.com',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      };
    },
    buildPreflightResponse() {
      return new Response(null, { status: 200 });
    },
  };

  globalThis.Deno = {
    env: {
      get(key) {
        return env[key] ?? '';
      },
    },
  };

  console.error = (...args) => {
    errorLogs.push(args);
  };
  console.log = (...args) => {
    infoLogs.push(args);
  };

  const moduleUrl = `data:text/javascript;base64,${Buffer.from(transpiled).toString('base64')}#${Date.now()}${Math.random()}`;
  await import(moduleUrl);
  assert.equal(typeof handler, 'function', 'Expected serve() to register a handler');

  return {
    handler,
    stripeCalls,
    writeCalls,
    createClientCalls,
    errorLogs,
    infoLogs,
    restore() {
      globalThis.__completeCheckoutTestMocks = originalMocks;
      globalThis.Deno = originalDeno;
      console.error = originalConsoleError;
      console.log = originalConsoleLog;
    },
  };
}

async function json(response) {
  return JSON.parse(await response.text());
}

function request({ method = 'POST', headers = {}, body } = {}) {
  return new Request('https://example.com/functions/v1/complete-checkout', {
    method,
    headers,
    body,
  });
}

test('returns 503 when Stripe is not configured', async () => {
  const ctx = await loadHandler({
    env: {
      SUPABASE_URL: 'https://project.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role',
    },
  });

  try {
    const response = await ctx.handler(request({
      body: JSON.stringify({ session_id: 'cs_123' }),
      headers: { Authorization: 'Bearer jwt' },
    }));

    assert.equal(response.status, 503);
    assert.deepEqual(await json(response), { error: 'Stripe not configured' });
    assert.equal(ctx.createClientCalls.length, 0);
  } finally {
    ctx.restore();
  }
});

test('returns 401 when JWT is invalid', async () => {
  const ctx = await loadHandler({
    env: {
      SUPABASE_URL: 'https://project.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role',
      STRIPE_SECRET_KEY: 'sk_test_123',
    },
    user: null,
    authError: { message: 'invalid jwt' },
  });

  try {
    const response = await ctx.handler(request({
      body: JSON.stringify({ session_id: 'cs_123' }),
      headers: { Authorization: 'Bearer bad-jwt' },
    }));

    assert.equal(response.status, 401);
    assert.deepEqual(await json(response), { error: 'Unauthorized' });
  } finally {
    ctx.restore();
  }
});

test('returns 400 for invalid JSON', async () => {
  const ctx = await loadHandler({
    env: {
      SUPABASE_URL: 'https://project.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role',
      STRIPE_SECRET_KEY: 'sk_test_123',
    },
  });

  try {
    const invalidJsonResponse = await ctx.handler(request({
      body: '{bad-json',
      headers: { Authorization: 'Bearer jwt', 'Content-Type': 'application/json' },
    }));
    assert.equal(invalidJsonResponse.status, 400);
    assert.deepEqual(await json(invalidJsonResponse), { error: 'Invalid JSON' });
  } finally {
    ctx.restore();
  }
});

test('returns 400 when session_id is missing', async () => {
  const ctx = await loadHandler({
    env: {
      SUPABASE_URL: 'https://project.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role',
      STRIPE_SECRET_KEY: 'sk_test_123',
    },
  });

  try {
    const missingSessionIdResponse = await ctx.handler(request({
      body: JSON.stringify({}),
      headers: { Authorization: 'Bearer jwt', 'Content-Type': 'application/json' },
    }));
    assert.equal(missingSessionIdResponse.status, 400);
    assert.deepEqual(await json(missingSessionIdResponse), { error: 'Missing session_id' });
  } finally {
    ctx.restore();
  }
});

test('returns 502 when Stripe session retrieval fails', async () => {
  const ctx = await loadHandler({
    env: {
      SUPABASE_URL: 'https://project.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role',
      STRIPE_SECRET_KEY: 'sk_test_123',
    },
    stripeRetrieveError: new Error('No such checkout session'),
  });

  try {
    const response = await ctx.handler(request({
      body: JSON.stringify({ session_id: 'cs_missing' }),
      headers: { Authorization: 'Bearer jwt' },
    }));

    assert.equal(response.status, 502);
    assert.deepEqual(await json(response), { error: 'Stripe error: No such checkout session' });
    assert.equal(ctx.stripeCalls.length, 1);
  } finally {
    ctx.restore();
  }
});

test('returns 403 when checkout session belongs to another user', async () => {
  const ctx = await loadHandler({
    env: {
      SUPABASE_URL: 'https://project.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role',
      STRIPE_SECRET_KEY: 'sk_test_123',
    },
    user: { id: 'user-1' },
    stripeRetrieveResult: {
      metadata: { user_id: 'user-2' },
      payment_status: 'paid',
      status: 'complete',
      subscription: { id: 'sub_123', items: { data: [{ price: { id: 'price_123' } }] }, customer: 'cus_123', current_period_start: 1, current_period_end: 2, cancel_at_period_end: false, status: 'active' },
    },
  });

  try {
    const response = await ctx.handler(request({
      body: JSON.stringify({ session_id: 'cs_123' }),
      headers: { Authorization: 'Bearer jwt' },
    }));

    assert.equal(response.status, 403);
    assert.deepEqual(await json(response), { error: 'Forbidden' });
    assert.equal(ctx.writeCalls.length, 0);
  } finally {
    ctx.restore();
  }
});

test('returns 422 for incomplete session', async () => {
  const ctx = await loadHandler({
    env: {
      SUPABASE_URL: 'https://project.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role',
      STRIPE_SECRET_KEY: 'sk_test_123',
    },
    stripeRetrieveResult: {
      metadata: { user_id: 'user-1' },
      payment_status: 'unpaid',
      status: 'open',
      subscription: { id: 'sub_123', items: { data: [{ price: { id: 'price_123' } }] }, customer: 'cus_123', current_period_start: 1, current_period_end: 2, cancel_at_period_end: false, status: 'active' },
    },
  });

  try {
    const response = await ctx.handler(request({
      body: JSON.stringify({ session_id: 'cs_123' }),
      headers: { Authorization: 'Bearer jwt' },
    }));

    assert.equal(response.status, 422);
    assert.deepEqual(await json(response), { error: 'Session not complete', status: 'open' });
  } finally {
    ctx.restore();
  }
});

test('returns 422 when session has no subscription', async () => {
  const ctx = await loadHandler({
    env: {
      SUPABASE_URL: 'https://project.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role',
      STRIPE_SECRET_KEY: 'sk_test_123',
    },
    stripeRetrieveResult: {
      metadata: { user_id: 'user-1' },
      payment_status: 'paid',
      status: 'complete',
      subscription: null,
    },
  });

  try {
    const response = await ctx.handler(request({
      body: JSON.stringify({ session_id: 'cs_456' }),
      headers: { Authorization: 'Bearer jwt' },
    }));

    assert.equal(response.status, 422);
    assert.deepEqual(await json(response), { error: 'No subscription in session' });
  } finally {
    ctx.restore();
  }
});

test('writes normalized subscription row and returns success for completed checkout', async () => {
  const ctx = await loadHandler({
    env: {
      SUPABASE_URL: 'https://project.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role',
      STRIPE_SECRET_KEY: 'sk_test_123',
    },
    user: { id: 'user-42', email: 'athlete@example.com' },
    stripeRetrieveResult: {
      metadata: { user_id: 'user-42', plan: 'athlete_performance' },
      payment_status: 'paid',
      status: 'complete',
      subscription: {
        id: 'sub_live_123',
        customer: 'cus_live_123',
        status: 'trialing',
        current_period_start: 1710000000,
        current_period_end: 1712592000,
        trial_start: 1710000000,
        trial_end: 1710600000,
        cancel_at_period_end: true,
        items: { data: [{ price: { id: 'price_perf_yearly' } }] },
      },
    },
  });

  try {
    const response = await ctx.handler(request({
      body: JSON.stringify({ session_id: 'cs_ok' }),
      headers: { Authorization: 'Bearer user-jwt' },
    }));

    assert.equal(response.status, 200);
    assert.deepEqual(await json(response), { success: true, plan: 'performance' });
    assert.equal(ctx.stripeCalls.length, 1);
    assert.equal(ctx.writeCalls.length, 1);
    assert.deepEqual(ctx.stripeCalls[0], {
      sessionId: 'cs_ok',
      options: { expand: ['subscription'] },
      secret: 'sk_test_123',
    });
    assert.equal(ctx.writeCalls[0].user_id, 'user-42');
    assert.equal(ctx.writeCalls[0].tier, 'performance');
    assert.equal(ctx.writeCalls[0].status, 'trialing');
    assert.equal(ctx.writeCalls[0].stripe_subscription_id, 'sub_live_123');
    assert.equal(ctx.writeCalls[0].stripe_customer_id, 'cus_live_123');
    assert.equal(ctx.writeCalls[0].stripe_price_id, 'price_perf_yearly');
    assert.equal(ctx.writeCalls[0].cancel_at_period_end, true);
  } finally {
    ctx.restore();
  }
});

test('returns 500 with detail when subscription write fails', async () => {
  const ctx = await loadHandler({
    env: {
      SUPABASE_URL: 'https://project.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role',
      STRIPE_SECRET_KEY: 'sk_test_123',
    },
    stripeRetrieveResult: {
      metadata: { user_id: 'user-1', plan: 'athlete_pro' },
      payment_status: 'paid',
      status: 'complete',
      subscription: {
        id: 'sub_123',
        customer: 'cus_123',
        status: 'active',
        current_period_start: 1,
        current_period_end: 2,
        trial_start: null,
        trial_end: null,
        cancel_at_period_end: false,
        items: { data: [{ price: { id: 'price_123' } }] },
      },
    },
    writeError: new Error('duplicate key value violates constraint'),
  });

  try {
    const response = await ctx.handler(request({
      body: JSON.stringify({ session_id: 'cs_db_fail' }),
      headers: { Authorization: 'Bearer jwt' },
    }));

    assert.equal(response.status, 500);
    assert.deepEqual(await json(response), {
      error: 'DB error',
      detail: 'duplicate key value violates constraint',
    });
    assert.equal(ctx.writeCalls.length, 1);
  } finally {
    ctx.restore();
  }
});
