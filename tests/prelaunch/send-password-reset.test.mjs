import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import ts from 'typescript';

const here = path.dirname(new URL(import.meta.url).pathname);
const sourcePath = path.resolve(here, '../../supabase/functions/send-password-reset/index.ts');

async function loadHandler({
  env = {},
  listUsersResult = { data: { users: [] } },
  generateLinkResult = {
    data: { properties: { action_link: 'https://useatlascore.com/auth/reset?token=secret-reset-token' } },
    error: null,
  },
  rateLimitResult = {
    data: [{ allowed: true, retry_after_seconds: 0 }],
    error: null,
  },
  renderEmailImpl = (_type, _lang, vars) => ({
    subject: 'Reset your atlas.core password',
    html: `<a href="${vars.reset_password_url}">Reset password</a>`,
    text: `Reset password: ${vars.reset_password_url}`,
  }),
  fetchImpl = async () => ({ ok: true, json: async () => ({ id: 're_123' }) }),
} = {}) {
  const source = readFileSync(sourcePath, 'utf8');
  const rewritten = source
    .replace(
      "import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';",
      'const { createClient } = globalThis.__sendPasswordResetTestMocks;',
    )
    .replace(
      "import { renderEmail } from '../_shared/templates.ts';",
      'const { renderEmail } = globalThis.__sendPasswordResetTestMocks;',
    );

  const transpiled = ts.transpileModule(rewritten, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;

  const originalDeno = globalThis.Deno;
  const originalFetch = globalThis.fetch;
  const originalMocks = globalThis.__sendPasswordResetTestMocks;
  const originalConsoleError = console.error;
  const originalConsoleLog = console.log;

  let handler = null;
  const createClientCalls = [];
  const rpcCalls = [];
  const renderCalls = [];
  const fetchCalls = [];
  const errorLogs = [];
  const infoLogs = [];

  globalThis.__sendPasswordResetTestMocks = {
    createClient(url, key) {
      createClientCalls.push({ url, key });
      return {
        auth: {
          admin: {
            async listUsers() {
              return typeof listUsersResult === 'function' ? listUsersResult() : listUsersResult;
            },
            async generateLink(payload) {
              return typeof generateLinkResult === 'function'
                ? generateLinkResult(payload)
                : generateLinkResult;
            },
          },
        },
        async rpc(name, payload) {
          rpcCalls.push({ name, payload });
          return typeof rateLimitResult === 'function'
            ? rateLimitResult(name, payload)
            : rateLimitResult;
        },
      };
    },
    renderEmail(type, lang, vars) {
      renderCalls.push({ type, lang, vars });
      return renderEmailImpl(type, lang, vars);
    },
  };

  globalThis.Deno = {
    env: {
      get(key) {
        return env[key];
      },
    },
    serve(fn) {
      handler = fn;
    },
  };

  globalThis.fetch = async (...args) => {
    fetchCalls.push(args);
    return fetchImpl(...args);
  };

  console.error = (...args) => {
    errorLogs.push(args);
  };
  console.log = (...args) => {
    infoLogs.push(args);
  };

  const moduleUrl = `data:text/javascript;base64,${Buffer.from(transpiled).toString('base64')}#${Date.now()}${Math.random()}`;
  await import(moduleUrl);
  assert.equal(typeof handler, 'function', 'Expected Deno.serve to register a handler');

  return {
    handler,
    createClientCalls,
    rpcCalls,
    renderCalls,
    fetchCalls,
    errorLogs,
    infoLogs,
    restore() {
      globalThis.Deno = originalDeno;
      globalThis.fetch = originalFetch;
      globalThis.__sendPasswordResetTestMocks = originalMocks;
      console.error = originalConsoleError;
      console.log = originalConsoleLog;
    },
  };
}

async function json(response) {
  return JSON.parse(await response.text());
}

test('valid reset request sends email successfully and includes the recovery link in the rendered template', async () => {
  const ctx = await loadHandler({
    env: {
      APP_URL: 'https://useatlascore.com',
      SUPABASE_URL: 'https://project.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role',
      RESEND_API_KEY: 're_test_123',
      FROM_EMAIL: 'atlas.core <noreply@useatlascore.com>',
    },
    listUsersResult: {
      data: {
        users: [{ email: 'athlete@example.com', user_metadata: { full_name: 'Alex Atlas' } }],
      },
    },
    generateLinkResult: ({ options }) => ({
      data: {
        properties: {
          action_link: `${options.redirectTo}&token=secret-reset-token`,
        },
      },
      error: null,
    }),
  });

  try {
    const response = await ctx.handler(new Request('https://example.com', {
      method: 'POST',
      body: JSON.stringify({ email: ' Athlete@Example.com ', language: 'en' }),
      headers: { 'Content-Type': 'application/json' },
    }));

    assert.equal(response.status, 200);
    assert.deepEqual(await json(response), { success: true });
    assert.equal(ctx.renderCalls.length, 1);
    assert.equal(ctx.renderCalls[0].type, 'reset_password');
    assert.equal(ctx.renderCalls[0].lang, 'en');
    assert.match(ctx.renderCalls[0].vars.reset_password_url, /token=secret-reset-token/);
    assert.equal(ctx.fetchCalls.length, 1);
    assert.equal(ctx.fetchCalls[0][0], 'https://api.resend.com/emails');
    assert.equal(ctx.rpcCalls.length, 1);
    assert.equal(ctx.rpcCalls[0].name, 'consume_password_reset_rate_limit');
    assert.equal(ctx.rpcCalls[0].payload.p_email, 'athlete@example.com');

    const payload = JSON.parse(ctx.fetchCalls[0][1].body);
    assert.deepEqual(payload.to, ['athlete@example.com']);
    assert.match(payload.html, /secret-reset-token/);
    assert.match(payload.text, /secret-reset-token/);
  } finally {
    ctx.restore();
  }
});

test('rate-limited reset request returns 429 and does not generate a recovery link', async () => {
  const ctx = await loadHandler({
    env: {
      APP_URL: 'https://useatlascore.com',
      SUPABASE_URL: 'https://project.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role',
      RESEND_API_KEY: 're_test_123',
    },
    rateLimitResult: {
      data: [{ allowed: false, retry_after_seconds: 120 }],
      error: null,
    },
  });

  try {
    const response = await ctx.handler(new Request('https://example.com', {
      method: 'POST',
      body: JSON.stringify({ email: 'limited@example.com' }),
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '203.0.113.10, 10.0.0.1',
      },
    }));

    assert.equal(response.status, 429);
    assert.equal(response.headers.get('Retry-After'), '120');
    assert.deepEqual(await json(response), { error: 'Too many password reset requests. Try again later.' });
    assert.equal(ctx.rpcCalls.length, 1);
    assert.equal(ctx.rpcCalls[0].payload.p_email, 'limited@example.com');
    assert.equal(ctx.rpcCalls[0].payload.p_ip, '203.0.113.10');
    assert.equal(ctx.fetchCalls.length, 0);
    assert.equal(ctx.renderCalls.length, 0);
  } finally {
    ctx.restore();
  }
});

