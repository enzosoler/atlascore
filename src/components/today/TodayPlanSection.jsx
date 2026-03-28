import React from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, UtensilsCrossed, ArrowRight, CheckCircle2, Sparkles, Zap } from 'lucide-react';
import { ROUTES } from '@/lib/routes';

function WorkoutPlanCard({ activeWorkoutPlan, todaySession, hasAIAccess, onGenerateWorkout }) {
  const done = todaySession?.status === 'completed';

  return (
    <div className={`rounded-[18px] border p-4 flex flex-col gap-3 ${
      done
        ? 'border-[hsl(var(--ok)/0.22)] bg-[hsl(var(--ok)/0.05)]'
        : activeWorkoutPlan
          ? 'border-[hsl(var(--brand)/0.22)] bg-[hsl(var(--brand)/0.04)]'
          : 'border-[hsl(var(--border)/0.7)] bg-[hsl(var(--fill)/0.35)]'
    }`}>
      {/* Icon + label */}
      <div className="flex items-center justify-between">
        <div className={`w-8 h-8 rounded-[10px] flex items-center justify-center ${
          done
            ? 'bg-[hsl(var(--ok)/0.14)] text-[hsl(var(--ok))]'
            : activeWorkoutPlan
              ? 'bg-[hsl(var(--brand)/0.14)] text-[hsl(var(--brand))]'
              : 'bg-[hsl(var(--fill))] text-[hsl(var(--fg-3))]'
        }`}>
          {done
            ? <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} />
            : <Dumbbell className="w-4 h-4" strokeWidth={2} />
          }
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[hsl(var(--fg-3))]">
          Workout
        </span>
      </div>

      {/* Content */}
      <div className="flex-1">
        <p className="text-[13px] font-semibold text-[hsl(var(--fg))] leading-tight">
          {done
            ? todaySession.name || 'Session done'
            : activeWorkoutPlan
              ? activeWorkoutPlan.name || 'Today\'s plan'
              : 'No plan active'}
        </p>
        {done && (
          <p className="text-[11px] text-[hsl(var(--ok))] font-medium mt-0.5">
            {todaySession.duration_minutes || 0} min
          </p>
        )}
      </div>

      {/* Action */}
      <div>
        {done ? (
          <Link
            to={ROUTES.workouts}
            className="text-[12px] font-semibold text-[hsl(var(--fg-2))] flex items-center gap-1 hover:text-[hsl(var(--fg))] transition-colors"
          >
            Summary <ArrowRight className="w-3 h-3" />
          </Link>
        ) : activeWorkoutPlan ? (
          <Link
            to={ROUTES.workouts}
            className="flex items-center justify-center gap-1.5 w-full h-8 rounded-[10px] bg-[hsl(var(--brand))] text-white text-[12px] font-semibold"
          >
            <Zap className="w-3 h-3" strokeWidth={2.5} /> Start
          </Link>
        ) : hasAIAccess ? (
          <button
            onClick={onGenerateWorkout}
            className="flex items-center gap-1.5 text-[12px] font-semibold text-[hsl(var(--brand))] hover:opacity-70 transition-opacity"
          >
            <Sparkles className="w-3 h-3" /> Generate
          </button>
        ) : (
          <Link
            to={ROUTES.workouts}
            className="text-[12px] font-semibold text-[hsl(var(--brand))] hover:opacity-70 transition-opacity"
          >
            Create plan
          </Link>
        )}
      </div>
    </div>
  );
}

function NutritionCard({ todayMeals, kcalTarget = 2000, macros }) {
  const totalKcal = todayMeals.reduce((s, m) => s + (m.calories || m.total_calories || 0), 0);
  const totalProtein = todayMeals.reduce((s, m) => s + (m.protein_g || m.total_protein || 0), 0);
  const kcalRemaining = Math.max(0, kcalTarget - totalKcal);
  const kcalPct = Math.min(100, Math.round((totalKcal / kcalTarget) * 100));
  const proteinTarget = macros?.protein || 150;
  const proteinPct = Math.min(100, Math.round((totalProtein / proteinTarget) * 100));
  const logged = todayMeals.length > 0;

  return (
    <div className="rounded-[18px] border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--fill)/0.35)] p-4 flex flex-col gap-3">
      {/* Icon + label */}
      <div className="flex items-center justify-between">
        <div className="w-8 h-8 rounded-[10px] bg-[hsl(var(--fill))] text-[hsl(var(--fg-3))] flex items-center justify-center">
          <UtensilsCrossed className="w-4 h-4" strokeWidth={2} />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[hsl(var(--fg-3))]">
          Nutrition
        </span>
      </div>

      {/* Content */}
      <div className="flex-1">
        <p className="text-[13px] font-semibold text-[hsl(var(--fg))] leading-tight">
          {logged ? `${Math.round(totalKcal)} kcal` : 'Not logged yet'}
        </p>
        <p className="text-[11px] text-[hsl(var(--fg-3))] mt-0.5">
          {logged ? `${Math.round(kcalRemaining)} remaining` : `Goal: ${kcalTarget}`}
        </p>
      </div>

      {/* Mini progress bars */}
      {logged && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[hsl(var(--fg-3))] w-8 shrink-0">kcal</span>
            <div className="flex-1 h-1.5 rounded-full bg-[hsl(var(--fill))] overflow-hidden">
              <div
                className="h-full rounded-full bg-[hsl(var(--brand))] transition-all duration-500"
                style={{ width: `${kcalPct}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[hsl(var(--fg-3))] w-8 shrink-0">prot</span>
            <div className="flex-1 h-1.5 rounded-full bg-[hsl(var(--fill))] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#4F8CFF] transition-all duration-500"
                style={{ width: `${proteinPct}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Action */}
      <div>
        <Link
          to={ROUTES.nutrition}
          className="text-[12px] font-semibold text-[hsl(var(--brand))] flex items-center gap-1 hover:opacity-70 transition-opacity"
        >
          {logged ? 'Add meal' : 'Log first meal'} <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

export function TodayPlanSection({
  activeWorkoutPlan,
  todaySession,
  todayMeals,
  kcalTarget,
  macros,
  hasAIAccess,
  onGenerateWorkout,
}) {
  return (
    <section className="space-y-2.5">
      <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-[hsl(var(--fg-3))] px-0.5">
        Today's plan
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        <WorkoutPlanCard
          activeWorkoutPlan={activeWorkoutPlan}
          todaySession={todaySession}
          hasAIAccess={hasAIAccess}
          onGenerateWorkout={onGenerateWorkout}
        />
        <NutritionCard
          todayMeals={todayMeals}
          kcalTarget={kcalTarget}
          macros={macros}
        />
      </div>
    </section>
  );
}
