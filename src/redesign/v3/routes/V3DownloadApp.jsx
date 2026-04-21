import React from 'react';
import { Link } from 'react-router-dom';
import { useT } from '@/lib/i18nContext';
import { ACBrand, ACFonts } from '@/redesign/v3/lib/paper.jsx';
import { HeartMark } from '@/redesign/v3/lib/brandMarks.jsx';
import { MC } from './V3MarketingLayout.jsx';
import { APP_STORE_URL, detectPlatform } from './marketingLinks.js';

export default function V3DownloadApp() {
  const platform = detectPlatform();
  const isMobile = platform === 'ios';
  const t = useT();

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
      <div style={{ maxWidth: 440, textAlign: 'center' }}>
        <HeartMark size={64} color={ACBrand.ink} accent={ACBrand.accent} />

        <div style={{
          marginTop: 24, fontFamily: ACFonts.brand, fontSize: 48,
          letterSpacing: -2.2, lineHeight: 0.92, textTransform: 'lowercase',
        }}>
          {isMobile ? (
            <>{t('marketing.downloadAppPage.mobileTitleLine1')}<br /><span style={{ color: ACBrand.accent }}>{t('marketing.downloadAppPage.mobileTitleAccent')}</span></>
          ) : (
            <>{t('marketing.downloadAppPage.desktopTitleLine1')}<br /><span style={{ color: ACBrand.accent }}>{t('marketing.downloadAppPage.desktopTitleAccent')}</span></>
          )}
        </div>

        <p style={{ margin: '18px 0 0', fontSize: 16, lineHeight: 1.6, color: MC.body }}>
          {isMobile
            ? t('marketing.downloadAppPage.mobileBody')
            : t('marketing.downloadAppPage.desktopBody')}
        </p>

        <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <a
            href={APP_STORE_URL}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 999, padding: '16px 24px', textDecoration: 'none',
              background: ACBrand.ink, color: ACBrand.paper,
              fontFamily: ACFonts.brand, fontSize: 22,
              letterSpacing: -0.7, textTransform: 'lowercase',
            }}
          >
            {isMobile ? t('marketing.downloadAppPage.downloadApp') : t('marketing.downloadAppPage.appStore')}
          </a>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <Link to="/auth/login" style={{
              padding: '12px 20px', textDecoration: 'none',
              color: MC.dim, fontFamily: ACFonts.mono, fontSize: 11,
              letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: 600,
            }}>
              {t('marketing.cta.signIn')}
            </Link>
            <Link to="/pricing" style={{
              padding: '12px 20px', textDecoration: 'none',
              color: MC.dim, fontFamily: ACFonts.mono, fontSize: 11,
              letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: 600,
            }}>
              {t('marketing.nav.pricing')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
