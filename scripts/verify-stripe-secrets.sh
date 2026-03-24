#!/bin/bash
# Verificar se os Stripe Price IDs estão configurados corretamente

echo "=== Verificando Stripe Secrets no Supabase ==="
echo ""

# Lista todos os secrets do Stripe
supabase secrets list | grep STRIPE_PRICE

echo ""
echo "=== Para verificar os valores reais (não os hashes): ==="
echo "1. Acesse: https://supabase.com/dashboard/project/xrtqwdpczgdomqebmfkk/settings/functions"
echo "2. Verifique se os valores correspondem aos do stripe-prices.json"
echo ""
echo "=== Valores esperados (do stripe-prices.json): ==="
cat stripe-prices.json | jq -r '.[] | "\(.env_var) = \(.price_id)"'
