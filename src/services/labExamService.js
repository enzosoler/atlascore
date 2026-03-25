/**
 * Atlas Core — Lab Exam Service
 * Handles CRUD operations for lab exams via Supabase.
 * Falls back to profiles.profile_data when the lab_exams table
 * hasn't been created yet (same pattern as checkinService).
 */
import { supabase } from '@/lib/supabaseClient';
import { invokeLLMJson } from '@/lib/llm';

const TABLE = 'lab_exams';
const STORAGE_BUCKET = 'lab-exams';

// ── Helpers ────────────────────────────────────────────────────────────────

function requireUserId(userId) {
  if (!userId) throw new Error('labExamService: userId is required');
}

function isMissingTableError(error) {
  if (!error) return false;
  if (error.code === 'PGRST205' || error.code === '42P01') return true;
  const msg = `${error.message || ''} ${error.details || ''}`.toLowerCase();
  return (
    msg.includes('schema cache') ||
    msg.includes('does not exist') ||
    msg.includes('not found') ||
    msg.includes('could not find')
  );
}

function toDateKey(value) {
  if (!value) return new Date().toISOString().split('T')[0];
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? new Date().toISOString().split('T')[0]
    : d.toISOString().split('T')[0];
}

/**
 * Auto-detect marker status from value + reference range.
 */
function autoStatus(value, refMin, refMax) {
  const v = Number(value);
  if (Number.isNaN(v)) return 'normal';
  const min = refMin != null ? Number(refMin) : null;
  const max = refMax != null ? Number(refMax) : null;

  if (min != null && max != null) {
    if (v < min * 0.7 || v > max * 1.3) return 'critical';
    if (v < min) return 'low';
    if (v > max) return 'high';
    return 'normal';
  }
  if (min != null && v < min) return v < min * 0.7 ? 'critical' : 'low';
  if (max != null && v > max) return v > max * 1.3 ? 'critical' : 'high';
  return 'normal';
}

/**
 * Enrich markers with auto-computed status when not already set.
 */
function enrichMarkers(markers) {
  if (!Array.isArray(markers)) return [];
  return markers
    .filter((m) => m && m.name)
    .map((m) => ({
      name: String(m.name || ''),
      value: m.value != null ? Number(m.value) : null,
      unit: String(m.unit || ''),
      reference_min: m.reference_min != null ? Number(m.reference_min) : null,
      reference_max: m.reference_max != null ? Number(m.reference_max) : null,
      status: m.status || autoStatus(m.value, m.reference_min, m.reference_max),
    }));
}

function normalizeExam(entry) {
  if (!entry || typeof entry !== 'object') return null;
  return {
    ...entry,
    exam_date: toDateKey(entry.exam_date),
    markers: enrichMarkers(entry.markers),
  };
}

function sortByDateDesc(list) {
  return [...list].sort((a, b) => (b?.exam_date || '').localeCompare(a?.exam_date || ''));
}

// ── Profile-data fallback ──────────────────────────────────────────────────

async function readProfileData(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('profile_data')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  const pd = data?.profile_data;
  return pd && typeof pd === 'object' ? pd : {};
}

async function writeProfileData(userId, profileData) {
  const { error } = await supabase
    .from('profiles')
    .update({ profile_data: profileData })
    .eq('id', userId);
  if (error) throw error;
}

function getExamsFromProfile(profileData) {
  const raw = Array.isArray(profileData?.lab_exams) ? profileData.lab_exams : [];
  return raw.map(normalizeExam).filter(Boolean);
}

// ── CRUD ───────────────────────────────────────────────────────────────────

export async function listExams(userId, limit = 100) {
  requireUserId(userId);

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('exam_date', { ascending: false })
    .limit(limit);

  if (error) {
    if (!isMissingTableError(error)) throw error;
    // Fallback to profile_data
    let list = getExamsFromProfile(await readProfileData(userId));
    list = sortByDateDesc(list);
    if (limit) list = list.slice(0, limit);
    return list;
  }

  return (data || []).map(normalizeExam).filter(Boolean);
}

export async function getExam(userId, id) {
  requireUserId(userId);

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error) {
    if (!isMissingTableError(error)) throw error;
    const profileData = await readProfileData(userId);
    const list = getExamsFromProfile(profileData);
    return list.find((e) => e.id === id) || null;
  }

  return normalizeExam(data);
}

