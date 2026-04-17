import React, { useMemo } from 'react';
import { Droplets, Moon, Zap } from 'lucide-react';
import { subDays } from 'date-fns';
import { useI18n } from '@/lib/i18nContext';
import { cn } from '@/lib/utils';

const MOODS = ['😞', '😕', '😐', '🙂', '😄'];
const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const MONTH_KEYS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

function formatDayLabel(date, t) {
  return `${t(`today.checkin.history.days.${DAY_KEYS[date.getDay()]}`)}, ${date.getDate()} ${t(`today.checkin.history.months.${MONTH_KEYS[date.getMonth()]}`)}`;
}

function MetricPill({ icon: Icon, label, value, tone = 'neutral' }) {
  return (
    <div
      className={cn(
        'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px]',
        tone === 'positive' && 'border-[hsl(var(--ok)/0.18)] bg-[hsl(var(--ok)/0.08)] text-[hsl(var(--ok))]',
        tone === 'attention' && 'border-[hsl(var(--warn)/0.18)] bg-[hsl(var(--warn)/0.08)] text-[hsl(var(--warn))]',
        tone === 'neutral' && 'border-[hsl(var(--border)/0.75)] bg-[hsl(var(--fill)/0.35)] text-[hsl(var(--fg-2))]'
      )}
    >
      <Icon className="h-3 w-3" strokeWidth={2} />
      <span className="font-medium">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

export default function CheckinHistory({ checkins }) {
  const { t } = useI18n();

  const moodLabels = {
    1: t('today.checkin.history.moodVeryPoor'),
    2: t('today.checkin.history.moodPoor'),
    3: t('today.checkin.history.moodNeutral'),
    4: t('today.checkin.history.moodGood'),
    5: t('today.checkin.history.moodExcellent'),
  };

  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), i);
        const dateStr = date.toISOString().split('T')[0];
        const checkin = checkins.find((c) => c.date === dateStr);
        return { date, dateStr, checkin };
      }).reverse(),
    [checkins]
  );

  const completedDays = days.filter((d) => d.checkin).length;
  const latestCheckin = [...days].reverse().find((d) => d.checkin)?.checkin || null;

  return (
    <div className="space-y-4 rounded-[24px] border border-[hsl(var(--border)/0.75)] bg-[hsl(var(--card))] px-4 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="atlas-overline">{t('today.checkin.history.last7days')}</p>
          <p className="mt-2 text-[14px] leading-6 text-[hsl(var(--fg-2))]">
            A compact record of how the last week felt, without turning the day into noise.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <MetricPill icon={Moon} label="Sleep" value={latestCheckin?.sleep_hours != null ? `${latestCheckin.sleep_hours}h` : '—'} />
          <MetricPill icon={Zap} label="Energy" value={latestCheckin?.energy != null ? `${latestCheckin.energy}/5` : '—'} />
          <MetricPill icon={Droplets} label="Water" value={latestCheckin?.hydration_liters != null ? `${latestCheckin.hydration_liters}L` : '—'} />
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {days.map(({ date, checkin }) => {
          const dayLabel = t(`today.checkin.history.days.${DAY_KEYS[date.getDay()]}`);
          const dayNum = date.getDate();
          const isFilled = !!checkin;

          return (
            <div
              key={date.toISOString()}
              className={cn(
                'rounded-[16px] border p-2 text-center transition-all',
                isFilled
                  ? 'border-[hsl(var(--brand)/0.18)] bg-[hsl(var(--brand)/0.06)]'
                  : 'border-[hsl(var(--border)/0.75)] bg-[hsl(var(--fill)/0.24)]'
              )}
            >
              <p className="text-[10px] font-semibold text-[hsl(var(--fg-2))]">{dayLabel}</p>
              <p className="mt-0.5 text-[11px] font-bold text-[hsl(var(--fg))]">{dayNum}</p>
              {isFilled ? (
                <div className="mt-1.5 space-y-1">
                  <div className="text-[16px] leading-none">{MOODS[checkin.mood - 1] || '—'}</div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">Logged</p>
                </div>
              ) : (
                <div className="mt-2 text-[13px] text-[hsl(var(--fg-3))]">—</div>
              )}
            </div>
          );
        })}
      </div>

      {completedDays > 0 && (
        <div className="space-y-2 border-t border-[hsl(var(--border)/0.7)] pt-4">
          {days
            .filter((d) => d.checkin)
            .reverse()
            .map(({ date, checkin }) => (
              <div key={date.toISOString()} className="rounded-[20px] border border-[hsl(var(--border)/0.75)] bg-[hsl(var(--fill)/0.28)] px-4 py-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[12px] font-semibold text-[hsl(var(--fg))]">
                      {formatDayLabel(date, t)}
                    </p>
                    <p className="mt-1 text-[11px] text-[hsl(var(--fg-3))]">
                      {moodLabels[checkin.mood] || 'Mood not logged'}
                    </p>
                  </div>
                  <div className="rounded-full border border-[hsl(var(--border)/0.65)] bg-[hsl(var(--card))] px-2.5 py-1 text-[11px] font-semibold text-[hsl(var(--fg-2))]">
                    {checkin.mood != null ? `${checkin.mood}/5` : '—'}
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
                  <MetricPill icon={Zap} label="Energy" value={checkin.energy ?? '—'} tone={checkin.energy >= 4 ? 'positive' : checkin.energy <= 2 ? 'attention' : 'neutral'} />
                  <MetricPill icon={Moon} label="Sleep" value={checkin.sleep_hours != null ? `${checkin.sleep_hours}h` : '—'} tone={checkin.sleep_hours >= 7 ? 'positive' : 'neutral'} />
                  <MetricPill icon={Droplets} label="Water" value={checkin.hydration_liters != null ? `${checkin.hydration_liters}L` : '—'} tone={checkin.hydration_liters >= 2 ? 'positive' : 'neutral'} />
                </div>

                {checkin.notes ? (
                  <p className="mt-3 text-[11px] leading-5 text-[hsl(var(--fg-2))] italic">
                    {checkin.notes}
                  </p>
                ) : null}
              </div>
            ))}
        </div>
      )}

      {completedDays === 0 && (
        <div className="rounded-[20px] border border-dashed border-[hsl(var(--border)/0.75)] bg-[hsl(var(--fill)/0.2)] px-4 py-5 text-center">
          <p className="text-[13px] text-[hsl(var(--fg-2))]">No check-ins logged in the last seven days.</p>
        </div>
      )}
    </div>
  );
}
