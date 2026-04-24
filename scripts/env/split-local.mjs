import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');
const localPath = path.join(root, '.env.local');
const backupPath = path.join(root, '.env.local.backup');
const manualPath = path.join(root, '.env.local.manual');

const MANUAL_KEYS = new Set([
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'OPENAI_API_KEY',
  'GOOGLE_GEMINI_API_KEY',
  'VITE_POSTHOG_KEY',
  'VITE_POSTHOG_HOST',
  'VITE_SENTRY_DSN',
]);

if (!existsSync(localPath)) {
  throw new Error('.env.local not found');
}

copyFileSync(localPath, backupPath);

const source = readFileSync(localPath, 'utf8');
const lines = source.split(/\r?\n/);
const manualLines = [
  '# Manual local env values that should survive `vercel env pull`.',
  '# After a pull, run `npm run env:rebuild-local` to merge these back into .env.local.',
  '',
];

for (const line of lines) {
  const match = line.match(/^\s*([A-Z0-9_]+)\s*=/);
  if (!match) continue;
  if (MANUAL_KEYS.has(match[1])) {
    manualLines.push(line);
  }
}

manualLines.push('');
writeFileSync(manualPath, manualLines.join('\n'));

console.log(`Backed up ${path.basename(localPath)} to ${path.basename(backupPath)}.`);
console.log(`Wrote ${path.basename(manualPath)} with ${manualLines.length - 4} env entries.`);
