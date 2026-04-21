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
];

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
