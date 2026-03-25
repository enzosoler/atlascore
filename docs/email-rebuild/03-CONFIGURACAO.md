# Configuração e Environment Variables

## Secrets Necessários

Execute estes comandos para configurar todos os secrets no Supabase:

```bash
# Resend API Key (obter em https://resend.com/api-keys)
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxxxxxx

# Webhook Secret (gerar string aleatória forte)
# Pode usar: openssl rand -base64 32
supabase secrets set WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxx

# Supabase (já devem existir, mas verifique)
supabase secrets set SUPABASE_URL=https://xrtqwdpczgdomqebmfkk.supabase.co
supabase secrets set SUPABASE_ANON_KEY=eyJ...
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJ...

# App configuration
supabase secrets set APP_URL=https://atlascore.app
supabase secrets set FROM_EMAIL="Atlas Core <noreply@useatlascore.com>"
```

## Verificar Secrets Configurados

```bash
supabase secrets list
```

Deve mostrar:
- APP_URL
- FROM_EMAIL
- RESEND_API_KEY
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- SUPABASE_URL
- WEBHOOK_SECRET

---

## Configuração do Supabase Auth Hook

### Passo 1: Acessar Dashboard
1. https://supabase.com/dashboard/project/xrtqwdpczgdomqebmfkk/auth/hooks

### Passo 2: Habilitar Hook
- **Nome:** Send Email hook
- **Status:** ENABLED
- **URL:** `https://xrtqwdpczgdomqebmfkk.supabase.co/functions/v1/auth-webhook`
- **Secret:** (DEIXAR VAZIO! Não usar o secret do Supabase)

### Passo 3: Configurar Headers Custom
Infelizmente, o Supabase Auth não suporta headers custom no webhook nativo.

**Solução:** Nossa função `auth-webhook` valida via **Query Parameter** como alternativa:

URL no hook: `https://...supabase.co/functions/v1/auth-webhook?secret=SEU_WEBHOOK_SECRET`

Ou, se quiser mais segurança, configure um proxy/edge function intermediário.

---

## Alternativa: Usar Hook URI com Secret

Se o Supabase não enviar o header `X-Webhook-Secret`, podemos passar via query param:

```
https://xrtqwdpczgdomqebmfkk.supabase.co/functions/v1/auth-webhook?secret=whsec_xxxx
```

Vamos adaptar a função para suportar isso:

```typescript
// No auth-webhook, adicione:
const url = new URL(req.url);
const secretFromQuery = url.searchParams.get('secret');
const secretFromHeader = req.headers.get('X-Webhook-Secret');
const secret = secretFromQuery || secretFromHeader;
```

**Trade-off:** Query param aparece em logs. Use se não houver alternativa.

---

## Resend Configuration

### Verificar Domínio
https://resend.com/domains

- Domínio: `useatlascore.com`
- Status: `Verified` ✓

### FROM_EMAIL
Deve usar domínio verificado:
```
Atlas Core <noreply@useatlascore.com>
```

---

## Resumo de URLs

| Componente | URL |
|------------|-----|
| Supabase Project | https://supabase.com/dashboard/project/xrtqwdpczgdomqebmfkk |
| Auth Hooks | /auth/hooks |
| Edge Functions | /functions |
| Resend Dashboard | https://resend.com/domains |

---

## Troubleshooting

### Erro: "RESEND_API_KEY not configured"
Verifique: `supabase secrets list | grep RESEND`

### Erro: "Invalid webhook secret"
Verifique se WEBHOOK_SECRET está setado e URL contém ?secret= ou header está correto.

### Erro: "Unauthorized" no send-email-v2
Token JWT expirado. Faça login novamente no app.

### Nenhum email chega
1. Verifique spam/promotions
2. Confirma domínio useatlascore.com no Resend
3. Verifique logs em: /functions/auth-webhook/logs
