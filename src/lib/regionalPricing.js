/**
 * Regional Pricing — PPP-based pricing by region/currency
 *
 * Architecture:
 * - Each region has display prices (shown on the Pricing page) and a stripe_prices
 *   object pointing to Stripe Price IDs.
 * - Regions that share the same Stripe Price ID as US rely on Stripe's Manual
 *   Currency Prices feature: the US Price object in Stripe has currency_options
 *   for each local currency, so Stripe auto-presents the local amount at checkout.
 * - BR keeps its own dedicated Stripe Price IDs (legacy setup).
 * - All other regions reuse the US Price IDs — Stripe resolves the local currency.
 *
 * PPP methodology:
 *   local_price = us_price × PLR × exchange_rate
 *   Rounded to local charm price. Source: World Bank PA.NUS.PPPC.RF (2023).
 */

// ─── Region definitions ────────────────────────────────────────────────────────

export const REGIONAL_PRICING = {

  // ── Tier 1: Deep discount (PLR < 0.30) ──────────────────────────────────────

  'NG': {
    region: 'Nigeria',
    currency: 'NGN',
    symbol: '₦',
    stripe_prices: {
      free: null,
      athlete_pro: 'price_1TEMmFRieY0K8YEgYVrVPb2s',
      athlete_performance: 'price_1TEMmHRieY0K8YEg9PSVkmXt',
      coach: 'price_1TEMmIRieY0K8YEgOWz60BYr',
      nutritionist: 'price_1TEMmKRieY0K8YEgceRTHz1A',
      clinician: 'price_1TEMmMRieY0K8YEg2UGz2GyC',
    },
    stripe_prices_yearly: {
      free: null,
      athlete_pro: 'price_1TEMmFRieY0K8YEg3SR9IM9k',
      athlete_performance: 'price_1TEMmHRieY0K8YEgnOGNWZQc',
      coach: 'price_1TEMmJRieY0K8YEgxEkmjXic',
      nutritionist: 'price_1TEMmKRieY0K8YEgY1FmnInH',
      clinician: 'price_1TEMmMRieY0K8YEgjsGOAeqy',
    },
    prices: {
      free: 0,
      athlete_pro: 2890,
      athlete_performance: 5900,
      coach: 8900,
      nutritionist: 7400,
      clinician: 11900,
    },
    prices_yearly: {
      free: 0,
      athlete_pro: 24900,
      athlete_performance: 50900,
      coach: 76900,
      nutritionist: 63900,
      clinician: 102900,
    },
  },

  'IN': {
    region: 'India',
    currency: 'INR',
    symbol: '₹',
    stripe_prices: {
      free: null,
      athlete_pro: 'price_1TEMmFRieY0K8YEgYVrVPb2s',
      athlete_performance: 'price_1TEMmHRieY0K8YEg9PSVkmXt',
      coach: 'price_1TEMmIRieY0K8YEgOWz60BYr',
      nutritionist: 'price_1TEMmKRieY0K8YEgceRTHz1A',
      clinician: 'price_1TEMmMRieY0K8YEg2UGz2GyC',
    },
    stripe_prices_yearly: {
      free: null,
      athlete_pro: 'price_1TEMmFRieY0K8YEg3SR9IM9k',
      athlete_performance: 'price_1TEMmHRieY0K8YEgnOGNWZQc',
      coach: 'price_1TEMmJRieY0K8YEgxEkmjXic',
      nutritionist: 'price_1TEMmKRieY0K8YEgY1FmnInH',
      clinician: 'price_1TEMmMRieY0K8YEgjsGOAeqy',
    },
    prices: {
      free: 0,
      athlete_pro: 199,
      athlete_performance: 399,
      coach: 599,
      nutritionist: 499,
      clinician: 799,
    },
    prices_yearly: {
      free: 0,
      athlete_pro: 1699,
      athlete_performance: 3399,
      coach: 5199,
      nutritionist: 4299,
      clinician: 6899,
    },
  },

  'TR': {
    region: 'Turkey',
    currency: 'TRY',
    symbol: '₺',
    stripe_prices: {
      free: null,
      athlete_pro: 'price_1TEMmFRieY0K8YEgYVrVPb2s',
      athlete_performance: 'price_1TEMmHRieY0K8YEg9PSVkmXt',
      coach: 'price_1TEMmIRieY0K8YEgOWz60BYr',
      nutritionist: 'price_1TEMmKRieY0K8YEgceRTHz1A',
      clinician: 'price_1TEMmMRieY0K8YEg2UGz2GyC',
    },
    stripe_prices_yearly: {
      free: null,
      athlete_pro: 'price_1TEMmFRieY0K8YEg3SR9IM9k',
      athlete_performance: 'price_1TEMmHRieY0K8YEgnOGNWZQc',
      coach: 'price_1TEMmJRieY0K8YEgxEkmjXic',
      nutritionist: 'price_1TEMmKRieY0K8YEgY1FmnInH',
      clinician: 'price_1TEMmMRieY0K8YEgjsGOAeqy',
    },
    prices: {
      free: 0,
      athlete_pro: 89.90,
      athlete_performance: 189.90,
      coach: 289.90,
      nutritionist: 239.90,
      clinician: 389.90,
    },
    prices_yearly: {
      free: 0,
      athlete_pro: 779.90,
      athlete_performance: 1639.90,
      coach: 2499.90,
      nutritionist: 2069.90,
      clinician: 3359.90,
    },
  },

  'PH': {
    region: 'Philippines',
    currency: 'PHP',
    symbol: '₱',
    stripe_prices: {
      free: null,
      athlete_pro: 'price_1TEMmFRieY0K8YEgYVrVPb2s',
      athlete_performance: 'price_1TEMmHRieY0K8YEg9PSVkmXt',
      coach: 'price_1TEMmIRieY0K8YEgOWz60BYr',
      nutritionist: 'price_1TEMmKRieY0K8YEgceRTHz1A',
      clinician: 'price_1TEMmMRieY0K8YEg2UGz2GyC',
    },
    stripe_prices_yearly: {
      free: null,
      athlete_pro: 'price_1TEMmFRieY0K8YEg3SR9IM9k',
      athlete_performance: 'price_1TEMmHRieY0K8YEgnOGNWZQc',
      coach: 'price_1TEMmJRieY0K8YEgxEkmjXic',
      nutritionist: 'price_1TEMmKRieY0K8YEgY1FmnInH',
      clinician: 'price_1TEMmMRieY0K8YEgjsGOAeqy',
    },
    prices: {
      free: 0,
      athlete_pro: 149,
      athlete_performance: 299,
      coach: 449,
      nutritionist: 379,
      clinician: 599,
    },
    prices_yearly: {
      free: 0,
      athlete_pro: 1290,
      athlete_performance: 2590,
      coach: 3890,
      nutritionist: 3290,
      clinician: 5190,
    },
  },

  'ID': {
    region: 'Indonesia',
    currency: 'IDR',
    symbol: 'Rp',
    stripe_prices: {
      free: null,
      athlete_pro: 'price_1TEMmFRieY0K8YEgYVrVPb2s',
      athlete_performance: 'price_1TEMmHRieY0K8YEg9PSVkmXt',
      coach: 'price_1TEMmIRieY0K8YEgOWz60BYr',
      nutritionist: 'price_1TEMmKRieY0K8YEgceRTHz1A',
      clinician: 'price_1TEMmMRieY0K8YEg2UGz2GyC',
    },
    stripe_prices_yearly: {
      free: null,
      athlete_pro: 'price_1TEMmFRieY0K8YEg3SR9IM9k',
      athlete_performance: 'price_1TEMmHRieY0K8YEgnOGNWZQc',
      coach: 'price_1TEMmJRieY0K8YEgxEkmjXic',
      nutritionist: 'price_1TEMmKRieY0K8YEgY1FmnInH',
      clinician: 'price_1TEMmMRieY0K8YEgjsGOAeqy',
    },
    prices: {
      free: 0,
      athlete_pro: 41900,
      athlete_performance: 88900,
      coach: 135900,
      nutritionist: 112900,
      clinician: 183900,
    },
    prices_yearly: {
      free: 0,
      athlete_pro: 361900,
      athlete_performance: 767900,
      coach: 1173900,
      nutritionist: 975900,
      clinician: 1587900,
    },
  },

  // ── Tier 2: Moderate discount (PLR 0.30–0.50) ──────────────────────────────

  'TH': {
    region: 'Thailand',
    currency: 'THB',
    symbol: '฿',
    stripe_prices: {
      free: null,
      athlete_pro: 'price_1TEMmFRieY0K8YEgYVrVPb2s',
      athlete_performance: 'price_1TEMmHRieY0K8YEg9PSVkmXt',
      coach: 'price_1TEMmIRieY0K8YEgOWz60BYr',
      nutritionist: 'price_1TEMmKRieY0K8YEgceRTHz1A',
      clinician: 'price_1TEMmMRieY0K8YEg2UGz2GyC',
    },
    stripe_prices_yearly: {
      free: null,
      athlete_pro: 'price_1TEMmFRieY0K8YEg3SR9IM9k',
      athlete_performance: 'price_1TEMmHRieY0K8YEgnOGNWZQc',
      coach: 'price_1TEMmJRieY0K8YEgxEkmjXic',
      nutritionist: 'price_1TEMmKRieY0K8YEgY1FmnInH',
      clinician: 'price_1TEMmMRieY0K8YEgjsGOAeqy',
    },
    prices: {
      free: 0,
      athlete_pro: 99,
      athlete_performance: 199,
      coach: 299,
      nutritionist: 249,
      clinician: 399,
    },
    prices_yearly: {
      free: 0,
      athlete_pro: 859,
      athlete_performance: 1719,
      coach: 2579,
      nutritionist: 2149,
      clinician: 3449,
    },
  },

  'CO': {
    region: 'Colombia',
    currency: 'COP',
    symbol: 'COL$',
    stripe_prices: {
      free: null,
      athlete_pro: 'price_1TEMmFRieY0K8YEgYVrVPb2s',
      athlete_performance: 'price_1TEMmHRieY0K8YEg9PSVkmXt',
      coach: 'price_1TEMmIRieY0K8YEgOWz60BYr',
      nutritionist: 'price_1TEMmKRieY0K8YEgceRTHz1A',
      clinician: 'price_1TEMmMRieY0K8YEg2UGz2GyC',
    },
    stripe_prices_yearly: {
      free: null,
      athlete_pro: 'price_1TEMmFRieY0K8YEg3SR9IM9k',
      athlete_performance: 'price_1TEMmHRieY0K8YEgnOGNWZQc',
      coach: 'price_1TEMmJRieY0K8YEgxEkmjXic',
      nutritionist: 'price_1TEMmKRieY0K8YEgY1FmnInH',
      clinician: 'price_1TEMmMRieY0K8YEgjsGOAeqy',
    },
    prices: {
      free: 0,
      athlete_pro: 11900,
      athlete_performance: 25900,
      coach: 39900,
      nutritionist: 32900,
      clinician: 53900,
    },
    prices_yearly: {
      free: 0,
      athlete_pro: 102900,
      athlete_performance: 223900,
      coach: 344900,
      nutritionist: 284900,
      clinician: 465900,
    },
  },

  'ZA': {
    region: 'South Africa',
    currency: 'ZAR',
    symbol: 'R',
    stripe_prices: {
      free: null,
      athlete_pro: 'price_1TEMmFRieY0K8YEgYVrVPb2s',
      athlete_performance: 'price_1TEMmHRieY0K8YEg9PSVkmXt',
      coach: 'price_1TEMmIRieY0K8YEgOWz60BYr',
      nutritionist: 'price_1TEMmKRieY0K8YEgceRTHz1A',
      clinician: 'price_1TEMmMRieY0K8YEg2UGz2GyC',
    },
    stripe_prices_yearly: {
      free: null,
      athlete_pro: 'price_1TEMmFRieY0K8YEg3SR9IM9k',
      athlete_performance: 'price_1TEMmHRieY0K8YEgnOGNWZQc',
      coach: 'price_1TEMmJRieY0K8YEgxEkmjXic',
      nutritionist: 'price_1TEMmKRieY0K8YEgY1FmnInH',
      clinician: 'price_1TEMmMRieY0K8YEgjsGOAeqy',
    },
    prices: {
      free: 0,
      athlete_pro: 57.90,
      athlete_performance: 121.90,
      coach: 185.90,
      nutritionist: 153.90,
      clinician: 249.90,
    },
    prices_yearly: {
      free: 0,
      athlete_pro: 499.90,
      athlete_performance: 1049.90,
      coach: 1599.90,
      nutritionist: 1329.90,
      clinician: 2159.90,
    },
  },

  'PE': {
    region: 'Peru',
    currency: 'PEN',
    symbol: 'S/',
    stripe_prices: {
      free: null,
      athlete_pro: 'price_1TEMmFRieY0K8YEgYVrVPb2s',
      athlete_performance: 'price_1TEMmHRieY0K8YEg9PSVkmXt',
      coach: 'price_1TEMmIRieY0K8YEgOWz60BYr',
      nutritionist: 'price_1TEMmKRieY0K8YEgceRTHz1A',
      clinician: 'price_1TEMmMRieY0K8YEg2UGz2GyC',
    },
    stripe_prices_yearly: {
      free: null,
      athlete_pro: 'price_1TEMmFRieY0K8YEg3SR9IM9k',
      athlete_performance: 'price_1TEMmHRieY0K8YEgnOGNWZQc',
      coach: 'price_1TEMmJRieY0K8YEgxEkmjXic',
      nutritionist: 'price_1TEMmKRieY0K8YEgY1FmnInH',
      clinician: 'price_1TEMmMRieY0K8YEgjsGOAeqy',
    },
    prices: {
      free: 0,
      athlete_pro: 13.90,
      athlete_performance: 27.90,
      coach: 42.90,
      nutritionist: 34.90,
      clinician: 56.90,
    },
    prices_yearly: {
      free: 0,
      athlete_pro: 119.90,
      athlete_performance: 239.90,
      coach: 369.90,
      nutritionist: 299.90,
      clinician: 489.90,
    },
  },

  'AR': {
    region: 'Argentina',
    currency: 'ARS',
    symbol: 'ARS',
    stripe_prices: {
      free: null,
      athlete_pro: 'price_1TEMmFRieY0K8YEgYVrVPb2s',
      athlete_performance: 'price_1TEMmHRieY0K8YEg9PSVkmXt',
      coach: 'price_1TEMmIRieY0K8YEgOWz60BYr',
      nutritionist: 'price_1TEMmKRieY0K8YEgceRTHz1A',
      clinician: 'price_1TEMmMRieY0K8YEg2UGz2GyC',
    },
    stripe_prices_yearly: {
      free: null,
      athlete_pro: 'price_1TEMmFRieY0K8YEg3SR9IM9k',
      athlete_performance: 'price_1TEMmHRieY0K8YEgnOGNWZQc',
      coach: 'price_1TEMmJRieY0K8YEgxEkmjXic',
      nutritionist: 'price_1TEMmKRieY0K8YEgY1FmnInH',
      clinician: 'price_1TEMmMRieY0K8YEgjsGOAeqy',
    },
    prices: {
      free: 0,
      athlete_pro: 2599,
      athlete_performance: 5499,
      coach: 8499,
      nutritionist: 6999,
      clinician: 11499,
    },
    prices_yearly: {
      free: 0,
      athlete_pro: 22499,
      athlete_performance: 47499,
      coach: 73499,
      nutritionist: 60499,
      clinician: 99499,
    },
  },

  'MX': {
    region: 'Mexico',
    currency: 'MXN',
    symbol: 'MX$',
    stripe_prices: {
      free: null,
      athlete_pro: 'price_1TEMmFRieY0K8YEgYVrVPb2s',
      athlete_performance: 'price_1TEMmHRieY0K8YEg9PSVkmXt',
      coach: 'price_1TEMmIRieY0K8YEgOWz60BYr',
      nutritionist: 'price_1TEMmKRieY0K8YEgceRTHz1A',
      clinician: 'price_1TEMmMRieY0K8YEg2UGz2GyC',
    },
    stripe_prices_yearly: {
      free: null,
      athlete_pro: 'price_1TEMmFRieY0K8YEg3SR9IM9k',
      athlete_performance: 'price_1TEMmHRieY0K8YEgnOGNWZQc',
      coach: 'price_1TEMmJRieY0K8YEgxEkmjXic',
      nutritionist: 'price_1TEMmKRieY0K8YEgY1FmnInH',
      clinician: 'price_1TEMmMRieY0K8YEgjsGOAeqy',
    },
    prices: {
      free: 0,
      athlete_pro: 82.90,
      athlete_performance: 173.90,
      coach: 264.90,
      nutritionist: 219.90,
      clinician: 354.90,
    },
    prices_yearly: {
      free: 0,
      athlete_pro: 719.90,
      athlete_performance: 1499.90,
      coach: 2289.90,
      nutritionist: 1899.90,
      clinician: 3069.90,
    },
  },

  'PL': {
    region: 'Poland',
    currency: 'PLN',
    symbol: 'zł',
    stripe_prices: {
      free: null,
      athlete_pro: 'price_1TEMmFRieY0K8YEgYVrVPb2s',
      athlete_performance: 'price_1TEMmHRieY0K8YEg9PSVkmXt',
      coach: 'price_1TEMmIRieY0K8YEgOWz60BYr',
      nutritionist: 'price_1TEMmKRieY0K8YEgceRTHz1A',
      clinician: 'price_1TEMmMRieY0K8YEg2UGz2GyC',
    },
    stripe_prices_yearly: {
      free: null,
      athlete_pro: 'price_1TEMmFRieY0K8YEg3SR9IM9k',
      athlete_performance: 'price_1TEMmHRieY0K8YEgnOGNWZQc',
      coach: 'price_1TEMmJRieY0K8YEgxEkmjXic',
      nutritionist: 'price_1TEMmKRieY0K8YEgY1FmnInH',
      clinician: 'price_1TEMmMRieY0K8YEgjsGOAeqy',
    },
    prices: {
      free: 0,
      athlete_pro: 15.90,
      athlete_performance: 33.90,
      coach: 51.90,
      nutritionist: 42.90,
      clinician: 69.90,
    },
    prices_yearly: {
      free: 0,
      athlete_pro: 139.90,
      athlete_performance: 292.90,
      coach: 449.90,
      nutritionist: 369.90,
      clinician: 604.90,
    },
  },

  'CL': {
    region: 'Chile',
    currency: 'CLP',
    symbol: 'CL$',
    stripe_prices: {
      free: null,
      athlete_pro: 'price_1TEMmFRieY0K8YEgYVrVPb2s',
      athlete_performance: 'price_1TEMmHRieY0K8YEg9PSVkmXt',
      coach: 'price_1TEMmIRieY0K8YEgOWz60BYr',
      nutritionist: 'price_1TEMmKRieY0K8YEgceRTHz1A',
      clinician: 'price_1TEMmMRieY0K8YEg2UGz2GyC',
    },
    stripe_prices_yearly: {
      free: null,
      athlete_pro: 'price_1TEMmFRieY0K8YEg3SR9IM9k',
      athlete_performance: 'price_1TEMmHRieY0K8YEgnOGNWZQc',
      coach: 'price_1TEMmJRieY0K8YEgxEkmjXic',
      nutritionist: 'price_1TEMmKRieY0K8YEgY1FmnInH',
      clinician: 'price_1TEMmMRieY0K8YEgjsGOAeqy',
    },
    prices: {
      free: 0,
      athlete_pro: 3990,
      athlete_performance: 8690,
      coach: 13290,
      nutritionist: 10990,
      clinician: 17890,
    },
    prices_yearly: {
      free: 0,
      athlete_pro: 34490,
      athlete_performance: 75090,
      coach: 114890,
      nutritionist: 94990,
      clinician: 154490,
    },
  },

  'BR': {
    region: 'Brazil',
    currency: 'BRL',
    symbol: 'R$',
    stripe_prices: {
      free: null,
      athlete_pro: 'price_1TEMmERieY0K8YEgKSb7bAoi',
      athlete_performance: 'price_1TEMmGRieY0K8YEg8Pg3NqOY',
      coach: 'price_1TEMmIRieY0K8YEg2WjVn4PR',
      nutritionist: 'price_1TEMmJRieY0K8YEggJKE9kFt',
      clinician: 'price_1TEMmLRieY0K8YEgG3wigwi8',
    },
    stripe_prices_yearly: {
      free: null,
      athlete_pro: 'price_1TEMmERieY0K8YEgpyi6mvgU',
      athlete_performance: 'price_1TEMmGRieY0K8YEgxdZ0yTut',
      coach: 'price_1TEMmIRieY0K8YEgx6H5m2IE',
      nutritionist: 'price_1TEMmKRieY0K8YEg8dEQidTM',
      clinician: 'price_1TEMmLRieY0K8YEgkptDOoPK'
    },
    prices: {
      free: 0,
      athlete_pro: 25.90,
      athlete_performance: 53.90,
      coach: 81.90,
      nutritionist: 67.90,
      clinician: 109.90,
    },
    prices_yearly: {
      free: 0,
      athlete_pro: 223.90,
      athlete_performance: 465.90,
      coach: 707.90,
      nutritionist: 587.90,
      clinician: 949.90,
    },
  },

  // ── Tier 3: Mild discount — Europe & developed Asia (PLR 0.60–0.80) ─────────

  'PT': {
    region: 'Portugal',
    currency: 'EUR',
    symbol: '€',
    stripe_prices: {
      free: null,
      athlete_pro: 'price_1TEMmFRieY0K8YEgYVrVPb2s',
      athlete_performance: 'price_1TEMmHRieY0K8YEg9PSVkmXt',
      coach: 'price_1TEMmIRieY0K8YEgOWz60BYr',
      nutritionist: 'price_1TEMmKRieY0K8YEgceRTHz1A',
      clinician: 'price_1TEMmMRieY0K8YEg2UGz2GyC',
    },
    stripe_prices_yearly: {
      free: null,
      athlete_pro: 'price_1TEMmFRieY0K8YEg3SR9IM9k',
      athlete_performance: 'price_1TEMmHRieY0K8YEgnOGNWZQc',
      coach: 'price_1TEMmJRieY0K8YEgxEkmjXic',
      nutritionist: 'price_1TEMmKRieY0K8YEgY1FmnInH',
      clinician: 'price_1TEMmMRieY0K8YEgjsGOAeqy',
    },
    prices: {
      free: 0,
      athlete_pro: 4.99,
      athlete_performance: 10.99,
      coach: 16.99,
      nutritionist: 13.99,
      clinician: 22.99,
    },
    prices_yearly: {
      free: 0,
      athlete_pro: 42.99,
      athlete_performance: 94.99,
      coach: 146.99,
      nutritionist: 120.99,
      clinician: 198.99,
    },
  },

  'ES': {
    region: 'Spain',
    currency: 'EUR',
    symbol: '€',
    stripe_prices: {
      free: null,
      athlete_pro: 'price_1TEMmFRieY0K8YEgYVrVPb2s',
      athlete_performance: 'price_1TEMmHRieY0K8YEg9PSVkmXt',
      coach: 'price_1TEMmIRieY0K8YEgOWz60BYr',
      nutritionist: 'price_1TEMmKRieY0K8YEgceRTHz1A',
      clinician: 'price_1TEMmMRieY0K8YEg2UGz2GyC',
    },
    stripe_prices_yearly: {
      free: null,
      athlete_pro: 'price_1TEMmFRieY0K8YEg3SR9IM9k',
      athlete_performance: 'price_1TEMmHRieY0K8YEgnOGNWZQc',
      coach: 'price_1TEMmJRieY0K8YEgxEkmjXic',
      nutritionist: 'price_1TEMmKRieY0K8YEgY1FmnInH',
      clinician: 'price_1TEMmMRieY0K8YEgjsGOAeqy',
    },
    prices: {
      free: 0,
      athlete_pro: 5.99,
      athlete_performance: 11.99,
      coach: 17.99,
      nutritionist: 14.99,
      clinician: 23.99,
    },
    prices_yearly: {
      free: 0,
      athlete_pro: 51.99,
      athlete_performance: 103.99,
      coach: 155.99,
      nutritionist: 129.99,
      clinician: 207.99,
    },
  },

  'KR': {
    region: 'South Korea',
    currency: 'KRW',
    symbol: '₩',
    stripe_prices: {
      free: null,
      athlete_pro: 'price_1TEMmFRieY0K8YEgYVrVPb2s',
      athlete_performance: 'price_1TEMmHRieY0K8YEg9PSVkmXt',
      coach: 'price_1TEMmIRieY0K8YEgOWz60BYr',
      nutritionist: 'price_1TEMmKRieY0K8YEgceRTHz1A',
      clinician: 'price_1TEMmMRieY0K8YEg2UGz2GyC',
    },
    stripe_prices_yearly: {
      free: null,
      athlete_pro: 'price_1TEMmFRieY0K8YEg3SR9IM9k',
      athlete_performance: 'price_1TEMmHRieY0K8YEgnOGNWZQc',
      coach: 'price_1TEMmJRieY0K8YEgxEkmjXic',
      nutritionist: 'price_1TEMmKRieY0K8YEgY1FmnInH',
      clinician: 'price_1TEMmMRieY0K8YEgjsGOAeqy',
    },
    prices: {
      free: 0,
      athlete_pro: 7900,
      athlete_performance: 17900,
      coach: 26900,
      nutritionist: 22900,
      clinician: 36900,
    },
    prices_yearly: {
      free: 0,
      athlete_pro: 68900,
      athlete_performance: 154900,
      coach: 232900,
      nutritionist: 197900,
      clinician: 318900,
    },
  },

  'IT': {
    region: 'Italy',
    currency: 'EUR',
    symbol: '€',
    stripe_prices: {
      free: null,
      athlete_pro: 'price_1TEMmFRieY0K8YEgYVrVPb2s',
      athlete_performance: 'price_1TEMmHRieY0K8YEg9PSVkmXt',
      coach: 'price_1TEMmIRieY0K8YEgOWz60BYr',
      nutritionist: 'price_1TEMmKRieY0K8YEgceRTHz1A',
      clinician: 'price_1TEMmMRieY0K8YEg2UGz2GyC',
    },
    stripe_prices_yearly: {
      free: null,
      athlete_pro: 'price_1TEMmFRieY0K8YEg3SR9IM9k',
      athlete_performance: 'price_1TEMmHRieY0K8YEgnOGNWZQc',
      coach: 'price_1TEMmJRieY0K8YEgxEkmjXic',
      nutritionist: 'price_1TEMmKRieY0K8YEgY1FmnInH',
      clinician: 'price_1TEMmMRieY0K8YEgjsGOAeqy',
    },
    prices: {
      free: 0,
      athlete_pro: 5.99,
      athlete_performance: 12.99,
      coach: 18.99,
      nutritionist: 15.99,
      clinician: 25.99,
    },
    prices_yearly: {
      free: 0,
      athlete_pro: 51.99,
      athlete_performance: 112.99,
      coach: 163.99,
      nutritionist: 137.99,
      clinician: 224.99,
    },
  },

  'JP': {
    region: 'Japan',
    currency: 'JPY',
    symbol: '¥',
    stripe_prices: {
      free: null,
      athlete_pro: 'price_1TEMmFRieY0K8YEgYVrVPb2s',
      athlete_performance: 'price_1TEMmHRieY0K8YEg9PSVkmXt',
      coach: 'price_1TEMmIRieY0K8YEgOWz60BYr',
      nutritionist: 'price_1TEMmKRieY0K8YEgceRTHz1A',
      clinician: 'price_1TEMmMRieY0K8YEg2UGz2GyC',
    },
    stripe_prices_yearly: {
      free: null,
      athlete_pro: 'price_1TEMmFRieY0K8YEg3SR9IM9k',
      athlete_performance: 'price_1TEMmHRieY0K8YEgnOGNWZQc',
      coach: 'price_1TEMmJRieY0K8YEgxEkmjXic',
      nutritionist: 'price_1TEMmKRieY0K8YEgY1FmnInH',
      clinician: 'price_1TEMmMRieY0K8YEgjsGOAeqy',
    },
    prices: {
      free: 0,
      athlete_pro: 980,
      athlete_performance: 2080,
      coach: 3080,
      nutritionist: 2580,
      clinician: 4080,
    },
    prices_yearly: {
      free: 0,
      athlete_pro: 8480,
      athlete_performance: 17980,
      coach: 26580,
      nutritionist: 22280,
      clinician: 35280,
    },
  },

  'FR': {
    region: 'France',
    currency: 'EUR',
    symbol: '€',
    stripe_prices: {
      free: null,
      athlete_pro: 'price_1TEMmFRieY0K8YEgYVrVPb2s',
      athlete_performance: 'price_1TEMmHRieY0K8YEg9PSVkmXt',
      coach: 'price_1TEMmIRieY0K8YEgOWz60BYr',
      nutritionist: 'price_1TEMmKRieY0K8YEgceRTHz1A',
      clinician: 'price_1TEMmMRieY0K8YEg2UGz2GyC',
    },
    stripe_prices_yearly: {
      free: null,
      athlete_pro: 'price_1TEMmFRieY0K8YEg3SR9IM9k',
      athlete_performance: 'price_1TEMmHRieY0K8YEgnOGNWZQc',
      coach: 'price_1TEMmJRieY0K8YEgxEkmjXic',
      nutritionist: 'price_1TEMmKRieY0K8YEgY1FmnInH',
      clinician: 'price_1TEMmMRieY0K8YEgjsGOAeqy',
    },
    prices: {
      free: 0,
      athlete_pro: 6.99,
      athlete_performance: 13.99,
      coach: 20.99,
      nutritionist: 16.99,
      clinician: 27.99,
    },
    prices_yearly: {
      free: 0,
      athlete_pro: 59.99,
      athlete_performance: 120.99,
      coach: 181.99,
      nutritionist: 146.99,
      clinician: 241.99,
    },
  },

  'DE': {
    region: 'Germany',
    currency: 'EUR',
    symbol: '€',
    stripe_prices: {
      free: null,
      athlete_pro: 'price_1TEMmFRieY0K8YEgYVrVPb2s',
      athlete_performance: 'price_1TEMmHRieY0K8YEg9PSVkmXt',
      coach: 'price_1TEMmIRieY0K8YEgOWz60BYr',
      nutritionist: 'price_1TEMmKRieY0K8YEgceRTHz1A',
      clinician: 'price_1TEMmMRieY0K8YEg2UGz2GyC',
    },
    stripe_prices_yearly: {
      free: null,
      athlete_pro: 'price_1TEMmFRieY0K8YEg3SR9IM9k',
      athlete_performance: 'price_1TEMmHRieY0K8YEgnOGNWZQc',
      coach: 'price_1TEMmJRieY0K8YEgxEkmjXic',
      nutritionist: 'price_1TEMmKRieY0K8YEgY1FmnInH',
      clinician: 'price_1TEMmMRieY0K8YEgjsGOAeqy',
    },
    prices: {
      free: 0,
      athlete_pro: 6.99,
      athlete_performance: 13.99,
      coach: 20.99,
      nutritionist: 16.99,
      clinician: 27.99,
    },
    prices_yearly: {
      free: 0,
      athlete_pro: 59.99,
      athlete_performance: 120.99,
      coach: 181.99,
      nutritionist: 146.99,
      clinician: 241.99,
    },
  },

  // ── Tier 4: Near-parity — Anglosphere & Nordics (PLR 0.80–1.00) ─────────────

  'SE': {
    region: 'Sweden',
    currency: 'SEK',
    symbol: 'kr',
    stripe_prices: {
      free: null,
      athlete_pro: 'price_1TEMmFRieY0K8YEgYVrVPb2s',
      athlete_performance: 'price_1TEMmHRieY0K8YEg9PSVkmXt',
      coach: 'price_1TEMmIRieY0K8YEgOWz60BYr',
      nutritionist: 'price_1TEMmKRieY0K8YEgceRTHz1A',
      clinician: 'price_1TEMmMRieY0K8YEg2UGz2GyC',
    },
    stripe_prices_yearly: {
      free: null,
      athlete_pro: 'price_1TEMmFRieY0K8YEg3SR9IM9k',
      athlete_performance: 'price_1TEMmHRieY0K8YEgnOGNWZQc',
      coach: 'price_1TEMmJRieY0K8YEgxEkmjXic',
      nutritionist: 'price_1TEMmKRieY0K8YEgY1FmnInH',
      clinician: 'price_1TEMmMRieY0K8YEgjsGOAeqy',
    },
    prices: {
      free: 0,
      athlete_pro: 76.90,
      athlete_performance: 161.90,
      coach: 246.90,
      nutritionist: 204.90,
      clinician: 331.90,
    },
    prices_yearly: {
      free: 0,
      athlete_pro: 664.90,
      athlete_performance: 1399.90,
      coach: 2132.90,
      nutritionist: 1770.90,
      clinician: 2867.90,
    },
  },

  'GB': {
    region: 'United Kingdom',
    currency: 'GBP',
    symbol: '£',
    stripe_prices: {
      free: null,
      athlete_pro: 'price_1TEMmFRieY0K8YEgYVrVPb2s',
      athlete_performance: 'price_1TEMmHRieY0K8YEg9PSVkmXt',
      coach: 'price_1TEMmIRieY0K8YEgOWz60BYr',
      nutritionist: 'price_1TEMmKRieY0K8YEgceRTHz1A',
      clinician: 'price_1TEMmMRieY0K8YEg2UGz2GyC',
    },
    stripe_prices_yearly: {
      free: null,
      athlete_pro: 'price_1TEMmFRieY0K8YEg3SR9IM9k',
      athlete_performance: 'price_1TEMmHRieY0K8YEgnOGNWZQc',
      coach: 'price_1TEMmJRieY0K8YEgxEkmjXic',
      nutritionist: 'price_1TEMmKRieY0K8YEgY1FmnInH',
      clinician: 'price_1TEMmMRieY0K8YEgjsGOAeqy',
    },
    prices: {
      free: 0,
      athlete_pro: 5.99,
      athlete_performance: 12.99,
      coach: 19.99,
      nutritionist: 15.99,
      clinician: 25.99,
    },
    prices_yearly: {
      free: 0,
      athlete_pro: 51.99,
      athlete_performance: 112.99,
      coach: 172.99,
      nutritionist: 137.99,
      clinician: 224.99,
    },
  },

  'CA': {
    region: 'Canada',
    currency: 'CAD',
    symbol: 'CA$',
    stripe_prices: {
      free: null,
      athlete_pro: 'price_1TEMmFRieY0K8YEgYVrVPb2s',
      athlete_performance: 'price_1TEMmHRieY0K8YEg9PSVkmXt',
      coach: 'price_1TEMmIRieY0K8YEgOWz60BYr',
      nutritionist: 'price_1TEMmKRieY0K8YEgceRTHz1A',
      clinician: 'price_1TEMmMRieY0K8YEg2UGz2GyC',
    },
    stripe_prices_yearly: {
      free: null,
      athlete_pro: 'price_1TEMmFRieY0K8YEg3SR9IM9k',
      athlete_performance: 'price_1TEMmHRieY0K8YEgnOGNWZQc',
      coach: 'price_1TEMmJRieY0K8YEgxEkmjXic',
      nutritionist: 'price_1TEMmKRieY0K8YEgY1FmnInH',
      clinician: 'price_1TEMmMRieY0K8YEgjsGOAeqy',
    },
    prices: {
      free: 0,
      athlete_pro: 10.99,
      athlete_performance: 23.99,
      coach: 35.99,
      nutritionist: 29.99,
      clinician: 47.99,
    },
    prices_yearly: {
      free: 0,
      athlete_pro: 94.99,
      athlete_performance: 207.99,
      coach: 310.99,
      nutritionist: 259.99,
      clinician: 414.99,
    },
  },

  'IE': {
    region: 'Ireland',
    currency: 'EUR',
    symbol: '€',
    stripe_prices: {
      free: null,
      athlete_pro: 'price_1TEMmFRieY0K8YEgYVrVPb2s',
      athlete_performance: 'price_1TEMmHRieY0K8YEg9PSVkmXt',
      coach: 'price_1TEMmIRieY0K8YEgOWz60BYr',
      nutritionist: 'price_1TEMmKRieY0K8YEgceRTHz1A',
      clinician: 'price_1TEMmMRieY0K8YEg2UGz2GyC',
    },
    stripe_prices_yearly: {
      free: null,
      athlete_pro: 'price_1TEMmFRieY0K8YEg3SR9IM9k',
      athlete_performance: 'price_1TEMmHRieY0K8YEgnOGNWZQc',
      coach: 'price_1TEMmJRieY0K8YEgxEkmjXic',
      nutritionist: 'price_1TEMmKRieY0K8YEgY1FmnInH',
      clinician: 'price_1TEMmMRieY0K8YEgjsGOAeqy',
    },
    prices: {
      free: 0,
      athlete_pro: 6.99,
      athlete_performance: 14.99,
      coach: 22.99,
      nutritionist: 18.99,
      clinician: 30.99,
    },
    prices_yearly: {
      free: 0,
      athlete_pro: 59.99,
      athlete_performance: 129.99,
      coach: 198.99,
      nutritionist: 163.99,
      clinician: 267.99,
    },
  },

  'NZ': {
    region: 'New Zealand',
    currency: 'NZD',
    symbol: 'NZ$',
    stripe_prices: {
      free: null,
      athlete_pro: 'price_1TEMmFRieY0K8YEgYVrVPb2s',
      athlete_performance: 'price_1TEMmHRieY0K8YEg9PSVkmXt',
      coach: 'price_1TEMmIRieY0K8YEgOWz60BYr',
      nutritionist: 'price_1TEMmKRieY0K8YEgceRTHz1A',
      clinician: 'price_1TEMmMRieY0K8YEg2UGz2GyC',
    },
    stripe_prices_yearly: {
      free: null,
      athlete_pro: 'price_1TEMmFRieY0K8YEg3SR9IM9k',
      athlete_performance: 'price_1TEMmHRieY0K8YEgnOGNWZQc',
      coach: 'price_1TEMmJRieY0K8YEgxEkmjXic',
      nutritionist: 'price_1TEMmKRieY0K8YEgY1FmnInH',
      clinician: 'price_1TEMmMRieY0K8YEgjsGOAeqy',
    },
    prices: {
      free: 0,
      athlete_pro: 13.99,
      athlete_performance: 28.99,
      coach: 43.99,
      nutritionist: 36.99,
      clinician: 58.99,
    },
    prices_yearly: {
      free: 0,
      athlete_pro: 120.99,
      athlete_performance: 250.99,
      coach: 379.99,
      nutritionist: 319.99,
      clinician: 509.99,
    },
  },

  'DK': {
    region: 'Denmark',
    currency: 'DKK',
    symbol: 'kr',
    stripe_prices: {
      free: null,
      athlete_pro: 'price_1TEMmFRieY0K8YEgYVrVPb2s',
      athlete_performance: 'price_1TEMmHRieY0K8YEg9PSVkmXt',
      coach: 'price_1TEMmIRieY0K8YEgOWz60BYr',
      nutritionist: 'price_1TEMmKRieY0K8YEgceRTHz1A',
      clinician: 'price_1TEMmMRieY0K8YEg2UGz2GyC',
    },
    stripe_prices_yearly: {
      free: null,
      athlete_pro: 'price_1TEMmFRieY0K8YEg3SR9IM9k',
      athlete_performance: 'price_1TEMmHRieY0K8YEgnOGNWZQc',
      coach: 'price_1TEMmJRieY0K8YEgxEkmjXic',
      nutritionist: 'price_1TEMmKRieY0K8YEgY1FmnInH',
      clinician: 'price_1TEMmMRieY0K8YEgjsGOAeqy',
    },
    prices: {
      free: 0,
      athlete_pro: 54.90,
      athlete_performance: 114.90,
      coach: 174.90,
      nutritionist: 144.90,
      clinician: 234.90,
    },
    prices_yearly: {
      free: 0,
      athlete_pro: 474.90,
      athlete_performance: 994.90,
      coach: 1509.90,
      nutritionist: 1254.90,
      clinician: 2029.90,
    },
  },

  'AU': {
    region: 'Australia',
    currency: 'AUD',
    symbol: 'A$',
    stripe_prices: {
      free: null,
      athlete_pro: 'price_1TEMmFRieY0K8YEgYVrVPb2s',
      athlete_performance: 'price_1TEMmHRieY0K8YEg9PSVkmXt',
      coach: 'price_1TEMmIRieY0K8YEgOWz60BYr',
      nutritionist: 'price_1TEMmKRieY0K8YEgceRTHz1A',
      clinician: 'price_1TEMmMRieY0K8YEg2UGz2GyC',
    },
    stripe_prices_yearly: {
      free: null,
      athlete_pro: 'price_1TEMmFRieY0K8YEg3SR9IM9k',
      athlete_performance: 'price_1TEMmHRieY0K8YEgnOGNWZQc',
      coach: 'price_1TEMmJRieY0K8YEgxEkmjXic',
      nutritionist: 'price_1TEMmKRieY0K8YEgY1FmnInH',
      clinician: 'price_1TEMmMRieY0K8YEgjsGOAeqy',
    },
    prices: {
      free: 0,
      athlete_pro: 12.99,
      athlete_performance: 27.99,
      coach: 41.99,
      nutritionist: 34.99,
      clinician: 55.99,
    },
    prices_yearly: {
      free: 0,
      athlete_pro: 112.99,
      athlete_performance: 241.99,
      coach: 362.99,
      nutritionist: 302.99,
      clinician: 483.99,
    },
  },

  'NO': {
    region: 'Norway',
    currency: 'NOK',
    symbol: 'kr',
    stripe_prices: {
      free: null,
      athlete_pro: 'price_1TEMmFRieY0K8YEgYVrVPb2s',
      athlete_performance: 'price_1TEMmHRieY0K8YEg9PSVkmXt',
      coach: 'price_1TEMmIRieY0K8YEgOWz60BYr',
      nutritionist: 'price_1TEMmKRieY0K8YEgceRTHz1A',
      clinician: 'price_1TEMmMRieY0K8YEg2UGz2GyC',
    },
    stripe_prices_yearly: {
      free: null,
      athlete_pro: 'price_1TEMmFRieY0K8YEg3SR9IM9k',
      athlete_performance: 'price_1TEMmHRieY0K8YEgnOGNWZQc',
      coach: 'price_1TEMmJRieY0K8YEgxEkmjXic',
      nutritionist: 'price_1TEMmKRieY0K8YEgY1FmnInH',
      clinician: 'price_1TEMmMRieY0K8YEgjsGOAeqy',
    },
    prices: {
      free: 0,
      athlete_pro: 92.90,
      athlete_performance: 194.90,
      coach: 297.90,
      nutritionist: 246.90,
      clinician: 399.90,
    },
    prices_yearly: {
      free: 0,
      athlete_pro: 802.90,
      athlete_performance: 1684.90,
      coach: 2573.90,
      nutritionist: 2133.90,
      clinician: 3455.90,
    },
  },

  // ── Tier 5: Full price — high-cost countries (PLR >= 1.0) ───────────────────

  'CH': {
    region: 'Switzerland',
    currency: 'CHF',
    symbol: 'CHF',
    stripe_prices: {
      free: null,
      athlete_pro: 'price_1TEMmFRieY0K8YEgYVrVPb2s',
      athlete_performance: 'price_1TEMmHRieY0K8YEg9PSVkmXt',
      coach: 'price_1TEMmIRieY0K8YEgOWz60BYr',
      nutritionist: 'price_1TEMmKRieY0K8YEgceRTHz1A',
      clinician: 'price_1TEMmMRieY0K8YEg2UGz2GyC',
    },
    stripe_prices_yearly: {
      free: null,
      athlete_pro: 'price_1TEMmFRieY0K8YEg3SR9IM9k',
      athlete_performance: 'price_1TEMmHRieY0K8YEgnOGNWZQc',
      coach: 'price_1TEMmJRieY0K8YEgxEkmjXic',
      nutritionist: 'price_1TEMmKRieY0K8YEgY1FmnInH',
      clinician: 'price_1TEMmMRieY0K8YEgjsGOAeqy',
    },
    prices: {
      free: 0,
      athlete_pro: 7.99,
      athlete_performance: 16.99,
      coach: 25.99,
      nutritionist: 21.99,
      clinician: 34.99,
    },
    prices_yearly: {
      free: 0,
      athlete_pro: 68.99,
      athlete_performance: 146.99,
      coach: 224.99,
      nutritionist: 189.99,
      clinician: 302.99,
    },
  },

  // ── Default / Fallback ──────────────────────────────────────────────────────

  'US': {
    region: 'United States',
    currency: 'USD',
    symbol: '$',
    stripe_prices: {
      free: null,
      athlete_pro: 'price_1TEMmFRieY0K8YEgYVrVPb2s',       // $9/month
      athlete_performance: 'price_1TEMmHRieY0K8YEg9PSVkmXt', // $19/month
      coach: 'price_1TEMmIRieY0K8YEgOWz60BYr',               // $29/month
      nutritionist: 'price_1TEMmKRieY0K8YEgceRTHz1A',         // $24/month
      clinician: 'price_1TEMmMRieY0K8YEg2UGz2GyC',             // $39/month
    },
    stripe_prices_yearly: {
      free: null,
      athlete_pro: 'price_1TEMmFRieY0K8YEg3SR9IM9k',
      athlete_performance: 'price_1TEMmHRieY0K8YEgnOGNWZQc',
      coach: 'price_1TEMmJRieY0K8YEgxEkmjXic',
      nutritionist: 'price_1TEMmKRieY0K8YEgY1FmnInH',
      clinician: 'price_1TEMmMRieY0K8YEgjsGOAeqy'
    },
    prices: {
      free: 0,
      athlete_pro: 9,
      athlete_performance: 19,
      coach: 29,
      nutritionist: 24,
      clinician: 39,
    },
    prices_yearly: {
      free: 0,
      athlete_pro: 79,
      athlete_performance: 159,
      coach: 249,
      nutritionist: 199,
      clinician: 319,
    },
  },
};

