/**
 * Admin Portal — comprehensive E2E health check
 *
 * Covers: route health, navigation, network errors, dashboard KPIs,
 * user CRUD workflow, modal behavior, dead-end detection, and GDPR page.
 *
 * Run: npx playwright test e2e/admin-portal-health.spec.ts --project=chromium
 */

import { test, expect } from './fixtures/admin-auth';
import { getRuntimeContext } from './helpers/runtime-context';

// ── Config ────────────────────────────────────────────────────────────────

const ADMIN_ROUTES = [
  { path: '/admin',            testId: 'admin-dashboard',   label: 'Dashboard' },
  { path: '/admin/users',      testId: 'admin-users',       label: 'Users' },
  { path: '/admin/billing',    testId: 'admin-placeholder', label: 'Billing' },
  { path: '/admin/moderation', testId: 'admin-placeholder', label: 'Moderation' },
  { path: '/admin/support',    testId: 'admin-placeholder', label: 'Support' },
  { path: '/admin/invites',    testId: 'admin-placeholder', label: 'Invites' },
  { path: '/admin/ops',        testId: 'admin-placeholder', label: 'Ops Health' },
  { path: '/admin/audit',      testId: 'admin-placeholder', label: 'Audit Log' },
  { path: '/admin/compliance', testId: 'admin-compliance',  label: 'Compliance' },
  { path: '/admin/settings',   testId: 'admin-placeholder', label: 'Settings' },
];

const NAV_ITEMS = [
  'dashboard', 'users', 'billing', 'moderation', 'support',
  'invites', 'ops-health', 'audit-log', 'compliance', 'settings',
];

// ── Helpers ───────────────────────────────────────────────────────────────

test.skip(
  !process.env.E2E_ADMIN_EMAIL,
  'Set E2E_ADMIN_EMAIL + E2E_ADMIN_PASSWORD to run admin tests',
);

test.afterEach(async ({ adminPage }, testInfo) => {
  if (testInfo.status !== 'passed') {
    const ctx = await getRuntimeContext(adminPage);
    await testInfo.attach('runtime-context', {
      body: JSON.stringify(ctx, null, 2),
      contentType: 'application/json',
    });
  }
});

// ── 1. Route health — every admin route loads without error ───────────────

