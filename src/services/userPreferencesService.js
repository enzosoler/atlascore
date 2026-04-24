import { supabase } from '@/lib/supabaseClient';

const LOCAL_PREFERENCES_KEY = 'atlas.user.preferences';
const DEFAULT_PREFERENCES = {
  dailyCheckinRequired: true,
};

function getScope(userId) {
  return userId || 'anonymous';
}

function readLocalPreferences() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(LOCAL_PREFERENCES_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeLocalPreferences(next) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LOCAL_PREFERENCES_KEY, JSON.stringify(next));
}

function normalizePreferences(preferences) {
  return {
    ...DEFAULT_PREFERENCES,
    ...(preferences && typeof preferences === 'object' ? preferences : {}),
  };
}

async function readProfileData(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('profile_data')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data?.profile_data && typeof data.profile_data === 'object' ? data.profile_data : {};
}

async function writeProfileData(userId, profileData) {
  const { error } = await supabase
    .from('profiles')
    .update({ profile_data: profileData })
    .eq('id', userId);

  if (error) throw error;
}

export async function loadUserPreferences(userId) {
  const localPrefs = readLocalPreferences();
  const localScoped = normalizePreferences(localPrefs[getScope(userId)]);

  if (!userId) {
    return localScoped;
  }

  try {
    const profileData = await readProfileData(userId);
    const profilePrefs = normalizePreferences(profileData?.preferences);
    const merged = { ...localScoped, ...profilePrefs };
    localPrefs[getScope(userId)] = merged;
    writeLocalPreferences(localPrefs);
    return merged;
  } catch {
    return localScoped;
  }
}

export async function updateUserPreferences(userId, partialPreferences) {
  const scope = getScope(userId);
  const localPrefs = readLocalPreferences();
  const nextLocal = {
    ...normalizePreferences(localPrefs[scope]),
    ...(partialPreferences && typeof partialPreferences === 'object' ? partialPreferences : {}),
  };

  localPrefs[scope] = nextLocal;
  writeLocalPreferences(localPrefs);

  if (!userId) {
    return nextLocal;
  }

  try {
    const profileData = await readProfileData(userId);
    const nextProfileData = {
      ...profileData,
      preferences: {
        ...normalizePreferences(profileData?.preferences),
        ...nextLocal,
      },
    };
    await writeProfileData(userId, nextProfileData);
    return normalizePreferences(nextProfileData.preferences);
  } catch (error) {
    throw error;
  }
}

export function getDefaultUserPreferences() {
  return { ...DEFAULT_PREFERENCES };
}
