import React from 'react';
import { Link } from 'react-router-dom';
import { ACBrand, ACFonts } from '@/redesign/v3/lib/paper.jsx';
import { HeartMark } from '@/redesign/v3/lib/brandMarks.jsx';
import { useI18n, useT } from '@/lib/i18nContext';

/** Compact EN · PT toggle pill — same pattern as V3MarketingLayout. */
function LocaleToggle() {
  const { locale, switchLocale } = useI18n();
  const isPT = locale === 'pt-BR';
  const btn = (active, label, value) => (
    <button
      key={value}
      type="button"
      onClick={() => { if (!active) switchLocale(value); }}
      style={{
        padding: '6px 10px',
        background: active ? ACBrand.ink : 'transparent',
        color: active ? ACBrand.paper : ACBrand.ink,
        border: 'none',
        fontFamily: ACFonts.mono, fontSize: 11, letterSpacing: 0.6,
        textTransform: 'uppercase', fontWeight: 700,
        cursor: active ? 'default' : 'pointer', borderRadius: 999,
      }}
      aria-pressed={active}
      aria-label={`${label}`}
    >{label}</button>
  );
  const t = useT();
  return (
    <div role="group" aria-label={t('marketing.landingPage.ariaLanguage')} style={{
      display: 'inline-flex', alignItems: 'center', padding: 2,
      border: '1px solid rgba(10,10,10,0.14)', borderRadius: 999,
    }}>
      {btn(!isPT, 'EN', 'en')}
      {btn(isPT,  'PT', 'pt-BR')}
    </div>
  );
}

function NavLink({ href, children, strong }) {
  const common = {
    color: ACBrand.ink,
    textDecoration: 'none',
    fontFamily: ACFonts.mono,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    fontWeight: strong ? 700 : 600,
  };

  if (href.startsWith('/app')) {
    return (
      <Link to={href} style={common}>
        {children}
      </Link>
    );
  }

  return (
    <Link to={href} style={common}>
      {children}
    </Link>
  );
}

