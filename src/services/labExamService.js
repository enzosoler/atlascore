import { supabase } from '@/lib/supabaseClient';
import { invokeLLMJson } from '@/lib/llm';

const TABLE = 'lab_exams';
const STORAGE_BUCKET = 'lab-exams';
const PENDING_NOTES =
  'Upload received. Parsing is pending. Atlas will process this report when lab parsing is available.';

function isMissingTable(error) {
  return error?.code === '42P01' || error?.code === 'PGRST204';
}

function normalizeStatus(status, markers = []) {
  if (status) return status;
  return Array.isArray(markers) && markers.length > 0 ? 'complete' : 'pending';
}

function mapMarkerStatus(status) {
  if (status === 'normal' || status === 'optimal') return 'optimal';
  if (status === 'critical') return 'out';
  if (status === 'low' || status === 'high') return 'monitor';
  return 'optimal';
}

function inferCategory(name = '') {
  const normalized = String(name).toLowerCase();
  if (/(apo|ldl|hdl|trig|cholesterol|lipid)/.test(normalized)) return 'Cardiovascular';
  if (/(glucose|a1c|insulin|metabolic|alt|ast)/.test(normalized)) return 'Metabolic';
  if (/(vitamin|folate|b12)/.test(normalized)) return 'Vitamins';
  if (/(tsh|t3|t4|testosterone|estradiol|progesterone|hormone|cortisol)/.test(normalized)) return 'Hormones';
  if (/(ferritin|hemoglobin|hematocrit|cbc|platelet|blood)/.test(normalized)) return 'Blood count';
  if (/(crp|esr|inflamm)/.test(normalized)) return 'Inflammation';
  return 'General';
}

function formatMarker(marker, index) {
  return {
    id: marker.id || `marker-${index + 1}`,
    name: marker.name || marker.t || `Marker ${index + 1}`,
    value: marker.value ?? marker.v ?? 'n/a',
    unit: marker.unit || marker.u || '',
    status: mapMarkerStatus(marker.status || marker.flag),
    category: marker.category || inferCategory(marker.name || marker.t),
    ref_range: marker.ref_range || marker.refRange || null,
  };
}

function countMarkerStatuses(markers = []) {
  return markers.reduce(
    (acc, marker) => {
      if (marker.status === 'out') acc.outCount += 1;
      else if (marker.status === 'monitor') acc.monitorCount += 1;
      else acc.optimalCount += 1;
      return acc;
    },
    { optimalCount: 0, monitorCount: 0, outCount: 0 },
  );
}

function formatExamDate(dateLike) {
  const date = dateLike ? new Date(dateLike) : new Date();
  if (Number.isNaN(date.getTime())) return new Date().toISOString().slice(0, 10);
  return date.toISOString().slice(0, 10);
}

function toExamRowShape(row) {
  const markers = Array.isArray(row?.markers) ? row.markers.map(formatMarker) : [];
  return {
    ...row,
    status: normalizeStatus(row?.status, markers),
    storage_path: row?.storage_path || row?.source_file || null,
    source_file: row?.source_file || row?.storage_path || null,
    markers,
  };
}

function isParserUnavailable(error) {
  const message = String(error?.message || error?.context?.response || error?.details || '').toLowerCase();
  return (
    error?.name === 'FunctionsFetchError' ||
    error?.status === 404 ||
    message.includes('failed to fetch') ||
    message.includes('not found') ||
    message.includes('no route matched') ||
    message.includes('gemini_api_key not configured') ||
    message.includes('edge function returned a non-2xx status code')
  );
}

