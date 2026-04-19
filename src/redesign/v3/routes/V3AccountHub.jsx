/**
 * V3AccountHub — Desktop web account dashboard.
 *
 * This is the web user hub: subscription management, billing, data export.
 * Uses the marketing header/footer style for consistent web experience.
 * NOT a mobile screen — proper desktop layout with sidebar + content.
 */

import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ACFonts, ACBrand, ACRadii, useACT } from '../lib/paper.jsx';
import { HeartMark } from '../lib/brandMarks.jsx';
import { MC } from './V3MarketingLayout.jsx';
import { useAuth } from '@/lib/AuthContext';
import { useSubscription } from '@/lib/SubscriptionContext';

function deriveFirstName(user) {
  if (!user) return '';
  const meta = user.user_metadata || {};
  const first = (meta.first_name || '').trim();
  if (first) return first;
  if (user.full_name) return user.full_name.split(' ')[0];
  if (user.email) return user.email.split('@')[0];
  return '';
}

function NavLink({ to, children }) {
  return (
    <Link to={to} style={{
      color: ACBrand.ink, textDecoration: 'none', fontFamily: ACFonts.mono,
      fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', fontWeight: 700,
    }}>{children}</Link>
  );
}

function ActionCard({ title, description, cta, onClick, style: extraStyle }) {
  return (
    <div className="hub-action-card" style={{
      padding: 28, border: MC.border, borderRadius: ACRadii.card,
      display: 'flex', flexDirection: 'column', gap: 12,
      ...extraStyle,
    }}>
      <div style={{ fontFamily: ACFonts.display, fontSize: 18, fontWeight: 700, letterSpacing: -0.4 }}>
        {title}
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.5, color: MC.body }}>
        {description}
      </div>
      <button
        type="button"
        onClick={onClick}
        style={{
          alignSelf: 'flex-start', marginTop: 4,
          padding: '10px 20px', background: ACBrand.ink, color: ACBrand.paper,
          border: 'none', borderRadius: ACRadii.button,
          fontFamily: ACFonts.body, fontSize: 14, fontWeight: 600,
          letterSpacing: -0.2, cursor: 'pointer',
        }}
      >
        {cta}
      </button>
    </div>
  );
}

