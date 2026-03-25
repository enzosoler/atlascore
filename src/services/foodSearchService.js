/**
 * Food Search Service v2
 * 
 * Cliente simplificado para a Edge Function de busca de alimentos.
 * - Sem autenticação
 * - Resposta normalizada
 * - Tratamento de erro claro
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

/**
 * Busca alimentos na Edge Function
 * @param {string} query - Termo de busca
 * @param {string} language - Idioma (pt, en, etc)
 * @returns {Promise<{success: boolean, results: Array, error?: string}>}
 */
export async function searchFoods(query, language = 'pt') {
  if (!SUPABASE_URL) {
    console.error('[FoodSearch] SUPABASE_URL not configured');
    return { success: false, results: [], error: 'Service not configured' };
  }

  if (!query || query.trim().length < 2) {
    return { success: false, results: [], error: 'Query too short' };
  }

  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/food-search`,
      {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: query.trim(), 
          language 
        }),
      }
    );

    const data = await response.json();

    // Resposta normalizada - sempre no mesmo formato
    if (data.success && Array.isArray(data.results)) {
      return {
        success: true,
        results: data.results.map(item => ({
          id: item.id,
          name: item.name,
          brand: item.brand,
          calories: item.calories || 0,
          protein: item.protein || 0,
          carbs: item.carbs || 0,
          fat: item.fat || 0,
          source: item.source,
        })),
        provider: data.provider,
        fallbackUsed: data.fallbackUsed,
        count: data.count,
      };
    }

    // Erro controlado do backend
    return {
      success: false,
      results: [],
      error: data.error || 'Search failed',
      provider: data.provider || 'unknown',
    };

  } catch (error) {
    console.error('[FoodSearch] Network error:', error);
    return {
      success: false,
      results: [],
      error: 'Network error. Check connection.',
    };
  }
}

export default searchFoods;
