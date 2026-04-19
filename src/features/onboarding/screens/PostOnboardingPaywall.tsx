import React from 'react';
import { motion } from 'framer-motion';
import { useOnboarding } from '../OnboardingContext';
import { useT } from '@/lib/i18nContext';
import { Check, Star, ShieldCheck, Zap, X } from 'lucide-react';

export default function PostOnboardingPaywall() {
  const { goNext } = useOnboarding();
  const t = useT();

  return (
    <div className="flex flex-1 flex-col bg-black text-white overflow-y-auto pb-10">
      {/* Header Image / Hero Area */}
      <div className="relative h-64 shrink-0 bg-gradient-to-b from-blue-600 to-black flex items-center justify-center overflow-hidden">
        <motion.div 
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.4 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80')] bg-cover bg-center"
        />
        <div className="relative z-10 text-center px-6">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 backdrop-blur-md px-3 py-1 rounded-full border border-blue-500/30 mb-4">
            <Star className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">Personal Plan Ready</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight leading-tight">
            Start Your 7-Day<br />Full Access Trial
          </h1>
        </div>
      </div>

      <div className="px-6 -mt-8 relative z-20 space-y-8">
        {/* Comparison Section */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-neutral-900/80 backdrop-blur-xl p-4 rounded-3xl border border-white/5 space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Other Apps</p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-xs text-neutral-400">
                <X className="w-3 h-3 text-red-500" /> Generic targets
              </li>
              <li className="flex items-center gap-2 text-xs text-neutral-400">
                <X className="w-3 h-3 text-red-500" /> No adjustments
              </li>
              <li className="flex items-center gap-2 text-xs text-neutral-400">
                <X className="w-3 h-3 text-red-500" /> Complex logging
              </li>
            </ul>
          </div>
          <div className="bg-blue-600/10 backdrop-blur-xl p-4 rounded-3xl border border-blue-500/30 space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Atlas Pro</p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-xs text-blue-100">
                <Check className="w-3 h-3 text-blue-400" /> Smart adjustments
              </li>
              <li className="flex items-center gap-2 text-xs text-blue-100">
                <Check className="w-3 h-3 text-blue-400" /> AI Coach 24/7
              </li>
              <li className="flex items-center gap-2 text-xs text-blue-100">
                <Check className="w-3 h-3 text-blue-400" /> Pro protocols
              </li>
            </ul>
          </div>
        </div>

        {/* Value Props */}
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
              <Zap className="text-blue-400 w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Adaptive Metabolism Tracking</h4>
              <p className="text-xs text-neutral-400 mt-0.5">Atlas learns your real burn rate and adjusts your targets every 7 days automatically.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
              <ShieldCheck className="text-blue-400 w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Results Guaranteed</h4>
              <p className="text-xs text-neutral-400 mt-0.5">Join 12,000+ members who have stopped guessing and started seeing measurable change.</p>
            </div>
          </div>
        </div>

        {/* Trial Timeline */}
        <div className="bg-neutral-900 p-5 rounded-3xl border border-white/5">
          <h3 className="text-sm font-bold mb-4">Trial Timeline</h3>
          <div className="relative space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-white/10">
            <div className="relative pl-8">
              <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-blue-500 border-4 border-black" />
              <p className="text-xs font-bold">Today: Full Access</p>
              <p className="text-[10px] text-neutral-500">Zero charge. Start your plan immediately.</p>
            </div>
            <div className="relative pl-8">
              <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-neutral-700 border-4 border-black" />
              <p className="text-xs font-bold">Day 5: Reminder</p>
              <p className="text-[10px] text-neutral-500">We'll notify you before the trial ends.</p>
            </div>
            <div className="relative pl-8">
              <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-neutral-700 border-4 border-black" />
              <p className="text-xs font-bold">Day 7: Commitment</p>
              <p className="text-[10px] text-neutral-500">Subscription starts. Cancel anytime in one tap.</p>
            </div>
          </div>
        </div>

        {/* Pricing / CTA */}
        <div className="space-y-4 pt-4">
          <div className="text-center">
            <p className="text-xs text-neutral-500 mb-1">After 7 days, $12.99/mo, billed annually</p>
            <p className="text-[10px] text-neutral-600 underline">View all plans</p>
          </div>
          
          <button 
            onClick={goNext}
            className="w-full bg-white text-black h-14 rounded-2xl font-black text-lg shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-[0.98] transition-all"
          >
            START FREE TRIAL
          </button>
          
          <p className="text-[10px] text-center text-neutral-500 px-10 leading-relaxed">
            Secured by Apple App Store. You won't be charged today. Cancel at least 24h before trial ends to avoid charges.
          </p>
        </div>
      </div>
    </div>
  );
}
