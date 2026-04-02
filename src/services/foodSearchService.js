/**
 * Food Search Service v4 - Open Food Facts
 *
 * - searchFoods: uses Open Food Facts API (free, no authentication)
 * - getFoodDetails: uses Open Food Facts API
 * - Returns normalized results with explicit provider
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const SEARCH_TIMEOUT_MS = 10000;
const MAX_RETRIES = 2;

async function fetchWithTimeout(url, options, timeoutMs = SEARCH_TIMEOUT_MS) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(id);
  }
}

async function callFoodSearch(trimmed, language, region, attempt = 1) {
  const response = await fetchWithTimeout(
    `${SUPABASE_URL}/functions/v1/food-search`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(SUPABASE_ANON_KEY
          ? { Authorization: `Bearer ${SUPABASE_ANON_KEY}`, apikey: SUPABASE_ANON_KEY }
          : {}),
      },
      body: JSON.stringify({
        query: trimmed,
        language,
        region,
        maxResults: 12,
      }),
    },
  );

  let data = null;
  try {
    data = await response.json();
  } catch {
    if (attempt < MAX_RETRIES) {
      return callFoodSearch(trimmed, language, region, attempt + 1);
    }
    return {
      success: false,
      results: [],
      error: `Invalid response from food search service (${response.status})`,
    };
  }

  // Retry on 502/503/504 (upstream transient errors)
  if ([502, 503, 504].includes(response.status) && attempt < MAX_RETRIES) {
    await new Promise((r) => setTimeout(r, 500 * attempt));
    return callFoodSearch(trimmed, language, region, attempt + 1);
  }

  if (!response.ok) {
    return {
      success: false,
      results: [],
      error: data?.error || `Search failed (${response.status})`,
      provider: data?.provider || 'open-food-facts',
    };
  }

  const results = Array.isArray(data?.results) ? data.results : [];

  return {
    success: true,
    provider: data?.provider || 'open-food-facts',
    fallbackUsed: !!data?.fallbackUsed,
    count: results.length,
    results: results.map((item) => ({
      id: String(item.id),
      name: item.name || 'Unknown',
      brand: item.brand || null,
      calories: Number(item.calories || 0),
      protein: Number(item.protein || 0),
      carbs: Number(item.carbs || 0),
      fat: Number(item.fat || 0),
      source: 'Open Food Facts',
      sourceId: String(item.sourceId || item.id),
      description: item.description || null,
    })),
  };
}

export async function searchFoods(query, language = 'pt', region = 'BR') {
  if (!SUPABASE_URL) {
    return { success: false, results: [], error: 'Service not configured' };
  }

  const trimmed = query?.trim();
  if (!trimmed || trimmed.length < 2) {
    return { success: false, results: [], error: 'Query too short' };
  }

  try {
    return await callFoodSearch(trimmed, language, region);
  } catch (error) {
    if (error?.name === 'AbortError') {
      return {
        success: false,
        results: [],
        error: 'Search timed out. Please try again.',
      };
    }
    return {
      success: false,
      results: [],
      error: error instanceof Error ? error.message : 'Network error. Check connection.',
    };
  }
}

export async function getFoodDetails(foodId) {
  if (!SUPABASE_URL) {
    return { success: false, error: 'Service not configured' };
  }

  try {
    const response = await fetchWithTimeout(
      `${SUPABASE_URL}/functions/v1/food-details`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(SUPABASE_ANON_KEY
            ? { Authorization: `Bearer ${SUPABASE_ANON_KEY}`, apikey: SUPABASE_ANON_KEY }
            : {}),
        },
        body: JSON.stringify({ foodId }),
      },
    );

    const data = await response.json();

    if (!response.ok || !data?.success) {
      return {
        success: false,
        error: data?.error || `Detail fetch failed (${response.status})`,
      };
    }

    return {
      success: true,
      food: data.food,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

export default searchFoods;