// ─── Supported region codes (for IP detection mapping) ─────────────────────────

const SUPPORTED_REGIONS = new Set(Object.keys(REGIONAL_PRICING));

/**
 * Detect region via IP (ipapi.co).
 * Result is cached in sessionStorage per tab, does not persist across sessions,
 * and cannot be manipulated via localStorage.
 *
 * Returns a region code from REGIONAL_PRICING, or 'US' as fallback.
 */
export async function detectRegion() {
  // 1. Check URL path first (highest priority)
  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname;
    if (pathname.startsWith('/br/') || pathname === '/br') {
      return 'BR';
    }
  }

  // 2. Session-scoped cache only — resets on new tab/session
  const cached = sessionStorage.getItem('atlas_detected_region');
  if (cached && REGIONAL_PRICING[cached]) return cached;

  // 3. Detect via IP
  try {
    const response = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(4000) });
    const data = await response.json();
    const countryCode = data.country_code; // ISO 3166-1 alpha-2

    // Map to supported region, or fall back to US
    const region = SUPPORTED_REGIONS.has(countryCode) ? countryCode : 'US';
    sessionStorage.setItem('atlas_detected_region', region);
    return region;
  } catch (e) {
    // Silently fail — default to US
  }

  return 'US';
}

/**
 * Stores the user's active region selection for this session.
 */
