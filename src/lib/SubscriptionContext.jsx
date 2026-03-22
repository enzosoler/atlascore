import React, { createContext, useContext, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { hasFeatureAccess } from '@/lib/entitlements';

const SubscriptionContext = createContext(null);

function isLocalMockUser(user) {
  if (!user) return false;
  return user.id?.startsWith('local-') || user.email?.endsWith('@local.dev');
}

function hasSupabaseConfig() {
  return Boolean(
    import.meta.env.VITE_SUPABASE_URL &&
      (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY)
  );
}

function toDateOnly(value) {
  if (!value) return null;
  return String(value).split('T')[0];
}

function normalizeSupabaseSubscription(row) {
  if (!row) return null;

  return {
    id: row.id,
    user_email: row.user_email || null,
    plan_code: row.tier || 'free',
    tier: row.tier || 'free',
    status: row.status || 'inactive',
    started_at:
      toDateOnly(row.current_period_starts_at) ||
      toDateOnly(row.trial_starts_at) ||
      toDateOnly(row.created_at),
    trial_ends_at: toDateOnly(row.trial_ends_at),
    current_period_starts_at: toDateOnly(row.current_period_starts_at),
    current_period_ends_at: toDateOnly(row.current_period_ends_at),
    created_at: row.created_at,
    source: 'supabase',
  };
}

function normalizeLegacySubscription(row) {
  if (!row) return null;
  return {
    ...row,
    plan_code: row.plan_code || row.tier || 'free',
    source: 'legacy',
  };
}

export function SubscriptionProvider({ children }) {
  const { user, isAuthenticated, authState } = useAuth();
  const isLocalSession = isLocalMockUser(user);
  const useSupabaseSubscriptions = hasSupabaseConfig();

  // Local auth is intentionally offline during the Base44 migration.
  const shouldFetch =
    !isLocalSession && !!user?.email && isAuthenticated && authState === 'authenticated';

  const { data: supabaseSubscriptions = [] } = useQuery({
    queryKey: ['subscription-supabase', user?.id],
    queryFn: async () => {
      if (!useSupabaseSubscriptions || !user?.id) return [];

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[SubscriptionContext] Supabase subscription query failed:', error.message);
        return [];
      }

      return data || [];
    },
    enabled: shouldFetch,
    staleTime: 5 * 60 * 1000,
    gcTime: 0,
  });

  const { data: legacySubscriptions = [] } = useQuery({
    queryKey: ['subscription-legacy', user?.email],
    queryFn: () => base44.entities.Subscription.filter({ user_email: user.email }),
    enabled: shouldFetch,
    staleTime: 5 * 60 * 1000,
    gcTime: 0, // Don't keep in cache after disable
  });

  const { data: overrides = [] } = useQuery({
    queryKey: ['entitlement-overrides', user?.email],
    queryFn: () => base44.entities.EntitlementOverride.filter({ user_email: user.email }),
    enabled: shouldFetch,
    staleTime: 5 * 60 * 1000,
    gcTime: 0,
  });

  // Use the most recent active subscription
  const subscriptions = useMemo(() => {
    const normalizedSupabase = supabaseSubscriptions.map(normalizeSupabaseSubscription).filter(Boolean);
    if (normalizedSupabase.length > 0) return normalizedSupabase;
    return legacySubscriptions.map(normalizeLegacySubscription).filter(Boolean);
  }, [legacySubscriptions, supabaseSubscriptions]);

  const subscription = useMemo(() => {
    const active = subscriptions.filter((s) => ['active', 'trialing', 'granted'].includes(s.status));
    if (active.length === 0) return subscriptions[0] || null;
    return active.sort(
      (a, b) => new Date(b.started_at || b.created_at || 0) - new Date(a.started_at || a.created_at || 0)
    )[0];
  }, [subscriptions]);

  const can = (featureKey) => hasFeatureAccess(user, subscription, overrides, featureKey);

  // Calculate trial days remaining
  const trialDaysRemaining = useMemo(() => {
    if (!subscription || subscription.status !== 'trialing' || !subscription.trial_ends_at) return 0;
    const end = new Date(subscription.trial_ends_at + 'T23:59:59');
    const now = new Date();
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  }, [subscription]);

  // Check if trial is expired (status trialing but days = 0)
  const isTrialExpired = subscription?.status === 'trialing' && trialDaysRemaining === 0;

  return (
    <SubscriptionContext.Provider value={{ subscription, overrides, can, trialDaysRemaining, isTrialExpired }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider');
  return ctx;
}
