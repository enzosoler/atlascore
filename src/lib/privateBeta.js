/**
 * Private Beta / Internal Gating
 *
 * Professional domains (coach, nutritionist, clinician, admin) are NOT part
 * of the public MVP launch. They remain in the codebase for future activation.
 *
 * This module centralizes the gating logic so that:
 *   1. Professional routes are excluded from the public router
 *   2. Professional nav items are excluded from the public surface
 *   3. The gate can be lifted per-role when ready
 *
 * To enable a professional domain for public launch, move its key from
 * PRIVATE_BETA_ROLES to a separate LAUNCHED_ROLES set (or remove the gate).
 */

/**
 * Roles that are gated behind private beta and NOT publicly accessible.
 * Users with these roles can still log in and see their dashboards —
 * the gate only prevents public routing/nav from exposing these areas.
 */
export const PRIVATE_BETA_ROLES = new Set([
  'coach',
  'nutritionist',
  'clinician',
  'admin',
  'beta_tester',
]);

/**
 * Returns true if the given role is gated behind private beta.
 */
export function isPrivateBetaRole(role) {
  return PRIVATE_BETA_ROLES.has(role);
}

/**
 * Returns true if professional routes should be mounted.
 * In the public MVP, this returns false — professional routes are not mounted.
 * Internal/beta users with these roles still get redirected to /Today.
 *
 * Set VITE_ENABLE_PRO_ROUTES=true in .env to mount professional routes
 * (for internal testing or staged rollout).
 */
export function shouldMountProRoutes() {
  return import.meta.env.VITE_ENABLE_PRO_ROUTES === 'true';
}
