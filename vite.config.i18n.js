import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  const isPT = mode === 'pt' || env.VITE_LOCALE === 'pt-BR';
  const buildLocale = isPT ? 'pt-BR' : 'en-US';

  // PT build uses /br/ base path
  const basePath = isPT ? '/br/' : '/';
  const outDir = isPT ? 'dist/br' : 'dist';

  console.log(`[vite.config] Building for ${buildLocale} with base: ${basePath}`);

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: false,
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          navigateFallback: `${basePath}index.html`,
          navigateFallbackDenylist: [/^\/api/],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/.*supabase.*\/rest\/v1\//,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                networkTimeoutSeconds: 10,
                expiration: { maxEntries: 100, maxAgeSeconds: 300 },
              },
            },
            {
              urlPattern: /^https:\/\/.*supabase.*\/storage\/v1\//,
              handler: 'CacheFirst',
              options: {
                cacheName: 'storage-cache',
                expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 },
              },
            },
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'image-cache',
                expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\//,
              handler: 'StaleWhileRevalidate',
              options: { cacheName: 'google-fonts-stylesheets' },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\//,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-webfonts',
                expiration: { maxEntries: 30, maxAgeSeconds: 365 * 24 * 60 * 60 },
              },
            },
          ],
        },
      }),
    ],
    base: basePath,
    define: {
      // Inject build locale into the bundle
      'import.meta.env.VITE_LOCALE': JSON.stringify(buildLocale),
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
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
      emptyOutDir: !isPT,  // false for PT build to preserve EN build in dist/
      rollupOptions: {
        external: [
          '@capacitor-community/firebase-analytics',
          '@capacitor/haptics',
          '@capacitor/keyboard',
          '@capacitor/status-bar',
        ],
        output: {
          manualChunks: undefined,
        },
      },
    },
  };
});
