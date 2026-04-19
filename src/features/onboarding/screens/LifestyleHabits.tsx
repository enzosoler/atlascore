import React from 'react';
import { motion } from 'framer-motion';
import { useOnboarding } from '../OnboardingContext';
import { useT } from '@/lib/i18nContext';
import { Moon, Zap, Wine, Cigarette, Check } from 'lucide-react';

const HABITS = [
  { id: 'sleep_quality', label: 'Sleep Quality', icon: Moon, options: ['Poor', 'Fair', 'Good', 'Elite'] },
  { id: 'stress_level', label: 'Daily Stress', icon: Zap, options: ['Low', 'Moderate', 'High', 'Extreme'] },
  { id: 'alcohol_freq', label: 'Alcohol', icon: Wine, options: ['Never', 'Occasional', 'Regular', 'Frequent'] },
  { id: 'smoking_status', label: 'Tobacco/Vape', icon: Cigarette, options: ['Non-smoker', 'Occasional', 'Regular'] },
];

export default function LifestyleHabits() {
  const { answers, setAnswer } = useOnboarding();
  const t = useT();

  return (
    <div className="flex flex-1 flex-col px-6 pt-4 pb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[420px] mx-auto w-full space-y-8"
      >
        <div className="space-y-2">
          <h1 className="text-[28px] font-bold leading-tight tracking-tight text-[hsl(var(--fg))]">
            Lifestyle & Habits
          </h1>
          <p className="text-[15px] text-[hsl(var(--fg-2))] leading-relaxed">
            These factors significantly impact your recovery and metabolic rate.
          </p>
        </div>

        <div className="space-y-8">
          {HABITS.map((habit) => {
            const Icon = habit.icon;
            const currentValue = answers[habit.id];

            return (
              <div key={habit.id} className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[hsl(var(--brand)/0.1)] flex items-center justify-center text-[hsl(var(--brand))]">
                    <Icon size={18} />
                  </div>
                  <h2 className="text-[15px] font-semibold text-[hsl(var(--fg))]">
                    {habit.label}
                  </h2>
                </div>
                
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {habit.options.map((opt) => {
                    const isSelected = currentValue === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() => setAnswer(habit.id, opt)}
                        className={`px-2 py-3 rounded-xl border text-[13px] font-medium transition-all ${
                          isSelected
                            ? 'border-[hsl(var(--brand))] bg-[hsl(var(--brand)/0.08)] text-[hsl(var(--fg))] ring-1 ring-[hsl(var(--brand))]'
                            : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--fill)/0.4)]'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
