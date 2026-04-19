import React from 'react';
import {
  ACFonts, ACRadii, useACT, useACTheme,
  ACDot, ACLabel, ACMono, ACNum, ACBtn,
  ACSpark, ACRing, ACBars, ACLine, ACChip,
  ACHeader, ACBrandMark, ACTabBar, CaptureIcon,
} from '../lib/paper.jsx';
import { HeartMark, ChevronMark, ChevronHeartMark, Wordmark, LockupH, LockupV, LockupTag } from '../lib/brandMarks.jsx';

function S1_Splash_A({ dark = false, onGetStarted, onSignIn }) {
  const c = useACT(dark);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '48px 28px 32px', background: c.bg, color: c.fg }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <ACLabel size={11} color={c.mute}>v 1.0</ACLabel>
      </div>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
        <HeartMark size={128} color={c.fg} accent={c.accent} />
        <div>
          <div style={{
            fontFamily: ACFonts.brand, fontSize: 46, letterSpacing: -2.4,
            lineHeight: 0.95, color: c.fg, textTransform: 'lowercase',
          }}>
            atlas<span style={{ color: c.accent }}>.</span>core
          </div>
          <div style={{ marginTop: 14 }}>
            <ACLabel size={13} color={c.dim} track={0}>Your body, in signal.</ACLabel>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <ACBtn primary block dark={dark} size="lg" pill onClick={onGetStarted}>Get started</ACBtn>
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <button
            type="button"
            onClick={onSignIn}
            style={{
              border: 'none',
              background: 'transparent',
              padding: 0,
              font: 'inherit',
              cursor: onSignIn ? 'pointer' : 'default',
            }}
          >
            <ACLabel size={13} color={c.dim}>
              Already a member? <span style={{ color: c.fg, fontWeight: 600 }}>Sign in</span>
            </ACLabel>
          </button>
        </div>
      </div>
    </div>
  );
}

export default S1_Splash_A;
