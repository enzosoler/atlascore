#!/usr/bin/env node
/**
 * setup-regional-prices.js
 *
 * Updates your existing US Stripe Price objects to include Manual Currency Prices
 * for 25 currencies, based on PPP (Purchasing Power Parity) calculations.
 *
 * Usage:
 *   STRIPE_SECRET_KEY=sk_test_... node scripts/setup-regional-prices.js
 *
 * Or if you have it in .env.local:
 *   source <(grep STRIPE_SECRET_KEY .env.local | sed 's/^/export /') && node scripts/setup-regional-prices.js
 *
 * What this does:
 *   - Reads your US Price IDs from stripe-prices.json
 *   - Calls Stripe API to add currency_options to each US Price
 *   - Stripe will then auto-present the correct local currency at checkout
 *
 * Safe to run multiple times — it overwrites currency_options idempotently.
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Configuration ─────────────────────────────────────────────────────────────

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_KEY) {
  console.error('ERROR: Set STRIPE_SECRET_KEY environment variable');
  console.error('  STRIPE_SECRET_KEY=sk_test_... node scripts/setup-regional-prices.js');
  process.exit(1);
}

// Load actual price IDs from stripe-prices.json
const pricesFile = path.join(__dirname, '..', 'stripe-prices.json');
const allPrices = JSON.parse(fs.readFileSync(pricesFile, 'utf8'));

// Extract US monthly and yearly price IDs per plan
const US_PRICES = {};
for (const p of allPrices) {
  if (p.region === 'US') {
    if (!US_PRICES[p.plan]) US_PRICES[p.plan] = {};
    US_PRICES[p.plan][p.billing] = p.price_id;
  }
}

console.log('\nUS Price IDs found:');
for (const [plan, billings] of Object.entries(US_PRICES)) {
  console.log(`  ${plan}: monthly=${billings.monthly}, yearly=${billings.yearly}`);
}

// ─── PPP Prices in LOCAL CURRENCY (face value, not cents) ──────────────────────
// These are the amounts customers see. We convert to minor units (cents) below.

const CURRENCY_PRICES = {
  // Monthly prices per plan
  monthly: {
    athlete_pro: {
      mxn: 82.90, ars: 2599, cop: 11900, clp: 3990, pen: 13.90,
      inr: 199, gbp: 5.99, aud: 12.99, eur: 5.99, pln: 15.90,
      try: 89.90, zar: 57.90, ngn: 2890, php: 149, idr: 41900,
      thb: 99, jpy: 980, krw: 7900, cad: 10.99, nzd: 13.99,
      sek: 76.90, nok: 92.90, dkk: 54.90, chf: 7.99,
    },
    athlete_performance: {
      mxn: 173.90, ars: 5499, cop: 25900, clp: 8690, pen: 27.90,
      inr: 399, gbp: 12.99, aud: 27.99, eur: 11.99, pln: 33.90,
      try: 189.90, zar: 121.90, ngn: 5900, php: 299, idr: 88900,
      thb: 199, jpy: 2080, krw: 17900, cad: 23.99, nzd: 28.99,
      sek: 161.90, nok: 194.90, dkk: 114.90, chf: 16.99,
    },
    coach: {
      mxn: 264.90, ars: 8499, cop: 39900, clp: 13290, pen: 42.90,
      inr: 599, gbp: 19.99, aud: 41.99, eur: 17.99, pln: 51.90,
      try: 289.90, zar: 185.90, ngn: 8900, php: 449, idr: 135900,
      thb: 299, jpy: 3080, krw: 26900, cad: 35.99, nzd: 43.99,
      sek: 246.90, nok: 297.90, dkk: 174.90, chf: 25.99,
    },
    nutritionist: {
      mxn: 219.90, ars: 6999, cop: 32900, clp: 10990, pen: 34.90,
      inr: 499, gbp: 15.99, aud: 34.99, eur: 14.99, pln: 42.90,
      try: 239.90, zar: 153.90, ngn: 7400, php: 379, idr: 112900,
      thb: 249, jpy: 2580, krw: 22900, cad: 29.99, nzd: 36.99,
      sek: 204.90, nok: 246.90, dkk: 144.90, chf: 21.99,
    },
    clinician: {
      mxn: 354.90, ars: 11499, cop: 53900, clp: 17890, pen: 56.90,
      inr: 799, gbp: 25.99, aud: 55.99, eur: 23.99, pln: 69.90,
      try: 389.90, zar: 249.90, ngn: 11900, php: 599, idr: 183900,
      thb: 399, jpy: 4080, krw: 36900, cad: 47.99, nzd: 58.99,
      sek: 331.90, nok: 399.90, dkk: 234.90, chf: 34.99,
    },
  },
  // Yearly prices per plan (~28% discount)
  yearly: {
    athlete_pro: {
      mxn: 719.90, ars: 22499, cop: 102900, clp: 34490, pen: 119.90,
      inr: 1699, gbp: 51.99, aud: 112.99, eur: 42.99, pln: 139.90,
      try: 779.90, zar: 499.90, ngn: 24900, php: 1290, idr: 361900,
      thb: 859, jpy: 8480, krw: 68900, cad: 94.99, nzd: 120.99,
      sek: 664.90, nok: 802.90, dkk: 474.90, chf: 68.99,
    },
    athlete_performance: {
      mxn: 1499.90, ars: 47499, cop: 223900, clp: 75090, pen: 239.90,
      inr: 3399, gbp: 112.99, aud: 241.99, eur: 94.99, pln: 292.90,
      try: 1639.90, zar: 1049.90, ngn: 50900, php: 2590, idr: 767900,
      thb: 1719, jpy: 17980, krw: 154900, cad: 207.99, nzd: 250.99,
      sek: 1399.90, nok: 1684.90, dkk: 994.90, chf: 146.99,
    },
    coach: {
      mxn: 2289.90, ars: 73499, cop: 344900, clp: 114890, pen: 369.90,
      inr: 5199, gbp: 172.99, aud: 362.99, eur: 146.99, pln: 449.90,
      try: 2499.90, zar: 1599.90, ngn: 76900, php: 3890, idr: 1173900,
      thb: 2579, jpy: 26580, krw: 232900, cad: 310.99, nzd: 379.99,
      sek: 2132.90, nok: 2573.90, dkk: 1509.90, chf: 224.99,
    },
    nutritionist: {
      mxn: 1899.90, ars: 60499, cop: 284900, clp: 94990, pen: 299.90,
      inr: 4299, gbp: 137.99, aud: 302.99, eur: 120.99, pln: 369.90,
      try: 2069.90, zar: 1329.90, ngn: 63900, php: 3290, idr: 975900,
      thb: 2149, jpy: 22280, krw: 197900, cad: 259.99, nzd: 319.99,
      sek: 1770.90, nok: 2133.90, dkk: 1254.90, chf: 189.99,
    },
    clinician: {
      mxn: 3069.90, ars: 99499, cop: 465900, clp: 154490, pen: 489.90,
      inr: 6899, gbp: 224.99, aud: 483.99, eur: 198.99, pln: 604.90,
      try: 3359.90, zar: 2159.90, ngn: 102900, php: 5190, idr: 1587900,
      thb: 3449, jpy: 35280, krw: 318900, cad: 414.99, nzd: 509.99,
      sek: 2867.90, nok: 3455.90, dkk: 2029.90, chf: 302.99,
    },
  },
};

// ─── Stripe zero-decimal currencies ────────────────────────────────────────────
// For these, unit_amount = face value (no multiplication by 100)
const ZERO_DECIMAL = new Set([
  'bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw',
  'mga', 'pyg', 'rwf', 'ugx', 'vnd', 'vuv', 'xaf', 'xof', 'xpf',
]);

/**
 * Convert a face-value price to Stripe's unit_amount (minor units).
 * For zero-decimal currencies: unit_amount = price
 * For two-decimal currencies: unit_amount = price × 100
 */
