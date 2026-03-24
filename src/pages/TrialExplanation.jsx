import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, HelpCircle, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

const FAQS = [
  {
    q: 'What happens after the trial ends?',
    a: 'Your subscription will automatically begin at $9.99/month unless you cancel before the trial ends.',
  },
  {
    q: 'Can I cancel during the trial?',
    a: 'Yes, you can cancel anytime during the trial and pay nothing.',
  },
  {
    q: 'Will I lose my data if I cancel?',
    a: 'No, your data is always saved. If you cancel, you can still access basic features.',
  },
  {
    q: 'How do I cancel?',
    a: 'Go to Settings > Subscription > Cancel Subscription, or manage via App Store/Google Play.',
  },
];

export default function TrialExplanation() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))]">
      <div className="flex items-center gap-4 p-4 border-b border-[hsl(var(--border))]">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-[hsl(var(--fill))] rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">About Your Trial</h1>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="p-4 rounded-xl bg-[hsl(var(--fill))] mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[hsl(var(--accent-primary))] shrink-0 mt-0.5" />
              <div>
                <p className="font-medium mb-1">Important</p>
                <p className="text-sm text-[hsl(var(--fg-2))]">
                  Your free trial gives you full Premium access for 14 days. 
                  We'll send you a reminder 2 days before it ends so you can decide if you want to continue.
                </p>
              </div>
            </div>
          </div>

          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <HelpCircle className="w-4 h-4" /> Frequently Asked Questions
          </h2>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
                <p className="font-medium text-sm mb-1">{faq.q}</p>
                <p className="text-sm text-[hsl(var(--fg-2))]">{faq.a}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-green-500/10 text-center">
              <CheckCircle2 className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <p className="font-medium text-sm">Full Access</p>
              <p className="text-xs text-[hsl(var(--fg-2))]">All Premium features</p>
            </div>
            <div className="p-4 rounded-xl bg-red-500/10 text-center">
              <XCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
              <p className="font-medium text-sm">Cancel Anytime</p>
              <p className="text-xs text-[hsl(var(--fg-2))]">No commitment</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
