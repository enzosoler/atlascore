/**
 * v3 app shell — wraps the paper+ink+amber screens with a real React Router
 * outlet and a persistent bottom tab bar.
 *
 * Platform gate delegated to the canonical PlatformGate component
 * (CLAUDE.md §12–15).
 *
 * Feature flag: NAV_5TAB
 *   - Controlled via localStorage key 'atlas.flag.nav5tab' (set to '1' to enable)
 *     or env VITE_FLAG_NAV_5TAB=1 at build time.
 *   - When disabled, falls back to the legacy 6-tab layout (coach tab restored).
 *   - Intended for A/B testing the 5-tab restructure.
 */

import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { PaperThemeProvider, ACTabBar, ACFonts, ACBrand, useACT } from '../lib/paper.jsx';
import { HeartMark } from '../lib/brandMarks.jsx';
import { useTheme } from '@/lib/ThemeContext';
import { PlatformGate } from '../lib/PlatformGate.jsx';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useT } from '@/lib/i18nContext';

// ── Feature flag: 5-tab nav ───────────────────────────────────────────────────
// Enable via: localStorage.setItem('atlas.flag.nav5tab', '1')  — or —
// build with VITE_FLAG_NAV_5TAB=1 to hard-enable for a variant build.
function isNav5TabEnabled() {
  if (import.meta.env.VITE_FLAG_NAV_5TAB === '1') return true;
  try {
    return localStorage.getItem('atlas.flag.nav5tab') === '1';
  } catch {
    return false;
  }
}

// ── 5-tab routing table ───────────────────────────────────────────────────────
const TAB_ROUTES_5 = {
  today:     '/app/today',
  workouts:  '/app/workouts',
  nutrition: '/app/nutrition',
  body:      '/app/body',
  profile:   '/app/profile',
};

// ── Legacy 6-tab routing table (kept for fallback) ───────────────────────────
const TAB_ROUTES_6 = {
  today:     '/app/today',
  workouts:  '/app/workouts',
  nutrition: '/app/nutrition',
  coach:     '/app/coach',
  profile:   '/app/profile',
};

function tabFromPath5(pathname) {
  if (pathname === '/app' || pathname.startsWith('/app/today') || pathname.startsWith('/app/insights') || pathname.startsWith('/app/diary') || pathname.startsWith('/app/weekly')) return 'today';
  if (pathname.startsWith('/app/workouts') || pathname.startsWith('/app/routines') || pathname.startsWith('/app/exercises')) return 'workouts';
  if (pathname.startsWith('/app/nutrition')) return 'nutrition';
  // body tab absorbs labs, protocols, sleep, watch
  if (
    pathname.startsWith('/app/body') ||
    pathname.startsWith('/app/labs') ||
    pathname.startsWith('/app/protocols') ||
    pathname.startsWith('/app/sleep') ||
    pathname.startsWith('/app/watch')
  ) return 'body';
  // coach routes no longer have a tab — today stays active
  if (pathname.startsWith('/app/coach')) return 'today';
  if (
    pathname.startsWith('/app/profile') ||
    pathname.startsWith('/app/settings') ||
    pathname.startsWith('/app/social')
  ) return 'profile';
  if (pathname.startsWith('/app/v3/')) {
    const legacy = pathname.replace('/app/v3/', '');
    return ({ today: 'today', train: 'workouts', eat: 'nutrition', body: 'body', you: 'profile' }[legacy]) || 'today';
  }
  return 'today';
}

function tabFromPath6(pathname) {
  if (pathname === '/app' || pathname.startsWith('/app/today') || pathname.startsWith('/app/insights') || pathname.startsWith('/app/diary') || pathname.startsWith('/app/weekly')) return 'today';
  if (pathname.startsWith('/app/workouts') || pathname.startsWith('/app/routines') || pathname.startsWith('/app/exercises')) return 'workouts';
  if (pathname.startsWith('/app/nutrition')) return 'nutrition';
  if (pathname.startsWith('/app/coach')) return 'coach';
  if (
    pathname.startsWith('/app/profile') ||
    pathname.startsWith('/app/settings') ||
    pathname.startsWith('/app/social') ||
    pathname.startsWith('/app/body') ||
    pathname.startsWith('/app/labs') ||
    pathname.startsWith('/app/protocols') ||
    pathname.startsWith('/app/watch')
  ) return 'profile';
  if (pathname.startsWith('/app/v3/')) {
    const legacy = pathname.replace('/app/v3/', '');
    return ({ today: 'today', train: 'workouts', eat: 'nutrition', body: 'profile', you: 'profile' }[legacy]) || 'today';
  }
  return 'today';
}

function V3ShellInner() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const c = useACT(dark);
  const isDesktop = typeof window !== 'undefined' ? window.innerWidth >= 768 : true;
  const { isOnline } = useOnlineStatus();
  const t = useT();

  // Read flag once on mount (stable for the lifetime of the shell).
  const nav5tab = React.useMemo(() => isNav5TabEnabled(), []);
  const TAB_ROUTES = nav5tab ? TAB_ROUTES_5 : TAB_ROUTES_6;
  const active = nav5tab ? tabFromPath5(location.pathname) : tabFromPath6(location.pathname);

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

        {!isOnline && (
          <div style={{
            background: '#e8b500',
            color: '#0a0a0a',
            textAlign: 'center',
            padding: '6px 12px',
            fontSize: 12,
            fontWeight: 600,
            fontFamily: ACFonts.body,
          }}>
            {t('status.noInternetConnection')}
          </div>
        )}

        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <Outlet />
        </div>

        <ACTabBar
          active={active}
          dark={dark}
          HeartMarkComp={HeartMark}
          onChange={(k) => {
            const next = TAB_ROUTES[k];
            if (!next) return;
            // Per iOS platform convention: tapping an active tab resets its
            // stack to root. Tapping a different tab also navigates to root
            // of that tab (not into a sub-screen).
            navigate(next, { replace: location.pathname === next });
          }}
        />
      </div>
    </div>
  );
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
