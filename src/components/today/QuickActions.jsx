import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Dumbbell, Scale, CalendarCheck, CheckCircle2, Zap } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { useI18n } from '@/lib/i18nContext';
import { cn } from '@/lib/utils';

function ActionTile({ icon: Icon, label, path, onClick, done, highlighted }) {
  const base =
    'flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-[16px] border transition-all active:scale-95 select-none';

  const variant = done
    ? 'border-[hsl(var(--ok)/0.22)] bg-[hsl(var(--ok)/0.06)] text-[hsl(var(--ok))]'
    : highlighted
      ? 'border-[hsl(var(--brand)/0.28)] bg-[hsl(var(--brand)/0.08)] text-[hsl(var(--brand))]'
      : 'border-[hsl(var(--border)/0.7)] bg-[hsl(var(--fill)/0.5)] text-[hsl(var(--fg-2))] hover:text-[hsl(var(--fg))] hover:bg-[hsl(var(--fill))]';

  const iconBg = done
    ? 'bg-[hsl(var(--ok)/0.14)]'
    : highlighted
      ? 'bg-[hsl(var(--brand)/0.14)]'
      : 'bg-[hsl(var(--fill))]';

  const labelColor = done
    ? 'text-[hsl(var(--ok))]'
    : highlighted
      ? 'text-[hsl(var(--brand))]'
      : 'text-[hsl(var(--fg-2))]';

  const content = (
    <>
      <div className={cn('w-8 h-8 rounded-[11px] flex items-center justify-center', iconBg)}>
        {done
          ? <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} />
          : <Icon className="w-4 h-4" strokeWidth={2} />
        }
      </div>
      <span className={cn('text-[12px] font-semibold tracking-[-0.01em]', labelColor)}>
        {label}
      </span>
    </>
  );

  if (onClick) {
    return <button type="button" onClick={onClick} className={cn(base, variant)}>{content}</button>;
  }
  return <Link to={path} className={cn(base, variant)}>{content}</Link>;
}

/**
 * QuickActions — 2×2 grid of action tiles.
 * The most contextually relevant action is highlighted.
 * Done state = green check.
 */
export function QuickActions({ workoutDone, nutritionLogged, weightLogged, onCheckin, onQuickWorkout, onAddWeight }) {
  const { t } = useI18n();
  const highlightWorkout = !workoutDone;
  const highlightNutrition = workoutDone && !nutritionLogged;

  return (
    <div className="grid grid-cols-2 gap-2.5">
      <ActionTile
        icon={workoutDone ? Dumbbell : Zap}
        label={workoutDone ? t('today.quickActions.workoutDone') : t('today.quickActions.quickWorkout')}
        onClick={workoutDone ? undefined : onQuickWorkout}
        path={workoutDone ? ROUTES.workouts : undefined}
        done={workoutDone}
        highlighted={highlightWorkout}
      />
      <ActionTile
        icon={Plus}
        label={nutritionLogged ? t('today.quickActions.logMore') : t('today.quickActions.logMeal')}
        path={ROUTES.nutrition}
        done={false}
        highlighted={highlightNutrition}
      />
      <ActionTile
        icon={Scale}
        label={weightLogged ? t('today.quickActions.weightLogged') : t('today.quickActions.logWeight')}
        onClick={onAddWeight}
        done={weightLogged}
        highlighted={false}
      />
      <ActionTile
        icon={CalendarCheck}
        label={t('today.quickActions.checkIn')}
        onClick={onCheckin}
        done={false}
        highlighted={false}
      />
    </div>
  );
}
