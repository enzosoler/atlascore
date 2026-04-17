import { useState } from 'react';
import { motion } from 'framer-motion';
import { Capacitor } from '@capacitor/core';
import { Bell, Check, Clock, TrendingUp, Target } from 'lucide-react';
import { useOnboarding } from '../OnboardingContext';

const isNative = Capacitor.isNativePlatform();

/**
 * NotificationsScreen — Q15 in the onboarding flow.
 *
 * Implements the two-step notification permission pattern:
 * 1. Show an in-app screen with benefits + "Turn on nudges" CTA
 * 2. ONLY when user taps the CTA, fire the native OS permission dialog
 *
 * This doubles opt-in rates because the user has already decided "yes"
 * before seeing the system dialog.
 *
 * Stores `pushPermission: 'granted' | 'denied' | 'skipped'` in onboarding context.
 */
export default function NotificationsScreen() {
  const { setAnswer, goNext } = useOnboarding();
  const [requesting, setRequesting] = useState(false);

  const handleEnable = async () => {
    if (!isNative) {
      // On web, we can't request native push — just store skipped
      setAnswer('pushPermission', 'skipped');
      goNext();
      return;
    }

    setRequesting(true);
    try {
      // Dynamically import to avoid issues on web
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      const result = await LocalNotifications.requestPermissions();
      const status = result?.display === 'granted' ? 'granted' : 'denied';
      setAnswer('pushPermission', status);
    } catch (e) {
      console.warn('[Notifications] Permission request failed:', e?.message);
      setAnswer('pushPermission', 'denied');
    } finally {
      setRequesting(false);
      goNext();
    }
  };

  const handleSkip = () => {
    setAnswer('pushPermission', 'skipped');
    goNext();
  };

  const benefits = [
    {
      icon: Clock,
      label: 'Morning check-in',
      detail: 'A quick nudge to log breakfast and set your day up right.',
    },
    {
      icon: TrendingUp,
      label: 'Weekly progress',
      detail: 'See how your week went and what Atlas adjusted for you.',
    },
    {
      icon: Target,
      label: 'Milestone alerts',
      detail: "We'll celebrate when you hit a target — you earned it.",
    },
  ];

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
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(var(--brand))]"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <Bell className="w-8 h-8 text-white" />
        </motion.div>

        {/* Title */}
        <h1 className="text-[26px] font-bold leading-[1.15] tracking-[-0.03em] text-[hsl(var(--fg))]">
          Want a nudge when it matters?
        </h1>

        <p className="text-[15px] leading-relaxed text-[hsl(var(--fg-2))]">
          No spam. Just the right nudge at the right time to keep you on track.
        </p>

        {/* Benefits list */}
        <div className="w-full rounded-[16px] border border-[hsl(var(--border)/0.5)] bg-[hsl(var(--card)/0.6)] p-4 text-left space-y-3">
          {benefits.map((b, i) => (
            <motion.div
              key={b.label}
              className="flex items-start gap-3"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.1, duration: 0.4 }}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--brand)/0.15)]">
                <b.icon className="w-4 h-4 text-[hsl(var(--brand))]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-[hsl(var(--fg))]">{b.label}</p>
                <p className="text-[12px] text-[hsl(var(--fg-3))] leading-snug">{b.detail}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA — triggers the native permission dialog */}
        <button
          type="button"
          onClick={handleEnable}
          disabled={requesting}
          className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-[hsl(var(--brand))] py-3.5 text-[15px] font-semibold text-white transition-opacity active:opacity-80 disabled:opacity-60"
        >
          {requesting ? (
            <motion.div
              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
            />
          ) : (
            <Bell className="w-5 h-5" />
          )}
          Turn on nudges
        </button>

        {/* Secondary skip */}
        <button
          type="button"
          onClick={handleSkip}
          className="text-[13px] font-medium text-[hsl(var(--fg-3))] transition-colors active:text-[hsl(var(--fg-2))]"
        >
          Maybe later
        </button>
      </motion.div>
    </div>
  );
}
