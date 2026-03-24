import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, X, Dumbbell, Apple, Camera, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STEPS = [
  {
    icon: Dumbbell,
    title: 'Track Your Workouts',
    desc: 'Log exercises, sets, reps, and weights to monitor your progress over time.',
    image: '💪',
  },
  {
    icon: Apple,
    title: 'Monitor Nutrition',
    desc: 'Log meals, track macros, and ensure you\'re hitting your daily targets.',
    image: '🥗',
  },
  {
    icon: Camera,
    title: 'Progress Photos',
    desc: 'Capture your transformation with side-by-side photo comparisons.',
    image: '📸',
  },
  {
    icon: TrendingUp,
    title: 'See Results',
    desc: 'View detailed analytics and insights about your fitness journey.',
    image: '📊',
  },
];

export default function Tutorial() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const nextStep = () => {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      navigate('/today');
    }
  };

  const skipTutorial = () => {
    navigate('/today');
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))] flex flex-col">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-1">
          {STEPS.map((_, i) => (
            <div 
              key={i} 
              className={`h-1 rounded-full transition-all ${i <= step ? 'w-8 bg-[hsl(var(--accent-primary))]' : 'w-4 bg-[hsl(var(--border))]'}`}
            />
          ))}
        </div>
        <button onClick={skipTutorial} className="p-2 text-[hsl(var(--fg-2))] hover:text-[hsl(var(--fg))]">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="text-center max-w-sm"
          >
            <div className="text-8xl mb-6">{STEPS[step].image}</div>
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-[hsl(var(--fill))] mb-4">
              {React.createElement(STEPS[step].icon, { className: 'w-6 h-6 text-[hsl(var(--accent-primary))]' })}
            </div>
            <h2 className="text-2xl font-bold mb-3">{STEPS[step].title}</h2>
            <p className="text-[hsl(var(--fg-2))]">{STEPS[step].desc}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="p-6">
        <Button onClick={nextStep} className="w-full">
          {step === STEPS.length - 1 ? 'Get Started' : 'Next'}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
