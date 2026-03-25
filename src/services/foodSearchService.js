/**
 * Food Search Service v3 - FatSecret Canonical
 *
 * - searchFoods: uses FatSecret foods.search.v4
 * - getFoodDetails: uses FatSecret food.get.v5
 * - Returns normalized results with explicit provider
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export async function searchFoods(query, language = 'pt', region = 'BR') {
  if (!SUPABASE_URL) {
    return { success: false, results: [], error: 'Service not configured' };
  }

  const trimmed = query?.trim();
  if (!trimmed || trimmed.length < 2) {
    return { success: false, results: [], error: 'Query too short' };
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/food-search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: trimmed,
        language,
        region,
        maxResults: 12,
      }),
    });

    let data = null;
    try {
      data = await response.json();
    } catch {
      return {
        success: false,
        results: [],
        error: `Invalid response from food search service (${response.status})`,
      };
    }

    if (!response.ok) {
      return {
        success: false,
        results: [],
        error: data?.error || `Search failed (${response.status})`,
        provider: data?.provider || 'fatsecret',
      };
    }

    const results = Array.isArray(data?.results) ? data.results : [];

    return {
      success: true,
      provider: data?.provider || 'fatsecret',
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
        source: 'FatSecret',
        sourceId: String(item.sourceId || item.id),
        description: item.description || null,
      })),
    };
  } catch (error) {
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
    const response = await fetch(`${SUPABASE_URL}/functions/v1/food-details`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ foodId }),
    });

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
