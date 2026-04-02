import { useTranslation } from '@/hooks/useTranslation';

export default function TermsOfService() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))]">
      <div className="container mx-auto max-w-3xl px-4 py-16 md:py-24">
        <h1 className="mb-8 text-4xl font-semibold tracking-tight">Terms of Service</h1>
        <p className="mb-12 text-[hsl(var(--fg-2))]">
          Last Updated: March 26, 2026
        </p>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p className="lead text-lg text-muted-foreground">
            Welcome to atlas.core. These Terms of Service govern your access to and use of our fitness application, website, and related services. By creating an account or using atlas.core, you agree to these Terms.
          </p>

          <section className="mt-12">
            <h2 className="text-2xl font-semibold">1. Account Registration & Eligibility</h2>

            <h3 className="mt-6 text-lg font-medium">Eligibility</h3>
            <p>
              You must be at least 16 years old to use atlas.core. By registering, you represent that you meet this requirement and that all information you provide is accurate and complete.
            </p>

            <h3 className="mt-6 text-lg font-medium">Account Security</h3>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. Notify us immediately of any unauthorized access.
            </p>

            <h3 className="mt-6 text-lg font-medium">Account Sharing</h3>
            <p>
              Accounts are personal and non-transferable. Sharing credentials or allowing others to use your account is prohibited and may result in suspension.
            </p>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-semibold">2. Subscriptions, Trials & Billing</h2>

            <h3 className="mt-6 text-lg font-medium">Free Trials</h3>
            <p>
              We may offer limited-time free trials. Trials automatically convert to paid subscriptions unless cancelled before the trial ends. Trial eligibility is limited to new users.
            </p>

            <h3 className="mt-6 text-lg font-medium">Subscription Terms</h3>
            <ul className="list-disc pl-6">
              <li>Subscriptions are billed in advance on a recurring basis (monthly or annual)</li>
              <li>Prices are displayed before purchase and may change with 30 days notice</li>
              <li>You authorize us to charge your selected payment method</li>
              <li>Failed payments may result in service suspension after a grace period</li>
            </ul>

            <h3 className="mt-6 text-lg font-medium">Cancellation</h3>
            <p>
              You may cancel your subscription at any time through account settings or by contacting support. Cancellation takes effect at the end of the current billing period. No refunds for partial periods unless required by law.
            </p>

            <h3 className="mt-6 text-lg font-medium">Refund Policy</h3>
            <p>
              Refunds are evaluated on a case-by-case basis for billing errors or technical issues. Subscription cancellations do not entitle you to refunds for previous payments.
            </p>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-semibold">3. Acceptable Use</h2>

            <h3 className="mt-6 text-lg font-medium">Prohibited Activities</h3>
            <p>You may not use atlas.core to:</p>
            <ul className="list-disc pl-6">
              <li>Harass, abuse, or threaten other users</li>
              <li>Upload illegal, harmful, or sexually explicit content</li>
              <li>Impersonate others or misrepresent your identity</li>
              <li>Attempt to access other users' accounts or data</li>
              <li>Interfere with app functionality or security measures</li>
              <li>Use automated systems to scrape or manipulate data</li>
              <li>Distribute malware or engage in phishing</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>

            <h3 className="mt-6 text-lg font-medium">Health Disclaimers</h3>
            <p>
              atlas.core provides fitness guidance but is not a medical service. Consult healthcare professionals before beginning any exercise program. We are not liable for injuries or health issues arising from your use of the app.
            </p>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-semibold">4. User Content</h2>

            <h3 className="mt-6 text-lg font-medium">Your Content</h3>
            <p>
              You retain ownership of photos, posts, and other content you upload. By uploading content, you grant atlas.core a limited license to store, display, and process it solely to operate and improve our services.
            </p>

            <h3 className="mt-6 text-lg font-medium">Content Representations</h3>
            <p>You represent that your content does not:</p>
            <ul className="list-disc pl-6">
              <li>Infringe third-party intellectual property rights</li>
              <li>Contain private information of others without consent</li>
              <li>Violate applicable laws or platform policies</li>
              <li>Include prohibited content categories (sexual, violent, hateful)</li>
            </ul>

            <h3 className="mt-6 text-lg font-medium">Content Removal</h3>
            <p>
              We reserve the right to remove any content that violates these Terms or our policies without prior notice. Repeated violations may result in account suspension or termination.
            </p>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-semibold">5. Moderation & Enforcement</h2>

            <h3 className="mt-6 text-lg font-medium">Our Rights</h3>
            <p>atlas.core may, at our discretion:</p>
            <ul className="list-disc pl-6">
              <li>Review user-generated content for policy compliance</li>
              <li>Remove content that violates our guidelines</li>
              <li>Issue warnings to users</li>
              <li>Suspend accounts temporarily or permanently</li>
              <li>Ban users from the platform</li>
              <li>Report illegal activity to appropriate authorities</li>
            </ul>

            <h3 className="mt-6 text-lg font-medium">No Obligation to Monitor</h3>
            <p>
              We are not obligated to monitor all user content. Our failure to remove content does not constitute endorsement or waiver of our rights.
            </p>

            <h3 className="mt-6 text-lg font-medium">Appeals</h3>
            <p>
              Users may appeal content removals or account actions through our support channels. We review appeals in good faith but our decisions are final.
            </p>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-semibold">6. Intellectual Property</h2>

            <h3 className="mt-6 text-lg font-medium">Our Rights</h3>
            <p>
              atlas.core and its content (excluding user-generated content) are protected by copyright, trademark, and other laws. You may not copy, modify, or distribute our materials without written permission.
            </p>

            <h3 className="mt-6 text-lg font-medium">Feedback</h3>
            <p>
              Suggestions or feedback you provide may be used by atlas.core without compensation or attribution.
            </p>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-semibold">7. Termination</h2>

            <h3 className="mt-6 text-lg font-medium">By You</h3>
            <p>
              You may delete your account at any time. Upon deletion, your data will be removed per our Privacy Policy retention periods.
            </p>

            <h3 className="mt-6 text-lg font-medium">By Us</h3>
            <p>We may suspend or terminate your account for:</p>
            <ul className="list-disc pl-6">
              <li>Violations of these Terms</li>
              <li>Extended periods of inactivity</li>
              <li>Fraudulent or illegal activity</li>
              <li>Non-payment of subscription fees</li>
            </ul>

            <h3 className="mt-6 text-lg font-medium">Effect of Termination</h3>
            <p>
              Upon termination, your access to atlas.core ceases immediately. Provisions regarding liability, indemnification, and dispute resolution survive termination.
            </p>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-semibold">8. Disclaimers & Limitation of Liability</h2>

            <h3 className="mt-6 text-lg font-medium">As-Is Basis</h3>
            <p>
              atlas.core is provided "as is" without warranties of any kind, express or implied. We do not guarantee uninterrupted, error-free service.
            </p>

            <h3 className="mt-6 text-lg font-medium">Limitation of Liability</h3>
            <p>
              To the maximum extent permitted by law, atlas.core and its affiliates shall not be liable for:
            </p>
            <ul className="list-disc pl-6">
              <li>Indirect, incidental, or consequential damages</li>
              <li>Lost profits or data</li>
              <li>Personal injury or property damage</li>
              <li>Damages exceeding the amount you paid us in the 12 months preceding the claim</li>
            </ul>

            <h3 className="mt-6 text-lg font-medium">Exclusions</h3>
            <p>
              Some jurisdictions do not allow certain limitations, so these restrictions may not apply to you.
            </p>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-semibold">9. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless atlas.core from claims arising from:
            </p>
            <ul className="list-disc pl-6">
              <li>Your use of the service</li>
              <li>Your user-generated content</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of third-party rights</li>
            </ul>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-semibold">10. Governing Law & Dispute Resolution</h2>

            <h3 className="mt-6 text-lg font-medium">Governing Law</h3>
            <p>
              These Terms are governed by and construed in accordance with the laws of the Federative Republic of Brazil, without regard to conflict of law principles. For users outside Brazil, mandatory consumer protection laws of your country of residence may also apply to the extent they cannot be waived.
            </p>

            <h3 className="mt-6 text-lg font-medium">Dispute Resolution</h3>
            <p>
              Any disputes arising from these Terms shall first be submitted to good-faith negotiation for a period of 30 days. If unresolved, disputes shall be submitted to the courts of the city of Sao Paulo, State of Sao Paulo, Brazil, which shall have exclusive jurisdiction, except where mandatory local consumer protection laws require otherwise. You retain the right to bring claims in your local small claims court where applicable.
            </p>

            <h3 className="mt-6 text-lg font-medium">Informal Resolution</h3>
            <p>
              Before initiating formal proceedings, we encourage you to contact us at support@atlascore.app to seek informal resolution.
            </p>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-semibold">11. General Provisions</h2>

            <h3 className="mt-6 text-lg font-medium">Entire Agreement</h3>
            <p>
              These Terms constitute the entire agreement between you and atlas.core regarding the service.
            </p>

            <h3 className="mt-6 text-lg font-medium">Severability</h3>
            <p>
              If any provision is found unenforceable, the remaining provisions remain in effect.
            </p>

            <h3 className="mt-6 text-lg font-medium">Waiver</h3>
            <p>
              Our failure to enforce any right does not waive that right for future breaches.
            </p>

            <h3 className="mt-6 text-lg font-medium">Assignment</h3>
            <p>
              We may assign these Terms in connection with a merger, acquisition, or asset sale. You may not assign without our consent.
            </p>

            <h3 className="mt-6 text-lg font-medium">Notices</h3>
            <p>
              We may send notices via email, in-app notification, or posting on our website.
            </p>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-semibold">12. Contact</h2>
            <p>
              For questions about these Terms:
            </p>
            <div className="mt-4 space-y-2">
              <p><strong>Email:</strong> legal@atlascore.app</p>
              <p><strong>Address:</strong> Sao Paulo, SP, Brazil</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
