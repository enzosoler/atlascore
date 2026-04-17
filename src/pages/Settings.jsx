import React from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
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
import { locales, localeLabels } from '@/i18n/config';
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
      <Icon className="h-5 w-5" strokeWidth={2} />
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
        <Icon className="h-4 w-4" strokeWidth={2} />
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

function LanguageOption({ label, value, currentLocale, onSelect }) {
  const active = currentLocale === value;
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={[
        'flex flex-1 items-center justify-center gap-2 rounded-[22px] border px-4 py-4 text-center transition-all duration-200',
        active
          ? 'border-[hsl(var(--brand)/0.4)] bg-[hsl(var(--brand)/0.08)] text-[hsl(var(--brand))] shadow-[var(--shadow-xs)]'
          : 'border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.46)] text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--fill)/0.72)] hover:text-[hsl(var(--fg))]',
      ].join(' ')}
    >
      <span className="text-[14px] font-semibold tracking-[-0.016em]">{label}</span>
    </button>
  );
}

function SettingsContent() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { t, locale, setLocale, switchLocale } = useI18n();
  const { openCustomerPortal, loading: portalLoading } = useCustomerPortal();
  const { subscription } = useSubscription();

  const handleLogout = async () => {
    if (window.confirm(t('settings.signout.confirm'))) {
      await logout?.();
    }
  };

  const planName = subscription?.plan_code
    ? subscription.plan_code.charAt(0).toUpperCase() + subscription.plan_code.slice(1)
    : t('settings.plan.free');

  const planStatus = subscription?.status === 'active'
    ? t('settings.plan.active')
    : subscription?.status === 'trialing'
    ? t('settings.plan.trial')
    : subscription?.status === 'past_due'
    ? t('settings.plan.pastDue')
    : '';

  // If no active subscription, show "Free" as the plan name instead of a contradictory combo
  const displayPlanName = (!subscription?.status || !['active', 'trialing', 'past_due'].includes(subscription.status))
    ? t('settings.plan.free')
    : planName;

  const intlLocale = locale === 'pt-BR' ? 'pt-BR' : locale === 'es' ? 'es' : 'en-US';
  const lastUpdated = new Date().toLocaleDateString(intlLocale, {
    month: 'short',
    day: 'numeric',
  });

  return (
    <PageShell maxWidth="max-w-2xl">
      {/* Account — Primary section */}
      <SectionCard
        title={t('settings.account.title')}
        subtitle={t('settings.account.planSubtitle')}
      >
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-[18px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.3)] px-5 py-4">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--brand)/0.12)] text-[hsl(var(--brand))]">
                <User className="h-5 w-5" strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold tracking-[-0.018em] text-[hsl(var(--fg))] truncate">
                  {user?.full_name || user?.name || user?.email?.split('@')[0] || 'User'}
                </p>
                <p className="mt-0.5 text-[13px] text-[hsl(var(--fg-2))] truncate">{user?.email || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 pl-16 sm:pl-0">
              <span className="text-[12px] text-[hsl(var(--fg-3))] shrink-0">{t('settings.account.updated')} {lastUpdated}</span>
              <Button asChild variant="outline" size="sm" className="gap-1.5 shrink-0">
                <Link to={ROUTES.profile}>
                  {t('settings.account.editProfile')}
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
                </Link>
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-[18px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.3)] px-5 py-4">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--brand)/0.12)] text-[hsl(var(--brand))]">
                <CreditCard className="h-5 w-5" strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold tracking-[-0.018em] text-[hsl(var(--fg))]">
                  {displayPlanName} {t('settings.plan.planLabel')}
                </p>
                <p className="mt-0.5 text-[13px] text-[hsl(var(--fg-2))]">
                  {planStatus}
                  {subscription?.expires_at && ` • ${t('settings.plan.renews')} ${new Date(subscription.expires_at).toLocaleDateString()}`}
                </p>
              </div>
            </div>
            {subscription && ['active', 'trialing', 'past_due'].includes(subscription.status) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => openCustomerPortal(user?.id, user?.email)}
                disabled={portalLoading}
                className="gap-1.5 shrink-0 ml-16 sm:ml-0"
              >
                {portalLoading ? t('settings.plan.loading') : t('settings.plan.manage')}
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
              </Button>
            )}
          </div>
        </div>
      </SectionCard>

      {/* Experience */}
      <SectionCard
        title={t('settings.interface.title')}
        subtitle={t('settings.interface.subtitle')}
      >
        <div className="flex gap-3">
          <ThemeOption
            icon={Moon}
            label={t('settings.appearance.dark')}
            description={t('settings.interface.recommended')}
            value="dark"
            currentTheme={theme}
            onSelect={setTheme}
          />
          <ThemeOption
            icon={Sun}
            label={t('settings.appearance.light')}
            description={t('settings.interface.alternative')}
            value="light"
            currentTheme={theme}
            onSelect={setTheme}
          />
        </div>
        <p className="mt-3 text-[12px] text-[hsl(var(--fg-3))]">
          {t('settings.interface.darkModeNote')}
        </p>
      </SectionCard>

      {/* Language */}
      <SectionCard
        title={t('settings.language.title')}
        subtitle={t('settings.language.subtitle')}
      >
        <div className="flex gap-3">
          {locales.map((loc) => (
            <LanguageOption
              key={loc}
              label={localeLabels[loc]}
              value={loc}
              currentLocale={locale}
              onSelect={switchLocale}
            />
          ))}
        </div>
      </SectionCard>

      {/* Notifications */}
      <SectionCard title={t('settings.notifications.title')} subtitle={t('settings.notifications.subtitle')}>
        <ControlRow
          icon={Bell}
          label={t('settings.notifications.reminderLabel')}
          description={t('settings.notifications.reminderDesc')}
          href={ROUTES.notificationSettings}
        />
      </SectionCard>

      {/* Data & Control */}
      <SectionCard
        title={t('settings.data.title')}
        subtitle={t('settings.data.subtitle')}
      >
        <div className="space-y-3">
          <ControlRow
            icon={FileOutput}
            label={t('settings.data.exportLabel')}
            description={t('settings.data.exportDesc')}
            href={ROUTES.export}
          />
          <ControlRow
            icon={Shield}
            label={t('settings.data.privacyLabel')}
            description={t('settings.data.privacyDesc')}
            href="/settings/privacy"
          />
        </div>
      </SectionCard>

      {/* Support */}
      <SectionCard
        title={t('settings.support.title')}
        subtitle={t('settings.support.subtitle')}
      >
        <div className="space-y-3">
          <ControlRow
            icon={HelpCircle}
            label={t('settings.support.helpLabel')}
            description={t('settings.support.helpDesc')}
            href={ROUTES.help}
          />
          <div className="rounded-[18px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.3)] px-5 py-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card))] text-[hsl(var(--fg-2))]">
                <Clock className="h-4 w-4" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <p className="text-[14px] font-semibold tracking-[-0.018em] text-[hsl(var(--fg))]">
                  {t('settings.support.systemPromptsLabel')}
                </p>
                <p className="mt-1 text-[12px] leading-4 text-[hsl(var(--fg-2))]">
                  {t('settings.support.systemPromptsDesc')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Session — Danger zone */}
      <SectionCard
        title={t('settings.signout.title')}
        subtitle={t('settings.session.subtitle')}
      >
        <ControlRow
          icon={LogOut}
          label={t('settings.signout.label')}
          description={t('settings.session.signOutDesc')}
          onClick={handleLogout}
          meta={t('settings.session.activeNow')}
          destructive
        />
      </SectionCard>
    </PageShell>
  );
}

export default function Settings() {
  const { t } = useI18n();
  return (
    <SafePageBoundary
      title={t('settings.title')}
      subtitle={t('settings.subtitle')}
      maxWidth="max-w-2xl"
      fallbackDescription={t('settings.errorFallback')}
    >
      <SettingsContent />
    </SafePageBoundary>
  );
}
