import { supabase } from '@/lib/supabaseClient';

/**
 * Admin Service — Manage users, roles, subscriptions, and trials
 * All operations are protected by RLS at the database level.
 */

// ─── USER MANAGEMENT ───────────────────────────────────────────────────────

export async function fetchAllUsers(page = 1, pageSize = 50, searchQuery = '') {
  try {
    let query = supabase
      .from('profiles')
      .select(`
        id,
        role,
        created_at,
        updated_at,
        subscriptions:subscriptions(
          id,
          tier,
          status,
          trial_starts_at,
          trial_ends_at,
          current_period_starts_at,
          current_period_ends_at,
          created_at
        )
      `, { count: 'exact' });

    if (searchQuery) {
      // Search by email in auth.users (requires a custom approach)
      // For now, we'll fetch all and filter client-side
      // In production, use a Postgres function or Edge Function
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) throw error;

    return {
      users: data || [],
      total: count || 0,
      page,
      pageSize,
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

export async function searchUsers(searchQuery) {
  try {
    // Fetch all users and filter by email (client-side)
    // In production, use an Edge Function to search auth.users
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        role,
        created_at,
        updated_at,
        subscriptions:subscriptions(
          id,
          tier,
          status,
          trial_starts_at,
          trial_ends_at,
          created_at
        )
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    // Note: Email search requires auth.users access via Edge Function
    // This is a placeholder for client-side filtering
    return data || [];
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
}

// ─── ROLE MANAGEMENT ──────────────────────────────────────────────────────

export async function updateUserRole(userId, newRole) {
  try {
    const validRoles = ['user', 'admin', 'coach', 'nutritionist', 'doctor'];
    if (!validRoles.includes(newRole)) {
      throw new Error(`Invalid role: ${newRole}`);
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
}

// ─── SUBSCRIPTION MANAGEMENT ──────────────────────────────────────────────

export async function updateSubscriptionTier(userId, newTier) {
  try {
    const validTiers = ['free', 'pro', 'premium', 'internal', 'custom'];
    if (!validTiers.includes(newTier)) {
      throw new Error(`Invalid tier: ${newTier}`);
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .update({ tier: newTier })
      .eq('user_id', userId)
      .in('status', ['active', 'trialing', 'granted'])
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error updating subscription tier:', error);
    throw error;
  }
}

export async function updateSubscriptionStatus(userId, newStatus) {
  try {
    const validStatuses = ['trialing', 'active', 'granted', 'past_due', 'canceled', 'expired', 'inactive'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status: ${newStatus}`);
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .update({ status: newStatus })
      .eq('user_id', userId)
      .in('status', ['active', 'trialing', 'granted', 'past_due', 'canceled', 'expired', 'inactive'])
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error updating subscription status:', error);
    throw error;
  }
}

// ─── TRIAL MANAGEMENT ─────────────────────────────────────────────────────

export async function extendTrial(userId, additionalDays = 7) {
  try {
    // Fetch current subscription
    const { data: subscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select('trial_ends_at, status')
      .eq('user_id', userId)
      .eq('status', 'trialing')
      .single();

    if (fetchError) throw fetchError;

    if (!subscription) {
      throw new Error('No active trial found for this user');
    }

    // Calculate new trial end date
    const currentEnd = new Date(subscription.trial_ends_at);
    const newEnd = new Date(currentEnd.getTime() + additionalDays * 24 * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from('subscriptions')
      .update({ trial_ends_at: newEnd.toISOString() })
      .eq('user_id', userId)
      .eq('status', 'trialing')
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error extending trial:', error);
    throw error;
  }
}

// ─── ACCESS MANAGEMENT ────────────────────────────────────────────────────

export async function grantAccess(userId, tier = 'pro', reason = '') {
  try {
    const adminId = (await supabase.auth.getUser()).data.user?.id;

    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        status: 'granted',
        tier,
        granted_by_admin: adminId,
        grant_reason: reason,
      })
      .eq('user_id', userId)
      .in('status', ['active', 'trialing', 'granted', 'inactive'])
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error granting access:', error);
    throw error;
  }
}

export async function revokeAccess(userId) {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .update({ status: 'inactive' })
      .eq('user_id', userId)
      .in('status', ['active', 'trialing', 'granted'])
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error revoking access:', error);
    throw error;
  }
}

// ─── METRICS ──────────────────────────────────────────────────────────────

export async function getAdminMetrics() {
  try {
    // Total users
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Active subscriptions
    const { count: activeSubscriptions } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Trialing subscriptions
    const { count: trialingSubscriptions } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'trialing');

    // Admins
    const { count: adminCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'admin');

    return {
      totalUsers: totalUsers || 0,
      activeSubscriptions: activeSubscriptions || 0,
      trialingSubscriptions: trialingSubscriptions || 0,
      adminCount: adminCount || 0,
    };
  } catch (error) {
    console.error('Error fetching admin metrics:', error);
    throw error;
  }
}
