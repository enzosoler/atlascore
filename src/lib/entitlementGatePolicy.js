export function resolveEntitlementGateState({
  isLoadingAuth = false,
  isEntitlementLoading = false,
  user = null,
  hasActivePro = false,
  isNative = false,
} = {}) {
  if (isLoadingAuth || isEntitlementLoading) {
    return { type: 'loading' };
  }

  if (!user?.onboarding_completed) {
    return { type: 'redirect', to: '/onboarding' };
  }

  if (hasActivePro) {
    return { type: 'allow' };
  }

  return { type: 'redirect', to: isNative ? '/app/paywall' : '/pricing' };
}
