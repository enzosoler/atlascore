import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CreditCard, Loader2, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/lib/SubscriptionContext';
import { useCustomerPortal } from '@/hooks/useCustomerPortal';
import { ROUTES } from '@/lib/routes';
import { PageShell, SectionCard, SafePageBoundary } from '@/components/shared/StablePage';
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
  const planLabel = formatSubscriptionPlanLabel(subscription);
  const renewalLabel = formatRenewalLabel(subscription);

  const statusLabel = (() => {
    if (subscription?.status === 'trialing') return 'Trial';
    if (subscription?.status === 'past_due') return 'Past due';
    if (subscription?.status === 'granted') return 'Granted';
    if (subscription?.status === 'active') return 'Active';
    return 'Inactive';
  })();

  const statusColor = (() => {
    if (subscription?.status === 'past_due') return 'bg-[hsl(var(--err)/0.08)] text-[hsl(var(--err))]';
    if (subscription?.status === 'trialing') return 'bg-[hsl(var(--brand)/0.08)] text-[hsl(var(--brand))]';
    return 'bg-[hsl(var(--ok)/0.08)] text-[hsl(var(--ok))]';
  })();

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
    <SafePageBoundary title="Billing" maxWidth="max-w-2xl" fallbackDescription="Manage billing and subscription.">
      <PageShell
        title="Billing"
        subtitle="Manage your subscription, payment method, and invoices."
        maxWidth="max-w-2xl"
        actions={(
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        )}
      >
        {!hasPaidSubscription ? (
          /* ── Free plan state ──────────────────────────────────────────── */
          <SectionCard title="Current plan">
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-[14px] bg-[hsl(var(--fill)/0.36)] px-4 py-3">
                <p className="text-[15px] font-semibold text-[hsl(var(--fg))]">Free</p>
                <span className="rounded-full bg-[hsl(var(--fill)/0.56)] px-2.5 py-1 text-[11px] font-medium text-[hsl(var(--fg-3))]">
                  No billing
                </span>
              </div>
              <p className="text-[13px] leading-relaxed text-[hsl(var(--fg-2))]">
                Upgrade to unlock billing management, invoices, and renewal controls.
              </p>
              <Button asChild className="w-full gap-2">
                <Link to={ROUTES.pricing}>
                  View plans
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </SectionCard>
        ) : (
          <>
            {/* ── Plan summary card ────────────────────────────────────── */}
            <SectionCard title="Current plan">
              <div className="space-y-4">
                <div className="rounded-[14px] bg-[hsl(var(--fill)/0.36)] px-4 py-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[16px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
                      {planLabel}
                    </p>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusColor}`}>
                      {statusLabel}
                    </span>
                  </div>
                  <p className="mt-2 text-[13px] text-[hsl(var(--fg-2))]">{renewalLabel}</p>
                </div>

                {/* Detail rows */}
                <div className="divide-y divide-[hsl(var(--border)/0.5)] rounded-[14px] border border-[hsl(var(--border)/0.72)] bg-[hsl(var(--card)/0.5)]">
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-[13px] text-[hsl(var(--fg-2))]">Billing provider</span>
                    <span className="text-[13px] font-medium text-[hsl(var(--fg))]">{providerLabel}</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-[13px] text-[hsl(var(--fg-2))]">Source</span>
                    <span className="text-[13px] font-medium text-[hsl(var(--fg))]">{subscription?.source || 'Unknown'}</span>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* ── Manage subscription ──────────────────────────────────── */}
            <SectionCard title="Manage subscription" subtitle={isNative ? 'Opens your device subscription settings.' : 'Opens the Stripe billing portal.'}>
              <div className="space-y-4">
                <Button onClick={handleManage} disabled={loading} className="w-full gap-2">
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isNative ? (
                    <Smartphone className="h-4 w-4" />
                  ) : (
                    <CreditCard className="h-4 w-4" />
                  )}
                  {loading ? 'Opening...' : isNative ? 'Open subscription center' : 'Open billing portal'}
                </Button>

                {portalError && (
                  <div className="rounded-[12px] border border-[hsl(var(--err)/0.2)] bg-[hsl(var(--err)/0.04)] px-4 py-3">
                    <p className="text-[13px] text-[hsl(var(--err))]">{portalError}</p>
                    <Button onClick={handleManage} disabled={loading} variant="outline" size="sm" className="mt-2 gap-2">
                      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                      Retry
                    </Button>
                  </div>
                )}

                <p className="text-[12px] leading-relaxed text-[hsl(var(--fg-3))]">
                  {isNative
                    ? 'Cancellation, payment updates, and restore are handled through the native subscription center.'
                    : 'Payment methods, invoices, cancellation, and renewal are managed in the Stripe portal.'}
                </p>
              </div>
            </SectionCard>
          </>
        )}
      </PageShell>
    </SafePageBoundary>
  );
}
