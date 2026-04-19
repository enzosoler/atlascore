/**
 * V3BillingHistory — Desktop web billing history / invoices page.
 *
 * Replaces the old v2 BillingHistoryRoute with the v3 paper+ink+amber
 * design system. Matches the V3AccountHub header/footer style for a
 * consistent web account-management experience.
 *
 * Currently renders an empty state — no real invoice service is wired yet.
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ACFonts, ACBrand, ACRadii } from '../lib/paper.jsx';
import { HeartMark } from '../lib/brandMarks.jsx';
import { MC } from './V3MarketingLayout.jsx';
import { useAuth } from '@/lib/AuthContext';

function NavLink({ to, children }) {
  return (
    <Link to={to} style={{
      color: ACBrand.ink, textDecoration: 'none', fontFamily: ACFonts.mono,
      fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', fontWeight: 700,
    }}>{children}</Link>
  );
}

export default function V3BillingHistory() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <div style={{ minHeight: '100vh', background: ACBrand.paper, color: ACBrand.ink, fontFamily: ACFonts.body }}>
      <style>{`
        @keyframes bhFadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 680px) {
          .bh-pad { padding-left: 20px !important; padding-right: 20px !important; }
          .bh-nav { display: none !important; }
        }
      `}</style>

      {/* -- Header (matches V3AccountHub marketing-style header) -- */}
      <div className="bh-pad" style={{
        display: 'flex', alignItems: 'center', gap: 28, padding: '22px 56px',
        borderBottom: MC.border, flexWrap: 'wrap',
      }}>
        <Link to="/app/account" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, color: ACBrand.ink, textDecoration: 'none' }}>
          <HeartMark size={34} stroke={2} />
          <span style={{ fontFamily: ACFonts.brand, fontSize: 22, letterSpacing: -0.5, textTransform: 'lowercase' }}>
            atlas.<span style={{ color: ACBrand.accent }}>core</span>
          </span>
        </Link>
        <div className="bh-nav" style={{ display: 'flex', gap: 24 }}>
          <NavLink to="/app/account">Account</NavLink>
          <NavLink to="/app/billing">Billing</NavLink>
          <NavLink to="/app/export">Export</NavLink>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 16, alignItems: 'center' }}>
          <NavLink to="/download-app">Get the app</NavLink>
          <button
            type="button"
            onClick={async () => { try { await logout?.(); } catch {} navigate('/auth/login', { replace: true }); }}
            style={{
              background: 'none', border: 'none', fontFamily: ACFonts.mono, fontSize: 11,
              letterSpacing: 0.6, textTransform: 'uppercase', fontWeight: 700,
              color: MC.dim, cursor: 'pointer',
            }}
          >
            Sign out
          </button>
        </div>
      </div>

      {/* -- Content -- */}
      <div className="bh-pad" style={{
        maxWidth: 960, margin: '0 auto', padding: '64px 56px 96px',
        animation: 'bhFadeIn 0.4s ease-out',
      }}>
        {/* Eyebrow */}
        <div style={{
          fontFamily: ACFonts.mono, fontSize: 11, letterSpacing: 2,
          textTransform: 'uppercase', color: MC.dim,
        }}>
          /// billing history
        </div>

        {/* Title */}
        <h1 style={{
          margin: '12px 0 0', fontFamily: ACFonts.brand,
          fontSize: 'clamp(36px, 6vw, 56px)',
          letterSpacing: '-0.04em', lineHeight: 0.9, textTransform: 'lowercase',
        }}>
          invoices.
        </h1>

        {/* Description */}
        <p style={{
          margin: '20px 0 0', fontSize: 16, lineHeight: 1.55, color: MC.body, maxWidth: 600,
        }}>
          Your payment history and receipts.
        </p>

        {/* Empty state */}
        <div style={{
          marginTop: 48, padding: 40, border: MC.border, borderRadius: ACRadii.card,
          textAlign: 'center',
        }}>
          {/* Invoice icon placeholder */}
          <div style={{
            width: 56, height: 56, margin: '0 auto 20px',
            borderRadius: ACRadii.card, background: 'rgba(10,10,10,0.04)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: ACFonts.mono, fontSize: 24, color: MC.mute,
          }}>
            $
          </div>
          <div style={{
            fontFamily: ACFonts.display, fontSize: 18, fontWeight: 700,
            letterSpacing: -0.4,
          }}>
            No invoices yet
          </div>
          <p style={{
            margin: '10px 0 0', fontSize: 14, lineHeight: 1.5, color: MC.body, maxWidth: 400,
            marginLeft: 'auto', marginRight: 'auto',
          }}>
            Your billing history will appear here after your first payment.
          </p>
        </div>

        {/* Back link */}
        <Link
          to="/app/account"
          style={{
            display: 'inline-block', marginTop: 32,
            color: MC.dim, textDecoration: 'none',
            fontFamily: ACFonts.body, fontSize: 14, fontWeight: 500,
          }}
        >
          &larr; Back to account
        </Link>
      </div>

      {/* -- Footer (matches V3AccountHub) -- */}
      <div className="bh-pad" style={{
        padding: '32px 56px 48px', borderTop: MC.border,
        textAlign: 'center', fontFamily: ACFonts.mono, fontSize: 11,
        letterSpacing: 0.4, color: MC.dim, lineHeight: 1.6,
      }}>
        atlas.core is built for mobile. This is your account dashboard.
      </div>
    </div>
  );
}
