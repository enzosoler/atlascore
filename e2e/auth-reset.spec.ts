import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { loginAs } from './helpers/auth';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const email = process.env.E2E_USER_EMAIL;
const currentPassword = process.env.E2E_USER_PASSWORD;
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function generateRecoveryLink(baseURL: string, targetEmail: string) {
  const admin = createClient(supabaseUrl!, serviceRoleKey!);
  const { data, error } = await admin.auth.admin.generateLink({
    type: 'recovery',
    email: targetEmail,
    options: {
      redirectTo: `${baseURL}/auth/callback?mode=reset`,
    },
  });

  if (error || !data?.properties?.action_link) {
    throw error || new Error('Recovery link was not generated');
  }

  return data.properties.action_link;
}

test.describe('Auth reset gate', () => {
  test.skip(!email || !currentPassword, 'Set E2E_USER_EMAIL + E2E_USER_PASSWORD to run auth reset gate');
  test.skip(!supabaseUrl || !serviceRoleKey, 'Set Supabase URL + service role to generate recovery links');

  test('forgot password -> reset -> login', async ({ page, baseURL }) => {
    const nextPassword = `AtlasAuth#${Date.now()}`;

    await page.goto('/auth/forgot');
    await page.getByPlaceholder(/you@email\.com/i).fill(email!);
    await page.getByRole('button', { name: /send reset link/i }).click();
    await expect(page.getByRole('button', { name: /back to sign in/i })).toBeVisible({ timeout: 15_000 });

    const recoveryLink = await generateRecoveryLink(baseURL!, email!);
    await page.goto(recoveryLink);
    await expect(page).toHaveURL(/\/auth\/reset/i, { timeout: 20_000 });

    const passwordInputs = page.locator('input[type="password"]');
    await expect(passwordInputs).toHaveCount(2);
    await passwordInputs.first().fill(nextPassword);
    await passwordInputs.nth(1).fill(nextPassword);
    await page.getByRole('button', { name: /update password/i }).click();
    await expect(page).toHaveURL(/\/auth\/login/i, { timeout: 20_000 });

    await loginAs(page, email!, nextPassword);
    await expect(page).toHaveURL(/\/app\/today|\/onboarding/i, { timeout: 15_000 });
  });
});
