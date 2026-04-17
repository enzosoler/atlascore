export function getAccountDisplayName(user) {
  if (!user) return 'Athlete';
  return user.full_name || user.name || user.email?.split('@')[0] || 'Athlete';
}

export function getAccountInitials(user) {
  const displayName = getAccountDisplayName(user);
  return (
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((chunk) => chunk[0]?.toUpperCase())
      .join('') || 'AT'
  );
}

export function formatSubscriptionPlanLabel(subscription) {
  if (!subscription?.status || !['active', 'trialing', 'granted', 'past_due'].includes(subscription.status)) {
    return 'Free';
  }
  const planValue = subscription?.tier || subscription?.plan_code || 'paid';
  return String(planValue)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatBillingOwner(subscription, isNative = false) {
  if (isNative || subscription?.source === 'revenuecat') return 'Apple / RevenueCat';
  if (subscription?.stripe_subscription_id) return 'Stripe';
  return 'Atlas';
}

export function formatRenewalLabel(subscription) {
  const value = subscription?.trial_ends_at || subscription?.expires_at;
  if (!value) return 'No renewal date on file';

  const formatted = new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  if (subscription?.status === 'trialing') return `Trial ends ${formatted}`;
  return `Renews on ${formatted}`;
}
