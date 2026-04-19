import React from 'react';
import { motion } from 'framer-motion';
import { useOnboarding } from '../OnboardingContext';
import { useT } from '@/lib/i18nContext';
import { Check } from 'lucide-react';

const DIETARY_OPTIONS = [
  { id: 'none', label: 'No specific diet', emoji: '🍽️' },
  { id: 'vegetarian', label: 'Vegetarian', emoji: '🥗' },
  { id: 'vegan', label: 'Vegan', emoji: '🌱' },
  { id: 'keto', label: 'Keto', emoji: '🥩' },
  { id: 'paleo', label: 'Paleo', emoji: '🍖' },
  { id: 'pescatarian', label: 'Pescatarian', emoji: '🐟' },
  { id: 'low_carb', label: 'Low Carb', emoji: '🍳' },
];

const INTOLERANCE_OPTIONS = [
  { id: 'dairy', label: 'Dairy-free', emoji: '🥛' },
  { id: 'gluten', label: 'Gluten-free', emoji: '🌾' },
  { id: 'nuts', label: 'Nut-free', emoji: '🥜' },
  { id: 'soy', label: 'Soy-free', emoji: '🫘' },
];

export default function DietaryPreferences() {
  const { answers, setAnswer, toggleAnswer } = useOnboarding();
  const t = useT();

  const selectedDiet = answers.dietary_preference || 'none';
  const selectedIntolerances = answers.intolerances || [];

  return (
    <div className="flex flex-1 flex-col px-6 pt-4 pb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[420px] mx-auto w-full space-y-8"
      >
        <div className="space-y-2">
          <h1 className="text-[28px] font-bold leading-tight tracking-tight text-[hsl(var(--fg))]">
            Any dietary preferences?
          </h1>
          <p className="text-[15px] text-[hsl(var(--fg-2))] leading-relaxed">
            We'll tailor your meal recommendations and macro targets accordingly.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-[hsl(var(--fg-3))]">
            Preferred Eating Pattern
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {DIETARY_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setAnswer('dietary_preference', opt.id)}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                  selectedDiet === opt.id
                    ? 'border-[hsl(var(--brand))] bg-[hsl(var(--brand)/0.08)] ring-1 ring-[hsl(var(--brand))]'
                    : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--fill)/0.4)]'
                }`}
              >
                <span className="text-2xl">{opt.emoji}</span>
                <span className={`flex-1 text-left font-medium ${selectedDiet === opt.id ? 'text-[hsl(var(--fg))]' : 'text-[hsl(var(--fg-2))]'}`}>
                  {opt.label}
                </span>
                {selectedDiet === opt.id && (
                  <div className="w-5 h-5 rounded-full bg-[hsl(var(--brand))] flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-[hsl(var(--fg-3))]">
            Exclusions & Intolerances
          </h2>
          <div className="flex flex-wrap gap-2">
            {INTOLERANCE_OPTIONS.map((opt) => {
              const isSelected = selectedIntolerances.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  onClick={() => toggleAnswer('intolerances', opt.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all text-sm font-medium ${
                    isSelected
                      ? 'border-[hsl(var(--brand))] bg-[hsl(var(--brand)/0.08)] text-[hsl(var(--fg))] ring-1 ring-[hsl(var(--brand))]'
                      : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--fill)/0.4)]'
                  }`}
                >
                  <span>{opt.emoji}</span>
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
