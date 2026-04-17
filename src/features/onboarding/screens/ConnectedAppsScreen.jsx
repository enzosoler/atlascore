import { useState } from 'react';
import { motion } from 'framer-motion';
import { Capacitor } from '@capacitor/core';
import { Heart, Check, Loader2, Smartphone } from 'lucide-react';
import { useOnboarding } from '../OnboardingContext';
import { useHealthKit } from '@/hooks/useHealthKit';

const platform = Capacitor.getPlatform();

/**
 * ConnectedAppsScreen — Q14 in the onboarding flow.
 *
 * iOS:     Shows "Connect Apple Health" button that triggers real HealthKit
 *          authorization via the existing useHealthKit hook.
 * Android: Shows "Google Health Connect coming soon" (no action).
 * Web:     Shows a generic skip message.
 *
 * Stores `healthKitConnected: true` in onboarding context on success.
 */
export default function ConnectedAppsScreen() {
  const { setAnswer, goNext } = useOnboarding();
  const { available, connected, loading, connect, isIOS } = useHealthKit();
  const [justConnected, setJustConnected] = useState(false);

  const handleConnect = async () => {
    const granted = await connect();
    if (granted) {
      setAnswer('healthKitConnected', true);
      setJustConnected(true);
      // Brief pause so the user sees the success state before advancing
      setTimeout(goNext, 600);
    }
  };

  const handleSkip = () => {
    setAnswer('healthKitConnected', false);
    goNext();
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <motion.div
        className="flex max-w-[340px] flex-col items-center gap-5"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Icon */}
        <motion.div
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <Heart className="w-8 h-8 text-white" />
        </motion.div>

        {/* Title */}
        <h1 className="text-[26px] font-bold leading-[1.15] tracking-[-0.03em] text-[hsl(var(--fg))]">
          Connect your health data
        </h1>

        <p className="text-[15px] leading-relaxed text-[hsl(var(--fg-2))]">
          We pull in your data so you start with context, not a blank slate.
        </p>

        {/* iOS — real HealthKit connection */}
        {isIOS && (
          <>
            {/* Data types preview */}
            <div className="w-full rounded-[16px] border border-[hsl(var(--border)/0.5)] bg-[hsl(var(--card)/0.6)] p-4 text-left">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--fg-3))] mb-3">
                We'll read from Apple Health
              </p>
              {[
                { label: 'Weight & body fat', color: 'bg-blue-500' },
                { label: 'Steps & active calories', color: 'bg-green-500' },
                { label: 'Heart rate & sleep', color: 'bg-indigo-500' },
                { label: 'Workouts', color: 'bg-orange-500' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2.5 py-1.5">
                  <div className={`h-2 w-2 rounded-full ${item.color}`} />
                  <span className="text-[13px] text-[hsl(var(--fg-2))]">{item.label}</span>
                </div>
              ))}
            </div>

            {/* Connect button or success state */}
            {justConnected || connected ? (
              <motion.div
                className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-[hsl(var(--ok)/0.15)] py-3.5 text-[15px] font-semibold text-[hsl(var(--ok))]"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <Check className="w-5 h-5" />
                Connected
              </motion.div>
            ) : (
              <button
                type="button"
                onClick={handleConnect}
                disabled={loading || !available}
                className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-[hsl(var(--brand))] py-3.5 text-[15px] font-semibold text-white transition-opacity active:opacity-80 disabled:opacity-40"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Heart className="w-5 h-5" />
                )}
                {available ? 'Connect Apple Health' : 'HealthKit not available'}
              </button>
            )}
          </>
        )}

        {/* Android — coming soon */}
        {platform === 'android' && (
          <div className="w-full rounded-[16px] border border-[hsl(var(--border)/0.5)] bg-[hsl(var(--card)/0.6)] p-5 text-center">
            <Smartphone className="w-8 h-8 text-[hsl(var(--fg-3))] mx-auto mb-3" />
            <p className="text-[14px] font-semibold text-[hsl(var(--fg))] mb-1">
              Google Health Connect
            </p>
            <p className="text-[13px] text-[hsl(var(--fg-3))]">
              Coming soon. We'll notify you when it's ready.
            </p>
          </div>
        )}

        {/* Web — generic message */}
        {platform === 'web' && (
          <div className="w-full rounded-[16px] border border-[hsl(var(--border)/0.5)] bg-[hsl(var(--card)/0.6)] p-5 text-center">
            <p className="text-[13px] text-[hsl(var(--fg-3))]">
              Health data connections are available on the iOS app. You can connect later from Settings.
            </p>
          </div>
        )}

        {/* Skip link */}
        {!(justConnected || connected) && (
          <button
            type="button"
            onClick={handleSkip}
            className="text-[13px] font-medium text-[hsl(var(--fg-3))] transition-colors active:text-[hsl(var(--fg-2))]"
          >
            Skip for now
          </button>
        )}
      </motion.div>
    </div>
  );
}
