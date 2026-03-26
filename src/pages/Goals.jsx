import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Flame,
  Droplets,
  Target,
  Beef,
  Wheat,
  Droplet,
  Save,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/lib/i18nContext';
import { ROUTES } from '@/lib/routes';
import {
  AppContainer,
  Card,
  PageHeader,
} from '@/components/shared/AppContainer';
import {
  ErrorState,
  LoadingState,
  SafePageBoundary,
} from '@/components/shared/StablePage';
import { Button } from '@/components/ui/button';
import {
  loadLocalProfile,
  saveLocalProfile,
  hasValue,
  formatNumber,
} from '@/lib/profileUtils';

// ---------------------------------------------------------------------------
// Input Field Component
// ---------------------------------------------------------------------------

function FormField({ label, value, onChange, unit, placeholder, type = 'number', min, max, step = '1', description }) {
  return (
    <label className="block rounded-[20px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.8)] px-4 py-4 transition-all duration-200 focus-within:border-[hsl(var(--fg)/0.18)] focus-within:bg-[hsl(var(--card))]">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
          {label}
        </span>
        {unit && (
          <span className="shrink-0 rounded-full border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.7)] px-2.5 py-1 text-[11px] font-semibold tracking-[0.04em] text-[hsl(var(--fg-2))]">
            {unit}
          </span>
        )}
      </div>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        className="mt-3 w-full border-0 bg-transparent p-0 text-[17px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))] outline-none placeholder:text-[hsl(var(--fg-3))]"
      />
      {description && (
        <p className="mt-2 text-[12px] text-[hsl(var(--fg-2))]">{description}</p>
      )}
    </label>
  );
}

// ---------------------------------------------------------------------------
// Summary Card
// ---------------------------------------------------------------------------

