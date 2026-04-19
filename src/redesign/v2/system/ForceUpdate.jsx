/**
 * ForceUpdate — hard gate shown when the user's app version is too old.
 *
 * When the API refuses requests because of a minimum-version check (or a
 * breaking migration landed), the shell mounts this screen. There is NO back
 * button — this is intentional. The only way forward is to update.
 *
 * Rules applied:
 *  - ZERO emojis — inline SVG for the upward-arrow glyph.
 *  - Brandmark visible (Logomark + Wordmark).
 *  - safe-area-inset via SafeScreen on all four sides.
 *  - No dismiss. No back. No skip.
 *  - App Store / Play Store deep links — Capacitor Browser if available,
 *    falls back to window.open on web.
 */
import React from 'react';
import { SafeScreen, SpringReveal, LiquidButton, Glass } from '../lib/glass';
import { Logomark, Wordmark } from '../marketing/MarketingShell';

/* ─── Store URLs (real atlas.core listings) ─────────────────────────────── */

const APP_STORE_URL  = 'https://apps.apple.com/app/atlas-core/id0000000000';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.atlascore.app';
const WEB_URL        = 'https://useatlascore.com';

/* ─── Glyph ─────────────────────────────────────────────────────────────── */

function ArrowUpGlyph({ size = 32 }) {
  const s = {
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    fill: 'none',
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path {...s} d="M12 20V5" />
      <path {...s} d="M5 12l7-7 7 7" />
    </svg>
  );
}

function CheckGlyph({ size = 14 }) {
  const s = {
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    fill: 'none',
  };
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden>
      <path {...s} d="M3 8.5L6.5 12L13 4.5" />
    </svg>
  );
}

/* ─── Platform detection + store link ────────────────────────────────────── */

/**
 * Resolve the best "update" URL for the current platform.
 * Priority order:
 *   1. explicit `updateUrl` prop (lets the caller override per-tenant)
 *   2. iOS native → App Store
 *   3. Android native → Play Store
 *   4. web → useatlascore.com (so users can install the PWA or native app)
 */
function resolveUpdateUrl({ updateUrl, platform }) {
  if (updateUrl) return updateUrl;
  if (platform === 'ios')     return APP_STORE_URL;
  if (platform === 'android') return PLAY_STORE_URL;
  return WEB_URL;
}

function detectPlatform() {
  if (typeof window === 'undefined') return 'web';
  try {
    // Prefer Capacitor when available — truthy regardless of native build
    // because we may run in a Capacitor dev server too.
    const Cap = window.Capacitor;
    if (Cap && typeof Cap.getPlatform === 'function') {
      const p = Cap.getPlatform();
      if (p === 'ios' || p === 'android' || p === 'web') return p;
    }
  } catch { /* non-fatal */ }
  const ua = (typeof navigator !== 'undefined' && navigator.userAgent) || '';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  if (/Android/i.test(ua))           return 'android';
  return 'web';
}

/* ─── Component ─────────────────────────────────────────────────────────── */

export default function ForceUpdate({
  features,
  updateUrl,
  platform: platformProp,
}) {
  const platform = platformProp || detectPlatform();
  const url = resolveUpdateUrl({ updateUrl, platform });

  const defaultFeatures = [
    'Performance improvements',
    'New features and refinements',
    'Important security fixes',
  ];
  const items = Array.isArray(features) && features.length > 0 ? features : defaultFeatures;

  const handleUpdate = async () => {
    // Prefer Capacitor's in-app browser when available so we don't punt out of
    // the app on iOS. Dynamic import so this module is usable in server/SSR.
    try {
      if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.()) {
        const mod = await import('@capacitor/browser');
        await mod.Browser.open({ url });
        return;
      }
    } catch { /* fall through to window.open */ }
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <SafeScreen paddingX={20}>
      <div
        aria-hidden
        style={{
          position: 'fixed', inset: 0, pointerEvents: 'none',
          background:
            'radial-gradient(60% 40% at 50% 20%, rgba(0,255,255,0.10) 0%, transparent 55%)',
        }}
      />

      {/* Brandmark top-left — still visible on a hard gate so the user sees
          where they are. No nav links; brandmark is non-interactive here. */}
      <div
        style={{
          position: 'relative', zIndex: 2,
          display: 'flex', alignItems: 'center', gap: 8,
          paddingTop: 4,
        }}
      >
        <Logomark size={24} />
        <Wordmark size={15} />
      </div>

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 480,
          margin: '0 auto',
          minHeight:
            'calc(100svh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 80px)',
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
            tint="accent"
            radius="pill"
            style={{
              padding: '8px 14px',
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}
          >
            <span
              style={{
                width: 6, height: 6, borderRadius: 99,
                background: 'hsl(var(--rd-accent))',
                boxShadow: '0 0 6px hsl(var(--rd-accent))',
              }}
            />
            <span
              style={{
                fontSize: 11, letterSpacing: '0.14em',
                textTransform: 'uppercase', fontWeight: 700,
                color: 'hsl(var(--rd-accent))',
              }}
            >
              Update required
            </span>
          </Glass>
        </SpringReveal>

        <SpringReveal delay={120}>
          <div
            style={{
              width: 72, height: 72, borderRadius: 22,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,255,255,0.10)',
              border: '1px solid rgba(0,255,255,0.28)',
              color: 'hsl(var(--rd-accent))',
            }}
          >
            <ArrowUpGlyph size={32} />
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
            Update required.
          </h1>
          <p
            style={{
              marginTop: 10, marginInline: 'auto', maxWidth: 380,
              fontSize: 15, lineHeight: 1.5,
              color: 'hsl(var(--rd-fg-secondary))',
            }}
          >
            Your version of atlas.core is out of date. Please update to
            continue — it only takes a moment.
          </p>
        </SpringReveal>

        <SpringReveal delay={220}>
          <Glass
            tint="neutral"
            radius="lg"
            style={{
              padding: 16,
              width: '100%',
              maxWidth: 360,
              textAlign: 'left',
            }}
          >
            <div
              style={{
                fontSize: 11, letterSpacing: '0.14em',
                textTransform: 'uppercase', fontWeight: 700,
                color: 'hsl(var(--rd-fg-muted))',
                marginBottom: 10,
              }}
            >
              What&apos;s new
            </div>
            <ul
              style={{
                listStyle: 'none', padding: 0, margin: 0,
                display: 'flex', flexDirection: 'column', gap: 8,
              }}
            >
              {items.map((f) => (
                <li
                  key={f}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    fontSize: 14, lineHeight: 1.4,
                    color: 'hsl(var(--rd-fg-primary))',
                  }}
                >
                  <span
                    style={{
                      width: 20, height: 20, borderRadius: 99,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      background: 'rgba(0,255,255,0.12)',
                      color: 'hsl(var(--rd-accent))',
                      flexShrink: 0,
                    }}
                  >
                    <CheckGlyph size={12} />
                  </span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </Glass>
        </SpringReveal>

        <SpringReveal delay={280}>
          <LiquidButton intent="primary" size="lg" onClick={handleUpdate}>
            Update now
          </LiquidButton>
        </SpringReveal>
      </div>
    </SafeScreen>
  );
}

export { ForceUpdate };

/* ─── Route wrapper ─────────────────────────────────────────────────────── */

export function ForceUpdateRoute() {
  // Platform + features are intentionally not derived from the URL — the
  // screen auto-detects. A later session can wire a version check that mounts
  // <ForceUpdate features={diff.features} /> from the remote config response.
  return <ForceUpdate />;
}
