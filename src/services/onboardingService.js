import { supabase } from '@/lib/supabaseClient';
import { saveBMRSnapshot } from '@/services/bodyProgressService';

export const ONBOARDING_V3_STORAGE_KEY = 'atlas_onboarding_v3';
export const ONBOARDING_INTENT_STORAGE_KEY = 'atlas_onboarding_intent_v1';

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

export function readOnboardingIntentDraft() {
  return readJsonStorage(ONBOARDING_INTENT_STORAGE_KEY);
}

export function writeOnboardingIntentDraft(value) {
  writeJsonStorage(ONBOARDING_INTENT_STORAGE_KEY, value || {});
}

export function clearOnboardingIntentDraft() {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.removeItem(ONBOARDING_INTENT_STORAGE_KEY);
  } catch {}
}

export function seedOnboardingDraftFromIntent(intent = null) {
  const source = intent || readOnboardingIntentDraft();
  if (!source || typeof source !== 'object') return {};

  const seeded = {
    goal: source.goal || null,
    experience: source.experience || null,
    equipment: cleanArray(source.equipment),
    intent_started_at: source.startedAt || new Date().toISOString(),
  };

  const current = readOnboardingDraft();
  const next = {
    ...current,
    ...Object.fromEntries(
      Object.entries(seeded).filter(([, value]) => {
        if (Array.isArray(value)) return value.length > 0;
        return value !== null && value !== '';
      }),
    ),
  };

  writeOnboardingDraft(next);
  return next;
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
    dietary_preferences: {
      style: data?.dietaryStyle || null,
      restrictions: cleanArray(data?.dietaryRestrictions),
      avoided_foods: cleanString(data?.avoidFoods) || null,
    },
    coach_matching: {
      tone: data?.coachTone || null,
      focus: data?.coachFocus || null,
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
        dietaryStyle: data?.dietaryStyle || null,
        dietaryRestrictions: cleanArray(data?.dietaryRestrictions),
        avoidFoods: cleanString(data?.avoidFoods) || null,
        coachTone: data?.coachTone || null,
        coachFocus: data?.coachFocus || null,
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
    dietary_style: data?.dietaryStyle || null,
    coach_tone: data?.coachTone || null,
    coach_focus: data?.coachFocus || null,
  };
}

export async function finalizeOnboarding(userId, onboardingData = null) {
  if (!userId) {
    throw new Error('You must be signed in to complete onboarding.');
  }

  const startedAt = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  const sessionUserId = sessionData?.session?.user?.id || null;
  if (sessionError || !sessionUserId) {
    console.error('[onboarding] finalize blocked: no active auth session', {
      userId,
      sessionError: sessionError?.message || null,
    });
    throw new Error('Your session is not ready yet. Sign in again and retry onboarding.');
  }
  if (sessionUserId !== userId) {
    console.error('[onboarding] finalize blocked: session/user mismatch', {
      userId,
      sessionUserId,
    });
    throw new Error('Your session does not match this onboarding profile.');
  }

  const source = onboardingData || readOnboardingDraft();
  const profileData = buildProfileDataFromOnboarding(source);
  console.log('[onboarding] finalize start', {
    userId,
    answers: Object.keys(source || {}),
    targetCalories: profileData?.targets?.calories ?? null,
  });

  const { data: profileRow, error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      onboarding_completed: true,
      profile_data: profileData,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })
    .select('id,onboarding_completed,updated_at')
    .single();

  if (profileError) {
    console.error('[onboarding] profile upsert failed', {
      userId,
      code: profileError.code || null,
      message: profileError.message || null,
      details: profileError.details || null,
      hint: profileError.hint || null,
    });
    throw profileError;
  }

  const completedAt = new Date().toISOString();
  const authMetadata = {
    ...buildAuthMetadataFromOnboarding(source, profileData),
    onboarding_completed_at: completedAt,
  };
  const { error: authError } = await supabase.auth.updateUser({ data: authMetadata });
  if (authError) {
    console.error('[onboarding] auth metadata update failed', {
      userId,
      code: authError.code || null,
      message: authError.message || null,
      status: authError.status || null,
    });
    throw authError;
  }

  try {
    await saveBMRSnapshot(userId, {
      bmr: profileData?.onboarding_v3?.computed_plan?.bmr,
      tdee: profileData?.onboarding_v3?.computed_plan?.tdee,
    });
  } catch (snapshotError) {
    console.warn('[onboarding] BMR snapshot skipped', {
      userId,
      message: snapshotError?.message || null,
    });
  }

  clearOnboardingDraft();
  clearOnboardingIntentDraft();
  console.log('[onboarding] finalize complete', {
    userId,
    durationMs: Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - startedAt),
    profileUpdatedAt: profileRow?.updated_at || null,
    onboardingCompleted: profileRow?.onboarding_completed ?? null,
  });
  return profileData;
}
