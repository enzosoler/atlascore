import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables based on mode (en, pt, or development)
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  
  // Determine build locale from mode or env
  const isPT = mode === 'pt' || env.VITE_LOCALE === 'pt-BR';
  const buildLocale = isPT ? 'pt-BR' : 'en-US';
  
  // Path strategy: EN = root (/), PT = /br/
  const basePath = isPT ? '/br/' : '/';
  const outDir = isPT ? 'dist/br' : 'dist';
  
  return {
    plugins: [react()],
    base: basePath,
    define: {
      'import.meta.env.VITE_LOCALE': JSON.stringify(buildLocale),
      'import.meta.env.BUILD_LOCALE': JSON.stringify(buildLocale),
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        // Alias i18n to strict version for build separation
        '@/lib/i18n': fileURLToPath(new URL('./src/lib/i18n-strict.js', import.meta.url)),
      },
    },
    optimizeDeps: {
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
        },
      },
    },
    build: {
      outDir: outDir,
      assetsDir: 'assets',
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
    },
  };
});
