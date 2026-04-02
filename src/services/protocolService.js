import { supabase } from '@/lib/supabaseClient';

const PROTOCOLS_TABLE = 'protocols';
const LOGS_TABLE = 'protocol_logs';

// ─── Protocols CRUD ──────────────────────────────────────────

/**
 * List protocols for a user, optionally filtered by status.
 * Defaults to active protocols, ordered by name.
 */
export async function listProtocols(userId, { status = 'active' } = {}) {
  if (!userId) return [];

  let query = supabase
    .from(PROTOCOLS_TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[protocolService] listProtocols error:', error);
    return [];
  }
  return data || [];
}

/**
 * Fetch a single protocol by id.
 */
export async function getProtocol(protocolId) {
  if (!protocolId) return null;

  const { data, error } = await supabase
    .from(PROTOCOLS_TABLE)
    .select('*')
    .eq('id', protocolId)
    .single();

  if (error) {
    console.error('[protocolService] getProtocol error:', error);
    return null;
  }
  return data;
}

/**
 * Create a new protocol.
 */
export async function createProtocol(userId, payload) {
  if (!userId) throw new Error('User ID is required');

  const { data, error } = await supabase
    .from(PROTOCOLS_TABLE)
    .insert({
      user_id: userId,
      name: payload.name,
      category: payload.category,
      dose_amount: payload.dose_amount,
      dose_unit: payload.dose_unit,
      route: payload.route,
      schedule_type: payload.schedule_type,
      schedule_weekdays: payload.schedule_weekdays || null,
      schedule_interval_days: payload.schedule_interval_days || null,
      reminder_enabled: payload.reminder_enabled ?? true,
      reminder_time: payload.reminder_time || null,
      followup_reminder_minutes: payload.followup_reminder_minutes || null,
      start_date: payload.start_date || new Date().toISOString().split('T')[0],
      status: payload.status || 'active',
      notes: payload.notes || null,
    })
    .select()
    .single();

  if (error) {
    console.error('[protocolService] createProtocol error:', error);
    throw error;
  }
  return data;
}

/**
 * Update an existing protocol.
 */
export async function updateProtocol(protocolId, updates) {
  if (!protocolId) throw new Error('Protocol ID is required');

  const { data, error } = await supabase
    .from(PROTOCOLS_TABLE)
    .update(updates)
    .eq('id', protocolId)
    .select()
    .single();

  if (error) {
    console.error('[protocolService] updateProtocol error:', error);
    throw error;
  }
  return data;
}

/**
 * Soft-delete a protocol by setting status to 'discontinued'.
 */
export async function discontinueProtocol(protocolId) {
  return updateProtocol(protocolId, { status: 'discontinued' });
}

/**
 * Pause a protocol.
 */
export async function pauseProtocol(protocolId) {
  return updateProtocol(protocolId, { status: 'paused' });
}

/**
 * Resume a paused protocol.
 */
export async function resumeProtocol(protocolId) {
  return updateProtocol(protocolId, { status: 'active' });
}

// ─── Protocol Logs ───────────────────────────────────────────

/**
 * Log a dose event (taken, skipped, or missed).
 */
export async function logDose(protocolId, { scheduled_date, status, taken_at = null, notes = null }) {
  if (!protocolId) throw new Error('Protocol ID is required');
  if (!scheduled_date) throw new Error('Scheduled date is required');
  if (!status) throw new Error('Status is required');

  // Upsert: if a log already exists for this protocol+date, update it
  const existing = await _findLog(protocolId, scheduled_date);

  if (existing) {
    const { data, error } = await supabase
      .from(LOGS_TABLE)
      .update({ status, taken_at, notes })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) {
      console.error('[protocolService] logDose update error:', error);
      throw error;
    }
    return data;
  }

  const { data, error } = await supabase
    .from(LOGS_TABLE)
    .insert({
      protocol_id: protocolId,
      scheduled_date,
      status,
      taken_at,
      notes,
    })
    .select()
    .single();

  if (error) {
    console.error('[protocolService] logDose insert error:', error);
    throw error;
  }
  return data;
}

/**
 * Find an existing log for a given protocol and date.
 */
async function _findLog(protocolId, scheduledDate) {
  const { data } = await supabase
    .from(LOGS_TABLE)
    .select('id')
    .eq('protocol_id', protocolId)
    .eq('scheduled_date', scheduledDate)
    .maybeSingle();
  return data;
}

/**
 * Get log history for a specific protocol, newest first.
 */
export async function getProtocolHistory(protocolId, { limit = 90 } = {}) {
  if (!protocolId) return [];

  const { data, error } = await supabase
    .from(LOGS_TABLE)
    .select('*')
    .eq('protocol_id', protocolId)
    .order('scheduled_date', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[protocolService] getProtocolHistory error:', error);
    return [];
  }
  return data || [];
}

// ─── Today's Due Protocols ───────────────────────────────────

/**
 * Get protocols that are due today for a given user.
 * Evaluates each active protocol's schedule against the current date.
 * Returns protocols augmented with a `logged` field (the log for today, if any).
 */