function CTAButton({ to, children, primary }) {
  return (
    <Link
      to={to}
      className={`ac-cta-btn ${primary ? 'ac-cta-btn-primary' : 'ac-cta-btn-secondary'}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        borderRadius: 999,
        textDecoration: 'none',
        padding: primary ? '18px 28px' : '12px 18px',
        background: primary ? ACBrand.ink : 'transparent',
        color: primary ? ACBrand.paper : ACBrand.ink,
        border: primary ? 'none' : '1px solid rgba(10,10,10,0.14)',
        fontFamily: primary ? ACFonts.brand : ACFonts.mono,
        fontSize: primary ? 22 : 11,
        fontWeight: primary ? 400 : 700,
        letterSpacing: primary ? -0.7 : 0.6,
        textTransform: primary ? 'lowercase' : 'uppercase',
      }}
    >
      {children}
    </Link>
  );
}

function ECGDivider({ dark = false, spikes = [180, 520, 860], delayOffset = 0 }) {
  const lineColor = dark ? 'rgba(239,233,218,0.12)' : 'rgba(10,10,10,0.2)';
  return (
    <svg width="100%" height="48" viewBox="0 0 1200 48" preserveAspectRatio="none" aria-hidden="true">
      <line x1="0" x2="1200" y1="24" y2="24" stroke={lineColor} strokeWidth="1" />
      {spikes.map((x, i) => (
        <path
          key={x}
          className={`ac-ecg-spike ac-ecg-spike-${i}`}
          style={{ animationDelay: `${delayOffset + i * 0.8}s` }}
          d={`M${x} 24 L${x + 10} 24 L${x + 16} 4 L${x + 24} 44 L${x + 32} 14 L${x + 40} 24 L${x + 70} 24`}
          stroke={ACBrand.accent}
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}

export default function S42_Web_Landing() {
  const t = useT();
  const NAV_ITEMS = [
    { label: t('marketing.nav.theApp'), href: '/the-app' },
    { label: t('marketing.nav.method'), href: '/method' },
    { label: t('marketing.nav.labs'), href: '/labs' },
    { label: t('marketing.nav.pricing'), href: '/pricing' },
    { label: t('marketing.nav.terms'), href: '/terms' },
  ];
  const PILLARS = [
    {
      n: '01',
      k: t('marketing.landingPage.pillars.training.label'),
      v: t('marketing.landingPage.pillars.training.body'),
      stat: '87',
      sub: t('marketing.landingPage.pillars.training.statSub'),
    },
    {
      n: '02',
      k: t('marketing.landingPage.pillars.fuel.label'),
      v: t('marketing.landingPage.pillars.fuel.body'),
      stat: '186g',
      sub: t('marketing.landingPage.pillars.fuel.statSub'),
    },
    {
      n: '03',
      k: t('marketing.landingPage.pillars.biology.label'),
      v: t('marketing.landingPage.pillars.biology.body'),
      stat: '84',
      sub: t('marketing.landingPage.pillars.biology.statSub'),
    },
  ];
  const PRINCIPLES = [
    {
      n: 'I.',
      k: t('marketing.landingPage.principles.oneTitle'),
      v: t('marketing.landingPage.principles.oneBody'),
    },
    {
      n: 'II.',
      k: t('marketing.landingPage.principles.twoTitle'),
      v: t('marketing.landingPage.principles.twoBody'),
    },
    {
      n: 'III.',
      k: t('marketing.landingPage.principles.threeTitle'),
      v: t('marketing.landingPage.principles.threeBody'),
    },
  ];
  const FEATURES = [
    t('marketing.landingPage.features.coach'),
    t('marketing.landingPage.features.programs'),
    t('marketing.landingPage.features.labs'),
    t('marketing.landingPage.features.watch'),
    t('marketing.landingPage.features.crew'),
    t('marketing.landingPage.features.privacy'),
  ];
  return (
    <div
      style={{
        minHeight: '100vh',
        background: ACBrand.paper,
        color: ACBrand.ink,
        fontFamily: ACFonts.body,
        overflowX: 'hidden',
      }}
    >
      <style>{`
        @keyframes acLandFade {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes acHeroEntry {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes acRecordBox {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        @keyframes ecgTrace {
          0%  { stroke-dashoffset: 120; }
          30% { stroke-dashoffset: 0; }
          50% { stroke-dashoffset: 0; }
          80% { stroke-dashoffset: -120; }
          100%{ stroke-dashoffset: -120; }
        }
        @keyframes acSubtitleFade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .ac-hero-line1 {
          display: block;
          opacity: 0;
          animation: acHeroEntry 0.6s ease-out forwards;
        }
        .ac-hero-line2 {
          display: block;
          opacity: 0;
          animation: acHeroEntry 0.6s ease-out 0.2s forwards;
        }
        .ac-hero-record-box {
          display: inline;
          background: ${ACBrand.ink};
          color: ${ACBrand.paper};
          padding: 0 14px;
          transform-origin: center;
          transform: scaleX(0);
          animation: acRecordBox 0.4s ease-out 0.4s forwards;
        }
        .ac-subtitle-fade {
          opacity: 0;
          animation: acSubtitleFade 0.5s ease-out 0.5s forwards;
        }
        .ac-ecg-spike {
          stroke-dasharray: 120;
          stroke-dashoffset: 120;
          animation: ecgTrace 3s ease-in-out infinite;
        }
        .ac-ecg-spike-0 { animation-delay: 0s; }
        .ac-ecg-spike-1 { animation-delay: 0.8s; }
        .ac-ecg-spike-2 { animation-delay: 1.6s; }
        .ac-cta-btn {
          transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
        }
        .ac-cta-btn:hover {
          transform: scale(0.96);
        }
        .ac-cta-btn-primary:hover {
          transform: scale(0.96);
          box-shadow: 0 0 16px 2px rgba(218,175,66,0.35);
          filter: brightness(1.08);
        }
        .ac-cta-btn-secondary:hover {
          transform: scale(0.96);
          box-shadow: 0 2px 8px rgba(10,10,10,0.08);
          filter: brightness(0.96);
        }
        @media (max-width: 680px) {
          .ac-land-nav { display: none !important; }
          .ac-land-pad { padding-left: 20px !important; padding-right: 20px !important; }
          .ac-land-hero-grid { grid-template-columns: 1fr !important; gap: 28px !important; }
          .ac-land-pillar-grid { grid-template-columns: 1fr !important; }
          .ac-land-pillar-cell { border-right: none !important; border-bottom: 1px solid rgba(10,10,10,0.15) !important; padding-left: 0 !important; }
          .ac-land-price-grid { grid-template-columns: 1fr !important; gap: 28px !important; }
          .ac-land-feat-grid { grid-template-columns: 1fr !important; }
          .ac-land-method-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .ac-land-footer { flex-direction: column !important; text-align: center !important; }
          .ac-land-header-ctas { margin-left: 0 !important; width: 100% !important; justify-content: stretch !important; }
          .ac-land-header-ctas > * { flex: 1 !important; text-align: center !important; }
        }
      `}</style>
      <div
        className="ac-land-pad"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 28,
          padding: '22px 56px',
          borderBottom: '1px solid rgba(10,10,10,0.1)',
          flexWrap: 'wrap',
        }}
      >
        <Link
          to="/welcome"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            color: ACBrand.ink,
            textDecoration: 'none',
          }}
        >
          <HeartMark size={34} stroke={2} />
          <span
            style={{
              fontFamily: ACFonts.brand,
              fontSize: 22,
              letterSpacing: -0.5,
              textTransform: 'lowercase',
            }}
          >
            atlas.<span style={{ color: ACBrand.accent }}>core</span>
          </span>
        </Link>

        <div className="ac-land-nav" style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.label} href={item.href}>
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="ac-land-header-ctas" style={{ marginLeft: 'auto', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <LocaleToggle />
          <CTAButton to="/webapp">{t('marketing.cta.signIn')}</CTAButton>
          <CTAButton to="/download-app" primary>{t('marketing.cta.downloadApp')}</CTAButton>
        </div>
      </div>

      <div className="ac-land-pad" style={{ padding: '80px 56px 48px', maxWidth: 1280, margin: '0 auto', animation: 'acLandFade 0.5s ease-out' }}>
        <div
          style={{
            fontFamily: ACFonts.mono,
            fontSize: 11,
            letterSpacing: 2.5,
            textTransform: 'uppercase',
            color: 'rgba(10,10,10,0.6)',
          }}
        >
          {t('marketing.landingPage.eyebrow')}
        </div>
        <h1
          style={{
            margin: '22px 0 0',
            fontFamily: ACFonts.brand,
            fontSize: 'clamp(72px, 12vw, 152px)',
            letterSpacing: '-0.07em',
            lineHeight: 0.82,
            textTransform: 'lowercase',
            maxWidth: 1100,
          }}
        >
          <span className="ac-hero-line1">{t('marketing.landingPage.heroLine1')}</span>
          <span className="ac-hero-line2">{t('marketing.landingPage.heroLine2Prefix')} <span className="ac-hero-record-box">{t('marketing.landingPage.heroLine2Accent')}</span>{t('marketing.landingPage.heroLine2Suffix')}</span>
        </h1>

        <div
          className="ac-land-hero-grid"
          style={{
            marginTop: 40,
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 1.2fr) minmax(280px, 1fr)',
            gap: 56,
            alignItems: 'start',
          }}
        >
          <p
            className="ac-subtitle-fade"
            style={{
              margin: 0,
              fontSize: 20,
              lineHeight: 1.5,
              color: 'rgba(10,10,10,0.82)',
              letterSpacing: -0.2,
              maxWidth: 760,
            }}
          >
            {t('marketing.landingPage.subtitlePrefix')}
            <span style={{ color: ACBrand.accent, fontWeight: 700 }}> {t('marketing.landingPage.subtitleAccent')}</span>
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <CTAButton to="/welcome" primary>
              {t('marketing.cta.downloadApp')}
            </CTAButton>
            <div
              style={{
                fontFamily: ACFonts.mono,
                fontSize: 11,
                color: 'rgba(10,10,10,0.6)',
                letterSpacing: 0.4,
                textAlign: 'center',
                textTransform: 'uppercase',
              }}
            >
              {t('marketing.landingPage.heroMeta')}
            </div>
          </div>
        </div>
      </div>

      <div className="ac-land-pad" style={{ padding: '0 56px 60px', maxWidth: 1280, margin: '0 auto' }}>
        <ECGDivider />
      </div>

      <div className="ac-land-pad" style={{ padding: '0 56px 100px', maxWidth: 1280, margin: '0 auto' }}>
        <div
          style={{
            fontFamily: ACFonts.mono,
            fontSize: 11,
            letterSpacing: 2.5,
            textTransform: 'uppercase',
            color: 'rgba(10,10,10,0.6)',
          }}
        >
          {t('marketing.landingPage.sectionWhatItDoes')}
        </div>
        <div
          style={{
            marginTop: 14,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            borderTop: '1px solid rgba(10,10,10,0.15)',
          }}
        >
          {PILLARS.map((pillar, index) => (
            <div
              key={pillar.n}
              className="ac-land-pillar-cell"
              style={{
                padding: '28px 28px 28px 0',
                paddingLeft: index === 0 ? 0 : 32,
                paddingRight: 32,
                borderRight: index < PILLARS.length - 1 ? '1px solid rgba(10,10,10,0.15)' : 'none',
                borderBottom: '1px solid rgba(10,10,10,0.15)',
              }}
            >
              <div style={{ fontFamily: ACFonts.mono, fontSize: 10, letterSpacing: 0.8, color: ACBrand.accent, fontWeight: 700 }}>
                {pillar.n}
              </div>
              <div
                style={{
                  marginTop: 12,
                  fontFamily: ACFonts.brand,
                  fontSize: 40,
                  letterSpacing: -1.6,
                  lineHeight: 1,
                  textTransform: 'lowercase',
                }}
              >
                {pillar.k.toLowerCase()}.
              </div>
              <div style={{ marginTop: 12, minHeight: 80, fontSize: 15, lineHeight: 1.5, color: 'rgba(10,10,10,0.75)' }}>
                {pillar.v}
              </div>
              <div style={{ marginTop: 18, display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <span
                  style={{
                    fontFamily: ACFonts.brand,
                    fontSize: 56,
                    letterSpacing: -2.5,
                    lineHeight: 1,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {pillar.stat}
                </span>
                <span style={{ fontFamily: ACFonts.mono, fontSize: 11, color: 'rgba(10,10,10,0.6)', letterSpacing: 0.3 }}>
                  {pillar.sub}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ECG transition: light → dark */}
      <div className="ac-land-pad" style={{ padding: '0 56px 0', maxWidth: 1280, margin: '0 auto' }}>
        <ECGDivider spikes={[240, 600, 960]} delayOffset={0.3} />
      </div>

      <div className="ac-land-pad" style={{ background: ACBrand.ink, color: ACBrand.paper, padding: '100px 56px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div
            style={{
              fontFamily: ACFonts.mono,
              fontSize: 11,
              letterSpacing: 2.5,
              textTransform: 'uppercase',
              color: ACBrand.accent,
              fontWeight: 700,
            }}
          >
            {t('marketing.landingPage.sectionMethod')}
          </div>
          <div
            style={{
              marginTop: 24,
              fontFamily: ACFonts.brand,
              fontSize: 'clamp(52px, 8vw, 88px)',
              letterSpacing: '-0.05em',
              lineHeight: 0.92,
              textTransform: 'lowercase',
              maxWidth: 1100,
            }}
          >
            {t('marketing.landingPage.methodTitleLine1')}
            <br />
            {t('marketing.landingPage.methodTitleLine2Prefix')} <span style={{ color: ACBrand.accent }}>{t('marketing.landingPage.methodTitleLine2Accent')}</span>
          </div>

          {/* ECG trace on dark — the method's heartbeat */}
          <div style={{ margin: '40px 0 20px' }}>
            <ECGDivider dark spikes={[100, 440, 780]} delayOffset={1} />
          </div>

          <div
            style={{
              marginTop: 40,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 48,
            }}
          >
            {PRINCIPLES.map((principle) => (
              <div key={principle.n}>
                <div style={{ fontFamily: ACFonts.brand, fontSize: 22, letterSpacing: -0.4, color: ACBrand.accent }}>
                  {principle.n}
                </div>
                <div
                  style={{
                    marginTop: 14,
                    fontFamily: ACFonts.brand,
                    fontSize: 26,
                    letterSpacing: -0.8,
                    lineHeight: 1.1,
                    textTransform: 'lowercase',
                  }}
                >
                  {principle.k.toLowerCase()}
                </div>
                <div style={{ marginTop: 10, fontSize: 14.5, lineHeight: 1.6, color: 'rgba(239,233,218,0.74)' }}>
                  {principle.v}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="ac-land-pad" style={{ padding: '100px 56px', maxWidth: 1280, margin: '0 auto' }}>
        <div
          style={{
            fontFamily: ACFonts.mono,
            fontSize: 11,
            letterSpacing: 2.5,
            textTransform: 'uppercase',
            color: 'rgba(10,10,10,0.6)',
          }}
        >
          {t('marketing.landingPage.sectionPlan')}
        </div>
        <div
          className="ac-land-price-grid"
          style={{
            marginTop: 20,
            display: 'grid',
            gridTemplateColumns: 'minmax(280px, 1.3fr) minmax(240px, 1fr)',
            gap: 64,
            alignItems: 'end',
          }}
        >
          <div>
            <div style={{ fontFamily: ACFonts.brand, fontSize: 'clamp(56px, 8vw, 88px)', letterSpacing: -4, lineHeight: 0.9, textTransform: 'lowercase' }}>
              $9.99<span style={{ color: 'rgba(10,10,10,0.45)' }}>/mo</span>
            </div>
            <div style={{ marginTop: 14, maxWidth: 480, fontSize: 16, lineHeight: 1.55, color: 'rgba(10,10,10,0.75)' }}>
              {t('marketing.landingPage.planBody')}
            </div>
          </div>
          <div className="ac-land-feat-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {FEATURES.map((feature) => (
              <div
                key={feature}
                style={{
                  padding: '10px 14px',
                  border: '1px solid rgba(10,10,10,0.2)',
                  fontFamily: ACFonts.mono,
                  fontSize: 11,
                  letterSpacing: 0.3,
                  color: 'rgba(10,10,10,0.8)',
                  fontWeight: 600,
                }}
              >
                {feature}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ECG closing trace */}
      <div className="ac-land-pad" style={{ padding: '0 56px', maxWidth: 1280, margin: '0 auto' }}>
        <ECGDivider spikes={[300, 700]} delayOffset={2} />
      </div>

      <div
        className="ac-land-pad ac-land-footer"
        style={{
          padding: '48px 56px',
          borderTop: '1px solid rgba(10,10,10,0.15)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 20,
          flexWrap: 'wrap',
          fontFamily: ACFonts.mono,
          fontSize: 11,
          letterSpacing: 0.5,
          color: 'rgba(10,10,10,0.6)',
        }}
      >
        <span>{t('marketing.footer.copyright')}</span>
        <span style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <NavLink href="/terms" strong>{t('marketing.nav.terms')}</NavLink>
          <NavLink href="/privacy" strong>{t('marketing.nav.privacy')}</NavLink>
          <NavLink href="/faq" strong>{t('marketing.nav.security')}</NavLink>
          <NavLink href="/auth/login" strong>{t('marketing.nav.contact')}</NavLink>
        </span>
      </div>
    </div>
  );
}
