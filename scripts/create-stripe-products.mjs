/**
 * Script para criar produtos e preços no Stripe automaticamente
 * 
 * Uso:
 *   STRIPE_SECRET_KEY=sk_live_... node scripts/create-stripe-products.js
 * 
 * Ou crie um arquivo .env temporário:
 *   echo "STRIPE_SECRET_KEY=sk_live_..." > .env.local
 *   node scripts/create-stripe-products.js
 */

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// Configuração dos planos
const PLANS = [
  { id: 'athlete_pro', name: 'Athlete Pro', description: 'For dedicated athletes tracking their performance' },
  { id: 'athlete_performance', name: 'Athlete Performance', description: 'Advanced analytics for competitive athletes' },
  { id: 'coach', name: 'Coach', description: 'For coaches managing multiple athletes' },
  { id: 'nutritionist', name: 'Nutritionist', description: 'For nutritionists tracking client diets' },
  { id: 'clinician', name: 'Clinician', description: 'For medical professionals tracking patient health' },
];

// Preços em centavos
const PRICES = {
  BR: {
    monthly: {
      athlete_pro: 2900,        // R$ 29,00
      athlete_performance: 5900, // R$ 59,00
      nutritionist: 7900,       // R$ 79,00
      coach: 9900,              // R$ 99,00
      clinician: 12900,         // R$ 129,00
    },
    yearly: {
      athlete_pro: 24900,       // R$ 249,00
      athlete_performance: 49900,  // R$ 499,00
      nutritionist: 67900,      // R$ 679,00
      coach: 84900,             // R$ 849,00
      clinician: 109900,        // R$ 1.099,00
    },
  },
  US: {
    monthly: {
      athlete_pro: 900,         // $ 9,00
      athlete_performance: 1900,   // $ 19,00
      nutritionist: 2400,       // $ 24,00
      coach: 2900,                // $ 29,00
      clinician: 3900,            // $ 39,00
    },
    yearly: {
      athlete_pro: 7900,          // $ 79,00
      athlete_performance: 15900,  // $ 159,00
      nutritionist: 19900,        // $ 199,00
      coach: 24900,               // $ 249,00
      clinician: 31900,           // $ 319,00
    },
  },
};

async function createProductsAndPrices() {
  console.log('🚀 Criando produtos e preços no Stripe...\n');
  
  const results = [];
  
  for (const plan of PLANS) {
    console.log(`📦 Criando produto: ${plan.name}`);
    
    // Criar produto
    const product = await stripe.products.create({
      name: plan.name,
      description: plan.description,
      metadata: {
        plan_id: plan.id,
        app: 'atlas-core',
      },
    });
    
    console.log(`   ✓ Produto criado: ${product.id}`);
    
    // Criar preços para cada região/billing
    for (const [region, billingTypes] of Object.entries(PRICES)) {
      for (const [billingType, prices] of Object.entries(billingTypes)) {
        const priceInCents = prices[plan.id];
        if (!priceInCents) continue;
        
        const currency = region === 'BR' ? 'brl' : 'usd';
        const interval = billingType === 'yearly' ? 'year' : 'month';
        
        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: priceInCents,
          currency: currency,
          recurring: {
            interval: interval,
            interval_count: 1,
            trial_period_days: 7,
          },
          metadata: {
            plan_id: plan.id,
            region: region,
            billing: billingType,
            app: 'atlas-core',
          },
        });
        
        const envVarName = `STRIPE_PRICE_${region}_${billingType.toUpperCase()}_${plan.id.toUpperCase().replace(/-/g, '_')}`;
        
        console.log(`   💰 ${region} ${billingType}: ${price.id} (${priceInCents / 100} ${currency.toUpperCase()})`);
        
        results.push({
          plan: plan.id,
          region,
          billing: billingType,
          price_id: price.id,
          env_var: envVarName,
          amount: priceInCents / 100,
          currency: currency.toUpperCase(),
        });
      }
    }
    
    console.log('');
  }
  
  // Gerar output para secrets
  console.log('📝 Comandos para configurar secrets no Supabase:\n');
  console.log('Run these commands one by one:');
  
  for (const result of results) {
    console.log(`supabase secrets set --project-ref xrtqwdpczgdomqebmfkk ${result.env_var}=${result.price_id}`);
  }
  
  console.log('');
  console.log('📋 Or save to a file and run:');
  console.log('#!/bin/bash');
  console.log('set -a && source .env && set +a');
  for (const result of results) {
    console.log(`supabase secrets set --project-ref xrtqwdpczgdomqebmfkk ${result.env_var}=${result.price_id}`);
  }
  
  // Salvar results em JSON
  const fs = await import('fs');
  fs.writeFileSync('stripe-prices.json', JSON.stringify(results, null, 2));
  console.log('\n✅ Preços salvos em stripe-prices.json');
  
  return results;
}

createProductsAndPrices()
  .then(() => {
    console.log('\n🎉 Todos os produtos e preços criados com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  });
