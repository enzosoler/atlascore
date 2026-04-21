import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useT } from '@/lib/i18nContext';
import { ACBrand, ACFonts } from '@/redesign/v3/lib/paper.jsx';
import { HeartMark } from '@/redesign/v3/lib/brandMarks.jsx';
import { completeWebCheckout } from '@/services/billingService';
import { MOBILE_APP_HOME, WEBAPP_BILLING, WEBAPP_PAYWALL } from '@/lib/platformRoutes';

export default function V3WebPurchaseSuccess() {
  const t = useT();
  const [state, setState] = useState({ loading: true, error: '', done: false });

  useEffect(() => {
    let cancelled = false;
    const sessionId = new URLSearchParams(window.location.search).get('session_id');

    if (!sessionId) {
      setState({ loading: false, error: t('webPurchaseSuccess.missingSession'), done: false });
      return;
    }

    completeWebCheckout(sessionId)
      .then(() => {
        if (!cancelled) setState({ loading: false, error: '', done: true });
      })
      .catch((error) => {
        if (!cancelled) setState({ loading: false, error: error?.message || t('webPurchaseSuccess.confirmFailed'), done: false });
      });

    return () => { cancelled = true; };
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: ACBrand.paper,
        color: ACBrand.ink,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        boxSizing: 'border-box',
        fontFamily: ACFonts.body,
      }}
    >
      <div style={{ maxWidth: 480, textAlign: 'center' }}>
        <HeartMark size={88} color={ACBrand.ink} accent={ACBrand.accent} />
        <div style={{ marginTop: 24, fontFamily: ACFonts.brand, fontSize: 56, letterSpacing: -2.4, lineHeight: 0.9, textTransform: 'lowercase' }}>
          {state.loading ? t('webPurchaseSuccess.loadingTitle') : state.done ? t('webPurchaseSuccess.successTitle') : t('webPurchaseSuccess.errorTitle')}
        </div>
        <p style={{ margin: '18px 0 0', fontSize: 17, lineHeight: 1.65, color: 'rgba(10,10,10,0.74)' }}>
          {state.loading
            ? t('webPurchaseSuccess.loadingBody')
            : state.done
              ? t('webPurchaseSuccess.successBody')
              : state.error}
        </p>
        <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {state.done ? (
            <Link
              to={WEBAPP_BILLING}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 999,
                padding: '16px 24px',
                textDecoration: 'none',
                background: ACBrand.ink,
                color: ACBrand.paper,
                fontFamily: ACFonts.brand,
                fontSize: 24,
                letterSpacing: -0.8,
                textTransform: 'lowercase',
              }}
            >
              {t('webPurchaseSuccess.openBilling')}
            </Link>
          ) : null}
          <Link
            to={state.done ? MOBILE_APP_HOME : WEBAPP_PAYWALL}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 999,
              padding: '12px 18px',
              textDecoration: 'none',
              border: '1px solid rgba(10,10,10,0.12)',
              color: ACBrand.ink,
              fontFamily: ACFonts.mono,
              fontSize: 11,
              letterSpacing: 0.6,
              textTransform: 'uppercase',
              fontWeight: 700,
            }}
          >
            {state.done ? t('webPurchaseSuccess.openApp') : t('webPurchaseSuccess.backToPlans')}
          </Link>
        </div>
      </div>
    </div>
  );
}
