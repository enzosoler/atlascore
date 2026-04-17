import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronRight,
  CreditCard,
  LogOut,
  Mail,
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
import { DataState, PageShell, SectionCard, SafePageBoundary } from '@/components/shared/StablePage';

function SettingsLink({ to, icon: Icon, title, subtitle, meta, danger = false }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-4 rounded-[18px] border px-4 py-4 transition-colors ${
        danger
          ? 'border-[hsl(var(--err)/0.3)] bg-[hsl(var(--err)/0.04)] hover:border-[hsl(var(--err)/0.45)]'
          : 'border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.36)] hover:bg-[hsl(var(--fill)/0.52)]'
      }`}
    >
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] ${
        danger
          ? 'bg-[hsl(var(--err)/0.08)] text-[hsl(var(--err))]'
          : 'bg-[hsl(var(--card))] text-[hsl(var(--fg-2))]'
      }`}>
        <Icon className="h-4 w-4" strokeWidth={1.9} />
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-[15px] font-semibold tracking-[-0.02em] ${danger ? 'text-[hsl(var(--err))]' : 'text-[hsl(var(--fg))]'}`}>
          {title}
        </p>
        <p className="text-[13px] text-[hsl(var(--fg-2))]">{subtitle}</p>
      </div>
      {meta ? <span className="text-[12px] text-[hsl(var(--fg-3))]">{meta}</span> : null}
      <ChevronRight className={`h-4 w-4 shrink-0 ${danger ? 'text-[hsl(var(--err)/0.6)]' : 'text-[hsl(var(--fg-3))]'}`} />
    </Link>
  );
}

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
      <button type="button" onClick={() => { setOpen(true); setConfirmText(''); }} className="block w-full text-left">
        <div className="flex items-center gap-4 rounded-[18px] border border-[hsl(var(--err)/0.3)] bg-[hsl(var(--err)/0.04)] px-4 py-4 transition-colors hover:border-[hsl(var(--err)/0.45)]">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[hsl(var(--err)/0.08)] text-[hsl(var(--err))]">
            <RotateCcw className="h-4 w-4" strokeWidth={1.9} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold tracking-[-0.02em] text-[hsl(var(--err))]">Reset all data</p>
            <p className="text-[13px] text-[hsl(var(--fg-2))]">Wipe tracking data and keep the account intact.</p>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-[hsl(var(--err)/0.6)]" />
        </div>
      </button>

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

export default function Account() {
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const { subscription } = useSubscription();

  const displayName = getAccountDisplayName(user);
  const initials = getAccountInitials(user);
  const isSubscribed = ['active', 'trialing', 'granted', 'past_due'].includes(subscription?.status);
  const planLabel = formatSubscriptionPlanLabel(subscription);
  const providerLabel = formatBillingOwner(subscription);
  const renewalLabel = formatRenewalLabel(subscription);

  return (
    <SafePageBoundary
      title={t('account.pageTitle')}
      maxWidth="max-w-2xl"
      fallbackDescription={t('account.pageSubtitle')}
    >
      <PageShell
        eyebrow="Account"
        title={t('account.pageTitle')}
        subtitle="Identity, billing state, and account-wide actions."
        maxWidth="max-w-2xl"
        actions={(
          <Button asChild variant="ghost" size="sm">
            <Link to={ROUTES.profile} className="flex items-center gap-2 text-[hsl(var(--fg-2))]">
              <ArrowLeft className="h-4 w-4" />
              Back to profile
            </Link>
          </Button>
        )}
      >
        <SectionCard title="Identity" subtitle="Who this account belongs to.">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex items-start gap-4 min-w-0 flex-1">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[20px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.88)] text-[18px] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[1.1rem] font-semibold tracking-[-0.035em] text-[hsl(var(--fg))]">
                  {displayName}
                </p>
                <p className="mt-1 text-[13px] text-[hsl(var(--fg-2))]">
                  {user?.email || t('account.noEmail')}
                </p>
                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--brand)/0.3)] bg-[hsl(var(--brand)/0.08)] px-3 py-1 text-[11px] font-semibold tracking-[0.04em] text-[hsl(var(--brand))]">
                  <ShieldCheck className="h-3 w-3" strokeWidth={2} />
                  {String(user?.atlas_role || 'athlete').replace(/\b\w/g, (char) => char.toUpperCase())}
                </span>
              </div>
            </div>
            <Button asChild variant="outline" className="gap-2 self-start">
              <Link to={ROUTES.profileEdit}>
                Edit profile
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </SectionCard>

        <SectionCard title="Subscription hub" subtitle="Plan state, renewal timing, and the correct billing owner.">
          {isSubscribed ? (
            <DataState
              variant={subscription?.status === 'past_due' ? 'error' : 'neutral'}
              eyebrow="Current subscription"
              meta={planLabel}
              title={`${renewalLabel} · ${providerLabel}`}
              description={
                subscription?.source === 'revenuecat'
                  ? 'Changes happen in the device customer center. Use Atlas to confirm the current plan, then continue in the native billing owner.'
                  : 'Changes happen in the Stripe billing portal. Atlas keeps the plan state visible here and sends you to the correct manager.'
              }
              primaryAction={(
                <Button asChild className="gap-2">
                  <Link to={ROUTES.billing}>
                    <CreditCard className="h-4 w-4" />
                    Manage billing
                  </Link>
                </Button>
              )}
              secondaryAction={(
                <div className="rounded-full bg-[hsl(var(--card)/0.82)] px-3 py-2 text-[12px] font-medium text-[hsl(var(--fg-3))]">
                  Source: {subscription?.source || 'unknown'}
                </div>
              )}
              note="This card is the account-level subscription owner summary. Settings holds preferences. Billing handles the handoff."
            />
          ) : (
            <DataState
              variant="empty"
              eyebrow="Current subscription"
              title="You are on the free plan"
              description="Upgrade to open billing management and renewal controls."
              primaryAction={(
                <Button asChild>
                  <Link to={ROUTES.pricing}>View plans</Link>
                </Button>
              )}
              note="Free users manage their plan choice on Pricing. Billing only appears after a paid plan exists."
            />
          )}
        </SectionCard>

        <SectionCard title="Control plane" subtitle="Shortcuts into the rest of the app settings.">
          <div className="space-y-3">
            <SettingsLink
              to={ROUTES.profile}
              icon={User}
              title="Edit profile"
              subtitle="Adjust identity, preferences, and body data."
              meta="Profile"
            />
            <SettingsLink
              to={ROUTES.settings}
              icon={ShieldCheck}
              title="Open settings"
              subtitle="Theme, language, notifications, and data controls."
              meta="Settings"
            />
            <SettingsLink
              to={ROUTES.notificationSettings}
              icon={Mail}
              title="Notifications"
              subtitle="Reminder permissions and local reminders."
              meta="Control"
            />
            <SettingsLink
              to={ROUTES.integrations}
              icon={CreditCard}
              title="Integrations"
              subtitle="Connection center for devices and services."
              meta="Connect"
            />
          </div>
        </SectionCard>

        <SectionCard title="Danger zone" subtitle="Account-wide actions that need confirmation.">
          <div className="space-y-3">
            <ResetDataSection logout={logout} />
            <SettingsLink
              to={ROUTES.settingsDeleteAccount}
              icon={Trash2}
              title="Delete account"
              subtitle="Permanently delete the account and all connected data."
              danger
            />
          </div>
        </SectionCard>

        <Button variant="outline" onClick={() => logout?.()} className="w-full gap-2">
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
      </PageShell>
    </SafePageBoundary>
  );
}
