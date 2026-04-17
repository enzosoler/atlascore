# Atlas Core System Inventory

## 1. Resumo Executivo

O Atlas Core é um sistema de monitoramento de performance humana integrado, projetado para unificar treinos, nutrição, exames laboratoriais e métricas antropométricas em uma única interface visual assistida por IA.

- **Frontend**: Aplicação React 18 (Vite) híbrida (Web + Capacitor) com roteamento exaustivo (mais de 100 telas e variantes).
- **Backend**: Ecossistema Supabase com 20+ Edge Functions para lógica de negócios, webhooks e IA.
- **Integrações**: RevenueCat (mobile IAP), Stripe (web payments), HealthKit (mobile health sync), Resend (emails).
- **IA**: Motor de insights e decisão rodando no lado do servidor com integração direta com LLMs.
- **RBAC**: Sistema de papéis (athlete, coach, nutritionist, clinician, admin) gerenciado via metadados de autenticação e banco de dados.

### Métricas Gerais:
- **Telas**: ~115 rotas registradas em `src/App.jsx`.
- **Componentes**: ~200 componentes (estimativa baseada em estrutura de diretórios e Radix).
- **Endpoints**: ~30 Edge Functions no Supabase.
- **Emails**: 11 tipos principais centralizados em `send-email`.
- **Storage Local**: ~15 chaves persistentes no dispositivo do usuário.

---

## 2. Mapa de Execução

| Item | Categoria | Responsabilidade | Arquivos Principais | Evidência |
| :--- | :--- | :--- | :--- | :--- |
| **UI Principal** | Frontend | Renderização e Navegação | `src/App.jsx`, `src/main.jsx` | `react-router-dom` usage |
| **Auth** | Backend/Cloud | Gerenciamento de Identidade | Supabase Auth, `AuthContext.jsx` | `supabase.auth.getSession()` |
| **Edge Logic** | Backend | Lógica Serverless (AI, Webhooks) | `supabase/functions/` | Deno Edge Functions |
| **Pagamentos (Web)** | Third-Party | Processamento via Stripe | `stripe-webhook`, `stripe-js` | `@stripe/stripe-js` |
| **Pagamentos (App)** | Third-Party | Processamento via RevenueCat | `src/lib/revenueCat.js` | `@revenuecat/purchases-capacitor` |
| **Emails** | Cloud | Disparo via Resend | `send-email` (Edge Function) | Resend API calls |
| **Storage Local** | Local User | Preferências e Cache UI | `localStorage` | `localStorage.setItem` |
| **Analytics** | Cloud | Rastreamento de uso | `src/lib/analytics.js` | PostHog, Vercel Analytics |

---

## 3. Inventário de Frontend

### 3.1 Telas Principais (Core)
| Tela | Rota | Arquivos | Propósito | Dados Consumidos |
| :--- | :--- | :--- | :--- | :--- |
| Dashboard | `/Today` | `src/pages/Dashboard.jsx` | Central de métricas diárias | `daily_checkins`, `workout_history` |
| Onboarding | `/onboarding` | `src/pages/OnboardingV2.jsx` | Cadastro e configuração inicial | `profiles`, `user_metadata` |
| Workouts | `/Workout` | `src/pages/Workout.jsx` | Lista e execução de treinos | `workout_plans`, `exercises` |
| Nutrition | `/Nutrition` | `src/pages/Nutrition.jsx` | Log de alimentação e macros | `nutrition_logs`, Taco API |
| Progress | `/Progress` | `src/pages/ProgressV2.jsx` | Visualização de evolução | `measurements`, `body_stats` |
| Profile | `/Profile` | `src/pages/ProfileV2.jsx` | Gestão de conta e social | `profiles` |

### 3.2 Componentes Relevantes
- **AppLayoutV2**: Casca da aplicação com navegação lateral/inferior.
- **EntitlementGate**: Componente de bloqueio de funcionalidades premium (Pro).
- **OnboardingTour**: Sistema de guia para novos usuários.
- **Radix UI Primitives**: Base do Design System (Modais, Toasts, Accordions).

---

## 4. Inventário de Backend

### 4.1 Supabase Edge Functions
| Função | Path | Gatilho | Responsabilidade |
| :--- | :--- | :--- | :--- |
| `on-auth-user-created` | `/functions/v1/on-auth-user-created` | Supabase Auth Webhook | Cria profile e trial de 7 dias após signup. |
| `send-email` | `/functions/v1/send-email` | Invoke (Internal/Service) | Renderiza e envia todos os emails via Resend. |
| `ai-coach-chat` | `/functions/v1/ai-coach-chat` | Invoke (Client) | Chatbot inteligente de suporte e motivação. |
| `stripe-webhook` | `/functions/v1/stripe-webhook` | Stripe Event | Sincroniza assinaturas web. |
| `revenuecat-webhook` | `/functions/v1/revenuecat-webhook` | RevenueCat Event | Sincroniza assinaturas mobile. |
| `ai-decision-engine` | `/functions/v1/ai-decision-engine` | Invoke | Processamento de recomendações personalizadas. |