export async function createExam(userId, payload) {
  requireUserId(userId);

  const row = {
    user_id: userId,
    panel_name: payload.panel_name?.trim() || 'Untitled panel',
    exam_date: toDateKey(payload.exam_date),
    markers: enrichMarkers(payload.markers),
    notes: payload.notes || null,
    source_file: payload.source_file || payload.file_url || null,
    ai_insights: payload.ai_insights || null,
  };

  const { data, error } = await supabase
    .from(TABLE)
    .insert(row)
    .select()
    .single();

  if (error) {
    if (!isMissingTableError(error)) throw error;
    // Fallback to profile_data
    const profileData = await readProfileData(userId);
    const list = getExamsFromProfile(profileData);
    const newEntry = {
      id: crypto.randomUUID(),
      ...row,
      created_at: new Date().toISOString(),
    };
    const nextList = sortByDateDesc([...list, newEntry]);
    await writeProfileData(userId, { ...profileData, lab_exams: nextList });
    return newEntry;
  }

  return normalizeExam(data);
}

export async function updateExam(userId, id, payload) {
  requireUserId(userId);

  const updates = {};
  if (payload.panel_name !== undefined) updates.panel_name = payload.panel_name.trim();
  if (payload.exam_date !== undefined) updates.exam_date = toDateKey(payload.exam_date);
  if (payload.markers !== undefined) updates.markers = enrichMarkers(payload.markers);
  if (payload.notes !== undefined) updates.notes = payload.notes || null;
  if (payload.ai_insights !== undefined) updates.ai_insights = payload.ai_insights || null;

  const { data, error } = await supabase
    .from(TABLE)
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    if (!isMissingTableError(error)) throw error;
    // Fallback
    const profileData = await readProfileData(userId);
    const list = getExamsFromProfile(profileData);
    const idx = list.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error('Exam not found');
    list[idx] = { ...list[idx], ...updates };
    await writeProfileData(userId, { ...profileData, lab_exams: sortByDateDesc(list) });
    return list[idx];
  }

  return normalizeExam(data);
}

export async function deleteExam(userId, id) {
  requireUserId(userId);

  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    if (!isMissingTableError(error)) throw error;
    // Fallback
    const profileData = await readProfileData(userId);
    const list = getExamsFromProfile(profileData);
    const nextList = list.filter((e) => e.id !== id);
    await writeProfileData(userId, { ...profileData, lab_exams: nextList });
    return;
  }
}

// ── File Upload ────────────────────────────────────────────────────────────

export async function uploadLabFile(userId, file) {
  requireUserId(userId);
  const ext = file.name?.split('.').pop()?.toLowerCase() || 'pdf';
  const filePath = `${userId}/${Date.now()}-lab-exam.${ext}`;

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, file, {
      upsert: false,
      contentType: file.type || 'application/pdf',
    });

  if (error) {
    console.warn('[labExamService] Storage upload failed:', error.message);
    return null;
  }

  return filePath;
}

export async function getLabFileUrl(storagePath) {
  if (!storagePath) return null;
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(storagePath, 60 * 60);
  if (error) {
    console.warn('[labExamService] signed URL failed:', error.message);
    return null;
  }
  return data?.signedUrl || null;
}

// ── PDF / Image Extraction ─────────────────────────────────────────────────

/**
 * Convert a File to base64 string (without the data URL prefix).
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      const base64 = result.split(',')[1] || result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Extract structured exam data from a PDF or image file.
 *
 * Strategy:
 *  1. Try the dedicated `parse-lab-pdf` edge function (sends base64, uses
 *     Claude vision for proper document understanding).
 *  2. If the edge function is unavailable, fall back to the generic
 *     `invoke-llm` function with a text-based prompt.
 */
export async function extractExamFromFile(file) {
  // ── Strategy 1: dedicated edge function ────────────────────────────────
  try {
    const base64 = await fileToBase64(file);

    const { data, error } = await supabase.functions.invoke('parse-lab-pdf', {
      body: {
        file_base64: base64,
        mime_type: file.type || 'application/pdf',
      },
    });

    if (!error && data?.success && data.markers?.length > 0) {
      return {
        panel_name: data.panel_name || null,
        exam_date: data.exam_date || null,
        markers: enrichMarkers(data.markers),
      };
    }

    // If edge function returned but with no markers, log and fall through
    if (data && !data.success) {
      console.warn('[labExamService] parse-lab-pdf returned error:', data.error);
    }
  } catch (edgeFnError) {
    console.warn('[labExamService] parse-lab-pdf unavailable, trying LLM fallback:', edgeFnError.message);
  }

  // ── Strategy 2: generic LLM fallback (text-only, less reliable for PDFs) ─
  try {
    const base64 = await fileToBase64(file);
    const mimeType = file.type || 'application/pdf';
    const isImage = mimeType.startsWith('image/');

    const prompt = `You are analyzing a ${isImage ? 'photo/scan' : 'PDF'} of a laboratory exam result.
The file is encoded in base64 (${mimeType}). Extract ALL biomarkers found.

Base64 content (first 40000 chars):
${base64.substring(0, 40000)}

Return JSON with:
- panel_name: exam panel name
- exam_date: YYYY-MM-DD format
- markers: array of { name, value (number), unit, reference_min, reference_max, status }

Status should be "normal", "low", "high", or "critical".
Extract EVERY marker. Keep marker names in their original language.
Return ONLY valid JSON.`;

    const schema = {
      type: 'object',
      properties: {
        panel_name: { type: 'string' },
        exam_date: { type: 'string' },
        markers: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              value: { type: 'number' },
              unit: { type: 'string' },
              reference_min: { type: 'number' },
              reference_max: { type: 'number' },
              status: { type: 'string' },
            },
          },
        },
      },
    };

    const result = await invokeLLMJson(prompt, schema);

    if (result?.markers?.length > 0) {
      return {
        panel_name: result.panel_name || null,
        exam_date: result.exam_date || null,
        markers: enrichMarkers(result.markers),
      };
    }
  } catch (llmError) {
    console.warn('[labExamService] LLM fallback also failed:', llmError.message);
  }

  return null;
}

