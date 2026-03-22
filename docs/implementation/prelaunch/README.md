# Prelaunch Workflow

Este workflow gera um gate local de pré-lançamento com foco em:

- inventário do release
- baseline de `lint`, `typecheck`, `build` e testes
- validação de i18n/l10n
- validação de TBBM por locale e canal
- emissão de artefatos auditáveis

## Comandos

```bash
npm test
npm run prelaunch
```

## Artefatos gerados

- `reports/prelaunch/REPORT.md`
- `reports/prelaunch/launch_readiness.json`

## Escopo atual

- Locale default: `en-US`
- Locales suportados: `en-US`, `pt-BR`
- Canais TBBM validados: `email`, `sms`, `push`, `in_app`

## Limites atuais

- ainda não existe suíte E2E/staging dentro do repo
- acessibilidade e compliance ainda dependem de validação manual adicional
- o catálogo TBBM já é validado localmente, mas os senders de produção ainda precisam ser convergidos para ele
