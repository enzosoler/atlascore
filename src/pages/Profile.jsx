import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Droplets,
  Flame,
  Loader2,
  LogOut,
  Mail,
  Ruler,
  Scale,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  UserCircle2,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/lib/i18nContext';
import { setLanguage } from '@/lib/i18n';
import { ROUTES } from '@/lib/routes';
import {
  ActionRow,
  AppContainer,
  Card,
  PageHeader,
  Section,
} from '@/components/shared/AppContainer';
import {
  ErrorState,
  LoadingState,
  SafePageBoundary,
  SectionCard,
  StatusBanner,
  formatNumber,
} from '@/components/shared/StablePage';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { base44 } from '@/api/base44Client';
import { supabase } from '@/lib/supabaseClient';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const EMPTY_FORM = {
  phone: '',
  age: '',
  height: '',
  current_weight: '',
  target_weight: '',
  training_goal: '',
  calories_target: '',
  protein_target: '',
  carbs_target: '',
  fat_target: '',
  water_target: '',
};

const NUMERIC_FIELDS = [
  'age',
  'height',
  'current_weight',
  'target_weight',
  'calories_target',
  'protein_target',
  'carbs_target',
  'fat_target',
  'water_target',
];

const LOCAL_PROFILE_STORAGE_KEY = 'atlas_local_profile_store';

function getProfileFormSections(t) {
  return [
    {
      eyebrow: 'Baseline',
      title: t('profile.sections.baselineTitle'),
      description: t('profile.sections.baselineDesc'),
      gridClassName: 'sm:grid-cols-2',
      fields: [
        {
          key: 'phone',
          label: t('profile.fields.phone'),
          type: 'tel',
          placeholder: '(11) 99999-0000',
          description: t('profile.fields.phoneDesc'),
        },
        {
          key: 'age',
          label: t('profile.fields.age'),
          type: 'number',
          step: '1',
          unit: t('profile.fields.ageUnit'),
          placeholder: '29',
          description: t('profile.fields.ageDesc'),
        },
        {
          key: 'height',
          label: t('profile.fields.height'),
          type: 'number',
          step: '1',
          unit: t('profile.fields.heightUnit'),
          placeholder: '178',
          description: t('profile.fields.heightDesc'),
        },
      ],
    },
    {
      eyebrow: 'Body',
      title: t('profile.sections.bodyTitle'),
      description: t('profile.sections.bodyDesc'),
      gridClassName: 'sm:grid-cols-2',
      fields: [
        {
          key: 'current_weight',
          label: t('profile.fields.currentWeight'),
          type: 'number',
          step: '0.1',
          unit: t('profile.fields.currentWeightUnit'),
          placeholder: '82.4',
          description: t('profile.fields.currentWeightDesc'),
        },
        {
          key: 'target_weight',
          label: t('profile.fields.targetWeight'),
          type: 'number',
          step: '0.1',
          unit: t('profile.fields.targetWeightUnit'),
          placeholder: '78.0',
          description: t('profile.fields.targetWeightDesc'),
        },
      ],
    },
    {
      eyebrow: 'Targets',
      title: t('profile.sections.targetsTitle'),
      description: t('profile.sections.targetsDesc'),
      gridClassName: 'sm:grid-cols-2',
      fields: [
        {
          key: 'calories_target',
          label: t('profile.fields.calories'),
          type: 'number',
          step: '1',
          unit: t('profile.fields.caloriesUnit'),
          placeholder: '2200',
          description: t('profile.fields.caloriesDesc'),
        },
        {
          key: 'protein_target',
          label: t('profile.fields.protein'),
          type: 'number',
          step: '1',
          unit: t('profile.fields.proteinUnit'),
          placeholder: '160',
          description: t('profile.fields.proteinDesc'),
        },
        {
          key: 'carbs_target',
          label: t('profile.fields.carbs'),
          type: 'number',
          step: '1',
          unit: t('profile.fields.carbsUnit'),
          placeholder: '240',
          description: t('profile.fields.carbsDesc'),
        },
        {
          key: 'fat_target',
          label: t('profile.fields.fat'),
          type: 'number',
          step: '1',
          unit: t('profile.fields.fatUnit'),
          placeholder: '60',
          description: t('profile.fields.fatDesc'),
        },
        {
          key: 'water_target',
          label: t('profile.fields.water'),
          type: 'number',
          step: '0.1',
          unit: t('profile.fields.waterUnit'),
          placeholder: '3.2',
          description: t('profile.fields.waterDesc'),
        },
      ],
    },
  ];
}

// ---------------------------------------------------------------------------
// Reset progress — entities to wipe and their display labels
// ---------------------------------------------------------------------------

