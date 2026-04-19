/**
 * ServerError — generic "something broke" screen for unhandled errors.
 *
 * Shown at `/500` and wherever a render/network error bubbles up to the top.
 * Does NOT expose error internals to the user — never show a stack, never show
 * the raw message. If a support reference id is passed (`error.id`, e.g. from
 * Sentry), we surface that so support can correlate.
 *
 * Rules applied:
 *  - ZERO emojis — SVG alert glyph inline.
 *  - Brandmark (Logomark) in the top corner.
 *  - safe-area-inset via SafeScreen on all four sides.
 *  - TRUST RULE — never fabricate or expose server details.
 *  - Accepts `error` + `onRetry` — both optional. The route wrapper passes
 *    safe defaults (retry = window.location.reload).
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SafeScreen, SpringReveal, LiquidButton, Glass } from '../lib/glass';
import { Logomark, Wordmark } from '../marketing/MarketingShell';

/* ─── Alert glyph (line, stroke 1.75, currentColor) ──────────────────────── */

function AlertGlyph({ size = 28 }) {
  const s = {
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    fill: 'none',
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path {...s} d="M10.3 3.7L2.5 17.5a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0z" />
      <path {...s} d="M12 9v4.5" />
      <circle {...s} cx="12" cy="17" r="0.6" fill="currentColor" />
    </svg>
  );
}

const SUPPORT_EMAIL = 'support@useatlascore.com';

export default function ServerError({ error, onRetry, onContactSupport, onGoHome }) {
  const referenceId = (error && typeof error === 'object' && error.id) ? String(error.id) : null;

  const handleRetry = () => {
    if (typeof onRetry === 'function') onRetry();
    else if (typeof window !== 'undefined') window.location.reload();
  };

  const handleContact = () => {
    if (typeof onContactSupport === 'function') { onContactSupport(); return; }
    // Default: open a mailto: with a pre-filled subject containing the ref id.
    if (typeof window !== 'undefined') {
      const subject = encodeURIComponent(
        referenceId ? `atlas.core error — ref ${referenceId}` : 'atlas.core error',
      );
      window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}`;
    }
  };

  return (
    <SafeScreen paddingX={20}>
      <div
        aria-hidden
        style={{
          position: 'fixed', inset: 0, pointerEvents: 'none',
          background:
            'radial-gradient(60% 40% at 50% 20%, rgba(239,68,68,0.08) 0%, transparent 55%)',
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
          <div
            style={{
              width: 72, height: 72, borderRadius: 22,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(239,68,68,0.10)',
              border: '1px solid rgba(239,68,68,0.28)',
              color: 'rgb(252, 165, 165)',
            }}
          >
            <AlertGlyph size={32} />
          </div>
        </SpringReveal>

        <SpringReveal delay={120}>
          <h1
            style={{
              fontSize: 30, lineHeight: 1.15,
              fontWeight: 700, letterSpacing: '-0.025em',
              margin: 0, color: 'hsl(var(--rd-fg-primary))',
            }}
          >
            System error.
          </h1>
          <p
            style={{
              marginTop: 10, marginInline: 'auto', maxWidth: 400,
              fontSize: 15, lineHeight: 1.5,
              color: 'hsl(var(--rd-fg-secondary))',
            }}
          >
            Your local data is safe. We logged the problem and the team will
            look into it — please try again in a moment.
          </p>
        </SpringReveal>

        {referenceId && (
          <SpringReveal delay={180}>
            <Glass
              tint="neutral"
              radius="pill"
              style={{
                padding: '6px 12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span
                style={{
                  fontSize: 10, letterSpacing: '0.16em',
                  textTransform: 'uppercase', fontWeight: 700,
                  color: 'hsl(var(--rd-fg-muted))',
                }}
              >
                Reference ID
              </span>
              <span
                style={{
                  fontSize: 12, fontWeight: 600,
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  color: 'hsl(var(--rd-fg-primary))',
                  letterSpacing: '-0.01em',
                }}
              >
                {referenceId}
              </span>
            </Glass>
          </SpringReveal>
        )}

        <SpringReveal delay={220}>
          <div
            style={{
              display: 'flex', flexWrap: 'wrap', gap: 10,
              justifyContent: 'center', marginTop: 8,
            }}
          >
            <LiquidButton intent="primary" size="lg" onClick={handleRetry}>
              Try again
            </LiquidButton>
            <LiquidButton intent="neutral" size="lg" onClick={handleContact}>
              Contact support
            </LiquidButton>
            {onGoHome && (
              <LiquidButton intent="ghost" size="lg" onClick={onGoHome}>
                Go home
              </LiquidButton>
            )}
          </div>
        </SpringReveal>
      </div>
    </SafeScreen>
  );
}

export { ServerError };

/* ─── Route wrapper ─────────────────────────────────────────────────────── */

export function ServerErrorRoute() {
  const navigate = useNavigate();
  // No real error object is available at `/500` — the wrapper passes null so
  // the component shows the generic message (no reference id row).
  return (
    <ServerError
      error={null}
      onRetry={() => {
        if (typeof window !== 'undefined') window.location.reload();
      }}
      onGoHome={() => navigate('/')}
    />
  );
}
