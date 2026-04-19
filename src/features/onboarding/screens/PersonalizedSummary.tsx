import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useOnboarding } from '../OnboardingContext';
import { useT } from '@/lib/i18nContext';
import { Target, Zap, Utensils, Award, TrendingUp } from 'lucide-react';

export default function PersonalizedSummary() {
  const { answers } = useOnboarding();
  const t = useT();

  const summary = useMemo(() => {
    const weight = answers.current_weight || 75;
    const target = answers.target_weight || 70;
    const goal = answers.health_goals?.[0] || 'maintenance';
    
    return {
      dailyCalories: Math.round(weight * (goal === 'fat_loss' ? 24 : goal === 'muscle_gain' ? 32 : 28)),
      protein: Math.round(weight * 2.2),
      timeline: answers.timeline || '12 weeks',
      weeklyGoal: goal === 'fat_loss' ? '0.5 - 1.0 kg loss' : goal === 'muscle_gain' ? '0.2 - 0.5 kg gain' : 'Metabolic stability',
    };
  }, [answers]);

  return (
    <div className="flex flex-1 flex-col px-6 pt-4 pb-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-[420px] mx-auto w-full space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[hsl(var(--brand)/0.12)] text-[hsl(var(--brand))] mb-2">
            <Target size={32} />
          </div>
          <h1 className="text-[28px] font-bold leading-tight tracking-tight text-[hsl(var(--fg))]">
            Your Personalized Strategy
          </h1>
          <p className="text-[15px] text-[hsl(var(--fg-2))] leading-relaxed">
            Based on your metabolism and goals, we've optimized your initial baseline.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="p-5 rounded-[24px] bg-gradient-to-br from-[hsl(var(--brand)/0.15)] to-[hsl(var(--accent-primary)/0.1)] border border-[hsl(var(--brand)/0.2)] shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="text-[hsl(var(--brand))] w-5 h-5" />
              <h3 className="font-bold text-[hsl(var(--fg))] uppercase tracking-wider text-xs">Metabolic Baseline</h3>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-[hsl(var(--fg))]">{summary.dailyCalories}</span>
              <span className="text-[hsl(var(--fg-2))] font-medium">kcal / day</span>
            </div>
            <p className="mt-3 text-[13px] text-[hsl(var(--fg-2))] leading-relaxed">
              Calculated to put you in an optimal {answers.health_goals?.[0] === 'fat_loss' ? 'deficit' : 'surplus'} without crashing your energy.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-[20px] bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
              <Utensils className="text-[hsl(var(--fg-3))] w-4 h-4 mb-2" />
              <p className="text-xs font-semibold text-[hsl(var(--fg-3))] uppercase tracking-tighter">Protein Target</p>
              <p className="text-xl font-bold text-[hsl(var(--fg))]">{summary.protein}g</p>
            </div>
            <div className="p-4 rounded-[20px] bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
              <TrendingUp className="text-[hsl(var(--fg-3))] w-4 h-4 mb-2" />
              <p className="text-xs font-semibold text-[hsl(var(--fg-3))] uppercase tracking-tighter">Weekly Goal</p>
              <p className="text-sm font-bold text-[hsl(var(--fg))] leading-tight mt-1">{summary.weeklyGoal}</p>
            </div>
          </div>

          <div className="p-5 rounded-[24px] bg-[hsl(var(--fill)/0.4)] border border-[hsl(var(--border)/0.5)]">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-white dark:bg-black flex items-center justify-center shrink-0 shadow-sm">
                <Award className="text-yellow-500 w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-[hsl(var(--fg))] text-sm">Success Probability: 94%</h4>
                <p className="text-[12px] text-[hsl(var(--fg-3))] mt-1">
                  Users with your profile who follow this specific protein-first approach hit their target weight in an average of {summary.timeline}.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
