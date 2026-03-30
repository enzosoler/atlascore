import React from 'react';
import { subDays } from 'date-fns';
import { Zap, Moon, Droplets } from 'lucide-react';
import { useI18n } from '@/lib/i18nContext';
import { cn } from '@/lib/utils';

const MOODS = ['😞', '😕', '😐', '🙂', '😄'];
const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const MONTH_KEYS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

export default function CheckinHistory({ checkins }) {
  const { t } = useI18n();

  const moodLabels = {
    1: t('today.checkin.history.moodVeryPoor'),
    2: t('today.checkin.history.moodPoor'),
    3: t('today.checkin.history.moodNeutral'),
    4: t('today.checkin.history.moodGood'),
    5: t('today.checkin.history.moodExcellent'),
  };

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), i);
    const dateStr = date.toISOString().split('T')[0];
    const checkin = checkins.find(c => c.date === dateStr);
    return { date, dateStr, checkin };
  }).reverse();

  return (
    <div className="space-y-3">
      <p className="atlas-overline">{t('today.checkin.history.last7days')}</p>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map(({ date, checkin }) => {
          const dayLabel = t(`today.checkin.history.days.${DAY_KEYS[date.getDay()]}`);
          const dayNum = date.getDate();

          return (
            <div key={date.toISOString()} className={cn(
              'rounded-lg p-2 text-center transition-all border',
              checkin
                ? 'bg-[hsl(var(--brand)/0.08)] border-[hsl(var(--brand)/0.2)]'
                : 'bg-[hsl(var(--shell)/0.5)] border-[hsl(var(--border-h))]'
            )}>
              <p className="text-[10px] font-semibold text-[hsl(var(--fg-2))] mb-1">{dayLabel}</p>
              <p className="text-[11px] font-bold mb-1.5">{dayNum}</p>
              {checkin ? (
                <div className="space-y-1">
                  <div className="text-[16px] leading-none">{MOODS[checkin.mood - 1] || '—'}</div>
                  <div className="flex items-center justify-center gap-0.5 text-[9px] text-[hsl(var(--fg-2))]">
                    <span>✓</span>
                  </div>
                </div>
              ) : (
                <div className="text-[14px] text-[hsl(var(--fg-3))]">—</div>
              )}
            </div>
          );
        })}
      </div>

      {days.filter(d => d.checkin).length > 0 && (
        <div className="space-y-2 mt-4 pt-4 border-t border-[hsl(var(--border-h))]">
          {days
            .filter(d => d.checkin)
            .reverse()
            .map(({ date, checkin }) => (
              <div key={date.toISOString()} className="atlas-card p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[12px] font-semibold">
                    {t(`today.checkin.history.days.${DAY_KEYS[date.getDay()]}`)}, {date.getDate()} {t(`today.checkin.history.months.${MONTH_KEYS[date.getMonth()]}`)}
                  </p>
                  <span className="text-[12px] text-[hsl(var(--fg-2))]">{moodLabels[checkin.mood]}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-[hsl(var(--warn))]" strokeWidth={2} />
                    <span>{checkin.energy || '—'}/5</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Moon className="w-3 h-3 text-[hsl(var(--brand))]" strokeWidth={2} />
                    <span>{checkin.sleep_hours || '—'}h</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-[hsl(var(--brand))]" strokeWidth={2} />
                    <span>{checkin.hydration_liters || '—'}L</span>
                  </div>
                </div>
                {checkin.notes && <p className="text-[11px] text-[hsl(var(--fg-2))] italic">{checkin.notes}</p>}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