function toMinorUnits(amount, currency) {
  const cur = currency.toLowerCase();
  if (ZERO_DECIMAL.has(cur)) {
    return Math.round(amount);
  }
  return Math.round(amount * 100);
}

// ─── Stripe API helper ─────────────────────────────────────────────────────────

function stripeRequest(method, path, data) {
  return new Promise((resolve, reject) => {
    const body = data ? encodeFormData(data) : '';
    const options = {
      hostname: 'api.stripe.com',
      port: 443,
      path: `/v1${path}`,
      method,
      headers: {
        'Authorization': `Bearer ${STRIPE_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            reject(new Error(`Stripe API error: ${parsed.error.message}`));
          } else {
            resolve(parsed);
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

/**
 * Encode nested object as x-www-form-urlencoded (Stripe format).
 * e.g., { currency_options: { eur: { unit_amount: 599 } } }
 * becomes: currency_options[eur][unit_amount]=599
 */
function encodeFormData(obj, prefix = '') {
  const parts = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}[${key}]` : key;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      parts.push(encodeFormData(value, fullKey));
    } else {
      parts.push(`${encodeURIComponent(fullKey)}=${encodeURIComponent(value)}`);
    }
  }
  return parts.filter(Boolean).join('&');
}

// ─── Main ──────────────────────────────────────────────────────────────────────

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function updatePrice(priceId, plan, billing) {
  const prices = CURRENCY_PRICES[billing]?.[plan];
  if (!prices) {
    console.log(`  ⚠ No ${billing} prices defined for ${plan}, skipping`);
    return;
  }

  // Build currency_options object
  const currencyOptions = {};
  for (const [currency, amount] of Object.entries(prices)) {
    currencyOptions[currency] = {
      unit_amount: toMinorUnits(amount, currency),
    };
  }

  console.log(`  Updating ${priceId} (${plan} ${billing}) with ${Object.keys(currencyOptions).length} currencies...`);

  try {
    await stripeRequest('POST', `/prices/${priceId}`, {
      currency_options: currencyOptions,
    });
    console.log(`  ✓ Done`);
  } catch (err) {
    console.error(`  ✗ Failed: ${err.message}`);
  }

  // Rate limit: Stripe allows 100 req/s in live, 25 req/s in test
  await sleep(200);
}

async function main() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Atlas Core — Regional Pricing Setup');
  console.log('  Adding Manual Currency Prices to Stripe Price objects');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Verify API key works
  console.log('Verifying Stripe API key...');
  try {
    const account = await stripeRequest('GET', '/account', null);
    console.log(`✓ Connected to Stripe account: ${account.settings?.dashboard?.display_name || account.id}`);
    console.log(`  Mode: ${STRIPE_KEY.startsWith('sk_live') ? '🔴 LIVE' : '🟡 TEST'}\n`);
  } catch (err) {
    console.error(`✗ Failed to connect: ${err.message}`);
    process.exit(1);
  }

  // Process each plan
  const plans = Object.keys(US_PRICES);
  let total = 0;

  for (const plan of plans) {
    console.log(`\n── ${plan} ──`);
    const billings = US_PRICES[plan];

    if (billings.monthly) {
      await updatePrice(billings.monthly, plan, 'monthly');
      total++;
    }
    if (billings.yearly) {
      await updatePrice(billings.yearly, plan, 'yearly');
      total++;
    }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✓ Updated ${total} Stripe Price objects with 24 currency options each.`);
  console.log(`\nNext steps:`);
  console.log(`  1. Enable Adaptive Pricing in Stripe Dashboard:`);
  console.log(`     https://dashboard.stripe.com/settings/adaptive-pricing`);
  console.log(`  2. Test with location-formatted emails:`);
  console.log(`     test+location_BR@example.com → BRL`);
  console.log(`     test+location_IN@example.com → INR`);
  console.log(`     test+location_JP@example.com → JPY`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
