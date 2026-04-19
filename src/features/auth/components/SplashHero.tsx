import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { ChevronRight } from 'lucide-react';

interface SplashHeroProps {
  onStart: () => void;
  onLogin: () => void;
}

export const SplashHero: React.FC<SplashHeroProps> = ({ onStart, onLogin }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="max-w-md w-full"
      >
        <div className="mb-8 flex justify-center">
          {/* Logo Placeholder */}
          <div className="w-20 h-20 bg-brand-gold rounded-2xl flex items-center justify-center shadow-premium transform rotate-3 hover:rotate-0 transition-transform duration-300">
            <span className="text-base-black font-bold text-4xl">A</span>
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-base-white mb-4 tracking-tight">
          Atlas Core
        </h1>
        
        <p className="text-lg text-base-gray-400 mb-12 leading-relaxed">
          The ultimate training system for high-performance athletes.
          Personalized protocols, real-time analytics, and elite-level coaching.
        </p>

        <div className="space-y-4">
          <Button
            size="lg"
            className="w-full h-14 text-lg font-semibold group"
            onClick={onStart}
          >
            Get Started
            <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <Button
            variant="ghost"
            size="lg"
            className="w-full h-14 text-lg font-medium text-base-gray-400 hover:text-base-white"
            onClick={onLogin}
          >
            I already have an account
          </Button>
        </div>
      </motion.div>

      {/* Background Decorative Elements */}
      <div className="absolute top-1/4 -left-20 w-64 h-64 bg-brand-gold/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-64 h-64 bg-brand-emerald/5 blur-[100px] rounded-full pointer-events-none" />
    </div>
  );
};
