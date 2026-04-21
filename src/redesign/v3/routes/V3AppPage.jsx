import React from 'react';
import { useI18n, useT } from '@/lib/i18nContext';
import V3MarketingLayout from './V3MarketingLayout.jsx';
import IOSFrame from '@/redesign/v3/gallery/IOSFrame.jsx';
import { PaperThemeProvider, ACBrand, ACFonts } from '@/redesign/v3/lib/paper.jsx';
import { S2_Today_A, S3_Workout_A, S4_Nutrition_A, S13_Coach_Brief, S14_Body_Dashboard } from '@/redesign/v3/screens/index.js';

const shotAnimStyles = `
@keyframes shotEnter {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes shotFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
@keyframes shotTextEnter {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
`;

function ShotCard({ shot, dark = false, index = 0 }) {
  const Comp = shot.Comp;
  const { locale } = useI18n();
  const enterDelay = index * 0.15;
  const floatDelay = index * 0.5;
  const textDelay = enterDelay + 0.1;
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        opacity: 0,
        animation: `shotEnter 0.6s ease-out ${enterDelay}s forwards, shotFloat 4s ease-in-out ${enterDelay + 0.6 + floatDelay}s infinite`,
      }}
    >
      <div
        style={{
          opacity: 0,
          animation: `shotTextEnter 0.5s ease-out ${textDelay}s forwards`,
        }}
      >
        <div style={{ fontFamily: ACFonts.brand, fontSize: 28, letterSpacing: -1.1, lineHeight: 0.95, textTransform: 'lowercase' }}>
          {shot.title}
        </div>
        <p style={{ margin: '8px 0 0', maxWidth: 360, fontSize: 14.5, lineHeight: 1.55, color: 'rgba(10,10,10,0.72)' }}>
          {shot.subtitle}
        </p>
      </div>
      <PaperThemeProvider>
        <IOSFrame dark={dark}>
          {locale === 'pt-BR' ? (
            <div
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: 18,
                background: dark ? '#0a0a0a' : '#efe9da',
                color: dark ? '#efe9da' : '#0a0a0a',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontFamily: ACFonts.mono, fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase', opacity: 0.6 }}>
                  atlas.core
                </div>
                <div style={{ width: 10, height: 10, borderRadius: 999, background: ACBrand.accent }} />
              </div>
              <div>
                <div style={{ fontFamily: ACFonts.brand, fontSize: 28, lineHeight: 0.95, letterSpacing: -1.2, textTransform: 'lowercase' }}>
                  {shot.title}.
                </div>
                <div style={{ marginTop: 10, fontSize: 13.5, lineHeight: 1.5, opacity: 0.76 }}>
                  {shot.subtitle}
                </div>
              </div>
              <div style={{ display: 'grid', gap: 10 }}>
                {[0, 1, 2].map((row) => (
                  <div key={row} style={{ display: 'grid', gridTemplateColumns: row === 0 ? '1.2fr 0.8fr' : '1fr 1fr', gap: 10 }}>
                    <div style={{ minHeight: row === 0 ? 76 : 56, borderRadius: 18, background: dark ? 'rgba(239,233,218,0.08)' : 'rgba(10,10,10,0.06)' }} />
                    <div style={{ minHeight: row === 0 ? 76 : 56, borderRadius: 18, background: dark ? 'rgba(239,233,218,0.12)' : 'rgba(10,10,10,0.08)' }} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <Comp dark={dark} />
          )}
        </IOSFrame>
      </PaperThemeProvider>
    </div>
  );
}

export default function V3AppPage() {
  const t = useT();
  const SHOTS = [
    {
      title: t('routeContent.appPage.shots.today.title'),
      subtitle: t('routeContent.appPage.shots.today.subtitle'),
      Comp: S2_Today_A,
    },
    {
      title: t('routeContent.appPage.shots.workout.title'),
      subtitle: t('routeContent.appPage.shots.workout.subtitle'),
      Comp: S3_Workout_A,
    },
    {
      title: t('routeContent.appPage.shots.nutrition.title'),
      subtitle: t('routeContent.appPage.shots.nutrition.subtitle'),
      Comp: S4_Nutrition_A,
    },
    {
      title: t('routeContent.appPage.shots.coach.title'),
      subtitle: t('routeContent.appPage.shots.coach.subtitle'),
      Comp: S13_Coach_Brief,
    },
    {
      title: t('routeContent.appPage.shots.body.title'),
      subtitle: t('routeContent.appPage.shots.body.subtitle'),
      Comp: S14_Body_Dashboard,
    },
  ];
  return (
    <V3MarketingLayout
      eyebrow={t('routeContent.appPage.eyebrow')}
      title={<>{t('routeContent.appPage.titlePrefix')} <span style={{ color: ACBrand.accent }}>{t('routeContent.appPage.titleAccent')}</span></>}
      intro={t('routeContent.appPage.intro')}
    >
      <style>{shotAnimStyles}{`
        @keyframes appEcgTrace {
          0% { stroke-dashoffset: 120; }
          30% { stroke-dashoffset: 0; }
          50% { stroke-dashoffset: 0; }
          80% { stroke-dashoffset: -120; }
          100% { stroke-dashoffset: -120; }
        }
        .app-ecg { stroke-dasharray: 120; stroke-dashoffset: 120; animation: appEcgTrace 3s ease-in-out infinite; }
        .app-ecg-0 { animation-delay: 0s; }
        .app-ecg-1 { animation-delay: 0.8s; }
        .app-ecg-2 { animation-delay: 1.6s; }
      `}</style>
      <svg width="100%" height="40" viewBox="0 0 1000 40" preserveAspectRatio="none" aria-hidden="true" style={{ margin: '40px 0' }}>
        <line x1="0" x2="1000" y1="20" y2="20" stroke="rgba(10,10,10,0.12)" strokeWidth="1" />
        {[180, 520, 860].map((x, i) => (
          <path key={x} className={`app-ecg app-ecg-${i}`}
            d={`M${x} 20 L${x+8} 20 L${x+14} 3 L${x+22} 37 L${x+28} 12 L${x+34} 20 L${x+60} 20`}
            stroke="#e8b500" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        ))}
      </svg>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 28 }}>
        {SHOTS.map((shot, index) => (
          <ShotCard key={shot.title} shot={shot} dark={index % 2 === 1} index={index} />
        ))}
      </div>
    </V3MarketingLayout>
  );
}
