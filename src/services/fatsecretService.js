/**
 * fatsecretService.js
 *
 * Food search via the `food-search` Supabase Edge Function.
 * The FatSecret CLIENT_SECRET and USDA API key live server-side as Deno secrets
 * and are never bundled into the client.
 */

import { supabase } from '@/lib/supabaseClient';

export async function searchFatSecretFoods(query, language = 'en') {
  const { data, error } = await supabase.functions.invoke('food-search', {
    body: { provider: 'fatsecret', query, language },
  });

  if (error) {
    throw new Error(`FatSecret search error: ${error.message}`);
  }

  return data?.results ?? [];
}
