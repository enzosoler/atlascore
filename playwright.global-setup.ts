import { execFileSync } from 'node:child_process';
import { config as loadEnv } from 'dotenv';

export default async function globalSetup() {
  loadEnv({ path: '.env' });
  loadEnv({ path: '.env.local', override: true });

  process.env.E2E_USER_EMAIL ||= 'e2e-user@example.com';
  process.env.E2E_USER_PASSWORD ||= 'AtlasAuth#2026';

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return;
  }

  execFileSync('node', ['scripts/demo/ensure-e2e-user.mjs'], {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'pipe',
  });
}
