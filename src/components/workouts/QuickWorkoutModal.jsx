import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Zap,
  Dumbbell,
  Home,
  ArrowRight,
  Sparkles,
  Target,
  Timer,
  Play,
  AlertCircle,
  PenLine,
  Plus,
  Trash2,
} from 'lucide-react';
import { invokeLLMJson } from '@/lib/llm';
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

const EMPTY_EXERCISE = () => ({ name: '', sets: '3', reps: '10', rest_seconds: 60 });

export default function QuickWorkoutModal({ open, onClose, onStart }) {
  // mode: null = picker, 'ai' = AI flow, 'manual' = manual form
  const [mode, setMode] = useState(null);

  // AI flow state
  const [step, setStep] = useState(1);
  const [muscle, setMuscle] = useState('');
  const [duration, setDuration] = useState(30);
  const [location, setLocation] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedWorkout, setGeneratedWorkout] = useState(null);
  const [generationError, setGenerationError] = useState(null);
  const [isValidWorkout, setIsValidWorkout] = useState(false);

  // Manual flow state
  const [manualName, setManualName] = useState('');
  const [manualExercises, setManualExercises] = useState([EMPTY_EXERCISE()]);

  const validateWorkout = (workout) => {
    if (!workout || typeof workout !== 'object') return { isValid: false, error: 'Invalid workout data received' };
    if (!workout.exercises || !Array.isArray(workout.exercises)) return { isValid: false, error: 'No exercises found in generated workout' };
    if (workout.exercises.length === 0) return { isValid: false, error: 'Workout contains no exercises' };
    const invalidExercises = workout.exercises.filter((ex) => {
      if (!ex || typeof ex !== 'object') return true;
      return ['name', 'sets', 'reps'].some((f) => !ex[f]);
    });
    if (invalidExercises.length > 0) return { isValid: false, error: `${invalidExercises.length} exercise(s) missing required fields` };
    return { isValid: true, error: null };
  };

  const handleClose = () => {
    setMode(null);
    setStep(1);
    setMuscle('');
    setDuration(30);
    setLocation('');
    setGenerating(false);
    setGeneratedWorkout(null);
    setGenerationError(null);
    setIsValidWorkout(false);
    setManualName('');
    setManualExercises([EMPTY_EXERCISE()]);
    onClose();
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setGenerationError(null);
    setIsValidWorkout(false);

    try {
      const prompt = `You are an expert fitness coach. Create a focused, effective workout based on the user's constraints.

Rules:
1. Select exercises appropriate for the location (gym equipment vs home vs bodyweight)
2. Keep total duration within the time limit including rest periods
3. Choose exercises that target the requested muscle group effectively
4. Include warmup recommendations
5. Structure: 3-6 exercises with appropriate sets/reps

CRITICAL: You MUST return a valid workout with at least 3 exercises. Each exercise MUST have: name, muscle_group, sets (number), reps (string), rest_seconds (number).

Create a ${duration}-minute workout for ${muscle === 'full_body' ? 'full body' : muscle} training at ${location}.

Constraints:
- Duration: ${duration} minutes (include rest periods)
- Target: ${muscle}
- Location: ${location} (${location === 'gym' ? 'full equipment available' : location === 'home' ? 'dumbbells, bands, bodyweight' : 'bodyweight only'})

Generate a ready-to-train workout with exercises, sets, reps, and rest times.`;

      const schema = {
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
      };

      const res = await invokeLLMJson(prompt, schema);
      const validation = validateWorkout(res);

      if (!validation.isValid) {
        setGenerationError(validation.error);
        setGeneratedWorkout(null);
        setIsValidWorkout(false);
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

  const handleStartAI = () => {
    if (!generatedWorkout || !isValidWorkout) { toast.error('Cannot start: no valid workout generated'); return; }
    const exercises = generatedWorkout.exercises || [];
    if (exercises.length === 0) { toast.error('Cannot start: workout has no exercises'); return; }

    onStart({
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
    });
    handleClose();
  };

  const handleStartManual = () => {
    const validExercises = manualExercises.filter((e) => e.name.trim());
    if (!manualName.trim()) { toast.error('Add a workout name'); return; }
    if (validExercises.length === 0) { toast.error('Add at least one exercise'); return; }

    onStart({
      name: manualName.trim(),
      date: new Date().toISOString().split('T')[0],
      status: 'in_progress',
      exercises: validExercises.map((ex) => ({
        name: ex.name.trim(),
        primary_muscles: [],
        rest_seconds: Number(ex.rest_seconds) || 60,
        target_sets: Number(ex.sets) || 3,
        target_reps: String(ex.reps) || '10',
        sets: Array.from({ length: Number(ex.sets) || 3 }, (_, i) => ({
          set_number: i + 1,
          target_sets: Number(ex.sets) || 3,
          target_reps: String(ex.reps) || '10',
          target_weight: null,
        })),
      })),
    });
    handleClose();
  };

  const updateManualExercise = (idx, field, value) => {
    setManualExercises((prev) => prev.map((ex, i) => (i === idx ? { ...ex, [field]: value } : ex)));
  };

  const headerLabel = mode === 'ai' ? 'AI Workout' : mode === 'manual' ? 'Manual' : 'Quick Workout';

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
              <p className="text-xs font-semibold tracking-widest text-[hsl(var(--fg-3))] uppercase">{headerLabel}</p>
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

            {/* Mode picker */}
            {mode === null && (
              <motion.div
                key="mode-picker"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                <p className="text-sm text-[hsl(var(--fg-2))]">How do you want to create your workout?</p>

                <button
                  onClick={() => setMode('ai')}
                  className="w-full p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--brand)/0.5)] hover:bg-[hsl(var(--brand)/0.04)] transition-all text-left flex items-center gap-4"
                >
                  <div className="w-11 h-11 rounded-xl bg-[hsl(var(--brand)/0.12)] flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-[hsl(var(--brand))]" />
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-[hsl(var(--fg))]">Generate with AI</p>
                    <p className="text-xs text-[hsl(var(--fg-2))] mt-0.5">Pick muscle group, duration and location — AI builds the workout</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[hsl(var(--fg-3))] ml-auto shrink-0" />
                </button>

                <button
                  onClick={() => setMode('manual')}
                  className="w-full p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--brand)/0.5)] hover:bg-[hsl(var(--brand)/0.04)] transition-all text-left flex items-center gap-4"
                >
                  <div className="w-11 h-11 rounded-xl bg-[hsl(var(--fill))] flex items-center justify-center shrink-0">
                    <PenLine className="w-5 h-5 text-[hsl(var(--fg-2))]" />
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-[hsl(var(--fg))]">Add manually</p>
                    <p className="text-xs text-[hsl(var(--fg-2))] mt-0.5">Type your exercises, sets, and reps yourself</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[hsl(var(--fg-3))] ml-auto shrink-0" />
                </button>
              </motion.div>
            )}

            {/* Manual form */}
            {mode === 'manual' && (
              <motion.div
                key="manual"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {/* Workout name */}
                <div>
                  <label className="text-xs font-semibold text-[hsl(var(--fg-2))] uppercase tracking-wider block mb-1.5">
                    Workout name
                  </label>
                  <input
                    type="text"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    placeholder="e.g. Upper A, Leg Day, Push"
                    className="w-full h-10 px-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-sm text-[hsl(var(--fg))] placeholder:text-[hsl(var(--fg-3))] focus:outline-none focus:border-[hsl(var(--brand))] transition-colors"
                  />
                </div>

                {/* Exercise list */}
                <div>
                  <label className="text-xs font-semibold text-[hsl(var(--fg-2))] uppercase tracking-wider block mb-2">
                    Exercises
                  </label>
                  <div className="space-y-2">
                    {manualExercises.map((ex, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <span className="w-5 h-5 rounded-md bg-[hsl(var(--brand)/0.15)] flex items-center justify-center text-[10px] font-bold text-[hsl(var(--brand))] shrink-0">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={ex.name}
                          onChange={(e) => updateManualExercise(idx, 'name', e.target.value)}
                          placeholder="Exercise name"
                          className="flex-1 h-9 px-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-sm text-[hsl(var(--fg))] placeholder:text-[hsl(var(--fg-3))] focus:outline-none focus:border-[hsl(var(--brand))] transition-colors min-w-0"
                        />
                        <input
                          type="number"
                          value={ex.sets}
                          onChange={(e) => updateManualExercise(idx, 'sets', e.target.value)}
                          placeholder="Sets"
                          min="1"
                          className="w-14 h-9 px-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-sm text-[hsl(var(--fg))] text-center focus:outline-none focus:border-[hsl(var(--brand))] transition-colors"
                        />
                        <input
                          type="text"
                          value={ex.reps}
                          onChange={(e) => updateManualExercise(idx, 'reps', e.target.value)}
                          placeholder="Reps"
                          className="w-14 h-9 px-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-sm text-[hsl(var(--fg))] text-center focus:outline-none focus:border-[hsl(var(--brand))] transition-colors"
                        />
                        {manualExercises.length > 1 && (
                          <button
                            onClick={() => setManualExercises((prev) => prev.filter((_, i) => i !== idx))}
                            className="w-9 h-9 flex items-center justify-center rounded-lg text-[hsl(var(--fg-3))] hover:text-[hsl(var(--err))] hover:bg-[hsl(var(--err)/0.08)] transition-colors shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setManualExercises((prev) => [...prev, EMPTY_EXERCISE()])}
                    className="mt-2 w-full py-2.5 rounded-xl border border-dashed border-[hsl(var(--border-h))] text-xs font-medium text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--fill))] transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add exercise
                  </button>
                </div>

                {/* Column labels */}
                <div className="flex gap-2 items-center px-0.5">
                  <div className="w-5 shrink-0" />
                  <p className="flex-1 text-[10px] text-[hsl(var(--fg-3))] uppercase tracking-wider">Name</p>
                  <p className="w-14 text-[10px] text-[hsl(var(--fg-3))] uppercase tracking-wider text-center">Sets</p>
                  <p className="w-14 text-[10px] text-[hsl(var(--fg-3))] uppercase tracking-wider text-center">Reps</p>
                  {manualExercises.length > 1 && <div className="w-9 shrink-0" />}
                </div>
              </motion.div>
            )}

            {/* AI: Step 1 — Muscle */}
            {mode === 'ai' && step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
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
                      className={`p-4 rounded-xl border text-left transition-all ${muscle === opt.value ? 'border-[hsl(var(--brand))] bg-[hsl(var(--brand)/0.08)]' : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--brand)/0.4)]'}`}
                    >
                      <span className="text-2xl">{opt.icon}</span>
                      <p className="text-sm font-medium text-[hsl(var(--fg))] mt-1">{opt.label}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* AI: Step 2 — Duration */}
            {mode === 'ai' && step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
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
                      className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between ${duration === opt.value ? 'border-[hsl(var(--brand))] bg-[hsl(var(--brand)/0.08)]' : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--brand)/0.4)]'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${duration === opt.value ? 'border-[hsl(var(--brand))]' : 'border-[hsl(var(--border))]'}`}>
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

            {/* AI: Step 3 — Location */}
            {mode === 'ai' && step === 3 && !generating && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
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
                        className={`w-full p-4 rounded-xl border text-left transition-all ${location === opt.value ? 'border-[hsl(var(--brand))] bg-[hsl(var(--brand)/0.08)]' : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--brand)/0.4)]'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${location === opt.value ? 'border-[hsl(var(--brand))]' : 'border-[hsl(var(--border))]'}`}>
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
                {generationError && (
                  <div className="p-3 rounded-xl bg-[hsl(var(--err)/0.1)] border border-[hsl(var(--err)/0.3)]">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-[hsl(var(--err))] mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[12px] font-medium text-[hsl(var(--err))]">Generation failed</p>
                        <p className="text-[11px] text-[hsl(var(--err))] mt-0.5">{generationError}</p>
                      </div>
                    </div>
                    <button onClick={() => { setGenerationError(null); handleGenerate(); }} className="mt-2 w-full py-2 rounded-lg bg-[hsl(var(--brand))] text-white text-[12px] font-medium hover:opacity-90 transition-opacity">
                      Retry
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* AI: Step 4 — Review */}
            {mode === 'ai' && step === 4 && generatedWorkout && (
              <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
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
                      {generatedWorkout.warmup.map((w, i) => <li key={i} className="text-sm text-[hsl(var(--fg))]">• {w}</li>)}
                    </ul>
                  </div>
                )}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-[hsl(var(--fg-2))] uppercase tracking-wider">Exercises</p>
                  {generatedWorkout.exercises?.map((ex, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-md bg-[hsl(var(--brand)/0.15)] flex items-center justify-center text-xs font-bold text-[hsl(var(--brand))]">{i + 1}</span>
                        <span className="text-sm font-medium text-[hsl(var(--fg))]">{ex.name}</span>
                      </div>
                      <span className="text-xs text-[hsl(var(--fg-2))]">{ex.sets}×{ex.reps}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Generating spinner */}
            {mode === 'ai' && generating && (
              <motion.div key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--brand)/0.1)] flex items-center justify-center">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
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
        <div
          className="flex items-center justify-between px-5 py-4 border-t border-[hsl(var(--border))] flex-shrink-0"
          style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        >
          {/* Back button */}
          {(mode !== null && !(mode === 'ai' && step === 4)) && !generating && (
            <button
              onClick={() => {
                if (mode === 'ai' && step > 1) { setStep(step - 1); }
                else { setMode(null); setStep(1); setMuscle(''); setLocation(''); }
              }}
              className="text-sm text-[hsl(var(--fg-2))] hover:text-[hsl(var(--fg))] transition-colors"
            >
              Back
            </button>
          )}
          {(mode === null || (mode === 'ai' && step === 4)) && <div />}

          {/* Right actions */}
          {mode === null && <div />}

          {mode === 'ai' && step === 1 && (
            <button onClick={() => setStep(2)} disabled={!muscle} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[hsl(var(--brand))] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40">
              Next <ArrowRight className="w-4 h-4" />
            </button>
          )}
          {mode === 'ai' && step === 2 && (
            <button onClick={() => setStep(3)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[hsl(var(--brand))] text-white text-sm font-medium hover:opacity-90 transition-opacity">
              Next <ArrowRight className="w-4 h-4" />
            </button>
          )}
          {mode === 'ai' && step === 3 && (
            <button onClick={handleGenerate} disabled={!location || generating} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[hsl(var(--brand))] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40">
              <Sparkles className="w-4 h-4" /> Generate
            </button>
          )}
          {mode === 'ai' && step === 4 && (
            <button onClick={handleStartAI} disabled={!isValidWorkout || !generatedWorkout} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[hsl(var(--brand))] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed">
              <Play className="w-4 h-4 fill-current" /> Start Workout
            </button>
          )}

          {mode === 'manual' && (
            <button
              onClick={handleStartManual}
              disabled={!manualName.trim() || !manualExercises.some((e) => e.name.trim())}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[hsl(var(--brand))] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4 fill-current" /> Start Workout
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
