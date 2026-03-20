import { supabase } from '@/lib/supabaseClient';

/**
 * Atlas Admin Service
 *
 * KEY ARCHITECTURE NOTE:
 *   `profiles.id`        === auth.users.id  (same UUID)
 *   `subscriptions.user_id` === auth.users.id
 *
 * PostgREST can only auto-join tables that share an explicit FK in the schema
 * cache.  `subscriptions.user_id` references `auth.users.id`, NOT `profiles.id`,
 * so the nested-join syntax `subscriptions:subscriptions(...)` on profiles will
 * always throw "Could not find a relationship between 'profiles' and
 * 'subscriptions' in the schema cache".
 *
 * FIX: Use two separate queries and merge client-side on the shared user UUID.
 */

// ─── HELPERS ────────────────────────────────────────────────────────────────

async function getCurrentAdminId() {
  const { data } = await supabase.auth.getUser();
  return data?.user?.id || null;
}

// ─── AUDIT LOGGING ──────────────────────────────────────────────────────────

export async function logAdminAction(actionType, targetUserId, detail = {}, oldValue = null, newValue = null) {
  try {
    const actorId = await getCurrentAdminId();
    if (!actorId) return;

    await supabase.from('admin_audit_logs').insert({
      actor_id: actorId,
      target_user_id: targetUserId || null,
      action_type: actionType,
      action_detail: detail,
      old_value: oldValue,
      new_value: newValue,
    });
  } catch (error) {
    // Audit log failures must never break the primary action
    console.warn('[AdminAudit] Failed to write audit log:', error.message);
  }
}

export async function fetchAuditLogs(limit = 100) {
  const { data, error } = await supabase
    .from('admin_audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    // Table may not exist yet — return empty gracefully
    if (error.code === '42P01') return [];
    throw error;
  }
  return data || [];
}

// ─── USERS ──────────────────────────────────────────────────────────────────

/**
 * Fetch all users with their subscriptions merged.
 * Uses TWO separate queries to avoid the missing-FK join error.
 */
export async function fetchAllUsers(page = 1, pageSize = 50) {
  // 1. Fetch profiles (paginated)
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data: profiles, error: profilesError, count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (profilesError) throw profilesError;
  if (!profiles || profiles.length === 0) return { users: [], total: count || 0, page, pageSize };

  // 2. Fetch subscriptions for those specific user IDs
  const ids = profiles.map((p) => p.id);
  const { data: subscriptions, error: subsError } = await supabase
    .from('subscriptions')
    .select('*')
    .in('user_id', ids)
    .order('created_at', { ascending: false });

  if (subsError) {
    console.warn('[AdminService] Could not load subscriptions:', subsError.message);
  }

  // 3. Merge: group subscriptions by user_id, attach to each profile
  const subsByUser = {};
  for (const sub of subscriptions || []) {
    if (!subsByUser[sub.user_id]) subsByUser[sub.user_id] = [];
    subsByUser[sub.user_id].push(sub);
  }

  const users = profiles.map((p) => ({
    ...p,
    subscriptions: subsByUser[p.id] || [],
  }));

  return { users, total: count || 0, page, pageSize };
}

/**
 * Search users by partial ID match (email search requires Edge Function / service key).
 * For now we search locally within the last 500 profiles.
 */
export async function searchUsers(query) {
  const q = query.trim().toLowerCase();
  if (!q) return fetchAllUsers(1, 50);

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) throw error;

  // Filter by partial ID or display_name / email if those columns exist
  const filtered = (profiles || []).filter((p) => {
    const id = (p.id || '').toLowerCase();
    const email = (p.email || '').toLowerCase();
    const name = (p.full_name || p.display_name || '').toLowerCase();
    return id.includes(q) || email.includes(q) || name.includes(q);
  });

  const ids = filtered.map((p) => p.id);
  let subscriptions = [];
  if (ids.length > 0) {
    const { data: subs } = await supabase
      .from('subscriptions')
      .select('*')
      .in('user_id', ids);
    subscriptions = subs || [];
  }

  const subsByUser = {};
  for (const sub of subscriptions) {
    if (!subsByUser[sub.user_id]) subsByUser[sub.user_id] = [];
    subsByUser[sub.user_id].push(sub);
  }

  return {
    users: filtered.map((p) => ({ ...p, subscriptions: subsByUser[p.id] || [] })),
    total: filtered.length,
    page: 1,
    pageSize: filtered.length,
  };
}

// ─── METRICS ────────────────────────────────────────────────────────────────

export async function getAdminMetrics() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: totalUsers },
    { count: activeSubscriptions },
    { count: trialingSubscriptions },
    { count: adminCount },
    { count: newUsersLast7Days },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'trialing'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'admin'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo),
  ]);

  return {
    totalUsers: totalUsers || 0,
    activeSubscriptions: activeSubscriptions || 0,
    trialingSubscriptions: trialingSubscriptions || 0,
    adminCount: adminCount || 0,
    newUsersLast7Days: newUsersLast7Days || 0,
  };
}

// ─── ROLE MANAGEMENT ────────────────────────────────────────────────────────

const VALID_ROLES = ['athlete', 'user', 'admin', 'coach', 'nutritionist', 'clinician'];