export async function getTodaysDueProtocols(userId) {
  if (!userId) return [];

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const todayWeekday = today.getDay(); // 0 = Sunday, 6 = Saturday

  // Fetch all active protocols
  const protocols = await listProtocols(userId, { status: 'active' });
  if (!protocols.length) return [];

  // Filter by schedule
  const dueProtocols = protocols.filter((p) => {
    // Don't include protocols that haven't started yet
    if (p.start_date && todayStr < p.start_date) return false;

    if (p.schedule_type === 'weekdays') {
      return Array.isArray(p.schedule_weekdays) && p.schedule_weekdays.includes(todayWeekday);
    }

    if (p.schedule_type === 'interval') {
      if (!p.schedule_interval_days || p.schedule_interval_days <= 0) return false;
      const startMs = new Date(p.start_date).getTime();
      const todayMs = today.setHours(0, 0, 0, 0);
      const daysSinceStart = Math.floor((todayMs - startMs) / 86_400_000);
      return daysSinceStart >= 0 && daysSinceStart % p.schedule_interval_days === 0;
    }

    return false;
  });

  if (!dueProtocols.length) return [];

  // Fetch today's logs for all due protocols in a single query
  const dueIds = dueProtocols.map((p) => p.id);

  const { data: todayLogs } = await supabase
    .from(LOGS_TABLE)
    .select('*')
    .in('protocol_id', dueIds)
    .eq('scheduled_date', todayStr);

  const logsByProtocol = {};
  (todayLogs || []).forEach((log) => {
    logsByProtocol[log.protocol_id] = log;
  });

  return dueProtocols.map((p) => ({
    ...p,
    logged: logsByProtocol[p.id] || null,
  }));
}

// ─── Adherence Stats ─────────────────────────────────────────

/**
 * Calculate adherence statistics for a user's protocols over the last N days.
 * Returns per-protocol and overall stats.
 *
 * Shape: {
 *   overall: { due: number, taken: number, skipped: number, missed: number, rate: number },
 *   byProtocol: { [protocolId]: { name, due, taken, skipped, missed, rate } }
 * }
 */
export async function getAdherenceStats(userId, { days = 30 } = {}) {
  if (!userId) return { overall: _emptyStats(), byProtocol: {} };

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - days);
  const startStr = startDate.toISOString().split('T')[0];

  // Get all non-discontinued protocols (active + paused still count for history)
  const { data: protocols } = await supabase
    .from(PROTOCOLS_TABLE)
    .select('*')
    .eq('user_id', userId)
    .in('status', ['active', 'paused']);

  if (!protocols?.length) return { overall: _emptyStats(), byProtocol: {} };

  const protocolIds = protocols.map((p) => p.id);

  // Fetch all logs in the date range
  const { data: logs } = await supabase
    .from(LOGS_TABLE)
    .select('*')
    .in('protocol_id', protocolIds)
    .gte('scheduled_date', startStr)
    .lte('scheduled_date', todayStr);

  const logMap = {};
  (logs || []).forEach((log) => {
    const key = `${log.protocol_id}|${log.scheduled_date}`;
    logMap[key] = log;
  });

  const overall = { due: 0, taken: 0, skipped: 0, missed: 0 };
  const byProtocol = {};

  for (const protocol of protocols) {
    const stats = { name: protocol.name, due: 0, taken: 0, skipped: 0, missed: 0, rate: 0 };

    // Walk each day in the range
    const cursor = new Date(Math.max(startDate.getTime(), new Date(protocol.start_date).getTime()));
    cursor.setHours(0, 0, 0, 0);

    while (cursor <= today) {
      if (_isDueOnDate(protocol, cursor)) {
        stats.due++;
        const dateStr = cursor.toISOString().split('T')[0];
        const log = logMap[`${protocol.id}|${dateStr}`];
        if (log) {
          if (log.status === 'taken') stats.taken++;
          else if (log.status === 'skipped') stats.skipped++;
          else if (log.status === 'missed') stats.missed++;
        } else {
          // No log and date is in the past → missed
          if (dateStr < todayStr) stats.missed++;
        }
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    stats.rate = stats.due > 0 ? Math.round((stats.taken / stats.due) * 100) : 0;
    byProtocol[protocol.id] = stats;

    overall.due += stats.due;
    overall.taken += stats.taken;
    overall.skipped += stats.skipped;
    overall.missed += stats.missed;
  }

  return {
    overall: {
      ...overall,
      rate: overall.due > 0 ? Math.round((overall.taken / overall.due) * 100) : 0,
    },
    byProtocol,
  };
}

// ─── Helpers ─────────────────────────────────────────────────

function _isDueOnDate(protocol, date) {
  const dateStr = date.toISOString().split('T')[0];
  if (protocol.start_date && dateStr < protocol.start_date) return false;

  if (protocol.schedule_type === 'weekdays') {
    return Array.isArray(protocol.schedule_weekdays) && protocol.schedule_weekdays.includes(date.getDay());
  }

  if (protocol.schedule_type === 'interval') {
    if (!protocol.schedule_interval_days || protocol.schedule_interval_days <= 0) return false;
    const startMs = new Date(protocol.start_date).getTime();
    const dateMs = new Date(dateStr).getTime();
    const daysDiff = Math.floor((dateMs - startMs) / 86_400_000);
    return daysDiff >= 0 && daysDiff % protocol.schedule_interval_days === 0;
  }

  return false;
}

function _emptyStats() {
  return { due: 0, taken: 0, skipped: 0, missed: 0, rate: 0 };
}

// ─── Convenience aliases ────────────────────────────────────
// Used by Protocol pages (list, detail, form).

export const getProtocolLogs = getProtocolHistory;
export const getTodayDue = getTodaysDueProtocols;
