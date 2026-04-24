import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import {
  X,
  RefreshCw,
  RotateCcw,
  Zap,
  Check,
  ArrowRight,
} from 'lucide-react';

const RESET_OPTIONS = [
  {
    id: 'soft',
    name: 'Start New Phase',
    description: 'Reset streaks and current phase, keep history',
    icon: RefreshCw,
    color: 'from-blue-500 to-blue-600',
    impact: 'low',
    whatResets: ['Current streaks', 'Phase progress', 'Weekly goals'],
    whatKeeps: ['All historical data', 'Body measurements', 'Progress photos', 'Personal records'],
  },
  {
    id: 'program',
    name: 'Reset Current Protocol',
    description: 'Clear meal/training plan, re-run onboarding',
    icon: RotateCcw,
    color: 'from-orange-500 to-orange-600',
    impact: 'medium',
    whatResets: ['Current meal plan', 'Current workout plan', 'Targets', 'Onboarding data'],
    whatKeeps: ['Body history', 'Progress photos', 'Achievements', 'Historical workouts'],
  },
  {
    id: 'full',
    name: 'Begin Fresh From Today',
    description: 'Complete fresh start, archive old account',
    icon: Zap,
    color: 'from-red-500 to-red-600',
    impact: 'high',
    whatResets: ['All app data', 'History', 'Measurements', 'Photos', 'Plans'],
    whatKeeps: ['Account login', 'Subscription status'],
  },
];

const GOAL_OPTIONS = [
  { id: 'cut', name: 'Cut', description: 'Lose fat while preserving muscle' },
  { id: 'maintain', name: 'Maintain', description: 'Keep current composition' },
  { id: 'bulk', name: 'Bulk', description: 'Gain muscle with minimal fat' },
];

const NUTRITION_MODES = [
  { id: 'structured', name: 'Tell me exactly what to eat', description: 'Precise meal plans' },
  { id: 'flexible', name: 'Give me targets, I\'ll choose foods', description: 'Macro tracking' },
];

