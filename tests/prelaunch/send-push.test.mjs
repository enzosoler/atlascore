import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import ts from 'typescript';

const here = path.dirname(new URL(import.meta.url).pathname);
const sourcePath = path.resolve(here, '../../supabase/functions/send-push/index.ts');

async function loadHandler({
  env = {},
  tokenRows = [],
  dbError = null,
} = {}) {
  const source = readFileSync(sourcePath, 'utf8')
    .replace(
      "import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';",
      'const { serve } = globalThis.__sendPushTestMocks;',
    )
    .replace(
      "import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';",
      'const { createClient } = globalThis.__sendPushTestMocks;',
    )
    .replace(
      "import { SignJWT, importPKCS8 } from 'https://deno.land/x/jose@v5.2.0/index.ts';",
      'const { SignJWT, importPKCS8 } = globalThis.__sendPushTestMocks;',
    )
    .replace(
      "import { buildPreflightResponse, getCorsHeaders } from '../_shared/cors.ts';",
      'const { buildPreflightResponse, getCorsHeaders } = globalThis.__sendPushTestMocks;',
    );

  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;

  const originalDeno = globalThis.Deno;
  const originalMocks = globalThis.__sendPushTestMocks;

  let handler = null;

  globalThis.__sendPushTestMocks = {
    serve(fn) {
      handler = fn;
    },
    createClient() {
      return {
        from() {
          return {
            select() {
              return this;
            },
            in() {
              return this;
            },
            eq: async () => ({ data: tokenRows, error: dbError }),
          };
        },
      };
    },
    SignJWT: class {
      setProtectedHeader() { return this; }
      setIssuer() { return this; }
      setIssuedAt() { return this; }
      async sign() { return 'jwt'; }
    },
    importPKCS8: async () => 'key',
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
    env: { get: (key) => env[key] ?? '' },
  };

  const moduleUrl = `data:text/javascript;base64,${Buffer.from(transpiled).toString('base64')}#${Date.now()}${Math.random()}`;
  await import(moduleUrl);
  assert.equal(typeof handler, 'function');

  return {
    handler,
    restore() {
      globalThis.Deno = originalDeno;
      globalThis.__sendPushTestMocks = originalMocks;
    },
  };
}

async function json(response) {
  return JSON.parse(await response.text());
}

test('send-push returns explicit safe fallback when no device tokens exist', async () => {
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
      body: JSON.stringify({
        user_id: 'user-1',
        title: 'atlas.core audit',
        body: 'push boundary check',
      }),
    }));

    const payload = await json(response);
    assert.equal(response.status, 200);
    assert.equal(payload.code, 'NO_TOKENS');
    assert.equal(payload.safeFallback, true);
    assert.equal(payload.sent, 0);
  } finally {
    ctx.restore();
  }
});
