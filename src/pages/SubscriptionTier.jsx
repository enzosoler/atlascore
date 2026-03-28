import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Crown, Check, Sparkles, Zap, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TIERS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: ['Basic workout tracking', 'Limited nutrition logs', '3 progress photos'],
    cta: 'Current Plan',
    current: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$9.99',
    period: '/month',
    features: ['Unlimited everything', 'Advanced analytics', 'Custom protocols', 'Priority support', 'Lab integration'],
    cta: 'Upgrade',
    current: false,
    popular: true,
  },
  {
    id: 'elite',
    name: 'Elite',
    price: '$19.99',
    period: '/month',
    features: ['Everything in Premium', '1-on-1 coaching', 'Custom meal plans', 'Video form checks', 'Direct line to experts'],
    cta: 'Contact Us',
    current: false,
  },
];

export default function SubscriptionTier() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))]">
      <div className="flex items-center gap-4 p-4 border-b border-[hsl(var(--border))]">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-[hsl(var(--fill))] rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">Subscription</h1>
      </div>

      <div className="p-4 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Choose Your Plan</h2>
            <p className="text-[hsl(var(--fg-2))]">Unlock the full power of atlas.core</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {TIERS.map((tier) => (
              <div
                key={tier.id}
                className={`p-6 rounded-2xl border relative ${
                  tier.popular
                    ? 'border-[hsl(var(--accent-primary))] bg-[hsl(var(--accent-primary))]/5'
                    : 'border-[hsl(var(--border))] bg-[hsl(var(--card))]'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[hsl(var(--accent-primary))] text-white text-xs font-medium">
                    Most Popular
                  </div>
                )}
                
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[hsl(var(--fill))] mb-3">
                    {tier.id === 'free' && <Target className="w-6 h-6 text-[hsl(var(--fg-2))]" />}
                    {tier.id === 'premium' && <Crown className="w-6 h-6 text-[hsl(var(--accent-primary))]" />}
                    {tier.id === 'elite' && <Sparkles className="w-6 h-6 text-yellow-500" />}
                  </div>
                  <h3 className="text-xl font-bold">{tier.name}</h3>
                  <div className="flex items-baseline justify-center gap-1 mt-2">
                    <span className="text-3xl font-bold">{tier.price}</span>
                    <span className="text-[hsl(var(--fg-2))]">{tier.period}</span>
                  </div>
                </div>

                <ul className="space-y-2 mb-6">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  variant={tier.current ? 'outline' : tier.popular ? 'default' : 'outline'}
                  className="w-full"
                  disabled={tier.current}
                  onClick={() => tier.id === 'elite' ? navigate('/contact') : navigate('/pricing')}
                >
                  {tier.current ? 'Current Plan' : tier.cta}
                </Button>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-[hsl(var(--fg-3))] mt-8">
            All plans include a 14-day free trial. Cancel anytime.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
