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
import { useT } from '@/lib/i18nContext';
import { openSubscriptionManagement } from '@/lib/revenueCat';
import { openWebBillingPortal } from '@/services/billingService';
import { WEBAPP_BILLING, WEBAPP_EXPORT, WEBAPP_HOME, WEBAPP_PAYWALL } from '@/lib/platformRoutes';

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
    ? (subscription.tier || t('manageSub.planPro')).charAt(0).toUpperCase() + (subscription.tier || t('manageSub.planPro').toLowerCase()).slice(1)
    : t('manageSub.planFree');
  const statusLabel = subscription?.status === 'trialing' ? t('manageSub.statusTrial')
    : subscription?.status === 'granted' ? t('manageSub.statusGranted')
    : subscription?.status === 'active' ? t('manageSub.statusActive') : t('manageSub.statusInactive');

  let renewalDate = null;
  const rawDate = subscription?.expires_at || subscription?.trial_ends_at;
  if (rawDate) {
    try {
        renewalDate = new Date(rawDate).toLocaleDateString(t('format.localeTag'), { month: 'long', day: 'numeric', year: 'numeric' });
    } catch {}
  }

  async function handleCancel() {
    try {
      const handled = await openSubscriptionManagement();
      if (!handled) {
        await openWebBillingPortal(`${window.location.origin}${WEBAPP_BILLING}`);
      }
    } catch (error) {
      toast.error(t('manageSub.cancelFallback.title'), {
        description: error?.message || t('manageSub.cancelFallback.description'),
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
        <Link to={WEBAPP_HOME} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, color: ACBrand.ink, textDecoration: 'none' }}>
          <HeartMark size={34} stroke={2} />
          <span style={{ fontFamily: ACFonts.brand, fontSize: 22, letterSpacing: -0.5, textTransform: 'lowercase' }}>
            atlas.<span style={{ color: ACBrand.accent }}>core</span>
          </span>
        </Link>
        <div className="mg-nav" style={{ display: 'flex', gap: 24 }}>
          <NavLink to={WEBAPP_HOME}>{t('webNav.account')}</NavLink>
          <NavLink to={WEBAPP_BILLING}>{t('webNav.billing')}</NavLink>
          <NavLink to={WEBAPP_EXPORT}>{t('webNav.export')}</NavLink>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 16, alignItems: 'center' }}>
          <NavLink to="/download-app">{t('webNav.getApp')}</NavLink>
          <button type="button" onClick={async () => { try { await logout?.(); } catch {} navigate('/auth/login', { replace: true }); }}
            style={{ background: 'none', border: 'none', fontFamily: ACFonts.mono, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', fontWeight: 700, color: MC.dim, cursor: 'pointer' }}>
            {t('webNav.signOut')}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mg-pad" style={{
        maxWidth: 960, margin: '0 auto', padding: '64px 56px 96px',
        animation: 'acMgFade 0.4s ease-out',
      }}>
        <Link to={WEBAPP_HOME} style={{ fontFamily: ACFonts.mono, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: 600, color: MC.dim, textDecoration: 'none' }}>
          {t('manageSub.backToAccount')}
        </Link>

        <div style={{ marginTop: 24 }}>
          <div style={{ fontFamily: ACFonts.mono, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: MC.dim }}>
            {t('manageSub.eyebrow')}
          </div>
          <h1 style={{ margin: '12px 0 0', fontFamily: ACFonts.brand, fontSize: 'clamp(36px, 6vw, 56px)', letterSpacing: '-0.04em', lineHeight: 0.9, textTransform: 'lowercase' }}>
            {t('manageSub.headingPrefix')} <span style={{ color: ACBrand.accent }}>{t('manageSub.headingAccent')}</span>
          </h1>
        </div>

        {/* Current plan card */}
        <div style={{ marginTop: 40, padding: 32, background: ACBrand.ink, color: ACBrand.paper, borderRadius: ACRadii.card }}>
          <div style={{ fontFamily: ACFonts.mono, fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase', color: ACBrand.accent }}>
            {t('manageSub.currentPlan')}
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
                {subscription?.status === 'trialing' ? t('manageSub.trialEnds') : t('manageSub.renews')} {renewalDate}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mg-grid" style={{ marginTop: 28, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ padding: 28, border: MC.border, borderRadius: ACRadii.card }}>
            <div style={{ fontFamily: ACFonts.display, fontSize: 18, fontWeight: 700, letterSpacing: -0.4 }}>
              {t('manageSub.changePlanTitle')}
            </div>
            <div style={{ marginTop: 8, fontSize: 14, lineHeight: 1.5, color: MC.body }}>
              {t('manageSub.changePlanDesc')}
            </div>
            <Link to={WEBAPP_PAYWALL} style={{
              display: 'inline-flex', marginTop: 16, padding: '10px 20px',
              background: ACBrand.ink, color: ACBrand.paper, border: 'none',
              borderRadius: ACRadii.button, fontFamily: ACFonts.body, fontSize: 14,
              fontWeight: 600, letterSpacing: -0.2, textDecoration: 'none',
            }}>
              {t('manageSub.viewPlans')}
            </Link>
          </div>

          <div style={{ padding: 28, border: MC.border, borderRadius: ACRadii.card }}>
            <div style={{ fontFamily: ACFonts.display, fontSize: 18, fontWeight: 700, letterSpacing: -0.4 }}>
              {t('manageSub.cancelTitle')}
            </div>
            <div style={{ marginTop: 8, fontSize: 14, lineHeight: 1.5, color: MC.body }}>
              {t('manageSub.cancelDesc')}
            </div>
            <button type="button" onClick={handleCancel} style={{
              display: 'inline-flex', marginTop: 16, padding: '10px 20px',
              background: 'transparent', color: ACBrand.error || '#c65b4b',
              border: `1px solid ${ACBrand.error || '#c65b4b'}`, borderRadius: ACRadii.button,
              fontFamily: ACFonts.body, fontSize: 14, fontWeight: 600,
              letterSpacing: -0.2, cursor: 'pointer',
            }}>
              {t('manageSub.cancelPlan')}
            </button>
          </div>
        </div>

        {/* Quick links */}
        <div style={{ marginTop: 28, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <Link to="/webapp/billing/invoices" style={{ fontFamily: ACFonts.mono, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: 600, color: MC.dim, textDecoration: 'underline' }}>
            {t('manageSub.billingHistory')}
          </Link>
          <Link to={WEBAPP_EXPORT} style={{ fontFamily: ACFonts.mono, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: 600, color: MC.dim, textDecoration: 'underline' }}>
            {t('manageSub.exportData')}
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="mg-pad" style={{
        padding: '32px 56px 48px', borderTop: MC.border, textAlign: 'center',
        fontFamily: ACFonts.mono, fontSize: 11, letterSpacing: 0.4, color: MC.dim,
      }}>
        {t('manageSub.footer')}
      </div>
    </div>
  );
}
