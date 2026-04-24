import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import ts from 'typescript';

const here = path.dirname(new URL(import.meta.url).pathname);
const sourcePath = path.resolve(here, '../../supabase/functions/send-email/index.ts');

async function loadHandler({
  env = {},
  user = null,
  authError = null,
  profile = { role: 'admin' },
  fetchImpl = async () => ({ ok: true, json: async () => ({ id: 're_123' }) }),
} = {}) {
  const source = readFileSync(sourcePath, 'utf8')
    .replace(
      "import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';",
      'const { serve } = globalThis.__sendEmailTestMocks;',
    )
    .replace(
      "import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';",
      'const { createClient } = globalThis.__sendEmailTestMocks;',
    )
    .replace(
      "import { renderBrandedEmail, renderEmail } from '../_shared/templates.ts';",
      'const { renderBrandedEmail, renderEmail } = globalThis.__sendEmailTestMocks;',
    );

  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;

  const originalDeno = globalThis.Deno;
  const originalFetch = globalThis.fetch;
  const originalMocks = globalThis.__sendEmailTestMocks;

  let handler = null;

  globalThis.__sendEmailTestMocks = {
    serve(fn) {
      handler = fn;
    },
    createClient(url, key) {
      return {
        auth: {
          async getUser() {
            return { data: { user }, error: authError };
          },
        },
        from() {
          return {
            select() {
              return this;
            },
            eq() {
              return this;
            },
            maybeSingle: async () => ({ data: profile, error: null }),
            insert: async () => ({ data: null, error: null }),
          };
        },
      };
    },
    renderEmail(type, lang) {
      return { subject: `${type}:${lang}`, html: '<p>email</p>', text: 'email' };
    },
    renderBrandedEmail({ subject }) {
      return { subject, html: '<p>email</p>', text: 'email' };
    },
  };

  globalThis.Deno = {
    env: { get: (key) => env[key] ?? '' },
  };
  globalThis.fetch = fetchImpl;

  const moduleUrl = `data:text/javascript;base64,${Buffer.from(transpiled).toString('base64')}#${Date.now()}${Math.random()}`;
  await import(moduleUrl);
  assert.equal(typeof handler, 'function');

  return {
    handler,
    restore() {
      globalThis.Deno = originalDeno;
      globalThis.fetch = originalFetch;
      globalThis.__sendEmailTestMocks = originalMocks;
    },
  };
}

async function json(response) {
  return JSON.parse(await response.text());
}

test('send-email accepts service-role apikey auth without Authorization bearer', async () => {
  const ctx = await loadHandler({
    env: {
      SUPABASE_URL: 'https://project.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role',
      RESEND_API_KEY: 're_test',
    },
  });

  try {
    const response = await ctx.handler(new Request('https://example.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: 'service-role',
      },
      body: JSON.stringify({
        type: 'welcome',
        to: 'athlete@example.com',
        language: 'en',
        payload: { firstName: 'Alex' },
      }),
    }));

    assert.equal(response.status, 200);
    assert.equal((await json(response)).success, true);
  } finally {
    ctx.restore();
  }
});

test('send-email rejects when no accepted auth secret is present', async () => {
  const ctx = await loadHandler({
    env: {
      SUPABASE_URL: 'https://project.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role',
    },
  });

  try {
    const response = await ctx.handler(new Request('https://example.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'welcome', to: 'athlete@example.com' }),
    }));

    assert.equal(response.status, 401);
    assert.deepEqual(await json(response), { error: 'Unauthorized' });
  } finally {
    ctx.restore();
  }
});
