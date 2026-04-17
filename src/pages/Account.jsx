import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Bell,
  ChevronRight,
  CreditCard,
  FileOutput,
  LogOut,
  Plug,
  Settings,
  ShieldCheck,
  Trash2,
  User,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/lib/i18nContext';
import { useSubscription } from '@/lib/SubscriptionContext';
import { supabase } from '@/lib/supabaseClient';
import { ROUTES } from '@/lib/routes';
import {
  formatBillingOwner,
  formatRenewalLabel,
  formatSubscriptionPlanLabel,
  getAccountDisplayName,
  getAccountInitials,
} from '@/lib/accountPresentation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { PageShell, SectionCard, SafePageBoundary } from '@/components/shared/StablePage';

/* ─── Grouped row: iOS-style drill-in row ─────────────────────────────────── */

function GroupedRow({ to, onClick, icon: Icon, label, value, danger = false, isLast = false }) {
  const cls = [
    'flex items-center gap-3.5 px-4 py-3 transition-colors',
    danger
      ? 'hover:bg-[hsl(var(--err)/0.04)]'
      : 'hover:bg-[hsl(var(--fill)/0.52)]',
    !isLast && 'border-b border-[hsl(var(--border)/0.5)]',
  ].filter(Boolean).join(' ');

  const inner = (
    <>
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] ${
        danger
          ? 'bg-[hsl(var(--err)/0.08)] text-[hsl(var(--err))]'
          : 'bg-[hsl(var(--fill)/0.7)] text-[hsl(var(--fg-2))]'
      }`}>
        <Icon className="h-4 w-4" strokeWidth={1.8} />
      </div>
      <span className={`flex-1 text-[14px] font-medium tracking-[-0.01em] ${
        danger ? 'text-[hsl(var(--err))]' : 'text-[hsl(var(--fg))]'
      }`}>
        {label}
      </span>
      {value && (
        <span className="text-[13px] text-[hsl(var(--fg-3))]">{value}</span>
      )}
      <ChevronRight className={`h-4 w-4 shrink-0 ${
        danger ? 'text-[hsl(var(--err)/0.4)]' : 'text-[hsl(var(--fg-3)/0.6)]'
      }`} />
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`w-full text-left ${cls}`}>
        {inner}
      </button>
    );
  }

  return (
    <Link to={to} className={cls}>
      {inner}
    </Link>
  );
}

function GroupedSection({ children }) {
  return (
    <div className="overflow-hidden rounded-[16px] border border-[hsl(var(--border)/0.72)] bg-[hsl(var(--card)/0.6)]">
      {children}
    </div>
  );
}

/* ─── Reset data dialog ───────────────────────────────────────────────────── */

function ResetDataSection({ logout }) {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);

  const canConfirm = confirmText.trim().toUpperCase() === 'RESET';

  async function handleReset() {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('reset-user-data', { body: {} });
      if (error) {
        toast.error(`Reset failed: ${error?.message ?? JSON.stringify(error)}`);
        return;
      }
      if (data?.error) {
        toast.error(`Reset failed: ${data.error}`);
        return;
      }
      toast.success('Data reset complete');
      setOpen(false);
      setTimeout(() => logout?.(), 500);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <GroupedRow
        onClick={() => { setOpen(true); setConfirmText(''); }}
        icon={RotateCcw}
        label="Reset all data"
        value="Irreversible"
        danger
      />

      <Dialog open={open} onOpenChange={(v) => { if (!loading) setOpen(v); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[hsl(var(--err))]">Reset all data</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <p className="mb-1.5 text-[13px] font-semibold uppercase tracking-[0.08em] text-[hsl(var(--err)/0.8)]">Will be deleted</p>
              <p className="text-[14px] leading-relaxed text-[hsl(var(--fg-2))]">Workouts, meals, measurements, check-ins, photos, and plans.</p>
            </div>
            <div>
              <p className="mb-1.5 text-[13px] font-semibold uppercase tracking-[0.08em] text-[hsl(var(--ok)/0.8)]">Will be kept</p>
              <p className="text-[14px] leading-relaxed text-[hsl(var(--fg-2))]">Account access, email, subscription, and profile basics.</p>
            </div>
            <div>
              <label htmlFor="reset-confirm" className="mb-1.5 block text-[13px] font-medium text-[hsl(var(--fg-2))]">
                Type <span className="font-bold text-[hsl(var(--err))]">RESET</span> to confirm
              </label>
              <input
                id="reset-confirm"
                type="text"
                autoComplete="off"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                disabled={loading}
                className="w-full rounded-[12px] border border-[hsl(var(--border))] bg-[hsl(var(--fill)/0.5)] px-3 py-2.5 text-[15px] text-[hsl(var(--fg))] placeholder:text-[hsl(var(--fg-3))] focus:border-[hsl(var(--err)/0.5)] focus:outline-none"
                placeholder="RESET"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
            <Button variant="destructive" onClick={handleReset} disabled={!canConfirm || loading} className="gap-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Resetting...' : 'Reset my data'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ─── Account page ────────────────────────────────────────────────────────── */

export default function Account() {
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const { subscription } = useSubscription();

  const displayName = getAccountDisplayName(user);
  const initials = getAccountInitials(user);
  const isSubscribed = ['active', 'trialing', 'granted', 'past_due'].includes(subscription?.status);
  const planLabel = formatSubscriptionPlanLabel(subscription);
  const renewalLabel = formatRenewalLabel(subscription);

  return (
    <SafePageBoundary
      title={t('account.pageTitle')}
      maxWidth="max-w-2xl"
      fallbackDescription={t('account.pageSubtitle')}
    >
      <PageShell
        title={t('account.pageTitle')}
        subtitle="Identity, subscription, and account controls."
        maxWidth="max-w-2xl"
        actions={(
          <Button asChild variant="ghost" size="sm">
            <Link to={ROUTES.profile} className="flex items-center gap-2 text-[hsl(var(--fg-2))]">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
        )}
      >
        {/* ── Identity card ──────────────────────────────────────────────── */}
        <SectionCard>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[hsl(var(--border)/0.72)] bg-[hsl(var(--card)/0.88)] text-[17px] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[16px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
                {displayName}
              </p>
              <p className="mt-0.5 truncate text-[13px] text-[hsl(var(--fg-2))]">
                {user?.email || t('account.noEmail')}
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--brand)/0.25)] bg-[hsl(var(--brand)/0.06)] px-2.5 py-1 text-[11px] font-semibold tracking-[0.03em] text-[hsl(var(--brand))]">
              <ShieldCheck className="h-3 w-3" strokeWidth={2} />
              {String(user?.atlas_role || 'athlete').replace(/\b\w/g, (c) => c.toUpperCase())}
            </span>
          </div>
        </SectionCard>

        {/* ── Subscription summary ───────────────────────────────────────── */}
        <SectionCard title="Subscription" subtitle={isSubscribed ? planLabel : 'Free plan'}>
          {isSubscribed ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-[14px] bg-[hsl(var(--fill)/0.36)] px-4 py-3">
                <div>
                  <p className="text-[13px] font-semibold text-[hsl(var(--fg))]">{planLabel}</p>
                  <p className="mt-0.5 text-[12px] text-[hsl(var(--fg-2))]">{renewalLabel}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  subscription?.status === 'past_due'
                    ? 'bg-[hsl(var(--err)/0.08)] text-[hsl(var(--err))]'
                    : 'bg-[hsl(var(--ok)/0.08)] text-[hsl(var(--ok))]'
                }`}>
                  {subscription?.status === 'trialing' ? 'Trial' : subscription?.status === 'past_due' ? 'Past due' : 'Active'}
                </span>
              </div>
              <Button asChild className="w-full gap-2">
                <Link to={ROUTES.billing}>
                  <CreditCard className="h-4 w-4" />
                  Manage billing
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-[13px] leading-relaxed text-[hsl(var(--fg-2))]">
                You are on the free plan. Upgrade to unlock AI insights, training plans, and advanced analytics.
              </p>
              <Button asChild className="w-full">
                <Link to={ROUTES.pricing}>View plans</Link>
              </Button>
            </div>
          )}
        </SectionCard>

        {/* ── Navigation rows ────────────────────────────────────────────── */}
        <SectionCard title="General">
          <GroupedSection>
            <GroupedRow to={ROUTES.profileEdit} icon={User} label="Edit profile" />
            <GroupedRow to={ROUTES.settings} icon={Settings} label="Settings" />
            <GroupedRow to={ROUTES.notificationSettings} icon={Bell} label="Notifications" />
            <GroupedRow to={ROUTES.integrations} icon={Plug} label="Integrations" />
            <GroupedRow to={ROUTES.export} icon={FileOutput} label="Export data" isLast />
          </GroupedSection>
        </SectionCard>

        {/* ── Danger zone ────────────────────────────────────────────────── */}
        <SectionCard title="Danger zone">
          <GroupedSection>
            <ResetDataSection logout={logout} />
            <GroupedRow
              to={ROUTES.settingsDeleteAccount}
              icon={Trash2}
              label="Delete account"
              danger
              isLast
            />
          </GroupedSection>
        </SectionCard>

        {/* ── Logout — separate from destructive actions ─────────────────── */}
        <div className="pt-2">
          <Button variant="outline" onClick={() => logout?.()} className="w-full gap-2 text-[hsl(var(--fg-2))]">
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </div>
      </PageShell>
    </SafePageBoundary>
  );
}
