/**
 * PlatformGate — keeps public web as conversion/billing only.
 *
 * Per CLAUDE.md §13–16: real users must not use atlas.core through
 * public web routes. Only billing / account / export surfaces are
 * allowed publicly. Everything else redirects to /download-app.
 *
 * Bypasses:
 *   - Native (Capacitor) always passes.
 *   - localhost / 127.0.0.1 pass (dev server).
 *   - import.meta.env.DEV passes.
 *   - Optional internal override when VITE_ENABLE_PLATFORM_GATE_BYPASS=true.
 */

import React, { useEffect, useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';

export const WEB_ALLOWED_PREFIXES = [
  '/webapp',
];

export function isWebAllowedRoute(pathname) {
  return WEB_ALLOWED_PREFIXES.some((p) => pathname.startsWith(p));
}

export function useDevMode() {
  const location = useLocation();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const bypassEnabled = import.meta.env.VITE_ENABLE_PLATFORM_GATE_BYPASS === 'true';

  useEffect(() => {
    if (bypassEnabled && params.get('dev') === '1') {
      try { localStorage.setItem('atlas.dev', '1'); } catch {}
    }
  }, [bypassEnabled, params]);

  // Admin subdomain always bypasses platform gate
  if (typeof window !== 'undefined' && window.location.hostname.startsWith('admin.')) return true;
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) return true;
  if (import.meta.env.DEV) return true;
  if (!bypassEnabled) return false;
  if (params.get('dev') === '1') return true;
  try { return localStorage.getItem('atlas.dev') === '1'; } catch { return false; }
}

export function PlatformGate({ children }) {
  const location = useLocation();
  const isNative = Capacitor.isNativePlatform();
  const isDev = useDevMode();

  if (isNative) return children;
  if (isDev) return children;
  if (isWebAllowedRoute(location.pathname)) return children;

  return <Navigate to="/download-app" replace />;
}

export default PlatformGate;
