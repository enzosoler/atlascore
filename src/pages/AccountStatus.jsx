import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock, Crown, CreditCard, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/lib/SubscriptionContext';
import { FEATURE_LOCKS, PLAN_LEVELS, PLAN_LABELS } from '@/lib/entitlements';
import { ROUTES } from '@/lib/routes';
import { useT } from '@/lib/i18nContext';
import { PageShell, SectionCard, SafePageBoundary, StatusBanner, EmptyState } from '@/components/shared/StablePage';

const COMPARISON_FEATURES = [
  'ai_food_text',
  'ai_food_photo',
  'atlas_ai',
  'ai_workout_generation',
  'ai_diet_generation',
  'progress_photos',
  'advanced_analytics',
  'history',
  'standard_exports',
  'lab_exams',
];

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function DetailRow({ label, value, hint }) {
  return (
    <div className="rounded-[18px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.36)] px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">{label}</p>
      <p className="mt-2 text-[15px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">{value}</p>
      {hint ? <p className="mt-1 text-[12px] leading-5 text-[hsl(var(--fg-2))]">{hint}</p> : null}
    </div>
  );
}

export default function AccountStatus() {
  const navigate = useNavigate();
  const t = useT();
  const { subscription, can, trialDaysRemaining, isTrialExpired } = useSubscription();

  const tier = subscription?.tier || 'free';
  const status = subscription?.status || 'inactive';
  const tierLabel = PLAN_LABELS[tier] || t('account.planFree');
  const userLevel = PLAN_LEVELS[tier] || 0;

  const isTrialing = status === 'trialing' && !isTrialExpired;
  const isActive = ['active', 'granted'].includes(status);
  const isPaid = userLevel >= 1 && (isActive || isTrialing);
  const isExpired = status === 'expired' || status === 'canceled' || isTrialExpired;
  const expiryDate = subscription?.expires_at || subscription?.trial_ends_at;
  const providerLabel = subscription?.source === 'revenuecat'
    ? 'Apple / RevenueCat'
    : subscription?.stripe_subscription_id
      ? 'Stripe'
      : 'No billing source';

  const featureRows = useMemo(() => {
    return COMPARISON_FEATURES.map((key) => {
      const lock = FEATURE_LOCKS[key];
      if (!lock) return null;
      const minLevel = PLAN_LEVELS[lock.minPlan] || 0;
      const includedInFree = minLevel === 0;
      const includedInPro = minLevel <= 1;
      const userHas = can(key);
      return { key, label: lock.label, includedInFree, includedInPro, userHas };
    }).filter(Boolean);
  }, [can]);

  const statusLabel = useMemo(() => {
    if (isTrialing) return 'Trialing';
    if (isActive || isPaid) return 'Active';
    if (isExpired) return 'Expired';
    return 'Free';
  }, [isTrialing, isActive, isPaid, isExpired]);

  return (
    <SafePageBoundary title={t('account.planTitle')} maxWidth="max-w-2xl" fallbackDescription={t('account.pageSubtitle')}>
      <PageShell
        eyebrow="Account"
        title={t('account.planTitle')}
        subtitle="Current plan, renewal, and entitlement coverage."
        maxWidth="max-w-2xl"
        actions={(
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        )}
      >
        <SectionCard title="Current status" subtitle="This summary comes from the active subscription record.">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {isExpired && !isPaid ? (
              <EmptyState
                title="No active subscription"
                description="Upgrade to restore premium access and billing management."
                action={(
                  <Button onClick={() => navigate(ROUTES.pricing)} className="gap-2">
                    <Crown className="h-4 w-4" />
                    View plans
                  </Button>
                )}
              />
            ) : (
              <>
                <StatusBanner tone={status === 'past_due' ? 'warning' : 'neutral'}>
                  <span className="font-semibold">{statusLabel}</span>
                  <span className="text-[hsl(var(--fg-2))]"> · Managed by {providerLabel}</span>
                </StatusBanner>

                <div className="grid gap-3 md:grid-cols-2">
                  <DetailRow label="Plan" value={tierLabel} hint="The current entitlement tier on the account." />
                  <DetailRow label="Billing owner" value={providerLabel} hint="This is where renewal and cancellation are handled." />
                  <DetailRow label="Renewal" value={isTrialing ? `Trial ends ${formatDate(expiryDate)}` : `Renews on ${formatDate(expiryDate)}`} hint="Date from the active subscription record." />
                  <DetailRow label="Source" value={subscription?.source || 'unknown'} hint={subscription?.stripe_subscription_id ? `Stripe subscription ${subscription.stripe_subscription_id}` : 'No Stripe subscription id on file.'} />
                </div>

                {isTrialing ? (
                  <div className="rounded-[18px] border border-[hsl(var(--brand)/0.24)] bg-[hsl(var(--brand)/0.06)] px-4 py-4">
                    <div className="flex items-center gap-2 text-[13px] font-semibold text-[hsl(var(--fg))]">
                      <Clock className="h-4 w-4" />
                      Trial progress
                    </div>
                    <p className="mt-2 text-[12px] text-[hsl(var(--fg-2))]">
                      {t('account.daysRemaining', '{n} days remaining').replace('{n}', trialDaysRemaining)}
                    </p>
                  </div>
                ) : null}
              </>
            )}
          </motion.div>
        </SectionCard>

        <SectionCard title="Feature coverage" subtitle="Included features are shown for the current plan and the next paid tier.">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[12px] text-[hsl(var(--fg-3))]">
              <span>{t('account.planFree')}</span>
              <span>{t('account.planPro')}</span>
            </div>
            {featureRows.map((feature) => (
              <div key={feature.key} className="flex items-center justify-between rounded-[16px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.36)] px-4 py-3">
                <span className={`text-[13px] ${feature.userHas ? 'text-[hsl(var(--fg))]' : 'text-[hsl(var(--fg-3))]'}`}>
                  {feature.label}
                </span>
                <div className="flex items-center gap-6">
                  {feature.includedInFree ? <CheckCircle2 className="h-4 w-4 text-[hsl(var(--ok))]" /> : <X className="h-4 w-4 text-[hsl(var(--fg-3))] opacity-40" />}
                  {feature.includedInPro ? <CheckCircle2 className="h-4 w-4 text-[hsl(var(--ok))]" /> : <X className="h-4 w-4 text-[hsl(var(--fg-3))] opacity-40" />}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Next step" subtitle="Move to the correct billing surface when you need to change payment or cancel.">
          {isPaid || isTrialing ? (
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button onClick={() => navigate('/billing')} className="w-full gap-2 sm:w-auto">
                <CreditCard className="h-4 w-4" />
                Manage billing
              </Button>
              <Button variant="outline" onClick={() => navigate(ROUTES.settings)} className="w-full sm:w-auto">
                Back to settings
              </Button>
            </div>
          ) : (
            <Button onClick={() => navigate(ROUTES.pricing)} className="w-full gap-2">
              <Crown className="h-4 w-4" />
              View plans
            </Button>
          )}
        </SectionCard>
      </PageShell>
    </SafePageBoundary>
  );
}
