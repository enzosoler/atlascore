import { motion } from 'framer-motion';
import AtlasCoreLogoSVG from '@/components/AtlasCoreLogoSVG';

/**
 * SplashScreen — full-screen brand reveal with proper Atlas Core branding.
 * Auto-advances via OnboardingEngine (autoAdvanceMs on the schema entry).
 * No user interaction required.
 */
export default function SplashScreen() {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[hsl(var(--bg))] via-[hsl(var(--bg))] to-[hsl(var(--sys-bg2))]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-[-6rem] h-64 w-64 rounded-full bg-[hsl(var(--brand)/0.12)] blur-3xl" />
        <div className="absolute right-[-4rem] top-16 h-72 w-72 rounded-full bg-[hsl(var(--accent-primary)/0.12)] blur-3xl" />
      </div>
      <motion.div
        className="relative flex w-full max-w-[420px] flex-col items-center gap-6 px-6 text-center"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ 
          duration: 1.2, 
          ease: [0.16, 1, 0.3, 1],
          staggerChildren: 0.1 
        }}
      >
        {/* Atlas Core Logo */}
        <motion.div
          initial={{ opacity: 0, rotate: -10 }}
          animate={{ opacity: 1, rotate: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: 'easeOut' }}
        >
          <AtlasCoreLogoSVG 
            width={80} 
            variant="lockup"
            className="drop-shadow-2xl"
            height={undefined}
            color={undefined}
            alt="atlas.core"
          />
        </motion.div>

        <motion.div
          className="space-y-3 rounded-[32px] border border-[hsl(var(--border)/0.6)] bg-[hsl(var(--card)/0.76)] px-6 py-8 shadow-[0_20px_70px_rgba(0,0,0,0.10)] backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--fg-3))]">
            Welcome to Atlas
          </p>
          <h1 className="text-[30px] font-bold tracking-[-0.04em] text-[hsl(var(--fg))]">
            atlas.core
          </h1>
          <p className="text-[17px] font-medium leading-relaxed text-[hsl(var(--brand))]">
            Build a plan that keeps up with you.
          </p>
          <p className="mx-auto max-w-[300px] text-[14px] leading-relaxed text-[hsl(var(--fg-2))]">
            Personalized workouts, nutrition, and progress tracking from the first tap.
          </p>
        </motion.div>

        <motion.div
          className="flex gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.6 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-[hsl(var(--accent-primary))]"
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut'
              }}
            />
          ))}
        </motion.div>

        <p className="text-[12px] leading-relaxed text-[hsl(var(--fg-3))]">
          A few seconds to set up, then you’re in.
        </p>
      </motion.div>
    </div>
  );
}
