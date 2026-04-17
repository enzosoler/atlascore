import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CreditCard, Loader2, Smartphone, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/lib/SubscriptionContext';
import { useCustomerPortal } from '@/hooks/useCustomerPortal';
import { ROUTES } from '@/lib/routes';
import { DataState, PageShell, SectionCard, SafePageBoundary } from '@/components/shared/StablePage';
import { formatBillingOwner, formatRenewalLabel, formatSubscriptionPlanLabel } from '@/lib/accountPresentation';

export default function BillingManagement() {
  const navigate = useNavigate();
  const { subscription, isNative, showCustomerCenter } = useSubscription();
  const { openCustomerPortal, loading } = useCustomerPortal();
  const [portalError, setPortalError] = React.useState('');

  const hasPaidSubscription =
    subscription?.source === 'revenuecat' ||
    subscription?.stripe_subscription_id ||
    ['active', 'trialing', 'past_due', 'granted'].includes(subscription?.status);

  const providerLabel = formatBillingOwner(subscription, isNative);

  const statusLabel = (() => {
    if (subscription?.status === 'trialing') return 'Trial';
    if (subscription?.status === 'past_due') return 'Past due';
    if (subscription?.status === 'granted') return 'Granted';
    if (subscription?.status === 'active') return 'Active';
    return 'Inactive';
  })();

  const renewalLabel = formatRenewalLabel(subscription);

  const handleManage = async () => {
    setPortalError('');
    if (isNative) {
      showCustomerCenter();
      return;
    }

    const result = await openCustomerPortal(`${window.location.origin}${ROUTES.billing}`);
    if (!result?.ok) {
      setPortalError(result?.error || 'Could not open billing portal.');
      toast.error(result?.error || 'Could not open billing portal.');
    }
  };

  return (
    <SafePageBoundary title="Billing" maxWidth="max-w-2xl" fallbackDescription="Manage billing and plan ownership.">
      <PageShell
        eyebrow="Billing"
        title="Billing handoff"
        subtitle="Billing is owned by the platform that sold the plan. This screen only sends you to the correct manager."
        maxWidth="max-w-2xl"
        actions={(
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        )}
      >
        <SectionCard title="Current subscription" subtitle="One source owns renewal, invoices, and cancellation.">
          {!hasPaidSubscription ? (
            <DataState
              variant="empty"
              eyebrow="Billing management"
              title="You are on the free plan"
              description="Upgrade first to unlock billing management, invoices, and renewal controls."
              primaryAction={(
                <Button onClick={() => navigate(ROUTES.pricing)} className="gap-2">
                  View plans
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
              note="The billing hub only appears after a paid plan exists. Pricing owns plan selection for free users."
            />
          ) : (
            <div className="space-y-4">
              <DataState
                variant={subscription?.status === 'past_due' ? 'error' : 'neutral'}
                eyebrow="Billing summary"
                meta={formatSubscriptionPlanLabel(subscription)}
                title={`${statusLabel} · ${renewalLabel}`}
                description={`Managed by ${providerLabel}. Atlas shows the current plan state here, then sends you to the platform that owns invoices, renewal, and cancellation.`}
                primaryAction={(
                  <Button onClick={handleManage} disabled={loading} className="gap-2">
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isNative ? (
                      <Smartphone className="h-4 w-4" />
                    ) : (
                      <CreditCard className="h-4 w-4" />
                    )}
                    {loading ? 'Opening…' : isNative ? 'Open customer center' : 'Open billing portal'}
                  </Button>
                )}
                secondaryAction={(
                  <Button variant="outline" onClick={() => navigate(ROUTES.account)} className="gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    Back to account
                  </Button>
                )}
                note={isNative
                  ? 'The native customer center is the right place for cancellation, renewals, and restore help on this device.'
                  : 'The Stripe portal is the right place for payment methods, invoices, cancellations, and renewal management.'}
              />

              <div className="rounded-[18px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.3)] px-5 py-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">
                  What you can do next
                </p>
                <div className="mt-3 space-y-3 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
                  <p>Update renewal and payment details in the platform-managed billing flow.</p>
                  <p>Review invoices and subscription status without guessing which system owns the plan.</p>
                  <p>Return to Atlas with the same account and the subscription state will resync here.</p>
                </div>
              </div>

              {portalError ? (
                <DataState
                  variant="error"
                  eyebrow="Portal handoff"
                  title="Billing manager did not open"
                  description={portalError}
                  primaryAction={(
                    <Button onClick={handleManage} disabled={loading} className="gap-2">
                      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                      Retry
                    </Button>
                  )}
                  secondaryAction={(
                    <Button variant="outline" onClick={() => navigate(ROUTES.settings)} className="gap-2">
                      Back to settings
                    </Button>
                  )}
                  note="If the problem continues, stay on Atlas and retry from this screen instead of guessing which external billing path to use."
                />
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button onClick={handleManage} disabled={loading} className="gap-2">
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isNative ? (
                    <Smartphone className="h-4 w-4" />
                  ) : (
                    <CreditCard className="h-4 w-4" />
                  )}
                  {loading ? 'Opening…' : isNative ? 'Open subscription center' : 'Open billing portal'}
                </Button>
                <Button variant="outline" onClick={() => navigate(ROUTES.settings)} className="gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  Settings
                </Button>
              </div>
            </div>
          )}
        </SectionCard>
      </PageShell>
    </SafePageBoundary>
  );
}