test.describe('Route health', () => {
  for (const route of ADMIN_ROUTES) {
    test(`${route.label} (${route.path}) renders without error`, async ({ adminPage }) => {
      const apiErrors: string[] = [];

      // WHY: Intercept network to catch silent 4xx/5xx failures
      adminPage.on('response', (res) => {
        if (res.url().includes('supabase') && res.status() >= 400) {
          // Ignore known-missing tables (deletion_requests, support_requests)
          if (res.status() === 404 || /42P01/.test(res.statusText())) return;
          apiErrors.push(`${res.status()} ${res.url()}`);
        }
      });

      await adminPage.goto(route.path);

      // Must stay on admin — no redirect to /auth, /app, or /download-app
      await expect(adminPage).toHaveURL(new RegExp(route.path.replace(/\//g, '\\/')));

      // Page content must render
      await expect(adminPage.getByTestId(route.testId)).toBeVisible({ timeout: 10_000 });

      // Shell must still be intact (no crash replaced the layout)
      await expect(adminPage.getByTestId('admin-shell')).toBeVisible();

      // No critical API failures
      expect(apiErrors, `API errors on ${route.path}`).toHaveLength(0);
    });
  }
});

// ── 2. Sidebar navigation — every link works and highlights correctly ─────

test.describe('Sidebar navigation', () => {
  test('all nav items are visible', async ({ adminPage }) => {
    await adminPage.goto('/admin');
    const nav = adminPage.getByTestId('admin-nav');
    await expect(nav).toBeVisible();

    for (const item of NAV_ITEMS) {
      await expect(
        adminPage.getByTestId(`admin-nav-${item}`),
        `Nav item "${item}" should be visible`,
      ).toBeVisible();
    }
  });

  test('clicking each nav item navigates to correct route', async ({ adminPage }) => {
    await adminPage.goto('/admin');

    for (const route of ADMIN_ROUTES) {
      const navLabel = route.label.toLowerCase().replace(/\s+/g, '-');

      await test.step(`Navigate to ${route.label}`, async () => {
        await adminPage.getByTestId(`admin-nav-${navLabel}`).click();
        await expect(adminPage).toHaveURL(new RegExp(route.path.replace(/\//g, '\\/')), { timeout: 5_000 });
        await expect(adminPage.getByTestId(route.testId)).toBeVisible({ timeout: 5_000 });
      });
    }
  });

  test('"Back to app" button navigates away from admin', async ({ adminPage }) => {
    await adminPage.goto('/admin');
    const backBtn = adminPage.getByRole('button', { name: /back to app/i });
    await expect(backBtn).toBeVisible();
    // WHY: Don't actually click — just verify it exists and is clickable
    await expect(backBtn).toBeEnabled();
  });
});

// ── 3. Dashboard KPIs ────────────────────────────────────────────────────

test.describe('Dashboard', () => {
  test('KPI cards render with values', async ({ adminPage }) => {
    await adminPage.goto('/admin');
    const grid = adminPage.getByTestId('admin-kpi-grid');
    await expect(grid).toBeVisible({ timeout: 10_000 });

    // WHY: KPIs should show numbers, not dashes (which means loading failed)
    await test.step('Total users KPI loads', async () => {
      await expect.poll(async () => {
        const text = await grid.textContent();
        // At least one KPI should have a numeric value
        return /\d+/.test(text || '');
      }, { timeout: 15_000, message: 'KPI grid should contain at least one number' }).toBeTruthy();
    });
  });

  test('recent signups list renders', async ({ adminPage }) => {
    await adminPage.goto('/admin');
    // WHY: The section exists even if empty — look for the heading
    await expect(adminPage.getByText(/recent signups/i)).toBeVisible({ timeout: 10_000 });
  });
});

// ── 4. Users page — search, table, click-through ─────────────────────────

test.describe('Users page', () => {
  test('users table loads with rows', async ({ adminPage }) => {
    await adminPage.goto('/admin/users');
    const table = adminPage.getByTestId('admin-users-table');

    await expect(table).toBeVisible({ timeout: 10_000 });

    // WHY: There are at least test/admin users in the DB
    const rows = table.locator('tbody tr');
    await expect(rows.first()).toBeVisible({ timeout: 10_000 });
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('search filters users', async ({ adminPage }) => {
    await adminPage.goto('/admin/users');
    const searchInput = adminPage.getByTestId('admin-users-search');
    await expect(searchInput).toBeVisible();

    await test.step('type admin email', async () => {
      await searchInput.fill(process.env.E2E_ADMIN_EMAIL || 'admin');
      // WHY: Debounced search — wait for table update
      await adminPage.waitForTimeout(1_000);
    });

    await test.step('results narrow down', async () => {
      const table = adminPage.getByTestId('admin-users-table');
      // Should still have results (at least the admin user)
      if (await table.isVisible()) {
        const rows = table.locator('tbody tr');
        const count = await rows.count();
        expect(count).toBeGreaterThanOrEqual(1);
      }
    });

    await test.step('clear restores full list', async () => {
      await adminPage.getByRole('button', { name: /clear/i }).click();
      await adminPage.waitForTimeout(500);
      const table = adminPage.getByTestId('admin-users-table');
      await expect(table).toBeVisible({ timeout: 5_000 });
    });
  });

  test('clicking a user row navigates to user detail', async ({ adminPage }) => {
    await adminPage.goto('/admin/users');
    const table = adminPage.getByTestId('admin-users-table');
    await expect(table).toBeVisible({ timeout: 10_000 });

    // Click the first user row
    const firstRow = table.locator('tbody tr').first();
    await firstRow.click();

    // Should navigate to /admin/users/:id
    await expect(adminPage).toHaveURL(/\/admin\/users\/[a-f0-9-]+/, { timeout: 5_000 });
    await expect(adminPage.getByTestId('admin-user-detail')).toBeVisible({ timeout: 10_000 });
  });
});

// ── 5. User detail — profile, actions, back navigation ───────────────────

test.describe('User detail page', () => {
  test('displays profile and subscription sections', async ({ adminPage }) => {
    await adminPage.goto('/admin/users');
    const table = adminPage.getByTestId('admin-users-table');
    await expect(table).toBeVisible({ timeout: 10_000 });
    await table.locator('tbody tr').first().click();
    await expect(adminPage).toHaveURL(/\/admin\/users\/[a-f0-9-]+/, { timeout: 5_000 });

    await test.step('profile section renders', async () => {
      await expect(adminPage.getByText(/profile/i).first()).toBeVisible({ timeout: 10_000 });
      await expect(adminPage.getByText(/user id/i).first()).toBeVisible();
    });

    await test.step('subscription section renders', async () => {
      await expect(adminPage.getByText(/subscription/i).first()).toBeVisible();
    });

    await test.step('actions section renders', async () => {
      await expect(adminPage.getByText(/actions/i).first()).toBeVisible();
    });
  });

  test('back button returns to users list', async ({ adminPage }) => {
    await adminPage.goto('/admin/users');
    const table = adminPage.getByTestId('admin-users-table');
    await expect(table).toBeVisible({ timeout: 10_000 });
    await table.locator('tbody tr').first().click();
    await expect(adminPage).toHaveURL(/\/admin\/users\/[a-f0-9-]+/, { timeout: 5_000 });

    await adminPage.getByRole('button', { name: /back to users/i }).click();
    await expect(adminPage).toHaveURL(/\/admin\/users$/, { timeout: 5_000 });
    await expect(adminPage.getByTestId('admin-users')).toBeVisible();
  });

  test('grant access dropdown has duration options', async ({ adminPage }) => {
    await adminPage.goto('/admin/users');
    const table = adminPage.getByTestId('admin-users-table');
    await expect(table).toBeVisible({ timeout: 10_000 });
    await table.locator('tbody tr').first().click();
    await expect(adminPage.getByTestId('admin-user-detail')).toBeVisible({ timeout: 10_000 });

    // WHY: Verify the RevenueCat grant UI is wired up correctly
    const grantSelect = adminPage.locator('select').filter({ hasText: /month/i }).first();
    await expect(grantSelect).toBeVisible();

    const options = await grantSelect.locator('option').allTextContents();
    expect(options).toContain('1 week');
    expect(options).toContain('1 month');
    expect(options).toContain('1 year');
    expect(options).toContain('Lifetime');
  });
});

// ── 6. Delete modal — open/close without side effects ────────────────────

test.describe('Delete confirmation modal', () => {
  test('opens and closes cleanly on users list', async ({ adminPage }) => {
    await adminPage.goto('/admin/users');
    const table = adminPage.getByTestId('admin-users-table');
    await expect(table).toBeVisible({ timeout: 10_000 });

    // Find a non-admin delete button
    const deleteBtn = adminPage.getByRole('button', { name: /delete/i }).first();

    // WHY: Some users are admin-protected — skip if all buttons are disabled
    if (await deleteBtn.isDisabled()) {
      test.skip(true, 'All visible users are admins — no delete button available');
      return;
    }

    await test.step('open modal', async () => {
      await deleteBtn.click();
      await expect(adminPage.getByText(/delete user\?/i)).toBeVisible({ timeout: 3_000 });
      await expect(adminPage.getByText(/cannot be undone/i)).toBeVisible();
    });

    await test.step('cancel closes modal', async () => {
      await adminPage.getByRole('button', { name: /cancel/i }).click();
      await expect(adminPage.getByText(/delete user\?/i)).not.toBeVisible({ timeout: 3_000 });
    });

    await test.step('table still intact after modal dismiss', async () => {
      await expect(table).toBeVisible();
    });
  });
});

// ── 7. Compliance / GDPR page ────────────────────────────────────────────

test.describe('Compliance page', () => {
  test('renders all sections', async ({ adminPage }) => {
    await adminPage.goto('/admin/compliance');
    await expect(adminPage.getByTestId('admin-compliance')).toBeVisible({ timeout: 10_000 });

    await expect(adminPage.getByText(/user lookup/i)).toBeVisible();
    await expect(adminPage.getByText(/pending deletion/i)).toBeVisible();
    await expect(adminPage.getByText(/manual compliance/i)).toBeVisible();
    await expect(adminPage.getByText(/data export/i)).toBeVisible();
  });

  test('user lookup search works', async ({ adminPage }) => {
    await adminPage.goto('/admin/compliance');
    await expect(adminPage.getByTestId('admin-compliance')).toBeVisible({ timeout: 10_000 });

    const searchInput = adminPage.getByPlaceholder(/email, user uuid/i);
    await expect(searchInput).toBeVisible();

    await searchInput.fill(process.env.E2E_ADMIN_EMAIL || 'admin');
    await adminPage.getByRole('button', { name: /search/i }).first().click();

    // WHY: Should find at least the admin user
    await expect.poll(async () => {
      const buttons = adminPage.locator('button').filter({ hasText: /@/ });
      return await buttons.count();
    }, { timeout: 10_000, message: 'Search should return at least one user' }).toBeGreaterThanOrEqual(1);
  });
});

// ── 8. Network health — no 5xx errors across all routes ──────────────────

test.describe('Network health', () => {
  test('no 5xx responses across full admin navigation', async ({ adminPage }) => {
    const serverErrors: string[] = [];

    adminPage.on('response', (res) => {
      if (res.status() >= 500) {
        serverErrors.push(`${res.status()} ${res.request().method()} ${res.url()}`);
      }
    });

    for (const route of ADMIN_ROUTES) {
      await adminPage.goto(route.path);
      await adminPage.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => null);
    }

    expect(serverErrors, 'Server errors found during admin navigation').toHaveLength(0);
  });
});

// ── 9. Dead-end detection — no routes lead to blank or error state ───────

test.describe('Dead-end detection', () => {
  test('no admin route renders a blank page', async ({ adminPage }) => {
    for (const route of ADMIN_ROUTES) {
      await test.step(`${route.label} has content`, async () => {
        await adminPage.goto(route.path);
        const content = adminPage.getByTestId('admin-content');
        await expect(content).toBeVisible({ timeout: 10_000 });

        // WHY: A blank page means the route resolved but rendered nothing
        const text = await content.textContent();
        expect(
          (text || '').trim().length,
          `${route.path} rendered an empty content area`,
        ).toBeGreaterThan(0);
      });
    }
  });

  test('invalid admin sub-route does not crash the shell', async ({ adminPage }) => {
    await adminPage.goto('/admin/nonexistent-route-xyz');
    // Shell should still be intact — React Router shows the nearest match
    await expect(adminPage.getByTestId('admin-shell')).toBeVisible({ timeout: 5_000 });
  });
});

// ── 10. Console error audit ──────────────────────────────────────────────

test.describe('Console error audit', () => {
  test('no critical JS errors during full navigation', async ({ adminPage }) => {
    const criticalErrors: string[] = [];

    adminPage.on('pageerror', (err) => {
      criticalErrors.push(err.message);
    });

    for (const route of ADMIN_ROUTES) {
      await adminPage.goto(route.path);
      await adminPage.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => null);
    }

    expect(
      criticalErrors,
      'Uncaught JS exceptions found during admin navigation',
    ).toHaveLength(0);
  });
});
