/**
 * Offline — fullscreen takeover when the device loses connectivity.
 *
 * Shown at `/app/offline` (under the AppShell so chrome stays consistent).
 * Auto-detects online/offline via `window.navigator.onLine` + window events,
 * and when the connection is restored either auto-redirects (if the user
 * passes `autoRedirect`) or shows a "Back online — refresh?" CTA.
 *
 * Follow-up (NOT built here): a small persistent "offline" indicator in the
 * AppShell top chrome. For now, the Offline route is the only surface that
 * communicates this state. See the TODO in AppShell when we wire the banner.
 *
 * Rules applied:
 *  - ZERO emojis. WifiOff icon drawn inline in lib/icons.jsx style.
 *  - safe-area-inset via SafeScreen on all four sides.
 *  - Graceful with no handlers — `onRefresh` defaults to `window.location.reload`.
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SafeScreen, SpringReveal, LiquidButton, Glass } from '../lib/glass';

/* ─── WifiOff icon (line, stroke 1.75, currentColor) ─────────────────────── */

export function WifiOffIcon({ size = 18 }) {
  const s = {
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    fill: 'none',
  };
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" aria-hidden
    >
      {/* Three arcs — fainter-looking via shorter paths, but all at stroke 1.75 */}
      <path {...s} d="M3.5 8.5a14 14 0 0 1 6-3.5" />
      <path {...s} d="M14.5 5a14 14 0 0 1 6 3.5" />
      <path {...s} d="M6.5 12a10 10 0 0 1 3-1.8" />
      <path {...s} d="M14.5 10.2a10 10 0 0 1 3 1.8" />
      <path {...s} d="M9.5 15.5a5 5 0 0 1 5 0" />
      <circle {...s} cx="12" cy="19" r="0.6" fill="currentColor" />
      {/* The "off" slash */}
      <path {...s} d="M3 3l18 18" />
    </svg>
  );
}

/* ─── Hook: online/offline ──────────────────────────────────────────────── */

function useIsOnline() {
  const [online, setOnline] = useState(() =>
    typeof window !== 'undefined' && typeof window.navigator !== 'undefined'
      ? !!window.navigator.onLine
      : true,
  );
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const on  = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
  return online;
}

/* ─── Component ─────────────────────────────────────────────────────────── */

export default function Offline({
  autoRedirect = false,
  onRefresh,
  onGoBack,
}) {
  const online = useIsOnline();

  // Optional: auto-redirect (a best-effort reload) the instant the connection
  // comes back. Off by default so we don't yank the user around unless asked.
  useEffect(() => {
    if (!autoRedirect) return;
    if (!online) return;
    // Small delay so the user sees the "Back online" flicker.
    const t = setTimeout(() => {
      if (typeof onRefresh === 'function') onRefresh();
      else if (typeof window !== 'undefined') window.location.reload();
    }, 600);
    return () => clearTimeout(t);
  }, [online, autoRedirect, onRefresh]);

  const handleRefresh = () => {
    if (typeof onRefresh === 'function') onRefresh();
    else if (typeof window !== 'undefined') window.location.reload();
  };

  return (
    <SafeScreen paddingX={20}>
      <div
        aria-hidden
        style={{
          position: 'fixed', inset: 0, pointerEvents: 'none',
          background:
            'radial-gradient(60% 40% at 50% 30%, rgba(0,255,255,0.06) 0%, transparent 60%)',
        }}
      />
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 460,
          margin: '0 auto',
          minHeight:
            'calc(100svh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 32px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          gap: 22,
        }}
      >
        <SpringReveal delay={40}>
          <Glass
            tint={online ? 'accent' : 'neutral'}
            radius="pill"
            style={{
              padding: '8px 14px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span
              style={{
                width: 8, height: 8, borderRadius: 99,
                background: online ? 'hsl(var(--rd-accent))' : 'rgba(255,255,255,0.35)',
                boxShadow: online ? '0 0 8px hsl(var(--rd-accent))' : 'none',
              }}
            />
            <span
              style={{
                fontSize: 11, letterSpacing: '0.14em',
                textTransform: 'uppercase', fontWeight: 700,
                color: online ? 'hsl(var(--rd-accent))' : 'hsl(var(--rd-fg-muted))',
              }}
            >
              {online ? 'Back online' : 'No connection'}
            </span>
          </Glass>
        </SpringReveal>

        <SpringReveal delay={120}>
          <div
            style={{
              width: 64, height: 64,
              borderRadius: 20,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'hsl(var(--rd-fg-primary))',
            }}
          >
            <WifiOffIcon size={28} />
          </div>
        </SpringReveal>

        <SpringReveal delay={180}>
          <h1
            style={{
              fontSize: 30, lineHeight: 1.15,
              fontWeight: 700, letterSpacing: '-0.025em',
              margin: 0, color: 'hsl(var(--rd-fg-primary))',
            }}
          >
            {online ? "You're back online." : 'System offline.'}
          </h1>
          <p
            style={{
              marginTop: 10, marginInline: 'auto', maxWidth: 380,
              fontSize: 15, lineHeight: 1.5,
              color: 'hsl(var(--rd-fg-secondary))',
            }}
          >
            {online
              ? 'Your connection is restored. Refresh to pick up any new data.'
              : 'Your data is cached locally. Sync will resume automatically once you\u2019re back online.'}
          </p>
        </SpringReveal>

        <SpringReveal delay={240}>
          <div
            style={{
              display: 'flex', flexWrap: 'wrap', gap: 10,
              justifyContent: 'center', marginTop: 8,
            }}
          >
            {online ? (
              <LiquidButton intent="primary" size="lg" onClick={handleRefresh}>
                Refresh
              </LiquidButton>
            ) : (
              <LiquidButton intent="neutral" size="lg" onClick={handleRefresh}>
                Try again
              </LiquidButton>
            )}
            {onGoBack && (
              <LiquidButton intent="ghost" size="lg" onClick={onGoBack}>
                Back
              </LiquidButton>
            )}
          </div>
        </SpringReveal>
      </div>
    </SafeScreen>
  );
}

export { Offline };

/* ─── Route wrapper ─────────────────────────────────────────────────────── */

export function OfflineRoute() {
  const navigate = useNavigate();
  return (
    <Offline
      autoRedirect={false}
      onRefresh={() => {
        if (typeof window !== 'undefined') window.location.reload();
      }}
      onGoBack={() => navigate(-1)}
    />
  );
}