test('missing or invalid email returns 400 and does not call Supabase or Resend', async () => {
  const ctx = await loadHandler();

  try {
    for (const body of [{}, { email: 'not-an-email' }]) {
      const response = await ctx.handler(new Request('https://example.com', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      }));

      assert.equal(response.status, 400);
      assert.deepEqual(await json(response), { error: 'Valid email required' });
    }

    assert.equal(ctx.createClientCalls.length, 0);
    assert.equal(ctx.fetchCalls.length, 0);
    assert.equal(ctx.renderCalls.length, 0);
  } finally {
    ctx.restore();
  }
});

test('provider failure returns 502, still renders locally, and does not call send-email', async () => {
  const ctx = await loadHandler({
    env: {
      APP_URL: 'https://useatlascore.com',
      SUPABASE_URL: 'https://project.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role',
      RESEND_API_KEY: 're_test_123',
    },
    generateLinkResult: {
      data: { properties: { action_link: 'https://useatlascore.com/auth/callback?mode=reset&token=secret-reset-token' } },
      error: null,
    },
    fetchImpl: async () => ({
      ok: false,
      status: 503,
      text: async () => 'provider rejected request',
    }),
  });

  try {
    const response = await ctx.handler(new Request('https://example.com', {
      method: 'POST',
      body: JSON.stringify({ email: 'e2e-user@example.com' }),
      headers: { 'Content-Type': 'application/json' },
    }));

    assert.equal(response.status, 502);
    assert.deepEqual(await json(response), { error: 'Email delivery failed' });
    assert.equal(ctx.renderCalls.length, 1);
    assert.equal(ctx.fetchCalls.length, 1);
    assert.equal(ctx.fetchCalls[0][0], 'https://api.resend.com/emails');
    assert.ok(!sourceIncludesSendEmailDependency(), 'send-password-reset must not depend on send-email');
  } finally {
    ctx.restore();
  }
});

