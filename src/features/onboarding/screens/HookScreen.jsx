import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../OnboardingContext';
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

  const {
    title = 'The scale lies. Your mirror lies. Your last app had no idea what was working.',
    subtitle = 'Atlas tracks what actually matters — and adjusts every week so you stop guessing.',
    cta = 'Build my plan',
    secondaryCta = 'I already have an account',
  } = currentScreen ?? {};

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 bg-gradient-to-br from-[hsl(var(--bg))] via-[hsl(var(--bg))] to-[hsl(var(--sys-bg2))]">
      <motion.div
        className="flex max-w-[380px] flex-col items-center gap-8"
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

        {/* Content */}
        <motion.div 
          className="text-center space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {/* Headline */}
          <h1 className="text-[26px] font-bold leading-[1.2] tracking-[-0.03em] text-[hsl(var(--fg))]">
            {title}
          </h1>

          {/* Subtext */}
          <p className="text-[16px] leading-relaxed text-[hsl(var(--fg-2))]">
            {subtitle}
          </p>
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
            className="atlas-button atlas-button-primary w-full h-12 rounded-[16px] text-[15px] font-semibold gap-2 shadow-lg shadow-[hsl(var(--brand))/0.25] transition-all hover:shadow-xl hover:shadow-[hsl(var(--brand))/0.35] active:scale-[0.98]"
          >
            {cta}
            <ArrowRight className="w-4 h-4" strokeWidth={2} />
          </button>

          {/* Secondary CTA */}
          <button
            type="button"
            onClick={() => navigate('/auth?mode=login')}
            className="flex items-center justify-center gap-2 w-full h-11 rounded-[14px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[14px] font-medium text-[hsl(var(--fg-2))] transition-all hover:bg-[hsl(var(--card-hi))] hover:text-[hsl(var(--fg))] active:scale-[0.98]"
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
          <span>Free 7-day trial • No credit card required</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
