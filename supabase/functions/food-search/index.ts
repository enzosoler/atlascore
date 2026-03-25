/**
 * food-search
 *
 * Canonical external food search using Open Food Facts API.
 * - 100% Free (Non-profit, crowdsourced database)
 * - No API keys required
 * - Global food database with excellent Portuguese support
 * - Returns normalized results with images and macros
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return json({ success: false, error: 'Use POST' }, 405);
  }

  try {
    const body = await req.json().catch(() => ({}));
    const query = String(body.query || '').trim();
    const page = Number(body.page || 1); // Open Food Facts uses 1-based pagination
    const pageSize = Math.min(Number(body.maxResults || 12), 50);

    if (query.length < 2) {
      return json({
        success: false,
        provider: 'open-food-facts',
        error: 'Query too short',
        results: [],
        count: 0,
      }, 400);
    }

    // Open Food Facts search endpoint
    // Using the search API with JSON response
    const searchUrl = new URL('https://world.openfoodfacts.org/cgi/search.pl');
    searchUrl.searchParams.set('search_terms', query);
    searchUrl.searchParams.set('page', String(page));
    searchUrl.searchParams.set('page_size', String(pageSize));
    searchUrl.searchParams.set('json', '1');
    searchUrl.searchParams.set('action', 'process');

    const res = await fetch(searchUrl.toString(), {
      method: 'GET',
      headers: {
        'User-Agent': 'Atlas-Core/1.0 (+https://useatlascore.com)',
        'Accept': 'application/json',
      },
    });

    const rawText = await res.text();
    let data: any = null;

    try {
      data = rawText ? JSON.parse(rawText) : {};
    } catch {
      data = {};
    }

    if (!res.ok) {
      console.error('[Open Food Facts search] upstream error', {
        status: res.status,
        body: rawText,
      });

      return json({
        success: false,
        provider: 'open-food-facts',
        error: `Search failed (${res.status})`,
        results: [],
        count: 0,
      }, 502);
    }

    // Normalize Open Food Facts response
    const products = data?.products || [];

    const results = products
      .map(mapOpenFoodFactsProduct)
      .filter(Boolean)
      .slice(0, pageSize);

    return json({
      success: true,
      provider: 'open-food-facts',
      fallbackUsed: false,
      query,
      count: results.length,
      results,
    });
  } catch (error) {
    console.error('[food-search] fatal error', error);

    return json({
      success: false,
      provider: 'open-food-facts',
      error: error instanceof Error ? error.message : 'Search failed',
      results: [],
      count: 0,
    }, 502);
  }
});

function mapOpenFoodFactsProduct(product: any) {
  const productId = String(product?.id || product?.code || '').trim();
  const productName = String(product?.product_name || product?.generic_name || '').trim();

  if (!productId || !productName) return null;

  // Extract nutrition facts per 100g
  const nutrients = product?.nutriments || {};
  
  const getCalories = () => {
    const kcal = nutrients['energy-kcal_100g'] || nutrients['energy_100g'] || 0;
    return Math.round(kcal);
  };

  const getProtein = () => {
    return Math.round((nutrients['proteins_100g'] || 0) * 10) / 10;
  };

  const getCarbs = () => {
    return Math.round((nutrients['carbohydrates_100g'] || 0) * 10) / 10;
  };

  const getFat = () => {
    return Math.round((nutrients['fat_100g'] || 0) * 10) / 10;
  };

  return {
    id: productId,
    name: productName,
    brand: product?.brands || null,
    calories: getCalories(),
    protein: getProtein(),
    carbs: getCarbs(),
    fat: getFat(),
    source: 'Open Food Facts',
    sourceId: productId,
    foodType: product?.categories || null,
    description: product?.serving_size || '100g',
    image: product?.image_front_url || product?.image_url || null,
  };
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
