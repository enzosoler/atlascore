import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  ChevronRight,
  FileOutput,
  Globe,
  HelpCircle,
  Info,
  LogOut,
  MessageSquare,
  Moon,
  Palette,
  Shield,
  Sun,
  UtensilsCrossed,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from '@/lib/ThemeContext';
import { useI18n } from '@/lib/i18nContext';
import { locales, localeLabels } from '@/i18n/config';
import { ROUTES } from '@/lib/routes';
import {
  PageShell,
  SafePageBoundary,
  SectionCard,
} from '@/components/shared/StablePage';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

/* ─── Grouped row primitives (iOS Settings style) ─────────────────────────── */

function GroupedSection({ children }) {
  return (
    <div className="overflow-hidden rounded-[16px] border border-[hsl(var(--border)/0.72)] bg-[hsl(var(--card)/0.6)]">
      {children}
    </div>
  );
}

function DrillRow({ to, icon: Icon, label, value, isLast = false }) {
  return (
    <Link
      to={to}
      className={cn(
        'flex items-center gap-3.5 px-4 py-3 transition-colors hover:bg-[hsl(var(--fill)/0.52)]',
        !isLast && 'border-b border-[hsl(var(--border)/0.5)]',
      )}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[hsl(var(--fill)/0.7)] text-[hsl(var(--fg-2))]">
        <Icon className="h-4 w-4" strokeWidth={1.8} />
      </div>
      <span className="flex-1 text-[14px] font-medium tracking-[-0.01em] text-[hsl(var(--fg))]">
        {label}
      </span>
      {value && (
        <span className="text-[13px] text-[hsl(var(--fg-3))]">{value}</span>
      )}
      <ChevronRight className="h-4 w-4 shrink-0 text-[hsl(var(--fg-3)/0.6)]" />
    </Link>
  );
}

function ActionRow({ onClick, icon: Icon, label, value, destructive = false, isLast = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3.5 px-4 py-3 text-left transition-colors',
        destructive ? 'hover:bg-[hsl(var(--err)/0.04)]' : 'hover:bg-[hsl(var(--fill)/0.52)]',
        !isLast && 'border-b border-[hsl(var(--border)/0.5)]',
      )}
    >
      <div className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px]',
        destructive
          ? 'bg-[hsl(var(--err)/0.08)] text-[hsl(var(--err))]'
          : 'bg-[hsl(var(--fill)/0.7)] text-[hsl(var(--fg-2))]',
      )}>
        <Icon className="h-4 w-4" strokeWidth={1.8} />
      </div>
      <span className={cn(
        'flex-1 text-[14px] font-medium tracking-[-0.01em]',
        destructive ? 'text-[hsl(var(--err))]' : 'text-[hsl(var(--fg))]',
      )}>
        {label}
      </span>
      {value && (
        <span className="text-[13px] text-[hsl(var(--fg-3))]">{value}</span>
      )}
    </button>
  );
}

/* ─── Inline segmented control ────────────────────────────────────────────── */

function SegmentedControl({ options, value, onChange }) {
  return (
    <div className="flex items-center gap-1 rounded-[12px] bg-[hsl(var(--fill)/0.56)] p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'flex-1 rounded-[10px] px-3 py-2 text-[13px] font-medium transition-all',
            value === opt.value
              ? 'bg-[hsl(var(--card))] text-[hsl(var(--fg))] shadow-sm'
              : 'text-[hsl(var(--fg-3))] hover:text-[hsl(var(--fg-2))]',
          )}
        >
          {opt.icon && <opt.icon className="mr-1.5 inline h-3.5 w-3.5" strokeWidth={1.8} />}
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/* ─── Settings content ────────────────────────────────────────────────────── */

