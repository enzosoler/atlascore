import { motion } from 'framer-motion';
import { useOnboarding } from '../OnboardingContext';
import { useT } from '@/lib/i18nContext';

/**
 * SocialProofScreen — testimonial cards that build trust before conversion.
 * Reads testimonials from currentScreen.testimonials (defined in schema).
 * Each card staggers in with 150ms delay via framer-motion.
 */
export default function SocialProofScreen() {
  const { currentScreen, goNext } = useOnboarding();
  const t = useT();
  const testimonials = currentScreen?.testimonials ?? [];

  const title = t('onboardingV2.socialProof.title') || 'People like you are already doing this.';
  const subtitle = t('onboardingV2.socialProof.subtitle') || 'Real results from people with similar goals.';
  const ctaLabel = t('onboardingV2.socialProof.cta') || "I'm ready";

  return (
    <div className="flex flex-1 flex-col px-5 pt-4">
      <h1 className="mb-2 text-[26px] font-bold leading-tight text-[hsl(var(--fg))]">
        {title}
      </h1>
      <p className="mb-6 text-[15px] leading-snug text-[hsl(var(--fg-2))]">
        {subtitle}
      </p>

      <div className="flex flex-col gap-3">
        {testimonials.map((item, i) => {
          const goal = (item.goalKey && t(item.goalKey)) || item.goal;
          const quote = (item.quoteKey && t(item.quoteKey)) || item.quote;
          const metric = (item.metricKey && t(item.metricKey)) || item.metric;

          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: i * 0.15,
                duration: 0.4,
                ease: 'easeOut',
              }}
              className="rounded-[16px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card)/0.6)] p-4"
            >
              <div className="mb-3 flex items-center gap-3">
                {/* Avatar initial circle */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--brand-ai)/0.15)]">
                  <span className="text-[15px] font-bold text-[hsl(var(--brand-ai))]">
                    {item.name.charAt(0)}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-[hsl(var(--fg))]">
                    {item.name}, {item.age}
                  </p>
                  <p className="text-[12px] text-[hsl(var(--fg-2))]">{goal}</p>
                </div>
              </div>

              <p className="mb-2 text-[13px] leading-relaxed text-[hsl(var(--fg-2))]">
                &ldquo;{quote}&rdquo;
              </p>

              <div className="inline-block rounded-full bg-[hsl(var(--brand)/0.1)] px-3 py-1">
                <span className="text-[12px] font-semibold text-[hsl(var(--brand))]">
                  {metric}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Primary CTA */}
      <div className="mt-auto pb-2 pt-6">
        <button
          type="button"
          onClick={goNext}
          className="w-full rounded-[14px] bg-[hsl(var(--brand))] py-3.5 text-[15px] font-semibold text-white transition-opacity active:opacity-80"
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  );
}
