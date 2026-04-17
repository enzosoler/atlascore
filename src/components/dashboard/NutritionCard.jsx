import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18nContext';

/**
 * Today's Nutrition Card
 * Shows calories consumed, macro breakdown with progress bars, and 7-day averages
 */
export function TodayNutritionCard({
  to,
  calories,
  calorieTarget,
  macros = { protein: 0, carbs: 0, fat: 0 },
  macroTargets = { protein: 0, carbs: 0, fat: 0 },
  averageStats = null,
  tone = 'teal',
  loading = false,
}) {
  const { t } = useI18n();

  const toneStyles = {
    teal: {
      border: 'border-[hsl(var(--accent-secondary)/0.3)]',
      bg: 'bg-[radial-gradient(circle_at_top_right,hsl(var(--accent-secondary)/0.12),transparent_40%),linear-gradient(180deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_100%)]',
      accent: 'text-[hsl(var(--accent-secondary))]',
      accentBg: 'bg-[hsl(var(--accent-secondary))]',
      barBg: 'bg-[hsl(var(--fill))]',
    },
    orange: {
      border: 'border-[hsl(var(--warn)/0.3)]',
      bg: 'bg-[radial-gradient(circle_at_top_right,hsl(var(--warn)/0.12),transparent_40%),linear-gradient(180deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_100%)]',
      accent: 'text-[hsl(var(--warn))]',
      accentBg: 'bg-[hsl(var(--warn))]',
      barBg: 'bg-[hsl(var(--fill))]',
    },
    blue: {
      border: 'border-[hsl(var(--brand)/0.3)]',
      bg: 'bg-[radial-gradient(circle_at_top_right,hsl(var(--brand)/0.12),transparent_40%),linear-gradient(180deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_100%)]',
      accent: 'text-[hsl(var(--brand))]',
      accentBg: 'bg-[hsl(var(--brand))]',
      barBg: 'bg-[hsl(var(--fill))]',
    },
  };

  const styles = toneStyles[tone] || toneStyles.teal;

  const caloriePercentage = calorieTarget > 0 ? Math.round((calories / calorieTarget) * 100) : 0;
  const calorieRemaining = calorieTarget > 0 ? Math.max(0, calorieTarget - calories) : null;

  const macroData = [
    {
      label: t('today.dashboardCards.protein'),
      value: macros.protein || 0,
      target: macroTargets.protein || 0,
      percentage: macroTargets.protein > 0 ? Math.min(100, Math.round((macros.protein / macroTargets.protein) * 100)) : 0,
    },
    {
      label: t('today.dashboardCards.carbs'),
      value: macros.carbs || 0,
      target: macroTargets.carbs || 0,
      percentage: macroTargets.carbs > 0 ? Math.min(100, Math.round((macros.carbs / macroTargets.carbs) * 100)) : 0,
    },
    {
      label: t('today.dashboardCards.fat'),
      value: macros.fat || 0,
      target: macroTargets.fat || 0,
      percentage: macroTargets.fat > 0 ? Math.min(100, Math.round((macros.fat / macroTargets.fat) * 100)) : 0,
    },
  ];

  if (loading) {
    return (
      <div className="rounded-[24px] border border-[hsl(var(--border)/0.8)] bg-[hsl(var(--card))] p-6 animate-pulse">
        <div className="h-4 w-24 bg-[hsl(var(--fill))] rounded mb-4" />
        <div className="h-8 w-32 bg-[hsl(var(--fill))] rounded mb-2" />
        <div className="h-4 w-48 bg-[hsl(var(--fill))] rounded" />
      </div>
    );
  }

  return (
    <Link
      to={to}
      className={cn(
        'block rounded-[24px] border p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]',
        styles.border,
        styles.bg
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="atlas-overline">{t('today.dashboardCards.todaysNutrition')}</p>
          <p className="mt-1 text-[12px] text-[hsl(var(--fg-3))]">
            Goal, actual, and remaining use the same daily target math as the Nutrition screen.
          </p>
        </div>
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-[16px] border',
            'border-[hsl(var(--border)/0.8)] bg-[hsl(var(--fill)/0.5)] text-[hsl(var(--fg-2))]'
          )}
        >
          <UtensilsCrossed className="h-5 w-5" strokeWidth={2} />
        </div>
      </div>

      {/* Calories */}
      <div className="mb-5">
        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))] mb-1">
          Actual calories
        </p>
        <div className="flex items-baseline gap-2">
          <span className="text-[42px] font-bold tracking-[-0.06em] text-[hsl(var(--fg))]">
            {calories?.toLocaleString() || '0'}
          </span>
        </div>
        {calorieTarget > 0 && (
          <p className="text-[13px] text-[hsl(var(--fg-2))] mt-1">
            Goal {calorieTarget.toLocaleString()} kcal · {caloriePercentage}% complete
            {caloriePercentage > 100 && (
              <span className="ml-1 text-[hsl(var(--warn))]">{t('today.dashboardCards.over')}</span>
            )}
          </p>
        )}
        {calorieRemaining !== null && (
          <p className="mt-1 text-[12px] text-[hsl(var(--fg-3))]">
            {calorieRemaining} kcal remaining
          </p>
        )}
      </div>

      {/* Macro Progress Bars */}
      <div className="space-y-3 mb-5">
        {macroData.map((macro) => (
          <div key={macro.label} className="flex items-center gap-3">
            <span className="w-14 text-[12px] font-medium text-[hsl(var(--fg-3))]">
              {macro.label}
            </span>
            <div className={cn('flex-1 h-2 rounded-full overflow-hidden', styles.barBg)}>
              <div
                className={cn('h-full rounded-full transition-all duration-500', styles.accentBg)}
                style={{ width: `${macro.percentage}%` }}
              />
            </div>
            <span className="w-14 text-right text-[12px] font-semibold text-[hsl(var(--fg))]">
              {macro.value}g
            </span>
          </div>
        ))}
      </div>

      {/* 7-day Average Stats */}
      {averageStats && (
        <div className="rounded-[16px] border border-[hsl(var(--border)/0.6)] bg-[hsl(var(--fill)/0.4)] px-4 py-3">
          <p className="text-[11px] font-medium text-[hsl(var(--fg-3))] mb-1">
            {t('today.dashboardCards.sevenDayAverage')}
          </p>
          <p className="text-[13px] font-medium text-[hsl(var(--fg))]">
            {t('today.dashboardCards.averageProtein')} <span className="font-semibold">{averageStats.protein}g</span>
            {averageStats.daysBelowTarget > 0 && (
              <span className="text-[hsl(var(--fg-2))]">
                {' '}· {averageStats.daysBelowTarget === 1
                  ? t('today.dashboardCards.daysBelowTarget', { n: averageStats.daysBelowTarget })
                  : t('today.dashboardCards.daysBelowTargetPlural', { n: averageStats.daysBelowTarget })}
              </span>
            )}
          </p>
        </div>
      )}
    </Link>
  );
}
