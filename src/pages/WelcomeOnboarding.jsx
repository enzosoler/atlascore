import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Zap, LayoutDashboard, Brain, Target } from 'lucide-react';
import { useI18n } from '@/lib/i18nContext';
import { track } from '@/lib/analytics';
import AtlasCoreLogoSVG from '@/components/AtlasCoreLogoSVG';
import { ROUTES } from '@/lib/routes';

const SLIDE_ICONS = [
  { Icon: Zap, color: 'var(--accent-primary)' },
  { Icon: LayoutDashboard, color: 'var(--sys-green)' },
  { Icon: Brain, color: 'var(--sys-purple)' },
  { Icon: Target, color: 'var(--sys-yellow)' },
];

const STORAGE_KEY = 'atlas_has_seen_welcome';

export function markWelcomeSeen() {
  localStorage.setItem(STORAGE_KEY, 'true');
}

export function hasSeenWelcome() {
  return localStorage.getItem(STORAGE_KEY) === 'true';
}

function SlideContent({ slide, icon }) {
  const { Icon, color } = icon;
  return (
    <div className="flex flex-col items-center justify-center px-8 text-center">
      <div
        className="mb-8 flex h-20 w-20 items-center justify-center rounded-[24px]"
        style={{ background: `hsla(${color}, 0.12)` }}
      >
        <Icon className="h-10 w-10" style={{ color: `hsl(${color})` }} />
      </div>
      <h1 className="whitespace-pre-line text-[28px] font-bold leading-[1.15] tracking-[-0.03em] text-[hsl(var(--fg))] sm:text-[34px]">
        {slide.title}
      </h1>
      <p className="mt-4 max-w-[320px] text-[15px] leading-[1.5] text-[hsl(var(--fg-2))]">
        {slide.body}
      </p>
    </div>
  );
}

function PageDots({ current, total }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className="h-2 rounded-full transition-all duration-300"
          style={{
            width: i === current ? 24 : 8,
            background: i === current
              ? 'hsl(var(--accent-primary))'
              : 'hsl(var(--fg-3) / 0.3)',
          }}
        />
      ))}
    </div>
  );
}

export default function WelcomeOnboarding() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);

  const slides = [
    t('welcome.slides.s1'),
    t('welcome.slides.s2'),
    t('welcome.slides.s3'),
    t('welcome.slides.s4'),
  ].filter((s) => s && typeof s === 'object');

  const total = slides.length || 4;
  const isLast = current >= total - 1;

  const finish = useCallback(() => {
    markWelcomeSeen();
    track('onboarding_completed', { source: 'welcome' });
    navigate(ROUTES.demoHome, { replace: true });
  }, [navigate]);

  const skip = useCallback(() => {
    markWelcomeSeen();
    track('onboarding_skipped', { slide: current });
    navigate(ROUTES.demoHome, { replace: true });
  }, [navigate, current]);

  const next = useCallback(() => {
    if (isLast) {
      finish();
    } else {
      setCurrent((p) => p + 1);
    }
  }, [isLast, finish]);

  // Fire once on mount
  React.useEffect(() => {
    track('onboarding_started');
  }, []);

  // Swipe support
  const [touchStart, setTouchStart] = React.useState(null);
  const handleTouchStart = (e) => setTouchStart(e.touches[0].clientX);
  const handleTouchEnd = (e) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (diff > 50 && current < total - 1) setCurrent((p) => p + 1);
    if (diff < -50 && current > 0) setCurrent((p) => p - 1);
    setTouchStart(null);
  };

  return (
    <div
      className="fixed inset-0 flex flex-col bg-[hsl(var(--bg))]"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2">
          <AtlasCoreLogoSVG width={24} />
          <span className="text-[14px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
            <span className="text-[hsl(var(--accent-primary))]">atlas</span>
            <span className="font-light">.core</span>
          </span>
        </div>
        {!isLast && (
          <button
            onClick={skip}
            className="text-[13px] font-medium text-[hsl(var(--fg-3))] transition-colors hover:text-[hsl(var(--fg-2))]"
          >
            {t('welcome.skip')}
          </button>
        )}
      </div>

      {/* Slide */}
      <div className="flex flex-1 items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            {slides[current] && (
              <SlideContent slide={slides[current]} icon={SLIDE_ICONS[current]} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="flex flex-col items-center gap-6 px-8 pb-8">
        <PageDots current={current} total={total} />
        <button
          onClick={next}
          className="flex h-[52px] w-full max-w-[320px] items-center justify-center gap-2 rounded-[14px] bg-[hsl(var(--accent-primary))] text-[15px] font-semibold text-white transition-all active:scale-[0.98]"
        >
          {isLast ? t('welcome.getStarted') : t('welcome.continue')}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
