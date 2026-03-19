const API_KEY = import.meta.env.VITE_USDA_API_KEY;
const BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

export async function searchFoods(query) {
  if (!query) return [];

  if (!API_KEY) {
    throw new Error('USDA API key nao configurada.');
  }

  const res = await fetch(
    `${BASE_URL}/foods/search?query=${encodeURIComponent(query)}&pageSize=10&api_key=${API_KEY}`
  );

  if (!res.ok) {
    throw new Error('Nao foi possivel consultar a USDA FoodData Central.');
  }

  const data = await res.json();
  const foods = Array.isArray(data?.foods) ? data.foods : [];

  return foods.map((food) => ({
    id: food.fdcId,
    name: food.description,
    brand: food.brandOwner || null,
    calories: getNutrient(food, 1008),
    protein: getNutrient(food, 1003),
    carbs: getNutrient(food, 1005),
    fat: getNutrient(food, 1004),
  }));
}

function getNutrient(food, nutrientId) {
  return food.foodNutrients?.find((nutrient) => nutrient.nutrientId === nutrientId)?.value || 0;
}
