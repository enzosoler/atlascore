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

export default function V3MethodPage() {
  const cardsRef = React.useRef(null);
  const cardsInView = useInView(cardsRef);
  const t = useT();
  const PRINCIPLES = [
    [t('routeContent.methodPage.principles.one.title'), t('routeContent.methodPage.principles.one.body')],
    [t('routeContent.methodPage.principles.two.title'), t('routeContent.methodPage.principles.two.body')],
    [t('routeContent.methodPage.principles.three.title'), t('routeContent.methodPage.principles.three.body')],
  ];

  return (
    <V3MarketingLayout
      eyebrow={t('routeContent.methodPage.eyebrow')}
      title={<>{t('routeContent.methodPage.titlePrefix')} <span style={{ color: ACBrand.accent }}>{t('routeContent.methodPage.titleAccent')}</span></>}
      intro={t('routeContent.methodPage.intro')}
    >
      <style>{`
        @keyframes methodFadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes methodScaleIn {
          from { opacity: 0; transform: translateY(24px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1.02); }
        }
        @keyframes methodEcgTrace {
          0% { stroke-dashoffset: 120; }
          30% { stroke-dashoffset: 0; }
          50% { stroke-dashoffset: 0; }
          80% { stroke-dashoffset: -120; }
          100% { stroke-dashoffset: -120; }
        }
        @keyframes methodTighten {
          from { letter-spacing: 0.02em; opacity: 0.7; }
          to { letter-spacing: -0.06em; opacity: 1; }
        }
        .method-ecg-spike {
          stroke-dasharray: 120;
          stroke-dashoffset: 120;
          animation: methodEcgTrace 3s ease-in-out infinite;
        }
        .method-ecg-spike-0 { animation-delay: 0s; }
        .method-ecg-spike-1 { animation-delay: 0.8s; }
        .method-ecg-spike-2 { animation-delay: 1.6s; }
        .method-card {
          opacity: 0;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          will-change: transform, opacity;
        }
        .method-card.in-view {
          animation: methodFadeUp 0.6s ease forwards;
        }
        .method-card.in-view.method-card--center {
          animation-name: methodScaleIn;
        }
        .method-card:hover {
          transform: translateY(-4px);
        }
        .method-card.method-card--center:hover {
          transform: translateY(-4px) scale(1.02);
        }
      `}</style>
      <svg width="100%" height="48" viewBox="0 0 1200 48" preserveAspectRatio="none" aria-hidden="true" style={{ margin: '0 0 32px' }}>
        <line x1="0" x2="1200" y1="24" y2="24" stroke="rgba(10,10,10,0.15)" strokeWidth="1" />
        {[200, 550, 900].map((x, i) => (
          <path
            key={x}
            className={`method-ecg-spike method-ecg-spike-${i}`}
            d={`M${x} 24 L${x+10} 24 L${x+16} 4 L${x+24} 44 L${x+32} 14 L${x+40} 24 L${x+70} 24`}
            stroke="#e8b500"
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </svg>
      <div ref={cardsRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
        {PRINCIPLES.map(([title, body], index) => (
          <div
            key={title}
            className={`method-card${cardsInView ? ' in-view' : ''}${index === 1 ? ' method-card--center' : ''}`}
            style={{
              padding: 24, border: MC.border, borderRadius: 24,
              background: index === 1 ? ACBrand.ink : 'transparent',
              color: index === 1 ? ACBrand.paper : ACBrand.ink,
              animationDelay: cardsInView ? `${index * 0.15}s` : undefined,
            }}
          >
            <div style={{ fontFamily: ACFonts.mono, fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase', color: index === 1 ? ACBrand.accent : MC.mute }}>
              0{index + 1}
            </div>
            <div style={{ marginTop: 14, fontFamily: ACFonts.brand, fontSize: 34, lineHeight: 0.95, letterSpacing: -1.4, textTransform: 'lowercase' }}>
              {title}
            </div>
            <p style={{ margin: '14px 0 0', fontSize: 15, lineHeight: 1.6, color: index === 1 ? MC.darkBody : MC.body }}>
              {body}
            </p>
          </div>
        ))}
      </div>
    </V3MarketingLayout>
  );
}
