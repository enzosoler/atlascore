import React from 'react';
import { useT } from '@/lib/i18nContext';
import V3MarketingLayout, { MC } from './V3MarketingLayout.jsx';
import { ACBrand, ACFonts } from '@/redesign/v3/lib/paper.jsx';

function useInView(ref, opts = {}) {
  const [inView, setInView] = React.useState(false);
  React.useEffect(() => {
    if (!ref.current) return;
    const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); ob.disconnect(); } }, { threshold: 0.15, ...opts });
    ob.observe(ref.current);
    return () => ob.disconnect();
  }, [ref]);
  return inView;
}

export default function V3LabsPage() {
  const sectionRef = React.useRef(null);
  const sectionInView = useInView(sectionRef);
  const t = useT();
  const STEPS = [
    ['01', t('routeContent.labsPage.steps.one.title'), t('routeContent.labsPage.steps.one.body')],
    ['02', t('routeContent.labsPage.steps.two.title'), t('routeContent.labsPage.steps.two.body')],
    ['03', t('routeContent.labsPage.steps.three.title'), t('routeContent.labsPage.steps.three.body')],
  ];

  return (
    <V3MarketingLayout
      eyebrow={t('routeContent.labsPage.eyebrow')}
      title={<>{t('routeContent.labsPage.titlePrefix')} <span style={{ color: ACBrand.accent }}>{t('routeContent.labsPage.titleAccent')}</span></>}
      intro={t('routeContent.labsPage.intro')}
    >
      <style>{`
        @keyframes labsFadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .labs-animate {
          opacity: 0;
          will-change: transform, opacity;
        }
        .labs-animate.in-view {
          animation: labsFadeUp 0.6s ease forwards;
        }
        @keyframes labsEcgTrace {
          0% { stroke-dashoffset: 100; }
          30% { stroke-dashoffset: 0; }
          50% { stroke-dashoffset: 0; }
          80% { stroke-dashoffset: -100; }
          100% { stroke-dashoffset: -100; }
        }
        .labs-ecg {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: labsEcgTrace 3.5s ease-in-out infinite;
        }
        .labs-ecg-0 { animation-delay: 0s; }
        .labs-ecg-1 { animation-delay: 1s; }
      `}</style>
      <div ref={sectionRef} style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 28 }}>
        <div
          className={`labs-animate${sectionInView ? ' in-view' : ''}`}
          style={{
            padding: 28, borderRadius: 28, background: ACBrand.ink, color: ACBrand.paper,
            animationDelay: sectionInView ? '0s' : undefined,
          }}
        >
          <div style={{ fontFamily: ACFonts.mono, fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase', color: ACBrand.accent }}>
            {t('routeContent.labsPage.howItWorks')}
          </div>
          <div style={{ marginTop: 16, fontFamily: ACFonts.brand, fontSize: 42, lineHeight: 0.92, letterSpacing: -1.8, textTransform: 'lowercase' }}>
            {t('routeContent.labsPage.heroLine1')}
            <br />
            {t('routeContent.labsPage.heroLine2')}
          </div>
          <p style={{ margin: '16px 0 0', fontSize: 15, lineHeight: 1.6, color: MC.darkBody }}>
            {t('routeContent.labsPage.heroBody')}
          </p>
          {/* ECG heartbeat trace — amber on dark */}
          <svg width="100%" height="32" viewBox="0 0 800 32" preserveAspectRatio="none" aria-hidden="true" style={{ marginTop: 20, display: 'block' }}>
            <line x1="0" x2="800" y1="16" y2="16" stroke="rgba(239,233,218,0.1)" strokeWidth="1" />
            {[120, 400].map((x, i) => (
              <path key={x} className={`labs-ecg labs-ecg-${i}`}
                d={`M${x} 16 L${x+8} 16 L${x+12} 2 L${x+18} 30 L${x+24} 9 L${x+30} 16 L${x+52} 16`}
                stroke="#e8b500" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            ))}
          </svg>
        </div>

        {/* ECG bridge trace — light mode */}
        <div style={{ gridColumn: '1 / -1' }}>
          <svg width="100%" height="36" viewBox="0 0 800 36" preserveAspectRatio="none" aria-hidden="true" style={{ display: 'block' }}>
            <line x1="0" x2="800" y1="18" y2="18" stroke="rgba(10,10,10,0.15)" strokeWidth="1" />
            {[150, 450].map((x, i) => (
              <path key={x} className={`labs-ecg labs-ecg-${i}`}
                d={`M${x} 18 L${x+8} 18 L${x+12} 3 L${x+18} 33 L${x+24} 10 L${x+30} 18 L${x+52} 18`}
                stroke="#e8b500" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            ))}
          </svg>
        </div>

        <div style={{ display: 'grid', gap: 16 }}>
          {STEPS.map(([n, title, body], index) => (
            <div
              key={n}
              className={`labs-animate${sectionInView ? ' in-view' : ''}`}
              style={{
                padding: 20, borderRadius: 22, border: MC.border,
                animationDelay: sectionInView ? `${0.2 + index * 0.2}s` : undefined,
              }}
            >
              <div style={{ fontFamily: ACFonts.mono, fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase', color: ACBrand.accent }}>
                {n}
              </div>
              <div style={{ marginTop: 10, fontFamily: ACFonts.brand, fontSize: 28, lineHeight: 0.95, letterSpacing: -1.2, textTransform: 'lowercase' }}>
                {title}
              </div>
              <p style={{ margin: '12px 0 0', fontSize: 14.5, lineHeight: 1.6, color: MC.body }}>
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </V3MarketingLayout>
  );
}
