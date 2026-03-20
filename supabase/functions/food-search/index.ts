/**
 * food-search — Supabase Edge Function
 *
 * Proxies food search requests to FatSecret and USDA FoodData Central.
 * All API keys live as Deno secrets and NEVER reach the browser.
 *
 * Deploy:
 *   supabase functions deploy food-search
 *
 * Set secrets:
 *   supabase secrets set FATSECRET_CLIENT_ID=xxx
 *   supabase secrets set FATSECRET_CLIENT_SECRET=xxx
 *   supabase secrets set USDA_API_KEY=xxx
 *
 * Invoked from the frontend via:
 *   supabase.functions.invoke('food-search', { body: { provider, query, language } })
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// ── FatSecret OAuth token cache ───────────────────────────────────────────────
let _fatSecretToken: string | null = null;
let _fatSecretTokenExpiry = 0;

async function getFatSecretToken(): Promise<string> {
  if (_fatSecretToken && Date.now() < _fatSecretTokenExpiry) {
    return _fatSecretToken;
  }

  const clientId = Deno.env.get('FATSECRET_CLIENT_ID');
  const clientSecret = Deno.env.get('FATSECRET_CLIENT_SECRET');

  if (!clientId || !clientSecret) {
    throw new Error('FatSecret credentials not configured. Set FATSECRET_CLIENT_ID and FATSECRET_CLIENT_SECRET.');
  }

  const authString = btoa(`${clientId}:${clientSecret}`);

  const res = await fetch('https://oauth.fatsecret.com/connect/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${authString}`,
    },
    body: 'grant_type=client_credentials&scope=basic',
  });

  if (!res.ok) {
    throw new Error(`FatSecret token error: ${res.status}`);
  }

  const data = await res.json();
  _fatSecretToken = data.access_token;
  _fatSecretTokenExpiry = Date.now() + (data.expires_in * 1000) - 60_000;

  return _fatSecretToken!;
}

// ── FatSecret food search ─────────────────────────────────────────────────────
async function searchFatSecret(query: string, language = 'en') {
  const token = await getFatSecretToken();

  const params = new URLSearchParams({
    method: 'foods.search',
    search_expression: query,
    format: 'json',
    max_results: '20',
    page_number: '0',
  });

  if (language !== 'en') {
    params.append('language', language);
    params.append('region', 'BR');
  }

  const res = await fetch(`https://platform.fatsecret.com/rest/server.api?${params.toString()}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`FatSecret search error: ${res.status}`);
  }

  const data = await res.json();
  const foods = data?.foods?.food || [];

  return foods.map((food: any) => ({
    id: food.food_id,
    name: food.food_name,
    brand: food.brand_name || null,
    calories: extractNutrient(food.food_description, 'Calories'),
    protein: extractNutrient(food.food_description, 'Protein'),
    carbs: extractNutrient(food.food_description, 'Carbs'),
    fat: extractNutrient(food.food_description, 'Fat'),
    source_api: 'FatSecret',
  }));
}

function extractNutrient(description: string, name: string): number {
  const match = description?.match(new RegExp(`${name}: (\\d+\\.?\\d*)`));
  return match ? parseFloat(match[1]) : 0;
}

// ── USDA food search ──────────────────────────────────────────────────────────
async function searchUSDA(query: string) {
  const apiKey = Deno.env.get('USDA_API_KEY');
  if (!apiKey) throw new Error('USDA_API_KEY not configured.');

  const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=20&api_key=${apiKey}`;
  const res = await fetch(url);

  if (!res.ok) throw new Error(`USDA error: ${res.status}`);

  const data = await res.json();
  return (data.foods || []).map((food: any) => ({
    id: String(food.fdcId),
    name: food.description,
    brand: food.brandOwner || null,
    calories: food.foodNutrients?.find((n: any) => n.nutrientName === 'Energy')?.value || 0,
    protein: food.foodNutrients?.find((n: any) => n.nutrientName === 'Protein')?.value || 0,
    carbs: food.foodNutrients?.find((n: any) => n.nutrientName === 'Carbohydrate, by difference')?.value || 0,
    fat: food.foodNutrients?.find((n: any) => n.nutrientName === 'Total lipid (fat)')?.value || 0,
    source_api: 'USDA',
  }));
}

// ── Handler ───────────────────────────────────────────────────────────────────
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

  // ── Require authentication ─────────────────────────────────────────────────
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

  // ── Parse request ──────────────────────────────────────────────────────────
  let body: { provider?: string; query?: string; language?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  const { provider = 'fatsecret', query, language = 'en' } = body;

  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return new Response(JSON.stringify({ error: 'query is required' }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  try {
    let results: any[];

    if (provider === 'usda') {
      results = await searchUSDA(query.trim());
    } else {
      results = await searchFatSecret(query.trim(), language);
    }

    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`food-search error [${provider}]:`, message);
    return new Response(JSON.stringify({ error: 'Search failed', detail: message }), {
      status: 502,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
});