function getResetEntities(t) {
  return [
    { entity: 'Workout',       label: t('profile.reset.entities.Workout') },
    { entity: 'ExerciseLog',   label: t('profile.reset.entities.ExerciseLog') },
    { entity: 'Measurement',   label: t('profile.reset.entities.Measurement') },
    { entity: 'ProgressPhoto', label: t('profile.reset.entities.ProgressPhoto') },
    { entity: 'FoodLog',       label: t('profile.reset.entities.FoodLog') },
    { entity: 'Meal',          label: t('profile.reset.entities.Meal') },
    { entity: 'Supplement',    label: t('profile.reset.entities.Supplement') },
    { entity: 'DailyCheckin',  label: t('profile.reset.entities.DailyCheckin') },
  ];
}

/**
 * Fetches all records from an entity (up to 1000) and deletes them in
 * parallel. Silently ignores entities that are empty or fail to list.
 */
async function wipeEntity(entityName) {
  try {
    const records = await base44.entities[entityName].list('-created_date', 1000);
    if (!records || records.length === 0) return;
    await Promise.all(records.map((r) => base44.entities[entityName].delete(r.id)));
  } catch {
    // Non-fatal: skip this entity and continue with the rest
  }
}

/**
 * Sequentially wipes every entity so we don't hammer the
 * backend with concurrent batch-deletes across all entity types at once.
 */
async function executeProgressReset(resetEntities) {
  for (const { entity } of resetEntities) {
    await wipeEntity(entity);
  }
}

// ---------------------------------------------------------------------------
// Local profile helpers
// ---------------------------------------------------------------------------

function readStoredProfiles() {
  if (typeof window === 'undefined') return {};

  try {
    const raw = window.localStorage.getItem(LOCAL_PROFILE_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeStoredProfiles(profiles) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LOCAL_PROFILE_STORAGE_KEY, JSON.stringify(profiles));
}

function getProfileScope(user) {
  return user?.email || user?.id || 'anonymous';
}

function createLocalProfileId(scope) {
  const normalizedScope = String(scope || 'anonymous')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `local-profile-${normalizedScope || 'anonymous'}`;
}

function buildProfilePayload(form) {
  return Object.entries(form).reduce((accumulator, [key, value]) => {
    accumulator[key] =
      value === '' || value == null ? '' : NUMERIC_FIELDS.includes(key) ? Number(value) : value;
    return accumulator;
  }, {});
}

async function loadLocalProfile(user) {
  // Try Supabase first (works on all devices including mobile)
  if (user?.id) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('profile_data')
        .eq('id', user.id)
        .single();
      if (!error && data?.profile_data && Object.keys(data.profile_data).length > 0) {
        // Auto-apply locale preference stored in the profile
        if (data.profile_data.locale) {
          setLanguage(data.profile_data.locale);
        }
        return data.profile_data;
      }
    } catch {
      // fall through to localStorage
    }
  }
  // Fallback: localStorage (for existing users / offline)
  const profiles = readStoredProfiles();
  const scope = getProfileScope(user);
  const profile = profiles[scope];
  return profile && typeof profile === 'object' ? profile : null;
}

async function saveLocalProfile(user, currentProfileId, payload) {
  const scope = getProfileScope(user);
  const profiles = readStoredProfiles();
  const existingProfile =
    profiles[scope] && typeof profiles[scope] === 'object' ? profiles[scope] : {};

  const nextProfile = {
    ...existingProfile,
    ...payload,
    id: currentProfileId || existingProfile.id || createLocalProfileId(scope),
  };

  // Write to localStorage (backward compat)
  profiles[scope] = nextProfile;
  writeStoredProfiles(profiles);

  // Write to Supabase (so it works on mobile/other devices)
  if (user?.id) {
    try {
      await supabase
        .from('profiles')
        .update({ profile_data: nextProfile })
        .eq('id', user.id);
    } catch {
      // non-fatal — localStorage copy is still valid
    }
  }

  return nextProfile;
}

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

function hasValue(value) {
  return value !== '' && value != null;
}

function getPreferredName(displayName) {
  if (!displayName) return 'Athlete';
  const [firstChunk] = displayName.split(/[ @]/).filter(Boolean);
  return firstChunk || displayName;
}

function getInitials(name) {
  const chunks = String(name || 'Athlete')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  return chunks.map((chunk) => chunk[0]?.toUpperCase() || '').join('') || 'AT';
}

function getRoleLabel(role) {
  const labels = {
    athlete: 'Athlete',
    coach: 'Coach',
    nutritionist: 'Nutritionist',
    clinician: 'Clinician',
    admin: 'Admin',
  };

  return labels[role] || 'Athlete';
}

function countFilledFields(form) {
  return Object.values(form).filter((value) => String(value || '').trim().length > 0).length;
}

function formatValue(value, suffix, options = {}) {
  if (!hasValue(value)) return '--';
  return `${formatNumber(value, options)} ${suffix}`;
}

function getReadinessCopy(score, t) {
  if (score >= 82) {
    return t('profile.readiness.high');
  }

  if (score >= 45) {
    return t('profile.readiness.medium');
  }

  return t('profile.readiness.low');
}

function getGoalSummary(goal, t) {
  if (!goal) {
    return t('profile.hero.noGoal');
  }

  const trimmedGoal = goal.trim();
  return trimmedGoal.length > 140 ? `${trimmedGoal.slice(0, 137).trim()}...` : trimmedGoal;
}

