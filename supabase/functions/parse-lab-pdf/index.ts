/**
 * parse-lab-pdf — Supabase Edge Function
 * Extracts blood test markers from PDFs or images using Google Gemini 2.0 Flash.
 *
 * Deploy:
 *   supabase functions deploy parse-lab-pdf
 *
 * Required secrets:
 *   supabase secrets set GEMINI_API_KEY=xxx
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { buildPreflightResponse, getCorsHeaders } from '../_shared/cors.ts';
import { hasUserAiConsent } from '../_shared/ai-consent.ts';


const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

function makeJson(corsHeaders: Record<string, string>) {
  return function json(payload: unknown, status = 200) {
    return new Response(JSON.stringify(payload), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  };
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  const json = makeJson(corsHeaders);
  if (req.method === 'OPTIONS') {
    return buildPreflightResponse(req);
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
    if (!authHeader.startsWith('Bearer ')) {
      return json({ error: 'Missing authorization header' }, 401);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return json({ error: 'Unauthorized' }, 401);
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const hasConsent = await hasUserAiConsent(supabaseAdmin, user.id, 'lab_pdf');
    if (!hasConsent) {
      return json({
        error: 'Lab PDF parsing requires consent before biomarker data is processed by Google Gemini or another AI provider.',
        code: 'AI_CONSENT_REQUIRED',
      }, 403);
    }

    const { image, mimeType = 'application/pdf' } = await req.json();

    if (!image || typeof image !== 'string') {
      return json({ error: 'image (base64) is required' }, 400);
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      return json({ error: 'GEMINI_API_KEY not configured' }, 503);
    }

    const prompt = `Analyze this blood test report and extract all markers.
    
    For each marker, identify:
    1. Marker name (e.g., "Glucose", "Hemoglobin")
    2. Value (numeric if possible)
    3. Unit (e.g., "mg/dL", "g/dL")
    4. Reference range (e.g., "70-99", "< 100")
    5. Status (one of: "normal", "low", "high", "critical") based on the reference range.
    
    Also identify:
    - Panel name (e.g., "CBC", "Lipid Panel", "General Blood Test")
    - Exam date (YYYY-MM-DD format if found)
    
    Return ONLY a valid JSON object in this exact format:
    {
      "panel_name": "string",
      "exam_date": "YYYY-MM-DD",
      "markers": [
        {
          "name": "string",
          "value": "string",
          "unit": "string",
          "ref_range": "string",
          "status": "normal" | "low" | "high" | "critical"
        }
      ]
    }
    
    If you cannot find a specific field, use null. Be as accurate as possible.`;

    const geminiBody = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: mimeType,
                data: image,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 2048,
      },
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[parse-lab-pdf] Gemini API error:', errorText);
      return json({ error: 'Gemini API error', detail: errorText }, 502);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return json({ error: 'No response from Gemini API' }, 502);
    }

    // Extract JSON from markdown code block if present
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return json({ error: 'Could not parse extraction results', raw: text }, 502);
    }

    const result = JSON.parse(jsonMatch[0]);
    return json(result);
  } catch (err) {
    console.error('[parse-lab-pdf] unexpected error:', err);
    return json({ error: err.message }, 500);
  }
});
