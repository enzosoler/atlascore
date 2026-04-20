/**
 * Subscription plan catalog — shared between the public marketing Pricing
 * page and the in-app Paywall / Subscription settings. Single source of
 * truth for tier names, prices, and feature matrix.
 *
 * ╔════════════════════════════════════════════════════════════════════════╗
 * ║  ⚠ EVERY NUMERIC VALUE BELOW IS PLACEHOLDER. DO NOT SHIP TO PROD UNTIL: ║
 * ║   1. priceMonthly / priceYearly match RevenueCat (or Stripe) products  ║
 * ║   2. productIdMonthly / productIdYearly match the actual RevenueCat    ║
 * ║      product identifiers in the dashboard                              ║
 * ║   3. currency matches what RevenueCat returns for the user's locale    ║
 * ║   4. trial length matches the RevenueCat free-trial offer config       ║
 * ║   5. feature list matches what is ACTUALLY built and shipping          ║
 * ║                                                                        ║
 * ║  Better long-term: load `priceMonthly`, `priceYearly`, and `currency`  ║
 * ║  at runtime from `Purchases.getOfferings()` (RevenueCat SDK) so the    ║
 * ║  numbers always match what gets charged. This file becomes config     ║
 * ║  only for tier metadata (id, name, tagline, features).                 ║
 * ╚════════════════════════════════════════════════════════════════════════╝
 */

/**
 * LIMITS — single source of truth for where Free stops and Pro starts.
 * Feature gates and rate limiters in the app should import from here so
 * pricing copy and enforcement can never drift.
 */
/**
 * Limits are tuned to cap API cost per free user at ~$0.30/month max.
 * Photo scan and voice log are the expensive ones (vision + STT) so they
 * get the tightest caps. AI coach chat uses the cheapest model on Free
 * (Gemini Flash / GPT-4o-mini) so can be relatively generous.
 *
 * Max cost math (worst-case free user hitting every limit every day):
 *   AI coach:   10 msgs/wk × $0.001 = $0.04/mo
 *   Photo scan: 1/day × 30d × $0.01 = $0.30/mo   ← biggest line item
 *   Voice log:  1/day × 30d × $0.008 = $0.24/mo
 *   Lab upload: 1 total × $0.05 = $0.05 one-time
 *   ────────────────────────────────────────
 *   Free cost ceiling: ~$0.60/month per maxed-out user
 */
export const LIMITS = {
  aiCoachMessagesPerWeek:   { free: 10,   pro: null /* unlimited */ },
  photoFoodScansPerDay:     { free: 1,    pro: null },
  voiceFoodLogsPerDay:      { free: 1,    pro: null },
  savedCustomRoutines:      { free: 1,    pro: null },
  progressPhotosHistory:    { free: 10,   pro: null },   // storage-only, safe
  labUploadsTotal:          { free: 1,    pro: null },
  analyticsHistoryDays:     { free: 7,    pro: null },   // compute-only, safe
};

/**
 * Model routing — which API model each tier uses. Keeps Pro margins healthy.
 * App code should import from here; never hardcode model names in edge
 * functions.
 */
export const MODEL_ROUTING = {
  coachChat: {
    free: 'gemini-1.5-flash',     // ~$0.0003 per message
    pro:  'gpt-4o-mini',          // ~$0.0005 per message, better reasoning
  },
  foodVision: {
    free: 'gemini-1.5-flash',     // ~$0.003 per image
    pro:  'gpt-4o-mini',          // ~$0.010 per image, better at mixed plates
  },
  labParser: {
    free: 'gemini-1.5-flash',
    pro:  'gpt-4o-mini',
  },
  voiceTranscribe: {
    free: 'whisper-1',
    pro:  'whisper-1',            // no point in upgrading STT
  },
};

