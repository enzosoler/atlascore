import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, 'src');
const ALLOWED_PREFIXES = [
  'src/index.css',
  'src/styles/design-system.css',
  'src/lib/ThemeContext.jsx',
  'src/lib/atlas-theme.js',
  'src/lib/theme/',
  'src/redesign/tokens/',
];
const EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx', '.css']);
const RAW_COLOR_PATTERN = /#[0-9a-fA-F]{3,8}\b|rgba?\(\s*\d|hsla?\(\s*\d/g;

function isAllowedFile(relativePath) {
  return ALLOWED_PREFIXES.some((prefix) => relativePath === prefix || relativePath.startsWith(prefix));
}

function walk(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
      continue;
    }
    if (EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

function findViolations(filePath) {
  const relativePath = path.relative(ROOT, filePath);
  if (isAllowedFile(relativePath)) return [];

  const content = readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const violations = [];

  lines.forEach((line, index) => {
    const matches = [...line.matchAll(RAW_COLOR_PATTERN)];
    if (matches.length === 0) return;
    violations.push({
      file: relativePath,
      line: index + 1,
      matches: matches.map((match) => match[0]),
      preview: line.trim(),
    });
  });

  return violations;
}

const files = walk(SRC_DIR).filter((filePath) => statSync(filePath).isFile());
const violations = files.flatMap(findViolations);

if (violations.length === 0) {
  console.log('No raw color violations found outside token/theme files.');
  process.exit(0);
}

console.error(`Found ${violations.length} raw color violation(s) outside token/theme files.\n`);
for (const violation of violations) {
  console.error(`${violation.file}:${violation.line}`);
  console.error(`  matches: ${violation.matches.join(', ')}`);
  console.error(`  ${violation.preview}`);
}
process.exit(1);
