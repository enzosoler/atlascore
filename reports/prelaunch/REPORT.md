# Atlas Core Prelaunch Report

## Summary

- Gate date: 2026-03-20 (America/Sao_Paulo)
- Commit: 6676fe5 (main)
- Decision: **NO_GO**
- Default locale: en-US
- Supported locales: pt-BR, en-US

## Plan and detected commands

1. Detect stack and runnable commands from package.json and the repo layout.
2. Execute local baseline commands: lint, typecheck, build, and unit tests.
3. Audit i18n coverage, locale negotiation, and formatting behavior.
4. Validate the TBBM catalog across locales and channels with snapshots.
5. Summarize P0/P1 findings and emit launch-readiness artifacts.

- Package manager: npm
- Build: npm run build
- Lint: npm run lint
- Typecheck: npm run typecheck
- Unit: npm test
- Integration: not detected
- E2E: not detected

## P0 findings

- Functional: BLOCKED — No staging smoke suite or E2E runner is configured, so signup/login/logout/reset and persistence flows were not executed end-to-end.
- Security: FAIL — RLS policies exist, but no CSP/security-header configuration was detected in the repo.
- Localization & i18n: PASS — Locale normalization, Accept-Language negotiation, fallback behavior, and translation coverage passed automated checks.
- Accessibility: BLOCKED — No automated a11y audit or keyboard-navigation smoke test is configured for critical flows.
- TBBM: PASS — Critical templates cover email, sms, push, and in_app in en-US and pt-BR with snapshot-backed validation.

## P1 findings

- Baseline & Inventory: PASS — Stack, commands, commit, env references, locale catalog, and TBBM inventory were detected locally.
- Performance: FAIL — Largest build asset is 2571.24 KiB, above the 500 KiB warning threshold.
- UX: BLOCKED — Loading, empty, error, and recovery states were not manually validated in staging during this run.
- Compliance: BLOCKED — The repo has account deletion functionality but no complete policy/consent audit or launch evidence for LGPD sign-off.
- Observability & Operation: FAIL — No launch runbook was found and trace_id correlation is not consistently present in the repo.
- Tooling Baseline: FAIL — Local lint, typecheck, build, and unit test commands were executed to establish a release baseline.

## Execution logs

### lint
- command: `npm run lint`
- exit_code: 1
```text
> base44-app@0.0.0 lint
> eslint . --quiet


/Users/enzosoler/Documents/atlas.core/src/components/AtlasCoreLogoSVG.jsx
  27:128  error  Unknown property 'stroke-linejoin' found, use 'strokeLinejoin' instead  react/no-unknown-property
  28:88   error  Unknown property 'stroke-linejoin' found, use 'strokeLinejoin' instead  react/no-unknown-property

/Users/enzosoler/Documents/atlas.core/src/components/coach/CoachAdherenceScore.jsx
  2:10  error  'TrendingUp' is defined but never used    unused-imports/no-unused-imports
  2:22  error  'TrendingDown' is defined but never used  unused-imports/no-unused-imports
  2:36  error  'Minus' is defined but never used         unused-imports/no-unused-imports

/Users/enzosoler/Documents/atlas.core/src/components/exercises/ExerciseCard.jsx
  18:3  error  'equipmentToPT' is defined but never used  unused-imports/no-unused-imports

/Users/enzosoler/Documents/atlas.core/src/components/nutrition/FoodSearch.jsx
  5:18  error  'Loader2' is defined but never used  unused-imports/no-unused-imports
  5:27  error  'Heart' is defined but never used    unused-imports/no-unused-imports

/Users/enzosoler/Documents/atlas.core/src/components/nutritionist/Nutrition...
```

