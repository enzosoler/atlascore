/**
 * Nutrition AI client — thin wrapper over the `log-food-text` Supabase edge
 * function. That function runs GPT-4.1-nano, accepts natural language in any
 * locale, and returns a structured meal breakdown.
 *
 * Usage:
 *   const meal = await parseFoodText('dois ovos com arroz e banana');
 *   // { food_name, serving_description, calories, protein, carbs, fat,
 *   //   confidence, items: [{name, estimated_grams, calories, ...}] }
 */

import { authHeaders } from '../lib/supabaseAuth';

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || '';

/**
 * Call the AI nutrition parser.
 * @param {string} text — natural-language meal description
 * @param {{ language?: string, signal?: AbortSignal }} [opts]
 * @returns {Promise<object>} parsed meal
 */
export async function parseFoodText(text, opts = {}) {
  const trimmed = (text || '').trim();
  if (!trimmed) throw new Error('Empty input');

  if (!SUPABASE_URL) {
    // No backend — fall back to a tiny heuristic parser so the UI still works
    // locally during dev. Replace this with a real error toast if you'd rather
    // surface "AI offline" to the user.
    return heuristicParse(trimmed);
  }

  const res = await fetch(`${SUPABASE_URL}/functions/v1/log-food-text`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ text: trimmed, response_language: opts.language || 'auto' }),
    signal: opts.signal,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`AI parse failed (${res.status}): ${body.slice(0, 120)}`);
  }
  const data = await res.json();
  // The edge function may wrap its payload — unwrap common shapes.
  return data?.result || data?.data || data;
}

/**
 * Heuristic fallback used when Supabase env vars are missing (dev preview
 * without a connected backend). Tokenizes the text and spits out plausible
 * macros so the Atlas AI UX is demoable end-to-end.
 */
function heuristicParse(text) {
  const tokens = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').split(/\s*(?:,|e|and|with|com|\+)\s*/);
  const items = tokens
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 6)
    .map((t, i) => {
      const qty = parseQuantity(t);
      const base = HEURISTIC_TABLE.find((row) => row.match.test(t)) || HEURISTIC_TABLE[HEURISTIC_TABLE.length - 1];
      const mult = qty || 1;
      return {
        id: `ai-${i}`,
        name: capitalize(t.replace(/^[\d\s\w]*(?=[a-zA-Z])/, '').trim() || base.name),
        portion: base.portionAmount * mult,
        unit: base.unit,
        calories: Math.round(base.kcal * mult),
        protein:  +(base.p * mult).toFixed(1),
        carbs:    +(base.c * mult).toFixed(1),
        fat:      +(base.f * mult).toFixed(1),
        confidence: 0.7,
      };
    });
  const totals = items.reduce(
    (a, x) => ({ calories: a.calories + x.calories, protein: a.protein + x.protein, carbs: a.carbs + x.carbs, fat: a.fat + x.fat }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
  return {
    food_name: text.slice(0, 60),
    serving_description: `${items.length} item${items.length === 1 ? '' : 's'}`,
    confidence: 0.7,
    ...totals,
    items,
  };
}

function parseQuantity(t) {
  const m = t.match(/(\d+(?:[.,]\d+)?)/);
  if (!m) {
    if (/\bdois\b|\btwo\b/.test(t)) return 2;
    if (/\btres\b|\btrês\b|\bthree\b/.test(t)) return 3;
    if (/\bquatro\b|\bfour\b/.test(t)) return 4;
    return 0;
  }
  return Number(m[1].replace(',', '.'));
}
function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

const HEURISTIC_TABLE = [
  { match: /\b(ovo|ovos|egg|eggs)\b/,                 name: 'Egg',            portionAmount: 1,   unit: 'unit',  kcal: 72,  p: 6,  c: 0,  f: 5  },
  { match: /\b(arroz|rice)\b/,                        name: 'Rice',           portionAmount: 100, unit: 'g',     kcal: 130, p: 2.5,c: 28, f: 0.3 },
  { match: /\b(frango|chicken|peito)\b/,              name: 'Chicken breast', portionAmount: 100, unit: 'g',     kcal: 165, p: 31, c: 0,  f: 3.6 },
  { match: /\b(feij[ãa]o|beans)\b/,                   name: 'Black beans',    portionAmount: 100, unit: 'g',     kcal: 132, p: 9,  c: 24, f: 0.5 },
  { match: /\b(banana)\b/,                            name: 'Banana',         portionAmount: 1,   unit: 'med',   kcal: 105, p: 1,  c: 27, f: 0.3 },
  { match: /\b(p[ãa]o|bread|toast|torrada)\b/,        name: 'Bread',          portionAmount: 1,   unit: 'slice', kcal: 80,  p: 4,  c: 14, f: 1   },
  { match: /\b(leite|milk)\b/,                        name: 'Milk',           portionAmount: 200, unit: 'ml',    kcal: 100, p: 7,  c: 12, f: 2.5 },
  { match: /\b(caf[ée]|coffee)\b/,                    name: 'Coffee',         portionAmount: 1,   unit: 'cup',   kcal: 2,   p: 0,  c: 0,  f: 0   },
  { match: /\b(queijo|cheese)\b/,                     name: 'Cheese',         portionAmount: 30,  unit: 'g',     kcal: 115, p: 7,  c: 1,  f: 9   },
  { match: /\b(iogurte|yogurt|yoghurt)\b/,            name: 'Yogurt',         portionAmount: 170, unit: 'g',     kcal: 100, p: 17, c: 6,  f: 0   },
  { match: /\b(pizza)\b/,                             name: 'Pizza slice',    portionAmount: 1,   unit: 'slice', kcal: 285, p: 12, c: 36, f: 10  },
  { match: /\b(salada|salad)\b/,                      name: 'Salad',          portionAmount: 1,   unit: 'bowl',  kcal: 90,  p: 3,  c: 12, f: 4   },
  { match: /\b(carne|beef|hamburguer|burger)\b/,      name: 'Beef',           portionAmount: 100, unit: 'g',     kcal: 176, p: 20, c: 0,  f: 10  },
  { match: /\b(salm[ãa]o|salmon|peixe|fish)\b/,       name: 'Salmon',         portionAmount: 100, unit: 'g',     kcal: 208, p: 22, c: 0,  f: 13  },
  { match: /\b(aveia|oats)\b/,                        name: 'Oats',           portionAmount: 40,  unit: 'g',     kcal: 150, p: 5,  c: 27, f: 3   },
  // catch-all
  { match: /.*/,                                      name: 'Item',           portionAmount: 100, unit: 'g',     kcal: 150, p: 5,  c: 18, f: 6   },
];
