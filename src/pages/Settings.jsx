import React from 'react';
import { Link } from 'react-router-dom';
import {
  Moon,
  Sun,
  User,
  LogOut,
  FileOutput,
  HelpCircle,
  ArrowRight,
  CreditCard,
  Shield,
  Clock,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from '@/lib/ThemeContext';
import { useI18n } from '@/lib/i18nContext';
import { useCustomerPortal } from '@/hooks/useCustomerPortal';
import { useSubscription } from '@/lib/SubscriptionContext';
import { ROUTES } from '@/lib/routes';
import {
  PageShell,
  SafePageBoundary,
  SectionCard,
} from '@/components/shared/StablePage';
import { Button } from '@/components/ui/button';

// ── Theme option button ───────────────────────────────────────────────────────

function ThemeOption({ icon: Icon, label, description, value, currentTheme, onSelect }) {
  const active = currentTheme === value;
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={[
        'flex min-h-[104px] flex-1 flex-col items-start justify-center gap-1.5 rounded-[22px] border px-5 py-5 text-left transition-all duration-200',
        active
          ? 'border-[hsl(var(--brand)/0.4)] bg-[hsl(var(--brand)/0.08)] text-[hsl(var(--brand))] shadow-[var(--shadow-xs)]'
          : 'border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.46)] text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--fill)/0.72)] hover:text-[hsl(var(--fg))]',
      ].join(' ')}
    >
      <Icon className="h-5 w-5" strokeWidth={1.9} />
      <span className="text-[14px] font-semibold tracking-[-0.016em]">{label}</span>
      {description && (
        <span className="text-[12px] leading-4 opacity-80">{description}</span>
      )}
    </button>
  );
}

// ── Row link ──────────────────────────────────────────────────────────────────

