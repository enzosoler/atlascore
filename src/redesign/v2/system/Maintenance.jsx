/**
 * Maintenance — the app-wide planned-maintenance takeover.
 *
 * Shown at `/maintenance` when the API is down for a deploy / migration.
 * Pure static screen: no retry loop baked in (the API will resume on its own),
 * just a wrench icon, a line of copy, optional ETA, and a "Check status" link.
 *
 * Rules applied:
 *  - ZERO emojis — wrench is SVG, line stroke 1.75, currentColor.
 *  - Brandmark (Logomark + Wordmark) visible at top.
 *  - safe-area-inset via SafeScreen on all four sides.
 *  - Accepts null `returnAt` — falls back to honest "back soon" copy.
 */
import React from 'react';
import { SafeScreen, SpringReveal, LiquidButton, Glass } from '../lib/glass';
import { Logomark, Wordmark } from '../marketing/MarketingShell';

const STATUS_PAGE_URL = 'https://status.useatlascore.com';

/* ─── Wrench icon (line, stroke 1.75, currentColor) ──────────────────────── */

function WrenchIcon({ size = 28 }) {
  const s = {
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    fill: 'none',
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      {/*
       * Wrench: head + handle. Head is an open hex ring with a bite out so it
       * reads as a wrench rather than a ring. Handle is a rounded diagonal.
       */}
      <path
        {...s}
        d="M14.5 3.5a5 5 0 0 0-4.4 7.1l-7.4 7.4a1.8 1.8 0 0 0 2.5 2.5l7.4-7.4A5 5 0 0 0 20.5 9L18 11.5 15.5 10.5 14.5 8 17 5.5a5 5 0 0 0-2.5-2z"
      />
    </svg>
  );
}

/* ─── ETA formatting (defensive — handles string | Date | number | null) ── */

function formatReturnAt(returnAt) {
  if (returnAt == null) return null;
  let date;
  try {
    date = returnAt instanceof Date ? returnAt : new Date(returnAt);
    if (Number.isNaN(date.getTime())) return null;
  } catch {
    return null;
  }
  try {
    return new Intl.DateTimeFormat(undefined, {
      weekday: 'short', hour: 'numeric', minute: '2-digit',
    }).format(date);
  } catch {
    return date.toString();
  }
}

/* ─── Component ─────────────────────────────────────────────────────────── */

export default function Maintenance({ returnAt, statusUrl = STATUS_PAGE_URL }) {
  const eta = formatReturnAt(returnAt);
  return (
    <SafeScreen paddingX={20}>
      <div
        aria-hidden
        style={{
          position: 'fixed', inset: 0, pointerEvents: 'none',
          background:
            'radial-gradient(60% 40% at 50% 20%, rgba(245,158,11,0.08) 0%, transparent 55%)',
        }}
      />

      {/* Brandmark top-left */}
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
            tint="warning"
            radius="pill"
            style={{
              padding: '8px 14px',
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}
          >
            <span
              style={{
                width: 6, height: 6, borderRadius: 99,
                background: 'rgb(245, 158, 11)',
                boxShadow: '0 0 6px rgba(245,158,11,0.65)',
              }}
            />
            <span
              style={{
                fontSize: 11, letterSpacing: '0.14em',
                textTransform: 'uppercase', fontWeight: 700,
                color: 'rgb(251, 191, 36)',
              }}
            >
              Scheduled maintenance
            </span>
          </Glass>
        </SpringReveal>

        <SpringReveal delay={120}>
          <div
            style={{
              width: 72, height: 72, borderRadius: 22,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(245,158,11,0.10)',
              border: '1px solid rgba(245,158,11,0.28)',
              color: 'rgb(251, 191, 36)',
            }}
          >
            <WrenchIcon size={32} />
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
            System maintenance.
          </h1>
          <p
            style={{
              marginTop: 10, marginInline: 'auto', maxWidth: 380,
              fontSize: 15, lineHeight: 1.5,
              color: 'hsl(var(--rd-fg-secondary))',
            }}
          >
            Back shortly. Your data is safe — we&apos;re performing a planned
            update.
          </p>
          {eta && (
            <p
              style={{
                marginTop: 12, fontSize: 13,
                color: 'hsl(var(--rd-fg-muted))',
              }}
            >
              Estimated return:{' '}
              <span style={{ color: 'hsl(var(--rd-fg-primary))', fontWeight: 600 }}>
                {eta}
              </span>
            </p>
          )}
        </SpringReveal>

        <SpringReveal delay={240}>
          <LiquidButton
            as="a"
            href={statusUrl}
            target="_blank"
            rel="noopener noreferrer"
            intent="neutral"
            size="lg"
          >
            Check status
          </LiquidButton>
        </SpringReveal>
      </div>
    </SafeScreen>
  );
}

export { Maintenance };

/* ─── Route wrapper ─────────────────────────────────────────────────────── */

export function MaintenanceRoute() {
  // `returnAt` is not known from the URL alone; callers (API middleware,
  // feature flag) can mount <Maintenance returnAt={...} /> directly if they
  // have one. Visiting the bare /maintenance route just shows "back soon".
  return <Maintenance returnAt={null} />;
}
