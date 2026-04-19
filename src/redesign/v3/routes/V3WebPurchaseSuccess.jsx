import React from 'react';
import { Link } from 'react-router-dom';
import { ACBrand, ACFonts } from '@/redesign/v3/lib/paper.jsx';
import { HeartMark } from '@/redesign/v3/lib/brandMarks.jsx';

export default function V3WebPurchaseSuccess() {
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
          you are in.
        </div>
        <p style={{ margin: '18px 0 0', fontSize: 17, lineHeight: 1.65, color: 'rgba(10,10,10,0.74)' }}>
          Purchase confirmed. The next step is the app: download atlas.core from the store, then log in with the same email you used on web.
        </p>
        <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Link
            to="/download-app"
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
            open the app store
          </Link>
          <Link
            to="/auth/login?web=1"
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
            back to web login
          </Link>
        </div>
      </div>
    </div>
  );
}
