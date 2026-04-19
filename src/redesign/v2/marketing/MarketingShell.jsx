/**
 * MarketingShell — shared chrome for all public marketing pages
 * (Landing, Pricing, Terms, Privacy, FAQ).
 *
 * Includes:
 *  - Sticky glass nav: logo (left) + nav links + sign-in button (right).
 *  - Scroll container with the page content.
 *  - Footer with product links, legal links, copyright.
 *
 * Rules applied:
 *  - ZERO emojis. SVG brandmark for the logo.
 *  - safe-area-inset aware top + bottom.
 *  - Same obsidian + cyan + violet + gold palette as the app.
 */
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * Viewport hook — lets us branch between desktop and mobile nav layouts
 * without a CSS file. Returns true when the viewport is at or below the bp.
 */
function useIsMobile(bp = 760) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia(`(max-width: ${bp - 1}px)`).matches,
  );
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const m = window.matchMedia(`(max-width: ${bp - 1}px)`);
    const h = () => setIsMobile(m.matches);
    h();
    m.addEventListener('change', h);
    return () => m.removeEventListener('change', h);
  }, [bp]);
  return isMobile;
}

/* ─── Brandmark (real atlas.core logomark + wordmark) ───────────────────── */

/**
 * Logomark — the official atlas.core mark. Heartbeat/pulse line that rises
 * into an up-right arrow.
 *
 * Two variants:
 *  - `gradient` (default on marketing): cyan → violet stroke, matches the
 *    AI accent gradient used elsewhere in the app. Highest-energy version.
 *  - `solid`: uses `currentColor` so the parent can tint it white, obsidian,
 *    or any single color (used on small favicons and sign-in / sign-up).
 *
 * Source: /public/brand/logomark.svg (1024×1024 viewBox — preserved here).
 */
export function Logomark({ size = 28, variant = 'gradient' }) {
  const gradientId = `atlasCoreLogomarkGradient-${size}`;
  const stroke = variant === 'gradient' ? `url(#${gradientId})` : 'currentColor';
  return (
    <svg
      width={size} height={size} viewBox="0 0 1024 1024"
      fill="none" aria-hidden
      style={{ flexShrink: 0, color: 'currentColor' }}
    >
      {variant === 'gradient' ? (
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="hsl(var(--rd-accent))" />
            <stop offset="100%" stopColor="#A78BFA" />
          </linearGradient>
        </defs>
      ) : null}
      <path
        d="M256 512H384L416 563.2L480 409.6L544 563.2L576 512H640L768 435.2"
        stroke={stroke} strokeWidth="56"
        strokeLinecap="round" strokeLinejoin="round"
      />
      <path
        d="M742.4 435.2H768V460.8"
        stroke={stroke} strokeWidth="56"
        strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Official wordmark — "atlas.core" in Inter 600, -0.02em tracking.
 *   - "atlas" is cyan (accent)
 *   - ".core"  is white (primary fg)
 */
export function Wordmark({ size = 18 }) {
  return (
    <span
      style={{
        fontSize: size,
        fontWeight: 600,
        letterSpacing: '-0.02em',
        lineHeight: 1,
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      <span style={{ color: 'hsl(var(--rd-accent))' }}>atlas</span>
      <span style={{ color: 'hsl(var(--rd-fg-primary))' }}>.core</span>
    </span>
  );
}

function Brandmark({ size = 28, asLink = true }) {
  // Mark sits next to a wordmark that's roughly 64–68% of the mark height.
  const wordSize = Math.round(size * 0.66);
  const inner = (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        color: 'hsl(var(--rd-fg-primary))',
      }}
    >
      <Logomark size={size} />
      <Wordmark size={wordSize} />
    </div>
  );
  if (!asLink) return inner;
  return (
    <Link to="/" style={{ textDecoration: 'none' }}>
      {inner}
    </Link>
  );
}

/* ─── Top nav ────────────────────────────────────────────────────────────── */

const NAV_LINKS = [
  { to: '/',         label: 'Home' },
  { to: '/pricing',  label: 'Pricing' },
  { to: '/faq',      label: 'FAQ' },
];

function TopNav() {
  const { pathname } = useLocation();
  const isMobile = useIsMobile(760);
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        paddingTop: 'calc(env(safe-area-inset-top) + 10px)',
        paddingBottom: 10,
        paddingInline: 'max(16px, env(safe-area-inset-left))',
        backgroundImage: 'linear-gradient(180deg, rgba(5,7,10,0.85) 0%, rgba(5,7,10,0.55) 100%)',
        backdropFilter: 'blur(22px) saturate(1.6)',
        WebkitBackdropFilter: 'blur(22px) saturate(1.6)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
      }}>
        <Brandmark size={isMobile ? 24 : 28} />
        <nav style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Text nav links hide on mobile to keep the two CTAs readable. */}
          {!isMobile && NAV_LINKS.map((l) => {
            const active = pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                style={{
                  padding: '8px 12px',
                  borderRadius: 9,
                  fontSize: 13, fontWeight: 600,
                  color: active ? 'hsl(var(--rd-fg-primary))' : 'hsl(var(--rd-fg-muted))',
                  textDecoration: 'none',
                  letterSpacing: '-0.005em',
                  background: active ? 'rgba(255,255,255,0.05)' : 'transparent',
                  transition: 'color 140ms, background 140ms',
                  whiteSpace: 'nowrap',
                }}
              >
                {l.label}
              </Link>
            );
          })}
          <Link
            to="/auth/login"
            style={{
              marginLeft: isMobile ? 0 : 10,
              padding: isMobile ? '7px 11px' : '9px 14px',
              borderRadius: 10,
              fontSize: isMobile ? 12 : 13, fontWeight: 700,
              color: 'hsl(var(--rd-fg-primary))',
              textDecoration: 'none',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.10)',
              letterSpacing: '-0.005em',
              whiteSpace: 'nowrap',
            }}
          >
            Sign in
          </Link>
          <Link
            to="/auth/signup"
            style={{
              marginLeft: 6,
              padding: isMobile ? '7px 12px' : '9px 16px',
              borderRadius: 10,
              fontSize: isMobile ? 12 : 13, fontWeight: 800,
              color: '#05070A',
              textDecoration: 'none',
              background: 'hsl(var(--rd-accent))',
              letterSpacing: '-0.005em',
              boxShadow: '0 4px 18px rgba(0,255,255,0.22)',
              whiteSpace: 'nowrap',
            }}
          >
            {isMobile ? 'Start' : 'Get started'}
          </Link>
        </nav>
      </div>
    </header>
  );
}

