/**
 * useEntitlement — Hard-gate entitlement check for atlas.core Pro.
 *
 * Merges three sources of truth:
 *   1. profile_data.pro_entitlement  (grandfathered / admin-granted)
 *   2. RevenueCat entitlement        (native iOS/Android)
 *   3. Supabase subscription row     (Stripe web)
 *
 * Returns { hasActivePro, isGrandfathered, tier, isLoading }.
 */

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { checkEntitlement } from '@/lib/revenueCat';
import { useSubscription } from '@/lib/SubscriptionContext';

/**
 * Check whether `expires_at` is still in the future (or null / undefined,
 * which we treat as "unlimited / never expires").
 */
function isNotExpired(expiresAt) {
  if (!expiresAt) return true; // null / undefined → unlimited
  return new Date(expiresAt) > new Date();
}

export function useEntitlement() {
  const { user, isAuthenticated } = useAuth();
  const { subscription } = useSubscription();

  // ── 1. Profile-based entitlement (grandfathered + admin grants) ──────────
  const {
    data: profileEntitlement,
    isLoading: isProfileLoading,
  } = useQuery({
    queryKey: ['pro-entitlement', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('profile_data')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.warn('[useEntitlement] Profile query failed:', error.message);
        return null;
      }

      return data?.profile_data?.pro_entitlement ?? null;
    },
    enabled: !!user?.id && isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // ── 2. RevenueCat entitlement (native platforms) ─────────────────────────
  const {
    data: rcEntitlement,
    isLoading: isRcLoading,
  } = useQuery({
    queryKey: ['rc-entitlement', user?.id],
    queryFn: () => checkEntitlement(),
    enabled: !!user?.id && isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  // ── Resolve ──────────────────────────────────────────────────────────────

  const isLoading = isProfileLoading || isRcLoading;

  // Grandfathered users always get access regardless of subscription state.
  if (profileEntitlement?.grandfathered === true) {
    return {
      hasActivePro: true,
      isGrandfathered: true,
      tier: 'legacy_free',
      isLoading,
    };
  }

  // Profile-level active entitlement (e.g. admin-granted, promo codes).
  if (
    profileEntitlement?.active === true &&
    isNotExpired(profileEntitlement.expires_at)
  ) {
    return {
      hasActivePro: true,
      isGrandfathered: false,
      tier: profileEntitlement.tier || 'pro',
      isLoading,
    };
  }

  // RevenueCat (native iOS/Android in-app purchases).
  if (rcEntitlement?.isActive) {
    return {
      hasActivePro: true,
      isGrandfathered: false,
      tier: rcEntitlement.tier || 'pro',
      isLoading,
    };
  }

  // Supabase subscription row (Stripe web purchases).
  const isSubActive =
    subscription &&
    ['active', 'trialing', 'granted'].includes(subscription.status);

  if (isSubActive) {
    return {
      hasActivePro: true,
      isGrandfathered: false,
      tier: subscription.tier || subscription.plan_code || 'pro',
      isLoading,
    };
  }

  // No active entitlement found.
  return {
    hasActivePro: false,
    isGrandfathered: false,
    tier: 'free',
    isLoading,
  };
}