// ── AI Insights ────────────────────────────────────────────────────────────

/**
 * Generate AI insights for a specific exam based on the user's profile and markers.
 */
export async function generateExamInsights(exam, userProfile) {
  const markersText = (exam.markers || [])
    .map((m) => {
      const ref =
        m.reference_min != null || m.reference_max != null
          ? ` (ref: ${m.reference_min ?? '?'}-${m.reference_max ?? '?'})`
          : '';
      return `- ${m.name}: ${m.value} ${m.unit || ''}${ref} [${m.status || 'normal'}]`;
    })
    .join('\n');

  const profileContext = userProfile
    ? `
User context:
- Age: ${userProfile.age || 'unknown'}
- Sex: ${userProfile.sex || userProfile.gender || 'unknown'}
- Weight: ${userProfile.current_weight || userProfile.weight_kg || 'unknown'} kg
- Height: ${userProfile.height_cm || 'unknown'} cm
- Training goal: ${userProfile.training_goal || 'unknown'}
- Activity level: ${userProfile.activity_level || 'unknown'}
`
    : '';

  const prompt = `You are a health data analyst (NOT a doctor). Analyze these lab exam results and provide practical, actionable insights.

Exam: ${exam.panel_name}
Date: ${exam.exam_date}
${profileContext}
Markers:
${markersText}

Provide a brief analysis covering:
1. Overall assessment of the results
2. Any markers that are out of range and what they might indicate
3. Lifestyle or nutrition suggestions that could help
4. Trends or patterns worth noting

IMPORTANT: Include a disclaimer that this is not medical advice.
Keep the response concise and in the same language as the marker names.

Return JSON with: { summary, insights (array of strings), recommendations (array of strings), disclaimer }`;

  return await invokeLLMJson(prompt, {
    type: 'object',
    properties: {
      summary: { type: 'string' },
      insights: { type: 'array', items: { type: 'string' } },
      recommendations: { type: 'array', items: { type: 'string' } },
      disclaimer: { type: 'string' },
    },
  });
}

/**
 * Generate comparative insights across multiple exams (trends).
 */
export async function generateTrendInsights(exams, userProfile) {
  if (!exams || exams.length < 2) return null;

  const markerHistory = {};
  for (const exam of exams) {
    for (const m of exam.markers || []) {
      if (!markerHistory[m.name]) markerHistory[m.name] = [];
      markerHistory[m.name].push({
        date: exam.exam_date,
        value: m.value,
        status: m.status,
      });
    }
  }

  const trendsText = Object.entries(markerHistory)
    .filter(([, history]) => history.length > 1)
    .map(([name, history]) => {
      const sorted = history.sort((a, b) => a.date.localeCompare(b.date));
      const values = sorted.map((h) => `${h.date}: ${h.value} (${h.status})`).join(', ');
      return `- ${name}: ${values}`;
    })
    .join('\n');

  if (!trendsText) return null;

  const prompt = `Analyze these lab marker trends over time and provide insights.

${userProfile ? `User: ${userProfile.age || '?'}yo ${userProfile.sex || userProfile.gender || '?'}, ${userProfile.current_weight || userProfile.weight_kg || '?'}kg` : ''}

Marker trends:
${trendsText}

Provide 2-3 key observations about the trends. Note improvements and deteriorations.
Keep it concise and practical. Include a medical disclaimer.
Respond in the same language as the marker names.

Return JSON with: { summary, insights (array of strings), disclaimer }`;

  return await invokeLLMJson(prompt, {
    type: 'object',
    properties: {
      summary: { type: 'string' },
      insights: { type: 'array', items: { type: 'string' } },
      disclaimer: { type: 'string' },
    },
  });
}
