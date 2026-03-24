#!/bin/bash
PROJECT_REF="xrtqwdpczgdomqebmfkk"

echo "Configurando secrets no Supabase..."

# Price IDs
npx supabase secrets set --project-ref $PROJECT_REF STRIPE_PRICE_BR_MONTHLY_ATHLETE_PRO=price_1TEMmERieY0K8YEgKSb7bAoi
npx supabase secrets set --project-ref $PROJECT_REF STRIPE_PRICE_BR_YEARLY_ATHLETE_PRO=price_1TEMmERieY0K8YEgpyi6mvgU
npx supabase secrets set --project-ref $PROJECT_REF STRIPE_PRICE_US_MONTHLY_ATHLETE_PRO=price_1TEMmFRieY0K8YEgYVrVPb2s
npx supabase secrets set --project-ref $PROJECT_REF STRIPE_PRICE_US_YEARLY_ATHLETE_PRO=price_1TEMmFRieY0K8YEg3SR9IM9k
npx supabase secrets set --project-ref $PROJECT_REF STRIPE_PRICE_BR_MONTHLY_ATHLETE_PERFORMANCE=price_1TEMmGRieY0K8YEg8Pg3NqOY
npx supabase secrets set --project-ref $PROJECT_REF STRIPE_PRICE_BR_YEARLY_ATHLETE_PERFORMANCE=price_1TEMmGRieY0K8YEgxdZ0yTut
npx supabase secrets set --project-ref $PROJECT_REF STRIPE_PRICE_US_MONTHLY_ATHLETE_PERFORMANCE=price_1TEMmHRieY0K8YEg9PSVkmXt
npx supabase secrets set --project-ref $PROJECT_REF STRIPE_PRICE_US_YEARLY_ATHLETE_PERFORMANCE=price_1TEMmHRieY0K8YEgnOGNWZQc
npx supabase secrets set --project-ref $PROJECT_REF STRIPE_PRICE_BR_MONTHLY_COACH=price_1TEMmIRieY0K8YEg2WjVn4PR
npx supabase secrets set --project-ref $PROJECT_REF STRIPE_PRICE_BR_YEARLY_COACH=price_1TEMmIRieY0K8YEgx6H5m2IE
npx supabase secrets set --project-ref $PROJECT_REF STRIPE_PRICE_US_MONTHLY_COACH=price_1TEMmIRieY0K8YEgOWz60BYr
npx supabase secrets set --project-ref $PROJECT_REF STRIPE_PRICE_US_YEARLY_COACH=price_1TEMmJRieY0K8YEgxEkmjXic
npx supabase secrets set --project-ref $PROJECT_REF STRIPE_PRICE_BR_MONTHLY_NUTRITIONIST=price_1TEMmJRieY0K8YEggJKE9kFt
npx supabase secrets set --project-ref $PROJECT_REF STRIPE_PRICE_BR_YEARLY_NUTRITIONIST=price_1TEMmKRieY0K8YEg8dEQidTM
npx supabase secrets set --project-ref $PROJECT_REF STRIPE_PRICE_US_MONTHLY_NUTRITIONIST=price_1TEMmKRieY0K8YEgceRTHz1A
npx supabase secrets set --project-ref $PROJECT_REF STRIPE_PRICE_US_YEARLY_NUTRITIONIST=price_1TEMmKRieY0K8YEgY1FmnInH
npx supabase secrets set --project-ref $PROJECT_REF STRIPE_PRICE_BR_MONTHLY_CLINICIAN=price_1TEMmLRieY0K8YEgG3wigwi8
npx supabase secrets set --project-ref $PROJECT_REF STRIPE_PRICE_BR_YEARLY_CLINICIAN=price_1TEMmLRieY0K8YEgkptDOoPK
npx supabase secrets set --project-ref $PROJECT_REF STRIPE_PRICE_US_MONTHLY_CLINICIAN=price_1TEMmMRieY0K8YEg2UGz2GyC
npx supabase secrets set --project-ref $PROJECT_REF STRIPE_PRICE_US_YEARLY_CLINICIAN=price_1TEMmMRieY0K8YEgjsGOAeqy

# App URL
npx supabase secrets set --project-ref $PROJECT_REF APP_URL=https://useatlascore.com

echo "✅ Todos os secrets configurados!"
echo ""
echo "Agora configure manualmente:"
echo "npx supabase secrets set --project-ref $PROJECT_REF STRIPE_SECRET_KEY=sk_live_sua_chave"
echo "npx supabase secrets set --project-ref $PROJECT_REF STRIPE_WEBHOOK_SECRET=whsec_... (depois de configurar webhook)"
