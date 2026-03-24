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
    <div className="min-h-screen bg-[hsl(var(--bg))] flex flex-col">
      <div className="p-4">
        <AtlasCoreLogoSVG width={32} height={16} />
      </div>

      <div className="flex-1 px-6 py-4 max-w-md mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[hsl(var(--accent-primary))]/10 text-[hsl(var(--accent-primary))] text-sm font-medium mb-4">
              <Crown className="w-4 h-4" />
              Premium
            </div>
            <h1 className="text-3xl font-bold mb-2">Unlock Your Transformation</h1>
            <p className="text-[hsl(var(--fg-2))]">
              Join thousands who achieved their goals with Atlas Core Premium
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

          <div className="text-center mb-6">
            <p className="text-4xl font-bold">$9.99<span className="text-lg font-normal text-[hsl(var(--fg-2))]">/month</span></p>
            <p className="text-sm text-[hsl(var(--fg-2))] mt-1">or $79.99/year (save 33%)</p>
          </div>

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
        </motion.div>
      </div>
    </div>
  );
}
