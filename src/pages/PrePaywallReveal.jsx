import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Check, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AtlasCoreLogoSVG from '@/components/AtlasCoreLogoSVG';

const BENEFITS = [
  'Advanced analytics & insights',
  'Custom workout protocols',
  'Nutrition meal planning',
  'Progress photo tracking',
  'Lab exam integration',
  'Priority support',
];

export default function PrePaywallReveal() {
  const navigate = useNavigate();

  return (
    <div className="mobile-page bg-[hsl(var(--bg))]">
      <div className="shrink-0 px-4 pt-3 pb-2" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top, 0px))' }}>
        <AtlasCoreLogoSVG width={32} height={16} />
      </div>

      <div className="safe-scroll flex-1 px-6 py-4 max-w-md mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[hsl(var(--accent-primary))]/10 text-[hsl(var(--accent-primary))] text-sm font-medium mb-4">
              <Crown className="w-4 h-4" />
              Premium
            </div>
            <h1 className="text-3xl font-bold mb-2">Unlock Your Transformation</h1>
            <p className="text-[hsl(var(--fg-2))]">
              Join thousands who achieved their goals with atlas.core Premium
            </p>
          </div>

          <div className="bg-gradient-to-br from-[hsl(var(--accent-primary))]/20 to-[hsl(var(--accent-secondary))]/20 border border-[hsl(var(--accent-primary))]/30 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-[hsl(var(--accent-primary))]" />
              <span className="font-semibold">What you get</span>
            </div>
            <ul className="space-y-3">
              {BENEFITS.map((benefit, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <div className="w-5 h-5 rounded-full bg-[hsl(var(--accent-primary))]/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-[hsl(var(--accent-primary))]" />
                  </div>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          <div className="text-center pb-4">
            <p className="text-4xl font-bold">$9.99<span className="text-lg font-normal text-[hsl(var(--fg-2))]">/month</span></p>
            <p className="text-sm text-[hsl(var(--fg-2))] mt-1">or $79.99/year (save 33%)</p>
          </div>
        </motion.div>
      </div>

      <div className="shrink-0 px-6 pt-3 pb-4 border-t border-[hsl(var(--border)/0.4)] bg-[hsl(var(--bg)/0.96)]" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))' }}>
        <Button onClick={() => navigate('/pricing')} className="w-full mb-3">
          Start Free Trial
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
        <button
          onClick={() => navigate('/today')}
          className="w-full text-sm text-[hsl(var(--fg-3))] hover:text-[hsl(var(--fg-2))]"
        >
          Continue with limited free version
        </button>
      </div>
    </div>
  );
}
