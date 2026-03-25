import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

/**
 * Hook to fetch and manage user role and subscription data.
 * Integrates with the new profiles and subscriptions tables.
 */
export function useRoleAndSubscription(userId) {
  const [role, setRole] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(!!userId);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setRole(null);
      setSubscription(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadData() {
      try {
        // Fetch profile (role)
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError;
        }

        // Fetch subscription
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId)
          .in('status', ['trialing', 'active', 'granted'])
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (subscriptionError && subscriptionError.code !== 'PGRST116') {
          throw subscriptionError;
        }

        if (!cancelled) {
          setRole(profileData?.role || 'user');
          setSubscription(subscriptionData || null);
          setError(null);
        }
      } catch (err) {
        console.error('Error loading role/subscription:', err);
        if (!cancelled) {
          setError(err.message);
          setRole('user');
          setSubscription(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { role, subscription, loading, error };
}

/**
 * Calculate trial days remaining
 */
export function getTrialDaysRemaining(subscription) {
  if (!subscription || subscription.status !== 'trialing' || !subscription.expires_at) {
    return 0;
  }

  const end = new Date(subscription.expires_at);
  const now = new Date();
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

/**
 * Check if user is admin
 */
export function isAdmin(role) {
  return role === 'admin';
}

/**
 * Check if user has active or granted access
 */
export function hasActiveAccess(subscription) {
  if (!subscription) return false;
  return ['active', 'granted', 'trialing'].includes(subscription.status);
}
