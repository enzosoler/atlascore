import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Zap,
  Clock,
  Dumbbell,
  Home,
  ArrowRight,
  Sparkles,
  Target,
  Timer,
  Play,
  AlertCircle,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const MUSCLE_OPTIONS = [
  { value: 'chest', label: 'Chest', icon: '💪' },
  { value: 'back', label: 'Back', icon: '🔙' },
  { value: 'shoulders', label: 'Shoulders', icon: '🎯' },
  { value: 'arms', label: 'Arms', icon: '💪' },
  { value: 'legs', label: 'Legs', icon: '🦵' },
  { value: 'core', label: 'Core', icon: '🎯' },
  { value: 'full_body', label: 'Full Body', icon: '⚡' },
];

const DURATION_OPTIONS = [
  { value: 15, label: '15 min', description: 'Quick blast' },
  { value: 30, label: '30 min', description: 'Standard' },
  { value: 45, label: '45 min', description: 'Focused' },
  { value: 60, label: '60 min', description: 'Complete' },
];

const LOCATION_OPTIONS = [
  { value: 'gym', label: 'Gym', icon: Dumbbell, description: 'Full equipment' },
  { value: 'home', label: 'Home', icon: Home, description: 'Minimal equipment' },
  { value: 'anywhere', label: 'Anywhere', icon: Zap, description: 'No equipment' },
];

