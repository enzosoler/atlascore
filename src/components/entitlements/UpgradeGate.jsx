import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, ArrowRight, AlertTriangle } from 'lucide-react';
import { useSubscription } from '@/lib/SubscriptionContext';
import { ROUTES } from '@/lib/routes';
import { useI18n } from '@/lib/i18nContext';

export default function UpgradeGate({ feature, plan = 'Pro', children, title, description }) {
  const { t } = useI18n();
  const { can, isTrialExpired } = useSubscription();

  if (can(feature)) return children;

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

  const featureName = featureNames[feature] || feature;
  const planName = plan;

  if (isTrialExpired) {
    return (
      <div className="rounded-2xl border border-[hsl(var(--err)/0.3)] bg-gradient-to-r from-[hsl(var(--err)/0.08)] to-[hsl(var(--err)/0.03)] p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-[hsl(var(--err)/0.12)] flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6 text-[hsl(var(--err))]" strokeWidth={2} />
        </div>
        <div>
          <p className="text-[14px] font-semibold text-[hsl(var(--fg))] mb-1">
            {t('entitlements.featureTrialEnded', { feature: featureName })}
          </p>
          <p className="text-[13px] text-[hsl(var(--fg-2))]">
            {t('entitlements.continueWith', { plan: planName })}
          </p>
        </div>
        <Link to={ROUTES.pricing} className="atlas-button atlas-button-danger inline-flex h-10 px-4 rounded-lg text-[13px] gap-2">
          {t('entitlements.continueSubscription')} <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
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
          {description || t('entitlements.upgradeToUnlock')}
        </p>
      </div>
      <Link to={ROUTES.pricing} className="atlas-button atlas-button-primary inline-flex h-10 px-4 rounded-lg text-[13px] gap-2">
        {t('entitlements.viewPlans')} <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
      </Link>
    </div>
  );
}
