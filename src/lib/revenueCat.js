/**
 * RevenueCat — In-app purchase management for atlas.core
 *
 * Handles iOS / Android subscriptions via the RevenueCat Capacitor SDK.
 * On web we fall through to Stripe Checkout (via the existing
 * `create-checkout` Supabase Edge Function) since the RevenueCat web SDK
 * doesn't ship with Capacitor.
 *
 * Entitlement identifier: "pro"
 * Products:
 *   - atlas_core_pro_weekly   (package `$rc_weekly`)
 *   - atlas_core_pro_monthly  (package `$rc_monthly`)
 *   - atlas_core_pro_yearly   (package `$rc_annual`)
 *
 * Env vars (all optional — missing keys fall through to a clear no-op with
 * a console.warn, so the app never crashes in dev without RevenueCat set up):
 *   VITE_REVENUECAT_IOS_KEY       — public SDK key starting with `appl_`
 *   VITE_REVENUECAT_ANDROID_KEY   — public SDK key starting with `goog_`
 *   VITE_REVENUECAT_WEB_KEY       — public SDK key starting with `strp_` (RC Billing)
 *
 * See docs/REVENUECAT_SETUP.md for a full dashboard walk-through.
 */

import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';

const ENTITLEMENT_ID = 'pro';

/** Read the key for the current platform. Returns null if not configured. */
function getApiKey() {
  const platform = Capacitor.getPlatform();
  if (platform === 'ios')     return import.meta.env.VITE_REVENUECAT_IOS_KEY || null;
  if (platform === 'android') return import.meta.env.VITE_REVENUECAT_ANDROID_KEY || null;
  return import.meta.env.VITE_REVENUECAT_WEB_KEY || null; // web — RC Billing (Stripe)
}

/** True when the SDK can actually be used on this device. */
function isRevenueCatAvailable() {
  // RC Capacitor SDK only supports native. Web users go through Stripe Checkout.
  if (!Capacitor.isNativePlatform()) return false;
  return Boolean(getApiKey());
}

let _configured = false;
let _configuring = null;

/**
 * Configure the SDK once per app session. Safe to call multiple times; only
 * the first call performs work. Subsequent calls await the original promise.
 *
 * @param {string|null} userId — Supabase user id. Pass null to configure
 *   anonymously; call identifyUser(id) later when auth completes.
 */
export async function initRevenueCat(userId = null) {
  if (!isRevenueCatAvailable()) {
    if (Capacitor.isNativePlatform()) {
      console.warn(
        '[RevenueCat] No API key for this platform. ' +
        'Set VITE_REVENUECAT_IOS_KEY / VITE_REVENUECAT_ANDROID_KEY in .env.local. ' +
        'Purchases will show a friendly fallback until configured.'
      );
    }
    return;
  }

  if (_configured) {
    if (userId) await identifyUser(userId);
    return;
  }
  if (_configuring) return _configuring;

  _configuring = (async () => {
    try {
      await Purchases.setLogLevel({ level: import.meta.env.DEV ? LOG_LEVEL.DEBUG : LOG_LEVEL.WARN });
      await Purchases.configure({ apiKey: getApiKey() });
      if (userId) {
        await Purchases.logIn({ appUserID: userId });
      }
      _configured = true;
      console.log('[RevenueCat] Configured');
    } catch (err) {
      console.error('[RevenueCat] Configuration failed:', err);
    } finally {
      _configuring = null;
    }
  })();

  return _configuring;
}

/**
 * Link the RevenueCat customer to a Supabase user id. Call after sign-in.
 * No-op if the SDK isn't available on this platform.
 */
export async function identifyUser(userId) {
  if (!isRevenueCatAvailable() || !userId) return;
  try {
    await Purchases.logIn({ appUserID: userId });
  } catch (err) {
    console.error('[RevenueCat] logIn failed:', err);
  }
}

/** Clear RevenueCat identity on logout. */
export async function logOutRevenueCat() {
  if (!isRevenueCatAvailable()) return;
  try {
    await Purchases.logOut();
  } catch (err) {
    console.error('[RevenueCat] logOut failed:', err);
  }
}

/**
 * Read the current entitlement state from the SDK.
 * Returns a normalized shape so callers never have to touch raw customerInfo.
 *
 * @returns {{
 *   isActive: boolean,
 *   tier: 'free' | 'pro',
 *   expiresAt: string | null,
 *   willRenew: boolean,
 *   productId?: string,
 *   periodType?: 'NORMAL' | 'TRIAL' | 'INTRO',
 * }}
 */
