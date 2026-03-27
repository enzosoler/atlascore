import { supabase } from '@/lib/supabaseClient';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const EMPTY_FORM = {
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

export const NUMERIC_FIELDS = [
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

// ---------------------------------------------------------------------------
// Local profile helpers
// ---------------------------------------------------------------------------

export function readStoredProfiles() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(LOCAL_PROFILE_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function writeStoredProfiles(profiles) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LOCAL_PROFILE_STORAGE_KEY, JSON.stringify(profiles));
}

export function getProfileScope(user) {
  return user?.email || user?.id || 'anonymous';
}

export function createLocalProfileId(scope) {
  const normalizedScope = String(scope || 'anonymous')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `local-profile-${normalizedScope || 'anonymous'}`;
}

export function buildProfilePayload(form) {
  return Object.entries(form).reduce((accumulator, [key, value]) => {
    accumulator[key] =
      value === '' || value == null ? '' : NUMERIC_FIELDS.includes(key) ? Number(value) : value;
    return accumulator;
  }, {});
}

export async function loadLocalProfile(user) {
  // Try Supabase first (works on all devices including mobile)
  if (user?.id) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('profile_data')
        .eq('id', user.id)
        .single();
      if (!error && data?.profile_data && Object.keys(data.profile_data).length > 0) {
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

export async function saveLocalProfile(user, currentProfileId, payload) {
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

export function hasValue(value) {
  return value !== '' && value != null;
}

export function getPreferredName(displayName) {
  if (!displayName) return 'Athlete';
  const [firstChunk] = displayName.split(/[ @]/).filter(Boolean);
  return firstChunk || displayName;
}

export function getInitials(name) {
  const chunks = String(name || 'Athlete')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  return chunks.map((chunk) => chunk[0]?.toUpperCase() || '').join('') || 'AT';
}

export function getRoleLabel(role) {
  const labels = {
    athlete: 'Athlete',
    coach: 'Coach',
    nutritionist: 'Nutritionist',
    clinician: 'Clinician',
    admin: 'Admin',
  };
  return labels[role] || 'Athlete';
}

export function countFilledFields(form) {
  return Object.values(form).filter((value) => String(value || '').trim().length > 0).length;
}

export function formatValue(value, suffix, options = {}) {
  if (!hasValue(value)) return '--';
  return `${formatNumber(value, options)} ${suffix}`;
}

export function formatNumber(value, options = {}) {
  if (value == null || value === '') return '--';
  const num = Number(value);
  if (Number.isNaN(num)) return '--';
  return num.toLocaleString(undefined, {
    maximumFractionDigits: 1,
    ...options,
  });
}

export function getReadinessCopy(score, t) {
  if (score >= 82) return t('profile.readiness.high');
  if (score >= 45) return t('profile.readiness.medium');
  return t('profile.readiness.low');
}

export function getGoalSummary(goal, t) {
  if (!goal) return t('profile.hero.noGoal');
  const trimmedGoal = goal.trim();
  return trimmedGoal.length > 140 ? `${trimmedGoal.slice(0, 137).trim()}...` : trimmedGoal;
}

export function getWeightDirection(currentWeight, targetWeight, t) {
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

    const formattedDelta = formatNumber(deltaValue, { maximumFractionDigits: 1 });
    return {
      value: `${formatNumber(current, { maximumFractionDigits: 1 })} → ${formatNumber(target, { maximumFractionDigits: 1 })} kg`,
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

export function getMacroSignature(form, t) {
  const parts = [
    hasValue(form.protein_target) ? `P ${formatNumber(form.protein_target)}g` : null,
    hasValue(form.carbs_target) ? `C ${formatNumber(form.carbs_target)}g` : null,
    hasValue(form.fat_target) ? `G ${formatNumber(form.fat_target)}g` : null,
  ].filter(Boolean);
  return parts.length ? parts.join(' · ') : t('profile.macros.pending');
}

// Calculate macros based on calories and training goal
export function calculateMacros(calorieTarget, trainingGoal) {
  if (!calorieTarget || calorieTarget === '') return {};

  const calories = Number(calorieTarget);
  let proteinRatio, carbsRatio, fatRatio;
  const normalizedGoal = String(trainingGoal || '').toLowerCase();

  if (normalizedGoal === 'muscle gain') {
    proteinRatio = 0.30;
    carbsRatio = 0.45;
    fatRatio = 0.25;
  } else if (normalizedGoal === 'weight loss') {
    proteinRatio = 0.35;
    carbsRatio = 0.40;
    fatRatio = 0.25;
  } else if (normalizedGoal === 'strength') {
    proteinRatio = 0.32;
    carbsRatio = 0.48;
    fatRatio = 0.20;
  } else {
    proteinRatio = 0.30;
    carbsRatio = 0.45;
    fatRatio = 0.25;
  }

  return {
    protein_target: String(Math.round((calories * proteinRatio) / 4)),
    carbs_target: String(Math.round((calories * carbsRatio) / 4)),
    fat_target: String(Math.round((calories * fatRatio) / 9)),
  };
}

// ---------------------------------------------------------------------------
// Reset progress helpers
// ---------------------------------------------------------------------------

export function getResetEntities(t) {
  return [
    { entity: 'Workout', label: t('profile.reset.entities.Workout') },
    { entity: 'ExerciseLog', label: t('profile.reset.entities.ExerciseLog') },
    { entity: 'Measurement', label: t('profile.reset.entities.Measurement') },
    { entity: 'ProgressPhoto', label: t('profile.reset.entities.ProgressPhoto') },
    { entity: 'FoodLog', label: t('profile.reset.entities.FoodLog') },
    { entity: 'Meal', label: t('profile.reset.entities.Meal') },
    { entity: 'Supplement', label: t('profile.reset.entities.Supplement') },
    { entity: 'DailyCheckin', label: t('profile.reset.entities.DailyCheckin') },
  ];
}

const ENTITY_TABLE_MAP = {
  ProgressPhoto: 'progress_photos',
  DailyCheckin:  'daily_checkins',
  Measurement:   'measurements',
};

async function wipeEntity(entityName) {
  const table = ENTITY_TABLE_MAP[entityName];
  if (!table) return; // Table not yet in Supabase — skip silently
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from(table).delete().eq('user_id', user.id);
  } catch {
    // Non-fatal: skip this entity and continue with the rest
  }
}

export async function executeProgressReset(resetEntities) {
  for (const { entity } of resetEntities) {
    await wipeEntity(entity);
  }
}

export function getTrainingGoalLabel(goal) {
  if (!goal) return null;
  const normalized = String(goal).toLowerCase();
  if (normalized.includes('muscle') || normalized.includes('gain')) return 'Gain Muscle';
  if (normalized.includes('loss') || normalized.includes('fat')) return 'Lose Fat';
  if (normalized.includes('strength')) return 'Build Strength';
  if (normalized.includes('maintain')) return 'Maintain';
  return goal.length > 30 ? goal.slice(0, 27) + '...' : goal;
}
