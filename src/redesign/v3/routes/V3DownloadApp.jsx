import React from 'react';
import { Link } from 'react-router-dom';
import { ACBrand, ACFonts } from '@/redesign/v3/lib/paper.jsx';
import { HeartMark } from '@/redesign/v3/lib/brandMarks.jsx';
import { MC } from './V3MarketingLayout.jsx';
import { APP_STORE_URL, detectPlatform } from './marketingLinks.js';

export default function V3DownloadApp() {
  const platform = detectPlatform();
  const isMobile = platform === 'ios';

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
            <>get the<br /><span style={{ color: ACBrand.accent }}>app.</span></>
          ) : (
            <>built for<br /><span style={{ color: ACBrand.accent }}>iPhone.</span></>
          )}
        </div>

        <p style={{ margin: '18px 0 0', fontSize: 16, lineHeight: 1.6, color: MC.body }}>
          {isMobile
            ? 'atlas.core is an iOS app. Tap below to get it from the App Store.'
            : 'atlas.core lives on your iPhone — training, nutrition, body comp, and coaching in one place.'}
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
            {isMobile ? 'download the app' : 'app store'}
          </a>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <Link to="/auth/login" style={{
              padding: '12px 20px', textDecoration: 'none',
              color: MC.dim, fontFamily: ACFonts.mono, fontSize: 11,
              letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: 600,
            }}>
              Sign in
            </Link>
            <Link to="/pricing" style={{
              padding: '12px 20px', textDecoration: 'none',
              color: MC.dim, fontFamily: ACFonts.mono, fontSize: 11,
              letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: 600,
            }}>
              Pricing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
