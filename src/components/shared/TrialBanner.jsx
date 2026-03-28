/**
 * TrialBanner — shown to users with trialing subscription
 * Shows days remaining + CTA to upgrade
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Sparkles, X } from 'lucide-react';
import { useSubscription } from '@/lib/SubscriptionContext';
import { useAuth } from '@/lib/AuthContext';
import { ROUTES } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18nContext';

function daysLeft(dateStr) {
  if (!dateStr) return 0;
  const end = new Date(dateStr + 'T23:59:59');
  const now = new Date();
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

export default function TrialBanner() {
  const t = useT();
  const { subscription } = useSubscription();
  const [dismissed, setDismissed] = React.useState(false);
  const { user } = useAuth();

  if (dismissed) return null;
  if (!subscription || subscription.status !== 'trialing') return null;
  if (user?.atlas_role === 'admin') return null;

  const days = daysLeft(subscription.expires_at || subscription.trial_ends_at);
  const isUrgent = days <= 2;

  return (
    <div
      className={cn(
        'glass flex flex-wrap items-center gap-3 border-b border-[hsl(var(--border)/0.72)] px-4 py-3 text-sm',
        isUrgent
          ? 'text-[hsl(var(--err))]'
          : 'text-[hsl(var(--fg-2))]'
      )}
    >
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border bg-[hsl(var(--card)/0.82)]',
          isUrgent
            ? 'border-[hsl(var(--err)/0.16)] text-[hsl(var(--err))]'
            : 'border-[hsl(var(--border)/0.9)] text-[hsl(var(--brand))]'
        )}
      >
        {isUrgent ? <Clock className="h-4 w-4" strokeWidth={2.1} /> : <Sparkles className="h-4 w-4" strokeWidth={2.1} />}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
          {days > 0
            ? t('shared.trialBanner.daysRemaining', { days, plural: days !== 1 ? 's' : '' })
            : t('shared.trialBanner.endsToday')}
        </p>
        <p className="mt-1 text-[12px] leading-5 text-[hsl(var(--fg-2))]">
          {t('shared.trialBanner.keepWorkflow')}
        </p>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Link
          to={ROUTES.pricing}
          className={cn(
            'atlas-button h-9 px-3 text-[11px] font-semibold',
            isUrgent ? 'atlas-button-danger' : 'atlas-button-primary'
          )}
        >
          {t('shared.trialBanner.subscribeNow')}
        </Link>
        <button
          onClick={() => setDismissed(true)}
          className="flex h-9 w-9 items-center justify-center rounded-2xl text-[hsl(var(--fg-2))] transition-colors hover:bg-[hsl(var(--fill))] hover:text-[hsl(var(--fg))]"
          aria-label={t('shared.trialBanner.closeBanner')}
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