test('generateLink failure stays enumeration-safe and skips provider send', async () => {
  const ctx = await loadHandler({
    env: {
      APP_URL: 'https://useatlascore.com',
      SUPABASE_URL: 'https://project.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role',
      RESEND_API_KEY: 're_test_123',
    },
    generateLinkResult: {
      data: null,
      error: { message: 'user not found' },
    },
  });

  try {
    const response = await ctx.handler(new Request('https://example.com', {
      method: 'POST',
      body: JSON.stringify({ email: 'missing@example.com' }),
      headers: { 'Content-Type': 'application/json' },
    }));

    assert.equal(response.status, 200);
    assert.deepEqual(await json(response), { success: true });
    assert.equal(ctx.fetchCalls.length, 0);
    assert.equal(ctx.renderCalls.length, 0);
  } finally {
    ctx.restore();
  }
});

test('provider failure logs are useful but redact reset links and secrets', async () => {
  const ctx = await loadHandler({
    env: {
      APP_URL: 'https://useatlascore.com',
      SUPABASE_URL: 'https://project.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role',
      RESEND_API_KEY: 're_test_super_secret',
      FROM_EMAIL: 'atlas.core <noreply@useatlascore.com>',
    },
    generateLinkResult: {
      data: {
        properties: {
          action_link: 'https://useatlascore.com/auth/callback?mode=reset&token=secret-reset-token',
        },
      },
      error: null,
    },
    fetchImpl: async () => ({
      ok: false,
      status: 500,
      text: async () => 'echoed provider response https://useatlascore.com/auth/callback?mode=reset&token=secret-reset-token re_test_super_secret',
    }),
  });

  try {
    const response = await ctx.handler(new Request('https://example.com', {
      method: 'POST',
      body: JSON.stringify({ email: 'e2e-user@example.com' }),
      headers: { 'Content-Type': 'application/json' },
    }));

    assert.equal(response.status, 502);
    assert.ok(ctx.errorLogs.length >= 1);
    const flattened = JSON.stringify(ctx.errorLogs);
    assert.match(flattened, /resend failed/i);
    assert.match(flattened, /503|500|status/i);
    assert.doesNotMatch(flattened, /secret-reset-token/);
    assert.doesNotMatch(flattened, /re_test_super_secret/);
    assert.doesNotMatch(flattened, /https:\/\/useatlascore\.com\/auth\/callback\?mode=reset/);
  } finally {
    ctx.restore();
  }
});

function sourceIncludesSendEmailDependency() {
  const source = readFileSync(sourcePath, 'utf8');
  return source.includes('/functions/v1/send-email') || source.includes('SEND_EMAIL_URL');
}

test('source no longer references the send-email edge function', () => {
  assert.equal(sourceIncludesSendEmailDependency(), false);
});
