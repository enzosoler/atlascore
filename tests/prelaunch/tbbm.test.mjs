import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildSampleEnvelope,
  renderMessage,
  validateCatalogCoverage,
  validateEnvelope,
} from '../../shared/tbbm/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const snapshotsPath = path.join(__dirname, '__snapshots__', 'tbbm.snapshots.json');
const snapshots = JSON.parse(fs.readFileSync(snapshotsPath, 'utf8'));

function snapshotContent(rendered) {
  return Object.fromEntries(
    Object.entries(rendered.content).filter(([, value]) => typeof value === 'string')
  );
}

test('TBBM catalog covers all required locales and channels', () => {
  const coverage = validateCatalogCoverage();

  assert.equal(coverage.coveragePct, 100);
  assert.deepEqual(coverage.missing, []);
});

test('TBBM snapshots are stable for representative locale and channel combinations', () => {
  const cases = [
    ['welcome_user', 'en-US', 'email'],
    ['welcome_user', 'pt-BR', 'email'],
    ['trial_ends_soon', 'en-US', 'email'],
    ['trial_ends_soon', 'pt-BR', 'email'],
    ['invite_user', 'en-US', 'push'],
    ['invite_user', 'pt-BR', 'push'],
  ];

  for (const [templateId, locale, channel] of cases) {
    const rendered = renderMessage(buildSampleEnvelope(templateId, locale, channel));
    const snapshotKey = `${templateId}/${channel}/${locale}`;
    assert.deepEqual(snapshotContent(rendered), snapshots[snapshotKey], snapshotKey);
  }
});

test('envelope validation fails when required variables are missing', () => {
  const invalidEnvelope = buildSampleEnvelope('trial_ends_soon', 'pt-BR', 'email', {
    vars: {
      firstName: 'Alex',
      days: 3,
      trialEndDate: '',
      billingUrl: 'https://atlascore.app/pricing',
    },
  });

  assert.deepEqual(validateEnvelope(invalidEnvelope), ['vars.trialEndDate is required']);
});
