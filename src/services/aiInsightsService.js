/**
 * Atlas Core — AI Insights Service
 *
 * Orchestrates the AI Insights client contract.
 *
 * The standalone reflection feed is currently disabled until the
 * production backend exists. Callers receive an honest unavailable
 * response rather than fabricated or partially wired insight cards.
 *
 * Usage:
 *   const { insights, meta, cached } = await generateInsights({ ...data, tier });
 */
import { buildHealthDossier, buildTeaserDossier } from '@/lib/healthDossier';

// ── Cache Keys ───────────────────────────────────────────────────────────────

const CACHE_PREFIX = 'atlas_ai_insights';
const CACHE_TTL_MS = {
  free: 7 * 24 * 60 * 60 * 1000,       // 7 days
  pro: 24 * 60 * 60 * 1000,             // 24 hours
  performance: 12 * 60 * 60 * 1000,     // 12 hours
};

function getCacheKey(userId, tier) {
  return `${CACHE_PREFIX}_${userId}_${tier}`;
}

function getCachedInsights(userId, tier) {
  try {
    const key = getCacheKey(userId, tier);
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const cached = JSON.parse(raw);
    const ttl = CACHE_TTL_MS[tier] || CACHE_TTL_MS.free;
    const age = Date.now() - new Date(cached.generated_at).getTime();

    if (age > ttl) {
      localStorage.removeItem(key);
      return null;
    }

    return cached;
  } catch {
    return null;
  }
}

function setCachedInsights(userId, tier, data) {
  try {
    const key = getCacheKey(userId, tier);
    localStorage.setItem(key, JSON.stringify({
      ...data,
      generated_at: new Date().toISOString(),
    }));
  } catch {
    // localStorage might be full — silently fail
  }
}

// ── Rate Limiting ────────────────────────────────────────────────────────────

const RATE_LIMIT_KEY = 'atlas_ai_rate';

function checkRateLimit(userId, tier) {
  try {
    const key = `${RATE_LIMIT_KEY}_${userId}`;
    const raw = localStorage.getItem(key);
    if (!raw) return { allowed: true };

    const record = JSON.parse(raw);
    const now = Date.now();
    const cooldown = CACHE_TTL_MS[tier] || CACHE_TTL_MS.free;
    const elapsed = now - record.last_call;

    if (elapsed < cooldown) {
      const remainingMs = cooldown - elapsed;
      const remainingHours = Math.ceil(remainingMs / (60 * 60 * 1000));
      return {
        allowed: false,
        remaining_hours: remainingHours,
        next_available: new Date(record.last_call + cooldown).toISOString(),
      };
    }

    return { allowed: true };
  } catch {
    return { allowed: true };
  }
}

function recordRateLimit(userId) {
  try {
    const key = `${RATE_LIMIT_KEY}_${userId}`;
    localStorage.setItem(key, JSON.stringify({ last_call: Date.now() }));
  } catch {
    // silently fail
  }
}

// ── Tier Resolution ──────────────────────────────────────────────────────────

/**
 * Resolve the AI tier from the subscription plan code.
 * @param {string} planCode
 * @returns {'free'|'pro'|'performance'}
 */
export function resolveAITier(planCode) {
  const code = String(planCode || '').toLowerCase();
  if (['performance', 'athlete_performance'].includes(code)) return 'performance';
  if (['pro', 'athlete_pro', 'coach', 'nutritionist', 'clinician'].includes(code)) return 'pro';
  return 'free';
}

// ── Main API ─────────────────────────────────────────────────────────────────

/**
 * Generate AI insights for the user.
 *
 * @param {Object} params
 * @param {string} params.userId - User ID
 * @param {string} params.tier - 'free' | 'pro' | 'performance'
 * @param {string} params.locale - Locale string (e.g. 'pt-BR')
 * @param {Object} params.profile
 * @param {Array}  params.measurements
 * @param {Array}  params.workouts
 * @param {Object} params.workoutPlan
 * @param {Array}  params.meals
 * @param {Object} params.dietPlan
 * @param {Array}  params.checkins
 * @param {Array}  params.labExams
 * @param {Array}  params.protocols
 * @param {Array}  params.protocolLogs
 * @param {boolean} params.forceRefresh - Skip cache
 * @returns {Promise<{ insights: Array, meta: Object, cached: boolean, teaser: boolean }>}
 */
export async function generateInsights({
  userId,
  tier = 'free',
  locale = 'en-US',
  profile = {},
  measurements = [],
  workouts = [],
  workoutPlan = null,
  meals = [],
  dietPlan = null,
  checkins = [],
  labExams = [],
  protocols = [],
  protocolLogs = [],
  forceRefresh = false,
}) {
  const unavailableMeta = {
    unavailable: true,
    error: 'Standalone insights are temporarily unavailable.',
  };

  // 1. Check cache first
  if (!forceRefresh) {
    const cached = getCachedInsights(userId, tier);
    if (cached) {
      return { insights: cached.insights, meta: cached.meta, cached: true, teaser: tier === 'free' };
    }
  }

  // 2. Check rate limit
  const rateCheck = checkRateLimit(userId, tier);
  if (!rateCheck.allowed) {
    return {
      insights: [],
      meta: { rate_limited: true, ...rateCheck },
      cached: false,
      teaser: tier === 'free',
    };
  }

  // 3. Build the dossier based on tier
  const dossier =
    tier === 'free'
      ? buildTeaserDossier({ profile, measurements, workouts, checkins })
      : buildHealthDossier({
          profile,
          measurements,
          workouts,
          workoutPlan,
          meals,
          dietPlan,
          checkins,
          labExams,
          protocols,
          protocolLogs,
          rangeDays: 30,
          tier,
        });

  console.warn('[aiInsightsService] Standalone insights requested while backend is disabled.', {
    userId,
    tier,
    locale,
    dossierKind: tier === 'free' ? 'teaser' : 'full',
    hasDossier: Boolean(dossier),
  });

  return {
    insights: [],
    meta: unavailableMeta,
    cached: false,
    teaser: tier === 'free',
  };
}

/**
 * Clear cached insights for a user (useful after new data entry).
 */
export function clearInsightsCache(userId) {
  try {
    ['free', 'pro', 'performance'].forEach((tier) => {
      localStorage.removeItem(getCacheKey(userId, tier));
    });
    localStorage.removeItem(`${RATE_LIMIT_KEY}_${userId}`);
  } catch {
    // silently fail
  }
}

/**
 * Check if fresh insights are available (cache expired).
 */
export function canRefreshInsights(userId, tier) {
  const cached = getCachedInsights(userId, tier);
  if (!cached) return true;
  const rateCheck = checkRateLimit(userId, tier);
  return rateCheck.allowed;
}