function SettingsContent() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { t, locale, switchLocale } = useI18n();

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

  const currentLangLabel = localeLabels[locale]?.split(' ')[0] || 'English';
  const nutritionLabel = nutritionMode === 'meal_plan' ? 'Meal plan' : 'Macros';

  return (
    <PageShell
      title={t('settings.title')}
      subtitle={t('settings.subtitle')}
      maxWidth="max-w-2xl"
    >
      {/* ── 1. Appearance ────────────────────────────────────────────── */}
      <SectionCard title={t('settings.interface.title')} subtitle={t('settings.interface.subtitle')}>
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-[12px] font-medium uppercase tracking-[0.06em] text-[hsl(var(--fg-3))]">Theme</p>
            <SegmentedControl
              options={[
                { value: 'dark', label: t('settings.appearance.dark'), icon: Moon },
                { value: 'light', label: t('settings.appearance.light'), icon: Sun },
              ]}
              value={theme}
              onChange={setTheme}
            />
            <p className="mt-2 text-[12px] text-[hsl(var(--fg-3))]">
              {t('settings.interface.darkModeNote')}
            </p>
          </div>

          <div>
            <p className="mb-2 text-[12px] font-medium uppercase tracking-[0.06em] text-[hsl(var(--fg-3))]">
              {t('settings.language.title')}
            </p>
            <SegmentedControl
              options={locales.map((loc) => ({
                value: loc,
                label: localeLabels[loc].split(' ')[0],
              }))}
              value={locale}
              onChange={switchLocale}
            />
          </div>
        </div>
      </SectionCard>

      {/* ── 2. Preferences ───────────────────────────────────────────── */}
      <SectionCard title="Preferences" subtitle="How Atlas tracks and notifies you.">
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-[12px] font-medium uppercase tracking-[0.06em] text-[hsl(var(--fg-3))]">
              {t('settings.nutritionMode.title')}
            </p>
            <SegmentedControl
              options={[
                { value: 'macros_only', label: t('settings.nutritionMode.macros') },
                { value: 'meal_plan', label: t('settings.nutritionMode.mealPlan') },
              ]}
              value={nutritionMode}
              onChange={handleNutritionModeChange}
            />
            <p className="mt-2 text-[12px] text-[hsl(var(--fg-3))]">
              {nutritionMode === 'meal_plan'
                ? t('settings.nutritionMode.mealPlanDesc')
                : t('settings.nutritionMode.macrosDesc')}
            </p>
          </div>

          <GroupedSection>
            <DrillRow
              to={ROUTES.notificationSettings}
              icon={Bell}
              label={t('settings.notifications.reminderLabel')}
              value="Manage"
            />
            <DrillRow
              to={ROUTES.integrations}
              icon={Palette}
              label="Integrations"
              value="Apple Health"
              isLast
            />
          </GroupedSection>
        </div>
      </SectionCard>

      {/* ── 3. Privacy & Data ────────────────────────────────────────── */}
      <SectionCard title={t('settings.data.title')} subtitle={t('settings.data.subtitle')}>
        <GroupedSection>
          <DrillRow
            to={ROUTES.export}
            icon={FileOutput}
            label={t('settings.data.exportLabel')}
            value="CSV, JSON, PDF"
          />
          <DrillRow
            to={ROUTES.settingsPrivacy}
            icon={Shield}
            label={t('settings.data.privacyLabel')}
            isLast
          />
        </GroupedSection>
      </SectionCard>

      {/* ── 4. Support ───────────────────────────────────────────────── */}
      <SectionCard title={t('settings.support.title')} subtitle={t('settings.support.subtitle')}>
        <GroupedSection>
          <DrillRow
            to={ROUTES.help}
            icon={HelpCircle}
            label={t('settings.support.helpLabel')}
          />
          <DrillRow
            to={`mailto:support@atlascore.app`}
            icon={MessageSquare}
            label="Contact support"
            isLast
          />
        </GroupedSection>
      </SectionCard>

      {/* ── 5. About ─────────────────────────────────────────────────── */}
      <SectionCard title="About">
        <GroupedSection>
          <DrillRow to={ROUTES.home} icon={Info} label="Terms of Service" />
          <DrillRow to={ROUTES.home} icon={Shield} label="Privacy Policy" />
          <div className="flex items-center gap-3.5 px-4 py-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[hsl(var(--fill)/0.7)] text-[hsl(var(--fg-2))]">
              <Globe className="h-4 w-4" strokeWidth={1.8} />
            </div>
            <span className="flex-1 text-[14px] font-medium tracking-[-0.01em] text-[hsl(var(--fg))]">
              Version
            </span>
            <span className="text-[13px] text-[hsl(var(--fg-3))]">1.0.0 (3)</span>
          </div>
        </GroupedSection>
      </SectionCard>

      {/* ── Session ──────────────────────────────────────────────────── */}
      <div className="pt-2">
        <Button variant="outline" onClick={handleLogout} className="w-full gap-2 text-[hsl(var(--fg-2))]">
          <LogOut className="h-4 w-4" />
          {t('settings.signout.label')}
        </Button>
      </div>
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
