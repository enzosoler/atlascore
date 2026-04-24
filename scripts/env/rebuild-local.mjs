import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');
const localPath = path.join(root, '.env.local');
const manualPath = path.join(root, '.env.local.manual');

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return {};
  return dotenv.parse(readFileSync(filePath, 'utf8'));
}

function formatEnvValue(value) {
  return JSON.stringify(String(value ?? ''));
}

function section(title, entries) {
  const lines = [`# ${title}`];
  for (const [key, value] of entries) {
    lines.push(`${key}=${formatEnvValue(value)}`);
  }
  return lines.join('\n');
}

const localEnv = loadEnvFile(localPath);
const manualEnv = loadEnvFile(manualPath);
const mergedEnv = { ...localEnv, ...manualEnv };

const orderedEntries = [
  ...Object.entries(mergedEnv).filter(([key]) => key === 'VERCEL_OIDC_TOKEN'),
  ...Object.entries(mergedEnv).filter(([key]) => key.startsWith('VITE_') && key !== 'VERCEL_OIDC_TOKEN'),
  ...Object.entries(mergedEnv).filter(([key]) => key !== 'VERCEL_OIDC_TOKEN' && !key.startsWith('VITE_')),
];

const dedupedEntries = [];
const seen = new Set();
for (const [key, value] of orderedEntries) {
  if (seen.has(key)) continue;
  seen.add(key);
  dedupedEntries.push([key, value]);
}

const vercelEntries = dedupedEntries.filter(([key]) => key === 'VERCEL_OIDC_TOKEN' || key.startsWith('VITE_'));
const manualEntries = dedupedEntries.filter(([key]) => !vercelEntries.some(([vercelKey]) => vercelKey === key));

const output = [
  '# Rebuilt from .env.local + .env.local.manual',
  section('Vercel-managed or public values', vercelEntries),
  '',
  section('Manual local secrets', manualEntries),
  '',
].join('\n');

writeFileSync(localPath, output);
console.log(`Rebuilt ${path.basename(localPath)} from ${path.basename(manualPath)}.`);