export default function QuickWorkoutModal({ open, onClose, onStart }) {
  const [step, setStep] = useState(1);
  const [muscle, setMuscle] = useState('');
  const [duration, setDuration] = useState(30);
  const [location, setLocation] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedWorkout, setGeneratedWorkout] = useState(null);
  const [generationError, setGenerationError] = useState(null);
  const [isValidWorkout, setIsValidWorkout] = useState(false);

  /**
   * Validates AI-generated workout structure
   * Returns { isValid: boolean, error: string | null }
   */
  const validateWorkout = (workout) => {
    if (!workout || typeof workout !== 'object') {
      return { isValid: false, error: 'Invalid workout data received' };
    }

    if (!workout.exercises || !Array.isArray(workout.exercises)) {
      return { isValid: false, error: 'No exercises found in generated workout' };
    }

    if (workout.exercises.length === 0) {
      return { isValid: false, error: 'Workout contains no exercises' };
    }

    // Validate each exercise has required fields
    const requiredFields = ['name', 'sets', 'reps'];
    const invalidExercises = workout.exercises.filter((ex) => {
      if (!ex || typeof ex !== 'object') return true;
      return requiredFields.some((field) => !ex[field]);
    });

    if (invalidExercises.length > 0) {
      return {
        isValid: false,
        error: `${invalidExercises.length} exercise(s) missing required fields (name, sets, or reps)`,
      };
    }

    return { isValid: true, error: null };
  };

  const handleClose = () => {
    setStep(1);
    setMuscle('');
    setDuration(30);
    setLocation('');
    setGenerating(false);
    setGeneratedWorkout(null);
    setGenerationError(null);
    setIsValidWorkout(false);
    onClose();
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setGenerationError(null);
    setIsValidWorkout(false);

    try {
      const res = await base44.integrations.Core.InvokeLLM({
        systemPrompt: `You are an expert fitness coach. Create a focused, effective workout based on the user's constraints.

Rules:
1. Select exercises appropriate for the location (gym equipment vs home vs bodyweight)
2. Keep total duration within the time limit including rest periods
3. Choose exercises that target the requested muscle group effectively
4. Include warmup recommendations
5. Structure: 3-6 exercises with appropriate sets/reps

CRITICAL: You MUST return a valid workout with at least 3 exercises. Each exercise MUST have: name, muscle_group, sets (number), reps (string), rest_seconds (number).`,
        prompt: `Create a ${duration}-minute workout for ${muscle === 'full_body' ? 'full body' : muscle} training at ${location}.

Constraints:
- Duration: ${duration} minutes (include rest periods)
- Target: ${muscle}
- Location: ${location} (${location === 'gym' ? 'full equipment available' : location === 'home' ? 'dumbbells, bands, bodyweight' : 'bodyweight only'})

Generate a ready-to-train workout with exercises, sets, reps, and rest times.`,
        response_json_schema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            duration_minutes: { type: 'number' },
            focus: { type: 'string' },
            warmup: { type: 'array', items: { type: 'string' } },
            exercises: {
              type: 'array',
              minItems: 1,
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  muscle_group: { type: 'string' },
                  sets: { type: 'number', minimum: 1 },
                  reps: { type: 'string' },
                  rest_seconds: { type: 'number', minimum: 0 },
                  notes: { type: 'string' },
                },
                required: ['name', 'sets', 'reps'],
              },
            },
          },
          required: ['name', 'exercises'],
        },
      });

      // Strict validation before accepting the workout
      const validation = validateWorkout(res);

      if (!validation.isValid) {
        setGenerationError(validation.error);
        setGeneratedWorkout(null);
        setIsValidWorkout(false);
        // Stay on step 3, don't advance
        setGenerating(false);
        toast.error(`Workout generation failed: ${validation.error}. Please try again.`);
        return;
      }

      setGeneratedWorkout(res);
      setIsValidWorkout(true);
      setGenerationError(null);
      setStep(4);
    } catch (err) {
      console.error('Workout generation error:', err);
      setGenerationError(err?.message || 'Failed to generate workout');
      setGeneratedWorkout(null);
      setIsValidWorkout(false);
      toast.error('Failed to generate workout. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleStart = () => {
    // Strict validation: only proceed if we have a valid workout with exercises
    if (!generatedWorkout || !isValidWorkout) {
      toast.error('Cannot start: no valid workout generated');
      return;
    }

    const exercises = generatedWorkout.exercises || [];
    if (exercises.length === 0) {
      toast.error('Cannot start: workout has no exercises');
      return;
    }

    const session = {
      name: generatedWorkout.name || 'Quick Workout',
      date: new Date().toISOString().split('T')[0],
      status: 'in_progress',
      exercises: exercises.map((ex) => ({
        name: ex.name,
        primary_muscles: ex.muscle_group ? [ex.muscle_group] : [],
        rest_seconds: ex.rest_seconds || 60,
        target_sets: ex.sets || 3,
        target_reps: ex.reps || '8-12',
        sets: Array.from({ length: ex.sets || 3 }, (_, i) => ({
          set_number: i + 1,
          target_sets: ex.sets || 3,
          target_reps: ex.reps || '8-12',
          target_weight: null,
        })),
      })),
    };

    onStart(session);
    handleClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="flex w-full flex-col overflow-hidden rounded-t-[28px] border border-[hsl(var(--border))] bg-[linear-gradient(180deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_100%)] sm:max-w-lg sm:rounded-[24px]"
        style={{ maxHeight: 'min(92svh, 92vh)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[hsl(var(--border))] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[hsl(var(--brand)/0.15)] flex items-center justify-center">
              <Zap className="w-5 h-5 text-[hsl(var(--brand))]" />
            </div>
            <div>
              <p className="text-xs font-semibold tracking-widest text-[hsl(var(--fg-3))] uppercase">AI Workout</p>
              <h2 className="text-lg font-bold text-[hsl(var(--fg))] mt-0.5">Quick Workout</h2>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="h-9 w-9 flex items-center justify-center rounded-xl text-[hsl(var(--fg-3))] hover:text-[hsl(var(--fg))] hover:bg-[hsl(var(--fill))] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <AnimatePresence mode="wait">
            {/* Step 1: Muscle Focus */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[hsl(var(--brand)/0.1)] flex items-center justify-center shrink-0">
                    <Target className="w-5 h-5 text-[hsl(var(--brand))]" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold text-[hsl(var(--fg))]">What do you want to train?</h3>
                    <p className="text-xs text-[hsl(var(--fg-2))] mt-1">Select your focus for today</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {MUSCLE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setMuscle(opt.value)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        muscle === opt.value
                          ? 'border-[hsl(var(--brand))] bg-[hsl(var(--brand)/0.08)]'
                          : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--brand)/0.4)]'
                      }`}
                    >
                      <span className="text-2xl">{opt.icon}</span>
                      <p className="text-sm font-medium text-[hsl(var(--fg))] mt-1">{opt.label}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Duration */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[hsl(var(--brand)/0.1)] flex items-center justify-center shrink-0">
                    <Timer className="w-5 h-5 text-[hsl(var(--brand))]" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold text-[hsl(var(--fg))]">How much time do you have?</h3>
                    <p className="text-xs text-[hsl(var(--fg-2))] mt-1">Include warmup and cooldown</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {DURATION_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setDuration(opt.value)}
                      className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                        duration === opt.value
                          ? 'border-[hsl(var(--brand))] bg-[hsl(var(--brand)/0.08)]'
                          : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--brand)/0.4)]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          duration === opt.value ? 'border-[hsl(var(--brand))]' : 'border-[hsl(var(--border))]'
                        }`}>
                          {duration === opt.value && <div className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--brand))]" />}
                        </div>
                        <span className="font-medium text-[hsl(var(--fg))]">{opt.label}</span>
                      </div>
                      <span className="text-xs text-[hsl(var(--fg-2))]">{opt.description}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 3: Location */}
            {step === 3 && !generating && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[hsl(var(--brand)/0.1)] flex items-center justify-center shrink-0">
                    <Home className="w-5 h-5 text-[hsl(var(--brand))]" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold text-[hsl(var(--fg))]">Where are you training?</h3>
                    <p className="text-xs text-[hsl(var(--fg-2))] mt-1">This affects exercise selection</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {LOCATION_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setLocation(opt.value)}
                        className={`w-full p-4 rounded-xl border text-left transition-all ${
                          location === opt.value
                            ? 'border-[hsl(var(--brand))] bg-[hsl(var(--brand)/0.08)]'
                            : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--brand)/0.4)]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            location === opt.value ? 'border-[hsl(var(--brand))]' : 'border-[hsl(var(--border))]'
                          }`}>
                            {location === opt.value && <div className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--brand))]" />}
                          </div>
                          <div className="w-10 h-10 rounded-lg bg-[hsl(var(--fill))] flex items-center justify-center">
                            <Icon className="w-5 h-5 text-[hsl(var(--brand))]" />
                          </div>
                          <div>
                            <span className="font-medium text-[hsl(var(--fg))] block">{opt.label}</span>
                            <span className="text-xs text-[hsl(var(--fg-2))]">{opt.description}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Generation Error Display */}
                {generationError && (
                  <div className="p-3 rounded-xl bg-[hsl(var(--err)/0.1)] border border-[hsl(var(--err)/0.3)]">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-[hsl(var(--err))] mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[12px] font-medium text-[hsl(var(--err))]">Generation failed</p>
                        <p className="text-[11px] text-[hsl(var(--err))] mt-0.5">{generationError}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setGenerationError(null);
                        handleGenerate();
                      }}
                      className="mt-2 w-full py-2 rounded-lg bg-[hsl(var(--brand))] text-white text-[12px] font-medium hover:opacity-90 transition-opacity"
                    >
                      Retry
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 4: Review & Start */}
            {step === 4 && generatedWorkout && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[hsl(var(--brand)/0.15)] flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-[hsl(var(--brand))]" />
                  </div>
                  <div>
                    <h3 className="text-[17px] font-bold text-[hsl(var(--fg))]">{generatedWorkout.name}</h3>
                    <p className="text-xs text-[hsl(var(--fg-2))]">{generatedWorkout.duration_minutes} min · {generatedWorkout.focus}</p>
                  </div>
                </div>

                {generatedWorkout.warmup?.length > 0 && (
                  <div className="rounded-xl bg-[hsl(var(--fill)/0.5)] p-3">
                    <p className="text-xs font-semibold text-[hsl(var(--fg-2))] uppercase tracking-wider mb-2">Warmup</p>
                    <ul className="space-y-1">
                      {generatedWorkout.warmup.map((w, i) => (
                        <li key={i} className="text-sm text-[hsl(var(--fg))]">• {w}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-[hsl(var(--fg-2))] uppercase tracking-wider">Exercises</p>
                  {generatedWorkout.exercises?.map((ex, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-md bg-[hsl(var(--brand)/0.15)] flex items-center justify-center text-xs font-bold text-[hsl(var(--brand))]">
                          {i + 1}
                        </span>
                        <span className="text-sm font-medium text-[hsl(var(--fg))]">{ex.name}</span>
                      </div>
                      <span className="text-xs text-[hsl(var(--fg-2))]">{ex.sets}×{ex.reps}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Generating State */}
            {generating && (
              <motion.div
                key="generating"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 space-y-4"
              >
                <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--brand)/0.1)] flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles className="w-8 h-8 text-[hsl(var(--brand))]" />
                  </motion.div>
                </div>
                <p className="text-[15px] font-semibold text-[hsl(var(--fg))]">Building your workout...</p>
                <p className="text-sm text-[hsl(var(--fg-2))]">AI selecting optimal exercises</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-[hsl(var(--border))] flex-shrink-0" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
          {step > 1 && step < 4 && !generating && (
            <button
              onClick={() => setStep(step - 1)}
              className="text-sm text-[hsl(var(--fg-2))] hover:text-[hsl(var(--fg))] transition-colors"
            >
              Back
            </button>
          )}
          {(step === 1 || step === 4) && <div />}

          {step === 1 && (
            <button
              onClick={() => setStep(2)}
              disabled={!muscle}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[hsl(var(--brand))] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {step === 2 && (
            <button
              onClick={() => setStep(3)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[hsl(var(--brand))] text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {step === 3 && (
            <button
              onClick={handleGenerate}
              disabled={!location || generating}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[hsl(var(--brand))] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              <Sparkles className="w-4 h-4" />
              Generate
            </button>
          )}

          {step === 4 && (
            <button
              onClick={handleStart}
              disabled={!isValidWorkout || !generatedWorkout}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[hsl(var(--brand))] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4 fill-current" />
              Start Workout
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
