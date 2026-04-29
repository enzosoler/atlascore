import { supabase } from '@/lib/supabaseClient';

/**
 * Atlas Admin Service
 *
 * KEY ARCHITECTURE NOTES:
 *
 *   `profiles.id`           === auth.users.id  (same UUID)
 *   `profiles.email`        — synced from auth.users via trigger/webhook
 *   `subscriptions.user_id` === auth.users.id
 *
 * RLS policies use `public.is_admin()` (SECURITY DEFINER) to check admin
 * status without circular dependency. This allows admins to SELECT all
 * rows from profiles and subscriptions.
 *
 * The `email` column on profiles is populated by:
 *   1. The `handle_new_user()` trigger on auth.users INSERT
 *   2. The `sync_auth_email_to_profile()` trigger on auth.users UPDATE
 *   3. The canonical `auth-webhook` path plus a temporary compatibility shim
 *      for older `on-auth-user-created` deployments
 *   4. A one-time backfill in the migration SQL
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
 *
 * After running migration 20260325140000_fix_admin_rls_definitive.sql,
 * the RLS policies use `public.is_admin()` (SECURITY DEFINER) so admins
 * can see ALL profiles, not just their own.
 *
 * The `email` column is now on the profiles table, so no need for
 * service_role access to auth.users.
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

  if (profilesError) {
    console.error('[AdminService] fetchAllUsers profiles error:', profilesError);
    throw profilesError;
  }

  if (!profiles || profiles.length === 0) {
    return { users: [], total: count || 0, page, pageSize };
  }

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
 * Search users by partial match on ID, email, or name.
 * Email is now stored on the profiles table, so search works client-side.
 */
export async function searchUsers(query) {
  const q = query.trim().toLowerCase();
  if (!q) return fetchAllUsers(1, 50);

  // Fetch up to 500 profiles for client-side filtering
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) throw error;

  // Filter by partial ID, email, or display_name
  const filtered = (profiles || []).filter((p) => {
    const id = (p.id || '').toLowerCase();
    const email = (p.email || '').toLowerCase();
    const name = (p.full_name || p.display_name || '').toLowerCase();
    return id.includes(q) || email.includes(q) || name.includes(q);
  });

  // Fetch subscriptions for matched users
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

const VALID_ROLES = ['athlete', 'user', 'admin', 'coach', 'nutritionist', 'clinician', 'beta_tester'];

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
    .update({ role: newRole, atlas_role: newRole })
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

  const { data, error } = await supabase
    .from('profiles')
    .update({ is_suspended: true })
    .eq('id', userId)
    .select()
    .single();

  if (error && error.code === '42703') {
    throw new Error('Suspension requires the is_suspended column in profiles. Run migration 20260325140000.');
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
    throw new Error('Suspension requires the is_suspended column in profiles. Run migration 20260325140000.');
  }
  if (error) throw error;

  await logAdminAction('user.unsuspend', userId, {}, { is_suspended: true }, { is_suspended: false });
  return data;
}

// ─── ONBOARDING RESET ────────────────────────────────────────────────────────

export async function resetOnboarding(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ onboarding_completed: false })
    .eq('id', userId)
    .select()
    .single();

  if (error && error.code === '42703') {
    throw new Error('Reset onboarding requires onboarding_completed column in profiles. Run migration 20260325140000.');
  }
  if (error) throw error;

  await logAdminAction('user.reset_onboarding', userId);
  return data;
}

// ─── SUBSCRIPTION MANAGEMENT ────────────────────────────────────────────────

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

/**
 * Grant access via RevenueCat promotional entitlement.
 * RevenueCat becomes the single source of truth — its webhook syncs the
 * subscription row to our database automatically.
 *
 * @param {string} userId - Supabase user ID (= RevenueCat app_user_id)
 * @param {string} duration - RevenueCat duration: weekly, monthly, three_month, six_month, yearly, lifetime
 */
