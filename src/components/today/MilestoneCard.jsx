import React from 'react';
import { Trophy } from 'lucide-react';
import { useI18n } from '@/lib/i18nContext';

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

export default function MilestoneCard({ streak, checkins }) {
  const { t } = useI18n();
  const count = typeof streak === 'number' ? streak : calcStreak(checkins);

  const milestones = [
    { days: 7,   label: t('today.milestone.1week'),   emoji: '🔥', message: t('today.milestone.goldenWeek') },
    { days: 14,  label: t('today.milestone.2weeks'),  emoji: '🎯', message: t('today.milestone.disciplineInAction') },
    { days: 30,  label: t('today.milestone.1month'),  emoji: '🏆', message: t('today.milestone.incredibleMonth') },
    { days: 100, label: t('today.milestone.100days'), emoji: '👑', message: t('today.milestone.masterConsistency') },
  ];

  const nextMilestone = milestones.find(m => m.days > count);
  const achieved = milestones.filter(m => m.days <= count);

  if (!nextMilestone) {
    return (
      <div className="atlas-card p-4 text-center space-y-2">
        <p className="text-[20px]">👑</p>
        <p className="text-[13px] font-semibold">{t('today.milestone.legend')}</p>
        <p className="text-[11px] text-[hsl(var(--fg-2))]">{t('today.milestone.daysConsistency', { count })}</p>
      </div>
    );
  }

  const progress = (count / nextMilestone.days) * 100;

  return (
    <div className="atlas-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Trophy className="w-4 h-4 text-[hsl(var(--warn))]" strokeWidth={2} />
        <p className="atlas-overline">{t('today.milestone.nextMilestone')}</p>
      </div>

      <div>
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="text-[13px] font-semibold">{nextMilestone.label}</span>
          <span className="text-[12px] text-[hsl(var(--fg-2))]">{count} / {nextMilestone.days}</span>
        </div>
        <div className="h-1.5 rounded-full bg-[hsl(var(--shell))] overflow-hidden">
          <div
            className="h-full rounded-full bg-[hsl(var(--warn))] transition-all duration-700"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {achieved.length > 0 && (
        <div className="pt-2 border-t border-[hsl(var(--border-h))]">
          <p className="atlas-overline mb-1.5">{t('today.milestone.unlocked')}</p>
          <div className="flex gap-1">
            {achieved.map(m => (
              <div key={m.days} className="flex-1 text-center">
                <p className="text-[16px] mb-0.5">{m.emoji}</p>
                <p className="text-[9px] text-[hsl(var(--fg-2))]">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
