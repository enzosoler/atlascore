/**
 * parse-lab-pdf — Supabase Edge Function
 *
 * Accepts a base64-encoded PDF or image of a lab exam and uses
 * Google Gemini 2.0 Flash to extract structured markers (name, value,
 * unit, reference range, status).
 *
 * Deploy:
 *   supabase functions deploy parse-lab-pdf
 *
 * Required secrets:
 *   supabase secrets set GEMINI_API_KEY=xxx
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

const EXTRACTION_PROMPT = `You are a clinical lab report parser. Analyze the provided lab exam document and extract ALL biomarkers/results found.

Return a JSON object with this exact structure:
{
  "panel_name": "Name of the exam panel or lab report title",
  "exam_date": "YYYY-MM-DD format if found, otherwise null",
  "markers": [
    {
      "name": "Marker name (e.g., Hemoglobin, TSH, Glucose)",
      "value": 123.4,
      "unit": "unit string (e.g., mg/dL, g/dL, mIU/L)",
      "reference_min": 12.0,
      "reference_max": 16.0,
      "status": "normal|low|high|critical"
    }
  ]
}

Rules:
- Extract EVERY marker/result you can find in the document
- For status: compare value against reference range. "low" if below min, "high" if above max, "critical" if very far out of range (>2x deviation), "normal" otherwise
- If reference range is not provided, set reference_min and reference_max to null and status to "normal"
- Value must be a number. If the result is qualitative (e.g., "Negative", "Reactive"), set value to 0 and include the qualitative result in the name (e.g., "HIV - Negative")
- panel_name should be a concise title for the exam (e.g., "Complete Blood Count", "Lipid Panel", "Hemograma Completo")
- Respond ONLY with the JSON object, no markdown, no explanation`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  try {
    // ── Auth ──────────────────────────────────────────────────────────────
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return json({ error: 'Missing authorization header' }, 401);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey);
    const {
      data: { user },
      error: authError,
    } = await supabaseUser.auth.getUser(
      authHeader.replace('Bearer ', ''),
    );

    if (authError || !user) {
      return json({ error: 'Unauthorized' }, 401);
    }

    // ── Parse request ────────────────────────────────────────────────────
    const body = await req.json();
    const { file_base64, mime_type = 'application/pdf' } = body;

    if (!file_base64 || typeof file_base64 !== 'string') {
      return json({ error: 'file_base64 is required' }, 400);
    }

    // Cap at ~10MB base64
    if (file_base64.length > 14_000_000) {
      return json({ error: 'File too large. Maximum size is 10MB.' }, 400);
    }

    // ── Call Gemini 2.0 Flash with vision ────────────────────────────────
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      return json({ error: 'GEMINI_API_KEY not configured' }, 503);
    }

    // Gemini accepts inline_data with mime_type for both images and PDFs
    const inlineMimeType = mime_type.startsWith('image/')
      ? mime_type
      : 'application/pdf';

    const geminiBody = {
      contents: [
        {
          parts: [
            {
              inline_data: {
                mime_type: inlineMimeType,
                data: file_base64,
              },
            },
            {
              text: EXTRACTION_PROMPT,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 4096,
      },
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiBody),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[parse-lab-pdf] Gemini error:', response.status, errText);
      return json({ error: 'Failed to analyze document' }, 502);
    }

    const result = await response.json();
    const text =
      result?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    if (!text) {
      console.error('[parse-lab-pdf] Empty Gemini response');
      return json({ error: 'Empty response from AI' }, 502);
    }

    // Parse JSON from response
    let parsed;
    try {
      // Strip markdown code fences if present
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[1] : text);
    } catch {
      console.error(
        '[parse-lab-pdf] JSON parse failed:',
        text.substring(0, 500),
      );
      return json({ error: 'Failed to parse extraction results' }, 502);
    }

    // Validate and normalize markers
    const markers = Array.isArray(parsed.markers)
      ? parsed.markers.map((m: Record<string, unknown>) => ({
          name: String(m.name || ''),
          value:
            typeof m.value === 'number'
              ? m.value
              : parseFloat(String(m.value)) || 0,
          unit: String(m.unit || ''),
          reference_min:
            m.reference_min != null ? Number(m.reference_min) : null,
          reference_max:
            m.reference_max != null ? Number(m.reference_max) : null,
          status: ['normal', 'low', 'high', 'critical'].includes(
            String(m.status),
          )
            ? String(m.status)
            : 'normal',
        }))
      : [];

    return json({
      success: true,
      panel_name: parsed.panel_name || null,
      exam_date: parsed.exam_date || null,
      markers,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[parse-lab-pdf] unexpected error:', message);
    return json({ error: message }, 500);
  }
});
