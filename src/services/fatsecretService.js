/**
 * fatsecretService.js
 *
 * Food search via the `food-search` Supabase Edge Function.
 * The FatSecret CLIENT_SECRET and USDA API key live server-side as Deno secrets
 * and are never bundled into the client.
 */

import { supabase } from '@/lib/supabaseClient';

export async function searchFatSecretFoods(query, language = 'en') {
  // Get current session to pass auth token
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('Not authenticated. Please sign in again.');
  }

  const { data, error } = await supabase.functions.invoke('food-search', {
    body: { query, language },
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (error) {
    throw new Error(`External search error: ${error.message}`);
  }

  return data?.results ?? [];
}
