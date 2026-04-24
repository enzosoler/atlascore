import { test, expect, type Page } from '@playwright/test';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { loginAs } from './helpers/auth';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const email = process.env.E2E_USER_EMAIL;
const currentPassword = process.env.E2E_USER_PASSWORD;
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function createAdminClient() {
  return createClient(supabaseUrl!, serviceRoleKey!);
}

async function provisionResetUser(password: string) {
  const email = `atlas-reset-${Date.now()}@example.com`;
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error || !data?.user?.id) {
    throw error || new Error('Reset user was not created');
  }

  return email;
}

async function generateRecoveryLink(baseURL: string, targetEmail: string) {
  const admin = createAdminClient();
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

async function waitForResetCompletion(page: Page) {
  // The reset screen now shows a completion state before the delayed redirect lands.
  await Promise.race([
    page.waitForURL(/\/auth\/login/i, { timeout: 20_000 }),
    expect(page.getByText(/password updated/i)).toBeVisible({ timeout: 20_000 }),
  ]);

  if (!/\/auth\/login/i.test(page.url())) {
    await page.goto('/auth/login?mode=password');
  }
}

test.describe('Auth reset gate', () => {
  test.skip(!currentPassword, 'Set E2E_USER_PASSWORD to run auth reset gate');
  test.skip(!supabaseUrl || !serviceRoleKey, 'Set Supabase URL + service role to generate recovery links');

  test('forgot password -> reset -> login', async ({ page, baseURL }) => {
    const targetEmail = await provisionResetUser(currentPassword!);
    const nextPassword = `AtlasAuth#${Date.now()}`;

    await page.goto('/auth/forgot');
    await page.getByPlaceholder(/you@email\.com/i).fill(targetEmail);
    await page.getByRole('button', { name: /send reset link/i }).click();
    await expect(page.getByRole('button', { name: /back to sign in/i })).toBeVisible({ timeout: 15_000 });

    const recoveryLink = await generateRecoveryLink(baseURL!, targetEmail);
    await page.goto(recoveryLink);
    await expect(page).toHaveURL(/\/auth\/reset/i, { timeout: 20_000 });

    const passwordInputs = page.locator('input[type="password"]');
    await expect(passwordInputs).toHaveCount(2);
    await passwordInputs.first().fill(nextPassword);
    await passwordInputs.nth(1).fill(nextPassword);
    await page.getByRole('button', { name: /update password/i }).click();
    await waitForResetCompletion(page);

    await loginAs(page, targetEmail, nextPassword);
    await expect(page).toHaveURL(/\/app\/today|\/onboarding/i, { timeout: 15_000 });
  });
});
