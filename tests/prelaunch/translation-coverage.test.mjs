import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');

function readJson(relativePath) {
  const absolutePath = path.join(rootDir, relativePath);
  return JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
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

test('core translation catalogs stay in sync between en-US and pt-BR', () => {
  const englishKeys = flattenKeys(readJson('src/lib/translations/en-US.json'));
  const portugueseKeys = flattenKeys(readJson('src/lib/translations/pt-BR.json'));

  assert.deepEqual(portugueseKeys, englishKeys);
});

test('onboarding translation catalogs stay in sync between en-US and pt-BR', () => {
  const englishKeys = flattenKeys(readJson('src/lib/translations/en-US-onboarding.json'));
  const portugueseKeys = flattenKeys(readJson('src/lib/translations/pt-BR-onboarding.json'));

  assert.deepEqual(portugueseKeys, englishKeys);
});
