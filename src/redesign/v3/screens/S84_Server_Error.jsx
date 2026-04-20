import React from 'react';
import {
  ACFonts, ACRadii, useACT, ACBrand,
  ACLabel, ACBtn, ACChip,
} from '../lib/paper.jsx';
import { HeartMark, Wordmark } from '../lib/brandMarks.jsx';

/**
 * S84_Server_Error — full-screen server error state.
 *
 * Replaces the v2 ServerError screen with the v3 paper+ink design system.
 * Shows a reference ID (Sentry correlation) when available, reassures the
 * user their data is safe, and offers retry / support / home actions.
 *
 * Gallery:    <S84_Server_Error dark errorId="REF-a8f3c1" />
 * Production: Mounted by error boundaries or API middleware on 5xx.
 *
 * @param {object}   props
 * @param {boolean}  [props.dark=false]        — light/dark variant
 * @param {string}   [props.errorId]           — Sentry reference ID
 * @param {function} [props.onRetry]           — retry handler
 * @param {function} [props.onContactSupport]  — support handler
 * @param {function} [props.onGoHome]          — optional home nav
 */

/* ── Alert triangle SVG ─────────────────────────────────────────── */

function AlertTriangleIcon({ size = 56, color, accent }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none" aria-hidden>
      <path
        d="M28 8L4 48h48L28 8Z"
        stroke={color}
        strokeWidth="2.4"
        strokeLinejoin="round"
        fill="none"
      />
      <line
        x1="28" y1="22" x2="28" y2="34"
        stroke={color}
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <circle cx="28" cy="40" r="2" fill={accent} />
    </svg>
  );
}

/* ── Demo defaults ──────────────────────────────────────────────── */

const SUPPORT_EMAIL = 'support@useatlascore.com';

const DEMO = {
  dark: false,
  errorId: 'REF-a8f3c1',
  onRetry: () => {
    if (typeof window !== 'undefined') window.location.reload();
  },
  onContactSupport: null,
  onGoHome: null,
};

/* ── Component ──────────────────────────────────────────────────── */

function S84_Server_Error({
  dark = DEMO.dark,
  errorId = DEMO.errorId,
  onRetry,
  onContactSupport,
  onGoHome,
}) {
  const c = useACT(dark);
  const errColor = ACBrand.error;

  const safeRetry = typeof onRetry === 'function' ? onRetry : DEMO.onRetry;

  const handleContact = () => {
    if (typeof onContactSupport === 'function') {
      onContactSupport();
      return;
    }
    if (typeof window !== 'undefined') {
      const subject = encodeURIComponent(
        errorId ? `atlas.core error — ref ${errorId}` : 'atlas.core error',
      );
      window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}`;
    }
  };

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: c.bg,
        color: c.fg,
        minHeight: '100dvh',
        padding: '40px 24px',
        textAlign: 'center',
        position: 'relative',
      }}
    >
      {/* brand watermark — top center */}
      <div
        style={{
          position: 'absolute',
          top: 'calc(16px + env(safe-area-inset-top, 0px))',
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: 0.5 }}>
          <HeartMark size={18} color={c.fg} accent={c.accent} />
          <Wordmark size={12} color={c.fg} accent={c.accent} />
        </div>
      </div>

      {/* icon container */}
      <div
        style={{
          width: 88,
          height: 88,
          borderRadius: ACRadii.sheet,
          background: dark ? 'rgba(198,91,75,0.12)' : 'rgba(198,91,75,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
        }}
      >
        <AlertTriangleIcon size={48} color={errColor} accent={c.accent} />
      </div>

      {/* reference ID pill */}
      {errorId && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 12px',
            background: c.card,
            borderRadius: ACRadii.chip,
            marginBottom: 18,
          }}
        >
          <ACLabel
            size={9}
            color={c.mute}
            style={{ fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' }}
          >
            REF
          </ACLabel>
          <ACLabel
            size={11}
            color={c.fg}
            style={{ fontFamily: ACFonts.mono, fontWeight: 600, letterSpacing: 0.3 }}
          >
            {errorId}
          </ACLabel>
        </div>
      )}

      {/* headline */}
      <div
        style={{
          fontFamily: ACFonts.display,
          fontSize: 30,
          fontWeight: 700,
          letterSpacing: -1.2,
          lineHeight: 1.05,
          color: c.fg,
          marginBottom: 10,
        }}
      >
        Something broke.
      </div>

      {/* description */}
      <div
        style={{
          fontSize: 14,
          lineHeight: 1.55,
          color: c.dim,
          maxWidth: 300,
          marginBottom: 8,
        }}
      >
        We hit a server error. The problem has been logged and the team is on it.
      </div>

      {/* reassurance */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 32,
        }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path
            d="M6 1a3.5 3.5 0 0 0-3.5 3.5V6h-.25A1.25 1.25 0 0 0 1 7.25v3.5C1 11.44 1.56 12 2.25 12h7.5c.69 0 1.25-.56 1.25-1.25v-3.5C11 6.56 10.44 6 9.75 6H9.5V4.5A3.5 3.5 0 0 0 6 1Zm0 1.2A2.3 2.3 0 0 1 8.3 4.5V6H3.7V4.5A2.3 2.3 0 0 1 6 2.2Z"
            fill={c.mute}
          />
        </svg>
        <ACLabel size={11} color={c.mute} style={{ fontFamily: ACFonts.mono, letterSpacing: 0.4 }}>
          Your data is safe
        </ACLabel>
      </div>

      {/* actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 320 }}>
        <ACBtn
          primary
          dark={dark}
          size="lg"
          pill
          block
          onClick={safeRetry}
        >
          Try again
        </ACBtn>

        <ACBtn
          dark={dark}
          size="md"
          pill
          block
          onClick={handleContact}
        >
          Contact support
        </ACBtn>

        {onGoHome && (
          <button
            type="button"
            onClick={onGoHome}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '8px 0',
              textAlign: 'center',
            }}
          >
            <ACLabel
              size={12}
              color={c.dim}
              style={{ fontFamily: ACFonts.mono, letterSpacing: 0.3, textTransform: 'uppercase' }}
            >
              Go home
            </ACLabel>
          </button>
        )}
      </div>
    </div>
  );
}

export default S84_Server_Error;