function SummaryCard({ icon: Icon, label, value, color = 'brand' }) {
  const colorClasses = {
    brand: 'bg-[hsl(var(--brand)/0.08)] text-[hsl(var(--brand))]',
    ok: 'bg-[hsl(var(--ok)/0.08)] text-[hsl(var(--ok))]',
    warn: 'bg-[hsl(var(--warn)/0.08)] text-[hsl(var(--warn))]',
  };

  return (
    <div className="flex items-center gap-3 rounded-[16px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.6)] px-4 py-3">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] ${colorClasses[color]}`}>
        <Icon className="h-4 w-4" strokeWidth={1.9} />
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">
          {label}
        </p>
        <p className="text-[15px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
          {value}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Goals Page
// ---------------------------------------------------------------------------

export default function Goals() {
  const { t } = useI18n();

  return (
    <SafePageBoundary
      title={t('profile.sections.goals')}
      maxWidth="max-w-2xl"
      fallbackDescription={t('profile.sections.goalsSubtitle')}
    >
      <GoalsContent />
    </SafePageBoundary>
  );
}

function GoalsContent() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
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
      calories_target: profileData.calories_target || '',
      protein_target: profileData.protein_target || '',
      carbs_target: profileData.carbs_target || '',
      fat_target: profileData.fat_target || '',
      water_target: profileData.water_target || '',
    });
  }, [profileData]);

  const saveProfile = useMutation({
    mutationFn: (payload) => saveLocalProfile(user, profileData?.id, payload),
    onSuccess: (result) => {
      qc.setQueryData(profileQueryKey, result);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const handleFieldChange = (key) => (e) => {
    setForm((current) => ({ ...current, [key]: e.target.value }));
    setSaved(false);
  };

  const handleSave = () => {
    const payload = {
      ...profileData,
      ...form,
    };
    saveProfile.mutate(payload);
  };

  const handleReset = () => {
    if (!profileData) {
      setForm({
        calories_target: '',
        protein_target: '',
        carbs_target: '',
        fat_target: '',
        water_target: '',
      });
      return;
    }
    setForm({
      calories_target: profileData.calories_target || '',
      protein_target: profileData.protein_target || '',
      carbs_target: profileData.carbs_target || '',
      fat_target: profileData.fat_target || '',
      water_target: profileData.water_target || '',
    });
    setSaved(false);
  };

  // Calculate macro percentages
  const totalCalories = Number(form.calories_target) || 0;
  const proteinCals = (Number(form.protein_target) || 0) * 4;
  const carbsCals = (Number(form.carbs_target) || 0) * 4;
  const fatCals = (Number(form.fat_target) || 0) * 9;
  const totalMacroCals = proteinCals + carbsCals + fatCals;

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
        eyebrow={t('profile.sections.goals')}
        title={t('goals.pageTitle')}
        subtitle={t('goals.pageSubtitle')}
        accentClassName="from-[hsl(var(--brand)/0.06)] via-[hsl(var(--warn)/0.02)]"
      />

      {/* Back link */}
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link to={ROUTES.profile} className="flex items-center gap-2 text-[hsl(var(--fg-2))]">
            <ArrowLeft className="h-4 w-4" />
            {t('goals.backToProfile')}
          </Link>
        </Button>
      </div>

      {/* Current Summary */}
      <section className="mb-6">
        <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--fg-3))]">
          {t('goals.currentSummary')}
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <SummaryCard
            icon={Flame}
            label={t('profile.overview.calories')}
            value={hasValue(form.calories_target) ? `${formatNumber(form.calories_target)} kcal` : t('profile.targets.notSet')}
            color="brand"
          />
          <SummaryCard
            icon={Droplets}
            label={t('profile.overview.hydration')}
            value={hasValue(form.water_target) ? `${formatNumber(form.water_target, { maximumFractionDigits: 1 })} L` : t('profile.targets.notSet')}
            color="ok"
          />
        </div>
      </section>

      {/* Calorie Target */}
      <section className="mb-6">
        <Card className="p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[16px] bg-[hsl(var(--brand)/0.08)] text-[hsl(var(--brand))]">
              <Flame className="h-5 w-5" strokeWidth={1.8} />
            </div>
            <div>
              <h3 className="text-[16px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
                {t('goals.caloriesTitle')}
              </h3>
              <p className="text-[13px] text-[hsl(var(--fg-2))]">{t('goals.caloriesSubtitle')}</p>
            </div>
          </div>

          <FormField
            label={t('profile.fields.calories')}
            value={form.calories_target}
            onChange={handleFieldChange('calories_target')}
            unit={t('profile.fields.caloriesUnit')}
            placeholder="2200"
            min="500"
            max="10000"
            step="50"
          />
        </Card>
      </section>

      {/* Macro Targets */}
      <section className="mb-6">
        <Card className="p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[16px] bg-[hsl(var(--warn)/0.08)] text-[hsl(var(--warn))]">
              <Target className="h-5 w-5" strokeWidth={1.8} />
            </div>
            <div>
              <h3 className="text-[16px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
                {t('goals.macrosTitle')}
              </h3>
              <p className="text-[13px] text-[hsl(var(--fg-2))]">{t('goals.macrosSubtitle')}</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <FormField
              label={t('profile.fields.protein')}
              value={form.protein_target}
              onChange={handleFieldChange('protein_target')}
              unit={t('profile.fields.proteinUnit')}
              placeholder="160"
              min="0"
              max="500"
              step="5"
              description={hasValue(form.protein_target) ? `${Math.round((proteinCals / totalCalories) * 100) || 0}%` : ''}
            />
            <FormField
              label={t('profile.fields.carbs')}
              value={form.carbs_target}
              onChange={handleFieldChange('carbs_target')}
              unit={t('profile.fields.carbsUnit')}
              placeholder="240"
              min="0"
              max="1000"
              step="5"
              description={hasValue(form.carbs_target) ? `${Math.round((carbsCals / totalCalories) * 100) || 0}%` : ''}
            />
            <FormField
              label={t('profile.fields.fat')}
              value={form.fat_target}
              onChange={handleFieldChange('fat_target')}
              unit={t('profile.fields.fatUnit')}
              placeholder="60"
              min="0"
              max="300"
              step="5"
              description={hasValue(form.fat_target) ? `${Math.round((fatCals / totalCalories) * 100) || 0}%` : ''}
            />
          </div>

          {totalMacroCals > 0 && totalCalories > 0 && (
            <div className="mt-4 rounded-[12px] bg-[hsl(var(--fill)/0.5)] px-4 py-3">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-[hsl(var(--fg-2))]">{t('goals.macroTotal')}</span>
                <span className={Math.abs(totalMacroCals - totalCalories) < 50 ? 'font-semibold text-[hsl(var(--ok))]' : 'font-semibold text-[hsl(var(--warn))]'}>
                  {formatNumber(totalMacroCals)} / {formatNumber(totalCalories)} kcal
                </span>
              </div>
            </div>
          )}
        </Card>
      </section>

      {/* Hydration Target */}
      <section className="mb-6">
        <Card className="p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[16px] bg-[hsl(var(--ok)/0.08)] text-[hsl(var(--ok))]">
              <Droplets className="h-5 w-5" strokeWidth={1.8} />
            </div>
            <div>
              <h3 className="text-[16px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
                {t('goals.hydrationTitle')}
              </h3>
              <p className="text-[13px] text-[hsl(var(--fg-2))]">{t('goals.hydrationSubtitle')}</p>
            </div>
          </div>

          <FormField
            label={t('profile.fields.water')}
            value={form.water_target}
            onChange={handleFieldChange('water_target')}
            unit={t('profile.fields.waterUnit')}
            placeholder="3.0"
            min="0.5"
            max="10"
            step="0.1"
          />
        </Card>
      </section>

      {/* Actions */}
      <section className="flex flex-col gap-3 sm:flex-row">
        <Button
          onClick={handleSave}
          disabled={saveProfile.isPending || saved}
          className="flex-1 gap-2"
        >
          {saved ? (
            <>{t('goals.saved')} ✓</>
          ) : saveProfile.isPending ? (
            <>{t('goals.saving')}...</>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {t('goals.saveChanges')}
            </>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={saveProfile.isPending}
          className="gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          {t('goals.reset')}
        </Button>
      </section>
    </AppContainer>
  );
}
