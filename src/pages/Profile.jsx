import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Droplets,
  Flame,
  Scale,
  Target,
  Settings,
  User,
  Activity,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/lib/i18nContext';
import { ROUTES } from '@/lib/routes';
import {
  ActionRow,
  AppContainer,
  Card,
  PageHeader,
} from '@/components/shared/AppContainer';
import {
  ErrorState,
  LoadingState,
  SafePageBoundary,
  formatNumber,
} from '@/components/shared/StablePage';
import { Button } from '@/components/ui/button';
import {
  loadLocalProfile,
  hasValue,
  getPreferredName,
  getWeightDirection,
  getMacroSignature,
} from '@/lib/profileUtils';

// ---------------------------------------------------------------------------
// Summary Card Component
// ---------------------------------------------------------------------------

function SummaryCard({ icon: Icon, label, value, detail, to }) {
  return (
    <Link to={to} className="block">
      <Card className="h-full px-5 py-5 transition-all duration-200 hover:border-[hsl(var(--fg)/0.2)]">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <p className="atlas-metric-label">{label}</p>
            <p className="text-[1.375rem] font-semibold tracking-[-0.04em] text-[hsl(var(--fg))]">
              {value}
            </p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[16px] border border-[hsl(var(--border)/0.9)] bg-[hsl(var(--fill)/0.72)] text-[hsl(var(--fg-2))]">
            <Icon className="h-4 w-4" strokeWidth={1.9} />
          </div>
        </div>
        <p className="mt-4 text-[13px] leading-5 text-[hsl(var(--fg-2))]">{detail}</p>
      </Card>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Quick Action Link
// ---------------------------------------------------------------------------

function QuickAction({ to, icon: Icon, title, subtitle }) {
  return (
    <Link to={to} className="block">
      <div className="flex items-center gap-4 rounded-[20px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.8)] px-4 py-4 transition-all duration-200 hover:border-[hsl(var(--fg)/0.2)] hover:bg-[hsl(var(--card))]">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[16px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.72)] text-[hsl(var(--fg-2))]">
          <Icon className="h-4 w-4" strokeWidth={1.9} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
            {title}
          </p>
          <p className="text-[13px] text-[hsl(var(--fg-2))]">{subtitle}</p>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-[hsl(var(--fg-3))]" strokeWidth={1.8} />
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Main Profile Page
// ---------------------------------------------------------------------------

export default function Profile() {
  const { t } = useI18n();

  return (
    <SafePageBoundary
      title={t('profile.sections_labels.profile')}
      maxWidth="max-w-4xl"
      fallbackDescription={t('profile.pageSubtitle')}
    >
      <ProfileContent />
    </SafePageBoundary>
  );
}

function ProfileContent() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [form, setForm] = useState({
    height: '',
    current_weight: '',
    target_weight: '',
    calories_target: '',
    protein_target: '',
    carbs_target: '',
    fat_target: '',
    water_target: '',
  });

  const profileScope = user?.email || user?.id || 'anonymous';
  const profileQueryKey = ['profile-stable', profileScope];

  const profileQuery = useQuery({
    queryKey: profileQueryKey,
    queryFn: () => loadLocalProfile(user),
  });

  const profileData = profileQuery.data && typeof profileQuery.data === 'object' ? profileQuery.data : null;

  useEffect(() => {
    if (!profileData) return;
    setForm({
      height: profileData.height || '',
      current_weight: profileData.current_weight || '',
      target_weight: profileData.target_weight || '',
      calories_target: profileData.calories_target || '',
      protein_target: profileData.protein_target || '',
      carbs_target: profileData.carbs_target || '',
      fat_target: profileData.fat_target || '',
      water_target: profileData.water_target || '',
    });
  }, [profileData]);

  const displayName = user?.full_name || user?.email || 'Athlete';
  const preferredName = getPreferredName(displayName);

  const weightDirection = getWeightDirection(form.current_weight, form.target_weight, t);
  const macroSignature = getMacroSignature(form, t);

  const goalText = hasValue(form.target_weight) && hasValue(form.current_weight)
    ? Number(form.target_weight) < Number(form.current_weight)
      ? t('profile.goal.loseFat')
      : Number(form.target_weight) > Number(form.current_weight)
        ? t('profile.goal.gainMuscle')
        : t('profile.goal.maintain')
    : t('profile.goal.notSet');

  const calorieTargetValue = hasValue(form.calories_target)
    ? `${formatNumber(form.calories_target)} kcal`
    : t('profile.targets.notSet');

  const waterValue = hasValue(form.water_target)
    ? `${formatNumber(form.water_target, { maximumFractionDigits: 1 })} L`
    : t('profile.targets.notSet');

  if (profileQuery.isLoading) {
    return (
      <AppContainer>
        <LoadingState
          title={t('profile.loadingProfile')}
          description={t('profile.loadingProfileDesc')}
        />
      </AppContainer>
    );
  }

  if (profileQuery.isError) {
    return (
      <AppContainer>
        <ErrorState
          title={t('profile.safeMode')}
          description={t('profile.safeModeDesc')}
        />
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <PageHeader
        eyebrow={t('profile.sections_labels.yourSetup')}
        title={t('profile.overview.title')}
        subtitle={t('profile.overview.subtitle')}
        accentClassName="from-[hsl(var(--brand)/0.06)] via-[hsl(var(--ok)/0.02)]"
        actions={
          <ActionRow>
            <Button asChild variant="outline">
              <Link to={ROUTES.myDiet}>
                {t('profile.openMyDiet')}
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Link>
            </Button>
          </ActionRow>
        }
      />

      {/* Summary Cards - 4 key metrics only */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          icon={Target}
          label={t('profile.overview.goal')}
          value={goalText}
          detail={weightDirection.value}
          to={ROUTES.bodyProfile}
        />
        <SummaryCard
          icon={Flame}
          label={t('profile.overview.calories')}
          value={calorieTargetValue}
          detail={macroSignature}
          to={ROUTES.goals}
        />
        <SummaryCard
          icon={Scale}
          label={t('profile.overview.weightTarget')}
          value={weightDirection.value}
          detail={weightDirection.detail}
          to={ROUTES.bodyProfile}
        />
        <SummaryCard
          icon={Droplets}
          label={t('profile.overview.hydration')}
          value={waterValue}
          detail={hasValue(form.water_target) ? t('profile.metrics.hydrationTargetSet') : t('profile.metrics.hydrationTargetNotSet')}
          to={ROUTES.goals}
        />
      </section>

      {/* Quick Actions - Navigation to dedicated pages */}
      <section className="mt-8">
        <h3 className="mb-4 text-[13px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">
          {t('profile.overview.manageSections')}
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <QuickAction
            to={ROUTES.goals}
            icon={Flame}
            title={t('profile.sections.goals')}
            subtitle={t('profile.sections.goalsSubtitle')}
          />
          <QuickAction
            to={ROUTES.bodyProfile}
            icon={Activity}
            title={t('profile.sections.body')}
            subtitle={t('profile.sections.bodySubtitle')}
          />
          <QuickAction
            to={ROUTES.account}
            icon={User}
            title={t('profile.sections.account')}
            subtitle={t('profile.sections.accountSubtitle')}
          />
          <QuickAction
            to={ROUTES.settings}
            icon={Settings}
            title={t('profile.sections.settings')}
            subtitle={t('profile.sections.settingsSubtitle')}
          />
        </div>
      </section>

      {/* Edit CTA */}
      <section className="mt-8">
        <Card className="px-5 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[15px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
                {t('profile.overview.editPrompt')}
              </p>
              <p className="mt-1 text-[14px] text-[hsl(var(--fg-2))]">
                {t('profile.overview.editPromptSubtitle')}
              </p>
            </div>
            <Button asChild>
              <Link to={ROUTES.goals}>
                {t('profile.overview.editGoals')}
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Link>
            </Button>
          </div>
        </Card>
      </section>
    </AppContainer>
  );
}
