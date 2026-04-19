import React from 'react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft } from 'lucide-react';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  onBack?: () => void;
  title?: string;
}

export const OnboardingProgress: React.FC<OnboardingProgressProps> = ({
  currentStep,
  totalSteps,
  onBack,
  title,
}) => {
  const percentage = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto px-6 py-4 space-y-4">
      <div className="flex items-center justify-between">
        {onBack ? (
          <button
            onClick={onBack}
            className="p-2 -ml-2 text-base-gray-400 hover:text-base-white hover:bg-base-gray-800 rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-9 h-9" />
        )}

        {title && (
          <h3 className="text-sm font-medium text-base-gray-400 uppercase tracking-widest">
            {title}
          </h3>
        )}

        <div className="text-sm font-mono text-brand-gold">
          {Math.round(percentage)}%
        </div>
      </div>

      <div className="relative h-1.5 w-full bg-base-gray-900 rounded-full overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 h-full bg-brand-gold shadow-[0_0_10px_rgba(212,175,55,0.5)]"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};
