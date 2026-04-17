import { motion } from 'framer-motion';
import { useOnboarding } from '../OnboardingContext';

/**
 * SocialProofScreen — testimonial cards that build trust before conversion.
 * Reads testimonials from currentScreen.testimonials (defined in schema).
 * Each card staggers in with 150ms delay via framer-motion.
 */
export default function SocialProofScreen() {
  const { currentScreen, goNext } = useOnboarding();
  const testimonials = currentScreen?.testimonials ?? [];

  return (
    <div className="flex flex-1 flex-col px-5 pt-4">
      <h1 className="mb-2 text-[26px] font-bold leading-tight text-[hsl(var(--fg))]">
        People like you are already doing this.
      </h1>
      <p className="mb-6 text-[15px] leading-snug text-[hsl(var(--fg-2))]">
        Real results from people with similar goals.
      </p>

      <div className="flex flex-col gap-3">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
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
                  {t.name.charAt(0)}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold text-[hsl(var(--fg))]">
                  {t.name}, {t.age}
                </p>
                <p className="text-[12px] text-[hsl(var(--fg-2))]">{t.goal}</p>
              </div>
            </div>

            <p className="mb-2 text-[13px] leading-relaxed text-[hsl(var(--fg-2))]">
              &ldquo;{t.quote}&rdquo;
            </p>

            <div className="inline-block rounded-full bg-[hsl(var(--brand)/0.1)] px-3 py-1">
              <span className="text-[12px] font-semibold text-[hsl(var(--brand))]">
                {t.metric}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Primary CTA */}
      <div className="mt-auto pb-2 pt-6">
        <button
          type="button"
          onClick={goNext}
          className="w-full rounded-[14px] bg-[hsl(var(--brand))] py-3.5 text-[15px] font-semibold text-white transition-opacity active:opacity-80"
        >
          I'm ready
        </button>
      </div>
    </div>
  );
}
