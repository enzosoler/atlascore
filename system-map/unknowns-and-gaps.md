# Unknowns and Gaps - Atlas Core Audit

## Itens Incertos
- **Scripts de Cron**: Suspeita-se da existência de um sistema que invoca `send-scheduled-emails` periodicamente (provavelmente via GitHub Actions ou cron jobs externos ao Supabase, já que o Supabase não tem cron nativo estável sem extensões como `pg_cron`).
- **RevenueCat Android**: O `RC_API_KEY_ANDROID` em `src/lib/revenueCat.js` está marcado como `REPLACE_WITH_ANDROID_KEY`, indicando que a integração Android pode não estar pronta ou em teste.
- **FatSecret API**: Referenciada no `fatsecretService.js`, mas o fluxo de autenticação OAuth2 do FatSecret geralmente requer renovação de token no servidor. A implementação exata desse refresh não foi totalmente confirmada.

## Lacunas Arquiteturais
- **Tratamento de Erros Offline**: Embora exista o Capacitor, não foi detectada uma estratégia robusta de sincronização offline (ex: RxDB, PouchDB). O app parece depender fortemente de conexão constante para a maioria das funções.
- **Internacionalização Parcial**: Embora exista o `i18nContext`, o sistema de emails está travado em Inglês (`normaliseLang` sempre retorna 'en' no `emailService.js` e `send-email/index.ts`).
- **Logs de Auditoria**: Existem tabelas de `error_logs` e `admin_audit`, mas o uso real parece esparso em algumas Edge Functions críticas.

## Riscos
- **Sensibilidade de Dados**: O `insightsEngine.js` no frontend processa dados brutos do usuário. Se houver vazamento de tokens ou acesso indevido, a lógica de insights está exposta no bundle do cliente.
- **Resiliência de Webhooks**: Webhooks de pagamento (Stripe/RevenueCat) são críticos. A garantia de entrega e idempotência deve ser rigorosamente testada (existe uma migração de idempotência, o que é bom).

## Itens Legados/Não Confirmados
- `i18n-original.js` e `i18n.js` parecem coexistir. Provavelmente uma versão é legada.
- `src/store/dailyStore.jsx` vs `useDailyState.js`: Parece haver uma migração de Context para Hooks customizados em andamento.
