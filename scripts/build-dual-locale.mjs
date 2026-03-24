#!/usr/bin/env node
/**
 * Dual Locale Build Script
 * Gera builds completamente separadas: uma em EN, outra em PT
 * ZERO mistura de idiomas garantido por build-time locale
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

console.log('🌍 Atlas Core - Dual Locale Build');
console.log('=====================================\n');

// Limpa builds anteriores
console.log('🧹 Limpando builds anteriores...');
try {
  fs.rmSync(path.join(__dirname, 'dist-en'), { recursive: true, force: true });
  fs.rmSync(path.join(__dirname, 'dist-pt'), { recursive: true, force: true });
} catch (e) {
  // ignora se não existir
}

// Build EN
console.log('\n🇺🇸 Build INGLÊS (en-US)...');
console.log('   └─ Configuração: VITE_LOCALE=en-US');
try {
  execSync('npx vite build --config vite.config.i18n.js --mode en', {
    stdio: 'inherit',
    cwd: __dirname,
    env: { ...process.env, VITE_LOCALE: 'en-US' }
  });
  console.log('✅ Build EN concluído: dist-en/\n');
} catch (error) {
  console.error('❌ Build EN falhou:', error.message);
  process.exit(1);
}

// Build PT
console.log('\n🇧🇷 Build PORTUGUÊS (pt-BR)...');
console.log('   └─ Configuração: VITE_LOCALE=pt-BR');
try {
  execSync('npx vite build --config vite.config.i18n.js --mode pt', {
    stdio: 'inherit',
    cwd: __dirname,
    env: { ...process.env, VITE_LOCALE: 'pt-BR' }
  });
  console.log('✅ Build PT concluído: dist-pt/\n');
} catch (error) {
  console.error('❌ Build PT falhou:', error.message);
  process.exit(1);
}

// Validação
console.log('\n🔍 Validando builds...');
const enBuild = path.join(__dirname, 'dist-en');
const ptBuild = path.join(__dirname, 'dist-pt');

if (!fs.existsSync(enBuild)) {
  console.error('❌ Build EN não encontrado!');
  process.exit(1);
}

if (!fs.existsSync(ptBuild)) {
  console.error('❌ Build PT não encontrado!');
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
console.log('   dist-en/    ← Site 100% em Inglês');
console.log('   dist-pt/    ← Site 100% em Português');
console.log('\n🚀 Para deploy:');
console.log('   - dist-en/ → atlascore.io');
console.log('   - dist-pt/ → br.atlascore.io (ou subpasta /br)');

function getFolderSize(dir) {
  let size = 0;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      size += getFolderSize(filePath);
    } else {
      size += stats.size;
    }
  }
  return size;
}
