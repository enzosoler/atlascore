import React from 'react';
import V3MarketingLayout, { MC } from './V3MarketingLayout.jsx';
import { ACBrand, ACFonts } from '@/redesign/v3/lib/paper.jsx';

const LAST_UPDATED = 'April 2026';

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
  return (
    <V3MarketingLayout
      eyebrow="/// legal"
      title={<>terms of <span style={{ color: MC.accent }}>service.</span></>}
      intro={`Last updated: ${LAST_UPDATED}`}
      hideCTAs
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 820 }}>

        <Section n="1" title="Agreement">
          <P>
            These Terms of Service (the <strong>"Terms"</strong>) govern your access
            to and use of the atlas.core website, mobile applications, and all related
            services (collectively, the <strong>"Service"</strong>) operated by
            atlas.core ("<strong>we</strong>", "<strong>us</strong>", "<strong>our</strong>").
            By creating an account or otherwise using the Service, you agree to these Terms.
          </P>
          <P>If you do not agree to these Terms, do not use the Service.</P>
        </Section>

        <Section n="2" title="Eligibility and accounts">
          <P>
            You must be at least 18 years old, or the age of majority in your
            jurisdiction, to use the Service. You agree that:
          </P>
          <List items={[
            'All information you provide during sign-up is accurate and up-to-date.',
            'You are responsible for maintaining the confidentiality of your credentials.',
            'You are responsible for all activity that occurs under your account.',
            'You will notify us immediately of any unauthorized use of your account.',
          ]} />
        </Section>

        <Section n="3" title="Not medical advice">
          <P>
            The Service provides general fitness, nutrition, and wellness information,
            including AI-generated coaching and recommendations. <strong>It is not a
            substitute for professional medical advice, diagnosis, or treatment.</strong>{' '}
            Always consult a qualified healthcare provider before starting any new
            training, nutrition, or supplementation program, particularly if you have
            any medical condition or take medication.
          </P>
          <P>
            The AI coach is trained to give general recommendations and may occasionally
            produce inaccurate or outdated information. Use your own judgment and
            consult professionals for personal medical decisions.
          </P>
        </Section>

        <Section n="4" title="Subscriptions and billing">
          <P>
            Some features require a paid subscription. By subscribing, you authorize
            us (or our payment processor) to charge your payment method on a recurring
            basis until you cancel. Key terms:
          </P>
          <List items={[
            'Subscriptions auto-renew at the end of each billing period unless cancelled.',
            'You may cancel at any time from Settings. Access continues until the end of the current paid period.',
            'Yearly plans are refundable within 14 days of the initial charge. Monthly and weekly plans are non-refundable.',
            'We may change pricing from time to time. Existing subscribers will receive at least 30 days\' notice of a price change applicable to their next renewal.',
            'Taxes applicable in your jurisdiction will be added where required.',
          ]} />
        </Section>

        <Section n="5" title="Acceptable use">
          <P>You agree not to, and not to permit others to:</P>
          <List items={[
            'Use the Service in a manner that violates any applicable law or regulation.',
            'Reverse engineer, decompile, or attempt to extract source code of the Service.',
            'Use automated systems (bots, scrapers) to access the Service without our written permission.',
            'Interfere with, disrupt, or place an unreasonable load on the Service.',
            'Impersonate any person or misrepresent your identity or affiliation with any entity.',
            'Use the Service to store, transmit, or process content that is unlawful, infringing, or harmful.',
          ]} />
        </Section>

        <Section n="6" title="User content">
          <P>
            You retain ownership of all content you upload to the Service, including
            workout logs, food entries, photos, and lab results ("<strong>User
            Content</strong>"). By uploading User Content, you grant us a worldwide,
            non-exclusive, royalty-free license to host, process, and display it
            solely for the purpose of operating and improving the Service for you.
          </P>
          <P>
            You are responsible for the legality and accuracy of your User Content,
            and for maintaining your own backups where critical.
          </P>
        </Section>

        <Section n="7" title="Intellectual property">
          <P>
            The Service, including all software, design, text, graphics, and AI
            models, is the property of atlas.core or our licensors and is protected
            by intellectual property laws. Nothing in these Terms grants you any
            right, title, or interest in the Service other than the limited right
            to use it as described.
          </P>
        </Section>

        <Section n="8" title="AI-generated content">
          <P>
            The Service uses third-party AI models to generate coaching responses,
            meal suggestions, and other recommendations. Outputs may be inaccurate
            or reflect biases of the underlying model. We make no warranty of any
            kind regarding AI outputs and are not liable for decisions made based
            on them.
          </P>
        </Section>

        <Section n="9" title="Termination">
          <P>
            We may suspend or terminate your account at any time for any reason,
            including (but not limited to) violations of these Terms. You may
            terminate your account at any time from Settings. Termination does not
            entitle you to a refund outside the refund policy described in Section 4.
          </P>
        </Section>

        <Section n="10" title="Disclaimers">
          <P>
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES
            OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF
            MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE DISCLAIM ALL SUCH WARRANTIES.
          </P>
        </Section>

        <Section n="11" title="Limitation of liability">
          <P>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, ATLAS CORE SHALL NOT BE LIABLE
            FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE
            DAMAGES ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE. OUR
            TOTAL LIABILITY TO YOU FOR ANY CLAIM ARISING OUT OF OR RELATED TO
            THESE TERMS OR THE SERVICE SHALL NOT EXCEED THE AMOUNTS PAID BY YOU
            TO US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
          </P>
        </Section>

        <Section n="12" title="Governing law">
          <P>
            These Terms are governed by the laws of Brazil, without regard to
            conflict-of-law principles. Any dispute arising out of or related to
            these Terms shall be resolved in the competent courts of the State
            of Sao Paulo, Brazil — except where mandatory consumer-protection
            rules of your jurisdiction provide otherwise.
          </P>
        </Section>

        <Section n="13" title="Changes to these Terms">
          <P>
            We may update these Terms from time to time. We will notify you of
            material changes through the Service or via email. Your continued use
            of the Service after a change becomes effective constitutes acceptance
            of the updated Terms.
          </P>
        </Section>

        <Section n="14" title="Contact">
          <P>
            Questions about these Terms? Email us at{' '}
            <a href="mailto:legal@useatlascore.com" style={{ color: MC.accent }}>
              legal@useatlascore.com
            </a>.
          </P>
        </Section>

      </div>
    </V3MarketingLayout>
  );
}
