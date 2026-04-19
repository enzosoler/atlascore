/**
 * Route config — binds canonical screens to React Router paths + guards.
 * Consumed by the redesign router; doesn't affect the legacy app until
 * you mount <RedesignRouter /> behind a feature flag.
 */
import { SCREENS, OVERLAYS } from './screen-registry';

/** Guard matrix — purely declarative. Actual enforcement lives in guards/ */
export const GUARDS = {
  public: [],
  auth: ['requireAuth'],
  onboarding: ['requireAuth', 'requireOnboardingIncomplete'],
  app: ['requireAuth', 'requireOnboardingComplete'],
  premium: ['requireAuth', 'requireEntitlement:pro'],
  role: ['requireAuth', 'requireRole'],
};

export const routes = SCREENS.map((s) => ({
  path: s.route,
  name: s.name,
  layout: s.layout,
  guards: s.access === 'role'
    ? [...GUARDS.role.slice(0, -1), `requireRole:${s.role}`]
    : GUARDS[s.access] ?? [],
  platform: s.platform,
  gating: s.gating ?? null,
  lazyImport: `../screens/${s.domain}/${s.name}.jsx`,
}));

export const overlays = OVERLAYS.map((o) => ({
  ...o,
  lazyImport: `../overlays/${o.name}.jsx`,
}));

export const platformFilter = (platform /* 'web' | 'native' */) =>
  routes.filter((r) => r.platform === 'both' || r.platform === `${platform}-only`);
