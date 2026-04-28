import React from 'react';
import {
  ACFonts, ACRadii, useACT,
  ACLabel, ACBtn,
} from '../lib/paper.jsx';
import { HeartMark } from '../lib/brandMarks.jsx';
import { useT } from '@/lib/i18nContext';

const EULA_URL    = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';
const PRIVACY_URL = 'https://useatlascore.com/privacy';

const openExternal = async (url) => {
  try {
    if (window.Capacitor?.isNativePlatform?.()) {
      const { Browser } = await import('@capacitor/browser');
      await Browser.open({ url, presentationStyle: 'popover' });
      return;
    }
  } catch { /* fall through */ }
  window.open(url, '_blank', 'noopener,noreferrer');
};

/**
 * S5_Paywall_A — onboarding trial gate (mobile).
 *
 * Gallery mode:  <S5_Paywall_A dark />
 * Production:    <S5_Paywall_A dark onStartTrial={fn} onRestore={fn} onSkip={fn} platform="native" />
 *
 * Props:
 *   dark          — light/dark variant
 *   onClose       — X button top-left (defaults to onSkip)
 *   onStartTrial  — CTA ({planId}) → purchase flow
 *   onRestore     — restore purchases link
 *   onSkip        — "Not now" / dismiss
 *   platform      — 'native' | 'web' (changes disclaimer copy)
 */
function S5_Paywall_A({ dark = false, onClose, onStartTrial, onRestore, onSkip, platform = 'native', packageDisplays = {}, offeringsError = false, onRetryOfferings }) {
  const c = useACT(dark);
  const t = useT();
  const [plan, setPlan] = React.useState('yearly');
  const handleClose = onClose || onSkip;
  const plans = [
    {
      k: 'yearly',
      t: t('paywall.plans.yearly'),
      p: packageDisplays.yearly?.price || t('paywall.pricing.confirmedInStore'),
      pm: t('paywall.pricing.yearly'),
      save: t('paywall.plans.save'),
    },
    {
      k: 'monthly',
      t: t('paywall.plans.monthly'),
      p: packageDisplays.monthly?.price || t('paywall.pricing.confirmedInStore'),
      pm: t('paywall.pricing.monthly'),
      save: null,
    },
  ];
  const features = [
    t('paywall.features.coach'),
    t('paywall.features.logs'),
    t('paywall.mobile.features.recovery'),
    t('paywall.features.labs'),
    t('paywall.features.export'),
  ];
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      <div style={{ padding: '14px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button type="button" onClick={handleClose} style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M1 1l8 8M9 1l-8 8" stroke={c.fg} strokeWidth="1.8" strokeLinecap="round" /></svg>
        </button>
        {onSkip && (
          <button type="button" onClick={onSkip} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
            <ACLabel size={12} color={c.dim}>{t('paywall.mobile.skip')}</ACLabel>
          </button>
        )}
        {!onSkip && <ACLabel size={11} color={c.dim}>{t('paywall.mobile.stepLabel')}</ACLabel>}
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px 16px' }}>
        <HeartMark size={44} color={c.fg} accent={c.accent} />
        <div style={{
          marginTop: 18, fontFamily: ACFonts.display, fontSize: 38, fontWeight: 700,
          letterSpacing: -1.4, lineHeight: 1.05, color: c.fg,
        }}>
          {t('paywall.mobile.titleLine1')}<br/>{t('paywall.mobile.titleLine2Prefix')} <span style={{ background: c.accent, color: c.ink, padding: '2px 8px', borderRadius: 8 }}>{t('paywall.mobile.titleAccent')}</span>.
        </div>
        <div style={{ marginTop: 16, fontSize: 15, lineHeight: 1.5, color: c.dim }}>
          {t('paywall.mobile.subtitle')}
        </div>

        <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {features.map((b, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 20, height: 20, borderRadius: 7, background: c.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="12" height="12" viewBox="0 0 14 14"><path d="M3 7l3 3 5-6" stroke={c.ink} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <div style={{ fontSize: 14.5, color: c.fg }}>{b}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {plans.map(p => {
            const on = p.k === plan;
            return (
              <button key={p.k} type="button" onClick={() => setPlan(p.k)}
                style={{
                  padding: 18, borderRadius: ACRadii.card,
                  border: `2px solid ${on ? c.accent : c.hair}`,
                  background: on ? (dark ? 'rgba(232,181,0,0.08)' : 'rgba(232,181,0,0.1)') : 'transparent',
                  position: 'relative', cursor: 'pointer',
                  width: '100%', textAlign: 'left',
                }}>
                {p.save && <div style={{
                  position: 'absolute', top: -10, right: 14,
                  background: c.accent, color: c.ink, padding: '3px 10px', borderRadius: 6,
                  fontSize: 10, fontWeight: 700, letterSpacing: 0.2,
                }}>{p.save}</div>}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: c.fg }}>{p.t}</div>
                    <ACLabel size={11} color={c.dim}>{p.pm}</ACLabel>
                  </div>
                  <div style={{ fontFamily: ACFonts.display, fontSize: 22, fontWeight: 700, letterSpacing: -0.6, color: c.fg }}>{p.p}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '14px 28px 26px', background: c.bg }}>
        {offeringsError ? (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <ACLabel size={13} color={c.dim} style={{ marginBottom: 10, display: 'block' }}>
              {t('paywall.toasts.billingUnavailable')}
            </ACLabel>
            <ACBtn primary block dark={dark} size="lg" pill onClick={onRetryOfferings}>
              {t('paywall.mobile.retry')}
            </ACBtn>
          </div>
        ) : (
          <ACBtn primary block dark={dark} size="lg" pill onClick={() => onStartTrial?.({ planId: plan })}>{t('paywall.mobile.continue')}</ACBtn>
        )}
        <div style={{ textAlign: 'center', marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <ACLabel size={11} color={c.dim}>
            {platform === 'web'
              ? t('paywall.mobile.webDisclaimer')
              : t('paywall.mobile.nativeDisclaimer')}
          </ACLabel>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
            {onRestore && (
              <button type="button" onClick={onRestore} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                <ACLabel size={11} color={c.dim} style={{ textDecoration: 'underline' }}>{t('paywall.links.restore')}</ACLabel>
              </button>
            )}
            {onRestore && <span style={{ color: c.dim, fontSize: 11 }}>&middot;</span>}
            <button type="button" onClick={() => openExternal(EULA_URL)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
              <ACLabel size={11} color={c.dim} style={{ textDecoration: 'underline', fontFamily: ACFonts.mono, letterSpacing: 0.3 }}>{t('paywall.links.terms')}</ACLabel>
            </button>
            <span style={{ color: c.dim, fontSize: 11 }}>&middot;</span>
            <button type="button" onClick={() => openExternal(PRIVACY_URL)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
              <ACLabel size={11} color={c.dim} style={{ textDecoration: 'underline', fontFamily: ACFonts.mono, letterSpacing: 0.3 }}>{t('paywall.links.privacy')}</ACLabel>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default S5_Paywall_A;