export async function checkEntitlement() {
  if (!isRevenueCatAvailable()) {
    return { isActive: false, tier: 'free', expiresAt: null, willRenew: false };
  }

  try {
    const { customerInfo } = await Purchases.getCustomerInfo();
    const entitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];

    if (entitlement) {
      return {
        isActive: true,
        tier: 'pro',
        expiresAt: entitlement.expirationDate || null,
        willRenew: entitlement.willRenew ?? true,
        productId: entitlement.productIdentifier,
        periodType: entitlement.periodType, // 'NORMAL' | 'TRIAL' | 'INTRO'
      };
    }

    return { isActive: false, tier: 'free', expiresAt: null, willRenew: false };
  } catch (err) {
    console.error('[RevenueCat] checkEntitlement failed:', err);
    return { isActive: false, tier: 'free', expiresAt: null, willRenew: false };
  }
}

/**
 * Alias exposed to callers who think in terms of "current subscription"
 * rather than "entitlement." Same data, friendlier name.
 */
export async function getCurrentSubscription() {
  return checkEntitlement();
}

/**
 * Fetch all offerings. Pass { currentOnly: true } to get just the current
 * one (usually what the paywall wants). Returns null if not available.
 */
export async function getOfferings({ currentOnly = false } = {}) {
  if (!isRevenueCatAvailable()) return null;

  try {
    const { offerings } = await Purchases.getOfferings();
    if (!offerings) return null;
    return currentOnly ? offerings.current || null : offerings;
  } catch (err) {
    console.error('[RevenueCat] getOfferings failed:', err);
    return null;
  }
}

/**
 * Set custom attributes on the RevenueCat subscriber.
 * Useful for attaching metadata like creator codes or referral info.
 */
export async function setRevenueCatAttributes(attrs) {
  if (!isRevenueCatAvailable() || !attrs) return;
  try {
    await Purchases.setAttributes(attrs);
  } catch (err) {
    console.error('[RevenueCat] setAttributes failed:', err);
  }
}

/**
 * Purchase a package. Accepts either:
 *   - the full package object returned from `getOfferings().current.availablePackages`
 *   - a package identifier string like `$rc_monthly`, `$rc_weekly`, `$rc_annual`
 *
 * When given an identifier, we look up the matching package in the current
 * offering before calling the SDK.
 *
 * @returns {{ success: boolean, customerInfo: object|null, error: string|null, userCancelled: boolean }}
 */
export async function purchasePackage(pkgOrIdentifier) {
  if (!isRevenueCatAvailable()) {
    return {
      success: false,
      customerInfo: null,
      error: 'billing_unavailable',
      userCancelled: false,
    };
  }

  let pkg = pkgOrIdentifier;

  // Resolve string identifier to a package object from the current offering.
  if (typeof pkgOrIdentifier === 'string') {
    const current = await getOfferings({ currentOnly: true });
    if (!current) {
      return { success: false, customerInfo: null, error: 'no_offering', userCancelled: false };
    }
    const match = (current.availablePackages || []).find(
      (p) => p.identifier === pkgOrIdentifier
    );
    if (!match) {
      return {
        success: false,
        customerInfo: null,
        error: `package_not_found:${pkgOrIdentifier}`,
        userCancelled: false,
      };
    }
    pkg = match;
  }

  try {
    const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
    const isActive = typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
    return { success: isActive, customerInfo, error: null, userCancelled: false };
  } catch (err) {
    // User cancelling is not an error. Normalize to a clean shape.
    if (err?.code === 1 || err?.userCancelled) {
      return { success: false, customerInfo: null, error: null, userCancelled: true };
    }
    console.error('[RevenueCat] purchasePackage failed:', err);
    return {
      success: false,
      customerInfo: null,
      error: err?.message || 'purchase_failed',
      userCancelled: false,
    };
  }
}

/**
 * Restore previous purchases (re-install, new device, lost receipt).
 * @returns {{ success: boolean, isActive: boolean }}
 */
export async function restorePurchases() {
  if (!isRevenueCatAvailable()) {
    return { success: false, isActive: false };
  }

  try {
    const { customerInfo } = await Purchases.restorePurchases();
    const isActive = typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
    return { success: true, isActive };
  } catch (err) {
    console.error('[RevenueCat] restorePurchases failed:', err);
    return { success: false, isActive: false };
  }
}

/** Present the RevenueCat-hosted native paywall (optional helper). */
export async function presentPaywall() {
  if (!isRevenueCatAvailable()) return false;

  try {
    const { RevenueCatUI, PAYWALL_RESULT } = await import('@revenuecat/purchases-capacitor-ui');
    const { result } = await RevenueCatUI.presentPaywall();
    return result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED;
  } catch (err) {
    console.error('[RevenueCat] presentPaywall failed:', err);
    return false;
  }
}

