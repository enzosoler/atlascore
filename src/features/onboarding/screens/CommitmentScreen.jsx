import { motion } from 'framer-motion';
import { useOnboarding } from '../OnboardingContext';

/**
 * CommitmentScreen — a moment of gravity before conversion.
 * Both the primary CTA ("I'm in") and the secondary link ("I'll decide as I go")
 * advance to the next screen. The difference is emotional, not functional.
 */
export default function CommitmentScreen() {
  const { goNext } = useOnboarding();

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
          Before we start — one promise.
        </h1>

        {/* Body text */}
        <p className="text-[15px] leading-relaxed text-[hsl(var(--fg-2))]">
          Everything about your plan is designed around this: 3 sessions a week,
          honest food logging, and a weekly weigh-in. Not perfect. Just
          consistent.
        </p>

        {/* Subtitle / prompt */}
        <p className="text-[14px] font-medium leading-snug text-[hsl(var(--fg))]">
          Do you promise yourself you'll try that for the next 8 weeks?
        </p>

        {/* Primary CTA */}
        <button
          type="button"
          onClick={goNext}
          className="mt-4 w-full rounded-[14px] bg-[hsl(var(--brand))] py-3.5 text-[15px] font-semibold text-white transition-opacity active:opacity-80"
        >
          I'm in
        </button>

        {/* Secondary link */}
        <button
          type="button"
          onClick={goNext}
          className="text-[13px] font-medium text-[hsl(var(--fg-3))] transition-colors active:text-[hsl(var(--fg-2))]"
        >
          I'll decide as I go
        </button>
      </motion.div>
    </div>
  );
}