async function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      resolve(result.split(',')[1] || '');
    };
    reader.onerror = () => reject(reader.error || new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

export function summarizeExam(row) {
  const exam = toExamRowShape(row);
  const counts = countMarkerStatuses(exam.markers);
  const source = exam.status === 'pending' ? 'Parsing pending' : 'Parsed report';
  return {
    id: exam.id,
    name: exam.panel_name || 'Untitled Panel',
    date: exam.exam_date,
    source,
    status: exam.status,
    optimalCount: counts.optimalCount,
    monitorCount: counts.monitorCount,
    outCount: counts.outCount,
  };
}

export function examToPanel(exam) {
  const counts = countMarkerStatuses(exam.markers);
  const date = exam.exam_date
    ? new Date(exam.exam_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'Today';
  return {
    id: exam.id,
    date,
    lab: exam.status === 'pending' ? 'Parsing pending' : 'Atlas',
    n: exam.panel_name || 'Untitled Panel',
    flagged: counts.monitorCount + counts.outCount,
    total: exam.markers.length,
    isNew: false,
    status: exam.status,
    markers: exam.markers.map((marker) => ({
      id: marker.id,
      t: marker.name,
      v: marker.value,
      u: marker.unit,
      flag: marker.status === 'out' ? 'high' : marker.status === 'monitor' ? 'low' : 'ok',
      d: marker.ref_range || (exam.status === 'pending' ? 'Awaiting extraction' : 'Parsed from upload'),
    })),
  };
}

/**
 * List all lab exams for a user.
 */
export async function listExams(userId) {
  if (!userId) return [];

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('exam_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[labExamService] listExams error:', error);
    if (isMissingTable(error)) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('profile_data')
        .eq('id', userId)
        .maybeSingle();
      return (profile?.profile_data?.lab_exams || []).map(toExamRowShape);
    }
    return [];
  }

  return (data || []).map(toExamRowShape);
}

export async function getExam(userId, id) {
  if (!userId || !id) return null;

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('[labExamService] getExam error:', error);
    throw error;
  }

  return data ? toExamRowShape(data) : null;
}

/**
 * Create a new lab exam.
 */
export async function createExam(userId, payload) {
  if (!userId) throw new Error('User ID is required');

  const insertPayload = {
    user_id: userId,
    panel_name: payload.panel_name || 'Untitled Panel',
    exam_date: payload.exam_date || formatExamDate(),
    markers: payload.markers || [],
    notes: payload.notes || '',
    source_file: payload.source_file || payload.storage_path || null,
  };

  if ('status' in payload) insertPayload.status = payload.status;
  if ('storage_path' in payload) insertPayload.storage_path = payload.storage_path;
  if ('ai_insights' in payload) insertPayload.ai_insights = payload.ai_insights;

  const { data, error } = await supabase
    .from(TABLE)
    .insert(insertPayload)
    .select()
    .single();

  if (error) {
    console.error('[labExamService] createExam error:', error);
    throw error;
  }
  return toExamRowShape(data);
}

/**
 * Update an existing lab exam.
 */
export async function updateExam(userId, id, payload) {
  if (!userId || !id) throw new Error('User ID and Exam ID are required');

  const updatePayload = {
    panel_name: payload.panel_name,
    exam_date: payload.exam_date,
    markers: payload.markers,
    notes: payload.notes,
    ai_insights: payload.ai_insights,
    source_file: payload.source_file,
  };

  if ('status' in payload) updatePayload.status = payload.status;
  if ('storage_path' in payload) updatePayload.storage_path = payload.storage_path;

  const { data, error } = await supabase
    .from(TABLE)
    .update(updatePayload)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('[labExamService] updateExam error:', error);
    throw error;
  }
  return toExamRowShape(data);
}

/**
 * Delete a lab exam.
 */
export async function deleteExam(userId, id) {
  if (!userId || !id) throw new Error('User ID and Exam ID are required');

  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    console.error('[labExamService] deleteExam error:', error);
    throw error;
  }
  return true;
}

/**
 * Upload a lab exam file (PDF/Image) to Supabase Storage.
 */
