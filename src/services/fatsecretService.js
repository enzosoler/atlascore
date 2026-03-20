import { getAuthToken } from './fatsecretAuthService';

const BASE_URL = 'https://platform.fatsecret.com/rest/server.api';

export async function searchFatSecretFoods(query, language = 'en') {
  const token = await getAuthToken();

  const params = new URLSearchParams({
    method: 'foods.search',
    search_expression: query,
    format: 'json',
    max_results: 20,
    page_number: 0,
  });

  // Add language and region if not English
  if (language !== 'en') {
    // FatSecret API uses 'language' and 'region' parameters for localization
    // Assuming 'pt' for Portuguese, and 'BR' for Brazil region for better results
    params.append('language', language);
    params.append('region', 'BR'); // Or 'PT' for Portugal, depending on target
  }

  const res = await fetch(`${BASE_URL}?${params.toString()}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`FatSecret API error: ${res.status} - ${errorText}`);
  }

  const data = await res.json();
  const foods = data?.foods?.food || [];

  // Normalize results to a consistent internal format
  return foods.map(food => ({
    id: food.food_id,
    name: food.food_name,
    brand: food.brand_name || null,
    calories: extractNutrient(food.food_description, 'Calories'),
    protein: extractNutrient(food.food_description, 'Protein'),
    carbs: extractNutrient(food.food_description, 'Carbs'),
    fat: extractNutrient(food.food_description, 'Fat'),
  }));
}

function extractNutrient(description, nutrientName) {
  const regex = new RegExp(`${nutrientName}: (\\d+\\.\\d+|\\d+)`);
  const match = description.match(regex);
  return match ? parseFloat(match[1]) : 0;
}
