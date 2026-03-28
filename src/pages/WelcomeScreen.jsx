import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Activity, Dumbbell, Heart, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AtlasCoreLogoSVG from '@/components/AtlasCoreLogoSVG';

const FEATURES = [
  { icon: Activity, title: 'Track Progress', desc: 'Monitor every metric' },
  { icon: Dumbbell, title: 'Smart Workouts', desc: 'AI-powered training' },
  { icon: Heart, title: 'Holistic Health', desc: 'Body, mind & labs' },
  { icon: Zap, title: 'Optimize Performance', desc: 'Reach your peak' },
];

export default function WelcomeScreen() {
  const navigate = useNavigate();

  return (
    <div className="mobile-screen bg-[hsl(var(--bg))]">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 safe-scroll">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <AtlasCoreLogoSVG width={48} height={24} />
          <span className="text-xl font-bold">
            <span className="text-[hsl(var(--accent-primary))]">atlas</span>
            <span className="text-[hsl(var(--fg))]">.core</span>
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl font-bold text-center mb-4"
        >
          Your Complete Health
          <br />
          <span className="text-[hsl(var(--accent-primary))]">Operating System</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-[hsl(var(--fg-2))] text-center mb-12 max-w-md"
        >
          Track workouts, nutrition, body metrics, and lab results—all in one powerful platform.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 gap-4 mb-12 w-full max-w-sm"
        >
          {FEATURES.map((feature, i) => (
            <div
              key={i}
              className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]"
            >
              <feature.icon className="w-6 h-6 text-[hsl(var(--accent-primary))] mb-2" />
              <p className="font-medium text-sm">{feature.title}</p>
              <p className="text-xs text-[hsl(var(--fg-2))]">{feature.desc}</p>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col gap-3 w-full max-w-sm"
        >
          <Button
            size="lg"
            onClick={() => navigate('/auth?mode=signup')}
            className="w-full"
          >
            Get Started
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/auth?mode=login')}
            className="w-full"
          >
            I Already Have an Account
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
