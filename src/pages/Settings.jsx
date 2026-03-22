import React from 'react';
import { Link } from 'react-router-dom';
import {
  BellRing,
  Moon,
  Sun,
  User,
  Bell,
  Shield,
  ChevronRight,
  LogOut,
  FileOutput,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from '@/lib/ThemeContext';
import { useI18n } from '@/lib/i18nContext';
import { ROUTES } from '@/lib/routes';
import {
  PageShell,
  SafePageBoundary,
  SectionCard,
  StatusBanner,
  SecondaryButton,
} from '@/components/shared/StablePage';

// ── Theme option button ───────────────────────────────────────────────────────

function ThemeOption({ icon: Icon, label, value, currentTheme, onSelect }) {
  const active = currentTheme === value;
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={[
        'flex flex-1 flex-col items-center gap-2 rounded-[20px] border py-4 text-[13px] font-medium transition-all duration-200',
        active
          ? 'border-[hsl(var(--brand)/0.4)] bg-[hsl(var(--brand)/0.08)] text-[hsl(var(--brand))] shadow-[var(--shadow-xs)]'
          : 'border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.46)] text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--fill)/0.72)] hover:text-[hsl(var(--fg))]',
      ].join(' ')}
    >
      <Icon className="h-5 w-5" strokeWidth={1.9} />
      {label}
    </button>
  );
}

// ── Row link ──────────────────────────────────────────────────────────────────

function SettingsRow({ icon: Icon, label, description, href, onClick, destructive = false }) {
  const cls = [
    'flex w-full items-center gap-4 rounded-[20px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.46)] px-5 py-4 text-left transition-all duration-200',
    destructive
      ? 'hover:border-[hsl(var(--err)/0.3)] hover:bg-[hsl(var(--err)/0.06)]'
      : 'hover:bg-[hsl(var(--fill)/0.72)]',
  ].join(' ');

  const inner = (
    <>
      <div
        className={[
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-[16px] border',
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
          <p className="mt-0.5 text-[12px] leading-5 text-[hsl(var(--fg-2))]">{description}</p>
        ) : null}
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-[hsl(var(--fg-3))]" strokeWidth={1.8} />
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
  const { locale, setLocale, t } = useI18n();

  const handleLogout = async () => {
    if (window.confirm(t('settings.signout.confirm'))) {
      await logout?.();
    }
  };

  return (
    <PageShell
      title={t('settings.title')}
      subtitle={t('settings.subtitle')}
      maxWidth="max-w-2xl"
    >
      <StatusBanner>
        Configure appearance, access, and recovery actions without leaving the native atlas.core shell.
      </StatusBanner>

      {/* Account info */}
      <SectionCard
        title={t('settings.account.title')}
        subtitle={t('settings.account.subtitle')}
      >
        <div className="flex items-center gap-4 rounded-[20px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.3)] px-5 py-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--brand)/0.12)] text-[hsl(var(--brand))]">
            <User className="h-5 w-5" strokeWidth={1.9} />
          </div>
          <div className="min-w-0">
            <p className="text-[14px] font-semibold tracking-[-0.018em] text-[hsl(var(--fg))]">
              {user?.name || user?.email?.split('@')[0] || 'Usuário'}
            </p>
            <p className="mt-0.5 text-[13px] text-[hsl(var(--fg-2))]">{user?.email || '—'}</p>
          </div>
          <Link
            to={ROUTES.profile}
            className="ml-auto flex items-center gap-1.5 rounded-[14px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card))] px-3 py-2 text-[12px] font-medium text-[hsl(var(--fg-2))] transition-colors hover:text-[hsl(var(--fg))]"
          >
            {t('settings.account.editProfile')}
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
          </Link>
        </div>
      </SectionCard>

      {/* Appearance */}
      <SectionCard
        title={t('settings.appearance.title')}
        subtitle={t('settings.appearance.subtitle')}
      >
        <div className="flex gap-3">
          <ThemeOption
            icon={Sun}
            label={t('settings.appearance.light')}
            value="light"
            currentTheme={theme}
            onSelect={setTheme}
          />
          <ThemeOption
            icon={Moon}
            label={t('settings.appearance.dark')}
            value="dark"
            currentTheme={theme}
            onSelect={setTheme}
          />
        </div>

        <div className="mt-4 rounded-[20px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.46)] px-4 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[16px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card))] text-[hsl(var(--brand))]">
              <BellRing className="h-4 w-4" strokeWidth={1.9} />
            </div>
            <div className="min-w-0">
              <p className="text-[14px] font-semibold tracking-[-0.018em] text-[hsl(var(--fg))]">
                Dark-first mobile UI
              </p>
              <p className="mt-1 text-[12px] leading-5 text-[hsl(var(--fg-2))]">
                The app is tuned for the atlas.core dark interface. Light mode stays available, but dark preserves the intended contrast and hierarchy.
              </p>
            </div>
          </div>
        </div>
      </SectionCard>


      {/* Other links */}
      <SectionCard
        title={t('settings.more.title')}
        subtitle={t('settings.more.subtitle')}
      >
        <div className="space-y-3">
          <SettingsRow
            icon={User}
            label={t('settings.more.profile')}
            description={t('settings.more.profileDesc')}
            href={ROUTES.profile}
          />
          <SettingsRow
            icon={Shield}
            label={t('settings.more.privacy')}
            description={t('settings.more.privacyDesc')}
            href={ROUTES.export}
          />
          <SettingsRow
            icon={FileOutput}
            label="Exports"
            description="Generate CSV, JSON, and PDF exports with a controlled date range."
            href={ROUTES.export}
          />
          <SettingsRow
            icon={HelpCircle}
            label={t('settings.more.help')}
            description={t('settings.more.helpDesc')}
            href={ROUTES.help}
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Notifications and support"
        subtitle="Quiet defaults with clear recovery paths."
      >
        <div className="space-y-3">
          <div className="rounded-[20px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.3)] px-5 py-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[16px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card))] text-[hsl(var(--fg-2))]">
                <Bell className="h-4 w-4" strokeWidth={1.9} />
              </div>
              <div className="min-w-0">
                <p className="text-[14px] font-semibold tracking-[-0.018em] text-[hsl(var(--fg))]">
                  System prompts stay minimal
                </p>
                <p className="mt-1 text-[12px] leading-5 text-[hsl(var(--fg-2))]">
                  Trial notices, password changes, and session expirations follow the same calm iOS-style confirmation pattern used across the app.
                </p>
              </div>
            </div>
          </div>
          <Link to={ROUTES.help} className="inline-block">
            <SecondaryButton type="button">Open Help Center</SecondaryButton>
          </Link>
        </div>
      </SectionCard>

      {/* Danger zone */}
      <SectionCard
        title={t('settings.signout.title')}
        subtitle={t('settings.signout.subtitle')}
      >
        <SettingsRow
          icon={LogOut}
          label={t('settings.signout.label')}
          description={t('settings.signout.description')}
          onClick={handleLogout}
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
