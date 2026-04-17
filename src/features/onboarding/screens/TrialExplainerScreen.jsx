import { motion } from 'framer-motion';
import { useOnboarding } from '../OnboardingContext';

/**
 * TrialExplainerScreen — 3-step vertical timeline explaining the free trial.
 * Clean, trust-building layout. No friction, no card required messaging.
 */

const STEPS = [
  {
    color: 'hsl(142, 71%, 45%)', // green
    label: 'Today',
    text: 'Full access. No card required to start.',
  },
  {
    color: 'hsl(45, 93%, 47%)', // yellow
    label: 'Day 5',
    text: "We'll remind you the trial ends in 2 days.",
  },
  {
    color: 'hsl(217, 91%, 60%)', // blue
    label: 'Day 7',
    text: "If you're seeing results, it rolls into your plan. If not, cancel in one tap.",
  },
];

export default function TrialExplainerScreen() {
  const { goNext } = useOnboarding();

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6">
      <motion.div
        className="flex w-full max-w-[340px] flex-col"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Headline */}
        <h1 className="mb-2 text-center text-[26px] font-bold leading-[1.15] tracking-[-0.03em] text-[hsl(var(--fg))]">
          How the 7-day free trial works.
        </h1>
        <p className="mb-8 text-center text-[15px] leading-relaxed text-[hsl(var(--fg-2))]">
          No surprises. No tricks.
        </p>

        {/* Timeline */}
        <div className="mb-10 flex flex-col">
          {STEPS.map((step, i) => (
            <div key={step.label} className="flex gap-4">
              {/* Vertical line + dot */}
              <div className="flex flex-col items-center">
                <div
                  className="mt-1 h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: step.color }}
                />
                {i < STEPS.length - 1 && (
                  <div className="w-px flex-1 bg-[hsl(var(--border)/0.5)]" />
                )}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1 pb-6">
                <p
                  className="text-[11px] font-bold uppercase tracking-wider"
                  style={{ color: step.color }}
                >
                  {step.label}
                </p>
                <p className="mt-1 text-[14px] leading-snug text-[hsl(var(--fg))]">
                  {step.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Primary CTA */}
        <button
          type="button"
          onClick={goNext}
          className="w-full rounded-[14px] bg-[hsl(var(--brand))] py-3.5 text-[15px] font-semibold text-white transition-opacity active:opacity-80"
        >
          See my plan options
        </button>
      </motion.div>
    </div>
  );
}
