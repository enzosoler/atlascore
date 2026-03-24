import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Utensils, Dumbbell, Activity, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AtlasCoreLogoSVG from '@/components/AtlasCoreLogoSVG';

const PREVIEW_ITEMS = [
  { icon: Utensils, title: 'Daily Nutrition Plan', value: '2,450 kcal', locked: false },
  { icon: Dumbbell, title: 'Workout Split', value: '4 days/week', locked: false },
  { icon: Activity, title: 'Cardio Recommendations', value: '3x 20min', locked: true },
  { icon: TrendingUp, title: 'Progress Projections', value: '+5kg muscle', locked: true },
];

export default function PreviewResult() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))] flex flex-col">
      <div className="p-4">
        <AtlasCoreLogoSVG width={32} height={16} />
      </div>

      <div className="flex-1 px-6 py-4 max-w-md mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">Your plan is ready!</h1>
            <p className="text-[hsl(var(--fg-2))]">Here's a preview of what we built for you</p>
          </div>

          <div className="space-y-3 mb-8">
            {PREVIEW_ITEMS.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`p-4 rounded-xl border flex items-center gap-4 ${
                  item.locked 
                    ? 'border-[hsl(var(--border))] bg-[hsl(var(--card))] opacity-60' 
                    : 'border-[hsl(var(--accent-primary))] bg-[hsl(var(--accent-primary))]/5'
                }`}
              >
                <div className={`p-2 rounded-lg ${item.locked ? 'bg-[hsl(var(--fill))]' : 'bg-[hsl(var(--accent-primary))]/20'}`}>
                  <item.icon className={`w-5 h-5 ${item.locked ? '' : 'text-[hsl(var(--accent-primary))]'}`} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.title}</p>
                  <p className="text-xs text-[hsl(var(--fg-2))]">{item.value}</p>
                </div>
                {item.locked && <Lock className="w-4 h-4 text-[hsl(var(--fg-3))]" />}
              </motion.div>
            ))}
          </div>

          <div className="bg-[hsl(var(--accent-primary))]/10 border border-[hsl(var(--accent-primary))]/30 rounded-xl p-4 mb-6">
            <p className="text-sm font-medium mb-1">Unlock your full plan</p>
            <p className="text-xs text-[hsl(var(--fg-2))]">
              Get access to all features including advanced analytics, custom protocols, and more.
            </p>
          </div>

          <Button onClick={() => navigate('/onboarding/pre-paywall')} className="w-full">
            Unlock Full Plan
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>

          <button 
            onClick={() => navigate('/today')}
            className="w-full mt-3 text-sm text-[hsl(var(--fg-3))] hover:text-[hsl(var(--fg-2))]"
          >
            Continue with free version
          </button>
        </motion.div>
      </div>
    </div>
  );
}
