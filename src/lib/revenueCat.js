/**
 * RevenueCat — In-app purchase management for atlas.core
 *
 * Handles iOS/Android subscriptions via RevenueCat SDK.
 * Only active on native platforms (Capacitor). Web uses Stripe via Supabase.
 *
 * Entitlement: "atlas.core Pro"
 * Products: weekly, monthly, yearly, lifetime
 */

import { Capacitor } from '@capacitor/core';
import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';

const RC_API_KEY = 'appl_GANHAhnNxGacwbbkWZtCxlORwZp';
const ENTITLEMENT_ID = 'atlas.core Pro';

/**
 * Initialize RevenueCat — call once on app boot (native only).
 * @param {string|null} userId — Supabase user ID for cross-platform identity
 */
export async function initRevenueCat(userId = null) {
  if (!Capacitor.isNativePlatform()) return;

  try {
    await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
    await Purchases.configure({ apiKey: RC_API_KEY });

    // Link RevenueCat customer to Supabase user for cross-platform sync
    if (userId) {
      await Purchases.logIn({ appUserID: userId });
    }

    console.log('[RevenueCat] Configured successfully');
  } catch (err) {
    console.error('[RevenueCat] Configuration failed:', err);
  }
}

/**
 * Set the Supabase user ID on RevenueCat after login.
 */
export async function identifyUser(userId) {
  if (!Capacitor.isNativePlatform() || !userId) return;
  try {
    await Purchases.logIn({ appUserID: userId });
  } catch (err) {
    console.error('[RevenueCat] logIn failed:', err);
  }
}

/**
 * Clear RevenueCat identity on logout.
 */
export async function logOutRevenueCat() {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await Purchases.logOut();
  } catch (err) {
    console.error('[RevenueCat] logOut failed:', err);
  }
}

/**
 * Check if user has active "atlas.core Pro" entitlement.
 * @returns {{ isActive: boolean, tier: string, expiresAt: string|null, willRenew: boolean }}
 */
export async function checkEntitlement() {
  if (!Capacitor.isNativePlatform()) {
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
        periodType: entitlement.periodType, // 'normal', 'trial', 'intro'
      };
    }

    return { isActive: false, tier: 'free', expiresAt: null, willRenew: false };
  } catch (err) {
    console.error('[RevenueCat] checkEntitlement failed:', err);
    return { isActive: false, tier: 'free', expiresAt: null, willRenew: false };
  }
}

/**
 * Get available offerings (products/packages).
 * @param {{ currentOnly?: boolean }} options — Pass { currentOnly: true } for just the current offering
 * @returns {object|null} Full offerings object, or current offering if currentOnly is true
 */
export async function getOfferings({ currentOnly = false } = {}) {
  if (!Capacitor.isNativePlatform()) return null;

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
 * Useful for attaching metadata like creator codes, referral info, etc.
 * @param {Record<string, string>} attrs — Key-value pairs to set
 */
export async function setRevenueCatAttributes(attrs) {
  if (!Capacitor.isNativePlatform() || !attrs) return;
  try {
    await Purchases.setAttributes(attrs);
  } catch (err) {
    console.error('[RevenueCat] setAttributes failed:', err);
  }
}

/**
 * Purchase a package from an offering.
 * @param {{ identifier: string }} pkg — The package to purchase
 * @returns {{ success: boolean, customerInfo: object|null, error: string|null }}
 */
export async function purchasePackage(pkg) {
  if (!Capacitor.isNativePlatform()) {
    return { success: false, customerInfo: null, error: 'Not on native platform' };
  }

  try {
    const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
    const isActive = typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined';

    return { success: isActive, customerInfo, error: null };
  } catch (err) {
    // User cancelled is not an error
    if (err.code === 1 || err.userCancelled) {
      return { success: false, customerInfo: null, error: null };
    }
    console.error('[RevenueCat] purchasePackage failed:', err);
    return { success: false, customerInfo: null, error: err.message };
  }
}

/**
 * Restore previous purchases (e.g., after reinstall).
 * @returns {{ success: boolean, isActive: boolean }}
 */
export async function restorePurchases() {
  if (!Capacitor.isNativePlatform()) {
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

/**
 * Present the RevenueCat native paywall.
 * @returns {Promise<boolean>} true if purchased/restored, false otherwise
 */
export async function presentPaywall() {
  if (!Capacitor.isNativePlatform()) return false;

  try {
    const { RevenueCatUI, PAYWALL_RESULT } = await import('@revenuecat/purchases-capacitor-ui');
    const { result } = await RevenueCatUI.presentPaywall();

    switch (result) {
      case PAYWALL_RESULT.PURCHASED:
      case PAYWALL_RESULT.RESTORED:
        return true;
      case PAYWALL_RESULT.NOT_PRESENTED:
      case PAYWALL_RESULT.ERROR:
      case PAYWALL_RESULT.CANCELLED:
      default:
        return false;
    }
  } catch (err) {
    console.error('[RevenueCat] presentPaywall failed:', err);
    return false;
  }
}

/**
 * Present the RevenueCat Customer Center (manage subscription).
 */
export async function presentCustomerCenter() {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const { RevenueCatUI } = await import('@revenuecat/purchases-capacitor-ui');
    await RevenueCatUI.presentCustomerCenter();
  } catch (err) {
    console.error('[RevenueCat] presentCustomerCenter failed:', err);
  }
}

/**
 * Listen for customer info updates (subscription changes).
 * @param {Function} callback — Called with updated customerInfo
 * @returns {Function} Cleanup function to remove listener
 */
export function onCustomerInfoUpdate(callback) {
  if (!Capacitor.isNativePlatform()) return () => {};

  const listener = Purchases.addCustomerInfoUpdateListener(({ customerInfo }) => {
    const entitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];
    callback({
      isActive: !!entitlement,
      tier: entitlement ? 'pro' : 'free',
      expiresAt: entitlement?.expirationDate || null,
      willRenew: entitlement?.willRenew ?? false,
      customerInfo,
    });
  });

  return () => listener?.remove?.();
}

export { ENTITLEMENT_ID, RC_API_KEY };
