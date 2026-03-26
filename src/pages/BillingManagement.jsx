import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';
import { useSubscription } from '@/lib/SubscriptionContext';
import { useCustomerPortal } from '@/hooks/useCustomerPortal';

export default function BillingManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const { openCustomerPortal, loading } = useCustomerPortal();

  const handleOpenPortal = () => {
    openCustomerPortal(
      user?.id,
      user?.email,
      `${window.location.origin}/Settings`
    );
  };

  const hasPaidSubscription =
    subscription?.stripe_subscription_id ||
    (subscription?.status === 'active') ||
    (subscription?.status === 'past_due');

  return (
    <div className="min-h-screen bg-[hsl(var(--bg))]">
      <div className="flex items-center gap-4 p-4 border-b border-[hsl(var(--border))]">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-[hsl(var(--fill))] rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">Billing</h1>
      </div>

      <div className="p-4 max-w-2xl mx-auto space-y-6">
        {hasPaidSubscription ? (
          <div className="p-6 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-center space-y-4">
            <p className="text-[hsl(var(--fg-2))] text-sm">
              Manage your subscription, update payment methods, and view invoices
              in the Stripe billing portal.
            </p>
            <Button onClick={handleOpenPortal} disabled={loading} className="gap-2">
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ExternalLink className="w-4 h-4" />
              )}
              {loading ? 'Opening portal…' : 'Open Billing Portal'}
            </Button>
          </div>
        ) : (
          <div className="p-6 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-center space-y-4">
            <p className="text-[hsl(var(--fg-2))] text-sm">
              You are on the free plan. Upgrade to access full billing management.
            </p>
            <Button onClick={() => navigate('/Pricing')}>View Plans</Button>
          </div>
        )}
      </div>
    </div>
  );
}
