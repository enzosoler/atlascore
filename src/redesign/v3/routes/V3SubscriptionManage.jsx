/**
 * V3SubscriptionManage — Desktop web subscription management page.
 * Shows current plan details + cancel/change actions.
 * Only for users who ALREADY have an active subscription.
 * Free users should be sent to V3Paywall instead.
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ACFonts, ACBrand, ACRadii } from '../lib/paper.jsx';
import { HeartMark } from '../lib/brandMarks.jsx';
import { MC } from './V3MarketingLayout.jsx';
import { useAuth } from '@/lib/AuthContext';
import { useSubscription } from '@/lib/SubscriptionContext';
import { presentCustomerCenter, isRevenueCatAvailable } from '@/lib/revenueCat';
import { useT } from '@/lib/i18nContext';

function NavLink({ to, children }) {
  return (
    <Link to={to} style={{
      color: ACBrand.ink, textDecoration: 'none', fontFamily: ACFonts.mono,
      fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', fontWeight: 700,
    }}>{children}</Link>
  );
}

export default function V3SubscriptionManage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { subscription } = useSubscription();
  const t = useT();

  const isActive = subscription && ['active', 'trialing', 'granted'].includes(subscription.status);
  const planLabel = isActive
    ? (subscription.tier || 'Pro').charAt(0).toUpperCase() + (subscription.tier || 'pro').slice(1)
    : 'Free';
  const statusLabel = subscription?.status === 'trialing' ? 'Trial'
    : subscription?.status === 'granted' ? 'Granted'
    : subscription?.status === 'active' ? 'Active' : 'Inactive';

  let renewalDate = null;
  const rawDate = subscription?.expires_at || subscription?.trial_ends_at;
  if (rawDate) {
    try {
      renewalDate = new Date(rawDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    } catch {}
  }

  async function handleCancel() {
    if (isRevenueCatAvailable()) {
      await presentCustomerCenter();
    } else {
      toast(t('subscriptionManage.cancelToast'), {
        description: t('subscriptionManage.cancelToastDesc'),
      });
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: ACBrand.paper, color: ACBrand.ink, fontFamily: ACFonts.body }}>
      <style>{`
        @keyframes acMgFade {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 680px) {
          .mg-pad { padding-left: 20px !important; padding-right: 20px !important; }
          .mg-nav { display: none !important; }
          .mg-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Header */}
      <div className="mg-pad" style={{
        display: 'flex', alignItems: 'center', gap: 28, padding: '22px 56px',
        borderBottom: MC.border, flexWrap: 'wrap',
      }}>
        <Link to="/app/account" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, color: ACBrand.ink, textDecoration: 'none' }}>
          <HeartMark size={34} stroke={2} />
          <span style={{ fontFamily: ACFonts.brand, fontSize: 22, letterSpacing: -0.5, textTransform: 'lowercase' }}>
            atlas.<span style={{ color: ACBrand.accent }}>core</span>
          </span>
        </Link>
        <div className="mg-nav" style={{ display: 'flex', gap: 24 }}>
          <NavLink to="/app/account">Account</NavLink>
          <NavLink to="/app/billing">Billing</NavLink>
          <NavLink to="/app/export">Export</NavLink>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 16, alignItems: 'center' }}>
          <NavLink to="/download-app">{t('webNav.getApp')}</NavLink>
          <button type="button" onClick={async () => { try { await logout?.(); } catch {} navigate('/auth/login', { replace: true }); }}
            style={{ background: 'none', border: 'none', fontFamily: ACFonts.mono, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', fontWeight: 700, color: MC.dim, cursor: 'pointer' }}>
            Sign out
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mg-pad" style={{
        maxWidth: 960, margin: '0 auto', padding: '64px 56px 96px',
        animation: 'acMgFade 0.4s ease-out',
      }}>
        <Link to="/app/account" style={{ fontFamily: ACFonts.mono, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: 600, color: MC.dim, textDecoration: 'none' }}>
          &larr; Back to account
        </Link>

        <div style={{ marginTop: 24 }}>
          <div style={{ fontFamily: ACFonts.mono, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: MC.dim }}>
            /// manage subscription
          </div>
          <h1 style={{ margin: '12px 0 0', fontFamily: ACFonts.brand, fontSize: 'clamp(36px, 6vw, 56px)', letterSpacing: '-0.04em', lineHeight: 0.9, textTransform: 'lowercase' }}>
            your <span style={{ color: ACBrand.accent }}>plan.</span>
          </h1>
        </div>

        {/* Current plan card */}
        <div style={{ marginTop: 40, padding: 32, background: ACBrand.ink, color: ACBrand.paper, borderRadius: ACRadii.card }}>
          <div style={{ fontFamily: ACFonts.mono, fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase', color: ACBrand.accent }}>
            current plan
          </div>
          <div style={{ marginTop: 10, fontFamily: ACFonts.brand, fontSize: 48, letterSpacing: -2.2, lineHeight: 0.9, textTransform: 'lowercase' }}>
            {planLabel.toLowerCase()}
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontFamily: ACFonts.mono, fontSize: 12, letterSpacing: 0.4, color: ACBrand.accent, fontWeight: 600, textTransform: 'uppercase' }}>
              {statusLabel}
            </span>
            {renewalDate && (
              <span style={{ fontFamily: ACFonts.mono, fontSize: 12, letterSpacing: 0.3, color: 'rgba(239,233,218,0.6)' }}>
                {subscription?.status === 'trialing' ? 'Trial ends' : 'Renews'} {renewalDate}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mg-grid" style={{ marginTop: 28, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ padding: 28, border: MC.border, borderRadius: ACRadii.card }}>
            <div style={{ fontFamily: ACFonts.display, fontSize: 18, fontWeight: 700, letterSpacing: -0.4 }}>
              Change plan
            </div>
            <div style={{ marginTop: 8, fontSize: 14, lineHeight: 1.5, color: MC.body }}>
              Switch between weekly, monthly, or yearly billing.
            </div>
            <Link to="/app/billing/paywall" style={{
              display: 'inline-flex', marginTop: 16, padding: '10px 20px',
              background: ACBrand.ink, color: ACBrand.paper, border: 'none',
              borderRadius: ACRadii.button, fontFamily: ACFonts.body, fontSize: 14,
              fontWeight: 600, letterSpacing: -0.2, textDecoration: 'none',
            }}>
              View plans
            </Link>
          </div>

          <div style={{ padding: 28, border: MC.border, borderRadius: ACRadii.card }}>
            <div style={{ fontFamily: ACFonts.display, fontSize: 18, fontWeight: 700, letterSpacing: -0.4 }}>
              Cancel subscription
            </div>
            <div style={{ marginTop: 8, fontSize: 14, lineHeight: 1.5, color: MC.body }}>
              Access continues until the end of your current billing period.
            </div>
            <button type="button" onClick={handleCancel} style={{
              display: 'inline-flex', marginTop: 16, padding: '10px 20px',
              background: 'transparent', color: ACBrand.error || '#c65b4b',
              border: `1px solid ${ACBrand.error || '#c65b4b'}`, borderRadius: ACRadii.button,
              fontFamily: ACFonts.body, fontSize: 14, fontWeight: 600,
              letterSpacing: -0.2, cursor: 'pointer',
            }}>
              Cancel plan
            </button>
          </div>
        </div>

        {/* Quick links */}
        <div style={{ marginTop: 28, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <Link to="/app/billing/invoices" style={{ fontFamily: ACFonts.mono, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: 600, color: MC.dim, textDecoration: 'underline' }}>
            Billing history
          </Link>
          <Link to="/app/export" style={{ fontFamily: ACFonts.mono, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: 600, color: MC.dim, textDecoration: 'underline' }}>
            Export data
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="mg-pad" style={{
        padding: '32px 56px 48px', borderTop: MC.border, textAlign: 'center',
        fontFamily: ACFonts.mono, fontSize: 11, letterSpacing: 0.4, color: MC.dim,
      }}>
        atlas.core is built for mobile. This is your account dashboard.
      </div>
    </div>
  );
}
