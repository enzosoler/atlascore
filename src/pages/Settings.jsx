import React, { useState, useEffect } from 'react';
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
  Shield,
  Clock,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from '@/lib/ThemeContext';
import { useI18n } from '@/lib/i18nContext';
import { locales, localeLabels } from '@/i18n/config';
import { useSubscription } from '@/lib/SubscriptionContext';
import { ROUTES } from '@/lib/routes';
import {
  formatBillingOwner,
  formatSubscriptionPlanLabel,
  getAccountDisplayName,
} from '@/lib/accountPresentation';
import {
  DataState,
  PageShell,
  SafePageBoundary,
  SectionCard,
} from '@/components/shared/StablePage';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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

// ── Nutrition mode option ─────────────────────────────────────────────────────

function NutritionModeOption({ emoji, label, description, value, currentMode, onSelect }) {
  const active = currentMode === value;
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={cn(
        'flex flex-1 flex-col items-start gap-1.5 rounded-[22px] border px-5 py-5 text-left transition-all duration-200',
        active
          ? 'border-[hsl(var(--brand)/0.4)] bg-[hsl(var(--brand)/0.08)] text-[hsl(var(--brand))] shadow-[var(--shadow-xs)]'
          : 'border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.46)] text-[hsl(var(--fg-2))] hover:bg-[hsl(var(--fill)/0.72)] hover:text-[hsl(var(--fg))]',
      )}
    >
      <span className="text-[18px] leading-none">{emoji}</span>
      <span className="text-[14px] font-semibold tracking-[-0.016em]">{label}</span>
      {description && (
        <span className="text-[12px] leading-4 opacity-80">{description}</span>
      )}
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
  const { t, locale, switchLocale } = useI18n();
  const { subscription } = useSubscription();

  // ── Nutrition mode ──
  const [nutritionMode, setNutritionMode] = useState('macros_only');

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from('profiles')
      .select('profile_data')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        const mode = data?.profile_data?.nutrition_mode;
        if (mode) setNutritionMode(mode);
      });
  }, [user?.id]);

  const handleNutritionModeChange = async (mode) => {
    setNutritionMode(mode);
    if (!user?.id) return;
    try {
      const { data: existing } = await supabase
        .from('profiles')
        .select('profile_data')
        .eq('id', user.id)
        .single();
      const pd = existing?.profile_data ?? {};
      const merged = { ...pd, nutrition_mode: mode };
      const { error } = await supabase
        .from('profiles')
        .update({ profile_data: merged })
        .eq('id', user.id);
      if (error) throw error;
      toast.success(t('settings.nutritionMode.saved'));
    } catch {
      toast.error(t('settings.nutritionMode.saveFailed'));
    }
  };

  const handleLogout = async () => {
    if (window.confirm(t('settings.signout.confirm'))) {
      await logout?.();
    }
  };

  const displayPlanName = formatSubscriptionPlanLabel(subscription) || t('settings.plan.free');
  const billingProviderLabel = formatBillingOwner(subscription);

  const intlLocale = locale === 'pt-BR' ? 'pt-BR' : locale === 'es' ? 'es' : 'en-US';
  const lastUpdated = new Date().toLocaleDateString(intlLocale, {
    month: 'short',
    day: 'numeric',
  });

  return (
    <PageShell maxWidth="max-w-2xl">
      {/* Control-plane summary */}
      <SectionCard
        title="Control plane"
        subtitle="Preferences live here. Account state, billing, and destructive actions stay in their own surfaces."
      >
        <DataState
          variant="neutral"
          eyebrow="Settings summary"
          meta={displayPlanName}
          title={`${getAccountDisplayName(user)} · ${billingProviderLabel}`}
          description={`Theme, language, nutrition mode, notifications, integrations, and data controls are managed here. Billing and destructive actions stay in Account.`}
          primaryAction={(
            <Button asChild variant="outline" size="sm" className="gap-1.5 shrink-0">
              <Link to={ROUTES.account}>
                Open account
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
              </Link>
            </Button>
          )}
          secondaryAction={(
            <div className="rounded-full bg-[hsl(var(--card)/0.8)] px-3 py-2 text-[12px] text-[hsl(var(--fg-3))]">
              Updated {lastUpdated}
            </div>
          )}
          note="Settings is the truthful control plane: safe preferences stay inline, deeper system controls open dedicated screens."
        />
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

      {/* Nutrition Mode */}
      <SectionCard
        title={t('settings.nutritionMode.title')}
        subtitle={t('settings.nutritionMode.subtitle')}
      >
        <div className="flex gap-3">
          <NutritionModeOption
            emoji={'\uD83C\uDFAF'}
            label={t('settings.nutritionMode.macros')}
            description={t('settings.nutritionMode.macrosDesc')}
            value="macros_only"
            currentMode={nutritionMode}
            onSelect={handleNutritionModeChange}
          />
          <NutritionModeOption
            emoji={'\uD83D\uDCCB'}
            label={t('settings.nutritionMode.mealPlan')}
            description={t('settings.nutritionMode.mealPlanDesc')}
            value="meal_plan"
            currentMode={nutritionMode}
            onSelect={handleNutritionModeChange}
          />
        </div>
      </SectionCard>

      <SectionCard title="Connected services" subtitle="Live sync status and device-level data connections.">
        <ControlRow
          icon={User}
          label="Integrations"
          description="Apple Health connection state, device availability, and roadmap integrations."
          href={ROUTES.integrations}
          meta="Atlas sync"
        />
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
            href={ROUTES.settingsPrivacy}
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
