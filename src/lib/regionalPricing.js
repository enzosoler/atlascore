/**
 * Regional Pricing — lazy-loaded PPP pricing by region/currency.
 *
 * The large region map lives in src/data/regionalPricing.json and is imported
 * only when pricing/region selection runs. This keeps the main bundle from
 * eagerly parsing 30+ regional price tables.
 */

const US_FALLBACK = {
  region: 'United States',
  currency: 'USD',
  symbol: '$',
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
    athlete_pro: 9.99,
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
};

let pricingCache = null;
let pricingPromise = null;

export async function loadRegionalPricing() {
  if (pricingCache) return pricingCache;
  if (!pricingPromise) {
    pricingPromise = import('@/data/regionalPricing.json')
      .then((module) => {
        pricingCache = module.default || module;
        return pricingCache;
      })
      .catch((error) => {
        console.warn('[regionalPricing] failed to load pricing JSON:', error);
        pricingCache = { US: US_FALLBACK };
        return pricingCache;
      });
  }
  return pricingPromise;
}

function getSessionValue(key) {
  if (typeof sessionStorage === 'undefined') return null;
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function setSessionValue(key, value) {
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // Session storage can fail in private browsing; pricing still works.
  }
}

/**
 * Detect region via IP (ipapi.co).
 * Result is cached in sessionStorage per tab, does not persist across sessions,
 * and cannot be manipulated via localStorage.
 */
export async function detectRegion() {
  const pricing = await loadRegionalPricing();

  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname;
    if (pathname.startsWith('/br/') || pathname === '/br') return 'BR';
  }

  const cached = getSessionValue('atlas_detected_region');
  if (cached && pricing[cached]) return cached;

  try {
    const response = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(4000) });
    const data = await response.json();
    const countryCode = data.country_code;
    const region = pricing[countryCode] ? countryCode : 'US';
    setSessionValue('atlas_detected_region', region);
    return region;
  } catch {
    return 'US';
  }
}

/**
 * Stores the user's active region selection for this session.
 */
export async function setRegionPricing(region) {
  const pricing = pricingCache || await loadRegionalPricing();
  if (pricing[region]) {
    setSessionValue('atlas_region', region);
  }
}

export function setRegionPreference(region) {
  return setRegionPricing(region);
}

export function getRegionPricing(region = 'US') {
  return pricingCache?.[region] || pricingCache?.US || US_FALLBACK;
}

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

export function formatPrice(price, region = 'US') {
  const cfg = getRegionPricing(region);
  const { currency, symbol } = cfg;

  const zeroDecimal = ['JPY', 'KRW', 'CLP', 'COP', 'IDR', 'NGN', 'ARS', 'PHP'];
  if (zeroDecimal.includes(currency)) {
    return `${symbol}${Math.round(price).toLocaleString('en-US')}`;
  }

  const commaDecimal = ['BRL', 'EUR', 'PLN', 'TRY', 'ZAR', 'PEN', 'SEK', 'NOK', 'DKK'];
  if (commaDecimal.includes(currency)) {
    return `${symbol}${price.toFixed(2).replace('.', ',')}`;
  }

  return `${symbol}${price.toFixed(2)}`;
}
