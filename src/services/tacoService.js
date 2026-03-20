/**
 * TACO Search Service
 *
 * Busca instantânea e offline na Tabela Brasileira de Composição de Alimentos.
 * Sem API, sem custo, sem latência.
 *
 * Suporta:
 *  - Acentos opcionais ("açúcar" == "acucar")
 *  - Busca parcial por múltiplas palavras ("frango gre" → "Frango, peito, grelhado")
 *  - Aliases (sinônimos e nomes populares)
 *  - Retorna resultados no mesmo formato que FatSecret/USDA para substituição direta
 */

import { TACO } from '@/lib/tacoDatabase';

/** Remove acentos e normaliza para minúsculas */
function normalize(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/** Cache de strings normalizadas para performance */
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
 * Busca alimentos no banco TACO.
 *
 * @param {string} query - Texto digitado pelo usuário (PT ou EN, com ou sem acento)
 * @param {number} limit - Máximo de resultados (padrão: 10)
 * @returns {Array} - Array de objetos { id, name, calories, protein, carbs, fat, brand }
 */
export function searchTaco(query, limit = 10) {
  if (!query || query.trim().length < 2) return [];

  const words = normalize(query).split(/\s+/).filter((w) => w.length > 0);

  const results = TACO.filter((food) => {
    const text = getSearchText(food);
    return words.every((w) => text.includes(w));
  });

  // Ordenação: menor nome primeiro (mais específico) depois de filtrar
  results.sort((a, b) => a.name.length - b.name.length);

  return results.slice(0, limit).map((food) => ({
    id: food.id,
    name: food.name,
    calories: food.kcal,
    protein: food.protein,
    carbs: food.carbs,
    fat: food.fat,
    brand: 'TACO',    // identifica a fonte na UI
    category: food.category,
  }));
}

export default searchTaco;
