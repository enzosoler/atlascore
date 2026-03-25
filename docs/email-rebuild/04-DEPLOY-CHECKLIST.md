# Checklist de Deploy

## Pre-Deploy

- [ ] Verificar que `RESEND_API_KEY` está setado
- [ ] Verificar que `WEBHOOK_SECRET` está setado
- [ ] Verificar que `SUPABASE_SERVICE_ROLE_KEY` está setado
- [ ] Verificar que `SUPABASE_ANON_KEY` está setado
- [ ] Verificar que `APP_URL` está setado
- [ ] Verificar que `FROM_EMAIL` está setado

## Database Migration

```bash
supabase migration up
# ou execute SQL em 010_create_email_events_table.sql
```

- [ ] Tabela `email_events` criada
- [ ] Índices criados
- [ ] RLS policies aplicadas

## Deploy Edge Functions

```bash
# Deploy shared modules (não precisa deploy separado, são importados)

# Deploy webhook endpoint
supabase functions deploy auth-webhook

# Deploy authenticated endpoint
supabase functions deploy send-email-v2
```

- [ ] `auth-webhook` deployada
- [ ] `send-email-v2` deployada

## Configurar Supabase Auth Hook

1. Acessar: https://supabase.com/dashboard/project/xrtqwdpczgdomqebmfkk/auth/hooks
2. Habilitar "Send Email hook"
3. URL: `https://xrtqwdpczgdomqebmfkk.supabase.co/functions/v1/auth-webhook`
4. Secret: (deixar vazio)

- [ ] Hook habilitado
- [ ] URL configurada

---

## Testes Pós-Deploy

### Teste 1: Webhook Manual (curl)

```bash
curl -X POST https://xrtqwdpczgdomqebmfkk.supabase.co/functions/v1/auth-webhook \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: SEU_WEBHOOK_SECRET" \
  -d '{
    "type": "user.created",
    "record": {
      "id": "00000000-0000-0000-0000-000000000001",
      "email": "teste@example.com",
      "user_metadata": { "full_name": "Teste User" }
    }
  }'
```

**Esperado:** `{"success": true, ...}`

- [ ] Webhook retorna 200
- [ ] Profile criado no banco
- [ ] Subscription criada
- [ ] Email enviado (verificar Resend dashboard)

### Teste 2: Signup via App

1. Abrir app em http://localhost:5173/signup
2. Preencher dados com email real
3. Clicar "Sign up"

**Esperado:**
- Usuário criado no Auth
- Webhook chamado (verificar logs)
- Emails enviados (welcome + trial)

- [ ] Signup funciona sem erro
- [ ] Webhook log aparece em Dashboard
- [ ] Emails chegam na inbox

### Teste 3: Endpoint Autenticado

```bash
# Obter JWT válido do usuário logado
# Ou usar service_role para teste

curl -X POST https://xrtqwdpczgdomqebmfkk.supabase.co/functions/v1/send-email-v2 \
  -H "Authorization: Bearer SEU_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "welcome",
    "to": "seuemail@domain.com",
    "payload": { "firstName": "Test", "appUrl": "https://atlascore.app" }
  }'
```

**Esperado:** `{"success": true, "resendId": "..."}`

- [ ] Retorna 200 com resendId
- [ ] Rate limit funcionando (X-RateLimit-Remaining header)

### Teste 4: Verificar Logs

Acessar: https://supabase.com/dashboard/project/xrtqwdpczgdomqebmfkk/functions/auth-webhook/logs

- [ ] Logs estruturados aparecem
- [ ] Eventos: request_start, payload_valid, profile_created, welcome_sent
- [ ] Nenhum erro 401

### Teste 5: Verificar Resend

Acessar: https://resend.com/emails

- [ ] Emails aparecem com status "Delivered"
- [ ] Domínio useatlascore.com
- [ ] Templates renderizam corretamente

---

## Rollback (se necessário)

Se algo der errado:

```bash
# Desabilitar webhook no dashboard (Auth > Hooks > Send Email hook > Disable)

# Ou reverter para função anterior
supabase functions deploy on-auth-user-created  # versão anterior
```

---

## Critérios de Aceitação

- [ ] Criação de usuário dispara email com sucesso
- [ ] Webhook não retorna 401
- [ ] Endpoint autenticado protegido por JWT
- [ ] Logs mostram claramente sucesso/falha
- [ ] Resend envia com domínio verificado
- [ ] Rate limit funciona no endpoint autenticado
- [ ] Profile e subscription são criados no signup

## Checklist Final

- [ ] Todos os testes passaram
- [ ] Sistema pronto para produção
