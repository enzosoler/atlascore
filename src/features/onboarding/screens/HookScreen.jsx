import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../OnboardingContext';
import { useT } from '@/lib/i18nContext';
import AtlasCoreLogoSVG from '@/components/AtlasCoreLogoSVG';
import { ArrowRight, LogIn } from 'lucide-react';

/**
 * HookScreen — first persuasion screen after splash with proper Atlas Core branding.
 * Reads title/subtitle/cta/secondaryCta from currentScreen.
 * Primary CTA advances to next screen; secondary navigates to login.
 */
export default function HookScreen() {
  const { currentScreen, goNext } = useOnboarding();
  const navigate = useNavigate();
  const t = useT();

  const screen = currentScreen ?? {};
  const title = (screen.titleKey && t(screen.titleKey)) || screen.title || 'The scale lies. Your mirror lies. Your last app had no idea what was working.';
  const subtitle = (screen.subtitleKey && t(screen.subtitleKey)) || screen.subtitle || 'Atlas tracks what actually matters — and adjusts every week so you stop guessing.';
  const cta = (screen.ctaKey && t(screen.ctaKey)) || screen.cta || 'Build my plan';
  const secondaryCta = (screen.secondaryCtaKey && t(screen.secondaryCtaKey)) || screen.secondaryCta || 'I already have an account';
  const trustBadge = t('onboardingV2.hook.trustBadge') || 'Free 7-day trial • No credit card required';

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 bg-gradient-to-br from-[hsl(var(--bg))] via-[hsl(var(--bg))] to-[hsl(var(--sys-bg2))]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-[-6rem] h-64 w-64 rounded-full bg-[hsl(var(--brand)/0.12)] blur-3xl" />
        <div className="absolute right-[-4rem] top-16 h-72 w-72 rounded-full bg-[hsl(var(--accent-primary)/0.12)] blur-3xl" />
      </div>
      <motion.div
        className="relative flex w-full max-w-[420px] flex-col items-center gap-6 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Atlas Core Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <AtlasCoreLogoSVG 
            width={56} 
            variant="lockup"
            className="drop-shadow-lg"
            height={undefined}
            color={undefined}
            alt="atlas.core"
          />
        </motion.div>

        <motion.div 
          className="space-y-4 rounded-[32px] border border-[hsl(var(--border)/0.6)] bg-[hsl(var(--card)/0.76)] px-6 py-8 shadow-[0_20px_70px_rgba(0,0,0,0.10)] backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--fg-3))]">
            Why Atlas
          </p>
          {/* Headline */}
          <h1 className="text-[28px] font-bold leading-[1.15] tracking-[-0.03em] text-[hsl(var(--fg))]">
            {title}
          </h1>

          {/* Subtext */}
          <p className="mx-auto max-w-[340px] text-[16px] leading-relaxed text-[hsl(var(--fg-2))]">
            {subtitle}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <span className="rounded-full border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--fill)/0.55)] px-3 py-1 text-[12px] font-medium text-[hsl(var(--fg-2))]">
              Adapts weekly
            </span>
            <span className="rounded-full border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--fill)/0.55)] px-3 py-1 text-[12px] font-medium text-[hsl(var(--fg-2))]">
              Built from your data
            </span>
            <span className="rounded-full border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--fill)/0.55)] px-3 py-1 text-[12px] font-medium text-[hsl(var(--fg-2))]">
              No clutter
            </span>
          </div>
        </motion.div>

        {/* Action buttons */}
        <motion.div 
          className="w-full space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {/* Primary CTA */}
          <button
            type="button"
            onClick={goNext}
            className="atlas-button atlas-button-primary w-full h-12 rounded-[16px] text-[15px] font-semibold gap-2 shadow-[0_18px_50px_hsl(var(--brand)/0.22)] transition-all hover:shadow-[0_20px_60px_hsl(var(--brand)/0.3)] active:scale-[0.98]"
          >
            {cta}
            <ArrowRight className="w-4 h-4" strokeWidth={2} />
          </button>

          {/* Secondary CTA */}
          <button
            type="button"
            onClick={() => navigate('/auth?mode=login')}
            className="flex items-center justify-center gap-2 w-full h-11 rounded-[14px] border border-[hsl(var(--border)/0.8)] bg-[hsl(var(--card)/0.7)] text-[14px] font-medium text-[hsl(var(--fg-2))] transition-all hover:bg-[hsl(var(--card-hi))] hover:text-[hsl(var(--fg))] active:scale-[0.98]"
          >
            <LogIn className="w-4 h-4" strokeWidth={2} />
            {secondaryCta}
          </button>
        </motion.div>

        {/* Trust indicator */}
        <motion.div
          className="flex items-center gap-2 text-[12px] text-[hsl(var(--fg-3))]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <div className="w-1 h-1 rounded-full bg-[hsl(var(--ok))]" />
          <span>{trustBadge}</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
