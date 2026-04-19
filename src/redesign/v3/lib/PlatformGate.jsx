/**
 * PlatformGate — keeps public web as conversion/billing only.
 *
 * Per CLAUDE.md §13–16: real users must not use atlas.core through
 * public web routes. Only billing / account / export surfaces are
 * allowed publicly. Everything else redirects to /download-app.
 *
 * Bypasses:
 *   - Native (Capacitor) always passes.
 *   - `?dev=1` sets a persistent localStorage flag.
 *   - localStorage `atlas.dev=1` passes.
 *   - localhost / 127.0.0.1 pass (dev server).
 *   - import.meta.env.DEV passes.
 */

import React, { useEffect, useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';

export const WEB_ALLOWED_PREFIXES = [
  '/app/billing',
  '/app/account',
  '/app/export',
];

export function isWebAllowedRoute(pathname) {
  return WEB_ALLOWED_PREFIXES.some((p) => pathname.startsWith(p));
}

export function useDevMode() {
  const location = useLocation();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);

  useEffect(() => {
    if (params.get('dev') === '1') {
      try { localStorage.setItem('atlas.dev', '1'); } catch {}
    }
  }, [params]);

  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) return true;
  if (import.meta.env.DEV) return true;
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