/* ─── Footer ─────────────────────────────────────────────────────────────── */

const FOOTER_COLS = [
  {
    title: 'Product',
    links: [
      { to: '/',         label: 'Home' },
      { to: '/pricing',  label: 'Pricing' },
      { to: '/faq',      label: 'FAQ' },
    ],
  },
  {
    title: 'Company',
    links: [
      { to: 'mailto:hello@useatlascore.com', label: 'Contact', external: true },
    ],
  },
  {
    title: 'Legal',
    links: [
      { to: '/terms',   label: 'Terms of Service' },
      { to: '/privacy', label: 'Privacy Policy' },
    ],
  },
];

function Footer() {
  return (
    <footer
      style={{
        marginTop: 80,
        paddingTop: 40,
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)',
        paddingInline: 'max(16px, env(safe-area-inset-left))',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(255,255,255,0.02)',
      }}
    >
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 32,
            marginBottom: 32,
          }}
        >
          <div>
            <Brandmark size={20} />
            <p style={{
              margin: '14px 0 0',
              fontSize: 13, color: 'hsl(var(--rd-fg-muted))',
              lineHeight: 1.6, maxWidth: 260,
            }}>
              Your AI-native fitness, nutrition, and longevity coach.
              Train smarter, eat smarter, live longer.
            </p>
          </div>
          {FOOTER_COLS.map((col) => (
            <div key={col.title}>
              <div style={{
                fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
                textTransform: 'uppercase', color: 'hsl(var(--rd-fg-muted))',
                marginBottom: 14,
              }}>
                {col.title}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.links.map((l) => (
                  l.external ? (
                    <a
                      key={l.to}
                      href={l.to}
                      style={{
                        fontSize: 13, color: 'hsl(var(--rd-fg-secondary))',
                        textDecoration: 'none',
                      }}
                    >
                      {l.label}
                    </a>
                  ) : (
                    <Link
                      key={l.to}
                      to={l.to}
                      style={{
                        fontSize: 13, color: 'hsl(var(--rd-fg-secondary))',
                        textDecoration: 'none',
                      }}
                    >
                      {l.label}
                    </Link>
                  )
                ))}
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            paddingTop: 20,
            borderTop: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
          }}
        >
          <div style={{ fontSize: 11.5, color: 'hsl(var(--rd-fg-muted))' }}>
            © {new Date().getFullYear()} atlas.core. All rights reserved.
          </div>
          <div style={{ fontSize: 11.5, color: 'hsl(var(--rd-fg-muted))' }}>
            Made for people who take their body seriously.
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─── Shell ──────────────────────────────────────────────────────────────── */

export default function MarketingShell({ children }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'hsl(var(--rd-bg))',
        color: 'hsl(var(--rd-fg-primary))',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <TopNav />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
export { MarketingShell, Brandmark };