### typecheck
- command: `npm run typecheck`
- exit_code: 2
```text
> base44-app@0.0.0 typecheck
> tsc -p ./jsconfig.json

src/pages/Workouts.jsx(333,13): error TS17002: Expected corresponding JSX closing tag for 'button'.
src/pages/Workouts.jsx(334,17): error TS1381: Unexpected token. Did you mean `{'}'}` or `&rbrace;`?
src/pages/Workouts.jsx(350,9): error TS1005: ')' expected.
src/pages/Workouts.jsx(350,11): error TS1003: Identifier expected.
src/pages/Workouts.jsx(351,15): error TS1381: Unexpected token. Did you mean `{'}'}` or `&rbrace;`?
src/pages/Workouts.jsx(936,9): error TS17002: Expected corresponding JSX closing tag for 'SectionCard'.
src/pages/Workouts.jsx(997,15): error TS1381: Unexpected token. Did you mean `{'}'}` or `&rbrace;`?
src/pages/Workouts.jsx(1103,1): error TS1005: '}' expected.
```

### build
- command: `npm run build`
- exit_code: 0
```text
> base44-app@0.0.0 build
> vite build

vite v6.4.1 building for production...
transforming...
✓ 4232 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                              3.02 kB │ gzip:   0.99 kB
dist/assets/index-BEGLsnhj.css             146.06 kB │ gzip:  23.32 kB
dist/assets/purify.es-B9ZVCkUG.js           22.64 kB │ gzip:   8.75 kB
dist/assets/index.es-DeDh243y.js           159.38 kB │ gzip:  53.43 kB
dist/assets/html2canvas.esm-QH1iLAAe.js    202.38 kB │ gzip:  48.04 kB
dist/assets/index-B9JamHB6.js            2,632.95 kB │ gzip: 765.99 kB
✓ built in 6.93s
(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
```

### unit
- command: `npm test`
- exit_code: 0
```text
> base44-app@0.0.0 test
> node --test tests/prelaunch/*.test.mjs

✔ supported locales and default locale are configured (1.044667ms)
✔ normalizes direct locales and language-only values (0.676334ms)
✔ parses accept-language in quality order (0.140208ms)
✔ negotiates locale from accept-language and browser preference arrays (0.092542ms)
✔ fallback chain always resolves to a supported locale (0.499042ms)
✔ locale formatting is stable for supported currencies and directions (23.31775ms)
✔ TBBM catalog covers all required locales and channels (0.6165ms)
✔ TBBM snapshots are stable for representative locale and channel combinations (26.271625ms)
✔ envelope validation fails when required variables are missing (0.468958ms)
✔ core translation catalogs stay in sync between en-US and pt-BR (4.5705ms)
✔ onboarding translation catalogs stay in sync between en-US and pt-BR (1.065ms)
ℹ tests 11
ℹ suites 0
ℹ pass 11
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 80.959959
```

## Evidence highlights

- i18n samples: `{"negotiation_pt":"pt-BR","negotiation_en":"en-US","fallback_ptPT":["pt-BR","en-US"],"fallback_frCA":["en-US"],"currency_ptBR":"R$ 123,45","currency_enUS":"$123.45"}`
- TBBM coverage: `100%`
- Top asset: `dist/assets/index-B9JamHB6.js (2571.24 KiB)`
- Changed files observed: `M package.json`, `M src/App.jsx`, `M src/lib/i18n.js`, `M src/lib/localizationService.js`, `?? docs/`, `?? reports/`, `?? scripts/`, `?? shared/`, `?? tests/`

## Risks

- RISK-001 (P0): No staging smoke or E2E verification for critical auth and persistence flows — Add a staging seed plus Playwright smoke coverage for signup/login/logout/reset and refresh persistence.
- RISK-002 (P0): Security-header baseline is incomplete — Add CSP and related response-header enforcement, then validate in staging.
- RISK-003 (P1): Bundle size regression on the main client chunk — Split the 2.5+ MiB client bundle and add bundle budgets to CI.
- RISK-004 (P0): Accessibility gate is missing — Add automated axe/keyboard checks on critical routes before launch.
- RISK-005 (P1): Two separate trial-provisioning paths exist in Base44 and Supabase — Converge signup/trial ownership so the product has a single source of truth for subscriptions.

## Final decision

**NO_GO**

Reason: 3 P0 area(s) are not ready: Functional, Security, Accessibility.
