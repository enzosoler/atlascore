import React, { useState, useEffect } from 'react';
import { SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18nContext';

export default function RestTimer({ duration = 90, onComplete }) {
  const { t } = useI18n();
  const [remaining, setRemaining] = useState(duration);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!isActive || remaining <= 0) {
      if (remaining <= 0) {
        try {
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          oscillator.frequency.value = 800;
          oscillator.type = 'sine';
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
          console.log('Audio notification skipped');
        }

        if (navigator.vibrate) {
          navigator.vibrate([100, 50, 100]);
        }

        onComplete?.();
      }
      return;
    }

    const timer = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          setIsActive(false);
          return 0;
        }
        return r - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, remaining, onComplete]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const progress = ((duration - remaining) / duration) * 100;

  return (
    <div className="atlas-card p-6 text-center space-y-6">
      <p className="atlas-overline">{t('workoutExecution.rest')}</p>

      <div className="relative w-56 h-56 mx-auto">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 224 224">
          <circle
            cx="112"
            cy="112"
            r="100"
            fill="none"
            stroke="hsl(var(--shell))"
            strokeWidth="6"
          />
          <circle
            cx="112"
            cy="112"
            r="100"
            fill="none"
            stroke="hsl(var(--brand))"
            strokeWidth="6"
            strokeDasharray={`${(progress / 100) * 628.3} 628.3`}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-[42px] font-bold tabular-nums leading-none text-[hsl(var(--fg))]">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </p>
          <button
            type="button"
            onClick={() => setRemaining(r => r + 30)}
            className="mt-2 px-3 py-1 rounded-full text-[12px] font-semibold text-[hsl(var(--fg-2))] bg-[hsl(var(--fill)/0.6)] hover:bg-[hsl(var(--fill))] transition-colors"
          >
            +30s
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={() => setIsActive(!isActive)}
          variant="outline"
          className="flex-1 h-10 rounded-lg"
        >
          {isActive ? t('workoutExecution.restTimer.pause') : t('workoutExecution.restTimer.resume')}
        </Button>
        <Button
          onClick={() => onComplete?.()}
          className="flex-1 h-10 rounded-lg bg-[hsl(var(--brand))] hover:bg-[hsl(var(--brand)/0.85)] text-white gap-2"
        >
          <SkipForward className="w-4 h-4" />
          {t('workoutExecution.restTimer.next')}
        </Button>
      </div>
    </div>
  );
}
