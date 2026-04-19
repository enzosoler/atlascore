import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Target, Zap, Heart, Trophy } from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const goals: Goal[] = [
  {
    id: 'weight-loss',
    title: 'Lose Weight',
    description: 'Shed body fat while maintaining muscle mass.',
    icon: <Target className="w-6 h-6" />,
    color: 'bg-blue-500/20 text-blue-400',
  },
  {
    id: 'muscle-gain',
    title: 'Build Muscle',
    description: 'Increase strength and hypertrophy with optimal fueling.',
    icon: <Zap className="w-6 h-6" />,
    color: 'bg-brand-gold/20 text-brand-gold',
  },
  {
    id: 'performance',
    title: 'Peak Performance',
    description: 'Enhance endurance, speed, and recovery for competition.',
    icon: <Trophy className="w-6 h-6" />,
    color: 'bg-brand-emerald/20 text-brand-emerald',
  },
  {
    id: 'longevity',
    title: 'Health & Longevity',
    description: 'Improve biomarkers and sustainable lifestyle habits.',
    icon: <Heart className="w-6 h-6" />,
    color: 'bg-red-500/20 text-red-400',
  },
];

interface GoalSelectionProps {
  onSelect: (goal: string) => void;
  selectedGoal?: string;
}

export const GoalSelection: React.FC<GoalSelectionProps> = ({ onSelect, selectedGoal }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-base-white">What's your primary goal?</h2>
        <p className="text-base-gray-400">This helps us customize your training and nutrition plan.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
        {goals.map((goal, index) => (
          <motion.div
            key={goal.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="cursor-pointer"
            onClick={() => onSelect(goal.id)}
          >
            <Card className={`relative h-full transition-all duration-300 border-2 ${
              selectedGoal === goal.id 
                ? 'border-brand-gold bg-brand-gold/5 shadow-[0_0_20px_rgba(212,175,55,0.1)]' 
                : 'border-base-gray-800 bg-base-black hover:border-base-gray-700'
            }`}>
              <CardHeader className="flex flex-row items-center space-x-4 p-5">
                <div className={`p-3 rounded-xl ${goal.color}`}>
                  {goal.icon}
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-lg">{goal.title}</CardTitle>
                  <CardDescription className="text-sm text-base-gray-400 line-clamp-2 leading-tight">
                    {goal.description}
                  </CardDescription>
                </div>
              </CardHeader>
              {selectedGoal === goal.id && (
                <div className="absolute top-3 right-3">
                  <div className="w-2 h-2 bg-brand-gold rounded-full animate-pulse" />
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
