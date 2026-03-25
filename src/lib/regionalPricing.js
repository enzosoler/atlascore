/**
 * Regional Pricing — prices by region/currency
 * BR (BRL) and US (USD) first
 */

export const REGIONAL_PRICING = {
  'BR': {
    region: 'Brazil',
    currency: 'BRL',
    symbol: 'R$',
    stripe_prices: {
      free: null,
      athlete_pro: 'price_1Q5tJxLJhPVfVPqNjXYZ', // R$29/month
      athlete_performance: 'price_1Q5tJxLJhPVfVPqNjABC', // R$59/month
      coach: 'price_1Q5tJxLJhPVfVPqNjDEF', // R$99/month
      nutritionist: 'price_1Q5tJxLJhPVfVPqNjGHI', // R$79/month
      clinician: 'price_1Q5tJxLJhPVfVPqNjJKL', // R$129/month
    },
    // Yearly Stripe price IDs — set via env vars after creating in Stripe
    stripe_prices_yearly: {
      free: null,
      athlete_pro: null,         // env: STRIPE_PRICE_BR_YEARLY_ATHLETE_PRO
      athlete_performance: null, // env: STRIPE_PRICE_BR_YEARLY_ATHLETE_PERFORMANCE
      coach: null,               // env: STRIPE_PRICE_BR_YEARLY_COACH
      nutritionist: null,        // env: STRIPE_PRICE_BR_YEARLY_NUTRITIONIST
      clinician: null,           // env: STRIPE_PRICE_BR_YEARLY_CLINICIAN
    },
    prices: {
      free: 0,
      athlete_pro: 29,
      athlete_performance: 59,
      coach: 99,
      nutritionist: 79,
      clinician: 129,
    },
    // Yearly totals billed upfront — ~28% savings vs monthly
    prices_yearly: {
      free: 0,
      athlete_pro: 249,        // R$29×12=R$348 → saves R$99 (28%)
      athlete_performance: 499, // R$59×12=R$708 → saves R$209 (29%)
      coach: 849,               // R$99×12=R$1188 → saves R$339 (28%)
      nutritionist: 679,        // R$79×12=R$948 → saves R$269 (28%)
      clinician: 1099,          // R$129×12=R$1548 → saves R$449 (29%)
    },
  },
  'US': {
    region: 'United States',
    currency: 'USD',
    symbol: '$',
    stripe_prices: {
      free: null,
      athlete_pro: 'price_1Q5tJxLJhPVfVPqNkXYZ', // $9/month
      athlete_performance: 'price_1Q5tJxLJhPVfVPqNkABC', // $19/month
      coach: 'price_1Q5tJxLJhPVfVPqNkDEF', // $29/month
      nutritionist: 'price_1Q5tJxLJhPVfVPqNkGHI', // $24/month
      clinician: 'price_1Q5tJxLJhPVfVPqNkJKL', // $39/month
    },
    // Yearly Stripe price IDs — set via env vars after creating in Stripe
    stripe_prices_yearly: {
      free: null,
      athlete_pro: null,         // env: STRIPE_PRICE_US_YEARLY_ATHLETE_PRO
      athlete_performance: null, // env: STRIPE_PRICE_US_YEARLY_ATHLETE_PERFORMANCE
      coach: null,               // env: STRIPE_PRICE_US_YEARLY_COACH
      nutritionist: null,        // env: STRIPE_PRICE_US_YEARLY_NUTRITIONIST
      clinician: null,           // env: STRIPE_PRICE_US_YEARLY_CLINICIAN
    },
    prices: {
      free: 0,
      athlete_pro: 9,
      athlete_performance: 19,
      coach: 29,
      nutritionist: 24,
      clinician: 39,
    },
    // Yearly totals billed upfront — ~27-28% savings vs monthly
    prices_yearly: {
      free: 0,
      athlete_pro: 79,      // $9×12=$108 → saves $29 (27%)
      athlete_performance: 159, // $19×12=$228 → saves $69 (30%)
      coach: 249,           // $29×12=$348 → saves $99 (28%)
      nutritionist: 199,    // $24×12=$288 → saves $89 (31%)
      clinician: 319,       // $39×12=$468 → saves $149 (32%)
    },
  },
};

/**
 * Detect region via IP (ipapi.co).
 * Result is cached in sessionStorage per tab, does not persist across sessions,
 * and cannot be manipulated via localStorage.
 *
 * Returns: 'BR' | 'US'
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
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    const region = data.country_code === 'BR' ? 'BR' : 'US';
    sessionStorage.setItem('atlas_detected_region', region);
    return region;
  } catch (e) {
    // Silently fail — default to US
  }

  return 'US';
}

/**
 * Stores the user's active region selection for this session.
 * Only used after geo-detection confirms the user is in BR (see RegionSelector).
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

export function formatPrice(price, region = 'US') {
  const cfg = getRegionPricing(region);
  return `${cfg.symbol} ${price.toFixed(2).replace('.', cfg.currency === 'BRL' ? ',' : '.')}`;
}
