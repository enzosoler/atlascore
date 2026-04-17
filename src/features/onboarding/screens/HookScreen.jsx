import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../OnboardingContext';

/**
 * HookScreen — the first persuasion screen after the splash.
 * Reads title/subtitle/cta/secondaryCta from currentScreen.
 * Primary CTA advances to the next screen; secondary navigates to login.
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
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <motion.div
        className="flex max-w-[340px] flex-col items-center gap-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Headline */}
        <h1 className="text-[24px] font-bold leading-[1.2] tracking-[-0.03em] text-[hsl(var(--fg))]">
          {title}
        </h1>

        {/* Subtext */}
        <p className="text-[15px] leading-relaxed text-[hsl(var(--fg-2))]">
          {subtitle}
        </p>

        {/* Primary CTA */}
        <button
          type="button"
          onClick={goNext}
          className="mt-4 w-full rounded-[14px] bg-[hsl(var(--brand))] py-3.5 text-[15px] font-semibold text-white transition-opacity active:opacity-80"
        >
          {cta}
        </button>

        {/* Secondary link */}
        <button
          type="button"
          onClick={() => navigate('/auth?mode=login')}
          className="text-[13px] font-medium text-[hsl(var(--fg-3))] transition-colors active:text-[hsl(var(--fg-2))]"
        >
          {secondaryCta}
        </button>
      </motion.div>
    </div>
  );
}
