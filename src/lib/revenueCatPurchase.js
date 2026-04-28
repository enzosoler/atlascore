export function resolvePackageFromOffering(currentOffering, pkgOrIdentifier) {
  if (!pkgOrIdentifier || typeof pkgOrIdentifier !== 'string') return pkgOrIdentifier;
  if (!currentOffering) return { error: 'no_offering' };

  const match = (currentOffering.availablePackages || []).find(
    (pkg) => pkg.identifier === pkgOrIdentifier
  );

  if (!match) {
    return { error: `package_not_found:${pkgOrIdentifier}` };
  }

  return match;
}

export async function executeRevenueCatPurchase({
  pkgOrIdentifier,
  purchases,
  getCurrentOffering,
  isAvailable,
  entitlementId = 'pro',
} = {}) {
  if (!isAvailable) {
    return {
      success: false,
      customerInfo: null,
      error: 'billing_unavailable',
      userCancelled: false,
    };
  }

  let pkg = pkgOrIdentifier;
  if (typeof pkgOrIdentifier === 'string') {
    pkg = resolvePackageFromOffering(await getCurrentOffering(), pkgOrIdentifier);
    if (pkg?.error === 'no_offering') {
      return { success: false, customerInfo: null, error: 'no_offering', userCancelled: false };
    }
    if (pkg?.error) {
      return { success: false, customerInfo: null, error: pkg.error, userCancelled: false };
    }
  }

  try {
    const { customerInfo } = await purchases.purchasePackage({ aPackage: pkg });
    const isActive = typeof customerInfo.entitlements.active[entitlementId] !== 'undefined';
    return { success: isActive, customerInfo, error: null, userCancelled: false };
  } catch (err) {
    if (err?.code === 1 || err?.userCancelled) {
      return { success: false, customerInfo: null, error: null, userCancelled: true };
    }
    return {
      success: false,
      customerInfo: null,
      error: err?.message || 'purchase_failed',
      userCancelled: false,
    };
  }
}
