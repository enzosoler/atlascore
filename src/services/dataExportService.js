import { supabase } from '@/lib/supabaseClient';
import { downloadFile } from '@/components/shared/StablePage.jsx';

const TABLE_EXPORTS = [
  { key: 'food_logs', table: 'food_logs', orderBy: 'date' },
  { key: 'measurements', table: 'measurements', orderBy: 'date' },
  { key: 'daily_checkins', table: 'daily_checkins', orderBy: 'date' },
  { key: 'workouts', table: 'workouts', orderBy: 'completed_at' },
  { key: 'routines', table: 'routines', orderBy: 'created_at' },
  { key: 'protocols', table: 'protocols', orderBy: 'created_at' },
  { key: 'progress_photos', table: 'progress_photos', orderBy: 'date' },
  { key: 'coach_messages', table: 'coach_messages', orderBy: 'created_at' },
  { key: 'lab_exams', table: 'lab_exams', orderBy: 'created_at' },
  { key: 'onboarding_data', table: 'onboarding_data', orderBy: 'created_at' },
];
const PROGRESS_PHOTOS_BUCKET = 'progress-photos';
const PROGRESS_PHOTOS_REF_PREFIX = `supabase://${PROGRESS_PHOTOS_BUCKET}/`;

function todayStamp() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function safeFilename(prefix, ext) {
  return `atlas-core-export-${todayStamp()}.${ext}`;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function csvEscape(value) {
  const str = value == null ? '' : String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function getProgressPhotoStoragePath(photoUrl, userId) {
  if (!photoUrl || typeof photoUrl !== 'string') return null;
  if (photoUrl.startsWith(`${userId}/`)) return photoUrl;

  if (photoUrl.startsWith(PROGRESS_PHOTOS_REF_PREFIX)) {
    const storagePath = photoUrl.slice(PROGRESS_PHOTOS_REF_PREFIX.length);
    return storagePath.startsWith(`${userId}/`) ? storagePath : null;
  }

  try {
    const parsed = new URL(photoUrl);
    const marker = `/storage/v1/object/`;
    if (!parsed.pathname.includes(marker)) return null;
    const bucketIndex = parsed.pathname.indexOf(`/${PROGRESS_PHOTOS_BUCKET}/`);
    if (bucketIndex === -1) return null;
    const storagePath = decodeURIComponent(
      parsed.pathname.slice(bucketIndex + PROGRESS_PHOTOS_BUCKET.length + 2),
    );
    return storagePath.startsWith(`${userId}/`) ? storagePath : null;
  } catch {
    return null;
  }
}

async function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function fetchProgressPhotoFiles(userId, progressPhotos = []) {
  const files = [];

  for (const photo of asArray(progressPhotos)) {
    const storagePath = getProgressPhotoStoragePath(photo?.photo_url || photo?.storage_path, userId);
    if (!storagePath) {
      files.push({
        progress_photo_id: photo?.id || null,
        status: 'skipped',
        reason: 'No user-scoped storage path was available for this photo.',
      });
      continue;
    }

    try {
      const { data, error } = await supabase.storage
        .from(PROGRESS_PHOTOS_BUCKET)
        .createSignedUrl(storagePath, 60);
      if (error) throw error;

      const response = await fetch(data.signedUrl);
      if (!response.ok) throw new Error(`download failed ${response.status}`);
      const blob = await response.blob();
      const dataUrl = await blobToDataUrl(blob);
      const filename = storagePath.split('/').pop() || `${photo?.id || 'progress-photo'}.jpg`;

      files.push({
        progress_photo_id: photo?.id || null,
        storage_path: storagePath,
        filename,
        mime_type: blob.type || 'application/octet-stream',
        bytes: blob.size,
        data_url: dataUrl,
      });
    } catch (error) {
      files.push({
        progress_photo_id: photo?.id || null,
        storage_path: storagePath,
        status: 'failed',
        reason: error?.message || 'Could not download photo file.',
      });
    }
  }

  return files;
}

async function selectOwnRows(table, userId, orderBy) {
  try {
    let query = supabase.from(table).select('*').eq('user_id', userId);
    if (orderBy) query = query.order(orderBy, { ascending: false });
    const { data, error } = await query;
    if (error) throw error;
    return asArray(data);
  } catch (error) {
    const message = `${error?.code || ''} ${error?.message || ''} ${error?.details || ''}`.toLowerCase();
    if (message.includes('does not exist') || message.includes('schema cache') || message.includes('not found')) {
      return [];
    }
    throw error;
  }
}

async function selectProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

async function selectSubscriptions(userId) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) return [];
  return asArray(data);
}

async function selectWorkoutSessions(userId) {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('started_at', { ascending: false });
  if (error) return { sessions: [], sets: [] };

  const sessions = asArray(data);
  const ids = sessions.map((row) => row.id).filter(Boolean);
  if (ids.length === 0) return { sessions, sets: [] };

  const { data: sets, error: setsError } = await supabase
    .from('workout_sets')
    .select('*')
    .in('session_id', ids)
    .order('session_id', { ascending: false })
    .order('set_index', { ascending: true });

  if (setsError) return { sessions, sets: [] };
  return { sessions, sets: asArray(sets) };
}

export async function buildUserDataExport(userId) {
  if (!userId) throw new Error('You must be signed in to export data.');

  const sectionPromises = TABLE_EXPORTS.map(async ({ key, table, orderBy }) => [key, await selectOwnRows(table, userId, orderBy)]);
  const [profile, subscriptions, sessionBundle, ...sections] = await Promise.all([
    selectProfile(userId),
    selectSubscriptions(userId),
    selectWorkoutSessions(userId),
    ...sectionPromises,
  ]);

  const exportData = Object.fromEntries(sections);
  exportData.profile = profile;
  exportData.subscriptions = subscriptions;
  exportData.workout_sessions = sessionBundle.sessions;
  exportData.workout_sets = sessionBundle.sets;
  exportData.progress_photo_files = await fetchProgressPhotoFiles(userId, exportData.progress_photos);

  return {
    exported_at: new Date().toISOString(),
    user_id: userId,
    data: exportData,
  };
}

export async function downloadUserDataJson(userId) {
  const bundle = await buildUserDataExport(userId);
  downloadFile(safeFilename('atlas-core-export', 'json'), JSON.stringify(bundle, null, 2), 'application/json;charset=utf-8');
  return bundle;
}

export async function downloadUserDataCsv(userId) {
  const bundle = await buildUserDataExport(userId);
  const rows = [];

  for (const [dataset, value] of Object.entries(bundle.data)) {
    if (Array.isArray(value)) {
      if (value.length === 0) {
        rows.push({ dataset, row_id: '', timestamp: '', payload_json: '{}' });
        continue;
      }
      value.forEach((row, index) => {
        rows.push({
          dataset,
          row_id: row?.id || `${dataset}_${index + 1}`,
          timestamp: row?.date || row?.completed_at || row?.started_at || row?.created_at || row?.updated_at || '',
          payload_json: JSON.stringify(row),
        });
      });
    } else {
      rows.push({
        dataset,
        row_id: value?.id || dataset,
        timestamp: value?.created_at || value?.updated_at || '',
        payload_json: JSON.stringify(value || {}),
      });
    }
  }

  const header = ['dataset', 'row_id', 'timestamp', 'payload_json'];
  const content = [
    header.join(','),
    ...rows.map((row) => header.map((key) => csvEscape(row[key])).join(',')),
  ].join('\n');

  downloadFile(safeFilename('atlas-core-export', 'csv'), content, 'text/csv;charset=utf-8');
  return bundle;
}
