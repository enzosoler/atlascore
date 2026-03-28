import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Shield, ExternalLink } from 'lucide-react';

const SECTIONS = [
  {
    title: 'Terms of Service',
    icon: FileText,
    content: `
1. Acceptance of Terms
By accessing and using atlas.core, you accept and agree to be bound by these Terms of Service.

2. User Accounts
You are responsible for maintaining the confidentiality of your account credentials.

3. Acceptable Use
You agree to use the platform only for lawful purposes and in accordance with these Terms.

4. Subscription
Premium features require a valid subscription. You may cancel at any time.

5. Termination
We reserve the right to terminate accounts that violate these terms.
    `,
  },
  {
    title: 'Privacy Policy',
    icon: Shield,
    content: `
1. Data Collection
We collect health data, workout logs, and usage information to provide our services.

2. Data Use
Your data is used to personalize your experience and improve our platform.

3. Data Protection
We employ industry-standard encryption and security measures.

4. Data Sharing
We do not sell your personal information to third parties.

5. Your Rights
You can request data export or deletion at any time.
    `,
  },
];

export default function TermsPrivacy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))]">
      <div className="flex items-center gap-4 p-4 border-b border-[hsl(var(--border))]">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-[hsl(var(--fill))] rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">Legal</h1>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {SECTIONS.map((section) => (
            <div key={section.title} className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <section.icon className="w-4 h-4 text-[hsl(var(--accent-primary))]" />
                <h2 className="font-semibold">{section.title}</h2>
              </div>
              <div className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
                <pre className="whitespace-pre-wrap text-sm text-[hsl(var(--fg-2))] font-sans">
                  {section.content}
                </pre>
              </div>
            </div>
          ))}

          <div className="p-4 rounded-xl bg-[hsl(var(--fill))]">
            <p className="text-sm text-[hsl(var(--fg-2))] mb-2">
              Last updated: January 2024
            </p>
            <a 
              href="#" 
              className="text-sm text-[hsl(var(--accent-primary))] flex items-center gap-1 hover:underline"
            >
              View full legal documents
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