export function setRegionPricing(region) {
  if (REGIONAL_PRICING[region]) {
    sessionStorage.setItem('atlas_region', region);
  }
}

// Alias for compatibility
export function setRegionPreference(region) {
  return setRegionPricing(region);
}

export function getRegionPricing(region = 'US') {
  return REGIONAL_PRICING[region] || REGIONAL_PRICING['US'];
}

/**
 * Returns the integer percent saved by paying yearly for a plan, or null if
 * the region does not have enough data to calculate it.
 */
export function getYearlySavingsPercent(region = 'US', planId) {
  if (!planId || planId === 'free') return null;

  const pricing = getRegionPricing(region);
  const monthly = pricing.prices?.[planId];
  const yearly = pricing.prices_yearly?.[planId];

  if (typeof monthly !== 'number' || typeof yearly !== 'number' || monthly <= 0 || yearly <= 0) {
    return null;
  }

  return Math.max(0, Math.round((1 - yearly / (monthly * 12)) * 100));
}

/**
 * Format a price for display.
 * Handles zero-decimal currencies (JPY, KRW, CLP, COP, IDR, NGN, ARS, PHP)
 * and comma-separated currencies (BRL, EUR locales).
 */
export function formatPrice(price, region = 'US') {
  const cfg = getRegionPricing(region);
  const { currency, symbol } = cfg;

  // Zero-decimal currencies — no decimal places
  const zeroDecimal = ['JPY', 'KRW', 'CLP', 'COP', 'IDR', 'NGN', 'ARS', 'PHP'];
  if (zeroDecimal.includes(currency)) {
    return `${symbol}${Math.round(price).toLocaleString('en-US')}`;
  }

  // Comma-as-decimal currencies
  const commaDecimal = ['BRL', 'EUR', 'PLN', 'TRY', 'ZAR', 'PEN', 'SEK', 'NOK', 'DKK'];
  if (commaDecimal.includes(currency)) {
    return `${symbol}${price.toFixed(2).replace('.', ',')}`;
  }

  // Default: dot-decimal (USD, GBP, CAD, AUD, NZD, CHF, MXN, THB)
  return `${symbol}${price.toFixed(2)}`;
}
