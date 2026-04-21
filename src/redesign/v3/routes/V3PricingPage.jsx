import React from 'react';
import V3MarketingLayout, { MC } from './V3MarketingLayout.jsx';
import { ACBrand, ACFonts } from '@/redesign/v3/lib/paper.jsx';
import { Link } from 'react-router-dom';
import { useT } from '@/lib/i18nContext';

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

export default function V3PricingPage() {
  const t = useT();
  const plansRef = React.useRef(null);
  const plansInView = useInView(plansRef);
  const plans = [
    { id: 'weekly', label: t('pricingPage.plans.weekly.label'), price: '$3.99', period: t('pricingPage.plans.weekly.period'), equivalent: t('pricingPage.plans.weekly.equivalent'), note: t('pricingPage.plans.weekly.note') },
    { id: 'monthly', label: t('pricingPage.plans.monthly.label'), price: '$9.99', period: t('pricingPage.plans.monthly.period'), equivalent: null, note: t('pricingPage.plans.monthly.note'), popular: true },
    { id: 'yearly', label: t('pricingPage.plans.yearly.label'), price: '$79', period: t('pricingPage.plans.yearly.period'), equivalent: t('pricingPage.plans.yearly.equivalent'), note: t('pricingPage.plans.yearly.note'), save: t('pricingPage.plans.yearly.save') },
  ];
  const included = [
    t('pricingPage.included.workoutLogging'),
    t('pricingPage.included.aiCoach'),
    t('pricingPage.included.foodLogging'),
    t('pricingPage.included.bodyComp'),
    t('pricingPage.included.labTracking'),
    t('pricingPage.included.analytics'),
    t('pricingPage.included.photos'),
    t('pricingPage.included.export'),
  ];

  return (
    <V3MarketingLayout
      eyebrow={t('pricingPage.eyebrow')}
      title={<>{t('pricingPage.titlePrefix')} <span style={{ color: ACBrand.accent }}>{t('pricingPage.titleAccent')}</span></>}
      intro={t('pricingPage.intro')}
    >
      <style>{`
        @keyframes pricingFadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pricingScaleIn {
          from { opacity: 0; transform: translateY(24px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1.02); }
        }
        .pricing-card {
          opacity: 0;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          will-change: transform, opacity;
        }
        .pricing-card.in-view {
          animation: pricingFadeUp 0.6s ease forwards;
        }
        .pricing-card.in-view.pricing-card--popular {
          animation-name: pricingScaleIn;
        }
        .pricing-card:hover {
          transform: translateY(-4px);
        }
        .pricing-card.pricing-card--popular:hover {
          transform: translateY(-4px) scale(1.02);
        }
        .pricing-card:hover .pricing-price {
          font-weight: 800;
        }
        .pricing-price {
          transition: font-weight 0.2s ease;
        }
        @keyframes pricingEcgTrace {
          0% { stroke-dashoffset: 100; }
          30% { stroke-dashoffset: 0; }
          50% { stroke-dashoffset: 0; }
          80% { stroke-dashoffset: -100; }
          100% { stroke-dashoffset: -100; }
        }
        .pricing-ecg { stroke-dasharray: 100; stroke-dashoffset: 100; animation: pricingEcgTrace 3s ease-in-out infinite; }
        .pricing-ecg-0 { animation-delay: 0s; }
        .pricing-ecg-1 { animation-delay: 0.9s; }
      `}</style>
      <div ref={plansRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
        {plans.map((plan, index) => (
          <div
            key={plan.id}
            className={`pricing-card${plansInView ? ' in-view' : ''}${plan.popular ? ' pricing-card--popular' : ''}`}
            style={{
              padding: 28,
              borderRadius: 28,
              background: plan.popular ? ACBrand.ink : 'transparent',
              color: plan.popular ? ACBrand.paper : ACBrand.ink,
              border: plan.popular ? 'none' : MC.border,
              position: 'relative',
              animationDelay: plansInView ? `${index * 0.1}s` : undefined,
            }}
          >
            {plan.save && (
              <div style={{
                position: 'absolute', top: -10, right: 18,
                background: ACBrand.accent, color: ACBrand.ink, padding: '4px 12px', borderRadius: 8,
                fontSize: 10, fontWeight: 700, letterSpacing: 0.3,
              }}>
                {plan.save}
              </div>
            )}
            <div style={{
              fontFamily: ACFonts.mono, fontSize: 10, letterSpacing: 0.8,
              textTransform: 'uppercase',
              color: plan.popular ? ACBrand.accent : MC.mute,
              fontWeight: 700,
            }}>
              {plan.label}
            </div>
            <div style={{ marginTop: 16, display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span className="pricing-price" style={{
                fontFamily: ACFonts.brand, fontSize: 56, letterSpacing: -2.5,
                lineHeight: 1, fontVariantNumeric: 'tabular-nums',
              }}>
                {plan.price}
              </span>
              <span style={{
                fontSize: 14, color: plan.popular ? MC.darkDim : MC.mute,
              }}>
                {plan.period}
              </span>
            </div>
            {plan.equivalent && (
              <div style={{
                marginTop: 6, fontFamily: ACFonts.mono, fontSize: 11,
                letterSpacing: 0.3,
                color: plan.popular ? ACBrand.accent : ACBrand.accent,
                fontWeight: 600,
              }}>
                {plan.equivalent}
              </div>
            )}
            <p style={{
              margin: '16px 0 0', fontSize: 14.5, lineHeight: 1.5,
              color: plan.popular ? MC.darkBody : MC.body,
            }}>
              {plan.note}
            </p>
            <Link
              to="/webapp"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginTop: 22, borderRadius: 999, padding: '14px 20px',
                textDecoration: 'none',
                background: plan.popular ? ACBrand.accent : ACBrand.ink,
                color: plan.popular ? ACBrand.ink : ACBrand.paper,
                fontFamily: ACFonts.brand, fontSize: 18, letterSpacing: -0.5,
                textTransform: 'lowercase',
              }}
            >
              {t('pricingPage.getStarted')}
            </Link>
          </div>
        ))}
      </div>

      <svg width="100%" height="40" viewBox="0 0 1000 40" preserveAspectRatio="none" aria-hidden="true" style={{ margin: '40px 0' }}>
        <line x1="0" x2="1000" y1="20" y2="20" stroke="rgba(10,10,10,0.12)" strokeWidth="1" />
        {[200, 600].map((x, i) => (
          <path key={x} className={`pricing-ecg pricing-ecg-${i}`}
            d={`M${x} 20 L${x+8} 20 L${x+14} 3 L${x+22} 37 L${x+28} 12 L${x+34} 20 L${x+60} 20`}
            stroke="#e8b500" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        ))}
      </svg>

      <div style={{ marginTop: 56 }}>
        <div style={{
          fontFamily: ACFonts.mono, fontSize: 10, letterSpacing: 2,
          textTransform: 'uppercase', color: MC.mute, marginBottom: 16,
        }}>
          {t('pricingPage.includedHeading')}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
          {included.map((feature) => (
            <div key={feature} style={{
              padding: '14px 18px', borderRadius: 16,
              border: MC.border,
              fontSize: 14.5, lineHeight: 1.5, color: MC.body,
            }}>
              {feature}
            </div>
          ))}
        </div>
      </div>

      <svg width="100%" height="40" viewBox="0 0 1000 40" preserveAspectRatio="none" aria-hidden="true" style={{ margin: '40px 0' }}>
        <line x1="0" x2="1000" y1="20" y2="20" stroke="rgba(10,10,10,0.12)" strokeWidth="1" />
        {[300, 700].map((x, i) => (
          <path key={x} className={`pricing-ecg pricing-ecg-${i}`}
            d={`M${x} 20 L${x+8} 20 L${x+14} 3 L${x+22} 37 L${x+28} 12 L${x+34} 20 L${x+60} 20`}
            stroke="#e8b500" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        ))}
      </svg>

      <div style={{ marginTop: 56, padding: 28, borderRadius: 28, border: '1px solid rgba(10,10,10,0.1)' }}>
        <div style={{ fontFamily: ACFonts.brand, fontSize: 28, letterSpacing: -1.1, lineHeight: 0.95, textTransform: 'lowercase' }}>
          {t('pricingPage.footerTitle')}
        </div>
        <p style={{ margin: '12px 0 0', fontSize: 15, lineHeight: 1.6, color: MC.body, maxWidth: 600 }}>
          {t('pricingPage.footerBody')}
        </p>
      </div>
    </V3MarketingLayout>
  );
}
