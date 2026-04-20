/**
 * v3 app shell — wraps the paper+ink+amber screens with a real React Router
 * outlet and a persistent bottom tab bar.
 *
 * Platform gate (CLAUDE.md §12–15):
 *   On web (non-native), only billing routes are publicly accessible.
 *   All other product routes redirect to /download-app UNLESS:
 *     - Running on a native device (Capacitor)
 *     - URL contains ?dev=1 (sets a persistent localStorage flag)
 *     - localStorage has "atlas.dev" set to "1"
 *   This keeps the public web as conversion/billing only while allowing
 *   internal dev/QA/design review access.
 */

import React, { useEffect, useMemo } from 'react';
import { Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { PaperThemeProvider, ACTabBar, ACFonts, ACBrand, useACT } from '../lib/paper.jsx';
import { HeartMark } from '../lib/brandMarks.jsx';
import { useTheme } from '@/lib/ThemeContext';
import { Capacitor } from '@capacitor/core';

const TAB_ROUTES = {
  today: '/app/today',
  train: '/app/workouts',
  eat:   '/app/nutrition',
  body:  '/app/body',
  you:   '/app/profile',
};

/** Routes allowed on public web (account management, billing, export). */
const WEB_ALLOWED_PREFIXES = [
  '/app/billing',
  '/app/account',
  '/app/export',
];

function isWebAllowedRoute(pathname) {
  return WEB_ALLOWED_PREFIXES.some((p) => pathname.startsWith(p));
}

/**
 * Check if dev mode is active. Sets the persistent flag when ?dev=1 is present.
 * Returns true if dev access should be granted on web.
 */
function useDevMode() {
  const location = useLocation();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);

  useEffect(() => {
    if (params.get('dev') === '1') {
      try { localStorage.setItem('atlas.dev', '1'); } catch {}
    }
  }, [params]);

  // Auto-bypass on localhost / dev server
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) return true;
  if (import.meta.env.DEV) return true;
  if (params.get('dev') === '1') return true;
  try { return localStorage.getItem('atlas.dev') === '1'; } catch { return false; }
}

function tabFromPath(pathname) {
  if (pathname === '/app' || pathname.startsWith('/app/today') || pathname.startsWith('/app/insights') || pathname.startsWith('/app/diary') || pathname.startsWith('/app/weekly')) return 'today';
  if (pathname.startsWith('/app/workouts') || pathname.startsWith('/app/routines') || pathname.startsWith('/app/exercises')) return 'train';
  if (pathname.startsWith('/app/nutrition')) return 'eat';
  if (pathname.startsWith('/app/body') || pathname.startsWith('/app/labs')) return 'body';
  if (pathname.startsWith('/app/profile') || pathname.startsWith('/app/settings') || pathname.startsWith('/app/billing') || pathname.startsWith('/app/social')) return 'you';
  if (pathname.startsWith('/app/coach')) return 'today';
  if (pathname.startsWith('/app/v3/')) {
    const legacy = pathname.replace('/app/v3/', '');
    return ({ today: 'today', train: 'train', eat: 'eat', body: 'body', you: 'you' }[legacy]) || 'today';
  }
  return 'today';
}

function V3ShellInner() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const c = useACT(dark);
  const active = tabFromPath(location.pathname);
  const isDesktop = typeof window !== 'undefined' ? window.innerWidth >= 768 : true;

  return (
    <div
      data-v3
      style={{
        minHeight: '100dvh',
        background: dark
          ? 'radial-gradient(circle at top, #1c1a15 0%, #0a0a0a 56%)'
          : 'linear-gradient(180deg, #f6f1e3 0%, #e9e0c8 100%)',
        color: c.fg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: isDesktop ? 'center' : 'stretch',
        padding: isDesktop ? '16px' : '0',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: isDesktop ? 430 : '100%',
          height: isDesktop ? 'min(100dvh - 32px, 900px)' : '100dvh',
          background: c.bg,
          color: c.fg,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: isDesktop ? 38 : 0,
          border: isDesktop
            ? (dark
                ? '1px solid rgba(239,233,218,0.08)'
                : '1px solid rgba(10,10,10,0.08)')
            : 'none',
          boxShadow: isDesktop
            ? (dark
                ? '0 28px 72px rgba(0,0,0,0.45)'
                : '0 28px 72px rgba(40,30,20,0.18)')
            : 'none',
        }}
      >
        <div style={{ height: 'calc(env(safe-area-inset-top, 0px) + 6px)' }} />

        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <Outlet />
        </div>

        <ACTabBar
          active={active}
          dark={dark}
          HeartMarkComp={HeartMark}
          onChange={(k) => {
            const next = TAB_ROUTES[k];
            if (next && location.pathname !== next) navigate(next);
          }}
        />
      </div>
    </div>
  );
}

/**
 * Platform gate — redirects web users to /download-app for product routes.
 * Billing routes always pass. Dev mode (?dev=1 or localStorage) bypasses.
 */
function PlatformGate({ children }) {
  const location = useLocation();
  const isNative = Capacitor.isNativePlatform();
  const isDev = useDevMode();

  // Native always passes
  if (isNative) return children;

  // Dev mode bypasses the gate
  if (isDev) return children;

  // Billing routes are allowed on web
  if (isWebAllowedRoute(location.pathname)) return children;

  // All other product routes → redirect to download
  return <Navigate to="/download-app" replace />;
}

export default function V3AppShell() {
  return (
    <PaperThemeProvider>
      <PlatformGate>
        <V3ShellInner />
      </PlatformGate>
    </PaperThemeProvider>
  );
}
