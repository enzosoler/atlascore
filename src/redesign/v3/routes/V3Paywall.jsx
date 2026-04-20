/**
 * V3Paywall — v3 paper+ink+amber paywall wired to real RevenueCat purchases.
 *
 * Desktop web SaaS pricing/upgrade page — NOT a mobile screen.
 * Uses the same marketing header/footer style as V3AccountHub.
 *
 * Prices displayed match RevenueCat products (plans.js source of truth):
 *   Weekly  → $3.99/wk  ($rc_weekly)
 *   Monthly → $9.99/mo  ($rc_monthly)
 *   Yearly  → $79/yr    ($rc_annual)
 */

import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { useT } from '@/lib/i18nContext';
import { ACFonts, ACBrand, ACRadii } from '../lib/paper.jsx';
import { HeartMark } from '../lib/brandMarks.jsx';
import { MC } from './V3MarketingLayout.jsx';
import {
  purchasePackage,
  restorePurchases,
  isRevenueCatAvailable,
} from '@/lib/revenueCat';
import { Capacitor } from '@capacitor/core';

const BILLING_TO_PACKAGE = {
  weekly: '$rc_weekly',
  monthly: '$rc_monthly',
  yearly: '$rc_annual',
};

/** Price + cadence strings are intentionally unlocalized — they mirror
 *  the RevenueCat product config exactly. Only the cadence label
 *  ("1 week") goes through i18n. */
function usePlans() {
  const t = useT();
  return [
    { k: 'weekly',  t: t('paywall.plans.weekly'),  p: '$3.99', pm: '$3.99 / wk', save: null },
    { k: 'monthly', t: t('paywall.plans.monthly'), p: '$9.99', pm: '$9.99 / mo', save: null },
    { k: 'yearly',  t: t('paywall.plans.yearly'),  p: '$79',   pm: '$6.58 / mo', save: t('paywall.plans.save') },
  ];
}

function useFeatures() {
  const t = useT();
  return useMemo(() => [
    t('paywall.features.coach'),
    t('paywall.features.logs'),
    t('paywall.features.analytics'),
    t('paywall.features.labs'),
    t('paywall.features.photos'),
    t('paywall.features.export'),
  ], [t]);
}

function NavLink({ to, children }) {
  return (
    <Link to={to} style={{
      color: ACBrand.ink, textDecoration: 'none', fontFamily: ACFonts.mono,
      fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', fontWeight: 700,
    }}>{children}</Link>
  );
}

