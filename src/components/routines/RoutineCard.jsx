import React from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, Calendar, Clock, Copy, Trash2, ChevronRight, ClipboardList, UserCheck, User } from 'lucide-react';
import { useI18n } from '@/lib/i18nContext';
import { cn } from '@/lib/utils';

const DAYS_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function RoutineCard({ routine, isPrescribed, onDelete, onClone }) {
  const { locale } = useI18n();
  const days = Array.isArray(routine.days) ? routine.days : Array.isArray(routine.days_of_week) ? routine.days_of_week : [];
  const sourceType = isPrescribed || routine.created_by_type === 'coach' || routine.is_prescribed ? 'coach' : routine.created_by_type === 'ai' ? 'ai' : 'user';
  const sourceMeta = {
    user: {
      label: 'You',
      icon: User,
      className: 'border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.72)] text-[hsl(var(--fg-2))]',
    },
    ai: {
      label: 'AI',
      icon: ClipboardList,
      className: 'border-[hsl(var(--brand)/0.22)] bg-[hsl(var(--brand)/0.1)] text-[hsl(var(--brand))]',
    },
    coach: {
      label: 'Coach',
      icon: UserCheck,
      className: 'border-[hsl(var(--ok)/0.22)] bg-[hsl(var(--ok)/0.1)] text-[hsl(var(--ok))]',
    },
  }[sourceType];
  const SourceIcon = sourceMeta.icon;
  const exerciseCount = days.reduce((sum, day) => sum + (day?.exercises?.length || 0), 0);
  const activeDays = days.filter((day) => (day?.exercises?.length || day?.workout_id || day?.focus)).length;
  const stateLabel = routine.active ? 'Active' : sourceType === 'coach' ? 'Assigned' : 'Draft';

  return (
    <div className={cn(
      'atlas-card flex flex-col gap-4 rounded-[18px] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]',
      routine.active ? 'border-[hsl(var(--ok)/0.24)] bg-[radial-gradient(circle_at_top_right,hsl(var(--ok)/0.08),transparent_36%),linear-gradient(180deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_100%)]' : 'hover:border-[hsl(var(--brand)/0.24)]'
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h3 className="truncate text-[15px] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">
              {routine.name}
            </h3>
            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-[0.04em] ${sourceMeta.className}`}>
              <SourceIcon className="h-3 w-3" strokeWidth={2} />
              {sourceMeta.label}
            </span>
            <span className={cn(
              'inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-[0.04em]',
              routine.active
                ? 'border-[hsl(var(--ok)/0.22)] bg-[hsl(var(--ok)/0.1)] text-[hsl(var(--ok))]'
                : 'border-[hsl(var(--border)/0.84)] bg-[hsl(var(--fill)/0.72)] text-[hsl(var(--fg-2))]'
            )}>
              {stateLabel}
            </span>
          </div>
          {routine.objective || routine.description ? (
            <p className="line-clamp-2 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
              {routine.objective || routine.description}
            </p>
          ) : (
            <p className="text-[13px] leading-6 text-[hsl(var(--fg-3))]">
              {routine.active ? 'This is the plan you can start today.' : 'This template is ready to clone or activate later.'}
            </p>
          )}
        </div>
        {!isPrescribed && (
          <div className="flex gap-1">
            <button
              onClick={onClone}
              title="Clone"
              className="flex h-8 w-8 items-center justify-center rounded-[10px] text-[hsl(var(--fg-3))] transition-colors hover:bg-[hsl(var(--fill))] hover:text-[hsl(var(--brand))]"
            >
              <Copy className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
            <button
              onClick={onDelete}
              title="Delete"
              className="flex h-8 w-8 items-center justify-center rounded-[10px] text-[hsl(var(--fg-3))] transition-colors hover:bg-[hsl(var(--err)/0.08)] hover:text-[hsl(var(--err))]"
            >
              <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {DAYS_ABBR.map((abbr, i) => {
          const hasWorkout = days.some((day) => Number(day.day) === i);
          return (
            <div
              key={i}
              title={DAYS[i]}
              className={`flex h-8 items-center justify-center rounded-[10px] text-[10px] font-semibold transition-colors ${
                hasWorkout
                  ? 'border border-[hsl(var(--brand)/0.22)] bg-[hsl(var(--brand)/0.12)] text-[hsl(var(--brand))]'
                  : 'border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--fill)/0.72)] text-[hsl(var(--fg-3))]'
              }`}
            >
              {abbr}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2 text-[11px] text-[hsl(var(--fg-2))]">
        <span className="inline-flex items-center gap-1 rounded-full border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.62)] px-2.5 py-1">
          <Dumbbell className="h-3.5 w-3.5" strokeWidth={2} />
          <span>{days.length} days</span>
        </span>
        {routine.estimated_duration_minutes && (
          <span className="inline-flex items-center gap-1 rounded-full border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.62)] px-2.5 py-1">
            <Clock className="w-3.5 h-3.5" strokeWidth={2} />
            <span>{routine.estimated_duration_minutes} min</span>
          </span>
        )}
        {routine.total_exercises && (
          <span className="inline-flex items-center gap-1 rounded-full border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.62)] px-2.5 py-1">
            <Dumbbell className="w-3.5 h-3.5" strokeWidth={2} />
            <span>{routine.total_exercises} exercises</span>
          </span>
        )}
        {activeDays > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.62)] px-2.5 py-1">
            <Calendar className="w-3.5 h-3.5" strokeWidth={2} />
            <span>{activeDays} scheduled</span>
          </span>
        )}
        {exerciseCount > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.62)] px-2.5 py-1">
            <ClipboardList className="w-3.5 h-3.5" strokeWidth={2} />
            <span>{exerciseCount} exercises inside</span>
          </span>
        )}
        {routine.last_completed_date && (
          <span className="inline-flex items-center gap-1 rounded-full border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.62)] px-2.5 py-1">
            <Calendar className="w-3.5 h-3.5" strokeWidth={2} />
            <span>{new Date(routine.last_completed_date).toLocaleDateString(locale === 'pt-BR' ? 'pt-BR' : 'en-US', { month: 'short', day: 'numeric' })}</span>
          </span>
        )}
      </div>

      <Link
        to={`/workouts?routine=${routine.id}`}
        className={cn(
          'group flex items-center justify-between rounded-[12px] border px-3.5 py-3 text-[12px] font-semibold transition-colors',
          routine.active
            ? 'border-[hsl(var(--ok)/0.18)] bg-[hsl(var(--ok)/0.08)] text-[hsl(var(--ok))] hover:bg-[hsl(var(--ok)/0.12)]'
            : 'border-[hsl(var(--brand)/0.18)] bg-[hsl(var(--brand)/0.1)] text-[hsl(var(--brand))] hover:bg-[hsl(var(--brand)/0.16)]'
        )}
      >
        <span className="flex items-center gap-2">
          <Dumbbell className="h-3.5 w-3.5" strokeWidth={2} />
          {routine.active ? 'Continue today' : 'Start today'}
        </span>
        <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
      </Link>
    </div>
  );
}
