import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Camera, Brain, Dumbbell, Utensils, ImageIcon, BarChart3,
  ArrowRight, Gift, Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/routes';
import { useSubscription } from '@/lib/SubscriptionContext';
import { useT } from '@/lib/i18nContext';

const LOCKED_FEATURES = [
  { key: 'ai_food_photo', icon: Camera },
  { key: 'atlas_ai', icon: Brain },
  { key: 'ai_workout_generation', icon: Dumbbell },
  { key: 'ai_diet_generation', icon: Utensils },
  { key: 'progress_photos', icon: ImageIcon },
  { key: 'advanced_analytics', icon: BarChart3 },
];

export default function Reactivation() {
  const navigate = useNavigate();
  const { subscription, isTrialExpired } = useSubscription();
  const t = useT();

  const handleReactivate = () => {
    navigate(`${ROUTES.pricing}?discount=REACTIVATE50`);
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))] flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 max-w-md mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full"
        >
          {/* Hero */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[hsl(var(--accent-primary))] to-[hsl(var(--accent-secondary))] flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">👋</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">{t('reactivation.title')}</h1>
            <p className="text-[hsl(var(--fg-2))] leading-relaxed">
              {t('reactivation.subtitle')}
            </p>
          </div>

          {/* Offer card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[hsl(var(--accent-primary))] to-[hsl(var(--accent-secondary))] p-[1px] mb-8"
          >
            <div className="rounded-2xl bg-[hsl(var(--bg))] p-5">
              <div className="flex items-center gap-2 mb-3">
                <Gift className="w-5 h-5 text-[hsl(var(--accent-primary))]" />
                <span className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--accent-primary))]">
                  {t('reactivation.offerBadge')}
                </span>
              </div>
              <p className="text-2xl font-bold mb-1">{t('reactivation.offerHeadline')}</p>
              <p className="text-sm text-[hsl(var(--fg-2))]">
                {t('reactivation.offerDetail')}
              </p>
            </div>
          </motion.div>

          {/* Locked features */}
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-[hsl(var(--fg-2))] uppercase tracking-wider mb-3">
              {t('reactivation.missingTitle')}
            </h2>
            <div className="space-y-2">
              {LOCKED_FEATURES.map((feat, i) => (
                <motion.div
                  key={feat.key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[hsl(var(--fill))]"
                >
                  <div className="p-2 rounded-lg bg-[hsl(var(--accent-primary))]/10">
                    <feat.icon className="w-5 h-5 text-[hsl(var(--accent-primary))]" />
                  </div>
                  <p className="text-sm font-medium flex-1">
                    {t(`reactivation.features.${feat.key}`)}
                  </p>
                  <Lock className="w-4 h-4 text-[hsl(var(--fg-3))]" />
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTAs */}
          <Button onClick={handleReactivate} className="w-full mb-3">
            {t('reactivation.ctaPrimary')}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          <button
            onClick={() => navigate(ROUTES.today)}
            className="w-full text-sm text-[hsl(var(--fg-3))] hover:text-[hsl(var(--fg-2))] py-2"
          >
            {t('reactivation.ctaSecondary')}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