function ControlRow({ icon: Icon, label, description, href, onClick, meta, destructive = false }) {
  const cls = [
    'flex min-h-[72px] w-full items-center gap-4 rounded-[18px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.46)] px-5 py-3.5 text-left transition-all duration-200',
    destructive
      ? 'hover:border-[hsl(var(--err)/0.3)] hover:bg-[hsl(var(--err)/0.06)]'
      : 'hover:bg-[hsl(var(--fill)/0.72)]',
  ].join(' ');

  const inner = (
    <>
      <div
        className={[
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border',
          destructive
            ? 'border-[hsl(var(--err)/0.2)] bg-[hsl(var(--err)/0.08)] text-[hsl(var(--err))]'
            : 'border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card))] text-[hsl(var(--fg-2))]',
        ].join(' ')}
      >
        <Icon className="h-4 w-4" strokeWidth={1.9} />
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={[
            'text-[14px] font-semibold tracking-[-0.018em]',
            destructive ? 'text-[hsl(var(--err))]' : 'text-[hsl(var(--fg))]',
          ].join(' ')}
        >
          {label}
        </p>
        {description ? (
          <p className="mt-0.5 text-[12px] leading-4 text-[hsl(var(--fg-2))]">{description}</p>
        ) : null}
      </div>
      {meta && (
        <span className="text-[12px] text-[hsl(var(--fg-3))]">{meta}</span>
      )}
    </>
  );

  if (href) {
    return (
      <Link to={href} className={cls}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}

// ── Settings content ──────────────────────────────────────────────────────────

function SettingsContent() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { t } = useI18n();
  const { openCustomerPortal, loading: portalLoading } = useCustomerPortal();
  const { subscription } = useSubscription();

  const handleLogout = async () => {
    if (window.confirm(t('settings.signout.confirm'))) {
      await logout?.();
    }
  };

  const planName = subscription?.plan_code
    ? subscription.plan_code.charAt(0).toUpperCase() + subscription.plan_code.slice(1)
    : 'Free';

  const planStatus = subscription?.status === 'active'
    ? 'Active'
    : subscription?.status === 'trialing'
    ? 'Trial'
    : subscription?.status === 'past_due'
    ? 'Past due'
    : 'Free';

  const lastUpdated = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <PageShell maxWidth="max-w-2xl">
      {/* Account — Primary section */}
      <SectionCard
        title="Account"
        subtitle="Your profile and plan"
      >
        <div className="space-y-3">
          <div className="flex items-center gap-4 rounded-[20px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.3)] px-5 py-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--brand)/0.12)] text-[hsl(var(--brand))]">
              <User className="h-5 w-5" strokeWidth={1.9} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold tracking-[-0.018em] text-[hsl(var(--fg))]">
                {user?.name || user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="mt-0.5 text-[13px] text-[hsl(var(--fg-2))]">{user?.email || '—'}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[12px] text-[hsl(var(--fg-3))]">Updated {lastUpdated}</span>
              <Button asChild variant="outline" size="sm" className="gap-1.5">
                <Link to={ROUTES.profile}>
                  Edit your profile
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
                </Link>
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-[20px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.3)] px-5 py-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--brand)/0.12)] text-[hsl(var(--brand))]">
              <CreditCard className="h-5 w-5" strokeWidth={1.9} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold tracking-[-0.018em] text-[hsl(var(--fg))]">
                {planName} Plan
              </p>
              <p className="mt-0.5 text-[13px] text-[hsl(var(--fg-2))]">
                {planStatus}
                {subscription?.expires_at && ` • Renews ${new Date(subscription.expires_at).toLocaleDateString()}`}
              </p>
            </div>
            {subscription && ['active', 'trialing', 'past_due'].includes(subscription.status) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => openCustomerPortal(user?.id, user?.email)}
                disabled={portalLoading}
                className="gap-1.5"
              >
                {portalLoading ? 'Loading...' : 'Manage plan'}
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
              </Button>
            )}
          </div>
        </div>
      </SectionCard>

      {/* Experience */}
      <SectionCard
        title="Interface"
        subtitle="How atlas.core looks and feels"
      >
        <div className="flex gap-3">
          <ThemeOption
            icon={Moon}
            label="Dark"
            description="Recommended"
            value="dark"
            currentTheme={theme}
            onSelect={setTheme}
          />
          <ThemeOption
            icon={Sun}
            label="Light"
            description="Alternative"
            value="light"
            currentTheme={theme}
            onSelect={setTheme}
          />
        </div>
        <p className="mt-3 text-[12px] text-[hsl(var(--fg-3))]">
          Dark mode preserves the intended contrast and visual hierarchy designed for atlas.core.
        </p>
      </SectionCard>

      {/* Data & Control */}
      <SectionCard
        title="Data"
        subtitle="Exports and privacy controls"
      >
        <div className="space-y-3">
          <ControlRow
            icon={FileOutput}
            label="Export your data"
            description="Download CSV, JSON, or PDF with date range selection"
            href={ROUTES.export}
          />
          <ControlRow
            icon={Shield}
            label="Privacy settings"
            description="Manage data visibility and account controls"
            href={ROUTES.export}
          />
        </div>
      </SectionCard>

      {/* Support */}
      <SectionCard
        title="Support"
        subtitle="Help and system information"
      >
        <div className="space-y-3">
          <ControlRow
            icon={HelpCircle}
            label="Help Center"
            description="Guides, FAQs, and troubleshooting"
            href={ROUTES.help}
          />
          <div className="rounded-[18px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.3)] px-5 py-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card))] text-[hsl(var(--fg-2))]">
                <Clock className="h-4 w-4" strokeWidth={1.9} />
              </div>
              <div className="min-w-0">
                <p className="text-[14px] font-semibold tracking-[-0.018em] text-[hsl(var(--fg))]">
                  System prompts
                </p>
                <p className="mt-1 text-[12px] leading-4 text-[hsl(var(--fg-2))]">
                  Trial notices, password changes, and session events use calm iOS-style confirmations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Session — Danger zone */}
      <SectionCard
        title="Session"
        subtitle="Active session control"
      >
        <ControlRow
          icon={LogOut}
          label="Sign out"
          description="End your current session across all devices"
          onClick={handleLogout}
          meta="Active now"
          destructive
        />
      </SectionCard>
    </PageShell>
  );
}

export default function Settings() {
  return (
    <SafePageBoundary
      title="Settings"
      subtitle="Personalize your experience."
      maxWidth="max-w-2xl"
      fallbackDescription="Settings page encountered an error."
    >
      <SettingsContent />
    </SafePageBoundary>
  );
}
