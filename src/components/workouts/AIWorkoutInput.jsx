import React, { useState, useCallback } from 'react';
import { Sparkles, Loader2, AlertCircle, X, Dumbbell, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

/** Capitalize each word: "supino reto" → "Supino Reto" */
function titleCase(str) {
  if (!str) return str;
  return str.replace(/\b\p{L}+/gu, (word) =>
    word.charAt(0).toUpperCase() + word.slice(1)
  );
}

/**
 * AIWorkoutInput — Natural language exercise logging powered by AI.
 *
 * Users describe exercises in plain language (any language), e.g.:
 *   "supino reto 20kg 3x10, crucifixo 12kg 3x12"
 *   "bench press 135lbs 4 sets of 8, incline dumbbell press 3x10"
 *
 * The component calls the `log-workout-text` edge function which returns:
 *   {
 *     success: true,
 *     source: 'ai' | 'cache',
 *     exercises: [
 *       { name, sets, reps, weight, weight_unit, muscle_group, rest_seconds, confidence }
 *     ],
 *     estimated_duration_minutes,
 *     notes
 *   }
 *
 * Props:
 *   onExercisesDetected(exercises[]) — called with an array of exercise items in the standard shape:
 *     { name, sets, reps, weight, weight_unit, muscle_group, rest_seconds, confidence }
 */
export default function AIWorkoutInput({ onExercisesDetected }) {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null); // The full AI response
  const [error, setError] = useState(null);

  const handleAnalyze = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed) {
      toast.error('Describe your exercises');
      return;
    }

    setIsAnalyzing(true);
    setResult(null);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('log-workout-text', {
        body: { query: trimmed },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      // Handle rate limit / spending cap errors from the edge function
      if (data?.error) {
        if (data.code === 'USER_DAILY_LIMIT') {
          setError(`Daily AI limit reached (${data.used}/${data.limit}). Try again tomorrow or add exercises manually.`);
        } else if (data.code === 'KILL_SWITCH') {
          setError('AI workout analysis is temporarily unavailable. Please add exercises manually.');
        } else if (data.code === 'MONTHLY_CAP' || data.code === 'DAILY_CAP') {
          setError('AI workout analysis has reached its limit. Please add exercises manually.');
        } else {
          setError(data.error);
        }
        return;
      }

      if (!data?.success || !data?.exercises?.length) {
        toast.info('Could not identify exercises. Try being more specific (e.g., "bench press 3x10 with 60kg").');
        return;
      }

      setResult(data);
    } catch (err) {
      console.error('AI workout text error:', err);
      const msg = err?.message || '';
      if (msg.includes('429') || msg.includes('rate')) {
        setError('Too many requests. Please wait a moment and try again.');
      } else {
        setError('Failed to analyze. Please try again or add exercises manually.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  }, [text]);

  const handleConfirm = useCallback(() => {
    if (!result?.exercises?.length) return;

    // Format exercises for the workout plan
    const exercises = result.exercises.map((ex) => ({
      name: titleCase(ex.name),
      sets: ex.sets || 3,
      reps: String(ex.reps || '8-12'),
      weight: ex.weight || null,
      weight_unit: ex.weight_unit || 'kg',
      muscle_group: ex.muscle_group || '',
      rest_seconds: ex.rest_seconds || 60,
      confidence: ex.confidence || 0.8,
    }));

    onExercisesDetected(exercises);
    resetState();
  }, [result, onExercisesDetected]);

  const resetState = useCallback(() => {
    setText('');
    setResult(null);
    setIsAnalyzing(false);
    setError(null);
  }, []);

  // ── Input mode: before analysis ──────────────────────────────────────────
  if (!result) {
    return (
      <div className="space-y-2">
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAnalyze();
              }
            }}
            placeholder="Describe your exercises... (e.g., bench press 60kg 3x10, squats 100kg 4x8)"
            rows={2}
            disabled={isAnalyzing}
            className="w-full px-3 py-2.5 pr-10 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--fill)/0.46)] text-[13px] text-[hsl(var(--fg))] placeholder:text-[hsl(var(--fg-3))] resize-none focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand)/0.3)] focus:border-[hsl(var(--brand))] disabled:opacity-50 transition-all"
          />
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !text.trim()}
            className="absolute right-2 bottom-2 w-8 h-8 rounded-lg bg-[hsl(var(--brand))] text-white flex items-center justify-center hover:bg-[hsl(var(--brand)/0.9)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {isAnalyzing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
          </button>
        </div>

        {isAnalyzing && (
          <p className="text-[11px] text-[hsl(var(--fg-3))] text-center animate-pulse">
            AI is analyzing your workout...
          </p>
        )}

        {error && (
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-[hsl(var(--err)/0.1)] text-[hsl(var(--err))]">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <p className="text-[12px]">{error}</p>
          </div>
        )}
      </div>
    );
  }

  // ── Result mode: show detected exercises ──────────────────────────────────────
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium text-[hsl(var(--fg))] flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-[hsl(var(--brand))]" />
          AI Result
          {result.source === 'cache' && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 ml-1">
              instant
            </span>
          )}
        </p>
        <button
          onClick={resetState}
          className="text-[hsl(var(--fg-3))] hover:text-[hsl(var(--fg))] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Exercises list */}
      <div className="space-y-2">
        {result.exercises.map((ex, idx) => (
          <div
            key={idx}
            className="p-3 rounded-xl border border-[hsl(var(--brand)/0.3)] bg-[hsl(var(--brand)/0.05)]"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-[hsl(var(--brand))]" />
                <p className="font-semibold text-[14px] text-[hsl(var(--fg))]">{titleCase(ex.name)}</p>
              </div>
              {ex.confidence != null && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 ${
                    ex.confidence >= 0.8
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : ex.confidence >= 0.5
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                  }`}
                >
                  {Math.round(ex.confidence * 100)}%
                </span>
              )}
            </div>

            {/* Exercise details */}
            <div className="flex gap-3 text-[12px] mt-2 pt-2 border-t border-[hsl(var(--border)/0.5)]">
              <span className="text-[hsl(var(--fg-2))]">
                <b className="text-[hsl(var(--fg))]">{ex.sets}</b> sets
              </span>
              <span className="text-[hsl(var(--fg-2))]">
                <b className="text-[hsl(var(--fg))]">{ex.reps}</b> reps
              </span>
              {ex.weight && (
                <span className="text-[hsl(var(--fg-2))]">
                  <b className="text-[hsl(var(--fg))]">{ex.weight}{ex.weight_unit || 'kg'}</b>
                </span>
              )}
              {ex.muscle_group && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[hsl(var(--fill))] text-[hsl(var(--fg-2))] capitalize">
                  {ex.muscle_group}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Estimated duration */}
      {result.estimated_duration_minutes && (
        <div className="flex items-center gap-2 text-[11px] text-[hsl(var(--fg-3))]">
          <Clock className="w-3.5 h-3.5 shrink-0" />
          <span>Estimated duration: ~{result.estimated_duration_minutes} minutes</span>
        </div>
      )}

      {/* Notes */}
      {result.notes && (
        <div className="flex items-start gap-2 text-[11px] text-[hsl(var(--fg-3))]">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{result.notes}</span>
        </div>
      )}

      {/* Disclaimer */}
      <div className="flex items-center gap-2 text-[11px] text-[hsl(var(--fg-3))]">
        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
        <span>AI estimates — adjust sets/reps/weight after adding if needed.</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="outline" onClick={resetState} className="flex-1 h-9 rounded-xl text-[12px]">
          Try again
        </Button>

        <Button
          onClick={handleConfirm}
          className="flex-1 h-9 rounded-xl text-[12px] btn btn-primary gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Add {result.exercises.length} exercise{result.exercises.length !== 1 ? 's' : ''}
        </Button>
      </div>

      {/* Usage info */}
      {result.usage && (
        <p className="text-[10px] text-[hsl(var(--fg-3))] text-center">
          {result.usage.calls_today}/{result.usage.daily_limit} AI analyses used today
        </p>
      )}
    </div>
  );
}