function getWeightDirection(currentWeight, targetWeight, t) {
  const hasCurrent = hasValue(currentWeight);
  const hasTarget = hasValue(targetWeight);

  if (hasCurrent && hasTarget) {
    const current = Number(currentWeight);
    const target = Number(targetWeight);
    const delta = target - current;
    const deltaValue = Math.abs(delta);

    if (delta === 0) {
      return {
        value: `${formatNumber(current, { maximumFractionDigits: 1 })} kg`,
        detail: t('profile.weightDirection.aligned'),
      };
    }

    const directionLabel = delta > 0 ? t('profile.weightDirection.gain') : t('profile.weightDirection.loss');
    const formattedDelta = formatNumber(deltaValue, { maximumFractionDigits: 1 });

    return {
      value: `${formatNumber(current, { maximumFractionDigits: 1 })} -> ${formatNumber(target, { maximumFractionDigits: 1 })} kg`,
      detail: delta > 0
        ? t('profile.weightDirection.gain').replace('{delta}', formattedDelta)
        : t('profile.weightDirection.loss').replace('{delta}', formattedDelta),
    };
  }

  if (hasCurrent) {
    return {
      value: `${formatNumber(currentWeight, { maximumFractionDigits: 1 })} kg`,
      detail: t('profile.weightDirection.noCurrent'),
    };
  }

  if (hasTarget) {
    return {
      value: `${formatNumber(targetWeight, { maximumFractionDigits: 1 })} kg`,
      detail: t('profile.weightDirection.noTarget'),
    };
  }

  return {
    value: t('profile.weightDirection.noData'),
    detail: t('profile.weightDirection.noDataDetail'),
  };
}

function getMacroSignature(form, t) {
  const parts = [
    hasValue(form.protein_target) ? `P ${formatNumber(form.protein_target)}g` : null,
    hasValue(form.carbs_target) ? `C ${formatNumber(form.carbs_target)}g` : null,
    hasValue(form.fat_target) ? `G ${formatNumber(form.fat_target)}g` : null,
  ].filter(Boolean);

  return parts.length ? parts.join(' · ') : t('profile.macros.pending');
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function HeroStat({ label, value, detail }) {
  return (
    <div className="rounded-[24px] border border-[hsl(var(--border)/0.9)] bg-[hsl(var(--card)/0.8)] px-4 py-4 shadow-[var(--shadow-xs)]">
      <p className="atlas-metric-label">{label}</p>
      <p className="mt-3 break-words text-[1.0625rem] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">
        {value}
      </p>
      <p className="mt-1 text-[13px] leading-6 text-[hsl(var(--fg-2))]">{detail}</p>
    </div>
  );
}

function QuickMetricCard({ label, value, detail, icon: Icon }) {
  return (
    <article className="atlas-card flex h-full flex-col justify-between px-5 py-5 lg:px-6 lg:py-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <p className="atlas-metric-label">{label}</p>
          <p className="text-[1.5rem] font-semibold tracking-[-0.05em] text-[hsl(var(--fg))]">
            {value}
          </p>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[20px] border border-[hsl(var(--border)/0.9)] bg-[hsl(var(--fill)/0.72)] text-[hsl(var(--fg-2))] shadow-[var(--shadow-xs)]">
          <Icon className="h-5 w-5" strokeWidth={1.9} />
        </div>
      </div>
      <p className="mt-5 text-[13px] leading-6 text-[hsl(var(--fg-2))]">{detail}</p>
    </article>
  );
}

function AccountDetail({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-[22px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.8)] px-4 py-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[18px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.72)] text-[hsl(var(--fg-2))]">
        <Icon className="h-4 w-4" strokeWidth={1.9} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--fg-3))]">
          {label}
        </p>
        <p className="mt-1 truncate text-[14px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
          {value}
        </p>
      </div>
    </div>
  );
}

function ReadoutItem({ label, value, detail }) {
  return (
    <div className="rounded-[24px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.82)] px-4 py-4 shadow-[var(--shadow-xs)]">
      <p className="atlas-metric-label">{label}</p>
      <p className="mt-3 text-[15px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
        {value}
      </p>
      <p className="mt-1 text-[13px] leading-6 text-[hsl(var(--fg-2))]">{detail}</p>
    </div>
  );
}

