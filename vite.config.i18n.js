import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  
  const isPT = mode === 'pt' || env.VITE_LOCALE === 'pt-BR';
  const buildLocale = isPT ? 'pt-BR' : 'en-US';
  
  // PT build uses /br/ base path
  const basePath = isPT ? '/br/' : '/';
  const outDir = isPT ? 'dist/br' : 'dist';
  
  console.log(`[vite.config] Building for ${buildLocale} with base: ${basePath}`);
  
  return {
    plugins: [react()],
    base: basePath,
    define: {
      // Inject build locale into the bundle
      'import.meta.env.VITE_LOCALE': JSON.stringify(buildLocale),
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        // NO i18n alias - using direct imports
      },
    },
    build: {
      outDir: outDir,
      assetsDir: 'assets',
      emptyOutDir: true,
    },
  };
});
