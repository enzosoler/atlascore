import { supabase } from '@/lib/supabaseClient';
import {
  MEASUREMENT_FIELD_DEFINITIONS,
  normalizeMeasurementEntry,
  prepareMeasurementWritePayload,
} from '@/lib/measurementModel';
import { stripExif, resizeImage } from '@/lib/imageUtils';

const MEASUREMENTS_TABLE = 'measurements';
const PROGRESS_PHOTOS_TABLE = 'progress_photos';
const STORAGE_BUCKET = 'progress-photos';
const SUPABASE_URL_PREFIX = `supabase://${STORAGE_BUCKET}/`;

function requireUserId(userId) {
  if (!userId) {
    throw new Error('User session is required to access body progress data.');
  }
}

function isMissingTableError(error) {
  const message = error?.message || '';
  return (
    error?.code === 'PGRST205' ||
    error?.code === '42P01' ||
    /schema cache/i.test(message) ||
    /could not find the table/i.test(message) ||
    /relation .* does not exist/i.test(message)
  );
}

function hasOwnField(payload, key) {
  return !!payload && Object.prototype.hasOwnProperty.call(payload, key);
}

function isEmptyMeasurementValue(value) {
  return value === null || value === undefined || (typeof value === 'string' && value.trim() === '');
}

function getClearedMeasurementColumns(payload) {
  if (!payload || typeof payload !== 'object') {
    return {};
  }

  const cleared = {};

  for (const field of MEASUREMENT_FIELD_DEFINITIONS) {
    const candidateKeys = [field.key, field.storageKey, ...field.aliases];
    const explicitKey = candidateKeys.find((key) => hasOwnField(payload, key));

    if (!explicitKey) {
      continue;
    }

    if (isEmptyMeasurementValue(payload[explicitKey])) {
      cleared[field.storageKey] = null;
    }
  }

  for (const legacyKey of ['arms', 'thighs']) {
    if (hasOwnField(payload, legacyKey) && isEmptyMeasurementValue(payload[legacyKey])) {
      cleared[legacyKey] = null;
    }
  }

  return cleared;
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

function sanitizeFilename(name = 'photo') {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase() || 'photo';
}

function buildSupabaseStorageRef(path) {
  return `${SUPABASE_URL_PREFIX}${path}`;
}

function isSupabaseStorageRef(value) {
  return typeof value === 'string' && value.startsWith(SUPABASE_URL_PREFIX);
}

function getStoragePathFromRef(value) {
  return isSupabaseStorageRef(value) ? value.slice(SUPABASE_URL_PREFIX.length) : null;
}

async function fetchProfileData(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('profile_data')
    .eq('id', userId)
    .single();

  if (error) {
    if (error?.code === 'PGRST116' || /results contain 0 rows/i.test(error?.message || '')) {
      return {};
    }
    throw error;
  }

  return data?.profile_data && typeof data.profile_data === 'object' ? data.profile_data : {};
}

async function updateProfileData(userId, updater) {
  const existing = await fetchProfileData(userId);
  const next = updater(existing || {});
  const { data, error } = await supabase
    .from('profiles')
    .update({ profile_data: next })
    .eq('id', userId)
    .select('profile_data')
    .single();

  if (error) {
    throw error;
  }

  return data?.profile_data || next;
}

function coerceArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeProgressPhotoEntry(entry) {
  if (!entry || typeof entry !== 'object') {
    return null;
  }

  const dateValue = entry.date ? toDateKey(entry.date) : null;
  const category = entry.category ?? null;
  const photoUrl = entry.photo_url ?? null;
  const id = entry.id || (dateValue && category ? `${dateValue}-${category}` : undefined);

  return {
    id,
    date: dateValue,
    category,
    photo_url: photoUrl,
  };
}

async function resolvePhotoUrl(photo) {
  if (!photo?.photo_url) {
    return photo;
  }

  const storagePath = getStoragePathFromRef(photo.photo_url);
  if (!storagePath) {
    return photo;
  }

  // 24-hour TTL (86400s) so images survive long browsing sessions and
  // don't break if the user leaves the tab open overnight.
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(storagePath, 86400);

  if (error) {
    throw error;
  }

  return {
    ...photo,
    storage_path: storagePath,
    photo_url: data?.signedUrl || photo.photo_url,
  };
}

async function uploadToSupabaseStorage(userId, file) {
  const ext = file?.name?.split('.').pop() || 'jpg';
  const safeName = sanitizeFilename(file?.name || 'progress-photo');
  const filePath = `${userId}/${Date.now()}-${safeName}.${ext}`.replace(
    /\.(jpg|jpeg|png|webp|gif|heic)\.(jpg|jpeg|png|webp|gif|heic)$/i,
    '.$1'
  );

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, file, { upsert: false, contentType: file?.type || undefined });

  if (error) {
    throw error;
  }

  return buildSupabaseStorageRef(filePath);
}