/** Present the RevenueCat Customer Center (manage subscription). */
export async function presentCustomerCenter() {
  if (!isRevenueCatAvailable()) return;

  try {
    const { RevenueCatUI } = await import('@revenuecat/purchases-capacitor-ui');
    await RevenueCatUI.presentCustomerCenter();
  } catch (err) {
    console.error('[RevenueCat] presentCustomerCenter failed:', err);
  }
}

/**
 * Open subscription management in the most-native way available:
 *   - iOS/Android + RevenueCat configured → RevenueCatUI customer center (in-app sheet)
 *   - iOS + RevenueCat NOT configured      → deep-link to App Store subscriptions
 *   - Android + RevenueCat NOT configured  → deep-link to Play Store subscriptions
 *   - Web                                  → returns false so the caller can
 *                                            navigate to the web management UI
 *
 * Returns true when the native path was taken (caller should NOT navigate).
 */
export async function openSubscriptionManagement() {
  if (!Capacitor.isNativePlatform()) return false;

  if (isRevenueCatAvailable()) {
    await presentCustomerCenter();
    return true;
  }

  try {
    const { App } = await import('@capacitor/app');
    const platform = Capacitor.getPlatform();
    const url = platform === 'ios'
      ? 'itms-apps://apps.apple.com/account/subscriptions'
      : 'https://play.google.com/store/account/subscriptions';
    await App.openUrl({ url });
    return true;
  } catch (err) {
    console.error('[RevenueCat] openSubscriptionManagement failed:', err);
    return false;
  }
}

/**
 * Subscribe to customer-info updates. The callback fires whenever the user's
 * entitlement state changes (purchase, renewal, cancellation, expiration).
 *
 * @param {(state: {
 *   isActive: boolean,
 *   tier: 'free' | 'pro',
 *   expiresAt: string | null,
 *   willRenew: boolean,
 *   customerInfo: object,
 * }) => void} callback
 * @returns {() => void} Cleanup — call to remove the listener.
 */
export function onCustomerInfoUpdate(callback) {
  if (!isRevenueCatAvailable()) return () => {};

  const listener = Purchases.addCustomerInfoUpdateListener(({ customerInfo }) => {
    const entitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];
    callback({
      isActive: !!entitlement,
      tier: entitlement ? 'pro' : 'free',
      expiresAt: entitlement?.expirationDate || null,
      willRenew: entitlement?.willRenew ?? false,
      productId: entitlement?.productIdentifier,
      periodType: entitlement?.periodType,
      customerInfo,
    });
  });

  return () => listener?.remove?.();
}

/* ─────────────────────────────────────────────────────────────────────────
 * React hook
 *
 * A lightweight hook for components that only need the current RC entitlement
 * state and don't want to pull in the global SubscriptionContext (which also
 * merges Supabase / Stripe web purchases).
 *
 * Shape:
 *   {
 *     tier: 'free' | 'pro',
 *     status: 'active' | 'trialing' | 'inactive' | 'loading' | 'unavailable',
 *     productId: string | null,
 *     renewsAt: string | null,
 *     willRenew: boolean,
 *     isLoading: boolean,
 *     error: Error | null,
 *   }
 * ───────────────────────────────────────────────────────────────────────── */

export function useSubscription() {
  const available = isRevenueCatAvailable();
  const [state, setState] = useState(() => ({
    tier: 'free',
    status: available ? 'loading' : 'unavailable',
    productId: null,
    renewsAt: null,
    willRenew: false,
    isLoading: available,
    error: null,
  }));

  useEffect(() => {
    if (!available) return undefined;

    let cancelled = false;

    function apply(rc) {
      if (cancelled) return;
      setState({
        tier: rc.tier,
        status: rc.isActive
          ? (rc.periodType === 'TRIAL' ? 'trialing' : 'active')
          : 'inactive',
        productId: rc.productId || null,
        renewsAt: rc.expiresAt || null,
        willRenew: rc.willRenew ?? false,
        isLoading: false,
        error: null,
      });
    }

    checkEntitlement()
      .then(apply)
      .catch((err) => {
        if (cancelled) return;
        setState((prev) => ({ ...prev, isLoading: false, error: err }));
      });

    const cleanup = onCustomerInfoUpdate(apply);

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [available]);

  return state;
}

export { ENTITLEMENT_ID, isRevenueCatAvailable };