export default function V3AccountHub() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { subscription } = useSubscription();
  const firstName = deriveFirstName(user);
  const isActive = subscription && ['active', 'trialing', 'granted'].includes(subscription.status);
  const planLabel = isActive
    ? (subscription.tier || subscription.plan_code || 'Pro').charAt(0).toUpperCase() + (subscription.tier || subscription.plan_code || 'pro').slice(1)
    : 'Free';
  const statusLabel = isActive ? (subscription.status === 'trialing' ? 'Trial' : 'Active') : 'Inactive';

  return (
    <div style={{ minHeight: '100vh', background: ACBrand.paper, color: ACBrand.ink, fontFamily: ACFonts.body }}>
      <style>{`
        @keyframes acHubFade {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pillPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(232,181,0,0); }
          50% { box-shadow: 0 0 12px 2px rgba(232,181,0,0.15); }
        }
        .hub-action-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        .hub-action-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 16px rgba(0,0,0,0.08);
        }
        .hub-manage-btn {
          transition: transform 0.2s ease;
        }
        .hub-manage-btn:hover {
          transform: translateX(3px);
        }
        @media (max-width: 680px) {
          .hub-pad { padding-left: 20px !important; padding-right: 20px !important; }
          .hub-grid { grid-template-columns: 1fr !important; }
          .hub-nav { display: none !important; }
        }
      `}</style>

      {/* ── Header (matches marketing pages) ── */}
      <div className="hub-pad" style={{
        display: 'flex', alignItems: 'center', gap: 28, padding: '22px 56px',
        borderBottom: MC.border, flexWrap: 'wrap',
      }}>
        <Link to="/app/account" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, color: ACBrand.ink, textDecoration: 'none' }}>
          <HeartMark size={34} stroke={2} />
          <span style={{ fontFamily: ACFonts.brand, fontSize: 22, letterSpacing: -0.5, textTransform: 'lowercase' }}>
            atlas.<span style={{ color: ACBrand.accent }}>core</span>
          </span>
        </Link>
        <div className="hub-nav" style={{ display: 'flex', gap: 24 }}>
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

      {/* ── Content ── */}
      <div className="hub-pad" style={{
        maxWidth: 960, margin: '0 auto', padding: '64px 56px 96px',
      }}>
        {/* Greeting + plan summary */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 20,
          opacity: 0, animation: 'acHubFade 0.6s ease-out forwards',
          animationDelay: '0s',
        }}>
          <div>
            <div style={{ fontFamily: ACFonts.mono, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: MC.dim }}>
              /// account
            </div>
            <h1 style={{
              margin: '12px 0 0', fontFamily: ACFonts.brand, fontSize: 'clamp(36px, 6vw, 56px)',
              letterSpacing: '-0.04em', lineHeight: 0.9, textTransform: 'lowercase',
            }}>
              hey, {firstName || 'there'}.
            </h1>
          </div>
          <div style={{
            padding: '12px 20px', background: ACBrand.ink, color: ACBrand.paper,
            borderRadius: ACRadii.chip, fontFamily: ACFonts.mono, fontSize: 11,
            letterSpacing: 0.6, textTransform: 'uppercase', fontWeight: 700,
            animation: 'pillPulse 3s ease-in-out infinite',
          }}>
            {planLabel} · {statusLabel}
          </div>
        </div>

        {/* Subscription card */}
        <div style={{
          marginTop: 40, padding: 32, background: ACBrand.ink, color: ACBrand.paper,
          borderRadius: ACRadii.card,
          opacity: 0, animation: 'acHubFade 0.6s ease-out forwards',
          animationDelay: '0.1s',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontFamily: ACFonts.mono, fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase', color: ACBrand.accent }}>
                current plan
              </div>
              <div style={{
                marginTop: 8, fontFamily: ACFonts.brand, fontSize: 42, letterSpacing: -2,
                lineHeight: 0.9, textTransform: 'lowercase',
              }}>
                {planLabel.toLowerCase()}
              </div>
            </div>
            <Link to="/app/billing" className="hub-manage-btn" style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              padding: '14px 24px', borderRadius: 999, textDecoration: 'none',
              background: ACBrand.accent, color: ACBrand.ink,
              fontFamily: ACFonts.body, fontSize: 15, fontWeight: 600, letterSpacing: -0.2,
            }}>
              {isActive ? 'Manage plan' : 'Upgrade to Pro'}
            </Link>
          </div>
        </div>

        {/* Actions grid */}
        <div className="hub-grid" style={{
          marginTop: 28, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16,
        }}>
          <ActionCard
            title="Billing history"
            description="View past invoices and payment receipts."
            cta="View invoices"
            onClick={() => navigate('/app/billing/invoices')}
            style={{ opacity: 0, animation: 'acHubFade 0.6s ease-out forwards', animationDelay: '0.2s' }}
          />
          <ActionCard
            title="Export data"
            description="Download your full body record as CSV or JSON."
            cta="Export"
            onClick={() => navigate('/app/export')}
            style={{ opacity: 0, animation: 'acHubFade 0.6s ease-out forwards', animationDelay: '0.25s' }}
          />
          <ActionCard
            title="Get the app"
            description="atlas.core lives on your iPhone. Get it from the App Store."
            cta="Download"
            onClick={() => navigate('/download-app')}
            style={{ opacity: 0, animation: 'acHubFade 0.6s ease-out forwards', animationDelay: '0.3s' }}
          />
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="hub-pad" style={{
        padding: '32px 56px 48px', borderTop: MC.border,
        textAlign: 'center', fontFamily: ACFonts.mono, fontSize: 11,
        letterSpacing: 0.4, color: MC.dim, lineHeight: 1.6,
      }}>
        atlas.core is built for mobile. This is your account dashboard.
      </div>
    </div>
  );
}
