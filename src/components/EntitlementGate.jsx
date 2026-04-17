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
import { useEntitlement } from '@/hooks/useEntitlement';
import { useAuth } from '@/lib/AuthContext';

export default function EntitlementGate({ children }) {
  const { hasActivePro, isLoading: isEntitlementLoading } = useEntitlement();
  const { user, isLoadingAuth } = useAuth();

  // ── Loading state ────────────────────────────────────────────────────────
  if (isLoadingAuth || isEntitlementLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // ── User hasn't completed onboarding yet ─────────────────────────────────
  if (!user?.onboarding_completed) {
    return <Navigate to="/onboarding" replace />;
  }

  // ── Active Pro — render the protected content ────────────────────────────
  if (hasActivePro) {
    return children;
  }

  // ── No entitlement — hard redirect to pricing ────────────────────────────
  return <Navigate to="/pricing" replace />;
}
