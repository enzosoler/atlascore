import { supabase } from '@/lib/supabaseClient';
import { invokeLLMJson } from '@/lib/llm';

const TABLE = 'lab_exams';
const STORAGE_BUCKET = 'lab-exams';

/**
 * List all lab exams for a user.
 */
export async function listExams(userId) {
  if (!userId) return [];
  
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('exam_date', { ascending: false });

  if (error) {
    console.error('[labExamService] listExams error:', error);
    // Fallback to profile_data if table doesn't exist yet
    if (error.code === '42P01' || error.code === 'PGRST204') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('profile_data')
        .eq('id', userId)
        .maybeSingle();
      return profile?.profile_data?.lab_exams || [];
    }
    return [];
  }
  return data || [];
}

/**
 * Create a new lab exam.
 */
export async function createExam(userId, payload) {
  if (!userId) throw new Error('User ID is required');
  
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      user_id: userId,
      panel_name: payload.panel_name || 'Untitled Panel',
      exam_date: payload.exam_date || new Date().toISOString().split('T')[0],
      markers: payload.markers || [],
      notes: payload.notes || '',
      source_file: payload.source_file || null,
    })
    .select()
    .single();

  if (error) {
    console.error('[labExamService] createExam error:', error);
    throw error;
  }
  return data;
}

/**
 * Update an existing lab exam.
 */
export async function updateExam(userId, id, payload) {
  if (!userId || !id) throw new Error('User ID and Exam ID are required');
  
  const { data, error } = await supabase
    .from(TABLE)
    .update({
      panel_name: payload.panel_name,
      exam_date: payload.exam_date,
      markers: payload.markers,
      notes: payload.notes,
      ai_insights: payload.ai_insights,
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('[labExamService] updateExam error:', error);
    throw error;
  }
  return data;
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
  
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(fileName, file);

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
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result.split(',')[1];
        const { data, error } = await supabase.functions.invoke('parse-lab-pdf', {
          body: {
            image: base64,
            mimeType: file.type,
          },
        });

        if (error) throw error;
        resolve(data);
      } catch (err) {
        console.error('[labExamService] extraction error:', err);
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
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
      recommendations: { type: 'array', items: { type: 'string' } }
    }
  });
}
