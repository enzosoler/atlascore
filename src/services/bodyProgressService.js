import { supabase } from '@/lib/supabaseClient';
import { base44 } from '@/api/base44Client';

const MEASUREMENTS_TABLE = 'measurements';
const PROGRESS_PHOTOS_TABLE = 'progress_photos';
const STORAGE_BUCKET = 'progress-photos';
const SUPABASE_URL_PREFIX = `supabase://${STORAGE_BUCKET}/`;

function requireUserId(userId) {
  if (!userId) {
    throw new Error('User session is required to access body progress data.');
  }
}

function toDateKey(value) {
  if (!value) {
    return new Date().toISOString().split('T')[0];
  }

  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString().split('T')[0];
  }

  return parsed.toISOString().split('T')[0];
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

async function resolvePhotoUrl(photo) {
  if (!photo?.photo_url) {
    return photo;
  }

  const storagePath = getStoragePathFromRef(photo.photo_url);
  if (!storagePath) {
    return photo;
  }

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(storagePath, 60 * 60);

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

async function uploadViaBase44(file) {
  const { file_url } = await base44.integrations.Core.UploadFile({ file });
  if (!file_url) {
    throw new Error('Base44 upload returned an empty file URL.');
  }
  return file_url;
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

  return data || [];
}

export async function createMeasurement(userId, payload) {
  requireUserId(userId);

  const { data, error } = await supabase
    .from(MEASUREMENTS_TABLE)
    .insert({
      ...payload,
      user_id: userId,
      date: toDateKey(payload?.date),
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateMeasurement(userId, id, payload) {
  requireUserId(userId);

  const { data, error } = await supabase
    .from(MEASUREMENTS_TABLE)
    .update({
      ...payload,
      date: toDateKey(payload?.date),
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
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

export async function listProgressPhotos(userId, limit = 200) {
  requireUserId(userId);

  const { data, error } = await supabase
    .from(PROGRESS_PHOTOS_TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return Promise.all((data || []).map(resolvePhotoUrl));
}

export async function uploadProgressPhoto(userId, file) {
  requireUserId(userId);

  try {
    return await uploadToSupabaseStorage(userId, file);
  } catch (storageError) {
    try {
      return await uploadViaBase44(file);
    } catch (base44Error) {
      throw new Error(
        `Progress photo upload failed. Supabase storage error: ${storageError.message}. Base44 fallback error: ${base44Error.message}.`
      );
    }
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
    throw error;
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
    throw error;
  }
}
