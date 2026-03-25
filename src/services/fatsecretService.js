/**
 * fatsecretService.js
 *
 * Food search via the `food-search` Supabase Edge Function.
 * The FatSecret CLIENT_SECRET and USDA API key live server-side as Deno secrets
 * and are never bundled into the client.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export async function searchFatSecretFoods(query, language = 'en') {
  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/food-search`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, language }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Search failed: ${response.status}`);
  }

  const data = await response.json();
  return data?.results ?? [];
}