export const PLANS = [
  {
    id: 'free',
    name: 'Free',
    tint: 'neutral',
    priceMonthly: 0,
    priceYearly: 0,
    currency:    'USD',
    productIdMonthly: null,
    productIdYearly: null,
    tagline: 'Free forever. Real fitness stack with sensible limits.',
    features: [
      { text: 'Workout logging',          included: true, note: 'Unlimited' },
      { text: 'Exercise library',         included: true, note: 'All 330+ movements' },
      { text: 'Preset routines',          included: true, note: 'Browse & start any' },
      { text: 'Text food logging',        included: true, note: 'Unlimited' },
      { text: 'Body weight tracking',     included: true, note: 'Unlimited' },
      { text: 'Custom routines',          included: true, note: '1 saved routine' },
      { text: 'AI coach chat',            included: true, note: '10 messages / week' },
      { text: 'Photo food scan',          included: true, note: '1 per day' },
      { text: 'Voice food log',           included: true, note: '1 per day' },
      { text: 'Progress photos',          included: true, note: 'Last 10 photos' },
      { text: 'Lab uploads',              included: true, note: '1 upload total' },
      { text: 'Training analytics',       included: true, note: 'Last 7 days' },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    tint: 'violet',
    popular: true,
    // Launch pricing: global English-first, USD. Latin America (BRL/MXN) and
    // EU (EUR) come post-launch with localized RevenueCat offerings.
    //
    // Anchoring strategy: weekly is intentionally expensive (~$17.30/mo
    // equivalent) so monthly looks like a 42% discount and yearly like a
    // 62% discount. Most users skim the weekly, then convert on monthly or
    // yearly. Weekly converts the impulse-buyer who underestimates how long
    // they'll stay subscribed.
    //
    // ⚠ These string prices must match what RevenueCat returns for the user's
    // locale at runtime. Do not let the two drift.
    priceWeekly:  3.99,        // anchor — implies $17.30/mo equivalent
    priceMonthly: 9.99,        // 42% cheaper per month than weekly
    priceYearly:  79,          // ~$6.58/mo, 62% cheaper than weekly
    currency:     'USD',
    // Fill these once the RevenueCat dashboard is configured. The real
    // purchase flow reads the current offering from the SDK and does not
    // depend on these IDs matching exactly — they are used for display
    // and as a fallback when the SDK isn't available (web/no-env).
    productIdWeekly:  'atlas_core_pro_weekly',  // RevenueCat package `$rc_weekly`
    productIdMonthly: 'atlas_core_pro_monthly', // RevenueCat package `$rc_monthly`
    productIdYearly:  'atlas_core_pro_yearly',  // RevenueCat package `$rc_annual`
    tagline: 'No limits. AI coach, full analytics, full history.',
    features: [
      { text: 'Everything in Free, without the limits', included: true, strong: true },
      { text: 'Unlimited AI coach chat',          included: true },
      { text: 'Unlimited photo + voice food logs',included: true },
      { text: 'Unlimited custom routines',        included: true },
      { text: 'Full progress photo history',      included: true },
      { text: 'Unlimited lab uploads',            included: true },
      { text: 'Full analytics history + volume graphs', included: true },
      { text: 'Biomarker trend tracking',         included: true },
    ],
  },
];

/** Resolve a plan by id. */
export function findPlan(id) {
  return PLANS.find((p) => p.id === id) || null;
}

/** Feature gates — map of what each tier unlocks. Used by Paywall and by
 *  feature gates in the app that check user tier. */
export const FEATURE_GATES = {
  'ai.coach.unlimited':   ['pro', 'elite'],
  'meal.plans.adaptive':  ['pro', 'elite'],
  'labs.parser':          ['pro', 'elite'],
  'analytics.advanced':   ['pro', 'elite'],
  'coach.human':          ['elite'],
  'hardware.discounts':   ['elite'],
};

/** Does a given user tier have access to a feature gate? */
export function hasAccess(userTier, gateId) {
  const allowed = FEATURE_GATES[gateId] || [];
  return allowed.includes((userTier || '').toLowerCase());
}

/** Tint styles — shared look for tier cards across Pricing + Paywall. */
export const TIER_TINTS = {
  neutral: {
    bg: 'rgba(255,255,255,0.04)', bd: 'rgba(255,255,255,0.10)',
    c: 'hsl(var(--rd-fg-primary))',
    btnBg: 'rgba(255,255,255,0.06)', btnBorder: 'rgba(255,255,255,0.14)',
  },
  violet: {
    bg: 'rgba(139,92,246,0.08)', bd: 'rgba(139,92,246,0.28)',
    c: '#A78BFA',
    btnBg: '#A78BFA', btnBorder: '#A78BFA', solid: true,
  },
  gold: {
    bg: 'rgba(201,169,106,0.08)', bd: 'rgba(201,169,106,0.30)',
    c: 'hsl(var(--rd-premium))',
    btnBg: 'rgba(201,169,106,0.14)', btnBorder: 'rgba(201,169,106,0.40)',
  },
};