export async function listMeasurements(userId, limit = 200) {
  requireUserId(userId);

  const { data, error } = await supabase
    .from(MEASUREMENTS_TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return (data || []).map((measurement) => normalizeMeasurementEntry(measurement));
}

export async function createMeasurement(userId, payload) {
  requireUserId(userId);

  const writePayload = prepareMeasurementWritePayload(payload);
  const dateKey = writePayload.date || toDateKey(payload?.date);

  const { data: existing, error: existingError } = await supabase
    .from(MEASUREMENTS_TABLE)
    .select('id')
    .eq('user_id', userId)
    .eq('date', dateKey)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (existing?.id) {
    return updateMeasurement(userId, existing.id, payload);
  }

  const { data, error } = await supabase
    .from(MEASUREMENTS_TABLE)
    .insert({
      ...writePayload,
      user_id: userId,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return normalizeMeasurementEntry(data);
}

export async function updateMeasurement(userId, id, payload) {
  requireUserId(userId);

  const { data: existing, error: existingError } = await supabase
    .from(MEASUREMENTS_TABLE)
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (existingError) {
    throw existingError;
  }

  const mergedFieldSources = {
    ...(existing?.field_sources || {}),
    ...(payload?.field_sources || {}),
  };

  for (const field of MEASUREMENT_FIELD_DEFINITIONS) {
    const rawValue =
      payload?.[field.key] ??
      payload?.[field.storageKey] ??
      payload?.[field.aliases[0]] ??
      null;

    if (rawValue === null || rawValue === undefined || rawValue === '') {
      delete mergedFieldSources[field.key];
      delete mergedFieldSources[field.storageKey];
      for (const alias of field.aliases) {
        delete mergedFieldSources[alias];
      }
    }
  }

  const writePayload = prepareMeasurementWritePayload({
    ...existing,
    ...payload,
    field_sources: mergedFieldSources,
  });

  const clearedColumns = getClearedMeasurementColumns(payload);

  const { data, error } = await supabase
    .from(MEASUREMENTS_TABLE)
    .update({
      ...writePayload,
      ...clearedColumns,
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return normalizeMeasurementEntry(data);
}

/**
 * Upserts a BMR/TDEE snapshot into the measurements table for the given date.
 * If a row already exists for that date, it updates the bmr/tdee columns only.
 */
export async function saveBMRSnapshot(userId, { bmr, tdee, date } = {}) {
  requireUserId(userId);
  const dateKey = toDateKey(date);

  const { data: existing } = await supabase
    .from(MEASUREMENTS_TABLE)
    .select('id')
    .eq('user_id', userId)
    .eq('date', dateKey)
    .maybeSingle();

  if (existing?.id) {
    await supabase
      .from(MEASUREMENTS_TABLE)
      .update({ bmr: bmr ?? null, tdee: tdee ?? null })
      .eq('id', existing.id)
      .eq('user_id', userId);
  } else {
    await supabase
      .from(MEASUREMENTS_TABLE)
      .insert({ user_id: userId, date: dateKey, bmr: bmr ?? null, tdee: tdee ?? null });
  }
}

export async function deleteMeasurement(userId, id) {
  requireUserId(userId);

  const { data, error } = await supabase
    .from(MEASUREMENTS_TABLE)
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
    .select('id');

  if (error) {
    throw error;
  }

  if (!data?.length) {
    throw new Error('No matching checkpoint was found to delete.');
  }
}

/**
 * Fetch the user's most recent measurement entry (weight, body_fat).
 * Used to auto-fill metadata when creating a progress photo checkpoint.
 */
export async function getLatestMeasurement(userId) {
  requireUserId(userId);

  const { data, error } = await supabase
    .from(MEASUREMENTS_TABLE)
    .select('weight, body_fat, date')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    // Non-critical — return null so the UI just shows empty fields
    return null;
  }

  return data;
}

export async function listProgressPhotos(userId, limit = 200) {
  requireUserId(userId);

  const { data, error } = await supabase
    .from(PROGRESS_PHOTOS_TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(limit);

  if (error) {
    if (!isMissingTableError(error)) {
      throw error;
    }

    const profileData = await fetchProfileData(userId);
    const fallback = coerceArray(profileData?.progress_photos)
      .map(normalizeProgressPhotoEntry)
      .filter(Boolean)
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
      .slice(0, limit);

    return Promise.all(fallback.map(resolvePhotoUrl));
  }

  return Promise.all((data || []).map(resolvePhotoUrl));
}

export async function uploadProgressPhoto(userId, file) {
  requireUserId(userId);

  try {
    // Privacy + performance pipeline: strip EXIF metadata (GPS, device info),
    // then resize to max 2048px on the longest side before uploading.
    const stripped = await stripExif(file);
    const resized = await resizeImage(stripped, 2048);
    return await uploadToSupabaseStorage(userId, resized);
  } catch (storageError) {
    throw new Error(`Progress photo upload failed: ${storageError.message}`);
  }
}

export async function createProgressPhoto(userId, payload) {
  requireUserId(userId);

  const { data, error } = await supabase
    .from(PROGRESS_PHOTOS_TABLE)
    .insert({
      ...payload,
      user_id: userId,
      date: toDateKey(payload?.date),
    })
    .select()
    .single();

  if (error) {
    if (!isMissingTableError(error)) {
      throw error;
    }

    const normalized = normalizeProgressPhotoEntry({
      ...payload,
      date: toDateKey(payload?.date),
    });

    const updated = await updateProfileData(userId, (current) => {
      const existing = coerceArray(current?.progress_photos);
      const filtered = existing.filter(
        (item) => !(item?.date === normalized?.date && item?.category === normalized?.category)
      );
      return {
        ...current,
        progress_photos: [normalized, ...filtered],
      };
    });

    const stored = coerceArray(updated?.progress_photos).find(
      (item) => item?.date === normalized?.date && item?.category === normalized?.category
    );

    return resolvePhotoUrl(normalizeProgressPhotoEntry(stored || normalized));
  }

  return resolvePhotoUrl(data);
}

export async function deleteProgressPhoto(userId, id, photoUrl) {
  requireUserId(userId);

  const storagePath = getStoragePathFromRef(photoUrl);
  if (storagePath) {
    const { error: storageError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([storagePath]);

    if (storageError) {
      throw storageError;
    }
  }

  const { error } = await supabase
    .from(PROGRESS_PHOTOS_TABLE)
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    if (!isMissingTableError(error)) {
      throw error;
    }

    await updateProfileData(userId, (current) => {
      const existing = coerceArray(current?.progress_photos);
      const filtered = existing.filter((item) => {
        if (id && item?.id === id) return false;
        if (photoUrl && item?.photo_url === photoUrl) return false;
        return true;
      });

      return {
        ...current,
        progress_photos: filtered,
      };
    });
  }
}
