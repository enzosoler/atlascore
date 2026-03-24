import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, Crown, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FEATURES = [
  'Unlimited workout plans',
  'Advanced analytics',
  'Custom meal plans',
  'Progress photo tracking',
  'Lab integration',
  'Priority support',
];

export default function UpgradePrompts() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[hsl(var(--bg))] rounded-2xl max-w-md w-full p-6 relative"
      >
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-4 right-4 p-2 hover:bg-[hsl(var(--fill))] rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 p-3 rounded-full bg-[hsl(var(--accent-primary))]/10 mb-4">
            <Crown className="w-6 h-6 text-[hsl(var(--accent-primary))]" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Upgrade to Premium</h2>
          <p className="text-[hsl(var(--fg-2))] text-sm">
            Unlock the full power of Atlas Core
          </p>
        </div>

        <div className="space-y-2 mb-6">
          {FEATURES.map((feature, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <div className="w-5 h-5 rounded-full bg-[hsl(var(--accent-primary))]/20 flex items-center justify-center">
                <Check className="w-3 h-3 text-[hsl(var(--accent-primary))]" />
              </div>
              {feature}
            </div>
          ))}
        </div>

        <div className="text-center mb-6">
          <p className="text-3xl font-bold">$9.99<span className="text-base font-normal">/mo</span></p>
        </div>

        <Button onClick={() => navigate('/pricing')} className="w-full mb-3">
          <Sparkles className="w-4 h-4 mr-2" />
          Upgrade Now
        </Button>

        <button 
          onClick={() => navigate(-1)}
          className="w-full text-sm text-[hsl(var(--fg-3))] hover:text-[hsl(var(--fg-2))]"
        >
          Maybe later
        </button>
      </motion.div>
    </div>
  );
}
