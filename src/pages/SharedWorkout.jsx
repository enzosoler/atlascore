/**
 * SharedWorkout — Public page for viewing & importing a shared workout.
 * Route: /shared/workout/:token
 *
 * - Loads shared workout data by token (no auth needed to view)
 * - Shows a preview of the workout plan/day
 * - "Import to my workouts" button requires login
 */
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useT } from '@/lib/i18nContext';
import { useAuth } from '@/lib/AuthContext';
import { getSharedWorkout, importSharedWorkout } from '@/services/shareWorkoutService';
import { ROUTES } from '@/lib/routes';
import {
  Dumbbell, ChevronDown, ChevronUp, Download, Loader2, Share2, User, AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

function ExercisePreview({ exercise, index }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[hsl(var(--shell))] text-[11px] font-bold text-[hsl(var(--fg-2))]">
        {index + 1}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[hsl(var(--fg))] truncate">{exercise.name}</p>
        {exercise.muscle_group && (
          <p className="text-[11px] text-[hsl(var(--fg-2))]">{exercise.muscle_group}</p>
        )}
      </div>
      <div className="flex gap-2 text-[11px] text-[hsl(var(--fg-2))] shrink-0">
        {exercise.sets > 0 && <span>{exercise.sets}s</span>}
        {exercise.reps && <span>{exercise.reps}r</span>}
      </div>
    </div>
  );
}

function DayPreview({ day, defaultOpen = false }) {
  const t = useT();
  const [open, setOpen] = useState(defaultOpen);
  const exercises = day.exercises || [];
  return (
    <div className="rounded-[18px] border border-[hsl(var(--border-h))] bg-[hsl(var(--card))] overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div>
          <p className="text-[14px] font-semibold text-[hsl(var(--fg))]">
            {day.name || t('sharedWorkout.session')}
          </p>
          {day.focus && <p className="text-[12px] text-[hsl(var(--fg-2))] mt-0.5">{day.focus}</p>}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[12px] text-[hsl(var(--fg-2))]">
            {exercises.length} {exercises.length !== 1 ? t('sharedWorkout.exercises') : t('sharedWorkout.exercise')}
          </span>
          {open ? (
            <ChevronUp className="w-4 h-4 text-[hsl(var(--fg-2))] shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[hsl(var(--fg-2))] shrink-0" />
          )}
        </div>
      </button>
      {open && exercises.length > 0 && (
        <div className="border-t border-[hsl(var(--border-h))] py-1">
          {exercises.map((ex, i) => (
            <ExercisePreview key={i} exercise={ex} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SharedWorkout() {
  const { token } = useParams();
  const t = useT();
  const navigate = useNavigate();
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const qc = useQueryClient();
  const [importing, setImporting] = useState(false);

  const { data: share, isLoading, error } = useQuery({
    queryKey: ['shared-workout', token],
    queryFn: () => getSharedWorkout(token),
    enabled: !!token,
    retry: false,
  });

  const handleImport = async () => {
    if (!isAuthenticated) {
      const nextUrl = `${window.location.origin}/shared/workout/${token}`;
      navigate(`/auth?mode=login&next=${encodeURIComponent(nextUrl)}`);
      return;
    }

    setImporting(true);
    try {
      await importSharedWorkout(token);
      toast.success(t('sharedWorkout.import_success'));
      qc.invalidateQueries({ queryKey: ['workout-plans'] });
      qc.invalidateQueries({ queryKey: ['workout-plans-active'] });
      navigate(ROUTES.myWorkout);
    } catch (err) {
      console.error('[SharedWorkout] Import error:', err);
      toast.error(t('sharedWorkout.import_error'));
    } finally {
      setImporting(false);
    }
  };

  // Loading
  if (isLoading || isLoadingAuth) {
    return (
      <div className="min-h-screen bg-[hsl(var(--bg))] flex items-center justify-center">
        <div className="flex items-center gap-2 text-[hsl(var(--fg-2))]">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-[14px]">{t('sharedWorkout.loading')}</span>
        </div>
      </div>
    );
  }

  // Error / not found
  if (error || !share) {
    return (
      <div className="min-h-screen bg-[hsl(var(--bg))] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(var(--shell))]">
              <AlertCircle className="h-7 w-7 text-[hsl(var(--fg-2))]" />
            </div>
          </div>
          <h1 className="text-[18px] font-semibold text-[hsl(var(--fg))]">
            {t('sharedWorkout.not_found_title')}
          </h1>
          <p className="text-[14px] text-[hsl(var(--fg-2))]">
            {t('sharedWorkout.not_found_desc')}
          </p>
          <button
            onClick={() => navigate(ROUTES.home)}
            className="inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 py-2.5 text-[13px] font-semibold text-white"
          >
            {t('sharedWorkout.go_home')}
          </button>
        </div>
      </div>
    );
  }

  const workout = share.workout_data || {};
  const days = Array.isArray(workout.days) ? workout.days : [];
  const isPlan = share.share_type === 'plan';

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))] text-[hsl(var(--fg))]">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12 space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(var(--primary)/0.1)]">
              <Dumbbell className="h-7 w-7 text-[hsl(var(--primary))]" />
            </div>
          </div>
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-wide text-[hsl(var(--primary))]">
              {isPlan ? t('sharedWorkout.shared_plan') : t('sharedWorkout.shared_workout')}
            </p>
            <h1 className="text-[22px] font-bold text-[hsl(var(--fg))] mt-1">
              {workout.name || t('sharedWorkout.untitled')}
            </h1>
          </div>
          {share.sharer_name && (
            <div className="flex items-center justify-center gap-1.5 text-[13px] text-[hsl(var(--fg-2))]">
              <User className="h-3.5 w-3.5" />
              <span>{t('sharedWorkout.shared_by')} {share.sharer_name}</span>
            </div>
          )}
        </div>

        {/* Plan info */}
        {workout.objective && (
          <div className="rounded-[18px] border border-[hsl(var(--border-h))] bg-[hsl(var(--card))] p-4">
            <p className="text-[12px] font-semibold text-[hsl(var(--fg-2))] uppercase tracking-wide mb-1">
              {t('sharedWorkout.objective')}
            </p>
            <p className="text-[14px] text-[hsl(var(--fg))]">{workout.objective}</p>
          </div>
        )}

        {workout.frequency && (
          <p className="text-[13px] text-[hsl(var(--fg-2))] text-center">
            <span className="font-semibold">{t('sharedWorkout.frequency')}:</span> {workout.frequency}
          </p>
        )}

        {/* Days */}
        <div className="space-y-2">
          {days.map((day, i) => (
            <DayPreview key={i} day={day} defaultOpen={days.length === 1} />
          ))}
        </div>

        {/* Import button */}
        <div className="pt-2 space-y-3">
          <button
            onClick={handleImport}
            disabled={importing}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 py-3 text-[14px] font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-50"
          >
            {importing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {isAuthenticated
              ? t('sharedWorkout.import_btn')
              : t('sharedWorkout.login_to_import')
            }
          </button>
          <p className="text-center text-[12px] text-[hsl(var(--fg-2))]">
            {t('sharedWorkout.import_note')}
          </p>
        </div>

        {/* Branding */}
        <div className="text-center pt-4 border-t border-[hsl(var(--border-h))]">
          <p className="text-[12px] text-[hsl(var(--fg-2))]">
            {t('sharedWorkout.powered_by')}{' '}
            <a href="/" className="font-semibold text-[hsl(var(--primary))] hover:underline">
              atlas.core
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
