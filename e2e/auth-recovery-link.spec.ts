import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { loginAs } from './helpers/auth';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const email = process.env.E2E_USER_EMAIL;
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

test.describe('Auth recovery link gate', () => {
  test.skip(!email, 'Set E2E_USER_EMAIL to run auth recovery-link gate');
  test.skip(!supabaseUrl || !serviceRoleKey, 'Set Supabase URL + service role to generate recovery links');

  test('recovery link opens reset screen and the new password can log in', async ({ page, baseURL }) => {
    const nextPassword = `AtlasAuth#${Date.now()}`;

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
