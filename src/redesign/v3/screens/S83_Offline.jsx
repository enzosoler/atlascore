import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACBtn, ACChip,
} from '../lib/paper.jsx';
import { HeartMark, Wordmark } from '../lib/brandMarks.jsx';

/**
 * S83_Offline — full-screen offline / no-connection state.
 *
 * Replaces the v2 Offline screen with the v3 paper+ink design system.
 * Adapts its copy when the connection comes back (`isOnline`).
 *
 * Gallery:    <S83_Offline dark />
 * Production: Mounted by the shell when navigator.onLine === false.
 *
 * @param {object}   props
 * @param {boolean}  [props.dark=false]     — light/dark variant
 * @param {boolean}  [props.isOnline=false] — true when connection restored
 * @param {function} [props.onRefresh]      — retry / refresh handler
 * @param {function} [props.onGoBack]       — optional secondary back nav
 */

/* ── WiFi-off SVG icon ──────────────────────────────────────────── */

function WifiOffIcon({ size = 56, color, accent }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none" aria-hidden>
      {/* outer arc */}
      <path
        d="M8 22a28 28 0 0 1 40 0"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity="0.35"
      />
      {/* middle arc */}
      <path
        d="M14 29a20 20 0 0 1 28 0"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity="0.55"
      />
      {/* inner arc */}
      <path
        d="M20 36a12 12 0 0 1 16 0"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity="0.75"
      />
      {/* dot */}
      <circle cx="28" cy="43" r="2.5" fill={accent} />
      {/* slash */}
      <line
        x1="10" y1="10" x2="46" y2="46"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ── Demo defaults ──────────────────────────────────────────────── */

const DEMO = {
  dark: false,
  isOnline: false,
  onRefresh: () => {
    if (typeof window !== 'undefined') window.location.reload();
  },
};

/* ── Component ──────────────────────────────────────────────────── */

function S83_Offline({
  dark = DEMO.dark,
  isOnline = DEMO.isOnline,
  onRefresh,
  onGoBack,
}) {
  const c = useACT(dark);
  const safeRefresh = typeof onRefresh === 'function' ? onRefresh : DEMO.onRefresh;

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
          background: c.card,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
        }}
      >
        <WifiOffIcon size={48} color={c.fg} accent={c.accent} />
      </div>

      {/* status pill */}
      <ACChip
        dark={dark}
        accent={isOnline}
        dot
        style={{
          marginBottom: 18,
          background: isOnline ? c.accent : c.card,
          color: isOnline ? c.ink : c.mute,
        }}
      >
        {isOnline ? 'Back online' : 'Offline'}
      </ACChip>

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
        {isOnline ? "You're back." : 'No connection.'}
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
        {isOnline
          ? 'Connection restored. Refresh to sync any pending data.'
          : 'Your data is cached locally. Sync resumes automatically once you reconnect.'}
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
          onClick={safeRefresh}
        >
          {isOnline ? 'Refresh' : 'Try again'}
        </ACBtn>

        {onGoBack && (
          <ACBtn
            dark={dark}
            size="md"
            pill
            block
            onClick={onGoBack}
          >
            Go back
          </ACBtn>
        )}
      </div>
    </div>
  );
}

export default S83_Offline;
