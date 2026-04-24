import { test, expect, type Page } from '@playwright/test';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { loginAs } from './helpers/auth';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const email = process.env.E2E_USER_EMAIL;
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function createAdminClient() {
  return createClient(supabaseUrl!, serviceRoleKey!);
}

async function provisionRecoveryUser(password: string) {
  const recoveryEmail = `atlas-recovery-${Date.now()}@example.com`;
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email: recoveryEmail,
    password,
    email_confirm: true,
  });

  if (error || !data?.user?.id) {
    throw error || new Error('Recovery user was not created');
  }

  return {
    email: recoveryEmail,
    userId: data.user.id,
  };
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
  // Password reset now lands on either a completion state or Today if the session is already active.
  await Promise.race([
    page.waitForURL(/\/auth\/login|\/app\/today|\/onboarding/i, { timeout: 20_000 }),
    expect(page.getByText(/password updated/i)).toBeVisible({ timeout: 20_000 }),
  ]);

  if (/\/app\/today|\/onboarding/i.test(page.url())) {
    await page.goto('/auth/login?mode=password');
  }
}

test.describe('Auth recovery link gate', () => {
  const provisionedUserIds = new Set<string>();

  test.skip(!email, 'Set E2E_USER_EMAIL to run auth recovery-link gate');
  test.skip(!supabaseUrl || !serviceRoleKey, 'Set Supabase URL + service role to generate recovery links');

  test.afterEach(async () => {
    const admin = createAdminClient();
    for (const userId of provisionedUserIds) {
      await admin.auth.admin.deleteUser(userId);
      provisionedUserIds.delete(userId);
    }
  });

  test('recovery link opens reset screen and the new password can log in', async ({ page, baseURL }) => {
    const currentPassword = `AtlasAuth#${Date.now()}-start`;
    const recoveryUser = await provisionRecoveryUser(currentPassword);
    provisionedUserIds.add(recoveryUser.userId);
    const targetEmail = recoveryUser.email;
    const nextPassword = `AtlasAuth#${Date.now()}-next`;

    // Use a disposable account so this recovery flow cannot invalidate shared login credentials mid-suite.
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
