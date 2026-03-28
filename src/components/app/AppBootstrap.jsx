import React from 'react';
import { motion } from 'framer-motion';
import AtlasCoreLogoSVG from '@/components/AtlasCoreLogoSVG';

/**
 * AppBootstrap — branded loading screen shown while auth state resolves.
 * Replaces the unbranded FullScreenSpinner in RequireAuthenticatedApp.
 *
 * Design intent: logo appears on first frame, no spinning, feels instant.
 * Three pulsing dots signal "working" without screaming "loading".
 */
export default function AppBootstrap() {
  return (
    <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[hsl(var(--bg))]">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-8"
      >
        <AtlasCoreLogoSVG width={72} />

        {/* Three pulsing dots — minimal, not a spinner */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--brand))]"
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
