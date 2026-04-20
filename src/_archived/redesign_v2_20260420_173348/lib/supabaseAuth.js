/**
 * Supabase auth helper — returns headers ready for authenticated edge-function
 * calls. Uses the real user JWT (from the current session) as Authorization,
 * and keeps the anon key as `apikey` per Supabase convention.
 *
 * Use this in every v2 AI client (coachAi, nutritionAi, workoutAi, etc) instead
 * of assembling headers by hand. That way a 401 has one source of truth.
 */
import { supabase } from '@/lib/supabaseClient';

const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  '';

/**
 * Build headers for a Supabase edge-function POST.
 * @param {object} [extra] - extra headers to merge (e.g. custom Accept)
 * @returns {Promise<Record<string,string>>}
 */
export async function authHeaders(extra = {}) {
  let accessToken = null;
  try {
    const { data } = await supabase.auth.getSession();
    accessToken = data?.session?.access_token || null;
  } catch {
    // session fetch failed — fall back to anon key (will only work for public fns)
  }

  const authValue = accessToken || SUPABASE_ANON_KEY;
  return {
    'Content-Type': 'application/json',
    ...(authValue ? { Authorization: `Bearer ${authValue}` } : {}),
    ...(SUPABASE_ANON_KEY ? { apikey: SUPABASE_ANON_KEY } : {}),
    ...extra,
  };
}
