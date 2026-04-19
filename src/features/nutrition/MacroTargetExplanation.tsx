import React from 'react';
import { Target, Zap, Apple, Flame, Info } from 'lucide-react';
import { NutritionProfile } from './types';

interface MacroTargetExplanationProps {
  profile: NutritionProfile;
}

export function MacroTargetExplanation({ profile }: MacroTargetExplanationProps) {
  const macros = [
    {
      label: 'Calories',
      value: profile.calories_target,
      unit: 'kcal',
      icon: Flame,
      color: 'text-[hsl(var(--fg))]',
      bgColor: 'bg-[hsl(var(--fill))]',
      desc: 'Your total energy budget for the day to reach your weight goals.',
    },
    {
      label: 'Protein',
      value: profile.protein_target,
      unit: 'g',
      icon: Zap,
      color: 'text-[hsl(var(--brand))]',
      bgColor: 'bg-[hsl(var(--brand)/0.1)]',
      desc: 'Essential for muscle repair and satiety. Aim for 1.6g-2.2g per kg of body weight.',
    },
    {
      label: 'Carbs',
      value: profile.carbs_target,
      unit: 'g',
      icon: Apple,
      color: 'text-[hsl(var(--brand-ai))]',
      bgColor: 'bg-[hsl(var(--brand-ai)/0.1)]',
      desc: 'Your primary fuel source for workouts and daily cognitive function.',
    },
    {
      label: 'Fat',
      value: profile.fat_target,
      unit: 'g',
      icon: Target,
      color: 'text-[hsl(var(--warn))]',
      bgColor: 'bg-[hsl(var(--warn)/0.1)]',
      desc: 'Important for hormone production and nutrient absorption.',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-2xl bg-[hsl(var(--brand)/0.05)] border border-[hsl(var(--brand)/0.15)] p-4">
        <Info className="w-5 h-5 text-[hsl(var(--brand))] shrink-0 mt-0.5" />
        <div>
          <p className="text-[14px] font-semibold text-[hsl(var(--fg))]">How are these calculated?</p>
          <p className="text-[13px] text-[hsl(var(--fg-2))] mt-1 leading-relaxed">
            Your targets are generated based on your Basal Metabolic Rate (BMR) and activity level. 
            Staying within 5-10% of these numbers is considered a "perfect" day.
          </p>
        </div>
      </div>

      <div className="grid gap-3">
        {macros.map((macro) => (
          <div key={macro.label} className="flex items-start gap-4 p-4 rounded-2xl border border-[hsl(var(--border)/0.5)] bg-[hsl(var(--card))]">
            <div className={`w-10 h-10 rounded-xl ${macro.bgColor} flex items-center justify-center shrink-0`}>
              <macro.icon className={`w-5 h-5 ${macro.color}`} />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <p className="text-[14px] font-bold text-[hsl(var(--fg))]">{macro.label}</p>
                <p className={`text-[13px] font-semibold ${macro.color}`}>
                  {macro.value}{macro.unit}
                </p>
              </div>
              <p className="text-[12px] text-[hsl(var(--fg-3))] mt-1 leading-normal">
                {macro.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
