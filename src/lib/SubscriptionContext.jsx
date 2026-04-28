import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { hasFeatureAccess } from '@/lib/entitlements';
import {
  initRevenueCat,
  checkEntitlement,
  onCustomerInfoUpdate,
  presentPaywall as rcPresentPaywall,
  presentCustomerCenter as rcPresentCustomerCenter,
  restorePurchases as rcRestorePurchases,
} from '@/lib/revenueCat';
import { isIgnorableSubscriptionError } from '@/services/billingService';
import { hasSupabaseConfigFromEnv } from '@/lib/envGuards';
import { mergeSubscriptionState, normalizeSupabaseSubscription, toDateOnly } from '@/lib/subscriptionState';

const SubscriptionContext = createContext(null);

function isLocalMockUser(user) {
  if (!user) return false;
  return user.id?.startsWith('local-') || user.email?.endsWith('@local.dev');
}

function hasSupabaseConfig() {
  return hasSupabaseConfigFromEnv(import.meta.env);
}

// ── RevenueCat subscription (native iOS/Android) ─────────────────────────────

function useRevenueCatSubscription(user, isAuthenticated) {
  const [rcState, setRcState] = useState(null);
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    if (!isNative || !isAuthenticated || !user?.id) return;

    let cancelled = false;

    // Initialize RevenueCat SDK, then check entitlement
    initRevenueCat(user.id)
      .then(() => {
        if (cancelled) return;
        return checkEntitlement();
      })
      .then((state) => {
        if (!cancelled && state) setRcState(state);
      })
      .catch((err) => {
        console.warn('[SubscriptionContext] RevenueCat init/check failed:', err);
      });

    // Listen for real-time updates (purchase, restore, expiry)
    const cleanup = onCustomerInfoUpdate((state) => {
      setRcState(state);
    });

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [isNative, isAuthenticated, user?.id]);

  const subscription = useMemo(() => {
    if (!rcState) return null;
    return {
      id: 'rc-native',
      plan_code: rcState.tier,
      tier: rcState.tier,
      status: rcState.isActive ? (rcState.periodType === 'trial' ? 'trialing' : 'active') : 'inactive',
      expires_at: rcState.expiresAt ? toDateOnly(rcState.expiresAt) : null,
      trial_ends_at: rcState.periodType === 'trial' ? toDateOnly(rcState.expiresAt) : null,
      source: 'revenuecat',
    };
  }, [rcState]);

  return { subscription, isActive: rcState?.isActive ?? false };
}


export function SubscriptionProvider({ children }) {
  const { user, isAuthenticated, authState } = useAuth();
  const isLocalSession = isLocalMockUser(user);
  const useSupabaseSubscriptions = hasSupabaseConfig();
  const isNative = Capacitor.isNativePlatform();

  // ── Supabase subscriptions (all platforms — needed for Stripe web purchases on native) ──
  const shouldFetchSupabase =
    !isLocalSession && !!user?.email && isAuthenticated && authState === 'authenticated';

  const { data: supabaseSubscriptions = [] } = useQuery({
    queryKey: ['subscription-supabase', user?.id],
    queryFn: async () => {
      if (!useSupabaseSubscriptions || !user?.id) return [];
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return [];

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        if (!isIgnorableSubscriptionError(error)) {
          console.warn('[SubscriptionContext] Supabase subscription query failed:', error.message);
        }
        return [];
      }

      return data || [];
    },
    enabled: shouldFetchSupabase,
    staleTime: 5 * 60 * 1000,
    gcTime: 0,
  });

  // ── RevenueCat subscriptions (native) ────────────────────────────────────
  const { subscription: rcSubscription } = useRevenueCatSubscription(user, isAuthenticated);

  // ── Merge: RevenueCat takes priority on native ───────────────────────────
  const subscriptions = useMemo(() => {
    return supabaseSubscriptions.map(normalizeSupabaseSubscription).filter(Boolean);
  }, [supabaseSubscriptions]);

  const subscription = useMemo(() => {
    return mergeSubscriptionState({ isNative, rcSubscription, subscriptions });
  }, [isNative, rcSubscription, subscriptions]);

  const can = (featureKey) => hasFeatureAccess(user, subscription, [], featureKey);

  // ── Trial days remaining ─────────────────────────────────────────────────
  const trialDaysRemaining = useMemo(() => {
    const expiresField = subscription?.expires_at || subscription?.trial_ends_at;
    if (!subscription || subscription.status !== 'trialing' || !expiresField) return 0;
    const end = new Date(expiresField + 'T23:59:59');
    const now = new Date();
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  }, [subscription]);

  const isTrialExpired = subscription?.status === 'trialing' && trialDaysRemaining === 0;

  // ── Native purchase actions ──────────────────────────────────────────────
  const qc = useQueryClient();

  const showPaywall = useCallback(async () => {
    if (isNative) {
      const purchased = await rcPresentPaywall();
      if (purchased) {
        // Force refresh entitlement state from the RevenueCat SDK.
        await checkEntitlement();
        // The server-side source of truth is the `subscriptions` row, which is
        // written by supabase/functions/revenuecat-webhook. We don't call any
        // edge function from the client — the RevenueCat webhook fires
        // automatically after purchase. But the webhook is asynchronous and
        // may lag by a few seconds, so we refetch with a short backoff until
        // the subscription row appears or we give up.
        const refetchWithBackoff = async () => {
          const delays = [0, 2000, 4000, 8000]; // ms — total ~14s
          for (const delay of delays) {
            if (delay) await new Promise(r => setTimeout(r, delay));
            await qc.invalidateQueries({ queryKey: ['subscription-supabase', user?.id] });
            // If the query result is already active, stop polling.
            const state = qc.getQueryData(['subscription-supabase', user?.id]);
            if (state?.status === 'active' || state?.status === 'trialing') return;
          }
        };
        // Fire-and-forget — we don't want to block the paywall return.
        refetchWithBackoff().catch((err) => console.warn('[SubscriptionContext] refetch backoff failed:', err));
      }
      return purchased;
    }
    // On web, navigate to pricing (handled by caller)
    return false;
  }, [isNative, user?.id, qc]);

  const restore = useCallback(async () => {
    if (!isNative) return false;
    const { isActive } = await rcRestorePurchases();
    if (isActive) {
      qc.invalidateQueries({ queryKey: ['subscription-supabase', user?.id] });
    }
    return isActive;
  }, [isNative, user?.id, qc]);

  const showCustomerCenter = useCallback(async () => {
    if (isNative) {
      await rcPresentCustomerCenter();
    }
  }, [isNative]);

  return (
    <SubscriptionContext.Provider value={{
      subscription,
      overrides: [],
      can,
      trialDaysRemaining,
      isTrialExpired,
      isNative,
      showPaywall,
      restore,
      showCustomerCenter,
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider');
  return ctx;
}
