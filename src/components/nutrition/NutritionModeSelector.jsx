import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import {
  UtensilsCrossed,
  Calculator,
  CheckCircle,
  Clock,
  Target,
  Zap,
  ArrowRight,
} from 'lucide-react';

const NUTRITION_MODES = [
  {
    id: 'structured',
    name: 'Structured Plan',
    description: 'Get exact meal plans with specific foods and timing',
    icon: UtensilsCrossed,
    color: 'from-green-500 to-green-600',
    benefits: [
      'Maximum compliance support',
      'No daily decision fatigue',
      'Optimized nutrient timing',
      'Perfect for beginners',
    ],
    bestFor: 'Beginners, aggressive cuts, competition prep',
  },
  {
    id: 'flexible',
    name: 'Flexible Macros',
    description: 'Track macros and calories with food freedom',
    icon: Calculator,
    color: 'from-blue-500 to-blue-600',
    benefits: [
      'Complete food freedom',
      'Social eating flexibility',
      'Sustainable long-term',
      'Advanced tracking skills',
    ],
    bestFor: 'Experienced users, maintenance, lifestyle balance',
  },
];

export default function NutritionModeSelector({ open, onClose, onModeSelected }) {
  const { user } = useAuth();
  const [selectedMode, setSelectedMode] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!open) return null;

  const handleModeSelect = async () => {
    if (!selectedMode) return;
    
    setIsProcessing(true);
    try {
      // Update user profile with nutrition mode
      await supabase
        .from('user_profiles')
        .update({
          nutrition_mode: selectedMode,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      // Update onboarding data
      await supabase
        .from('onboarding_data')
        .update({
          nutrition_mode: selectedMode,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      toast.success(`Nutrition mode set to ${selectedMode === 'structured' ? 'Structured Plan' : 'Flexible Macros'}`);
      
      if (onModeSelected) {
        onModeSelected(selectedMode);
      }
      
      onClose();
    } catch (error) {
      console.error('Failed to set nutrition mode:', error);
      toast.error('Failed to update nutrition mode');
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedModeData = NUTRITION_MODES.find(mode => mode.id === selectedMode);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[hsl(var(--border)/0.2)] bg-[hsl(var(--card))] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-[hsl(var(--border)/0.1)] bg-[hsl(var(--card))/0.95] backdrop-blur-md p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(var(--brand))] to-[hsl(var(--brand)/0.6)] text-white">
                <UtensilsCrossed className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[hsl(var(--fg))]">Choose Your Nutrition Style</h2>
                <p className="text-sm text-[hsl(var(--fg-2))]">Select the approach that fits your lifestyle</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl p-2 text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--shell))] transition-colors"
            >
              <ArrowRight className="h-5 w-5 rotate-180" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left: Mode Selection */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-[hsl(var(--fg))] mb-2">Select Mode</h3>
                <p className="text-sm text-[hsl(var(--fg-2))] mb-4">Choose how you want to approach nutrition</p>
              </div>

              <div className="space-y-3">
                {NUTRITION_MODES.map((mode) => {
                  const Icon = mode.icon;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => setSelectedMode(mode.id)}
                      className={`w-full text-left rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
                        selectedMode === mode.id
                          ? 'border-[hsl(var(--brand)/0.5)] bg-[hsl(var(--brand)/0.05)]'
                          : 'border-[hsl(var(--border)/0.3)] bg-[hsl(var(--card)/0.5)] hover:border-[hsl(var(--brand)/0.3)]'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${mode.color} text-white`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-[hsl(var(--fg))]">{mode.name}</h4>
                          <p className="text-sm text-[hsl(var(--fg-2))] mt-1">{mode.description}</p>
                          
                          <div className="mt-3">
                            <span className="text-xs font-medium text-[hsl(var(--fg-3))]">
                              Best for: {mode.bestFor}
                            </span>
                          </div>
                        </div>
                        {selectedMode === mode.id && (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[hsl(var(--brand))] text-white">
                            <CheckCircle className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Details & Comparison */}
            <div className="space-y-4">
              {selectedModeData ? (
                <>
                  <div>
                    <h3 className="text-lg font-semibold text-[hsl(var(--fg))] mb-2">
                      {selectedModeData.name} Details
                    </h3>
                    <p className="text-sm text-[hsl(var(--fg-2))] mb-4">
                      {selectedModeData.description}
                    </p>
                  </div>

                  {/* Benefits */}
                  <div className="rounded-2xl border border-[hsl(var(--border)/0.2)] bg-[hsl(var(--shell))] p-4">
                    <h4 className="font-semibold text-[hsl(var(--fg))] mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4 text-[hsl(var(--brand))]" />
                      Key Benefits
                    </h4>
                    <ul className="space-y-2">
                      {selectedModeData.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-[hsl(var(--success))] mt-0.5 shrink-0" />
                          <span className="text-sm text-[hsl(var(--fg-2))]">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* How it works */}
                  <div className="rounded-2xl border border-[hsl(var(--border)/0.2)] bg-[hsl(var(--shell))] p-4">
                    <h4 className="font-semibold text-[hsl(var(--fg))] mb-3 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-[hsl(var(--brand))]" />
                      How It Works
                    </h4>
                    <div className="space-y-3">
                      {selectedModeData.id === 'structured' ? (
                        <>
                          <div className="flex items-start gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[hsl(var(--brand))] text-white text-xs font-semibold">
                              1
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[hsl(var(--fg))]">Get Your Plan</p>
                              <p className="text-xs text-[hsl(var(--fg-2))]">Receive detailed meal plans with exact foods and portions</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[hsl(var(--brand))] text-white text-xs font-semibold">
                              2
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[hsl(var(--fg))]">Follow Exactly</p>
                              <p className="text-xs text-[hsl(var(--fg-2))]">Eat the prescribed meals at the specified times</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[hsl(var(--brand))] text-white text-xs font-semibold">
                              3
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[hsl(var(--fg))]">Track Compliance</p>
                              <p className="text-xs text-[hsl(var(--fg-2))]">Mark meals as complete and monitor adherence</p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-start gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[hsl(var(--brand))] text-white text-xs font-semibold">
                              1
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[hsl(var(--fg))]">Get Your Targets</p>
                              <p className="text-xs text-[hsl(var(--fg-2))]">Receive daily calorie and macro targets</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[hsl(var(--brand))] text-white text-xs font-semibold">
                              2
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[hsl(var(--fg))]">Choose Your Foods</p>
                              <p className="text-xs text-[hsl(var(--fg-2))]">Eat what you want while hitting your targets</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[hsl(var(--brand))] text-white text-xs font-semibold">
                              3
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[hsl(var(--fg))]">Track Progress</p>
                              <p className="text-xs text-[hsl(var(--fg-2))]">Monitor macros and adjust as needed</p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Daily Experience */}
                  <div className="rounded-2xl border border-[hsl(var(--border)/0.2)] bg-gradient-to-br from-[hsl(var(--brand)/0.05)] to-[hsl(var(--brand)/0.02)] p-4">
                    <h4 className="font-semibold text-[hsl(var(--fg))] mb-3 flex items-center gap-2">
                      <Zap className="h-4 w-4 text-[hsl(var(--brand))]" />
                      Daily Experience
                    </h4>
                    <div className="text-sm text-[hsl(var(--fg-2))]">
                      {selectedModeData.id === 'structured' ? (
                        <p>
                          Each morning you'll see exactly what to eat for the day. 
                          No calculations, no decisions - just follow the plan and mark meals complete.
                        </p>
                      ) : (
                        <p>
                          Each morning you'll see your macro targets. Log your foods throughout the day 
                          and watch as you hit your numbers with complete food freedom.
                        </p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[hsl(var(--border)/0.5)] bg-[hsl(var(--shell))] p-12 text-center">
                  <UtensilsCrossed className="h-12 w-12 text-[hsl(var(--fg-3))]" />
                  <p className="mt-4 text-lg font-semibold text-[hsl(var(--fg))]">Select a Mode</p>
                  <p className="mt-2 text-sm text-[hsl(var(--fg-2))]">
                    Choose a nutrition approach to see details and benefits
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleModeSelect}
              disabled={!selectedMode || isProcessing}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[hsl(var(--brand))] to-[hsl(var(--brand)/0.8)] px-6 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Setting Mode...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Set Nutrition Mode
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
