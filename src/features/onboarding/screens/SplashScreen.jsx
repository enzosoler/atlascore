import { motion } from 'framer-motion';

/**
 * SplashScreen — full-screen brand reveal.
 * Auto-advances via OnboardingEngine (autoAdvanceMs on the schema entry).
 * No user interaction required.
 */
export default function SplashScreen() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-[hsl(var(--bg))]">
      <motion.div
        className="flex flex-col items-center gap-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {/* Logo text */}
        <h1 className="text-[36px] font-bold tracking-[-0.04em] text-[hsl(var(--fg))]">
          atlas.core
        </h1>

        {/* Tagline */}
        <motion.p
          className="text-[15px] text-[hsl(var(--fg-3))]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          Stop guessing your progress.
        </motion.p>
      </motion.div>
    </div>
  );
}
