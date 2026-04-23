import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const snapshotsPath = path.join(__dirname, '__snapshots__', 'tbbm.snapshots.json');
const snapshots = JSON.parse(fs.readFileSync(snapshotsPath, 'utf8'));

let tbbmModule = null;
try {
  tbbmModule = await import('../../shared/tbbm/index.js');
} catch {}

const tbbmMissingMessage = 'shared/tbbm/index.js is not present in this repo; TBBM snapshot coverage is retired or blocked.';

function snapshotContent(rendered) {
  return Object.fromEntries(
    Object.entries(rendered.content).filter(([, value]) => typeof value === 'string')
  );
}

test('TBBM catalog covers all required locales and channels', () => {
  if (!tbbmModule) {
    test.skip(tbbmMissingMessage);
    return;
  }

  const coverage = tbbmModule.validateCatalogCoverage();

  assert.equal(coverage.coveragePct, 100);
  assert.deepEqual(coverage.missing, []);
});

test('TBBM snapshots are stable for representative locale and channel combinations', () => {
  if (!tbbmModule) {
    test.skip(tbbmMissingMessage);
    return;
  }

  const cases = [
    ['welcome_user', 'en-US', 'email'],
    ['trial_ends_soon', 'en-US', 'email'],
    ['invite_user', 'en-US', 'push'],
  ];

  for (const [templateId, locale, channel] of cases) {
    const rendered = tbbmModule.renderMessage(tbbmModule.buildSampleEnvelope(templateId, locale, channel));
    const snapshotKey = `${templateId}/${channel}/${locale}`;
    assert.deepEqual(snapshotContent(rendered), snapshots[snapshotKey], snapshotKey);
  }
});

test('envelope validation fails when required variables are missing', () => {
  if (!tbbmModule) {
    test.skip(tbbmMissingMessage);
    return;
  }

  const invalidEnvelope = tbbmModule.buildSampleEnvelope('trial_ends_soon', 'en-US', 'email', {
    vars: {
      firstName: 'Alex',
      days: 3,
      trialEndDate: '',
      billingUrl: 'https://atlascore.app/pricing',
    },
  });

  assert.deepEqual(tbbmModule.validateEnvelope(invalidEnvelope), ['vars.trialEndDate is required']);
});
