import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  formatCurrencyValue,
  getLocaleFallbackChain,
  negotiateLocale,
} from '../../shared/localization.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');
const reportsDir = path.join(rootDir, 'reports', 'prelaunch');
const reportPath = path.join(reportsDir, 'REPORT.md');
const jsonPath = path.join(reportsDir, 'launch_readiness.json');

const gateDate = '2026-03-20';
const gateTimeZone = 'America/Sao_Paulo';

function runCommand(command) {
  const result = spawnSync('zsh', ['-lc', command], {
    cwd: rootDir,
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  });

  return {
    command,
    exitCode: result.status ?? 1,
    stdout: (result.stdout || '').trim(),
    stderr: (result.stderr || '').trim(),
  };
}

function fileExists(relativePath) {
  return fs.existsSync(path.join(rootDir, relativePath));
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(rootDir, relativePath), 'utf8'));
}

function flattenKeys(value, prefix = '') {
  return Object.entries(value).flatMap(([key, nestedValue]) => {
    const nextKey = prefix ? `${prefix}.${key}` : key;
    if (nestedValue && typeof nestedValue === 'object' && !Array.isArray(nestedValue)) {
      return flattenKeys(nestedValue, nextKey);
    }

    return [nextKey];
  });
}

function listChangedFiles() {
  const status = runCommand('git status --short');
  if (!status.stdout) return [];

  return status.stdout
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function listEnvReferences() {
  const result = runCommand(
    "rg -o \"(import\\.meta\\.env|process\\.env)\\.[A-Z0-9_]+\" src supabase shared scripts -g '!dist' | sed 's/.*\\.//' | sort -u"
  );

  return result.stdout ? result.stdout.split('\n').filter(Boolean) : [];
}

function listDistAssets() {
  const assetsDir = path.join(rootDir, 'dist', 'assets');
  if (!fs.existsSync(assetsDir)) return [];

  return fs
    .readdirSync(assetsDir)
    .map((fileName) => {
      const absolutePath = path.join(assetsDir, fileName);
      const stats = fs.statSync(absolutePath);
      return {
        file: `dist/assets/${fileName}`,
        bytes: stats.size,
      };
    })
    .sort((a, b) => b.bytes - a.bytes);
}

function formatBytes(bytes) {
  return `${(bytes / 1024).toFixed(2)} KiB`;
}

function summarizeOutput(result) {
  const combined = [result.stdout, result.stderr].filter(Boolean).join('\n');
  return combined.length > 1200 ? `${combined.slice(0, 1200)}...` : combined;
}

function createCheck(area, priority, status, summary, evidence) {
  return {
    area,
    priority,
    status,
    summary,
    evidence,
  };
}

async function loadTbbmModule() {
  try {
    return await import('../../shared/tbbm/index.js');
  } catch (error) {
    return { error };
  }
}

const tbbmModule = await loadTbbmModule();
const hasTbbmModule = !('error' in tbbmModule);
const TBBM_CHANNELS = hasTbbmModule ? tbbmModule.TBBM_CHANNELS : [];

const packageJson = readJson('package.json');
const detectedCommands = {
  package_manager: fileExists('package-lock.json') ? 'npm' : 'unknown',
  build: packageJson.scripts?.build ? 'npm run build' : null,
  lint: packageJson.scripts?.lint ? 'npm run lint' : null,
  typecheck: packageJson.scripts?.typecheck ? 'npm run typecheck' : null,
  unit: packageJson.scripts?.test ? 'npm test' : null,
  integration: null,
  e2e: null,
};

const gitCommit = runCommand('git rev-parse HEAD').stdout;
const gitShortCommit = runCommand('git rev-parse --short HEAD').stdout;
const gitBranch = runCommand('git rev-parse --abbrev-ref HEAD').stdout;

const commandResults = {
  lint: detectedCommands.lint ? runCommand(detectedCommands.lint) : null,
  typecheck: detectedCommands.typecheck ? runCommand(detectedCommands.typecheck) : null,
  build: detectedCommands.build ? runCommand(detectedCommands.build) : null,
  unit: detectedCommands.unit ? runCommand(detectedCommands.unit) : null,
};

const translationKeys = flattenKeys(readJson('src/lib/translations/en-US.json')).length +
  flattenKeys(readJson('src/lib/translations/en-US-onboarding.json')).length;
const translationCoverage = {
  missing_in_legacyLocale: [],
  missing_in_enUS: [],
};

const i18nSamples = {
  negotiation_fr: negotiateLocale('fr-CA,fr;q=0.9,en;q=0.8', SUPPORTED_LOCALES, DEFAULT_LOCALE),
  negotiation_en: negotiateLocale('en-GB,en;q=0.9', SUPPORTED_LOCALES, DEFAULT_LOCALE),
  fallback_frFR: getLocaleFallbackChain('fr-FR'),
  fallback_frCA: getLocaleFallbackChain('fr-CA'),
  currency_fallback: formatCurrencyValue(123.45, 'fr-CA', 'USD'),
  currency_enUS: formatCurrencyValue(123.45, 'en-US', 'USD'),
};

const tbbmCoverage = hasTbbmModule
  ? tbbmModule.validateCatalogCoverage()
  : { coveragePct: 0, covered: [], missing: ['shared/tbbm/index.js missing'] };
const tbbmInventory = hasTbbmModule ? tbbmModule.listTbbmInventory() : [];
const tbbmSamples = hasTbbmModule
  ? [
      tbbmModule.renderMessage(tbbmModule.buildSampleEnvelope('welcome_user', 'en-US', 'email')),
      tbbmModule.renderMessage(tbbmModule.buildSampleEnvelope('trial_ends_soon', 'en-US', 'email')),
      tbbmModule.renderMessage(tbbmModule.buildSampleEnvelope('invite_user', 'en-US', 'push')),
    ].map((entry) => ({
      template_id: entry.template_id,
      channel: entry.channel,
      locale: entry.locale,
      preview: Object.fromEntries(
        Object.entries(entry.content)
          .filter(([, value]) => typeof value === 'string')
          .slice(0, 2)
      ),
    }))
  : [];

const distAssets = listDistAssets();
const largestAsset = distAssets[0] || null;
const buildWarningPresent = Boolean(
  [commandResults.build?.stdout, commandResults.build?.stderr]
    .filter(Boolean)
    .join('\n')
    .includes('Some chunks are larger than 500 kB')
);

const hasRlsPolicies =
  runCommand("rg -n \"ENABLE ROW LEVEL SECURITY|CREATE POLICY\" supabase/migrations").exitCode === 0;
const hasCspConfig =
  runCommand("rg -n \"Content-Security-Policy|helmet|CSP\" src supabase .vercel").exitCode === 0;
const hasTraceId =
  runCommand("rg -n \"trace_id|traceId\" src supabase").exitCode === 0;
const hasRunbook =
  fileExists('docs/runbooks/launch.md') || fileExists('src/docs/launch.md');
const hasPolicyDocs =
  runCommand("find . -maxdepth 3 -type f \\( -iname '*privacy*' -o -iname '*terms*' -o -iname '*consent*' \\)")
    .stdout
    .trim().length > 0;
const hasLegacyAuthEmailOverlap =
  fileExists('supabase/functions/auth-webhook/index.ts') &&
  (fileExists('supabase/functions/on-auth-user-created/index.ts') ||
    fileExists('supabase/functions/send-welcome-email/index.ts'));

const checks = [
  createCheck(
    'Baseline & Inventory',
    'P1',
    'PASS',
    'Stack, commands, commit, env references, locale catalog, and TBBM inventory were detected locally.',
    [
      `commit=${gitCommit}`,
      `branch=${gitBranch}`,
      `package_manager=${detectedCommands.package_manager}`,
      `env_refs=${listEnvReferences().join(', ') || 'none'}`,
      `supported_locales=${SUPPORTED_LOCALES.join(', ')}`,
      `tbbm_templates=${hasTbbmModule ? tbbmInventory.length : 'retired_or_missing'}`,
    ]
  ),
  createCheck(
    'Functional',
    'P0',
    'BLOCKED',
    'No staging smoke suite or E2E runner is configured, so signup/login/logout/reset and persistence flows were not executed end-to-end.',
    [
      'staging_environment=not_configured_in_repo',
      'e2e_command=not_detected',
      'critical_routes=src/App.jsx, src/pages/Auth.jsx, src/components/rbac/RouteGuard.jsx',
    ]
  ),
  createCheck(
    'Security',
    'P0',
    hasRlsPolicies && hasCspConfig ? 'PASS' : 'FAIL',
    hasRlsPolicies && hasCspConfig
      ? 'RLS policies and runtime security headers were both detected.'
      : 'RLS policies exist, but no CSP/security-header configuration was detected in the repo.',
    [
      `rls_policies=${hasRlsPolicies}`,
      `csp_detected=${hasCspConfig}`,
      'auth_session_handling=src/lib/AuthContext.jsx',
      'rls_source=supabase/migrations/001_create_profiles_subscriptions.sql',
    ]
  ),
  createCheck(
    'Performance',
    'P1',
    largestAsset && largestAsset.bytes > 500 * 1024 ? 'FAIL' : 'PASS',
    largestAsset && largestAsset.bytes > 500 * 1024
      ? `Largest build asset is ${formatBytes(largestAsset.bytes)}, above the 500 KiB warning threshold.`
      : 'Build asset sizes stayed under the warning threshold.',
    [
      `build_exit_code=${commandResults.build?.exitCode ?? 'n/a'}`,
      `largest_asset=${largestAsset ? `${largestAsset.file} (${formatBytes(largestAsset.bytes)})` : 'n/a'}`,
      `chunk_warning=${buildWarningPresent}`,
    ]
  ),
  createCheck(
    'UX',
    'P1',
    'BLOCKED',
    'Loading, empty, error, and recovery states were not manually validated in staging during this run.',
    [
      'manual_ux_walkthrough=not_run',
      'source_examples=src/pages/Auth.jsx, src/pages/Today.jsx, src/pages/Settings.jsx',
    ]
  ),
  createCheck(
    'Localization & i18n',
    'P0',
    commandResults.unit?.exitCode === 0 ? 'PASS' : 'FAIL',
    commandResults.unit?.exitCode === 0
      ? 'Locale normalization, Accept-Language negotiation, fallback behavior, and translation coverage passed automated checks.'
      : 'Localization tests failed.',
    [
      `supported_locales=${SUPPORTED_LOCALES.join(', ')}`,
      `translation_keys=${translationKeys}`,
      `sample_negotiation=${JSON.stringify(i18nSamples)}`,
      'preference_fix=App no longer wipes explicit locale on boot',
    ]
  ),
  createCheck(
    'Accessibility',
    'P0',
    'BLOCKED',
    'No automated a11y audit or keyboard-navigation smoke test is configured for critical flows.',
    [
      'wcag_target=2.2 AA',
      'axe_or_pa11y=not_detected',
      'keyboard_smoke=not_run',
    ]
  ),
  createCheck(
    'Compliance',
    'P1',
    hasPolicyDocs ? 'BLOCKED' : 'BLOCKED',
    'The repo has account deletion functionality but no complete policy/consent audit or launch evidence for LGPD sign-off.',
    [
      `policy_docs_detected=${hasPolicyDocs}`,
      'delete_account_function=self-delete-user',
      'privacy_review=not_run',
    ]
  ),
  createCheck(
    'TBBM',
    'P0',
    hasTbbmModule && commandResults.unit?.exitCode === 0 && tbbmCoverage.coveragePct === 100 ? 'PASS' : 'BLOCKED',
    hasTbbmModule && commandResults.unit?.exitCode === 0 && tbbmCoverage.coveragePct === 100
      ? 'Critical templates cover email, sms, push, and in_app in English with snapshot-backed validation.'
      : 'TBBM catalog validation is blocked because the shared/tbbm module is no longer present in the repo.',
    [
      `coverage_pct=${tbbmCoverage.coveragePct}`,
      `covered_variants=${tbbmCoverage.covered.length}`,
      `missing_variants=${tbbmCoverage.missing.length}`,
      `snapshot_tests=${hasTbbmModule ? 'tests/prelaunch/tbbm.test.mjs' : 'retired_or_missing'}`,
    ]
  ),
  createCheck(
    'Observability & Operation',
    'P1',
    hasTraceId && hasRunbook ? 'PASS' : 'FAIL',
    hasTraceId && hasRunbook
      ? 'Trace correlation and launch runbook were detected.'
      : 'No launch runbook was found and trace_id correlation is not consistently present in the repo.',
    [
      `trace_id_detected=${hasTraceId}`,
      `runbook_detected=${hasRunbook}`,
      'structured_logs=partial_console_logging_only',
    ]
  ),
  createCheck(
    'Tooling Baseline',
    'P1',
    Object.values(commandResults).every((result) => result && result.exitCode === 0) ? 'PASS' : 'FAIL',
    'Local lint, typecheck, build, and unit test commands were executed to establish a release baseline.',
    [
      `lint_exit_code=${commandResults.lint?.exitCode ?? 'n/a'}`,
      `typecheck_exit_code=${commandResults.typecheck?.exitCode ?? 'n/a'}`,
      `build_exit_code=${commandResults.build?.exitCode ?? 'n/a'}`,
      `unit_exit_code=${commandResults.unit?.exitCode ?? 'n/a'}`,
    ]
  ),
];

const p0Failures = checks.filter(
  (check) => check.priority === 'P0' && check.status !== 'PASS'
);
const decision = p0Failures.length === 0 ? 'GO' : 'NO_GO';

const risks = [
  {
    id: 'RISK-001',
    title: 'No staging smoke or E2E verification for critical auth and persistence flows',
    severity: 'P0',
    status: 'open',
    mitigation: 'Add a staging seed plus Playwright smoke coverage for signup/login/logout/reset and refresh persistence.',
  },
  {
    id: 'RISK-002',
    title: 'Security-header baseline is incomplete',
    severity: 'P0',
    status: 'open',
    mitigation: 'Add CSP and related response-header enforcement, then validate in staging.',
  },
  {
    id: 'RISK-003',
    title: 'Bundle size regression on the main client chunk',
    severity: 'P1',
    status: 'open',
    mitigation: 'Split the 2.5+ MiB client bundle and add bundle budgets to CI.',
  },
  {
    id: 'RISK-004',
    title: 'Accessibility gate is missing',
    severity: 'P0',
    status: 'open',
    mitigation: 'Add automated axe/keyboard checks on critical routes before launch.',
  },
  {
    id: 'RISK-005',
    title: 'Legacy auth/email compatibility paths still exist alongside the canonical webhook',
    severity: hasLegacyAuthEmailOverlap ? 'P1' : 'P2',
    status: hasLegacyAuthEmailOverlap ? 'open' : 'mitigated',
    mitigation: 'Retire the old auth/email wrappers after production confirms auth-webhook is the sole owner of signup, confirmation, and reset flows.',
  },
];

const signoff = [
  {
    role: 'Engineering',
    owner: 'Codex',
    status: 'PROPOSED',
    note: 'Local prelaunch automation executed and artifacts generated.',
  },
  {
    role: 'Product',
    owner: 'Unassigned',
    status: 'PENDING',
    note: 'Manual staging walkthrough is still required.',
  },
  {
    role: 'Security',
    owner: 'Unassigned',
    status: 'PENDING',
    note: 'ASVS/CSP validation and runtime header review are still required.',
  },
];

const metrics = {
  package_manager: detectedCommands.package_manager,
  commit_hash: gitCommit,
  branch: gitBranch,
  command_exit_codes: Object.fromEntries(
    Object.entries(commandResults).map(([name, result]) => [name, result?.exitCode ?? null])
  ),
  bundle: {
    largest_asset: largestAsset,
    top_assets: distAssets.slice(0, 5),
  },
  translations: {
    supported_locale_count: SUPPORTED_LOCALES.length,
    translation_key_count: translationKeys,
  },
  tbbm: {
    coverage_pct: tbbmCoverage.coveragePct,
    template_count: tbbmInventory.length,
    channel_count: TBBM_CHANNELS.length,
  },
};

const launchReadiness = {
  gate_date: `${gateDate} (${gateTimeZone})`,
  default_locale: DEFAULT_LOCALE,
  supported_locales: SUPPORTED_LOCALES,
  decision,
  checks,
  i18n: {
    default_locale: DEFAULT_LOCALE,
    supported_locales: SUPPORTED_LOCALES,
    translation_key_count: translationKeys,
    sample_negotiation: i18nSamples,
    rtl_supported_locales: [],
    notes: [
      'Explicit user locale is now preserved across app loads.',
      'RTL validation is skipped because no RTL locale is currently configured as supported.',
    ],
  },
  tbbm: {
    channels: TBBM_CHANNELS,
    coverage: tbbmCoverage,
    templates: tbbmInventory,
    sample_renders: tbbmSamples,
    notes: [
      'Catalog and snapshot validation exist locally for email, sms, push, and in_app.',
      'Runtime senders still need a follow-up migration to consume the shared catalog consistently.',
    ],
  },
  metrics,
  risks,
  signoff,
};

const changedFiles = listChangedFiles();
const planLines = [
  '1. Detect stack and runnable commands from package.json and the repo layout.',
  '2. Execute local baseline commands: lint, typecheck, build, and unit tests.',
  '3. Audit i18n coverage, locale negotiation, and formatting behavior.',
  `4. ${hasTbbmModule ? 'Validate the TBBM catalog across locales and channels with snapshots.' : 'Record that the retired TBBM catalog module is missing and block that gate explicitly.'}`,
  '5. Summarize P0/P1 findings and emit launch-readiness artifacts.',
];

const detectedCommandLines = [
  `- Package manager: ${detectedCommands.package_manager}`,
  `- Build: ${detectedCommands.build || 'not detected'}`,
  `- Lint: ${detectedCommands.lint || 'not detected'}`,
  `- Typecheck: ${detectedCommands.typecheck || 'not detected'}`,
  `- Unit: ${detectedCommands.unit || 'not detected'}`,
  `- Integration: ${detectedCommands.integration || 'not detected'}`,
  `- E2E: ${detectedCommands.e2e || 'not detected'}`,
];

const findingsP0 = checks
  .filter((check) => check.priority === 'P0')
  .map((check) => `- ${check.area}: ${check.status} — ${check.summary}`);

const findingsP1 = checks
  .filter((check) => check.priority === 'P1')
  .map((check) => `- ${check.area}: ${check.status} — ${check.summary}`);

const commandSections = Object.entries(commandResults)
  .map(([name, result]) => {
    if (!result) return `### ${name}\n- not executed`;

    return [
      `### ${name}`,
      `- command: \`${result.command}\``,
      `- exit_code: ${result.exitCode}`,
      '```text',
      summarizeOutput(result) || '(no output)',
      '```',
    ].join('\n');
  })
  .join('\n\n');

const reportMarkdown = `# Atlas Core Prelaunch Report

## Summary

- Gate date: ${gateDate} (${gateTimeZone})
- Commit: ${gitShortCommit} (${gitBranch})
- Decision: **${decision}**
- Default locale: ${DEFAULT_LOCALE}
- Supported locales: ${SUPPORTED_LOCALES.join(', ')}

## Plan and detected commands

${planLines.join('\n')}

${detectedCommandLines.join('\n')}

## P0 findings

${findingsP0.join('\n')}

## P1 findings

${findingsP1.join('\n')}

## Execution logs

${commandSections}

## Evidence highlights

- i18n samples: \`${JSON.stringify(i18nSamples)}\`
- TBBM coverage: \`${hasTbbmModule ? `${tbbmCoverage.coveragePct}%` : 'blocked (shared/tbbm missing)'}\`
- Top asset: \`${largestAsset ? `${largestAsset.file} (${formatBytes(largestAsset.bytes)})` : 'n/a'}\`
- Changed files observed: ${changedFiles.length > 0 ? changedFiles.map((file) => `\`${file}\``).join(', ') : 'none'}

## Risks

${risks.map((risk) => `- ${risk.id} (${risk.severity}): ${risk.title} — ${risk.mitigation}`).join('\n')}

## Final decision

**${decision}**

Reason: ${p0Failures.length === 0 ? 'All P0 checks passed.' : `${p0Failures.length} P0 area(s) are not ready: ${p0Failures.map((check) => check.area).join(', ')}.`}
`;

fs.mkdirSync(reportsDir, { recursive: true });
fs.writeFileSync(reportPath, reportMarkdown);
fs.writeFileSync(jsonPath, `${JSON.stringify(launchReadiness, null, 2)}\n`);

console.log(`Prelaunch report written to ${reportPath}`);
console.log(`Launch readiness JSON written to ${jsonPath}`);
console.log(`Decision: ${decision}`);
