import { motion } from 'framer-motion';
import AtlasCoreLogoSVG from '@/components/AtlasCoreLogoSVG';

/**
 * SplashScreen — full-screen brand reveal with proper Atlas Core branding.
 * Auto-advances via OnboardingEngine (autoAdvanceMs on the schema entry).
 * No user interaction required.
 */
export default function SplashScreen() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-gradient-to-br from-[hsl(var(--bg))] via-[hsl(var(--bg))] to-[hsl(var(--sys-bg2))]">
      <motion.div
        className="flex flex-col items-center gap-6"
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

        {/* Brand tagline */}
        <motion.div
          className="text-center space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <h1 className="text-[28px] font-bold tracking-[-0.04em] text-[hsl(var(--fg))]">
            atlas.core
          </h1>
          <p className="text-[16px] font-medium text-[hsl(var(--accent-primary))] leading-relaxed">
            Stop guessing your progress.
          </p>
          <p className="text-[14px] text-[hsl(var(--fg-3))] max-w-[280px]">
            Performance operating system for workouts, nutrition, and real-world results.
          </p>
        </motion.div>

        {/* Loading indicator */}
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
      </motion.div>
    </div>
  );
}