export default function StartFreshModal({ open, onClose }) {
  const { user } = useAuth();
  const [selectedReset, setSelectedReset] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState('cut');
  const [selectedMode, setSelectedMode] = useState('structured');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState(1);

  if (!open) return null;

  const handleReset = async () => {
    if (!selectedReset) return;
    
    setIsProcessing(true);
    try {
      switch (selectedReset) {
        case 'soft':
          await performSoftReset();
          break;
        case 'program':
          await performProgramReset();
          break;
        case 'full':
          await performFullReset();
          break;
      }
      
      toast.success(`Successfully started fresh! Your new ${selectedGoal} phase begins now.`);
      onClose();
    } catch (error) {
      console.error('Reset failed:', error);
      toast.error('Reset failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const performSoftReset = async () => {
    // Reset streaks and phase data
    const updates = {
      workout_streak: 0,
      nutrition_streak: 0,
      checkin_streak: 0,
      current_phase: 'starting',
      phase_start_date: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', user.id);

    // Reset weekly goals
    await supabase
      .from('weekly_goals')
      .update({
        workouts_completed: 0,
        meals_logged: 0,
        checkins_completed: 0,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);
  };

  const performProgramReset = async () => {
    // Clear current plans
    await supabase
      .from('user_profiles')
      .update({
        current_workout_plan_id: null,
        current_nutrition_plan_id: null,
        onboarding_completed: false,
        updated_at: new Date().toISOString(),
      })
      .eq('user.id', user.id);

    // Reset onboarding to trigger re-run
    await supabase
      .from('onboarding_data')
      .update({
        completed: false,
        goal: selectedGoal,
        nutrition_mode: selectedMode,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);
  };

  const performFullReset = async () => {
    // Archive old data before deletion
    const oldData = {
      user_id: user.id,
      archived_at: new Date().toISOString(),
      reset_type: 'full',
    };

    await supabase.from('archived_accounts').insert(oldData);

    // Delete user data from all tables
    const tables = [
      'daily_checkins',
      'food_logs',
      'workouts',
      'measurements',
      'progress_photos',
      'weekly_goals',
      'user_profiles',
      'onboarding_data',
    ];

    for (const table of tables) {
      await supabase.from(table).delete().eq('user_id', user.id);
    }
  };

  const selectedOption = RESET_OPTIONS.find(opt => opt.id === selectedReset);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[hsl(var(--border)/0.2)] bg-[hsl(var(--card))] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-[hsl(var(--border)/0.1)] bg-[hsl(var(--card))/0.95] backdrop-blur-md p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(var(--brand))] to-[hsl(var(--brand)/0.6)] text-white">
                <RefreshCw className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[hsl(var(--fg))]">Start Fresh</h2>
                <p className="text-sm text-[hsl(var(--fg-2))]">Begin a new phase with clear goals</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl p-2 text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--shell))] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-[hsl(var(--fg))] mb-2">Choose Your Reset Level</h3>
                <p className="text-sm text-[hsl(var(--fg-2))] mb-4">Select how much you want to reset</p>
              </div>

              <div className="space-y-3">
                {RESET_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.id}
                      onClick={() => setSelectedReset(option.id)}
                      className={`w-full text-left rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
                        selectedReset === option.id
                          ? 'border-[hsl(var(--brand)/0.5)] bg-[hsl(var(--brand)/0.05)]'
                          : 'border-[hsl(var(--border)/0.3)] bg-[hsl(var(--card)/0.5)] hover:border-[hsl(var(--brand)/0.3)]'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${option.color} text-white`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-[hsl(var(--fg))]">{option.name}</h4>
                          <p className="text-sm text-[hsl(var(--fg-2))]">{option.description}</p>
                          
                          <div className="mt-3 flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              option.impact === 'low' ? 'bg-green-100 text-green-700' :
                              option.impact === 'medium' ? 'bg-orange-100 text-orange-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {option.impact} impact
                            </span>
                          </div>
                        </div>
                        {selectedReset === option.id && (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[hsl(var(--brand))] text-white">
                            <Check className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedOption && (
                <div className="rounded-2xl border border-[hsl(var(--border)/0.2)] bg-[hsl(var(--shell))] p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-semibold text-[hsl(var(--fg))] mb-2 flex items-center gap-2">
                        <RotateCcw className="h-4 w-4 text-[hsl(var(--err))]" />
                        What Resets
                      </h5>
                      <ul className="space-y-1">
                        {selectedOption.whatResets.map((item, i) => (
                          <li key={i} className="text-sm text-[hsl(var(--fg-2))] flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--err))]" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold text-[hsl(var(--fg))] mb-2 flex items-center gap-2">
                        <Check className="h-4 w-4 text-[hsl(var(--success))]" />
                        What Keeps
                      </h5>
                      <ul className="space-y-1">
                        {selectedOption.whatKeeps.map((item, i) => (
                          <li key={i} className="text-sm text-[hsl(var(--fg-2))] flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--success))]" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  disabled={!selectedReset}
                  className="flex items-center gap-2 rounded-xl bg-[hsl(var(--brand))] px-6 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-[hsl(var(--fg))] mb-2">Set Your New Goal</h3>
                <p className="text-sm text-[hsl(var(--fg-2))] mb-4">What's your primary objective?</p>
              </div>

              <div className="grid gap-3">
                {GOAL_OPTIONS.map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => setSelectedGoal(goal.id)}
                    className={`rounded-xl border p-4 text-left transition-all duration-200 ${
                      selectedGoal === goal.id
                        ? 'border-[hsl(var(--brand)/0.5)] bg-[hsl(var(--brand)/0.05)]'
                        : 'border-[hsl(var(--border)/0.3)] bg-[hsl(var(--card)/0.5)] hover:border-[hsl(var(--brand)/0.3)]'
                    }`}
                  >
                    <h4 className="font-semibold text-[hsl(var(--fg))]">{goal.name}</h4>
                    <p className="text-sm text-[hsl(var(--fg-2))]">{goal.description}</p>
                  </button>
                ))}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[hsl(var(--fg))] mb-2">Choose Nutrition Style</h3>
                <p className="text-sm text-[hsl(var(--fg-2))] mb-4">How do you want to approach nutrition?</p>
              </div>

              <div className="grid gap-3">
                {NUTRITION_MODES.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setSelectedMode(mode.id)}
                    className={`rounded-xl border p-4 text-left transition-all duration-200 ${
                      selectedMode === mode.id
                        ? 'border-[hsl(var(--brand)/0.5)] bg-[hsl(var(--brand)/0.05)]'
                        : 'border-[hsl(var(--border)/0.3)] bg-[hsl(var(--card)/0.5)] hover:border-[hsl(var(--brand)/0.3)]'
                    }`}
                  >
                    <h4 className="font-semibold text-[hsl(var(--fg))]">{mode.name}</h4>
                    <p className="text-sm text-[hsl(var(--fg-2))]">{mode.description}</p>
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="rounded-xl border border-[hsl(var(--border)/0.3)] bg-[hsl(var(--card)/0.5)] px-6 py-3 text-sm font-semibold text-[hsl(var(--fg))] transition-all hover:bg-[hsl(var(--shell))]"
                >
                  Back
                </button>
                <button
                  onClick={handleReset}
                  disabled={isProcessing}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[hsl(var(--brand))] to-[hsl(var(--brand)/0.8)] px-6 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      Start Fresh Now
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
