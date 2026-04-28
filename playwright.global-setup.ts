import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, unlinkSync } from 'node:fs';
import { config as loadEnv } from 'dotenv';
import { chromium } from '@playwright/test';
import { E2E_AUTH_STORAGE_PATH, loginAs } from './e2e/helpers/auth';

export default async function globalSetup() {
  loadEnv({ path: '.env' });
  loadEnv({ path: '.env.local', override: true });

  process.env.E2E_USER_EMAIL ||= 'e2e-user@example.com';
  if (!process.env.E2E_USER_PASSWORD) {
    throw new Error('E2E_USER_PASSWORD env var is required. Set it in .env or your CI config.');
  }

  mkdirSync('e2e/.auth', { recursive: true });

  // Delete stale auth state (no real tokens), but keep valid state so parallel test
  // invocations can share a single authenticated session.
  if (existsSync(E2E_AUTH_STORAGE_PATH)) {
    try {
      const existing = JSON.parse(readFileSync(E2E_AUTH_STORAGE_PATH, 'utf8'));
      const hasTokens = existing.origins?.some((o: { localStorage?: Array<{ name: string }> }) =>
        o.localStorage?.some((e: { name: string }) => /sb-.*-auth-token/i.test(e.name)),
      );
      if (!hasTokens) {
        unlinkSync(E2E_AUTH_STORAGE_PATH);
      }
    } catch {
      unlinkSync(E2E_AUTH_STORAGE_PATH);
    }
  }

  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    execFileSync('node', ['scripts/demo/ensure-e2e-user.mjs'], {
      cwd: process.cwd(),
      env: process.env,
      stdio: 'pipe',
    });
  }

  const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';

  const browser = await chromium.launch();
  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();

  try {
    await loginAs(page, process.env.E2E_USER_EMAIL, process.env.E2E_USER_PASSWORD);
  } finally {
    await context.close();
    await browser.close();
  }

  // Hard validation: the saved state must contain real Supabase session tokens.
  if (!existsSync(E2E_AUTH_STORAGE_PATH)) {
    throw new Error('Global setup completed but no auth state file was created.');
  }

  const state = JSON.parse(readFileSync(E2E_AUTH_STORAGE_PATH, 'utf8'));
  const hasTokens = state.origins?.some((o: { localStorage?: Array<{ name: string }> }) =>
    o.localStorage?.some((e: { name: string }) => /sb-.*-auth-token/i.test(e.name)),
  );
  if (!hasTokens) {
    throw new Error(
      'Global setup auth state contains no Supabase session tokens. ' +
      'E2E user login failed. Check E2E_USER_EMAIL/PASSWORD and Supabase connectivity.',
    );
  }
}
