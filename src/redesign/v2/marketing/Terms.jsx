/**
 * Terms — Terms of Service (draft).
 *
 * IMPORTANT: This is a credible skeleton, not final legal text. The copy
 * below was drafted by Claude based on common SaaS/app ToS structure. Before
 * launch it MUST be reviewed by counsel familiar with the jurisdictions
 * you operate in (at minimum: Brazil — LGPD / CDC; EU — GDPR / Digital
 * Services Act; US — CCPA / state-by-state). A "Draft" banner renders at
 * the top of the page to be transparent with visitors during development.
 */
import React from 'react';
import MarketingShell from './MarketingShell';
import { LegalPage, LegalSection, LegalParagraph, LegalList } from './LegalPage';

const LAST_UPDATED = 'April 2026';

export default function Terms() {
  return (
    <MarketingShell>
      <LegalPage title="Terms of Service" lastUpdated={LAST_UPDATED}>

        <LegalSection n="1" title="Agreement">
          <LegalParagraph>
            These Terms of Service (the <strong>"Terms"</strong>) govern your access
            to and use of the atlas.core website, mobile applications, and all related
            services (collectively, the <strong>"Service"</strong>) operated by
            atlas.core ("<strong>we</strong>", "<strong>us</strong>", "<strong>our</strong>").
            By creating an account or otherwise using the Service, you agree to these Terms.
          </LegalParagraph>
          <LegalParagraph>
            If you do not agree to these Terms, do not use the Service.
          </LegalParagraph>
        </LegalSection>

        <LegalSection n="2" title="Eligibility and accounts">
          <LegalParagraph>
            You must be at least 18 years old, or the age of majority in your
            jurisdiction, to use the Service. You agree that:
          </LegalParagraph>
          <LegalList items={[
            'All information you provide during sign-up is accurate and up-to-date.',
            'You are responsible for maintaining the confidentiality of your credentials.',
            'You are responsible for all activity that occurs under your account.',
            'You will notify us immediately of any unauthorized use of your account.',
          ]} />
        </LegalSection>

        <LegalSection n="3" title="Not medical advice">
          <LegalParagraph>
            The Service provides general fitness, nutrition, and wellness information,
            including AI-generated coaching and recommendations. <strong>It is not a
            substitute for professional medical advice, diagnosis, or treatment.</strong>
            Always consult a qualified healthcare provider before starting any new
            training, nutrition, or supplementation program, particularly if you have
            any medical condition or take medication.
          </LegalParagraph>
          <LegalParagraph>
            The AI coach is trained to give general recommendations and may occasionally
            produce inaccurate or outdated information. Use your own judgment and
            consult professionals for personal medical decisions.
          </LegalParagraph>
        </LegalSection>

        <LegalSection n="4" title="Subscriptions and billing">
          <LegalParagraph>
            Some features require a paid subscription. By subscribing, you authorize
            us (or our payment processor) to charge your payment method on a recurring
            basis until you cancel. Key terms:
          </LegalParagraph>
          <LegalList items={[
            'Subscriptions auto-renew at the end of each billing period unless cancelled.',
            'You may cancel at any time from Settings → Subscription. Access continues until the end of the current paid period.',
            'Yearly plans are refundable within 14 days of the initial charge. Monthly plans are non-refundable.',
            'We may change pricing from time to time. Existing subscribers will receive at least 30 days\' notice of a price change applicable to their next renewal.',
            'Taxes applicable in your jurisdiction will be added where required.',
          ]} />
        </LegalSection>

        <LegalSection n="5" title="Acceptable use">
          <LegalParagraph>
            You agree not to, and not to permit others to:
          </LegalParagraph>
          <LegalList items={[
            'Use the Service in a manner that violates any applicable law or regulation.',
            'Reverse engineer, decompile, or attempt to extract source code of the Service.',
            'Use automated systems (bots, scrapers) to access the Service without our written permission.',
            'Interfere with, disrupt, or place an unreasonable load on the Service.',
            'Impersonate any person or misrepresent your identity or affiliation with any entity.',
            'Use the Service to store, transmit, or process content that is unlawful, infringing, or harmful.',
          ]} />
        </LegalSection>

        <LegalSection n="6" title="User content">
          <LegalParagraph>
            You retain ownership of all content you upload to the Service, including
            workout logs, food entries, photos, and lab results ("<strong>User
            Content</strong>"). By uploading User Content, you grant us a worldwide,
            non-exclusive, royalty-free license to host, process, and display it
            solely for the purpose of operating and improving the Service for you.
          </LegalParagraph>
          <LegalParagraph>
            You are responsible for the legality and accuracy of your User Content,
            and for maintaining your own backups where critical.
          </LegalParagraph>
        </LegalSection>

        <LegalSection n="7" title="Intellectual property">
          <LegalParagraph>
            The Service, including all software, design, text, graphics, and AI
            models, is the property of atlas.core or our licensors and is protected
            by intellectual property laws. Nothing in these Terms grants you any
            right, title, or interest in the Service other than the limited right
            to use it as described.
          </LegalParagraph>
        </LegalSection>

        <LegalSection n="8" title="AI-generated content">
          <LegalParagraph>
            The Service uses third-party AI models to generate coaching responses,
            meal suggestions, and other recommendations. Outputs may be inaccurate
            or reflect biases of the underlying model. We make no warranty of any
            kind regarding AI outputs and are not liable for decisions made based
            on them.
          </LegalParagraph>
        </LegalSection>

        <LegalSection n="9" title="Termination">
          <LegalParagraph>
            We may suspend or terminate your account at any time for any reason,
            including (but not limited to) violations of these Terms. You may
            terminate your account at any time from Settings → Account → Danger Zone.
            Termination does not entitle you to a refund outside the refund policy
            described in Section 4.
          </LegalParagraph>
        </LegalSection>

        <LegalSection n="10" title="Disclaimers">
          <LegalParagraph>
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES
            OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF
            MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE DISCLAIM ALL SUCH WARRANTIES.
          </LegalParagraph>
        </LegalSection>

        <LegalSection n="11" title="Limitation of liability">
          <LegalParagraph>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, ATLAS CORE SHALL NOT BE LIABLE
            FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE
            DAMAGES ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE. OUR
            TOTAL LIABILITY TO YOU FOR ANY CLAIM ARISING OUT OF OR RELATED TO
            THESE TERMS OR THE SERVICE SHALL NOT EXCEED THE AMOUNTS PAID BY YOU
            TO US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
          </LegalParagraph>
        </LegalSection>

        <LegalSection n="12" title="Governing law">
          <LegalParagraph>
            These Terms are governed by the laws of Brazil, without regard to
            conflict-of-law principles. Any dispute arising out of or related to
            these Terms shall be resolved in the competent courts of the State
            of São Paulo, Brazil — except where mandatory consumer-protection
            rules of your jurisdiction provide otherwise.
          </LegalParagraph>
        </LegalSection>

        <LegalSection n="13" title="Changes to these Terms">
          <LegalParagraph>
            We may update these Terms from time to time. We will notify you of
            material changes through the Service or via email. Your continued use
            of the Service after a change becomes effective constitutes acceptance
            of the updated Terms.
          </LegalParagraph>
        </LegalSection>

        <LegalSection n="14" title="Contact">
          <LegalParagraph>
            Questions about these Terms? Email us at{' '}
            <a href="mailto:legal@useatlascore.com" style={{ color: 'hsl(var(--rd-accent))' }}>
              legal@useatlascore.com
            </a>.
          </LegalParagraph>
        </LegalSection>

      </LegalPage>
    </MarketingShell>
  );
}
export { Terms };
