import { motion } from 'framer-motion';
import { useOnboarding } from '../OnboardingContext';
import { useT } from '@/lib/i18nContext';

/**
 * TrialExplainerScreen — 3-step vertical timeline explaining the free trial.
 * Clean, trust-building layout. No friction, no card required messaging.
 */

const STEP_COLORS = [
  'hsl(142, 71%, 45%)', // green — Today
  'hsl(45, 93%, 47%)',  // yellow — Day 5
  'hsl(217, 91%, 60%)', // blue — Day 7
];

export default function TrialExplainerScreen() {
  const { goNext } = useOnboarding();
  const t = useT();

  const title = t('onboardingV2.trial.title') || 'How the 7-day free trial works.';
  const subtitle = t('onboardingV2.trial.subtitle') || 'No surprises. No tricks.';
  const ctaLabel = t('onboardingV2.trial.cta') || 'See my plan options';

  const steps = [
    {
      color: STEP_COLORS[0],
      label: t('onboardingV2.trial.today') || 'Today',
      text: t('onboardingV2.trial.todayText') || 'Full access. No card required to start.',
    },
    {
      color: STEP_COLORS[1],
      label: t('onboardingV2.trial.day5') || 'Day 5',
      text: t('onboardingV2.trial.day5Text') || "We'll remind you the trial ends in 2 days.",
    },
    {
      color: STEP_COLORS[2],
      label: t('onboardingV2.trial.day7') || 'Day 7',
      text: t('onboardingV2.trial.day7Text') || "If you're seeing results, it rolls into your plan. If not, cancel in one tap.",
    },
  ];

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
          {title}
        </h1>
        <p className="mb-8 text-center text-[15px] leading-relaxed text-[hsl(var(--fg-2))]">
          {subtitle}
        </p>

        {/* Timeline */}
        <div className="mb-10 flex flex-col">
          {steps.map((step, i) => (
            <div key={step.label} className="flex gap-4">
              {/* Vertical line + dot */}
              <div className="flex flex-col items-center">
                <div
                  className="mt-1 h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: step.color }}
                />
                {i < steps.length - 1 && (
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
          {ctaLabel}
        </button>
      </motion.div>
    </div>
  );
}
