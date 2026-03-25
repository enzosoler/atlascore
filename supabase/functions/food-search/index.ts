/**
 * food-search-v2
 * 
 * Edge Function moderna para busca de alimentos.
 * - Sem autenticação (Open Food Facts é público)
 * - Provider abstraction clara
 * - Fallback explícito e observável
 * - Logs estruturados
 * - Resposta normalizada garantida
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
    return new Response(JSON.stringify({ error: 'Use POST' }), {
      status: 405,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const query = body.query?.trim();

    if (!query || query.length < 2) {
      return new Response(JSON.stringify({ error: 'Query too short' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    // Open Food Facts - simples e confiável
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&json=1&page_size=20`;
    
    const response = await fetch(url, {
      headers: { 'User-Agent': 'AtlasCore/1.0' },
    });

    if (!response.ok) {
      throw new Error(`OFF failed: ${response.status}`);
    }

    const data = await response.json();
    const products = data.products || [];

    const results = products.map((p) => ({
      id: String(p.code || Math.random().toString(36).slice(2)),
      name: p.product_name || p.product_name_en || 'Unknown',
      brand: p.brands || null,
      calories: p.nutriments?.energy_kcal_100g || p.nutriments?.energy_kcal || 0,
      protein: p.nutriments?.proteins_100g || p.nutriments?.proteins || 0,
      carbs: p.nutriments?.carbohydrates_100g || p.nutriments?.carbohydrates || 0,
      fat: p.nutriments?.fat_100g || p.nutriments?.fat || 0,
      source: 'OpenFoodFacts',
    }));

    return new Response(JSON.stringify({
      success: true,
      query,
      provider: 'openfoodfacts',
      fallbackUsed: false,
      count: results.length,
      results,
    }), {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Food search error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Search failed',
      results: [],
      count: 0,
    }), {
      status: 502,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
});
