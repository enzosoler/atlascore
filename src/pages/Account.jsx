import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  ShieldCheck,
  LogOut,
  Crown,
  CreditCard,
  ChevronRight,
  Trash2,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/lib/i18nContext';
import { useSubscription } from '@/lib/SubscriptionContext';
import { ROUTES } from '@/lib/routes';
import {
  AppContainer,
  Card,
  PageHeader,
} from '@/components/shared/AppContainer';
import {
  SafePageBoundary,
} from '@/components/shared/StablePage';
import { Button } from '@/components/ui/button';

// ---------------------------------------------------------------------------
// Account Detail Row
// ---------------------------------------------------------------------------

function AccountRow({ icon: Icon, label, value, action }) {
  return (
    <div className="flex items-center gap-4 rounded-[16px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.4)] px-4 py-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.8)] text-[hsl(var(--fg-2))]">
        <Icon className="h-4 w-4" strokeWidth={1.9} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">
          {label}
        </p>
        <p className="truncate text-[15px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
          {value}
        </p>
      </div>
      {action}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Settings Link Card
// ---------------------------------------------------------------------------

function SettingsLink({ to, icon: Icon, title, subtitle, danger }) {
  return (
    <Link to={to} className="block">
      <div className={`flex items-center gap-4 rounded-[16px] border px-4 py-4 transition-all duration-200 hover:bg-[hsl(var(--card))] ${
        danger
          ? 'border-[hsl(var(--err)/0.3)] bg-[hsl(var(--err)/0.04)] hover:border-[hsl(var(--err)/0.5)]'
          : 'border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.6)] hover:border-[hsl(var(--fg)/0.2)]'
      }`}>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border ${
          danger
            ? 'border-[hsl(var(--err)/0.3)] bg-[hsl(var(--err)/0.08)] text-[hsl(var(--err))]'
            : 'border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.72)] text-[hsl(var(--fg-2))]'
        }`}>
          <Icon className="h-4 w-4" strokeWidth={1.9} />
        </div>
        <div className="min-w-0 flex-1">
          <p className={`text-[15px] font-semibold tracking-[-0.02em] ${danger ? 'text-[hsl(var(--err))]' : 'text-[hsl(var(--fg))]'}`}>
            {title}
          </p>
          <p className="text-[13px] text-[hsl(var(--fg-2))]">{subtitle}</p>
        </div>
        <ChevronRight className={`h-4 w-4 shrink-0 ${danger ? 'text-[hsl(var(--err)/0.6)]' : 'text-[hsl(var(--fg-3))]'}`} />
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Main Account Page
// ---------------------------------------------------------------------------

export default function Account() {
  const { t } = useI18n();

  return (
    <SafePageBoundary
      title={t('profile.sections.account')}
      maxWidth="max-w-2xl"
      fallbackDescription={t('profile.sections.accountSubtitle')}
    >
      <AccountContent />
    </SafePageBoundary>
  );
}

function AccountContent() {
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const { isSubscribed, tier } = useSubscription();

  const displayName = user?.full_name || user?.email || 'Athlete';
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(chunk => chunk[0]?.toUpperCase())
    .join('') || 'AT';

  const roleLabel = {
    athlete: 'Athlete',
    coach: 'Coach',
    nutritionist: 'Nutritionist',
    clinician: 'Clinician',
    admin: 'Admin',
  }[user?.atlas_role] || 'Athlete';

  const planLabel = isSubscribed
    ? tier === 'pro'
      ? t('account.planPro')
      : tier === 'premium'
        ? t('account.planPremium')
        : t('account.planActive')
    : t('account.planFree');

  return (
    <AppContainer>
      <PageHeader
        eyebrow={t('profile.sections.account')}
        title={t('account.pageTitle')}
        subtitle={t('account.pageSubtitle')}
        accentClassName="from-[hsl(var(--brand)/0.06)] via-[hsl(var(--ok)/0.02)]"
      />

      {/* Back link */}
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link to={ROUTES.profile} className="flex items-center gap-2 text-[hsl(var(--fg-2))]">
            <ArrowLeft className="h-4 w-4" />
            {t('account.backToProfile')}
          </Link>
        </Button>
      </div>

      {/* Identity Card */}
      <section className="mb-6">
        <Card className="p-5">
          <div className="mb-5 flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[20px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.88)] text-[18px] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[1.125rem] font-semibold tracking-[-0.035em] text-[hsl(var(--fg))]">
                {displayName}
              </p>
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--brand)/0.3)] bg-[hsl(var(--brand)/0.08)] px-3 py-1 text-[11px] font-semibold tracking-[0.04em] text-[hsl(var(--brand))]">
                <ShieldCheck className="h-3 w-3" strokeWidth={2} />
                {roleLabel}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <AccountRow
              icon={Mail}
              label={t('account.emailLabel')}
              value={user?.email || t('account.noEmail')}
            />
            <AccountRow
              icon={User}
              label={t('account.nameLabel')}
              value={user?.full_name || t('account.noName')}
            />
          </div>
        </Card>
      </section>

      {/* Plan Section */}
      <section className="mb-6">
        <Card className="p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-[16px] ${
              isSubscribed
                ? 'bg-[hsl(var(--ok)/0.08)] text-[hsl(var(--ok))]'
                : 'bg-[hsl(var(--fg-3)/0.08)] text-[hsl(var(--fg-3))]'
            }`}>
              <Crown className="h-5 w-5" strokeWidth={1.8} />
            </div>
            <div>
              <h3 className="text-[16px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
                {t('account.planTitle')}
              </h3>
            </div>
          </div>

          <div className="mb-4 flex items-center justify-between rounded-[12px] bg-[hsl(var(--fill)/0.5)] px-4 py-3">
            <span className="text-[13px] text-[hsl(var(--fg-2))]">{t('account.currentPlan')}</span>
            <span className={`text-[15px] font-semibold ${isSubscribed ? 'text-[hsl(var(--ok))]' : 'text-[hsl(var(--fg))]'}`}>
              {planLabel}
            </span>
          </div>

          {!isSubscribed ? (
            <Button asChild className="w-full gap-2">
              <Link to={ROUTES.pricing}>
                <Crown className="h-4 w-4" />
                {t('account.upgradeCta')}
              </Link>
            </Button>
          ) : (
            <Button asChild variant="outline" className="w-full gap-2">
              <Link to="/billing">
                <CreditCard className="h-4 w-4" />
                {t('account.manageBilling')}
              </Link>
            </Button>
          )}
        </Card>
      </section>

      {/* Settings Links */}
      <section className="mb-6">
        <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">
          {t('account.settingsTitle')}
        </h3>
        <div className="space-y-3">
          <SettingsLink
            to={ROUTES.settings}
            icon={ShieldCheck}
            title={t('account.settingsLink')}
            subtitle={t('account.settingsSubtitle')}
          />
        </div>
      </section>

      {/* Danger Zone */}
      <section>
        <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--err)/0.8)]">
          {t('account.dangerZone')}
        </h3>
        <div className="space-y-3">
          <SettingsLink
            to="/settings/delete-account"
            icon={Trash2}
            title={t('account.deleteAccount')}
            subtitle={t('account.deleteAccountSubtitle')}
            danger
          />
        </div>
      </section>

      {/* Logout */}
      <section className="mt-8">
        <Button
          variant="outline"
          onClick={() => logout?.()}
          className="w-full gap-2"
        >
          <LogOut className="h-4 w-4" />
          {t('account.logOut')}
        </Button>
      </section>
    </AppContainer>
  );
}
