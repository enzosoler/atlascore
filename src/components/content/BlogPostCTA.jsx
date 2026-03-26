import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Dumbbell, TrendingUp, Utensils, Target, ArrowRight, Zap } from 'lucide-react';
import { ROUTES } from '@/lib/routes';

const CTA_CONFIG = {
  workout: {
    icon: Dumbbell,
    title: 'Apply this to your training',
    description: 'Generate a workout based on this approach using AI.',
    ctaText: 'Generate workout',
    link: `${ROUTES.workouts}/generate`,
    color: 'tint',
  },
  tracking: {
    icon: TrendingUp,
    title: 'Track this automatically',
    description: 'Start logging your metrics in atlas.core and see patterns emerge.',
    ctaText: 'Start tracking',
    link: `${ROUTES.measurements}`,
    color: 'brand',
  },
  nutrition: {
    icon: Utensils,
    title: 'Log your nutrition',
    description: 'Track meals and macros with intelligent food recognition.',
    ctaText: 'Log meals',
    link: `${ROUTES.nutrition}`,
    color: 'emerald',
  },
  measurements: {
    icon: Target,
    title: 'Track your transformation',
    description: 'Log measurements, progress photos, and body composition in one place.',
    ctaText: 'Start tracking',
    link: `${ROUTES.measurements}`,
    color: 'violet',
  },
  planning: {
    icon: Sparkles,
    title: 'Build your system',
    description: 'Create a structured training plan that adapts to your progress.',
    ctaText: 'Build your plan',
    link: `${ROUTES.protocols}`,
    color: 'amber',
  },
};

export default function BlogPostCTA({ type = 'tracking', className = '' }) {
  const config = CTA_CONFIG[type] || CTA_CONFIG.tracking;
  const Icon = config.icon;

  const colorStyles = {
    tint: 'from-[hsl(var(--tint))]/10 to-[hsl(var(--tint))]/5 border-[hsl(var(--tint))]/30',
    brand: 'from-[hsl(var(--brand))]/10 to-[hsl(var(--brand))]/5 border-[hsl(var(--brand))]/30',
    emerald: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/30',
    violet: 'from-violet-500/10 to-violet-500/5 border-violet-500/30',
    amber: 'from-amber-500/10 to-amber-500/5 border-amber-500/30',
  };

  const iconColors = {
    tint: 'text-[hsl(var(--tint))]',
    brand: 'text-[hsl(var(--brand))]',
    emerald: 'text-emerald-500',
    violet: 'text-violet-500',
    amber: 'text-amber-500',
  };

  return (
    <div
      className={`
        my-10 rounded-2xl border bg-gradient-to-br p-6 lg:p-8
        ${colorStyles[config.color]}
        ${className}
      `}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <div className={`rounded-lg bg-white/60 p-2 ${iconColors[config.color]}`}>
              <Icon className="h-5 w-5" strokeWidth={1.8} />
            </div>
            <span className={`text-[13px] font-semibold ${iconColors[config.color]}`}>
              atlas.core
            </span>
          </div>
          
          <div className="space-y-1">
            <h4 className="text-[17px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
              {config.title}
            </h4>
            <p className="text-[14px] leading-relaxed text-[hsl(var(--fg-2))]">
              {config.description}
            </p>
          </div>
        </div>

        <div className="flex-shrink-0 pt-2 sm:pt-0">
          <Link
            to={config.link}
            className="
              inline-flex items-center gap-2 rounded-full
              bg-[hsl(var(--fg))] px-5 py-2.5
              text-[13px] font-semibold text-[hsl(var(--bg))]
              transition-all duration-200
              hover:bg-[hsl(var(--fg))]/90 hover:scale-[1.02]
              active:scale-[0.98]
            "
          >
            <Zap className="h-3.5 w-3.5" strokeWidth={2} />
            {config.ctaText}
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
          </Link>
        </div>
      </div>
    </div>
  );
}