export async function updateUserRole(userId, newRole) {
  if (!VALID_ROLES.includes(newRole)) throw new Error(`Invalid role: ${newRole}`);

  // Fetch current role for audit log
  const { data: before } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  const { data, error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;

  await logAdminAction('role.update', userId, { newRole }, { role: before?.role }, { role: newRole });
  return data;
}

// ─── SUSPENSION ──────────────────────────────────────────────────────────────

export async function suspendUser(userId) {
  const { data: before } = await supabase
    .from('profiles')
    .select('role, is_suspended')
    .eq('id', userId)
    .maybeSingle();

  // Try is_suspended column first; fall back to setting role = 'suspended'
  const { data, error } = await supabase
    .from('profiles')
    .update({ is_suspended: true })
    .eq('id', userId)
    .select()
    .single();

  if (error && error.code === '42703') {
    // Column doesn't exist — surface clear message
    throw new Error('Suspension requires the is_suspended column in profiles. See SQL migration file.');
  }
  if (error) throw error;

  await logAdminAction('user.suspend', userId, {}, { is_suspended: false }, { is_suspended: true });
  return data;
}

export async function unsuspendUser(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ is_suspended: false })
    .eq('id', userId)
    .select()
    .single();

  if (error && error.code === '42703') {
    throw new Error('Suspension requires the is_suspended column in profiles. See SQL migration file.');
  }
  if (error) throw error;

  await logAdminAction('user.unsuspend', userId, {}, { is_suspended: true }, { is_suspended: false });
  return data;
}

// ─── ONBOARDING RESET ────────────────────────────────────────────────────────

export async function resetOnboarding(userId) {
  // Update user_metadata in auth.users is only possible with service role.
  // From the client we can only update the profiles row.
  // If there's an onboarding_completed column on profiles, update it.
  const { data, error } = await supabase
    .from('profiles')
    .update({ onboarding_completed: false })
    .eq('id', userId)
    .select()
    .single();

  if (error && error.code === '42703') {
    throw new Error('Reset onboarding requires onboarding_completed column in profiles. See SQL migration file.');
  }
  if (error) throw error;

  await logAdminAction('user.reset_onboarding', userId);
  return data;
}

// ─── SUBSCRIPTION MANAGEMENT ────────────────────────────────────────────────

const VALID_TIERS   = ['free', 'pro', 'premium', 'internal', 'custom'];
const VALID_STATUSES = ['trialing', 'active', 'granted', 'past_due', 'canceled', 'expired', 'inactive'];

export async function fetchAllSubscriptions(page = 1, pageSize = 50) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { subscriptions: data || [], total: count || 0, page, pageSize };
}

export async function updateSubscriptionTier(userId, newTier) {
  if (!VALID_TIERS.includes(newTier)) throw new Error(`Invalid tier: ${newTier}`);

  const { data: before } = await supabase
    .from('subscriptions')
    .select('tier, status')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data, error } = await supabase
    .from('subscriptions')
    .update({ tier: newTier })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;

  await logAdminAction('subscription.tier.update', userId, { newTier }, { tier: before?.tier }, { tier: newTier });
  return data;
}

export async function updateSubscriptionStatus(userId, newStatus) {
  if (!VALID_STATUSES.includes(newStatus)) throw new Error(`Invalid status: ${newStatus}`);

  const { data: before } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data, error } = await supabase
    .from('subscriptions')
    .update({ status: newStatus })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;

  await logAdminAction('subscription.status.update', userId, { newStatus }, { status: before?.status }, { status: newStatus });
  return data;
}

export async function extendTrial(userId, additionalDays = 7) {
  const { data: subscription, error: fetchError } = await supabase
    .from('subscriptions')
    .select('trial_ends_at, status')
    .eq('user_id', userId)
    .eq('status', 'trialing')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (fetchError) throw fetchError;
  if (!subscription) throw new Error('No active trial found for this user.');

  const currentEnd = new Date(subscription.trial_ends_at || Date.now());
  const newEnd = new Date(currentEnd.getTime() + additionalDays * 24 * 60 * 60 * 1000);

  const { data, error } = await supabase
    .from('subscriptions')
    .update({ trial_ends_at: newEnd.toISOString() })
    .eq('user_id', userId)
    .eq('status', 'trialing')
    .select()
    .single();

  if (error) throw error;

  await logAdminAction('subscription.trial.extend', userId, { additionalDays }, { trial_ends_at: subscription.trial_ends_at }, { trial_ends_at: newEnd.toISOString() });
  return data;
}

export async function grantAccess(userId, tier = 'pro', reason = '') {
  const actorId = await getCurrentAdminId();

  // Upsert: update existing subscription or create one if absent
  const { data: existing } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  let data, error;

  if (existing?.id) {
    ({ data, error } = await supabase
      .from('subscriptions')
      .update({ status: 'granted', tier, granted_by_admin: actorId, grant_reason: reason })
      .eq('id', existing.id)
      .select()
      .single());
  } else {
    ({ data, error } = await supabase
      .from('subscriptions')
      .insert({ user_id: userId, status: 'granted', tier, granted_by_admin: actorId, grant_reason: reason })
      .select()
      .single());
  }

  if (error) throw error;

  await logAdminAction('subscription.grant', userId, { tier, reason });
  return data;
}

export async function revokeAccess(userId) {
  const { data, error } = await supabase
    .from('subscriptions')
    .update({ status: 'inactive' })
    .eq('user_id', userId)
    .in('status', ['active', 'trialing', 'granted'])
    .select()
    .single();

  if (error) throw error;

  await logAdminAction('subscription.revoke', userId);
  return data;
}

export async function resyncBillingStatus(userId) {
  // Client-side cannot call Stripe directly — this is a placeholder that marks
  // the subscription for resync and would normally trigger an Edge Function.
  await logAdminAction('subscription.resync_requested', userId, { note: 'Manual resync requested from admin console' });
  // In production: call a Supabase Edge Function here
  throw new Error('Billing resync requires a Supabase Edge Function. This action has been logged.');
}
