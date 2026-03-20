import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  Dumbbell,
  Flame,
  Loader2,
  Play,
  Plus,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { ROUTES } from '@/lib/routes';
import WorkoutExecutionScreen from '@/components/workouts/WorkoutExecutionScreen';
import { getActiveWorkoutPlans } from '@/services/workoutPlanService';
import { getRecentWorkouts, saveCompletedWorkout } from '@/services/workoutService';

// ─── helpers ──────────────────────────────────────────────────────────────────

function planExToExecution(ex) {
  const setCount = typeof ex.sets === 'number' && ex.sets > 0 ? ex.sets : 3;
  const setsArr = Array.from({ length: setCount }, (_, i) => ({
    set_number: i + 1,
    target_sets: setCount,
    target_reps: ex.reps || '',
    target_weight: ex.load ?? ex.target_weight ?? null,
  }));
  return {
    name: ex.name,
    primary_muscles: ex.muscle_group ? [ex.muscle_group] : [],
    technique: ex.technique || null,
    rest_seconds: ex.rest || ex.rest_seconds || 60,
    execution_notes: ex.notes || null,
    target_sets: setCount,
    target_reps: ex.reps || '',
    target_weight: ex.load ?? ex.target_weight ?? null,
    media_gif_url: ex.media_gif_url || null,
    sets: setsArr,
  };
}

function buildSessionFromPlan(plan, dayIndex) {
  const day = plan.days[dayIndex];
  return {
    name: day.label || day.name || `Day ${dayIndex + 1}`,
    date: new Date().toISOString().split('T')[0],
    plan_id: plan.id,
    plan_day_index: dayIndex,
    status: 'in_progress',
    exercises: (day.exercises || []).map(planExToExecution),
  };
}

