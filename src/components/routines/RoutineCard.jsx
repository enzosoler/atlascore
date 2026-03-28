import React from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, Calendar, Clock, Copy, Trash2, ChevronRight } from 'lucide-react';
import { useI18n } from '@/lib/i18nContext';

const DAYS_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function RoutineCard({ routine, isPrescribed, onDelete, onClone }) {
  const { locale } = useI18n();
  const daysWithWorkout = routine.days_of_week?.filter(d => d.workout_id) || [];

  return (
    <div className="atlas-card flex flex-col gap-4 rounded-[18px] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[hsl(var(--brand)/0.24)] hover:shadow-[var(--shadow-md)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h3 className="truncate text-[15px] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">
              {routine.name}
            </h3>
            {isPrescribed && <span className="badge badge-blue text-[10px]">Prescribed</span>}
            {routine.active && <span className="badge badge-ok text-[10px]">Active</span>}
          </div>
          {routine.description && (
            <p className="line-clamp-2 text-[13px] leading-6 text-[hsl(var(--fg-2))]">{routine.description}</p>
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
          const hasWorkout = daysWithWorkout.some(d => d.day === i);
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

      <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-[hsl(var(--fg-2))]">
        {routine.estimated_duration_minutes && (
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" strokeWidth={2} />
            <span>{routine.estimated_duration_minutes}min</span>
          </div>
        )}
        {routine.total_exercises && (
          <div className="flex items-center gap-1">
            <Dumbbell className="w-3.5 h-3.5" strokeWidth={2} />
            <span>{routine.total_exercises} exercises</span>
          </div>
        )}
        {routine.last_completed_date && (
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" strokeWidth={2} />
            <span>{new Date(routine.last_completed_date).toLocaleDateString(locale === 'pt-BR' ? 'pt-BR' : 'en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
        )}
      </div>

      <Link
        to={`/workouts?routine=${routine.id}`}
        className="group flex items-center justify-between rounded-[12px] border border-[hsl(var(--brand)/0.18)] bg-[hsl(var(--brand)/0.1)] px-3.5 py-3 text-[12px] font-semibold text-[hsl(var(--brand))] transition-colors hover:bg-[hsl(var(--brand)/0.16)]"
      >
        <span className="flex items-center gap-2">
          <Dumbbell className="h-3.5 w-3.5" strokeWidth={2} />
          Start today
        </span>
        <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
      </Link>
    </div>
  );
}