function ProfileField({ field, value, onChange, multiline = false }) {
  return (
    <label
      className={cn(
        'group block rounded-[26px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.82)] px-4 py-4 shadow-[var(--shadow-xs)] transition-all duration-200 focus-within:border-[hsl(var(--fg)/0.18)] focus-within:bg-[hsl(var(--card))]',
        field.className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
            {field.label}
          </p>
          {field.description ? (
            <p className="mt-1 text-[12px] leading-5 text-[hsl(var(--fg-2))]">
              {field.description}
            </p>
          ) : null}
        </div>

        {field.unit ? (
          <span className="shrink-0 rounded-full border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.7)] px-2.5 py-1 text-[11px] font-semibold tracking-[0.04em] text-[hsl(var(--fg-2))]">
            {field.unit}
          </span>
        ) : null}
      </div>

      {multiline ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={field.placeholder}
          className="mt-4 min-h-[140px] w-full resize-none border-0 bg-transparent p-0 text-[15px] leading-7 text-[hsl(var(--fg))] outline-none placeholder:text-[hsl(var(--fg-3))]"
        />
      ) : (
        <input
          type={field.type}
          step={field.step}
          value={value}
          onChange={onChange}
          placeholder={field.placeholder}
          inputMode={field.type === 'number' ? 'decimal' : undefined}
          className="mt-4 w-full border-0 bg-transparent p-0 text-[15px] font-medium tracking-[-0.02em] text-[hsl(var(--fg))] outline-none placeholder:text-[hsl(var(--fg-3))]"
        />
      )}
    </label>
  );
}

// ---------------------------------------------------------------------------
// ResetProgressModal
// ---------------------------------------------------------------------------

function ResetProgressModal({ open, onOpenChange, onConfirm, isLoading, error, resetEntities }) {
  const { t } = useI18n();
  const [confirmText, setConfirmText] = useState('');
  const canConfirm = confirmText === 'RESET' && !isLoading;

  // Clear the text field whenever the modal is closed
  useEffect(() => {
    if (!open) setConfirmText('');
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={isLoading ? undefined : onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mb-1 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[18px] bg-[hsl(var(--err)/0.1)] text-[hsl(var(--err))]">
              <AlertTriangle className="h-5 w-5" strokeWidth={1.9} />
            </div>
            <DialogTitle>{t('profile.reset.title')}</DialogTitle>
          </div>
          <DialogDescription>
            {t('profile.reset.desc')}
            <strong className="font-semibold text-[hsl(var(--err))]">
              {t('profile.reset.descStrong')}
            </strong>
            {t('profile.reset.descEnd')}
          </DialogDescription>
        </DialogHeader>

        {/* What gets deleted */}
        <div className="rounded-[20px] border border-[hsl(var(--err)/0.25)] bg-[hsl(var(--err)/0.05)] px-4 py-4">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--err))]">
            {t('profile.reset.whatGetsDeleted')}
          </p>
          <ul className="space-y-2">
            {resetEntities.map(({ entity, label }) => (
              <li
                key={entity}
                className="flex items-center gap-2 text-[14px] text-[hsl(var(--fg))]"
              >
                <Trash2
                  className="h-3.5 w-3.5 shrink-0 text-[hsl(var(--err)/0.65)]"
                  strokeWidth={1.8}
                />
                {label}
              </li>
            ))}
          </ul>
          <div className="mt-3 border-t border-[hsl(var(--err)/0.15)] pt-3">
            <p className="text-[13px] leading-5 text-[hsl(var(--fg-2))]">
              <span className="font-semibold text-[hsl(var(--ok))]">{t('profile.reset.preserved')}</span> {t('profile.reset.preservedItems')}
            </p>
          </div>
        </div>

        {/* Confirmation input */}
        <div className="space-y-2">
          <label
            htmlFor="reset-confirm-input"
            className="block text-[13px] font-semibold text-[hsl(var(--fg))]"
          >
            {t('profile.reset.typeToConfirm')}
          </label>
          <input
            id="reset-confirm-input"
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={t('profile.reset.placeholder')}
            disabled={isLoading}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className={cn(
              'atlas-field h-11 w-full px-4 text-base transition-colors',
              confirmText === 'RESET' &&
                'border-[hsl(var(--err)/0.5)] bg-[hsl(var(--err)/0.04)] focus:border-[hsl(var(--err)/0.7)]'
            )}
          />
        </div>

        {/* Error state */}
        {error ? (
          <div className="rounded-[16px] border border-[hsl(var(--err)/0.25)] bg-[hsl(var(--err)/0.06)] px-4 py-3 text-[14px] text-[hsl(var(--err))]">
            {error}
          </div>
        ) : null}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isLoading}>
              {t('profile.reset.cancel')}
            </Button>
          </DialogClose>
          <Button
            type="button"
            disabled={!canConfirm}
            onClick={onConfirm}
            className="gap-2 bg-[hsl(var(--err))] text-white hover:bg-[hsl(0,67%,46%)] disabled:opacity-40"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
                {t('profile.reset.confirming')}
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" strokeWidth={1.9} />
                {t('profile.reset.confirmBtn')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Page root
// ---------------------------------------------------------------------------

export default function Profile() {
  const { t } = useI18n();

  return (
    <SafePageBoundary
      title={t('profile.sections_labels.account')}
      subtitle={t('profile.statusBanner')}
      maxWidth="max-w-6xl"
      fallbackDescription={t('profile.statusBanner')}
    >
      <ProfileContent />
    </SafePageBoundary>
  );
}

// ---------------------------------------------------------------------------
// ProfileContent
// ---------------------------------------------------------------------------

function ProfileContent() {
  const qc = useQueryClient();
  const { user, logout } = useAuth();
  const { t, locale } = useI18n();
  const [form, setForm] = useState(EMPTY_FORM);
  const [profileId, setProfileId] = useState(null);
  const [notice, setNotice] = useState(null);

  // Reset progress modal state
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState(null);

  const profileScope = getProfileScope(user);
  const profileQueryKey = ['profile-stable', profileScope];

  const profileQuery = useQuery({
    queryKey: profileQueryKey,
    queryFn: () => loadLocalProfile(user),
  });

  const profileData =
    profileQuery.data && typeof profileQuery.data === 'object' ? profileQuery.data : null;

  useEffect(() => {
    if (!profileData) {
      setProfileId(null);
      setForm({ ...EMPTY_FORM });
      return;
    }

    setProfileId(profileData.id || null);
    setForm((current) => ({
      ...current,
      ...Object.fromEntries(
        Object.keys(EMPTY_FORM).map((field) => {
          const value = profileData[field];
          return [field, value == null ? '' : String(value)];
        })
      ),
    }));
  }, [profileData, profileScope]);

  const saveProfile = useMutation({
    mutationFn: (payload) => saveLocalProfile(user, profileId, payload),
    onSuccess: (result) => {
      if (!profileId && result?.id) setProfileId(result.id);
      qc.setQueryData(profileQueryKey, result);
      setNotice({
        tone: 'success',
        message: t('profile.sections_labels.successBanner'),
      });
    },
    onError: () => {
      setNotice({
        tone: 'error',
        message: t('profile.sections_labels.errorBanner'),
      });
    },
  });

  // -------------------------------------------------------------------------
  // Reset progress handler
  // -------------------------------------------------------------------------

  const handleProgressReset = async () => {
    setResetLoading(true);
    setResetError(null);

    try {
      const resetEntities = getResetEntities(t);
      await executeProgressReset(resetEntities);

      // Invalidate all cached entity queries so every page reflects the wipe
      await qc.invalidateQueries();

      setShowResetModal(false);
      setNotice({
        tone: 'success',
        message: t('profile.sections_labels.resetProgressDesc'),
      });
    } catch {
      setResetError(
        t('profile.statusBanner')
      );
    } finally {
      setResetLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // Derived values
  // -------------------------------------------------------------------------

  const displayName = user?.full_name || user?.email || 'Athlete';
  const preferredName = getPreferredName(displayName);
  const initials = getInitials(displayName);
  const roleLabel = getRoleLabel(user?.atlas_role);
  const filledFields = countFilledFields(form);
  const totalFields = Object.keys(EMPTY_FORM).length;
  const completionScore = Math.round((filledFields / totalFields) * 100);
  const readinessCopy = getReadinessCopy(completionScore, t);
  const weightDirection = getWeightDirection(form.current_weight, form.target_weight, t);
  const goalSummary = getGoalSummary(form.training_goal, t);
  const macroSignature = getMacroSignature(form, t);
  const calorieTargetValue = hasValue(form.calories_target)
    ? `${formatNumber(form.calories_target)} kcal`
    : t('profile.sections_labels.profileReadiness');
  const proteinTargetValue = formatValue(form.protein_target, 'g');
  const waterTargetValue = formatValue(form.water_target, 'L', { maximumFractionDigits: 1 });
  const draftStatus = profileId ? t('profile.sections_labels.saveProfile') : t('profile.sections_labels.firstSetup');
  const payload = buildProfilePayload(form);
  const profileFormSections = getProfileFormSections(t);
  const resetEntities = getResetEntities(t);

  // Calculate macros based on calories and training goal
  const calculateMacros = (calorieTarget, trainingGoal) => {
    if (!calorieTarget || calorieTarget === '') return {};
    
    const calories = Number(calorieTarget);
    let proteinRatio, carbsRatio, fatRatio;
    
    // Adjust macros based on training goal
    if (trainingGoal === 'hipertrofia' || trainingGoal === 'muscle gain') {
      proteinRatio = 0.30; // 30% protein
      carbsRatio = 0.45;   // 45% carbs
      fatRatio = 0.25;     // 25% fat
    } else if (trainingGoal === 'perda de peso' || trainingGoal === 'weight loss') {
      proteinRatio = 0.35; // 35% protein
      carbsRatio = 0.40;   // 40% carbs
      fatRatio = 0.25;     // 25% fat
    } else if (trainingGoal === 'força' || trainingGoal === 'strength') {
      proteinRatio = 0.32; // 32% protein
      carbsRatio = 0.48;   // 48% carbs
      fatRatio = 0.20;     // 20% fat
    } else {
      // Default balanced
      proteinRatio = 0.30;
      carbsRatio = 0.45;
      fatRatio = 0.25;
    }
    
    return {
      protein_target: String(Math.round((calories * proteinRatio) / 4)), // 4 cal per gram
      carbs_target: String(Math.round((calories * carbsRatio) / 4)),    // 4 cal per gram
      fat_target: String(Math.round((calories * fatRatio) / 9)),        // 9 cal per gram
    };
  };

  const handleFieldChange = (key) => (event) => {
    setNotice(null);
    const newValue = event.target.value;
    
    // Auto-calculate macros when calories or training goal changes
    if (key === 'calories_target' || key === 'training_goal') {
      const calorieTarget = key === 'calories_target' ? newValue : form.calories_target;
      const trainingGoal = key === 'training_goal' ? newValue : form.training_goal;
      
      const calculatedMacros = calculateMacros(calorieTarget, trainingGoal);
      setForm((current) => ({ 
        ...current, 
        [key]: newValue,
        ...calculatedMacros
      }));
    } else {
      setForm((current) => ({ ...current, [key]: newValue }));
    }
  };

  const handleReset = () => {
    setNotice(null);
    setForm({ ...EMPTY_FORM });
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <AppContainer>
      <PageHeader
        eyebrow={t('profile.sections_labels.account')}
        title={`${preferredName}, ${t('profile.pageTitle')}`}
        subtitle={t('profile.pageSubtitle')}
        accentClassName="from-[hsl(var(--brand)/0.08)] via-[hsl(var(--ok)/0.04)]"
        actions={
          <ActionRow>
            <Button asChild>
              <Link to={ROUTES.myDiet}>
                {t('profile.openMyDiet')}
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to={ROUTES.myWorkout}>{t('profile.openMyWorkout')}</Link>
            </Button>
          </ActionRow>
        }
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <HeroStat
            label={t('profile.sessionLabel')}
            value={t('profile.sessionValue')}
            detail={user?.email || t('profile.sessionDetail')}
          />
          <HeroStat
            label={t('profile.profileLabel')}
            value={`${completionScore}${t('profile.profileAligned')}`}
            detail={t('profile.fieldsFilledDetail').replace('{filled}', filledFields).replace('{total}', totalFields)}
          />
          <HeroStat label={t('profile.dailyFuel')} value={calorieTargetValue} detail={macroSignature} />
        </div>
      </PageHeader>

      <StatusBanner>
        {t('profile.statusBanner')}
      </StatusBanner>

      {notice?.message ? <StatusBanner tone={notice.tone}>{notice.message}</StatusBanner> : null}

      {profileQuery.isLoading ? (
        <LoadingState
          title={t('profile.loadingProfile')}
          description={t('profile.loadingProfileDesc')}
        />
      ) : null}

      {!profileQuery.isLoading && profileQuery.isError ? (
        <ErrorState
          title={t('profile.safeMode')}
          description={t('profile.safeModeDesc')}
        />
      ) : null}

      {!profileQuery.isLoading ? (
        <>
          <Section
            title={t('profile.sections.account')}
            subtitle={t('profile.sections.accountSubtitle')}
          >
            <Card className="px-5 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="atlas-overline">{t('profile.sections.account')}</p>
                  <p className="mt-3 text-[1.125rem] font-semibold tracking-[-0.035em] text-[hsl(var(--fg))]">
                    {t('profile.sections.accountDesc')}
                  </p>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[20px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.76)] text-[hsl(var(--fg-2))]">
                  <ShieldCheck className="h-4 w-4" strokeWidth={1.9} />
                </div>
              </div>

              <div className="mt-5 rounded-[20px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.42)] px-4 py-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.88)] text-[16px] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">
                    {initials}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-[1.0625rem] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">
                        {displayName}
                      </p>
                      <span className="rounded-full border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.82)] px-3 py-1 text-[11px] font-semibold tracking-[0.04em] text-[hsl(var(--fg-2))]">
                        {roleLabel}
                      </span>
                    </div>

                    <p className="mt-2 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
                      {t('profile.statusBanner')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <AccountDetail icon={Mail} label={t('profile.sections_labels.email')} value={user?.email || '--'} />
                <AccountDetail icon={UserCircle2} label={t('profile.sections_labels.readinessLabel')} value={roleLabel} />
                <AccountDetail icon={Sparkles} label={t('profile.sections_labels.profileReadiness')} value={draftStatus} />
              </div>

              <Button
                type="button"
                variant="outline"
                className="mt-5 w-full"
                onClick={() => logout?.()}
              >
                <LogOut className="h-4 w-4" strokeWidth={1.9} />
                {t('profile.sections_labels.logOut')}
              </Button>
            </Card>
          </Section>

          <section className="grid gap-4 sm:grid-cols-2">
            <QuickMetricCard
              label={t('profile.metrics.weightDirection')}
              value={weightDirection.value}
              detail={weightDirection.detail}
              icon={Scale}
            />
            <QuickMetricCard
              label={t('profile.metrics.calories')}
              value={calorieTargetValue}
              detail={
                hasValue(form.calories_target)
                  ? t('profile.metrics.calorieTargetSet')
                  : t('profile.metrics.calorieTargetNotSet')
              }
              icon={Flame}
            />
            <QuickMetricCard
              label={t('profile.metrics.protein')}
              value={proteinTargetValue}
              detail={
                hasValue(form.protein_target)
                  ? t('profile.metrics.proteinTargetSet')
                  : t('profile.metrics.proteinTargetNotSet')
              }
              icon={Target}
            />
            <QuickMetricCard
              label={t('profile.metrics.hydration')}
              value={waterTargetValue}
              detail={
                hasValue(form.water_target)
                  ? t('profile.metrics.hydrationTargetSet')
                  : t('profile.metrics.hydrationTargetNotSet')
              }
              icon={Droplets}
            />
          </section>

          <section className="grid gap-4">
            <SectionCard
              title={t('profile.sections_labels.profileSettings')}
              subtitle={t('profile.sections_labels.profileSettingsSubtitle')}
            >
              {!profileData ? (
                <div className="mb-6 rounded-[28px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--brand)/0.05)] px-5 py-5 shadow-[var(--shadow-xs)]">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[18px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.88)] text-[hsl(var(--brand))]">
                      <Sparkles className="h-4 w-4" strokeWidth={1.9} />
                    </div>
                    <div>
                      <p className="text-[15px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
                        {t('profile.sections_labels.firstSetup')}
                      </p>
                      <p className="mt-1 text-[14px] leading-6 text-[hsl(var(--fg-2))]">
                        {t('profile.sections_labels.firstSetupDesc')}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="mb-6 rounded-[28px] border border-[hsl(var(--border)/0.9)] bg-[hsl(var(--fill)/0.52)] px-5 py-5 shadow-[var(--shadow-xs)]">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="atlas-metric-label">{t('profile.hero.readiness')}</p>
                    <p className="mt-3 text-[2.25rem] font-semibold tracking-[-0.06em] text-[hsl(var(--fg))]">
                      {completionScore}%
                    </p>
                    <p className="mt-2 max-w-2xl text-[14px] leading-6 text-[hsl(var(--fg-2))]">
                      {readinessCopy}
                    </p>
                  </div>

                  <span className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.82)] px-3 py-1.5 text-[11px] font-semibold tracking-[0.04em] text-[hsl(var(--fg-2))]">
                    <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.9} />
                    {filledFields} de {totalFields} campos
                  </span>
                </div>

                <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-[hsl(var(--card))]">
                  <div
                    className="h-full rounded-full bg-[hsl(var(--fg))]"
                    style={{ width: `${completionScore}%` }}
                  />
                </div>
              </div>

              <div className="space-y-6">
                {profileFormSections.map((section) => (
                  <section
                    key={section.title}
                    className="rounded-[28px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.76)] px-5 py-5 shadow-[var(--shadow-xs)]"
                  >
                    <div className="mb-5">
                      <p className="atlas-overline">{section.eyebrow}</p>
                      <h3 className="mt-3 text-[1.0625rem] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">
                        {section.title}
                      </h3>
                      <p className="mt-2 text-[14px] leading-6 text-[hsl(var(--fg-2))]">
                        {section.description}
                      </p>
                    </div>

                    <div className={cn('grid gap-3', section.gridClassName)}>
                      {section.fields.map((field) => (
                        <ProfileField
                          key={field.key}
                          field={field}
                          value={form[field.key]}
                          onChange={handleFieldChange(field.key)}
                        />
                      ))}
                    </div>
                  </section>
                ))}

                <section className="rounded-[28px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.76)] px-5 py-5 shadow-[var(--shadow-xs)]">
                  <div className="mb-5">
                    <p className="atlas-overline">Direction</p>
                    <h3 className="mt-3 text-[1.0625rem] font-semibold tracking-[-0.03em] text-[hsl(var(--fg))]">
                      {t('profile.trainingGoalSection.title')}
                    </h3>
                    <p className="mt-2 text-[14px] leading-6 text-[hsl(var(--fg-2))]">
                      {t('profile.trainingGoalSection.subtitle')}
                    </p>
                  </div>

                  <ProfileField
                    multiline
                    field={{
                      key: 'training_goal',
                      label: t('profile.trainingGoalSection.label'),
                      placeholder: t('profile.trainingGoalSection.placeholder'),
                      description: t('profile.fields.trainingGoalDesc'),
                    }}
                    value={form.training_goal}
                    onChange={handleFieldChange('training_goal')}
                  />
                </section>
              </div>

              <div className="mt-8 rounded-[28px] border border-[hsl(var(--border)/0.9)] bg-[hsl(var(--fill)/0.52)] px-5 py-5 shadow-[var(--shadow-xs)]">
                <div className="flex flex-col gap-5">
                  <div className="max-w-2xl">
                    <p className="atlas-metric-label">{t('profile.sections_labels.persistenceLabel')}</p>
                    <p className="mt-3 text-[16px] font-semibold tracking-[-0.025em] text-[hsl(var(--fg))]">
                      {t('profile.sections_labels.persistenceDesc')}
                    </p>
                    <p className="mt-2 text-[14px] leading-6 text-[hsl(var(--fg-2))]">
                      {t('profile.sections_labels.persistenceDetail')}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" onClick={handleReset}>
                      {t('profile.sections_labels.clearFields')}
                    </Button>
                    <Button
                      type="button"
                      disabled={saveProfile.isPending}
                      onClick={() => saveProfile.mutate(payload)}
                    >
                      {saveProfile.isPending ? t('profile.sections_labels.saving') : t('profile.sections_labels.saveProfile')}
                    </Button>
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              className="relative overflow-hidden"
              title={t('profile.sections_labels.profileSummary')}
              subtitle={t('profile.sections_labels.profileSummarySubtitle')}
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[hsl(var(--brand)/0.07)] to-transparent" />

              <div className="relative space-y-5">
                <div className="rounded-[28px] border border-[hsl(var(--border)/0.9)] bg-[hsl(var(--card)/0.82)] px-5 py-5 shadow-[var(--shadow-xs)]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-[18px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.72)] text-[hsl(var(--brand))]">
                      <Target className="h-4 w-4" strokeWidth={1.9} />
                    </div>
                    <div>
                      <p className="atlas-metric-label">{t('profile.sections_labels.currentFocus')}</p>
                      <p className="mt-1 text-[15px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
                        {form.training_goal ? t('profile.sections_labels.goalDefined') : t('profile.sections_labels.directionPending')}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-[14px] leading-7 text-[hsl(var(--fg-2))]">
                    {goalSummary}
                  </p>
                </div>

                <ReadoutItem
                  label={t('profile.sections_labels.dailyConsumption')}
                  value={calorieTargetValue}
                  detail={
                    macroSignature === t('profile.macros.pending')
                      ? t('profile.trainingGoalSection.placeholder')
                      : macroSignature
                  }
                />
                <ReadoutItem
                  label={t('profile.sections_labels.bodyDirection')}
                  value={weightDirection.value}
                  detail={weightDirection.detail}
                />
                <ReadoutItem
                  label={t('profile.sections_labels.hydrationPace')}
                  value={waterTargetValue}
                  detail={
                    hasValue(form.water_target)
                      ? t('profile.metrics.hydrationTargetSet')
                      : t('profile.metrics.hydrationTargetNotSet')
                  }
                />
                <ReadoutItem
                  label={t('profile.sections_labels.structure')}
                  value={formatValue(form.height, 'cm')}
                  detail={
                    hasValue(form.height)
                      ? t('profile.fields.heightDesc')
                      : t('profile.weightDirection.noData')
                  }
                />

                <div className="rounded-[24px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.42)] px-4 py-4">
                  <p className="atlas-metric-label">{t('profile.sections_labels.whyMatters')}</p>
                  <p className="mt-3 text-[14px] leading-7 text-[hsl(var(--fg-2))]">
                    {t('profile.sections_labels.whyMattersDesc')}
                  </p>
                </div>

                <div className="rounded-[24px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--card)/0.82)] px-4 py-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[18px] border border-[hsl(var(--border)/0.82)] bg-[hsl(var(--fill)/0.72)] text-[hsl(var(--fg-2))]">
                      <Ruler className="h-4 w-4" strokeWidth={1.9} />
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
                        {t('profile.sections_labels.refinedForSpeed')}
                      </p>
                      <p className="mt-1 text-[13px] leading-6 text-[hsl(var(--fg-2))]">
                        {t('profile.sections_labels.refinedForSpeedDesc')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>
          </section>

          {/* ---------------------------------------------------------------- */}
          {/* Danger Zone                                                       */}
          {/* ---------------------------------------------------------------- */}
          <SectionCard
            title={t('profile.sections_labels.dangerZoneTitle')}
            subtitle={t('profile.sections_labels.dangerZoneSubtitleText')}
          >
            <div className="rounded-[24px] border border-[hsl(var(--err)/0.3)] bg-[hsl(var(--err)/0.04)] px-5 py-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[18px] bg-[hsl(var(--err)/0.1)] text-[hsl(var(--err))]">
                    <AlertTriangle className="h-4 w-4" strokeWidth={1.9} />
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold tracking-[-0.02em] text-[hsl(var(--fg))]">
                      {t('profile.sections_labels.resetProgressTitle')}
                    </p>
                    <p className="mt-1 max-w-lg text-[14px] leading-6 text-[hsl(var(--fg-2))]">
                      {t('profile.sections_labels.resetProgressDetail')}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="shrink-0 border-[hsl(var(--err)/0.4)] text-[hsl(var(--err))] hover:border-[hsl(var(--err)/0.6)] hover:bg-[hsl(var(--err)/0.08)] hover:text-[hsl(var(--err))]"
                  onClick={() => {
                    setResetError(null);
                    setShowResetModal(true);
                  }}
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.9} />
                  {t('profile.sections_labels.resetProgress')}
                </Button>
              </div>
            </div>
          </SectionCard>
        </>
      ) : null}

      {/* Reset progress confirmation modal */}
      <ResetProgressModal
        open={showResetModal}
        onOpenChange={setShowResetModal}
        onConfirm={handleProgressReset}
        isLoading={resetLoading}
        error={resetError}
        resetEntities={resetEntities}
      />
    </AppContainer>
  );
}
