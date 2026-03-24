#!/usr/bin/env node
/**
 * Dual Locale Build Script - Path Strategy
 * Gera builds separadas em uma estrutura de pastas:
 *   dist/     → 100% Inglês (base: /)
 *   dist/br/  → 100% Português (base: /br/)
 * ZERO mistura de idiomas garantido por build-time locale
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const rootDir = path.join(__dirname, '..');

console.log('🌍 Atlas Core - Dual Locale Build (Path Strategy)');
console.log('=================================================\n');

// Limpa build anterior
console.log('🧹 Limpando build anterior...');
try {
  fs.rmSync(path.join(rootDir, 'dist'), { recursive: true, force: true });
} catch (e) {
  // ignora se não existir
}

// Build EN (raiz)
console.log('\n🇺🇸 Build INGLÊS (en-US)...');
console.log('   └─ Configuração: VITE_LOCALE=en-US, base=/');
try {
  execSync('npx vite build --config vite.config.i18n.js --mode en', {
    stdio: 'inherit',
    cwd: rootDir,
    env: { ...process.env, VITE_LOCALE: 'en-US' }
  });
  console.log('✅ Build EN concluído: dist/\n');
} catch (error) {
  console.error('❌ Build EN falhou:', error.message);
  process.exit(1);
}

// Build PT (subpasta /br/)
console.log('\n🇧🇷 Build PORTUGUÊS (pt-BR)...');
console.log('   └─ Configuração: VITE_LOCALE=pt-BR, base=/br/');
try {
  execSync('npx vite build --config vite.config.i18n.js --mode pt', {
    stdio: 'inherit',
    cwd: rootDir,
    env: { ...process.env, VITE_LOCALE: 'pt-BR' }
  });
  console.log('✅ Build PT concluído: dist/br/\n');
} catch (error) {
  console.error('❌ Build PT falhou:', error.message);
  process.exit(1);
}

// Validação
console.log('\n🔍 Validando builds...');
const enBuild = path.join(rootDir, 'dist');
const ptBuild = path.join(rootDir, 'dist', 'br');

if (!fs.existsSync(enBuild)) {
  console.error('❌ Build EN não encontrado!');
  process.exit(1);
}

if (!fs.existsSync(ptBuild)) {
  console.error('❌ Build PT não encontrado!');
  process.exit(1);
}

// Verifica se tem index.html em ambos
const enIndex = path.join(enBuild, 'index.html');
const ptIndex = path.join(ptBuild, 'index.html');

if (!fs.existsSync(enIndex)) {
  console.error('❌ index.html do EN não encontrado!');
  process.exit(1);
}

if (!fs.existsSync(ptIndex)) {
  console.error('❌ index.html do PT não encontrado!');
  process.exit(1);
}

// Estatísticas
const enSize = getFolderSize(enBuild);
const ptSize = getFolderSize(ptBuild);

console.log('\n📊 Estatísticas:');
console.log(`   EN: ${(enSize / 1024 / 1024).toFixed(2)} MB`);
console.log(`   PT: ${(ptSize / 1024 / 1024).toFixed(2)} MB`);

console.log('\n✨ Builds concluídos com sucesso!');
console.log('\n📁 Estrutura gerada:');
console.log('   dist/         ← Site 100% em Inglês (useatlascore.com)');
console.log('   dist/br/      ← Site 100% em Português (useatlascore.com/br/)');
console.log('\n🚀 Para deploy:');
console.log('   Upload de dist/ inteiro para useatlascore.com');
console.log('   Rotas:');
console.log('     /      → Inglês');
console.log('     /br/   → Português');
console.log('\n⚠️  IMPORTANTE: O build PT usa base=/br/, então DEVE ser servido em /br/');
console.log('    Não funciona em subdomínio (br.useatlascore.com) com essa configuração.');

function getFolderSize(dir) {
  let size = 0;
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const filePath = path.join(dir, file.name);
    if (file.isDirectory()) {
      size += getFolderSize(filePath);
    } else {
      size += fs.statSync(filePath).size;
    }
  }
  return size;
}
