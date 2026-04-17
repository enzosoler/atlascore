import { motion } from 'framer-motion';
import { useOnboarding } from '../OnboardingContext';
import { useT } from '@/lib/i18nContext';

const STEP_COLORS = [
  'hsl(142, 71%, 45%)',
  'hsl(45, 93%, 47%)',
  'hsl(217, 91%, 60%)',
];

export default function TrialExplainerScreen() {
  const { goNext } = useOnboarding();
  const t = useT();

  const title = t('onboardingV2.trial.title') || 'Your plan starts now. Billing only starts if you keep it.';
  const subtitle = t('onboardingV2.trial.subtitle') || 'One trial story. No hidden switch after signup.';
  const ctaLabel = t('onboardingV2.trial.cta') || 'Choose my plan';

  const steps = [
    {
      color: STEP_COLORS[0],
      label: t('onboardingV2.trial.today') || 'Today',
      text: t('onboardingV2.trial.todayText') || 'Atlas builds your plan and unlocks the full guided setup.',
    },
    {
      color: STEP_COLORS[1],
      label: t('onboardingV2.trial.day5') || 'Day 5',
      text: t('onboardingV2.trial.day5Text') || "Atlas reminds you the trial ends soon so you can decide with context, not guesswork.",
    },
    {
      color: STEP_COLORS[2],
      label: t('onboardingV2.trial.day7') || 'Day 7',
      text: t('onboardingV2.trial.day7Text') || 'If you keep the plan, billing starts on the selected cadence. If not, cancel before renewal.',
    },
  ];

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6">
      <motion.div
        className="flex w-full max-w-[400px] flex-col rounded-[32px] border border-[hsl(var(--border)/0.6)] bg-[hsl(var(--card)/0.76)] px-6 py-7 shadow-[0_20px_70px_rgba(0,0,0,0.10)] backdrop-blur-xl"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--fg-3))]">
          Trial timeline
        </p>
        <h1 className="mb-2 text-center text-[28px] font-bold leading-[1.15] tracking-[-0.03em] text-[hsl(var(--fg))]">
          {title}
        </h1>
        <p className="mb-8 text-center text-[15px] leading-relaxed text-[hsl(var(--fg-2))]">
          {subtitle}
        </p>

        <div className="mb-8 flex flex-col rounded-[22px] border border-[hsl(var(--border)/0.6)] bg-[hsl(var(--bg)/0.35)] px-4 py-2">
          {steps.map((step, i) => (
            <div key={step.label} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className="mt-1 h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: step.color }}
                />
                {i < steps.length - 1 && (
                  <div className="w-px flex-1 bg-[hsl(var(--border)/0.5)]" />
                )}
              </div>

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

        <div className="mb-6 rounded-[18px] bg-[hsl(var(--fill)/0.55)] px-4 py-3 text-left">
          <p className="text-[13px] font-semibold text-[hsl(var(--fg))]">What happens next</p>
          <p className="mt-1 text-[12px] leading-relaxed text-[hsl(var(--fg-2))]">
            You will choose a billing cadence on the next screen, see exactly when billing starts, and keep cancellation visible as a secondary control.
          </p>
        </div>

        <button
          type="button"
          onClick={goNext}
          className="w-full rounded-[16px] bg-[hsl(var(--brand))] py-3.5 text-[15px] font-semibold text-white shadow-[0_18px_50px_hsl(var(--brand)/0.22)] transition-opacity active:opacity-80"
        >
          {ctaLabel}
        </button>
      </motion.div>
    </div>
  );
}
