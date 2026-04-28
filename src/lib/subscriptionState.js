export function toDateOnly(value) {
  if (!value) return null;
  return String(value).split('T')[0];
}

export function normalizeSupabaseSubscription(row) {
  if (!row) return null;

  return {
    id: row.id,
    user_email: row.user_email || null,
    plan_code: row.tier || 'free',
    tier: row.tier || 'free',
    status: row.status || 'inactive',
    started_at: toDateOnly(row.started_at) || toDateOnly(row.trial_starts_at) || toDateOnly(row.created_at),
    trial_ends_at: toDateOnly(row.trial_ends_at),
    expires_at: toDateOnly(row.current_period_ends_at) || toDateOnly(row.trial_ends_at),
    stripe_subscription_id: row.stripe_subscription_id || null,
    granted_by_admin: row.granted_by_admin || null,
    grant_reason: row.grant_reason || null,
    created_at: row.created_at,
    source: 'supabase',
  };
}

export function mergeSubscriptionState({ isNative = false, rcSubscription = null, subscriptions = [] } = {}) {
  if (isNative && rcSubscription?.status !== 'inactive') return rcSubscription;

  const active = subscriptions.filter((subscription) =>
    ['active', 'trialing', 'granted'].includes(subscription.status)
  );
  if (active.length === 0) return subscriptions[0] || null;

  return active.sort(
    (a, b) => new Date(b.started_at || b.created_at || 0) - new Date(a.started_at || a.created_at || 0)
  )[0];
}
