/**
 * TACO Search Service
 *
 * Instant offline search over the Brazilian TACO food composition table.
 * No API, no cost, no latency.
 *
 * Supports:
 *  - Optional accents
 *  - Multi-word partial matching
 *  - Aliases and common names
 *  - Results in the same shape used by FatSecret/USDA integrations
 */

import { TACO } from '@/lib/tacoDatabase';

/** Remove accents and normalize to lowercase. */
function normalize(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/** Cache normalized strings for performance. */
const _indexCache = new Map();

function getSearchText(food) {
  if (_indexCache.has(food.id)) return _indexCache.get(food.id);
  const text = normalize(
    [food.name, ...(food.aliases || [])].join(' ')
  );
  _indexCache.set(food.id, text);
  return text;
}

/**
 * Search foods in the TACO database.
 *
 * @param {string} query - User-entered text.
 * @param {number} limit - Maximum number of results.
 * @returns {Array} - Array of objects { id, name, calories, protein, carbs, fat, brand }
 */
export function searchTaco(query, limit = 10) {
  if (!query || query.trim().length < 2) return [];

  const words = normalize(query).split(/\s+/).filter((w) => w.length > 0);

  const results = TACO.filter((food) => {
    const text = getSearchText(food);
    return words.every((w) => text.includes(w));
  });

  // Sort by shorter names first after filtering for more specific matches.
  results.sort((a, b) => a.name.length - b.name.length);

  return results.slice(0, limit).map((food) => ({
    id: food.id,
    name: food.name,
    calories: food.kcal,
    protein: food.protein,
    carbs: food.carbs,
    fat: food.fat,
    brand: 'TACO',
    category: food.category,
  }));
}

export default searchTaco;
