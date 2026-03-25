/**
 * StoryLanding — Frictionless Onboarding for Instagram Story Referrals
 *
 * When a new user clicks a link from an Instagram Story card, they land here.
 * The goal: get them into the core value proposition (logging their first meal
 * or workout) in under 20 seconds, BEFORE asking for payment.
 *
 * Route: /start?ref=story&card=nutrition
 *
 * Flow:
 *   1. Show a fast, compelling screen that mirrors the card they saw
 *   2. Single CTA: "Start tracking" → redirects to signup with auto-redirect
 *      to the relevant module (Nutrition or Workouts) after auth
 *   3. No paywall, no long onboarding — straight to value
 */

import React, { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Dumbbell,
  Flame,
  UtensilsCrossed,
  BarChart3,
  Trophy,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { ROUTES } from '@/lib/routes';
import { captureReferralParams } from '@/hooks/useReferralTracking';
import AtlasCoreLogoSVG from '@/components/AtlasCoreLogoSVG';

// ─── Card-specific content ──────────────────────────────────────────────────────

const CARD_CONTENT = {
  nutrition: {
    icon: UtensilsCrossed,
    color: 'linear-gradient(135deg, #0A84FF 0%, #38A3FF 100%)',
    headline: 'Track your own macros',
    subline: 'Log meals, hit your protein target, and see your nutrition in one place.',
    cta: 'Log your first meal',
    destination: ROUTES.nutrition,
  },
  workout: {
    icon: Dumbbell,
    color: 'linear-gradient(135deg, #FF9F0A 0%, #FFCC00 100%)',
    headline: 'Start your streak',
    subline: 'Log workouts, build consistency, and watch your streak grow.',
    cta: 'Log your first workout',
    destination: ROUTES.workouts,
  },
  streak: {
    icon: Flame,
    color: 'linear-gradient(135deg, #FF6B35 0%, #FF9F0A 100%)',
    headline: 'Start your streak',
    subline: 'Track every session. Build momentum. See how far you can go.',
    cta: 'Start tracking',
    destination: ROUTES.workouts,
  },
  mood: {
    icon: Trophy,
    color: 'linear-gradient(135deg, #34C759 0%, #30D158 100%)',
    headline: 'Track your own macros',
    subline: 'Mood, energy, sleep, and nutrition — all connected in one dashboard.',
    cta: 'Start tracking',
    destination: ROUTES.today,
  },
  weight: {
    icon: BarChart3,
    color: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
    headline: 'Track your own macros',
    subline: 'Weight, body fat, measurements — see your progress over time.',
    cta: 'Start tracking',
    destination: ROUTES.today,
  },
};

const DEFAULT_CONTENT = {
  icon: Zap,
  color: 'linear-gradient(135deg, #0A84FF 0%, #38A3FF 100%)',
  headline: 'Track your own macros',
  subline: 'Training, nutrition, labs, and progress — organized in one place.',
  cta: 'Start tracking',
  destination: ROUTES.today,
};

// ─── Component ──────────────────────────────────────────────────────────────────

export default function StoryLanding() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuth();

  const cardType = searchParams.get('card') || 'nutrition';
  const content = CARD_CONTENT[cardType] || DEFAULT_CONTENT;
  const Icon = content.icon;

  // Capture referral params on mount
  useEffect(() => {
    captureReferralParams();
  }, []);

  // If already authenticated, skip straight to the destination
  useEffect(() => {
    if (isAuthenticated && user) {
      // If onboarding not completed, go to onboarding (it's fast)
      if (!user.onboarding_completed) {
        navigate(ROUTES.onboarding, { replace: true });
      } else {
        navigate(content.destination, { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, content.destination]);

  const handleCTA = () => {
    // Send to signup with auto-redirect to the relevant module after auth
    const next = encodeURIComponent(content.destination);
    navigate(`${ROUTES.auth}?mode=signup&next=${next}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--bg))] p-5">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-center gap-2.5 mb-8"
        >
          <AtlasCoreLogoSVG width={48} height={24} className="shrink-0" />
          <span className="text-[17px] font-bold tracking-tight">
            <span className="text-[hsl(var(--accent-primary))]">atlas</span>
            <span className="text-[hsl(var(--fg))]">.core</span>
          </span>
        </motion.div>

        {/* Card-style hero */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="relative overflow-hidden rounded-[24px] p-6 text-white shadow-[0_24px_60px_rgba(0,0,0,0.28)]"
          style={{ background: content.color }}
        >
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
          <div className="absolute -left-4 bottom-0 h-24 w-24 rounded-full bg-white/8" />

          <div className="relative text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/16">
              <Icon className="h-8 w-8 text-white" strokeWidth={1.75} />
            </div>

            <h1 className="mt-5 text-[24px] font-bold tracking-[-0.04em] leading-tight">
              {content.headline}
            </h1>
            <p className="mt-3 text-[14px] leading-relaxed text-white/80 max-w-[280px] mx-auto">
              {content.subline}
            </p>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="mt-6 space-y-3"
        >
          <button
            onClick={handleCTA}
            className="btn btn-primary w-full h-12 rounded-2xl text-[14px] gap-2"
          >
            {content.cta}
            <ArrowRight className="w-4 h-4" strokeWidth={2} />
          </button>

          <p className="text-center text-[11px] text-[hsl(var(--fg-3))]">
            Free to start \u00B7 No credit card required
          </p>
        </motion.div>

        {/* Already have an account */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <button
            onClick={() => navigate(`${ROUTES.auth}?mode=login&next=${encodeURIComponent(content.destination)}`)}
            className="text-[12px] font-medium text-[hsl(var(--fg-2))] hover:text-[hsl(var(--fg))] transition-colors"
          >
            Already have an account? Sign in
          </button>
        </motion.div>
      </div>
    </div>
  );
}
