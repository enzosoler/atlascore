import React from 'react';
import { Link } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { PaperThemeProvider, useACT, ACBrand, ACFonts } from '../lib/paper.jsx';
import { HeartMark } from '../lib/brandMarks.jsx';
import { useTheme } from '@/lib/ThemeContext';
import { useI18n } from '@/lib/i18nContext';
import { useDevMode } from '../lib/PlatformGate.jsx';

/**
 * V3StandaloneLayout — frame for surfaces that live outside V3AppShell
 * (auth screens, welcome, onboarding paywall).
 *
 * Behavior:
 *   - Native (Capacitor) OR dev mode → phone-frame preview (430 × 900).
 *     This mirrors what the user actually sees in the app, so we keep
 *     the same chrome in dev too for realism.
 *   - Public web              → web layout: logo + locale toggle header,
 *     centered content card, small footer. CLAUDE.md §13–16 says web is
 *     not a mobile phone frame — it's a conversion/billing surface. Auth
 *     is a needed web function, but it should feel like a web page.
 */

function LocaleToggle() {
  const { locale, switchLocale } = useI18n();
  const isPT = locale === 'pt-BR';
  const btn = (active, label, value) => (
    <button
      key={value}
      type="button"
      onClick={() => { if (!active) switchLocale(value); }}
      style={{
        padding: '6px 10px',
        background: active ? ACBrand.ink : 'transparent',
        color: active ? ACBrand.paper : ACBrand.ink,
        border: 'none',
        fontFamily: ACFonts.mono, fontSize: 11, letterSpacing: 0.6,
        textTransform: 'uppercase', fontWeight: 700,
        cursor: active ? 'default' : 'pointer', borderRadius: 999,
      }}
      aria-pressed={active}
      aria-label={`Switch language to ${label}`}
    >{label}</button>
  );
  return (
    <div role="group" aria-label="Language" style={{
      display: 'inline-flex', alignItems: 'center', padding: 2,
      border: '1px solid rgba(10,10,10,0.14)', borderRadius: 999,
    }}>
      {btn(!isPT, 'EN', 'en')}
      {btn(isPT,  'PT', 'pt-BR')}
    </div>
  );
}

/** Phone-frame chrome — native & dev-mode experience. */
function PhoneFrameInner({ children }) {
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const c = useACT(dark);
  const isDesktop = typeof window !== 'undefined' ? window.innerWidth >= 768 : true;

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: dark
          ? 'radial-gradient(circle at top, #1c1a15 0%, #0a0a0a 56%)'
          : 'linear-gradient(180deg, #f6f1e3 0%, #e9e0c8 100%)',
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
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
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
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 6px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          boxSizing: 'border-box',
        }}
      >
        {children}
      </div>
    </div>
  );
}

/** Web chrome — marketing-style header, centered card, footer. */
function WebFrameInner({ children }) {
  return (
    <div style={{
      minHeight: '100dvh',
      background: ACBrand.paper,
      color: ACBrand.ink,
      fontFamily: ACFonts.body,
      display: 'flex',
      flexDirection: 'column',
    }}>
      <style>{`
        @media (max-width: 680px) {
          .ac-webauth-pad { padding-left: 20px !important; padding-right: 20px !important; }
        }
      `}</style>

      {/* Header */}
      <div className="ac-webauth-pad" style={{
        display: 'flex', alignItems: 'center', gap: 28,
        padding: '22px 56px',
        borderBottom: '1px solid rgba(10,10,10,0.10)',
      }}>
        <Link to="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          color: ACBrand.ink, textDecoration: 'none',
        }}>
          <HeartMark size={34} stroke={2} />
          <span style={{ fontFamily: ACFonts.brand, fontSize: 22, letterSpacing: -0.5, textTransform: 'lowercase' }}>
            atlas.<span style={{ color: ACBrand.accent }}>core</span>
          </span>
        </Link>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <LocaleToggle />
          <Link to="/download-app" style={{
            fontFamily: ACFonts.mono, fontSize: 11, letterSpacing: 0.6,
            textTransform: 'uppercase', fontWeight: 700,
            color: ACBrand.ink, textDecoration: 'none',
          }}>Get the app</Link>
        </div>
      </div>

      {/* Centered content card */}
      <div className="ac-webauth-pad" style={{
        flex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '48px 56px 64px',
      }}>
        <div style={{
          width: '100%', maxWidth: 480,
          background: ACBrand.paper,
          color: ACBrand.ink,
          borderRadius: 28,
          border: '1px solid rgba(10,10,10,0.08)',
          boxShadow: '0 24px 64px rgba(40,30,20,0.10)',
          padding: 40,
          display: 'flex', flexDirection: 'column',
          minHeight: 520,
        }}>
          {children}
        </div>
      </div>

      {/* Footer */}
      <div className="ac-webauth-pad" style={{
        padding: '24px 56px 32px',
        borderTop: '1px solid rgba(10,10,10,0.10)',
        textAlign: 'center',
        fontFamily: ACFonts.mono, fontSize: 11, letterSpacing: 0.4,
        color: 'rgba(10,10,10,0.50)',
      }}>
        atlas.core is built for mobile. This is the account and billing layer.
      </div>
    </div>
  );
}

function V3StandaloneInner({ children }) {
  const isNative = Capacitor.isNativePlatform();
  const isDev = useDevMode();

  // Dev mode (localhost / ?dev=1) keeps the phone-frame preview so internal
  // QA can test mobile surfaces inside a regular desktop browser.
  if (isNative || isDev) {
    return <PhoneFrameInner>{children}</PhoneFrameInner>;
  }

  return <WebFrameInner>{children}</WebFrameInner>;
}

export default function V3StandaloneLayout({ children }) {
  return (
    <PaperThemeProvider>
      <V3StandaloneInner>{children}</V3StandaloneInner>
    </PaperThemeProvider>
  );
}