---

## 5. Inventário de Emails

| Email | Trigger | Fonte de Disparo | Template |
| :--- | :--- | :--- | :--- |
| **Welcome** | Signup | `on-auth-user-created` | HTML no `send-email/index.ts` |
| **Confirm Email** | Signup/Auth | `on-auth-user-created` | HTML no `send-email/index.ts` |
| **Trial Started** | Signup | `on-auth-user-created` | HTML no `send-email/index.ts` |
| **Payment Success** | Stripe/RevenueCat | Webhooks | HTML no `send-email/index.ts` |
| **Weekly Report** | Cron (Weekly) | `send-scheduled-emails` | HTML no `send-email/index.ts` |
| **Milestone** | Evento de Uso | `emailService.js` (Client) | HTML no `send-email/index.ts` |

---

## 6. Inventário de Cloud e Integrações

- **Supabase**: Banco de dados (PostgreSQL), Autenticação, Edge Functions, Storage.
- **RevenueCat**: SDK mobile para App Store/Play Store IAP.
- **Stripe**: Gateway de pagamento para Web.
- **Resend**: SMTP/API de disparo de emails transacionais.
- **Sentry**: Monitoramento de erros e performance.
- **PostHog**: Analytics de produto e feature flags.
- **Vercel**: Hospedagem frontend e analytics de web vitals.

---

## 7. Fluxos Ponta a Ponta

### 7.1 Cadastro (Signup)
1. **Frontend**: Usuário preenche email/senha em `src/pages/AuthV2.jsx`.
2. **Auth**: Supabase cria o usuário.
3. **Webhook**: `on-auth-user-created` é disparado.
4. **Backend**: Webhook cria linha em `profiles`, insere trial em `subscriptions`.
5. **Email**: Webhook invoca `send-email` para Welcome, Confirm e Trial Started.
6. **Local Storage**: `onboarding_done_${id}` é verificado no `App.jsx` para redirecionar.

### 7.2 Pagamento (Web)
1. **Frontend**: Usuário escolhe plano em `src/pages/Pricing.jsx`.
2. **Backend**: Invocação de `create-checkout` (Edge Function).
3. **External**: Redirecionamento para Stripe Checkout.
4. **Webhook**: Stripe envia evento para `stripe-webhook`.
5. **Backend**: Webhook atualiza `subscriptions` no Supabase e dispara `emailEvents.onPaymentSuccess`.
6. **Email**: `send-email` envia confirmação.

---

## 8. Lacunas e Recomendações

- **Duplicação de Lógica**: Existem verificações de onboarding tanto no banco quanto no `localStorage`. Recomendado centralizar a verdade no banco (como já está sendo feito no `RequireAuthenticatedApp`), mas com cache de curta duração.
- **Emails Hardcoded**: Os templates de email estão dentro das Edge Functions em Deno. Seria ideal movê-los para um sistema de gestão de templates (como o próprio Resend) ou para arquivos JSON/MD no Storage do Supabase para facilitar edições sem deploy de código.
- **Ownership de AI**: A lógica de AI está dividida entre `insightsEngine.js` (client) e Edge Functions. Recomendado mover toda lógica pesada para o servidor.
- **Local Storage Management**: As chaves de `localStorage` estão espalhadas pelo código. Centralizar em um `src/lib/storage.js` com TypeScript/Zod para evitar conflitos de tipos e chaves.

---

## 9. Proposta de Documentação Viva

Para manter este inventário atualizado automaticamente:

1. **Localização**: Salvar os artefatos em `.agents/inventory/`.
2. **Scripts de Varredura**:
   - `npm run inventory:scan`: Um script Node.js que:
     - Lê `src/App.jsx` usando regex/parser para listar todas as rotas.
     - Lê `supabase/functions/` para listar todos os endpoints.
     - Lê `src/services/` para listar dependências.
3. **Detecção de Drift**: Comparar o `system-inventory.json` gerado com a versão anterior e apontar novas telas ou funções sem documentação.
4. **Auto-docs**: Usar JSDoc/TSDoc em todos os serviços e componentes para gerar manifestos técnicos JSON em tempo de build.
