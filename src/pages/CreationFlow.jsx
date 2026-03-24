import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Dumbbell, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const STEPS = ['Basic Info', 'Exercises', 'Review'];

export default function CreationFlow() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    title: '',
    description: '',
    exercises: [{ name: 'Bench Press', sets: 4, reps: 8 }],
  });

  const addExercise = () => {
    setForm(prev => ({
      ...prev,
      exercises: [...prev.exercises, { name: '', sets: 3, reps: 10 }]
    }));
  };

  const removeExercise = (idx) => {
    setForm(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== idx)
    }));
  };

  const updateExercise = (idx, field, value) => {
    setForm(prev => ({
      ...prev,
      exercises: prev.exercises.map((ex, i) => i === idx ? { ...ex, [field]: value } : ex)
    }));
  };

  const canContinue = () => {
    if (step === 0) return form.title.length > 0;
    if (step === 1) return form.exercises.every(e => e.name.length > 0);
    return true;
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))]">
      <div className="flex items-center gap-4 p-4 border-b border-[hsl(var(--border))]">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-[hsl(var(--fill))] rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">Create Workout</h1>
        <div className="ml-auto flex items-center gap-1">
          {STEPS.map((s, i) => (
            <div key={i} className={`w-2 h-2 rounded-full ${i <= step ? 'bg-[hsl(var(--accent-primary))]' : 'bg-[hsl(var(--border))]'}`} />
          ))}
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Workout Title</label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g., Push Day A"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Description (optional)</label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief description..."
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-medium">Exercises</h2>
                <button onClick={addExercise} className="flex items-center gap-1 text-sm text-[hsl(var(--accent-primary))]">
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
              {form.exercises.map((ex, i) => (
                <div key={i} className="p-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[hsl(var(--fg-3))]">Exercise #{i + 1}</span>
                    {form.exercises.length > 1 && (
                      <button onClick={() => removeExercise(i)} className="p-1 hover:bg-red-500/10 rounded text-red-500">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <Input
                    value={ex.name}
                    onChange={(e) => updateExercise(i, 'name', e.target.value)}
                    placeholder="Exercise name"
                  />
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={ex.sets}
                      onChange={(e) => updateExercise(i, 'sets', parseInt(e.target.value))}
                      placeholder="Sets"
                      className="w-20"
                    />
                    <span className="py-2">x</span>
                    <Input
                      type="number"
                      value={ex.reps}
                      onChange={(e) => updateExercise(i, 'reps', parseInt(e.target.value))}
                      placeholder="Reps"
                      className="w-20"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-medium">Review</h2>
              <div className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
                <h3 className="font-semibold mb-1">{form.title}</h3>
                {form.description && <p className="text-sm text-[hsl(var(--fg-2))] mb-3">{form.description}</p>}
                <div className="space-y-1">
                  {form.exercises.map((ex, i) => (
                    <p key={i} className="text-sm">
                      {i + 1}. {ex.name} - {ex.sets}x{ex.reps}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>

        <div className="flex items-center gap-3 mt-8">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep(s => s - 1)} className="flex-1">
              Back
            </Button>
          )}
          <Button
            onClick={() => step < STEPS.length - 1 ? setStep(s => s + 1) : navigate('/today')}
            disabled={!canContinue()}
            className="flex-1"
          >
            {step === STEPS.length - 1 ? (
              <><Check className="w-4 h-4 mr-2" /> Create</>
            ) : (
              <><ArrowRight className="w-4 h-4 mr-2" /> Continue</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
