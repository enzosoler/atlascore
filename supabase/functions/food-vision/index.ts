/**
 * food-vision — Supabase Edge Function
 *
 * Analyzes food images using Google Gemini 2.0 Flash Vision API.
 * Returns detected foods with estimated macros and portions.
 *
 * Deploy:
 *   supabase functions deploy food-vision
 *
 * Set secret:
 *   supabase secrets set GEMINI_API_KEY=xxx
 *
 * Invoked from frontend via:
 *   supabase.functions.invoke('food-vision', { body: { image, mimeType } })
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

interface DetectedFood {
  name: string;
  estimatedAmount: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  confidence: number;
}

async function analyzeFoodWithGemini(base64Image: string, mimeType: string): Promise<DetectedFood[]> {
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const prompt = `Analyze this food image and identify all visible food items.

For each food item, estimate:
1. Food name (in English)
2. Estimated portion/amount (e.g., "1 medium bowl", "2 slices", "150g")
3. Calories (kcal)
4. Protein (g)
5. Carbs (g)
6. Fat (g)
7. Confidence score (0-1) based on how clearly identifiable the food is

Return ONLY a valid JSON array in this exact format:
[
  {
    "name": "food name",
    "estimatedAmount": "portion description",
    "calories": 0,
    "protein": 0,
    "carbs": 0,
    "fat": 0,
    "confidence": 0.95
  }
]

Be realistic with portion estimates. If unsure about an item, include it with lower confidence.`;

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: mimeType,
              data: base64Image,
            },
          },
        ],
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 2048,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('No response from Gemini API');
  }

  // Extract JSON from response
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('Could not parse food detection results');
  }

  try {
    const foods: DetectedFood[] = JSON.parse(jsonMatch[0]);
    return foods.map(f => ({
      ...f,
      calories: Math.round(f.calories || 0),
      protein: Math.round((f.protein || 0) * 10) / 10,
      carbs: Math.round((f.carbs || 0) * 10) / 10,
      fat: Math.round((f.fat || 0) * 10) / 10,
      confidence: Math.max(0, Math.min(1, f.confidence || 0.5)),
    }));
  } catch (e) {
    console.error('Failed to parse Gemini response:', text);
    throw new Error('Invalid response format from AI');
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  // Require authentication
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
      status: 401,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser(
    authHeader.replace('Bearer ', '')
  );

  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  // Parse request
  let body: { image?: string; mimeType?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  const { image, mimeType = 'image/jpeg' } = body;

  if (!image || typeof image !== 'string') {
    return new Response(JSON.stringify({ error: 'image (base64) is required' }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  try {
    const foods = await analyzeFoodWithGemini(image, mimeType);

    return new Response(JSON.stringify({ foods }), {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('food-vision error:', message);

    return new Response(JSON.stringify({ error: 'Analysis failed', detail: message }), {
      status: 502,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
});
