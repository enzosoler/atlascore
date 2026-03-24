import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import AtlasCoreLogoSVG from '@/components/AtlasCoreLogoSVG';

const STEPS = [
  'Analyzing your profile...',
  'Calculating nutrition targets...',
  'Creating personalized workout plan...',
  'Optimizing for your goals...',
  'Your Atlas Core is ready!',
];

export default function ValueCreation() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(prev => {
        if (prev >= STEPS.length - 1) {
          clearInterval(interval);
          setTimeout(() => navigate('/onboarding/preview-result'), 1000);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))] flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <AtlasCoreLogoSVG width={64} height={32} className="mx-auto mb-8" />

        <div className="relative w-24 h-24 mx-auto mb-8">
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-[hsl(var(--border))]"
          />
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-[hsl(var(--accent-primary))] border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-[hsl(var(--accent-primary))]" />
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-2">Building your plan</h2>
        <p className="text-[hsl(var(--fg-2))]">{STEPS[step]}</p>

        <div className="mt-8 space-y-2">
          {STEPS.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ 
                opacity: i <= step ? 1 : 0.3,
                x: 0 
              }}
              className="flex items-center gap-2 text-sm"
            >
              {i < step ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : i === step ? (
                <Loader2 className="w-4 h-4 animate-spin text-[hsl(var(--accent-primary))]" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-[hsl(var(--border))]" />
              )}
              <span className={i <= step ? 'text-[hsl(var(--fg))]' : 'text-[hsl(var(--fg-3))]'}>
                {s}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
