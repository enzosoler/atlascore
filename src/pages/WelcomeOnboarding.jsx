import React, { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { track } from '@/lib/analytics';
import AtlasCoreLogoSVG from '@/components/AtlasCoreLogoSVG';
import { ROUTES } from '@/lib/routes';

const STORAGE_KEY = 'atlas_has_seen_welcome';

export function markWelcomeSeen() {
  localStorage.setItem(STORAGE_KEY, 'true');
}

export function hasSeenWelcome() {
  return localStorage.getItem(STORAGE_KEY) === 'true';
}

/* ------------------------------------------------------------------ */
/*  Gradient Orb Hero                                                  */
/* ------------------------------------------------------------------ */

function GradientOrbHero() {
  return (
    <div className="relative mx-auto flex h-[300px] w-[300px] items-center justify-center">
      {/* Outer glow */}
      <motion.div
        className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_40%_35%,hsl(var(--brand)/0.30),transparent_60%),radial-gradient(circle_at_65%_70%,hsl(var(--accent-primary)/0.24),transparent_55%)]"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />
      {/* Middle ring */}
      <motion.div
        className="absolute inset-[40px] rounded-full bg-[radial-gradient(circle_at_50%_40%,hsl(var(--brand)/0.18),transparent_65%),radial-gradient(circle_at_55%_65%,hsl(var(--accent-primary)/0.14),transparent_60%)] blur-[1px]"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.0, delay: 0.15, ease: 'easeOut' }}
      />
      {/* Inner core */}
      <motion.div
        className="absolute inset-[80px] rounded-full bg-[radial-gradient(circle_at_45%_45%,hsl(var(--brand)/0.32),hsl(var(--accent-primary)/0.16)_60%,transparent_85%)] shadow-[0_0_80px_hsl(var(--brand)/0.12)]"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.9, delay: 0.3, ease: 'easeOut' }}
      />
      {/* Highlight dot */}
      <motion.div
        className="absolute left-[42%] top-[36%] h-3 w-3 rounded-full bg-white/20 blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  WelcomeOnboarding — Duolingo pattern                               */
/* ------------------------------------------------------------------ */

export default function WelcomeOnboarding() {
  const navigate = useNavigate();

  const handleStart = useCallback(() => {
    markWelcomeSeen();
    track('welcome_started', { destination: ROUTES.onboarding });
    navigate(ROUTES.onboarding, { replace: true });
  }, [navigate]);

  const handleLogin = useCallback(() => {
    markWelcomeSeen();
    track('welcome_login_selected');
    navigate(`${ROUTES.auth}?mode=login`, { replace: true });
  }, [navigate]);

  useEffect(() => {
    track('welcome_viewed');
  }, []);

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden bg-[hsl(var(--bg))]"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* ---- Tiny logo top center ---- */}
      <motion.div
        className="relative flex items-center justify-center px-6 pt-5"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex items-center gap-2">
          <AtlasCoreLogoSVG width={18} />
          <span className="text-[12px] font-semibold tracking-[-0.01em] text-[hsl(var(--fg-2))]">
            atlas.core
          </span>
        </div>
      </motion.div>

      {/* ---- Hero visual center ---- */}
      <div className="relative flex flex-1 flex-col items-center justify-center px-6">
        <GradientOrbHero />

        <motion.h1
          className="mx-auto mt-6 max-w-[320px] text-center text-[32px] font-bold leading-[1.05] tracking-[-0.04em] text-[hsl(var(--fg))]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          Stop guessing your progress.
        </motion.h1>

        <motion.p
          className="mx-auto mt-3 max-w-[280px] text-center text-[15px] leading-relaxed text-[hsl(var(--fg-2))]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          Atlas builds your training, nutrition, and recovery into one plan.
        </motion.p>
      </div>

      {/* ---- Bottom-anchored CTA ---- */}
      <motion.div
        className="relative px-6 pb-6 pt-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <button
          type="button"
          onClick={handleStart}
          className="flex h-[56px] w-full items-center justify-center gap-2 rounded-[16px] bg-[hsl(var(--brand))] text-[16px] font-semibold text-white shadow-[0_16px_48px_hsl(var(--brand)/0.28)] transition-all active:scale-[0.98]"
        >
          Build my plan
          <ArrowRight className="h-[18px] w-[18px]" />
        </button>

        <button
          type="button"
          onClick={handleLogin}
          className="mt-4 block w-full pb-1 text-center text-[14px] font-medium text-[hsl(var(--fg-3))] transition-colors active:text-[hsl(var(--fg))]"
        >
          I already have an account
        </button>
      </motion.div>
    </div>
  );
}
