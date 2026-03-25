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

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURAÇÃO
// ─────────────────────────────────────────────────────────────────────────────

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Ordem de prioridade dos providers
const PROVIDERS = {
  PRIMARY: 'openfoodfacts',
  FALLBACK: 'fatsecret',
};

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────────────────

type FoodItem = {
  id: string;
  name: string;
  brand: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  source: string;
};

type SearchResult = {
  success: boolean;
  query: string;
  provider: string;
  fallbackUsed: boolean;
  results: FoodItem[];
  count: number;
  error?: string;
  executionTimeMs: number;
};

type ProviderResponse = {
  success: boolean;
  results: FoodItem[];
  error?: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// LOGGER ESTRUTURADO
// ─────────────────────────────────────────────────────────────────────────────

function log(level: 'INFO' | 'WARN' | 'ERROR', event: string, data?: Record<string, unknown>) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    service: 'food-search',
    event,
    ...data,
  };
  console.log(JSON.stringify(logEntry));
}

// ─────────────────────────────────────────────────────────────────────────────
// PROVIDER: OPEN FOOD FACTS (Primário - Público, Gratuito, Confiável)
// ─────────────────────────────────────────────────────────────────────────────

async function searchOpenFoodFacts(query: string): Promise<ProviderResponse> {
  const startTime = Date.now();
  
  try {
    log('INFO', 'provider_search_start', { 
      provider: 'openfoodfacts', 
      query: query.substring(0, 30),
    });

    const url = `https://world.openfoodfacts.org/cgi/search.pl?` + 
      `search_terms=${encodeURIComponent(query)}&` +
      `json=1&` +
      `page_size=20&` +
      `sort_by=popularity`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'AtlasCore/1.0 (contact@atlascore.app)',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const products = data.products || [];

    const results: FoodItem[] = products.map((product: any) => ({
      id: String(product.code || Math.random().toString(36).slice(2)),
      name: product.product_name || product.product_name_en || 'Unknown product',
      brand: product.brands || null,
      calories: product.nutriments?.energy_kcal_100g || 
                product.nutriments?.energy_kcal || 0,
      protein: product.nutriments?.proteins_100g || 
               product.nutriments?.proteins || 0,
      carbs: product.nutriments?.carbohydrates_100g || 
             product.nutriments?.carbohydrates || 0,
      fat: product.nutriments?.fat_100g || 
           product.nutriments?.fat || 0,
      source: 'OpenFoodFacts',
    }));

    const executionTime = Date.now() - startTime;
    
    log('INFO', 'provider_search_complete', {
      provider: 'openfoodfacts',
      query: query.substring(0, 30),
      resultsCount: results.length,
      executionTimeMs: executionTime,
    });

    return { success: true, results };

  } catch (error) {
    const executionTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    log('ERROR', 'provider_search_failed', {
      provider: 'openfoodfacts',
      query: query.substring(0, 30),
      error: errorMessage,
      executionTimeMs: executionTime,
    });

    return { 
      success: false, 
      results: [], 
      error: errorMessage,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PROVIDER: FATSECRET (Fallback - Requer credenciais)
// ─────────────────────────────────────────────────────────────────────────────

let fatSecretToken: string | null = null;
let fatSecretTokenExpiry = 0;

async function getFatSecretToken(): Promise<string> {
  const now = Date.now();
  
  if (fatSecretToken && now < fatSecretTokenExpiry) {
    return fatSecretToken;
  }

  const clientId = Deno.env.get('FATSECRET_CLIENT_ID');
  const clientSecret = Deno.env.get('FATSECRET_CLIENT_SECRET');

  if (!clientId || !clientSecret) {
    throw new Error('FatSecret credentials not configured');
  }

  const authString = btoa(`${clientId}:${clientSecret}`);

  const response = await fetch('https://oauth.fatsecret.com/connect/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${authString}`,
    },
    body: 'grant_type=client_credentials&scope=basic',
  });

  if (!response.ok) {
    throw new Error(`Token request failed: ${response.status}`);
  }

  const data = await response.json();
  fatSecretToken = data.access_token;
  fatSecretTokenExpiry = now + (data.expires_in * 1000) - 60000;

  return fatSecretToken;
}

function extractNutrient(description: string, name: string): number {
  const match = description?.match(new RegExp(`${name}: (\\d+\\.?\\d*)`));
  return match ? parseFloat(match[1]) : 0;
}

async function searchFatSecret(query: string, language = 'en'): Promise<ProviderResponse> {
  const startTime = Date.now();
  
  try {
    log('INFO', 'provider_search_start', { 
      provider: 'fatsecret', 
      query: query.substring(0, 30),
      language,
    });

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
    }

    const response = await fetch(
      `https://platform.fatsecret.com/rest/server.api?${params.toString()}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const foods = data?.foods?.food || [];
    const foodArray = Array.isArray(foods) ? foods : [foods];

    const results: FoodItem[] = foodArray.map((food: any) => ({
      id: String(food.food_id),
      name: food.food_name,
      brand: food.brand_name || null,
      calories: extractNutrient(food.food_description, 'Calories'),
      protein: extractNutrient(food.food_description, 'Protein'),
      carbs: extractNutrient(food.food_description, 'Carbs'),
      fat: extractNutrient(food.food_description, 'Fat'),
      source: 'FatSecret',
    }));

    const executionTime = Date.now() - startTime;
    
    log('INFO', 'provider_search_complete', {
      provider: 'fatsecret',
      query: query.substring(0, 30),
      resultsCount: results.length,
      executionTimeMs: executionTime,
    });

    return { success: true, results };

  } catch (error) {
    const executionTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    log('ERROR', 'provider_search_failed', {
      provider: 'fatsecret',
      query: query.substring(0, 30),
      error: errorMessage,
      executionTimeMs: executionTime,
    });

    return { 
      success: false, 
      results: [], 
      error: errorMessage,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SEARCH ENGINE COM FALLBACK
// ─────────────────────────────────────────────────────────────────────────────

async function executeSearch(
  query: string, 
  language = 'en'
): Promise<SearchResult> {
  const startTime = Date.now();

  log('INFO', 'search_start', { 
    query: query.substring(0, 30), 
    language,
    primaryProvider: PROVIDERS.PRIMARY,
  });

  // 1. Tenta provider primário
  let primaryResult = await searchOpenFoodFacts(query);

  // 2. Se primário falhou ou retornou vazio, tenta fallback
  if (!primaryResult.success || primaryResult.results.length === 0) {
    log('WARN', 'primary_failed_triggering_fallback', {
      primaryProvider: PROVIDERS.PRIMARY,
      fallbackProvider: PROVIDERS.FALLBACK,
      primaryError: primaryResult.error,
      primaryResultsCount: primaryResult.results.length,
    });

    const fallbackResult = await searchFatSecret(query, language);

    if (fallbackResult.success && fallbackResult.results.length > 0) {
      const executionTime = Date.now() - startTime;
      
      log('INFO', 'fallback_success', {
        fallbackProvider: PROVIDERS.FALLBACK,
        resultsCount: fallbackResult.results.length,
        executionTimeMs: executionTime,
      });

      return {
        success: true,
        query,
        provider: PROVIDERS.FALLBACK,
        fallbackUsed: true,
        results: fallbackResult.results,
        count: fallbackResult.results.length,
        executionTimeMs: executionTime,
      };
    }

    // Ambos falharam
    const executionTime = Date.now() - startTime;
    const combinedError = `Primary: ${primaryResult.error || 'empty'} | Fallback: ${fallbackResult.error || 'empty'}`;
    
    log('ERROR', 'both_providers_failed', {
      query: query.substring(0, 30),
      primaryError: primaryResult.error,
      fallbackError: fallbackResult.error,
      executionTimeMs: executionTime,
    });

    return {
      success: false,
      query,
      provider: 'none',
      fallbackUsed: false,
      results: [],
      count: 0,
      error: combinedError,
      executionTimeMs: executionTime,
    };
  }

  // Primário funcionou
  const executionTime = Date.now() - startTime;

  log('INFO', 'search_complete_primary', {
    provider: PROVIDERS.PRIMARY,
    resultsCount: primaryResult.results.length,
    executionTimeMs: executionTime,
  });

  return {
    success: true,
    query,
    provider: PROVIDERS.PRIMARY,
    fallbackUsed: false,
    results: primaryResult.results,
    count: primaryResult.results.length,
    executionTimeMs: executionTime,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// HANDLER HTTP
// ─────────────────────────────────────────────────────────────────────────────

serve(async (req) => {
  const requestId = crypto.randomUUID();
  const requestStart = Date.now();

  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  // Só aceita POST
  if (req.method !== 'POST') {
    log('WARN', 'invalid_method', { method: req.method, requestId });
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Method not allowed. Use POST.',
      }), {
        status: 405,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      }
    );
  }

  // Parse body
  let body: { query?: string; language?: string };
  
  try {
    body = await req.json();
  } catch {
    log('ERROR', 'invalid_json', { requestId });
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Invalid JSON body',
      }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      }
    );
  }

  // Validação
  const { query, language = 'en' } = body;

  if (!query || typeof query !== 'string' || query.trim().length < 2) {
    log('WARN', 'invalid_query', { 
      query: query?.substring(0, 30), 
      requestId,
    });
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Query must be at least 2 characters',
      }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      }
    );
  }

  // Executa busca
  const result = await executeSearch(query.trim(), language);

  // Log do resultado
  log('INFO', 'request_complete', {
    requestId,
    query: query.substring(0, 30),
    success: result.success,
    provider: result.provider,
    fallbackUsed: result.fallbackUsed,
    resultsCount: result.count,
    totalExecutionTimeMs: Date.now() - requestStart,
  });

  // Retorna resposta
  return new Response(JSON.stringify(result), {
    status: result.success ? 200 : 502,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
});
