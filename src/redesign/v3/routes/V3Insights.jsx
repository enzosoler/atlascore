import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';
import { useAuth } from '@/lib/AuthContext';
import { ACBrand, ACFonts } from '@/redesign/v3/lib/paper.jsx';
import {
  CONTEXTUAL_PAYWALL_ROUTE,
  createPaywallState,
} from '@/redesign/v3/components/paywall/paywallRouteGuard.js';

export default function V3Insights() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const tier = user?.user_metadata?.tier;
  const isPremium = tier === 'Premium' || tier === 'Pro' || user?.atlas_role === 'admin';
  const dark = theme === 'dark';
  const bg = dark ? '#05070A' : '#f4efe6';
  const fg = dark ? '#f5efe2' : '#0a0a0a';
  const dim = dark ? 'rgba(245,239,226,0.72)' : 'rgba(10,10,10,0.68)';
  const card = dark ? 'rgba(245,239,226,0.06)' : 'rgba(255,255,255,0.72)';

  return (
    <div style={{ minHeight: '100dvh', background: bg, color: fg, padding: '24px 20px 36px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            width: 32,
            height: 32,
            borderRadius: 999,
            border: 'none',
            background: card,
            color: fg,
            cursor: 'pointer',
          }}
        >
          ←
        </button>

        <div style={{ marginTop: 24, fontFamily: ACFonts.brand, fontSize: 42, lineHeight: 0.92, letterSpacing: -1.8, textTransform: 'lowercase' }}>
          insights
        </div>
        <p style={{ margin: '12px 0 0', maxWidth: 560, fontSize: 15, lineHeight: 1.65, color: dim }}>
          This surface is temporarily unavailable. Atlas coach chat is live, but the standalone insights feed is hidden until the production reflection pipeline is fully wired.
        </p>

        <div style={{
          marginTop: 20,
          padding: 18,
          borderRadius: 24,
          background: card,
          border: dark ? '1px solid rgba(245,239,226,0.08)' : '1px solid rgba(10,10,10,0.08)',
        }}>
          <div style={{ fontFamily: ACFonts.mono, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: ACBrand.accent }}>
            Status
          </div>
          <div style={{ marginTop: 10, fontSize: 15, lineHeight: 1.6, color: dim }}>
            We removed demo insight cards from this route to avoid showing fabricated reflection data.
          </div>
        </div>

        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 360 }}>
          <button
            type="button"
            onClick={() => navigate('/app/coach/chat')}
            style={{
              border: 'none',
              borderRadius: 999,
              padding: '16px 20px',
              background: isPremium ? fg : ACBrand.accent,
              color: isPremium ? bg : '#0a0a0a',
              fontFamily: ACFonts.brand,
              fontSize: 24,
              letterSpacing: -0.8,
              textTransform: 'lowercase',
              cursor: 'pointer',
            }}
          >
            open coach chat
          </button>

          {!isPremium ? (
            <button
              type="button"
              onClick={() => navigate(CONTEXTUAL_PAYWALL_ROUTE, {
                state: createPaywallState('coach_locked', location.pathname),
              })}
              style={{
                borderRadius: 999,
                padding: '13px 18px',
                background: 'transparent',
                color: fg,
                border: dark ? '1px solid rgba(245,239,226,0.14)' : '1px solid rgba(10,10,10,0.12)',
                fontFamily: ACFonts.mono,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 0.6,
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              view plans
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