export default function V3Paywall() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const t = useT();
  const PLANS = usePlans();
  const FEATURES = useFeatures();
  const [plan, setPlan] = useState('yearly');
  const [loading, setLoading] = useState(false);
  const isNative = Capacitor.isNativePlatform();

  async function handlePurchase() {
    if (!isNative) {
      // Web checkout is not available yet — direct user to the app
      toast(t('paywall.toasts.webComingSoon'));
      navigate('/download-app');
      return;
    }
    setLoading(true);
    try {
      if (isRevenueCatAvailable()) {
        const pkgId = BILLING_TO_PACKAGE[plan];
        const result = await purchasePackage(pkgId);
        if (result.userCancelled) {
          setLoading(false);
          return;
        }
        if (result.success) {
          toast.success(t('paywall.toasts.welcome'));
          navigate('/app/today', { replace: true });
          return;
        }
        if (result.error) {
          toast.error(result.error === 'billing_unavailable'
            ? t('paywall.toasts.billingUnavailable')
            : t('paywall.toasts.genericError'));
        }
      }
    } catch (err) {
      console.error('[V3Paywall] purchase error:', err);
      toast.error(t('paywall.toasts.genericError'));
    } finally {
      setLoading(false);
    }
  }

  async function handleRestore() {
    setLoading(true);
    try {
      const result = await restorePurchases();
      if (result.isActive) {
        toast.success(t('paywall.toasts.restored'));
        navigate('/app/today', { replace: true });
      } else {
        toast(t('paywall.toasts.noActiveSub'));
      }
    } catch {
      toast.error(t('paywall.toasts.restoreFailed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: ACBrand.paper, color: ACBrand.ink, fontFamily: ACFonts.body }}>
      <style>{`
        @keyframes pwFadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .pw-plan-card {
          transition: border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
        }
        .pw-plan-card:hover {
          box-shadow: 0 2px 12px rgba(10,10,10,0.06);
        }
        .pw-cta-btn {
          transition: opacity 0.15s ease, transform 0.1s ease;
        }
        .pw-cta-btn:hover {
          opacity: 0.88;
        }
        .pw-cta-btn:active {
          transform: scale(0.97);
        }
        @media (max-width: 680px) {
          .pw-pad { padding-left: 20px !important; padding-right: 20px !important; }
          .pw-plans-grid { grid-template-columns: 1fr !important; }
          .pw-features-grid { grid-template-columns: 1fr !important; }
          .pw-nav { display: none !important; }
          .pw-content { padding-top: 40px !important; padding-bottom: 64px !important; }
        }
      `}</style>

      {/* -- Header (matches V3AccountHub / marketing pages) -- */}
      <div className="pw-pad" style={{
        display: 'flex', alignItems: 'center', gap: 28, padding: '22px 56px',
        borderBottom: MC.border, flexWrap: 'wrap',
      }}>
        <Link to="/app/account" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, color: ACBrand.ink, textDecoration: 'none' }}>
          <HeartMark size={34} strokeW={2} />
          <span style={{ fontFamily: ACFonts.brand, fontSize: 22, letterSpacing: -0.5, textTransform: 'lowercase' }}>
            atlas.<span style={{ color: ACBrand.accent }}>core</span>
          </span>
        </Link>
        <div className="pw-nav" style={{ display: 'flex', gap: 24 }}>
          <NavLink to="/app/account">{t('webNav.account')}</NavLink>
          <NavLink to="/app/billing">{t('webNav.billing')}</NavLink>
          <NavLink to="/app/export">{t('webNav.export')}</NavLink>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 16, alignItems: 'center' }}>
          <NavLink to="/download-app">{t('webNav.getApp')}</NavLink>
          <button
            type="button"
            onClick={async () => { try { await logout?.(); } catch {} navigate('/auth/login', { replace: true }); }}
            style={{
              background: 'none', border: 'none', fontFamily: ACFonts.mono, fontSize: 11,
              letterSpacing: 0.6, textTransform: 'uppercase', fontWeight: 700,
              color: MC.dim, cursor: 'pointer',
            }}
          >
            {t('webNav.signOut')}
          </button>
        </div>
      </div>

      {/* -- Content -- */}
      <div className="pw-pad pw-content" style={{
        maxWidth: 960, margin: '0 auto', padding: '64px 56px 96px',
        animation: 'pwFadeIn 0.4s ease-out',
      }}>
        {/* Eyebrow + title */}
        <div style={{ fontFamily: ACFonts.mono, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: MC.dim }}>
          {t('paywall.eyebrow')}
        </div>
        <h1 style={{
          margin: '12px 0 0', fontFamily: ACFonts.brand,
          fontSize: 'clamp(36px, 6vw, 56px)', letterSpacing: '-0.04em',
          lineHeight: 0.9, textTransform: 'lowercase',
        }}>
          {t('paywall.titlePart1')} <span style={{ color: ACBrand.accent }}>{t('paywall.titleAccent')}</span>{t('paywall.titleEnd')}
        </h1>
        <p style={{ margin: '16px 0 0', fontSize: 18, lineHeight: 1.55, color: MC.body, maxWidth: 520 }}>
          {t('paywall.subtitle')}
        </p>

        {/* Plan cards — 3-column grid */}
        <div className="pw-plans-grid" style={{
          marginTop: 44, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16,
        }}>
          {PLANS.map(p => {
            const on = p.k === plan;
            return (
              <div
                key={p.k}
                className="pw-plan-card"
                onClick={() => setPlan(p.k)}
                style={{
                  position: 'relative', padding: 28, borderRadius: ACRadii.card, cursor: 'pointer',
                  border: `2px solid ${on ? ACBrand.accent : MC.hair}`,
                  background: on ? 'rgba(232,181,0,0.08)' : 'transparent',
                  display: 'flex', flexDirection: 'column', gap: 8,
                }}
              >
                {p.save && (
                  <div style={{
                    position: 'absolute', top: -11, right: 16,
                    background: ACBrand.accent, color: ACBrand.ink, padding: '4px 12px',
                    borderRadius: 6, fontSize: 10, fontWeight: 700, letterSpacing: 0.3,
                  }}>
                    {p.save}
                  </div>
                )}
                <div style={{ fontFamily: ACFonts.mono, fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', color: MC.dim }}>
                  {p.t}
                </div>
                <div style={{
                  fontFamily: ACFonts.display, fontSize: 36, fontWeight: 700,
                  letterSpacing: -1.2, color: ACBrand.ink, lineHeight: 1,
                }}>
                  {p.p}
                </div>
                <div style={{ fontSize: 13, color: MC.dim }}>
                  {p.pm}
                </div>
                {/* Selection indicator */}
                <div style={{
                  marginTop: 8, width: 18, height: 18, borderRadius: 999,
                  border: `2px solid ${on ? ACBrand.accent : MC.hair}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {on && (
                    <div style={{ width: 10, height: 10, borderRadius: 999, background: ACBrand.accent }} />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Divider */}
        <div style={{ margin: '48px 0', borderTop: MC.border }} />

        {/* Features — 2-column grid */}
        <div style={{ fontFamily: ACFonts.mono, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: MC.dim, marginBottom: 20 }}>
          {t('paywall.features.heading')}
        </div>
        <div className="pw-features-grid" style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 32px',
        }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{
                width: 22, height: 22, borderRadius: 7, background: ACBrand.accent, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="12" height="12" viewBox="0 0 14 14">
                  <path d="M3 7l3 3 5-6" stroke={ACBrand.ink} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div style={{ fontSize: 15, color: ACBrand.ink }}>{f}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ marginTop: 48, maxWidth: 400 }}>
          <button
            type="button"
            className="pw-cta-btn"
            onClick={handlePurchase}
            disabled={loading}
            style={{
              width: '100%', padding: '18px 32px', borderRadius: 999,
              background: ACBrand.ink, color: ACBrand.paper, border: 'none',
              fontFamily: ACFonts.brand, fontSize: 20, letterSpacing: -0.5,
              textTransform: 'lowercase', cursor: loading ? 'wait' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? t('paywall.cta.processing') : isNative ? t('paywall.cta.buy') : t('paywall.cta.webFallback')}
          </button>
        </div>

        {/* Restore + Terms + Privacy links */}
        <div style={{ marginTop: 20, display: 'flex', gap: 16, alignItems: 'center' }}>
          <button
            type="button"
            onClick={handleRestore}
            style={{
              background: 'none', border: 'none', fontFamily: ACFonts.mono,
              fontSize: 11, letterSpacing: 0.5, color: MC.dim,
              cursor: 'pointer', textDecoration: 'underline', padding: 0,
            }}
          >
            {t('paywall.links.restore')}
          </button>
          <span style={{ color: MC.mute }}>&middot;</span>
          <Link to="/terms" style={{ fontFamily: ACFonts.mono, fontSize: 11, letterSpacing: 0.5, color: MC.dim, textDecoration: 'underline' }}>
            {t('webNav.terms')}
          </Link>
          <span style={{ color: MC.mute }}>&middot;</span>
          <Link to="/privacy" style={{ fontFamily: ACFonts.mono, fontSize: 11, letterSpacing: 0.5, color: MC.dim, textDecoration: 'underline' }}>
            {t('webNav.privacy')}
          </Link>
        </div>
      </div>

      {/* -- Footer (matches V3AccountHub) -- */}
      <div className="pw-pad" style={{
        padding: '32px 56px 48px', borderTop: MC.border,
        textAlign: 'center', fontFamily: ACFonts.mono, fontSize: 11,
        letterSpacing: 0.4, color: MC.dim, lineHeight: 1.6,
      }}>
        atlas.core is built for mobile. This is your account dashboard.
      </div>
    </div>
  );
}
