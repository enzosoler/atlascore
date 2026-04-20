import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACBtn, ACChip,
} from '../lib/paper.jsx';
import { HeartMark, Wordmark } from '../lib/brandMarks.jsx';

/**
 * S86_Force_Update — full-screen hard gate when app version is too old.
 *
 * Replaces the v2 ForceUpdate screen with the v3 paper+ink design system.
 * No back button — intentional. The only way forward is to update.
 * Auto-detects platform for store URL when not explicitly provided.
 *
 * Gallery:    <S86_Force_Update dark features={['Faster sync engine', 'New body scanner']} />
 * Production: Mounted by version-check middleware when min version fails.
 *
 * @param {object}   props
 * @param {boolean}  [props.dark=false]    — light/dark variant
 * @param {string[]} [props.features]      — "What's new" list
 * @param {string}   [props.updateUrl]     — explicit store URL override
 * @param {string}   [props.platform]      — 'ios' | 'android' | 'web'
 */

/* ── Arrow-up SVG icon ──────────────────────────────────────────── */

function ArrowUpIcon({ size = 56, color, accent }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none" aria-hidden>
      {/* shaft */}
      <line
        x1="28" y1="44" x2="28" y2="16"
        stroke={color}
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      {/* arrowhead */}
      <path
        d="M16 26l12-14 12 14"
        stroke={color}
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* accent dot at tip */}
      <circle cx="28" cy="10" r="2.5" fill={accent} />
    </svg>
  );
}

/* ── Check mark for feature list ────────────────────────────────── */

function CheckIcon({ size = 14, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M2.5 7.5L5.5 10.5L11.5 4"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── Store URLs ─────────────────────────────────────────────────── */

const APP_STORE_URL  = 'https://apps.apple.com/app/atlas-core/id0000000000';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.atlascore.app';
const WEB_URL        = 'https://useatlascore.com';

function resolveUpdateUrl({ updateUrl, platform }) {
  if (updateUrl) return updateUrl;
  if (platform === 'ios')     return APP_STORE_URL;
  if (platform === 'android') return PLAY_STORE_URL;
  return WEB_URL;
}

function detectPlatform() {
  if (typeof window === 'undefined') return 'web';
  try {
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

/* ── Demo defaults ──────────────────────────────────────────────── */

const DEFAULT_FEATURES = [
  'Faster sync engine',
  'New body composition scanner',
  'Important security fixes',
];

const DEMO = {
  dark: false,
  features: DEFAULT_FEATURES,
};

/* ── Component ──────────────────────────────────────────────────── */

function S86_Force_Update({
  dark = DEMO.dark,
  features,
  updateUrl,
  platform: platformProp,
}) {
  const c = useACT(dark);
  const platform = platformProp || detectPlatform();
  const url = resolveUpdateUrl({ updateUrl, platform });
  const items = Array.isArray(features) && features.length > 0 ? features : DEFAULT_FEATURES;

  const handleUpdate = async () => {
    try {
      if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.()) {
        const mod = await import('@capacitor/browser');
        await mod.Browser.open({ url });
        return;
      }
    } catch { /* fall through */ }
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

      {/* icon container */}
      <div
        style={{
          width: 88,
          height: 88,
          borderRadius: ACRadii.sheet,
          background: dark ? 'rgba(232,181,0,0.10)' : 'rgba(232,181,0,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
        }}
      >
        <ArrowUpIcon size={48} color={c.accent} accent={c.accent} />
      </div>

      {/* status pill */}
      <ACChip
        dark={dark}
        accent
        dot
        style={{ marginBottom: 18 }}
      >
        Update required
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
        New version available.
      </div>

      {/* description */}
      <div
        style={{
          fontSize: 14,
          lineHeight: 1.55,
          color: c.dim,
          maxWidth: 300,
          marginBottom: 24,
        }}
      >
        Your version of atlas.core is out of date. Update to continue — it only takes a moment.
      </div>

      {/* what's new card */}
      <div
        style={{
          width: '100%',
          maxWidth: 320,
          background: c.card,
          borderRadius: ACRadii.card,
          padding: 18,
          textAlign: 'left',
          marginBottom: 28,
        }}
      >
        <ACLabel
          size={10}
          color={c.mute}
          style={{
            fontFamily: ACFonts.mono,
            fontWeight: 700,
            letterSpacing: 0.7,
            textTransform: 'uppercase',
            display: 'block',
            marginBottom: 12,
          }}
        >
          What's new
        </ACLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map((f, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 999,
                  background: dark ? 'rgba(232,181,0,0.14)' : 'rgba(232,181,0,0.10)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <CheckIcon size={12} color={c.accent} />
              </div>
              <span
                style={{
                  fontSize: 13.5,
                  fontWeight: 500,
                  color: c.fg,
                  letterSpacing: -0.1,
                  lineHeight: 1.35,
                }}
              >
                {f}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* action — NO back button (intentional hard gate) */}
      <div style={{ width: '100%', maxWidth: 320 }}>
        <ACBtn
          primary
          dark={dark}
          size="lg"
          pill
          block
          onClick={handleUpdate}
        >
          Update now
        </ACBtn>
      </div>
    </div>
  );
}

export default S86_Force_Update;
