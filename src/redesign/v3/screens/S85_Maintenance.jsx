import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACBtn, ACChip,
} from '../lib/paper.jsx';
import { HeartMark, Wordmark } from '../lib/brandMarks.jsx';

/**
 * S85_Maintenance — full-screen planned-maintenance state.
 *
 * Replaces the v2 Maintenance screen with the v3 paper+ink design system.
 * Static screen — no retry loop. Optional ETA display with defensive
 * formatting (handles null, invalid dates, strings, Date objects).
 *
 * Gallery:    <S85_Maintenance dark returnAt="2026-04-20T06:00:00Z" />
 * Production: Mounted by API middleware / feature flag when backend is down.
 *
 * @param {object}  props
 * @param {boolean} [props.dark=false]   — light/dark variant
 * @param {string|Date|number} [props.returnAt] — estimated return time
 * @param {string}  [props.statusUrl]    — link to status page
 */

/* ── Wrench SVG icon ────────────────────────────────────────────── */

function WrenchIcon({ size = 56, color, accent }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none" aria-hidden>
      {/* wrench body */}
      <path
        d="M35 10a13 13 0 0 0-11.2 18.4L10 42.2a4.5 4.5 0 0 0 6.4 6.4l13.8-13.8A13 13 0 0 0 48 22l-6.4 6.4-4.6-1.2-1.2-4.6L42 16.2A13 13 0 0 0 35 10Z"
        stroke={color}
        strokeWidth="2.4"
        strokeLinejoin="round"
        fill="none"
      />
      {/* bolt accent */}
      <circle cx="13.2" cy="45.2" r="2" fill={accent} />
    </svg>
  );
}

/* ── ETA formatting (defensive) ─────────────────────────────────── */

const STATUS_PAGE_URL = 'https://status.useatlascore.com';

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
      weekday: 'short',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  } catch {
    return date.toString();
  }
}

/* ── Amber color for maintenance warning ────────────────────────── */

const AMBER = '#d4a017';

/* ── Demo defaults ──────────────────────────────────────────────── */

const DEMO = {
  dark: false,
  returnAt: null,
  statusUrl: STATUS_PAGE_URL,
};

/* ── Component ──────────────────────────────────────────────────── */

function S85_Maintenance({
  dark = DEMO.dark,
  returnAt = DEMO.returnAt,
  statusUrl = DEMO.statusUrl,
}) {
  const c = useACT(dark);
  const eta = formatReturnAt(returnAt);

  const handleCheckStatus = () => {
    const url = statusUrl || STATUS_PAGE_URL;
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
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

      {/* icon container — amber tint */}
      <div
        style={{
          width: 88,
          height: 88,
          borderRadius: ACRadii.sheet,
          background: dark ? 'rgba(212,160,23,0.12)' : 'rgba(212,160,23,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
        }}
      >
        <WrenchIcon size={48} color={AMBER} accent={c.accent} />
      </div>

      {/* status pill — amber */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '5px 12px',
          background: dark ? 'rgba(212,160,23,0.16)' : 'rgba(212,160,23,0.12)',
          borderRadius: ACRadii.chip,
          marginBottom: 18,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: 999,
            background: AMBER,
          }}
        />
        <ACLabel
          size={11}
          color={AMBER}
          style={{ fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase' }}
        >
          Scheduled maintenance
        </ACLabel>
      </div>

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
        System maintenance.
      </div>

      {/* description */}
      <div
        style={{
          fontSize: 14,
          lineHeight: 1.55,
          color: c.dim,
          maxWidth: 300,
          marginBottom: 6,
        }}
      >
        We're performing a planned update. Everything will be back shortly.
      </div>

      {/* ETA (only if valid) */}
      {eta && (
        <div
          style={{
            marginTop: 6,
            marginBottom: 6,
            padding: '10px 18px',
            background: c.card,
            borderRadius: ACRadii.card,
            display: 'inline-flex',
            alignItems: 'baseline',
            gap: 8,
          }}
        >
          <ACLabel
            size={10}
            color={c.mute}
            style={{ fontFamily: ACFonts.mono, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' }}
          >
            ETA
          </ACLabel>
          <span
            style={{
              fontFamily: ACFonts.display,
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: -0.4,
              color: c.fg,
            }}
          >
            {eta}
          </span>
        </div>
      )}

      {/* reassurance */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginTop: 8,
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

      {/* action */}
      <div style={{ width: '100%', maxWidth: 320 }}>
        <ACBtn
          dark={dark}
          size="lg"
          pill
          block
          onClick={handleCheckStatus}
        >
          Check status
        </ACBtn>
      </div>
    </div>
  );
}

export default S85_Maintenance;
