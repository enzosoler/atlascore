import React from 'react';
import { Flame, Sparkles } from 'lucide-react';
import { useI18n } from '@/lib/i18nContext';
import { cn } from '@/lib/utils';

function calcStreak(checkins = []) {
  if (!checkins.length) return 0;
  const sorted = [...checkins].sort((a, b) => new Date(b.date) - new Date(a.date));
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    if (sorted.some(c => c.date === dateStr)) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

export default function StreakBadge({ streak, checkins }) {
  const { t } = useI18n();
  const count = typeof streak === 'number' ? streak : calcStreak(checkins);

  if (!count || count < 1) return null;

  const isOnFire = count >= 7;

  return (
    <div className={cn(
      'flex items-center gap-2 rounded-full border px-3 py-1.5',
      isOnFire
        ? 'border-[hsl(var(--warn)/0.18)] bg-[hsl(var(--warn)/0.08)] text-[hsl(var(--warn))]'
        : 'border-[hsl(var(--brand)/0.16)] bg-[hsl(var(--brand)/0.08)] text-[hsl(var(--brand))]'
    )}>
      {isOnFire ? <Sparkles className="h-4 w-4" strokeWidth={2} /> : <Flame className="h-4 w-4" fill="currentColor" />}
      <div className="leading-none">
        <span className="text-[12px] font-bold">
          {count === 1 ? t('today.checkin.streak.day', { count }) : t('today.checkin.streak.days', { count })}
        </span>
      </div>
    </div>
  );
}
