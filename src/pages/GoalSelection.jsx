import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Target, Flame, Zap, Trophy, Heart, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AtlasCoreLogoSVG from '@/components/AtlasCoreLogoSVG';

const GOALS = [
  { id: 'fat_loss', icon: Flame, title: 'Fat Loss', desc: 'Burn fat and get lean', color: 'orange' },
  { id: 'muscle_gain', icon: Target, title: 'Muscle Gain', desc: 'Build strength and size', color: 'blue' },
  { id: 'performance', icon: Trophy, title: 'Performance', desc: 'Improve athletic ability', color: 'purple' },
  { id: 'recomposition', icon: Zap, title: 'Recomposition', desc: 'Lose fat, gain muscle', color: 'yellow' },
  { id: 'health', icon: Heart, title: 'General Health', desc: 'Feel better every day', color: 'red' },
  { id: 'longevity', icon: Leaf, title: 'Longevity', desc: 'Live longer and stronger', color: 'green' },
];

export default function GoalSelection() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState([]);

  const toggleGoal = (id) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    if (selected.length > 0) {
      navigate('/onboarding/preferences');
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))] flex flex-col">
      <div className="flex items-center justify-between p-4">
        <AtlasCoreLogoSVG width={32} height={16} />
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-[hsl(var(--fill))] rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 px-6 py-4 max-w-md mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-2 text-sm text-[hsl(var(--accent-primary))] font-medium">Step 1 of 4</div>
          <h1 className="text-2xl font-bold mb-2">What are your goals?</h1>
          <p className="text-[hsl(var(--fg-2))] mb-6">Select all that apply to you</p>

          <div className="grid grid-cols-2 gap-3">
            {GOALS.map((goal) => {
              const isSelected = selected.includes(goal.id);
              return (
                <button
                  key={goal.id}
                  onClick={() => toggleGoal(goal.id)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-[hsl(var(--accent-primary))] bg-[hsl(var(--accent-primary))]/10'
                      : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--border-h))]'
                  }`}
                >
                  <goal.icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-[hsl(var(--accent-primary))]' : ''}`} />
                  <p className="font-medium text-sm">{goal.title}</p>
                  <p className="text-xs text-[hsl(var(--fg-2))]">{goal.desc}</p>
                </button>
              );
            })}
          </div>

          <Button 
            onClick={handleContinue} 
            className="w-full mt-8"
            disabled={selected.length === 0}
          >
            Continue
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>

          <p className="text-center mt-4 text-sm text-[hsl(var(--fg-3))]">
            {selected.length} goal{selected.length !== 1 ? 's' : ''} selected
          </p>
        </motion.div>
      </div>
    </div>
  );
}
