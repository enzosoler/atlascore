/**
 * EntitlementGate — Hard paywall gate for protected routes.
 *
 * Renders children only when the user has an active Pro entitlement.
 * Otherwise redirects to /pricing (post-onboarding) or /onboarding (new users).
 *
 * There is intentionally NO dismiss button, skip link, or "maybe later" option.
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { useEntitlement } from '@/hooks/useEntitlement';
import { useAuth } from '@/lib/AuthContext';
import { resolveEntitlementGateState } from '@/lib/entitlementGatePolicy';

export default function EntitlementGate({ children }) {
  const { hasActivePro, isLoading: isEntitlementLoading } = useEntitlement();
  const { user, isLoadingAuth } = useAuth();
  const isNative = Capacitor.isNativePlatform();
  const gateState = resolveEntitlementGateState({
    isLoadingAuth,
    isEntitlementLoading,
    user,
    hasActivePro,
    isNative,
  });

  // ── Loading state ────────────────────────────────────────────────────────
  if (gateState.type === 'loading') {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[hsl(var(--bg))] px-6">
        <div className="flex flex-col items-center gap-3 rounded-[20px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card)/0.8)] px-6 py-5 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--brand))]" />
          <p className="text-[14px] font-semibold text-[hsl(var(--fg))]">Checking access...</p>
          <p className="max-w-[240px] text-[12px] leading-relaxed text-[hsl(var(--fg-3))]">
            Loading your profile and subscription state.
          </p>
        </div>
      </div>
    );
  }

  // ── User hasn't completed onboarding yet ─────────────────────────────────
  if (gateState.type === 'redirect') {
    return <Navigate to={gateState.to} replace />;
  }

  // ── Active Pro — render the protected content ────────────────────────────
  if (gateState.type === 'allow') {
    return children;
  }

  return null;
}
