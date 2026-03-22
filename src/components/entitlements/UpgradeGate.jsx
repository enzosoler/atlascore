import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, ArrowRight, AlertTriangle } from 'lucide-react';
import { useSubscription } from '@/lib/SubscriptionContext';
import { ROUTES } from '@/lib/routes';

/**
 * UpgradeGate — blocks premium features for free users
 * Also shows trial expired message if applicable
 * 
 * Usage:
 * <UpgradeGate feature="atlas_ai" plan="Pro">
 *   <YourComponent />
 * </UpgradeGate>
 */
export default function UpgradeGate({ feature, plan = 'Pro', children, title, description }) {
  const { can, isTrialExpired } = useSubscription();

  if (can(feature)) {
    return children;
  }

  const planNames = {
    Pro: 'Pro Plan',
    Performance: 'Performance Plan',
    Coach: 'Coach Plan',
    Nutrition: 'Nutrition Plan',
    Clinical: 'Clinical Plan',
  };

  const featureNames = {
    atlas_ai: 'Insights',
    lab_exams: 'Lab Exams',
    progress_photos: 'Progress Photos',
    ai_diet_generation: 'Meal plan builder',
    ai_workout_generation: 'Workout plan builder',
    advanced_protocol_tracking: 'Advanced Protocol Tracking',
    premium_exports: 'Premium Export',
    standard_exports: 'Report Export',
  };

  const featureName = featureNames[feature] || 'This feature';
  const planName = planNames[plan] || plan;

  // Show trial expired message if trial is expired
  if (isTrialExpired) {
    return (
      <div className="rounded-2xl border border-[hsl(var(--err)/0.3)] bg-gradient-to-r from-[hsl(var(--err)/0.08)] to-[hsl(var(--err)/0.03)] p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-[hsl(var(--err)/0.12)] flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6 text-[hsl(var(--err))]" strokeWidth={2} />
        </div>
        
        <div>
          <p className="text-[14px] font-semibold text-[hsl(var(--fg))] mb-1">
            {featureName} trial ended
          </p>
          <p className="text-[13px] text-[hsl(var(--fg-2))]">
            Continue with {planName} to keep using it.
          </p>
        </div>

        <Link to={ROUTES.pricing}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[hsl(var(--err))] text-white text-[13px] font-semibold hover:bg-[hsl(var(--err)/0.88)] transition-colors">
          Continue subscription <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[hsl(var(--brand)/0.2)] bg-[hsl(var(--brand)/0.05)] p-6 text-center space-y-4">
      <div className="w-12 h-12 rounded-xl bg-[hsl(var(--brand)/0.1)] flex items-center justify-center mx-auto">
        <Lock className="w-6 h-6 text-[hsl(var(--brand))]" strokeWidth={2} />
      </div>
      
      <div>
        <p className="text-[14px] font-semibold text-[hsl(var(--fg))] mb-1">
          {title || `${featureName} — ${planName}+`}
        </p>
        <p className="text-[13px] text-[hsl(var(--fg-2))]">
          {description || 'Upgrade to unlock this feature'}
        </p>
      </div>

      <Link to={ROUTES.pricing}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--brand))] text-white text-[13px] font-semibold hover:bg-[hsl(var(--brand)/0.88)] transition-colors">
        View plans <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
      </Link>
    </div>
  );
}
