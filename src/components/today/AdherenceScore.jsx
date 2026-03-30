import React from 'react';
import { useI18n } from '@/lib/i18nContext';

export default function AdherenceScore({ meals, workouts, checkin }) {
  const { t } = useI18n();

  let points = 0, max = 0;

  const mealCount = (meals || []).length;
  points += Math.min(mealCount * 10, 30); max += 30;
  if ((workouts || []).some(w => w.completed)) { points += 20; } max += 20;
  if (checkin) { points += 20; } max += 20;
  if (checkin?.hydration_liters >= 2) { points += 15; } max += 15;
  if (checkin?.sleep_hours >= 7) { points += 15; } max += 15;

  const score = max > 0 ? Math.round((points / max) * 100) : 0;
  const circumference = 2 * Math.PI * 34;
  const offset = circumference - (score / 100) * circumference;

  const label = score >= 80
    ? t('today.adherenceScore.excellent')
    : score >= 50
      ? t('today.adherenceScore.good')
      : t('today.adherenceScore.needsFocus');

  const description = score >= 80
    ? t('today.adherenceScore.keepItUp')
    : score >= 50
      ? t('today.adherenceScore.roomToImprove')
      : t('today.adherenceScore.focusOnPending');

  return (
    <div className="atlas-card p-5">
      <p className="atlas-overline mb-4">{t('today.adherenceScore.label')}</p>
      <div className="flex items-center gap-4">
        <div className="relative w-[84px] h-[84px] shrink-0">
          <svg width="84" height="84" className="-rotate-90">
            <circle cx="42" cy="42" r="34" fill="none" stroke="hsl(var(--secondary))" strokeWidth="5" />
            <circle
              cx="42" cy="42" r="34" fill="none"
              stroke="hsl(var(--primary))" strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold leading-none">{score}</span>
            <span className="text-[10px] text-muted-foreground">/ 100</span>
          </div>
        </div>
        <div>
          <p className="text-base font-semibold">{label}</p>
          <p className="text-[12px] text-muted-foreground mt-1 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}
