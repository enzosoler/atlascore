# Diagnóstico: Por que o sistema atual falha

## Falha 1: Autenticação incorreta no webhook
**Arquivo:** `supabase/functions/on-auth-user-created/index.ts`

A função espera `Authorization: Bearer <token>`:
```typescript
const authHeader = req.headers.get('Authorization') || '';
const webhookSecret = Deno.env.get('WEBHOOK_SECRET') || SERVICE_ROLE_KEY;
const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : '';
const isAuthorized = bearerToken === webhookSecret;
```

**Problema:** Supabase Auth webhook NÃO envia header `Authorization`.

**Prova:** Logs de invocação mostram headers recebidos:
```json
{
  "accept_encoding": "gzip, br",
  "connection": "Keep-Alive",
  "content_length": "1624",
  "host": "...",
  "user_agent": "Go-http-client/2.0"
}
```

**Resultado:** `401 Unauthorized` em TODAS as chamadas do webhook.

---

## Falha 2: Autenticação incorreta na função send-email
**Arquivo:** `supabase/functions/send-email/index.ts`

A função `isAuthorized()` tenta validar:
1. Bearer token = SUPABASE_SERVICE_ROLE_KEY
2. Ou Bearer token = JWT válido de usuário

```typescript
async function isAuthorized(req: Request): Promise<boolean> {
  const authHeader = req.headers.get('Authorization') || '';
  if (!authHeader.startsWith('Bearer ')) return false;  // <-- Falha aqui para webhooks
  // ...
}
```

**Problema:** Quando o webhook chama `send-email`, não há Authorization Bearer.

**Resultado:** Mesmo se o webhook funcionasse, a chamada interna falharia.

---

## Falha 3: Arquitetura monolítica confusa
Atualmente temos:
- `on-auth-user-created`: webhook que faz TUDO (profile, subscription, email)
- `send-email`: endpoint "genérico" com autenticação híbrida

Problemas:
1. Single Responsibility Violation
2. Acoplamento entre criação de usuário e envio de email
3. Impossível testar email isoladamente
4. Segurança inconsistente

---

## Falha 4: Condição de corrida
O webhook `on-auth-user-created` tenta:
1. Criar profile
2. Criar subscription
3. Gerar link de confirmação
4. Enviar 3 emails

Tudo em uma única função síncrona. Se falhar no meio, não há retry.

---

## Resumo das causas raiz

| Componente | Causa | Efeito |
|------------|-------|--------|
| on-auth-user-created | Espera Bearer, não recebe | 401 em todo signup |
| send-email | Autenticação híbrida ruim | Não pode ser chamada por webhook |
| Arquitetura | Fluxos misturados | Inseguro e quebrado |

---

## Solução necessária

Separar em 3 camadas:

```
┌─────────────────────────────────────────────────────┐
│  CAMADA 1: EDGE FUNCTIONS                           │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────────────┐  ┌─────────────────────┐   │
│  │  auth-webhook       │  │  send-email-v2      │   │
│  │  (server-to-server) │  │  (user-authenticated│   │
│  │                     │  │   Bearer JWT)       │   │
│  │  Validação:         │  │                     │   │
│  │  - Payload shape    │  │  Validação:         │   │
│  │  - X-Webhook-Secret │  │  - Supabase Auth    │   │
│  │                     │  │    JWT              │   │
│  └──────────┬──────────┘  └──────────┬──────────┘   │
│             │                        │               │
│             ▼                        │               │
│  ┌─────────────────────┐             │               │
│  │  EmailService       │ ◄─────────┘               │
│  │  (shared module)    │  (chamada interna sem    │
│  │                     │   autenticação)          │
│  │  - Templates        │                           │
│  │  - Resend API       │                           │
│  │  - Logging          │                           │
│  └──────────┬──────────┘                           │
│             │                                      │
│             ▼                                      │
│  ┌─────────────────────┐                          │
│  │  Resend API         │                          │
│  │  (useatlascore.com) │                          │
│  └─────────────────────┘                          │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## Segurança: Trade-offs avaliados

### Opção A: Webhook sem autenticação
- **Prós:** Funciona com qualquer caller
- **Contras:** Qualquer um pode chamar
- **Veredito:** NÃO - Inaceitável

### Opção B: Webhook com Authorization Bearer
- **Prós:** Padrão OAuth2
- **Contras:** Supabase Auth não envia
- **Veredito:** NÃO - Não funciona na prática

### Opção C: Webhook com X-Webhook-Secret header
- **Prós:** Funciona com Supabase, simples de implementar
- **Contras:** Header custom, não é padrão OAuth2
- **Veredito:** SIM - Melhor trade-off

### Opção D: Webhook validação por IP/Origem
- **Prós:** Invisível para caller
- **Contras:** IPs do Supabase podem mudar, fácil spoofar
- **Veredito:** NÃO - Não confiável

**Escolha:** Opção C (X-Webhook-Secret) + validação de payload shape.
