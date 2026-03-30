import { supabase } from '@/lib/supabaseClient';

const CHECKINS_TABLE = 'daily_checkins';

function requireUserId(userId) {
  if (!userId) {
    throw new Error('User session is required to access check-in data.');
  }
}

function isMissingTableError(error) {
  if (!error) return false;
  if (error.code === 'PGRST205') return true;
  const message = `${error.message || ''} ${error.details || ''}`.toLowerCase();
  return message.includes('schema cache') || message.includes('does not exist') || message.includes('not found');
}

function localDateKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function toDateKey(value) {
  if (!value) return localDateKey();

  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return localDateKey();

  return localDateKey(parsed);
}

function normalizeCheckin(entry) {
  if (!entry || typeof entry !== 'object') return null;
  const date = toDateKey(entry.date);
  return { ...entry, date };
}

function sortByDateDesc(list) {
  return [...list].sort((a, b) => (b?.date || '').localeCompare(a?.date || ''));
}

async function readProfileData(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('profile_data')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  const profileData = data?.profile_data;
  return profileData && typeof profileData === 'object' ? profileData : {};
}

async function writeProfileData(userId, profileData) {
  const { error } = await supabase
    .from('profiles')
    .update({ profile_data: profileData })
    .eq('id', userId);

  if (error) {
    throw error;
  }
}

function getCheckinsFromProfile(profileData) {
  const raw = Array.isArray(profileData?.daily_checkins) ? profileData.daily_checkins : [];
  return raw.map(normalizeCheckin).filter(Boolean);
}

function applyDateRange(list, startDate, endDate) {
  let filtered = list;
  if (startDate) {
    filtered = filtered.filter((entry) => entry.date >= startDate);
  }
  if (endDate) {
    filtered = filtered.filter((entry) => entry.date <= endDate);
  }
  return filtered;
}

function buildCheckinPayload(userId, payload) {
  const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
  const normalized = {
    user_id: userId,
    date: toDateKey(payload?.date),
  };

  const numericFields = ['energy', 'mood', 'sleep_hours', 'hydration_liters'];
  for (const key of numericFields) {
    if (hasOwn(payload, key)) {
      const value = payload[key];
      normalized[key] =
        value === null || value === undefined || value === '' ? null : Number(value);
    }
  }

  if (hasOwn(payload, 'notes')) {
    normalized.notes = payload.notes === undefined ? null : payload.notes;
  }

  return normalized;
}

export async function listDailyCheckins(userId, options = {}) {
  requireUserId(userId);
  const { startDate, endDate, limit } = options;
  const startKey = startDate ? toDateKey(startDate) : null;
  const endKey = endDate ? toDateKey(endDate) : null;

  let query = supabase
    .from(CHECKINS_TABLE)
    .select('*')
    .eq('user_id', userId);

  if (startKey) query = query.gte('date', startKey);
  if (endKey) query = query.lte('date', endKey);

  query = query.order('date', { ascending: false });
  if (limit) query = query.limit(limit);

  const { data, error } = await query;

  if (error) {
    if (!isMissingTableError(error)) throw error;

    const profileData = await readProfileData(userId);
    let list = getCheckinsFromProfile(profileData);
    list = applyDateRange(list, startKey, endKey);
    list = sortByDateDesc(list);
    if (limit) list = list.slice(0, limit);
    return list;
  }

  return data || [];
}

export async function getDailyCheckin(userId, date) {
  requireUserId(userId);
  const dateKey = toDateKey(date);

  const { data, error } = await supabase
    .from(CHECKINS_TABLE)
    .select('*')
    .eq('user_id', userId)
    .eq('date', dateKey)
    .maybeSingle();

  if (error) {
    if (!isMissingTableError(error)) throw error;

    const profileData = await readProfileData(userId);
    const list = getCheckinsFromProfile(profileData);
    return list.find((entry) => entry.date === dateKey) || null;
  }

  return data || null;
}

export async function upsertDailyCheckin(userId, payload) {
  requireUserId(userId);
  const normalized = buildCheckinPayload(userId, payload || {});

  const { data, error } = await supabase
    .from(CHECKINS_TABLE)
    .upsert(normalized, { onConflict: 'user_id,date' })
    .select()
    .maybeSingle();

  if (error) {
    if (!isMissingTableError(error)) throw error;

    const profileData = await readProfileData(userId);
    const list = getCheckinsFromProfile(profileData);
    const existing = list.find((entry) => entry.date === normalized.date) || {};
    const nextEntry = {
      ...existing,
      ...normalized,
    };
    const { user_id: _ignoredUserId, ...cleanEntry } = nextEntry;

    const nextList = sortByDateDesc([
      ...list.filter((entry) => entry.date !== normalized.date),
      cleanEntry,
    ]);

    const nextProfile = {
      ...profileData,
      daily_checkins: nextList,
    };

    await writeProfileData(userId, nextProfile);

    return nextEntry;
  }

  return data || normalized;
}
