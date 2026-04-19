/**
 * Privacy — Privacy Policy (draft).
 *
 * IMPORTANT: Like Terms, this is a credible skeleton. Final privacy copy
 * MUST be reviewed by counsel — especially given the health-adjacent data
 * the app handles (body weight, progress photos, food intake, AI coach
 * chats, lab uploads). Relevant regimes at minimum: LGPD (Brazil), GDPR
 * (EU), HIPAA-adjacent considerations (US — health data is not HIPAA-covered
 * in a B2C SaaS context but users may assume it is).
 */
import React from 'react';
import MarketingShell from './MarketingShell';
import { LegalPage, LegalSection, LegalParagraph, LegalList } from './LegalPage';

const LAST_UPDATED = 'April 2026';

export default function Privacy() {
  return (
    <MarketingShell>
      <LegalPage title="Privacy Policy" lastUpdated={LAST_UPDATED}>

        <LegalSection n="1" title="Our commitment">
          <LegalParagraph>
            atlas.core was built for people who take their bodies seriously, and we
            take your privacy seriously in return. This policy explains what data we
            collect, why we collect it, how we use it, and the rights you have over it.
          </LegalParagraph>
          <LegalParagraph>
            We do not sell your personal data. We do not share it with advertisers.
            We do not use it to train AI models for third parties.
          </LegalParagraph>
        </LegalSection>

        <LegalSection n="2" title="Data we collect">
          <LegalParagraph>
            When you use atlas.core, we collect:
          </LegalParagraph>
          <LegalList items={[
            <><strong>Account data.</strong> Email address, display name, password hash, authentication provider (e.g. Apple, Google).</>,
            <><strong>Profile data.</strong> Goals, training level, height, weight, age, dietary preferences, constraints you provide during onboarding.</>,
            <><strong>Training + nutrition logs.</strong> Workout sessions, exercises performed, sets and reps, food entries, meal photos.</>,
            <><strong>Body data.</strong> Weight history, progress photos you upload, circumference measurements, check-in notes.</>,
            <><strong>Lab data.</strong> Lab PDFs you upload and the biomarker values parsed from them.</>,
            <><strong>AI coach conversations.</strong> The messages you exchange with the AI coach (so it can remember context across sessions).</>,
            <><strong>Device + usage data.</strong> App version, device type, operating system, crash reports, and anonymized usage analytics (which screens you visit).</>,
            <><strong>Health integrations.</strong> If you connect Apple Health, Google Fit, or a wearable, the specific fields you authorize — never more.</>,
          ]} />
        </LegalSection>

        <LegalSection n="3" title="How we use your data">
          <LegalParagraph>
            We use your data exclusively to:
          </LegalParagraph>
          <LegalList items={[
            'Operate, maintain, and improve the Service for you.',
            'Personalize the AI coach and generate your routines, meal plans, and insights.',
            'Process payments, prevent fraud, and enforce our Terms.',
            'Send you essential account and billing notifications (you can opt out of marketing email at any time).',
            'Comply with legal obligations.',
          ]} />
          <LegalParagraph>
            We do <strong>not</strong> use your data to serve ads, and we do not build
            advertising profiles about you.
          </LegalParagraph>
        </LegalSection>

        <LegalSection n="4" title="AI coach and your data">
          <LegalParagraph>
            The AI coach sends a minimal, task-specific slice of your data to a
            third-party AI provider (currently OpenAI or Google Gemini) in order to
            generate a response. We never send your email, full name, or password.
            We include only the context needed for the specific question — typically
            recent workouts, recent meals, or the screen you asked from.
          </LegalParagraph>
          <LegalParagraph>
            Our AI providers are contractually prohibited from using your data to
            train their models, and they delete request data within 30 days.
          </LegalParagraph>
        </LegalSection>

        <LegalSection n="5" title="Data sharing">
          <LegalParagraph>
            We share data only with the following categories of third parties,
            each bound by data-processing agreements:
          </LegalParagraph>
          <LegalList items={[
            <><strong>Infrastructure providers.</strong> Supabase (database, auth, storage), hosting providers for our API.</>,
            <><strong>Payment processors.</strong> RevenueCat and the underlying payment networks (Stripe, Apple, Google) for billing only.</>,
            <><strong>AI providers.</strong> OpenAI, Google Gemini for coach responses (see Section 4).</>,
            <><strong>Analytics providers.</strong> PostHog for anonymized usage analytics, Sentry for crash reports.</>,
            <><strong>Legal disclosures.</strong> If required by law, subpoena, or court order — and only after narrowly scoping the disclosure.</>,
          ]} />
        </LegalSection>

        <LegalSection n="6" title="Data storage and security">
          <LegalParagraph>
            Your data is stored in secure cloud infrastructure with encryption at
            rest and in transit. We use industry-standard authentication (hashed
            passwords, JWT tokens, OAuth). Progress photos and lab PDFs are stored
            in isolated storage buckets accessible only to your account.
          </LegalParagraph>
          <LegalParagraph>
            No system is 100% secure. In the unlikely event of a breach affecting
            your personal data, we will notify you without undue delay as required
            by applicable law.
          </LegalParagraph>
        </LegalSection>

        <LegalSection n="7" title="Your rights">
          <LegalParagraph>
            Depending on your jurisdiction (LGPD in Brazil, GDPR in the EU, CCPA
            in California, and similar laws elsewhere), you have the right to:
          </LegalParagraph>
          <LegalList items={[
            'Access the personal data we hold about you.',
            'Correct inaccurate or incomplete data.',
            'Delete your data and close your account (Settings → Account → Danger Zone).',
            'Export a machine-readable copy of your data (Settings → Account → Export).',
            'Object to or restrict certain processing.',
            'Withdraw consent at any time where processing is based on consent.',
            'Lodge a complaint with your local data protection authority (e.g. ANPD in Brazil, your national DPA in the EU).',
          ]} />
          <LegalParagraph>
            To exercise any of these rights, email us at{' '}
            <a href="mailto:privacy@useatlascore.com" style={{ color: 'hsl(var(--rd-accent))' }}>
              privacy@useatlascore.com
            </a>{' '}
            or use the in-app export/delete options. We respond within 30 days.
          </LegalParagraph>
        </LegalSection>

        <LegalSection n="8" title="Data retention">
          <LegalParagraph>
            We retain your data for as long as your account is active. When you
            delete your account, we delete your personal data within 30 days, except
            where we are required to retain it for legal, accounting, or fraud-
            prevention purposes (e.g. invoices are retained as required by tax law).
          </LegalParagraph>
        </LegalSection>

        <LegalSection n="9" title="Children">
          <LegalParagraph>
            The Service is not directed to children under 18. We do not knowingly
            collect personal data from children. If you believe a child has provided
            us data, contact us immediately and we will delete it.
          </LegalParagraph>
        </LegalSection>

        <LegalSection n="10" title="International transfers">
          <LegalParagraph>
            We may process your data in countries other than your own, including
            the United States and EU member states. Where data is transferred out
            of the EU or Brazil, we rely on Standard Contractual Clauses or the
            transfer mechanism specified by applicable law.
          </LegalParagraph>
        </LegalSection>

        <LegalSection n="11" title="Changes to this policy">
          <LegalParagraph>
            We may update this Privacy Policy from time to time. Material changes
            will be notified through the Service or via email. The "Last updated"
            date at the top of the page reflects the most recent revision.
          </LegalParagraph>
        </LegalSection>

        <LegalSection n="12" title="Contact">
          <LegalParagraph>
            For privacy questions or to exercise your rights, contact us at{' '}
            <a href="mailto:privacy@useatlascore.com" style={{ color: 'hsl(var(--rd-accent))' }}>
              privacy@useatlascore.com
            </a>.
          </LegalParagraph>
        </LegalSection>

      </LegalPage>
    </MarketingShell>
  );
}
export { Privacy };
