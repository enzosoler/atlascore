/**
 * food-details
 *
 * Fetch full FatSecret nutrition details for one food.
 * Uses food.get.v5
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const FATSECRET_CLIENT_ID = Deno.env.get('FATSECRET_CLIENT_ID') || '';
const FATSECRET_CLIENT_SECRET = Deno.env.get('FATSECRET_CLIENT_SECRET') || '';

let cachedToken: string | null = null;
let cachedTokenExpiresAt = 0;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return json({ success: false, error: 'Use POST' }, 405);
  }

  try {
    const body = await req.json().catch(() => ({}));
    const foodId = String(body.foodId || '').trim();

    if (!foodId) {
      return json({
        success: false,
        provider: 'fatsecret',
        error: 'foodId is required',
      }, 400);
    }

    const accessToken = await getFatSecretAccessToken();

    const searchParams = new URLSearchParams({
      food_id: foodId,
      format: 'json',
    });

    const res = await fetch(
      `https://platform.fatsecret.com/rest/food/v5?${searchParams.toString()}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const rawText = await res.text();
    let data: any = null;

    try {
      data = rawText ? JSON.parse(rawText) : {};
    } catch {
      data = {};
    }

    if (!res.ok) {
      console.error('[FatSecret details] upstream error', {
        status: res.status,
        body: rawText,
      });

      return json({
        success: false,
        provider: 'fatsecret',
        error: `FatSecret detail request failed (${res.status})`,
      }, 502);
    }

    const food = data?.food;
    if (!food) {
      return json({
        success: false,
        provider: 'fatsecret',
        error: 'Food not found',
      }, 404);
    }

    const servings = normalizeFoodArray(food?.servings?.serving).map((s: any, index: number) => ({
      id: String(s?.serving_id || index),
      label:
        s?.serving_description ||
        `${s?.metric_serving_amount || 1} ${s?.metric_serving_unit || 'serving'}`,
      amount: Number(s?.number_of_units || 1),
      unit: s?.measurement_description || s?.metric_serving_unit || 'serving',
      grams: Number(s?.metric_serving_amount || 0) || null,
      calories: Number(s?.calories || 0),
      protein: Number(s?.protein || 0),
      carbs: Number(s?.carbohydrate || 0),
      fat: Number(s?.fat || 0),
    }));

    return json({
      success: true,
      provider: 'fatsecret',
      food: {
        id: String(food.food_id),
        name: food.food_name,
        brand: food.brand_name || null,
        type: food.food_type || null,
        servings,
        source: 'FatSecret',
      },
    });
  } catch (error) {
    console.error('[food-details] fatal error', error);

    return json({
      success: false,
      provider: 'fatsecret',
      error: error instanceof Error ? error.message : 'Food details failed',
    }, 502);
  }
});

async function getFatSecretAccessToken(): Promise<string> {
  const now = Date.now();

  if (cachedToken && now < cachedTokenExpiresAt - 60_000) {
    return cachedToken;
  }

  const auth = btoa(`${FATSECRET_CLIENT_ID}:${FATSECRET_CLIENT_SECRET}`);
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    scope: 'basic premier',
  });

  const res = await fetch('https://oauth.fatsecret.com/connect/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  const rawText = await res.text();
  let data: any = null;

  try {
    data = rawText ? JSON.parse(rawText) : {};
  } catch {
    data = {};
  }

  if (!res.ok || !data?.access_token) {
    console.error('[FatSecret token] failed', {
      status: res.status,
      body: rawText,
    });
    throw new Error(`FatSecret token request failed (${res.status})`);
  }

  cachedToken = data.access_token;
  cachedTokenExpiresAt = now + Number(data.expires_in || 3600) * 1000;

  return cachedToken!;
}

function normalizeFoodArray(value: any): any[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json',
    },
  });
}
