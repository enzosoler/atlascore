import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ACBrand, ACFonts } from '@/redesign/v3/lib/paper.jsx';
import { HeartMark } from '@/redesign/v3/lib/brandMarks.jsx';

/**
 * Marketing page palette — light-mode only, derived from ACBrand tokens.
 * Matches the useACT(false) output so marketing pages stay consistent
 * with the design system without needing the theme hook.
 */
export const MC = {
  bg:     ACBrand.paper,
  fg:     ACBrand.ink,
  accent: ACBrand.accent,
  body:   'rgba(10,10,10,0.76)',   // body text
  dim:    'rgba(10,10,10,0.64)',   // secondary text (= useACT dim)
  mute:   'rgba(10,10,10,0.50)',   // tertiary
  hair:   'rgba(10,10,10,0.10)',   // borders, dividers (= useACT hair)
  border: '1px solid rgba(10,10,10,0.10)',
  // Dark-card variants (ink bg with paper text at reduced opacity)
  darkBody:   'rgba(239,233,218,0.76)',
  darkDim:    'rgba(239,233,218,0.60)',
  darkHair:   'rgba(239,233,218,0.10)',
};

function NavItem({ to, children }) {
  return (
    <Link
      to={to}
      className="mkt-nav-item"
      style={{
        color: ACBrand.ink,
        textDecoration: 'none',
        fontFamily: ACFonts.mono,
        fontSize: 11,
        letterSpacing: 0.6,
        textTransform: 'uppercase',
        fontWeight: 700,
      }}
    >
      {children}
    </Link>
  );
}

function CTA({ to, children, primary = false }) {
  return (
    <Link
      to={to}
      className={primary ? 'mkt-cta-primary' : 'mkt-cta-secondary'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 999,
        padding: primary ? '16px 24px' : '11px 16px',
        textDecoration: 'none',
        background: primary ? ACBrand.ink : 'transparent',
        color: primary ? ACBrand.paper : ACBrand.ink,
        border: primary ? 'none' : MC.border,
        fontFamily: primary ? ACFonts.brand : ACFonts.mono,
        fontSize: primary ? 20 : 11,
        letterSpacing: primary ? -0.7 : 0.6,
        textTransform: primary ? 'lowercase' : 'uppercase',
        fontWeight: primary ? 400 : 700,
      }}
    >
      {children}
    </Link>
  );
}

export default function V3MarketingLayout({ eyebrow, title, intro, children, hideCTAs = false }) {
  const { pathname } = useLocation();
  return (
    <div style={{ minHeight: '100vh', background: ACBrand.paper, color: ACBrand.ink, fontFamily: ACFonts.body }}>
      <style>{`
        @keyframes mktFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .mkt-nav-item {
          transition: color 0.15s ease, transform 0.15s ease;
        }
        .mkt-nav-item:hover {
          color: ${ACBrand.accent} !important;
          transform: translateY(-1px);
        }
        .mkt-cta-primary {
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.12);
        }
        .mkt-cta-primary:hover {
          transform: scale(0.97);
          box-shadow: 0 1px 4px rgba(0,0,0,0.18);
        }
        .mkt-cta-secondary {
          transition: border-color 0.15s ease, background 0.15s ease;
        }
        .mkt-cta-secondary:hover {
          border-color: rgba(10,10,10,0.30) !important;
          background: rgba(10,10,10,0.04) !important;
        }
        @media (max-width: 680px) {
          .mkt-nav-links { display: none !important; }
          .mkt-pad { padding-left: 20px !important; padding-right: 20px !important; }
          .mkt-footer { flex-direction: column !important; text-align: center !important; gap: 12px !important; }
        }
      `}</style>
      <div
        className="mkt-pad"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 28,
          padding: '22px 56px',
          borderBottom: MC.border,
          flexWrap: 'wrap',
        }}
      >
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, color: ACBrand.ink, textDecoration: 'none' }}>
          <HeartMark size={34} stroke={2} />
          <span style={{ fontFamily: ACFonts.brand, fontSize: 22, letterSpacing: -0.5, textTransform: 'lowercase' }}>
            atlas.<span style={{ color: ACBrand.accent }}>core</span>
          </span>
        </Link>

        <div className="mkt-nav-links" style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <NavItem to="/the-app">The app</NavItem>
          <NavItem to="/method">Method</NavItem>
          <NavItem to="/labs">Labs</NavItem>
          <NavItem to="/pricing">Pricing</NavItem>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <CTA to="/webapp">Sign in</CTA>
          <CTA to="/download-app" primary>get the app</CTA>
        </div>
      </div>

      <div className="mkt-pad" key={pathname} style={{ maxWidth: 1180, margin: '0 auto', padding: '72px 56px 96px', animation: 'mktFadeIn 0.4s ease-out' }}>
        <div style={{ fontFamily: ACFonts.mono, fontSize: 11, letterSpacing: 2.5, textTransform: 'uppercase', color: MC.dim }}>
          {eyebrow}
        </div>
        <h1
          style={{
            margin: '20px 0 0',
            fontFamily: ACFonts.brand,
            fontSize: 'clamp(56px, 9vw, 112px)',
            letterSpacing: '-0.06em',
            lineHeight: 0.84,
            textTransform: 'lowercase',
            maxWidth: 900,
          }}
        >
          {title}
        </h1>
        <p style={{ margin: '22px 0 0', maxWidth: 760, fontSize: 20, lineHeight: 1.55, color: MC.body }}>
          {intro}
        </p>

        {!hideCTAs && (
          <div style={{ marginTop: 28, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <CTA to="/download-app" primary>download the app</CTA>
            <CTA to="/webapp">start on web</CTA>
          </div>
        )}

        <div style={{ marginTop: 56 }}>{children}</div>
      </div>

      <div
        className="mkt-pad mkt-footer"
        style={{
          padding: '40px 56px 48px',
          borderTop: MC.border,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
          fontFamily: ACFonts.mono,
          fontSize: 11,
          letterSpacing: 0.5,
          color: MC.dim,
        }}
      >
        <span>&copy; 2026 atlas.core &middot; field notes from the body</span>
        <span style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
          <NavItem to="/terms">Terms</NavItem>
          <NavItem to="/privacy">Privacy</NavItem>
        </span>
      </div>
    </div>
  );
}
