import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { useSubscription } from '@/lib/SubscriptionContext';
import { ROUTES } from '@/lib/routes';
import { useI18n } from '@/lib/i18nContext';

export default function TrialExpiredUpgrade({ feature = 'Insights', plan = 'Pro' }) {
  const { t } = useI18n();
  const { isTrialExpired } = useSubscription();

  if (!isTrialExpired) return null;

  return (
    <div className="rounded-2xl border border-[hsl(var(--err)/0.3)] bg-gradient-to-r from-[hsl(var(--err)/0.08)] to-[hsl(var(--err)/0.03)] p-6 text-center space-y-4">
      <div className="w-12 h-12 rounded-xl bg-[hsl(var(--err)/0.12)] flex items-center justify-center mx-auto">
        <AlertTriangle className="w-6 h-6 text-[hsl(var(--err))]" strokeWidth={2} />
      </div>
      <div>
        <p className="text-[14px] font-semibold text-[hsl(var(--fg))] mb-1">
          {t('entitlements.trialEnded')}
        </p>
        <p className="text-[13px] text-[hsl(var(--fg-2))]">
          {t('entitlements.featureAvailableOn', { feature, plan })}
        </p>
      </div>
      <Link to={ROUTES.pricing} className="atlas-button atlas-button-danger inline-flex h-10 px-4 rounded-lg text-[13px] gap-2">
        {t('entitlements.continueSubscription')} <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
      </Link>
    </div>
  );
}
