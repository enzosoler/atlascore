import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Crown, Calendar, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TRIAL_FEATURES = [
  'Full access to all Premium features',
  'No commitment, cancel anytime',
  'Reminders before trial ends',
  'Keep your data if you cancel',
];

export default function TrialStart() {
  const navigate = useNavigate();

  return (
    <div className="mobile-screen bg-[hsl(var(--bg))]">
      <div className="flex-1 flex flex-col justify-center px-6 py-8 max-w-md mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 p-3 rounded-full bg-gradient-to-r from-[hsl(var(--accent-primary))] to-[hsl(var(--accent-secondary))] mb-4">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Start Your Free Trial</h1>
            <p className="text-[hsl(var(--fg-2))]">
              3 days of full access, completely free
            </p>
          </div>

          <div className="space-y-3 mb-8">
            {TRIAL_FEATURES.map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check className="w-3 h-3 text-green-500" />
                </div>
                {feature}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-[hsl(var(--fill))] mb-6">
            <Calendar className="w-5 h-5 text-[hsl(var(--accent-primary))]" />
            <div className="text-sm">
              <p className="font-medium">Trial ends {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
              <p className="text-[hsl(var(--fg-2))]">We'll remind you 2 days before</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-[hsl(var(--fill))] mb-8">
            <Bell className="w-5 h-5 text-[hsl(var(--accent-primary))]" />
            <div className="text-sm">
              <p className="font-medium">$6.99/week after trial</p>
              <p className="text-[hsl(var(--fg-2))]">Or $79.99/year (save 78%)</p>
            </div>
          </div>

          <Button onClick={() => navigate('/payment')} className="w-full">
            Start Free Trial
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>

          <p className="text-center mt-4 text-xs text-[hsl(var(--fg-3))]">
            By starting your trial, you agree to our Terms and Privacy Policy.
            You can cancel anytime before {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
