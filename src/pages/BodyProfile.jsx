import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Activity,
  Ruler,
  Scale,
  Target,
  Save,
  RotateCcw,
  TrendingDown,
  TrendingUp,
  Minus,
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
  formatNumber,
} from '@/components/shared/StablePage';
import { Button } from '@/components/ui/button';
import {
  loadLocalProfile,
  saveLocalProfile,
  hasValue,
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
// Weight Direction Indicator
// ---------------------------------------------------------------------------

function WeightDirection({ current, target, t }) {
  const hasCurrent = hasValue(current);
  const hasTarget = hasValue(target);

  if (!hasCurrent || !hasTarget) {
    return (
      <div className="flex items-center gap-2 text-[13px] text-[hsl(var(--fg-2))]">
        <Minus className="h-4 w-4" />
        <span>{t('bodyProfile.setBothWeights')}</span>
      </div>
    );
  }

  const currentNum = Number(current);
  const targetNum = Number(target);
  const delta = targetNum - currentNum;

  if (delta === 0) {
    return (
      <div className="flex items-center gap-2 text-[13px] text-[hsl(var(--ok))]">
        <Minus className="h-4 w-4" />
        <span>{t('bodyProfile.maintainWeight')}</span>
      </div>
    );
  }

  if (delta > 0) {
    return (
      <div className="flex items-center gap-2 text-[13px] text-[hsl(var(--brand))]">
        <TrendingUp className="h-4 w-4" />
        <span>{t('bodyProfile.gainWeight').replace('{delta}', formatNumber(Math.abs(delta), { maximumFractionDigits: 1 }))}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-[13px] text-[hsl(var(--warn))]">
      <TrendingDown className="h-4 w-4" />
      <span>{t('bodyProfile.loseWeight').replace('{delta}', formatNumber(Math.abs(delta), { maximumFractionDigits: 1 }))}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Body Profile Page
// ---------------------------------------------------------------------------

export default function BodyProfile() {
  const { t } = useI18n();

  return (
    <SafePageBoundary
      title={t('profile.sections.body')}
      maxWidth="max-w-2xl"
      fallbackDescription={t('profile.sections.bodySubtitle')}
    >
      <BodyProfileContent />
    </SafePageBoundary>
  );
}

function BodyProfileContent() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    height: '',
    age: '',
    current_weight: '',
    target_weight: '',
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
      age: profileData.age || '',
      current_weight: profileData.current_weight || '',
      target_weight: profileData.target_weight || '',
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
        height: '',
        age: '',
        current_weight: '',
        target_weight: '',
      });
      return;
    }
    setForm({
      height: profileData.height || '',
      age: profileData.age || '',
      current_weight: profileData.current_weight || '',
      target_weight: profileData.target_weight || '',
    });
    setSaved(false);
  };

  // Calculate BMI if height and weight are available
  const heightM = Number(form.height) / 100;
  const weightKg = Number(form.current_weight);
  const bmi = heightM > 0 && weightKg > 0 ? weightKg / (heightM * heightM) : null;

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
        eyebrow={t('profile.sections.body')}
        title={t('bodyProfile.pageTitle')}
        subtitle={t('bodyProfile.pageSubtitle')}
        accentClassName="from-[hsl(var(--ok)/0.06)] via-[hsl(var(--brand)/0.02)]"
      />

      {/* Back link */}
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link to={ROUTES.profile} className="flex items-center gap-2 text-[hsl(var(--fg-2))]">
            <ArrowLeft className="h-4 w-4" />
            {t('bodyProfile.backToProfile')}
          </Link>
        </Button>
      </div>

      {/* Baseline Info */}
      <section className="mb-6">
        <Card className="p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[16px] bg-[hsl(var(--ok)/0.08)] text-[hsl(var(--ok))]">
              <Activity className="h-5 w-5" strokeWidth={1.8} />
            </div>
            <div>
              <h3 className="text-[16px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
                {t('bodyProfile.baselineTitle')}
              </h3>
              <p className="text-[13px] text-[hsl(var(--fg-2))]">{t('bodyProfile.baselineSubtitle')}</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <FormField
              label={t('profile.fields.height')}
              value={form.height}
              onChange={handleFieldChange('height')}
              unit={t('profile.fields.heightUnit')}
              placeholder="178"
              min="50"
              max="300"
              step="1"
            />
            <FormField
              label={t('profile.fields.age')}
              value={form.age}
              onChange={handleFieldChange('age')}
              unit={t('profile.fields.ageUnit')}
              placeholder="29"
              min="10"
              max="120"
              step="1"
            />
          </div>
        </Card>
      </section>

      {/* Weight Targets */}
      <section className="mb-6">
        <Card className="p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[16px] bg-[hsl(var(--brand)/0.08)] text-[hsl(var(--brand))]">
              <Scale className="h-5 w-5" strokeWidth={1.8} />
            </div>
            <div>
              <h3 className="text-[16px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
                {t('bodyProfile.weightTitle')}
              </h3>
              <p className="text-[13px] text-[hsl(var(--fg-2))]">{t('bodyProfile.weightSubtitle')}</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <FormField
              label={t('profile.fields.currentWeight')}
              value={form.current_weight}
              onChange={handleFieldChange('current_weight')}
              unit={t('profile.fields.currentWeightUnit')}
              placeholder="82.4"
              min="20"
              max="300"
              step="0.1"
            />
            <FormField
              label={t('profile.fields.targetWeight')}
              value={form.target_weight}
              onChange={handleFieldChange('target_weight')}
              unit={t('profile.fields.targetWeightUnit')}
              placeholder="78.0"
              min="20"
              max="300"
              step="0.1"
            />
          </div>

          {/* Weight direction preview */}
          <div className="mt-4 rounded-[12px] bg-[hsl(var(--fill)/0.5)] px-4 py-3">
            <WeightDirection
              current={form.current_weight}
              target={form.target_weight}
              t={t}
            />
          </div>
        </Card>
      </section>

      {/* BMI Preview (if available) */}
      {bmi !== null && (
        <section className="mb-6">
          <Card className="p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[16px] bg-[hsl(var(--warn)/0.08)] text-[hsl(var(--warn))]">
                <Target className="h-5 w-5" strokeWidth={1.8} />
              </div>
              <div>
                <h3 className="text-[16px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
                  {t('bodyProfile.bmiTitle')}
                </h3>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-[12px] bg-[hsl(var(--fill)/0.5)] px-4 py-3">
              <span className="text-[13px] text-[hsl(var(--fg-2))]">{t('bodyProfile.yourBmi')}</span>
              <span className="text-[17px] font-semibold text-[hsl(var(--fg))]">
                {formatNumber(bmi, { maximumFractionDigits: 1 })}
              </span>
            </div>
          </Card>
        </section>
      )}

      {/* Actions */}
      <section className="flex flex-col gap-3 sm:flex-row">
        <Button
          onClick={handleSave}
          disabled={saveProfile.isPending || saved}
          className="flex-1 gap-2"
        >
          {saved ? (
            <>{t('bodyProfile.saved')} ✓</>
          ) : saveProfile.isPending ? (
            <>{t('bodyProfile.saving')}...</>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {t('bodyProfile.saveChanges')}
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
          {t('bodyProfile.reset')}
        </Button>
      </section>
    </AppContainer>
  );
}
