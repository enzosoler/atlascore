/**
 * useRevenueCat — shared hook for paywall purchase and restore flows.
 *
 * Encapsulates:
 *   - purchasePackage(planId)  — maps plan key to RC package id and purchases
 *   - restorePurchases()       — restores prior purchases
 *   - loading state
 *   - PostHog tracking calls
 *
 * Usage:
 *   const { purchase, restore, loading } = useRevenueCat({ userId, onSuccess });
 *
 * planId values match PLAN_TO_PACKAGE keys: 'weekly' | 'monthly' | 'yearly'
 */

import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useT } from '@/lib/i18nContext';
import {
  initRevenueCat,
  purchasePackage as rcPurchasePackage,
  restorePurchases as rcRestorePurchases,
  isRevenueCatAvailable,
  getOfferings,
} from '@/lib/revenueCat';
import { track, trackPurchaseCompleted } from '@/lib/analytics';

/** Map plan keys from paywall screens to RevenueCat package identifiers. */
export const PLAN_TO_PACKAGE = {
  weekly: '$rc_weekly',
  monthly: '$rc_monthly',
  yearly: '$rc_annual',
};

function planFromPackageIdentifier(identifier) {
  if (identifier === PLAN_TO_PACKAGE.weekly) return 'weekly';
  if (identifier === PLAN_TO_PACKAGE.monthly) return 'monthly';
  if (identifier === PLAN_TO_PACKAGE.yearly) return 'yearly';
  return null;
}

function normalizePackageDisplay(pkg) {
  const product = pkg?.product || pkg?.storeProduct || {};
  return {
    identifier: pkg?.identifier,
    price: product.priceString || product.localizedPriceString || product.price?.formatted || '',
    title: product.title || product.localizedTitle || '',
    description: product.description || product.localizedDescription || '',
  };
}

/**
 * @param {{
 *   userId?: string,
 *   source?: string,
 *   onSuccess?: () => void,
 * }} options
 */
export function useRevenueCat({ userId, source = 'paywall', onSuccess } = {}) {
  const t = useT();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [packageDisplays, setPackageDisplays] = useState({});
  const [offeringsError, setOfferingsError] = useState(false);
  const [offeringsLoading, setOfferingsLoading] = useState(true);

  const loadOfferingMetadata = useCallback(async () => {
    setOfferingsError(false);
    setOfferingsLoading(true);
    try {
      if (!isRevenueCatAvailable()) {
        setOfferingsLoading(false);
        return;
      }
      await initRevenueCat(userId);
      const offering = await getOfferings({ currentOnly: true });
      if (!offering?.availablePackages) {
        setOfferingsError(true);
        setOfferingsLoading(false);
        return;
      }

      const next = {};
      for (const pkg of offering.availablePackages) {
        const plan = planFromPackageIdentifier(pkg.identifier);
        if (plan) next[plan] = normalizePackageDisplay(pkg);
      }
      setPackageDisplays(next);
      setOfferingsError(false);
    } catch (err) {
      console.warn('[useRevenueCat] offering metadata load failed:', err);
      setOfferingsError(true);
    } finally {
      setOfferingsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    let cancelled = false;
    loadOfferingMetadata().then(() => {
      if (cancelled) return;
    });
    return () => { cancelled = true; };
  }, [loadOfferingMetadata]);

  async function purchase({ planId } = {}) {
    if (loading) return;
    setLoading(true);
    try {
      await initRevenueCat(userId);

      if (!isRevenueCatAvailable()) {
        toast.error(t('paywall.toasts.billingUnavailable'));
        return;
      }

      const pkgId = PLAN_TO_PACKAGE[planId] || PLAN_TO_PACKAGE.yearly;
      const result = await rcPurchasePackage(pkgId);

      if (result.userCancelled) {
        return;
      }
      if (result.success) {
        trackPurchaseCompleted({ plan: planId || 'yearly', source });
        toast.success(t('paywall.toasts.welcome'));
        if (onSuccess) {
          onSuccess();
        } else {
          navigate('/app/today', { replace: true });
        }
        return;
      }
      if (result.error) {
        track('purchase_failed', { plan: planId || 'yearly', error: result.error, source });
        console.warn('[useRevenueCat] purchase error:', result.error);
        toast.error(
          result.error === 'billing_unavailable' || result.error === 'no_offering'
            ? t('paywall.toasts.billingUnavailable')
            : t('paywall.toasts.genericError')
        );
      }
    } catch (err) {
      track('purchase_failed', { plan: planId || 'yearly', error: err?.message || 'exception', source });
      console.error('[useRevenueCat] purchase exception:', err);
      toast.error(t('paywall.toasts.genericError'));
    } finally {
      setLoading(false);
    }
  }

  async function restore() {
    if (loading) return;
    setLoading(true);
    try {
      await initRevenueCat(userId);

      const result = await rcRestorePurchases();
      if (result.isActive) {
        track('restore_success', { source });
        toast.success(t('paywall.toasts.restored'));
        if (onSuccess) {
          onSuccess();
        } else {
          navigate('/app/today', { replace: true });
        }
      } else {
        track('restore_failed', { reason: 'no_active_subscription', source });
        toast(t('paywall.toasts.noActiveSub'));
      }
    } catch (err) {
      track('restore_failed', { reason: err?.message || 'exception', source });
      toast.error(t('paywall.toasts.restoreFailed'));
    } finally {
      setLoading(false);
    }
  }

  return { purchase, restore, loading, packageDisplays, offeringsError, offeringsLoading, retryLoadOfferings: loadOfferingMetadata };
}
