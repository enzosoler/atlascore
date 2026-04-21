import React from 'react';
import { useT } from '@/lib/i18nContext';
import {
  ACFonts, ACRadii, useACT, useACTheme,
  ACDot, ACLabel, ACMono, ACNum, ACBtn,
  ACSpark, ACRing, ACBars, ACLine, ACChip,
  ACHeader, ACBrandMark, ACTabBar, CaptureIcon,
} from '../lib/paper.jsx';
import { HeartMark, ChevronMark, ChevronHeartMark, Wordmark, LockupH, LockupV, LockupTag } from '../lib/brandMarks.jsx';

function S1_Splash_B({ dark = false, onCreateAccount, onSignIn }) {
  const c = useACT(dark);
  const t = useT();
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px 28px 32px', background: c.bg, color: c.fg }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <ACBrandMark size={18} dark={dark} HeartMarkComp={HeartMark} />
        <ACLabel size={11} color={c.mute}>est. 2026</ACLabel>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 18 }}>
        <ACLabel size={12} color={c.accent} style={{ fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>{t('welcome.manifestoEyebrow')}</ACLabel>
        <div style={{
          fontFamily: ACFonts.brand, fontSize: 44, letterSpacing: -2.2,
          lineHeight: 1, color: c.fg, textTransform: 'lowercase',
        }}>
          {t('welcome.manifestoTitleLine1')}<br/>
          {t('welcome.manifestoTitleLine2')} <span style={{ background: c.accent, color: c.ink, padding: '2px 10px', borderRadius: 8 }}>{t('welcome.manifestoCore')}</span>.
        </div>
        <div style={{ maxWidth: 290, fontSize: 15, lineHeight: 1.5, color: c.dim }}>
          {t('welcome.manifestoBody')}
        </div>

        <div style={{ marginTop: 14, padding: '18px 0', borderTop: `1px solid ${c.hair}`, borderBottom: `1px solid ${c.hair}` }}>
          <ACSpark w={300} h={30} stroke={2.2} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <ACBtn primary dark={dark} size="lg" pill style={{ flex: 1 }} onClick={onCreateAccount}>{t('welcome.createAccount')}</ACBtn>
        <ACBtn dark={dark} size="lg" pill onClick={onSignIn}>{t('welcome.signIn')}</ACBtn>
      </div>
    </div>
  );
}

export default S1_Splash_B;
