import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Loader2, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';
import { useSubscription } from '@/lib/SubscriptionContext';
import { useCustomerPortal } from '@/hooks/useCustomerPortal';
import { useT } from '@/lib/i18nContext';

export default function BillingManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscription, isNative, showCustomerCenter } = useSubscription();
  const { openCustomerPortal, loading } = useCustomerPortal();
  const t = useT();

  const handleOpenPortal = () => {
    if (isNative) {
      showCustomerCenter();
      return;
    }
    openCustomerPortal(
      user?.id,
      user?.email,
      `${window.location.origin}/Settings`
    );
  };

  const hasPaidSubscription =
    subscription?.source === 'revenuecat' ||
    subscription?.stripe_subscription_id ||
    (subscription?.status === 'active') ||
    (subscription?.status === 'past_due');

  return (
    <div className="mobile-screen bg-[hsl(var(--bg))]">
      <div className="flex items-center gap-4 p-4 border-b border-[hsl(var(--border))]">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-[hsl(var(--fill))] rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">{t('billing.title')}</h1>
      </div>

      <div className="p-4 max-w-2xl mx-auto space-y-6">
        {hasPaidSubscription ? (
          <div className="p-6 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-center space-y-4">
            <p className="text-[hsl(var(--fg-2))] text-sm">
              {isNative ? t('billing.manageNative') : t('billing.manageWeb')}
            </p>
            <Button onClick={handleOpenPortal} disabled={loading} className="gap-2">
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isNative ? (
                <Smartphone className="w-4 h-4" />
              ) : (
                <ExternalLink className="w-4 h-4" />
              )}
              {loading ? t('billing.opening') : isNative ? t('billing.manageSubscription') : t('billing.openPortal')}
            </Button>
          </div>
        ) : (
          <div className="p-6 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-center space-y-4">
            <p className="text-[hsl(var(--fg-2))] text-sm">
              {t('billing.freePlan')}
            </p>
            <Button onClick={() => navigate('/Pricing')}>{t('billing.viewPlans')}</Button>
          </div>
        )}
      </div>
    </div>
  );
}
