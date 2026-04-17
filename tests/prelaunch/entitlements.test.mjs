/**
 * Unit tests for src/lib/entitlements.js.
 *
 * Purpose: lock down the feature gating matrix before launch. These are the
 * rules that decide whether a user can access paid features — any regression
 * here is a direct revenue-impact bug.
 *
 * The file is plain ESM with no React imports, so it's safe to import from
 * a node --test runner.
 */

import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

// Import the module under test via an absolute file URL (workspace root).
const here = path.dirname(new URL(import.meta.url).pathname);
const entitlementsUrl = pathToFileURL(
  path.resolve(here, '../../src/lib/entitlements.js'),
).href;
const {
  hasFeatureAccess,
  canAccessFeature,
  PLAN_LEVELS,
  FEATURE_LOCKS,
} = await import(entitlementsUrl);

// Helpers
const sub = (tier, status = 'active') => ({ tier, status });
const user = (role = null) => (role ? { atlas_role: role } : {});

// ─── hasFeatureAccess: plan-based gating ───────────────────────────────────

test('free user cannot access Pro-only features', () => {
  assert.equal(hasFeatureAccess(user(), sub('free'), [], 'ai_food_photo'), false);
  assert.equal(hasFeatureAccess(user(), sub('free'), [], 'atlas_ai'), false);
  assert.equal(hasFeatureAccess(user(), sub('free'), [], 'lab_exams'), false);
  assert.equal(hasFeatureAccess(user(), sub('free'), [], 'standard_exports'), false);
});

test('free user CAN access free features', () => {
  assert.equal(hasFeatureAccess(user(), sub('free'), [], 'ai_food_text'), true);
  assert.equal(hasFeatureAccess(user(), sub('free'), [], 'social_cards'), true);
});

test('pro user can access all features (single-tier pricing)', () => {
  assert.equal(hasFeatureAccess(user(), sub('pro'), [], 'ai_food_photo'), true);
  assert.equal(hasFeatureAccess(user(), sub('pro'), [], 'atlas_ai'), true);
  assert.equal(hasFeatureAccess(user(), sub('pro'), [], 'premium_exports'), true);
  assert.equal(hasFeatureAccess(user(), sub('pro'), [], 'advanced_protocol_tracking'), true);
});

test('performance user gets both pro and performance features', () => {
  assert.equal(hasFeatureAccess(user(), sub('performance'), [], 'ai_food_photo'), true);
  assert.equal(hasFeatureAccess(user(), sub('performance'), [], 'premium_exports'), true);
  assert.equal(hasFeatureAccess(user(), sub('performance'), [], 'dose_timeline'), true);
});

test('no subscription defaults to free tier', () => {
  assert.equal(hasFeatureAccess(user(), null, [], 'ai_food_photo'), false);
  assert.equal(hasFeatureAccess(user(), null, [], 'ai_food_text'), true);
});

// ─── hasFeatureAccess: role-based gating ───────────────────────────────────

test('admin role bypasses all gates', () => {
  assert.equal(hasFeatureAccess(user('admin'), sub('free'), [], 'premium_exports'), true);
  assert.equal(hasFeatureAccess(user('admin'), null, [], 'admin_panel'), true);
  assert.equal(hasFeatureAccess(user('admin'), sub('free'), [], 'coach_dashboard'), true);
});

test('beta_tester gets everything except admin panel', () => {
  assert.equal(hasFeatureAccess(user('beta_tester'), sub('free'), [], 'atlas_ai'), true);
  assert.equal(hasFeatureAccess(user('beta_tester'), sub('free'), [], 'premium_exports'), true);
  assert.equal(hasFeatureAccess(user('beta_tester'), sub('free'), [], 'admin_panel'), false);
});

test('coach-only features require coach role even with correct plan', () => {
  // A performance-tier user without the coach role should NOT see coach dashboard.
  assert.equal(hasFeatureAccess(user(), sub('performance'), [], 'coach_dashboard'), false);
  // Coach role + coach plan → yes.
  assert.equal(hasFeatureAccess(user('coach'), sub('coach'), [], 'coach_dashboard'), true);
});

// ─── hasFeatureAccess: override-based gating ───────────────────────────────

test('explicit enabled override grants access regardless of plan', () => {
  const overrides = [{ feature_key: 'premium_exports', enabled: true }];
  assert.equal(hasFeatureAccess(user(), sub('free'), overrides, 'premium_exports'), true);
});

test('disabled override does not grant access', () => {
  const overrides = [{ feature_key: 'premium_exports', enabled: false }];
  // Free user with disabled override — no access.
  assert.equal(hasFeatureAccess(user(), sub('free'), overrides, 'premium_exports'), false);
  // Performance user with disabled override still gets plan-based access — the
  // disabled override only blocks the override path, not the plan path.
  assert.equal(hasFeatureAccess(user(), sub('performance'), overrides, 'premium_exports'), true);
});

// ─── hasFeatureAccess: edge cases ──────────────────────────────────────────

test('unknown feature key returns false (fail-closed)', () => {
  assert.equal(hasFeatureAccess(user(), sub('free'), [], 'feature_that_does_not_exist'), false);
});

test('subscription object may use plan_code instead of tier', () => {
  // Legacy rows from older migrations may have plan_code but no tier.
  assert.equal(hasFeatureAccess(user(), { plan_code: 'pro' }, [], 'ai_food_photo'), true);
  assert.equal(hasFeatureAccess(user(), { plan_code: 'free' }, [], 'ai_food_photo'), false);
});

test('custom tier maps to level 2 (full access, same as pro)', () => {
  assert.equal(PLAN_LEVELS.custom, 2);
  assert.equal(hasFeatureAccess(user(), sub('custom'), [], 'ai_food_photo'), true);
  assert.equal(hasFeatureAccess(user(), sub('custom'), [], 'premium_exports'), true);
});

// ─── canAccessFeature (legacy, plan-only signature) ────────────────────────

test('canAccessFeature admin role bypasses', () => {
  assert.equal(canAccessFeature('premium_exports', 'free', 'admin'), true);
});

test('canAccessFeature respects plan levels', () => {
  assert.equal(canAccessFeature('ai_food_photo', 'pro'), true);
  assert.equal(canAccessFeature('ai_food_photo', 'free'), false);
  assert.equal(canAccessFeature('premium_exports', 'performance'), true);
});

// ─── Sanity: every feature lock has a valid minPlan ────────────────────────

test('every FEATURE_LOCKS entry has a minPlan in PLAN_LEVELS', () => {
  for (const [feature, lock] of Object.entries(FEATURE_LOCKS)) {
    assert.ok(
      lock.minPlan in PLAN_LEVELS,
      `Feature "${feature}" has unknown minPlan "${lock.minPlan}" — add it to PLAN_LEVELS or fix the typo. This is exactly the kind of drift that causes paying users to lose access.`,
    );
  }
});
