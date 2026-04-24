export const CONTEXTUAL_PAYWALL_ROUTE = '/app/paywall';

export const PAYWALL_TRIGGER_LABELS = {
  coach_locked: 'Coach insight',
  labs_locked: 'Labs analysis',
  protocol_limit: 'Protocol limit',
  celebration: 'Milestone unlock',
};

export const ALLOWED_PAYWALL_TRIGGERS = new Set(Object.keys(PAYWALL_TRIGGER_LABELS));

const BLOCKED_PAYWALL_PREFIXES = [
  '/auth',
  '/onboarding',
  '/app/profile',
  '/app/settings',
  '/app/workouts/active',
  '/app/capture',
  '/app/nutrition/capture',
  '/app/nutrition/photo',
  '/app/nutrition/voice',
  '/app/offline',
  '/maintenance',
  '/force-update',
  '/404',
  '/500',
];

export function isPaywallGuardBlocked(pathname = '') {
  return BLOCKED_PAYWALL_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function isValidPaywallTrigger(trigger) {
  return typeof trigger === 'string' && ALLOWED_PAYWALL_TRIGGERS.has(trigger);
}

export function canOpenContextualPaywall({ trigger, from } = {}) {
  return isValidPaywallTrigger(trigger) && typeof from === 'string' && from.length > 0 && !isPaywallGuardBlocked(from);
}

export function createPaywallState(trigger, from, extra = {}) {
  return { trigger, from, ...extra };
}

export function getPaywallTriggerLabel(trigger) {
  return PAYWALL_TRIGGER_LABELS[trigger] || 'Premium feature';
}
