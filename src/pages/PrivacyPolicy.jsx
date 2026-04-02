import { useTranslation } from '@/hooks/useTranslation';

export default function PrivacyPolicy() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))]">
      <div className="container mx-auto max-w-3xl px-4 py-16 md:py-24">
        <h1 className="mb-8 text-4xl font-semibold tracking-tight">Privacy Policy</h1>
        <p className="mb-12 text-[hsl(var(--fg-2))]">
          Last Updated: March 26, 2026
        </p>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p className="lead text-lg text-[hsl(var(--fg-2))]">
            atlas.core is committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our fitness application and related services.
          </p>

          <section className="mt-12">
            <h2 className="text-2xl font-semibold">1. Information We Collect</h2>

            <h3 className="mt-6 text-lg font-medium">Account Information</h3>
            <p>
              When you create an account, we collect your name, email address, and authentication credentials. We may also collect optional profile information such as age, fitness goals, and preferences.
            </p>

            <h3 className="mt-6 text-lg font-medium">Fitness & Health Data</h3>
            <p>
              With your explicit consent, we collect workout logs, nutrition entries, body measurements, progress photos, and other health-related data you choose to track. This data is used solely to provide and improve your fitness experience.
            </p>

            <h3 className="mt-6 text-lg font-medium">Subscription & Billing Data</h3>
            <p>
              We process payment information through secure third-party processors. We store subscription status, billing history, and related transactional data necessary to maintain your account.
            </p>

            <h3 className="mt-6 text-lg font-medium">Device & App Data</h3>
            <p>
              We collect device type, operating system, app version, and crash logs to improve app performance and reliability. We do not collect precise location data without explicit permission.
            </p>

            <h3 className="mt-6 text-lg font-medium">User-Generated Content</h3>
            <p>
              Photos, posts, comments, and other content you create or upload may be stored and processed to deliver the services you request.
            </p>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-semibold">2. How We Use Your Information</h2>

            <h3 className="mt-6 text-lg font-medium">To Provide Our Services</h3>
            <p>
              We use your data to personalize workouts, track progress, enable social features, and deliver the core fitness experience you signed up for.
            </p>

            <h3 className="mt-6 text-lg font-medium">To Improve Our Product</h3>
            <p>
              We analyze aggregated, anonymized usage patterns to enhance features, fix issues, and develop new capabilities.
            </p>

            <h3 className="mt-6 text-lg font-medium">For Security & Safety</h3>
            <p>
              We monitor for fraudulent activity, abuse, and violations of our Terms of Service. This includes automated scanning and, when necessary, internal review of user-generated content to ensure platform safety and compliance.
            </p>

            <h3 className="mt-6 text-lg font-medium">For Communication</h3>
            <p>
              We send service-related notifications, support responses, and optional marketing communications (which you can opt out of at any time).
            </p>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-semibold">3. Content Review & Safety</h2>

            <h3 className="mt-6 text-lg font-medium">Internal Review</h3>
            <p>
              To maintain a safe and trusted environment, atlas.core may review user-generated content—including photos—when necessary for:
            </p>
            <ul className="list-disc pl-6">
              <li>Safety and abuse prevention</li>
              <li>Customer support resolution</li>
              <li>Platform integrity and operational needs</li>
              <li>Legal compliance and law enforcement requests</li>
            </ul>
            <p className="mt-4">
              This review is conducted by trained staff with appropriate access controls and is logged for accountability. Review is limited to specific, justified purposes and is not routine surveillance.
            </p>

            <h3 className="mt-6 text-lg font-medium">Automated Processing</h3>
            <p>
              We use automated systems to detect potential violations of our content policies (such as prohibited imagery or abuse patterns). Flagged content may be queued for human review.
            </p>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-semibold">4. Data Sharing & Processors</h2>
            <p>
              We do not sell your personal information. We share data only with trusted service providers who help us operate atlas.core:
            </p>

            <div className="mt-4 overflow-hidden rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Processor</th>
                    <th className="px-4 py-3 text-left font-medium">Purpose</th>
                    <th className="px-4 py-3 text-left font-medium">Data Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="px-4 py-3">Stripe</td>
                    <td className="px-4 py-3">Payment processing</td>
                    <td className="px-4 py-3">Billing info, subscription status</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Supabase</td>
                    <td className="px-4 py-3">Database & authentication</td>
                    <td className="px-4 py-3">Account data, fitness data</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Cloud storage providers</td>
                    <td className="px-4 py-3">Media storage</td>
                    <td className="px-4 py-3">Photos, profile images</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Analytics providers</td>
                    <td className="px-4 py-3">Product improvement</td>
                    <td className="px-4 py-3">Anonymized usage metrics</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="mt-4">
              All processors are bound by contractual obligations to protect your data and use it only for specified purposes.
            </p>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-semibold">5. Data Retention</h2>
            <p>
              We retain your personal information as long as your account is active or as needed to provide you services. Upon account deletion, we remove or anonymize your data within 30 days, except where:
            </p>
            <ul className="list-disc pl-6">
              <li>Retention is required by law</li>
              <li>Data is necessary for fraud prevention</li>
              <li>Data is part of an unresolved support or legal matter</li>
            </ul>
            <p className="mt-4">
              Progress photos and sensitive health data are subject to enhanced retention controls and can be permanently deleted immediately upon account closure request.
            </p>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-semibold">6. Your Rights & Choices</h2>

            <h3 className="mt-6 text-lg font-medium">Access & Portability</h3>
            <p>
              You can request a copy of your personal data in a portable format at any time through your account settings or by contacting support.
            </p>

            <h3 className="mt-6 text-lg font-medium">Correction & Deletion</h3>
            <p>
              You may update or delete most information directly in the app. For account deletion requests, contact privacy@atlascore.app.
            </p>

            <h3 className="mt-6 text-lg font-medium">Consent Withdrawal</h3>
            <p>
              You can revoke consent for health data processing or marketing communications at any time. This may limit certain app features.
            </p>

            <h3 className="mt-6 text-lg font-medium">Regional Rights</h3>

            <h4 className="mt-4 text-base font-medium">Brazil (LGPD)</h4>
            <p>
              Under the Lei Geral de Protecao de Dados (LGPD), you have the right to: confirm the existence of data processing; access your data; correct incomplete or inaccurate data; anonymize, block, or delete unnecessary data; request data portability; delete personal data processed with your consent; obtain information about public and private entities with whom we share data; and revoke consent at any time. To exercise these rights, contact privacy@atlascore.app.
            </p>

            <h4 className="mt-4 text-base font-medium">European Economic Area (GDPR)</h4>
            <p>
              If you are located in the EEA or UK, you have the right to: access your personal data; rectify inaccurate data; erase your data ("right to be forgotten"); restrict processing; data portability; object to processing based on legitimate interests; and not be subject to solely automated decision-making. You also have the right to lodge a complaint with your local data protection authority. Our legal basis for processing is your consent (for health data) and legitimate interest (for service operation).
            </p>

            <h4 className="mt-4 text-base font-medium">California (CCPA/CPRA)</h4>
            <p>
              California residents have the right to: know what personal information is collected and how it is used; request deletion of personal information; opt out of the sale or sharing of personal information (we do not sell your data); and not be discriminated against for exercising these rights. To submit a request, contact privacy@atlascore.app.
            </p>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-semibold">7. Security Measures</h2>
            <p>
              We implement industry-standard security practices:
            </p>
            <ul className="list-disc pl-6">
              <li>End-to-end encryption for data in transit</li>
              <li>Encryption at rest for stored data</li>
              <li>Strict access controls and role-based permissions</li>
              <li>Regular security audits and penetration testing</li>
              <li>Incident response procedures</li>
            </ul>
            <p className="mt-4">
              While we employ robust safeguards, no system is completely secure. We promptly notify users of any security incidents affecting their personal data as required by law.
            </p>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-semibold">8. Children's Privacy</h2>
            <p>
              atlas.core is not intended for users under 16. We do not knowingly collect data from children. If you believe we have collected data from a minor, contact us immediately for deletion.
            </p>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-semibold">9. International Data Transfers</h2>
            <p>
              atlas.core is operated from Brazil. Your data may be processed in countries outside your country of residence, including the United States (where our infrastructure providers Supabase and Stripe operate). When we transfer data internationally, we rely on: Standard Contractual Clauses (SCCs) approved by the European Commission for EEA/UK transfers; adequacy decisions where available; and contractual data processing agreements with all service providers. All transfers are conducted with appropriate safeguards to ensure your data receives equivalent protection regardless of where it is processed.
            </p>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-semibold">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy periodically. Material changes will be communicated via email or in-app notice at least 30 days before taking effect. Your continued use after changes constitutes acceptance.
            </p>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-semibold">11. Contact Us</h2>
            <p>
              For privacy-related questions, data requests, or concerns:
            </p>
            <div className="mt-4 space-y-2">
              <p><strong>Email:</strong> privacy@atlascore.app</p>
              <p><strong>Address:</strong> Sao Paulo, SP, Brazil</p>
              <p><strong>Data Protection Contact:</strong> privacy@atlascore.app</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
