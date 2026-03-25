# Arquitetura: Sistema de Emails Atlas Core v2

## Visão Geral

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           ATLAS CORE EMAIL SYSTEM v2                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌─────────────────────┐    ┌─────────────────────┐    ┌──────────────┐ │
│   │   SUPABASE AUTH     │    │   APP CLIENT        │    │   CRON/SCHED │ │
│   │   (Hook: user.created)    │   (Logged User)     │    │   (pg_cron)  │ │
│   └──────────┬──────────┘    └──────────┬──────────┘    └──────┬───────┘ │
│              │                          │                       │         │
│              │ POST /auth-webhook         │ POST /send-email-v2   │         │
│              │ X-Webhook-Secret           │ Authorization: Bearer │         │
│              ▼                          ▼                       │         │
│   ┌─────────────────────────────────────────────────────────────────────┐ │
│   │                        EDGE FUNCTIONS                              │ │
│   │  ┌─────────────────────┐        ┌──────────────────────────────┐  │ │
│   │  │  auth-webhook       │        │  send-email-v2               │  │ │
│   │  │  ─────────────────  │        │  ───────────────────────────  │  │ │
│   │  │  Auth: X-Webhook-   │        │  Auth: Supabase JWT          │  │ │
│   │  │        Secret       │        │        (getUser)             │  │ │
│   │  │                     │        │                              │  │ │
│   │  │  1. Validar payload │        │  1. Validar JWT              │  │ │
│   │  │  2. Criar profile   │        │  2. Validar permissão        │  │ │
│   │  │  3. Criar trial     │        │  3. Chamar EmailService      │  │ │
│   │  │  4. Chamar Email    │        │                              │  │ │
│   │  │     Service         │        │                              │  │ │
│   │  └──────────┬──────────┘        └──────────────┬───────────────┘  │ │
│   │             │                                   │                 │ │
│   │             └─────────────────┬─────────────────┘                 │ │
│   │                               │                                   │ │
│   │                               ▼                                   │ │
│   │  ┌─────────────────────────────────────────────────────────────┐ │ │
│   │  │                 SHARED EMAIL SERVICE                        │ │ │
│   │  │  ─────────────────────────────────────────────────────────  │ │ │
│   │  │                                                             │ │ │
│   │  │   • Templates (welcome, confirm, trial, etc)                │ │ │
│   │  │   • Resend API integration                                  │ │ │
│   │  │   • Structured logging                                      │ │ │
│   │  │   • Retry logic                                             │ │ │
│   │  │   • Error handling                                          │ │ │
│   │  │                                                             │ │ │
│   │  └──────────────────────────────┬──────────────────────────────┘ │ │
│   │                                 │                                 │ │
│   └─────────────────────────────────┼─────────────────────────────────┘ │
│                                   │                                     │
│                                   ▼                                     │
│   ┌─────────────────────────────────────────────────────────────────┐ │
│   │                         RESEND API                               │ │
│   │              (verified domain: useatlascore.com)                 │ │
│   └─────────────────────────────────────────────────────────────────┘ │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Componentes

### 1. auth-webhook (Edge Function)
**Responsabilidade:** Receber eventos do Supabase Auth e orquestrar onboarding

**Autenticação:** `X-Webhook-Secret` header
**Endpoint:** `POST /functions/v1/auth-webhook`

**Fluxo:**
1. Validar `X-Webhook-Secret`
2. Validar payload shape (type, record.id, record.email)
3. Criar profile (upsert)
4. Criar trial subscription
5. Chamar EmailService.sendWelcome()
6. Chamar EmailService.sendTrialStarted()
7. Retornar 200 (não bloquear auth se email falhar)

**Segurança:**
- Header `X-Webhook-Secret` obrigatório
- Valor do secret armazenado em Supabase Secrets
- Payload validado antes de qualquer operação

---

### 2. send-email-v2 (Edge Function)
**Responsabilidade:** Permitir usuários autenticados dispararem emails manualmente

**Autenticação:** `Authorization: Bearer <JWT>`
**Endpoint:** `POST /functions/v1/send-email-v2`

**Fluxo:**
1. Validar JWT via `supabase.auth.getUser()`
2. Validar permissões do usuário (rate limit, tipo de email)
3. Chamar EmailService
4. Retornar resultado

**Rate Limits:**
- Máximo 10 emails/hora por usuário
- Apenas tipos permitidos: welcome, confirm_email, reset_password

---

### 3. EmailService (Shared Module)
**Responsabilidade:** Lógica central de envio de email

**Interface:**
```typescript
interface EmailService {
  sendWelcome(opts: WelcomeOptions): Promise<EmailResult>
  sendConfirmEmail(opts: ConfirmOptions): Promise<EmailResult>
  sendTrialStarted(opts: TrialOptions): Promise<EmailResult>
  sendPasswordReset(opts: ResetOptions): Promise<EmailResult>
}
```

**Features:**
- Templates HTML/text inline
- Retry com exponential backoff (3 tentativas)
- Logging estruturado em `email_events` table
- Falha gracefully (não throw, retorna error object)

---

## Estrutura de Arquivos

```
supabase/
├── functions/
│   ├── _shared/
│   │   ├── email-service.ts      # Core service
│   │   ├── templates.ts          # Email templates
│   │   ├── logger.ts             # Structured logging
│   │   └── errors.ts             # Error types
│   │
│   ├── auth-webhook/
│   │   └── index.ts              # Webhook endpoint
│   │
│   └── send-email-v2/
│       └── index.ts              # Authenticated endpoint
│
├── migrations/
│   └── 010_create_email_events_table.sql
```

---

## Banco de Dados

### email_events
```sql
create table email_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  email varchar(255) not null,
  type varchar(50) not null,
  language varchar(10) default 'en',
  status varchar(20) not null, -- 'sent', 'failed', 'pending'
  resend_id varchar(100),
  error_message text,
  metadata jsonb,
  created_at timestamptz default now()
);

-- Índices
CREATE INDEX idx_email_events_user_id ON email_events(user_id);
CREATE INDEX idx_email_events_created_at ON email_events(created_at);
```

---

## Secrets Necessários

```bash
# Resend
supabase secrets set RESEND_API_KEY=re_xxxx

# Webhook
supabase secrets set WEBHOOK_SECRET=whsec_xxxx

# Supabase (já devem existir)
supabase secrets set SUPABASE_URL=https://...
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=ey...
supabase secrets set SUPABASE_ANON_KEY=ey...

# App
supabase secrets set APP_URL=https://atlascore.app
supabase secrets set FROM_EMAIL="Atlas Core <noreply@useatlascore.com>"
```

---

## Configuração do Supabase Auth Hook

1. Dashboard → Auth → Hooks
2. Habilitar "Send Email hook"
3. URL: `https://xrtqwdpczgdomqebmfkk.supabase.co/functions/v1/auth-webhook`
4. **Secret:** (deixar vazio - não usar o secret do Supabase)
5. Nossa função valida via `X-Webhook-Secret` header

**Importante:** O Supabase Auth não envia Authorization Bearer, então não configuramos secret lá. O secret vai no header custom.

---

## Fluxo de Retry

```
Tentativa 1: Imediata
    ↓ Falha
Tentativa 2: Após 2s
    ↓ Falha
Tentativa 3: Após 4s
    ↓ Falha
Logar erro, não propagar exceção
```

Webhook nunca falha o request de auth por causa de email.
