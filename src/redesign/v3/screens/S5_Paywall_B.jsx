import React from 'react';
import {
  ACFonts, ACRadii, useACT, useACTheme,
  ACDot, ACLabel, ACMono, ACNum, ACBtn,
  ACSpark, ACRing, ACBars, ACLine, ACChip,
  ACHeader, ACBrandMark, ACTabBar, CaptureIcon,
} from '../lib/paper.jsx';
import { HeartMark, ChevronMark, ChevronHeartMark, Wordmark, LockupH, LockupV, LockupTag } from '../lib/brandMarks.jsx';
import { useT } from '@/lib/i18nContext';

function S5_Paywall_B({ dark = false }) {
  const c = useACT(dark);
  const t = useT();
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: c.bg, color: c.fg }}>
      <div style={{ padding: '20px 28px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <ACLabel size={11} color={c.dim}>{t('paywallB.runtime.kicker')}</ACLabel>
        <div style={{ width: 28, height: 28, borderRadius: 999, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M1 1l8 8M9 1l-8 8" stroke={c.fg} strokeWidth="1.8" strokeLinecap="round" /></svg>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '14px 0 16px' }}>
        <div style={{ padding: 28, background: c.fg, color: c.bg, margin: '0 20px', borderRadius: ACRadii.card }}>
          <ACLabel size={11} color={c.accent} style={{ fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase' }}>{t('paywallB.runtime.recordLabel')}</ACLabel>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
            <ACNum size={96} color={c.bg} weight={700}>268</ACNum>
            <ACLabel size={13} color="rgba(239,233,218,0.6)">{t('paywallB.runtime.poundsShort')}</ACLabel>
          </div>
          <div style={{ marginTop: 6 }}>
            <ACLabel size={12} color={c.accent} style={{ fontWeight: 600 }}>{t('paywallB.runtime.recordDelta')}</ACLabel>
          </div>
          <div style={{ marginTop: 22 }}>
            <ACSpark w={272} h={38} dark={true} color={c.accent} stroke={2.4} />
          </div>
        </div>

        <div style={{ padding: '0 28px', marginTop: 26 }}>
          <div style={{
            fontFamily: ACFonts.display, fontSize: 30, fontWeight: 700,
            letterSpacing: -1, lineHeight: 1.1, color: c.fg,
          }}>
            {t('paywallB.runtime.headlineLine1')}<br/>
            {t('paywallB.runtime.headlineLine2Prefix')} <span style={{ background: c.accent, color: c.ink, padding: '0 8px', borderRadius: 8 }}>{t('paywallB.runtime.headlinePercent')}</span> {t('paywallB.runtime.headlineLine2Suffix')}<br/>
            {t('paywallB.runtime.headlineLine3')}
          </div>
          <div style={{ marginTop: 14, fontSize: 14.5, lineHeight: 1.5, color: c.dim }}>
            {t('paywallB.runtime.body')}
          </div>

          <div style={{
            marginTop: 26, padding: 22, borderRadius: ACRadii.card,
            border: `2px solid ${c.accent}`,
            background: dark ? 'rgba(232,181,0,0.08)' : 'rgba(232,181,0,0.1)',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute', top: -10, left: 18,
              background: c.accent, color: c.ink, padding: '3px 10px', borderRadius: 6,
              fontSize: 10, fontWeight: 700, letterSpacing: 0.3,
            }}>{t('paywallB.runtime.badge')}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <ACNum size={52} color={c.fg} weight={700}>$79</ACNum>
              <ACLabel size={12} color={c.dim} style={{ marginLeft: 6 }}>{t('paywallB.runtime.period')}</ACLabel>
            </div>
            <ACLabel size={12} color={c.accent} style={{ marginTop: 6, fontWeight: 600 }}>{t('paywallB.runtime.equivalent')}</ACLabel>
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 28px 26px', background: c.bg }}>
        <ACBtn primary block dark={dark} size="lg" pill>{t('paywallB.runtime.cta')}</ACBtn>
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <ACLabel size={11} color={c.dim}>{t('paywallB.runtime.footerLinks')}</ACLabel>
        </div>
      </div>
    </div>
  );
}

export default S5_Paywall_B;
