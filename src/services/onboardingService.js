import { supabase } from '@/lib/supabaseClient';
import { saveBMRSnapshot } from '@/services/bodyProgressService';

export const ONBOARDING_V3_STORAGE_KEY = 'atlas_onboarding_v3';

function readJsonStorage(key) {
  if (typeof window === 'undefined') return {};

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeJsonStorage(key, value) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function readOnboardingDraft() {
  return readJsonStorage(ONBOARDING_V3_STORAGE_KEY);
}

export function writeOnboardingDraft(value) {
  writeJsonStorage(ONBOARDING_V3_STORAGE_KEY, value || {});
}

export function clearOnboardingDraft() {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.removeItem(ONBOARDING_V3_STORAGE_KEY);
  } catch {}
}

export function computeOnboardingPlan(data = {}) {
  const sex = data?.sex || 'male';
  const age = Number(data?.age) || 28;
  const heightCm = Number(data?.heightCm) || 178;
  const activity = Number(data?.activity) || 3;
  const goal = data?.goal || 'recomp';

  const weightKg = sex === 'male'
    ? 0.65 * heightCm - 38
    : 0.55 * heightCm - 30;

  const bmr = sex === 'male'
    ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
    : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;

  const multipliers = { 1: 1.2, 2: 1.375, 3: 1.55, 4: 1.725, 5: 1.9 };
  const tdee = Math.round(bmr * (multipliers[activity] || 1.55));

  const goalAdj = { lose: -500, recomp: -200, maintain: 0, gain: 300 };
  const calories = Math.round(tdee + (goalAdj[goal] || 0));

  const weightLb = Math.round(weightKg * 2.205);
  const proteinG = Math.round(weightLb);
  const fatG = Math.round((calories * 0.25) / 9);
  const carbsG = Math.round((calories - proteinG * 4 - fatG * 9) / 4);
  const proteinPct = Math.round((proteinG * 4 / calories) * 100);
  const carbsPct = Math.round((carbsG * 4 / calories) * 100);
  const fatPct = 100 - proteinPct - carbsPct;

  return {
    bmr: Math.round(bmr),
    tdee,
    calories,
    proteinG,
    carbsG,
    fatG,
    proteinPct,
    carbsPct,
    fatPct,
    estimatedWeightKg: Math.round(weightKg * 10) / 10,
  };
}

function parseFrequency(value) {
  const match = String(value || '').match(/(\d+)/);
  return match ? Number(match[1]) : null;
}

function parseSleepTarget(value) {
  const map = {
    lt6: 5.5,
    '6_7': 6.5,
    '7_8': 7.5,
    gt8: 8.5,
  };
  return map[value] ?? null;
}

function parseStepTarget(value) {
  const map = {
    '5k': 5000,
    '8k': 8000,
    '10k': 10000,
    '12k': 12000,
  };
  return map[value] ?? null;
}

function cleanArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export function buildProfileDataFromOnboarding(data = {}) {
  const plan = computeOnboardingPlan(data);
  const trainingDaysPerWeek = parseFrequency(data?.frequency) || Math.min((Number(data?.activity) || 3) + 1, 6);
  const sleepTargetHours = parseSleepTarget(data?.sleep);
  const stepsTarget = parseStepTarget(data?.steps);
  const waterTargetLiters = Number(data?.waterL) || null;

  return {
    sex: data?.sex || null,
    age: Number(data?.age) || null,
    height_cm: Number(data?.heightCm) || null,
    goal: data?.goal || null,
    activity_level: Number(data?.activity) || null,
    nutrition_mode: 'macros_only',
    calories_target: plan.calories,
    protein_target: plan.proteinG,
    carbs_target: plan.carbsG,
    fat_target: plan.fatG,
    sleep_target_hours: sleepTargetHours,
    steps_target: stepsTarget,
    water_target_liters: waterTargetLiters,
    training_days_per_week: trainingDaysPerWeek,
    training_experience: data?.experience || null,
    equipment: cleanArray(data?.equipment),
    constraints: {
      injuries: cleanArray(data?.injuries),
      medical: cleanArray(data?.medical),
      notes: cleanString(data?.notes) || null,
    },
    onboarding_v3: {
      completed_at: new Date().toISOString(),
      answers: {
        sex: data?.sex || null,
        age: Number(data?.age) || null,
        heightCm: Number(data?.heightCm) || null,
        goal: data?.goal || null,
        activity: Number(data?.activity) || null,
        experience: data?.experience || null,
        frequency: data?.frequency || null,
        equipment: cleanArray(data?.equipment),
        sleep: data?.sleep || null,
        steps: data?.steps || null,
        waterL: Number(data?.waterL) || null,
        injuries: cleanArray(data?.injuries),
        medical: cleanArray(data?.medical),
        notes: cleanString(data?.notes) || null,
      },
      computed_plan: plan,
    },
    targets: {
      calories: plan.calories,
      protein: plan.proteinG,
      carbs: plan.carbsG,
      fat: plan.fatG,
    },
  };
}

function buildAuthMetadataFromOnboarding(data = {}, profileData = {}) {
  const trainingDaysPerWeek = profileData.training_days_per_week ?? null;

  return {
    gender: data?.sex || null,
    height_cm: Number(data?.heightCm) || null,
    primary_goal: data?.goal || null,
    fitness_level: data?.experience || null,
    training_days_per_week: trainingDaysPerWeek,
    daily_calories_target: profileData.calories_target ?? null,
    daily_protein_target: profileData.protein_target ?? null,
    daily_carbs_target: profileData.carbs_target ?? null,
    daily_fat_target: profileData.fat_target ?? null,
  };
}

export async function finalizeOnboarding(userId, onboardingData = null) {
  if (!userId) {
    throw new Error('You must be signed in to complete onboarding.');
  }

  const source = onboardingData || readOnboardingDraft();
  const profileData = buildProfileDataFromOnboarding(source);

  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      onboarding_completed: true,
      profile_data: profileData,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });

  if (profileError) {
    throw profileError;
  }

  const authMetadata = buildAuthMetadataFromOnboarding(source, profileData);
  const { error: authError } = await supabase.auth.updateUser({ data: authMetadata });
  if (authError) {
    throw authError;
  }

  try {
    await saveBMRSnapshot(userId, {
      bmr: profileData?.onboarding_v3?.computed_plan?.bmr,
      tdee: profileData?.onboarding_v3?.computed_plan?.tdee,
    });
  } catch {}

  clearOnboardingDraft();
  return profileData;
}