export async function grantAccess(userId, duration = 'monthly') {
  const { data, error } = await supabase.functions.invoke('admin-grant-entitlement', {
    body: { userId, action: 'grant', duration },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}

/**
 * Revoke promotional entitlement via RevenueCat.
 * Only revokes admin-granted promotional access — paid subscriptions
 * through App Store / Stripe are not affected.
 */
export async function revokeEntitlement(userId) {
  const { data, error } = await supabase.functions.invoke('admin-grant-entitlement', {
    body: { userId, action: 'revoke' },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}

export async function deleteUser(userId) {
  const { data, error } = await supabase.functions.invoke('admin-delete-user', {
    body: { userId },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}


// ─── BETA INVITES ─────────────────────────────────────────────────────────────

export async function fetchBetaInvites() {
  const { data, error } = await supabase
    .from('beta_invites')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    if (error.code === '42P01') return []; // table not migrated yet
    throw error;
  }
  return data || [];
}

export async function sendBetaInvite({ email, firstName = '', notes = '', locale = 'en' }) {
  const { data, error } = await supabase.functions.invoke('send-beta-invite', {
    body: { email, firstName, notes, locale },
  });

  if (error) throw error;
  if (data?.error) throw new Error(data.error);

  await logAdminAction('invite.send', null, { email, notes });
  return data;
}

export async function revokeBetaInvite(inviteId) {
  const { data, error } = await supabase
    .from('beta_invites')
    .update({ status: 'revoked' })
    .eq('id', inviteId)
    .eq('status', 'pending')
    .select()
    .single();

  if (error) throw error;
  await logAdminAction('invite.revoke', null, { inviteId });
  return data;
}

export async function resendBetaInvite(inviteId) {
  // Get the original invite
  const { data: invite, error: fetchError } = await supabase
    .from('beta_invites')
    .select('*')
    .eq('id', inviteId)
    .single();

  if (fetchError || !invite) throw new Error('Invite not found');

  // Extend expiry and re-send email via edge function
  const newExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  await supabase
    .from('beta_invites')
    .update({ expires_at: newExpiry, status: 'pending' })
    .eq('id', inviteId);

  const { data, error } = await supabase.functions.invoke('send-beta-invite', {
    body: { email: invite.email, notes: invite.notes || '' },
  });

  if (error) throw error;
  await logAdminAction('invite.resend', null, { inviteId, email: invite.email });
  return data;
}

// ─────────────────────────────────────────────────────────────
//  USER 360 — per-user data fetchers
// ─────────────────────────────────────────────────────────────

export async function fetchUserFull(userId) {
  const [profileRes, subRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('subscriptions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
  ]);
  if (profileRes.error) throw profileRes.error;
  return { profile: profileRes.data, subscription: subRes.data };
}

export async function fetchUserWorkouts(userId) {
  const { data, error } = await supabase
    .from('workouts')
    .select('id, name, completed_at, exercises_completed, duration_seconds, status')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchUserFoodLogs(userId) {
  const { data, error } = await supabase
    .from('food_logs')
    .select('id, date, meal_type, food_name, description, calories, protein, carbs, fat, created_at')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchUserCheckins(userId) {
  const { data, error } = await supabase
    .from('daily_checkins')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchUserMeasurements(userId) {
  const { data, error } = await supabase
    .from('measurements')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchUserPhotos(userId) {
  const { data, error } = await supabase
    .from('progress_photos')
    .select('id, photo_url, date, category, created_at, notes')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchUserAIData(userId) {
  const [messagesRes, memoryRes] = await Promise.all([
    supabase
      .from('coach_messages')
      .select('id, role, content, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('coach_memory')
      .select('id, summary, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);
  return {
    messages: messagesRes.data || [],
    memory: memoryRes.data || null,
  };
}

export async function fetchUserAuditLogs(userId, limit = 50) {
  const { data, error } = await supabase
    .from('admin_audit_logs')
    .select('*')
    .eq('target_user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function fetchUserErrors(userId, limit = 20) {
  const { data, error } = await supabase
    .from('error_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function addAdminNote(targetUserId, noteText) {
  return logAdminAction('admin.note', targetUserId, { text: noteText });
}

export async function fetchUserTimeline(userId) {
  const [workouts, foodLogs, measurements, photos, aiMessages, errors, subs, auditLogs] =
    await Promise.all([
      fetchUserWorkouts(userId),
      fetchUserFoodLogs(userId),
      fetchUserMeasurements(userId),
      fetchUserPhotos(userId),
      fetchUserAIData(userId).then((d) => d.messages),
      fetchUserErrors(userId, 50),
      supabase.from('subscriptions').select('*').eq('user_id', userId).then(({ data }) => data || []),
      fetchUserAuditLogs(userId, 100),
    ]);

  const events = [];

  workouts.forEach((w) => {
    if (w.completed_at) events.push({ type: 'workout', date: w.completed_at, label: w.name || 'Workout', detail: `${(w.exercises_completed || []).length} exercises`, raw: w });
  });

  // Group food logs by day
  const mealDays = {};
  foodLogs.forEach((m) => {
    const day = (m.date || '').split('T')[0];
    if (!mealDays[day]) mealDays[day] = { kcal: 0, count: 0, date: m.date || m.created_at };
    mealDays[day].kcal += Number(m.calories) || 0;
    mealDays[day].count += 1;
  });
  Object.entries(mealDays).forEach(([day, d]) => {
    events.push({ type: 'meal_day', date: d.date, label: `Nutrition logged — ${day}`, detail: `${d.count} items · ${Math.round(d.kcal)} kcal`, raw: d });
  });

  measurements.forEach((m) => {
    const dateStr = m.date || m.created_at;
    events.push({ type: 'measurement', date: dateStr, label: 'Measurement recorded', detail: m.weight ? `${m.weight} kg` : '', raw: m });
  });

  photos.forEach((p) => {
    events.push({ type: 'photo', date: p.created_at, label: 'Progress photo uploaded', detail: p.category || '', raw: p });
  });

  aiMessages.forEach((msg) => {
    if (msg.role === 'user') events.push({ type: 'ai_message', date: msg.created_at, label: 'Sent message to AI coach', detail: (msg.content || '').slice(0, 80), raw: msg });
  });

  errors.forEach((e) => {
    events.push({ type: 'error', date: e.created_at, label: e.message || 'App error', detail: e.component || e.route || '', raw: e });
  });

  subs.forEach((s) => {
    events.push({ type: 'subscription', date: s.created_at, label: `Subscription: ${s.status}`, detail: `${s.tier} plan`, raw: s });
  });

  auditLogs.forEach((a) => {
    events.push({ type: 'audit', date: a.created_at, label: a.action_type, detail: typeof a.action_detail === 'string' ? a.action_detail : JSON.stringify(a.action_detail || ''), raw: a });
  });

  events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return events;
}

// ─────────────────────────────────────────────────────────────
//  ENHANCED OVERVIEW METRICS
// ─────────────────────────────────────────────────────────────

export async function getEnhancedAdminMetrics() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayISO = todayStart.toISOString();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const results = await Promise.allSettled([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),                                                              // 0 total
    supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', todayISO),                                  // 1 signups today
    supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo),                              // 2 signups 7d
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('onboarding_completed', true),                             // 3 onboarded
    supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),                                  // 4 active subs
    supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'trialing'),                                // 5 trialing
    supabase.from('subscriptions').select('id', { count: 'exact', head: true }).in('status', ['trialing','active','granted','canceled','expired','past_due']), // 6 ever trialed
    supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'trialing').gte('trial_ends_at', todayISO).lte('trial_ends_at', sevenDaysFromNow), // 7 expiring 7d
    supabase.from('coach_messages').select('id', { count: 'exact', head: true }).gte('created_at', todayISO),                            // 8 AI msgs today
    supabase.from('error_logs').select('id', { count: 'exact', head: true }).gte('created_at', todayISO),                               // 9 errors today
    supabase.from('support_requests').select('id', { count: 'exact', head: true }),                                                      // 10 support
  ]);

  const get = (i) => results[i]?.status === 'fulfilled' ? (results[i].value?.count ?? 0) : 0;

  const totalUsers = get(0);
  const signupsToday = get(1);
  const signupsLast7Days = get(2);
  const onboardingCompleted = get(3);
  const activeSubscriptions = get(4);
  const trialingSubscriptions = get(5);
  const totalEverTrialed = get(6);
  const trialsExpiringIn7Days = get(7);
  const aiMessagesToday = get(8);
  const errorsToday = get(9);
  const pendingSupportRequests = get(10);

  const onboardingRate = totalUsers > 0 ? Math.round((onboardingCompleted / totalUsers) * 100) : 0;
  const trialToPaidRate = totalEverTrialed > 0 ? Math.round((activeSubscriptions / totalEverTrialed) * 100) : 0;

  return {
    totalUsers, signupsToday, signupsLast7Days,
    onboardingCompleted, onboardingRate,
    activeSubscriptions, trialingSubscriptions,
    totalEverTrialed, trialToPaidRate,
    trialsExpiringIn7Days,
    aiMessagesToday, errorsToday, pendingSupportRequests,
  };
}

export async function fetchRecentSignups(limit = 5) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, created_at, role')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function fetchRecentErrors(limit = 5) {
  const { data, error } = await supabase
    .from('error_logs')
    .select('id, message, component, route, user_id, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function fetchSignupSparkline(days = 7) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, created_at')
    .gte('created_at', since)
    .order('created_at', { ascending: true });
  if (error) throw error;
  const rows = data || [];

  // Build array of last `days` calendar days
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    result.push({ date: dateStr, count: 0 });
  }
  rows.forEach((r) => {
    const day = (r.created_at || '').split('T')[0];
    const bucket = result.find((b) => b.date === day);
    if (bucket) bucket.count += 1;
  });
  return result;
}

// ─────────────────────────────────────────────────────────────
//  ANALYTICS FUNNEL
// ─────────────────────────────────────────────────────────────

export async function fetchFunnelData(dateRangeStart) {
  const [profilesRes, onboardedRes, workoutsRes, grantedRes, trialsRes, paidRes] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', dateRangeStart),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('onboarding_completed', true).gte('created_at', dateRangeStart),
    supabase.from('workouts').select('user_id').eq('status', 'completed').gte('completed_at', dateRangeStart),
    supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'granted').gte('created_at', dateRangeStart),
    supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'trialing').gte('created_at', dateRangeStart),
    supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active').gte('created_at', dateRangeStart),
  ]);

  const registered = profilesRes.count ?? 0;
  const onboardingCompleted = onboardedRes.count ?? 0;
  const firstWorkout = new Set((workoutsRes.data || []).map((r) => r.user_id)).size;
  const granted = grantedRes.count ?? 0;
  const trial = trialsRes.count ?? 0;
  const paid = paidRes.count ?? 0;

  const steps = [
    { step: 1, label: 'Registered', count: registered },
    { step: 2, label: 'Onboarding Started', count: registered },
    { step: 3, label: 'Onboarding Completed', count: onboardingCompleted },
    { step: 4, label: 'First Workout', count: firstWorkout },
    { step: 5, label: 'Beta Access (Granted)', count: granted },
    { step: 6, label: 'Trial', count: trial },
    { step: 7, label: 'Paid', count: paid },
  ];

  return steps.map((s, i) => {
    const prev = i === 0 ? s.count : steps[i - 1].count;
    const conversionFromPrev = prev > 0 ? Math.round((s.count / prev) * 100) : 0;
    const dropoffPct = 100 - conversionFromPrev;
    return { ...s, conversionFromPrev, dropoffPct };
  });
}
