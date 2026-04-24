function isTruthy(value) {
  return ['1', 'true', 'yes', 'on'].includes(String(value || '').trim().toLowerCase());
}

export function getStripeBillingConfig() {
  const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
  const testMode = isTruthy(import.meta.env.VITE_STRIPE_TEST_MODE) || publishableKey.startsWith('pk_test_');

  return {
    publishableKey,
    testMode,
  };
}
