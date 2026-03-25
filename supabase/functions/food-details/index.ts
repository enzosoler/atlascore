/**
 * food-details
 *
 * Fetch full Open Food Facts nutrition details for one food.
 * Uses Open Food Facts API (free, no authentication required)
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
    const foodId = String(body.foodId || '').trim();

    if (!foodId) {
      return json({
        success: false,
        provider: 'open-food-facts',
        error: 'foodId is required',
      }, 400);
    }

    // Open Food Facts API endpoint for product details
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v3/product/${foodId}.json`,
      {
        method: 'GET',
        headers: {
          'User-Agent': 'Atlas-Core/1.0 (+https://useatlascore.com)',
          'Accept': 'application/json',
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
      console.error('[Open Food Facts details] upstream error', {
        status: res.status,
        body: rawText,
      });

      return json({
        success: false,
        provider: 'open-food-facts',
        error: `Food detail request failed (${res.status})`,
      }, 502);
    }

    const product = data?.product;
    if (!product) {
      return json({
        success: false,
        provider: 'open-food-facts',
        error: 'Food not found',
      }, 404);
    }

    // Extract nutrition facts per 100g and per serving
    const nutrients = product?.nutriments || {};
    
    // Standard serving sizes for common foods
    const servings = [
      {
        id: '100g',
        label: '100g',
        amount: 100,
        unit: 'g',
        grams: 100,
        calories: Math.round(nutrients['energy-kcal_100g'] || nutrients['energy_100g'] || 0),
        protein: Math.round((nutrients['proteins_100g'] || 0) * 10) / 10,
        carbs: Math.round((nutrients['carbohydrates_100g'] || 0) * 10) / 10,
        fat: Math.round((nutrients['fat_100g'] || 0) * 10) / 10,
      },
    ];

    // Add serving size if available
    if (product?.serving_size) {
      const servingSize = parseInt(product.serving_size);
      if (!isNaN(servingSize) && servingSize > 0) {
        servings.push({
          id: 'serving',
          label: `${servingSize}g serving`,
          amount: servingSize,
          unit: 'g',
          grams: servingSize,
          calories: Math.round((nutrients['energy-kcal_100g'] || nutrients['energy_100g'] || 0) * servingSize / 100),
          protein: Math.round((nutrients['proteins_100g'] || 0) * servingSize / 100 * 10) / 10,
          carbs: Math.round((nutrients['carbohydrates_100g'] || 0) * servingSize / 100 * 10) / 10,
          fat: Math.round((nutrients['fat_100g'] || 0) * servingSize / 100 * 10) / 10,
        });
      }
    }

    return json({
      success: true,
      provider: 'open-food-facts',
      food: {
        id: String(product.code || foodId),
        name: product.product_name || product.generic_name || 'Unknown',
        brand: product.brands || null,
        type: product.categories || null,
        servings,
        source: 'Open Food Facts',
      },
    });
  } catch (error) {
    console.error('[food-details] fatal error', error);

    return json({
      success: false,
      provider: 'open-food-facts',
      error: error instanceof Error ? error.message : 'Food details failed',
    }, 502);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json',
    },
  });
}