export async function uploadLabFile(userId, file) {
  if (!userId) throw new Error('User ID is required');

  const fileExt = String(file.name.split('.').pop() || 'pdf').toLowerCase();
  const fileName = `${userId}/${Date.now()}-${crypto.randomUUID()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(fileName, file, {
      upsert: false,
      contentType: file?.type || undefined,
    });

  if (uploadError) {
    console.error('[labExamService] upload error:', uploadError);
    throw uploadError;
  }

  return fileName;
}

/**
 * Extract markers from a file using the edge function.
 */
export async function extractExamFromFile(file) {
  const base64 = await readFileAsBase64(file);
  const { data, error } = await supabase.functions.invoke('parse-lab-pdf', {
    body: {
      image: base64,
      mimeType: file.type || 'application/pdf',
    },
  });

  if (error) {
    console.error('[labExamService] extraction error:', error);
    throw error;
  }

  return data;
}

export async function createPendingExam(userId, file, storagePath, reason = PENDING_NOTES) {
  return createExam(userId, {
    panel_name: file?.name?.replace(/\.[^.]+$/, '') || 'Lab upload',
    exam_date: formatExamDate(),
    markers: [],
    notes: reason,
    source_file: storagePath,
    storage_path: storagePath,
    status: 'pending',
  });
}

export async function uploadAndProcessExam(userId, file, options = {}) {
  if (!userId) throw new Error('You need to be signed in to upload labs.');
  if (!file) throw new Error('Choose a file to upload.');
  const onPhaseChange = typeof options.onPhaseChange === 'function' ? options.onPhaseChange : null;

  onPhaseChange?.('uploading');
  const storagePath = await uploadLabFile(userId, file);

  try {
    onPhaseChange?.('parsing');
    const parsed = await extractExamFromFile(file);
    const markers = Array.isArray(parsed?.markers) ? parsed.markers.map(formatMarker) : [];
    onPhaseChange?.('analyzing');
    const exam = await createExam(userId, {
      panel_name: parsed?.panel_name || file.name.replace(/\.[^.]+$/, '') || 'Lab upload',
      exam_date: formatExamDate(parsed?.exam_date),
      markers,
      notes: markers.length > 0 ? '' : 'Parsed upload returned no biomarkers.',
      source_file: storagePath,
      storage_path: storagePath,
      status: markers.length > 0 ? 'complete' : 'pending',
    });

    return {
      exam,
      status: exam.status,
      biomarkerCount: exam.markers.length,
      pendingMessage:
        exam.status === 'pending'
          ? 'Your lab report is uploaded. Parsing usually takes 1-2 minutes. We will notify you when biomarkers are ready.'
          : null,
    };
  } catch (error) {
    if (!isParserUnavailable(error)) {
      throw error;
    }

    onPhaseChange?.('analyzing');
    const exam = await createPendingExam(userId, file, storagePath);
    return {
      exam,
      status: 'pending',
      biomarkerCount: 0,
      pendingMessage:
        'Your lab report is uploaded. Parsing usually takes 1-2 minutes. We will notify you when biomarkers are ready.',
    };
  }
}

/**
 * Generate AI insights for a specific exam.
 */
export async function generateExamInsights(exam, userProfile) {
  const prompt = `
    Analyze these blood test results for a user with the following profile:
    - Age: ${userProfile?.age || 'N/A'}
    - Sex: ${userProfile?.sex || 'N/A'}
    - Goals: ${userProfile?.goals || 'N/A'}

    Exam: ${exam.panel_name} (${exam.exam_date})
    Markers: ${JSON.stringify(exam.markers)}

    Provide a concise analysis (max 3 paragraphs) in Portuguese.
    Focus on:
    1. What's looking good.
    2. What needs attention (if anything).
    3. Practical lifestyle/nutrition recommendations.

    Be professional but encouraging.
  `;

  return await invokeLLMJson(prompt, {
    type: 'object',
    properties: {
      analysis: { type: 'string' },
      recommendations: { type: 'array', items: { type: 'string' } },
    },
  });
}