function formatDuration(minutes) {
  if (!minutes) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatVolume(kg) {
  if (!kg) return '—';
  return kg >= 1000 ? `${(kg / 1000).toFixed(1)}t` : `${kg}kg`;
}

function formatRelativeDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ─── sub-components ───────────────────────────────────────────────────────────

function DayCard({ day, dayIndex, onStart }) {
  const [expanded, setExpanded] = useState(false);
  const exerciseCount = (day.exercises || []).length;

  return (
    <div className="rounded-2xl border border-white/8 bg-white/4 overflow-hidden">
      {/* Header row */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
      >
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-cyan-500/15 flex items-center justify-center">
          <Dumbbell className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white leading-tight truncate">{day.label || day.name || `Day ${dayIndex + 1}`}</p>
          <p className="text-xs text-white/45 mt-0.5">{exerciseCount} exercises</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onStart(dayIndex); }}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 text-black text-xs font-bold hover:bg-cyan-400 transition-colors"
        >
          <Play className="w-3 h-3 fill-current" />
          Start
        </button>
        <span className="flex-shrink-0 text-white/30 ml-1">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </span>
      </button>

      {/* Exercise list */}
      {expanded && (
        <div className="border-t border-white/6 px-4 py-2 space-y-2">
          {(day.exercises || []).map((ex, i) => (
            <div key={i} className="flex items-center gap-2 py-1.5">
              <span className="w-5 h-5 rounded-md bg-white/8 flex items-center justify-center text-[10px] font-bold text-white/40 flex-shrink-0">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white/85 truncate">{ex.name}</p>
              </div>
              <span className="text-xs text-white/40 flex-shrink-0">{ex.sets}×{ex.reps}</span>
              {ex.load && <span className="text-xs text-cyan-400/70 flex-shrink-0">{ex.load}kg</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SessionCard({ session }) {
  const exerciseCount = Array.isArray(session.exercises_completed) ? session.exercises_completed.length : 0;

  return (
    <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-white/8 bg-white/4">
      <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center">
        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{session.name}</p>
        <p className="text-xs text-white/40 mt-0.5">{formatRelativeDate(session.completed_at)}</p>
      </div>
      <div className="flex-shrink-0 text-right space-y-0.5">
        <div className="flex items-center gap-1 justify-end">
          <Clock className="w-3 h-3 text-white/30" />
          <span className="text-xs text-white/50">{formatDuration(session.duration_minutes)}</span>
        </div>
        <div className="flex items-center gap-1 justify-end">
          <TrendingUp className="w-3 h-3 text-white/30" />
          <span className="text-xs text-white/50">{formatVolume(session.volume_load)}</span>
        </div>
      </div>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export default function WorkoutsV2() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [mode, setMode] = useState('list');
  const [activeSession, setActiveSession] = useState(null);

  const { data: activePlan, isLoading: isLoadingPlan } = useQuery({
    queryKey: ['active-workout-plan', user?.id],
    queryFn: async () => {
      const plans = await getActiveWorkoutPlans(user.id);
      return plans[0] || null;
    },
    enabled: !!user?.id,
  });

  const { data: recentSessions = [], isLoading: isLoadingRecent } = useQuery({
    queryKey: ['recent-workouts', user?.id],
    queryFn: () => getRecentWorkouts(user.id, 5),
    enabled: !!user?.id,
  });

  const saveWorkoutMut = useMutation({
    mutationFn: ({ userId, payload, originalWorkout }) =>
      saveCompletedWorkout(userId, payload, originalWorkout),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recent-workouts'] });
      setMode('list');
      setActiveSession(null);
      toast.success('Session saved!');
    },
    onError: () => {
      toast.error('Error saving workout. Check your connection.');
    },
  });

  const handleStartFromPlan = (dayIndex) => {
    if (!activePlan) return;
    setActiveSession(buildSessionFromPlan(activePlan, dayIndex));
    setMode('execution');
  };

  const handleStartEmpty = () => {
    setActiveSession({ name: 'Free Workout', exercises: [] });
    setMode('execution');
  };

  const handleCompleteWorkout = (completedData) => {
    if (!user?.id || !activeSession) return;
    saveWorkoutMut.mutate({ userId: user.id, payload: completedData, originalWorkout: activeSession });
  };

  // ── Execution mode ────────────────────────────────────────────────────────
  if (mode === 'execution') {
    return (
      <WorkoutExecutionScreen
        workout={activeSession}
        onComplete={handleCompleteWorkout}
        onBack={() => { setMode('list'); setActiveSession(null); }}
      />
    );
  }

  const isLoading = isLoadingPlan || isLoadingRecent;
  const days = activePlan?.days || [];

  // ── List mode ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#070d0d] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#070d0d]/95 backdrop-blur-sm px-4 pt-14 pb-4 border-b border-white/6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold tracking-widest text-white/30 uppercase">Training</p>
            <h1 className="text-2xl font-bold text-white mt-0.5">Workouts</h1>
          </div>
          <button
            onClick={handleStartEmpty}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/8 text-white text-sm font-medium hover:bg-white/12 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Free
          </button>
        </div>
      </div>

      <div className="px-4 pt-6 space-y-8">

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
          </div>
        )}

        {/* Active Plan */}
        {!isLoading && activePlan && (
          <section>
            {/* Plan summary bar */}
            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/8 px-4 py-4 mb-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold tracking-widest text-cyan-400 uppercase">Active Plan</p>
                  <p className="text-base font-bold text-white mt-0.5 truncate">{activePlan.name}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="flex items-center gap-1 text-xs text-white/40">
                      <Calendar className="w-3 h-3" />{activePlan.frequency}x / week
                    </span>
                    <span className="flex items-center gap-1 text-xs text-white/40">
                      <Dumbbell className="w-3 h-3" />{days.length} days
                    </span>
                  </div>
                  {activePlan.objective && (
                    <p className="text-xs text-white/35 mt-1 italic truncate">{activePlan.objective}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Day cards */}
            <div className="space-y-2.5">
              {days.map((day, i) => (
                <DayCard key={i} day={day} dayIndex={i} onStart={handleStartFromPlan} />
              ))}
            </div>
          </section>
        )}

        {/* No plan state */}
        {!isLoading && !activePlan && (
          <div className="rounded-2xl border border-white/8 bg-white/4 px-6 py-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/8 flex items-center justify-center mx-auto mb-4">
              <Dumbbell className="w-6 h-6 text-white/30" />
            </div>
            <p className="text-white font-semibold">No active plan</p>
            <p className="text-white/40 text-sm mt-1 mb-5">Create a structured plan or start a free workout</p>
            <button
              onClick={handleStartEmpty}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 text-black text-sm font-bold hover:bg-cyan-400 transition-colors"
            >
              <Play className="w-4 h-4 fill-current" />
              Start Free Workout
            </button>
          </div>
        )}

        {/* Recent Sessions */}
        {!isLoading && recentSessions.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold tracking-widest text-white/30 uppercase">Recent Sessions</p>
              <span className="flex items-center gap-1 text-xs text-white/30">
                <Flame className="w-3 h-3 text-orange-400" />
                {recentSessions.length} logged
              </span>
            </div>
            <div className="space-y-2.5">
              {recentSessions.map((s) => (
                <SessionCard key={s.id} session={s} />
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
