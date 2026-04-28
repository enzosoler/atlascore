/**
 * V3MobilePaywall — native iOS/Android paywall route.
 *
 * Renders the custom S5_Paywall_A screen and wires its CTA directly to
 * RevenueCat `purchasePackage()`. This replaces the previous approach of
 * launching the RevenueCat-hosted native paywall sheet (which showed a
 * second paywall on top of the custom one).
 *
 * The user selects a monthly/yearly plan, taps the CTA, and the shared
 * hook calls RevenueCat with the corresponding package identifier.
 *
 * Purchase and restore logic lives in the shared useRevenueCat hook
 * (src/redesign/v3/lib/useRevenueCat.js) — do not duplicate it here.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';
import S5_Paywall_A from '../screens/S5_Paywall_A.jsx';
import { useRevenueCat } from '../lib/useRevenueCat.js';

export default function V3MobilePaywall() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();

  // Allow direct navigation (e.g. from /pricing redirect or upgrade gate)
  // as well as contextual paywall triggers with location state.
  // location.state?.trigger and location.state?.from are available for telemetry if needed.

  const { purchase, restore, packageDisplays, offeringsError, retryLoadOfferings } = useRevenueCat({
    userId: user?.id,
    source: 'mobile_paywall',
  });

  return (
    <S5_Paywall_A
      dark={theme === 'dark'}
      onStartTrial={purchase}
      onRestore={restore}
      packageDisplays={packageDisplays}
      offeringsError={offeringsError}
      onRetryOfferings={retryLoadOfferings}
      onClose={() => navigate(-1)}
      showTabBar={false}
    />
  );
}
