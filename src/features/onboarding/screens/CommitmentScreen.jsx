import { motion } from 'framer-motion';
import { useOnboarding } from '../OnboardingContext';
import { useT } from '@/lib/i18nContext';

/**
 * CommitmentScreen — a moment of gravity before conversion.
 * Both the primary CTA ("I'm in") and the secondary link ("I'll decide as I go")
 * advance to the next screen. The difference is emotional, not functional.
 */
export default function CommitmentScreen() {
  const { currentScreen, goNext } = useOnboarding();
  const t = useT();

  const screen = currentScreen ?? {};
  const title = t('onboardingV2.commitment.title') || 'Before we start — one promise.';
  const body = t('onboardingV2.commitment.body') || 'Everything about your plan is designed around this: 3 sessions a week, honest food logging, and a weekly weigh-in. Not perfect. Just consistent.';
  const prompt = t('onboardingV2.commitment.prompt') || "Do you promise yourself you'll try that for the next 8 weeks?";
  const primaryCta = t('onboardingV2.commitment.primaryCta') || "I'm in";
  const secondaryCta = t('onboardingV2.commitment.secondaryCta') || "I'll decide as I go";

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <motion.div
        className="flex max-w-[320px] flex-col items-center gap-5"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Headline */}
        <h1 className="text-[26px] font-bold leading-[1.15] tracking-[-0.03em] text-[hsl(var(--fg))]">
          {title}
        </h1>

        {/* Body text */}
        <p className="text-[15px] leading-relaxed text-[hsl(var(--fg-2))]">
          {body}
        </p>

        {/* Subtitle / prompt */}
        <p className="text-[14px] font-medium leading-snug text-[hsl(var(--fg))]">
          {prompt}
        </p>

        {/* Primary CTA */}
        <button
          type="button"
          onClick={goNext}
          className="mt-4 w-full rounded-[14px] bg-[hsl(var(--brand))] py-3.5 text-[15px] font-semibold text-white transition-opacity active:opacity-80"
        >
          {primaryCta}
        </button>

        {/* Secondary link */}
        <button
          type="button"
          onClick={goNext}
          className="text-[13px] font-medium text-[hsl(var(--fg-3))] transition-colors active:text-[hsl(var(--fg-2))]"
        >
          {secondaryCta}
        </button>
      </motion.div>
    </div>
  );
}
