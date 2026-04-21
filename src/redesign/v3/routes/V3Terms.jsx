import React from 'react';
import { useI18n, useT } from '@/lib/i18nContext';
import V3MarketingLayout, { MC } from './V3MarketingLayout.jsx';

function Section({ n, title, children }) {
  return (
    <section>
      <h2 style={{
        fontSize: 20, fontWeight: 700, letterSpacing: -0.3, lineHeight: 1.2,
        margin: '0 0 12px', color: MC.fg,
      }}>
        <span style={{ fontVariantNumeric: 'tabular-nums', color: MC.mute, marginRight: 10, fontWeight: 600 }}>
          {n}.
        </span>
        {title}
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {children}
      </div>
    </section>
  );
}

function P({ children }) {
  return (
    <p style={{ margin: 0, fontSize: 14.5, color: MC.body, lineHeight: 1.7 }}>
      {children}
    </p>
  );
}

function List({ items }) {
  return (
    <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map((item, i) => (
        <li key={i} style={{ paddingLeft: 18, position: 'relative', fontSize: 14.5, color: MC.body, lineHeight: 1.65 }}>
          <span aria-hidden style={{ position: 'absolute', left: 0, top: 11, width: 6, height: 6, borderRadius: 9999, background: MC.accent }} />
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function V3Terms() {
  const t = useT();
  const { getTranslation } = useI18n();
  const sections = getTranslation('legal.terms.sections') || [];
  return (
    <V3MarketingLayout
      eyebrow={t('legal.terms.eyebrow')}
      title={<>{t('legal.terms.titlePrefix')} <span style={{ color: MC.accent }}>{t('legal.terms.titleAccent')}</span></>}
      intro={`${t('legal.terms.introPrefix')} ${t('legal.lastUpdated')}`}
      hideCTAs
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 820 }}>
        {sections.map((section) => (
          <Section key={section.n} n={section.n} title={section.title}>
            {(section.paragraphs || []).map((paragraph, index) => (
              <P key={`${section.n}-p-${index}`}>
                {paragraph}
                {section.email && index === section.paragraphs.length - 1 ? (
                  <>
                    {' '}
                    <a href={`mailto:${section.email}`} style={{ color: MC.accent }}>
                      {section.email}
                    </a>.
                  </>
                ) : null}
              </P>
            ))}
            {section.items?.length ? <List items={section.items} /> : null}
          </Section>
        ))}
      </div>
    </V3MarketingLayout>
  );
}
