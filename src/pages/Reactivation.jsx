import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Zap, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/routes';

const HIGHLIGHTS = [
  { icon: Zap, title: 'New Workout Builder', desc: 'Create custom routines faster' },
  { icon: TrendingUp, title: 'Progress Insights', desc: 'AI-powered recommendations' },
  { icon: Sparkles, title: 'Fresh Look', desc: 'Redesigned for better experience' },
];

export default function Reactivation() {
  const navigate = useNavigate();
  const daysAway = 45;

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))] flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 max-w-md mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[hsl(var(--accent-primary))] to-[hsl(var(--accent-secondary))] flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">👋</span>
          </div>
          
          <h1 className="text-3xl font-bold mb-2">Welcome Back!</h1>
          <p className="text-[hsl(var(--fg-2))] mb-6">
            It's been {daysAway} days since your last workout. Ready to get back on track?
          </p>

          <div className="space-y-3 mb-8 text-left">
            {HIGHLIGHTS.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[hsl(var(--fill))]">
                <div className="p-2 rounded-lg bg-[hsl(var(--accent-primary))]/10">
                  <item.icon className="w-5 h-5 text-[hsl(var(--accent-primary))]" />
                </div>
                <div>
                  <p className="font-medium text-sm">{item.title}</p>
                  <p className="text-xs text-[hsl(var(--fg-2))]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <Button onClick={() => navigate('/today')} className="w-full mb-3">
            Continue My Journey
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          <button 
            onClick={() => navigate(ROUTES.onboarding)}
            className="text-sm text-[hsl(var(--fg-3))] hover:text-[hsl(var(--fg-2))]"
          >
            Restart Onboarding
          </button>
        </motion.div>
      </div>
    </div>
  );
}
